//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

/**
 * Landing screen shown when `orgAppManifest.orgAppId === ""`.
 *
 * Kept deliberately minimal — heading + a tight numbered list of next
 * steps — so the whole thing fits in a typical viewport without
 * scrolling. The agent (org-app-fetch + org-app-parsing +
 * org-app-theming skills) populates `src/config/orgAppManifest.ts` and
 * the theme tokens in `src/global.css`, after which the unconfigured
 * state goes away.
 *
 * Layout: `h-full overflow-y-auto` (not `min-h-screen`) because
 * `html, body, #root` already get `height: 100%` in `global.css` —
 * using `100vh` on top would stack a viewport-tall block inside a
 * viewport-tall root and the page would sprout a vertical scrollbar.
 */
export function UnconfiguredAppPreview() {
    return (
        <div className="h-full overflow-y-auto bg-background">
            <div className="mx-auto w-full max-w-2xl px-l py-xl">
                <h1 className="mb-m font-heading text-600 font-semibold leading-600 text-foreground">
                    Migrate a Power BI Org App
                </h1>

                <ol className="flex list-decimal flex-col gap-s pl-l text-300 leading-300 text-foreground">
                    <li>
                        Open a terminal in this folder and start Copilot:{" "}
                        <code className="rounded bg-muted px-1 font-mono text-200">
                            copilot
                        </code>
                    </li>
                    <li>
                        Ask it:{" "}
                        <span className="font-mono text-200">
                            “Migrate this Org App: &lt;url or id&gt;”
                        </span>
                    </li>
                    <li>
                        Refresh this page once the agent updates{" "}
                        <code className="rounded bg-muted px-1 font-mono text-200">
                            src/config/orgAppManifest.ts
                        </code>
                        .
                    </li>
                </ol>
            </div>
        </div>
    );
}
