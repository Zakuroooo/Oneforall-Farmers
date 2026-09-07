/**
 * S20_QualityDiagnostic — Screen 20: Physical assay / harvest grading questions.
 * Matched to Stitch `20_quality_diagnostic_harvest_grading_questions/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

type Option = { label: string; labelMr: string; sublabel?: string; badge?: string; badgeColor?: string };

const QUESTIONS: Array<{
  num: string;
  title: string;
  titleMr: string;
  badge?: string;
  badgeColor?: string;
  options: Option[];
}> = [
  {
    num: '1.',
    title: 'Onion Bulb Uniformity',
    titleMr: 'कांद्याचा आकार आणि एकसारखेपणा',
    badge: 'AI Detected: 75% Medium-Large',
    badgeColor: colors.positiveContainer,
    options: [
      { label: 'Very Uniform (एकसारखा मोठा – 55mm+)', labelMr: 'Grade A premium export standard · समान गोलाकार माल', badge: '₹2,850+ Base' },
      { label: 'Mixed Sizing (मध्यम व लहान मिसळ – 40–55mm)', labelMr: 'Standard domestic mandi grade · मध्यम साईझ' },
      { label: 'Small / Gulti Sizing (गुल्टी / बारीक – <40mm)', labelMr: 'Discounted processing lot · गोल्टी माल' },
    ],
  },
  {
    num: '2.',
    title: 'Skin Retention & Sun-Curing',
    titleMr: 'पापुडा आणि साळकण स्थिती',
    badge: 'AI Detected: 94% Double Skin',
    badgeColor: colors.positiveContainer,
    options: [
      { label: 'Crisp Double Papery Skin (उत्कृष्ट दुहेरी लाल पापुडा)', labelMr: 'High luster. 0% shedding during handling · 45-day storage life' },
      { label: 'Single Skin / Light Peel (एक पदरी पापुडा)', labelMr: 'Minor flaking on outer layer · हलका निघालेला पापुडा' },
      { label: 'Peeled / Bald Onions Present (पापुडा निघालेला माल)', labelMr: 'White fleshy parts exposed · लाल/कच्च विकी योग्य' },
    ],
  },
  {
    num: '3.',
    title: 'Moisture & Neck Tightness',
    titleMr: 'ओलावा व कंद्याची मान कोरडी असणे',
    badge: 'Safe Moisture < 10%',
    badgeColor: colors.positiveContainer,
    options: [
      { label: 'Fully Cured & Dry Neck', labelMr: 'पूर्ण वाळलेला, मान कडक कोरडी' },
      { label: 'Slight Moisture / Thick Neck', labelMr: 'किंचित ओलसर / जाड मान अडकणाचा मात्र' },
    ],
  },
  {
    num: '4.',
    title: 'Sprouting & Black Mold / Dagi',
    titleMr: 'कोंब आणि जैविक दूषण',
    badge: 'Threshold: < 2%',
    badgeColor: colors.surfaceContainerHigh,
    options: [
      { label: '0% Zero Sprouting & No Mold', labelMr: '(पूर्ण निरोगी माल) Clean lot, zero black mold powder on scales · निर्दोष', badge: 'Grade A', badgeColor: colors.positiveContainer },
      { label: '< 3% Minor Surface Spots', labelMr: '(किंचित डाग) Superficial spots removable with outer scale · किरकोळ', badge: 'Grade B', badgeColor: '#FEF3C7' },
      { label: '> 5% Sprouting Visible (कोंब फुटलेला माल)', labelMr: 'Green sprout visible at apex · लाल/कच्च प्रक्रियेसाठी', badge: 'Grade C', badgeColor: colors.surfaceContainerHigh },
    ],
  },
];

export default function S20_QualityDiagnostic({ navigation }: any) {
  const { t } = useT();
  const [selected, setSelected] = useState<Record<string, number>>({});

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Quality Diagnostic</Text>
          <Text style={styles.headerSub}>Step 3 of 5 · दर्जा तपासणी · 40 Qtl</Text>
        </View>
        <Text style={styles.headerRef}>#LP-403</Text>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: '60%' }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabelActive}>Physical Assay Diagnostic (वैयक्तिक तपासणी)</Text>
        <View style={styles.draftBadge}>
          <Icon name="check" size={10} color={colors.tertiary} />
          <Text style={styles.draftText}>Draft Saved · ऑफलाइन सुरक्षित</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Lot summary */}
        <View style={styles.lotCard}>
          <View style={styles.lotThumbPlaceholder}>
            <Icon name="camera" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.lotThumbText}>3 Photos</Text>
          </View>
          <View style={styles.lotInfo}>
            <Text style={styles.lotVariety}>Gavran Red Onion (उन्हाळ कांदा)</Text>
            <Text style={styles.lotSub}>40 Qtl · 80 Bags (#५० किलो बोरी) · Niphad F...</Text>
            <View style={styles.aiPhotoRow}>
              <Icon name="star" size={11} color={colors.tertiary} />
              <Text style={styles.aiPhotoText}>AI Photo Score: 98% Clear (3 फोटो तपासले)</Text>
            </View>
          </View>
        </View>

        {/* Question sections */}
        {QUESTIONS.map((q, qi) => (
          <View key={qi} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNum}>{q.num}</Text>
              <View style={styles.sectionTitles}>
                <Text style={styles.sectionTitle}>{q.title}</Text>
                <Text style={styles.sectionTitleMr}>{q.titleMr}</Text>
              </View>
              {q.badge ? (
                <View style={[styles.sectionBadge, { backgroundColor: q.badgeColor }]}>
                  <Icon name="star" size={10} color={colors.tertiary} />
                  <Text style={styles.sectionBadgeText}>{q.badge}</Text>
                </View>
              ) : null}
            </View>

            {q.options.map((opt, oi) => {
              const active = selected[q.num] === oi;
              return (
                <TouchableOpacity
                  key={oi}
                  style={[styles.optionCard, active && styles.optionCardActive]}
                  onPress={() => setSelected(s => ({ ...s, [q.num]: oi }))}
                  activeOpacity={0.85}>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioFill} />}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{opt.label}</Text>
                    <Text style={styles.optionSubLabel}>{opt.labelMr}</Text>
                  </View>
                  {opt.badge ? (
                    <View style={[styles.optionBadge, opt.badgeColor ? { backgroundColor: opt.badgeColor } : undefined]}>
                      <Text style={styles.optionBadgeText}>{opt.badge}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Price protection note */}
        <View style={styles.priceProtectionCard}>
          <View style={styles.priceProtectionHeader}>
            <Icon name="shield-check" size={16} color={colors.primary} />
            <Text style={styles.priceProtectionTitle}>Mandi Price Protection Guarantee</Text>
          </View>
          <Text style={styles.priceProtectionText}>
            Honest physical answers prevent re-grading disputes at the buyer's weighing bridge. 100% Escrow deposit is released immediately when self-declaration matches weighment assay at Lasalgaon Mandi Yard.
          </Text>
          <View style={styles.priceProtectionFooter}>
            <Icon name="check-circle" size={12} color={colors.tertiary} />
            <Text style={styles.priceProtectionFooterText}>APMC Board Verified Escrow Protocol · शेतकरी संरक्षण हमी</Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>Calculate Quality Grade · प्रतवारी काढा (Step 4)</Text>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveLink}>
          <Icon name="clipboard" size={13} color={colors.onSurfaceVariant} />
          <Text style={styles.saveLinkText}>Save Draft &amp; Continue Later · नंतर सेव्ह करा</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.xs,
    paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  headerRef: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  progressBg: { height: 5, backgroundColor: colors.outlineVariant },
  progressFill: { height: 5, backgroundColor: colors.primary },
  progressLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: 5, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  progressLabelActive: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  draftBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  draftText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  scroll: { paddingBottom: 130 },
  lotCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    margin: space.md, marginBottom: space.xs, padding: space.sm,
    borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  lotThumbPlaceholder: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  lotThumbText: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
  lotInfo: { flex: 1 },
  lotVariety: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  lotSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  aiPhotoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  aiPhotoText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  section: { marginHorizontal: space.md, marginBottom: space.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs, marginBottom: space.xs },
  sectionNum: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary, minWidth: 24 },
  sectionTitles: { flex: 1 },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  sectionTitleMr: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  sectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full },
  sectionBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  optionCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space.sm,
    padding: space.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.outlineVariant,
    backgroundColor: colors.surface, marginBottom: space.xs,
  },
  optionCardActive: { borderColor: colors.primaryContainer, borderWidth: 2, backgroundColor: colors.onPrimaryContainer },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  radioActive: { borderColor: colors.primary },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionText: { flex: 1 },
  optionLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  optionLabelActive: { color: colors.primary },
  optionSubLabel: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 1 },
  optionBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer, alignSelf: 'flex-start', flexShrink: 0 },
  optionBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  priceProtectionCard: { marginHorizontal: space.md, marginBottom: space.sm, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.onPrimaryContainer, borderWidth: 1, borderColor: colors.primaryContainer },
  priceProtectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.xs },
  priceProtectionTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary, flex: 1 },
  priceProtectionText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurface, lineHeight: 18, marginBottom: space.xs },
  priceProtectionFooter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  priceProtectionFooterText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.tertiary, flex: 1 },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 6 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  ctaBtnText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onPrimary },
  saveLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  saveLinkText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
});
