# PRANAY — Farmer App

> **You are the frontend lead for the farmer-facing app.** What you build is the first thing a judge sees and the only thing a farmer ever sees.
> This file is your PRD, your TRD, and your task list. It is self-contained. Read it, then read `docs/architecture/00_CANON.md` §7 (the API contract) and `docs/architecture/07_FRONTEND_ARCHITECTURE.md`. Then start on P1.

---

## PART 1 — PRD · What you are building and why

### 1.1 Your mission in one sentence

**Make the verdict believable.** A farmer opens the app, sees today's price, taps one button, and gets a decision — *sell now* or *wait twelve days* — with the rupee gain, the worst case, and every cost that was subtracted. Your job is that screen and the twelve screens that make it trustworthy.

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
| **Screens** | **S1–S16** (farmer). Shreya owns S17–S25 (buyer, FPO, provenance). |
| **Files** | `app/src/screens/farmer/**`, `app/src/components/farmer/**`, `app/src/components/charts/**`, `app/src/lib/api.ts`, `app/src/lib/money.ts`, `app/src/lib/offline.ts`, `app/App.tsx`, the navigators |
| **Shared, you consume but do not edit** | `app/src/components/ui/**` (Shreya), `app/src/lib/i18n.tsx` + `app/messages/mr.json` (Shreya), `app/src/lib/voice.ts` (Shreya) |

**Need a Marathi string that does not exist?** Do not add it to `mr.json`. Put the English text inline with `TODO(shreya): mr string` and file a blocker. Two people editing one JSON dictionary is a guaranteed merge conflict on a file nobody can read the diff of.

### 1.4 The screen inventory — yours

| ID | Screen | What it must do | Priority |
|---|---|---|---|
| **S1** | Language picker | Marathi / English. First launch only. Persisted. | P0 |
| **S2** | Phone + OTP | 10-digit phone → 6-digit OTP → JWT. Dev mode echoes the OTP. | P0 |
| **S3** | Profile / register | Name, district, village. Post-OTP for new users. | P0 |
| **S4** | **★ Home** | Today's price for his commodity + market, **source badge**, one big CTA: *"मी विकावे का?"* | **P0** |
| **S5** | Price history | 180-day line chart, source-coloured segments | P0 |
| **S6** | **★ Nearby mandis** | Gross price, transport cost, **net price** — ordered by NET | **P0** |
| **S7** | Forecast | 14-day p10/p50/p90 **fan**. Never a bare line. | P0 |
| **S8** | Model card | MASE, coverage %, known limitations, model version | P1 |
| **S9** | **★★ VERDICT** | The hero. Action, gain, **worst case**, confidence, best day. | **P0** |
| **S10** | Cost breakdown | Five itemised deductions + total | P0 |
| **S11** | Pledge card | Indicative loan simulation. **Absent entirely if not worthwhile.** | P1 |
| **S12** | My lots | List + create. Empty state matters. | P0 |
| **S13** | Self-assay | 6 questions → grade + improvement tip | P0 |
| **S14** | **★ Offers + counter** | Incoming offers; counter-offer **with his own forecast on screen** | **P0** |
| **S15** | Escrow timeline | State machine as a vertical timeline | P1 |
| **S16** | Assistant | ~30 fixed Marathi FAQs, retrieval only | P2 |

### 1.5 The two screens that decide whether we win

**S9, the verdict.** Everything upstream exists to make this credible. It gets the most care, the most polish, and the most rehearsal.

**S14, the counter-offer.** The farmer's own forecast is rendered *directly above* the input box where he types his counter-price. That single layout decision is the entire "we removed the middleman" claim, made visible. The middleman's whole advantage is knowing the price curve when the farmer does not. Put the curve above the input.

### 1.6 The S9 layout — build exactly this

