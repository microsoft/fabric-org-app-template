//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useMemo, type ReactNode } from "react";
import { OrgAppThemeContext } from "@/hooks/org-app-theme.context";
import { useOrgAppTheme } from "@/hooks/use-org-app-theme";
import type { OrgAppManifest } from "@/types/orgAppManifest";

interface OrgAppThemeProviderProps {
    manifest: OrgAppManifest;
    children: ReactNode;
}

export function OrgAppThemeProvider({ manifest, children }: OrgAppThemeProviderProps) {
    const { activeName, setActive } = useOrgAppTheme(manifest);
    const value = useMemo(() => ({ activeName, setActive }), [activeName, setActive]);
    return (
        <OrgAppThemeContext.Provider value={value}>{children}</OrgAppThemeContext.Provider>
    );
}
