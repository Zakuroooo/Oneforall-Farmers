# SHREYA — Marathi, Voice, Buyer Console, Pitch

> **You own how this product speaks.** Every word a farmer reads, every word he hears, and every word a judge hears from the stage.
> This file is your PRD, your TRD, and your task list. Read it, then `docs/architecture/07_FRONTEND_ARCHITECTURE.md`, then **all** of `11_DEMO_AND_PITCH.md`. Then start on SH0.

**Your task IDs are SH1–SH8.** Not S1–S8 — those are screen IDs and you would collide with Pranay's screens.

---

## PART 1 — PRD · What you are building and why

### 1.1 Your mission in one sentence

**Make the product speak Marathi, out loud, offline — and then make it speak to judges.** Pranay builds the screens; you supply the language, the voice, and the shared components those screens are made of. Then you narrate the demo.

### 1.2 Why this is not "the translation task"

Read Pranay's §1.2. The user is a Nashik onion farmer who **may not read English at all** and may read Marathi slowly. For him:

- **Marathi is not a setting.** It is the default, and English is the option.
- **₹6,290 is not a number he reads.** ₹६,२९० is.
- **🔊 is not an accessibility feature.** It is the primary interface for a farmer who cannot read the verdict card at all.

A team that ships an English app with a Marathi toggle has built a product for the judges. A team that ships Marathi-first with a working voice button has built a product for the user. **The judges can tell the difference, and one of them is from Maharashtra.**

### 1.3 ★ The voice button is your headline feature

Demo beat 6 (`11_DEMO_AND_PITCH.md` §1): Pranay taps 🔊 on the verdict card and the phone says, in Marathi:

> *"थांबा. अकरा दिवस. अपेक्षित फायदा सहा हजार दोनशे नव्वद रुपये."*
> *(Wait. Eleven days. Expected gain six thousand two hundred ninety rupees.)*

Then beat 7: **airplane mode on, tap it again, it still speaks.**

That second part is the whole point. A cloud TTS call is a demo that fails on venue wifi (I7). **Pre-generated mp3 clips committed to the repo, sequenced by `react-native-sound`, work in a Faraday cage.** Which is roughly what a hackathon venue is.

### 1.4 The number-speaking problem — read this before you write any code

You cannot pre-generate a clip for every possible rupee amount. ₹6,290 is one of millions.

**So decompose the number into clips you do have:**

```
629000 paise  →  ₹6,290  →  ["सहा", "हजार", "दोनशे", "नव्वद", "रुपये"]
                              (six)(thousand)(two hundred)(ninety)(rupees)
```

You need a clip set of roughly:
- **0–99** in Marathi (Marathi numerals are irregular below 100 — नव्वद for 90 is not composable from nine and ten, so record all of them)
- **शंभर / हजार / लाख** (hundred / thousand / lakh)
- **१००–९००** as शंभर-multiples (दोनशे = two hundred)
- **रुपये, क्विंटल, दिवस, टक्के** (rupees, quintal, days, percent)
- The ~40 phrase clips (see SH4)

**Test with the ugly numbers, not the round ones.** ₹1,00,000 is easy. Test **₹6,290** (the demo figure), **₹1,42,000** (an FPO pooled-lot total — the first figure that needs लाख), and **−₹4,800** (the worst case, needs a leading "उणे"/loss word). If the worst case cannot be spoken, I16 is broken in the audio channel even if it is fine on screen.

### 1.5 What you own

| | |
|---|---|
| **Language** | `app/messages/mr.json`, `app/messages/en.json`, `app/src/lib/i18n.tsx` |
| **Voice** | `app/src/lib/voice.ts`, `scripts/gen_tts.py`, `app/assets/audio/**` (the committed clips) |
| **Shared UI** | `app/src/components/ui/**` — Button, Card, Badge, Skeleton, EmptyState, ErrorState |
| **Screens** | **S17–S25** — buyer login, post demand, matches, offer/counter, escrow, **S24 provenance** |
| **Pitch** | `docs/deck/**`, the narration, the H32 backup recording |
| **Not yours** | Every farmer screen S1–S16 (Pranay) · everything in `api/` |

**`components/ui/**` is the highest-leverage thing you own.** Pranay imports it and does not edit it. If `<Card>` and `<Button>` land in his hands in the first three hours, he never re-implements them, and the farmer app and buyer console look like one product instead of two.

**Ship those six components before you write a single buyer screen.** Pranay is blocked on them; the buyer console is not blocked on anything.

### 1.6 The buyer console — S17–S25

The buyer runs on **the same binary**. JWT `role === 'BUYER'` selects `BuyerNavigator` at the root of `App.tsx`. There is no separate buyer project and **no web build** — React Native CLI has no web target. On stage the buyer is a **second Android device running the identical APK**, logged in with a buyer phone number. Two phones side by side is also a clearer picture for a judge than a phone plus a browser tab.

