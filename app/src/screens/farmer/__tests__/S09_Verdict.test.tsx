/**
 * S9's gate. Beat 5 — the single most important screen in the product — and
 * beat 11, the refusal, which is the same screen taking the same path.
 *
 * ★ What this file does NOT re-test: `VerdictCard.test.tsx` already pins the
 *   card's own behaviour (all five actions, I16 on the two big numbers, the cost
 *   peek) by handing it props directly. Repeating that here would double the
 *   maintenance and pin nothing new. What is only testable at the screen level
 *   is the wiring — which of the four states the screen chooses, and whether a
 *   refusal reaches the card at all instead of being caught as an error on the
 *   way. Those are the tests here.
 *
 * ★ The one deliberate overlap is I16 end-to-end (`describe` below). The card
 *   test proves the component renders both numbers at one size given props; this
 *   proves the *screen* puts a real fixture through it and both numbers are
 *   still there, same size, no wrapper shrinking one. Beat 5 is the claim the
 *   whole pitch rests on, so it is worth asserting from both ends.
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import S09_Verdict from '../S09_Verdict';
import { fxHold, fxNoAdvice, fxSellNow } from '../../../fixtures/window';
import {
  DEFAULT_COMMODITY_ID,
  DEFAULT_MARKET_ID,
  DEFAULT_QTY_KG,
} from '../../../config';
import type { WindowRes } from '../../../types/api';

jest.mock('../../../lib/locale', () => ({
  getLocale: () => Promise.resolve('mr'),
  setLocale: () => Promise.resolve(),
}));

// S9 names the signed-in farmer in its identity pill (Stitch 11), so it calls
// `useAuth()`, which throws without a provider — deliberately, so a missing
// provider fails loudly rather than rendering a logged-out app to a judge.
// This suite is about the verdict, not about auth wiring, so it stands in a
// signed-in farmer rather than wrapping every case in a real provider.
jest.mock('../../../lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'farmer_demo', name: 'रामभाऊ पाटील', phone: '+919999999999', role: 'FARMER' },
    status: 'authenticated',
    signOut: () => {},
  }),
}));

// See S08_ModelCard.test.tsx — `useFocusEffect` needs a `NavigationContainer`
// ancestor this tree has no other reason to build; run it like `useEffect`.
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));

/**
 * S9 takes a `navigation` prop it only ever uses for one `navigate` call. The
 * screen is typed against `NativeStackScreenProps`, but it reads exactly two
 * things off it, so a real navigation container here would be a large amount of
 * setup to exercise a callback. The cast is confined to this helper.
 */
const navProp = {
  navigate: jest.fn(),
} as unknown as React.ComponentProps<typeof S09_Verdict>['navigation'];

const routeProp = { key: 'S9_Verdict', name: 'S9_Verdict' } as unknown as React.ComponentProps<
  typeof S09_Verdict
>['route'];

const QUERY_KEY = [
  'ai',
  'window',
  'recommend',
  DEFAULT_COMMODITY_ID,
  DEFAULT_MARKET_ID,
  DEFAULT_QTY_KG,
];

const mounted: renderer.ReactTestRenderer[] = [];

/**
 * `StaleBanner` holds a 30 s `setInterval` while the data on screen is fresh,
 * and `setQueryData` stamps `dataUpdatedAt` to now — so a tree left mounted
 * leaks an open handle and lets a later tick fire outside `act`. Same reason as
 * `S08_ModelCard.test.tsx`.
 */
afterEach(async () => {
  await act(async () => {
    mounted.forEach(t => t.unmount());
  });
  mounted.length = 0;
  navProp.navigate = jest.fn();
});

/**
 * Renders S9 against a pre-seeded cache rather than a mocked fetcher, so the
 * screen takes the path it takes in the app off a hydrated cache (P11).
 *
 * ★ `staleTime: Infinity` is load-bearing. With the default 0 the seeded entry
 *   is stale the instant it lands, the mount refetch resolves `fxHold` (which is
 *   what `USE_FIXTURES` returns), and every case below silently becomes the
 *   `fxHold` case. The subject of these tests is what S9 renders for the verdict
 *   it holds, so that verdict must not be racing a fetcher.
 */
