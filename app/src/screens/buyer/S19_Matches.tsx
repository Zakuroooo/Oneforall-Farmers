import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface MatchBundle {
  id: string;
  type: 'SINGLE' | 'COMBINATION';
  totalQty: number;
  avgPrice: number;
  grade: string;
  location: string;
  lots: Array<{ farmer: string; qty: number; district: string }>;
  matchReason: string;
}

const MATCHES: MatchBundle[] = [
  {
    id: 'm1',
    type: 'COMBINATION',
    totalQty: 100,
    avgPrice: 1950,
    grade: 'A',
    location: 'नाशिक / निफाड भाग',
    lots: [
      { farmer: 'रामभाऊ पाटील', qty: 40, district: 'नाशिक' },
      { farmer: 'शिवाजी शिंदे', qty: 35, district: 'निफाड' },
      { farmer: 'गणेश देशमूख', qty: 25, district: 'सिन्नर' },
    ],
    matchReason: '३ शेतकऱ्यांचे एकत्र १०० क्विंटल बंडल — थेट नाशिक क्लस्टर',
  },
  {
    id: 'm2',
    type: 'SINGLE',
    totalQty: 100,
    avgPrice: 1980,
    grade: 'A',
    location: 'लासलगाव',
    lots: [{ farmer: 'विठ्ठलराव जगताप (FPO)', qty: 100, district: 'लासलगाव' }],
    matchReason: 'एफपीओ कडून थेट १०० क्विंटल लॉट',
  },
];

export function S19_Matches({
  onSelectOffer,
  onViewLot,
}: {
  onSelectOffer?: (id: string) => void;
  /** Was unwired entirely — S20_LotDetail existed in this repo but nothing
   * ever navigated to it. Optional, so a caller that has not wired
   * navigation yet still renders exactly as before. */
  onViewLot?: (id: string) => void;
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>जुळणारे शेतकरी लिलाव (१०० क्विंटल मागणी)</Text>

      {MATCHES.map(m => (
        <Card key={m.id} style={styles.matchCard}>
          <View style={styles.cardHeader}>
            <Badge
              label={m.type === 'COMBINATION' ? 'एकत्रित बंडल (3 लॉट)' : 'सिंगल लॉट'}
              type={m.type === 'COMBINATION' ? 'WARNING' : 'SUCCESS'}
            />
            <Badge label={`ग्रेड ${m.grade}`} type="GRADE_A" />
          </View>

          <Text style={styles.priceText}>
            ₹{m.avgPrice} <Text style={styles.unitText}>/ क्विंटल</Text>
          </Text>
          <Text style={styles.qtyText}>एकूण प्रमाण: {m.totalQty} क्विंटल ({m.location})</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>लॉट समाविष्ट:</Text>
          {m.lots.map((l, i) => (
            <View key={i} style={styles.lotRow}>
              <Text style={styles.farmerName}>• {l.farmer} ({l.district})</Text>
              <Text style={styles.lotQty}>{l.qty} qtl</Text>
            </View>
          ))}

          <Text style={styles.reasonText}>💡 {m.matchReason}</Text>

          <Button
            title="लॉट तपशील पहा"
            onPress={() => onViewLot && onViewLot(m.id)}
            variant="outline"
            style={styles.actionBtn}
          />
          <Button
            title="ऑफर पाठवा (Make Offer)"
            onPress={() => onSelectOffer && onSelectOffer(m.id)}
            variant="primary"
            style={styles.actionBtn}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  content: { padding: 20 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  matchCard: { padding: 18, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceText: { fontSize: 26, fontWeight: '800', color: '#1B5E20' },
  unitText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  qtyText: { fontSize: 15, color: '#334155', fontWeight: '600', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  lotRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  farmerName: { fontSize: 14, color: '#1E293B' },
  lotQty: { fontSize: 14, fontWeight: '700', color: '#1565C0' },
  reasonText: { fontSize: 13, color: '#2E7D32', fontStyle: 'italic', marginTop: 10, backgroundColor: '#F1F8E9', padding: 8, borderRadius: 6 },
  actionBtn: { marginTop: 16 },
});
