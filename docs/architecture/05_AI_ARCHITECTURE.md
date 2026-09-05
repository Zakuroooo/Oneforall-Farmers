# 05 — AI / ML ARCHITECTURE

> **Owners: Nikhil (forecasting) + Nilesh (decision engine).**
> Nikhil owns `api/app/ml/**`. Nilesh owns `domain/window.py`, `domain/costs.py`, `domain/pledge.py`, `routers/ai.py`, `schemas/ai.py`.
> Read `00_CANON.md` §7.4 (the hero contract) and `02_TRD_SYSTEM_DESIGN.md` §4 (the traced path) first.

**The split, in one line:** Nikhil produces a `(p10, p50, p90)` triple per future day. Nilesh turns triples into a rupee decision a farmer can act on. **Nilesh does not need Nikhil to finish.** He builds against a stub from H2 and swaps in the real function at H12 — one import line. That decision removes the longest serial dependency in the project; do not undo it.

---

## 1. The intellectual position — read this before you code

Most hackathon "AI for agriculture" projects predict a price and print it big. That is a guess with a chart on it.

Three things separate us:

1. **We predict an interval, not a number.** p10/p50/p90. A point forecast for onion — which moves 40% in a week — is not intelligence.
2. **We measure the interval.** MASE against a seasonal-naive baseline, and *empirical coverage* of the p10–p90 band. If we claim 80% and observe 45%, our band is a decoration.
3. **We let the model refuse.** When the band is too wide to act on, the answer is **NO_ADVICE**, not a shrug-shaped HOLD. A wrong HOLD costs a farmer real money on real onions.

> A judge who has seen twenty price-prediction demos has never seen one that declines to answer. Refusal is our strongest single moment and it costs about forty lines of code.

**And what we are explicitly *not* building in Phase 1:** a generative LLM that advises farmers. Nilesh's decision layer is deterministic arithmetic over a forecast triple. An LLM that hallucinates "hold for 12 days" inverts the entire product thesis. See §9.

---

## 2. Nikhil's lane — the forecast

### 2.1 Model choice

**LightGBM with `objective='quantile'`.** Three models per (commodity, market), α ∈ {0.1, 0.5, 0.9}.

| Rejected | Why |
|---|---|
| ARIMA / SARIMA | Gaussian intervals; onion price distributions are fat-tailed and skewed. Also a poor story: "we used a 1970s method." |
| LSTM / Transformer | 400 rows. It will overfit, take 4 hours, and you cannot explain it in 45 seconds. |
| Prophet | Fine baseline, weak quantiles, and its trend changepoints hallucinate on volatile series. |
| Point regression + a fudged ±10% band | This is the thing we are explicitly better than. |

**LightGBM quantile is the right answer and it is also the answer you can defend:** it optimises pinball loss directly, so p10 and p90 are honestly-fit conditional quantiles rather than a mean with error bars bolted on.

### 2.2 Features — `ml/features.py`

Input: a DataFrame of `(obs_date, modal_paise_per_qtl, min, max, arrivals_qtl)` sorted by date.

```python
LAGS = [1, 2, 3, 7, 14, 21, 28]
ROLL = [7, 14, 30]

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    X = pd.DataFrame(index=df.index)
    for L in LAGS:
        X[f"lag_{L}"]       = df.modal_paise_per_qtl.shift(L)
    for W in ROLL:
        X[f"roll_mean_{W}"] = df.modal_paise_per_qtl.shift(1).rolling(W).mean()
        X[f"roll_std_{W}"]  = df.modal_paise_per_qtl.shift(1).rolling(W).std()
        X[f"roll_min_{W}"]  = df.modal_paise_per_qtl.shift(1).rolling(W).min()
        X[f"roll_max_{W}"]  = df.modal_paise_per_qtl.shift(1).rolling(W).max()
    # momentum — is it rising or falling, and how fast
    X["mom_7"]  = df.modal_paise_per_qtl.shift(1) - df.modal_paise_per_qtl.shift(8)
    X["mom_14"] = df.modal_paise_per_qtl.shift(1) - df.modal_paise_per_qtl.shift(15)
    # intraday spread — a proxy for market disagreement / thin trade
    X["spread"] = (df.max_paise_per_qtl.shift(1) - df.min_paise_per_qtl.shift(1))
    # arrivals: THE supply signal. glut -> price falls. this is the domain feature.
    X["arr_lag_1"]        = df.arrivals_qtl.shift(1)
    X["arr_roll_mean_7"]  = df.arrivals_qtl.shift(1).rolling(7).mean()
    X["arr_ratio"]        = X.arr_lag_1 / X.arr_roll_mean_7          # >1 = glut
    # calendar — cyclical, not raw integers
    X["dow"]        = df.index.dayofweek
    X["month_sin"]  = np.sin(2*np.pi*df.index.month/12)
    X["month_cos"]  = np.cos(2*np.pi*df.index.month/12)
    X["doy_sin"]    = np.sin(2*np.pi*df.index.dayofyear/365)
    X["doy_cos"]    = np.cos(2*np.pi*df.index.dayofyear/365)
    return X
```

