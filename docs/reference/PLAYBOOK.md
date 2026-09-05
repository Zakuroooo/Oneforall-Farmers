
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



---

# 02. Root Cause: Why the Farmer Loses the Money


If you get one chapter right for the pitch, make it this one. Judges have heard "farmers face problems" a hundred times. What wins is a precise causal model with named mechanisms, because a precise model implies a precise intervention, and a precise intervention is a product.


The gap between what a consumer pays and what a farmer receives is not one leak. It is five, and they have different physics. Confusing them is why most agri-tech fails: it builds one tool and expects it to close five gaps.


## 2.1 The five loss mechanisms


### Mechanism 1: Information asymmetry (the price the farmer does not know)


The farmer knows one price: the one shouted in their own mandi this morning. The trader knows several: this mandi, the next district, the terminal market in Mumbai or Delhi, and the direction prices are heading this week. The gap between those two knowledge sets is captured entirely by the party with more information.


This is not a hypothesis. The problem statement itself opens with it: "limited visibility of current and expected prices across nearby markets". The official diagnosis and ours agree.


Note carefully what asymmetry means, because it changes the product. It is not that price data does not exist - Agmarknet publishes it. It is that the data is (a) published after the fact, (b) as a modal or min/max range that hides the distribution, (c) in a form and language and interface a smallholder does not consume, and (d) with no forward view. Publishing more of the same data does not close an asymmetry gap. Converting data into a decision does.


> **PRODUCT CONSEQUENCE**  
> The unit of value is not a price, it is a recommendation with a confidence interval and a reason. "Onion at Lasalgaon is Rs 1,240/qtl" is data. "Hold 12 days: Lasalgaon is forecast to rise to Rs 1,390 with 70% confidence, your storage cost is Rs 62, expected gain Rs 88/qtl net, but if you need cash now, pledge at 9% and still net Rs 61" is a product.


### Mechanism 2: Liquidity coercion (the distress sale)


This is the most important mechanism and the least served by existing software. A farmer harvests. They owe money now - to an input dealer, to a moneylender, for a wedding, for school fees, for a medical bill. They have no working capital and often no storage. So they sell on day one at whatever the market gives, even when they know prices will rise in three weeks.


The problem statement names it directly: farmers "may sell immediately after harvest because of liquidity or storage constraints".