| ID | Screen | Must do | Priority |
|---|---|---|---|
| **S17** | Buyer login | Phone + OTP → `role: 'BUYER'` → BuyerNavigator | **P0** |
| **S18** | Post demand | Commodity, qty, grade, price ceiling, delivery date | **P0** |
| **S19** | **★ Matches** | Ranked lots **including COMBINATION bundles** — 3 lots making up 100 qtl | **P0** |
| **S20** | Lot detail | Grade, assay answers, photo, farmer's district | P1 |
| **S21** | **★ Make offer / counter** | The other side of Pranay's S14 | **P0** |
| **S22** | Escrow timeline | Buyer's view of the FSM | P1 |
| **S23** | Ledger view | Hash chain + `chain_valid` | P2 |
| **S24** | **★ Provenance** | Row counts by source, date range, **the live source URL** | **P0** |

**S24 is not an admin page.** It is demo beat 2 and it is the screen that makes every other number credible. It reads Kartik's `/meta/data-provenance` and renders the honest breakdown — including a non-zero `SYNTHETIC` count if that is the truth. Build it to display whatever the endpoint returns, never a curated subset.

### 1.7 The pitch — you are the voice on stage

You narrate all **11 beats**. Pranay drives the phone silently. You take **questions 8, 10, and 11**.

Three rules from `11_DEMO_AND_PITCH.md` §3:
1. **Every external number on a slide has a source on the same slide.** No exceptions, no "we can cite that if asked."
2. **Nine slides.** Not fourteen.
3. **Beat 11 — the refusal — is never cut**, no matter how far behind on time you are. It is the beat that wins the room.

---

## PART 2 — TRD · How you build it

### 2.1 i18n — plain JSON, no library

```tsx
// app/src/lib/i18n.tsx
import mr from '../../messages/mr.json';
import en from '../../messages/en.json';

type Locale = 'mr' | 'en';
const DICT = { mr, en } as const;

const Ctx = createContext<{ t: (k: string) => string; locale: Locale; setLocale: (l: Locale) => void }>(null!);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('mr');        // <- Marathi is the DEFAULT
  const t = useCallback((k: string) => DICT[locale][k] ?? `⟨${k}⟩`, [locale]);
  return <Ctx.Provider value={{ t, locale, setLocale }}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);
```

**`useState<Locale>('mr')`** — Marathi is the initial value, not a fallback. Persist the user's choice to AsyncStorage after S1, and read it back on launch.

**`?? \`⟨${k}⟩\`` is deliberate.** A missing key renders `⟨verdict.hold⟩` in angle brackets, which is *visible* during development. Falling back to English hides the gap until demo day, and then a judge sees one English word in the middle of a Marathi screen.

### 2.2 The Devanagari numeral rule

Pranay's `formatPaise()` handles rupee amounts. **Every other number a farmer sees is yours** — day counts, percentages, quintals, dates.

```ts
const DEV = ['०','१','२','३','४','५','६','७','८','९'];
export const devNum = (n: number | string) => String(n).replace(/\d/g, d => DEV[+d]);
```

`१२ दिवस` not `12 दिवस`. `७८%` not `78%`. `१८ सप्टेंबर` not `18 सप्टेंबर`. A Marathi screen with Latin digits is the most common half-done localisation and it looks exactly as half-done as it is.

### 2.3 ★ `scripts/gen_tts.py` — generate the clips once, offline

```python
# scripts/gen_tts.py
"""Generates Marathi mp3 clips into app/assets/audio/. Run ONCE, commit the output.
This script is developer tooling — it is NEVER called at runtime (I7)."""

PHRASES = {
    'hold':        'थांबा',
    'sell_now':    'आज विका',
    'sell_else':   'दुसऱ्या बाजारात विका',
    'split':       'अर्धा आज विका',
    'no_advice':   'सल्ला नाही',
    'days':        'दिवस',
    'exp_gain':    'अपेक्षित फायदा',
    'worst_case':  'सर्वात वाईट स्थिती',
    'rupees':      'रुपये',
    'quintal':     'क्विंटल',
    'thousand':    'हजार',
    'lakh':        'लाख',
    'minus':       'उणे',
    # ... ~40 total
}
NUMBERS = {n: marathi_word(n) for n in range(0, 100)}
HUNDREDS = {n: marathi_hundred(n) for n in range(1, 10)}   # शंभर, दोनशे, ... नऊशे
```

Use any TTS you like to generate them — **the generation is offline and the choice does not matter to the product.** What matters is that the mp3s are committed and the runtime only reads files.

