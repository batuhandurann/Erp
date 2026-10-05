# Multi-stage Dockerfile for BusinessFlow Enterprise ERP
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for layer caching
COPY package.json ./
RUN npm install

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./src/db/schema.prisma

# Build frontend and backend bundles
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/db/schema.prisma ./src/db/schema.prisma

EXPOSE 3000

CMD ["node", "dist/server.js"]
