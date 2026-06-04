//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { OrgAppManifest } from "@/types/orgAppManifest";

/**
 * Static manifest written by the Copilot CLI at scaffold time via the
 * org-app-fetch + org-app-parsing skills.
 *
 * To re-run the migration, run `copilot` and paste a new Org App ID.
 *
 * `orgAppId === ""` is the "unconfigured" sentinel — the app renders the
 * UnconfiguredAppPreview component until the agent populates this file.
 */
export const orgAppManifest: OrgAppManifest = {
    workspaceId: "",
    orgAppId: "",
    tenantId: "",
    displayName: "",
    description: "",
    logo: undefined,
    nav: [],
    theme: {
        // Default to a neutral white shell. The org-app-theming skill
        // overwrites this from the workloadPayload settings during the
        // migration; brand themes can be picked at runtime from the
        // theme presets (see src/config/themePresets.ts).
        background: "#ffffff",
        foreground: "#252423",
        backgroundHover: "#f3f2f1",
        backgroundSelected: "#edebe9",
        backgroundPressed: "#e1dfdd",
        foregroundSelected: "#252423",
    },
};

/** True when the agent has not yet populated the manifest. */
export const isUnconfigured = (m: OrgAppManifest) => m.orgAppId === "";
