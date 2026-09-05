# 07 — FRONTEND ARCHITECTURE

> **Owners: Pranay (farmer app) + Shreya (buyer + shared UI + i18n + voice).**
> Pranay: `screens/farmer/**`, `components/farmer/**`, `components/charts/**`, `navigation/`, `lib/api.ts`, `lib/money.ts`.
> Shreya: `screens/buyer/**`, `screens/shared/**`, `components/ui/**`, `components/buyer/**`, `i18n/`, `context/`, `lib/voice.ts`, `assets/audio/**`.
> Read `01_PRD.md` §5 (screen inventory) and §6 (the hero mockup) first.

**The frontend is what judges see. Everything else is inference.** A perfect backend behind a screen that shows `undefined` scores zero.

**Your two hard invariants:**
- **Pranay:** worst case at the *same font size* as best case (F8). Not 20 and 14. Twenty and twenty.
- **Shreya:** zero English on any farmer screen in Marathi mode, and voice that works with wifi off.

---

## 1. One codebase, two apps

**Expo / React Native.** Native for the farmer, `expo start --web` for the buyer console. Same repo, same components, same API client.

```
app/
├─ App.tsx                       # providers: Query, Locale, Auth, Nav
├─ src/
│  ├─ navigation/
│  │  ├─ RootNavigator.tsx       # role-based branch. Pranay.
│  │  ├─ FarmerTabs.tsx          # Pranay
│  │  └─ BuyerTabs.tsx           # Shreya
│  ├─ screens/
│  │  ├─ farmer/                 # S1–S16   Pranay
│  │  ├─ buyer/                  # S17–S23  Shreya
│  │  └─ shared/                 # S24–S25  Shreya
│  ├─ components/
│  │  ├─ ui/                     # Button Card Badge Empty Skeleton ErrorState  Shreya
│  │  ├─ farmer/                 # VerdictCard CostBreakdown PledgeCard …  Pranay
│  │  ├─ charts/                 # PriceHistory ForecastFan  Pranay
│  │  └─ buyer/                  # MatchRow OfferThread  Shreya
│  ├─ lib/
│  │  ├─ api.ts                  # typed fetch + error envelope. Pranay.
│  │  ├─ money.ts                # formatPaise, Devanagari digits. Pranay.
│  │  ├─ voice.ts                # clip sequencing + TTS fallback. Shreya.
│  │  └─ offline.ts              # last-known-value cache. Pranay.
│  ├─ i18n/  { index.tsx, mr.json, en.json }        # Shreya
│  └─ context/ { AuthContext, LocaleContext }       # Shreya
└─ assets/audio/mr/*.mp3          # Shreya
```

**Role-based navigation, one root:**
```tsx
function RootNavigator() {
  const { user } = useAuth();
  if (!user) return <AuthStack />;
  return user.role === 'FARMER' ? <FarmerTabs /> : <BuyerTabs />;
}
```
No route guards to forget. A buyer cannot reach a farmer screen because the navigator was never mounted.

---

## 2. `lib/api.ts` — one client, typed, snake_case

The wire format is `snake_case` (CANON §4). **Do not alias to camelCase.** Reading `expected_gain_paise` in TSX is mildly ugly and eliminates an entire class of five-person drift bug.

```ts
const BASE = process.env.EXPO_PUBLIC_API_URL + '/api/v1';

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json',
               ...(token && { Authorization: `Bearer ${token}` }),
               ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error?.code ?? 'INTERNAL',
                       body?.error?.message ?? 'Something went wrong', res.status);
  }
  return res.json();
}
```

**Types mirror the contract exactly.** Write them once from CANON §7 and never hand-edit a response shape:
```ts
export type WindowRes = {
  action: 'SELL_NOW' | 'SELL_ELSEWHERE' | 'HOLD' | 'SPLIT' | 'NO_ADVICE';
  hold_days: number | null;
  sell_now_net_paise_per_qtl: number;
  hold_p50_net_paise_per_qtl: number | null;
  hold_p10_net_paise_per_qtl: number | null;
  expected_gain_paise: number | null;
  worst_case_paise: number | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  band_width_bps: number;
  refusal_reason: 'BAND_TOO_WIDE' | 'INSUFFICIENT_HISTORY' | 'STALE_DATA' | 'GAIN_BELOW_COST' | null;
  costs: CostBreakdown;
  pledge_quote: PledgeQuote | null;
  explain_mr: string; explain_en: string;
  // …
};
```

