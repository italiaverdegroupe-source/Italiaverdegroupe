# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* is inlined by `next build`, so anything read at build time sees
# whatever the BUILD environment had — and a Docker build sees nothing the
# Dockerfile has not declared. Railway passes every service variable as a
# build argument; without this line Docker discarded them all, and the
# canonical URLs, the JSON-LD and robots.txt were built against the fallback
# placeholder rather than the site's own domain.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
# Docker sets HOSTNAME to the container id, and Next's standalone server binds
# to whatever HOSTNAME says — which leaves it unreachable from the platform
# proxy. Force the bind address at exec time so no inherited value can win.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
