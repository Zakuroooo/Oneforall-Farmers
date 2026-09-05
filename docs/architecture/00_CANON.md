# 00 — CANON: Invariants, Schema, API Contract

> **This file is the single source of truth.** Every other doc, every line of code, every Pydantic model and every screen must agree with this file. If another doc contradicts this one, this one wins.
>
> **Frozen at H2.** After H2 a change here requires: an entry in `docs/BLOCKERS.md`, agreement from Akash + Kartik, and an announcement in the group chat. Additive changes (new optional field) are cheap. Renames are expensive. Prefer adding.

---

## 0. Product identity

| | |
|---|---|
| **Name** | **Mandi-Setu** — use this everywhere. App header, slide title, repo, what you say out loud. Never "AgriSense". |
| **Problem statement** | SIH 2026 · PS **26132** · "Strengthening market linkages and price discovery for farmers" · Govt. of Maharashtra |
| **Scope** | Maharashtra only |
| **One-line pitch** | *"Everyone here will show a price forecast. We're the only team that turns that forecast into money the farmer can act on today — and the only team honest enough to say 'we don't know' when we don't."* |
| **Thesis** | The binding constraint is not information, it is **the ability to wait**. Farmers already suspect prices will rise; they sell at harvest because they cannot afford not to. So this is not a price dashboard — it is a **waiting product**. |

**The test every feature must pass:** *does this help a farmer wait profitably, or help a buyer trust a lot enough to pay more for it?* If neither, it is out of Phase 1.

---

## 1. Phase definitions

| Phase | Window | Meaning | Doc |
|---|---|---|---|
| **Phase 1** | **36 hours** — the internal/college prototype pitched to faculty | Everything in this canon. Real Agmarknet price data, real decision engine, simulated money rails. | this file + `01`–`08` |
| **Phase 2** | 1–3 months post-selection | Live daily ingestion, CV grading as a second signal, real lender/e-NWR, real KYC, real payouts, admin console, learned trust score, Hindi + more languages, SMS/IVR, offline-first sync | `09_PHASE_2.md` |
| **Phase 3** | Production / state scale | ONDC participation, government policy dashboard, multi-state, MLOps retraining, logistics marketplace, arbitration SLA | `10_PHASE_3.md` |

**Phase 1 is the prototype.** Nothing from Phase 2 or Phase 3 gets built in the 36 hours. They exist to be *said out loud* on the roadmap slide.

---

## 2. Stack — locked, do not substitute

| Layer | Choice | Notes |
|---|---|---|
| **Client** | **React Native CLI 0.76.x, single codebase** | One app, one binary. Farmer stack + buyer stack behind role-based navigators, selected by the JWT `role` claim. **Not Expo** and **no web build** — RN CLI has no web target. The buyer console is the same binary on a second Android device. See `12_STACK.md`. |
| Navigation | React Navigation (native-stack + bottom-tabs) | |
| Client state | TanStack Query (server state) + React Context (auth, locale) | No Redux. |
| Charts | **`react-native-svg`, hand-rolled** | Not `victory-native` — that pulls Skia + Reanimated for one fan chart. ~60 lines of `<Path>`. `12_STACK.md` §3.1. |
| **API** | **FastAPI**, Python 3.11 | `uvicorn` behind nginx |
| Validation | **Pydantic v2** on every request and response | The Zod schemas in `packages/contracts/` are the Next.js-era ancestor. Field names carry over; the code does not. |
| ORM | SQLAlchemy 2.0 (declarative) + Alembic | |
| **DB** | PostgreSQL 16, Docker container on EC2 | |
| **ML** | Python 3.11, LightGBM (quantile objective), pandas, numpy, statsmodels | Served in-process by the same FastAPI app under `/ai/*`. **No separate ML service in Phase 1** — one less thing to deploy. |
| Auth | Phone + OTP → JWT, stored in **AsyncStorage** (Phase 1) | No web target, so no cookie path. **Declared gap: the token is not in the OS keystore** — `react-native-keychain` is the Phase-2 fix. See `12_STACK.md` §6. |
| i18n | Plain JSON dictionaries + React Context. **No i18n library.** | Three locales ship in Phase 1: `mr` (default), `hi`, `en`. |
| Voice out | Sarvam TTS clips **pre-generated at build time**, committed as `.mp3`, played by `react-native-sound` | Zero network calls at runtime. `react-native-tts` is the fallback. |
| Voice in | **Cut from Phase 1.** | A misheard "40 quintal" → "14 quintal" is a financial error. `07_FRONTEND_ARCHITECTURE.md` §7. |
| Photos | Local disk on EC2 behind nginx `/media/`, S3 optional | |
| Payments | **None.** Escrow is a state machine in our own Postgres. | See §3 I11 |
| Infra | Single EC2 instance, `docker-compose`, nginx reverse proxy | |
| Tests | `pytest` for the decision engine only. Manual golden-path runs for everything else. | 36 hours. No E2E suite. |

### Python 3.11, not 3.14
```bash
uv venv --python 3.11        # default is 3.14; no LightGBM wheel exists for it
source .venv/bin/activate
uv pip install -r requirements.txt
```

---

## 3. Invariants — breaking one is a bug even if tests pass