Now look at the credit structure that makes this a trap. Debt is the most consistently cited factor in farmer suicides across the literature, and a 2014 study found that three traits together - cash crops such as cotton, farms under one hectare, and existing debt - explained "almost 75% of the variability in state-level suicides" (Wikipedia, Farmers' suicides in India). Non-institutional interest rates have been documented as high as 21 percent (same source, Punjab data). In Maharashtra, 43 percent of farmers are marginal, holding under one hectare, and average holdings across all size groups are below three hectares (Wikipedia, Agriculture in Maharashtra).


So the typical Maharashtra farmer is precisely the profile the suicide literature identifies as highest risk: small holding, cash crop, indebted. And the mechanism by which a bad price becomes a death is liquidity: the farmer cannot wait, so they take the bad price, so the debt does not clear, so they borrow again at a worse rate.


> **PRODUCT CONSEQUENCE - AND THE HEART OF OUR SOLUTION**  
> Advice without liquidity is cruelty. Telling a farmer "prices will rise, hold your crop" when they must repay a moneylender on Friday is worse than useless - it converts a financial problem into a psychological one. Therefore: every HOLD recommendation our system makes must come bundled with a cash option. That option is pledge finance against an electronic negotiable warehouse receipt. The crop goes into a registered warehouse, an e-NWR is issued, a lender advances 70-75 percent of value against that receipt, the farmer gets cash today AND keeps the upside when they sell later. This one loop is the difference between an advisory app and an intervention. Say this sentence in the pitch: "We do not tell farmers to wait. We pay them to wait."


### Mechanism 3: Fragmentation (weak bargaining power)


A single smallholder arriving with 8 quintals is a price-taker. A licensed trader in a mandi with a handful of peers is a price-setter. The Wikipedia article on APMCs states it flatly: "cartelization has been a big problem in APMCs", and the central premise of the 2020 reform attempt was the "monopoly of middlemen".


The structural detail that matters: only licensed traders may operate inside a mandi, and wholesalers, retailers and processors historically could not buy directly from a farmer (Wikipedia, APMC). That is a legally enforced bottleneck. Even where Maharashtra has relaxed it for fruits and vegetables, the software to route around the bottleneck does not exist for a farmer with a feature phone.


Aggregation is the known answer, and it is the reason the Government of India built the 10,000 FPO programme. But FPOs have their own failure mode: an FPO needs to convince 60 farmers that a pooled lot will be split fairly, and without a transparent split ledger, trust collapses at the first disagreement about whose onions were the good ones.


> **PRODUCT CONSEQUENCE**  
> Do not just "support FPOs". Build the thing FPOs actually lack: a grade-weighted fair-split ledger. Each farmer's contribution to a pooled lot is recorded with its own grade assay, the lot sells as one, and the proceeds split proportional to quantity times grade multiplier, visible to every contributing farmer on their phone before they agree to pool. Fairness must be verifiable in advance, not explained afterwards.


### Mechanism 4: Physical loss (post-harvest and first-mile)


Produce rots. It rots in the field waiting for a truck, in the truck waiting at the mandi gate, and in the mandi waiting for a bid. Each hour is a percentage of value. The Wikipedia article on post-harvest losses is unusually candid that reliable aggregate loss numbers do not exist - "there are no reliable methods for evaluating post-harvest losses of fresh produce" - and warns that averaged figures mislead because real outcomes range from near-zero to total write-off when "a price collapse makes harvesting uneconomic".


That last clause is the important one and it is a lesson for the pitch: some post-harvest loss is not a cold-chain problem, it is a price-information problem. A farmer who leaves tomatoes unharvested because the price does not cover the picking cost has suffered a 100 percent loss caused by market failure, not by refrigeration failure. Our system attacks that specific loss by finding a buyer at a price that makes harvest worthwhile, including lower-grade buyers such as processors who will take produce that the fresh market rejects.


> **PRODUCT CONSEQUENCE**  
> Grade-differentiated routing. A lot that fails fresh-market grade is not waste - it is processor feedstock at a lower but positive price. Most platforms treat quality as a binary pass/fail. We treat it as a routing key: Grade A to retail and export, Grade B to wholesale, Grade C to processing, Grade D to feed or dehydration. Every kilogram finds its highest-value home rather than its only home. This is also, incidentally, exactly what the problem statement means by "reduced post harvest loss".


### Mechanism 5: Counterparty risk (the money that never arrives)


A price agreed is not a price received. Payment delays, partial payments, post-facto quality disputes used as a lever to renegotiate downward, and outright default are ordinary experiences. The problem statement names it: "payment reliability and buyer credentials may be fragmented".


Note the second-order effect, which is the subtle part. Because payment risk exists, farmers rationally prefer a known local trader who pays cash at a lower price over an unknown distant buyer offering a higher price. Counterparty risk is therefore not just a loss in itself - it is a tax on every other improvement you make. You can show a farmer a better price 200 km away and they will still sell locally, correctly, because the better price is not credible.


> **PRODUCT CONSEQUENCE**  
> Trust must be engineered before better prices can be delivered. Three layers: (1) verification tiers for buyers, with GSTIN, APMC licence, PAN and bank-account verification, displayed as a badge; (2) a payment-reliability score computed from actual settled transactions on-platform - days-to-pay distribution, dispute rate, renegotiation rate; (3) escrow or assured-payment rails for high-value lots so the farmer's downside is bounded. Without these, higher prices displayed are higher prices ignored.


## 2.2 The causal chain, stated plainly


For the pitch, compress the five mechanisms into one causal chain. This is your opening 60 seconds.


```causal-chain
Small holding (43% of Maharashtra farmers under 1 ha)
  + cash crop with volatile price (cotton, onion, tomato)
  + existing debt at 18-24% from a non-institutional lender
      |
      v
NO ABILITY TO WAIT  ---------> forced sale on harvest day
      |                              |
      | no storage                   | one mandi, few licensed buyers
      v                              v
  spoilage / distress dump      price-taker, no bargaining power
      |                              |
      +-------------+----------------+
                    v
          REALISED PRICE << FAIR PRICE
                    |
                    v
          debt does not clear -> borrow again at worse rate
                    |
                    v
          next season, less ability to wait  (the loop tightens)
                    |
                    v
          the outcome this problem statement exists to prevent
```


The loop is the insight. This is not a static problem, it is a ratchet - each bad season reduces the farmer's ability to survive the next one. Which means an intervention does not need to fix the whole gap in one go. It needs to break the ratchet, by giving the farmer the ability to wait even once. A farmer who can wait one season enters the next season with less debt and more ability to wait. The system compounds in the farmer's favour instead of against them.


> **THE STRATEGIC CLAIM THAT WINS THIS PROBLEM STATEMENT**  
> Our thesis in one sentence: the binding constraint on farmer price realisation is not information, it is the ability to wait. Everyone else at this hackathon will build an information product. We are building a waiting product - forecast, storage, and pledge credit as one loop - and information is merely the input that makes the waiting decision correct. That is the difference between a price dashboard and a price outcome.


## 2.3 Quantifying the gap: what to say and what not to say


You will be tempted to open with a big number: "farmers get only 30 percent of the consumer rupee". Be careful. Judges from the agriculture department know these numbers are contested and vary hugely by crop and channel. A number you cannot defend is worse than no number.


Here is how to handle it. Use verified structural facts as your foundation, and generate your own numbers from the demo rather than borrowing shaky ones.


| Claim type | Example | Verdict |
|---|---|---|
| Verified institutional fact | "MSAMB oversees about 295 APMCs in Maharashtra" | Use freely. Cite source. |
| Verified official statistic | "4,248 farmer suicides in Maharashtra in 2022, the highest of any state (NCRB)" | Use. Powerful and defensible. Handle with respect, not as a statistic-drop. |
| Verified official statistic | "Only 23% of rural agricultural households were aware of MSP (MoSPI 2013); about a quarter of paddy and 20% of wheat sold at MSP in 2018-19" | Use. Excellent for the information-asymmetry argument. |
| Verified official statistic | "eNAM linked ~1,000 mandis across 18 states, 5 million+ farmer registrations, trade of Rs 1.22 lakh crore by Feb 2021, but transactions remain mostly intra-market" | Use. This is your gap-analysis anchor. |
| Contested aggregate | "farmers get X% of the consumer price" | Avoid as a headline. If used, attribute and give a range, and say it varies by crop and channel. |
| Self-generated from demo | "In our pilot dataset of 412 onion trades, median realisation improved Rs 143/qtl versus the same-day default-mandi modal price" | This is your best number. It is yours, it is defensible, and no other team will have one. |


> **DO THIS BEFORE THE PITCH**  
> Build the Realisation Ledger early and run it over historical Agmarknet data as a backtest. Then your headline number is not a borrowed statistic, it is your own measured result: "on three years of historical Maharashtra onion data, our sale-window engine would have improved median realisation by Rs X per quintal against a sell-on-harvest-day baseline, after storage and finance costs." A backtested number that you computed beats any citation, and it is the single highest-leverage piece of pre-work in this document.



---

# 03. The Existing Landscape and the Honest Gap


Judges will ask: eNAM exists, Agmarknet exists, there are a dozen agri-tech startups. Why you? If you cannot answer this crisply you lose, regardless of how good your build is. This chapter is your ammunition. The rule is: be scrupulously fair to what exists, then be precise about the gap.


## 3.1 Government infrastructure


| System | What it does | Verified scale | The gap we exploit |
|---|---|---|---|
| Agmarknet | Publishes daily mandi arrivals and min/max/modal prices across commodities and markets | Central price reporting portal of DMI, Ministry of Agriculture. The academic literature confirms researchers scrape it for 1,000+ markets (Ma et al., arXiv:1812.05173) | Backward-looking, sparse, no forecast, no distribution, no decision layer. Literature documents the data is "extremely sparse" and needs imputation before it is usable. |
| eNAM | Online trading platform for agri commodities; assaying, e-payment, single trader licence within a state | ~1,000 mandis, 18 states + 2 UTs, 5 million+ farmer memberships, Rs 1.22 lakh crore cumulative trade by Feb 2021, Maharashtra had 118 mandis integrated as of March 2021 (Wikipedia, National Agriculture Market) | Trade remains "mostly intra-market" by its own documentation. Inter-mandi and inter-state trade was planned in phases. So a farmer still cannot reach a distant better price. Also: mandi-centric by design - it presumes produce arrives at a mandi. |
| MSP / CACP | Floor price for 23 commodities, procured via FCI, NAFED and state agencies | 23 commodities. Awareness was 23% of rural agri households (MoSPI 2013). About 25% of paddy and 20% of wheat sold at MSP in 2018-19. Punjab 95% of paddy growers benefited vs Uttar Pradesh 3.6% in 2021 (Wikipedia, MSP) | MSP is a floor that most farmers cannot reach. Pulses and oilseeds are the documented losers. For our five crops, onion and tomato have no MSP at all. |
| PM-AASHA | Includes a price-deficiency payment mechanism compensating farmers who sold below MSP | Launched 2018 (Wikipedia, MSP) | Requires proof of the price a farmer actually got. Our transaction records are exactly that proof. This is an integration opportunity, not a competitor. |
| e-NWR / WDRA | Electronic negotiable warehouse receipts enabling pledge finance against stored produce | Regulator exists; registered warehouses issue e-NWRs [VERIFY current registered warehouse count and outstanding pledge value from wdra.gov.in] | The rail exists and is underused because nobody built the farmer-facing journey. This is our biggest arbitrage: use existing regulated infrastructure that other teams will not even know about. |
| ONDC / Beckn | Open network protocol unbundling buyer app, seller app, logistics and payments; agri activated June 2022 with NABARD | ~4,000 FPOs listed up to 3,100 value-added products since April 2023; nearly 5,000 of 8,000 registered FPOs onboarded (Wikipedia, ONDC). Referral commission capped at 3% vs ~30% on large platforms | Skewed to value-added and packaged products, not bulk raw produce with grade variance. Bulk commodity trade needs grading, lotting and assaying that the retail catalogue model does not express. We can be a Beckn-compliant BPP for bulk agri - standing on the network instead of competing with it. |
| AgriStack / farmer registry | Unique farmer ID and land-linked registry | [VERIFY Maharashtra farmer-registry enrolment numbers from the state agri department] | Identity layer we consume rather than rebuild. Reduces our KYC burden and is a strong "we integrate with government DPI" talking point. |
| Bhashini | Government language stack: 300+ pretrained models via Open Bhashini APIs, ASR/TTS/translation | Launched July 2022, MeitY. Used by ONDC's Saarthi multilingual buyer app (Wikipedia, Bhashini) | Available and underused in agri. Marathi voice via Bhashini is a free credibility win and a "we build on Indian DPI" point. |


## 3.2 The literature: what researchers have already proven


This section exists so you can say "the research says X, so we did Y" instead of "we thought Y would be nice". Every one of these was retrieved from arXiv during research for this playbook. Read at least the four starred ones.


| Paper | ID | Finding that changes our design |
|---|---|---|
| * An Interpretable Produce Price Forecasting System for Small and Marginal Farmers in India (Ma, Nowocin, Marathe, Chen; ICTD 2019) | 1812.05173 | Scrapes Agmarknet across 1,000+ markets, finds the data "extremely sparse", uses collaborative filtering to impute, then tree ensembles. Crucially they build interpretability by treating tree ensembles as adaptive nearest neighbours - the system shows the farmer which historical price records drove the forecast, and derives uncertainty intervals from them. LESSON: imputation is mandatory, and interpretability via nearest-neighbour precedent is the right explanation format for a farmer. |
| * A Framework for Crop Price Forecasting in Emerging Economies by Analyzing the Quality of Time-series Data (Jain, Marvaniya, Godbole, Munigala - IBM Research) | 2009.04171 | Uses prices plus ARRIVAL VOLUMES plus weather plus statistically derived data-quality features, with context-based model selection and retraining keyed to model stability and price trend. Evaluated on tomato and maize across 14 Indian markets. LESSON: arrival volume is a first-class feature, and you should select models per market-commodity regime rather than training one global model. |
| * An innovative Deep Learning Based Approach for Accurate Agricultural Crop Price Prediction (Bhardwaj et al., IISc) | 2304.09761 | Graph neural network plus CNN to capture GEOSPATIAL dependencies between markets, using price history, climate, soil type and location. Horizon up to 30 days on potato and tomato, reporting at least 20% improvement over prior results. LESSON: markets are a graph, not independent series. Neighbouring-mandi prices carry signal. This directly justifies our multi-mandi graph model. |
| * Toward Reducing Crop Spoilage and Increasing Small Farmer Profits in India: a Simultaneous Hardware and Software Solution | 1710.10515 | Combines solar-powered cold storage with price forecasting, piloted in Karnataka and Odisha. LESSON: the storage-plus-forecast combination is a validated research direction, not our invention. Cite it as precedent for the sale-window engine, and note that we add the missing third leg - credit. |
| Favorit: farmers volatility risk treatment | 2203.12395 | A decade of market-level price series and variability used to pick optimal selling timing for tomato, onion and coriander specifically in MAHARASHTRA. LESSON: closest published precedent to our sale-window engine, in our exact state and crops. Read it and beat it. |
| Mitigating Financial Risk from Climate-Induced Agricultural Price Volatility (Das et al.) | 2503.24324 | EGARCH for conditional volatility, SARIMAX with meteorological regressors, Black-Scholes to price put-option crop insurance, using CMIP6 climate projections. Covers soybean, rice, wheat, cotton, corn across Indian states. LESSON: model volatility explicitly, not just the mean. Volatility is what determines whether waiting is a good bet, and it gives us a defensible risk-flag feature. |
| A Benchmark of Classical and Deep Learning Models for Agricultural Commodity Price Forecasting (AgriPriceBD) | 2604.06227 | Benchmarks naive persistence, SARIMA, Prophet, BiLSTM, Transformer, Time2Vec-Transformer and Informer with Diebold-Mariano tests. Findings: simple persistence WINS on random-walk-like series; Time2Vec gave no significant gain and hurt one commodity badly; Prophet's smooth decomposition clashed with step-like price moves; Informer was unstable on small data. LESSON - THE MOST IMPORTANT ONE IN THIS TABLE: do not lead with a big transformer. Beat persistence first, prove it with a significance test, and only add complexity where it earns its place. |
| Creating an Optimal Portfolio of Crops Using Price Forecasting to Increase ROI for Indian Farmers | 2211.01951 | Price forecasting feeding portfolio optimisation so farmers choose crops on data rather than local tradition. LESSON: a natural v2 feature - sowing-time crop-mix advice. Mention as roadmap, do not build now. |
| A Hybrid Machine Learning Framework for Optimizing Crop Selection via Agronomic and Economic Forecasting | 2507.08832 | Random Forest for agronomic suitability plus LSTM for prices, with a KANNADA voice interface on fine-tuned ASR and TTS. LESSON: voice-first vernacular is an established design pattern in this literature. Our Marathi voice interface is aligned with precedent, and we should cite that. |
| Building AI-based advisory services for smallholder farmers: technical learnings from the AIEP Initiative | 2601.11537 | Five deployed MVPs in Kenya and Bihar with an 800-farmer study. Architecture: IVR/WhatsApp/app front end using ASR-MT-TTS, LLM reasoning layer doing query orchestration plus external weather/soil/MARKET lookups, RAG over agri corpora. Contributes golden Q&A evaluation sets. LESSON: the IVR + WhatsApp + LLM-orchestration pattern is field-validated at scale. Copy the architecture shape and cite it. |
| Benchmarking Automatic Speech Recognition for Indian Languages in Agricultural Contexts | 2602.03868 | 10,934 recordings in Hindi, Telugu and Odia across up to 10 ASR models, with a domain-weighted error metric (AWWER) and diarisation with best-speaker selection. LESSON: generic WER is the wrong metric for agri voice - errors on crop names and numbers matter far more than on filler words. Adopt a domain-weighted metric for our Marathi ASR. |
| Agribot: agriculture-specific question answer system | 2509.21535 | Sentence-embedding model trained on Kisan Call Centre data; synonym elimination and entity extraction raised accuracy from 56% to 86%. LESSON: KCC transcripts are a real, usable Indian agri corpus, and normalising entities and synonyms is where the accuracy is. |
| Comparative Analysis of Multi-Agent RL Policies for Crop Planning Decision Support | 2412.02057 | Independent Q-learning vs agent-by-agent sequential optimisation vs multi-agent rollout, scored on total farmer income, FAIRNESS and runtime. LESSON: fairness as an explicit objective alongside income - directly relevant to our FPO split ledger. |
| Copula Conformal Prediction for Multi-step Time Series Forecasting (ICLR 2024) | 2212.03281 | Models temporal dependency across the forecast horizon with a copula, giving finite-sample-valid multi-step intervals. LESSON: this is how we produce honest 14-day price bands instead of fake point forecasts. See also Conformal PID Control (2307.16895) and Adaptive Conformal Predictions for Time Series (2202.07282), which handle distribution shift online. |
| Conformal Prediction for Time-series Forecasting with Change Points | 2509.02844 | Pairs a latent state predictor with online conformal prediction to handle abrupt regime shifts. LESSON: export bans and policy shocks ARE change points. This is the technique that keeps our intervals honest through an onion export ban. |
| Foundation models for time series forecasting: application in conformal prediction | 2507.08858 | Benchmarks zero-shot time-series foundation models against statistical and gradient-boosting baselines inside a split-conformal setup. LESSON: a zero-shot foundation model can cover the cold-start problem for a mandi-commodity pair with almost no history. Strong demo talking point. |
| A causal analysis of TSFM behaviour (in the TSFM search results) | see 3.2 note | Testing Chronos-2 and TimesFM-2.5 on six synthetic pattern types found safe use only for trend and harmonic oscillation, a shared bias toward overestimating persistence, and outright failure on REGIME SWITCHES. LESSON: do not trust a foundation model through a policy shock. Gate it. This is a sophisticated point that will impress a technical judge. |
| Cross-silo / hierarchical federated learning for agriculture | 2104.07468, 2510.12727 | Cross-silo FL over decentralised supply-chain data for yield prediction; hierarchical FL with farm, crop-cluster and global layers. LESSON: FPOs are natural federated silos. A credible privacy story for v2 without shipping raw farmer data centrally. |


## 3.3 Private sector: who is already doing what


Be honest and specific here. Naming competitors accurately signals maturity; pretending you have no competition signals the opposite.


| Player type | Examples | What they do well | Structural gap |
|---|---|---|---|
| B2B produce marketplaces | Ninjacart, WayCool, Vegrow and similar | Real logistics, real buyers, real volume in fruit and vegetables | They are buyers, not neutral infrastructure. Their margin comes from the spread they are asked to shrink. A farmer cannot verify they got a fair price from a counterparty who sets it. |
| Input + advisory apps | DeHaat, AgroStar, BigHaat | Deep last-mile trust via input retail, agronomy advice | Advisory-first, marketing second. Price realisation is not the core loop, and the input-sale relationship creates the same conflict of interest as the commission agent. |
| Farm data / satellite | SatSure, CropIn, Fasal | Excellent remote sensing, yield and acreage estimation | Sell to lenders, insurers and enterprises. The farmer is the data subject, not the customer. |
| Agri fintech | Samunnati, Jai Kisan, Arya.ag | Real warehouse-receipt finance and FPO lending - Arya.ag in particular does storage plus finance | This is the closest to our thesis and you must acknowledge it. Difference: they are a financier with a platform. We are a public-interest market-intelligence layer with finance as one integration, state-scoped, government-aligned, and neutral on price. |
| Commodity exchanges | NCDEX, MCX and their spot platforms | Genuine price discovery and futures curves | Built for institutional and large-trader participation. A 1.2-acre onion farmer is not the user. |


## 3.4 The gap, stated in one paragraph you should memorise


> **THE POSITIONING STATEMENT**  
> Everything that exists is either a price PUBLISHER without a decision layer (Agmarknet), a TRADING VENUE that still assumes the farmer comes to the mandi and mostly trades within it (eNAM), a BUYER pretending to be a platform (B2B marketplaces), or a LENDER with a platform attached (agri fintech). Nobody has built the neutral layer that combines a forecast the farmer can act on, the credit that lets them act on it, the aggregation that gives them bargaining power, the grading that makes their lot tradable at distance, and the settlement guarantee that makes a distant price credible - and then MEASURES whether the farmer actually earned more. That combination is the product. Not one of those five pieces is novel alone. The loop is the invention.


### Say this when a judge says "eNAM already exists"


"eNAM is a venue. We are a decision layer, and we integrate with eNAM rather than replacing it. eNAM answers: how do I trade in this mandi electronically. We answer three questions eNAM does not: should I sell today or in 12 days, how do I get cash if I choose to wait, and which of these buyers will actually pay me. By eNAM's own documentation the trade on it is mostly intra-market, so a farmer in Yavatmal still cannot reach a better price in Nagpur. That is the gap we close, and where eNAM has an API we push our lots into it as an additional demand channel."



---

# 04. The Solution: Mandi-Setu


## 4.1 The one sentence


> **MANDI-SETU**  
> A Maharashtra-scoped market intelligence and transaction layer that tells a farmer WHEN to sell, FINANCES their ability to wait, AGGREGATES their lot for bargaining power, GRADES it so it can be sold at distance, GUARANTEES the payment, and then PROVES on a public ledger how many rupees per quintal the farmer actually gained.


"Setu" means bridge. The name says the product: a bridge between the farmer and the price that already exists somewhere in the market but is currently unreachable.


The reason to write the sentence this way is that it contains a verb the competition will not have: FINANCES. Every other team will build the first clause. The second clause is the moat.


## 4.2 The five pillars


| # | Pillar | What it is | Which loss mechanism it kills | PS phrase satisfied |
|---|---|---|---|---|
| 1 | Price Intelligence Engine | Multi-horizon (1/3/7/14/30-day) price forecasts per mandi-commodity pair with calibrated uncertainty bands, arrival-volume forecasts, and a plain-Marathi explanation of the drivers | M1 information asymmetry | "localised price trends", "expected prices", "aggregates mandi prices ... arrival volumes" |
| 2 | Sale Window Engine + Pledge Credit | Converts the forecast into a HOLD/SELL decision that nets out storage cost, spoilage risk, finance cost and the farmer's own cash need; when it says HOLD, it simultaneously offers an e-NWR-backed advance so the farmer gets cash today | M2 liquidity coercion, M4 physical loss | "sale window recommendations", "storage options", "reduced post harvest loss" |
| 3 | Lot, Grade and Aggregation Layer | Digital lot creation, phone-camera plus rule-based grading against declared buyer specs, FPO pooling with a grade-weighted fair-split ledger | M3 fragmentation, M4 physical loss | "enable lot creation, quality grading", "stronger FPO level aggregation", "quality requirements" |
| 4 | Verified Buyer Marketplace + Settlement | Tiered buyer verification, a payment-reliability score from settled on-platform trades, digital offers and counter-offers, logistics matching, escrow/assured payment, and structured dispute resolution | M5 counterparty risk | "matches farmers/FPOs with verified buyers", "digital offers, logistics coordination and payment tracking", "dispute or grievance handling" |
| 5 | Realisation Ledger | A per-transaction record of what the farmer received versus the counterfactual baseline (same-day default-mandi modal price), aggregated into a public district-level dashboard of rupees gained | THE PROOF LAYER - makes every other pillar accountable | "improved price realisation for farmers", "transparent transaction records" |


Pillar 5 is the one nobody else will build, and it is the one that most directly answers the problem statement's stated outcome. An expected outcome that reads "improved price realisation for farmers" is an invitation to measure it. Most teams will treat it as an aspiration. Treat it as a metric with a number next to it and you separate yourself in the first two minutes.


## 4.3 The wedge: what we build first and why


You cannot build five pillars in 36 hours, and you should not claim to. Pick a wedge that is (a) fully demonstrable, (b) contains the non-obvious insight, and (c) has an honest roadmap to the rest.


> **THE WEDGE**  
> ONION, in the Nashik-Ahmednagar-Pune belt, with Lasalgaon as the anchor mandi. Full depth on Pillars 1, 2 and 5 - forecast, hold-or-sell with pledge finance, and the realisation ledger. Working but shallower demos of Pillars 3 and 4 - lot creation, grading, buyer offers, escrow state machine. Then a credible expansion plan: soybean, cotton, tomato, tur.


### Why onion is the correct wedge - have these six reasons ready


1. Highest volatility of any major Indian commodity, which means the sale-window decision has the largest rupee consequence. Where volatility is low, timing advice is worth little; where it is extreme, timing advice is worth more than any other feature.
2. Storable for weeks to months in a well-ventilated chawl, unlike tomato. This makes HOLD a physically real option, which is a precondition for the pledge-credit loop to mean anything.
3. Lasalgaon is Asia's largest onion market and is in Maharashtra. The geography of the problem statement and the geography of the crop coincide exactly.
4. Onion has no MSP, so there is no government floor. The entire price outcome is determined by market timing and market access - precisely the variables we control. On a crop with strong MSP procurement, our marginal contribution would be smaller.
5. Policy shocks are frequent and well documented: export bans, minimum export prices, stock limits. This lets us demonstrate the sophisticated part of our ML story - regime-change detection and honest widening of uncertainty bands instead of a confidently wrong forecast.
6. It is politically legible. Onion price distress in Nashik is a story every Maharashtra official knows. You are not explaining the problem to the judges, you are showing them a solution to a problem they already lose sleep over.


### Ordered expansion after onion


| Order | Crop | Why next | Extra capability required |
|---|---|---|---|
| 2 | Soybean | Largest kharif crop by area in Maharashtra, well-behaved storable commodity, strong processor demand for crushing | MSP interaction, moisture-based grading, NCDEX futures curve as a forecast feature |
| 3 | Cotton | Vidarbha, the highest-distress region; the crop most associated with the outcome we are trying to prevent | CCI procurement integration, staple-length and micronaire grading, ginning-mill demand |
| 4 | Tomato | Extreme volatility, high visibility, tests the hard case | Perishability model - HOLD is mostly unavailable, so the engine must pivot to spatial arbitrage and processor routing instead of temporal arbitrage |
| 5 | Tur / arhar | Pulses are the documented MSP losers, so information value is high | Pulses procurement rules, NAFED integration |


## 4.4 What makes this unique - the four defensible claims


When a judge asks "how is this different", do not answer with features. Answer with these four, in this order.


**1. The credit-coupled recommendation** — No other agri price platform bundles a HOLD advisory with the working capital that makes HOLD possible. We treat advice without liquidity as a defect, not a product. This is the single strongest differentiator and it should be the first thing you say.

**2. The Realisation Ledger** — We are the only team that will measure, per transaction, the rupees the farmer gained against an explicit counterfactual baseline, and publish it. It converts our claim from a promise into an audited number and it gives the state a policy instrument it does not currently have.

**3. Honest uncertainty** — We ship calibrated prediction intervals via conformal prediction with change-point handling, not point forecasts. When we do not know, we say so and widen the band. A confidently wrong forecast that persuades a farmer to hold through a crash is a harm, and we are the team that designed against that harm rather than ignoring it.

**4. Grade-differentiated routing** — Quality is a routing key, not a pass/fail gate. Every kilogram is sent to its highest-value buyer tier - fresh retail, wholesale, processor, dehydration - so the produce that other platforms record as loss becomes revenue.


> **THE ETHICAL POSITION - SAY THIS OUT LOUD IN THE PITCH**  
> Our recommendations move real money for people with no margin for error. So we built three guardrails into the product itself: (1) we never recommend HOLD without a cash alternative; (2) we never show a point forecast without its uncertainty band; (3) we compute and display, for every recommendation, the worst-case outcome as well as the expected one. A farmer who follows our advice and loses must have known the downside before they chose it. A team that says this signals it understands the stakes of the problem statement, not just its requirements.


## 4.5 The complete feature map against the problem statement


Print this table. Put it on a slide. It is the single most persuasive artifact you can show a government evaluator because it proves you read their words rather than pattern-matched their theme.


| PS requirement (verbatim) | Our feature | Status at hackathon |
|---|---|---|
| aggregates mandi prices | Agmarknet + eNAM ingestion, normalised to a commodity-variety-market-grade schema | Live, historical + daily |
| buyer demand | Buyer demand-posting module: commodity, grade spec, quantity, window, indicative price | Working with seeded buyers |
| quality requirements | Structured spec per buyer per commodity; grading assay compared against spec | Working, 5 dimensions for onion |
| arrival volumes | Arrival series ingested and forecast alongside price; used as a feature and shown to the farmer | Live |
| transport options | Transporter registry with route, capacity, rate card; cost estimator per lot per destination | Working, seeded data |
| storage options | Warehouse registry with capacity, rate, distance, e-NWR capability flag | Working, seeded data |
| localised price trends | Per-mandi 30-day history plus multi-horizon forecast with bands, in Marathi, voice-readable | Live |
| sale window recommendations | Sale Window Engine: net-of-cost hold-vs-sell with expected gain, downside and confidence | Live - the centrepiece |
| matches farmers/FPOs with verified buyers | Matching on grade fit, price, distance, buyer reliability score and settlement capability | Live |
| enable lot creation | Lot object with provenance, quantity, grade assay, photos, farmer/FPO owner, QR code | Live |
| quality grading | Rule-based scoring on measured attributes + phone-camera CV assist + optional third-party assay | Working; CV as assist, not authority |
| digital offers | Offer/counter-offer state machine with expiry and audit trail | Live |
| logistics coordination | Truck matching and shared-load pooling across nearby lots | Working |
| payment tracking | Escrow state machine, UPI/RTGS references, days-to-pay tracked into the buyer reliability score | Working |
| dispute or grievance handling | Structured dispute flow with evidence attachment, tiered escalation, ODR hook, SLA clock | Working |
| improved price realisation | Realisation Ledger with counterfactual baseline, per farmer and per district | Live - and backtested |
| reduced information asymmetry | Public district dashboard: forecast accuracy, realised prices, buyer reliability - open to all, not just users | Live |
| lower transaction cost | Cost breakdown per transaction versus mandi-route baseline including commission, mandi fee, transport, waiting time | Live |
| stronger FPO aggregation | Pooling with grade-weighted fair-split ledger visible before consent | Live |
| reduced post-harvest loss | Grade-differentiated routing + storage recommendation + spoilage-risk model in the hold decision | Live |
| more reliable buyer sourcing | Buyer-side view: aggregated forward supply from committed lots, with grade distribution | Working |
| transparent transaction records | Append-only hash-chained transaction log, farmer-downloadable statement, exportable for PM-AASHA proof | Live |



---

# 05. System Architecture


## 5.1 Design principles, and the reasons behind them


**Offline-first on the farmer side** — Rural Maharashtra connectivity is intermittent. The farmer app must render the last-known forecast, allow lot creation and queue offer responses with no network, then sync. Judges notice this because most teams assume 4G in an auditorium.

**Voice-first, text-second** — Maharashtra female literacy is about 75 percent versus 89 percent male (Wikipedia, Maharashtra), and functional literacy for reading a price chart is lower still. Marathi voice is not an accessibility checkbox, it is the primary interface.

**Read-heavy, cache-hard** — Thousands of farmers read the same mandi-commodity forecast. Precompute nightly, serve from cache, and your API cost and latency both collapse. This also means the demo cannot fail on a slow model call.

**Every recommendation is auditable** — Store the model version, the feature vector, the interval and the decision for every recommendation served. When a farmer disputes advice or a judge asks "why did it say that", you can answer exactly. This is also your regulatory story.

**Integrate, do not rebuild** — Consume Agmarknet, eNAM, e-NWR, UPI, Bhashini, AgriStack and ONDC/Beckn rather than reinventing them. Government judges reward alignment with public digital infrastructure and penalise parallel silos.

**Degrade gracefully, never confidently** — If the model is unavailable, show yesterday's forecast with its date. If a mandi has no history, say "insufficient data" instead of guessing. A blank honest state beats a filled dishonest one.


## 5.2 Service topology


```service-topology
                        FARMER SURFACES                         BUYER / FPO SURFACES
   +--------------------------------------------+   +----------------------------------+
   | Android app (Kotlin/Flutter, offline-first)|   | Web dashboard (Next.js)          |
   | IVR / voice bot (Marathi, Bhashini ASR/TTS)|   |  - post demand + grade spec      |
   | WhatsApp bot (Cloud API templates)         |   |  - browse lots, make offers      |
   | SMS fallback (price + window, 160 chars)   |   |  - forward supply view           |
   +--------------------------------------------+   +----------------------------------+
                        |                                          |
                        +--------------------+---------------------+
                                             v
                             +-------------------------------+
                             |  API GATEWAY (FastAPI)        |
                             |  authn/z, rate limit, i18n,   |
                             |  audit log, request tracing   |
                             +-------------------------------+
                                             |
   +-----------+-----------+-----------+-----+-----+-----------+-----------+----------+
   v           v           v           v           v           v           v          v
+--------+ +--------+ +---------+ +---------+ +---------+ +---------+ +--------+ +---------+
|price-  | |window- | |lot &    | |match-   | |settle-  | |logi-    | |credit- | |ledger-  |
|svc     | |svc     | |grade-svc| |ing-svc  | |ment-svc | |stics-svc| |svc     | |svc      |
|        | |        | |         | |         | |         | |         | |        | |         |
|forecast| |hold vs | |lot CRUD | |lot<->   | |escrow   | |truck    | |e-NWR   | |realisa- |
|serving,| |sell,   | |grading  | |demand   | |state    | |match,   | |pledge, | |tion vs  |
|bands,  | |net-cost| |assay,   | |scoring, | |machine, | |shared   | |lender  | |counter- |
|drivers | |arith-  | |FPO pool | |ranking  | |UPI/RTGS,| |load,    | |API,    | |factual, |
|        | |metic   | |split    | |         | |disputes | |cost est | |repay   | |dashboard|
+--------+ +--------+ +---------+ +---------+ +---------+ +---------+ +--------+ +---------+
      |          |          |           |          |           |          |         |
      +----------+----------+-----------+----+-----+-----------+----------+---------+
                                             v
      +---------------------------+  +---------------------+  +---------------------+
      | PostgreSQL + TimescaleDB  |  | Redis               |  | Object store (S3)   |
      | prices, arrivals, lots,   |  | forecast cache,     |  | lot photos, assay   |
      | offers, txns, ledger,     |  | session, rate limit,|  | images, model        |
      | audit (append-only)       |  | job queue           |  | artifacts, exports  |
      +---------------------------+  +---------------------+  +---------------------+
                                             ^
                                             |
      +----------------------------------------------------------------------+
      |  DATA + ML PLANE (Airflow/Prefect DAGs, nightly + intraday)          |
      |  ingest Agmarknet/eNAM/IMD/satellite -> validate -> impute ->        |
      |  feature store -> train/backtest -> conformal calibrate ->           |
      |  register model -> publish forecasts to cache + DB                   |
      +----------------------------------------------------------------------+
                                             ^
      +----------------------------------------------------------------------+
      |  EXTERNAL: Agmarknet | eNAM | data.gov.in | IMD | Sentinel-2/Copernicus
      |  Bhashini ASR/TTS/MT | UPI PSP | e-NWR repositories | AgriStack | ONDC/Beckn
      +----------------------------------------------------------------------+

```


## 5.3 The two flows that matter


### Flow A: the hold-or-sell decision (the demo centrepiece)


```flow-hold-or-sell
 1. Farmer opens app / dials IVR. Identity resolved to farmer_id (AgriStack ID if present).
 2. Context loaded: crop=onion, qty=42 qtl, harvest_date, village -> geo, default mandi = Lasalgaon,
    stated cash need = Rs 40,000 by 12 Sep, storage available = chawl, 30 qtl capacity.
 3. price-svc returns for each candidate mandi within 120 km:
      - today modal price, today arrivals
      - forecast for h = 1,3,7,14,30 days with 80% and 95% conformal intervals
      - top drivers (arrival trend, seasonal index, neighbouring-mandi signal, rainfall anomaly, policy flag)
 4. window-svc computes for each (mandi, day) pair the NET expected realisation:
      net = E[price_h] * qty * (1 - spoilage(h, crop, storage_type))
            - storage_cost(h) - transport_cost(mandi) - mandi_fee - commission
            - finance_cost(h) if a pledge advance is taken
    and the downside at the 10th percentile of the predictive distribution.
 5. Cash-need constraint checked. If need_by < recommended_sell_date:
      credit-svc quotes an e-NWR pledge advance: eligible warehouses, LTV, rate, tenor,
      net cash today, and the repayment deducted at sale.
 6. Recommendation object emitted and PERSISTED with model_version + feature_vector + intervals:
      action = HOLD_WITH_PLEDGE | HOLD | SELL_NOW | SELL_ELSEWHERE | ROUTE_TO_PROCESSOR
      expected_gain_per_qtl, downside_per_qtl, confidence, plain-Marathi reason, cash-today figure
 7. Delivered as: app card + Marathi TTS + SMS summary. Farmer accepts, defers or rejects.
    Every response is logged - this is the training signal for the recommender and the
    denominator of the Realisation Ledger.
 8. If HOLD_WITH_PLEDGE accepted -> deposit flow -> e-NWR issued -> advance disbursed ->
    lot auto-listed with a sell trigger at the target price band.

```


### Flow B: lot to settlement


```flow-lot-to-settlement
 1. Farmer (or FPO) creates a LOT: crop, variety, quantity, harvest date, photos, location,
    self-declared attributes. QR code minted.
 2. GRADING. Three tiers, and the tier is always displayed to the buyer:
      T1 self-declared + photo    -> lowest trust, widest price discount
      T2 CV assist + rule engine  -> size distribution, colour, visible defect ratio, moisture proxy
      T3 third-party / eNAM assay -> highest trust, best price, required above a value threshold
    Output: grade label (A/B/C/D) + attribute vector + confidence + tier badge.
 3. FPO POOLING (optional): member lots combine into a parent lot. The grade-weighted split is
    computed and shown to every member BEFORE they consent:
      share_i = (qty_i * grade_multiplier_i) / sum_j(qty_j * grade_multiplier_j)
    Consent is recorded. Nobody can dispute the formula afterwards because they approved it first.
 4. MATCHING. matching-svc scores each open buyer demand against the lot:
      score = w1*price_fit + w2*grade_fit + w3*(1/distance) + w4*buyer_reliability
            + w5*settlement_capability + w6*logistics_availability
    Weights are per-farmer preference-tuned; default favours reliability over headline price,
    because Mechanism 5 says a high price from an unreliable buyer is worth less.
 5. OFFERS. Buyer offers -> farmer counters -> accept/expire. Full audit trail. Marathi TTS
    of every offer so a low-literacy farmer is never disadvantaged in a negotiation.
 6. ESCROW. On acceptance the buyer funds escrow (or provides an assured-payment instrument).
    Escrow state machine: CREATED -> FUNDED -> IN_TRANSIT -> DELIVERED -> INSPECTED ->
    RELEASED | DISPUTED.
 7. LOGISTICS. logistics-svc matches a transporter, pools nearby lots onto one truck,
    and tracks the consignment against the lot QR.
 8. INSPECTION + RELEASE. Buyer inspects against the recorded assay. Match -> auto-release.
    Mismatch -> dispute with mandatory photo evidence, compared against the pre-shipment assay.
    Because grading happened BEFORE dispatch with photos and a timestamp, post-facto
    quality renegotiation - one of the commonest ways farmers lose money - becomes hard.
 9. SETTLEMENT. Escrow releases to the farmer's account. Pledge advance auto-repaid if any.
    days_to_pay recorded into the buyer reliability score.
10. LEDGER. ledger-svc computes realised_net vs counterfactual baseline and appends to the
    Realisation Ledger with a hash chain.

```


## 5.4 Technology choices, with the reason for each


| Layer | Choice | Why this and not the alternative |
|---|---|---|
| Farmer app | Flutter (or Kotlin + Jetpack Compose) | One codebase, good offline story via Drift/SQLite, small APK matters on low-end devices. Choose whichever your team is already fast in - hackathon velocity beats theoretical fit. |
| Buyer web | Next.js + TypeScript + Tailwind | Fast to build, server components keep the dashboard snappy, and it demos well on a projector. |
| API | Python FastAPI | Same language as the ML stack, so no model-serving boundary to cross under time pressure. Async handles IVR webhooks well. Auto OpenAPI docs are a free credibility artifact for judges. |
| Database | PostgreSQL + TimescaleDB | Price and arrival data are time series; hypertables and continuous aggregates give you 30-day rolling views for free. One database for both relational and time-series data means one thing to operate at 3 a.m. |
| Cache/queue | Redis | Forecast cache, rate limiting, and a lightweight job queue. Keeps the demo instant. |
| ML training | Python: pandas, scikit-learn, statsmodels, LightGBM, PyTorch, MAPIE/crepes for conformal | LightGBM is the workhorse - fast, strong on tabular time series, quantile objective built in. PyTorch only where a sequence model earns its place. |
| Orchestration | Prefect (or Airflow if the team knows it) | Nightly ingest, validate, impute, feature-build, forecast, publish. A visible DAG is also a strong artifact to show a judge. |
| Model registry | MLflow | Version, metrics, artifact per model. Lets you answer "which model produced this recommendation" instantly, which is the audit requirement from 5.1. |
| Voice | Bhashini Open APIs for Marathi ASR/TTS, with IndicWhisper/IndicTrans2 as an offline fallback | Bhashini is government DPI, free and a positioning win. Keep a local fallback so a network failure cannot kill your demo. |
| Messaging | WhatsApp Cloud API, Exotel/Twilio for IVR, an SMS gateway for fallback | Meets farmers on channels they already use. The AIEP paper (arXiv:2601.11537) validates exactly this IVR + WhatsApp pattern in Bihar. |
| Payments | UPI collect + escrow via a PSP; RTGS/NEFT for large lots | Do not build a wallet. Regulatory burden with no benefit. Use a partner PSP or an escrow-as-a-service provider. |
| Transaction integrity | Append-only Postgres table with a SHA-256 hash chain | Gives tamper-evidence and "transparent transaction records" without the operational cost of a blockchain. Say this explicitly - judges are tired of gratuitous blockchain, and choosing not to use it is a signal of engineering judgement. The literature supports the choice: blockchain-agri papers exist (see the traceability line in the reading list) but the cost is real and the benefit here is achievable with a hash chain plus periodic notarisation. |
| Deploy | Docker Compose for the hackathon; Kubernetes only if you already run it | Compose up in one command is worth more in a demo than any orchestration sophistication. Mention a K8s/state-cloud path (MeghRaj/NIC) for the production slide. |
| Observability | Prometheus + Grafana, structured JSON logs | A live Grafana panel showing forecast accuracy during the pitch is a disproportionately strong trust signal. |


## 5.5 Data model: the core tables


```schema
farmer(farmer_id PK, agristack_id, name, phone, village, taluka, district,
       lat, lon, land_ha, pref_lang, literacy_mode, default_mandi_id, risk_pref)
fpo(fpo_id PK, name, reg_no, district, member_count, storage_capacity_qtl, bank_acct)
fpo_member(fpo_id FK, farmer_id FK, joined_on, share_class)
market(market_id PK, apmc_name, district, lat, lon, enam_flag, agmarknet_code, market_type)
commodity(commodity_id PK, name, name_mr, variety, agmarknet_code, is_msp, storability_days)
price_obs(market_id, commodity_id, obs_date, min_p, max_p, modal_p, arrivals_qtl,
          source, ingested_at, quality_flag)          -- Timescale hypertable
weather_obs(grid_id, obs_date, rain_mm, tmax, tmin, rh, source)
forecast(forecast_id PK, market_id, commodity_id, run_date, horizon_days,
         p50, p10, p90, p05, p95, model_version, features_hash, calib_method)
recommendation(rec_id PK, farmer_id, lot_id, run_at, action, target_date, target_market_id,
               exp_gain_per_qtl, downside_per_qtl, confidence, reason_mr, reason_en,
               cash_today, model_version, features_json, farmer_response, responded_at)
lot(lot_id PK, owner_type, owner_id, parent_lot_id, commodity_id, variety, qty_qtl,
    harvest_date, location, status, qr_code, created_at)
grade_assay(assay_id PK, lot_id FK, tier, grade_label, attributes_json, confidence,
            assessor_type, assessor_id, photos, assayed_at)
pool_consent(parent_lot_id, member_lot_id, farmer_id, share_pct, consented_at, signature)
buyer(buyer_id PK, name, type, gstin, pan, apmc_licence, bank_verified, verif_tier,
      reliability_score, avg_days_to_pay, dispute_rate, renegotiation_rate)
demand(demand_id PK, buyer_id FK, commodity_id, grade_spec_json, qty_qtl,
       window_start, window_end, indicative_price, delivery_terms, status)
offer(offer_id PK, lot_id, demand_id, buyer_id, price_per_qtl, qty_qtl, terms_json,
      status, parent_offer_id, created_at, expires_at)
transaction(txn_id PK, lot_id, offer_id, buyer_id, seller_type, seller_id, agreed_price,
            qty_qtl, gross_amt, deductions_json, net_amt, escrow_state,
            funded_at, delivered_at, released_at, days_to_pay)
warehouse(wh_id PK, name, operator, district, lat, lon, capacity_qtl, rate_per_qtl_month,
          wdra_registered, enwr_capable, commodities_json)
enwr(receipt_id PK, lot_id, wh_id, issued_at, qty_qtl, valuation, repository, status)
pledge(pledge_id PK, receipt_id FK, lender_id, principal, rate_pa, tenor_days,
       disbursed_at, outstanding, repaid_at, status)
dispute(dispute_id PK, txn_id FK, raised_by, category, claim_json, evidence,
        stage, sla_due, resolution, resolved_at)
realisation_ledger(entry_id PK, txn_id FK, farmer_id, commodity_id,
                   realised_net_per_qtl, baseline_per_qtl, baseline_method,
                   gain_per_qtl, gain_total, rec_id, followed_rec BOOL,
                   prev_hash, entry_hash, created_at)   -- append-only
audit_log(log_id PK, actor_type, actor_id, action, entity, entity_id,
          payload_json, at, prev_hash, entry_hash)      -- append-only

```


Two details worth pointing out to a technical judge. First, `recommendation` stores `features_json` and `model_version`, which means any advice can be reproduced exactly - that is the auditability principle made concrete. Second, `realisation_ledger` stores `baseline_method` alongside the baseline, so when someone challenges the counterfactual you can show which method was used and recompute under an alternative. That is the difference between a metric and a marketing number.



---

# 06. The Machine Learning System


This is where a hackathon is won or lost on technical credibility. The trap is to reach for the most impressive model. The winning move is to show a disciplined progression from a baseline you beat, with honest evaluation and calibrated uncertainty. The AgriPriceBD benchmark (arXiv:2604.06227) found that naive persistence beat SARIMA, Prophet, BiLSTM and Informer on random-walk-like commodity series, and that a Time2Vec transformer gave no significant gain. If a judge knows that literature and you have led with a transformer, you lose the room. If you lead with "we beat persistence by X with a Diebold-Mariano p-value of Y", you own it.


## 6.1 The model inventory


| # | Model | Target | Approach | Key inputs | Evaluation |
|---|---|---|---|---|---|
| M0 | Persistence baseline | price at h days | last observed modal price, carried forward | price history only | MASE, RMSE - this is the number every other model must beat |
| M1 | Seasonal-naive + drift baseline | price at h days | same day-of-year last year, scaled by recent level | price history | MASE |
| M2 | Price forecaster (primary) | p10/p50/p90 price per mandi-commodity at h=1,3,7,14,30 | LightGBM with quantile (pinball) objective, one model per horizon, per commodity, with market embedding | lags 1-30, rolling mean/std/min/max, arrival lags and rolling, day-of-year Fourier terms, neighbouring-mandi price lags, rainfall anomaly, festival/holiday flags, policy-shock flags, MSP flag, sowing-window index | Rolling-origin backtest, pinball loss, MASE vs M0, Diebold-Mariano vs M0, interval coverage |
| M3 | Spatial price model | price at h, using the market graph | GNN over a mandi adjacency graph (distance + trade-flow weighted) with temporal convolution | all of M2 plus neighbour node features | Same as M2. Justified by arXiv:2304.09761 which reports >=20% gains from geospatial dependency modelling |
| M4 | Volatility model | conditional variance of returns | EGARCH on log returns; SARIMAX with weather regressors as the mean model | price returns, rainfall, temperature | Log-likelihood, out-of-sample variance forecast accuracy. Justified by arXiv:2503.24324 |
| M5 | Conformal calibrator | valid prediction intervals | Split conformal + CopulaCPTS for multi-horizon dependency + Adaptive CI for drift + change-point-aware widening | M2/M3 residuals on a held-out calibration set | Empirical coverage vs nominal, interval width, Winkler score. arXiv:2212.03281, 2202.07282, 2509.02844 |
| M6 | Change-point / regime detector | regime label + shock flag | Online BOCPD on price and arrival series, plus a rules layer on policy events (export ban, MEP, stock limit) | prices, arrivals, a curated policy-event calendar | Detection delay, false-positive rate. Drives interval widening and model gating |
| M7 | Arrival volume forecaster | arrivals at h | LightGBM, same shape as M2 | arrival lags, sowing-date estimates, area under crop, weather, harvest calendar, satellite NDVI | MASE. Feeds M2 as a feature and is displayed to the farmer - "heavy arrivals expected Tuesday, prices usually dip" |
| M8 | Spoilage / shelf-life model | expected % loss at h days | Gradient boosting or a calibrated agronomic curve per crop and storage type | crop, variety, storage type, ambient temp/RH forecast, days since harvest, initial grade | Absolute error on measured loss where available; otherwise a documented agronomic curve with the source cited |
| M9 | Quality grader | grade label + attribute vector | CNN (EfficientNet/MobileNet, on-device quantised) for size/colour/defect, plus a rule engine on measured attributes | lot photos under a standardised capture protocol, measured moisture/size | Per-attribute accuracy, confusion against third-party assay, and an abstention rate - the model must be allowed to say "cannot grade, get an assay" |
| M10 | Buyer reliability score | probability of on-time full payment | Logistic regression or gradient boosting; deliberately interpretable | settled txn history, days-to-pay distribution, dispute rate, renegotiation rate, verification tier, tenure | AUC, calibration curve. MUST be interpretable - a buyer denied access will demand a reason |
| M11 | Match ranker | probability a match converts and settles cleanly | Learning-to-rank (LambdaMART) once data exists; a weighted score before that | lot features, demand features, distance, price gap, buyer score | NDCG, conversion rate, settlement-success rate |
| M12 | Sale-window optimiser | optimal action and date | Not a learned model - explicit expected-utility arithmetic over M2/M4/M5/M8 outputs under the farmer cash constraint | forecast distribution, costs, cash need, risk preference | Backtested realisation vs sell-on-harvest baseline. THIS is the number in your pitch |
| M13 | Marathi voice | ASR + TTS | Bhashini APIs primary; fine-tuned IndicWhisper as offline fallback | farmer speech, agri lexicon | Domain-weighted WER on crop names and numbers, per arXiv:2602.03868 - not plain WER |
| M14 | Zero-shot cold-start forecaster | price at h for a mandi-commodity pair with little history | Time-series foundation model (Chronos/TimesFM) zero-shot, GATED by M6 | short price history | Compared against M0 on sparse pairs only. Gated off during detected regime shifts because TSFMs fail on regime switches |


## 6.2 M12 in full: the sale-window optimiser


This is the single most important piece of logic in the product, and it is arithmetic, not machine learning. Say that clearly - it shows judgement. The ML produces a distribution; the decision is an explicit, auditable expected-utility calculation over that distribution.


```sale-window-optimiser
INPUTS
  q        quantity in quintals
  F(h,m)   predictive distribution of price at horizon h in market m  (from M2/M3 + M5)
  s(h)     expected fractional spoilage at h        (from M8)
  C_st(h)  storage cost for h days                  (warehouse registry)
  C_tr(m)  transport cost to market m               (logistics-svc)
  C_mk(m)  mandi fee + commission at market m       (APMC schedule)
  C_fi(h)  finance cost of a pledge advance over h days
  need     cash the farmer needs, and need_by date
  rho      farmer risk preference in [0,1]  (0 = maximise expected value, 1 = maximise worst case)

FOR each candidate (h, m):
  gross_p50 = quantile(F(h,m), 0.50) * q * (1 - s(h))
  gross_p10 = quantile(F(h,m), 0.10) * q * (1 - s(h))       # the honest downside
  cost      = C_st(h) + C_tr(m) + C_mk(m) + (C_fi(h) if advance_needed else 0)
  net_p50   = gross_p50 - cost
  net_p10   = gross_p10 - cost
  utility   = (1 - rho) * net_p50 + rho * net_p10           # explicit risk aversion

BASELINE  net_now = quantile(F(0, m_default), 0.50) * q - C_tr(m_default) - C_mk(m_default)

CASH CONSTRAINT
  if need > 0 and need_by < today + h:
      advance = credit_svc.quote(lot_value = gross_p50, tenor = h)
      if advance.net_cash_today >= need:  advance_needed = True
      else: this (h,m) is INFEASIBLE unless partial sale covers the need
         -> evaluate SPLIT: sell x qtl now to cover need, hold (q - x)

DECIDE
  best = argmax(utility) over feasible (h, m) and split options
  if utility(best) - net_now < threshold(q):   action = SELL_NOW
      # threshold scales with lot size so we never advise a 60 km trip for Rs 200
  elif best.h == 0 and best.m != m_default:    action = SELL_ELSEWHERE
  elif best.advance_needed:                    action = HOLD_WITH_PLEDGE
  elif grade is low and processor_price > fresh_net: action = ROUTE_TO_PROCESSOR
  else:                                        action = HOLD

EMIT (and persist, with model_version + feature vector)
  action, target_date, target_market, expected_gain_per_qtl = (utility(best)-net_now)/q,
  downside_per_qtl = (net_p10(best)-net_now)/q, confidence = coverage-calibrated band width,
  cash_today, plain-Marathi reason string, and the full comparison table for transparency

```


> **THE THREE DETAILS THAT WILL IMPRESS A JUDGE**  
> (1) rho - we ask the farmer whether they want the best average outcome or the safest one, and the maths changes. Most systems impose a risk preference silently. (2) The SPLIT option - selling part of the lot to cover an immediate cash need while holding the rest is what a smart farmer already does informally; we make it computable. (3) threshold(q) - we refuse to give advice whose expected gain is smaller than the hassle, which means the system sometimes says "just sell here, it is not worth the trip". A system willing to say that is a system a farmer will trust.


## 6.3 Feature engineering: the full list


| Group | Features | Source |
|---|---|---|
| Price history | modal/min/max lags 1-30 days; rolling mean, std, min, max, median over 7/14/30/60; log returns; spread (max-min)/modal as a liquidity proxy; days since last observation (sparsity signal) | Agmarknet, eNAM |
| Arrival | arrival lags 1-30; rolling sums; arrival z-score vs same week last 3 years; arrival-to-price elasticity estimate | Agmarknet |
| Seasonality | day-of-year sin/cos Fourier terms (3 harmonics); week-of-year; month; harvest-window flag per crop; festival calendar (Diwali, Ganeshotsav) which shifts vegetable demand | Derived + calendar |
| Spatial | price lags of the k nearest mandis; distance-weighted neighbour mean; price of the terminal market (Vashi/Mumbai APMC); inter-mandi spread | Agmarknet + geo |
| Weather | rainfall last 7/14/30 days and anomaly vs normal; tmax/tmin; heat-stress days; excess-rain flag; forecast rainfall for the next 7 days | IMD, ERA5, open-meteo |
| Remote sensing | NDVI/EVI over the sourcing catchment; crop-area estimate; anomaly vs previous year | Sentinel-2 via Copernicus, MODIS, Bhuvan |
| Policy | export-ban flag; minimum export price level; stock-limit flag; MSP level and change; procurement-active flag | Curated event calendar - build this by hand, it is high value and nobody else will |
| Macro | diesel price (transport cost driver); wholesale price index for food; onion-specific import/export volumes | data.gov.in, DGCIS |
| Data quality | share of missing days in the last 30; imputation flag; source-reliability weight | Derived - per arXiv:2009.04171, quality features are predictive in their own right |


> **THE IMPUTATION PROBLEM - DO NOT SKIP THIS**  
> The interpretable-forecasting paper (arXiv:1812.05173) found Agmarknet data across 1,000+ markets to be "extremely sparse" and used collaborative filtering to fill gaps before modelling. Expect the same. A mandi may report on 11 of 30 days. Your pipeline needs an explicit imputation stage - matrix factorisation across the market x commodity x date tensor, or a neighbour-weighted fill - and it must flag imputed values so the model can learn to distrust them. Teams that ignore this get models that look fine in a notebook and collapse on real data.


## 6.4 Evaluation protocol


Write this protocol down before you train anything and follow it. It is also a slide.


1. Split by TIME, never randomly. Train on data up to T, calibrate on (T, T+c], test on (T+c, end]. Random splits leak the future and inflate every metric.
2. Rolling-origin backtest: refit at monthly origins and evaluate each horizon separately. A model good at h=1 and useless at h=14 is useless for our product, since the sale window is a 7-30 day decision.
3. Report MASE against the persistence baseline M0. If MASE >= 1 the model is worse than doing nothing and must not ship.
4. Run a Diebold-Mariano test against M0 and report the p-value. This is the single line that separates you from teams reporting an unqualified "95% accuracy".
5. For intervals, report EMPIRICAL COVERAGE at the nominal 80% and 95% levels plus mean interval width and Winkler score. A 95% interval that covers 71% of outcomes is a lie that could cost a farmer money.
6. Evaluate separately in high-volatility and shock regimes. Aggregate metrics hide exactly the cases where advice is most consequential.
7. Evaluate per commodity and per mandi, not pooled. Pooled metrics let a good Lasalgaon model hide a broken Yavatmal one.
8. For M12, the metric is not forecast error at all - it is BACKTESTED REALISATION: rupees per quintal versus a sell-on-harvest-day baseline, net of all costs. That is the number the pitch turns on.


### Anti-metrics: never say these


- "Our model is 95% accurate." Accuracy is undefined for regression. A judge who knows this stops listening.
- MAPE alone on prices. It is asymmetric, punishes under-forecasts unequally, and explodes near low prices.
- R-squared on a time series. Persistence gets a high R-squared on a random walk while being informationally empty.
- Any metric without a baseline. "RMSE 84" means nothing unless you say what persistence scored.


## 6.5 Known failure modes and the mitigation for each


| Failure mode | Why it happens | Mitigation we ship |
|---|---|---|
| Confident forecast through a policy shock | Models extrapolate from history; an export ban has no precedent in the recent window. The TSFM causal analysis found foundation models fail outright on regime switches and are biased toward over-persisting trends | M6 change-point detector gates the model; intervals widen; the UI switches to "market disrupted, advice suspended" rather than showing a number |
| Sparse mandi with no signal | Small mandis report irregularly | Explicit minimum-history rule. Below threshold, fall back to a neighbour-mandi model or M14 zero-shot, and label the forecast as low-confidence in the UI |
| Self-fulfilling advice / herd effect | If 5,000 farmers all hold and then all sell on day 14, we create the crash we predicted | Stagger recommendations across a window; monitor the share of catchment supply under our advice; when it crosses a threshold, diversify recommended dates and disclose the crowding. This is a genuinely novel risk to raise unprompted - it shows systems thinking |
| Grading model discriminates against a region or variety | Training images skewed to one district or one variety | Stratified sampling by district and variety; report per-stratum accuracy; allow abstention; always let a third-party assay override the model |
| Buyer score becomes a barrier to entry | New buyers have no history and get a low score, so they never get matched, so they never build history | Explicit new-buyer cold-start tier with escrow-only trading, plus a reserved share of match slots for new verified buyers |
| Farmer follows advice and loses money | Sometimes the p10 outcome happens. This is unavoidable and must be planned for | Show downside before consent; record consent; publish overall hit rate honestly in the public dashboard; never hide a loss. Trust survives a bad outcome that was disclosed; it does not survive a hidden one |
| Model drift after deployment | Prices are non-stationary | Adaptive conformal intervals that self-widen when coverage degrades (arXiv:2202.07282); scheduled retraining plus drift-triggered retraining, per the context-based selection in arXiv:2009.04171 |



---

# 07. Data Sources: The Complete Catalogue


> **READ THE CONSTRAINT NOTE FIRST**  
> Network access to government portals was blocked from the environment in which this playbook was written, so the entries below are compiled from documented structure, the academic literature that uses these sources, and standard access patterns - not from a live connection check. Treat this chapter as a WEEK-1 TASK LIST: for every row, verify the endpoint, the current field schema, the licence and the rate limit, and record what you find in the tracking table in 7.7. Items marked [VERIFY] are the ones most likely to have changed.


## 7.1 Price and market data - the core layer


| Source | What you get | Access path | Notes and gotchas |
|---|---|---|---|
| Agmarknet (agmarknet.gov.in) | Daily min/max/modal price and arrival volume by market, commodity and variety across India; multi-year history | Web report interface with commodity/state/date parameters; scraping is the common route. The literature confirms this - arXiv:1812.05173 scraped 1,000+ markets | THE primary source. Expect sparsity and inconsistent variety naming. Build a canonical mapping table by hand for your five crops. Respect rate limits and cache aggressively. [VERIFY] whether a documented API now exists |
| data.gov.in | Agmarknet mirrors and many agri datasets as downloadable CSV/JSON with an API key | Register for an api.data.gov.in key; resource-based REST endpoints | Easiest legitimate programmatic path. Coverage and freshness vary by resource. [VERIFY] current resource IDs for daily mandi prices |
| eNAM (enam.gov.in) | Trade data from integrated mandis, assaying records, lot-level trade information | Portal; API access typically requires institutional arrangement | Maharashtra had 118 mandis integrated as of March 2021. Even portal-level data on trade volumes strengthens your gap analysis. [VERIFY] the current Maharashtra integration count |
| MSAMB (msamb.com) | Maharashtra APMC directory, market-committee details, state marketing schemes, some price reporting | State portal | Your authoritative list of Maharashtra mandis and the institutional map for the state-scope argument. MSAMB oversees roughly 295 APMCs. [VERIFY] |
| NCDEX / MCX | Futures and spot prices for agri commodities, warehouse receipt infrastructure | Public quote pages; historical data typically licensed | Futures curves are a genuinely predictive feature for storable crops - soybean and cotton especially. Even a delayed public curve helps |
| CACP / DES, Ministry of Agriculture | MSP series, cost-of-cultivation estimates (A2, FL, C2), crop-wise area and production | Published reports and datasets | Cost of cultivation is how you compute whether a realised price actually covers cost. Powerful for the impact chapter |
| Maharashtra Krishi department / Mahaagri | State crop statistics, sowing progress, taluka-level area | State portal | Useful for arrival forecasting and for the state-scope narrative |


## 7.2 Weather and climate


| Source | What you get | Access | Use |
|---|---|---|---|
| IMD (mausam.imd.gov.in) | Station observations, district rainfall, forecasts, warnings | Portal; some datasets via data.gov.in | Rainfall anomaly is a strong price feature via supply expectations |
| ERA5 / Copernicus CDS | Global reanalysis: hourly temperature, precipitation, humidity from 1940 onward at ~31 km | Free with registration, Python cdsapi client | The most reliable long-history weather covariate. Use for training; use IMD or open-meteo for live |
| Open-Meteo | Free forecast and historical weather API, no key required | Simple REST | Fastest path to a working weather feature during the hackathon |
| NASA POWER | Agroclimatology daily series, solar radiation, ET | Free REST API | Good for evapotranspiration and heat-stress features |
| CMIP6 | Climate projections | ESGF nodes | Only for the long-horizon risk narrative. arXiv:2503.24324 uses CMIP6 for exactly this |


## 7.3 Remote sensing and geospatial


| Source | What you get | Access | Use |
|---|---|---|---|
| Sentinel-2 (Copernicus) | 10 m multispectral, ~5-day revisit | Copernicus Data Space, or Google Earth Engine, or AWS open data | NDVI/EVI over the sourcing catchment as a supply-side leading indicator. Rising area under onion means arrivals will rise, means prices will fall |
| Sentinel-1 SAR | Radar, cloud-penetrating | Same | Monsoon-season crop monitoring when optical is cloud-blocked |
| MODIS / VIIRS | 250 m-1 km vegetation indices, long history | LP DAAC, GEE | Long-history yield features. Widely used in the yield-prediction literature |
| Bhuvan (ISRO) | Indian thematic layers, crop-area products, village boundaries | Portal, some WMS/WFS | Indian-context land use and administrative geography. Good "we use ISRO data" talking point |
| SoilGrids / NBSS&LUP | Soil properties | SoilGrids REST; NBSS&LUP publications | Soil type appears as a feature in arXiv:2304.09761 |
| OpenStreetMap | Roads, market locations, warehouses | Overpass API | Routing and distance for transport cost. Free and good enough |


## 7.4 Institutional, finance and logistics


| Source | What you get | Use |
|---|---|---|
| WDRA (wdra.gov.in) | Registered warehouse list, e-NWR rules and repositories | The backbone of the pledge-credit pillar. Get the registered-warehouse list for Nashik/Ahmednagar/Pune first. [VERIFY] counts and current repository list |
| NABARD | FPO registry and programmes, FPO-related credit schemes | FPO directory for the state; also the ONDC-agri partner, which is a route to network onboarding |
| SFAC / 10,000 FPO scheme | FPO listings and cluster-based business organisation data | Identifying real FPOs in the wedge districts for pilot partners |
| RBI / NABARD reports | Agricultural credit statistics, KCC data, interest-rate structures | The debt side of the liquidity argument. Sourcing real interest rates strengthens the pledge-finance value calculation |
| NCRB | Accidental Deaths and Suicides in India - occupation-wise data | The outcome your project exists to change. Handle with care and precision, never as a shock statistic |
| MoSPI / NSSO SAS | Situation Assessment Survey of Agricultural Households: income, indebtedness, marketing channels, MSP awareness | The 23% MSP-awareness figure comes from here. The richest single source on how farmers actually sell |
| ONDC / Beckn | Protocol specifications, registry, reference implementations | If you build a Beckn-compliant BPP you get network reach without building demand. Strong strategic story |
| Bhashini | Marathi ASR, TTS, translation; 300+ pretrained models | The voice layer. Free, government DPI, and a credibility win |
| AgriStack / farmer registry | Farmer ID linked to land records | Identity and KYC reduction. [VERIFY] Maharashtra enrolment status and access process |


## 7.5 Training data for the ML models, model by model


| Model | Data you need | Where it comes from | Realistic hackathon substitute |
|---|---|---|---|
| M2/M3 price forecast | 5+ years of daily price and arrival series for 5 commodities x 40-60 Maharashtra mandis | Agmarknet scrape or data.gov.in bulk | Even 3 years x 10 mandis x onion is enough for a credible backtest. Depth beats breadth for a demo |
| M4 volatility | Same price series, log returns | Same | Same |
| M5 conformal | A held-out calibration slice of the same series | Derived | No extra data needed - just discipline about the split |
| M7 arrivals | Arrival series + sowing area + weather + NDVI | Agmarknet + state agri dept + Sentinel-2 | Arrivals plus weather alone gets you a working model |
| M8 spoilage | Measured storage-loss curves by crop, storage type, temperature and humidity | ICAR and CIPHET post-harvest research publications; state agri university trials | Use published agronomic curves and cite them. Do not fabricate. An honest cited curve is better than an invented model |
| M9 grading | Labelled produce images by grade, per crop, per variety | Build your own: this is the highest-value pre-work. Also public sets - PlantVillage (disease not grade), Fruits-360 (clean but unrealistic), Kaggle onion/tomato grading sets [VERIFY availability] | Collect 300-600 photos yourself at a mandi with a phone, labelled by a trader. That dataset is unique to you, and saying "we collected our own labelled dataset at Lasalgaon" is worth more in the room than any public dataset |
| M10 buyer score | Settled transaction outcomes | Only from your own platform | Cold start with verification tier plus a rules layer; be explicit that the learned model comes after real transactions |
| M13 Marathi voice | Marathi agri speech | Bhashini pretrained; Shrutilipi and IndicSUPERB corpora for fine-tuning; Kisan Call Centre transcripts for the domain lexicon (see arXiv:2509.21535, which used KCC data) | Bhashini out of the box, plus a hand-built agri lexicon of crop names, grades and number formats for post-correction |
| M14 cold start | Nothing - zero-shot | Pretrained TimesFM or Chronos weights | Genuinely zero-shot. Just remember the gating requirement |


## 7.6 Corpus construction plan - do this in the 8 weeks before the hackathon


1. Register for a data.gov.in API key on day one. It is free and it unblocks the legitimate path to price data.
2. Write the Agmarknet ingester with a canonical commodity-variety-market mapping table for onion, soybean, cotton, tomato and tur. Budget two days; the naming inconsistencies are the real work.
3. Pull the longest history you can get for 40-60 Maharashtra mandis. Store raw responses as well as parsed rows so you can re-parse without re-fetching.
4. Build the data-quality report: per mandi-commodity, the reporting rate, gap distribution and outlier count. This report is itself a slide, because it proves you touched real data.
5. Implement imputation with an explicit flag column. Validate by masking known values and measuring recovery error.
6. Hand-build the policy-event calendar for onion: every export ban, minimum export price change and stock limit for the last five years, with dates. This is a few hours of newspaper archive work and it is a genuine competitive advantage - almost no team will have it, and it is what makes your regime-shift story real.
7. Collect the grading image dataset. Go to a mandi. Photograph lots under a fixed protocol - same distance, plain background, reference coin for scale - and have a trader or commission agent label the grade. 300-600 labelled images. This is the highest-credibility artifact in the whole project.
8. Get the WDRA registered-warehouse list for the three wedge districts, with capacity and rates. Call two of them and ask their actual monthly rate and whether they issue e-NWRs. Two phone calls turn a slide into evidence.
9. Identify and contact two real FPOs in Nashik or Ahmednagar. A single quote from a real FPO chairperson in your pitch outweighs a page of secondary research.
10. Run the backtest of M12 and record the rupees-per-quintal result. This is your headline number. Do it early so you have time to fix it if it is unimpressive.


## 7.7 Source verification tracker - fill this in during week 1


| Source | Endpoint / URL | Auth | Format | Rate limit | Licence | Verified on | Owner |
|---|---|---|---|---|---|---|---|
| data.gov.in mandi prices |  | API key | JSON |  |  |  |  |
| Agmarknet |  | none | HTML |  |  |  |  |
| eNAM |  |  |  |  |  |  |  |
| MSAMB APMC list |  |  |  |  |  |  |  |
| IMD / open-meteo |  |  |  |  |  |  |  |
| ERA5 CDS |  | account | NetCDF |  |  |  |  |
| Sentinel-2 |  | account | COG |  |  |  |  |
| WDRA warehouses |  |  |  |  |  |  |  |
| NABARD FPO list |  |  |  |  |  |  |  |
| Bhashini ASR/TTS |  | API key | REST |  |  |  |  |
| NCDEX quotes |  |  |  |  |  |  |  |
| MoSPI SAS |  | none | PDF/CSV |  |  |  |  |


Assign an owner per row on day one. The commonest reason a hackathon team ships a fake demo is that nobody was individually accountable for a data source, so everyone assumed someone else had it.



---

# 08. Trust and Transaction Layer


Chapter 02 established that counterparty risk is a tax on every other improvement: a better price that is not credible is not taken. This chapter is how we make distant prices credible. It is also the chapter that covers the problem statement clauses most teams will skim past - grading, payment tracking and grievance handling - which makes it a cheap place to win points.


## 8.1 Buyer verification: four tiers


| Tier | Requirements | What the buyer can do | Displayed as |
|---|---|---|---|
| T0 Unverified | Phone + OTP only | Browse lots. Cannot make offers | Grey - no badge |
| T1 Identity verified | PAN + GSTIN validated against the public registry, bank account penny-drop verified | Offer up to a low value cap, escrow mandatory, prepayment required | Bronze |
| T2 Licence verified | T1 plus APMC trader licence or processor registration verified, plus a physical-address check | Higher cap, escrow default but negotiable after 5 clean settlements | Silver |
| T3 Track-record verified | T2 plus at least 10 settled transactions on-platform with a payment-reliability score above threshold and dispute rate below threshold | No value cap, may negotiate direct settlement terms, gets priority in matching | Gold |


The point of tiering is that it is honest in both directions. A farmer sees exactly how much a counterparty has been checked, and a new buyer sees exactly what they must do to get better access. Compare this with platforms where "verified" is a single opaque tick.


### The payment-reliability score


```reliability-score
reliability = 100 * w1 * ontime_rate
            + 100 * w2 * (1 - dispute_rate)
            + 100 * w3 * (1 - renegotiation_rate)
            + 100 * w4 * volume_consistency
            + tier_bonus
  ontime_rate          = settled within agreed terms / total settled
  dispute_rate         = disputes raised against buyer / total txns
  renegotiation_rate   = post-delivery downward price changes / total txns
  volume_consistency   = 1 - coefficient of variation of monthly purchase volume

ALWAYS SHOWN TO THE FARMER AS PLAIN FACTS, NOT JUST A NUMBER:
  "Ganesh Traders - Gold. 47 deals on this platform. Pays in 3 days on average.
   Never re-negotiated after delivery. 1 dispute, resolved in the farmer's favour."

```


Note `renegotiation_rate` specifically. Post-delivery downward renegotiation on a quality pretext is one of the most common ways a farmer loses money after agreeing a price, and no existing platform scores it. Tracking it is a small feature with a large signalling value: it tells a judge you know what actually happens at a mandi gate.


## 8.2 Grading: three tiers and an abstention


| Tier | Method | Cost | Trust weight | When required |
|---|---|---|---|---|
| T1 Self + photo | Farmer declares attributes, uploads photos under a guided capture protocol | Free | Low | Lots below a value threshold, or where buyer accepts |
| T2 CV assist | On-device CNN estimates size distribution, colour uniformity and visible-defect ratio; a rule engine combines with measured moisture and farmer-declared attributes | Free | Medium | Default for most lots |
| T3 Independent assay | eNAM assaying lab, APMC assayer, or an accredited third party | Small fee, often shared with buyer | High | Lots above a value threshold, export-bound lots, or when a buyer requires it |


The model must be able to abstain. If image quality is poor, or the produce is a variety outside the training distribution, the correct output is "cannot grade - please get an assay", not a guess. An abstaining grader is trusted; a guessing grader is discovered.


### Onion grading dimensions - concrete example


| Attribute | How measured | Grade A | Grade B | Grade C / processor |
|---|---|---|---|---|
| Size / diameter | CV from image with reference object for scale | 45-65 mm, uniform | 30-45 mm or mixed | Under 30 mm or heavily mixed |
| Colour uniformity | CV histogram analysis | Uniform, characteristic | Slight variation | Significant variation |
| Visible defects | CV defect segmentation | Under 2% | 2-5% | Over 5% |
| Sprouting / rot | CV plus farmer declaration | None | Trace | Present - route to processing fast |
| Moisture / neck | Manual check, guided prompt | Well cured, tight neck | Adequately cured | Poorly cured - short shelf life, do not recommend HOLD |


The last row matters more than it looks. Grading is not only a price input - it is an input to the HOLD decision. A poorly cured lot cannot be held, so the sale-window engine must refuse to recommend holding it regardless of the price forecast. That linkage between grading and advice is a genuine integration point and worth saying out loud.


## 8.3 The FPO fair-split ledger


This is the feature that makes FPO aggregation actually work, and it takes an afternoon to build.


```fpo-split
PROBLEM: 14 farmers pool 186 quintals of onion. It sells as one lot at Rs 1,420/qtl.
         Farmer 7 believes their onions were the best and should get more.
         Farmer 3 believes the split favoured the FPO chairperson's cousin.
         Without a pre-agreed rule, the FPO breaks after one sale.

SOLUTION: grade-weighted proportional split, consented BEFORE the sale.

  grade_multiplier:  A = 1.00   B = 0.88   C = 0.72   D = 0.55
      (multipliers set from the actual observed price ratios between grades
       in that mandi over the last 90 days - not arbitrary numbers)

  weight_i = qty_i * grade_multiplier_i
  share_i  = weight_i / sum(weight_j)
  payout_i = share_i * (gross - shared_costs) - individual_costs_i

  shared_costs     = transport, mandi fee, commission, FPO service charge
  individual_costs = that farmer's own storage or pledge interest, if any

EXAMPLE
  Farmer 3:  22 qtl, Grade A -> weight 22.00
  Farmer 7:  18 qtl, Grade B -> weight 15.84
  Farmer 9:  31 qtl, Grade C -> weight 22.32
  ... total weight across 14 members = 162.4
  Gross = 186 x 1420 = Rs 264,120.  Shared costs = Rs 11,300.  Net pool = Rs 252,820
  Farmer 3 share = 22.00/162.4 = 13.55%  ->  Rs 34,257

MECHANISM: every member sees their own projected share, the multiplier applied
to their grade, the assay that produced that grade with its photos, and the full
member table - BEFORE they tap consent. Consent is recorded with a timestamp.
A dispute about the split is therefore a dispute about a rule they approved,
which is a conversation, not a fight.

```


> **WHY THIS IS A WINNING FEATURE**  
> The problem statement asks for "stronger FPO level aggregation". Every team will say "we support FPOs". You will show the specific mechanism by which FPO trust does not collapse - transparent, grade-weighted, consented in advance, with the multipliers derived from observed market price ratios rather than invented. That is what "stronger aggregation" actually requires.


## 8.4 Escrow and settlement state machine


```escrow-fsm
  CREATED ---(buyer funds)---> FUNDED ---(farmer dispatches)---> IN_TRANSIT
     |                            |                                  |
     | expires                    | buyer cancels                    v
     v                            v                              DELIVERED
  EXPIRED                     REFUNDED                               |
                                                                     v
                                                                 INSPECTED
                                                        +------------+-----------+
                                                        | assay matches          | mismatch claimed
                                                        v                        v
                                                    RELEASED                 DISPUTED
                                                 (farmer paid)                   |
                                        pledge auto-repaid if any                v
                                                                    +------------+-----------+
                                                                    | agreed partial release  | escalate
                                                                    v                        v
                                                            PARTIAL_RELEASED           ADJUDICATED

RULES THAT PROTECT THE FARMER
  - Funds must be in escrow BEFORE dispatch. No dispatch against a promise.
  - Auto-release after N days if the buyer does not inspect. Silence is not a veto.
  - A quality dispute must cite specific attributes and attach evidence, and it is
    compared against the pre-dispatch assay with its timestamped photos.
  - A dispute cannot reduce price below the grade actually delivered per that assay.
  - Every dispute, and its outcome, feeds the buyer reliability score. A buyer who
    disputes habitually becomes visibly expensive to deal with.

```


## 8.5 Dispute and grievance handling


| Stage | Who | SLA | What happens |
|---|---|---|---|
| S1 Structured claim | Raising party | Immediate | Category, specific attributes contested, evidence photos, proposed remedy. Free text alone is not accepted - structure is what makes resolution fast |
| S2 Automated comparison | System | Instant | Compares the claim against the pre-dispatch assay, photos and metadata. Many disputes resolve here because the evidence already exists |
| S3 Bilateral window | Both parties | 48 hours | Structured settlement options: accept, partial release at a computed grade-adjusted price, or return |
| S4 Platform mediation | Trained mediator, FPO representative available to support the farmer | 5 working days | Reviews evidence, proposes a binding-by-consent outcome |
| S5 External escalation | ODR provider, APMC dispute committee, or the consumer/legal route | As per forum | Case file exported in a structured, complete form. The audit trail makes this cheap instead of impossible |


The design principle is that most disputes are evidence problems, not disagreement problems. A farmer and a buyer arguing about whether onions were 40 mm or 32 mm is unresolvable verbally and trivially resolvable with a timestamped, geotagged photo set and an assay record. Building the evidence before the dispute is the entire trick.


> **ASYMMETRY GUARD**  
> A buyer is a business with staff and time. A farmer is one person with a phone in a field. So the dispute process must be asymmetrically supported: the farmer gets an FPO or platform representative to help file, every stage is available as Marathi voice, and no deadline is enforced against a farmer who has not been reached on a channel they use. A "fair" process that both parties navigate with equal difficulty is not fair.


## 8.6 Transaction transparency without gratuitous blockchain


The problem statement asks for "transparent transaction records". You can satisfy this fully with a hash-chained append-only log, and choosing that over a blockchain is a point in your favour with technical judges.


```hash-chain
entry_hash = SHA256( prev_hash || txn_id || farmer_id || buyer_id ||
                     agreed_price || qty || net_amt || timestamps || assay_hash )

PROPERTIES OBTAINED
  - tamper evidence: any retrospective edit breaks the chain from that point on
  - farmer-verifiable: the farmer can download their own statement and independently
    recompute the chain over their own entries
  - exportable proof: the record is what a farmer needs to claim under a price-deficiency
    scheme like PM-AASHA, and what a lender needs to underwrite them next season
  - cheap: one Postgres table, no consensus layer, no gas, no node operations

OPTIONAL HARDENING, if a judge pushes on immutability:
  publish a daily Merkle root of all entries to a public notarisation target.
  Anyone can then verify any historical entry against a public root without us
  running a chain. Say this - it shows you know the trade-off rather than
  defaulting to either extreme.

```


Have the sentence ready: "We considered a blockchain and rejected it. Our integrity requirement is tamper-evidence and farmer-verifiability, which a hash chain plus daily public notarisation gives us at a fraction of the operational cost. We would rather spend that engineering on the pledge-credit loop, which is what actually puts money in a farmer's hand."



---

# 09. Designing for a Farmer Who May Not Read


This chapter is where most hackathon projects quietly fail the real user. Maharashtra female literacy is around 75 percent against 89 percent for men (Wikipedia, Maharashtra), and the ability to read a price chart is a much higher bar than the ability to sign a name. If your interface assumes reading, you have excluded a large share of the people the problem statement is about - disproportionately women, who do much of the agricultural labour.


## 9.1 The four-channel strategy


| Channel | For whom | What it carries | Why it exists |
|---|---|---|---|
| Android app | Farmers with a smartphone, and FPO staff | Full functionality: forecast, sale window, lot creation, photo grading, offers, ledger | The rich experience, offline-first |
| IVR voice call in Marathi | Feature-phone users, non-readers | Today's price, the sale-window recommendation with its reason, offer alerts, accept/reject by keypad or speech | The most inclusive channel. A phone call requires no literacy and no data |
| WhatsApp | The large middle: smartphone but low app-install willingness | Daily price card as an image, voice-note recommendation, offer notifications, document delivery | Where farmers already are. The AIEP field study (arXiv:2601.11537) validates IVR plus WhatsApp as the deployed pattern |
| SMS | Last-resort fallback, and all critical alerts | Price, recommendation in under 160 characters, payment confirmation | Works everywhere, always. Every money event must also arrive by SMS |


> **THE RULE**  
> Every action that moves money must be completable end to end on the voice channel alone. If accepting an offer requires reading, then the farmers most likely to be exploited are the ones who cannot use the protection you built.


## 9.2 Design rules, and the reason for each


**Numbers, not charts, first** — A price chart is a literacy artifact. Lead with "Rs 1,240 today. Rs 1,390 expected in 12 days" as large numerals with voice. The chart is available, but secondary.

**Colour and shape carry the message** — Green up-arrow, red down-arrow, amber hold-clock. Never rely on colour alone - always pair it with an icon and a spoken word, both for accessibility and for colour-blind users.

**One decision per screen** — The farmer app should never show two questions at once. Sell or hold. Accept or counter. Pool or sell alone.

**Rupees, always rupees** — Never show a percentage as the primary figure. "Rs 88 more per quintal, so Rs 3,700 more for your 42 quintals" is understood. "6.4% improvement" is not.

**Speak the downside too** — The TTS script must include the bad case: "you may also get Rs 60 less if rain damages the crop in storage". Consent must be informed, and this is also your legal and ethical protection.

**Names and places, not IDs** — "Ganesh Traders, Pimpalgaon" not "Buyer #4471". Recognition is trust.

**Read every number back** — On any input - quantity, price, acceptance - the system repeats it in Marathi and asks for confirmation. A mis-keyed quantity in a produce transaction is a real financial loss.

**Design for a shared phone** — Many farmers use a household phone. Do not assume the device identifies the person. Light re-authentication for money actions, and no sensitive financial data on a lock-screen notification.

**Assume bright sunlight** — High contrast, large type, no thin greys. The user is standing in a field at noon.

**Never a dead end** — Every screen has a "call for help" that reaches a human or an IVR menu. For a user who is not confident with apps, being stuck is being abandoned.


## 9.3 The core screen: sale window


```screen-sale-window
+------------------------------------------------+
|  [ Marathi ]      Kanda (Onion)     42 quintal |
|                                                |
|            TODAY  Rs 1,240 / quintal           |
|            Lasalgaon mandi                     |
|                                                |
|  +------------------------------------------+  |
|  |   [clock icon]     THAMBA  (WAIT)        |  |
|  |                                          |  |
|  |   12 days -> about Rs 1,390 / quintal    |  |
|  |   You may get  Rs 3,700 MORE in total    |  |
|  |   Worst case:  Rs 2,500 LESS  [!]        |  |
|  |                                          |  |
|  |   Confidence: 7 out of 10  [ * * * * *   |  |
|  |                              * * o o ]   |  |
|  +------------------------------------------+  |
|                                                |
|  NEED MONEY NOW?                               |
|  +------------------------------------------+  |
|  | Store at Nashik Warehouse (11 km)        |  |
|  | Get  Rs 38,000 TODAY  as a loan          |  |
|  | Interest for 12 days:  Rs 940            |  |
|  | You still keep the higher price later    |  |
|  |        [  GET MONEY TODAY  ]             |  |
|  +------------------------------------------+  |
|                                                |
|  [ >> LISTEN IN MARATHI ]   (always visible)   |
|                                                |
|  WHY?  Arrivals are falling. Rain in Nashik    |
|        district. Prices rose the same way in    |
|        2 of the last 3 years at this time.     |
|        [ see the 3 similar past cases ]        |
|                                                |
|  [  SELL TODAY INSTEAD  ]   [  CALL FOR HELP ] |
+------------------------------------------------+

```


Six deliberate choices in that screen. The worst case is shown with equal weight to the expected case. Confidence is expressed as "7 out of 10", not "70% CI", because the former is understood and the latter is not. The cash option sits directly under the HOLD advice, so the advice is never separated from the means to follow it. The reason is stated in causal language a farmer can check against their own knowledge of the weather. The three similar past cases come from the nearest-neighbour interpretability approach in arXiv:1812.05173 - showing precedent rather than a coefficient. And "SELL TODAY INSTEAD" is always present, because a system that makes disagreeing with it hard is a system that will eventually hurt someone.


## 9.4 The IVR script


```ivr-script
[System calls the farmer at 7:30 a.m., or the farmer dials a toll-free number]

TTS: "Namaskar Ramesh-ji. Aaj kandyacha bhav Lasalgaon madhye barah shey chalis rupaye
      prati quintal aahe."
      (Today onion price at Lasalgaon is 1,240 rupees per quintal.)

TTS: "Aamchya andaajanusar barah divsaat bhav teen shey pannas rupaye vadhu shakto.
      Pan kami hi hou shakto. Aiknyasathi ek dabaa."
      (We estimate the price may rise by 350 rupees in 12 days. But it could also fall.
       Press 1 to hear more.)

[1] -> "Tumhi 42 quintal thevlyaas andaaje teen hajaar saat shey rupaye jaast milu shaktil.
        Vaait sthiti madhye don hajaar paach shey rupaye kami hi hou shaktil.
        Aamcha vishwas: das madhun saat."
        (If you hold 42 quintals you may get about Rs 3,700 more. In the bad case you may
         get Rs 2,500 less. Our confidence: 7 out of 10.)

        "Paise aaj lagtaat ka? Nashik godaam madhye theva ani aaj aatthis hajaar rupaye
         karj mhanun ghya. Barah divsaanche vyaaj navshe chalis rupaye.
         Hyaa sathi don dabaa."
        (Need money today? Store at Nashik warehouse and take Rs 38,000 as a loan today.
         Interest for 12 days is Rs 940. Press 2 for this.)

[2] -> warehouse + pledge flow, with a callback from a human agent to complete
[3] -> "Aaj vikaayche aahe" -> today's live buyer offers, read one by one
[9] -> repeat            [0] -> connect to a human

DESIGN NOTES
  - The downside is spoken in the SAME breath as the upside. Never a separate menu.
  - Amounts are spoken in Marathi numerals in the way a farmer says them, not digit by digit.
  - Any money-moving action requires a spoken read-back and an explicit confirm.
  - The whole call is recorded and stored with the recommendation ID. That recording is
    the consent record, and it is also your defence if advice is ever challenged.
  - Maximum 25 seconds before the first actionable choice. Farmers hang up on long menus.

```


## 9.5 Accessibility and safeguards


- WCAG-oriented practice on all digital surfaces: minimum 4.5:1 contrast for text, 44x44 pt touch targets, full screen-reader labelling, no colour-only signalling, and support for the OS font-scale setting. Full WCAG conformance needs manual testing with assistive technology and expert review - claim the practices, not the certification.
- Marathi first, with Hindi and English as options. Marathi is the language of the user, not a localisation afterthought.
- No dark patterns anywhere near money. No countdown timers pressuring an accept, no pre-ticked consent, no default that favours a buyer.
- Distress signal handling: if a farmer's realised prices fall below cost of production repeatedly, or they interact in ways suggesting acute distress, the system surfaces Kisan call centre and state helpline numbers. Given the outcome this project exists to prevent, this is not an optional nicety. Build it, and say in the pitch that you built it.
- Explicit data consent in Marathi voice, with a plain statement of what is shared with whom. Farm data is sensitive and farmers have been exploited with it before.
- Grievance access from every screen, one tap, no login wall.



---

# 10. The Build Plan


Six people, one deliverable, a hard deadline. The plan below assumes an eight-week run-up followed by the 36-hour grand finale. If your timeline is shorter, cut scope from Pillars 3 and 4, never from Pillars 1, 2 and 5, because those three are the argument.


## 10.1 Role assignment for six people


| Role | Owns | Primary deliverables | Must not also own |
|---|---|---|---|
| R1 ML lead | Models M0-M8, M12, M14; the backtest | Trained forecaster with conformal intervals, the sale-window engine, and the backtested rupees-per-quintal number | Any UI work. This role is the technical credibility and cannot be split |
| R2 Data engineer | Ingestion, canonical mappings, imputation, the feature store, the policy-event calendar | Working pipeline over 3+ years of real Maharashtra data, plus the data-quality report | Modelling. Pipeline and models fail differently and need different heads |
| R3 Backend | FastAPI services, schema, escrow FSM, ledger, hash chain, buyer scoring | All APIs working with OpenAPI docs, seeded realistic data | The mobile app |
| R4 Mobile / farmer surfaces | Android app, IVR flow, WhatsApp bot, SMS, Marathi voice integration | The farmer journey demoable offline, with working Marathi TTS | Backend logic |
| R5 Buyer web + design | Buyer dashboard, public district dashboard, all visual design, the deck | Buyer flow, the Realisation Ledger dashboard, and a deck that does not embarrass the build | Nothing else. Design is usually under-resourced and it is what judges see first |
| R6 Domain, story and integration | Field research, FPO and warehouse contacts, the policy-event calendar with R2, the pitch narrative, demo script, risk answers, and integration glue | Two real FPO conversations, two warehouse rate confirmations, the grading image dataset, the pitch | Nothing on the critical build path. This role is why you win the room, and it evaporates if given tickets |


> **THE MOST COMMON SIX-PERSON MISTAKE**  
> Putting five people on code and one on "presentation" at the end. The pitch, the field evidence and the story are not a wrapper - they are half the score. R6 must start on day one and must never be pulled onto the build, even when the build is behind. A working prototype with no story loses to a rougher prototype with a farmer's name in it.


## 10.2 The eight weeks before


| Week | Focus | Concrete exit criteria - all must be checkable |
|---|---|---|
| W1 | Data access and truth | data.gov.in key obtained. Agmarknet ingester pulling onion for 10 Nashik-belt mandis. Source verification tracker (7.7) filled with an owner per row. Data-quality report produced. |
| W2 | Data depth | 3+ years across 40-60 mandis and 5 commodities. Canonical commodity-variety mapping complete. Imputation implemented and validated by masking. Weather joined. |
| W3 | Baselines | M0 persistence and M1 seasonal-naive implemented with a rolling-origin harness. MASE and RMSE recorded per mandi-commodity-horizon. THIS IS THE GATE: no fancy model until the harness works and the baselines are recorded. |
| W4 | Primary model | M2 LightGBM quantile model beating M0 on the majority of mandi-commodity-horizon cells, with a Diebold-Mariano p-value. M5 conformal calibration with measured coverage. |
| W5 | Decision engine + the number | M12 implemented. Backtest over 3 years produces the headline rupees-per-quintal figure versus a sell-on-harvest baseline. If the number is weak, this is the week to find out and fix it. |
| W6 | Field evidence | Two FPO conversations completed with quotes and permission. Two warehouse rate cards confirmed by phone, with e-NWR capability checked. Grading dataset collected: 300-600 labelled images. Policy-event calendar for onion complete for 5 years. |
| W7 | Product skeleton | Backend services with seeded data. App shell with the sale-window screen. Marathi TTS working end to end. IVR happy path working on a real phone call. |
| W8 | Integration and rehearsal | Full flow A and flow B working. Realisation Ledger computing. Deck complete. Pitch rehearsed to time at least five times, including with the demo failing on purpose. |


## 10.3 The 36 hours, hour by hour


| Hours | Everyone | Checkpoint |
|---|---|---|
| 0-2 | Set up, git hygiene, environments verified on every machine, seed data loaded, one-command startup proven on two laptops. R6 finalises the problem framing with any new information from the venue briefing. | `docker compose up` works from a clean clone. If not, stop everything and fix it now. |
| 2-6 | R1 loads pretrained models and wires forecast serving. R2 verifies live data refresh. R3 core APIs. R4 app shell plus sale-window screen. R5 buyer dashboard shell plus deck skeleton. R6 demo script v1. | Forecast API returns real numbers for Lasalgaon onion with intervals. |
| 6-10 | R1 sale-window engine wired to real forecasts. R3 lot, offer and escrow endpoints. R4 lot creation with camera. R5 ledger dashboard. R6 rehearses narration against whatever exists. | A recommendation renders on a phone from a real forecast. |
| 10-14 | Grading CV integrated as assist. FPO split implemented. Marathi TTS on the recommendation. Escrow state machine walkable. | Farmer journey walkable end to end, even if ugly. |
| 14-18 | FIRST FULL DRY RUN, timed, recorded on video. Then fix what broke. Freeze the schema after this point. | 8-minute run completes without a crash. Video saved as the fallback. |
| 18-24 | Depth: conformal intervals visible in the UI, the "why" panel with nearest-neighbour precedents, buyer reliability display, dispute flow, public dashboard. R5 finishes the deck. | Every claim in the deck is demonstrable in the product. |
| 24-28 | Realisation Ledger backtest results rendered in the product. Seed a realistic transaction history so the dashboard is not empty. Polish the three screens judges will actually look at. | The headline number appears in the product, not just on a slide. |
| 28-31 | Hardening: offline mode verified with the wifi physically off, error states, empty states, the "insufficient data" state, and a scripted local fallback for every external API. | Demo survives with networking disabled. |
| 31-34 | Rehearse three more times with different people asking hostile questions. Record the final fallback video at full quality. Prepare the one-page handout. | Every team member can run the demo alone. |
| 34-36 | Buffer. Sleep in shifts. No new features - the rule is absolute. | Two people rested enough to present coherently. |


> **THE FEATURE FREEZE RULE**  
> No new feature after hour 28. None. The single most common way good hackathon teams lose is a half-finished feature added at hour 33 that breaks the demo at hour 35. Write this rule on the wall and appoint one person - R6 - with the authority to enforce it against anybody, including themselves.


## 10.4 Pre-built assets to bring in


- Trained model artifacts, versioned, loadable in under 10 seconds. Do not train during the hackathon.
- A seeded database dump with realistic Maharashtra names, villages, mandis, buyers, and 6 months of plausible transaction history so no dashboard is empty.
- The complete Marathi string table with pre-generated TTS audio for every demo line, cached locally. If Bhashini is unreachable at the venue, the demo must still speak Marathi.
- A local mock for every external API - Agmarknet, Bhashini, UPI, e-NWR - toggled by an environment variable. Practise with the mocks on.
- The grading image dataset, on disk, with a working local inference path.
- The backtest results as both a CSV and a chart, ready to render.
- The fallback demo video, high quality, with subtitles, on two laptops and one phone.
- A printed one-pager: the causal chain from 2.2, the five pillars, the headline number, and the PS-requirement coverage table from 4.5.



---

# 11. The Demo and the Pitch


Assume 8-10 minutes and a hostile clock. The structure below front-loads the insight, because the only thing you can be certain of is that the first two minutes will be heard.


## 11.1 The eight-minute script


| Time | Beat | What you say and show |
|---|---|---|
| 0:00-0:45 | The person | One farmer, named, real if you have one. "Ramesh Pawar farms 1.2 acres of onion near Pimpalgaon. Last October he sold 42 quintals on harvest day at Rs 890. Twelve days later the same mandi was at Rs 1,340. That is Rs 18,900 he did not get - roughly a third of his annual income from that plot. He knew prices might rise. He sold anyway, because he owed a moneylender on Friday." No slide clutter. One photo. |
| 0:45-1:30 | The insight | "Everyone assumes this is an information problem. It is not. Ramesh knew. The binding constraint is that he could not afford to wait. So the product cannot be a price dashboard. It has to be a waiting machine." Show the causal chain from 2.2. This is the sentence the judges will remember you by. |
| 1:30-2:15 | The five mechanisms and the five pillars | One slide, mechanism mapped to pillar. Fast. You are establishing that you decomposed the problem rather than reacting to it. |
| 2:15-4:30 | LIVE DEMO, part 1 - the decision | Farmer app. Onion, 42 quintals. Show today's price. Show the 14-day forecast WITH the uncertainty band. Show the recommendation: HOLD 12 days, expected +Rs 3,700, worst case -Rs 2,500, confidence 7 of 10. Tap "listen in Marathi" and let the room hear it speak. Then: "he still needs money on Friday" and tap GET MONEY TODAY - warehouse, e-NWR, Rs 38,000 today, Rs 940 interest, upside retained. Pause here. This is the moment you win. |
| 4:30-6:00 | LIVE DEMO, part 2 - the transaction | Create the lot. Grade it with the camera. Pool it with two other farmers and show the fair-split table with consent. Show two verified buyers with their reliability facts - "pays in 3 days, never renegotiated". Accept an offer. Escrow funds. Show the dispute flow in one sentence, do not walk it. |
| 6:00-6:45 | THE PROOF | Realisation Ledger. Per-transaction gain versus the counterfactual baseline. Then the backtest: "over three years of real Maharashtra onion data, this engine would have improved median realisation by Rs X per quintal net of storage and finance costs, against a sell-on-harvest baseline. Here is the Diebold-Mariano p-value against persistence." This slide is what separates you from every other team. |
| 6:45-7:30 | Honesty and scale | What is real today, what is mocked, what needs a government partner. Then the expansion path: onion to soybean to cotton to tomato to tur, and the integration story - eNAM, e-NWR, Bhashini, ONDC, AgriStack. "We do not replace government infrastructure. We are the decision layer on top of it." |
| 7:30-8:00 | Close on the person | "Ramesh does not need to be told what the price is. He needs to be able to wait for it. That is what we built." Stop talking. Do not add a thank-you slide with clip art. |


## 11.2 Demo discipline


- One person drives the laptop and never talks. One person narrates and never touches the laptop. This alone prevents most demo disasters.
- Everything runs local. Wifi off during the demo, deliberately and visibly - it is a feature, not a limitation, and saying "this works with no network because that is rural reality" earns a nod.
- Never type during a demo. Pre-filled forms, pre-staged states, one-tap navigation to each state.
- The fallback video is queued and one keystroke away. If anything hangs for more than four seconds, cut to video mid-sentence without apologising.
- Show the uncertainty band every single time you show a forecast. If a judge sees a bare point forecast once, your entire honesty argument weakens.
- Have the Marathi audio play out loud. It is the single most memorable sensory moment in the demo and it takes six seconds.
- Do not demo more than the script. Every extra screen is an extra chance to fail and a subtraction from the argument.



---

# 12. Judging Strategy


## 12.1 What SIH evaluators actually weigh


SIH judging typically balances novelty, technical feasibility, potential impact, and quality of implementation, with government-nominated evaluators who care about deployability within their own department. [VERIFY the exact 2026 rubric from the SIH portal and re-weight accordingly.] Assume roughly equal weight across those four and plan to score on all of them rather than maximising one.


| Criterion | How we score high | The specific artifact that proves it |
|---|---|---|
| Novelty | The credit-coupled recommendation and the Realisation Ledger are genuinely uncommon. Say plainly that the components are known and the LOOP is the invention - claiming false novelty on components loses more than it gains | The pledge-finance flow inside the HOLD recommendation, demoed live |
| Technical feasibility | Real data, real backtest, baselines beaten with a significance test, calibrated intervals, honest failure modes | The backtest chart plus the Diebold-Mariano p-value plus the coverage table |
| Impact | A quantified rupee model tied to a measured per-quintal improvement, and an explicit link to the outcome the state cares about | The impact arithmetic in Chapter 14 and the Realisation Ledger |
| Implementation quality | Working offline, Marathi voice, OpenAPI docs, tests, observability, a clean repo | Turn the wifi off. Show the API docs page. Show a test run. |
| Deployability for the department | State-scoped, integrates with existing government systems, has a named pilot geography, has a policy instrument the department can use | The district dashboard as a policy tool, plus the PM-AASHA proof export |


## 12.2 The five questions you will definitely be asked


**"eNAM already exists. Why you?"** — Use the answer scripted in 3.4: eNAM is a venue, we are a decision layer, its trade is mostly intra-market, and we integrate rather than replace. Then immediately pivot to the credit loop, which eNAM does not have.

**"How do you get farmers to adopt this?"** — Do not say "marketing". Say: we do not acquire farmers one by one, we onboard through FPOs and through the state extension machinery, because an FPO chairperson who trusts the fair-split ledger brings 60 farmers at once. And the first interaction requires no app - it is a phone call in Marathi.

**"What if your forecast is wrong?"** — This is your best question. Answer: it will be, and we designed for that. We ship calibrated intervals rather than point forecasts, we show the worst case before consent, we suspend advice during detected regime shifts, and we publish our own hit rate. Then add: and crucially, when we recommend holding we also provide the credit, so the farmer is not exposed to our forecast error with borrowed conviction and no cash.

**"Who pays for this?"** — Have a real answer. Three routes: a small transaction fee on the buyer side only, never the farmer; state funding as market infrastructure since the department already spends on market intelligence; and a lender-side origination arrangement on pledge finance. Say explicitly that the farmer never pays, because a farmer paying for price information is the same asymmetry in a new coat.

**"Is this not just what Ninjacart does?"** — No - they are a buyer, and their margin is the spread we exist to shrink. We are neutral infrastructure and we do not take a position on the produce. Then acknowledge Arya.ag honestly as the closest analogue and explain the difference: they are a financier with a platform, we are a state-scoped public market layer with finance as an integration.


## 12.3 Things that will lose you the room


- Claiming a percentage accuracy for a price model. A technical judge stops listening.
- A blockchain with no articulated reason. Say instead that you chose a hash chain and why - it reads as judgement rather than trend-following.
- Fabricated statistics. If a judge from the agriculture department knows the real number, everything else you said becomes suspect.
- A demo that requires the venue wifi.
- Claiming to have solved the whole value chain. Scope honesty reads as maturity; overclaiming reads as inexperience.
- Six people all talking. Two present, four answer questions when directed.
- Treating farmer suicide as a hook. Mention the outcome once, precisely, with the NCRB figure, and let the product carry the rest. Judges from Maharashtra live with this reality and will react badly to it being used as decoration.
- Reading the slides aloud. If a slide can be read, do not narrate it - talk over it.



---

# 13. Risks, and the Answer to Each


Bring this table into the room. When a judge raises a risk you have already written down and answered, you convert their scepticism into confidence in about four seconds.


## 13.1 Technical risks


| Risk | Severity | Mitigation | What you say |
|---|---|---|---|
| Forecast accuracy insufficient to justify a hold | High | Beat persistence with a significance test; ship intervals not points; refuse to advise when confidence is low; measure realised outcomes | "We do not need to be right every time. We need to be right on average, honest about the spread, and to never let a farmer act on our confidence without cash in hand." |
| Agmarknet data sparse or unreliable | High | Explicit imputation with flags; data-quality features; multi-source cross-check; minimum-history gate per mandi | "The literature documents this data as extremely sparse. We treat imputation as a first-class pipeline stage and we flag every imputed value to the model." |
| Policy shock invalidates the model | Medium | Change-point detection, interval widening, advice suspension, a hand-built policy-event calendar | "An export ban is a regime change. We detect it and stop advising rather than being confidently wrong." |
| Grading model unreliable on unseen varieties | Medium | Abstention, third-party assay override, per-stratum accuracy reporting | "The grader is an assist, never the authority. It is allowed to say it does not know." |
| Herd effect from our own recommendations | Medium | Staggered recommendation dates; monitor share of catchment supply under advice; disclose crowding | "If enough farmers follow us we move the market, so we monitor our own footprint and diversify dates. Nobody asks us this, and we designed for it anyway." |
| Scale and cost of ML serving | Low | Precompute nightly, cache hard, serve from Redis. Forecasts are per mandi-commodity, not per farmer | "There are hundreds of mandi-commodity pairs, not millions of users to model. Precomputation makes this cheap." |


## 13.2 Adoption and operational risks


| Risk | Severity | Mitigation | What you say |
|---|---|---|---|
| Farmers do not trust or use it | High | FPO-led onboarding; zero-install voice channel; show the downside so trust survives a bad outcome; publish our own hit rate | "Trust is earned by being right about what we do not know. We publish our misses." |
| Traders and commission agents resist | High | Do not remove them, re-price them. A commission agent can register as a verified buyer or as an aggregation service provider and compete on reliability | "We are not trying to abolish the mandi. We are trying to make the mandi compete. Any trader who pays fast and grades fairly gains business on our platform." |
| Warehouse capacity is genuinely unavailable | High | Map real capacity first; where absent, fall back to on-farm storage advisory plus spatial arbitrage instead of temporal; make capacity gaps visible to the state as an investment signal | "Where storage does not exist, our recommendation changes from wait to move, and the gap becomes a data point the department can act on." |
| No lender will finance a smallholder pledge | High | e-NWR is a regulated instrument designed for exactly this; start with FPO-intermediated lending and cooperative banks; the Realisation Ledger builds the repayment history that de-risks it | "The instrument already exists and is under-used because nobody built the farmer journey. We are the journey. And our own ledger becomes the credit history that lowers the rate next season." |
| Buyers will not use escrow | Medium | Tiered - escrow mandatory for new buyers, negotiable after a clean record. Escrow is the price of access to supply | "Escrow is how a new buyer buys credibility. Established buyers earn their way out of it." |
| Government partnership does not materialise | Medium | Product works standalone with public data; the state integration improves it but is not load-bearing | "Nothing in the demo depends on an MoU. Government integration multiplies reach, it does not enable function." |
| Team cannot finish in 36 hours | Medium | Eight weeks of pre-work; feature freeze at hour 28; scope cuts pre-decided in writing | "We decided in advance what we would drop, in what order, so we never debate scope at hour 30." |


## 13.3 Ethical and legal risks


| Risk | Mitigation |
|---|---|
| A farmer follows our advice and loses money | Downside disclosed before consent and recorded; consent captured as an audio recording on the IVR channel; overall hit rate published; no advice below a confidence threshold; the credit option means the farmer is not cash-exposed to our error. This is a real risk that cannot be eliminated, only made informed - say that plainly. |
| Advice could be construed as financial or investment advice | Frame as decision support with explicit uncertainty, never a guarantee. Terms in Marathi. Take legal review before any real-money deployment. [VERIFY regulatory framing with a lawyer before pilot.] |
| Farm data misused | Purpose limitation, explicit Marathi voice consent, no sale of individual farmer data ever, aggregate-only sharing with the state, and federated learning as the v2 architecture so raw data need not centralise. |
| Pledge finance becomes a new debt trap | Hard caps on LTV and tenor; the advance is only ever offered against a recommendation whose expected net gain exceeds the finance cost; automatic repayment from sale proceeds so the debt cannot roll; refuse to offer credit where the expected gain does not cover interest. Write this rule into the code, not the terms and conditions. |
| Algorithmic exclusion | Buyer score cold-start tier; grading abstention; per-district accuracy monitoring; no farmer is ever denied access to the platform based on a model output. |
| Accessibility exclusion | Voice-first, four channels, and the rule that every money action is completable by voice alone. |


> **THE PLEDGE-CREDIT GUARDRAIL IS NOT OPTIONAL**  
> The entire moral case for this product is that it breaks a debt ratchet. If the credit feature is built carelessly it becomes another turn of the same ratchet. So the rule is absolute and lives in code: no advance is offered unless the expected net gain from waiting exceeds the total finance cost, and repayment is automatic from sale proceeds so the loan cannot be rolled over. A team that states this constraint unprompted demonstrates that it understood the problem statement's purpose, not just its features.



---

# 14. The Impact Model: Arithmetic, Not Adjectives


Judges hear "we will transform Indian agriculture" all day. What they almost never hear is a defensible chain of arithmetic ending in a rupee figure, with every assumption labelled and every input sourced. Build the model, show the assumptions, and let them argue with the assumptions rather than with your credibility.


## 14.1 The per-farmer model


```per-farmer-model
INPUTS  (fill each with a verified or measured value - do not invent)
  A  onion area per smallholder                    ~0.6 ha    [VERIFY state avg]
  Y  yield                                          ~200 qtl/ha [VERIFY ICAR/state]
  Q  marketable quantity            = A * Y      =  ~120 qtl
  G  realisation gain per quintal    = FROM YOUR BACKTEST, not from a guess
  F  fraction of the crop actually held/routed on our advice  ~0.6
  C  finance + storage cost already netted inside G

  Annual gain per farmer = Q * F * G

  If your backtest yields G = Rs 120/qtl:
      120 qtl * 0.6 * 120 = Rs 8,640 per farmer per season

  Context that makes this number mean something:
    - state average monthly agricultural household income is a low four-figure sum,
      so a four-figure seasonal gain is material, not marginal  [VERIFY from MoSPI SAS]
    - it is of the same order as an annual interest burden on a small
      non-institutional loan, which is precisely the debt this must break

```


> **THE ONE RULE FOR THIS CHAPTER**  
> G must come from your own backtest over real Maharashtra data. Every other number in the chain can be a cited estimate with a range. G cannot, because G is the claim. If your backtest gives a disappointing G, report the honest G - a small, real, measured number is far more persuasive than a large invented one, and a judge who catches an invented number discards everything else you said.


## 14.2 Scaling within Maharashtra


| Stage | Scope | Farmers | Basis | Annual gain at G = Rs 120/qtl |
|---|---|---|---|---|
| Pilot | 3 talukas in the Nashik belt, 2-3 FPOs | 1,500-3,000 | FPO membership size and one district's onion grower base | Rs 1.3-2.6 crore |
| District | Nashik district onion growers | 50,000-80,000 | [VERIFY district onion grower count from state agri dept] | Rs 43-69 crore |
| Onion belt | Nashik, Ahmednagar, Pune, Solapur | 200,000-350,000 | [VERIFY] | Rs 170-300 crore |
| 5 crops, statewide | Onion, soybean, cotton, tomato, tur across Maharashtra | Several million cultivators; Maharashtra has a very large agricultural workforce and 43% marginal holdings | [VERIFY total cultivator count from Census/Agri Census] | Compute only after the pilot gives you a real G per crop - do not extrapolate a single crop's G across all five |


Present the pilot number as the promise and the larger numbers as arithmetic consequences, explicitly labelled as extrapolations. The credibility comes from refusing to present an extrapolation as a projection.


## 14.3 The non-monetary outcomes, mapped to the PS


| PS expected outcome | Our measurable indicator | How measured |
|---|---|---|
| improved price realisation for farmers | Rupees per quintal above the counterfactual baseline | Realisation Ledger, per transaction |
| reduced information asymmetry | Share of transactions where the farmer had a forecast before selling; forecast accuracy published publicly | Platform telemetry plus the public dashboard |
| lower transaction cost | Total deductions as a share of gross, versus the mandi-route baseline | Transaction records with an itemised cost breakdown |
| stronger FPO level aggregation | Average pooled lot size; number of members per pooled lot; FPO retention across seasons | Pooling records and consent logs |
| reduced post harvest loss | Share of lots routed to a grade-appropriate buyer instead of discarded; measured spoilage on held lots | Lot outcomes plus grade-routing records |
| more reliable buyer sourcing | Buyer-side fill rate against posted demand; grade-conformance rate on delivery | Demand and delivery records |
| transparent transaction records | Share of transactions with a complete hash-chained record and a farmer-downloadable statement | The ledger itself |


## 14.4 The outcome behind the outcome


Handle this once, precisely, and without decoration. NCRB recorded 4,248 farmer suicides in Maharashtra in 2022, the highest of any state, and the literature identifies debt as the most consistent contributing factor, with one study finding that cash crops, holdings under one hectare and indebtedness together explained around 75 percent of state-level variation.


The honest claim is not that a software platform prevents suicides. The honest claim is narrower and stronger: the mechanism our product attacks - forced distress sale that prevents debt from clearing - is the same mechanism the literature identifies as the pathway from a bad harvest to an unpayable debt. Improving realisation and providing a non-predatory bridge loan operates directly on that pathway. Say exactly that, and no more. Overclaiming here is both ethically wrong and tactically fatal in a room of Maharashtra officials.



---

# 15. Roadmap Beyond the Hackathon


| Phase | Timeline | Scope | Success gate |
|---|---|---|---|
| P0 Hackathon prototype | Now | Onion, Nashik belt. Pillars 1, 2, 5 deep; 3, 4 working | Win. Then get a named contact in the department. |
| P1 Pilot | 3-6 months | 2-3 FPOs, 1,500-3,000 farmers, real transactions, real pledge finance with one cooperative bank or NBFC | Measured G above zero on real transactions, over at least one full harvest cycle. Publish it honestly whatever it is. |
| P2 District | 6-12 months | Nashik district, onion plus soybean. eNAM integration live. e-NWR at scale with 10+ warehouses | Repayment rate on pledge advances above 95%; forecast coverage within 5 points of nominal |
| P3 State | 12-24 months | 5 crops, statewide, integrated with MSAMB and the state agri department as market infrastructure. Beckn-compliant BPP live on ONDC | District dashboards used by the department for actual policy decisions - that is the real adoption signal, not user counts |
| P4 Platform | 24-36 months | Open the forecast and grading APIs to other agri-tech; federated learning across FPOs; sowing-time crop-mix advisory (arXiv:2211.01951); index insurance built on our volatility model (arXiv:2503.24324) | Third parties building on the layer. At that point it is infrastructure, not an app. |


### What we deliberately do not do


- We do not buy or sell produce. The moment we take a position, we are a counterparty and our price advice is compromised. Neutrality is the asset.
- We do not lend from our own balance sheet. We originate and service; a regulated lender lends.
- We do not sell inputs. That is how advisory apps acquire the same conflict of interest as the commission agent.
- We do not expand to other states until Maharashtra is genuinely working. The problem statement is from the Government of Maharashtra and depth in one state beats breadth across ten - both for the judging and for the farmers.
- We do not sell individual farmer data. Ever. Aggregate insight to the state, nothing identifiable to anyone.



---

# 16. Appendices


## 16.1 The reading list, in priority order


If a team member reads only three things, make it the first three. All identifiers are arXiv unless stated.


| # | Reference | Why it matters to us |
|---|---|---|
| 1 | 1812.05173 - An Interpretable Produce Price Forecasting System for Small and Marginal Farmers in India | Closest published system to ours. Agmarknet sparsity, collaborative-filtering imputation, nearest-neighbour interpretability, uncertainty intervals. |
| 2 | 2604.06227 - A Benchmark of Classical and Deep Learning Models for Agricultural Commodity Price Forecasting | The humility paper. Persistence often wins; Time2Vec and Informer did not pay off; use Diebold-Mariano tests. |
| 3 | 2009.04171 - A Framework for Crop Price Forecasting in Emerging Economies (IBM Research) | Arrival volumes and data-quality features; context-based model selection and retraining triggers. |
| 4 | 2304.09761 - Deep Learning Based Approach for Accurate Agricultural Crop Price Prediction | GNN+CNN over the market graph; geospatial dependency gives large gains. |
| 5 | 2203.12395 - Favorit: farmers volatility risk treatment | Optimal selling timing for tomato, onion and coriander in Maharashtra specifically. Our nearest precedent. |
| 6 | 2503.24324 - Mitigating Financial Risk from Climate-Induced Agricultural Price Volatility | EGARCH + SARIMAX + option pricing with CMIP6. Our volatility model and the v2 insurance idea. |
| 7 | 2212.03281 - Copula Conformal Prediction for Multi-step Time Series Forecasting (ICLR 2024) | Valid multi-horizon intervals. The basis of our honest bands. |
| 8 | 2202.07282 - Adaptive Conformal Predictions for Time Series | Intervals that self-correct under distribution shift. |
| 9 | 2509.02844 - Conformal Prediction for Time-series Forecasting with Change Points | Handling export bans and policy shocks without lying to farmers. |
| 10 | 2307.16895 - Conformal PID Control for Time Series Prediction | Alternative online calibration approach; robust and simple. |
| 11 | 2507.08858 - Foundation models for time series forecasting: application in conformal prediction | Zero-shot cold start for sparse mandi-commodity pairs. |
| 12 | 1710.10515 - Toward Reducing Crop Spoilage and Increasing Small Farmer Profits in India | Cold storage plus price forecasting, piloted in India. Precedent for the storage+forecast combination. |
| 13 | 2601.11537 - Building AI-based advisory services for smallholder farmers (AIEP) | Field-validated IVR + WhatsApp + LLM-orchestration architecture, Kenya and Bihar, 800-farmer study. |
| 14 | 2602.03868 - Benchmarking ASR for Indian Languages in Agricultural Contexts | Domain-weighted error metric for agri voice. Use it instead of plain WER. |
| 15 | 2509.21535 - Agribot: agriculture-specific question answer system | Kisan Call Centre data as a corpus; entity and synonym normalisation lifted accuracy from 56% to 86%. |
| 16 | 2507.08832 - Hybrid ML Framework for Optimizing Crop Selection | Vernacular voice interface precedent (Kannada ASR/TTS) plus agronomic+economic forecasting. |
| 17 | 2211.01951 - Creating an Optimal Portfolio of Crops Using Price Forecasting | Sowing-time crop-mix advisory. Roadmap P4. |
| 18 | 2412.02057 - Comparative Analysis of Multi-Agent RL Policies for Crop Planning | Fairness as an explicit objective alongside income - relevant to the FPO split. |
| 19 | 2104.07468 and 2510.12727 - Cross-silo and hierarchical federated learning for agriculture | Privacy architecture for v2 with FPOs as natural silos. |
| 20 | Wikipedia: Farmers' suicides in India; Agricultural Produce Market Committee; National Agriculture Market; Minimum support price; Agriculture in Maharashtra; Maharashtra; ONDC; Bhashini; Post-harvest losses (vegetables) | Structural and statistical grounding for Chapters 02, 03 and 14. Trace each to its primary source before quoting in the pitch. |


## 16.2 Glossary for the team


| Term | Meaning |
|---|---|
| APMC | Agricultural Produce Market Committee - the statutory body running a regulated mandi. Only licensed traders may transact inside. |
| Mandi | A regulated wholesale agricultural market yard. |
| Commission agent / adatya | Intermediary who handles the farmer's lot inside the mandi for a commission. Often also an informal lender to the same farmer, which is the source of the conflict of interest. |
| MSAMB | Maharashtra State Agricultural Marketing Board - oversees APMCs in the state, roughly 295 of them. |
| MSP | Minimum Support Price - a floor announced for 23 commodities. Onion and tomato have none. |
| CACP | Commission for Agricultural Costs and Prices - recommends MSP. |
| eNAM | National Agriculture Market - the government electronic trading platform integrating mandis. |
| Agmarknet | Government portal publishing daily mandi prices and arrivals. |
| FPO | Farmer Producer Organisation - a registered collective of farmers enabling aggregation and collective bargaining. |
| e-NWR | Electronic Negotiable Warehouse Receipt - a transferable receipt for stored goods that can be pledged for credit. Regulated by WDRA. |
| WDRA | Warehousing Development and Regulatory Authority - registers warehouses and governs e-NWRs. |
| Pledge finance | A loan advanced against stored produce, secured by the warehouse receipt. |
| ONDC / Beckn | Open Network for Digital Commerce and its underlying protocol; unbundles buyer app, seller app, logistics and payments. |
| BAP / BPP | Beckn Application Platform (buyer side) and Beckn Provider Platform (seller side). |
| Bhashini | Government language-technology platform providing Indian-language ASR, TTS and translation. |
| AgriStack | Government digital agriculture stack including the farmer registry with land linkage. |
| Lot | A defined, gradable, tradable quantity of produce with recorded provenance. |
| Assay | A quality assessment of a lot producing a grade and an attribute vector. |
| Realisation | What the farmer actually receives per quintal, net of all deductions - not the headline price. |
| Counterfactual baseline | What the farmer would have received under the default behaviour - selling at the home mandi on harvest day. The comparison that makes a gain claim meaningful. |
| Conformal prediction | A distribution-free method for producing prediction intervals with finite-sample validity guarantees. |
| MASE | Mean Absolute Scaled Error - forecast error scaled by the naive baseline. Below 1 means you beat persistence. |
| Pinball loss | The loss function for quantile regression; what you optimise to get honest p10/p50/p90 forecasts. |
| Diebold-Mariano test | A statistical test for whether one forecast is significantly better than another. Report its p-value. |
| Winkler score | A proper scoring rule for interval forecasts, penalising both width and non-coverage. |


## 16.3 API contract sketch


```api-contract
GET  /v1/prices/{market_id}/{commodity_id}?days=30
     -> [{date, min, max, modal, arrivals, imputed:bool, source}]

GET  /v1/forecast/{market_id}/{commodity_id}?horizons=1,3,7,14,30
     -> {run_date, model_version, regime:"normal"|"shift"|"suspended",
         points:[{h, p10, p50, p90, p05, p95}],
         drivers:[{name, direction, magnitude}],
         precedents:[{date, market, similarity, outcome}],   # nearest-neighbour explanation
         coverage_last_90d:{nominal_80, empirical_80}}

POST /v1/window/evaluate
     {farmer_id, commodity_id, qty_qtl, harvest_date, storage_type,
      cash_need_amt, cash_need_by, risk_pref}
     -> {action, target_date, target_market_id, exp_gain_per_qtl, downside_per_qtl,
         confidence, cash_today, reason_mr, reason_en, rec_id,
         alternatives:[{action, net_p50, net_p10, feasible}]}

POST /v1/lots                 {commodity_id, variety, qty_qtl, harvest_date, geo, photos[]}
POST /v1/lots/{id}/assay      {tier, attributes, photos[]} -> {grade, attributes, confidence}
POST /v1/lots/{id}/pool       {parent_lot_id} -> {projected_share_pct, split_table[]}
POST /v1/lots/{id}/pool/consent  {farmer_id, accepted:bool} -> {consent_id, ts}

GET  /v1/matches/{lot_id}     -> [{demand_id, buyer:{name, tier, reliability, avg_days_to_pay,
                                   dispute_count, renegotiation_rate},
                                   price_per_qtl, distance_km, net_to_farmer, score}]
POST /v1/offers               {lot_id, demand_id, price_per_qtl, qty_qtl, terms}
POST /v1/offers/{id}/respond  {action:"accept"|"counter"|"reject", price_per_qtl?}

POST /v1/escrow/{txn_id}/fund      -> {state, payment_ref}
POST /v1/escrow/{txn_id}/inspect   {matches_assay:bool, claim?} -> {state}
POST /v1/disputes                  {txn_id, category, attributes[], evidence[], remedy}

POST /v1/credit/quote         {lot_id, tenor_days} -> {eligible_warehouses[], ltv, rate_pa,
                                                       net_cash_today, total_interest, lender}
POST /v1/credit/accept        {quote_id} -> {enwr_id, pledge_id, disbursement_ref}

GET  /v1/ledger/farmer/{id}   -> {entries[], total_gain, chain_verified:bool}
GET  /v1/ledger/district/{id} -> {farmers, txns, median_gain_per_qtl, total_gain,
                                  forecast_coverage, follow_rate}   # PUBLIC endpoint

POST /v1/voice/tts            {text_mr} -> audio
POST /v1/voice/asr            audio -> {text_mr, confidence, entities:{crop, qty, price}}

```


## 16.4 Pre-hackathon checklist


- data.gov.in API key obtained and tested
- Agmarknet ingester running, 3+ years, 40+ mandis, 5 commodities
- Canonical commodity-variety-market mapping table complete
- Imputation implemented, validated by masking, flags in the schema
- Data-quality report generated and turned into a slide
- Policy-event calendar for onion, 5 years, complete with dates
- M0 persistence baseline recorded per mandi-commodity-horizon
- M2 beating M0 with a Diebold-Mariano p-value recorded
- M5 conformal coverage measured against nominal at 80% and 95%
- M12 backtest complete; the headline rupees-per-quintal number known
- Grading dataset: 300-600 labelled images, collected by the team, at a real mandi
- Two FPO conversations done, with quotes and permission to use them
- Two warehouse rate cards confirmed by phone, e-NWR capability checked
- Marathi TTS working end to end; all demo lines pre-generated and cached locally
- IVR happy path completed on a real phone call
- Local mocks for every external API, toggled by environment variable
- Seeded database with realistic Maharashtra names and 6 months of transaction history
- One-command startup verified from a clean clone on two different laptops
- Fallback demo video recorded, subtitled, on two laptops and one phone
- Pitch rehearsed to time at least five times, including once with the demo deliberately broken
- Printed one-pager: causal chain, five pillars, headline number, PS coverage table
- Scope-cut order agreed in writing, so nobody debates it at hour 30


## 16.5 Final honesty note


> **WHAT THIS DOCUMENT IS AND IS NOT**  
> This is a strategy and engineering playbook, written with academic literature retrieved directly from arXiv and structural facts from open sources. It is NOT a verified data audit: live access to government portals was blocked from the authoring environment, so every endpoint, every count and every item marked [VERIFY] must be checked by your team in week 1. The judgement calls, architecture, model design, decision arithmetic and strategy are sound and defensible. The specific numbers in Chapter 07 and Chapter 14 are yours to establish. Do not put a number in front of a judge that you have not personally checked - and remember that the single most valuable number in this entire document, G, is one that no citation can give you. You have to measure it.


One last thing, on the motive you stated. The reason this playbook keeps insisting on honest uncertainty, on disclosed downside, on a hard cap on pledge credit, and on measuring realisation rather than claiming it, is that the people who will use this have no margin for a confident mistake. Build it so that a farmer who follows your advice and still loses knows exactly what they were risking before they chose. That is the difference between a product that helps and a product that merely means well.

