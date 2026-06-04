//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useState, useEffect } from "react";

/**
 * Side-effect hook: keeps the `dark` class on `<html>` in sync with the
 * user's color-scheme preference and any `data-appearance` attribute
 * pushed by the Fabric portal when the app runs in an iframe.
 *
 * Returns nothing — mount once at the app root.
 */
export function useAppTheme(): void {
    const [isDark, setIsDark] = useState(() => {
        const appearance = document.documentElement.getAttribute("data-appearance");
        if (appearance === "dark") return true;
        if (appearance === "light") return false;

        if (document.documentElement.classList.contains("dark")) return true;

        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);

    useEffect(() => {
        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        const onMediaChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mql.addEventListener("change", onMediaChange);

        const observer = new MutationObserver(() => {
            const appearance = document.documentElement.getAttribute("data-appearance");
            if (appearance === "dark") setIsDark(true);
            else if (appearance === "light") setIsDark(false);
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-appearance", "class"],
        });

        return () => {
            mql.removeEventListener("change", onMediaChange);
            observer.disconnect();
        };
    }, []);
}
