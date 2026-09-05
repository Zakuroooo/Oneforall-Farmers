# START HERE

> **Six prompts. One per person. Copy your own block into Claude Code and send it.**
> Everything else in `docs/` is reference. This file is the starting gun.

---

## Before anybody sends anything: the 90-second setup

Each person, once:

```bash
git clone https://github.com/Zakuroooo/Oneforall-Farmers.git
cd Oneforall-Farmers
git checkout -b <your-name>        # akash | kartik | nikhil | nilesh | pranay | shreya
```

Then open Claude Code **in that directory** and paste your block below.

**Never commit to `main`.** Commit every 20–30 minutes, push every hour. `git fetch origin && git rebase origin/main` — rebase, never merge.

---

## ★ The one rule that makes six people work in parallel

Read this before your prompt. It is the answer to *"what do I do when I need Akash's endpoint and Akash hasn't built it?"*

> **You never wait for a person. You wait for a contract — and the contract already exists.**

`docs/architecture/00_CANON.md` §6 and §7 define every database table and every API response, exactly, today, before a line of code exists. So:

1. **Build against a fixture** that matches CANON's shape field-for-field.
2. **Mark the seam** `TODO(<owner>): swap fixture for real endpoint`.
3. **Log it** in `docs/BLOCKERS.md` if it is a real gap, and say it in the group chat.
4. **Keep moving.** When the real thing lands, you flip one flag.

**The fixture must match CANON exactly.** If a field is not in CANON §7.4, it does not go in your fixture — a screen or a test built on an invented field renders perfectly until the real endpoint arrives, and then every one of those reads is `undefined`. That is the single most common way this kind of build fails at hour 30. There is a logged instance of it in `docs/BLOCKERS.md` already.

**Nobody in this team is blocked at H0.** Everyone's first three tasks depend on nothing but the repo.

---

## The four gates — these are the only deadlines that matter

| Gate | Hour | Owner | If it slips |
|---|---|---|---|
| **DATA** — real Agmarknet rows in Postgres | **H4** | Kartik (K1) | Nikhil cannot train. This gate cannot be recovered later — everything downstream is on it. |
| **HERO** — `/ai/window/recommend` returns a real verdict | **H14** | Nilesh (L5) | The product has no product. |
| **VOICE** — verdict speaks Marathi in airplane mode | **H20** | Shreya (SH4) | Demo beat 7 dies. |
| **DEPLOY** — running on EC2, hit from a phone | **H28** | Kartik (K9) | You demo off a laptop. Survivable, not good. |

**Feature freeze at H30.** Nothing new after that — integration, seeding, deploy, three rehearsals. `docs/architecture/11_DEMO_AND_PITCH.md` §8.

---

# ⬇ FIND YOUR NAME AND COPY THE BLOCK

---

## AKASH — backend lead

