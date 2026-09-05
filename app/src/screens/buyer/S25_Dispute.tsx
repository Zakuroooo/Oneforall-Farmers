import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function S25_Dispute() {
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'NONE' | 'DISPUTED' | 'RESOLVED'>('NONE');
  const [submitting, setSubmitting] = useState(false);

  const handleRaiseDispute = () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setStatus('DISPUTED');
      setSubmitting(false);
    }, 500);
  };

  const handleResolveDispute = () => {
    setSubmitting(true);
    setTimeout(() => {
      setStatus('RESOLVED');
      setSubmitting(false);
    }, 500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>तक्रार व लवाद निवारण (S25 Disputes)</Text>

      <Card style={styles.infoCard}>
        <View style={styles.row}>
          <Text style={styles.txId}>व्यवहार क्र: #TX-9842</Text>
          <Badge
            label={status === 'NONE' ? 'सामान्य' : status === 'DISPUTED' ? 'DISPUTED' : 'RESOLVED'}
            type={status === 'NONE' ? 'INFO' : status === 'DISPUTED' ? 'WARNING' : 'SUCCESS'}
          />
        </View>
        <Text style={styles.amount}>रक्कम: ₹१,९६,००० (एस्क्रॉ संरक्षित)</Text>
      </Card>

      {status === 'NONE' ? (
        <Card style={styles.formCard}>
          <Text style={styles.label}>तक्रारीचे कारण सांगा</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            placeholder="उदा. मालाची गुणवत्ता ग्रेड A ऐवजी B आहे, किंवा ५ क्विंटल घट आहे..."
          />
          <Button
            title="तक्रार नोंदवा (Raise Dispute)"
            onPress={handleRaiseDispute}
            loading={submitting}
            variant="outline"
            style={styles.btn}
          />
        </Card>
      ) : status === 'DISPUTED' ? (
        <Card style={styles.disputedCard}>
          <Text style={styles.disputedTitle}>⚠️ तक्रार प्रक्रिया सुरू आहे (FSM: DISPUTED)</Text>
          <Text style={styles.disputedDesc}>
            तक्रार: "{reason || 'गुणवत्ता तफावत'}"
          </Text>

          <Button
            title="लवाद मध्यस्थी स्वीकारून तोडगा काढा (Resolve Dispute)"
            onPress={handleResolveDispute}
            loading={submitting}
            variant="primary"
            style={styles.btn}
          />
        </Card>
      ) : (
        <Card style={styles.resolvedCard}>
          <Text style={styles.resolvedTitle}>✓ तक्रार यशस्वीरीत्या सुटली! (FSM: RESOLVED)</Text>
          <Text style={styles.resolvedDesc}>
            दोन्ही पक्षांच्या संमतीने एस्क्रॉ FSM व्यवहार पूर्ववत सुरु करण्यात आला आहे.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  content: { padding: 20 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  infoCard: { padding: 18, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  txId: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  amount: { fontSize: 18, fontWeight: '800', color: '#1B5E20' },
  formCard: { padding: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#FFF', textAlignVertical: 'top', height: 100, marginBottom: 16 },
  btn: { marginTop: 8 },
  disputedCard: { padding: 20, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  disputedTitle: { fontSize: 17, fontWeight: '700', color: '#B45309', marginBottom: 8 },
  disputedDesc: { fontSize: 14, color: '#92400E', marginBottom: 16 },
  resolvedCard: { padding: 20, backgroundColor: '#E8F5E9', borderColor: '#81C784' },
  resolvedTitle: { fontSize: 18, fontWeight: '700', color: '#1B5E20', marginBottom: 6 },
  resolvedDesc: { fontSize: 14, color: '#2E7D32' },
});
