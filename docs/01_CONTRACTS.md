# CONTRACTS & API SURFACE
**Source of truth is `packages/contracts/src/index.ts`. This file is the map, not the law.**
When the two disagree, the Zod schema wins and this file is wrong — fix it in the same commit.

> **Frozen at H4.** After H4, changes go: `docs/BLOCKERS.md` → R1 edits → R1 announces →
> everyone rebases. Never edit `index.ts` or `schema.prisma` yourself unless you are R1.
> R2 mirrors any ML-contract change in `services/ml/app/contracts.py` in the same window.

---

## 1. Conventions you must not violate

| Rule | Detail |
|---|---|
| Money | integer **paise**, field names end `Paise` (`pricePaisePerQtl`, `totalPaise`) |
| Quantity | integer **kilograms**, field names end `Kg` (`qtyKg`). 1 quintal = 100 kg |
| Rates / shares | **basis points**, names end `Bps` (`spoilageBpsPerDay`, `sellNowBps`). 10000 bps = 100% |
| Dates | ISO `YYYY-MM-DD` for calendar days; ISO-8601 UTC instants for timestamps |
| Ids | cuid strings. Never expose a numeric autoincrement |
| Errors | always `{ error: { code, message, fields? } }`. `code` is stable and machine-readable |
| Bilingual | any farmer-facing string ships as both `x` (English) and `xMr` (Marathi) |
| DTOs | routes return DTOs from contracts, never raw Prisma models |

Helpers, from `@mandi/contracts` — use these, do not re-derive:
```ts
PAISE_PER_RUPEE = 100
KG_PER_QUINTAL  = 100
totalPaise(qtyKg, pricePaisePerQtl): number     // rounds once, correctly
formatPaise(paise, { paisa? }): string          // "₹1,24,500" — the ONLY ₹ formatter
formatQty(qtyKg, 'mr' | 'en'): string           // "12 क्विंटल" / "12 quintal"
IdemHeader = 'x-idempotency-key'
```

---

## 2. Route table

Legend — **A**: auth required · **Idem**: requires `x-idempotency-key` · **Own**: owner

### Auth & reference — R1

| Method | Path | A | Body → Response | Notes |
|---|---|---|---|---|
| POST | `/api/auth/otp/request` | – | `OtpRequestBody` → `{ sent: true, devCode? }` | rate-limited 3/phone/10min; `devCode` only when `DEV_OTP_ECHO` **and** non-prod |
| POST | `/api/auth/otp/verify` | – | `OtpVerifyBody` → `SessionUser` | sets httpOnly JWT; single-use code; 5-attempt cap |
| POST | `/api/auth/logout` | ✓ | – → `{ ok: true }` | clears cookie |
| GET | `/api/auth/me` | ✓ | – → `SessionUser` | 401 when no session |
| GET | `/api/ref/markets` | – | `?districtId&commodityKey` → `MarketDto[]` | |
| GET | `/api/ref/commodities` | – | – → `CommodityDto[]` | |

### Prices, forecast, window — R2

| Method | Path | A | Body/Query → Response | Notes |
|---|---|---|---|---|
| GET | `/api/prices/series` | ✓ | `?commodityKey&marketId&days` → `SeriesRes` | `hasSynthetic` + `completeness` must be honoured by the UI (I6) |
| GET | `/api/prices/nearby` | ✓ | `?commodityKey&districtId` → `NearbyPrice[]` | `netPaisePerQtl` is **net of transport** — that is the point |
| GET | `/api/forecast` | ✓ | `?commodityKey&marketId&horizonDays` → `ForecastRes` | `card` is mandatory, never null |
| **POST** | **`/api/window/recommend`** | ✓ | `WindowBody` → `WindowRecommendation` | **THE HERO.** Must be able to return `NO_ADVICE` (I4). Degrades to `NO_ADVICE` if ML is down, never 500 |

