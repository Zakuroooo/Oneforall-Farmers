# Backend alignment status — read at `efea078`

**Reviewed:** 2026-09-06 · `akashg7/Neolithic-Backend` @ `efea078acdaec4280e5e6d8ecda60c81c234b164`
**Previous review:** `9137d75` (the one that produced `frontend_doubts.md`)
**Reviewer:** Pranay (frontend), against `app/src/types/api.ts` in this repo.

Everything below cites Akash's files by path. Where I say "ours", I mean
`app/src/types/api.ts` — which, since the four backend/AI members are working in a
separate repo, is the frontend's operative wire contract until merge.

---

## 0. The number, up front

| | Ready |
|---|---|
| **Contract *shape*** — field names, types, enums, envelope, paths | **≈ 75 %** |
| **Contract *behaviour*** — does the response carry usable numbers | **≈ 20 %** |
| **Blended, from the frontend's point of view** | **≈ 45 %** |

The shape moved a long way in one pass. The behaviour did not move, and the hero
endpoint is currently worse than a fixture: it answers every question with
`SELL_NOW`, zero gain, zero worst case, zero costs, and no Marathi sentence.
Section 3 shows why that is arithmetic, not a bug I am guessing at.

**Nothing here blocks our frontend today.** We are on fixtures by design and every
screen is built to be indistinguishable from live. This document is the merge
punch-list, not a stop-work.

---

## 1. What Akash fixed — all five blockers, confirmed at source

| | Was | Now | File |
|---|---|---|---|
| **B1** role casing | `^(farmer\|buyer\|fpo_admin)$` | `^(FARMER\|BUYER\|FPO_ADMIN)$` + a `role_upper` validator on both user schemas | `app/schemas/auth.py` |
| **B2** `id: int` | `UserResponse.id: int` | `id: str` + `id_to_str` validator | `app/schemas/auth.py` |
| **B3** password auth | `POST /auth/login {phone, password}` | `POST /auth/otp/request` → `POST /auth/otp/verify` → `POST /auth/register {…, code}`. Password gone. `bcrypt` hash in `otp_codes`, 120 s TTL, 5-attempt cap, `dev_otp` echoed only outside production | `app/schemas/auth.py`, `app/routers/auth.py`, `app/services/auth_service.py` |
| **B4** error envelope | three different shapes | one `RequestValidationError` handler → 400 and one `StarletteHTTPException` handler, both emitting `{"error": {"code", "message", "field"}}` with a sensible status→code map | `app/main.py` |
| **B5** no `/api/v1` | bare `/auth`, `/lots`, … | every router mounted `prefix="/api/v1/…"` | `app/main.py` |

Also landed unasked and correct: `locale` replaced `preferred_language`, default `mr`.
`gst_last4` is four digits, not a GSTIN. `on_time_payment_bps` / `renegotiation_bps`
are integer bps, not floats. `voice.py` is an empty router — exactly right, I7 holds.
`app/routers/meta.py` `/health` returns `db` / `model_loaded` / `latest_obs_date`.
`price_engine` now stamps `source: "SYNTHETIC"` on every row, so **I8 is satisfiable
on the wire** and our badge has something to read.

That is a real pass. B1 and B3 alone were the difference between "the farmer app is
unreachable" and "onboarding works".

---

## 2. Field-level mismatches — mechanical, cheap, mine or his

### 2.1 `WindowRes` — seven renames/retypes (`app/schemas/ai.py`)

| His | Ours | Who should move |
|---|---|---|
| `recommendation` | **`action`** | **His.** Ours is read as `action` by S9, S10, S11 and the fixture set. |
| `itemised_costs` | **`costs`** | **His**, same reason. |
| `pledge_quote: Optional[int]` | `PledgeQuote \| null` — an **object** of 7 fields | His |
| `alt_market: Optional[str]` | `AltMarket \| null` — an **object** of 4 fields | His |
| `explain_mr` / `explain_en`: `Optional[str]` | **non-nullable `string`** | His — see 3.3, this is I16-adjacent |
| `ModelCard {mase, coverage_80_bps}` | `ModelCardSummary` — same two fields | ✅ already matches |
| `hold_p50/p10_net…`, `expected_gain_paise`, `worst_case_paise`: `int` | all `number \| null` | Either. `int` is a strict subset; safe until a refusal needs to null them. |

Already correct and worth saying so: the five-value `recommendation` Literal, all
**six** per-quintal cost keys, `confidence` as `LOW|MEDIUM|HIGH`, `band_width_bps` as
an int, and the **correct four** `refusal_reason` values including `GAIN_BELOW_COST`.
`WindowReq` matches ours field-for-field including `qty_kg` and `lot_id: Optional`.

### 2.2 `id: int` was fixed in exactly one place

`UserResponse.id` is now `str`. Every other id on the wire is still an integer:

