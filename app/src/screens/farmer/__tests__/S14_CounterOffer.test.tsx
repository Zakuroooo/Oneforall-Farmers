/**
 * S14's gate. Demo beat 9 — "the middleman beat".
 *
 * ★ The load-bearing test in this file is the ordering one. PRANAY.md §1.5:
 *   "The farmer's own forecast is rendered *directly above* the input box where
 *   he types his counter-price. That single layout decision is the entire 'we
 *   removed the middleman' claim, made visible." That is a claim about JSX
 *   order, so it is asserted as one — `toJSON()` preserves document order, so a
 *   smaller offset in the serialised tree means "rendered above". Nothing else
 *   in the suite would notice if someone moved the chart below the buttons to
 *   tidy up the layout, and moving it there would silently delete the feature.
 *
 * ★ The second is the round-3 lockout. S14's own header: "The counter button is
 *   disabled on round 3 from `OfferDto.round` itself, not left for the 409 to
 *   catch — a farmer should never be told 'no' after typing a price and tapping
 *   submit when the screen already knew."
 */

import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import S14_CounterOffer from '../S14_CounterOffer';
import { fxIncomingOffer, fxIncomingOfferLastRound } from '../../../fixtures/offers';
import { fxForecast } from '../../../fixtures/forecast';
import { Button } from '../../../components/ui/Button';
import { ForecastFan } from '../../../components/charts/ForecastFan';
import { translate } from '../../../lib/i18n';
import { formatNumber, formatPaise, toQuintal } from '../../../lib/money';
import type { ForecastRes, OfferDto } from '../../../types/api';

jest.mock('../../../lib/locale', () => ({
  getLocale: () => Promise.resolve('mr'),
  setLocale: () => Promise.resolve(),
}));

type Props = React.ComponentProps<typeof S14_CounterOffer>;

/** S14 destructures only `route`; `navigation` exists to satisfy the prop type. */
const navProp = { navigate: jest.fn() } as unknown as Props['navigation'];

function routeFor(offerId: string): Props['route'] {
  return {
    key: 'S14_CounterOffer',
    name: 'S14_CounterOffer',
    params: { offer_id: offerId },
  } as unknown as Props['route'];
}

const mounted: renderer.ReactTestRenderer[] = [];

afterEach(async () => {
  await act(async () => {
    mounted.forEach(t => t.unmount());
  });
  mounted.length = 0;
});

/**
 * Seeds the cache the screen reads rather than mocking its fetcher, so the
 * screen takes the same path it takes off a hydrated cache (P11).
 *
 * ★ `staleTime: Infinity` is load-bearing, same as in `S09_Verdict.test.tsx`:
 *   with the default 0 the seeded entry is stale on arrival, the mount refetch
 *   resolves whatever `USE_FIXTURES` returns — which is `fxIncomingOffer` for
 *   every id, and `null` for any other — and the round-3 case below would
 *   quietly become the round-1 case.
 */
async function renderWith(
  seed: { offer?: OfferDto; forecast?: ForecastRes; error?: Error } = { offer: fxIncomingOffer },
) {
  const offerId = seed.offer?.id ?? fxIncomingOffer.id;
  const key = ['offers', offerId, 'withForecast'];
  const client = new QueryClient({
    // `retryOnMount: false` — without it, TanStack Query force-retries a
    // dataless, already-errored query the instant a new observer mounts
    // (that rule is separate from `refetchOnMount`, which only governs
    // refetching already-successful data). Fixtures resolve near-instantly,
    // so that retry silently overwrote the seeded error-only state with a
    // fresh success before any assertion could run.
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity, refetchOnMount: false, retryOnMount: false },
    },
  });
  if (seed.offer) {
    client.setQueryData(key, { offer: seed.offer, forecast: seed.forecast ?? fxForecast });
  }
  if (seed.error) {
    // No public API produces "has data AND a failed refetch", which is exactly
    // the P11 branch `error && !data` exists for. Written into query state the
    // way a failed refetch would leave it.
    const query = client.getQueryCache().build(client, { queryKey: key });
    query.setState({
      ...query.state,
      error: seed.error,
      status: seed.offer ? 'success' : 'error',
      // Stamps this as an attempt that already happened and failed — see the
      // matching comment in S09_Verdict.test.tsx's renderWith for why this is
      // required alongside retryOnMount.
      errorUpdatedAt: Date.now(),
    });
  }

  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <S14_CounterOffer navigation={navProp} route={routeFor(offerId)} />
      </QueryClientProvider>,
    );
  });
  mounted.push(tree);
  return tree;
}

