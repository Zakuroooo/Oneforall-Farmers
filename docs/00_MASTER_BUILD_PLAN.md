# MANDI-SETU — MASTER BUILD PLAN
### 3 days · 5 engineers · 5 Claude Code agents · 1 repo
**SIH 2026 · PS 26132 · Strengthening market linkages and price discovery for farmers · Govt. of Maharashtra**

> Read this once, fully, before writing any code. Then read your own role brief in
> `docs/roles/`. Then start. Total reading time ~25 minutes. It will save you ten hours.

---

## 0. The honest situation

You have **~72 hours** and **five people**. That is not enough time to build the
system described in the 55-page playbook. It *is* enough time to build a system that
**wins a college-level selection round**, if and only if you accept three hard truths
now rather than discovering them at hour 60.

**Truth 1 — Judges do not score features. They score one working thing and one honest story.**
A demo with 6 polished screens that tell a single coherent story beats a demo with 22
half-screens every single time. Most losing teams lose by breadth.

**Truth 2 — With 5 agents in 1 repo, your biggest enemy is not scope. It is collision.**
Two agents editing the same file, or two agents assuming different shapes for the same
API response, will burn more of your 72 hours than any feature. This plan is built
almost entirely around preventing that. The mechanisms — contract freeze, exclusive
file ownership, fixtures, blocker log — are not bureaucracy. They are the reason you
will still be shipping at hour 60 instead of debugging a merge.

**Truth 3 — Your differentiator is a decision, not a dashboard.**
There are hundreds of "farmer price dashboard" projects. Every SIH cycle produces
dozens. If your demo is a chart of onion prices, you are indistinguishable. Our
differentiator is stated in `CLAUDE.md` §1 and repeated here because everyone must be
able to say it in one breath:

> **The binding constraint on farmer price realisation is not information — it is the
> ability to wait. A farmer who knows the price will rise next week still sells today
> because he needs cash today and has nowhere to store. So we do not build an
> information product. We build a *waiting* product: it tells him whether waiting pays
> after his real costs, it tells him honestly when it cannot tell, and it removes the
> two reasons he cannot wait — no storage, no cash.**

Everything in the 72 hours serves that sentence. If a task does not serve it, cut it.

---

## 1. What "80–90% complete" means for us

Do not measure completeness in features. Measure it against this list. **All ten must
be true at H68.** Nothing else is required for the college round.

| # | Statement that must be demonstrably true | Owner |
|---|---|---|
| C1 | A farmer logs in on a phone with a phone number + OTP, in Marathi. | R1 + R4 |
| C2 | He sees today's price for his crop at his nearest markets, **net of transport**, not gross. | R2 + R4 |
| C3 | He gets a p10/p50/p90 forecast with a visible model card showing MASE and coverage. | R2 |
| C4 | He asks "should I sell?" and gets **SELL_NOW / HOLD / SPLIT** with a rupee figure, cost breakdown and reasons in Marathi. | R2 + R4 |
| C5 | On a deliberately volatile crop, the same screen returns **NO_ADVICE** with a written reason. This is a feature. Demo it. | R2 + R4 |
| C6 | He lists a lot, self-grades it with a 6-question assay, and gets a grade + a "weakest dimension" tip. | R3 + R4 |
| C7 | Three small farmers pool into one truck-load, each **consents** to a grade-weighted split, and each sees `vs solo` in rupees. | R3 + R4 |
| C8 | A buyer sees matched lots with a **why-this-match** explanation, sends an offer; farmer accepts; escrow funds → transit → delivered → QC → released. | R3 + R5 |
| C9 | The realisation ledger shows **measured** ₹/quintal gained vs the mandi benchmark, and the hash chain verifies. | R3 |
| C10 | `npm run verify` passes: typecheck, lint, unit tests, production build. Deployed on a public URL. | R1 |

**C4, C5 and C9 are the three that win.** If you are out of time, protect those.

### Explicitly out of scope for these 72 hours
Write these on the whiteboard under "PHASE 2" and say so on the slide. Naming your
roadmap honestly reads as maturity; pretending you built it reads as a lie the moment
a judge clicks.

