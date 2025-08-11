# Production Multi-Stage Dockerfile for Advanced Multi-Level Workflow System
# Optimized for enterprise deployment with security and performance

FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm install --include=dev
COPY . .
RUN npm run build
EXPOSE 3000 8000 9000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S workflow -u 1001

# Set working directory
WORKDIR /app

# Install only production runtime dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force && \
    chown -R workflow:nodejs /app

# Copy built application from builder stage
COPY --from=builder --chown=workflow:nodejs /app/dist ./dist
COPY --from=builder --chown=workflow:nodejs /app/config ./config

# Copy production configuration
COPY --chown=workflow:nodejs config/production.config.json ./config/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV METRICS_PORT=8000
ENV HEALTH_PORT=9000

# Security settings
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN chmod -R 755 /app && \
    find /app -type f -name "*.js" -exec chmod 644 {} \;

# Switch to non-root user
USER workflow

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node ./dist/health-check.js || exit 1

# Expose ports
EXPOSE 3000 8000 9000

# Production startup command
CMD ["node", "./dist/main.js", "--config", "./config/production.config.json"]