Keep clips short and trimmed. Leading silence is what makes a sequenced sentence sound broken.

### 2.4 `lib/voice.ts` — decompose, then sequence

```ts
// app/src/lib/voice.ts
import Sound from 'react-native-sound';
import Tts from 'react-native-tts';

/** 629000 paise -> ['saha','hazar','donshe','navvad','rupaye'] */
export function decomposeRupees(paise: number): string[] { ... }

function play(clip: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // CLIPS is a STATIC require map — see the note below.
    const s = new Sound(CLIPS[clip], (err) => {
      if (err) return reject(err);
      s.play(() => { s.release(); resolve(); });
    });
  });
}

export async function speak(clips: string[]): Promise<void> {
  for (const c of clips) await play(c);          // sequential; concurrent playback overlaps
}

export async function speakVerdict(w: WindowRes, t: TFn): Promise<void> {
  const clips = [w.action.toLowerCase(), ...];   // action, days, gain, then the worst case
  try { await speak(clips); }
  catch { Tts.setDefaultLanguage('mr-IN'); Tts.speak(verdictText(w, t)); }   // fallback
}
```

**`react-native-tts` is the fallback, not the primary.** It depends on the device's installed Marathi voice, which a ₹7,000 Android may not have — so it fails silently on exactly the phone we are building for. The mp3 path must be the one that runs.

`Sound.setCategory('Playback')` once at app start, or Android will duck your clips under the ringer volume instead of the media volume.

The clip map must be a **static `require` object**, not a dynamic path string. Metro bundles what it can see statically; `require(\`./audio/${name}.mp3\`)` resolves to nothing at runtime and you will find out on the phone, not in the simulator.

### 2.5 ★★ Test the voice in airplane mode, on the phone, at hour 20

Not at hour 34.

```
1. Build to a real Android device
2. Airplane mode ON
3. Open S9 (Pranay's verdict card)
4. Tap 🔊
5. It must say: थांबा · अकरा दिवस · अपेक्षित फायदा · सहा हजार दोनशे नव्वद रुपये
6. Then tap through to the worst case and confirm −₹4,800 speaks too
```

If this fails at H20 you have sixteen hours to fix it. If you first try it at H34, beat 7 comes out of the demo and the offline claim comes off the slide.

### 2.6 `components/ui/` — six components, then stop

```
Button   variants: primary | secondary | ghost.  Minimum 56 px tall (one hand, in a field).
Card     the chrome S9 and S24 share.  Same padding, same radius, same shadow.
Badge    ARCHIVE | IMPUTED | SYNTHETIC | grade A/B/C.  Colour-coded, text-labelled.
Skeleton the loading state.  Shaped like the content, not a spinner.
EmptyState    icon + Marathi line + optional CTA.
ErrorState    Marathi message + retry button.  Never an English exception string.
```

**56 px minimum touch target.** A farmer with one free hand in sunlight is not hitting a 32 px button.

**No seventh component.** Six covers every screen in the app; a component library nobody asked for is time spent not shipping S24.

### 2.7 ErrorState — never leak an English exception

```tsx
<Text>{t('error.generic')}</Text>       // "काहीतरी चूक झाली. पुन्हा प्रयत्न करा."
```

Never `{error.message}`. A backend `AppError` message is English and a raw fetch failure is `Network request failed`. Map the `code` to a Marathi string; fall back to `error.generic` for anything unmapped.

### 2.8 Your definition of done

1. `mr.json` covers **every** farmer screen. Grep any farmer screen for a bare English string → **zero hits**.
2. All numbers a farmer sees are in Devanagari. Days, percents, dates, quintals.
3. Six `components/ui/` components, done by H8, and Pranay is importing them.
4. **🔊 speaks ₹6,290 in Marathi in airplane mode on a real Android phone.** Tested at H20.
5. The worst case (−₹4,800) speaks too, with the loss word.
6. S17, S18, S19 (incl. COMBINATION), S21, S24 work against seeded data.
7. **S24 shows whatever `/meta/data-provenance` returns** — including a non-zero SYNTHETIC count.
8. Nine slides, every external number sourced on its own slide.
9. **The H32 backup recording exists** — full golden path, screen-recorded, on two devices.
10. Pushed to `shreya`.

---

## PART 3 — Your tasks, in order

