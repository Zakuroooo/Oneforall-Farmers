# NILESH — Decision Engine

> **You own the hero endpoint.** `POST /api/v1/ai/window/recommend` is the product. Everything else on screen exists to make your answer credible.
> This file is your PRD, your TRD, and your task list. Read it, then `docs/architecture/05_AI_ARCHITECTURE.md` §1 and §3, then `00_CANON.md` §7. Then start on L0.

---

## PART 1 — PRD · What you are building and why

### 1.1 Your mission in one sentence

**Turn a forecast into a decision a farmer can act on — and refuse when you can't.** Nikhil gives you 14 days of p10/p50/p90. You give a farmer one word, one rupee figure, one worst case, and the arithmetic that got you there.

### 1.2 The endpoint

**The response shape below is copied from `00_CANON.md` §7.4. That document is authoritative — if this file ever disagrees with it, CANON wins and this file is a bug.** Akash's `schemas.py` enforces the CANON shape and Pranay's screens read it directly. Do not invent a field.

```
POST /api/v1/ai/window/recommend
  { commodity_id, market_id, qty_kg, grade, lot_id?, horizon_days }
    ↓
  { action, hold_days, confidence, band_width_bps,

    sell_now_net_paise_per_qtl,          # what he gets if he sells today, net
    hold_p50_net_paise_per_qtl,          # median outcome at the recommended day, net
    hold_p10_net_paise_per_qtl,          # downside outcome at that day, net

    expected_gain_paise,                 # TOTAL for the lot, not per qtl
    worst_case_paise,                    # TOTAL for the lot — usually NEGATIVE

    costs: { transport_paise_per_qtl, commission_paise_per_qtl,
             storage_paise_per_qtl, spoilage_paise_per_qtl,
             loading_paise_per_qtl, total_paise_per_qtl },

    alt_market,                          # AltMarket | null  (set on SELL_ELSEWHERE)
    pledge_quote,                        # PledgeQuote | null (null per I13)
    refusal_reason,                      # string | null
    model_card: { mase, coverage_80_bps },
    explain_mr, explain_en, data_source }
```

**Every key is always present.** `pledge_quote: null` is required; a missing `pledge_quote` is a contract violation even though JS treats them the same. Pranay writes `res.pledge_quote && <PledgeCard/>` and that only works if the key exists.

Two shapes that do **not** exist, because people expect them and they are not in CANON:
- **no `best_case_paise`** — the upside is carried by `hold_p50_net_paise_per_qtl` against `sell_now_net_paise_per_qtl`. I16 asks for the *worst* case next to the expected one, not a third number.
- **no `confidence_bps`** — `confidence` is the string `'HIGH' | 'MEDIUM' | 'LOW'`, and `band_width_bps` is the raw width. Pranay renders confidence as dots (`●●●○`), never a percentage, because *"78% confident"* is a number a farmer will read as a probability of profit and it is not one.

Five actions, and **all five must be reachable** in the seeded data:

| Action | When |
|---|---|
| `SELL_NOW` | Waiting does not pay after costs, or the forecast trends down |
| `SELL_ELSEWHERE` | A different market's **net** beats this one's by more than the extra transport |
| `HOLD` | Expected gain from waiting exceeds all holding costs, with an acceptable band |
| `SPLIT` | Sell part now for liquidity, hold part — when the gain is real but the risk is material |
| **`NO_ADVICE`** | **The band is too wide, the history too short, or the data too stale to say anything honest** |

### 1.3 ★ NO_ADVICE is not an error path. It is the feature.

**Demo beat 11 — the beat that wins the room** — is your endpoint declining to answer. Read `11_DEMO_AND_PITCH.md` §1 beat 11 and §4 question 4 before you write `decide()`.

Four refusal reasons, each returned explicitly:

| `refusal_reason` | Condition |
|---|---|
| `BAND_TOO_WIDE` | `band_width_bps > NO_ADVICE_BAND_BPS` (config, ~3500 = 35%) |
| `INSUFFICIENT_HISTORY` | Fewer than N observations for this (commodity, market) |
| `STALE_DATA` | The latest observation is older than the freshness threshold |
| `GAIN_BELOW_COST` | The expected gain does not clear the costs by a meaningful margin |

