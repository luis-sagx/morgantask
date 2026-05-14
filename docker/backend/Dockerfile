# =============================================================
# Backend Dockerfile — Morgan Task API
# Multi-stage: development | builder | production
# =============================================================

# ---- Base: common dependencies and tools ----
FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ---- Development: hot-reload, full toolchain ----
FROM base AS development

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

EXPOSE 4000

CMD ["pnpm", "run", "dev"]

# ---- Builder: compile TypeScript to dist/ ----
FROM base AS builder

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ---- Production: minimal image, compiled JS only ----
FROM node:20-alpine AS production

RUN apk add --no-cache tini

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 4000

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
