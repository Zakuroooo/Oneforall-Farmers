# R5 · BAZAAR — Buyer & FPO & Admin Consoles · Demo Dataset · E2E · The Deck
**Branch:** `r5-bazaar` · **You own the story. If the data isn't believable, nothing else matters.**

---

## ⬛ PASTE THIS TO CLAUDE CODE AT THE START OF EVERY SESSION

```
You are working on MANDI-SETU, a Next.js 15 App Router + React 19 + Tailwind v4 +
shadcn/ui + Prisma monorepo for Smart India Hackathon 2026, problem statement 26132
(market linkages and price discovery for farmers of Maharashtra). Five engineers with
five Claude Code agents are building this simultaneously in ONE repo over 3 days.

I am R5 (codename BAZAAR). My role: the buyer console, the FPO console, the admin
data-quality console, the deterministic demo seed dataset, the end-to-end tests, and
the presentation. I own the demo narrative — the exact click path we perform on stage.

Before you write any code, read these files in this order:
  1. CLAUDE.md                        (project invariants — all ten are binding)
  2. docs/00_MASTER_BUILD_PLAN.md     (§1 is the 10-point completion checklist I verify)
  3. docs/01_CONTRACTS.md             (the endpoints I consume)
  4. docs/03_DEMO_AND_SEED.md         (MY file — the demo script and seed spec)
  5. docs/roles/R5_BAZAAR.md          (my task list — work through it in order)
  6. packages/contracts/src/fixtures.ts  (I build screens against these before endpoints exist)

I OWN and may edit ONLY these paths:
  apps/web/app/(buyer)/**    apps/web/app/(fpo)/**    apps/web/app/(admin)/**
  apps/web/src/components/buyer/**    apps/web/src/components/admin/**
  apps/web/app/api/admin/**
  prisma/seed/**                        (the demo dataset — the whole world our demo lives in)
  tests/e2e/**                          (Playwright)
  docs/03_DEMO_AND_SEED.md

If a change is needed in any OTHER path, do NOT edit it. Append an entry to
docs/BLOCKERS.md and stub locally so I keep moving. In particular:
  - apps/web/src/components/ui/** is R1's shadcn primitives — I IMPORT them, never edit them.
  - prisma/schema.prisma is R1's — I read it constantly, I never edit it.
  - app/(farmer)/** and src/components/farmer/** and src/i18n/** are R4's.
  - All other app/api/** routes belong to R1/R2/R3.

Hard rules for you specifically:
- The seed MUST be deterministic. Same seed → same numbers, every run. Use a fixed PRNG
  seed, never Math.random() without one, never `new Date()` for generated history.
  Our rehearsed demo depends on the numbers not moving between runs.
- Every synthetic or imputed row must be tagged with its source so the UI can label it.
  Never generate fake data that presents as observed. This is invariant I6 and it is
  the fastest way to lose a judging room.
- Money is integer paise. Quantities are integer kilograms. Never a float for money.
- Seeded history must be internally CONSISTENT: a ledger row's realised price must match
  its transaction, which must match its offer, which must be plausible against the
  PriceObs modal for that market on that date. An inconsistency here is what a judge
  finds when they click the one thing we did not rehearse.
- Every DB read in an admin route is scoped and role-guarded via guard('ADMIN').
- No `as any`. TypeScript strict is on, including noUncheckedIndexedAccess.

After each task: run `npm run typecheck`, then commit (`feat(bazaar): …`) and push.
Commit every 30-45 minutes.

Start with Task 1 in docs/roles/R5_BAZAAR.md. Tell me your plan before you write files.
```

---

## Why your role exists

The other four build capability. **You build the thing the judges actually experience.**

A perfectly engineered system with three farmers, one buyer and two price rows in the
database demos as a prototype. The same system with 40 farmers, 12 buyers, four years of
real onion prices, 214 completed transactions and a measured ledger demos as a *product*.
The code is identical. The seed is the difference.

