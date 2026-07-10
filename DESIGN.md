---
version: alpha
name: Arc-Lobby-design-analysis
description: A playful multiplayer-gaming interface built on soft rounded cards, chunky friendly typography, and expressive visual elements. The system ships in both a warm cream light mode and a near-black navy dark mode, with hand-drawn decorative squiggles, sparkles, and dot-clusters scattered across the canvas to keep the "no accounts, no installs" pitch feeling like a toy rather than a tool. Purple is the brand anchor color; yellow, pink, and green rotate through as accent colors on badges, icons, and CTAs.

colors:
  primary: "#7C5CFC"
  primary-dark-mode: "#8B70FF"
  ink-light: "#171321"
  ink-dark: "#FFFFFF"
  body-light: "#6B6B76"
  body-dark: "#A8AEC4"
  muted-light: "#9A96A6"
  muted-dark: "#6E7387"
  canvas-light: "#FAF6EC"
  canvas-dark: "#0A0D18"
  card-light: "#FFFFFF"
  card-dark: "#12162A"
  hairline-light: "#ECE6D8"
  hairline-dark: "#232840"
  host-panel-light: "#FCF3D6"
  host-panel-light-border: "#F0D67E"
  host-panel-dark: "#1B1A12"
  host-panel-dark-border: "#4A4222"
  join-panel-light: "#EFE9FB"
  join-panel-light-border: "#D9CBF7"
  join-panel-dark: "#181A30"
  join-panel-dark-border: "#332C5C"
  on-primary: "#FFFFFF"
  on-accent-yellow: "#20180A"
  on-accent-dark: "#FFFFFF"
  accent-yellow: "#F6C445"
  accent-pink: "#FF5D8F"
  accent-green: "#57D08C"
  accent-orange: "#FF8A3D"
  accent-mint: "#3FBFA3"
  step-purple: "#7C5CFC"
  step-yellow: "#F6C445"
  step-pink: "#FF5D8F"
  success: "#3FBF6B"

typography:
  wordmark:
    fontFamily: "Baloo 2, Fredoka, sans-serif"
    fontSize: 56px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -0.5px
  display-lg:
    fontFamily: "Baloo 2, Fredoka, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  card-title:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: 0
  section-title:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  body-md:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  label-eyebrow:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.3px
  input-text:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  button:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0
  step-number:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 15px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0
  caption:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.2px

rounded:
  none: 0px
  sm: 8px
  md: 14px
  lg: 20px
  xl: 28px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

components:
  panel-card:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.card-title}"
    rounded: "{rounded.xl}"
    padding: 32px
  host-panel:
    backgroundColor: "{colors.host-panel-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.card-title}"
    rounded: "{rounded.lg}"
    padding: 24px
  join-panel:
    backgroundColor: "{colors.join-panel-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.card-title}"
    rounded: "{rounded.lg}"
    padding: 24px
  button-primary-dark:
    backgroundColor: "{colors.ink-light}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 48px
  button-accent-yellow:
    backgroundColor: "{colors.accent-yellow}"
    textColor: "{colors.on-accent-yellow}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 48px
  button-accent-purple:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 48px
  text-input:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.input-text}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    height: 48px
  avatar-frame:
    backgroundColor: "{colors.canvas-light}"
    rounded: "{rounded.full}"
    size: 160px
  edit-badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 36px
  icon-badge-circle:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 40px
  step-number-badge:
    backgroundColor: "{colors.step-purple}"
    textColor: "{colors.on-primary}"
    typography: "{typography.step-number}"
    rounded: "{rounded.full}"
    size: 32px
  feature-badge:
    backgroundColor: transparent
    textColor: "{colors.ink-light}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
  step-strip:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 20px 24px
  feature-strip:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 20px 32px
---

## Overview

Arc Lobby's marketing/onboarding surface is a warm, toy-box interpretation of a gaming utility: a cream (`{colors.canvas-light}`) or near-black navy (`{colors.canvas-dark}`) canvas holding a two-panel layout — a profile customizer on the left, a host/join flow on the right — surrounded by loose, hand-scattered decoration (orange squiggles, four-point sparkles, pink dot-clusters, faint stars). Nothing sits on a strict grid; ornamentation drifts into the margins the way stickers would on a laptop lid.

