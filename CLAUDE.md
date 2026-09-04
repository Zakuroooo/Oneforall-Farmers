# MANDI-SETU — Repository Instructions

> **Every Claude Code session in this repository loads this file automatically. Read it fully before your first edit.**
> If you are a teammate's agent, you also have exactly one role brief in `docs/roles/`. Read that too. Read nothing else in `docs/roles/` — the other briefs are not your job.

---

## 1. What we are building

**MANDI-SETU** — a market-intelligence and transaction-enablement platform for farmers of Maharashtra. Smart India Hackathon 2026, Problem Statement **26132**, Government of Maharashtra.

The full problem analysis, research base, and long-term architecture live in `MANDI-SETU_SIH2026_PS26132_Playbook.md` (55 pages). **Read Chapters 02, 04, 05 and 06 of it before writing domain logic.** This file is the build contract; the playbook is the reasoning behind it.

### The one-sentence thesis

> The binding constraint on farmer price realisation is not information — it is **the ability to wait**. Farmers already suspect prices will rise; they sell at harvest because they cannot afford not to. So we are not building a price dashboard. We are building a **waiting product**: a system that tells a farmer whether waiting pays, by how much, with what confidence, and then removes the liquidity and storage reasons they could not wait.

Every feature must answer: *does this help a farmer wait profitably, or help a buyer trust a lot enough to pay more for it?* If neither, it is out of scope for these three days.

### The hero feature

`POST /api/window/recommend` → returns **SELL_NOW / HOLD / SPLIT / NO_ADVICE** with expected rupee gain per quintal, a confidence band, and the costs it netted out. Everything else on screen exists to make that recommendation credible. If this endpoint is weak, the project is weak.

---

## 2. Non-negotiable invariants

These are not style preferences. Breaking one is a bug even if tests pass.

| # | Invariant | Why |
|---|---|---|
| **I1** | **All money is integer paise.** Never a float, never rupees. Field names end in `Paise`. Format for display only at the render edge, via `formatPaise()`. | Floats lose money. A judge who spots `0.1 + 0.2` in a price product is done with you. |
| **I2** | **Every DB read of user-owned data is scoped by the session actor.** Never trust an ID from the client. Use `guard()` from `src/lib/guard.ts`. | Fetching `/api/lots/<someone-else's-id>` and getting data is the single most common bug in hackathon marketplaces, and the technical panel will try it. |
| **I3** | **`realisation_ledger` and `audit_log` are append-only.** No `UPDATE`, no `DELETE`, ever. Each row carries `prevHash` and `hash`. | Transparent transaction records are a stated PS outcome. A ledger you can silently edit is not a record. |
| **I4** | **The model must be allowed to refuse.** When the p10–p90 forecast band exceeds the configured threshold, return `action: 'NO_ADVICE'` with a reason. Never invent a confident number. | A wrong HOLD costs a farmer real money. Refusal is the ethical position and it is also our strongest demo moment. |
| **I5** | **The demo makes zero live external network calls.** All demo data is seeded into Postgres. External ingestion is an offline job that writes to the DB. | Venue wifi will fail. It always fails. |
| **I6** | **Synthetic data is labelled synthetic in the UI.** If a price series is generated rather than observed, `PriceObs.source = 'SYNTHETIC'` and the chart shows a badge. | Presenting generated data as government data to a government panel is the one mistake you cannot recover from. |
| **I7** | **No secrets in git.** Only `.env.example` is committed. No API keys, no tokens, no connection strings in code or docs. | — |
| **I8** | **No Aadhaar numbers stored, ever.** Not hashed, not encrypted, not "just for the demo". Phone number is the identifier. | Legal exposure and it is trivially avoidable. |
| **I9** | **State transitions go through the FSM.** `src/lib/domain/escrow.ts` is the only place a transaction status changes. No ad-hoc `status = 'RELEASED'` anywhere. | Money state machines that can skip states are how funds get released without delivery. |
| **I10** | **Every API route validates its input with the Zod schema from `@mandi/contracts`.** No hand-rolled parsing, no `as any`. | One validation layer, one source of truth, no drift between client and server. |

---

## 3. You are one of five agents. Stay in your lane.

Five people are building this repository **simultaneously**, each with their own Claude Code session. The largest risk to this project is not missing features — it is two agents editing the same file and destroying each other's work at merge time.

### The ownership rule

**You may create, edit, or delete only files under paths your role owns.** If you need a change in a file owned by another role:

1. **Do not edit it.** Not even a one-line fix. Not even if it is obviously wrong.
2. Append a request to `docs/BLOCKERS.md` in the given format.
3. Write a local stub or a `TODO(Rn):` comment in *your own* file and keep moving.
4. R1 resolves it at the next sync window.

The only exceptions: `docs/BLOCKERS.md` (everyone appends) and your own role brief.

### Ownership map

