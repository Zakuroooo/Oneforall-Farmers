# THE UNIVERSAL PLAN

> **Every task in Mandi-Setu, by ID, with its owner, its blocker, and the hour it happens.**
> One page. If a piece of work is not on this page, it is not in Phase 1.

**Did this exist before? No.** `docs/architecture/03_TASK_ASSIGNMENT_36H.md` had a timeline, and each of the six role docs had its own task list — but there was no single place where all of them appeared together, so nobody could see whose task blocked whose. **This file is that place.** It is now the master; the role docs are the detail.

**Created 2026-09-05.** Reflects the React Native CLI decision (`docs/architecture/12_STACK.md`) and the revised role split (§2).

---

## 0. Read this section or nothing else on this page will help

### The problem you asked me to solve

*"No one should get stopped by others."*

With six people and one product, that is not automatic. Pranay's verdict screen needs Nilesh's endpoint. Nilesh's endpoint needs Nikhil's model. Nikhil's model needs Kartik's data. That is a four-person chain, and if it is a real chain, then **three people sit idle for the first eight hours.**

### The rule that breaks the chain

> **You never wait for a person. You wait for a contract, and the contract already exists.**

`docs/architecture/00_CANON.md` §7 defines the exact JSON shape of every endpoint in this system. It was written before any code. So:

**Nobody blocks on an endpoint. Everybody builds against a fixture that matches CANON §7, then swaps one line when the real endpoint lands.**

```ts
// app/src/fixtures/window.ts — Pranay writes this at H0, before Nilesh has written anything
export const fxHold: WindowRes = { /* exactly CANON §7.4, real numbers */ };

// app/src/lib/api.ts — the one line that changes at H14
const USE_FIXTURES = true;    // flip to false when Nilesh's L5 lands
```

```python
# api/app/ml/predict.py — Nilesh writes this stub at H0, before Nikhil has trained anything
def predict_quantiles(commodity: str, market: str, horizon: int) -> tuple[int, int, int]:
    """TODO(nikhil): replaced by the real model at N2. Shape is the contract."""
    return (185_000, 202_000, 231_000)      # p10, p50, p90 in paise/qtl — sorted, integer
```

Nilesh's entire decision engine — all eight tests, all five actions, all four refusal reasons — is buildable against that three-line stub. **His role doc says it outright: *"you are the only person on the team whose most important work has no upstream dependency."*** The same is true of everyone, if they take the fixture.

### The three rules that keep it true

1. **The fixture must match CANON exactly.** A fixture with an invented field is worse than no fixture: it produces a screen that works all day and shows `undefined` at the moment of integration. **Copy the shape from CANON §7, not from memory, not from another doc.**
2. **The stub must be labelled `TODO(<owner>):`.** That comment is the other person's inbox. Everyone greps for their own name before every push:
   ```bash
   grep -rn "TODO(nikhil)" api/ app/ ingest/
   ```
3. **A stub that outlives its owner's task is a bug.** At H24 there should be zero `TODO(` in code paths the demo touches. Check it; do not assume.

### So the honest answer to "can everyone start right now"

**Yes. Seven tasks have zero dependencies and they belong to six different people.** See §5.

---

## 1. What we are building — one paragraph, so nobody drifts

A farmer in Nashik opens the app, sees today's onion price for his mandi, and taps one button. The app tells him: **hold twelve days, expected gain ₹6,290 per lot, worst case −₹4,800**, with the p10–p90 band drawn and the five costs it subtracted listed underneath. It says this in Marathi, out loud, with no network. And when the model does not know, **it says it does not know, and why.** Then it removes the two reasons he could not wait anyway: a pledge quote against the lot, and a buyer on the other side who can see the grade and pay for it in escrow.

Everything on this page exists to make that paragraph true.

---

## 2. The team — REVISED 2026-09-05

| Person | Lane | Owns | Task IDs |
|---|---|---|---|
| **Pranay** | **Frontend — lead** | Farmer app S1–S16, `lib/{api,money,offline}.ts`, app scaffold | **P0–P16** (17) |
| **Shreya** | **Frontend** | Buyer S17–S25, `components/ui/**`, i18n, voice, deck | **SH0–SH10** (11) |
| **Akash** | **Backend — lead** | API, auth, escrow FSM, matching, ledger | **A0–A14** (15) |
| **Kartik** | **Backend — support** + data + deploy | Ingest, seed, price routes, Docker, nginx, EC2 | **K0–K11** (12) |
| **Nikhil** | **AI/ML — model** | LightGBM quantile forecasting, backtest | **N0–N7** (8) |
| **Nilesh** | **AI/ML — decision** | `decide()`, costs, refusal, pledge, `/ai/*` | **L0–L9** (10) |