**Three rules, all of which are how people quietly cheat at this:**

1. **`.shift(1)` on every rolling window.** Without it, `roll_mean_7` at day *t* includes day *t* — the model sees the answer, your backtest looks superb, and production is garbage. This is the single most common leak in time-series ML.
2. **`month_sin`/`month_cos`, not `month`.** December and January are adjacent; the integers 12 and 1 are not.
3. **`arr_ratio` is your best domain feature.** Arrivals 2× the weekly mean means a glut, which means the price falls. That is *agricultural* signal, not statistical signal, and it is what makes the model defensible to a domain expert.

### 2.3 Multi-horizon strategy

You need 14 days ahead, not 1. **Use direct multi-horizon, not recursive.**

```python
# For horizon h, the target is the price h days ahead.
for h in range(1, 15):
    y_h = df.modal_paise_per_qtl.shift(-h)
    # train 3 quantile models on (X, y_h)
```

**Recursive** (predict day 1, feed it back to predict day 2) **compounds error and — worse — collapses the uncertainty band**, because you feed the *median* forward and lose the tails. Your p10–p90 at day 14 would be absurdly narrow, coverage would fail, and the honesty claim would break.

That is 14 horizons × 3 quantiles = **42 tiny models per commodity**. LightGBM on 400 rows trains in well under a second each. Total training time is seconds, not minutes. Do not optimise this.

**If you are short on time:** train only horizons {1, 3, 7, 14} and linearly interpolate the rest. Say "we train at four horizons and interpolate" — that is an honest engineering tradeoff, and it is fine.

### 2.4 Training — `ml/train.py`

```python
import lightgbm as lgb

PARAMS = dict(
    objective="quantile",
    metric="quantile",
    n_estimators=300,
    learning_rate=0.05,
    num_leaves=15,          # SMALL. 400 rows. do not let it memorise.
    min_child_samples=10,
    subsample=0.8,
    colsample_bytree=0.8,
    verbose=-1,
)

def train_one(X, y, alpha: float):
    return lgb.LGBMRegressor(**PARAMS, alpha=alpha).fit(X, y)
```

Artifact layout:
```
api/app/ml/artifacts/
├─ onion_lasalgaon.pkl      # {(h, alpha): model} + feature_names + train metadata
├─ soybean_latur.pkl
└─ model_meta.json          # train window, row count, MASE, coverage, trained_at
```

**Commit the pickles.** They are ~1–2 MB. Training at deploy time is one more thing that can fail on stage, and the *only* thing it buys you is a smaller repo. (I7)

Pin your versions: a LightGBM pickle from 4.3 may not load in 4.5. `requirements.txt` pins exactly, and everybody installs from it.

### 2.5 Inference — `ml/quantile.py`

