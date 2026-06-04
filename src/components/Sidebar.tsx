//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    ChevronDown,
    ChevronRight,
    ExternalLink,
    FileBarChart2,
    FileText,
    Globe,
    Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOpenReportUrl } from "@/lib/fabricUrls";
import type {
    OrgAppManifest,
    OrgAppNavItem,
    OrgAppSection,
} from "@/types/orgAppManifest";

interface SidebarProps {
    manifest: OrgAppManifest;
    collapsed: boolean;
}

/**
 * Manifest-driven sidebar. Renders an Introduction link (if the manifest
 * has an overview) and a recursive tree of sections + leaf items.
 *
 * Layout decisions:
 *   - Recursive: a `section` item type can be nested inside another
 *     section. Today the parser only emits one level, but the structure
 *     supports arbitrary depth.
 *   - Initial collapse: every section starts collapsed; the one
 *     containing the active route is auto-expanded on mount.
 *   - Item icons:
 *       report        → bar chart
 *       rdlreport     → document (paginated reports are documents)
 *       linkEmbed     → globe (embedded but cross-tenant; treated as web content)
 *       linkNewtab    → external-link
 *   - Newtab links render as plain `<a target="_blank">` (no active state).
 *   - Active / hover / pressed styles come from `--color-app-*` tokens.
 *
 * When `collapsed`, only icons render. Section headers collapse to a
 * folder-like icon row that still toggles expansion.
 */
