---
name: org-app-theming
description: Patch src/global.css so the --color-app-* Tailwind tokens use the Org App's brand colors extracted by the org-app-parsing skill. Use after org-app-parsing has populated the manifest theme.
---

# org-app-theming

## When to use this skill

Right after **org-app-parsing** has populated the `theme` object in `src/config/orgAppManifest.ts`. The components reference theme colors via CSS variables (`var(--color-app-background)` etc.), and those variables live in `src/global.css`.

This skill writes the **default** theme — the one shown until the end user picks something else from `Settings → Theme`.

## Scope: this skill vs the runtime theme picker

| | This skill (`org-app-theming`) | Runtime picker (Settings → Theme) |
|---|---|---|
| Who runs it | Migration agent, once per template instance | End user, any time |
| What it changes | `@theme` defaults in `src/global.css` | `:root` inline styles + `localStorage["org-app-active-theme"]` |
| When it applies | Always — the baseline | Only when the user picks a non-default theme |
| What it can pick from | The Org App's own brand colors | The Org App's brand colors **or** any built-in Power BI theme in [`src/config/themePresets.ts`](../../../src/config/themePresets.ts) |

Do **not** modify `themePresets.ts` or `lib/theme.ts` from this skill — those are end-user surfaces. Your job is only to write the Org App's brand colors into the `@theme` block so they become the default.

## Target tokens

Edit the `@theme` block in `src/global.css`. The five required tokens to update, plus one optional:

```css
@theme {
    --color-app-background: <theme.background>;
    --color-app-foreground: <theme.foreground>;
    --color-app-background-hover: <theme.backgroundHover>;
    --color-app-background-selected: <theme.backgroundSelected>;
    --color-app-background-pressed: <theme.backgroundPressed>;
    /* Optional — only set when `theme.backgroundSelected` is a saturated
       accent that would clash with the default `foreground` text color. */
    --color-app-foreground-selected: <theme.foregroundSelected ?? theme.foreground>;
}
```

> The placeholder values already in `global.css` are a neutral white shell. Replace them with the extracted hex strings — **keep the leading `#`** and the trailing `;`.

## Editing rules

1. Use a **single string replacement per token**. Do not regenerate the whole file.
2. Preserve all other tokens in the `@theme` block (font sizes, spacing, etc.).
3. Update only the five required tokens; add `--color-app-foreground-selected` only when the Org App's `theme.foregroundSelected` is set. The component layer (Sidebar) relies on exactly these names.

## Dark mode

Do **not** override these tokens in the `.dark` block. The Org App's brand colors carry through both light and dark mode by design — only the surrounding shell (`--color-background`, `--color-foreground`) flips.

## Verification

After patching, run:

```powershell
pnpm dev
```

And confirm:

- Sidebar background matches `theme.background`
- Hovering a nav item shows `theme.backgroundHover`
- The selected (active) nav item shows `theme.backgroundSelected`
- Pressing (mouse-down) a nav item briefly shows `theme.backgroundPressed`

If colors don't update: check the browser's DevTools → Elements → Computed → search for `--color-app-background`. The value should match what you wrote.
