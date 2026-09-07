/**
 * S8's gate. The screen's whole claim is "we tell you how good we are, including
 * when the answer is bad", so the tests that matter are the ones about the bad
 * branch — a suite that only ever renders `fxModelCard` would pass against a
 * screen that hides `mase >= 1.0` entirely.
 *
 * ★ What is deliberately NOT asserted: that the screen computes or corrects
 *   anything. `mase` is printed as it arrives, `coverage_80_bps` is printed as it
 *   arrives. The only derived value on screen is the `mase < 1` verdict, which is
 *   the *definition* of MASE against a baseline and not a policy this screen
 *   invents — and it is derived in one place, so a test can pin it.
 *
 * ★ The fixture-agreement tests are contract tests, not screen tests: S7's inline
 *   `ModelCardSummary` and S8's full `ModelCard` must carry the same two numbers,
 *   and S8's corpus window must match what S24 says about the same corpus. Both
 *   are properties of the fixtures, so they are checked against the fixtures
 *   directly — that is where a real response violating them will show up.
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import S08_ModelCard from '../S08_ModelCard';
import { fxModelCard, fxModelCardWorseThanBaseline } from '../../../fixtures/modelCard';
import { fxForecast } from '../../../fixtures/forecast';
import { fxHold, fxNoAdvice } from '../../../fixtures/window';
import { fxProvenance } from '../../../fixtures/provenance';
import { DEFAULT_COMMODITY_ID } from '../../../config';
import type { ModelCard } from '../../../types/api';

jest.mock('../../../lib/locale', () => ({
  getLocale: () => Promise.resolve('mr'),
  setLocale: () => Promise.resolve(),
}));

// `useFocusEffect` needs a real `NavigationContainer` ancestor to have a focus
// state to key off of, which this file's tree has no reason to build just to
// get a locale re-fetch — the same reason S06/S07/etc.'s suites do this. Run
// the callback the way `useEffect` used to: once, on mount.
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));

/**
 * Renders S8 with a pre-seeded cache rather than by mocking the fetcher, so the
 * screen takes the same path it takes in the app off a hydrated cache (P11).
 * `USE_FIXTURES` means the real `queryFn` would return `fxModelCard` anyway; this
 * is how the worse-than-baseline card gets in.
 *
 * ★ `staleTime: Infinity` is load-bearing, not tidiness. With the default 0 the
 *   seeded entry is stale the instant it lands, so the mount refetch resolves
 *   `fxModelCard` and overwrites the card under test — which is precisely how the
 *   `horizon_days: 7` case failed with `१४` on screen. The subject of these tests
 *   is "what does S8 render for the card it holds", so the card it holds must not
 *   be racing a fetcher.
 */
async function renderWith(card: ModelCard) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
  });
  client.setQueryData(['ai', 'model-card', DEFAULT_COMMODITY_ID], card);

  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <S08_ModelCard />
      </QueryClientProvider>,
    );
  });
  mounted.push(tree);
  return tree;
}

/**
 * Every tree this file mounts, torn down after each test. `StaleBanner` keeps a
 * 30 s `setInterval` alive while the data on screen is still fresh — which is the
 * case here, since `setQueryData` stamps `dataUpdatedAt` to now — so a tree left
 * mounted holds an open handle and lets a later tick fire outside `act`. Both of
 * those showed up as noise on the last run rather than as failures, which is the
 * kind of warning that stops being read.
 */
const mounted: renderer.ReactTestRenderer[] = [];

afterEach(async () => {
  await act(async () => {
    mounted.forEach(t => t.unmount());
  });
  mounted.length = 0;
});

