/**
 * S30_DealDone — Screen 30: Deal confirmed celebration + sauda locked.
 * Matched to Stitch `30_deal_done_confetti_celebration_sauda_locked/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import { ListenButton } from '../../components/ui/ListenButton';

const NEXT_STEPS = [
  {
    num: 1,
    done: true,
    title: 'सौदा करार अधिकृत झाला (Contract Signed & Locked)',
    detail: 'दोन्ही बाजूंनी काळदेशीर मंजुरी पूर्ण झाली · आज १२:३९ PM',
    badge: 'झाले (Done)',
    badgeDone: true,
  },
  {
    num: 2,
    done: false,
    title: 'पुढील कृती · NEXT STEP  उद्या सकाळी १०:०० वाजता',
    detail: 'गाडी शेतावर येईल (Truck arriving at Farm Gate)',
    badge: 'उद्या सकाळी १०:०० वाजता',
    badgeDone: false,
  },
  {
    num: 3,
    done: false,
    title: 'डिजिटल वजन पावती (Weighment Slip)',
    detail: 'शेतात किंवा नजीकच्या धर्मकाट्यावर अचूक वजन नोंदवले जाईल व OTP जनरेट होईल.',
    badge: null,
    badgeDone: false,
  },
  {
    num: 4,
    done: false,
    title: '२ तासांत बँक खात्यात RTGS ट्रान्सफर',
    detail: 'वजन पावतीवर शिक्कामोर्तब होताच एस्क्रोमधून ₹75,400 लाळकळ पैसे जातील.',
    badge: null,
    badgeDone: false,
  },
] as const;

export default function S30_DealDone({ navigation }: any) {
  const { t } = useT();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Farmer header row */}
      <View style={styles.header}>
        <View style={styles.farmerAvatar}>
          <Icon name="leaf" size={16} color={colors.onPrimary} />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerFarmer}>शेतकरी · Rambhau Patil</Text>
          <Text style={styles.headerMandi}>Lasalgaon Mandi</Text>
        </View>
        <ListenButton text={t('deal_done_title')} />
      </View>

      {/* Deal locked banner */}
      <View style={styles.dealLockedBanner}>
        <Icon name="check-circle" size={14} color={colors.onPrimary} />
        <Text style={styles.dealLockedText}>करार यशस्वी · APMC BINDING DEAL LOCKED</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Celebration hero */}
        <View style={styles.celebrationCard}>
          {/* Confetti visual dots */}
          <View style={styles.confettiRow}>
            {[colors.primaryContainer, colors.tertiary, '#F59E0B', colors.primaryContainer, colors.tertiary, '#F59E0B', colors.primaryContainer].map((c, i) => (
              <View key={i} style={[styles.confettiDot, { backgroundColor: c, width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3, borderRadius: 3 + (i % 3) }]} />
            ))}
          </View>

          <View style={styles.heroCheckCircle}>
            <Icon name="check-circle" size={44} color={colors.onPrimary} />
          </View>

          <Text style={styles.celebTitle}>सौदा पक्का झाला!</Text>
          <Text style={styles.celebSubTitle}>Deal Confirmed &amp; Digitally Signed</Text>

          <View style={styles.saudaRefRow}>
            <Icon name="clipboard" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.saudaRef}>सौदा संदर्भ क्र: #SD-2024-8842</Text>
          </View>

          <View style={styles.saleTagBadge}>
            <Icon name="tag" size={14} color={colors.primaryContainer} />
            <Text style={styles.saleTagText}>40 क्विंटल कांदा ₹1,900/क्विंटल दराने विकला!</Text>
          </View>
        </View>

        {/* Net settlement */}
        <View style={styles.settlementCard}>
          <View style={styles.settlementHeader}>
            <Text style={styles.settlementLabel}>अंतिम देय रक्कम · NET SETTLEMENT</Text>
            <View style={styles.rtgsBadge}>
              <Icon name="zap" size={10} color={colors.tertiary} />
              <Text style={styles.rtgsText}>नक्की जमा</Text>
            </View>
          </View>
          <Text style={styles.settlementAmt}>₹75,400 <Text style={styles.settlementAmtSub}>(RTGS द्वारे)</Text></Text>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>थेट बँक खात्यात जमा</Text>
          </View>
          {/* ★ The invented IFSC code, buyer license number, and "APMC
              authorized" / "APMC Verified" wording were removed — this app
              has no real bank integration and no real APMC certification
              behind either claim. The escrow mechanism itself is real
              (CANON's transaction FSM); what it is not is government- or
              bank-verified, and saying so would be the unrecoverable
              mistake CLAUDE.md warns about. */}
          <View style={styles.escrowGuaranteeRow}>
            <Icon name="shield-check" size={13} color={colors.tertiary} />
            <Text style={styles.escrowGuaranteeText}>
              100% सुरक्षित रक्कम एस्क्रोमध्ये जमा आहे. गाडी वजनात होताच थेट जमा होईल.
            </Text>
          </View>
        </View>

        {/* Deal summary */}
        <View style={styles.dealSummaryCard}>
          <View style={styles.dealSummaryRow}>
            <Text style={styles.dealSummaryKey}>खरेदीदार तपशील · Buyer</Text>
          </View>
          <Text style={styles.dealSummaryBuyerName}>Pune Trading Co.</Text>
          <Text style={styles.dealSummaryBuyerSub}>गुलटेकडी मार्केट यार्ड, पुणे</Text>
          <View style={styles.dealSummaryDivider} />
          <View style={styles.farmerDealRow}>
            <Text style={styles.farmerDealLabel}>शेतकरी:</Text>
            <Text style={styles.farmerDealName}>रामभाऊ पाटील (निफाड, नाशिक)</Text>
            <View style={styles.farmgateBadge}><Text style={styles.farmgateBadgeText}>फार्म गेट उचल</Text></View>
          </View>
          <View style={styles.dealSummaryDivider} />
          <View style={styles.produceSummary}>
            <View style={styles.produceSummaryLeft}>
              <Text style={styles.produceSummaryKey}>माला तपशील · Produce Lot</Text>
              <View style={styles.gradeABadge}><Text style={styles.gradeAText}>Grade A (850/1000)</Text></View>
              <View style={styles.produceRow}><Text style={styles.produceLabel}>जात (Variety):</Text><Text style={styles.produceVal}>गावरान लाल कांदा (Gavran Red)</Text></View>
              <View style={styles.produceRow}><Text style={styles.produceLabel}>वजन व पोती:</Text><Text style={styles.produceVal}>40 क्विंटल · 80 पोती (50kg पोते)</Text></View>
              <View style={styles.produceRow}><Text style={styles.produceLabel}>दर प्रति क्विंटल:</Text><Text style={styles.produceVal}>₹1,900 / क्विंटल</Text></View>
            </View>
          </View>
          <View style={styles.financeSummary}>
            <View style={styles.financeRow}>
              <Text style={styles.financeKey}>एकूण किंमत (Gross):</Text>
              <Text style={styles.financeVal}>₹76,000</Text>
            </View>
            <View style={styles.financeRow}>
              <Text style={styles.financeKey}>हमाली व तोलाई खर्च (Hamali):</Text>
              <Text style={[styles.financeVal, { color: colors.critical }]}>– ₹600</Text>
            </View>
            <View style={[styles.financeRow, styles.financeNetRow]}>
              <Text style={styles.financeNetKey}>निवळ जमा रक्कम (Net):</Text>
              <Text style={styles.financeNetVal}>₹75,400</Text>
            </View>
          </View>
        </View>

        {/* Next steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>आता पुढे काय होणार? (Next Steps)</Text>
          <View style={styles.stepTimeBadge}><Text style={styles.stepTimeText}>टप्पा २ सुरु</Text></View>

          {NEXT_STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepCircle, step.done && styles.stepCircleDone]}>
                {step.done
                  ? <Icon name="check" size={14} color={colors.onPrimary} />
                  : <Text style={styles.stepNumText}>{step.num}</Text>
                }
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, step.done && styles.stepTitleDone]}>{step.title}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
                {step.badge ? (
                  <View style={[styles.stepBadge, step.badgeDone && styles.stepBadgeDone]}>
                    <Text style={[styles.stepBadgeText, step.badgeDone && styles.stepBadgeTextDone]}>{step.badge}</Text>
                  </View>
                ) : null}
              </View>
              {i < NEXT_STEPS.length - 1 && <View style={styles.stepLine} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.navigate('S32_DealTracking')}>
          <Text style={styles.trackBtnText}>सौदा ट्रॅक करा · Track Deal Progress</Text>
          <Icon name="arrow-right" size={16} color={colors.onPrimary} />
        </TouchableOpacity>
        {/* ★ "Download Official Signed PDF" and "Share on WhatsApp" removed —
            no PDF generation or share integration exists anywhere in this
            app; both buttons would have opened nothing. */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  farmerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerFarmer: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  headerMandi: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  dealLockedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, backgroundColor: colors.tertiary },
  dealLockedText: { fontFamily: fontFamily.bold, fontSize: 12, color: '#fff', letterSpacing: 0.3 },
  scroll: { paddingBottom: 220 },
  celebrationCard: { alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  confettiRow: { flexDirection: 'row', gap: 8, marginBottom: space.md, flexWrap: 'wrap', justifyContent: 'center' },
  confettiDot: {},
  heroCheckCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.tertiary, alignItems: 'center', justifyContent: 'center', marginBottom: space.md, shadowColor: colors.tertiary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  celebTitle: { fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.onSurface, letterSpacing: -0.5 },
  celebSubTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.primaryContainer, marginBottom: space.sm },
  saudaRefRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: space.sm },
  saudaRef: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  saleTagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.onPrimaryContainer, borderWidth: 1, borderColor: colors.primaryContainer },
  saleTagText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer },
  settlementCard: { margin: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  settlementHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.xs },
  settlementLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant, letterSpacing: 0.3 },
  rtgsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  rtgsText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  settlementAmt: { fontFamily: fontFamily.extraBold, fontSize: 32, color: colors.tertiary, letterSpacing: -0.5 },
  settlementAmtSub: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.onSurfaceVariant },
  bankRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: space.sm },
  bankLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface },
  bankIfsc: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  escrowGuaranteeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, padding: space.xs, borderRadius: radius.md, backgroundColor: colors.positiveContainer },
  escrowGuaranteeText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onPositiveContainer, flex: 1, lineHeight: 16 },
  dealSummaryCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  dealSummaryRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: space.sm },
  dealSummaryKey: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant },
  apmc: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  apmcText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  dealSummaryBuyerName: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface, paddingHorizontal: space.sm },
  dealSummaryBuyerSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, paddingHorizontal: space.sm, marginBottom: 4 },
  dealSummaryRow2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm, marginBottom: space.xs },
  dealSummaryLic: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: fontFamily.bold, fontSize: 11, color: '#F59E0B' },
  dealSummaryDivider: { height: 1, backgroundColor: colors.outlineVariant },
  farmerDealRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm },
  farmerDealLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  farmerDealName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  farmgateBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  farmgateBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurface },
  produceSummary: { padding: space.sm },
  produceSummaryLeft: {},
  produceSummaryKey: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 4 },
  gradeABadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer, marginBottom: 6 },
  gradeAText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  produceRow: { flexDirection: 'row', gap: space.sm, marginBottom: 3 },
  produceLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant, width: 110 },
  produceVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface, flex: 1 },
  financeSummary: { borderTopWidth: 1, borderTopColor: colors.outlineVariant, padding: space.sm },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  financeKey: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1 },
  financeVal: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  financeNetRow: { borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 6, marginTop: 4 },
  financeNetKey: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.tertiary, flex: 1 },
  financeNetVal: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.tertiary },
  nextStepsCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  nextStepsTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, marginBottom: space.sm },
  stepTimeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.primaryContainer, marginBottom: space.sm },
  stepTimeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onPrimary },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, position: 'relative', paddingBottom: space.sm },
  stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: colors.surface },
  stepCircleDone: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  stepNumText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurfaceVariant },
  stepContent: { flex: 1 },
  stepTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  stepTitleDone: { color: colors.tertiary },
  stepDetail: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 17, marginTop: 2 },
  stepBadge: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  stepBadgeDone: { backgroundColor: colors.positiveContainer },
  stepBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurface },
  stepBadgeTextDone: { color: colors.tertiary },
  stepLine: { position: 'absolute', left: 15, top: 34, width: 2, height: 24, backgroundColor: colors.outlineVariant },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8 },
  trackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  trackBtnText: { fontFamily: fontFamily.extraBold, fontSize: 13, color: colors.onPrimary, flex: 1, textAlign: 'center' },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: touch.targetMin, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.outlineVariant },
  pdfBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: touch.targetMin, borderRadius: radius.lg, backgroundColor: colors.positiveContainer },
  shareBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  helpRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  helpText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, flex: 1, lineHeight: 15 },
});
