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

## Layout primitives

The shell is composed of small, single-purpose primitives. Don't introduce new top-level layouts — extend or replace these in place.

| Component | File | Role |
|---|---|---|
| `AppShell` | [`src/components/AppShell.tsx`](../../../src/components/AppShell.tsx) | Topbar + Sidebar + `<Outlet />` container. Owns the `useSidebarCollapsed` state. |
| `Topbar` | [`src/components/Topbar.tsx`](../../../src/components/Topbar.tsx) | Sidebar toggle, app brand (links to `/`), "Open in Power BI" button, `SettingsMenu`. Fixed 48px height. |
| `Sidebar` | [`src/components/Sidebar.tsx`](../../../src/components/Sidebar.tsx) | Home entry + report list. Accepts `collapsed: boolean`. Per-item open-in-PBI affordance reveals on hover. |
| `HomePage` | [`src/components/HomePage.tsx`](../../../src/components/HomePage.tsx) | Hero band + responsive grid of `ReportCard` tiles. Route: `/`. |
| `ReportCard` | [`src/components/ReportCard.tsx`](../../../src/components/ReportCard.tsx) | Tile with primary action = in-app embed, secondary = open in Power BI. |
| `SettingsMenu` | [`src/components/SettingsMenu.tsx`](../../../src/components/SettingsMenu.tsx) | Gear dropdown. Two items: Theme submenu, Configuration dialog. |
| `ThemeSubmenu` | [`src/components/ThemeSubmenu.tsx`](../../../src/components/ThemeSubmenu.tsx) | Org App theme + built-in Power BI themes. See `org-app-theming`. |
| `ConfigurationDialog` | [`src/components/ConfigurationDialog.tsx`](../../../src/components/ConfigurationDialog.tsx) | Read-only modal showing source Org App metadata + manifest JSON. |

### Layout rules

- **Do not nest routers.** `BrowserRouter` lives in `App.tsx`; `AppShell` is the layout route and renders `<Outlet />`.
- **Do not bypass `lib/fabricUrls.ts`.** All embed + open-in-PBI URLs go through `getReportEmbedUrl` / `getOpenAppUrl` / `getOpenReportUrl`.
- **The Sidebar's collapsed state is persisted** in `localStorage["org-app-sidebar-collapsed"]` — don't re-derive it elsewhere.
- **The active theme is persisted** in `localStorage["org-app-active-theme"]` — sentinel `__org_app__` means "use the manifest theme".
- **No mobile breakpoints** for the shell chrome. The HomePage grid is the only responsive surface (`sm:grid-cols-2 lg:grid-cols-3`).