/** Every string rendered anywhere in the tree, flattened. */
function allText(tree: renderer.ReactTestRenderer): string {
  // Walks the rendered tree collecting only actual string content, not
  // `JSON.stringify(tree.toJSON())` — the JSON-dump approach escapes embedded
  // double quotes (e.g. `offer_accepted_message`'s `"माझे लॉट"`) as `\"`,
  // which then never matches a `.toContain()` check against the raw,
  // unescaped translated string. It also mixes in style-prop numbers, which
  // is noise no assertion here actually wants.
  const collect = (node: unknown): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(collect).join('');
    if (node && typeof node === 'object') {
      // `placeholder` (TextInput) and `accessibilityLabel` carry user-visible
      // or user-audible text that never appears as a `children` string, but
      // still needs to be reachable by these substring checks — the ordering
      // test below locates the counter-price field by its placeholder.
      const props = (node as { props?: Record<string, unknown> }).props;
      const propText =
        typeof props?.placeholder === 'string'
          ? props.placeholder
          : typeof props?.accessibilityLabel === 'string'
            ? props.accessibilityLabel
            : '';
      const children = (node as { children?: unknown[] | null }).children;
      return propText + (children ? children.map(collect).join('') : '');
    }
    return '';
  };
  return collect(tree.toJSON());
}

/** The single `Button` carrying this title. */
function buttonByTitle(tree: renderer.ReactTestRenderer, title: string) {
  const found = tree.root.findAll(n => n.type === Button && n.props.title === title);
  expect(found.length).toBe(1);
  return found[0];
}

