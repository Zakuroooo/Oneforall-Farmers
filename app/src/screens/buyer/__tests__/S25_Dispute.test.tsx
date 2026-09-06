/**
 * S25's gate.
 *
 * ★ The load-bearing test in this file is `does not offer the buyer any way to
 *   resolve his own dispute`. CANON §7.7's diagram makes `DISPUTED → RELEASED`
 *   and `DISPUTED → REFUNDED` mediation outcomes; the complainant is not the
 *   arbiter. The screen that shipped before this one had a "resolve" button, and
 *   `dispute_resolve_button` is *still in the dictionaries* — so if someone puts
 *   that button back to make the flow feel finished, the key resolves, the UI
 *   looks plausible, and only this assertion notices that we are now showing a
 *   judge a transition the server would 409.
 *
 * ★ The second is `does not fabricate an event row for a dispute it just
 *   raised`. `dispute_events` is append-only (I5) and `POST /disputes` returns a
 *   dispute, not an event. A client-side `RAISED` row would be a row the
 *   database does not have, rendered as though it did.
 *
 * ★ The third is the gross/net one. Both numbers are true of the same
 *   transaction and they differ by ₹1,230 of deductions; showing the farmer's
 *   net to the buyer who paid gross is the kind of error that survives every
 *   other test in this suite.
 */

import React from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { S25_Dispute } from '../S25_Dispute';
import { Button } from '../../../components/ui/Button';
import { fxTx } from '../../../fixtures/escrow';
import { fxDispute, fxDisputeEvents, fxDisputeRes } from '../../../fixtures/disputes';
import { translate } from '../../../lib/i18n';
import { formatDate } from '../../../lib/dates';
import { formatPaise } from '../../../lib/money';
import type { DisputeRes, TxDto, TxStatus } from '../../../types/api';

jest.mock('../../../lib/locale', () => ({
  getLocale: () => Promise.resolve('mr'),
  setLocale: () => Promise.resolve(),
}));

const mounted: renderer.ReactTestRenderer[] = [];

afterEach(async () => {
  await act(async () => {
    mounted.forEach(t => t.unmount());
  });
  mounted.length = 0;
});

/**
 * Seeds both queries the screen reads rather than mocking its fetchers.
 *
 * ★ `staleTime: Infinity` is load-bearing. Under fixtures `fetchTx` returns
 *   `fxTx` — status `DISPATCHED` — for *every* id, so with the default staleTime
 *   of 0 the mount refetch would overwrite every seeded status and each of the
 *   eight `canDispute` cases below would quietly become the DISPATCHED case.
 *   Same trap as `S14_CounterOffer.test.tsx`.
 */
async function renderWith(
  seed: {
    tx?: TxDto | null;
    dispute?: DisputeRes | null;
    error?: Error;
    txId?: string;
  } = {},
) {
  const txId = seed.txId ?? fxTx.id;
  const txKey = ['tx', txId];
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
        refetchOnMount: false,
        // Separate from `refetchOnMount` — without it TanStack Query
        // force-retries a dataless errored query the moment an observer mounts,
        // and the fixture resolves fast enough to erase the seeded error.
        retryOnMount: false,
      },
    },
  });

  if (seed.tx !== undefined) client.setQueryData(txKey, seed.tx);
  client.setQueryData(['tx', txId, 'dispute'], seed.dispute ?? null);

  if (seed.error) {
    // No public API produces "has data AND a failed refetch" — the exact P11
    // branch. Written into query state the way a failed refetch leaves it.
    const query = client.getQueryCache().build(client, { queryKey: txKey });
    query.setState({
      ...query.state,
      error: seed.error,
      status: seed.tx ? 'success' : 'error',
      errorUpdatedAt: Date.now(),
    });
  }

  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <S25_Dispute txId={txId} />
      </QueryClientProvider>,
    );
  });
  mounted.push(tree);
  return tree;
}

/** Every string rendered anywhere in the tree, including placeholders. */
function allText(tree: renderer.ReactTestRenderer): string {
  const collect = (node: unknown): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(collect).join('');
    if (node && typeof node === 'object') {
      const props = (node as { props?: Record<string, unknown> }).props;
      const propText = typeof props?.placeholder === 'string' ? props.placeholder : '';
      const children = (node as { children?: unknown[] | null }).children;
      return propText + (children ? children.map(collect).join('') : '');
    }
    return '';
  };
  return collect(tree.toJSON());
}

/**
 * The reason chips, in CANON §6.4's declared order.
 *
 * Filtered on `accessibilityRole` rather than just on `TouchableOpacity`: the
 * `Button` at the bottom of the form is itself a TouchableOpacity, so a bare
 * type match returns five nodes on the form branch and the fifth is the submit
 * button. The role is also what a screen reader keys off, so asserting through
 * it means a chip that loses its role fails here.
 */
const chips = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAll(n => n.type === TouchableOpacity && n.props.accessibilityRole === 'radio');

