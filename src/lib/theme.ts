//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { OrgAppManifest, OrgAppTheme } from "@/types/orgAppManifest";
import type { PowerBITheme } from "@/config/themePresets";

/**
 * Theming maps Power BI report theme JSON onto the 5 `--color-app-*`
 * CSS custom properties consumed by the shell.
 *
 * Mapping:
 *   - background         → --color-app-background       (sidebar bg)
 *   - foreground         → --color-app-foreground       (sidebar text)
 *   - dataColors[0]      → --color-app-background-selected (accent — active nav item)
 *   - hover  = mix(bg, accent, 0.15)
 *   - pressed = mix(bg, accent, 0.3)
 *
 * This is intentionally simple — the goal is "looks coherent with the
 * Power BI theme the user picked," not pixel-perfect parity with the
 * portal chrome.
 */

const APP_VARS = [
    "--color-app-background",
    "--color-app-foreground",
    "--color-app-background-hover",
    "--color-app-background-selected",
    "--color-app-background-pressed",
] as const;

/** Map an Org App manifest theme directly to shell vars. */
export function applyOrgAppTheme(theme: OrgAppTheme): void {
    setVars({
        "--color-app-background": theme.background,
        "--color-app-foreground": theme.foreground,
        "--color-app-background-hover": theme.backgroundHover,
        "--color-app-background-selected": theme.backgroundSelected,
        "--color-app-background-pressed": theme.backgroundPressed,
    });
}

/** Map a Power BI built-in report theme onto the shell vars. */
export function applyPowerBITheme(theme: PowerBITheme): void {
    const accent = theme.dataColors[0] ?? theme.tableAccent;
    setVars({
        "--color-app-background": theme.background,
        "--color-app-foreground": theme.foreground,
        "--color-app-background-hover": mixHex(theme.background, accent, 0.12),
        "--color-app-background-selected": mixHex(theme.background, accent, 0.24),
        "--color-app-background-pressed": mixHex(theme.background, accent, 0.36),
    });
}

/** Restore all theme overrides — falls back to whatever is declared in `@theme`. */
export function clearThemeOverrides(): void {
    for (const v of APP_VARS) {
        document.documentElement.style.removeProperty(v);
    }
}

/** Convenience: re-apply whichever theme should be active given a manifest. */
export function resetToOrgAppTheme(manifest: OrgAppManifest): void {
    applyOrgAppTheme(manifest.theme);
}

// --- helpers ---------------------------------------------------------------

function setVars(vars: Record<string, string>): void {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(key, value);
    }
}

/** Linear mix of two `#rrggbb` colors. `t` in [0,1]: 0=a, 1=b. */
function mixHex(a: string, b: string, t: number): string {
    const ca = parseHex(a);
    const cb = parseHex(b);
    if (!ca || !cb) return a;
    const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
    const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
    const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
    return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

function parseHex(hex: string): [number, number, number] | null {
    const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function toHex(n: number): string {
    return n.toString(16).padStart(2, "0");
}
