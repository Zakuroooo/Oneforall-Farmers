# CLAUDE DESIGN — THE PROMPT

> **Owner: Pranay. Read by Shreya before she starts SH0.**
> This file contains the prompts you paste into **claude.ai/design**. Nothing else.

---

## 0. Read this before you paste anything

**Claude Design outputs HTML and CSS. Our app is React Native. Those two facts decide the entire shape of the prompt below.**

A design that uses CSS Grid, `position: sticky`, `hover:`, `box-shadow: inset`, percentage line-heights, or `vh` units is a design you will spend four hours fighting and then abandon at H20. So the master prompt **constrains the design to the subset of CSS that maps 1:1 onto React Native's flexbox**. That constraint is not a compromise — it is the difference between a design you ship and a screenshot you admire.

**The order matters. Do not skip PROMPT 0.**

1. **PROMPT 0** — paste once, in a new Claude Design project. It sets the design system: colours, type scale, spacing, components, the three languages, and the hard rules. Everything after it inherits this.
2. **PROMPTS 1–9** — paste one at a time, in order, in the same conversation. Each produces a screen cluster.
3. **PROMPT X** — the audit pass. Paste last. It catches what the earlier prompts let through.

**After each screen comes back, do two things before moving on:**
- Check it against the **five hard rules** in PROMPT 0 §6. If it broke one, say *"you broke rule N, fix only that"* — do not re-prompt from scratch.
- **Screenshot it into `docs/design/screens/`.** That folder is what you build against at P3 onward, and it is what goes on slide 4.

**One thing you must not let the design do:** invent a number. Every rupee figure, every date, every quantity in these prompts is the real seeded figure from `00_CANON.md` §7.4. If Claude Design returns a screen showing ₹2,340 or "14 days" or a best-case figure, **that number is fiction and it will end up in a rehearsal.** Correct it immediately.

---

## PROMPT 0 — the design system

> Paste this first, alone, and wait for it to finish before sending PROMPT 1.

