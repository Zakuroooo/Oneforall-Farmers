/**
 * The role branch. One place, no route guards. Pranay + Shreya.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../lib/auth';
import { AuthStack } from './AuthStack';
import { BuyerTabs } from './BuyerTabs';
import { FarmerTabs } from './FarmerTabs';

function Splash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color="#1B5E20" />
    </View>
  );
}

export function RootNavigator() {
  const { status, user, signOut } = useAuth();

  if (status === 'loading') return <Splash />;

  if (!user) return <AuthStack />;

  const isFarmer = user.role === 'FARMER';

  return (
    <View style={styles.container}>
      {/* Active Role Header with Sign Out (Requires OTP on re-login) */}
      <View style={[styles.topBar, isFarmer ? styles.farmerTopBar : styles.buyerTopBar]}>
        <Text style={styles.roleBadge}>
          {isFarmer ? '🌾 शेतकरी ॲप (Farmer App)' : '💼 व्यापारी कंसोल (Buyer Console)'}
          <Text style={styles.userName}> ({user.name})</Text>
        </Text>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutBtnText}>🚪 बाहेर पडा (Sign Out)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navContainer}>
        {isFarmer ? <FarmerTabs /> : <BuyerTabs />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, width: '100%', height: '100%' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  farmerTopBar: { backgroundColor: '#E8F5E9' },
  buyerTopBar: { backgroundColor: '#E3F2FD' },
  roleBadge: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  userName: { fontSize: 12, fontWeight: '500', color: '#475569' },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  logoutBtnText: { fontSize: 12, fontWeight: '700', color: '#B91C1C' },
  navContainer: { flex: 1 },
});
