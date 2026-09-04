# R2 · ORACLE — Data, Forecasting, and the Sale-Window Optimiser
**Branch:** `r2-oracle` · **You own the intellectual core. Also the honesty of it.**

---

## ⬛ PASTE THIS TO CLAUDE CODE AT THE START OF EVERY SESSION

```
You are working on MANDI-SETU, a Next.js 15 + Prisma + Postgres monorepo with a
Python FastAPI ML service, for Smart India Hackathon 2026, problem statement 26132
(market linkages and price discovery for farmers of Maharashtra). Five engineers with
five Claude Code agents are building this simultaneously in ONE repo over 3 days.

I am R2 (codename ORACLE). My role: price data ingestion, quantile price forecasting,
and the sale-window optimiser that decides SELL_NOW / SELL_ELSEWHERE / HOLD / SPLIT /
NO_ADVICE, plus the pledge-finance quote that makes HOLD affordable. This is the
project's hero feature.

Before you write any code, read these files in this order:
  1. CLAUDE.md                        (project invariants — all ten are binding)
  2. docs/00_MASTER_BUILD_PLAN.md     (§2.2 is my request path, end to end — read it twice)
  3. docs/01_CONTRACTS.md             (my four endpoints)
  4. docs/02_SECURITY_AND_QUALITY.md  (especially Q7: never claim an unmeasured number)
  5. docs/roles/R2_ORACLE.md          (my task list — work through it in order)
  6. packages/contracts/src/index.ts  (the TS contract) and
     services/ml/app/contracts.py    (my Pydantic mirror of it — keep them identical)

I OWN and may edit ONLY these paths:
  services/ml/**                                  (the whole Python service)
  apps/web/src/lib/domain/window.ts
  apps/web/src/lib/domain/costs.ts
  apps/web/app/api/prices/**
  apps/web/app/api/forecast/**
  apps/web/app/api/window/**

If a change is needed in any OTHER path, do NOT edit it. Append an entry to
docs/BLOCKERS.md. In particular: prisma/schema.prisma and packages/contracts are
owned by R1 — I may READ them but never edit them. UI is R4's.

Python environment — this matters, get it right first:
  cd services/ml
  uv venv --python 3.11        # NOT python3. The default is 3.14 and NO LightGBM wheel exists.
  uv pip install -r requirements.txt

Hard rules for you specifically:
- Money is integer paise. Quantity is integer kilograms. Rates are basis points.
  Never a float for money.
- NEVER claim an accuracy number I have not measured. MASE is measured against a
  seasonal-naive baseline on a held-out period, or it is not shown. Coverage is the
  empirical fraction of actuals inside the p10-p90 band, or it is not shown.
- The model MUST be allowed to refuse. When the forecast band is wider than
  WINDOW_NO_ADVICE_BAND_BPS, return action NO_ADVICE with a written refusalReason.
  This is a required feature, not a fallback. Do not "just return the p50 anyway."
- Every forecast response carries a ModelCard. Never null, never fabricated.
- EVERY recommendation carries worstCasePaisePerQtl / worstCaseTotalPaise — the net
  outcome at the p10 price, after costs. Usually negative. Never omit it, never soften
  it. Hiding the downside is not informed consent, and the UI shows it with the same
  weight as the gain.
- The pledgeQuote is NOT optional to implement. It is the thesis: we do not tell farmers
  to wait, we pay them to wait. Compute it in TypeScript (costs.ts + window.ts), and
  emit it ONLY when expectedGainTotalPaise > interestPaise.
- I do NOT build a weather model. IMD and Open-Meteo already publish forecasts; rainfall
  anomaly is an INPUT FEATURE to the price model, never an output of mine.
- The demo makes ZERO live external network calls. Ingestion is an offline script that
  writes a CSV; the running app reads only Postgres and my local FastAPI service.
- Any imputed or synthetic price row must be tagged with its source so the UI can label it.
- The reasons[] I return must be derived from the SAME arithmetic that produced the
  action. Never write prose the numbers do not support.

After each task: run `npm run typecheck` for the TS side and `pytest` for the Python
side, then commit (`feat(oracle): …`) and push. Commit every 30-45 minutes.

Start with Task 1 in docs/roles/R2_ORACLE.md. Tell me your plan before you write files.
```

---

## Why your role exists, and the trap in it

