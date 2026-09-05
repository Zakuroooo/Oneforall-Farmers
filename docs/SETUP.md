# SETUP — get the app onto a real phone, without Android Studio

> **For Pranay and Shreya.** Written for **macOS on Apple Silicon** (`arm64`, macOS 26.5). Verified against Pranay's machine.
>
> **This is the no-Android-Studio path.** We install the Android **SDK**, not the IDE — about 250 MB instead of 3 GB, and no emulator, because we deploy to a real phone over USB. That is also the better demo setup: **the app talks to the API over the USB cable, not over wifi**, and venue wifi always fails.
>
> **Total wall clock: about 45 minutes**, most of it the first Gradle build.

---

## 0. What you need before you start

| | | |
|---|---|---|
| **An Android phone** | Android 7.0 or newer (that is our `minSdk 24`) | ★ It has to be **Android**. If it is an iPhone, stop and say so — the whole demo plan is an APK on two devices, and that changes. |
| **A USB data cable** | Not a charge-only cable | The classic hour-waster: the phone charges, `adb devices` stays empty, and nothing tells you the cable is the problem. |
| **JDK 17** | ✅ you have it | `/Library/Java/JavaVirtualMachines/zulu-17.jdk` |
| **Node 22** | ✅ you have it | v22.22.0 |

---

## 1. JDK 17 — done, but there is a trap

You installed `zulu@17`. You **also** have `temurin-21.jdk` on this machine from January 2024.

React Native 0.76 requires **exactly 17**. Not 21. And a JDK 21 build failure says:

```
Unsupported class file major version 65
```

…which mentions neither Java nor 21, and reads like a corrupt build cache. People delete `node_modules` for an hour over this.

So we pin `JAVA_HOME` to the exact path instead of letting the system choose. That happens in §3.

---

## 2. The Android SDK — command-line tools only

```bash
brew install --cask android-commandlinetools
```

~130 MB, about two minutes. This gives you `sdkmanager` and `adb` — the two things a build actually needs. It does not give you the IDE, an emulator, or a 1.5 GB system image, and you need none of those.

It installs to `/opt/homebrew/share/android-commandlinetools`, which becomes your `ANDROID_HOME`.

---

## 3. Environment variables

Everything downstream fails without these, and **fails with a misleading error** — `run-android` will report a Gradle problem when the real problem is an unset variable.

Append to `~/.zshrc`:

```bash
cat >> ~/.zshrc <<'EOF'

# --- Mandi-Setu / React Native ---
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
EOF
```

Then reload and **verify — do not skip this**:

```bash
source ~/.zshrc && java -version && echo "JAVA_HOME=$JAVA_HOME" && sdkmanager --version
```

You must see **`17.0.x`** on the first line. If you see `21`, `JAVA_HOME` did not take effect — open a fresh terminal tab and check again before going further.

> **Why the hardcoded path and not `$(/usr/libexec/java_home -v 17)`?**
> Both work. The literal path is deterministic and it is the one verified to exist on this machine. With two JDKs installed, deterministic beats clever.

---

## 4. SDK packages — three of them

```bash
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
```

Accept the licences when prompted (type `y`). ~120 MB.

That is the complete list. **No system image, no emulator, no NDK, no CMake.** RN 0.76 only pulls the NDK if a native module needs it, and none of ours do — if a Gradle error ever names a specific NDK version, install that version then, not now.

Verify:

```bash
adb version && sdkmanager --list_installed
```

**If `adb version` says "command not found", stop and fix it here.** Every later error becomes unreadable when the SDK is not on the PATH.

---

## 5. Your phone — four steps on the device

**5.1 Unlock Developer Options.**
Settings → **About phone** → find **Build number** → tap it **seven times**. It counts down at you ("You are 3 steps away…"). Enter your PIN when asked.

On Xiaomi/Redmi/POCO the field is under *About phone → All specs*. On Samsung it is *About phone → Software information*.

**5.2 Turn on USB debugging.**
Settings → **Developer options** → **USB debugging** → on.

While you are there, also turn on **Install via USB** and **USB debugging (Security settings)** if your phone has them — Xiaomi and Oppo require these separately and silently refuse the install without them.

**5.3 Plug in.** Use a data cable. When the phone asks what the USB is for, pick **File transfer / MTP**, not "Charging only".