async function pickReason(tree: renderer.ReactTestRenderer, index: number): Promise<void> {
  const onPress = chips(tree)[index].props.onPress as () => void;
  await act(async () => {
    onPress();
  });
}

async function type(tree: renderer.ReactTestRenderer, text: string): Promise<void> {
  const onChangeText = tree.root.findByType(TextInput).props.onChangeText as (t: string) => void;
  await act(async () => {
    onChangeText(text);
  });
}

async function submit(tree: renderer.ReactTestRenderer): Promise<void> {
  const found = tree.root.findAll(n => n.type === Button && n.props.title === RAISE);
  expect(found.length).toBe(1);
  const onPress = found[0].props.onPress as () => void;
  await act(async () => {
    onPress();
    // The mutation's chain — mutationFn settling, useMutation's dispatch, then
    // React's commit — outlives a bare synchronous act. TanStack Query batches
    // notifications through setTimeout here, so a macrotask is required.
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

const RAISE = translate('dispute_raise_button', 'mr');
const RESOLVE = translate('dispute_resolve_button', 'mr');
const MEDIATION_NOTE = translate('dispute_mediation_note', 'mr');
const NOT_DISPUTABLE = translate('dispute_not_disputable', 'mr');
const UNREADABLE = translate('dispute_exists_unreadable', 'mr');
const TIMELINE_TITLE = translate('dispute_timeline_title', 'mr');

/** CANON §7.7 — DISPUTED is reachable only from these two. */
const DISPUTABLE: TxStatus[] = ['DISPATCHED', 'DELIVERED'];
const NOT_YET_OR_OVER: TxStatus[] = [
  'CREATED',
  'ESCROW_HELD',
  'RELEASED',
  'REFUNDED',
  'CANCELLED',
];

const txWith = (status: TxStatus): TxDto => ({ ...fxTx, status });

describe('★ the buyer cannot decide his own dispute', () => {
  it('does not offer any resolve affordance on an open dispute', async () => {
    const tree = await renderWith({ tx: txWith('DISPUTED'), dispute: fxDisputeRes });
    expect(allText(tree)).not.toContain(RESOLVE);
    // Not "no button with that title" — no button at all. The dispute branch is
    // read-only, so a new button of any label is a change this should catch.
    expect(tree.root.findAllByType(Button).length).toBe(0);
    expect(tree.root.findAllByType(TextInput).length).toBe(0);
  });

  it('says who does decide, and that escrow stays held until they do', async () => {
    const tree = await renderWith({ tx: txWith('DISPUTED'), dispute: fxDisputeRes });
    expect(allText(tree)).toContain(MEDIATION_NOTE);
  });

  it('does not offer a resolve affordance after the buyer raises one himself', async () => {
    const tree = await renderWith({ tx: txWith('DISPATCHED') });
    await pickReason(tree, 0);
    await type(tree, 'ग्रेड A ऐवजी B आहे.');
    await submit(tree);
    expect(allText(tree)).not.toContain(RESOLVE);
    expect(tree.root.findAllByType(Button).length).toBe(0);
  });
});

describe('★ I5 — no event row the database does not have', () => {
  it('renders the timeline for a dispute whose events are real', async () => {
    const tree = await renderWith({ tx: txWith('DISPUTED'), dispute: fxDisputeRes });
    const text = allText(tree);
    expect(text).toContain(TIMELINE_TITLE);
    for (const ev of fxDisputeEvents) {
      expect(text).toContain(formatDate(ev.created_at, 'mr'));
      if (ev.note) expect(text).toContain(ev.note);
    }
  });

  it('renders no timeline at all for a dispute it just created', async () => {
    const tree = await renderWith({ tx: txWith('DISPATCHED') });
    await pickReason(tree, 0);
    await type(tree, 'वजन कमी भरले.');
    await submit(tree);
    const text = allText(tree);
    // The dispute itself is on screen…
    expect(text).toContain(translate('dispute_stage_raised', 'mr'));
    // …but POST /disputes returned no event, so there is nothing to list.
    expect(text).not.toContain(TIMELINE_TITLE);
  });
});

describe('★ the amount is what the buyer paid, not what the farmer receives', () => {
  it('renders gross_paise and not net_paise', async () => {
    expect(fxTx.gross_paise).not.toBe(fxTx.net_paise);
    const text = allText(await renderWith({ tx: fxTx }));
    expect(text).toContain(formatPaise(fxTx.gross_paise, 'mr'));
    expect(text).not.toContain(formatPaise(fxTx.net_paise, 'mr'));
  });
});

describe('the canDispute gate comes from the FSM, not from a 409', () => {
  it.each(DISPUTABLE)('offers the form on %s', async status => {
    const tree = await renderWith({ tx: txWith(status) });
    expect(tree.root.findAllByType(TextInput).length).toBe(1);
    expect(chips(tree).length).toBe(4);
    expect(allText(tree)).not.toContain(NOT_DISPUTABLE);
  });

  it.each(NOT_YET_OR_OVER)('withholds the form on %s and says why', async status => {
    const tree = await renderWith({ tx: txWith(status) });
    expect(tree.root.findAllByType(TextInput).length).toBe(0);
    expect(tree.root.findAllByType(Button).length).toBe(0);
    expect(allText(tree)).toContain(NOT_DISPUTABLE);
  });

  /**
   * The contract gap, made visible instead of papered over: nothing in CANON
   * gets you from a transaction to its dispute, so against a live API an
   * already-disputed tx has no readable complaint. Handing the buyer a form
   * here would file a second one.
   */
  it('offers no second form on an already-disputed tx it cannot read', async () => {
    const tree = await renderWith({ tx: txWith('DISPUTED'), dispute: null });
    const text = allText(tree);
    expect(text).toContain(UNREADABLE);
    expect(text).not.toContain(NOT_DISPUTABLE);
    expect(tree.root.findAllByType(TextInput).length).toBe(0);
  });
});

describe('validation happens before the mutation, not after it', () => {
  it('refuses an empty reason code', async () => {
    const tree = await renderWith({ tx: txWith('DISPATCHED') });
    await submit(tree);
    expect(allText(tree)).toContain(translate('dispute_reason_required', 'mr'));
    expect(tree.root.findAllByType(TextInput).length).toBe(1);
  });

  it('refuses an empty description once a reason is picked', async () => {
    const tree = await renderWith({ tx: txWith('DISPATCHED') });
    await pickReason(tree, 1);
    await submit(tree);
    expect(allText(tree)).toContain(translate('dispute_description_required', 'mr'));
  });

  it('refuses whitespace-only description', async () => {
    const tree = await renderWith({ tx: txWith('DISPATCHED') });
    await pickReason(tree, 1);
    await type(tree, '   ');
    await submit(tree);
    expect(allText(tree)).toContain(translate('dispute_description_required', 'mr'));
  });

  it('marks the chosen chip as selected and only that one', async () => {
    const tree = await renderWith({ tx: txWith('DISPATCHED') });
    await pickReason(tree, 2);
    const selected = chips(tree).filter(c => c.props.accessibilityState?.selected === true);
    expect(selected.length).toBe(1);
  });

  it('echoes the reason code and the text back on success', async () => {
    const tree = await renderWith({ tx: txWith('DISPATCHED') });
    await pickReason(tree, 1); // SHORT_WEIGHT
    await type(tree, 'चार क्विंटल घट आहे.');
    await submit(tree);
    const text = allText(tree);
    expect(text).toContain(
      translate('dispute_reason_code_line', 'mr', {
        reason: translate('dispute_reason_short_weight', 'mr'),
      }),
    );
    expect(text).toContain('चार क्विंटल घट आहे.');
  });
});

describe('the four states', () => {
  it('shows the error state only when there is no transaction to fall back on', async () => {
    const tree = await renderWith({ tx: null, error: new Error('network down') });
    expect(allText(tree)).toContain(translate('error_generic', 'mr'));
  });

  /** ★ P11 — beat 7 turns airplane mode on, and beat 10 comes after it. */
  it('keeps rendering a cached transaction when a refetch fails', async () => {
    const tree = await renderWith({ tx: fxTx, error: new Error('network down') });
    const text = allText(tree);
    expect(text).toContain(formatPaise(fxTx.gross_paise, 'mr'));
    expect(text).not.toContain(translate('error_generic', 'mr'));
    expect(tree.root.findAllByType(TextInput).length).toBe(1);
  });

  it('renders a named empty state when the transaction resolves to nothing', async () => {
    const tree = await renderWith({ tx: null });
    expect(allText(tree)).toContain(translate('dispute_no_tx', 'mr'));
  });
});

describe('hygiene', () => {
  const cases: Array<[string, { tx: TxDto; dispute?: DisputeRes }]> = [
    ['the raise form', { tx: txWith('DISPATCHED') }],
    ['a seeded dispute', { tx: txWith('DISPUTED'), dispute: fxDisputeRes }],
    ['a closed transaction', { tx: txWith('RELEASED') }],
  ];

  it.each(cases)('renders no undefined, NaN or untranslated key on %s', async (_label, seed) => {
    const text = allText(await renderWith(seed));
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('NaN');
    // `translate()` renders ⟨key⟩ for anything missing from the dictionary.
    expect(text).not.toContain('⟨');
  });

  /** All seven CANON §6.4 stages must have a label, not just the three we seed. */
  it('has a Marathi label for every dispute stage', async () => {
    const stages = [
      'raised',
      'evidence',
      'mediation',
      'resolved_farmer',
      'resolved_buyer',
      'resolved_split',
      'withdrawn',
    ];
    for (const s of stages) {
      expect(translate(`dispute_stage_${s}`, 'mr')).not.toContain('⟨');
    }
  });

  it('renders the seeded dispute stage, not a hardcoded one', async () => {
    expect(fxDispute.stage).toBe('MEDIATION');
    const text = allText(await renderWith({ tx: txWith('DISPUTED'), dispute: fxDisputeRes }));
    expect(text).toContain(translate('dispute_stage_mediation', 'mr'));
  });
});
