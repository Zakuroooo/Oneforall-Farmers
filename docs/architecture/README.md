# MANDI-SETU — Architecture Baseline

**Smart India Hackathon 2026 · Problem Statement 26132 · Government of Maharashtra**
Team: Akash · Kartik · Nikhil · Nilesh · Pranay · Shreya

---

## Read this first

> **The binding constraint on farmer price realisation is not information — it is the ability to wait.** Farmers already suspect prices will rise; they sell at harvest because they cannot afford not to. So we are not building a price dashboard. We are building a **waiting product**: a system that tells a farmer whether waiting pays, by how much, with what confidence, and then removes the liquidity and storage reasons they could not wait.

**The hero feature is one endpoint.** `POST /api/v1/window/recommend` returns **SELL_NOW / SELL_ELSEWHERE / HOLD / SPLIT / NO_ADVICE** with expected rupee gain per quintal, a confidence band, and the costs it netted out. Everything else on screen exists to make that recommendation credible. If this endpoint is weak, the project is weak.

**Every feature must answer:** *does this help a farmer wait profitably, or help a buyer trust a lot enough to pay more for it?* If neither, it is out of scope.

---

## If you only read three things

1. **`00_CANON.md`** — the schema, the invariants, the API contract. Everything else defers to this file.
2. **Your own lane document** (table below).
3. **`03_TASK_ASSIGNMENT_36H.md`** — the clock. Your tasks, by hour, by name.

Everything else is reference. Do not read all twelve files before you start; read your three and begin.

---

## The document set

| # | File | Read it if you are… | What it is |
|---|---|---|---|
| **00** | [00_CANON.md](00_CANON.md) | **everyone, first** | 24-table Postgres DDL, invariants **I1–I15**, the full `/api/v1` contract, ownership map by name. **This file wins every disagreement.** |
| **01** | [01_PRD.md](01_PRD.md) | everyone | Scope **F1–F19 + A1–A4**, the 25-screen inventory, hero and refusal mockups, 7 open decisions |
| **02** | [02_TRD_SYSTEM_DESIGN.md](02_TRD_SYSTEM_DESIGN.md) | everyone | System context, repo tree, the 12-step hero request trace, `guard()`, the escrow FSM, docker-compose, deploy sequence, risk register |
| **03** | [03_TASK_ASSIGNMENT_36H.md](03_TASK_ASSIGNMENT_36H.md) | **everyone, second** | The 36-hour clock. Per-person task tables, the H4 data gate, the H12 integration stitch, mandatory staggered sleep, the H30 hard freeze |
| **04** | [04_DATA_ARCHITECTURE.md](04_DATA_ARCHITECTURE.md) | **Kartik** | The five-rung data acquisition ladder with hard timeboxes, normalisation, seven validation gates, the cost table, the seed layout |
| **05** | [05_AI_ARCHITECTURE.md](05_AI_ARCHITECTURE.md) | **Nikhil, Nilesh** | LightGBM quantile forecasting, features and anti-leakage rules, the backtest, the model card, `decide()`, refusal logic, the pledge quote |
| **06** | [06_BACKEND_ARCHITECTURE.md](06_BACKEND_ARCHITECTURE.md) | **Akash** | Layout, the error envelope, OTP + JWT, `guard()`, lots, grading, matching, the counter-offer, the escrow FSM, disputes, `smoke.sh` |
| **07** | [07_FRONTEND_ARCHITECTURE.md](07_FRONTEND_ARCHITECTURE.md) | **Pranay, Shreya** | One codebase two apps, `api.ts`, `money.ts`, the verdict screen, charts, i18n, voice, offline, the four states, screen ownership |
| **08** | [08_DEVOPS_AND_DEPLOY.md](08_DEVOPS_AND_DEPLOY.md) | **Kartik** | docker-compose, nginx, EC2 provisioning, the rehearsed deploy, the four-rung fallback ladder, CI, backups |
| **09** | [09_PHASE_2.md](09_PHASE_2.md) | after H36 only | **F20 realisation tracking** (the trust flywheel), real escrow, nightly ingestion, SMS/IVR, conformal intervals |
| **10** | [10_PHASE_3.md](10_PHASE_3.md) | after Phase 2 only | The four gates, pooled models at 300 markets, **real pledge finance**, institutional integration |
| **11** | [11_DEMO_AND_PITCH.md](11_DEMO_AND_PITCH.md) | **everyone, by H30** | The 11-beat demo script, the 9-slide deck, **the eleven questions and their answers**, the fallback plan |

---

## Read this if you are…

| You | Read, in this order |
|---|---|
| **Akash** (backend) | `00_CANON` → `06_BACKEND` → `03_TASKS` §5 (A1–A6) → `11_DEMO` Q5, Q7 |
| **Kartik** (data + devops) | `00_CANON` §6 → `04_DATA` → `08_DEVOPS` → `03_TASKS` §5 (K1–K7) → `11_DEMO` Q1, Q2, Q6 |
| **Nikhil** (forecasting) | `00_CANON` §7 → `05_AI` §1–2 → `03_TASKS` §5 (N1–N5) → `11_DEMO` Q3 |
| **Nilesh** (decision engine) | `00_CANON` §7 → `05_AI` §1, §3 → `03_TASKS` §5 (L1–L7) → `11_DEMO` Q4, Q9 |
| **Pranay** (farmer app) | `00_CANON` §7 → `07_FRONTEND` → `01_PRD` §screens → `03_TASKS` §5 (P1–P8) |
| **Shreya** (buyer web, i18n, voice, pitch) | `07_FRONTEND` → `11_DEMO` **in full** → `03_TASKS` §5 (S1–S6) |

