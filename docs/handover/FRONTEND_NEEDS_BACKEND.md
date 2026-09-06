# What the frontend needs from the backend — Akash + Kartik

**From:** Pranay (frontend lead, farmer app S1–S16) + Shreya (buyer console S17–S27)
**To:** Akash (auth, lots, demands/offers, escrow, disputes) + Kartik (reference, prices, meta, seed)
**Written:** 2026-09-06 · **Source of truth:** `docs/architecture/00_CANON.md` §6–§7
**Companion doc:** `docs/handover/FRONTEND_NEEDS_AI.md` (Nikhil + Nilesh)

---

## 0. Why this document exists — read this before anything else

The app and the API are being built **in two separate repositories**. Neither side can
see the other's code. This file is therefore not a task list and not a blocker report —
it is the **integration contract**: the exact set of paths, request bodies, response
shapes, status codes and units the frontend already reads, so that at merge time the API
can be conformed to it (or this file corrected) **without touching a single screen**.

Six rules that govern every line below.

1. **`snake_case` on the wire, end to end.** The frontend reads `expected_gain_paise`
   directly off the JSON. There is no camelCase mapping layer and we are not adding one.
   If a field arrives as `expectedGainPaise` it is `undefined` on the screen.
2. **Money is an integer number of paise (I1).** Never a float, never rupees, never a
   string. Every money field ends `_paise` or `_paise_per_qtl`. The app formats only at
   the render edge via `formatPaise()`.
3. **Quantity is an integer number of kilograms (I2).** Fields end `_kg`. 1 qtl = 100 kg.
   We store kg and display quintals. Rates and shares are **basis points** (I3),
   10000 bps = 100%, fields end `_bps`.
4. **Every key in a response object is always present.** Optional-in-some-states fields
   are `T | null`, never absent. A missing key and a null key are different bugs and the
   second one is the one we can render. This is already enforced in our types.
5. **Not-owned returns `404`, never `403` (I4).** A 403 confirms the row exists. Every
   `GET /lots/{id}`, `GET /tx/{id}`, `GET /offers/{id}` for another actor's row must be
   indistinguishable from a row that does not exist.
6. **If a field is not in CANON §7, we do not have a type for it** and no screen reads
   it. Adding a field is cheap; changing one after both sides ship is not. Answer the
   open questions in §10 rather than inventing a shape.

**What already exists on our side.** `app/src/types/api.ts` (297 lines) is the
transcribed contract for CANON §7.1–§7.4 and is what the app compiles against today.
`app/src/lib/api.ts` is the single fetch layer. Fixtures shaped exactly like the
contract live in `app/src/fixtures/` — `auth.ts`, `prices.ts`, `nearby.ts`,
`forecast.ts`, `window.ts`. **There are no fixtures and no types yet for §7.5–§7.8**
(lots, demands, offers, escrow, disputes, meta) because CANON names the DTOs
(`LotDto`, `OfferDto`, `SplitRow`) without ever defining them. Closing that is the
single highest-value thing this document asks for — see §10.

---

## 1. Transport, auth header, error envelope

- Base path **`/api/v1`**. Every path below is relative to it.
- Auth: `Authorization: Bearer <jwt>`. The app is React Native — there is no cookie
  path, no CORS preflight to worry about, and no web build.
- The JWT must carry a **`role` claim of `FARMER` or `BUYER`**. This is the *only*
  input to the root navigator: `RootNavigator` reads `user.role` and mounts
  `FarmerTabs` or `BuyerTabs`. There is no role picker in the UI and there must not be
  one — a picker is a security hole a judge will find. If `role` is absent or is a
  value we do not know, we treat the session as invalid and sign out.
- `Content-Type: application/json` on every request that has a body, except
  `POST /lots/{id}/photo` which is `multipart/form-data`.

**The error envelope — every failure, no exceptions:**

```json
{ "error": { "code": "LOT_NOT_FOUND", "message": "…", "field": null } }
```

`message` is what we show the user when we have nothing better, so **it must be safe to
display**: no stack traces, no SQL, no internal identifiers. `field` is non-null only on
`VALIDATION_FAILED` and names the offending request field so we can attach the error to
the right input.

| Code | HTTP | What the app does with it |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Shows the error under the named `field`. Does not retry. |
| `UNAUTHENTICATED` | 401 | Clears the token, drops to `AuthStack`. Does not retry. |
| `FORBIDDEN` | 403 | Generic error state. Should be rare — wrong **role**, not wrong owner. |
| `NOT_FOUND` | 404 | "Not found" empty state. Also what we get for another actor's row (I4). |
| `CONFLICT` | 409 | FSM/round-cap refusals. We show the reason and re-fetch. |
| `RATE_LIMITED` | 429 | OTP throttle. We show a wait message. Does not retry. |
| `INSUFFICIENT_DATA` | 422 | Only from `/ai/forecast`. See the AI doc. |
| `INTERNAL` | 500 | Generic error state + retry button. |

**Our retry policy, so you know what load to expect:** TanStack Query retries **network
errors and 5xx only**. We never auto-retry a 4xx — a 400 or a 404 is a fact, not a
transient. Please do not return 500 for a business refusal; a 409 with a code is what
lets us write a useful message.

---

## 2. §7.1 Auth — Akash

Screens: **S1** language, **S2** phone + OTP, **S3** profile, **S17** buyer login.
Client functions already written: `requestOtp`, `verifyOtp`, `register`, `getMe`.

