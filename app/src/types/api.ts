/**
 * The wire contract. Transcribed from `docs/architecture/00_CANON.md` §7.
 *
 * ★ Rules for this file, and they are not style preferences:
 *
 *  1. **If a field is not in CANON §7, it does not go in here.** An invented field
 *     renders perfectly against a fixture and is `undefined` the first time it meets
 *     the real endpoint. Six of them were caught before H0; see BLOCKERS.md.
 *  2. **`snake_case` on the wire, read directly.** There is no camelCase mapping
 *     layer and we are not adding one.
 *  3. **Money is `number` of paise, quantity is `number` of kg, rates are bps.**
 *     Nothing here is ever a rupee. (I1, I2, I3)
 *  4. Changes come from CANON, not from a screen that wants a field. File a blocker.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

/** `mr` is the default. `en` is the fallback. Hindi shares Marathi's digits. */
export type Locale = 'mr' | 'hi' | 'en';

/** From the JWT. Selects the navigator at the root — never a picker. */
export type Role = 'FARMER' | 'BUYER';

/**
 * CANON §7 — `source` on every price row, and `data_source` on the window
 * response. Anything that is not AGMARKNET or MSAMB gets badged in the UI (I8).
 *
 * ★ BUG FIXED, not invented: an earlier draft of this file had `GENERATED` and
 *   `MANUAL` — values that do not exist anywhere in CANON. The actual CHECK
 *   constraint is `00_CANON.md` §6.3's `price_obs.source in ('AGMARKNET','MSAMB',
 *   'ARCHIVE','IMPUTED','SYNTHETIC')`, which is what the real Postgres DB will
 *   enforce. Two other docs (`07_FRONTEND_ARCHITECTURE.md` §5,
 *   `PRANAY.md` §2.7) each cite a different 4-of-5 subset of this same list —
 *   CANON's schema wins per this repo's own precedence rule (see BLOCKERS.md's
 *   resolved invariant-numbering entry for the same reasoning applied before).
 */
export type DataSource = 'AGMARKNET' | 'MSAMB' | 'ARCHIVE' | 'IMPUTED' | 'SYNTHETIC';

export type Grade = 'A' | 'B' | 'C';

/** The error envelope. Every failure, no exceptions. CANON §7. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    field: string | null;
  };
}

export interface User {
  id: string;
  phone: string;
  name: string;
  role: Role;
  locale: Locale;
  district_id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// §7.1 Auth
// ─────────────────────────────────────────────────────────────────────────────

export interface OtpRequestRes {
  ok: boolean;
  expires_in_s: number;
  /** Only when DEV_OTP_ECHO=1 and ENV != production. Never rendered in a build. */
  dev_otp?: string;
}

export interface AuthRes {
  token: string;
  user: User;
}

// ─────────────────────────────────────────────────────────────────────────────
// §7.2 Reference
// ─────────────────────────────────────────────────────────────────────────────

export interface District {
  id: string;
  name: string;
  name_mr: string;
}

export interface Market {
  id: string;
  name: string;
  name_mr: string;
  district_id: string;
  lat: number;
  lon: number;
}

