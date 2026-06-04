# fabric-org-app-template

A Rayfin template for migrating a **Power BI Org App (preview)** into a customizable Fabric app.

Start with your Org App ID, run the migration agent, and you'll have a standalone app with the same reports, the same theme, and the same navigation — but the source code is yours to extend.

## What it does

- Reads your Org App's definition via the internal Power BI metadata API
- Generates a static `OrgAppManifest` (workspace ID, reports, theme) — no runtime fetches
- Renders a sidebar + iframe-embedded reports using the **secure embed** flow (no embed token, no service principal required)
- Themes the chrome with the brand colors from your Org App, with a built-in switcher for Power BI themes
- Signs the user in via **Fabric SSO** through Rayfin

## Prerequisites

- **Node.js 22+** and **pnpm**
- **Azure CLI** (`az --version`) — for the migration agent to acquire a Power BI token
- **GitHub Copilot CLI** (`copilot --version`) — runs the migration agent
- A **Power BI Org App** in your tenant, and **viewer access** to it

## Scaffold + migrate

```powershell
# 1. Scaffold from this template (also installs dependencies)
rayfin init -t https://github.com/microsoft/fabric-org-app-template my-org-app
cd my-org-app

# 2. (Optional) Install dependencies — only if you skipped install during `rayfin init`
pnpm install

# 3. Sign in to Azure CLI in the tenant that owns the Org App
az login --tenant <your-tenant-id>

# 4. Connect to the Fabric workspace that hosts the Org App
npx rayfin up --workspace-id <WORKSPACE_GUID>

# 5. Run the migration agent
copilot
```

Then tell the agent:

> Migrate this Org App. The Org App ID is `<paste-your-guid-here>`.

> **Why `rayfin up` before `copilot`?** It populates `.env.local` with `VITE_FABRIC_API_URL`, `VITE_FABRIC_PORTAL_URL`, and `VITE_RAYFIN_API_KEY`. The migration agent reads these and will refuse to start without them. Always pass `--workspace-id` explicitly — the interactive workspace search often fails when many workspaces match.

The agent pulls the Org App definition, writes `src/config/orgAppManifest.ts`, patches `src/global.css` with your brand colors, and type-checks the build.

### Finding your Org App ID

In the Fabric portal, open the Org App and copy the GUID from the URL:

```
https://app.fabric.microsoft.com/groups/<workspace-id>/orgapps/<this-is-your-org-app-id>/...
```

### Deploy to Fabric

Your workspace is already wired from step 4. Re-run `npx rayfin up` to build and publish the app to that workspace so end users can open it from the portal:

```powershell
npx rayfin up --workspace-id <WORKSPACE_GUID>
```

You'll see output like:

```text
✔ Static content deployed (3 files, 360.8 KB)
  🌐 Hosting URL: https://<random>.webapp.<region>.fabricapps.net
  - Portal: https://app.fabric.microsoft.com/groups/<workspace>/appbackends/<item>?ctid=<tenant>
```

Open the **Portal** URL — that's your app, running inside the Fabric portal, accessible to anyone you share it with in that workspace. Re-run `npx rayfin up` whenever you want to redeploy; the same project ID is reused, so users keep the same URL.

> **For local development with hot reload**, run `npx rayfin dev`. It starts Vite on `http://localhost:5173`, reuses the `rayfin/.env` from your earlier `rayfin up`, and refreshes the browser when you edit any file under `src/`. Auth still goes to your live Fabric tenant via Rayfin SSO.

---

## Environment configuration — non-prod rings (daily, dxt)

By default `rayfin up` targets the **prod** Fabric ring (`app.fabric.microsoft.com`). For development against **daily** or **dxt** rings — typically only needed for Microsoft internal scenarios — set these two environment variables **in your terminal session before running any `rayfin` command**:

| Ring | `RAYFIN_FABRIC_API_URL` | `RAYFIN_FABRIC_PORTAL_URL` |
|---|---|---|
| **prod** *(default)* | *(unset)* | *(unset)* |
| **dxt** | `https://dxtapi.fabric.microsoft.com/v1` | `https://dxt.fabric.microsoft.com/` |
| **daily** | `https://dailyapi.fabric.microsoft.com/v1` | `https://daily.fabric.microsoft.com/` |
| **msit** | *(unset — uses prod)* | *(unset — uses prod)* |

