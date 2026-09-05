# 06 — BACKEND ARCHITECTURE

> **Owner: Akash.** `core/`, `models/`, `alembic/`, routers `auth lots demands offers tx disputes pools`, domain `escrow matching grading split`.
> Kartik owns routers `ref prices meta`. Nilesh owns `routers/ai.py`. Do not edit those files.
> Read `00_CANON.md` §6 (schema), §7 (endpoints), §9 (grading), §10 (split) first.

**Your two sentences:**
1. **If a judge fetches another farmer's lot and gets data, nothing else the team built matters.** Actor-scoped reads (I4) are your single highest-value contribution.
2. **You own the two hours at H0–H2 that unblock five people.** Migrations and the error envelope. Everyone waits on you.

---

## 1. Layout

```
api/
├─ app/
│  ├─ main.py               # FastAPI app, routers, exception handlers, startup hooks
│  ├─ core/
│  │  ├─ config.py          # pydantic-settings, reads .env
│  │  ├─ db.py              # engine, SessionLocal, get_db dependency
│  │  ├─ security.py        # bcrypt PIN, JWT encode/decode, OTP hash+verify
│  │  ├─ deps.py            # current_user, require_role, guard()   <- THE important file
│  │  ├─ errors.py          # AppError + the handler + the 8 codes
│  │  └─ ids.py             # prefixed id generator (lot_…, off_…)
│  ├─ models/               # SQLAlchemy 2.0 declarative, one file per group
│  │  ├─ base.py  reference.py  users.py  prices.py
│  │  └─ lots.py  trade.py  escrow.py  audit.py
│  ├─ schemas/              # Pydantic v2 request/response. snake_case. (I5)
│  ├─ routers/
│  │  ├─ auth.py  lots.py  demands.py  offers.py  tx.py  disputes.py  pools.py   # you
│  │  ├─ ref.py  prices.py  meta.py                                              # Kartik
│  │  └─ ai.py                                                                   # Nilesh
│  └─ domain/
│     ├─ escrow.py    # the FSM. the ONLY place a tx status changes. (I11)
│     ├─ matching.py  # scoring + greedy combination
│     ├─ grading.py   # the 6-question deterministic score
│     ├─ split.py     # FPO grade-weighted split, sums to exactly 10000 bps
│     └─ audit.py     # append-only writer
├─ alembic/
└─ scripts/smoke.sh
```

**Rule: business logic lives in `domain/`, never in a route handler.** A route is: `guard()` → validate → call domain → return. If a route body is longer than 15 lines, the logic belongs in `domain/`.

---

## 2. H0–H2 — what five people are waiting on

Do these two things before anything else. Both block everybody.

### 2.1 The migration — all 24 tables in one shot

`alembic init alembic`, then transcribe **all of CANON §6** into `alembic/versions/0001_initial.py`. One migration. Not six.

Verify:
```bash
docker compose exec api alembic upgrade head
docker compose exec db psql -U mandi -d mandi -c "\dt"     # expect 24 tables
docker compose exec api alembic downgrade base && alembic upgrade head   # round-trips clean
```

**Enums are `text` + `CHECK`, not native Postgres enums.** (CANON §4) An `ALTER TYPE ... ADD VALUE` cannot run inside a transaction in Postgres, which means adding one enum value at H20 blocks everyone's migration. A `CHECK` constraint is a one-line `ALTER TABLE`.

### 2.2 The error envelope — `core/errors.py`

```python
class AppError(Exception):
    def __init__(self, code: str, message: str, status: int = 400, details: dict | None = None):
        self.code, self.message, self.status, self.details = code, message, status, details

@app.exception_handler(AppError)
async def app_error_handler(_, exc: AppError):
    return JSONResponse(status_code=exc.status,
        content={"error": {"code": exc.code, "message": exc.message, "details": exc.details}})

@app.exception_handler(RequestValidationError)
async def validation_handler(_, exc):
    return JSONResponse(status_code=400,
        content={"error": {"code": "VALIDATION_FAILED", "message": "Invalid input",
                           "details": {"errors": exc.errors()}}})

@app.exception_handler(Exception)
async def unhandled(_, exc):
    log.exception("unhandled")                       # full trace to the log
    return JSONResponse(status_code=500,             # never to the client
        content={"error": {"code": "INTERNAL", "message": "Something went wrong"}})
```

