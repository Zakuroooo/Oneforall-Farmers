# SETUP — get `npx react-native run-android` to work

> **For Pranay and Shreya.** This is written for **macOS on Apple Silicon**, which is what Pranay's machine is (`arm64`, macOS 26.5). Intel Macs differ in exactly one place (§5, the emulator image). Windows differs more — if you are on Windows, say so before you start and this file gets a second column.
>
> **Total wall clock: about 60–90 minutes**, almost all of it downloading. Read §0 and start the two downloads in §1 and §2 *before* you read the rest.

---

## 0. The ordering, because it is the whole trick

Three things download, and two of them are slow. Run them **overlapping**, in three terminal tabs:

| | Tab | What | Time | Needs |
|---|---|---|---|---|
| **1** | A | `brew install --cask zulu@17` | ~3 min | — |
| **2** | B | `brew install --cask android-studio` | **~15–25 min** | — |
| **3** | C | The React Native init (§4) | ~8 min | Node only. **Not** Java, **not** the SDK. |

Start **1 and 2 first**, then do **3 while they run**. Step 3 is what unblocks Claude to start writing code, so it should not wait behind a 1.2 GB download.

Then the Android Studio wizard (§5) and the first `run-android` (§7), which is another 15–30 minutes of Gradle downloading — and there is no way to make that part faster the first time.

**Do not skip ahead to `run-android`.** It fails without §3 (JDK on PATH) and §6 (env vars), and the failure message will not tell you that.

---

## 1. JDK 17 — exactly 17

React Native 0.73+ requires **JDK 17**. Not 11, not 21. A JDK 21 Gradle failure looks like a corrupt build cache and eats an afternoon.

```bash
brew install --cask zulu@17
```

**This asks for your Mac password** — a cask installs a `.pkg` into `/Library/Java/`, which needs admin. That is expected.

Verify:

```bash
/usr/libexec/java_home -V
```

You want a line containing **17** (e.g. `17.0.x (arm64) "Azul Systems, Inc." - "Zulu 17.xx"`). Right now that command says *"Unable to locate a Java Runtime"* — after this step it must not.

<details>
<summary>No-sudo fallback if the cask is a problem</summary>

```bash
brew install openjdk@17
```

Then in §6 use `export JAVA_HOME=/opt/homebrew/opt/openjdk@17` instead of the `java_home` line. Works identically for Gradle; `/usr/libexec/java_home` just won't see it.
</details>

**Android Studio bundles its own JDK (JBR 21).** That is *not* enough — the `react-native` CLI shells out to Gradle using the JDK on your `PATH`. You need 17 installed separately.

---

## 2. Android Studio

```bash
brew install --cask android-studio
```

~1.2 GB. **Start this and move on to §4** — come back when it's done.

---

## 3. watchman (optional, 2 minutes, do it anyway)

```bash
brew install watchman
```

Metro watches the filesystem for changes. Without watchman on macOS it falls back to a slower watcher that intermittently misses saves — which presents as *"I edited the file and nothing reloaded"*, and you will not suspect the watcher.

---

## 4. Scaffold the app — **do this while §1 and §2 download**

This needs Node and nothing else. It creates `app/` and it is the step that lets Claude start writing screens.

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers"
RN=$(npm view react-native@0.76 version) && echo "pinning react-native $RN"
npx @react-native-community/cli@latest init MandiSetu --directory app --version "$RN" --pm npm --skip-git-init
```

**Why each flag:**

| Flag | Why it is not optional |
|---|---|
| `--directory app` | our layout is `app/`, not `MandiSetu/` |
| `--version "$RN"` | pins **0.76.x**, which is what every doc in this repo assumes. `@latest` would give you 0.8x and a different `compileSdk`, NDK and Gradle — and six role docs would be wrong. |
| `--pm npm` | one lockfile. Do not let it pick yarn. |
| `--skip-git-init` | **★ without this it runs `git init` inside `app/`** and you get a nested repository inside ours. Undoing that after you have committed is genuinely annoying. |

**If it asks about CocoaPods, answer `n`.** Pods are for iOS and we ship Android only. If it tries anyway and fails, **that is not a real failure** — check `ls app/package.json` and carry on.

Then the runtime dependencies. **Wave 1 only** — the four navigation packages, server state, storage, SVG:

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers/app"
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
      react-native-screens react-native-safe-area-context \
      @tanstack/react-query @react-native-async-storage/async-storage \
      react-native-svg
```

**Wave 2 is deliberately later** — `react-native-sound`, `react-native-tts`, `react-native-image-picker` land when P9/P13 need them:

```bash
# NOT NOW. This is for later, when P9 and P13 come up.
npm i react-native-sound react-native-tts react-native-image-picker
```

Seven native modules added at once means that when the Gradle build breaks you have seven suspects. Wave 1 gets you a green build; each Wave-2 package then gets its own `run-android` and its own blame.

**When this finishes, tell Claude.** `app/` existing is what unblocks `app/src/**`.

---

## 5. The Android Studio wizard + SDK packages

Open Android Studio. Accept the standard setup wizard (it downloads the base SDK and platform-tools). Then:

**More Actions → SDK Manager** (or ⌘, → Languages & Frameworks → Android SDK)

### SDK Platforms tab — tick **Show Package Details**

Under **Android 15.0 · API 35**:
- ☑ **Android SDK Platform 35**
- ☑ **Google APIs ARM 64 v8a System Image** ← **★ arm64-v8a. Not x86_64.**

