
**Smart India Hackathon 2026 | Problem Statement 26132**


# MANDI-SETU


### The Farmer Price Realisation Stack


*Strengthening Market Linkages and Price Discovery for Farmers of Maharashtra*


**Organisation:** Government of Maharashtra, Maharashtra State Innovation Society, Department of Skills, Employment, Entrepreneurship and Innovation


**Category:** Software | **Theme:** Agriculture, FoodTech & Rural Development


**Team:** 6 members. Second SIH attempt.


---



---

# 00. How to Use This Document


This is a working document, not a brochure. It is written to be argued with, cut down, and turned into code. Every chapter has a job.


| Chapter | What it gives you | Who on the team owns it |
|---|---|---|
| 01 Problem decode | Line-by-line reading of the official PS text, and what the evaluator is actually asking for | Everyone, day 1 |
| 02 Root cause | Why farmers lose money, mapped to five distinct failure mechanisms | Pitch lead |
| 03 Landscape | What already exists (eNAM, Agmarknet, agri-startups) and the honest gap analysis | Pitch lead + research |
| 04 Solution thesis | The one-sentence idea, the five product pillars, and the wedge | Everyone |
| 05 Architecture | Services, data flow, tech stack, deployment | Backend + DevOps |
| 06 ML system | Every model, its inputs, its loss function, its evaluation, its failure mode | ML pair |
| 07 Data sources | Named datasets, access paths, licences, and how to build the training corpus | ML pair |
| 08 Trust & transaction | Lots, grading, escrow, e-NWR, disputes - the part that makes money actually arrive | Backend |
| 09 UX for low literacy | Voice-first Marathi design, screen-by-screen | Frontend + design |
| 10 Build plan | 36-hour hackathon plan and the 8-week pre-work plan, hour by hour | Team lead |
| 11 Demo script | The exact 8-minute narrative, minute by minute, with fallbacks | Pitch lead |
| 12 Judging strategy | How SIH is scored and how to farm each criterion | Pitch lead |
| 13 Risks | Every hole a judge will poke, and the pre-written answer | Everyone |
| 14 Impact model | The arithmetic that turns your demo into a rupee number | Pitch lead |
| 15 Roadmap | What happens after SIH - pilot, scale, sustainability | Team lead |
| 16 Appendices | Data dictionary, API contracts, reading list, checklists | Reference |


> **READ THIS FIRST**  
> The single most common reason strong SIH teams lose is that they build a dashboard and call it a solution. A dashboard shows a farmer a price. It does not put money in the farmer's hand. This document is organised around one obsession: the farmer must end the day with more rupees than they would have had otherwise, and the system must be able to prove it. Every feature that does not serve that obsession is a distraction, and there is a section later in this document listing the features we are deliberately NOT building.


## A note on provenance and honesty


This document distinguishes three kinds of claims, and you must keep the distinction when you present:


- VERIFIED - sourced from a document retrieved during research for this playbook. Cited inline.
- STRUCTURAL - a logical consequence of how the system works (for example: if a commission agent both lends to and buys from a farmer, the farmer has weak bargaining power). These need no citation but must be argued, not asserted.
- TO VERIFY - a number or fact we believe is roughly right but have not confirmed from primary source. These are flagged with [VERIFY] and you must confirm or drop them before the pitch. Do not let a [VERIFY] number reach a judge unchecked, because if a judge from the Maharashtra agriculture department catches one wrong number your credibility on all the others collapses.


> **ON THE SEARCH CONSTRAINT**  
> Live web search was blocked in the environment where this document was assembled, so government portals (agmarknet.gov.in, enam.gov.in, msamb.com, data.gov.in) could not be queried directly. Academic literature via the arXiv API and encyclopaedic sources were reachable and are cited. Chapter 07 therefore tells you exactly which portal to open, what to look for, and what shape the data comes in - treat that chapter as a task list for week 1, not as a completed data audit.



---

# 01. Decoding the Problem Statement


## 1.1 The official text, unpacked


Here is the problem description as published, split into its component claims. Each line of the original is a requirement in disguise, and the team that maps features to these lines one-to-one will score higher on "relevance to problem statement" than the team with the prettier UI.


