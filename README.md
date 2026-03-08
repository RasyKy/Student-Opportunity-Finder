# Team Development Guide

## 🛠 Getting Started
1. **Install Dependencies:** From the root, run `npm install`. *Do not run npm install inside sub-folders.*
2. **Start Dev Mode:** Run `npm run dev` from the root to start all apps.
3. **Python Scraper:** If working on the scraper, ensure you have a virtual environment active in `apps/scraper`.

## 📦 Adding Dependencies
- To add a package to a specific app (e.g., `admin-portal`):
  `npm install lodash -w admin-portal`
- To add a tool to the entire repo (e.g., `turbo`):
  `npm install turbo -D`

## 🏗 Adding Shared Code
If you want to share a component or utility:
1. Create a new folder in `packages/`.
2. Give it a name in its `package.json` (e.g., `"@repo/ui"`).
3. Add it to an app's `package.json`: `"@repo/ui": "*"`
4. Run `npm install` at the root to link them.