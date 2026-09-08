/**
 * Makes a screen read itself aloud when the farmer arrives on it.
 *
 * ★ Why this is the single biggest accessibility change in the app. Until now
 *   a farmer who cannot read had to *find the speaker icon* before the app
 *   would tell him anything — which requires reading the screen well enough to
 *   locate a small control on it. That is a literacy test guarding the feature
 *   built for people who fail it.
 *
 * ★ Gated on the farmer's own setting (`isAutoNarrateOn`), which he can turn
 *   off in one tap in language settings. Default on, because the farmer who
 *   can read will switch it off once and the one who cannot would never have
 *   found the switch to turn it on.
 *
 * ★ Speaks on **focus**, not on mount, and stops on blur. React Navigation
 *   keeps a screen mounted underneath the one on top of it, so `useEffect` on
 *   mount would fire for screens the farmer cannot see, and going back would
 *   never re-narrate the screen he returned to.
 *
 * ★ Speaks **once per visit**, not on every re-render. A screen whose query
 *   resolves after focus would otherwise start the narration again with the
 *   fuller text, talking over itself.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { speakSmart, stopSpeaking } from './voice';
import { isAutoNarrateOn } from './voiceSettings';
import type { Locale } from '../types/api';

interface Options {
  /**
   * Hold the narration back until the screen has something worth saying —
   * pass `false` while a query is still loading. The screen narrates on the
   * first render where this becomes `true`, so the farmer hears the real
   * numbers rather than an empty skeleton.
   */
  ready?: boolean;
}

export function useScreenNarration(
  text: string,
  locale: Locale,
  { ready = true }: Options = {},
): void {
  const spokenForThisVisit = useRef(false);
  // Kept in a ref so the focus effect does not re-run (and re-narrate) every
  // time the text changes as queries settle.
  const latest = useRef({ text, locale, ready });
  latest.current = { text, locale, ready };

  useFocusEffect(
    useCallback(() => {
      spokenForThisVisit.current = false;
      let cancelled = false;

      // Poll briefly for readiness rather than depending on it: `useFocusEffect`
      // must not re-run on every data change, or a screen re-narrates itself
      // each time a query refetches in the background.
      const tick = setInterval(() => {
        if (cancelled || spokenForThisVisit.current) return;
        const { text: t, locale: l, ready: r } = latest.current;
        if (!r || t.trim().length === 0) return;
        spokenForThisVisit.current = true;
        if (!isAutoNarrateOn()) return;
        void speakSmart(t, l).catch(() => {
          // A screen that cannot speak is not a screen that should show an
          // error. The Listen button is still there to try again.
        });
      }, 250);

      return () => {
        cancelled = true;
        clearInterval(tick);
        // Leaving the screen stops its voice — otherwise the previous screen
        // keeps narrating over the new one.
        void stopSpeaking();
      };
    }, []),
  );

  // Nothing should still be talking after the component goes away entirely.
  useEffect(() => () => void stopSpeaking(), []);
}
