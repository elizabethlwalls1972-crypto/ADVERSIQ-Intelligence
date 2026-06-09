═══════════════════════════════════════════════════════════════════════════════
                    CLOUDFLARE ↔ GITHUB SETUP GUIDE
═══════════════════════════════════════════════════════════════════════════════

Current Status:
  ❌ Project is MANUALLY deployed (no GitHub connection)
  ❌ Cloudflare cannot auto-deploy on code changes
  ❌ No continuous deployment pipeline

Goal:
  ✅ Connect Cloudflare to GitHub repository
  ✅ Enable automatic deployments on every push
  ✅ Give Cloudflare full read access to your code

═══════════════════════════════════════════════════════════════════════════════
                           AUTOMATIC SETUP STEPS
═══════════════════════════════════════════════════════════════════════════════

Your GitHub repo: https://github.com/elizabethlwalls1972-crypto/ADVERSIQ-Intelligence

Option 1: DELETE AND RECONNECT (Recommended)
─────────────────────────────────────────────

We'll delete the manual project and create a new one linked to GitHub.

Run this in PowerShell:

  npx wrangler pages project delete adversiq-intelligence

  (Answer "yes" when prompted to confirm)

Then we'll create a new one via the dashboard.


Option 2: MANUAL GITHUB CONNECTION (Via Dashboard)
───────────────────────────────────────────────

Go to: https://dash.cloudflare.com/pages

1. Click "Create application"
2. Choose "Connect to Git"
3. Select GitHub
4. Authorize Cloudflare to access your GitHub
5. Select repository: ADVERSIQ-Intelligence
6. Configure build settings:
   - Framework: None
   - Build command: npm run build
   - Build output directory: dist
7. Click "Save and deploy"

Cloudflare will then:
  • Clone your GitHub repo
  • Install dependencies (npm install)
  • Run your build (npm run build)
  • Deploy the dist/ folder
  • Watch for changes and auto-deploy

═══════════════════════════════════════════════════════════════════════════════
                         WHAT HAPPENS AFTER SETUP
═══════════════════════════════════════════════════════════════════════════════

Every time you push code to GitHub:

  git add .
  git commit -m "Your changes"
  git push origin main

Cloudflare will AUTOMATICALLY:
  1. Detect the new push
  2. Clone the latest code
  3. Run: npm run build
  4. Deploy the new build

Your website updates instantly with ZERO manual action!

═══════════════════════════════════════════════════════════════════════════════
                              API ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Your API lives in: functions/api/[[path]].ts

Cloudflare deploys this automatically, so all 25 endpoints will be live:

  GET  /api/health          → Check all 9 agents
  POST /api/chat            → Send message to SUSAN
  GET  /api/analytics       → System statistics
  POST /api/document        → Generate documents
  GET  /api/memory          → Query persistent memory
  ... and 20 more endpoints

═══════════════════════════════════════════════════════════════════════════════

QUICK START: Delete current project and reconnect to GitHub?

Answer below or run:  npx wrangler pages project delete adversiq-intelligence

═══════════════════════════════════════════════════════════════════════════════
