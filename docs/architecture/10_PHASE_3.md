# 10 — PHASE 3

> **Phase 3 is not authorised until Phase 2's realisation scorecard has 60+ days of real outcomes.**
> This file is a direction, not a task list. Phase 1 and 2 have hour-by-hour plans because their scope is knowable. Phase 3's scope depends on what the Phase 2 pilot data says, and pretending otherwise would be planning theatre.

---

## 1. The gate — do not pass it on enthusiasm

Phase 3 is scale. **You do not scale something you have not measured.** Four gates, all four required:

| Gate | Threshold | Why this number |
|---|---|---|
| **G1 — Coverage honesty** | p10–p90 empirical coverage in **70–90%** across ≥100 real recommendations | If the band is miscalibrated at pilot scale, scaling multiplies bad advice |
| **G2 — Measured value** | Median `gain_vs_counterfactual_paise` **> 0** across all followed HOLDs, with the loss cases counted in | The product's entire claim. Unproven here = unprovable at scale |
| **G3 — Retention** | ≥ **40%** of pilot farmers return for a second season | One-time use means we solved a curiosity, not a problem |
| **G4 — Money integrity** | **30 consecutive nights** of clean reconciliation | Do not scale a payment system with unexplained mismatches |

**If G2 fails, Phase 3 is not "scale" — it is "go back and find out why."** That is a legitimate and honest outcome, and a team that reports it earns more credibility than one that scales a product that does not work. Say this in the pitch if asked what happens if the model underperforms.

---

## 2. What Phase 3 actually is

Four expansions, in dependency order. Each is gated on the one before it.

```
   ┌──────────────────────────────────────────────────────────┐
   │ 1. DEPTH   — more crops, more markets, same state        │
   │    proves: the pipeline generalises across commodities   │
   └──────────────────────┬───────────────────────────────────┘
                          ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2. BREADTH — more states, more languages                 │
   │    proves: nothing about the design was Maharashtra-only │
   └──────────────────────┬───────────────────────────────────┘
                          ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3. CAPITAL — real pledge finance with real lenders       │
   │    removes: the actual reason farmers cannot wait        │
   └──────────────────────┬───────────────────────────────────┘
                          ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4. INSTITUTION — FPO + government + APMC integration     │
   │    makes it: infrastructure rather than an app           │
   └──────────────────────────────────────────────────────────┘
```

**Capital is the one that matters most and it is third**, because it is gated on trust that only 1 and 2 can build. No lender underwrites a pledge book against a product with 50 users and one season of data.

---

## 3. Depth — crops and markets

| From (Phase 2) | To (Phase 3) |
|---|---|
| 6 commodities | **20+**, including perishables with different storage physics |
| 15 markets | **all major Maharashtra APMCs** (~300 mandis) |
| One model per (commodity, market) | **Hierarchical / pooled models** — borrow strength across markets for thin series |

### The real engineering problem here

Phase 1's design is 42 tiny models per (commodity, market). At 20 crops × 300 markets that is 252,000 models. **That does not scale and it should not be scaled.** The Phase 3 model architecture changes:

- **Pooled model with market and commodity embeddings**, not one model per pair. A thin market with 40 observations borrows structure from a thick one 30 km away.
- **Hierarchical reconciliation** so district-level and market-level forecasts are mutually consistent. A district forecast that contradicts the sum of its markets destroys trust the first time someone checks.
- **Per-series coverage monitoring, not aggregate.** Aggregate coverage of 80% can hide a market where coverage is 40%. That market's farmers get confidently wrong advice. **Monitor the worst series, not the mean** — and refuse per-series, which the Phase 1 `NO_ADVICE` path already supports without modification.

Perishables need a different cost model: tomato spoilage is not onion spoilage, and a HOLD verdict on a 5-day-shelf-life crop is almost always wrong. `spoilage_bps_per_day` per commodity is already in the Phase 1 cost table — Phase 3 makes it non-negotiable per crop and adds a hard shelf-life cap that can override a HOLD outright.

---

## 4. Breadth — states and languages

