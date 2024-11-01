FROM node:20-alpine AS base
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app

FROM base AS deps
COPY package-lock.json ./package-lock.json
COPY package.json ./package.json
RUN npm install

FROM base as dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM base AS runner
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next \
    && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone .
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT 3000

EXPOSE ${PORT}

# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "./server.js"]