```
You are designing MANDI-SETU, an Android app for onion and tomato farmers in
rural Maharashtra, India. It is being built for a Government of Maharashtra
hackathon. I will ask for screens one at a time. This first message sets the
design system — apply it to every screen you produce afterwards without me
repeating it.

═══════════════════════════════════════════════════════════════════
WHO USES THIS
═══════════════════════════════════════════════════════════════════

The primary user is a 45-year-old onion farmer in Nashik district. Assume:

- He reads Marathi slowly. He may not read at all. He recognises NUMBERS
  and ICONS faster than words.
- He is holding a ₹6,000 Android phone with a scratched screen, outdoors,
  in bright sunlight, with one hand, possibly with soil on his fingers.
- He has never used a financial app. He has used WhatsApp.
- He is deciding whether to sell his entire annual income today or wait
  eleven days. That is the emotional weight of the main screen. Design for
  someone making the most consequential financial decision of their year on
  a phone, in a field.

The secondary user is a vegetable trader in Pune. Different person entirely:
literate, fast, comparing twelve options, wants density and tables. Same app,
different navigator. Do not soften the buyer screens for the farmer's sake.

═══════════════════════════════════════════════════════════════════
THE ONE THING THIS APP DOES
═══════════════════════════════════════════════════════════════════

It answers one question: "Should I sell my crop today, or wait?"

It answers with a verdict (SELL NOW / WAIT / SELL ELSEWHERE / SPLIT), the
rupees gained by waiting, the rupees lost if the forecast is wrong, and a
confidence band. Sometimes it answers "I don't know" and explains why.

Every screen either delivers that answer or makes it believable. If a screen
element does neither, remove it.

═══════════════════════════════════════════════════════════════════
1. COLOUR
═══════════════════════════════════════════════════════════════════

Sunlight-legible. High contrast. No pastels, no gradients on text, no
glassmorphism, no dark mode.

  --soil          #2E7D32   primary green — actions, the WAIT verdict
  --soil-dark     #1B5E20   pressed state
  --soil-tint     #E8F5E9   card backgrounds, selected chips
  --sell          #E65100   deep orange — the SELL NOW verdict
  --loss          #C62828   red — the worst case, and only the worst case
  --gain          #2E7D32   green — the expected gain
  --ink           #1A1A1A   primary text
  --ink-2         #5F6368   secondary text (never below 14sp)
  --line          #DADCE0   1px hairlines
  --paper         #FFFFFF   screen background
  --paper-2       #F7F8F7   section background
  --warn          #F9A825   amber — the STALE DATA banner
  --refuse        #6A5ACD   slate violet — the NO_ADVICE state

Contrast floor: 4.5:1 for all text. Check --ink-2 on --paper-2 specifically.

NEVER use red and green as the ONLY difference between two things. About 1 in
12 men in this user group has red-green colour deficiency. Gain and loss must
also differ by SIGN (+ / −) and by an arrow icon (▲ / ▼). This is not
optional politeness; it is the difference between a farmer reading a gain as
a loss and selling.

═══════════════════════════════════════════════════════════════════
2. TYPE
═══════════════════════════════════════════════════════════════════

Font: Noto Sans Devanagari for Marathi and Hindi, Roboto for English. Both
ship on Android. Use no other font.

  verdict      32sp / 700   the word WAIT or SELL NOW. Once per screen, max.
  money-hero   28sp / 700   the two rupee figures on the verdict screen
  money        22sp / 700   any other rupee figure
  h1           24sp / 700   screen titles
  h2           18sp / 600   section headers
  body         16sp / 400   the floor for anything a farmer must read
  label        14sp / 500   field labels, chip text, badges
  caption      12sp / 400   ONLY for source badges and timestamps. Never for
                            anything a decision depends on.

Line height 1.5× for Devanagari — it has ascenders and descenders Latin does
not, and 1.2 clips the मात्रा. Devanagari also renders visually smaller than
Latin at the same point size, so never go below 16sp for Marathi body text.

═══════════════════════════════════════════════════════════════════
3. SPACING, TOUCH, LAYOUT
═══════════════════════════════════════════════════════════════════

4pt base scale: 4 / 8 / 12 / 16 / 24 / 32 / 48.
Screen padding 16. Card padding 16. Card radius 12. Card border 1px --line.
Elevation: a 1px border, not a shadow. Shadows do not survive the port to
React Native cleanly and they cost nothing to lose.

Minimum touch target 56×56dp. Not 44 — 44 is Apple's number for an office.
This user has thick fingers, a cracked screen protector, and is standing up.
Primary buttons are 56dp tall and full width minus 32.

Design to a 360×640dp viewport — the cheapest common Android screen in
India, not an iPhone 15 Pro. If it needs 390dp it is wrong.

LAYOUT CONSTRAINT, AND THIS ONE IS ABSOLUTE:
Use flexbox only. Column and row, gap, flex, align-items, justify-content.
NO CSS Grid. NO position: absolute except for a badge pinned to a card
corner. NO position: sticky, NO position: fixed. NO float. NO vh/vw units.
NO calc(). NO :hover as the only affordance for anything — this is a
touchscreen, there is no hover. NO transitions longer than 200ms.

Reason: this becomes React Native, which has flexbox and nothing else. A
design using Grid is a design I have to redraw.

═══════════════════════════════════════════════════════════════════
4. THREE LANGUAGES — MARATHI, HINDI, ENGLISH
═══════════════════════════════════════════════════════════════════

MARATHI IS THE DEFAULT. The app opens in Marathi with no toggle needed.
Hindi second, English third. English is the fallback, not the base.

For every screen you design, show me the MARATHI version as the primary
artboard. Then show the same screen in Hindi and English side by side,
smaller, so I can see the text-length differences.

Devanagari numerals in Marathi and Hindi. ₹६,२९० not ₹6,290. The rupee sign
stays ₹ in all three languages. Latin numerals in English only.

Indian digit grouping, always: ₹१,४२,००० — two-two-three, not ₹142,000.
Getting this wrong reads as "built by people who don't live here."

Text expansion budget: Hindi runs 10–15% longer than Marathi, English
usually shorter but with longer unbroken words. Every button, chip and label
must survive the LONGEST of the three without truncating, wrapping to three
lines, or shrinking its font. Design the button to the Hindi width.

The language switcher: a globe icon in the top-right of the home screen
opening a three-row sheet — मराठी / हिंदी / English — each row showing the
language in its OWN script, with the active one check-marked. Not a
flag icon. Flags mean country, not language, and Marathi has no flag.

═══════════════════════════════════════════════════════════════════
5. CAROUSELS — where they go and how they behave
═══════════════════════════════════════════════════════════════════

Carousels are load-bearing in this app, not decoration. Six of them:

  C1  HOME — MARKET PRICE CARDS. Horizontal, one card per mandi (Lasalgaon,
      Pimpalgaon, Niphad, Yeola, Nashik, Pune). Each card: mandi name,
      today's modal price per quintal in Devanagari, a ▲/▼ change chip, and
      a small SOURCE BADGE. Card width ~280 of a 360 viewport so the next
      card PEEKS by 60 — the peek is what tells a farmer to swipe. Snaps
      to card. Page dots below.

  C2  HOME — YOUR LOTS. Horizontal cards of the farmer's own listed lots:
      crop icon, quantity in quintals, grade pill, current best offer. Plus
      a final "+ नवीन लॉट" card in dashed outline as the empty-state and
      the add-affordance in the same slot.

  C3  VERDICT SCREEN — REASONS. Horizontal cards behind the verdict, each
      one reason the model believes what it believes: "आवक कमी होत आहे"
      (arrivals falling) with a tiny sparkline, "मागील ५ वर्षांत या
      आठवड्यात भाव वाढला" (prices rose this week in 5 past years), etc.
      Three to five cards. This carousel is why the farmer trusts the number.

  C4  ONBOARDING — a 3-slide full-bleed intro. Illustration, one Marathi
      sentence at 18sp, page dots, and a SKIP that is always visible from
      slide 1. Never trap a user in onboarding.

  C5  BUYER — MATCHED LOTS. Horizontal cards of farmer lots matching the
      buyer's demand, including COMBINATION cards that aggregate 3 farmers
      into one fulfillable quantity. The combination card must look
      visually distinct — a stacked/layered card edge — because "three
      farmers, one order" is the single most interesting thing on the
      buyer's screen.

  C6  ASSISTANT — SUGGESTED QUESTIONS. Horizontal chips of things the
      farmer can ask, in the active language.

CAROUSEL RULES:
- Horizontal scroll, snap to card, page dots below (dots not numbers).
- The next card always PEEKS. A card that fills the full width looks like
  a static card and does not get swiped.
- Every carousel needs a designed EMPTY state — not a blank strip. One
  dashed-outline card with an icon and a single line of Marathi.
- Never nest a vertical scroll inside a horizontal one.
- Never put the primary action of a screen inside a carousel. If he must
  swipe to find the button, the button is lost.
- Cap at 8 cards, then a final "सर्व पहा →" card that navigates to a list.

═══════════════════════════════════════════════════════════════════
6. THE FIVE HARD RULES — I will check every screen against these
═══════════════════════════════════════════════════════════════════

RULE 1 — BOTH NUMBERS, SAME SIZE.
Wherever the expected gain from waiting appears, the WORST CASE appears
directly beneath it at the IDENTICAL font size, weight and prominence.
28sp and 28sp. Never smaller, never greyer, never collapsed behind a tap,
never below the fold, never in a tooltip. A farmer who sees +₹6,290 in
28sp and −₹4,800 in 14sp has been misled by a designer, and he is the one
who pays for it. If you find yourself making the loss less prominent
because it "looks negative", stop — that instinct is the bug.

RULE 2 — EVERY PRICE CARRIES ITS SOURCE.
Every price, forecast and chart has a small badge naming where the number
came from: AGMARKNET / MSAMB / ARCHIVE / IMPUTED / SIMULATED. The badge is
12sp, outlined, low-key — but present, always, with no exceptions. This is
a government panel. An unlabelled number is the one unrecoverable mistake
available to us.

RULE 3 — THE APP IS ALLOWED TO SAY "I DON'T KNOW".
There is a full designed state where the app REFUSES to give a verdict
because its forecast band is too wide. Design it as a calm, confident,
first-class screen — violet, not red; an explanation, not an error; no
retry button, no sad face, no warning triangle. It is not a failure state.
It is the most trustworthy screen in the product and it should look like
the app is being straight with you.

RULE 4 — ONE DECISION PER SCREEN.
One primary button, at the bottom, full width, 56dp. Everything else is
secondary or a link. If a screen has two equally-weighted buttons, split
it into two screens or demote one.

RULE 5 — FOUR STATES, EVERY SCREEN.
Loading (skeleton, not a spinner), empty (illustration + one Marathi line +
one action), error (what happened + what to do, in Marathi), and data.
When I ask for a screen, give me all four unless I say otherwise. A screen
with only the happy path is not a designed screen.

═══════════════════════════════════════════════════════════════════
7. WHAT NOT TO DO
═══════════════════════════════════════════════════════════════════

- No dark mode. No gradients behind text. No glassmorphism, no neumorphism.
- No stock photography of farmers. Simple line illustrations only, and no
  faces — a farmer looking at a stock photo of a farmer is being marketed
  to, not served.
- No emoji as UI. Icons must be a consistent 24dp stroked set.
- No "AI" sparkle icons, no glowing borders, no chat bubbles that look like
  a bot is thinking. The intelligence is in the number, not the chrome.
- No decorative percentages, no fake dashboard KPI tiles, no sparkline
  where the trend does not matter.
- No bottom-sheet that covers the verdict.
- No number I did not give you. Every rupee figure in my prompts is a real
  seeded value. Do not invent a price, a date, a quantity or a percentage —
  if you need one and I did not supply it, use ⟨X⟩ and ask me.

Acknowledge this in three lines, then wait. Do not design anything yet.
```