The catch-all matters: **a raw Prisma/SQLAlchemy error or a stack trace reaching the client is an information leak** and it looks terrible on a projector. The trace goes to the log; the client gets a code.

The 8 codes (CANON §7): `VALIDATION_FAILED` · `UNAUTHENTICATED` · `FORBIDDEN` · `NOT_FOUND` · `CONFLICT` · `ILLEGAL_TRANSITION` · `MAX_ROUNDS` · `RATE_LIMITED` · `INTERNAL`.

---

## 3. ★ Auth and authorization

### 3.1 The flow

```
POST /auth/otp/request  {phone}                  -> {request_id, expires_in_sec}
POST /auth/otp/verify   {phone, code}            -> {token, is_new_user, user}
POST /auth/register     {phone, name, role, ...} -> {token, user}
GET  /auth/me                                    -> {user, farmer?|buyer?}
```

### 3.2 OTP rules — every line here is a security requirement

```python
def create_otp(phone: str) -> str:
    recent = count_requests(phone, within_minutes=10)
    if recent >= 3:
        raise AppError("RATE_LIMITED", "Too many requests. Try again later.", 429)
    code = f"{secrets.randbelow(1_000_000):06d}"        # secrets, NOT random
    db.add(OtpCode(phone=phone, code_hash=bcrypt_hash(code),
                   expires_at=now() + timedelta(minutes=5), attempts=0))
    if settings.DEV_OTP_ECHO and settings.ENV != "production":
        return code                                     # BOTH conditions
    send_sms(phone, code)                               # stub in Phase 1
    return ""
```

| Rule | Why |
|---|---|
| `secrets.randbelow`, never `random.random()` | `random` is a Mersenne Twister — observing a few outputs predicts the rest |
| Store `bcrypt(code)`, never the code | A DB dump must not hand over live OTPs |
| 5-minute expiry, **max 5 attempts** | Brute-forcing 10⁶ codes takes minutes without a cap |
| 3 requests/phone/10 min | SMS-bombing prevention |
| **Wrong code and unknown phone return the identical error** | Otherwise the endpoint is a user-enumeration oracle |
| `DEV_OTP_ECHO` gated on the flag **and** `ENV != 'production'` | One flag flipped in prod would echo every OTP |
| **Never log the phone, the OTP, or the request body** (I14) | Logs get shared, screenshotted, and pushed |

### 3.3 The token

```python
{"sub": user_id, "role": "FARMER", "phone_last4": "3210", "exp": ...}
```
HS256, `JWT_SECRET` from env, 7-day expiry. `phone_last4` only — never the full number in a token that lands in client storage.

### 3.4 ★★ `guard()` — the most important function you write

```python
# core/deps.py
def guard(db: Session, model, row_id: str, user: User, owner_field: str = "farmer_id"):
    """The ONLY way to fetch a user-owned row.
    The owner comes from the TOKEN, never from a query param. (I4)"""
    row = db.get(model, row_id)
    if row is None:
        raise AppError("NOT_FOUND", "Not found", 404)
    if getattr(row, owner_field) != resolve_owner(user, owner_field):
        raise AppError("NOT_FOUND", "Not found", 404)      # 404, NOT 403
    return row
```

**Why 404 and not 403:** a 403 confirms the row exists. Enumerate IDs, collect 403s, and you have mapped every lot in the system. A 404 for both cases leaks nothing. (CANON §7)

