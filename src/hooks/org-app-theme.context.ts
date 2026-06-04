//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { createContext, useContext } from "react";
import { ORG_APP_THEME_KEY } from "@/config/themePresets";

interface OrgAppThemeContextValue {
    /** Name of the active theme, or `ORG_APP_THEME_KEY` for the manifest theme. */
    activeName: string;
    /** Switch to a named built-in theme, or `ORG_APP_THEME_KEY` to reset. */
    setActive: (name: string) => void;
}

export const OrgAppThemeContext = createContext<OrgAppThemeContextValue>({
    activeName: ORG_APP_THEME_KEY,
    setActive: () => {},
});

export function useOrgAppThemeContext() {
    return useContext(OrgAppThemeContext);
}
