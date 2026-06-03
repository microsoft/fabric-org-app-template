---
name: app-validation
description: Validate that a migrated Org App template builds, type-checks, and runs locally before declaring migration complete. Use as the last step after org-app-fetch / org-app-parsing / org-app-theming have updated the codebase.
---

# app-validation

## When to use this skill

Run after every migration as the final acceptance gate. Catches:

- Manifest values that broke TypeScript types
- Theme hex strings that broke CSS parsing
- Missing report IDs
- Auth env vars not set
- Embed URL mismatches

## Required checks (run in order)

### 1. Type-check

```powershell
pnpm tsc --noEmit
```

Must exit 0. Common failures:

| Error | Cause | Fix |
|---|---|---|
| `Type 'string' is not assignable to type 'OrgAppReport[]'` | `reports` field is missing or malformed in `src/config/orgAppManifest.ts` | Re-run **org-app-parsing** |
| `Property 'tenantId' is missing` | Old manifest written before `tenantId` was added | Add `tenantId` to the manifest |

### 2. Build

```powershell
pnpm build
```

Must exit 0 and produce `dist/`.

### 3. Lint

```powershell
pnpm lint
```

Should be clean. Non-blocking if only the org-app-* skills added unused imports — fix manually.

### 4. Dev server runs

```powershell
pnpm dev
```

In another terminal:

```powershell
curl.exe -s http://localhost:5173 | Select-String "<div id=`"root`""
```

Must match. Stop the dev server when done.

### 5. Manifest sanity

Read `src/config/orgAppManifest.ts` and confirm:

- [ ] `workspaceId` is a non-empty GUID
- [ ] `orgAppId` is a non-empty GUID
- [ ] `tenantId` is a non-empty GUID
- [ ] `displayName` is non-empty
- [ ] `reports.length > 0` (or warn user the Org App had no reports)
- [ ] Every `reports[i].itemId` is a GUID
- [ ] `theme.background` starts with `#` and is 7 chars

### 6. Theme tokens patched

`Select-String -Path src/global.css -Pattern "--color-app-background:"` must show the value from the manifest, not the default Fabric blue (`#0f6cbd`) unless the source Org App genuinely had no theme.

### 7. End-to-end (optional, recommended)

Use the **playwright-cli** skill to:

1. Open `http://localhost:5173`
2. Sign in via Fabric SSO
3. Confirm sidebar shows all reports
4. Click one report → confirm iframe loads with no console errors

## What this skill does NOT validate

- Whether the user actually has access to the workspace / report (caught at iframe render time)
- Whether the Power BI report itself works (caller's responsibility)
- Whether `npx rayfin up` populated `.env.local` (caught at runtime by `getRayfinClient`)

## Sign-off

When all checks pass, tell the user:

> ✅ Migration validated. Run `pnpm dev` and visit http://localhost:5173 to use your Org App.
