//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { OrgAppManifest } from "@/types/orgAppManifest";
import { getClusterUrl } from "./cluster";

/**
 * Raw envelope shape returned by the internal `metadata/artifacts/{id}`
 * endpoint. The interesting payload is `workloadPayload` — a JSON string
 * that must be parsed a second time to get the Org App definition.
 *
 * This endpoint is the same one the Power BI portal uses at runtime.
 * It is used here because OrgApp is not yet exposed in the public
 * Fabric REST `ItemType` enum.
 */
interface ArtifactEnvelope {
    objectId: string;
    artifactType: string; // "OrgApp"
    displayName: string;
    description?: string;
    folderObjectId: string; // workspaceId
    workloadPayload: string; // JSON-encoded OrgAppPayload
    payloadContentType: string; // "InlineJson"
}

interface OrgAppPayload {
    settings?: {
        theme?: {
            background?: string;
            foreground?: string;
            backgroundHover?: string;
            backgroundSelected?: string;
            backgroundPressed?: string;
        };
    };
    elements?: OrgAppElement[];
}

interface OrgAppElement {
    elementType: string; // "item"
    elementId: string;
    itemType: string; // "report" | "dataset"
    itemId: string;
    displayName: string;
}

/**
 * Fetch an Org App envelope and reduce it to the runtime `OrgAppManifest`.
 *
 * @param orgAppId - The Org App object ID (artifact ID).
 * @param tenantId - The tenant ID — embedded in the manifest for the secure embed URL.
 * @param token - Bearer token for resource `https://analysis.windows.net/powerbi/api`.
 */
export async function fetchOrgAppManifest(
    orgAppId: string,
    tenantId: string,
    token: string,
): Promise<OrgAppManifest> {
    const cluster = await getClusterUrl(token);

    const res = await fetch(`${cluster}/metadata/artifacts/${orgAppId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    if (!res.ok) {
        throw new Error(
            `Org App fetch failed: ${res.status} ${res.statusText}`,
        );
    }

    const envelope = (await res.json()) as ArtifactEnvelope;
    if (envelope.artifactType !== "OrgApp") {
        throw new Error(
            `Expected artifactType "OrgApp", got "${envelope.artifactType}"`,
        );
    }

    const payload = JSON.parse(envelope.workloadPayload) as OrgAppPayload;

    const reports = (payload.elements ?? [])
        .filter((e) => e.elementType === "item" && e.itemType === "report")
        .map((e) => ({
            elementId: e.elementId,
            itemId: e.itemId,
            displayName: e.displayName,
        }));

    const t = payload.settings?.theme ?? {};
    return {
        workspaceId: envelope.folderObjectId,
        orgAppId: envelope.objectId,
        tenantId,
        displayName: envelope.displayName,
        description: envelope.description,
        reports,
        theme: {
            background: t.background ?? "#0f6cbd",
            foreground: t.foreground ?? "#ffffff",
            backgroundHover: t.backgroundHover ?? "#1a78c5",
            backgroundSelected: t.backgroundSelected ?? "#2684cc",
            backgroundPressed: t.backgroundPressed ?? "#1565a8",
        },
    };
}
