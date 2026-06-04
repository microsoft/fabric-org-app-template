//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { Link } from "react-router-dom";
import {
    ExternalLink,
    FileBarChart2,
    FileText,
    Globe,
    type LucideIcon,
} from "lucide-react";
import {
    getSections,
    type OrgAppManifest,
    type OrgAppNavItem,
    type OrgAppSection,
} from "@/types/orgAppManifest";

interface OverviewPageProps {
    manifest: OrgAppManifest;
}

/**
 * Auto-generated landing page. Mirrors the Power BI Org App portal's
 * "About" view: a header with the app's display name + description (if
 * any), followed by one section per section entry in `manifest.nav`,
 * each rendered as a grid of cards — one card per leaf nav item.
 *
 * Every migrated app gets this page, regardless of whether the source
 * envelope had any `overview` (content page) elements. Content pages
 * are surfaced as separate routes at `/page/:elementId`.
 *
 * Cards link to:
 *   - `report`    → `/report/:itemId`
 *   - `rdlreport` → `/rdl/:itemId`
 *   - `linkEmbed` → `/embed/:elementId`
 *   - `linkNewtab` → external URL in a new tab
 *
 * Nested sections are flattened — all leaves under a section appear in
 * that section's grid regardless of depth — to keep the landing page
 * scannable.
 */
export function OverviewPage({ manifest }: OverviewPageProps) {
    const sections = getSections(manifest.nav);
    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-xl px-l py-xl">
                <header className="flex flex-col gap-s">
                    <h1 className="font-heading text-hero-800 leading-hero-800 font-semibold text-fg-default">
                        {manifest.displayName}
                    </h1>
                    {manifest.description ? (
                        <p className="text-300 leading-300 text-fg-subtle">
                            {manifest.description}
                        </p>
                    ) : null}
                </header>

                {sections.map((section) => (
                    <SectionGrid key={section.elementId} section={section} />
                ))}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------

interface SectionGridProps {
    section: OrgAppSection;
}

function SectionGrid({ section }: SectionGridProps) {
    const leaves = flattenLeaves(section.items);
    if (leaves.length === 0) return null;

    return (
        <section className="flex flex-col gap-m">
            <h2 className="font-heading text-500 leading-500 font-semibold text-fg-default">
                {section.displayName}
            </h2>
            <div className="grid grid-cols-1 gap-m sm:grid-cols-2 lg:grid-cols-3">
                {leaves.map((leaf) => (
                    <NavCard key={leaf.elementId} item={leaf} />
                ))}
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------

interface NavCardProps {
    item: Exclude<OrgAppNavItem, { kind: "section" }>;
}

function NavCard({ item }: NavCardProps) {
    const { kindLabel, Icon } = describeKind(item.kind);
    const isExternal = item.kind === "linkNewtab";

    const cardBody = (
        <>
            <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                style={{
                    background: "var(--color-app-background)",
                    color: "var(--color-app-foreground)",
                }}
            >
                <Icon className="icon-size-300" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-xxs">
                <span className="truncate text-300 leading-300 font-semibold text-fg-default">
                    {item.displayName}
                </span>
                <span className="text-200 leading-200 text-fg-subtle">
                    {kindLabel}
                </span>
            </div>
            {isExternal ? (
                <ExternalLink className="icon-size-200 shrink-0 text-fg-subtle" />
            ) : null}
        </>
    );

    const cardClass =
        "group flex items-center gap-m rounded-xl border border-border bg-card p-m transition-colors hover:bg-fg-default/5";

    if (item.kind === "linkNewtab") {
        return (
            <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
            >
                {cardBody}
            </a>
        );
    }

    const to =
        item.kind === "report"
            ? `/report/${item.itemId}`
            : item.kind === "rdlreport"
              ? `/rdl/${item.itemId}`
              : `/embed/${item.elementId}`;
    return (
        <Link to={to} className={cardClass}>
            {cardBody}
        </Link>
    );
}

// ---------------------------------------------------------------------------

/** Walk a section's items and yield only the leaves (no sub-sections). */
function flattenLeaves(
    items: OrgAppNavItem[],
): Array<Exclude<OrgAppNavItem, { kind: "section" }>> {
    const out: Array<Exclude<OrgAppNavItem, { kind: "section" }>> = [];
    const walk = (list: OrgAppNavItem[]) => {
        for (const it of list) {
            if (it.kind === "section") {
                walk(it.items);
            } else {
                out.push(it);
            }
        }
    };
    walk(items);
    return out;
}

function describeKind(kind: Exclude<OrgAppNavItem, { kind: "section" }>["kind"]): {
    kindLabel: string;
    Icon: LucideIcon;
} {
    switch (kind) {
        case "report":
            return { kindLabel: "Power BI report", Icon: FileBarChart2 };
        case "rdlreport":
            return { kindLabel: "Paginated report", Icon: FileText };
        case "linkEmbed":
            return { kindLabel: "Embedded link", Icon: Globe };
        case "linkNewtab":
            return { kindLabel: "External link", Icon: ExternalLink };
    }
}
