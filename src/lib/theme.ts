//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { OrgAppTheme } from "@/types/orgAppManifest";
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

/**
 * Map a Power BI built-in report theme onto the shell vars.
 *
 * `theme.background` in the Power BI theme JSON is the **chart canvas**
 * background (almost always `#FFFFFF`), not an app chrome color. Using
 * it directly leaves the sidebar pure white for every PBI theme, which
 * defeats the purpose of letting the user pick a theme. Instead, derive
 * the sidebar / chrome background as a subtle accent tint over the
 * canvas — each theme then visibly identifies itself in the chrome
 * while still keeping readable contrast against the dark text.
 */
export function applyPowerBITheme(theme: PowerBITheme): void {
    const accent = theme.dataColors[0] ?? theme.tableAccent;
    const canvas = theme.background;
    setVars({
        "--color-app-background": mixHex(canvas, accent, 0.10),
        "--color-app-foreground": theme.foreground,
        "--color-app-background-hover": mixHex(canvas, accent, 0.22),
        "--color-app-background-selected": mixHex(canvas, accent, 0.35),
        "--color-app-background-pressed": mixHex(canvas, accent, 0.45),
    });
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
