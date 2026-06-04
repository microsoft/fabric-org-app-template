//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useParams } from "react-router-dom";
import type { OrgAppManifest, OrgAppRdlReportItem } from "@/types/orgAppManifest";
import { walkNavItems } from "@/types/orgAppManifest";
import { getRdlEmbedUrl } from "@/lib/fabricUrls";

interface RdlEmbedProps {
    manifest: OrgAppManifest;
}

/**
 * Secure embed iframe for a Power BI **paginated (RDL)** report.
 *
 * Same `autoAuth=true` flow as the Power BI report embed, but the portal
 * uses a different path (`/rdlEmbed`) for paginated reports.
 */
export function RdlEmbed({ manifest }: RdlEmbedProps) {
    const { itemId } = useParams<{ itemId: string }>();
    const report = findRdlReport(manifest, itemId ?? "");

    if (!report) {
        return (
            <div className="flex h-full items-center justify-center bg-background p-l">
                <div className="text-300 text-muted-foreground">
                    Paginated report not found.
                </div>
            </div>
        );
    }

    const src = getRdlEmbedUrl({
        reportItemId: report.itemId,
        workspaceId: manifest.workspaceId,
        tenantId: manifest.tenantId,
    });

    return (
        <iframe
            key={report.itemId}
            title={report.displayName}
            src={src}
            className="h-full w-full border-0"
            allowFullScreen
        />
    );
}

function findRdlReport(
    manifest: OrgAppManifest,
    itemId: string,
): OrgAppRdlReportItem | undefined {
    for (const section of manifest.sections) {
        for (const it of walkNavItems(section.items)) {
            if (it.kind === "rdlreport" && it.itemId === itemId) return it;
        }
    }
    return undefined;
}
