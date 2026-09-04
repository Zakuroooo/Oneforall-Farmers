# R4 · KISAN — The Farmer PWA · Mobile-first · Marathi-first
**Branch:** `r4-kisan` · **The judge will be looking at your screens the entire time.**

---

## ⬛ PASTE THIS TO CLAUDE CODE AT THE START OF EVERY SESSION

```
You are working on MANDI-SETU, a Next.js 15 App Router + React 19 + Tailwind v4 +
shadcn/ui monorepo for Smart India Hackathon 2026, problem statement 26132 (market
linkages and price discovery for farmers of Maharashtra). Five engineers with five
Claude Code agents are building this simultaneously in ONE repo over 3 days.

I am R4 (codename KISAN). My role: the entire farmer-facing progressive web app.
Mobile-first, Marathi-first, designed for a user who may be semi-literate, on a cheap
Android phone, on a 3G connection, standing in a field.

Before you write any code, read these files in this order:
  1. CLAUDE.md                        (project invariants — all ten are binding)
  2. docs/00_MASTER_BUILD_PLAN.md     (§2.2 is the flow my hero screen renders)
  3. docs/01_CONTRACTS.md             (the endpoints I consume + the fixtures section)
  4. docs/roles/R4_KISAN.md           (my task list — work through it in order)
  5. packages/contracts/src/fixtures.ts  (I build against these BEFORE endpoints exist)

I OWN and may edit ONLY these paths:
  apps/web/app/(farmer)/**
  apps/web/src/components/farmer/**
  apps/web/src/i18n/**                  (mr.json, en.json, the locale context)
  apps/web/src/hooks/**
  apps/web/public/**                    (icons, manifest.json, offline page)

If a change is needed in any OTHER path, do NOT edit it. Append an entry to
docs/BLOCKERS.md and stub locally so I keep moving. In particular:
  - apps/web/src/components/ui/** is R1's shadcn primitives — I IMPORT them, never edit them.
  - All app/api/** routes belong to R1/R2/R3 — I consume them, never edit them.
  - prisma/** and packages/contracts/** are R1's — read-only for me.
  - app/(buyer)/, app/(fpo)/, app/(admin)/ and src/components/{buyer,admin}/ are R5's.

I do NOT wait for backend endpoints. I build every screen against
`@mandi/contracts/fixtures` first, then swap to the real endpoint when it lands, and
delete the `// TODO(R2):` / `// TODO(R3):` comment I left.

Hard rules for you specifically:
- MARATHI IS THE DEFAULT LANGUAGE, English is the toggle. Every farmer-facing string
  comes from src/i18n/mr.json — never a hardcoded English string in a component.
- Design for 360px width FIRST. Test at 360px before anything else. Primary actions
  must be reachable by a right thumb in the bottom third of the screen.
- Marathi text is ~30% longer than English. Every button and chip must be tested with
  the Marathi string in it, not the English one.
- Money: never format it myself. Always `formatPaise()` from @mandi/contracts.
  Never show paise to a farmer — whole rupees only.
- Every screen needs a loading state, an empty state, and an error state. A farmer must
  NEVER see a stack trace or an untranslated error code.
- Any price row flagged synthetic or imputed must render a visible grey "अंदाजित" chip.
  Never present modelled data as observed.
- The worst case is NOT small print. worstCaseTotalPaise goes on the same card as the
  expected gain, in the same type size. A screen that shows only the upside is a sales
  pitch, and we are not selling him anything.
- The pledge-finance quote card must carry the label "अंदाजित दर · प्रत्यक्ष कर्ज नाही"
  (simulated quote, indicative rate). We never imply a lender is connected.
- The NO_ADVICE state of the sell-or-wait screen is a REQUIRED, deliberately designed
  screen — not an error state. See fxWindowRefuse in the fixtures. It is our best demo
  moment. Design it as carefully as the HOLD state.
- No `as any`. TypeScript strict is on, including noUncheckedIndexedAccess.

After each task: run `npm run typecheck`, check the screen at 360px width in Marathi,
then commit (`feat(kisan): …`) and push. Commit every 30-45 minutes.

