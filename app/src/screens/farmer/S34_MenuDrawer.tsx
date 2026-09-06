/**
 * S34_MenuDrawer — Screen 34: Account & Menu Hub (farmer profile + institutional ties).
 * Matched to Stitch `34_menu_drawer_farmer_profile_institutional_ties/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const farmerPortrait = require('../../assets/images/farmer_rambhau.jpg');

const SECTION_PRODUCE = [
  { iconName: 'box', iconBg: 'rgba(155,47,0,0.08)', iconColor: colors.primary, title: 'My Lots & AI Quality Moisture Scores', titleMr: 'माझे लॉट व मालाची प्रतवारी', badge: '2 सक्रिय' },
  { iconName: 'handshake', iconBg: 'rgba(155,47,0,0.08)', iconColor: colors.primary, title: 'Deals & Real-time Escrow Settlement', titleMr: 'सौदे व एस्क्रो पेमेंट ट्रॅकिंग', badge: '1 जमा बाकी' },
  { iconName: 'building', iconBg: 'rgba(155,47,0,0.08)', iconColor: colors.primary, title: 'Warehouse Receipt Loan', titleMr: 'शेतमाल तारण कर्ज', badge: '₹35,000 उपलब्ध', badgeColor: colors.positiveContainer, badgeTextColor: colors.tertiary, isNew: true },
  { iconName: 'clipboard', iconBg: 'rgba(155,47,0,0.08)', iconColor: colors.primary, title: 'Tax Invoices & APMC Cess Receipts', titleMr: 'अधिकृत कर पावत्या व Form 13', badge: null },
] as const;

const SECTION_DATA = [
  { iconName: 'trending-up', iconBg: 'rgba(4,120,87,0.08)', iconColor: colors.tertiary, title: 'How AI Forecasts Work (84% Model Accuracy)', titleMr: 'भावाचा अंदाज कसा लावला जातो?' },
  { iconName: 'signal', iconBg: 'rgba(4,120,87,0.08)', iconColor: colors.tertiary, title: 'Govt. Agmarknet API + Mandi Sensor Mesh', titleMr: 'बाजार माहिती स्त्रोत: Agmarknet + IoT' },
] as const;

export default function S34_MenuDrawer({ navigation }: any) {
  const { t } = useT();
  const [biometricOn, setBiometricOn] = React.useState(true);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="x-circle" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>माझे खाते व मेनू</Text>
          <Text style={styles.headerSub}>ACCOUNT &amp; MENU HUB</Text>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.verifiedBanner}>
            <Icon name="check-circle" size={12} color={colors.tertiary} />
            <Text style={styles.verifiedBannerText}>नोंदणीकृत शेतकरी</Text>
          </View>
          <View style={styles.profileRow}>
            <Image source={farmerPortrait} style={styles.profilePhoto} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>रामभाऊ विठ्ठल पाटील</Text>
              <Text style={styles.profileNameEn}>Rambhau V. Patil</Text>
              <View style={styles.profileLocRow}>
                <Icon name="map-pin" size={11} color={colors.onSurfaceVariant} />
                <Text style={styles.profileLoc}>मु. पो. निफाड, जि. नाशिक</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileMetaGrid}>
            {[
              ['शेतकरी क्रमांक • Mandi ID', '#MS-NSK-49201'],
              ['मोबाईल • Verified OTP', '+9198220 ••••'],
              ['मुख्य शेतमाल • Crops', 'कांदा व सोयाबीन'],
              ['जमीन धारणा • Landholding', '५.५एकर (बागायती)'],
            ].map(([k, v]) => (
              <View key={k} style={styles.profileMetaItem}>
                <Text style={styles.profileMetaKey}>{k}</Text>
                <Text style={styles.profileMetaVal}>{v}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.editProfileBtn}>
            <Icon name="edit" size={13} color={colors.primaryContainer} />
            <Text style={styles.editProfileText}>प्रोफाईल संपादित करा • Edit Profile</Text>
            <Icon name="arrow-right" size={13} color={colors.primaryContainer} />
          </TouchableOpacity>
        </View>

        {/* Credentials section */}
        <Text style={styles.sectionLabel}>प्रमाणित संलग्नता • VERIFIED CREDENTIALS</Text>
        <View style={styles.credCard}>
          <View style={styles.credRow}>
            <View style={styles.credIconBg}><Icon name="building" size={16} color={colors.primary} /></View>
            <View style={styles.credInfo}>
              <Text style={styles.credTitle}>लासलगाव APMC अधिकृत शेतकरी</Text>
              <Text style={styles.credSub}>Regd. Yard Trader–Farmer Pass No: LSG-2024-88</Text>
            </View>
            <View style={styles.activeBadge}><Text style={styles.activeText}>सक्रिय</Text></View>
          </View>
          <View style={styles.credDivider} />
          <View style={styles.credRow}>
            <View style={[styles.credIconBg, { backgroundColor: 'rgba(4,120,87,0.08)' }]}>
              <Icon name="leaf" size={16} color={colors.tertiary} />
            </View>
            <View style={styles.credInfo}>
              <Text style={styles.credTitle}>सह्याद्री फार्मर्स प्रोड्युसर कंपनी (FPO)</Text>
              <Text style={styles.credSub}>निफाड संलग्न क्रमांक: #SF-883 • 8% खत सवलत</Text>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: colors.positiveContainer }]}>
              <Text style={[styles.activeText, { color: colors.tertiary }]}>लागश्नां पार</Text>
            </View>
          </View>
          <View style={styles.credDivider} />
          <View style={styles.credRow}>
            <View style={styles.credIconBg}><Icon name="star" size={16} color="#F59E0B" /></View>
            <View style={styles.credInfo}>
              <Text style={styles.credTitle}>4.9 (24/24 सुरक्षित पूर्ण सौदे · 100% Escrow Honored)</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>₹2,46,200</Text>
            <Text style={styles.statLabel}>एकूण चुकारा{'\n'}चालू हंगाम 2024</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>2 लॉट</Text>
            <Text style={styles.statLabel}>बाजारातील लॉट{'\n'}लाइव्ह विक्री सुरू</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>100%</Text>
            <Text style={styles.statLabel}>एस्क्रो पेआउट{'\n'}सुरक्षित</Text>
          </View>
        </View>

        {/* Produce & Trading section */}
        <Text style={styles.sectionLabel}>शेतमाल व व्यवहार • PRODUCE &amp; TRADING</Text>
        <View style={styles.menuCard}>
          {SECTION_PRODUCE.map((item, i) => (
            <React.Fragment key={i}>
              <TouchableOpacity style={styles.menuRow}>
                <View style={[styles.menuIconBg, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.iconName} size={16} color={item.iconColor} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.titleMr}</Text>
                  <Text style={styles.menuSub}>{item.title}</Text>
                </View>
                {item.badge && (
                  <View style={[styles.menuBadge,
                    'badgeColor' in item && { backgroundColor: item.badgeColor }]}>
                    {'isNew' in item && item.isNew && <Icon name="zap" size={9} color={colors.primary} />}
                    <Text style={[styles.menuBadgeText,
                      'badgeTextColor' in item && { color: item.badgeTextColor }]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
                <Icon name="chevron-right" size={16} color={colors.outline} />
              </TouchableOpacity>
              {i < SECTION_PRODUCE.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Data transparency */}
        <Text style={styles.sectionLabel}>डेटा व पारदर्शकता • TRANSPARENCY &amp; AI</Text>
        <View style={styles.menuCard}>
          {SECTION_DATA.map((item, i) => (
            <React.Fragment key={i}>
              <TouchableOpacity style={styles.menuRow}>
                <View style={[styles.menuIconBg, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.iconName} size={16} color={item.iconColor} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuTitle}>{item.titleMr}</Text>
                  <Text style={styles.menuSub}>{item.title}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={colors.outline} />
              </TouchableOpacity>
              {i < SECTION_DATA.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>पाखने व सुरक्षितता • PREFERENCES &amp; SECURITY</Text>
        <View style={styles.menuCard}>
          {/* Language */}
          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(99,102,241,0.08)' }]}>
              <Icon name="globe" size={16} color="#4F46E5" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>अॅप भाषा • Language</Text>
              <Text style={styles.menuSub}>मराठी निवडली आहे</Text>
            </View>
            <View style={styles.langRow}>
              {['मराठी', 'हिंदी', 'EN'].map((l, i) => (
                <View key={l} style={[styles.langChip, i === 0 && styles.langChipActive]}>
                  <Text style={[styles.langChipText, i === 0 && styles.langChipTextActive]}>{l}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          {/* Bank */}
          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(4,120,87,0.08)' }]}>
              <Icon name="building" size={16} color={colors.tertiary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>बँक खाते व RTGS तपशील</Text>
              <Text style={styles.menuSub}>SBI ••••4209 (निफाड शाखा) · 8-सेकंद पेआउट</Text>
            </View>
            <Icon name="check-circle" size={14} color={colors.tertiary} />
            <Icon name="chevron-right" size={16} color={colors.outline} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          {/* Biometric */}
          <View style={styles.menuRow}>
            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(155,47,0,0.08)' }]}>
              <Icon name="lock" size={16} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>फिंगरप्रिंट / बायोमेट्रिक लॉक</Text>
              <Text style={styles.menuSub}>सौद्यांचा पुष्टी करताना सुरक्षा पिन</Text>
            </View>
            <Switch
              value={biometricOn}
              onValueChange={setBiometricOn}
              trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
              thumbColor={biometricOn ? colors.primary : colors.outline}
            />
          </View>
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>शेतकरी सहाय्य • SUPPORT &amp; ARBITRATION</Text>
        <View style={styles.supportCard}>
          <View style={styles.supportRow}>
            <View style={styles.supportIconBg}><Icon name="phone" size={18} color={colors.primary} /></View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportTitle}>24×7 Mandi Mitra Helpline</Text>
              <Text style={styles.supportSub}>टोल-फ्री: 1800-233-4567 (नि:शुल्क)</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>कॉल करा</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIconBg, { backgroundColor: 'rgba(99,102,241,0.08)' }]}>
              <Icon name="clipboard" size={16} color="#4F46E5" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>APMC तक्रार निवारण व लवाद कक्ष</Text>
              <Text style={styles.menuSub}>Dispute Desk • नाशिक जिल्हा बाजार समिती</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.outline} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Icon name="arrow-right" size={14} color={colors.critical} />
          <Text style={styles.logoutText}>अकाउंटमधून बाहेर पडा • Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Icon name="shield-check" size={11} color={colors.tertiary} />
          <Text style={styles.footerText}>
            शेतकऱ्याचा हक्का, पारदर्शक भाव{'\n'}
            Mandi-Setu Android v2.4.1 (Nashik APMC Node){'\n'}
            ऑफलाइन सिंक सक्षम · SQLite Encrypted Engine #MS492
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  headerSub: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant, letterSpacing: 0.8 },
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
    backgroundColor: 'rgba(155,47,0,0.08)', borderWidth: 1, borderColor: 'rgba(155,47,0,0.15)',
  },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 24 },
  profileCard: {
    margin: space.md, borderRadius: radius.xl, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md, overflow: 'hidden',
  },
  verifiedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
    backgroundColor: colors.positiveContainer, marginBottom: space.sm,
  },
  verifiedBannerText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  profileRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  profilePhoto: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.primaryContainer, flexShrink: 0 },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: fontFamily.extraBold, fontSize: 20, color: colors.onSurface },
  profileNameEn: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  profileLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  profileLoc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant },
  profileMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginBottom: space.sm },
  profileMetaItem: { width: '50%', paddingVertical: 3 },
  profileMetaKey: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  profileMetaVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  editProfileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: space.sm, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.primaryContainer,
  },
  editProfileText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primaryContainer, flex: 1 },
  sectionLabel: {
    fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant,
    paddingHorizontal: space.md, marginTop: space.md, marginBottom: space.xs,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  credCard: {
    marginHorizontal: space.md, borderRadius: radius.xl, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  credRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm },
  credIconBg: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  credInfo: { flex: 1 },
  credTitle: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  credSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  credDivider: { height: 1, backgroundColor: colors.outlineVariant },
  activeBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.1)' },
  activeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.primary },
  statsRow: {
    flexDirection: 'row', marginHorizontal: space.md, marginTop: space.sm,
    borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
    padding: space.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary, letterSpacing: -0.3 },
  statLabel: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.outlineVariant },
  menuCard: {
    marginHorizontal: space.md, borderRadius: radius.xl, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm },
  menuIconBg: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  menuInfo: { flex: 1 },
  menuTitle: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  menuSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, marginTop: 1 },
  menuBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  menuBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant },
  menuDivider: { height: 1, backgroundColor: colors.outlineVariant, marginLeft: 52 },
  langRow: { flexDirection: 'row', gap: 4 },
  langChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  langChipActive: { backgroundColor: colors.primary },
  langChipText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant },
  langChipTextActive: { color: colors.onPrimary },
  supportCard: {
    marginHorizontal: space.md, borderRadius: radius.xl, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  supportRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm },
  supportIconBg: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  supportInfo: { flex: 1 },
  supportTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  supportSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  callBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
  },
  callBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
    marginHorizontal: space.md, marginTop: space.md, paddingVertical: space.sm,
    borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(220,38,38,0.25)',
    backgroundColor: 'rgba(220,38,38,0.05)',
  },
  logoutText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.critical },
  footer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 4,
    margin: space.md, marginTop: space.sm,
  },
  footerText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, flex: 1, lineHeight: 15 },
});
