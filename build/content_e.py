# -*- coding: utf-8 -*-
"""Chapters 08-09: trust and transaction layer, UX for low literacy."""

def build(d, PDF=False):
    d.h1('Trust and Transaction Layer','08')
    d.p('Chapter 02 established that counterparty risk is a tax on every other improvement: a better price that is not credible is not taken. This chapter is how we make distant prices credible. It is also the chapter that covers the problem statement clauses most teams will skim past - grading, payment tracking and grievance handling - which makes it a cheap place to win points.')

    d.h2('8.1 Buyer verification: four tiers')
    d.table(['Tier','Requirements','What the buyer can do','Displayed as'],[
      ['T0 Unverified','Phone + OTP only','Browse lots. Cannot make offers','Grey - no badge'],
      ['T1 Identity verified','PAN + GSTIN validated against the public registry, bank account penny-drop verified','Offer up to a low value cap, escrow mandatory, prepayment required','Bronze'],
      ['T2 Licence verified','T1 plus APMC trader licence or processor registration verified, plus a physical-address check','Higher cap, escrow default but negotiable after 5 clean settlements','Silver'],
      ['T3 Track-record verified','T2 plus at least 10 settled transactions on-platform with a payment-reliability score above threshold and dispute rate below threshold','No value cap, may negotiate direct settlement terms, gets priority in matching','Gold'],
    ],[0.16,0.34,0.34,0.16])
    d.p('The point of tiering is that it is honest in both directions. A farmer sees exactly how much a counterparty has been checked, and a new buyer sees exactly what they must do to get better access. Compare this with platforms where "verified" is a single opaque tick.')

    d.h3('The payment-reliability score')
    d.code(
'reliability = 100 * w1 * ontime_rate\n'
'            + 100 * w2 * (1 - dispute_rate)\n'
'            + 100 * w3 * (1 - renegotiation_rate)\n'
'            + 100 * w4 * volume_consistency\n'
'            + tier_bonus\n'
'  ontime_rate          = settled within agreed terms / total settled\n'
'  dispute_rate         = disputes raised against buyer / total txns\n'
'  renegotiation_rate   = post-delivery downward price changes / total txns\n'
'  volume_consistency   = 1 - coefficient of variation of monthly purchase volume\n'
'\n'
'ALWAYS SHOWN TO THE FARMER AS PLAIN FACTS, NOT JUST A NUMBER:\n'
'  "Ganesh Traders - Gold. 47 deals on this platform. Pays in 3 days on average.\n'
'   Never re-negotiated after delivery. 1 dispute, resolved in the farmer\'s favour."\n', label='reliability-score')
    d.p('Note `renegotiation_rate` specifically. Post-delivery downward renegotiation on a quality pretext is one of the most common ways a farmer loses money after agreeing a price, and no existing platform scores it. Tracking it is a small feature with a large signalling value: it tells a judge you know what actually happens at a mandi gate.')

    d.h2('8.2 Grading: three tiers and an abstention')
    d.table(['Tier','Method','Cost','Trust weight','When required'],[
      ['T1 Self + photo','Farmer declares attributes, uploads photos under a guided capture protocol','Free','Low','Lots below a value threshold, or where buyer accepts'],
      ['T2 CV assist','On-device CNN estimates size distribution, colour uniformity and visible-defect ratio; a rule engine combines with measured moisture and farmer-declared attributes','Free','Medium','Default for most lots'],
      ['T3 Independent assay','eNAM assaying lab, APMC assayer, or an accredited third party','Small fee, often shared with buyer','High','Lots above a value threshold, export-bound lots, or when a buyer requires it'],
    ],[0.14,0.42,0.10,0.12,0.22])
    d.p('The model must be able to abstain. If image quality is poor, or the produce is a variety outside the training distribution, the correct output is "cannot grade - please get an assay", not a guess. An abstaining grader is trusted; a guessing grader is discovered.')
    d.h3('Onion grading dimensions - concrete example')
    d.table(['Attribute','How measured','Grade A','Grade B','Grade C / processor'],[
      ['Size / diameter','CV from image with reference object for scale','45-65 mm, uniform','30-45 mm or mixed','Under 30 mm or heavily mixed'],
      ['Colour uniformity','CV histogram analysis','Uniform, characteristic','Slight variation','Significant variation'],
      ['Visible defects','CV defect segmentation','Under 2%','2-5%','Over 5%'],
      ['Sprouting / rot','CV plus farmer declaration','None','Trace','Present - route to processing fast'],
      ['Moisture / neck','Manual check, guided prompt','Well cured, tight neck','Adequately cured','Poorly cured - short shelf life, do not recommend HOLD'],
    ],[0.16,0.28,0.20,0.18,0.18])
    d.p('The last row matters more than it looks. Grading is not only a price input - it is an input to the HOLD decision. A poorly cured lot cannot be held, so the sale-window engine must refuse to recommend holding it regardless of the price forecast. That linkage between grading and advice is a genuine integration point and worth saying out loud.')

    d.h2('8.3 The FPO fair-split ledger')
    d.p('This is the feature that makes FPO aggregation actually work, and it takes an afternoon to build.')
    d.code(
'PROBLEM: 14 farmers pool 186 quintals of onion. It sells as one lot at Rs 1,420/qtl.\n'
'         Farmer 7 believes their onions were the best and should get more.\n'
'         Farmer 3 believes the split favoured the FPO chairperson\'s cousin.\n'
'         Without a pre-agreed rule, the FPO breaks after one sale.\n'
'\n'
'SOLUTION: grade-weighted proportional split, consented BEFORE the sale.\n'
'\n'
'  grade_multiplier:  A = 1.00   B = 0.88   C = 0.72   D = 0.55\n'
'      (multipliers set from the actual observed price ratios between grades\n'
'       in that mandi over the last 90 days - not arbitrary numbers)\n'
'\n'
'  weight_i = qty_i * grade_multiplier_i\n'
'  share_i  = weight_i / sum(weight_j)\n'
'  payout_i = share_i * (gross - shared_costs) - individual_costs_i\n'
'\n'
'  shared_costs     = transport, mandi fee, commission, FPO service charge\n'
'  individual_costs = that farmer\'s own storage or pledge interest, if any\n'
'\n'
'EXAMPLE\n'
'  Farmer 3:  22 qtl, Grade A -> weight 22.00\n'
'  Farmer 7:  18 qtl, Grade B -> weight 15.84\n'
'  Farmer 9:  31 qtl, Grade C -> weight 22.32\n'
'  ... total weight across 14 members = 162.4\n'
'  Gross = 186 x 1420 = Rs 264,120.  Shared costs = Rs 11,300.  Net pool = Rs 252,820\n'
'  Farmer 3 share = 22.00/162.4 = 13.55%  ->  Rs 34,257\n'
'\n'
'MECHANISM: every member sees their own projected share, the multiplier applied\n'
'to their grade, the assay that produced that grade with its photos, and the full\n'
'member table - BEFORE they tap consent. Consent is recorded with a timestamp.\n'
'A dispute about the split is therefore a dispute about a rule they approved,\n'
'which is a conversation, not a fight.\n', label='fpo-split')
    d.callout('WHY THIS IS A WINNING FEATURE',
      'The problem statement asks for "stronger FPO level aggregation". Every team will say "we support FPOs". '
      'You will show the specific mechanism by which FPO trust does not collapse - transparent, grade-weighted, '
      'consented in advance, with the multipliers derived from observed market price ratios rather than invented. '
      'That is what "stronger aggregation" actually requires.')

    d.h2('8.4 Escrow and settlement state machine')
    d.code(
'  CREATED ---(buyer funds)---> FUNDED ---(farmer dispatches)---> IN_TRANSIT\n'
'     |                            |                                  |\n'
'     | expires                    | buyer cancels                    v\n'
'     v                            v                              DELIVERED\n'
'  EXPIRED                     REFUNDED                               |\n'
'                                                                     v\n'
'                                                                 INSPECTED\n'
'                                                        +------------+-----------+\n'
'                                                        | assay matches          | mismatch claimed\n'
'                                                        v                        v\n'
'                                                    RELEASED                 DISPUTED\n'
'                                                 (farmer paid)                   |\n'
'                                        pledge auto-repaid if any                v\n'
'                                                                    +------------+-----------+\n'
'                                                                    | agreed partial release  | escalate\n'
'                                                                    v                        v\n'
'                                                            PARTIAL_RELEASED           ADJUDICATED\n'
'\n'
'RULES THAT PROTECT THE FARMER\n'
'  - Funds must be in escrow BEFORE dispatch. No dispatch against a promise.\n'
'  - Auto-release after N days if the buyer does not inspect. Silence is not a veto.\n'
'  - A quality dispute must cite specific attributes and attach evidence, and it is\n'
'    compared against the pre-dispatch assay with its timestamped photos.\n'
'  - A dispute cannot reduce price below the grade actually delivered per that assay.\n'
'  - Every dispute, and its outcome, feeds the buyer reliability score. A buyer who\n'
'    disputes habitually becomes visibly expensive to deal with.\n', label='escrow-fsm')

    d.h2('8.5 Dispute and grievance handling')
    d.table(['Stage','Who','SLA','What happens'],[
      ['S1 Structured claim','Raising party','Immediate','Category, specific attributes contested, evidence photos, proposed remedy. Free text alone is not accepted - structure is what makes resolution fast'],
      ['S2 Automated comparison','System','Instant','Compares the claim against the pre-dispatch assay, photos and metadata. Many disputes resolve here because the evidence already exists'],
      ['S3 Bilateral window','Both parties','48 hours','Structured settlement options: accept, partial release at a computed grade-adjusted price, or return'],
      ['S4 Platform mediation','Trained mediator, FPO representative available to support the farmer','5 working days','Reviews evidence, proposes a binding-by-consent outcome'],
      ['S5 External escalation','ODR provider, APMC dispute committee, or the consumer/legal route','As per forum','Case file exported in a structured, complete form. The audit trail makes this cheap instead of impossible'],
    ],[0.18,0.24,0.14,0.44])
    d.p('The design principle is that most disputes are evidence problems, not disagreement problems. A farmer and a buyer arguing about whether onions were 40 mm or 32 mm is unresolvable verbally and trivially resolvable with a timestamped, geotagged photo set and an assay record. Building the evidence before the dispute is the entire trick.')
    d.callout('ASYMMETRY GUARD',
      'A buyer is a business with staff and time. A farmer is one person with a phone in a field. So the dispute process must be '
      'asymmetrically supported: the farmer gets an FPO or platform representative to help file, every stage is available as Marathi voice, '
      'and no deadline is enforced against a farmer who has not been reached on a channel they use. '
      'A "fair" process that both parties navigate with equal difficulty is not fair.')

    d.h2('8.6 Transaction transparency without gratuitous blockchain')
    d.p('The problem statement asks for "transparent transaction records". You can satisfy this fully with a hash-chained append-only log, and choosing that over a blockchain is a point in your favour with technical judges.')
    d.code(
'entry_hash = SHA256( prev_hash || txn_id || farmer_id || buyer_id ||\n'
'                     agreed_price || qty || net_amt || timestamps || assay_hash )\n'
'\n'
'PROPERTIES OBTAINED\n'
'  - tamper evidence: any retrospective edit breaks the chain from that point on\n'
'  - farmer-verifiable: the farmer can download their own statement and independently\n'
'    recompute the chain over their own entries\n'
'  - exportable proof: the record is what a farmer needs to claim under a price-deficiency\n'
'    scheme like PM-AASHA, and what a lender needs to underwrite them next season\n'
'  - cheap: one Postgres table, no consensus layer, no gas, no node operations\n'
'\n'
'OPTIONAL HARDENING, if a judge pushes on immutability:\n'
'  publish a daily Merkle root of all entries to a public notarisation target.\n'
'  Anyone can then verify any historical entry against a public root without us\n'
'  running a chain. Say this - it shows you know the trade-off rather than\n'
'  defaulting to either extreme.\n', label='hash-chain')
    d.p('Have the sentence ready: "We considered a blockchain and rejected it. Our integrity requirement is tamper-evidence and farmer-verifiability, which a hash chain plus daily public notarisation gives us at a fraction of the operational cost. We would rather spend that engineering on the pledge-credit loop, which is what actually puts money in a farmer\'s hand."')

    # ============== CH 9 =================
    d.h1('Designing for a Farmer Who May Not Read','09')
    d.p('This chapter is where most hackathon projects quietly fail the real user. Maharashtra female literacy is around 75 percent against 89 percent for men (Wikipedia, Maharashtra), and the ability to read a price chart is a much higher bar than the ability to sign a name. If your interface assumes reading, you have excluded a large share of the people the problem statement is about - disproportionately women, who do much of the agricultural labour.')

    d.h2('9.1 The four-channel strategy')
    d.table(['Channel','For whom','What it carries','Why it exists'],[
      ['Android app','Farmers with a smartphone, and FPO staff','Full functionality: forecast, sale window, lot creation, photo grading, offers, ledger','The rich experience, offline-first'],
      ['IVR voice call in Marathi','Feature-phone users, non-readers','Today\'s price, the sale-window recommendation with its reason, offer alerts, accept/reject by keypad or speech','The most inclusive channel. A phone call requires no literacy and no data'],
      ['WhatsApp','The large middle: smartphone but low app-install willingness','Daily price card as an image, voice-note recommendation, offer notifications, document delivery','Where farmers already are. The AIEP field study (arXiv:2601.11537) validates IVR plus WhatsApp as the deployed pattern'],
      ['SMS','Last-resort fallback, and all critical alerts','Price, recommendation in under 160 characters, payment confirmation','Works everywhere, always. Every money event must also arrive by SMS'],
    ],[0.15,0.20,0.35,0.30])
    d.callout('THE RULE',
      'Every action that moves money must be completable end to end on the voice channel alone. '
      'If accepting an offer requires reading, then the farmers most likely to be exploited are the ones who cannot use the protection you built.')

    d.h2('9.2 Design rules, and the reason for each')
    d.kv([
      ('Numbers, not charts, first','A price chart is a literacy artifact. Lead with "Rs 1,240 today. Rs 1,390 expected in 12 days" as large numerals with voice. The chart is available, but secondary.'),
      ('Colour and shape carry the message','Green up-arrow, red down-arrow, amber hold-clock. Never rely on colour alone - always pair it with an icon and a spoken word, both for accessibility and for colour-blind users.'),
      ('One decision per screen','The farmer app should never show two questions at once. Sell or hold. Accept or counter. Pool or sell alone.'),
      ('Rupees, always rupees','Never show a percentage as the primary figure. "Rs 88 more per quintal, so Rs 3,700 more for your 42 quintals" is understood. "6.4% improvement" is not.'),
      ('Speak the downside too','The TTS script must include the bad case: "you may also get Rs 60 less if rain damages the crop in storage". Consent must be informed, and this is also your legal and ethical protection.'),
      ('Names and places, not IDs','"Ganesh Traders, Pimpalgaon" not "Buyer #4471". Recognition is trust.'),
      ('Read every number back','On any input - quantity, price, acceptance - the system repeats it in Marathi and asks for confirmation. A mis-keyed quantity in a produce transaction is a real financial loss.'),
      ('Design for a shared phone','Many farmers use a household phone. Do not assume the device identifies the person. Light re-authentication for money actions, and no sensitive financial data on a lock-screen notification.'),
      ('Assume bright sunlight','High contrast, large type, no thin greys. The user is standing in a field at noon.'),
      ('Never a dead end','Every screen has a "call for help" that reaches a human or an IVR menu. For a user who is not confident with apps, being stuck is being abandoned.'),
    ],kw=0.24)

    d.h2('9.3 The core screen: sale window')
    d.code(
'+------------------------------------------------+\n'
'|  [ Marathi ]      Kanda (Onion)     42 quintal |\n'
'|                                                |\n'
'|            TODAY  Rs 1,240 / quintal           |\n'
'|            Lasalgaon mandi                     |\n'
'|                                                |\n'
'|  +------------------------------------------+  |\n'
'|  |   [clock icon]     THAMBA  (WAIT)        |  |\n'
'|  |                                          |  |\n'
'|  |   12 days -> about Rs 1,390 / quintal    |  |\n'
'|  |   You may get  Rs 3,700 MORE in total    |  |\n'
'|  |   Worst case:  Rs 2,500 LESS  [!]        |  |\n'
'|  |                                          |  |\n'
'|  |   Confidence: 7 out of 10  [ * * * * *   |  |\n'
'|  |                              * * o o ]   |  |\n'
'|  +------------------------------------------+  |\n'
'|                                                |\n'
'|  NEED MONEY NOW?                               |\n'
'|  +------------------------------------------+  |\n'
'|  | Store at Nashik Warehouse (11 km)        |  |\n'
'|  | Get  Rs 38,000 TODAY  as a loan          |  |\n'
'|  | Interest for 12 days:  Rs 940            |  |\n'
'|  | You still keep the higher price later    |  |\n'
'|  |        [  GET MONEY TODAY  ]             |  |\n'
'|  +------------------------------------------+  |\n'
'|                                                |\n'
'|  [ >> LISTEN IN MARATHI ]   (always visible)   |\n'
'|                                                |\n'
'|  WHY?  Arrivals are falling. Rain in Nashik    |\n'
'|        district. Prices rose the same way in    |\n'
'|        2 of the last 3 years at this time.     |\n'
'|        [ see the 3 similar past cases ]        |\n'
'|                                                |\n'
'|  [  SELL TODAY INSTEAD  ]   [  CALL FOR HELP ] |\n'
'+------------------------------------------------+\n', label='screen-sale-window')
    d.p('Six deliberate choices in that screen. The worst case is shown with equal weight to the expected case. Confidence is expressed as "7 out of 10", not "70% CI", because the former is understood and the latter is not. The cash option sits directly under the HOLD advice, so the advice is never separated from the means to follow it. The reason is stated in causal language a farmer can check against their own knowledge of the weather. The three similar past cases come from the nearest-neighbour interpretability approach in arXiv:1812.05173 - showing precedent rather than a coefficient. And "SELL TODAY INSTEAD" is always present, because a system that makes disagreeing with it hard is a system that will eventually hurt someone.')

    d.h2('9.4 The IVR script')
    d.code(
'[System calls the farmer at 7:30 a.m., or the farmer dials a toll-free number]\n'
'\n'
'TTS: "Namaskar Ramesh-ji. Aaj kandyacha bhav Lasalgaon madhye barah shey chalis rupaye\n'
'      prati quintal aahe."\n'
'      (Today onion price at Lasalgaon is 1,240 rupees per quintal.)\n'
'\n'
'TTS: "Aamchya andaajanusar barah divsaat bhav teen shey pannas rupaye vadhu shakto.\n'
'      Pan kami hi hou shakto. Aiknyasathi ek dabaa."\n'
'      (We estimate the price may rise by 350 rupees in 12 days. But it could also fall.\n'
'       Press 1 to hear more.)\n'
'\n'
'[1] -> "Tumhi 42 quintal thevlyaas andaaje teen hajaar saat shey rupaye jaast milu shaktil.\n'
'        Vaait sthiti madhye don hajaar paach shey rupaye kami hi hou shaktil.\n'
'        Aamcha vishwas: das madhun saat."\n'
'        (If you hold 42 quintals you may get about Rs 3,700 more. In the bad case you may\n'
'         get Rs 2,500 less. Our confidence: 7 out of 10.)\n'
'\n'
'        "Paise aaj lagtaat ka? Nashik godaam madhye theva ani aaj aatthis hajaar rupaye\n'
'         karj mhanun ghya. Barah divsaanche vyaaj navshe chalis rupaye.\n'
'         Hyaa sathi don dabaa."\n'
'        (Need money today? Store at Nashik warehouse and take Rs 38,000 as a loan today.\n'
'         Interest for 12 days is Rs 940. Press 2 for this.)\n'
'\n'
'[2] -> warehouse + pledge flow, with a callback from a human agent to complete\n'
'[3] -> "Aaj vikaayche aahe" -> today\'s live buyer offers, read one by one\n'
'[9] -> repeat            [0] -> connect to a human\n'
'\n'
'DESIGN NOTES\n'
'  - The downside is spoken in the SAME breath as the upside. Never a separate menu.\n'
'  - Amounts are spoken in Marathi numerals in the way a farmer says them, not digit by digit.\n'
'  - Any money-moving action requires a spoken read-back and an explicit confirm.\n'
'  - The whole call is recorded and stored with the recommendation ID. That recording is\n'
'    the consent record, and it is also your defence if advice is ever challenged.\n'
'  - Maximum 25 seconds before the first actionable choice. Farmers hang up on long menus.\n', label='ivr-script')

    d.h2('9.5 Accessibility and safeguards')
    d.bul([
      'WCAG-oriented practice on all digital surfaces: minimum 4.5:1 contrast for text, 44x44 pt touch targets, full screen-reader labelling, no colour-only signalling, and support for the OS font-scale setting. Full WCAG conformance needs manual testing with assistive technology and expert review - claim the practices, not the certification.',
      'Marathi first, with Hindi and English as options. Marathi is the language of the user, not a localisation afterthought.',
      'No dark patterns anywhere near money. No countdown timers pressuring an accept, no pre-ticked consent, no default that favours a buyer.',
      'Distress signal handling: if a farmer\'s realised prices fall below cost of production repeatedly, or they interact in ways suggesting acute distress, the system surfaces Kisan call centre and state helpline numbers. Given the outcome this project exists to prevent, this is not an optional nicety. Build it, and say in the pitch that you built it.',
      'Explicit data consent in Marathi voice, with a plain statement of what is shared with whom. Farm data is sensitive and farmers have been exploited with it before.',
      'Grievance access from every screen, one tap, no login wall.',
    ])
    return d
