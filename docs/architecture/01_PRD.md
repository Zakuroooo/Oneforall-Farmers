# 01 — PRD: Product Requirements, Phase 1

> **Owner:** Pranay (product) · **Read `00_CANON.md` first.**
> This is *what* we build and *why*. `02_TRD_SYSTEM_DESIGN.md` is *how*.

---

## 1. Problem

**PS 26132 · Strengthening market linkages and price discovery for farmers · Govt. of Maharashtra**

A Maharashtra farmer harvests 40 quintals of onion in Nashik. Three things happen:

1. **He does not know today's price** across the mandis he could reach — and even if he checks Agmarknet, it shows yesterday's modal price for one mandi, in a table, in English, with no transport netted out.
2. **He does not know tomorrow's price.** He suspects it will rise after the arrival glut clears. He is often right.
3. **He sells anyway, at harvest, at the bottom.** Because a trader gave him ₹40,000 in advance in June, because his daughter's school fee is due, because he has nowhere to store 40 quintals, because the money must come *this week*.

**The information gap is real. It is not the binding constraint.** The binding constraint is **the ability to wait**.

This is why "we built a price dashboard" fails this problem statement. A dashboard tells him what he already suspects and changes nothing. Maharashtra recorded **2,635 farmer suicides in 2024** — the highest in the country. Debt and price collapse are the two most-cited drivers. A farmer who cannot wait sells into the glut he helped create.

### What we are therefore building

**A waiting product.** It answers one question with an actual number:

> *"Should I sell today, or wait? By how much am I better off? What if I'm wrong? And if I need money now, how do I wait without selling?"*

Every screen exists to make that answer credible.

---

## 2. Users

| Persona | Who | Device | Literacy | Primary need |
|---|---|---|---|---|
| **Farmer** — *primary* | Small/marginal holder, 1–5 acres, Nashik/Ahmednagar/Solapur | Android, ₹8k phone, 3G, shared in household | Marathi speaker; may read slowly or not at all | *Sell now or wait? How much more? Can I afford to wait?* |
| **FPO admin** — secondary | Runs a 30–200 member producer company | Android or laptop | Literate, Marathi + some English | *Can I aggregate members into a lot big enough to attract a real buyer, and split the money in a way nobody disputes?* |
| **Buyer** — secondary | Trader, processor, retail chain sourcing manager | Laptop, browser | Literate, English/Marathi | *Where is 100 quintals of grade-A onion, at what price, from someone who will actually deliver?* |
| **Officer / policy** — Phase 2 | APMC or Dept. of Agriculture | Laptop | — | *Where is the price collapsing? Which mandis are absorbing arrivals?* |

**Design consequence of persona 1:** the farmer app is **Marathi-first with a voice fallback**, big touch targets, a single primary action per screen, and no table a farmer must parse. English is the *second* language, not the default. This is not decoration — a low-literacy farmer is the actual user in PS 26132 and every panel knows it.

---

## 3. Phase 1 scope — the 19 items

🟢 = built in the 36 hours. Anything not here is Phase 2 or 3.

### Price discovery — 5 items