| Path | Owner | Notes |
|---|---|---|
| `CLAUDE.md`, `docs/00_*`, `docs/01_*`, `docs/02_*` | **R1** | R1 only. `01_CONTRACTS.md` is frozen — see §5. |
| `docs/03_DEMO_AND_SEED.md` | **R5** | |
| `docs/roles/Rn_*.md` | **Rn** | Your own brief only. |
| `docs/BLOCKERS.md` | **all** | Append-only. Never rewrite another entry. |
| `prisma/schema.prisma`, `prisma/migrations/` | **R1** | Schema changes are requests, not edits. |
| `prisma/seed/00_reference.ts` | **R1** | Districts, markets, commodities, warehouses, cost tables. |
| `prisma/seed/10_prices.ts` | **R2** | Price history. |
| `prisma/seed/20_demo_story.ts` | **R5** | The demo narrative rows. |
| `packages/contracts/` | **R1** | Zod schemas + shared types. Frozen after H4. |
| `apps/web/src/lib/*.ts` | **R1** | `db`, `auth`, `guard`, `money`, `http`, `env`. |
| `apps/web/src/lib/domain/` | **R3** | FSM, matching, fair-split, ledger, grading rules. |
| `apps/web/src/lib/ml.ts` | **R2** | The ML service client. |
| `apps/web/src/app/api/auth/**` | **R1** | |
| `apps/web/src/app/api/prices/**`, `api/window/**` | **R2** | |
| `apps/web/src/app/api/{lots,grade,pools,demands,match,offers,escrow,ledger,disputes}/**` | **R3** | |
| `apps/web/src/app/(farmer)/**` | **R4** | |
| `apps/web/src/app/(buyer)/**`, `(fpo)/**`, `(admin)/**` | **R5** | |
| `apps/web/src/components/ui/**` | **R1** | shadcn primitives, installed once at H2. Do not modify; compose. |
| `apps/web/src/components/farmer/**`, `components/charts/**` | **R4** | R5 imports charts, does not edit them. |
| `apps/web/src/components/buyer/**` | **R5** | |
| `apps/web/messages/{en,mr}.json` | **R4** | Need a string? Request it. Do not add keys yourself. |
| `services/ml/**` | **R2** | Entire Python service. |
| `docker-compose.yml`, `.env.example`, root `package.json`, CI | **R1** | |
| `tests/e2e/**` | **R5** | |

If a path is not listed and not obviously inside someone's tree, it belongs to R1. Ask.

---

## 4. Roles at a glance

| ID | Codename | Mission | Branch |
|---|---|---|---|
| **R1** | **SPINE** | Architecture, DB, auth, contracts, integration, deploy. Unblocks everyone. | `r1-spine` |
| **R2** | **ORACLE** | Data ingestion, price forecasting, the sale-window optimiser. The differentiator. | `r2-oracle` |
| **R3** | **LEDGER** | Lots, grading, matching, offers, escrow FSM, hash-chained ledger, disputes. | `r3-ledger` |
| **R4** | **KISAN** | Farmer PWA. Mobile-first, Marathi-first, low-literacy UX. What judges see first. | `r4-kisan` |
| **R5** | **BAZAAR** | Buyer + FPO + admin consoles, demo dataset, E2E tests, deck and narrative. | `r5-bazaar` |

---

## 5. The contract freeze

`docs/01_CONTRACTS.md`, `packages/contracts/`, and `prisma/schema.prisma` are **frozen at H4** (end of the joint lockdown session). After that:

- Everyone builds against the contract, not against each other's code.
- R4 and R5 build UI against contract-shaped fixtures **before** R2 and R3 have working endpoints. That is the point of freezing.
- A contract change requires: a `docs/BLOCKERS.md` entry tagged `CONTRACT`, R1's approval, and R1 announcing it in the group chat. Expect this to happen two or three times. Expect it to happen *zero* times after H38.

**Additive changes are cheap. Renames and type changes are expensive. Prefer adding an optional field over changing an existing one.**

---

## 6. Commands

```bash
npm install                  # root, installs all workspaces
npm run db:up                # docker compose up postgres
npm run db:push              # prisma db push (dev; R1 owns migrations)
npm run db:seed              # runs prisma/seed/*.ts in order
npm run dev                  # next dev on :3000
npm run ml                   # uvicorn ML service on :8000
npm run verify               # typecheck + lint + unit tests + build  <- MUST pass before you push
npm run test:e2e             # playwright, R5
```

ML service, from `services/ml/`:

