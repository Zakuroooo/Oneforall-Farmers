/**
 * The bug this suite exists for: `StaleBanner` read `Date.now()` during render
 * with nothing scheduled to re-render it. Data that was fresh at mount and went
 * stale while the screen sat open never got a banner — and a screen sitting open
 * while the network dies is the airplane-mode demo beat, not an edge case.
 *
 * ★ Note the first test would have PASSED against the buggy version: it mounts
 *   with already-old data, so the render-time clock read is correct there. Only
 *   `does not throw` and the fresh→stale transition catch it. A test that only
 *   ever mounts with stale data cannot see this class of defect at all, which is
 *   why the transition test is the one that matters here.
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import { StaleBanner } from '../StaleBanner';
import { CACHE_STALE_MS } from '../../../config';

/** Wall clock, frozen. `dataUpdatedAt` values below are all relative to it. */
const NOW = 1_757_000_000_000;

function textsOf(tree: renderer.ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).map(n =>
    Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children),
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('StaleBanner — renders nothing when there is nothing to say', () => {
  it('dataUpdatedAt of 0 renders null — no successful fetch is the screen\'s loading state, not ours', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StaleBanner dataUpdatedAt={0} />);
    });
    expect(tree.toJSON()).toBeNull();
  });

  it('fresh data renders null', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StaleBanner dataUpdatedAt={NOW - 1000} />);
    });
    expect(tree.toJSON()).toBeNull();
  });

  it('data exactly at the threshold is stale — the boundary is inclusive', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StaleBanner dataUpdatedAt={NOW - CACHE_STALE_MS} />);
    });
    expect(tree.toJSON()).not.toBeNull();
  });
});

describe('StaleBanner — already-stale at mount', () => {
  it('renders the age warning with the clock time the data was fetched, in Devanagari digits', () => {
    // 11:40 local on the frozen clock's day, well past the threshold.
    const at = new Date(NOW);
    at.setHours(11, 40, 0, 0);

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StaleBanner dataUpdatedAt={at.getTime() - CACHE_STALE_MS * 2} />);
    });

    const all = textsOf(tree).join(' ');
    expect(all).toContain('जुनी माहिती');
    expect(all).toContain('वाजता');
    // Devanagari digits, never Latin — the whole app's rule (I-adjacent, money.ts).
    expect(all).toMatch(/[०-९]/);
    expect(all).not.toMatch(/[0-9]/);
  });
});

/**
 * ★ The regression. Mount fresh, advance the clock past the threshold, and the
 *   banner must appear without any prop changing. Against the original
 *   render-time `Date.now()` this stayed null forever.
 */
describe('★ StaleBanner — fresh at mount, stale while the screen sits open', () => {
  it('appears once the clock crosses CACHE_STALE_MS, with no prop change', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StaleBanner dataUpdatedAt={NOW} />);
    });
    expect(tree.toJSON()).toBeNull();

    act(() => {
      jest.advanceTimersByTime(CACHE_STALE_MS + 30_000);
    });

    expect(tree.toJSON()).not.toBeNull();
    expect(textsOf(tree).join(' ')).toContain('जुनी माहिती');
  });

  it('stays hidden while the data is still inside the window', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StaleBanner dataUpdatedAt={NOW} />);
    });

    act(() => {
      jest.advanceTimersByTime(CACHE_STALE_MS - 60_000);
    });

    expect(tree.toJSON()).toBeNull();
  });

  /**
   * The other direction, which matters just as much on the day: the network
   * comes back, TanStack refetches, `dataUpdatedAt` jumps forward, and the
   * banner must come off screen. A banner that sticks after a successful
   * refetch is a lie in the opposite direction.
   */
  it('disappears again when a refetch moves dataUpdatedAt forward', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StaleBanner dataUpdatedAt={NOW - CACHE_STALE_MS * 2} />);
    });
    expect(tree.toJSON()).not.toBeNull();

    act(() => {
      tree.update(<StaleBanner dataUpdatedAt={NOW} />);
    });
    expect(tree.toJSON()).toBeNull();
  });

  it('clears its interval on unmount — no timer left running behind a closed screen', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<StaleBanner dataUpdatedAt={NOW} />);
    });
    expect(jest.getTimerCount()).toBeGreaterThan(0);

    act(() => {
      tree.unmount();
    });
    expect(jest.getTimerCount()).toBe(0);
  });

  it('schedules no timer at all once it is already stale — nothing left to watch for', () => {
    act(() => {
      renderer.create(<StaleBanner dataUpdatedAt={NOW - CACHE_STALE_MS * 2} />);
    });
    expect(jest.getTimerCount()).toBe(0);
  });
});
