#!/usr/bin/env bash
#
# Tests for scripts/vercel-ignore-build.sh. Builds a throwaway git repo, then
# runs the script with simulated Vercel environment variables.
#
#   bash scripts/vercel-ignore-build.test.sh
#
# Exit 0 = every case behaved as expected. Vercel's rule: 0 = skip, 1 = build.

set -u

SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/vercel-ignore-build.sh"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

failures=0

# run <label> <expected exit code> <repo> <env assignments...> -- <script args...>
run() {
  local label="$1" expected="$2" repo="$3"
  shift 3
  local envs=()
  while [[ $# -gt 0 && "$1" != "--" ]]; do envs+=("$1"); shift; done
  shift
  local output code
  output="$(env -u VERCEL_GIT_PREVIOUS_SHA -u VERCEL_GIT_COMMIT_REF "${envs[@]}" bash "$repo/scripts/vercel-ignore-build.sh" "$@" 2>&1)"
  code=$?
  local verdict="ok  "
  if [[ "$code" != "$expected" ]]; then verdict="FAIL"; failures=$((failures + 1)); fi
  printf '%s  %s\n      exit %s (expected %s)  %s\n' "$verdict" "$label" "$code" "$expected" "$output"
}

commit() { # commit <repo> <message> <file>...
  local repo="$1" message="$2" file
  shift 2
  for file in "$@"; do
    mkdir -p "$repo/$(dirname "$file")"
    echo "$message" >>"$repo/$file"
  done
  git -C "$repo" add -A
  git -C "$repo" -c user.name=test -c user.email=test@example.com commit --quiet -m "$message"
  git -C "$repo" rev-parse HEAD
}

# A small repo shaped like this one.
REPO="$WORK/repo"
mkdir -p "$REPO/scripts"
git init --quiet -b main "$REPO"
git -C "$REPO" config uploadpack.allowAnySHA1InWant true
cp "$SCRIPT" "$REPO/scripts/"
BASE="$(commit "$REPO" base \
  frontend/package.json frontend/package-lock.json \
  frontend/.storybook/main.ts \
  frontend/app/page.tsx frontend/app/globals.css \
  frontend/content/substack-archive.json \
  frontend/components/v2/blocks/Pillars/Pillars.tsx \
  frontend/components/v2/blocks/Pillars/Pillars.stories.tsx \
  frontend/components/v2/blocks/Pillars/Pillars.test.tsx \
  studio/schemaTypes/index.ts CLAUDE.md)"

step() { # step <message> <file>... : commits on top of BASE, prints the new SHA
  git -C "$REPO" checkout --quiet --detach "$BASE"
  commit "$REPO" "$@" >/dev/null
  git -C "$REPO" rev-parse HEAD
}

echo "--- storybook"
step "page and content" frontend/app/page.tsx frontend/content/substack-archive.json studio/schemaTypes/index.ts CLAUDE.md >/dev/null
run "change only in a page or content file -> skip" 0 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

step "component test only" frontend/components/v2/blocks/Pillars/Pillars.test.tsx >/dev/null
run "change only in a component test file -> skip" 0 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

step "component" frontend/app/page.tsx frontend/components/v2/blocks/Pillars/Pillars.tsx >/dev/null
run "change in a component used by a story -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

step "story" frontend/components/v2/blocks/Pillars/Pillars.stories.tsx >/dev/null
run "change in a story -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

step "config" frontend/.storybook/main.ts >/dev/null
run "change in the Storybook config -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

step "global styles" frontend/app/globals.css >/dev/null
run "change in globals.css -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

step "package" frontend/package.json >/dev/null
run "change in package.json -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

step "lockfile" frontend/package-lock.json >/dev/null
run "change in the lockfile -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

PAGE_ONLY="$(step "page only" frontend/app/page.tsx)"
run "empty VERCEL_GIT_PREVIOUS_SHA -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA= -- storybook
run "unset VERCEL_GIT_PREVIOUS_SHA -> build" 1 "$REPO" -- storybook
run "previous SHA is not a SHA -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA="--output=x" -- storybook
run "unreachable previous SHA (no such commit, fetch fails) -> build" 1 "$REPO" \
  VERCEL_GIT_PREVIOUS_SHA=0123456789abcdef0123456789abcdef01234567 -- storybook
run "previous SHA equals the current commit (redeploy) -> build" 1 "$REPO" VERCEL_GIT_PREVIOUS_SHA="$PAGE_ONLY" -- storybook

# Shallow clone, as on Vercel: the previous commit is missing until it is fetched.
git -C "$REPO" branch --quiet -f page-only "$PAGE_ONLY"
git clone --quiet --depth=1 --branch page-only "file://$REPO" "$WORK/shallow"
run "shallow clone, previous SHA fetched, page-only change -> skip" 0 "$WORK/shallow" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook
git -C "$WORK/shallow" remote remove origin
rm -rf "$WORK/shallow2" && git clone --quiet --depth=1 --branch page-only "file://$REPO" "$WORK/shallow2"
git -C "$WORK/shallow2" remote set-url origin "file://$WORK/does-not-exist"
run "shallow clone, previous SHA can't be fetched -> build" 1 "$WORK/shallow2" VERCEL_GIT_PREVIOUS_SHA="$BASE" -- storybook

# Not a git checkout at all.
mkdir -p "$WORK/nogit/scripts" && cp "$SCRIPT" "$WORK/nogit/scripts/"
run "not a git checkout -> build" 1 "$WORK/nogit" VERCEL_GIT_PREVIOUS_SHA="$BASE" GIT_CEILING_DIRECTORIES="$WORK" -- storybook

echo "--- dev"
run "branch main -> build" 1 "$REPO" VERCEL_GIT_COMMIT_REF=main -- dev
run "any other branch -> skip" 0 "$REPO" VERCEL_GIT_COMMIT_REF=claude/some-feature -- dev
run "branch named like main (main-2) -> skip" 0 "$REPO" VERCEL_GIT_COMMIT_REF=main-2 -- dev
run "empty VERCEL_GIT_COMMIT_REF -> build" 1 "$REPO" VERCEL_GIT_COMMIT_REF= -- dev

echo "--- arguments"
run "no argument -> build" 1 "$REPO" VERCEL_GIT_COMMIT_REF=feature VERCEL_GIT_PREVIOUS_SHA="$BASE" --
run "unknown argument -> build" 1 "$REPO" VERCEL_GIT_COMMIT_REF=feature VERCEL_GIT_PREVIOUS_SHA="$BASE" -- production
run "two arguments -> build" 1 "$REPO" VERCEL_GIT_COMMIT_REF=feature -- dev storybook

echo
if [[ "$failures" -gt 0 ]]; then
  echo "$failures case(s) FAILED"
  exit 1
fi
echo "All cases passed"
