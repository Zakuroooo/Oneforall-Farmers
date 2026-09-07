/**
 * S12 — create a lot. The only screen in P9 with native risk: a camera
 * permission and an image picker. Everything else in this file is exactly
 * the same shape as every other farmer screen.
 *
 * ★ CANON §7.5 + FRONTEND_NEEDS_BACKEND.md §5: **`photo_path` is optional on
 *   create, and the whole create flow has to succeed before any upload.** A
 *   lot with no photo at all is not a degraded lot — it is a normal one. The
 *   picker only ever adds to a lot that already exists without it.
 *
 * ★ Permission-denied is a real, rendered state, not a crash and not a
 *   silent no-op. Android's permission dialog can be dismissed by a farmer
 *   who did not mean to, or denied outright — either way the create flow
 *   must still work, because the photo was never required to reach it.
 */

import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { launchCamera } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Permission } from 'react-native';

import { createLot } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { formatNumber, toQuintal } from '../../lib/money';
import {
  DEFAULT_COMMODITY_ID,
  DEFAULT_MARKET_ID,
  USE_FIXTURES,
} from '../../config';
import { fxLotUngraded } from '../../fixtures/lots';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/farmer/States';
import type { MyLotsStackParamList } from '../../navigation/FarmerTabs';
import type { Locale, LotDto } from '../../types/api';

type Props = NativeStackScreenProps<MyLotsStackParamList, 'S12_CreateLot'>;

type PhotoPermissionState = 'unknown' | 'granted' | 'denied';

/**
 * `PermissionsAndroid.PERMISSIONS` is typed `{[key: string]: Permission}` —
 * an index signature, so `noUncheckedIndexedAccess` makes `.CAMERA` come back
 * `Permission | undefined` even though it is always defined at runtime. The
 * literal is exactly the same string `Permission` already names, so this
 * sidesteps the index lookup instead of asserting the result with `!`.
 */
const CAMERA_PERMISSION: Permission = 'android.permission.CAMERA';

const QTY_STEP_KG = 100;
const DEFAULT_QTY_KG = 1000;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function submitLot(body: {
  commodity_id: string;
  market_id: string;
  qty_kg: number;
  harvest_date: string;
  photo_path: string | null;
}): Promise<LotDto> {
  if (USE_FIXTURES) {
    // No backend in this repo (Akash's A1 has not landed) — build the DTO the
    // same shape a real create response would return, from the ungraded
    // fixture, rather than calling an endpoint that does not exist.
    return {
      ...fxLotUngraded,
      id: `lot_${Date.now()}`,
      qty_kg: body.qty_kg,
      harvest_date: body.harvest_date,
      photo_path: body.photo_path,
      created_at: new Date().toISOString(),
    };
  }
  // `createLot`'s body has `photo_path` as a genuinely optional key (a field
  // the server should never see at all when there is no photo yet), not a
  // nullable one — so it is included only when present, never sent as null.
  return createLot(
    body.photo_path === null
      ? { commodity_id: body.commodity_id, market_id: body.market_id, qty_kg: body.qty_kg, harvest_date: body.harvest_date }
      : { ...body, photo_path: body.photo_path },
  );
}

