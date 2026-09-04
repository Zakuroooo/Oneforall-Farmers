# SECURITY & QUALITY — the things to care about every hour
**Everyone reads this. R1 enforces it. No exceptions for "it's just a demo."**

> Two reasons this matters more than it looks. First, a technical judge with 15 minutes
> will find an IDOR or an unvalidated endpoint faster than they will appreciate your
> forecast — a single found hole reframes the whole project as student work. Second, the
> product handles a farmer's money and identity. If we would not ship it to a real
> farmer in Nashik, we do not put it on a slide claiming we would.

---

## PART A — THE 12 SECURITY RULES

### S1 · Every read of user data is scoped to the session actor (IDOR)

This is the number one vulnerability in hackathon projects and the easiest to find.

```ts
// ❌ CATASTROPHIC. Any logged-in user reads any farmer's lot by changing one char.
const lot = await db.lot.findUnique({ where: { id: body.lotId } });

// ✅ The owner is part of the query, always.
const actor = await guard('FARMER');
const lot = await db.lot.findFirst({
  where: { id: body.lotId, farmerId: actor.farmerId },
});
if (!lot) return notFound();   // 404, not 403 — do not confirm the row exists
```

Return **404, not 403**, for rows the actor may not see. A 403 tells an attacker the id
is valid, which is half the work of enumeration.

The same rule applies to buyers (`buyerId`), FPO staff (`fpoId`), and every nested read.
An offer belongs to a lot belongs to a farmer — check the chain, not just the leaf.
**Actor ids come from the JWT cookie only.** The moment you read `body.farmerId` and
trust it, you have built an impersonation endpoint.

At H58, R1 greps every route for `findUnique(` and `findFirst(` and reads each `where`
clause out loud. Budget 40 minutes. It is the highest-value 40 minutes of the hardening
block.

### S2 · Every request body and query param is validated by Zod before use

```ts
const parsed = OfferCreateBody.safeParse(await req.json());
if (!parsed.success) return badRequest(parsed.error);  // 422 + { fields: {...} }
```

No `as any`. No `body.foo as string`. No optional chaining as a substitute for
validation. The schema lives in `@mandi/contracts` so the client and server cannot
disagree. If the schema is wrong, fix the schema — do not work around it in the route.

Pay attention to numeric bounds, not just types: `qtyKg` must be positive and capped,
`rho` in [0,1], `storageDaysAvailable` in [0,120], `horizonDays` ≤ 30. An unbounded
`qtyKg` of 10^12 will overflow the paise arithmetic and print a nonsense rupee figure
on the exact screen the judge is looking at.

### S3 · Money is integer paise. Quantities are integer kilograms. No floats. Ever.

```ts
// ❌ 0.1 + 0.2 = 0.30000000000000004. Now your split doesn't add up on screen.
const total = qtyQuintal * pricePerQuintal;

// ✅
const totalPaise = totalPaise(qtyKg, pricePaisePerQtl);   // from @mandi/contracts
```

Field names end in `Paise` or `Kg` or `Bps`. `formatPaise()` is the only thing that ever
produces a "₹" string. A rounding drift in a fair-split screen — three farmers' shares
summing to ₹1 less than the total — is the kind of detail a judge will point at.

Rounding rule for splits: compute every share with integer division, then give the
remainder paise to the largest share. Never round each share independently.

### S4 · No Aadhaar. Ever. Not hashed, not encrypted, not "just for the demo."

Invariant I8. Phone number is the identifier. There is no field for Aadhaar in
`schema.prisma` and there must never be one. Storing government identity numbers
imposes obligations under the Aadhaar Act and the DPDP Act 2023 that we cannot meet in
72 hours, and a judge from a government department will know that.

If someone asks about KYC in Q&A, the answer is prepared and it is a strength:
*"we deliberately store no Aadhaar. Identity is phone-based; where statutory KYC is
required in production, we would federate to an existing verified rail — Agristack
farmer ID or the APMC licence registry — and hold only a verification token, never the
number."*

