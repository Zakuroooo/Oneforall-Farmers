# 10 · Gap Review and Corrections

> Independent review of `MANDI-SETU_SIH2026_PS26132_Playbook.md`, `CLAUDE.md`, `prisma/schema.prisma`,
> `packages/contracts/`, and `docs/00_MASTER_BUILD_PLAN.md`, done on Day 0 before the joint lockdown.
> Every item has a severity, an owner, and a concrete fix. Items marked **[DONE]** were already
> applied to the repo during the review (additive only, pre-freeze). R1: confirm them at H2.5.

Severity scale: **S0** = can lose the round on its own · **S1** = costs real points · **S2** = polish.

---

## A. Strategic gaps (the ones that decide selection)

### A1 · S0 · The plan cuts the thesis
`00_MASTER_BUILD_PLAN.md` lists "e-NWR / WDRA pledge finance execution (schema exists, no UI)" as out of scope.
But the pitch line is *"We do not tell farmers to wait. We pay them to wait."* and the playbook's demo script
marks the **GET MONEY TODAY** tap at 4:30 as "the moment you win". If it is a slide, the moat is a slide,
and every other price-forecast team is level with us.

**Fix (2 to 3 hours of arithmetic, no lender API):**
- **[DONE]** `WindowBody` now accepts optional `cashNeedPaise` + `cashNeedBy`.
- **[DONE]** `WindowRecommendation` now carries `pledgeQuote: PledgeQuote | null` and `worstCasePaisePerQtl` / `worstCaseTotalPaise`.
- R2: in the optimiser, when `action ∈ {HOLD, SPLIT}` and the hold outlasts `cashNeedBy`, compute a quote from the
  nearest `Warehouse where isWdra = true` and the district `CostTable.financeBpsPerAnnum`:
  `advance = ltv(70%) × p10 lot value`, `interest = advance × rate × tenor/365`, `netCashToday = advance − interest − storage(tenor)`.
  **Guardrail in code:** emit the quote only if `expectedGainTotalPaise > interestPaise`; otherwise return `null` and add a reason string
  "Waiting does not cover the cost of borrowing, so we did not offer a loan."
- R4: render the quote as the card directly under the HOLD verdict (playbook §9.3). Label it **"Simulated quote, indicative rate"**.
- R5: seed 3 warehouses in Nashik district, 2 of them `isWdra = true`, with real-looking rates (see `12_DATA_SOURCES.md` §WDRA).
- Deck: say plainly "no lender is integrated; the quote is computed from a WDRA warehouse list and a published rate band. Integration is phase 2."

### A2 · S0 · Nobody has looked at the actual selection funnel
The playbook plans for a 36-hour grand finale with eight weeks of pre-work. You are three days from a **college internal round**,
after which the institute nominates teams, and the SIH portal shortlists **on a mandated idea PPT** (plus whatever the college asks for).
Nothing in the repo prepares for that. See `11_PITCH_PPT_AND_SELECTION_ROUNDS.md`. Owner: **R5 from H0**, not from H60.

### A3 · S0 · Team size and composition
SIH rules have required exactly **6 members per team, at least one female member**. You said five. Confirm against the SIH 2026 guidelines
on the portal **today** and recruit the sixth before the internal round if the rule stands. This is not a product gap; it is a disqualification gap.

### A4 · S1 · Zero verified data, empty `research/` folder
Every row in playbook Ch 07 is `[VERIFY]`. `research/` contains nothing. A forecast trained on invented series will be found out by the first
judge who asks "where did this come from?". R2's H12 gate (not H20) must be: **real Agmarknet onion series for ≥ 5 Nashik-belt mandis,
≥ 3 years, committed as CSV under `research/data/` with a provenance README.** Concrete URLs and pull recipes are in `12_DATA_SOURCES.md`.

### A5 · S1 · Citations are unverified
The playbook cites ~20 arXiv IDs. Several are dated 2025 to 2026 and were retrieved by an agent, not a human. If one is wrong on a slide,
every other number becomes suspect. **R5, 30 minutes on Day 1:** open every ID at `arxiv.org/abs/<id>`, confirm title and authors, and delete
any that do not match. Keep at most 6 on the References slide: 1812.05173, 2009.04171, 2304.09761, 2212.03281, 2202.07282, plus one Maharashtra-specific.
Trace Wikipedia-sourced numbers to primary: NCRB ADSI 2022 (farmer suicides), Agriculture Census 2015-16 (holding sizes), MSAMB (APMC count).

