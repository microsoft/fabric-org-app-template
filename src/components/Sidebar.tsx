//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { NavLink } from "react-router-dom";
import { FileBarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgAppManifest } from "@/types/orgAppManifest";

interface SidebarProps {
    manifest: OrgAppManifest;
}

/**
 * Manifest-driven sidebar. Renders one nav entry per report from the
 * Org App definition. Active / hover / pressed states use the Org App
 * theme colors (--color-app-*) populated by the org-app-theming skill.
 */
export function Sidebar({ manifest }: SidebarProps) {
    return (
        <aside
            className="flex h-full w-64 shrink-0 flex-col border-r border-border"
            style={{
                background: "var(--color-app-background)",
                color: "var(--color-app-foreground)",
            }}
        >
            <div className="px-l py-l">
                <div className="font-heading text-400 font-semibold leading-500">
                    {manifest.displayName || "Org App"}
                </div>
                {manifest.description ? (
                    <div className="mt-xs text-200 leading-200 opacity-80">
                        {manifest.description}
                    </div>
                ) : null}
            </div>
            <nav className="flex-1 overflow-y-auto px-s py-s">
                {manifest.reports.map((r) => (
                    <NavLink
                        key={r.elementId}
                        to={`/reports/${r.elementId}`}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-s rounded-lg px-m py-s text-300 leading-300 transition-colors",
                                isActive ? "app-nav-active" : "app-nav-idle",
                            )
                        }
                    >
                        <FileBarChart2 className="icon-size-200 shrink-0" />
                        <span className="truncate">{r.displayName}</span>
                    </NavLink>
                ))}
            </nav>
            <style>{`
                .app-nav-idle:hover { background: var(--color-app-background-hover); }
                .app-nav-idle:active { background: var(--color-app-background-pressed); }
                .app-nav-active { background: var(--color-app-background-selected); }
            `}</style>
        </aside>
    );
}
