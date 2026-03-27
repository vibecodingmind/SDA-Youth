# 1. Use Node.js for the build
FROM node:20-alpine AS builder

# Install bun
RUN npm install -g bun

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Generate Prisma Client
RUN bun run db:generate

# Build the application
RUN bun run build

# 2. Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install bun
RUN npm install -g bun

# Set to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