```python
_MODELS: dict[str, dict] = {}     # loaded ONCE at FastAPI startup

def load_models() -> None:
    for f in ARTIFACT_DIR.glob("*.pkl"):
        _MODELS[f.stem] = pickle.load(f.open("rb"))

def predict_quantiles(commodity_id: str, market_id: str,
                      as_of: date, horizon: int = 14) -> list[tuple[int,int,int]]:
    """Returns [(p10, p50, p90)] × horizon, integer paise/qtl. Ascending-guaranteed."""
    key = f"{commodity_id}_{market_id}"
    if key not in _MODELS:
        raise ModelUnavailable(key)          # Nilesh catches this -> NO_ADVICE
    bundle = _MODELS[key]
    X = build_features(history_df(commodity_id, market_id, as_of)).iloc[[-1]]
    out = []
    for h in range(1, horizon + 1):
        trio = sorted(int(bundle[(h, a)].predict(X)[0]) for a in (0.1, 0.5, 0.9))
        out.append(tuple(trio))              # <- SORT. quantile models cross. they will.
    return out
```

**Three things this code does deliberately:**

- **Loaded once at startup**, held in memory. Do not unpickle per request.
- **`sorted(...)`** — separately-fit quantile models cross each other on some inputs. An unsorted p10 > p50 produces a negative band width and a nonsense verdict. One `sorted()` call prevents a class of on-stage embarrassment.
- **`int(...)`** — integer paise all the way out. Never hand Nilesh a float. (I1)
- **Raise `ModelUnavailable`**, never return `None`. Nilesh's handler turns the exception into an honest `NO_ADVICE`; a `None` becomes an `AttributeError` and a 500 in front of judges.

### 2.6 ★ Backtest — `ml/backtest.py` — the most important 90 minutes of the ML work

**Expanding-window walk-forward.** Never a random split — a random split on time series is a leak, and you will report a fantastic number that means nothing.

```
train[0:200] -> test[200:214]
train[0:214] -> test[214:228]
train[0:228] -> test[228:242]
...
```

Two metrics. Only two. Both go on a slide.

#### MASE — is the model better than doing nothing clever?

```python
def mase(y_true, y_pred, y_train, season=7):
    naive_mae = np.mean(np.abs(y_train[season:] - y_train[:-season]))
    return np.mean(np.abs(y_true - y_pred)) / naive_mae
```

**Baseline: seasonal-naive at lag 7** (this Tuesday ≈ last Tuesday). Mandi prices have a strong weekly rhythm — market days, arrival cycles — so this is a genuinely hard baseline, which is exactly why it is the right one.

- **MASE < 1.0** → you beat the baseline. Report it.
- **MASE ≥ 1.0** → **say so.** "Our model matches a seasonal-naive baseline on MASE; where it adds value is the calibrated interval, which the baseline cannot produce." That is a strong, honest answer. Claiming MASE 0.3 when you measured 1.1 is a lie a judge can catch by asking one follow-up.

#### Coverage — is the band honest?

```python
covered = ((y_true >= p10) & (y_true <= p90)).mean()
coverage_80_bps = int(covered * 10000)      # target ~8000
```

- **70–90% observed** → the band is calibrated. Report the number.
- **< 70%** → band too narrow, you are overconfident. Widen: raise `NO_ADVICE_BAND_BPS`, or fit α = 0.05/0.95 and label it an 80% band conservatively.
- **> 95%** → band uselessly wide; everything becomes NO_ADVICE and the product says nothing.

Persist both into `model_runs` (CANON §6) and serve them from `GET /ai/model-card`. **A number that lives only in your terminal does not exist.**

### 2.7 The model card — `GET /ai/model-card`

```json
{ "model_run_id":"mr_001","commodity_id":"cmd_onion","market_id":"mkt_lasalgaon",
  "algo":"LightGBM quantile (α=0.1/0.5/0.9), direct multi-horizon",
  "train_start":"2023-01-02","train_end":"2024-11-30","train_rows":698,
  "features":["lag_1","lag_7","roll_mean_7","arr_ratio","month_sin","..."],
  "baseline":"seasonal-naive (lag 7)",
  "mase":0.82,"coverage_80_bps":7900,
  "horizon_days":14,"no_advice_band_bps":3500,
  "known_limitations":[
    "Trained on 2 years of a single market; no weather features.",
    "Does not model policy shocks (export bans) — these are the largest single source of onion price variance.",
    "Coverage measured on 8 walk-forward folds; small-sample."
  ],
  "trained_at":"2026-09-05T04:00:00Z" }
```

**`known_limitations` is not humility theatre.** It is the field that makes the panel believe the other numbers. A team that names the export-ban blind spot before being asked is a team that understands its own model.

