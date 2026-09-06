# What the frontend needs from the AI layer

**From:** Pranay (frontend lead) · **To:** Nikhil (forecasting), Nilesh (decision engine)
**Written:** 2026-09-06 · **Source of truth:** `docs/architecture/00_CANON.md` §7.4, §8, §9, §10
**Companion:** `FRONTEND_NEEDS_BACKEND.md` — transport, auth, reference data, trade objects.

---

## 0. Why this document exists

The app in this repository and the AI layer are being built in **two different
repositories**, against two different plans. Nothing in `api/app/ml/` or
`api/app/domain/decide.py` is going to appear here, and nothing here is going to appear
there, until we merge.

So this is not a blocker list and it is not a request for work. It is the **integration
contract**: the exact response shapes, units, identities and refusal semantics that the
frontend **already reads today**, written down so that at merge time the AI endpoints can
be conformed to it — or this file corrected — **without touching a single screen**.

Everything below is already implemented against fixtures. `app/src/types/api.ts` §7.4 is
the live wire contract, `app/src/fixtures/{forecast,window}.ts` are what we test against,
and `S9_Verdict` / `S10_CostBreakdown` / `S5_PriceHistory` are already rendering it. If a
field named here is absent from your response, a shipped screen shows a blank.

**Six rules that govern every shape in this file:**

1. **`snake_case` on the wire.** There is no camelCase mapping layer and we are not
   adding one. The frontend reads `expected_gain_paise` directly.
2. **All money is integer paise (I1).** Never a float, never rupees. A field ending
   `_paise` is paise; a field ending `_paise_per_qtl` is paise per quintal. `formatPaise()`
   at the render edge is the only place a ₹ appears.
3. **Quantity is integer kg (I2), rates are bps (I3).** 1 qtl = 100 kg. 10000 bps = 100%.
4. **Every key is always present.** The nullable ones go `null`; they do not vanish. We
   type them `T | null`, never `T?`, precisely so that no screen can forget the refusal
   path exists — and the refusal path is the one a judge asks about.
5. **The hero endpoint never returns 500.** Degrade to `NO_ADVICE`. A hero endpoint that
   throws in the demo is worse than one that declines.
6. **Nothing enters this contract that CANON §7.4 does not define.** Six invented fields
   were caught before H0. If a screen wants a field, the field goes into CANON first.

---

## 1. `GET /ai/forecast` — the band, not the line

```
GET /api/v1/ai/forecast?commodity_id=&market_id=&horizon_days=14
```

What we read, verbatim from `app/src/types/api.ts`:

```ts
export interface ForecastPoint {
  target_date: string;          // ISO date, YYYY-MM-DD
  p10_paise_per_qtl: number;
  p50_paise_per_qtl: number;
  p90_paise_per_qtl: number;
}

export interface ForecastRes {
  as_of_date: string;
  points: ForecastPoint[];
  model_card: ModelCardSummary;   // { mase, coverage_80_bps }
}
```

**Requirements, and each one is something a screen depends on:**

- **All three quantiles on every point.** A p50 with no band is the single thing CLAUDE.md
  §9 names as losing us the hackathon: *"A confident forecast with no interval. p10/p50/p90
  or nothing."* The chart draws the shaded band from p10/p90 and the line from p50. A point
  with a null p10 leaves a hole in the polygon, not a thinner band.
- **`p10 ≤ p50 ≤ p90` on every point.** Quantile regression fits the three α values
  independently and they can cross. If they cross, the band polygon inverts and the chart
  renders a bow-tie. Sort them server-side before returning, or tell us you don't and we
  will clamp — but then the number on screen is not the number the model produced, which
  is worse. Please enforce it in `predict.py`.
- **`points.length === horizon_days`**, and `target_date` strictly increasing with no gaps.
  We index the array positionally to place x-coordinates.
- **`as_of_date` is the last observation the model saw**, not today's date. S5 shows
  "as of <date>" next to the band and a farmer comparing it to a mandi board needs to know
  which day the model's knowledge ends.
- **`horizon_days` defaults to 14** if omitted. `app/src/lib/api.ts` sends
  `getForecast(commodityId, marketId, horizon = 14)`.
- **`INSUFFICIENT_DATA` (422)** when history is below the training minimum — do not return
  a flat line fitted on 20 rows. We render the empty state with the reason. Per CANON §7's
  error table 422 is `INSUFFICIENT_DATA`, and the envelope is
  `{"error": {"code", "message", "field"}}` like every other failure.