---

## PROMPT 1 — the verdict screen (S9). The one that matters.

> **Design this first and spend the most time on it.** It is slide 4, it is beat 5, and it is the screen a judge will photograph. Everything else in the app is scaffolding around this card.

```
Design screen S9 — THE VERDICT. This is the most important screen in the
product. Marathi primary artboard, plus Hindi and English variants.

Context: the farmer has 4000 kg (40 quintals) of onion in Nashik. He has
tapped "should I sell?" The server has answered. Use these EXACT values —
they are real seeded numbers, do not change or round them:

  verdict            HOLD  →  Marathi "थांबा"  Hindi "रुकिए"  English "WAIT"
  hold window        11 days  →  "११ दिवस" / "११ दिन" / "11 days"
  expected gain      + ₹6,290    →  "+ ₹६,२९०"
  worst case         − ₹4,800    →  "− ₹४,८००"
  on quantity        40 quintals →  "४० क्विंटलवर"
  confidence         MEDIUM      →  "मध्यम"
  costs deducted     ₹155 per quintal → "₹१५५/क्विंटल वजा"
  source             AGMARKNET

Vertical order, top to bottom:

  1. Crop + market + quantity, one line, 14sp, --ink-2.
  2. THE VERDICT WORD. 32sp/700. "थांबा". Centred. This is the answer.
  3. The window. 20sp. "११ दिवस".
  4. Label "अपेक्षित फायदा" (expected gain), 14sp.
  5. + ₹६,२९०  — 28sp/700, --gain, with a ▲ glyph.
  6. Label "सर्वात वाईट स्थिती" (worst case), 14sp.
  7. − ₹४,८००  — 28sp/700, --loss, with a ▼ glyph.
     ★ STEPS 5 AND 7 ARE THE SAME SIZE. This is Rule 1. Do not soften it.
  8. "४० क्विंटलवर · विश्वास: मध्यम" one line, 14sp.
  9. A row link: "खर्चाचा तपशील (₹१५५/क्विंटल वजा) ›" — opens the cost
     breakdown. It must be visible without scrolling, because a farmer who
     cannot see what we subtracted has no reason to believe what is left.
 10. The REASONS CAROUSEL (C3) — three cards explaining why.
 11. A 🔊 SPEAK button. 56dp circle, --soil, top-right of the verdict card,
     high contrast. Half these users cannot read the screen. This button is
     how they get the answer, and it must not look like an afterthought.
 12. Primary action, bottom, full width, 56dp: "लॉट तयार करा" (create lot).

There is NO best-case figure on this screen. Only the expected gain and the
worst case. If you add a best case you have invented a number and broken
Rule 1's whole point — the comparison is gain vs. loss, and a third
optimistic number buries the loss between two happy ones.

Show me all four states: skeleton loading, error, and — importantly — the
state where the farmer has no lot yet so there is nothing to advise on.
```