```
I am Akash.

Read these three files fully, in this order, before you write anything:
1. docs/roles/AKASH.md          — my PRD, TRD and ordered task list
2. docs/architecture/00_CANON.md — the schema, the API contract, invariants I1–I16
3. docs/architecture/06_BACKEND_ARCHITECTURE.md

Then list my tasks A0 through A14 as a checklist and start on A0. Work
through them one at a time. After each task, tell me what you did in two
lines and commit with the message "akash: <what changed>". Do not run ahead
to the next task until I say continue.

Things to hold onto for every task:

- CANON §6 is the schema. Do not invent a column or rename one. If CANON
  and a role doc disagree, CANON wins and the role doc is a bug — log it in
  docs/BLOCKERS.md.
- I4 is the invariant a judge will personally test: every read of
  user-owned data is scoped from the JWT actor, never from a client-supplied
  ID, and a cross-actor read returns 404 — NOT 403, because a 403 confirms
  the row exists. Use guard(). Build the cross-actor test into
  scripts/smoke.sh as you go, not at the end.
- I1: all money is integer paise, field names end _paise. Use // for
  division, never /. No float anywhere in the money path.
- I11: api/app/domain/escrow.py is the ONLY place a transaction status
  changes. No ad-hoc status assignment anywhere else. The legal states are
  CREATED → ESCROW_HELD → DISPATCHED → DELIVERED → RELEASED, plus
  CANCELLED / REFUNDED / DISPUTED. Those exact strings — the CHECK
  constraint rejects anything else.
- I5: audit_log, escrow_events, dispute_events, realisation_ledger are
  append-only. No UPDATE, no DELETE, ever.
- I9: no Aadhaar field, not even nullable, not even in a comment. Phone is
  the identifier.
- I12: every route validates with a Pydantic v2 schema. Business logic
  lives in app/domain/, never in a route handler.
- I14: never log a phone number, an OTP, or a full payload. redact() at the
  boundary.
- I15: OTPs come from `secrets`, never `random`.
- Errors: raise AppError(code, message, status). Never leak a stack trace
  or a SQLAlchemy repr to the client. Invalid input is a coded 400, never
  a 500.

Files I own: api/app/main.py, deps.py, models.py, schemas.py, routers/**
except window/prices/meta, domain/{grading,matching,split,escrow,ledger}.py,
alembic/**. Do not edit anyone else's files — stub with TODO(<name>): and
append to docs/BLOCKERS.md instead.

I am not blocked by anyone at A0. If you find yourself waiting on Kartik's
data or Nilesh's decision engine, write the migration and the route against
CANON's shape and stub the call.
```

---

## KARTIK — data, then deploy, then backend support

```
I am Kartik.

Read these fully, in this order:
1. docs/roles/KARTIK.md
2. docs/architecture/00_CANON.md
3. docs/architecture/04_DATA_ARCHITECTURE.md
4. docs/architecture/08_DEVOPS_AND_DEPLOY.md
5. docs/reference/DATA_SOURCE_RECIPES.md

Then list my tasks K0 through K11 and start on K0. One at a time, commit
after each as "kartik: <what changed>", tell me what you did in two lines,
and wait for me before the next one.

★ K1 IS THE H4 GATE AND IT IS THE MOST IMPORTANT TASK ANY OF US HAS.
Real Agmarknet onion and tomato modal prices, six Maharashtra markets
(Lasalgaon, Pimpalgaon, Niphad, Yeola, Nashik, Pune), in Postgres, before
hour four. Nikhil cannot train a model until this lands, and no amount of
later effort recovers it. Do K0 and K1 before you do anything else, and if
K1 is going badly at H3, say so in the group chat immediately — the fallback
ladder in 04_DATA_ARCHITECTURE is the plan, not improvisation.

Also note: docker-compose.yml does not currently exist in this repo. It was
deleted. Recreating it is part of K0 — Postgres 16, the api service, and a
named volume. Every command in CLAUDE.md §6 fails until you do.

Things to hold onto:

- I7 is absolute: THE DEMO MAKES ZERO LIVE EXTERNAL NETWORK CALLS.
  Ingestion is an offline CLI that writes to Postgres and is run by hand.
  Nothing in the API ever reaches the internet at request time. Venue wifi
  fails; it always fails.
- I8: every price row carries source and source_url. Labels are
  AGMARKNET / MSAMB / ARCHIVE / IMPUTED / SIMULATED. Forward-fill across
  gaps of three days or less and label those rows IMPUTED. Never label a
  generated row as real. Showing unlabelled synthetic data to a government
  panel is the one unrecoverable mistake available to this team.
- I10: no secrets in git, only .env.example with empty values. A leaked key
  gets rotated — deleting the line does not remove it from history.
- K7 builds /meta/data-provenance. Row count, date range, imputed count,
  synthetic count, source URL. docs/architecture/11_DEMO_AND_PITCH.md has
  ⟨N⟩ and ⟨S⟩ placeholders waiting on exactly those numbers, and slide 7 is
  a screenshot of your endpoint. Do not let anyone put a made-up row count
  on that slide.
- EC2 t3.small needs a swap file before docker compose up or the build
  OOMs. This is in 08_DEVOPS §4 and it is the failure everyone hits once.
- Backend support to Akash starts AFTER K1 and K9 are behind you. If Akash
  is blocked at H6 and you are still on the data ladder, the answer is a
  fixture, not you. Say that out loud if someone asks you to switch.

Files I own: ingest/**, api/seed/{00_reference,10_prices}.py,
api/app/routers/{prices,meta}.py, docker-compose.yml, nginx/**, infra/**,
scripts/**, .env.example.
```