**Every** handler that touches a user-owned row goes through this:
```python
@router.get("/lots/{lot_id}")
def get_lot(lot_id: str, user=Depends(current_user), db=Depends(get_db)):
    lot = guard(db, Lot, lot_id, user)          # <- not db.get(). ever.
    return LotRes.model_validate(lot)
```

**Test it by hand at H12 and again at H29.** Two farmer tokens, curl A's token against B's lot, expect 404. Not "the guard function exists" — actually run it. This is the thing the technical panel will try.

---

## 4. Lots and grading

### 4.1 Lots
```
POST /lots                    create (farmer only)
GET  /lots                    MY lots — filtered by token, never by a query param
GET  /lots/{id}               through guard()
PATCH /lots/{id}              status only, farmer-owned
POST /lots/{id}/photo         multipart
POST /lots/{id}/assay         -> grade
```

`GET /lots` takes **no `farmer_id` parameter.** The owner is `user.farmer_id`. An endpoint that accepts `?farmer_id=` is the bug we are preventing, even if you remember to check it — because the next person to touch the file won't.

**Photo upload:** validate MIME + size (≤5 MB), **strip EXIF GPS** before writing, store under `MEDIA_ROOT/lots/{lot_id}/`, save only the relative path. EXIF GPS in an uploaded photo is a farmer's exact home location published in a JPEG.

### 4.2 Grading — `domain/grading.py`

Deterministic, from CANON §9. Six self-assessed questions, no ML.

```python
WEIGHTS = dict(size=200, colour=150, sprout=200, damage=250, moisture=100, foreign=100)

def score(a: AssayInput) -> int:
    return ( 200 * (a.size    - 1) // 2
           + 150 * (a.colour  - 1) // 2
           + 200 * (a.sprout  - 1) // 2
           + 250 * (100 - a.damage_pct) // 100
           + 100 * (a.moisture- 1) // 2
           + 100 * (a.foreign - 1) // 2 )        # 0..1000

def grade(s: int) -> str:  return "A" if s >= 750 else "B" if s >= 500 else "C"
MULTIPLIER = {"A": 100, "B": 92, "C": 80}        # percent, integer
```

**The photo is evidence for the buyer, not an input to the score.** Claiming a CV grader that is really a heuristic is the kind of thing that unravels under one follow-up question. Say "farmer self-assessment with photo evidence, deterministic and auditable" — that is both true and defensible.

**`weakest_dimension` + a tip is the value-add:** *"तुमचा माल B दर्जाचा आहे. कोंब आलेल्या कांद्यामुळे दर्जा कमी झाला — ते वेगळे केल्यास A मिळू शकेल."* That turns a grade into an action.

---

## 5. Demands, matching, offers

### 5.1 Matching — `domain/matching.py`

```python
score = 0.40*price_fit + 0.25*grade_fit + 0.20*distance_fit + 0.15*fill_fit
```

| Term | Definition |
|---|---|
| `price_fit` | 1.0 if the lot's ask ≤ the demand's max; else linear decay to 0 at +20% |
| `grade_fit` | 1.0 if lot grade ≥ demand's min grade; 0.5 one notch below; 0 two below |
| `distance_fit` | `max(0, 1 - km/300)` |
| `fill_fit` | `min(1, lot_qty/demand_qty)` — a lot that fills more of the demand ranks higher |

**Two match kinds:**
- `SINGLE` — one lot
- `COMBINATION` — greedy: sort by score desc, accumulate until the demand is filled, **cap at 4 lots**

The cap is deliberate: a buyer will not coordinate pickup from nine farmers, and an uncapped greedy loop produces exactly that.

**Every match carries a reason string:**
```python
why_mr = f"{grade} दर्जा, {km} किमी अंतर, {fill_pct}% मागणी पूर्ण"
why_en = f"Grade {grade}, {km} km away, fills {fill_pct}% of demand"
```
A ranked list with no explanation is a black box. One sentence per row makes it a recommendation. This is cheap and it is what a judge notices.