| # | Invariant | Why |
|---|---|---|
| **I1** | **All money is integer paise.** Never float, never rupees. Every money field name ends `_paise`. Format only at the render edge. | Floats lose money. A judge who spots `0.1 + 0.2` in a price product is done with you. |
| **I2** | **Quantities are integer kilograms**, field name ends `_kg`. 1 quintal = 100 kg. **Store kg, display quintals.** | |
| **I3** | **Rates and shares are basis points**, field name ends `_bps`. 10000 bps = 100%. | |
| **I4** | **Every read of user-owned data is scoped by the JWT actor.** The owner id comes from the token, never from a query param or body. A row the actor may not see returns **404, not 403**. | `GET /lots/<someone-else's-id>` returning data is the single most common bug in hackathon marketplaces and the panel will try it. 404 also avoids confirming the row exists. |
| **I5** | **`audit_log` and `escrow_events` are append-only.** No `UPDATE`, no `DELETE` in application code, ever. | Transparent transaction records are a stated PS outcome. A log you can silently edit is not a record. |
| **I6** | **The model must be allowed to refuse.** When the p10–p90 band exceeds the configured threshold, return `action: "NO_ADVICE"` with a reason. Never invent a confident number. | A wrong HOLD costs a farmer real money. Refusal is the ethical position and the strongest demo moment. |
| **I7** | **The demo makes zero live external network calls.** All data is already in Postgres. Ingestion is an offline job. TTS is pre-generated. No LLM API call on stage. | Venue wifi fails. It always fails. |
| **I8** | **Generated data is labelled generated.** Every row that can be observed or invented carries `source`. The UI badges anything not `AGMARKNET`/`MSAMB`. | Presenting generated data as government data to a government panel is the one mistake you cannot recover from. |
| **I9** | **No Aadhaar numbers stored, ever.** Not hashed, not encrypted, not "just for the demo", not in seed data. **Phone is the identifier.** | Legal exposure, trivially avoidable. |
| **I10** | **No secrets in git.** Only `.env.example` is committed. A leaked key must be rotated — deleting the line later does not remove it from history. | |
| **I11** | **State transitions go through the FSM** in `app/domain/escrow.py`. No ad-hoc `status = "RELEASED"` anywhere. | Money state machines that can skip states are how funds get released without delivery. |
| **I12** | **Every route validates input with a Pydantic model.** No hand-rolled parsing, no `dict[str, Any]` request bodies. | |
| **I13** | **The pledge card renders only when `expected_gain_paise > interest_paise`.** Enforced in the decision engine, not in the UI. | This is the line that proves you understood the ethics, not just the features. |
| **I14** | **Never log phone numbers, OTPs, or full request payloads.** | |
| **I15** | **No `random` for anything security-relevant.** OTPs from `secrets.randbelow`. The seed PRNG is statistical only. | |
| **I16** | **Both numbers, always.** Wherever an upside is shown, the downside is shown beside it **at the same font size**. `worst_case_paise` is never smaller, greyer, collapsed, or behind a tap than the expected gain. | A product that shows only the gain has become an advertisement. This is the invariant the whole pitch rests on, and it is checked by measuring pixels, not by reading code. |

---

## 4. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| SQL columns, tables | `snake_case`, plural tables | `price_obs`, `net_paise_per_qtl` |
| Python | `snake_case` | `expected_gain_paise` |
| JSON over the wire | **`snake_case`** — matches Python, no serialiser config, no drift | `{"expected_gain_paise": 142800}` |
| TypeScript / React | `snake_case` for API DTO fields (do **not** camelise), `camelCase` for local variables | `data.expected_gain_paise` |
| Money | ends `_paise`, integer | `interest_paise` |
| Quantity | ends `_kg`, integer | `qty_kg` |
| Rate / share | ends `_bps`, integer | `ltv_bps` |
| Price per unit | ends `_paise_per_qtl`, integer | `modal_paise_per_qtl` |
| Dates | `date` for calendar days, `timestamptz` for events. Never a string, never an epoch int. | `obs_date`, `created_at` |
| Enums | Postgres `text` + `CHECK`, mirrored by a Python `StrEnum`. **Not** native PG enums — altering them mid-hackathon is painful. | |

**One decision to internalise:** the wire format is `snake_case`. The frontend reads `expected_gain_paise`, not `expectedGainPaise`. This deletes an entire class of bug for free.

---

## 5. Money and unit helpers

```python
# app/core/units.py
PAISE_PER_RUPEE = 100
KG_PER_QUINTAL   = 100

def paise_to_rupee_str(p: int, locale: str = "mr") -> str:
    """Display only. Never feed the result back into arithmetic."""
    ...

def qtl(kg: int) -> float:
    """Display only. kg / 100."""
    return kg / KG_PER_QUINTAL
```

```ts
// src/lib/money.ts
export const formatPaise = (p: number, locale: Locale) => ...   // "₹१,४२८" / "₹1,428"
export const toQuintal   = (kg: number) => Math.floor(kg / 100);   // display only; floor, never round
```

**Devanagari numerals in Marathi.** `₹१,४२८`, not `₹1,428`, when `locale === 'mr'`. Digits `०१२३४५६७८९`. Hindi uses the same Devanagari digits; English uses Latin.

---

## 6. Database schema — Postgres 16

24 tables. Authoritative DDL below; SQLAlchemy models mirror it exactly. Every table gets `id text primary key` (a ULID/uuid4 string), `created_at timestamptz not null default now()`.

### 6.1 Reference data — owned by Kartik

