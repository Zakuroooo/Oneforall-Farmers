# R3 · LEDGER — Lots, Grading, Matching, Escrow, Ledger, Disputes
**Branch:** `r3-ledger` · **You own the number on the winning slide.**

---

## ⬛ PASTE THIS TO CLAUDE CODE AT THE START OF EVERY SESSION

```
You are working on MANDI-SETU, a Next.js 15 + Prisma + Postgres monorepo for
Smart India Hackathon 2026, problem statement 26132 (market linkages and price
discovery for farmers of Maharashtra). Five engineers with five Claude Code agents
are building this simultaneously in ONE repo over 3 days.

I am R3 (codename LEDGER). My role: the transaction spine — lots, self-grading,
farmer pooling with consent, lot-to-buyer matching, offers, the escrow state machine,
the tamper-evident realisation ledger, and disputes. All the business logic that moves
money or changes state is mine.

Before you write any code, read these files in this order:
  1. CLAUDE.md                        (project invariants — all ten are binding)
  2. docs/00_MASTER_BUILD_PLAN.md     (§2.3 is the route pattern I must follow exactly)
  3. docs/01_CONTRACTS.md             (my endpoints + the escrow FSM diagram)
  4. docs/02_SECURITY_AND_QUALITY.md  (S1, S3, S9, S10, S11, S12 are all mine)
  5. docs/roles/R3_LEDGER.md          (my task list — work through it in order)
  6. prisma/schema.prisma and packages/contracts/src/index.ts (read-only for me)

I OWN and may edit ONLY these paths:
  apps/web/src/lib/domain/grading.ts
  apps/web/src/lib/domain/matching.ts
  apps/web/src/lib/domain/escrow.ts
  apps/web/src/lib/domain/ledger.ts
  apps/web/src/lib/domain/split.ts
  apps/web/app/api/lots/**      app/api/pools/**     app/api/demand/**
  apps/web/app/api/match/**     app/api/offers/**    app/api/tx/**
  apps/web/app/api/ledger/**    app/api/disputes/**
  apps/web/src/lib/domain/__tests__/**   (my unit tests)

If a change is needed in any OTHER path, do NOT edit it. Append an entry to
docs/BLOCKERS.md. In particular: prisma/schema.prisma and packages/contracts are R1's
(read-only for me), all UI is R4's/R5's, and window.ts/costs.ts are R2's.

Hard rules for you specifically:
- Money is integer paise. Quantities are integer kilograms. Never a float for money.
  When splitting money N ways: integer-divide, then give the remainder paise to the
  largest share. Shares must sum EXACTLY to the total.
- Every DB read is scoped by the session actor: findFirst with the owner in the `where`,
  never findUnique on an id from the request body. Return 404, not 403, for rows the
  actor may not see. This is the most important rule I follow.
- A TxStatus may ONLY change inside src/lib/domain/escrow.ts. No route writes `status`
  directly. Illegal transitions must throw, not be merely unlikely.
- realisation_ledger and audit_log are APPEND-ONLY. Never an update, never a delete.
  Each row carries seq, prevHash, and hash = sha256(prevHash + canonicalJson(payload)).
- Every state-creating write is idempotent via the x-idempotency-key header.
- A pool CANNOT leave CONSENT_PENDING until every member has an explicit PoolConsent row.
- The domain layer is PURE: no db, no fetch, no Date.now() inside. Pass the date in.
  That is what makes it unit-testable without Postgres.
- The ₹/quintal gain in the ledger must be MEASURED (realised minus benchmark),
  never asserted or hardcoded. It is the single most important figure in our pitch.

After each task: run `npm run typecheck && npm run test`, then commit
(`feat(ledger): …`) and push. Commit every 30-45 minutes.

Start with Task 1 in docs/roles/R3_LEDGER.md. Tell me your plan before you write files.
```

---

## Why your role exists

R2 tells the farmer *when* to sell. You are the reason he *can*. Price information
without a transaction path is a newspaper. The chain you build — list, grade, pool,
match, offer, escrow, release, ledger — is what converts advice into money in a bank
account, and the last link, the ledger, is what lets us make a claim on stage that is
measured rather than asserted.

**The slide you own says:** *"across 214 completed transactions our farmers realised
₹187 per quintal more than the same-day mandi modal price for the same grade."* That
number must come out of your `realisation_ledger` table by subtraction. If it is
hardcoded anywhere, we are lying, and a judge who asks "show me how that's computed"
will find it.

---

## Files you own

