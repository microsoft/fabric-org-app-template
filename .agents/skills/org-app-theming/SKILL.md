---
name: org-app-theming
description: Patch src/global.css so the --color-app-* Tailwind tokens use the Org App's brand colors extracted by the org-app-parsing skill. Use after org-app-parsing has populated the manifest theme.
---

# org-app-theming

## When to use this skill

Right after **org-app-parsing** has populated the `theme` object in `src/config/orgAppManifest.ts`. The components reference theme colors via CSS variables (`var(--color-app-background)` etc.), and those variables live in `src/global.css`.

## Target tokens

Edit the `@theme` block in `src/global.css`. The five tokens to update:

```css
@theme {
    --color-app-background: <theme.background>;
    --color-app-foreground: <theme.foreground>;
    --color-app-background-hover: <theme.backgroundHover>;
    --color-app-background-selected: <theme.backgroundSelected>;
    --color-app-background-pressed: <theme.backgroundPressed>;
}
```

> The placeholder values already in `global.css` use Fabric blue. Replace them with the extracted hex strings — **keep the leading `#`** and the trailing `;`.

## Editing rules

1. Use a **single string replacement per token**. Do not regenerate the whole file.
2. Preserve all other tokens in the `@theme` block (font sizes, spacing, etc.).
3. Do **not** add or remove tokens — only update values. The component layer (Sidebar) relies on exactly these five names.

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