### 5.2 ★★ Offers and the counter-offer — the middleman-removal feature

```
POST /demands/{id}/offers        buyer offers on a lot/pool
POST /offers/{id}/counter        EITHER side counters      <- the feature
POST /offers/{id}/accept         -> creates a transaction
POST /offers/{id}/reject
GET  /offers/{id}/thread         the full round history
```

```python
MAX_ROUNDS = 3

def counter(offer_id: str, price_paise_per_qtl: int, actor: User, db) -> Offer:
    parent = load_offer(offer_id, actor, db)               # actor must be a party
    if parent.status not in ("OPEN", "COUNTERED"):
        raise AppError("CONFLICT", "This offer is closed", 409)
    if parent.round >= MAX_ROUNDS:
        raise AppError("MAX_ROUNDS", "Negotiation limit reached", 409)
    if parent.initiator == actor_side(actor) and parent.round > 0:
        raise AppError("CONFLICT", "Waiting for the other side", 409)   # no self-countering

    parent.status = "COUNTERED"
    child = Offer(parent_offer_id=parent.id, round=parent.round + 1,
                  initiator=actor_side(actor), price_paise_per_qtl=price_paise_per_qtl,
                  status="OPEN", expires_at=now() + timedelta(hours=24), ...)
    audit.write(actor, "OFFER_COUNTERED", child.id, {"from": parent.price_paise_per_qtl,
                                                     "to": price_paise_per_qtl})
    return child
```

**Three rules:**
1. **3-round cap** → `409 MAX_ROUNDS`. Unbounded haggling is a UX and a data problem.
2. **No self-countering.** Check `initiator`, or one side can drive the price alone.
3. **Both sides can initiate.** A farmer countering a trader's offer is the entire point of the product — a system where only the buyer can move the price has rebuilt the middleman in software.

**Pranay renders the farmer's own forecast beside the counter input.** That is the beat: the farmer is not guessing, he is negotiating with a number. Your job is only to make the endpoint symmetric.

---

## 6. ★ Escrow — `domain/escrow.py` (I11)

**The only place in the codebase where a transaction status changes.** Grep for `status =` when you are done; every hit must be inside this file.

```python
LEGAL: dict[str, set[str]] = {
    "CREATED":    {"FUNDS_HELD", "CANCELLED"},
    "FUNDS_HELD": {"DISPATCHED", "REFUNDED", "DISPUTED"},
    "DISPATCHED": {"RECEIVED", "DISPUTED"},
    "RECEIVED":   {"RELEASED", "DISPUTED"},
    "RELEASED":   set(),          # terminal
    "REFUNDED":   set(),          # terminal
    "CANCELLED":  set(),          # terminal
    "DISPUTED":   {"RELEASED", "REFUNDED", "SPLIT_SETTLED"},
    "SPLIT_SETTLED": set(),
}

ACTOR: dict[tuple[str, str], set[str]] = {
    ("CREATED",    "FUNDS_HELD"):    {"BUYER"},
    ("FUNDS_HELD", "DISPATCHED"):    {"FARMER", "FPO"},      # not the buyer
    ("DISPATCHED", "RECEIVED"):      {"BUYER"},              # not the farmer
    ("RECEIVED",   "RELEASED"):      {"BUYER", "ADMIN"},
    ("FUNDS_HELD", "REFUNDED"):      {"ADMIN"},
    ("DISPUTED",   "RELEASED"):      {"ADMIN"},
    ("DISPUTED",   "REFUNDED"):      {"ADMIN"},
    ("DISPUTED",   "SPLIT_SETTLED"): {"ADMIN"},
    ...
}

def transition(tx_id: str, to: str, actor: User, idem_key: str, db) -> Transaction:
    tx = load_tx_for_actor(tx_id, actor, db)                 # party-scoped (I4)

    if prior := db.query(EscrowEvent).filter_by(tx_id=tx_id, idem_key=idem_key).first():
        return tx                                            # idempotent replay

    if to not in LEGAL[tx.status]:
        raise AppError("ILLEGAL_TRANSITION",
                       f"Cannot go {tx.status} -> {to}", 409)
    if role_of(actor) not in ACTOR[(tx.status, to)]:
        raise AppError("FORBIDDEN", "You cannot perform this step", 403)

    frm, tx.status = tx.status, to
    db.add(EscrowEvent(tx_id=tx_id, from_status=frm, to_status=to,
                       actor_user_id=actor.id, actor_role=role_of(actor),
                       idem_key=idem_key, note=...))         # APPEND-ONLY (I3)
    audit.write(actor, "TX_TRANSITION", tx_id, {"from": frm, "to": to})
    return tx
```

