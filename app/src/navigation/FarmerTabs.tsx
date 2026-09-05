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

import S04_Home from '../screens/farmer/S04_Home';
import { Soon } from '../screens/Soon';

export type FarmerTabParamList = {
  Home: undefined;
  Prices: undefined;
  MyLots: undefined;
  Assistant: undefined;
};

const Tab = createBottomTabNavigator<FarmerTabParamList>();

// TODO(pranay): P3 → S5/S6 prices · P6 → S15 my lots · P16 → S28 assistant.
const PricesSoon = () => <Soon label="S5 · भाव" />;
const MyLotsSoon = () => <Soon label="S15 · माझे लॉट" />;
const AssistantSoon = () => <Soon label="S28 · मदत" />;

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
      <Tab.Screen name="Home" component={S04_Home} options={{ title: 'मुख्यपृष्ठ' }} />
      <Tab.Screen name="Prices" component={PricesSoon} options={{ title: 'भाव' }} />
      <Tab.Screen name="MyLots" component={MyLotsSoon} options={{ title: 'माझे लॉट' }} />
      <Tab.Screen
        name="Assistant"
        component={AssistantSoon}
        options={{ title: 'मदत' }}
      />
    </Tab.Navigator>
  );
}