> **★ This is the Apple Silicon trap.** An `x86_64` system image on an M-series Mac has to emulate a foreign CPU — it either refuses to boot or runs at a speed that makes you think the app is broken. On an **Intel** Mac you want `x86_64` instead. Pick by your chip, not by which one is listed first.

### SDK Tools tab — tick **Show Package Details**

- ☑ **Android SDK Build-Tools 35.0.0**
- ☑ **Android SDK Command-line Tools (latest)**
- ☑ **Android Emulator**
- ☑ **Android SDK Platform-Tools**
- ☐ **NDK (Side by side)** — **skip for now.** It is ~2.5 GB and RN 0.76 ships prebuilt native artifacts, so a plain build does not need it. If Gradle later fails naming a specific NDK version, install *exactly that version* — the one it wants is the `ndkVersion` line in `app/android/build.gradle`.
- ☐ **CMake** — same rule: only if Gradle asks.

Apply. Another few hundred MB.

---

## 6. Environment variables

Append to `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Then **open a new terminal tab** (or `source ~/.zshrc`) and verify all four:

```bash
java -version          # must say 17
echo $ANDROID_HOME     # /Users/<you>/Library/Android/sdk
adb version            # Android Debug Bridge version 1.0.4x
emulator -version      # any version
```

**If `adb version` says "command not found", stop here and fix it.** Every later error becomes unreadable when the SDK is not on the PATH — `run-android` will report a Gradle problem when the real problem is this.

`ANDROID_HOME` is the current name; `ANDROID_SDK_ROOT` is the deprecated one. Some tools still read the old one. Setting only `ANDROID_HOME` is correct.

---

## 7. Create an emulator

**Android Studio → More Actions → Virtual Device Manager → Create Device**

- Device: **Pixel 7** (or any recent phone profile)
- System image: **API 35, arm64-v8a** — the one you downloaded in §5
- Finish, then press ▶ to boot it once so the first-boot cost is paid now, not during a build

<details>
<summary>Command-line equivalent</summary>

```bash
sdkmanager "system-images;android-35;google_apis;arm64-v8a"
avdmanager create avd -n MandiSetu_35 -k "system-images;android-35;google_apis;arm64-v8a" -d pixel_7
emulator -avd MandiSetu_35 &
```
</details>

**A real phone is better and you will need one anyway** — `PRANAY.md` §2.9 item 1 says *"runs on a real Android phone, not just the emulator."* Enable Developer Options (tap Build Number seven times) → USB Debugging, plug it in, accept the RSA prompt, then `adb devices` should list it. The emulator is for iteration; the phone is for truth, because it's the only place you find out the Marathi type scale is too small in sunlight.

---

## 8. First build

```bash
cd "/Users/pranaysarkar/Desktop/Oneforall Farmers/app"
npx react-native run-android
```

**This takes 15–30 minutes the first time** and prints an alarming amount of Gradle output. That is normal — it is downloading the Gradle distribution, the Android Gradle Plugin and every dependency's artifacts. Subsequent builds are under a minute.

Success looks like the React Native welcome screen on the emulator, and a second terminal window running Metro.

### If it fails

| Message contains | Cause | Fix |
|---|---|---|
| `Unsupported class file major version` | JDK 21 or 11 is being used | `java -version` — must be 17. Re-check §6. |
| `SDK location not found` | `ANDROID_HOME` unset in *this* shell | new terminal tab, or `source ~/.zshrc` |
| `Could not find ... ndk` and a version number | a dep builds C++ | install *exactly* the NDK version it names (§5) |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` | emulator disk too small | wipe the AVD's data, or make a new one with a larger internal storage |
| `Failed to launch emulator` | no AVD, or `emulator` not on PATH | §6, §7 |
| hangs at `Starting a Gradle Daemon` | it is downloading, silently | give it 10 more minutes before you touch anything |

**Do not `rm -rf` anything on the first failure.** Read the last 30 lines, match the table, fix that one thing. Deleting `node_modules` and starting over is a 20-minute ritual that almost never fixes an Android build.

---

## 9. Two things that will bite in P0 and are already solved

### 9.1 The emulator cannot see `localhost`

Inside the Android emulator, `localhost` **is the emulator**. The host machine is **`10.0.2.2`**.

| Running on | API base URL |
|---|---|
| Android emulator | `http://10.0.2.2:8000/api/v1` |
| Real phone, same wifi | `http://<your-laptop-LAN-ip>:8000/api/v1` |
| Deployed | `http://<ec2-host>/api/v1` |

Get your LAN IP with:

```bash
ipconfig getifaddr en0
```

That value goes into `app/src/config.ts`. **Tell Claude what it is** — the file is written with a placeholder otherwise.

### 9.2 Android blocks cleartext HTTP, and the failure looks like a dead server

Our dev API is `http://`. Android 9+ refuses cleartext by default, and the error surfaces as a connection failure — indistinguishable from the API being down. It is handled by `app/android/app/src/main/res/xml/network_security_config.xml`, scoped to three domains.

**Never `android:usesCleartextTraffic="true"` globally.** That permits plaintext to every host on the internet, and it is exactly what a security-minded judge greps for.

---

## 10. Done when

```bash
java -version            # 17
adb version              # prints a version
ls app/package.json      # exists
cd app && npx tsc --noEmit   # clean
npx react-native run-android  # welcome screen on a device
```

Five lines. When all five pass, P0's environment half is finished and the code half is Claude's.