**Why the `ACTOR` matrix matters as much as `LEGAL`:** without it, a buyer could mark a lot dispatched *and* received and release his own funds. A transition table alone gives you a valid-looking sequence performed entirely by the wrong party. Both dicts, always.

**Why idempotency keys:** a farmer on 2G taps "dispatched" three times. Without a key you get three events and a corrupt timeline. With one, you get one event and two no-ops.

**`escrow_events` is append-only.** No `UPDATE`, no `DELETE`, ever. (I3) The timeline screen reads this table, and *"here is every state change, who made it, and when"* is a verifiable trust claim — which is precisely why we do not need a blockchain.

### The blockchain answer — memorise this
> *"Append-only Postgres table with foreign-key integrity and an actor-stamped event log. The trust problem here is 'who did what, when' — and that's what this gives us, auditable and queryable. A chain would add cost, latency, and a key-management problem, and it wouldn't make the log any more true. The dispute path needs a human arbiter anyway, so consensus buys us nothing."*

---

## 7. FPO pools — `domain/split.py`

Grade-weighted, and the arithmetic must be exact.

```python
def compute_split(members: list[Member]) -> list[Share]:
    weights = [m.qty_kg * MULTIPLIER[m.grade] for m in members]     # integer
    total_w = sum(weights)
    shares  = [10000 * w // total_w for w in weights]               # floor
    shares[weights.index(max(weights))] += 10000 - sum(shares)      # remainder -> largest
    return [Share(member_id=m.id, share_bps=s, score_at_pool=m.score, ...)
            for m, s in zip(members, shares)]
```

Three requirements:
1. **`sum(share_bps) == 10000` exactly.** Floors leave a remainder; give it to the largest weight. Three shares that add to 9,998 will be spotted by someone with a calculator.
2. **Snapshot `score_at_pool`.** The grade at pool-formation time, not the current grade. Otherwise re-grading a lot retroactively changes a settled payout.
3. **Pareto guard:** if any member's `vs_solo_paise < 0`, the pool must not form. `409 CONFLICT`. A pool that makes one member worse off is not aggregation, it is redistribution — and the farmer who lost will never use the app again.

---

## 8. Disputes

```
POST /tx/{id}/dispute              raise -> tx goes DISPUTED
POST /disputes/{id}/evidence       photo/note, append-only
POST /disputes/{id}/advance        stage: RAISED -> UNDER_REVIEW -> RESOLVED
GET  /disputes/{id}                with the full event history
```
`dispute_events` is append-only (I3). Resolution routes back through `escrow.transition` — `RELEASED`, `REFUNDED`, or `SPLIT_SETTLED`. **No status assignment outside the FSM**, including here.

Phase 1 arbiter is an admin role. That is the honest answer: *"a human arbiter with a complete evidence trail"* — not an algorithm pretending to adjudicate quality disputes.

---

## 9. Audit — `domain/audit.py`

```python
def write(actor: User | None, action: str, entity_id: str, meta: dict) -> None:
    db.add(AuditLog(actor_user_id=actor.id if actor else None,
                    actor_role=role_of(actor) if actor else "SYSTEM",
                    action=action, entity_id=entity_id,
                    meta=redact(meta), created_at=now()))
```