---

## PROMPT 2 — the refusal (S9-NO_ADVICE). The screen that wins the room.

```
Design the REFUSAL state of S9. Same screen, different answer: the model
declines to give a verdict.

Use these exact values:

  action           NO_ADVICE
  refusal reason   BAND_TOO_WIDE
  band width       58%   →  "५८%"
  threshold        35%   →  "३५%"
  Marathi text, render VERBATIM, do not rewrite or shorten it:
    "भाव खूप अस्थिर आहेत. अंदाजाची श्रेणी ५८% आहे, जी आमच्या ३५% मर्यादेपेक्षा
     जास्त आहे. आम्ही अंदाज देत नाही."
  English: "Prices are too volatile. Our forecast range is 58%, wider than
     our 35% limit. We are not going to guess."

Design requirements, and read them carefully because the instinct here is
wrong in an interesting way:

- --refuse violet, NOT red, NOT amber. Red means "something broke". Nothing
  broke. The system worked correctly and is telling the truth.
- NO retry button. NO "try again". NO error icon, no warning triangle, no
  sad face, no empty-box illustration. Retrying produces the same honest
  refusal and a retry button implies the app malfunctioned.
- A small visual of the band being too wide — the forecast fan with the
  35% threshold drawn across it as a dashed line, and the band visibly
  blowing past it. One glance should make the reason obvious to someone who
  cannot read the paragraph.
- The Marathi explanation at 16sp, generous line height, not caption-sized.
  This paragraph IS the screen.
- The 🔊 speak button, same as S9. The refusal must be speakable too — a
  farmer who cannot read must not be left with a violet screen he cannot
  interpret.
- Offer what we CAN do instead: "आजचा भाव पहा" (see today's price) and
  "इतर बाजार पहा" (see other markets) as two secondary links. Refusing to
  forecast is not refusing to help.

This must not look like an error screen. It must look like the most
trustworthy screen in the app — a product that knows the edge of its own
competence and says so. Design it with that confidence.
```

---

## PROMPT 3 — home + the price carousel (S5)

