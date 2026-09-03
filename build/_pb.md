

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
| Comparative Analysis of Multi-Agent RL Policies for Crop Planning Decision Support | 2412.02057 | Independent Q-learning vs agent-by-agent sequential optimisation vs multi-agent rollout, scored on total farmer income, FAIRNESS and runtime. | LESSON: fairness as an explicit objective alongside income - directly relevant to our FPO split ledger. |
| Copula Conformal Prediction for Multi-step Time Series Forecasting (ICLR 2024) | 2212.03281 | Models temporal dependency across the forecast horizon with a copula, giving finite-sample-valid multi-step intervals. | LESSON: this is how we produce honest 14-day price bands instead of fake point forecasts. See also Conformal PID Control (2307.16895) and Adaptive Conformal Predictions for Time Series (2202.07282), which handle distribution shift online. |
| Conformal Prediction for Time-series Forecasting with Change Points | 2509.02844 | Pairs a latent state predictor with online conformal prediction to handle abrupt regime shifts. | LESSON: export bans and policy shocks ARE change points. This is the technique that keeps our intervals honest through an onion export ban. |
| Foundation models for time series forecasting: application in conformal prediction | 2507.08858 | Benchmarks zero-shot time-series foundation models against statistical and gradient-boosting baselines inside a split-conformal setup. | LESSON: a zero-shot foundation model can cover the cold-start problem for a mandi-commodity pair with almost no history. Strong demo talking point. |
| A causal analysis of TSFM behaviour (in the TSFM search results) | see 3.2 note | Testing Chronos-2 and TimesFM-2.5 on six synthetic pattern types found safe use only for trend and harmonic oscillation, a shared bias toward overestimating persistence, and outright failure on REGIME SWITCHES. | LESSON: do not trust a foundation model through a policy shock. Gate it. This is a sophisticated point that will impress a technical judge. |
| Cross-silo / hierarchical federated learning for agriculture | 2104.07468, 2510.12727 | Cross-silo FL over decentralised supply-chain data for yield prediction; hierarchical FL with farm, crop-cluster and global layers. | LESSON: FPOs are natural federated silos. A credible privacy story for v2 without shipping raw farmer data centrally. |


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