---

## 3. Nilesh's lane — the decision engine

### 3.1 The cost model — `domain/costs.py`

Every rupee the farmer does not receive.

```python
@dataclass(frozen=True)
class CostBreakdown:
    transport_paise_per_qtl:  int
    commission_paise_per_qtl: int
    loading_paise_per_qtl:    int
    storage_paise_per_qtl:    int      # per-day rate × hold_days
    spoilage_paise_per_qtl:   int      # value lost to weight/quality decay
    total_paise_per_qtl:      int

def compute(gross_paise_per_qtl: int, market_id: str, commodity_id: str,
            hold_days: int, distance_km: int) -> CostBreakdown:
    ct = cost_table(market_id, commodity_id)
    transport  = ct.transport_paise_per_qtl_per_km * distance_km
    commission = gross_paise_per_qtl * ct.commission_bps // 10000    # // not /
    loading    = ct.loading_paise_per_qtl
    storage    = ct.storage_paise_per_qtl_per_day * hold_days
    spoilage   = gross_paise_per_qtl * ct.spoilage_bps_per_day * hold_days // 10000
    total = transport + commission + loading + storage + spoilage
    return CostBreakdown(transport, commission, loading, storage, spoilage, total)
```

**`//` integer division, everywhere.** (I1) And the five lines **must** sum to `total` exactly, because Pranay renders them as five rows and a total — a display that does not add up is spotted in two seconds.

**Spoilage is the term people forget, and it is the term that makes HOLD honest.** Onion at 0.30%/day loses 4.2% of its value over 14 days. On ₹1,850/qtl that is ₹78/qtl gone — often larger than the storage fee. A HOLD recommendation that ignores spoilage over-recommends holding, which is precisely the direction that hurts a farmer.

### 3.2 ★ The decision — `domain/window.py`

This is the hero. The full algorithm:

```python
def decide(commodity_id, market_id, qty_kg, as_of, farmer_id=None, lot_id=None) -> WindowRes:
    hist = price_history(commodity_id, market_id, as_of)

    # ---- refusal gates FIRST. cheap checks before expensive work. (I6)
    if len(hist) < MIN_HISTORY_ROWS:                       # 180
        return refuse("INSUFFICIENT_HISTORY", ...)
    if (as_of - hist[-1].obs_date).days > MAX_STALENESS_DAYS:   # 10
        return refuse("STALE_DATA", ...)

    try:
        fc = predict_quantiles(commodity_id, market_id, as_of, horizon=14)
    except ModelUnavailable:
        return refuse("INSUFFICIENT_HISTORY", ...)          # NEVER 500 (I12)

    # ---- (a) sell today, net
    spot = hist[-1].modal_paise_per_qtl
    c0 = costs.compute(spot, market_id, commodity_id, hold_days=0, distance_km=dist)
    sell_now_net = spot - c0.total_paise_per_qtl

    # ---- (b) net for every hold day
    holds = []
    for d, (p10, p50, p90) in enumerate(fc, start=1):
        c = costs.compute(p50, market_id, commodity_id, hold_days=d, distance_km=dist)
        holds.append(dict(day=d, p10=p10, p50=p50, p90=p90,
                          net_p50=p50 - c.total_paise_per_qtl,
                          net_p10=p10 - c.total_paise_per_qtl,
                          costs=c))

    # ---- (c) best day by median net
    best = max(holds, key=lambda h: h["net_p50"])

    # ---- (d) band width AT the chosen day
    band_bps = 10000 * (best["p90"] - best["p10"]) // best["p50"]

    # ---- (e) the refusal that matters
    if band_bps > NO_ADVICE_BAND_BPS:                       # 3500
        return refuse("BAND_TOO_WIDE", band_bps, best)

    # ---- (f) the verdict
    gain_per_qtl = best["net_p50"] - sell_now_net
    alt = best_alternative_market(commodity_id, as_of, qty_kg)   # net-of-transport

    if alt and alt.net_paise_per_qtl > best["net_p50"]:
        action = "SELL_ELSEWHERE"
    elif gain_per_qtl <= 0:
        action = "SELL_NOW"
    elif best["net_p10"] < sell_now_net:      # upside real, downside real too
        action = "SPLIT"
    else:
        action = "HOLD"

    # ---- (g) rupees, from per-qtl. qty is KG. 1 qtl = 100 kg.
    expected_gain_paise = gain_per_qtl * qty_kg // 100
    worst_case_paise    = (best["net_p10"] - sell_now_net) * qty_kg // 100

    if action in ("HOLD","SPLIT") and expected_gain_paise < MIN_GAIN_PAISE:
        return refuse("GAIN_BELOW_COST", band_bps, best)

    return WindowRes(action=action, hold_days=best["day"], ...)
```

