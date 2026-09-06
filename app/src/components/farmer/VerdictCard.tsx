/**
 * S9's hero card. Pure and presentational on purpose — the screen fetches, this
 * component only renders `WindowRes`, which is what makes I16 a thing a unit test
 * can assert instead of only a thing a human screenshots (`VerdictCard.test.tsx`).
 *
 * ★ Every number here comes from `00_CANON.md` §7.4. There is no `best_case_paise`,
 *   no `best_day`, no `confidence_bps`, no `costs_paise`, no `model_version`, no
 *   `source_summary` on this response — six fields an earlier draft of this
 *   screen's spec invented, and none of them are read here.
 *
 * ★ I16, by construction, not by convention: `expected_gain_paise` and
 *   `worst_case_paise` both render through the single `styles.bigNumber` style
 *   object. There is exactly one font-size declaration for both — changing one
 *   changes the other, because there is only one to change.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatBps, formatNumber, formatPaise, toQuintal } from '../../lib/money';
import { useT } from '../../lib/i18n';
import { speakVerdict } from '../../lib/voice';
import { NO_ADVICE_BAND_THRESHOLD_BPS } from '../../config';
import { SourceBadge } from './SourceBadge';
import type { Confidence, Locale, WindowAction, WindowRes } from '../../types/api';

const ACTION_LABEL_MR: Record<Exclude<WindowAction, 'NO_ADVICE'>, string> = {
  SELL_NOW: 'आता विका',
  SELL_ELSEWHERE: 'दुसरीकडे विका',
  HOLD: 'थांबा',
  SPLIT: 'अर्धे विका, अर्धे थांबवा',
};

// t('high'|'medium'|'low') replaces this now — kept only as the Confidence -> key
// lookup, not as the rendered text itself.
const CONFIDENCE_KEY: Record<Confidence, 'high' | 'medium' | 'low'> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

/**
 * `onSeeCosts` is optional and the component stays presentational either way —
 * it takes a callback, not a `navigation` object. That is what keeps this file
 * renderable by `VerdictCard.test.tsx` with no navigation container around it,
 * and it is why the prop is a callback rather than this component importing
 * `useNavigation` itself.
 *
 * When it is absent (tests, and any future embed) the cost row still expands
 * inline exactly as it did before S10 existed — the peek is not a stub for the
 * screen, it is the first tap.
 */
