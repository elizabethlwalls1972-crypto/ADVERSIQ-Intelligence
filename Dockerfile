### Multi-stage Dockerfile for production
FROM node:20-alpine AS builder

WORKDIR /app

# Increase Node memory for Vite build (Railway containers can be tight)
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source and build frontend + server bundle
COPY . .
# build:all = build:client (Vite) + build:server (esbuild) — single pass
RUN npm run build:all

### Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app

# Install production deps only
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Railway injects PORT at runtime — don't hardcode it
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD wget -qO- http://localhost:${PORT:-3000}/api/health || exit 1

CMD ["node", "dist-server/server/index.js"]