**73 tasks.** (67 from the original plan + 6 for the new scope in §8.)

### What changed

**Kartik now supports Akash on the backend.** He is no longer a standalone Data+DevOps lane. Concretely:

- **Kartik still owns** `ingest/**`, `seed/**`, `routers/prices.py`, `routers/meta.py`, `docker-compose.yml`, `nginx/**`, `infra/**`, `scripts/**`. Those are still his files and nobody else edits them.
- **What is new:** once **K7** is done (≈H14), Kartik's default is *"ask Akash what to take."* Akash has 15 tasks and is the critical path for four other people; Kartik has slack after H14 and should spend it inside `api/`.
- **The handoff protocol:** Akash names a specific task — *"take A13 disputes"* — and it moves to Kartik in this file's register (§3), so ownership stays unambiguous. **Two people never hold the same task.** A file with two owners is a rebase conflict at H30.
- **Kartik keeps the deploy.** K8–K11 do not transfer. If the box is not up, nothing else matters.

**Pranay and Shreya are one frontend team, two lanes.** Pranay owns the farmer screens and the shared libs; Shreya owns the buyer screens, the design system, and every word. **They do not edit each other's screens.** Shreya changes a string by changing `mr.json`, never by opening a farmer screen.

**Nikhil and Nilesh are one AI team, two lanes.** Nikhil produces the numbers, Nilesh decides what they mean. The seam between them is exactly one function — `predict_quantiles()` — which is why Nilesh can stub it and work all day without Nikhil.

---

## 3. THE REGISTER — all 73 tasks

`★` = matters. `★★` = the demo fails without it. **Blocked-by lists the *contract*, not the person** — anything marked *(fixture)* means you start now and swap later.

### AKASH — backend lead — A0–A14

| ID | Task | Done when | Blocked by |
|---|---|---|---|
| **A0** | **Skeleton** — FastAPI app, `AppError` + both handlers, `guard()`, `get_db`, alembic init, `GET /meta/health` | `curl /meta/health` returns 200 before any feature exists | **nothing** |
| **A1** | **Auth** — `POST /auth/otp`, `/verify`, `/register`, `GET /auth/me` | Wrong OTP and unknown phone return **identical** errors | A0 |
| **A2** | **Rate limit + redaction** — 3/phone/10min, 5 attempts | No phone or OTP appears in any log line | A1 |
| **A3** | ★★ **Lots** — `POST /lots`, `GET /lots`, `GET /lots/{id}` through `guard()` | **Farmer A's token on farmer B's lot → 404, tested by hand** | A1 |
| **A4** | **Photo upload** — `POST /lots/{id}/photo`, multipart | **EXIF GPS stripped** — verified with `exiftool` on the stored file | A3 |
| **A5** | **Grading** — `domain/grading.py`, 6 questions, boundaries 750/500 | Same answers always give the same grade | A0 |
| **A6** | **Assay endpoint** — `POST /lots/{id}/assay` returning `tip_mr` | The tip names the **weakest** dimension, not a generic string | A5 |
| **A7** | ★ **Demands + matching** — `POST /demands`, `GET /match/{id}` incl. **COMBINATION** | A 100 qtl demand returns a 3-lot bundle | A3 |
| **A8** | ★ **Offers + counter** — post, counter, accept | A full chain: offer 1900 → counter 2000 → counter 1960 → accept | A7 |
| **A9** | ★ **Escrow FSM** — `domain/escrow.py`, `LEGAL`, `ACTOR`, `transition()` | An illegal transition returns **409**, and the grep is empty | A8 |
| **A10** | **Ledger** — hash chain, `GET /ledger/{txn_id}` with `chain_valid` | Tamper with a row by hand → `chain_valid: false` | A9 |
| **A11** | **Pools** — `POST /pools`, fair split summing to exactly 100% | The member shares sum to 10000 bps exactly, no rounding drift | A9 |
| **A12** | ★★ **`scripts/smoke.sh`** — the whole golden path as curl, including the cross-actor 404 | One command, green, from a cold DB | A10 |
| **A13** | **Disputes** — `POST /disputes`, `/resolve` | A dispute moves the FSM to `DISPUTED` and back legally | A9 |
| **A14** | **NEW — Chat + call** — `POST /threads`, `GET /threads/{id}/messages?after=`, `POST /threads/{id}/messages`, `POST /threads/{id}/reveal-phone` | Two actors exchange messages; `reveal-phone` logs the event, **never the number (I14)** | A8 |

