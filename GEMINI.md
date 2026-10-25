# Project Rules & Persistent Memory

## Version Increment Protocol
- Current Version: **V 1.0.3**
- **MANDATORY RULE**: Every time application code is modified and pushed to GitHub:
  1. Increment the patch version number by 1 (e.g., `V 1.0.2` -> `V 1.0.3` -> `V 1.0.4` ...).
  2. Synchronize the version number across:
     - `config.js` (`version: "V 1.0.X"` and `footerText`)
     - `index.html` (header version badge `#app-version-badge` and `#app-version-subtitle`)
     - `app.js` (fallback version in `updateAppVersion`)
     - `package.json` (`"version": "1.0.X"`)
     - `www/` (run `npm run copy:www`)
  3. Run `npm run build` locally and confirm it succeeds BEFORE pushing.
  4. Commit and push to GitHub so the version in the repository always reflects the latest change.

## Vercel Deployment Protocol
- The site is deployed on Vercel from the `main` branch.
- `vercel.json` MUST exist at the repo root with `"outputDirectory": "www"` and `"buildCommand": "npm run build"`.
  - Without it, Vercel defaults to looking for a `public/` folder and the build fails
    ("No Output Directory named 'public' found").
- NEVER delete or rename `vercel.json`, the `www/` output folder, or the `build` script in `package.json`.
- If a new file is loaded by `index.html` (script, stylesheet, asset folder), add it to the `copy:www`
  script in `package.json` so it is included in the deployed `www/` output.