```sql
create table districts (
  id            text primary key,
  name          text not null,
  name_mr       text not null,
  state         text not null default 'MH',
  centroid_lat  double precision,
  centroid_lon  double precision,
  created_at    timestamptz not null default now(),
  unique (state, name)
);

create table markets (                      -- APMC mandis
  id            text primary key,
  district_id   text not null references districts(id),
  name          text not null,
  name_mr       text not null,
  agmark_code   text,                       -- Agmarknet market code, for ingestion joins
  lat           double precision,
  lon           double precision,
  created_at    timestamptz not null default now(),
  unique (district_id, name)
);
create index on markets (district_id);

create table commodities (
  id                  text primary key,
  name                text not null,
  name_mr             text not null,
  agmark_code         text,
  unit                text not null default 'QUINTAL',
  -- storage economics, used by the decision engine
  storable_days       int  not null,         -- realistic cold/ordinary storage life
  spoilage_bps_day    int  not null,         -- weight/value loss per day of holding
  created_at          timestamptz not null default now(),
  unique (name)
);

create table cost_tables (                   -- transport + commission + storage, seeded
  id                        text primary key,
  from_district_id          text references districts(id),
  to_market_id              text references markets(id),
  transport_paise_per_qtl   int not null,
  commission_bps            int not null,     -- APMC commission / mandi fee
  loading_paise_per_qtl     int not null default 0,
  storage_paise_qtl_day     int not null default 0,
  source                    text not null,    -- 'SEEDED' | 'MSAMB' | 'FIELD_SURVEY'
  created_at                timestamptz not null default now(),
  unique (from_district_id, to_market_id)
);

create table warehouses (
  id                      text primary key,
  district_id             text not null references districts(id),
  name                    text not null,
  name_mr                 text not null,
  wdra_registered         bool not null default false,
  capacity_qtl            int,
  rent_paise_qtl_month    int not null,
  lat                     double precision,
  lon                     double precision,
  source                  text not null,      -- 'WDRA' | 'SEEDED'
  created_at              timestamptz not null default now()
);
```

### 6.2 Identity — owned by Akash

```sql
create table users (
  id            text primary key,
  phone         text not null unique,          -- 10 digits, the identifier. NEVER an Aadhaar. (I9)
  role          text not null check (role in ('FARMER','BUYER','FPO_ADMIN','ADMIN')),
  name          text not null,
  locale        text not null default 'mr' check (locale in ('mr','en')),
  pin_hash      text,                          -- bcrypt. nullable until set.
  created_at    timestamptz not null default now()
);

create table otp_codes (
  id            text primary key,
  phone         text not null,
  code_hash     text not null,                 -- hashed, never plaintext
  expires_at    timestamptz not null,
  attempts      int not null default 0,
  consumed_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index on otp_codes (phone, created_at desc);

create table farmers (
  id            text primary key,
  user_id       text not null unique references users(id),
  district_id   text not null references districts(id),
  village       text,
  land_acres_x100 int,                         -- integer: acres * 100
  created_at    timestamptz not null default now()
);

create table fpos (
  id            text primary key,
  name          text not null,
  name_mr       text not null,
  district_id   text not null references districts(id),
  admin_user_id text references users(id),
  source        text not null default 'SEEDED',
  created_at    timestamptz not null default now()
);

create table fpo_memberships (
  id            text primary key,
  fpo_id        text not null references fpos(id),
  farmer_id     text not null references farmers(id),
  created_at    timestamptz not null default now(),
  unique (fpo_id, farmer_id)
);

create table buyers (
  id                    text primary key,
  user_id               text not null unique references users(id),
  business_name         text not null,
  district_id           text not null references districts(id),
  tier                  text not null default 'T1_REGISTERED'
                        check (tier in ('T0_UNVERIFIED','T1_REGISTERED','T2_TRANSACTED','T3_TRUSTED')),
  gst_last4             text,                   -- last 4 only, display purposes. No full GSTIN in Phase 1.
  -- reliability, seeded in Phase 1, computed in Phase 2
  deals_completed       int not null default 0,
  on_time_payment_bps   int not null default 10000,
  renegotiation_bps     int not null default 0,  -- ★ how often this buyer cut price after delivery
  source                text not null default 'SEEDED',
  created_at            timestamptz not null default now()
);
```

### 6.3 Prices and intelligence — owned by Kartik (obs) + Nikhil (forecast) + Nilesh (recommendation)

```sql
create table price_obs (
  id                  text primary key,
  market_id           text not null references markets(id),
  commodity_id        text not null references commodities(id),
  obs_date            date not null,
  min_paise_per_qtl   int not null,
  max_paise_per_qtl   int not null,
  modal_paise_per_qtl int not null,
  arrivals_qtl        int,                       -- ★ arrivals drive the glut story. Ingest if available.
  source              text not null check (source in ('AGMARKNET','MSAMB','ARCHIVE','IMPUTED','SYNTHETIC')),
  source_url          text,                      -- provenance. Kartik fills this. (I8)
  created_at          timestamptz not null default now(),
  unique (market_id, commodity_id, obs_date)
);
create index on price_obs (commodity_id, market_id, obs_date desc);

create table model_runs (                        -- ★ the model card. Nikhil.
  id                  text primary key,
  commodity_id        text not null references commodities(id),
  algo                text not null,             -- 'LGBM_QUANTILE'
  trained_at          timestamptz not null,
  train_rows          int not null,
  train_from          date not null,
  train_to            date not null,
  horizon_days        int not null,
  mase                double precision not null, -- vs seasonal-naive. <1.0 means we beat it.
  coverage_80_bps     int not null,              -- how often actual fell inside p10-p90. Target ~8000.
  wql                 double precision,          -- weighted quantile loss
  notes               text,
  created_at          timestamptz not null default now()
);

create table forecasts (
  id                  text primary key,
  model_run_id        text not null references model_runs(id),
  market_id           text not null references markets(id),
  commodity_id        text not null references commodities(id),
  as_of_date          date not null,
  target_date         date not null,
  p10_paise_per_qtl   int not null,
  p50_paise_per_qtl   int not null,
  p90_paise_per_qtl   int not null,
  created_at          timestamptz not null default now(),
  unique (market_id, commodity_id, as_of_date, target_date)
);
create index on forecasts (commodity_id, market_id, as_of_date desc);

create table recommendations (                   -- ★ THE HERO. Nilesh.
  id                       text primary key,
  farmer_id                text references farmers(id),
  lot_id                   text references lots(id),
  market_id                text not null references markets(id),
  commodity_id             text not null references commodities(id),
  qty_kg                   int not null,
  as_of_date               date not null,
  action                   text not null check (action in
                             ('SELL_NOW','SELL_ELSEWHERE','HOLD','SPLIT','NO_ADVICE')),
  hold_days                int,
  -- all net of costs
  sell_now_net_paise_per_qtl  int,
  hold_p50_net_paise_per_qtl  int,
  hold_p10_net_paise_per_qtl  int,               -- ★ the worst case
  expected_gain_paise         int,               -- total for this lot, not per qtl
  worst_case_paise            int,               -- ★ negative when holding could lose money
  confidence               text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  band_width_bps           int not null,         -- (p90-p10)/p50. Drives NO_ADVICE. (I6)
  refusal_reason           text,                 -- required when action='NO_ADVICE'
  costs_json               jsonb not null,       -- itemised: transport/commission/storage/spoilage/loading
  alt_market_id            text references markets(id),  -- set when action='SELL_ELSEWHERE'
  model_run_id             text references model_runs(id),
  created_at               timestamptz not null default now()
);
create index on recommendations (farmer_id, created_at desc);
```