**5.4 Authorize.**

```bash
adb devices
```

Your phone shows an **"Allow USB debugging?"** dialog with an RSA fingerprint. Tick *Always allow from this computer* and accept. Then run it again:

```bash
adb devices
```

You want:

```
List of devices attached
ABC123XYZ	device
```

**`unauthorized`** means you have not accepted the dialog yet. **`offline`** means unplug and replug. **Empty list** means the cable, the USB mode, or 5.2 — in that order of likelihood.

---

## 6. Watchman — skip it

React Native's docs recommend `watchman`, and on macOS Homebrew it pulls **15 dependencies** (boost, folly, fbthrift, fb303, edencommon…) plus upgrades to `openssl@3` and `python@3.14`.

**Say no.** What watchman buys you is fewer Metro file-watching misses in *large* monorepos. `app/src` is a few dozen files; Node's built-in watcher is fine at that size. If Metro ever starts missing your saves, install it *then*, with an actual symptom to justify the dependency tree.

```bash
# brew install watchman     # not now — 15 deps for a problem we don't have
```

---

## 7. Scaffold the app

This is the command that creates `app/`. Run it from the repo root:

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers" && RN=$(npm view react-native@0.76 version) && npx @react-native-community/cli@latest init MandiSetu --directory app --version "$RN" --pm npm --skip-git-init
```

| Flag | Why |
|---|---|
| `--directory app` | our repo layout says `app/`, not `MandiSetu/` |
| `--version "$RN"` | pins the latest 0.76.x. `latest` would give you 0.8x and a different Gradle. |
| `--pm npm` | the team is on npm; a stray yarn.lock is a merge conflict |
| `--skip-git-init` | ★ without it you get a git repo **nested inside** our git repo, and `app/` silently stops being tracked |

Then Wave 1 dependencies — nine packages:

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers/app" && npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @tanstack/react-query @react-native-async-storage/async-storage react-native-svg
```

`react-native-sound`, `react-native-tts` and `react-native-image-picker` come later, at P9 and P13. Seven native modules added at once means a broken Gradle build has seven suspects; this way each one gets its own build and its own blame.

And one dev dependency:

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers/app" && npm i -D @types/jest
```

The template ships `jest` itself but not its types, and our `tsconfig.json` lists `jest` under `types`. Without this, `npx tsc --noEmit` fails on **`Cannot find type definition file for 'jest'`** before it has looked at a single line of our code — which reads like our code is broken when it is one missing `@types` package.

---

## 8. Move the staged source files in

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers" && cp -R p0-staging/app/src app/src && cp p0-staging/app/tsconfig.json app/tsconfig.json && mkdir -p app/android/app/src/main/res/xml && cp p0-staging/app/android/app/src/main/res/xml/network_security_config.xml app/android/app/src/main/res/xml/
```

`p0-staging/` exists only because `cli init` refuses to run into a directory that already exists, so the source files could not be written to `app/` before you scaffolded.

**`App.tsx` is not in that command and `p0-staging/` is not deleted yet.** Both happen in §12, after the first green build.

### 8.1 One line in `AndroidManifest.xml`

Copying `network_security_config.xml` in does nothing on its own. **Android never reads that file unless the manifest points at it** — and the failure mode is silent: the file is there, it looks right, and every API call still fails.

The template generates the manifest, so this is edited **in place**, never overwritten:

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers/app" && sed -i '' 's|android:allowBackup="false"|android:allowBackup="false" android:networkSecurityConfig="@xml/network_security_config"|' android/app/src/main/AndroidManifest.xml && grep -n networkSecurityConfig android/app/src/main/AndroidManifest.xml
```

**The `grep` at the end is the point.** If it prints a line, it worked. If it prints nothing, the anchor was not there — open `app/android/app/src/main/AndroidManifest.xml` and add this attribute by hand, anywhere inside the opening `<application` tag:

```
android:networkSecurityConfig="@xml/network_security_config"
```

> **About the template's debug manifest.** RN ships `android/app/src/debug/AndroidManifest.xml` with `android:usesCleartextTraffic="true"` so Metro can serve over HTTP. Leave it. Once a `networkSecurityConfig` exists, **it takes precedence** on API 24+ — so our four-host allow-list governs even in debug, and Metro still works because it is reached at `localhost:8081` over `adb reverse`, which is on the list. We end up stricter than the template's own default, not looser.

---

## 9. First build

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers/app" && npx react-native run-android
```

