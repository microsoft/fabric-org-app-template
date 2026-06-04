---
name: org-app-parsing
description: Parse a Power BI Org App envelope returned by the org-app-fetch skill into the OrgAppManifest shape this template consumes. Use after org-app-fetch to extract the workspace ID, recursive section/item tree (reports, paginated reports, embedded + new-tab links), overview, logo, and theme, then write src/config/orgAppManifest.ts.
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
    // Top-level elements appear in source order:
    { "elementType": "overview", "elementId": "...", "title": "Welcome",
      "body": "...markdown...", "showTheme": true },

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
      ] }
  ]
}
```

> Real-world note: Reach DRI uses a single level of sections, but the model permits arbitrary nesting and the template renders the tree recursively.

## Mapping table

Apply these rules **in order**, **preserving source order** at every level. Use arrays (not maps) end-to-end.

| Source element | Maps to OrgAppNavItem.kind | Notes |
|---|---|---|
| `elementType: "overview"` (top-level only) | `manifest.overview` (0 or 1 — keep the first if multiple) | Fields: `elementId`, `title`, `body`, `showTheme`. |
| `elementType: "section"` (top-level) | Entry in `manifest.sections[]` | Recurse into `.elements` to build `.items`. |
| `elementType: "section"` (nested inside `.elements`) | `{ kind: "section", elementId, displayName, items }` | Same recursion. |
| `elementType: "item"` + `itemType: "report"` | `{ kind: "report", elementId, itemId, displayName }` | Power BI PBIX report → `/report/:itemId`. |
| `elementType: "item"` + `itemType: "rdlreport"` | `{ kind: "rdlreport", elementId, itemId, displayName }` | Paginated report → `/rdl/:itemId`. |
| `elementType: "link"` + `linkType: "embedded"` | `{ kind: "linkEmbed", elementId, url, displayName }` | Iframe at `/embed/:elementId`. URL passed verbatim. |
| `elementType: "link"` + `linkType: "newtab"` | `{ kind: "linkNewtab", elementId, url, displayName }` | Sidebar `<a target="_blank">`, no in-app route. |
| `elementType: "item"` + `itemType: "KustoDashboard"` | **DROP** | No rendering path in this template. |
| `elementType: "item"` + `itemType: "dataset"` | **DROP** | Datasets are consumed by reports, never user-facing. |
| `elementType: "item"` + any other `itemType` | **DROP** + warn | Unknown artifact type. Tell the user. |

After mapping, **drop sections whose `items` is empty** (e.g. a section that only contained Kusto dashboards). Apply this drop recursively bottom-up.

`settings.logo` (if present) → `manifest.logo` verbatim (it's already a `data:` URL).

`settings.theme` → `manifest.theme`. If `settings.theme` is missing, keep the defaults already in the file.

## Output: `src/config/orgAppManifest.ts`

Overwrite the file with the populated manifest. Preserve the file's header copyright block and the trailing `isUnconfigured` export. Example:

```typescript
import type { OrgAppManifest } from "@/types/orgAppManifest";

export const orgAppManifest: OrgAppManifest = {
    workspaceId: "<envelope.folderObjectId>",
    orgAppId:    "<envelope.objectId>",
    tenantId:    "<$tenantId from org-app-fetch>",
    displayName: "<envelope.displayName>",
    description: "<envelope.description ?? '' >",
    logo:        "<payload.settings.logo ?? undefined>",
    overview: {
        elementId: "...",
        title:     "Welcome",
        body:      "...markdown...",
        showTheme: true,
    },
    sections: [
        {
            elementId:   "...",
            displayName: "Group A",
            items: [
                { kind: "report",     elementId: "...", itemId: "...", displayName: "..." },
                { kind: "rdlreport",  elementId: "...", itemId: "...", displayName: "..." },
                { kind: "linkEmbed",  elementId: "...", url: "https://...", displayName: "..." },
                { kind: "linkNewtab", elementId: "...", url: "https://...", displayName: "..." },
            ],
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
| `payload.elements` empty | Write `sections: []` and omit `overview`. The app will redirect to `/overview` (which renders nothing) — warn the user. |
| All elements drop out after filtering | Same as above. |
| Element has no `displayName` | Fall back to the artifact type label plus the last 4 chars of `elementId` / `itemId`. |
| Duplicate `elementId` values | Should never happen; if it does, keep the first and warn. |
| Multiple top-level `overview` elements | Keep the first, warn. The portal only renders one. |
| `linkEmbed` URL points at a different host | Pass it verbatim. Authentication against the embedded host is the user's responsibility (matches the portal). |
