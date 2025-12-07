FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files first
COPY package.json ./

# Copy prisma schema before npm install (needed for postinstall script)
COPY prisma ./prisma/

# Install dependencies (postinstall will run prisma generate)
# Добавляем retry и таймауты для надежности
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps --no-package-lock --ignore-scripts && \
    npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER=1

# Install OpenSSL для Prisma (пробуем разные варианты в зависимости от архитектуры)
RUN apk add --no-cache openssl || \
    apk add --no-cache openssl-dev || \
    apk add --no-cache openssl1.1-compat || \
    echo "OpenSSL installation skipped - may cause Prisma warnings"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

USER nodejs

EXPOSE 5000

ENV PORT=5000

# Проверка наличия файла и запуск приложения
CMD ["sh", "-c", "if [ -f dist/index.cjs ]; then node dist/index.cjs; elif [ -f dist/server/index.cjs ]; then node dist/server/index.cjs; else echo 'Error: Entry point not found. Available files:'; ls -la dist/ 2>/dev/null || echo 'dist/ does not exist'; exit 1; fi"]