### 6.4 Trade — owned by Akash

```sql
create table lots (
  id            text primary key,
  farmer_id     text not null references farmers(id),
  commodity_id  text not null references commodities(id),
  market_id     text not null references markets(id),   -- intended mandi
  qty_kg        int not null check (qty_kg > 0),
  grade         text not null default 'UNGRADED' check (grade in ('A','B','C','UNGRADED')),
  harvest_date  date,
  photo_path    text,                                    -- EXIF GPS stripped on upload
  status        text not null default 'DRAFT' check (status in
                  ('DRAFT','LISTED','POOLED','OFFERED','COMMITTED','IN_TRANSIT','DELIVERED','SETTLED','CANCELLED')),
  created_at    timestamptz not null default now()
);
create index on lots (farmer_id, created_at desc);
create index on lots (commodity_id, status);

create table grade_assays (                              -- ★ 6-question self-assay
  id                  text primary key,
  lot_id              text not null references lots(id),
  size_uniform        int not null check (size_uniform      between 1 and 3),
  colour_uniform      int not null check (colour_uniform    between 1 and 3),
  sprouting           int not null check (sprouting         between 1 and 3),
  damage_pct          int not null check (damage_pct        between 0 and 100),
  moisture_feel       int not null check (moisture_feel     between 1 and 3),
  foreign_matter      int not null check (foreign_matter    between 1 and 3),
  score               int not null,                      -- 0..1000, deterministic from the six above
  grade               text not null check (grade in ('A','B','C')),
  weakest_dimension   text not null,                     -- ★ the actionable tip
  photo_path          text,                              -- EVIDENCE, not classifier input
  created_at          timestamptz not null default now(),
  unique (lot_id)
);

create table pools (                                     -- FPO aggregation. Display-only in Phase 1.
  id            text primary key,
  fpo_id        text not null references fpos(id),
  commodity_id  text not null references commodities(id),
  total_qty_kg  int not null,
  avg_score     int not null,
  status        text not null default 'READY' check (status in
                  ('FORMING','CONSENT_PENDING','READY','LISTED','COMMITTED','SETTLED','CANCELLED')),
  created_at    timestamptz not null default now()
);

create table pool_members (
  id                text primary key,
  pool_id           text not null references pools(id),
  lot_id            text not null references lots(id),
  farmer_id         text not null references farmers(id),
  qty_kg            int not null,
  score_at_pool     int not null,   -- snapshot, so a later regrade cannot retroactively change an agreed split
  weight            int not null,   -- qty_kg * grade_multiplier. Exposed so the maths is auditable.
  share_bps         int not null,   -- sum over members == exactly 10000
  vs_solo_paise     int not null,   -- ★ gain vs selling this lot alone. The reason to pool.
  consented         bool,           -- null = not asked yet
  consented_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (pool_id, lot_id)
);

create table demands (
  id                    text primary key,
  buyer_id              text not null references buyers(id),
  commodity_id          text not null references commodities(id),
  market_id             text not null references markets(id),   -- delivery point
  qty_kg                int not null,
  min_grade             text not null default 'C' check (min_grade in ('A','B','C')),
  bid_paise_per_qtl     int not null,
  needed_by             date not null,
  status                text not null default 'OPEN' check (status in ('OPEN','FILLED','EXPIRED','CANCELLED')),
  source                text not null default 'SEEDED',        -- (I8) demo buyers are labelled
  created_at            timestamptz not null default now()
);
create index on demands (commodity_id, status);

create table offers (
  id                    text primary key,
  demand_id             text references demands(id),
  buyer_id              text not null references buyers(id),
  farmer_id             text references farmers(id),           -- exactly one of farmer_id / pool_id
  pool_id               text references pools(id),
  price_paise_per_qtl   int not null,
  qty_kg                int not null,
  round                 int not null default 1,                -- ★ counter-offer round, capped at 3
  parent_offer_id       text references offers(id),            -- the offer this counters
  initiator             text not null check (initiator in ('BUYER','FARMER')),
  status                text not null check (status in
                          ('OPEN','ACCEPTED','REJECTED','COUNTERED','EXPIRED','WITHDRAWN')),
  expires_at            timestamptz,
  created_at            timestamptz not null default now(),
  check (num_nonnulls(farmer_id, pool_id) = 1)
);
create index on offers (farmer_id, status);
create index on offers (parent_offer_id);

create table offer_lots (                       -- ★ multi-lot combination fills one order
  id                    text primary key,
  offer_id              text not null references offers(id),
  lot_id                text not null references lots(id),
  qty_allocated_kg      int not null check (qty_allocated_kg > 0),
  created_at            timestamptz not null default now(),
  unique (offer_id, lot_id)
);

create table transactions (
  id                    text primary key,
  offer_id              text not null unique references offers(id),
  buyer_id              text not null references buyers(id),
  farmer_id             text references farmers(id),
  pool_id               text references pools(id),
  qty_kg                int not null,
  price_paise_per_qtl   int not null,
  gross_paise           int not null,
  deductions_paise      int not null default 0,
  net_paise             int not null,
  status                text not null check (status in
                          ('CREATED','ESCROW_HELD','DISPATCHED','DELIVERED','RELEASED','DISPUTED','REFUNDED','CANCELLED')),
  created_at            timestamptz not null default now()
);

create table escrow_events (                    -- APPEND ONLY (I5)
  id            text primary key,
  tx_id         text not null references transactions(id),
  from_status   text,
  to_status     text not null,
  actor_user_id text references users(id),
  note          text,
  created_at    timestamptz not null default now()
);
create index on escrow_events (tx_id, created_at);

create table disputes (
  id            text primary key,
  tx_id         text not null references transactions(id),
  raised_by     text not null references users(id),
  reason_code   text not null,      -- 'QUALITY_MISMATCH' | 'SHORT_WEIGHT' | 'PAYMENT_DELAY' | 'OTHER'
  description   text,
  photo_path    text,
  stage         text not null default 'RAISED' check (stage in
                  ('RAISED','EVIDENCE','MEDIATION','RESOLVED_FARMER','RESOLVED_BUYER','RESOLVED_SPLIT','WITHDRAWN')),
  created_at    timestamptz not null default now()
);

create table dispute_events (                   -- APPEND ONLY (I5)
  id            text primary key,
  dispute_id    text not null references disputes(id),
  stage         text not null,
  actor_user_id text references users(id),
  note          text,
  created_at    timestamptz not null default now()
);
```

