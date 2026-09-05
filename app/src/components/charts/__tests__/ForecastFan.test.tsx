/**
 * P6's acceptance bar: no point line renders without its band. The prop types
 * make this true by construction (p10/p50/p90 all required) — this test proves
 * the runtime guard for the one case types cannot catch (mismatched lengths),
 * and that a valid call always renders both the band (Path) and the line
 * (Polyline) together, never one without the other.
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { Path, Polyline } from 'react-native-svg';

import { ForecastFan } from '../ForecastFan';
import { fxForecast } from '../../../fixtures/forecast';

function arrays() {
  return {
    p10: fxForecast.points.map(p => p.p10_paise_per_qtl),
    p50: fxForecast.points.map(p => p.p50_paise_per_qtl),
    p90: fxForecast.points.map(p => p.p90_paise_per_qtl),
  };
}

describe('ForecastFan', () => {
  it('renders both the band and the p50 line together', () => {
    const { p10, p50, p90 } = arrays();
    const tree = renderer.create(<ForecastFan p10={p10} p50={p50} p90={p90} locale="mr" />);
    // react-native-svg elements can match their own type more than once in the
    // fiber tree (wrapper + native host) — "at least one of each" is the actual
    // coupling guarantee under test, not an exact internal count.
    expect(tree.root.findAllByType(Path).length).toBeGreaterThan(0);
    expect(tree.root.findAllByType(Polyline).length).toBeGreaterThan(0);
  });

  it('renders nothing on mismatched array lengths rather than a garbled chart', () => {
    const { p10, p50, p90 } = arrays();
    const tree = renderer.create(
      <ForecastFan p10={p10.slice(0, 5)} p50={p50} p90={p90} locale="mr" />,
    );
    expect(tree.toJSON()).toBeNull();
  });

  it('renders nothing on empty arrays', () => {
    const tree = renderer.create(<ForecastFan p10={[]} p50={[]} p90={[]} locale="mr" />);
    expect(tree.toJSON()).toBeNull();
  });
});
