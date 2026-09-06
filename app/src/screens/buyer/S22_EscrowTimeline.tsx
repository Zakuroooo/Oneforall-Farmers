import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

interface FsmStep {
  state: 'CREATED' | 'ESCROW_HELD' | 'DISPATCHED' | 'DELIVERED' | 'RELEASED';
  label: string;
  desc: string;
  completed: boolean;
  active: boolean;
  time?: string;
}

const STEPS: FsmStep[] = [
  { state: 'CREATED', label: 'सौदा निश्चित (Created)', desc: 'ऑफर स्वीकृत झाली', completed: true, active: false, time: '०५ सप्टें १०:३०' },
  { state: 'ESCROW_HELD', label: 'रक्कम एस्क्रॉ जमा (Escrow Held)', desc: 'व्यापाऱ्याकडून ₹१,९६,००० एस्क्रॉ खात्यात जमा', completed: true, active: false, time: '०५ सप्टें ११:००' },
  { state: 'DISPATCHED', label: 'माल रवाना (Dispatched)', desc: 'शेतकऱ्याने ट्रकमध्ये माल भरला', completed: true, active: true, time: '०६ सप्टें ०८:००' },
  { state: 'DELIVERED', label: 'माल पोहोचला (Delivered)', desc: 'व्यापाऱ्याने गोदामात माल स्वीकारला', completed: false, active: false },
  { state: 'RELEASED', label: 'रक्कम मुक्त (Released)', desc: 'शेतकऱ्याच्या खात्यात पैसे जमा', completed: false, active: false },
];

export function S22_EscrowTimeline() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>एस्क्रॉ व्यवहार टाइमलाइन (FSM)</Text>

      <Card style={styles.txCard}>
        <View style={styles.row}>
          <Text style={styles.txId}>व्यवहार क्र: #TX-9842</Text>
          <Badge label="DISPATCHED" type="WARNING" />
        </View>
        <Text style={styles.txAmount}>एकूण रक्कम: ₹१,९६,००० (एस्क्रॉ सुरक्षित)</Text>
      </Card>

      <View style={styles.timeline}>
        {STEPS.map((s, i) => (
          <View key={s.state} style={styles.stepRow}>
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.dot,
                  s.completed && styles.dotCompleted,
                  s.active && styles.dotActive,
                ]}>
                <Text style={styles.dotIcon}>{s.completed ? '✓' : i + 1}</Text>
              </View>
              {i < STEPS.length - 1 ? (
                <View style={[styles.line, s.completed && styles.lineCompleted]} />
              ) : null}
            </View>

            <View style={styles.contentCol}>
              <Text style={[styles.stepLabel, s.active && styles.activeText]}>{s.label}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
              {s.time ? <Text style={styles.timeText}>{s.time}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  content: { padding: 20 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  txCard: { padding: 18, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  txId: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  txAmount: { fontSize: 18, fontWeight: '800', color: '#1B5E20' },
  timeline: { paddingLeft: 8 },
  stepRow: { flexDirection: 'row', marginBottom: 20 },
  indicatorCol: { alignItems: 'center', width: 36 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: { backgroundColor: '#2E7D32' },
  dotActive: { backgroundColor: '#E65100', borderWidth: 2, borderColor: '#FFF8E1' },
  dotIcon: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: 4 },
  lineCompleted: { backgroundColor: '#81C784' },
  contentCol: { flex: 1, paddingLeft: 14 },
  stepLabel: { fontSize: 16, fontWeight: '700', color: '#334155' },
  activeText: { color: '#E65100' },
  stepDesc: { fontSize: 14, color: '#64748B', marginTop: 2 },
  timeText: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
});
