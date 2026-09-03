# -*- coding: utf-8 -*-
"""Chapters 04-05: solution thesis, system architecture."""

def build(d, PDF=False):
    d.h1('The Solution: Mandi-Setu','04')
    d.h2('4.1 The one sentence')
    d.callout('MANDI-SETU',
      'A Maharashtra-scoped market intelligence and transaction layer that tells a farmer WHEN to sell, '
      'FINANCES their ability to wait, AGGREGATES their lot for bargaining power, GRADES it so it can be sold at distance, '
      'GUARANTEES the payment, and then PROVES on a public ledger how many rupees per quintal the farmer actually gained.',
      color=(0.055,0.29,0.20), bg=(0.93,0.97,0.94))
    d.p('"Setu" means bridge. The name says the product: a bridge between the farmer and the price that already exists somewhere in the market but is currently unreachable.')
    d.p('The reason to write the sentence this way is that it contains a verb the competition will not have: FINANCES. Every other team will build the first clause. The second clause is the moat.')

    d.h2('4.2 The five pillars')
    d.table(['#','Pillar','What it is','Which loss mechanism it kills','PS phrase satisfied'],[
      ['1','Price Intelligence Engine','Multi-horizon (1/3/7/14/30-day) price forecasts per mandi-commodity pair with calibrated uncertainty bands, arrival-volume forecasts, and a plain-Marathi explanation of the drivers','M1 information asymmetry','"localised price trends", "expected prices", "aggregates mandi prices ... arrival volumes"'],
      ['2','Sale Window Engine + Pledge Credit','Converts the forecast into a HOLD/SELL decision that nets out storage cost, spoilage risk, finance cost and the farmer\'s own cash need; when it says HOLD, it simultaneously offers an e-NWR-backed advance so the farmer gets cash today','M2 liquidity coercion, M4 physical loss','"sale window recommendations", "storage options", "reduced post harvest loss"'],
      ['3','Lot, Grade and Aggregation Layer','Digital lot creation, phone-camera plus rule-based grading against declared buyer specs, FPO pooling with a grade-weighted fair-split ledger','M3 fragmentation, M4 physical loss','"enable lot creation, quality grading", "stronger FPO level aggregation", "quality requirements"'],
      ['4','Verified Buyer Marketplace + Settlement','Tiered buyer verification, a payment-reliability score from settled on-platform trades, digital offers and counter-offers, logistics matching, escrow/assured payment, and structured dispute resolution','M5 counterparty risk','"matches farmers/FPOs with verified buyers", "digital offers, logistics coordination and payment tracking", "dispute or grievance handling"'],
      ['5','Realisation Ledger','A per-transaction record of what the farmer received versus the counterfactual baseline (same-day default-mandi modal price), aggregated into a public district-level dashboard of rupees gained','THE PROOF LAYER - makes every other pillar accountable','"improved price realisation for farmers", "transparent transaction records"'],
    ],[0.04,0.16,0.36,0.22,0.22])
    d.p('Pillar 5 is the one nobody else will build, and it is the one that most directly answers the problem statement\'s stated outcome. An expected outcome that reads "improved price realisation for farmers" is an invitation to measure it. Most teams will treat it as an aspiration. Treat it as a metric with a number next to it and you separate yourself in the first two minutes.')

    d.h2('4.3 The wedge: what we build first and why')
    d.p('You cannot build five pillars in 36 hours, and you should not claim to. Pick a wedge that is (a) fully demonstrable, (b) contains the non-obvious insight, and (c) has an honest roadmap to the rest.')
    d.callout('THE WEDGE',
      'ONION, in the Nashik-Ahmednagar-Pune belt, with Lasalgaon as the anchor mandi. '
      'Full depth on Pillars 1, 2 and 5 - forecast, hold-or-sell with pledge finance, and the realisation ledger. '
      'Working but shallower demos of Pillars 3 and 4 - lot creation, grading, buyer offers, escrow state machine. '
      'Then a credible expansion plan: soybean, cotton, tomato, tur.')
    d.h3('Why onion is the correct wedge - have these six reasons ready')
    d.num([
      'Highest volatility of any major Indian commodity, which means the sale-window decision has the largest rupee consequence. Where volatility is low, timing advice is worth little; where it is extreme, timing advice is worth more than any other feature.',
      'Storable for weeks to months in a well-ventilated chawl, unlike tomato. This makes HOLD a physically real option, which is a precondition for the pledge-credit loop to mean anything.',
      'Lasalgaon is Asia\'s largest onion market and is in Maharashtra. The geography of the problem statement and the geography of the crop coincide exactly.',
      'Onion has no MSP, so there is no government floor. The entire price outcome is determined by market timing and market access - precisely the variables we control. On a crop with strong MSP procurement, our marginal contribution would be smaller.',
      'Policy shocks are frequent and well documented: export bans, minimum export prices, stock limits. This lets us demonstrate the sophisticated part of our ML story - regime-change detection and honest widening of uncertainty bands instead of a confidently wrong forecast.',
      'It is politically legible. Onion price distress in Nashik is a story every Maharashtra official knows. You are not explaining the problem to the judges, you are showing them a solution to a problem they already lose sleep over.',
    ])
    d.h3('Ordered expansion after onion')
    d.table(['Order','Crop','Why next','Extra capability required'],[
      ['2','Soybean','Largest kharif crop by area in Maharashtra, well-behaved storable commodity, strong processor demand for crushing','MSP interaction, moisture-based grading, NCDEX futures curve as a forecast feature'],
      ['3','Cotton','Vidarbha, the highest-distress region; the crop most associated with the outcome we are trying to prevent','CCI procurement integration, staple-length and micronaire grading, ginning-mill demand'],
      ['4','Tomato','Extreme volatility, high visibility, tests the hard case','Perishability model - HOLD is mostly unavailable, so the engine must pivot to spatial arbitrage and processor routing instead of temporal arbitrage'],
      ['5','Tur / arhar','Pulses are the documented MSP losers, so information value is high','Pulses procurement rules, NAFED integration'],
    ],[0.06,0.12,0.48,0.34])

    d.h2('4.4 What makes this unique - the four defensible claims')
    d.p('When a judge asks "how is this different", do not answer with features. Answer with these four, in this order.')
    d.kv([
      ('1. The credit-coupled recommendation','No other agri price platform bundles a HOLD advisory with the working capital that makes HOLD possible. We treat advice without liquidity as a defect, not a product. This is the single strongest differentiator and it should be the first thing you say.'),
      ('2. The Realisation Ledger','We are the only team that will measure, per transaction, the rupees the farmer gained against an explicit counterfactual baseline, and publish it. It converts our claim from a promise into an audited number and it gives the state a policy instrument it does not currently have.'),
      ('3. Honest uncertainty','We ship calibrated prediction intervals via conformal prediction with change-point handling, not point forecasts. When we do not know, we say so and widen the band. A confidently wrong forecast that persuades a farmer to hold through a crash is a harm, and we are the team that designed against that harm rather than ignoring it.'),
      ('4. Grade-differentiated routing','Quality is a routing key, not a pass/fail gate. Every kilogram is sent to its highest-value buyer tier - fresh retail, wholesale, processor, dehydration - so the produce that other platforms record as loss becomes revenue.'),
    ],kw=0.30)
    d.callout('THE ETHICAL POSITION - SAY THIS OUT LOUD IN THE PITCH',
      'Our recommendations move real money for people with no margin for error. So we built three guardrails into the product itself: '
      '(1) we never recommend HOLD without a cash alternative; (2) we never show a point forecast without its uncertainty band; '
      '(3) we compute and display, for every recommendation, the worst-case outcome as well as the expected one. '
      'A farmer who follows our advice and loses must have known the downside before they chose it. '
      'A team that says this signals it understands the stakes of the problem statement, not just its requirements.',
      color=(0.55,0.13,0.13), bg=(0.995,0.95,0.95))

    d.h2('4.5 The complete feature map against the problem statement')
    d.p('Print this table. Put it on a slide. It is the single most persuasive artifact you can show a government evaluator because it proves you read their words rather than pattern-matched their theme.')
    d.table(['PS requirement (verbatim)','Our feature','Status at hackathon'],[
      ['aggregates mandi prices','Agmarknet + eNAM ingestion, normalised to a commodity-variety-market-grade schema','Live, historical + daily'],
      ['buyer demand','Buyer demand-posting module: commodity, grade spec, quantity, window, indicative price','Working with seeded buyers'],
      ['quality requirements','Structured spec per buyer per commodity; grading assay compared against spec','Working, 5 dimensions for onion'],
      ['arrival volumes','Arrival series ingested and forecast alongside price; used as a feature and shown to the farmer','Live'],
      ['transport options','Transporter registry with route, capacity, rate card; cost estimator per lot per destination','Working, seeded data'],
      ['storage options','Warehouse registry with capacity, rate, distance, e-NWR capability flag','Working, seeded data'],
      ['localised price trends','Per-mandi 30-day history plus multi-horizon forecast with bands, in Marathi, voice-readable','Live'],
      ['sale window recommendations','Sale Window Engine: net-of-cost hold-vs-sell with expected gain, downside and confidence','Live - the centrepiece'],
      ['matches farmers/FPOs with verified buyers','Matching on grade fit, price, distance, buyer reliability score and settlement capability','Live'],
      ['enable lot creation','Lot object with provenance, quantity, grade assay, photos, farmer/FPO owner, QR code','Live'],
      ['quality grading','Rule-based scoring on measured attributes + phone-camera CV assist + optional third-party assay','Working; CV as assist, not authority'],
      ['digital offers','Offer/counter-offer state machine with expiry and audit trail','Live'],
      ['logistics coordination','Truck matching and shared-load pooling across nearby lots','Working'],
      ['payment tracking','Escrow state machine, UPI/RTGS references, days-to-pay tracked into the buyer reliability score','Working'],
      ['dispute or grievance handling','Structured dispute flow with evidence attachment, tiered escalation, ODR hook, SLA clock','Working'],
      ['improved price realisation','Realisation Ledger with counterfactual baseline, per farmer and per district','Live - and backtested'],
      ['reduced information asymmetry','Public district dashboard: forecast accuracy, realised prices, buyer reliability - open to all, not just users','Live'],
      ['lower transaction cost','Cost breakdown per transaction versus mandi-route baseline including commission, mandi fee, transport, waiting time','Live'],
      ['stronger FPO aggregation','Pooling with grade-weighted fair-split ledger visible before consent','Live'],
      ['reduced post-harvest loss','Grade-differentiated routing + storage recommendation + spoilage-risk model in the hold decision','Live'],
      ['more reliable buyer sourcing','Buyer-side view: aggregated forward supply from committed lots, with grade distribution','Working'],
      ['transparent transaction records','Append-only hash-chained transaction log, farmer-downloadable statement, exportable for PM-AASHA proof','Live'],
    ],[0.28,0.50,0.22],size=8.0)

    # ================= CH 5 =================
    d.h1('System Architecture','05')
    d.h2('5.1 Design principles, and the reasons behind them')
    d.kv([
      ('Offline-first on the farmer side','Rural Maharashtra connectivity is intermittent. The farmer app must render the last-known forecast, allow lot creation and queue offer responses with no network, then sync. Judges notice this because most teams assume 4G in an auditorium.'),
      ('Voice-first, text-second','Maharashtra female literacy is about 75 percent versus 89 percent male (Wikipedia, Maharashtra), and functional literacy for reading a price chart is lower still. Marathi voice is not an accessibility checkbox, it is the primary interface.'),
      ('Read-heavy, cache-hard','Thousands of farmers read the same mandi-commodity forecast. Precompute nightly, serve from cache, and your API cost and latency both collapse. This also means the demo cannot fail on a slow model call.'),
      ('Every recommendation is auditable','Store the model version, the feature vector, the interval and the decision for every recommendation served. When a farmer disputes advice or a judge asks "why did it say that", you can answer exactly. This is also your regulatory story.'),
      ('Integrate, do not rebuild','Consume Agmarknet, eNAM, e-NWR, UPI, Bhashini, AgriStack and ONDC/Beckn rather than reinventing them. Government judges reward alignment with public digital infrastructure and penalise parallel silos.'),
      ('Degrade gracefully, never confidently','If the model is unavailable, show yesterday\'s forecast with its date. If a mandi has no history, say "insufficient data" instead of guessing. A blank honest state beats a filled dishonest one.'),
    ],kw=0.26)

    d.h2('5.2 Service topology')
    d.code(
'                        FARMER SURFACES                         BUYER / FPO SURFACES\n'
'   +--------------------------------------------+   +----------------------------------+\n'
'   | Android app (Kotlin/Flutter, offline-first)|   | Web dashboard (Next.js)          |\n'
'   | IVR / voice bot (Marathi, Bhashini ASR/TTS)|   |  - post demand + grade spec      |\n'
'   | WhatsApp bot (Cloud API templates)         |   |  - browse lots, make offers      |\n'
'   | SMS fallback (price + window, 160 chars)   |   |  - forward supply view           |\n'
'   +--------------------------------------------+   +----------------------------------+\n'
'                        |                                          |\n'
'                        +--------------------+---------------------+\n'
'                                             v\n'
'                             +-------------------------------+\n'
'                             |  API GATEWAY (FastAPI)        |\n'
'                             |  authn/z, rate limit, i18n,   |\n'
'                             |  audit log, request tracing   |\n'
'                             +-------------------------------+\n'
'                                             |\n'
'   +-----------+-----------+-----------+-----+-----+-----------+-----------+----------+\n'
'   v           v           v           v           v           v           v          v\n'
'+--------+ +--------+ +---------+ +---------+ +---------+ +---------+ +--------+ +---------+\n'
'|price-  | |window- | |lot &    | |match-   | |settle-  | |logi-    | |credit- | |ledger-  |\n'
'|svc     | |svc     | |grade-svc| |ing-svc  | |ment-svc | |stics-svc| |svc     | |svc      |\n'
'|        | |        | |         | |         | |         | |         | |        | |         |\n'
'|forecast| |hold vs | |lot CRUD | |lot<->   | |escrow   | |truck    | |e-NWR   | |realisa- |\n'
'|serving,| |sell,   | |grading  | |demand   | |state    | |match,   | |pledge, | |tion vs  |\n'
'|bands,  | |net-cost| |assay,   | |scoring, | |machine, | |shared   | |lender  | |counter- |\n'
'|drivers | |arith-  | |FPO pool | |ranking  | |UPI/RTGS,| |load,    | |API,    | |factual, |\n'
'|        | |metic   | |split    | |         | |disputes | |cost est | |repay   | |dashboard|\n'
'+--------+ +--------+ +---------+ +---------+ +---------+ +---------+ +--------+ +---------+\n'
'      |          |          |           |          |           |          |         |\n'
'      +----------+----------+-----------+----+-----+-----------+----------+---------+\n'
'                                             v\n'
'      +---------------------------+  +---------------------+  +---------------------+\n'
'      | PostgreSQL + TimescaleDB  |  | Redis               |  | Object store (S3)   |\n'
'      | prices, arrivals, lots,   |  | forecast cache,     |  | lot photos, assay   |\n'
'      | offers, txns, ledger,     |  | session, rate limit,|  | images, model        |\n'
'      | audit (append-only)       |  | job queue           |  | artifacts, exports  |\n'
'      +---------------------------+  +---------------------+  +---------------------+\n'
'                                             ^\n'
'                                             |\n'
'      +----------------------------------------------------------------------+\n'
'      |  DATA + ML PLANE (Airflow/Prefect DAGs, nightly + intraday)          |\n'
'      |  ingest Agmarknet/eNAM/IMD/satellite -> validate -> impute ->        |\n'
'      |  feature store -> train/backtest -> conformal calibrate ->           |\n'
'      |  register model -> publish forecasts to cache + DB                   |\n'
'      +----------------------------------------------------------------------+\n'
'                                             ^\n'
'      +----------------------------------------------------------------------+\n'
'      |  EXTERNAL: Agmarknet | eNAM | data.gov.in | IMD | Sentinel-2/Copernicus\n'
'      |  Bhashini ASR/TTS/MT | UPI PSP | e-NWR repositories | AgriStack | ONDC/Beckn\n'
'      +----------------------------------------------------------------------+\n', label='service-topology')

    d.h2('5.3 The two flows that matter')
    d.h3('Flow A: the hold-or-sell decision (the demo centrepiece)')
    d.code(
' 1. Farmer opens app / dials IVR. Identity resolved to farmer_id (AgriStack ID if present).\n'
' 2. Context loaded: crop=onion, qty=42 qtl, harvest_date, village -> geo, default mandi = Lasalgaon,\n'
'    stated cash need = Rs 40,000 by 12 Sep, storage available = chawl, 30 qtl capacity.\n'
' 3. price-svc returns for each candidate mandi within 120 km:\n'
'      - today modal price, today arrivals\n'
'      - forecast for h = 1,3,7,14,30 days with 80% and 95% conformal intervals\n'
'      - top drivers (arrival trend, seasonal index, neighbouring-mandi signal, rainfall anomaly, policy flag)\n'
' 4. window-svc computes for each (mandi, day) pair the NET expected realisation:\n'
'      net = E[price_h] * qty * (1 - spoilage(h, crop, storage_type))\n'
'            - storage_cost(h) - transport_cost(mandi) - mandi_fee - commission\n'
'            - finance_cost(h) if a pledge advance is taken\n'
'    and the downside at the 10th percentile of the predictive distribution.\n'
' 5. Cash-need constraint checked. If need_by < recommended_sell_date:\n'
'      credit-svc quotes an e-NWR pledge advance: eligible warehouses, LTV, rate, tenor,\n'
'      net cash today, and the repayment deducted at sale.\n'
' 6. Recommendation object emitted and PERSISTED with model_version + feature_vector + intervals:\n'
'      action = HOLD_WITH_PLEDGE | HOLD | SELL_NOW | SELL_ELSEWHERE | ROUTE_TO_PROCESSOR\n'
'      expected_gain_per_qtl, downside_per_qtl, confidence, plain-Marathi reason, cash-today figure\n'
' 7. Delivered as: app card + Marathi TTS + SMS summary. Farmer accepts, defers or rejects.\n'
'    Every response is logged - this is the training signal for the recommender and the\n'
'    denominator of the Realisation Ledger.\n'
' 8. If HOLD_WITH_PLEDGE accepted -> deposit flow -> e-NWR issued -> advance disbursed ->\n'
'    lot auto-listed with a sell trigger at the target price band.\n', label='flow-hold-or-sell')

    d.h3('Flow B: lot to settlement')
    d.code(
' 1. Farmer (or FPO) creates a LOT: crop, variety, quantity, harvest date, photos, location,\n'
'    self-declared attributes. QR code minted.\n'
' 2. GRADING. Three tiers, and the tier is always displayed to the buyer:\n'
'      T1 self-declared + photo    -> lowest trust, widest price discount\n'
'      T2 CV assist + rule engine  -> size distribution, colour, visible defect ratio, moisture proxy\n'
'      T3 third-party / eNAM assay -> highest trust, best price, required above a value threshold\n'
'    Output: grade label (A/B/C/D) + attribute vector + confidence + tier badge.\n'
' 3. FPO POOLING (optional): member lots combine into a parent lot. The grade-weighted split is\n'
'    computed and shown to every member BEFORE they consent:\n'
'      share_i = (qty_i * grade_multiplier_i) / sum_j(qty_j * grade_multiplier_j)\n'
'    Consent is recorded. Nobody can dispute the formula afterwards because they approved it first.\n'
' 4. MATCHING. matching-svc scores each open buyer demand against the lot:\n'
'      score = w1*price_fit + w2*grade_fit + w3*(1/distance) + w4*buyer_reliability\n'
'            + w5*settlement_capability + w6*logistics_availability\n'
'    Weights are per-farmer preference-tuned; default favours reliability over headline price,\n'
'    because Mechanism 5 says a high price from an unreliable buyer is worth less.\n'
' 5. OFFERS. Buyer offers -> farmer counters -> accept/expire. Full audit trail. Marathi TTS\n'
'    of every offer so a low-literacy farmer is never disadvantaged in a negotiation.\n'
' 6. ESCROW. On acceptance the buyer funds escrow (or provides an assured-payment instrument).\n'
'    Escrow state machine: CREATED -> FUNDED -> IN_TRANSIT -> DELIVERED -> INSPECTED ->\n'
'    RELEASED | DISPUTED.\n'
' 7. LOGISTICS. logistics-svc matches a transporter, pools nearby lots onto one truck,\n'
'    and tracks the consignment against the lot QR.\n'
' 8. INSPECTION + RELEASE. Buyer inspects against the recorded assay. Match -> auto-release.\n'
'    Mismatch -> dispute with mandatory photo evidence, compared against the pre-shipment assay.\n'
'    Because grading happened BEFORE dispatch with photos and a timestamp, post-facto\n'
'    quality renegotiation - one of the commonest ways farmers lose money - becomes hard.\n'
' 9. SETTLEMENT. Escrow releases to the farmer\'s account. Pledge advance auto-repaid if any.\n'
'    days_to_pay recorded into the buyer reliability score.\n'
'10. LEDGER. ledger-svc computes realised_net vs counterfactual baseline and appends to the\n'
'    Realisation Ledger with a hash chain.\n', label='flow-lot-to-settlement')

    d.h2('5.4 Technology choices, with the reason for each')
    d.table(['Layer','Choice','Why this and not the alternative'],[
      ['Farmer app','Flutter (or Kotlin + Jetpack Compose)','One codebase, good offline story via Drift/SQLite, small APK matters on low-end devices. Choose whichever your team is already fast in - hackathon velocity beats theoretical fit.'],
      ['Buyer web','Next.js + TypeScript + Tailwind','Fast to build, server components keep the dashboard snappy, and it demos well on a projector.'],
      ['API','Python FastAPI','Same language as the ML stack, so no model-serving boundary to cross under time pressure. Async handles IVR webhooks well. Auto OpenAPI docs are a free credibility artifact for judges.'],
      ['Database','PostgreSQL + TimescaleDB','Price and arrival data are time series; hypertables and continuous aggregates give you 30-day rolling views for free. One database for both relational and time-series data means one thing to operate at 3 a.m.'],
      ['Cache/queue','Redis','Forecast cache, rate limiting, and a lightweight job queue. Keeps the demo instant.'],
      ['ML training','Python: pandas, scikit-learn, statsmodels, LightGBM, PyTorch, MAPIE/crepes for conformal','LightGBM is the workhorse - fast, strong on tabular time series, quantile objective built in. PyTorch only where a sequence model earns its place.'],
      ['Orchestration','Prefect (or Airflow if the team knows it)','Nightly ingest, validate, impute, feature-build, forecast, publish. A visible DAG is also a strong artifact to show a judge.'],
      ['Model registry','MLflow','Version, metrics, artifact per model. Lets you answer "which model produced this recommendation" instantly, which is the audit requirement from 5.1.'],
      ['Voice','Bhashini Open APIs for Marathi ASR/TTS, with IndicWhisper/IndicTrans2 as an offline fallback','Bhashini is government DPI, free and a positioning win. Keep a local fallback so a network failure cannot kill your demo.'],
      ['Messaging','WhatsApp Cloud API, Exotel/Twilio for IVR, an SMS gateway for fallback','Meets farmers on channels they already use. The AIEP paper (arXiv:2601.11537) validates exactly this IVR + WhatsApp pattern in Bihar.'],
      ['Payments','UPI collect + escrow via a PSP; RTGS/NEFT for large lots','Do not build a wallet. Regulatory burden with no benefit. Use a partner PSP or an escrow-as-a-service provider.'],
      ['Transaction integrity','Append-only Postgres table with a SHA-256 hash chain','Gives tamper-evidence and "transparent transaction records" without the operational cost of a blockchain. Say this explicitly - judges are tired of gratuitous blockchain, and choosing not to use it is a signal of engineering judgement. The literature supports the choice: blockchain-agri papers exist (see the traceability line in the reading list) but the cost is real and the benefit here is achievable with a hash chain plus periodic notarisation.'],
      ['Deploy','Docker Compose for the hackathon; Kubernetes only if you already run it','Compose up in one command is worth more in a demo than any orchestration sophistication. Mention a K8s/state-cloud path (MeghRaj/NIC) for the production slide.'],
      ['Observability','Prometheus + Grafana, structured JSON logs','A live Grafana panel showing forecast accuracy during the pitch is a disproportionately strong trust signal.'],
    ],[0.14,0.26,0.60],size=8.2)

    d.h2('5.5 Data model: the core tables')
    d.code(
'farmer(farmer_id PK, agristack_id, name, phone, village, taluka, district,\n'
'       lat, lon, land_ha, pref_lang, literacy_mode, default_mandi_id, risk_pref)\n'
'fpo(fpo_id PK, name, reg_no, district, member_count, storage_capacity_qtl, bank_acct)\n'
'fpo_member(fpo_id FK, farmer_id FK, joined_on, share_class)\n'
'market(market_id PK, apmc_name, district, lat, lon, enam_flag, agmarknet_code, market_type)\n'
'commodity(commodity_id PK, name, name_mr, variety, agmarknet_code, is_msp, storability_days)\n'
'price_obs(market_id, commodity_id, obs_date, min_p, max_p, modal_p, arrivals_qtl,\n'
'          source, ingested_at, quality_flag)          -- Timescale hypertable\n'
'weather_obs(grid_id, obs_date, rain_mm, tmax, tmin, rh, source)\n'
'forecast(forecast_id PK, market_id, commodity_id, run_date, horizon_days,\n'
'         p50, p10, p90, p05, p95, model_version, features_hash, calib_method)\n'
'recommendation(rec_id PK, farmer_id, lot_id, run_at, action, target_date, target_market_id,\n'
'               exp_gain_per_qtl, downside_per_qtl, confidence, reason_mr, reason_en,\n'
'               cash_today, model_version, features_json, farmer_response, responded_at)\n'
'lot(lot_id PK, owner_type, owner_id, parent_lot_id, commodity_id, variety, qty_qtl,\n'
'    harvest_date, location, status, qr_code, created_at)\n'
'grade_assay(assay_id PK, lot_id FK, tier, grade_label, attributes_json, confidence,\n'
'            assessor_type, assessor_id, photos, assayed_at)\n'
'pool_consent(parent_lot_id, member_lot_id, farmer_id, share_pct, consented_at, signature)\n'
'buyer(buyer_id PK, name, type, gstin, pan, apmc_licence, bank_verified, verif_tier,\n'
'      reliability_score, avg_days_to_pay, dispute_rate, renegotiation_rate)\n'
'demand(demand_id PK, buyer_id FK, commodity_id, grade_spec_json, qty_qtl,\n'
'       window_start, window_end, indicative_price, delivery_terms, status)\n'
'offer(offer_id PK, lot_id, demand_id, buyer_id, price_per_qtl, qty_qtl, terms_json,\n'
'      status, parent_offer_id, created_at, expires_at)\n'
'transaction(txn_id PK, lot_id, offer_id, buyer_id, seller_type, seller_id, agreed_price,\n'
'            qty_qtl, gross_amt, deductions_json, net_amt, escrow_state,\n'
'            funded_at, delivered_at, released_at, days_to_pay)\n'
'warehouse(wh_id PK, name, operator, district, lat, lon, capacity_qtl, rate_per_qtl_month,\n'
'          wdra_registered, enwr_capable, commodities_json)\n'
'enwr(receipt_id PK, lot_id, wh_id, issued_at, qty_qtl, valuation, repository, status)\n'
'pledge(pledge_id PK, receipt_id FK, lender_id, principal, rate_pa, tenor_days,\n'
'       disbursed_at, outstanding, repaid_at, status)\n'
'dispute(dispute_id PK, txn_id FK, raised_by, category, claim_json, evidence,\n'
'        stage, sla_due, resolution, resolved_at)\n'
'realisation_ledger(entry_id PK, txn_id FK, farmer_id, commodity_id,\n'
'                   realised_net_per_qtl, baseline_per_qtl, baseline_method,\n'
'                   gain_per_qtl, gain_total, rec_id, followed_rec BOOL,\n'
'                   prev_hash, entry_hash, created_at)   -- append-only\n'
'audit_log(log_id PK, actor_type, actor_id, action, entity, entity_id,\n'
'          payload_json, at, prev_hash, entry_hash)      -- append-only\n', label='schema')
    d.p('Two details worth pointing out to a technical judge. First, `recommendation` stores `features_json` and `model_version`, which means any advice can be reproduced exactly - that is the auditability principle made concrete. Second, `realisation_ledger` stores `baseline_method` alongside the baseline, so when someone challenges the counterfactual you can show which method was used and recompute under an alternative. That is the difference between a metric and a marketing number.')
    return d