**The first one takes 15–30 minutes** and looks frozen at `> Task :app:compileDebugJavaWithJavac`. It is not frozen; Gradle is downloading its own toolchain. Subsequent builds are 30–60 seconds.

When it finishes, the app installs and launches **on your phone** and Metro keeps running in the terminal. Leave that terminal open — it is the JS bundler.

### If it fails

| Message | Cause | Fix |
|---|---|---|
| `Unsupported class file major version 65` | JDK 21, not 17 | §3. Check `java -version` in *this* tab. |
| `SDK location not found` | `ANDROID_HOME` unset | §3, then a **fresh terminal tab** |
| `No connected devices` / `INSTALL_FAILED` | phone not authorized | §5.4. `adb devices` must say `device`. |
| `Failed to install... INSTALL_FAILED_USER_RESTRICTED` | Xiaomi/Oppo | turn on **Install via USB** in Developer options |
| `Could not determine java version` | Gradle picked another JDK | `./gradlew -version` from `app/android/` shows which |
| `Unable to load script` on the phone | Metro not reachable | `npx react-native start --reset-cache` in a second tab |

**Do not `rm -rf node_modules` on the first failure.** It costs twenty minutes and fixes approximately none of the six rows above.

---

## 10. Connecting the app to the API — `adb reverse`

The API does not exist yet (that is Akash's A0), but this is the piece people get wrong, so understand it now.

Your phone has no idea what `localhost` means on your laptop. There are three ways to bridge that, and **we use the first**:

```bash
adb reverse tcp:8000 tcp:8000
```

That tunnels the phone's `localhost:8000` to your laptop's port 8000 **over the USB cable**.

| | Transport | Setup | Works on |
|---|---|---|---|
| ★ **`adb reverse`** | USB | one command per plug-in | **phone and emulator both** |
| `10.0.2.2` | emulator's built-in host alias | none | emulator only |
| LAN IP | wifi | both devices on the same network | fragile — **this is the one that dies at the venue** |

`src/config.ts` defaults to `adb reverse`. It needs no wifi at all, which is why it is also the demo-day transport.

`run-android` already runs `adb reverse tcp:8081` for Metro automatically. Port 8000 is ours and is not automatic — **re-run it every time you replug the phone**, or the app hangs on a request that looks exactly like the server being down.

Cleartext HTTP to `localhost` is permitted by `android/app/src/main/res/xml/network_security_config.xml`, which allows exactly four hosts. **Never `android:usesCleartextTraffic="true"`** — that permits cleartext to every host on the internet and is precisely what a security-minded judge greps for.

---

## 11. Done when all five pass

```bash
java -version            # 17.0.x
adb devices              # your phone, status "device"
sdkmanager --list_installed
ls app/src/lib/money.ts  # the staged files landed
grep -c networkSecurityConfig app/android/app/src/main/AndroidManifest.xml   # must print 1
```

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers/app" && npx react-native run-android
```

The last one puts the **React Native welcome screen** on your phone. Stop there and go to §12.

---

## 12. Only after the welcome screen — swap in the real app

The welcome screen is the checkpoint that proves the toolchain works: JDK, SDK, Gradle, cable, phone. **Do not skip past it.** If our navigator tree lands before that first green build, a Gradle problem and a bad import produce the same red screen and you debug both at once.

Once you have seen it:

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers" && cp p0-staging/app/App.tsx app/App.tsx && rm -rf p0-staging
```

Then reload — press **`r`** in the Metro terminal, or shake the phone and tap *Reload*. No rebuild needed; this is JavaScript, and Metro is already running.

You should get a **splash spinner**, then the **language picker (S1)**, because there is no token on the device yet. Four Marathi tabs appear only after login — that is `RootNavigator` doing its one job.

| What you see | Meaning |
|---|---|
| Spinner that never resolves | `AuthProvider` is waiting on `/auth/me` and the API does not exist yet — expected until Akash's A0. It falls through to S1 once the request fails. |
| `Unable to resolve module @react-navigation/native` | step 7's `npm i` did not finish. Re-run it. |
| Red screen naming a file | that one is mine — send me the top three lines |

That is **P0 complete**. Commit and push.
