//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { OrgAppTheme } from "@/types/orgAppManifest";

/**
 * Built-in Power BI report themes, expressed in the official Power BI
 * theme JSON schema (https://learn.microsoft.com/power-bi/create-reports/desktop-report-themes).
 *
 *   {
 *     "name": "...",
 *     "dataColors": ["#...", ...],
 *     "background": "#...",
 *     "foreground": "#...",
 *     "tableAccent": "#..."
 *   }
 *
 * The optional `shell` block overrides the derived sidebar/topbar shell
 * colors. When omitted, lib/theme.ts derives a tinted shell from
 * `background` + `dataColors[0]`. Brand themes (Power BI yellow/black,
 * Microsoft Fabric) ship explicit `shell` values so the chrome matches
 * the brand exactly rather than a derived approximation.
 *
 * Future extension point: the agent could append organization-specific
 * themes here, or a future skill could read/import JSON theme files.
 */
export interface PowerBITheme {
    name: string;
    dataColors: string[];
    background: string;
    foreground: string;
    tableAccent: string;
    /** Optional explicit shell colors; bypasses the derivation in lib/theme.ts. */
    shell?: OrgAppTheme;
}

/**
 * Built-in themes shown in the runtime theme picker.
 *
 * - **Default** is pure white shell — always the safe baseline.
 * - **Power BI** and **Microsoft Fabric** are brand presets and supply
 *   explicit `shell` overrides so the chrome reads as the official
 *   brand rather than a tinted approximation.
 * - The rest mirror the Power BI Desktop built-in report themes; their
 *   shells are derived from `background` + `dataColors[0]` at apply
 *   time, giving the chrome a subtle accent tint per theme.
 *
 * Brand color sources:
 * - Power BI: brand yellow `#F2C811` is the canonical Power BI logo
 *   yellow used across Power BI Desktop, marketing, and the favicon.
 *   Dark chrome is Fluent neutral `#252423`.
 * - Microsoft Fabric: brand blue `#0F6CBD` is the Fluent UI brand blue
 *   used by the Microsoft Fabric portal chrome (app.fabric.microsoft.com).
 *   The dark variant uses Fluent neutral `#242424` with the same accent.
 */
export const builtInThemes: PowerBITheme[] = [
    {
        name: "Default",
        dataColors: ["#118DFF", "#12239E", "#E66C37", "#6B007B", "#E044A7", "#744EC2", "#D9B300", "#D64550"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#118DFF",
        // Pure white shell — the always-on safe baseline.
        shell: {
            background: "#FFFFFF",
            foreground: "#252423",
            backgroundHover: "#F3F2F1",
            backgroundSelected: "#EDEBE9",
            backgroundPressed: "#E1DFDD",
            foregroundSelected: "#252423",
        },
    },
    {
        name: "Power BI",
        dataColors: ["#F2C811", "#118DFF", "#E66C37", "#6B007B", "#E044A7", "#744EC2", "#D9B300", "#D64550"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#F2C811",
        // Brand: Power BI yellow on Fluent neutral dark.
        shell: {
            background: "#252423",
            foreground: "#FFFFFF",
            backgroundHover: "#3B3A39",
            backgroundSelected: "#F2C811",
            backgroundPressed: "#D9B400",
            // Dark text against the saturated yellow active background.
            foregroundSelected: "#252423",
        },
    },
    {
        name: "Microsoft Fabric",
        dataColors: ["#0F6CBD", "#117865", "#1A78C5", "#118DFF", "#E66C37", "#744EC2", "#D9B300", "#D64550"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#0F6CBD",
        // Brand: Microsoft Fabric portal blue on white.
        shell: {
            background: "#0F6CBD",
            foreground: "#FFFFFF",
            backgroundHover: "#1A78C5",
            backgroundSelected: "#2684CC",
            backgroundPressed: "#1565A8",
            foregroundSelected: "#FFFFFF",
        },
    },
    {
        name: "Microsoft Fabric Dark",
        dataColors: ["#0F6CBD", "#117865", "#1A78C5", "#118DFF", "#E66C37", "#744EC2", "#D9B300", "#D64550"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#0F6CBD",
        // Brand: Fluent neutral dark chrome with Fabric blue accent.
        shell: {
            background: "#242424",
            foreground: "#FFFFFF",
            backgroundHover: "#3B3A39",
            backgroundSelected: "#0F6CBD",
            backgroundPressed: "#1565A8",
            foregroundSelected: "#FFFFFF",
        },
    },
    {
        name: "Executive",
        dataColors: ["#3257A8", "#9D58AD", "#72B98B", "#A8B675", "#DCAC65", "#D9684C", "#A33E36", "#5F2B5C"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#3257A8",
    },
    {
        name: "Frontier",
        dataColors: ["#4A588A", "#76B7B2", "#AF8DBF", "#F28E2B", "#E15759", "#59A14F", "#EDC948", "#B07AA1"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#4A588A",
    },
    {
        name: "Innovate",
        dataColors: ["#1A4F7C", "#118DFF", "#0099BC", "#22B0BA", "#7DC36D", "#C3D88B", "#FACD66", "#E58E6B"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#1A4F7C",
    },
    {
        name: "Bloom",
        dataColors: ["#3257A8", "#FF6B6B", "#F2C661", "#84C5C5", "#9B6CB2", "#DD6BAC", "#5B9BD5", "#A5A5A5"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#3257A8",
    },
    {
        name: "Tidal",
        dataColors: ["#1B4F72", "#2874A6", "#3498DB", "#5DADE2", "#85C1E9", "#AED6F1", "#D6EAF8", "#EBF5FB"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#1B4F72",
    },
    {
        name: "Storm",
        dataColors: ["#2E4057", "#516B7F", "#7D919F", "#A8B7C0", "#CADFE6", "#C46D5E", "#9B4D43", "#6B2F28"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#2E4057",
    },
    {
        name: "Sunset",
        dataColors: ["#F2C94C", "#F2994A", "#EB5757", "#BB6BD9", "#9B51E0", "#2F80ED", "#56CCF2", "#6FCF97"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#F2994A",
    },
];

/** Sentinel key used in localStorage when the user picks "Org App theme". */
export const ORG_APP_THEME_KEY = "__org_app__";
