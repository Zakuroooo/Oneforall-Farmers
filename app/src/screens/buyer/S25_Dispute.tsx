import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { formatPaise } from '../../lib/money';
import type { Locale } from '../../types/api';

export function S25_Dispute() {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

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
      <Text style={styles.header}>{translate('dispute_header', locale)}</Text>

      <Card style={styles.infoCard}>
        <View style={styles.row}>
          <Text style={styles.txId}>{translate('tx_id_label', locale)}: #TX-9842</Text>
          <Badge
            label={
              status === 'NONE'
                ? translate('dispute_status_none', locale)
                : status === 'DISPUTED'
                ? translate('tx_status_disputed', locale)
                : translate('dispute_status_resolved', locale)
            }
            type={status === 'NONE' ? 'INFO' : status === 'DISPUTED' ? 'WARNING' : 'SUCCESS'}
          />
        </View>
        <Text style={styles.amount}>
          {translate('amount_escrow_protected', locale, { amount: formatPaise(19600000, locale) })}
        </Text>
      </Card>

      {status === 'NONE' ? (
        <Card style={styles.formCard}>
          <Text style={styles.label}>{translate('dispute_reason_label', locale)}</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            placeholder={translate('dispute_reason_placeholder', locale)}
          />
          <Button
            title={translate('dispute_raise_button', locale)}
            onPress={handleRaiseDispute}
            loading={submitting}
            variant="outline"
            style={styles.btn}
          />
        </Card>
      ) : status === 'DISPUTED' ? (
        <Card style={styles.disputedCard}>
          <Text style={styles.disputedTitle}>{translate('dispute_in_progress_title', locale)}</Text>
          <Text style={styles.disputedDesc}>
            {translate('dispute_reason_display', locale, {
              reason: reason || translate('dispute_default_reason', locale),
            })}
          </Text>

          <Button
            title={translate('dispute_resolve_button', locale)}
            onPress={handleResolveDispute}
            loading={submitting}
            variant="primary"
            style={styles.btn}
          />
        </Card>
      ) : (
        <Card style={styles.resolvedCard}>
          <Text style={styles.resolvedTitle}>{translate('dispute_resolved_title', locale)}</Text>
          <Text style={styles.resolvedDesc}>{translate('dispute_resolved_desc', locale)}</Text>
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
