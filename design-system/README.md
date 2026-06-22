# mBOLDen Change — Design System

> Bold, community-led solutions for a more equitable world.

mBOLDen Change (formerly **My New Red Shoes**) is a national nonprofit that has, since 2006, distributed more than $2.5M in direct economic assistance, delivered basic needs to 250,000+ individuals, and partnered with hundreds of organizations to advocate for policies that uplift children and families. The 2024 rebrand signals an evolution from program-delivery to systems-change: from enlisting partners → co-creating with them; from in-kind goods → flexible cash; from annual service → year-round systems support.

This design system exists so any teammate — or any design agent — can produce on-brand artifacts (mocks, decks, articles, reports, statements, social posts) in minutes, grounded in the exact tokens, type, and visual language shipped in the live web product.

---

## Sources

| Source | Location | Notes |
|---|---|---|
| Production web codebase | `Mbolden-Change/mbolden-change-web` (branch: `main`) | Next.js + Sanity CMS. Design tokens live at `frontend/app/globals.css` & `frontend/app/design-tokens.scss`. All colors, type scale, and shape primitives in this system are lifted directly from there. |
| Brand logo | `uploads/mBOLDenChange_LOGO_Black (1).png` → `assets/logo-black.png` | Tilted/angled wordmark — the tilt is a load-bearing part of the identity. |
| Existing brand assets imported | `frontend/public/bold-quote-marks/*` → `assets/quote-*.png` | Angled parallelogram quote marks in 5 brand colors. |
| OG banner | `frontend/public/og-image.png` → `assets/og-image.png` | Tilted wordmark on white, confirms the logo's natural rotation. |

---

## Index — what's in this folder

```
README.md                  ← you are here
SKILL.md                   ← Agent Skills manifest (portable to Claude Code)
colors_and_type.css        ← CSS variables (colors, type, spacing, radii, shadows, motion, shapes)

assets/
  logo-black.png             Primary logo (tilted parallelogram wordmark)
  quote-aqua / black /
    fuchsia / white /
    yellow.png               Angled quote-mark flags (used in testimonials + pull-quotes)
  og-image.png               OG card banner
  favicon-32.png             Favicon
  favicon-apple.png          Apple touch icon

preview/                   ← Design-system cards (registered in the Design System tab)
  type-*.html                Typography specimens
  color-*.html               Palettes and semantic colors
  spacing-*.html             Spacing, radii, shadow scales
  component-*.html           Buttons, cards, inputs, badges, links
  brand-*.html               Logo usage, quote marks, signature shapes

ui_kits/
  marketing-web/             High-fidelity recreation of the mboldenchange.org site
    index.html, *.jsx, README.md
  editorial/                 Educational resources (statements, articles, reports)
    index.html, *.jsx, README.md
```

---

## CONTENT FUNDAMENTALS

The brand voice is **warm, direct, and advocacy-forward** — speaks to systems and power rather than charity and pity.

### Voice & tone
- **We / Our** — collective, partnership-first. The brand describes itself as *"we"* and describes audiences as *"partners,"* *"communities,"* *"children and families"* — never *"clients"* or *"beneficiaries."*
- **Active verbs, not aspirational fluff.** *"Incubate bold, community-led solutions. Dismantle barriers. Close equity gaps. Drive lasting, systems-level change."* (from site metadata)
- **Equity vocabulary is explicit, not euphemistic:** *"marginalized communities,"* *"shift power,"* *"expand opportunity."* This is not a brand that says *"underserved."*
- **Present-tense, present-work:** *"co-creating solutions,"* *"strengthening the systems,"* *"advocating for policies."* Describes what's happening now, not what they once did.
- **The "from → to" construction** is a signature pattern — used in the rebrand story to show evolution. Use it for any before/after framing.

### Casing
- The **brand name** is set `mBOLDen Change` — lowercase `m`, uppercase `BOLD`, lowercase `en`, capitalized `Change`. Never `Mbolden`, never all-caps `MBOLDEN`. The typographic emphasis on `BOLD` is intentional — "bold" is the operative word.
- Headlines use **sentence case** or **Title Case**; not SCREAMING ALL CAPS. The logo is the one place all-caps lives.
- Eyebrow labels (small uppercase meta-text) use `text-transform: uppercase` with 0.05–0.12em tracking (token `--text-eyebrow-track`).
- Buttons: UPPERCASE + `letter-spacing: 0.02em` in the TextMedia block; sentence-case in the header/nav donate button. Both patterns are shipping — match the block context.