---

## NIKHIL — forecasting model

```
I am Nikhil.

Read these fully, in this order:
1. docs/roles/NIKHIL.md
2. docs/architecture/00_CANON.md
3. docs/architecture/05_AI_ARCHITECTURE.md sections 1 and 2

Then list my tasks N0 through N7 and start on N0. One at a time, commit
after each as "nikhil: <what changed>", two-line summary, wait for me.

Environment first, and this one is not negotiable: Python 3.11 exactly.
  cd api && uv venv --python 3.11 && source .venv/bin/activate
Python 3.14 has no LightGBM wheel. If you are on 3.12+ you will spend an
hour discovering this and it will feel like a mystery.

I am NOT blocked at N0. Kartik's real data lands at H4; until then, build
the feature pipeline and the training script against a synthetic price
series with the same schema as CANON §6's price table, and mark the seam
TODO(kartik): point at real rows. Then swap the source, not the code.

Things to hold onto:

- LightGBM quantile regression, objective='quantile', one model per
  alpha ∈ {0.1, 0.5, 0.9}. Three models, not one model with intervals.
  The p10 and p90 are the product; the p50 alone is worthless to us.
- ★ LEAKAGE IS THE ONLY WAY THIS TASK REALLY FAILS. Every feature must be
  computable strictly from data available at prediction time. No forward
  rolling windows, no target encoding over the full series, no scaler fit
  on the whole dataset. Split by TIME, never randomly — a random split on
  a price series gives you a beautiful MASE and a model that knows the
  future. Write down the cutoff date and check every feature against it.
- N5 is the backtest and it produces the two numbers we say on stage:
  MASE against a seasonal-naive baseline, and 80% band coverage. Report
  them honestly. docs/architecture/11_DEMO_AND_PITCH.md currently has ⟨X⟩
  and ⟨Y⟩ placeholders because an earlier draft had invented figures
  (0.83 / 81%) and CANON's example had different invented figures
  (0.71 / 78.4%). Both were fiction. Yours will be the first real ones and
  they are what you personally answer for in Q&A. If coverage comes back at
  40%, we say 40% — a wide honest band is a product; a narrow dishonest one
  is a liability.
- The model runs IN-PROCESS in the API. No separate model server, no REST
  call to a sidecar. Commit the pickles.
- N6 writes model_card.json with known limitations stated plainly,
  including that we cannot see export bans or policy shocks coming. That
  sentence gets read on stage.
- I6: if the p10–p90 band exceeds the threshold, the system refuses. Your
  job is to produce an honest band; Nilesh's is to decide when it is too
  wide. Do not narrow a band to make the product look better.

Files I own: api/app/ml/** and the committed model pickles.
```

---

## NILESH — decision engine

