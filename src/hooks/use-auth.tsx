//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { OpaqueSession } from "@microsoft/rayfin-auth";

import { RayfinAuthService } from "../services/rayfin-auth.service";
import { AuthContext, type AuthContextValue } from "./auth.context";

export function AuthProvider({ children }: { children: ReactNode }) {
    const service = useMemo(() => new RayfinAuthService(), []);
    const [session, setSession] = useState<OpaqueSession | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        service
            .initEmbedded()
            .then((s) => {
                if (!cancelled && s) setSession(s);
            })
            .catch((err) => {
                console.warn("Embedded auth probe failed:", err);
            })
            .finally(() => {
                if (!cancelled) setReady(true);
            });
        return () => {
            cancelled = true;
        };
    }, [service]);

    const signIn = useCallback(async () => {
        const s = await service.signIn();
        setSession(s);
    }, [service]);

    const signOut = useCallback(async () => {
        await service.signOut();
        setSession(null);
    }, [service]);

    const value: AuthContextValue = { session, ready, signIn, signOut };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
