# Frontend Deployment (Azure Static Web Apps)

This app deploys via GitHub Actions to Azure Static Web Apps. The workflow file is `.github/workflows/azure-static-web-apps.yml`.

## Prerequisites
- Azure Static Web App resource already created.
- GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` containing the SWA deployment token.
- Backend API URL available (used for build-time env `VITE_API_BASE_URL`).

## What the workflow does
1) Triggers on push to `master` (and PRs for preview environments).
2) Uses `Azure/static-web-apps-deploy@v1` to build the Vite app and upload the `dist` output.
3) Injects `VITE_API_BASE_URL` into the build (currently `https://dice-cricket-api-ag.azurewebsites.net`).

## Routing / SPA fallback
Static Web Apps needs a fallback to serve the SPA on deep links. We added `staticwebapp.config.json` to rewrite unknown routes to `index.html`, so routes like `/history/<id>` work after refresh.

## How to redeploy
- Push to `master` in `Adarsh1999/Dice-Cricket`, or
- Manually run the workflow from the GitHub Actions tab.

## Updating configuration
- Change API base URL: edit `VITE_API_BASE_URL` in the workflow env block and push.
- Add more routes/assets to bypass the SPA fallback: update `staticwebapp.config.json`.

## Troubleshooting
- 404 on deep link: ensure `staticwebapp.config.json` is present and deployed.
- Bad API calls: confirm `VITE_API_BASE_URL` points to the live backend and CORS on the backend includes the Static Web App origin.