```
Design screen S5 — HOME, the first screen after login. Marathi primary.

Top bar: "मंडी-सेतु" wordmark left, globe language icon right (56dp target),
a bell for offers with a count badge.

Body, in order:
  1. Greeting line + the farmer's village. 16sp.
  2. ★ THE HERO ACTION — a full-width --soil card, 96dp tall:
     "आज विकावं की थांबावं?"  (sell today or wait?)  20sp/700, white,
     with a ▸ chevron. This is the only reason the app exists; it is the
     largest tappable thing on the screen and it is above every carousel.
  3. CAROUSEL C1 — market price cards. Six mandis. Each card 280dp wide so
     the seventh peeks: mandi name 16sp, price "₹१,८५०/क्विंटल" 22sp/700,
     a ▲/▼ change chip, a SOURCE BADGE reading "AGMARKNET" 12sp outlined,
     and a timestamp "आज सकाळी ८:००". Snap, page dots.
  4. CAROUSEL C2 — "माझे लॉट" (your lots). Two real cards plus the dashed
     "+ नवीन लॉट" card.
  5. A single row link: "भाव इतिहास पहा ›" (price history).

Bottom tab bar, 4 tabs, icons + Marathi labels at 12sp: होम · लॉट · संदेश
(messages, with an unread dot) · मी.

Give me the FIRST-RUN state too: no lots, no offers. C2 shows only the
dashed add-card, the notification bell has no badge, and the hero card is
even more dominant. A new farmer's home screen must not look broken — it
must look like it is waiting for one specific action.
```

---

## PROMPT 4 — the forecast chart (S8) and cost breakdown (S10)

```
Two screens.

S8 — PRICE HISTORY + FORECAST FAN.
- 180 days of history as a simple line, then the forward forecast as a
  SHADED BAND, not a line: p10 at the bottom edge, p90 at the top, p50 as a
  darker line through the middle. --soil at 18% opacity for the band.
- The band must visibly WIDEN with distance. A band of constant width is a
  lie about how forecasting works, and a judge who knows forecasting will
  see it in two seconds.
- Legend in Marathi naming the band as a range, not a prediction.
- A SOURCE BADGE on the chart itself.
- Range chips: ३० दिवस / ९० दिवस / १८० दिवस — chips, not a dropdown.
- No axis label smaller than 12sp. Y axis in Devanagari numerals.
- Keep it drawable with simple paths and polylines — no area gradients, no
  animated draw-on, no tooltips that require hover. I am rebuilding this in
  react-native-svg by hand.

S10 — COST BREAKDOWN. The credibility screen.
A plain itemised table, six rows, per quintal, exact values:
  वाहतूक (transport)      ₹८०
  आडत (commission)        ₹३०.७५
  साठवण (storage)         ₹१६.५०
  नुकसान (spoilage)       ₹२३.१०
  हमाली (loading)         ₹५
  ─────────────────────────────
  एकूण वजा (total)        ₹१५५   ← 22sp/700, a 1px rule above it
Then one line: "हे सर्व वजा केल्यावर फायदा ₹६,२९० आहे."
(after deducting all of this, the gain is ₹6,290)

Deliberately boring. A table. No pie chart, no donut, no coloured bars — a
farmer checking our arithmetic needs rows he can add up, and a judge asking
"did you net out transport?" needs to see the number, not a wedge.
```

---

## PROMPT 5 — farmer ↔ buyer CHAT (S26 farmer side, S27 buyer side)

