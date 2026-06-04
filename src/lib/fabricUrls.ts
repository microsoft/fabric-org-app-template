//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { OrgAppManifest } from "@/types/orgAppManifest";

/**
 * Origin used for both report embeds and "Open in Power BI" deep links.
 *
 * Comes from rayfin's `VITE_FABRIC_PORTAL_URL` (populated by `rayfin up`).
 * The Fabric portal serves both the Org App experience and the report
 * embed endpoint on the same host (e.g. `https://daily.fabric.microsoft.com`),
 * so a single origin is enough — no separate "powerbi.com" mapping needed.
 *
 * Fallback is the **production** Fabric portal — this is the right default
 * for every deployed build. To target a non-prod ring (daily/dxt) during
 * local development, set `RAYFIN_FABRIC_PORTAL_URL` in your shell before
 * running `rayfin up` / `rayfin dev` (see README).
 */
export function getFabricOrigin(): string {
    const raw = import.meta.env.VITE_FABRIC_PORTAL_URL ?? "https://app.fabric.microsoft.com";
    return raw.replace(/\/+$/, "");
}

/** Build the secure-embed URL for a single report. */
export function getReportEmbedUrl(args: {
    reportItemId: string;
    workspaceId: string;
    tenantId?: string;
}): string {
    const url = new URL(`${getFabricOrigin()}/reportEmbed`);
    url.searchParams.set("reportId", args.reportItemId);
    url.searchParams.set("groupId", args.workspaceId);
    url.searchParams.set("autoAuth", "true");
    url.searchParams.set("actionBarEnabled", "true");
    url.searchParams.set("reportCopilotInEmbed", "true");
    if (args.tenantId) url.searchParams.set("ctid", args.tenantId);
    return url.toString();
}

/**
 * Deep link to open the whole Org App in the Power BI / Fabric portal.
 *
 * The Fabric portal uses `/groups/{ws}/orgapps/{appId}` for Org Apps
 * (preview). The legacy `/groups/{ws}/apps/{appId}` path is for classic
 * Power BI apps and 404s for Org Apps.
 */
export function getOpenAppUrl(manifest: OrgAppManifest): string {
    const url = new URL(`${getFabricOrigin()}/groups/${manifest.workspaceId}/orgapps/${manifest.orgAppId}`);
    if (manifest.tenantId) url.searchParams.set("ctid", manifest.tenantId);
    return url.toString();
}

/**
 * Deep link to open a single report in the Power BI / Fabric portal.
 *
 * Note: the path segment is **singular** `report` (matches the portal
 * URL `/groups/{ws}/orgapps/{appId}/report/{reportId}`), not `reports`.
 */
export function getOpenReportUrl(
    manifest: OrgAppManifest,
    reportItemId: string,
): string {
    const url = new URL(`${getFabricOrigin()}/groups/${manifest.workspaceId}/orgapps/${manifest.orgAppId}/report/${reportItemId}`);
    if (manifest.tenantId) url.searchParams.set("ctid", manifest.tenantId);
    return url.toString();
}
