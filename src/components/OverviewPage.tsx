//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { OrgAppManifest } from "@/types/orgAppManifest";

interface OverviewPageProps {
    manifest: OrgAppManifest;
}

/**
 * Renders the Org App's `overview` element (the "Introduction" page
 * users see in the portal). The header card uses `--color-app-*` tokens
 * when the source envelope set `showTheme: true`; otherwise it falls
 * back to the neutral card background.
 *
 * `body` is rendered as GitHub-flavored Markdown via `react-markdown` +
 * `remark-gfm`. The Org App authoring experience exposes a markdown
 * editor for this field, so user content can include lists, tables,
 * links, and inline formatting.
 */
export function OverviewPage({ manifest }: OverviewPageProps) {
    const ov = manifest.overview;
    if (!ov) return null;

    const headerStyle = ov.showTheme
        ? {
              background: "var(--color-app-background)",
              color: "var(--color-app-foreground)",
          }
        : undefined;

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-l px-l py-xl">
                <header
                    className="rounded-xl border border-border p-xl"
                    style={headerStyle}
                >
                    <h1 className="font-heading text-hero-700 leading-hero-700 font-semibold">
                        {ov.title}
                    </h1>
                    {ov.body ? (
                        <div className="markdown mt-m text-300 leading-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {ov.body}
                            </ReactMarkdown>
                        </div>
                    ) : null}
                </header>
            </div>
        </div>
    );
}
