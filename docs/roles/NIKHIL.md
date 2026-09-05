# NIKHIL — Forecasting

> **You own the number the whole product rests on.** Every rupee figure on the verdict screen traces back to a quantile you predicted.
> This file is your PRD, your TRD, and your task list. Read it, then `docs/architecture/05_AI_ARCHITECTURE.md` §1–2, then `00_CANON.md` §7. Then start on N0.

---

## PART 1 — PRD · What you are building and why

### 1.1 Your mission in one sentence

**Predict a band, not a line, and then measure how honest the band is.** Every team at this hackathon will say *"we trained a model."* Almost none will say *"we measured a model."* That measurement is your contribution and it is worth more than a percentage point of accuracy.

### 1.2 What you are actually predicting

Given a commodity, a market, and today's date, produce for each of the **next 14 days** three numbers:

```
p10_paise_per_qtl   ≤   p50_paise_per_qtl   ≤   p90_paise_per_qtl
```

`p50` is the median forecast. `p10` and `p90` bound an 80% interval. **The band is the product**, not the p50 — Nilesh's decision engine reads the width of that band to decide whether to give advice at all (I6), and Pranay renders the band as a shaded fan (never a bare line).

**Direct multi-horizon:** 14 horizons × 3 quantiles. You are not doing recursive one-step forecasting — errors compound and the band goes meaningless by day 8. Train a head per (horizon, quantile) or a single model with horizon as a feature; either is fine, both must produce 42 numbers.

### 1.3 Why quantile regression and not a point model

A point model gives one number. A farmer holding 40 quintals needs to know the downside, because **a wrong HOLD costs him real money** — that is the whole ethical premise of the product (I16, I6). LightGBM with `objective='quantile'` and `alpha` set to 0.1 / 0.5 / 0.9 gives you three separately-fitted models that directly optimise for those quantiles. No Gaussian assumption, no ± 2σ hand-wave on skewed agricultural price data.

Onion prices are not normally distributed. They have fat right tails (export bans, crop failure) and floors (nobody sells below transport cost). A symmetric interval around a point forecast would be wrong in exactly the direction that hurts.

### 1.4 ★ The metric that matters — and it is not accuracy

Two numbers go on the model card and into the pitch:

| Metric | Target | What it means |
|---|---|---|
| **MASE vs seasonal-naive (lag-7)** | **< 1.0** (demo figure 0.83) | Are we better than "assume last week repeats"? Below 1.0 = yes. Above 1.0 = we are worse than a one-line baseline and must say so. |
| **Empirical p10–p90 coverage** | **70–90%** (demo figure 81%) | Of actual observed prices, what fraction landed inside our band? We designed for 80%. |

**Coverage is the honesty metric.** If it comes out at 40%, the band is too narrow and every HOLD we issue is overconfident. If it comes out at 99%, the band is so wide it says nothing and Nilesh will refuse on everything. **Report the number you measure, not the number you wanted.**

Your answer to question 3 (`11_DEMO_AND_PITCH.md` §4), which you will be asked:

> *"MASE 0.83 against a seasonal-naive baseline, so 17% better than 'assume last week repeats'. But accuracy is the wrong question for us — what matters is whether the band is honest. 81% of actual prices fall inside our p10–p90, and we designed for 80. If that number were 40% we'd be lying to farmers with a nice chart."*

Two sentences past the numbers, then stop.

### 1.5 The model card is a deliverable, not documentation

`GET /ai/model-card` (Nilesh serves it, you supply the content) returns:

- `model_version` — e.g. `onion-v1`
- `mase`, `coverage_80_bps` — **measured**, from `model_runs`
- `trained_at`, `train_rows`, `date_range`
- `known_limitations` — **in plain language, in the card**

That last field is not a disclaimer. Write it honestly:

> *"Cannot anticipate policy shocks. An export ban or a sudden MSP change breaks this model and it will keep producing confident-looking numbers through it. Two commodities, six markets, ~2 years of history. Not validated outside Maharashtra."*

A judge who reads that trusts the rest of the card more, not less.

### 1.6 What you own

| | |
|---|---|
| **Files** | `api/app/ml/**` — `train.py`, `features.py`, `quantile.py`, `backtest.py`, `baseline.py`, and the committed model pickles |
| **Consumed by** | Nilesh's `domain/decide.py` calls `predict_quantiles()`. That function signature is the contract between you. |
| **Not yours** | `domain/decide.py` (Nilesh) · `routers/prices.py` + ingestion (Kartik) · everything else in `api/app/` (Akash) |

### 1.7 Out of scope

The decision logic · the cost stack · the pledge · any endpoint · any UI · data acquisition. If you find yourself writing `if action == 'HOLD'`, that is Nilesh's file.

---

## PART 2 — TRD · How you build it

### 2.1 Environment — Python 3.11, not negotiable