```
Design the CHAT between a farmer and a buyer. This is human-to-human
messaging about a specific lot — it is NOT a chatbot, NOT an AI assistant,
NOT a support ticket. Two people negotiating a real onion sale.

Mental model: WhatsApp. Deviate from it only where we have a reason.

S26 — FARMER SIDE (Marathi primary).
Header: buyer's name + firm ("रमेश ट्रेडर्स, पुणे"), a VERIFIED tick if
verified, and a 📞 CALL button — 56dp, --soil, top-right, always visible.

★ PINNED LOT STRIP directly under the header, 64dp, non-scrolling: crop
icon, "४० क्विंटल कांदा · ग्रेड B", and the current live offer
"₹१,९००/क्विंटल". Both people are looking at the same object; the object
stays on screen. Chat about a lot with the lot off-screen is how people
talk past each other.

Bubbles: farmer right on --soil-tint, buyer left on --paper-2. 16sp. Radius
12 with the tail corner at 4. Timestamps 12sp. A single ✓/✓✓ for sent/read.

Three special message types, and these are the reason this is not WhatsApp:
  a) OFFER CARD — a bubble-width card: "ऑफर: ₹१,९००/क्विंटल · ४० क्विंटल ·
     एकूण ₹७६,०००" with two buttons, स्वीकारा (accept) and नकार (decline),
     plus a "प्रति-ऑफर" (counter) link.
  b) ★ COUNTER-OFFER COMPOSER — and this is the single most important
     detail in this screen: when the farmer taps counter, the input opens
     with HIS OWN FORECAST DISPLAYED DIRECTLY ABOVE THE INPUT BOX —
     "अंदाज: ११ दिवसांत ₹२,०९६/क्विंटल (श्रेणी ₹१,८१९–₹२,३५०)". He types
     his number with the forecast in his eye-line.
     Design this so the forecast is impossible to miss. It is the entire
     thesis of the product: the middleman's only real advantage is knowing
     the price curve when the farmer does not, and this is where we hand
     that advantage over. If the forecast is a small grey line the design
     has thrown away the product.
  c) SYSTEM LINE — centred, 12sp, --ink-2, no bubble: "ऑफर स्वीकारली ·
     पैसे सुरक्षित ठेवले" (offer accepted, money held in escrow).

Input row: 56dp tall, text field, a ₹ button for a quick price message, a
📷 for a photo of the crop, send. NO voice-note button — we are not building
audio upload in phase 1 and a dead button is worse than no button.

S27 — BUYER SIDE. Same conversation, English primary, denser: the pinned
strip additionally shows grade, distance and the assay date; the buyer gets
a "मागील व्यवहार" trade-history chip on the farmer's name.

Also design: the EMPTY conversation (no messages yet — a prompt to make an
opening offer), the message-list screen (S26-list: avatars, last message,
unread count, sorted by recency), and the OFFLINE state — messages queued
with a clock glyph instead of ✓, and a thin amber bar reading
"नेटवर्क नाही · संदेश पाठवले जाईल" (no network, will send).

★ The phone number is NEVER rendered anywhere in this UI. The 📞 button
dials; it does not display digits. Design it as an icon-and-label button
with no number visible. Two reasons and both matter: the farmer's number
must not leak to a trader who screenshots the screen, and a visible number
invites the exact off-platform side-deal we exist to prevent.
```

---

## PROMPT 6 — the CALL screen

```
Design the CALL affordance. The app does not carry voice — it hands off to
the phone's native dialer. So there are only two things to design:

  1. THE CALL BUTTON, in three placements: chat header (56dp icon),
     offer-detail screen (secondary full-width button beside the primary),
     and the message-list row (a small 40dp trailing icon).

  2. THE PRE-CALL SHEET. A bottom sheet, because dialing must be a
     deliberate act and not a mis-tap that rings a stranger:
       - Who you are calling: name, firm, VERIFIED tick.
       - Which lot it is about, one line.
       - ★ The last three offers on that lot, so nobody starts a call
         without the numbers in front of them.
       - A one-line Marathi caution: "कॉलवर ठरलेले भाव अॅपमध्ये नोंदवा"
         (record on the app whatever you agree on the call).
       - Primary "कॉल करा" 56dp. Secondary "रद्द करा".
     NO phone number shown on this sheet either. The name is the identity.

  3. A POST-CALL PROMPT. When the app resumes after the call: a small
     inline card in the chat — "कॉल झाला. नवीन भाव ठरला?" with a
     "प्रति-ऑफर नोंदवा" (record counter-offer) button. This is what keeps
     a phone conversation from becoming an off-platform handshake with no
     escrow, which is where farmers get cheated today.

Do NOT design an in-app calling UI, a ringing screen, a mute/speaker
control, or a call-duration timer. We are not building telephony. Designing
a fake call screen would be theatre and it would break the moment someone
taps it on stage.
```

---

## PROMPT 7 — the tri-lingual AI ASSISTANT (S28)

```
Design S28 — the ASSISTANT. A farmer asks questions in Marathi, Hindi or
English and gets answers in the language he asked in.

★ Be honest in the design about what this is. It answers a fixed set of
about thirty known questions from our own data. It does NOT generate free
text. So do NOT design it to look like ChatGPT — no typing dots, no
streaming cursor, no "AI is thinking", no sparkle icon, no glowing gradient
border. Those cues promise open-ended intelligence, and the first question
outside the set makes the promise a lie in front of a judge.

Design it instead as a KNOWLEDGE SCREEN that happens to accept questions.

  - Header: "विचारा" (ask). A language indicator showing the ACTIVE
    language, tappable to switch — and switching re-renders the whole
    screen, including the suggestion chips, in the new language.
  - CAROUSEL C6 at the top: suggested-question chips in the active
    language. "आजचा भाव किती?" · "थांबणं फायद्याचं आहे का?" · "ग्रेड कसा
    ठरतो?" · "तारण कर्ज म्हणजे काय?" — this carousel is how a farmer who
    cannot type uses the screen at all, so it is above the input, not
    below it.
  - Q&A pairs as bubbles, question right, answer left.
  - ★ EVERY ANSWER CARRIES A SOURCE ROW: a 12sp badge naming where it came
    from — "स्रोत: AGMARKNET · ५ सप्टेंबर" or "स्रोत: सरकारी MSP जाहीरनामा".
    An assistant that answers without attribution is a hallucination
    machine as far as a government panel is concerned, whether or not it
    actually generates.
  - ★ AN ANSWER MAY CONTAIN A NUMBER ONLY IF IT ALSO CONTAINS A SOURCE.
    Design the answer bubble so the source row is structurally part of it
    and cannot be omitted.
  - ★ THE "I DON'T KNOW" ANSWER, designed as a first-class state: "हे मला
    माहीत नाही. मी फक्त भाव, ग्रेड आणि तारण याबद्दल सांगू शकतो." with two
    chips offering what it CAN answer. Design it as calm and normal, not
    apologetic and not an error.
  - A 🔊 on every answer bubble.
  - The input row: text field plus a 🎤 mic icon shown DISABLED with a
    12sp "पुढील आवृत्तीत" (in the next version). We have no speech input in
    phase 1 and I would rather show an honest disabled control than a live
    one that fails.

Then show the SAME three-message conversation three times, side by side, in
Marathi, Hindi and English, so I can see the text-length differences in the
bubbles and confirm nothing truncates in Hindi.
```