| # | Task | Done when | Blocked by |
|---|---|---|---|
| **SH0** | **★ `components/ui/` — six components + `i18n.tsx`** | Pranay imports `<Card>` and `<Button>` and deletes his local copies | nothing |
| **SH1** | **`mr.json` + `en.json`** for every farmer screen, Devanagari numerals | Zero bare English strings on any farmer screen | Pranay's key requests |
| **SH2** | **★ `scripts/gen_tts.py`** — ~40 phrases + 0–99 + hundreds + units | Clips generated **and committed** under `app/assets/audio/` | nothing |
| **SH3** | **★★ `lib/voice.ts`** — decompose + sequence + `react-native-tts` fallback | ₹6,290 speaks correctly from clips | SH2 |
| **SH4** | **★★ Airplane-mode test on a real phone, at H20** | 🔊 works with no network, worst case included | SH3, Pranay P3 |
| **SH5** | **S17 login + S18 post demand** | A buyer logs in and posts a 100 qtl demand | Akash A1, A7 |
| **SH6** | **★ S19 matches incl. COMBINATION + S21 offer/counter** | A 100 qtl demand shows a 3-lot bundle; a counter round-trips | Akash A7, A8 |
| **SH7** | **★ S24 provenance** | Renders `/meta/data-provenance` verbatim, source URL tappable | Kartik K7 |
| **SH8** | **Deck (9 slides) + narration + H32 recording** | Three full rehearsals done; recording on two devices | H32 |
| **SH9** | **`hi.json` — Hindi as a third locale** | Picker shows मराठी / हिंदी / English; all three files complete, no missing keys | SH1 |
| **SH10** | **S27 buyer chat** *(if time)* | Buyer replies to a farmer; the thread renders on both devices | Akash A14, Pranay P15 |

**Two notes on SH9 and SH10, because they are new and the scope is easy to over-read:**

- **SH9 is text only.** Three JSON files and one more option in the picker. **There are no Hindi voice clips** — the clip set is Marathi and tripling it is not affordable in 36 hours. When a judge asks, the honest sentence is *"text is Marathi, Hindi and English; voice is Marathi, because we recorded a real clip set rather than shipping a cloud TTS call that dies on venue wifi."* That answer is stronger than a claim of three-language audio you cannot demonstrate offline.
- **SH10 is the last thing on this list for a reason.** It depends on two other people's tasks landing (A14 and P15) and it is **not on the golden path** — no demo beat fails without it. If H30 arrives and the farmer side is half-built, ship the farmer side read-only and cut the buyer reply. See `docs/PLAN.md` §9.

**SH0 blocks Pranay and nothing blocks SH0.** Do it first, in the first three hours, before you look at a buyer screen. Every hour Pranay spends hand-rolling a Button is an hour not spent on S9.

### Why SH4 is at H20 and not H30

The airplane-mode voice test is the single most likely thing on this list to fail for a reason you cannot fix in an hour — a missing clip, a Metro bundling issue with the audio require map, a device without an mp3 codec you expected. **Discovering that at H20 leaves time. Discovering it at H34 removes beat 7 from the demo and a claim from the deck.**

### The H32 recording is insurance you will probably not need

Record the full golden path — all 11 beats, working, on the real phone against the real EC2 box — at H32. Put it on two devices. It is fallback rung 4 (`11_DEMO_AND_PITCH.md` §5).

If everything works you never play it. If the venue wifi dies at 9:58 you still have a demo, and **that is the difference between presenting and apologising.**

---

## PART 4 — Blocked?

1. Pranay needs a string you have not written? He is instructed to put English inline with `TODO(shreya):` and file a blocker. **Grep for `TODO(shreya)` before every push** — that is your queue.
2. No buyer endpoint yet? Build S18/S19 against a fixture matching `00_CANON.md` §7, same as Pranay does.
3. No provenance endpoint? Fixture it, then swap. **Never hardcode the numbers into the slide** — they must come from the endpoint at demo time.
4. Otherwise: `docs/BLOCKERS.md` + group chat, within 30 minutes.

**Do not edit any farmer screen.** If S9's layout needs a text change, tell Pranay. You own the words, he owns the pixels.

---

## PART 5 — On demo day

**You talk. Pranay taps. Nobody else speaks unless asked a question they own.**

You take **question 8** (*"what about smartphone penetration / literacy?"*), **question 10** (*"what's your business model?"*), and **question 11** (*"what's not built yet?"*).

Question 11 is the one most teams fumble, and the correct answer is a list, delivered without defensiveness:

> *"Realisation tracking — comparing our advice to what the farmer actually got — is Phase 2 and it's the thing that turns this from advice into evidence. Payments are simulated, not integrated. Two commodities, six markets. And the model card lists what the forecast can't do, including policy shocks."*

**Naming the gaps is what makes the rest credible.** A team that claims everything works has told the panel nothing they can believe.

Have ready:
- The 90-second pre-flight checklist run (`11_DEMO_AND_PITCH.md` §6)
- The H32 recording, on two devices, cued to beat 1
- The nine slides, with every source visible
- The closing line, memorised

**Beat 11 is your closing beat.** After the refusal renders, stop talking. Let it sit for two seconds. That silence does more work than any sentence you could add.
