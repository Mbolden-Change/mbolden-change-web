# Frontend

Next.js app for mboldenchange.org. For repo-wide setup (env vars, Studio, design system), see the [root README](../README.md).

## Quick start

```bash
cp .env.example .env.local   # fill in Sanity (and optional Action Network) values
npm install
npm run dev                  # http://localhost:3000
```

Put env files in this directory (next to `package.json`), not under `app/`. Restart the dev server after any env change.
