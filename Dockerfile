### Multi-stage Dockerfile for production
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source and build frontend + server bundle
COPY . .
RUN npm run build && npm run build:server

### Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app

# Install production deps only
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Direct start — env injection happens at orchestrator level (Docker, ECS, K8s)
CMD [ node, dist-server/server/index.js]