### A6 · S1 · Maharashtra's own programmes are missing from the story
The PS is from the Government of Maharashtra. The playbook never names the state's flagship agri-market programmes. Judges nominated by the
department will belong to them. Add to the deck and to the "who pays / how do we deploy" answer (verify each on the official site first):
- **SMART** (Balasaheb Thackeray Agri-Business and Rural Transformation Project, World Bank supported): FPO market linkages and warehouse
  infrastructure. This is the natural pilot channel and budget line.
- **MAGNET** (Maharashtra Agribusiness Network Project, ADB supported): horticulture FPO value chains. Second FPO channel.
- **MahaAgri-AI Policy** (state AI-in-agriculture policy announced 2025): our ML layer fits its stated intent. One line, cited.
- **AgriStack Maharashtra Farmer ID**: identity layer we consume in phase 2 instead of KYC.
- **MSAMB**: authoritative APMC list and daily rates. Name it as the data partner.
- **Maharashtra APMC Act reforms** (F&V deregulated 2016; direct-marketing and private-market licences): the legal basis for farm-gate sale.

### A7 · S1 · The forecast idea alone is not unique. Say what is.
"Crop price prediction" appears in dozens of SIH submissions every year. The defensible uniques are: (1) credit-coupled HOLD,
(2) Realisation Ledger with counterfactual, (3) model refusal (`NO_ADVICE`), (4) buyer-side reliability and renegotiation rate.
The deck's "Novelty" slide must be those four, in that order, and **all four must be clickable in the demo**.

---

## B. Contract and schema gaps

| # | Sev | Gap | Fix | Status |
|---|---|---|---|---|
| B1 | S0 | No worst-case figure in the recommendation, although the playbook's ethical position is "show the downside with equal weight" | `worstCasePaisePerQtl`, `worstCaseTotalPaise` added to `WindowRecommendation`; fixtures updated | **[DONE]** |
| B2 | S0 | No cash-need input, no pledge output (see A1) | `cashNeedPaise`, `cashNeedBy`, `PledgeQuote`, `pledgeQuote` added | **[DONE]** |
| B3 | S1 | `WindowAction` lacked spatial arbitrage; PS says "nearby markets" verbatim | `SELL_ELSEWHERE` added to Zod enum and Prisma enum. R2: emit it when the best net market ≠ home mandi and hold gain < threshold | **[DONE]** |
| B4 | S1 | `RealisationLedger` had no `baselineMethod`, which the playbook calls the difference between "a metric and a marketing number" | `baselineMethod String @default("HARVEST_DAY_MODAL_HOME_MANDI")` added | **[DONE]** |
| B5 | S2 | `Recommendation` has no `cashNeedPaise` / `pledgeOffered` columns for audit | Add two nullable columns at H2.5 if R2 wants to measure "how often did we offer credit" | R1 |
| B6 | S2 | No `precedents` (similar past cases) on the forecast, the interpretability idea from 1812.05173 | Optional `precedents: [{ year, startDate, changeBps }]` on `ForecastRes`. Nice to have; only if R2 is ahead at H36 | R2 → R1 |
| B7 | S2 | `BuyerDto` has no `renegotiationRate` even though the playbook calls it out as the thing "no existing platform scores" | Add `renegotiationBps` to `BuyerDto` and to the seeded buyers; render as "Never re-negotiated after delivery" | R1 → R3/R5 |

R2 must mirror B1 to B3 in `services/ml/app/contracts.py` in the same sync window.

---

## C. Build-plan corrections

