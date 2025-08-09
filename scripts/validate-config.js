#!/usr/bin/env node

/**
 * Claude-Zen Configuration Validation Script
 *
 * Validates environment configuration for production deployment
 *
 * Usage:
 *   node scripts/validate-config.js
 *   npm run validate-config
 *
 * Options:
 *   --env production|development|docker  # Environment to validate
 *   --file path/to/.env                  # Custom .env file
 *   --strict                             # Enable strict validation
 *   --output json|table                  # Output format
 *   --fix                                # Attempt to fix issues
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parse } = require('url');

// ANSI color codes for output formatting
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

class ConfigValidator {
  constructor(options = {}) {
    this.options = {
      env: options.env || process.env.NODE_ENV || 'development',
      envFile: options.file || '.env',
      strict: options.strict || false,
      output: options.output || 'table',
      fix: options.fix || false,
      ...options,
    };

    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.config = {};
    this.fixes = [];
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log(
      `${colors.blue}${colors.bold}🔍 Claude-Zen Configuration Validator${colors.reset}\n`
    );

    try {
      // Load configuration
      this.loadConfiguration();

      // Run validation checks
      this.validateCore();
      this.validateLogging();
      this.validateNetwork();
      this.validateSecurity();
      this.validateAIServices();
      this.validateDatabase();
      this.validateCaching();
      this.validateSwarm();
      this.validateFileSystem();
      this.validateMonitoring();
      this.validateFeatureFlags();
      this.validateEnvironmentSpecific();

      // Apply fixes if requested
      if (this.options.fix && this.fixes.length > 0) {
        this.applyFixes();
      }

      // Output results
      this.outputResults();

      // Exit with appropriate code
      const exitCode = this.errors.length > 0 ? 1 : 0;
      process.exit(exitCode);
    } catch (error) {
      console.error(`${colors.red}❌ Validation failed: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Load configuration from environment and .env file
   */
  loadConfiguration() {
    // Load .env file if exists
    const envPath = path.resolve(this.options.envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = this.parseEnvFile(envContent);
      Object.assign(this.config, envVars);
      this.info.push(`Loaded configuration from ${envPath}`);
    } else {
      this.warnings.push(`Environment file ${envPath} not found`);
    }

    // Load from process environment (higher priority)
    Object.assign(this.config, process.env);
  }

  /**
   * Parse .env file content
   */
  parseEnvFile(content) {
    const vars = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          vars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
      }
    }

    return vars;
  }

  /**
   * Validate core system configuration
   */
  validateCore() {
    this.checkRequired('NODE_ENV', 'Node.js environment');
    this.checkRequired('APP_NAME', 'Application name');

    // Validate NODE_ENV
    const validEnvs = ['production', 'development', 'testing'];
    if (!validEnvs.includes(this.config.NODE_ENV)) {
      this.errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    }

    // Validate NODE_OPTIONS
    const nodeOptions = this.config.NODE_OPTIONS;
    if (nodeOptions) {
      if (!nodeOptions.includes('--max-old-space-size')) {
        this.warnings.push(
          'NODE_OPTIONS should include --max-old-space-size for memory management'
        );
        this.fixes.push({
          key: 'NODE_OPTIONS',
          current: nodeOptions,
          suggested: `${nodeOptions} --max-old-space-size=4096`,
          reason: 'Add memory management option',
        });
      }
    }

    // Check instance ID for production
    if (this.config.NODE_ENV === 'production' && !this.config.CLAUDE_INSTANCE_ID) {
      this.warnings.push('CLAUDE_INSTANCE_ID recommended for production deployments');
    }
  }

  /**
   * Validate logging configuration
   */
  validateLogging() {
    // Log level validation
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    const logLevel = this.config.CLAUDE_LOG_LEVEL || this.config.LOG_LEVEL;
    if (logLevel && !validLogLevels.includes(logLevel)) {
      this.errors.push(`Log level must be one of: ${validLogLevels.join(', ')}`);
    }

    // Production logging recommendations
    if (this.config.NODE_ENV === 'production') {
      if (this.config.CLAUDE_LOG_CONSOLE !== 'false') {
        this.warnings.push('CLAUDE_LOG_CONSOLE should be false in production');
        this.fixes.push({
          key: 'CLAUDE_LOG_CONSOLE',
          current: this.config.CLAUDE_LOG_CONSOLE,
          suggested: 'false',
          reason: 'Disable console logging in production',
        });
      }

      if (this.config.CLAUDE_LOG_FILE !== 'true') {
        this.warnings.push('CLAUDE_LOG_FILE should be true in production');
        this.fixes.push({
          key: 'CLAUDE_LOG_FILE',
          current: this.config.CLAUDE_LOG_FILE,
          suggested: 'true',
          reason: 'Enable file logging in production',
        });
      }

      if (this.config.LOG_FORMAT !== 'json') {
        this.warnings.push('LOG_FORMAT should be json in production for log aggregation');
      }
    }

    // Validate log paths
    const logDir = this.config.CLAUDE_LOG_DIR;
    if (logDir && !path.isAbsolute(logDir) && this.config.NODE_ENV === 'production') {
      this.warnings.push('CLAUDE_LOG_DIR should be an absolute path in production');
    }
  }

  /**
   * Validate network configuration
   */
  validateNetwork() {
    // Check required ports
    this.checkNumeric('CLAUDE_MCP_PORT', 'MCP server port', 1024, 65535);
    this.checkNumeric('CLAUDE_WEB_PORT', 'Web dashboard port', 1024, 65535);

    // Check host bindings
    const mcpHost = this.config.CLAUDE_MCP_HOST;
    const webHost = this.config.CLAUDE_WEB_HOST;

    if (this.config.NODE_ENV === 'production') {
      if (mcpHost === 'localhost' || webHost === 'localhost') {
        this.warnings.push('Host bindings set to localhost - may not be accessible externally');
      }
    }

    // Validate timeout values
    this.checkNumeric('CLAUDE_MCP_TIMEOUT', 'MCP timeout', 5000, 300000);
    this.checkNumeric('CLAUDE_WS_HEARTBEAT_INTERVAL', 'WebSocket heartbeat interval', 5000, 120000);
    this.checkNumeric('CLAUDE_WS_MAX_CONNECTIONS', 'WebSocket max connections', 1, 10000);

    // Check CORS configuration
    const corsOrigin = this.config.CORS_ORIGIN || this.config.CLAUDE_MCP_CORS_ORIGIN;
    if (this.config.NODE_ENV === 'production' && corsOrigin === '*') {
      this.warnings.push('CORS_ORIGIN set to * in production - security risk');
      this.fixes.push({
        key: 'CORS_ORIGIN',
        current: '*',
        suggested: 'https://your-domain.com',
        reason: 'Restrict CORS to specific domain for security',
      });
    }
  }

  /**
   * Validate security configuration
   */
  validateSecurity() {
    // JWT Secret validation
    const jwtSecret = this.config.JWT_SECRET;
    if (!jwtSecret) {
      this.errors.push('JWT_SECRET is required for authentication');
    } else {
      if (jwtSecret.length < 32) {
        this.errors.push('JWT_SECRET must be at least 32 characters long');
        this.fixes.push({
          key: 'JWT_SECRET',
          current: `${jwtSecret.substring(0, 10)}...`,
          suggested: this.generateSecureSecret(64),
          reason: 'Generate stronger JWT secret',
        });
      }

      // Check for weak secrets
      const weakSecrets = ['your-jwt-secret', 'change-me', 'secret', 'password', '12345', 'admin'];
      if (weakSecrets.some((weak) => jwtSecret.toLowerCase().includes(weak))) {
        this.errors.push('JWT_SECRET appears to be a default/weak value');
      }
    }

    // Encryption key validation
    const encryptionKey = this.config.ENCRYPTION_KEY;
    if (!encryptionKey) {
      this.errors.push('ENCRYPTION_KEY is required');
    } else if (encryptionKey.length !== 32) {
      this.errors.push('ENCRYPTION_KEY must be exactly 32 characters long');
      this.fixes.push({
        key: 'ENCRYPTION_KEY',
        current: `${encryptionKey.substring(0, 10)}...`,
        suggested: this.generateSecureSecret(32),
        reason: 'Generate 32-character encryption key',
      });
    }

    // Session secret validation
    const sessionSecret = this.config.SESSION_SECRET;
    if (!sessionSecret || sessionSecret.length < 32) {
      this.warnings.push('SESSION_SECRET should be at least 32 characters long');
      this.fixes.push({
        key: 'SESSION_SECRET',
        current: sessionSecret || 'not set',
        suggested: this.generateSecureSecret(32),
        reason: 'Generate secure session secret',
      });
    }

    // HTTPS validation for production
    if (this.config.NODE_ENV === 'production') {
      if (this.config.FORCE_HTTPS !== 'true') {
        this.warnings.push('FORCE_HTTPS should be true in production');
        this.fixes.push({
          key: 'FORCE_HTTPS',
          current: this.config.FORCE_HTTPS || 'not set',
          suggested: 'true',
          reason: 'Enforce HTTPS in production',
        });
      }

      if (this.config.SESSION_SECURE !== 'true') {
        this.warnings.push('SESSION_SECURE should be true in production');
      }
    }

    // Rate limiting validation
    this.checkNumeric('RATE_LIMIT_MAX_REQUESTS', 'Rate limit requests', 1, 10000);
    this.checkNumeric('RATE_LIMIT_WINDOW', 'Rate limit window', 1000, 3600000);
  }

  /**
   * Validate AI services configuration
   */
  validateAIServices() {
    // Anthropic API key
    const anthropicKey = this.config.ANTHROPIC_API_KEY || this.config.CLAUDE_API_KEY;
    if (!anthropicKey) {
      this.errors.push('ANTHROPIC_API_KEY is required for AI functionality');
    } else {
      if (!anthropicKey.startsWith('sk-ant-api03-')) {
        this.warnings.push('ANTHROPIC_API_KEY format may be incorrect');
      }

      if (anthropicKey.includes('your-') || anthropicKey.includes('replace')) {
        this.errors.push('ANTHROPIC_API_KEY appears to be a placeholder value');
      }
    }

    // OpenAI key (optional but recommended for failover)
    const openaiKey = this.config.OPENAI_API_KEY;
    if (!openaiKey && this.config.AI_FAILOVER_ENABLED === 'true') {
      this.warnings.push('OPENAI_API_KEY recommended when AI_FAILOVER_ENABLED is true');
    }

    // GitHub token validation
    const githubToken = this.config.GITHUB_TOKEN;
    if (githubToken && !githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_')) {
      this.warnings.push('GITHUB_TOKEN format may be incorrect');
    }

    // AI service timeouts
    this.checkNumeric('ANTHROPIC_TIMEOUT', 'Anthropic timeout', 5000, 300000);
    this.checkNumeric('AI_RETRY_ATTEMPTS', 'AI retry attempts', 0, 10);
    this.checkNumeric('AI_RETRY_DELAY', 'AI retry delay', 100, 10000);

    // Temperature validation
    this.checkFloat('ANTHROPIC_TEMPERATURE', 'Anthropic temperature', 0.0, 1.0);
    this.checkFloat('OPENAI_TEMPERATURE', 'OpenAI temperature', 0.0, 1.0);
  }

  /**
   * Validate database configuration
   */
  validateDatabase() {
    const databaseUrl = this.config.DATABASE_URL || this.config.POSTGRES_URL;

    if (!databaseUrl && !this.config.SQLITE_DB_PATH) {
      this.errors.push('Either DATABASE_URL or SQLITE_DB_PATH must be configured');
      return;
    }

    // Validate PostgreSQL connection string
    if (databaseUrl) {
      try {
        const parsed = new URL(databaseUrl);

        if (parsed.protocol !== 'postgresql:') {
          this.errors.push('DATABASE_URL must use postgresql:// protocol');
        }

        if (!parsed.hostname) {
          this.errors.push('DATABASE_URL must include hostname');
        }

        if (!parsed.pathname || parsed.pathname === '/') {
          this.errors.push('DATABASE_URL must include database name');
        }

        if (parsed.password && parsed.password.includes('password')) {
          this.warnings.push('Database password appears to be default/weak');
        }

        // SSL mode validation for production
        if (this.config.NODE_ENV === 'production' && this.config.DATABASE_SSL !== 'require') {
          this.warnings.push('DATABASE_SSL should be "require" in production');
        }
      } catch (error) {
        this.errors.push(`Invalid DATABASE_URL format: ${error.message}`);
      }
    }

    // Connection pool validation
    this.checkNumeric('DATABASE_POOL_MIN', 'DB pool min', 1, 100);
    this.checkNumeric('DATABASE_POOL_MAX', 'DB pool max', 1, 1000);

    const poolMin = parseInt(this.config.DATABASE_POOL_MIN) || 5;
    const poolMax = parseInt(this.config.DATABASE_POOL_MAX) || 20;
    if (poolMin >= poolMax) {
      this.errors.push('DATABASE_POOL_MIN must be less than DATABASE_POOL_MAX');
    }

    // Vector database validation
    this.checkNumeric('VECTOR_DIMENSION', 'Vector dimension', 1, 8192);

    const vectorMetric = this.config.VECTOR_METRIC;
    if (vectorMetric && !['cosine', 'euclidean', 'dot'].includes(vectorMetric)) {
      this.errors.push('VECTOR_METRIC must be one of: cosine, euclidean, dot');
    }

    // Migration settings for production
    if (this.config.NODE_ENV === 'production') {
      if (this.config.DATABASE_AUTO_MIGRATE === 'true') {
        this.warnings.push('DATABASE_AUTO_MIGRATE should be false in production');
      }
    }
  }

  /**
   * Validate caching configuration
   */
  validateCaching() {
    const redisUrl = this.config.REDIS_URL;

    if (redisUrl) {
      try {
        const parsed = new URL(redisUrl);

        if (parsed.protocol !== 'redis:') {
          this.errors.push('REDIS_URL must use redis:// protocol');
        }

        if (parsed.password && (parsed.password === 'password' || parsed.password.length < 8)) {
          this.warnings.push('Redis password appears to be weak');
        }
      } catch (error) {
        this.errors.push(`Invalid REDIS_URL format: ${error.message}`);
      }
    }

    // Memory cache settings
    this.checkNumeric('MEMORY_CACHE_SIZE', 'Memory cache size', 10, 100000);
    this.checkNumeric('MEMORY_CACHE_SIZE_MB', 'Memory cache MB', 1, 10240);
    this.checkNumeric('MEMORY_CACHE_TTL', 'Memory cache TTL', 1000, 86400000);

    // Connection pool
    this.checkNumeric('REDIS_POOL_SIZE', 'Redis pool size', 1, 100);

    // Session store validation
    const sessionStore = this.config.SESSION_STORE;
    if (sessionStore && !['memory', 'redis', 'database'].includes(sessionStore)) {
      this.errors.push('SESSION_STORE must be one of: memory, redis, database');
    }

    if (this.config.NODE_ENV === 'production' && sessionStore === 'memory') {
      this.warnings.push('SESSION_STORE should not be memory in production (not scalable)');
    }
  }

  /**
   * Validate swarm configuration
   */
  validateSwarm() {
    this.checkNumeric('SWARM_MAX_AGENTS', 'Max swarm agents', 1, 1000);
    this.checkNumeric('MAX_AGENTS', 'Global max agents', 1, 10000);
    this.checkNumeric('DEFAULT_SWARM_SIZE', 'Default swarm size', 1, 100);
    this.checkNumeric('MAX_CONCURRENT_TASKS', 'Max concurrent tasks', 1, 1000);

    // Agent limits
    this.checkNumeric('AGENT_MAX_MEMORY', 'Agent max memory MB', 64, 8192);
    this.checkNumeric('AGENT_TIMEOUT', 'Agent timeout', 5000, 600000);
    this.checkNumeric('AGENT_RETRY_ATTEMPTS', 'Agent retry attempts', 0, 10);

    // Topology validation
    const topology = this.config.DEFAULT_SWARM_TOPOLOGY;
    if (topology && !['mesh', 'hierarchical', 'ring', 'star'].includes(topology)) {
      this.errors.push('DEFAULT_SWARM_TOPOLOGY must be one of: mesh, hierarchical, ring, star');
    }

    // Strategy validation
    const strategy = this.config.DEFAULT_COORDINATION_STRATEGY;
    if (strategy && !['parallel', 'sequential', 'adaptive'].includes(strategy)) {
      this.errors.push(
        'DEFAULT_COORDINATION_STRATEGY must be one of: parallel, sequential, adaptive'
      );
    }

    // Performance recommendations
    const maxAgents = parseInt(this.config.SWARM_MAX_AGENTS) || 50;
    const maxMemory = parseInt(this.config.AGENT_MAX_MEMORY) || 512;
    const totalMemory = maxAgents * maxMemory;

    if (totalMemory > 16384) {
      // 16GB
      this.warnings.push(`Swarm configuration may require ${Math.ceil(totalMemory / 1024)}GB RAM`);
    }
  }

  /**
   * Validate file system configuration
   */
  validateFileSystem() {
    // Check directory paths
    const dirs = ['CLAUDE_WORK_DIR', 'CLAUDE_TEMP_DIR', 'CLAUDE_CACHE_DIR', 'CLAUDE_CONFIG_DIR'];

    for (const dir of dirs) {
      const path = this.config[dir];
      if (path && !path.startsWith('/') && this.config.NODE_ENV === 'production') {
        this.warnings.push(`${dir} should be an absolute path in production`);
      }
    }

    // File size validation
    const maxFileSize = this.config.MAX_FILE_SIZE;
    if (maxFileSize && !this.isValidSize(maxFileSize)) {
      this.errors.push('MAX_FILE_SIZE must be in format like "50mb", "1gb"');
    }

    const documentMaxSize = this.config.DOCUMENT_MAX_SIZE;
    if (documentMaxSize && !this.isValidSize(documentMaxSize)) {
      this.errors.push('DOCUMENT_MAX_SIZE must be in format like "10mb", "100mb"');
    }

    // File limits
    this.checkNumeric('MAX_FILES_PER_REQUEST', 'Max files per request', 1, 100);
    this.checkNumeric('DOCUMENT_PROCESSING_TIMEOUT', 'Document processing timeout', 5000, 1800000);
  }

  /**
   * Validate monitoring configuration
   */
  validateMonitoring() {
    // Health check settings
    this.checkNumeric('HEALTH_CHECK_TIMEOUT', 'Health check timeout', 1000, 30000);
    this.checkNumeric('METRICS_INTERVAL', 'Metrics interval', 5000, 300000);

    // Performance thresholds
    this.checkNumeric('PERFORMANCE_THRESHOLD_CPU', 'CPU threshold', 50, 100);
    this.checkNumeric('PERFORMANCE_THRESHOLD_MEMORY', 'Memory threshold', 50, 100);

    // Prometheus port
    this.checkNumeric('PROMETHEUS_PORT', 'Prometheus port', 1024, 65535);

    // External monitoring keys validation
    const datadogKey = this.config.DATADOG_API_KEY;
    if (datadogKey && datadogKey.includes('your-')) {
      this.warnings.push('DATADOG_API_KEY appears to be a placeholder value');
    }

    const sentryDsn = this.config.SENTRY_DSN;
    if (sentryDsn) {
      try {
        new URL(sentryDsn);
      } catch (error) {
        this.errors.push('SENTRY_DSN must be a valid URL');
      }
    }
  }

  /**
   * Validate feature flags
   */
  validateFeatureFlags() {
    // Boolean feature flags
    const booleanFlags = [
      'MCP_HTTP_ENABLED',
      'MCP_STDIO_ENABLED',
      'WEB_DASHBOARD_ENABLED',
      'TUI_ENABLED',
      'CLI_ENABLED',
      'NEURAL_PROCESSING_ENABLED',
      'SWARM_COORDINATION_ENABLED',
      'DOCUMENT_PROCESSING_ENABLED',
      'GITHUB_INTEGRATION_ENABLED',
      'REAL_TIME_UPDATES_ENABLED',
      'ENABLE_WEBSOCKET',
      'ENABLE_GPU',
      'ENABLE_SIMD',
      'ENABLE_NEURAL_NETWORKS',
      'ENABLE_VECTOR_SEARCH',
      'DEBUG',
      'DEBUG_ENABLED',
      'DEV_TOOLS_ENABLED',
    ];

    for (const flag of booleanFlags) {
      const value = this.config[flag];
      if (value && !['true', 'false'].includes(value.toLowerCase())) {
        this.warnings.push(`${flag} should be 'true' or 'false'`);
      }
    }

    // Production recommendations
    if (this.config.NODE_ENV === 'production') {
      const productionFlags = {
        DEBUG: 'false',
        DEBUG_ENABLED: 'false',
        DEV_TOOLS_ENABLED: 'false',
        TUI_ENABLED: 'false',
      };

      for (const [flag, expected] of Object.entries(productionFlags)) {
        if (this.config[flag] === 'true') {
          this.warnings.push(`${flag} should be ${expected} in production`);
          this.fixes.push({
            key: flag,
            current: this.config[flag],
            suggested: expected,
            reason: 'Production security/performance recommendation',
          });
        }
      }
    }
  }

  /**
   * Environment-specific validations
   */
  validateEnvironmentSpecific() {
    const env = this.config.NODE_ENV;

    if (env === 'production') {
      this.validateProduction();
    } else if (env === 'development') {
      this.validateDevelopment();
    }

    // Docker-specific checks
    if (this.config.DOCKER_REGISTRY || process.env.DOCKER_REGISTRY) {
      this.validateDocker();
    }

    // Kubernetes-specific checks
    if (this.config.KUBERNETES_SERVICE_HOST || process.env.KUBERNETES_SERVICE_HOST) {
      this.validateKubernetes();
    }
  }

  /**
   * Production-specific validations
   */
  validateProduction() {
    const requiredProd = ['ANTHROPIC_API_KEY', 'JWT_SECRET', 'ENCRYPTION_KEY', 'DATABASE_URL'];

    for (const key of requiredProd) {
      if (!this.config[key]) {
        this.errors.push(`${key} is required in production`);
      }
    }

    // Security recommendations
    if (!this.config.CORS_ORIGIN || this.config.CORS_ORIGIN === '*') {
      this.warnings.push('CORS_ORIGIN should be set to specific domain(s) in production');
    }

    // Performance recommendations
    if (!this.config.NODE_OPTIONS || !this.config.NODE_OPTIONS.includes('--max-old-space-size')) {
      this.warnings.push('NODE_OPTIONS should include --max-old-space-size for production');
    }

    // Backup configuration
    if (this.config.BACKUP_ENABLED !== 'true') {
      this.warnings.push('BACKUP_ENABLED should be true in production');
    }
  }

  /**
   * Development-specific validations
   */
  validateDevelopment() {
    // Development recommendations
    if (this.config.CLAUDE_LOG_LEVEL === 'error') {
      this.info.push('Consider using debug or info log level in development');
    }

    if (this.config.FORCE_HTTPS === 'true') {
      this.info.push('FORCE_HTTPS can be disabled in development for easier testing');
    }
  }

  /**
   * Docker-specific validations
   */
  validateDocker() {
    // Host binding recommendations
    if (this.config.CLAUDE_MCP_HOST === 'localhost') {
      this.warnings.push('CLAUDE_MCP_HOST should be 0.0.0.0 for Docker containers');
      this.fixes.push({
        key: 'CLAUDE_MCP_HOST',
        current: 'localhost',
        suggested: '0.0.0.0',
        reason: 'Allow external access to Docker container',
      });
    }

    // Volume mount paths
    const workDir = this.config.CLAUDE_WORK_DIR;
    if (workDir && !workDir.startsWith('/app')) {
      this.info.push('CLAUDE_WORK_DIR typically starts with /app in Docker containers');
    }
  }

  /**
   * Kubernetes-specific validations
   */
  validateKubernetes() {
    // Resource limits
    const workerThreads = parseInt(this.config.WORKER_THREADS) || 4;
    if (workerThreads > 8) {
      this.warnings.push('WORKER_THREADS > 8 may require higher CPU limits in Kubernetes');
    }

    // Health check configuration
    if (!this.config.HEALTH_CHECK_ENABLED || this.config.HEALTH_CHECK_ENABLED !== 'true') {
      this.warnings.push('HEALTH_CHECK_ENABLED should be true for Kubernetes probes');
    }
  }

  /**
   * Apply automatic fixes
   */
  applyFixes() {
    console.log(
      `\n${colors.blue}🔧 Applying ${this.fixes.length} automatic fixes...${colors.reset}\n`
    );

    let envContent = '';
    const envPath = path.resolve(this.options.envFile);

    // Load existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Apply each fix
    for (const fix of this.fixes) {
      console.log(`  ${colors.green}✓${colors.reset} ${fix.key}: ${fix.reason}`);

      // Update or add the environment variable
      const regex = new RegExp(`^${fix.key}=.*$`, 'm');
      const newLine = `${fix.key}=${fix.suggested}`;

      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    }

    // Write updated .env file
    try {
      fs.writeFileSync(envPath, envContent.trim() + '\n');
      console.log(`\n${colors.green}✅ Applied fixes to ${envPath}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}❌ Failed to write fixes: ${error.message}${colors.reset}`);
    }
  }

  /**
   * Output validation results
   */
  outputResults() {
    if (this.options.output === 'json') {
      this.outputJSON();
    } else {
      this.outputTable();
    }
  }

  /**
   * Output results as JSON
   */
  outputJSON() {
    const result = {
      environment: this.options.env,
      timestamp: new Date().toISOString(),
      summary: {
        errors: this.errors.length,
        warnings: this.warnings.length,
        info: this.info.length,
        fixes: this.fixes.length,
      },
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      fixes: this.fixes.map((f) => ({
        key: f.key,
        reason: f.reason,
        current: f.current,
        suggested: f.suggested,
      })),
    };

    console.log(JSON.stringify(result, null, 2));
  }

  /**
   * Output results as formatted table
   */
  outputTable() {
    console.log(
      `\n${colors.bold}📊 Validation Results for ${this.options.env.toUpperCase()} environment:${colors.reset}\n`
    );

    // Summary
    const errorColor = this.errors.length > 0 ? colors.red : colors.green;
    const warningColor = this.warnings.length > 0 ? colors.yellow : colors.green;

    console.log(`${errorColor}❌ Errors: ${this.errors.length}${colors.reset}`);
    console.log(`${warningColor}⚠️  Warnings: ${this.warnings.length}${colors.reset}`);
    console.log(`${colors.blue}ℹ️  Info: ${this.info.length}${colors.reset}`);
    console.log(`${colors.magenta}🔧 Fixable: ${this.fixes.length}${colors.reset}\n`);

    // Errors
    if (this.errors.length > 0) {
      console.log(`${colors.red}${colors.bold}❌ ERRORS:${colors.reset}`);
      this.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
      console.log();
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log(`${colors.yellow}${colors.bold}⚠️  WARNINGS:${colors.reset}`);
      this.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
      console.log();
    }

    // Info
    if (this.info.length > 0) {
      console.log(`${colors.blue}${colors.bold}ℹ️  INFO:${colors.reset}`);
      this.info.forEach((info, i) => {
        console.log(`  ${i + 1}. ${info}`);
      });
      console.log();
    }

    // Fixes
    if (this.fixes.length > 0) {
      console.log(`${colors.magenta}${colors.bold}🔧 SUGGESTED FIXES:${colors.reset}`);
      this.fixes.forEach((fix, i) => {
        console.log(`  ${i + 1}. ${fix.key}: ${fix.reason}`);
        console.log(`     Current: ${colors.dim}${fix.current}${colors.reset}`);
        console.log(`     Suggested: ${colors.green}${fix.suggested}${colors.reset}`);
      });
      console.log();
      console.log(
        `${colors.magenta}💡 Run with --fix to apply these changes automatically${colors.reset}\n`
      );
    }

    // Final status
    if (this.errors.length === 0) {
      console.log(
        `${colors.green}${colors.bold}✅ Configuration validation passed!${colors.reset}`
      );
      if (this.warnings.length > 0) {
        console.log(
          `${colors.yellow}Consider addressing the warnings above for optimal performance.${colors.reset}`
        );
      }
    } else {
      console.log(`${colors.red}${colors.bold}❌ Configuration validation failed!${colors.reset}`);
      console.log(
        `${colors.red}Please fix the errors above before deploying to production.${colors.reset}`
      );
    }
    console.log();
  }

  // Utility validation methods
  checkRequired(key, description) {
    if (!this.config[key]) {
      this.errors.push(`${key} is required (${description})`);
      return false;
    }
    return true;
  }

  checkNumeric(key, description, min = null, max = null) {
    const value = this.config[key];
    if (!value) return;

    const num = parseInt(value);
    if (isNaN(num)) {
      this.errors.push(`${key} must be a number (${description})`);
      return;
    }

    if (min !== null && num < min) {
      this.errors.push(`${key} must be at least ${min} (${description})`);
    }

    if (max !== null && num > max) {
      this.errors.push(`${key} must be at most ${max} (${description})`);
    }
  }

  checkFloat(key, description, min = null, max = null) {
    const value = this.config[key];
    if (!value) return;

    const num = parseFloat(value);
    if (isNaN(num)) {
      this.errors.push(`${key} must be a number (${description})`);
      return;
    }

    if (min !== null && num < min) {
      this.errors.push(`${key} must be at least ${min} (${description})`);
    }

    if (max !== null && num > max) {
      this.errors.push(`${key} must be at most ${max} (${description})`);
    }
  }

  isValidSize(sizeStr) {
    return /^\d+[kmg]?b?$/i.test(sizeStr);
  }

  generateSecureSecret(length) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .substring(0, length);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--env' && i + 1 < args.length) {
      options.env = args[++i];
    } else if (arg === '--file' && i + 1 < args.length) {
      options.file = args[++i];
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[++i];
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node validate-config.js [options]

Options:
  --env <env>        Environment to validate (production|development|docker)
  --file <path>      Custom .env file path
  --strict           Enable strict validation
  --output <format>  Output format (json|table)
  --fix              Apply automatic fixes
  --help, -h         Show this help message

Examples:
  node validate-config.js
  node validate-config.js --env production --strict
  node validate-config.js --file .env.production --fix
  node validate-config.js --output json
      `);
      process.exit(0);
    }
  }

  // Run validation
  const validator = new ConfigValidator(options);
  validator.validate().catch((error) => {
    console.error(`${colors.red}❌ Validation error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = ConfigValidator;
