//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { EmbedLinkPage } from "@/components/EmbedLinkPage";
import { OrgAppThemeProvider } from "@/components/OrgAppThemeProvider";
import { OverviewPage } from "@/components/OverviewPage";
import { RdlEmbed } from "@/components/RdlEmbed";
import { ReportEmbed } from "@/components/ReportEmbed";
import { UnconfiguredAppPreview } from "@/components/UnconfiguredAppPreview";
import { isUnconfigured, orgAppManifest } from "@/config/orgAppManifest";
import { findFirstLeaf, getNavItemRoute } from "@/types/orgAppManifest";

export default function App() {
    if (isUnconfigured(orgAppManifest)) {
        return <UnconfiguredAppPreview />;
    }

    // Landing route: prefer the overview if the Org App has one (matches
    // the portal); otherwise jump straight to the first routable leaf
    // (first report, RDL, or embed link in source order).
    const landingPath = computeLandingPath();

    return (
        <OrgAppThemeProvider manifest={orgAppManifest}>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppShell manifest={orgAppManifest} />}>
                        <Route
                            index
                            element={<Navigate to={landingPath} replace />}
                        />
                        <Route
                            path="overview"
                            element={<OverviewPage manifest={orgAppManifest} />}
                        />
                        <Route
                            path="report/:itemId"
                            element={<ReportEmbed manifest={orgAppManifest} />}
                        />
                        <Route
                            path="rdl/:itemId"
                            element={<RdlEmbed manifest={orgAppManifest} />}
                        />
                        <Route
                            path="embed/:elementId"
                            element={<EmbedLinkPage manifest={orgAppManifest} />}
                        />
                        <Route
                            path="*"
                            element={<Navigate to={landingPath} replace />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </OrgAppThemeProvider>
    );
}

function computeLandingPath(): string {
    if (orgAppManifest.overview) return "/overview";
    const firstLeaf = findFirstLeaf(orgAppManifest.sections);
    const route = firstLeaf ? getNavItemRoute(firstLeaf) : undefined;
    // Fall back to the (currently empty) overview route if there's
    // nothing to show — UnconfiguredAppPreview handles the truly-empty
    // case before we get here.
    return route ?? "/overview";
}
