FROM node:20-slim AS base
RUN npm install -g pnpm@10

# ── Install dependencies ──────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY tsconfig.base.json ./
COPY lib/db/package.json                          lib/db/
COPY lib/api-zod/package.json                     lib/api-zod/
COPY lib/api-client-react/package.json            lib/api-client-react/
COPY lib/integrations-openai-ai-server/package.json lib/integrations-openai-ai-server/
COPY artifacts/api-server/package.json            artifacts/api-server/
COPY artifacts/job-crawler/package.json           artifacts/job-crawler/
RUN pnpm install --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .

# Build frontend (output: artifacts/job-crawler/dist/public/)
RUN BASE_PATH=/ pnpm --filter @workspace/job-crawler run build

# Build backend (output: artifacts/api-server/dist/index.cjs)
RUN pnpm --filter @workspace/api-server run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-slim AS runner
RUN npm install -g pnpm@10
WORKDIR /app

# Only install runtime deps for the api-server
COPY package.json pnpm-workspace.yaml ./
COPY lib/db/package.json              lib/db/
COPY artifacts/api-server/package.json artifacts/api-server/

# Copy the compiled backend bundle
COPY --from=builder /app/artifacts/api-server/dist/index.cjs ./server.cjs

# Copy the built frontend static files
COPY --from=builder /app/artifacts/job-crawler/dist/public ./public

# Install only production deps (pdf-parse, pg, cheerio, etc.)
RUN pnpm install --prod --filter @workspace/api-server --no-frozen-lockfile 2>/dev/null || true
RUN npm install pdf-parse cheerio --no-save 2>/dev/null || true

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production
ENV STATIC_DIR=/app/public

CMD ["node", "server.cjs"]
