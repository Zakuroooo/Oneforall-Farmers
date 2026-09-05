# 03 — TASK ASSIGNMENT: The 36-Hour Schedule, By Name

> **Read `00_CANON.md` §11 for the ownership map. This file is the clock.**
> H0 = the moment you all sit down. Times are hours-from-start, not wall-clock.

---

## 1. The six people

| Name | Lane | Owns | Must not miss |
|---|---|---|---|
| **Akash** | **Backend primary** | `core/`, `models/`, `alembic/`, routers `auth lots demands offers tx disputes pools`, domain `escrow matching grading split` | **Actor-scoped reads (I4)** and the **escrow FSM (I11)**. If a judge fetches another farmer's lot and gets data, nothing else you built matters. |
| **Kartik** | **Data + DevOps + backend #2** | `ingest/`, `seed/`, `infra/`, `nginx/`, routers `ref prices meta`, the provenance screen's data | **Real price data in Postgres by H4** and **a deploy rehearsed at H28.** You are the only person who can make the data claim true. |
| **Nikhil** | **ML — forecasting** | `api/app/ml/**` | **p10/p50/p90, never a point prediction.** And the **model card numbers must be measured**, not asserted — MASE vs seasonal-naive and empirical coverage. |
| **Nilesh** | **ML — decision engine** | `domain/window.py costs.py pledge.py`, router `ai.py`, `schemas/ai.py` | **The verdict endpoint.** It must never 500 and it must be able to say **NO_ADVICE (I6)**. The pledge card must not render when it isn't worthwhile **(I13)**. |
| **Pranay** | **Frontend — farmer** | `screens/farmer/**`, `components/farmer/**`, `components/charts/**`, `navigation/`, `lib/api.ts`, `lib/money.ts` | **The verdict screen (S9)** with **worst case at equal font size (F8)**, and the **offline banner (A4)**. |
| **Shreya** | **Frontend — buyer + i18n + voice** | `screens/buyer/**`, `screens/shared/**`, `components/ui/**`, `components/buyer/**`, `i18n/`, `context/`, `lib/voice.ts`, `assets/audio/**` | **Zero English on any farmer screen** in Marathi mode, and **voice that works in airplane mode (A2)**. |

> **If Shreya is not on the team:** cut buyer to 3 read-only screens (login, matches, offer thread), Pranay absorbs `i18n/` and `components/ui/`, voice-**in** (A3) drops, voice-**out** (A2) stays because it is a demo beat. Say this at H0, not H20.

---

## 2. The clock at a glance

```
H0 ─── H2      ALL SIX TOGETHER. Contract lockdown. Nobody codes alone yet.
H2 ─── H4      Skeletons. Everyone's tree compiles and runs empty.
       H4      ★ HARD GATE: real price data in Postgres, or drop to rung 3.
H4 ─── H12     Core build. Each lane in its own files.
      H12      ★ INTEGRATION STITCH #1. Real forecast replaces stubs.
H12 ─ H14      TTS generation + verdict screen against the real endpoint.
H14 ─ H20      ★ STAGGERED SLEEP. Two awake at a time. Mandatory.
H20 ─ H28      Differentiators: counter-offer, NO_ADVICE tuning, pledge, provenance.
      H28      ★ DEPLOY REHEARSAL. Full sequence on EC2. Not the first attempt at H33.
H28 ─ H30      Cheap high-value items only. Empty states. Error states.
      H30      ★★ HARD FEATURE FREEZE. Nothing new. Nothing.
H30 ─ H33      Three golden-path runs on the deployed build. Fix only what breaks.
      H32      ★ RECORD THE FALLBACK VIDEO. Before fatigue. Non-negotiable.
H33 ─ H36      Deck + three timed rehearsals.
```

---

## 3. H0–H2 · Contract lockdown — all six in one room

**Nobody writes feature code in these two hours.** This is the two hours that saves eight later.

