/**
 * S24_LotDetail — Screen 24: Lot detail inspection + buyer pool view.
 * Matched to Stitch `24_lot_detail_inspection_buyer_pool_view/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const redOnions = require('../../assets/images/red_onions.jpg');
const mandiWarehouse = require('../../assets/images/mandi_onion_warehouse.jpg');

const QUALIFIED_BUYERS = [
  { name: 'Nashik Agro Exports', verified: true, meta: '12 km away · Direct Exporter · Highest potential', bid: '₹1,910', demand: 'Wants all 40 Qtl' },
  { name: 'Pune Trading Co.', verified: true, meta: '45 km · Ready Escrow Deposit', meta2: '98.4% On-Time', bid: '₹1,850', demand: 'Ready 40 Qtl' },
  { name: 'Sahyadri Farms FPO', verified: true, meta: '28 km · 1-hour dispatch', truck: 'Truck in Niphad', bid: '₹1,880', demand: 'Spot pickup' },
] as const;

const ASSAY_PARAMS = [
  { label: 'Bulb Uniformity & Diameter', score: 92, max: 100, detail: '(52–58mm Medium Large)' },
  { label: 'Skin Papery Luster & Color', score: 95, max: 100, detail: '(Double Skin Copper Red)' },
  { label: 'Neck Tightness & Moisture', score: 88, max: 100, detail: '(Cured Dry –8.9%)' },
  { label: 'Sprouting & Defect Freedom', score: 98, max: 100, detail: '(0% Sprout Export Grade)' },
] as const;

export default function S24_LotDetail({ navigation }: any) {
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
          <Text style={styles.headerRef}>Lot #LP-403</Text>
          <Text style={styles.headerSub}>Rambhau Patil · Niphad, Nashik</Text>
        </View>
        <View style={styles.activeBadge}>
          <View style={styles.liveGreen} />
          <Text style={styles.activeText}>Active · चालू</Text>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
        <TouchableOpacity><Icon name="share" size={20} color={colors.onSurface} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero image */}
        <View style={styles.heroContainer}>
          <Image source={mandiWarehouse} style={styles.heroImage} />
          <View style={styles.heroOverlayBottom}>
            <View style={styles.heroGradeBadge}><Text style={styles.heroGradeText}>GRADE A · 850/1000 Score</Text></View>
          </View>
          <View style={styles.heroAssayBadge}>
            <Icon name="check-circle" size={11} color={colors.onPrimary} />
            <Text style={styles.heroAssayText}>AI Assayed · 3 Angles</Text>
          </View>
        </View>

        {/* Lot name */}
        <View style={styles.lotNameCard}>
          <Text style={styles.lotName}>Gavran Red Onion</Text>
          <Text style={styles.lotNameMr}>उन्हाळ कांदा · Lasalgaon Mandi Yard</Text>
          <View style={styles.distRow}>
            <Icon name="map-pin" size={11} color={colors.onSurfaceVariant} />
            <Text style={styles.distText}>Niphad 14km</Text>
          </View>
        </View>

        {/* Photo strip */}
        <View style={styles.photoStrip}>
          <View style={styles.photoStripItem}>
            <Image source={redOnions} style={styles.photoStripImage} />
            <Text style={styles.photoStripLabel}>Shed Lot</Text>
          </View>
          <View style={styles.photoStripItem}>
            <Image source={mandiWarehouse} style={styles.photoStripImage} />
            <Text style={styles.photoStripLabel}>Bulb Caliper</Text>
          </View>
          <View style={[styles.photoStripItem, styles.moistureCard]}>
            <Icon name="leaf" size={16} color={colors.tertiary} />
            <Text style={styles.moistureLabel}>Moisture Check</Text>
            <Text style={styles.moistureVal}>8.9% Cured</Text>
          </View>
        </View>

        {/* Weight & price */}
        <View style={styles.weightPriceRow}>
          <View style={styles.weightCard}>
            <Text style={styles.metaLabel}>TOTAL LOT WEIGHT</Text>
            <Text style={styles.weightVal}>40 Qtl</Text>
            <Text style={styles.weightSub}>80 Gunny Bags · 50kg Std.</Text>
          </View>
          <View style={styles.priceCard}>
            <View style={styles.priceCardHeader}>
              <Icon name="tag" size={12} color={colors.primary} />
              <Text style={styles.metaLabel}>YOUR ASK RATE</Text>
            </View>
            <Text style={styles.priceVal}>₹2,100<Text style={styles.priceUnit}>/Qtl</Text></Text>
            <Text style={styles.priceCorridor}>Corridor: ₹2,050 – ₹2,150</Text>
          </View>
        </View>

        {/* Net settlement */}
        <View style={styles.settlementCard}>
          <View style={styles.settlementLeft}>
            <Icon name="building" size={13} color={colors.tertiary} />
            <Text style={styles.settlementLabel}>EST. NET BANK SETTLEMENT</Text>
          </View>
          <View style={styles.settlementRight}>
            <Text style={styles.settlementBadge}>Farmgate Pickup</Text>
            <Text style={styles.settlementBadgeSub}>Buyer pays transport</Text>
          </View>
        </View>
        <View style={styles.settlementAmtCard}>
          <Text style={styles.settlementAmt}>₹83,400 in Hand</Text>
          <Text style={styles.settlementAmtSub}>After ₹600 hamali · 0% Mandi-Setu commission</Text>
        </View>

        {/* Qualified buyers */}
        <View style={styles.buyersCard}>
          <View style={styles.buyersCardHeader}>
            <View style={styles.liveGreenSmall} />
            <Text style={styles.buyersCardTitle}>3 Qualified Buyers Ready</Text>
            <View style={styles.topBidBadge}><Text style={styles.topBidText}>Top Bid ₹1,910</Text></View>
          </View>
          <Text style={styles.buyersCardSub}>सक्रिय खरेदीदार मागणी · Ready for immediate dispatch</Text>

          {QUALIFIED_BUYERS.map((b, i) => (
            <React.Fragment key={i}>
              <View style={styles.buyerRow}>
                <View style={styles.buyerInfo}>
                  <View style={styles.buyerNameRow}>
                    <Text style={styles.buyerName}>{b.name}</Text>
                    <Icon name="check-circle" size={12} color={colors.tertiary} />
                  </View>
                  <Text style={styles.buyerMeta}>{b.meta}</Text>
                  {'meta2' in b ? <Text style={styles.buyerMeta}>{b.meta2}</Text> : null}
                  {'truck' in b ? (
                    <View style={styles.truckBadge}>
                      <Icon name="truck" size={10} color={colors.onSurface} />
                      <Text style={styles.truckBadgeText}>{b.truck}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.buyerBidRight}>
                  <Text style={styles.buyerBid}>{b.bid}</Text>
                  <Text style={styles.buyerDemand}>{b.demand}</Text>
                </View>
              </View>
              {i < QUALIFIED_BUYERS.length - 1 && <View style={styles.buyerDivider} />}
            </React.Fragment>
          ))}

          <TouchableOpacity style={styles.viewAllBidsBtn}>
            <Text style={styles.viewAllBidsText}>View All 3 Bids &amp; Start Sauda (खरेदीदार पहा व सौदा सुरू करा)</Text>
            <Icon name="arrow-right" size={14} color={colors.primaryContainer} />
          </TouchableOpacity>
        </View>

        {/* Assay parameters */}
        <View style={styles.assayCard}>
          <View style={styles.assayHeader}>
            <Icon name="clipboard" size={14} color={colors.primary} />
            <Text style={styles.assayTitle}>AI Lab Assay Parameters</Text>
            <View style={styles.assayCertBadge}><Text style={styles.assayCertText}>Grade A</Text></View>
          </View>
          <Text style={styles.assayCertRef}>Certificate #LP94–VERIFIED · Lasalgaon Standard</Text>

          {ASSAY_PARAMS.map((p, i) => (
            <View key={i} style={styles.assayParam}>
              <View style={styles.assayParamRow}>
                <Text style={styles.assayParamLabel}>{p.label}</Text>
                <Text style={styles.assayParamScore}>{p.score}/{p.max} · {p.detail}</Text>
              </View>
              <View style={styles.assayBarBg}>
                <View style={[styles.assayBarFill, { width: `${(p.score / p.max) * 100}%` as any }]} />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.pdfBtn}>
            <Icon name="clipboard" size={13} color={colors.primary} />
            <Text style={styles.pdfBtnText}>Download Official APMC Digital Assay PDF (प्रतवारी प्रमाणपत्र)</Text>
          </TouchableOpacity>
        </View>

        {/* Market benchmark */}
        <View style={styles.benchmarkCard}>
          <View style={styles.benchmarkHeader}>
            <Icon name="trending-up" size={14} color={colors.primary} />
            <Text style={styles.benchmarkTitle}>APMC Market Benchmark</Text>
            <Text style={styles.benchmarkChange}>+₹45 Today</Text>
          </View>
          <View style={styles.benchmarkRow}>
            <View>
              <Text style={styles.benchmarkKey}>Lasalgaon Modal Rate</Text>
              <Text style={styles.benchmarkValBig}>₹2,055 /Qtl</Text>
              <Text style={styles.benchmarkSub}>Across all standard grades</Text>
            </View>
            <View>
              <Text style={styles.benchmarkKey}>Grade A Quality Premium</Text>
              <Text style={[styles.benchmarkValBig, { color: colors.tertiary }]}>+₹45 to +₹95</Text>
            </View>
          </View>
          <View style={styles.advisoryBox}>
            <Icon name="info" size={12} color={colors.primaryContainer} />
            <Text style={styles.advisoryText}>
              Mandi-Setu Advisory: Holding window active for 11 days. Storage loss &lt;1.5%. You are well positioned to close at your ₹2,100 ask price today.
            </Text>
          </View>
        </View>

        {/* Escrow */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowIconBg}><Icon name="shield-check" size={22} color={colors.tertiary} /></View>
          <View>
            <Text style={styles.escrowTitle}>100% Mandi Board Escrow Guarantee</Text>
            <Text style={styles.escrowDesc}>Buyer's payment is locked in certified escrow before your gate unlocks for vehicle loading. Zero payment bounce or collection hassle.</Text>
            <View style={styles.escrowFooter}>
              <Icon name="check-circle" size={12} color={colors.tertiary} />
              <Text style={styles.escrowFooterText}>Regulated APMC Clearing Protocol</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.editPriceBtn}>
          <Icon name="edit" size={14} color={colors.primaryContainer} />
          <Text style={styles.editPriceText}>भाव बदला</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewOffersBtn}>
          <Text style={styles.viewOffersBtnText}>View Inbound Offers (3 Buyers) · सौदा पहा</Text>
          <Icon name="arrow-right" size={16} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerRef: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.onSurface },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  liveGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tertiary },
  liveGreenSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tertiary },
  activeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 110 },
  heroContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 180 },
  heroOverlayBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: space.sm },
  heroGradeBadge: { alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  heroGradeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  heroAssayBadge: { position: 'absolute', top: space.sm, left: space.sm, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.primary },
  heroAssayText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onPrimary },
  lotNameCard: { padding: space.md, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  lotName: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.onSurface },
  lotNameMr: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurfaceVariant },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  distText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  photoStrip: { flexDirection: 'row', gap: space.xs, padding: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  photoStripItem: { flex: 1, alignItems: 'center', overflow: 'hidden', borderRadius: radius.md },
  photoStripImage: { width: '100%', height: 64, borderRadius: radius.md },
  photoStripLabel: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
  moistureCard: { flex: 1, backgroundColor: 'rgba(4,120,87,0.06)', justifyContent: 'center', paddingVertical: space.xs, borderRadius: radius.md },
  moistureLabel: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.tertiary, marginTop: 2 },
  moistureVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  weightPriceRow: { flexDirection: 'row', gap: space.sm, margin: space.md, marginBottom: 0 },
  weightCard: { flex: 1, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  priceCard: { flex: 1, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primaryContainer },
  priceCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaLabel: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  weightVal: { fontFamily: fontFamily.extraBold, fontSize: 24, color: colors.onSurface },
  weightSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  priceVal: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.primary },
  priceUnit: { fontFamily: fontFamily.medium, fontSize: 13 },
  priceCorridor: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  settlementCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: space.md, marginTop: space.sm, padding: space.xs, paddingHorizontal: space.sm, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant },
  settlementLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  settlementLabel: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary, letterSpacing: 0.3 },
  settlementRight: { alignItems: 'flex-end' },
  settlementBadge: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primaryContainer },
  settlementBadgeSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  settlementAmtCard: { marginHorizontal: space.md, marginBottom: space.sm, padding: space.sm, borderRadius: radius.md, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)' },
  settlementAmt: { fontFamily: fontFamily.extraBold, fontSize: 20, color: colors.tertiary },
  settlementAmtSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onPositiveContainer },
  buyersCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primaryContainer, overflow: 'hidden' },
  buyersCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  buyersCardTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, flex: 1 },
  topBidBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.primaryContainer },
  topBidText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onPrimary },
  buyersCardSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, paddingHorizontal: space.sm, paddingBottom: space.xs },
  buyerRow: { flexDirection: 'row', alignItems: 'flex-start', padding: space.sm },
  buyerInfo: { flex: 1 },
  buyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  buyerName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  buyerMeta: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  truckBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh, alignSelf: 'flex-start', marginTop: 2 },
  truckBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurface },
  buyerBidRight: { alignItems: 'flex-end' },
  buyerBid: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.primary },
  buyerDemand: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  buyerDivider: { height: 1, backgroundColor: colors.outlineVariant },
  viewAllBidsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  viewAllBidsText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer, flex: 1 },
  assayCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  assayHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  assayTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, flex: 1 },
  assayCertBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  assayCertText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  assayCertRef: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: space.sm },
  assayParam: { marginBottom: space.sm },
  assayParamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  assayParamLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface, flex: 1 },
  assayParamScore: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  assayBarBg: { height: 5, backgroundColor: colors.outlineVariant, borderRadius: radius.full, overflow: 'hidden' },
  assayBarFill: { height: 5, backgroundColor: colors.primary, borderRadius: radius.full },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.xs, paddingVertical: space.xs },
  pdfBtnText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.primary, flex: 1 },
  benchmarkCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  benchmarkHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.sm },
  benchmarkTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, flex: 1 },
  benchmarkChange: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  benchmarkRow: { flexDirection: 'row', gap: space.md, marginBottom: space.sm },
  benchmarkKey: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  benchmarkValBig: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.primary },
  benchmarkSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  advisoryBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, padding: space.xs, borderRadius: radius.md, backgroundColor: colors.onPrimaryContainer },
  advisoryText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurface, flex: 1, lineHeight: 17 },
  escrowCard: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginHorizontal: space.md, marginBottom: space.sm, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)' },
  escrowIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(4,120,87,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  escrowTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  escrowDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, lineHeight: 17, flex: 1 },
  escrowFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  escrowFooterText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.tertiary },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  editPriceBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, height: touch.targetMin, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.primaryContainer },
  editPriceText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer },
  viewOffersBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  viewOffersBtnText: { fontFamily: fontFamily.extraBold, fontSize: 13, color: colors.onPrimary },
});
