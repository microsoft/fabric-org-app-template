//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { Navigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    findContentPage,
    type OrgAppManifest,
} from "@/types/orgAppManifest";

interface ContentPageProps {
    manifest: OrgAppManifest;
}

/**
 * Renders any author-supplied content page from the manifest. The
 * specific page is selected by `:elementId` in the route at
 * `/page/:elementId`.
 *
 * Content pages originate from `elementType: "overview"` elements in
 * the Org App envelope. An app may have zero, one, or many of them —
 * common patterns include a single "Introduction", or a multi-page
 * structure like "Welcome" + "Reference" + "FAQ". Each is rendered
 * with the same layout: an optional themed header card containing
 * the page's `title` (h1) and `body` (GitHub-flavored markdown).
 *
 * If the route's elementId doesn't resolve to a content page, redirect
 * to `/overview` so the user lands somewhere safe.
 */
export function ContentPage({ manifest }: ContentPageProps) {
    const { elementId } = useParams<{ elementId: string }>();
    const page = elementId ? findContentPage(manifest.nav, elementId) : undefined;

    if (!page) {
        return <Navigate to="/overview" replace />;
    }

    const headerStyle = page.showTheme
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
                        {page.title}
                    </h1>
                    {page.body ? (
                        <div className="markdown mt-m text-300 leading-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {page.body}
                            </ReactMarkdown>
                        </div>
                    ) : null}
                </header>
            </div>
        </div>
    );
}
