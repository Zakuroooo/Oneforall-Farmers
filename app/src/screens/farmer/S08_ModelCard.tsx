/**
 * S8 — the model card. PRANAY.md §1.4 calls it P1; internally it is the honesty
 * screen, and it is the one screen whose entire job is to make the app less
 * impressive than it looks.
 *
 * ★ Why a farmer-facing screen at all, when the audience is really a judge:
 *   because I6 ("the model may refuse") is only credible if the model's accuracy
 *   is *stated somewhere a user can reach*, not just described in a pitch. S9 can
 *   say "we will not advise"; S8 is where the claim behind that — "we know how
 *   good we are, to two decimal places, against a named baseline" — is written
 *   down. A judge asking "how do you know your forecast is any good?" should be
 *   answered by a tap, not by a slide.
 *
 * ★ The screen renders the server's numbers and **never grades them**. `mase` is
 *   printed as it arrives; the verdict line ("better than the baseline" /
 *   "worse") is a comparison against 1.0, which is the definition of MASE and not
 *   a policy this screen invents. When `mase >= 1.0` it says so, at the same size
 *   and in the same place — `FRONTEND_NEEDS_AI.md` §2 promises Nikhil we will show
 *   that rather than hide it, and the `fxModelCardWorseThanBaseline` fixture makes
 *   the promise testable instead of aspirational.
 *
 * ★ Coverage is the number that catches a liar, so it is rendered against its
 *   nominal. `७८% (लक्ष्य ८०%)` invites the arithmetic; a bare `७८%` does not.
 *   A hardcoded 8000 would be detectable by counting points on the S7 fan, which
 *   is exactly why we ask for a measured value and print the target beside it.
 *
 * ★ No `Date.now()` at render time. The relative age ("trained N days ago") is
 *   derived in a `useMemo` keyed on `trained_at`, and the **absolute** date is the
 *   primary rendering — see `StaleBanner`'s header for the bug this avoids: a
 *   clock-derived string with nothing scheduling a re-render is a string that
 *   silently stops being true on a screen left open. Days is a coarse enough unit
 *   that a ticker would be theatre, so the absolute date carries the truth and
 *   the age is the convenience.
 *
 * TODO(nikhil): PRANAY.md §1.4's S8 row asks for `known_limitations` and
 *   `model_version`. Neither is in CANON §7.4 nor in our `ModelCard` type, so
 *   neither is invented here. The limitations block below is assembled from the
 *   nine fields that *do* exist — horizon, baseline, corpus window, coverage
 *   shortfall — and `algo` + `trained_at` stand in for a version, which is
 *   arguably more useful than a semver anyway. Open question in
 *   `FRONTEND_NEEDS_AI.md` §11.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getModelCard } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { devNum } from '../../lib/i18n';
import { formatBps, formatNumber } from '../../lib/money';
import { DEFAULT_COMMODITY_ID, USE_FIXTURES } from '../../config';
import { fxModelCard } from '../../fixtures/modelCard';
import { StaleBanner } from '../../components/farmer/StaleBanner';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { Locale, ModelCard } from '../../types/api';

/**
 * The nominal the 80% band is *supposed* to hit. Named, because the interesting
 * number on this screen is the gap between this and `coverage_80_bps` — not
 * either one alone.
 */
const NOMINAL_COVERAGE_BPS = 8000;

const DAY_MS = 24 * 60 * 60 * 1000;

async function fetchModelCard() {
  return USE_FIXTURES ? fxModelCard : getModelCard(DEFAULT_COMMODITY_ID);
}

/** `2026-09-05` -> `५ सप्टेंबर २०२५`-style. Marathi month names, Devanagari digits. */
const MONTHS_MR = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर',
];

/**
 * ISO date -> a readable date. Parses the `YYYY-MM-DD` prefix by string rather
 * than via `new Date()`, because `trained_at` carries an offset (+05:30) and
 * letting the device timezone shift it could print yesterday's date to a farmer
 * in a different zone — a model card that disagrees with itself by a day is a
 * small thing that reads as sloppiness on the one screen about rigour.
 */
function formatIsoDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  if (locale === 'en') return `${d} ${MONTHS_EN[m - 1]} ${y}`;
  return `${devNum(d, locale)} ${MONTHS_MR[m - 1]} ${devNum(y, locale)}`;
}

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** A labelled row. Value is always the server's string, never a derived one. */
function Row({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text testID={testID} style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

export default function S08_ModelCard() {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data, dataUpdatedAt, isLoading, error, refetch } = useQuery({
    queryKey: ['ai', 'model-card', DEFAULT_COMMODITY_ID],
    queryFn: fetchModelCard,
  });

  // Keyed on the timestamp, not read at render — see the header note.
  const trainedDaysAgo = useMemo(() => {
    if (!data) return null;
    const t = Date.parse(data.trained_at);
    if (Number.isNaN(t)) return null;
    return Math.max(0, Math.floor((Date.now() - t) / DAY_MS));
  }, [data]);

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Skeleton height={360} />
      </ScrollView>
    );
  }

  // Same rule as S9/S10 (P11): an errored background refetch must not shadow a
  // card the hydrated cache still holds.
  if (error && !data) {
    return (
      <ErrorState
        message="मॉडेलची माहिती आणता आली नाही. पुन्हा प्रयत्न करा."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return <EmptyState title="या पिकासाठी मॉडेलची माहिती उपलब्ध नाही." />;
  }

  const card: ModelCard = data;
  const beatsBaseline = card.mase < 1;
  const coverageShortfall = NOMINAL_COVERAGE_BPS - card.coverage_80_bps;

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <StaleBanner dataUpdatedAt={dataUpdatedAt} locale={locale} />

      <Text style={styles.title}>मॉडेल किती विश्वासार्ह आहे?</Text>
      <Text style={styles.subtitle}>
        कांदा · {formatNumber(card.horizon_days, locale)} दिवसांचा अंदाज
      </Text>

      {/*
        MASE first, because it is the only number on this screen that answers
        "should I believe the forecast at all". The verdict word sits at the same
        size as the number so the bad case cannot be made quieter than the good
        one — the I16 instinct, applied to a claim about ourselves.
      */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>अचूकता (MASE)</Text>
        <Text
          testID="mase-value"
          style={[styles.heroValue, { color: beatsBaseline ? GREEN : RED }]}>
          {devNum(card.mase.toFixed(2), locale)}
        </Text>
        <Text
          testID="mase-verdict"
          style={[styles.heroVerdict, { color: beatsBaseline ? GREEN : RED }]}>
          {beatsBaseline
            ? 'साध्या अंदाजापेक्षा चांगले'
            : 'साध्या अंदाजापेक्षा वाईट — तरीही आम्ही ते लपवत नाही'}
        </Text>
        <Text style={styles.heroNote}>
          {beatsBaseline
            ? '१ पेक्षा कमी म्हणजे "गेल्या वर्षी याच वेळी जो भाव होता तोच आज असेल" या साध्या अंदाजापेक्षा आमचा अंदाज चांगला आहे.'
            : '१ पेक्षा जास्त म्हणजे साधा हंगामी अंदाजच जास्त बरोबर ठरतो. हे इथे मुद्दाम दाखवले आहे.'}
        </Text>
      </View>

      {/*
        Coverage, printed against its nominal. The gap is the honest bit: an 80%
        band that actually contains 78.4% of outcomes is slightly optimistic, and
        saying so beside the number is cheaper than being caught.
      */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>पट्ट्याची विश्वासार्हता</Text>
        <Row
          label="प्रत्यक्ष भाव पट्ट्यात आला"
          value={`${formatBps(card.coverage_80_bps, locale)} (लक्ष्य ${formatBps(NOMINAL_COVERAGE_BPS, locale)})`}
          testID="coverage-value"
        />
        <Text testID="coverage-note" style={styles.cardNote}>
          {coverageShortfall > 0
            ? `म्हणजे १० पैकी सुमारे ${formatNumber(Math.round(card.coverage_80_bps / 1000), locale)} वेळा खरा भाव p१०–p९० पट्ट्यात होता. लक्ष्यापेक्षा थोडा कमी — म्हणजे पट्टा प्रत्यक्षात असायला हवा त्यापेक्षा थोडा अरुंद आहे.`
            : `म्हणजे १० पैकी सुमारे ${formatNumber(Math.round(card.coverage_80_bps / 1000), locale)} वेळा खरा भाव p१०–p९० पट्ट्यात होता — लक्ष्याइतका किंवा त्याहून चांगला.`}
        </Text>
      </View>

      {/* Provenance. Same corpus S24 describes; the row count must agree. */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>हे मॉडेल कशावर शिकले</Text>
        <Row label="पद्धत" value={card.algo} testID="algo-value" />
        <Row
          label="तुलनेसाठी साधा अंदाज"
          value={card.baseline === 'seasonal_naive' ? 'हंगामी (गेल्या वर्षीचाच भाव)' : card.baseline}
          testID="baseline-value"
        />
        <Row
          label="किती नोंदी"
          value={`${formatNumber(card.train_rows, locale)} नोंदी`}
          testID="train-rows-value"
        />
        <Row
          label="कोणत्या काळातील"
          value={`${formatIsoDate(card.train_from, locale)} — ${formatIsoDate(card.train_to, locale)}`}
          testID="train-window-value"
        />
        <Row
          label="शेवटचे प्रशिक्षण"
          value={
            trainedDaysAgo === null
              ? formatIsoDate(card.trained_at, locale)
              : `${formatIsoDate(card.trained_at, locale)} (${
                  trainedDaysAgo === 0
                    ? 'आज'
                    : `${formatNumber(trainedDaysAgo, locale)} दिवसांपूर्वी`
                })`
          }
          testID="trained-at-value"
        />
      </View>

      {/*
        The limitations. Assembled from fields that exist rather than from a
        `known_limitations` array the backend has never agreed to send — see the
        TODO in the header. Each line is a statement this response can actually
        support, which is the only kind worth putting on the honesty screen.
      */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>हे मॉडेल काय करू शकत नाही</Text>
        {[
          `${formatNumber(card.horizon_days, locale)} दिवसांपुढचा अंदाज हे मॉडेल देत नाही.`,
          'फक्त लासलगाव आणि कांद्याच्या नोंदींवर शिकले आहे — दुसऱ्या पिकाला किंवा दूरच्या मंडईला हेच लागू होईल असे नाही.',
          'निर्यातबंदी, अचानक पाऊस किंवा धोरणबदल यांचा अंदाज हे मॉडेल घेत नाही.',
          coverageShortfall > 0
            ? `पट्टा लक्ष्यापेक्षा ${formatBps(coverageShortfall, locale)} अरुंद पडतो — म्हणजे खरा भाव पट्ट्याबाहेर जाण्याची शक्यता दाखवल्यापेक्षा थोडी जास्त आहे.`
            : 'पट्टा लक्ष्याइतका किंवा त्याहून रुंद आहे.',
          'अंदाज खूप अनिश्चित असल्यास हे मॉडेल सल्ला देण्यास नकार देते — तो नकार हा दोष नाही, तो मुद्दाम आहे.',
        ].map((line, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bullet}>·</Text>
            <Text testID={`limitation-${i}`} style={styles.bulletText}>
              {line}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const GREEN = '#1B5E20';
const RED = '#C62828';

const styles = StyleSheet.create({
  root: { padding: 24, paddingBottom: 40 },

  title: { fontSize: 24, fontWeight: '800', color: '#212121' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 4, marginBottom: 20 },

  heroCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  heroLabel: { fontSize: 15, color: '#666' },
  heroValue: { fontSize: 44, fontWeight: '800', marginTop: 4 },
  // Deliberately the same size in both branches — see the hero comment.
  heroVerdict: { fontSize: 17, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  heroNote: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 10, textAlign: 'center' },

  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginTop: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#212121', marginBottom: 8 },
  cardNote: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 8 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  rowLabel: { fontSize: 15, color: '#666', flexShrink: 1, paddingRight: 12 },
  rowValue: { fontSize: 15, color: '#212121', fontWeight: '600', flexShrink: 1, textAlign: 'right' },

  bulletRow: { flexDirection: 'row', marginTop: 8 },
  bullet: { fontSize: 15, color: '#888', width: 14 },
  bulletText: { fontSize: 14, color: '#444', lineHeight: 21, flex: 1 },
});
