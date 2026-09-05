# MANDI-SETU — Repository Instructions

> **Every Claude Code session in this repository loads this file automatically. Read it fully before your first edit.**

**Smart India Hackathon 2026 · Problem Statement 26132 · Government of Maharashtra**
Team of six: **Akash · Kartik · Nikhil · Nilesh · Pranay · Shreya**

---

## 0. First thing: who are you?

The user will tell you their name — *"I am Pranay"*, *"I am Akash"*. When they do:

1. Read **`docs/PLAN.md`** — the universal plan. All 73 tasks, who blocks whom, the hour-by-hour. **Read §0 and §5 in full; you only need your own block of §3.**
2. Read **`docs/roles/<NAME>.md`**. That is their PRD, TRD, and ordered task list. It is self-contained.
3. Read **`docs/architecture/00_CANON.md`** — the schema, the invariants, the API contract. **This is the file that lets everyone work in parallel: build against the contract, not against a person.**
4. If they touch `app/`, read **`docs/architecture/12_STACK.md`** — the stack changed to React Native CLI on 2026-09-05.
5. Read the one lane document their role doc points at.
6. Then start on task 1. Do not read all fourteen architecture files first.

**Nobody waits for a teammate.** If task N needs an endpoint that does not exist yet, build against a fixture shaped exactly like `00_CANON.md` §7, leave a `TODO(<owner>):`, and keep going. `docs/PLAN.md` §0 explains the rule; §5 lists what every person can start at hour zero.

If the user has not said who they are, ask once, then proceed.

| Name | Lane | Role doc | Lane doc |
|---|---|---|---|
| **Akash** | Backend **lead** — API, auth, escrow FSM, matching | `docs/roles/AKASH.md` | `06_BACKEND_ARCHITECTURE.md` |
| **Kartik** | Backend **support** + data acquisition + deploy | `docs/roles/KARTIK.md` | `04_DATA_ARCHITECTURE.md`, `08_DEVOPS_AND_DEPLOY.md` |
| **Nikhil** | Forecasting model (LightGBM quantile) | `docs/roles/NIKHIL.md` | `05_AI_ARCHITECTURE.md` §1–2 |
| **Nilesh** | Decision engine, costs, refusal, pledge | `docs/roles/NILESH.md` | `05_AI_ARCHITECTURE.md` §1, §3 |
| **Pranay** | Frontend **lead** — farmer app, screens S1–S16 | `docs/roles/PRANAY.md` | `07_FRONTEND_ARCHITECTURE.md` |
| **Shreya** | Frontend — buyer/FPO screens, i18n, voice, pitch | `docs/roles/SHREYA.md` | `07_FRONTEND_ARCHITECTURE.md`, `11_DEMO_AND_PITCH.md` |

**Three lanes, two people each:** Pranay + Shreya on the app · Akash + Kartik on the API · Nikhil + Nilesh on the model. Within a lane the first name listed is the lead and owns the shared files.

---

## 1. What we are building

A **market-intelligence and transaction-enablement platform for farmers of Maharashtra**. Scope: Maharashtra only. Two crops, six markets, real data.

### The one-sentence thesis

> The binding constraint on farmer price realisation is not information — it is **the ability to wait**. Farmers already suspect prices will rise; they sell at harvest because they cannot afford not to. So we are not building a price dashboard. We are building a **waiting product**: a system that tells a farmer whether waiting pays, by how much, with what confidence, and then removes the liquidity and storage reasons they could not wait.

Every feature must answer: *does this help a farmer wait profitably, or help a buyer trust a lot enough to pay more for it?* If neither, it is out of scope.

### The hero feature

`POST /api/v1/window/recommend` → returns **SELL_NOW / SELL_ELSEWHERE / HOLD / SPLIT / NO_ADVICE** with expected rupee gain per quintal, a p10–p90 confidence band, and the costs it netted out. Everything else on screen exists to make that recommendation credible. **If this endpoint is weak, the project is weak.**

### The shape of the product

**One React Native codebase, two navigators.** The farmer app and the buyer console are the *same* React Native app; the JWT's `role` claim selects `FarmerNavigator` or `BuyerNavigator` at the root. The buyer runs the **same binary on a second device** — there is no web build. See `docs/architecture/12_STACK.md` §0 for why.