You also own the two questions that decide the room: *"is this real data?"* and *"can you
show me it working end to end?"* Both are yours.

---

## Files you own

```
prisma/seed/
├── index.ts             orchestrator, deterministic, idempotent
├── reference.ts         districts, markets (real APMC codes), commodities, cost tables
├── prices.ts            loads R2's services/ml/data/seed_prices.csv → PriceObs
├── actors.ts            farmers, FPOs, buyers with tiers + reliability
├── history.ts           past lots → offers → transactions → ledger rows (the credibility layer)
└── rng.ts               seeded PRNG. Never Math.random() unseeded.

apps/web/app/(buyer)/
├── layout.tsx  page.tsx            dashboard: open demands, active transactions
├── demand/new/page.tsx             post a requirement
├── lots/page.tsx                   matched lots with the WHY explanation
├── offers/page.tsx                 offers sent + their status
└── tx/[id]/page.tsx                escrow actions: fund → dispatch → deliver → QC → release

apps/web/app/(fpo)/
├── page.tsx                        member lots, pool builder
├── pools/[id]/page.tsx             split table with weights + each member's consent state
└── members/page.tsx

apps/web/app/(admin)/
├── page.tsx                        ops overview
├── data-quality/page.tsx           ★ coverage, % synthetic, staleness per market × commodity
└── ledger/page.tsx                 chain verify button + the aggregate realisation figure

apps/web/src/components/buyer/**   src/components/admin/**
apps/web/app/api/admin/data-quality/route.ts
tests/e2e/{golden-path,window-refusal,pool-consent,escrow-fsm}.spec.ts
docs/03_DEMO_AND_SEED.md
```

**Forbidden:** `src/components/ui/**` (import only), `prisma/schema.prisma`,
`packages/contracts/**`, `app/(farmer)/**`, `src/components/farmer/**`, `src/i18n/**`,
`src/lib/**`, every `app/api/**` except `admin`, `services/ml/**`.

---

## Task list

### H4 → H20 · The seed, first, because everyone consumes it

**T5.1 — `docs/03_DEMO_AND_SEED.md`: write the demo script at H2, before any code.**

This is your single highest-leverage hour. Write the **exact** click path, screen by
screen, with the **exact** numbers that will be on screen. Every other role then builds
toward a defined target instead of a vague one, and you discover at H2 — not H60 — that
the story needs a field nobody planned.

The narrative, 7 minutes:

| # | Beat | Screen | The line |
|---|---|---|---|
| 1 | The problem, in one number | slide | "Onion at Lasalgaon: ₹800 in Feb, ₹2,400 in April. Ramesh sold in Feb. Not because he didn't know — because he couldn't wait." |
| 2 | Login, Marathi | farmer login | "Marathi first. This is a ₹6,000 phone on 3G." |
| 3 | Net, not gross | prices | "Every other app shows the gross mandi price. A mandi 60 km away at ₹50 more is a loss. We show net of transport." |
| 4 | **The hero** | window | "12 quintals. Hold 11 days: **+₹1,428**, after storage, spoilage, interest. Here's the cost breakdown. Here's the model card — MASE 0.91." |
| 5 | **The refusal** | window (volatile crop) | "Now tomato. The band is ±28%. **We refuse to advise.** We'd rather return nothing than a number he'd bet his season on." |
| 6 | He couldn't wait — now he can | pool consent | "Three smallholders, one truck. Grade-weighted, each consents, each sees +₹2,800 vs selling alone." |
| 7 | Advice → money | offer → escrow → release | "Buyer funds escrow before dispatch. He knows he'll be paid before the truck leaves." |
| 8 | **The measured claim** | ledger + verify | "214 transactions. **+₹187/quintal** measured against same-day mandi modal. Append-only, hash-chained — let me break a row and verify." |
| 9 | Honesty as a feature | admin/data-quality | "Coverage per market. 8% imputed, labelled in the UI. We show our own gaps." |
| 10 | Roadmap | slide | "IVR, e-NWR pledge finance, ONDC. Named as roadmap, not claimed as built." |

