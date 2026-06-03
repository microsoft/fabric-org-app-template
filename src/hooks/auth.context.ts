//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { createContext } from "react";

import type { OpaqueSession } from "@microsoft/rayfin-auth";

export interface AuthContextValue {
    /** Current authenticated session, or null if signed out. */
    session: OpaqueSession | null;
    /** True once the embedded-auth probe on mount has completed. */
    ready: boolean;
    /** Trigger the popup sign-in flow. MUST be called from a user-gesture handler. */
    signIn: () => Promise<void>;
    /** Sign out the current user. */
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
