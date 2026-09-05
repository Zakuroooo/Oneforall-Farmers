import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { devNum, useT } from '../../lib/i18n';
import { S09_Verdict } from './S09_Verdict';

export default function S04_Home() {
  const { t, locale } = useT();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.priceCard}>
        <View style={styles.row}>
          <Text style={styles.commodityText}>कांदा (Onion) · लासलगाव मंडी</Text>
          <Badge label="AGMARKNET" type="AGMARKNET" />
        </View>
        <Text style={styles.priceText}>
          आजचा दर: <Text style={styles.priceHighlight}>₹{devNum(1850, locale)}</Text> / क्विंटल
        </Text>
        <Text style={styles.dateText}>आजची तारीख: {devNum(5, locale)} सप्टेंबर २०२६</Text>
      </Card>

      <Text style={styles.sectionHeader}>सल्ला आणि अंदाज (Verdict):</Text>

      {/* S9 Verdict Card featuring the prominent 🔊 Voice button */}
      <S09_Verdict />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  content: { padding: 20 },
  priceCard: { padding: 18, backgroundColor: '#1B5E20' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  commodityText: { fontSize: 15, fontWeight: '700', color: '#E8F5E9' },
  priceText: { fontSize: 20, color: '#FFFFFF', fontWeight: '600' },
  priceHighlight: { fontSize: 28, fontWeight: '900', color: '#FFD54F' },
  dateText: { fontSize: 13, color: '#C8E6C9', marginTop: 6 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16, marginBottom: 10 },
});