Every competing team will show a price chart. Some will show a prediction. Almost none
will show a system that (a) prices the *cost of waiting*, (b) reports its own error
honestly, and (c) refuses to answer when it cannot. Those three things are your job and
they are the difference between "another dashboard" and "a decision tool."

**The trap:** it is very tempting to spend 20 hours on model accuracy. Don't. A
seasonal-naive baseline with an honestly measured MASE and a well-designed refusal rule
beats a marginally better LightGBM with no backtest, because the judge cannot evaluate
your model but *can* evaluate whether you know how good it is. Get the baseline shipped
at H14, then improve.

**The second trap:** an unmeasured accuracy claim. If you say "95% accurate" and a judge
asks "95% of what, measured how, against what baseline?", a fumbled answer costs more
than the feature earned. Q7 in the security doc exists for you.

---

## Files you own

```
services/ml/
├── app/
│   ├── main.py            FastAPI app, x-ml-key auth, /health /forecast /window
│   ├── contracts.py       Pydantic mirror of the TS contract (already written — keep it in sync)
│   ├── features.py        lag/rolling/seasonal/arrival features
│   ├── forecast.py        seasonal-naive baseline + LightGBM quantile
│   ├── optimiser.py       the sale-window expected-utility arithmetic
│   ├── backtest.py        rolling-origin evaluation → MASE, coverage
│   └── registry.py        load models, build the ModelCard
├── scripts/
│   ├── ingest.py          OFFLINE: raw CSV → cleaned data/seed_prices.csv
│   ├── train.py           OFFLINE: fit models → models/*.txt + model_card.json
│   └── eval.py            OFFLINE: print the backtest table you will put on the slide
├── data/seed_prices.csv   committed, < 5 MB. Raw dumps are gitignored.
├── models/                gitignored except .gitkeep
├── tests/                 pytest
└── requirements.txt

apps/web/src/lib/domain/window.ts    TS mirror of the optimiser (pure, unit-tested)
apps/web/src/lib/domain/costs.ts     transport / storage / spoilage / finance
apps/web/app/api/prices/series/route.ts
apps/web/app/api/prices/nearby/route.ts
apps/web/app/api/forecast/route.ts
apps/web/app/api/window/recommend/route.ts     ← THE HERO ENDPOINT
```

**Forbidden:** `prisma/schema.prisma`, `packages/contracts/**`, anything under
`src/components/**`, any route group, `src/lib/domain/{grading,matching,escrow,ledger,split}.ts`,
`prisma/seed/**`, `tests/e2e/**`.

**Where window logic lives — decide this at H4 and write it down.** Recommended: the
*numeric* work (quantile forecast + candidate-day search) lives in Python `optimiser.py`;
the TS `window.ts` holds the thresholds, the action decision, the cost assembly and the
reason strings. That way the arithmetic that must be unit-tested fast is in TS with
`vitest`, and the model-dependent part is in Python. Do not implement the same decision
rule in both languages — that is two sources of truth and they will diverge by H50.

---

## Task list

### H4 → H20 · Data first, model second

**T2.1 — Environment (do this before anything else).**
```bash
cd services/ml
uv venv --python 3.11
uv pip install -r requirements.txt
.venv/bin/python -c "import lightgbm, pandas, statsmodels; print('ok')"
```
If that import fails, stop and fix it. Do not proceed to modelling with a broken venv —
you will lose an hour at H40 discovering it.

**T2.2 — `main.py` with `/health` returning a real `MlHealthRes`.**
Auth via `x-ml-key` on every route (compare to `ML_API_KEY`). CORS closed. Bind to
localhost. Acceptance: `curl -H 'x-ml-key: …' localhost:8000/health` → `{ ok: true, … }`,
and without the header → 401.

**T2.3 — Ingestion (`scripts/ingest.py`). Your H12 gate is DATA, not a model.**

**The gate moved from H20 to H12 deliberately** (`docs/10_GAP_REVIEW_AND_CORRECTIONS.md`
C3/A4). Real series must be on disk before a single model is fitted, because a forecast
trained on invented numbers is found out by the first judge who asks "where did this come
from?" — and by then it is too late to go get real data.

**The gate, concretely:** real Agmarknet/MSAMB onion series for **≥ 5 Nashik-belt mandis,
≥ 3 years**, committed as CSV under `research/data/` with a `README.md` recording, per
file: the source URL, the exact query or download parameters, the date you pulled it, the
row count, and the date range. That README is what turns "we used Agmarknet data" from a
claim into a citation. Concrete URLs and pull recipes are in `docs/12_DATA_SOURCES.md`.

