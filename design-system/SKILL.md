---
name: mbolden-change-design-system
description: >
  Design system for mBOLDen Change — a national nonprofit investing in
  Black women and non-binary leaders. Use this skill whenever designing
  artifacts (websites, landing pages, statements, reports, social posts,
  decks, emails) that should look and feel like mBOLDen Change.
---

# mBOLDen Change — Design System

A complete design language lifted from the production `mbolden-change-web`
Next.js + Sanity codebase: tokens, type, colors, spacing, shape primitives,
and ready-made UI kit components for marketing pages and editorial / long-form
content.

## When to invoke

Reach for this skill when the user asks for:

- A new page, section, or module for mboldenchange.org
- A statement, report, article, or op-ed in mBC's voice
- Social cards, email headers, or decks branded to mBC
- Rebrand artifacts that carry the tilted-parallelogram identity
- Anything "on-brand for mBOLDen Change"

Don't invoke this for a generic nonprofit or for work that should *break* from
the brand (skunkworks concepts, unbranded internal tools).

## How to use this skill

1. **Start in `README.md`** — CONTENT FUNDAMENTALS (voice, tone, vocabulary),
   VISUAL FOUNDATIONS (color, type, spacing, shapes, motion), and
   ICONOGRAPHY are all there. It's the source of truth; read end-to-end
   the first time.

2. **Link `colors_and_type.css`** in every HTML artifact you produce:

   ```html
   <link rel="stylesheet" href="path/to/colors_and_type.css">
   ```

   It declares ~120 CSS variables — brand colors, semantic roles, full type
   scale with custom classes (`.display-hero`, `.h1`, `.eyebrow`, etc.),
   spacing, radii, shadows, motion curves, and the two signature shape
   primitives (`.shape-tilt`, `.shape-skew-btn`). Never hard-code hex values
   when a token exists.

3. **Inspect the preview cards in `preview/`** before authoring new
   components — each card shows exactly how a token, pattern, or primitive
   renders in context.

4. **Lift components from `ui_kits/`**:
   - `ui_kits/marketing-web/` — full marketing-site kit in React (Header,
     Hero, StatementBanner, Pillars, CaseStudyHighlight, TestimonialSection,
     Footer, NewsletterModal). Use as the jumping-off point for any page
     on the primary web product.
   - `ui_kits/editorial/` — editorial / long-form article template with
     pull-quote, figure, related-reading grid. Use for statements, field
     reports, annual letters.

   Components are standalone HTML with inline `<script type="text/babel">`.
   Copy the patterns, not just the markup.

5. **Use the brand assets in `assets/`** — `logo-black.png` (tilted
   wordmark) and `quote-*.png` (5 colors of angled parallelogram quote
   marks). Never recreate the logo in SVG — always reference the PNG.

## Non-negotiables

- **The logo tilts.** `~-6.5°` natural rotation. Don't level it.
- **Primary buttons skew.** `transform: skew(-10.25deg)` + clip-path
  parallelogram. No rounded-rectangle primary CTAs.
- **Pure black is primary.** Not navy, not near-black. `#000`.
- **Sentence-case headlines.** All-caps lives in the logo and eyebrows only.
- **Emoji: essentially none.** One `📄` exception for PDF download links.
- **"We / our" voice.** Partners not beneficiaries; communities not clients.
- **Photography, not illustration, for human subjects.** Use placeholders
  when real photos aren't available — never illustrate people.

## Quick reference — most-used tokens

```
--brand-black:         #000000
--brand-warm-yellow:   #fad826     (energy / hover accent)
--brand-aqua-teal:     #0091ad     (links / testimonials bg)
--brand-fuchsia:       #b22f93     (quotes / tertiary / pillar border)
--brand-creamy-beige:  #f8efe0     (warm paper bg at 20% opacity)

--font-headline:       'Archivo Narrow', sans-serif    (700)
--font-body:           'Roboto', sans-serif            (400 / 500 / 700)

--radius-card:         16px
--radius-pill:         50px        (for "Read more" outline links only)

--shadow-card:         0 2px 6px rgba(0,0,0,0.04)
--shadow-btn:          0 4px 5px rgba(0,0,0,0.4)

--ease-house:          cubic-bezier(0.45, 0.05, 0.55, 0.95)
--dur-base:            300ms
```

## What's NOT in this system (yet)

- No animated video kit — if you need one, extend `ui_kits/` with an
  `animations/` directory that honors `--ease-house` and the tilt primitives.
- No deck template — a presentation kit is a future addition; for now,
  repurpose the marketing-web hero + statement-banner patterns inside
  `deck_stage.js`.
- No icon set — see ICONOGRAPHY in README; Lucide is the suggested CDN
  substitute, but the shipping site uses almost no utility icons at all.
- No data-visualization styling. The shipping site has no charts; if you
  need one, stay in the brand palette (black + one brand accent), avoid
  multicolor charts, and keep axes hairline-light.

## Revision notes

v1 (this version): derived from `mbolden-change-web@main`, rebrand era
(mid-2024 → present). Supersedes any *My New Red Shoes*–era brand material.