```
I am Nilesh.

Read these fully, in this order:
1. docs/roles/NILESH.md
2. docs/architecture/00_CANON.md — especially §7.4, the window response
3. docs/architecture/05_AI_ARCHITECTURE.md section 1 and section 3

Then list my tasks L0 through L9 and start on L0. One at a time, commit
after each as "nilesh: <what changed>", two-line summary, wait for me.

★ L5 IS THE HERO ENDPOINT AND THE H14 GATE. POST /api/v1/ai/window/recommend.
It returns SELL_NOW / SELL_ELSEWHERE / HOLD / SPLIT / NO_ADVICE with the
expected rupee gain, the worst case, a p10–p90 band, and the costs it netted
out. CLAUDE.md says it plainly: if this endpoint is weak, the project is
weak. Everything else on every screen exists to make this response credible.

I am NOT blocked at L0. Nikhil's model lands later; build decide.py against
a stub predictor that returns a fixed (p10, p50, p90) triple and mark it
TODO(nikhil):. The decision logic, the cost netting and the refusal
threshold are all testable without a real model — and they are where the
actual product judgement lives.

Things to hold onto:

- ★ THE RESPONSE SHAPE IS CANON §7.4, EXACTLY. Every key always present.
  There is NO best_case_paise, NO best_day, NO confidence_bps, NO
  model_version, NO source_summary. `confidence` is the string enum
  "LOW" | "MEDIUM" | "HIGH". Costs are costs.{...}_paise_per_qtl with a
  total_paise_per_qtl. An earlier draft of the frontend doc invented six
  fields that do not exist and it is logged as a bug in docs/BLOCKERS.md —
  do not re-invent them from the server side.
- ★ THE UNITS CONTRACT, and get this wrong and the demo number is wrong by
  10×: fields suffixed _per_qtl are PER QUINTAL. expected_gain_paise and
  worst_case_paise are WHOLE-LOT TOTALS, derived as
    (hold_pXX_net_paise_per_qtl − sell_now_net_paise_per_qtl) × (qty_kg // 100)
  On the canonical 4000 kg lot: (209650 − 193925) × 40 = 629000 paise =
  ₹6,290, and (181925 − 193925) × 40 = −480000 = −₹4,800. Those are the
  seeded demo figures. Multiply by hand before you believe any output.
- I6 IS THE INVARIANT THAT WINS US THE ROOM. When the band width exceeds
  NO_ADVICE_BAND_BPS (3500 = 35%), return NO_ADVICE with a refusal_reason
  from BAND_TOO_WIDE / INSUFFICIENT_HISTORY / STALE_DATA / GAIN_BELOW_COST,
  plus a Marathi explanation. Never invent a confident number.
  NO_ADVICE IS A 200, NOT AN ERROR — the frontend must not route it through
  an error state or offer a retry.
- ★ THIS ENDPOINT MUST NEVER RETURN 500. Any internal failure degrades to
  NO_ADVICE with a reason. A 500 on stage is unrecoverable; a refusal is a
  feature.
- I1: integer paise, // never /, no float in the money path. Grep your own
  diff for float(, / 100, round(.
- I13: if pledge interest ≥ expected gain, return pledge_quote: None. The
  server decides this, not the UI. And the disclaimer string "Indicative
  simulation — not a lender quote" is part of the contract — we are not a
  lender and must never read as one.
- L0's cost table: hardcode it with sourced constants and mark each one
  estimate-or-sourced. The ₹3.50/quintal/km transport figure is the single
  most likely detailed question from a domain judge, so know where it came
  from.

Files I own: api/app/domain/{decide,costs,pledge}.py, api/app/config.py,
api/app/routers/{window,ai}.py.
```

---

## PRANAY — frontend lead, farmer app