### S5 · No secrets in git. Only `.env.example` is committed.

If a real secret lands in git history: **tell R1 immediately and rotate it.** Deleting
the line in a later commit does not remove it from history — the value is still in the
objects and still on GitHub. Rotation is the only fix.

Before the repo goes public (and it will, for the submission):
```bash
git log -p | grep -iE 'AUTH_SECRET=|API_KEY=|password=|sk-|Bearer ' | head -50
```

### S6 · Never log PII

No phone numbers, no OTPs, no full request bodies, no JWTs in any log line — including
`console.log` you meant to delete. Log ids and codes.

```ts
// ❌ log.info(`otp ${code} sent to ${phone}`)
// ✅ log.info({ event: 'otp.sent', userId, phoneLast4: phone.slice(-4) })
```

Vercel logs are readable by anyone with project access, are retained, and are one
screenshot away from being in a slide deck.

### S7 · Rate-limit anything unauthenticated

OTP request is the obvious one: without a limit it is a free SMS cannon and a user
enumeration oracle. Limits to implement in `src/lib/ratelimit.ts` (R1):

| Endpoint | Limit |
|---|---|
| `POST /api/auth/otp/request` | 3 per phone per 10 min, 20 per IP per hour |
| `POST /api/auth/otp/verify` | 5 attempts per code, then the code dies |
| any authenticated write | 60 per actor per minute |

