# -*- coding: utf-8 -*-
"""Chapters 0-3: front matter, problem decode, root-cause, landscape."""

def build(d, PDF=False):
    # ============ COVER ============
    if PDF:
        d._rect(0,0,d.W,d.H,(0.043,0.24,0.165))
        d._rect(0,d.H-300,d.W,4,(0.85,0.62,0.13))
        d._t(54,d.H-150,'SMART INDIA HACKATHON 2026','HB',11,(0.72,0.85,0.72))
        d._t(54,d.H-172,'PROBLEM STATEMENT 26132','HB',11,(0.85,0.62,0.13))
        d._t(54,d.H-236,'MANDI-SETU','HB',40,(1,1,1))
        d._t(54,d.H-268,'The Farmer Price Realisation Stack','TI',17,(0.80,0.90,0.80))
        d._t(54,d.H-340,'Strengthening Market Linkages and Price Discovery','T',12.5,(0.92,0.95,0.92))
        d._t(54,d.H-360,'for Farmers of Maharashtra','T',12.5,(0.92,0.95,0.92))
        d._t(54,d.H-420,'MASTER PLAYBOOK','HB',12,(0.85,0.62,0.13))
        d._t(54,d.H-442,'Problem analysis - Solution architecture - ML design - Data sources','T',10,(0.80,0.88,0.80))
        d._t(54,d.H-458,'Build plan - Demo script - Pitch strategy - Winning tactics','T',10,(0.80,0.88,0.80))
        d._rect(54,d.H-560,240,1,(0.4,0.55,0.45))
        d._t(54,d.H-590,'Organisation','HB',8.5,(0.65,0.78,0.68))
        d._t(54,d.H-606,'Government of Maharashtra','T',10,(1,1,1))
        d._t(54,d.H-622,'Maharashtra State Innovation Society','T',9,(0.88,0.92,0.88))
        d._t(54,d.H-638,'Dept. of Skills, Employment, Entrepreneurship & Innovation','T',9,(0.88,0.92,0.88))
        d._t(54,d.H-668,'Category','HB',8.5,(0.65,0.78,0.68))
        d._t(54,d.H-684,'Software  |  Theme: Agriculture, FoodTech & Rural Development','T',9,(1,1,1))
        d._t(54,d.H-714,'Team','HB',8.5,(0.65,0.78,0.68))
        d._t(54,d.H-730,'6 members  |  Second SIH attempt  |  Target: Winner','T',9,(1,1,1))
        d._t(54,60,'Prepared as an internal working document. All external figures carry inline provenance.','TI',8,(0.6,0.72,0.62))
        d.newpage(footer=False)
    else:
        d.p('**Smart India Hackathon 2026 | Problem Statement 26132**')
        d.p('# MANDI-SETU')
        d.p('### The Farmer Price Realisation Stack')
        d.p('*Strengthening Market Linkages and Price Discovery for Farmers of Maharashtra*')
        d.p('**Organisation:** Government of Maharashtra, Maharashtra State Innovation Society, Department of Skills, Employment, Entrepreneurship and Innovation')
        d.p('**Category:** Software | **Theme:** Agriculture, FoodTech & Rural Development')
        d.p('**Team:** 6 members. Second SIH attempt.')
        d.p('---')

    # ============ HOW TO USE ============
    d.h1('How to Use This Document','00')
    d.p('This is a working document, not a brochure. It is written to be argued with, cut down, and turned into code. Every chapter has a job.')
    d.table(['Chapter','What it gives you','Who on the team owns it'],[
      ['01 Problem decode','Line-by-line reading of the official PS text, and what the evaluator is actually asking for','Everyone, day 1'],
      ['02 Root cause','Why farmers lose money, mapped to five distinct failure mechanisms','Pitch lead'],
      ['03 Landscape','What already exists (eNAM, Agmarknet, agri-startups) and the honest gap analysis','Pitch lead + research'],
      ['04 Solution thesis','The one-sentence idea, the five product pillars, and the wedge','Everyone'],
      ['05 Architecture','Services, data flow, tech stack, deployment','Backend + DevOps'],
      ['06 ML system','Every model, its inputs, its loss function, its evaluation, its failure mode','ML pair'],
      ['07 Data sources','Named datasets, access paths, licences, and how to build the training corpus','ML pair'],
      ['08 Trust & transaction','Lots, grading, escrow, e-NWR, disputes - the part that makes money actually arrive','Backend'],
      ['09 UX for low literacy','Voice-first Marathi design, screen-by-screen','Frontend + design'],
      ['10 Build plan','36-hour hackathon plan and the 8-week pre-work plan, hour by hour','Team lead'],
      ['11 Demo script','The exact 8-minute narrative, minute by minute, with fallbacks','Pitch lead'],
      ['12 Judging strategy','How SIH is scored and how to farm each criterion','Pitch lead'],
      ['13 Risks','Every hole a judge will poke, and the pre-written answer','Everyone'],
      ['14 Impact model','The arithmetic that turns your demo into a rupee number','Pitch lead'],
      ['15 Roadmap','What happens after SIH - pilot, scale, sustainability','Team lead'],
      ['16 Appendices','Data dictionary, API contracts, reading list, checklists','Reference'],
    ],[0.16,0.54,0.30])
    d.callout('READ THIS FIRST',
      'The single most common reason strong SIH teams lose is that they build a dashboard and call it a solution. '
      'A dashboard shows a farmer a price. It does not put money in the farmer\'s hand. This document is organised around '
      'one obsession: the farmer must end the day with more rupees than they would have had otherwise, and the system must '
      'be able to prove it. Every feature that does not serve that obsession is a distraction, and there is a section later '
      'in this document listing the features we are deliberately NOT building.')
    d.h2('A note on provenance and honesty')
    d.p('This document distinguishes three kinds of claims, and you must keep the distinction when you present:')
    d.bul([
      'VERIFIED - sourced from a document retrieved during research for this playbook. Cited inline.',
      'STRUCTURAL - a logical consequence of how the system works (for example: if a commission agent both lends to and buys from a farmer, the farmer has weak bargaining power). These need no citation but must be argued, not asserted.',
      'TO VERIFY - a number or fact we believe is roughly right but have not confirmed from primary source. These are flagged with [VERIFY] and you must confirm or drop them before the pitch. Do not let a [VERIFY] number reach a judge unchecked, because if a judge from the Maharashtra agriculture department catches one wrong number your credibility on all the others collapses.',
    ])
    d.callout('ON THE SEARCH CONSTRAINT',
      'Live web search was blocked in the environment where this document was assembled, so government portals '
      '(agmarknet.gov.in, enam.gov.in, msamb.com, data.gov.in) could not be queried directly. Academic literature via the arXiv API '
      'and encyclopaedic sources were reachable and are cited. Chapter 07 therefore tells you exactly which portal to open, '
      'what to look for, and what shape the data comes in - treat that chapter as a task list for week 1, not as a completed data audit.',
      color=(0.75,0.35,0.15), bg=(1.0,0.955,0.94))

    # ============ CH 1 ============
    d.h1('Decoding the Problem Statement','01')
    d.h2('1.1 The official text, unpacked')
    d.p('Here is the problem description as published, split into its component claims. Each line of the original is a requirement in disguise, and the team that maps features to these lines one-to-one will score higher on "relevance to problem statement" than the team with the prettier UI.')
    d.table(['Official phrase','What the evaluator means','Your feature'],[
      ['"limited visibility of current and expected prices across nearby markets"','Not just today\'s price. Expected. Forecasting is explicitly asked for. And "nearby markets" means multi-mandi comparison, not single-mandi lookup.','Multi-mandi price board + 14-day forecast with intervals'],
      ['"processors, institutional buyers and digital trading channels"','The buyer set is wider than mandi traders. Processors (dal mills, ginners, cold stores), institutional (retail chains, HORECA, exporters), and e-platforms.','Buyer graph with four buyer classes, not just traders'],
      ['"Information on quality specifications, demand, logistics, storage, payment reliability and buyer credentials may be fragmented"','Six distinct information gaps named. Each one is a data model in your system.','Six-facet buyer/lot profile; payment-reliability score'],
      ['"sell immediately after harvest because of liquidity or storage constraints"','This is the distress-sale mechanism. The answer is not advice, it is liquidity. Advising a farmer to wait without giving them cash is useless.','e-NWR pledge finance + storage matching + sale-window advice'],
      ['"weak bargaining power"','Structural. One farmer with 8 quintals against a licensed trader cartel. The answer is aggregation.','FPO lot pooling with fair split ledger'],
      ['"Buyers... struggle to aggregate consistent volumes and verify quality"','The buyer has a real pain too. Solve it and buyers pull the platform forward. This is your demand-side wedge.','Guaranteed graded lots, volume commitment, assay certificate'],
      ['"improve transparent price discovery"','Transparent = auditable. Not "we show a price" but "here is why this price, and here is the record".','Open auction with sealed-bid option + immutable trade log'],
      ['"reliable, efficient linkages from farm gate to suitable buyers"','Farm GATE. First mile. Transport is in scope.','Transport pooling + route optimisation'],
    ],[0.30,0.42,0.28])
    d.h2('1.2 The expected-outcome checklist')
    d.p('The PS lists the expected solution as a set of capabilities. Treat this as the marking scheme. Print it. Tick it off. A judge reading your submission should be able to find every one of these words in your demo.')
    d.table(['#','Required capability','Status in our design','Where'],[
      ['1','Aggregates mandi prices','Core. Agmarknet + eNAM + FPO-reported prices, reconciled','Ch 5, 7'],
      ['2','Buyer demand','Buyer intent board: standing orders and spot RFQs','Ch 8'],
      ['3','Quality requirements','Grade schema per commodity, mapped to AGMARK and buyer-specific specs','Ch 8'],
      ['4','Arrival volumes','Arrival series is both a display and a model feature','Ch 6, 7'],
      ['5','Transport and storage options','Transport pool + warehouse capacity index','Ch 8'],
      ['6','Localised price trends','District and mandi-level, not state-level. Localisation is explicit.','Ch 6'],
      ['7','Sale-window recommendations','The Sell/Hold/Store engine. This is our differentiator.','Ch 6'],
      ['8','Matches farmers/FPOs with verified buyers','Two-sided matcher with verification tiers','Ch 8'],
      ['9','Lot creation','Digital lot with provenance, grade, photos, quantity','Ch 8'],
      ['10','Quality grading','On-device CV grading + assay integration','Ch 6, 8'],
      ['11','Digital offers','Structured offer/counter-offer flow, auction or negotiated','Ch 8'],
      ['12','Logistics coordination','Trip creation, pooling, tracking','Ch 8'],
      ['13','Payment tracking','Escrow-style milestone tracking with UPI/RTGS references','Ch 8'],
      ['14','Dispute or grievance process','ODR flow with evidence trail and SLA clock','Ch 8'],
    ],[0.05,0.30,0.42,0.10])
    d.h3('And the outcomes they will measure you against')
    d.bul([
      'Improved farmer price realisation - you must be able to produce a number.',
      'Reduced information asymmetry - measurable as forecast accuracy plus reach.',
      'Lower transaction cost - measurable as commission plus transport plus wastage saved.',
      'Stronger FPO aggregation - measurable as lot size and number of farmers per lot.',
      'Reduced post-harvest loss - measurable as tonnes diverted from spoilage to storage or faster sale.',
      'More reliable buyer sourcing - measurable as fill rate and repeat-buyer rate.',
      'Transparent transaction records - measurable as completeness of the audit trail.',
    ])
    d.callout('THE HIDDEN REQUIREMENT',
      'Read outcome one and outcome seven together: "improved farmer price realisation" and "transparent transaction records". '
      'Put together they mean the system must be able to answer, for any single transaction, the question: did this farmer get '
      'a fair price, and how do we know? That is a measurement problem, not a UI problem. Build the measurement into the product '
      'from the first commit - a Realisation Ledger that records, for every trade, the counterfactual (what the farmer would have '
      'got in their default mandi that day) alongside the actual. No other team will do this, and it is the single thing that turns '
      'your demo from a claim into evidence.')

    d.h2('1.3 Why Maharashtra is the right scope, and how to say so')
    d.p('You have decided to build for Maharashtra only. That is correct, and you should defend it as a strength rather than apologising for it. Here is the argument.')
    d.num([
      'The problem statement is issued by the Government of Maharashtra. Solving for Maharashtra is solving for the customer. A generic pan-India solution is a worse answer to this specific question.',
      'Maharashtra has the deepest institutional surface to integrate with. MSAMB oversees roughly 295 APMCs in the state (Wikipedia, Agricultural produce market committee). That is a large, real, addressable set of markets with existing digital touchpoints.',
      'Maharashtra is the state where this problem is most acute. It is the worst-affected state for farmer suicides: over 60,000 deaths recorded 1995-2013 and 4,248 in 2022 (NCRB figures via Wikipedia, Farmers\' suicides in India). If the intervention works anywhere, it must work here first.',
      'Maharashtra already reformed in the direction our solution needs. In July 2016 the state removed fruits and vegetables from APMC jurisdiction and issued 148 direct marketing licences, 91 of them for fruits and vegetables (Wikipedia, APMC). The legal permission for direct farmer-to-buyer sale already exists in the crops with the worst volatility. We are not asking for a law change; we are building the missing software layer on top of a reform that already happened.',
      'Crop diversity gives us a hard test bed in one state. Onion (Nashik/Lasalgaon), cotton and soybean (Vidarbha), sugarcane (western Maharashtra), pulses and oilseeds (Marathwada), grapes and pomegranate (Nashik/Solapur), banana (Jalgaon), Nagpur orange. Perishable and non-perishable, MSP-covered and not, export-oriented and domestic. Any architecture that survives this set will generalise.',
      'One language, one regulator, one dialect family. Marathi-first voice UX is achievable at demo quality in the time available. A multi-language build would be shallow in every language.',
    ])
    d.callout('THE LINE TO USE IN THE PITCH',
      '"We deliberately scoped to Maharashtra. Not because the problem is smaller here, but because it is largest here - '
      'this is the state with the most farmer suicides in India - and because Maharashtra has already done the legal reform '
      'that our design needs. We are the software layer on a reform that is already law. Everything we built is state-parameterised, '
      'so Karnataka is a config file, not a rewrite."')

    d.h2('1.4 The five crops we will build against')
    d.p('Do not build for "all crops". Build for five, deeply, and show the schema generalises. These five are chosen to cover the distinct economics.')
    d.table(['Crop','Region','Why it is in the set','Economic character'],[
      ['Onion','Nashik, Ahmednagar, Solapur','Extreme volatility, storable, export-policy sensitive, politically visible. Lasalgaon is the reference market and BARC runs an irradiation plant there for shelf-life extension (Wikipedia, Lasalgaon).','Storable + volatile = the sale-window engine has maximum value here'],
      ['Tomato','Pune, Nashik, Satara','Highly perishable, violent price swings, most-studied crop in the price-forecast literature (Jain et al. 2020; Bhardwaj et al. 2023 both use tomato).','Perishable = speed of match matters more than timing'],
      ['Soybean','Vidarbha, Marathwada','MSP-covered oilseed, large area, moisture-sensitive grading, ties to the debt narrative.','MSP floor exists but procurement is thin - the gap is the story'],
      ['Cotton','Yavatmal, Amravati, Akola','The crop at the centre of the Vidarbha distress narrative. Amravati and Yavatmal are named cotton districts (Wikipedia, Vidarbha).','Long payment cycles, ginner concentration, staple-length grading'],
      ['Tur / Chana (pulses)','Marathwada, Latur','MSP-covered, storable, and the crop group MSP has historically underserved relative to wheat and rice (Wikipedia, MSP).','Storage + pledge finance is the whole answer here'],
    ],[0.12,0.20,0.42,0.26])
    d.h3('And the grading dimensions per crop, because grading is where trust is won')
    d.table(['Crop','Grade axes we will model','Assay proxy'],[
      ['Onion','Size distribution (mm bands), colour uniformity, neck condition, sprouting, rot fraction, dry-skin cover','CV on a 12-shot photo set + weight sample'],
      ['Tomato','Ripeness stage, size grade, blemish fraction, firmness proxy, cracking','CV + declared harvest date'],
      ['Soybean','Moisture percent, foreign matter, damaged/split fraction, oil content proxy','Moisture meter reading + CV for FM and splits'],
      ['Cotton','Staple length, micronaire proxy, trash fraction, colour grade, moisture','Trash and colour by CV; staple by declared variety plus sample'],
      ['Tur/Chana','Moisture, foreign matter, weevil damage, size uniformity, split fraction','Moisture meter + CV'],
    ],[0.12,0.56,0.32])
    return d
