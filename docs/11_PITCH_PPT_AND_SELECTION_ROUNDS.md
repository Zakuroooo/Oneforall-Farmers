# 11 · Pitch, PPT and the Selection Rounds

> Owner: **R5** from H0. Reviewed by all five at every sync window. The product exists to make this document true.

---

## 1. How the funnel actually works (verify each step on sih.gov.in this week)

| Stage | Who judges | What they see | What wins |
|---|---|---|---|
| **College internal hackathon** (your 3-day deadline) | Faculty, sometimes alumni. Usually **not** agri-domain experts. 5 to 8 minutes per team. | Slides + live demo or video | Clarity of the problem, one memorable demo moment, a working thing, confident answers. Polish matters more here than anywhere. |
| **Institute nomination** | SPOC + committee | Same material, ranked against other teams from your college across all PS | Being obviously complete. A team with a deployed URL and a video is easy to nominate. |
| **SIH portal shortlisting** (hundreds of teams per PS) | PS-owner evaluators (ministry / department / industry). Reading dozens of decks per day. | **The mandated Idea PPT only** (historically ~6 content slides), sometimes a short video link | Fit to the PS text, credibility, novelty stated crisply, a real-looking prototype. No live demo. Your PPT is the product at this stage. |
| **Grand finale** (36 h) | Department + industry jury, multiple rounds | Live build, mentoring rounds, final pitch | The playbook's Ch 10 to 12 apply from here. Not before. |

**Consequence:** in these three days you are optimising for two artefacts: **(a) a 7-minute live demo for faculty, (b) a 6-slide PPT that
survives a tired evaluator reading it in 90 seconds.** The product supports both; it is not the deliverable by itself.

---

## 2. The SIH Idea PPT (mandated template, historically these slides; download the 2026 template and map 1:1)

Use the official template file from the portal. Do not restyle it. Evaluators pattern-match on the template; a custom design reads as "did not read instructions".

### Slide 1 · Title
PS ID 26132 · PS title verbatim · Theme: Agriculture, FoodTech & Rural Development · Team name · Team ID. Team name suggestion: keep **MANDI-SETU**, it is sayable and means something.

### Slide 2 · Idea / Solution
Six bullets maximum, in this order:
1. **The insight:** farmers know prices will rise and sell anyway, because they cannot afford to wait. The constraint is liquidity and storage, not information.
2. **What we built:** a Marathi-first decision layer that says SELL_NOW / SELL_ELSEWHERE / HOLD / SPLIT with rupee gain, worst case, and confidence, net of storage, transport, spoilage and finance.
3. **We pay them to wait:** every HOLD comes with a simulated e-NWR pledge quote from a WDRA warehouse, so cash arrives today and the upside is kept. Guardrail: never offered if interest exceeds expected gain.
4. **Honesty as a feature:** the model refuses (`NO_ADVICE`) when its p10 to p90 band is too wide. Intervals, never point forecasts.
5. **Trust for distant buyers:** graded lots, FPO pooling with grade-weighted split consented before sale, buyer reliability including post-delivery renegotiation rate, escrow state machine, structured disputes.
6. **Proof:** an append-only, hash-chained Realisation Ledger records, per sale, rupees gained against the harvest-day home-mandi price. The state gets a policy instrument; the farmer gets PM-AASHA-ready proof.

One image: the sale-window screen with the HOLD card, the worst case, and the GET MONEY TODAY card visible.

### Slide 3 · Technical Approach
- Architecture diagram from `00_MASTER_BUILD_PLAN.md` §2.1 (two processes, module boundaries inside).
- Stack line: Next.js 15 · TypeScript · PostgreSQL · Prisma · Zod contracts · FastAPI · LightGBM quantile · conformal-style calibrated bands · PWA offline.
- ML line: **persistence and seasonal-naive baselines first**, LightGBM quantile per horizon, MASE and empirical coverage reported on the model card, refusal threshold on band width.
- Data line: Agmarknet / data.gov.in daily prices and arrivals, MSAMB APMC list, Open-Meteo rainfall, WDRA warehouse registry, hand-built onion policy-event calendar (export bans, MEP, stock limits).
- Security line: integer paise, actor-scoped reads, append-only ledger with SHA-256 chain, no Aadhaar, OTP + PIN, idempotent money mutations.

### Slide 4 · Feasibility and Viability
- **Built in 72 hours and deployed:** URL, one QR code. That sentence alone answers feasibility.
- **Real data:** N mandis × M years of Agmarknet onion series; measured MASE vs naive; measured coverage. Numbers, with the date they were measured.
- **Integrates, does not replace:** eNAM, e-NWR/WDRA, AgriStack Farmer ID, Bhashini, ONDC. Named Maharashtra channels: SMART and MAGNET FPOs, MSAMB.
- **Risks and mitigations** (three only): forecast wrong → intervals, refusal, credit so the farmer is not cash-exposed; data sparse → imputation flagged, minimum-history gate; herd effect → staggered dates and footprint monitoring.
- **Who pays:** buyer-side fee, state market-infrastructure budget, lender origination. **The farmer never pays.**