export interface Commodity {
  id: string;
  name: string;
  name_mr: string;
  storable_days: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// §7.3 Prices
// ─────────────────────────────────────────────────────────────────────────────

export interface PricePoint {
  obs_date: string; // ISO date, `YYYY-MM-DD`
  min_paise_per_qtl: number;
  max_paise_per_qtl: number;
  modal_paise_per_qtl: number;
  arrivals_qtl: number;
  source: DataSource;
}

export interface PriceSeriesRes {
  points: PricePoint[];
  /** Row counts by source — this is what the provenance badge on S5 reads. */
  source_summary: Partial<Record<DataSource, number>>;
  latest_obs_date: string;
}

/**
 * ★ The differentiator. Ordered by `net_paise_per_qtl` **descending**, not gross.
 * A nearer mandi paying less gross can outrank a distant one paying more, and
 * S6 must show both numbers so the farmer can see why the order changed.
 */
export interface NearbyMarketRow {
  market_id: string;
  name_mr: string;
  gross_paise_per_qtl: number;
  transport_paise_per_qtl: number;
  commission_paise_per_qtl: number;
  /** gross − transport − commission − loading */
  net_paise_per_qtl: number;
  distance_km: number;
  source: DataSource;
}

export interface NearbyRes {
  as_of_date: string;
  rows: NearbyMarketRow[];
  sorted_by: 'net_paise_per_qtl';
}

// ─────────────────────────────────────────────────────────────────────────────
// §7.4 AI — the hero
// ─────────────────────────────────────────────────────────────────────────────

export interface ForecastPoint {
  target_date: string;
  p10_paise_per_qtl: number;
  p50_paise_per_qtl: number;
  p90_paise_per_qtl: number;
}

export interface ForecastRes {
  as_of_date: string;
  points: ForecastPoint[];
  model_card: ModelCardSummary;
}

/** The two numbers carried inline on the window response. S8 fetches the full card. */
export interface ModelCardSummary {
  mase: number;
  coverage_80_bps: number;
}

/** `GET /ai/model-card` — the full card, for S8. */
export interface ModelCard extends ModelCardSummary {
  algo: string;
  trained_at: string;
  train_rows: number;
  train_from: string;
  train_to: string;
  horizon_days: number;
  baseline: 'seasonal_naive';
}

/** Every key is **per quintal** — the suffix says so. CANON §7.4 units table. */
export interface WindowCosts {
  transport_paise_per_qtl: number;
  commission_paise_per_qtl: number;
  storage_paise_per_qtl: number;
  spoilage_paise_per_qtl: number;
  loading_paise_per_qtl: number;
  total_paise_per_qtl: number;
}

export interface PledgeQuote {
  loan_paise: number;
  ltv_bps: number;
  rate_bps_annual: number;
  days: number;
  interest_paise: number;
  warehouse_id: string;
  /**
   * I13 — when this is false the server sends `pledge_quote: null` and S11 does
   * not exist. The flag is here for completeness; the UI never has to check it,
   * because a card that shouldn't be shown never arrives.
   */
  is_worthwhile: boolean;
  disclaimer: string;
}

/**
 * TODO(nilesh): CANON §7.4 shows `alt_market` only as `null` and never defines
 * its populated shape. This is the minimum S9 needs to render a SELL_ELSEWHERE
 * verdict; blocker filed. Do not read a field from this that is not listed here
 * until the contract is pinned.
 */
export interface AltMarket {
  market_id: string;
  name_mr: string;
  net_paise_per_qtl: number;
  distance_km: number;
}

export type WindowAction =
  | 'SELL_NOW'
  | 'SELL_ELSEWHERE'
  | 'HOLD'
  | 'SPLIT'
  | 'NO_ADVICE';

/** Enum, not a percentage. Rendered `मध्यम`. Band width is a separate field. */
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';

/** I6. Four values, and each has its own Marathi sentence from the server. */
export type RefusalReason =
  | 'BAND_TOO_WIDE'
  | 'INSUFFICIENT_HISTORY'
  | 'STALE_DATA'
  | 'GAIN_BELOW_COST';

export interface WindowRecommendReq {
  commodity_id: string;
  market_id: string;
  qty_kg: number;
  grade: Grade;
  lot_id: string | null;
  horizon_days: number;
}

/**
 * ★ THE HERO. `POST /api/v1/ai/window/recommend`.
 *
 * **Every key is always present.** The nullable ones go null on NO_ADVICE; they
 * do not vanish. That is why they are `T | null` and not `T?` — an optional key
 * would let a screen forget the refusal path exists, and the refusal path is the
 * one a judge asks about.
 *
 * **Units, and a 100× error here is the likeliest bug in the whole project:**
 *   - `*_per_qtl`               → per quintal
 *   - `expected_gain_paise`     → **whole lot**
 *   - `worst_case_paise`        → **whole lot**
 *
 *   expected_gain_paise = (hold_p50_net − sell_now_net) * (qty_kg // 100)
 *   worst_case_paise    = (hold_p10_net − sell_now_net) * (qty_kg // 100)
 *
 * Check the fixture against those two identities by hand. It closes at
 * ₹6,290 / −₹4,800 on a 40-quintal lot. If yours closes at ₹62,900, a unit is wrong.
 */
export interface WindowRes {
  action: WindowAction;
  hold_days: number | null;
  confidence: Confidence;
  band_width_bps: number;

  sell_now_net_paise_per_qtl: number;
  hold_p50_net_paise_per_qtl: number | null;
  hold_p10_net_paise_per_qtl: number | null;

  /** Whole-lot total. Not per quintal. */
  expected_gain_paise: number | null;
  /** Whole-lot total, negative. Renders at the SAME font size as the gain (I16). */
  worst_case_paise: number | null;

  /** Still returned on a refusal — costs are known even when the forecast is not. */
  costs: WindowCosts;

  alt_market: AltMarket | null;
  /** null when not worthwhile (I13) — S11 simply does not render. */
  pledge_quote: PledgeQuote | null;

  /** Non-null exactly when `action === 'NO_ADVICE'`. */
  refusal_reason: RefusalReason | null;

  model_card: ModelCardSummary;

  /** Rendered verbatim. Do not template around it, do not translate it client-side. */
  explain_mr: string;
  explain_en: string;

  data_source: DataSource;
}
