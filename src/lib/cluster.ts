//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

/**
 * Power BI cluster URL discovery.
 *
 * Org App metadata lives on the tenant's home cluster — which is
 * per-tenant and per-environment. We resolve it once via the public
 * `globalservice/v201606/clusterdetails` endpoint and cache the result
 * for the lifetime of the page.
 */

const GLOBAL_SERVICE_URL =
    "https://api.powerbi.com/powerbi/globalservice/v201606/clusterdetails";

interface ClusterDetailsResponse {
    clusterUrl: string;
}

let cached: Promise<string> | null = null;

/**
 * Resolve the tenant's Power BI cluster URL.
 *
 * @param token - Bearer token for resource `https://analysis.windows.net/powerbi/api`.
 */
export function getClusterUrl(token: string): Promise<string> {
    if (cached) return cached;
    cached = (async () => {
        const res = await fetch(GLOBAL_SERVICE_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
        if (!res.ok) {
            throw new Error(
                `Cluster discovery failed: ${res.status} ${res.statusText}`,
            );
        }
        const body = (await res.json()) as ClusterDetailsResponse;
        if (!body.clusterUrl) {
            throw new Error("Cluster discovery response missing clusterUrl");
        }
        return body.clusterUrl;
    })();
    return cached;
}
