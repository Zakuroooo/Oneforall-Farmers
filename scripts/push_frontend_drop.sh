#!/usr/bin/env bash
#
# Ships the farmer/buyer React Native app into the backend team's repository so
# Akash, Kartik, Nikhil and Nilesh can wire their API against the real screens.
#
# WHY THIS IS A SCRIPT AND NOT A COMMIT
# -------------------------------------
# The two halves of Mandi-Setu live in two repositories that cannot see each
# other. Nothing in this repo can push to theirs, and a shared submodule would
# make every backend build depend on an app build. So the frontend is delivered
# as a *drop*: an exact copy of the tracked app tree, on its own branch, that
# they merge when they choose to. Re-run this whenever the app moves on and they
# need a fresh copy; it is idempotent.
#
# WHY frontend/ AND NOT app/
# --------------------------
# Their `app/` is the FastAPI Python package (main.py, routers/, schemas/,
# domain/, engines/, ml/ ...) and it already contains an `app/src/`. Dropping a
# React Native tree at `app/` would collide with their package on the first
# `import app.main`. `frontend/` is empty on their side, so that is where it goes.
#
# WHAT GETS SHIPPED
# -----------------
# `git archive HEAD app` — i.e. exactly the tracked files, at the current commit.
# node_modules, android/build, .gradle and everything else .gitignore'd is
# excluded for free, because untracked files are not in the archive.
#
# USAGE
#   bash scripts/push_frontend_drop.sh
#
# Requires push access to this repo and *read* access to theirs. It never pushes
# to their default branch: it opens `frontend-drop`, and if the caller lacks
# write access it pushes to a fork of the caller's instead and prints the URL to
# open the PR from.

set -euo pipefail

# ★ The backend repo was renamed Neolithic-Backend -> Neolithic. The old URL
#   404s, so this script silently stopped delivering the app.
THEIR_REPO="${THEIR_REPO:-https://github.com/akashg7/Neolithic.git}"
DROP_BRANCH="${DROP_BRANCH:-frontend-drop}"
DEST_DIR="${DEST_DIR:-frontend}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: working tree is dirty. Commit or stash first — the drop must be" >&2
  echo "       a copy of a real commit, not of whatever happens to be on disk." >&2
  exit 1
fi

our_sha="$(git rev-parse --short HEAD)"
our_branch="$(git rev-parse --abbrev-ref HEAD)"

echo "==> 1/4  pushing $our_branch to our own origin"
git push origin "$our_branch"

work="$(mktemp -d "${TMPDIR:-/tmp}/frontend-drop.XXXXXX")"
trap 'rm -rf "$work"' EXIT

echo "==> 2/4  cloning the backend repo"
git clone --depth 1 "$THEIR_REPO" "$work/theirs" >/dev/null 2>&1
cd "$work/theirs"

# Branch off their default branch, or reuse the drop branch if a previous run
# already created it — so a second drop is a second commit on the same PR
# rather than a new PR the team has to notice.
if git ls-remote --exit-code --heads origin "$DROP_BRANCH" >/dev/null 2>&1; then
  git fetch --depth 1 origin "$DROP_BRANCH":"$DROP_BRANCH" >/dev/null 2>&1
  git checkout "$DROP_BRANCH" >/dev/null 2>&1
else
  git checkout -b "$DROP_BRANCH" >/dev/null 2>&1
fi

echo "==> 3/4  extracting the tracked app tree into $DEST_DIR/"
# Replace wholesale rather than merging: a stale file left behind from an
# earlier drop is worse than a big diff, because it compiles.
rm -rf "$DEST_DIR"
mkdir -p "$DEST_DIR"
# `app/App.tsx` becomes `frontend/App.tsx` — one strip level, no nested app/app.
git -C "$repo_root" archive HEAD app | tar -x -C "$DEST_DIR" --strip-components=1

# The three handover documents are the contract the API is expected to satisfy.
# They travel with the code because a screen without its wire contract is just
# a screenshot.
mkdir -p "$DEST_DIR/docs"
for d in FRONTEND_NEEDS_BACKEND.md FRONTEND_NEEDS_AI.md BACKEND_ALIGNMENT_STATUS.md; do
  if [[ -f "$repo_root/docs/handover/$d" ]]; then
    cp "$repo_root/docs/handover/$d" "$DEST_DIR/docs/$d"
  fi
done

