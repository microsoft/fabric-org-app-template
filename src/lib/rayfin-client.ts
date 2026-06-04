//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import RayfinClient from "@microsoft/rayfin-client";

let client: RayfinClient | null = null;

/**
 * Singleton RayfinClient configured from `VITE_RAYFIN_*` env vars.
 *
 * The env vars are populated by `npx rayfin up` into `.env.local`.
 *
 * Consumed today by `RayfinAuthService` (Fabric SSO via `client.auth`).
 * When you start adding Rayfin data entities or functions, import
 * `getRayfinClient()` from here so all callers share the same client.
 */
export function getRayfinClient(): RayfinClient {
    if (client) return client;

    const baseUrl = import.meta.env.VITE_RAYFIN_API_URL;
    const publishableKey = import.meta.env.VITE_RAYFIN_PUBLISHABLE_KEY;

    if (!baseUrl || !publishableKey) {
        throw new Error(
            "Missing VITE_RAYFIN_API_URL or VITE_RAYFIN_PUBLISHABLE_KEY — run 'npx rayfin up'",
        );
    }

    client = new RayfinClient({ baseUrl, publishableKey });
    return client;
}
