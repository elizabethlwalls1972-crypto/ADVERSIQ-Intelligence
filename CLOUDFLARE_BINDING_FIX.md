# ✅ CLOUDFLARE BINDING FIX - Complete Guide

Your app is deployed, but bindings are missing. This will fix it in 5 minutes.

---

## 🎯 What's Wrong?

- ✅ Your app is deployed to Cloudflare Pages
- ✅ Your code is there
- ❌ **Missing:** AI binding (for LLaMA models)
- ❌ **Missing:** KV namespace binding (for persistent memory)

Without these bindings, the API returns 500 errors when trying to use AI or access memory.

---

## 🚀 QUICK FIX (5 Minutes)

### Step 1: Go to Cloudflare Dashboard

```
https://dash.cloudflare.com/pages/view/advers/settings/functions
```

### Step 2: Add AI Binding

Click **"Add Binding"** under Production:

```
Variable name:    AI
Service:          Workers AI
```

Click **Save & Deploy** ✓

### Step 3: Add KV Namespace Binding

Click **"Add Binding"** again:

```
Variable name:    NSIL_MEMORY
Type:             KV Namespace
Namespace:        NSIL_MEMORY
```

Click **Save & Deploy** ✓

### Step 4: Verify

```powershell
curl https://advers.pages.dev/api/health
```

Should return:
```json
{
  "status": "operational",
  "system": "NSIL Intelligence OS v2.0",
  "agents": ["ATLAS", "CIPHER", "SENTINEL", ...],
  "capabilities": ["multi-agent debate", ...]
}
```

---

## 🤖 AUTOMATED FIX (Optional)

If you have a Cloudflare API token, this script will do it automatically:

### Get Your API Token

1. Go to: https://dash.cloudflare.com/profile/api/tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Make sure it includes:
   - Accounts → Workers KV Storage → Edit
   - Account → Pages → Edit
5. Copy the token

### Run the Fix Script

```powershell
$env:CLOUDFLARE_API_TOKEN = "your_token_here"
node setup-bindings.js
```

The script will automatically configure both bindings.

---

## 📊 Verify Configuration

After adding bindings, check:

1. **Bindings are active:**
   ```powershell
   curl https://advers.pages.dev/api/status
   ```

2. **Chat works:**
   ```powershell
   curl -X POST https://advers.pages.dev/api/chat `
     -H "Content-Type: application/json" `
     -d '{"message": "Hello", "agent": "SUSAN"}'
   ```

3. **Memory works:**
   ```powershell
   curl https://advers.pages.dev/api/memory?key=test
   ```

---

## 🔧 Troubleshooting

### Problem: "AI is undefined"
**Solution:** Check that AI binding is added in dashboard

### Problem: "NSIL_MEMORY.put is not a function"
**Solution:** Check that KV binding points to correct namespace (NSIL_MEMORY)

### Problem: Still getting 500 errors
**Solution:** 
1. Check Cloudflare Pages Function logs:
   ```powershell
   npx wrangler tail --project-name=advers
   ```
2. Look for binding errors in output
3. Re-add bindings if needed

---

## ✅ Done!

Your app is now fully functional with:
- ✓ 9 autonomous agents (ATLAS, CIPHER, SENTINEL, ORACLE, NEXUS, AEGIS, PHANTOM, REDTEAM, SUSAN)
- ✓ Real-time AI responses (LLaMA models)
- ✓ Persistent memory (KV namespace)
- ✓ All 19 API endpoints enabled

Live at: **https://advers.pages.dev**

---

## 📞 Need Help?

Check logs:
```powershell
npx wrangler tail --project-name=advers
```

Re-deploy:
```powershell
npm run deploy
```

Restart local dev:
```powershell
npm run dev
```
