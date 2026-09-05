/**
 * The signed-out stack: language → phone/OTP → profile.
 *
 * Pranay. `07_FRONTEND_ARCHITECTURE.md` §1.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../lib/auth';
import S01_Language from '../screens/farmer/S01_Language';
import S02_Phone from '../screens/farmer/S02_Phone';
import S03_Profile from '../screens/farmer/S03_Profile';
import { S17_BuyerLogin } from '../screens/buyer/S17_BuyerLogin';

export type AuthStackParamList = {
  S1_Language: undefined;
  S2_Phone: undefined;
  S3_Profile: undefined;
  S17_BuyerLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  const { hasLocale } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={hasLocale ? 'S2_Phone' : 'S1_Language'}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="S1_Language" component={S01_Language} />
      <Stack.Screen name="S2_Phone" component={S02_Phone} />
      <Stack.Screen name="S3_Profile" component={S03_Profile} />
      <Stack.Screen name="S17_BuyerLogin" component={S17_BuyerLogin} />
    </Stack.Navigator>
  );
}
