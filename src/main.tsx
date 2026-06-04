//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import App from "./App.tsx";
import { ErrorFallback } from "./ErrorFallback";
import { AuthGate } from "./components/AuthGate";
import { AuthProvider } from "./hooks/use-auth";
import { useAppTheme } from "./hooks/use-theme";

import "./global.css";

function Root() {
    // Side-effect only: keeps the `dark` class on <html> in sync with the
    // user's OS / Fabric portal `data-appearance` setting.
    useAppTheme();

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AuthProvider>
                <AuthGate>
                    <App />
                </AuthGate>
            </AuthProvider>
        </ErrorBoundary>
    );
}

createRoot(document.getElementById("root")!).render(<Root />);
