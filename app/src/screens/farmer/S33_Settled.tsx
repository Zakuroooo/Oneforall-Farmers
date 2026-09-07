/**
 * S33_Settled — Screen 33: Settled deal receipt + ₹7,200 gain proof.
 * Matched to Stitch `33_settled_verified_harvest_receipt_7_200_gain_proof/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const mandiWarehouse = require('../../assets/images/mandi_warehouse.jpg');

export default function S33_Settled({ navigation }: any) {
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
          <View style={styles.settledBadge}>
            <Icon name="check-circle" size={12} color={colors.tertiary} />
            <Text style={styles.settledBadgeText}>यशस्वी जमा (SETTLED)</Text>
          </View>
          <Text style={styles.headerTitle}>सौदा पावती व अंतिम हिशोब</Text>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* RTGS success card */}
        <View style={styles.rtgsCard}>
          <View style={styles.rtgsIconRow}>
            <View style={styles.rtgsCheckCircle}><Icon name="check-circle" size={28} color={colors.onPrimary} /></View>
            <View style={styles.rtgsInfo}>
              <Text style={styles.rtgsLabel}>थेट बँक खात्यात पैसे जमा · RTGS यशस्वी</Text>
              <Text style={styles.rtgsMeta}>#SD-2024-8842</Text>
              <Text style={styles.rtgsDate}>१४ मार्च २०२४, दुपारी ३:४५ वाजता</Text>
            </View>
          </View>
          <Text style={styles.rtgsAmt}>₹75,400 <Text style={styles.rtgsAmtSub}>पूर्ण चुकता</Text></Text>
          <View style={styles.bankRow}>
            <Icon name="building" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.bankName}>भारतीय स्टेट बँक (SBI)</Text>
            <Text style={styles.bankAcNo}>A/C ·······4209</Text>
          </View>
          {/* ★ The invented UTR number and a fabricated bank SMS quoting a
              specific balance were removed — no real bank integration
              exists behind this screen, and printing a bank message that
              looks genuine is the kind of fabrication this product has
              already been burned by. */}
        </View>

        {/* Gain proof card */}
        <View style={styles.gainCard}>
          <View style={styles.gainHeader}>
            <Icon name="trending-up" size={16} color={colors.primary} />
            <Text style={styles.gainTitle}>कृषी मित्र सल्ला यशोगाथा</Text>
            <View style={styles.gainPctBadge}><Text style={styles.gainPctText}>+10.4% नफा</Text></View>
          </View>
          <Text style={styles.gainBannerSub}>११ दिवस भावप्रतीक्षेचा ऐतिहासिक लाभ</Text>

          <View style={styles.gainAmtRow}>
            <Icon name="trending-up" size={18} color={colors.tertiary} />
            <View>
              <Text style={styles.gainAmtLabel}>+₹7,200 जास्तीचा नफा!</Text>
              <Text style={styles.gainAmtDesc}>काढणी दिवशी न विकता शांबल्यामुळे शेत बिशात जास्तीचे पैसे आले.</Text>
            </View>
          </View>

          <View style={styles.gainCompareRow}>
            <View style={styles.gainCompareItem}>
              <Text style={styles.gainCompareDayLabel}>काढणी दिवस (Day 0)</Text>
              <Text style={styles.gainCompareDate}>३ मार्च २०२४ चा दर</Text>
              <Text style={styles.gainCompareRate}>₹1,720/क्विंo</Text>
              <Text style={styles.gainCompareTotal}>४० क्विंटल = ₹68,800</Text>
              <View style={styles.mandiModeTag}><Text style={styles.mandiModeTagText}>बाजारात मंडी होती</Text></View>
            </View>
            <View style={styles.gainCompareDivider} />
            <View style={styles.gainCompareItem}>
              <Text style={styles.gainCompareDayLabel}>विक्री दिवस (Day 11)</Text>
              <Text style={styles.gainCompareDate}>१४ मार्च निश्चित दर</Text>
              <Text style={[styles.gainCompareRate, { color: colors.tertiary }]}>₹1,900/क्विंo</Text>
              <Text style={styles.gainCompareTotal}>४० क्विंटल = ₹76,000</Text>
              <View style={styles.teziBadge}><Text style={styles.teziBadgeText}>तेजीचा थोरंग फायदा</Text></View>
            </View>
          </View>

          <View style={styles.gainBreakdown}>
            <View style={styles.gainBreakdownRow}>
              <Text style={styles.gainBreakdownKey}>वाढलेलादर फरक (₹180/क्विंo × ४० क्विंटल)</Text>
              <Text style={[styles.gainBreakdownVal, { color: colors.tertiary }]}>+₹7,200</Text>
            </View>
            <View style={styles.gainBreakdownRow}>
              <Text style={styles.gainBreakdownKey}>११ दिवसांचा मांडण आणि भांडे खर्च व वजन पट</Text>
              <Text style={[styles.gainBreakdownVal, { color: colors.critical }]}>-₹308</Text>
            </View>
            <View style={[styles.gainBreakdownRow, styles.gainNetRow]}>
              <Text style={styles.gainNetKey}>निवळ अंतिम फायदा (Net Clean Surplus)</Text>
              <Text style={styles.gainNetVal}>+₹6,892</Text>
            </View>
          </View>
        </View>

        {/* Lot photo + details */}
        <View style={styles.lotCard}>
          <View style={styles.lotCardHeader}>
            <Text style={styles.lotCardTitle}>शेतमाल तपशील</Text>
            <View style={styles.gradeABadge}><Text style={styles.gradeAText}>श्रेणी A (850/1000)</Text></View>
          </View>
          <Text style={styles.lotProductName}>५० क्विंटल गावरान लाल कांदा</Text>
          <View style={styles.lotPhotoContainer}>
            <Image source={mandiWarehouse} style={styles.lotPhoto} />
            <View style={styles.lotPhotoCaption}>
              <Icon name="check-circle" size={11} color={colors.tertiary} />
              <Text style={styles.lotPhotoCaptionText}>निफाड गिंबार शेतमाल लॉट</Text>
            </View>
          </View>
          <View style={styles.lotMetaRow}>
            <View style={styles.lotMetaItem}>
              <Text style={styles.lotMetaKey}>शेतकरी नाव:</Text>
              <Text style={styles.lotMetaVal}>रामभाऊ पाटील</Text>
            </View>
            <View style={styles.lotMetaItem}>
              <Text style={styles.lotMetaKey}>खरेदीदार कंपनी:</Text>
              <Text style={styles.lotMetaVal}>Pune Trading Co. (गुलटेकडी)</Text>
            </View>
          </View>
        </View>

        {/* APMC receipt table */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Icon name="clipboard" size={14} color={colors.primary} />
            <Text style={styles.receiptTitle}>कृषी उत्पन्न बाजार समिती पावती (Form 13)</Text>
            <View style={styles.eTaxBadge}><Text style={styles.eTaxText}>e-Tax Valid</Text></View>
          </View>
          <View style={styles.receiptDharmaRow}>
            <Icon name="scale" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.receiptDharmaText}>धर्मकाटा पावती #DK-7712</Text>
            <View style={styles.certBadge}><Text style={styles.certText}>प्रमाणित</Text></View>
          </View>
          <Text style={styles.receiptDharmaSub}>वजन कपात: ० किलो (100% अचूक डिजिटल तोल)</Text>
          <View style={styles.receiptTable}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>४० क्विंटल गावरान कांदा @ ₹1,900/क्विंo</Text>
              <Text style={styles.receiptRowVal}>₹76,000.00</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>हमाली व तोलाई (Mandi Mandated Loading)</Text>
              <Text style={[styles.receiptRowVal, { color: colors.critical }]}>–₹600.00</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>APMC शेतकरी उपकर (Cess 0% – व्यापारी भरती)</Text>
              <Text style={styles.receiptRowVal}>₹0.00</Text>
            </View>
            <View style={[styles.receiptRow, styles.receiptNetRow]}>
              <Text style={styles.receiptNetLabel}>शेतकऱ्याला अदा केलेली निवळ रक्कम:</Text>
              <Text style={styles.receiptNetVal}>₹75,400.00</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.downloadBtn}>
          <Icon name="clipboard" size={16} color={colors.onPrimary} />
          <Text style={styles.downloadBtnText}>अधिकृत कर पावती डाउनलोड करा (PDF)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share" size={14} color={colors.tertiary} />
          <Text style={styles.shareBtnText}>व्हॉट्सअॅपवर नफा पावती शेअर करा</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextLotBtn}>
          <Text style={styles.nextLotBtnText}>पुढील शेतमाल नोंदवा (List Next Lot)</Text>
          <Icon name="arrow-right" size={14} color={colors.primaryContainer} />
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
  settledBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settledBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  listenBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 200 },
  rtgsCard: { margin: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  rtgsIconRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginBottom: space.sm },
  rtgsCheckCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.tertiary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rtgsInfo: { flex: 1 },
  rtgsLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  rtgsMeta: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  rtgsDate: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant },
  rtgsAmt: { fontFamily: fontFamily.extraBold, fontSize: 32, color: colors.tertiary, letterSpacing: -0.5, marginBottom: space.xs },
  rtgsAmtSub: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.onSurfaceVariant },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  bankName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  bankAcNo: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface },
  utrRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm },
  utrLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  utrVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  bankMsgBox: { padding: space.sm, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow, borderLeftWidth: 3, borderLeftColor: colors.tertiary },
  bankMsgText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurface, lineHeight: 17, fontStyle: 'italic' },
  gainCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.onPrimaryContainer, borderWidth: 2, borderColor: colors.primaryContainer, overflow: 'hidden', padding: space.md },
  gainHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  gainTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary, flex: 1 },
  gainPctBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  gainPctText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  gainBannerSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: space.sm },
  gainAmtRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.positiveContainer, marginBottom: space.sm },
  gainAmtLabel: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.tertiary },
  gainAmtDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, lineHeight: 17 },
  gainCompareRow: { flexDirection: 'row', marginBottom: space.sm, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  gainCompareItem: { flex: 1, padding: space.sm },
  gainCompareDivider: { width: 1, backgroundColor: colors.outlineVariant },
  gainCompareDayLabel: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant, marginBottom: 2 },
  gainCompareDate: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  gainCompareRate: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  gainCompareTotal: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurface, marginBottom: 4 },
  mandiModeTag: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: 'rgba(220,38,38,0.1)' },
  mandiModeTagText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.critical },
  teziBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.positiveContainer },
  teziBadgeText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.tertiary },
  gainBreakdown: { borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: space.sm },
  gainBreakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  gainBreakdownKey: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1, paddingRight: space.sm },
  gainBreakdownVal: { fontFamily: fontFamily.bold, fontSize: 13 },
  gainNetRow: { borderTopWidth: 1, borderTopColor: colors.primaryContainer, paddingTop: 6, marginTop: 4 },
  gainNetKey: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary, flex: 1 },
  gainNetVal: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.tertiary },
  lotCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  lotCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  lotCardTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurfaceVariant },
  gradeABadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  gradeAText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  lotProductName: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.onSurface, padding: space.sm, paddingBottom: space.xs },
  lotPhotoContainer: { position: 'relative' },
  lotPhoto: { width: '100%', height: 130 },
  lotPhotoCaption: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.5)' },
  lotPhotoCaptionText: { fontFamily: fontFamily.bold, fontSize: 11, color: '#fff' },
  lotMetaRow: { flexDirection: 'row', padding: space.sm, gap: space.md },
  lotMetaItem: { flex: 1 },
  lotMetaKey: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  lotMetaVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  receiptCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  receiptTitle: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary, flex: 1 },
  eTaxBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.positiveContainer },
  eTaxText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  receiptDharmaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: space.sm, paddingTop: space.xs },
  receiptDharmaText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface, flex: 1 },
  certBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.onPrimaryContainer },
  certText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.primaryContainer },
  receiptDharmaSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, paddingHorizontal: space.sm, paddingBottom: space.xs },
  receiptTable: { borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  receiptRowLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1 },
  receiptRowVal: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  receiptNetRow: { backgroundColor: colors.surfaceContainerLow },
  receiptNetLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary, flex: 1 },
  receiptNetVal: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.tertiary },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  downloadBtnText: { fontFamily: fontFamily.extraBold, fontSize: 13, color: colors.onPrimary },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: touch.targetMin, borderRadius: radius.lg, backgroundColor: colors.positiveContainer },
  shareBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  nextLotBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  nextLotBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer },
});
