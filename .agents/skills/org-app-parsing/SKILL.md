---
name: org-app-parsing
description: Parse a Power BI Org App envelope returned by the org-app-fetch skill into the OrgAppManifest shape this template consumes. Use after org-app-fetch to extract the workspace ID, ordered `nav` (interleaved markdown content pages + recursive sections of reports, paginated reports, embedded + new-tab links), logo, and theme, then write src/config/orgAppManifest.ts.
---

# org-app-parsing

## When to use this skill

Immediately after **org-app-fetch** succeeds — you have an `$envelope` object and `$tenantId`, and need to write `src/config/orgAppManifest.ts`.

## Envelope shape (input)

The relevant top-level fields from the artifact envelope:

```jsonc
{
  "objectId": "1b663c51-...",       // becomes manifest.orgAppId
  "artifactType": "OrgApp",
  "displayName": "Reach DRI",
  "description": "...",              // optional
  "folderObjectId": "a8ecb0b7-...", // becomes manifest.workspaceId
  "payloadContentType": "InlineJson",
  "workloadPayload": "{ ... JSON-encoded OrgApp definition ... }"
}
```

## Two-stage parse

`workloadPayload` is a **JSON string** — parse it a second time:

```powershell
$payload = $envelope.workloadPayload | ConvertFrom-Json
```

`$payload` has shape:

```jsonc
{
  "settings": {
    "logo": "data:image/png;base64,...",   // optional inline image
    "theme": {
      "background":         "#1e6668",
      "foreground":         "#ffffff",
      "backgroundHover":    "#2a7375",
      "backgroundSelected": "#3a8082",
      "backgroundPressed":  "#175558"
    }
  },
  "elements": [
    // Top-level elements appear in source order — content pages and
    // sections may be freely interleaved. An app may have zero, one, or
    // many of each. Examples:
    { "elementType": "overview", "elementId": "...", "displayName": "Welcome",
      "header": { "title": "Welcome", "body": "...markdown...", "showTheme": true } },

    { "elementType": "section",  "elementId": "...", "displayName": "Group A",
      "elements": [
        // Section children — same envelope shape, mixed types:
        { "elementType": "item", "itemType": "report",       "elementId": "...",
          "itemId": "...", "displayName": "..." },
        { "elementType": "item", "itemType": "rdlreport",    "elementId": "...",
          "itemId": "...", "displayName": "..." },
        { "elementType": "link", "linkType": "embedded",     "elementId": "...",
          "url":    "https://...",
          "displayName": "..." },
        { "elementType": "link", "linkType": "newtab",       "elementId": "...",
          "url":    "https://...",
          "displayName": "..." },
        // Kusto and bare datasets — DROP these (no rendering path):
        { "elementType": "item", "itemType": "KustoDashboard", ... },
        { "elementType": "item", "itemType": "dataset",        ... },
        // Sections may nest other sections — RECURSE:
        { "elementType": "section", "elementId": "...", "displayName": "Subgroup",
          "elements": [ ... ] }
      ] },

    // ...another overview content page may come after sections:
    { "elementType": "overview", "elementId": "...", "displayName": "Reference",
      "header": { "title": "Reference", "body": "...markdown...", "showTheme": false } }
  ]
}
```

> The model permits arbitrary section nesting; the template renders the tree recursively.

## Output model

The template consumes a single ordered `nav` array — a discriminated union of two entry kinds:

- `{ kind: "contentPage", elementId, displayName, title, body, showTheme }` — author-supplied markdown page rendered at `/page/:elementId`.
- `{ kind: "section",     elementId, displayName, items }` — sidebar group whose `items` are routable leaves (reports, RDL, link-embed, link-newtab) or nested sections.

The auto-generated Overview cards landing at `/overview` is synthesized by the template at runtime from `nav`'s sections — **do not emit it.**

## Mapping table

Apply these rules **in order**, **preserving source order** at every level. Use arrays (not maps) end-to-end. Every top-level element pushes one entry into `nav`.

