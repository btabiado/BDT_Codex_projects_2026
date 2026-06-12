# Shark Tank Intelligence Platform

This is a dependency-free MVP built from `Shark_Tank_Intelligence_Platform_Developer_Build_Spec_v3.docx` and wired to `shark_tank_MASTER_CLEAN.xlsx`.

## What is included

- Shark Command Center home page
- Global KPI strip
- Shark KPI cards with Shark Alpha Score
- Shark Alpha leaderboard
- Company Explorer with filters and detail drawer
- Data Quality Center
- Hall of Fame, Biggest Misses, and Industry Analytics views
- Workbook import script for regenerating the 1,408-row data extract
- Reusable normalization, metrics, Alpha Score, formatter, and quality-check modules
- Node unit tests for normalization, metrics, and quality checks
- Assumptions documented in `docs/assumptions.md`

## Run locally

From this folder:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Test

```bash
/Users/bryandtabiadon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test src/tests/*.test.js
```

## Deploy to GitHub Pages

This folder is ready to deploy as a static GitHub Pages site. Push this folder as the repo root:

```bash
cd /Users/bryandtabiadon/Documents/Codex/2026-06-09/files-mentioned-by-the-user-shark/outputs/shark-tank-intelligence-platform
git init
git add .
git commit -m "Deploy Shark Tank dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

In GitHub, open the repo's **Settings > Pages**, set **Build and deployment** to **Deploy from a branch**, then select:

- Branch: `main`
- Folder: `/ (root)`

After GitHub publishes the site, the public URL will be:

```text
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## Data refresh path

The dashboard imports `src/data/rawMasterData.js`, generated from the workbook. To refresh it:

```bash
/Users/bryandtabiadon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/import_workbook.py "/Users/bryandtabiadon/Downloads/Claude Handoff/shark_tank_MASTER_CLEAN.xlsx"
```

Keep metric logic unchanged. The UI reads normalized records from `normalizeRows`.
