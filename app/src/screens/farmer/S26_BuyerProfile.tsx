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

const TRUST_ITEMS = [
  { icon: 'zap', title: 'जलद RTGS पेमेंट वेग (1.8 Hours)', desc: 'वजन पावती अपलोड झाल्यानंतर सरासरी १.८ तासात शेत बँक खात्यात पैसे जमा.' },
  { icon: 'scale', title: 'वजन पारदर्शकता (99.1% अचूकता)', desc: 'सरकारी डिजिटल काट्यानुसार वजन. शून्य अनधिकृत कपात (Zero arbitrary weight deductions).' },
  { icon: 'box', title: '४,२०० + क्विंटल खरेदी या हंगामात', desc: 'कांदा, बटाटा, लसूण मालाचा नियमित व मोठा खरेदीदार.' },
  { icon: 'truck', title: 'नियमित खरेदी क्षेत्र (Farmgate Routes)', desc: 'नाशिक, निफाड, दिंडोरी, येवला, पुणे पट्टा.' },
] as const;

const REVIEWS = [
  { initials: 'द', name: 'दतात्रय भोसले', loc: 'दिंडोरी, नाशिक', stars: 5.0, text: '"गाडी वेळेवर आली, वजन काट्यावर तत्परतेत आणि २ तासात पैसे खात्यात आले. विश्वास्यु व्यापारी." ', verified: '90 क्विंटल कांदा (3 अलव्यवहारांमधून)' },
  { initials: 'कि', name: 'किसान काळे', loc: 'चिंचवड बंदर, निफाड', stars: 4.8, text: '"भाव योग्य दिला, मालाची कोणतीही अडवाजी आणि कपात केली नाही. पहिल्या बोलीतच सौदा झाला."', verified: '60 क्विंटल कांदा (नेहमी भागीदार)' },
] as const;

