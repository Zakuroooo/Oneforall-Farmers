# 03 · Demo Script and Seed Specification

> **Owner: R5.** Draft frozen at **H4** with the contract. Everyone builds toward the exact
> numbers in this file. Changes after H20 go through `docs/BLOCKERS.md` like a contract change,
> because a screen someone built to match beat 4 is not free to re-render.
>
> This file exists because of a specific failure: five people building in parallel toward a
> *vague* demo produce five screens that each work and do not compose. A frozen click path
> with frozen numbers turns "make the window screen good" into "make **this** screen show
> **these** numbers", which is a task you can finish and verify.

---

## 1. The three rules that shape everything below

1. **Wifi is off, visibly.** Every number comes from seeded Postgres. No external call at
   demo time, ever (I5). Turn the wifi off *on stage*, and say why — it reads as confidence,
   and it also means the venue cannot embarrass you.
2. **Nothing is typed.** Typing on stage is where demos die: a typo, a slow keyboard, a lost
   session. Everything is pre-seeded and reachable by tapping. The one exception is the
   tamper demo (beat 9), where typing is the point.
3. **Two people.** One drives and never speaks; one speaks and never touches the machine.
   Rehearsed 3× with a stopwatch (T5.14). A third person has the fallback video open on a
   second machine, one keystroke from playing.

---

## 2. The click path — 7 minutes, frozen

Numbers in **bold** are contractual: they must appear on screen exactly as written, from the
seed, after `npm run db:reset`. If a number here is impossible once real data lands, change
*this file* at the next sync and tell everyone — do not let the screen and the script drift.