- **`model_card` inline.** The two summary numbers travel on the forecast response so S5
  can badge accuracy without a second round trip.

---

## 2. `GET /ai/model-card` — the honesty screen (S8)

```
GET /api/v1/ai/model-card?commodity_id=
```

```ts
export interface ModelCardSummary {
  mase: number;
  coverage_80_bps: number;
}

export interface ModelCard extends ModelCardSummary {
  algo: string;
  trained_at: string;
  train_rows: number;
  train_from: string;
  train_to: string;
  horizon_days: number;
  baseline: 'seasonal_naive';
}
```

**Requirements:**

- **`mase` is against `seasonal_naive`, and `baseline` says so.** The whole point of the
  screen is "we are this much better than the dumbest reasonable forecast". A MASE with no
  named baseline is a number with no meaning. `baseline` is typed as the literal
  `'seasonal_naive'` — if you change the baseline, the build fails here, which is deliberate.
- **`mase < 1.0` or the screen says we are worse than the baseline**, honestly. We are not
  going to hide it. If it is above 1.0 at merge time, tell us and we will show it with the
  explanation rather than have a judge compute it.
- **`coverage_80_bps` is measured on held-out data, in bps.** 7840 means 78.4% of actuals
  fell inside the p10–p90 band against a nominal 80%. A hardcoded 8000 is a lie that is
  trivially detectable — the band is on screen and a judge can count.
- **`train_rows`, `train_from`, `train_to` are real** and consistent with what
  `/meta/data-provenance` reports for the same commodity. Two screens showing different row
  counts for the same corpus is the kind of thing that ends a conversation.
- **`trained_at` is ISO 8601 with an offset.** S8 shows "trained <n> days ago" and a naive
  timestamp gets misread by a timezone.
- **`algo` is the actual algorithm string**, e.g. `lightgbm_quantile`. It appears verbatim
  on S8; we do not map it to a prettier name.
- **This endpoint should not require a token** if that is easy on your side — S8 is the
  screen we hand a judge, and it is better if it opens without a login.

---

## 3. ★ `POST /ai/window/recommend` — the hero

Note the path: **`/ai/window/recommend`**, with the `/ai` segment. An earlier draft of our
client had `/window/recommend` and it was wrong; `app/src/lib/api.ts` now sends
`POST /api/v1/ai/window/recommend`. If your route is mounted without `/ai`, say so and we
change one string — but say so, because a 404 here is the demo.

**Request** — exactly this, no more:

```ts
export interface WindowRecommendReq {
  commodity_id: string;
  market_id: string;
  qty_kg: number;          // integer kg (I2). 4000 = 40 quintals.
  grade: Grade;            // 'A' | 'B' | 'C'
  lot_id: string | null;   // null when the farmer has not created a lot yet
  horizon_days: number;
}
```

`lot_id: null` is the common case, not the exception. S9 is reachable from S4 before a lot
exists — a farmer asks "should I hold?" before he decides to list. If your handler requires
a lot, S9 breaks for every first-time user.

**Response** — every key, always present:

```ts
export interface WindowRes {
  action: WindowAction;                        // SELL_NOW | SELL_ELSEWHERE | HOLD | SPLIT | NO_ADVICE
  hold_days: number | null;
  confidence: Confidence;                      // 'LOW' | 'MEDIUM' | 'HIGH'
  band_width_bps: number;

  sell_now_net_paise_per_qtl: number;
  hold_p50_net_paise_per_qtl: number | null;
  hold_p10_net_paise_per_qtl: number | null;

  expected_gain_paise: number | null;          // WHOLE LOT
  worst_case_paise: number | null;             // WHOLE LOT, negative

  costs: WindowCosts;                          // still populated on a refusal
  alt_market: AltMarket | null;
  pledge_quote: PledgeQuote | null;            // null when not worthwhile (I13)
  refusal_reason: RefusalReason | null;        // non-null iff action === 'NO_ADVICE'

  model_card: ModelCardSummary;
  explain_mr: string;
  explain_en: string;
  data_source: DataSource;
}
```

**Six fields that do not exist and must not appear.** We had all six in an early draft and
deleted them: `best_case_paise`, `best_day`, `confidence_bps`, `costs_paise`,
`model_version`, `source_summary`. Confidence is the **enum** `LOW|MEDIUM|HIGH`; band width
is the separate integer `band_width_bps`. There is **no best case** on this response and no
best-case row on S9 — the I16 pair is expected gain ↔ worst case. If you send a
`best_case_paise` we will not read it, and if a slide shows one it came from nowhere.