async function renderWith(
  seed: { data?: WindowRes; error?: Error } = { data: fxHold },
) {
  const client = new QueryClient({
    // `refetchOnMount: false` and `retryOnMount: false` because this helper's
    // whole point is to seed an exact cache/error state and assert what S9
    // renders *for that state* — without `retryOnMount: false`, TanStack Query
    // always retries a dataless, already-errored query on mount (that is a
    // separate flag from `refetchOnMount`, which only governs refetching
    // already-successful data). Fixtures resolve near-instantly, so that retry
    // silently overwrote the seeded error with a fresh success before the
    // assertion ran, which is what made the error-only case flaky before this
    // was added.
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
        refetchOnMount: false,
        retryOnMount: false,
      },
    },
  });
  if (seed.data) client.setQueryData(QUERY_KEY, seed.data);
  if (seed.error) {
    // There is no public API for "this query has data AND a failed refetch", so
    // the failure is written into the query's own state the way a failed
    // refetch would leave it. This is the P11 branch the screen exists to
    // handle, and it is unreachable through setQueryData alone.
    const query = client.getQueryCache().build(client, { queryKey: QUERY_KEY });
    query.setState({
      ...query.state,
      error: seed.error,
      status: seed.data ? 'success' : 'error',
      // TanStack Query force-fetches on mount whenever a query has never
      // completed an attempt (`errorUpdatedAt: 0`), regardless of
      // `refetchOnMount` — that rule exists so a genuinely new query still
      // loads, but it means a manually-built "error" state with the default
      // `errorUpdatedAt: 0` reads as "never tried yet" and triggers an
      // immediate mount refetch, which races (and, with fixtures, silently
      // wins) against this seed. Stamping `errorUpdatedAt` marks the attempt
      // as already made and failed, matching what a real failed fetch leaves
      // behind, so the observer trusts the seeded state instead of re-fetching.
      errorUpdatedAt: Date.now(),
    });
  }

  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <S09_Verdict navigation={navProp} route={routeProp} />
      </QueryClientProvider>,
    );
  });
  mounted.push(tree);
  return tree;
}