---

## The invariants — all fifteen, in one place

Breaking one is a bug even if the tests pass. Full statements in `00_CANON.md` §5.

| # | Invariant |
|---|---|
| **I1** | **All money is integer paise.** Never float, never rupees. Fields end `_paise`. Format only at the render edge. |
| **I2** | **No secrets in git.** Only `.env.example`, with empty values. A leaked key gets rotated — deleting the line does not remove it from history. |
| **I3** | **`audit_log`, `escrow_events`, `dispute_events`, `realisation_ledger` are append-only.** No `UPDATE`, no `DELETE`, ever. |
| **I4** | **Every read of user-owned data is scoped by the session actor**, from the JWT, never from a client-supplied ID. Use `guard()`. **404, not 403.** |
| **I5** | **The model may refuse.** When the band exceeds the threshold, return `NO_ADVICE` with a reason. Never invent a confident number. |
| **I6** | **State transitions go through the FSM only.** `domain/escrow.py` is the sole place a transaction status changes. |
| **I7** | **The demo makes zero live external network calls.** Ingestion is an offline CLI that writes to Postgres. |
| **I8** | **Synthetic or imputed data is labelled in the UI.** Every price row carries `source` and `source_url`. |
| **I9** | **Quantities are integer kilograms** (`_kg`), displayed in quintals. **Rates are basis points** (`_bps`). |
| **I10** | **Every route validates its input with a Pydantic schema.** No hand-rolled parsing. |
| **I11** | **Both numbers, always.** The worst case renders at the same font size as the best case. |
| **I12** | **Never log phone numbers, OTPs, or full payloads.** `redact()` at the boundary. |
| **I13** | **If pledge interest ≥ expected gain, no pledge card.** Server returns `None`. |
| **I14** | **No `random.random()` / `Math.random()` for anything security-relevant.** OTPs from `secrets`. |
| **I15** | **No Aadhaar numbers, ever.** Not hashed, not encrypted, not in seed data. **Phone is the identifier.** |

**The two that will be tested by a judge:** I4 (they will try another farmer's ID) and I5 (they will ask what happens when the model is wrong). Have both ready to demonstrate, not describe.

---

## The stack — fixed, do not substitute

| Layer | Choice | Note |
|---|---|---|
| App | **Expo / React Native**, one codebase | native + `expo start --web`, role-based navigators |
| State | TanStack Query + React Context | **no Redux** |
| Charts | `victory-native` | |
| API | **FastAPI**, Pydantic v2, SQLAlchemy 2.0, Alembic | |
| DB | **PostgreSQL 16** in Docker | enums as `text` + `CHECK`, not native PG enums |
| ML | **LightGBM quantile regression**, in-process in the API | `objective='quantile'`, α ∈ {0.1, 0.5, 0.9} |
| Python | **3.11** — `uv venv --python 3.11` | 3.14 has no LightGBM wheel. This is not negotiable. |
| Deploy | one **EC2 t3.small**, nginx, docker-compose | swap file required |
| Wire format | **`snake_case`** end to end | the frontend reads `expected_gain_paise` directly, no aliasing |

---

## The 36 hours, at a glance

| Hour | What |
|---|---|
| **H0–H2** | Contract lockdown. **Nobody codes alone.** Schema + API shapes + fixtures agreed. |
| **H2–H4** | Skeletons. **★ H4 DATA GATE** — Kartik reports which rung he is on, out loud. |
| **H4–H12** | Parallel build against the frozen contract. |
| **H12** | **★ Integration stitch.** 60 minutes, everyone at one table, 7 steps. |
| **H14–H20** | **★ Staggered sleep. This is a deliverable, not a luxury.** |
| **H20–H28** | Differentiators. **★ H28 deploy rehearsal on EC2.** |
| **H30** | **★★ HARD FEATURE FREEZE.** Nothing new. Nothing. |
| **H30–H33** | Three golden-path runs. **★ H32 record the fallback video.** |
| **H33–H36** | Deck + three timed rehearsals, the last one with a hostile judge. |

Full detail in `03_TASK_ASSIGNMENT_36H.md`.

---

## Commands

```bash
docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python -m seed.run_all
bash scripts/smoke.sh
```

```bash
cd app && npx expo start
```

```bash
cd api && uv venv --python 3.11 && source .venv/bin/activate && uv pip install -r requirements.txt
```

---

## What loses this hackathon

Read once a day.

- **A feature that works only in one hand-typed path.** Judges click the second thing. Every screen needs a real empty state.
- **A live API call during the demo.** Venue wifi fails. It always fails.
- **A confident forecast with no interval.** p10/p50/p90 or nothing.
- **An unverified number on a slide.** No source → it comes off the slide.
- **Unlabelled synthetic data shown to a government panel.** The one unrecoverable mistake available to this team.
- **Blockchain theatre.** We use a hash-chained append-only table and we can explain exactly why. Do not add a chain.
- **Feature work after H30.** Nothing new. The last six hours are integration, seeding, deploy, and three rehearsals.
- **Silence.** A blocker nobody declared is the most expensive object in this repository. `docs/BLOCKERS.md` is the record; the group chat is the alert. Both, always, within 30 minutes.

---

## Why this project exists

Every year, farmers in Maharashtra sell at harvest for less than their crop is worth, because they cannot afford to wait — and some of them do not survive that gap.

We cannot fix the whole of that. What we can build is a system that tells a farmer whether waiting pays, in his language, with the worst case shown next to the best one, **and that refuses to answer when it does not know.**

That last clause is the product. Everything else is engineering.
