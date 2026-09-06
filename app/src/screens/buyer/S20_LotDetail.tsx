import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { formatNumber } from '../../lib/money';
import type { Locale } from '../../types/api';

export function S20_LotDetail({ onMakeOffer }: { onMakeOffer?: () => void }) {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{translate('lot_detail_header', locale)}</Text>

      <Card style={styles.mainCard}>
        <View style={styles.badgeRow}>
          <Badge label={translate('commodity_onion', locale)} type="INFO" />
          <Badge label={translate('post_demand_grade_chip', locale, { grade: 'A' })} type="GRADE_A" />
        </View>

        <Text style={styles.lotId}>{translate('lot_id_label', locale, { id: 'LOT-401' })}</Text>
        <Text style={styles.farmerName}>{translate('farmer_label', locale, { name: 'रामभाऊ पाटील' })}</Text>
        <Text style={styles.locationText}>
          {translate('location_distance_line', locale, {
            location: 'निफाड, नाशिक जिल्हा',
            distance: formatNumber(32, locale),
          })}
        </Text>
        <Text style={styles.qtyText}>
          {translate('lot_qty_kg_line', locale, { qty: formatNumber(40, locale), kg: formatNumber(4000, locale) })}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{translate('self_assay_answers_title', locale)}</Text>
        <View style={styles.assayItem}>
          <Text style={styles.assayQ}>• {translate('assay_onion_size_q', locale)}</Text>
          <Text style={styles.assayA}>
            {translate('assay_onion_size_a', locale, { score: formatNumber(25, locale), max: formatNumber(25, locale) })}
          </Text>
        </View>
        <View style={styles.assayItem}>
          <Text style={styles.assayQ}>• {translate('assay_colour_shine_q', locale)}</Text>
          <Text style={styles.assayA}>
            {translate('assay_colour_shine_a', locale, { score: formatNumber(25, locale), max: formatNumber(25, locale) })}
          </Text>
        </View>
        <View style={styles.assayItem}>
          <Text style={styles.assayQ}>• {translate('assay_moisture_dryness_q', locale)}</Text>
          <Text style={styles.assayA}>
            {translate('assay_moisture_dryness_a', locale, {
              pct: formatNumber(10, locale),
              score: formatNumber(25, locale),
              max: formatNumber(25, locale),
            })}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{translate('warehouse_storage_title', locale)}</Text>
        <Text style={styles.warehouseText}>नाशिक कृषी उत्पन्न बाजार समिती गोदाम #२</Text>

        <Button
          title={translate('lot_detail_make_offer', locale)}
          onPress={onMakeOffer}
          variant="primary"
          style={styles.actionBtn}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  content: { padding: 20 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  mainCard: { padding: 20 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  lotId: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  farmerName: { fontSize: 16, fontWeight: '700', color: '#1565C0', marginTop: 4 },
  locationText: { fontSize: 14, color: '#475569', marginTop: 4 },
  qtyText: { fontSize: 16, fontWeight: '700', color: '#1B5E20', marginTop: 6 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 8 },
  assayItem: { marginVertical: 4 },
  assayQ: { fontSize: 14, fontWeight: '600', color: '#475569' },
  assayA: { fontSize: 14, color: '#1E293B', marginLeft: 12, marginTop: 2 },
  warehouseText: { fontSize: 14, color: '#64748B' },
  actionBtn: { marginTop: 20 },
});