**TanStack Query for every server read.** Gives you `isLoading` / `isError` / cached data for free — which is three of the states in your definition of done. Local UI state stays in `useState`; auth and locale in Context. **No Redux.** There is no global mutable state in this app worth the ceremony.

---

## 3. `lib/money.ts` — paise in, Devanagari out (I1)

```ts
const DEV = ['०','१','२','३','४','५','६','७','८','९'];

export function formatPaise(paise: number, locale: 'mr' | 'en' = 'mr'): string {
  const rupees = Math.round(paise / 100);            // display only. never for arithmetic.
  const grouped = groupIndian(Math.abs(rupees));     // 62900 -> "62,900"
  const digits  = locale === 'mr'
    ? grouped.replace(/\d/g, d => DEV[+d])
    : grouped;
  return `${rupees < 0 ? '−' : ''}₹${digits}`;
}

export const qtlFromKg = (kg: number) => kg / 100;   // display only
```

Three rules:
1. **Paise → rupees happens only in this file, only for display.** Never send a rupee number back to the server.
2. **Indian grouping**, not `toLocaleString('en-US')`. ₹६२,९०० not ₹62.9K and not ₹6,29,00.
3. **Store kg, show quintals.** `40 क्विंटल`, never `4000 किलो`.

`formatPaise(6290000, 'mr')` → `"₹६२,९००"`. Write a unit test for that exact call.

---

## 4. ★ S9 — the verdict screen. The most important screen in the product.

Everything else exists to make this credible. Layout from `01_PRD.md` §6.

```
┌────────────────────────────────────────┐
│  कांदा · लासलगाव · ४० क्विंटल      🔊 │
├────────────────────────────────────────┤
│                                        │
│           ८ दिवस थांबा                 │   32px bold. the verdict.
│                                        │
│      अपेक्षित फायदा  + ₹६२,९००         │   28px, green
│                                        │
│  ┌──────────────┬──────────────────┐   │
│  │ चांगल्यास    │ वाईट झाल्यास     │   │
│  │ + ₹६२,९००    │ − ₹४८,०००        │   │  ← 20px BOTH. (F8)
│  └──────────────┴──────────────────┘   │
│                                        │
│  विश्वास: ●●●○  मध्यम                 │
│                                        │
│  ▸ खर्च वजा केल्यावर  (₹४,२५० )       │   tap -> S10
│  ▸ हा अंदाज कसा काढला                  │   tap -> model card
├────────────────────────────────────────┤
│  💰 थांबण्यासाठी पैसे हवे?             │   pledge, ONLY if worthwhile
│     ₹८४,०००  ·  व्याज ₹२,७६०           │
│     "सूचक अंदाज — कर्ज मंजुरी नाही"    │
└────────────────────────────────────────┘
```

### The five rules of this screen

1. **★ Worst case at the SAME font size as best case.** 20px both. Measure it in the inspector; do not eyeball it. This is the one visual decision that makes the honesty claim structural instead of rhetorical, and it is the thing to point at when a judge asks how you avoid over-promising.
2. **The verdict is words, not a number.** `८ दिवस थांबा` ("wait 8 days"), not `p50 = 1,89,300`. A farmer needs a decision.
3. **Costs are one tap away, never hidden.** `₹4,250` visible in the collapsed row; five lines on tap.
4. **The pledge card renders only when the server sent `pledge_quote != null`.** Do not compute worthwhileness client-side — the server already refused to send it (I13). Trust that.
5. **Confidence is dots, not a percentage.** `●●●○ मध्यम`. "78% confidence" means nothing to the user and invites a question you cannot answer precisely.

### And the NO_ADVICE state — a designed screen, not an error

```
┌────────────────────────────────────────┐
│  कांदा · लासलगाव · ४० क्विंटल      🔊 │
├────────────────────────────────────────┤
│              ⚠️                        │
│      आम्ही सल्ला देत नाही              │   28px
│                                        │
│  पुढील १४ दिवसांचा अंदाज खूप          │   18px, from explain_mr
│  अनिश्चित आहे. चुकीचा सल्ला            │
│  देण्यापेक्षा आम्ही सांगत नाही.         │
│                                        │
│  आजचा भाव: ₹१,८५० / क्विंटल            │   still useful
│  ▸ अनिश्चितता किती आहे                 │   tap -> the fan chart
└────────────────────────────────────────┘
```