| Official phrase | What the evaluator means | Your feature |
|---|---|---|
| "limited visibility of current and expected prices across nearby markets" | Not just today's price. Expected. Forecasting is explicitly asked for. And "nearby markets" means multi-mandi comparison, not single-mandi lookup. | Multi-mandi price board + 14-day forecast with intervals |
| "processors, institutional buyers and digital trading channels" | The buyer set is wider than mandi traders. Processors (dal mills, ginners, cold stores), institutional (retail chains, HORECA, exporters), and e-platforms. | Buyer graph with four buyer classes, not just traders |
| "Information on quality specifications, demand, logistics, storage, payment reliability and buyer credentials may be fragmented" | Six distinct information gaps named. Each one is a data model in your system. | Six-facet buyer/lot profile; payment-reliability score |
| "sell immediately after harvest because of liquidity or storage constraints" | This is the distress-sale mechanism. The answer is not advice, it is liquidity. Advising a farmer to wait without giving them cash is useless. | e-NWR pledge finance + storage matching + sale-window advice |
| "weak bargaining power" | Structural. One farmer with 8 quintals against a licensed trader cartel. The answer is aggregation. | FPO lot pooling with fair split ledger |
| "Buyers... struggle to aggregate consistent volumes and verify quality" | The buyer has a real pain too. Solve it and buyers pull the platform forward. This is your demand-side wedge. | Guaranteed graded lots, volume commitment, assay certificate |
| "improve transparent price discovery" | Transparent = auditable. Not "we show a price" but "here is why this price, and here is the record". | Open auction with sealed-bid option + immutable trade log |
| "reliable, efficient linkages from farm gate to suitable buyers" | Farm GATE. First mile. Transport is in scope. | Transport pooling + route optimisation |


## 1.2 The expected-outcome checklist


The PS lists the expected solution as a set of capabilities. Treat this as the marking scheme. Print it. Tick it off. A judge reading your submission should be able to find every one of these words in your demo.


| # | Required capability | Status in our design | Where |
|---|---|---|---|
| 1 | Aggregates mandi prices | Core. Agmarknet + eNAM + FPO-reported prices, reconciled | Ch 5, 7 |
| 2 | Buyer demand | Buyer intent board: standing orders and spot RFQs | Ch 8 |
| 3 | Quality requirements | Grade schema per commodity, mapped to AGMARK and buyer-specific specs | Ch 8 |
| 4 | Arrival volumes | Arrival series is both a display and a model feature | Ch 6, 7 |
| 5 | Transport and storage options | Transport pool + warehouse capacity index | Ch 8 |
| 6 | Localised price trends | District and mandi-level, not state-level. Localisation is explicit. | Ch 6 |
| 7 | Sale-window recommendations | The Sell/Hold/Store engine. This is our differentiator. | Ch 6 |
| 8 | Matches farmers/FPOs with verified buyers | Two-sided matcher with verification tiers | Ch 8 |
| 9 | Lot creation | Digital lot with provenance, grade, photos, quantity | Ch 8 |
| 10 | Quality grading | On-device CV grading + assay integration | Ch 6, 8 |
| 11 | Digital offers | Structured offer/counter-offer flow, auction or negotiated | Ch 8 |
| 12 | Logistics coordination | Trip creation, pooling, tracking | Ch 8 |
| 13 | Payment tracking | Escrow-style milestone tracking with UPI/RTGS references | Ch 8 |
| 14 | Dispute or grievance process | ODR flow with evidence trail and SLA clock | Ch 8 |


### And the outcomes they will measure you against


- Improved farmer price realisation - you must be able to produce a number.
- Reduced information asymmetry - measurable as forecast accuracy plus reach.
- Lower transaction cost - measurable as commission plus transport plus wastage saved.
- Stronger FPO aggregation - measurable as lot size and number of farmers per lot.
- Reduced post-harvest loss - measurable as tonnes diverted from spoilage to storage or faster sale.
- More reliable buyer sourcing - measurable as fill rate and repeat-buyer rate.
- Transparent transaction records - measurable as completeness of the audit trail.


> **THE HIDDEN REQUIREMENT**  
> Read outcome one and outcome seven together: "improved farmer price realisation" and "transparent transaction records". Put together they mean the system must be able to answer, for any single transaction, the question: did this farmer get a fair price, and how do we know? That is a measurement problem, not a UI problem. Build the measurement into the product from the first commit - a Realisation Ledger that records, for every trade, the counterfactual (what the farmer would have got in their default mandi that day) alongside the actual. No other team will do this, and it is the single thing that turns your demo from a claim into evidence.


## 1.3 Why Maharashtra is the right scope, and how to say so


