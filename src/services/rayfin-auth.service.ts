//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { Auth, OpaqueSession } from "@microsoft/rayfin-auth";
import {
    ensureSignedInWithFabric,
    initEmbeddedAuth,
    type FabricAuthOptions,
} from "@microsoft/rayfin-auth-provider-fabric";

import { getRayfinClient } from "../lib/rayfin-client";

/**
 * Wraps the Rayfin Fabric auth provider with the env-driven options this app needs.
 *
 * Two entry points:
 *  - `initEmbedded()` — call on app start. No-op outside Fabric iframe mode.
 *  - `signIn()` — call from a user-gesture handler (button click). Opens the
 *    Fabric portal in a popup for brokered AAD sign-in.
 */
export class RayfinAuthService {
    private get auth(): Auth {
        return getRayfinClient().auth;
    }

    private getOptions(): FabricAuthOptions {
        const workspaceId = import.meta.env.VITE_FABRIC_WORKSPACE_ID;
        const projectId = import.meta.env.VITE_FABRIC_ITEM_ID;
        if (!workspaceId || !projectId) {
            throw new Error(
                "Missing VITE_FABRIC_WORKSPACE_ID or VITE_FABRIC_ITEM_ID — run 'npx rayfin up'",
            );
        }
        return {
            workspaceId,
            projectId,
            // Production default.
            fabricPortalUrl:
                import.meta.env.VITE_FABRIC_PORTAL_URL ?? "https://app.fabric.microsoft.com",
            returnOrigin: window.location.origin,
        };
    }

    initEmbedded(): Promise<OpaqueSession | null> {
        return initEmbeddedAuth(this.auth, this.getOptions());
    }

    signIn(): Promise<OpaqueSession> {
        return ensureSignedInWithFabric(this.auth, this.getOptions());
    }

    signOut(): Promise<void> {
        return this.auth.signOut();
    }
}
