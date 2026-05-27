# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
# BWGA Ai v6.0 - PRODUCTION DEPLOYMENT GUIDE
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
# 
# Complete guide to deploy BWGA Ai to production with LIVE AI integration
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

## ðŸš€ QUICK DEPLOYMENT OPTIONS

### Option 1: Vercel (Recommended for simplicity)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - GEMINI_API_KEY
# - OPENAI_API_KEY
# - SERPER_API_KEY
# - etc.
```

### Option 2: Railway (Best for full-stack)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

### Option 3: Docker (Self-hosted)
```bash
# Build and run
docker-compose up -d

# Or single container
docker build -t bw-nexus-ai .
docker run -p 3001:3001 --env-file .env bw-nexus-ai
```

---

## ðŸ”‘ REQUIRED API KEYS

### MINIMUM REQUIRED (System will work with just these):

| Service | Purpose | Get Key From |
|---------|---------|--------------|
| **Gemini** | Primary AI Engine | https://aistudio.google.com/apikey |

### RECOMMENDED (For full multi-agent capability):

| Service | Purpose | Get Key From |
|---------|---------|--------------|
| **OpenAI GPT-4** | Enhanced reasoning | https://platform.openai.com/api-keys |
| **Serper** | Google Search API | https://serper.dev/ |
| **Perplexity** | AI-powered search | https://www.perplexity.ai/settings/api |

### OPTIONAL (Enhanced features):

| Service | Purpose | Get Key From |
|---------|---------|--------------|
| Claude | Ethical analysis | https://console.anthropic.com/ |
| News API | Real-time news | https://newsapi.org/ |
| Alpha Vantage | Financial data | https://www.alphavantage.co/ |

---

## ðŸ“¦ ENVIRONMENT SETUP

1. **Copy the example env file:**
   ```bash
   cp .env.production.example .env
   ```

2. **Fill in your API keys:**
   ```env
   GEMINI_API_KEY=AIza...
   OPENAI_API_KEY=sk-...
   SERPER_API_KEY=...
   ```

3. **Set your domain:**
   ```env
   FRONTEND_URL=https://your-domain.com
   ```

---

## ðŸ—ï¸ BUILD FOR PRODUCTION

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# The 'dist' folder now contains your production frontend
```

---

## ðŸ–¥ï¸ SERVER DEPLOYMENT

### Development:
```bash
npm run dev        # Frontend at localhost:3000
npm run server     # Backend at localhost:3001
```

### Production (Node.js):
```bash
# Build and start
npm run build
NODE_ENV=production node server/index.js
```

### Production (PM2 - Recommended for VPS):
```bash
# Install PM2
npm i -g pm2

# Start with PM2
pm2 start server/index.js --name bw-nexus-ai

# Auto-start on reboot
pm2 startup
pm2 save
```

---

## â˜ï¸ CLOUD PLATFORM GUIDES

### VERCEL

1. Connect your GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Settings > Environment Variables
5. Deploy!

Configuration file: `vercel.json` (already included)

### RAILWAY

1. Create new project from GitHub repo
2. Railway auto-detects the stack
3. Add environment variables in Variables tab
4. Deploy from dashboard

Configuration file: `railway.json` (already included)

### NETLIFY

1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Site settings

Configuration file: `netlify.toml` (already included)

### DOCKER/VPS

```bash
# Build image
docker build -t bw-nexus-ai .

# Run with environment variables
docker run -d \
  -p 3001:3001 \
  -e GEMINI_API_KEY=your_key \
  -e OPENAI_API_KEY=your_key \
  -e SERPER_API_KEY=your_key \
  --name bw-nexus-ai \
  bw-nexus-ai
```

---

## ðŸ”’ SECURITY CHECKLIST

- [ ] All API keys stored in environment variables (never in code)
- [ ] HTTPS enabled on production domain
- [ ] CORS configured for your domain only
- [ ] Rate limiting enabled
- [ ] API keys have usage limits set
- [ ] Error messages don't expose sensitive info

---

## ðŸ§ª TESTING PRODUCTION

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.com/api/health

# AI endpoint
curl -X POST https://your-domain.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Search endpoint
curl -X POST https://your-domain.com/api/search/serper \
  -H "Content-Type: application/json" \
  -d '{"query": "Vietnam business opportunities"}'
```

---

## ðŸ”„ LIVE AI INTEGRATION FEATURES

Once deployed with API keys, the system enables:

### Multi-Agent Brain (v5.0)
- Gemini + GPT-4 + Claude working in parallel
- Synthesized responses from multiple AI models
- Confidence scoring across agents

### Reactive Intelligence (v6.0)
- Live web search via Serper/Google
- Real-time news aggregation
- Proactive opportunity detection
- Self-solving problem resolution

### Self-Learning
- Outcomes recorded for pattern analysis
- Historical patterns from 1820-2025
- Accuracy improves with usage

---

## ðŸ“Š MONITORING

### Logs
```bash
# Vercel
vercel logs

# Railway
railway logs

# Docker
docker logs bw-nexus-ai

# PM2
pm2 logs bw-nexus-ai
```

### Health Check
The `/api/health` endpoint returns:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "version": "6.0.0"
}
```

---

## ðŸ†˜ TROUBLESHOOTING

### "AI service unavailable"
- Check GEMINI_API_KEY is set correctly
- Verify API key is valid at Google AI Studio

### "OpenAI/Claude service unavailable"
- These are optional - system works without them
- Add API keys to enable multi-agent features

### "Search failed"
- Check SERPER_API_KEY
- System falls back to DuckDuckGo if not set

### CORS errors
- Update FRONTEND_URL in environment
- Check vercel.json/railway.json routes

---

## ðŸŽ‰ SUCCESS!

Once deployed, you have:
- âœ… Live AI chat with multiple providers
- âœ… Real-time web search integration
- âœ… 200-year historical learning engine
- âœ… Reactive self-solving intelligence
- âœ… Regional city opportunity detection
- âœ… No mock data - everything is LIVE

---

**BWGA Ai v6.0 - Reactive Intelligence Engine**
*The system that thinks on its feet*

