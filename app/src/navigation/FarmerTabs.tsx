/**
 * The farmer app. Four tabs. Pranay.
 *
 * ★ Four, not seven. This is a phone held by someone who may not read fluently, in
 *   a mandi, in sunlight, possibly one-handed. Every tab past the fourth is a tab
 *   nobody presses, and the tab bar shrinks each label to fit.
 *
 * ★ Labels go through `useT()` so a language switch relabels the tab bar without
 *   a remount — no separate SH1 handoff needed.
 *
 * ★ Icons are wired (`./TabIcon`). They are not decoration: with `tabBarIcon`
 *   omitted, React Navigation substitutes its own `MissingIcon`, which renders
 *   U+23F7 — a codepoint the stock Android font has no glyph for, so every tab
 *   showed a tofu box ▯. See the header of `TabIcon.tsx`.
 *
 * ★ `SCREEN_BG` is set here, on the navigator, rather than on sixteen screen
 *   roots. Every colour in `app/src/` is a light-theme colour, and a `root`
 *   style is usually a ScrollView's `contentContainerStyle` — a background
 *   there paints the content, not the empty region below short content. The
 *   navigator's scene container paints the whole scene, once, in one place.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useT } from '../lib/i18n';
import { tabIcon } from './TabIcon';

/** The one background colour for every farmer scene. */
const SCREEN_BG = '#FAF6EE';

/** Applied to all three nested stacks, for the same reason as `sceneStyle` below. */
const STACK_SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: SCREEN_BG },
} as const;

import S04_Home from '../screens/farmer/S04_Home';
import S05_History from '../screens/farmer/S05_History';
import S06_Nearby from '../screens/farmer/S06_Nearby';
import S07_Forecast from '../screens/farmer/S07_Forecast';
import S08_ModelCard from '../screens/farmer/S08_ModelCard';
import S09_Verdict from '../screens/farmer/S09_Verdict';
import S10_CostBreakdown from '../screens/farmer/S10_CostBreakdown';
import S12_CreateLot from '../screens/farmer/S12_CreateLot';
import S13_SelfAssay from '../screens/farmer/S13_SelfAssay';
import S14_CounterOffer from '../screens/farmer/S14_CounterOffer';
import S15_MyLots from '../screens/farmer/S15_MyLots';
import S16_PoolSplit from '../screens/farmer/S16_PoolSplit';
import S28_Assistant from '../screens/farmer/S28_Assistant';
import PricesIndex from '../screens/farmer/PricesIndex';
// ★ The post-listing selling journey (list → grade → publish → buyers →
//   bargain → deal done → settled) was built as 11 Stitch-matched screens
//   with zero navigation between them or to anything else — every one was
//   unreachable from a running app, which is why "S12 is built" and "I
//   cannot see anything except Home" were both true at once. Registered
//   here and wired below; S15_MyLots/S13_SelfAssay/S14_CounterOffer/
//   S16_PoolSplit stay as the primary, backend-wired path (real getLots(),
//   real self-assay scoring, real offer negotiation) — none of that was
//   replaced, since none of these new screens call a real endpoint yet.
import S22_PricePublish from '../screens/farmer/S22_PricePublish';
import S23_PublishedRadar from '../screens/farmer/S23_PublishedRadar';
import S24_LotDetail from '../screens/farmer/S24_LotDetail';
import S25_BuyersForLot from '../screens/farmer/S25_BuyersForLot';
import S26_BuyerProfile from '../screens/farmer/S26_BuyerProfile';
import S27_Bargaining from '../screens/farmer/S27_Bargaining';
import S28_CounterOffer from '../screens/farmer/S28_CounterOffer';
import S29_ConfirmAcceptance from '../screens/farmer/S29_ConfirmAcceptance';
import S30_DealDone from '../screens/farmer/S30_DealDone';
import S31_DealsList from '../screens/farmer/S31_DealsList';
import S32_DealTracking from '../screens/farmer/S32_DealTracking';
import S33_Settled from '../screens/farmer/S33_Settled';
import S35_FarmerProfile from '../screens/farmer/S35_FarmerProfile';

export type FarmerTabParamList = {
  Home: undefined;
  Prices: undefined;
  MyLots: undefined;
  Assistant: undefined;
};

