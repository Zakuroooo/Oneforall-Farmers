/**
 * @mandi/contracts — the frozen interface between all five roles.
 * OWNER: R1 ONLY. Frozen at H4.
 *
 * Every API route parses its input with a schema from this file, and every client
 * types its response from this file. If it is not here, it is not a contract, and
 * two roles will build incompatible halves of it.
 *
 * Change protocol: docs/BLOCKERS.md, tag CONTRACT, R1 approves. Additive optional
 * fields are cheap. Renames are expensive. Prefer adding.
 */
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Integer paise. Never a float, never rupees. See CLAUDE.md I1. */
export const Paise = z.number().int();
/** Integer kilograms. 1 quintal = 100 kg. */
export const Kg = z.number().int().positive();
export const Bps = z.number().int().min(0);
export const Cuid = z.string().min(20);
/** ISO date, no time component: '2026-09-04'. */
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
/** Indian mobile, 10 digits, no country code, no spaces. */
export const Phone = z.string().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number');

export const Locale = z.enum(['mr', 'en']);
export const UserRole = z.enum(['FARMER', 'BUYER', 'FPO_ADMIN', 'ADMIN']);
export const Grade = z.enum(['A', 'B', 'C', 'UNGRADED']);
export const ObsSource = z.enum(['AGMARKNET', 'MSAMB', 'IMPUTED', 'SYNTHETIC']);
/**
 * SELL_ELSEWHERE = sell today, but at a different mandi than the farmer's default.
 * The PS says "nearby markets" verbatim — spatial arbitrage must be a first-class answer,
 * not a footnote under SELL_NOW.
 */
export const WindowAction = z.enum(['SELL_NOW', 'SELL_ELSEWHERE', 'HOLD', 'SPLIT', 'NO_ADVICE']);
export const Confidence = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export const BuyerTier = z.enum(['T0_UNVERIFIED', 'T1_REGISTERED', 'T2_TRANSACTED', 'T3_TRUSTED']);
export const LotStatus = z.enum([
  'DRAFT', 'LISTED', 'POOLED', 'OFFER_PENDING', 'COMMITTED', 'DELIVERED', 'SETTLED', 'WITHDRAWN',
]);
export const TxStatus = z.enum([
  'AGREED', 'ESCROW_FUNDED', 'IN_TRANSIT', 'DELIVERED', 'QC_PASSED',
  'RELEASED', 'DISPUTED', 'REFUNDED', 'CANCELLED',
]);
export const OfferStatus = z.enum(['OPEN', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED', 'WITHDRAWN']);
export const DisputeStage = z.enum([
  'RAISED', 'BUYER_RESPONDED', 'EVIDENCE_REVIEW',
  'RESOLVED_SELLER', 'RESOLVED_BUYER', 'RESOLVED_SPLIT', 'ESCALATED',
]);

/** Uniform error envelope. Every non-2xx response is exactly this shape. */
export const ApiError = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    /** Field-level detail from Zod, when the failure was validation. */
    fields: z.record(z.string(), z.string()).optional(),
  }),
});
export type ApiError = z.infer<typeof ApiError>;

// ─────────────────────────────────────────────────────────────────────────────
// Money — the only sanctioned conversions
// ─────────────────────────────────────────────────────────────────────────────

export const PAISE_PER_RUPEE = 100;
export const KG_PER_QUINTAL = 100;

/** Total paise for a quantity at a per-quintal price. Integer in, integer out. */
export function totalPaise(qtyKg: number, pricePaisePerQtl: number): number {
  return Math.round((qtyKg * pricePaisePerQtl) / KG_PER_QUINTAL);
}

/** Display only. '₹2,45,000' — Indian grouping. Never feed the result back into maths. */
export function formatPaise(paise: number, opts?: { paisa?: boolean }): string {
  const neg = paise < 0;
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / PAISE_PER_RUPEE);
  const rem = abs % PAISE_PER_RUPEE;
  const s = rupees.toLocaleString('en-IN');
  const tail = opts?.paisa ? `.${String(rem).padStart(2, '0')}` : '';
  return `${neg ? '-' : ''}₹${s}${tail}`;
}

