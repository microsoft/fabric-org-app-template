---
name: app-design
description: Apply Fabric design tokens, spacing, typography, and Segoe UI font conventions when adjusting layout or chrome of the Org App template. Use when the user asks to polish the UI, adjust spacing, change typography, or improve visual hierarchy.
---

# app-design

## What this skill covers

This template ships with the Fabric design token system from `src/global.css`. Use these tokens — never raw pixel values or arbitrary hex colors — when adjusting the shell, sidebar, or empty-state UI.

## Token cheatsheet

### Spacing (use Tailwind utilities)

| Token | Value | Tailwind class |
|---|---|---|
| `--spacing-xs`  | 2px   | `gap-xs p-xs m-xs` etc. |
| `--spacing-s`   | 4px   | `gap-s` |
| `--spacing-m`   | 8px   | `gap-m` |
| `--spacing-l`   | 16px  | `gap-l` |
| `--spacing-xl`  | 24px  | `gap-xl` |
| `--spacing-xxl` | 32px  | `gap-xxl` |

### Typography

| Token | Size / line-height | Tailwind class |
|---|---|---|
| `text-200 leading-200` | 12px / 16px | secondary text, captions |
| `text-300 leading-300` | 14px / 20px | body text, nav items |
| `text-400 leading-500` | 16px / 22px | section headings |
| `text-600 leading-600` | 24px / 32px | page titles |
| `text-700 leading-700` | 32px / 40px | hero titles (empty state) |

Always pair `text-*` with the matching `leading-*` token.

### Font families

- **Sans (default)**: `font-sans` → "Segoe UI" stack — body text
- **Heading**: `font-heading` → "Segoe UI Variable" stack — titles
- **Mono**: `font-mono` → "Cascadia Code" stack — code, IDs, embed URLs

### Surface colors (theme-aware)

| Class | Use for |
|---|---|
| `bg-background` / `text-foreground` | App-wide shell |
| `bg-card` / `text-card-foreground` | Raised panels (empty state input) |
| `bg-muted` / `text-muted-foreground` | De-emphasized backgrounds, code blocks |
| `border-border` | Default dividers and outlines |

### Org App theme colors (manifest-driven)

| CSS var | Use for |
|---|---|
| `var(--color-app-background)` | Sidebar background |
| `var(--color-app-foreground)` | Sidebar text |
| `var(--color-app-background-hover)` | Nav hover state |
| `var(--color-app-background-selected)` | Active nav item |
| `var(--color-app-background-pressed)` | Mouse-down state |

These are populated by **org-app-theming** from the Org App envelope — never hard-code colors that should reflect the Org App's brand.

### Radius

| Class | Value |
|---|---|
| `rounded-md` | 4px — inline buttons, code blocks |
| `rounded-lg` | 8px — cards, nav items, inputs |

### Icons

Use `lucide-react`. Size with `icon-size-200` (16px) for inline and `icon-size-400` (24px) for headers.

## Rules

1. **No magic numbers.** Always use a Tailwind utility that maps to a token. If a token doesn't exist for what you need, add it to `src/global.css` `@theme` — don't bypass.
2. **Pair `text-*` with `leading-*`.** They are designed to be used together.
3. **Use `font-heading` for titles** — Segoe UI Variable has display weight that Segoe UI lacks.
4. **Respect dark mode.** Use `bg-card` not `bg-white`. The `.dark` block in `global.css` flips these automatically.
5. **Org App brand colors are sacred.** The user picked them in the Power BI Org App designer — preserve them. Only adjust contrast (e.g., flipping `--color-app-foreground` to `#fff` vs `#000`) if WCAG AA fails.
6. **Mobile is out of scope** for this template. The Power BI portal Org App experience is desktop-only, and so is this migration target. Don't add responsive breakpoints unless asked.

## When to deviate

Don't. If a design requires a token that doesn't exist, **add the token** to `src/global.css` first, then use it. This keeps the codebase consistent for the next migration.