export default function S26_BuyerProfile({ navigation }: any) {
  const { t } = useT();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>खरेदीदार तपशील</Text>
          <Text style={styles.headerSub}>Buyer Profile · APMC Validated</Text>
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
            <Text style={styles.buyerType}>Wholesale Trader &amp; Commission Agent</Text>
            <View style={styles.buyerLocRow}>
              <Icon name="map-pin" size={12} color={colors.tertiary} />
              <Text style={styles.buyerLoc}>Gultekdi APMC Market Yard, Pune</Text>
            </View>
          </View>
        </View>

        {/* Distance & license */}
        <View style={styles.distCard}>
          <View style={styles.distRow}>
            <Icon name="trending-up" size={14} color={colors.tertiary} />
            <Text style={styles.distText}>45 km from your Niphad farm shed</Text>
          </View>
          <View style={styles.licenseRow}>
            <Icon name="shield-check" size={14} color={colors.tertiary} />
            <Text style={styles.licenseText}>APMC Lic: MH-PUN-2018-84920</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statStars}>
              <Icon name="star" size={12} color="#F59E0B" />
              <Text style={styles.statVal}>4.7</Text>
            </View>
            <Text style={styles.statLabel}>142 Deals</Text>
            <Text style={styles.statSub}>शेतकऱ्यांनी दिलेले</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.tertiary }]}>98.4%</Text>
            <Text style={styles.statLabel}>बेळेत पेमेंट</Text>
            <Text style={styles.statSub}>On-Time Payment</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>0 तक्रार</Text>
            <Text style={styles.statLabel}>Disputes (100% OK)</Text>
            <Text style={styles.statSub}> </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>3 वर्ष</Text>
            <Text style={styles.statLabel}>कृषी मित्र सदस्य</Text>
            <Text style={styles.statSub}> </Text>
          </View>
        </View>

        {/* Active bid highlight */}
        <View style={styles.activeBidCard}>
          <View style={styles.activeBidHeader}>
            <View style={styles.liveGreen} />
            <Text style={styles.activeBidTitle}>सक्रिय बोली (Active Bid on #LP-403)</Text>
            <Text style={styles.activeBidTime}>25 मिनिटांपूर्वी प्राप्त</Text>
          </View>

          <View style={styles.activeBidRow}>
            <View style={styles.activeBidLotThumb}>
              <Icon name="box" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.activeBidCrop}>कांदा: गावरान लाल (Gavran Red)</Text>
              <Text style={styles.activeBidQtl}>लॉट: 40 क्विंटल</Text>
            </View>
          </View>

          <Text style={styles.activeBidPrice}>₹1,850 / क्विंटल</Text>
          <Text style={styles.activeBidPriceSub}>मागणी: किसान २० क्विंटल किंवा पूर्ण १० क्विंटल</Text>

          <View style={styles.activeBidFinanceRow}>
            <View>
              <Text style={styles.financeLabel}>एकूण किंमत (Gross Value 40 Qtl):</Text>
              <Text style={styles.financeVal}>₹74,000</Text>
            </View>
            <View>
              <Text style={styles.financeLabel}>हमाली / लोडिंग खर्च (Loading cut):</Text>
              <Text style={[styles.financeVal, { color: colors.critical }]}>– ₹600</Text>
            </View>
          </View>

          <View style={styles.netPayoutBox}>
            <View>
              <Text style={styles.netPayoutLabel}>शेतकऱ्याला थेट जमा (Net Farmgate Payout):</Text>
              <Text style={styles.netPayoutSub}>खात्यात पूर्ण रक्कम वर्ग होणार</Text>
            </View>
            <Text style={styles.netPayoutAmt}>₹73,400</Text>
          </View>

          <View style={styles.dispatchRow}>
            <Icon name="truck" size={13} color={colors.primaryContainer} />
            <Text style={styles.dispatchText}>गाडीची उपलब्धता: संबंध पक्का झाल्यावर २४ तासात शेतावर कंटेनर ट्रक.</Text>
          </View>

          <View style={styles.escrowRowCard}>
            <Icon name="lock" size={13} color={colors.tertiary} />
            <Text style={styles.escrowRowText}>₹74,000 APMC एस्क्रो खात्यात पूर्व-मंजूर (100% पेमेंट गॅरंटी)</Text>
          </View>
        </View>

        {/* Trust audit */}
        <View style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <Icon name="shield-check" size={16} color={colors.primary} />
            <Text style={styles.trustTitle}>विश्वास व व्यवहार ऑडिट (Trust Audit)</Text>
            <View style={styles.mandiVerifiedBadge}>
              <Text style={styles.mandiVerifiedText}>Mandi Verified</Text>
            </View>
          </View>

          {TRUST_ITEMS.map((item, i) => (
            <View key={i} style={styles.trustItem}>
              <View style={styles.trustItemIcon}>
                <Icon name={item.icon} size={16} color={colors.primaryContainer} />
              </View>
              <View style={styles.trustItemInfo}>
                <Text style={styles.trustItemTitle}>{item.title}</Text>
                <Text style={styles.trustItemDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Farmer reviews */}
        <View style={styles.reviewsCard}>
          <View style={styles.reviewsHeader}>
            <Icon name="star" size={14} color="#F59E0B" />
            <Text style={styles.reviewsTitle}>शेतकरी अनुभव (Farmer Reviews)</Text>
            <Text style={styles.reviewsLoc}>नाशिक जिल्ह्यातील शेतकरी</Text>
          </View>

          {REVIEWS.map((r, i) => (
            <View key={i} style={[styles.reviewItem, i < REVIEWS.length - 1 && styles.reviewItemBorder]}>
              <View style={styles.reviewerRow}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerAvatarText}>{r.initials}</Text>
                </View>
                <View style={styles.reviewerMeta}>
                  <Text style={styles.reviewerName}>{r.name}</Text>
                  <Text style={styles.reviewerLoc}>{r.loc}</Text>
                </View>
                <View style={styles.starRow}>
                  <Icon name="star" size={11} color="#F59E0B" />
                  <Text style={styles.starVal}>{r.stars}</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
              <View style={styles.verifiedDealRow}>
                <Icon name="check-circle" size={10} color={colors.tertiary} />
                <Text style={styles.verifiedDealText}>सत्यापित सौदा: {r.verified}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Escrow payment safety */}
        <View style={styles.escrowGuaranteeCard}>
          <View style={styles.escrowGuaranteeIcon}><Icon name="shield-check" size={24} color={colors.tertiary} /></View>
          <Text style={styles.escrowGuaranteeTitle}>कृषी मित्र 100% पेमेंट सुरक्षा हमी</Text>
          <Text style={styles.escrowGuaranteeDesc}>
            व्यापाऱ्याचे असले तरी जोपर्यंत पुण्याच्या व्यापाऱ्याचे APMC अधिकृत एस्क्रो खात्यात सुरक्षित होत नाही, तोपर्यंत तुमच्या शेतातून माल भरत जात नाही.
          </Text>
          <View style={styles.escrowGuaranteeFooter}>
            <TouchableOpacity style={styles.escrowFooterBtn}>
              <Icon name="scale" size={12} color={colors.primary} />
              <Text style={styles.escrowFooterBtnText}>शेतावर थेट वजन</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.escrowFooterBtn}>
              <Icon name="building" size={12} color={colors.primary} />
              <Text style={styles.escrowFooterBtnText}>थेट बँक ट्रान्सफर</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.startSaudaBtn} onPress={() => navigation.navigate('S27_Bargaining')}>
          <Text style={styles.startSaudaBtnText}>या खरेदीदाराशी सौदा करा (Start Sauda)</Text>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
        <View style={styles.dockSecondRow}>
          <TouchableOpacity style={styles.counterBtn} onPress={() => navigation.navigate('S28_CounterOffer')}>
            <Icon name="edit" size={14} color={colors.primaryContainer} />
            <Text style={styles.counterBtnText}>काउंटर ऑफर पाठवा</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBtn}>
            <Icon name="phone" size={14} color={colors.tertiary} />
            <Text style={styles.callBtnText}>व्यापाऱ्याशी बोला</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.dockNote}>२४५-क्वि कोट एनक्रिप्टेड · APMC नियम 463 अंतर्गत सुरक्षित</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  headerRef: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 160 },
  identityCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, margin: space.md, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  buyerLogoPlaceholder: { width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  buyerIdentityInfo: { flex: 1 },
  buyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  buyerCompanyName: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  buyerType: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant },
  buyerLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  buyerLoc: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.tertiary, flex: 1 },
  distCard: { marginHorizontal: space.md, marginBottom: space.xs, borderRadius: radius.xl, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)', overflow: 'hidden' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, paddingVertical: space.xs, borderBottomWidth: 1, borderBottomColor: 'rgba(4,120,87,0.15)' },
  distText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  licenseRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, paddingVertical: space.xs },
  licenseText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  statsCard: { flexDirection: 'row', marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: space.sm, paddingHorizontal: 4 },
  statStars: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statVal: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  statLabel: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant, textAlign: 'center' },
  statSub: { fontFamily: fontFamily.regular, fontSize: 9, color: colors.outline, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: colors.outlineVariant, marginVertical: space.xs },
  activeBidCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.onPrimaryContainer, borderWidth: 2, borderColor: colors.primaryContainer, overflow: 'hidden', padding: space.md },
  activeBidHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: space.sm },
  liveGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tertiary },
  activeBidTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary, flex: 1 },
  activeBidTime: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  activeBidRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  activeBidLotThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  activeBidCrop: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  activeBidQtl: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  activeBidPrice: { fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.primary, letterSpacing: -0.5 },
  activeBidPriceSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: space.sm },
  activeBidFinanceRow: { flexDirection: 'row', gap: space.md, marginBottom: space.sm, borderTopWidth: 1, borderTopColor: colors.primaryContainer, paddingTop: space.sm },
  financeLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  financeVal: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  netPayoutBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.positiveContainer, marginBottom: space.sm },
  netPayoutLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  netPayoutSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onPositiveContainer },
  netPayoutAmt: { fontFamily: fontFamily.extraBold, fontSize: 24, color: colors.tertiary },
  dispatchRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: space.xs },
  dispatchText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurface, flex: 1, lineHeight: 17 },
  escrowRowCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: space.xs, borderRadius: radius.md, backgroundColor: colors.positiveContainer },
  escrowRowText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary, flex: 1, lineHeight: 17 },
  trustCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  trustHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.sm },
  trustTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, flex: 1 },
  mandiVerifiedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  mandiVerifiedText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  trustItem: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginBottom: space.sm },
  trustItemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.onPrimaryContainer, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trustItemInfo: { flex: 1 },
  trustItemTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  trustItemDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 17 },
  reviewsCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  reviewsTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, flex: 1 },
  reviewsLoc: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  reviewItem: { padding: space.sm },
  reviewItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewerAvatarText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onPrimary },
  reviewerMeta: { flex: 1 },
  reviewerName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  reviewerLoc: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  starVal: { fontFamily: fontFamily.bold, fontSize: 13, color: '#F59E0B' },
  reviewText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurface, lineHeight: 18, fontStyle: 'italic', marginBottom: 4 },
  verifiedDealRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedDealText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.tertiary },
  escrowGuaranteeCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)', padding: space.md, alignItems: 'center' },
  escrowGuaranteeIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(4,120,87,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  escrowGuaranteeTitle: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.tertiary, textAlign: 'center', marginBottom: 6 },
  escrowGuaranteeDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, lineHeight: 18, textAlign: 'center', marginBottom: space.sm },
  escrowGuaranteeFooter: { flexDirection: 'row', gap: space.sm },
  escrowFooterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: space.xs, borderRadius: radius.md, backgroundColor: colors.surface },
  escrowFooterBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8 },
  startSaudaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  startSaudaBtnText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onPrimary },
  dockSecondRow: { flexDirection: 'row', gap: space.sm },
  counterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: touch.targetMin, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.primaryContainer },
  counterBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primaryContainer },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: touch.targetMin, borderRadius: radius.lg, backgroundColor: colors.positiveContainer },
  callBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  dockNote: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, textAlign: 'center' },
});