**The refusal is the same response shape, with nulls — not a different shape, and never an error status.** From CANON §7.4:

```
action: 'NO_ADVICE'
hold_days: null                    expected_gain_paise: null
hold_p50_net_paise_per_qtl: null   worst_case_paise: null
hold_p10_net_paise_per_qtl: null   pledge_quote: null
confidence: 'LOW'                  refusal_reason: 'BAND_TOO_WIDE'
band_width_bps: 5820               ← still real; it is the evidence FOR refusing

sell_now_net_paise_per_qtl: 193925 ← still returned. He can still sell today.
costs: { ...all six... }           ← still returned. Costs are KNOWN even when the forecast is not.
```

Those last two lines are the design. A refusal that also blanks the spot price and the costs has told the farmer nothing at all; a refusal that says *"we won't forecast, but here is what you'd net today and exactly what it costs you"* is still useful. **We refuse the prediction, not the service.**

The reason is not for logging. **Pranay renders it as Marathi text on screen** — *"किंमतीचा अंदाज खूप अनिश्चित आहे"* — so the farmer is told *why* nothing is being claimed. A refusal with no reason reads as a bug; a refusal with a reason reads as integrity.

**The threshold is a config constant, not a magic number in a function body.** A judge may ask *"why 35%?"* and the honest answer is *"it's a tuned threshold, it's in config, and here's the coverage number it was tuned against."* That is a passing answer. A hardcoded `0.35` buried in an `if` is not.

### 1.4 I16 — both numbers, always

Your response carries **two lot totals** and **three per-quintal net figures**, and none of them are optional:

```
expected_gain_paise             TOTAL gain for the lot at p50, net of every cost
worst_case_paise                TOTAL outcome for the lot at p10, net       ← usually NEGATIVE

sell_now_net_paise_per_qtl      net per qtl if he sells today
hold_p50_net_paise_per_qtl      net per qtl at the recommended day, median
hold_p10_net_paise_per_qtl      net per qtl at the recommended day, downside
```

The two totals are what the farmer reads; the three per-qtl figures are what makes them checkable. `expected_gain_paise` is `(hold_p50_net − sell_now_net) × qty_qtl`, and a judge who does that multiplication on a phone calculator must get your number back exactly. That is why they are all in the response instead of just the total.

**`worst_case_paise` must be computed honestly.** It is the p10 price at the recommended sell day, minus every holding cost that accrued, times the quantity. On the seeded onion HOLD it comes out around **−₹4,800** on 40 quintals against a +₹6,290 expected gain, and that negative number goes on screen in the same font size as the positive one.

If you find yourself tempted to compute the worst case as "expected gain minus a small buffer" so it looks less alarming — that is the exact failure this invariant exists to prevent. The whole pitch is *"he gets both numbers or neither."*

### 1.5 The cost stack — **six** lines, every rupee itemised

`00_CANON.md` §7.4 defines exactly six keys under `costs`. Not five. All six are `_paise_per_qtl`.

```
gross    = p_forecast * qty_qtl
        −  transport      (₹/qtl/km × distance, from Kartik's cost table)   per trip
        −  commission     (basis points of gross — APMC mandi fee)          per trip
        −  loading        (hamali — flat ₹/qtl to load and unload)          per trip
        −  storage        (₹/qtl/day × hold_days)                           per DAY held
        −  spoilage       (bps of quantity per day × hold_days, crop-specific)  per DAY held
        =  net
```

The demo lot's six lines, from CANON:

```
transport   8000
commission  3075
storage     1650
spoilage    2310
loading      500
─────────────────
total      15535        ← 8000+3075+1650+2310+500. Check this by hand; the test does too.
```