| Dimension | Phase 3 |
|---|---|
| States | Maharashtra → **+MP, Karnataka, Gujarat** (the same Agmarknet feed covers them) |
| Languages | Marathi, Hindi, English → **+Kannada, Gujarati** |
| Currency of trust | Per-state provenance, per-state cost tables, per-state APMC commission rules |

**The design already generalises and that is not an accident.** `districts`, `markets`, `commodities`, and `cost_tables` are reference data, not code. Adding a state is a seed job and a cost-table verification pass. Nothing in `decide()`, the FSM, or the frontend is Maharashtra-specific.

**What does not generalise and must be redone per state:**
- **Cost tables.** APMC commission rates, transport rates, and mandi fee structures differ by state and sometimes by market. Copying Maharashtra's numbers to Karnataka produces confidently wrong verdicts — the exact failure the cost table exists to prevent.
- **Language quality.** Machine-translating Marathi strings into Kannada produces text a farmer will not trust. Each language needs a native speaker to review every string a farmer sees. Budget for it.

---

## 5. ★ Capital — pledge finance, made real

This is the whole thesis arriving. Everything before it is instrumentation.

> Recall the one-sentence thesis: *the binding constraint is not information, it is the ability to wait.* Phases 1 and 2 tell a farmer that waiting pays and prove it retrospectively. **Phase 3 is where we actually let them wait.**

### The structure

```
 farmer's lot  ──► WDRA-registered warehouse ──► electronic negotiable warehouse receipt (eNWR)
                                                          │
                                                          ▼
                                              lender advances loan against eNWR
                                              (LTV ~70%, our forecast informs term)
                                                          │
                    farmer waits ◄────────────────────────┘
                          │
                          ▼
                    sells at the recommended window
                          │
                          ▼
                    loan + interest settled from proceeds; farmer keeps the gain
```

### What we contribute that a lender cannot

A lender can lend against a warehouse receipt today. What they cannot do is price the *term*. Our forecast band answers the lender's actual question: **how long should this loan run, and what is the downside if the price falls?** The p10 is the lender's stress case, already computed.

That is a genuine, defensible product wedge — and it only exists because Phase 1 refused to ship point forecasts.

### The five hard constraints

1. **We are not a lender.** No NBFC licence, no lending from our balance sheet, no origination. We are an information and workflow layer connecting a farmer, a WDRA warehouse, and a licensed lender.
2. **The pledge quote label survives all the way from Phase 1** — *"Indicative simulation — not a lender quote"* — until a real lender's own terms are in the payload. Then it becomes their quote, attributed to them, with their rate.
3. **No LTV or interest figure ever appears on a slide or a screen without a verified source.** Carried from Phase 1, non-negotiable. WDRA's published terms, with the URL recorded.
4. **I13 still holds:** if `expected_gain ≤ interest`, **no card**. A pledge that loses the farmer money must not be offered, no matter how good it is for the lender or for our transaction volume. This is the invariant that keeps the product on the farmer's side, and it becomes commercially inconvenient in Phase 3 — which is exactly when invariants matter.
5. **Default handling is designed before the first loan, not after the first default.** What happens when the price falls below the loan value and the farmer cannot repay? If the answer is "the farmer loses the crop," we have built a debt trap with a nice chart. Write the answer down, get it reviewed, and be able to say it out loud.

**Constraint 5 is the ethical centre of Phase 3.** A product built to stop farmer suicides cannot ship a mechanism that adds debt pressure to a bad season. If pledge finance cannot be made safe under a price crash, it does not ship — the forecast and the scorecard still stand on their own.

---

## 6. Institution — FPO, APMC, government

| Integration | What it unlocks | Difficulty |
|---|---|---|
| **FPO onboarding at scale** — self-serve pool creation, member payouts, audit exports | Aggregation is where small farmers get large-farmer prices. Phase 1 proves the split maths; Phase 3 removes us from the loop. | Medium — mostly UX and reporting |
| **eNAM / APMC integration** | Verdict → an actual listing on a real trading platform | Hard — institutional, not technical |
| **State agriculture dept dashboard** | District-level arrival and price intelligence for policy | Easy technically; the value is in the relationship |
| **MSP procurement linkage** | When the forecast p90 is below MSP, route to procurement instead of the market | High value, entirely dependent on government cooperation |

