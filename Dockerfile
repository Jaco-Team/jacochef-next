# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM base AS development
RUN apt-get update \
    && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/*
COPY --from=dependencies /app/node_modules /opt/node_modules
COPY docker/entrypoint.sh /usr/local/bin/frontend-entrypoint
RUN chmod +x /usr/local/bin/frontend-entrypoint
ENTRYPOINT ["frontend-entrypoint"]
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

FROM dependencies AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY
ARG MUI_STYLE_ENGINE=sc
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY=${NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY} \
    MUI_STYLE_ENGINE=${MUI_STYLE_ENGINE}
COPY . .
RUN node scripts/copy-tinymce.js \
    && npm run build

FROM base AS production
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/node_modules/next/node_modules/@swc/helpers ./node_modules/next/node_modules/@swc/helpers
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=30s \
    CMD ["node", "-e", "fetch('http://127.0.0.1:3000').then(() => process.exit(0)).catch(() => process.exit(1))"]
CMD ["node", "server.js"]
