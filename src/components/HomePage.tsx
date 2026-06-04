//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { ExternalLink, Sparkles } from "lucide-react";
import type { OrgAppManifest } from "@/types/orgAppManifest";
import { getOpenAppUrl } from "@/lib/fabricUrls";
import { ReportCard } from "@/components/ReportCard";

interface HomePageProps {
    manifest: OrgAppManifest;
}

/**
 * Landing page shown at `/`. Hero band introducing the Org App, then a
 * responsive grid of report tiles. Each tile primary-action opens the
 * in-app embed; secondary action opens the report in Power BI.
 */
export function HomePage({ manifest }: HomePageProps) {
    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-xl px-l py-xl">
                <section className="flex flex-col gap-m rounded-xl border border-border bg-card p-xl">
                    <div className="flex items-start gap-m">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                            style={{
                                background: "var(--color-app-background-selected)",
                                color: "var(--color-app-foreground)",
                            }}
                        >
                            <Sparkles className="icon-size-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate font-heading text-500 leading-500 font-semibold">
                                {manifest.displayName || "Org App"}
                            </h1>
                            {manifest.description ? (
                                <p className="mt-xs text-300 leading-300 text-muted-foreground">
                                    {manifest.description}
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-s">
                        <a
                            href={getOpenAppUrl(manifest)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-xs rounded-md border border-border px-m py-s text-300 leading-300 transition-colors hover:bg-muted"
                        >
                            <ExternalLink className="icon-size-100" />
                            Open in Power BI
                        </a>
                    </div>
                </section>

                <section>
                    <h2 className="mb-m font-heading text-400 leading-400 font-semibold">
                        Reports
                    </h2>
                    {manifest.reports.length === 0 ? (
                        <p className="text-300 leading-300 text-muted-foreground">
                            This Org App has no reports yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-m sm:grid-cols-2 lg:grid-cols-3">
                            {manifest.reports.map((r) => (
                                <ReportCard
                                    key={r.elementId}
                                    manifest={manifest}
                                    report={r}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