- `app/schemas/ref.py` — `DistrictOut.id`, `CommodityOut.id`, `WarehouseOut.id`, `MandiOut.id`, `district_id` → all `int`
- `app/schemas/lot.py` — `LotOut.id`, `commodity_id`, `market_id`, `warehouse_id`, `SelfAssayResponse.lot_id` → all `int`
- `app/schemas/auth.py` — `district_id: Optional[int]` (no coercing validator, unlike `id`)
- path params — `lots/{lot_id}` is typed `lot_id: int`

Ours are `string` everywhere. This is the bug that compiles clean and breaks at the
first template-literal cache key. It also means our fixture ids (`lot_listed_1`,
`cmd_onion`) will 422 against his path/query validators. **One `str` + one
`field_validator` per schema; `MandiOut.lat/lng` also needs `lng` → `lon` to match ours.**

### 2.3 `/lots` — the 100× hazard, again

`app/schemas/lot.py` uses **`quantity_qtl`**. Ours is **`qty_kg`** (I2: store kg,
display quintals). A silent unit swap on a create path is exactly the class of error
that puts a 100× number on screen. `LotOut` is also missing `farmer_id`,
`harvest_date`, `created_at`, and calls the photo `image_url` where ours is
`photo_path`. `LotOut.grade`/`status` are unconstrained `str` — ours are closed
unions of four and six values, and `UNGRADED` must survive as its own value rather
than arriving as `null`.

### 2.4 `/auth/me` shape

He returns `UserDetailResponse` **flat**. Our client is
`getMe = () => get<{ user: User }>('/auth/me')` — wrapped. One of the two wraps;
his `AuthResponse` already wraps as `{user, token}`, so wrapping `/auth/me` is
consistent with his own file.

### 2.5 `/meta/init` will 500 on every call

`app/routers/meta.py` — `AppInitRes` declares `commodities` as **required**,
`comm_out` is computed, and then `return AppInitRes(roles=roles, markets=mandis_out)`
omits it. Pydantic raises. We do not call this route, so it costs us nothing, but it
is a one-word fix and it will look bad in a live demo.

### 2.6 `/meta/data-provenance` is a different object

He returns `{"sources": [...], "last_sync": "..."}`. Ours is
`{rows: ProvenanceRow[], generated_at}` — per-(commodity, market) row counts with
`first_obs_date`, `last_obs_date`, `source`, `source_url`. S24 renders the table;
a flat list of source names gives it nothing to draw. Low priority: S24 is on
fixtures and stays there.

### 2.7 `random`, not `secrets` (I15)

`app/services/auth_service.py:18` — `code = f"{random.randint(0, 999999):06d}"`.
The hashing and TTL around it are right; the generator is not. `secrets.randbelow`,
one line.

---

## 3. The hero endpoint — the part that actually matters

`POST /api/v1/ai/window/recommend` now exists, is reachable, calls
`compute_sale_window`, and the `@cache(expire=3600)` is gone. Four problems, in
descending order of consequence.

### 3.1 It returns `SELL_NOW` with all zeros, for every input

This is arithmetic from his own constants, not a hunch. `app/engines/window_engine.py`:

- `sell_now_net = current_price_mid_paise` — **no costs subtracted**, and the comment says so ("ignoring baseline transport for simplicity")
- every hold day subtracts commission (2.5 % ≈ ₹52/qtl), loading (₹20/qtl), storage, spoilage and transport

So the hold branch is charged for commission and loading that apply *either way*,
and `sell_now` is not. On onion at ₹2,100/qtl, day 1 costs ≈ ₹82/qtl against a
0.3 %/day drift of ≈ ₹6/qtl. `gain` is negative on day 1 and stays negative through
day 14. `best_gain` never exceeds 0 → the `best_day is None or best_gain <= 0`
branch always fires → the response is:

```
recommendation: "SELL_NOW", confidence: "HIGH", band_width_bps: 2000,
expected_gain_paise: 0, worst_case_paise: 0,
itemised_costs: {all six keys: 0},
explain_mr: null, explain_en: null, hold_days: null
```

S9 renders "₹0 expected, ₹0 worst case", S10's cost breakdown is six zeroes, and
there is no Marathi sentence. He was told this on the old `SELL` branch and it
survived the rewrite. **Fix: subtract the always-applicable costs from `sell_now_net`
too, and populate `itemised_costs` with today's real numbers on the SELL_NOW branch.**

### 3.2 `NO_ADVICE` is unreachable — I6 cannot be demonstrated

`price_engine.predict` hardcodes `p10 = 0.90 × p50`, `p90 = 1.10 × p50`. So
`band_width_bps = (p90 − p10) / p50 × 10000` is **always exactly 2000**.
`predict_range` scales all three quantiles by the same trend, so the ratio never
moves. The refusal threshold is 2500. The band can never cross it.

`confidence` is likewise pinned: `0.85` fixed → always `"HIGH"`.

`docs/architecture/00_CANON.md` I6 and `CLAUDE.md` §2 both call I6 one of the two a
judge will actually test — *"they will ask what happens when the model is wrong"*.
Right now the answer is that it structurally cannot say it does not know. **The
quantile spread has to vary with the data, or the demo lot has to be seeded so that
one commodity/market pair genuinely produces a wide band.**