| Who | Task |
|---|---|
| **all** | Read `00_CANON.md` end to end, out loud if needed. Every person says the invariant list back. |
| **all** | Close the 7 open decisions in `01_PRD.md` §11. Write the answers into the doc. |
| **Akash** | `alembic init`, write **all 24 tables** from CANON §6 in one migration. `alembic upgrade head` succeeds. |
| **Akash** | `app/core/errors.py` + the exception handler + `AppError`. Everyone depends on this. |
| **Kartik** | `docker-compose.yml` up, Postgres reachable, `.env.example` committed, repo pushed, everyone can clone and run |
| **Kartik** | Hit Agmarknet / data.gov.in **now**. Find out in hour 1 whether the data exists, not hour 9. |
| **Nikhil** | `requirements.txt` pinned, `uv venv --python 3.11`, LightGBM imports. **Verify 3.11, not 3.14.** |
| **Nilesh** | `schemas/ai.py` — the full `WindowRes` Pydantic model from CANON §7.4, returning **hardcoded values**. |
| **Pranay** | `npx @react-native-community/cli init MandiSetu`, TypeScript strict, React Navigation, one screen renders on a real Android device over USB |
| **Shreya** | `i18n/mr.json` + `hi.json` + `en.json` with the **~60 keys the verdict and home screens need**. Locale context works. |

**H2 exit criteria — all four, or you do not proceed:**
1. `alembic upgrade head` creates 24 tables on a clean DB.
2. `GET /api/v1/ai/window/recommend` returns a **hardcoded but contract-shaped** `WindowRes`.
3. The RN app runs on a real Android device and shows Marathi text.
4. Everyone has pushed a branch and can pull everyone else's.

> **The point of the hardcoded verdict at H2:** Pranay builds the entire hero screen against it starting at H2 instead of H12. That single decision removes the longest serial dependency in the project.

---

## 4. H2–H4 · Skeletons

| Who | Task | Done when |
|---|---|---|
| **Akash** | `core/db.py`, `core/security.py` (JWT, bcrypt, OTP hash), `core/deps.py` (`current_user`, `require_role`, **`guard()`**) | `guard()` returns 404 for a foreign row in a unit test |
| **Kartik** | `ingest/sources/agmarknet.py` — first successful fetch of **any** real series, saved to `snapshots/` | one CSV on disk with real prices |
| **Kartik** | `seed/00_reference.py` — 8 districts, 12 markets, 4 commodities, cost table, 6 warehouses | `select count(*) from markets` = 12 |
| **Nikhil** | `ml/features.py` — lag/rolling/calendar feature builder over a DataFrame | unit-tested on a fake 300-row series |
| **Nilesh** | `domain/costs.py` — `CostBreakdown` from `cost_tables` + spoilage + storage, **all integer paise** | `pytest`: five lines sum to total, exactly |
| **Pranay** | `lib/api.ts` (typed fetch + error envelope), `lib/money.ts` (`formatPaise`, Devanagari digits), navigation shell | `formatPaise(629000,'mr')` → `"₹६,२९०"` |
| **Shreya** | `components/ui/` — Button, Card, Badge, Empty, Skeleton, ErrorState | all six render in a scratch screen |

### ★ H4 · THE DATA GATE

**Kartik reports one of two things, out loud, to everyone:**