export function Sidebar({ manifest, collapsed }: SidebarProps) {
    return (
        <aside
            className={cn(
                "flex h-full shrink-0 flex-col border-r border-border transition-[width] duration-150 ease-out",
                collapsed ? "w-12" : "w-64",
            )}
            style={{
                background: "var(--color-app-background)",
                color: "var(--color-app-foreground)",
            }}
        >
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-xs py-s">
                <ul className="flex flex-col gap-xs">
                    {manifest.overview ? (
                        <li>
                            <NavLink
                                to="/overview"
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-s rounded-lg px-s py-s text-300 leading-300 transition-colors",
                                        isActive ? "app-nav-active" : "app-nav-idle",
                                    )
                                }
                                title={collapsed ? manifest.overview.title : undefined}
                            >
                                <Home className="icon-size-200 shrink-0" />
                                {!collapsed ? (
                                    <span className="truncate">Introduction</span>
                                ) : null}
                            </NavLink>
                        </li>
                    ) : null}

                    {manifest.sections.map((s) => (
                        <SectionNode
                            key={s.elementId}
                            manifest={manifest}
                            section={s}
                            depth={0}
                            collapsed={collapsed}
                        />
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

// ---------------------------------------------------------------------------
// Section node — recursive

interface SectionNodeProps {
    manifest: OrgAppManifest;
    section: OrgAppSection;
    depth: number;
    collapsed: boolean;
}

function SectionNode({ manifest, section, depth, collapsed }: SectionNodeProps) {
    const location = useLocation();

    // Auto-expand the section that contains the active route, otherwise
    // start collapsed (matches portal behavior).
    const containsActive = useMemo(
        () => sectionContainsRoute(section, location.pathname),
        [section, location.pathname],
    );
    const [expanded, setExpanded] = useState(containsActive);

    // If navigation moves the active route into this section after mount,
    // open it. We never auto-collapse — once the user opens it, it stays
    // open until they click the chevron.
    if (containsActive && !expanded) {
        // Defer to next render — setting state inline triggers a warning,
        // so use a one-shot effect-like pattern via queueMicrotask.
        queueMicrotask(() => setExpanded(true));
    }

    return (
        <li>
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className={cn(
                    "flex w-full items-center gap-xs rounded-lg px-s py-s text-left text-300 leading-300 transition-colors",
                    "app-nav-idle font-semibold",
                )}
                style={{ paddingLeft: `calc(${depth} * 0.75rem + 0.5rem)` }}
                aria-expanded={expanded}
                title={collapsed ? section.displayName : undefined}
            >
                {!collapsed ? (
                    expanded ? (
                        <ChevronDown className="icon-size-100 shrink-0 opacity-70" />
                    ) : (
                        <ChevronRight className="icon-size-100 shrink-0 opacity-70" />
                    )
                ) : null}
                {collapsed ? (
                    <ChevronRight className="icon-size-200 shrink-0 opacity-70" />
                ) : (
                    <span className="flex-1 truncate">{section.displayName}</span>
                )}
            </button>

            {expanded && !collapsed ? (
                <ul className="mt-xxs flex flex-col gap-xxs">
                    {section.items.map((it) => (
                        <NavItemNode
                            key={it.elementId}
                            manifest={manifest}
                            item={it}
                            depth={depth + 1}
                            collapsed={collapsed}
                        />
                    ))}
                </ul>
            ) : null}
        </li>
    );
}

// ---------------------------------------------------------------------------
// Leaf or nested-section dispatch

interface NavItemNodeProps {
    manifest: OrgAppManifest;
    item: OrgAppNavItem;
    depth: number;
    collapsed: boolean;
}

function NavItemNode({ manifest, item, depth, collapsed }: NavItemNodeProps) {
    if (item.kind === "section") {
        return (
            <SectionNode
                manifest={manifest}
                section={item}
                depth={depth}
                collapsed={collapsed}
            />
        );
    }

    const indent = { paddingLeft: `calc(${depth} * 0.75rem + 0.5rem)` };

    if (item.kind === "linkNewtab") {
        // External link — no active state, no in-app route.
        return (
            <li>
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-nav-idle flex items-center gap-s rounded-lg px-s py-s text-300 leading-300 transition-colors"
                    style={indent}
                    title={collapsed ? item.displayName : undefined}
                >
                    <ExternalLink className="icon-size-200 shrink-0" />
                    {!collapsed ? (
                        <span className="flex-1 truncate">{item.displayName}</span>
                    ) : null}
                </a>
            </li>
        );
    }

    // Routed leaf: report / rdlreport / linkEmbed
    const { route, icon, openInPortalUrl } = leafMeta(manifest, item);
    return (
        <li className="group relative">
            <NavLink
                to={route}
                className={({ isActive }) =>
                    cn(
                        "flex items-center gap-s rounded-lg px-s py-s text-300 leading-300 transition-colors",
                        isActive ? "app-nav-active" : "app-nav-idle",
                    )
                }
                style={indent}
                title={collapsed ? item.displayName : undefined}
            >
                {icon}
                {!collapsed ? (
                    <span className="flex-1 truncate">{item.displayName}</span>
                ) : null}
            </NavLink>
            {!collapsed && openInPortalUrl ? (
                <a
                    href={openInPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${item.displayName} in Power BI`}
                    className="absolute inset-y-0 right-1 my-auto flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100"
                >
                    <ExternalLink className="icon-size-100" />
                </a>
            ) : null}
        </li>
    );
}

// ---------------------------------------------------------------------------
// Helpers

function leafMeta(
    manifest: OrgAppManifest,
    item: Exclude<OrgAppNavItem, { kind: "section" } | { kind: "linkNewtab" }>,
): { route: string; icon: React.ReactNode; openInPortalUrl?: string } {
    switch (item.kind) {
        case "report":
            return {
                route: `/report/${item.itemId}`,
                icon: <FileBarChart2 className="icon-size-200 shrink-0" />,
                openInPortalUrl: getOpenReportUrl(manifest, item.itemId),
            };
        case "rdlreport":
            return {
                route: `/rdl/${item.itemId}`,
                icon: <FileText className="icon-size-200 shrink-0" />,
                openInPortalUrl: getOpenReportUrl(manifest, item.itemId),
            };
        case "linkEmbed":
            return {
                route: `/embed/${item.elementId}`,
                // Use a globe icon to distinguish embedded web links from
                // first-class Power BI artifacts. LinkIcon is the chain
                // icon — also available if you prefer that affordance.
                icon: <Globe className="icon-size-200 shrink-0" />,
                openInPortalUrl: undefined,
            };
    }
}

function sectionContainsRoute(section: OrgAppSection, pathname: string): boolean {
    for (const it of section.items) {
        if (it.kind === "section") {
            if (sectionContainsRoute(it, pathname)) return true;
            continue;
        }
        if (it.kind === "linkNewtab") continue;
        const route =
            it.kind === "report"
                ? `/report/${it.itemId}`
                : it.kind === "rdlreport"
                  ? `/rdl/${it.itemId}`
                  : `/embed/${it.elementId}`;
        if (pathname === route) return true;
    }
    return false;
}