**Six design decisions in there worth defending out loud:**

1. **Refusal gates run first.** Cheap, and it means a missing model produces an honest refusal instead of a stack trace.
2. **Band width is measured at the *chosen* day**, not day 1 or day 14. The uncertainty that matters is the uncertainty of the decision you are actually recommending.
3. **SPLIT when `net_p10 < sell_now_net`.** Real upside, real downside → sell half now, hold half. This is what an experienced trader actually does, and it is the most agriculturally credible branch in the function.
4. **`GAIN_BELOW_COST`** — a ₹12/qtl "gain" inside a ₹400 band is noise. Refuse instead of dressing it up as advice.
5. **`worst_case_paise` is always computed and always returned**, on every HOLD. Pranay renders it at the same font size (F8). This is the invariant that makes the honesty claim structural rather than rhetorical.
6. **`// 100` for kg → qtl.** Quantity is integer kg; a `/ 100` here would put a float into a money field.

### 3.3 The refusal — this is a designed feature, not an error path

```python
def refuse(reason: str, band_bps: int = 0, best=None) -> WindowRes:
    return WindowRes(
        action="NO_ADVICE",
        confidence="LOW",
        band_width_bps=band_bps,
        refusal_reason=reason,
        expected_gain_paise=None,
        pledge_quote=None,                     # (I13)
        explain_mr=REFUSAL_MR[reason],
        explain_en=REFUSAL_EN[reason],
    )

REFUSAL_MR = {
  "BAND_TOO_WIDE":
    "पुढील १४ दिवसांचा अंदाज खूप अनिश्चित आहे. चुकीचा सल्ला देण्यापेक्षा "
    "आम्ही सांगत नाही. आजचा भाव पाहून तुम्ही ठरवा.",
  "INSUFFICIENT_HISTORY":
    "या बाजारासाठी पुरेशी जुनी माहिती नाही. आम्ही अंदाज देऊ शकत नाही.",
  "STALE_DATA":
    "या बाजाराची ताजी माहिती उपलब्ध नाही. जुन्या भावावर सल्ला देणे धोक्याचे आहे.",
  "GAIN_BELOW_COST":
    "थांबून मिळणारा फायदा खर्चापेक्षा कमी आहे. थांबण्यात अर्थ नाही.",
}
```

Each refusal reason gets **its own Marathi sentence that names the actual cause.** A generic "we can't help" is a failure; "the next 14 days are too uncertain, and rather than give you wrong advice we're not giving any" is a product.

**Nilesh's non-negotiable:** `POST /ai/window/recommend` **must never return 5xx.** Wrap the model call, wrap the DB read, degrade to `NO_ADVICE`. A hero endpoint that throws on stage is worse than one that declines. (I12)

### 3.4 The pledge — `domain/pledge.py`

The feature that turns "you should wait" into "you *can* wait."

```python
def quote(assessed_value_paise: int, expected_gain_paise: int,
          days: int, ltv_bps: int = 7000, rate_bps_annual: int = 1200) -> PledgeQuote | None:
    loan     = assessed_value_paise * ltv_bps // 10000
    interest = loan * rate_bps_annual * days // (10000 * 365)
    if expected_gain_paise <= interest:
        return None                       # NOT worthwhile -> NO CARD (I13)
    return PledgeQuote(
        loan_paise=loan, interest_paise=interest, ltv_bps=ltv_bps,
        rate_bps_annual=rate_bps_annual, days=days,
        net_benefit_paise=expected_gain_paise - interest,
        warehouse_id=..., is_wdra_registered=True,
        disclaimer="Indicative simulation — not a lender quote",
    )
```

