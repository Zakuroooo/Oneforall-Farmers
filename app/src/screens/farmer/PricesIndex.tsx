/**
 * PricesIndex — Branded hub for the Prices tab.
 * Routes to S5/S6/S7/S8. Design matches Stitch Mandi-Setu system:
 * parchment background, terracotta brand, Noto Sans, 56px tap targets.
 * ★ ZERO EMOJIS  ★ FULL i18n via useT()
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PricesStackParamList } from '../../navigation/FarmerTabs';
import { useT } from '../../lib/i18n';
import { Icon } from '../../components/ui/Icon';

type Props = NativeStackScreenProps<PricesStackParamList, 'PricesIndex'>;

const LINKS: Array<{
  route: keyof PricesStackParamList;
  labelKey: string;
  subKey: string;
  icon: Parameters<typeof Icon>[0]['name'];
}> = [
  { route: 'S5_History', labelKey: 'prices_link_history', subKey: 'tab_prices', icon: 'trending-up' },
  { route: 'S7_Forecast', labelKey: 'prices_link_forecast', subKey: 'prices_link_forecast', icon: 'zap' },
  { route: 'S6_Nearby', labelKey: 'prices_link_nearby', subKey: 'prices_link_nearby', icon: 'map-pin' },
  { route: 'S8_ModelCard', labelKey: 'prices_link_model_card', subKey: 'prices_link_model_card', icon: 'info' },
];

export default function PricesIndex({ navigation }: Props) {
  const { t } = useT();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fe" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon name="trending-up" size={18} color="#9a3412" />
        </View>
        <View>
          <Text style={styles.headerTitle}>{t('prices_title')}</Text>
          <Text style={styles.headerSub}>Lasalgaon APMC</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Today's market pulse card */}
        <View style={styles.pulseCard}>
          <View style={styles.pulseRow}>
            <View style={styles.pulseIndicator} />
            <Text style={styles.pulseLabel}>{t('tab_prices')} — {t('today_price_label')}</Text>
          </View>
          <Text style={styles.pulseRate}>₹2,054<Text style={styles.pulseUnit}>/q</Text></Text>
          <Text style={styles.pulseMandi}>Lasalgaon APMC · Onion</Text>
        </View>

        {/* Navigation cards */}
        <Text style={styles.sectionLabel}>EXPLORE</Text>
        {LINKS.map(link => (
          <TouchableOpacity
            key={link.route}
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => navigation.navigate(link.route as any)}>
            <View style={styles.cardIconBox}>
              <Icon name={link.icon} size={22} color="#9a3412" />
            </View>
            <Text style={styles.cardLabel}>{t(link.labelKey)}</Text>
            <Icon name="arrow-right" size={18} color="#8b716a" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f9fe' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dec0b7',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ffdbd1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'NotoSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#181c1f',
  },
  headerSub: {
    fontFamily: 'NotoSans-Regular',
    fontSize: 13,
    color: '#57423c',
  },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  pulseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#dec0b7',
    padding: 16,
    marginBottom: 4,
  },
  pulseRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  pulseIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#166534' },
  pulseLabel: { fontFamily: 'NotoSans-Medium', fontSize: 13, color: '#57423c', fontWeight: '600' },
  pulseRate: { fontFamily: 'NotoSans-Bold', fontSize: 36, fontWeight: '700', color: '#9a3412', letterSpacing: -0.5 },
  pulseUnit: { fontSize: 18, color: '#57423c' },
  pulseMandi: { fontFamily: 'NotoSans-Regular', fontSize: 13, color: '#8b716a', marginTop: 2 },
  sectionLabel: {
    fontFamily: 'NotoSans-Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#8b716a',
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#dec0b7',
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 56,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#ffdbd1',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardLabel: {
    flex: 1,
    fontFamily: 'NotoSans-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#181c1f',
  },
});
