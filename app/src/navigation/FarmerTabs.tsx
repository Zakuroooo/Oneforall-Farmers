/**
 * The farmer app. Four tabs. Pranay.
 *
 * ★ Four, not seven. This is a phone held by someone who may not read fluently, in
 *   a mandi, in sunlight, possibly one-handed. Every tab past the fourth is a tab
 *   nobody presses, and the tab bar shrinks each label to fit.
 *
 * ★ Labels are Marathi and hardcoded here for P0. TODO(shreya): swap to `t()` once
 *   SH1 lands — the tab bar is one of the few places a language switch must take
 *   effect without a remount, so it is worth checking on the day.
 *
 * Icons come later. TODO(shreya): the tab bar reads as text-only until then, which
 * is legible but plain; icons matter more here than on any other surface because
 * they are the one part of the app that works without reading at all.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import S26_Chat from '../screens/farmer/S26_Chat';
import S28_Assistant from '../screens/farmer/S28_Assistant';
import PricesIndex from '../screens/farmer/PricesIndex';

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
 */
export type HomeStackParamList = {
  S4_Home: undefined;
  S9_Verdict: undefined;
  S10_CostBreakdown: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
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
    <PricesStack.Navigator screenOptions={{ headerShown: false }}>
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
  S26_Chat: undefined;
};

const MyLotsStack = createNativeStackNavigator<MyLotsStackParamList>();

function MyLotsStackNavigator() {
  return (
    <MyLotsStack.Navigator initialRouteName="S15_MyLots" screenOptions={{ headerShown: false }}>
      <MyLotsStack.Screen name="S15_MyLots" component={S15_MyLots} />
      <MyLotsStack.Screen name="S12_CreateLot" component={S12_CreateLot} />
      <MyLotsStack.Screen name="S13_SelfAssay" component={S13_SelfAssay} />
      <MyLotsStack.Screen name="S14_CounterOffer" component={S14_CounterOffer} />
      <MyLotsStack.Screen name="S16_PoolSplit" component={S16_PoolSplit} />
      <MyLotsStack.Screen name="S26_Chat" component={S26_Chat} />
    </MyLotsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<FarmerTabParamList>();

export function FarmerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#666',
        // Bigger than the RN default. A 44 px target is the iOS minimum for a
        // thumb; this is a farmer's thumb on a cheap screen, so we take the space.
        tabBarLabelStyle: { fontSize: 13 },
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
      }}>
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'मुख्यपृष्ठ' }} />
      <Tab.Screen name="Prices" component={PricesStackNavigator} options={{ title: 'भाव' }} />
      <Tab.Screen name="MyLots" component={MyLotsStackNavigator} options={{ title: 'माझे लॉट' }} />
      <Tab.Screen name="Assistant" component={S28_Assistant} options={{ title: 'मदत' }} />
    </Tab.Navigator>
  );
}
