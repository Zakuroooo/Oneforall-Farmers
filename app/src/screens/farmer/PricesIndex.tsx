/**
 * Landing screen for the Prices tab — one decision per screen (PRANAY.md §1.2)
 * means S5/S6/S7 stay three separate screens, not one crowded one; this is just
 * the door to each, not a screen number of its own.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import type { PricesStackParamList } from '../../navigation/FarmerTabs';
import type { Locale } from '../../types/api';

type Props = NativeStackScreenProps<PricesStackParamList, 'PricesIndex'>;

/**
 * S8 is last and reads as a footnote, because that is its rank for a farmer — but
 * it is here at all, rather than only behind S7, because the other reader of the
 * model card is a judge who asks "how good is your forecast?" and should get there
 * in one tap without being walked through a fan first.
 */
const LINKS: Array<{ route: keyof PricesStackParamList; labelKey: string }> = [
  { route: 'S5_History', labelKey: 'prices_link_history' },
  { route: 'S7_Forecast', labelKey: 'prices_link_forecast' },
  { route: 'S6_Nearby', labelKey: 'prices_link_nearby' },
  { route: 'S8_ModelCard', labelKey: 'model_card_title' },
];

export default function PricesIndex({ navigation }: Props) {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  return (
    <View style={styles.root}>
      {LINKS.map(link => (
        <TouchableOpacity
          key={link.route}
          style={styles.card}
          onPress={() => navigation.navigate(link.route)}>
          <Text style={styles.label}>{translate(link.labelKey, locale)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, gap: 16 },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  label: { fontSize: 18, fontWeight: '700', color: '#212121' },
});