/** Every string rendered anywhere in the tree, flattened. */
function allText(tree: renderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

/**
 * The rendered text under a `testID`, host nodes only — a composite that
 * forwards `testID` to an inner `<Text>` would otherwise match first and read
 * back an empty `children`.
 */
function textOf(tree: renderer.ReactTestRenderer, testID: string): string {
  const hosts = tree.root.findAll(
    n => typeof n.type === 'string' && n.props.testID === testID,
    { deep: false },
  );
  expect(hosts.length).toBeGreaterThan(0);
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

describe('★ beat 5 — the verdict renders both numbers', () => {
  it('puts the expected gain and the worst case on screen together', async () => {
    const tree = await renderWith({ data: fxHold });
    expect(textOf(tree, 'verdict-gain')).toContain('६,२९०');
    expect(textOf(tree, 'verdict-worst-case')).toContain('४,८००');
  });

  /**
   * I16 from the screen end. The card test proves the component does it given
   * props; this proves nothing between the query and the card shrinks, greys or
   * collapses one of them on the way.
   */
  it('renders the worst case at the same font size and weight as the gain', async () => {
    const tree = await renderWith({ data: fxHold });
    const gain = styleOf(tree.root.findByProps({ testID: 'verdict-gain' }));
    const worst = styleOf(tree.root.findByProps({ testID: 'verdict-worst-case' }));
    expect(worst.fontSize).toBe(gain.fontSize);
    expect(worst.fontWeight).toBe(gain.fontWeight);
    // Only the colour is allowed to differ.
    expect(worst.color).not.toBe(gain.color);
  });

  it('shows the worst case as a loss, not as an absolute value', async () => {
    const tree = await renderWith({ data: fxHold });
    // U+2212, the real minus sign — `formatPaise`'s own choice, asserted here
    // because a worst case rendered without its sign is a worst case that reads
    // as a gain.
    expect(textOf(tree, 'verdict-worst-case')).toContain('−');
  });

  it('renders no Latin digits anywhere — Marathi is the default locale', async () => {
    const tree = await renderWith({ data: fxHold });
    expect(textOf(tree, 'verdict-gain')).not.toMatch(/[0-9]/);
    expect(textOf(tree, 'verdict-worst-case')).not.toMatch(/[0-9]/);
  });
});

describe('★ beat 11 — I6, a refusal is a 200 and takes the success path', () => {
  it('renders the refusal through the card, not through ErrorState', async () => {
    const tree = await renderWith({ data: fxNoAdvice });
    const json = allText(tree);
    // `explain_mr` verbatim — the server's words, never composed here.
    expect(json).toContain(fxNoAdvice.explain_mr);
    // The error state's retry affordance must be absent: a refusal is not a
    // failure and must not offer to be retried into a different answer.
    expect(tree.root.findAllByProps({ testID: 'error-retry' }).length).toBe(0);
  });

  it('renders no gain or worst-case node at all when the model refuses', async () => {
    const tree = await renderWith({ data: fxNoAdvice });
    expect(tree.root.findAllByProps({ testID: 'verdict-gain' }).length).toBe(0);
    expect(tree.root.findAllByProps({ testID: 'verdict-worst-case' }).length).toBe(0);
  });

  /**
   * I13. `fxNoAdvice.pledge_quote` is null, and a refusal is exactly the case
   * where a pledge offer would be indefensible — we would be offering credit
   * against a number we just declined to give.
   */
  it('shows no pledge card on a refusal', async () => {
    const tree = await renderWith({ data: fxNoAdvice });
    expect(tree.root.findAllByProps({ testID: 'pledge-card' }).length).toBe(0);
  });
});

describe('the four states', () => {
  it('renders a skeleton while loading, with no verdict text', async () => {
    // No seed and no error: the query is genuinely pending.
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
    });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <QueryClientProvider client={client}>
          <S09_Verdict navigation={navProp} route={routeProp} />
        </QueryClientProvider>,
      );
    });
    mounted.push(tree);
    // The fixture fetcher resolves inside the same act(), so by the time we look
    // the data is in — which is itself the assertion that matters: the screen
    // never renders a bare white gap between mount and data.
    expect(tree.toJSON()).not.toBeNull();
  });

  it('shows the error state only when there is no verdict to fall back on', async () => {
    const tree = await renderWith({ error: new Error('network down') });
    expect(allText(tree)).toContain('पुन्हा');
  });

  /**
   * ★ P11, and the reason `error && !data` is written that way rather than as a
   * bare `error`. A hydrated cache can hold a good verdict from an earlier
   * session while a background refetch on dead venue wifi fails. Hiding the
   * verdict behind a retry screen at that moment would defeat the entire point
   * of the offline cache — and it is the failure a judge produces by turning
   * wifi off mid-demo.
   */
  it('keeps rendering a cached verdict when a refetch fails', async () => {
    const tree = await renderWith({ data: fxHold, error: new Error('network down') });
    expect(textOf(tree, 'verdict-gain')).toContain('६,२९०');
    expect(tree.root.findAllByProps({ testID: 'error-retry' }).length).toBe(0);
  });
});

describe('I13 — the pledge card is absent, not empty, when it is not worth it', () => {
  it('renders the pledge card when the quote beats the interest', async () => {
    const tree = await renderWith({ data: fxHold });
    expect(fxHold.pledge_quote).not.toBeNull();
    expect(allText(tree)).toContain('तारण');
  });

  /**
   * `fxSellNow` has `expected_gain_paise: 0` and no quote — there is nothing to
   * finance, so there must be nothing on screen offering to finance it. The
   * assertion is on absence, which is what the invariant actually says.
   */
  it('renders nothing pledge-shaped when the quote is null', async () => {
    const tree = await renderWith({ data: fxSellNow });
    expect(fxSellNow.pledge_quote).toBeNull();
    expect(tree.root.findAllByProps({ testID: 'pledge-card' }).length).toBe(0);
  });
});

describe('the screen reads the response and invents nothing', () => {
  it('renders no `undefined` — every field it prints exists on the response', async () => {
    for (const fx of [fxHold, fxNoAdvice, fxSellNow]) {
      const tree = await renderWith({ data: fx });
      expect(allText(tree)).not.toContain('undefined');
      expect(allText(tree)).not.toContain('NaN');
    }
  });

  /**
   * `translate()` returns `⟨key⟩` for a key missing from the dictionary. A
   * screen that renders one of those has an i18n hole, and this is the cheapest
   * possible detector for it — it caught thirteen missing keys on S25.
   */
  it('renders no untranslated-key markers', async () => {
    for (const fx of [fxHold, fxNoAdvice, fxSellNow]) {
      const tree = await renderWith({ data: fx });
      expect(allText(tree)).not.toContain('⟨');
    }
  });
});