> **msit** is Microsoft-internal but runs on the **prod** Fabric ring, so no env overrides are needed.

Example (PowerShell, dxt):

```powershell
$env:RAYFIN_FABRIC_API_URL = "https://dxtapi.fabric.microsoft.com/v1"
$env:RAYFIN_FABRIC_PORTAL_URL = "https://dxt.fabric.microsoft.com/"

npx rayfin up --workspace-id <WORKSPACE_GUID>
# or
npx rayfin dev
```

The same Fabric ring is used for Rayfin deployment **and** for the auth iframe + Org App metadata fetch — don't mix rings (set both variables, or neither).

After `rayfin up` runs, the values flow into `.env.local` as `VITE_FABRIC_PORTAL_URL` etc. and the migration skill picks them up automatically. To target a different ring later, unset / reset the env vars and re-run `rayfin up`.

---

## Project structure

```text
fabric-org-app-template/
├── .agents/skills/             # Migration agent skills: org-app-fetch, org-app-parsing,
│                               #   org-app-theming, app-design, app-validation,
│                               #   powerbi-secure-embed, playwright-cli
├── rayfin/
│   └── rayfin.yml              # Rayfin service config (auth, static hosting)
├── src/
│   ├── components/             # AppShell, AuthGate, Sidebar, Topbar, OverviewPage, ContentPage,
│   │                           #   ReportEmbed, RdlEmbed, EmbedLinkPage, ConfigurationDialog,
│   │                           #   SettingsMenu, ThemeSubmenu, OrgAppThemeProvider,
│   │                           #   UnconfiguredAppPreview
│   ├── config/
│   │   ├── orgAppManifest.ts   # ← Populated by the migration agent
│   │   └── themePresets.ts     # Built-in Power BI themes (Default, Executive, …, Sunset)
│   ├── hooks/                  # use-auth, use-org-app-theme, use-theme, use-sidebar-collapsed,
│   │                           #   auth.context, org-app-theme.context
│   ├── lib/                    # fabricUrls (URL builders), theme (CSS var mapping), rayfin-client, utils
│   ├── services/
│   │   └── rayfin-auth.service.ts
│   ├── types/orgAppManifest.ts
│   ├── App.tsx                 # Router + theme provider
│   ├── ErrorFallback.tsx
│   ├── global.css              # Tailwind v4 @theme tokens (Fabric + Org App)
│   └── main.tsx                # Mounts AuthProvider → AuthGate → App
├── AGENTS.md                   # Auto-loaded by Copilot CLI
├── rayfin-template.yml         # Template metadata consumed by `rayfin init`
├── package.json
└── README.md                   # ← This file
```

## Scripts

| Script | Use |
|---|---|
| `pnpm dev` *(or `npx rayfin dev`)* | Vite dev server on `http://localhost:5173`. The `predev` hook auto-runs `rayfin env --framework vite` to refresh `.env.local`. |
| `pnpm build` | Production build into `dist/`. The `prebuild` hook also refreshes `.env.local`. |
| `pnpm preview` | Serve the built `dist/` locally for a smoke test |
| `npx rayfin up` | Build + deploy to Fabric |
| `pnpm tsc --noEmit` | Type-check only |
| `pnpm lint` | ESLint |

## Extending after migration

The migration generates a static manifest. From there it's just a React app — add custom pages, swap reports, add filters, integrate other data sources. Everything under `src/components/` is intentionally minimal so you can build on top.

In-app affordances already wired:

- **Settings → Theme** — switch between the Org App brand colors and the built-in Power BI themes (persisted per browser)
- **Settings → Configuration** — read-only view of the source Org App and the full manifest JSON
- **Sidebar toggle** (top-left) — collapses the rail to icons-only
- **↗ icons** on every report — open the same report in the Power BI portal in a new tab

## Limitations

- Only the **secure embed** flow is wired (`autoAuth=true`). To use embed tokens, replace `src/components/ReportEmbed.tsx` with `powerbi-client`.
- Datasets, dashboards, and folders inside the Org App are **not** rendered in the sidebar — reports only. Update the `org-app-parsing` skill if you need them.
- Cross-tenant migration is not supported.

## Reporting issues

File issues at https://github.com/microsoft/fabric-org-app-template/issues.

## License

MIT — see [LICENSE](./LICENSE).
