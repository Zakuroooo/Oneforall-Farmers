# 09 — PHASE 2

> **Phase 2 begins the day after the faculty pitch, and only if Phase 1's golden path runs end to end.**
> Nothing in this file is authorised before **H36**. If you are reading it during the 36 hours, you are reading the wrong document — go back to `03_TASK_ASSIGNMENT_36H.md`.

---

## 1. What Phase 2 is for

Phase 1 answers *"does the idea work and can this team build it?"* It is a **prototype**: real data, real forecast, real refusal, simulated money.

Phase 2 answers a different and harder question: **"would a farmer use this twice?"** That is not a features question. It is a trust question, and it has four parts:

| # | The question a farmer actually asks | What Phase 2 must ship |
|---|---|---|
| 1 | *"Did your advice make me money last time?"* | **★ Realisation tracking** — record what they actually sold for and score our own past verdicts |
| 2 | *"Will the buyer really pay?"* | **★ Real payment escrow** (Razorpay Route / RBI-compliant PA) |
| 3 | *"Is today's price today's?"* | **★ Live nightly ingestion**, not a committed snapshot |
| 4 | *"Can I ask it a question?"* | **Retrieval-grounded assistant with citations** |

**The single most important item in Phase 2 is #1**, and it is the one every team skips. A forecasting product that never grades its own past forecasts in front of the user is asking for trust it has not earned. It is also the cheapest possible credibility engine: after 60 days of use you can put a real number on stage — *"our HOLD recommendations beat sell-at-harvest by ₹X per quintal on average across N farmers"* — and that single sentence is worth more than every feature below it.

---

## 2. Scope — F20 onwards

Numbering continues from `01_PRD.md` (F1–F19, A1–A4).

### 2.1 P0 — Phase 2 does not ship without these

| ID | Feature | Owner | Why now |
|---|---|---|---|
| **F20** | **Realisation tracking + verdict scorecard.** Farmer records actual sale price; we compute `advice_was_right`, `realised_vs_advice_paise`, and show a rolling *"our advice record"* card. | Nilesh + Pranay | The trust flywheel. See §3. |
| **F21** | **Real escrow via a licensed PA** (Razorpay Route or equivalent). Funds held in an escrow-like split account, released on the same FSM. | Akash | Phase 1's escrow is a state machine over simulated money. This makes it real. See §4. |
| **F22** | **Nightly ingestion job** with retry/backoff, freshness monitoring, and a staleness alert. | Kartik | I7 relaxes here: live ingestion is a **background job**, still never a request-path network call. |
| **F23** | **Model retraining pipeline**, weekly, with automatic backtest gating — a model that fails MASE < 1.0 or coverage 70–90% **does not get promoted**. | Nikhil | A stale model degrades silently. This is the guard. |
| **F24** | **Push notifications** — "your HOLD window closes in 2 days", "a buyer matched your lot". | Shreya | Without this the farmer must remember to open the app. The waiting product needs to speak first. |
| **F25** | **SMS/IVR fallback** for feature-phone farmers: verdict as an SMS, price on a missed-call-back IVR. | Kartik + Shreya | Roughly half the target user base does not have a usable smartphone. See §6. |

### 2.2 P1 — ship if the P0 set lands

| ID | Feature | Owner | Note |
|---|---|---|---|
| **F26** | Weather features (IMD rainfall/temperature) in the model | Nikhil | Real accuracy lift on onion. New external dependency — must degrade to no-weather cleanly. |
| **F27** | **Conformal prediction intervals** replacing raw quantile bands | Nikhil | Gives a *calibrated* coverage guarantee instead of an empirically-measured one. See §5. |
| **F28** | Retrieval-grounded assistant with citations (MSP, scheme eligibility, mandi procedure) | Nilesh + Shreya | Upgrade from Phase 1's 30 fixed FAQs. See §7. |
| **F29** | Warehouse booking integration (real WDRA warehouses, real availability) | Akash | Turns the pledge card from a simulation into a transaction. |
| **F30** | Actual lender integration for pledge finance | — | **Blocked on partnership, not engineering.** Do not build against an imagined API. |
| **F31** | 6 commodities × 15 markets | Kartik | Breadth. Cheap once the ingestion job exists. |
| **F32** | Hindi + English + Marathi (3 languages) | Shreya | Marathi is Phase 1. Hindi widens the pilot beyond Maharashtra. |
| **F33** | FPO admin console — pool creation, member management, payout tracking | Akash + Shreya | The FPO is a real institutional user we have so far only simulated. |
| **F34** | Buyer reliability score from **actual** completed transactions | Akash | Phase 1 seeds this number. Phase 2 earns it. |

