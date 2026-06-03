# AGENTS.md

Instructions for the **migration agent** that turns this template into a working app for the user's Power BI Org App.

This file is auto-loaded by GitHub Copilot CLI (and by other agentic tools that read `AGENTS.md`).

---

## Primary task

Migrate a Power BI Org App (preview) into this template. Inputs from the user:

- **Org App ID** — a GUID like `1b663c51-10f8-4fdf-8863-d24e49622988`

Outputs:

- `src/config/orgAppManifest.ts` populated with workspace ID, reports, tenant ID, theme
- `src/global.css` `@theme` block patched with Org App brand colors
- All validation gates passing (`pnpm tsc --noEmit`, `pnpm build`)

---

## Workflow

### Step 1 — Confirm prerequisites

Before doing anything, confirm with the user:

1. They have **viewer access** to the Org App
2. They are signed in to **Azure CLI** in the **same tenant** as the Org App
   - Run: `az account show --query "{user: user.name, tenantId: tenantId}"`
3. They have provided the **Org App ID** (GUID)

If any are missing, ask for them. Do not proceed until all three are confirmed.

### Step 2 — Fetch the Org App envelope

Load and follow the **org-app-fetch** skill. It will produce:

- `$envelope` — the parsed JSON response from `metadata/artifacts/{orgAppId}`
- `$tenantId` — from `az account show`

### Step 3 — Parse into the manifest

Load and follow the **org-app-parsing** skill. It will:

- Two-stage parse `$envelope.workloadPayload`
- Filter `elements` for reports only
- Write `src/config/orgAppManifest.ts`

### Step 4 — Patch the theme

Load and follow the **org-app-theming** skill. It will:

- Update the five `--color-app-*` tokens in `src/global.css`'s `@theme` block

### Step 5 — Validate

Load and follow the **app-validation** skill. It runs:

- `pnpm tsc --noEmit`
- `pnpm build`
- Manifest sanity checks
- Theme tokens patched check

All must pass before declaring success.

### Step 6 — Tell the user

Once validation passes:

> ✅ Done. Your Org App is migrated.
>
> Next steps:
> 1. Run `pnpm dev`
> 2. Open http://localhost:5173
> 3. Sign in with your work account
> 4. Your reports should appear in the sidebar.

---

## Optional follow-ups

If the user asks for UI polish, load the **app-design** skill.

If the user asks to verify the migration end-to-end in a browser, load the **playwright-cli** skill.

If a report fails to load, load the **powerbi-secure-embed** skill for the debugging checklist.

---

## Skills available

| Skill | Path | Purpose |
|---|---|---|
| org-app-fetch | `.agents/skills/org-app-fetch/SKILL.md` | Pull Org App envelope from internal Power BI API |
| org-app-parsing | `.agents/skills/org-app-parsing/SKILL.md` | Turn envelope into manifest |
| org-app-theming | `.agents/skills/org-app-theming/SKILL.md` | Patch global.css with Org App colors |
| powerbi-secure-embed | `.agents/skills/powerbi-secure-embed/SKILL.md` | Reference for the embed iframe |
| app-design | `.agents/skills/app-design/SKILL.md` | Fabric design tokens / Segoe UI conventions |
| app-validation | `.agents/skills/app-validation/SKILL.md` | Final acceptance gates |
| playwright-cli | `.agents/skills/playwright-cli/SKILL.md` | Browser automation for E2E validation |

---

## Hard constraints

- **Tenant boundary.** Cross-tenant migration is not supported. The user's `az login` tenant must match the Org App's tenant.
- **Reports only.** Datasets, dashboards, folders, and other element types are not added to the sidebar. (User confirmed this at template design time.)
- **Static manifest.** The manifest is written at migration time and committed to source control. No runtime fetch of the Org App definition.
- **Secure embed only.** This template uses `autoAuth=true` iframe embed — no embed token, no service principal. If the user needs embed tokens, that is a separate refactor.

---

## Failure modes

| Failure | Action |
|---|---|
| `az` not signed in | Ask the user to run `az login --tenant <tenant-id>`. Do not proceed. |
| `401`/`403` from metadata API | Verify token resource is `https://analysis.windows.net/powerbi/api` and the user has viewer access. |
| `404` from metadata API | Re-check the Org App ID with the user. Confirm the tenant matches. |
| `artifactType !== "OrgApp"` | The ID is for a different artifact type. Ask the user to verify the ID is from the Org App URL in the Power BI portal. |
| `pnpm tsc --noEmit` fails after manifest write | Re-run org-app-parsing — the manifest shape drifted from `OrgAppManifest`. Do not hand-fix; regenerate. |