### KARTIK — backend support + data + deploy — K0–K11

| ID | Task | Done when | Blocked by |
|---|---|---|---|
| **K0** | ★★ **`docker-compose.yml` + `.env.example` + Postgres up** | `docker compose up -d` and Akash can connect | **nothing** |
| **K1** | ★★ **Ingest** — 2 commodities × 3+ markets × ≥180 days | `count(*) ≥ 1000`, **all rows** with `source` + `source_url` | **nothing** · **H4 GATE** |
| **K2** | **`ingest/validate.py`** + committed `report_<crop>.md` | Seven gates run; the report names every gap and spike | K1 |
| **K3** | **`seed/10_prices.py`**, idempotent | Run three times, row count unchanged | K1, A0 |
| **K4** | ★ **`GET /prices/series`** | Pranay's home screen renders a real price | K3 |
| **K5** | **`GET /ref/*`** — districts, markets, commodities, warehouses | The dropdowns in S3 populate | K3 |
| **K6** | ★★ **`GET /prices/nearby`** — gross, transport, commission, **net**, sorted by net | **At least one case where net-order ≠ gross-order** | K4 |
| **K7** | ★ **`GET /meta/data-provenance`** | Output matches `select source, count(*) from price_obs group by 1` exactly | K3 |
| **K8** | ★ **nginx + EC2 provisioning + swap file** | `curl <host>/api/v1/meta/health` from outside | K0 |
| **K9** | ★★ **H28 deploy rehearsal** — full deploy + `smoke.sh` **against EC2** | Green from the EC2 host, not localhost | K8, A12 |
| **K10** | **Fallback rung 2 tested** — laptop compose + phone hotspot | The app worked over a hotspot, once, for real | K9 |
| **K11** | **Second deploy at H34** | Green again, from a cold box | K9 |

> **After K7 (≈H14), Kartik's default is backend support.** Ask Akash which of A11 / A13 / A14 to take, move it in this table, and say so in chat.

### NIKHIL — forecasting — N0–N7

| ID | Task | Done when | Blocked by |
|---|---|---|---|
| **N0** | **Env + `features.py`** — Python 3.11 venv, feature builder with **every rolling window shifted** | `build_features()` runs on Kartik's CSV; no unshifted window in the file | K1 *(CSV is enough — the DB can come later)* |
| **N1** | **`train.py`** — 3 quantile models × 14 horizons | 42 artefacts written, script exits 0 | N0 |
| **N2** | ★★ **`quantile.py`** → 14 triples, **sorted**, integer paise | `p10 <= p50 <= p90` asserted on every horizon | N1 |
| **N3** | **`baseline.py`** — seasonal-naive lag-7 | MAE of the baseline computed over the same folds | N0 |
| **N4** | ★★ **`backtest.py`** — expanding-window walk-forward, MASE + coverage | Both numbers printed **and** inserted into `model_runs` | N2, N3 |
| **N5** | **Load once at startup** | `/meta/health` → `model_loaded: true`; no per-request load | N2, A0 |
| **N6** | **Model card content** — limitations in plain language | Nilesh's `/ai/model-card` returns your measured numbers, not placeholders | N4 |
| **N7** | ★ **Commit the pickles** | Kartik can deploy without training on the box | N1 |

> **Nikhil's first hour, before K1 lands:** set up the 3.11 venv, install LightGBM, and write `features.py` against a **hand-made 20-row CSV** with the columns from CANON §6 `price_obs`. Do not sit waiting for Kartik.

### NILESH — decision engine — L0–L9