```
I am Pranay.

Read these fully, in this order:
1. docs/roles/PRANAY.md
2. docs/architecture/00_CANON.md — especially §7.4
3. docs/architecture/12_STACK.md — React Native CLI, every dependency
4. docs/architecture/07_FRONTEND_ARCHITECTURE.md

Then list my tasks P0 through P16 and start on P0. One at a time, commit
after each as "pranay: <what changed>", two-line summary, wait for me.

★ REACT NATIVE CLI, NOT EXPO. P0 is:
  npx @react-native-community/cli init MandiSetu
There is no web build and no expo-*. If any doc says `expo start --web`, it
is stale and I want to know. The buyer console is the same APK on a second
Android device.

RN CLI gotchas that will each cost an hour if I do not know them:
- Android emulator reaches my laptop at 10.0.2.2, not localhost.
- Android 9+ blocks cleartext HTTP. Needs network_security_config.xml
  scoped to 10.0.2.2, my LAN IP and localhost. NEVER
  android:usesCleartextTraffic="true" globally — that permits cleartext to
  every host and is exactly what a security-minded judge notices.
- JDK 17 exactly. Not 11, not 21.
- No EXPO_PUBLIC_*. Config lives in app/src/config.ts, committed, and no
  secret ever goes in it — the app holds no keys, auth is a runtime JWT.
- Metro needs a STATIC require map for audio clips. Dynamic require of an
  mp3 path fails at runtime, not at build time.
- app/android/ and app/ios/ are checked into git and they are mine. A Gradle
  change is a change everyone pulls, so it gets announced.

Things to hold onto:

- ★ I16, and it is the invariant I will personally be tempted to break:
  the WORST CASE renders at the SAME font size as the expected gain. 28sp
  and 28sp. Never smaller, greyer, collapsed, or behind a tap. There is no
  best case in this product — the comparison is gain vs. loss.
- ★ MY FIXTURE MATCHES CANON §7.4 FIELD-FOR-FIELD. If a key is not in
  CANON, it is not in my fixture. An earlier draft of my own role doc
  invented six fields and it is logged in docs/BLOCKERS.md. A screen built
  on an invented field renders perfectly until the real endpoint lands and
  then every read is undefined.
- I1/I2: money is a number of paise, formatted ONLY by formatPaise() at the
  render edge; quantities are integer kg, displayed as quintals by
  toQuintal(). Both FLOOR, never round — rounding up shows a farmer a rupee
  he will not receive. Those two functions are the only / 100 in app/src/.
- The wire format is snake_case and I read it directly. No camelCase mapping
  layer, no axios, no interceptors.
- TypeScript strict. No any, no @ts-ignore, no non-null ! on anything from
  the network.
- Every screen renders four states: loading, empty, error, data. A screen
  with only the happy path is not done.
- Marathi is the default locale, English is the fallback, and every string a
  farmer sees exists in Marathi.
- NO_ADVICE is a 200. It must not go through ErrorState and must not offer
  a retry.
- Warm the offline cache before any airplane-mode demo. A cold cache in
  airplane mode is an empty state, not a stale banner, and beat 7 dies.

I am NOT blocked at P0. Everything through P4 runs off fixtures.

Files I own: app/src/screens/farmer/**, app/src/components/{farmer,charts}/**,
app/src/lib/{api,money,offline}.ts, app/src/config.ts, app/App.tsx, the
navigators, app/android/** and app/ios/**.
```

---

## SHREYA — frontend, buyer console + language + pitch

