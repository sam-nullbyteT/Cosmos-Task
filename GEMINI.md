# Project Rules & Persistent Memory

## Version Increment Protocol
- Current Version: **V 1.0.2**
- **MANDATORY RULE**: Every time application code is modified and pushed to GitHub:
  1. Increment the patch version number by 1 (e.g., `V 1.0.2` -> `V 1.0.3` -> `V 1.0.4` ...).
  2. Synchronize the version number across:
     - `config.js` (`version: "V 1.0.X"`)
     - `index.html` (header version badge `#app-version-badge`)
     - `package.json` (`"version": "1.0.X"`)
     - `www/` (run `npm run copy:www`)
  3. Commit and push to GitHub so the version in the repository always reflects the latest change.
