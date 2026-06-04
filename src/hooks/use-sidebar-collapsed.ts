//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useEffect, useState } from "react";

const STORAGE_KEY = "org-app-sidebar-collapsed";

/** Persisted boolean for whether the sidebar is collapsed. */
export function useSidebarCollapsed(): [boolean, (next: boolean) => void] {
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === "1";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
        } catch {
            /* ignore quota / disabled storage */
        }
    }, [collapsed]);

    return [collapsed, setCollapsed];
}
