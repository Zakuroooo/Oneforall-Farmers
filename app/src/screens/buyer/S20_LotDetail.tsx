import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function S20_LotDetail({ onMakeOffer }: { onMakeOffer?: () => void }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>लॉट तपशील (Lot Detail - S20)</Text>

      <Card style={styles.mainCard}>
        <View style={styles.badgeRow}>
          <Badge label="कांदा (Onion)" type="INFO" />
          <Badge label="ग्रेड A" type="GRADE_A" />
        </View>

        <Text style={styles.lotId}>लॉट क्र: #LOT-401</Text>
        <Text style={styles.farmerName}>शेतकरी: रामभाऊ पाटील</Text>
        <Text style={styles.locationText}>📍 निफाड, नाशिक जिल्हा (अंतर: ३२ किमी)</Text>
        <Text style={styles.qtyText}>प्रमाण: ४० क्विंटल (४,००० किलो)</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>स्वयं-पडताळणी चाचणी (Self-Assay Answers):</Text>
        <View style={styles.assayItem}>
          <Text style={styles.assayQ}>• कांद्याचा आकार:</Text>
          <Text style={styles.assayA}>मोठा (५५+ मिमी) - गुण: २५/२५</Text>
        </View>
        <View style={styles.assayItem}>
          <Text style={styles.assayQ}>• रंग आणि चमक:</Text>
          <Text style={styles.assayA}>गडद लाल, उत्तम साल - गुण: २५/२५</Text>
        </View>
        <View style={styles.assayItem}>
          <Text style={styles.assayQ}>• ओलावा / सुकावा:</Text>
          <Text style={styles.assayA}>पूर्ण सुकलेला (१०% ओलावा) - गुण: २५/२५</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>गोदाम साठा:</Text>
        <Text style={styles.warehouseText}>नाशिक कृषी उत्पन्न बाजार समिती गोदाम #२</Text>

        <Button
          title="या लॉटसाठी ऑफर द्या"
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