```
apps/web/src/lib/domain/
├── grading.ts     6-dim self-assay → Grade + weakestDim + abstain
├── matching.ts    lot ↔ demand score with explainable components + a `why` sentence
├── escrow.ts      THE FSM. Only place a TxStatus changes.
├── split.ts       grade-weighted fair split; shares sum exactly
├── ledger.ts      hash-chain append + verify
└── __tests__/     vitest — these run without a database

apps/web/app/api/
├── lots/route.ts  lots/[id]/route.ts  lots/[id]/assay/route.ts  lots/[id]/list/route.ts
├── pools/route.ts  pools/[id]/route.ts  pools/[id]/consent/route.ts
├── demand/route.ts   match/route.ts
├── offers/route.ts  offers/[id]/accept/route.ts  offers/[id]/reject/route.ts
├── tx/[id]/route.ts  tx/[id]/transition/route.ts
├── ledger/route.ts  ledger/verify/route.ts
└── disputes/route.ts  disputes/[id]/respond/route.ts
```

**Forbidden:** `prisma/schema.prisma`, `packages/contracts/**`, `src/lib/domain/window.ts`
and `costs.ts` (R2), every `src/components/**`, every route group, `prisma/seed/**` (R5),
`tests/e2e/**` (R5), `src/lib/*.ts` at the top level (R1's `guard`, `db`, `http`, `audit`,
`idem` — you *import* these, you do not edit them).

---

## Task list

### H4 → H20 · The FSM and the first real route

**T3.1 — `escrow.ts` FIRST, before any route. It is 60 lines and it de-risks everything.**

```ts
type Event = 'FUND' | 'DISPATCH' | 'DELIVER' | 'QC_PASS' | 'QC_FAIL'
           | 'RELEASE' | 'REFUND' | 'CANCEL' | 'RAISE_DISPUTE'
           | 'RESOLVE_FOR_FARMER' | 'RESOLVE_FOR_BUYER';

/** The ONLY function that may compute a next TxStatus.
 *  Throws IllegalTransition on anything not in the table. */
export function transition(
  current: TxStatus, event: Event, actorRole: Role
): { next: TxStatus; effects: Effect[] }
```

Write the transition table as **data**, not as nested `if`s:

| from | event | actor | to |
|---|---|---|---|
| AGREED | FUND | BUYER | ESCROW_FUNDED |
| AGREED | CANCEL | BUYER \| FARMER | CANCELLED |
| ESCROW_FUNDED | DISPATCH | FARMER | IN_TRANSIT |
| ESCROW_FUNDED | REFUND | ADMIN | REFUNDED |
| IN_TRANSIT | DELIVER | BUYER | DELIVERED |
| IN_TRANSIT | RAISE_DISPUTE | BUYER \| FARMER | DISPUTED |
| DELIVERED | QC_PASS | BUYER | QC_PASSED |
| DELIVERED | QC_FAIL | BUYER | DISPUTED |
| QC_PASSED | RELEASE | BUYER \| ADMIN | RELEASED |
| DISPUTED | RESOLVE_FOR_FARMER | ADMIN | RELEASED |
| DISPUTED | RESOLVE_FOR_BUYER | ADMIN | REFUNDED |

RELEASED, REFUNDED, CANCELLED are terminal — assert that no event moves out of them.

A table gives you three things a pile of `if`s does not: illegal transitions become
impossible rather than unlikely; the table itself renders as a slide; and you can test
the entire money lifecycle in 40 lines with no database. Write those tests in the same
commit — **every legal transition passes, every illegal one throws, terminals are
terminal.** That test file is also your answer to "how do you know money can't get stuck."

**T3.2 — `POST /api/lots` and `GET /api/lots`, following §2.3 exactly.**
This is the first route in the repo written by someone other than R1, and R4/R5 will copy
your pattern. Get the actor scoping visibly right:

```ts
const actor = await guard('FARMER');
const lots = await db.lot.findMany({
  where: { farmerId: actor.farmerId },        // ← this line. never optional.
  include: { assay: true, commodity: true },
  orderBy: { createdAt: 'desc' },
});
return ok(lots.map(toLotDto));
```

Acceptance: farmer A cannot see farmer B's lot by id — verify with `curl` and two
cookies, not by looking at the code.

**T3.3 — `grading.ts`: 6 questions a farmer can actually answer.**

The whole idea is worthless if a question requires a lab. No refractometer, no moisture
meter, no calipers. For onion:

| Dimension | Question in Marathi (R4 owns the exact string) | Answers |
|---|---|---|
| size | कांद्याचा आकार? | small / medium / large / mixed |
| moisture | कापणीनंतर किती दिवस वाळवला? | 0–2 / 3–5 / 6–10 / >10 days |
| damage | खराब/कुजलेले कांदे किती? | none / <5% / 5–15% / >15% |
| foreignMatter | माती व कचरा? | clean / some / a lot |
| uniformity | आकार सारखा आहे का? | uniform / mostly / mixed |
| colour | रंग? | bright / normal / dull |