Freeze this. Every role builds to it. **Rehearse it three times at H66 with a stopwatch.**

**T5.2 — `rng.ts` + determinism.** A seeded mulberry32 or xorshift. Every generated
value derives from it. No `Math.random()`, no `new Date()` in generated history — pass a
fixed `SEED_TODAY` constant through.

Non-determinism means the ledger figure on the slide differs from the one on screen at
demo time. That is the kind of contradiction a judge notices and nobody recovers from
gracefully. Acceptance: `npm run db:reset` twice → the ledger total is byte-identical.

**T5.3 — `reference.ts` with real Maharashtra data.**

Use real names and real APMC codes — a judge from the Maharashtra government will
recognise them, and a fake mandi name is an instant credibility loss.

- **Districts:** Nashik, Pune, Ahmednagar, Solapur, Jalgaon, Aurangabad (Chh. Sambhajinagar), Nagpur
- **Markets:** Lasalgaon (लासलगाव — Asia's largest onion market, and the one every
  Maharashtra official knows), Pimpalgaon Baswant, Yeola, Pune Gultekdi Market Yard,
  Solapur, Ahmednagar, Jalgaon. Mark which are eNAM-enabled.
- **Commodities:** Onion/कांदा, Tomato/टोमॅटो, Soybean/सोयाबीन, Tur/तूर, Cotton/कापूस,
  Grapes/द्राक्ष. Each with `shelfLifeDays` and `spoilageBpsPerDay`.
- **Cost tables:** transport ₹/qtl/km, ambient and cold storage ₹/kg/day, finance bps p.a.
  **Put a source citation in a comment next to every number.** You will be asked where
  ₹4/quintal/km came from, and "here's the row and here's where the rate came from" is a
  completely different answer from a shrug.

**T5.4 — `actors.ts`.** ~40 farmers with realistic Marathi names and plausible landholdings
(the median Maharashtra holding is ~1.5 ha — do not seed a district of 20-acre farmers,
it undercuts the entire premise). 3 FPOs with 8–15 members each. ~12 buyers across tiers
T0–T3 with varying `reliability` (0–1000) and `medianPayoutDays` — the spread matters,
because a matching engine that weights payout speed needs buyers who differ on it.

**T5.5 — `prices.ts`.** Load R2's `services/ml/data/seed_prices.csv` into `PriceObs`,
preserving the `source` column exactly. Do not "improve" the data. If R2's CSV is late,
generate a documented synthetic series tagged `SYNTHETIC` and swap it later — do not
block on R2.

**T5.5b — ★ Warehouses, and two demo personas. R2 and R4 are blocked on both.**

**Warehouses** — seed 3 to 5 real ones in the Nashik / Ahmednagar belt, at least two with
`isWdra = true`, each with `capacityKg`, lat/lon, and an ambient storage rate. Source them
from the WDRA registered-warehouse search (`docs/12_DATA_SOURCES.md` §3) and put the URL
and pull date in a comment on the row. Without these rows `pledgeQuote` returns `null` for
every lot and the peak moment of the pitch silently disappears — R2's optimiser reads this
table. Do it in the H4→H20 block, not later.

Label the storage and finance rates **indicative** in the seed comment. We are not
integrated with a lender and we say that first, unprompted, on the slide and on the card.

**Two personas, deliberately different, because one of them must be refused:**

| Persona | Crop / market | Lot | What the demo must show |
|---|---|---|---|
| **Ramesh Pawar** (रमेश पवार) | Onion, Lasalgaon | 12 qtl, A grade | `HOLD` ~11 days, a real positive gain, a visible worst case, **and a pledge quote** because he declared a cash need before his hold ends. The full arc. |
| **Sunita Shinde** (सुनिता शिंदे) | **Tomato**, Nashik | 8 qtl | **`NO_ADVICE`.** Her band is genuinely too wide — tomato is not storable and its price is not forecastable at useful precision. The refusal must come from the real band width, not a hardcoded flag. |

