# Multi-stage Dockerfile for Claude Flow Production Deployment
# Supports Node.js 22+, Rust/WASM bindings, and all database services

# Stage 1: Base runtime with system dependencies
FROM node:22-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    sqlite \
    sqlite-dev \
    python3 \
    py3-pip \
    make \
    g++ \
    libc6-compat \
    curl \
    ca-certificates \
    openssl \
    # For Kuzu graph database
    cmake \
    # For native addons
    linux-headers

# Create app directory
WORKDIR /app

# Create non-root user early
RUN addgroup -g 1001 -S claudeflow && \
    adduser -S claudeflow -u 1001 -G claudeflow

# Stage 2: Rust builder for neural network bindings
FROM rust:1.75-alpine AS rust-builder

# Install build dependencies
RUN apk add --no-cache \
    musl-dev \
    openssl-dev \
    pkgconfig \
    cmake \
    make \
    g++

WORKDIR /rust-build

# Copy Rust source files
COPY ruv-FANN/Cargo.toml ruv-FANN/Cargo.lock ./ruv-FANN/
COPY ruv-FANN/src ./ruv-FANN/src
COPY ruv-FANN/cuda-wasm ./ruv-FANN/cuda-wasm
COPY ruv-FANN/neuro-divergent ./ruv-FANN/neuro-divergent
COPY ruv-FANN/ruv-swarm ./ruv-FANN/ruv-swarm

# Build Rust components
WORKDIR /rust-build/ruv-FANN
RUN cargo build --release --target x86_64-unknown-linux-musl

# Build WASM components
WORKDIR /rust-build/ruv-FANN/cuda-wasm
RUN cargo build --release --target wasm32-unknown-unknown

# Stage 3: Node.js dependencies
FROM base AS dependencies

# Copy package files
COPY package*.json ./
COPY src/bindings/package.json ./src/bindings/
COPY ruv-FANN/ruv-swarm/npm/package.json ./ruv-FANN/ruv-swarm/npm/
COPY benchmark/package.json ./benchmark/

# Install production dependencies
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Stage 4: Development dependencies for building
FROM dependencies AS dev-dependencies

# Install all dependencies including dev
RUN npm ci --no-audit --no-fund && \
    npm cache clean --force

# Stage 5: Build stage
FROM dev-dependencies AS builder

# Copy source code
COPY . .

# Copy built Rust artifacts
COPY --from=rust-builder /rust-build/ruv-FANN/target/release/*.so ./src/bindings/native/
COPY --from=rust-builder /rust-build/ruv-FANN/target/release/*.a ./src/bindings/native/
COPY --from=rust-builder /rust-build/ruv-FANN/cuda-wasm/target/wasm32-unknown-unknown/release/*.wasm ./src/bindings/fallback/

# Build TypeScript and prepare production build
RUN npm run build || true

# Create necessary directories
RUN mkdir -p dist data logs memory exports

# Stage 6: Production runtime
FROM base AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    tini \
    # For WebGPU support
    mesa-gl \
    mesa-gles \
    # For better process management
    dumb-init

# Copy node modules from dependencies stage
COPY --from=dependencies --chown=claudeflow:claudeflow /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=claudeflow:claudeflow /app/dist ./dist
COPY --from=builder --chown=claudeflow:claudeflow /app/src ./src
COPY --from=builder --chown=claudeflow:claudeflow /app/scripts ./scripts
COPY --from=builder --chown=claudeflow:claudeflow /app/.claude ./.claude
COPY --from=builder --chown=claudeflow:claudeflow /app/ruv-FANN ./ruv-FANN

# Copy package files
COPY --chown=claudeflow:claudeflow package*.json ./
COPY --chown=claudeflow:claudeflow ecosystem.config.js ./

# Create required directories with proper permissions
RUN mkdir -p /app/data /app/logs /app/memory /app/exports /app/databases && \
    chown -R claudeflow:claudeflow /app

# Create volume mount points
VOLUME ["/app/data", "/app/logs", "/app/memory", "/app/databases"]

# Switch to non-root user
USER claudeflow

# Set environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=4096" \
    CLAUDE_FLOW_DATA_DIR=/app/data \
    CLAUDE_FLOW_LOG_DIR=/app/logs \
    CLAUDE_FLOW_MEMORY_DIR=/app/memory \
    SQLITE_DB_PATH=/app/databases/hive-mind.db \
    LANCEDB_PATH=/app/databases/lancedb \
    KUZU_PATH=/app/databases/kuzu \
    MCP_SERVER_PORT=3000 \
    API_SERVER_PORT=4000 \
    WEBSOCKET_PORT=4001

# Expose ports
EXPOSE 3000 4000 4001 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Default command - start API server
CMD ["node", "src/api/claude-zen-server.js"]

# Stage 7: MCP Server
FROM production AS mcp-server

# Override command for MCP server
CMD ["node", "src/mcp/http-mcp-server.js"]

# Stage 8: Development image
FROM dev-dependencies AS development

# Install development tools
RUN apk add --no-cache \
    vim \
    tmux \
    htop \
    strace \
    tcpdump \
    net-tools

# Copy source code
COPY . .

# Create development directories
RUN mkdir -p coverage .nyc_output test-results

# Development environment
ENV NODE_ENV=development \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=8192" \
    DEBUG=claude-flow:*

# Development ports (with debugging)
EXPOSE 3000 4000 4001 8080 9229

# Development command with hot reload
CMD ["npm", "run", "dev"]

# Stage 9: Testing image
FROM development AS testing

# Test environment
ENV NODE_ENV=test \
    CI=true

# Run tests
CMD ["npm", "test"]