You have decided to build for Maharashtra only. That is correct, and you should defend it as a strength rather than apologising for it. Here is the argument.


1. The problem statement is issued by the Government of Maharashtra. Solving for Maharashtra is solving for the customer. A generic pan-India solution is a worse answer to this specific question.
2. Maharashtra has the deepest institutional surface to integrate with. MSAMB oversees roughly 295 APMCs in the state (Wikipedia, Agricultural produce market committee). That is a large, real, addressable set of markets with existing digital touchpoints.
3. Maharashtra is the state where this problem is most acute. It is the worst-affected state for farmer suicides: over 60,000 deaths recorded 1995-2013 and 4,248 in 2022 (NCRB figures via Wikipedia, Farmers' suicides in India). If the intervention works anywhere, it must work here first.
4. Maharashtra already reformed in the direction our solution needs. In July 2016 the state removed fruits and vegetables from APMC jurisdiction and issued 148 direct marketing licences, 91 of them for fruits and vegetables (Wikipedia, APMC). The legal permission for direct farmer-to-buyer sale already exists in the crops with the worst volatility. We are not asking for a law change; we are building the missing software layer on top of a reform that already happened.
5. Crop diversity gives us a hard test bed in one state. Onion (Nashik/Lasalgaon), cotton and soybean (Vidarbha), sugarcane (western Maharashtra), pulses and oilseeds (Marathwada), grapes and pomegranate (Nashik/Solapur), banana (Jalgaon), Nagpur orange. Perishable and non-perishable, MSP-covered and not, export-oriented and domestic. Any architecture that survives this set will generalise.
6. One language, one regulator, one dialect family. Marathi-first voice UX is achievable at demo quality in the time available. A multi-language build would be shallow in every language.


> **THE LINE TO USE IN THE PITCH**  
> "We deliberately scoped to Maharashtra. Not because the problem is smaller here, but because it is largest here - this is the state with the most farmer suicides in India - and because Maharashtra has already done the legal reform that our design needs. We are the software layer on a reform that is already law. Everything we built is state-parameterised, so Karnataka is a config file, not a rewrite."


## 1.4 The five crops we will build against


Do not build for "all crops". Build for five, deeply, and show the schema generalises. These five are chosen to cover the distinct economics.


| Crop | Region | Why it is in the set | Economic character |
|---|---|---|---|
| Onion | Nashik, Ahmednagar, Solapur | Extreme volatility, storable, export-policy sensitive, politically visible. Lasalgaon is the reference market and BARC runs an irradiation plant there for shelf-life extension (Wikipedia, Lasalgaon). | Storable + volatile = the sale-window engine has maximum value here |
| Tomato | Pune, Nashik, Satara | Highly perishable, violent price swings, most-studied crop in the price-forecast literature (Jain et al. 2020; Bhardwaj et al. 2023 both use tomato). | Perishable = speed of match matters more than timing |
| Soybean | Vidarbha, Marathwada | MSP-covered oilseed, large area, moisture-sensitive grading, ties to the debt narrative. | MSP floor exists but procurement is thin - the gap is the story |
| Cotton | Yavatmal, Amravati, Akola | The crop at the centre of the Vidarbha distress narrative. Amravati and Yavatmal are named cotton districts (Wikipedia, Vidarbha). | Long payment cycles, ginner concentration, staple-length grading |
| Tur / Chana (pulses) | Marathwada, Latur | MSP-covered, storable, and the crop group MSP has historically underserved relative to wheat and rice (Wikipedia, MSP). | Storage + pledge finance is the whole answer here |


### And the grading dimensions per crop, because grading is where trust is won


| Crop | Grade axes we will model | Assay proxy |
|---|---|---|
| Onion | Size distribution (mm bands), colour uniformity, neck condition, sprouting, rot fraction, dry-skin cover | CV on a 12-shot photo set + weight sample |
| Tomato | Ripeness stage, size grade, blemish fraction, firmness proxy, cracking | CV + declared harvest date |
| Soybean | Moisture percent, foreign matter, damaged/split fraction, oil content proxy | Moisture meter reading + CV for FM and splits |
| Cotton | Staple length, micronaire proxy, trash fraction, colour grade, moisture | Trash and colour by CV; staple by declared variety plus sample |
| Tur/Chana | Moisture, foreign matter, weevil damage, size uniformity, split fraction | Moisture meter + CV |