**Not a red error toast. Not a spinner that never resolves.** Same card, same weight, same voice button. It must read as *the system chose this*, because it did.

**No pledge card here.** Never offer a loan to hold a crop you just declined to advise holding.

---

## 5. Charts — `components/charts/` (Pranay)

`victory-native`. Two charts, both non-negotiable in shape.

### `PriceHistory`
- 90 days of modal price, line + light min/max band
- **A source badge in the corner from `source_summary`** (I8). `ARCHIVE` → grey "संग्रहित माहिती". `SYNTHETIC` → orange "कृत्रिम माहिती". This badge is not optional.
- Arrivals as faint bars on a secondary axis if time permits — it visually explains *why* prices fell

### ★ `ForecastFan`
```
₹२,१००│                          ╱▔▔▔▔▔  p90
      │                    ╱▒▒▒▒▒▒▒▒▒▒
₹१,९००│              ╱▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  p50 (solid)
      │        ╱▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
₹१,७००│  ●───╱▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  p10
      └──┬────┬────┬────┬────┬────┬──
        आज   ३    ६    ९   १२   १४
```

**Never render the p50 line without the shaded p10–p90 band.** A point forecast with no interval is the exact thing we claim to be better than; drawing one, even for five minutes during development, is how it ends up in a screenshot on a slide.

A vertical marker at the recommended `hold_days` ties the chart to the verdict.

---

## 6. i18n — `i18n/` (Shreya)

Plain JSON + Context. **No i18n library** — a dependency for a dictionary lookup is not worth a lockfile conflict.

```tsx
export function useT() {
  const { locale } = useLocale();
  return (key: string, vars?: Record<string, string|number>) => {
    let s = (locale === 'mr' ? mr : en)[key] ?? key;
    for (const [k, v] of Object.entries(vars ?? {})) s = s.replace(`{${k}}`, String(v));
    return s;
  };
}
```

### Rules

1. **`t('key')` never returns English in Marathi mode.** A missing key returns the key itself, which looks broken in dev and is caught before the demo. Silent English fallback is *invisible* in dev and glaring on stage.
2. **Devanagari numerals everywhere a farmer sees a number.** ४० क्विंटल, ₹६२,९००, ८ दिवस.
3. **Marathi first, English second.** Write `mr.json` first, then translate to `en.json`. Building in English and translating later produces English sentence structure in Marathi words.
4. **Marathi strings are ~40% longer than English.** Every container wraps. Test the longest string on the smallest screen — this is the #1 source of demo-day layout breakage.
5. **The API sends `explain_mr` and `explain_en`.** Server-authored sentences are not translated client-side; pick the field by locale.

### The audit
```bash
grep -rnE '"[A-Z][a-z]+ [a-z]+' src/screens/farmer/ | grep -v t\(
```
Should return nothing. Run it at H29.

---

## 7. ★ Voice — `lib/voice.ts` + `assets/audio/` (Shreya)

**This is the access feature and it is a demo beat.** It must work with wifi off.

### The architecture — pre-generated clips, stitched at playback

```
OFFLINE (once, at H12, by Shreya)
  scripts/gen_tts.py  ──Sarvam TTS──►  assets/audio/mr/*.mp3  ──►  committed to git
════════════════════════════════════════════════════════════════════
RUNTIME (on the phone, no network)
  voice.speak(verdict)  ──►  clip list  ──►  expo-av sequential play
```

~40 phrase clips + digit/number-word clips. **Committed as mp3.** Total under 2 MB.

```ts
// ₹62,900 -> ['baasasht','hazaar','naushe','rupaye']
export function decomposeRupees(n: number): string[] { /* Marathi number words */ }

export async function speak(clips: string[]) {
  for (const c of clips) {
    const s = new Audio.Sound();
    await s.loadAsync(CLIPS[c]);              // bundled asset, no fetch
    await s.playAsync();
    await waitForFinish(s);
    await s.unloadAsync();
  }
}

export async function speakVerdict(v: WindowRes, t: TFn) {
  if (v.action === 'NO_ADVICE') return speak(['we_cannot_advise', 'too_uncertain']);
  await speak([
    'wait_for', ...decomposeDays(v.hold_days!), 'days',
    'expected_gain', ...decomposeRupees(v.expected_gain_paise! / 100), 'rupees',
    'worst_case',    ...decomposeRupees(Math.abs(v.worst_case_paise!) / 100), 'rupees_loss',
  ]);
}
```

