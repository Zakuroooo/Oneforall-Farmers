/**
 * S24's gate — the I8 screen, and the only screen in this app where being wrong
 * is unrecoverable. CLAUDE.md §9: "unlabelled synthetic data shown to a
 * government panel" is the single mistake this team cannot walk back from.
 *
 * ★ The load-bearing test is `badges a source outside the allowlist`, run over
 *   ARCHIVE, IMPUTED and SYNTHETIC rather than over SYNTHETIC alone. The
 *   tempting implementation is `source !== 'SYNTHETIC'`, which passes every
 *   eyeball check on the current fixture and quietly presents an IMPUTED row —
 *   a number the model made up — as though it came off Agmarknet.
 *
 * ★ The second is `does not substitute invented numbers when the fetch fails`.
 *   The version of this screen that shipped first did `catch { setData(
 *   MOCK_PROVENANCE) }`: on venue wifi it replaced the real audit totals with
 *   fabricated ones, one of them citing `https://mandisetu.internal/synthetic-log`,
 *   a URL that does not exist. It failed *convincingly*, on stage, to the one
 *   audience that would check.
 *
 * ★ The third is `never renders a tappable link for a row with no source_url`.
 *   A null URL is honest only while the row still says it is not verifiable; an
 *   inert link that swallows the tap reads as a citation.
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { S24_DataProvenance } from '../S24_DataProvenance';
import { fxProvenance } from '../../../fixtures/provenance';
import { translate } from '../../../lib/i18n';
import { formatBps, formatNumber } from '../../../lib/money';
import { formatDate } from '../../../lib/dates';
import type { DataSource, ProvenanceRes, ProvenanceRow } from '../../../types/api';

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

const QUERY_KEY = ['meta', 'provenance'];

/**
 * `staleTime: Infinity` + `refetchOnMount: false` keep a seeded row set from
 * being overwritten by the fixture on mount — under `USE_FIXTURES` the screen's
 * own `fetchProvenance()` returns `fxProvenance` regardless of what we seeded,
 * so without these every "what if the rows looked like X" case below would
 * silently become the fxProvenance case. Same trap as S25's suite.
 *
 * Pass no `data` at all to exercise the real fixture path end to end.
 */
async function renderWith(seed: { data?: ProvenanceRes | null; error?: Error } = {}) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
        refetchOnMount: false,
        // Separate from `refetchOnMount`: without it a dataless errored query is
        // force-retried the moment an observer mounts, and the fixture resolves
        // fast enough to erase the seeded error.
        retryOnMount: false,
      },
    },
  });

  if (seed.data !== undefined) client.setQueryData(QUERY_KEY, seed.data);

  if (seed.error) {
    const query = client.getQueryCache().build(client, { queryKey: QUERY_KEY });
    query.setState({
      ...query.state,
      error: seed.error,
      status: seed.data ? 'success' : 'error',
      errorUpdatedAt: Date.now(),
    });
  }

  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <S24_DataProvenance />
      </QueryClientProvider>,
    );
  });
  mounted.push(tree);

  /**
   * With nothing seeded the query fetches on mount, and TanStack Query notifies
   * its observers on a task scheduled *after* the queryFn settles. How many
   * turns of the loop that takes is an implementation detail of its scheduler —
   * a single flush left four of these tests on the loading skeleton, which
   * renders no text at all, so they failed against an empty string rather than
   * against a wrong one. Drain until the tree says something instead of
   * guessing a flush count: every other branch (error, empty, data) renders
   * copy, so an empty tree means only one thing.
   */
  for (let i = 0; i < 20 && allText(tree) === ''; i++) {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  }
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
 * Style assertions go through the serialised tree rather than through `allText`.
 * That is the wrong tool for reading copy — it escapes quotes and interleaves
 * style ids — but a hex colour is unambiguous in it, and it does not care how
 * `Card` forwards its `style` prop.
 */
const rendersFlaggedBorder = (tree: renderer.ReactTestRenderer): boolean =>
  JSON.stringify(tree.toJSON()).includes('#FEB2B2');

const links = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAll(n => n.type === TouchableOpacity && n.props.accessibilityRole === 'link');

/** I8's allowlist, restated here so the test does not import the screen's copy. */
const OFFICIAL: readonly DataSource[] = ['AGMARKNET', 'MSAMB'];
const UNOFFICIAL: DataSource[] = ['ARCHIVE', 'IMPUTED', 'SYNTHETIC'];

