# Deployment Guide â€” BWGA Ai

This document describes how to deploy the full-stack BWGA Ai application (frontend + backend) to Render using the CI workflow included in `.github/workflows/deploy-render.yml`. It also includes local Docker test steps.

## Overview
- Frontend: Vite-built static site (output `dist`).
- Backend: Express server (source in `server/`) bundled with esbuild to `dist-server`.
- Docker: multi-stage `Dockerfile` builds both artifacts and runs the compiled server.
- CI: GitHub Actions workflows included to build, publish a Docker image to GHCR, and trigger a Render deploy.

## Required GitHub repository secrets
Add these in GitHub â†’ Settings â†’ Secrets & variables â†’ Actions.
- `GHCR_PAT` â€” Personal access token with `write:packages` (if using GHCR). Optional if you use another registry.
- `RENDER_API_KEY` â€” Render API key for your account (service deploy trigger).
- `RENDER_SERVICE_ID` â€” Render service id (numeric id for your service).
- `GEMINI_API_KEY` â€” Server-side Google/GenAI API key.
- `VITE_GEMINI_API_KEY` â€” (Optional) client-exposed key â€” avoid if possible.
- `FRONTEND_URL` â€” production URL (e.g., https://app.example.com).

## Render setup (recommended)
1. Create a new Web Service on Render (select "Docker" or connect the repo). Note the service id (the numeric id shown in the service URL or the Render dashboard; it appears like `srv-xxxxxxxxxx`).
2. In Render service settings, add env vars: `NODE_ENV=production`, `FRONTEND_URL` (e.g. `https://your-service.onrender.com`), `GEMINI_API_KEY` (server-only), and any DB or other API keys required.
3. In GitHub, go to your repo â†’ Settings â†’ Secrets & variables â†’ Actions and add these secrets:
	- `GHCR_PAT` â€” personal access token for GHCR (if using GHCR). Scope: `write:packages`.
	- `RENDER_API_KEY` â€” Render API key with permission to deploy.
	- `RENDER_SERVICE_ID` â€” copy the numeric id for your Render service (without the `srv-` prefix used in some contexts).
	- `GEMINI_API_KEY` â€” your server-side AI API key.
	- `FRONTEND_URL` â€” production URL string.
4. Push to the `main` or `master` branch to trigger the GitHub Actions workflow: it will build assets, build/push a Docker image to GHCR, then call the Render deploy API.

Quick note for non-coders: if you prefer not to create a GHCR token, you can skip the GHCR step and configure Render to build from the repo directly (Render will run the build command `npm install && npm run build && npm run build:server`). In that case add the same env vars in the Render service and enable auto-deploy from the connected branch.

## Netlify alternative (frontend-only)
- Use `netlify.toml` (already present). Deploy `dist` to Netlify; host API separately on Render or another host.

## Local Docker test (quick)
1. Build locally:
```bash
npm ci
npm run build
npm run build:server
```
2. Build Docker image (from repo root):
```bash
docker build -t bw-nexus-ai:local .
```
3. Run container (expose port 3000):
```bash
docker run -d --name bw-test -p 3000:3000 bw-nexus-ai:local
```
4. Check health endpoint:
```bash
curl http://localhost:3000/api/health
```
5. Stop & remove container:
```bash
docker rm -f bw-test
```

Notes:
- If your server needs `GEMINI_API_KEY`, pass it with `-e GEMINI_API_KEY="your_key"` to `docker run` or set it in Render.
- The server will serve static files from `dist` when `NODE_ENV=production`.

## One-click Render deploy (local helper)
If you want to trigger a deploy from your machine once you have a `RENDER_API_KEY` and `RENDER_SERVICE_ID`, use the included helper script `scripts/trigger-render-deploy.sh`:

```bash
# Make executable and run (replace values or export env vars before running)
chmod +x scripts/trigger-render-deploy.sh
RENDER_API_KEY="<your_key>" RENDER_SERVICE_ID="<your_id>" ./scripts/trigger-render-deploy.sh
```

This script simply calls the Render deploy API and is safe to run from your terminal.

## Post-deploy validation
- Visit `https://<your-host>/` and validate UI loads.
- Accept Terms and click "Define Your First Mandate" â€” ensure navigation to the report-generator and that server API calls succeed.
- Check server logs on Render for any runtime errors (missing env vars, auth errors).

## Security & production hardening checklist
- Do not expose sensitive keys in the client. Prefer server-side proxy for AI APIs.
- Add monitoring (Sentry/Datadog) and log retention.
- Configure TLS & custom domain via Render or Cloud DNS.
- Add rate-limiting, request size limits, and IP protections for API routes.

If you want, I can:
- Trigger a local Docker build & run and report the health result, or
- Create a step-by-step Render setup doc with screenshots.

