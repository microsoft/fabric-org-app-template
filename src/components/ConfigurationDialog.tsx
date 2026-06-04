//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import type { OrgAppManifest } from "@/types/orgAppManifest";
import { getOpenAppUrl } from "@/lib/fabricUrls";

interface ConfigurationDialogProps {
    manifest: OrgAppManifest;
    onClose: () => void;
}

/**
 * Read-only modal showing the source Org App that this template was
 * migrated from. Surfaces:
 *   - Display name + IDs (workspace / org app / tenant) with copy buttons
 *   - Report count + display names
 *   - "Open in Power BI" deep link
 *   - The full manifest JSON (the same shape persisted in
 *     `src/config/orgAppManifest.ts`)
 *
 * Foundation for a future live-sync feature — for now, users re-run the
 * Copilot agent to re-migrate when the source app changes.
 */
export function ConfigurationDialog({ manifest, onClose }: ConfigurationDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-l"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="config-dialog-title"
                className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl"
            >
                <header className="flex shrink-0 items-center justify-between border-b border-border px-l py-m">
                    <h2
                        id="config-dialog-title"
                        className="font-heading text-400 leading-400 font-semibold"
                    >
                        Configuration
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="icon-size-200" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-l py-m">
                    <section className="mb-l">
                        <h3 className="mb-s font-heading text-300 leading-300 font-semibold">
                            Source Org App
                        </h3>
                        <dl className="grid grid-cols-1 gap-s">
                            <Row label="Display name" value={manifest.displayName} />
                            <Row label="Org App ID" value={manifest.orgAppId} mono />
                            <Row label="Workspace ID" value={manifest.workspaceId} mono />
                            <Row label="Tenant ID" value={manifest.tenantId} mono />
                            <Row
                                label="Reports"
                                value={`${manifest.reports.length} embedded`}
                            />
                        </dl>

                        <a
                            href={getOpenAppUrl(manifest)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-m inline-flex items-center gap-xs rounded-md border border-border px-m py-s text-300 leading-300 transition-colors hover:bg-muted"
                        >
                            <ExternalLink className="icon-size-100" />
                            Open in Power BI
                        </a>
                    </section>

                    <section className="mb-l">
                        <h3 className="mb-s font-heading text-300 leading-300 font-semibold">
                            Manifest
                        </h3>
                        <pre className="max-h-72 overflow-auto rounded-md border border-border bg-muted p-s font-monospace text-200 leading-200">
                            {JSON.stringify(manifest, null, 2)}
                        </pre>
                    </section>

                    <section className="rounded-md border border-border bg-muted/40 p-m text-200 leading-200 text-muted-foreground">
                        <strong className="font-semibold text-foreground">Tip:</strong>{" "}
                        To sync changes from the source Org App, run{" "}
                        <code className="rounded bg-background px-1 font-monospace">
                            copilot
                        </code>{" "}
                        in this repo and ask the migration agent to re-migrate. A future
                        version of the template will hook this directly into the dialog.
                    </section>
                </div>
            </div>
        </div>
    );
}

interface RowProps {
    label: string;
    value: string;
    mono?: boolean;
}

function Row({ label, value, mono }: RowProps) {
    const [copied, setCopied] = useState(false);

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard not available — fail silently */
        }
    };

    return (
        <div className="grid grid-cols-[10rem_1fr_auto] items-center gap-s">
            <dt className="text-200 leading-200 text-muted-foreground">{label}</dt>
            <dd
                className={
                    mono
                        ? "truncate font-monospace text-200 leading-200"
                        : "truncate text-300 leading-300"
                }
                title={value}
            >
                {value}
            </dd>
            <button
                type="button"
                onClick={onCopy}
                aria-label={`Copy ${label}`}
                className="rounded-md p-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
                {copied ? (
                    <Check className="icon-size-100 text-primary" />
                ) : (
                    <Copy className="icon-size-100" />
                )}
            </button>
        </div>
    );
}
