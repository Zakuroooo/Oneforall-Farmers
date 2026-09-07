/**
 * S26_BuyerProfile — Screen 26: Buyer profile (Pune Trading Co) + escrow verification.
 * Matched to Stitch `26_buyer_profile_pune_trading_co_escrow_verification/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

export default function S26_BuyerProfile({ navigation }: any) {
  const { t } = useT();

  const TRUST_ITEMS = [
    { icon: 'zap', title: t('buyer_trust_item1_title'), desc: t('buyer_trust_item1_desc') },
    { icon: 'scale', title: t('buyer_trust_item2_title'), desc: t('buyer_trust_item2_desc') },
    { icon: 'box', title: t('buyer_trust_item3_title'), desc: t('buyer_trust_item3_desc') },
    { icon: 'truck', title: t('buyer_trust_item4_title'), desc: t('buyer_trust_item4_desc') },
  ] as const;
  
  const REVIEWS = [
    { initials: 'D', name: t('buyer_reviews_r1_name'), loc: t('buyer_reviews_r1_loc'), stars: 5.0, text: t('buyer_reviews_r1_text'), verified: t('buyer_reviews_r1_sub') },
    { initials: 'K', name: t('buyer_reviews_r2_name'), loc: t('buyer_reviews_r2_loc'), stars: 4.8, text: t('buyer_reviews_r2_text'), verified: t('buyer_reviews_r2_sub') },
  ] as const;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('buyer_header_title')}</Text>
          <Text style={styles.headerSub}>{t('buyer_header_sub')}</Text>
        </View>
        <Text style={styles.headerRef}>#LP-403</Text>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Buyer identity card */}
        <View style={styles.identityCard}>
          <View style={styles.buyerLogoPlaceholder}>
            <Icon name="building" size={32} color={colors.primary} />
          </View>
          <View style={styles.buyerIdentityInfo}>
            <View style={styles.buyerNameRow}>
              <Text style={styles.buyerCompanyName}>Pune Trading Co.</Text>
              <Icon name="check-circle" size={18} color={colors.tertiary} />
            </View>
            <Text style={styles.buyerType}>{t('buyer_type')}</Text>
            <View style={styles.buyerLocRow}>
              <Icon name="map-pin" size={12} color={colors.tertiary} />
              <Text style={styles.buyerLoc}>Gultekdi APMC Market Yard, Pune</Text>
            </View>
          </View>
        </View>

        <View style={styles.distCard}>
          <View style={styles.distRow}>
            <Icon name="trending-up" size={14} color={colors.tertiary} />
            <Text style={styles.distText}>{t('buyer_dist')}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statStars}>
              <Icon name="star" size={12} color="#F59E0B" />
              <Text style={styles.statVal}>4.7</Text>
            </View>
            <Text style={styles.statLabel}>{t('buyer_stat_deals_label')}</Text>
            <Text style={styles.statSub}>{t('buyer_stat_deals_sub')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.tertiary }]}>98.4%</Text>
            <Text style={styles.statLabel}>{t('buyer_stat_payment_label')}</Text>
            <Text style={styles.statSub}>{t('buyer_stat_payment_sub')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>0</Text>
            <Text style={styles.statLabel}>{t('buyer_stat_dispute_label')}</Text>
            <Text style={styles.statSub}>{t('buyer_stat_volume_label')}</Text>
          </View>
        </View>

        {/* Trust Index */}
        <View style={styles.trustCard}>
          <Text style={styles.trustTitle}>{t('buyer_trust_title')}</Text>
          {TRUST_ITEMS.map((item, idx) => (
            <View key={idx} style={styles.trustItem}>
              <View style={styles.trustIconContainer}>
                <Icon name={item.icon as any} size={16} color={colors.primary} />
              </View>
              <View style={styles.trustItemText}>
                <Text style={styles.trustItemTitle}>{item.title}</Text>
                <Text style={styles.trustItemDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Reviews */}
        <View style={styles.reviewsCard}>
          <Text style={styles.reviewsTitle}>{t('buyer_reviews_title')}</Text>
          {REVIEWS.map((r, idx) => (
            <View key={idx} style={[styles.reviewRow, idx === 0 && styles.reviewFirst]}>
              <View style={styles.reviewAvatar}><Text style={styles.reviewInitials}>{r.initials}</Text></View>
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <View style={styles.reviewStarBadge}>
                    <Icon name="star" size={10} color="#F59E0B" />
                    <Text style={styles.reviewStarText}>{r.stars.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={styles.reviewLoc}>{r.loc}</Text>
                <Text style={styles.reviewText}>{r.text}</Text>
                <View style={styles.reviewVerifiedBadge}>
                  <Icon name="check-circle" size={11} color={colors.tertiary} />
                  <Text style={styles.reviewVerifiedText}>{r.verified}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Action Dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.dockBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Text style={styles.dockBtnText}>{t('buyer_dock_btn')}</Text>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  headerSub: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  headerRef: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primaryContainer },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 120 },
  identityCard: { marginHorizontal: space.md, marginTop: space.md, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, flexDirection: 'row', gap: space.md, alignItems: 'center' },
  buyerLogoPlaceholder: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  buyerIdentityInfo: { flex: 1 },
  buyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  buyerCompanyName: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  buyerType: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2, marginBottom: 6 },
  buyerLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  buyerLoc: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  distCard: { marginHorizontal: space.md, marginTop: space.sm, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.positiveContainer },
  distRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  distText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  statsCard: { flexDirection: 'row', marginHorizontal: space.md, marginTop: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: space.md, paddingHorizontal: space.xs },
  statDivider: { width: 1, backgroundColor: colors.outlineVariant, marginVertical: space.sm },
  statStars: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 4 },
  statVal: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface, letterSpacing: -0.5 },
  statLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 4 },
  statSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, marginTop: 2, textAlign: 'center' },
  trustCard: { margin: space.md, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  trustTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary, marginBottom: space.sm },
  trustItem: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerHigh },
  trustIconContainer: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trustItemText: { flex: 1 },
  trustItemTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, marginBottom: 2 },
  trustItemDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 17 },
  reviewsCard: { marginHorizontal: space.md, marginBottom: space.md, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  reviewsTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface, marginBottom: space.md },
  reviewRow: { flexDirection: 'row', gap: space.sm, borderTopWidth: 1, borderTopColor: colors.surfaceContainerHigh, paddingTop: space.md, marginTop: space.sm },
  reviewFirst: { borderTopWidth: 0, paddingTop: 0, marginTop: 0 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewInitials: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onSurface },
  reviewContent: { flex: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  reviewStarBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FEF3C7' },
  reviewStarText: { fontFamily: fontFamily.bold, fontSize: 10, color: '#B45309' },
  reviewLoc: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 6 },
  reviewText: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurface, lineHeight: 18, fontStyle: 'italic', marginBottom: 8 },
  reviewVerifiedBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.positiveContainer },
  reviewVerifiedText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  dockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primary, borderRadius: radius.lg },
  dockBtnText: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onPrimary },
});