There is **no separate web project**, no Next.js, no second frontend repo.

---

## 2. The invariants — I1 to I16

Breaking one is a bug even if the tests pass. **`docs/architecture/00_CANON.md` §3 is the authoritative statement of every invariant, including the numbering.** The table below is the same list in short form — if it ever disagrees with CANON, CANON wins and this table is the bug.

| # | Invariant |
|---|---|
| **I1** | **All money is integer paise.** Never float, never rupees. Fields end `_paise`. Format only at the render edge, via `formatPaise()`. |
| **I2** | **Quantities are integer kilograms** (`_kg`). 1 qtl = 100 kg. **Store kg, display quintals.** |
| **I3** | **Rates and shares are basis points** (`_bps`). 10000 bps = 100%. |
| **I4** | **Every read of user-owned data is scoped by the JWT actor**, never by a client-supplied ID. Use `guard()`. **Return 404, not 403** — a 403 confirms the row exists. |
| **I5** | **`audit_log`, `escrow_events`, `dispute_events`, `realisation_ledger` are append-only.** No `UPDATE`, no `DELETE`, ever. |
| **I6** | **The model may refuse.** When the p10–p90 band exceeds the threshold, return `NO_ADVICE` with a reason. Never invent a confident number. |
| **I7** | **The demo makes zero live external network calls.** Ingestion is an offline CLI that writes to Postgres. |
| **I8** | **Generated data is labelled generated.** Every price row carries `source` and `source_url`; the UI badges anything not `AGMARKNET`/`MSAMB`. |
| **I9** | **No Aadhaar numbers, ever.** Not hashed, not encrypted, not in seed data, not "just for the demo". **Phone is the identifier.** |
| **I10** | **No secrets in git.** Only `.env.example`, with empty values. A leaked key gets rotated — deleting the line does not remove it from history. |
| **I11** | **State transitions go through the FSM only.** `api/app/domain/escrow.py` is the sole place a transaction status changes. No ad-hoc `status = 'RELEASED'` anywhere. |
| **I12** | **Every route validates its input with a Pydantic schema.** No hand-rolled parsing, no `dict[str, Any]` bodies. |
| **I13** | **If pledge interest ≥ expected gain, no pledge card.** The server returns `None`. |
| **I14** | **Never log phone numbers, OTPs, or full payloads.** `redact()` at the boundary. |
| **I15** | **No `random.random()` / `Math.random()` for anything security-relevant.** OTPs come from `secrets`. |
| **I16** | **Both numbers, always.** The worst case renders at the **same font size** as the expected gain — never smaller, greyer, collapsed, or behind a tap. |

