/**
 * CANON §7.6-shaped fixture for `GET/POST /offers` (S14, S19, S21). Shape
 * transcribed from `docs/handover/FRONTEND_NEEDS_BACKEND.md` §6.
 */

import type { OfferDto } from '../types/api';

/** Round 2 of a negotiation — farmer countered the buyer's opening bid. */
export const fxOffer: OfferDto = {
  id: 'offer_2',
  demand_id: 'demand_1',
  buyer_id: 'buyer_1',
  farmer_id: 'farmer_1',
  pool_id: null,
  price_paise_per_qtl: 200000,
  qty_kg: 4000,
  round: 2,
  parent_offer_id: 'offer_1',
  initiator: 'FARMER',
  status: 'OPEN',
  expires_at: '2026-09-08T18:00:00+05:30',
  created_at: '2026-09-03T11:15:00+05:30',
  lots: [{ lot_id: 'lot_listed_1', qty_allocated_kg: 4000 }],
  note: 'वाहतूक खर्च जास्त आहे, म्हणून किंमत वाढवली.',
};