**Four rules, all non-negotiable:**

1. **`None` when not worthwhile — enforced server-side, not in the UI.** (I13) A pledge card offering a farmer a loan that costs more than the gain is actively harmful. The server must not be able to emit one.
2. **`// (10000 * 365)`** in one integer expression. Do not compute a daily rate first and multiply — you would truncate to zero on small loans.
3. **The `disclaimer` string ships in the response payload**, so it cannot be dropped by a frontend refactor. Pranay renders it on the card.
4. **No specific WDRA LTV or interest figure goes on a slide** until Kartik has verified it against WDRA's published terms with the URL recorded. Defaults 70% / 12% are plausible placeholders — label them as assumptions until verified.

---

## 4. Where the numbers come from — an audit trail

```
price_obs (Kartik, real, source-labelled)
   └─► features.build_features        (Nikhil)  .shift(1) — no leakage
        └─► 42 LightGBM models        (Nikhil)  quantile, direct multi-horizon
             └─► (p10,p50,p90)×14     (Nikhil)  sorted, integer paise
                  └─► costs.compute   (Nilesh)  5 lines, integer, sums exactly
                       └─► window.decide (Nilesh) → action + gain + worst case + band
                            └─► pledge.quote (Nilesh) → card, or None
                                 └─► recommendations row (persisted, model_run_id FK)
                                      └─► S9 verdict screen (Pranay)
```

**Every recommendation persists `model_run_id`.** If a judge asks "which model produced this number", the answer is a join, not a guess. That link is what makes the model card more than a slide.

---

## 5. Testing — small, and mandatory

### Nikhil
| Test | Asserts |
|---|---|
| `test_no_leakage` | every rolling feature at row *t* is computable from rows < *t* |
| `test_quantiles_ordered` | p10 ≤ p50 ≤ p90 across 100 random inputs |
| `test_integer_output` | every returned value is `int` |
| `test_model_loads` | pickle unpickles and predicts on a synthetic row |
| `test_mase_computed` | backtest emits a finite MASE and a coverage in (0, 10000) |

### Nilesh
| Test | Asserts |
|---|---|
| `test_costs_sum` | 5 lines == total, exactly, on 50 random inputs |
| `test_sell_now` | falling forecast → `SELL_NOW` |
| `test_hold` | rising tight forecast → `HOLD` with `expected_gain_paise > 0` |
| `test_split` | rising but `net_p10 < sell_now_net` → `SPLIT` |
| `test_no_advice_band` | wide band → `NO_ADVICE` / `BAND_TOO_WIDE` |
| `test_no_advice_history` | 100 rows → `NO_ADVICE` / `INSUFFICIENT_HISTORY` |
| `test_no_advice_stale` | last obs 30 days old → `NO_ADVICE` / `STALE_DATA` |
| `test_pledge_none` | interest ≥ gain → `None` |
| `test_never_raises` | model unavailable → returns `NO_ADVICE`, does **not** raise |
| `test_worst_case_present` | every HOLD/SPLIT carries a non-null `worst_case_paise` |

**Ten tests. Under an hour.** They are the difference between "it worked when I tried it" and "it works."

---

## 6. Config — `.env`, all thresholds in one place

```
NO_ADVICE_BAND_BPS=3500      # p90-p10 > 35% of p50 -> refuse
MIN_HISTORY_ROWS=180
MAX_STALENESS_DAYS=10
MIN_GAIN_PAISE=5000          # ₹50/qtl floor for a HOLD
FORECAST_HORIZON_DAYS=14
DEFAULT_LTV_BPS=7000
DEFAULT_PLEDGE_RATE_BPS=1200
```

**Tune `NO_ADVICE_BAND_BPS` exactly once, at H12–H14, against real onion data. Then freeze it and write the chosen value in the model card.**

When asked *"did you tune this so the refusal fires in your demo?"*, the answer is: **"It's one config value, it's published in the model card, and the same value gives a confident HOLD on soybean — here, watch."** Then show it. That is why the second crop exists.

---

## 7. The 5-minute AI story for the pitch