Write one on: register, login, lot create, assay, offer create/counter/accept/reject, every tx transition, dispute raise/resolve, pool form, pledge quote.

**`redact()` strips phone numbers, OTPs, and tokens from `meta` before it is stored.** (I14) An audit log is the most-shared table in an incident, and it is the easiest place to accidentally persist a phone number forever.

**Append-only.** (I3)

---

## 10. Smoke test — `scripts/smoke.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
B=${BASE_URL:-http://localhost:8000/api/v1}

t() { printf '%-42s' "$1"; }
ok(){ echo "  ✓"; }

t "health";        curl -sf $B/meta/health   > /dev/null; ok
t "ref/markets";   curl -sf $B/ref/markets   | grep -q lasalgaon; ok
t "prices/series"; curl -sf "$B/prices/series?market_id=mkt_lasalgaon&commodity_id=cmd_onion" \
                     | grep -q modal_paise_per_qtl; ok
t "prices/nearby"; curl -sf "$B/prices/nearby?..." | grep -q net_paise_per_qtl; ok
t "provenance";    curl -sf $B/meta/data-provenance | grep -q row_count; ok
t "model-card";    curl -sf $B/ai/model-card  | grep -q mase; ok
t "verdict";       curl -sf -X POST $B/ai/window/recommend -H 'Content-Type: application/json' \
                     -d '{"commodity_id":"cmd_onion","market_id":"mkt_lasalgaon","qty_kg":4000}' \
                     | grep -qE '"action":"(HOLD|SELL_NOW|SPLIT|SELL_ELSEWHERE|NO_ADVICE)"'; ok
t "cross-actor 404";
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN_A" $B/lots/$LOT_B)
  [ "$code" = "404" ]; ok
echo "ALL GREEN"
```

**Non-zero exit = nobody merges, nobody deploys.** Run it after every integration stitch and before every push.

The `cross-actor 404` line is the one that matters most. Automate it so it cannot be forgotten at H29.

---

## 11. Your definition of done

1. `alembic upgrade head` on a clean DB → 24 tables. `downgrade base` round-trips.
2. Auth end-to-end: request → verify → JWT → `/auth/me`. Wrong OTP and unknown phone give **identical** errors. 4th request → 429.
3. **Farmer A's token on farmer B's lot → 404. Verified by hand, twice.**
4. Every route: Pydantic-validated, `guard()`-scoped, `AppError`-coded. No route body over 15 lines.
5. Escrow: illegal transition → 409 `ILLEGAL_TRANSITION`; wrong actor → 403; replayed idempotency key → no duplicate event.
6. Counter-offer: 4th round → 409 `MAX_ROUNDS`; both sides can initiate; self-counter → 409.
7. FPO split sums to **exactly 10000** on 20 random member sets. Pareto violation → 409.
8. `grep -rn "status *=" app/ | grep -v domain/escrow.py` → **no hits on transaction status.**
9. `smoke.sh` green, including the cross-actor 404.
10. No phone, OTP, or full payload in any log line.

---

## 12. Phase 2 (not now)

| Item | Why later |
|---|---|
| Razorpay Route real escrow | ~6 hours, needs KYC + a live account. The FSM is the substance; the PG is plumbing. |
| Real SMS gateway | Costs money, needs DLT registration. `DEV_OTP_ECHO` demos identically. |
| Refresh tokens + rotation | 7-day JWT is fine for a demo; rotation is a Phase 2 hardening item. |
| Redis rate limiting | Postgres-counted limits are fine at this scale. |
| Async SQLAlchemy | Sync is simpler and fast enough at ~20 concurrent users. Do not spend hours on this. |
| RBAC beyond 4 roles | Not needed in Phase 1. |
| Webhook delivery to buyers | Real value for integrated traders; nothing for the demo. |
| Hash-chained ledger rows | Deliberately dropped — one hour of work no judge can verify in 7 minutes. Append-only is the substance. |
