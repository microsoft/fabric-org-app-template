---
name: powerbi-secure-embed
description: Reference for the Power BI secure embed URL format used by this template. Read when debugging report iframes, when a report fails to load, or when adapting the embed for a non-default scenario.
---

# powerbi-secure-embed

## What this template uses

This template uses **"Embed for your organization" with `autoAuth=true`** — the simplest of the three Power BI embed flows.

```
{FABRIC_PORTAL_ORIGIN}/reportEmbed
    ?reportId={itemId}
    &groupId={workspaceId}
    &autoAuth=true
    &ctid={tenantId}
    &actionBarEnabled=true
    &reportCopilotInEmbed=true
```

The embed origin is read from `VITE_FABRIC_PORTAL_URL` (set by `rayfin up` / `rayfin env` from `RAYFIN_PUBLIC_PORTAL_URL`). **The same Fabric portal host serves the report embed endpoint** — no `fabric.microsoft.com → powerbi.com` host swap is needed.

| Fabric portal | Embed origin used |
|---|---|
| `https://app.fabric.microsoft.com/` | `https://app.fabric.microsoft.com` |

The user's existing Power BI / Fabric session signs them into the iframe automatically. **No embed token, no service principal, no Power BI Embedded capacity required.**

All URL building lives in [`src/lib/fabricUrls.ts`](../../../src/lib/fabricUrls.ts) (`getReportEmbedUrl`, `getOpenAppUrl`, `getOpenReportUrl`) — change embed parameters there, not at call sites.

Reference: [Embed Power BI content with service principal and secrets / "Embed for your organization"](https://learn.microsoft.com/power-bi/collaborate-share/service-embed-secure)

## Parameter source-of-truth

| Param | Source | Note |
|---|---|---|
| `reportId` | `manifest.reports[].itemId` | The Power BI report GUID |
| `groupId` | `manifest.workspaceId` | The workspace that owns the report |
| `autoAuth=true` | hard-coded | Skips the interactive sign-in inside the iframe |
| `ctid` | `manifest.tenantId` | Required for multi-tenant guest users; harmless to include always |
| `actionBarEnabled=true` | hard-coded | Shows the Power BI action bar (Comment, Subscribe, Share) — parity with in-portal |
| `reportCopilotInEmbed=true` | hard-coded | Enables Copilot pane inside the embed (where tenant policy allows) |

## What is *not* this template

This template intentionally does **not** use:

- **Embed for your customers** (app-owns-data) — requires service principal + embed token + Power BI Embedded capacity
- **Embed token flow** — requires backend API call to `/v1.0/myorg/groups/{groupId}/reports/{reportId}/GenerateToken`
- **Power BI Client SDK (`powerbi-client`)** — heavier, gives you JS event hooks but adds bundle weight; the iframe is sufficient for read-only embed

If the user later needs filters, bookmarks, or eventing — switch to `powerbi-client`. For migration parity with the original Org App, the iframe is correct.

## Debugging a non-loading report

| Symptom | Cause | Fix |
|---|---|---|
| Iframe shows "You don't have access" | User is not a viewer of the workspace **or** the underlying report | Verify in the Fabric portal directly (`VITE_FABRIC_PORTAL_URL`) |
| Iframe shows AAD login form | `autoAuth` did not pick up the session | User must visit the Fabric portal once in this browser session (e.g. `https://app.fabric.microsoft.com/`) to seed the cookie |
| Iframe loads then shows "Tenant mismatch" | `ctid` doesn't match the session tenant | Confirm `tenantId` in the manifest matches `az account show --query tenantId` |
| Iframe loads blank, no error | `reportId` belongs to a different `groupId` | Re-run the migration agent to refresh the manifest |
| Mixed content / X-Frame-Options error in console | Self-hosted under a non-HTTPS origin | Use `https://` (or `http://localhost` which Power BI allows) |
| Iframe loads to a 404 or "site doesn't exist" | `VITE_FABRIC_PORTAL_URL` points at the wrong environment | Re-run `rayfin up` against the right env, or set `RAYFIN_PUBLIC_PORTAL_URL` before `pnpm dev` |

## Allowed embed origins

When deploying somewhere other than `localhost:5173`, add the deployed origin to:

1. `rayfin/rayfin.yml` → `auth.fabric.allowedRedirectUris`
2. The Power BI tenant admin's **Embed content in apps** allowed-origins list (if your tenant restricts this — most don't)