export default function S12_CreateLot({ navigation }: Props) {
  const [locale, setLocale] = useState<Locale>('mr');
  useFocusEffect(
    React.useCallback(() => {
      getLocale().then(l => l && setLocale(l));
    }, []),
  );

  const [qtyKg, setQtyKg] = useState(DEFAULT_QTY_KG);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoPermission, setPhotoPermission] = useState<PhotoPermissionState>('unknown');

  const {
    mutate: create,
    isPending: creating,
    isError: createFailed,
    isSuccess: created,
    data: createdLot,
    reset: resetCreate,
  } = useMutation({
    mutationFn: () =>
      submitLot({
        commodity_id: DEFAULT_COMMODITY_ID,
        market_id: DEFAULT_MARKET_ID,
        qty_kg: qtyKg,
        harvest_date: todayIso(),
        photo_path: photoUri,
      }),
  });

  const adjustQty = (delta: number) => {
    setQtyKg(prev => Math.max(QTY_STEP_KG, prev + delta));
  };

  const addPhoto = async () => {
    if (Platform.OS === 'android') {
      const already = await PermissionsAndroid.check(
        CAMERA_PERMISSION,
      );
      if (!already) {
        const grantResult = await PermissionsAndroid.request(
          CAMERA_PERMISSION,
        );
        if (grantResult !== PermissionsAndroid.RESULTS.GRANTED) {
          setPhotoPermission('denied');
          return;
        }
      }
    }
    setPhotoPermission('granted');

    launchCamera({ mediaType: 'photo', saveToPhotos: false }, response => {
      if (response.didCancel || response.errorCode) return;
      const uri = response.assets?.[0]?.uri;
      if (uri) setPhotoUri(uri);
    });
  };

  if (createFailed) {
    return (
      <ErrorState message={translate('lot_create_error', locale)} onRetry={() => resetCreate()} />
    );
  }

  if (creating) {
    return (
      <View style={styles.root}>
        <Text style={styles.header}>{translate('lot_creating', locale)}</Text>
      </View>
    );
  }

  if (created && createdLot) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Card variant="elevated" style={styles.successCard}>
          <Text style={styles.successTitle}>{translate('lot_created_title', locale)}</Text>
          {/* I2 — the lot now exists, so this is a display of stored data and
              reads in quintals like S15's list does. The stepper above is
              deliberately still in kg: a farmer is adjusting it in 100 kg
              steps and its own label says किलो, so the number and the unit on
              screen agree. This line has no such reason. */}
          <Text style={styles.successLine}>
            {translate('qty_label_value', locale, {
              qty: formatNumber(toQuintal(createdLot.qty_kg), locale),
            })}
          </Text>
          <Text style={styles.successLine}>
            {translate(createdLot.photo_path ? 'photo_added_label' : 'photo_not_added_label', locale)}
          </Text>
          <Text style={styles.successLine}>{translate('grade_not_checked_label', locale)}</Text>
        </Card>
        <Button
          title={translate('check_grade_now_button', locale)}
          onPress={() => navigation.navigate('S20_QualityDiagnostic', { lot_id: createdLot.id })}
          style={styles.submitButton}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.header}>{translate('new_lot_title', locale)}</Text>
      <Text style={styles.subheader}>{translate('demo_commodity_market', locale)}</Text>

      <Card style={styles.questionCard}>
        <Text style={styles.questionLabel}>{translate('qty_kg_label', locale)}</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => adjustQty(-QTY_STEP_KG)}>
            <Text style={styles.stepperButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{formatNumber(qtyKg, locale)}</Text>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => adjustQty(QTY_STEP_KG)}>
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.questionCard}>
        <Text style={styles.questionLabel}>{translate('photo_optional_label', locale)}</Text>
        {photoUri ? (
          <Text style={styles.photoStatusOk}>{translate('photo_added_check', locale)}</Text>
        ) : (
          <Button
            title={translate('take_photo_button', locale)}
            variant="outline"
            onPress={addPhoto}
          />
        )}
        {photoPermission === 'denied' ? (
          <Text style={styles.photoDenied}>{translate('camera_permission_denied', locale)}</Text>
        ) : null}
      </Card>

      <Button
        title={translate('create_lot_button', locale)}
        onPress={() => create()}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 20 },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  questionCard: { padding: 16 },
  questionLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: { fontSize: 24, fontWeight: '700', color: '#1B5E20' },
  stepperValue: { fontSize: 22, fontWeight: '700', color: '#1E293B', minWidth: 80, textAlign: 'center' },
  photoStatusOk: { fontSize: 15, color: '#1B5E20', fontWeight: '600' },
  photoDenied: { fontSize: 13, color: '#C53030', marginTop: 10, lineHeight: 18 },
  submitButton: { marginTop: 8, marginBottom: 24 },
  successCard: { alignItems: 'center', padding: 24, gap: 6 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#1B5E20' },
  successLine: { fontSize: 15, color: '#334155', marginTop: 4 },
});