/** Every string rendered anywhere in the tree, flattened. */
function allText(tree: renderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

/**
 * The rendered text under a `testID`.
 *
 * Deliberately filters to **host** nodes (`typeof type === 'string'`): the `Row`
 * helper takes `testID` as a prop and passes it down to its inner `<Text>`, so a
 * plain `findByProps({testID})` matches the composite first and reads an empty
 * `children`. Anchoring on the host node is what makes this work identically for
 * a `testID` written straight onto a `<Text>` and one threaded through a helper.
 */
function textOf(tree: renderer.ReactTestRenderer, testID: string): string {
  const hosts = tree.root.findAll(
    n => typeof n.type === 'string' && n.props.testID === testID,
    { deep: false },
  );
  expect(hosts.length).toBeGreaterThan(0);

  // Depth-first over rendered children, so interpolated fragments come back in
  // the order they appear on screen rather than in prop order.
  const collect = (node: renderer.ReactTestInstance | string): string => {
    if (typeof node === 'string') return node;
    return node.children.map(collect).join('');
  };
  return collect(hosts[0]);
}

/** Walks a style prop that may be an object, an array, or nested arrays. */
function styleOf(node: { props: { style?: unknown } }): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  const walk = (s: unknown): void => {
    if (Array.isArray(s)) return s.forEach(walk);
    if (s && typeof s === 'object') Object.assign(flat, s);
  };
  walk(node.props.style);
  return flat;
}

describe('S8 renders the model card it is given', () => {
  it('shows MASE to two decimals in Devanagari, not Latin digits', async () => {
    const tree = await renderWith(fxModelCard);
    expect(textOf(tree, 'mase-value')).toBe('०.७१');
    expect(textOf(tree, 'mase-value')).not.toMatch(/[0-9]/);
  });

  it('prints the algo string verbatim — no prettifying', async () => {
    const tree = await renderWith(fxModelCard);
    expect(textOf(tree, 'algo-value')).toBe('lightgbm_quantile');
  });

  it('shows coverage against its nominal, so the gap is on screen', async () => {
    const tree = await renderWith(fxModelCard);
    // 7840 bps floors to 78%, nominal 8000 -> 80%.
    expect(textOf(tree, 'coverage-value')).toBe('७८% (लक्ष्य ८०%)');
  });

  it('renders the real training corpus, not a placeholder', async () => {
    const tree = await renderWith(fxModelCard);
    expect(textOf(tree, 'train-rows-value')).toBe('४१२ नोंदी');
    expect(textOf(tree, 'train-window-value')).toContain('जानेवारी');
    expect(textOf(tree, 'train-window-value')).toContain('सप्टेंबर');
  });

  it('names the baseline the MASE is measured against — a MASE with no baseline is meaningless', async () => {
    const tree = await renderWith(fxModelCard);
    expect(textOf(tree, 'baseline-value')).toContain('हंगामी');
  });
});

describe('★ the branch that matters — mase >= 1.0 is shown, not hidden', () => {
  it('says outright that the model is worse than the baseline', async () => {
    const tree = await renderWith(fxModelCardWorseThanBaseline);
    expect(textOf(tree, 'mase-value')).toBe('१.१४');
    expect(textOf(tree, 'mase-verdict')).toContain('वाईट');
  });

  it('claims better than baseline only when mase < 1', async () => {
    const good = await renderWith(fxModelCard);
    expect(textOf(good, 'mase-verdict')).toContain('चांगले');
    expect(textOf(good, 'mase-verdict')).not.toContain('वाईट');
  });

  /**
   * The I16 instinct turned on ourselves: a bad number rendered smaller than a
   * good one is a bad number being hidden. Same style object, so this cannot
   * drift — but assert it, because "same style object" is exactly the kind of
   * thing a later refactor splits in two.
   */
  it('renders the bad verdict at the same font size as the good one', async () => {
    const good = await renderWith(fxModelCard);
    const bad = await renderWith(fxModelCardWorseThanBaseline);
    const goodStyle = styleOf(good.root.findByProps({ testID: 'mase-verdict' }));
    const badStyle = styleOf(bad.root.findByProps({ testID: 'mase-verdict' }));
    expect(badStyle.fontSize).toBe(goodStyle.fontSize);
    expect(badStyle.fontWeight).toBe(goodStyle.fontWeight);
  });

  it('renders the value at the same size in both branches too — only the colour changes', async () => {
    const good = await renderWith(fxModelCard);
    const bad = await renderWith(fxModelCardWorseThanBaseline);
    const g = styleOf(good.root.findByProps({ testID: 'mase-value' }));
    const b = styleOf(bad.root.findByProps({ testID: 'mase-value' }));
    expect(b.fontSize).toBe(g.fontSize);
    expect(b.color).not.toBe(g.color);
  });

  it('states the coverage shortfall as a limitation when the band under-covers', async () => {
    const tree = await renderWith(fxModelCardWorseThanBaseline);
    // 8000 − 6120 = 1880 bps -> १८%
    expect(textOf(tree, 'limitation-3')).toContain('१८%');
  });
});

