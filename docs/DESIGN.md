---
version: 1.0
name: Flag-Forge-design-system
description: Flag Forge's own design system — a Vercel-inspired developer-platform language inverted to dark mode, where the entire decorative system is a single multi-stop mesh gradient (cyan / teal / green / amber) at hero scale, paired with a geometric sans for narrative and a monospaced face for the technical layer (labels, commands, flags, ports).
---

colors:
  # ── Surfaces (the four-step ladder) ──────────────────────
  canvas: "#06080a"           # page body — near-black ink
  surface: "#0d1117"          # cards, panels
  surface-2: "#161b22"        # hover / raised inset
  surface-3: "#1c2430"        # code blocks, terminal, deep inset
  hairline: "rgba(255,255,255,0.08)"
  hairline-strong: "rgba(255,255,255,0.16)"

  # ── Text ─────────────────────────────────────────────────
  ink: "#ffffff"              # headings, primary copy
  body: "#b6c2d1"             # secondary copy
  mute: "#6b7a8f"             # tertiary, captions, placeholders

  # ── Brand ────────────────────────────────────────────────
  accent: "#2ee59d"           # Flag Forge green — the conversion color
  accent-deep: "#00c853"
  accent-soft: "rgba(46,229,157,0.12)"
  accent-glow: "0 0 24px rgba(46,229,157,0.35)"

  # ── Gradient stops (the only decoration, hero scale only) ──
  g-cyan: "#00b8d4"
  g-teal: "#00dfd8"
  g-green: "#2ee59d"
  g-deep-green: "#00c853"
  g-lime: "#00e676"
  g-amber: "#ffd600"

  # ── Semantic ─────────────────────────────────────────────
  success: "#2ee59d"
  warning: "#f5a623"
  danger: "#ff5c6c"
  danger-soft: "rgba(255,92,108,0.12)"
  link: "#00dfd8"

typography:
  display-xl:
    fontSize: clamp(2.75rem, 6vw, 4.5rem)
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.035em
  display-lg:
    fontSize: clamp(2rem, 4vw, 2.5rem)
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.025em
  display-md:
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: -0.02em
  display-sm:
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.015em
  body-lg:
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.55
  body-md:
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.35
  caption-mono:
    fontFamily: "var(--font-mono)"
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.35
  code:
    fontFamily: "var(--font-mono)"
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.55

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 100px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 40px
  3xl: 48px
  4xl: 64px
  5xl: 96px
  6xl: 128px
  section: 192px

components:
  nav-bar:
    background: "rgba(6,8,10,0.72)"
    blur: 16px
    height: 64px
    borderBottom: "{colors.hairline}"
  button-primary:
    background: "{colors.accent}"
    text: "#000000"
    rounded: "{rounded.pill}"
    height: 44px
  button-secondary:
    background: "transparent"
    text: "{colors.ink}"
    border: "{colors.hairline-strong}"
    rounded: "{rounded.pill}"
    height: 44px
  card:
    background: "{colors.surface}"
    border: "{colors.hairline}"
    rounded: "{rounded.md}"
    shadow: "{shadows.level-2}"
  terminal:
    background: "{colors.surface-3}"
    border: "{colors.hairline}"
    rounded: "{rounded.md}"
    typography: "{typography.code}"
  badge:
    background: "{colors.surface-2}"
    text: "{colors.body}"
    rounded: "{rounded.full}"
    typography: "{typography.caption}"
  badge-live:
    background: "{colors.accent-soft}"
    text: "{colors.accent}"

---

## Overview

Flag Forge is a security-training platform for people who already live in a terminal. The
audience is developers and security engineers — so the site borrows the posture of a
developer platform (Vercel, Linear, Stripe) rather than the posture of a game lobby.

That means: **calm, engineered, trustworthy.** Dense enough to feel like a real product,
clean enough to let the terminal mockups and command strings be the loudest thing on
the page. Nothing decorative competes with the technical layer.

