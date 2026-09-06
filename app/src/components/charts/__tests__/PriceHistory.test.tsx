/**
 * I8: the source badge is part of the chart. This proves the SYNTHETIC segment
 * in `fxPriceHistory` actually renders in a different color, and that the
 * legend names only the sources present — not a fixed list of five.
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { Line } from 'react-native-svg';

import { PriceHistory } from '../PriceHistory';
import { fxPriceHistory, fxPriceSeries } from '../../../fixtures/prices';

describe('PriceHistory', () => {
  it('draws one Line segment per consecutive pair of points', () => {
    const tree = renderer.create(<PriceHistory points={fxPriceSeries.points} locale="mr" />);
    expect(tree.root.findAllByType(Line)).toHaveLength(fxPriceSeries.points.length - 1);
  });

  it('the SYNTHETIC point colors its segment differently from the AGMARKNET segments', () => {
    const tree = renderer.create(<PriceHistory points={fxPriceHistory.points} locale="mr" />);
    const lines = tree.root.findAllByType(Line);
    const strokes = new Set(lines.map(l => l.props.stroke));
    // Two colors present: the trusted green and the untrusted amber.
    expect(strokes.size).toBe(2);
  });

  it('legend names only the sources actually present, not all five', () => {
    const tree = renderer.create(<PriceHistory points={fxPriceSeries.points} locale="mr" />);
    const legendText = tree.root.findAll(
      n => typeof n.props.children === 'string' && n.props.children === 'AGMARKNET',
    );
    expect(legendText.length).toBeGreaterThan(0);
    const syntheticText = tree.root.findAll(
      n => typeof n.props.children === 'string' && n.props.children.includes('कृत्रिम'),
    );
    expect(syntheticText).toHaveLength(0); // fxPriceSeries has no synthetic point
  });

  it('renders nothing with fewer than two points', () => {
    const tree = renderer.create(<PriceHistory points={[fxPriceSeries.points[0]!]} locale="mr" />);
    expect(tree.toJSON()).toBeNull();
  });
});