Structurally the page reads as **stacked rounded cards**: an outer `{component.panel-card}` holds each half of the layout, and two tinted sub-panels — `{component.host-panel}` (warm yellow tint) and `{component.join-panel}` (cool lavender tint) — nest inside the right-hand card to visually separate "create" from "join" without a heavier divider. Below the two-column layout, a horizontal `{component.step-strip}` walks the user through onboarding in three numbered, colored badges, and a final `{component.feature-strip}` closes the page with three trust icons in a single row.

**Key Characteristics:**
- Dual-mode canvas: warm cream light mode (`{colors.canvas-light}`) and near-black navy dark mode (`{colors.canvas-dark}`) — both modes keep the same layout and card tinting logic, only the base + card colors invert.
- Generous corner radius throughout — `{rounded.lg}` (20px) to `{rounded.xl}` (28px) on cards, `{rounded.md}` (14px) on buttons and inputs, `{rounded.full}` on avatars and icon badges.
- Two accent-tinted sub-panels (yellow "Host," lavender "Join") sit inside a neutral card — color-coding the two primary actions rather than relying on copy alone.
- Buttons swap surface color by mode: light mode uses near-black `{component.button-primary-dark}` buttons for both primary actions; dark mode swaps in bright `{component.button-accent-yellow}` (Create) and `{component.button-accent-purple}` (Join) so buttons stay legible and energetic against the dark canvas.
- Loose, non-grid-aligned decoration (squiggles, sparkles, dot pairs) scattered at canvas edges — always outside card boundaries, never overlapping content.
- Numbered onboarding steps use a rotating three-color badge sequence (purple → yellow → pink) rather than a single repeated brand color.

## Colors

