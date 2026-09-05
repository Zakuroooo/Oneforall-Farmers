# PRANAY — Farmer App

> **You are the frontend lead for the farmer-facing app.** What you build is the first thing a judge sees and the only thing a farmer ever sees.
> This file is your PRD, your TRD, and your task list. It is self-contained. Read it, then read `docs/architecture/00_CANON.md` §7 (the API contract), `docs/architecture/12_STACK.md` (**React Native CLI — not Expo**), and `docs/architecture/07_FRONTEND_ARCHITECTURE.md`. Then start on P0.

**Start the Android SDK / JDK 17 download before you read anything else.** RN CLI's first `run-android` on a cold machine is 15–30 minutes of Gradle downloading. Kick it off now and read while it runs — see `12_STACK.md` §6.

---

## PART 1 — PRD · What you are building and why

### 1.1 Your mission in one sentence

**Make the verdict believable.** A farmer opens the app, sees today's price, taps one button, and gets a decision — *sell now* or *wait eleven days* — with the rupee gain, the worst case, and every cost that was subtracted. Your job is that screen and the fifteen screens that make it trustworthy.

### 1.2 The user you are building for

A farmer in the Nashik onion belt. Reads Marathi. May not read English at all. Has a ₹7,000 Android phone with 2 GB RAM and patchy 3G. Is standing in a field, in sunlight, possibly with one hand free. Has been given bad advice by people with a financial interest in his decision.

This produces five hard design consequences, and they are not negotiable:

| Consequence | Why |
|---|---|
| **Marathi by default, no toggle needed** | English-first with a language switch is a product for us, not for him |
| **Devanagari numerals** — ₹६,२९० not ₹6,290 | If he reads Marathi, he reads Marathi digits |
| **One decision per screen** | Two questions on one screen is one question too many |
| **The worst case at the same font size as the expected gain** | This is invariant I16 and it is the ethical centre of the product |
| **Works with no signal** | Last-known value + a timestamp banner, never a spinner forever |

### 1.3 What you own

