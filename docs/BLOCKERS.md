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