### Rules

1. **Zero network calls at playback.** (I7) A TTS API call on stage over venue wifi is a guaranteed silence.
2. **`expo-speech` with `mr-IN` as fallback** if a clip is missing — degraded but audible.
3. **The voice says the worst case too.** If the audio only reads the gain, the audio is lying about the product. Same principle as F8.
4. **Airplane mode is the demo.** Turn wifi off on stage, tap 🔊, it speaks. That moment is worth more than three features.
5. **Generate the clips at H12, before sleep.** This is the last external network dependency in the project — finish it early. A missing clip at H31 has no fix.

### Voice IN — exactly one screen (A3)

Lot creation only. `expo-speech-recognition`, `mr-IN`, → **pre-fills the form** → **farmer confirms by tap**.

**Never silently commit on voice.** A misheard "40 quintal" becoming "14 quintal" in a posted lot is a real financial error. Speech is an input aid, not a decision.

---

## 8. ★ Offline — `lib/offline.ts` (A4, Pranay)

**Every server read caches its last successful response with a timestamp.**

```tsx
export function useOfflineQuery<T>(key: string, fn: () => Promise<T>) {
  const q = useQuery({ queryKey: [key], queryFn: fn, retry: 1 });
  const [cached, setCached] = useState<{data: T, at: number} | null>(null);

  useEffect(() => { if (q.data) {
    const rec = { data: q.data, at: Date.now() };
    AsyncStorage.setItem(`cache:${key}`, JSON.stringify(rec)); setCached(rec);
  }}, [q.data]);

  useEffect(() => { if (q.isError && !cached)
    AsyncStorage.getItem(`cache:${key}`).then(r => r && setCached(JSON.parse(r)));
  }, [q.isError]);

  return { data: q.data ?? cached?.data, isStale: !q.data && !!cached,
           staleAt: cached?.at, isLoading: q.isLoading && !cached, error: q.error };
}
```

**When `isStale`, a banner sits at the top of the screen:**
```
┌──────────────────────────────────────────┐
│ 📴  काल दुपारी ३ वाजताची माहिती          │
└──────────────────────────────────────────┘
```

**The timestamp is the whole feature.** "Yesterday at 3pm" lets a farmer decide whether to trust it. A silent stale number is worse than an error, because he cannot tell it is stale. Never show a stale price without saying when it is from.

**No spinner-of-death.** If the network fails and a cache exists, show the cache plus the banner. If neither exists, show `<Empty>` with a retry button.

---

## 9. Every screen needs four states

This is a **hard requirement**, not polish. A judge clicks the second thing, and the second thing is usually empty.

```tsx
if (isLoading) return <Skeleton />;                      // shaped like the content
if (error)     return <ErrorState onRetry={refetch} />;  // Marathi message + retry
if (!data?.length) return <Empty
      title={t('no_lots_yet')} cta={t('create_first_lot')} onPress={goCreate} />;
return <Content data={data} isStale={isStale} staleAt={staleAt} />;
```

**The audit, at H29: turn the API off and click every screen.** Every white screen you find is a 10-minute fix and a demo you did not lose.

`<Empty>` always has a **CTA**, never just "no data". An empty lots list says "तुमचा पहिला माल नोंदवा" with a button.

---

## 10. Screen ownership

### Pranay — farmer, S1–S16
| # | Screen | Priority |
|---|---|---|
| S1 | Language picker (मराठी / English) | P0 |
| S2 | Phone + OTP | P0 |
| S3 | Profile setup | P0 |
| S4 | **Home** — today's price, source badge, one big CTA | **P0** |
| S5 | Price history chart | P0 |
| S6 | **Nearby mandis — net-of-transport, reordered** | **P0** |
| S7 | **Forecast fan** | **P0** |
| S8 | Model card (plain-language) | P1 |
| S9 | **★★ VERDICT** | **P0 — the product** |
| S10 | **Cost breakdown** | **P0** |
| S11 | **Pledge card** | P0 |
| S12 | Create lot (+ voice input) | P0 |
| S13 | Assay — 6 questions → grade + tip | P0 |
| S14 | **★★ Counter-offer, with the forecast beside the input** | **P0** |
| S15 | My lots / my offers | P1 |
| S16 | FPO split (read-only) | P1 |