### 3.1 Units — the likeliest 100× bug in the whole project

| Field | Unit | Scope |
|---|---|---|
| `sell_now_net_paise_per_qtl` | paise | **per quintal** |
| `hold_p50_net_paise_per_qtl` | paise | **per quintal** |
| `hold_p10_net_paise_per_qtl` | paise | **per quintal** |
| every key in `costs` | paise | **per quintal** |
| **`expected_gain_paise`** | paise | **the whole lot** |
| **`worst_case_paise`** | paise | **the whole lot** |

The rule is mechanical: **no `_per_qtl` suffix ⇒ it is a total.** The two whole-lot fields
are the only ones without the suffix, and they are the two a farmer reads first.

The two identities, which we assert in a test against the fixture:

```python
qty_qtl             = qty_kg // 100                                    # integer division
expected_gain_paise = (hold_p50_net_paise_per_qtl - sell_now_net_paise_per_qtl) * qty_qtl
worst_case_paise    = (hold_p10_net_paise_per_qtl - sell_now_net_paise_per_qtl) * qty_qtl
```

Against CANON's own worked example on a 4000 kg (40 qtl) lot:

```
(209650 - 193925) * 40 =  629000   → ₹6,290 expected gain
(181925 - 193925) * 40 = -480000   → −₹4,800 worst case
```

**₹6,290, not ₹62,900.** ₹62,900 on a 40-quintal lot would be an 81% onion price move in
eleven days; these nets are an 8.1% move. If your response closes at the larger figure, a
unit is wrong somewhere — most likely a per-quintal value multiplied by kg instead of
quintals. CANON's instruction stands and we apply it to slides as well as screens:
**never put a rupee figure in front of anyone that you have not multiplied out by hand.**

`worst_case_paise` is **negative** on a HOLD. Do not send its absolute value and do not
clamp it at zero. S9 renders it with its own sign, at the same size as the gain (§10), and a
positive worst case would silently turn the honest screen into a dishonest one.

### 3.2 The other four actions

`SELL_NOW` is not "no recommendation" — it is a recommendation, and it is the correct one
most of the time. The three hold fields may be non-null on a `SELL_NOW`; we show them as
"waiting would have earned less", which is the sentence that makes the product credible.

`SELL_ELSEWHERE` requires `alt_market` to be **non-null** — see §7, that shape is currently
undefined in CANON and is our one live `TODO(nilesh)`.

`SPLIT` needs to tell us **what to split**. CANON §7.4 gives no split-specific fields on
this response, so today S9 renders `SPLIT` using `explain_mr` alone and shows no ratio. If
you intend a "sell 60% now, hold 40%" recommendation, we need a field for it — see Q4. Until
then, `SPLIT` and `HOLD` look nearly identical on screen, which undersells the feature.

`NO_ADVICE` is §4.

---

## 4. The refusal (I6) — the screen a judge asks about

> *"The model may refuse. When the p10–p90 band exceeds the threshold, return `NO_ADVICE`
> with a reason. Never invent a confident number."*

This is one of the two invariants a judge will actually test — they will ask what happens
when the model is wrong — and it has to be **demonstrable, not describable**. S9 has a real
refusal state, built and tested, and it needs exactly this:

```ts
export type RefusalReason =
  | 'BAND_TOO_WIDE'
  | 'INSUFFICIENT_HISTORY'
  | 'STALE_DATA'
  | 'GAIN_BELOW_COST';
```

**A refusal is a `200`, not a 4xx.** It is a successful answer whose content is "I don't
know". We branch on `action === 'NO_ADVICE'`, not on a status code. If it arrives as a 422
our error boundary catches it and the farmer sees a generic failure instead of the honest
Marathi sentence, which throws away the single best moment in the demo.

On a refusal, per CANON's own worked example:

- `action: "NO_ADVICE"`, `hold_days: null`, `confidence: "LOW"`
- `band_width_bps` is **still populated** — 5820 in the example. It is the *evidence* for the
  refusal and S9 shows it. A refusal with `band_width_bps: 0` is unexplainable.
- All three of `hold_p50_net_paise_per_qtl`, `hold_p10_net_paise_per_qtl`,
  `expected_gain_paise`, `worst_case_paise` are `null` — present, valued null.
