/**
 * Runtime configuration. Committed to git. **No secrets in this file, ever (I10).**
 *
 * The app holds no keys. Auth is a JWT the server issues at runtime and we store
 * on the device. There is nothing in here that would matter if the repo were public
 * tomorrow, and it must stay that way — the moment someone adds a key here it is in
 * the history forever and rotating it becomes somebody's Sunday.
 *
 * There is no `EXPO_PUBLIC_*` and no `.env` in the app. That was an Expo mechanism
 * and we are on React Native CLI. This file is the mechanism.
 */

import { Platform } from 'react-native';

/**
 * ★ CHANGE THIS to your laptop's address on the wifi before testing on a real phone.
 *
 *     ipconfig getifaddr en0
 *
 * The emulator does not need it. A physical device does, and the failure when it is
 * wrong is a silent timeout that looks exactly like the API being down.
 *
 * If you change this, also add it to `android/app/src/main/res/xml/network_security_config.xml`
 * or Android will refuse the cleartext connection and you will debug the wrong layer.
 */
const LAN_IP = '192.168.1.7';

const PROD_HOST = 'http://<ec2-host>'; // TODO(kartik): real host at K9, the H28 deploy rehearsal

/**
 * Which host the app talks to.
 *
 *   Android emulator   ->  10.0.2.2      ★ the emulator's alias for the host machine.
 *                                          `localhost` inside the emulator IS the
 *                                          emulator. This is the single most common
 *                                          first-day React Native mistake.
 *   iOS simulator      ->  localhost     (shares the host's network stack)
 *   Real Android phone ->  LAN_IP        (same wifi as the laptop)
 *   Deployed           ->  PROD_HOST
 */
export const API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? `http://10.0.2.2:8000/api/v1`
    : `http://localhost:8000/api/v1`
  : `${PROD_HOST}/api/v1`;

/** Swap to this in `api.ts` when running on a physical device over wifi. */
export const DEVICE_API_BASE_URL = `http://${LAN_IP}:8000/api/v1`;

/**
 * Fallback rung 3 of the demo-day ladder: flip to `true`, rebuild, and every screen
 * renders from `src/fixtures/` with no API at all.
 *
 * Rung 1 is the deployed API. Rung 2 is the API on the laptop over a phone hotspot.
 * Rung 3 is this. It exists because venue wifi fails, and it always fails.
 */
export const USE_FIXTURES = false;

/** How long a cached response stays fresh before the stale banner appears. */
export const CACHE_STALE_MS = 5 * 60 * 1000;

/** Chat polling interval. TanStack Query, not websockets — see 12_STACK.md. */
export const CHAT_POLL_MS = 4000;

export const DEFAULT_HORIZON_DAYS = 14;
