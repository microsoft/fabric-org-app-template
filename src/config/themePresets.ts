//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

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
 * Future extension point: the agent could append organization-specific
 * themes here, or a future skill could read/import JSON theme files.
 */
export interface PowerBITheme {
    name: string;
    dataColors: string[];
    background: string;
    foreground: string;
    tableAccent: string;
}

/**
 * Palettes mirror the Power BI Desktop built-in themes. Colors are taken
 * from the public Power BI theme gallery so users see exactly what they
 * would in the Power BI service.
 */
export const builtInThemes: PowerBITheme[] = [
    {
        name: "Default",
        dataColors: ["#118DFF", "#12239E", "#E66C37", "#6B007B", "#E044A7", "#744EC2", "#D9B300", "#D64550"],
        background: "#FFFFFF",
        foreground: "#252423",
        tableAccent: "#118DFF",
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