The single decorative move is a **multi-stop mesh gradient** — cyan → teal → green →
amber — used at hero scale only. It appears exactly twice on the site (home hero, one
feature band) and is never miniaturised into an icon, a badge, or a button.

**Key characteristics:**

- Near-black canvas (`#06080a`) with a card surface one step up (`#0d1117`). Depth comes
  from the surface ladder and hairline borders, never from heavy drop shadows.
- One green (`#2ee59d`) carries every conversion target: the primary CTA, live status,
  stat values, focus rings. Nothing else is green.
- Two typefaces with strict jobs: a geometric sans for narrative, a monospace for the
  technical layer (eyebrows, commands, flags, port numbers, timestamps).
- Section eyebrows and labels are always mono. Body copy is never mono.
- Cards are held by a hairline ring + a stacked shadow, not by a floating drop shadow.

## Colors

### Surfaces
- **Canvas** (`#06080a`) — the page body. Every band sits on this or one step up.
- **Surface** (`#0d1117`) — cards, panels, the challenge page's section blocks.
- **Surface 2** (`#161b22`) — hover states, inset chips, tab rows.
- **Surface 3** (`#1c2430`) — terminal windows and code blocks (the deepest inset).
- **Hairline** (`rgba(255,255,255,0.08)`) — the universal divider. 1px, never heavier
  than `hairline-strong` (`rgba(255,255,255,0.16)`) for active edges.

### Text
- **Ink** (`#ffffff`) — headings and primary copy.
- **Body** (`#b6c2d1`) — secondary copy, descriptions, inactive nav.
- **Mute** (`#6b7a8f`) — captions, placeholders, fine print, disabled states.

### Brand
- **Accent** (`#2ee59d`) — the conversion color. Primary CTA background, live status,
  stat values, link hover, focus ring. It is the only green in the system.
- **Gradient stops** — the mesh gradient's six stops (`#00b8d4` → `#00dfd8` → `#2ee59d`
  → `#00c853` → `#00e676` → `#ffd600`). Used **only** inside `.mesh-gradient`.

### Semantic
- **Success** = accent. **Warning** `#f5a623`. **Danger** `#ff5c6c` (destructive actions,
  error alerts). **Link** `#00dfd8`.

## Typography

### Font Family
1. **Geometric sans** — `Inter` (400 / 500 / 600) with a `system-ui` fallback chain.
   Carries display, body, buttons, links, labels. Weights 400/500/600 only — **600 is the
   ceiling**, never 700+.
2. **Monospace** — `JetBrains Mono` (400) with a `ui-monospace, SFMono-Regular, Menlo,
   Monaco` fallback chain. Carries eyebrows, terminal bodies, commands, flags, ports,
   counts, and every `label` that wants a technical voice.

Both are referenced as system families, never fetched from a CDN — the site runs under a
strict `default-src 'self'` CSP with no remote scripts, styles, or fonts.

### Hierarchy

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | clamp(2.75–4.5rem) | 600 | -0.035em | Hero headline. |
| `display-lg` | clamp(2–2.5rem) | 600 | -0.025em | Section headline. |
| `display-md` | 1.5rem | 600 | -0.02em | Card-cluster headline. |
| `display-sm` | 1.25rem | 600 | -0.015em | Inline micro-heading. |
| `body-lg` | 1.125rem | 400 | 0 | Lead paragraph. |
| `body-md` | 1rem | 400 | 0 | Default body. |
| `body-sm` | 0.875rem | 400 | 0 | Secondary body, nav links, small buttons. |
| `caption` | 0.75rem | 400 | 0 | Fine print, badge labels. |
| `caption-mono` | 0.75rem | 400 | 0 | Section eyebrows, technical labels. |
| `code` | 0.8125rem | 400 | 0 | Terminal bodies, commands, flags. |