const SOURCE_LABEL_KEY: Record<DataSource, string> = {
  AGMARKNET: 'source_agmarknet',
  MSAMB: 'source_msamb',
  ARCHIVE: 'source_archive',
  IMPUTED: 'source_imputed',
  SYNTHETIC: 'source_synthetic',
};

const UNOFFICIAL_NOTE = translate('provenance_unofficial_note', 'mr');
const NO_URL = translate('provenance_no_source_url', 'mr');
const TOTAL_LABEL = translate('provenance_total_label', 'mr');

const officialRow = (over: Partial<ProvenanceRow> = {}): ProvenanceRow => {
  const base = fxProvenance.rows[0];
  if (!base) throw new Error('fxProvenance has no rows');
  return { ...base, ...over };
};

const resWith = (rows: ProvenanceRow[]): ProvenanceRes => ({
  generated_at: fxProvenance.generated_at,
  rows,
});

const sum = (rows: ProvenanceRow[]) => rows.reduce((s, r) => s + r.row_count, 0);

describe('★ I8 — nothing outside the allowlist renders unbadged', () => {
  /** Guards the whole suite: a fixture with no flagged row cannot test I8. */
  it('has something to badge in the first place', () => {
    const flagged = fxProvenance.rows.filter(r => !OFFICIAL.includes(r.source));
    expect(flagged.length).toBeGreaterThan(0);
    expect(fxProvenance.rows.some(r => OFFICIAL.includes(r.source))).toBe(true);
  });

  it.each(UNOFFICIAL)('badges %s and says in words that it is not official', async source => {
    const tree = await renderWith({
      data: resWith([officialRow(), officialRow({ market_id: 'mkt_x', source })]),
    });
    const text = allText(tree);
    expect(text).toContain(translate(SOURCE_LABEL_KEY[source], 'mr'));
    expect(text).toContain(UNOFFICIAL_NOTE);
    expect(rendersFlaggedBorder(tree)).toBe(true);
  });

  it('leaves an all-official table unflagged', async () => {
    const tree = await renderWith({
      data: resWith([officialRow(), officialRow({ market_id: 'mkt_y', source: 'MSAMB' })]),
    });
    expect(allText(tree)).not.toContain(UNOFFICIAL_NOTE);
    expect(rendersFlaggedBorder(tree)).toBe(false);
  });

  it('never renders a tappable link for a row with no source_url', async () => {
    const tree = await renderWith();
    const withUrl = fxProvenance.rows.filter(r => r.source_url !== null);
    const withoutUrl = fxProvenance.rows.filter(r => r.source_url === null);
    expect(withoutUrl.length).toBeGreaterThan(0);

    // One link per citable row, and not one more.
    expect(links(tree).length).toBe(withUrl.length);
    expect(allText(tree)).toContain(NO_URL);
    for (const row of withUrl) {
      expect(allText(tree)).toContain(row.source_url as string);
    }
  });
});

describe('★ every number is derived from the rows, not typed', () => {
  it('renders a total a judge can add up by eye', async () => {
    const total = sum(fxProvenance.rows);
    const text = allText(await renderWith());
    expect(text).toContain(formatNumber(total, 'mr'));
    // Devanagari, not Latin — catches a raw `{total}` interpolation that skipped
    // `formatNumber`, which reads as a bug to the only audience that matters.
    expect(text).not.toContain(String(total));
  });

  it('splits official against flagged so the two add back to the total', async () => {
    const official = sum(fxProvenance.rows.filter(r => OFFICIAL.includes(r.source)));
    const flagged = sum(fxProvenance.rows) - official;
    expect(flagged).toBeGreaterThan(0);
    const text = allText(await renderWith());
    expect(text).toContain(
      translate('provenance_official_split', 'mr', {
        official: formatNumber(official, 'mr'),
        flagged: formatNumber(flagged, 'mr'),
      }),
    );
  });

  it('derives each source share in bps from the same counts', async () => {
    const total = sum(fxProvenance.rows);
    const text = allText(await renderWith());
    for (const row of fxProvenance.rows) {
      const shareBps = Math.floor((row.row_count * 10000) / total);
      expect(text).toContain(formatBps(shareBps, 'mr'));
    }
  });

  it('orders the source breakdown largest first', async () => {
    const text = allText(await renderWith());
    // Compared on the counts, not the percentages: "४%" is a substring of "६४%",
    // so an index comparison on shares would pass on the wrong node.
    const agmarknet = text.indexOf(formatNumber(412, 'mr'));
    const msamb = text.indexOf(formatNumber(198, 'mr'));
    expect(agmarknet).toBeGreaterThanOrEqual(0);
    expect(msamb).toBeGreaterThan(agmarknet);
  });

  it('counts distinct markets and crops rather than rows', async () => {
    const text = allText(await renderWith());
    expect(text).toContain(
      translate('provenance_coverage_note', 'mr', {
        markets: formatNumber(new Set(fxProvenance.rows.map(r => r.market_id)).size, 'mr'),
        crops: formatNumber(new Set(fxProvenance.rows.map(r => r.commodity_id)).size, 'mr'),
      }),
    );
  });

  it('handles a zero total without dividing by it', async () => {
    const tree = await renderWith({ data: resWith([officialRow({ row_count: 0 })]) });
    const text = allText(tree);
    expect(text).not.toContain('NaN');
    expect(text).toContain(formatBps(0, 'mr'));
  });
});

