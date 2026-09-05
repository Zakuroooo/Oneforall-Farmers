/**
 * The buyer console — the same APK on a second device, S17–S25 + S27.
 *
 * ★ This file is Shreya's (`07_FRONTEND_ARCHITECTURE.md` §1). It exists here in
 *   skeleton form only because `RootNavigator` imports it and cannot compile
 *   otherwise, and because a BUYER token has to land somewhere other than a crash.
 *
 *   TODO(shreya): replace this whole file at SH5. Keep the export name `BuyerTabs`
 *     and `RootNavigator` needs no change at all.
 *
 * Tab names below are a guess at your structure, not a decision — change them
 * freely, they are referenced nowhere else.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Soon } from '../screens/Soon';

export type BuyerTabParamList = {
  Demands: undefined;
  Matches: undefined;
  Deals: undefined;
};

const Tab = createBottomTabNavigator<BuyerTabParamList>();

const DemandsSoon = () => <Soon label="S17 · मागणी" />;
const MatchesSoon = () => <Soon label="S19 · जुळणी" />;
const DealsSoon = () => <Soon label="S22 · व्यवहार" />;

export function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1B5E20',
        tabBarLabelStyle: { fontSize: 13 },
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
      }}>
      <Tab.Screen name="Demands" component={DemandsSoon} options={{ title: 'मागणी' }} />
      <Tab.Screen name="Matches" component={MatchesSoon} options={{ title: 'जुळणी' }} />
      <Tab.Screen name="Deals" component={DealsSoon} options={{ title: 'व्यवहार' }} />
    </Tab.Navigator>
  );
}
