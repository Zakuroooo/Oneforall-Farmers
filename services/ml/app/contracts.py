"""Pydantic mirrors of packages/contracts/src/index.ts.  OWNER: R2.

These MUST stay field-for-field identical to the TypeScript contract. When R1
announces a contract change, updating this file is R2's job in the same sync window
— a silent drift here surfaces as a 422 at H55 and costs an hour you will not have.

Money is integer paise. Quantity is integer kilograms. No floats for money, ever.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

ObsSource = Literal["AGMARKNET", "MSAMB", "IMPUTED", "SYNTHETIC"]
# SELL_ELSEWHERE = sell today, but at a mandi other than the farmer's default.
# The problem statement says "nearby markets" verbatim, so spatial arbitrage is a
# first-class answer, not a footnote under SELL_NOW.
WindowAction = Literal["SELL_NOW", "SELL_ELSEWHERE", "HOLD", "SPLIT", "NO_ADVICE"]
Confidence = Literal["HIGH", "MEDIUM", "LOW"]


class HistoryPoint(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    modalPaisePerQtl: int
    arrivalKg: int | None = None


class ForecastPoint(BaseModel):
    date: str
    horizonDays: int
    p10PaisePerQtl: int
    p50PaisePerQtl: int
    p90PaisePerQtl: int

    @field_validator("p50PaisePerQtl")
    @classmethod
    def _monotone(cls, v: int, info) -> int:
        """Quantile crossing is a real LightGBM failure mode: independently fitted
        quantiles can come back out of order. Sorting them silently would hide a
        broken fit, so we refuse instead and let the caller fall back to the baseline."""
        p10 = info.data.get("p10PaisePerQtl")
        if p10 is not None and v < p10:
            raise ValueError("quantile crossing: p50 < p10")
        return v


class ModelCard(BaseModel):
    """Shown verbatim in the UI. If we cannot fill it honestly, we do not ship it."""

    model: str
    trainedAt: str
    mase: float | None = None
    coverage: float | None = None
    trainRows: int
    caveat: str


class MlForecastBody(BaseModel):
    commodityKey: str
    marketKey: str
    history: list[HistoryPoint]
    horizonDays: int = Field(default=14, ge=1, le=30)
    spoilageBpsPerDay: int = 0


class MlForecastRes(BaseModel):
    points: list[ForecastPoint]
    card: ModelCard


class CostBreakdown(BaseModel):
    storagePaise: int
    transportPaise: int
    spoilagePaise: int
    financePaise: int
    totalPaise: int


class BestMarket(BaseModel):
    marketId: str
    name: str
    nameMr: str
    distanceKm: float
    netPaisePerQtl: int


class SplitPlan(BaseModel):
    sellNowBps: int
    holdBps: int


class PledgeQuote(BaseModel):
    """A pledge-finance quote against a warehouse receipt.

    WHERE THIS IS COMPUTED: not here. The quote is pure deterministic arithmetic over
    seeded Warehouse + CostTable rows, so it lives in TypeScript (`costs.ts` computes it,
    `window.ts` decides whether to emit it) where vitest can cover it without a database
    and without this service running. Python always returns `pledgeQuote = None`; the
    Next.js route attaches the real quote before responding to the browser.

    The class exists anyway so this file stays field-for-field identical to the TS
    contract — a mirror with a hole in it is how drift starts.
    """

    warehouseId: str
    warehouseName: str
    warehouseNameMr: str
    distanceKm: float
    isWdra: bool
    ltvBps: int
    advancePaise: int
    rateBpsPerAnnum: int
    tenorDays: int
    interestPaise: int
    netCashTodayPaise: int
    coversNeed: bool
    repaymentMode: Literal["AUTO_FROM_PROCEEDS"]


class WindowRecommendation(BaseModel):
    action: WindowAction
    holdDays: int
    expectedGainPaisePerQtl: int
    expectedGainTotalPaise: int
    # The honest downside: net gain at the p10 price, after costs. Usually negative.
    # Required, never omitted — a recommendation that hides its worst case is not
    # informed consent, and the UI renders this with the same weight as the gain.
    worstCasePaisePerQtl: int
    worstCaseTotalPaise: int
    confidence: Confidence
    bandBps: int
    # Always None from this service. Attached in TS. See PledgeQuote above.
    pledgeQuote: PledgeQuote | None = None
    splitPlan: SplitPlan | None = None
    costs: CostBreakdown
    todayNetPaisePerQtl: int
    expectedNetPaisePerQtl: int
    bestMarket: BestMarket
    reasons: list[str]
    reasonsMr: list[str]
    refusalReason: str | None = None
    card: ModelCard
    recommendationId: str | None = None


class MarketOption(BaseModel):
    """One sellable venue, with its distance and per-quintal transport cost."""

    marketId: str
    name: str
    nameMr: str
    distanceKm: float
    todayModalPaisePerQtl: int
    transportPaisePerQtl: int


class MlWindowBody(BaseModel):
    commodityKey: str
    qtyKg: int
    harvestDate: str
    storageDaysAvailable: int = Field(ge=0, le=120)
    cold: bool = False
    rho: float = Field(default=0.35, ge=0.0, le=1.0)
    # The farmer's cash deadline, passed through so the candidate-day search can prefer
    # a window he can actually survive. A mathematically optimal 18-day hold is useless
    # advice to a man with a loan due on day 6.
    cashNeedPaise: int | None = None
    cashNeedBy: str | None = None
    history: list[HistoryPoint]
    markets: list[MarketOption]
    storagePaisePerKgDay: int
    spoilageBpsPerDay: int
    financeBpsPerAnnum: int
    shelfLifeDays: int
    # Thresholds come from the caller (env-driven), never hardcoded here.
    noAdviceBandBps: int = 2500
    minGainPaisePerQtl: int = 3000


class MlHealthRes(BaseModel):
    ok: bool
    models: list[str]
    version: str
