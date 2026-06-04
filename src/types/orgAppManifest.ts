//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

/**
 * The shape the app consumes at runtime — extracted by the org-app-fetch
 * + org-app-parsing skills from the raw `metadata/artifacts/{id}` envelope.
 *
 * Design notes:
 *   - **Order matters.** `sections` is rendered top-to-bottom and each
 *     section's `items` is rendered in array order. The parser MUST
 *     preserve the source ordering from `workloadPayload.elements`.
 *   - **Recursion.** A section's `items` can itself contain `{ kind:
 *     "section" }` entries. The current Power BI portal only emits a
 *     single level, but the data model permits nesting and the sidebar
 *     renders the tree recursively.
 *   - **Filtering at parse time.** Kusto dashboards (`itemType:
 *     "KustoDashboard"`) and bare top-level datasets are dropped by the
 *     parser — they have no rendering path in this template. A section
 *     whose `items` is empty after filtering is also dropped.
 *   - **`overview`** is the Org App's intro page (`elementType:
 *     "overview"` in the envelope). The body is markdown. Renders at
 *     route `/overview` and is the default landing when present.
 *   - **`logo`** is a `data:image/...;base64,...` URL — small enough
 *     (typically <40 KB) to inline into the manifest.
 */
export interface OrgAppManifest {
    /** Power BI workspace ID that owns the Org App. */
    workspaceId: string;

    /** Org App object ID (the artifact ID). */
    orgAppId: string;

    /** Tenant ID — required for the secure report embed URL. */
    tenantId: string;

    /** Display name shown in the app header. */
    displayName: string;

    /** Optional description from the Org App envelope. */
    description?: string;

    /** Inline logo data URL (settings.logo). */
    logo?: string;

    /** Intro page; rendered at `/overview` and used as the default route. */
    overview?: OrgAppOverview;

    /** Top-level sidebar groups, in source order. */
    sections: OrgAppSection[];

    /** Theme colors — applied via the org-app-theming skill. */
    theme: OrgAppTheme;
}

export interface OrgAppOverview {
    /** Stable element ID from the envelope. */
    elementId: string;
    /** Heading text. */
    title: string;
    /** Markdown body. */
    body: string;
    /** If true, render the header card with `--color-app-*` tokens. */
    showTheme: boolean;
}

export interface OrgAppSection {
    /** Stable element ID from the envelope. */
    elementId: string;
    /** Section label shown in the sidebar. */
    displayName: string;
    /** Children, in source order. Mixed-type (recursive). */
    items: OrgAppNavItem[];
}

/**
 * Discriminated union of everything that can appear in a section's items
 * list. `kind` is the runtime discriminator.
 */
export type OrgAppNavItem =
    | OrgAppSectionItem
    | OrgAppReportItem
    | OrgAppRdlReportItem
    | OrgAppLinkEmbedItem
    | OrgAppLinkNewtabItem;

/** A nested sidebar group. */
export interface OrgAppSectionItem extends OrgAppSection {
    kind: "section";
}

/** Power BI report — embedded at `/report/:itemId`. */
export interface OrgAppReportItem {
    kind: "report";
    elementId: string;
    itemId: string;
    displayName: string;
}

/** Paginated (RDL) report — embedded at `/rdl/:itemId`. */
export interface OrgAppRdlReportItem {
    kind: "rdlreport";
    elementId: string;
    itemId: string;
    displayName: string;
}

/**
 * Embedded link — opens the prebaked `url` inside an iframe at
 * `/embed/:elementId`. The URL may point at a different Fabric/Power BI
 * host than the deployed app; users may need to sign in to that host
 * separately if SSO isn't seeded.
 */
export interface OrgAppLinkEmbedItem {
    kind: "linkEmbed";
    elementId: string;
    url: string;
    displayName: string;
}

/** External link — opens `url` in a new browser tab. */
export interface OrgAppLinkNewtabItem {
    kind: "linkNewtab";
    elementId: string;
    url: string;
    displayName: string;
}

export interface OrgAppTheme {
    background: string;
    foreground: string;
    backgroundHover: string;
    backgroundSelected: string;
    backgroundPressed: string;
}

// --- helpers ---------------------------------------------------------------

/**
 * Walk every nav item in the manifest, depth-first, yielding every
 * `section` recursively along with its items. Used by the sidebar and
 * by route lookups.
 */
export function* walkNavItems(items: OrgAppNavItem[]): Generator<OrgAppNavItem> {
    for (const it of items) {
        yield it;
        if (it.kind === "section") {
            yield* walkNavItems(it.items);
        }
    }
}

/** Find any nav item by `elementId`, recursing into nested sections. */
export function findNavItem(
    sections: OrgAppSection[],
    elementId: string,
): OrgAppNavItem | undefined {
    for (const s of sections) {
        for (const it of walkNavItems(s.items)) {
            if (it.elementId === elementId) return it;
        }
    }
    return undefined;
}

/**
 * The first non-section leaf item, in source order, across all
 * sections. Used as the fallback landing when there is no overview.
 */
export function findFirstLeaf(
    sections: OrgAppSection[],
): OrgAppNavItem | undefined {
    for (const s of sections) {
        for (const it of walkNavItems(s.items)) {
            if (it.kind !== "section") return it;
        }
    }
    return undefined;
}

/** Returns the in-app route for a leaf nav item. */
export function getNavItemRoute(item: OrgAppNavItem): string | undefined {
    switch (item.kind) {
        case "report":
            return `/report/${item.itemId}`;
        case "rdlreport":
            return `/rdl/${item.itemId}`;
        case "linkEmbed":
            return `/embed/${item.elementId}`;
        case "linkNewtab":
        case "section":
            return undefined;
    }
}
