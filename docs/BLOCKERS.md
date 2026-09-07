# BLOCKERS

**Append-only. Never edit or delete someone else's entry.** Add yours at the bottom.

This file is the *record*. The group chat is the *alert*. **Both, always, within 30 minutes** of getting stuck.
A blocker nobody declared is the most expensive object in this repository.

---

## How to use this file

1. **You are blocked when you cannot make your next commit without someone else's change.** Not when something is annoying — when you are *stopped*.
2. **Do not edit a file you do not own** to unblock yourself. Not even a one-line fix. Not even if it is obviously wrong. Ownership is in `CLAUDE.md` §4.
3. **Stub it in your own file** with `TODO(<name>):` and keep moving. A stub plus a blocker is thirty seconds. A cross-lane edit is a rebase conflict at H30.
4. **Grep for your own name before every push:**
   ```bash
   grep -rn "TODO(nilesh)" api/ app/ ingest/     # substitute your name
   ```
   That grep is your inbox. Everyone's queue is somebody else's `TODO(you):`.
5. **Resolve by appending a `RESOLVED` line to your own entry.** Do not delete the entry — the history of what blocked whom is how we answer *"how did you coordinate?"* on demo day.

---

## Format — copy this block

```markdown
### [Requester → Owner] CATEGORY: one-line summary
- **What I need:** the specific change, in one sentence.
- **Why:** what breaks without it.
- **Blocking:** your task IDs, and the demo beat if any.
- **Workaround in place:** what you stubbed so you could keep moving.
- **Raised:** H<n>
- **RESOLVED:** H<n> — <what landed> (added by the owner)
```

`CATEGORY` ∈ `CONTRACT` · `SCHEMA` · `DATA` · `INFRA` · `DECISION` · `BUG`

Names are the six: **Akash · Kartik · Nikhil · Nilesh · Pranay · Shreya**.

---

## Who owns what — so you address the blocker to the right person

| Owner | Lane | Their files |
|---|---|---|
| **Akash** | **Backend — lead** | `api/app/main.py`, `deps.py`, `models.py`, `schemas.py`, `routers/**` (except `window`, `prices`, `meta`), `domain/{grading,matching,split,escrow,ledger}.py`, `alembic/**` |
| **Kartik** | **Data + DevOps, then backend support to Akash** | `ingest/**`, `api/seed/{00_reference,10_prices}.py`, `api/app/routers/{prices,meta}.py`, `docker-compose.yml`, `nginx/**`, `infra/**`, `scripts/**`, `.env.example` |
| **Nikhil** | **Forecasting (model training)** | `api/app/ml/**` and the committed model pickles |
| **Nilesh** | **Decision engine (model training)** | `api/app/domain/{decide,costs,pledge}.py`, `api/app/config.py`, `api/app/routers/{window,ai}.py` |
| **Pranay** | **Frontend — lead.** Farmer app | `app/src/screens/farmer/**`, `app/src/components/{farmer,charts}/**`, `app/src/lib/{api,money,offline}.ts`, `app/src/config.ts`, `app/App.tsx`, the navigators, **`app/android/**` and `app/ios/**`** |
| **Shreya** | **Frontend.** Buyer console + language | `app/src/screens/buyer/**`, `app/src/components/ui/**`, `app/src/lib/{i18n,voice}.ts`, `app/messages/**`, `app/assets/audio/**`, `scripts/gen_tts.py`, `docs/deck/**` |

**Two things about this table that changed and that people get wrong:**

- **Kartik's lane is data and deploy *first*.** He does not start backend support until K1 (the data gate, H4) and K9 (the deploy rehearsal, H28) are behind him. If Akash is blocked at H6 and Kartik is still scraping, the answer is a fixture, not Kartik.
- **`app/android/` is Pranay's**, and it is checked into git — React Native CLI commits the native projects where Expo did not. A Gradle or manifest change is a change everyone pulls, so it gets announced in the group chat. This is also why Shreya's audio bugs land on Pranay's desk first: the require map and `Sound.setCategory` live on his side of the line.

**Contract questions go to the contract, not to a person.** `docs/architecture/00_CANON.md` is authoritative: *"if another doc contradicts this one, this one wins."* If a role doc disagrees with CANON, CANON is right and the role doc is a bug — file it here.

---

## Open

### [Pranay → Nilesh] ★ CONTRACT: `alt_market` has no defined populated shape
- **What I need:** the keys `alt_market` carries when `action === 'SELL_ELSEWHERE'`.
- **Why:** `00_CANON.md` §7.4 shows the field **only as `null`**. The DB has `alt_market_id text references markets(id)` (CANON §6), and `NILESH.md` line 35 says `# AltMarket | null (set on SELL_ELSEWHERE)` — but `AltMarket` is defined nowhere. SELL_ELSEWHERE is one of five actions the hero endpoint can return; if a judge taps the Pune row and the card renders `undefined`, that is the hero endpoint failing live.
- **Blocking:** P5 (the S9 verdict card), and any demo beat that shows SELL_ELSEWHERE.
- **Workaround in place:** `app/src/types/api.ts` defines a minimal `AltMarket` — `{market_id, name_mr, net_paise_per_qtl, distance_km}` — carrying a `TODO(nilesh):`, and `fixtures/window.ts` has `fxSellElsewhere` populating it from CANON §7.3's `/prices/nearby` example (mkt_pune / पुणे / 195730 / 168 km) so the gap is visible to the type checker rather than discovered on stage. **If your shape differs, mine is the one that changes** — tell me and I will change it.
- **Raised:** H0

### [Pranay → Nilesh] ★ BUG: CANON §7.4's pledge `interest_paise` is 10× its own formula
- **What I need:** confirmation of which is right, and a correction to whichever is wrong.
- **Why:** CANON §7.4's example response prints `interest_paise: 92200` (₹922). CANON §8's formula, on the same numbers, gives:
  ```
  interest = loan_paise * rate_bps_annual * days // (10000 * 365)
           = 3400000 * 900 * 11 // 3650000
           = 9221                                        # ₹92, not ₹922
  ```
  This is the same class of error as the ₹62,900 → ₹6,290 bug caught before H0, in the same document, one section apart. ₹92 of interest to unlock ₹6,290 of gain is a sentence a judge will hear and check.
