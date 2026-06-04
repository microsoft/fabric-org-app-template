//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useState, type ReactNode } from "react";

import { useAuth } from "../hooks/use-auth";

/**
 * Blocks rendering of the app until the user is signed in via Fabric SSO.
 *
 * Once signed in, the secure-embed iframes inside the app handle their own
 * Power BI auth using the user's AAD session (autoAuth=true).
 */
export function AuthGate({ children }: { children: ReactNode }) {
    const { session, ready, signIn } = useAuth();
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!ready) {
        return (
            <div className="flex h-screen items-center justify-center text-sm text-neutral-500">
                Loading…
            </div>
        );
    }

    if (session) return <>{children}</>;

    const handleSignIn = async () => {
        setError(null);
        setSigningIn(true);
        try {
            await signIn();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setSigningIn(false);
        }
    };

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
            <h1 className="text-2xl font-semibold">Sign in to continue</h1>
            <p className="max-w-md text-sm text-neutral-500">
                This app uses Microsoft Fabric for sign-in. You'll be redirected to the Fabric
                portal to authenticate.
            </p>
            <button
                type="button"
                onClick={handleSignIn}
                disabled={signingIn}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
                {signingIn ? "Signing in…" : "Sign in with Microsoft Fabric"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
