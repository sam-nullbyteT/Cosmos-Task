# Automatic Version Increment Rule

Every time code changes are made to this project and pushed to GitHub:
1. Increment the application version number by 1 (Current: `V 1.0.2`, Next: `V 1.0.3`).
2. Update the version in:
   - `config.js` (`version`)
   - `index.html` (header badge `#app-version-badge`)
   - `package.json` (`version`)
   - `www/` build files (via `npm run copy:www`)
3. Commit and push the changes together.