Seed both so that walking to their screens produces those outcomes deterministically. Then
verify it after every `db:reset`: if Sunita ever gets a confident HOLD, either the seed
drifted or the threshold is wrong, and you have just lost your best demo moment. Ramesh
gives the judges the product; Sunita gives them a reason to trust it.

**T5.5c — Verify the citations. 30 minutes, do it on Day 0, and be ruthless.**

The playbook's reference list was assembled without web access and roughly 20 arXiv IDs in
it are **unverified** — several are dated 2025–2026, which is exactly the pattern of a
hallucinated identifier. A judge who opens one reference and finds it does not exist has
learned that nothing else you claimed was checked either. That is the cheapest possible
way to lose this.

Open every ID. **Keep at most six papers you have personally read the abstract of.** Start
with 1812.05173, 2009.04171, 2304.09761, 2212.03281, 2202.07282 and one Maharashtra- or
onion-specific paper if you find a real one. Delete the rest without sentiment — a short
verified list is stronger than a long unverified one.

Then trace the three headline statistics to their primary source, replacing the Wikipedia
citation: farmer suicides → **NCRB ADSI 2022**, "Suicides in Farming Sector", with the
table number. 43% marginal holdings → **Agriculture Census 2015-16** state tables. The
APMC count → **MSAMB**. Record all of it in `docs/deck/SOURCES.md`.

While you are there, add the Maharashtra programmes the playbook missed entirely and that
the judges may personally work on: **SMART** (World Bank market-linkage project), **MAGNET**
(ADB horticulture/FPO), **MahaAgri-AI policy**, **AgriStack Maharashtra Farmer ID**,
**MSAMB**. Verify each exists and what it does, then name them as the pilot channel on the
feasibility slide. Fit to the state's own programmes is worth more than another feature.

**Checkpoint A gate (H20):** `npm run db:reset` produces a browsable world; the buyer
console shell renders from fixtures; **warehouses exist and both personas resolve to their
intended verdicts**; the reference list contains only verified entries.

### H28 → H48 · Consoles and the credibility layer

**T5.6 — `history.ts`. The single highest-value file you write.**

Generate ~200 past transactions spanning 6 months: lot → assay → offer → accept →
escrow walked to `RELEASED` → `RealisationLedger` row with a correct hash chain.

**Consistency rules — a judge will click one row and check:**
- A ledger row's `realisedPaisePerQtl` must equal its transaction's agreed price.
- That price must be plausible against the `PriceObs` modal for that market **on that
  date** — a realised ₹3,200 on a day the mandi modal was ₹1,900 is not a success story,
  it is a bug someone will find.
- `benchmarkPaisePerQtl` must be the actual same-day modal for that commodity × market.
- `deltaPaise` computed by subtraction. **Never** generated to hit a target figure.
- The hash chain must verify from `seq = 1` through the last row.
- Realistic spread: some deltas negative. **If every historical transaction beat the
  benchmark, nobody believes any of them.** A distribution with a positive mean and real
  losses is credible; a uniformly winning one is obviously synthetic.

Also seed ~50 historical `Recommendation` rows with `followed` set, so R2's self-scoring
line — *"of 47 HOLD recommendations, 39 were followed and realised +₹94/qtl"* — is
computed from data rather than asserted.

**T5.7 — Buyer console.** Dashboard · post demand · **matched lots showing the `why`
sentence and score components, not just a number** · send offer · escrow actions.

The buyer side is where you show the demand side of the linkage. Play the buyer live in
the demo — funding escrow *on stage, from a second window*, while the farmer's screen
updates, is a far stronger beat than describing it. Two browser profiles, rehearsed.