```bash
cd api
uv venv --python 3.11        # NOT python3 — the default is 3.14 and there is no LightGBM wheel
source .venv/bin/activate
uv pip install -r requirements.txt
```

If you spend an hour fighting a LightGBM build failure, check your Python version first. That is the answer 90% of the time.

### 2.2 Features — and the anti-leakage rule that will bite you

```python
# api/app/ml/features.py
def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """df is one (commodity, market) series sorted by obs_date, with modal_paise_per_qtl."""
```

Feature families:
- **Lags** — 1, 2, 3, 7, 14, 21, 28 days
- **Rolling stats** — mean / std / min / max over 7, 14, 28 days
- **Calendar** — day of week, month, week of year, days since season start
- **Arrivals** — lagged arrival volume where available (a supply proxy; strong signal for onion)
- **Market** — market id as a categorical

**The leakage rule:** *every feature at time `t` must be computable from data available strictly before `t`.* Every rolling window must be **shifted by at least 1**:

```python
df['roll7'] = df['modal'].shift(1).rolling(7).mean()      # correct
df['roll7'] = df['modal'].rolling(7).mean()               # LEAKS — includes today
```

That second line will give you a beautiful MASE of 0.3 and a model that is useless in production. **If your MASE comes back below 0.5, assume leakage before you assume genius.** Go find the unshifted window.

For a horizon-`h` target you are predicting `modal[t+h]` from features at `t`. Build the target with `shift(-h)` and drop the tail rows where the target is NaN.

### 2.3 Training — three models per horizon

```python
# api/app/ml/train.py
QUANTILES = {'p10': 0.1, 'p50': 0.5, 'p90': 0.9}
HORIZONS = range(1, 15)

for h in HORIZONS:
    for name, alpha in QUANTILES.items():
        model = lgb.LGBMRegressor(
            objective='quantile', alpha=alpha,
            n_estimators=400, learning_rate=0.05,
            num_leaves=31, min_child_samples=20,
            verbose=-1,
        )
        model.fit(X_train, y_train_h)
```

**Money stays integer paise (I1).** LightGBM predicts a float; round with `int(round(pred))` at the boundary of `quantile.py` and never let a float propagate into a response.

Keep `n_estimators` modest. You are training on ~1,500 rows on a t3.small with a swap file. A 2000-tree model buys you nothing here and risks an OOM on the deploy box.

### 2.4 ★ `quantile.py` — the crossing problem you WILL hit

```python
# api/app/ml/quantile.py
def predict_quantiles(commodity_id: str, market_id: str, as_of: date) -> list[QuantileTriple]:
    """Returns 14 triples, one per horizon day. p10 <= p50 <= p90 ALWAYS."""
    ...
    for h in range(1, 15):
        p10, p50, p90 = (_predict(h, q) for q in ('p10', 'p50', 'p90'))
        p10, p50, p90 = sorted((p10, p50, p90))     # <- the three models are fitted independently
        out.append(QuantileTriple(horizon=h, p10=int(p10), p50=int(p50), p90=int(p90)))
```

**Three independently-fitted quantile models will cross.** Not sometimes — reliably, on some horizons, especially where the data is thin. p90 comes out below p50 and suddenly Pranay's chart draws an inverted fan and Nilesh's band width goes negative.

**Sort the triple. Every time. Unconditionally.** It is one line and it turns a demo-breaking bug into a non-event. Do not try to fix it in training with monotonic constraints in the time you have.

Also assert it, so a future refactor cannot silently undo it:

```python
assert p10 <= p50 <= p90, f'quantile crossing at h={h}'
```

### 2.5 ★★ `backtest.py` — expanding-window walk-forward

This is the file that separates you from every other team.

```python
# api/app/ml/backtest.py
"""
Expanding-window walk-forward:

  train [-------------------]  test [--]
  train [----------------------]  test [--]
  train [-------------------------]  test [--]

Never train on data after the test window. Never shuffle. There is no such thing
as a random train/test split on a time series.
"""
```

For each fold:
1. Fit on everything up to `cut`
2. Predict horizons 1..14 from `cut`
3. Record actual vs p10/p50/p90

Then compute, over all folds:

```python
mase = mae(actual, p50) / mae(actual, seasonal_naive_lag7)   # baseline.py
coverage = mean((actual >= p10) & (actual <= p90))           # target 0.70-0.90
```

**Write both into the `model_runs` table.** `mase` as a float, `coverage_80_bps` as basis points (8100 = 81%) per I3. The model card reads from that table — so the number on the pitch slide comes from a database row produced by a script, not from your memory of a notebook cell.

`baseline.py` is four lines and it is essential: **without a baseline, MASE is meaningless.** Seasonal-naive lag-7 means "the price 7 days ago", which is a genuinely strong baseline for agricultural prices and exactly why beating it is worth claiming.

### 2.6 Serving — loaded once, in-process

The model lives **inside** the FastAPI process. No separate ML service, no HTTP hop, no model server.