| | |
|---|---|
| **Screens** | **S1–S16 + S26 + S28** (farmer). Shreya owns S17–S25 (buyer, provenance) and S27 (buyer's side of the chat). |
| **Files** | `app/src/screens/farmer/**`, `app/src/components/farmer/**`, `app/src/components/charts/**`, `app/src/lib/api.ts`, `app/src/lib/money.ts`, `app/src/lib/offline.ts`, `app/src/config.ts`, `app/App.tsx`, the navigators, and the two native projects `app/android/` + `app/ios/` |
| **Shared, you consume but do not edit** | `app/src/components/ui/**` (Shreya), `app/src/lib/i18n.tsx` + `app/messages/{mr,hi,en}.json` (Shreya), `app/src/lib/voice.ts` (Shreya) |

**You own `app/android/`.** RN CLI checks the native projects into git, which Expo does not. That means `AndroidManifest.xml`, `build.gradle` and `network_security_config.xml` are *your* files, and a Gradle change you make is a change everyone else pulls. Touch them deliberately and say so in the group chat.

**Need a Marathi string that does not exist?** Do not add it to `mr.json`. Put the English text inline with `TODO(shreya): mr string` and file a blocker. Two people editing one JSON dictionary is a guaranteed merge conflict on a file nobody can read the diff of.

### 1.4 The screen inventory — yours

**This table is `07_FRONTEND_ARCHITECTURE.md` §10, which is authoritative for screen numbering.** If you find a different S-number in an older document, this one wins and that one is the bug.

| ID | Screen | What it must do | Priority |
|---|---|---|---|
| **S1** | Language picker | **मराठी / हिंदी / English.** First launch only. Persisted. | P0 |
| **S2** | Phone + OTP | 10-digit phone → 6-digit OTP → JWT. Dev mode echoes the OTP. | P0 |
| **S3** | Profile / register | Name, district, village. Post-OTP for new users. **No Aadhaar field — I9.** | P0 |
| **S4** | **★ Home** | Today's price for his commodity + market, **source badge**, one big CTA: *"मी विकावे का?"* | **P0** |
| **S5** | Price history | 180-day line chart, source-coloured segments | P0 |
| **S6** | **★ Nearby mandis** | Gross price, transport cost, **net price** — ordered by NET | **P0** |
| **S7** | Forecast | 14-day p10/p50/p90 **fan**. Never a bare line. | P0 |
| **S8** | Model card | MASE, coverage %, known limitations, model version | P1 |
| **S9** | **★★ VERDICT** | The hero. Action, hold days, gain, **worst case**, confidence, costs. | **P0** |
| **S10** | Cost breakdown | Five itemised per-quintal deductions + total | P0 |
| **S11** | Pledge card | Indicative loan simulation. **Absent entirely if not worthwhile (I13).** | P1 |
| **S12** | Create lot | 5 fields + photo | P0 |
| **S13** | Self-assay | 6 questions → grade + improvement tip | P0 |
| **S14** | **★ Counter-offer** | Counter a buyer's offer **with his own forecast on screen** | **P0** |
| **S15** | My lots / my offers | List + empty state. Tapping a transaction shows the escrow timeline. | P1 |
| **S16** | FPO split (read-only) | My share, the weight formula, `vs_solo` gain | P1 |
| **S26** | **Chat + call** *(new)* | Message a buyer; a call button that opens the dialer | P1 |
| **S28** | Assistant *(new)* | Canned tri-lingual Q&A, retrieval only, no generation | P2 |

**Three notes on this table, because it changed:**

- **S15 is the list, and the escrow timeline is a component inside it, not a separate screen.** `01_PRD.md` calls S15 "Transaction timeline" and `07_FRONTEND` calls it "My lots / my offers". Both are needed and neither is a whole screen on its own — so S15 is the list, and tapping a row expands the state timeline using the same component Shreya builds for S22. One component, two call sites, no third screen number.
- **S16 is the FPO split, not the assistant.** An earlier draft of *this file* had S16 as the assistant, disagreeing with both `01_PRD.md` and `07_FRONTEND`. Those two agree, so they win. The assistant moved to **S28**.
- **S26 and S28 are new and both are P1/P2.** They exist because of the chat + call + tri-lingual-agent scope added after the baseline was written. **Neither is on the golden path.** No demo beat fails if they are cut — see `docs/PLAN.md` §9 for the cut order.

### 1.5 The two screens that decide whether we win

**S9, the verdict.** Everything upstream exists to make this credible. It gets the most care, the most polish, and the most rehearsal.

**S14, the counter-offer.** The farmer's own forecast is rendered *directly above* the input box where he types his counter-price. That single layout decision is the entire "we removed the middleman" claim, made visible. The middleman's whole advantage is knowing the price curve when the farmer does not. Put the curve above the input.

### 1.6 The S9 layout — build exactly this

Every number below comes from the `POST /ai/window/recommend` example in `00_CANON.md` §7.4. **Nothing here is invented; if a field is not in that response, it is not on this screen.**

```
┌────────────────────────────────────────┐
│  कांदा · लासलगाव          [AGMARKNET] │  ← commodity, market, data_source badge
│                                        │
│         थांबा                          │  ← 32 sp, bold.        action: HOLD
│         ११ दिवस                        │  ← 20 sp.              hold_days: 11
│                                        │
│  अपेक्षित फायदा                        │
│      + ₹६,२९०                          │  ← 28 sp, green.  expected_gain_paise
│                                        │
│  सर्वात वाईट स्थिती                     │
│      − ₹४,८००                          │  ← 28 sp, red.    worst_case_paise
│                                        │  ★ I16: THE SAME 28 sp AS ABOVE
│  ४० क्विंटलवर · विश्वास: मध्यम           │  ← qty_qtl · confidence: MEDIUM
│                                        │
│  ▸ खर्चाचा तपशील  (₹१५५/क्विंटल वजा)     │  ← costs.total_paise_per_qtl → S10
│  ────────────────────────────────────  │
│  🔊 ऐका                                 │  ← voice, works offline
└────────────────────────────────────────┘
```

**There is no "best case" row.** An earlier draft of this file had one, at 20 sp, next to a 20 sp worst case — and `best_case_paise` **does not exist in the API**. That row was inventing a field *and* misreading I16. Read the invariant again: *"the worst case renders at the same font size as the expected gain."* The pair being compared is **gain ↔ worst case**, both at 28 sp. There is no third number.

**`confidence` is an enum, not a percentage.** CANON returns `"LOW" | "MEDIUM" | "HIGH"`. Render `मध्यम`, not `७८%`. If you want to show the band width, that is `band_width_bps` — `2140` → `२१%` — and it belongs on S7 next to the fan, not on the verdict card.

**There is no `best_day` field either.** The recommendation is "hold 11 days", not "sell on the 18th". Do not render a date the model did not produce.

**The measurement you must actually take:** open the running app, screenshot S9, and confirm the expected-gain number and the worst-case number are the same pixel height. Not "both look about right" — the same. If one is 28 sp and one is 20 sp, I16 is broken and the most important claim in the pitch is a lie in the UI.

### 1.7 The refusal screen — S9's other state

When the API returns `action: 'NO_ADVICE'`:

```
┌────────────────────────────────────────┐
│  टोमॅटो · नाशिक           [AGMARKNET] │
│                                        │
│         ⚠  सल्ला नाही                   │  ← 28 sp
│                                        │
│  पुढील १४ दिवसांचा अंदाज                 │  ← explain_mr, verbatim
│  खूप अनिश्चित आहे.                       │
│  आम्ही सल्ला देणार नाही.                  │
│                                        │
│  अंदाजाची रुंदी: ५८%  (मर्यादा: ३५%)     │  ← band_width_bps vs the threshold
│                                        │
│  आजची किंमत: ₹१,९३९/क्विंटल              │  ← sell_now_net_paise_per_qtl
└────────────────────────────────────────┘                still give him the facts
```

**Render `explain_mr` verbatim.** Do not compose your own Marathi refusal sentence — Nilesh returns one per `refusal_reason`, and there are four (`BAND_TOO_WIDE` · `INSUFFICIENT_HISTORY` · `STALE_DATA` · `GAIN_BELOW_COST`). Four hardcoded strings on the client is four strings that drift out of sync with the server's reasoning.

**Design this screen with the same care as the HOLD card, not less.** It is demo beat 11 and it is the beat that wins the room. A refusal that looks like an error state reads as a bug; a refusal that looks deliberate reads as integrity. Same card chrome, same padding, same typography scale — the only difference is the icon and the colour.

**`NO_ADVICE` is not an error.** It is a 200 with a different `action`. It does not go through `ErrorState`, it does not trigger a retry, and TanStack Query must not treat it as a failure. Getting this wrong turns the best beat in the demo into a red error box.

### 1.8 Out of scope for you

Buyer screens · the Marathi/Hindi dictionaries themselves · the voice clip generation · the ML model · any backend endpoint · the deployment. If you find yourself writing Python, stop.

---

## PART 2 — TRD · How you build it

### 2.1 Stack, fixed

```
React Native CLI 0.76.x   ·  React Navigation  ·  TanStack Query  ·  React Context
react-native-svg (charts) ·  react-native-sound (voice, Shreya's lib)
AsyncStorage (offline cache + JWT)  ·  react-native-image-picker (S12 photo)
TypeScript strict.  No Redux.  No axios — plain fetch.  NO EXPO.  No web build.
```

**Not Expo.** The full reasoning is `12_STACK.md` §1; the short version is that Expo's config plugins and prebuild step are a category of failure we cannot debug at hour 30, and the escape hatch (`expo prebuild`) lands you in RN CLI anyway, at the worst possible moment. We start where we would end up.

**One consequence you must internalise now: there is no web target.** RN CLI has no `--web`. The buyer console is **the same APK on a second Android device**, not a browser tab. Any instruction anywhere in this repo that says `expo start --web` is stale — report it.

### 2.2 One codebase, two navigators

```
App.tsx
 └─ QueryClientProvider
     └─ I18nProvider          (Shreya)
         └─ AuthProvider       (you)
             └─ RootNavigator
                 ├─ !token            → AuthStack       (S1, S2, S3)
                 ├─ role === 'FARMER' → FarmerNavigator (S4–S16, S26, S28)  ← yours
                 └─ role === 'BUYER'  → BuyerNavigator  (S17–S25, S27)      ← Shreya's
```

**The role comes from the JWT, not from a picker.** One binary serves both users; the buyer console costs one `if`. On stage that is two phones side by side running the identical APK — which is a clearer picture for a judge than a phone plus a browser, and it is also the only option we have.

`Sound.setCategory('Playback')` goes in `App.tsx`, once, at mount. Skip it and Android plays Shreya's clips at ringer volume, which on a demo phone with the ringer down is silence. It is one line in *your* file that breaks *her* headline feature.

### 2.3 `lib/api.ts` — the only place fetch is called

```ts
import { API_BASE_URL } from '../config';        // ← NOT process.env. See §2.3.1.

export class ApiError extends Error {
  constructor(readonly code: string, message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    // the API always returns {error:{code,message}} — but never trust that on a 502
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.error?.code ?? 'NETWORK',
      body?.error?.message ?? `HTTP ${res.status}`,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}
```

**The wire format is `snake_case` and you read it directly.** `expected_gain_paise`, `band_width_bps`, `p10_paise_per_qtl`. Do **not** write a camelCase mapping layer — every mapping layer is a place where a field silently becomes `undefined` and a number renders as `NaN` on stage.

#### 2.3.1 There is no `EXPO_PUBLIC_*` — the base URL is a committed constant

```ts
// app/src/config.ts — you own this file. Committed. No secrets in it, ever.
import { Platform } from 'react-native';

const LAN_IP = '192.168.1.7';          // ← change to YOUR laptop's IP for device testing

export const API_BASE_URL = __DEV__
  ? (Platform.OS === 'android' ? `http://10.0.2.2:8000/api/v1` : `http://localhost:8000/api/v1`)
  : 'http://<ec2-host>/api/v1';

export const USE_FIXTURES = false;     // ← fallback rung 3: flip to true, rebuild, no API needed
```

**`10.0.2.2`, not `localhost`.** Inside the Android emulator, `localhost` *is the emulator*. `10.0.2.2` is the host machine. This costs everyone an hour exactly once; do not let it be your hour.

**Nothing secret goes in this file (I10).** The app holds no keys — auth is a JWT the server issues at runtime. That is why a committed constant beats `react-native-config` here: no native setup on two platforms, no rebuild to change a value, and nothing to leak.

#### 2.3.2 ★ Cleartext HTTP is blocked on Android 9+ — fix this in P0

Our dev API is `http://`, and Android blocks cleartext by default. **The failure looks exactly like the server being down**, which is how it eats an afternoon.

Write `app/android/app/src/main/res/xml/network_security_config.xml` with your three domains (`10.0.2.2`, your LAN IP, `localhost`), reference it from `<application>` in `AndroidManifest.xml`, and **scope it to those domains** — the full snippet is in `12_STACK.md` §7.3.

**Do not set `android:usesCleartextTraffic="true"` globally.** That permits cleartext to every host on the internet, and it is exactly the kind of thing a security-minded judge greps for.

### 2.4 `lib/money.ts` — I1 and I2 live here

```ts
const DEV = ['०','१','२','३','४','५','६','७','८','९'];

/** Indian grouping: 6290 -> "6,290", 142000 -> "1,42,000" */
function groupIndian(n: number): string {
  const s = String(n);
  if (s.length <= 3) return s;
  const head = s.slice(0, -3);
  const tail = s.slice(-3);
  return head.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + tail;
}

export function formatPaise(paise: number, locale: Locale = 'mr'): string {
  const rupees = Math.floor(Math.abs(paise) / 100);   // display only — never feed back into arithmetic
  const grouped = groupIndian(rupees);
  const digits = locale === 'en' ? grouped : grouped.replace(/\d/g, d => DEV[+d]);
  return `${paise < 0 ? '−' : ''}₹${digits}`;
}

/** kg -> quintals for display. 4000 kg -> 40.  FLOOR, never round. */
export const toQuintal = (kg: number): number => Math.floor(kg / 100);
```

**Three deliberate choices in ten lines:**

1. **`Math.floor`, not `Math.round`.** Rounding *up* shows a farmer a rupee he will not receive. `Math.round` on 4050 kg claims 41 quintals of a 40-quintal lot, and the same rounding on the money path inflates a gain. Floor is the only direction that is safe when the number is a promise.
2. **`Math.abs` before flooring, sign restored after.** `Math.floor(-480050 / 100)` is `-4801`, not `-4800` — floor rounds *away* from zero for negatives, so a naive floor overstates the loss. Take the magnitude, floor it, put the sign back.
3. **`locale === 'en'` is the escape, not `locale === 'mr'` the condition.** Three locales ship now (`mr`, `hi`, `en`) and **Hindi uses the same Devanagari digits as Marathi.** Written as `locale === 'mr' ? devanagari : latin`, adding Hindi silently gives Hindi users Latin digits. Written as above, Hindi is correct for free and every future Devanagari locale is too.

**The tests you must write first, before any screen:**

```ts
expect(formatPaise(629000, 'mr')).toBe('₹६,२९०');
expect(formatPaise(629000, 'hi')).toBe('₹६,२९०');        // Hindi = same digits
expect(formatPaise(629000, 'en')).toBe('₹6,290');
expect(formatPaise(14200000, 'mr')).toBe('₹१,४२,०००');   // Indian grouping, not 142,000
expect(formatPaise(-480000, 'mr')).toBe('−₹४,८००');
expect(formatPaise(-480050, 'mr')).toBe('−₹४,८००');      // not −₹४,८०१
expect(toQuintal(4050)).toBe(40);                         // not 41
```

The `₹१,४२,०००` case is the one that breaks if you reach for `toLocaleString('en-US')`. Indian grouping is not en-US grouping, and a judge from Maharashtra will notice `₹142,000` instantly.

**The rule:** `formatPaise` is the *only* function in `app/src/` that divides by 100. `toQuintal` is the only other place `/ 100` may appear. If it shows up anywhere else, that is a bug — grep your own diff before every commit.

### 2.5 The four states — every screen, no exceptions

```tsx
export function Screen() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['x'], queryFn: fetchX });

  if (isLoading) return <Skeleton />;                    // not a spinner in the middle of a blank page
  if (error)     return <ErrorState error={error} onRetry={refetch} />;
  if (!data || data.items.length === 0) return <EmptyState />;
  return <Data data={data} />;
}
```

P8 is "every screen has all four". **The way you verify it is to stop the API and click through the entire app.** Not read the code — click it. A white screen during a demo is indistinguishable from a crash.

**`NO_ADVICE` does not belong in the `error` branch.** See §1.7. It is data.

### 2.6 `lib/offline.ts` — the airplane-mode beat

```ts
/** Returns cached data with a staleness flag when the network is unavailable. */
export function useOfflineQuery<T>(key: string[], fn: () => Promise<T>) {
  const q = useQuery({ queryKey: key, queryFn: fn, staleTime: 5 * 60_000 });
  const [cached, setCached] = useState<{ data: T; at: number } | null>(null);

  useEffect(() => {
    if (q.data) {
      const at = Date.now();
      AsyncStorage.setItem(`c:${key.join(':')}`, JSON.stringify({ data: q.data, at }));
      setCached({ data: q.data, at });
    }
  }, [q.data]);

  useEffect(() => {
    if (q.error && !cached) {
      AsyncStorage.getItem(`c:${key.join(':')}`).then(s => s && setCached(JSON.parse(s)));
    }
  }, [q.error]);

  const isStale = !!q.error && !!cached;
  return { data: q.data ?? cached?.data, isStale, staleAt: cached?.at, ...q };
}
```

When `isStale`, render the banner: **"काल दुपारी ३ वाजताची माहिती"** (*yesterday 3pm's data*). Never hide staleness, and never show a stale number as if it were live. This is demo beat 7 and it only lands because the timestamp is honest.

**Warm the cache before you go on stage.** The offline beat reads AsyncStorage, and AsyncStorage is empty on a fresh install. Open S4 and S9 online once during the 90-second pre-flight, then toggle airplane mode. A cold cache in airplane mode is an empty state, not a stale banner, and beat 7 dies.

### 2.7 Charts — `components/charts/`, hand-rolled in `react-native-svg`

Two hard rules:

1. **Never render p50 without the p10–p90 band.** A point forecast with no interval is a guess with a chart, and shipping one contradicts the pitch. `ForecastFan` takes all three arrays or it does not render — enforce that in the prop types, not in a comment.
2. **The source badge is part of the chart, not next to it.** `AGMARKNET` / `MSAMB` / `IMPUTED` / `SYNTHETIC`, rendered inside the chart frame. I8.

```tsx
import Svg, { Path, Polyline } from 'react-native-svg';

type Props = { p10: number[]; p50: number[]; p90: number[]; source: string };
//                    ↑ all three required — the invariant is in the type

export function ForecastFan({ p10, p50, p90, source }: Props) {
  const band = `M ${pts(p90)} L ${pts([...p10].reverse())} Z`;   // p90 forward, p10 back, close
  return (
    <Svg viewBox="0 0 320 180">
      <Path d={band} fill="#2e7d32" fillOpacity={0.18} />
      <Polyline points={pts(p50)} stroke="#2e7d32" strokeWidth={2} fill="none" />
    </Svg>
  );
}
```

**One dependency instead of three.** `victory-native` v37+ pulls in Skia *and* Reanimated — two native modules, two more Gradle failure modes, ~8 MB of APK — for one fan chart and one line chart. The band is a single `<Path>`: p90 left-to-right, p10 right-to-left, close. That is the whole trick, it is about sixty lines including the axes, and it cannot break your build at hour 30.

### 2.8 Building before the API exists

Nilesh's `/ai/window/recommend` will not be live when you start S9. That is expected and planned for. **Build against a fixture that matches `00_CANON.md` §7.4 exactly**, keep it in `app/src/fixtures/`, and flip `USE_FIXTURES` in `config.ts` when the endpoint lands.

```ts
// app/src/fixtures/window.ts — every key from 00_CANON §7.4, no key that isn't
export const fxHold: WindowRes = {
  action: 'HOLD',
  hold_days: 11,
  confidence: 'MEDIUM',
  band_width_bps: 2140,

  sell_now_net_paise_per_qtl: 193925,
  hold_p50_net_paise_per_qtl: 209650,
  hold_p10_net_paise_per_qtl: 181925,

  expected_gain_paise: 629000,      // (209650 - 193925) * 40 qtl  ← check this by hand
  worst_case_paise: -480000,        // (181925 - 193925) * 40 qtl  ← and this

  costs: {
    transport_paise_per_qtl: 8000, commission_paise_per_qtl: 3075,
    storage_paise_per_qtl: 1650, spoilage_paise_per_qtl: 2310,
    loading_paise_per_qtl: 500, total_paise_per_qtl: 15535,
  },

  alt_market: null,
  pledge_quote: { loan_paise: 3400000, ltv_bps: 7000, rate_bps_annual: 900, days: 11,
                  interest_paise: 92200, warehouse_id: 'wh_niphad', is_worthwhile: true,
                  disclaimer: 'Indicative simulation — not a lender quote' },

  refusal_reason: null,
  model_card: { mase: 0.71, coverage_80_bps: 7840 },
  explain_mr: 'अकरा दिवस थांबल्यास सरासरी ₹६,२९० जास्त मिळू शकतात.',
  explain_en: 'Holding 11 days could earn ₹6,290 more on average.',
  data_source: 'AGMARKNET',
};

export const fxNoAdvice: WindowRes = { /* action: 'NO_ADVICE', refusal_reason: 'BAND_TOO_WIDE', ... */ };
```

**★ Do not invent a field.** An earlier draft of this file's fixture carried `best_day`, `best_case_paise`, `confidence_bps`, `costs_paise`, `model_version` and `source_summary` — **six keys that do not exist in the contract.** A screen built against an invented fixture renders perfectly until the real endpoint lands, and then every one of those reads is `undefined`. That is not a small bug: it is a screen that works in every rehearsal and breaks the first time it touches the real backend. **If a key is not in `00_CANON.md` §7.4, it is not in your fixture. If you need it, file a blocker and ask Nilesh — do not add it yourself.**

**Check the two identities by hand.** `(209650 − 193925) × 40 = 629000`. `(181925 − 193925) × 40 = −480000`. The `_per_qtl` fields are per quintal and the two gain fields are whole-lot totals; a 100× unit error between them is the single most likely bug on this path, and it is the kind that puts ₹62,900 on a slide when the honest number is ₹6,290.

**Write `fxNoAdvice` at the same time as `fxHold`, not later.** The refusal state is not an edge case you handle at the end; it is a first-class screen and it is the demo's closing beat.

### 2.9 Your definition of done

1. Runs on a **real Android phone** over the local network — not just the emulator.
2. Marathi is the default. No bare English string on any farmer screen.
3. Every screen: loading, empty, error, data. Verified by stopping the API and clicking through.
4. `formatPaise` and `toQuintal` are the only `/ 100` in `app/src/`. Grep it.
5. S9's worst case and expected gain render at the same font size. Measured, not assumed.
6. No chart shows p50 without its band.
7. Airplane mode: S4 and S9 still render, with the stale banner.
8. `npx tsc --noEmit` clean. No `any`, no `@ts-ignore`, no `!` on network data.
9. Committed and pushed to `pranay`.

---

## PART 3 — Your tasks, in order

Do them in this order. Each one's "done when" is a test you perform, not a feeling.

| # | Task | Done when | Blocked by |
|---|---|---|---|
| **P0** | **Scaffold** — `npx @react-native-community/cli init MandiSetu`, TS strict, navigation, `config.ts`, `network_security_config.xml`, `lib/api.ts`, `lib/money.ts` + its tests, the four-state pattern, fixtures | `npx react-native run-android` shows the app on a device; `formatPaise(629000,'mr') === '₹६,२९०'` passes | nothing |
| **P1** | **S1–S3** language picker (3 locales), phone/OTP, profile | Can log in on a real phone and land on S4 | Akash A1 (fixture until then) |
| **P2** | **★ S4 Home** — today's price, source badge, one big CTA | Renders from `/prices/series`; badge shows the real source | Kartik K4 |
| **P3** | **★ S9 Verdict card** against the fixture, then the live endpoint | Matches §1.6 layout exactly, including the refusal state | fixture, then Nilesh L5 |
| **P4** | **★★ I16 — worst case at the SAME font size as the expected gain** | Screenshot measured: both 28 sp | P3 |
| **P5** | **S10 Cost breakdown** — five per-qtl lines + total, expandable | The five lines sum to `total_paise_per_qtl`, verified by hand | P3 |
| **P6** | **S5 history + S7 forecast fan** — hand-rolled `react-native-svg` | No point line renders without its band | Kartik K4, Nikhil N2 |
| **P7** | **S6 nearby mandis** — gross, transport, **net**, ordered by net | The gross-vs-net reordering is visible to the eye | Kartik K6 |
| **P8** | **Empty + loading + error on every screen** | API stopped → nothing shows a white screen | all of the above |
| **P9** | **S12 create lot + S13 self-assay** — 6 questions → grade + tip | Grade renders; tip names the weakest dimension | Akash A5, A6 |
| **P10** | **★ S14 counter-offer — with the forecast above the input** | The forecast band is visibly above the counter-price box | Akash's offers endpoints |
| **P11** | **Offline** — `useOfflineQuery` + the stale banner on S4 and S9 | Airplane mode: both screens render with a timestamp | P2, P3 |
| **P12** | **S8 model card, S11 pledge card, S15 lots + timeline, S16 FPO split** | S11 is **absent** when the server returns `pledge_quote: null` (I13) | Nilesh L4, L6 |
| **P13** | Wire Shreya's `lib/voice.ts` into S9's 🔊 button | ₹6,290 plays in Marathi **in airplane mode** | **Shreya SH3** |
| **P14** | **Demo rehearsal** — drive the golden path three times | You can do beats 1–11 without looking at notes | H33 |
| **P15** | **S26 chat + call** *(new, if time)* | Farmer messages a buyer; the call button opens the dialer | Akash A14, Shreya SH0 |
| **P16** | **S28 assistant** *(new, if time)* | Eight canned questions answered in the active locale | Nilesh L9, Shreya SH9 |

**P0 through P4 are the critical path of the entire project's frontend.** If you reach H12 with S9 rendering correctly from a fixture and I16 honoured, everything after that is addition rather than risk.

### Two things about P15 and P16

**They are last on this list and they are allowed to be cut.** `docs/PLAN.md` §9 puts them in the cut order: P16 first, then S26's buyer half. Neither is a demo beat. If H30 arrives with S14 half-finished, the answer is to finish S14.

**Neither needs a websocket.** The chat polls — TanStack Query with `refetchInterval: 4000` against `GET /threads/{id}/messages?after=<id>`. Four seconds is invisible in a conversation and a websocket is a whole new failure mode on venue wifi. The call button is `Linking.openURL('tel:...')` — the OS dialer, not a VoIP stack.

**And the phone number is never rendered.** The call button opens the dialer with a number the server supplies at tap time; it does not appear in any text node, any log, or any React state you can screenshot. That is I14, and it is also the difference between a call feature and a phone-number leak.

### The order matters for one specific reason

You build S9 (P3) **before** the history chart (P6) and before lots (P9), even though S9 depends on the least-finished backend. That is deliberate: S9 against a fixture proves the layout, the money formatting, the Devanagari numerals, and I16 all work — and those four things are shared by every other screen. Getting them right once, early, in the highest-stakes screen, means every subsequent screen inherits correct foundations.

Building the easy screens first and the verdict last is how teams discover at H30 that their money formatter drops the Indian grouping.

---

## PART 4 — What to do when you are blocked

1. **Is it in the contract** (`00_CANON.md` §7)? Then build against a fixture. The endpoint will catch up. **The fixture matches the contract exactly — you do not add fields to it.**
2. **Can you stub it in your own file?** Do that, mark `TODO(<name>):`, keep moving.
3. **Append to `docs/BLOCKERS.md`** and say it in the group chat. Both. Within 30 minutes.

**Never edit a file you do not own** — not `mr.json`, not `components/ui/`, not anything in `api/`. A one-line "obvious fix" in someone else's file costs more at merge time than the ten minutes it saved.

**The one exception runs the other way.** `app/android/` *is* yours, and Shreya's voice work depends on it — the audio require map and `setCategory('Playback')` live on your side of the line. If she reports that clips are silent on device, that is your bug to look at first, not hers.

---

## PART 5 — On demo day

You **drive the phone**. Shreya narrates. You say nothing unless asked directly.

Your hands do not shake if your hands have done it three times. Rehearse the 11 beats in `11_DEMO_AND_PITCH.md` §1 until the sequence is muscle memory — especially the airplane-mode toggle (beat 7) and getting to the second crop for the refusal (beat 11).

**Before you start:** the release APK side-loaded on both phones (not Metro over USB — see `02_TRD` §demo-day), already logged in, Marathi selected, S4 and S9 opened once online to warm the offline cache, airplane mode off, brightness up, notifications silenced, phone above 50%. An OTP flow on stage is 40 seconds of nothing happening and one chance to typo.