### 2.3 Explicitly NOT in Phase 2

| Item | Why not |
|---|---|
| Blockchain / DLT of any kind | Same answer as Phase 1. An append-only Postgres table with a hash chain and a published audit endpoint gives every property we need. Read `06_BACKEND_ARCHITECTURE.md` §6. |
| A fine-tuned or self-hosted LLM | Cost and latency for a problem that retrieval solves. Phase 2 uses an API model with grounding, or nothing. |
| Commodity futures / derivatives | Regulated activity. Not a student project. |
| Crop-loan origination | We are not an NBFC. We connect to lenders (F30); we do not lend. |
| Multi-state expansion | Phase 3. |

---

## 3. ★ F20 — Realisation tracking, the trust flywheel

### The mechanic

```
farmer sees verdict  ──►  advice_log row written (verdict, forecast, as_of)
        │
        │  7–21 days pass
        ▼
farmer records actual sale  ──►  realisation row
        │
        ▼
nightly job joins them  ──►  advice_outcome
        │                     · realised_paise_per_qtl
        │                     · advice_p50_paise_per_qtl
        │                     · counterfactual_sell_now_paise   (what harvest-day sale would have paid)
        │                     · gain_vs_counterfactual_paise
        │                     · within_band  (was the actual inside p10–p90?)
        ▼
  "our record" card on the farmer's home screen
```

### The schema addition

```sql
create table advice_log (
  id            text primary key,
  farmer_id     text not null references farmers(id),
  lot_id        text references lots(id),
  commodity_id  text not null,
  market_id     text not null,
  as_of         date not null,
  action        text not null check (action in
                  ('SELL_NOW','SELL_ELSEWHERE','HOLD','SPLIT','NO_ADVICE')),
  refusal_reason text,
  best_day      date,
  p10_paise_per_qtl int, p50_paise_per_qtl int, p90_paise_per_qtl int,
  expected_gain_paise  bigint,
  band_width_bps int,
  model_version text not null,
  created_at    timestamptz not null default now()
);
-- append-only. never update a past verdict. (I3)

create table advice_outcome (
  advice_id     text primary key references advice_log(id),
  realisation_id text not null references realisation_ledger(id),
  realised_paise_per_qtl int not null,
  counterfactual_paise_per_qtl int not null,
  gain_vs_counterfactual_paise bigint not null,   -- may be NEGATIVE
  within_band   boolean not null,
  computed_at   timestamptz not null default now()
);
```

### The three rules that make this honest

1. **`gain_vs_counterfactual_paise` can be negative and the UI shows it negative.** A scorecard that only counts wins is marketing, not measurement. If our HOLD cost a farmer ₹4,000, the card says so, in red, in Marathi.

2. **`within_band` is the honesty metric, not accuracy.** We never promised the p50. We promised the actual would usually land between p10 and p90. Report *"१० पैकी ८ वेळा आमचा अंदाज बरोबर होता"* — 8 of 10 inside the band — because that is the claim we actually made.

3. **The counterfactual is the *observed modal price on the advice date*, not a model output.** Comparing our forecast to our forecast proves nothing. The comparison must be against what the farmer would really have banked by selling that day, net of the same costs.

### The number this earns you

After a 60-day pilot with 50 farmers you can say, with a query behind it:

> *"Across 137 recommendations: 81% of actual sale prices landed inside our p10–p90 band. Farmers who followed a HOLD realised on average ₹1,240 more per quintal than the observed price on the day we advised — and in 19 cases they realised less, average ₹610 less. We show them both numbers."*

That paragraph is Phase 3's entire fundraising and government-pilot pitch. It exists only if F20 ships in Phase 2.

---

## 4. ★ F21 — Real escrow

### What changes and what does not

**Does not change:** the FSM. `06_BACKEND_ARCHITECTURE.md` §6's `LEGAL` transition dict and `ACTOR` matrix stay exactly as they are. That is the whole reason it was built as a state machine over a simulated ledger rather than inline status assignments.