- `sell_now_net_paise_per_qtl` is **still populated.** Today's net is known even when
  tomorrow's is not, and the refusal screen shows it.
- **`costs` is still fully populated.** CANON: *"still returned — costs are known even when
  the forecast is not."* S10 remains reachable from a refusal, and that is a feature: we
  cannot tell him whether to wait, but we can still tell him exactly what selling costs.
- `refusal_reason` non-null, and `explain_mr` carries **its own sentence per reason** — four
  reasons, four different Marathi strings, written server-side. We render them verbatim; we
  do not template around them and we do not translate client-side.
- `pledge_quote: null` and `alt_market: null`.

**Each of the four reasons must be reachable in the seeded demo data**, or at minimum
`BAND_TOO_WIDE`, which is the most honest one to show. A refusal path that exists only in
code is a claim; one we can trigger on stage is a proof.

**And the hard rule, verbatim from CANON §7.4:**

> *"Never 500 from this endpoint. If the model is unavailable, degrade to `NO_ADVICE` with
> `refusal_reason: "INSUFFICIENT_HISTORY"`. A hero endpoint that throws in the demo is worse
> than one that declines."*

We have no client-side fallback for a 500 here and we are not going to invent one, because a
fabricated recommendation is precisely the failure mode I6 exists to prevent.

---

## 5. `WindowCosts` — S10 exists to make the netting believable

```ts
export interface WindowCosts {
  transport_paise_per_qtl: number;
  commission_paise_per_qtl: number;
  storage_paise_per_qtl: number;
  spoilage_paise_per_qtl: number;
  loading_paise_per_qtl: number;
  total_paise_per_qtl: number;
}
```

**Every key is per quintal** — the suffix says so, and CANON §7.4's units table confirms it.
Six keys, all six always present, none of them optional.

- **`total` must equal the sum of the other five.** S10 renders five rows and a total, and
  a total that does not add up is the single most damaging thing that can be on that screen:
  it invites a judge to check the arithmetic on everything else. From CANON's example:
  `8000 + 3075 + 1650 + 2310 + 500 = 15535`. ✓
- **`storage` and `spoilage` scale with `hold_days`; the other three do not.** That is the
  insight S10 is built to show — waiting is not free, and the two costs that grow are the
  reason a 30-day hold can lose to an 11-day one. If storage and spoilage arrive constant
  regardless of horizon, the screen still renders but the product's argument disappears.
- **All five are ≥ 0.** A negative cost is a subsidy and we have no way to render it.
- **`spoilage` is derived from the commodity's `storable_days`**, not a flat percentage.
  Onion and the second crop do not spoil alike.
- **The relationship to `sell_now_net_paise_per_qtl` must hold**: net = gross − total costs.
  We do not receive gross on this response, so we cannot verify it client-side — which is
  exactly why we are asking you to verify it server-side. If net and costs disagree, S9 and
  S10 tell the farmer two different stories about the same lot.
- **`commission` arrives here in paise per quintal, and from `/ref/logistics` in bps.** Both
  exist in CANON. They must agree once applied; see Q6 in the backend doc.

---

## 6. `POST /ai/pledge/quote` and the `pledge_quote` card (S11)

```ts
export interface PledgeQuote {
  loan_paise: number;
  ltv_bps: number;
  rate_bps_annual: number;
  days: number;
  interest_paise: number;
  warehouse_id: string;
  is_worthwhile: boolean;
  disclaimer: string;
}
```

The maths, from CANON §8, all integer:

```python
loan_paise     = assessed_value_paise * ltv_bps // 10000
interest_paise = loan_paise * rate_bps_annual * days // (10000 * 365)
is_worthwhile  = expected_gain_paise > interest_paise      # (I13)
```

**I13 is enforced server-side and the UI never has to check it.** When
`is_worthwhile` is false you send `pledge_quote: null`, and S11 simply does not render.
CANON: *"The UI never receives a card it shouldn't show."* The flag is on the type for
completeness only — we do not branch on it, and we should never need to. **Do not send a
card with `is_worthwhile: false`**, because the honest behaviour then depends on a client
check that I13 says should not exist.

`days` on the quote must equal `hold_days` on the window response. Two different hold
lengths in the same response makes the pledge card unreadable — it is quoting interest for a
wait we are not recommending.

**The four non-negotiable rules from CANON §8, which bind the frontend too:**

