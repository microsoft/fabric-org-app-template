//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useParams } from "react-router-dom";
import type { OrgAppManifest, OrgAppLinkEmbedItem } from "@/types/orgAppManifest";
import { getSections, walkNavItems } from "@/types/orgAppManifest";

interface EmbedLinkPageProps {
    manifest: OrgAppManifest;
}

/**
 * Renders a `linkEmbed` nav item — an iframe whose `src` is the verbatim
 * URL baked into the Org App definition.
 *
 * The URL frequently points at a different host (e.g. an
 * `msit.powerbi.com` link inside an app deployed at `dxt.fabricapps.net`).
 * The iframe loads that URL as-is; if the user's browser has no
 * authenticated session against that host, they'll see the host's
 * sign-in flow inside the iframe and must authenticate there. This
 * matches the Power BI portal's behavior for embedded links.
 */
export function EmbedLinkPage({ manifest }: EmbedLinkPageProps) {
    const { elementId } = useParams<{ elementId: string }>();
    const link = findEmbedLink(manifest, elementId ?? "");

    if (!link) {
        return (
            <div className="flex h-full items-center justify-center bg-background p-l">
                <div className="text-300 text-muted-foreground">
                    Embedded link not found.
                </div>
            </div>
        );
    }

    return (
        <iframe
            key={link.elementId}
            title={link.displayName}
            src={link.url}
            className="h-full w-full border-0"
            allowFullScreen
        />
    );
}

function findEmbedLink(
    manifest: OrgAppManifest,
    elementId: string,
): OrgAppLinkEmbedItem | undefined {
    for (const section of getSections(manifest.nav)) {
        for (const it of walkNavItems(section.items)) {
            if (it.kind === "linkEmbed" && it.elementId === elementId) return it;
        }
    }
    return undefined;
}
