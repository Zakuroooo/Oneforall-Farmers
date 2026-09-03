# -*- coding: utf-8 -*-
"""Chapters 10-12: build plan, demo script, judging strategy."""

def build(d, PDF=False):
    d.h1('The Build Plan','10')
    d.p('Six people, one deliverable, a hard deadline. The plan below assumes an eight-week run-up followed by the 36-hour grand finale. If your timeline is shorter, cut scope from Pillars 3 and 4, never from Pillars 1, 2 and 5, because those three are the argument.')

    d.h2('10.1 Role assignment for six people')
    d.table(['Role','Owns','Primary deliverables','Must not also own'],[
      ['R1 ML lead','Models M0-M8, M12, M14; the backtest','Trained forecaster with conformal intervals, the sale-window engine, and the backtested rupees-per-quintal number','Any UI work. This role is the technical credibility and cannot be split'],
      ['R2 Data engineer','Ingestion, canonical mappings, imputation, the feature store, the policy-event calendar','Working pipeline over 3+ years of real Maharashtra data, plus the data-quality report','Modelling. Pipeline and models fail differently and need different heads'],
      ['R3 Backend','FastAPI services, schema, escrow FSM, ledger, hash chain, buyer scoring','All APIs working with OpenAPI docs, seeded realistic data','The mobile app'],
      ['R4 Mobile / farmer surfaces','Android app, IVR flow, WhatsApp bot, SMS, Marathi voice integration','The farmer journey demoable offline, with working Marathi TTS','Backend logic'],
      ['R5 Buyer web + design','Buyer dashboard, public district dashboard, all visual design, the deck','Buyer flow, the Realisation Ledger dashboard, and a deck that does not embarrass the build','Nothing else. Design is usually under-resourced and it is what judges see first'],
      ['R6 Domain, story and integration','Field research, FPO and warehouse contacts, the policy-event calendar with R2, the pitch narrative, demo script, risk answers, and integration glue','Two real FPO conversations, two warehouse rate confirmations, the grading image dataset, the pitch','Nothing on the critical build path. This role is why you win the room, and it evaporates if given tickets'],
    ],[0.13,0.24,0.36,0.27],size=8.2)
    d.callout('THE MOST COMMON SIX-PERSON MISTAKE',
      'Putting five people on code and one on "presentation" at the end. The pitch, the field evidence and the story are not a wrapper - '
      'they are half the score. R6 must start on day one and must never be pulled onto the build, even when the build is behind. '
      'A working prototype with no story loses to a rougher prototype with a farmer\'s name in it.')

    d.h2('10.2 The eight weeks before')
    d.table(['Week','Focus','Concrete exit criteria - all must be checkable'],[
      ['W1','Data access and truth','data.gov.in key obtained. Agmarknet ingester pulling onion for 10 Nashik-belt mandis. Source verification tracker (7.7) filled with an owner per row. Data-quality report produced.'],
      ['W2','Data depth','3+ years across 40-60 mandis and 5 commodities. Canonical commodity-variety mapping complete. Imputation implemented and validated by masking. Weather joined.'],
      ['W3','Baselines','M0 persistence and M1 seasonal-naive implemented with a rolling-origin harness. MASE and RMSE recorded per mandi-commodity-horizon. THIS IS THE GATE: no fancy model until the harness works and the baselines are recorded.'],
      ['W4','Primary model','M2 LightGBM quantile model beating M0 on the majority of mandi-commodity-horizon cells, with a Diebold-Mariano p-value. M5 conformal calibration with measured coverage.'],
      ['W5','Decision engine + the number','M12 implemented. Backtest over 3 years produces the headline rupees-per-quintal figure versus a sell-on-harvest baseline. If the number is weak, this is the week to find out and fix it.'],
      ['W6','Field evidence','Two FPO conversations completed with quotes and permission. Two warehouse rate cards confirmed by phone, with e-NWR capability checked. Grading dataset collected: 300-600 labelled images. Policy-event calendar for onion complete for 5 years.'],
      ['W7','Product skeleton','Backend services with seeded data. App shell with the sale-window screen. Marathi TTS working end to end. IVR happy path working on a real phone call.'],
      ['W8','Integration and rehearsal','Full flow A and flow B working. Realisation Ledger computing. Deck complete. Pitch rehearsed to time at least five times, including with the demo failing on purpose.'],
    ],[0.06,0.20,0.74],size=8.2)

    d.h2('10.3 The 36 hours, hour by hour')
    d.table(['Hours','Everyone','Checkpoint'],[
      ['0-2','Set up, git hygiene, environments verified on every machine, seed data loaded, one-command startup proven on two laptops. R6 finalises the problem framing with any new information from the venue briefing.','`docker compose up` works from a clean clone. If not, stop everything and fix it now.'],
      ['2-6','R1 loads pretrained models and wires forecast serving. R2 verifies live data refresh. R3 core APIs. R4 app shell plus sale-window screen. R5 buyer dashboard shell plus deck skeleton. R6 demo script v1.','Forecast API returns real numbers for Lasalgaon onion with intervals.'],
      ['6-10','R1 sale-window engine wired to real forecasts. R3 lot, offer and escrow endpoints. R4 lot creation with camera. R5 ledger dashboard. R6 rehearses narration against whatever exists.','A recommendation renders on a phone from a real forecast.'],
      ['10-14','Grading CV integrated as assist. FPO split implemented. Marathi TTS on the recommendation. Escrow state machine walkable.','Farmer journey walkable end to end, even if ugly.'],
      ['14-18','FIRST FULL DRY RUN, timed, recorded on video. Then fix what broke. Freeze the schema after this point.','8-minute run completes without a crash. Video saved as the fallback.'],
      ['18-24','Depth: conformal intervals visible in the UI, the "why" panel with nearest-neighbour precedents, buyer reliability display, dispute flow, public dashboard. R5 finishes the deck.','Every claim in the deck is demonstrable in the product.'],
      ['24-28','Realisation Ledger backtest results rendered in the product. Seed a realistic transaction history so the dashboard is not empty. Polish the three screens judges will actually look at.','The headline number appears in the product, not just on a slide.'],
      ['28-31','Hardening: offline mode verified with the wifi physically off, error states, empty states, the "insufficient data" state, and a scripted local fallback for every external API.','Demo survives with networking disabled.'],
      ['31-34','Rehearse three more times with different people asking hostile questions. Record the final fallback video at full quality. Prepare the one-page handout.','Every team member can run the demo alone.'],
      ['34-36','Buffer. Sleep in shifts. No new features - the rule is absolute.','Two people rested enough to present coherently.'],
    ],[0.07,0.63,0.30],size=8.2)
    d.callout('THE FEATURE FREEZE RULE',
      'No new feature after hour 28. None. The single most common way good hackathon teams lose is a half-finished feature added at '
      'hour 33 that breaks the demo at hour 35. Write this rule on the wall and appoint one person - R6 - with the authority to enforce it '
      'against anybody, including themselves.')

    d.h2('10.4 Pre-built assets to bring in')
    d.bul([
      'Trained model artifacts, versioned, loadable in under 10 seconds. Do not train during the hackathon.',
      'A seeded database dump with realistic Maharashtra names, villages, mandis, buyers, and 6 months of plausible transaction history so no dashboard is empty.',
      'The complete Marathi string table with pre-generated TTS audio for every demo line, cached locally. If Bhashini is unreachable at the venue, the demo must still speak Marathi.',
      'A local mock for every external API - Agmarknet, Bhashini, UPI, e-NWR - toggled by an environment variable. Practise with the mocks on.',
      'The grading image dataset, on disk, with a working local inference path.',
      'The backtest results as both a CSV and a chart, ready to render.',
      'The fallback demo video, high quality, with subtitles, on two laptops and one phone.',
      'A printed one-pager: the causal chain from 2.2, the five pillars, the headline number, and the PS-requirement coverage table from 4.5.',
    ])

    # ============= CH 11 =============
    d.h1('The Demo and the Pitch','11')
    d.p('Assume 8-10 minutes and a hostile clock. The structure below front-loads the insight, because the only thing you can be certain of is that the first two minutes will be heard.')

    d.h2('11.1 The eight-minute script')
    d.table(['Time','Beat','What you say and show'],[
      ['0:00-0:45','The person','One farmer, named, real if you have one. "Ramesh Pawar farms 1.2 acres of onion near Pimpalgaon. Last October he sold 42 quintals on harvest day at Rs 890. Twelve days later the same mandi was at Rs 1,340. That is Rs 18,900 he did not get - roughly a third of his annual income from that plot. He knew prices might rise. He sold anyway, because he owed a moneylender on Friday." No slide clutter. One photo.'],
      ['0:45-1:30','The insight','"Everyone assumes this is an information problem. It is not. Ramesh knew. The binding constraint is that he could not afford to wait. So the product cannot be a price dashboard. It has to be a waiting machine." Show the causal chain from 2.2. This is the sentence the judges will remember you by.'],
      ['1:30-2:15','The five mechanisms and the five pillars','One slide, mechanism mapped to pillar. Fast. You are establishing that you decomposed the problem rather than reacting to it.'],
      ['2:15-4:30','LIVE DEMO, part 1 - the decision','Farmer app. Onion, 42 quintals. Show today\'s price. Show the 14-day forecast WITH the uncertainty band. Show the recommendation: HOLD 12 days, expected +Rs 3,700, worst case -Rs 2,500, confidence 7 of 10. Tap "listen in Marathi" and let the room hear it speak. Then: "he still needs money on Friday" and tap GET MONEY TODAY - warehouse, e-NWR, Rs 38,000 today, Rs 940 interest, upside retained. Pause here. This is the moment you win.'],
      ['4:30-6:00','LIVE DEMO, part 2 - the transaction','Create the lot. Grade it with the camera. Pool it with two other farmers and show the fair-split table with consent. Show two verified buyers with their reliability facts - "pays in 3 days, never renegotiated". Accept an offer. Escrow funds. Show the dispute flow in one sentence, do not walk it.'],
      ['6:00-6:45','THE PROOF','Realisation Ledger. Per-transaction gain versus the counterfactual baseline. Then the backtest: "over three years of real Maharashtra onion data, this engine would have improved median realisation by Rs X per quintal net of storage and finance costs, against a sell-on-harvest baseline. Here is the Diebold-Mariano p-value against persistence." This slide is what separates you from every other team.'],
      ['6:45-7:30','Honesty and scale','What is real today, what is mocked, what needs a government partner. Then the expansion path: onion to soybean to cotton to tomato to tur, and the integration story - eNAM, e-NWR, Bhashini, ONDC, AgriStack. "We do not replace government infrastructure. We are the decision layer on top of it."'],
      ['7:30-8:00','Close on the person','"Ramesh does not need to be told what the price is. He needs to be able to wait for it. That is what we built." Stop talking. Do not add a thank-you slide with clip art.'],
    ],[0.09,0.16,0.75],size=8.0)

    d.h2('11.2 Demo discipline')
    d.bul([
      'One person drives the laptop and never talks. One person narrates and never touches the laptop. This alone prevents most demo disasters.',
      'Everything runs local. Wifi off during the demo, deliberately and visibly - it is a feature, not a limitation, and saying "this works with no network because that is rural reality" earns a nod.',
      'Never type during a demo. Pre-filled forms, pre-staged states, one-tap navigation to each state.',
      'The fallback video is queued and one keystroke away. If anything hangs for more than four seconds, cut to video mid-sentence without apologising.',
      'Show the uncertainty band every single time you show a forecast. If a judge sees a bare point forecast once, your entire honesty argument weakens.',
      'Have the Marathi audio play out loud. It is the single most memorable sensory moment in the demo and it takes six seconds.',
      'Do not demo more than the script. Every extra screen is an extra chance to fail and a subtraction from the argument.',
    ])

    # ============= CH 12 =============
    d.h1('Judging Strategy','12')
    d.h2('12.1 What SIH evaluators actually weigh')
    d.p('SIH judging typically balances novelty, technical feasibility, potential impact, and quality of implementation, with government-nominated evaluators who care about deployability within their own department. [VERIFY the exact 2026 rubric from the SIH portal and re-weight accordingly.] Assume roughly equal weight across those four and plan to score on all of them rather than maximising one.')
    d.table(['Criterion','How we score high','The specific artifact that proves it'],[
      ['Novelty','The credit-coupled recommendation and the Realisation Ledger are genuinely uncommon. Say plainly that the components are known and the LOOP is the invention - claiming false novelty on components loses more than it gains','The pledge-finance flow inside the HOLD recommendation, demoed live'],
      ['Technical feasibility','Real data, real backtest, baselines beaten with a significance test, calibrated intervals, honest failure modes','The backtest chart plus the Diebold-Mariano p-value plus the coverage table'],
      ['Impact','A quantified rupee model tied to a measured per-quintal improvement, and an explicit link to the outcome the state cares about','The impact arithmetic in Chapter 14 and the Realisation Ledger'],
      ['Implementation quality','Working offline, Marathi voice, OpenAPI docs, tests, observability, a clean repo','Turn the wifi off. Show the API docs page. Show a test run.'],
      ['Deployability for the department','State-scoped, integrates with existing government systems, has a named pilot geography, has a policy instrument the department can use','The district dashboard as a policy tool, plus the PM-AASHA proof export'],
    ],[0.15,0.52,0.33],size=8.2)

    d.h2('12.2 The five questions you will definitely be asked')
    d.kv([
      ('"eNAM already exists. Why you?"','Use the answer scripted in 3.4: eNAM is a venue, we are a decision layer, its trade is mostly intra-market, and we integrate rather than replace. Then immediately pivot to the credit loop, which eNAM does not have.'),
      ('"How do you get farmers to adopt this?"','Do not say "marketing". Say: we do not acquire farmers one by one, we onboard through FPOs and through the state extension machinery, because an FPO chairperson who trusts the fair-split ledger brings 60 farmers at once. And the first interaction requires no app - it is a phone call in Marathi.'),
      ('"What if your forecast is wrong?"','This is your best question. Answer: it will be, and we designed for that. We ship calibrated intervals rather than point forecasts, we show the worst case before consent, we suspend advice during detected regime shifts, and we publish our own hit rate. Then add: and crucially, when we recommend holding we also provide the credit, so the farmer is not exposed to our forecast error with borrowed conviction and no cash.'),
      ('"Who pays for this?"','Have a real answer. Three routes: a small transaction fee on the buyer side only, never the farmer; state funding as market infrastructure since the department already spends on market intelligence; and a lender-side origination arrangement on pledge finance. Say explicitly that the farmer never pays, because a farmer paying for price information is the same asymmetry in a new coat.'),
      ('"Is this not just what Ninjacart does?"','No - they are a buyer, and their margin is the spread we exist to shrink. We are neutral infrastructure and we do not take a position on the produce. Then acknowledge Arya.ag honestly as the closest analogue and explain the difference: they are a financier with a platform, we are a state-scoped public market layer with finance as an integration.'),
    ],kw=0.27)

    d.h2('12.3 Things that will lose you the room')
    d.bul([
      'Claiming a percentage accuracy for a price model. A technical judge stops listening.',
      'A blockchain with no articulated reason. Say instead that you chose a hash chain and why - it reads as judgement rather than trend-following.',
      'Fabricated statistics. If a judge from the agriculture department knows the real number, everything else you said becomes suspect.',
      'A demo that requires the venue wifi.',
      'Claiming to have solved the whole value chain. Scope honesty reads as maturity; overclaiming reads as inexperience.',
      'Six people all talking. Two present, four answer questions when directed.',
      'Treating farmer suicide as a hook. Mention the outcome once, precisely, with the NCRB figure, and let the product carry the rest. Judges from Maharashtra live with this reality and will react badly to it being used as decoration.',
      'Reading the slides aloud. If a slide can be read, do not narrate it - talk over it.',
    ])
    return d
