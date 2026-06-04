//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { Link } from "react-router-dom";
import { ExternalLink, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import type { OrgAppManifest } from "@/types/orgAppManifest";
import { getOpenAppUrl } from "@/lib/fabricUrls";
import { SettingsMenu } from "@/components/SettingsMenu";

interface TopbarProps {
    manifest: OrgAppManifest;
    onToggleSidebar: () => void;
    sidebarCollapsed: boolean;
}

/**
 * Persistent top bar: sidebar toggle, app brand (links to home),
 * "Open in Power BI" action, settings menu.
 */
export function Topbar({ manifest, onToggleSidebar, sidebarCollapsed }: TopbarProps) {
    return (
        <header className="flex h-12 shrink-0 items-center gap-m border-b border-border bg-card px-m">
            <button
                type="button"
                onClick={onToggleSidebar}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="rounded-md p-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
                {sidebarCollapsed ? (
                    <PanelLeftOpen className="icon-size-200" />
                ) : (
                    <PanelLeftClose className="icon-size-200" />
                )}
            </button>

            <Link
                to="/"
                className="flex min-w-0 items-center gap-s rounded-md px-s py-xs text-foreground transition-colors hover:bg-muted"
            >
                {manifest.logo ? (
                    <img
                        src={manifest.logo}
                        alt=""
                        aria-hidden="true"
                        className="h-6 w-6 shrink-0 rounded object-cover"
                    />
                ) : (
                    <Sparkles className="icon-size-200 shrink-0 text-primary" />
                )}
                <span className="truncate font-heading text-300 leading-300 font-semibold">
                    {manifest.displayName || "Org App"}
                </span>
            </Link>

            <div className="ml-auto flex items-center gap-xs">
                <a
                    href={getOpenAppUrl(manifest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-xs rounded-md px-s py-xs text-200 leading-200 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ExternalLink className="icon-size-100" />
                    <span>Open in Power BI</span>
                </a>
                <SettingsMenu manifest={manifest} />
            </div>
        </header>
    );
}