```bash
uv venv --python 3.11        # NOT python3 — the default is 3.14, no LightGBM wheel exists
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 7. Coding standards

- **TypeScript strict.** No `any`. No `@ts-ignore`. No non-null `!` on values that come from the network or DB.
- **Server components by default.** `'use client'` only where you need state, effects, or handlers.
- **Every API route:** `guard()` → Zod `.parse()` → domain function → typed response. Business logic lives in `src/lib/domain/`, never inline in a route handler.
- **Errors:** throw `AppError(code, message, status)` from `src/lib/http.ts`. The route wrapper turns it into `{ error: { code, message } }`. Never leak a stack trace or a raw Prisma error to the client.
- **Naming:** `camelCase` in TS, `snake_case` in SQL, Prisma `@map` bridges them. Money fields end `Paise`. Quantities are **integer kilograms** and end `Kg` (`qtyKg`; 1 quintal = 100 kg — display in quintals, store in kg). Rates and shares are **basis points** and end `Bps`. Dates are `Date`, never a string, never a timestamp integer.
- **No new dependency without R1's approval.** Every added package is a merge conflict in `package-lock.json` and a supply-chain risk. The stack in §8 is sufficient.
- **Comments explain *why*, never *what*.** Match the density of the surrounding file.
- **Delete dead code as you go.** Do not leave commented-out blocks "in case".

---

## 8. Stack — fixed, do not substitute

| Layer | Choice |
|---|---|
| Monorepo | npm workspaces |
| Web | Next.js 15 App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| DB | PostgreSQL 16 (Docker locally, Neon in production) |
| ORM | Prisma |
| Validation | Zod, shared via `@mandi/contracts` |
| Auth | Phone + OTP, bcrypt PIN, JWT in httpOnly cookie via `jose` |
| i18n | Plain JSON dictionaries + React context. **No i18n library.** |
| ML | Python **3.11**, FastAPI, LightGBM, pandas, numpy, statsmodels |
| Tests | Vitest (unit), Playwright (E2E) |
| Deploy | Vercel (web), Fly.io or Railway (ML), Neon (DB) |

---

## 9. Git protocol

- Branch per role: `r1-spine` … `r5-bazaar`. Never commit to `main` directly.
- **Commit every 20–30 minutes.** Small commits. `Rn: <what changed>`.
- **Push every hour.** An unpushed branch is work that does not exist.
- `npm run verify` must pass before every push. A broken push blocks four other people.
- **Rebase, never merge:** `git fetch origin && git rebase origin/main`.
- **Never `git push --force` to a shared branch. Never touch `main` history.**
- R1 merges all branches into `main` at each sync window. Everyone rebases immediately after.
- If you hit a conflict in a file you do not own: **abort the rebase, take theirs, re-apply your own change.** Do not "fix" their file.

---

## 10. Definition of done

A task is done when **all** of these hold. Not four of five.

1. `npm run verify` passes.
2. The endpoint or screen works against **seeded** data, with no external network call.
3. Zod validation on every input; invalid input returns a 400 with a coded error, not a 500.
4. Authorization: another farmer's ID returns 403/404, never their data. You have tested this by hand.
5. Money is paise everywhere in the path. You have grepped your diff for `parseFloat`, `Number(`, and `.toFixed`.
6. The empty state, loading state, and error state all render — not just the happy path.
7. Marathi strings exist for anything a farmer sees (request them from R4 if missing).
8. Committed and pushed.

---

## 11. When you are blocked

Do not stall and do not silently invent a workaround in someone else's file. In this order:

1. **Is it in the contract?** If yes, build against the contract with a fixture. The other side will catch up.
2. **Can you stub it?** Write the stub in *your* directory, mark `TODO(Rn):`, keep going. Stubs at H12 are fine. Stubs at H58 are not.
3. **Append to `docs/BLOCKERS.md`:**

```markdown
### [R2 → R1] CONTRACT: ForecastPoint needs a `dataQuality` field
- **What I need:** `dataQuality: 'OBSERVED'|'IMPUTED'|'SYNTHETIC'` on `ForecastPoint`.
- **Why:** I cannot honour I6 without it — the chart has no way to badge the series.
- **Blocking:** R2-4, and R4's chart component downstream.
- **Workaround in place:** returning it in `meta` for now.
- **Raised:** Day 1 H09
```

4. Say it in the group chat. `BLOCKERS.md` is the record; chat is the alert. Both, always.

**Never leave a blocker undeclared for more than 30 minutes.** The cost of a blocker is not your idle time — it is the wrong thing four other people build on top of it.

---

## 12. Things that will lose us the hackathon

Read this list once a day.

- **A feature that only works in one hand-typed path.** Judges click the second thing. Every screen needs a real empty state.
- **A live API call in the demo.** See I5.
- **A confident forecast with no interval.** A point prediction with no uncertainty is not intelligence; it is a guess with a chart. p10/p50/p90 or nothing.
- **An unverified number on a slide.** Every external figure needs provenance or it comes off the slide. See the playbook's `[VERIFY]` discipline.
- **Blockchain theatre.** We use a hash-chained append-only table and we can explain exactly why that is the right call and a chain is not. Do not add a chain. Read playbook Ch 08.
- **Feature work after freeze (H58).** Nothing new after H58. Nothing. The last 14 hours are integration, seeding, deploy, and three full rehearsals.
- **Silence.** A blocker nobody declared is the most expensive object in this repository.
