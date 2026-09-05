# 12 — THE STACK

> **This file is the complete list of every technology, framework, library and tool in Mandi-Setu.**
> If a package is not on this page, it is not in the project. Adding one requires asking the team first.
> **Supersedes `CLAUDE.md` §3 on any disagreement about the frontend.**

**Changed on 2026-09-05: the app is React Native CLI, not Expo.** Read §0 before you install anything.

---

## 0. The Expo → React Native CLI decision

The team chose **React Native CLI**. That decision is made and this document reflects it. What follows is what it costs, so nobody is surprised at hour 30.

### What we gain

| | |
|---|---|
| **Full native control** | Any native module, any Gradle tweak, no config-plugin layer between us and Android |
| **No Expo Go / EAS dependency** | Nothing depends on an Expo account, an EAS build queue, or a tunnel service |
| **A real APK we control** | `./gradlew assembleRelease` produces a file we can sideload onto any judge's phone |
| **Smaller runtime** | No Expo runtime shipped in the binary — matters on a 2 GB phone |

### What it costs — read all four

**1. `expo start --web` is gone, and with it the buyer console's browser build.**

This was the plan's answer to *"how does the buyer get a desktop console without a second project?"* React Native CLI has no first-class web target. Making one means adding `react-native-web` plus a webpack or rspack config, aliasing every native module that has no web implementation, and debugging it — realistically 3–4 hours of Shreya's time, with a real chance of failure.

> **DECISION: we drop the web build. The buyer console runs on a second Android device or a second emulator window.**
>
> Same binary, same code, same `BuyerNavigator` — the JWT role still selects it. The only change is that the buyer is on a phone instead of a browser. For a live demo this is *better*: two phones side by side, farmer and buyer, is a clearer stage picture than a phone plus a laptop browser. Shreya loses nothing she was going to show.

**2. Every `expo-*` module needs a community replacement.** The mapping is in §4. Two of them (audio, TTS) are on the critical path for demo beats 6 and 7.

**3. Setup is heavier.** Android Studio, an Android SDK, a JDK 17, Gradle. First `run-android` on a cold machine is 15–30 minutes of downloading. **Everyone who touches `app/` should start that download now**, before reading anything else.

**4. No QR-code-to-phone.** Testing on a real device means USB debugging or `adb connect` over wifi. Document the working command once, in `app/README.md`, and everyone uses that.

### The one thing that will actually break

**Android blocks cleartext HTTP by default.** Our API is `http://<laptop-ip>:8000` during development. Without the config in §7.3, every request fails with a network error that looks like the API is down when it is not. This costs teams hours. It is four lines of XML. Do it in P0.

---

## 1. Complete stack list

### 1.1 Mobile app — `app/`

| Layer | Package | Version | Owner | Why this one |
|---|---|---|---|---|
| **Runtime** | `react-native` | 0.76.x | Pranay | New Architecture on by default; stable by 2026 |
| | `react` | 18.3.1 | Pranay | Pinned by RN |
| | `typescript` | ^5.6 | Pranay | `strict: true`, no `any` |
| | Node | 20 LTS | everyone | Metro requires ≥18; 20 is what CI has |
| | JDK | 17 | everyone | RN 0.73+ requires 17. Not 11, not 21. |
| **Navigation** | `@react-navigation/native` | ^7 | Pranay | |
| | `@react-navigation/native-stack` | ^7 | Pranay | Native screens = fast on a 2 GB phone |
| | `@react-navigation/bottom-tabs` | ^7 | Pranay | Farmer tabs and buyer tabs |
| | `react-native-screens` | ^4 | Pranay | Peer dep of navigation |
| | `react-native-safe-area-context` | ^5 | Pranay | Peer dep of navigation |
| **Server state** | `@tanstack/react-query` | ^5 | Pranay | Gives loading/error/cache — 3 of the 4 required states free |
| **Local state** | React Context | built in | Pranay/Shreya | Auth + locale. **No Redux.** |
| **Storage** | `@react-native-async-storage/async-storage` | ^2 | Pranay | Offline cache + locale + JWT |
| **Charts** | `react-native-svg` | ^15 | Pranay | See §3 — we hand-roll the fan, no chart library |
| **Audio out** | `react-native-sound` | ^0.11 | Shreya | Plays the committed Marathi mp3 clips |
| **TTS fallback** | `react-native-tts` | ^4 | Shreya | Replaces `expo-speech`; fallback only |
| **Camera/gallery** | `react-native-image-picker` | ^7 | Pranay | S12 lot photo |
| **HTTP** | `fetch` | built in | Pranay | **No axios.** One `lib/api.ts`, nothing else calls fetch. |
| **Phone call** | `Linking` | built in | Pranay/Shreya | `Linking.openURL('tel:…')` — zero dependencies |
| **Carousel** | `FlatList` | built in | Shreya | `horizontal` + `pagingEnabled` + `snapToInterval`. See §3.2 |
| **i18n** | plain JSON + Context | — | Shreya | **No i18n library.** Three dictionaries, one hook. |
| **Test** | `jest` + `@testing-library/react-native` | | Pranay | `formatPaise` tests are non-negotiable |
| **Lint** | `eslint` + `@react-native/eslint-config` + `prettier` | | Pranay | |

