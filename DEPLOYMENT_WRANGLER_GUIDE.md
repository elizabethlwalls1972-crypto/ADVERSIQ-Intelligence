# ADVERSIQ UI + AI Chat Deployment Guide

**Problem:** API deployments overwrote your original UI assets.

**Solution:** Use Wrangler to deploy from your local machine—this preserves your HTML/CSS/JS and adds the AI chat route.

---

## What Was Added

✅ **wrangler.toml** — Cloudflare Workers config with AI + KV bindings
✅ **_worker.ts** — Express-compatible Worker entry point with `/api/chat` route
✅ This guide

---

## Step 1: Install/Update Wrangler (One-Time)

```bash
npm install -D wrangler@latest
```

---

## Step 2: Authenticate with Cloudflare

```bash
npx wrangler login
```

This opens a browser to authorize your Cloudflare account.

---

## Step 3: Update Your Account ID

In `wrangler.toml`, find this line:

```toml
# Environment Variables
[env.production]
routes = [
  { pattern = "adversiq.ai/*", zone_id = "your_zone_id" }
]
```

Replace:
- `your_zone_id` with your Cloudflare domain's zone ID (find in Cloudflare dashboard → domain → Overview → Zone ID)
- Update the `pattern` to match your actual domain (or remove if not using a custom domain yet)

---

## Step 4: Deploy to Cloudflare Workers

```bash
npm run deploy
```

Or manually:

```bash
npx wrangler deploy
```

This will:
1. ✅ Build your React frontend (`dist/` folder)
2. ✅ Deploy the Worker code (`_worker.ts`)
3. ✅ Restore your original Susan UI
4. ✅ Enable the `/api/chat` AI route

---

## Step 5: Test the Deployment

**Frontend (UI):**
```
https://adversiq.ai/
```

**Chat API:**
```bash
curl -X POST https://adversiq.ai/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Analyze Vietnam manufacturing sector"}'
```

**Expected response:**
```json
{
  "sessionId": "conv_1234567890",
  "response": "ADVERSIQ analysis of Vietnam...",
  "timestamp": "2026-05-26T..."
}
```

---

## Step 6: Retrieve Chat History

```bash
curl https://adversiq.ai/api/conversation/conv_1234567890
```

---

## Folder Structure After Deploy

```
wrangler.toml              ← Workers config (CREATED)
_worker.ts                 ← Worker entry point (CREATED)
dist/                      ← React frontend build
  index.html              ← Your Susan UI (preserved)
  assets/
    ...
src/
server/                    ← Express backend (still runs locally)
```

---

## Key Features of This Setup

| Feature | What It Does |
|---------|-------------|
| **AI Binding** | Enables Cloudflare's free AI models (`@cf/meta/llama-2-7b-chat-int8`) |
| **KV Namespace** | Stores conversation history for 7 days |
| **Static Asset Serving** | Your Vite build is served automatically |
| **API Routes** | `/api/chat` and `/api/conversation/:sessionId` work out of the box |
| **SPA Routing** | Fallback to `index.html` for React Router |

---

## Troubleshooting

### "Cannot find wrangler"
```bash
npm install -D wrangler
```

### "Authentication failed"
```bash
npx wrangler logout
npx wrangler login
```

### "zone_id is missing"
Get it from Cloudflare dashboard:
1. Go to your domain
2. Copy Zone ID from the right sidebar
3. Paste into `wrangler.toml`

### "Assets not found"
Make sure you've built the frontend:
```bash
npm run build:client
```

### "Chat API returns 500"
Check Worker logs:
```bash
wrangler tail
```

---

## Permanent Solution Going Forward

**From now on:**
- Any UI updates → rebuild with `npm run build:client`
- Any AI logic updates → update `_worker.ts`
- Deploy everything at once with `npm run deploy`

This ensures your UI never gets overwritten by API deployments.

---

## Next Steps

1. **Run locally first:**
   ```bash
   npm run preview
   ```
   (This runs Wrangler dev mode locally)

2. **Test the chat API locally**
3. **When ready, deploy live:**
   ```bash
   npm run deploy
   ```

Your ADVERSIQ UI + AI chat will be permanently restored.