### Shreya — buyer + shared, S17–S25
| # | Screen | Priority |
|---|---|---|
| S17 | Buyer login | P0 |
| S18 | Post demand | P0 |
| S19 | **Matches — incl. COMBINATION rows with `why_*`** | **P0** |
| S20 | Lot detail (photo, grade, assay) | P1 |
| S21 | **Offer thread — both directions** | **P0** |
| S22 | Transaction timeline (escrow events) | P1 |
| S23 | Buyer reliability | P2 |
| S24 | **★ Data provenance** | **P0 — the honesty screen** |
| S25 | Dispute | P1 |

---

## 11. ★★ S14 — the counter screen. The middleman-removal beat.

```
┌────────────────────────────────────────┐
│  पुणे व्यापारी यांची ऑफर               │
│                                        │
│      ₹१,९०० / क्विंटल                  │   24px
│      ४० क्विंटल = ₹७६,०००              │
├────────────────────────────────────────┤
│  तुमचा अंदाज                           │   ← the forecast, RIGHT HERE
│  ₹१,८५०│    ╱▒▒▒▒▒▒▒▒▒▒▒               │
│         │  ╱▒▒▒▒ ८ दिवसांत ₹२,०१०      │
│         └────────────────────           │
├────────────────────────────────────────┤
│  तुमची किंमत सांगा                     │
│      ┌──────────────────┐              │
│      │  ₹ २,०००         │              │
│      └──────────────────┘              │
│  [ ऑफर पाठवा ]     फेरी १/३            │
└────────────────────────────────────────┘
```

**The forecast sits directly above the input. That is the entire feature.** The farmer is not guessing against a trader who knows more than he does — he is negotiating with a number, on his phone, with no one in between.

Show `फेरी १/३` (round 1 of 3). At round 3, disable the input and explain why — do not let the user hit a 409 they cannot interpret.

---

## 12. Definition of done — frontend

### Pranay
1. `formatPaise(6290000,'mr') === '₹६२,९००'` — unit tested.
2. **S9 worst case and best case are the same font size.** Verified in the inspector.
3. Forecast chart **never** renders p50 without the p10–p90 band.
4. Pledge card renders **only** when `pledge_quote != null`.
5. `/prices/nearby` reordering is visible — the net column explains the order.
6. **Offline: wifi off → stale banner with a timestamp, no white screen, no infinite spinner.**
7. Every farmer screen has loading + empty + error, verified with the API off.
8. NO_ADVICE renders as a designed card, not an error toast.
9. Counter screen shows the forecast beside the input and the round count.

### Shreya
1. **`locale='mr'` → zero English on any farmer screen.** Grep-verified.
2. **Voice reads the verdict, including the worst case, in airplane mode.**
3. All `components/ui/*` shipped and consumed by Pranay — no duplicate Buttons.
4. Buyer can post a demand, see matches with `why_mr`, and negotiate both directions.
5. S24 provenance numbers match `/meta/data-provenance` exactly.
6. Longest Marathi string in every container does not clip on the smallest test screen.

---

## 13. Phase 2 (not now)

| Item | Why later |
|---|---|
| Second frontend (separate Next.js buyer web) | ~4 hours to duplicate the API client and auth for zero demo gain. `expo start --web` is the same product. |
| Push notifications ("your price target was hit") | Genuinely valuable; needs a device-token backend + FCM. |
| Full offline mutation queue | Reads offline is the credible claim. Queued writes need conflict resolution. |
| More languages (Hindi, Marwari) | The architecture already supports it — add a JSON file. |
| Real generative voice assistant | See `05_AI_ARCHITECTURE.md` §9. A hallucinating advisor inverts the thesis. |
| Skeleton-perfect animation polish | Nobody scored a hackathon on easing curves. |
| Accessibility audit (screen readers, contrast) | Should happen; will not happen in 36 hours. Say so if asked. |