1. `is_worthwhile == False` ⇒ `pledge_quote: null`. Above.
2. **Every surface says "Indicative simulation — not a lender quote."** The `disclaimer`
   string arrives on the response and we render it verbatim on the card. It is not a tooltip,
   not behind a tap, not in grey 10sp type. If the string arrives empty we will hardcode the
   English sentence rather than ship a card without it, but please send it.
3. **No specific LTV percentage or interest rate goes on any slide** until it has been read
   off WDRA's published terms with the source URL recorded. This is Kartik's line in CANON
   and it applies to the deck, not just the code: *"Getting a government scheme's terms wrong
   in front of a government panel is worse than saying 'indicative'."* On screen we render
   whatever `ltv_bps` and `rate_bps_annual` you send — so those two numbers must be sourced,
   not chosen.
4. **Phase 1 creates no `enwr` records and touches no lender.** The card is a simulation. We
   will not add a "get this loan" button, and nothing in the app implies an application was
   filed.

`warehouse_id` must resolve against `/ref/warehouses` — S11 shows the warehouse name in
Marathi and a `warehouse_id` with no matching row renders a blank where the name goes.
Prefer a WDRA-registered warehouse; the distinction is on the reference row and we badge it.

---

## 7. `alt_market` — the one live `TODO(nilesh)` in our type file

CANON §7.4 shows `alt_market` **only as `null`** and never defines its populated shape. But
`SELL_ELSEWHERE` is one of the five actions, and it is the action that demonstrates the
product's core insight — that a nearer mandi paying less gross can beat a distant one paying
more, once transport and commission come out.

So we wrote the minimum S9 needs, and marked it:

```ts
/**
 * TODO(nilesh): CANON §7.4 shows `alt_market` only as `null` and never defines
 * its populated shape. This is the minimum S9 needs to render a SELL_ELSEWHERE
 * verdict. Do not read a field from this that is not listed here until the
 * contract is pinned.
 */
export interface AltMarket {
  market_id: string;
  name_mr: string;
  net_paise_per_qtl: number;
  distance_km: number;
}
```

**Confirm this or send yours.** Four fields is what the sentence "sell at Lasalgaon instead —
34 km, ₹1,957/qtl net" requires. What we specifically need:

- **`name_mr`, not `name`.** The verdict screen is Marathi and we do not join to
  `/ref/markets` from S9 to look a name up.
- **`net_paise_per_qtl`, and it must be comparable to `sell_now_net_paise_per_qtl`** on the
  same response — same units, same cost basis, netted the same way. If the alternative's net
  is computed with a different cost model than the current market's, the comparison on screen
  is meaningless and a judge who asks "netted how?" gets an answer we cannot defend.
- **`distance_km`**, because the honest version of this recommendation shows the cost of the
  advice. Sending a farmer 168 km is a different ask from sending him 34 km.
- **`gross_paise_per_qtl` would be welcome** if it is cheap — the "less gross, more net"
  story is the differentiator and we can only show it if we have both numbers.

`alt_market` must be **non-null whenever `action === 'SELL_ELSEWHERE'`**. If it is null on a
SELL_ELSEWHERE, S9 renders a verdict that names no market, which is worse than SELL_NOW.

Conversely it may be non-null on other actions — a HOLD that also notes a better mandi is
useful, and we will render it as a secondary line rather than the verdict.

---

## 8. CANON §9 grading — we implement the formula client-side, and it must match yours

S13 is the farmer's self-assay: six taps, then a grade. It has to score **on device**,
because the farmer is standing in a field and the whole point is that he sees the grade and
the improvement tip before he lists the lot. So the formula lives in two places — our
TypeScript and your Python — and **the two must agree exactly**, digit for digit, because
`POST /lots/{id}/assay` will return the server's score and a farmer who saw 748 on the
previous screen and 749 on the next one stops trusting the number.

CANON §9, transcribed:

```python
score = (200*(size_uniform-1)/2 + 150*(colour_uniform-1)/2 + 200*(sprouting-1)/2
         + 250*(1 - damage_pct/100) + 100*(moisture_feel-1)/2 + 100*(foreign_matter-1)/2)   # 0..1000

grade = 'A' if score >= 750 else 'B' if score >= 500 else 'C'
grade_multiplier = {'A': 1.00, 'B': 0.92, 'C': 0.80}
weakest_dimension = the dimension contributing the largest shortfall vs its weight
```