export function VerdictCard({
  data,
  qtyKg,
  locale,
  onSeeCosts,
}: {
  data: WindowRes;
  qtyKg: number;
  locale: Locale;
  onSeeCosts?: () => void;
}) {
  const { t } = useT();
  const [costsOpen, setCostsOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // P13 (PRANAY.md:439) — the rest of voice (offline playback verified in
  // airplane mode, per SH3) is still to come; this is the wiring, not the full task.
  // Silently swallowing a playback failure is deliberate: a farmer who taps 🔊 and
  // hears nothing has lost a nice-to-have, not the verdict itself, and an error
  // banner over a voice glitch would outrank the actual recommendation on screen.
  const handleSpeak = async () => {
    setSpeaking(true);
    try {
      await speakVerdict(data);
    } catch {
      // see comment above
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.commodity}>कांदा · लासलगाव</Text>
        <SourceBadge source={data.data_source} />
      </View>

      {data.action === 'NO_ADVICE' ? (
        <Refusal data={data} locale={locale} />
      ) : (
        <Verdict data={data} qtyKg={qtyKg} locale={locale} />
      )}

      <TouchableOpacity
        testID="verdict-costs-toggle"
        style={styles.costsToggle}
        onPress={() => setCostsOpen(v => !v)}
        accessibilityRole="button">
        <Text style={styles.costsToggleLabel}>
          {costsOpen ? '▾' : '▸'} {t('costs_deducted')} (
          {formatPaise(data.costs.total_paise_per_qtl, locale)}/क्विंटल)
        </Text>
      </TouchableOpacity>

      {costsOpen ? (
        <>
          <CostLines costs={data.costs} locale={locale} />
          {/* The route out to S10 — only offered once the farmer has already
              opened the peek, so the deeper screen is a step he chose twice
              rather than a tap he lands on by accident. */}
          {onSeeCosts ? (
            <TouchableOpacity
              testID="verdict-costs-detail"
              style={styles.costsDetailLink}
              onPress={onSeeCosts}
              accessibilityRole="button">
              <Text style={styles.costsDetailLabel}>पूर्ण तपशील पहा →</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : null}

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.voiceButton}
        onPress={handleSpeak}
        disabled={speaking}
        accessibilityRole="button"
        accessibilityLabel="ऐका">
        <Text style={styles.voiceLabel}>{speaking ? '🔊 ...' : '🔊 ऐका'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Verdict({ data, qtyKg, locale }: { data: WindowRes; qtyKg: number; locale: Locale }) {
  const { t } = useT();
  const qtyQtl = toQuintal(qtyKg);
  return (
    <>
      <Text style={styles.action}>{ACTION_LABEL_MR[data.action as Exclude<WindowAction, 'NO_ADVICE'>]}</Text>
      {data.hold_days !== null && data.hold_days > 0 ? (
        <Text style={styles.holdDays}>{formatNumber(data.hold_days, locale)} दिवस</Text>
      ) : null}

      <Text style={styles.sectionLabel}>{t('expected_gain')}</Text>
      <Text testID="verdict-gain" style={[styles.bigNumber, styles.gain]}>
        {data.expected_gain_paise !== null ? `+ ${formatPaise(data.expected_gain_paise, locale)}` : '—'}
      </Text>

      <Text style={styles.sectionLabel}>{t('worst_case')}</Text>
      <Text testID="verdict-worst-case" style={[styles.bigNumber, styles.worst]}>
        {data.worst_case_paise !== null ? formatPaise(data.worst_case_paise, locale) : '—'}
      </Text>

      <Text style={styles.meta}>
        {formatNumber(qtyQtl, locale)} क्विंटलवर · {t('confidence')}: {t(CONFIDENCE_KEY[data.confidence])}
      </Text>
    </>
  );
}

/**
 * I6. Rendered with the same card chrome as `Verdict` — a refusal that looks like
 * an error state reads as a bug; one that looks deliberate reads as integrity.
 * `explain_mr` is rendered verbatim, never composed client-side (PRANAY.md §1.7).
 */
function Refusal({ data, locale }: { data: WindowRes; locale: Locale }) {
  return (
    <>
      <Text style={styles.action}>⚠ सल्ला नाही</Text>
      <Text style={styles.explain}>{data.explain_mr}</Text>
      <Text style={styles.meta}>
        अंदाजाची रुंदी: {formatBps(data.band_width_bps, locale)} (मर्यादा:{' '}
        {formatBps(NO_ADVICE_BAND_THRESHOLD_BPS, locale)})
      </Text>
      <Text style={styles.todayPrice}>
        आजची किंमत: {formatPaise(data.sell_now_net_paise_per_qtl, locale)}/क्विंटल
      </Text>
    </>
  );
}

function CostLines({ costs, locale }: { costs: WindowRes['costs']; locale: Locale }) {
  const rows: Array<[string, number]> = [
    ['वाहतूक', costs.transport_paise_per_qtl],
    ['कमिशन', costs.commission_paise_per_qtl],
    ['साठवण', costs.storage_paise_per_qtl],
    ['नासाडी', costs.spoilage_paise_per_qtl],
    ['भरणी', costs.loading_paise_per_qtl],
  ];
  return (
    <View style={styles.costLines}>
      {rows.map(([label, paise]) => (
        <View key={label} style={styles.costRow}>
          <Text style={styles.costLabel}>{label}</Text>
          <Text style={styles.costValue}>{formatPaise(paise, locale)}</Text>
        </View>
      ))}
      <View style={[styles.costRow, styles.costTotalRow]}>
        <Text style={styles.costTotalLabel}>एकूण</Text>
        <Text style={styles.costTotalValue}>{formatPaise(costs.total_paise_per_qtl, locale)}</Text>
      </View>
    </View>
  );
}

const GREEN = '#1B5E20';
const RED = '#C62828';

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  commodity: { fontSize: 18, fontWeight: '700' },

  action: { fontSize: 32, fontWeight: '800', textAlign: 'center', color: '#212121' },
  holdDays: { fontSize: 20, textAlign: 'center', color: '#555', marginTop: 4 },

  sectionLabel: { fontSize: 15, color: '#666', marginTop: 20, textAlign: 'center' },
  // ★ I16 — the one style both numbers share. Do not fork this into two.
  bigNumber: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  gain: { color: GREEN },
  worst: { color: RED },

  meta: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 20 },
  explain: { fontSize: 18, color: '#333', textAlign: 'center', marginTop: 16, lineHeight: 26 },
  todayPrice: { fontSize: 16, color: '#333', textAlign: 'center', marginTop: 20, fontWeight: '600' },

  costsToggle: { marginTop: 24, paddingVertical: 8 },
  costsToggleLabel: { fontSize: 15, color: GREEN, fontWeight: '600' },
  costsDetailLink: { marginTop: 12, paddingVertical: 8 },
  costsDetailLabel: { fontSize: 15, color: GREEN, fontWeight: '700' },
  costLines: { marginTop: 8 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  costLabel: { fontSize: 14, color: '#555' },
  costValue: { fontSize: 14, color: '#333' },
  costTotalRow: { borderTopWidth: 1, borderTopColor: '#EEE', marginTop: 4, paddingTop: 8 },
  costTotalLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  costTotalValue: { fontSize: 15, fontWeight: '700', color: '#333' },

  divider: { height: 1, backgroundColor: '#EEE', marginTop: 20 },
  voiceButton: { marginTop: 16, alignItems: 'center' },
  voiceLabel: { fontSize: 16, color: GREEN, fontWeight: '600' },
});
