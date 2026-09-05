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

/**
 * ★ How the app reaches the API in development. Three transports; we default to the
 *   first, and the choice is not cosmetic — one of them dies at the venue.
 *
 *   'adb-reverse'  localhost:8000, tunnelled over the **USB cable** by
 *                    adb reverse tcp:8000 tcp:8000
 *                  Works on a physical phone and on an emulator. Involves no wifi
 *                  at all, which is exactly why it is also the demo-day transport.
 *                  ★ Re-run the command every time you replug the phone. If you
 *                    forget, requests hang in a way indistinguishable from the
 *                    server being down.
 *
 *   'emulator'     10.0.2.2:8000 — the Android emulator's built-in alias for the
 *                  host machine. Zero setup, emulator only. Note `localhost`
 *                  inside an emulator IS the emulator; that confusion is the most
 *                  common first-day React Native mistake.
 *
 *   'lan'          LAN_IP:8000, phone and laptop on the same wifi. Last resort.
 *                  Venue wifi fails. It always fails.
 */
type DevTransport = 'adb-reverse' | 'emulator' | 'lan';

// Named, rather than an inline union on the annotation. TypeScript narrows a
// `const` to its literal initializer at every use site, so `typeof DEV_TRANSPORT`
// is `'adb-reverse'` — and `Record<typeof DEV_TRANSPORT, string>` below becomes a
// one-key record that rejects the other two transports.
const DEV_TRANSPORT: DevTransport = 'adb-reverse';

/**
 * Only read when DEV_TRANSPORT is 'lan'. Find it with:
 *
 *     ipconfig getifaddr en0
 *
 * If you change this you must also add it to
 * `android/app/src/main/res/xml/network_security_config.xml`, or Android refuses the
 * cleartext connection and you spend the next hour debugging the wrong layer.
 */
const LAN_IP = '192.168.1.7';

const PROD_HOST = 'http://<ec2-host>'; // TODO(kartik): real host at K9, the H28 deploy rehearsal

const DEV_HOST: Record<DevTransport, string> = {
  'adb-reverse': 'http://localhost:8000',
  emulator: 'http://10.0.2.2:8000',
  lan: `http://${LAN_IP}:8000`,
};

export const API_BASE_URL = __DEV__
  ? `${DEV_HOST[DEV_TRANSPORT]}/api/v1`
  : `${PROD_HOST}/api/v1`;

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