Start with Task 1 in docs/roles/R4_KISAN.md. Tell me your plan before you write files.
```

---

## Why your role exists

Two reasons, and they point the same way.

**The judging reason.** A judge spends 8 minutes with you and looks at screens for
7 of them. They cannot audit R2's MASE or R3's hash chain in that time. They *can*
instantly tell whether the interface was built by someone who thought about a farmer or
by someone who thought about a demo. Polish is not decoration here — it is the only
signal of care that transmits in 8 minutes.

**The real reason.** The user is a 52-year-old onion grower in Nashik district with a
₹6,000 Android phone, patchy 3G, Marathi as his only comfortable written language, and
possibly limited literacy. If the interface assumes anything else, the product does not
exist for him. Every design decision below follows from that one sentence.

---

## Design constraints — non-negotiable, and each has a reason

| Constraint | Why |
|---|---|
| **360 px first** | The most common Android width in rural India. Design there, scale up. Never the reverse. |
| **Marathi default** | Not a toggle you flip to. It is what loads. English is the secondary. |
| **Thumb zone** | Primary action in the bottom third. He is holding the phone in one hand, standing. |
| **44 px minimum tap target** | Dusty fingers, cracked screen protector, direct sunlight. |
| **≤ 2 taps to the price** | The single most common task. If it takes four taps, he uses WhatsApp instead. |
| **Numbers big, words few** | ₹ figures at 28–32 px. A large number and an icon beat a sentence. |
| **Icons + colour carry meaning, never colour alone** | Low literacy, plus ~8% of men are red-green colourblind. Green up-arrow, not just green. |
| **Whole rupees only** | Never show paise to a farmer. `formatPaise(x)` without the `paisa` option. |
| **Works on 3G** | No hero videos, no 2 MB fonts. Skeleton states, not spinners on blank screens. |
| **Marathi text is ~30% longer** | Test every button with the Marathi string. `विकावे की थांबावे?` will break a button laid out for "Sell or wait?". |

---

## Files you own

```
apps/web/app/(farmer)/
├── layout.tsx                  bottom nav, language toggle, offline banner
├── page.tsx                    HOME — today's price + the big sell/wait CTA
├── login/page.tsx              phone → OTP (large numeric keypad)
├── prices/page.tsx             nearby markets, sorted by NET price
├── forecast/page.tsx           p10/p50/p90 band chart + model card
├── window/page.tsx             ★ THE HERO SCREEN — sell or wait
├── lots/page.tsx  lots/new/page.tsx  lots/[id]/page.tsx
├── lots/[id]/grade/page.tsx    the 6-question self-assay wizard
├── pools/[id]/page.tsx         pool split + consent
├── offers/page.tsx             incoming offers with context
├── tx/[id]/page.tsx            transaction timeline
└── ledger/page.tsx             "my realisation" — what MANDI-SETU earned him

apps/web/src/components/farmer/
├── PriceCard.tsx  NetPriceRow.tsx  SyntheticChip.tsx
├── ForecastBandChart.tsx        Recharts area chart, p10-p90 band + p50 line
├── WindowActionCard.tsx         the big SELL_NOW / HOLD / SPLIT chip + ₹ figure
├── WorstCaseRow.tsx             ★ the p10 downside, same type size as the gain
├── PledgeQuoteCard.tsx          ★ "GET MONEY TODAY" — renders WindowRecommendation.pledgeQuote
├── WindowRefusalCard.tsx        ★ the NO_ADVICE screen. Design it properly.
├── CostBreakdownTable.tsx  ModelCardBadge.tsx  ReasonList.tsx
├── GradeWizard.tsx  GradeResult.tsx  WeakestDimTip.tsx
├── SplitConsentSheet.tsx  OfferCard.tsx  TxTimeline.tsx  LedgerSummary.tsx
├── BottomNav.tsx  LangToggle.tsx  RiskSlider.tsx  EmptyState.tsx  ErrorState.tsx
└── ListenButton.tsx             plays a pre-generated Marathi MP3. No network at runtime.

