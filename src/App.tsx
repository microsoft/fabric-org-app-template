//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { HomePage } from "@/components/HomePage";
import { OrgAppThemeProvider } from "@/components/OrgAppThemeProvider";
import { ReportEmbed } from "@/components/ReportEmbed";
import { UnconfiguredAppPreview } from "@/components/UnconfiguredAppPreview";
import { isUnconfigured, orgAppManifest } from "@/config/orgAppManifest";

export default function App() {
    if (isUnconfigured(orgAppManifest)) {
        return <UnconfiguredAppPreview />;
    }

    return (
        <OrgAppThemeProvider manifest={orgAppManifest}>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppShell manifest={orgAppManifest} />}>
                        <Route
                            index
                            element={<HomePage manifest={orgAppManifest} />}
                        />
                        <Route
                            path="reports/:elementId"
                            element={<ReportEmbed manifest={orgAppManifest} />}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </OrgAppThemeProvider>
    );
}
