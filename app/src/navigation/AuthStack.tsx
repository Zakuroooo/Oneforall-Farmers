/**
 * The signed-out stack: Splash → Language → Phone → OTP → Profile → Welcome.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../lib/auth';
import S00_Splash from '../screens/farmer/S00_Splash';
import S01_Language from '../screens/farmer/S01_Language';
import S02_Phone from '../screens/farmer/S02_Phone';
import S03_OTP from '../screens/farmer/S03_OTP';
import S03_Profile from '../screens/farmer/S03_Profile';
import S03_Welcome from '../screens/farmer/S03_Welcome';
import { S17_BuyerLogin } from '../screens/buyer/S17_BuyerLogin';

export type AuthStackParamList = {
  S0_Splash: undefined;
  S1_Language: undefined;
  S2_Phone: undefined;
  S3_OTP: undefined;
  S3_Profile: undefined;
  S3_Welcome: undefined;
  S17_BuyerLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  const { hasLocale } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={hasLocale ? 'S2_Phone' : 'S0_Splash'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="S0_Splash" component={S00_Splash} />
      <Stack.Screen name="S1_Language" component={S01_Language} />
      <Stack.Screen name="S2_Phone" component={S02_Phone} />
      <Stack.Screen name="S3_OTP" component={S03_OTP} />
      <Stack.Screen name="S3_Profile" component={S03_Profile} />
      <Stack.Screen name="S3_Welcome" component={S03_Welcome} />
      <Stack.Screen name="S17_BuyerLogin" component={S17_BuyerLogin} />
    </Stack.Navigator>
  );
}