- ✅ *"Real Agmarknet/data.gov.in series in `snapshots/`, N rows, date range X–Y."* → proceed.
- ❌ *"Not working."* → **immediately drop to rung 3** of the ladder in `04_DATA_ARCHITECTURE.md` (archived CSV mirror, every row labelled `source='ARCHIVE'` with the mirror's URL in `source_url`). **Do not spend hour 9 fighting a scraper.**

> Rung 3 is still real observed market data with honest provenance. It is *not* synthetic. The only unacceptable outcome is arriving at H20 with no data and no decision.

---

## 5. H4–H12 · Core build

### Akash — auth, lots, grading
| # | Task | Done when |
|---|---|---|
| A1 | `POST /auth/otp/request` + `/verify` + `/register` + `GET /me` | curl end-to-end gets a JWT; wrong OTP and unknown phone return **identical** errors |
| A2 | Rate limit 3/phone/10min, 5 attempts max, **no phone or OTP in any log** (I14) | 4th request → 429 |
| A3 | `POST /lots`, `GET /lots`, `GET /lots/{id}` **through `guard()`** | **curl with farmer A's token for farmer B's lot → 404.** Test this by hand. |
| A4 | `POST /lots/{id}/photo` — multipart, **strip EXIF GPS**, write to `MEDIA_ROOT` | uploaded file has no GPS tags |
| A5 | `domain/grading.py` — the 6-question deterministic score, grade, `weakest_dimension` | `pytest`: known inputs → known score; boundary 750/500 correct |
| A6 | `POST /lots/{id}/assay` → grade + tip | returns `tip_mr` naming the weakest dimension |

### Kartik — data pipeline
| # | Task | Done when |
|---|---|---|
| K1 | Ingest **2 commodities × 3 markets × ≥180 days** | `select count(*) from price_obs` ≥ 1000, all with `source` + `source_url` |
| K2 | `ingest/validate.py` + `report_<crop>.md` — gaps, dupes, outliers, modal-within-min-max | report exists and is committed |
| K3 | `seed/10_prices.py` loads snapshots → `price_obs` idempotently | re-running does not duplicate |
| K4 | `GET /prices/series` | 180 real points + `source_summary` |
| K5 | `GET /ref/*` — districts, markets, commodities, warehouses, logistics | all five return seeded rows |
| K6 | **★ `GET /prices/nearby`** — gross, transport, commission, **net**, sorted by net | **at least one case where net-order ≠ gross-order.** That inversion is the feature. |
| K7 | `GET /meta/data-provenance` — counts by source, date ranges, source URLs | matches `select source, count(*) from price_obs group by 1` exactly |

### Nikhil — the forecast
| # | Task | Done when |
|---|---|---|
| N1 | `ml/train.py` — 3 LightGBM models, `objective='quantile'`, α ∈ {0.1, 0.5, 0.9} | `artifacts/model_onion.pkl` exists |
| N2 | `ml/quantile.py` — `predict_quantiles(commodity, market, as_of, horizon)` → 14 triples | **p10 ≤ p50 ≤ p90 always.** Sort if the models cross — they will occasionally. |
| N3 | **★ `ml/backtest.py`** — expanding-window walk-forward, **MASE vs seasonal-naive (lag-7)** and **empirical p10–p90 coverage** | both numbers printed and inserted into `model_runs` |
| N4 | Model loads **once at FastAPI startup**, held in memory | `/meta/health` reports `model_loaded: true` |
| N5 | Commit the pickles | `git ls-files app/ml/artifacts` non-empty |

> **N3 is not optional and it is not a nice-to-have.** MASE and coverage *are* the model card, and the model card is the difference between "we trained a model" and "we measured a model." Every team says the first. Almost none say the second.

### Nilesh — the decision engine
| # | Task | Done when |
|---|---|---|
| L1 | `domain/window.py` — **the full decide() from `02_TRD` §4 step 8**, against a **stubbed** `predict_quantiles` | `pytest` 8 cases from `02_TRD` §12 all green |
| L2 | All five actions reachable: SELL_NOW, SELL_ELSEWHERE, HOLD, SPLIT, NO_ADVICE | one test per action |
| L3 | **★ NO_ADVICE** on `band_width_bps > NO_ADVICE_BAND_BPS`, with `refusal_reason` | wide-band fixture → `NO_ADVICE` / `BAND_TOO_WIDE` |
| L4 | `domain/pledge.py` — loan, interest, `is_worthwhile`; **returns None when not worthwhile (I13)** | `pytest`: unworthy case → `None`, not a card |
| L5 | `POST /ai/window/recommend` wired, persists a `recommendations` row | curl returns the full contract shape |
| L6 | `GET /ai/forecast` + `GET /ai/model-card` passthrough | both return real JSON |
| L7 | **Never 500** — wrap the model call, degrade to `NO_ADVICE` | kill the pickle, endpoint still 200s with a refusal |

### Pranay — the farmer app
| # | Task | Done when |
|---|---|---|
| P1 | S1–S3 language picker, phone/OTP, profile | can log in on a real phone |
| P2 | **S4 Home** — today's price, source badge, the one big CTA | renders from `/prices/series` |
| P3 | **S9 Verdict card** against **Nilesh's H2 hardcoded response** | matches the `01_PRD` §6 layout |
| P4 | **★ Worst case at the SAME font size as the expected gain (I16)** | measure it; 20 sp both, not 20 and 14 |
| P5 | **S10 Cost breakdown** — five lines + total, expandable | lines sum to the displayed total |
| P6 | **S5 history chart** + **S7 forecast fan** with a shaded p10–p90 band | **no point line without the band** |
| P7 | **S6 nearby mandis** — gross, transport, **net**, ordered by net | the reordering is visible to the eye |
| P8 | Empty + loading + error state on **every** screen | turn off the API — nothing shows a white screen |

### Shreya — i18n, UI, buyer shell
| # | Task | Done when |
|---|---|---|
| S1 | `i18n/mr.json` complete for **every farmer screen**, Devanagari numerals | **grep any farmer screen for a bare English string → zero hits** |
| S2 | `components/ui/*` finished and used by Pranay | Pranay imports, never re-implements |
| S3 | S17 buyer login, S18 post demand | buyer can create a demand |
| S4 | **★ `scripts/gen_tts.py`** — ~40 phrases + digit clips → `assets/audio/mr/` | mp3s committed |
| S5 | `lib/voice.ts` — number decomposition + `react-native-sound` sequencing + `react-native-tts` fallback | ₹6,290 plays correctly **in airplane mode** |
| S6 | **S24 provenance screen** from `/meta/data-provenance` | matches the DB |

---

## 6. ★ H12 · INTEGRATION STITCH #1 — 60 minutes, everyone at one table

Nobody starts a new task. One goal: **the real chain works once, end to end.**

| Step | Who | Check |
|---|---|---|
| 1 | Nikhil → Nilesh | Real `predict_quantiles` replaces the stub in `window.py`. One import line. |
| 2 | Nilesh | Real verdict from real data on real onion. **Read the numbers out loud.** Do they make sense? |
| 3 | Kartik + Nilesh | Cost table values are realistic — transport Nashik→Pune is not ₹5/qtl |
| 4 | Pranay | Verdict screen swaps from hardcoded to live. **Nothing should visibly change.** That is the win. |
| 5 | Shreya | Voice reads the live rupee amount correctly |
| 6 | Akash | `scripts/smoke.sh` curls every endpoint. Non-zero exit = fix before sleeping. |
| 7 | all | **Does NO_ADVICE fire on real onion data?** If not, Nikhil + Nilesh tune the threshold at H14 — the threshold, never a data row. |

**If the chain does not work at H13, stop everything and fix it.** A broken chain at H13 becomes a broken product at H30.

---

## 7. H12–H14 · TTS + real verdict

| Who | Task |
|---|---|
| **Shreya** | Run `gen_tts.py` for real. All clips generated and committed. This must happen **before** sleep — the Sarvam call is the last external network dependency in the project and it needs to be finished. |
| **Pranay** | Verdict screen polished against real numbers. Long-Marathi-string overflow fixed. |
| **Nikhil + Nilesh** | Tune `NO_ADVICE_BAND_BPS` once against real onion. Write the chosen value in `.env.example` and in the model card. **Then freeze it.** |
| **Akash** | `POST /demands`, `GET /demands`, `GET /demands/{id}/matches` incl. `COMBINATION` |
| **Kartik** | `seed/20_demo_story.py` — the 11-beat demo rows: 3 farmers, 2 buyers, 1 FPO pool with a **correct** grade-weighted split |

---

## 8. ★ H14–H20 · STAGGERED SLEEP — mandatory

**Two people awake, four asleep. Rotate at H17.**

| Window | Awake | Their job |
|---|---|---|
| H14–H17 | **Akash + Pranay** | Offers, counter-offer endpoint; farmer offer screens |
| H17–H20 | **Kartik + Nilesh** | Deploy prep; pledge endpoint + tests |
| H14–H20 | **Nikhil, Shreya sleep first**, then swap | — |

> This is in the schedule because it is a **deliverable**, not a luxury. The pitch is at H36. A team that has been awake 36 hours pitches badly, and the pitch is what is scored. Six exhausted people at H34 lose to five rested people. Protect this block.

---

## 9. H20–H28 · Differentiators

| Who | Task | Priority |
|---|---|---|
| **Akash** | **★★ `POST /offers/{id}/counter`** — round cap 3, thread endpoint, `409 MAX_ROUNDS` | **P0** |
| **Akash** | `POST /offers/{id}/accept` → `transactions` row | P0 |
| **Akash** | **Escrow FSM + `/tx/{id}/transition` + `/events`**, actor matrix, idempotency | **P0** |
| **Akash** | Disputes — raise, evidence, stages | P1 · **hand to Kartik if behind** |
| **Kartik** | **★ Deploy to EC2. Full sequence. Rehearsed.** | **P0 — do this by H28** |
| **Kartik** | Buyer reliability seed data incl. **renegotiation rate** | P1 |
| **Nikhil** | **Model card endpoint + backtest numbers final** | **P0** |
| **Nikhil** | Second commodity trained | P1 |
| **Nilesh** | **★ Pledge endpoint wired to the verdict, `is_worthwhile` gate live** | **P0** |
| **Nilesh** | SELL_ELSEWHERE using `/prices/nearby` net values | P1 |
| **Pranay** | **★★ S14 counter screen with the forecast beside the input** | **P0 — this is the middleman-removal beat** |
| **Pranay** | **★ S11 pledge card** (renders only when worthwhile) | **P0** |
| **Pranay** | **★ A4 offline last-known + timestamp banner** | **P0 — the airplane-mode moment** |
| **Pranay** | S13 assay flow, S16 FPO split read-only | P1 |
| **Shreya** | S19 matches incl. combination rows with `why_*` | P0 |
| **Shreya** | S21 offer thread both directions | P0 |
| **Shreya** | S22 tx timeline, S25 dispute, S23 lot detail | P1 |
| **Shreya** | **Marathi sweep — every screen, `locale='mr'`, zero English** | **P0** |

### ★ H28 · DEPLOY REHEARSAL

Kartik runs the **full** sequence on EC2 while everyone watches:
```bash
git pull && docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python -m seed.run_all
bash scripts/smoke.sh
```
Then **one person opens the app on a phone over wifi and completes the golden path.**

If this fails at H28 you have 2 hours to fix it. If you first try it at H33 you have zero.

---

## 10. H28–H30 · Cheap and high-value only

Nothing that takes more than 45 minutes.

| Who | Task |
|---|---|
| **all** | Empty + loading + error state audit. **Turn off the API and click every screen.** A white screen in the demo is fatal and takes 10 minutes to fix. |
| **Pranay** | Long-Marathi-string overflow, tiny-screen layout |
| **Shreya** | Last Marathi keys; voice on the verdict verified **in airplane mode** |
| **Nilesh** | Verdict `explain_mr` sentences read naturally out loud |
| **Kartik** | Provenance screen numbers match the DB exactly |
| **Akash** | `smoke.sh` green; **cross-actor 404 verified by hand one last time** |
| **Nikhil** | Model card numbers final and in the DB, not just printed |

### ★★ H30 · HARD FEATURE FREEZE

**Nothing new after this line. Not a small thing. Not a five-minute thing.** From H30 the only legal changes are: fixing something that breaks in a rehearsal run, and the deck.

Every hackathon post-mortem has the same sentence in it: *"we were still adding features at hour 34."* That team did not lose on features.

---

## 11. H30–H33 · Golden-path runs

**Three complete runs on the deployed build.** Different person driving each time.

The golden path:
```
Marathi → login → home (price + source badge) → history → forecast (fan) →
model card → VERDICT (HOLD +₹6,290, worst −₹4,800) → cost breakdown →
pledge card → 🔊 voice → AIRPLANE MODE → offline banner → voice again →
back online → create lot → assay → grade B + tip →
[buyer tab] post demand → matches incl. COMBINATION → offer ₹1,900 →
[farmer] counter ₹2,000 WITH FORECAST VISIBLE → [buyer] counter ₹1,960 →
accept → escrow timeline → FPO split → provenance screen →
[second crop] → NO_ADVICE refusal
```

Fix **only** what breaks. Resist every improvement.

### ★ H32 · RECORD THE FALLBACK VIDEO

Screen recording + voiceover of the full golden path. **Before fatigue. Before anything breaks.** If the EC2 box dies at H35, this is the demo. Every team that skipped this and needed it has the same story.

---

## 12. H33–H36 · Deck and rehearsal

| Who | Task |
|---|---|
| **Pranay** | Slides. **Every number has provenance or it comes off the slide.** |
| **Nikhil** | The model-card slide — MASE, coverage, baseline named, train window |
| **Nilesh** | The refusal slide — *why* refusing is the right engineering call |
| **Kartik** | The data-provenance slide — sources, row counts, date ranges, URLs |
| **Akash** | The architecture slide + the *"why not blockchain"* answer, one sentence |
| **Shreya** | The access slide — Marathi, voice, offline, low-literacy design |
| **all** | **Three timed rehearsals.** 7 minutes. Stopwatch. Whoever is over practises again. |

**Q&A prep — rehearse the actual sentences, don't improvise them:**

| Question | The answer |
|---|---|
| *"Is this real government data?"* | Sources, row counts, date range. Then open the provenance screen on the phone. |
| *"Did you rig the NO_ADVICE threshold?"* | "No — it's one number in config, and onion's real volatility triggers it. Here's soybean with the same threshold giving a confident HOLD." |
| *"Why not blockchain?"* | "Append-only table with FK integrity and an actor-stamped event log. The trust problem here is *who did what when*, not *who owns the ledger*. A chain would add cost and latency and solve nothing we have." |
| *"What if the forecast is wrong?"* | "Then the farmer loses money, which is why the worst case is the same font size as the expected gain, and why the model refuses when the band is too wide. Coverage is X% — measured, not claimed." |
| *"How is this different from Agmarknet or eNAM?"* | "They publish prices. We net out transport and commission, forecast a band, and tell him whether waiting pays — and then remove the reason he couldn't wait." |
| *"Is the pledge loan real?"* | "It's a simulation and labelled as one on every screen. The arithmetic is real; the lender integration is Phase 2. We won't put a lender's terms on a slide we haven't verified." |
| *"Scale?"* | One t3.small, ~20 concurrent. Then name the known work. Never invent a load number. |

---

## 13. Rules that apply the whole 36 hours

1. **Commit every 30 minutes. Push every hour.** An unpushed branch is work that does not exist.
2. **Never edit a file you do not own.** Blocker + local stub + keep moving. Not even a one-line fix.
3. **`docs/BLOCKERS.md` and the group chat. Both. Within 30 minutes.** An undeclared blocker is the most expensive object in this repo.
4. **Nobody merges a red `smoke.sh`.** A broken push blocks five people.
5. **Money is paise. Quantity is kg. Rates are bps.** Grep your own diff for `float`, `/ 100`, `round(`, `toFixed` before you push.
6. **Zero external network calls in the runtime path.** If you add one, you have broken the demo.
7. **Test the 404 by hand.** Not "the guard function exists" — actually curl farmer A's token against farmer B's lot.
8. **Say the number out loud before you believe it.** ₹6,290 on 40 quintals of onion is ₹157/qtl of gain. Is that plausible? If a number is absurd, the pipeline is wrong, and a judge will spot it faster than you will.

---

## 14. Per-person "if you only finish three things"

| Name | The three |
|---|---|
| **Akash** | 1. Auth + **actor-scoped 404s**. 2. **Escrow FSM** with the actor matrix. 3. **Counter-offer** with the 3-round cap. |
| **Kartik** | 1. **Real price data in Postgres by H4.** 2. **`/prices/nearby` net-of-transport reordering.** 3. **A deploy that works, rehearsed at H28.** |
| **Nikhil** | 1. **p10/p50/p90**, never a point. 2. **MASE + coverage, measured.** 3. Model loads at startup and never touches the network. |
| **Nilesh** | 1. **The verdict endpoint, which never 500s.** 2. **NO_ADVICE that fires on real data.** 3. **Pledge gated on `is_worthwhile`.** |
| **Pranay** | 1. **The verdict screen with worst case at equal weight.** 2. **Counter screen with the forecast beside the input.** 3. **Offline banner.** |
| **Shreya** | 1. **Zero English on farmer screens.** 2. **Voice that works in airplane mode.** 3. Buyer matches + offer thread. |

---

## 15. What each person says in the pitch

7 minutes. One beat each. Rehearse **your own sentences**, three times.

| Who | Their 45 seconds |
|---|---|
| **Pranay** | The problem — the ability to wait, not the information gap. Then the verdict screen, live, on a phone. |
| **Nilesh** | The decision: costs netted out, worst case shown, and the refusal. *"A wrong HOLD costs a farmer real money."* |
| **Nikhil** | The model card. MASE vs seasonal-naive, coverage %. *"We measured it, we didn't just train it."* |
| **Kartik** | Provenance — real sources, real row counts, and the net-of-transport reordering. |
| **Akash** | Trust rails — negotiation without a middleman, escrow FSM, append-only audit. And why not blockchain. |
| **Shreya** | Access — Marathi, voice, airplane mode. Then flip on airplane mode on stage and let it speak. |
