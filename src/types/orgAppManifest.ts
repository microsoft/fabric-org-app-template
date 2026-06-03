//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

/**
 * The shape the app consumes at runtime — extracted by the org-app-fetch
 * + org-app-parsing skills from the raw `metadata/artifacts/{id}` envelope.
 *
 * Datasets are intentionally excluded — they back reports but are not
 * user-facing in the navigation.
 */
export interface OrgAppManifest {
    /** Power BI workspace ID that owns the Org App. */
    workspaceId: string;

    /** Org App object ID (the artifact ID). */
    orgAppId: string;

    /** Tenant ID — required for the secure report embed URL. */
    tenantId: string;

    /** Display name shown in the app header. */
    displayName: string;

    /** Optional description from the Org App envelope. */
    description?: string;

    /** Ordered list of reports — drives sidebar nav and routes. */
    reports: OrgAppReport[];

    /** Theme colors — applied via the org-app-theming skill. */
    theme: OrgAppTheme;
}

export interface OrgAppReport {
    /** Stable element ID inside the Org App definition. Used as route key. */
    elementId: string;

    /** Power BI report item ID — used in the embed URL. */
    itemId: string;

    /** Display name shown in the sidebar nav. */
    displayName: string;
}

export interface OrgAppTheme {
    background: string;
    foreground: string;
    backgroundHover: string;
    backgroundSelected: string;
    backgroundPressed: string;
}