```
I am Shreya.

Read these fully, in this order:
1. docs/roles/SHREYA.md
2. docs/architecture/00_CANON.md
3. docs/architecture/12_STACK.md — React Native CLI, every dependency
4. docs/architecture/07_FRONTEND_ARCHITECTURE.md
5. docs/architecture/11_DEMO_AND_PITCH.md — I narrate all 11 beats

Then list my tasks SH0 through SH10 and start on SH0. One at a time, commit
after each as "shreya: <what changed>", two-line summary, wait for me.

★ REACT NATIVE CLI, NOT EXPO. There is no expo-av and no expo-speech.
Audio is react-native-sound; the TTS fallback is react-native-tts. There is
no web build — the buyer console is the same APK on a second Android device,
so nothing I build can assume a browser, a mouse, or a hover state.

★ SH4 IS THE H20 GATE: the verdict speaks Marathi with the phone in
AIRPLANE MODE. That is demo beat 7 and it is the beat that proves the
product works in a field with no signal. Pre-generated mp3 clips stitched
together, shipped in the APK, zero network. Test it by actually enabling
airplane mode on a real device — not by reasoning that it should work.

Things to hold onto:

- Metro needs a STATIC require map for the audio clips. A dynamic require of
  a constructed mp3 path fails at runtime. Sound.setCategory('Playback')
  once at app start. If audio misbehaves in a way that smells native, it is
  Pranay's android/ directory — file it, do not edit it.
- ★ The spoken verdict says BOTH NUMBERS. The gain and the worst case, in
  the same clip sequence, at the same speed. A farmer who cannot read the
  screen must not receive a rosier answer than one who can — that is I16
  in the audio channel and it is easy to lose by trimming a clip.
- ★ NO / 100 IN THE VOICE CODE. Compose the spoken rupee figure from the
  already-formatted value or from integer paise arithmetic. The Marathi
  decomposition of ₹6,290 is ["सहा","हजार","दोनशे","नव्वद","रुपये"].
- i18n is plain JSON dictionaries plus React Context. No i18n library.
  Marathi default, English fallback, and SH9 adds Hindi as text-only —
  Hindi inherits Devanagari numerals from the same formatter for free.
  Devanagari numerals and Indian digit grouping: ₹१,४२,००० not ₹142,000.
- Every button and chip must survive the LONGEST of the three languages
  without truncating. Hindi runs 10–15% longer than Marathi and it is the
  one nobody checks.
- Four states on every buyer screen too: loading, empty, error, data. The
  buyer's empty state (no demands posted) is a real screen a judge will
  reach by clicking the second thing.
- The escrow timeline component (S22) is mine, and Pranay reuses it inside
  S15. Design the DISPUTED branch, not just the happy path — a timeline
  that only shows success is the one a judge asks about.
- ★ ON THE DECK: docs/architecture/11_DEMO_AND_PITCH.md has ⟨X⟩ ⟨Y⟩ ⟨N⟩ ⟨S⟩
  placeholders where MASE, coverage, row count and synthetic count go. They
  are placeholders because earlier drafts contained INVENTED numbers. Fill
  them at H30 from the running system, with Nikhil and Kartik, out loud —
  never from a document. Slide 7 is a screenshot of the provenance endpoint,
  not retyped figures. An unverified number on a slide is worse than no
  number, and this is a government panel.
- The demo figure I rehearse is +₹6,290 expected gain, −₹4,800 worst case,
  11 days (अकरा दिवस), on 40 quintals. If any older note says ₹62,900, it
  is a 10× error that has been corrected — see docs/BLOCKERS.md.

I am NOT blocked at SH0. SH0 and SH2 depend on nothing.

Files I own: app/src/screens/buyer/**, app/src/components/ui/**,
app/src/lib/{i18n,voice}.ts, app/messages/**, app/assets/audio/**,
scripts/gen_tts.py, docs/deck/**.
```

---

## What to do when you finish a task

1. `git add -A && git commit -m "<name>: <what changed>"`
2. Every hour: `git fetch origin && git rebase origin/main && git push origin <your-branch>`
3. **Grep for your name — that is your inbox:**
   ```bash
   grep -rn "TODO(kartik)" api/ app/ ingest/
   ```
4. If you are stopped: append to `docs/BLOCKERS.md` in the §7 format **and** say it in the group chat. Both, within 30 minutes.

**A blocker nobody declared is the most expensive object in this repository.**

---

## What loses us this hackathon

Read this once a day. It is `CLAUDE.md` §9 in short form.

- A feature that works only in one hand-typed path. **Judges click the second thing.**
- A live API call during the demo. Venue wifi fails. It always fails.
- A confident forecast with no interval.
- An unverified number on a slide.
- **Unlabelled synthetic data shown to a government panel** — the one unrecoverable mistake available to us.
- Blockchain theatre.
- Feature work after H30.
- **Silence.**

---

## And the reason any of this matters

> Every year, farmers in Maharashtra sell at harvest for less than their crop is worth, because they cannot afford to wait — and some of them do not survive that gap.

We cannot fix the whole of that in thirty-six hours. What we can build is a system that tells a farmer whether waiting pays, in his language, with the worst case shown at the same size as the gain, **and that refuses to answer when it does not know.**

That last clause is the product. Everything else is engineering.
