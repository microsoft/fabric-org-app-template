//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { Info, Palette, Settings } from "lucide-react";
import type { OrgAppManifest } from "@/types/orgAppManifest";
import { ThemeSubmenu } from "@/components/ThemeSubmenu";
import { ConfigurationDialog } from "@/components/ConfigurationDialog";

interface SettingsMenuProps {
    manifest: OrgAppManifest;
}

type Panel = "root" | "theme";

/**
 * Top-right gear dropdown. Two items today:
 *   - Theme       → opens an inline submenu of Power BI built-in themes
 *   - Configuration → opens a modal showing source Org App + manifest
 *
 * Designed to mirror the affordances of the Power BI portal "View > Theme"
 * dropdown so the experience is familiar to Org App users.
 */
export function SettingsMenu({ manifest }: SettingsMenuProps) {
    const [open, setOpen] = useState(false);
    const [panel, setPanel] = useState<Panel>("root");
    const [configOpen, setConfigOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setPanel("root");
            }
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                setPanel("root");
            }
        };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    return (
        <>
            <div ref={ref} className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setOpen((o) => !o);
                        setPanel("root");
                    }}
                    aria-label="Settings"
                    aria-expanded={open}
                    className="rounded-md p-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Settings className="icon-size-200" />
                </button>

                {open ? (
                    <div className="absolute right-0 top-full z-50 mt-xs w-64 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
                        {panel === "root" ? (
                            <ul className="py-xs">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setPanel("theme")}
                                        className="flex w-full items-center gap-s px-m py-s text-left text-300 leading-300 transition-colors hover:bg-muted"
                                    >
                                        <Palette className="icon-size-200 text-muted-foreground" />
                                        <span className="flex-1">Theme</span>
                                        <span className="text-200 text-muted-foreground">›</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setConfigOpen(true);
                                            setOpen(false);
                                        }}
                                        className="flex w-full items-center gap-s px-m py-s text-left text-300 leading-300 transition-colors hover:bg-muted"
                                    >
                                        <Info className="icon-size-200 text-muted-foreground" />
                                        <span>Configuration</span>
                                    </button>
                                </li>
                            </ul>
                        ) : (
                            <ThemeSubmenu
                                manifest={manifest}
                                onBack={() => setPanel("root")}
                            />
                        )}
                    </div>
                ) : null}
            </div>

            {configOpen ? (
                <ConfigurationDialog
                    manifest={manifest}
                    onClose={() => setConfigOpen(false)}
                />
            ) : null}
        </>
    );
}