**The MSP linkage is the sharpest one.** If our own model says the price will not beat MSP, the honest recommendation is *"do not wait for the market — go to procurement."* A product willing to route a farmer away from its own marketplace is a product that has earned trust. It is also the natural extension of `NO_ADVICE`: the same willingness to say the unprofitable thing.

---

## 7. What stays exactly the same

Everything that made Phase 1 defensible carries through unchanged. Write these into the Phase 3 charter verbatim:

| Invariant | Still true at scale |
|---|---|
| Integer paise, integer kg, basis points | A float creeping in at 300 markets is 300 markets of wrong money |
| Append-only ledger and audit log | The audit trail is the product's memory; it never becomes editable |
| Actor-scoped reads, 404 not 403 | More users means more incentive to probe |
| **The model may refuse** | The most important one. Scale creates pressure to always have an answer. Resist it. |
| Provenance on every price row | "Where did this number come from" must remain answerable at 300 markets |
| No Aadhaar, ever | Phone is the identifier, at any scale |
| Both numbers, always — best case *and* worst case | The single most farmer-protective rule in the product |
| No blockchain | The answer does not change because the system got bigger |

**The refusal invariant is the one that will be attacked.** At scale, someone will argue that `NO_ADVICE` hurts engagement metrics. The counter-argument is in Phase 2's data: the coverage number and the loss cases on the scorecard are only credible *because* the system declines to answer when it cannot. Delete the refusal and every number the product reports becomes unfalsifiable.

---

## 8. Team at Phase 3

Six people cannot run 300 markets across four states. The honest statement of what changes:

| Function | Phase 1–2 | Phase 3 |
|---|---|---|
| Backend | Akash | Akash leads; +2 engineers |
| Data | Kartik | Kartik leads a data platform; ingestion becomes a service with SLAs |
| ML | Nikhil, Nilesh | Nikhil owns models; Nilesh owns the decision layer and evaluation; +1 for monitoring |
| Frontend | Pranay, Shreya | Pranay owns the farmer app; Shreya owns i18n + accessibility across 5 languages; +1 |
| **New: field operations** | — | **The role that decides whether Phase 3 works.** Nothing about farmer trust is built at a keyboard. |
| **New: compliance / partnerships** | — | Lender agreements, WDRA, state MoUs |

**Field operations is not a nice-to-have.** Every agri-tech product that failed at this stage failed because it scaled software into districts where nobody had ever met a farmer.

---

## 9. How to talk about Phase 3 in the pitch

**Do not present Phase 3 as a plan.** Judges have seen a hundred slides promising national scale. Present it as a **gated hypothesis**:

> *"Phase 3 is scale, and we've written down what has to be true before we're allowed to start it: 80% band coverage on at least a hundred real recommendations, a positive median gain with the losses counted in, and 40% of pilot farmers coming back for a second season. If the second one fails, we don't scale — we go back and find out why our advice didn't pay. We'd rather tell you that now than discover it at 10,000 farmers."*
>
> *"The one thing we'd build in Phase 3 that we can't build now is pledge finance, and it's the whole point. Right now we can tell a farmer that waiting fourteen days is worth ₹62,900 — but if he needs money on Tuesday, we've just told him something painful. Phase 3 is where a warehouse receipt and a lender let him actually wait. We're not the lender. What we add is the thing a lender can't price on their own: how long the loan should run, and what the downside looks like if the price falls. That's the p10 we're already computing."*

**Two sentences on the ethics, unprompted, because it is the true reason the project exists:**

> *"And one thing we've written into the design: if the interest costs more than the expected gain, the app doesn't show the loan option at all. We built a product to help farmers get paid for their work — we're not going to accidentally build a debt trap."*

That is the strongest thing this project can say, and it is only credible because the invariant is in the Phase 1 code, in `pledge.quote`, returning `None`, today — not in a Phase 3 promise.
