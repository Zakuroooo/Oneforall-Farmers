/**
 * S5's 180-day price history. Hand-rolled `react-native-svg`, per `12_STACK.md`
 * §3.1 — no charting library.
 *
 * ★ I8, and per PRANAY.md §2.7 rule 2 the badge is "part of the chart, not next
 *   to it" — here that means the LINE ITSELF is drawn as one `<Line>` segment
 *   per consecutive pair of points, each stroked in its own source's color
 *   (`SourceBadge`'s `SOURCE_COLOR`, shared so the two components never
 *   disagree), plus a compact legend directly beneath the SVG naming only the
 *   sources actually present in this series — not all five, and not hidden in
 *   a separate part of the screen.
 *
 * A segment between two points of different sources is colored by the *later*
 * point's source — the segment represents the observation it leads into. This
 * is a real judgment call with no single obviously-correct answer; documented
 * here rather than silently picked.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { formatPaise } from '../../lib/money';
import { SOURCE_COLOR, TRUSTED, UNTRUSTED_LABEL_MR } from '../farmer/SourceBadge';
import type { DataSource, Locale, PricePoint } from '../../types/api';

type Props = {
  points: PricePoint[];
  locale: Locale;
};

const WIDTH = 320;
const HEIGHT = 160;
const PAD = 12;

function legendLabel(source: DataSource): string {
  return TRUSTED.has(source)
    ? source
    : UNTRUSTED_LABEL_MR[source as Exclude<DataSource, 'AGMARKNET' | 'MSAMB'>];
}

export function PriceHistory({ points, locale }: Props) {
  if (points.length < 2) return null;

  const values = points.map(p => p.modal_paise_per_qtl);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xStep = (WIDTH - PAD * 2) / (points.length - 1);
  const xFor = (i: number) => PAD + i * xStep;
  const yFor = (v: number) => HEIGHT - PAD - ((v - min) / range) * (HEIGHT - PAD * 2);

  const sourcesPresent = Array.from(new Set(points.map(p => p.source)));

  return (
    <View>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {points.slice(1).map((point, idx) => {
          const prev = points[idx]!;
          return (
            <Line
              key={point.obs_date}
              x1={xFor(idx)}
              y1={yFor(prev.modal_paise_per_qtl)}
              x2={xFor(idx + 1)}
              y2={yFor(point.modal_paise_per_qtl)}
              stroke={SOURCE_COLOR[point.source]}
              strokeWidth={2}
            />
          );
        })}
      </Svg>

      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>{formatPaise(min, locale)}</Text>
        <Text style={styles.axisLabel}>{formatPaise(max, locale)}</Text>
      </View>

      <View style={styles.legendRow}>
        {sourcesPresent.map(source => (
          <View key={source} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: SOURCE_COLOR[source] }]} />
            <Text style={styles.legendLabel}>{legendLabel(source)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { fontSize: 12, color: '#888' },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: '#555' },
});