describe('★ a failed fetch produces no numbers at all', () => {
  it('does not substitute invented numbers when the fetch fails', async () => {
    const tree = await renderWith({ data: null, error: new Error('network down') });
    const text = allText(tree);
    expect(text).toContain(translate('provenance_fetch_error', 'mr'));
    // The regression: no total, no label, no fabricated citation.
    expect(text).not.toContain(TOTAL_LABEL);
    expect(text).not.toContain(formatNumber(sum(fxProvenance.rows), 'mr'));
    expect(text).not.toContain('mandisetu.internal');
    expect(links(tree).length).toBe(0);
  });

  /** ★ P11 — beat 7 turns airplane mode on, and beat 10 comes after it. */
  it('keeps rendering a cached table when a refetch fails', async () => {
    const tree = await renderWith({ data: fxProvenance, error: new Error('network down') });
    const text = allText(tree);
    expect(text).toContain(TOTAL_LABEL);
    expect(text).toContain(formatNumber(sum(fxProvenance.rows), 'mr'));
    expect(text).not.toContain(translate('provenance_fetch_error', 'mr'));
  });
});

describe('the remaining states', () => {
  it('renders from the fixture with nothing seeded', async () => {
    const text = allText(await renderWith());
    expect(text).toContain(translate('data_provenance', 'mr'));
    expect(text).toContain(TOTAL_LABEL);
  });

  it('renders a named empty state for a table with no rows', async () => {
    const text = allText(await renderWith({ data: resWith([]) }));
    expect(text).toContain(translate('provenance_empty', 'mr'));
    expect(text).not.toContain(TOTAL_LABEL);
  });

  it('renders a named empty state when the table resolves to nothing', async () => {
    const text = allText(await renderWith({ data: null }));
    expect(text).toContain(translate('provenance_empty', 'mr'));
  });
});

describe('hygiene', () => {
  it('leads with the I8 rule before any number', async () => {
    const text = allText(await renderWith());
    const rule = text.indexOf(translate('provenance_i8_rule', 'mr'));
    expect(rule).toBeGreaterThanOrEqual(0);
    expect(text.indexOf(TOTAL_LABEL)).toBeGreaterThan(rule);
  });

  it('renders every date range as a Marathi date', async () => {
    const text = allText(await renderWith());
    for (const row of fxProvenance.rows) {
      expect(text).toContain(formatDate(row.first_obs_date, 'mr'));
      expect(text).toContain(formatDate(row.last_obs_date, 'mr'));
    }
    expect(text).toContain(formatDate(fxProvenance.generated_at, 'mr'));
  });

  it('names a missing date instead of rendering a blank', async () => {
    const text = allText(await renderWith({ data: resWith([officialRow({ first_obs_date: '' })]) }));
    expect(text).toContain(translate('date_unknown', 'mr'));
    expect(text).not.toContain('undefined');
  });

  const cases: Array<[string, ProvenanceRes | null]> = [
    ['the seeded table', fxProvenance],
    ['an empty table', resWith([])],
    ['a wholly synthetic table', resWith([officialRow({ source: 'SYNTHETIC', source_url: null })])],
  ];

  it.each(cases)('renders no undefined, NaN or untranslated key on %s', async (_label, data) => {
    const text = allText(await renderWith({ data }));
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('NaN');
    // `translate()` renders ⟨key⟩ for anything missing from the dictionary.
    expect(text).not.toContain('⟨');
  });

  it('has a Marathi label for every source in the union', async () => {
    for (const source of [...OFFICIAL, ...UNOFFICIAL]) {
      expect(translate(SOURCE_LABEL_KEY[source], 'mr')).not.toContain('⟨');
    }
  });
});