---

## PROMPT 8 — the buyer console (S17–S22)

```
Design the BUYER screens. English primary — this user is a literate urban
trader, not the farmer. Denser, faster, table-shaped. Do not carry over the
farmer's generous spacing; it wastes his screen and reads as patronising.

S17 POST A DEMAND — crop, quantity in quintals, minimum grade, delivery
window, target price, delivery district. One primary CTA.

S18 MATCHES — CAROUSEL C5. Cards of matching lots: farmer's village,
quantity, grade pill, assay date, distance in km, asking price, a match
score. ★ The COMBINATION card is visually distinct — a layered/stacked
card edge and a "3 farmers · 100 qtl total" ribbon, with the three
constituent lots listed inside. Make this card the most interesting object
on the screen; "no single farmer had 100 quintals so we combined three" is
the buyer-side moment of the whole demo.

S19 LOT DETAIL — assay answers, grade with its reasoning, photo, farmer's
trade history, and the price the farmer is holding out for. A "Message"
secondary and an "Offer" primary.

S20 MAKE AN OFFER — price per quintal, quantity, delivery date, and a LIVE
TOTAL that updates as he types: "₹1,900 × 40 qtl = ₹76,000" at 22sp. Show
the platform fee as its own explicit line, never folded into the total.

S21 MY OFFERS — a tight list grouped by status: pending / countered /
accepted / declined. Countered offers surface the farmer's counter price
inline so he can accept in one tap.

S22 ESCROW TIMELINE — a vertical stepper: CREATED → ESCROW_HELD →
DISPATCHED → DELIVERED → RELEASED, each with a timestamp, completed steps
in --soil, the current step ringed, future steps in --line. One clear
action per state (e.g. "Confirm delivery"). Also design the DISPUTED
branch, because a timeline that only shows the happy path is the timeline a
judge asks about.

Four states each. And design the buyer's own empty state: no demands
posted yet.
```

---

## PROMPT 9 — the plumbing screens

```
The remaining screens, less design-intensive but they must exist or the
demo has holes. Marathi primary, all four states each.

S1  SPLASH — wordmark, one Marathi line. No spinner longer than 1s.
S2  LANGUAGE PICK — three big 72dp rows, each in its own script: मराठी /
    हिंदी / English. First-run only. This is the first screen a farmer
    ever sees, so it must be tappable without reading anything.
S3  PHONE ENTRY — +91, 10 digits, big 22sp numerals, a numeric keypad, one
    line of Marathi consent text. No email, no password, no Aadhaar field.
S4  OTP — 6 boxes, 24sp, auto-advance, a resend countdown. Design the
    WRONG-OTP state.
S6  ONBOARDING CAROUSEL C4 — 3 slides, skip always visible.
S7  MY PROFILE — village, district, crops, land area, language. No
    identity-document field of any kind.
S11 CREATE LOT — crop, quantity in kg entered but displayed as quintals,
    harvest date, village. Show the kg↔quintal relationship on screen so a
    farmer entering 4000 sees "४० क्विंटल" confirmed back to him.
S12 ASSAY — SIX questions, one per screen, each a large-tap choice (not a
    dropdown, not a slider): size, colour, moisture, damage, sorting,
    storage. A ६ पैकी ३ progress indicator. A camera step for one photo.
S13 GRADE RESULT — the grade as a large pill (B), the reasons it is B, and
    ★ the improvement tip: "आकारानुसार वर्गीकरण केल्यास ग्रेड A मिळेल आणि
    भाव ८% वाढेल" — the tip is the second-most-valuable thing on this
    screen after the grade itself, so give it real weight, not a footnote.
S14 PLEDGE CARD — loan amount, LTV, interest for 11 days, warehouse name,
    and ★ the disclaimer "सूचक अंदाज — कर्जाची अधिकृत ऑफर नाही"
    (indicative simulation, not a lender quote) rendered at 14sp INSIDE
    the card, not below it in caption grey. Also design the state where
    this card does NOT appear because the interest would exceed the gain —
    show me what occupies that space instead.
S15 MY LOTS / MY OFFERS — list with status pills, and the S22 escrow
    stepper embedded as a component when a lot is in transaction.
S16 FPO POOL / SPLIT — three farmers' contributions, the split by quantity
    AND grade, each farmer's rupee share, and a total that reads exactly
    100%. Design the "no pool formed" state: if any member would do better
    selling alone, the pool does not form and we say why.
S25 DATA PROVENANCE — a plain table: source, row count, date range,
    imputed count, synthetic count, and the source URL. Deliberately
    unstyled and auditable. It will be screenshotted onto a slide.

For S25, use ⟨N⟩ ⟨M⟩ ⟨S⟩ placeholders for the counts. I do not have the
real numbers yet and I am not putting invented ones on a government slide.
```