### 6.5 Pledge finance — owned by Nilesh

```sql
create table pledges (                          -- ★ SIMULATED. Never a real loan. (see §8)
  id                      text primary key,
  farmer_id               text not null references farmers(id),
  lot_id                  text not null references lots(id),
  warehouse_id            text references warehouses(id),
  assessed_value_paise    int not null,
  ltv_bps                 int not null,
  loan_paise              int not null,         -- assessed_value * ltv_bps / 10000
  rate_bps_annual         int not null,
  days                    int not null,
  interest_paise          int not null,         -- loan * rate_bps * days / (10000 * 365)
  expected_gain_paise     int not null,         -- from the recommendation
  is_worthwhile           bool not null,        -- expected_gain > interest. (I13) FALSE => do not render.
  status                  text not null default 'QUOTED'
                          check (status in ('QUOTED','ACCEPTED','REPAID','LAPSED')),
  disclaimer              text not null default 'Indicative simulation — not a lender quote',
  created_at              timestamptz not null default now()
);
```

### 6.6 Audit — owned by Akash

```sql
create table audit_log (                        -- APPEND ONLY (I5)
  id            text primary key,
  actor_user_id text references users(id),
  action        text not null,                  -- 'LOT_CREATED' | 'OFFER_COUNTERED' | 'ESCROW_RELEASED' | ...
  entity        text not null,
  entity_id     text not null,
  meta          jsonb,
  created_at    timestamptz not null default now()
);
create index on audit_log (entity, entity_id, created_at);
```

**A note on the hash chain.** The Next.js-era design had `prev_hash`/`hash` columns. **Dropped for Phase 1** — it costs an hour and buys nothing a judge can verify in seven minutes. The append-only guarantee is the substance; say *"tamper-evident append-only audit log — a blockchain is the wrong tool for this trust model and we can explain why."* Chain it in Phase 2 if anyone asks for it.

---

## 7. API contract

Base: `/api/v1`. All bodies and responses **`snake_case` JSON**. Auth via `Authorization: Bearer <jwt>` (native) or httpOnly cookie (web).

**Error envelope, every failure, no exceptions:**
```json
{ "error": { "code": "LOT_NOT_FOUND", "message": "…", "field": null } }
```

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Pydantic rejected the body. `field` is set. |
| `UNAUTHENTICATED` | 401 | No/expired token |
| `FORBIDDEN` | 403 | Authenticated, wrong role |
| `NOT_FOUND` | 404 | Missing **or not owned by the actor** (I4) |
| `CONFLICT` | 409 | FSM refused the transition |
| `RATE_LIMITED` | 429 | OTP throttle |
| `INSUFFICIENT_DATA` | 422 | Not enough history to forecast |
| `INTERNAL` | 500 | Never leaks a stack trace |

### 7.1 Auth — Akash

| Method | Path | Body → Response |
|---|---|---|
| `POST` | `/auth/otp/request` | `{phone}` → `{ok, expires_in_s, dev_otp?}` · 3/phone/10min · `dev_otp` only when `DEV_OTP_ECHO=1` **and** `ENV != production` |
| `POST` | `/auth/otp/verify` | `{phone, code}` → `{token, user}` · max 5 attempts · identical error for wrong code and unknown phone |
| `POST` | `/auth/register` | `{phone, code, name, role, locale, district_id}` → `{token, user}` |
| `GET` | `/auth/me` | → `{user}` |
| `POST` | `/auth/locale` | `{locale}` → `{ok}` |

### 7.2 Reference — Kartik