| ID | Task | Done when | Blocked by |
|---|---|---|---|
| **L0** | **`config.py` + `costs.py`** — thresholds, the cost stack | **Six** cost lines sum to `total_paise_per_qtl`, integer, `//` only | *(hardcode the cost table first)* |
| **L1** | ★★ **`decide()` against the stub** + the eight tests | `pytest` green on all 8 + the 3 invariant tests | **nothing — use the stub** |
| **L2** | ★ **All five actions reachable** | Each of the 5 produced by a real seeded input | L1 |
| **L3** | ★★ **NO_ADVICE with all four reasons** | Each reason returned by its own condition, tested | L1 |
| **L4** | **`pledge.py`** — indicative quote, **`None` when not worthwhile** | Interest ≥ gain → `None`, and Pranay's card vanishes | L1 |
| **L5** | ★★ **`POST /ai/window/recommend`** + persist a `recommendations` row | Pranay's S9 renders from the live endpoint | L1, N2, A0 |
| **L6** | **`GET /ai/forecast` + `/ai/model-card`** | Card shows Nikhil's **measured** MASE + coverage from `model_runs` | N4 |
| **L7** | ★★ **Never 500** — delete the pickle, endpoint still 200s | `mv` the pickle away, call it, get a refusal | L5 |
| **L8** | **Rehearse questions 4 and 9** | Two sentences each, out loud, without notes | H33 |
| **L9** | **NEW — `explain_hi`** + assistant intents | The window response carries all three explanations; assistant answers 8 canned intents in 3 languages | L5, SH9 |

### PRANAY — farmer app — P0–P16

| ID | Task | Done when | Blocked by |
|---|---|---|---|
| **P0** | ★★ **Scaffold** — **RN CLI** app, TS strict, navigation, `lib/api.ts`, `lib/money.ts` + tests, four-state pattern, fixtures, **cleartext config (12_STACK §7.3)** | `npx react-native run-android` opens; `formatPaise(629000,'mr') === '₹६,२९०'` passes | **nothing** |
| **P1** | **S1–S3** language picker, phone/OTP, profile | Can log in on a real phone and land on S4 | A1 *(fixture)* |
| **P2** | ★ **S4 Home** — today's price, source badge, one big CTA | Renders from `/prices/series`; badge shows the real source | K4 *(fixture)* |
| **P3** | ★★ **S9 Verdict card** against the fixture, then the live endpoint | Matches PRANAY.md §1.6 layout exactly | *(fixture)*, then L5 |
| **P4** | ★★ **I16 — worst case at the SAME font size as expected gain** | Screenshot measured: both 20 sp | P3 |
| **P5** | ★ **S10 Cost breakdown** — six lines + total, expandable | The six lines sum to the displayed total, verified by hand | P3 |
| **P6** | ★★ **S5 history + S7 forecast fan** with a shaded p10–p90 band | **No point line renders without its band** | K4, N2 *(fixture)* |
| **P7** | ★★ **S6 nearby mandis** — gross, transport, **net**, ordered by net | The gross-vs-net reordering is visible to the eye | K6 *(fixture)* |
| **P8** | ★★ **Empty + loading + error on every screen** | API stopped → nothing shows a white screen | all of the above |
| **P9** | **S12 lots + S13 self-assay** — 6 questions → grade + tip | Grade renders; tip names the weakest dimension | A5, A6 |
| **P10** | ★ **S14 offers + counter — with the forecast above the input** | The forecast band is visibly above the counter-price box | A8 |
| **P11** | ★ **Offline** — `useOfflineQuery` + the stale banner on S4 and S9 | Airplane mode: both screens render with a timestamp | P2, P3 |
| **P12** | **S8 model card, S11 pledge card, S15 escrow timeline** | S11 is **absent** when the server returns no pledge (I13) | L4, L6 |
| **P13** | ★★ Wire Shreya's `lib/voice.ts` into S9's 🔊 button | ₹6,290 plays in Marathi **in airplane mode** | **SH3** |
| **P14** | ★★ **Demo rehearsal** — drive the golden path three times | Beats 1–11 without looking at notes | H33 |
| **P15** | **NEW — S26 chat + call button** | Farmer messages a buyer; call opens the dialer; number never rendered | A14, SH0 |
| **P16** | **NEW — S16 assistant** — tri-lingual Q&A over canned intents | Eight questions answered in the active locale | L9, SH9 |

