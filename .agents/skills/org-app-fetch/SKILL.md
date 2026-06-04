---
name: org-app-fetch
description: Fetch a Power BI Org App (preview) artifact envelope from the internal Power BI cluster. Use when the user provides an Org App ID and wants to migrate it into this template. Acquires an Azure CLI token, discovers the tenant's home cluster, and pulls the raw JSON envelope so org-app-parsing can extract the manifest.
---

# org-app-fetch

## When to use this skill

When the user wants to migrate a Power BI Org App into this template. They will provide an **Org App ID** (a GUID like `1b663c51-10f8-4fdf-8863-d24e49622988`).

## Why this exists (constraints)

The public Fabric REST `/items` endpoint does **not** expose `OrgApp` as a recognized `ItemType` (Org Apps are still in preview). The public Power BI Apps REST (`/v1.0/myorg/apps/{id}`) returns 404 for V3 Org App IDs because V3 is a different artifact model.

The only viable endpoint is the **internal** one the Power BI portal calls at runtime:

```
GET {clusterUrl}/metadata/artifacts/{orgAppId}
```

This requires:

1. A bearer token scoped to `https://analysis.windows.net/powerbi/api`
2. The tenant's home `clusterUrl` (different per tenant + environment)

## Step-by-step workflow

### 1. Get a token

Ask the user to confirm they are signed in to the **correct tenant** with Azure CLI:

```powershell
az account show --query "{user: user.name, tenantId: tenantId}"
```

Then acquire the token:

```powershell
$token = (az account get-access-token --resource https://analysis.windows.net/powerbi/api --query accessToken -o tsv)
```

> ⚠️ The Org App must be in **the same tenant** as the signed-in user. Cross-tenant migration is not supported by this skill.

### 2. Capture the tenant ID

```powershell
$tenantId = (az account show --query tenantId -o tsv)
```

Save this — it goes into the manifest's `tenantId` field for the secure embed URL.

### 3. Discover the cluster URL

The global-service host **must match the Fabric environment the user is targeting**, otherwise the cluster lookup succeeds against the wrong ring and the next call returns `404 PowerBIEntityNotFound`.

Read `RAYFIN_FABRIC_PORTAL_URL` from the user's environment and map it to the matching `powerbi.com` host:

| `RAYFIN_FABRIC_PORTAL_URL` (or `VITE_FABRIC_PORTAL_URL` in `.env.local`) | Global service URL |
|---|---|
| `https://app.fabric.microsoft.com/` _(default / prod)_ | `https://api.powerbi.com/powerbi/globalservice/v201606/clusterdetails` |
| `https://daily.fabric.microsoft.com/` | `https://daily.powerbi.com/powerbi/globalservice/v201606/clusterdetails` |
| `https://dxt.fabric.microsoft.com/` | `https://dxt.powerbi.com/powerbi/globalservice/v201606/clusterdetails` |
| `https://msit.fabric.microsoft.com/` | `https://msit.powerbi.com/powerbi/globalservice/v201606/clusterdetails` |

The rule: take the first hostname label of the Fabric portal URL (`app`/`daily`/`dxt`/`msit`), use it as the `powerbi.com` subdomain (with `app` → `api`).

```powershell
$portal = $env:RAYFIN_FABRIC_PORTAL_URL
if (-not $portal) { $portal = "https://app.fabric.microsoft.com/" }
$ring = ([System.Uri]$portal).Host.Split(".")[0].ToLower()
$gsHost = if ($ring -eq "app") { "api.powerbi.com" } else { "$ring.powerbi.com" }

# Capture response headers (-D -) into stdout; discard body (-o $null).
# Non-prod rings (dxt, daily) return the portal SPA HTML for GETs on this
# endpoint, but the canonical cluster URL is reliably set as a cookie:
#     Set-Cookie: ClusterUri=<tenantId>=<clusterUrl>; ...
$headers = curl.exe -s -D - -o $null -H "Authorization: Bearer $token" `
    "https://$gsHost/powerbi/globalservice/v201606/clusterdetails"

$match = ($headers | Select-String -Pattern 'ClusterUri=[^=]+=([^;]+)').Matches
if (-not $match) {
    throw "Cluster discovery failed: no ClusterUri cookie in response from https://$gsHost. Check that `$token is valid and `$gsHost matches the Fabric ring."
}
$cluster = $match[0].Groups[1].Value.TrimEnd('/')
```

> The same mapping is implemented in code at `src/lib/fabricUrls.ts` (`getPowerBIGlobalServiceOrigin`) and consumed by `src/lib/cluster.ts`. Keep them in sync.

### 4. Fetch the Org App envelope

```powershell
$envelope = curl.exe -s -H "Authorization: Bearer $token" "$cluster/metadata/artifacts/$orgAppId" | ConvertFrom-Json
```

### 5. Sanity-check the response

Before passing to `org-app-parsing`, confirm:

| Field | Expected |
|---|---|
| `artifactType` | `"OrgApp"` |
| `payloadContentType` | `"InlineJson"` |
| `workloadPayload` | non-empty JSON-encoded string |
| `folderObjectId` | non-empty GUID (this is the workspace ID) |

If `artifactType !== "OrgApp"`, abort — the ID belongs to a different artifact type.

## What to pass to the next skill

Hand off the parsed `$envelope` object plus `$tenantId` to **org-app-parsing**.

## Common errors

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Token expired or wrong resource | Re-run step 1; verify `--resource` is exactly `https://analysis.windows.net/powerbi/api` |
| `403 Forbidden` | User lacks access to the Org App | Ask the user to confirm they are a viewer of the Org App in `app.powerbi.com` |
| `404 Not Found` | Wrong cluster (ring mismatch), wrong tenant, or ID is not an Org App | First, re-check `RAYFIN_FABRIC_PORTAL_URL` and confirm the global-service URL in step 3 used the matching ring (`daily.powerbi.com` for `daily.fabric.microsoft.com`, etc.). Then confirm tenant via `az account show`, then verify the ID by opening the Org App in the matching portal (e.g. `https://daily.fabric.microsoft.com/groups/me/apps/<id>`). |
| `clusterUrl` is null | Token was acquired for the wrong resource | Re-acquire with the exact resource above |
| Cluster discovery threw "no ClusterUri cookie" | Response body is HTML (portal SPA) **and** no `Set-Cookie: ClusterUri=` header was returned | Expected on non-prod rings — the response body is always HTML there; the cluster URL must come from the cookie. If the cookie is also missing, the token is invalid or `$gsHost` doesn't match the ring. |
| GET returns HTML instead of JSON | Expected on `dxt` / `daily` portal hosts | Don't parse the body — parse the `Set-Cookie: ClusterUri=<tenant>=<url>` header instead (this is what step 3 does). |