**That is the whole app dependency list. Fifteen runtime packages.** Anything not here — a UI kit, a form library, a date library, a state manager, an animation library — is a `no` unless the team agrees in chat.

### 1.2 API — `api/`

| Layer | Package | Version | Owner |
|---|---|---|---|
| **Language** | Python | **3.11** (`uv venv --python 3.11`) | everyone |
| **Framework** | `fastapi` | ^0.115 | Akash |
| **Server** | `uvicorn[standard]` | ^0.32 | Akash |
| **Validation** | `pydantic` | **v2** | Akash |
| | `pydantic-settings` | ^2 | Nilesh (`config.py`) |
| **ORM** | `sqlalchemy` | **2.0**, async | Akash |
| | `asyncpg` | ^0.30 | Akash |
| **Migrations** | `alembic` | ^1.14 | Akash |
| **Auth** | `python-jose[cryptography]` | ^3.3 | Akash |
| | `passlib[bcrypt]` | ^1.7 | Akash |
| | `secrets` | stdlib | Akash — **I15, OTPs come from here** |
| **ML** | `lightgbm` | ^4.5 | Nikhil |
| | `pandas`, `numpy`, `scikit-learn` | current | Nikhil |
| **Upload** | `python-multipart` | ^0.0.12 | Akash |
| | `Pillow` | ^11 | Akash — EXIF GPS strip (A4) |
| **Test** | `pytest`, `pytest-asyncio`, `httpx` | current | everyone |

**Python 3.11 is not negotiable.** 3.14 has no LightGBM wheel; you will spend two hours discovering that.

### 1.3 Data + infra

| Layer | Choice | Owner |
|---|---|---|
| **Database** | PostgreSQL **16**, in Docker. Enums as `text` + `CHECK`, **not** native PG enums | Kartik |
| **Ingestion** | `requests`, `pandas`, `beautifulsoup4`, `openpyxl` — **offline CLI only** (I7) | Kartik |
| **Containers** | Docker + `docker compose` | Kartik |
| **Proxy** | nginx | Kartik |
| **Host** | one **EC2 t3.small** + **a swap file (mandatory)** | Kartik |
| **TTS generation** | any offline TTS, run once by hand, output committed | Shreya |

### 1.4 Wire format — one line, and it governs everything

**`snake_case` end to end.** The frontend reads `expected_gain_paise` directly. **There is no camelCase mapping layer.** Every mapping layer is a place a field silently becomes `undefined` and a number renders `NaN` on stage.

---

## 2. Banned — do not install these

| Not this | Because |
|---|---|
| `expo`, `expo-*`, `expo-router` | We are on RN CLI. Mixing them is a config-plugin problem nobody has time to debug. |
| `axios` | `fetch` is built in. One HTTP client, in one file. |
| `redux`, `zustand`, `jotai`, `mobx` | There is no global mutable state here worth the ceremony. Query + Context covers it. |
| `i18next`, `react-intl` | Three JSON files and a `t()` function. A dependency for a dictionary lookup is not worth the lockfile. |
| `moment`, `dayjs`, `date-fns` | We format two date shapes. `Intl.DateTimeFormat` is built in. |
| `victory-native`, `react-native-chart-kit` | See §3.1. |
| `react-native-paper`, `nativebase`, any UI kit | Shreya's six `components/ui/` primitives are the design system. A kit fights the Marathi type scale. |
| `socket.io`, `ws` | Chat polls. See §3.3. |
| any blockchain / web3 package | We use a hash-chained Postgres table and can explain exactly why a chain is the wrong tool. |
| any package that needs an API key at runtime | I7. The demo makes zero live external calls. |