### SHREYA — buyer, language, voice, pitch — SH0–SH10

| ID | Task | Done when | Blocked by |
|---|---|---|---|
| **SH0** | ★★ **`components/ui/` — six components + `i18n.tsx`** | Pranay imports `<Card>` and `<Button>` and deletes his local copies | **nothing** |
| **SH1** | ★★ **`mr.json` + `en.json`** for every farmer screen, Devanagari numerals | Zero bare English strings on any farmer screen | Pranay's key requests |
| **SH2** | ★ **`scripts/gen_tts.py`** — ~40 phrases + 0–99 + hundreds + units | Clips generated **and committed** under `app/assets/audio/` | **nothing** |
| **SH3** | ★★ **`lib/voice.ts`** — decompose + sequence + **`react-native-tts`** fallback | ₹6,290 speaks correctly from clips | SH2 |
| **SH4** | ★★ **Airplane-mode test on a real phone, at H20** | 🔊 works with no network, worst case included | SH3, P3 |
| **SH5** | **S17 login + S18 post demand** | A buyer logs in and posts a 100 qtl demand | A1, A7 *(fixture)* |
| **SH6** | ★ **S19 matches incl. COMBINATION + S21 offer/counter** | A 100 qtl demand shows a 3-lot bundle; a counter round-trips | A7, A8 *(fixture)* |
| **SH7** | ★★ **S24 provenance** | Renders `/meta/data-provenance` verbatim, source URL tappable | K7 *(fixture)* |
| **SH8** | ★★ **Deck (9 slides) + narration + H32 recording** | Three full rehearsals done; recording on two devices | H32 |
| **SH9** | **NEW — `hi.json`** — Hindi as a third locale | Language picker shows मराठी / हिंदी / English; all three complete | SH1 |
| **SH10** | **NEW — S27 buyer chat** | Buyer replies to a farmer; thread renders on both sides | A14, P15 |

---

## 4. The dependency graph — what actually blocks what

```
   H0 ─── SEVEN TASKS START WITH ZERO DEPENDENCIES ───────────────────────────

   A0 ──┬─► A1 ─┬─► A2
        │       └─► A3 ─┬─► A4
        │               └─► A7 ─► A8 ─┬─► A9 ─┬─► A10 ─► A12 ★★ smoke
        │                             │       ├─► A11
        │                             │       └─► A13
        │                             └─► A14 (chat) ─► P15, SH10
        └─► A5 ─► A6 ─► P9

   K0 ──► K8 ──► K9 ★★ deploy ──► K10, K11
   K1 ──┬─► K2
        ├─► K3 ─┬─► K4 ─► K6 ★★ ──► P7
        │       ├─► K5
        │       └─► K7 ──► SH7
        └─► N0 ─┬─► N1 ─┬─► N2 ★★ ─┬─► N5
                │       └─► N7      └─► L5
                └─► N3 ─► N4 ─► N6 ─► L6

   L0                                    ← independent
   L1 ★★ (uses the STUB) ─┬─► L2
                          ├─► L3 ★★ refusal
                          ├─► L4 ─► P12
                          └─► L5 ★★ ─┬─► L7 ★★
                                     └─► L9 ─► P16

   P0 ──┬─► P1, P2, P3 ★★ ─┬─► P4 ★★ (I16)
        │                  ├─► P5
        │                  └─► P11
        ├─► P6 ★★ (the band)
        ├─► P7 ★★ (net ordering)
        └─► P8 ★★ (four states, every screen)

   SH0 ★★ ──► EVERY SCREEN Pranay and Shreya build
   SH2 ──► SH3 ★★ ──► SH4 ★★ (H20) ──► P13 ★★
   SH1 ──► SH9 ──► P16
```

### The five real bottlenecks — everything else has a fixture

| # | Bottleneck | Who waits | Deadline | If it slips |
|---|---|---|---|---|
| **1** | **K1 — real Agmarknet data** | Nikhil, and the honesty of every number | **H4 GATE** | Rung down the acquisition ladder (KARTIK.md §1.4). Do not let it slip past H4 silently. |
| **2** | **SH0 — the six UI components** | Pranay, on every screen | **H3** | Pranay hand-rolls a Button and throws it away later. Recoverable, but wasteful. |
| **3** | **A0–A3 — skeleton, auth, lots** | Four people | **H8** | Everyone stays on fixtures. Recoverable to ~H14; past that, integration compresses. |
| **4** | **N2 — sorted quantile triples** | Nilesh, then Pranay's fan | **H12** | Nilesh's stub covers it. The risk is the *demo claim*, not the code. |
| **5** | **K9 — the H28 deploy rehearsal** | Everyone | **H28** | Fall back to laptop + hotspot (K10). **This is why K10 exists — test it before you need it.** |

