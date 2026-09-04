/**
 * @mandi/contracts/fixtures — contract-shaped sample data.
 * OWNER: R1. Additive only; do not change existing values, R4/R5 snapshot against them.
 *
 * WHY THIS EXISTS: R4 and R5 must build screens at H4, before R2 and R3 have working
 * endpoints. Import these, render them, and swap to `fetch` when the endpoint lands.
 * The shapes are guaranteed identical because both sides derive from index.ts.
 *
 * These numbers are ILLUSTRATIVE, not observed. Never put a fixture number on a slide.
 */
import type {
  AssayDto, BuyerDto, CommodityDto, DemandDto, ForecastRes, LedgerRes, LotDto,
  MarketDto, MatchRow, ModelCard, NearbyPrice, OfferDto, PoolDto, PricePoint,
  SessionUser, TxDto, WindowRecommendation,
} from './index';

const D = (n: number) => {
  const d = new Date('2026-09-04T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const fxCommodity: CommodityDto = {
  id: 'clx0000000000000onion01', name: 'Onion', nameMr: 'कांदा',
  group: 'VEGETABLE', shelfLifeDays: 90, spoilageBpsPerDay: 35,
};

export const fxMarket: MarketDto = {
  id: 'clx000000000000lasalgao', name: 'Lasalgaon', nameMr: 'लासलगाव',
  districtId: 'clx0000000000000nashik1', districtName: 'Nashik',
  lat: 20.1428, lon: 74.2385, isEnam: true, distanceKm: 18.4,
};

export const fxMarketAlt: MarketDto = {
  id: 'clx0000000000000pimpalg', name: 'Pimpalgaon Baswant', nameMr: 'पिंपळगाव बसवंत',
  districtId: 'clx0000000000000nashik1', districtName: 'Nashik',
  lat: 20.1697, lon: 73.9835, isEnam: true, distanceKm: 31.2,
};

export const fxUser: SessionUser = {
  id: 'clx00000000000000user01', phone: '9876543210', name: 'Vitthal Pawar',
  role: 'FARMER', locale: 'mr', farmerId: 'clx000000000000farmer01',
  buyerId: null, districtId: 'clx0000000000000nashik1', districtName: 'Nashik',
};

/** 60 days of history ending today. Deterministic: seasonal shape + fixed jitter. */
export const fxSeries: PricePoint[] = Array.from({ length: 60 }, (_, i) => {
  const t = i - 59;
  const base = 178_000 + Math.round(9_000 * Math.sin((i / 60) * Math.PI * 1.4));
  const jitter = ((i * 7919) % 41) * 320 - 6_400;
  const modal = base + jitter;
  return {
    date: D(t),
    modalPaisePerQtl: modal,
    minPaisePerQtl: modal - 22_000,
    maxPaisePerQtl: modal + 26_000,
    arrivalKg: 480_000 + ((i * 104_729) % 260_000),
    source: i % 11 === 3 ? 'IMPUTED' : 'AGMARKNET',
  };
});

export const fxCard: ModelCard = {
  model: 'lgbm-quantile-v3', trainedAt: '2026-09-04T02:10:00Z',
  mase: 0.83, coverage: 0.79, trainRows: 12_480,
  caveat: 'Trained on 4 years of Nashik-district onion arrivals. Accuracy degrades sharply '
    + 'around export-policy announcements, which are not in the feature set.',
};

export const fxForecast: ForecastRes = {
  card: fxCard,
  hasSynthetic: false,
  points: Array.from({ length: 14 }, (_, i) => {
    const h = i + 1;
    const p50 = 183_500 + h * 1_450;
    const spread = 7_000 + h * 1_250; // widens with horizon, as it must
    return {
      date: D(h), horizonDays: h,
      p10PaisePerQtl: p50 - spread,
      p50PaisePerQtl: p50,
      p90PaisePerQtl: p50 + spread,
    };
  }),
};

export const fxNearby: NearbyPrice[] = [
  {
    market: fxMarket, obsDate: D(0), modalPaisePerQtl: 183_000,
    netPaisePerQtl: 179_320, transportPaisePerQtl: 3_680, source: 'AGMARKNET', rank: 1,
  },
  {
    market: fxMarketAlt, obsDate: D(0), modalPaisePerQtl: 186_500,
    netPaisePerQtl: 180_260, transportPaisePerQtl: 6_240, source: 'AGMARKNET', rank: 2,
  },
];

/** The hero object. Every field populated — R4 must handle all of them. */
export const fxWindowHold: WindowRecommendation = {
  action: 'HOLD',
  holdDays: 11,
  expectedGainPaisePerQtl: 11_940,
  expectedGainTotalPaise: 1_492_500,
  worstCasePaisePerQtl: -8_600,
  worstCaseTotalPaise: -1_075_000,
  confidence: 'MEDIUM',
  bandBps: 1_180,
  pledgeQuote: {
    warehouseId: 'clx000000000000000wh001',
    warehouseName: 'Nashik Agro Warehouse (WDRA)',
    warehouseNameMr: 'नाशिक अ‍ॅग्रो गोदाम (WDRA)',
    distanceKm: 11.2,
    isWdra: true,
    ltvBps: 7_000,
    advancePaise: 15_000_000,
    rateBpsPerAnnum: 1_200,
    tenorDays: 11,
    interestPaise: 54_250,
    netCashTodayPaise: 14_657_000,
    coversNeed: true,
    repaymentMode: 'AUTO_FROM_PROCEEDS',
  },
  splitPlan: null,
  costs: {
    storagePaise: 288_750, transportPaise: 46_000,
    spoilagePaise: 176_400, financePaise: 0, totalPaise: 511_150,
  },
  todayNetPaisePerQtl: 179_320,
  expectedNetPaisePerQtl: 191_260,
  bestMarket: {
    marketId: fxMarket.id, name: 'Lasalgaon', nameMr: 'लासलगाव',
    distanceKm: 18.4, netPaisePerQtl: 179_320,
  },
  reasons: [
    'Prices at Lasalgaon have risen 9 of the last 12 years in this fortnight.',
    'Arrivals are 18% above the seasonal norm today, which usually depresses price short-term.',
    'Expected gain of ₹119 per quintal already excludes ₹51,115 of storage, transport and spoilage cost.',
    'Your onions are 4 days from harvest and can hold 90 days — waiting 11 days is well inside safe range.',
  ],
  reasonsMr: [
    'लासलगाव येथे गेल्या १२ वर्षांपैकी ९ वर्षे या पंधरवड्यात भाव वाढले आहेत.',
    'आज आवक सरासरीपेक्षा १८% जास्त आहे, त्यामुळे भाव तात्पुरते खाली आहेत.',
    'प्रति क्विंटल ₹११९ चा अपेक्षित फायदा — साठवण, वाहतूक व घट खर्च वजा करून.',
    'तुमचा कांदा ९० दिवस टिकतो, ११ दिवस थांबणे सुरक्षित आहे.',
  ],
  refusalReason: null,
  card: fxCard,
  recommendationId: 'clx00000000000000rec001',
};

/** The refusal case. R4 MUST design this screen — it is our best demo moment (I4). */
export const fxWindowRefuse: WindowRecommendation = {
  ...fxWindowHold,
  action: 'NO_ADVICE',
  holdDays: 0,
  expectedGainPaisePerQtl: 0,
  expectedGainTotalPaise: 0,
  worstCasePaisePerQtl: 0,
  worstCaseTotalPaise: 0,
  pledgeQuote: null,
  confidence: 'LOW',
  bandBps: 4_260,
  reasons: [],
  reasonsMr: [],
  refusalReason:
    'The 14-day price range for onion at Lasalgaon is currently ₹1,420–₹2,610 per quintal. '
    + 'That spread is too wide for us to tell you honestly whether waiting pays. '
    + 'We will not guess with your crop. Check back tomorrow, or talk to your FPO.',
  recommendationId: 'clx00000000000000rec002',
};

export const fxAssay: AssayDto = {
  grade: 'B', score: 682,
  dims: { sizeMm: 48, moisturePct: 12, rotPct: 4, foreignPct: 3, uniformity: 3, ageDays: 4 },
  method: 'RULE_ENGINE', abstained: false, note: null, weakestDim: 'uniformity',
};

export const fxLot: LotDto = {
  id: 'clx00000000000000lot001', commodity: fxCommodity,
  farmerId: fxUser.farmerId!, farmerName: 'Vitthal Pawar',
  qtyKg: 12_500, harvestDate: D(-4), status: 'LISTED',
  warehouseId: null, reservePaisePerQtl: 175_000, assay: fxAssay,
  createdAt: '2026-09-01T06:20:00Z',
};

export const fxBuyer: BuyerDto = {
  id: 'clx0000000000000buyer01', legalName: 'Sahyadri Agro Processors Pvt Ltd',
  kind: 'PROCESSOR', tier: 'T2_TRANSACTED', reliability: 741, districtName: 'Nashik',
  verifiedSignals: [
    'Phone number verified by OTP',
    'GSTIN present and format-valid (not verified with GSTN)',
    '7 transactions settled on MANDI-SETU',
    'No upheld disputes',
  ],
  settledCount: 7, disputeCount: 0, medianPayoutDays: 2.5,
};

export const fxDemand: DemandDto = {
  id: 'clx000000000000demand01', buyer: fxBuyer, commodity: fxCommodity,
  qtyKg: 60_000, minGrade: 'B', indicativePaisePerQtl: 192_000,
  deliverBy: D(14), districtName: 'Nashik',
  qualitySpec: 'Size 45mm+, moisture under 13%, rot under 5%, single-layer crating.',
  active: true, filledKg: 22_500,
};

export const fxMatches: MatchRow[] = [
  {
    lotId: fxLot.id, poolId: null, sellerName: 'Vitthal Pawar', qtyKg: 12_500,
    grade: 'B', score: 682, distanceKm: 18.4, matchScore: 812,
    components: { gradeFit: 210, qtyFit: 160, distance: 182, freshness: 150, reliability: 110 },
    why: [
      'Grade B meets the buyer\'s minimum of B.',
      '12.5 q fits inside the 375 q still unfilled on this demand.',
      'Lot is 18 km from the delivery point — lowest transport cost of any match.',
    ],
    netToSellerPaise: 2_354_000,
  },
];

export const fxOffer: OfferDto = {
  id: 'clx000000000000offer001', demandId: fxDemand.id, buyer: fxBuyer,
  lotId: fxLot.id, poolId: null, qtyKg: 12_500, pricePaisePerQtl: 190_500,
  status: 'OPEN', expiresAt: '2026-09-06T12:00:00Z',
  vsReservePaisePerQtl: 15_500, vsMandiPaisePerQtl: 7_500,
  createdAt: '2026-09-04T09:40:00Z',
};

export const fxTx: TxDto = {
  id: 'clx0000000000000tx0001', offerId: fxOffer.id, buyer: fxBuyer,
  lotId: fxLot.id, poolId: null, qtyKg: 12_500, pricePaisePerQtl: 190_500,
  grossPaise: 23_812_500, feePaise: 0, transportPaise: 460_000,
  netToSellerPaise: 23_352_500, status: 'ESCROW_FUNDED',
  timeline: [
    { fromStatus: 'AGREED', toStatus: 'AGREED', actorId: 'SYSTEM', note: 'Offer accepted', at: '2026-09-04T10:02:00Z' },
    { fromStatus: 'AGREED', toStatus: 'ESCROW_FUNDED', actorId: fxBuyer.id, note: null, at: '2026-09-04T10:31:00Z' },
  ],
  createdAt: '2026-09-04T10:02:00Z',
};

export const fxPool: PoolDto = {
  id: 'clx00000000000000pool01', fpoId: 'clx000000000000000fpo01',
  fpoName: 'Godavari Kandaa Utpadak FPO', commodity: fxCommodity,
  status: 'CONSENT_PENDING', totalQtyKg: 41_000, avgScore: 654,
  allConsented: false,
  split: [
    {
      farmerId: fxUser.farmerId!, farmerName: 'Vitthal Pawar', lotId: fxLot.id,
      qtyKg: 12_500, score: 682, weight: 8_525_000, shareBps: 3_178,
      indicativePaise: 2_500_452, vsSoloPaise: 118_700, consented: true,
    },
    {
      farmerId: 'clx000000000000farmer02', farmerName: 'Shobha Jadhav', lotId: 'clx00000000000000lot002',
      qtyKg: 18_000, score: 610, weight: 10_980_000, shareBps: 4_094,
      indicativePaise: 3_221_336, vsSoloPaise: 141_900, consented: null,
    },
    {
      farmerId: 'clx000000000000farmer03', farmerName: 'Ramesh Bhosale', lotId: 'clx00000000000000lot003',
      qtyKg: 10_500, score: 690, weight: 7_245_000, shareBps: 2_728,
      indicativePaise: 2_146_212, vsSoloPaise: 96_400, consented: false,
    },
  ],
};

export const fxLedger: LedgerRes = {
  rows: [
    {
      seq: 1, txId: fxTx.id, commodityName: 'Onion', marketName: 'Lasalgaon',
      qtyKg: 12_500, benchmarkPaisePerQtl: 179_320, realisedPaisePerQtl: 190_500,
      deltaPaise: 1_397_500, heldDays: 11, followedRecommendation: true,
      hash: '4f2a91c6e8b30d57a1f4c2e9b8d6039147ac52be0f81d3c6a9e7b4520fd83c1a',
      createdAt: '2026-09-15T11:04:00Z',
    },
  ],
  totals: {
    grossPaise: '23812500', deltaPaise: '1397500', saleCount: 1,
    avgHeldDays: 11, gPaisePerQtl: 11_180,
  },
};
