//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { Sidebar } from "@/components/Sidebar";
import { ReportEmbed } from "@/components/ReportEmbed";
import { UnconfiguredAppPreview } from "@/components/UnconfiguredAppPreview";
import { isUnconfigured, orgAppManifest } from "@/config/orgAppManifest";

export default function App() {
    if (isUnconfigured(orgAppManifest)) {
        return <UnconfiguredAppPreview />;
    }

    const firstReport = orgAppManifest.reports[0];

    return (
        <BrowserRouter>
            <div className="flex h-screen w-screen bg-background text-foreground">
                <Sidebar manifest={orgAppManifest} />
                <main className="flex-1 overflow-hidden">
                    <Routes>
                        <Route
                            path="/reports/:elementId"
                            element={<ReportEmbed manifest={orgAppManifest} />}
                        />
                        <Route
                            path="*"
                            element={
                                firstReport ? (
                                    <Navigate
                                        to={`/reports/${firstReport.elementId}`}
                                        replace
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-300 text-muted-foreground">
                                        This Org App has no reports.
                                    </div>
                                )
                            }
                        />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
