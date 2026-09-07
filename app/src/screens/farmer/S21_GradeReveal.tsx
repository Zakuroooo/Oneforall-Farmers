/**
 * S21_GradeReveal — Screen 21: AI harvest quality score reveal (Grade A).
 * Matched to Stitch `21_your_grade_ai_harvest_quality_score_reveal/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const redOnions = require('../../assets/images/red_onions.jpg');
const mandiWarehouse = require('../../assets/images/mandi_warehouse.jpg');

const PARAMS = [
  { label: 'Bulb Uniformity & Size', labelMr: '52mm – 58mm Medium Large · Optimal Mandi Size', score: 92, max: 100 },
  { label: 'Skin Papery Luster & Color', labelMr: 'Double layer intact, deep copper red · High export grade', score: 95, max: 100 },
  { label: 'Neck Tightness & Moisture', labelMr: 'Neck cured dry, moisture ~8.9% · Good shelf life (60d)', score: 88, max: 100 },
  { label: 'Sprouting, Rot & Foreign Matter', labelMr: '0% green sprout · 0% black mold · Zero deductions', score: 98, max: 100 },
] as const;

export default function S21_GradeReveal({ navigation }: any) {
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
          <Text style={styles.headerTitle}>Quality Grade Result</Text>
          <Text style={styles.headerSub}>प्रतवारी निकाल · Lot #LP-403 · 40 Qtl</Text>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: '80%' }]} />
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Step 4 of 5: Quality Assay Reveal</Text>
        <View style={styles.apmcBadge}>
          <Icon name="check-circle" size={11} color={colors.tertiary} />
          <Text style={styles.apmcBadgeText}>APMC Standard</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Grade hero card */}
        <View style={styles.gradeHeroCard}>
          <Image source={redOnions} style={styles.gradeHeroImage} />
          <View style={styles.gradeHeroOverlay}>
            <View style={styles.fieldVerifiedBadge}>
              <Icon name="check-circle" size={10} color={colors.onPrimary} />
              <Text style={styles.fieldVerifiedText}>FIELD VERIFIED</Text>
            </View>
          </View>
          <View style={styles.gradeHeroRight}>
            <View style={styles.gradeABadge}><Text style={styles.gradeAText}>GRADE A</Text></View>
            <View style={styles.gradeScoreRow}>
              <Text style={styles.gradeScoreBig}>850</Text>
              <Text style={styles.gradeScoreMax}> / 1000</Text>
              <Icon name="check-circle" size={14} color={colors.tertiary} />
              <Text style={styles.gradeScoreVerified}>Verified</Text>
            </View>
            <Text style={styles.gradeVariety}>Gavran Red Onion (उन्हाळ कांदा)</Text>

            <View style={styles.gradeMetaRow}>
              <View style={styles.gradeMetaItem}>
                <Icon name="box" size={11} color={colors.onSurfaceVariant} />
                <Text style={styles.gradeMetaText}>40 Quintals (80 Bags)</Text>
              </View>
              <View style={styles.gradeMetaItem}>
                <Icon name="trending-up" size={11} color={colors.tertiary} />
                <Text style={[styles.gradeMetaText, { color: colors.tertiary }]}>Top 15% arrivals today</Text>
              </View>
            </View>
            <View style={styles.gradeYardRow}>
              <Icon name="map-pin" size={11} color={colors.onSurfaceVariant} />
              <Text style={styles.gradeYardText}>Lasalgaon Mandi Yard · Assay: AI + Coin Gauge 2</Text>
            </View>
          </View>
        </View>

        {/* Grade A+ recommendation */}
        <View style={styles.recommendCard}>
          <View style={styles.recommendHeader}>
            <Icon name="trending-up" size={18} color={colors.primary} />
            <Text style={styles.recommendTitle}>Recommendation for Grade A+</Text>
            <View style={styles.gainBadge}><Text style={styles.gainBadgeText}>+₹3,200 Gain</Text></View>
          </View>
          <Text style={styles.recommendDesc}>
            Sun-dry in open shed for 2 more days to cure neck skin moisture below 8%.
          </Text>
          <View style={styles.recommendPriceRow}>
            <View style={styles.recommendPriceItem}>
              <Text style={styles.recommendPriceLabel}>Current Potential (Grade A)</Text>
              <View style={styles.trendRow}>
                <Icon name="trending-up" size={12} color={colors.primary} />
                <Text style={styles.recommendPrice}>₹2,100<Text style={styles.recommendPriceUnit}>/Qtl</Text></Text>
              </View>
            </View>
            <View style={styles.recommendPriceItem}>
              <Text style={styles.recommendPriceLabel}>After 2 Days Curing (Grade A+)</Text>
              <Text style={[styles.recommendPrice, { color: colors.tertiary }]}>₹2,180<Text style={styles.recommendPriceUnit}>/Qtl (+₹80)</Text></Text>
            </View>
          </View>
          <View style={styles.recommendCtas}>
            <TouchableOpacity style={styles.publishNowBtn}>
              <View style={styles.radioFilled} />
              <Text style={styles.publishNowText}>Publish Grade A Now</Text>
              <Text style={styles.publishNowSub}>Fast payout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.holdBtn}>
              <View style={styles.radioEmpty} />
              <View>
                <Text style={styles.holdBtnText}>Hold for 2-Day Curing</Text>
                <Text style={styles.holdBtnSub}>+₹3,200 value</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assay breakdown */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>Assay Diagnostic Breakdown</Text>
            <Text style={styles.breakdownSubTitle}>तपशीलवार गुणवत्ता तासणी निकाल</Text>
            <View style={styles.paramCountBadge}><Text style={styles.paramCountText}>4 Parameters</Text></View>
          </View>

          {PARAMS.map((p, i) => {
            const pct = (p.score / p.max) * 100;
            return (
              <View key={i} style={styles.paramRow}>
                <View style={styles.paramMeta}>
                  <Text style={styles.paramLabel}>{p.label}</Text>
                  <Text style={styles.paramScore}>{p.score}/{p.max}</Text>
                </View>
                <View style={styles.paramBarBg}>
                  <View style={[styles.paramBarFill, { width: `${pct}%` as any }]} />
                </View>
                <Text style={styles.paramSubLabel}>{p.labelMr}</Text>
                {i < PARAMS.length - 1 && <View style={styles.paramDivider} />}
              </View>
            );
          })}

          <View style={styles.hashRow}>
            <Icon name="clipboard" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.hashText}>3 Field Images + Weight Receipt Match</Text>
            <Text style={styles.hashCode}>Hash #LP94</Text>
          </View>
        </View>

        {/* Fair Value Engine */}
        <View style={styles.fairValueCard}>
          <Text style={styles.fairValueLabel}>FAIR VALUE ENGINE</Text>
          <View style={styles.fairValueHeader}>
            <Text style={styles.fairValueTitle}>Recommended Price Band</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>+₹100/Qtl Premium</Text>
            </View>
          </View>
          <View style={styles.fairValuePriceRow}>
            <Text style={styles.fairValuePrice}>₹2,050 – ₹2,150</Text>
            <Text style={styles.fairValueUnit}>/Qtl</Text>
          </View>
          <View style={styles.fairValueMetaGrid}>
            <View style={styles.fairValueMetaItem}>
              <Text style={styles.fairValueMetaKey}>Expected Lot Value:</Text>
              <Text style={styles.fairValueMetaVal}>₹82,000 – ₹86,000</Text>
              <Text style={styles.fairValueMetaSub}>Instant Escrow Pay</Text>
            </View>
            <View style={styles.fairValueMetaItem}>
              <Text style={styles.fairValueMetaKey}>Lasalgaon Modal Average</Text>
              <Text style={styles.fairValueMetaVal}>₹2,050 / Qtl</Text>
              <Text style={styles.fairValueMetaSub}>Across all standard grades</Text>
            </View>
            <View style={styles.fairValueMetaItem}>
              <Text style={styles.fairValueMetaKey}>Terminal Buyer Demand</Text>
              <View style={styles.highDemandBadge}><Text style={styles.highDemandText}>High (Grade A)</Text></View>
              <Text style={styles.fairValueMetaSub}>5 Active Bidders in Niphad</Text>
            </View>
          </View>
        </View>

        {/* Escrow guarantee */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowIconBg}><Icon name="shield-check" size={22} color={colors.tertiary} /></View>
          <Text style={styles.escrowTitle}>Krishi Mitra 100% Escrow Guarantee</Text>
          <Text style={styles.escrowDesc}>
            Buyer locks payment into the Mandi Board Escrow before truck loading. Zero payment default risk for Grade A certified lots.
          </Text>
        </View>

        {/* Photo thumbnails */}
        <View style={styles.photoRow}>
          <Text style={styles.photoRowLabel}>Assay Crate Inspection Stream</Text>
          <Text style={styles.photoRowCount}>2 Photos Attached</Text>
        </View>
        <View style={styles.photoThumbs}>
          <Image source={redOnions} style={styles.photoThumb} />
          <Image source={mandiWarehouse} style={styles.photoThumb} />
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>Set Asking Price &amp; Publish · भाव ठरवा</Text>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
        <View style={styles.dockLinks}>
          <TouchableOpacity style={styles.dockLink}>
            <Icon name="clipboard" size={12} color={colors.onSurfaceVariant} />
            <Text style={styles.dockLinkText}>Download Grade Certificate (PDF)</Text>
          </TouchableOpacity>
          <Text style={styles.dockSave}>Auto-saved draft · 3:45 PM</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  progressBg: { height: 5, backgroundColor: colors.outlineVariant },
  progressFill: { height: 5, backgroundColor: colors.primary },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: 5, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  progressLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  apmcBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  apmcBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  scroll: { paddingBottom: 130 },
  gradeHeroCard: { flexDirection: 'row', margin: space.md, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  gradeHeroImage: { width: 90, height: '100%' as any, minHeight: 120 },
  gradeHeroOverlay: { position: 'absolute', bottom: 0, left: 0, width: 90, padding: 4 },
  fieldVerifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 4, paddingVertical: 2 },
  fieldVerifiedText: { fontFamily: fontFamily.bold, fontSize: 8, color: colors.onPrimary },
  gradeHeroRight: { flex: 1, padding: space.sm },
  gradeABadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.positiveContainer, marginBottom: 4 },
  gradeAText: { fontFamily: fontFamily.extraBold, fontSize: 12, color: colors.tertiary },
  gradeScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  gradeScoreBig: { fontFamily: fontFamily.extraBold, fontSize: 32, color: colors.onSurface, letterSpacing: -1 },
  gradeScoreMax: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.onSurfaceVariant },
  gradeScoreVerified: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  gradeVariety: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface, marginBottom: 4 },
  gradeMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginBottom: 3 },
  gradeMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  gradeMetaText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  gradeYardRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  gradeYardText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, flex: 1 },
  recommendCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.onPrimaryContainer, borderWidth: 1, borderColor: colors.primaryContainer, padding: space.md },
  recommendHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.xs },
  recommendTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary, flex: 1 },
  gainBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.primaryContainer },
  gainBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onPrimary },
  recommendDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurface, marginBottom: space.sm, lineHeight: 17 },
  recommendPriceRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  recommendPriceItem: { flex: 1 },
  recommendPriceLabel: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recommendPrice: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.primary },
  recommendPriceUnit: { fontFamily: fontFamily.medium, fontSize: 11 },
  recommendCtas: { flexDirection: 'row', gap: space.sm },
  publishNowBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.primaryContainer },
  radioFilled: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.onPrimary, flexShrink: 0 },
  publishNowText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onPrimary, flex: 1 },
  publishNowSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onPrimary },
  holdBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.outlineVariant, backgroundColor: colors.surface },
  radioEmpty: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.outline, flexShrink: 0 },
  holdBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  holdBtnSub: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.tertiary },
  breakdownCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  breakdownHeader: { flexDirection: 'row', alignItems: 'center', gap: space.xs, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  breakdownTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  breakdownSubTitle: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, flex: 1 },
  paramCountBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  paramCountText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant },
  paramRow: { padding: space.sm },
  paramMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  paramLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  paramScore: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.primary },
  paramBarBg: { height: 6, backgroundColor: colors.outlineVariant, borderRadius: radius.full, marginBottom: 4, overflow: 'hidden' },
  paramBarFill: { height: 6, backgroundColor: colors.primary, borderRadius: radius.full },
  paramSubLabel: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  paramDivider: { height: 1, backgroundColor: colors.outlineVariant, marginTop: space.xs },
  hashRow: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: space.sm, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  hashText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, flex: 1 },
  hashCode: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  fairValueCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  fairValueLabel: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant, letterSpacing: 0.8 },
  fairValueHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.xs },
  fairValueTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.onSurface, flex: 1 },
  premiumBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  premiumBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  fairValuePriceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: space.sm },
  fairValuePrice: { fontFamily: fontFamily.extraBold, fontSize: 26, color: colors.primary, letterSpacing: -0.5 },
  fairValueUnit: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.onSurfaceVariant, marginLeft: 3 },
  fairValueMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  fairValueMetaItem: { flex: 1, minWidth: 100 },
  fairValueMetaKey: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  fairValueMetaVal: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  fairValueMetaSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  highDemandBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer, alignSelf: 'flex-start', marginTop: 2 },
  highDemandText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  escrowCard: { marginHorizontal: space.md, marginBottom: space.sm, flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)' },
  escrowIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(4,120,87,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  escrowTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.tertiary, flex: 1 },
  escrowDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, flex: 1, lineHeight: 17 },
  photoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.md, marginBottom: space.xs },
  photoRowLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  photoRowCount: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  photoThumbs: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.md, marginBottom: space.md },
  photoThumb: { flex: 1, height: 80, borderRadius: radius.md },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 6 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  ctaBtnText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onPrimary },
  dockLinks: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dockLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dockLinkText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  dockSave: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.outline },
});
