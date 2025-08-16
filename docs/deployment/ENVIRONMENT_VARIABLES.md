# Claude-Zen Environment Variables Reference

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core System Configuration](#core-system-configuration)
3. [Logging Configuration](#logging-configuration)
4. [Network & Server Configuration](#network--server-configuration)
5. [Security Configuration](#security-configuration)
6. [AI Service Configuration](#ai-service-configuration)
7. [Database Configuration](#database-configuration)
8. [Memory & Caching Configuration](#memory--caching-configuration)
9. [Swarm & Coordination Configuration](#swarm--coordination-configuration)
10. [File System Configuration](#file-system-configuration)
11. [Monitoring & Metrics Configuration](#monitoring--metrics-configuration)
12. [Backup & Recovery Configuration](#backup--recovery-configuration)
13. [Feature Flags](#feature-flags)
14. [Development & Debugging](#development--debugging)
15. [Docker Specific Variables](#docker-specific-variables)
16. [Kubernetes Specific Variables](#kubernetes-specific-variables)

## 🔍 Overview

This document provides comprehensive documentation for all environment variables used in Claude-Zen. Each variable includes its purpose, default value, expected format, and usage examples.

### Variable Naming Convention

- **ZEN_*** - Core application settings
- **WEB_*** - Web interface settings  
- **MCP_*** - Model Context Protocol settings
- **DATABASE_*** - Database connection settings
- **REDIS_*** - Redis cache settings
- **SWARM_*** - Swarm coordination settings
- **ENABLE_*** - Feature flags

### Configuration Priority

Environment variables are loaded in the following order (highest to lowest priority):

1. System environment variables
2. `.env` file in application directory
3. Default values in application code

## ⚙️ Core System Configuration

### NODE_ENV
- **Purpose**: Defines the application environment
- **Type**: String
- **Default**: `development`
- **Valid Values**: `production`, `development`, `testing`
- **Example**: `NODE_ENV=production`
- **Production**: Should always be set to `production`

### APP_NAME
- **Purpose**: Application name used in logging and monitoring
- **Type**: String
- **Default**: `claude-zen`
- **Example**: `APP_NAME=claude-zen-prod`
- **Production**: Use descriptive name for multi-instance deployments

### APP_VERSION
- **Purpose**: Application version for tracking and monitoring
- **Type**: String (Semantic Versioning)
- **Default**: From `package.json`
- **Example**: `APP_VERSION=2.0.0`
- **Production**: Keep synchronized with deployment version

### CLAUDE_INSTANCE_ID
- **Purpose**: Unique identifier for this instance
- **Type**: String
- **Default**: `claude-zen-default`
- **Example**: `CLAUDE_INSTANCE_ID=prod-server-01`
- **Production**: Use hostname or deployment-specific identifier

### CLAUDE_RESTART_POLICY
- **Purpose**: Process restart policy for process managers
- **Type**: String
- **Default**: `always`
- **Valid Values**: `always`, `on-failure`, `unless-stopped`, `no`
- **Example**: `CLAUDE_RESTART_POLICY=always`

### NODE_OPTIONS
- **Purpose**: Node.js runtime options
- **Type**: String
- **Default**: `--max-old-space-size=4096`
- **Example**: `NODE_OPTIONS="--max-old-space-size=8192 --enable-source-maps"`
- **Production**: Adjust memory based on available system RAM

## 📝 Logging Configuration

### CLAUDE_LOG_LEVEL
- **Purpose**: Sets the minimum log level
- **Type**: String
- **Default**: `info`
- **Valid Values**: `debug`, `info`, `warn`, `error`
- **Example**: `CLAUDE_LOG_LEVEL=info`
- **Production**: Use `info` or `warn` to reduce log volume

### LOG_LEVEL
- **Purpose**: Alternative log level setting (fallback)
- **Type**: String
- **Default**: Same as `CLAUDE_LOG_LEVEL`
- **Example**: `LOG_LEVEL=warn`

### CLAUDE_LOG_CONSOLE
- **Purpose**: Enable console logging output
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `CLAUDE_LOG_CONSOLE=false`
- **Production**: Set to `false` to reduce container output

### CLAUDE_LOG_FILE
- **Purpose**: Enable file logging output
- **Type**: Boolean
- **Default**: `false` (development), `true` (production)
- **Example**: `CLAUDE_LOG_FILE=true`
- **Production**: Enable for persistent log storage

### CLAUDE_LOG_JSON
- **Purpose**: Output logs in JSON format
- **Type**: Boolean
- **Default**: `false` (development), `true` (production)
- **Example**: `CLAUDE_LOG_JSON=true`
- **Production**: Enable for log aggregation systems

### LOG_FORMAT
- **Purpose**: Log output format
- **Type**: String
- **Default**: `pretty` (development), `json` (production)
- **Valid Values**: `json`, `pretty`, `simple`
- **Example**: `LOG_FORMAT=json`

### CLAUDE_LOG_DIR
- **Purpose**: Directory for log files
- **Type**: String (Path)
- **Default**: `./logs`
- **Example**: `CLAUDE_LOG_DIR=/var/log/claude-zen`
- **Production**: Use absolute path in dedicated log directory

### CLAUDE_LOG_FILE_PATH
- **Purpose**: Main log file path
- **Type**: String (Path)
- **Default**: `${CLAUDE_LOG_DIR}/claude-zen.log`
- **Example**: `CLAUDE_LOG_FILE_PATH=/var/log/claude-zen/app.log`

### CLAUDE_LOG_ERROR_FILE
- **Purpose**: Error log file path
- **Type**: String (Path)
- **Default**: `${CLAUDE_LOG_DIR}/error.log`
- **Example**: `CLAUDE_LOG_ERROR_FILE=/var/log/claude-zen/error.log`

### CLAUDE_LOG_ACCESS_FILE
- **Purpose**: Access log file path
- **Type**: String (Path)
- **Default**: `${CLAUDE_LOG_DIR}/access.log`
- **Example**: `CLAUDE_LOG_ACCESS_FILE=/var/log/claude-zen/access.log`

### CLAUDE_LOG_MAX_SIZE
- **Purpose**: Maximum log file size in MB before rotation
- **Type**: Number
- **Default**: `10` (development), `100` (production)
- **Example**: `CLAUDE_LOG_MAX_SIZE=50`

### CLAUDE_LOG_MAX_FILES
- **Purpose**: Maximum number of rotated log files to keep
- **Type**: Number
- **Default**: `5` (development), `30` (production)
- **Example**: `CLAUDE_LOG_MAX_FILES=15`

### CLAUDE_LOG_PERFORMANCE
- **Purpose**: Enable performance logging
- **Type**: Boolean
- **Default**: `false` (development), `true` (production)
- **Example**: `CLAUDE_LOG_PERFORMANCE=true`

### CLAUDE_LOG_MEMORY_USAGE
- **Purpose**: Log memory usage statistics
- **Type**: Boolean
- **Default**: `false`
- **Example**: `CLAUDE_LOG_MEMORY_USAGE=true`
- **Production**: Enable for performance monitoring

### CLAUDE_LOG_REQUEST_DETAILS
- **Purpose**: Log detailed request information
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `CLAUDE_LOG_REQUEST_DETAILS=false`
- **Security**: Disable in production to avoid logging sensitive data

## 🌐 Network & Server Configuration

### CLAUDE_MCP_HOST
- **Purpose**: Host address for HTTP MCP server
- **Type**: String (IP Address)
- **Default**: `localhost`
- **Example**: `CLAUDE_MCP_HOST=0.0.0.0`
- **Production**: Use `0.0.0.0` to bind to all interfaces

### CLAUDE_MCP_PORT
- **Purpose**: Port for HTTP MCP server
- **Type**: Number
- **Default**: `3000`
- **Example**: `CLAUDE_MCP_PORT=3000`
- **Production**: Ensure port is available and not conflicting

### MCP_PORT
- **Purpose**: Alternative MCP port setting (fallback)
- **Type**: Number
- **Default**: Same as `CLAUDE_MCP_PORT`
- **Example**: `MCP_PORT=3000`

### CLAUDE_WEB_HOST
- **Purpose**: Host address for web dashboard server
- **Type**: String (IP Address)
- **Default**: `localhost`
- **Example**: `CLAUDE_WEB_HOST=0.0.0.0`
- **Production**: Use `0.0.0.0` for public access

### CLAUDE_WEB_PORT
- **Purpose**: Port for web dashboard server
- **Type**: Number
- **Default**: `3456`
- **Example**: `CLAUDE_WEB_PORT=3456`

### API_PORT
- **Purpose**: Port for REST API server
- **Type**: Number
- **Default**: `4000`
- **Example**: `API_PORT=4000`

### WEBSOCKET_PORT
- **Purpose**: Port for WebSocket server
- **Type**: Number
- **Default**: `4001`
- **Example**: `WEBSOCKET_PORT=4001`

### HTTP_PORT
- **Purpose**: HTTP port (for reverse proxy configurations)
- **Type**: Number
- **Default**: `80`
- **Example**: `HTTP_PORT=8080`

### HTTPS_PORT
- **Purpose**: HTTPS port (for reverse proxy configurations)
- **Type**: Number
- **Default**: `443`
- **Example**: `HTTPS_PORT=8443`

### CLAUDE_TUI_HOST
- **Purpose**: Host address for TUI server (optional)
- **Type**: String (IP Address)
- **Default**: `localhost`
- **Example**: `CLAUDE_TUI_HOST=localhost`

### CLAUDE_TUI_PORT
- **Purpose**: Port for TUI server (optional)
- **Type**: Number
- **Default**: `3457`
- **Example**: `CLAUDE_TUI_PORT=3457`

### CLAUDE_MCP_TIMEOUT
- **Purpose**: Request timeout for MCP server in milliseconds
- **Type**: Number
- **Default**: `30000`
- **Example**: `CLAUDE_MCP_TIMEOUT=45000`
- **Production**: Adjust based on expected response times

### CLAUDE_MCP_MAX_REQUEST_SIZE
- **Purpose**: Maximum request body size
- **Type**: String
- **Default**: `10mb`
- **Example**: `CLAUDE_MCP_MAX_REQUEST_SIZE=50mb`

### CLAUDE_WS_HEARTBEAT_INTERVAL
- **Purpose**: WebSocket heartbeat interval in milliseconds
- **Type**: Number
- **Default**: `30000`
- **Example**: `CLAUDE_WS_HEARTBEAT_INTERVAL=15000`

### CLAUDE_WS_MAX_CONNECTIONS
- **Purpose**: Maximum concurrent WebSocket connections
- **Type**: Number
- **Default**: `100` (development), `1000` (production)
- **Example**: `CLAUDE_WS_MAX_CONNECTIONS=500`

### CLAUDE_WS_COMPRESSION
- **Purpose**: Enable WebSocket compression
- **Type**: Boolean
- **Default**: `true`
- **Example**: `CLAUDE_WS_COMPRESSION=true`

## 🔒 Security Configuration

### FORCE_HTTPS
- **Purpose**: Force HTTPS redirects
- **Type**: Boolean
- **Default**: `false` (development), `true` (production)
- **Example**: `FORCE_HTTPS=true`
- **Production**: Always enable for production deployments

### HSTS_MAX_AGE
- **Purpose**: HTTP Strict Transport Security max age in seconds
- **Type**: Number
- **Default**: `31536000` (1 year)
- **Example**: `HSTS_MAX_AGE=31536000`

### JWT_SECRET
- **Purpose**: Secret key for JWT token signing
- **Type**: String
- **Default**: None (must be set)
- **Example**: `JWT_SECRET=your-super-strong-jwt-secret-minimum-32-characters-long`
- **Security**: Use cryptographically secure random string, minimum 32 characters

### JWT_EXPIRY
- **Purpose**: JWT token expiration time
- **Type**: String (duration)
- **Default**: `24h`
- **Valid Values**: `1h`, `24h`, `7d`, etc.
- **Example**: `JWT_EXPIRY=1h`
- **Production**: Use shorter expiry times for better security

### JWT_REFRESH_EXPIRY
- **Purpose**: JWT refresh token expiration time
- **Type**: String (duration)
- **Default**: `7d`
- **Example**: `JWT_REFRESH_EXPIRY=24h`

### ENCRYPTION_KEY
- **Purpose**: Key for data encryption
- **Type**: String (32 characters)
- **Default**: None (must be set)
- **Example**: `ENCRYPTION_KEY=your-32-character-encryption-key`
- **Security**: Must be exactly 32 characters

### CORS_ORIGIN
- **Purpose**: CORS allowed origins
- **Type**: String
- **Default**: `*` (development), specific domain (production)
- **Example**: `CORS_ORIGIN=https://your-domain.com`
- **Production**: Set to specific domains for security

### CLAUDE_MCP_CORS_ORIGIN
- **Purpose**: CORS origins for MCP server
- **Type**: String
- **Default**: `*`
- **Example**: `CLAUDE_MCP_CORS_ORIGIN=https://your-domain.com`

### CORS_METHODS
- **Purpose**: Allowed CORS methods
- **Type**: String (comma-separated)
- **Default**: `GET,POST,PUT,DELETE,OPTIONS`
- **Example**: `CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS`

### CORS_CREDENTIALS
- **Purpose**: Allow credentials in CORS requests
- **Type**: Boolean
- **Default**: `true`
- **Example**: `CORS_CREDENTIALS=true`

### RATE_LIMIT_WINDOW
- **Purpose**: Rate limiting window in milliseconds
- **Type**: Number
- **Default**: `60000` (1 minute)
- **Example**: `RATE_LIMIT_WINDOW=60000`

### RATE_LIMIT_MAX_REQUESTS
- **Purpose**: Maximum requests per window per IP
- **Type**: Number
- **Default**: `100` (development), `60` (production)
- **Example**: `RATE_LIMIT_MAX_REQUESTS=60`
- **Production**: Adjust based on expected usage patterns

### RATE_LIMIT_MAX_TOKENS
- **Purpose**: Maximum API tokens per window
- **Type**: Number
- **Default**: `1000000`
- **Example**: `RATE_LIMIT_MAX_TOKENS=500000`

### RATE_LIMIT_SKIP_SUCCESS
- **Purpose**: Skip rate limiting for successful requests
- **Type**: Boolean
- **Default**: `true`
- **Example**: `RATE_LIMIT_SKIP_SUCCESS=false`

### CSP_DEFAULT_SRC
- **Purpose**: Content Security Policy default source
- **Type**: String
- **Default**: `'self'`
- **Example**: `CSP_DEFAULT_SRC='self'`

### CSP_SCRIPT_SRC
- **Purpose**: Content Security Policy script sources
- **Type**: String
- **Default**: `'self' 'unsafe-inline'` (development), `'self'` (production)
- **Example**: `CSP_SCRIPT_SRC='self'`

### CSP_STYLE_SRC
- **Purpose**: Content Security Policy style sources
- **Type**: String
- **Default**: `'self' 'unsafe-inline'`
- **Example**: `CSP_STYLE_SRC='self' 'unsafe-inline'`

## 🤖 AI Service Configuration

### ANTHROPIC_API_KEY
- **Purpose**: Anthropic (Claude) API key
- **Type**: String
- **Default**: None (must be set)
- **Example**: `ANTHROPIC_API_KEY=your-anthropic-api-key-here`
- **Security**: Store securely, never commit to version control

### CLAUDE_API_KEY
- **Purpose**: Alternative Claude API key setting
- **Type**: String
- **Default**: Same as `ANTHROPIC_API_KEY`
- **Example**: `CLAUDE_API_KEY=your-claude-api-key-here`

### ANTHROPIC_MAX_TOKENS
- **Purpose**: Maximum tokens per Anthropic API request
- **Type**: Number
- **Default**: `4096`
- **Example**: `ANTHROPIC_MAX_TOKENS=8192`

### ANTHROPIC_TEMPERATURE
- **Purpose**: Temperature setting for Anthropic API
- **Type**: Number (0.0-1.0)
- **Default**: `0.7`
- **Example**: `ANTHROPIC_TEMPERATURE=0.5`

### ANTHROPIC_TIMEOUT
- **Purpose**: Timeout for Anthropic API requests in milliseconds
- **Type**: Number
- **Default**: `60000`
- **Example**: `ANTHROPIC_TIMEOUT=45000`

### OPENAI_API_KEY
- **Purpose**: OpenAI API key (backup/secondary service)
- **Type**: String
- **Default**: None (optional)
- **Example**: `OPENAI_API_KEY=your-openai-api-key-here`

### OPENAI_MODEL
- **Purpose**: OpenAI model to use
- **Type**: String
- **Default**: `gpt-4`
- **Example**: `OPENAI_MODEL=gpt-4-turbo`

### OPENAI_MAX_TOKENS
- **Purpose**: Maximum tokens per OpenAI API request
- **Type**: Number
- **Default**: `4096`
- **Example**: `OPENAI_MAX_TOKENS=8192`

### OPENAI_TEMPERATURE
- **Purpose**: Temperature setting for OpenAI API
- **Type**: Number (0.0-1.0)
- **Default**: `0.7`
- **Example**: `OPENAI_TEMPERATURE=0.5`

### GOOGLE_API_KEY
- **Purpose**: Google AI API key (optional)
- **Type**: String
- **Default**: None (optional)
- **Example**: `GOOGLE_API_KEY=your-google-api-key-here`

### GITHUB_TOKEN
- **Purpose**: GitHub Personal Access Token
- **Type**: String
- **Default**: None (optional but recommended)
- **Example**: `GITHUB_TOKEN=ghp_your-github-token-here`
- **Permissions**: Needs repo, read:org, user permissions

### GITHUB_WEBHOOK_SECRET
- **Purpose**: GitHub webhook secret for security
- **Type**: String
- **Default**: None (optional)
- **Example**: `GITHUB_WEBHOOK_SECRET=your-webhook-secret`

### GITHUB_API_TIMEOUT
- **Purpose**: Timeout for GitHub API requests in milliseconds
- **Type**: Number
- **Default**: `30000`
- **Example**: `GITHUB_API_TIMEOUT=45000`

### AI_FAILOVER_ENABLED
- **Purpose**: Enable failover between AI services
- **Type**: Boolean
- **Default**: `true`
- **Example**: `AI_FAILOVER_ENABLED=true`

### AI_HEALTH_CHECK_INTERVAL
- **Purpose**: Interval between AI service health checks in milliseconds
- **Type**: Number
- **Default**: `30000`
- **Example**: `AI_HEALTH_CHECK_INTERVAL=60000`

### AI_RETRY_ATTEMPTS
- **Purpose**: Number of retry attempts for failed AI requests
- **Type**: Number
- **Default**: `3`
- **Example**: `AI_RETRY_ATTEMPTS=2`

### AI_RETRY_DELAY
- **Purpose**: Delay between retry attempts in milliseconds
- **Type**: Number
- **Default**: `1000`
- **Example**: `AI_RETRY_DELAY=2000`

## 🗄️ Database Configuration

### DATABASE_URL
- **Purpose**: Primary database connection string
- **Type**: String (URL)
- **Default**: None (must be set)
- **Example**: `DATABASE_URL=postgresql://user:pass@localhost:5432/claude_zen`
- **Format**: `postgresql://username:password@host:port/database`

### POSTGRES_URL
- **Purpose**: PostgreSQL connection string (alternative)
- **Type**: String (URL)
- **Default**: Same as `DATABASE_URL`
- **Example**: `POSTGRES_URL=postgresql://user:pass@localhost:5432/claude_zen`

### POSTGRES_HOST
- **Purpose**: PostgreSQL server host
- **Type**: String (hostname/IP)
- **Default**: `localhost`
- **Example**: `POSTGRES_HOST=db.example.com`

### POSTGRES_PORT
- **Purpose**: PostgreSQL server port
- **Type**: Number
- **Default**: `5432`
- **Example**: `POSTGRES_PORT=5432`

### POSTGRES_USER
- **Purpose**: PostgreSQL username
- **Type**: String
- **Default**: `claude_user`
- **Example**: `POSTGRES_USER=claude_prod_user`

### POSTGRES_PASSWORD
- **Purpose**: PostgreSQL password
- **Type**: String
- **Default**: None (must be set)
- **Example**: `POSTGRES_PASSWORD=secure_password_here`
- **Security**: Use strong password, store securely

### POSTGRES_DB
- **Purpose**: PostgreSQL database name
- **Type**: String
- **Default**: `claude_zen`
- **Example**: `POSTGRES_DB=claude_zen_production`

### DATABASE_POOL_MIN
- **Purpose**: Minimum database connection pool size
- **Type**: Number
- **Default**: `5`
- **Example**: `DATABASE_POOL_MIN=10`
- **Production**: Increase for high-traffic deployments

### DATABASE_POOL_MAX
- **Purpose**: Maximum database connection pool size
- **Type**: Number
- **Default**: `20`
- **Example**: `DATABASE_POOL_MAX=50`
- **Production**: Adjust based on server capacity

### DATABASE_POOL_IDLE_TIMEOUT
- **Purpose**: Idle connection timeout in milliseconds
- **Type**: Number
- **Default**: `30000`
- **Example**: `DATABASE_POOL_IDLE_TIMEOUT=60000`

### DATABASE_CONNECTION_TIMEOUT
- **Purpose**: Database connection timeout in milliseconds
- **Type**: Number
- **Default**: `5000`
- **Example**: `DATABASE_CONNECTION_TIMEOUT=10000`

### DATABASE_SSL
- **Purpose**: PostgreSQL SSL mode
- **Type**: String
- **Default**: `prefer`
- **Valid Values**: `disable`, `allow`, `prefer`, `require`, `verify-ca`, `verify-full`
- **Example**: `DATABASE_SSL=require`
- **Production**: Use `require` or higher for security

### SQLITE_DB_PATH
- **Purpose**: SQLite database file path (fallback)
- **Type**: String (Path)
- **Default**: `./data/claude-zen.db`
- **Example**: `SQLITE_DB_PATH=/opt/claude-zen/data/database.db`

### VECTOR_DATABASE_URL
- **Purpose**: Vector database connection string
- **Type**: String (URL)
- **Default**: Same as `DATABASE_URL`
- **Example**: `VECTOR_DATABASE_URL=postgresql://user:pass@localhost:5432/vectors`

### LANCEDB_PATH
- **Purpose**: LanceDB database directory path
- **Type**: String (Path)
- **Default**: `./data/lancedb`
- **Example**: `LANCEDB_PATH=/opt/claude-zen/data/lancedb`

### KUZU_PATH
- **Purpose**: Kuzu graph database directory path
- **Type**: String (Path)
- **Default**: `./data/kuzu`
- **Example**: `KUZU_PATH=/opt/claude-zen/data/kuzu`

### VECTOR_DIMENSION
- **Purpose**: Vector embedding dimensions
- **Type**: Number
- **Default**: `1536`
- **Example**: `VECTOR_DIMENSION=1536`
- **Note**: Must match AI model embedding dimensions

### VECTOR_METRIC
- **Purpose**: Vector similarity metric
- **Type**: String
- **Default**: `cosine`
- **Valid Values**: `cosine`, `euclidean`, `dot`
- **Example**: `VECTOR_METRIC=cosine`

### VECTOR_INDEX_SIZE_MB
- **Purpose**: Vector index cache size in MB
- **Type**: Number
- **Default**: `1024`
- **Example**: `VECTOR_INDEX_SIZE_MB=2048`

### GRAPH_CACHE_SIZE_MB
- **Purpose**: Graph database cache size in MB
- **Type**: Number
- **Default**: `256`
- **Example**: `GRAPH_CACHE_SIZE_MB=512`

### DATABASE_AUTO_MIGRATE
- **Purpose**: Enable automatic database migrations
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `DATABASE_AUTO_MIGRATE=false`
- **Production**: Disable for controlled migrations

### DATABASE_MIGRATE_ON_START
- **Purpose**: Run migrations on application start
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `DATABASE_MIGRATE_ON_START=false`

### DATABASE_BACKUP_ENABLED
- **Purpose**: Enable automatic database backups
- **Type**: Boolean
- **Default**: `false` (development), `true` (production)
- **Example**: `DATABASE_BACKUP_ENABLED=true`

### DATABASE_BACKUP_INTERVAL
- **Purpose**: Database backup interval in milliseconds
- **Type**: Number
- **Default**: `21600000` (6 hours)
- **Example**: `DATABASE_BACKUP_INTERVAL=43200000`

## 🧠 Memory & Caching Configuration

### REDIS_URL
- **Purpose**: Redis connection string
- **Type**: String (URL)
- **Default**: `redis://localhost:6379/0`
- **Example**: `REDIS_URL=redis://:password@redis:6379/0`

### REDIS_HOST
- **Purpose**: Redis server host
- **Type**: String (hostname/IP)
- **Default**: `localhost`
- **Example**: `REDIS_HOST=redis.example.com`

### REDIS_PORT
- **Purpose**: Redis server port
- **Type**: Number
- **Default**: `6379`
- **Example**: `REDIS_PORT=6379`

### REDIS_PASSWORD
- **Purpose**: Redis authentication password
- **Type**: String
- **Default**: None (optional)
- **Example**: `REDIS_PASSWORD=secure_redis_password`
- **Security**: Use strong password in production

### REDIS_POOL_SIZE
- **Purpose**: Redis connection pool size
- **Type**: Number
- **Default**: `10`
- **Example**: `REDIS_POOL_SIZE=20`

### REDIS_CONNECT_TIMEOUT
- **Purpose**: Redis connection timeout in milliseconds
- **Type**: Number
- **Default**: `5000`
- **Example**: `REDIS_CONNECT_TIMEOUT=10000`

### REDIS_KEY_PREFIX
- **Purpose**: Prefix for Redis keys
- **Type**: String
- **Default**: `claude-zen:`
- **Example**: `REDIS_KEY_PREFIX=prod:claude-zen:`

### MEMORY_CACHE_SIZE
- **Purpose**: In-memory cache maximum entries
- **Type**: Number
- **Default**: `1000`
- **Example**: `MEMORY_CACHE_SIZE=2000`

### MEMORY_CACHE_SIZE_MB
- **Purpose**: In-memory cache size limit in MB
- **Type**: Number
- **Default**: `512`
- **Example**: `MEMORY_CACHE_SIZE_MB=1024`

### MEMORY_CACHE_TTL
- **Purpose**: Memory cache TTL in milliseconds
- **Type**: Number
- **Default**: `3600000` (1 hour)
- **Example**: `MEMORY_CACHE_TTL=7200000`

### MEMORY_PERSISTENCE_ENABLED
- **Purpose**: Enable memory cache persistence
- **Type**: Boolean
- **Default**: `true`
- **Example**: `MEMORY_PERSISTENCE_ENABLED=true`

### MEMORY_CLEANUP_INTERVAL
- **Purpose**: Memory cleanup interval in milliseconds
- **Type**: Number
- **Default**: `300000` (5 minutes)
- **Example**: `MEMORY_CLEANUP_INTERVAL=600000`

### SESSION_STORE
- **Purpose**: Session storage backend
- **Type**: String
- **Default**: `memory` (development), `redis` (production)
- **Valid Values**: `memory`, `redis`, `database`
- **Example**: `SESSION_STORE=redis`

### SESSION_SECRET
- **Purpose**: Session encryption secret
- **Type**: String
- **Default**: None (must be set)
- **Example**: `SESSION_SECRET=your-session-secret-here`
- **Security**: Use cryptographically secure random string

### SESSION_MAX_AGE
- **Purpose**: Session maximum age in milliseconds
- **Type**: Number
- **Default**: `86400000` (24 hours)
- **Example**: `SESSION_MAX_AGE=3600000`

### SESSION_SECURE
- **Purpose**: Require HTTPS for session cookies
- **Type**: Boolean
- **Default**: `false` (development), `true` (production)
- **Example**: `SESSION_SECURE=true`

### SESSION_SAME_SITE
- **Purpose**: SameSite attribute for session cookies
- **Type**: String
- **Default**: `lax` (development), `strict` (production)
- **Valid Values**: `strict`, `lax`, `none`
- **Example**: `SESSION_SAME_SITE=strict`

### CLAUDE_WEB_SESSION_SECRET
- **Purpose**: Web dashboard session secret
- **Type**: String
- **Default**: None (must be set)
- **Example**: `CLAUDE_WEB_SESSION_SECRET=your-web-session-secret`

## 🐝 Swarm & Coordination Configuration

### SWARM_MAX_AGENTS
- **Purpose**: Maximum number of agents per swarm
- **Type**: Number
- **Default**: `50`
- **Example**: `SWARM_MAX_AGENTS=100`
- **Production**: Adjust based on system resources

### MAX_AGENTS
- **Purpose**: Global maximum agents across all swarms
- **Type**: Number
- **Default**: `100`
- **Example**: `MAX_AGENTS=200`

### MAX_HIVES
- **Purpose**: Maximum number of hives
- **Type**: Number
- **Default**: `10`
- **Example**: `MAX_HIVES=20`

### MAX_QUEENS_PER_HIVE
- **Purpose**: Maximum queens per hive
- **Type**: Number
- **Default**: `5`
- **Example**: `MAX_QUEENS_PER_HIVE=10`

### DEFAULT_SWARM_SIZE
- **Purpose**: Default swarm size for new swarms
- **Type**: Number
- **Default**: `8`
- **Example**: `DEFAULT_SWARM_SIZE=6`

### SWARM_TIMEOUT_MS
- **Purpose**: Swarm operation timeout in milliseconds
- **Type**: Number
- **Default**: `300000` (5 minutes)
- **Example**: `SWARM_TIMEOUT_MS=600000`

### SWARM_COORDINATION_TIMEOUT
- **Purpose**: Coordination timeout in milliseconds
- **Type**: Number
- **Default**: `30000`
- **Example**: `SWARM_COORDINATION_TIMEOUT=45000`

### SWARM_HEALTH_CHECK_INTERVAL
- **Purpose**: Swarm health check interval in milliseconds
- **Type**: Number
- **Default**: `15000`
- **Example**: `SWARM_HEALTH_CHECK_INTERVAL=30000`

### SWARM_AUTO_RECOVERY
- **Purpose**: Enable automatic swarm recovery
- **Type**: Boolean
- **Default**: `true`
- **Example**: `SWARM_AUTO_RECOVERY=true`

### AGENT_MAX_MEMORY
- **Purpose**: Maximum memory per agent in MB
- **Type**: Number
- **Default**: `512`
- **Example**: `AGENT_MAX_MEMORY=256`

### AGENT_TIMEOUT
- **Purpose**: Agent operation timeout in milliseconds
- **Type**: Number
- **Default**: `60000`
- **Example**: `AGENT_TIMEOUT=45000`

### AGENT_RETRY_ATTEMPTS
- **Purpose**: Number of retry attempts for failed agent operations
- **Type**: Number
- **Default**: `3`
- **Example**: `AGENT_RETRY_ATTEMPTS=2`

### AGENT_SPAWN_DELAY
- **Purpose**: Delay between agent spawns in milliseconds
- **Type**: Number
- **Default**: `1000`
- **Example**: `AGENT_SPAWN_DELAY=500`

### MAX_CONCURRENT_TASKS
- **Purpose**: Maximum concurrent tasks
- **Type**: Number
- **Default**: `50`
- **Example**: `MAX_CONCURRENT_TASKS=100`

### DEFAULT_SWARM_TOPOLOGY
- **Purpose**: Default swarm topology
- **Type**: String
- **Default**: `hierarchical`
- **Valid Values**: `mesh`, `hierarchical`, `ring`, `star`
- **Example**: `DEFAULT_SWARM_TOPOLOGY=mesh`

### DEFAULT_COORDINATION_STRATEGY
- **Purpose**: Default coordination strategy
- **Type**: String
- **Default**: `adaptive`
- **Valid Values**: `parallel`, `sequential`, `adaptive`
- **Example**: `DEFAULT_COORDINATION_STRATEGY=parallel`

### COORDINATION_METRICS_ENABLED
- **Purpose**: Enable coordination metrics collection
- **Type**: Boolean
- **Default**: `true`
- **Example**: `COORDINATION_METRICS_ENABLED=true`

## 📁 File System Configuration

### CLAUDE_WORK_DIR
- **Purpose**: Working directory for temporary files
- **Type**: String (Path)
- **Default**: `./workspace`
- **Example**: `CLAUDE_WORK_DIR=/opt/claude-zen/workspace`
- **Production**: Use absolute path

### CLAUDE_TEMP_DIR
- **Purpose**: Temporary files directory
- **Type**: String (Path)
- **Default**: `./tmp`
- **Example**: `CLAUDE_TEMP_DIR=/tmp/claude-zen`

### CLAUDE_CACHE_DIR
- **Purpose**: Cache files directory
- **Type**: String (Path)
- **Default**: `./cache`
- **Example**: `CLAUDE_CACHE_DIR=/var/cache/claude-zen`

### CLAUDE_CONFIG_DIR
- **Purpose**: Configuration files directory
- **Type**: String (Path)
- **Default**: `./config`
- **Example**: `CLAUDE_CONFIG_DIR=/etc/claude-zen`

### MAX_FILE_SIZE
- **Purpose**: Maximum file upload size
- **Type**: String
- **Default**: `50mb`
- **Example**: `MAX_FILE_SIZE=100mb`

### MAX_FILES_PER_REQUEST
- **Purpose**: Maximum files per upload request
- **Type**: Number
- **Default**: `10`
- **Example**: `MAX_FILES_PER_REQUEST=20`

### ALLOWED_FILE_TYPES
- **Purpose**: Allowed file extensions (comma-separated)
- **Type**: String
- **Default**: `.md,.txt,.js,.ts,.py,.json,.yaml,.yml`
- **Example**: `ALLOWED_FILE_TYPES=.md,.txt,.js,.ts,.py,.json`

### DOCUMENT_PROCESSING_TIMEOUT
- **Purpose**: Document processing timeout in milliseconds
- **Type**: Number
- **Default**: `300000` (5 minutes)
- **Example**: `DOCUMENT_PROCESSING_TIMEOUT=600000`

### DOCUMENT_MAX_SIZE
- **Purpose**: Maximum document size for processing
- **Type**: String
- **Default**: `10mb`
- **Example**: `DOCUMENT_MAX_SIZE=25mb`

### DOCUMENT_SUPPORTED_FORMATS
- **Purpose**: Supported document formats (comma-separated)
- **Type**: String
- **Default**: `md,txt,pdf,docx`
- **Example**: `DOCUMENT_SUPPORTED_FORMATS=md,txt,pdf,docx,pptx`

## 📊 Monitoring & Metrics Configuration

### HEALTH_CHECK_ENABLED
- **Purpose**: Enable health check endpoint
- **Type**: Boolean
- **Default**: `true`
- **Example**: `HEALTH_CHECK_ENABLED=true`

### ENABLE_HEALTH_CHECKS
- **Purpose**: Alternative health check setting
- **Type**: Boolean
- **Default**: Same as `HEALTH_CHECK_ENABLED`
- **Example**: `ENABLE_HEALTH_CHECKS=true`

### HEALTH_CHECK_PATH
- **Purpose**: Health check endpoint path
- **Type**: String
- **Default**: `/health`
- **Example**: `HEALTH_CHECK_PATH=/health`

### HEALTH_CHECK_TIMEOUT
- **Purpose**: Health check timeout in milliseconds
- **Type**: Number
- **Default**: `5000`
- **Example**: `HEALTH_CHECK_TIMEOUT=10000`

### METRICS_ENABLED
- **Purpose**: Enable metrics collection
- **Type**: Boolean
- **Default**: `true`
- **Example**: `METRICS_ENABLED=true`

### ENABLE_METRICS
- **Purpose**: Alternative metrics setting
- **Type**: Boolean
- **Default**: Same as `METRICS_ENABLED`
- **Example**: `ENABLE_METRICS=true`

### METRICS_ENDPOINT
- **Purpose**: Metrics endpoint path
- **Type**: String
- **Default**: `/metrics`
- **Example**: `METRICS_ENDPOINT=/prometheus`

### METRICS_INTERVAL
- **Purpose**: Metrics collection interval in milliseconds
- **Type**: Number
- **Default**: `60000`
- **Example**: `METRICS_INTERVAL=30000`

### METRICS_RETENTION
- **Purpose**: Metrics retention period in milliseconds
- **Type**: Number
- **Default**: `604800000` (7 days)
- **Example**: `METRICS_RETENTION=2592000000`

### PERFORMANCE_MONITORING
- **Purpose**: Enable performance monitoring
- **Type**: Boolean
- **Default**: `true`
- **Example**: `PERFORMANCE_MONITORING=true`

### PERFORMANCE_THRESHOLD_CPU
- **Purpose**: CPU usage threshold for alerts (percentage)
- **Type**: Number
- **Default**: `80`
- **Example**: `PERFORMANCE_THRESHOLD_CPU=70`

### PERFORMANCE_THRESHOLD_MEMORY
- **Purpose**: Memory usage threshold for alerts (percentage)
- **Type**: Number
- **Default**: `85`
- **Example**: `PERFORMANCE_THRESHOLD_MEMORY=80`

### PERFORMANCE_ALERT_WEBHOOK
- **Purpose**: Webhook URL for performance alerts
- **Type**: String (URL)
- **Default**: None (optional)
- **Example**: `PERFORMANCE_ALERT_WEBHOOK=https://alerts.example.com/webhook`

### PROMETHEUS_PORT
- **Purpose**: Prometheus metrics server port
- **Type**: Number
- **Default**: `9090`
- **Example**: `PROMETHEUS_PORT=9091`

### GRAFANA_PORT
- **Purpose**: Grafana dashboard port
- **Type**: Number
- **Default**: `3001`
- **Example**: `GRAFANA_PORT=3002`

### GRAFANA_USER
- **Purpose**: Grafana admin username
- **Type**: String
- **Default**: `admin`
- **Example**: `GRAFANA_USER=claude-admin`

### GRAFANA_PASSWORD
- **Purpose**: Grafana admin password
- **Type**: String
- **Default**: `admin`
- **Example**: `GRAFANA_PASSWORD=secure_grafana_password`
- **Security**: Change from default in production

### DATADOG_API_KEY
- **Purpose**: Datadog API key for external monitoring
- **Type**: String
- **Default**: None (optional)
- **Example**: `DATADOG_API_KEY=your-datadog-api-key`

### NEW_RELIC_LICENSE_KEY
- **Purpose**: New Relic license key
- **Type**: String
- **Default**: None (optional)
- **Example**: `NEW_RELIC_LICENSE_KEY=your-newrelic-key`

### SENTRY_DSN
- **Purpose**: Sentry DSN for error tracking
- **Type**: String (URL)
- **Default**: None (optional)
- **Example**: `SENTRY_DSN=https://your-sentry-dsn-here`

## 💾 Backup & Recovery Configuration

### BACKUP_ENABLED
- **Purpose**: Enable automatic backups
- **Type**: Boolean
- **Default**: `false` (development), `true` (production)
- **Example**: `BACKUP_ENABLED=true`

### BACKUP_INTERVAL
- **Purpose**: Backup interval in milliseconds
- **Type**: Number
- **Default**: `21600000` (6 hours)
- **Example**: `BACKUP_INTERVAL=43200000`

### BACKUP_RETENTION
- **Purpose**: Backup retention period in milliseconds
- **Type**: Number
- **Default**: `604800000` (7 days)
- **Example**: `BACKUP_RETENTION=2592000000`

### BACKUP_RETENTION_DAYS
- **Purpose**: Backup retention period in days
- **Type**: Number
- **Default**: `7`
- **Example**: `BACKUP_RETENTION_DAYS=30`

### BACKUP_LOCATION
- **Purpose**: Local backup directory
- **Type**: String (Path)
- **Default**: `./backups`
- **Example**: `BACKUP_LOCATION=/opt/backups/claude-zen`

### BACKUP_COMPRESSION
- **Purpose**: Enable backup compression
- **Type**: Boolean
- **Default**: `true`
- **Example**: `BACKUP_COMPRESSION=true`

### BACKUP_SCHEDULE
- **Purpose**: Cron schedule for backups
- **Type**: String (Cron Expression)
- **Default**: `0 2 * * *` (2 AM daily)
- **Example**: `BACKUP_SCHEDULE=0 */6 * * *`

### BACKUP_S3_BUCKET
- **Purpose**: AWS S3 bucket for cloud backups
- **Type**: String
- **Default**: None (optional)
- **Example**: `BACKUP_S3_BUCKET=claude-zen-backups`

### AWS_ACCESS_KEY_ID
- **Purpose**: AWS access key for S3 backups
- **Type**: String
- **Default**: None (optional)
- **Example**: `AWS_ACCESS_KEY_ID=AKIA...`
- **Security**: Use IAM roles when possible

### AWS_SECRET_ACCESS_KEY
- **Purpose**: AWS secret key for S3 backups
- **Type**: String
- **Default**: None (optional)
- **Example**: `AWS_SECRET_ACCESS_KEY=your-secret-key`
- **Security**: Store securely, use IAM roles when possible

### AWS_REGION
- **Purpose**: AWS region for S3 backups
- **Type**: String
- **Default**: `us-east-1`
- **Example**: `AWS_REGION=eu-west-1`

### RECOVERY_ENABLED
- **Purpose**: Enable automatic recovery features
- **Type**: Boolean
- **Default**: `true`
- **Example**: `RECOVERY_ENABLED=true`

### RECOVERY_CHECKPOINT_INTERVAL
- **Purpose**: Recovery checkpoint interval in milliseconds
- **Type**: Number
- **Default**: `3600000` (1 hour)
- **Example**: `RECOVERY_CHECKPOINT_INTERVAL=1800000`

### RECOVERY_MAX_RETRIES
- **Purpose**: Maximum recovery retry attempts
- **Type**: Number
- **Default**: `5`
- **Example**: `RECOVERY_MAX_RETRIES=3`

## 🚩 Feature Flags

### MCP_HTTP_ENABLED
- **Purpose**: Enable HTTP MCP server
- **Type**: Boolean
- **Default**: `true`
- **Example**: `MCP_HTTP_ENABLED=true`

### MCP_STDIO_ENABLED
- **Purpose**: Enable stdio MCP server
- **Type**: Boolean
- **Default**: `true`
- **Example**: `MCP_STDIO_ENABLED=true`

### MCP_WEBSOCKET_ENABLED
- **Purpose**: Enable WebSocket MCP support
- **Type**: Boolean
- **Default**: `true`
- **Example**: `MCP_WEBSOCKET_ENABLED=true`

### WEB_DASHBOARD_ENABLED
- **Purpose**: Enable web dashboard interface
- **Type**: Boolean
- **Default**: `true`
- **Example**: `WEB_DASHBOARD_ENABLED=true`

### TUI_ENABLED
- **Purpose**: Enable terminal UI interface
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `TUI_ENABLED=false`

### CLI_ENABLED
- **Purpose**: Enable command-line interface
- **Type**: Boolean
- **Default**: `true`
- **Example**: `CLI_ENABLED=true`

### NEURAL_PROCESSING_ENABLED
- **Purpose**: Enable neural network processing
- **Type**: Boolean
- **Default**: `true`
- **Example**: `NEURAL_PROCESSING_ENABLED=true`

### SWARM_COORDINATION_ENABLED
- **Purpose**: Enable swarm coordination features
- **Type**: Boolean
- **Default**: `true`
- **Example**: `SWARM_COORDINATION_ENABLED=true`

### DOCUMENT_PROCESSING_ENABLED
- **Purpose**: Enable document processing features
- **Type**: Boolean
- **Default**: `true`
- **Example**: `DOCUMENT_PROCESSING_ENABLED=true`

### GITHUB_INTEGRATION_ENABLED
- **Purpose**: Enable GitHub integration features
- **Type**: Boolean
- **Default**: `true`
- **Example**: `GITHUB_INTEGRATION_ENABLED=true`

### REAL_TIME_UPDATES_ENABLED
- **Purpose**: Enable real-time updates via WebSocket
- **Type**: Boolean
- **Default**: `true`
- **Example**: `REAL_TIME_UPDATES_ENABLED=true`

### WEBHOOK_PROCESSING_ENABLED
- **Purpose**: Enable webhook processing
- **Type**: Boolean
- **Default**: `true`
- **Example**: `WEBHOOK_PROCESSING_ENABLED=true`

### ENABLE_WEBSOCKET
- **Purpose**: Alternative WebSocket enable flag
- **Type**: Boolean
- **Default**: Same as `REAL_TIME_UPDATES_ENABLED`
- **Example**: `ENABLE_WEBSOCKET=true`

### ENABLE_ALL_TOOLS
- **Purpose**: Enable all MCP tools
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_ALL_TOOLS=true`

### ENABLE_GIT_TOOLS
- **Purpose**: Enable Git-related MCP tools
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_GIT_TOOLS=true`

### ENABLE_GPU
- **Purpose**: Enable GPU acceleration
- **Type**: Boolean
- **Default**: `false`
- **Example**: `ENABLE_GPU=true`
- **Hardware**: Requires compatible GPU and drivers

### ENABLE_SIMD
- **Purpose**: Enable SIMD optimizations
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_SIMD=true`

### ENABLE_NEURAL_NETWORKS
- **Purpose**: Enable neural network features
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_NEURAL_NETWORKS=true`

### ENABLE_VECTOR_SEARCH
- **Purpose**: Enable vector search capabilities
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_VECTOR_SEARCH=true`

### ENABLE_GRAPH_ANALYSIS
- **Purpose**: Enable graph analysis features
- **Type**: Boolean
- **Default**: `true`
- **Example**: `ENABLE_GRAPH_ANALYSIS=true`

### ENABLE_VISION_PIPELINE
- **Purpose**: Enable vision processing pipeline
- **Type**: Boolean
- **Default**: `false`
- **Example**: `ENABLE_VISION_PIPELINE=true`

## 🔧 Development & Debugging

### DEBUG
- **Purpose**: Enable debug mode
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `DEBUG=false`

### DEBUG_ENABLED
- **Purpose**: Alternative debug flag
- **Type**: Boolean
- **Default**: Same as `DEBUG`
- **Example**: `DEBUG_ENABLED=false`

### DEBUG_VERBOSE
- **Purpose**: Enable verbose debug output
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `DEBUG_VERBOSE=false`

### DEBUG_TRACE_REQUESTS
- **Purpose**: Trace all HTTP requests
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `DEBUG_TRACE_REQUESTS=false`
- **Security**: Disable in production to avoid logging sensitive data

### DEBUG_MEMORY_LEAKS
- **Purpose**: Enable memory leak detection
- **Type**: Boolean
- **Default**: `false`
- **Example**: `DEBUG_MEMORY_LEAKS=true`

### VERBOSE_LOGGING
- **Purpose**: Enable verbose logging
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `VERBOSE_LOGGING=false`

### ENABLE_PROFILING
- **Purpose**: Enable performance profiling
- **Type**: Boolean
- **Default**: `false`
- **Example**: `ENABLE_PROFILING=true`

### ENABLE_TRACING
- **Purpose**: Enable request tracing
- **Type**: Boolean
- **Default**: `false`
- **Example**: `ENABLE_TRACING=true`

### DEV_TOOLS_ENABLED
- **Purpose**: Enable development tools
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `DEV_TOOLS_ENABLED=false`

### HOT_RELOAD_ENABLED
- **Purpose**: Enable hot reload for development
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `HOT_RELOAD_ENABLED=false`

### SOURCE_MAPS_ENABLED
- **Purpose**: Enable source maps
- **Type**: Boolean
- **Default**: `true` (development), `false` (production)
- **Example**: `SOURCE_MAPS_ENABLED=false`

## 🐳 Docker Specific Variables

### DOCKER_REGISTRY
- **Purpose**: Docker registry URL
- **Type**: String (URL)
- **Default**: None (optional)
- **Example**: `DOCKER_REGISTRY=registry.example.com`

### DOCKER_IMAGE_TAG
- **Purpose**: Docker image tag
- **Type**: String
- **Default**: `latest`
- **Example**: `DOCKER_IMAGE_TAG=2.0.0`

### WORKER_THREADS
- **Purpose**: Number of worker threads
- **Type**: Number
- **Default**: `4`
- **Example**: `WORKER_THREADS=8`

## ☸️ Kubernetes Specific Variables

### KUBERNETES_SERVICE_HOST
- **Purpose**: Kubernetes API server host (auto-set)
- **Type**: String (IP Address)
- **Default**: Auto-detected
- **Example**: `KUBERNETES_SERVICE_HOST=10.96.0.1`

### KUBERNETES_SERVICE_PORT
- **Purpose**: Kubernetes API server port (auto-set)
- **Type**: Number
- **Default**: Auto-detected
- **Example**: `KUBERNETES_SERVICE_PORT=443`

### POD_NAME
- **Purpose**: Current pod name (from downward API)
- **Type**: String
- **Default**: None
- **Example**: `POD_NAME=claude-zen-deployment-abc123`

### POD_NAMESPACE
- **Purpose**: Current pod namespace (from downward API)
- **Type**: String
- **Default**: `default`
- **Example**: `POD_NAMESPACE=claude-zen`

### NODE_NAME
- **Purpose**: Current node name (from downward API)
- **Type**: String
- **Default**: None
- **Example**: `NODE_NAME=worker-node-1`

## 🔗 Webhook & External Services

### WEBHOOK_URL
- **Purpose**: Primary webhook endpoint URL
- **Type**: String (URL)
- **Default**: None (optional)
- **Example**: `WEBHOOK_URL=https://your-webhook-endpoint.com`

### SLACK_WEBHOOK_URL
- **Purpose**: Slack webhook URL for notifications
- **Type**: String (URL)
- **Default**: None (optional)
- **Example**: `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`

### DISCORD_WEBHOOK_URL
- **Purpose**: Discord webhook URL for notifications
- **Type**: String (URL)
- **Default**: None (optional)
- **Example**: `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...`

## 🌍 System Configuration

### TZ
- **Purpose**: System timezone
- **Type**: String
- **Default**: `UTC`
- **Example**: `TZ=America/New_York`
- **Production**: Use UTC for consistency

### LANG
- **Purpose**: System language and locale
- **Type**: String
- **Default**: `en_US.UTF-8`
- **Example**: `LANG=en_US.UTF-8`

### LC_ALL
- **Purpose**: System locale setting
- **Type**: String
- **Default**: `en_US.UTF-8`
- **Example**: `LC_ALL=en_US.UTF-8`

## 📝 Environment File Examples

### Production Environment
```bash
# Copy .env.production to .env and customize
cp .env.production .env
```

### Development Environment
```bash
# Copy .env.development to .env
cp .env.development .env
```

### Docker Environment
```bash
# Copy .env.docker to .env for Docker deployments
cp .env.docker .env
```

## 🔍 Validation

Use the configuration validation script to check your environment:

```bash
# Validate configuration
npm run validate-config

# Or use the validation script directly
node scripts/validate-config.js
```

## 📚 Additional Resources

- [Production Setup Guide](./PRODUCTION_SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Security Best Practices](../security/security-policy.md)
- [Performance Tuning Guide](../performance/performance-analysis.md)