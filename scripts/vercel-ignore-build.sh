#!/usr/bin/env bash
#
# Vercel "Ignored Build Step" for the dev and Storybook projects.
#
#   bash scripts/vercel-ignore-build.sh storybook   # mbolden-storybook
#   bash scripts/vercel-ignore-build.sh dev         # mbolden-change-web-dev
#
# Vercel's rule: exit 0 = skip the build, exit 1 = build.
# Fail safe: when in doubt, build. Every path that isn't a clear "skip" exits 1.
#
# The production project (mbolden-change-web) must never run this script. It
# builds every push, since Minh reviews every change on its preview.
#
# Tests: bash scripts/vercel-ignore-build.test.sh

build() {
  echo "vercel-ignore-build: BUILD (${ROLE:-no role}): $1"
  exit 1
}

skip() {
  echo "vercel-ignore-build: SKIP (${ROLE:-no role}): $1"
  exit 0
}

# Anything unexpected (including an interrupted run) builds.
trap 'build "the script stopped unexpectedly"' ERR INT TERM

# Paths Storybook uses, relative to the repo root. A trailing slash means the
# whole folder. Update this list when the folder layout changes: see "Vercel
# build skipping" in CLAUDE.md.
STORYBOOK_PATHS=(
  'frontend/.storybook/'          # Storybook config, preview and mocks
  'frontend/components/'          # stories and the components they import
  'frontend/styles/'              # shared SCSS partials
  'frontend/lib/'                 # helpers the components import
  'frontend/utils/'
  'frontend/sanity/'              # types and helpers the components import
  'frontend/public/'              # staticDirs in .storybook/main.ts
  'frontend/app/globals.css'      # imported by .storybook/preview.tsx
  'frontend/app/design-tokens.scss'
  'frontend/package.json'
  'frontend/package-lock.json'
  'frontend/tsconfig.json'
  'frontend/next.config.ts'       # read by @storybook/nextjs-vite
  'frontend/middleware.ts'        # Vercel bundles it for the Storybook project too
  'scripts/vercel-ignore-build.sh'
)

# Test files never reach the Storybook build.
is_test_file() {
  case "$1" in
    *.test.ts | *.test.tsx | *.test.js | *.test.jsx | */__tests__/* | */__mocks__/*) return 0 ;;
  esac
  return 1
}

# Prints the first Storybook path the file falls under, if any.
storybook_match() {
  local file="$1" entry
  for entry in "${STORYBOOK_PATHS[@]}"; do
    case "$entry" in
      */) [[ "$file" == "$entry"* ]] && { echo "$entry"; return 0; } ;;
      *) [[ "$file" == "$entry" ]] && { echo "$entry"; return 0; } ;;
    esac
  done
  return 1
}

decide_dev() {
  local ref="${VERCEL_GIT_COMMIT_REF:-}"
  [[ -n "$ref" ]] || build "VERCEL_GIT_COMMIT_REF is empty, so the branch is unknown"
  [[ "$ref" == "main" ]] && build "push to main"
  skip "branch '$ref' is not main; the dev project only tracks main"
}

decide_storybook() {
  local prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
  [[ -n "$prev" ]] || build "VERCEL_GIT_PREVIOUS_SHA is empty (first deploy of this project or branch)"
  [[ "$prev" =~ ^[0-9a-fA-F]{7,40}$ ]] || build "VERCEL_GIT_PREVIOUS_SHA is not a commit SHA"

  command -v git >/dev/null 2>&1 || build "git is not available"
  local root
  root="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel 2>/dev/null)" || build "not inside a git checkout"
  cd "$root" || build "cannot enter the repo root"
  git rev-parse --verify --quiet 'HEAD^{commit}' >/dev/null || build "cannot read the current commit"

  # Vercel's clone is shallow, so the previous commit may be missing. Try to fetch it.
  if ! git cat-file -e "${prev}^{commit}" 2>/dev/null; then
    local fetcher=(git fetch --quiet --depth=1 origin "$prev")
    command -v timeout >/dev/null 2>&1 && fetcher=(timeout 60 "${fetcher[@]}")
    "${fetcher[@]}" >/dev/null 2>&1 || true
    git cat-file -e "${prev}^{commit}" 2>/dev/null || build "previous commit ${prev:0:9} can't be reached, even after a fetch"
  fi

  local changed
  changed="$(git diff --name-only --no-renames "$prev" HEAD 2>/dev/null)" || build "git diff against ${prev:0:9} failed"
  [[ -n "$changed" ]] || build "no file changes since ${prev:0:9} (redeploy of the same commit)"

  local file match count=0
  while IFS= read -r file; do
    [[ -n "$file" ]] || continue
    count=$((count + 1))
    is_test_file "$file" && continue
    if match="$(storybook_match "$file")"; then
      build "$file changed since ${prev:0:9} (Storybook path: $match)"
    fi
  done <<<"$changed"

  skip "none of the $count files changed since ${prev:0:9} are Storybook paths"
}

ROLE="${1:-}"
[[ $# -le 1 ]] || build "expected one argument, got $#"

case "$ROLE" in
  storybook) decide_storybook ;;
  dev) decide_dev ;;
  '') build "missing argument (expected 'storybook' or 'dev')" ;;
  *) build "unknown argument (expected 'storybook' or 'dev')" ;;
esac

# Never reached: both decide_* functions exit. If it is, build.
build "no rule decided"
