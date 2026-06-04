# fabric-org-app-template

A Rayfin template for migrating a **Power BI Org App (preview)** into a customizable Fabric app.

Start with your Org App ID, run the migration agent, and you'll have a standalone app with the same reports, the same theme, and the same navigation — but the source code is yours to extend.

## What it does

- Reads your Org App's definition via the internal Power BI metadata API
- Generates a `OrgAppManifest` (workspace ID, reports, theme)
- Renders a sidebar + iframe-embedded reports using the **secure embed** flow (no embed token, no service principal required)
- Themes the chrome with the brand colors from your Org App
- Signs the user in via **Fabric SSO** through Rayfin

## Prerequisites

- **Node.js 22+** and **pnpm**
- **Azure CLI** (`az --version`) — for the migration agent to acquire a Power BI token
- **GitHub Copilot CLI** (`copilot --version`) — runs the migration agent
- A **Power BI Org App** in the same tenant, and **viewer access** to it

## Quick start

```powershell
# 1. Use this template (rayfin will scaffold a new repo for you)
rayfin init -t https://github.com/microsoft/fabric-org-app-template my-org-app
cd my-org-app

# 2. Install dependencies
pnpm install

# 3. Connect to a Rayfin workspace (populates .env.local with API URL + key).
#    Always pass --workspace-id to skip the interactive workspace search
#    (which often fails when many workspaces match). Use the GUID of the
#    workspace that hosts your Org App.
npx rayfin up --workspace-id <WORKSPACE_GUID>

# 4. Sign in to Azure CLI in the tenant that owns the Org App
az login --tenant <your-tenant-id>

# 5. Run the migration agent
copilot
```

Then tell the agent:

> Migrate this Org App. The Org App ID is `<paste-your-guid-here>`.

The agent will:

1. Use the **org-app-fetch** skill to pull the Org App envelope
2. Use **org-app-parsing** to extract reports + theme into `src/config/orgAppManifest.ts`
3. Use **org-app-theming** to patch the Org App brand colors into `src/global.css`
4. Use **app-validation** to type-check, build, and confirm everything works

Then:

```powershell
pnpm dev
```

Open http://localhost:5173 — sign in, and your Org App is live.

## Finding your Org App ID

In the Power BI portal, open the Org App and copy the GUID from the URL:

```
https://app.powerbi.com/groups/me/apps/<this-is-your-org-app-id>/...
```

## Extending after migration

The migration generates a static manifest. From there it's just a React app — add custom pages, swap reports, add filters, integrate other data sources. The Sidebar/ReportEmbed/UnconfiguredAppPreview components in `src/components/` are intentionally minimal so you can build on them.

## Architecture

| Layer | Files |
|---|---|
| **Manifest** | `src/types/orgAppManifest.ts`, `src/config/orgAppManifest.ts` |
| **Data layer** | `src/lib/cluster.ts`, `src/lib/orgAppClient.ts` |
| **Auth** | `src/services/rayfin-auth.service.ts`, `src/hooks/use-auth.tsx`, `src/components/auth-gate.component.tsx` |
| **UI shell** | `src/App.tsx`, `src/components/Sidebar.tsx`, `src/components/ReportEmbed.tsx`, `src/components/UnconfiguredAppPreview.tsx` |
| **Theming** | `src/global.css` (Fabric tokens + Org App `--color-app-*` tokens) |
| **Migration agent** | `.agents/skills/org-app-*`, `AGENTS.md` |

## Scripts

| Script | Use |
|---|---|
| `pnpm dev` | Vite dev server on `http://localhost:5173` |
| `pnpm build` | Production build into `dist/` |
| `pnpm tsc --noEmit` | Type-check only |
| `pnpm lint` | ESLint |

## Limitations

- Only the **secure embed** flow is wired (`autoAuth=true`). To use embed tokens, replace `ReportEmbed.tsx` with `powerbi-client`.
- Datasets, dashboards, and folders inside the Org App are **not** rendered in the sidebar — reports only. Edit `src/lib/orgAppClient.ts` if you need them.
- Cross-tenant migration is not supported.

## Reporting issues

File issues at https://github.com/microsoft/fabric-org-app-template/issues.

## License

MIT — see [LICENSE](./LICENSE).
