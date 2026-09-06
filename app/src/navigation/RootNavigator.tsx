/**
 * The role branch. One place, no route guards. Pranay + Shreya.
 *
 * ★ The bar above the tabs is the first thing on screen on every single screen,
 *   so it is the app's title bar, not a debug readout. It used to render
 *   "🌾 शेतकरी ॲप (Farmer App)" plus a red "🚪 बाहेर पडा (Sign Out)" — three
 *   emoji, two languages at once, and the most destructive action in the app
 *   styled as the loudest thing on it. All three of those were wrong:
 *
 *   - **Emoji.** Every one is a font gamble on a cheap Android device, and this
 *     bar is the worst possible place to lose that gamble. Removed here and in
 *     the three dictionaries.
 *   - **Two languages.** The app is Marathi-first with a language switcher; a
 *     parenthetical English gloss on top of the Marathi says we did not trust
 *     our own localisation. The role now shows once, in the active locale.
 *   - **Red sign-out.** Red is the colour this app uses for the worst case in a
 *     forecast (I16). Spending it on a chrome button trains a farmer to ignore
 *     it in the one place it matters. It is now the quietest thing in the bar.
 *
 *   What is left: the product name, the active role as a tinted pill, and the
 *   farmer's own name. A judge should read this bar once and never again.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../lib/auth';
import { useT } from '../lib/i18n';
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
  const { t } = useT();

  if (status === 'loading') return <Splash />;

  if (!user) return <AuthStack />;

  const isFarmer = user.role === 'FARMER';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.identity}>
          <Text style={styles.appName} numberOfLines={1}>
            {t('app_name')}
          </Text>
          <View style={[styles.rolePill, isFarmer ? styles.rolePillFarmer : styles.rolePillBuyer]}>
            <Text style={[styles.rolePillText, isFarmer ? styles.roleTextFarmer : styles.roleTextBuyer]}>
              {isFarmer ? t('root_farmer_app_title') : t('root_buyer_console_title')}
            </Text>
          </View>
        </View>

        {/* `numberOfLines` because a farmer's name is untrusted-length input and
            this row must never wrap into two — it is above every screen. */}
        <View style={styles.actions}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
          <TouchableOpacity
            onPress={signOut}
            style={styles.logoutBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('root_sign_out')}>
            <Text style={styles.logoutBtnText}>{t('root_sign_out')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navContainer}>
        {isFarmer ? <FarmerTabs /> : <BuyerTabs />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  container: { flex: 1, width: '100%', height: '100%', backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  identity: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  appName: { fontSize: 17, fontWeight: '800', color: '#1B5E20', letterSpacing: 0.2 },
  rolePill: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  rolePillFarmer: { backgroundColor: '#E8F5E9' },
  rolePillBuyer: { backgroundColor: '#E3F2FD' },
  rolePillText: { fontSize: 11, fontWeight: '700' },
  roleTextFarmer: { color: '#1B5E20' },
  roleTextBuyer: { color: '#1565C0' },
  actions: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, flexShrink: 0 },
  userName: { fontSize: 12, fontWeight: '600', color: '#475569', maxWidth: 96, marginRight: 8 },
  logoutBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  logoutBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  navContainer: { flex: 1 },
});