**Two of the six scale with `hold_days` and four do not.** Storage and spoilage are the holding costs — a cost that does not depend on how long he waits is not a holding cost, it is a cost of selling at all, and it is subtracted from *both* the sell-now net and the hold net so it cancels out of the gain. Getting that wrong is how you produce a HOLD recommendation that charges transport twice.

**Spoilage is what makes the HOLD advice honest.** Onion loses weight and quality in storage. A model that forecasts a 15% price rise over 12 days and ignores 4% spoilage has advised a farmer into a loss while showing him a gain.

Pranay's S10 renders **all six lines** and they **must sum to `total_paise_per_qtl`** exactly. He will check it by hand and file a blocker if they do not.

### 1.6 The pledge quote — and I13

`domain/pledge.py` simulates an eNWR-style warehouse-receipt loan so the farmer can see whether borrowing lets him wait.

**I13, and it is the most principled line of code in the repository:**

```python
def quote(gain_paise: int, hold_days: int, qty_kg: int, ...) -> PledgeQuote | None:
    """Returns None when the interest cost meets or exceeds the expected gain.
    A product that recommends a loan the farmer loses money on is a lender, not an advisor."""
    if interest_paise >= gain_paise:
        return None
```

Return `None`, not a quote with a warning flag. When you return `None`, **Pranay's pledge card does not render at all** — the farmer never sees a loan option that would cost him more than it earns.

Your answer to question 9 (*"aren't you just replacing the middleman with yourself?"*) ends with this:

> *"...and if our pledge simulation ever costs more in interest than the expected gain, the app doesn't show it at all. We wrote that as a rule in the code, not a promise in a slide."*

**Label it honestly.** Every pledge response carries `"Indicative simulation — not a lender quote"`. We are not a lender and no LTV or interest figure goes on a slide until it is verified against WDRA's published terms with the source URL recorded.

### 1.7 What you own

| | |
|---|---|
| **Files** | `api/app/domain/decide.py`, `costs.py`, `pledge.py`, `config.py` (thresholds), `api/app/routers/window.py`, `routers/ai.py`, `api/tests/test_decide.py` |
| **You consume** | Nikhil's `predict_quantiles()` · Kartik's cost table + price rows |
| **Not yours** | `app/ml/**` (Nikhil) · `routers/prices.py` + ingestion (Kartik) · everything else in `api/app/` (Akash) · all UI |

---

## PART 2 — TRD · How you build it

### 2.1 `decide()` — a pure function, and that is the point

```python
# api/app/domain/decide.py
def decide(
    quantiles: list[QuantileTriple],      # 14 triples from Nikhil
    spot_paise_per_qtl: int,
    qty_kg: int,
    costs: CostInputs,                    # rates, distance, crop spoilage bps
    cfg: DecisionConfig,                  # thresholds
    history_len: int,
    latest_obs_date: date,
    as_of: date,
) -> Decision:
    """Pure. No DB, no HTTP, no clock. Everything it needs is an argument."""
```

**No database call, no network call, no `date.today()` inside this function.** Everything comes in as an argument. That is what lets you write eight pytest cases that run in milliseconds and pin every branch — including the four refusals — before Nikhil's model exists.

The router does the I/O; `decide()` does the thinking.

### 2.2 Build against a stub, from hour one

```python
# api/tests/conftest.py
def stub_quantiles(base=185000, drift=1200, spread=9000) -> list[QuantileTriple]:
    return [QuantileTriple(horizon=h,
                           p10=base + drift*h - spread,
                           p50=base + drift*h,
                           p90=base + drift*h + spread) for h in range(1, 15)]
```

**Do not wait for the model.** Write `decide()` and all eight tests against this stub. When Nikhil's `predict_quantiles()` lands you change one line in the router. If you wait for N2 you lose six hours you do not have.

### 2.3 The eight test cases — write these before the implementation

From `02_TRD_SYSTEM_DESIGN.md` §12. Each pins one branch:

| # | Setup | Expect |
|---|---|---|
| 1 | Flat forecast, normal costs | `SELL_NOW` |
| 2 | Strong upward drift, tight band | `HOLD`, `expected_gain_paise > 0` |
| 3 | Upward drift, band **wider than threshold** | `NO_ADVICE`, `BAND_TOO_WIDE` |
| 4 | `history_len` below minimum | `NO_ADVICE`, `INSUFFICIENT_HISTORY` |
| 5 | `latest_obs_date` far behind `as_of` | `NO_ADVICE`, `STALE_DATA` |
| 6 | Small drift that does not clear storage + spoilage | `SELL_NOW` or `GAIN_BELOW_COST` |
| 7 | Real gain, material downside | `SPLIT` |
| 8 | Another market's net clearly higher | `SELL_ELSEWHERE` |

Plus three invariant tests that are not about actions at all:

- **`worst_case_paise <= expected_gain_paise`**, always. (There is no `best_case_paise` — see §1.2.)
- **the six cost lines sum to `total_paise_per_qtl`**, exactly — integer arithmetic, so this is `==`, never `approx`:
  ```python
  c = res.costs
  assert (c.transport_paise_per_qtl + c.commission_paise_per_qtl
          + c.storage_paise_per_qtl + c.spoilage_paise_per_qtl
          + c.loading_paise_per_qtl) == c.total_paise_per_qtl
  ```
- **every key in CANON §7.4 is present on every response, including all four refusals.** Assert on the key set, not on the values:
  ```python
  assert set(res.model_dump()) == EXPECTED_KEYS      # same set for HOLD and for NO_ADVICE
  ```
  This is the test that catches the failure mode where a refusal path returns a trimmed object and Pranay's screen renders `undefined` on stage.

### 2.4 Money — integer paise, floor division

```python
commission_paise = gross_paise * commission_bps // 10_000       # correct
commission_paise = int(gross_paise * commission_bps / 10_000)   # WRONG — float in the middle
```

The wrong line is right most of the time, which is exactly what makes it dangerous. **`//` everywhere.** Never `float`, never `Decimal` in the response, never a rupee value — integer paise from the DB to the wire (I1). Quantities are integer kg (I2): `qty_qtl = qty_kg // 100`.

### 2.5 ★ L7 — the endpoint must never 500

```python
@router.post('/ai/window/recommend', response_model=WindowRes)
async def recommend(body: WindowReq, actor=Depends(guard), db=Depends(get_db)) -> WindowRes:
    try:
        q = predict_quantiles(body.commodity_id, body.market_id, as_of)
    except Exception:
        log.exception('forecast unavailable')
        return _refusal('NO_ADVICE', 'INSUFFICIENT_HISTORY', spot=spot)   # 200, not 500
```

**Test this by deleting the model pickle and calling the endpoint.** It must return `200` with `action: 'NO_ADVICE'`.

Why this matters more than it looks: a 500 on stage is a red error toast and a dead screen. A refusal on stage is **the beat that wins the room**. The failure mode and the showcase feature are the same screen — so make every failure path land on the showcase.

### 2.6 Persist every recommendation

Each call writes a `recommendations` row: inputs, the action, the numbers, `model_version`, `created_at`.

This costs you fifteen minutes now and it is the **entire foundation of Phase 2's F20 realisation tracking** (`09_PHASE_2.md`) — the trust flywheel where you compare what you advised against what actually happened. Without the row, that comparison is impossible forever. With it, Phase 2 has a dataset from day one.

It is also the honest answer to *"how do you know your advice is any good?"* — **"we log every recommendation and Phase 2 measures the realised outcome against it."**

### 2.7 Your other two endpoints

- **`GET /ai/forecast`** — the 14-day triples for Pranay's fan chart. Pass through, all three quantiles or nothing.
- **`GET /ai/model-card`** — reads Nikhil's measured `mase` and `coverage_80_bps` from `model_runs`, plus `known_limitations`. **Never hardcode these numbers.** The card must reflect the last actual training run, or it is marketing.

### 2.8 Your definition of done

