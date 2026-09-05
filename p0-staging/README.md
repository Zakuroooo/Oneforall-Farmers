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
rm -rf p0-staging
```

Then tell Claude, and two things happen that must not be done blind:

1. **`AndroidManifest.xml` gets one attribute added.** It has to be edited in place after the template generates it, not overwritten.
2. **`App.tsx` gets replaced** with the navigator tree — which needs the navigation packages installed first, so it is not staged here.

## What is in here

| File | Why it is P0 and not later |
|---|---|
| `src/types/api.ts` | Transcribed from `00_CANON.md` §7.4. Every screen types against this. Written first so no screen invents a field. |
| `src/config.ts` | `10.0.2.2` vs LAN IP vs prod. No secrets, ever (I10). |
| `src/lib/money.ts` | I1 and I2 live here. `formatPaise` and `toQuintal` are the **only** `/ 100` in `app/src/`. |
| `src/lib/__tests__/money.test.ts` | The seven cases from `PRANAY.md` §2.4. These run before any screen exists. |
| `src/lib/api.ts` | The only place `fetch` is called. |
| `src/fixtures/window.ts` | `fxHold` **and** `fxNoAdvice`. Both, now — the refusal path is not a later concern. |
| `android/.../network_security_config.xml` | Without it every API call fails and looks exactly like a dead server. |
| `tsconfig.json` | `strict`, plus the two flags the RN template leaves off. |

## What is deliberately not here

`components/ui/{Skeleton,ErrorState,EmptyState}` — **Shreya owns `app/src/components/ui/**`** (`BLOCKERS.md` ownership table). A blocker is filed. Until she delivers, screens import from `src/components/farmer/States.tsx`, which is marked `TODO(shreya):` and gets deleted on arrival.
