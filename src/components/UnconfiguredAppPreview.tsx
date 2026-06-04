//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

/**
 * Landing screen shown when `orgAppManifest.orgAppId === ""`.
 *
 * The agent (via the org-app-fetch + org-app-parsing + org-app-theming
 * skills) populates `src/config/orgAppManifest.ts` and the theme tokens
 * in `src/global.css`, after which the unconfigured state goes away.
 */
export function UnconfiguredAppPreview() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-l">
            <div className="w-full max-w-2xl">
                <h1 className="mb-s font-heading text-700 font-semibold leading-700 text-foreground">
                    Migrate a Power BI Org App
                </h1>
                <p className="mb-l text-300 leading-300 text-muted-foreground">
                    This template will become your Org App. Run the migration
                    agent and tell it your Org App ID — it will populate the
                    sidebar (sections, sub-sections, paginated reports,
                    embedded links, and new-tab links), introduction page,
                    logo, and theme for you.
                </p>

                <div className="rounded-lg border border-border bg-card p-l">
                    <div className="mb-s text-200 leading-200 font-medium text-foreground">
                        Next step
                    </div>
                    <p className="mb-m text-200 leading-200 text-muted-foreground">
                        Open this folder in your terminal and run:
                    </p>
                    <pre className="overflow-x-auto rounded-md bg-muted px-m py-s font-mono text-200 leading-200 text-foreground">
                        copilot
                    </pre>
                    <p className="mt-m text-200 leading-200 text-muted-foreground">
                        Then say:{" "}
                        <span className="font-mono text-foreground">
                            "Migrate this Org App."
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
