# -*- coding: utf-8 -*-
"""Chapters 13-16: risks, impact model, roadmap, appendices."""

def build(d, PDF=False):
    d.h1('Risks, and the Answer to Each','13')
    d.p('Bring this table into the room. When a judge raises a risk you have already written down and answered, you convert their scepticism into confidence in about four seconds.')

    d.h2('13.1 Technical risks')
    d.table(['Risk','Severity','Mitigation','What you say'],[
      ['Forecast accuracy insufficient to justify a hold','High','Beat persistence with a significance test; ship intervals not points; refuse to advise when confidence is low; measure realised outcomes','"We do not need to be right every time. We need to be right on average, honest about the spread, and to never let a farmer act on our confidence without cash in hand."'],
      ['Agmarknet data sparse or unreliable','High','Explicit imputation with flags; data-quality features; multi-source cross-check; minimum-history gate per mandi','"The literature documents this data as extremely sparse. We treat imputation as a first-class pipeline stage and we flag every imputed value to the model."'],
      ['Policy shock invalidates the model','Medium','Change-point detection, interval widening, advice suspension, a hand-built policy-event calendar','"An export ban is a regime change. We detect it and stop advising rather than being confidently wrong."'],
      ['Grading model unreliable on unseen varieties','Medium','Abstention, third-party assay override, per-stratum accuracy reporting','"The grader is an assist, never the authority. It is allowed to say it does not know."'],
      ['Herd effect from our own recommendations','Medium','Staggered recommendation dates; monitor share of catchment supply under advice; disclose crowding','"If enough farmers follow us we move the market, so we monitor our own footprint and diversify dates. Nobody asks us this, and we designed for it anyway."'],
      ['Scale and cost of ML serving','Low','Precompute nightly, cache hard, serve from Redis. Forecasts are per mandi-commodity, not per farmer','"There are hundreds of mandi-commodity pairs, not millions of users to model. Precomputation makes this cheap."'],
    ],[0.20,0.08,0.36,0.36],size=8.0)

    d.h2('13.2 Adoption and operational risks')
    d.table(['Risk','Severity','Mitigation','What you say'],[
      ['Farmers do not trust or use it','High','FPO-led onboarding; zero-install voice channel; show the downside so trust survives a bad outcome; publish our own hit rate','"Trust is earned by being right about what we do not know. We publish our misses."'],
      ['Traders and commission agents resist','High','Do not remove them, re-price them. A commission agent can register as a verified buyer or as an aggregation service provider and compete on reliability','"We are not trying to abolish the mandi. We are trying to make the mandi compete. Any trader who pays fast and grades fairly gains business on our platform."'],
      ['Warehouse capacity is genuinely unavailable','High','Map real capacity first; where absent, fall back to on-farm storage advisory plus spatial arbitrage instead of temporal; make capacity gaps visible to the state as an investment signal','"Where storage does not exist, our recommendation changes from wait to move, and the gap becomes a data point the department can act on."'],
      ['No lender will finance a smallholder pledge','High','e-NWR is a regulated instrument designed for exactly this; start with FPO-intermediated lending and cooperative banks; the Realisation Ledger builds the repayment history that de-risks it','"The instrument already exists and is under-used because nobody built the farmer journey. We are the journey. And our own ledger becomes the credit history that lowers the rate next season."'],
      ['Buyers will not use escrow','Medium','Tiered - escrow mandatory for new buyers, negotiable after a clean record. Escrow is the price of access to supply','"Escrow is how a new buyer buys credibility. Established buyers earn their way out of it."'],
      ['Government partnership does not materialise','Medium','Product works standalone with public data; the state integration improves it but is not load-bearing','"Nothing in the demo depends on an MoU. Government integration multiplies reach, it does not enable function."'],
      ['Team cannot finish in 36 hours','Medium','Eight weeks of pre-work; feature freeze at hour 28; scope cuts pre-decided in writing','"We decided in advance what we would drop, in what order, so we never debate scope at hour 30."'],
    ],[0.20,0.08,0.38,0.34],size=8.0)

    d.h2('13.3 Ethical and legal risks')
    d.table(['Risk','Mitigation'],[
      ['A farmer follows our advice and loses money','Downside disclosed before consent and recorded; consent captured as an audio recording on the IVR channel; overall hit rate published; no advice below a confidence threshold; the credit option means the farmer is not cash-exposed to our error. This is a real risk that cannot be eliminated, only made informed - say that plainly.'],
      ['Advice could be construed as financial or investment advice','Frame as decision support with explicit uncertainty, never a guarantee. Terms in Marathi. Take legal review before any real-money deployment. [VERIFY regulatory framing with a lawyer before pilot.]'],
      ['Farm data misused','Purpose limitation, explicit Marathi voice consent, no sale of individual farmer data ever, aggregate-only sharing with the state, and federated learning as the v2 architecture so raw data need not centralise.'],
      ['Pledge finance becomes a new debt trap','Hard caps on LTV and tenor; the advance is only ever offered against a recommendation whose expected net gain exceeds the finance cost; automatic repayment from sale proceeds so the debt cannot roll; refuse to offer credit where the expected gain does not cover interest. Write this rule into the code, not the terms and conditions.'],
      ['Algorithmic exclusion','Buyer score cold-start tier; grading abstention; per-district accuracy monitoring; no farmer is ever denied access to the platform based on a model output.'],
      ['Accessibility exclusion','Voice-first, four channels, and the rule that every money action is completable by voice alone.'],
    ],[0.30,0.70],size=8.4)
    d.callout('THE PLEDGE-CREDIT GUARDRAIL IS NOT OPTIONAL',
      'The entire moral case for this product is that it breaks a debt ratchet. If the credit feature is built carelessly it becomes '
      'another turn of the same ratchet. So the rule is absolute and lives in code: no advance is offered unless the expected net gain '
      'from waiting exceeds the total finance cost, and repayment is automatic from sale proceeds so the loan cannot be rolled over. '
      'A team that states this constraint unprompted demonstrates that it understood the problem statement\'s purpose, not just its features.',
      color=(0.55,0.13,0.13), bg=(0.995,0.95,0.95))

    # ============ CH 14 ============
    d.h1('The Impact Model: Arithmetic, Not Adjectives','14')
    d.p('Judges hear "we will transform Indian agriculture" all day. What they almost never hear is a defensible chain of arithmetic ending in a rupee figure, with every assumption labelled and every input sourced. Build the model, show the assumptions, and let them argue with the assumptions rather than with your credibility.')

    d.h2('14.1 The per-farmer model')
    d.code(
'INPUTS  (fill each with a verified or measured value - do not invent)\n'
'  A  onion area per smallholder                    ~0.6 ha    [VERIFY state avg]\n'
'  Y  yield                                          ~200 qtl/ha [VERIFY ICAR/state]\n'
'  Q  marketable quantity            = A * Y      =  ~120 qtl\n'
'  G  realisation gain per quintal    = FROM YOUR BACKTEST, not from a guess\n'
'  F  fraction of the crop actually held/routed on our advice  ~0.6\n'
'  C  finance + storage cost already netted inside G\n'
'\n'
'  Annual gain per farmer = Q * F * G\n'
'\n'
'  If your backtest yields G = Rs 120/qtl:\n'
'      120 qtl * 0.6 * 120 = Rs 8,640 per farmer per season\n'
'\n'
'  Context that makes this number mean something:\n'
'    - state average monthly agricultural household income is a low four-figure sum,\n'
'      so a four-figure seasonal gain is material, not marginal  [VERIFY from MoSPI SAS]\n'
'    - it is of the same order as an annual interest burden on a small\n'
'      non-institutional loan, which is precisely the debt this must break\n', label='per-farmer-model')
    d.callout('THE ONE RULE FOR THIS CHAPTER',
      'G must come from your own backtest over real Maharashtra data. Every other number in the chain can be a cited estimate with a range. '
      'G cannot, because G is the claim. If your backtest gives a disappointing G, report the honest G - a small, real, measured number '
      'is far more persuasive than a large invented one, and a judge who catches an invented number discards everything else you said.')

    d.h2('14.2 Scaling within Maharashtra')
    d.table(['Stage','Scope','Farmers','Basis','Annual gain at G = Rs 120/qtl'],[
      ['Pilot','3 talukas in the Nashik belt, 2-3 FPOs','1,500-3,000','FPO membership size and one district\'s onion grower base','Rs 1.3-2.6 crore'],
      ['District','Nashik district onion growers','50,000-80,000','[VERIFY district onion grower count from state agri dept]','Rs 43-69 crore'],
      ['Onion belt','Nashik, Ahmednagar, Pune, Solapur','200,000-350,000','[VERIFY]','Rs 170-300 crore'],
      ['5 crops, statewide','Onion, soybean, cotton, tomato, tur across Maharashtra','Several million cultivators; Maharashtra has a very large agricultural workforce and 43% marginal holdings','[VERIFY total cultivator count from Census/Agri Census]','Compute only after the pilot gives you a real G per crop - do not extrapolate a single crop\'s G across all five'],
    ],[0.12,0.28,0.13,0.25,0.22],size=8.2)
    d.p('Present the pilot number as the promise and the larger numbers as arithmetic consequences, explicitly labelled as extrapolations. The credibility comes from refusing to present an extrapolation as a projection.')

    d.h2('14.3 The non-monetary outcomes, mapped to the PS')
    d.table(['PS expected outcome','Our measurable indicator','How measured'],[
      ['improved price realisation for farmers','Rupees per quintal above the counterfactual baseline','Realisation Ledger, per transaction'],
      ['reduced information asymmetry','Share of transactions where the farmer had a forecast before selling; forecast accuracy published publicly','Platform telemetry plus the public dashboard'],
      ['lower transaction cost','Total deductions as a share of gross, versus the mandi-route baseline','Transaction records with an itemised cost breakdown'],
      ['stronger FPO level aggregation','Average pooled lot size; number of members per pooled lot; FPO retention across seasons','Pooling records and consent logs'],
      ['reduced post harvest loss','Share of lots routed to a grade-appropriate buyer instead of discarded; measured spoilage on held lots','Lot outcomes plus grade-routing records'],
      ['more reliable buyer sourcing','Buyer-side fill rate against posted demand; grade-conformance rate on delivery','Demand and delivery records'],
      ['transparent transaction records','Share of transactions with a complete hash-chained record and a farmer-downloadable statement','The ledger itself'],
    ],[0.28,0.40,0.32],size=8.4)

    d.h2('14.4 The outcome behind the outcome')
    d.p('Handle this once, precisely, and without decoration. NCRB recorded 4,248 farmer suicides in Maharashtra in 2022, the highest of any state, and the literature identifies debt as the most consistent contributing factor, with one study finding that cash crops, holdings under one hectare and indebtedness together explained around 75 percent of state-level variation.')
    d.p('The honest claim is not that a software platform prevents suicides. The honest claim is narrower and stronger: the mechanism our product attacks - forced distress sale that prevents debt from clearing - is the same mechanism the literature identifies as the pathway from a bad harvest to an unpayable debt. Improving realisation and providing a non-predatory bridge loan operates directly on that pathway. Say exactly that, and no more. Overclaiming here is both ethically wrong and tactically fatal in a room of Maharashtra officials.')

    # ============ CH 15 ============
    d.h1('Roadmap Beyond the Hackathon','15')
    d.table(['Phase','Timeline','Scope','Success gate'],[
      ['P0 Hackathon prototype','Now','Onion, Nashik belt. Pillars 1, 2, 5 deep; 3, 4 working','Win. Then get a named contact in the department.'],
      ['P1 Pilot','3-6 months','2-3 FPOs, 1,500-3,000 farmers, real transactions, real pledge finance with one cooperative bank or NBFC','Measured G above zero on real transactions, over at least one full harvest cycle. Publish it honestly whatever it is.'],
      ['P2 District','6-12 months','Nashik district, onion plus soybean. eNAM integration live. e-NWR at scale with 10+ warehouses','Repayment rate on pledge advances above 95%; forecast coverage within 5 points of nominal'],
      ['P3 State','12-24 months','5 crops, statewide, integrated with MSAMB and the state agri department as market infrastructure. Beckn-compliant BPP live on ONDC','District dashboards used by the department for actual policy decisions - that is the real adoption signal, not user counts'],
      ['P4 Platform','24-36 months','Open the forecast and grading APIs to other agri-tech; federated learning across FPOs; sowing-time crop-mix advisory (arXiv:2211.01951); index insurance built on our volatility model (arXiv:2503.24324)','Third parties building on the layer. At that point it is infrastructure, not an app.'],
    ],[0.14,0.12,0.44,0.30],size=8.2)
    d.h3('What we deliberately do not do')
    d.bul([
      'We do not buy or sell produce. The moment we take a position, we are a counterparty and our price advice is compromised. Neutrality is the asset.',
      'We do not lend from our own balance sheet. We originate and service; a regulated lender lends.',
      'We do not sell inputs. That is how advisory apps acquire the same conflict of interest as the commission agent.',
      'We do not expand to other states until Maharashtra is genuinely working. The problem statement is from the Government of Maharashtra and depth in one state beats breadth across ten - both for the judging and for the farmers.',
      'We do not sell individual farmer data. Ever. Aggregate insight to the state, nothing identifiable to anyone.',
    ])

    # ============ CH 16 ============
    d.h1('Appendices','16')
    d.h2('16.1 The reading list, in priority order')
    d.p('If a team member reads only three things, make it the first three. All identifiers are arXiv unless stated.')
    d.table(['#','Reference','Why it matters to us'],[
      ['1','1812.05173 - An Interpretable Produce Price Forecasting System for Small and Marginal Farmers in India','Closest published system to ours. Agmarknet sparsity, collaborative-filtering imputation, nearest-neighbour interpretability, uncertainty intervals.'],
      ['2','2604.06227 - A Benchmark of Classical and Deep Learning Models for Agricultural Commodity Price Forecasting','The humility paper. Persistence often wins; Time2Vec and Informer did not pay off; use Diebold-Mariano tests.'],
      ['3','2009.04171 - A Framework for Crop Price Forecasting in Emerging Economies (IBM Research)','Arrival volumes and data-quality features; context-based model selection and retraining triggers.'],
      ['4','2304.09761 - Deep Learning Based Approach for Accurate Agricultural Crop Price Prediction','GNN+CNN over the market graph; geospatial dependency gives large gains.'],
      ['5','2203.12395 - Favorit: farmers volatility risk treatment','Optimal selling timing for tomato, onion and coriander in Maharashtra specifically. Our nearest precedent.'],
      ['6','2503.24324 - Mitigating Financial Risk from Climate-Induced Agricultural Price Volatility','EGARCH + SARIMAX + option pricing with CMIP6. Our volatility model and the v2 insurance idea.'],
      ['7','2212.03281 - Copula Conformal Prediction for Multi-step Time Series Forecasting (ICLR 2024)','Valid multi-horizon intervals. The basis of our honest bands.'],
      ['8','2202.07282 - Adaptive Conformal Predictions for Time Series','Intervals that self-correct under distribution shift.'],
      ['9','2509.02844 - Conformal Prediction for Time-series Forecasting with Change Points','Handling export bans and policy shocks without lying to farmers.'],
      ['10','2307.16895 - Conformal PID Control for Time Series Prediction','Alternative online calibration approach; robust and simple.'],
      ['11','2507.08858 - Foundation models for time series forecasting: application in conformal prediction','Zero-shot cold start for sparse mandi-commodity pairs.'],
      ['12','1710.10515 - Toward Reducing Crop Spoilage and Increasing Small Farmer Profits in India','Cold storage plus price forecasting, piloted in India. Precedent for the storage+forecast combination.'],
      ['13','2601.11537 - Building AI-based advisory services for smallholder farmers (AIEP)','Field-validated IVR + WhatsApp + LLM-orchestration architecture, Kenya and Bihar, 800-farmer study.'],
      ['14','2602.03868 - Benchmarking ASR for Indian Languages in Agricultural Contexts','Domain-weighted error metric for agri voice. Use it instead of plain WER.'],
      ['15','2509.21535 - Agribot: agriculture-specific question answer system','Kisan Call Centre data as a corpus; entity and synonym normalisation lifted accuracy from 56% to 86%.'],
      ['16','2507.08832 - Hybrid ML Framework for Optimizing Crop Selection','Vernacular voice interface precedent (Kannada ASR/TTS) plus agronomic+economic forecasting.'],
      ['17','2211.01951 - Creating an Optimal Portfolio of Crops Using Price Forecasting','Sowing-time crop-mix advisory. Roadmap P4.'],
      ['18','2412.02057 - Comparative Analysis of Multi-Agent RL Policies for Crop Planning','Fairness as an explicit objective alongside income - relevant to the FPO split.'],
      ['19','2104.07468 and 2510.12727 - Cross-silo and hierarchical federated learning for agriculture','Privacy architecture for v2 with FPOs as natural silos.'],
      ['20','Wikipedia: Farmers\' suicides in India; Agricultural Produce Market Committee; National Agriculture Market; Minimum support price; Agriculture in Maharashtra; Maharashtra; ONDC; Bhashini; Post-harvest losses (vegetables)','Structural and statistical grounding for Chapters 02, 03 and 14. Trace each to its primary source before quoting in the pitch.'],
    ],[0.04,0.34,0.62],size=7.8)

    d.h2('16.2 Glossary for the team')
    d.table(['Term','Meaning'],[
      ['APMC','Agricultural Produce Market Committee - the statutory body running a regulated mandi. Only licensed traders may transact inside.'],
      ['Mandi','A regulated wholesale agricultural market yard.'],
      ['Commission agent / adatya','Intermediary who handles the farmer\'s lot inside the mandi for a commission. Often also an informal lender to the same farmer, which is the source of the conflict of interest.'],
      ['MSAMB','Maharashtra State Agricultural Marketing Board - oversees APMCs in the state, roughly 295 of them.'],
      ['MSP','Minimum Support Price - a floor announced for 23 commodities. Onion and tomato have none.'],
      ['CACP','Commission for Agricultural Costs and Prices - recommends MSP.'],
      ['eNAM','National Agriculture Market - the government electronic trading platform integrating mandis.'],
      ['Agmarknet','Government portal publishing daily mandi prices and arrivals.'],
      ['FPO','Farmer Producer Organisation - a registered collective of farmers enabling aggregation and collective bargaining.'],
      ['e-NWR','Electronic Negotiable Warehouse Receipt - a transferable receipt for stored goods that can be pledged for credit. Regulated by WDRA.'],
      ['WDRA','Warehousing Development and Regulatory Authority - registers warehouses and governs e-NWRs.'],
      ['Pledge finance','A loan advanced against stored produce, secured by the warehouse receipt.'],
      ['ONDC / Beckn','Open Network for Digital Commerce and its underlying protocol; unbundles buyer app, seller app, logistics and payments.'],
      ['BAP / BPP','Beckn Application Platform (buyer side) and Beckn Provider Platform (seller side).'],
      ['Bhashini','Government language-technology platform providing Indian-language ASR, TTS and translation.'],
      ['AgriStack','Government digital agriculture stack including the farmer registry with land linkage.'],
      ['Lot','A defined, gradable, tradable quantity of produce with recorded provenance.'],
      ['Assay','A quality assessment of a lot producing a grade and an attribute vector.'],
      ['Realisation','What the farmer actually receives per quintal, net of all deductions - not the headline price.'],
      ['Counterfactual baseline','What the farmer would have received under the default behaviour - selling at the home mandi on harvest day. The comparison that makes a gain claim meaningful.'],
      ['Conformal prediction','A distribution-free method for producing prediction intervals with finite-sample validity guarantees.'],
      ['MASE','Mean Absolute Scaled Error - forecast error scaled by the naive baseline. Below 1 means you beat persistence.'],
      ['Pinball loss','The loss function for quantile regression; what you optimise to get honest p10/p50/p90 forecasts.'],
      ['Diebold-Mariano test','A statistical test for whether one forecast is significantly better than another. Report its p-value.'],
      ['Winkler score','A proper scoring rule for interval forecasts, penalising both width and non-coverage.'],
    ],[0.20,0.80],size=8.2)

    d.h2('16.3 API contract sketch')
    d.code(
'GET  /v1/prices/{market_id}/{commodity_id}?days=30\n'
'     -> [{date, min, max, modal, arrivals, imputed:bool, source}]\n'
'\n'
'GET  /v1/forecast/{market_id}/{commodity_id}?horizons=1,3,7,14,30\n'
'     -> {run_date, model_version, regime:"normal"|"shift"|"suspended",\n'
'         points:[{h, p10, p50, p90, p05, p95}],\n'
'         drivers:[{name, direction, magnitude}],\n'
'         precedents:[{date, market, similarity, outcome}],   # nearest-neighbour explanation\n'
'         coverage_last_90d:{nominal_80, empirical_80}}\n'
'\n'
'POST /v1/window/evaluate\n'
'     {farmer_id, commodity_id, qty_qtl, harvest_date, storage_type,\n'
'      cash_need_amt, cash_need_by, risk_pref}\n'
'     -> {action, target_date, target_market_id, exp_gain_per_qtl, downside_per_qtl,\n'
'         confidence, cash_today, reason_mr, reason_en, rec_id,\n'
'         alternatives:[{action, net_p50, net_p10, feasible}]}\n'
'\n'
'POST /v1/lots                 {commodity_id, variety, qty_qtl, harvest_date, geo, photos[]}\n'
'POST /v1/lots/{id}/assay      {tier, attributes, photos[]} -> {grade, attributes, confidence}\n'
'POST /v1/lots/{id}/pool       {parent_lot_id} -> {projected_share_pct, split_table[]}\n'
'POST /v1/lots/{id}/pool/consent  {farmer_id, accepted:bool} -> {consent_id, ts}\n'
'\n'
'GET  /v1/matches/{lot_id}     -> [{demand_id, buyer:{name, tier, reliability, avg_days_to_pay,\n'
'                                   dispute_count, renegotiation_rate},\n'
'                                   price_per_qtl, distance_km, net_to_farmer, score}]\n'
'POST /v1/offers               {lot_id, demand_id, price_per_qtl, qty_qtl, terms}\n'
'POST /v1/offers/{id}/respond  {action:"accept"|"counter"|"reject", price_per_qtl?}\n'
'\n'
'POST /v1/escrow/{txn_id}/fund      -> {state, payment_ref}\n'
'POST /v1/escrow/{txn_id}/inspect   {matches_assay:bool, claim?} -> {state}\n'
'POST /v1/disputes                  {txn_id, category, attributes[], evidence[], remedy}\n'
'\n'
'POST /v1/credit/quote         {lot_id, tenor_days} -> {eligible_warehouses[], ltv, rate_pa,\n'
'                                                       net_cash_today, total_interest, lender}\n'
'POST /v1/credit/accept        {quote_id} -> {enwr_id, pledge_id, disbursement_ref}\n'
'\n'
'GET  /v1/ledger/farmer/{id}   -> {entries[], total_gain, chain_verified:bool}\n'
'GET  /v1/ledger/district/{id} -> {farmers, txns, median_gain_per_qtl, total_gain,\n'
'                                  forecast_coverage, follow_rate}   # PUBLIC endpoint\n'
'\n'
'POST /v1/voice/tts            {text_mr} -> audio\n'
'POST /v1/voice/asr            audio -> {text_mr, confidence, entities:{crop, qty, price}}\n', label='api-contract')

    d.h2('16.4 Pre-hackathon checklist')
    d.bul([
      'data.gov.in API key obtained and tested',
      'Agmarknet ingester running, 3+ years, 40+ mandis, 5 commodities',
      'Canonical commodity-variety-market mapping table complete',
      'Imputation implemented, validated by masking, flags in the schema',
      'Data-quality report generated and turned into a slide',
      'Policy-event calendar for onion, 5 years, complete with dates',
      'M0 persistence baseline recorded per mandi-commodity-horizon',
      'M2 beating M0 with a Diebold-Mariano p-value recorded',
      'M5 conformal coverage measured against nominal at 80% and 95%',
      'M12 backtest complete; the headline rupees-per-quintal number known',
      'Grading dataset: 300-600 labelled images, collected by the team, at a real mandi',
      'Two FPO conversations done, with quotes and permission to use them',
      'Two warehouse rate cards confirmed by phone, e-NWR capability checked',
      'Marathi TTS working end to end; all demo lines pre-generated and cached locally',
      'IVR happy path completed on a real phone call',
      'Local mocks for every external API, toggled by environment variable',
      'Seeded database with realistic Maharashtra names and 6 months of transaction history',
      'One-command startup verified from a clean clone on two different laptops',
      'Fallback demo video recorded, subtitled, on two laptops and one phone',
      'Pitch rehearsed to time at least five times, including once with the demo deliberately broken',
      'Printed one-pager: causal chain, five pillars, headline number, PS coverage table',
      'Scope-cut order agreed in writing, so nobody debates it at hour 30',
    ])

    d.h2('16.5 Final honesty note')
    d.callout('WHAT THIS DOCUMENT IS AND IS NOT',
      'This is a strategy and engineering playbook, written with academic literature retrieved directly from arXiv and structural facts '
      'from open sources. It is NOT a verified data audit: live access to government portals was blocked from the authoring environment, '
      'so every endpoint, every count and every item marked [VERIFY] must be checked by your team in week 1. '
      'The judgement calls, architecture, model design, decision arithmetic and strategy are sound and defensible. '
      'The specific numbers in Chapter 07 and Chapter 14 are yours to establish. '
      'Do not put a number in front of a judge that you have not personally checked - and remember that the single most valuable number '
      'in this entire document, G, is one that no citation can give you. You have to measure it.',
      color=(0.055,0.29,0.20), bg=(0.93,0.97,0.94))
    d.p('One last thing, on the motive you stated. The reason this playbook keeps insisting on honest uncertainty, on disclosed downside, on a hard cap on pledge credit, and on measuring realisation rather than claiming it, is that the people who will use this have no margin for a confident mistake. Build it so that a farmer who follows your advice and still loses knows exactly what they were risking before they chose. That is the difference between a product that helps and a product that merely means well.')
    return d
