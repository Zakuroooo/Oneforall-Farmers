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

type Option = { label: string; sublabel?: string; badge?: string; badgeColor?: string };

export default function S20_QualityDiagnostic({ navigation }: any) {
  const { t } = useT();
  const [selected, setSelected] = useState<Record<string, number>>({});

  const QUESTIONS: Array<{
    num: string;
    title: string;
    badge?: string;
    badgeColor?: string;
    options: Option[];
  }> = [
    {
      num: '1.',
      title: t('quality_q1_title'),
      badge: t('quality_q1_ai_badge'),
      badgeColor: colors.positiveContainer,
      options: [
        { label: t('quality_q1_opt1'), sublabel: t('quality_q1_opt1_sub'), badge: t('quality_q1_opt1_badge') },
        { label: t('quality_q1_opt2'), sublabel: t('quality_q1_opt2_sub') },
        { label: t('quality_q1_opt3'), sublabel: t('quality_q1_opt3_sub') },
      ],
    },
    {
      num: '2.',
      title: t('quality_q2_title'),
      badge: t('quality_q2_ai_badge'),
      badgeColor: colors.positiveContainer,
      options: [
        { label: t('quality_q2_opt1'), sublabel: t('quality_q2_opt1_sub') },
        { label: t('quality_q2_opt2'), sublabel: t('quality_q2_opt2_sub') },
        { label: t('quality_q2_opt3'), sublabel: t('quality_q2_opt3_sub') },
      ],
    },
    {
      num: '3.',
      title: t('quality_q3_title'),
      badge: t('quality_q3_ai_badge'),
      badgeColor: colors.positiveContainer,
      options: [
        { label: t('quality_q3_opt1'), sublabel: t('quality_q3_opt1_sub') },
        { label: t('quality_q3_opt2'), sublabel: t('quality_q3_opt2_sub') },
      ],
    },
    {
      num: '4.',
      title: t('quality_q4_title'),
      badge: t('quality_q4_ai_badge'),
      badgeColor: colors.surfaceContainerHigh,
      options: [
        { label: t('quality_q4_opt1'), sublabel: t('quality_q4_opt1_sub'), badge: t('quality_q4_opt1_badge'), badgeColor: colors.positiveContainer },
        { label: t('quality_q4_opt2'), sublabel: t('quality_q4_opt2_sub'), badge: t('quality_q4_opt2_badge'), badgeColor: '#FEF3C7' },
        { label: t('quality_q4_opt3'), sublabel: t('quality_q4_opt3_sub'), badge: t('quality_q4_opt3_badge'), badgeColor: colors.surfaceContainerHigh },
      ],
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('quality_header_title')}</Text>
          <Text style={styles.headerSub}>{t('quality_header_sub')}</Text>
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
        <Text style={styles.progressLabelActive}>{t('quality_progress_label')}</Text>
        <View style={styles.draftBadge}>
          <Icon name="check" size={10} color={colors.tertiary} />
          <Text style={styles.draftText}>{t('quality_draft_badge')}</Text>
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
            <Text style={styles.lotVariety}>{t('quality_lot_variety')}</Text>
            <Text style={styles.lotSub}>{t('quality_lot_sub')}</Text>
            <View style={styles.aiPhotoRow}>
              <Icon name="star" size={11} color={colors.tertiary} />
              <Text style={styles.aiPhotoText}>{t('quality_ai_photo')}</Text>
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
                  <View style={styles.optionContent}>
                    <View style={styles.optionTitleRow}>
                      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{opt.label}</Text>
                      {opt.badge && (
                        <View style={[styles.optBadge, { backgroundColor: opt.badgeColor || colors.surfaceContainerHighest }]}>
                          <Text style={styles.optBadgeText}>{opt.badge}</Text>
                        </View>
                      )}
                    </View>
                    {opt.sublabel && <Text style={styles.optionSub}>{opt.sublabel}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Action Dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.dockBtn} onPress={() => navigation.navigate('S21_PriceDiscovery')}>
          <Text style={styles.dockBtnText}>{t('quality_btn_save')}</Text>
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
  progressBg: { height: 4, backgroundColor: colors.surfaceContainerHigh },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: colors.surface },
  progressLabelActive: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  draftBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.positiveContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  draftText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  scroll: { paddingBottom: 100 },
  lotCard: { flexDirection: 'row', margin: space.md, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  lotThumbPlaceholder: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  lotThumbText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.onSurfaceVariant, marginTop: 2 },
  lotInfo: { flex: 1, marginLeft: space.md, justifyContent: 'center' },
  lotVariety: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, marginBottom: 2 },
  lotSub: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 6 },
  aiPhotoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiPhotoText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  section: { marginHorizontal: space.md, marginBottom: space.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.sm },
  sectionNum: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary, marginRight: 8, marginTop: 2 },
  sectionTitles: { flex: 1 },
  sectionTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  sectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: radius.sm, marginLeft: 8, alignSelf: 'flex-start' },
  sectionBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurface },
  optionCard: { flexDirection: 'row', padding: space.md, marginBottom: space.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  optionCardActive: { borderColor: colors.primaryContainer, backgroundColor: colors.onPrimaryContainer, borderWidth: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', marginRight: space.md, marginTop: 2 },
  radioActive: { borderColor: colors.primary },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionContent: { flex: 1 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  optionLabel: { flex: 1, fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, lineHeight: 20 },
  optionLabelActive: { color: colors.primary },
  optBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, marginLeft: space.sm },
  optBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurface },
  optionSub: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 17 },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  dockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primary, borderRadius: radius.lg },
  dockBtnText: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onPrimary },
});
