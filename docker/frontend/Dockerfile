# =============================================================
# Frontend Dockerfile — Morgan Task Web Client
# Multi-stage: development | builder | production (nginx)
# =============================================================

# ---- Base: common dependencies and tools ----
FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# ---- Development: Vite dev server with HMR ----
FROM base AS development

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "exec", "vite", "--host", "0.0.0.0"]

# ---- Builder: compile React + Vite → dist/ ----
FROM base AS builder

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ---- Production: nginx serves compiled SPA ----
FROM nginx:1.25-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx /etc/nginx/conf.d \
    && touch /tmp/nginx.pid \
    && chown nginx:nginx /tmp/nginx.pid

EXPOSE 8080

USER nginx

CMD ["nginx", "-g", "daemon off;"]
