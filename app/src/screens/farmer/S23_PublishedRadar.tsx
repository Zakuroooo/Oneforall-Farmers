/**
 * S23_PublishedRadar — Screen 23: Published lot + real-time buyer matching radar.
 * Matched to Stitch `23_published_real_time_buyer_matching_radar/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon, IconName } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const INBOUND: Array<{
  iconName: IconName;
  iconBg: string;
  iconColor: string;
  title: string;
  time: string;
  desc: string;
  badge1: string | null;
  badge2: string | null;
  badge1Color: string | undefined;
  badge1TextColor: string | undefined;
}> = [
  {
    iconName: 'eye',
    iconBg: 'rgba(155,47,0,0.08)',
    iconColor: colors.primary,
    title: 'Nashik Agro Exports',
    time: '2m ago',
    desc: 'Assay report viewed. High purchase readiness score (98%).',
    badge1: 'Verified Escrow Account',
    badge2: 'Niphad cluster buyer',
    badge1Color: colors.positiveContainer,
    badge1TextColor: colors.tertiary,
  },
  {
    iconName: 'bell',
    iconBg: 'rgba(245,158,11,0.1)',
    iconColor: '#F59E0B',
    title: 'Pune Trading Co Dispatch Alert',
    time: '4m ago',
    desc: 'Candidate for Farmgate direct pickup. Route optimization matched.',
    badge1: null,
    badge2: null,
    badge1Color: undefined,
    badge1TextColor: undefined,
  },
];

const ALERT_SETTINGS: Array<{ icon: IconName; title: string; sub: string }> = [
  { icon: 'message-circle', title: 'WhatsApp Alert on First Bid', sub: '+9182204343 वर मेसेज येईल' },
  { icon: 'phone', title: 'Audio Phone Call on Urgent Counter-Offer', sub: 'तातडीच्या बोलीसाठी फोन कॉल अलर्ट' },
];

export default function S23_PublishedRadar({ navigation }: any) {
  const { t } = useT();
  const [alertEnabled, setAlertEnabled] = useState([true, true]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="x-circle" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.publishedBadge}>
            <View style={styles.liveGreen} />
            <Text style={styles.publishedText}>LOT PUBLISHED</Text>
          </View>
          <Text style={styles.headerTitle}>माल थेट बाजारात आला</Text>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Live lot card */}
        <View style={styles.lotCard}>
          <View style={styles.liveTag}>
            <View style={styles.liveGreenSmall} />
            <Text style={styles.liveTagText}>LIVE &amp; ASSAYED</Text>
            <Text style={styles.liveTagRef}>Lot #LP-403</Text>
          </View>
          <Text style={styles.lotTitle}>Lot #LP-403 is Live!</Text>
          <Text style={styles.lotSubTitle}>तुमचा ४० क्विंटल कांदा खरेदीदारांसाठी खुला झाला आहे</Text>

          <View style={styles.lotMiniCard}>
            <View style={styles.lotMiniThumb}>
              <Icon name="box" size={22} color={colors.primary} />
            </View>
            <View style={styles.lotMiniInfo}>
              <Text style={styles.lotMiniVariety}>Gavran Red Onion</Text>
              <Text style={styles.lotMiniMeta}>उन्हाळ कांदा · Grade A (850/1000)</Text>
              <Text style={styles.lotMiniAsk}>Asking: ₹2,100/Qtl · Est. Net: ₹83,400</Text>
            </View>
            <View style={styles.lotMiniQtl}>
              <Text style={styles.lotMiniQtlNum}>40</Text>
              <Text style={styles.lotMiniQtlUnit}>Qtl</Text>
            </View>
          </View>

          <View style={styles.lotMetaRow}>
            <View style={styles.lotMetaItem}>
              <Icon name="clock" size={11} color={colors.primaryContainer} />
              <Text style={styles.lotMetaLabel}>Listing Active:</Text>
              <Text style={styles.lotMetaVal}>47h 59m</Text>
            </View>
            <View style={styles.lotMetaItem}>
              <Icon name="truck" size={11} color={colors.onSurfaceVariant} />
              <Text style={styles.lotMetaLabel}>Farmgate Pickup (Niphad Yard)</Text>
            </View>
          </View>
        </View>

        {/* Radar card */}
        <View style={styles.radarCard}>
          <View style={styles.radarHeader}>
            <View>
              <Text style={styles.radarTitle}>Live Buyer Matching Radar</Text>
              <Text style={styles.radarSub}>थेट खरेदीदार शोध चालू आहे · Lasalgaon Belt</Text>
            </View>
            <View style={styles.biddersOnlineBadge}>
              <View style={styles.liveGreenSmall} />
              <Text style={styles.biddersOnlineText}>6 Bidders Online</Text>
            </View>
          </View>

          {/* Radar map visualization */}
          <View style={styles.radarMap}>
            <View style={styles.radarRing3} />
            <View style={styles.radarRing2} />
            <View style={styles.radarRing1} />
            <View style={styles.radarCenter}>
              <Icon name="map-pin" size={20} color={colors.onPrimary} />
            </View>
            <Text style={styles.radarCenterLabel}>Niphad Farm</Text>

            {/* Buyer pins */}
            <View style={[styles.buyerPin, { top: '15%', right: '20%' }]}>
              <Text style={styles.buyerPinText}>Nashik Agro (12 km){'\n'}Matching Grade A</Text>
            </View>
            <View style={[styles.buyerPin, { top: '35%', left: '5%' }]}>
              <Text style={styles.buyerPinText}>Pune Traders (45 km){'\n'}Assay downloaded</Text>
            </View>
            <View style={[styles.buyerPin, { bottom: '20%', left: '10%' }]}>
              <Text style={styles.buyerPinText}>Sahyadri FPO (28 km){'\n'}Truck in area</Text>
            </View>
            <View style={[styles.buyerPin, { bottom: '25%', right: '5%' }]}>
              <Text style={styles.buyerPinText}>Vashi (160 km)</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.radarStatsRow}>
            <View style={styles.radarStat}>
              <Text style={styles.radarStatVal}>14 Buyers</Text>
              <Text style={styles.radarStatLabel}>Verified Range</Text>
              <Text style={styles.radarStatSub}>within 60 km</Text>
            </View>
            <View style={styles.radarStatDivider} />
            <View style={styles.radarStat}>
              <Text style={[styles.radarStatVal, { color: colors.tertiary }]}>3 Matched</Text>
              <Text style={styles.radarStatLabel}>Qualified Leads</Text>
              <Text style={styles.radarStatSub}>Immediate pickup</Text>
            </View>
            <View style={styles.radarStatDivider} />
            <View style={styles.radarStat}>
              <Text style={styles.radarStatVal}>8 – 15 min</Text>
              <Text style={styles.radarStatLabel}>First Bid Est.</Text>
              <Text style={styles.radarStatSub}>Lasalgaon speed</Text>
            </View>
          </View>
        </View>

        {/* Live inbound signals */}
        <View style={styles.inboundHeader}>
          <Icon name="signal" size={13} color={colors.primary} />
          <Text style={styles.inboundTitle}>Live Inbound Signals · थेट घडामोडी</Text>
          <Text style={styles.inboundRefresh}>Auto-refreshes</Text>
        </View>

        {INBOUND.map((s, i) => (
          <View key={i} style={styles.signalCard}>
            <View style={[styles.signalIcon, { backgroundColor: s.iconBg }]}>
              <Icon name={s.iconName} size={18} color={s.iconColor} />
            </View>
            <View style={styles.signalInfo}>
              <View style={styles.signalTitleRow}>
                <Text style={styles.signalTitle}>{s.title}</Text>
                <Text style={styles.signalTime}>{s.time}</Text>
              </View>
              <Text style={styles.signalDesc}>{s.desc}</Text>
              {s.badge1 || s.badge2 ? (
                <View style={styles.signalBadgeRow}>
                  {s.badge1 ? (
                    <View style={[styles.signalBadge, { backgroundColor: s.badge1Color }]}>
                      <Text style={[styles.signalBadgeText, { color: s.badge1TextColor }]}>{s.badge1}</Text>
                    </View>
                  ) : null}
                  {s.badge2 ? <Text style={styles.signalBadge2Text}>{s.badge2}</Text> : null}
                </View>
              ) : null}
            </View>
          </View>
        ))}

        {/* APMC benchmark */}
        <View style={styles.benchmarkCard}>
          <Icon name="trending-up" size={14} color={colors.primary} />
          <View style={styles.benchmarkInfo}>
            <Text style={styles.benchmarkTitle}>APMC Lasalgaon Benchmark</Text>
            <Text style={styles.benchmarkSub}>उन्हाळ कांदा सरासरी दर</Text>
          </View>
          <View>
            <Text style={styles.benchmarkPrice}>₹2,055/Qtl</Text>
            <Text style={styles.benchmarkChange}>+₹45 today</Text>
          </View>
        </View>

        {/* Escrow guarantee */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowIconBg}><Icon name="shield-check" size={22} color={colors.tertiary} /></View>
          <View style={styles.escrowContent}>
            <Text style={styles.escrowTitle}>100% Mandi-Setu Escrow Guarantee</Text>
            <Text style={styles.escrowDesc}>
              शेतकऱ्याचे पैसे सुरक्षित. Buyer funds are locked in Mandi Board bank escrow before any transport truck enters your gate. No forced distress selling.
            </Text>
            <View style={styles.escrowCheck}><Icon name="check-circle" size={12} color={colors.tertiary} /></View>
          </View>
        </View>

        {/* Alert settings */}
        <Text style={styles.alertSettingsLabel}>INSTANT ALERT SETTINGS</Text>
        <View style={styles.alertCard}>
          {ALERT_SETTINGS.map((a, i) => (
            <React.Fragment key={i}>
              <View style={styles.alertRow}>
                <View style={[styles.alertIconBg, { backgroundColor: 'rgba(155,47,0,0.08)' }]}>
                  <Icon name={a.icon} size={16} color={colors.primary} />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{a.title}</Text>
                  <Text style={styles.alertSub}>{a.sub}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.checkbox, alertEnabled[i] && styles.checkboxChecked]}
                  onPress={() => setAlertEnabled(prev => prev.map((v, idx) => idx === i ? !v : v))}>
                  {alertEnabled[i] && <Icon name="check" size={13} color={colors.onPrimary} />}
                </TouchableOpacity>
              </View>
              {i < ALERT_SETTINGS.length - 1 && <View style={styles.alertDivider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.footerNote}>Auto-refreshes every 30s · Offline safe encrypted state</Text>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.viewBuyersBtn}>
          <Text style={styles.viewBuyersBtnText}>खरेदीदार पहा · View Buyers (3 Found)</Text>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
        <View style={styles.dockSecondRow}>
          <TouchableOpacity style={styles.myLotsBtn}>
            <Icon name="box" size={14} color={colors.onSurface} />
            <Text style={styles.myLotsBtnText}>माझे माल (My Lots)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Icon name="share" size={14} color={colors.tertiary} />
            <Text style={styles.shareBtnText}>Share on WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  publishedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  publishedText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary, letterSpacing: 0.5 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  liveGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.tertiary },
  liveGreenSmall: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.tertiary },
  scroll: { paddingBottom: 140 },
  lotCard: { margin: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: space.xs },
  liveTagText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary, flex: 1 },
  liveTagRef: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  lotTitle: { fontFamily: fontFamily.extraBold, fontSize: 20, color: colors.onSurface },
  lotSubTitle: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: space.sm },
  lotMiniCard: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: space.sm },
  lotMiniThumb: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  lotMiniInfo: { flex: 1 },
  lotMiniVariety: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  lotMiniMeta: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  lotMiniAsk: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary, marginTop: 1 },
  lotMiniQtl: { alignItems: 'center' },
  lotMiniQtlNum: { fontFamily: fontFamily.extraBold, fontSize: 20, color: colors.primary },
  lotMiniQtlUnit: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  lotMetaRow: { flexDirection: 'row', gap: space.md },
  lotMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lotMetaLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  lotMetaVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primaryContainer },
  radarCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  radarHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: space.sm },
  radarTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  radarSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  biddersOnlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  biddersOnlineText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  radarMap: { height: 200, backgroundColor: '#1C2B1A', position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  radarRing3: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  radarRing2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  radarRing1: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  radarCenter: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  radarCenterLabel: { position: 'absolute', bottom: 35, fontFamily: fontFamily.bold, fontSize: 11, color: '#fff' },
  buyerPin: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 4, maxWidth: 140 },
  buyerPinText: { fontFamily: fontFamily.regular, fontSize: 9, color: '#fff', lineHeight: 13 },
  radarStatsRow: { flexDirection: 'row', padding: space.sm, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  radarStat: { flex: 1, alignItems: 'center' },
  radarStatVal: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.onSurface },
  radarStatLabel: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant },
  radarStatSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline },
  radarStatDivider: { width: 1, backgroundColor: colors.outlineVariant },
  inboundHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: space.md, marginBottom: space.xs },
  inboundTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  inboundRefresh: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  signalCard: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginHorizontal: space.md, marginBottom: space.xs, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  signalIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  signalInfo: { flex: 1 },
  signalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  signalTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  signalTime: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  signalDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurface, lineHeight: 17, marginTop: 2 },
  signalBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  signalBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  signalBadgeText: { fontFamily: fontFamily.bold, fontSize: 10 },
  signalBadge2Text: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  benchmarkCard: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: space.md, marginBottom: space.sm, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  benchmarkInfo: { flex: 1 },
  benchmarkTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  benchmarkSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  benchmarkPrice: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary, textAlign: 'right' },
  benchmarkChange: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary, textAlign: 'right' },
  escrowCard: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginHorizontal: space.md, marginBottom: space.sm, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)' },
  escrowIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(4,120,87,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  escrowContent: { flex: 1 },
  escrowTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.tertiary, marginBottom: 4 },
  escrowDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, lineHeight: 17 },
  escrowCheck: { marginTop: 4 },
  alertSettingsLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant, paddingHorizontal: space.md, letterSpacing: 0.6, marginBottom: space.xs },
  alertCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm },
  alertIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertInfo: { flex: 1 },
  alertTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  alertSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  alertDivider: { height: 1, backgroundColor: colors.outlineVariant },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxChecked: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  footerNote: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, textAlign: 'center', paddingHorizontal: space.md, marginBottom: space.sm },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8 },
  viewBuyersBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  viewBuyersBtnText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onPrimary },
  dockSecondRow: { flexDirection: 'row', gap: space.sm },
  myLotsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: touch.targetMin, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.outlineVariant },
  myLotsBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: touch.targetMin, borderRadius: radius.lg, backgroundColor: colors.positiveContainer },
  shareBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
});