- **Blocking:** nothing hard — `is_worthwhile` is `true` either way (629000 > 9221 > and > 92200), so beat 9 survives on either number. It is the **narrated figure** that is at risk.
- **Workaround in place:** the fixture uses **9221**, the formula's answer, on the grounds that the formula is what ships and the example is prose. Documented inline in `fixtures/window.ts`.
- **Raised:** H0

### [Pranay → Shreya] CONTRACT: I need `Skeleton`, `ErrorState`, `EmptyState` from SH2
- **What I need:** `app/src/components/ui/{Skeleton,ErrorState,EmptyState}.tsx`, and their prop signatures whenever you have them — I will import against the signature before the file exists.
- **Why:** CLAUDE.md §5 requires four states per screen and `components/ui/**` is your lane, so I cannot create them. Building fifteen happy-path screens now and retrofitting three states each at H26 is how the states end up missing.
- **Blocking:** nothing yet — soft-blocks the polish pass on P4–P16.
- **Workaround in place:** `app/src/components/farmer/States.tsx`, deliberately un-styled and marked `TODO(shreya):`. Delete it when SH2 lands; it is one import line per screen. **One constraint from my side:** `NO_ADVICE` is a 200 with a body and must never route through `ErrorState` — a refusal that renders as a crash with a retry button is the opposite of I6.
- **Raised:** H0

### [Pranay → everyone] BUG: `CLAUDE.md` §1 gives the hero endpoint path without `/ai`
- **What I need:** nothing from anyone — recording it so nobody builds against the wrong path.
- **Why:** `CLAUDE.md` §1 writes the hero as `POST /api/v1/window/recommend`. `00_CANON.md` §7.4 has it at **`POST /api/v1/ai/window/recommend`**. CANON wins by its own precedence rule. A 404 on the hero endpoint at beat 8 would take the demo apart, and it would look like the server was down rather than like a path typo.
- **Blocking:** nothing — caught before either side was written.
- **Workaround in place:** `app/src/lib/api.ts` calls `/ai/window/recommend` and says why in a comment. **Nilesh: mount the router at `/ai`.** `NILESH.md` already lists `routers/ai.py`, so this is a doc bug, not a design disagreement.
- **Raised:** H0

### [Pranay → Shreya] DECISION: auth state landed in `lib/auth.tsx`, not `context/AuthContext`
- **What I need:** nothing — recording a lane decision I made unilaterally so you can reverse it cheaply.
- **Why:** `07_FRONTEND_ARCHITECTURE.md` §1 lists `src/context/{AuthContext, LocaleContext}` under your name. The **same section** gives me `RootNavigator.tsx`, whose entire body is `const { user } = useAuth()` — so P0 could not compile without an auth context, and I am not creating files in `src/context/`.
- **Blocking:** was blocking P0. Not any more.
- **Workaround in place:** `app/src/lib/auth.tsx` — `AuthProvider` + `useAuth`, in my lane. The reasoning beyond "P0 needed it": token storage (`getToken`/`setToken`/`clearToken`) and `getMe()` all live in `lib/api.ts`, which is mine, so splitting the state that wraps them into your lane makes every auth change a two-person edit. **`LocaleContext` is untouched and still yours.** If you'd rather own it, build `context/AuthContext.tsx`, keep the `useAuth` signature, and I change one import line.
- **One thing to preserve if you do rewrite it:** it does **not** decode the JWT. The role comes from `AuthRes.user` at sign-in and `GET /auth/me` on a cold start. A client-side `role` claim read would work and would quietly imply that routing is an authorization boundary — it isn't, the server is (I4).
- **Raised:** H0

### [Pranay → Shreya] CONTRACT: two different paths for i18n across the docs
- **What I need:** you to pick one, and to say which in the group chat before SH1.
- **Why:** `07_FRONTEND_ARCHITECTURE.md` §1 puts it at **`src/i18n/{index.tsx, mr.json, hi.json, en.json}`**. `CLAUDE.md` §4 and the ownership table at the top of this file both say **`src/lib/i18n.tsx`** with `app/messages/**` for the dictionaries. Those are three different locations for the JSON.
- **Blocking:** nothing of mine — I import `t` from wherever you put it, and until SH1 lands my Marathi is hardcoded with `TODO(shreya):` next to it.
- **Workaround in place:** none needed. Flagging it because you will otherwise pick one, and then find the other path cited in a doc at H20 and wonder which is stale. Neither is: they were written at different times.
- **My preference, weakly held:** `src/lib/i18n.tsx` + `src/i18n/*.json`. `lib/` is where the other cross-cutting modules already are, and it keeps the dictionaries out of `lib/`.
- **Raised:** H0

### [Pranay → Akash] CONTRACT: `users.locale` CHECK constraint excludes `hi`
- **What I need:** `00_CANON.md` §6.2's `users` table has `locale text not null default 'mr' check (locale in ('mr','en'))` — no `hi`. Widen the constraint to `('mr','hi','en')`.
- **Why:** Hindi is a committed Phase-1 feature (`PLAN.md` §8, task **SH9** — "Hindi as a third locale"), and the client's own `Locale` type (`types/api.ts`) already includes it. S1 (my language picker) offers मराठी/हिंदी/English today; the moment a farmer picks हिंदी and registers, `/auth/register`'s `locale: 'hi'` will violate this constraint and 500 or 400 — the exact "confident feature, broken contract" bug this repo's own discipline exists to catch before H30, not after.
- **Blocking:** nothing today — S3's fixture doesn't touch a real DB — but it will block SH9 + any real farmer registration in Hindi the moment A1 is live.
- **Workaround in place:** none needed on my side; the client sends whatever the user actually picked, which is correct. The constraint is the thing that's out of date.
- **Raised:** H0 (P1)