| Method | Path | Response |
|---|---|---|
| `GET` | `/ref/districts` | `[{id, name, name_mr}]` |
| `GET` | `/ref/markets?district_id=` | `[{id, name, name_mr, district_id, lat, lon}]` |
| `GET` | `/ref/commodities` | `[{id, name, name_mr, storable_days}]` |
| `GET` | `/ref/warehouses?district_id=` | `[{id, name, name_mr, wdra_registered, rent_paise_qtl_month, source}]` |
| `GET` | `/ref/logistics?from_district_id=&to_market_id=` | `[{transport_paise_per_qtl, commission_bps, loading_paise_per_qtl, source}]` |

### 7.3 Prices — Kartik

| Method | Path | Response |
|---|---|---|
| `GET` | `/prices/series?commodity_id=&market_id=&days=180` | `{points:[{obs_date, min_paise_per_qtl, max_paise_per_qtl, modal_paise_per_qtl, arrivals_qtl, source}], source_summary:{AGMARKNET:n, …}, latest_obs_date}` |
| `GET` | `/prices/nearby?commodity_id=&district_id=` | ★ **net of transport, sorted by net descending** — see below |

**`/prices/nearby` response — this is the differentiator, get it exactly right:**
```json
{
  "as_of_date": "2026-09-04",
  "rows": [
    { "market_id": "mkt_lasalgaon", "name_mr": "लासलगाव",
      "gross_paise_per_qtl": 205000,
      "transport_paise_per_qtl": 8000,
      "commission_paise_per_qtl": 3075,
      "net_paise_per_qtl": 193925,          // ★ gross - transport - commission - loading
      "distance_km": 34, "source": "AGMARKNET" },
    { "market_id": "mkt_pune", "name_mr": "पुणे",
      "gross_paise_per_qtl": 218000, "transport_paise_per_qtl": 19000,
      "commission_paise_per_qtl": 3270, "net_paise_per_qtl": 195730, "distance_km": 168,
      "source": "AGMARKNET" }
  ],
  "sorted_by": "net_paise_per_qtl"
}
```
> The list is ordered by **net**, not gross. A nearer mandi paying less gross can rank above a distant one paying more. That reordering is the insight — the UI must show both numbers so the farmer sees *why* the order changed.

### 7.4 AI — Nikhil (forecast) + Nilesh (window, pledge)

| Method | Path | Body → Response |
|---|---|---|
| `GET` | `/ai/forecast?commodity_id=&market_id=&horizon=14` | → `{as_of_date, points:[{target_date, p10_paise_per_qtl, p50_paise_per_qtl, p90_paise_per_qtl}], model_card}` · `INSUFFICIENT_DATA` (422) when history < 180 rows |
| `GET` | `/ai/model-card?commodity_id=` | → `{algo, trained_at, train_rows, train_from, train_to, horizon_days, mase, coverage_80_bps, baseline:"seasonal_naive"}` |
| `POST` | `/ai/window/recommend` | ★ **THE HERO** — below |
| `POST` | `/ai/pledge/quote` | `{lot_id, days}` → `PledgeQuote \| null` |

**`POST /ai/window/recommend`**

Request:
```json
{ "commodity_id": "cmd_onion", "market_id": "mkt_lasalgaon",
  "qty_kg": 4000, "grade": "B", "lot_id": null, "horizon_days": 14 }
```

Response — **every key always present**; `pledge_quote` is a required key with a nullable value:
```json
{
  "action": "HOLD",
  "hold_days": 11,
  "confidence": "MEDIUM",
  "band_width_bps": 2140,

  "sell_now_net_paise_per_qtl": 193925,
  "hold_p50_net_paise_per_qtl": 209650,
  "hold_p10_net_paise_per_qtl": 181925,

  "expected_gain_paise": 629000,
  "worst_case_paise": -480000,

  "costs": {
    "transport_paise_per_qtl": 8000,
    "commission_paise_per_qtl": 3075,
    "storage_paise_per_qtl": 1650,
    "spoilage_paise_per_qtl": 2310,
    "loading_paise_per_qtl": 500,
    "total_paise_per_qtl": 15535
  },

  "alt_market": null,
  "pledge_quote": {
    "loan_paise": 3400000, "ltv_bps": 7000, "rate_bps_annual": 900,
    "days": 11, "interest_paise": 92200,
    "warehouse_id": "wh_niphad", "is_worthwhile": true,
    "disclaimer": "Indicative simulation — not a lender quote"
  },

  "refusal_reason": null,
  "model_card": { "mase": 0.71, "coverage_80_bps": 7840 },
  "explain_mr": "११ दिवस थांबल्यास सरासरी ₹६,२९० जास्त मिळू शकतात.",
  "explain_en": "Holding 11 days could earn ₹6,290 more on average.",
  "data_source": "AGMARKNET"
}
```

**Units — read this before you write either side of this endpoint.**

| Field | Unit | Basis |
|---|---|---|
| `sell_now_net_paise_per_qtl`, `hold_p50_net_paise_per_qtl`, `hold_p10_net_paise_per_qtl` | paise | **per quintal** — the suffix says so |
| every key inside `costs` | paise | **per quintal** — the suffix says so |
| **`expected_gain_paise`**, **`worst_case_paise`** | paise | **the whole lot.** No `_per_qtl` suffix ⇒ a total. |

```python
qty_qtl             = qty_kg // 100                                            # I2
expected_gain_paise = (hold_p50_net_paise_per_qtl - sell_now_net_paise_per_qtl) * qty_qtl
worst_case_paise    = (hold_p10_net_paise_per_qtl - sell_now_net_paise_per_qtl) * qty_qtl
```

The worked example above is arithmetically closed and you should check it: `(209650 − 193925) × 40 = 629000` and `(181925 − 193925) × 40 = −480000`. **If your response does not satisfy those two identities, one of your units is wrong** — and a 100× unit error is the single most likely bug in this endpoint.