| Method | Path | Body → Response |
|---|---|---|
| `POST` | `/auth/otp/request` | `{phone}` → `{ok, expires_in_s, dev_otp?}` |
| `POST` | `/auth/otp/verify` | `{phone, code}` → `{token, user}` |
| `POST` | `/auth/register` | `{phone, code, name, role, locale, district_id}` → `{token, user}` |
| `GET` | `/auth/me` | → `{user}` |
| `POST` | `/auth/locale` | `{locale}` → `{ok}` |

```ts
interface OtpRequestRes { ok: boolean; expires_in_s: number; dev_otp?: string }
interface AuthRes { token: string; user: User }
interface User {
  id: string; phone: string; name: string;
  role: 'FARMER' | 'BUYER';
  locale: 'mr' | 'hi' | 'en';
  district_id: string;
}
```

Notes and requirements:

- **`expires_in_s` drives our countdown.** It is seconds, an integer. We render the
  resend button when it hits zero. If it is absent we cannot show a timer.
- **`dev_otp` must be present only when `DEV_OTP_ECHO=1` and `ENV != production`.** We
  render it on S2 in dev to make the demo fast. It must never appear in a production
  response; we do not gate on the build, we gate on the field being absent.
- **Wrong code and unknown phone must return the identical error.** Different errors are
  a phone-number oracle.
- **We never log the phone or the OTP (I14)** and we never put them in navigation state.
  They travel between S2 and S3 through a module-level holder
  (`setPendingAuth`/`getPendingAuth`/`clearPendingAuth` in `app/src/lib/auth.tsx`),
  never a route param, because route params are serialized into the navigation state
  tree and shown in the dev-menu state inspector. Nothing needs to change server-side
  for this; it is recorded so nobody "helpfully" adds the phone to a response we then
  persist.
- **No Aadhaar, anywhere, ever (I9).** Not in a request, not in a response, not in seed.
  Phone is the identifier. If any field in the user object could carry one, remove it.
- The OTP throttle is **3 per phone per 10 min**, max **5 verify attempts**. We show a
  wait message on 429; please make `message` say roughly how long.

### 2.1 Two contract conflicts in auth that we found and cannot fix from our side

**(A) `locale` — the DB will reject `hi`.** CANON §6.2 defines
`users.locale text not null default 'mr' check (locale in ('mr','en'))` — **two values**.
But CANON §7 and the project brief both specify three locales (`mr` · `hi` · `en`),
`app/src/types/api.ts` declares `Locale = 'mr' | 'hi' | 'en'`, and **S1 offers हिंदी as
one of three buttons**. A farmer who picks Hindi and registers will hit that CHECK
constraint. Either the CHECK becomes `('mr','hi','en')` or S1 loses a button — and
losing it is the wrong answer for a Maharashtra + Hindi-speaking-migrant audience.
**We are proceeding on the assumption that the CHECK gains `'hi'`.** Please confirm, and
make `POST /auth/locale` and `POST /auth/register` both accept all three.

**(B) The `user` object is never defined in CANON.** §7.1 says the response is
`{token, user}` and stops. We had to derive `User` ourselves, and the derivation is
already a **join, not a table**: `users` carries `id/phone/role/name/locale`, while
`district_id` lives on `farmers` (and on `buyers`). Our `User` flattens both. Two things
follow that only you can settle:

- **Is `district_id` on the user object?** We need it: S5/S6/S7 pass it to
  `/prices/nearby` and `/ref/markets` without asking the farmer again. If you drop it,
  every price screen gains a picker it should not have.
- **Is `village` on it?** `farmers.village text` exists in §6.2. Shreya's demo-user
  object added `village`, our `User` does not have it, and that was a compile error we
  resolved by **removing the field** rather than inventing one — per our own rule that
  nothing enters the contract that CANON §7 does not define. If you want the village on
  screen (it is good for the S3 confirmation and for buyer trust on S20), add it as
  `village: string | null` and tell us; we are not going to guess.

Also please confirm what a **BUYER**'s user object looks like. `buyers` has
`business_name`, `tier`, `gst_last4` — none of which are on our `User`. S17/S18 and the
buyer top bar currently render `user.name`. If a buyer's display name should be
`business_name`, either map it into `name` server-side or add the field explicitly.

---

## 3. §7.2 Reference data — Kartik

Screens: **S3** district picker, **S5/S6** market + commodity selection, **S11** pledge
warehouse name, **S10** cost breakdown attribution.

| Method | Path | Response |
|---|---|---|
| `GET` | `/ref/districts` | `[{id, name, name_mr}]` |
| `GET` | `/ref/markets?district_id=` | `[{id, name, name_mr, district_id, lat, lon}]` |
| `GET` | `/ref/commodities` | `[{id, name, name_mr, storable_days}]` |
| `GET` | `/ref/warehouses?district_id=` | `[{id, name, name_mr, wdra_registered, rent_paise_qtl_month, source}]` |
| `GET` | `/ref/logistics?from_district_id=&to_market_id=` | `[{transport_paise_per_qtl, commission_bps, loading_paise_per_qtl, source}]` |

We already have types for the first three:

```ts
interface District  { id: string; name: string; name_mr: string }
interface Market    { id: string; name: string; name_mr: string;
                      district_id: string; lat: number; lon: number }
interface Commodity { id: string; name: string; name_mr: string; storable_days: number }
```

Requirements:

- **These five are the only endpoints the app calls before a token exists** (districts is
  needed on S3, which runs mid-registration). Please confirm `/ref/districts` is
  reachable unauthenticated, or tell us it needs the pending token and we will thread it.
- **`name_mr` is mandatory and must never be empty.** Marathi is the default locale and
  the farmer app renders `name_mr` first, falling back to `name`. An empty `name_mr`
  renders a blank row, which reads as a bug on stage.