Five dimensions are `1|2|3`; `damage_pct` is `0..100`. Weights: size 200, colour 150,
sprouting 200, damage 250, moisture 100, foreign matter 100 — summing to 1000.

### 8.1 Two ambiguities we cannot resolve from the document

**(a) Rounding.** `grade_assays.score` is an `int` column, but `250*(1 - damage_pct/100)`
produces a fraction for any `damage_pct` not a multiple of 2, and the `(x-1)/2` terms produce
halves for the middle value. So the real formula has a rounding step that CANON does not
state. **Is it `floor`, or round-half-up, or is the sum computed in float and rounded once at
the end?**

The three disagree. At `damage_pct = 15` with all five others at 2:
`200*0.5 + 150*0.5 + 200*0.5 + 250*0.85 + 100*0.5 + 100*0.5 = 375 + 212.5 = 587.5`.
Floor gives 587, round gives 588. Neither crosses a grade boundary here, but a value that
lands on 749.5 does, and that is a B on one implementation and an A on the other.

**Our request: round once at the end, half-up, and say so.** We will implement whatever you
choose; we need it named. Per CLAUDE.md §5 money arithmetic is `//` and never `/` — but this
is a 0..1000 score, not money, so the integer-division rule does not settle it. We are
carrying a pinning test at exactly 750 and 500 either way.

**(b) `weakest_dimension` tie-break.** "Largest shortfall vs its weight" is unambiguous until
two dimensions tie — which happens constantly, because five of the six inputs have only three
possible values. Two dimensions both at `1` with weights 200 and 200 (size and sprouting) both
have a shortfall of 200. **Which one is reported?**

It matters because `weakest_dimension` drives the improvement tip, and the tip is the most
actionable thing on the screen: *"तुमचा माल ग्रेड B आहे. माती काढून चाळल्यास ग्रेड A मिळू शकतो —
अंदाजे ₹८० प्रति क्विंटल जास्त."* Telling a farmer to fix his colour uniformity when the real
problem is sprouting wastes the one instruction he gets.

**Our request: a fixed precedence order, declared once** — we suggest
`damage_pct → sprouting → size_uniform → colour_uniform → moisture_feel → foreign_matter`,
which is descending by weight with damage first since it is the only continuous input and the
only one a farmer can partially fix. Any deterministic order works; what we cannot have is
"whichever the dict iterates first", because that differs between our implementation and yours.

### 8.2 What the assay response needs

- `score: number` (0..1000, integer), `grade: 'A'|'B'|'C'`, `weakest_dimension: string` from a
  **closed set** we can switch on — the six input names. `weakest_dimension` is `not null` in
  the DDL, so there is always one, even on a perfect 1000. What is it then? (Q7.)
- **The improvement tip in Marathi, server-side, rendered verbatim.** We will not compose it
  client-side from a template, because the rupee figure in it ("₹८० प्रति क्विंटल जास्त") is a
  money number and money numbers are not assembled in a view.
- The tip's rupee delta must come from `grade_multiplier` against a real price, not a constant.
  A → B is an 8% haircut and B → C is 20%; on a 40-quintal lot those are very different
  sentences.
- **`grade` here has three values.** `lots.grade` has **four** — it includes `'UNGRADED'`.
  Do not collapse them; a lot that has not been assayed is not a grade C lot, and S15 shows
  them differently.
- **The photo is evidence, not classifier input.** The DDL says so and we agree. **S13 must
  produce a grade with no photo at all** — a farmer with a cracked camera still gets a grade.
  If your endpoint requires `photo_path`, P9 breaks.

---

## 9. CANON §10 FPO split — S16 renders the maths, so the maths must be auditable

```python
weight_i    = qty_kg_i * grade_multiplier(score_at_pool_i)
share_bps_i = floor(10000 * weight_i / Σ weight)
# distribute the rounding remainder to the largest weight so Σ share_bps == exactly 10000
```

S16 is read-only in Phase 1 and it shows the whole table: each member's quantity, their
score at pooling, their weight, their share in bps, and their gain versus selling alone. We
show `weight` because CANON says it is *"exposed so the maths is auditable"* — and that is the
answer to "how do I know the FPO isn't cheating me", which is the question this screen exists
to answer.

**What we need, and each of these is a thing the screen would otherwise get wrong:**