> **The demo figure is ₹6,290, not ₹62,900.** An earlier draft of this file, both frontend mockups and the demo script all carried ₹62,900 with these same per-quintal nets. That is an **81% onion price move in eleven days**; these nets are an 8.1% move. The number was never derived from anything. ₹6,290 on four tonnes is what an 8% move actually pays, it is roughly a month of agricultural wages, and it is a number a judge can recompute from the screen. **Never put a rupee figure on a screen or a slide that you have not multiplied out by hand.**

**Refusal — the same shape, and it must be reachable with seeded data:**
```json
{
  "action": "NO_ADVICE",
  "hold_days": null, "confidence": "LOW", "band_width_bps": 5820,
  "sell_now_net_paise_per_qtl": 193925,
  "hold_p50_net_paise_per_qtl": null, "hold_p10_net_paise_per_qtl": null,
  "expected_gain_paise": null, "worst_case_paise": null,
  "costs": { "...": "still returned — costs are known even when the forecast is not" },
  "alt_market": null, "pledge_quote": null,
  "refusal_reason": "BAND_TOO_WIDE",
  "explain_mr": "पुढील १४ दिवसांचा अंदाज खूप अनिश्चित आहे. आम्ही सल्ला देणार नाही.",
  "explain_en": "The 14-day range is too uncertain here. We will not advise.",
  "model_card": { "mase": 0.71, "coverage_80_bps": 7840 },
  "data_source": "AGMARKNET"
}
```

`refusal_reason` ∈ `BAND_TOO_WIDE` · `INSUFFICIENT_HISTORY` · `STALE_DATA` · `GAIN_BELOW_COST`.

**Never 500 from this endpoint.** If the model is unavailable, degrade to `NO_ADVICE` with `refusal_reason: "INSUFFICIENT_HISTORY"`. A hero endpoint that throws in the demo is worse than one that declines.

### 7.5 Lots, grading, pools — Akash

| Method | Path | Notes |
|---|---|---|
| `POST` | `/lots` | `{commodity_id, market_id, qty_kg, harvest_date, photo_path?}` → `LotDto` |
| `GET` | `/lots` | Actor's lots only (I4) |
| `GET` | `/lots/{id}` | **404 if not owned** (I4) |
| `POST` | `/lots/{id}/assay` | 6 dims → `{score, grade, weakest_dimension, tip_mr, tip_en}` |
| `POST` | `/lots/{id}/photo` | multipart; strips EXIF GPS |
| `GET` | `/pools/{id}` | `{fpo, total_qty_kg, avg_score, members:[SplitRow], all_consented}` — read-only in Phase 1 |

### 7.6 Demands, matching, offers — Akash

| Method | Path | Notes |
|---|---|---|
| `POST` | `/demands` | Buyer only |
| `GET` | `/demands` | Open demands, filterable |
| `GET` | `/demands/{id}/matches` | ★ ranked, **includes multi-lot combinations** — see below |
| `POST` | `/offers` | `{demand_id?, lot_ids[], qty_kg, price_paise_per_qtl}` → `OfferDto` |
| `GET` | `/offers` | Actor-scoped both directions |
| `POST` | `/offers/{id}/accept` | → creates `transaction` |
| `POST` | `/offers/{id}/reject` | |
| `POST` | `/offers/{id}/counter` | ★ `{price_paise_per_qtl, note?}` → new offer, `round+1`, **409 `MAX_ROUNDS`** past 3 |
| `GET` | `/offers/{id}/thread` | Full counter chain, oldest first |

**`GET /demands/{id}/matches`:**
```json
{ "matches": [
  { "kind": "SINGLE", "lots": [{"lot_id":"lot_1","qty_allocated_kg":4000}],
    "total_qty_kg": 4000, "fill_bps": 4000, "avg_score": 682, "grade": "A",
    "distance_km": 34, "score": 0.87,
    "why_mr": "जवळचे अंतर, ग्रेड A", "why_en": "Nearby, grade A" },
  { "kind": "COMBINATION",
    "lots": [{"lot_id":"pool_3","qty_allocated_kg":6000},
             {"lot_id":"lot_7","qty_allocated_kg":3000},
             {"lot_id":"lot_9","qty_allocated_kg":1000}],
    "total_qty_kg": 10000, "fill_bps": 10000, "avg_score": 640, "grade": "B",
    "distance_km": 41, "score": 0.91,
    "why_mr": "पूर्ण मागणी भरते — एक FPO गट + २ शेतकरी",
    "why_en": "Fills the full order — one FPO batch + 2 farmers" }
] }
```
> `score` must decompose. The UI shows the `why_*` sentence. "Because the algorithm said so" is not an answer a judge accepts.

### 7.7 Escrow and disputes — Akash

| Method | Path | Notes |
|---|---|---|
| `GET` | `/tx/{id}` | Actor-scoped |
| `POST` | `/tx/{id}/transition` | `{to_status, note?}` → **FSM only** (I11). `409 INVALID_TRANSITION` on a skip. `Idempotency-Key` header required. |
| `GET` | `/tx/{id}/events` | Append-only timeline |
| `POST` | `/disputes` | `{tx_id, reason_code, description, photo_path?}` |
| `GET` | `/disputes/{id}` | + event timeline |

**Escrow FSM — the only legal transitions:**
```
CREATED ──► ESCROW_HELD ──► DISPATCHED ──► DELIVERED ──► RELEASED
   │             │               │             │
   └──► CANCELLED└──► REFUNDED   └──► DISPUTED ◄┘
                                       │
                                       ├──► RELEASED   (resolved for farmer)
                                       └──► REFUNDED   (resolved for buyer)
```
Anything not on this diagram is `409`.

### 7.8 Meta — Kartik