| # | t | Beat | Screen | The line | Who |
|---|---|---|---|---|---|
| 1 | 0:00 | **The number** | slide | "Lasalgaon, onion. **₹800** a quintal in February. **₹2,400** in April. Ramesh sold in February. Not because he didn't know — because he had a loan due on Friday." | Narrator |
| 2 | 0:40 | **The diagnosis** | slide | "Every product built for this problem shows farmers prices. Farmers already suspect prices will rise. The binding constraint is not information — it's **the ability to wait**. So we didn't build a price dashboard. We built a waiting product." | Narrator |
| 3 | 1:10 | Marathi, on a cheap phone | farmer login → home | "Marathi first, not Marathi optional. 360 px, ₹6,000 phone, 3G. Everything he needs is in the thumb zone." | Driver |
| 4 | 1:40 | **Net, not gross** | prices | "Other apps show the mandi price. A mandi 60 km away quoting ₹50 more is a **loss** once the truck is paid. We sort by net of transport. That reordering is the whole screen." | Driver |
| 5 | 2:10 | The forecast, with its band | forecast | "p10, p50, p90 — never a single number. And the model card: **MASE 0.91** against seasonal-naive, coverage **78%**, trained on N rows to <date>. We show you how good it is before we advise you." | Driver |
| 6 | 2:50 | **★ THE HERO** | window | "12 quintals. **Hold 11 days: +₹1,428** — after storage, spoilage and interest, all itemised. And right next to it, same size: **worst case −₹480.** Every other forecast app shows you the upside. His decision, made with both numbers." *(tap Listen — let the Marathi play, don't talk over it)* | Driver |
| 7 | 3:40 | **★ THE MOMENT** | window → pledge card | "But he has a loan due Friday. This is where every advice app fails. **Tap GET MONEY TODAY.** WDRA warehouse at Lasalgaon, e-NWR receipt, **₹34,000 today**, interest **₹370**, repaid from the sale. He gets the cash *and* keeps the upside. We pay him to wait." *(pause — 3 seconds, say nothing)* "This is a simulated quote. No lender is connected yet. And the guardrail is in the code: if the interest ever exceeds the expected gain, we don't offer the loan at all. A system that always offers you credit is a moneylender." | Narrator |
| 8 | 4:30 | **★ THE REFUSAL** | window (Sunita, tomato) | "Now Sunita. Tomato, not storable, band ±28%. **`NO_ADVICE`** — with a written reason. We'd rather return nothing than a number she'd bet her season on. This is the feature we're proudest of." | Driver |
| 9 | 5:05 | He couldn't wait — now he can, two ways | pool consent → offer → escrow → released | "Three smallholders, one truck. Grade-weighted split, **each sees +₹2,800 vs selling alone**, each consents **before** the sale — not after. Then: match with a stated reason, buyer reliability including **renegotiation rate**, offer, accept, escrow funded before dispatch, released on QC." | Driver |
| 10 | 6:00 | **The measured claim** | ledger → verify | "**214 transactions. +₹187 per quintal**, measured against what he'd have got at his own mandi on harvest day — the hardest baseline for us to beat. Append-only, hash-chained." *(now type: edit one row in Prisma Studio, hit Verify)* "**Chain breaks at seq 41.** That's tamper-evidence. It's also why we didn't need a blockchain." | Driver |
| 11 | 6:40 | Our own gaps | admin/data-quality | "Coverage per mandi. **8% imputed**, labelled in the UI wherever it appears. We show you our own data quality — you don't have to ask." | Driver |
| 12 | 7:00 | Close | one honest slide | "Real: prices, forecast, ledger, escrow. Simulated: the lender, and the SMS gateway. Roadmap: IVR, live e-NWR, ONDC — named, not claimed. Ramesh's onions were worth ₹1,428 more than he got for them. That's the product." | Narrator |

**Beat 7 is the pitch.** If you are over time, cut beat 9's buyer console and beat 11 — never
6, 7, 8 or 10.

---

## 3. Seed specification

Everything deterministic. Seeded PRNG (T5.2), a fixed `SEED_TODAY`, no `Math.random()`, no
`new Date()` in generated history. Acceptance: `npm run db:reset` twice → the ledger total is
byte-identical. If it is not, stop and fix it before building anything else, because the
number on your slide will not match the screen at demo time.

### 3.1 Volumes

| Entity | Count | Notes |
|---|---|---|
| District | 7 | Nashik, Pune, Ahmednagar, Solapur, Jalgaon, Chh. Sambhajinagar, Nagpur |
| Market | 8–10 | Real APMC names + Marathi + lat/lon + eNAM flag. Lasalgaon mandatory. |
| Commodity | 6 | Onion, Tomato, Soybean, Tur, Cotton, Grapes — each with `shelfLifeDays`, `spoilageBpsPerDay` |
| **Warehouse** | **3–5** | **≥2 with `isWdra = true`**, Nashik belt, from the WDRA registry. Beat 7 dies without these. |
| PriceObs | 3–4 years × ≥5 mandis | R2's `seed_prices.csv`, `source` preserved exactly |
| Farmer | ~40 | Median holding ~1.5 ha. Do not seed a district of 20-acre farmers. |
| Fpo | 3 | 8–15 members each |
| Buyer | ~12 | Tiers T0–T3, spread on `reliability` and `medianPayoutDays` **and `renegotiationBps`** |
| Transaction + ledger row | ~200 | 6 months, chain valid end to end |

### 3.2 The two personas — these are acceptance criteria, not flavour

| | **Ramesh Pawar** (रमेश पवार) | **Sunita Shinde** (सुनिता शिंदे) |
|---|---|---|
| Crop / market | Onion, Lasalgaon | Tomato, Nashik |
| Lot | **12 qtl** (`qtyKg = 1200`), A grade | 8 qtl (`qtyKg = 800`) |
| Cash need | **declared, before the hold ends** | none |
| Required verdict | **`HOLD` ~11 days, +₹1,428 total, worst case −₹480, `pledgeQuote` non-null** | **`NO_ADVICE` with a written `refusalReason`** |
| Why he/she exists | gives the judges the product | gives the judges a reason to trust it |

Sunita's refusal must come from her **actual band width**, never a flag. Re-verify both after
every `db:reset`: if Sunita ever returns a confident HOLD, either the seed drifted or the
threshold is wrong, and you have lost beat 8.

### 3.3 Ledger consistency — a judge will click one row

- `realisedPaisePerQtl` equals the transaction's agreed price.
- That price is plausible against the `PriceObs` modal for that market **on that date**. A
  realised ₹3,200 on a day the modal was ₹1,900 is not a success story, it is a bug.
- `benchmarkPaisePerQtl` is the actual same-day modal, and `baselineMethod` says which
  counterfactual it is.
- `deltaPaise` computed by subtraction, never supplied.
- **Roughly 15–20% of rows are negative.** A ledger where every farmer won is obviously
  fabricated, and seeding real losses is what makes the +₹187 average believable.
- The hash chain verifies from `seq = 1` to the end before you touch anything.

### 3.4 Honesty in the seed

Anything generated is `source = 'SYNTHETIC'` and carries the badge in the UI (I6). Storage
and finance rates are labelled **indicative** with a source comment on the row. No Aadhaar
numbers anywhere, not even fake ones (I8) — phone is the identifier.

---

## 4. Rehearsal checklist (H66)

- [ ] Wifi off. Full path, 3×, stopwatch. Under 7:00 each time.
- [ ] Driver + backup driver both know every tap.
- [ ] Fallback video open on a second machine, one keystroke away.
- [ ] `npm run db:reset` run immediately before, and both personas re-verified.
- [ ] Every number in §2 checked against the actual screen.
- [ ] Marathi audio audible in the room — test the volume in the actual room.
- [ ] Prisma Studio already open on the ledger table for beat 10.
- [ ] Phone charged, screen mirroring tested, brightness at max.
