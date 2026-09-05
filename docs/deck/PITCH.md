# MANDI-SETU — PITCH DECK & DEMO NARRATION GUIDE

> **Owner: Shreya**
> **Duration:** 5 Minutes Presentation + 3 Minutes Q&A
> **Stage Setup:** Two phones side by side (Farmer App & Buyer Console)

---

## Part 1: The 9-Slide Deck Structure

### Slide 1: Title — Mandi-Setu (मंडीसेतू)
- **Headline:** A Waiting Product for Farmers of Maharashtra.
- **Thesis:** The binding constraint on farmer price realization is not information — it is the ability to wait.
- **Source:** Field survey, Nashik District Agriculture Department (2025).

### Slide 2: The Binding Constraint — "Why Farmers Can't Wait"
- **Key Insight:** Farmers already suspect prices will rise post-harvest, but sell immediately due to liquidity needs and storage risk.
- **Metrics:** 78% of smallholders in Nashik sell within 14 days of harvest.

### Slide 3: The Hero Feature — Quantile Window Verdict
- **Endpoint:** `POST /api/v1/ai/window/recommend`
- **Output:** Verdict (HOLD 11 Days), Expected Gain (+₹6,290 / lot), Worst Case (−₹4,800 / lot).
- **Invariant I16:** Both expected gain and worst-case displayed at equal font size (20sp).

### Slide 4: Offline Voice Engine (Accessibility Beat)
- **Headline:** Marathi-First, 100% Offline Voice Guidance.
- **Architecture:** Pre-generated audio clip set (~40 phrases + Marathi numerals 0-99 + units) committed to repo; zero external network dependencies (I7).

### Slide 5: Data Provenance & Transparency
- **Headline:** Every Number Has a Verified Source.
- **Metrics:** Agmarknet (75.4%), MSAMB (21.2%), Synthetic Test Logs (3.4%).
- **Live Endpoint:** `GET /meta/data-provenance` rendered verbatim on Screen S24.

### Slide 6: Disintermediation & Direct Buyer Matching
- **Headline:** Combination Bundling & Counter-Offers.
- **Feature:** Bundling 3 small farmer lots into 100 qtl buyer demands; 3-round counter-offer negotiation directly above forecast band.

### Slide 7: Escrow FSM & Dispute Resolution
- **FSM States:** `CREATED` → `ESCROW_HELD` → `DISPATCHED` → `DELIVERED` → `RELEASED`.
- **Security:** Immutable ledger audit log; cross-actor access returns 404 (I4).

### Slide 8: Technical Architecture & Performance
- **Stack:** FastApi, PostgreSQL 16, LightGBM Quantile Regression, React Native CLI 0.76, TanStack Query.
- **Backtest Result:** LightGBM out-performs seasonal-naive baseline across expanding walk-forward windows.

### Slide 9: Roadmap & Phase 2
- **Phase 1 (Shipped):** Nashik & Lasalgaon Mandis, Onion & Soybean, 100% Offline Voice, Buyer Console.
- **Phase 2 (Future):** Realization Tracking, KeyStore Integration, Expanded Mandis & Crops.

---

## Part 2: The 11-Beat Demo Script (Shreya Narrates, Pranay Taps)

1. **Beat 1 (Launch):** Pranay opens MandiSetu. Shreya: *"This is MandiSetu, running live on two devices."*
2. **Beat 2 (Provenance):** Show S24. Shreya: *"Before showing advice, here is our data source: 14,850 observations from Agmarknet and MSAMB."*
3. **Beat 3 (Home Screen S4):** Today's price ₹1,850/qtl in Lasalgaon.
4. **Beat 4 (Forecast Fan S7):** Show p10-p90 forecast band. Shreya: *"The p50 forecast line never renders without its confidence interval."*
5. **Beat 5 (Verdict Screen S9):** *"Hold 11 days. Expected gain ₹6,290. Worst case loss −₹4,800 shown at the exact same size."*
6. **Beat 6 (Voice Output 🔊):** Tap 🔊. Phone speaks in Marathi: *"थांबा. अकरा दिवस. अपेक्षित फायदा सहा हजार दोनशे नव्वद रुपये."*
7. **Beat 7 (Airplane Mode Test):** Turn Airplane Mode ON. Tap 🔊 again. It speaks seamlessly offline.
8. **Beat 8 (Pledge Quote):** Show liquidity pledge card. *"Interest is ₹92 to unlock ₹6,290 gain."*
9. **Beat 9 (Buyer Post Demand S18):** Switch to Buyer phone. Post 100 qtl demand.
10. **Beat 10 (Combination Match S19 & Negotiation S21):** Show 3-farmer combination bundle and counter-offer round.
11. **Beat 11 (The Refusal S9 NO_ADVICE):** Show high-uncertainty crop case. Screen displays: *"आम्ही सल्ला देत नाही"*. Shreya pauses 2 seconds in silence.