| Method | Path | Notes |
|---|---|---|
| `GET` | `/meta/health` | `{ok, db, model_loaded, latest_obs_date}` |
| `GET` | `/meta/data-provenance` | ★ Per commodity/market: row counts by `source`, date range, `source_url`. **Back this with a screen.** Volunteering provenance beats being asked for it. |

---

## 8. Pledge finance — the arithmetic and the guardrail

```python
loan_paise     = assessed_value_paise * ltv_bps // 10000
interest_paise = loan_paise * rate_bps_annual * days // (10000 * 365)
is_worthwhile  = expected_gain_paise > interest_paise      # (I13)
```

Rules that are not negotiable:

1. **`is_worthwhile == False` → the API returns `pledge_quote: null`.** The UI never receives a card it shouldn't show. Enforced server-side.
2. Every surface says **"Indicative simulation — not a lender quote."**
3. **No specific LTV % or interest rate appears on any slide until Kartik has read it off WDRA's own published terms and recorded the source URL** in `03_DATA_ARCHITECTURE.md`. Until then the demo uses a clearly-labelled illustrative figure. Getting a government scheme's terms wrong in front of a government panel is worse than saying "indicative".
4. Phase 1 creates **no** `enwr` records and touches no lender. It is a computation and a card.

---

## 9. Grading — the deterministic score

Six questions, one per screen, each answerable by looking at the produce. No CV model in Phase 1 (see `04_AI_ARCHITECTURE.md` §Why not CV).

| Dimension | Answers | Weight |
|---|---|---|
| `size_uniform` | 3 = very even · 2 = mixed · 1 = very mixed | 200 |
| `colour_uniform` | 3 = even · 2 = some patches · 1 = many patches | 150 |
| `sprouting` | 3 = none · 2 = a few · 1 = many | 200 |
| `damage_pct` | 0–100, entered on a slider | 250 |
| `moisture_feel` | 3 = dry · 2 = slightly damp · 1 = damp | 100 |
| `foreign_matter` | 3 = clean · 2 = some soil · 1 = a lot | 100 |

```
score = 200*(size-1)/2 + 150*(colour-1)/2 + 200*(sprout-1)/2
      + 250*(1 - damage_pct/100) + 100*(moist-1)/2 + 100*(fm-1)/2      # 0..1000

grade = 'A' if score >= 750 else 'B' if score >= 500 else 'C'
grade_multiplier = {'A': 1.00, 'B': 0.92, 'C': 0.80}
weakest_dimension = the dimension contributing the largest shortfall vs its weight
```

The tip is the payoff: *"तुमचा माल ग्रेड B आहे. माती काढून चाळल्यास ग्रेड A मिळू शकतो — अंदाजे ₹८० प्रति क्विंटल जास्त."*

---

## 10. FPO grade-weighted split — the arithmetic

```
weight_i    = qty_kg_i * grade_multiplier(score_at_pool_i)
share_bps_i = floor(10000 * weight_i / Σ weight)
# distribute the rounding remainder to the largest weight so Σ share_bps == exactly 10000
```

Two rules:
- **`score_at_pool` is a snapshot.** A regrade after pooling must not retroactively change an agreed split.
- **Pareto guard:** if any member's pooled share is worth less than selling their lot alone (`vs_solo_paise < 0`), the pool does not form and the UI says why. *A pooling mechanism that can quietly harm a member is exactly what FPOs are distrusted for.*

Phase 1 ships this as **seeded rows + one read-only screen**. The arithmetic must be genuinely correct in the seed. The *forming* flow and live consent are Phase 2.

---

## 11. Ownership map — who may edit what

**You may create, edit or delete only files under paths your name owns.** Need a change elsewhere? Append to `docs/BLOCKERS.md`, stub it locally with `TODO(<name>):`, keep moving. Do not edit another person's file, not even a one-line fix.

| Path | Owner |
|---|---|
| `docs/architecture/00_CANON.md` | **Akash** (with Kartik) — frozen at H2 |
| `docs/architecture/0*.md`, `1*.md` | the named owner in each file's header |
| `docs/BLOCKERS.md` | **everyone**, append-only |
| `ingest/**`, `seed/**` | **Kartik** |
| `infra/**`, `docker-compose.yml`, `nginx/**`, `.env.example` | **Kartik** |
| `api/app/core/**`, `api/app/models/**`, `api/alembic/**` | **Akash** |
| `api/app/routers/{auth,lots,demands,offers,tx,disputes,pools}.py` | **Akash** |
| `api/app/routers/{ref,prices,meta}.py` | **Kartik** |
| `api/app/routers/ai.py` | **Nilesh** |
| `api/app/ml/**` (features, training, quantile model, model card) | **Nikhil** |
| `api/app/domain/window.py`, `costs.py`, `pledge.py` | **Nilesh** |
| `api/app/domain/{escrow,matching,grading,split}.py` | **Akash** |
| `app/src/screens/farmer/**`, `app/src/components/farmer/**` | **Pranay** |
| `app/src/screens/buyer/**`, `app/src/components/ui/**`, `app/src/i18n/**`, `app/src/lib/voice.ts` | **Shreya** |
| `app/assets/audio/**` | **Shreya** |

If a path isn't listed, it's Akash's. Ask.

---

## 12. Definition of done — all six, not four

1. The endpoint or screen works against **seeded/ingested data with zero external network calls**.
2. Pydantic validates every input; invalid input returns a coded 400, not a 500.
3. Another actor's id returns **404**, never their data. **You have tested this by hand with curl.**
4. Money is integer paise the whole way through. You have grepped your diff for `float`, `/ 100`, `round(`, `toFixed`.
5. Empty, loading and error states all render — not just the happy path.
6. Marathi strings exist for anything a farmer sees. Committed and pushed.