---

## 3. The four "how do we do X without a library" answers

### 3.1 Charts — hand-rolled `react-native-svg`, no chart library

We render exactly **two** chart shapes, and one of them has a hard requirement no chart library gives us cleanly: **the p50 line must never render without its p10–p90 band.**

```tsx
// components/charts/ForecastFan.tsx — the whole chart, ~60 lines
import Svg, { Path, Polyline, Line } from 'react-native-svg';

// band = a single closed polygon: p90 left-to-right, then p10 right-to-left
const band = `M ${p90.map(xy).join(' L ')} L ${[...p10].reverse().map(xy).join(' L ')} Z`;

<Svg width={w} height={h}>
  <Path points={band} fill={C.band} fillOpacity={0.18} />       {/* drawn FIRST */}
  <Polyline points={p50.map(xy).join(' ')} stroke={C.p50} strokeWidth={2} fill="none" />
  <Line x1={xAt(holdDays)} y1={0} x2={xAt(holdDays)} y2={h} stroke={C.mark} strokeDasharray="4 4" />
</Svg>
```

**Why not a chart library:** `victory-native` v40+ pulls in `react-native-skia` and `react-native-reanimated` — two large native dependencies, both of which have New-Architecture edge cases, to draw a shaded polygon. Sixty lines of SVG has no native build risk, renders identically on both platforms, and lets us enforce the band rule structurally: `ForecastFan` takes `{p10, p50, p90}` and there is no code path that draws p50 alone.

**One dependency (`react-native-svg`) instead of three, and the invariant is enforced by the component's own props.**

### 3.2 Carousels — `FlatList`, no carousel library

```tsx
<FlatList
  data={cards} horizontal pagingEnabled
  showsHorizontalScrollIndicator={false}
  snapToInterval={CARD_W + GAP} decelerationRate="fast"
  keyExtractor={c => c.id}
  renderItem={({ item }) => <Card {...item} />}
  onViewableItemsChanged={onIndexChange}     // drives the dot indicator
/>
```

`react-native-reanimated-carousel` needs Reanimated **and** Gesture Handler — two native modules, for horizontal paging that `FlatList` does natively. On a 2 GB phone the built-in one also scrolls better because it recycles rows.

### 3.3 Chat — polling, no websockets

```tsx
useQuery({
  queryKey: ['thread', threadId],
  queryFn: () => api(`/threads/${threadId}/messages?after=${lastId}`),
  refetchInterval: 4000,          // 4s while the screen is focused
  refetchIntervalInBackground: false,
});
```

A 4-second poll is indistinguishable from realtime in a demo, costs one `GET` endpoint, and survives a flaky venue network — a dropped websocket needs reconnect logic that nobody will write correctly at hour 28. **Poll only while the screen is focused**, or the app drains a farmer's battery.

### 3.4 Phone call — `Linking`, no library

```tsx
import { Linking } from 'react-native';
await Linking.openURL(`tel:${phone}`);   // hands off to the dialer
```

**The number is never displayed and never logged (I14).** The server returns a `can_call: true` flag and a masked display string; the raw number comes back only on the tap, from an endpoint that logs the *event*, not the number. In Phase 2 this becomes a masked-number bridge so neither party sees the other's real number — say that if asked.

---

## 4. `expo-*` → community package mapping

Anyone who finds an `expo-` import in a code sample is reading the pre-2026-09-05 plan. Translate with this table.

| Was (Expo) | Now (RN CLI) | Used by | Note |
|---|---|---|---|
| `expo-av` | **`react-native-sound`** | Shreya SH3 | Trim leading silence off every clip or sequenced sentences sound broken |
| `expo-speech` | **`react-native-tts`** | Shreya SH3 | Fallback only. Depends on a device Marathi voice a ₹7,000 phone may not have. |
| `expo-image-picker` | **`react-native-image-picker`** | Pranay P9 | Needs `CAMERA` permission in the manifest |
| `expo-secure-store` | AsyncStorage (Phase 1) | Pranay P0 | **Known gap: the JWT is not in the keystore.** Say so if asked; `react-native-keychain` is the Phase-2 fix. |
| `expo-file-system` | not needed | — | Nothing writes files |
| `expo-location` | **not needed** | — | District comes from a dropdown, not GPS. One less native module. |
| `EXPO_PUBLIC_*` env vars | **`app/src/config.ts`** | Pranay P0 | See §7.2 — RN CLI has no built-in env injection |
| `npx expo start` | `npx react-native start` | everyone | |
| `npx expo start --web` | **gone** — buyer runs on a 2nd device | Shreya | §0 |
| `npx expo run:android` | `npx react-native run-android` | everyone | |
| Expo Go QR scan | USB debugging or `adb connect` | everyone | |