### Brand & Accent
- **Primary Purple** (`{colors.primary}` — #7C5CFC): The wordmark accent ("Lobby"), avatar edit badge, icon badges, and the dark-mode "Join Lobby" button. The system's single most consistent brand color across both modes.
- **Primary Purple (Dark Mode)** (`{colors.primary-dark-mode}` — #8B70FF): A slightly brighter lift of the primary purple used specifically on dark-mode button fills, where the deeper shade would lose contrast against navy.
- **Accent Yellow** (`{colors.accent-yellow}` — #F6C445): Powers the "Host a New Room" panel tint and the dark-mode "Create Lobby" button. Reads as energetic/inviting — the "start something new" color.
- **Accent Pink** (`{colors.accent-pink}` — #FF5D8F): Used on decorative sparkle marks and the step-3 numbered badge.
- **Accent Green** (`{colors.accent-green}` — #57D08C): The "Safe & Private" shield icon.
- **Accent Orange** (`{colors.accent-orange}` — #FF8A3D): Reserved almost entirely for decorative squiggle lines — never used on interactive elements.
- **Accent Mint** (`{colors.accent-mint}` — #3FBFA3): Occasional secondary sparkle/dot color, used at low frequency for variety.

### Surface
- **Canvas Light** (`{colors.canvas-light}` — #FAF6EC): Default page floor in light mode — warm cream, not pure white.
- **Canvas Dark** (`{colors.canvas-dark}` — #0A0D18): Default page floor in dark mode — near-black with a faint blue undertone.
- **Card Light** (`{colors.card-light}` — #FFFFFF): Panel and card backgrounds in light mode, popped slightly brighter than the cream canvas.
- **Card Dark** (`{colors.card-dark}` — #12162A): Panel and card backgrounds in dark mode, one step up from canvas.
- **Host Panel Light / Dark** (`{colors.host-panel-light}` #FCF3D6 / `{colors.host-panel-dark}` #1B1A12): Tinted sub-panel background for the "Host a New Room" block in each mode.
- **Join Panel Light / Dark** (`{colors.join-panel-light}` #EFE9FB / `{colors.join-panel-dark}` #181A30): Tinted sub-panel background for the "Join with Room Code" block in each mode.

### Hairlines & Borders
- **Hairline Light / Dark** (`{colors.hairline-light}` #ECE6D8 / `{colors.hairline-dark}` #232840): Subtle 1px dividers, mostly used under input fields and between the "OR" separator rules.
- **Host / Join Panel Borders**: Each tinted sub-panel carries a slightly darker 1–1.5px border of its own hue (`{colors.host-panel-light-border}`, `{colors.join-panel-light-border}`, and their dark equivalents) rather than a neutral hairline — the border color always matches the panel family.

### Text
- **Ink Light / Dark** (`{colors.ink-light}` #171321 / `{colors.ink-dark}` #FFFFFF): Primary heading and label text.
- **Body Light / Dark** (`{colors.body-light}` #6B6B76 / `{colors.body-dark}` #A8AEC4): Paragraph and description copy inside cards.
- **Muted Light / Dark** (`{colors.muted-light}` #9A96A6 / `{colors.muted-dark}` #6E7387): Placeholder text, disabled states, minor captions.

### Semantic
- **Success** (`{colors.success}` — #3FBF6B): Reserved for confirmation states (e.g., lobby created, code copied) — not visible in the base screens but implied by the "Safe & Private" green shield.

## Typography

### Font Family
The system pairs two rounded sans typefaces: **Baloo 2** (or **Fredoka** as an equivalent) for the wordmark and any large display moment, and a cleaner geometric sans — **Plus Jakarta Sans** (or **Inter**) — for every card title, body line, label, and button. The split keeps the logo feeling toy-like and bouncy while everything users actually read and interact with stays crisp and legible at small sizes.

- Display (`{typography.wordmark}`, `{typography.display-lg}`) — bold, rounded, high-personality. Used exactly once per screen on the "Arc Lobby" wordmark.
- UI text (`{typography.card-title}` through `{typography.caption}`) — Plus Jakarta Sans / Inter at weights 400–800, never as rounded as the wordmark but still soft in stroke terminals.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.wordmark}` | 56px | 800 | 1.05 | -0.5px | "Arc Lobby" logo lockup — split two-tone (ink / purple) |
| `{typography.display-lg}` | 32px | 700 | 1.2 | 0 | Rare large section statements |
| `{typography.card-title}` | 20px | 800 | 1.3 | 0 | Card headers ("Customize Profile," "Host a New Room") |
| `{typography.section-title}` | 18px | 700 | 1.3 | 0 | Sub-panel headers, step-strip title |
| `{typography.body-md}` | 15px | 400 | 1.55 | 0 | Card description copy |
| `{typography.body-sm}` | 13px | 500 | 1.5 | 0 | Step/feature strip descriptions, captions |
| `{typography.label-eyebrow}` | 13px | 700 | 1.3 | 0.3px | Field labels ("DISPLAY NAME"), small uppercase tags |
| `{typography.input-text}` | 16px | 600 | 1.4 | 0 | Text-input values and placeholders |
| `{typography.button}` | 15px | 700 | 1.0 | 0 | All button labels — sentence case, no tracking |
| `{typography.step-number}` | 15px | 800 | 1.0 | 0 | Numerals inside step badges |
| `{typography.caption}` | 12px | 500 | 1.4 | 0.2px | Minor helper text |

### Principles
Unlike the tracked-uppercase convention common in technical/automotive systems, Arc Lobby keeps almost everything in **sentence case** — buttons, labels, and headers all read like natural speech ("Create Lobby," "Join Lobby," not "CREATE LOBBY"). The one exception is the small `{typography.label-eyebrow}` field label above the display-name input, which uses light tracking and can appear in uppercase for a "form field tag" feel.

Weight does the hierarchy work that size alone might otherwise carry: card titles jump straight to 800 while body copy sits at 400 — the jump is bigger and more sudden than a typical SaaS scale, matching the toy-like personality.

### Note on Font Substitutes
If Baloo 2 is unavailable, **Fredoka** or **Baloo Paaji 2** are close rounded-display substitutes. If Plus Jakarta Sans is unavailable, **Inter** or **DM Sans** cover the UI-text role with near-identical metrics.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 64px.
- **Card internal padding:** `{spacing.xl}` (32px) for the two primary panel cards; `{spacing.lg}` (24px) for the nested host/join sub-panels.
- **Gutters:** `{spacing.lg}` (24px) between the two main columns and between the three step-strip / feature-strip cells.
- **Section spacing:** `{spacing.section}` (64px) between the wordmark/intro block and the two-column card layout below it.

### Grid & Container
- **Primary layout:** Two-column split — a slightly narrower "Customize Profile" card on the left, a slightly wider "Host or Join Lobby" card on the right, roughly a 45/55 width split.
- **Nested sub-panels:** The right-hand card stacks its two sub-panels (`{component.host-panel}` then `{component.join-panel}`) vertically, separated by a thin "OR" divider rule with centered label text.
- **Step strip:** Three equal-width cells in a single row at desktop, each holding a numbered badge + icon + short label/description pair.
- **Feature strip:** Three equal-width cells in a single row, each holding an icon + bold label + one-line description, with vertical hairline dividers between cells (light mode) or no divider (dark mode, relying on spacing alone).
- **Max content width:** Centered container, roughly 1100–1200px at desktop, generous side margins to leave room for the scattered background decoration.

### Whitespace Philosophy
Whitespace in Arc Lobby is never fully "empty" — it's decoration space. Margins around the core two-column layout hold squiggles, sparkles, and dot pairs at low density, so the canvas always feels populated even where there's no functional content. Inside cards, spacing stays generous and airy (32px card padding) to keep the toy-like, uncluttered feel; the system never crowds text against card edges.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Page canvas, decorative squiggle/sparkle layer |
| Soft hairline | 1px `{colors.hairline-light}` / `{colors.hairline-dark}` | "OR" divider rule, feature-strip cell separators |
| Tinted panel | Colored background + matching-hue 1–1.5px border, no shadow | `{component.host-panel}`, `{component.join-panel}` |
| Card surface | `{colors.card-light}` / `{colors.card-dark}` background, soft ambient shadow, no border | `{component.panel-card}`, `{component.step-strip}`, `{component.feature-strip}` |
| Floating badge | Solid color fill, `{rounded.full}`, subtle shadow | `{component.edit-badge}`, `{component.icon-badge-circle}`, `{component.step-number-badge}` |

Depth is soft and diffuse rather than sharp — cards lift off the canvas with a light, low-contrast shadow (never a hard drop shadow), consistent with the toy/paper-cutout aesthetic.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Unused (retained for future layout elements) |
| `{rounded.sm}` | 8px | Rare — small inline chips |
| `{rounded.md}` | 14px | Buttons, text inputs |
| `{rounded.lg}` | 20px | Host/join sub-panels, step-strip and feature-strip cards |
| `{rounded.xl}` | 28px | Outer panel cards ("Customize Profile," "Host or Join Lobby") |
| `{rounded.full}` | 9999px | Avatar frame, edit badge, icon badges, step-number badges |

The radius hierarchy scales *up* with container size — the bigger the surface, the rounder its corners — which is the inverse of the sharp-edged, "bigger surface = sharper corner" convention seen in more technical systems. This consistently soft geometry, plus fully circular badges and avatars, is what gives Arc Lobby its toy-like personality.

## Components

### Header / Wordmark

**`wordmark-lockup`** — The "Arc Lobby" logo: "Arc" in `{colors.ink-light}`/`{colors.ink-dark}`, "Lobby" in `{colors.primary}`, both set in `{typography.wordmark}`. A small purple gamepad icon sits to the left, and a hand-drawn pink accent mark (two short diagonal strokes) sits just above-right of the wordmark as a permanent flourish — not decoration that varies per page.

### Buttons

**`button-primary-dark`** — The default light-mode CTA. Background `{colors.ink-light}` (near-black), text `{colors.on-primary}` (white), rounded `{rounded.md}` (14px), height 48px, padding 14px × 24px. Carries a small trailing arrow glyph (→). Used for both "Create Lobby" and "Join Lobby" in light mode — the two actions are differentiated by their panel tint, not button color.

**`button-accent-yellow`** — Dark-mode variant of the "Create Lobby" action. Background `{colors.accent-yellow}`, text `{colors.on-accent-yellow}` (near-black), same shape/sizing as `{component.button-primary-dark}`. Swapped in specifically because a black button would vanish against the dark navy canvas.

**`button-accent-purple`** — Dark-mode variant of the "Join Lobby" action. Background `{colors.primary-dark-mode}`, text `{colors.on-primary}` (white), same shape/sizing as the other buttons.

### Cards & Containers

**`panel-card`** — The two large outer cards that structure the page ("Customize Profile" and "Host or Join Lobby"). Background `{colors.card-light}`/`{colors.card-dark}`, rounded `{rounded.xl}` (28px), padding `{spacing.xl}` (32px), soft ambient shadow. Each opens with an `{component.icon-badge-circle}` + `{typography.card-title}` header row.

**`host-panel`** — Nested sub-panel for "Host a New Room." Background `{colors.host-panel-light}`/`{colors.host-panel-dark}` with a matching-hue border, rounded `{rounded.lg}` (20px), padding `{spacing.lg}` (24px). Holds a `{typography.section-title}`, one line of `{typography.body-md}` description, and a `{component.button-primary-dark}`/`{component.button-accent-yellow}`.

**`join-panel`** — Nested sub-panel for "Join with Room Code." Background `{colors.join-panel-light}`/`{colors.join-panel-dark}` with a matching-hue border, same radius and padding as `{component.host-panel}`. Holds a title, description, and a `{component.text-input}` for the 6-character code paired inline with a `{component.button-primary-dark}`/`{component.button-accent-purple}`.

**`step-strip`** — The "How to Play in 3 Steps" row. Three equal cells, each a `{component.step-number-badge}` (rotating purple/yellow/pink fill) beside a small icon, a bold one-line title (e.g., "SET PROFILE"), and a `{typography.body-sm}` description underneath. Cells sit inside a single rounded container or as three independent cards depending on viewport.

**`feature-strip`** — The closing trust row ("Safe & Private," "Made for gamers," "Instant & Easy"). Three cells, each an icon (shield / heart / lightning bolt) in its own accent color, a bold label, and a short `{typography.body-sm}` description. Light mode separates cells with thin vertical hairlines; dark mode relies on spacing alone.

### Inputs & Forms

**`text-input`** — Standard field used for both "Display Name" and "Enter 6-character code." Background `{colors.card-light}`/`{colors.card-dark}`, rounded `{rounded.md}` (14px), height 48px, padding 12px × 16px, 1px hairline border. A trailing pencil-icon affordance appears inside display-oriented inputs (like Display Name) to signal inline editability.

**`avatar-frame`** — Large circular profile-photo frame (~160px), background `{colors.canvas-light}`/`{colors.canvas-dark}`, holding the user's chosen emoji/icon centered inside. A small `{component.edit-badge}` (purple circle with pencil icon, ~36px) overlaps the bottom-right edge of the frame.

### Signature Components

**`decorative-squiggle`** — A loose, hand-drawn zig-zag line in `{colors.accent-orange}`, scattered at 2–4 points around the canvas edges (top-left, bottom-right corners). Purely ornamental, never inside a card.

**`decorative-sparkle`** — Small 4-point star / sparkle marks in `{colors.accent-pink}` or neutral gray, scattered near headings and card corners to add "pop" without adding UI weight.

**`decorative-dot-cluster`** — Small clusters of 4 dots arranged in a 2×2 grid, rendered in `{colors.accent-pink}` or muted gray, used as a minor textural accent near card edges.

**`icon-badge-circle`** — Small circular icon container (40px), background `{colors.primary}` or `{colors.accent-yellow}`, white/dark icon centered, used at the start of every card and sub-panel header row to identify its function at a glance.

## Do's and Don'ts

### Do
- Pair a bouncy display wordmark (`{typography.wordmark}`) with clean, restrained UI type (`{typography.card-title}` and below) everywhere else — the logo carries the personality; the interface stays legible.
- Color-code parallel actions through panel tint (yellow = host/create, lavender = join) rather than only through button color or copy.
- Swap button fill by mode (`{component.button-primary-dark}` in light mode → `{component.button-accent-yellow}` / `{component.button-accent-purple}` in dark mode) to preserve contrast against the canvas.
- Keep border radius scaling *up* with container size: buttons and inputs at `{rounded.md}`, sub-panels at `{rounded.lg}`, outer cards at `{rounded.xl}`.
- Scatter decorative squiggles/sparkles/dots only in the margins outside cards — never let ornamentation cross into content areas.

### Don't
- Don't set button or card-title text in uppercase with heavy tracking — the system's voice is sentence-case and conversational, not "machined."
- Don't use a hard, high-contrast drop shadow. Card elevation stays soft and diffuse to match the paper-cutout style.
- Don't introduce a fourth panel-tint hue beyond the established yellow (host) / lavender (join) pairing without a clear new action to differentiate.
- Don't let decorative elements (squiggles, sparkles, dots) sit at a density that competes with card content — they stay low-frequency and peripheral.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 600px | Single column; "Customize Profile" card stacks above "Host or Join Lobby" card; step-strip and feature-strip collapse to stacked single-column lists; wordmark scales down; decorative elements thin out to avoid crowding |
| Tablet | 600–1024px | Two-column layout retained but narrower gutters; step-strip stays 3-up if space allows, otherwise wraps to 2-up |
| Desktop | 1024–1440px | Full two-column layout at intended proportions; step-strip and feature-strip both render 3-up |
| Wide | > 1440px | Same as desktop with a wider centered container and more breathing room for background decoration |

### Touch Targets
- `{component.button-primary-dark}`, `{component.button-accent-yellow}`, and `{component.button-accent-purple}` render at 48px height — comfortably above the 44px minimum.
- `{component.text-input}` height is 48px, matching button height for visual alignment when paired inline (as in the "Join with Room Code" field + button).
- `{component.edit-badge}` (36px) and `{component.icon-badge-circle}` (40px) sit slightly under the 44px guideline but are supplementary controls, not primary actions.

### Collapsing Strategy
- The two-column desktop layout collapses to a single stacked column on mobile, with "Customize Profile" first and "Host or Join Lobby" second — matching the natural top-to-bottom reading order shown in the mobile screenshots.
- The nested host/join sub-panels always stay stacked vertically (never side-by-side), even on wide desktop, preserving the "OR" divider's meaning.
- Step-strip and feature-strip rows reduce from 3-up to 1-up stacked cards on mobile, each retaining its full icon + title + description.

### Image/Icon Behavior
- Decorative squiggles, sparkles, and dot clusters reduce in count (not just size) on mobile to avoid visual noise against the narrower canvas.
- The avatar frame stays circular and centered at every breakpoint, resizing from ~160px desktop down to a smaller mobile-appropriate size while keeping the edit badge proportionally anchored to its bottom-right edge.

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key (`{component.host-panel}`, `{component.step-number-badge}`).
2. New sub-panels default to `{rounded.lg}` (20px); new outer cards default to `{rounded.xl}` (28px).
3. When adding a new primary action, decide its light-mode fill (`{component.button-primary-dark}`) and its dark-mode accent swap before shipping — the two modes are never just an inverted-color pass.
4. Use `{token.refs}` everywhere — never inline hex.
5. Never document hover states beyond Default and Pressed — the clean micro-interactions carry the system's "delight" budget.
6. Keep the display/UI type-weight split intact: wordmark stays in `{typography.wordmark}`, everything else stays in the Plus Jakarta Sans / Inter family.
7. New accent-tinted panels should pick a color from the established palette (purple, yellow, pink, green) rather than introducing a new hue.
8. When in doubt about emphasis: a badge color change communicates more warmth than a new shadow or gradient would.

## Known Gaps

- The specific rounded display typeface is inferred visually (Baloo 2 / Fredoka family) — no font-loading metadata was available to confirm the exact licensed family in use.
- Hover, focus-ring, and error/validation states for `{component.text-input}` (e.g., an invalid room code) are not shown in the captured screens and are not documented here.
- Only the onboarding/lobby-creation screen was provided; in-game or active-lobby screens (once a room is live) are out of scope for this analysis.
- The "OR" divider's exact rule styling (dash pattern, weight) is approximated from the screenshot; a live inspection would confirm exact stroke values.
- Motion/transition behavior (e.g., how interactive elements animate on hover or on successful lobby creation) is not captured in static screenshots and is not documented here.