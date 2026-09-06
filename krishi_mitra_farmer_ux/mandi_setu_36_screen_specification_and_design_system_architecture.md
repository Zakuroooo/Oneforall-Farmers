# Mandi-Setu Design System & Complete 36-Screen Farmer Experience Architecture

### Visual Philosophy & Strategic Color Rationale
* ** Deliberately NOT Government Green & Banking Blue**: Agri-tech and micro-fintech in India have historically relegated rural citizens to drab, low-effort portals built with sterile forest greens, harsh institutional blues, and flat 1px grey outlines. 
* **The Mandi Reality**: An Indian mandi (Lasalgaon, Pimpalgaon, Nashik) vibrates with sensory tactility — golden sun-cured onion skins, piles of raw turmeric, deep terracotta gunny sacks, marigold garlands on weighing scales, and sun-baked jute.
* **Sunlight Engineering**: Budget Android LCD screens under blinding Maharashtra midday sun suffer severe washout. Mandi-Setu leverages high optical density: high-contrast charcoal black text (#18181B) on warm linen/cream (#FAF6EE and #F3EDE0), paired with punchy Turmeric Amber (#C2410C / #D96B00) for unmissable primary interactions, crisp Emerald (#047857) for verified upsides, and honest Terracotta-Crimson (#B91C1C) for downside risks.
* **Consumer-Grade Craft (Swiggy / Zomato Benchmark)**: Large confident typography, 56dp+ primary pill actions, tabular font figures, soft 12px/20px radiuses, atmospheric blurred headers, and high-impact photography with subtle gradient scrims.

---

### Core Non-Negotiables Baked into the Design
1. **Identical Symmetry of Money Figures**: Expected gain (+₹6,290) and worst case (−₹4,800) stand side-by-side at **exact identical font size (24px/bold), weight, and prominence**. Downside risk is never diminished or hidden.
2. **Indian Number Formatting**: Strict ₹X,XX,XXX notation (e.g. ₹1,900, ₹76,000, ₹1,96,000, ₹2,00,000).
3. **Ergonomic Outdoor Usability**: 48dp–56dp touch targets, thumb-zone primary action sheets, voice mic inputs as first-class citizens across all inputs.
4. **Honest Refusal (No Advice State)**: Prominently designed as an integrity checkpoint rather than a system error.

---

### 36-Screen Journey & System State Matrix

#### Flow 1: First Open & Onboarding (Screens 1–7)
1. **01_Splash**: Bold Mandi-Setu wordmark, warm marigold halo, tagline *"Bhaav Ka Bharosa, Seedha Sauda"* (Faith in your price, direct trade).
2. **02_Language**: Generous tactile selection cards (English, हिंदी, मराठी) with audio greeting preview.
3. **03_ValueCarousel**: Swiggy-grade editorial imagery: *"Know what your crop is worth today"*, *"Sell straight to verified buyers"*, *"Money protected in escrow"*.
4. **04_PhoneNumber**: Oversized +91 prefix, 10-digit high-contrast numeral entry, one-tap voice input.
5. **05_OTP**: 6 auto-advancing segmented pins, 30s resend timer, explicit error validation state.
6. **06_Register**: Rambhau Patil registration, district picker (Nashik), village (Niphad), voice-to-text validation state.
7. **07_Welcome**: Joyful onboarding completion card confirming location (Niphad, Nashik) and setting crop preference (Onion).

#### Flow 2: Home & Daily Market Intelligence (Screens 8–10)
8. **08_Home**: Daily mission-control. Frosted navigation, Lasalgaon today's price (₹2,050/q, +5.2%), 11-day Hold Recommendation banner with identical Gain (+₹6,290) & Worst Case (−₹4,800), active lots carousel, urgent buyer offers strip, listen-aloud button.
9. **09_Market**: Comprehensive market pulse. 180-day interactive price history, 14-day shaded forecast corridor (pessimistic vs optimistic bands), and ranked nearby mandis (Lasalgaon ₹2,050 net 0km, Pimpalgaon ₹2,015 net 32km, Nashik ₹1,960 net 58km) accounting for freight & deductions.
10. **10_HowReliable**: Unflinching predictive audit. Model accuracy score (84%), past 90-day win/loss outcomes, transparent disclosure of prediction variance during unseasonal rains.

#### Flow 3: The High-Stakes Decision (Screens 11–14)
11. **11_ShouldISell**: The core engine. Verdict *"HOLD FOR 11 DAYS"*, with identical side-by-side cards: Expected Gain **+₹6,290** vs Worst Case **−₹4,800** on 40 quintals. Confidence: Medium. Costs deducted: ₹155/q.
12. **12_CostBreakdown**: Modal bottom sheet dissecting the ₹155/q cost: transport (₹60), commission (₹51), storage (₹28), spoilage (₹11), loading (₹5).
13. **13_LoanAgainstCrop**: Cashflow bridge card offering ₹34,000 credit against stored harvest at 9% p.a. (₹92 interest for 11 days) at Niphad warehouse, plotted directly against the ₹6,290 projected gain.
14. **14_NoAdvice**: Radical honesty screen when forecast volatility spikes. *"Prices have been unusually volatile this week. The range is too wide for us to give you a number we would stand behind."*

#### Flow 4: Listing Produce & Grading (Screens 15–24)
15. **15_MyProduce_Empty**: Welcoming empty state with clear illustration, benefit bullets, and prominent "List Your First Lot" button.
16. **16_MyProduce_Lots**: Rich lot cards showcasing high-res photograph, Grade A badge, 40 Quintals, asking price, and badge: *"3 Buyers Interested"*.
17. **17_Camera**: Custom camera guide with crop framing ellipse, sunlight exposure lock, and photo tips.
18. **18_PhotoReview**: Full-bleed photograph confirmation with retake / continue controls.
19. **19_Quantity**: Big numeric dial/stepper for 40 quintals with live weight conversion (4,000 kg / 80 bags).
20. **20_QualityQuestions**: Multi-step diagnostic (e.g. Uniformity: Very Uniform / Mixed / Very Mixed; Moisture, Sprouting) with step counter (Step 2 of 6).
21. **21_YourGrade**: Rewarding reveal card: Grade A (Score: 850/1000) with tangible actionable advice: *"Sun-dry for 2–3 days to reach a higher grade."*
22. **22_PriceAndPublish**: Fair-market slider pre-centered at ₹1,950–₹2,100, custom asking price field, and one-tap publish.
23. **23_Published**: Success state with real-time buyer matching radar animation.
24. **24_LotDetail**: Deep inspection view of Rambhau's 40q onion lot, market price comparison, and active inbound buyer pool.

#### Flow 5: Direct Marketplace & Escrow Selling (Screens 25–33)
25. **25_BuyersForLot**: Matching buyers ranked by net offer: Pune Trading Co (₹1,850/q, 45km, fills 40%), Nashik Agro Exports (₹1,910/q, 12km), Sahyadri Farms FPO (₹1,880/q, 63km).
26. **26_BuyerProfile**: Pune Trading Co profile: 98.4% on-time payment, 142 deals completed, escrow verified badge, 0 disputes.
27. **27_Bargaining**: Live chat-like negotiation room. Turn 1 (Buyer ₹1,850) → Turn 2 (Farmer ₹1,950) → Turn 3 (Buyer ₹1,900 counter). Round 3 of 3 indicator with accept/counter options.
28. **28_MakeCounterOffer**: Bottom sheet pre-filled with recommended counter ₹1,920 and pre-written quick text pills.
29. **29_ConfirmAcceptance**: Solemn binding agreement card: 40 Quintals at ₹1,900/q = ₹76,000 total payout via escrow.
30. **30_DealDone**: Confetti celebration screen: *"Deal Confirmed with Pune Trading Co!"*
31. **31_DealsList**: Segmented tabs (Active Escrow, In Transit, Completed History).
32. **32_DealTracking**: Multi-step Escrow Timeline: [Payment in Escrow] → [Dispatch] → [In Transit] → [Arrived at Mandi] → [Inspected] → [Payment Released]. Loud visual banner stating: *"Current Money Location: Safe in Mandi-Setu Escrow"*.
33. **33_Settled**: Verified harvest receipt. Sold at ₹1,900 vs ₹1,720 harvest day price = **₹7,200 MORE on the lot**. Direct bank transfer confirmation.

#### Flow 6: Account & Resilient States (Screens 34–36 + System States)
34. **34_MenuDrawer**: Farmer profile drawer (Rambhau Patil, Niphad), FPO membership, data source transparency (Agmarknet + Mandi-Setu Sensor Grid), language switch, sign out.
35. **35_Profile**: Profile settings, bank account for escrow payouts, warehouse receipts.
36. **36_LanguageSwitch**: Instant on-the-fly language toggle (English, हिंदी, मराठी).
* **System States Board**: Full-screen skeleton loaders for Home & Lots, Offline cached data banner (*"Showing cached prices from 2 hrs ago"*), Network error with retry, and hardware permissions card.