```
┌────────────────────────────────────────┐
│  कांदा · लासलगाव          [ARCHIVE]   │   ← commodity, market, source badge
│                                        │
│         थांबा                          │   ← 32 sp, bold. HOLD.
│         १२ दिवस                        │   ← 20 sp
│                                        │
│  अपेक्षित फायदा                        │
│      + ₹६,२९०                         │   ← 28 sp, green
│                                        │
│  सर्वात वाईट स्थिती                     │
│      − ₹४,८००                         │   ← 20 sp, red  ← I16: SAME SIZE as below
│  सर्वात चांगली स्थिती                    │
│      + ₹१,४२,०००                       │   ← 20 sp, green ← I16: SAME SIZE as above
│                                        │
│  विश्वास: ७८%     सर्वोत्तम दिवस: १८ सप्टें │
│                                        │
│  ▸ खर्चाचा तपशील  (₹१२,४०० वजा केले)    │   ← tap → S10
│  ────────────────────────────────────  │
│  🔊 ऐका                                 │   ← voice, works offline
└────────────────────────────────────────┘
```

**The measurement you must actually take:** open the running app, screenshot S9, and confirm the worst-case number and best-case number are the same pixel height. Not "both look about right" — the same. If one is 20 sp and one is 14 sp, I16 is broken and the most important claim in the pitch is a lie in the UI.

### 1.7 The refusal screen — S9's other state

When the API returns `action: 'NO_ADVICE'`:

```
┌────────────────────────────────────────┐
│  टोमॅटो · नाशिक            [ARCHIVE]   │
│                                        │
│         ⚠  सल्ला नाही                   │   ← 28 sp
│                                        │
│  किंमतीचा अंदाज खूप अनिश्चित आहे.        │
│  चुकीचा सल्ला देण्यापेक्षा                │
│  आम्ही काहीच सांगत नाही.                 │
│                                        │
│  अंदाजाची रुंदी: ४२%  (मर्यादा: ३५%)    │
│                                        │
│  आजची किंमत: ₹१,४५०/क्विंटल              │   ← still give him the facts
└────────────────────────────────────────┘
```

**Design this screen with the same care as the HOLD card, not less.** It is demo beat 11 and it is the beat that wins the room. A refusal that looks like an error state reads as a bug; a refusal that looks deliberate reads as integrity. Same card chrome, same padding, same typography scale — the only difference is the icon and the colour.

### 1.8 Out of scope for you

Buyer screens · FPO console · admin · the Marathi dictionary itself · the voice clip generation · the ML model · any backend endpoint. If you find yourself writing Python, stop.

---

## PART 2 — TRD · How you build it

### 2.1 Stack, fixed

```
Expo (React Native)  ·  React Navigation  ·  TanStack Query  ·  React Context
victory-native (charts)  ·  expo-av (voice playback)  ·  AsyncStorage (offline cache)
TypeScript strict.  No Redux.  No axios — plain fetch.
```

### 2.2 One codebase, two navigators

```
App.tsx
 └─ QueryClientProvider
     └─ I18nProvider          (Shreya)
         └─ AuthProvider       (you)
             └─ RootNavigator
                 ├─ !token            → AuthStack       (S1, S2, S3)
                 ├─ role === 'FARMER' → FarmerNavigator (S4–S16)   ← yours
                 └─ role === 'BUYER'  → BuyerNavigator  (S17–S25)  ← Shreya's
```

The role comes from the JWT, not from a picker. One binary serves both users. `npx expo start --web` builds the same code for a browser — that is how the buyer console exists without a second project.

### 2.3 `lib/api.ts` — the only place fetch is called

