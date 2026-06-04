//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { NavLink } from "react-router-dom";
import { ExternalLink, FileBarChart2, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgAppManifest } from "@/types/orgAppManifest";
import { getOpenReportUrl } from "@/lib/fabricUrls";

interface SidebarProps {
    manifest: OrgAppManifest;
    collapsed: boolean;
}

/**
 * Manifest-driven sidebar. Renders Home + one nav entry per report from
 * the Org App definition. Active / hover / pressed states use the
 * `--color-app-*` CSS vars, which are populated by the org-app-theming
 * skill at template time and may be overridden at runtime when the user
 * picks a Power BI built-in theme from the settings menu.
 *
 * When `collapsed`, only icons are shown and the rail narrows to 3rem.
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
                    <li>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-s rounded-lg px-s py-s text-300 leading-300 transition-colors",
                                    isActive ? "app-nav-active" : "app-nav-idle",
                                )
                            }
                            title={collapsed ? "Home" : undefined}
                        >
                            <Home className="icon-size-200 shrink-0" />
                            {!collapsed ? <span className="truncate">Home</span> : null}
                        </NavLink>
                    </li>

                    {manifest.reports.length > 0 && !collapsed ? (
                        <li className="mt-s border-t border-border/40 pt-s">
                            <div className="px-s pb-xs text-100 leading-100 font-semibold uppercase tracking-wide opacity-60">
                                Reports
                            </div>
                        </li>
                    ) : null}

                    {manifest.reports.map((r) => (
                        <li key={r.elementId} className="group relative">
                            <NavLink
                                to={`/reports/${r.elementId}`}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-s rounded-lg px-s py-s text-300 leading-300 transition-colors",
                                        isActive ? "app-nav-active" : "app-nav-idle",
                                    )
                                }
                                title={collapsed ? r.displayName : undefined}
                            >
                                <FileBarChart2 className="icon-size-200 shrink-0" />
                                {!collapsed ? (
                                    <span className="flex-1 truncate">
                                        {r.displayName}
                                    </span>
                                ) : null}
                            </NavLink>
                            {!collapsed ? (
                                <a
                                    href={getOpenReportUrl(manifest, r.itemId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Open ${r.displayName} in Power BI`}
                                    className="absolute inset-y-0 right-1 my-auto flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100"
                                >
                                    <ExternalLink className="icon-size-100" />
                                </a>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </nav>

            <style>{`
                .app-nav-idle:hover { background: var(--color-app-background-hover); }
                .app-nav-idle:active { background: var(--color-app-background-pressed); }
                .app-nav-active { background: var(--color-app-background-selected); }
            `}</style>
        </aside>
    );
}