Sources, in priority order. **Every URL and dataset id must be verified before you rely
on it** — the playbook's `[VERIFY]` discipline applies:
1. **data.gov.in** — the Agmarknet "Variety-wise Daily Market Prices" resource. Free API
   key. Bulk CSV download is more reliable than paged API calls for a historical pull.
2. **Agmarknet** (`agmarknet.gov.in`) — the canonical daily arrivals + min/modal/max per
   APMC. Scraping is fragile; prefer the data.gov.in mirror.
3. **MSAMB** (`msamb.com`) — Maharashtra State Agricultural Marketing Board, per-APMC
   daily rates. Best Maharashtra-specific coverage.
4. **eNAM** (`enam.gov.in`) — trade data for eNAM-enabled mandis.

Target for the demo: **2 commodities × 3–5 markets × 3+ years of daily rows.** Onion at
Lasalgaon and Pimpalgaon Baswant plus Tomato or Soybean is the right choice — onion is
the most volatile and politically salient commodity in Maharashtra, which makes it both
the best demo and the best justification for the NO_ADVICE feature.

The script must: parse dates robustly, normalise commodity/market names to the keys in
`schema.prisma`, drop impossible rows (zero or negative prices, min > max), **impose
`min ≤ modal ≤ max`**, forward-fill market holidays with `source = IMPUTED` (never
silently as if observed), and emit `data/seed_prices.csv` with a `source` column of
`AGMARKNET | MSAMB | IMPUTED | SYNTHETIC`.

Print a coverage report at the end: rows per market per year, and % imputed. R5's admin
data-quality screen consumes exactly this, and you will be asked about it in Q&A.

**If, and only if, you cannot get real data by H14:** generate synthetic series with a
documented seasonal + AR + shock process, tag every row `SYNTHETIC`, and say so on the
slide. This is survivable. What is not survivable is unlabelled fake data — I6, and it is
the fastest way to lose a room.
**T2.4 — Seed `PriceObs`.** Hand `seed_prices.csv` to R5 (who owns `prisma/seed`) or
write a one-off loader in `scripts/` that R5 calls. Do **not** edit `prisma/seed/index.ts`
yourself — that is R5's file. Post the CSV schema in `docs/BLOCKERS.md` so R5 can wire it
without asking.

**T2.5 — Seasonal-naive baseline + `/forecast`.**
`ŷ(t+h) = y(t+h−52w)` for weekly seasonality, or the simple `y(t)` random-walk with an
empirical quantile band from historical h-step-ahead errors. This is your **fallback for
the rest of the project** and it must always work. Return a real `ModelCard`:
`{ model: "seasonal-naive", trainedAt, mase: 1.0, coverage: <measured>, trainRows, caveat }`.

Acceptance at H20: `GET /api/forecast?commodityKey=onion&marketId=…` returns 14 points
with monotone p10 ≤ p50 ≤ p90 and a populated card, from data that is in Postgres.

### H28 → H48 · The model and the hero

**T2.6 — Features (`features.py`).** Lags 1/2/3/7/14/28; rolling mean and std over
7/14/28; day-of-week; week-of-year (sin/cos, not an integer — an integer tells the model
week 52 and week 1 are 51 apart); days-since-harvest-start; arrival volume and its lags
(**arrivals are the strongest short-horizon signal in mandi data** — high arrivals crush
the modal price, and this is the feature that will make your model beat naive);
neighbouring-market price and spread.

**Weather belongs here, as a feature — and nowhere else.** Rainfall anomaly (observed
mm minus the long-period average for that week and district) is a legitimate input:
rain disrupts arrivals, arrivals move the modal price. Pull it once, offline, from
Open-Meteo's historical archive or IMD, cache it as a CSV, and join it in.

**Do not build a weather model.** IMD and Open-Meteo already publish forecasts that are
better than anything you can fit in 72 hours, and a home-made weather model invites a
meteorologist on the panel to dismantle it — losing you a question you did not need to
answer. If asked: *"we consume published forecasts as a feature; forecasting weather is
not our contribution and we would be worse at it than the free API."*

Leakage discipline: every feature at time *t* uses only information available at *t*.
Build the frame with a strict cutoff and assert it in a test. Leakage produces a
beautiful backtest and a useless model, and it is very easy to do accidentally with
`rolling()` on an unsorted frame.