### Tone checklist
- **I vs You:** "We" is primary, "you" (reader) is used in CTAs (*"Sign up for our Newsletter,"* *"Join us"*). Avoid "I."
- **Emoji:** Essentially unused. The codebase has exactly one emoji — a `📄` preceding a "Download PDF" link on statement pages. If you must, stay in that same functional-utility register (document icons, nothing decorative).
- **Punctuation:** Em-dashes are welcome. Exclamation points are rare — this is a serious brand.
- **Length:** Hero headlines 5–10 words. Body paragraphs run long (18px, 1.6–1.7 line-height) — the design supports reading, not skimming.

### Examples (from the shipping site)
- Meta description: *"mBOLDen CHANGE is a national nonprofit that incubates bold, community-led solutions to dismantle barriers, close equity gaps, and drive lasting, systems-level change."*
- Social card tagline: *"Bold, community-led solutions for a more equitable world."*
- Primary CTA: *"Sign up for our Newsletter"* / *"Donate"* / *"Read more"*
- Rebrand narrative: *"While the name is new, our values, relationships, and approach remain grounded in trust, collaboration, and shared purpose."*

---

## VISUAL FOUNDATIONS

The mBOLDen Change visual system is built on one idea: **a bold, tilted rectangle.** The logo is a tilted parallelogram, the buttons are tilted parallelograms, the quote marks are tilted parallelograms, the hero imagery clips at a tilt. Everything leans. Nothing sits on a perfect 90° grid. This is the single most important visual signature — don't break it.

### Color
- **Black (`#000000`)** is the dominant brand color. Primary buttons, footer, logo, body text all land on pure black. This is a high-contrast, confident system.
- **Warm yellow `#fad826`** is the energy accent — donate-button hover, underline flourishes, highlight states. Used sparingly but boldly.
- **Aqua teal `#0091ad`** is the link/interactive color — hover underlines, active nav states, focus rings, secondary buttons.
- **Fuchsia `#b22f93`** is the quote/testimonial color — blockquotes, pull-quotes, tertiary buttons, hover-secondary. Voice of the community.
- **Creamy beige `#f8efe0`** is the warmth layer — body background sits at 20% opacity of this color, giving the page a slightly-off-white warm paper feel (not pure white).
- **Light gray `#e2e2e2`** is the only neutral divider / border.
- No gradients beyond a single **hero-bg gradient** (beige 35% → white) in `--ds-gradient-hero-bg`.

### Typography
- **Headlines: Archivo Narrow 700** — condensed, tall, bold. Pairs with the tilted logo aesthetic.
- **Body: Roboto 400 / 700** — neutral, readable, carries long-form content (statements, reports run 800px max-width with 1.7 line-height).
- H1 is 48px; Hero XL clamps up to 80px. Letter-spacing slightly tight (-0.4px) on headlines.
- Portable-text (CMS rich-text) scales up dramatically in long-form: `.headline-1` hits 72px / 500 weight, `.headline-2` 64px. Long-form headlines are larger than landing-page H1s.

### Spacing & layout
- 12-column grid (`Grid` / `GridItem` components). Desktop breakpoint at 768px.
- Section vertical padding clamps from 2.5rem mobile → 5rem desktop.
- Content max-width: articles 800px; marketing layouts 1200px.
- Space scale: 4 / 8 / 16 / 24 / 32 / 48 / 80px (xs–3xl).

### Backgrounds
- **Paper-warm body:** `rgb(248 239 224 / 0.2)`. Slightly beige, never pure white.
- **Full-bleed hero imagery** with a dark overlay (`rgba(0,0,0,0.401)`) and text sitting in a bottom-anchored overlay panel. No centered hero text.
- **Testimonial sections flood aqua-teal** as a full-width color block.
- **Statement banners** take arbitrary background colors via CMS — the block was designed to carry brand-color statements.
- **No repeating patterns, no textures, no grain, no illustrations** in the source. The brand does not use hand-drawn illustration — it uses photography + bold type + tilted blocks.

