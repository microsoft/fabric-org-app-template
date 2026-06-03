---
name: playwright-cli
description: Drive a browser via `playwright-cli` to validate the migrated Org App end-to-end — sign in with Fabric SSO, navigate between reports, confirm iframes render, capture screenshots for review. Use after a migration to verify reports load.
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(npm:*)
---

# playwright-cli

## When to use this skill

After **org-app-parsing** + **org-app-theming** have run and you've started the dev server, use `playwright-cli` to verify:

1. The user can sign in via Fabric SSO
2. The sidebar shows every report from the manifest
3. Each report iframe loads without errors
4. The theme colors apply correctly

## Essential commands

```bash
# Open a fresh browser session
playwright-cli open http://localhost:5173

# Inspect the current page (refs like e1, e2 used for interactions)
playwright-cli snapshot

# Click an element by ref from the snapshot
playwright-cli click e15

# Type into the focused field
playwright-cli type "your-app-id"

# Press a key
playwright-cli press Enter

# Take a screenshot
playwright-cli screenshot --filename=after-signin.png

# Read the JS console (look for embed errors)
playwright-cli console

# Run a JS evaluator (e.g., grab the iframe count)
playwright-cli eval "document.querySelectorAll('iframe').length"

# Close the browser
playwright-cli close
```

## Targeting elements

Use refs from `snapshot` (`e5`, `e12`, etc.), CSS selectors, or Playwright locators:

```bash
playwright-cli click "getByRole('link', { name: 'Store Sales Report' })"
playwright-cli click "iframe[title='Store Sales Report']"
```

## Validation script for an Org App migration

```bash
playwright-cli open http://localhost:5173
playwright-cli snapshot                                # confirm sign-in UI or sidebar
# (if needed: complete AAD redirect, then snapshot again)
playwright-cli snapshot
playwright-cli screenshot --filename=sidebar.png       # capture sidebar with theme
playwright-cli click "getByRole('link', { name: '<first report name>' })"
playwright-cli eval "document.querySelector('iframe')?.src"  # confirm embed URL
playwright-cli console                                  # confirm no errors
playwright-cli close
```

## Installation

If `playwright-cli` is not on PATH:

```bash
npx --no-install playwright-cli --version  # check local install
npm install -g @playwright/cli@latest      # install globally
```

## Notes

- The first run will trigger an AAD redirect. Use a **persistent profile** (`--persistent`) to skip sign-in on subsequent runs.
- The embed iframe loads `https://app.powerbi.com/reportEmbed?...` — the user must already be a viewer of the workspace.
- Use `playwright-cli network` to watch network activity if reports fail to load.