**T2.7 — LightGBM quantile regression (`forecast.py`).**
Three objectives — `alpha=0.1, 0.5, 0.9` — one model per horizon bucket (1–3, 4–7, 8–14
days) rather than 14 separate models. `objective='quantile'`, modest `num_leaves` (31),
`min_data_in_leaf` ≥ 20; you have hundreds to low thousands of rows per market, not
millions, so a deep model will memorise.

**Handle quantile crossing.** Independently fitted quantiles can come back out of order.
`contracts.py` already *refuses* a crossed response rather than silently sorting it —
when that fires, fall back to the baseline for that horizon and note it in the card's
caveat. Silently sorting hides a broken fit.

**T2.8 — Backtest (`backtest.py`) — the numbers that go on the slide.**
Rolling-origin: train to *T*, predict *T+1…T+14*, roll forward, repeat across at least
20 origins. Report per commodity × market × horizon:

| Metric | Definition | Why it is the right metric |
|---|---|---|
| **MASE** | MAE ÷ MAE of seasonal-naive on the same window | Scale-free, and it makes the baseline comparison explicit. MASE < 1 means you beat naive. |
| **Coverage** | fraction of actuals inside [p10, p90] | Should be ≈ 0.80. If it is 0.55, your bands are lying and the whole product is lying. |
| **Pinball loss** | quantile loss at 0.1/0.5/0.9 | The loss you actually optimised |
| **Directional accuracy** | sign of 7-day change | The only metric a farmer intuitively cares about |

**Report these even when they are bad.** A MASE of 1.05 with the sentence "onion at
7-day horizon we do not beat naive, so at that horizon we return NO_ADVICE more often"
is a *stronger* answer than a suspicious 0.4. Judges who know time series have seen
overfitted backtests and they are looking for exactly this.

**T2.9 — `costs.ts` — real Maharashtra numbers, with citations in comments.**
```ts
// Each rate is stored in CostTable and seeded, never hardcoded in a function.
// Cite the source in a comment next to each seeded value — you WILL be asked
// "where did ₹4/quintal/km come from?" and the answer must be a row and a citation.
transportPaise(distanceKm, qtyKg, ratePaisePerQtlPerKm)
storagePaise(days, qtyKg, ratePaisePerKgPerDay, cold: boolean)
spoilagePaise(days, valuePaise, spoilageBpsPerDay)     // compounds, not linear
financePaise(days, valuePaise, bpsPerAnnum)            // pro-rata on days held
```
Spoilage compounds: onion at ~0.4%/day ambient loses ~11% over 30 days, not 12% linear —
and more importantly the *remaining* quality declines, which is why `shelfLifeDays` hard-
caps the candidate window. A HOLD recommendation past shelf life is not a bug in the
maths, it is a bug in the product.

**T2.10 — THE OPTIMISER.** `optimiser.py` (numeric) + `window.ts` (decision).

```
for d in 0 .. min(storageDaysAvailable, shelfLifeDays − ageDays):
  for m in candidate markets:
    gross   = p50(d, m)
    cost    = storage(d) + spoilage(d) + finance(d) + transport(m)
    net     = gross − cost
    downside= p50(d,m) − p10(d,m)
    CE      = net − rho · downside        # certainty equivalent; rho ∈ [0,1]

best      = argmax CE over (d, m)
homeToday = CE(d=0, home mandi)
bestToday = argmax CE over (d=0, m)       # today, but anywhere → SELL_ELSEWHERE
band      = (p90 − p10) / p50   in bps, at the best d

# The honest downside, computed for whatever we end up recommending:
worstCase = p10(best.d, best.m) − cost(best.d, best.m) − homeToday.net

if band > NO_ADVICE_BAND_BPS                          → NO_ADVICE(+ written reason)
elif (best.CE − homeToday.CE) < MIN_GAIN_PAISE_PER_QTL:
    if (bestToday.CE − homeToday.CE) >= MIN_GAIN_PAISE_PER_QTL
                                                      → SELL_ELSEWHERE(bestToday.m)
    else                                              → SELL_NOW
elif band > SPLIT_BAND_BPS and gain is real           → SPLIT(sellNowBps, holdBps)
elif cashNeedBy is set and best.d outlasts cashNeedBy:
    q = pledgeQuote(best)                             # TS: costs.ts
    if q and expectedGainTotal > q.interestPaise      → HOLD + pledgeQuote = q
    else                                              → SPLIT(enough to cover cashNeed)
else                                                  → HOLD(holdDays = best.d)
```