- Real-time Agmarknet/eNAM API polling (we ingest **offline** to a seeded DB — see I5)
- SMS/IVR gateway, WhatsApp bot (design them in the deck, do not build)
- e-NWR / WDRA pledge finance execution (schema exists, no UI)
- ONDC / eNAM transaction integration
- Payment gateway — escrow is **simulated** and clearly labelled as simulated
- Aadhaar / eKYC of any kind (**never**, see I8)
- Native mobile app (PWA only)
- Weather/yield forecasting (mention as roadmap; a bad weather model is worse than none)

---

## 2. Architecture

### 2.1 The shape, and why it is this shape

The playbook describes nine services. **Do not build nine services.** In 72 hours,
every service boundary is an extra deployment, an extra failure mode, an extra
contract, and an extra thing that breaks live on stage. We collapse to **two
processes** and keep the *module* boundaries inside them, so the story "this is
service-oriented and splits cleanly" stays true and provable by directory structure.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  BROWSER  (PWA, mobile-first, Marathi default)                           │
│  Farmer app · Buyer console · FPO console · Admin                        │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │  HTTPS · JSON · httpOnly JWT cookie
┌───────────────────────────────▼──────────────────────────────────────────┐
│  apps/web  —  Next.js 15 App Router  (ONE deployable)                    │
│                                                                          │
│  app/(farmer)/…      app/(buyer)/…      app/(fpo)/…    app/(admin)/…     │
│  ─────────────────────────────────────────────────────────────────────    │
│  app/api/*           thin route handlers: parse → guard → domain → DTO   │
│  ─────────────────────────────────────────────────────────────────────    │
│  src/lib/domain/     PURE business logic. No I/O. Unit-tested.           │
│     window.ts        expected-utility sale-window arithmetic  ◀── HERO   │
│     grading.ts       6-dim assay → Grade + weakest dimension             │
│     matching.ts      lot ↔ demand score with explainable components      │
│     escrow.ts        the ONLY place a TxStatus may change (FSM)          │
│     ledger.ts        hash-chain append + verify                          │
│     split.ts         grade-weighted FPO fair split                       │
│     costs.ts         transport / storage / spoilage / finance            │
│  ─────────────────────────────────────────────────────────────────────    │
│  src/lib/auth.ts  guard()   src/lib/db.ts  prisma   src/lib/ml.ts        │
└──────────┬─────────────────────────────────────────┬─────────────────────┘
           │ Prisma                                  │ HTTP + x-ml-key
┌──────────▼──────────────┐              ┌───────────▼─────────────────────┐
│  PostgreSQL 16          │              │  services/ml — FastAPI (Py 3.11)│
│  ~30 tables             │              │  /forecast  LightGBM quantile   │
│  append-only ledger     │              │  /window    optimiser (numeric) │
│  append-only audit_log  │              │  /health    model registry      │
└─────────────────────────┘              │  models/ *.txt  (gitignored)    │
                                         └─────────────────────────────────┘
                                                     ▲
                                         ┌───────────┴─────────────────────┐
                                         │ OFFLINE, pre-demo, never live:  │
                                         │ ingest → clean → seed.csv → DB  │
                                         │ train → models/*.txt + card     │
                                         └─────────────────────────────────┘
```

**Why the ML service is separate when everything else is collapsed:** it is the one
genuine language boundary. LightGBM has no usable JS equivalent, and R2 must be able
to restart a Python process 200 times without touching R4's dev server. That is a real
boundary, so it earns its process. Nothing else does.

**Why the domain layer is pure (no DB, no fetch):** four reasons, all of which matter
at hour 55. It is unit-testable in milliseconds without a database. Two agents can work
on it without a running Postgres. Its logic is provable on a slide. And when a judge
asks "where is your business logic", you open one folder instead of grepping routes.

### 2.2 The hero request, end to end

Everyone should be able to draw this from memory. It is the slide.

```
 Farmer taps "विकावे की थांबावे?"  (Sell or wait?)
        │
        ▼  POST /api/window/recommend   { lotId | (commodityKey, qtyKg, harvestDate),
        │                                 storageDaysAvailable, cold, rho }
        │
   [R1] route handler
        ├─ WindowBody.parse(body)                  ← Zod. 422 with field errors on fail.
        ├─ guard('FARMER')                          ← session actor, never a client id.
        │
   [R3] load context from DB
        ├─ commodity: shelfLifeDays, spoilageBpsPerDay
        ├─ markets within radius + distanceKm
        ├─ CostTable: transport ₹/qtl/km, storage ₹/kg/day, cold, finance bps p.a.
        └─ PriceObs: last 120 days per market
        │
   [R2] ML service  POST /window   (or /forecast + local optimiser)
        ├─ LightGBM quantile fit → p10/p50/p90 for d = 1..min(storageDays, shelfLife)
        ├─ for each candidate day d and each market m:
        │     gross(d,m)   = p50(d,m)
        │     cost(d,m)    = storage(d) + spoilage(d) + finance(d) + transport(m)
        │     net(d,m)     = gross − cost
        │     CE(d,m)      = net − rho · (p50 − p10)      ← risk-adjusted certainty equiv.
        ├─ best  = argmax CE ;  today = CE(0, best market today)
        ├─ band  = (p90 − p10) / p50  in bps
        ├─ IF band > NO_ADVICE_BAND_BPS        → NO_ADVICE + written reason   ← I4
        ├─ ELIF (best.CE − today.CE) < MIN_GAIN → SELL_NOW
        ├─ ELIF band is wide but gain is real  → SPLIT  (sellNowBps / holdBps)
        └─ ELSE                                → HOLD holdDays
        │
   [R2] build reasons[] and reasonsMr[] from the SAME numbers that produced the action
        │      (never write prose that the arithmetic does not support)
        │
   [R1] persist Recommendation row (for later self-scoring: did HOLD actually pay?)
        │
   [R4] render: big action chip · ₹ figure · cost breakdown table · band chart ·
        │        model card · "why" list in Marathi · Sell / Set reminder buttons
        ▼
 Farmer decides — with the uncertainty visible, not hidden.
```

**The single most important design property here:** the model is allowed to say *"I
don't know."* Every competing project pretends to certainty. A judge who has seen ten
confident price predictors will remember the one that refused. Make `NO_ADVICE` a
deliberate demo beat, with a slide line: *"we would rather return nothing than return a
number a farmer will bet his season on."*

### 2.3 Request pipeline — the shape of every API route

Every route, no exceptions. R1 writes the first three, everyone copies the pattern.

```ts
export async function POST(req: Request) {
  // 1. PARSE — Zod from @mandi/contracts. Never read req.json() into an untyped var.
  const parsed = SomeBody.safeParse(await req.json());
  if (!parsed.success) return badRequest(parsed.error);       // 422 + field map

  // 2. AUTHENTICATE + AUTHORISE — actor comes from the cookie, never from the body.
  const actor = await guard('FARMER');                        // throws 401/403

  // 3. IDEMPOTENCY — for anything that creates money-moving state.
  const key = req.headers.get('x-idempotency-key');
  const existing = await findByIdemKey(key); if (existing) return ok(existing);

  // 4. LOAD — scoped to the actor. This line is the IDOR defence. (I2)
  const lot = await db.lot.findFirst({ where: { id: parsed.data.lotId,
                                                farmerId: actor.farmerId } });
  if (!lot) return notFound();                    // NOT 403 — do not leak existence

  // 5. DECIDE — pure domain function. No I/O inside.
  const result = recommendWindow({ ...ctx });

  // 6. WRITE — one transaction. Ledger/audit appends inside the same tx.
  // 7. AUDIT — who did what to which row, always.
  // 8. RESPOND — a DTO from contracts. Never leak a Prisma model directly.
}
```

Step 4 is where hackathon projects get destroyed in judging. `findUnique({ id })` with
an id from the request body means any logged-in user can read any other farmer's lot by
changing one character. It is the single most common vulnerability in student projects
and the easiest for a technical judge to find in 15 seconds. **Always `findFirst` with
the owner in the `where`.**

### 2.4 Data flow for prices (and why nothing is fetched live)

```
  [offline, before the demo]                          [live, during the demo]

  data.gov.in / Agmarknet CSV                          browser
        │  scripts/ingest.py                              │
        ▼                                                 ▼
  clean · dedupe · impute holidays                   Next.js route
        │  → services/ml/data/seed_prices.csv             │
        ▼                                                 ▼
  prisma/seed → PriceObs (source tagged)            Postgres (seeded)
        │                                                 │
        ▼  train.py                                       ▼
  models/*.txt + model_card.json  ──────────────▶   FastAPI (local)
```

Reasons this is not laziness but the correct engineering call:
1. **Conference wifi fails.** Every year. A demo that needs the internet is a demo that
   dies on stage.
2. **Agmarknet is slow and rate-limited** and has no SLA for you.
3. **Reproducibility.** The same seed → the same numbers → the same rehearsed demo.
4. It is honest, *provided* you say so: "ingestion runs nightly in production; for this
   demo the DB is pre-seeded from a real 2019–2025 pull so the run is reproducible."

Invariant I6 still binds: any synthetic row must be **visibly labelled synthetic in the
UI**. A grey "अंदाजित / imputed" chip. If a judge finds unlabelled fake data, you lose
the room, and deservedly.

### 2.5 Directory layout (this is also the ownership map)

```
mandi-setu/
├── CLAUDE.md                     R1   ← auto-loaded by every agent. Read it.
├── package.json  docker-compose.yml  .env.example        R1
├── prisma/
│   ├── schema.prisma             R1   ← ONLY R1 edits. Others: append to BLOCKERS.md
│   └── seed/index.ts             R5   ← the demo dataset lives here
├── packages/contracts/src/
│   ├── index.ts                  R1   ← FROZEN at H4. Changes = announce + sync.
│   └── fixtures.ts               R1   ← lets R4/R5 build before endpoints exist
├── apps/web/
│   ├── src/lib/                   auth.ts db.ts ml.ts guard.ts        R1
│   ├── src/lib/domain/
│   │   ├── window.ts costs.ts                                          R2
│   │   ├── grading.ts matching.ts escrow.ts ledger.ts split.ts         R3
│   ├── src/components/ui/         shadcn primitives                    R1 (then shared, read-only)
│   ├── src/components/farmer/                                          R4
│   ├── src/components/buyer/  src/components/admin/                    R5
│   ├── src/i18n/                  mr.json en.json                      R4
│   ├── app/api/auth/*  app/api/ref/*                                   R1
│   ├── app/api/prices/*  app/api/forecast/*  app/api/window/*          R2
│   ├── app/api/lots/*  app/api/pools/*  app/api/offers/*
│   │   app/api/tx/*  app/api/ledger/*  app/api/disputes/*              R3
│   ├── app/(farmer)/*                                                  R4
│   └── app/(buyer)/*  app/(fpo)/*  app/(admin)/*                       R5
├── services/ml/                                                        R2
│   ├── app/main.py contracts.py forecast.py optimiser.py
│   ├── scripts/ingest.py train.py backtest.py
│   └── requirements.txt
├── tests/e2e/                                                          R5
└── docs/
    ├── 00_MASTER_BUILD_PLAN.md   ← this file
    ├── 01_CONTRACTS.md  02_SECURITY_AND_QUALITY.md  03_DEMO_AND_SEED.md
    ├── BLOCKERS.md               ← everyone appends, nobody deletes
    └── roles/R1…R5.md
```

**The rule, restated because it is the one that saves you:** you may create, edit or
delete only files under paths your role owns. Need a change in someone else's file?
Append to `docs/BLOCKERS.md`, stub it locally, keep moving. Never edit across the line
"just quickly" — that is how you get a 40-file merge conflict at hour 62.

---

## 3. Timeline

Hours are counted from **H0 = the moment all five of you sit down together**. Sleep is
in the plan. An engineer at hour 60 with no sleep writes the bug that kills the demo.

### H0 → H4 · JOINT LOCKDOWN — all five in one room, nobody codes alone

This is the highest-leverage block in the entire 72 hours. Do not skip it. Do not let
anyone "start early on their part" — a role that starts before the contract freeze will
build against a shape that changes.

| Hour | What happens | Output |
|---|---|---|
| H0.0–H0.5 | Read `CLAUDE.md` together, out loud, all ten invariants. Argue now, not later. | Shared understanding |
| H0.5–H1.5 | Walk §2.2 (the hero request) on a whiteboard. Every person must be able to redraw it. | The demo's spine |
| H1.5–H2.5 | Agree the **demo script**: exact 7 screens, exact numbers, exact click order. Write it into `docs/03_DEMO_AND_SEED.md`. | Frozen demo |
| H2.5–H3.5 | R1 walks everyone through `schema.prisma` + `contracts/index.ts`. Every role confirms the fields they need exist. **This is your only chance to change the contract cheaply.** | Contract sign-off |
| H3.5–H4.0 | `npm i` · `npm run db:up` · `db:push` · `db:seed` · `npm run dev` on **all five machines**. Nobody leaves the room until all five see the app boot. | 5 working envs |

**H4 = CONTRACT FREEZE.** After this moment, `schema.prisma` and
`packages/contracts/src/index.ts` change only via: post in `docs/BLOCKERS.md` → R1
edits → R1 announces in the group → everyone rebases. Never edit them yourself.

Why freeze so early, before anyone knows what they need? Because a contract that is
70% right and stable beats one that is 100% right and moving. Every downstream agent
can code against a frozen imperfect shape; nobody can code against a shape that shifts
under them. Where the contract is wrong, we add a field — we do not reshape.

### H4 → H20 · WALKING SKELETON (each role, own branch, own files)

Goal at H20: **every layer is pierced end to end, badly.** Ugly but real.

| Role | Ship by H20 |
|---|---|
| R1 | Postgres up · Prisma migrated · OTP login working (dev echo) · `guard()` · `/api/ref/*` live · repo boots on every machine · Vercel + Neon project created and a first deploy green |
| R2 | Python 3.11 venv · FastAPI `/health` · `/forecast` returning a **seasonal-naive baseline** with a real model card · `PriceObs` seeded with ≥2 commodities × ≥3 markets × ≥2 years |
| R3 | `escrow.ts` FSM with unit tests · `POST /api/lots` + `GET /api/lots` working against the real DB · `grading.ts` returning a grade |
| R4 | Next.js app shell · Marathi/English toggle working · bottom-nav PWA layout · price screen rendering from **fixtures** · the design language decided (fonts, colours, chip style) |
| R5 | `prisma/seed/index.ts` producing the full demo world · buyer console shell from fixtures · Playwright installed with one green smoke test |

**CHECKPOINT A at H20 — 20 minutes, all five, screens shared.** The single question:
*can a farmer log in and see a price that came out of Postgres?* If no, stop feature
work and fix that first. A pierced skeleton at H20 predicts success; a half-pierced
skeleton at H20 predicts an all-nighter that fails.

**H20 → H28: SLEEP.** Staggered if you like, but everyone sleeps. This is not optional
and it is not soft — the failure mode of hackathons is not insufficient hours, it is
hours 55–70 spent by exhausted people undoing hours 40–55.

### H28 → H48 · THE GOLDEN PATH (the block that wins or loses it)

Goal at H48: **C1–C9 all work with real data.** Not pretty. Working.

| Role | Ship by H48 |
|---|---|
| R1 | All routes protected · rate limiting on OTP · idempotency helper · audit logging on every write · error envelope everywhere · Sentry-or-equivalent breadcrumb · staging deploy auto-updating |
| R2 | **LightGBM quantile model trained**, MASE vs seasonal-naive measured and honest · `/window` returning real recommendations · `NO_ADVICE` path implemented and tested · `costs.ts` with real Maharashtra transport/storage numbers cited in comments |
| R3 | Full chain live: lot → assay → pool + consent → match → offer → accept → escrow FSM → ledger row with hash chain · `/api/ledger` returning **measured** ₹/qtl gain · dispute create + respondBy |
| R4 | Farmer flow complete and *beautiful*: price · forecast band chart · **the window screen incl. the NO_ADVICE state** · lot listing · self-grade wizard · pool consent · offer accept · Marathi strings for all of it |
| R5 | Buyer console: demand post · matched lots with why · send offer · track tx · FPO split view · admin data-quality page · 3 E2E specs green |

**CHECKPOINT B at H48 — 30 minutes.** Everybody demos their slice to the other four,
on a phone-sized viewport. Then, together, run the **full demo script end to end once**.
It will break. That is what the next block is for. If the golden path cannot be walked
at all at H48, cut C7 (pooling) and C10's dispute flow immediately — do not cut C4/C5/C9.

**H48 → H54: SLEEP.**

### H54 → H68 · HARDEN, POLISH, REHEARSE

No new features. Read that again. **No new features.**

| Hour | Activity | Who |
|---|---|---|
| H54–H58 | Bug bash: every person walks *someone else's* flow trying to break it. Log to `docs/BLOCKERS.md`. Nobody fixes their own bugs in this window; you find, then you swap. | All |
| **H58** | **FEATURE FREEZE.** From here: bugfixes, copy, and rehearsal only. Any new feature after H58 is a bug you have not found yet. | All |
| H58–H62 | Fix P0 bugs only. Security pass against `docs/02_SECURITY_AND_QUALITY.md` — R1 runs the IDOR checklist personally against every route. | All |
| H62–H64 | Empty-states, loading skeletons, error messages in Marathi, favicon, title, the 404. Judges notice polish; they cannot separate it from competence. | R4 R5 |
| H64–H66 | `npm run verify` green. Production deploy. **Test the deployed URL on an actual phone over mobile data**, not on localhost. | R1 |
| H66–H68 | Rehearse the demo **three times**, timed, with a stopwatch. Assign one primary driver and one backup driver who can run it if the primary's laptop dies. Prepare a screen-recorded fallback video of the full flow. | All |

**H68 → H72 · BUFFER.** Deliberately empty. It will get used. If it does not, sleep.

### The three tripwires

- **If at H20 the skeleton is not pierced** → all five stop and pierce it. Nothing else matters.
- **If at H48 the golden path does not walk** → cut pooling (C7) and disputes. Protect C4, C5, C9.
- **If at H58 anything is still half-built** → delete it. A missing feature is invisible; a broken feature is the only thing the judge will remember.

---

## 4. Working protocol for five simultaneous agents

### 4.1 Branches

```bash
git checkout -b r2-oracle          # your branch, all 72 hours, one branch
git add -A && git commit -m "feat(oracle): quantile forecast + model card"
git fetch origin && git rebase origin/main      # REBASE. Never merge into your branch.
git push -u origin r2-oracle
```

Rebase, not merge, for a reason that bites at hour 60: five feature branches merging
`main` into themselves repeatedly produces a history where `git bisect` and `git blame`
are useless, and where the same conflict resurfaces on every merge. Rebase keeps the
history linear and each conflict resolved exactly once.

**Merge to `main`** only at the sync windows, only after `npm run typecheck` passes on
your branch, and only R1 presses the button. Small PRs (≤ 400 lines) merge in seconds;
a 3,000-line PR at hour 60 is a 40-minute conflict resolution while four people wait.
**Commit every 30–45 minutes.** Push every commit. An unpushed branch is a branch that
dies with the laptop.

### 4.2 Sync windows — 10 minutes, four times a day, non-negotiable

**H4 · H12 · H20 · H28 · H36 · H44 · H48 · H56 · H64**

Round-robin, 90 seconds each, exactly three sentences:
1. What merged since last sync.
2. What I am on now.
3. What I need from whom (and it had better already be in `BLOCKERS.md`).

Then R1 merges branches to `main`, in dependency order — R1, then R2/R3, then R4/R5 —
and announces "main is at X, rebase now." Everyone rebases before writing another line.

### 4.3 The blocker protocol

You will need something you do not own — a schema field, a contract shape, an endpoint
that does not exist yet. The wrong move is to wait (you stall) or to edit their file
(you collide). The right move, every time:

1. **Append** an entry to `docs/BLOCKERS.md` (never edit or delete another entry).
2. **Stub locally** so you keep moving — a hardcoded object, a fixture from
   `@mandi/contracts/fixtures`, a `TODO(R3):` comment with the exact shape you assumed.
3. **Say it out loud** at the next sync.
4. When it lands, delete your stub. Grep `TODO(R` at H58; that grep is your punch list.

The invariant: **an agent is never blocked for more than 15 minutes.** If you are, you
are doing it wrong — stub and move.

### 4.4 What each agent should tell its Claude Code

Each role brief in `docs/roles/` opens with a **PASTE THIS TO CLAUDE CODE** block.
That block plus `CLAUDE.md` (which Claude Code loads automatically from the repo root)
is everything your agent needs. Note two things:

- **Markdown in the repo beats a pasted PDF.** Claude Code reads the repo. Hand your
  agent the *path* — "read `docs/roles/R4_KISAN.md` and `CLAUDE.md`, then start Task 1" —
  rather than pasting a wall of text it cannot re-read later. The PDF is for humans and
  for the judges; the markdown is for the agents.
- **Tell your agent the ownership rule explicitly at the start of every session.** Agents
  are helpful by default and will happily "fix" a file in someone else's directory.
  The line to use: *"You own only these paths: … If a change is needed elsewhere, append
  to docs/BLOCKERS.md and stub locally instead."*

---

## 5. Risk register

| # | Risk | Likelihood | Impact | Mitigation (do this, not "be careful") |
|---|---|---|---|---|
| 1 | Two agents edit the same file → merge hell | High | High | Exclusive ownership map §2.5; blocker protocol; rebase-only |
| 2 | Contract drift → 422s at H55 | High | High | Freeze at H4; Zod is the single source; R2 mirrors in `contracts.py` in the same sync window |
| 3 | Model has no real data → forecast is fiction | Medium | Fatal | R2's H20 gate is *data seeded*, before any modelling. Baseline first, LightGBM second. |
| 4 | Demo needs live internet → dies on stage | Medium | Fatal | I5: zero live external calls. Pre-seeded DB. Local ML. Recorded fallback video. |
| 5 | IDOR found by a technical judge | Medium | Fatal | Every read scoped by actor (§2.3 step 4); R1 runs the checklist personally H58–H62 |
| 6 | Float money → ₹0.01 mismatches on screen | Medium | High | Integer paise everywhere (I1); `formatPaise` is the only formatter |
| 7 | Scope creep at H55 | **Very high** | High | Feature freeze at H58 is a hard rule, not a target |
| 8 | Someone's laptop dies | Low | High | Push every commit; deployed staging URL; two people can drive the demo |
| 9 | Python 3.14 has no LightGBM wheel | **Certain if unmanaged** | Medium | `uv venv --python 3.11`. Already documented in `CLAUDE.md` §6. |
| 10 | Marathi text overflows buttons | High | Medium | R4 tests every screen in Marathi first, English second. Marathi strings are ~30% longer. |
| 11 | Exhaustion-induced bugs in the last 12h | High | High | Sleep blocks H20–H28 and H48–H54 are in the plan |
| 12 | Judge asks "is this real data?" and answer is muddled | Medium | High | One person owns the data-provenance answer; every synthetic row is chip-labelled (I6) |

---

## 6. Where to start — the first 30 minutes, concretely

All five, same room:

```bash
git clone <repo> && cd mandi-setu
npm i
npm run db:up          # postgres on :5433
cp .env.example .env   # then: openssl rand -base64 48  → AUTH_SECRET
npm run db:push
npm run db:seed
npm run dev            # http://localhost:3000
```

R2 additionally:
```bash
cd services/ml
uv venv --python 3.11        # NOT python3 — default is 3.14, no LightGBM wheel
uv pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Then each person, in their own terminal, in the same repo:
```bash
git checkout -b r4-kisan     # substitute your own branch
```
and give their Claude Code the boot prompt from their role brief.

---

## 7. The one-sentence version, for each of you

- **R1 SPINE** — nobody else can move if the skeleton is not standing. Ship auth and contracts before you ship anything clever.
- **R2 ORACLE** — a measured MASE of 0.9 with an honest caveat beats a claimed 95% accuracy. Your `NO_ADVICE` path is a feature, not a fallback.
- **R3 LEDGER** — you own the number on the winning slide. It must be measured, never asserted.
- **R4 KISAN** — the judge will be looking at your screens the entire time. Marathi first, thumb-reachable, and the farmer must never see a stack trace.
- **R5 BAZAAR** — you own the story. If the seed data is not believable, none of the rest matters.

Now go read your role brief.