### [Pranay → Akash] CONTRACT: `village` missing from `/auth/register`'s documented body
- **What I need:** add `village` (optional) to `00_CANON.md` §7.1's `/auth/register` row: `{phone, code, name, role, locale, district_id, village?}`.
- **Why:** `00_CANON.md` §6.2's `farmers` table already has a nullable `village` column, and `PRANAY.md` §1.4's own S3 spec says "Name, district, village." The endpoint table is the one place that's missing it.
- **Blocking:** nothing today — S3 sends `village` as an extra optional field already (harmless if A1 ignores it); it just isn't formally in the contract yet, which means A1 could reasonably drop it on the floor without anyone noticing until a demo lot's village shows up blank.
- **Workaround in place:** `lib/api.ts`'s `register()` types `village?: string` and sends it when non-empty. Once this is in CANON, that's already correct — nothing to change on my side.
- **Raised:** H0 (P1)

### [Pranay → Akash] DECISION: how S2/S3 resolve `/auth/otp/verify`'s deliberately identical error
- **What I need:** confirm this matches what A1 will actually do, or tell me before it lands.
- **Why:** CANON §7.1 says wrong-code and unknown-phone return the *identical* error on `verify` — correctly, to prevent phone enumeration — but that means the client can never know in advance which case a failure is. I resolved it as: **always try `verify` first; on any server-returned failure (not a network failure), fall through to S3 and let `/auth/register` — which re-validates `{phone, code}` independently — be the final arbiter.** A genuinely wrong code fails there too, with an unambiguous error that sends the farmer back to S2. This matches CANON's own "Post-OTP for new users" phrasing (`PRANAY.md` §1.4), but it's an inference, not something CANON states outright — worth you confirming `register` really does independently re-check the OTP rather than trusting a prior `verify` call, since the client-side flow only works if it does.
- **Blocking:** nothing today — S2/S3 route through `fixtures/auth.ts` (verify always fails there, by design, exercising this exact path) — but it needs your sign-off before L5/A1 integration.
- **Workaround in place:** see `fixtures/auth.ts`'s file-level comment for the full reasoning.
- **Raised:** H0 (P1)

