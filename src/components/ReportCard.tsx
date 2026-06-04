//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { ExternalLink, FileBarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { OrgAppManifest, OrgAppReport } from "@/types/orgAppManifest";
import { getOpenReportUrl } from "@/lib/fabricUrls";

interface ReportCardProps {
    manifest: OrgAppManifest;
    report: OrgAppReport;
}

/**
 * Tile for a single report on the home page. Primary action opens the
 * report in the in-app embedded viewer; the secondary "Open in Power BI"
 * icon button opens the report in the Power BI portal in a new tab.
 */
export function ReportCard({ manifest, report }: ReportCardProps) {
    return (
        <div className="group relative flex flex-col gap-s rounded-lg border border-border bg-card p-m transition-shadow hover:shadow-md">
            <Link
                to={`/reports/${report.elementId}`}
                className="absolute inset-0 z-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Open ${report.displayName}`}
            />

            <div className="relative z-10 flex items-center justify-between gap-s">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                    style={{ background: "var(--color-app-background-selected)" }}
                >
                    <FileBarChart2
                        className="icon-size-300"
                        style={{ color: "var(--color-app-foreground)" }}
                    />
                </div>
                <a
                    href={getOpenReportUrl(manifest, report.itemId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${report.displayName} in Power BI`}
                    className="rounded-md p-xs text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                >
                    <ExternalLink className="icon-size-100" />
                </a>
            </div>

            <div className="relative z-10 min-w-0">
                <div className="truncate font-heading text-300 leading-300 font-semibold">
                    {report.displayName}
                </div>
                <div className="mt-xs text-200 leading-200 text-muted-foreground">
                    Power BI report
                </div>
            </div>
        </div>
    );
}
