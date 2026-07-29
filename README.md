# mBOLDen Change web

Production site for [mboldenchange.org](https://mboldenchange.org): Next.js frontend + Sanity Studio.

## Structure

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js 15 site |
| `studio/` | Sanity Studio (content CMS) |
| `design-system/` | Brand / visual reference |

## Frontend setup

```bash
cd frontend
cp .env.example .env.local   # fill in values
npm install
npm run dev                  # http://localhost:3000
```

Env files live in **`frontend/`** (next to `package.json`), not in `app/`. Prefer `.env.local` for secrets (gitignored). See `frontend/.env.example` for the full list.

**Required**

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET` — local/dev usually `development`

**Optional**

- `ACTION_NETWORK_FORM_ID` / `ACTION_NETWORK_API_KEY` — newsletter / Action Network API route

After changing env vars, **restart** `npm run dev` (`NEXT_PUBLIC_*` are loaded at startup). If Sanity still 500s with `ENOTFOUND *.apicdn.sanity.io`, check network/DNS/VPN — not the env file.

## Studio setup

```bash
cd studio
npm install
npm run dev
```

Defaults to the `development` dataset. Set `SANITY_STUDIO_DATASET=production` when targeting production.

Schema changes: edit `studio/schemaTypes/`, then run typegen (`npm run typegen` / `predev`) before wiring frontend queries and components. See `.cursor/rules/sanity-block-workflow.mdc`.

## Design system

Before writing UI, read `design-system/README.md` and `design-system/SKILL.md`. Use brand tokens from `frontend/app/globals.css` / `frontend/app/design-tokens.scss` — never hard-code hex when a `--brand-*` token exists.
