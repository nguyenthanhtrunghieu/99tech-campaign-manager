# Base stage for dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN yarn install --frozen-lockfile

# Build stage
FROM base AS builder
COPY . .
RUN yarn workspace @99tech/shared build
RUN yarn workspace @99tech/api build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared ./packages/shared
RUN yarn install --production --frozen-lockfile

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]