/**
 * The Home tab is itself a stack, not a single screen — S4's CTA ("मी विकावे का?")
 * pushes to S9, and a tab switch is the wrong transition for that (it would drop
 * S4 off the back stack entirely; a farmer tapping back from the verdict should
 * return to the price he just saw, not to whichever tab he was on before Home).
 *
 * `S9_Verdict` is the real screen as of P3.
 *
 * S10 sits on this stack rather than getting a tab of its own — it is only ever
 * reached from the verdict's cost row (PRANAY.md §1.7's mockup annotates that row
 * `→ S10`), and back from it must land on the verdict, never on a tab. It takes
 * no params: it reads S9's own query key straight out of the cache, so it holds
 * up on a cold start and in airplane mode. See the header of the screen file.
 *
 * ★ S14 (counter-offer) and S15 (my lots) are NOT registered on this stack —
 *   they live on `MyLotsStackNavigator` below. A screen name only this type
 *   claimed but the navigator never rendered is exactly the "GO_BACK/action
 *   not handled" class of crash: `navigation.navigate('S15_MyLots')` from
 *   here would look up a route this stack has never heard of. S4 reaches
 *   them through `navigation.getParent()` into the `MyLots` tab instead.
 */
export type HomeStackParamList = {
  S4_Home: undefined;
  S9_Verdict: undefined;
  S10_CostBreakdown: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
      <HomeStack.Screen name="S4_Home" component={S04_Home} />
      <HomeStack.Screen name="S9_Verdict" component={S09_Verdict} />
      <HomeStack.Screen name="S10_CostBreakdown" component={S10_CostBreakdown} />
    </HomeStack.Navigator>
  );
}

/**
 * The Prices tab is also a stack — S5/S6/S7 are three separate P0 screens
 * (one decision per screen), reached from a small landing screen rather than
 * crowded onto one. Same shape as `HomeStackNavigator`.
 *
 * S8 (the model card) lives here rather than on its own tab, and behind S7 rather
 * than beside it: it answers "should I believe that fan?", which is a question
 * nobody has until they have seen the fan. It is also reachable from the Prices
 * landing screen directly, because the other reader of S8 is a judge who wants it
 * without being walked through a forecast first.
 */
export type PricesStackParamList = {
  PricesIndex: undefined;
  S5_History: undefined;
  S6_Nearby: undefined;
  S7_Forecast: undefined;
  S8_ModelCard: undefined;
};

const PricesStack = createNativeStackNavigator<PricesStackParamList>();

function PricesStackNavigator() {
  return (
    <PricesStack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
      <PricesStack.Screen name="PricesIndex" component={PricesIndex} />
      <PricesStack.Screen name="S5_History" component={S05_History} />
      <PricesStack.Screen name="S6_Nearby" component={S06_Nearby} />
      <PricesStack.Screen name="S7_Forecast" component={S07_Forecast} />
      <PricesStack.Screen name="S8_ModelCard" component={S08_ModelCard} />
    </PricesStack.Navigator>
  );
}

/**
 * The MyLots tab is a stack, same shape as HomeStack/PricesStack. S15 (P12)
 * is the initial route — the list a farmer with existing lots actually lands
 * on — with S12 (P9b) reached from its header button to create a new one,
 * and S13 (P9a) reached from tapping a row to score one.
 */
export type MyLotsStackParamList = {
  S15_MyLots: undefined;
  S12_CreateLot: undefined;
  /**
   * `lot_id` is optional so S13 stays reachable directly (e.g. from a deep
   * link) without a lot already created in this session — it falls back to
   * `DEFAULT_LOT_ID` from config. Both S12 (just created) and S15 (tapped
   * from the list) navigate here with the real id of the lot in question.
   */
  S13_SelfAssay: { lot_id?: string } | undefined;
  /** `offer_id` optional for the same reason as S13's `lot_id` — falls back
   * to the fixture incoming offer. S15's offers-awaiting-response section
   * navigates here with the real id. */
  S14_CounterOffer: { offer_id?: string } | undefined;
  /** `pool_id` optional, same shape again — falls back to the fixture pool. */
  S16_PoolSplit: { pool_id?: string } | undefined;
  /** P15, cuttable — reached from a transaction row in S15. No params: it
   * reads the one demo transaction thread every chat fixture already
   * agrees on, same fixture-first pattern as S10 reading S9's cache key. */

  /** ★ The Stitch-matched selling journey, reachable but still visual-only:
   *  none of these call a real endpoint (no assay submission, no real buyer
   *  list, no real offer/escrow transitions) — they're wired for tap-through
   *  review, not yet backed by the API. See the import comment above. */
  S22_PricePublish: undefined;
  S23_PublishedRadar: undefined;
  S24_LotDetail: undefined;
  S25_BuyersForLot: undefined;
  S26_BuyerProfile: undefined;
  S27_Bargaining: undefined;
  S28_CounterOffer: undefined;
  S29_ConfirmAcceptance: undefined;
  S30_DealDone: undefined;
  S31_DealsList: undefined;
  S32_DealTracking: undefined;
  S33_Settled: undefined;
  S35_FarmerProfile: undefined;
};