- **`Σ share_bps == exactly 10000.**` Not 9999, not 10001. We render each share as a
  percentage and we render the total; a total of 99.99% on a screen about fairness is worse
  than no screen. The remainder goes to the largest weight per CANON.
- **`score_at_pool` is a snapshot, and we display it as one.** CANON: *"A regrade after
  pooling must not retroactively change an agreed split."* If a member regrades from B to A
  after joining, `score_at_pool` stays at the B value and the split does not move. S16 labels
  the column as the score at the time of pooling for exactly this reason. Do not recompute it
  from the current assay.
- **`vs_solo_paise` can be negative, and when it is, the pool must not form.** This is the
  Pareto guard, and it is the reason CANON gives for it that matters: *"A pooling mechanism
  that can quietly harm a member is exactly what FPOs are distrusted for."*

  **Send the negative number.** Do not clamp it to zero, do not omit the member, do not
  return the pool as formed. S16's honest state is *"this pool does not form, and here is who
  it would have hurt"* — and that state is built. A pool that silently drops the harmed member
  and shows a happy split for the rest is the single worst thing this screen could do.
- **`consented` is nullable and that is three states, not two.** `null` = not asked yet,
  `false` = asked and refused, `true` = agreed. S16 renders all three differently, and
  collapsing null into false turns "we haven't asked her" into "she said no".
- **`all_consented`** on the pool response is a convenience we read directly; it must be the
  conjunction over members, including treating `null` as not-consented.
- `grade_multiplier` must be the same `{A: 1.00, B: 0.92, C: 0.80}` used in §8. If the split
  uses different multipliers than the grading screen, two screens disagree about what a B is.
- **`farmer_name` on each split row.** `pool_members` has no name column, so this is a join
  on your side. Without it S16 shows member ids, and a farmer cannot find himself in the table.
  See Q3 in the backend doc — this is the same `SplitRow` ask.

---

## 10. I16 — both numbers, always. This one is on us, and it constrains you too.

> *"The worst case renders at the **same font size** as the expected gain — never smaller,
> greyer, collapsed, or behind a tap."*

S9 renders `expected_gain_paise` and `worst_case_paise` at **28sp each**, same weight, same
opacity, adjacent, both visible without scrolling. There is a test that asserts the two font
sizes are equal, so the build fails if anyone ever "tidies" the worst case into a caption.
That is our side of it and it is done.

Your side of it is three things:

1. **`worst_case_paise` must always be non-null when `expected_gain_paise` is non-null.** If
   the gain arrives with a null worst case, the pair breaks and we would have to either hide
   the gain or show it alone. We will hide the gain. A confident number with no downside next
   to it is the thing I16 exists to prevent, and shipping it would be worse than shipping
   nothing.
2. **It must be the real p10 outcome, negative, not a decorative figure.** It comes from the
   identity in §3.1 and nowhere else.
3. **`explain_mr` must not undersell it.** The sentence is rendered verbatim and it is the
   only prose on the screen. If it says only *"११ दिवस थांबल्यास सरासरी ₹६,२९० जास्त मिळू शकतात"*
   the numbers carry the honesty by themselves — which they do, at equal size. But if the
   sentence editorialises the downside away, the screen and the sentence disagree. Prefer a
   sentence that mentions both, in Marathi, from your side.

This is the invariant that makes the difference between a product that tells a farmer to wait
and a product that tells him what waiting costs if it goes wrong. Every farmer who reads this
screen is deciding whether to gamble money he does not have. **The downside is not a caveat on
the recommendation; it is half of the recommendation.**

---

## 11. Open questions