**Note what is not on that list: Nilesh.** L1, L2, L3, L4 — the decision engine, all five actions, all four refusal reasons, the pledge — are buildable at hour zero against a three-line stub. That is the single largest block of demo-critical work with no upstream dependency in the project.

---

## 5. ★ Hour zero — what all six of you start right now

**These seven tasks have no dependencies. Six people, all working, minute one.**

| Person | Start with | First commit should be |
|---|---|---|
| **Akash** | **A0** | `curl localhost:8000/api/v1/meta/health` → 200 |
| **Kartik** | **K0**, then **K1** immediately | `docker compose up -d` works; then the H4 data gate |
| **Nikhil** | **N0** | 3.11 venv + LightGBM installed + `features.py` on a hand-made 20-row CSV |
| **Nilesh** | **L1** (with the stub) + **L0** | `pytest api/tests/test_decide.py` green on 8 tests |
| **Pranay** | **P0** | `run-android` opens; `formatPaise` tests pass; cleartext config in place |
| **Shreya** | **SH0**, then **SH2** | Six components exported; Pranay can import `<Card>` |

**Before anything else, two people should start a long download:**
- Pranay + Shreya: **Android Studio + SDK + JDK 17.** 15–30 minutes on a cold machine. Start it, then read while it runs.
- Everyone on `api/`: `uv venv --python 3.11` and `uv pip install lightgbm` — the LightGBM wheel is not small.

---

## 6. Hour by hour

| Hours | Akash | Kartik | Nikhil | Nilesh | Pranay | Shreya |
|---|---|---|---|---|---|---|
| **H0–H4** | A0, A1 | **K0, K1 ★ GATE** | N0 | L0, **L1** | **P0** | **SH0** |
| **H4–H8** | A2, **A3** | K2, K3 | N1 | L2, **L3** | P1, P2 | SH1, SH2 |
| **H8–H12** | A5, A6, **A7** | **K4**, K5 | **N2**, N3 | L4, **L5** | **P3, P4** | **SH3** |
| **H12–H16** | **A8** | **K6**, **K7** | N4, N7 | **L7**, L6 | P5, **P6** | SH5, SH9 |
| **H16–H20** | **A9**, A10 | **K8** → *support* | N5, N6 | L9 | **P7**, P8 | **SH4 ★ H20** |
| **H20–H24** | A11, A13 | *support* (A11/A13/A14) | *support Nilesh* | *integration* | P9, **P10** | **SH6** |
| **H24–H28** | **A12 ★**, A14 | **K9 ★ deploy** | — | — | P11, P12, **P13** | **SH7** |
| **H28–H30** | ★★ **FEATURE FREEZE — nothing new after H30** | | | | | |
| **H30–H32** | integration | K10 | — | — | P15, P16 *(if time)* | SH10 *(if time)* |
| **H32–H34** | bug fix only | **K11** | — | — | **P14 rehearsal** | **SH8 recording ★** |
| **H34–H36** | ★★ **THREE FULL REHEARSALS. NO CODE.** | | | | | |

### The four gates — miss one and say so in chat immediately

| Gate | Hour | Test | Miss it → |
|---|---|---|---|
| **DATA** | **H4** | `select count(*) from price_obs` ≥ 1000, every row has `source_url` | Drop a rung on the acquisition ladder. **Announce it.** |
| **HERO** | **H14** | `POST /ai/window/recommend` returns a real verdict from real data | Stay on the fixture; L5 becomes the top priority for everyone |
| **VOICE** | **H20** | Airplane mode, real phone, 🔊 speaks ₹6,290 in Marathi | Sixteen hours to fix. **This is why it is at H20 and not H34.** |
| **DEPLOY** | **H28** | `smoke.sh` green against the EC2 box | Fall back to K10 (laptop + hotspot) and rehearse *that* |

---

