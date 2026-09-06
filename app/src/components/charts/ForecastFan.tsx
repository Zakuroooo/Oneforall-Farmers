/**
 * S7's forecast fan. Hand-rolled `react-native-svg`, per `12_STACK.md` §3.1 —
 * no `victory-native`, one dependency instead of three.
 *
 * ★ Two hard rules, both from PRANAY.md §2.7:
 *
 *   1. Never render p50 without its p10–p90 band. `p10`/`p50`/`p90` are all
 *      required props — there is no way to call this component with only a
 *      line, by construction of the type, not by convention. The runtime guard
 *      below (mismatched lengths → render nothing) covers the one case types
 *      cannot: a malformed response where the arrays exist but disagree in
 *      length.
 *
 *   2. The source badge is part of the chart, not next to it — except this
 *      chart does not draw one. CANON §7.4's `ForecastRes` has no `source`
 *      field at all; a forecast is a model output, not an observed price row.
 *      Blocker filed to Nilesh/Nikhil (see `fixtures/forecast.ts`).
 *
 * The band path is `M <p90 left-to-right> L <p10 right-to-left> Z` — p90 draws
 * the top edge, p10 (reversed) draws the bottom edge back to the start, closing
 * a polygon. The reversal happens on the *coordinate strings*, each of which
 * already has the correct x for its own day index baked in — reversing the
 * *values* first (as a naive reading of the shape might suggest) would pair
 * each value with the wrong day's x position once flipped.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Polyline } from 'react-native-svg';

import { formatPaise } from '../../lib/money';
import type { Locale } from '../../types/api';

type Props = {
  p10: number[];
  p50: number[];
  p90: number[];
  locale: Locale;
};

const WIDTH = 320;
const HEIGHT = 180;
const PAD = 16;
const GREEN = '#2E7D32';

export function ForecastFan({ p10, p50, p90, locale }: Props) {
  const n = p50.length;
  if (n === 0 || p10.length !== n || p90.length !== n) return null;

  const all = [...p10, ...p50, ...p90];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  const xStep = n > 1 ? (WIDTH - PAD * 2) / (n - 1) : 0;
  const xFor = (i: number) => PAD + i * xStep;
  const yFor = (v: number) => HEIGHT - PAD - ((v - min) / range) * (HEIGHT - PAD * 2);
  const coordsFor = (arr: number[]) => arr.map((v, i) => `${xFor(i)},${yFor(v)}`);

  const bandPath = `M ${coordsFor(p90).join(' ')} L ${coordsFor(p10).reverse().join(' ')} Z`;
  const p50Points = coordsFor(p50).join(' ');
  const baselineY = yFor(min);

  return (
    <View>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Line
          x1={PAD}
          y1={baselineY}
          x2={WIDTH - PAD}
          y2={baselineY}
          stroke="#DDD"
          strokeWidth={1}
        />
        <Path d={bandPath} fill={GREEN} fillOpacity={0.18} />
        <Polyline points={p50Points} stroke={GREEN} strokeWidth={2} fill="none" />
      </Svg>
      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>{formatPaise(min, locale)}</Text>
        <Text style={styles.axisLabel}>{formatPaise(max, locale)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { fontSize: 12, color: '#888' },
});