| # | Question | Blocks | Our default if you don't answer |
|---|---|---|---|
| **Q1** | Confirm `AltMarket` as four fields (§7), or send yours. Is it guaranteed non-null on `SELL_ELSEWHERE`? | S9 SELL_ELSEWHERE | We ship the four fields and treat a null as SELL_NOW |
| **Q2** | Grading: **floor, round-half-up, or float-then-round-once**? (§8.1a) | S13, and its pinning test | Round half-up, once, at the end |
| **Q3** | Grading: the `weakest_dimension` **tie-break order**? (§8.1b) | S13's improvement tip | `damage → sprouting → size → colour → moisture → foreign_matter` |
| **Q4** | Does `SPLIT` carry a ratio (e.g. `split_now_bps`)? Today S9 renders it with prose only. | S9 SPLIT verdict | `SPLIT` renders like `HOLD` plus the explain string |
| **Q5** | Is the p10 ≤ p50 ≤ p90 ordering enforced in `predict.py`, or should we clamp? | S5 band polygon | We assume enforced and do not clamp |
| **Q6** | Does `/ai/model-card` need a token? Does `/ai/forecast`? | S8, S5 | Both authenticated; we'd prefer model-card open |
| **Q7** | What is `weakest_dimension` on a perfect 1000 score? (`not null` in the DDL.) | S13 edge case | The lowest-precedence dimension, tip suppressed |
| **Q8** | Is the improvement tip's Marathi string on the assay response, or do we compose it? | S13 | On the response, rendered verbatim |
| **Q9** | Do `storage_paise_per_qtl` / `spoilage_paise_per_qtl` scale with `hold_days`? | S10's whole argument | Yes, they scale; the other three don't |
| **Q10** | Is `pledge_quote.days` always equal to `hold_days`? | S11 | Yes |
| **Q11** | Which of the four `refusal_reason` values are reachable in seeded data? | the demo's best moment | `BAND_TOO_WIDE` at minimum |
| **Q12** | Is `matches[].score` yours or Akash's? It's the only float in the whole contract. | our no-float review rule | Akash's; asked as Q8 in the backend doc |

---

## 12. What we test against today

Two fixture files, both shaped exactly to CANON §7.4, both under test:

| File | Contents |
|---|---|
| `app/src/fixtures/forecast.ts` | a 14-point `ForecastRes` with a monotone band and an inline `model_card` |
| `app/src/fixtures/window.ts` | a **HOLD** with a non-null `pledge_quote`, and a **`NO_ADVICE` / `BAND_TOO_WIDE`** refusal |

The HOLD fixture is CANON's own worked example, kept numerically identical on purpose:
`sell_now_net 193925`, `hold_p50_net 209650`, `hold_p10_net 181925`, `qty_kg 4000`,
`expected_gain_paise 629000`, `worst_case_paise −480000`, costs summing to `15535`,
`band_width_bps 2140`, `confidence MEDIUM`, `hold_days 11`, `mase 0.71`,
`coverage_80_bps 7840`, `data_source AGMARKNET`.

**The fastest possible merge check** is to diff one real response against
`app/src/fixtures/window.ts`. If the keys match and the two identities in §3.1 hold, S9, S10
and S11 work with no code change. If a key is missing, that is the whole conversation, and
finding it that way takes a minute instead of finding it on stage.

There are **no fixtures for `/ai/pledge/quote` as a standalone endpoint** — we only consume
the pledge through `window.pledge_quote`. If you intend the standalone route to be used
directly, tell us and we will build against it; otherwise we will keep reading the embedded
card, which is the shape I13 is enforced in.

---

### Acceptance — how we will know the AI merge worked

- [ ] `POST /ai/window/recommend` returns 200 for every one of the five actions, and **never
      500** — including with the model deliberately unloaded.
- [ ] On `NO_ADVICE`: `refusal_reason` non-null, `costs` populated,
      `sell_now_net_paise_per_qtl` populated, all four forecast-derived fields `null` and
      **present**.
- [ ] `expected_gain_paise` and `worst_case_paise` satisfy the §3.1 identities, checked by
      hand on a 40-quintal lot. The gain reads **₹6,290**, not ₹62,900.
- [ ] `worst_case_paise` is negative on a HOLD.
- [ ] `costs.total_paise_per_qtl` equals the sum of the other five.
- [ ] `p10 ≤ p50 ≤ p90` on all 14 forecast points.
- [ ] `coverage_80_bps` and `mase` are measured, not constants, and agree with what
      `/meta/data-provenance` says about the same corpus.
- [ ] Our TS grading implementation and your Python one produce the **same integer** for the
      same six inputs, at the boundaries 750 and 500.
- [ ] `Σ share_bps == 10000` on every seeded pool.
- [ ] A pool with a negative `vs_solo_paise` does **not** form, and the member is still
      visible.
- [ ] `pledge_quote` is `null` — not a card with `is_worthwhile: false` — whenever interest
      ≥ expected gain.
- [ ] `npx tsc --noEmit` clean and `npx jest` (unfiltered) green with real responses typed.

**When these pass, no screen changes.** That is the point of writing it down before the two
halves meet.

*Companion: `FRONTEND_NEEDS_BACKEND.md` — transport, auth, reference data, lots, offers,
escrow, provenance.*













