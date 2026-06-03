//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useParams } from "react-router-dom";
import type { OrgAppManifest } from "@/types/orgAppManifest";

interface ReportEmbedProps {
    manifest: OrgAppManifest;
}

/**
 * Secure embed iframe for a Power BI report.
 *
 * Uses the `autoAuth=true` flow so the AAD cookie from the user's
 * existing Power BI session signs them into the iframe automatically —
 * no embed token required.
 *
 * See: https://learn.microsoft.com/power-bi/collaborate-share/service-embed-secure
 */
export function ReportEmbed({ manifest }: ReportEmbedProps) {
    const { elementId } = useParams<{ elementId: string }>();
    const report = manifest.reports.find((r) => r.elementId === elementId);

    if (!report) {
        return (
            <div className="flex h-full items-center justify-center bg-background p-l">
                <div className="text-300 text-muted-foreground">
                    Report not found.
                </div>
            </div>
        );
    }

    const src = new URL("https://app.powerbi.com/reportEmbed");
    src.searchParams.set("reportId", report.itemId);
    src.searchParams.set("groupId", manifest.workspaceId);
    src.searchParams.set("autoAuth", "true");
    if (manifest.tenantId) src.searchParams.set("ctid", manifest.tenantId);

    return (
        <iframe
            key={report.itemId}
            title={report.displayName}
            src={src.toString()}
            className="h-full w-full border-0"
            allowFullScreen
        />
    );
}