apps/web/src/i18n/{mr.json, en.json, index.tsx}
apps/web/src/hooks/{useLocale,useSession,useApi}.ts
apps/web/public/{manifest.json, icons/*, offline.html}
apps/web/public/audio/mr/*.mp3        ~15 pre-generated demo lines, committed
```

**Forbidden:** `src/components/ui/**` (import only), every `app/api/**`, `prisma/**`,
`packages/contracts/**`, `src/lib/**`, `app/(buyer|fpo|admin)/**`,
`src/components/{buyer,admin}/**`, `services/ml/**`.

---

## Task list

### H4 → H20 · Shell, language, and the price screen from fixtures

**T4.1 — i18n first. Before any screen. This is the decision that saves you at H50.**

Plain JSON dictionaries plus a React context. **Deliberately no i18n library** —
`next-intl` and `i18next` both cost an hour of routing/config friction for a two-language
app, and the App Router integration has sharp edges you do not have time for.

```ts
// src/i18n/index.tsx
const dict = { mr, en };
export function useT() { const { locale } = useLocale(); return (k: string) => dict[locale][k] ?? k; }
```

```json
// src/i18n/mr.json — nested by screen, so you can find a string in a hurry
{ "nav": { "home": "मुख्यपृष्ठ", "prices": "दर", "lots": "माल", "ledger": "हिशोब" },
  "window": { "title": "विकावे की थांबावे?",
              "hold": "थांबा", "sellNow": "आजच विका", "split": "काही आज, काही नंतर",
              "noAdvice": "आम्ही सल्ला देऊ शकत नाही",
              "gain": "अपेक्षित जास्त मिळकत", "costs": "खर्च" } }
```

Getting this wrong — starting with hardcoded English and retrofitting — costs you four
hours at H50 and you will find untranslated strings during the demo. Start here.

Acceptance: the toggle switches every visible string; `mr` loads by default; no English
string is hardcoded in any component you have written.

**T4.2 — Shell + PWA.** `(farmer)/layout.tsx` with a 4-item bottom nav (44 px targets),
a language toggle in the header, and an offline banner driven by `navigator.onLine`.
`manifest.json` + icons so it is installable — "add to home screen" is what makes it a
*phone app* in a judge's mind for about 40 minutes of work.

**T4.3 — Login.** Phone entry with `inputMode="numeric"`, a big 6-box OTP input, an
auto-advance between boxes, and the dev OTP visible in dev mode only. Marathi labels.
Test it at 360 px with a thumb.

**T4.4 — HOME.** One screen, three things:
1. Today's price for his primary crop at his nearest market — big number, trend arrow.
2. **The big CTA: "विकावे की थांबावे?"** This is the product. It goes above the fold.
3. A one-line ledger teaser: *"तुम्ही आतापर्यंत ₹X जास्त मिळवले"* (you've earned ₹X more).

**T4.5 — Prices screen. Sorted by NET, not gross.**
`GET /api/prices/nearby` returns `netPaisePerQtl` (gross minus transport). Show gross,
the transport deduction, and the net — with net as the headline. A farmer comparing gross
prices across mandis makes a *worse* decision than one comparing nothing, and no other
team will show this. It is one of the cheapest genuine insights in the product.

Render `SyntheticChip` on any row whose source is `IMPUTED` or `SYNTHETIC` (I6).

**T4.6 — `ForecastBandChart`.** Recharts. `Area` for the p10–p90 band, `Line` for p50,
a `ReferenceLine` for today. Muted band, solid median.

The band must **look uncertain**. Do not draw a confident line through the middle of a
wide band — visually implying a precision the model does not have is exactly the
dishonesty we are differentiating against. Wider band → fainter fill.

Under it, `ModelCardBadge`: *"seasonal-naive + LightGBM · MASE 0.91 · 78% of actual
prices fell inside this band"* with a tappable "हे कसे मोजले?" (how was this measured?).
Showing your own error metric in the farmer UI is unusual and it reads as confidence.

**Checkpoint A gate (H20):** the app shell boots, the language toggle works, the price
screen renders — from fixtures is fine.

### H28 → H48 · The hero screen, then the chain

**T4.7 — ★ THE WINDOW SCREEN. `app/(farmer)/window/page.tsx`.**
Spend real time here. It is the screen the judge remembers.

```
┌─────────────────────────────────┐
│  ← विकावे की थांबावे?           │
├─────────────────────────────────┤
│  कांदा · १२ क्विंटल · लासलगाव   │   ← context first: what, how much, where
│                                 │
│   ┌───────────────────────────┐ │
│   │      ⏳  थांबा            │ │   ← action chip. Colour + ICON, never colour alone.
│   │      ११ दिवस              │ │
│   │   + ₹ १,४२८  एकूण         │ │   ← total rupees. THE number. 30px+.
│   │   (₹ ११९ / क्विंटल)       │ │
│   │  ─────────────────────    │ │
│   │  वाईट परिस्थितीत: −₹४८०   │ │   ← ★ WorstCaseRow. SAME type size. Not small print.
│   └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐  │   ← ★ PledgeQuoteCard, only when pledgeQuote != null
│  │ 💰 आजच पैसे मिळवा         │  │
│  │ ₹३४,००० आज — तारण कर्ज     │  │
│  │ लासलगाव WDRA गोदाम · ११ दि │  │
│  │ व्याज ₹३७० · विक्रीतून वजा │  │
│  │ ⓘ अंदाजित दर · प्रत्यक्ष   │  │   ← the honesty label, always visible
│  │   कर्ज जोडलेले नाही        │  │
│  └───────────────────────────┘  │
│                                 │
│  का? ▾                          │   ← reasons, collapsed by default, in Marathi
│   • पुढील २ आठवड्यात आवक कमी    │
│   • मागील ३ वर्षे याच काळात दर वाढले │
│   • तुमचा माल A ग्रेड, टिकाऊ    │
│                                 │
│  खर्च (already deducted) ▾       │   ← the cost table. This is what makes it credible.
│   साठवण ₹३४ · खराबा ₹४७         │
│   व्याज ₹१८ · वाहतूक ₹०         │
│                                 │
│  [band chart, 11 days marked]   │
│  ModelCard · MASE 0.91   [🔊]   │   ← ListenButton: cached Marathi MP3, no network
│                                 │
│  मला पैसे कधी लागतील?  ○──●──○  │   ← RiskSlider → rho. His constraint, his call.
├─────────────────────────────────┤
│  [ आठवण ठेवा ]  [ आजच विका ]    │   ← thumb zone. Both are legitimate choices.
└─────────────────────────────────┘
```

Six things to get right:
- **The rupee total, not just per-quintal.** "+₹119/quintal" is abstract. "+₹1,428" is his
  daughter's school fee. Lead with the total.
- **The worst case sits inside the same card, at the same size.** `−₹480` next to `+₹1,428`
  is the whole ethical position of this product rendered in two numbers. Do not put it in
  a tooltip, do not grey it out, do not make it 12px. Every other forecasting app shows
  only the upside; a judge who notices you showed the downside has learned something about
  the team. Use colour + sign + word, never colour alone.
- **The pledge card is the moment the pitch lands.** It appears only when
  `pledgeQuote != null`. It answers the objection the farmer is already forming — *"fine,
  but I need money now"* — on the same screen that created it. Rehearse tapping it.
  And keep the "simulated, no lender connected" line **visible on the card**, not in a
  modal. Volunteered honesty reads as confidence; discovered omission reads as a lie.
- **Costs are shown as already deducted.** The gain is *net*. Say so — it is the difference
  between advice and a sales pitch.
- **The `RiskSlider` is his, not ours.** Three positions: "मला लवकर पैसे लागतील" / "थांबू शकतो"
  / "बरेच दिवस थांबू शकतो" → `rho` 0.7 / 0.35 / 0.1. A system that assumes a farmer with a
  loan due Friday is risk-neutral gives advice that is right on average and ruinous for him.
- **Both buttons are legitimate.** Never make "sell now" feel like the wrong choice when
  the recommendation is HOLD. We advise; he decides.

**`SELL_ELSEWHERE` is a fifth action and it needs its own chip**, not a variant of
SELL_NOW: 🚚 *"आजच विका — पण पिंपळगावला"* with the distance, the transport deduction, and
the net difference. The problem statement asks for nearby-market price discovery in those
words; this chip is the visible answer to it.

**T4.8 — ★ `WindowRefusalCard` — the NO_ADVICE screen. Design this as carefully as T4.7.**

```
┌─────────────────────────────────┐
│   ⚠  आम्ही सल्ला देऊ शकत नाही   │   ← amber, not red. This is honesty, not failure.
│                                 │
│  पुढील १४ दिवसांत कांद्याचा दर    │
│  ±२८% पर्यंत बदलू शकतो. या       │
│  अनिश्चिततेवर आम्ही तुम्हाला     │
│  सल्ला देणार नाही.               │
│                                 │
│  पण हे उपयोगी ठरेल:              │   ← refusing ≠ being useless
│   • आजचा सर्वोत्तम निव्वळ दर:    │
│     पिंपळगाव ₹२,२८० (वाहतूक वजा) │
│   • दर ₹२,५०० झाल्यास कळवा  [+] │
│  [band chart — visibly wide]     │
└─────────────────────────────────┘
```

Amber, not red — red reads as "something broke." This is the system working correctly.
Then give him the two useful things: today's best net market, and a price alert.

Say the design intent out loud in the demo: *"we would rather return nothing than return
a number a farmer will bet his season on."* Every other team's model is always confident.
Yours knows its limits. **Rehearse this beat.**

**T4.9 — Lot listing + the grade wizard.** `lots/new` — commodity, quantity (a stepper in
quintals, not a raw number field), harvest date, storage available, cold storage yes/no.

`lots/[id]/grade` — the 6-question wizard, **one question per screen**, large tap targets,
a progress bar, back always available. Then `GradeResult` with `WeakestDimTip`:
*"तुमचा माल B ग्रेड आहे. माती काढल्यास A ग्रेड मिळू शकेल — अंदाजे +₹८०/क्विंटल."*
That sentence — a grade plus an actionable fix plus its rupee value — is the whole point
of self-grading. Make it prominent.

**T4.10 — Pool consent sheet.** Show his quantity, his grade, his `weight` (the actual
number — auditability is the trust mechanism), his `sharePaise`, and **`vsSoloPaise`**:
*"एकट्याने विकल्यास ₹२८,४००. गटात ₹३१,२०० — ₹२,८०० जास्त."*

Consent is an explicit tap, never a pre-checked box, never a default. We are deciding how
his produce is priced against his neighbour's. Also render the "you would be worse off"
case if R3 returns it — do not hide it.

**T4.11 — Offers, transaction timeline, ledger.**
- `OfferCard` shows the offer **in context**: vs mandi, vs his reserve, buyer reliability,
  and median payout days. A bare price is not information.
- `TxTimeline` — a vertical stepper of the escrow states in Marathi, with the current step
  highlighted and each completed step timestamped. This screen is what makes escrow *feel*
  real in the demo.
- `LedgerSummary` — the emotional payoff screen. *"MANDI-SETU मुळे तुम्हाला ₹१४,२०० जास्त
  मिळाले"* with the per-transaction breakdown underneath. Every number from
  `GET /api/ledger`, measured, never asserted.

### H54 → H68 · Polish, which is not optional

**T4.12 — Every screen gets three states.** `loading.tsx` skeletons (not spinners on a
blank screen — a skeleton reads as fast, a spinner reads as broken), `error.tsx` with a
Marathi message and a retry button, and an `EmptyState` that says what to do next.

Walk every screen with the network throttled to Slow 3G in devtools. That is the real
device condition.

**T4.13 — The Marathi overflow pass.** Set the locale to Marathi and walk every screen at
360 px looking only for clipped text, wrapped buttons, and truncated chips. You will find
6–10. Budget an hour. This is the single most likely visual bug in the demo because you
will have been developing in English out of habit.

**T4.14 — Accessibility that also happens to be good design.** Contrast ≥ 4.5:1 (sunlight),
`aria-label` on every icon-only button, focus rings intact, and no state communicated by
colour alone — always colour + icon + text.

**T4.15 — ★ MARATHI AUDIO. Deadline H36, not H60. `ListenButton.tsx`.**

A farmer with four years of schooling can hear a sentence he cannot read. This is the
feature that proves "Marathi-first" is a design decision and not a font choice — and on
stage, hearing the app speak Marathi with the wifi visibly off is worth more than any
slide about inclusion.

**Pre-generate. Do not call a TTS API at runtime.** I5 forbids network at demo time, and a
live TTS call is the single most likely thing to fail in front of a judge.

1. Write the ~15 demo lines to `apps/web/public/audio/mr/manifest.json` — key → Marathi
   text. Keys match your i18n keys so the button is `<ListenButton k="window.hold.verdict" />`.
   The lines you actually need: the HOLD verdict, the worst-case sentence, the three
   reasons, the pledge-card summary, the `NO_ADVICE` refusal, the offer-received line,
   the pool-consent line, and the two nav labels.
2. Generate once, locally, into `apps/web/public/audio/mr/<key>.mp3`. In order of
   preference: **AI4Bharat Indic-TTS** (open source, Marathi, runs locally), any commercial
   `mr-IN` voice (Google Cloud / Azure), **Bhashini** if approval arrives — apply on Day 1
   regardless, because "we integrate Bhashini" is a real slide line for a government panel.
   Record the engine and date in `research/data/PROVENANCE.md`.
3. **If no TTS works by H36, stop trying and record a Marathi-speaking teammate on a phone.**
   Label it "human-recorded for demo" on the honesty slide. A real human voice reading real
   Marathi is not a downgrade — it is arguably better, and it is certain.
4. Commit the MP3s. They are demo assets, not build output. Total should be under 2 MB;
   if it is more, your bitrate is too high — 64 kbps mono is plenty for speech.
5. The button: a 44 px speaker icon, `aria-label="मराठीत ऐका"`, plays a cached
   `<audio>` element. Show a visible playing state. If the file is missing, the button
   hides itself rather than erroring — never a broken control on stage.

Two lines to get exactly right, because they are the ones the judges will hear:

```
window.hold.verdict   "अकरा दिवस थांबल्यास अंदाजे एक हजार चारशे अठ्ठावीस रुपये जास्त मिळू शकतात."
window.hold.worstCase "मात्र भाव घसरल्यास चारशे ऐंशी रुपये तोटा होऊ शकतो. निर्णय तुमचा."
```

The second line is the product. Do not cut it to save 4 seconds of demo time.

---

## Your failure modes, named

| Failure | Prevention |
|---|---|
| Built in English, retrofitted Marathi at H60 | T4.1 is task one. Marathi is the default from the first component. |
| Waited for R2/R3 endpoints | Build against `@mandi/contracts/fixtures` from H4. Never idle. |
| Designed at 1440 px, broke at 360 px | Devtools locked to 360 px all 72 hours. Widen only to check. |
| `NO_ADVICE` treated as an error state | T4.8. It is a designed screen and our best demo moment. |
| Marathi text overflows buttons | T4.13, budgeted, not hoped for. |
| Edited `src/components/ui` to tweak a Button | Wrap it in `src/components/farmer/`. Never edit R1's primitives. |
| Farmer sees a stack trace on stage | `error.tsx` in every route folder, done at T4.12 |
| Synthetic data rendered as observed | `SyntheticChip` wherever a source field says imputed (I6) |
| **Worst case rendered as small grey print** | It goes in the same card, same type size, colour + sign + word. The whole ethical claim collapses if this is a tooltip. |
| **`PledgeQuoteCard` not built because R2's quote landed late** | Build it from `fxWindowHold.pledgeQuote` at H28. It is the pitch's peak moment; it cannot be a stub at H60. |
| **The "simulated quote" label moved into a modal to make the card prettier** | It stays on the card. Volunteered honesty reads as confidence; a discovered omission reads as a lie. |
| **TTS chased until H60** | Hard stop at H36 → teammate's voice. T4.15 step 3. |
| **`SELL_ELSEWHERE` renders as a SELL_NOW variant** | It gets its own chip, distance, and net difference. It is the PS's own words ("nearby markets") answered on screen. |
