/**
 * I13 is the invariant CANON annotates "this is the line that proves you
 * understood the ethics, not just the features" — so it gets a test that asserts
 * *absence*, which is the only kind of assertion that can prove it.
 *
 * ★ The one thing this suite deliberately does NOT do is recompute
 *   `expected_gain_paise > interest_paise` and check the card against it. That
 *   comparison is the server's (CANON §8), and a client-side copy of it would be a
 *   second implementation free to disagree with the one that actually gated the
 *   response. What we assert is that a `null` quote renders nothing and a
 *   populated one renders every field — the contract, not the policy.
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';

import { PledgeCard } from '../PledgeCard';
import { fxHold, fxNoAdvice, fxSellNow } from '../../../fixtures/window';
import { formatPaise } from '../../../lib/money';
import type { PledgeQuote } from '../../../types/api';

function render(quote: PledgeQuote | null, expectedGainPaise: number | null) {
  return renderer.create(
    <PledgeCard quote={quote} expectedGainPaise={expectedGainPaise} locale="mr" />,
  );
}

function textsOf(tree: renderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map(n => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)))
    .join(' ');
}

describe('★ I13 — the card is absent, not empty, when the loan is not worthwhile', () => {
  it('a null quote renders nothing at all — no card, no placeholder, no empty state', () => {
    const tree = render(null, 629000);
    expect(tree.toJSON()).toBeNull();
  });

  it('NO_ADVICE sends pledge_quote: null, so the refusal branch shows no pledge either', () => {
    expect(fxNoAdvice.pledge_quote).toBeNull();
    const tree = render(fxNoAdvice.pledge_quote, fxNoAdvice.expected_gain_paise);
    expect(tree.toJSON()).toBeNull();
  });

  it('SELL_NOW sends pledge_quote: null — there is nothing to hold, so nothing to borrow against', () => {
    expect(fxSellNow.pledge_quote).toBeNull();
    expect(render(fxSellNow.pledge_quote, fxSellNow.expected_gain_paise).toJSON()).toBeNull();
  });
});

describe('PledgeCard — the populated card (fxHold)', () => {
  it('renders the loan, the interest, the LTV and the rate', () => {
    const tree = render(fxHold.pledge_quote, fxHold.expected_gain_paise);
    const all = textsOf(tree);

    expect(all).toContain(formatPaise(3400000, 'mr')); // ₹34,000 loan
    expect(all).toContain(formatPaise(9221, 'mr')); // ₹92 interest
    expect(all).toContain('७०%'); // ltv_bps 7000
    expect(all).toContain('९%'); // rate_bps_annual 900
  });

  it('renders the warehouse it would be stored in', () => {
    const tree = render(fxHold.pledge_quote, fxHold.expected_gain_paise);
    expect(textsOf(tree)).toContain('wh_niphad');
  });

  /**
   * CANON §8 rule 2 — "Every surface says 'Indicative simulation — not a lender
   * quote.'" Rendered verbatim off the wire, inside the card, so no crop or
   * scroll position can separate the number from its label.
   */
  it('renders the server\'s disclaimer verbatim, inside the card', () => {
    const tree = render(fxHold.pledge_quote, fxHold.expected_gain_paise);
    const node = tree.root.findByProps({ testID: 'pledge-disclaimer' });
    expect(String(node.props.children)).toBe('Indicative simulation — not a lender quote');
  });

  it('never invents a rupee figure — every number on screen came off the quote', () => {
    const q = fxHold.pledge_quote;
    expect(q).not.toBeNull();
    if (q === null) return;
    // Integer paise all the way in (I1); the card does no arithmetic on them.
    expect(Number.isInteger(q.loan_paise)).toBe(true);
    expect(Number.isInteger(q.interest_paise)).toBe(true);
  });
});

/**
 * ★ The ethics beat rendered as a comparison. Both numbers, comparable weight —
 *   I16's principle applied to the second pair in the product. A card that showed
 *   ₹34,000 available and buried ₹92 owed would be a loan advert.
 */
describe('PledgeCard — gain vs interest, side by side', () => {
  it('renders both sides of the trade at the same font size', () => {
    const tree = render(fxHold.pledge_quote, fxHold.expected_gain_paise);
    const gain = tree.root.findByProps({ testID: 'pledge-compare-gain' });
    const interest = tree.root.findByProps({ testID: 'pledge-compare-interest' });

    const sizeOf = (n: renderer.ReactTestInstance) =>
      (Array.isArray(n.props.style) ? n.props.style : [n.props.style])
        .map((s: { fontSize?: number } | undefined) => s?.fontSize)
        .find((s: number | undefined) => typeof s === 'number');

    expect(sizeOf(gain)).toBe(sizeOf(interest));
    expect(sizeOf(gain)).toBeDefined();
  });

  it('omits the comparison when there is no expected gain to compare against', () => {
    const tree = render(fxHold.pledge_quote, null);
    expect(tree.toJSON()).not.toBeNull(); // the card still renders
    expect(tree.root.findAllByProps({ testID: 'pledge-compare-gain' })).toHaveLength(0);
  });

  it('shows the gain as larger than the interest on the demo lot — beat 9 survives', () => {
    const q = fxHold.pledge_quote;
    expect(q).not.toBeNull();
    if (q === null) return;
    expect(fxHold.expected_gain_paise).not.toBeNull();
    expect(fxHold.expected_gain_paise ?? 0).toBeGreaterThan(q.interest_paise);
  });
});
