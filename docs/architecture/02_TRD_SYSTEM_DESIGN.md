# 02 — TRD & SYSTEM DESIGN

> **Owner:** Akash (with Kartik) · **Read `00_CANON.md` first — it is the contract; this is the machine.**

---

## 1. System context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OFFLINE  (runs before the demo, never during)      │
│                                                                             │
│   Agmarknet / data.gov.in ──┐                                               │
│   MSAMB                     ├──► ingest/ (Python, Kartik) ──► CSV snapshots │
│   Archived CSV mirrors      │         · fetch  · normalise  · label source  │
│   WDRA warehouse list     ──┘         · dedupe · impute     · validate      │
│                                              │                              │
│                                              ▼                              │
│                                    seed/load.py ──► Postgres                │
│                                              │                              │
│   Sarvam TTS API ──► scripts/gen_tts.py ──► app/assets/audio/*.mp3          │
│                                              (committed to git)             │
└─────────────────────────────────────────────────────────────────────────────┘
                                               │
═══════════════════════════════════════════════│══════════════════════════════
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ONLINE  (the demo — zero external calls, I7)            │
│                                                                             │
│    ┌──────────────────────┐          ┌──────────────────────┐               │
│    │  Expo app (native)   │          │  Expo web (buyer)    │               │
│    │  farmer navigator    │          │  buyer navigator     │               │
│    │  Marathi · offline   │          │  browser tab         │               │
│    └──────────┬───────────┘          └──────────┬───────────┘               │
│               │      HTTPS /api/v1 (JWT)        │                           │
│               └────────────────┬────────────────┘                           │
│                                ▼                                            │
│                     ┌─────────────────────┐                                 │
│                     │  nginx  :80/:443    │  /api → :8000  /media → disk    │
│                     └──────────┬──────────┘                                 │
│                                ▼                                            │
│        ┌───────────────────────────────────────────────┐                     │
│        │        FastAPI  :8000   (one process)         │                     │
│        │                                               │                     │
│        │  routers/   auth lots demands offers tx       │  ← Akash            │
│        │             disputes pools                    │                     │
│        │             ref prices meta                   │  ← Kartik           │
│        │             ai                                │  ← Nilesh           │
│        │                                               │                     │
│        │  domain/    escrow  matching  grading  split  │  ← Akash            │
│        │             window   costs     pledge         │  ← Nilesh           │
│        │                                               │                     │
│        │  ml/        features  train  quantile  card   │  ← Nikhil           │
│        │             model.pkl loaded ONCE at startup  │                     │
│        │                                               │                     │
│        │  core/      db  security  deps  errors  units │  ← Akash            │
│        └────────────────────────┬──────────────────────┘                     │
│                                ▼                                            │
│                     ┌─────────────────────┐                                 │
│                     │  PostgreSQL 16      │  docker volume, 24 tables       │
│                     └─────────────────────┘                                 │
│                                                                             │
│                   ALL OF THE ABOVE: one EC2 t3.small, docker-compose         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The single most important line on this diagram is the double line.** Everything above it happens before the demo. Everything below it is self-contained. That is invariant I7 rendered as architecture.

---

## 2. Why these choices

| Decision | Reason | The alternative we rejected |
|---|---|---|
| **One FastAPI process serves both API and ML** | The model is a 2 MB LightGBM pickle loaded once at startup. A separate service means a second container, a second deploy, a network hop, an auth key, and a new failure mode — for nothing. | Separate ML microservice. Correct at scale, wrong at 36 hours. |
| **One Expo codebase, role navigators** | Farmer needs native (camera, offline, audio). Buyer needs a browser. Expo gives both from one tree. Saves ~4 h and removes a whole second build pipeline. | Expo + separate Next.js buyer app. |
| **Postgres in Docker on the same EC2** | One `docker compose up`. No managed-DB latency, no VPC config, no cost. | Neon/RDS. Adds a network dependency to a demo that must survive bad wifi. |
| **`snake_case` on the wire** | Python-native. No serialiser aliasing, no camel/snake drift between five people. | camelCase JSON + Pydantic aliases. One more thing to get wrong at 3am. |
| **Text + CHECK instead of PG enums** | `ALTER TYPE` mid-hackathon is painful and blocks. A CHECK constraint is a one-line migration. | Native PG enums. |
| **No hash chain on the audit log** | Costs an hour, buys nothing verifiable in a 7-minute demo. Append-only is the substance. | `prev_hash`/`hash` columns. Add in Phase 2 if asked. |
| **Alembic from H1, not "later"** | Five people, one schema. Without migrations you get "works on my machine" at H20. | `create_all()`. |
| **Escrow in our own DB** | The FSM *is* the intellectual content. A payment sandbox adds a live network call (violates I7) and a KYC detour. | Razorpay sandbox. |

---

## 3. Repository layout

```
mandi-setu/
├── docker-compose.yml                  # Kartik
├── .env.example                        # Kartik — the ONLY env file in git (I10)
├── nginx/
│   └── default.conf                    # Kartik
│
├── api/                                # ── FastAPI ──
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/versions/               # Akash
│   └── app/
│       ├── main.py                     # Akash — app factory, CORS, error handler, model load
│       ├── core/                       # Akash
│       │   ├── config.py               #   pydantic-settings, reads env
│       │   ├── db.py                   #   engine, SessionLocal, get_db
│       │   ├── security.py             #   JWT sign/verify, bcrypt, OTP hash
│       │   ├── deps.py                 #   current_user, require_role, guard()
│       │   ├── errors.py               #   AppError + the single exception handler
│       │   └── units.py                #   paise/kg/bps helpers
│       ├── models/                     # Akash — SQLAlchemy, mirrors CANON §6 exactly
│       │   ├── reference.py  identity.py  prices.py  trade.py  audit.py
│       ├── schemas/                    # Pydantic v2 — split by owner
│       │   ├── common.py               #   Akash — error envelope, pagination, scalars
│       │   ├── auth.py  lots.py  offers.py  tx.py       #   Akash
│       │   ├── prices.py  ref.py                        #   Kartik
│       │   └── ai.py                   #   Nilesh — WindowReq/Res, PledgeQuote, ForecastRes
│       ├── routers/
│       │   ├── auth.py lots.py demands.py offers.py tx.py disputes.py pools.py   # Akash
│       │   ├── ref.py prices.py meta.py                                          # Kartik
│       │   └── ai.py                                                             # Nilesh
│       ├── domain/
│       │   ├── escrow.py matching.py grading.py split.py    # Akash
│       │   └── window.py costs.py pledge.py                 # Nilesh
│       └── ml/                                              # Nikhil
│           ├── features.py             #   lags, rolling stats, calendar, arrivals
│           ├── train.py                #   CLI: writes artifacts/model_<crop>.pkl + model_runs row
│           ├── quantile.py             #   predict_quantiles() -> (p10,p50,p90)
│           ├── backtest.py             #   MASE + coverage — the model card numbers
│           └── artifacts/              #   *.pkl COMMITTED so deploy needs no training
│
├── ingest/                             # ── Kartik, offline only ──
│   ├── sources/agmarknet.py  msamb.py  archive_csv.py  wdra.py
│   ├── normalise.py                    #   -> canonical columns, paise, source label
│   ├── validate.py                     #   range checks, dupes, gaps -> report
│   ├── run.py                          #   CLI: python -m ingest.run --commodity onion
│   └── snapshots/                      #   raw CSVs, COMMITTED. Reproducible, offline.
│
├── seed/                               # ── Kartik ──
│   ├── 00_reference.py                 #   districts, markets, commodities, costs, warehouses
│   ├── 10_prices.py                    #   load ingest/snapshots -> price_obs
│   ├── 20_demo_story.py                #   the 11-beat demo rows: farmers, buyers, pools, offers
│   └── run_all.py
│
├── app/                                # ── Expo ──
│   ├── app.json  package.json  App.tsx
│   ├── assets/audio/{mr,en}/*.mp3      #   Shreya — pre-generated TTS, committed
│   └── src/
│       ├── lib/  api.ts money.ts storage.ts voice.ts        # api+money Pranay, voice Shreya
│       ├── i18n/ mr.json en.json index.tsx                  # Shreya
│       ├── context/ AuthContext.tsx LocaleContext.tsx       # Shreya
│       ├── navigation/ RootNavigator.tsx FarmerTabs.tsx BuyerTabs.tsx   # Pranay
│       ├── components/
│       │   ├── ui/          Button Card Badge Sheet Empty Skeleton ErrorState   # Shreya
│       │   ├── charts/      PriceHistory.tsx ForecastFan.tsx                    # Pranay
│       │   ├── farmer/      VerdictCard CostBreakdown PledgeCard MandiRow …     # Pranay
│       │   └── buyer/       MatchRow OfferThread ReliabilityCard …              # Shreya
│       └── screens/
│           ├── farmer/      S1–S16                          # Pranay
│           ├── buyer/       S17–S23                          # Shreya
│           └── shared/      Provenance.tsx Dispute.tsx        # Shreya
│
├── scripts/
│   ├── gen_tts.py                      # Shreya — offline, run ONCE
│   └── smoke.sh                        # Akash — curl every endpoint, exit non-zero on failure
└── docs/architecture/                  # these files
```

---

## 4. Data flow — the hero path, traced end to end

`POST /api/v1/ai/window/recommend`

```
 1. nginx                    → proxy to uvicorn :8000
 2. deps.current_user        → decode JWT → user_id, role. 401 if bad.
 3. Pydantic WindowReq       → commodity_id, market_id, qty_kg, grade, lot_id?, horizon_days
                               400 VALIDATION_FAILED with `field` if malformed
 4. guard(lot_id, user)      → if lot_id given, SELECT … WHERE id=? AND farmer_id=<from JWT>
                               404 NOT_FOUND if not owned  (I4 — never trust a client id)
 5. costs.resolve()          → cost_tables row for (farmer district → market)
                               + commodity.spoilage_bps_day + warehouse rent
                             → CostBreakdown, all integer paise            [Nilesh]
 6. prices.latest()          → today's modal for (commodity, market) from price_obs
                             → sell_now_gross
 7. ml.predict_quantiles()   → in-process LightGBM, 14 target dates × (p10,p50,p90)  [Nikhil]
                               model already in memory — no network, no disk read
 8. window.decide()          → THE DECISION.                                [Nilesh]
       a. sell_now_net  = gross − transport − commission − loading
       b. for each day d in 1..14:
             hold_net_p50(d) = p50(d) − transport − commission − loading
                               − storage·d − spoilage(d)
             hold_net_p10(d) = same with p10(d)
       c. best_day = argmax hold_net_p50(d)
       d. band_width_bps = 10000·(p90−p10)/p50   at best_day
       e. IF band_width_bps > 3500 → NO_ADVICE / BAND_TOO_WIDE          (I6)
          IF history_rows < 180    → NO_ADVICE / INSUFFICIENT_HISTORY
          IF latest_obs > 10 days old → NO_ADVICE / STALE_DATA
       f. gain_per_qtl = hold_net_p50(best) − sell_now_net
          IF gain_per_qtl ≤ 0 → SELL_NOW
          IF an alt market's net beats this market's best hold → SELL_ELSEWHERE
          IF gain is positive but band straddles zero → SPLIT (half now, half later)
          ELSE → HOLD
       g. expected_gain_paise = gain_per_qtl · qty_kg / 100
          worst_case_paise    = (hold_net_p10(best) − sell_now_net) · qty_kg / 100
 9. pledge.quote()           → loan, interest, is_worthwhile.               [Nilesh]
                               is_worthwhile == False → return None        (I13)
10. persist                  → INSERT recommendations (audit trail + the demo replays it)
11. WindowRes                → Pydantic serialises. Every key present. pledge_quote nullable.
12. Expo                     → VerdictCard renders. formatPaise() at the render edge only.
                               Voice clip stitched locally from assets/audio.  (I7, A2)
```

**Latency budget:** DB reads ~15 ms · model predict ~30 ms · arithmetic ~1 ms · serialise ~5 ms. **< 100 ms typical.** The 500 ms p95 target is generous on purpose.

**Failure behaviour:** step 7 raising must not 500. Catch it, return `NO_ADVICE` with `INSUFFICIENT_HISTORY`. A hero endpoint that throws on stage is worse than one that declines.

---

## 5. Other data flows

### 5.1 Offline ingestion — Kartik, before the demo
```
python -m ingest.run --commodity onion --market lasalgaon --from 2024-01-01
  → sources/*.py fetch (retry, backoff, cache to snapshots/)
  → normalise.py: rupees→paise, dates→ISO, market names→market_id, attach source + source_url
  → validate.py: modal between min and max? gaps > 7 days? dupes? outliers > 4σ?
                 writes ingest/report_<crop>.md  ← the honesty artefact for the provenance screen
  → snapshots/onion_lasalgaon_2024-2026.csv  (COMMITTED — reproducible without network)
python -m seed.run_all   → price_obs, with source per row
```

### 5.2 Model training — Nikhil, offline, artifacts committed
```
python -m app.ml.train --commodity onion
  → features.py: lag 1/3/7/14/30, rolling mean/std 7/14/30, dow, month,
                 days-since-harvest-start, arrivals lag + rolling
  → three LightGBM models, objective='quantile', alpha ∈ {0.1, 0.5, 0.9}
  → backtest.py: expanding-window walk-forward
       MASE vs seasonal-naive (lag-7)  ← must be < 1.0
       empirical coverage of [p10,p90] ← must land 70–90%
  → artifacts/model_onion.pkl  +  INSERT model_runs (the model card)
```
**Train offline. Commit the pickle.** Deploy loads it. No training on EC2, no training during the demo.

### 5.3 Voice generation — Shreya, offline, once
```
python scripts/gen_tts.py
  → ~40 phrase clips  ("थांबा", "दिवस", "जास्त मिळू शकतात", "आम्ही सल्ला देणार नाही", …)
  → digit clips        (०–९, दहा…नव्वद, शंभर, हजार, लाख, रुपये)
  → app/assets/audio/mr/*.mp3   COMMITTED
Runtime: voice.ts decomposes ₹6,290 → [सहा, हजार, दोनशे, नव्वद, रुपये] → react-native-sound sequence
Fallback: react-native-tts with locale 'mr-IN' if a clip is missing
```
**Zero network at playback. Works in airplane mode.** That is the demo moment.

### 5.4 Counter-offer negotiation — the middleman-removal flow
```
Buyer POST /offers                    round=1  initiator=BUYER   ₹1,900/qtl
Farmer GET  /offers                   → sees the offer
  Farmer app ALSO calls /ai/window/recommend for that lot
  → the counter screen renders:
      "खरेदीदार: ₹१,९००   ·   तुमचा अंदाज: ₹२,०५० (११ दिवसांत)"
Farmer POST /offers/{id}/counter      round=2  initiator=FARMER   ₹2,000/qtl
  → parent offer.status = COUNTERED, new offer row, audit_log entry
Buyer  POST /offers/{id}/counter      round=3  initiator=BUYER    ₹1,960/qtl
Farmer POST /offers/{id}/accept       → transactions row, escrow_events(→CREATED)
Round 4                               → 409 MAX_ROUNDS
```
> **The forecast beside the counter input is the feature.** Without it, this is a chat. With it, the farmer negotiates from information the trader used to monopolise. That sentence is the middleman removal, and it is one API call plus one line of layout.

---

## 6. Authentication & authorization

```
POST /auth/otp/request   { phone }
  → rate limit: 3 per phone per 10 min → 429 RATE_LIMITED
  → code = secrets.randbelow(900000) + 100000        (I15 — never random.random)
  → store bcrypt(code), expires_at = now + 10 min
  → DEV: return dev_otp only if DEV_OTP_ECHO=1 AND ENV != 'production'
  → NEVER log the phone or the code                  (I14)

POST /auth/otp/verify    { phone, code }
  → attempts >= 5 → 429.  Wrong code and unknown phone return the IDENTICAL error.
  → JWT: { sub: user_id, role, exp: +7d }, HS256, secret from env
  → native: client stores in expo-secure-store · web: httpOnly Secure SameSite=Lax cookie
```

**Authorization — one function, used everywhere:**
```python
# app/core/deps.py
def guard(model, row_id: str, user: User, owner_field: str = "farmer_id"):
    """The ONLY way to fetch a user-owned row. Owner comes from the token. (I4)"""
    row = db.get(model, row_id)
    if row is None or getattr(row, owner_field) != resolve_owner(user, owner_field):
        raise AppError("NOT_FOUND", "Not found", 404)   # 404, not 403 — don't confirm it exists
    return row
```
Role gates: `require_role("BUYER")` on demand/offer creation, `require_role("FARMER")` on lots/assay, `require_role("ADMIN")` on anything admin. **Never** `WHERE farmer_id = :body_farmer_id`.

**Test it by hand before you call anything done:**
```bash
curl -H "Authorization: Bearer $FARMER_A" $API/lots/$FARMER_B_LOT_ID   # must be 404
```

---

## 7. Error handling

```python
# app/core/errors.py
class AppError(Exception):
    def __init__(self, code: str, message: str, status: int = 400, field: str | None = None): ...

@app.exception_handler(AppError)         # → {"error":{"code","message","field"}}
@app.exception_handler(RequestValidationError)   # → 400 VALIDATION_FAILED, first field named
@app.exception_handler(Exception)         # → 500 INTERNAL, generic message.
                                          #   Log server-side with a request id.
                                          #   NEVER leak a stack trace or raw SQL. (I14)
```
Every response carries `X-Request-Id`. When something breaks on stage you grep that id instead of guessing.

---

## 8. Escrow FSM — the implementation shape

```python
# app/domain/escrow.py — the ONLY place tx.status changes (I11)
LEGAL: dict[str, set[str]] = {
  "CREATED":     {"ESCROW_HELD", "CANCELLED"},
  "ESCROW_HELD": {"DISPATCHED", "REFUNDED"},
  "DISPATCHED":  {"DELIVERED", "DISPUTED"},
  "DELIVERED":   {"RELEASED", "DISPUTED"},
  "DISPUTED":    {"RELEASED", "REFUNDED"},
  "RELEASED":    set(), "REFUNDED": set(), "CANCELLED": set(),
}

ACTOR: dict[tuple[str,str], set[str]] = {
  ("CREATED","ESCROW_HELD"): {"BUYER"},
  ("ESCROW_HELD","DISPATCHED"): {"FARMER"},
  ("DISPATCHED","DELIVERED"): {"BUYER"},
  ("DELIVERED","RELEASED"): {"BUYER","ADMIN"},
  ...
}

def transition(tx, to, actor, note, idem_key):
    if to not in LEGAL[tx.status]: raise AppError("INVALID_TRANSITION", ..., 409)
    if actor.role not in ACTOR[(tx.status, to)]: raise AppError("FORBIDDEN", ..., 403)
    if already_applied(idem_key): return tx            # idempotent replay
    frm, tx.status = tx.status, to
    db.add(EscrowEvent(tx_id=tx.id, from_status=frm, to_status=to, actor_user_id=actor.id, note=note))
    db.add(AuditLog(action=f"ESCROW_{to}", entity="transaction", entity_id=tx.id, ...))
    db.commit()
```
Two properties worth stating out loud in the demo: **the actor matrix** (a buyer cannot mark his own delivery received *and* dispatched) and **idempotency** (a double-tap on bad network does not double-transition).

---

## 9. Matching algorithm — Akash

```
score = 0.40·price_fit + 0.25·grade_fit + 0.20·distance_fit + 0.15·fill_fit

price_fit    = clamp01(bid / lot_expected_price)
grade_fit    = 1.0 if lot_grade >= min_grade else 0.0        # hard filter, not a penalty
distance_fit = clamp01(1 − km / 200)
fill_fit     = clamp01(total_qty / demand_qty)
```
**Combinations:** greedy — sort candidates by `score` desc, take until `demand_qty` is filled, cap at 4 lots (a buyer will not coordinate five pickups). Emit both the best `SINGLE` and the best `COMBINATION`.

Every match carries a `why_mr` / `why_en` sentence built from the dominant term. *"Because the algorithm said so"* is not an answer a judge accepts.

---

## 10. Deployment

```yaml
# docker-compose.yml  (Kartik)
services:
  db:
    image: postgres:16-alpine
    environment: [POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD]   # from .env, never in git
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: pg_isready
  api:
    build: ./api
    depends_on: { db: { condition: service_healthy } }
    environment: [DATABASE_URL, JWT_SECRET, ENV, DEV_OTP_ECHO]
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    volumes: [./media:/app/media]
  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes: [./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro, ./media:/media:ro]
volumes: { pgdata: }
```

**Deploy sequence — must be one command, rehearsed at H28, not first attempted at H33:**
```bash
git pull && docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python -m seed.run_all
bash scripts/smoke.sh          # curls every endpoint; non-zero exit = do not proceed
```

**Client:** `expo start` and show the QR (a real phone in the judge's hand beats a simulator every time). `expo start --web` in a second browser tab for the buyer console. **Do not attempt an EAS build in 36 hours** — a build queue is a dependency you cannot control.

**Fallback ladder, decided now so nobody improvises at H35:**
1. Deployed EC2 + phone over wifi
2. Laptop hotspot → phone, API on `localhost`
3. `--web` in a browser on the laptop, projector only
4. **The H32 video.** Recorded before fatigue. Non-negotiable.

---

## 11. Configuration — `.env.example` is the only env file in git (I10)

```bash
ENV=development                 # development | production
DATABASE_URL=postgresql+psycopg://mandi:CHANGEME@db:5432/mandisetu
JWT_SECRET=CHANGEME_openssl_rand_hex_32
JWT_EXPIRE_DAYS=7
DEV_OTP_ECHO=1                  # MUST be 0 when ENV=production, and the code checks both
MEDIA_ROOT=/app/media
MODEL_DIR=/app/app/ml/artifacts
NO_ADVICE_BAND_BPS=3500         # I6 threshold — tuned once at H14, then frozen
STALE_DATA_DAYS=10
DEFAULT_LTV_BPS=7000            # illustrative until Kartik confirms WDRA terms
DEFAULT_PLEDGE_RATE_BPS=900
SARVAM_API_KEY=                 # BLANK in git. Used only by scripts/gen_tts.py, offline. (I10)
```

---

## 12. Testing — proportionate to 36 hours

| What | How | Owner |
|---|---|---|
| Decision engine | `pytest` — **8 cases, non-negotiable**: gain>0→HOLD · gain≤0→SELL_NOW · wide band→NO_ADVICE · alt market wins→SELL_ELSEWHERE · costs sum exactly · pledge unworthy→None · qty scaling exact · worst case negative when it should be | Nilesh |
| Model | `backtest.py` prints MASE + coverage; **the numbers go in `model_runs`, not a slide only** | Nikhil |
| Split arithmetic | `pytest` — shares sum to exactly 10000; Pareto guard rejects a harmful pool | Akash |
| FSM | `pytest` — every illegal transition 409s; wrong actor 403s | Akash |
| Auth scoping | `scripts/smoke.sh` asserts cross-actor reads return **404** | Akash |
| Screens | Manual golden-path run, **three times at H30–H33 on the deployed build** | everyone |

**No Playwright, no E2E suite.** Wrong investment at this timescale. `smoke.sh` catches the class of bug that actually kills a demo: an endpoint that 500s after a deploy.

---

## 13. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| **Agmarknet blocked / schema changed / no bulk history** | **High** | **Fatal** | 5-rung data ladder in `03_DATA_ARCHITECTURE.md`. **H4 hard gate: if no real data by H4, drop to rung 3 (archived CSV mirror, labelled `ARCHIVE`) and move on.** Do not spend hour 9 on a scraper. | Kartik |
| Model MASE ≥ 1.0 | Medium | High | Seasonal-naive is itself a legitimate baseline. Report the honest number and say *"our quantile model beats naive by X%"* — or if it doesn't, ship the naive band and say why. A judge respects the measurement more than the number. | Nikhil |
| NO_ADVICE never fires on real data | Medium | High | Onion is chosen because it does. Verify at H14 with the real series. If it doesn't, the threshold is wrong, not the data — but **never rig a row**. | Nikhil, Nilesh |
| Akash overloaded (auth+lots+offers+escrow+disputes+matching) | **High** | High | Kartik owns `ref/prices/meta` routers and takes disputes at H22 if Akash is behind. Reassess at H12 and H20. | Akash |
| Voice clips missing at demo time | Medium | Medium | `expo-speech` fallback wired from the start; the button never appears broken | Shreya |
| Deploy fails at H33 | Medium | **Fatal** | **Rehearse the deploy at H28.** H32 fallback video. Four-rung fallback ladder. | Kartik |
| Two people edit the same file | Medium | High | Ownership map, `00_CANON.md` §11. Blocker instead of edit. No exceptions, not even one-liners. | everyone |
| Shreya unavailable | Unknown | Medium | Cut buyer to 3 read-only screens; Pranay absorbs i18n; voice-in drops (voice-out stays) | Pranay |
| Sleep debt destroys the pitch | **High** | High | Staggered sleep H14–H20 is **mandatory**, in the schedule, not optional | everyone |

---

## 14. Performance & scale — the honest answer

One `t3.small`, one uvicorn worker, one Postgres container. **~20 concurrent users.** If a judge asks about scale, say exactly that, then say what changes: *"Postgres to RDS with read replicas for `price_obs`, uvicorn workers behind an ALB, the model behind a cache keyed on (commodity, market, date) since forecasts change once a day, and ingestion moves to a scheduled job with a queue. None of that is interesting engineering — it's known work. The interesting part is what the endpoint decides."*

Inventing a fake load-test number is worse than admitting the box is small.