### Corner radii
- `8 / 12 / 16px` scale. 16px is the common card radius; 12px for image wrappers; pill/50px only on outline-style "read more" links.
- **Primary buttons have NO border-radius** — they're sharp-edged parallelograms via `clip-path`.
- Testimonial polaroids: 16px radius on the card, 0 radius on the image inside (the photo is sharp-edged inside a rounded frame).

### Cards
- White fill, 1px light-gray border, 16px radius, `0 2px 6px rgba(0,0,0,0.04)` shadow. Restrained elevation — cards feel printed, not floating.
- Pillar cards invert: white fill with a **fuchsia 1px border** and light-gray shadow. Hover lifts -4px.

### Buttons
- **Primary** (header donate, TextMedia CTA, Hero CTA): pure black fill, white text, **skewed `-10.25deg`** with `clip-path` making it a tilted parallelogram, drop-shadow `0 4px 5px rgba(0,0,0,0.4)`. Hover sweeps the yellow/fuchsia fill in from the left via `::before` pseudo-element `transform: scaleX(0→1)`.
- **Secondary** (atoms/Button): 2px black outline, transparent fill. Hover → aqua fill + white text.
- **Tertiary:** transparent, fuchsia text, hover underlines. For quiet in-line CTAs.
- **"Read more" pill:** 2px aqua outline, 50px radius, hover flips to black fill + yellow border.

### Shapes (the signature move)
- `transform: skew(-10.25deg)` + `clip-path: polygon(0% 10%, 100% 0%, 100% 90%, 0% 100%)` = the mBOLDen Change parallelogram. This shape is used on the donate button, newsletter button, and case-study highlight images.
- The **logo itself is tilted ~-6.5°** (`--brand-tilt`). When you place the logo inline with straight text, let it tilt — don't rotate it to level.
- Quote marks are already pre-tilted PNG assets (`assets/quote-*.png`) — use them instead of typographic `"` characters.

### Borders & dividers
- 1px `#e2e2e2` on cards and tab navigation.
- 2px black on outline buttons.
- **Left-border blockquote** uses 2px aqua-teal (`--brand-aqua-teal`).
- Focus ring: 3px `--brand-aqua-teal` outline with 1px offset.

### Shadows
- `shadow-card: 0 2px 6px rgba(0,0,0,0.04)` — cards
- `shadow-header: 0 1px 3px rgba(0,0,0,0.04)` — sticky header
- `shadow-btn: 0 4px 5px rgba(0,0,0,0.4)` — primary buttons (this is darker than typical; intentional)
- `shadow-raised: 0 4px 24px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.04)` — raised surfaces
- Videos get a **colored hover-glow:** `0 0 16px 8px rgba(0, 145, 173, 0.3)` (aqua aura).
- No inset shadows. No purple/blue drop-shadows.

### Transparency & blur
- Body background uses `rgb(x / 0.2)` — 20% beige tint.
- Hero overlay: `rgba(0,0,0,0.401)` — a precise, not-quite-40% darkening layer.
- **No backdrop-blur** anywhere in the codebase. No glassmorphism.

### Animation & motion
- **Easing:** `cubic-bezier(0.45, 0.05, 0.55, 0.95)` is the house curve — used on every link underline and hover fill. (Custom-S, slightly rigid, feels confident.)
- **Underline sweeps** (left→right or center-out) on link hover via `transform: scaleX` — the primary hover affordance, brand-wide.
- **Button fill sweeps** horizontally via `::before` scaleX. Not fades. Not color transitions. Sweeps.
- **Card lift:** `translateY(-4px)` + shadow bump on pillar cards.
- **Scroll-reveal:** GSAP ScrollTrigger is imported (`AnimationComponent.tsx`). FiftyFifty boxes slide in from the side; card galleries slide up. Durations 0.05–3s with snapping.
- **Social icon hover:** yellow ring scales from 0→1 around the icon.
- Durations: `200ms` (fast), `300ms` (base for underlines), `400–450ms` (button fills).