const MyLotsStack = createNativeStackNavigator<MyLotsStackParamList>();

function MyLotsStackNavigator() {
  return (
    <MyLotsStack.Navigator initialRouteName="S15_MyLots" screenOptions={STACK_SCREEN_OPTIONS}>
      <MyLotsStack.Screen name="S15_MyLots" component={S15_MyLots} />
      <MyLotsStack.Screen name="S12_CreateLot" component={S12_CreateLot} />
      <MyLotsStack.Screen name="S13_SelfAssay" component={S13_SelfAssay} />
      <MyLotsStack.Screen name="S14_CounterOffer" component={S14_CounterOffer} />
      <MyLotsStack.Screen name="S16_PoolSplit" component={S16_PoolSplit} />
      <MyLotsStack.Screen name="S22_PricePublish" component={S22_PricePublish} />
      <MyLotsStack.Screen name="S23_PublishedRadar" component={S23_PublishedRadar} />
      <MyLotsStack.Screen name="S24_LotDetail" component={S24_LotDetail} />
      <MyLotsStack.Screen name="S25_BuyersForLot" component={S25_BuyersForLot} />
      <MyLotsStack.Screen name="S26_BuyerProfile" component={S26_BuyerProfile} />
      <MyLotsStack.Screen name="S27_Bargaining" component={S27_Bargaining} />
      <MyLotsStack.Screen
        name="S28_CounterOffer"
        component={S28_CounterOffer}
        options={{ presentation: 'modal' }}
      />
      <MyLotsStack.Screen name="S29_ConfirmAcceptance" component={S29_ConfirmAcceptance} />
      <MyLotsStack.Screen name="S30_DealDone" component={S30_DealDone} />
      <MyLotsStack.Screen name="S31_DealsList" component={S31_DealsList} />
      <MyLotsStack.Screen name="S32_DealTracking" component={S32_DealTracking} />
      <MyLotsStack.Screen name="S33_Settled" component={S33_Settled} />
      <MyLotsStack.Screen name="S35_FarmerProfile" component={S35_FarmerProfile} />
    </MyLotsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<FarmerTabParamList>();

export function FarmerTabs() {
  const { t } = useT();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        // `sceneStyle`, not the v6 `sceneContainerStyle` prop — bottom-tabs v7
        // moved it into `screenOptions` and dropped the old name entirely.
        sceneStyle: { backgroundColor: SCREEN_BG },
        tabBarActiveTintColor: '#C2410C',
        tabBarInactiveTintColor: '#8D7168',
        tabBarLabelStyle: { fontSize: 12, fontFamily: 'PlusJakartaSans-SemiBold' },
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EADEC7',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: t('tab_home'), tabBarIcon: tabIcon('home') }}
      />
      <Tab.Screen
        name="Prices"
        component={PricesStackNavigator}
        options={{ title: t('tab_prices'), tabBarIcon: tabIcon('prices') }}
      />
      <Tab.Screen
        name="MyLots"
        component={MyLotsStackNavigator}
        options={{ title: t('tab_my_lots'), tabBarIcon: tabIcon('lots') }}
      />
      <Tab.Screen
        name="Assistant"
        component={S28_Assistant}
        options={{ title: t('tab_assistant'), tabBarIcon: tabIcon('assistant') }}
      />
    </Tab.Navigator>
  );
}
