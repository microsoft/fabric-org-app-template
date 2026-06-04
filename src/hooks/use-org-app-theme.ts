//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import { ORG_APP_THEME_KEY, builtInThemes } from "@/config/themePresets";
import {
    applyPowerBITheme,
    resetToOrgAppTheme,
} from "@/lib/theme";
import type { OrgAppManifest } from "@/types/orgAppManifest";

const STORAGE_KEY = "org-app-active-theme";

/**
 * Read the user's persisted theme choice and apply it on mount. Returns
 * the active theme name + a setter that persists + applies the new choice.
 *
 * Default: the manifest theme (sentinel: `ORG_APP_THEME_KEY`).
 */
export function useOrgAppTheme(manifest: OrgAppManifest) {
    const [activeName, setActiveName] = useState<string>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) ?? ORG_APP_THEME_KEY;
        } catch {
            return ORG_APP_THEME_KEY;
        }
    });

    // Apply on mount + when active changes.
    useEffect(() => {
        if (activeName === ORG_APP_THEME_KEY) {
            resetToOrgAppTheme(manifest);
            return;
        }
        const pbi = builtInThemes.find((t) => t.name === activeName);
        if (pbi) applyPowerBITheme(pbi);
        else resetToOrgAppTheme(manifest);
    }, [activeName, manifest]);

    const setActive = useCallback((name: string) => {
        try {
            if (name === ORG_APP_THEME_KEY) localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, name);
        } catch {
            /* ignore */
        }
        setActiveName(name);
    }, []);

    return { activeName, setActive };
}