---

## PROMPT X — the audit pass

> Paste last, after every screen is back. This catches what the individual prompts let through.

```
Audit everything you have designed in this conversation against the five
hard rules and report violations as a list. Be adversarial — assume you
have broken at least three of these, because in my experience every design
pass does.

Check specifically, and quote the offending screen for each:

1. Any screen where the WORST CASE is smaller, greyer, lower-contrast,
   further down, or less prominent than the expected gain. Include the
   verdict screen, the chat counter-offer composer, the pledge card, and
   any summary or share card.
2. Any price, forecast, chart or assistant answer WITHOUT a source badge.
3. Any rupee amount, date, quantity or percentage I did not supply in a
   prompt. List each one — an invented number is the most dangerous thing
   in this set of screens, because it looks exactly as real as a true one.
4. Any Latin numeral appearing on a Marathi or Hindi artboard.
5. Any rupee figure not using Indian digit grouping (₹1,42,000 style).
6. Any text below 14sp that is not a source badge or a timestamp.
7. Any touch target below 56×56dp.
8. Any CSS Grid, position: sticky/fixed, vh/vw, calc(), or hover-only
   affordance — each one is something I have to redraw for React Native.
9. Any screen missing one of its four states.
10. Any phone number rendered anywhere in the chat or call screens.
11. Any element that only distinguishes gain from loss by red-vs-green,
    with no +/− sign and no ▲/▼ arrow.
12. Any button whose label would truncate in Hindi — Hindi is 10–15%
    longer than Marathi and it is the one I have not been checking.
13. Any place the assistant looks like a generative chatbot (typing dots,
    streaming cursor, sparkle icon, "thinking" state).
14. Any best-case or optimistic figure on the verdict screen. There is no
    best case in this product.

Then give me a one-page summary sheet — the colour tokens, the type scale,
the spacing scale, and the component inventory with the exact dp values —
that I can build React Native components from directly.
```

---

## Order of work, and what to do with the output

| # | Prompt | Gives you | Needed by |
|---|---|---|---|
| 0 | design system | tokens, rules | before anything |
| 1 | **S9 verdict** | **the screen that is the product** | **P5 · slide 4 · beat 5** |
| 2 | **S9 refusal** | **the screen that wins the room** | **P6 · beat 11** |
| 3 | S5 home + C1 | the first thing anyone sees | P3 |
| 4 | S8 chart, S10 costs | credibility | P4, P7 |
| 5 | S26/S27 chat | the counter-offer moment | P15, SH10 |
| 6 | call sheet | the handoff | P15 |
| 7 | S28 assistant | tri-lingual Q&A | P16 |
| 8 | S17–S22 buyer | Shreya's whole lane | SH5–SH8 |
| 9 | plumbing | the other eleven screens | P1, P2, P8–P12 |
| X | audit | the list of things to fix | before you build |

**Do 0, 1 and 2 before you do anything else — even if you never get to the rest.** Those three prompts produce the two screens the entire pitch stands on. Prompts 3–9 are screens you could build from the mockups already in `docs/roles/PRANAY.md` if you run out of time; prompts 1 and 2 are the ones where design quality changes whether a judge believes the product.

**Then: screenshot everything into `docs/design/screens/`, named `S09_verdict_mr.png`, `S09_refusal_mr.png`, and so on.** Commit them. When you are building S9 at H12 with four hours of sleep, the screenshot is the spec, and a screenshot in the repo is worth more than a Claude Design conversation you have to go find.

**One last thing, and it is the thing most likely to go wrong.** A design tool will hand you back something beautiful with the worst case in elegant small grey type, because that is what looks good, and it will be difficult to argue with because it genuinely does look better. Refuse it anyway. **I16 exists because a farmer who reads only the gain and sells on it has been harmed by our design, and "it looked better" is not a defence we get to offer him.**
