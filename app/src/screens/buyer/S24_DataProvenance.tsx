import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { formatNumber } from '../../lib/money';
import type { Locale } from '../../types/api';

interface ProvenanceData {
  total_observations: number;
  sources: Array<{
    source_name: string;
    count: number;
    percentage: number;
    source_url: string;
    date_range: string;
  }>;
}

const MOCK_PROVENANCE: ProvenanceData = {
  total_observations: 14850,
  sources: [
    {
      source_name: 'AGMARKNET',
      count: 11200,
      percentage: 75.4,
      source_url: 'https://agmarknet.gov.in',
      date_range: '2024-01-01 – 2026-09-05',
    },
    {
      source_name: 'MSAMB',
      count: 3150,
      percentage: 21.2,
      source_url: 'https://msamb.com',
      date_range: '2024-01-01 – 2026-09-05',
    },
    {
      source_name: 'SYNTHETIC',
      count: 500,
      percentage: 3.4,
      source_url: 'https://mandisetu.internal/synthetic-log',
      date_range: '',
    },
  ],
};

export function S24_DataProvenance() {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const [data, setData] = useState<ProvenanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<ProvenanceData>('/meta/data-provenance');
        setData(res);
      } catch {
        setData(MOCK_PROVENANCE);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Skeleton height={40} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </View>
    );
  }

  const prov = data || MOCK_PROVENANCE;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{translate('data_provenance', locale)}</Text>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{translate('provenance_total_label', locale)}</Text>
        <Text style={styles.totalNum}>{prov.total_observations.toLocaleString()}</Text>
        <Text style={styles.subNote}>
          {translate('provenance_coverage_note', locale, {
            markets: formatNumber(6, locale),
            crops: formatNumber(2, locale),
          })}
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>{translate('provenance_source_breakdown_title', locale)}</Text>

      {prov.sources.map((s, i) => (
        <Card key={i} style={styles.sourceCard}>
          <View style={styles.sourceHeader}>
            <Badge
              label={s.source_name}
              type={
                s.source_name === 'AGMARKNET'
                  ? 'AGMARKNET'
                  : s.source_name === 'MSAMB'
                  ? 'MSAMB'
                  : 'SYNTHETIC'
              }
            />
            <Text style={styles.percentText}>{s.percentage}%</Text>
          </View>

          <Text style={styles.countText}>
            {translate('provenance_count_label', locale)}{' '}
            <Text style={styles.bold}>{s.count.toLocaleString()}</Text>
          </Text>
          <Text style={styles.dateText}>
            {translate('provenance_date_range_label', locale, {
              range: s.source_name === 'SYNTHETIC' ? translate('provenance_synthetic_date_range', locale) : s.date_range,
            })}
          </Text>

          <TouchableOpacity onPress={() => openUrl(s.source_url)} style={styles.urlBtn}>
            <Text style={styles.urlText}>🔗 {s.source_url}</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  content: { padding: 20 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  summaryCard: { padding: 20, backgroundColor: '#1B5E20' },
  summaryLabel: { fontSize: 14, color: '#A5D6A7', fontWeight: '600' },
  totalNum: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginVertical: 4 },
  subNote: { fontSize: 13, color: '#C8E6C9' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#475569', marginVertical: 14 },
  sourceCard: { padding: 16, marginBottom: 12 },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  percentText: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  countText: { fontSize: 15, color: '#334155', marginTop: 4 },
  bold: { fontWeight: '700' },
  dateText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  urlBtn: { marginTop: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  urlText: { fontSize: 13, color: '#1565C0', fontWeight: '600' },
});