**Order matters and is deliberate: spatial before temporal.** Check "can he do better
today, somewhere else?" before "should he wait?" — moving produce 40 km is a decision he
can act on this morning with certainty, and waiting is a bet. The problem statement says
"nearby markets" verbatim; `SELL_ELSEWHERE` is the answer to that clause, and it must be
a first-class action rather than a footnote under `SELL_NOW`.

**Compute `worstCase` for every action, including `NO_ADVICE`.** It is the p10 outcome
after costs, relative to selling today — usually negative, and that is the point. R4
renders it beside the gain at equal weight.

Four things that make this defensible rather than arbitrary:
- **`rho` is the farmer's risk aversion, and it is his to set.** A farmer with a loan due
  Friday is not risk-neutral, and a system that assumes he is gives advice that is
  correct on average and ruinous for him. Default 0.35, exposed in the UI as a three-way
  "I need cash soon / I can wait / I can wait a while."
- **SPLIT is the honest answer to genuine uncertainty.** Sell 60% now for cash-flow
  certainty, hold 40% for upside. It is what a good commodity trader does and no
  competing project will offer it.
- **The cost breakdown must be visible.** "HOLD for 11 days, +₹119/quintal" is a claim.
  The same with `storage ₹34 · spoilage ₹47 · finance ₹18 · transport ₹0` underneath is
  an argument.
- **Non-negotiable: costs must be able to make HOLD lose.** Test this. If your optimiser
  never says SELL_NOW when prices are trending up, you have built a "prices will rise"
  printer, and a judge will find that in one question.

**T2.10b — ★ THE PLEDGE QUOTE. This is the moat. Do not let it become a slide.**

Our pitch line is *"we do not tell farmers to wait, we pay them to wait."* If that is a
bullet on a roadmap slide, then every other team with a price forecast is level with us,
and the differentiator evaporates. It is **two to three hours of arithmetic** and no
lender API. Build it.

Live in `costs.ts` (the arithmetic) + `window.ts` (the decision). Not Python — there is no
model input here, and TS lets vitest cover it with no database and no ML service running.

```ts
// costs.ts — pure, no db, no fetch
export function pledgeQuote(input: {
  p10LotValuePaise: number;      // conservative on purpose: lend against the DOWNSIDE
  ltvBps: number;                // 7000 = 70%
  rateBpsPerAnnum: number;       // from the district CostTable row, never a literal
  tenorDays: number;             // = recommended holdDays
  storagePaiseForTenor: number;
  cashNeedPaise: number;
  warehouse: { id: string; name: string; nameMr: string; distanceKm: number; isWdra: boolean };
}): PledgeQuote

advance         = floor(p10LotValuePaise × ltvBps / 10000)
interest        = floor(advance × rateBpsPerAnnum / 10000 × tenorDays / 365)
netCashToday    = advance − interest − storagePaiseForTenor
coversNeed      = netCashToday >= cashNeedPaise
```

Four things that make this defensible rather than hand-waving:

- **Lend against p10, not p50.** The advance is sized on the pessimistic price, so a bad
  outcome does not leave him owing more than the lot fetches. A lender lending against
  the median is transferring its own risk to the farmer, which is the existing problem.
- **The guardrail is in code, not in the UI.** Emit a quote **only** when
  `expectedGainTotalPaise > interestPaise`. Otherwise return `null` **plus** the reason
  string *"Waiting does not cover the cost of borrowing, so we did not offer a loan."*
  A system that will always offer you credit is a moneylender. Refusing to lend when
  waiting does not pay is the whole ethical claim — and it is the same instinct as
  `NO_ADVICE`. Unit-test the refusal path explicitly.
- **`repaymentMode: 'AUTO_FROM_PROCEEDS'`.** Repayment comes out of the sale, not out of
  a separate collection event. That is what makes it safe for a smallholder.
- **Say what is simulated, first, unprompted.** *"No lender is integrated. The quote is
  computed from the WDRA-accredited warehouse list and a published rate band; the
  arithmetic is real, the counterparty is not. Integration is phase 2."* Label the card
  **"Simulated quote, indicative rate"** in the UI. Volunteering this converts your
  biggest vulnerability into a credibility marker; being caught on it does the reverse.

