# ── Smart Supply Chain Backend — Dockerfile ──────────────────────────────────
# Node.js 18 Alpine (minimal image)
# Cloud Run expects the app to listen on $PORT (default 8080)

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (layer cache optimization)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Cloud Run sets PORT env var automatically
ENV PORT=8080
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["node", "server.js"]