/** '12.5 क्विंटल' / '12.5 quintal' — display only. */
export function formatQty(qtyKg: number, locale: 'mr' | 'en' = 'en'): string {
  const q = (qtyKg / KG_PER_QUINTAL).toFixed(qtyKg % KG_PER_QUINTAL === 0 ? 0 : 1);
  return `${q} ${locale === 'mr' ? 'क्विंटल' : 'quintal'}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH  (R1)   /api/auth/*
// ─────────────────────────────────────────────────────────────────────────────

export const OtpRequestBody = z.object({ phone: Phone });
export const OtpRequestRes = z.object({
  ok: z.literal(true),
  /** Present only when NODE_ENV !== 'production'. Never rendered in a screenshot. */
  devOtp: z.string().optional(),
});

export const OtpVerifyBody = z.object({ phone: Phone, otp: z.string().length(6) });

export const SessionUser = z.object({
  id: Cuid,
  phone: Phone,
  name: z.string(),
  role: UserRole,
  locale: Locale,
  farmerId: Cuid.nullable(),
  buyerId: Cuid.nullable(),
  districtId: Cuid.nullable(),
  districtName: z.string().nullable(),
});
export type SessionUser = z.infer<typeof SessionUser>;

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE  (R1)   /api/markets, /api/commodities
// ─────────────────────────────────────────────────────────────────────────────

export const MarketDto = z.object({
  id: Cuid, name: z.string(), nameMr: z.string(),
  districtId: Cuid, districtName: z.string(),
  lat: z.number(), lon: z.number(), isEnam: z.boolean(),
  distanceKm: z.number().nullable(),
});
export type MarketDto = z.infer<typeof MarketDto>;

export const CommodityDto = z.object({
  id: Cuid, name: z.string(), nameMr: z.string(), group: z.string(),
  shelfLifeDays: z.number().int(), spoilageBpsPerDay: z.number().int(),
});
export type CommodityDto = z.infer<typeof CommodityDto>;

// ─────────────────────────────────────────────────────────────────────────────
// PRICE INTELLIGENCE  (R2)   /api/prices/*, /api/window/recommend
// ─────────────────────────────────────────────────────────────────────────────

export const PricePoint = z.object({
  date: IsoDate,
  minPaisePerQtl: Paise,
  maxPaisePerQtl: Paise,
  modalPaisePerQtl: Paise,
  arrivalKg: z.number().int().nullable(),
  source: ObsSource,
});
export type PricePoint = z.infer<typeof PricePoint>;

export const SeriesQuery = z.object({
  commodityId: Cuid, marketId: Cuid,
  from: IsoDate.optional(), to: IsoDate.optional(),
});

export const SeriesRes = z.object({
  commodity: CommodityDto,
  market: MarketDto,
  points: z.array(PricePoint),
  /** True if ANY point in the window is SYNTHETIC. Drives the UI badge (I6). */
  hasSynthetic: z.boolean(),
  /** Share of days in the window with a real observation, 0-1. Honesty metric. */
  completeness: z.number().min(0).max(1),
});
export type SeriesRes = z.infer<typeof SeriesRes>;

/** Today's price at each mandi within reach, already net of transport. */
export const NearbyPrice = z.object({
  market: MarketDto,
  obsDate: IsoDate,
  modalPaisePerQtl: Paise,
  /** modal - transport cost to reach that mandi. This is what the farmer actually gets. */
  netPaisePerQtl: Paise,
  transportPaisePerQtl: Paise,
  source: ObsSource,
  /** Rank 1 = best net price. */
  rank: z.number().int().positive(),
});
export type NearbyPrice = z.infer<typeof NearbyPrice>;

export const NearbyRes = z.object({
  points: z.array(NearbyPrice),
  bestMarketId: Cuid.nullable(),
  /** Net gain in paise/qtl from choosing rank 1 over the nearest mandi. */
  spreadPaisePerQtl: Paise,
});

export const ForecastPoint = z.object({
  date: IsoDate,
  horizonDays: z.number().int(),
  p10PaisePerQtl: Paise,
  p50PaisePerQtl: Paise,
  p90PaisePerQtl: Paise,
});
export type ForecastPoint = z.infer<typeof ForecastPoint>;

/** The model card. Shown in the UI, verbatim. If we cannot fill it, we do not ship it. */
export const ModelCard = z.object({
  model: z.string(),
  trainedAt: z.string(),
  /** Mean absolute scaled error vs seasonal-naive on the holdout. < 1.0 means we beat naive. */
  mase: z.number().nullable(),
  /** Empirical coverage of the p10-p90 band on the holdout, 0-1. Target ~0.80. */
  coverage: z.number().nullable(),
  /** Number of historical observations the fit used. */
  trainRows: z.number().int(),
  /** Human-readable caveat, shown under the chart. */
  caveat: z.string(),
});
export type ModelCard = z.infer<typeof ModelCard>;

export const ForecastRes = z.object({
  points: z.array(ForecastPoint),
  card: ModelCard,
  hasSynthetic: z.boolean(),
});
export type ForecastRes = z.infer<typeof ForecastRes>;

// ── The hero endpoint ────────────────────────────────────────────────────────

export const WindowBody = z.object({
  commodityId: Cuid,
  /** The mandi the farmer would sell at today. */
  marketId: Cuid,
  qtyKg: Kg,
  harvestDate: IsoDate,
  /** How many more days the farmer can physically hold. 0 = must sell today. */
  storageDaysAvailable: z.number().int().min(0).max(120),
  /** True if the holding location is cold storage. */
  cold: z.boolean().default(false),
  /**
   * Risk preference. 0 = maximise expected value, ignore variance.
   * 1 = strongly prefer certainty. Default 0.35 — a smallholder is not risk-neutral.
   */
  rho: z.number().min(0).max(1).default(0.35),
  /**
   * Cash the farmer must have in hand, and by when. This is the thesis: "we pay them to
   * wait". When set and the recommended hold outlasts cashNeedBy, the optimiser must
   * either attach a pledgeQuote or fall back to SPLIT. Omitted = no pressing need.
   */
  cashNeedPaise: Paise.nonnegative().optional(),
  cashNeedBy: IsoDate.optional(),
});
export type WindowBody = z.infer<typeof WindowBody>;

/**
 * A pledge-finance quote against a warehouse receipt. Pure arithmetic over the seeded
 * Warehouse + CostTable rows — no lender API in the 3-day window, and we say so.
 * GUARDRAIL (playbook Ch 13): a quote is only ever emitted when
 * expectedGainTotalPaise > interestPaise. Enforced in the optimiser, not in the UI.
 */
export const PledgeQuote = z.object({
  warehouseId: Cuid,
  warehouseName: z.string(),
  warehouseNameMr: z.string(),
  distanceKm: z.number(),
  isWdra: z.boolean(),
  /** Loan-to-value in bps, e.g. 7000 = 70% of p10 lot value. Conservative by design. */
  ltvBps: Bps,
  advancePaise: Paise,
  rateBpsPerAnnum: Bps,
  tenorDays: z.number().int().positive(),
  interestPaise: Paise,
  /** advance - interest - storage for tenor. What actually lands in the account today. */
  netCashTodayPaise: Paise,
  /** True iff netCashTodayPaise >= cashNeedPaise. */
  coversNeed: z.boolean(),
  repaymentMode: z.literal('AUTO_FROM_PROCEEDS'),
});
export type PledgeQuote = z.infer<typeof PledgeQuote>;

export const CostBreakdown = z.object({
  storagePaise: Paise,
  transportPaise: Paise,
  /** Value of expected mass loss over the hold period. */
  spoilagePaise: Paise,
  /** Interest on a pledge advance, if the farmer needs cash to wait. */
  financePaise: Paise,
  totalPaise: Paise,
});

export const WindowRecommendation = z.object({
  action: WindowAction,
  /** Days to wait. 0 for SELL_NOW and NO_ADVICE. */
  holdDays: z.number().int().min(0),
  /** Net of all costs in `costs`. Can be negative — that is a valid SELL_NOW reason. */
  expectedGainPaisePerQtl: Paise,
  expectedGainTotalPaise: Paise,
  /**
   * The honest downside: net gain at the p10 price, after costs. Usually negative.
   * The UI MUST render this with the same visual weight as expectedGain (playbook Ch 09).
   * A recommendation that hides its worst case is not informed consent.
   */
  worstCasePaisePerQtl: Paise,
  worstCaseTotalPaise: Paise,
  confidence: Confidence,
  /** (p90-p10)/p50 at the recommended horizon, in bps. Drives NO_ADVICE. */
  bandBps: Bps,
  /**
   * Set when action is HOLD or SPLIT and the farmer declared a cash need the hold
   * would violate. Null otherwise. The "GET MONEY TODAY" card renders from this.
   */
  pledgeQuote: PledgeQuote.nullable(),
  /** Present only when action === 'SPLIT'. Shares sum to 10000. */
  splitPlan: z.object({ sellNowBps: Bps, holdBps: Bps }).nullable(),
  costs: CostBreakdown,
  todayNetPaisePerQtl: Paise,
  expectedNetPaisePerQtl: Paise,
  bestMarket: z.object({
    marketId: Cuid, name: z.string(), nameMr: z.string(),
    distanceKm: z.number(), netPaisePerQtl: Paise,
  }),
  /** Ordered, plain-language. Rendered as bullets. Both locales always present. */
  reasons: z.array(z.string()),
  reasonsMr: z.array(z.string()),
  /** Set iff action === 'NO_ADVICE'. Shown prominently, not hidden. (I4) */
  refusalReason: z.string().nullable(),
  card: ModelCard,
  /** Persisted Recommendation.id, so we can later measure whether we were right. */
  recommendationId: Cuid.nullable(),
});
export type WindowRecommendation = z.infer<typeof WindowRecommendation>;

// ─────────────────────────────────────────────────────────────────────────────
// LOTS + GRADING  (R3)
// ─────────────────────────────────────────────────────────────────────────────

/** Raw, farmer-answerable inputs. No lab equipment, no jargon. */
export const GradeDims = z.object({
  /** Average size in mm. Onion: 35-70 typical. */
  sizeMm: z.number().int().min(1).max(300).optional(),
  moisturePct: z.number().min(0).max(60).optional(),
  /** Visible rot / damage, percent by eye. */
  rotPct: z.number().min(0).max(100).optional(),
  /** Foreign matter — soil, stones, leaves — percent by eye. */
  foreignPct: z.number().min(0).max(100).optional(),
  /** Uniformity of size, farmer's own 1-5 rating. */
  uniformity: z.number().int().min(1).max(5).optional(),
  /** Days since harvest at assay time. Derived, not asked. */
  ageDays: z.number().int().min(0).optional(),
});
export type GradeDims = z.infer<typeof GradeDims>;

export const CreateLotBody = z.object({
  commodityId: Cuid,
  qtyKg: Kg,
  harvestDate: IsoDate,
  warehouseId: Cuid.nullable().default(null),
  reservePaisePerQtl: Paise.nullable().default(null),
  dims: GradeDims.optional(),
});

export const AssayDto = z.object({
  grade: Grade,
  score: z.number().int().min(0).max(1000),
  dims: GradeDims,
  method: z.enum(['SELF_DECLARED', 'RULE_ENGINE', 'CV_MODEL', 'FPO_INSPECTOR']),
  abstained: z.boolean(),
  note: z.string().nullable(),
  /** Which dimension pushed the grade down most. Actionable for the farmer. */
  weakestDim: z.string().nullable(),
});
export type AssayDto = z.infer<typeof AssayDto>;

export const LotDto = z.object({
  id: Cuid,
  commodity: CommodityDto,
  farmerId: Cuid,
  farmerName: z.string(),
  qtyKg: Kg,
  harvestDate: IsoDate,
  status: LotStatus,
  warehouseId: Cuid.nullable(),
  reservePaisePerQtl: Paise.nullable(),
  assay: AssayDto.nullable(),
  createdAt: z.string(),
});
export type LotDto = z.infer<typeof LotDto>;

// ── FPO pooling ──────────────────────────────────────────────────────────────

export const CreatePoolBody = z.object({ fpoId: Cuid, lotIds: z.array(Cuid).min(2) });

/** Grade-weighted fair split. Shown to every member BEFORE consent. See playbook Ch 08. */
export const SplitRow = z.object({
  farmerId: Cuid,
  farmerName: z.string(),
  lotId: Cuid,
  qtyKg: Kg,
  score: z.number().int(),
  /** qtyKg * score, the unnormalised weight. Shown so the maths is auditable. */
  weight: z.number().int(),
  shareBps: Bps,
  /** What this member would receive at the pool's indicative price. */
  indicativePaise: Paise,
  /** Difference vs selling the lot alone at its own grade price. The reason to pool. */
  vsSoloPaise: Paise,
  consented: z.boolean().nullable(),
});
export type SplitRow = z.infer<typeof SplitRow>;

export const PoolDto = z.object({
  id: Cuid,
  fpoId: Cuid,
  fpoName: z.string(),
  commodity: CommodityDto,
  status: z.enum(['FORMING', 'CONSENT_PENDING', 'READY', 'LISTED', 'COMMITTED', 'SETTLED', 'CANCELLED']),
  totalQtyKg: z.number().int(),
  avgScore: z.number().int(),
  split: z.array(SplitRow),
  /** All members must appear in `consents` with accepted=true before status leaves CONSENT_PENDING. */
  allConsented: z.boolean(),
});
export type PoolDto = z.infer<typeof PoolDto>;

export const ConsentBody = z.object({
  accepted: z.boolean(),
  agreedShareBps: Bps,
  channel: z.enum(['APP', 'IVR', 'SMS', 'FPO_DESK']).default('APP'),
});

// ─────────────────────────────────────────────────────────────────────────────
// DEMAND, MATCHING, OFFERS  (R3)
// ─────────────────────────────────────────────────────────────────────────────

export const BuyerDto = z.object({
  id: Cuid,
  legalName: z.string(),
  kind: z.string(),
  tier: BuyerTier,
  /** 0-1000. */
  reliability: z.number().int(),
  districtName: z.string(),
  /** Human-readable list of what we actually checked. Never overclaim. */
  verifiedSignals: z.array(z.string()),
  settledCount: z.number().int(),
  disputeCount: z.number().int(),
  /** Median days from DELIVERED to RELEASED. The number farmers care about most. */
  medianPayoutDays: z.number().nullable(),
});
export type BuyerDto = z.infer<typeof BuyerDto>;

export const CreateDemandBody = z.object({
  commodityId: Cuid,
  qtyKg: Kg,
  minGrade: Grade.default('C'),
  indicativePaisePerQtl: Paise,
  deliverBy: IsoDate,
  districtId: Cuid,
  qualitySpec: z.string().max(500).optional(),
});

export const DemandDto = z.object({
  id: Cuid,
  buyer: BuyerDto,
  commodity: CommodityDto,
  qtyKg: Kg,
  minGrade: Grade,
  indicativePaisePerQtl: Paise,
  deliverBy: IsoDate,
  districtName: z.string(),
  qualitySpec: z.string().nullable(),
  active: z.boolean(),
  /** How much of qtyKg is already committed via accepted offers. */
  filledKg: z.number().int(),
});
export type DemandDto = z.infer<typeof DemandDto>;

/** Explainable match. A score with no `why` is not usable by a farmer or a judge. */
export const MatchRow = z.object({
  lotId: Cuid.nullable(),
  poolId: Cuid.nullable(),
  sellerName: z.string(),
  qtyKg: Kg,
  grade: Grade,
  score: z.number().int(),
  distanceKm: z.number(),
  /** 0-1000 composite. Components must sum to it. */
  matchScore: z.number().int(),
  components: z.object({
    gradeFit: z.number().int(),
    qtyFit: z.number().int(),
    distance: z.number().int(),
    freshness: z.number().int(),
    reliability: z.number().int(),
  }),
  why: z.array(z.string()),
  /** Indicative net to seller if this match closed at the demand's price. */
  netToSellerPaise: Paise,
});
export type MatchRow = z.infer<typeof MatchRow>;

export const CreateOfferBody = z.object({
  demandId: Cuid,
  lotId: Cuid.nullable().default(null),
  poolId: Cuid.nullable().default(null),
  qtyKg: Kg,
  pricePaisePerQtl: Paise,
  /** Hours until the offer lapses. Farmers must not be pressured into instant decisions. */
  expiresInHours: z.number().int().min(1).max(168).default(48),
});

export const OfferDto = z.object({
  id: Cuid,
  demandId: Cuid,
  buyer: BuyerDto,
  lotId: Cuid.nullable(),
  poolId: Cuid.nullable(),
  qtyKg: Kg,
  pricePaisePerQtl: Paise,
  status: OfferStatus,
  expiresAt: z.string(),
  /** Set by the server: offer price vs the farmer's reserve, and vs today's mandi modal. */
  vsReservePaisePerQtl: Paise.nullable(),
  vsMandiPaisePerQtl: Paise.nullable(),
  createdAt: z.string(),
});
export type OfferDto = z.infer<typeof OfferDto>;

// ─────────────────────────────────────────────────────────────────────────────
// SETTLEMENT + LEDGER  (R3)
// ─────────────────────────────────────────────────────────────────────────────

/** Every mutation that moves money takes an idempotency key. No exceptions. */
export const IdemHeader = 'x-idempotency-key';

export const TxDto = z.object({
  id: Cuid,
  offerId: Cuid,
  buyer: BuyerDto,
  lotId: Cuid.nullable(),
  poolId: Cuid.nullable(),
  qtyKg: Kg,
  pricePaisePerQtl: Paise,
  grossPaise: Paise,
  feePaise: Paise,
  transportPaise: Paise,
  netToSellerPaise: Paise,
  status: TxStatus,
  timeline: z.array(z.object({
    fromStatus: TxStatus, toStatus: TxStatus, actorId: z.string(),
    note: z.string().nullable(), at: z.string(),
  })),
  createdAt: z.string(),
});
export type TxDto = z.infer<typeof TxDto>;

export const TransitionBody = z.object({
  to: TxStatus,
  note: z.string().max(300).optional(),
});

export const LedgerRow = z.object({
  seq: z.number().int(),
  txId: Cuid,
  commodityName: z.string(),
  marketName: z.string(),
  qtyKg: Kg,
  benchmarkPaisePerQtl: Paise,
  realisedPaisePerQtl: Paise,
  deltaPaise: Paise,
  heldDays: z.number().int(),
  followedRecommendation: z.boolean().nullable(),
  hash: z.string(),
  createdAt: z.string(),
});
export type LedgerRow = z.infer<typeof LedgerRow>;

export const LedgerRes = z.object({
  rows: z.array(LedgerRow),
  /** Strings, not numbers — cumulative totals can exceed the per-field Int ceiling. */
  totals: z.object({
    grossPaise: z.string(),
    deltaPaise: z.string(),
    saleCount: z.number().int(),
    avgHeldDays: z.number(),
    /**
     * G — the headline number. Average delta in paise per quintal across all sales.
     * This is the single most important figure in the pitch. It must be MEASURED,
     * never asserted. See playbook Ch 16 §16.5.
     */
    gPaisePerQtl: z.number().int(),
  }),
});
export type LedgerRes = z.infer<typeof LedgerRes>;

/** Recompute the hash chain and report the first break, if any. Demo this live. */
export const ChainVerifyRes = z.object({
  ok: z.boolean(),
  chainLength: z.number().int(),
  brokenAtSeq: z.number().int().nullable(),
  checkedAt: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// DISPUTES  (R3)
// ─────────────────────────────────────────────────────────────────────────────

export const RaiseDisputeBody = z.object({
  txId: Cuid,
  reason: z.enum(['QUALITY', 'QUANTITY', 'PAYMENT_DELAY', 'NON_DELIVERY', 'OTHER']),
  detail: z.string().max(1000),
});

export const DisputeDto = z.object({
  id: Cuid,
  txId: Cuid,
  raisedByName: z.string(),
  reason: z.string(),
  stage: DisputeStage,
  respondBy: z.string(),
  /**
   * Asymmetry guard: if the counterparty misses respondBy, the case advances in the
   * raiser's favour automatically. Silence must not be a winning strategy for whoever
   * has more time and lawyers. See playbook Ch 08.
   */
  autoAdvanceAt: z.string().nullable(),
  outcome: z.string().nullable(),
  createdAt: z.string(),
});
export type DisputeDto = z.infer<typeof DisputeDto>;

// ─────────────────────────────────────────────────────────────────────────────
// ML SERVICE  (R2)   internal, services/ml — mirrored in services/ml/app/contracts.py
// ─────────────────────────────────────────────────────────────────────────────

export const MlForecastBody = z.object({
  commodityKey: z.string(),
  marketKey: z.string(),
  history: z.array(z.object({ date: IsoDate, modalPaisePerQtl: Paise, arrivalKg: z.number().int().nullable() })),
  horizonDays: z.number().int().min(1).max(30).default(14),
  spoilageBpsPerDay: z.number().int().default(0),
});

export const MlForecastRes = z.object({
  points: z.array(ForecastPoint),
  card: ModelCard,
});

export const MlHealthRes = z.object({
  ok: z.boolean(),
  models: z.array(z.string()),
  version: z.string(),
});