## 7. What "done" means — the same six checks for everyone

From `CLAUDE.md` §8. A task is done when **all six** hold, not four:

1. Works against **seeded** data, **no live external network call** (I7).
2. Invalid input → coded **400**, never a 500.
3. Another actor's ID → **404**, tested by hand (I4).
4. Money is integer paise the whole way. You have grepped your own diff for `float`, `parseFloat`, `/ 100`, `toFixed`.
5. **Loading, empty, error and data all render.** A happy path is not a screen.
6. Marathi exists for anything a farmer sees.
7. Committed **and pushed**.

---

## 8. The new scope — chat, call, Hindi, assistant

Added 2026-09-05. **These were not in the original plan.** Here is what they cost, honestly, so the team can decide what to cut when H30 arrives.

| Feature | Tasks | Cost | Verdict |
|---|---|---|---|
| **Call button** | inside **P15** | **~30 min.** `Linking.openURL('tel:…')` plus a server endpoint that logs the *event* and returns the number without ever logging it (I14). | **Build it.** Highest ratio of demo value to cost on this page. |
| **Hindi** | **SH9** | **~3 h.** One more JSON file, one more picker option, one more `explain_hi` on the server. **No Hindi voice clips** — the clip set is Marathi-only and tripling it is not affordable. | **Build it, text only.** Say plainly that voice is Marathi in Phase 1. |
| **Farmer ↔ buyer chat** | **A14 · P15 · SH10** | **~6 h across three people.** Two screens, four endpoints, 4-second polling (12_STACK §3.3). No websockets. | **Build it if A9 lands by H20.** Otherwise cut — it is not on the golden path. |
| **Tri-lingual assistant** | **L9 · P16** | **~5 h.** Eight canned intents, answered from data the app already has, in the active locale. **Not an LLM** — a routed FAQ over real numbers. | **Cut first if anything slips.** |

### On the assistant, so nobody oversells it

**It is not a language model and we will not call it one.** It maps eight questions to answers computed from data already on screen:

> *"मी का थांबावं?"* → the same `explain_mr` the verdict card shows.
> *"खर्च किती?"* → the six cost lines from the same response.

That is honest, it works offline, and it cannot hallucinate a price. **If someone on stage calls it "an AI agent," a judge will ask which model, and the true answer — "it is a deterministic router over our own decision engine" — is a better answer than any model name.** Say the true thing first.

### The cut order, decided now and not at H30

When time runs out — and it will — cut in this order, top first:

1. **P16 / L9** — the assistant
2. **SH10** — buyer-side chat (keep the farmer side read-only if half-built)
3. **A13** — disputes
4. **A11** — pools / FPO split
5. **P12** — model card screen (keep the pledge card; I13 is a demo beat)

**Never cut:** P3, P4 (I16), P6 (the band), P7 (net ordering), L3 (refusal), L7 (never 500), A3 (the 404), A12 (smoke), K9 (deploy), SH4 (offline voice), SH7 (provenance), SH8 (the recording).

---

## 9. Where the numbers on the slides come from

| Claim | Task that produces it | If that task slips |
|---|---|---|
| *"We forecast better than a seasonal-naive baseline"* | **N4** — MASE from the backtest | **The claim comes off the slide.** No measured number, no claim. |
| *"Our intervals are calibrated"* | **N4** — p10–p90 coverage | Same. |
| *"₹6,290 expected gain"* | **L5** on real data | Say "on our seeded Nashik series" and show S24. |
| *"Zero external calls during the demo"* | **I7**, provable by airplane mode | It is provable. Prove it, on stage, at beat 7. |
| *"Every row has a source"* | **K1 + K7**, visible on S24 | If SYNTHETIC is non-zero, **S24 shows that number**. That is the point of S24. |

**An unverified number on a slide is the fastest way to lose a panel.** No source on the same slide → the number comes off the slide.

---

## 10. The four sentences that decide this

1. **Nobody waits for a person. Everyone waits for a contract, and the contract is `00_CANON.md` §7.**
2. **A blocker nobody declared is the most expensive object in this repository.** `docs/BLOCKERS.md` + chat, both, within 30 minutes.
3. **Nothing new after H30.** The last six hours are integration, deploy, and three rehearsals.
4. **The refusal is the product.** Everything else is engineering.