### Slide 5 · Impact and Benefits
- Per-farmer arithmetic (playbook §14.1) with **G from your own backtest**, labelled "measured on historical data, not projected".
- Map each PS expected outcome to a measurable indicator (playbook §14.3 table). Evaluators tick boxes; give them boxes.
- One sentence on the outcome behind the outcome, with the NCRB figure and no adjectives.

### Slide 6 · Research and References
Max 8 lines. Only verified: Agmarknet, MSAMB, WDRA, NCRB ADSI 2022, Agriculture Census 2015-16, NSSO SAS 77th round, and at most 3 papers you have opened yourself (1812.05173 interpretable Agmarknet forecasting; 2009.04171 IBM data-quality features; 2304.09761 spatial GNN). Put the GitLab repo and the deployed URL here too.

---

## 3. The 7-minute college demo

| Time | Beat | Screen | Who |
|---|---|---|---|
| 0:00 | Ramesh, 42 quintals, sold at ₹890 on harvest day, ₹1,340 twelve days later. He knew. He owed money on Friday. | One photo, no text | Narrator |
| 0:45 | "Everyone builds an information product. We built a waiting product." | Causal chain slide | Narrator |
| 1:30 | Login in Marathi. Nearby prices **net of transport**. | Farmer PWA | Driver |
| 2:15 | Forecast with p10/p50/p90 band and model card. Point at MASE. | Forecast screen | Driver |
| 3:00 | **HOLD 11 days, +₹119/qtl, worst case −₹86/qtl, confidence 7/10.** Tap Listen in Marathi. Let it speak. | Window screen | Driver |
| 3:45 | "He still needs ₹40,000 by Friday." Tap GET MONEY TODAY. WDRA warehouse, ₹1.46 lakh today, ₹542 interest, upside kept. **Pause.** | Pledge card | Narrator |
| 4:30 | Switch to tomato farmer. **NO_ADVICE** with reason. "We refuse to guess with her crop." | Refusal screen | Driver |
| 5:00 | Lot → self-grade → pool with two neighbours → split table → consent. Buyer console: match with why, reliability facts, offer, accept, escrow → released. | R3/R5 screens, fast | Driver |
| 6:00 | Ledger: measured ₹/qtl vs benchmark. Then **tamper one row in Prisma Studio, hit Verify, chain breaks at seq N.** | Ledger + verify | Driver |
| 6:40 | What is real, what is simulated, phase 2, the Maharashtra channels. Close on Ramesh. Stop. | One honest slide | Narrator |

Rules: wifi off, visibly. One drives, one talks. Never type. Fallback video one keystroke away. Every forecast shown with its band.

---

## 4. Questions faculty will ask (with the shorter answers they need)

- **"Is this data real?"** "Yes. N mandis, M years, from Agmarknet via data.gov.in, pulled on <date>, committed in the repo with a provenance file. Anything generated is badged SYNTHETIC on screen."
- **"How accurate is the model?"** "We do not report accuracy for a price series; we report MASE against naive, and coverage of our bands. MASE X, coverage Y%. Where the band is too wide we refuse."
- **"What if a farmer follows you and loses?"** "He saw the worst case before he chose, in Marathi, and if he held he had the cash from the pledge, so he was not exposed on borrowed conviction. We log every recommendation and publish our hit rate."
- **"eNAM exists."** "eNAM is a venue. We are the decision layer on top of it and we integrate. eNAM does not answer should I sell today, how do I get cash if I wait, and which buyer will actually pay."
- **"Why not blockchain?"** "We need tamper evidence and farmer verifiability. A hash chain gives both; here is it breaking live. A chain would cost us the engineering we spent on the credit loop."
- **"Why only Maharashtra / only onion?"** "The PS is from Maharashtra; onion is the most volatile storable crop and Lasalgaon is here. The schema is state- and crop-parameterised; soybean is a seed file."

---

## 5. Artefacts checklist for the internal round

- [ ] Official SIH Idea PPT filled, in the template, exported to PDF, and a copy in `docs/deck/`.
- [ ] 7-minute demo rehearsed 3× with a stopwatch; driver and backup driver.
- [ ] 90-second screen-recorded video with Marathi audio audible, uploaded (unlisted) and linked on Slide 6.
- [ ] Deployed URL working on a phone over mobile data. QR code on Slide 4.
- [ ] One-page handout: causal chain, four uniques, PS coverage table, headline G.
- [ ] Every number on every slide has a source line in `docs/deck/SOURCES.md`.
- [ ] Sixth team member confirmed (see `10_GAP_REVIEW_AND_CORRECTIONS.md` A3).
