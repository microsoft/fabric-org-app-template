//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { ContentPage } from "@/components/ContentPage";
import { EmbedLinkPage } from "@/components/EmbedLinkPage";
import { OrgAppThemeProvider } from "@/components/OrgAppThemeProvider";
import { OverviewPage } from "@/components/OverviewPage";
import { RdlEmbed } from "@/components/RdlEmbed";
import { ReportEmbed } from "@/components/ReportEmbed";
import { UnconfiguredAppPreview } from "@/components/UnconfiguredAppPreview";
import { isUnconfigured, orgAppManifest } from "@/config/orgAppManifest";

export default function App() {
    if (isUnconfigured(orgAppManifest)) {
        return <UnconfiguredAppPreview />;
    }

    // Landing route is always the auto-generated cards Overview page
    // (mirrors the Power BI Org App "About" page). Author-supplied
    // content pages (envelope `elementType: "overview"`) are rendered at
    // `/page/:elementId` in source order — zero, one, or many of them.
    return (
        <OrgAppThemeProvider manifest={orgAppManifest}>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppShell manifest={orgAppManifest} />}>
                        <Route
                            index
                            element={<Navigate to="/overview" replace />}
                        />
                        <Route
                            path="overview"
                            element={<OverviewPage manifest={orgAppManifest} />}
                        />
                        <Route
                            path="page/:elementId"
                            element={<ContentPage manifest={orgAppManifest} />}
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
                            element={<Navigate to="/overview" replace />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </OrgAppThemeProvider>
    );
}
