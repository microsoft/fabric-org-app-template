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
 *   - **Order matters.** `nav` is rendered top-to-bottom and each
 *     section's `items` is rendered in array order. The parser MUST
 *     preserve the source ordering from `workloadPayload.elements`.
 *   - **Single ordered nav.** Top-level nav is a flat list of two
 *     entry kinds — `contentPage` (markdown pages authored as
 *     `elementType: "overview"` in the envelope) and `section` (groups
 *     of routable items). Apps may have zero, one, or many content
 *     pages, freely interleaved with sections. The template renders
 *     them in source order beneath the always-on auto-generated
 *     Overview cards page.
 *   - **Recursion.** A section's `items` can itself contain `{ kind:
 *     "section" }` entries. The current Power BI portal only emits a
 *     single level, but the data model permits nesting and the sidebar
 *     renders the tree recursively.
 *   - **Filtering at parse time.** Bare top-level datasets are dropped
 *     by the parser — they have no rendering path in this template. A
 *     section whose `items` is empty after filtering is also dropped.
 *   - **Auto-generated Overview.** The template synthesizes a cards
 *     landing page at `/overview` from `nav` (sections + their
 *     flattened leaves). It is always the default route and is **not**
 *     represented in `nav`.
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

    /**
     * Top-level nav in **source order** from the envelope's
     * `payload.elements`. Mix of `contentPage` and `section` entries.
     * The auto-generated Overview cards page is always rendered first
     * by the template — it is NOT in this list.
     */
    nav: OrgAppNavEntry[];

    /** Theme colors — applied via the org-app-theming skill. */
    theme: OrgAppTheme;
}

/**
 * Top-level nav entry. Either a markdown content page (rendered at
 * `/page/:elementId`) or a sidebar section of routable items.
 */
export type OrgAppNavEntry = OrgAppContentPage | OrgAppSectionItem;

/**
 * Author-supplied markdown page. Maps from `elementType: "overview"`
 * in the envelope. Apps may have any number of these — the template
 * renders each as a sidebar entry whose label is `displayName`, and a
 * route at `/page/:elementId`.
 */
export interface OrgAppContentPage {
    kind: "contentPage";
    /** Stable element ID from the envelope. Used as the route slug. */
    elementId: string;
    /** Sidebar label (envelope element root `displayName`, e.g. "Introduction"). */
    displayName: string;
    /** Heading text (envelope `header.title`). */
    title: string;
    /** Markdown body (envelope `header.body`). GitHub-flavored. */
    body: string;
    /** If true, render the header card with `--color-app-*` tokens (envelope `header.showTheme`). */
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

/** A nested sidebar group (also reused as a top-level `OrgAppNavEntry`). */
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
    /**
     * Optional text color used for the active (selected) nav item.
     * Required when `backgroundSelected` is a saturated accent (e.g.
     * Power BI brand yellow) that would otherwise clash with the
     * default `foreground` text color. When omitted, the shell falls
     * back to `foreground`.
     */
    foregroundSelected?: string;
}

// --- helpers ---------------------------------------------------------------

/** Return only the section entries from a nav list, preserving order. */
export function getSections(nav: OrgAppNavEntry[]): OrgAppSectionItem[] {
    return nav.filter((e): e is OrgAppSectionItem => e.kind === "section");
}

/** Return only the content-page entries from a nav list, preserving order. */
export function getContentPages(nav: OrgAppNavEntry[]): OrgAppContentPage[] {
    return nav.filter((e): e is OrgAppContentPage => e.kind === "contentPage");
}

/** Find a content page by `elementId`. */
export function findContentPage(
    nav: OrgAppNavEntry[],
    elementId: string,
): OrgAppContentPage | undefined {
    return getContentPages(nav).find((p) => p.elementId === elementId);
}

/**
 * Walk every nav item in a section's items list, depth-first, yielding
 * every item (including nested sections). Used by route lookups inside
 * sections.
 */
export function* walkNavItems(items: OrgAppNavItem[]): Generator<OrgAppNavItem> {
    for (const it of items) {
        yield it;
        if (it.kind === "section") {
            yield* walkNavItems(it.items);
        }
    }
}

/** Find any nav item by `elementId` inside the sections of a nav list. */
export function findNavItem(
    nav: OrgAppNavEntry[],
    elementId: string,
): OrgAppNavItem | undefined {
    for (const s of getSections(nav)) {
        for (const it of walkNavItems(s.items)) {
            if (it.elementId === elementId) return it;
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
