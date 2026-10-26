# The Safety Net Simulator

`/simulator` on mboldenchange.org. The page is built from website components
(`frontend/components/v2/simulator/`) inside the site's normal layout. Its
numbers come from the reference build's code, unchanged.

## What lives where

| Path | What it is |
| --- | --- |
| `simulator/reference/index.html` | The reference build (October 2026, sha256 `9a7aaeca…2d27374`). **Never edit it.** Every change to the simulator is checked against it. |
| `frontend/lib/simulator/engine/` | `engine.js`, `parameters.json` and `caleitc-table-2025.json`, extracted byte-for-byte from the reference build. |
| `frontend/lib/simulator/adapter.js`, `model.js` | The reference build's EngineAdapter, households, policy rounds, eligibility and California layer, stability scoring and story generation, copied verbatim by `simulator/tools/port-reference.mjs`. |
| `frontend/components/v2/simulator/` | The presentation components. Logic they share with the reference build sits in `// ---- BEGIN VERBATIM reference lines A-B ----` blocks, filled in by `simulator/tools/inline-verbatim.mjs`. |
| `simulator/tests/` | The checks below. |
| `docs/simulator-refresh/` | The approved mockup (four screens). |

## Refreshing the numbers

A parameter refresh replaces only `frontend/lib/simulator/engine/parameters.json`
(and the CalEITC table when FTB publishes a new one). Update their hashes in
`simulator/tests/verbatim.test.js` in the same change, then run every check.
Copy text that cites the data vintage (for example "Data current as of …") lives
in the verbatim blocks and in `simulator/reference/index.html`; a copy change
there needs a new reference build, not a hand edit.

## Checks (run all of them before merging any simulator change)

From the repo root, with the site running (`npm run build && npm start` in
`frontend/`, or a Vercel preview URL):

```sh
node simulator/tests/engine.test.js        # engine rules: 54/54
node simulator/tests/verbatim.test.js      # ported code still matches the reference build
node simulator/tests/equality/harness.js --url http://localhost:3000/simulator
node simulator/tests/keyboard.js http://localhost:3000/simulator
```

The equality harness plays every required path through the reference build and
the website and compares every number on every screen; it also lists reference
text missing from the website. Any number difference fails. It writes
`report.md` and `report.json` to `simulator/tests/equality/out/` (ignored by git).
The harness and keyboard test use the Playwright that `frontend/` already
installs (run `npx playwright install chromium` in `frontend/` once), and the
harness needs network access for the reference build's CDN scripts.

## Known behaviour carried over from the reference build

- Build Your Own appears after one finished simulation, and California can't be
  turned on for a custom household (the toggle lives on the region step, which
  custom households skip, and Start over resets it).
- Preset households have no `children` count, so on the region step the
  "Children only" Medi-Cal answer and the CalWORKs question don't appear for them.
- Each trajectory point is the stability score at the start of that round (the
  reference build records it before the round's penalty).