---

## 5. Versions we pin and why

```
node        20.x LTS      Metro needs >=18; 20 is what the box has
jdk         17            RN 0.73+ requires exactly 17. Not 11. Not 21.
android     compileSdk 35, minSdk 24, targetSdk 35
python      3.11          LightGBM wheel. Not 3.12, not 3.14.
postgres    16
```

**Everyone runs the same Node major and the same JDK.** Two people on different JDKs produce two different Gradle failures and four hours of confusion.

---

## 6. Install — one block per lane

### App (Pranay + Shreya)

```bash
npx @react-native-community/cli@latest init MandiSetu --directory app --pm npm
cd app
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
      react-native-screens react-native-safe-area-context \
      @tanstack/react-query @react-native-async-storage/async-storage \
      react-native-svg react-native-sound react-native-tts react-native-image-picker
npx react-native run-android
```

### API (Akash, Nikhil, Nilesh)

```bash
cd api && uv venv --python 3.11 && source .venv/bin/activate && uv pip install -r requirements.txt
```

### Stack (Kartik, then everyone)

```bash
docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python -m seed.run_all
bash scripts/smoke.sh
```

---

## 7. The three RN CLI gotchas that cost hours

### 7.1 Android emulator cannot see `localhost`

`localhost` inside the emulator is the emulator. The host machine is **`10.0.2.2`**.

| Running on | API base URL |
|---|---|
| Android emulator | `http://10.0.2.2:8000/api/v1` |
| Real phone, same wifi | `http://<your-laptop-LAN-ip>:8000/api/v1` |
| Deployed | `http://<ec2-host>/api/v1` |

### 7.2 There is no `EXPO_PUBLIC_*` — use `app/src/config.ts`

```ts
// app/src/config.ts — Pranay owns this file. Committed. No secrets in it, ever.
import { Platform } from 'react-native';

const LAN_IP = '192.168.1.7';          // <- change to YOUR laptop's IP for device testing

export const API_BASE_URL =
  __DEV__
    ? (Platform.OS === 'android' ? `http://10.0.2.2:8000/api/v1` : `http://localhost:8000/api/v1`)
    : 'http://<ec2-host>/api/v1';

export const DEVICE_API_BASE_URL = `http://${LAN_IP}:8000/api/v1`;   // real phone over wifi
```

A committed constants file beats `react-native-config` here: no native setup on two platforms, no rebuild to change a value, and **nothing secret goes in it** — the app holds no keys. Auth is a JWT the server issues at runtime.

### 7.3 ★ Cleartext HTTP is blocked — fix this in P0, not at H30

Our dev API is `http://`. Android 9+ blocks cleartext by default and the failure looks exactly like the server being down.

`android/app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>
    <domain includeSubdomains="true">192.168.1.7</domain>   <!-- your LAN IP -->
    <domain includeSubdomains="true">localhost</domain>
  </domain-config>
</network-security-config>
```

`AndroidManifest.xml`, on `<application>`:
```xml
android:networkSecurityConfig="@xml/network_security_config"
```

**Scope it to those domains. Do not set `android:usesCleartextTraffic="true"` globally** — that permits cleartext to *every* host, which is the kind of thing a security-minded judge notices.

---

## 8. What this stack cannot do, and we say so

| Gap | Honest answer |
|---|---|
| JWT sits in AsyncStorage, not the keystore | *"Phase 2 uses `react-native-keychain`. In Phase 1 the token is a 72-hour JWT on a device the farmer owns."* |
| No web build for the buyer | *"The buyer runs the same binary on a phone. A desktop console is Phase 2 and it is the same code."* |
| Chat polls every 4 s | *"Sockets are Phase 2. Polling is what survives a venue network, and at this message volume the difference is invisible."* |
| iOS untested | *"We built and tested on Android because that is what our user has. The code is cross-platform; iOS is a build we have not run."* |
| No accessibility audit | *"Should happen, will not happen in 36 hours. The voice channel is the accessibility feature we did build."* |

**Naming these is what makes the rest credible.** A team that claims everything works has told the panel nothing they can believe.