### Hover & press states
- **Text links:** underline sweep in brand-aqua (or brand-yellow in footer).
- **Primary buttons:** background sweep to yellow (or fuchsia); text flips to black. No shrink, no opacity change.
- **Outline buttons:** fill becomes aqua, border matches fill, text flips to white.
- **Icons:** light-gray circle background fills behind on hover.
- **Disabled:** 50% opacity, no shadow, cursor default. No special styling beyond opacity.
- **Press state on primary:** shadow removed, background stays yellow/fuchsia.

### Layout rules (fixed elements)
- **Header:** sticky top, 90px tall, white, `z-index: 1000`, subtle 1px shadow. Logo left, nav center-right, donate button far right.
- **Footer:** black background, white text, 48px padding, 12-col grid with org info, link columns, social row, newsletter signup.
- **Pop-up modal:** Action Network newsletter signup modal. Summoned from footer CTA.

### Iconography → see next section.

---

## ICONOGRAPHY

The mBOLDen Change web product is **iconography-light by design.** There is no icon font, no Lucide/Heroicon dependency, no sprite sheet. The visual identity carries itself through type, color, and the signature tilted shapes — not through small glyphs.

### What IS used
- **Hamburger menu** (hand-rolled in CSS — three `.bar` divs stacked vertically; see `Header.module.css`). Not an SVG icon.
- **Social icons** via the `react-social-icons` npm package (renders per-platform SVGs at runtime). Used only in the footer. We don't inline their SVGs in this system — if you need social icons in a static mock, grab them from the respective brand's kit (Instagram, LinkedIn, Facebook, etc.) or use simple monochrome SVGs matching the footer's `fgColor="#fff"`.
- **Quote marks** are custom PNG assets: `assets/quote-aqua.png`, `quote-black.png`, `quote-fuchsia.png`, `quote-white.png`, `quote-yellow.png`. They're *angled parallelogram* pairs — not typographic `"` characters. Use them at 40–56px in testimonial blocks and pull-quotes.
- **Carousel arrows** — simple left/right chevrons inside an `.arrowButtonsContainer` with a translucent white bg. No specific icon library; keep these minimal.
- **One emoji** — `📄` on statement pages, prefixing "Download PDF". This is the only emoji in the entire codebase. If you add an emoji, use this same pattern (utilitarian, file-type indicator) or don't.

### How to add icons when you need them
When a design genuinely needs utility icons (menu chevrons, checkmarks, close-X, external-link indicator), reach for **Lucide icons** from CDN:
```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="arrow-right"></i>
```
Lucide's 2px stroke weight, rounded line-caps, and restrained silhouette match the brand's confident-but-uncluttered feel. **This is a substitution** — the real codebase doesn't use Lucide; flagging here. If we later build a custom icon set it should be 24px, 2px stroke, rounded-cap, monochrome, aligned to the Archivo-Narrow/Roboto weight rhythm.

### What NOT to do
- No decorative emoji. No 🎉 🚀 ✨. The brand is serious about equity — decorative emoji undercut the voice.
- No multicolor / duotone icons.
- No circular badge-icons on colored backgrounds.
- No SVG illustrations of people / families / communities. The site uses **real photography** for human subjects — substitute placeholder images, never illustrate.

---

## Known substitutions & caveats

- **Fonts:** Archivo Narrow and Roboto are loaded from Google Fonts CDN (`fonts.googleapis.com`) — same as the production site (`next/font/google`). No local `.ttf` files needed.
- **Photography:** the shipping site uses real photographs of families, partners, and events (Sanity-hosted). This design system does not redistribute those photos. UI-kit mocks use solid color placeholders or free stock. When producing final artifacts, pull imagery from the CMS or brand photo library.
- **No Figma file provided.** All tokens, components, and spacing are derived from reading the shipping CSS and TSX in `mbolden-change-web@main`.
- **React animation (GSAP):** the scroll animations are ignored in static mocks. If a production context needs them, wire up `gsap` + `ScrollTrigger` the same way `AnimationComponent.tsx` does.

See `SKILL.md` for how to use this design system from Claude Code or another agent environment.
