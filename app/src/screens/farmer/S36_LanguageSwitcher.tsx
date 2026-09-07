/**
 * S36_LanguageSwitcher — Screen 36: Language settings (English selection view).
 * Matched to Stitch `36_language_switcher_english_selection/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

export default function S36_LanguageSwitcher({ navigation }: any) {
  const { t, locale, setLocale } = useT();
  const [selectedLang, setSelectedLang] = useState<'mr' | 'hi' | 'en'>(locale);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speed, setSpeed] = useState<0 | 1 | 2>(1);

  const LANGUAGES = [
    {
      id: 'mr',
      option: 'Option 1',
      name: t('lang_mr_name'),
      nameEn: t('lang_mr_sub'),
      badge: t('lang_mr_badge'),
      badgeColor: colors.positiveContainer,
      badgeTextColor: colors.tertiary,
      preview: t('lang_mr_preview'),
      voiceLabel: t('lang_mr_voice_btn'),
      voiceNote: t('lang_mr_voice_note'),
      previewLabel: t('lang_mr_preview_label'),
    },
    {
      id: 'hi',
      option: 'Option 2',
      name: t('lang_hi_name'),
      nameEn: t('lang_hi_sub'),
      badge: t('lang_hi_badge'),
      badgeColor: colors.surfaceContainerHigh,
      badgeTextColor: colors.onSurfaceVariant,
      preview: t('lang_hi_preview'),
      voiceLabel: t('lang_hi_voice_btn'),
      voiceNote: t('lang_hi_voice_note'),
      previewLabel: t('lang_hi_preview_label'),
    },
    {
      id: 'en',
      option: 'Option 3',
      name: t('lang_en_name'),
      nameEn: t('lang_en_sub'),
      badge: t('lang_en_badge'),
      badgeColor: colors.surfaceContainerHigh,
      badgeTextColor: colors.onSurfaceVariant,
      preview: t('lang_en_preview'),
      voiceLabel: t('lang_en_voice_btn'),
      voiceNote: t('lang_en_voice_note'),
      previewLabel: t('lang_en_preview_label'),
    },
  ] as const;
  
  const SPEEDS = [t('lang_speed_slow'), t('lang_speed_normal'), t('lang_speed_fast')] as const;

  const handleSave = () => {
    setLocale(selectedLang);
    navigation.canGoBack() && navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('lang_header_title')}</Text>
          <Text style={styles.headerSub}>{t('lang_header_sub')}</Text>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Intro card */}
        <View style={styles.introCard}>
          <View style={styles.introIconBg}>
            <Icon name="volume" size={22} color={colors.primary} />
          </View>
          <Text style={styles.introHeading}>{t('lang_intro_heading')}</Text>
          <Text style={styles.introPara}>{t('lang_intro_para')}</Text>
          <View style={styles.introBadge}>
            <Icon name="check-circle" size={12} color={colors.tertiary} />
            <Text style={styles.introBadgeText}>{t('lang_intro_badge')}</Text>
          </View>
          <Text style={styles.introTag}>{t('lang_intro_tag')}</Text>
        </View>

        {/* Language cards */}
        {LANGUAGES.map((lang) => {
          const isActive = selectedLang === lang.id;
          return (
            <TouchableOpacity
              key={lang.id}
              style={[styles.langCard, isActive && styles.langCardActive]}
              onPress={() => setSelectedLang(lang.id as 'mr' | 'hi' | 'en')}
              activeOpacity={0.85}>

              <View style={styles.langCardHeader}>
                <View style={styles.langCardLeft}>
                  {isActive ? (
                    <View style={styles.activeBanner}>
                      <Icon name="check-circle" size={12} color={colors.primaryContainer} />
                      <Text style={styles.activeBannerText}>{t('lang_active_badge')}</Text>
                    </View>
                  ) : (
                    <Text style={styles.langOption}>{lang.option}</Text>
                  )}
                </View>
                <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
              </View>

              <Text style={styles.langName}>{lang.name}</Text>
              <View style={styles.langMetaRow}>
                <Text style={styles.langNameEn}>{lang.nameEn}</Text>
                <View style={[styles.langBadge, { backgroundColor: lang.badgeColor }]}>
                  <Text style={[styles.langBadgeText, { color: lang.badgeTextColor }]}>{lang.badge}</Text>
                </View>
              </View>

              {/* Live preview */}
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>{lang.previewLabel}</Text>
                <Text style={styles.previewText}>{lang.preview}</Text>
              </View>

              {/* Voice sample */}
              <TouchableOpacity style={styles.voiceSampleBtn}>
                <Icon name="volume" size={14} color={colors.primary} />
                <Text style={styles.voiceSampleText}>{lang.voiceLabel}</Text>
              </TouchableOpacity>
              <Text style={styles.voiceNote}>{lang.voiceNote}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Voice assistance section */}
        <View style={styles.voiceSection}>
          <View style={styles.voiceSectionHeader}>
            <Icon name="mic" size={16} color={colors.primary} />
            <View style={styles.voiceSectionInfo}>
              <Text style={styles.voiceSectionTitle}>{t('lang_voice_title')}</Text>
              <Text style={styles.voiceSectionSub}>{t('lang_voice_sub')}</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, voiceOn && styles.toggleBtnActive]}
              onPress={() => setVoiceOn(v => !v)}>
              {voiceOn && <Icon name="check" size={14} color={colors.onPrimary} />}
            </TouchableOpacity>
          </View>

          <Text style={styles.voiceDescText}>{t('lang_voice_desc')}</Text>

          {/* Speed selection */}
          <View style={styles.speedRow}>
            <Text style={styles.speedLabel}>{t('lang_speed_label')}</Text>
            <Text style={styles.speedCurrent}>{t('lang_speed_current')}</Text>
          </View>
          <View style={styles.speedTabs}>
            {SPEEDS.map((s, i) => (
              <TouchableOpacity
                key={s}
                style={[styles.speedTab, speed === i && styles.speedTabActive]}
                onPress={() => setSpeed(i as 0 | 1 | 2)}>
                <Text style={[styles.speedTabText, speed === i && styles.speedTabTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.offlineNote}>
            <Icon name="check-circle" size={12} color={colors.tertiary} />
            <Text style={styles.offlineNoteText}>{t('lang_offline_note')}</Text>
          </View>
        </View>

        {/* Footer note */}
        <View style={styles.footerNote}>
          <Icon name="lock" size={11} color={colors.tertiary} />
          <Text style={styles.footerNoteText}>{t('lang_footer_note')}</Text>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Icon name="check-circle" size={18} color={colors.onPrimary} />
          <Text style={styles.saveBtnText}>{t('lang_btn_save')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Text style={styles.cancelLinkText}>{t('lang_btn_cancel')}</Text>
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
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.primary },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 130 },
  introCard: {
    margin: space.md, marginBottom: space.sm, padding: space.md, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  introIconBg: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center', marginBottom: space.sm,
  },
  introHeading: { fontFamily: fontFamily.extraBold, fontSize: 20, color: colors.onSurface, lineHeight: 28, marginBottom: space.xs },
  introPara: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 19, marginBottom: space.sm },
  introBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer,
  },
  introBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  introTag: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 4 },
  langCard: {
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md,
  },
  langCardActive: { borderColor: colors.primaryContainer, borderWidth: 2, backgroundColor: colors.onPrimaryContainer },
  langCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.xs },
  langCardLeft: {},
  activeBanner: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  activeBannerText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  langOption: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  langName: { fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.primary, letterSpacing: -0.5 },
  langMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.sm, flexWrap: 'wrap' },
  langNameEn: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  langBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  langBadgeText: { fontFamily: fontFamily.bold, fontSize: 10 },
  previewBox: { padding: space.sm, borderRadius: radius.md, backgroundColor: 'rgba(0,0,0,0.04)', marginBottom: space.sm, borderLeftWidth: 3, borderLeftColor: colors.primary },
  previewLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 4 },
  previewText: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurface, lineHeight: 19 },
  voiceSampleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: space.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surface, alignSelf: 'flex-start' },
  voiceSampleText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  voiceNote: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 4 },
  voiceSection: {
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md,
  },
  voiceSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  voiceSectionInfo: { flex: 1 },
  voiceSectionTitle: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  voiceSectionSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant },
  toggleBtn: {
    width: 44, height: 26, borderRadius: 13, backgroundColor: colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.primaryContainer },
  voiceDescText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: space.sm, lineHeight: 17 },
  speedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xs },
  speedLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  speedCurrent: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  speedTabs: { flexDirection: 'row', gap: space.xs, marginBottom: space.sm },
  speedTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.surfaceContainerHigh, borderWidth: 1, borderColor: colors.outlineVariant },
  speedTabActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  speedTabText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant },
  speedTabTextActive: { color: colors.onPrimary },
  offlineNote: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  offlineNoteText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.tertiary, flex: 1 },
  footerNote: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.sm,
    borderRadius: radius.md, backgroundColor: colors.positiveContainer,
  },
  footerNoteText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onPositiveContainer, flex: 1 },
  dock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
    height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg,
    shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
  },
  saveBtnText: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.onPrimary },
  cancelLink: { alignItems: 'center', paddingVertical: 6 },
  cancelLinkText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurfaceVariant },
});
