FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apt update && apt install --yes --no-install-recommends \
  curl \
  ca-certificates \
  python3 \
  make \
  g++ \
  sqlite3 \
  && install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
  && chmod a+r /etc/apt/keyrings/docker.asc \
  && echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null \
  && apt update \
  && apt --yes --no-install-recommends install \
  docker-ce-cli \
  docker-compose-plugin \
  && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/data

# Dependencies
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Dependencies
FROM base AS prod-deps
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV SKIP_ENV_VALIDATION 1
ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server/db/migrations ./migrations
COPY --from=builder /app/src/server/db/migrate.ts ./migrate.ts
COPY --from=builder /app/start.sh ./start.sh
COPY --from=prod-deps /app/node_modules ./node_modules

VOLUME /app/data
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["bash", "./start.sh"]