- **Two arrays we do not have types for yet: warehouses and logistics.** We will write
  them from the shapes above unless you correct them. Note `rent_paise_qtl_month` is the
  only money field in the whole contract that does **not** follow the
  `_paise_per_<unit>` pattern — if you can rename it `rent_paise_per_qtl_month`, do; if
  the API is already shipped with it, say so and we will match yours exactly.
- **`commission_bps` in `/ref/logistics` is basis points**, but the same concept arrives
  as `commission_paise_per_qtl` in `/prices/nearby` and in `WindowCosts`. Both are
  correct in their place (a rate vs an applied amount) — we just need it stated once,
  because a screen that shows "commission" in two places must not show two different
  numbers. See §10 Q6.
- `storable_days` drives whether HOLD is even offerable for a commodity, so it must be
  real per commodity, not a constant.

---

## 4. §7.3 Prices — Kartik

Screens: **S5** price history chart + provenance badge, **S6** nearby mandis,
**S7** arrivals. Client functions: `getPriceSeries(commodity_id, market_id, days = 180)`,
`getNearbyMarkets(commodity_id, district_id)`.

| Method | Path | Response |
|---|---|---|
| `GET` | `/prices/series?commodity_id=&market_id=&days=180` | `PriceSeriesRes` |
| `GET` | `/prices/nearby?commodity_id=&district_id=` | `NearbyRes` — **sorted by net, descending** |

```ts
type DataSource = 'AGMARKNET' | 'MSAMB' | 'ARCHIVE' | 'IMPUTED' | 'SYNTHETIC';

interface PricePoint {
  obs_date: string;              // ISO date, 'YYYY-MM-DD' — not an epoch int, not a datetime
  min_paise_per_qtl: number;
  max_paise_per_qtl: number;
  modal_paise_per_qtl: number;
  arrivals_qtl: number;
  source: DataSource;
}
interface PriceSeriesRes {
  points: PricePoint[];
  source_summary: Partial<Record<DataSource, number>>;  // row counts by source
  latest_obs_date: string;
}
```

**`DataSource` has exactly these five values** and they come from the `price_obs.source`
CHECK constraint in CANON §6.3. An earlier draft of our own types had `GENERATED` and
`MANUAL`, which exist nowhere; they are gone. Two architecture docs each quote a
different 4-of-5 subset of this list — **CANON's schema wins.** If you add a sixth
source, that is a contract change and we need to know, because of the next point.

**`source` and `source_summary` are not decoration — they are invariant I8.** The UI
badges any row whose source is not `AGMARKNET` or `MSAMB`, and S5's provenance badge is
derived from `source_summary`, not hardcoded. Showing unlabelled synthetic data to a
government panel is the one unrecoverable mistake available to this team, so:

- every point must carry a truthful `source`;
- `source_summary` must be real row counts, summing to `points.length`;
- if a series is entirely `IMPUTED` or `SYNTHETIC`, say so in the data — do not
  launder it to `ARCHIVE` to make the badge go away.

`latest_obs_date` is what we use to decide the **stale-data banner**. It must be the max
`obs_date` actually present in `points`, not "today".

### 4.1 `/prices/nearby` — the differentiator, get it exactly right

```ts
interface NearbyMarketRow {
  market_id: string;
  name_mr: string;
  gross_paise_per_qtl: number;
  transport_paise_per_qtl: number;
  commission_paise_per_qtl: number;
  net_paise_per_qtl: number;      // gross − transport − commission − loading
  distance_km: number;
  source: DataSource;
}
interface NearbyRes {
  as_of_date: string;
  rows: NearbyMarketRow[];
  sorted_by: 'net_paise_per_qtl';   // literal — we assert on it
}
```

- **`rows` must arrive already sorted by `net_paise_per_qtl` descending.** We do not
  re-sort client-side, deliberately: if the ordering is the insight, the ordering is the
  server's answer and must be identical on every client. `sorted_by` is a literal type in
  our code — if it ever says anything else, the build fails, which is the point.
- **The whole point is that a nearer mandi paying less gross can outrank a distant one
  paying more.** S6 renders gross *and* net side by side so the farmer sees why the order
  changed. That means we need **every** component: gross, transport, commission, and the
  net. Sending only net makes the screen unexplainable.
- **`net = gross − transport − commission − loading`, but there is no `loading` field in
  this row.** The worked example in CANON §7.3 closes without it
  (`205000 − 8000 − 3075 = 193925`), so loading is zero there and we cannot tell whether
  it is genuinely absent from this endpoint or silently folded in. See §10 Q5 — if
  loading is ever non-zero, S6's four numbers will not add up on screen and a judge doing
  the arithmetic will catch it.
- `distance_km` is a plain integer number of km. Not metres, not a float.
- `as_of_date` is an ISO date and drives the "as of" line on S6.

---

## 5. §7.5 Lots, grading, pools — Akash · **NO DTO IS DEFINED ANYWHERE**

Screens: **S12** create lot, **S13** six-question self-assay, **S15** my lots + status
timeline, **S16** FPO grade-weighted split, **S20** lot detail (buyer side).

| Method | Path | Body → Response |
|---|---|---|
| `POST` | `/lots` | `{commodity_id, market_id, qty_kg, harvest_date, photo_path?}` → `LotDto` |
| `GET` | `/lots` | → actor's lots only (I4) |
| `GET` | `/lots/{id}` | → `LotDto`, **404 if not owned** (I4) |
| `POST` | `/lots/{id}/assay` | 6 dims → `{score, grade, weakest_dimension, tip_mr, tip_en}` |
| `POST` | `/lots/{id}/photo` | multipart; **strips EXIF GPS** |
| `GET` | `/pools/{id}` | → `{fpo, total_qty_kg, avg_score, members: SplitRow[], all_consented}` |

