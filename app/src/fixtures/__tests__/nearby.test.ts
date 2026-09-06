/**
 * K6/P7's own acceptance bar: at least one case where net-order ≠ gross-order,
 * and the reordering has to be visible, not theoretical.
 */

import { fxNearby } from '../nearby';

describe('fxNearby', () => {
  it('net = gross - transport - commission for every row (checked by hand in CANON\'s own example)', () => {
    for (const row of fxNearby.rows) {
      expect(row.gross_paise_per_qtl - row.transport_paise_per_qtl - row.commission_paise_per_qtl).toBe(
        row.net_paise_per_qtl,
      );
    }
  });

  it('rows are already sorted by net, descending, matching sorted_by', () => {
    expect(fxNearby.sorted_by).toBe('net_paise_per_qtl');
    const nets = fxNearby.rows.map(r => r.net_paise_per_qtl);
    expect(nets).toEqual([...nets].sort((a, b) => b - a));
  });

  it('★ net-order is not gross-order — the actual point of this endpoint', () => {
    const byNet = fxNearby.rows.map(r => r.market_id);
    const byGross = [...fxNearby.rows]
      .sort((a, b) => b.gross_paise_per_qtl - a.gross_paise_per_qtl)
      .map(r => r.market_id);
    expect(byNet).not.toEqual(byGross);
  });

  it('the top-gross market is not the top-net market', () => {
    const topByGross = [...fxNearby.rows].sort(
      (a, b) => b.gross_paise_per_qtl - a.gross_paise_per_qtl,
    )[0]!;
    const topByNet = fxNearby.rows[0]!;
    expect(topByGross.market_id).not.toBe(topByNet.market_id);
  });
});