Depends on R5 seeding 3 warehouses in Nashik district, 2 of them `isWdra = true`, and on
the `financeBpsPerAnnum` column of the district `CostTable`. Post the shape you need in
`docs/BLOCKERS.md` at H4 so R5 seeds it right the first time.

**And the SPLIT reason string must name the rupee figure.** Not "sell some now" but
*"आजच १५ क्विंटल विका — तुम्हाला लागणारे ₹४०,००० मिळतील; उरलेले २७ क्विंटल थांबवा."*
("Sell 15 quintal today to cover the ₹40,000 you need; hold 27.") SPLIT is the most
farmer-recognisable behaviour in the product — it is what he already does by instinct —
so the sentence has to sound like something a person would say.

**T2.11 — `NO_ADVICE`, written properly.** The `refusalReason` must be a real sentence in
both languages, e.g.
> *"कांद्याच्या दराचा अंदाज पुढील १४ दिवसांत ±२८% पर्यंत बदलू शकतो. या अनिश्चिततेवर आम्ही सल्ला देणार नाही."*
> "Onion price could move ±28% over the next 14 days. We will not give advice on
> uncertainty this wide."

Then give him something useful anyway: today's best net market, and a "notify me if the
price crosses ₹X" reminder. **Refusing is not the same as being useless.** Tell R4 the
exact shape you return so the screen is designed, not improvised — `fxWindowRefuse` in
the fixtures already shows it.

**T2.12 — `POST /api/window/recommend`.** Route pattern is §2.3 of the build plan:
Zod parse → `guard('FARMER')` → load context scoped to the actor → call ML with a 3s
timeout → domain decision → persist a `Recommendation` row → return the DTO.

Persisting matters: `Recommendation.followed` lets you show, in the demo,
*"of 47 HOLD recommendations, 39 were followed and realised +₹94/qtl on average."*
That is a self-scoring system, and it is the answer to "how do you know your advice
works." Seed some historical recommendations with R5 so this figure exists on stage.

**T2.13 — `/api/prices/nearby` returns NET, not gross.**
Gross price at a mandi 60 km away is a lie; a farmer comparing gross prices makes a worse
decision than one comparing nothing. Sort by `netPaisePerQtl`, and show the transport
deduction. This one column is a genuine insight and it costs you 20 lines.

### H54 → H68

**T2.14 — `eval.py` prints the backtest table for the deck.** One command, one table, real
numbers, copy-paste into the slide. Do it before the freeze so nobody is running models
at H66.

**T2.15 — Unit tests in `window.ts` (Q1).** HOLD when the gain is real · SELL_NOW below
threshold · **SELL_ELSEWHERE when another mandi wins today** · NO_ADVICE above band ·
SPLIT boundary · **a pledge quote is emitted when the gain covers the interest and is
`null` when it does not** · costs increase monotonically with hold days · HOLD never
exceeds shelf life · `worstCase` is populated on every action. Nine tests, fast, no
database.

---

## Your failure modes, named

| Failure | Prevention |
|---|---|
| 20 hours on accuracy, no window feature | Baseline at H14. The optimiser is the product; the model is a component. |
| **The pledge quote never gets built, so the moat becomes a slide** | **T2.10b. It is 2–3 hours of arithmetic with no lender API. If it slips past H44, tell R1 at the sync — it outranks model improvement.** |
| No real data by H12 | Data is your H12 gate, not H20. Model second, always. |
| An unmeasured accuracy claim | Q7. MASE + coverage or nothing. |
| `worstCase` left at 0 or omitted | It is required on every action. Asserted in T2.15. |
| Bands so narrow they never trigger NO_ADVICE | Check coverage ≈ 0.80. Narrow bands = overconfident = the exact dishonesty we are differentiating against. |
| Optimiser that always says HOLD | Test the SELL_NOW path explicitly. Costs must be able to win. |
| A quote offered even when interest eats the gain | The guardrail in T2.10b, unit-tested. We are not a moneylender. |
| `SELL_ELSEWHERE` never fires, so "nearby markets" goes unanswered | Check spatial before temporal in the ladder. Test it. |
| Built a weather model | Rainfall anomaly is a feature. IMD/Open-Meteo forecast the weather; we do not. |
| LightGBM won't install | `uv venv --python 3.11`. T2.1, first task, before anything else. |
| Leakage → beautiful backtest, useless model | Strict time cutoff in feature building, asserted in a test |
| Python contract drifts from TS | Update `contracts.py` in the same sync window R1 announces a change |