async function press(tree: renderer.ReactTestRenderer, title: string): Promise<void> {
  const onPress = buttonByTitle(tree, title).props.onPress as () => void;
  await act(async () => {
    onPress();
    // `onPress` calls `mutate()`, which is fire-and-forget from the caller's
    // side — the mutation's own async chain (mutationFn's promise settling,
    // then useMutation's internal state dispatch, then React's commit) runs
    // over more ticks than a bare `act(() => onPress())` drains. Without
    // yielding here, `act` closes mid-chain and the assertion right after
    // `press()` still sees the pre-press button row. A macrotask (not just
    // microtasks) is needed because TanStack Query's notifyManager batches
    // its notifications via setTimeout in this environment.
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

async function type(tree: renderer.ReactTestRenderer, text: string): Promise<void> {
  const input = tree.root.findByType(TextInput);
  const onChangeText = input.props.onChangeText as (t: string) => void;
  await act(async () => {
    onChangeText(text);
  });
}

const ACCEPT = translate('accept_button', 'mr');
const COUNTER = translate('counter_button', 'mr');
const REJECT = translate('reject_button', 'mr');

describe('★ beat 9 — the forecast sits above the input, and that is the feature', () => {
  it('renders the forecast fan', async () => {
    const tree = await renderWith();
    expect(tree.root.findAllByType(ForecastFan).length).toBe(1);
  });

  /**
   * ★ The ordering assertion. The marker for the chart is a string rendered
   * *inside* `ForecastFan` (its band legend), not the section label above it —
   * a label would still be in place if the chart itself had been moved or
   * removed, and then this test would pass while the feature was gone.
   */
  it('renders the fan before the counter-price input in document order', async () => {
    const tree = await renderWith();
    const json = allText(tree);
    const fanOffset = json.indexOf(translate('chart_band_legend', 'mr'));
    const inputOffset = json.indexOf(translate('counter_price_placeholder', 'mr'));
    expect(fanOffset).toBeGreaterThan(-1);
    expect(inputOffset).toBeGreaterThan(-1);
    expect(fanOffset).toBeLessThan(inputOffset);
  });

  it('renders the buyer offer above the fan — the price being argued with comes first', async () => {
    const tree = await renderWith();
    const json = allText(tree);
    expect(json.indexOf(formatPaise(fxIncomingOffer.price_paise_per_qtl, 'mr'))).toBeLessThan(
      json.indexOf(translate('chart_band_legend', 'mr')),
    );
  });
});

describe('★ the round-3 lockout comes from `round`, not from a 409', () => {
  it('leaves the counter button live on round 1', async () => {
    expect(fxIncomingOffer.round).toBe(1);
    const tree = await renderWith({ offer: fxIncomingOffer });
    await type(tree, '195000');
    expect(buttonByTitle(tree, COUNTER).props.disabled).toBe(false);
  });

  it('disables the counter button and the input on round 3', async () => {
    expect(fxIncomingOfferLastRound.round).toBe(3);
    const tree = await renderWith({ offer: fxIncomingOfferLastRound });
    expect(buttonByTitle(tree, COUNTER).props.disabled).toBe(true);
    expect(tree.root.findByType(TextInput).props.editable).toBe(false);
  });

  it('says why the counter button is dead instead of just greying it out', async () => {
    const tree = await renderWith({ offer: fxIncomingOfferLastRound });
    expect(allText(tree)).toContain(translate('last_round_note', 'mr'));
  });

  it('still allows accept and reject on round 3 — the offer is not dead, only the counter', async () => {
    const tree = await renderWith({ offer: fxIncomingOfferLastRound });
    expect(buttonByTitle(tree, ACCEPT).props.disabled).toBeFalsy();
    expect(buttonByTitle(tree, REJECT).props.disabled).toBeFalsy();
  });
});

describe('the counter button is gated on a usable price', () => {
  it('is disabled with an empty input', async () => {
    const tree = await renderWith();
    expect(buttonByTitle(tree, COUNTER).props.disabled).toBe(true);
  });

  it('is disabled on whitespace and on non-numeric text', async () => {
    const tree = await renderWith();
    for (const bad of ['   ', 'abc', '-500', '0']) {
      await type(tree, bad);
      expect(buttonByTitle(tree, COUNTER).props.disabled).toBe(true);
    }
  });
});

describe('the three actions', () => {
  it('confirms an accepted offer', async () => {
    const tree = await renderWith();
    await press(tree, ACCEPT);
    expect(allText(tree)).toContain(translate('offer_accepted_message', 'mr'));
  });

  it('confirms a rejected offer', async () => {
    const tree = await renderWith();
    await press(tree, REJECT);
    expect(allText(tree)).toContain(translate('offer_rejected_message', 'mr'));
  });

  /**
   * Countering round 1 must produce round 2 — the increment is the thing that
   * eventually trips `MAX_ROUND`, so a counter that leaves `round` where it was
   * would make the lockout above unreachable.
   */
  it('increments the round and echoes the price the farmer typed', async () => {
    const tree = await renderWith({ offer: fxIncomingOffer });
    await type(tree, '195000');
    await press(tree, COUNTER);
    expect(allText(tree)).toContain(
      translate('offer_countered_message', 'mr', {
        price: formatPaise(195000, 'mr'),
        round: formatNumber(fxIncomingOffer.round + 1, 'mr'),
      }),
    );
  });
});

describe('the four states', () => {
  it('shows the error state only when there is no offer to fall back on', async () => {
    const tree = await renderWith({ error: new Error('network down') });
    expect(allText(tree)).toContain(translate('offer_fetch_error', 'mr'));
  });

  /**
   * ★ P11. Beat 7 turns airplane mode on and beat 9 comes after it, so a failed
   * background refetch must not take the negotiation off the table. The offer
   * and the fan both survive; nothing offers to retry.
   */
  it('keeps rendering a cached offer when a refetch fails', async () => {
    const tree = await renderWith({ offer: fxIncomingOffer, error: new Error('network down') });
    expect(allText(tree)).toContain(formatPaise(fxIncomingOffer.price_paise_per_qtl, 'mr'));
    expect(tree.root.findAllByType(ForecastFan).length).toBe(1);
    expect(allText(tree)).not.toContain(translate('offer_fetch_error', 'mr'));
  });

  it('renders a named empty state when the offer resolves to nothing', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
    });
    client.setQueryData(['offers', 'offer_missing', 'withForecast'], null);
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <QueryClientProvider client={client}>
          <S14_CounterOffer navigation={navProp} route={routeFor('offer_missing')} />
        </QueryClientProvider>,
      );
    });
    mounted.push(tree);
    expect(allText(tree)).toContain(translate('offer_not_found', 'mr'));
  });
});

describe('units and hygiene', () => {
  /** I2: kg on the wire, quintals on screen, floored. */
  it('renders the quantity in quintals, never the raw kg figure', async () => {
    const tree = await renderWith();
    const json = allText(tree);
    expect(json).toContain(formatNumber(toQuintal(fxIncomingOffer.qty_kg), 'mr'));
    expect(json).not.toContain(String(fxIncomingOffer.qty_kg));
  });

  it('renders no Latin digits, no `undefined`, no `NaN`', async () => {
    for (const offer of [fxIncomingOffer, fxIncomingOfferLastRound]) {
      const tree = await renderWith({ offer });
      const json = allText(tree);
      expect(json).not.toContain('undefined');
      expect(json).not.toContain('NaN');
    }
  });

  /** `translate()` renders `⟨key⟩` for a key that is not in the dictionary. */
  it('renders no untranslated-key markers', async () => {
    for (const offer of [fxIncomingOffer, fxIncomingOfferLastRound]) {
      const tree = await renderWith({ offer });
      expect(allText(tree)).not.toContain('⟨');
    }
  });
});