1. All **eight** pytest cases pass, plus the **three** invariant tests.
2. All five actions reachable against seeded data — demonstrated, not argued.
3. `NO_ADVICE` returns the correct `refusal_reason` for each of the four conditions.
4. Thresholds in config, not inline. You can state the value and why.
5. `worst_case_paise` computed from p10 honestly. Negative when it should be negative.
6. The **six** cost lines sum to `total_paise_per_qtl` exactly.
7. `pledge.quote()` returns `None` when interest ≥ gain. Tested.
8. **Model pickle deleted → endpoint still returns 200 with a refusal.** Tested by actually deleting it.
9. Every call writes a `recommendations` row.
10. Pushed to `nilesh`.

---

## PART 3 — Your tasks, in order

| # | Task | Done when | Blocked by |
|---|---|---|---|
| **L0** | **`config.py` + `costs.py`** — thresholds, the cost stack | **Six** cost lines sum to `total_paise_per_qtl`, integer, `//` only | Kartik's cost table (hardcode it first) |
| **L1** | **★ `decide()` against the stub** + the eight tests | `pytest` green on all 8 + the 3 invariant tests | nothing — **use the stub** |
| **L2** | **All five actions reachable** | Each of the 5 produced by a real seeded input | L1 |
| **L3** | **★★ NO_ADVICE with all four reasons** | Each reason returned by its own condition, tested | L1 |
| **L4** | **`pledge.py`** — indicative quote, **`None` when not worthwhile** | Interest ≥ gain → `None`, and Pranay's card vanishes | L1 |
| **L5** | **`POST /ai/window/recommend`** + persist a `recommendations` row | Pranay's S9 renders from the live endpoint | L1, Nikhil N2, Akash A0 |
| **L6** | **`GET /ai/forecast` + `/ai/model-card`** | Card shows Nikhil's **measured** MASE + coverage from `model_runs` | Nikhil N4 |
| **L7** | **★ Never 500** — delete the pickle, endpoint still 200s | `mv` the pickle away, call it, get a refusal | L5 |
| **L8** | **Rehearse questions 4 and 9** | Two sentences each, out loud, without notes | H33 |

**L1 is not blocked by anything.** Nikhil's model is not a prerequisite — the stub is. Start `decide()` in the first hour; you are the only person on the team whose most important work has no upstream dependency.

### Why L3 gets two stars

`NO_ADVICE` is the highest-leverage twenty lines in this repository. It is:
- **Invariant I6**
- **Demo beat 11**, the closing beat
- **Question 4's answer** (*"what if the model is wrong?"* → *"let me show you the refusal"*)
- The thing that makes every other number in the pitch credible

Twenty lines. Get them right and rehearse showing them.

---

## PART 4 — Blocked?

1. No model? **Use the stub.** That is the design, not a workaround.
2. No cost table? Hardcode plausible rates in `config.py`, mark `TODO(kartik):`, swap later.
3. Need a schema field? Ask Akash — additive, cheap.
4. Otherwise: `docs/BLOCKERS.md` + group chat, within 30 minutes.

**Do not edit `app/ml/**`.** If `predict_quantiles()` has the wrong signature, that is a two-minute conversation with Nikhil.

---

## PART 5 — On demo day

You take **question 4** (*"what if the model is wrong?"*) and **question 9** (*"aren't you just replacing the middleman?"*), plus anything about costs, thresholds, or the pledge maths.

Question 4's answer, verbatim from the pitch doc:

> *"Then the farmer loses money, which is why the worst case is in the same font size as the expected gain, and why the app refuses when the band is too wide. Let me show you the refusal."*

Then **hand it to beat 11.** Do not explain the refusal — show it. A judge watching a product decline to answer remembers that far longer than any explanation of why it declined.

Have ready:
- The `NO_ADVICE_BAND_BPS` value and why it is that number
- The **six** cost lines for the demo lot, memorised (8000 · 3075 · 1650 · 2310 · 500 → 15535)
- The one sentence on I13: *"if the interest exceeds the gain, the card doesn't render"*

**Two sentences, then stop.** The most common way a good answer becomes a bad one is a third sentence nobody asked for.
