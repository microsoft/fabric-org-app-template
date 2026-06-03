---
name: org-app-parsing
description: Parse a Power BI Org App envelope returned by the org-app-fetch skill into the OrgAppManifest shape this template consumes. Use after org-app-fetch to extract the workspace ID, reports list, and theme, then write src/config/orgAppManifest.ts.
---

# org-app-parsing

## When to use this skill

Immediately after **org-app-fetch** succeeds — you have an `$envelope` object and `$tenantId`, and need to write `src/config/orgAppManifest.ts`.

## Envelope shape (input)

The relevant fields from the artifact envelope:

```jsonc
{
  "objectId": "1b663c51-...",       // becomes manifest.orgAppId
  "artifactType": "OrgApp",
  "displayName": "Sales Performance & Growth Analytics",
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

`$payload` then has shape:

```jsonc
{
  "settings": {
    "theme": {
      "background": "#70c3de",
      "foreground": "#242424",
      "backgroundHover": "#8dcfe5",
      "backgroundSelected": "#a9dbeb",
      "backgroundPressed": "#c6e7f2"
    }
  },
  "elements": [
    { "elementType": "item", "elementId": "...", "itemType": "report",  "itemId": "...", "displayName": "Store Sales Report" },
    { "elementType": "item", "elementId": "...", "itemType": "dataset", "itemId": "...", "displayName": "..." }
  ]
}
```

## Filter rules

| What | Rule |
|---|---|
| **Include in sidebar** | `elementType === "item" && itemType === "report"` |
| **Exclude from sidebar** | Datasets, dashboards, folders, anything else |

Datasets are *consumed* by reports but never user-facing in nav. This is by design — confirmed with the user at scaffold time.

## Output: `src/config/orgAppManifest.ts`

Overwrite the file with the populated manifest. Preserve the file's header comment block and the trailing `isUnconfigured` export.

```typescript
import type { OrgAppManifest } from "@/types/orgAppManifest";

export const orgAppManifest: OrgAppManifest = {
    workspaceId: "<envelope.folderObjectId>",
    orgAppId: "<envelope.objectId>",
    tenantId: "<$tenantId from org-app-fetch>",
    displayName: "<envelope.displayName>",
    description: "<envelope.description ?? '' >",
    reports: [
        { elementId: "...", itemId: "...", displayName: "Store Sales Report" },
        // ...one entry per report from the filtered elements list
    ],
    theme: {
        background: "<payload.settings.theme.background>",
        foreground: "<payload.settings.theme.foreground>",
        backgroundHover: "<payload.settings.theme.backgroundHover>",
        backgroundSelected: "<payload.settings.theme.backgroundSelected>",
        backgroundPressed: "<payload.settings.theme.backgroundPressed>",
    },
};

export const isUnconfigured = (m: OrgAppManifest) => m.orgAppId === "";
```

## After writing

Hand off `theme` to the **org-app-theming** skill — it patches `src/global.css` so the Tailwind `--color-app-*` tokens resolve to the Org App's brand colors.

## Edge cases

| Situation | What to do |
|---|---|
| `payload.settings.theme` missing | Leave the default values in `theme` already in the file. The Org App had no custom theme. |
| `payload.elements` empty or all datasets | Write `reports: []`. The app will render the "no reports" empty state. Warn the user. |
| Report has no `displayName` | Fall back to `"Report"` plus the last 4 chars of `itemId`. |
| Duplicate `elementId` values | Should never happen, but de-dupe by `elementId` keeping the first. |