CANON names `LotDto` and `SplitRow` and **never defines either one**. Below is what we
will write into `app/src/types/api.ts` and build S12–S16 and S20 against, derived from
the `lots` / `grade_assays` / `pools` / `pool_members` DDL in CANON §6.4.
**Treat it as a proposal: confirm it, or send back the real one and we will match yours.**

```ts
// PROPOSED — from CANON §6.4 `lots`
interface LotDto {
  id: string;
  farmer_id: string;
  commodity_id: string;
  market_id: string;            // intended mandi
  qty_kg: number;
  grade: 'A' | 'B' | 'C' | 'UNGRADED';   // note the fourth value — not the Grade type
  harvest_date: string | null;  // ISO date
  photo_path: string | null;
  status: 'DRAFT' | 'LISTED' | 'POOLED' | 'OFFERED' | 'COMMITTED'
        | 'IN_TRANSIT' | 'DELIVERED' | 'SETTLED' | 'CANCELLED';
  created_at: string;           // ISO 8601 timestamp
}

// PROPOSED — the assay response. Already fully specified in CANON §7.5 + §9.
interface AssayRes {
  score: number;                       // 0..1000, integer
  grade: 'A' | 'B' | 'C';
  weakest_dimension: 'size_uniform' | 'colour_uniform' | 'sprouting'
                   | 'damage_pct' | 'moisture_feel' | 'foreign_matter';
  tip_mr: string;                      // rendered verbatim
  tip_en: string;
}
```

```ts
// PROPOSED — the assay request. Six integers, one per S13 question.
interface AssayReq {
  size_uniform: 1 | 2 | 3;
  colour_uniform: 1 | 2 | 3;
  sprouting: 1 | 2 | 3;
  damage_pct: number;      // 0..100 integer, from a slider
  moisture_feel: 1 | 2 | 3;
  foreign_matter: 1 | 2 | 3;
}

// PROPOSED — from CANON §6.4 `pool_members` + §7.5 `/pools/{id}`
interface SplitRow {
  lot_id: string;
  farmer_id: string;
  farmer_name: string;        // ← ASK: not on pool_members. S16 must name the member.
  qty_kg: number;
  score_at_pool: number;      // snapshot — a later regrade must not change an agreed split
  weight: number;             // qty_kg * grade_multiplier, exposed so the maths is auditable
  share_bps: number;          // Σ over members == exactly 10000
  vs_solo_paise: number;      // ★ gain vs selling alone. Can be negative → Pareto guard.
  consented: boolean | null;  // null = not asked yet. Three states, not two.
}
interface PoolDto {
  fpo: { id: string; name: string; name_mr: string };   // ← ASK: exact shape of `fpo`
  total_qty_kg: number;
  avg_score: number;
  members: SplitRow[];
  all_consented: boolean;
}
```

★ Named `PoolDto` here, not `PoolRes` as an earlier draft of this doc had it — this
is what shipped in `app/src/types/api.ts`, matching the naming CANON itself uses
for every other §7.5 shape (`LotDto`, and the request/response pattern elsewhere
in this document).

Requirements and asks specific to this section:

- **`GET /lots` must be actor-scoped, and `GET /lots/{id}` must 404 for a lot the actor
  does not own (I4).** This is one of the two invariants a judge will actually test — they
  will take a lot id from one session and call it from another. We will demo it by hand.
  Please make sure the 404 body is byte-identical to a genuinely missing id.
- **S12 must work with no photo.** `photo_path` is optional on create, and the whole
  create flow has to succeed before any upload. `POST /lots/{id}/photo` is a second,
  separate call and is allowed to fail without losing the lot.
- **EXIF GPS stripping is yours, not ours.** We cannot strip it client-side reliably. A
  photo that carries a farmer's home coordinates into a buyer-visible record is a privacy
  incident, so please confirm the strip happens on upload and is tested.
- **`grade` on a lot has four values, including `UNGRADED`.** Our existing `Grade` type is
  `'A' | 'B' | 'C'` (it is the type of the *assay* result and of `min_grade`). Do not
  collapse the two — a lot before S13 is genuinely ungraded and S15 must show that state.
- **`consented` is nullable and that matters.** `null` = not asked, `false` = refused,
  `true` = agreed. S16 renders three different things. A boolean-with-default would erase
  the distinction.
