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

```powershell
$cluster = (curl.exe -s -H "Authorization: Bearer $token" `
  "https://api.powerbi.com/powerbi/globalservice/v201606/clusterdetails" | ConvertFrom-Json).clusterUrl
```

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
| `404 Not Found` | Wrong cluster, wrong tenant, or ID is not an Org App | Confirm tenant via `az account show`; verify the ID in `app.powerbi.com` URL |
| `clusterUrl` is null | Token was acquired for the wrong resource | Re-acquire with the exact resource above |