describe('the limitations block states only what this response supports', () => {
  it('names the horizon ceiling from the response, not a hardcoded 14', async () => {
    const tree = await renderWith({ ...fxModelCard, horizon_days: 7 });
    expect(textOf(tree, 'limitation-0')).toContain('७ दिवसांपुढचा');
  });

  it('says the refusal is deliberate — I6, in the farmer\'s words', async () => {
    const tree = await renderWith(fxModelCard);
    expect(textOf(tree, 'limitation-4')).toContain('नकार');
  });

  /**
   * PRANAY.md §1.4 asks S8 for `known_limitations` and `model_version`. Neither
   * exists in CANON §7.4 or in our `ModelCard` type, so the screen must not read
   * them off the response — this pins that it doesn't, which is what stops a
   * later edit from quietly inventing a wire field. See the TODO(nikhil) in the
   * screen header.
   */
  it('does not read a known_limitations or model_version field off the response', async () => {
    const tree = await renderWith(fxModelCard);
    const json = allText(tree);
    expect(json).not.toContain('undefined');
    expect(Object.keys(fxModelCard)).not.toContain('known_limitations');
    expect(Object.keys(fxModelCard)).not.toContain('model_version');
  });
});

describe('★ contract — S8 cannot disagree with S7, S9 or S24 about the same model', () => {
  it('carries the same two numbers as the inline model_card on the forecast', () => {
    expect(fxModelCard.mase).toBe(fxForecast.model_card.mase);
    expect(fxModelCard.coverage_80_bps).toBe(fxForecast.model_card.coverage_80_bps);
  });

  it('and as the inline model_card on both the verdict and the refusal', () => {
    for (const fx of [fxHold, fxNoAdvice]) {
      expect(fx.model_card.mase).toBe(fxModelCard.mase);
      expect(fx.model_card.coverage_80_bps).toBe(fxModelCard.coverage_80_bps);
    }
  });

  it('describes the same corpus S24 does — one row count, one window', () => {
    const lasalgaon = fxProvenance.rows.find(r => r.market_id === 'mkt_lasalgaon');
    expect(lasalgaon).toBeDefined();
    expect(fxModelCard.train_rows).toBe(lasalgaon?.row_count);
    expect(fxModelCard.train_from).toBe(lasalgaon?.first_obs_date);
    expect(fxModelCard.train_to).toBe(lasalgaon?.last_obs_date);
  });

  it('coverage is a measured value, not the nominal 8000 — a round number here is a tell', () => {
    expect(fxModelCard.coverage_80_bps).not.toBe(8000);
    expect(Number.isInteger(fxModelCard.coverage_80_bps)).toBe(true);
  });

  it('trained_at carries an offset, so a device timezone cannot shift the date', () => {
    expect(fxModelCard.trained_at).toMatch(/[+-]\d{2}:\d{2}$/);
  });

  it('the horizon matches the one the forecast actually returns', () => {
    expect(fxModelCard.horizon_days).toBe(fxForecast.points.length);
  });
});