| Source element | Maps to | Notes |
|---|---|---|
| `elementType: "overview"` (top-level) | Push `{ kind: "contentPage", elementId, displayName, title, body, showTheme }` to `nav` | Read root `displayName`. Read `header.title`, `header.body`, `header.showTheme` from the nested `header` object. Multiple are allowed. |
| `elementType: "section"` (top-level) | Push `{ kind: "section", elementId, displayName, items }` to `nav` | Recurse into `.elements` to build `.items`. |
| `elementType: "section"` (nested inside `.elements`) | `{ kind: "section", elementId, displayName, items }` | Same recursion. |
| `elementType: "item"` + `itemType: "report"` | `{ kind: "report", elementId, itemId, displayName }` | Power BI PBIX report → `/report/:itemId`. |
| `elementType: "item"` + `itemType: "rdlreport"` | `{ kind: "rdlreport", elementId, itemId, displayName }` | Paginated report → `/rdl/:itemId`. |
| `elementType: "link"` + `linkType: "embedded"` | `{ kind: "linkEmbed", elementId, url, displayName }` | Iframe at `/embed/:elementId`. URL passed verbatim. |
| `elementType: "link"` + `linkType: "newtab"` | `{ kind: "linkNewtab", elementId, url, displayName }` | Sidebar `<a target="_blank">`, no in-app route. |
| `elementType: "item"` + `itemType: "KustoDashboard"` | **DROP** | No rendering path in this template. |
| `elementType: "item"` + `itemType: "dataset"` | **DROP** | Datasets are consumed by reports, never user-facing. |
| `elementType: "item"` + any other `itemType` | **DROP** + warn | Unknown artifact type. Tell the user. |

After mapping, **drop sections whose `items` is empty** (e.g. a section that only contained Kusto dashboards). Apply this drop recursively bottom-up. **Do not** drop content pages.

`settings.logo` (if present) → `manifest.logo` verbatim (it's already a `data:` URL).

`settings.theme` → `manifest.theme`. If `settings.theme` is missing, keep the defaults already in the file.

## Output: `src/config/orgAppManifest.ts`

Overwrite the file with the populated manifest. Preserve the file's header copyright block and the trailing `isUnconfigured` export. Example showing two content pages interleaved with a section:

```typescript
import type { OrgAppManifest } from "@/types/orgAppManifest";

export const orgAppManifest: OrgAppManifest = {
    workspaceId: "<envelope.folderObjectId>",
    orgAppId:    "<envelope.objectId>",
    tenantId:    "<$tenantId from org-app-fetch>",
    displayName: "<envelope.displayName>",
    description: "<envelope.description ?? '' >",
    logo:        "<payload.settings.logo ?? undefined>",
    nav: [
        {
            kind:        "contentPage",
            elementId:   "...",
            displayName: "Welcome",
            title:       "Welcome",
            body:        "...markdown...",
            showTheme:   true,
        },
        {
            kind:        "section",
            elementId:   "...",
            displayName: "Group A",
            items: [
                { kind: "report",     elementId: "...", itemId: "...", displayName: "..." },
                { kind: "rdlreport",  elementId: "...", itemId: "...", displayName: "..." },
                { kind: "linkEmbed",  elementId: "...", url: "https://...", displayName: "..." },
                { kind: "linkNewtab", elementId: "...", url: "https://...", displayName: "..." },
            ],
        },
        {
            kind:        "contentPage",
            elementId:   "...",
            displayName: "Reference",
            title:       "Reference",
            body:        "...markdown...",
            showTheme:   false,
        },
    ],
    theme: {
        background:         "<payload.settings.theme.background>",
        foreground:         "<payload.settings.theme.foreground>",
        backgroundHover:    "<payload.settings.theme.backgroundHover>",
        backgroundSelected: "<payload.settings.theme.backgroundSelected>",
        backgroundPressed:  "<payload.settings.theme.backgroundPressed>",
    },
};

export const isUnconfigured = (m: OrgAppManifest) => m.orgAppId === "";
```

## After writing

Hand off `theme` to the **org-app-theming** skill — it patches `src/global.css` so the Tailwind `--color-app-*` tokens resolve to the Org App's brand colors.

## Edge cases

| Situation | What to do |
|---|---|
| `payload.settings.theme` missing | Leave the defaults already in the file. |
| `payload.settings.logo` missing | Omit the `logo` field (the Topbar falls back to its Sparkles icon). |
| `payload.elements` empty | Write `nav: []`. The app will land on the auto-generated `/overview` page, which will render only the app header — warn the user. |
| All elements drop out after filtering | Same as above. |
| Element has no `displayName` | Fall back to the artifact type label plus the last 4 chars of `elementId` / `itemId`. For content pages, fall back to `header.title` if root `displayName` is missing. |
| Duplicate `elementId` values | Should never happen; if it does, keep the first and warn. |
| Multiple top-level `overview` elements | All supported — emit one `contentPage` entry per element, in source order. Each is reachable at `/page/:elementId`. |
| `linkEmbed` URL points at a different host | Pass it verbatim. Authentication against the embedded host is the user's responsibility (matches the portal). |
