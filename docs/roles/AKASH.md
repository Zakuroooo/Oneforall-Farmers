# AKASH — Backend

> **You own the API.** Every screen in this product reads from an endpoint you wrote. Every rupee that moves, moves through your state machine.
> This file is your PRD, your TRD, and your task list. Read it, then `docs/architecture/00_CANON.md` (all of it — you own the schema's consumers), then `06_BACKEND_ARCHITECTURE.md`. Then start on A0.

---

## PART 1 — PRD · What you are building and why

### 1.1 Your mission in one sentence

**Be the layer nobody can break.** Auth that does not leak, reads that cannot cross actors, and a money state machine that cannot skip a state. If a judge tries to break this product, they will try to break your code specifically.

### 1.2 The two things a judge will actually test

Not your endpoint count. These two:

| Test | What they do | What must happen |
|---|---|---|
| **I4 — cross-actor read** | *"Can I see another farmer's data?"* — they take farmer A's token and hit farmer B's lot ID | **404.** Not 403, not 200-with-empty, not 500. |
| **I11 — the FSM** | *"What stops you releasing money before delivery?"* | You show them `LEGAL` — a dict of allowed transitions — and the fact that `status` is assigned in exactly one function in the codebase |

Both are **demo-day answers you give live**, not descriptions. Question 7 in `11_DEMO_AND_PITCH.md` §4 is literally *"Try it."* — you hand the judge the phone. Have the curl ready in `scripts/smoke.sh` so you can run it on stage in four seconds.

**Why 404 and not 403:** a 403 confirms the row exists. That is an existence oracle — a judge can enumerate other farmers' lot IDs by watching which ones 403 and which 404. Return 404 for both "does not exist" and "not yours". They are the same fact from the caller's side.

### 1.3 What you own

| | |
|---|---|
| **Files** | `api/app/main.py`, `deps.py`, `models.py`, `schemas.py`, `api/app/routers/**` (except `window`, `prices`), `api/app/domain/{grading,matching,split,escrow,ledger}.py`, `api/alembic/**`, `api/tests/**` |
| **Shared** | `api/app/domain/decide.py` + `costs.py` + `pledge.py` are **Nilesh's**. `api/app/ml/**` is **Nikhil's**. `api/app/routers/prices.py` is **Kartik's**. |
| **You define, everyone consumes** | `schemas.py` — the Pydantic models are the contract. Additive changes are cheap; renames are expensive. |

### 1.4 Your endpoint inventory

| Group | Endpoints | Priority |
|---|---|---|
| **Auth** | `POST /auth/otp` · `POST /auth/verify` · `POST /auth/register` · `GET /auth/me` | **P0** |
| **Lots** | `POST /lots` · `GET /lots` · `GET /lots/{id}` · `POST /lots/{id}/photo` | **P0** |
| **Grading** | `POST /lots/{id}/assay` → grade + `tip_mr` | **P0** |
| **Demands** | `POST /demands` · `GET /demands` | **P0** |
| **Matching** | `GET /match/{demand_id}` — including **COMBINATION** matches | **P0** |
| **Offers** | `POST /offers` · `GET /offers` · `POST /offers/{id}/counter` · `POST /offers/{id}/accept` | **P0** |
| **Escrow** | `POST /escrow/{txn_id}/transition` · `GET /escrow/{txn_id}` | P1 |
| **Ledger** | `GET /ledger/{txn_id}` — hash-chained, verifiable | P1 |
| **Pools** | `POST /pools` · `GET /pools/{id}` — with the fair split | P1 |
| **Disputes** | `POST /disputes` · `POST /disputes/{id}/resolve` | P2 |
| **Meta** | `GET /meta/health` — `model_loaded`, `price_row_count` | **P0** |

### 1.5 The one feature that is the whole pitch

**The counter-offer** (`POST /offers/{id}/counter`). Demo beat 9. The claim is *"we removed the middleman"*, and the mechanism is that the farmer counter-offers while looking at his own forecast. Your job is that the endpoint accepts a counter from either side, tracks the chain, and never lets a party counter their own last offer.

The **COMBINATION match** is the other half: a buyer wants 100 qtl, no single farmer has it, so `matching.py` returns a bundle of three lots that together satisfy the demand. Without it the aggregation story is a slide instead of a screen.

### 1.6 Out of scope for you

The forecast · the decision engine · costs · the pledge · any UI · data ingestion · deployment. If you find yourself writing a LightGBM call, that is Nikhil's file.

---

## PART 2 — TRD · How you build it

### 2.1 The route pattern — every route, no exceptions

```python
@router.post('/lots', response_model=LotRes)
async def create_lot(
    body: LotCreateReq,                          # 1. Pydantic validates (I12)
    actor: Actor = Depends(guard),               # 2. actor from the JWT (I4)
    db: AsyncSession = Depends(get_db),
) -> LotRes:
    lot = await lots_domain.create(db, actor, body)   # 3. business logic in domain/
    return LotRes.model_validate(lot)                 # 4. typed response
```

**Business logic never lives in a handler.** A handler validates, delegates, and returns. The moment there is an `if` about domain rules inside a route function, that rule is untestable and it will be duplicated in the next route.

### 2.2 `guard()` — the single most important function you write

```python
@dataclass(frozen=True)
class Actor:
    id: str
    role: Literal['FARMER', 'BUYER', 'FPO', 'ADMIN']
    phone: str            # never logged (I14)

async def guard(authorization: str = Header(...)) -> Actor:
    token = authorization.removeprefix('Bearer ').strip()
    try:
        claims = jwt.decode(token, SECRET, algorithms=['HS256'])
    except JWTError:
        raise AppError('UNAUTHENTICATED', 'Invalid or expired token', 401)
    return Actor(id=claims['sub'], role=claims['role'], phone=claims['phone'])
```

And the scoping rule, applied in **every** domain read:

```python
async def get_lot(db, actor: Actor, lot_id: str) -> Lot:
    row = await db.scalar(
        select(Lot).where(Lot.id == lot_id, Lot.farmer_id == actor.id)   # <- the AND is the invariant
    )
    if row is None:
        raise AppError('NOT_FOUND', 'Lot not found', 404)               # 404 for both cases
    return row
```

**Never** `select(Lot).where(Lot.id == lot_id)` followed by an ownership check in Python. Put the actor in the WHERE clause. A check after the fetch is a check someone will forget to write.

### 2.3 Auth — where the leaks are

```python
# I15: OTP from secrets, never random.random()
otp = f'{secrets.randbelow(1_000_000):06d}'
```

Four rules that are not optional:

1. **A wrong OTP and an unknown phone return the identical error.** Same code, same message, same status. Different responses let an attacker enumerate which phone numbers are registered.
2. **Rate limit: 3 OTP requests per phone per 10 minutes, max 5 verify attempts per OTP.** Without this the six-digit space is brute-forceable in minutes.
3. **`DEV_OTP_ECHO` is gated on the env var AND `ENV != 'production'`.** Two conditions, because one of them will eventually be set wrong.
4. **I14: never log a phone number, an OTP, or a full request payload.** Write `redact()` once and use it at the logging boundary.

```python
def redact(d: dict) -> dict:
    return {k: ('***' if k in {'phone', 'otp', 'pin', 'authorization'} else v) for k, v in d.items()}
```

### 2.4 The error envelope

```python
class AppError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        self.code, self.message, self.status = code, message, status

@app.exception_handler(AppError)
async def handle(_: Request, exc: AppError):
    return JSONResponse({'error': {'code': exc.code, 'message': exc.message}}, exc.status)

@app.exception_handler(Exception)
async def handle_unexpected(_: Request, exc: Exception):
    log.exception('unhandled')                                  # full trace to the log
    return JSONResponse({'error': {'code': 'INTERNAL', 'message': 'Something went wrong'}}, 500)
```

**Never leak a stack trace, a SQL string, or a Prisma/SQLAlchemy error to the client.** The catch-all handler is what guarantees that, and it must exist before the first route.

### 2.5 The escrow FSM — I11 lives here

**These eight state names are the ones in the `CHECK` constraint in `00_CANON.md` §6.** Not `FUNDS_HELD`, not `RECEIVED` — Postgres will reject those on the first insert. If you rename a state you must change the constraint, the FSM, Shreya's S22, and the seed in the same commit, so do not.

```python
LEGAL: dict[str, set[str]] = {
    'CREATED':      {'ESCROW_HELD', 'CANCELLED'},
    'ESCROW_HELD':  {'DISPATCHED', 'REFUNDED', 'DISPUTED'},
    'DISPATCHED':   {'DELIVERED', 'DISPUTED'},
    'DELIVERED':    {'RELEASED', 'DISPUTED'},
    'DISPUTED':     {'RELEASED', 'REFUNDED'},
    'RELEASED':     set(),           # terminal
    'REFUNDED':     set(),           # terminal
    'CANCELLED':    set(),           # terminal
}

ACTOR: dict[tuple[str, str], set[str]] = {   # (from, to) -> who may do it
    ('CREATED', 'ESCROW_HELD'):     {'BUYER'},
    ('ESCROW_HELD', 'DISPATCHED'):  {'FARMER'},
    ('DISPATCHED', 'DELIVERED'):    {'BUYER'},
    ('DELIVERED', 'RELEASED'):      {'ADMIN', 'SYSTEM'},
    # ...
}

async def transition(db, actor: Actor, txn_id: str, to: str, idempotency_key: str) -> Txn:
    txn = await _locked(db, actor, txn_id)                  # SELECT ... FOR UPDATE, actor-scoped
    if to not in LEGAL[txn.status]:
        raise AppError('ILLEGAL_TRANSITION', f'{txn.status} -> {to} is not allowed', 409)
    if actor.role not in ACTOR[(txn.status, to)]:
        raise AppError('FORBIDDEN_TRANSITION', 'Not your transition to make', 403)
    # append-only event + ledger rows, then the status write
```

**`transition()` is the only function in the entire codebase that assigns `txn.status`.** The way you prove that on demo day:

```bash
grep -rn "status = " api/app/ | grep -v domain/escrow.py     # must return nothing
```

Run that grep in front of the judge if question 5 comes up. It is a two-second demonstration of a property most teams can only assert.

`idempotency_key` matters now and matters more in Phase 2 — the same key replayed returns the same result instead of double-transitioning.

### 2.6 The hash chain — and why not blockchain

```python
row_hash = sha256(f'{prev_hash}|{txn_id}|{entry_type}|{amount_paise}|{created_at.isoformat()}'.encode()).hexdigest()
```

Append-only. No UPDATE, no DELETE, in application code, ever (I5). `GET /ledger/{txn_id}` returns the chain plus a `chain_valid: bool` computed by recomputing every hash.

**Your answer to "why not blockchain"** (question 5, `11_DEMO_AND_PITCH.md`) — two sentences, then stop:

> *"What we need is tamper-evidence and auditability, and an append-only Postgres table with a hash chain gives us both — every row carries the previous row's hash, so you can't alter history without breaking the chain. A distributed ledger would add consensus overhead to solve a trust problem we don't have: there's one operator and the auditor is the government."*

### 2.7 Grading — deterministic, no model

Six questions, integer score, hard boundaries. `domain/grading.py`:

```python
def score(answers: AssayAnswers) -> int:            # 0..1000
    ...

def grade(s: int) -> Literal['A', 'B', 'C']:
    return 'A' if s >= 750 else 'B' if s >= 500 else 'C'

def tip_mr(answers: AssayAnswers) -> str:
    """Names the single weakest dimension, in Marathi. This is what makes the feature useful
    rather than decorative — a grade with no path to a better grade is just a label."""
```

Deterministic on purpose. A grade a farmer cannot reproduce or contest is a grade he will not trust, and there is no training data for a photo-based grader in the time available. Say that plainly if asked.

### 2.8 Money

Integer paise (I1), integer kg (I2), basis points for rates (I3). **In Python, `//` never `/`.**

```python
commission_paise = gross_paise * commission_bps // 10_000      # correct
commission_paise = int(gross_paise * commission_bps / 10_000)  # WRONG — float in the middle
```

The second line is right most of the time, which is exactly what makes it dangerous.

### 2.9 Your definition of done

1. `scripts/smoke.sh` passes end to end against a freshly seeded DB.
2. **Cross-actor test done by hand:** farmer A's token, farmer B's lot ID, 404. Written as a pytest too.
3. `grep -rn "status = " api/app/ | grep -v escrow.py` → empty.
4. No phone, OTP, or full payload in any log line. Grep your own logs.
5. Every route: Pydantic in, typed out, `guard()` where the data is user-owned.
6. Invalid input → 400 with a code. Never a 500, never a stack trace.
7. `pytest` green.
8. Committed and pushed to `akash`.

---

## PART 3 — Your tasks, in order

| # | Task | Done when | Blocked by |
|---|---|---|---|
| **A0** | **Skeleton** — FastAPI app, `AppError` + both handlers, `guard()`, `get_db`, alembic init, `GET /meta/health` | `curl /meta/health` returns 200 before any feature exists | nothing |
| **A1** | **Auth** — `POST /auth/otp`, `/verify`, `/register`, `GET /auth/me` | Wrong OTP and unknown phone return **identical** errors | A0 |
| **A2** | **Rate limit + redaction** — 3/phone/10min, 5 attempts | No phone or OTP appears in any log line | A1 |
| **A3** | **Lots** — `POST /lots`, `GET /lots`, `GET /lots/{id}` through `guard()` | **Farmer A's token on farmer B's lot → 404, tested by hand** | A1 |
| **A4** | **Photo upload** — `POST /lots/{id}/photo`, multipart | **EXIF GPS stripped** — verified with `exiftool` on the stored file | A3 |
| **A5** | **Grading** — `domain/grading.py`, 6 questions, boundaries 750/500 | Same answers always give the same grade | A0 |
| **A6** | **Assay endpoint** — `POST /lots/{id}/assay` returning `tip_mr` | The tip names the **weakest** dimension, not a generic string | A5 |
| **A7** | **Demands + matching** — `POST /demands`, `GET /match/{id}` incl. **COMBINATION** | A 100 qtl demand returns a 3-lot bundle | A3 |
| **A8** | **★ Offers + counter** — post, counter, accept | A full chain: offer 1900 → counter 2000 → counter 1960 → accept | A7 |
| **A9** | **Escrow FSM** — `domain/escrow.py`, `LEGAL`, `ACTOR`, `transition()` | An illegal transition returns **409**, and the grep is empty | A8 |
| **A10** | **Ledger** — hash chain, `GET /ledger/{txn_id}` with `chain_valid` | Tamper with a row by hand → `chain_valid: false` | A9 |
| **A11** | **Pools** — `POST /pools`, fair split summing to exactly 100% | The member shares sum to 10000 bps exactly, no rounding drift | A9 |
| **A12** | **`scripts/smoke.sh`** — the whole golden path as curl, including the cross-actor 404 | One command, green, from a cold DB | A10 |
| **A13** | **Disputes** — `POST /disputes`, `/resolve` | A dispute moves the FSM to `DISPUTED` and back legally | A9 |

**A0–A3 is the critical path for four other people.** Pranay cannot log in, Kartik cannot test `/prices`, and nobody can hit an authenticated endpoint until `guard()` works. Ship A0–A2 fast and tell the group chat the moment `/auth/verify` returns a token.

### A12 is not a nice-to-have

`smoke.sh` is what you run at H28 on the EC2 box, and it is what you run on stage if a judge asks question 7. A shell script that exercises the golden path is worth more than the last two endpoints on this list.

---

## PART 4 — Blocked?

1. Need a schema field? It is additive — add it to `models.py` + a migration, and post the diff in chat. **Renames need agreement.**
2. Need the forecast to test `/window`? Nilesh's `decide()` is stubbed early — call the stub.
3. Otherwise: `docs/BLOCKERS.md` + group chat, within 30 minutes.

**Do not edit `app/`, `ingest/`, `api/app/ml/`, or `domain/decide.py`.** Not even a one-line fix.

---

## PART 5 — On demo day

You take **questions 5 and 7**: *"why not blockchain"* and *"can I see another farmer's data"*.

Have ready:
- `scripts/smoke.sh` open in a terminal with the cross-actor curl visible
- The `grep -rn "status = "` command in your history
- Two sentences on the hash chain, then stop

Question 7's correct answer starts with **"Try it."** and ends with you handing them the phone. Rehearse that; it is the most confident thing anyone says in the whole pitch.