### [Pranay → Kartik] CONTRACT: K4 and K6 do not exist yet — S5 and S6 are on fixtures
- **What I need:** `GET /prices/series?days=180` (K4) and `GET /prices/nearby` (K6).
- **Why:** S5 (180-day history chart) and S6 (nearby mandis, net-sorted) are both built and working against `fixtures/prices.ts`'s `fxPriceHistory` and `fixtures/nearby.ts`'s `fxNearby` — the exact CANON §7.3 shapes, nothing invented. `USE_FIXTURES` is the one line each screen needs flipped once your endpoints answer.
- **Blocking:** P6 (S5), P7 (S6, S6's district_id comes from `useAuth().user.district_id`).
- **Workaround in place:** `TODO(kartik):` in both screen files' headers.
- **One thing worth checking when K6 lands:** CANON's own two-row `/prices/nearby` example (Lasalgaon/Pune) doesn't actually demonstrate a net-order-≠-gross-order case — Pune wins on both gross and net, so two rows sorted either way land in the same order. `fxNearby.ts` added a third row (Nagpur — high gross, high transport) specifically to exercise that reordering. Worth confirming your seed data for K6 also produces at least one real case of it, or S6's whole reason for existing never shows on stage.
- **Raised:** H0 (P6/P7)

### [Pranay → Kartik] CONTRACT: `/prices/nearby`'s own comment and worked numbers disagree on a `loading` term
- **What I need:** confirm which is authoritative — the comment or the numbers — and if it's the comment, add `loading_paise_per_qtl` to `NearbyMarketRow` and to K6's response.
- **Why:** `00_CANON.md`:606 comments `net_paise_per_qtl` as `// ★ gross - transport - commission - loading`, and `types/api.ts`:134 carries the identical four-term comment on the same field — but neither CANON's own worked example (`205000 - 8000 - 3075 = 193925`, checked by hand) nor `NearbyMarketRow` itself have a fourth `loading` value anywhere. The type has no field to subtract, and the arithmetic that's actually shown only ever does two subtractions. `fixtures/nearby.ts` follows the *numbers* (gross − transport − commission, three fields, two subtractions) because that's what's verifiably true from CANON's own example — but if K6 gets implemented from the *comment* instead, real nets will land ~loading's-worth of paise below what my fixture and S10's cost total agree on, and S6 stops agreeing with S9/S10 on stage.
- **Blocking:** nothing today — the fixture is internally consistent — but it needs resolving before K6 ships.
- **Workaround in place:** `fixtures/nearby.ts`'s file-level comment documents the same discrepancy; this is that note formalized.
- **Raised:** H0 (P6/P7 review)

### [Pranay → Nikhil] CONTRACT: N2 does not exist yet, and ForecastRes has no `source` field
- **What I need:** `GET /ai/forecast` (N2). Separately: confirm CANON §7.4's `ForecastRes` shape (`{as_of_date, points, model_card}`, no `source`) is final, or that I8's "source badge is part of the chart" rule genuinely does not apply to a forecast — a model output, not an observed price row.
- **Why:** S7 (14-day p10/p50/p90 fan) is built and working against `fixtures/forecast.ts`'s `fxForecast`. `ForecastFan` deliberately does not render a source badge, because there is nothing in CANON's actual response to badge — but `PRANAY.md` §2.7 rule 2 reads as if every chart needs one, and I don't want that read to silently drift into someone adding an invented `source` field to `ForecastRes` later to satisfy it.
- **Blocking:** P6 (S7).
- **Workaround in place:** `TODO(nikhil):` in `S07_Forecast.tsx`'s header; the contract gap itself is documented in `fixtures/forecast.ts`'s file-level comment.
- **Raised:** H0 (P6)

### [Pranay → Shreya] CONTRACT: `tab.home` / `tab.prices` / `tab.lots` / `tab.assistant` missing from all three locale files
- **What I need:** those four keys added to `src/i18n/mr.json`, `hi.json`, and `en.json`.
- **Why:** `main`'s `FarmerTabs.tsx` calls `t('tab.home')` etc., but none of the four keys exist in any of the three dictionaries — `useT()`'s fallback renders the literal `⟨tab.home⟩` on the tab bar for a farmer who cannot read English, let alone a raw i18n key. Verified: `grep -c '"tab\.' src/i18n/{mr,hi,en}.json` is `0` in all three.
- **Blocking:** nothing today.
- **Workaround in place:** rebased `FarmerTabs.tsx` keeps the hardcoded Marathi titles it already had rather than adopting `t('tab.*')` — the tab bar renders correctly, just not through your i18n system yet. Swap it once the keys exist.
- **Raised:** H0 (post-merge rebase)

### [Pranay → Shreya] BUG: `justify:` should be `justifyContent:` in two of your files
- **What I need:** `components/ui/Button.tsx:76` and `screens/buyer/S22_EscrowTimeline.tsx:82` both have `justify: 'space-between'` (or similar) inside a `StyleSheet.create` object — React Native's style types have no `justify` property, only `justifyContent`.
- **Why:** these are hard `tsc` errors, not warnings — RN's `StyleSheet.d.ts` intersects with `NamedStyles<any>` specifically to catch this. They currently block a clean `npx tsc --noEmit` for the *entire app*, not just the buyer screens, which means CI (or anyone) running a full typecheck sees red regardless of which lane they're working in. (A third instance was in my own `navigation/RootNavigator.tsx:55` — fixed on my side already.)
- **Blocking:** a clean whole-app `tsc` run.
- **Workaround in place:** none — not editing your files per CLAUDE.md §4. Reporting only.
- **Raised:** H0 (post-merge rebase)

### [Pranay → Shreya] STANDARDS: `catch (err: any)` in S17_BuyerLogin.tsx
- **What I need:** typed catches (e.g. `catch (err) { if (err instanceof ApiError) ... }`, the pattern the rest of the app uses) at `screens/buyer/S17_BuyerLogin.tsx:31` and `:52`.
- **Why:** `CLAUDE.md` §5 says TypeScript is strict mode, no `any`, no exceptions listed for catch blocks.
- **Blocking:** nothing functionally — this is a standards note, not a broken build.
- **Workaround in place:** none — not editing your files.
- **Raised:** H0 (post-merge rebase)

### [Pranay → Shreya] SCOPE: `app/package.json` on `main` adds a web build and 14 unrequested dependencies
- **What I need:** a team decision on whether this scope is wanted at all before more work builds on it.
- **Why:** `CLAUDE.md` §1 says there is no web build and no separate web project; §3 says no new dependency without asking the team. `main` now has `react-dom`, `react-native-web`, `vite@^5.4.21` *and* `webpack@^5.110.3`, `webpack-cli`, `webpack-dev-server`, `html-webpack-plugin`, `babel-loader`, `babel-plugin-react-native-web`, `@vitejs/plugin-react`, plus a `"web": "webpack serve"` script and +5,088 lockfile lines. Two competing bundlers for one unrequested target is itself a sign this wasn't a small addition.
- **Blocking:** nothing of mine directly, but every future `npm install` on this repo now pulls a meaningfully larger dependency tree for a target CLAUDE.md says doesn't exist.
- **Workaround in place:** none — reporting only, not touching `package.json` or deleting anything. This is a team call, not mine to make unilaterally.
- **Raised:** H0 (post-merge rebase)

### [Pranay → Nilesh] CONTRACT: does CANON §9's grading formula floor or round, and how do weakest-dimension ties break?
- **What I need:** confirmation that `250 * (1 - damage_pct/100)` floors (matching every other money/score computation in this codebase's own discipline — `//` not `/`), and a tie-break rule for `weakest_dimension` when two of the six dimensions score equally low.
- **Why:** building S13 (self-assay, P9) against this exact formula client-side (CANON §9, lines 810-826) so the six answers actually move the grade. The score column is documented as `int`, which implies floor/round happens somewhere, but CANON doesn't say which, and grading.py doesn't exist yet to check. A silent choice here means my client-computed grade could disagree with Akash's A5 the day it ships.
- **Blocking:** P9 (S13), specifically the boundary tests at 750/500.
- **Workaround in place:** flooring every intermediate term (`Math.floor`, matching this codebase's I1/I2 discipline elsewhere) until told otherwise; picking the first dimension encountered on a tie, in the fixed order size_uniform → colour_uniform → sprouting → moisture_feel → foreign_matter → damage_pct.
- **Raised:** H0 (P9)

---

## Resolved before H0 — decisions and doc corrections

These are logged because **the baseline documents changed after they were written**, and a team member who read an early copy is holding stale information. Read this section once before you start. Every entry is a real change to something someone would otherwise have built.

### [Pranay → everyone] DECISION: React Native **CLI**, not Expo
- **What changed:** The app is `npx @react-native-community/cli init`, not `create-expo-app`. `12_STACK.md` is the new authority on every dependency.
- **Why:** Expo's config-plugin and prebuild layers are a class of failure we cannot debug at H30, and the escape hatch (`expo prebuild`) lands in RN CLI anyway — at the worst possible moment.
- **Consequences you must absorb:**
  - **There is no web build.** RN CLI has no `--web`. **The buyer console is the same APK on a second Android device**, not a browser tab. Any doc that says `expo start --web` is stale — report it.
  - `app/android/` and `app/ios/` are **checked into git** and owned by Pranay. A Gradle change is a change everyone pulls.
  - **Android 9+ blocks cleartext HTTP.** Needs `network_security_config.xml` scoped to `10.0.2.2`, the LAN IP and `localhost` — **never `usesCleartextTraffic="true"` globally.** `12_STACK.md` §7.3.
  - Emulator → host is **`10.0.2.2`**, not `localhost`.
  - **JDK 17 exactly.** Not 11, not 21.
  - No `EXPO_PUBLIC_*`. The base URL is `app/src/config.ts`, committed, **no secrets in it ever (I10)**.
- **The `expo-*` replacements:** `expo-av` → **`react-native-sound`** · `expo-speech` → **`react-native-tts`** (fallback only) · `expo-secure-store` → **AsyncStorage, as a declared gap** · `expo-speech-recognition` → **cut from Phase 1**.
- **Raised:** H0

### [Pranay → everyone] DECISION: role split revised
- **Frontend:** Pranay (lead) + Shreya. **Backend:** Akash (main), Kartik supporting **after** K1 and K9 land. **Model training:** Nikhil + Nilesh.
- **Why it matters for blockers:** if Akash is blocked at H6 and Kartik is still on the data ladder, **the answer is a fixture, not Kartik.** Pulling him off data to unblock backend puts the H4 data gate at risk, and the data gate is the one gate that cannot be recovered later.
- **Raised:** H0

### [Pranay → everyone] ★★ BUG: the demo figure was wrong by 10× — ₹62,900 → **₹6,290**
- **What was wrong:** several documents carried `expected_gain_paise: 6290000` (₹62,900) and `worst_case_paise: -4800000` (−₹48,000).
- **The arithmetic:** on the canonical 4000 kg (40 qtl) lot, `(209650 − 193925) × 40 = 629000` paise = **₹6,290**, and `(181925 − 193925) × 40 = −480000` = **−₹4,800**.
- **Why it had to be fixed:** ₹62,900 on 40 quintals implies an **81% onion price move in 11 days**. ₹6,290 implies **8.1%**. The first number is not a typo a judge forgives — it is a claim that the product does not understand its own units, made to a panel that knows onion prices from memory.
- **Who this touches:** **Shreya rehearses the corrected figure** (beat 5, slide 4) — the old number is in no script any more. Pranay's fixture and Nilesh's worked example both use the corrected values.
- **The rule that follows:** the `_per_qtl` fields are **per quintal**; `expected_gain_paise` and `worst_case_paise` are **whole-lot totals**. **Never put a rupee figure on a screen or a slide you have not multiplied out by hand.**
- **Raised:** H0

### [Pranay → everyone] ★ BUG: six API fields that do not exist were being built against
- **What was wrong:** an early fixture in `PRANAY.md` carried `best_case_paise`, `best_day`, `confidence_bps`, `costs_paise`, `model_version` and `source_summary`. **None of them are in `00_CANON.md` §7.4.**
- **Why this is worse than a normal bug:** a screen built on an invented fixture renders perfectly in every rehearsal and breaks the first time it touches the real endpoint. Every one of those reads becomes `undefined`.
- **Corrections applied:** `confidence` is the enum `"LOW" | "MEDIUM" | "HIGH"`, **not** a bps number. Costs are `costs.{...}_paise_per_qtl` with `total_paise_per_qtl`. There is no best case and no best day.
- **★ And I16 was being misread as a consequence.** I16 compares the worst case to **the expected gain** — not to a best case, which does not exist. Both render at **28 sp**. The old S9 mockup had them both at 20 sp with an invented `+₹1,42,000` best-case row above them.
- **The rule:** **if a key is not in CANON §7.4, it is not in your fixture.** Need one? File a blocker. Do not add it yourself.
- **Raised:** H0

### [Pranay → everyone] BUG: invariant numbering was inconsistent across four documents
- **`00_CANON.md` §3 is the authority: I1–I16.** `docs/architecture/README.md` carried the pre-CANON numbering with `I16` spliced in, so it disagreed with CANON on I2, I5, I6, I9 and I11–I15. An earlier draft of `07_FRONTEND` also called I16 "F8".
- **If a role doc cites an invariant number, check it against CANON §3 before you trust it.** The two a judge tests are **I4** (cross-actor 404) and **I6** (refusal) — not I4 and I5.
- **Raised:** H0

### [Pranay → everyone] DECISION: the hold window is **11 days** (अकरा दिवस)
- Several documents said 12. The canonical demo verdict is **HOLD, 11 days**, and Shreya's voice clip set records **अकरा**.
- **Raised:** H0

### [Pranay → Shreya] BUG: `PRANAY.md` P13 named the wrong task as its blocker
- P13 (wiring 🔊 into S9) said *"Blocked by: Shreya SH5"*. **SH5 is buyer login.** The voice library is **SH3**. Corrected.
- **Raised:** H0

### [Pranay → everyone] DECISION: the assistant is **S28**, and S16 is the FPO split
- An early draft of `PRANAY.md` had S16 as the assistant, disagreeing with **both** `07_FRONTEND` §10 and `01_PRD`, which agree S16 is the FPO pool/split view. Those two win.
- **S15 is "My lots / my offers"** and the escrow timeline is a **component inside it**, reusing what Shreya builds for S22 — that reconciles `01_PRD`'s "Transaction timeline" reading without inventing a screen number.
- **New screens:** **S26** farmer chat + call (Pranay P15) · **S27** buyer chat (Shreya SH10) · **S28** assistant (Pranay P16).
- **Raised:** H0

### [Pranay → everyone] DECISION: JWT lives in AsyncStorage in Phase 1, and we say so
- CANON and `02_TRD` said `react-native-keychain`; `12_STACK` §6 said AsyncStorage with a declared gap. **The declared gap is now the statement in all three**, because it is the truth about what ships.
- **The answer if asked:** *"Phase 2 uses `react-native-keychain`. In Phase 1 it's a 72-hour JWT on a device the farmer owns, and we wrote that down rather than implying a keystore we didn't build."*
- **Why this framing and not the other:** a doc that claims a keystore the code does not have is a doc that fails the one question — *"show me"* — that a security-minded judge actually asks.
- **Raised:** H0

### [Pranay → Nikhil, Kartik] ★ CONTRACT: the demo script now has **⟨placeholders⟩** where your numbers go
- **What changed:** `11_DEMO_AND_PITCH.md` no longer contains a MASE, a coverage percentage, a row count or a synthetic count. They are `⟨X⟩`, `⟨Y⟩`, `⟨N⟩`, `⟨S⟩`.
- **Why:** the file said *MASE 0.83 / 81% coverage* while CANON's example model card said *0.71 / 78.4%*. **Both were invented.** One of them was going to be narrated on stage as a measured fact.
- **What I need:** **Nikhil** fills MASE and coverage from the real backtest (N5). **Kartik** fills row count, date range and synthetic count from `/meta/data-provenance` (K7).
- **When:** at **H30**, out loud, together, from the running system — not from any document. Slide 7 should be a **screenshot** of the provenance endpoint, not retyped numbers.
- **Raised:** H0

---

## Resolved

### [Everyone → Pranay] CONTRACT: role docs disagreed with CANON on the window response
- **What I need:** `NILESH.md` §1.2 and `PRANAY.md` §2.8 documented `best_day`, `best_case_paise`, `confidence_bps`, `costs_paise` and `source_summary` — five fields `00_CANON.md` §7.4 does not define.
- **Why:** Nilesh would have built a server response Pranay's screens could not read, and both would have disagreed with the contract Akash's `schemas.py` enforces. `undefined` on stage at beat 8.
- **Blocking:** L1, L5, P4, P5 — the hero endpoint end to end.
- **Workaround in place:** none needed; corrected before the build started.
- **Raised:** H0
- **RESOLVED:** H0 — both docs rewritten against CANON §7.4. The shape is `{action, hold_days, confidence, band_width_bps, sell_now_net_paise_per_qtl, hold_p50_net_paise_per_qtl, hold_p10_net_paise_per_qtl, expected_gain_paise, worst_case_paise, costs{6 keys}, alt_market, pledge_quote, refusal_reason, model_card, explain_mr, explain_en, data_source}`. Every key always present; `pledge_quote` nullable.

### [Everyone → Pranay] SCHEMA: AKASH.md's escrow FSM used state names the DB rejects
- **What I need:** `AKASH.md` §2.5 used `FUNDS_HELD` and `RECEIVED`; the `CHECK` constraint in `00_CANON.md` §6 permits only `ESCROW_HELD` and `DELIVERED`.
- **Why:** the first `transition()` insert would have violated the constraint at runtime, and Shreya's S22 would have rendered states the DB refuses to store.
- **Blocking:** A9, A10, SH-side S22.
- **Workaround in place:** none needed.
- **Raised:** H0
- **RESOLVED:** H0 — `LEGAL` and `ACTOR` corrected to `CREATED → ESCROW_HELD → DISPATCHED → DELIVERED → RELEASED`, plus `CANCELLED` / `REFUNDED` / `DISPUTED`. `06_BACKEND_ARCHITECTURE.md` §6 and `09_PHASE_2.md` carried the same two wrong names and were corrected in the same pass.

### [Everyone → Pranay] CONTRACT: two conflicting invariant numbering schemes
- **What I need:** `CLAUDE.md` §2 numbered the invariants differently from `00_CANON.md` §3 — the same rule was `I3` in one file and `I5` in the other. Ten of the sixteen numbers disagreed.
- **Why:** every role doc cites invariants by number. A teammate reading *"append-only, ever (I3)"* in `AKASH.md`, then grepping CANON for I3, finds *"rates are basis points"* and loses five minutes — repeatedly, for thirty-six hours. It also made two citations in `SHREYA.md` resolve to nothing at all.
- **Blocking:** nothing directly; it taxes everybody continuously, which is worse.
- **Workaround in place:** none needed; corrected before the build started.
- **Raised:** H0
- **RESOLVED:** H0 — **`00_CANON.md` §3 is the single authoritative table and its numbering wins**, per CANON's own precedence rule. `CLAUDE.md` §2 and all six role docs were renumbered to match; the eleven architecture docs already used CANON numbering and were left untouched. CANON gained **I16 — both numbers, always**, which `CLAUDE.md` had as I11 and CANON had been missing entirely. The two `SHREYA.md` citations that pointed at no real invariant (farmer illiteracy, 56 px touch target) were dropped, keeping the reasoning without the false authority. **Cite invariants by number only after checking CANON §3.**

### [Pranay → Akash] CONTRACT: `/demands/{id}/matches` gives the buyer bare `lot_id`s
- **What I need:** a buyer-readable label on each row of `matches[].lots[]` — a `farmer_label` and `village`, or a small `lot_summary` object. Two or three fields, not a full `LotDto`.
- **Why:** CANON §7.6's match rows carry `lot_id` and `qty_allocated_kg` and nothing else, and `GET /lots/{id}` is actor-scoped (I4) so a buyer cannot resolve an id he does not own. S19 is demo beat 9 — the moment a buyer sees that three smallholders together fill the order he would have given a middleman. "`pool_3`, `lot_7`, `lot_9`" does not land that; "रामभाऊ पाटील, निफाड" does. The old screen solved this by inventing farmer names in a module constant, which is the I8 class of mistake, so it is now rendering ids honestly instead.
- **Blocking:** P-side S19 polish, and beat 9's punchline.
- **Workaround in place:** `fixtures/matches.ts` is CANON-shaped, and the screen renders `लॉट १ · lot_7` with the allocated quantity. No invented names anywhere. `TODO(akash):` in `app/src/screens/buyer/S19_Matches.tsx`.
- **Raised:** H-current (2026-09-06)

### [Pranay → Akash] CONTRACT: no price anywhere on a match response
- **What I need:** nothing changed, only confirmation this is intended.
- **Why:** §7.6's match entries have no price field, so S19 now shows the buyer's own `bid_paise_per_qtl` once at the top rather than a per-bundle rupee figure. The previous screen carried `avgPrice: 1950` — rupees, in a field not ending `_paise`, rendered with a hand-composed `₹` — breaking I1 twice in one line. If matching is meant to surface a per-bundle asking price, it needs a `_paise` field and I will move it onto the card.
- **Blocking:** nothing.
- **Workaround in place:** the bid renders through `formatPaise` in the demand summary card.
- **Raised:** H-current (2026-09-06)

### [Pranay → Akash] CONTRACT: S20 needs a buyer-visible lot read and the stored `grade_assays` row
- **What I need:** two things, and (b) is the one that matters.
  - **(a) a lot a buyer can read.** Either widen `GET /lots/{id}` to admit a buyer holding a matched or offered demand on that lot, or hang a lot summary off the match rows (this is the same ask as the `/demands/{id}/matches` entry above, and one fix closes both).
  - **(b) the stored assay row on some read path** — `GET /lots/{id}/assay`, or fold the six answers into `GET /lots/{id}`. I have called it `getLotAssay()` and typed it as `AssayRecord`; rename both freely, I follow the contract.
- **Why:** `POST /lots/{id}/assay` returns `{score, grade, weakest_dimension, tip_mr, tip_en}` and **throws the six answers away** — nothing in CANON §7.5 ever reads them back. But CANON §6.4's `grade_assays` DDL already stores every one of them (`size_uniform`, `colour_uniform`, `sprouting`, `damage_pct`, `moisture_feel`, `foreign_matter`, plus `photo_path`), with `unique (lot_id)`. **So this is an exposure, not a new feature** — the columns exist, the write path fills them, and no endpoint selects them.
  A buyer paying a premium for grade A wants the answers behind it. CANON §7.6 says a match `score` "must decompose … 'Because the algorithm said so' is not an answer a judge accepts" — a *grade* is no different, and it is the number an actual rupee gets attached to. S20 renders all six through the same dictionary strings the farmer read on S13, so the buyer sees the answer the farmer gave rather than a paraphrase of it.
  On (a): `GET /lots/{id}` is actor-scoped and returns **404, not 403** (I4), so against the live API a buyer lands on a 404 on this screen today. That is correct behaviour and S20 renders it as its own branch, with its own sentence and deliberately **no retry button** — retrying returns 404 again, by design. It is a good I4 demo. It is not a working buyer screen.
- **Blocking:** S20's assay section (the point of the screen), and the "audit the grade" half of demo beat 8. Not blocking beat 9.
- **Workaround in place:** `AssayRecord` transcribed column-for-column from the §6.4 DDL into `app/src/types/api.ts`; `getLotAssay()` in `app/src/lib/api.ts` behind `USE_FIXTURES`; `fxAssayRecords` in `app/src/fixtures/lots.ts` with two rows whose `score`/`grade`/`weakest_dimension` were each **computed from their own six answers by CANON §9's formula**, not chosen to look good, and which agree with their lot's `grade` field. `lot_ungraded_1` has no row on purpose so the "not checked yet" branch stays reachable. A 404 from the assay read is swallowed to `null` — "not assayed yet" is an ordinary state of a lot, not a failure. Three `TODO(akash):` markers: `types/api.ts` (`AssayRecord`), `lib/api.ts` (`getLotAssay`), `screens/buyer/S20_LotDetail.tsx` (header).
- **Also worth knowing:** the old S20 displayed a farmer name, a village, a distance in km and a warehouse name, all hardcoded literals. Three of those have no field anywhere in the contract — `LotDto` has `farmer_id` only, distance lives on the *match* row where S19 already shows it, and there is no warehouse column in the `lots` DDL at all (the one `warehouse_id` in CANON sits on `PledgeQuote`). **They are deleted rather than faked.** If a buyer is supposed to see a warehouse against a lot, that is a schema change and it needs to come from you.
- **Raised:** H-current (2026-09-06)


### [Pranay → Akash] CONTRACT: nothing goes from a transaction to its dispute
- **What I need:** one of two, whichever is cheaper for you.
  - **(a) `GET /disputes?tx_id={id}`** — a filter on the collection, returning `[]` or one row.
  - **(b) a nullable `dispute_id` on `TxDto`** — one field, and the existing `GET /disputes/{id}` does the rest.
- **Why:** CANON §7.7 has `POST /disputes` and `GET /disputes/{id}` and **no way to discover the id**. A buyer standing on a `DISPUTED` transaction — which is precisely the actor and the state the dispute screen exists for — cannot reach the dispute on it. He can *file* one and never read it back, because the only response that ever carries the id is the `POST` he already navigated away from.
- **Blocking:** S25's read path against a live API. Not blocking the raise path, and not blocking any demo beat — beat 10 shows escrow and the split, and the dispute screen is the "what if it goes wrong" follow-up question rather than a scripted beat.
- **Workaround in place:** `app/src/fixtures/disputes.ts` exports `fxDisputeByTxId`, a local map standing in for the missing lookup. Against the live API `fetchDisputeForTx()` returns `null` **unconditionally and on purpose** — it does not guess a `dispute_${tx_id}` path that would 404. When a transaction reads `DISPUTED` and no dispute can be resolved, the screen renders `dispute_exists_unreadable` ("a dispute is on record, its details cannot be read right now") instead of showing a raise form that would file a second complaint about the same shipment. Two `TODO(akash):` markers, on `getDispute` in `app/src/lib/api.ts` and in the `S25_Dispute.tsx` header.
- **Raised:** H-current (2026-09-07)

### [Pranay → Akash] CONTRACT: `POST /disputes` has no documented response body
- **What I need:** confirmation that it returns the created `DisputeDto`. If you would rather return `DisputeRes` with the first `dispute_events` row already in it, say so and I delete a render branch.
- **Why:** §7.7 gives the path and the request body and stops. The caller needs the new `id` at minimum, so `DisputeDto` is the only shape that lets the screen do anything after a successful file. The reason the difference is visible on screen: `dispute_events` is **append-only (I5)**, so after a raise I have a dispute row and **no event**, and the timeline section renders only when `events.length > 0`. I will not fabricate a `RAISED` event to fill it — inventing a row in an append-only table is the one thing that table exists to make impossible, and a judge who asks "where did that event come from" deserves a better answer than "the frontend made it up". If the `POST` returns the first event, the timeline is populated from the moment of filing and that branch goes away.
- **Related:** `GET /disputes/{id}` is documented as "+ event timeline" with no body either. I have read that as a wrapper — `{dispute, events}`, matching `MatchesRes` and `ProvenanceRes` — rather than a bare DTO plus a second round trip on `GET /disputes/{id}/events`. Either is fine; the two must not disagree.
- **Blocking:** nothing. Both readings compile and both render.
- **Workaround in place:** `DisputeRes` in `app/src/types/api.ts`; `createDispute()` typed `→ DisputeDto` in `app/src/lib/api.ts`, both carrying `TODO(akash):`.
- **Raised:** H-current (2026-09-07)

### [Pranay → Akash] FYI, no action: the buyer cannot resolve his own dispute, and the screen now says so
- **What changed:** S25 used to render a button labelled "accept arbitration and settle" that moved the dispute to `RESOLVED`, for the **buyer**. That is gone.
- **Why:** CANON §7.7's FSM reaches `RELEASED` and `REFUNDED` from `DISPUTED` as *mediation outcomes*, and the diagram's own rule is "anything not on this diagram is `409`". `disputes.stage` has seven values, three of them `RESOLVED_*`; none is an action a party performs on its own complaint. The old screen was drawing a permission we do not have and should not want: the buyer holding the goods deciding whether his own short-weight claim against the farmer succeeds. The screen now renders the stage, the append-only event stream, and one sentence — a mediator decides, and the escrow amount stays held until they do.
- **What I need from you:** nothing, unless you disagree that resolution is mediator-driven. If there is a party-initiated withdrawal path (`WITHDRAWN` is in the CHECK constraint and is plausibly the *raiser's* own action), tell me and I will add it for the raiser only.
- **Raised:** H-current (2026-09-07)

### [Pranay → Akash] CONTRACT: `OfferDto` carries `buyer_id` and nothing a farmer can read
- **What I need:** `GET /buyers/{id}` returning the display-safe half of §6.2's `buyers` row — `{id, business_name, district_id, tier, deals_completed, on_time_payment_bps, renegotiation_bps, source}`. Or, cheaper for you and better for me: embed that object on `OfferDto` as `buyer`, since every screen that renders an offer needs it and none of them needs a second round trip.
- **Why:** §6.2 has all of it in the table — `business_name`, `tier`, `deals_completed`, `on_time_payment_bps`, and `renegotiation_bps`, which is the one that actually matters to a farmer ("how often does this buyer cut the price after delivery"). §7.6 exposes none of it. So a farmer looking at three competing offers on his lot sees three rows that differ only by rupees, and cannot tell the T3 buyer who has never renegotiated from the T0 one who does it every time. That is the buyer-side half of this product's thesis — "help a buyer trust a lot enough to pay more for it" has a mirror, and this is it.
- **Blocking:** S25 (buyers for a lot), S26 (buyer profile), S27 (bargaining), S29 (confirm acceptance). Not blocking any endpoint you own — the offer flow itself works.
- **Workaround in place:** none, deliberately, and this is the part worth reading. Those four screens carried three invented buyers — "Nashik Agro Exports", "Sahyadri Farms FPO", "Pune Trading Co." — with invented ratings (4.9 stars, "99.2% on-time pay", "Trust Index", "100% Escrow"), all hardcoded as **i18n dictionary strings**, so every farmer in every language saw the same three fictional companies. They are gone rather than restyled. The screens now render the real offers with the buyer shown as the contract knows him, and the reliability block is absent instead of estimated: `on_time_payment_bps` defaults to `10000` in your schema, and rendering that default as "100% on-time" would be the app asserting a perfect payment record for a buyer nobody has transacted with. `source` is `'SEEDED'` for a reason and I8 says we badge it.
- **Raised:** H-current (2026-09-07)

### [Pranay → Akash] CONTRACT: the Deals tab has no endpoint to list deals from
- **What I need, two small things:**
  - **(a) `GET /tx`** — actor-scoped list, same shape as `GET /offers` which already works in both directions. Ordering by `created_at` desc is fine.
  - **(b) `tx_id` on `OfferDto`**, non-null once `status = 'ACCEPTED'`. One nullable column on the response.
- **Why:** §7.7 gives `GET /tx/{id}` and `GET /tx/{id}/events` and no way to discover an id — the same shape of gap as the dispute one above, but on a **footer tab** rather than a follow-up screen. `POST /offers/{id}/accept` returns the `TxDto`, so the id exists for exactly one render and is then unreachable: a farmer who accepts an offer, closes the app, and reopens it on the Deals tab cannot get back to the transaction he just agreed to. Escrow status, the append-only event timeline and the settlement figures are all behind that id, and those are demo beat 10.
- **Blocking:** S31 (deals list) fully, S32 (tracking) and S33 (settled) for anything a farmer navigates to rather than lands on. Not blocking the accept path.
- **Workaround in place:** S31 lists the farmer's **accepted offers** — `GET /offers` filtered to `status = 'ACCEPTED'`, which is real, actor-scoped and correct as a set, since accepting is what creates a transaction. What it cannot do is open one: with no `tx_id` there is nothing to pass to `GET /tx/{id}`, so rows render the offer's own agreed figures and say plainly that the escrow status is not available yet, rather than guessing a `tx_${offer_id}` path that would 404. Two `TODO(akash):` markers, in `S31_DealsList.tsx` and on `getTransaction` in `app/src/lib/api.ts`.
- **What these screens used to do instead, since it explains the urgency:** S33 rendered a completed settlement — "₹76,000 credited", "State Bank of India (SBI)", "A/C ·······4209", "RTGS #SD-2024-8842", "Form 13", "e-Tax Valid" — with no query behind any of it. Hardcoded, in the i18n dictionaries, identical for every farmer. A fabricated bank credit and a fabricated statutory receipt are the two worst objects that could be on a screen shown to a government panel, and they are gone.
- **Raised:** H-current (2026-09-07)
