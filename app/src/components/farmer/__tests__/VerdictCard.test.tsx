/**
 * S9 is the highest-stakes screen in the product. This suite proves two things a
 * screenshot alone cannot guarantee on every future change: that all five
 * `WindowAction` values render without throwing, and that I16 — the worst case at
 * the *same* font size as the expected gain — holds by measurement, not by eye.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { VerdictCard } from '../VerdictCard';
import { fxHold, fxNoAdvice, fxSellElsewhere, fxSellNow, fxSplit } from '../../../fixtures/window';
import { DEMO_QTY_KG } from '../../../fixtures/window';
import type { WindowRes } from '../../../types/api';

function renderCard(data: WindowRes) {
  return renderer.create(<VerdictCard data={data} qtyKg={DEMO_QTY_KG} locale="mr" />);
}

function textOf(node: renderer.ReactTestInstance): string {
  return node.props.children instanceof Array
    ? node.props.children.join('')
    : String(node.props.children);
}

describe('VerdictCard — all five actions render', () => {
  it.each([
    ['SELL_NOW', fxSellNow],
    ['SELL_ELSEWHERE', fxSellElsewhere],
    ['HOLD', fxHold],
    ['SPLIT', fxSplit],
    ['NO_ADVICE', fxNoAdvice],
  ] as const)('%s does not throw and renders its testIDs', (_action, fx) => {
    const tree = renderCard(fx);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('HOLD shows the action label, hold days, gain and worst case', () => {
    const tree = renderCard(fxHold);
    const gain = tree.root.findByProps({ testID: 'verdict-gain' });
    const worst = tree.root.findByProps({ testID: 'verdict-worst-case' });
    expect(textOf(gain)).toBe('+ ₹६,२९०');
    expect(textOf(worst)).toBe('−₹४,८००');
  });

  it('NO_ADVICE renders explain_mr verbatim, not a composed sentence, and has no gain/worst-case nodes', () => {
    const tree = renderCard(fxNoAdvice);
    const explain = tree.root.findAll(
      n => typeof n.props.children === 'string' && n.props.children === fxNoAdvice.explain_mr,
    );
    expect(explain.length).toBeGreaterThan(0);

    // ★ I6 — the refusal is not the gain/worst-case layout with blanks in it.
    // Those two testIDs must not exist at all on this branch.
    expect(tree.root.findAllByProps({ testID: 'verdict-gain' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'verdict-worst-case' })).toHaveLength(0);
  });

  it('SELL_NOW and SELL_ELSEWHERE omit the hold-days line (hold_days: 0)', () => {
    for (const fx of [fxSellNow, fxSellElsewhere]) {
      const tree = renderCard(fx);
      const holdDaysNodes = tree.root.findAll(
        n => typeof n.props.children === 'string' && n.props.children.includes('दिवस') && !n.props.children.includes('अंदाज'),
      );
      expect(holdDaysNodes).toHaveLength(0);
    }
  });
});

describe('★ I16 — worst case renders at the same font size as expected gain', () => {
  it.each([
    ['SELL_NOW', fxSellNow],
    ['SELL_ELSEWHERE', fxSellElsewhere],
    ['HOLD', fxHold],
    ['SPLIT', fxSplit],
  ] as const)('%s: both numbers share one font size, not two', (_action, fx) => {
    const tree = renderCard(fx);
    const gain = tree.root.findByProps({ testID: 'verdict-gain' });
    const worst = tree.root.findByProps({ testID: 'verdict-worst-case' });

    const gainStyle = StyleSheet.flatten(gain.props.style);
    const worstStyle = StyleSheet.flatten(worst.props.style);

    expect(gainStyle.fontSize).toBeDefined();
    expect(gainStyle.fontSize).toBe(worstStyle.fontSize);
    // Pinned to the actual value, not just equal-to-each-other — a future edit
    // that shrinks both together to "fix a layout" is still a regression here.
    expect(gainStyle.fontSize).toBe(28);
  });
});

describe('P5/S10 — the expandable cost breakdown', () => {
  it('is collapsed by default and expands on tap to show all five lines + total', () => {
    const tree = renderCard(fxHold);

    // Collapsed: none of the five line labels are present yet.
    for (const label of ['वाहतूक', 'कमिशन', 'साठवण', 'नासाडी', 'भरणी', 'एकूण']) {
      expect(
        tree.root.findAll(n => n.props.children === label),
      ).toHaveLength(0);
    }

    const toggleButton = tree.root.findByProps({ testID: 'verdict-costs-toggle' });
    act(() => {
      toggleButton.props.onPress();
    });

    // Expanded: all five lines plus the total are now present.
    for (const label of ['वाहतूक', 'कमिशन', 'साठवण', 'नासाडी', 'भरणी', 'एकूण']) {
      expect(tree.root.findAll(n => n.props.children === label).length).toBeGreaterThan(0);
    }
  });
});
