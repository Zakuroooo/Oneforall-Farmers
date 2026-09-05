# `p0-staging/` — temporary. Delete after one command.

`npx @react-native-community/cli init --directory app` **refuses to run into a directory that already exists.** So the P0 source files could not be written to `app/` before you scaffold. They live here instead, in a tree that mirrors `app/` exactly.

## After the init succeeds

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers"
cp -R p0-staging/app/src app/src
cp p0-staging/app/tsconfig.json app/tsconfig.json
mkdir -p app/android/app/src/main/res/xml
cp p0-staging/app/android/app/src/main/res/xml/network_security_config.xml \
   app/android/app/src/main/res/xml/network_security_config.xml
```

**`App.tsx` is deliberately not in that list.** Build and launch the plain React Native welcome screen first — that is what proves the toolchain (JDK, SDK, Gradle, cable, phone) is sound. Only then:

```bash
cp p0-staging/app/App.tsx app/App.tsx && rm -rf p0-staging
```

Press `r` in Metro to reload. No rebuild — it is JavaScript. `SETUP.md` §12 has the expected result and the three ways it goes wrong.

If our navigator tree lands before that first green build, a Gradle failure and a bad import produce the same red screen and you end up debugging both at once.

One thing still has to be done by hand afterwards: **`AndroidManifest.xml` gets one attribute added** (`android:networkSecurityConfig`). It is edited in place after the template generates it, never overwritten — `SETUP.md` §8.1 has the command. Skip it and the config file above is inert: it sits there looking correct while every API call fails.

## What is in here

| File | Why it is P0 and not later |
|---|---|
| `src/types/api.ts` | Transcribed from `00_CANON.md` §7.4. Every screen types against this. Written first so no screen invents a field. |
| `src/config.ts` | `adb reverse` vs emulator vs LAN, as a named switch. No secrets, ever (I10). |
| `src/lib/money.ts` | I1 and I2 live here. `formatPaise` and `toQuintal` are the **only** `/ 100` in `app/src/`. |
| `src/lib/__tests__/money.test.ts` | The seven cases from `PRANAY.md` §2.4. These run before any screen exists. |
| `src/lib/api.ts` | The only place `fetch` is called. |
| `src/lib/auth.tsx` | `AuthProvider` + `useAuth`. Does **not** decode the JWT — the role comes from the server. |
| `src/navigation/*` | `RootNavigator` + `AuthStack` + `FarmerTabs`, and a skeleton `BuyerTabs` marked `TODO(shreya):`. |
| `src/screens/farmer/S01–S04` | Placeholders. The routes exist from P0 so each screen replaces one line. |
| `src/fixtures/window.ts` | `fxHold` **and** `fxNoAdvice`. Both, now — the refusal path is not a later concern. |
| `android/.../network_security_config.xml` | Without it every API call fails and looks exactly like a dead server. |
| `tsconfig.json` | `strict`, plus the flags the RN template leaves off. |
| `App.tsx` | Provider stack + the role branch. Applied **second**, per above. |

## What is deliberately not here

`components/ui/{Skeleton,ErrorState,EmptyState}` — **Shreya owns `app/src/components/ui/**`** (`BLOCKERS.md` ownership table). A blocker is filed. Until she delivers, screens import from `src/components/farmer/States.tsx`, which is marked `TODO(shreya):` and gets deleted on arrival.