```python
# loaded at startup, not per request
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.models = load_models(MODEL_DIR)
    yield
```

`GET /meta/health` must report `model_loaded: true`. That is the first thing checked in the 90-second pre-flight (`11_DEMO_AND_PITCH.md` §6) and the fastest way to know the box is healthy.

**Loading a pickle per request will cost ~200 ms every call and it will look like the app is broken.** Load once.

### 2.7 Commit the pickles

Yes, binary artefacts in git. Yes, normally that is bad practice. Here it is correct: the deploy box must not need to train, training on a t3.small during the demo window is a risk with no upside, and a model that exists only on your laptop is a single point of failure with a name.

Keep them small (modest `n_estimators` helps). Commit them under `api/app/ml/models/`.

### 2.8 Your definition of done

1. `python -m app.ml.train` produces 42 model files (14 horizons × 3 quantiles) and exits 0.
2. `predict_quantiles()` returns exactly 14 triples with **p10 ≤ p50 ≤ p90** on every horizon, asserted.
3. `python -m app.ml.backtest` prints MASE and coverage and **inserts a `model_runs` row**.
4. MASE **< 1.0**. If it is not, you say so out loud and it goes on the model card as-is.
5. Coverage lands in **70–90%**. If it is 45%, that is the number that ships.
6. `known_limitations` written in plain language, including the export-ban limitation.
7. `GET /meta/health` → `model_loaded: true` with the model loaded once at startup.
8. Pickles committed. `pytest` green.
9. Pushed to `nikhil`.

---

## PART 3 — Your tasks, in order

| # | Task | Done when | Blocked by |
|---|---|---|---|
| **N0** | **Env + `features.py`** — Python 3.11 venv, feature builder with **every rolling window shifted** | `build_features()` runs on Kartik's CSV; no unshifted window in the file | Kartik K1 (CSV is enough — the DB can come later) |
| **N1** | **`train.py`** — 3 quantile models × 14 horizons | 42 artefacts written, script exits 0 | N0 |
| **N2** | **★ `quantile.py`** → 14 triples, **sorted**, integer paise | `p10 <= p50 <= p90` asserted on every horizon | N1 |
| **N3** | **`baseline.py`** — seasonal-naive lag-7 | MAE of the baseline computed over the same folds | N0 |
| **N4** | **★★ `backtest.py`** — expanding-window walk-forward, MASE + coverage | Both numbers printed **and** inserted into `model_runs` | N2, N3 |
| **N5** | **Load once at startup** | `/meta/health` → `model_loaded: true`; no per-request load | N2, Akash A0 |
| **N6** | **Model card content** — limitations in plain language | Nilesh's `/ai/model-card` returns your measured numbers, not placeholders | N4 |
| **N7** | **Commit the pickles** | Kartik can deploy without training on the box | N1 |

**N2 unblocks Nilesh entirely** — he cannot compute a band width, and therefore cannot implement the refusal, until `predict_quantiles()` returns a real triple. Give him a stub with a hardcoded triple in the first hour so he starts immediately, then swap in the real thing. Tell him in chat the moment the signature is stable.

### If the data is thin

Kartik may arrive at H4 on rung 3 or 4 with fewer rows than you wanted. Do not silently train anyway and report a MASE from 40 folds of 12 rows each.

Options, in order of preference:
1. **Fewer horizons** — 7 days instead of 14, honestly labelled
2. **Fewer folds**, and say how many in the model card
3. **Wider bands** — which naturally pushes Nilesh toward NO_ADVICE, which is the correct outcome for thin data

**A model that refuses because it genuinely does not know is a working model.** A model that produces confident numbers from 200 rows is a broken one that looks fine.

---

## PART 4 — Blocked?

1. No data yet? Build `features.py` and `baseline.py` against a hand-made CSV. Both are pure functions of a dataframe.
2. Need a `model_runs` column? Ask Akash — additive, cheap.
3. Otherwise: `docs/BLOCKERS.md` + group chat, within 30 minutes.

**Do not edit `domain/decide.py`.** If the decision engine needs a different shape from `predict_quantiles()`, that is a two-minute conversation with Nilesh, not an edit.

---

## PART 5 — On demo day

You take **question 3** — *"how accurate is your model?"* — and anything about features, leakage, or the baseline.

Have ready:
- MASE and coverage **memorised**
- The `model_runs` row on screen, or one query away
- The one-sentence version of the anti-leakage rule, in case they ask how you know it is not leaking

If a judge asks whether you validated properly, the correct answer is short and specific: **"Expanding-window walk-forward, never trained on data after the test window, and every rolling feature is shifted by one day so nothing sees its own target."** That sentence tells a technical judge you know what the trap is.

If your MASE is above 1.0 by demo time, **say it**: *"Our model is currently not beating a seasonal-naive baseline on tomato — that's why the app refuses on tomato."* That is a stronger answer than a good number, because it shows the refusal mechanism is doing real work rather than being decoration.
