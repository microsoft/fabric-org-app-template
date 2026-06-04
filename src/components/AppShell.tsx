//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import type { OrgAppManifest } from "@/types/orgAppManifest";

interface AppShellProps {
    manifest: OrgAppManifest;
}

/**
 * Topbar + collapsible Sidebar + main content outlet. Routes render
 * inside `<Outlet />` so the shell chrome stays mounted across navigation.
 */
export function AppShell({ manifest }: AppShellProps) {
    const [collapsed, setCollapsed] = useSidebarCollapsed();

    return (
        <div className="flex h-screen w-screen flex-col bg-background text-foreground">
            <Topbar
                manifest={manifest}
                onToggleSidebar={() => setCollapsed(!collapsed)}
                sidebarCollapsed={collapsed}
            />
            <div className="flex min-h-0 flex-1">
                <Sidebar manifest={manifest} collapsed={collapsed} />
                <main className="min-w-0 flex-1 overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