**Changes:** each transition additionally calls the payment provider, and each provider webhook maps back to exactly one transition.

```
BUYER pays              →  provider: create order + capture   →  FUNDS_HELD
FARMER dispatches       →  (no money movement)                →  DISPATCHED
BUYER confirms receipt  →  (no money movement)                →  RECEIVED
system/QA passes        →  provider: transfer to farmer       →  RELEASED
dispute upheld          →  provider: refund                   →  REFUNDED
```

### The five hard requirements

1. **Use a licensed payment aggregator's escrow-like product** (Razorpay Route, Cashfree Easy Split). **Do not hold farmer money in a company bank account** — that is a regulated activity and it is not something a student team does.
2. **Every provider call is idempotent** with our own key. Phase 1 already put `idempotency_key` on `transition()`; reuse it as the provider key.
3. **Webhooks are verified by signature** and are themselves idempotent — providers retry, and a double-processed release pays a farmer twice.
4. **Reconciliation job**, nightly: every `RELEASED` transaction must have a matching provider transfer, and every provider transfer a matching transaction. Alert on any mismatch. Money systems without reconciliation do not know when they are wrong.
5. **The ledger stays append-only** and now carries the provider reference on every row. `provider_payment_id`, `provider_transfer_id`, both nullable, both never updated after write.

### Money invariants that get stricter, not looser

- Still integer paise everywhere (I1). The provider API speaks paise too — do not convert to rupees at the boundary.
- Platform fee, if any, is a **separate ledger line with its own `entry_type`**, never a silent deduction from the farmer's amount. A farmer must be able to see every paisa between the buyer's payment and their bank credit.
- `sum(credit) - sum(debit)` per transaction must be zero. Assert it in the reconciliation job, not just in a test.

---

## 5. F27 — Conformal intervals

Phase 1 measures coverage empirically and reports it honestly (`coverage_80_bps`, target ~8000). That is defensible. It is not a *guarantee*.

Split conformal prediction gives a distribution-free, finite-sample coverage guarantee: hold out a calibration set, compute the residual quantile, widen the interval by it. Coverage then holds at the target level under exchangeability, regardless of whether LightGBM's quantile heads are well calibrated.

**Why this matters for us specifically:** the whole product rests on `band_width_bps` deciding when to refuse. If the band is systematically too narrow, we give confident advice we have not earned — the exact failure I5 exists to prevent. Conformal turns "we measured 81% coverage last month" into "coverage is guaranteed ≥80% by construction."

**Why it is P1 and not P0:** it improves a number that is already honest. Realisation tracking creates a number that does not yet exist. Ship F20 first.

**Caveat to state honestly:** exchangeability is violated by regime changes — an export ban breaks it, which is exactly the failure mode already named in the Phase 1 model card's `known_limitations`. Conformal narrows the calibration gap; it does not make the model see policy shocks. Keep that sentence in the model card.

---

## 6. F25 — SMS and IVR, the reach multiplier

The uncomfortable arithmetic: the farmers with the least ability to wait — the ones the product exists for — are the least likely to own a usable smartphone. A beautiful Marathi PWA that reaches only smartphone owners has selected against its own user.

| Channel | What it carries | Cost |
|---|---|---|
| **Outbound SMS** | The verdict in one line: *"कांदा: थांबा. १२ दिवसांत अंदाजे ₹६२,९०० जास्त. सर्वात वाईट: ₹४८,००० कमी."* | ~₹0.15/SMS |
| **Missed-call IVR** | Farmer gives a missed call, system calls back and speaks today's price + the verdict, using the **same pre-generated Marathi clips** as the app's voice feature | ~₹0.30/min |
| **Inbound SMS** | `KANDA LASALGAON` → price + verdict reply | ~₹0.15 |

**The reuse is the point:** the Phase 1 voice architecture (pre-generated Sarvam clips stitched by phrase, per `07_FRONTEND_ARCHITECTURE.md` §7) is already a phrase-assembly system. IVR is the same clip library played down a phone line instead of a speaker. Building voice as offline clips in Phase 1 rather than live TTS makes this nearly free in Phase 2 — that was the reason for the design, not just airplane mode.