**The two a judge will actually test:** **I4** (they will try another farmer's ID) and **I6** (they will ask what happens when the model is wrong). Both must be demonstrable, not describable.

---

## 3. Stack — fixed, do not substitute

> **`docs/architecture/12_STACK.md` is the complete, authoritative list.** The table below is the summary. If they disagree, 12_STACK wins.
> **Changed 2026-09-05: React Native CLI, not Expo.** Anything you read with an `expo-` import is pre-change — translate it with 12_STACK §4.

| Layer | Choice | Note |
|---|---|---|
| App | **React Native CLI** 0.76.x, one codebase | **not Expo**; role-based navigators; no web build |
| Navigation | React Navigation v7 | `native-stack` + `bottom-tabs` |
| State | **TanStack Query + React Context** | **no Redux** |
| Charts | **`react-native-svg`, hand-rolled** (~60 lines) | **no victory-native** — 12_STACK §3.1 |
| Carousel | **`FlatList` horizontal + `pagingEnabled`** | no carousel library |
| Chat | **TanStack Query 4 s polling** | no websockets |
| Call | **`Linking.openURL('tel:…')`** | built in, zero deps |
| API | **FastAPI**, Pydantic v2, SQLAlchemy 2.0, Alembic | |
| DB | **PostgreSQL 16** in Docker | enums as `text` + `CHECK`, not native PG enums |
| ML | **LightGBM quantile regression**, in-process in the API | `objective='quantile'`, α ∈ {0.1, 0.5, 0.9} |
| Python | **3.11** — `uv venv --python 3.11` | 3.14 has no LightGBM wheel. Not negotiable. |
| JDK | **17** | RN 0.73+ requires exactly 17. Not 11, not 21. |
| i18n | Plain JSON dictionaries + React Context | **no i18n library**; `mr` · `hi` · `en` |
| Voice | Pre-generated Marathi mp3 clips, sequenced by **`react-native-sound`** | offline by design; **`react-native-tts`** fallback |
| Deploy | one **EC2 t3.small**, nginx, docker-compose | swap file required |
| Wire format | **`snake_case` end to end** | the frontend reads `expected_gain_paise` directly, no aliasing |

**No new dependency without asking the team.** Every added package is a lock-file conflict and a supply-chain risk. The stack above is sufficient. `12_STACK.md` §2 lists what is explicitly banned.

---

## 4. Repo layout

```
api/                    FastAPI service           — Akash (+ Nikhil/Nilesh in app/ml/, app/domain/decide.py)
  app/main.py           routers, middleware
  app/models.py         SQLAlchemy models
  app/schemas.py        Pydantic request/response
  app/deps.py           guard(), get_db, current_actor
  app/routers/          auth, prices, window, lots, grade, pools, demands,
                        match, offers, escrow, ledger, disputes, meta
  app/domain/           decide.py, costs.py, grading.py, matching.py,
                        split.py, escrow.py, pledge.py, ledger.py
  app/ml/               features.py, train.py, predict.py, backtest.py, model_card.json
  alembic/              migrations
  seed/                 run_all.py, 00_reference.py, 10_prices.py, 20_demo_story.py
  tests/
ingest/                 offline data CLI          — Kartik
app/                    React Native CLI app      — Pranay (farmer), Shreya (buyer/i18n/voice)
  src/lib/              api.ts, money.ts, offline.ts, i18n.tsx, voice.ts, config.ts
  src/components/       ui/, charts/, farmer/, buyer/
  src/screens/          farmer/ (S1–S16, S26), buyer/ (S17–S25, S27)
  src/fixtures/         CANON-shaped fixtures — how you work before an endpoint exists
  assets/audio/mr/      pre-generated Marathi clips (committed — I7)
  android/              native project — network_security_config.xml lives here
nginx/  infra/  scripts/  docker-compose.yml       — Kartik
docs/PLAN.md            ★ the universal plan — all 73 tasks, everyone
docs/architecture/      the baseline (00–12 + README)
docs/roles/             one file per person
docs/design/            CLAUDE_DESIGN_PROMPT.md
docs/reference/         PLAYBOOK.md (55-page research base), DATA_SOURCE_RECIPES.md
docs/BLOCKERS.md        append-only, everyone
```

**Ownership is by directory.** You may create, edit, or delete only files in your lane. If you need a change in someone else's file:

1. **Do not edit it.** Not even a one-line fix. Not even if it is obviously wrong.
2. Append to `docs/BLOCKERS.md` in the format in §7.
3. Stub it in *your own* file with `TODO(<name>):` and keep moving.
4. Say it in the group chat.

The only shared file is `docs/BLOCKERS.md`, and it is append-only — never rewrite someone else's entry.

---

## 5. Coding standards

**Python (api/, ingest/)**
- Type hints on every function signature. Pydantic v2 for all request/response models.
- Every route: `guard()` → Pydantic validation → a function in `app/domain/` → typed response. **Business logic never lives in a route handler.**
- Errors: raise `AppError(code, message, status)`. The middleware renders `{"error": {"code": ..., "message": ...}}`. Never leak a stack trace, a raw SQL error, or a Prisma/SQLAlchemy repr to the client.
- Money arithmetic uses `//`, never `/`. Grep your own diff for `float(`, `/ 100`, `round(`.

**TypeScript (app/)**
- Strict mode. No `any`. No `@ts-ignore`. No non-null `!` on anything from the network.
- The wire format is `snake_case` and the frontend reads it directly. Do not add a camelCase mapping layer.
- Money is a `number` of paise and is formatted **only** by `formatPaise()` at the render edge.
- Every screen renders four states: **loading · empty · error · data**. A screen with only the happy path is not done.
- Marathi is the default locale. English is the fallback.

**Both**
- `snake_case` in SQL and on the wire, `camelCase` inside TS, `snake_case` inside Python.
- Dates are `date`/`Date`, never a string, never an epoch int.
- Comments explain **why**, never what. Match the density of the surrounding file.
- Delete dead code as you go. No commented-out blocks "in case".

---

## 6. Commands

> **None of these work yet.** The repo is documentation-only until **K0** (compose), **A0** (API skeleton) and **P0** (app scaffold) land. That is expected, not a bug.

```bash
docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python -m seed.run_all
bash scripts/smoke.sh
```

```bash
cd app && npm install && npx react-native run-android
```

Needs **JDK 17** and an Android SDK. First run on a cold machine downloads for 15–30 minutes — start it before you read anything. `10.0.2.2` is the host from inside the emulator, not `localhost`; see `12_STACK.md` §7.

```bash
cd api && uv venv --python 3.11 && source .venv/bin/activate && uv pip install -r requirements.txt
```

`scripts/smoke.sh` must pass before every push. It includes the cross-actor 404 check (I4).

---

## 7. Git protocol

- Branch per person: `akash`, `kartik`, `nikhil`, `nilesh`, `pranay`, `shreya`. **Never commit to `main` directly.**
- **Commit every 20–30 minutes.** Small commits, message `<name>: <what changed>`.
- **Push every hour.** An unpushed branch is work that does not exist.
- **Rebase, never merge:** `git fetch origin && git rebase origin/main`.
- **Never `git push --force` to a shared branch. Never rewrite `main`.**
- Conflict in a file you do not own: **abort the rebase, take theirs, re-apply your own change.** Do not "fix" their file.

### Blocker format — `docs/BLOCKERS.md`

```markdown
### [Pranay → Nilesh] CONTRACT: window response needs `refusal_reason`
- **What I need:** `refusal_reason` on the NO_ADVICE response.
- **Why:** the refusal screen has nothing to render without it.
- **Blocking:** P6, and the beat-11 demo moment.
- **Workaround in place:** hardcoded Marathi string in a fixture.
- **Raised:** H14
```

`BLOCKERS.md` is the record; the group chat is the alert. **Both, always, within 30 minutes.** A blocker nobody declared is the most expensive object in this repository.

---

## 8. Definition of done

A task is done when **all** of these hold. Not four of six.

1. It works against **seeded** data, with **no live external network call**.
2. Input validated; invalid input returns a coded 400, never a 500.
3. Authorization tested by hand: another actor's ID returns **404**, never their data.
4. Money is integer paise along the whole path. You have grepped your diff for `float`, `parseFloat`, `/ 100`, `toFixed`.
5. Loading, empty, error and data states all render — not just the happy path.
6. Marathi strings exist for anything a farmer sees.
7. Committed and pushed.

---

## 9. Things that will lose us the hackathon

Read this once a day.

- **A feature that works only in one hand-typed path.** Judges click the second thing. Every screen needs a real empty state.
- **A live API call during the demo.** Venue wifi fails. It always fails.
- **A confident forecast with no interval.** p10/p50/p90 or nothing.
- **An unverified number on a slide.** No source → the number comes off the slide.
- **Unlabelled synthetic data shown to a government panel.** The one unrecoverable mistake available to this team.
- **Blockchain theatre.** We use a hash-chained append-only table and we can explain exactly why a chain is the wrong tool. Do not add a chain.
- **Feature work after H30.** Nothing new. The last six hours are integration, seeding, deploy, and three rehearsals.
- **Silence.** See §7.

---

## 10. Why this project exists

Every year, farmers in Maharashtra sell at harvest for less than their crop is worth, because they cannot afford to wait — and some of them do not survive that gap.

We cannot fix the whole of that. What we can build is a system that tells a farmer whether waiting pays, in his language, with the worst case shown next to the best one, **and that refuses to answer when it does not know.**

That last clause is the product. Everything else is engineering.