### 3.3 No `explain_mr` on the success paths

`window_engine` sets `explain_mr` / `explain_en` **only** inside the
`NO_ADVICE` branch. `SELL_NOW` and `HOLD` return `null` for both. Ours types them
non-nullable and renders them verbatim — we do not translate client-side, by design.
A farmer-facing recommendation with no Marathi sentence is not shippable, and per
`CLAUDE.md` §8.6 Marathi strings must exist for anything a farmer sees.

### 3.4 Three smaller things in `app/routers/ai.py`

- `price_engine.predict(payload.market_id, payload.commodity_id, "")` — the signature is `predict(self, mandi, commodity, date)`. **Market and commodity are swapped.** The result: `base_prices.get(market_id.lower(), 200000)` never matches a crop name, so *every* lot silently falls back to ₹2,000/qtl, and the mandi factor is computed from the commodity string. Both inputs are being read as the other.
- `distance_km = 50.0`, hardcoded, comment "Assume distance is 50km for stub". Combined with `transport = 50 paise/km × 50 km ÷ 40 qtl` that is **₹0.62 per quintal** of transport. Real is two orders of magnitude higher. S10 shows this number to a judge.
- `except Exception: current_mid = 200000` — a model failure produces a confident fabricated price instead of `NO_ADVICE` / `INSUFFICIENT_HISTORY`. Same hazard as the `except Exception: pass` still wrapped around `load_models()` in `main.py`.

### 3.5 Two of five actions are unreachable

`SELL_ELSEWHERE` and `SPLIT` are in the Literal but nothing in `window_engine`
emits them, and `alt_market` is hardcoded `None`. Fine for now — S9 handles all five
and our fixtures cover the missing two — but the enum currently overstates the engine.

---

## 4. Prices and reference — closest to done

`app/routers/prices.py` `/series` is genuinely good: `PricePoint` matches ours
field-for-field, `source` is whitelisted against our five `DataSource` values with an
`IMPUTED` fallback, `source_summary` counts by source, `latest_obs_date` is real.
That unblocks S5's provenance badge cleanly.

`/nearby` has the right shape — all six per-quintal keys, `market_id` stringified,
sorted by `net_paise_per_qtl` descending, which is the product — but every number is
a hardcoded mock (`gross = 250000`, `transport = 15000`, `distance_km = 45` for every
market). S6's whole point is that a nearer mandi paying less gross can outrank a
distant one; with constant inputs the ordering carries no information.

`app/routers/ref.py` has all four lists we asked for. Only the `int` ids and
`lng`→`lon` stand between it and drop-in usable.

---

## 5. What I need from him next, in order

1. **`recommendation` → `action`, `itemised_costs` → `costs`.** Two renames, unblocks a mechanical diff of everything else.
2. **Fix the swapped args** in `ai.py` — `predict(mandi=market_id, commodity=commodity_id)`. One line, and until it lands every price in the system is the ₹2,000 fallback.
3. **Subtract always-applicable costs from `sell_now_net`, and return real `itemised_costs` on the SELL_NOW branch.** Without this the hero is ₹0/₹0 forever.
4. **`explain_mr` + `explain_en` on every branch**, not just refusals.
5. **Make the band vary** so `NO_ADVICE` is reachable, or tell me which seeded (commodity, market) pair will trigger it so I can point the demo at it.
6. **`str` ids everywhere** — `ref.py`, `lot.py`, `district_id`, and the `{lot_id}` path params. Plus `lng` → `lon`.
7. **`quantity_qtl` → `qty_kg`** on `LotCreate`/`LotOut`, and add `farmer_id`, `harvest_date`, `created_at`; rename `image_url` → `photo_path`.
8. **`pledge_quote` and `alt_market` as objects**, or explicitly `null` forever and I keep them on fixtures.
9. **`secrets` instead of `random`** for the OTP.
10. **`openapi.json`.** Still the single artifact that ends all of this. `curl localhost:8000/openapi.json` once the API boots, commit it, and I diff mechanically instead of reading files by hand.

Items 1–5 are the hero. If he only does those five, the demo has a real
recommendation. 6–9 are merge-day work. 10 makes every future round of this cheap.

**Explicitly not asking for:** offers, counter-offers, escrow FSM, disputes, buyer
reliability, the realisation ledger, pools. Those stay on our fixtures permanently
and the screens are built to be indistinguishable from live. `voice.py` stays empty.

---

## 6. Where that leaves us

Nothing in this document changes what I build this week. Fixtures are the plan until
merge, `USE_FIXTURES` and `FIXTURE_LOTS_EMPTY` are the switches, and the frontend
contract in `app/src/types/api.ts` is the thing both sides converge on.

The honest summary for a status update: **the wire contract is about three-quarters
aligned and the remaining quarter is mechanical renames. The numbers behind it are
not yet real, and the refusal path — the one thing we tell judges is the product —
cannot currently fire.** Those are two different problems and only the second one is
hard.
