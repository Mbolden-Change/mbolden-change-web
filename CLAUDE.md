# mBOLDen Change web: standing rules

This repo ships the production mboldenchange.org site: Next.js in `frontend/`,
Sanity Studio in `studio/` (project `noi7r9zo`). These rules apply to every
session. `.cursor/rules/` holds the same codebase rules for Cursor.

## Workflow and approvals

- Work on a branch, never directly on `main`. Pull the latest `main` first.
  Bobby (GitHub `bnaluz`) may also commit to `main`.
- Every change goes: PR → Vercel preview link → Minh's explicit approval →
  merge → check on production.
- Never merge without Minh's approval in the chat.
- Minh is the only approver. Never request other reviewers or wait on anyone
  else's review.
- Previews sit behind Vercel's team login. Run checks on a local production
  build of the same commit (`npm run build && npm start` in `frontend/`), and
  send Minh the preview link to review herself.
- Report back with: branch, PR link, preview link, a plain-language summary, a
  checks table and any decisions needed from Minh.

## Content and data

- Content edits in the Sanity `production` dataset (copy, images, logos,
  cards, banners) are allowed only with Minh's explicit approval of that
  specific change, and only through the Sanity connector when it's enabled for
  the session. Without the connector, use a Sanity write token from the
  environment's network secrets, which Minh adds herself. Never ask for a
  token in chat.
- Before any production edit, list the exact document and field, with the old
  and new values.
- Make the change as a draft and show Minh. Publish only after she approves.
- Keep existing alt text and wording unless Minh gave new text.
- Never delete documents. Unpublish instead.
- After publishing, check the live page.
- Use `development` for test content.
- Schema changes and new block types still go through a PR. Deploy schema
  changes only as part of an approved PR.
- Never commit secrets or put them in environment variables. Keys go in the
  environment's network secrets, and never get printed.
- Never link the Document Retention & Destruction Policy publicly.
- Never publish the original TCPP report. Only
  `TCPP-Alum-Rock-Partner-Report-PUBLIC.pdf` is public.
- No identifying details for Project Empower participants.
- Don't mention immigration detention in Safety Net Simulator public copy.

## Copy and voice

- Minh's copy stays verbatim. Change only what has to change.
- No Oxford commas. Write the name as mBOLDen (never Mbolden or MBOLDEN).
- mBOLDen is national: never "based in Palo Alto."
- First-person plural ("we / our"). Partners and communities, not
  beneficiaries or clients. Active verbs.
- Keep headline capitalization exactly as Minh wrote it (most site headlines
  are title case).
- No emoji, except `📄` before PDF download links on statement pages.

## Design

- Read `design-system/README.md` (and `design-system/SKILL.md`) before UI work.
- Use the `--brand-*` tokens from `frontend/app/globals.css` and
  `frontend/app/design-tokens.scss`, never hard-coded hex values.
- Left-aligned body text, color blocking between sections, cream `#F8EFE0`
  (`--brand-creamy-beige`) behind long reading text.
- Keep the tilted-parallelogram identity: logo tilts `-6.5°`, primary buttons
  skew `-10.25deg` with the clip-path polygon. Sharp corners on new cards.
- Archivo Narrow 700 for headlines, Roboto for body.
- No generic flat-vector or stock illustrations of people. Use Minh's
  commissioned painted or ink illustrations, real photography, or solid
  placeholders.
- Hover effects belong on clickable things; a clickable card's image may push
  in. Scroll and entrance motion is welcome. Everything respects
  `prefers-reduced-motion`.
- CSS modules only (no Tailwind or styled-components). Check
  `frontend/components/blocks/` and `frontend/components/v2/blocks/` before
  adding a component.
- After editing `globals.css`, `design-tokens.scss` or
  `frontend/styles/_variables.scss`, run `node design-system/scripts/sync-tokens.mjs`
  to regenerate `design-system/colors_and_type.css` (`--check` reports drift).

## Sanity blocks and schema

- New blocks: schema first (`studio/schemaTypes/`), then the GROQ query in
  `frontend/sanity/lib/queries.ts` (project `reference->{ _type, slug }` for
  `internalOrExternalLink`), then types, then the component.
- After any Sanity schema change, run `npm run typegen` (in `studio/`).

## Safety Net Simulator (`/simulator`)

`simulator/README.md` is authoritative for this section.

- Never edit by hand `simulator/reference/index.html`, the ported calculation
  code (`frontend/lib/simulator/adapter.js`, `model.js` and the
  `BEGIN VERBATIM` blocks in `frontend/components/v2/simulator/`), or the
  engine, parameter and table files in `frontend/lib/simulator/engine/`.
- Any change touching the simulator must pass all of these before Minh sees a
  preview (commands in `simulator/README.md`):
  - the engine tests (`node simulator/tests/engine.test.js`)
  - the verbatim test (`node simulator/tests/verbatim.test.js`)
  - the numbers-equality harness, run with `--motion on` and with
    `--motion reduce`: 0 differences required
- Numbers refreshes: Minh's Cowork session prepares the new `parameters.json`
  (and CalEITC table) plus a regenerated reference build from her Benefits
  Engine folder, and gets her approval first. The code session then commits
  those files (updating the hashes in `verbatim.test.js`), runs every check,
  opens the PR and waits for approval.
- Rollback: revert the merge. As a last resort, restore the old `/simulator`
  rewrite to `https://safety-net-simulator.netlify.app`, which is frozen and
  should never be deployed to.