### Principles
- **Negative tracking is part of the voice.** Display sizes track negatively; body is neutral.
- **Sentence-case headlines, period-terminated.** "Break in. Forge the flag."
- **Mono for the technical layer only.** Eyebrows, commands, ports, flags. Never a paragraph.
- **Weight 600 is the display ceiling.** The system reads calmer because of it.

## Layout

### Spacing System
Base unit **4px**. Tokens: `4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 96 · 128 · 192`.

- Section padding: `64px` → `96px` vertical. Hero stretches to `128px`.
- Card interior: `24px` → `32px`.
- Inline gap: `12px` → `24px`.

### Grid & Container
- Max width **1400px**, centred, 24px gutters (16px on mobile).
- Feature/stat rows: **3-up** at desktop → 2-up at tablet → 1-up at mobile.
- Challenge grids: `minmax(360px, 1fr)` auto-fill.

### Whitespace Philosophy
The gradient does the decorative lifting; whitespace separates the bands. Large gaps
between sections, tight interiors within a card. The page should feel *engineered*.

### Responsive Strategy

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 600px | Nav collapses to a hamburger overlay; hero stacks; 3-up rows drop to 1-up; tab pill rows scroll horizontally. |
| Tablet | 600–959px | 3-up rows drop to 2-up; nav stays horizontal. |
| Desktop | 960–1199px | Full 3-up rows. |
| Wide | 1200–1399px | Container caps at 1400px. |
| Ultra-wide | ≥ 1400px | Content holds max-width; bands stretch edge to edge. |

### Touch Targets
- `button-primary` / `button-secondary`: 44px tall, 100px radius.
- Nav CTAs: 28px tall, 6px radius, `padding: 0 8px` — inflated via `min-height: 44px` on mobile.
- Nav links: 8px 12px padding, `rounded-full` ghost pill.

### Collapsing Strategy
- **Nav**: logo + link row + CTA cluster at desktop → logo + hamburger at mobile, menu
  opens as a full overlay.
- **Hero**: headline + body stack vertically at every breakpoint. Never a split hero.

## Elevation & Depth

On a near-black canvas, black shadows are nearly invisible — so the elevation ladder is
built from **hairline rings + a light top-edge highlight + a soft ambient shadow**.

| Level | Treatment | Use |
|---|---|---|
| Level 0 — Flat | No shadow, no border. | Full-bleed bands, the terminal window's inner body. |
| Level 1 — Hairline | `inset 0 0 0 1px rgba(255,255,255,0.06)` | Default card chrome. |
| Level 2 — Soft Stack | Level 1 + `0 1px 1px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)` | Standard cards. |
| Level 3 — Raised | Level 2 + `0 8px 16px -8px rgba(0,0,0,0.5)` | Feature cards, hover state. |
| Level 4 — Float | Level 3 + `0 16px 32px -12px rgba(0,0,0,0.6)` | Callout panels, terminal windows. |
| Level 5 — Modal | Level 4 + `0 24px 48px -16px rgba(0,0,0,0.7)` | Dialogs, dropdowns. |

The brand uses **stacked** shadows — multiple small offsets — never a single
generic drop-shadow. Hairline rings are always present so the card edge stays crisp.

### Decorative Depth
- **Mesh gradient as atmospheric depth** — the only atmospheric effect. A flat 2-D
  backdrop, blurred, behind the hero and one feature band.
- **Surface-step depth** — switching from `canvas` → `surface` → `surface-3` is the
  site's chief depth cue.
- **Accent glow on focus and live state only** — `0 0 24px rgba(46,229,157,0.35)`.

## Shapes

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | Tightest inline chip. |
| `sm` | 6px | Nav CTAs, form inputs, small buttons. |
| `md` | 8px | Cards, panels, the default. |
| `lg` | 12px | Large cards, the challenge page's sections. |
| `xl` | 16px | Cards hosting a hero image cap. |
| `pill` | 100px | Marketing CTAs. |
| `full` | 9999px | Badges, avatars, circular icon buttons, tab pills. |

## Components

### Buttons

