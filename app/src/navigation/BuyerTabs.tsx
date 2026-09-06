/**
 * The buyer console — S17–S25 + S27.
 * Shreya. 07_FRONTEND_ARCHITECTURE.md §1.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { S18_PostDemand } from '../screens/buyer/S18_PostDemand';
import { S19_Matches } from '../screens/buyer/S19_Matches';
import { S20_LotDetail } from '../screens/buyer/S20_LotDetail';
import { S21_OfferThread } from '../screens/buyer/S21_OfferThread';
import { S22_EscrowTimeline } from '../screens/buyer/S22_EscrowTimeline';
import { S23_BuyerReliability } from '../screens/buyer/S23_BuyerReliability';
import { S24_DataProvenance } from '../screens/buyer/S24_DataProvenance';
import { S25_Dispute } from '../screens/buyer/S25_Dispute';
import { S27_BuyerChat } from '../screens/buyer/S27_BuyerChat';

export type BuyerTabParamList = {
  PostDemand: undefined;
  Matches: undefined;
  Offers: undefined;
  Deals: undefined;
  Ledger: undefined;
  Provenance: undefined;
  Dispute: undefined;
  Chat: undefined;
};

/**
 * S20_LotDetail existed in this repo, fully built, and nothing ever
 * navigated to it — a dead file. The Matches tab is now a stack, S19
 * initial, so "लॉट तपशील पहा" on a match card has somewhere to go.
 */
export type MatchesStackParamList = {
  S19_Matches: undefined;
  S20_LotDetail: undefined;
};

const MatchesStack = createNativeStackNavigator<MatchesStackParamList>();

function MatchesStackNavigator() {
  return (
    <MatchesStack.Navigator initialRouteName="S19_Matches" screenOptions={{ headerShown: false }}>
      <MatchesStack.Screen name="S19_Matches">
        {({ navigation }: NativeStackScreenProps<MatchesStackParamList, 'S19_Matches'>) => (
          <S19_Matches onViewLot={() => navigation.navigate('S20_LotDetail')} />
        )}
      </MatchesStack.Screen>
      <MatchesStack.Screen name="S20_LotDetail" component={S20_LotDetail} />
    </MatchesStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<BuyerTabParamList>();

export function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { height: 60, paddingBottom: 4, paddingTop: 4 },
      }}>
      <Tab.Screen
        name="PostDemand"
        component={S18_PostDemand}
        options={{ title: 'मागणी' }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesStackNavigator}
        options={{ title: 'जुळणी' }}
      />
      <Tab.Screen
        name="Offers"
        component={S21_OfferThread}
        options={{ title: 'ऑफर' }}
      />
      <Tab.Screen
        name="Deals"
        component={S22_EscrowTimeline}
        options={{ title: 'व्यवहार' }}
      />
      <Tab.Screen
        name="Ledger"
        component={S23_BuyerReliability}
        options={{ title: 'खातेवही' }}
      />
      <Tab.Screen
        name="Provenance"
        component={S24_DataProvenance}
        options={{ title: 'पारदर्शकता' }}
      />
      <Tab.Screen
        name="Dispute"
        component={S25_Dispute}
        options={{ title: 'तक्रार' }}
      />
      <Tab.Screen
        name="Chat"
        component={S27_BuyerChat}
        options={{ title: 'चॅट' }}
      />
    </Tab.Navigator>
  );
}