```ts
const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const PREFIX = '/api/v1';

export class ApiError extends Error {
  constructor(readonly code: string, message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${PREFIX}${path}`, {
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

### 2.4 `lib/money.ts` — I1 lives here

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

export function formatPaise(paise: number, locale: 'mr' | 'en' = 'mr'): string {
  const rupees = Math.round(paise / 100);          // display only — never feed this back into arithmetic
  const grouped = groupIndian(Math.abs(rupees));
  const digits = locale === 'mr' ? grouped.replace(/\d/g, d => DEV[+d]) : grouped;
  return `${rupees < 0 ? '−' : ''}₹${digits}`;
}

/** kg -> quintals for display. 4000 kg -> "40" */
export function qtl(kg: number): number { return Math.round(kg / 100); }
```

**The test you must write first, before any screen:**

```ts
expect(formatPaise(629000, 'mr')).toBe('₹६,२९०');
expect(formatPaise(629000, 'en')).toBe('₹6,290');
expect(formatPaise(14200000, 'mr')).toBe('₹१,४२,०००');   // Indian grouping, not 142,000
expect(formatPaise(-480000, 'mr')).toBe('−₹४,८००');
```

That third case is the one that breaks if you use `toLocaleString('en-US')`. Indian grouping is not en-US grouping and a judge from Maharashtra will notice `₹142,000` instantly.

**The rule:** `formatPaise` is the *only* function in the app that divides by 100. If `/ 100` appears anywhere else in `app/src/`, that is a bug.

### 2.5 The four states — every screen, no exceptions

```tsx
export function Screen() {
  const { data, isLoading, error } = useQuery({ queryKey: ['x'], queryFn: fetchX });

  if (isLoading) return <Skeleton />;                    // not a spinner in the middle of a blank page
  if (error)     return <ErrorState error={error} onRetry={refetch} />;
  if (!data || data.items.length === 0) return <EmptyState />;
  return <Data data={data} />;
}
```

P8 is "every screen has all four". **The way you verify it is to stop the API and click through the entire app.** Not read the code — click it. A white screen during a demo is indistinguishable from a crash.

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

### 2.7 Charts — `components/charts/`

Two hard rules:

1. **Never render p50 without the p10–p90 band.** A point forecast with no interval is a guess with a chart, and shipping one contradicts the pitch. The `ForecastFan` component takes all three arrays or it does not render.
2. **The source badge is part of the chart, not next to it.** `ARCHIVE` / `IMPUTED` / `SYNTHETIC` from the `source_summary` field, rendered inside the chart frame. I8.

```tsx
<VictoryArea data={band} y0={d => d.p10} y={d => d.p90} style={{ data: { fillOpacity: 0.18 } }} />
<VictoryLine data={series} y={d => d.p50} />
```

### 2.8 Building before the API exists

Nilesh's `/window/recommend` will not be live when you start S9. That is expected and planned for. **Build against a fixture that matches the contract in `00_CANON.md` §7 exactly**, keep it in `app/src/fixtures/`, and flip one flag when the endpoint lands.

```ts
// app/src/fixtures/window.ts — shape must match 00_CANON §7 exactly
export const fxHold: WindowRes = {
  action: 'HOLD',
  hold_days: 12,
  best_day: '2026-09-18',
  expected_gain_paise: 629000,
  worst_case_paise: -480000,
  best_case_paise: 14200000,
  confidence_bps: 7800,
  band_width_bps: 1800,
  costs_paise: { transport: 560000, commission: 370000, storage: 210000, spoilage: 100000, total: 1240000 },
  refusal_reason: null,
  model_version: 'onion-v1',
  source_summary: { ARCHIVE: 1440, IMPUTED: 18, SYNTHETIC: 0 },
};
export const fxNoAdvice: WindowRes = { /* ... BAND_TOO_WIDE ... */ };
```

**Write `fxNoAdvice` at the same time as `fxHold`, not later.** The refusal state is not an edge case you handle at the end; it is a first-class screen and it is the demo's closing beat.

### 2.9 Your definition of done

1. Runs on a **real Android phone** over the local network — not just the simulator.
2. Marathi is the default. No bare English string on any farmer screen.
3. Every screen: loading, empty, error, data. Verified by stopping the API and clicking through.
4. `formatPaise` is the only `/ 100` in `app/src/`. Grep it.
5. S9's worst case and expected gain render at the same font size. Measured, not assumed.
6. No chart shows p50 without its band.
7. Airplane mode: S4 and S9 still render, with the stale banner.
8. `npx tsc --noEmit` clean. No `any`, no `@ts-ignore`.
9. Committed and pushed to `pranay`.

---

## PART 3 — Your tasks, in order

Do them in this order. Each one's "done when" is a test you perform, not a feeling.

| # | Task | Done when | Blocked by |
|---|---|---|---|
| **P0** | **Scaffold** — Expo app, TypeScript strict, navigation, `lib/api.ts`, `lib/money.ts` + its tests, the four-state pattern, fixtures | `npx expo start` opens; `formatPaise(629000,'mr') === '₹६,२९०'` passes | nothing |
| **P1** | **S1–S3** language picker, phone/OTP, profile | Can log in on a real phone and land on S4 | Akash A1 (fixture until then) |
| **P2** | **★ S4 Home** — today's price, source badge, one big CTA | Renders from `/prices/series`; badge shows the real source | Kartik K4 |
| **P3** | **★ S9 Verdict card** against the fixture, then the live endpoint | Matches §1.6 layout exactly | fixture, then Nilesh L5 |
| **P4** | **★★ I16 — worst case at the SAME font size as the expected gain** | Screenshot measured: both 20 sp | P3 |
| **P5** | **S10 Cost breakdown** — five lines + total, expandable | The five lines sum to the displayed total, verified by hand | P3 |
| **P6** | **S5 history + S7 forecast fan** with a shaded p10–p90 band | No point line renders without its band | Kartik K4, Nikhil N2 |
| **P7** | **S6 nearby mandis** — gross, transport, **net**, ordered by net | The gross-vs-net reordering is visible to the eye | Kartik K6 |
| **P8** | **Empty + loading + error on every screen** | API stopped → nothing shows a white screen | all of the above |
| **P9** | **S12 lots + S13 self-assay** — 6 questions → grade + tip | Grade renders; tip names the weakest dimension | Akash A5, A6 |
| **P10** | **★ S14 offers + counter — with the forecast above the input** | The forecast band is visibly above the counter-price box | Akash's offers endpoints |
| **P11** | **Offline** — `useOfflineQuery` + the stale banner on S4 and S9 | Airplane mode: both screens render with a timestamp | P2, P3 |
| **P12** | **S8 model card, S11 pledge card, S15 escrow timeline** | S11 is **absent** when the server returns no pledge (I13) | Nilesh L4, L6 |
| **P13** | Wire Shreya's `lib/voice.ts` into S9's 🔊 button | ₹6,290 plays in Marathi **in airplane mode** | Shreya SH5 |
| **P14** | **Demo rehearsal** — drive the golden path three times | You can do beats 1–11 without looking at notes | H33 |

**P0 through P4 are the critical path of the entire project's frontend.** If you get to H12 with S9 rendering correctly from a fixture and I16 honoured, everything after that is addition rather than risk.

### The order matters for one specific reason

You build S9 (P3) **before** the history chart (P6) and before lots (P9), even though S9 depends on the least-finished backend. That is deliberate: S9 against a fixture proves the layout, the money formatting, the Marathi numerals, and I16 all work — and those four things are shared by every other screen. Getting them right once, early, in the highest-stakes screen, means every subsequent screen inherits correct foundations.

Building the easy screens first and the verdict last is how teams discover at H30 that their money formatter drops the Indian grouping.

---

## PART 4 — What to do when you are blocked

1. **Is it in the contract** (`00_CANON.md` §7)? Then build against a fixture. The endpoint will catch up.
2. **Can you stub it in your own file?** Do that, mark `TODO(<name>):`, keep moving.
3. **Append to `docs/BLOCKERS.md`** and say it in the group chat. Both. Within 30 minutes.

**Never edit a file you do not own** — not `mr.json`, not `components/ui/`, not anything in `api/`. A one-line "obvious fix" in someone else's file costs more at merge time than the ten minutes it saved.

---

## PART 5 — On demo day

You **drive the phone**. Shreya narrates. You say nothing unless asked directly.

Your hands do not shake if your hands have done it three times. Rehearse the 11 beats in `11_DEMO_AND_PITCH.md` §1 until the sequence is muscle memory — especially the airplane-mode toggle (beat 7) and getting to the second crop for the refusal (beat 11).

**Before you start:** already logged in, Marathi selected, on the home screen, airplane mode off, brightness up, notifications silenced, phone above 50%. An OTP flow on stage is 40 seconds of nothing happening and one chance to typo.