> *"We forecast a distribution, not a price. LightGBM quantile regression at three quantiles, direct multi-horizon out to 14 days, with arrivals as the supply signal — because a glut is why the price falls.*
>
> *We measured it against a seasonal-naive baseline: MASE 0.82. And we measured whether the interval is honest — our 80% band actually contains the outcome 79% of the time.*
>
> *Then we net out transport, commission, loading, storage and spoilage, and only then decide. When the band is too wide to act on, we return NO_ADVICE — because a wrong HOLD costs this farmer real money on real onions.*
>
> *Here's the model card. It includes what the model can't see: we have no weather features and we don't model export bans, which is the largest single source of onion price variance in Maharashtra."*

Four sentences, every number measured, and the limitation named before anyone asks. That is the whole differentiator.

---

## 8. Failure modes to prepare for

| Symptom | Cause | Fix |
|---|---|---|
| MASE > 1.5 | leakage removed → model genuinely weak; or too few rows | more history; or **say so honestly and lead with the interval** |
| Coverage < 50% | overconfident band | widen quantiles to 0.05/0.95, or raise the refusal threshold |
| Coverage > 98% | band uselessly wide | narrow quantiles; check for a bad outlier inflating variance |
| Every verdict is NO_ADVICE | threshold too tight, or onion is genuinely that volatile | raise `NO_ADVICE_BAND_BPS`; **verify soybean gives a HOLD** |
| Never NO_ADVICE | threshold too loose | lower it — you *need* the refusal to fire on onion |
| p10 > p50 | quantile crossing | the `sorted()` in §2.5 — it is not optional |
| Gain is absurd (₹6 lakh on 40 qtl) | a 100× unit error in the cost table or the kg↔qtl conversion | check `// 100`; check Kartik's units |
| Endpoint 500s | unwrapped model call | wrap it, degrade to NO_ADVICE (I12) |

**Say every number out loud before you believe it.** ₹6,290 on 40 quintals is ₹157/qtl of gain on a ₹1,850 base — an 8.5% move. That is *high* for 14 days; plausible for onion, absurd for soybean. If a number is absurd, the pipeline is wrong, and a judge will spot it faster than you will.

---

## 9. Why Phase 1 has no generative LLM — the honest answer

We ship an **AI assistant that answers from a curated set of fixed answers**, retrieved by keyword over ~30 farmer FAQs (how do I create a lot, what is a pledge, what does grade B mean, why won't you advise me). Retrieval, not generation.

**Why:**
- An LLM that hallucinates "hold for 12 days, prices will rise 40%" **inverts the entire product thesis.** We built a system that refuses to overclaim; bolting on a model that overclaims by construction would be incoherent.
- Every generative call is an external network dependency in the demo path. (I7)
- Grounded generation with citations done *properly* — retrieval over price rows and model cards, with refusal when unsupported — is a real Phase 2 feature and needs more than the hours we have.

**What you say when a judge asks "where's the GenAI?":**

> *"Our AI is the forecasting and decision layer, and it's deliberately not generative. A hallucinated hold recommendation costs a farmer his crop money — so the advice path is a measured quantile model plus deterministic arithmetic that can refuse. In Phase 2 we add a retrieval-grounded assistant that cites the price rows and the model card it's answering from, and refuses when it has no source. We'd rather ship a small honest model than a fluent one that guesses."*

That answer is stronger than a chatbot. It says you understood the risk, made a call, and can name what Phase 2 looks like.

---

## 10. Phase 2 (not now)

| Item | Value |
|---|---|
| Weather features (IMD rainfall, temperature) | Real forecast lift for onion, which is rain-sensitive at harvest |
| Arrivals forecasting as an intermediate target | Forecast supply, then price — better causal structure |
| Conformal prediction intervals | Distribution-free coverage guarantees; replaces empirical calibration with a proof |
| Retrieval-grounded assistant with citations | The honest GenAI, with refusal when unsupported |
| Per-farmer risk tolerance | A farmer with a loan due next week should get a different SPLIT than one who can wait |
| Cross-market spread model | Explicit arbitrage optimisation across mandis |
| Multi-crop transfer learning | Share structure across commodities with little history |
| Online retraining on new ingests | Nightly, with drift detection and auto-rollback |