An in-memory `Map` keyed by phone/IP is fine for the demo — say so honestly ("Redis in
production") rather than pretending it is distributed. OTP codes must be **single-use**,
expire in 5 minutes, and be invalidated on success. Compare them in constant time, and
never return "wrong OTP" vs "no such user" differently — that difference is an
enumeration oracle.

### S8 · Authorisation is role-checked at the route, not the component

Hiding a button in the UI is not access control. `guard('BUYER')` on
`POST /api/offers` is. Assume every endpoint will be called directly with `curl` by
someone holding a farmer's cookie, because at judging time it might be.

Check both **role** and **relationship**: a buyer may create an offer, but only against
a lot that is `LISTED`, and may only transition a transaction they are party to.

### S9 · State changes only through the FSM

`src/lib/domain/escrow.ts` is the only place a `TxStatus` may change (I9). No route
writes `status` directly. The FSM function takes `(current, event, actorRole)` and
returns the next state or throws. This gives you three things for free: illegal
transitions are impossible rather than merely unlikely, the transition table is a slide,
and R3 can unit-test the whole money lifecycle in 40 lines with no database.

The same principle for `LotStatus`, `OfferStatus`, `PoolStatus`, `DisputeStage`.

### S10 · Idempotency on every state-creating write

Farmers on 2G will double-tap. A double-tapped "Accept offer" that creates two
transactions and funds two escrows is the worst bug in the system, and it will happen
live on stage because the conference wifi is slow.

Client sends `x-idempotency-key: <uuid>`; the server stores it unique on the
transaction and returns the existing row on replay. `IdemHeader` is exported from
`@mandi/contracts` so nobody typos the header name.

### S11 · The ledger and audit log are append-only

No `UPDATE`, no `DELETE`, ever, on `realisation_ledger` or `audit_log` (I3). Each row
carries `seq`, `prevHash`, and `hash = sha256(prevHash + canonicalJson(payload))`.
`GET /api/ledger/verify` walks the chain and returns the first broken link.

Two reasons this earns its keep. It is a genuine tamper-evidence property you can
demonstrate live in ten seconds (edit a row in Prisma Studio, hit verify, watch it fail).
And it is the honest answer to "why not blockchain": *"we need tamper-evidence and
auditability, which a hash chain gives us at zero infrastructure cost; we do not need
decentralised consensus, because the APMC is already the trusted authority. Adding a
chain would add cost and latency for a property we don't need."* That answer, delivered
calmly, is worth more than a blockchain would be.

### S12 · Consent before pooling, always

A pool cannot leave `CONSENT_PENDING` until every member has an explicit
`PoolConsent` row (grade-weighted share, `scoreAtPool` snapshotted so a later regrade
cannot retroactively change an agreed split). We are deciding how a small farmer's
produce is priced against his neighbour's. Doing that without recorded consent is the
thing FPOs are distrusted for. The consent screen is also one of the best moments in the
demo — show the farmer seeing his share *and* his `vs solo` gain before he taps agree.

---

## PART B — HOW NOT TO SHIP BUGS

### Q1 · The domain layer is pure and unit-tested

Everything in `src/lib/domain/` takes plain data and returns plain data. No `fetch`, no
`db`, no `Date.now()` — pass the date in. This makes the hard logic — window arithmetic,
grade weighting, fair split, FSM — testable in milliseconds without Postgres, which
means it is *actually* tested at hour 55 instead of "tested by clicking."

Minimum test set before H48 (this is small and non-negotiable):

| File | Tests that must exist |
|---|---|
| `window.ts` | HOLD when gain is real · SELL_NOW when gain < threshold · NO_ADVICE when band > threshold · SPLIT boundary · costs monotonically increase with hold days |
| `costs.ts` | spoilage compounds · finance is pro-rata on days · cold vs ambient differ |
| `split.ts` | three shares sum **exactly** to the total · higher grade gets more · every member ≥ their solo value |
| `escrow.ts` | every legal transition passes · every illegal transition throws · terminal states are terminal |
| `ledger.ts` | chain verifies on append · a mutated row breaks verification at the right seq |
| `grading.ts` | weakest dimension is correct · abstains when inputs are contradictory |

### Q2 · `npm run verify` must be green before every merge

```bash
npm run verify     # typecheck && lint && test && build
```

`tsc` catches, for free, the entire class of bugs that would otherwise surface as a
white screen during the demo. **A red build never merges to `main`.** If `main` is red,
that is a five-alarm event: everyone stops, R1 fixes or reverts.

TypeScript strict is on, including `noUncheckedIndexedAccess`. It will annoy you at
`arr[0]`. It is also exactly the check that prevents `Cannot read properties of
undefined` on stage.

### Q3 · Errors never reach the farmer as a stack trace

Every `app/(farmer)` route needs `error.tsx` and `loading.tsx`. Every fetch has a
failure branch. Every list has an empty state with a Marathi sentence explaining what to
do next. The uniform envelope is:

```json
{ "error": { "code": "LOT_NOT_LISTED", "message": "...", "fields": { "qtyKg": "..." } } }
```

Codes are machine-readable and stable; messages are human and translated. A judge
clicking randomly *will* find an edge — what they see there decides whether they read
you as careful or careless.

### Q4 · Degrade, never crash

The ML service will be down at some point in these 72 hours. When it is:
`/api/window/recommend` returns `NO_ADVICE` with `refusalReason: "forecast service
unavailable"`. It does **not** 500. Same for a missing forecast, a market with no price
history, a commodity with no cost table. Every external dependency gets a timeout
(3s to ML) and a defined fallback. Write the fallback when you write the call, not after
it fails.

### Q5 · Timezone and date discipline

All `DateTime` in the DB is UTC. All display is Asia/Kolkata. Never build a date from a
string without a timezone. Mandi arrival dates are *dates*, not instants — an off-by-one
day on a price series makes your MASE quietly wrong and your chart quietly lying.

### Q6 · Nothing hardcoded that a judge might ask about

Thresholds (`WINDOW_NO_ADVICE_BAND_BPS`, `WINDOW_MIN_GAIN_PAISE_PER_QTL`,
`WINDOW_DEFAULT_RHO`) come from env, read in one place. Cost rates come from the
`CostTable` table, with a comment citing where the number came from. When a judge asks
"where did ₹4/quintal/km come from?" — the answer is a table row and a citation, not a
magic number in a function.

### Q7 · Never claim a number you have not measured

- MASE is measured against seasonal-naive on a held-out period, or it is not shown.
- Coverage is the empirical fraction of actuals inside p10–p90, or it is not shown.
- The ₹/quintal gain on the winning slide comes from `realisation_ledger`, computed as
  realised minus benchmark, or it does not go on the slide.
- Fixture numbers in `@mandi/contracts/fixtures` are illustrative. **Never put a fixture
  number on a slide.** They were written by hand to make screens look right.

An unverifiable claim is the one thing a domain-expert judge is guaranteed to test, and
"we measured it and it's 0.91, which is a 9% improvement over seasonal-naive, here's the
backtest" beats "95% accurate" by a distance.

### Q8 · Definition of done (from `CLAUDE.md` §10 — all eight, every task)

1. Types check (`npm run typecheck`)
2. Lint clean
3. Zod validation on every new boundary
4. Every read scoped to the actor
5. Unit test for any non-trivial pure logic
6. Marathi string present for any farmer-facing text
7. Empty / loading / error states exist
8. `npm run verify` green, committed, pushed

---

## PART C — THE H58 SECURITY PASS (R1 runs this personally, ~90 minutes)

Tick every line. Do not delegate; do not skim.

```
AUTH
[ ] Every route under app/api (except auth/otp/*, ref/*) calls guard()
[ ] guard() reads the actor from the cookie only — grep for body.farmerId / body.buyerId
[ ] JWT is httpOnly + secure + sameSite=lax; not readable from document.cookie
[ ] Session expiry is enforced server-side, not just in the cookie max-age
[ ] OTP: single-use, 5-min expiry, 5-attempt cap, invalidated on success
[ ] DEV_OTP_ECHO is false in the production env AND gated on NODE_ENV in code

AUTHORISATION
[ ] Every findUnique/findFirst/findMany on user data has the owner in `where`
[ ] Nested reads check the whole ownership chain, not just the leaf
[ ] Role checks on every mutating route; a farmer cannot call a buyer route
[ ] Unauthorised reads return 404, not 403
[ ] Tx transitions verify the actor is a party to that transaction

INPUT
[ ] Zero `as any` in apps/web/src and apps/web/app
[ ] Every route body parsed with a contracts schema
[ ] Numeric bounds on qtyKg, rho, storageDaysAvailable, horizonDays, prices
[ ] No string interpolation into $queryRaw anywhere (grep $queryRaw)

DATA
[ ] No Aadhaar field anywhere (grep -i aadhaar)
[ ] No phone / OTP / full-payload logging (grep console.log)
[ ] Ledger + audit have no update/delete call sites (grep ledger.update, audit.delete)
[ ] Synthetic rows are chip-labelled in the UI wherever they surface
[ ] Money fields are all Int; grep for Float/Decimal in schema.prisma

OPERATIONAL
[ ] .env is gitignored and absent from git log -p
[ ] ML service requires x-ml-key and is not publicly routable
[ ] Rate limits live on both OTP endpoints
[ ] No stack traces or internal error text in any production response
[ ] npm run verify green on main
[ ] Deployed URL tested on a real phone over mobile data
```

---

## PART D — Prepared answers for the hostile questions

Have these ready. Confidence on these three is worth more than a sixth feature.

**"How do I know your forecast is any good?"**
> We report MASE against a seasonal-naive baseline on a held-out period, and empirical
> coverage of the p10–p90 band. Both are on the model card in the UI, on every forecast.
> When the band is too wide to act on, the system returns NO_ADVICE rather than a number —
> here, let me show you. [demo the refusal]

**"Why not blockchain?"**
> We need tamper-evidence and audit, which a hash-chained append-only ledger gives us at
> zero infrastructure cost and with a verify endpoint I can run for you now. We do not
> need decentralised consensus — the APMC is already the trusted authority. Blockchain
> would add cost and latency to buy a property we don't need.

**"Is this real data?"**
> Historical prices are a real Agmarknet/MSAMB pull for these commodities and markets,
> ingested offline and seeded so the demo is reproducible and does not depend on
> conference wifi. Any imputed or synthetic row is labelled in the UI — you'll see the
> grey chip. Production ingests nightly.
