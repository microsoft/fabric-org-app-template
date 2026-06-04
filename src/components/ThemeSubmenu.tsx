//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { ArrowLeft, Check } from "lucide-react";
import type { OrgAppManifest } from "@/types/orgAppManifest";
import { ORG_APP_THEME_KEY, builtInThemes } from "@/config/themePresets";
import { useOrgAppThemeContext } from "@/hooks/org-app-theme.context";

interface ThemeSubmenuProps {
    manifest: OrgAppManifest;
    onBack: () => void;
}

/**
 * Inline submenu listing the manifest's "Org App theme" + every built-in
 * Power BI theme. Selecting an entry persists + applies it immediately.
 */
export function ThemeSubmenu({ manifest, onBack }: ThemeSubmenuProps) {
    const { activeName, setActive } = useOrgAppThemeContext();

    return (
        <div>
            <button
                type="button"
                onClick={onBack}
                className="flex w-full items-center gap-s border-b border-border px-m py-s text-left text-200 leading-200 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
                <ArrowLeft className="icon-size-100" />
                <span>Theme</span>
            </button>

            <ul className="max-h-80 overflow-y-auto py-xs">
                <ThemeOption
                    label={`${manifest.displayName || "Org App"} (default)`}
                    swatch={[
                        manifest.theme.backgroundSelected,
                        manifest.theme.backgroundHover,
                        manifest.theme.background,
                    ]}
                    selected={activeName === ORG_APP_THEME_KEY}
                    onSelect={() => setActive(ORG_APP_THEME_KEY)}
                />
                <li className="my-xs border-t border-border" />
                {builtInThemes.map((t) => (
                    <ThemeOption
                        key={t.name}
                        label={t.name}
                        swatch={t.dataColors.slice(0, 3)}
                        selected={activeName === t.name}
                        onSelect={() => setActive(t.name)}
                    />
                ))}
            </ul>
        </div>
    );
}

interface ThemeOptionProps {
    label: string;
    swatch: string[];
    selected: boolean;
    onSelect: () => void;
}

function ThemeOption({ label, swatch, selected, onSelect }: ThemeOptionProps) {
    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                className="flex w-full items-center gap-s px-m py-s text-left transition-colors hover:bg-muted"
            >
                <span className="flex shrink-0 -space-x-1">
                    {swatch.map((c, i) => (
                        <span
                            key={i}
                            className="h-4 w-4 rounded-full border border-border"
                            style={{ background: c }}
                        />
                    ))}
                </span>
                <span className="flex-1 truncate text-300 leading-300">{label}</span>
                {selected ? <Check className="icon-size-100 text-primary" /> : null}
            </button>
        </li>
    );
}