| # | Feature | Owner | Acceptance |
|---|---|---|---|
| **F1** | **Today's price**, farmer's commodity × nearest mandi, from real Agmarknet data | Kartik, Pranay | Screen shows modal price + date + `source` badge; latest obs date is within 7 days of demo day |
| **F2** | **90–180 day price history chart** with min/max band | Kartik, Nikhil, Pranay | Chart renders ≥90 real points; every point is `AGMARKNET` or `ARCHIVE`; badge shows which |
| **F3** | **★ Nearby mandis ranked net of transport** | Nilesh, Pranay | List sorted by `net_paise_per_qtl`; each row shows gross, transport, commission and net; at least one row where net-order ≠ gross-order (that's the whole point) |
| **F4** | **14-day p10/p50/p90 forecast** | Nikhil, Pranay | Fan chart with a shaded band. **No point prediction without a band, ever.** |
| **F5** | **★ Model card** — MASE vs seasonal-naive, empirical p10–p90 coverage %, train window, row count | Nikhil, Shreya | One screen reachable in ≤2 taps from the forecast. MASE < 1.0 or we say so honestly. |

### The decision — 4 items

| # | Feature | Owner | Acceptance |
|---|---|---|---|
| **F6** | **★★ Sale-window verdict** — SELL_NOW / SELL_ELSEWHERE / HOLD / SPLIT / NO_ADVICE with ₹ gain and confidence | Nilesh, Pranay | The hero card. Verdict + rupees + hold days + confidence, one screen, no scroll for the verdict itself. |
| **F7** | **★ Itemised cost breakdown** — transport, commission, storage, spoilage, loading | Nilesh, Pranay | Expandable panel; the five lines sum to the displayed total; **all subtracted before the verdict**, not after |
| **F8** | **★ Worst case at equal visual weight** — the p10 outcome | Nilesh, Pranay | "Best case ₹X / Worst case −₹Y" in the **same font size**. Not a footnote, not grey, not smaller. |
| **F9** | **★★ NO_ADVICE refusal** | Nilesh, Nikhil | Fires on real onion volatility with the configured band threshold. **Demonstrated live from real data, not a hardcoded demo row.** |

### Liquidity — 1 item

| # | Feature | Owner | Acceptance |
|---|---|---|---|
| **F10** | **★ Pledge-finance simulation** — loan against warehouse-stored crop, so the farmer can wait | Nilesh, Pranay | Card renders **only** when `expected_gain_paise > interest_paise` (I13, server-enforced). Labelled *"Indicative simulation — not a lender quote"* on every surface. |

### Market linkage — 6 items

| # | Feature | Owner | Acceptance |
|---|---|---|---|
| **F11** | **Lot creation** — commodity, quantity, mandi, harvest date, photo | Akash, Pranay | Works in ≤5 taps + one photo. Voice pre-fill on this screen only. |
| **F12** | **6-question self-assay grading** → A/B/C + weakest-dimension improvement tip | Akash, Pranay | Deterministic score; the tip names the dimension and estimates the ₹ upside of fixing it |
| **F13** | **Buyer demand posting + ranked matching incl. multi-lot combinations** | Akash, Shreya | `/demands/{id}/matches` returns at least one `COMBINATION` row filling 100% of a demand no single lot can fill |
| **F14** | **★★ Direct farmer↔buyer counter-offer negotiation**, 3 rounds, **with the farmer's own forecast beside the counter input** | Akash, Pranay, Shreya | Farmer sees *"Buyer offered ₹1,900. Your forecast says ₹2,050 in 11 days."* while typing the counter. This is the middleman-removal feature. |
| **F15** | **Escrow state machine + append-only event timeline** | Akash, Shreya | 5 transitions visible as a timeline both sides can read. Illegal transition → 409. |
| **F16** | **Dispute raise + evidence + resolution stages** | Akash, Shreya | Photo evidence, stage timeline, three resolution outcomes |

### Aggregation & trust — 3 items

| # | Feature | Owner | Acceptance |
|---|---|---|---|
| **F17** | **FPO grade-weighted split**, read-only, with `vs_solo` gain per member | Kartik (seed), Pranay | Shares sum to exactly 10000 bps; every member's `vs_solo_paise > 0` (Pareto guard); the weight formula is visible on screen |
| **F18** | **Buyer reliability card** — deals completed, on-time payment %, **renegotiation rate** | Kartik (seed), Shreya | Farmer sees this *before* accepting. Renegotiation rate is the number that matters and nobody else shows it. |
| **F19** | **★ Data provenance screen** — row counts by source, date ranges, source URLs | Kartik, Shreya | Reachable from the app. **Volunteering provenance beats being asked for it.** |

### Access layer — cross-cutting, applies to all farmer screens

| # | Feature | Owner | Acceptance |
|---|---|---|---|
| **A1** | **Full Marathi UI** — every farmer string, Devanagari numerals | Shreya | Zero English on any farmer screen with `locale='mr'`. Toggle works without reload. |
| **A2** | **★ Voice-out on the verdict** — pre-generated Sarvam clips, stitched at playback, **works in airplane mode** | Shreya | "पुन्हा ऐका" button reads the verdict aloud with the rupee amount. Zero network calls. |
| **A3** | **Voice-in on lot creation only** — pre-fills the form, farmer confirms by tap | Shreya, Pranay | Never silently commits. Confirm screen always shown. |
| **A4** | **★ Offline last-known-value with timestamp banner** | Pranay | *"काल दुपारी ३ वाजताची माहिती"* — the airplane-mode demo moment |

---

## 4. Explicitly OUT of Phase 1

Say these out loud on the roadmap slide. Deferring on purpose is competence; pretending you didn't notice is not.

| Not building | Why not | Lands in |
|---|---|---|
| Real payment gateway / Razorpay | Escrow logic is the intellectual content; a sandbox key adds a live network call (I7) and a KYC rabbit hole | Phase 2 |
| CV grading from the photo | A CNN trained on ~200 scraped images is a liability that *looks* like a feature; the self-assay is honest and the photo is already stored as evidence | Phase 2, as a cross-checked **second** signal |
| Real e-NWR / lender integration | Requires WDRA and bank onboarding | Phase 2 |
| Generative LLM chat assistant | An LLM hallucinating a hold recommendation to a farmer **inverts the entire product thesis**. Phase 1 ships retrieval over a curated fixed-answer FAQ. | Phase 2, with citations + refusal |
| Live daily ingestion cron | Ingestion is an offline job in Phase 1. Zero live calls in the demo (I7). | Phase 2 |
| Aadhaar / full KYC | I9. Never storing Aadhaar, in any phase. | never |
| Hindi and other languages | Marathi + English done properly beats four done badly | Phase 2 |
| Logistics / transport booking | Out of PS scope | Phase 3 |
| Blockchain | Append-only + FK integrity is the correct tool. We can defend this. | never |
| Admin/officer dashboard | No judge asks for it in a 7-minute demo | Phase 2 |
| SMS / IVR fallback | Highest real-world impact, but needs a telecom account | Phase 2 |
| E2E test suite | 36 hours. `pytest` on the decision engine + manual golden-path runs. | Phase 2 |

---

## 5. Screen inventory

**23 screens, one Expo codebase.** Farmer stack = Pranay. Buyer stack + shared UI = Shreya.

### Farmer (14) — Pranay

| # | Screen | Key content |
|---|---|---|
| S1 | Language picker | Marathi / English, giant buttons, first launch only |
| S2 | Phone → OTP | 10-digit, then 6-digit; dev OTP echoed in dev only |
| S3 | Profile setup | Name, district, village, primary commodity |
| S4 | **Home** | Today's price for my crop × my mandi, `source` badge, **offline banner (A4)**, and one big CTA: *"थांबावं की विकावं?"* |
| S5 | Price history | 90–180d chart, min/max band, source badge |
| S6 | **★ Nearby mandis (net)** | Ranked list; gross, transport, net, distance per row |
| S7 | **★ Forecast** | 14-day p10/p50/p90 fan chart + link to the model card |
| S8 | Model card | MASE, coverage %, train window, rows, baseline name |
| S9 | **★★ Verdict** | THE HERO. Verdict, ₹ gain, hold days, confidence, worst case at equal weight, **speaker button (A2)** |
| S10 | Cost breakdown | Five itemised lines + total, expandable from S9 |
| S11 | **★ Pledge simulation** | Loan, interest, net benefit, warehouse, disclaimer. Absent when not worthwhile. |
| S12 | Create lot | 5 fields + photo; **voice pre-fill (A3)** |
| S13 | Self-assay | 6 questions, one per screen, then grade + tip |
| S14 | **★★ My offers + counter** | Offer list; counter screen shows **my forecast beside the input** |
| S15 | Transaction timeline | Escrow stages, append-only, plain Marathi labels |
| S16 | FPO pool (read-only) | My share, weight formula, `vs_solo` gain |

### Buyer (7) — Shreya

| # | Screen | Key content |
|---|---|---|
S17 | Buyer login | Phone + OTP, role=BUYER |
S18 | Post demand | Commodity, qty, min grade, bid, delivery mandi, needed-by |
S19 | **★ Matches** | Ranked, `SINGLE` and `COMBINATION` rows, `why_*` sentence per row |
S20 | Make offer | Price, qty, lot selection (multi-select for combinations) |
S21 | **Offer thread** | Counter chain both directions, round counter, 3-round cap visible |
S22 | Transaction timeline | Same FSM view, buyer side |
S23 | Farmer/lot detail | Grade, assay dims, photo, farmer's district |

### Shared (2) — Shreya

| # | Screen | Key content |
|---|---|---|
| S24 | **★ Data provenance** | Row counts by source, date ranges, source URLs. Linked from both stacks. |
| S25 | Dispute raise / view | Reason code, description, photo, stage timeline |

---

## 6. The hero screen, specified exactly

S9 must be right. Everything else is context for it.

```
┌────────────────────────────────────────┐
│  कांदा · लासलगाव · ४० क्विंटल        │  ← crop · mandi · qty
│                                        │
│      ┌──────────────────────────┐      │
│      │      थांबा (HOLD)        │      │  ← 40px, the verdict, colour-coded
│      │        ११ दिवस           │      │
│      └──────────────────────────┘      │
│                                        │
│   जास्त मिळू शकतात                     │
│   + ₹६२,९००          ← 32px            │  ← total for the lot, not per qtl
│                                        │
│  ┌──────────────┬──────────────────┐   │
│  │ चांगल्यास    │ वाईट झाल्यास     │   │  ← SAME FONT SIZE. 20px both. (F8)
│  │ + ₹६२,९००    │ − ₹४८,०००        │   │
│  └──────────────┴──────────────────┘   │
│                                        │
│  खात्री: मध्यम ●●○                     │  ← confidence dots
│                                        │
│  ▸ खर्च वजा केला: ₹१५,५३५/क्विंटल      │  ← taps to S10 (F7)
│                                        │
│  ┌────────────────────────────────┐    │
│  │ 🔊  पुन्हा ऐका                 │    │  ← A2, offline TTS
│  └────────────────────────────────┘    │
│                                        │
│  ┌────────────────────────────────┐    │
│  │ थांबण्यासाठी पैसे हवे? →       │    │  ← F10, ONLY when worthwhile
│  └────────────────────────────────┘    │
│                                        │
│  📊 Agmarknet · ४ सप्टें २०२६          │  ← provenance, always visible
└────────────────────────────────────────┘
```

**And the refusal, same screen, same component:**

```
┌────────────────────────────────────────┐
│      ┌──────────────────────────┐      │
│      │  आम्ही सल्ला देणार नाही  │      │  ← the verdict IS the refusal
│      └──────────────────────────┘      │
│                                        │
│  पुढील १४ दिवसांचा अंदाज खूप          │
│  अनिश्चित आहे. चुकीचा सल्ला तुमचे     │
│  नुकसान करू शकतो.                      │
│                                        │
│  आजची किंमत: ₹१,९३९/क्विंटल            │  ← still give him today's fact
│  (खर्च वजा करून)                       │
│                                        │
│  ▸ अंदाज पहा →                         │  ← he can still see the wide band
└────────────────────────────────────────┘
```

> **The refusal is a designed screen, not an error state.** It is the single most defensible thing in the product. Every other team will show a confident number. We will show a refusal *and explain why refusing is correct* — and then show the wide band that caused it.

---

## 7. Success criteria — Phase 1

### Product
- A farmer completes **price → forecast → verdict → cost breakdown → pledge → lot → counter-offer → accept** without a crash or a dead end.
- The verdict endpoint responds in **< 500 ms** on seeded data.
- **NO_ADVICE fires from real data**, not a rigged row.
- Every screen has an empty, loading and error state.
- Airplane mode: the app opens, shows last-known price with a timestamp banner, and reads the verdict aloud.

### Data honesty
- Every price point traces to a `source` and a `source_url`.
- The provenance screen matches the DB row counts exactly.
- No figure on any slide lacks provenance.

### Model
- **MASE < 1.0** against seasonal-naive on held-out data, or we state the number honestly and explain it.
- **p10–p90 coverage between 70% and 90%.** Coverage of 99% means the band is uselessly wide; 40% means it's dishonest.
- The model card is in the app, not just the deck.

### Demo
- **11-beat script**, 7 minutes, rehearsed three times against the deployed build.
- A **fallback video recorded at H32**, before fatigue, before anything breaks.
- Zero external network calls, verified by running the demo with wifi off.

---

## 8. Non-functional requirements

| | Target |
|---|---|
| Verdict latency | < 500 ms p95 |
| Any screen first paint | < 1.5 s on 3G |
| Offline | Last-known price + last verdict readable and audible with no network |
| Bundle | < 30 MB including all audio clips |
| Concurrency | 20 simultaneous users (it's a demo on one EC2 box; say so if asked) |
| Security | §3 invariants I4, I9, I10, I14. Actor-scoped reads tested by hand with curl. |
| Accessibility | Min touch target 48×48 dp. Min body text 16 sp. Contrast ≥ 4.5:1. Never colour alone to convey the verdict — always colour + word + icon. |

---

## 9. The three cuts, and why they cost nothing visible

We cut 13 hours of work. A judge cannot see any of it.

| Cut | Instead | Saves | What a judge notices |
|---|---|---|---|
| Razorpay / real payments | Escrow FSM in our own Postgres, append-only event log, labelled *"payment rails simulated — the state machine is real"* | ~6 h | Nothing. The FSM is the interesting part and it's fully real. |
| Two separate frontends | One Expo codebase, role-based navigators, `--web` for buyer | ~4 h | Nothing. Arguably a *plus*: "one codebase, native and web." |
| Live FPO pool formation + consent flow | Seeded pool + one read-only split screen with correct arithmetic and the Pareto guard | ~3 h | Nothing, if the arithmetic is right and `vs_solo` is shown per member. |

And one dependency deleted for free: **Nilesh's decision layer is arithmetic.** It does not need Nikhil's trained model to start — it needs a `(p10, p50, p90)` triple. Nilesh builds against a **stubbed forecast from H2** and swaps in the real one at H12. That removes a 6-hour serial block from the critical path at zero cost.

---

## 10. Crop selection — a product decision with a demo payoff

**Two commodities. Chosen deliberately.**

| Crop | Why |
|---|---|
| **Onion** (Lasalgaon, Nashik) | Genuinely, famously volatile. **NO_ADVICE fires on real onion data with an honest threshold.** This defeats the killer question — *"did you tune that threshold to make refusal happen?"* — because we didn't: onion's real variance triggers it. Lasalgaon is also Asia's largest onion market, so a Maharashtra panel recognises it instantly. |
| **Soybean or Tur** (Latur / Ahmednagar) | Storable, seasonal, well-behaved. Produces a **clean, confident HOLD** with a tight band and a real ₹ gain. This is the "our model works" beat. |

Onion proves honesty. Soybean proves competence. One crop cannot do both.

---

## 11. Open decisions — close these at H0

| # | Question | Default if nobody decides | Who |
|---|---|---|---|
| 1 | ~~Name: Mandi-Setu or AgriSense?~~ | **Mandi-Setu.** Locked in `00_CANON.md` §0. Fix every doc and slide. | Pranay |
| 2 | Is Shreya on the buyer stack + i18n + voice? | **Yes**, per §5. If she is unavailable, cut buyer to 3 read-only screens (S17 login, S19 matches, S21 thread) and Pranay absorbs i18n. | Pranay |
| 3 | Second commodity: soybean or tur? | **Soybean** — better Agmarknet coverage in Latur | Kartik, by H4 |
| 4 | NO_ADVICE band threshold | **`band_width_bps > 3500`** (i.e. p90−p10 > 35% of p50). Tune once against real onion data at H14, then freeze and write the chosen value into the model card. | Nikhil + Nilesh |
| 5 | Chart library | `victory-native`. Decide at H1, never revisit. | Pranay |
| 6 | Pledge LTV / interest figures | Illustrative and clearly labelled until Kartik confirms WDRA's published terms with a URL | Kartik, by H8 |
| 7 | `vs_solo_paise` in the FPO seed | The old fixture (₹1,187/₹1,419/₹964) contradicts `docs/03_DEMO_AND_SEED.md:44` (+₹2,800). **Keep ₹2,800 total, regenerate the per-member rows to sum to it.** | Kartik |

---

## 12. What loses this hackathon

Read this list once per day.

- **A feature that works on one hand-typed path.** Judges click the second thing. Every screen needs a real empty state.
- **A live API call on stage.** I7.
- **A point forecast with no band.** That is not intelligence; it is a guess with a chart.
- **An unverified number on a slide.** Provenance or it comes off the slide.
- **Blockchain theatre.** We use an append-only table and can explain exactly why a chain is the wrong tool.
- **Feature work after H30.** Nothing new after the freeze. Nothing.
- **A hallucinating chatbot giving financial advice.** This inverts the thesis. Retrieval over fixed answers in Phase 1, or nothing.
- **Silence.** An undeclared blocker is the most expensive object in this repo. 30-minute rule: `docs/BLOCKERS.md` **and** the group chat, both, always.