**T5.8 — FPO console.** Member lots, pool builder, and the split table with **weights
visible** and per-member consent state. The FPO view is what makes the aggregation story
concrete for a government judge — FPO strengthening is explicit Maharashtra policy, so
name it.

**T5.9 — ★ Admin data-quality console. Do not skip this; it is unusual and it lands.**

Per market × commodity: row count, date range, **% imputed**, days since last
observation, and a coverage heatmap. Plus the ledger chain-verify button.

Almost no student team shows its own data gaps. Showing yours converts "is this real
data?" from an attack into a demonstration: *"here's exactly what we have, here's what's
imputed, here's how stale each market is, and every imputed row is labelled in the farmer
UI."* It reads as engineering maturity, which is precisely what separates a winning
project from a polished one.

**T5.10 — E2E tests (Playwright), 4 specs.**
`golden-path` (login → window → lot → offer → escrow → ledger) ·
`window-refusal` (asserts NO_ADVICE renders with a reason) ·
`pool-consent` (asserts the pool cannot advance without all consents) ·
`escrow-fsm` (asserts an illegal transition is rejected by the API).

These are not for coverage. They are your **pre-demo smoke test**: at H66 you run
`npm run test:e2e` and know in 90 seconds whether the demo path still works. Without
them you find out on stage.

### H54 → H72 · Verify, rehearse, present

**T5.11 — Verify §1 of the build plan, all 10 checkpoints, personally.** You are the
integration tester. Walk every one. Anything failing goes to `docs/BLOCKERS.md` with a
screenshot.

**T5.12 — Cross-role bug bash (H54–H58).** You walk R4's farmer flow; R4 walks yours.
Finding bugs in your own work is the thing humans are worst at. Log, then swap.

**T5.13 — The deck. NOT after the freeze — from H0, updated at every sync window.**

> **This task was originally scheduled at H58 and that was the single worst error in the
> original plan.** See `docs/10_GAP_REVIEW_AND_CORRECTIONS.md` A2/C1. Read the funnel in
> `docs/11_PITCH_PPT_AND_SELECTION_ROUNDS.md` before you start.
>
> Here is why. The product is not what gets you to the SIH finale. Three gates stand
> between you and it: your **college internal round** (faculty, 5–8 minutes, mostly not
> agri experts), **institute nomination**, then **SIH portal shortlisting — where hundreds
> of teams per PS are cut by evaluators reading only the mandated ~6-slide Idea PPT**. At
> that gate there is no live demo. The PPT *is* the product. A deck started at H58 by a
> tired person is how a good build loses to a worse one.
>
> So: **two artefacts, both owned by you, both alive from hour zero.**
>
> **(a) The official SIH Idea PPT** — download the 2026 template from the portal and map
> 1:1 onto it. Do not restyle it; evaluators pattern-match on the template and a custom
> design reads as "did not read the instructions". Content slide by slide is written out
> in `docs/11_PITCH_PPT_AND_SELECTION_ROUNDS.md` §2 — use it verbatim as your starting
> draft, then replace every placeholder number with a measured one as the build lands.
>
> **(b) The 7-minute college demo deck** — the list below.
>
> Working rule: at each of the nine sync windows, spend **ten minutes** updating both. A
> slide whose screenshot does not exist yet gets a box that says `[SCREENSHOT: window
> screen with HOLD + worst case + pledge card — R4, due H36]`. Those boxes are your real
> punch list; they surface a missing feature at H20 instead of H60.
>
> At H48 you also cut the **fallback video** (T5.14) — not at H70. A 90-second recording
> of the golden path, Marathi audio audible, unlisted upload, link on the references slide.

The 12–14 slide college deck:

1. **The number** — Lasalgaon onion ₹800 → ₹2,400, and Ramesh sold at ₹800
2. **The real diagnosis** — it is not information, it is the inability to wait
3. What exists today and why it does not close the gap (Agmarknet/eNAM show prices; nobody prices *waiting*)
4. MANDI-SETU in one screen — the window recommendation
5. **The refusal** — the model that says "I don't know" (screenshot)
6. How the window is computed — the CE arithmetic, one slide, the actual formula
7. **Measured, not claimed** — MASE 0.91 vs seasonal-naive, coverage 78%, the backtest table
8. Removing the two reasons he cannot wait — pooling + escrow
9. **The ledger** — +₹187/qtl measured, hash-chained, verifiable live
10. Architecture — one diagram, honest about what is simulated
11. Data provenance + our own gaps (the admin screenshot)
12. Why us / Maharashtra fit — APMC, MSAMB, FPO policy alignment
13. Roadmap — IVR, e-NWR pledge finance, ONDC, explicitly *not built*
14. Ask

Insert two slides the original list was missing, because they are two of our four
defensible novelties (gap review A7) and neither is visible anywhere else in the deck:

- after slide 4 — **"We pay them to wait."** The pledge card, full screen. The one sentence:
  *"Every HOLD comes with a warehouse-receipt advance, so the cash arrives today and the
  upside is kept. And we refuse to offer it when the interest would exceed the gain."*
  Label it simulated, on the slide, before anyone asks.
- after slide 9 — **buyer reliability including post-delivery renegotiation rate.** The one
  number no marketplace publishes about its own buyers, because it is the one that
  actually predicts whether a farmer gets paid what was agreed.

Order the novelty claims **credit-coupled HOLD → measured Realisation Ledger → model
refusal → renegotiation rate**, and make sure all four are *clickable in the demo*. A
novelty that exists only on a slide is a claim; one you can tap is a product.

Design rules: one idea per slide; a real screenshot on every product slide; **no number
without its source** (keep `docs/deck/SOURCES.md` as you go, not at the end); never a
fixture number — `fxWindowHold` figures are hand-written to make layouts look right and
putting one on a slide is how you end up contradicting your own live screen.

**T5.14 — Rehearse 3×, timed, and build the fallback.** Two people able to drive.
A screen-recorded video of the full golden path on a phone, on a USB stick and uploaded.
When the wifi dies — and at some venue it will — you keep going.

---

## Your failure modes, named

| Failure | Prevention |
|---|---|
| Thin seed → looks like a prototype | 40 farmers, 12 buyers, 200 transactions, 4 years of prices. T5.4/T5.6. |
| Non-deterministic seed → numbers move between runs | Seeded PRNG, T5.2. Verify with two resets. |
| Ledger history internally inconsistent | The consistency rules in T5.6, checked by spot-clicking rows |
| Every historical delta positive | Seed real losses. A uniformly winning ledger is obviously fake. |
| Fake mandi names | Real APMC names and codes, T5.3 |
| **Deck started at H58** | T5.13. Both artefacts live from H0, ten minutes at every sync. The portal gate is decided on the PPT alone. |
| Deck contradicts the product | Screenshots only from the running app; every number carries its source; no fixture numbers ever. |
| No fallback when wifi dies | Recorded video + two drivers, T5.14 — **cut at H48**, not H70 |
| E2E written at H70 | H48. It is your smoke test, not your coverage metric. |
| Skipped the admin data-quality screen | T5.9. It is the answer to the hardest question you will get. |
| **No warehouses seeded → every `pledgeQuote` is null** | T5.5b, in the H4→H20 block. The thesis silently vanishes and nobody notices until the rehearsal. |
| **The tomato persona gets a confident HOLD** | T5.5b. Re-verify after every `db:reset`. The refusal is the demo moment; it must come from a real band, not a flag. |
| **A judge opens a reference and it does not exist** | T5.5c. Six verified papers, primary sources for all three headline statistics. |
| **Maharashtra's own programmes unnamed on the feasibility slide** | T5.5c. SMART, MAGNET, MahaAgri-AI, AgriStack, MSAMB. The panel may work on these. |
