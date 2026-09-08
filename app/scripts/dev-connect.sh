#!/usr/bin/env bash
#
# Reconnect the phone to the dev machine and bring the app back up.
#
# ★ Why this exists: over wireless adb the *device* stays connected while the
#   `adb reverse` tunnels silently disappear — `adb devices` still says "device",
#   so nothing looks wrong, but the phone has no route to Metro or the API and
#   the app red-screens with "Could not connect to development server". The
#   tunnels are per-transport: any blip re-establishes the device and drops them.
#
#   So the fix is never "reconnect the phone". It is "re-create the tunnels".
#   Run this after any disconnect, any laptop sleep, any Metro restart.
#
# Usage:
#   ./scripts/dev-connect.sh                  # wireless, default IP below
#   ./scripts/dev-connect.sh 10.7.1.181:5555  # wireless, explicit
#   ./scripts/dev-connect.sh usb              # phone on the cable
#
set -uo pipefail

DEVICE="${1:-10.7.1.181:5555}"
PKG="com.mandisetu"
METRO_PORT=8081
API_HOST_PORT=8002   # the API listens here on the laptop
API_PHONE_PORT=8000  # ...but the app asks for :8000, per src/config.ts

red()  { printf '\033[31m%s\033[0m\n' "$*"; }
grn()  { printf '\033[32m%s\033[0m\n' "$*"; }
ylw()  { printf '\033[33m%s\033[0m\n' "$*"; }

# ── 1. device ────────────────────────────────────────────────────────────────
if [ "$DEVICE" = "usb" ]; then
  DEVICE="$(adb devices | awk 'NR>1 && $2=="device" {print $1; exit}')"
  [ -z "$DEVICE" ] && { red "✗ No USB device. Plug the phone in and allow the prompt."; exit 1; }
  grn "✓ USB device: $DEVICE"
else
  if ! adb devices | grep -q "^${DEVICE}[[:space:]]*device$"; then
    ylw "· Not connected, dialling $DEVICE ..."
    adb connect "$DEVICE" >/dev/null 2>&1
    sleep 2
  fi
  if ! adb devices | grep -q "^${DEVICE}[[:space:]]*device$"; then
    red "✗ Cannot reach $DEVICE."
    echo "  The phone's wifi IP may have changed. On the phone:"
    echo "    Settings → About → Status → IP address"
    echo "  Then re-run with the new one:  ./scripts/dev-connect.sh <ip>:5555"
    echo "  If wireless debugging is off entirely, plug in USB and run:"
    echo "    adb tcpip 5555 && adb connect <ip>:5555"
    exit 1
  fi
  grn "✓ Device: $DEVICE"
fi

A=(adb -s "$DEVICE")

# ── 2. servers on the laptop ─────────────────────────────────────────────────
if curl -sf --max-time 4 "http://localhost:${METRO_PORT}/status" >/dev/null 2>&1; then
  grn "✓ Metro is running on :${METRO_PORT}"
else
  red "✗ Metro is NOT running."
  echo "  Start it in another terminal:  cd app && npx react-native start"
  echo "  (re-run this script once it is up)"
  exit 1
fi

if curl -sf -o /dev/null --max-time 4 "http://localhost:${API_HOST_PORT}/docs" 2>/dev/null; then
  grn "✓ API is running on :${API_HOST_PORT}"
else
  ylw "· API is not answering on :${API_HOST_PORT} — voice will fall back to on-device TTS."
  ylw "  Everything else runs on fixtures (USE_FIXTURES=true), so the app still works."
fi

# ── 3. the tunnels — the actual fix ──────────────────────────────────────────
"${A[@]}" reverse --remove-all >/dev/null 2>&1
"${A[@]}" reverse "tcp:${METRO_PORT}" "tcp:${METRO_PORT}" >/dev/null || { red "✗ reverse ${METRO_PORT} failed"; exit 1; }
"${A[@]}" reverse "tcp:${API_PHONE_PORT}" "tcp:${API_HOST_PORT}" >/dev/null || { red "✗ reverse ${API_PHONE_PORT} failed"; exit 1; }

# Verify from the phone's own side, not the laptop's — that is the only check
# that proves the tunnel, rather than proving the server is up locally.
PHONE_METRO="$("${A[@]}" shell "curl -s --max-time 5 http://localhost:${METRO_PORT}/status" 2>/dev/null | tr -d '\r')"
if [ "$PHONE_METRO" = "packager-status:running" ]; then
  grn "✓ Phone can reach Metro"
else
  red "✗ Tunnel is up but the phone still cannot reach Metro (got: '${PHONE_METRO}')"
  exit 1
fi

PHONE_API="$("${A[@]}" shell "curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://localhost:${API_PHONE_PORT}/docs" 2>/dev/null | tr -d '\r')"
[ "$PHONE_API" = "200" ] && grn "✓ Phone can reach the API" || ylw "· Phone cannot reach the API (${PHONE_API}) — voice falls back to on-device TTS"

# ── 4. restart the app so it re-fetches the bundle ───────────────────────────
# A reload alone does not clear a red screen reliably: the bundle download
# already failed and the activity is in an error state. A cold start does.
"${A[@]}" shell am force-stop "$PKG" >/dev/null 2>&1
sleep 1
"${A[@]}" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
grn "✓ App restarted — first bundle build takes ~15-30s"

echo
grn "Done. If the red screen comes back, just run this again."