**`button-primary`** — the canonical pill.
- Background `{colors.accent}`, text `#000`, `rounded: pill`, 44px tall, weight 500.
- Hover: lift 2px + `accent-glow`. Active: translate 0.

**`button-secondary`** — the outlined pill.
- Transparent background, 1px `hairline-strong` border, `ink` text, `rounded: pill`.
- Hover: background `surface-2`, border brightens.

**`button-ghost`** — 6px radius, `surface-2` background, `body` text. For in-page actions
(stop, extend, copy) where a 100px pill would shout.

**`button-danger`** — 6px radius, `danger-soft` background, `danger` text.

### Cards & Containers

**`card`** — the standard card.
- Background `surface`, 1px `hairline` border, `rounded: md`, 24px padding, Level 2.
- Hover (interactive cards): Level 3 + `border-color: accent` at 40% + 4px lift.

**`card-soft`** — `surface-2` background, no shadow. For nested/inset groups.

**`terminal`** — the code-editor mockup.
- Background `surface-3`, `rounded: md`, 24px padding, `code` typography, mono.
- Optional top bar with three dots + a copy button.

**`stat-card`** — value + label, stacked. Value in `accent` at `display-md` in mono
for stats that are numbers, label in `body-sm` `mute`.

**`badge`** — `surface-2` background, `body` text, `caption`, `rounded: full`.
**`badge-live`** — `accent-soft` background, `accent` text, with a pulsing dot.
**`badge-danger`** — `danger-soft` background, `danger` text.

### Navigation

**`nav-bar`** — sticky, 64px, `rgba(6,8,10,0.72)` + `backdrop-filter: blur(16px)`,
1px bottom hairline. Logo left, link row centre, CTA cluster right.

**`nav-link`** — `body` color, `body-sm`, 8px 12px padding, `rounded: full` ghost pill
whose background appears on hover. Active state = `accent` text + `accent-soft` pill.

**`nav-cta`** — 28px tall, 6px radius. `--primary` variant uses `accent` background.

### Signature Components

**`mesh-gradient`** — the site's one decorative system.
- Layered radial gradients in cyan → teal → green → amber, `filter: blur(48px)`,
  `opacity: 0.55`, positioned behind the hero or a feature band.
- Full-bleed. Never cropped to a frame. Never reduced to a single colour. Never at icon scale.

**`hero-band`** — headline + lead + CTA row over the mesh gradient.
- Mono badge → `display-xl` headline → `body-lg` lead → CTA row.

**`feature-band`** — 2-column: copy on the left, a visual (terminal or card stack) on
the right. Sits on `canvas`, padding 96px.

**`showcase-band-dark`** — `surface` background band used to flip polarity mid-page.
- Contains a `terminal` window flush with the band.

**`footer`** — 4 columns. Column labels in `caption-mono` (uppercase). Links in `body-sm`.

### Forms

**`form-input`** — `surface` background, 1px `hairline` border, `body-sm`, 40px tall,
`rounded: sm`. Focus: border `accent` + `accent-glow`.

## Do's and Don'ts

### Do
- Reserve `accent` for primary CTAs, live status, stat values, and focus rings.
- Set every headline in `display-*` at weight **600**, sentence-case, period-terminated.
- Keep negative tracking on display sizes.
- Use the mesh gradient at hero scale only — twice on the whole site.
- Layer stacked shadows with a hairline ring rather than one heavy drop.
- Cycle surfaces `canvas` → `surface` → `surface-3` for section depth.
- Set every command, port, flag, count, and eyebrow in mono.

### Don't
- Don't introduce a second accent color. Ink + gray + green + the gradient stops.
- Don't render headlines in all-caps.
- Don't use weight 700+.
- Don't miniaturise the gradient into an icon, a badge, or a button.
- Don't pair the 100px pill CTA with the 6px button radius on the same screen.
- Don't set a body paragraph in mono.
- Don't add a single heavy drop-shadow to a card.