`WindowBody` accepts either a `lotId` (server loads qty/harvest date) or an explicit
`{ commodityKey, qtyKg, harvestDate }`. `rho` defaults to `WINDOW_DEFAULT_RHO` (0.35).
It also accepts optional `cashNeedPaise` + `cashNeedBy` — the farmer's cash deadline.
Omitted means no pressing need; set means a hold that outlasts `cashNeedBy` must either
carry a `pledgeQuote` or fall back to `SPLIT`.

**The five actions, and what each obliges the response to contain:**

| `action` | Meaning | Required in the same response |
|---|---|---|
| `SELL_NOW` | Sell today at the home mandi | `expectedGain*` may be ≤ 0 — that is a valid reason to sell |
| `SELL_ELSEWHERE` | Sell **today**, at a different mandi | `bestMarket.marketId ≠` home mandi, and `bestMarket.netPaisePerQtl` is net of transport. Emit when the best net market today is not home *and* the hold gain is below threshold — spatial arbitrage before temporal. |
| `HOLD` | Wait `holdDays` | `costs` fully itemised; `worstCase*` populated; `pledgeQuote` non-null **iff** the farmer declared a cash need this hold violates and the gain covers the interest |
| `SPLIT` | Sell part today, hold the rest | `splitPlan.sellNowBps + splitPlan.holdBps === 10000`, and a reason string naming the rupee amount being freed up today |
| `NO_ADVICE` | Refuse | `refusalReason` non-null, `expectedGainPaisePerQtl === 0`, `holdDays === 0` |

**Two fields are required on every action, including `NO_ADVICE`:**
- `worstCasePaisePerQtl` / `worstCaseTotalPaise` — net outcome at the **p10** price, after
  costs. Usually negative. R4 renders it with the same visual weight as the expected gain.
  A recommendation that hides its downside is not informed consent.
- `card` — the `ModelCard`. Never null, never fabricated.

`pledgeQuote` is a **required key with a nullable value** — always present in the JSON,
`null` whenever there is no quote. The guardrail lives in code, not the UI: emit a quote
only when `expectedGainTotalPaise > interestPaise`, otherwise `null` plus the reason
*"Waiting does not cover the cost of borrowing, so we did not offer a loan."*

**Where the pledge quote is computed:** TypeScript, not Python. It is deterministic
arithmetic over seeded `Warehouse` + `CostTable` rows with no model input, so `costs.ts`
computes it and `window.ts` decides whether to emit it. The ML service always returns
`pledgeQuote: null`. Label it **"Simulated quote, indicative rate"** in the UI — no lender
is integrated, and we say that on the slide before anyone asks.

### Lots, grading, pooling — R3

| Method | Path | A | Body → Response | Notes |
|---|---|---|---|---|
| POST | `/api/lots` | ✓ F | `LotCreateBody` → `LotDto` | |
| GET | `/api/lots` | ✓ | `?status` → `LotDto[]` | scoped to the actor's farmer/FPO |
| GET | `/api/lots/:id` | ✓ | – → `LotDto` | 404 if not owned (S1) |
| POST | `/api/lots/:id/assay` | ✓ F | `GradeDims` → `AssayDto` | 6 farmer-answerable questions only; may `abstain` |
| POST | `/api/lots/:id/list` | ✓ F | – → `LotDto` | FSM: `DRAFT → LISTED` |
| POST | `/api/pools` | ✓ | `PoolCreateBody` → `PoolDto` | starts `CONSENT_PENDING` |
| GET | `/api/pools/:id` | ✓ | – → `PoolDto` | includes `splits[]` with auditable `weight` and `vsSoloPaise` |
| POST | `/api/pools/:id/consent` | ✓ F | `ConsentBody` → `PoolDto` | **cannot leave `CONSENT_PENDING` until all members consent** (S12) |

### Demand, matching, offers — R3 (buyer-facing screens by R5)