- **`vs_solo_paise` can be negative, and if any member's is negative the pool must not
  form** (CANON §10's Pareto guard). Send the negative number rather than hiding the row —
  S16's honest state is "this pool does not form, and here is who it would have hurt."
- Phase 1 is **read-only** for pools. We are not building a forming flow or live consent.

---

## 6. §7.6 Demands, matching, offers — Akash · **`OfferDto` UNDEFINED**

Screens: **S14** farmer counter-offer (with the forecast above the input), **S18** post
demand, **S19** matches, **S20** lot detail, **S21** offer thread.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/demands` | Buyer only → `DemandDto` |
| `GET` | `/demands` | Open demands, filterable |
| `GET` | `/demands/{id}/matches` | ★ ranked, **includes multi-lot combinations** |
| `POST` | `/offers` | `{demand_id?, lot_ids[], qty_kg, price_paise_per_qtl}` → `OfferDto` |
| `GET` | `/offers` | Actor-scoped **both directions** |
| `POST` | `/offers/{id}/accept` | → creates a `transaction` |
| `POST` | `/offers/{id}/reject` | |
| `POST` | `/offers/{id}/counter` | ★ `{price_paise_per_qtl, note?}` → new offer, `round+1`, **409 `MAX_ROUNDS`** past 3 |
| `GET` | `/offers/{id}/thread` | Full counter chain, **oldest first** |

```ts
// PROPOSED — from CANON §6.4 `demands`
interface DemandDto {
  id: string;
  buyer_id: string;
  commodity_id: string;
  market_id: string;               // delivery point
  qty_kg: number;
  min_grade: 'A' | 'B' | 'C';
  bid_paise_per_qtl: number;
  needed_by: string;               // ISO date
  status: 'OPEN' | 'FILLED' | 'EXPIRED' | 'CANCELLED';
  source: string;                  // 'SEEDED' for demo buyers — I8 applies to buyers too
  created_at: string;
}

// PROPOSED — from CANON §6.4 `offers` + `offer_lots`
interface OfferDto {
  id: string;
  demand_id: string | null;
  buyer_id: string;
  farmer_id: string | null;        // exactly one of farmer_id / pool_id is non-null
  pool_id: string | null;
  price_paise_per_qtl: number;
  qty_kg: number;
  round: number;                   // 1..3
  parent_offer_id: string | null;  // the offer this counters
  initiator: 'BUYER' | 'FARMER';
  status: 'OPEN' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'WITHDRAWN';
  expires_at: string | null;
  created_at: string;
  lots: Array<{ lot_id: string; qty_allocated_kg: number }>;   // ← ASK: is this embedded?
  note: string | null;             // ← ASK: `note` is accepted on counter but not stored
}
```

The matches response **is** specified in CANON §7.6 and we will transcribe it as:

```ts
interface MatchRow {
  kind: 'SINGLE' | 'COMBINATION';
  lots: Array<{ lot_id: string; qty_allocated_kg: number }>;
  total_qty_kg: number;
  fill_bps: number;          // 10000 = the demand is exactly filled
  avg_score: number;         // 0..1000
  grade: 'A' | 'B' | 'C';
  distance_km: number;
  score: number;             // ★ a float 0..1 — the ONLY non-integer in the contract
  why_mr: string;            // rendered verbatim on S19
  why_en: string;
}
interface MatchesRes { matches: MatchRow[] }
```

Requirements and asks:

- **`score` is a float and every other number in this contract is an integer.** That is
  fine — it is a ranking weight, not money — but please confirm it, because our review
  rule is "grep the diff for floats" and this one will trip it every time. If you would
  rather send `score_bps` as an integer, we prefer that and will take it.
- **`why_mr` / `why_en` are rendered verbatim.** We do not template around them and we do
  not translate client-side. "Because the algorithm said so" is not an answer a judge
  accepts, so the sentence has to name the actual reasons — the CANON examples
  ("जवळचे अंतर, ग्रेड A", "Fills the full order — one FPO batch + 2 farmers") are the
  right register. **They must never be empty**, including for a `SINGLE` match.
- **`COMBINATION` matches are the interesting case** and S19 must render them as a group.
  Note CANON's own example puts `"lot_id": "pool_3"` in the `lots` array — i.e. a pool id
  in a field named `lot_id`. If that is intentional we need a discriminator
  (`kind: 'LOT' | 'POOL'` per entry, or an `is_pool` flag); otherwise S19 cannot label
  "one FPO batch + 2 farmers" without string-sniffing the id prefix, which we will not do.
  **This is Q1 in §10 and it blocks S19's grouping.**
- **`GET /offers/{id}/thread` must be oldest-first** and must include every round. S21
  renders the chain as a conversation; reversing it silently inverts the negotiation.
- **The counter cap is 3 rounds and past it you return `409 MAX_ROUNDS`.** S14 needs to
  *disable* the counter button on the third round rather than letting the farmer type a
  price and then rejecting it. So please expose the round on the offer (it is in the DTO
  above) — we compute "is this the last round" from `round`, and we treat the 409 as the
  backstop, not the primary path.
- **`GET /offers` is actor-scoped in both directions** — a farmer sees offers on their
  lots, a buyer sees offers they made. Same list endpoint, different actor, no
  client-supplied id anywhere (I4).
- `POST /offers/{id}/accept` creates the transaction. **Please return the created
  transaction (or at least its `id`)** in the accept response, so S21 can navigate
  straight to the escrow timeline instead of guessing and re-fetching.

---

## 7. §7.7 Escrow and disputes — Akash

Screens: **S22** escrow timeline (buyer), **S15** lot status timeline (farmer),
**S25** dispute.

| Method | Path | Notes |
|---|---|---|
| `GET` | `/tx/{id}` | Actor-scoped |
| `POST` | `/tx/{id}/transition` | `{to_status, note?}` → **FSM only** (I11). `409 INVALID_TRANSITION`. **`Idempotency-Key` header required.** |
| `GET` | `/tx/{id}/events` | Append-only timeline |
| `POST` | `/disputes` | `{tx_id, reason_code, description, photo_path?}` |
| `GET` | `/disputes/{id}` | + event timeline |

```ts
// PROPOSED — from CANON §6.4 `transactions`
type TxStatus = 'CREATED' | 'ESCROW_HELD' | 'DISPATCHED' | 'DELIVERED'
              | 'RELEASED' | 'DISPUTED' | 'REFUNDED' | 'CANCELLED';

interface TxDto {
  id: string;
  offer_id: string;
  buyer_id: string;
  farmer_id: string | null;
  pool_id: string | null;
  qty_kg: number;
  price_paise_per_qtl: number;
  gross_paise: number;
  deductions_paise: number;
  net_paise: number;              // gross − deductions
  status: TxStatus;
  created_at: string;
}

interface EscrowEvent {
  id: string;
  tx_id: string;
  from_status: TxStatus | null;   // null on the first event
  to_status: TxStatus;
  actor_user_id: string | null;
  note: string | null;
  created_at: string;
}
interface EscrowEventsRes { events: EscrowEvent[] }   // ← ASK: bare array or wrapped?

type DisputeStage = 'RAISED' | 'EVIDENCE' | 'MEDIATION'
                  | 'RESOLVED_FARMER' | 'RESOLVED_BUYER' | 'RESOLVED_SPLIT' | 'WITHDRAWN';
type DisputeReason = 'QUALITY_MISMATCH' | 'SHORT_WEIGHT' | 'PAYMENT_DELAY' | 'OTHER';
```

**The FSM is the contract, and the UI is generated from it.** These are the only legal
transitions:

```
CREATED ──► ESCROW_HELD ──► DISPATCHED ──► DELIVERED ──► RELEASED
   │             │               │             │
   └──► CANCELLED└──► REFUNDED   └──► DISPUTED ◄┘
                                       │
                                       ├──► RELEASED   (resolved for farmer)
                                       └──► REFUNDED   (resolved for buyer)
```

Anything not on that diagram is a `409`. What we need from you:

- **We render the timeline from `/tx/{id}/events`, not from `status`.** The current status
  is the last event's `to_status`. That is why the table is append-only (I5) — the
  timeline *is* the audit trail, and a screen that reconstructs history from a single
  mutable column cannot show a dispute that was resolved. Please never `UPDATE` or
  `DELETE` a row in `escrow_events` or `dispute_events`.
- **`Idempotency-Key` is required on transition and we will send one.** A farmer on a bad
  connection will double-tap "dispatched". We generate a stable key per (tx, to_status)
  attempt. A replay must return the **same** result, not a 409.
- **We need to know which transitions the current actor may perform**, per status. A buyer
  can release; a farmer can dispatch; neither can do the other's. Right now we would have
  to hardcode that table in the app, and if it disagrees with yours the user gets a button
  that always 409s. **Either add `allowed_transitions: TxStatus[]` to the `TxDto`** (our
  strong preference — one field, the UI is then correct by construction) **or send us the
  actor × status × allowed matrix** and we will hardcode it. This is Q2 in §10.
- **`409 INVALID_TRANSITION` must name the attempted and current status in `message`.**
  A generic "conflict" gives us nothing to show.
- **Disputes:** `reason_code` is a closed set of four values in the DDL comment
  (`QUALITY_MISMATCH`, `SHORT_WEIGHT`, `PAYMENT_DELAY`, `OTHER`) but the column has **no
  CHECK constraint**. Please add one, or confirm the four are final — S25 renders them as
  a fixed picker and needs Marathi labels for exactly these.
- **Dispute photo:** same EXIF-strip requirement as the lot photo.
- `deductions_paise` needs an explanation on screen when non-zero. If there is a
  breakdown, send it; if it is always zero in Phase 1, say so and we will not build the row.

---

## 8. §7.8 Meta and provenance — Kartik · **one screen already fails to compile on this**

| Method | Path | Notes |
|---|---|---|
| `GET` | `/meta/health` | `{ok, db, model_loaded, latest_obs_date}` |
| `GET` | `/meta/data-provenance` | ★ per commodity/market: row counts by `source`, date range, `source_url` |

**This is the most concrete, most immediate ask in this document.** `S24_DataProvenance`
exists in the app today and **does not compile**, because it imports a symbol our fetch
layer does not export and there is no provenance function to call. It is the screen that
volunteers our data provenance to a government panel before they ask for it — CANON's own
note on this endpoint is *"Back this with a screen. Volunteering provenance beats being
asked for it."* We will write the client function the moment we have the shape.

```ts
// PROPOSED — confirm or correct. S24 renders one card per row.
interface ProvenanceRow {
  commodity_id: string;
  commodity_name_mr: string;
  market_id: string;
  market_name_mr: string;
  source: DataSource;
  row_count: number;
  first_obs_date: string;    // ISO date
  last_obs_date: string;     // ISO date
  source_url: string | null; // ★ tappable on S24 — must be a real, public URL
}
interface ProvenanceRes {
  rows: ProvenanceRow[];
  generated_at: string;
}
```

- **`source_url` must be a real URL we can open with `Linking.openURL`.** SH7's stated
  gate is "renders `/meta/data-provenance` verbatim, source URL tappable". A null URL is
  acceptable for `IMPUTED`/`SYNTHETIC` rows **provided** the row still says so plainly —
  that is the honest case and the screen is designed to show it.
- **`/meta/health` is what our connectivity check reads.** `model_loaded: false` must be a
  truthful boolean, because the app degrades gracefully on it rather than showing an
  empty forecast. `latest_obs_date` here should agree with `/prices/series`.
- **Neither of these may require auth**, ideally — provenance is the thing we want a judge
  to be able to open. If they do require a token, tell us and we will gate them.

---

## 9. Buyer reliability ledger — **there is no endpoint for this at all**

`S23_BuyerReliability` is a built, shipped tab in the buyer console (खातेवही). It has
**no endpoint anywhere in CANON §7.** The data it needs is sitting in the `buyers` table
(CANON §6.2, the block commented *"reliability, seeded in Phase 1, computed in Phase 2"*)
and the project invariants name a `realisation_ledger` table as append-only (I5) — but
that table appears in **no DDL section** and no route exposes it.

So this is not "please change an endpoint", it is **"please tell us whether this endpoint
exists in your repo, and under what path"**. What the screen needs:

```ts
// PROPOSED — GET /buyers/{id}/reliability, or /ledger, or wherever it lives
interface BuyerReliability {
  buyer_id: string;
  business_name: string;
  tier: 'T0_UNVERIFIED' | 'T1_REGISTERED' | 'T2_TRANSACTED' | 'T3_TRUSTED';
  gst_last4: string | null;        // last 4 ONLY — no full GSTIN in Phase 1
  deals_completed: number;
  on_time_payment_bps: number;     // 10000 = always on time
  renegotiation_bps: number;       // ★ how often this buyer cut price after delivery
  source: string;                  // 'SEEDED' — I8 applies here too
}
```

Two things about this screen that matter more than the shape:

- **`renegotiation_bps` is the number that makes the product honest.** It is the buyer
  behaviour farmers actually get hurt by. If it is seeded, it must be **labelled seeded**
  (I8) — a reliability score presented as real when it is synthetic is exactly the
  unrecoverable mistake, and it is worse here than on a price chart because it is an
  accusation about a named counterparty.
- **`gst_last4` is last-four only.** Please never send a full GSTIN. Same family of rule
  as I9: the minimum identifying data that makes the screen work.

If there is a `realisation_ledger` in your repo (farmer-side realised price vs mandi
modal, which is what the name suggests), we would like it — it is the strongest possible
"did this product actually help" screen — but we are **not** building against a table
that has no DDL. Tell us it exists and we will spec it properly.

---

## 10. Open questions — answer these and the merge is mechanical

Numbered so you can reply "Q3: yes". Each one is a place where we would otherwise have to
invent a shape, and an invented field renders perfectly against a fixture and is
`undefined` the first time it meets the real endpoint.

| # | Question | Blocks | Our default if you don't answer |
|---|---|---|---|
| **Q1** | In `GET /demands/{id}/matches`, a `COMBINATION`'s `lots[]` can contain a **pool** id in a field named `lot_id`. Is there a discriminator? | S19 grouping | We render every entry as a lot and lose "one FPO batch + 2 farmers" |
| **Q2** | Does `TxDto` carry `allowed_transitions: TxStatus[]`, or do we hardcode the actor × status matrix? | S22, S15 | We hardcode it and some buttons will 409 |
| **Q3** | Confirm `LotDto`, `OfferDto`, `DemandDto`, `SplitRow`, `TxDto`, `EscrowEvent` as written in §5–§7, or send yours. | S12–S16, S19–S22, S25 | We ship the proposals above |
| **Q4** | Does `users.locale` accept `'hi'`? (The CHECK in §6.2 says `('mr','en')`; S1 offers three.) | S1, S3 | We keep हिंदी and expect the CHECK to be widened |
| **Q5** | `/prices/nearby` — is `loading_paise_per_qtl` a missing field, or genuinely always 0? | S6 arithmetic | We assume 0 and show gross − transport − commission = net |
| **Q6** | Commission arrives as `commission_bps` (`/ref/logistics`) and `commission_paise_per_qtl` (`/prices/nearby`, `WindowCosts`). Confirm both, and that they agree. | S6, S10 | We show only the applied paise figure |
| **Q7** | Is `village` on the user object? Is `district_id`? What does a **BUYER**'s user object look like? | S3, S17, top bar | `district_id` yes, `village` no, buyer name in `name` |
| **Q8** | Is `matches[].score` a float, or can it be `score_bps` as an integer? | our float-grep review rule | We accept the float |
| **Q9** | Is `/tx/{id}/events` a bare array or `{events: [...]}`? Same for `/lots` and `/offers`. | every list screen | Wrapped for events, bare array for `/lots` and `/offers` per §7 |
| **Q10** | Where does buyer reliability live, and does `realisation_ledger` exist? | S23 | We keep S23 on a labelled fixture |
| **Q11** | Do `/ref/districts`, `/meta/health`, `/meta/data-provenance` require a token? | S3, S24 | Unauthenticated |
| **Q12** | Are `created_at`/`expires_at` ISO 8601 **with** timezone? (`timestamptz` in the DDL.) | every timeline | ISO 8601 with offset, UTC |

---

## 11. Seed expectations — what must be in the database on demo day

The frontend cannot manufacture these. Every one of them is a screen state a judge can
reach in two taps, and a screen with only the happy path is not done (CLAUDE.md §8.5).

**Reference data**

- All 6 markets and both commodities, each with a **non-empty `name_mr`**. A blank
  `name_mr` renders as an empty row, not as an English fallback — we read `name_mr`
  directly.
- `commodities.storable_days` set per commodity from a real source, not a constant.
  Onion and the second crop do not store alike, and S10's storage cost is derived from it.
- At least one warehouse per demo district with `wdra_registered = true`, and one with
  `false`, so S11 can show the distinction.
- A `/ref/logistics` row for every (demo district → demo market) pair we might touch.
  A missing pair makes S6 and S10 silently cheaper, which is the worst kind of wrong.

**Prices**

- **≥ 180 `price_obs` rows** per (commodity, market) pair used in the demo. Below that
  the forecast is entitled to refuse, and a refusal we did not intend to demo is
  indistinguishable from a bug.
- A **mixture of `source` values** across the corpus, including at least one row that is
  not `AGMARKNET`/`MSAMB`, so the I8 badge is visible on a real screen rather than only
  described. Every non-AGMARKNET/MSAMB row keeps a truthful `source` — do not launder
  it to `ARCHIVE` to make the badge disappear.
- `source_url` populated on every row that has one, and openable. S24 makes it tappable
  and a dead link on a government panel's screen is a wound.
- `latest_obs_date` within a few days of demo day, so no screen shows a stale banner we
  did not intend.

**The two AI states, both reachable**

- One (commodity, market, qty, grade) combination that yields a **HOLD** with
  `pledge_quote` non-null — the hero path. Verify by hand that
  `expected_gain_paise = (hold_p50_net − sell_now_net) × (qty_kg // 100)`. On a
  40-quintal lot the demo figure closes at **₹6,290**, not ₹62,900.
- One combination that yields **`NO_ADVICE`** with a real `refusal_reason` — I6 is one of
  the two invariants a judge actually tests, and "it can refuse" must be demonstrable,
  not describable. `BAND_TOO_WIDE` is the most honest one to seed.
- Ideally one that yields `SELL_ELSEWHERE` with a populated `alt_market`, since that
  shape is undefined in CANON and seeing it once settles it.

**Trade objects, if §7.5–§7.8 land**

- Two farmer accounts with lots, so the **cross-actor 404** (I4) can be shown live:
  farmer A's lot id, called with farmer B's token, returns **404 and not 403**.
- One pool with `all_consented = true` and every `share_bps` summing to **exactly 10000**.
- One pool member with **`vs_solo_paise < 0`** if you want the Pareto guard on screen —
  that pool must not form, and S16's honest state is "this pool does not form, and here
  is who it would have hurt".
- One transaction at each of `FUNDED`, `DELIVERED`, `RELEASED`, plus one `DISPUTED` with
  at least three `escrow_events` and two `dispute_events`, because we render the timeline
  from the event stream and not from `status`.
- One buyer with a **non-zero `renegotiation_bps`**. A ledger where every buyer is perfect
  is not a ledger. If it is seeded rather than computed, it must be labelled seeded (I8).

**Never seeded, under any circumstances**

- An Aadhaar number, in any form — not hashed, not encrypted, not "just for the demo" (I9).
- A full GSTIN. `gst_last4` is four digits.
- A plaintext OTP in `otp_codes`. `code_hash` only.

---

## 12. Acceptance checklist — how we will know the merge worked

Run against the real API with the app pointed at it. Each line is a thing we can check in
one action, and each maps to a screen that is already written. Nothing here needs a new
screen; if a line fails, the contract diverged from this document and one of the two is
wrong.

**Transport and auth**

- [ ] Every 4xx/5xx body is `{"error": {"code", "message", "field"}}`. No bare string, no
      FastAPI `{"detail": ...}`. Our error path reads `error.code` and shows `error.message`.
- [ ] `message` on a 500 contains no stack trace, no SQL, no table name.
- [ ] `POST /auth/otp/request` returns `expires_in_s`; the S2 countdown reads it and does
      not hardcode 120.
- [ ] With `ENV=production`, `dev_otp` is **absent** from the response.
- [ ] A wrong OTP and an unknown phone produce the **same** error code and message.
- [ ] `AuthRes.user.role` is `FARMER` or `BUYER`, and it is the only thing the root
      navigator reads. There is no role picker in the app and must never be one.

**Units — one grep and two multiplications**

- [ ] No response field named `*_rupees`, no field whose value is a float where paise are
      meant, no `.5` in any `_paise` field.
- [ ] `expected_gain_paise` on a 40-qtl lot equals
      `(hold_p50_net_paise_per_qtl − sell_now_net_paise_per_qtl) × 40`. Computed by hand.
- [ ] `worst_case_paise` equals the same expression with `hold_p10_net_paise_per_qtl`, and
      it is **negative**.
- [ ] `WindowCosts.total_paise_per_qtl` equals the sum of the other five keys.

**Every-key-always-present**

- [ ] On a `NO_ADVICE` response, `hold_days`, `hold_p50_net_paise_per_qtl`,
      `hold_p10_net_paise_per_qtl`, `expected_gain_paise`, `worst_case_paise`,
      `alt_market`, `pledge_quote` are all present with value `null` — not omitted.
- [ ] `costs` is still populated on a `NO_ADVICE`.
- [ ] `refusal_reason` is non-null **exactly** when `action === 'NO_ADVICE'`.
- [ ] The hero endpoint never returns 500. With the model unloaded it returns 200 with
      `NO_ADVICE` / `INSUFFICIENT_HISTORY`.

**I4 — the one a judge will test**

- [ ] Farmer A's lot id, requested with farmer B's token, returns **404**. Not 403, not 200.
- [ ] Same for `/tx/{id}`, `/offers/{id}`, `/pools/{id}`, `/lots/{id}/assay`.
- [ ] No endpoint accepts a client-supplied `farmer_id` / `buyer_id` to scope a read.

**I8 — the one that is unrecoverable if we get it wrong**

- [ ] `source` on every price row is truthful.
- [ ] `PriceSeriesRes.source_summary` counts sum to `points.length`.
- [ ] `/meta/data-provenance` returns a real, openable `source_url` per row, and the rows
      whose data is `IMPUTED`/`SYNTHETIC` say so.

**Ordering and FSM**

- [ ] `/prices/nearby` arrives sorted by `net_paise_per_qtl` **descending**, and
      `sorted_by` is the literal string `"net_paise_per_qtl"`.
- [ ] A skipped transition returns 409 naming both the attempted and the current status.
- [ ] Replaying a transition with the same `Idempotency-Key` returns the **same result**,
      not a 409.
- [ ] `/tx/{id}/events` is append-only in practice: an event that happened is still there
      after the dispute resolves.

**Compiles and runs**

- [ ] `npx tsc --noEmit` is clean with the real responses typed. If a field we read is
      missing, this is where it surfaces — before the demo, not during it.
- [ ] `npx jest` (unfiltered, no path argument) is green.

---

**When this checklist passes, the frontend needs no changes to run against the real API.**
That is the entire purpose of writing it down before the two halves meet.

*Companion: `FRONTEND_NEEDS_AI.md` — the forecast, the decision engine, the refusal, the
grading formula and the split maths.*

