cat > "$DEST_DIR/README_DROP.md" <<EOF
# Mandi-Setu frontend — drop from the app repository

This directory is a **copy** of the React Native app, extracted from the
frontend repository at commit \`$our_sha\` (branch \`$our_branch\`). It is here so
the API can be wired against the real screens instead of against a guess.

**Do not edit files here expecting the change to survive.** The next drop
replaces this directory wholesale. Frontend changes belong in the app repo; if
you need one, say so and it will be made there and re-dropped.

## What it is

React Native CLI 0.76 (**not** Expo), one codebase, two navigators selected by
the JWT \`role\` claim. No web build. TanStack Query + Context for state, no
Redux. Charts are hand-rolled \`react-native-svg\`.

## Running it

\`\`\`bash
cd $DEST_DIR
npm install
npx react-native run-android    # needs JDK 17 exactly, and an Android SDK
\`\`\`

From an emulator the host is \`10.0.2.2\`, not \`localhost\`. On a physical device,
\`adb reverse tcp:8000 tcp:8000\` first.

## Pointing it at your API

\`src/config.ts\` holds \`API_BASE_URL\` and a \`USE_FIXTURES\` flag. With
\`USE_FIXTURES = true\` every screen renders from \`src/fixtures/\` and makes no
network call at all — that is how the app was built before the API existed, and
it is also the airplane-mode demo path. Flip it to \`false\` to hit a live API.

## The wire contract

\`src/types/api.ts\` is the operative contract from the app's side: every request
and response shape the app actually sends and parses, in \`snake_case\`, read
directly off the wire with no aliasing layer. If your response disagrees with a
type in that file, the app will not render it — that file is the thing to
reconcile against.

Three specifics worth knowing before you wire anything:

- **All money is integer paise.** Fields end \`_paise\` and are integers. Never
  send rupees, never send a float. Quantities are integer kilograms (\`_kg\`);
  rates and shares are basis points (\`_bps\`, 10000 = 100%).
- **\`NO_ADVICE\` is a 200 with a body**, not an error. The verdict screen renders
  a refusal through the same success path as every other action. A 4xx/5xx there
  produces a retry screen, which is the wrong thing for a model that has
  correctly declined to answer.
- **\`pledge_quote: null\`** makes the pledge card disappear entirely — no empty
  state, no placeholder. \`is_worthwhile\` is the server's decision and the app
  never re-derives it. Send \`null\` when interest ≥ expected gain.

\`docs/FRONTEND_NEEDS_BACKEND.md\` and \`docs/FRONTEND_NEEDS_AI.md\` in this
directory are the full endpoint-by-endpoint asks, including the open questions
that still need an answer from your side.

## Tests

\`\`\`bash
npx tsc --noEmit
npx jest
\`\`\`

Both pass at the dropped commit. The suites are worth a look when wiring: the
fixture tests assert the exact response shapes the app expects, so a failing one
after you swap in a live API is telling you the contract drifted.
EOF

if [[ -z "$(git status --porcelain)" ]]; then
  echo "==> nothing changed since the last drop — their branch already matches $our_sha"
  exit 0
fi

git add -A "$DEST_DIR"
git -c user.name="$(git -C "$repo_root" config user.name)" \
    -c user.email="$(git -C "$repo_root" config user.email)" \
    commit -q -m "frontend drop: React Native app at $our_sha

Copy of the tracked app tree from the frontend repository, so the API can be
wired against the real screens. Lands in $DEST_DIR/ rather than app/ because
app/ is the FastAPI package here.

See $DEST_DIR/README_DROP.md for how to run it and $DEST_DIR/src/types/api.ts
for the wire contract the app actually parses."

echo "==> 4/4  pushing $DROP_BRANCH"
if git push -u origin "$DROP_BRANCH" 2>/dev/null; then
  echo
  echo "done. open the PR:"
  echo "  https://github.com/akashg7/Neolithic/compare/$DROP_BRANCH?expand=1"
else
  echo
  echo "no write access to their repo — pushing to your fork instead."
  echo "fork it first if you have not:  https://github.com/akashg7/Neolithic/fork"
  fork_url="${FORK_URL:-https://github.com/Zakuroooo/Neolithic.git}"
  git remote add fork "$fork_url"
  git push -u fork "$DROP_BRANCH"
  echo
  echo "done. open the PR:"
  echo "  https://github.com/akashg7/Neolithic/compare/main...Zakuroooo:$DROP_BRANCH?expand=1"
fi
