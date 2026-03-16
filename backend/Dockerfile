# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Prune dev dependencies after build
RUN npm ci --omit=dev --ignore-scripts

# ── Stage 2: runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy compiled output and production node_modules only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

USER appuser

EXPOSE 3001

# Health check — ALB/ECS will poll this before routing traffic
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Env vars injected by ECS task definition (Secrets Manager + Parameter Store).
# Do not use --env-file here; ECS handles secret injection at container start.
CMD ["node", "dist/server.js"]