**Non-negotiable, carried from Phase 1:** the SMS says the worst case too. One line, both numbers. A channel constraint is not a licence to hide downside.

---

## 7. F28 — The assistant, upgraded honestly

Phase 1: retrieval over ~30 curated fixed answers. No generation. It cannot hallucinate because it cannot compose.

Phase 2: retrieval-augmented generation over a **curated, versioned corpus** — MSP notifications, APMC procedure, scheme eligibility, warehouse rules — with these five constraints:

1. **Every answer carries a citation** with the document name and date. No citation → no answer.
2. **Refuse outside the corpus.** *"मला हे माहीत नाही"* is a valid, shipped response. Same principle as NO_ADVICE.
3. **Never generate a price, a forecast, or a verdict.** Those come from the model, through `/window/recommend`, with a band. If a farmer asks the assistant "should I sell?", it routes to the verdict engine and shows the card — it does not answer in prose.
4. **Never generate a number that is not in a cited document.** This is the rule that stops the plausible-sounding-wrong-MSP failure.
5. **Log every Q&A pair** for review. The first month's logs are the next month's FAQ list.

The corpus is versioned and diffable. When an MSP changes, we change one document and every answer changes with it — which is the entire argument for retrieval over a fine-tune.

---

## 8. Phase 2 team allocation

Same six people, shifted lanes as the system stops being a prototype.

| Person | Phase 1 | Phase 2 |
|---|---|---|
| **Akash** | Backend, escrow FSM, matching | **F21 real escrow + reconciliation** (the highest-risk item), F29, F33, F34 |
| **Kartik** | Data ingestion, DevOps | **F22 nightly ingestion + freshness monitoring**, F25 SMS/IVR, F31 breadth, managed Postgres migration |
| **Nikhil** | Forecast model | **F23 retraining pipeline with backtest gating**, F26 weather, F27 conformal |
| **Nilesh** | Decision engine, costs, pledge | **F20 realisation scoring + counterfactual** (the trust flywheel), F28 assistant grounding |
| **Pranay** | Farmer app | **F20's scorecard UI**, F24 push, offline sync hardening, accessibility pass |
| **Shreya** | Buyer web, i18n, voice | F24 push, F25 IVR clip library, F32 Hindi, F28 assistant UI |

**Two structural additions Phase 1 did not need:**
- **A rotating on-call.** Once real money moves, someone owns the pager.
- **A weekly "what did our advice actually do" review** reading F20's output. If nobody reads the scorecard, the scorecard is decoration.

---

## 9. Phase 2 definition of done

1. **F20 live**, with at least 30 recorded realisations joined to advice and a scorecard showing both wins *and* losses.
2. **F21 live** on real money, with a reconciliation job that has run 14 consecutive nights with zero unexplained mismatches.
3. **F22 running nightly** for 14 days with a freshness alert that has fired at least once and been acted on. An alert that has never fired is untested.
4. **F23 gating**: at least one model build has been *rejected* by the backtest gate. If nothing has ever been rejected, the gate is not proven.
5. **F24/F25 delivering** to at least 20 real farmers, at least one of them on a feature phone.
6. All Phase 1 invariants still hold — **re-run the invariant greps**: float money, `status =` outside the FSM, English strings in the Marathi bundle, cross-actor 404.
7. **A published model card** with real backtest numbers from the pilot period, including the coverage figure and the known limitations.
8. Zero secrets in git history. Re-audited, not assumed.

---

## 10. The Phase 2 risk that actually matters

Not technical. **Nobody records their actual sale price.**

F20's entire flywheel depends on a farmer voluntarily coming back to tell us what happened. If that never occurs, we have no scorecard, no credibility number, and Phase 3 has nothing to stand on.

Three mitigations, in order of expected effect:

1. **Ask at the moment of the escrow release.** For transactions completed inside the platform, the realised price is *already in the ledger* — no farmer input needed. This is the strongest argument for driving transactions on-platform rather than staying an advice product.
2. **One SMS, one number.** *"तुम्ही कांदा किती भावाने विकला? उत्तर द्या: 1850"* — a single reply, no app, no login.
3. **Show them their own record.** People come back to a scoreboard that has their name on it. The scorecard is both the output and the incentive.

**Design the flywheel before building the features that feed it.** A Phase 2 that ships F21–F34 and skips F20 is a bigger prototype, not a product.