Return `{ grade: A|B|C|UNGRADED, weakestDim, abstained, confidence }`.

Two design decisions that make this credible:
- **`abstained`.** If answers are contradictory ("no damage" + ">10 days drying" +
  "dull colour"), return `UNGRADED` with a reason rather than guessing. Same honesty
  principle as R2's `NO_ADVICE`.
- **`weakestDim` is the actionable output.** The grade tells him what he has; the weakest
  dimension tells him what to fix. *"तुमचा माल B ग्रेड आहे. माती काढल्यास A ग्रेड मिळू शकेल —
  अंदाजे +₹80/क्विंटल."* That sentence is a farmer-facing product, not a classifier.

Self-declared grades are gameable, and you must say so before a judge does. The prepared
answer: *"self-assay is a starting point, not a certificate. It is cross-checked three
ways — buyer QC at delivery feeds back into the farmer's reliability score, repeat
mismatches downgrade future self-assays, and for high-value lots we route to an APMC
grader. We are not claiming to have solved grading; we are claiming to have made it
cheap enough to happen at all."*

**T3.4 — `split.ts`: grade-weighted fair split, exact to the paise.**

```
weight_i   = qtyKg_i × gradeMultiplier(grade_i)     // A=1.00 B=0.92 C=0.80
share_i    = floor(totalPaise × weight_i / Σweights)
remainder  = totalPaise − Σ share_i
→ give the remainder paise to the largest share
```

Return, per member: `qtyKg`, `grade`, `weight` (**auditable — show the number**),
`sharePaise`, and `vsSoloPaise` (what he would have realised selling alone at his local
mandi modal, minus his transport). Two invariants, both unit-tested:
1. `Σ share_i === totalPaise` **exactly**. A ₹1 gap on a fair-split screen is the detail
   a judge points at.
2. Every member's share ≥ their solo value. If pooling makes someone worse off, the pool
   must not form — surface that, do not hide it. A pooling mechanism that can quietly
   harm a member is exactly what FPOs are distrusted for.

Snapshot `scoreAtPool` when the pool forms so a later regrade cannot retroactively change
an agreed split (the schema already has the field).

### H28 → H48 · The full chain

**T3.5 — Assay, list, pool, consent.**
`POST /api/lots/:id/assay` · `POST /api/lots/:id/list` (FSM `DRAFT → LISTED`) ·
`POST /api/pools` (starts `CONSENT_PENDING`) · `GET /api/pools/:id` (returns splits with
`weight` and `vsSoloPaise`) · `POST /api/pools/:id/consent`.

**Enforce S12 in code, not in the UI:** the pool cannot leave `CONSENT_PENDING` until
`consents.count === members.count`. A route that lets it through because "the UI wouldn't
allow it" is not an enforcement.

**T3.6 — `matching.ts`: a score is worthless unless it explains itself.**

```ts
components: {
  gradeFit:      0..100,   // does the lot grade meet the buyer's minimum?
  quantityFit:   0..100,   // does qty fit the demand window? penalise both under and over
  distance:      0..100,   // logistics cost, decaying with km
  buyerRating:   0..100,   // reliability 0-1000 → normalised
  payoutSpeed:   0..100,   // medianPayoutDays — a farmer's real constraint
  priceVsMandi:  0..100,   // offered/indicative vs today's mandi modal
}
score = Σ w_i × component_i     // weights visible in the response, not hidden
why:   "A-grade match, 42 km away, this buyer pays in 3 days on average and is
        offering ₹120/qtl above today's Lasalgaon modal."
```

Return the components **and** the sentence. An unexplained score is unshippable — a
farmer will not act on a number he cannot interrogate, and neither will a judge.
`payoutSpeed` deserves real weight: a farmer will rationally take ₹50/qtl less to be paid
in 3 days instead of 30, and a matching engine that ignores that is modelling a farmer
who does not exist.

**T3.7 — Offers.** `POST /api/offers` (buyer, idempotent) ·
`POST /api/offers/:id/accept` (farmer, idempotent, creates the `Transaction` in `AGREED`) ·
`POST /api/offers/:id/reject`.

`OfferDto` must carry `vsReservePaisePerQtl` and `vsMandiPaisePerQtl`. The farmer sees
*"₹2,340 — that is ₹120 above today's Lasalgaon modal and ₹40 above your reserve"*, never
a bare number. Context is the product.

Accept is where a double-tap on 2G creates two transactions and funds two escrows. Use
R1's `withIdempotency` and add a unique constraint on `Transaction.idemKey` — belt and
braces, because this bug will happen live on stage if it can.

