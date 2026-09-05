/**
 * The signed-out stack: language → phone/OTP → profile.
 *
 * Pranay. `07_FRONTEND_ARCHITECTURE.md` §1.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import S01_Language from '../screens/farmer/S01_Language';
import S02_Phone from '../screens/farmer/S02_Phone';
import S03_Profile from '../screens/farmer/S03_Profile';

/**
 * ★ Every route is `undefined` — no params — and that is deliberate, not laziness.
 *
 *   The natural design passes the phone and the OTP code from S2 to S3 as route
 *   params, because S3 needs both to call `register`. Route params live in React
 *   Navigation's state tree, which is serialized, shown in the dev-menu state
 *   inspector, and survives into anything that persists navigation state. That puts
 *   a phone number and a live OTP somewhere I14 says they must never be.
 *
 *   TODO(pranay): P1 carries them in a small in-memory holder next to `AuthProvider`
 *     — set on S2, read once by S3, cleared on success. Never in navigation state,
 *     never in AsyncStorage.
 */
export type AuthStackParamList = {
  S1_Language: undefined;
  S2_Phone: undefined;
  S3_Profile: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="S1_Language"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="S1_Language" component={S01_Language} />
      <Stack.Screen name="S2_Phone" component={S02_Phone} />
      <Stack.Screen name="S3_Profile" component={S03_Profile} />
    </Stack.Navigator>
  );
}
