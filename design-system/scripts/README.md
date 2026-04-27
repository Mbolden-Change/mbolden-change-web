# Token sync

`sync-tokens.mjs` keeps `design-system/colors_and_type.css` aligned with
the canonical brand tokens in the Next.js app, so any designer or agent
referencing the design system sees the exact same values your shipped code
uses.

## Install

Drop this `scripts/` folder inside your `design-system/` directory so it
lives at:

```
mbolden-change-web/
└── design-system/
    ├── colors_and_type.css        ← generated
    └── scripts/
        └── sync-tokens.mjs
```

Node 18+ (uses ESM, no dependencies).

## package.json

Add to the root `package.json` of the monorepo (or `frontend/package.json`
if that's where you run scripts):

```json
{
  "scripts": {
    "tokens:sync":  "node design-system/scripts/sync-tokens.mjs",
    "tokens:check": "node design-system/scripts/sync-tokens.mjs --check"
  }
}
```

## Usage

```bash
# Regenerate colors_and_type.css from the current source files
npm run tokens:sync

# CI guard — exits 1 if the generated file is stale
npm run tokens:check
```

## What it reads

| Source file | Tokens pulled |
|---|---|
| `frontend/app/globals.css` | `--brand-*` colors, type scale `--text-*` |
| `frontend/app/design-tokens.scss` | spacing `--space-*`, radii `--radius-*` |
| `frontend/styles/_variables.scss` | SCSS `$color` fallbacks |

## What it writes

Only the `:root { … }` block between
`/* BEGIN SYNCED TOKENS */` and `/* END SYNCED TOKENS */` is overwritten.

Everything below that (semantic aliases, type classes, motion, shape
primitives) is **hand-authored** and safe to edit — it references the
synced tokens via `var(--brand-*)` so upstream color changes cascade
automatically.

## CI

Add to your GitHub Actions workflow:

```yaml
- name: Verify design tokens are in sync
  run: npm run tokens:check
```

This catches the common drift case: someone changes a brand color in
`globals.css` and forgets to regenerate the design-system artifact.

## Adding a new token

1. Add it to `frontend/app/globals.css` (or the appropriate source file).
2. Add a line inside the `tokens` object in `sync-tokens.mjs`:
   ```js
   '--new-token': pick('new-token', 'fallback-value'),
   ```
3. Run `npm run tokens:sync`.
4. Commit both `globals.css` and `design-system/colors_and_type.css`.

## Adding a hand-authored token

If a token only makes sense to the design system (semantic aliases like
`--accent-warn`, motion curves, signature shapes), add it to the
**hand-authored extensions** block in `sync-tokens.mjs` directly. These
survive regeneration.