| Method | Path | A | Body → Response | Notes |
|---|---|---|---|---|
| POST | `/api/demand` | ✓ B | `DemandCreateBody` → `DemandDto` | |
| GET | `/api/demand` | ✓ | – → `DemandDto[]` | buyer sees own; farmer sees open |
| GET | `/api/match` | ✓ | `?lotId` or `?demandId` → `MatchRow[]` | every row carries score `components` **and** a `why` sentence — an unexplained score is not shippable |
| POST | `/api/offers` | ✓ B | `OfferCreateBody` → `OfferDto` | Idem |
| GET | `/api/offers` | ✓ | `?lotId&status` → `OfferDto[]` | |
| POST | `/api/offers/:id/accept` | ✓ F | – → `TxDto` | **Idem.** Creates the transaction |
| POST | `/api/offers/:id/reject` | ✓ F | `{ reason? }` → `OfferDto` | |

`OfferDto` carries `vsReservePaisePerQtl` and `vsMandiPaisePerQtl` — the farmer must see
an offer in context, never as a bare number.

### Settlement, ledger, disputes — R3

| Method | Path | A | Body → Response | Notes |
|---|---|---|---|---|
| GET | `/api/tx/:id` | ✓ | – → `TxDto` | party-only; includes the event timeline |
| POST | `/api/tx/:id/transition` | ✓ | `TransitionBody` → `TxDto` | **Idem.** Only path to change status. Goes through `escrow.ts` (S9) |
| GET | `/api/ledger` | ✓ | `?farmerId?` → `LedgerRes` | `totals.gPaisePerQtl` is **measured**, never asserted |
| GET | `/api/ledger/verify` | ✓ | – → `ChainVerifyRes` | walks the hash chain, returns the first break |
| POST | `/api/disputes` | ✓ | `DisputeCreateBody` → `DisputeDto` | sets `respondBy` |
| POST | `/api/disputes/:id/respond` | ✓ | `DisputeRespondBody` → `DisputeDto` | asymmetry guard: silence past `respondBy` decides against the silent party |

**The escrow FSM** — the only legal transitions:
```
AGREED ──▶ ESCROW_FUNDED ──▶ IN_TRANSIT ──▶ DELIVERED ──▶ QC_PASSED ──▶ RELEASED
   │              │               │              │             │
   └──▶ CANCELLED └──▶ REFUNDED   └──▶ DISPUTED ◀┘             └──▶ DISPUTED
                                        │
                                        ├──▶ RELEASED   (resolved for farmer)
                                        └──▶ REFUNDED   (resolved for buyer)
```
RELEASED, REFUNDED and CANCELLED are terminal. Every transition writes an `EscrowEvent`
and an `AuditLog` row in the same transaction. `RELEASED` also appends the
`RealisationLedger` row — that is where `gPaisePerQtl` comes from.

### Admin — R5

| Method | Path | A | Response | Notes |
|---|---|---|---|---|
| GET | `/api/admin/data-quality` | ✓ ADMIN | coverage per market/commodity, `%` synthetic, staleness | this screen is what makes I6 credible to a judge |

### ML service (internal, `x-ml-key` required) — R2

| Method | Path | Body → Response |
|---|---|---|
| GET | `/health` | → `MlHealthRes` |
| POST | `/forecast` | `MlForecastBody` → `MlForecastRes` |
| POST | `/window` | `MlWindowBody` → `WindowRecommendation` |

Never world-callable, even in the demo — it is an unauthenticated compute endpoint
otherwise. Next.js calls it with a 3s timeout and a defined fallback (Q4).

---

## 3. Building before the endpoints exist

R4 and R5 must not wait for R2/R3. `@mandi/contracts/fixtures` exports contract-shaped
data for every DTO:

```ts
import { fxWindowHold, fxWindowRefuse, fxSeries, fxLot, fxPool, fxLedger }
  from '@mandi/contracts/fixtures';
```

Two rules:
- **`fxWindowRefuse` is a required screen, not an edge case.** R4 designs the NO_ADVICE
  state deliberately — it is our best demo moment (I4).
- **Never put a fixture number on a slide.** They are illustrative, written by hand to
  make layouts look right. Real numbers come from the seeded DB and the measured ledger.

When the endpoint lands, swap the fixture and delete the `TODO(R…)` comment.
