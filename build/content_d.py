# -*- coding: utf-8 -*-
"""Chapters 06-07: the ML system, and the data sources catalogue."""

def build(d, PDF=False):
    d.h1('The Machine Learning System','06')
    d.p('This is where a hackathon is won or lost on technical credibility. The trap is to reach for the most impressive model. The winning move is to show a disciplined progression from a baseline you beat, with honest evaluation and calibrated uncertainty. The AgriPriceBD benchmark (arXiv:2604.06227) found that naive persistence beat SARIMA, Prophet, BiLSTM and Informer on random-walk-like commodity series, and that a Time2Vec transformer gave no significant gain. If a judge knows that literature and you have led with a transformer, you lose the room. If you lead with "we beat persistence by X with a Diebold-Mariano p-value of Y", you own it.')

    d.h2('6.1 The model inventory')
    d.table(['#','Model','Target','Approach','Key inputs','Evaluation'],[
      ['M0','Persistence baseline','price at h days','last observed modal price, carried forward','price history only','MASE, RMSE - this is the number every other model must beat'],
      ['M1','Seasonal-naive + drift baseline','price at h days','same day-of-year last year, scaled by recent level','price history','MASE'],
      ['M2','Price forecaster (primary)','p10/p50/p90 price per mandi-commodity at h=1,3,7,14,30','LightGBM with quantile (pinball) objective, one model per horizon, per commodity, with market embedding','lags 1-30, rolling mean/std/min/max, arrival lags and rolling, day-of-year Fourier terms, neighbouring-mandi price lags, rainfall anomaly, festival/holiday flags, policy-shock flags, MSP flag, sowing-window index','Rolling-origin backtest, pinball loss, MASE vs M0, Diebold-Mariano vs M0, interval coverage'],
      ['M3','Spatial price model','price at h, using the market graph','GNN over a mandi adjacency graph (distance + trade-flow weighted) with temporal convolution','all of M2 plus neighbour node features','Same as M2. Justified by arXiv:2304.09761 which reports >=20% gains from geospatial dependency modelling'],
      ['M4','Volatility model','conditional variance of returns','EGARCH on log returns; SARIMAX with weather regressors as the mean model','price returns, rainfall, temperature','Log-likelihood, out-of-sample variance forecast accuracy. Justified by arXiv:2503.24324'],
      ['M5','Conformal calibrator','valid prediction intervals','Split conformal + CopulaCPTS for multi-horizon dependency + Adaptive CI for drift + change-point-aware widening','M2/M3 residuals on a held-out calibration set','Empirical coverage vs nominal, interval width, Winkler score. arXiv:2212.03281, 2202.07282, 2509.02844'],
      ['M6','Change-point / regime detector','regime label + shock flag','Online BOCPD on price and arrival series, plus a rules layer on policy events (export ban, MEP, stock limit)','prices, arrivals, a curated policy-event calendar','Detection delay, false-positive rate. Drives interval widening and model gating'],
      ['M7','Arrival volume forecaster','arrivals at h','LightGBM, same shape as M2','arrival lags, sowing-date estimates, area under crop, weather, harvest calendar, satellite NDVI','MASE. Feeds M2 as a feature and is displayed to the farmer - "heavy arrivals expected Tuesday, prices usually dip"'],
      ['M8','Spoilage / shelf-life model','expected % loss at h days','Gradient boosting or a calibrated agronomic curve per crop and storage type','crop, variety, storage type, ambient temp/RH forecast, days since harvest, initial grade','Absolute error on measured loss where available; otherwise a documented agronomic curve with the source cited'],
      ['M9','Quality grader','grade label + attribute vector','CNN (EfficientNet/MobileNet, on-device quantised) for size/colour/defect, plus a rule engine on measured attributes','lot photos under a standardised capture protocol, measured moisture/size','Per-attribute accuracy, confusion against third-party assay, and an abstention rate - the model must be allowed to say "cannot grade, get an assay"'],
      ['M10','Buyer reliability score','probability of on-time full payment','Logistic regression or gradient boosting; deliberately interpretable','settled txn history, days-to-pay distribution, dispute rate, renegotiation rate, verification tier, tenure','AUC, calibration curve. MUST be interpretable - a buyer denied access will demand a reason'],
      ['M11','Match ranker','probability a match converts and settles cleanly','Learning-to-rank (LambdaMART) once data exists; a weighted score before that','lot features, demand features, distance, price gap, buyer score','NDCG, conversion rate, settlement-success rate'],
      ['M12','Sale-window optimiser','optimal action and date','Not a learned model - explicit expected-utility arithmetic over M2/M4/M5/M8 outputs under the farmer cash constraint','forecast distribution, costs, cash need, risk preference','Backtested realisation vs sell-on-harvest baseline. THIS is the number in your pitch'],
      ['M13','Marathi voice','ASR + TTS','Bhashini APIs primary; fine-tuned IndicWhisper as offline fallback','farmer speech, agri lexicon','Domain-weighted WER on crop names and numbers, per arXiv:2602.03868 - not plain WER'],
      ['M14','Zero-shot cold-start forecaster','price at h for a mandi-commodity pair with little history','Time-series foundation model (Chronos/TimesFM) zero-shot, GATED by M6','short price history','Compared against M0 on sparse pairs only. Gated off during detected regime shifts because TSFMs fail on regime switches'],
    ],[0.04,0.15,0.13,0.20,0.26,0.22],size=7.6)

    d.h2('6.2 M12 in full: the sale-window optimiser')
    d.p('This is the single most important piece of logic in the product, and it is arithmetic, not machine learning. Say that clearly - it shows judgement. The ML produces a distribution; the decision is an explicit, auditable expected-utility calculation over that distribution.')
    d.code(
'INPUTS\n'
'  q        quantity in quintals\n'
'  F(h,m)   predictive distribution of price at horizon h in market m  (from M2/M3 + M5)\n'
'  s(h)     expected fractional spoilage at h        (from M8)\n'
'  C_st(h)  storage cost for h days                  (warehouse registry)\n'
'  C_tr(m)  transport cost to market m               (logistics-svc)\n'
'  C_mk(m)  mandi fee + commission at market m       (APMC schedule)\n'
'  C_fi(h)  finance cost of a pledge advance over h days\n'
'  need     cash the farmer needs, and need_by date\n'
'  rho      farmer risk preference in [0,1]  (0 = maximise expected value, 1 = maximise worst case)\n'
'\n'
'FOR each candidate (h, m):\n'
'  gross_p50 = quantile(F(h,m), 0.50) * q * (1 - s(h))\n'
'  gross_p10 = quantile(F(h,m), 0.10) * q * (1 - s(h))       # the honest downside\n'
'  cost      = C_st(h) + C_tr(m) + C_mk(m) + (C_fi(h) if advance_needed else 0)\n'
'  net_p50   = gross_p50 - cost\n'
'  net_p10   = gross_p10 - cost\n'
'  utility   = (1 - rho) * net_p50 + rho * net_p10           # explicit risk aversion\n'
'\n'
'BASELINE  net_now = quantile(F(0, m_default), 0.50) * q - C_tr(m_default) - C_mk(m_default)\n'
'\n'
'CASH CONSTRAINT\n'
'  if need > 0 and need_by < today + h:\n'
'      advance = credit_svc.quote(lot_value = gross_p50, tenor = h)\n'
'      if advance.net_cash_today >= need:  advance_needed = True\n'
'      else: this (h,m) is INFEASIBLE unless partial sale covers the need\n'
'         -> evaluate SPLIT: sell x qtl now to cover need, hold (q - x)\n'
'\n'
'DECIDE\n'
'  best = argmax(utility) over feasible (h, m) and split options\n'
'  if utility(best) - net_now < threshold(q):   action = SELL_NOW\n'
'      # threshold scales with lot size so we never advise a 60 km trip for Rs 200\n'
'  elif best.h == 0 and best.m != m_default:    action = SELL_ELSEWHERE\n'
'  elif best.advance_needed:                    action = HOLD_WITH_PLEDGE\n'
'  elif grade is low and processor_price > fresh_net: action = ROUTE_TO_PROCESSOR\n'
'  else:                                        action = HOLD\n'
'\n'
'EMIT (and persist, with model_version + feature vector)\n'
'  action, target_date, target_market, expected_gain_per_qtl = (utility(best)-net_now)/q,\n'
'  downside_per_qtl = (net_p10(best)-net_now)/q, confidence = coverage-calibrated band width,\n'
'  cash_today, plain-Marathi reason string, and the full comparison table for transparency\n', label='sale-window-optimiser')
    d.callout('THE THREE DETAILS THAT WILL IMPRESS A JUDGE',
      '(1) rho - we ask the farmer whether they want the best average outcome or the safest one, and the maths changes. '
      'Most systems impose a risk preference silently. (2) The SPLIT option - selling part of the lot to cover an immediate cash need '
      'while holding the rest is what a smart farmer already does informally; we make it computable. '
      '(3) threshold(q) - we refuse to give advice whose expected gain is smaller than the hassle, which means the system '
      'sometimes says "just sell here, it is not worth the trip". A system willing to say that is a system a farmer will trust.')

    d.h2('6.3 Feature engineering: the full list')
    d.table(['Group','Features','Source'],[
      ['Price history','modal/min/max lags 1-30 days; rolling mean, std, min, max, median over 7/14/30/60; log returns; spread (max-min)/modal as a liquidity proxy; days since last observation (sparsity signal)','Agmarknet, eNAM'],
      ['Arrival','arrival lags 1-30; rolling sums; arrival z-score vs same week last 3 years; arrival-to-price elasticity estimate','Agmarknet'],
      ['Seasonality','day-of-year sin/cos Fourier terms (3 harmonics); week-of-year; month; harvest-window flag per crop; festival calendar (Diwali, Ganeshotsav) which shifts vegetable demand','Derived + calendar'],
      ['Spatial','price lags of the k nearest mandis; distance-weighted neighbour mean; price of the terminal market (Vashi/Mumbai APMC); inter-mandi spread','Agmarknet + geo'],
      ['Weather','rainfall last 7/14/30 days and anomaly vs normal; tmax/tmin; heat-stress days; excess-rain flag; forecast rainfall for the next 7 days','IMD, ERA5, open-meteo'],
      ['Remote sensing','NDVI/EVI over the sourcing catchment; crop-area estimate; anomaly vs previous year','Sentinel-2 via Copernicus, MODIS, Bhuvan'],
      ['Policy','export-ban flag; minimum export price level; stock-limit flag; MSP level and change; procurement-active flag','Curated event calendar - build this by hand, it is high value and nobody else will'],
      ['Macro','diesel price (transport cost driver); wholesale price index for food; onion-specific import/export volumes','data.gov.in, DGCIS'],
      ['Data quality','share of missing days in the last 30; imputation flag; source-reliability weight','Derived - per arXiv:2009.04171, quality features are predictive in their own right'],
    ],[0.13,0.60,0.27],size=8.2)
    d.callout('THE IMPUTATION PROBLEM - DO NOT SKIP THIS',
      'The interpretable-forecasting paper (arXiv:1812.05173) found Agmarknet data across 1,000+ markets to be "extremely sparse" and used '
      'collaborative filtering to fill gaps before modelling. Expect the same. A mandi may report on 11 of 30 days. '
      'Your pipeline needs an explicit imputation stage - matrix factorisation across the market x commodity x date tensor, or a '
      'neighbour-weighted fill - and it must flag imputed values so the model can learn to distrust them. '
      'Teams that ignore this get models that look fine in a notebook and collapse on real data.')

    d.h2('6.4 Evaluation protocol')
    d.p('Write this protocol down before you train anything and follow it. It is also a slide.')
    d.num([
      'Split by TIME, never randomly. Train on data up to T, calibrate on (T, T+c], test on (T+c, end]. Random splits leak the future and inflate every metric.',
      'Rolling-origin backtest: refit at monthly origins and evaluate each horizon separately. A model good at h=1 and useless at h=14 is useless for our product, since the sale window is a 7-30 day decision.',
      'Report MASE against the persistence baseline M0. If MASE >= 1 the model is worse than doing nothing and must not ship.',
      'Run a Diebold-Mariano test against M0 and report the p-value. This is the single line that separates you from teams reporting an unqualified "95% accuracy".',
      'For intervals, report EMPIRICAL COVERAGE at the nominal 80% and 95% levels plus mean interval width and Winkler score. A 95% interval that covers 71% of outcomes is a lie that could cost a farmer money.',
      'Evaluate separately in high-volatility and shock regimes. Aggregate metrics hide exactly the cases where advice is most consequential.',
      'Evaluate per commodity and per mandi, not pooled. Pooled metrics let a good Lasalgaon model hide a broken Yavatmal one.',
      'For M12, the metric is not forecast error at all - it is BACKTESTED REALISATION: rupees per quintal versus a sell-on-harvest-day baseline, net of all costs. That is the number the pitch turns on.',
    ])
    d.h3('Anti-metrics: never say these')
    d.bul([
      '"Our model is 95% accurate." Accuracy is undefined for regression. A judge who knows this stops listening.',
      'MAPE alone on prices. It is asymmetric, punishes under-forecasts unequally, and explodes near low prices.',
      'R-squared on a time series. Persistence gets a high R-squared on a random walk while being informationally empty.',
      'Any metric without a baseline. "RMSE 84" means nothing unless you say what persistence scored.',
    ])

    d.h2('6.5 Known failure modes and the mitigation for each')
    d.table(['Failure mode','Why it happens','Mitigation we ship'],[
      ['Confident forecast through a policy shock','Models extrapolate from history; an export ban has no precedent in the recent window. The TSFM causal analysis found foundation models fail outright on regime switches and are biased toward over-persisting trends','M6 change-point detector gates the model; intervals widen; the UI switches to "market disrupted, advice suspended" rather than showing a number'],
      ['Sparse mandi with no signal','Small mandis report irregularly','Explicit minimum-history rule. Below threshold, fall back to a neighbour-mandi model or M14 zero-shot, and label the forecast as low-confidence in the UI'],
      ['Self-fulfilling advice / herd effect','If 5,000 farmers all hold and then all sell on day 14, we create the crash we predicted','Stagger recommendations across a window; monitor the share of catchment supply under our advice; when it crosses a threshold, diversify recommended dates and disclose the crowding. This is a genuinely novel risk to raise unprompted - it shows systems thinking'],
      ['Grading model discriminates against a region or variety','Training images skewed to one district or one variety','Stratified sampling by district and variety; report per-stratum accuracy; allow abstention; always let a third-party assay override the model'],
      ['Buyer score becomes a barrier to entry','New buyers have no history and get a low score, so they never get matched, so they never build history','Explicit new-buyer cold-start tier with escrow-only trading, plus a reserved share of match slots for new verified buyers'],
      ['Farmer follows advice and loses money','Sometimes the p10 outcome happens. This is unavoidable and must be planned for','Show downside before consent; record consent; publish overall hit rate honestly in the public dashboard; never hide a loss. Trust survives a bad outcome that was disclosed; it does not survive a hidden one'],
      ['Model drift after deployment','Prices are non-stationary','Adaptive conformal intervals that self-widen when coverage degrades (arXiv:2202.07282); scheduled retraining plus drift-triggered retraining, per the context-based selection in arXiv:2009.04171'],
    ],[0.20,0.36,0.44],size=8.2)

    # ================= CH 7 =================
    d.h1('Data Sources: The Complete Catalogue','07')
    d.callout('READ THE CONSTRAINT NOTE FIRST',
      'Network access to government portals was blocked from the environment in which this playbook was written, so the entries below '
      'are compiled from documented structure, the academic literature that uses these sources, and standard access patterns - not from '
      'a live connection check. Treat this chapter as a WEEK-1 TASK LIST: for every row, verify the endpoint, the current field schema, '
      'the licence and the rate limit, and record what you find in the tracking table in 7.7. Items marked [VERIFY] are the ones most '
      'likely to have changed.')

    d.h2('7.1 Price and market data - the core layer')
    d.table(['Source','What you get','Access path','Notes and gotchas'],[
      ['Agmarknet (agmarknet.gov.in)','Daily min/max/modal price and arrival volume by market, commodity and variety across India; multi-year history','Web report interface with commodity/state/date parameters; scraping is the common route. The literature confirms this - arXiv:1812.05173 scraped 1,000+ markets','THE primary source. Expect sparsity and inconsistent variety naming. Build a canonical mapping table by hand for your five crops. Respect rate limits and cache aggressively. [VERIFY] whether a documented API now exists'],
      ['data.gov.in','Agmarknet mirrors and many agri datasets as downloadable CSV/JSON with an API key','Register for an api.data.gov.in key; resource-based REST endpoints','Easiest legitimate programmatic path. Coverage and freshness vary by resource. [VERIFY] current resource IDs for daily mandi prices'],
      ['eNAM (enam.gov.in)','Trade data from integrated mandis, assaying records, lot-level trade information','Portal; API access typically requires institutional arrangement','Maharashtra had 118 mandis integrated as of March 2021. Even portal-level data on trade volumes strengthens your gap analysis. [VERIFY] the current Maharashtra integration count'],
      ['MSAMB (msamb.com)','Maharashtra APMC directory, market-committee details, state marketing schemes, some price reporting','State portal','Your authoritative list of Maharashtra mandis and the institutional map for the state-scope argument. MSAMB oversees roughly 295 APMCs. [VERIFY]'],
      ['NCDEX / MCX','Futures and spot prices for agri commodities, warehouse receipt infrastructure','Public quote pages; historical data typically licensed','Futures curves are a genuinely predictive feature for storable crops - soybean and cotton especially. Even a delayed public curve helps'],
      ['CACP / DES, Ministry of Agriculture','MSP series, cost-of-cultivation estimates (A2, FL, C2), crop-wise area and production','Published reports and datasets','Cost of cultivation is how you compute whether a realised price actually covers cost. Powerful for the impact chapter'],
      ['Maharashtra Krishi department / Mahaagri','State crop statistics, sowing progress, taluka-level area','State portal','Useful for arrival forecasting and for the state-scope narrative'],
    ],[0.14,0.28,0.26,0.32],size=8.0)

    d.h2('7.2 Weather and climate')
    d.table(['Source','What you get','Access','Use'],[
      ['IMD (mausam.imd.gov.in)','Station observations, district rainfall, forecasts, warnings','Portal; some datasets via data.gov.in','Rainfall anomaly is a strong price feature via supply expectations'],
      ['ERA5 / Copernicus CDS','Global reanalysis: hourly temperature, precipitation, humidity from 1940 onward at ~31 km','Free with registration, Python cdsapi client','The most reliable long-history weather covariate. Use for training; use IMD or open-meteo for live'],
      ['Open-Meteo','Free forecast and historical weather API, no key required','Simple REST','Fastest path to a working weather feature during the hackathon'],
      ['NASA POWER','Agroclimatology daily series, solar radiation, ET','Free REST API','Good for evapotranspiration and heat-stress features'],
      ['CMIP6','Climate projections','ESGF nodes','Only for the long-horizon risk narrative. arXiv:2503.24324 uses CMIP6 for exactly this'],
    ],[0.18,0.32,0.20,0.30],size=8.2)

    d.h2('7.3 Remote sensing and geospatial')
    d.table(['Source','What you get','Access','Use'],[
      ['Sentinel-2 (Copernicus)','10 m multispectral, ~5-day revisit','Copernicus Data Space, or Google Earth Engine, or AWS open data','NDVI/EVI over the sourcing catchment as a supply-side leading indicator. Rising area under onion means arrivals will rise, means prices will fall'],
      ['Sentinel-1 SAR','Radar, cloud-penetrating','Same','Monsoon-season crop monitoring when optical is cloud-blocked'],
      ['MODIS / VIIRS','250 m-1 km vegetation indices, long history','LP DAAC, GEE','Long-history yield features. Widely used in the yield-prediction literature'],
      ['Bhuvan (ISRO)','Indian thematic layers, crop-area products, village boundaries','Portal, some WMS/WFS','Indian-context land use and administrative geography. Good "we use ISRO data" talking point'],
      ['SoilGrids / NBSS&LUP','Soil properties','SoilGrids REST; NBSS&LUP publications','Soil type appears as a feature in arXiv:2304.09761'],
      ['OpenStreetMap','Roads, market locations, warehouses','Overpass API','Routing and distance for transport cost. Free and good enough'],
    ],[0.18,0.26,0.24,0.32],size=8.2)

    d.h2('7.4 Institutional, finance and logistics')
    d.table(['Source','What you get','Use'],[
      ['WDRA (wdra.gov.in)','Registered warehouse list, e-NWR rules and repositories','The backbone of the pledge-credit pillar. Get the registered-warehouse list for Nashik/Ahmednagar/Pune first. [VERIFY] counts and current repository list'],
      ['NABARD','FPO registry and programmes, FPO-related credit schemes','FPO directory for the state; also the ONDC-agri partner, which is a route to network onboarding'],
      ['SFAC / 10,000 FPO scheme','FPO listings and cluster-based business organisation data','Identifying real FPOs in the wedge districts for pilot partners'],
      ['RBI / NABARD reports','Agricultural credit statistics, KCC data, interest-rate structures','The debt side of the liquidity argument. Sourcing real interest rates strengthens the pledge-finance value calculation'],
      ['NCRB','Accidental Deaths and Suicides in India - occupation-wise data','The outcome your project exists to change. Handle with care and precision, never as a shock statistic'],
      ['MoSPI / NSSO SAS','Situation Assessment Survey of Agricultural Households: income, indebtedness, marketing channels, MSP awareness','The 23% MSP-awareness figure comes from here. The richest single source on how farmers actually sell'],
      ['ONDC / Beckn','Protocol specifications, registry, reference implementations','If you build a Beckn-compliant BPP you get network reach without building demand. Strong strategic story'],
      ['Bhashini','Marathi ASR, TTS, translation; 300+ pretrained models','The voice layer. Free, government DPI, and a credibility win'],
      ['AgriStack / farmer registry','Farmer ID linked to land records','Identity and KYC reduction. [VERIFY] Maharashtra enrolment status and access process'],
    ],[0.18,0.34,0.48],size=8.2)

    d.h2('7.5 Training data for the ML models, model by model')
    d.table(['Model','Data you need','Where it comes from','Realistic hackathon substitute'],[
      ['M2/M3 price forecast','5+ years of daily price and arrival series for 5 commodities x 40-60 Maharashtra mandis','Agmarknet scrape or data.gov.in bulk','Even 3 years x 10 mandis x onion is enough for a credible backtest. Depth beats breadth for a demo'],
      ['M4 volatility','Same price series, log returns','Same','Same'],
      ['M5 conformal','A held-out calibration slice of the same series','Derived','No extra data needed - just discipline about the split'],
      ['M7 arrivals','Arrival series + sowing area + weather + NDVI','Agmarknet + state agri dept + Sentinel-2','Arrivals plus weather alone gets you a working model'],
      ['M8 spoilage','Measured storage-loss curves by crop, storage type, temperature and humidity','ICAR and CIPHET post-harvest research publications; state agri university trials','Use published agronomic curves and cite them. Do not fabricate. An honest cited curve is better than an invented model'],
      ['M9 grading','Labelled produce images by grade, per crop, per variety','Build your own: this is the highest-value pre-work. Also public sets - PlantVillage (disease not grade), Fruits-360 (clean but unrealistic), Kaggle onion/tomato grading sets [VERIFY availability]','Collect 300-600 photos yourself at a mandi with a phone, labelled by a trader. That dataset is unique to you, and saying "we collected our own labelled dataset at Lasalgaon" is worth more in the room than any public dataset'],
      ['M10 buyer score','Settled transaction outcomes','Only from your own platform','Cold start with verification tier plus a rules layer; be explicit that the learned model comes after real transactions'],
      ['M13 Marathi voice','Marathi agri speech','Bhashini pretrained; Shrutilipi and IndicSUPERB corpora for fine-tuning; Kisan Call Centre transcripts for the domain lexicon (see arXiv:2509.21535, which used KCC data)','Bhashini out of the box, plus a hand-built agri lexicon of crop names, grades and number formats for post-correction'],
      ['M14 cold start','Nothing - zero-shot','Pretrained TimesFM or Chronos weights','Genuinely zero-shot. Just remember the gating requirement'],
    ],[0.13,0.24,0.34,0.29],size=7.8)

    d.h2('7.6 Corpus construction plan - do this in the 8 weeks before the hackathon')
    d.num([
      'Register for a data.gov.in API key on day one. It is free and it unblocks the legitimate path to price data.',
      'Write the Agmarknet ingester with a canonical commodity-variety-market mapping table for onion, soybean, cotton, tomato and tur. Budget two days; the naming inconsistencies are the real work.',
      'Pull the longest history you can get for 40-60 Maharashtra mandis. Store raw responses as well as parsed rows so you can re-parse without re-fetching.',
      'Build the data-quality report: per mandi-commodity, the reporting rate, gap distribution and outlier count. This report is itself a slide, because it proves you touched real data.',
      'Implement imputation with an explicit flag column. Validate by masking known values and measuring recovery error.',
      'Hand-build the policy-event calendar for onion: every export ban, minimum export price change and stock limit for the last five years, with dates. This is a few hours of newspaper archive work and it is a genuine competitive advantage - almost no team will have it, and it is what makes your regime-shift story real.',
      'Collect the grading image dataset. Go to a mandi. Photograph lots under a fixed protocol - same distance, plain background, reference coin for scale - and have a trader or commission agent label the grade. 300-600 labelled images. This is the highest-credibility artifact in the whole project.',
      'Get the WDRA registered-warehouse list for the three wedge districts, with capacity and rates. Call two of them and ask their actual monthly rate and whether they issue e-NWRs. Two phone calls turn a slide into evidence.',
      'Identify and contact two real FPOs in Nashik or Ahmednagar. A single quote from a real FPO chairperson in your pitch outweighs a page of secondary research.',
      'Run the backtest of M12 and record the rupees-per-quintal result. This is your headline number. Do it early so you have time to fix it if it is unimpressive.',
    ])

    d.h2('7.7 Source verification tracker - fill this in during week 1')
    d.table(['Source','Endpoint / URL','Auth','Format','Rate limit','Licence','Verified on','Owner'],[
      ['data.gov.in mandi prices','','API key','JSON','','','',''],
      ['Agmarknet','','none','HTML','','','',''],
      ['eNAM','','','','','','',''],
      ['MSAMB APMC list','','','','','','',''],
      ['IMD / open-meteo','','','','','','',''],
      ['ERA5 CDS','','account','NetCDF','','','',''],
      ['Sentinel-2','','account','COG','','','',''],
      ['WDRA warehouses','','','','','','',''],
      ['NABARD FPO list','','','','','','',''],
      ['Bhashini ASR/TTS','','API key','REST','','','',''],
      ['NCDEX quotes','','','','','','',''],
      ['MoSPI SAS','','none','PDF/CSV','','','',''],
    ],[0.17,0.19,0.09,0.09,0.10,0.11,0.12,0.13],size=7.8)
    d.p('Assign an owner per row on day one. The commonest reason a hackathon team ships a fake demo is that nobody was individually accountable for a data source, so everyone assumed someone else had it.')
    return d
