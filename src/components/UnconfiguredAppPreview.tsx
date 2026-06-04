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
 *
 * Layout: `h-full` (not `min-h-screen`) because `html, body, #root`
 * already get `height: 100%` in `global.css` — using `100vh` on top of
 * that produces a viewport-tall block plus the root's full height and
 * the page sprouts a spurious vertical scrollbar.
 */
export function UnconfiguredAppPreview() {
    return (
        <div className="flex h-full items-center justify-center overflow-y-auto bg-background p-l">
            <div className="w-full max-w-2xl">
                <h1 className="mb-s font-heading text-700 font-semibold leading-700 text-foreground">
                    Migrate a Power BI Org App
                </h1>
                <p className="mb-l text-300 leading-300 text-muted-foreground">
                    This template becomes a deployable web app for your
                    Power BI Org App. The migration agent reads the source
                    Org App and writes the sidebar, content pages, logo, and
                    theme into this repo — you don't edit any code by hand.
                </p>

                <div className="rounded-lg border border-border bg-card p-l">
                    <div className="mb-s text-300 leading-300 font-semibold text-foreground">
                        Next steps
                    </div>
                    <ol className="flex list-decimal flex-col gap-m pl-l text-300 leading-300 text-foreground">
                        <li>
                            <span className="font-medium">
                                Open a terminal in this folder
                            </span>{" "}
                            <span className="text-muted-foreground">
                                ({" "}
                                <code className="rounded bg-muted px-1 font-mono text-200">
                                    {`cd ${"<this folder>"}`}
                                </code>{" "}
                                ).
                            </span>
                        </li>
                        <li>
                            <span className="font-medium">Start Copilot:</span>
                            <pre className="mt-xs overflow-x-auto rounded-md bg-muted px-m py-s font-mono text-200 leading-200 text-foreground">
                                copilot
                            </pre>
                        </li>
                        <li>
                            <span className="font-medium">
                                Ask it to migrate your Org App
                            </span>{" "}
                            — paste the Org App URL or the Org App ID
                            (GUID). For example:
                            <pre className="mt-xs overflow-x-auto rounded-md bg-muted px-m py-s font-mono text-200 leading-200 text-foreground whitespace-pre-wrap">
                                {`Migrate this Org App: https://app.powerbi.com/groups/<workspaceId>/orgApps/<orgAppId>`}
                            </pre>
                        </li>
                        <li>
                            <span className="font-medium">
                                Refresh this page
                            </span>{" "}
                            <span className="text-muted-foreground">
                                once the agent reports it has updated{" "}
                                <code className="rounded bg-muted px-1 font-mono text-200">
                                    src/config/orgAppManifest.ts
                                </code>{" "}
                                — the unconfigured screen will be replaced by
                                your app.
                            </span>
                        </li>
                    </ol>

                    <p className="mt-l text-200 leading-200 text-muted-foreground">
                        Need to re-migrate after the source Org App changes?
                        Run the same prompt again — the agent overwrites the
                        manifest in place.
                    </p>
                </div>
            </div>
        </div>
    );
}
