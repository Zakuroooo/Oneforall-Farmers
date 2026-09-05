import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface OfferRound {
  sender: 'BUYER' | 'FARMER';
  price: number;
  qty: number;
  time: string;
  round: number;
}

export function S21_OfferThread() {
  const [rounds, setRounds] = useState<OfferRound[]>([
    { sender: 'BUYER', price: 1900, qty: 100, time: 'सकाळी १०:१५', round: 1 },
    { sender: 'FARMER', price: 2000, qty: 100, time: 'सकाळी १०:३०', round: 2 },
  ]);
  const [newPrice, setNewPrice] = useState('1960');
  const [submitting, setSubmitting] = useState(false);

  const currentRound = rounds.length + 1;
  const isMaxRounds = currentRound > 3;

  const handleSendCounter = () => {
    if (!newPrice) return;
    setSubmitting(true);
    setTimeout(() => {
      setRounds(prev => [
        ...prev,
        {
          sender: 'BUYER',
          price: parseInt(newPrice, 10),
          qty: 100,
          time: 'आत्ताच',
          round: currentRound,
        },
      ]);
      setSubmitting(false);
    }, 500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>ऑफर वाटाघाटी (सत्रातील फेरी)</Text>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>कांदा - १०० क्विंटल बंडल</Text>
        <Text style={styles.summarySub}>नाशिक क्लस्टर · ग्रेड A</Text>
      </Card>

      <Text style={styles.sectionHeader}>ऑफर इतिहास (फेरी १ ते ३):</Text>

      {rounds.map((r, i) => (
        <Card key={i} style={[styles.roundCard, r.sender === 'BUYER' ? styles.buyerCard : styles.farmerCard]}>
          <View style={styles.roundHeader}>
            <Text style={styles.senderLabel}>
              {r.sender === 'BUYER' ? 'व्यापारी (तुम्ही)' : 'शेतकरी (रामभाऊ पाटील)'}
            </Text>
            <Badge label={`फेरी ${r.round}/३`} type="INFO" />
          </View>
          <Text style={styles.offerPrice}>₹{r.price} / क्विंटल</Text>
          <Text style={styles.timeText}>{r.time}</Text>
        </Card>
      ))}

      {!isMaxRounds ? (
        <Card style={styles.inputCard}>
          <Text style={styles.inputLabel}>तुमची प्रति-ऑफर दर (₹/क्विंटल)</Text>
          <TextInput
            style={styles.input}
            value={newPrice}
            onChangeText={setNewPrice}
            keyboardType="number-pad"
          />
          <Button
            title={`प्रति-ऑफर पाठवा (फेरी ${currentRound}/३)`}
            onPress={handleSendCounter}
            loading={submitting}
            style={styles.btn}
          />
        </Card>
      ) : (
        <Card style={styles.maxCard}>
          <Text style={styles.maxText}>⚠️ ३ फेऱ्या पूर्ण झाल्या आहेत. अंतिम निर्णयाची वाट पहा.</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  content: { padding: 20 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  summaryCard: { padding: 16, backgroundColor: '#E3F2FD', borderColor: '#90CAF9' },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#1565C0' },
  summarySub: { fontSize: 14, color: '#1E88E5', marginTop: 4 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#475569', marginVertical: 12 },
  roundCard: { padding: 16, marginBottom: 12 },
  buyerCard: { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' },
  farmerCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  roundHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  senderLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  offerPrice: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  timeText: { fontSize: 12, color: '#64748B', marginTop: 4 },
  inputCard: { padding: 18, marginTop: 12 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 18, backgroundColor: '#FFF', marginBottom: 14 },
  btn: { marginTop: 4 },
  maxCard: { padding: 16, backgroundColor: '#FFFBEB', borderColor: '#FDE68A', marginTop: 12 },
  maxText: { color: '#B45309', fontWeight: '600', fontSize: 14 },
});
