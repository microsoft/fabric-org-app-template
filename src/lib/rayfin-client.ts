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
 * This template does not currently call any Rayfin data or auth APIs —
 * the client is wired up as a convenience so you can `import { getRayfinClient }`
 * when you start adding entities or functions.
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