| # | Sev | Correction |
|---|---|---|
| C1 | S0 | **Deck and PPT start at H0, owned by R5, updated at every sync.** The selection is on the PPT. A deck written at H60 by tired people loses to a worse product with a better PPT. |
| C2 | S0 | **Add a fallback video task at H48, not H66.** Record after Checkpoint B, re-record at H66 if the product improved. |
| C3 | S1 | **R2 data gate moves to H12.** Real series committed before any model. Seasonal-naive by H20, LightGBM by H40. If LightGBM does not beat seasonal-naive on MASE, ship seasonal-naive and say so on the model card. That is a stronger story than a fake win. |
| C4 | S1 | **Marathi audio is unowned.** Pre-generate ~15 demo lines as MP3 (Bhashini, or AI4Bharat Indic-TTS run once locally, or any Marathi TTS) and commit them under `apps/web/public/audio/mr/`. A "Listen in Marathi" button that plays a cached file needs no network (I5). Owner: R4. If no TTS is reachable by H36, record a Marathi-speaking teammate reading the lines; label it. |
| C5 | S1 | **Add the live tamper demo to R3.** `GET /api/ledger/verify` exists in the contract (`ChainVerifyRes`). Demo: open Prisma Studio, edit one `realised_paise_per_qtl` in `realisation_ledger`, hit verify, show `brokenAtSeq`. 20 seconds, unforgettable, and it is the honest answer to "why not blockchain". |
| C6 | S1 | **Weather is a feature, not a forecast.** You asked about predicting weather. Do not. IMD and Open-Meteo already publish forecasts; we consume rainfall anomaly as an input to the price model. Building a weather model in 72 hours produces a worse forecast than the free one and invites an expert to dismantle it. |
| C7 | S1 | **Two demo personas, not one.** Ramesh (HOLD with pledge quote, onion, 42 qtl) and a second farmer with tomato where the system returns `NO_ADVICE`. Judges must see the refusal. |
| C8 | S2 | **`WindowAction.SPLIT` needs a visible reason.** "Sell 15 quintal today to cover the ₹40,000 you need; hold 27." The split is the most farmer-recognisable behaviour in the product. |
| C9 | S2 | **Rename nothing.** Every rename after H4 costs five people an hour. Add fields; never rename. |

---

## D. Security and quality deltas (on top of `02_SECURITY_AND_QUALITY.md`)

- **CSRF on cookie auth.** Route handlers that mutate must check `Origin`/`Sec-Fetch-Site` or require the `x-idempotency-key` header, which browsers will not send cross-site without a preflight. R1: one middleware, one test.
- **OTP brute force.** `OtpCode.attempts` exists; enforce max 5 attempts and 3 requests per phone per 10 minutes in `/api/auth/otp/*`. Return the same error for wrong OTP and unknown phone.
- **`DEV_OTP_ECHO` must be impossible in production.** Guard on `NODE_ENV === 'production'` in code, not only in `.env`. Add a unit test that asserts the field is absent when `NODE_ENV=production`.
- **Photo upload (if R3/R4 add it):** accept only `image/jpeg|png|webp`, max 5 MB, strip EXIF GPS before storing, never serve from the same origin with a user-controlled filename. If in doubt, skip uploads: the 6-question assay is enough for the round.
- **Prisma Studio and `/api/admin/*` must be behind `role === 'ADMIN'`.** A judge will type `/admin`.
- **`npm audit --omit=dev` at H58**, and `pip-audit` in `services/ml`. Fix highs; document the rest.
- **Pre-commit secret scan.** `git diff --cached | grep -E "(sk_|AKIA|api[_-]?key\s*=\s*['\"][A-Za-z0-9])"` in a Husky hook, or at minimum a grep at each sync. `.env` is gitignored; `.env.local` and `.env.production` must be too (check `.gitignore`).
- **No `Math.random()` for anything security-relevant.** OTPs and idempotency keys from `crypto.randomInt` / `crypto.randomUUID`.
- **Error envelope test.** One Vitest that calls every route with an empty body and asserts `400 { error: { code } }`, never `500`.

---

## E. Things the playbook gets right that you must not lose under time pressure

1. Integer paise everywhere.
2. Model refusal as a feature.
3. Hash chain instead of blockchain, and the sentence that explains why.
4. Consent **before** the pooled sale.
5. Renegotiation rate on buyers.
6. Synthetic data badged as synthetic.
7. "The farmer never pays" as the answer to "who pays".
8. The suicide statistic mentioned once, precisely, from NCRB, never as decoration.