**T3.8 — `POST /api/tx/:id/transition`.** Loads the tx **scoped to the actor being a party
to it**, calls `escrow.transition`, and in **one Prisma transaction** writes: the new
status, an `EscrowEvent`, an `AuditLog` row, and — on `RELEASED` — the
`RealisationLedger` append. Either all of it lands or none of it does.

**T3.9 — `ledger.ts`: the tamper-evident chain.**

```ts
hash_n = sha256(hash_{n-1} + canonicalJson(payload_n))
```
`canonicalJson` = sorted keys, no whitespace, integers only. If two machines serialise
the same payload differently, every verification fails and you will spend an hour on it —
write `canonicalJson` deliberately and test it.

The ledger row records: `benchmarkPaisePerQtl` (same-day mandi modal for that commodity ×
market × grade), `realisedPaisePerQtl`, `deltaPaise`, `heldDays`, `seq`, `prevHash`,
`hash`. **`deltaPaise` is computed by subtraction, never supplied by a caller.**

Also write **`baselineMethod`** (added to the schema pre-freeze, default
`HARVEST_DAY_MODAL_HOME_MANDI`). It names the counterfactual the gain is measured against,
stored on the row rather than assumed by the reader.

This looks like a bookkeeping field and it is actually the answer to the most dangerous
question in the room: *"gain compared to what?"* Every impact number in this project is a
difference against a baseline, and a baseline you can choose after the fact is not a
measurement — it is marketing. `HARVEST_DAY_MODAL_HOME_MANDI` is deliberately the **hardest**
baseline for us to beat: what he would have got selling everything at his own mandi on
harvest day, which is exactly what he does today. Say that sentence out loud when the ledger
is on screen. Never change the baseline to make a number look better; if you ever compute a
different one, it goes in a new row with a different `baselineMethod`, and both are visible.

`GET /api/ledger/verify` walks the chain and returns the first broken link with its `seq`.
**Rehearse this as a 15-second demo beat:** open Prisma Studio, edit one ledger row, hit
verify, watch it name the exact row. That is a live tamper-evidence proof, and it is worth
more in the room than a paragraph about blockchain. Which is also your prepared answer:
*"we need tamper-evidence and audit, not decentralised consensus — the APMC is already the
trusted authority. This gives us the property we need at zero infrastructure cost."*

**T3.10 — `GET /api/ledger`.** Returns rows plus `totals.gPaisePerQtl` — the measured
weighted-average gain. Aggregate cumulative sums **in SQL and return them as strings**;
`Int` paise tops out at ₹2.14 crore and a hackathon demo can plausibly cross that in a
"total transacted" tile.

**T3.11 — Disputes.** `POST /api/disputes` (sets `respondBy`, default 48h) ·
`POST /api/disputes/:id/respond`. Implement the **asymmetry guard**: if the buyer does not
respond by `respondBy`, the dispute resolves in the farmer's favour by default.

This is a small amount of code and a large point. Deliberate delay is the standard tactic
against a farmer who has no time and no lawyer — silence is the buyer's cheapest weapon.
Making silence *cost* the buyer inverts that. Say it exactly that way on the slide.

### H54 → H68

**T3.12 — Unit tests complete (Q1).** `escrow` (all transitions + terminals),
`split` (sums exactly, ordering, no member worse off), `ledger` (verifies; a mutated row
breaks at the right seq), `grading` (weakest dim; abstains on contradictions),
`matching` (components in range; `why` is non-empty).

**T3.13 — Walk the full chain yourself, ten times.** list → assay → pool → consent →
match → offer → accept → fund → dispatch → deliver → QC → release → ledger → verify.
Ten times, because the eighth time is when you find the state that leaves a transaction
stuck. There must be **no state from which a transaction cannot reach a terminal state.**
Prove it by walking it, not by reading the table.

---

## Your failure modes, named

| Failure | Prevention |
|---|---|
| Status written directly in a route, bypassing the FSM | `grep -rn "status:" app/api` at H58. Every hit goes through `escrow.ts`. |
| IDOR on a lot or a tx | Owner in every `where`. Test with two cookies and `curl`, not by reading code. |
| Split shares off by a paise | Integer divide + remainder to largest. Unit-test the exact sum. |
| Double-tap creates two transactions | Idempotency key + unique constraint on `Transaction.idemKey` |
| Ledger delta hardcoded to look good | Compute by subtraction. R1 will read this code at H58. |
| Hash chain broken by inconsistent JSON | Write and test `canonicalJson` deliberately |
| Escrow FSM built after the routes | T3.1 is first. Sixty lines that de-risk the whole role. |
| A transaction that can get stuck | Walk all ten paths at T3.13 |
