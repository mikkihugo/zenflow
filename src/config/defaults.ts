/**
 * @file Defaults implementation.
 */

import type { SystemConfiguration } from './types.ts';

/**
 * Default system configuration.
 */
export const DEFAULT_CONFIG: SystemConfiguration = {
  core: {
    logger: {
      level: 'info',
      console: true,
      structured: false,
    },
    performance: {
      enableMetrics: true,
      metricsInterval: 10000,
      enableProfiling: false,
    },
    security: {
      enableSandbox: true,
      allowShellAccess: false,
      trustedHosts: ['localhost', '127.0.0.1'],
    },
  },

  interfaces: {
    shared: {
      theme: 'dark',
      verbosity: 'normal',
      autoCompletion: true,
      realTimeUpdates: true,
      refreshInterval: 5000,
      maxCommandHistory: 100,
      pageSize: 25,
    },
    terminal: {
      timeout: 30000,
      maxConcurrentProcesses: 10,
      enableColors: true,
      enableProgressBars: true,
    },
    web: {
      port: 3456,
      host: 'localhost',
      enableHttps: false,
      corsOrigins: ['http://localhost:3000', 'http://localhost:3456'],
      staticPath: './public',
      enableCompression: true,
    },
    mcp: {
      http: {
        port: 3000,
        host: 'localhost',
        timeout: 30000,
        maxRequestSize: '10mb',
        enableCors: true,
      },
      stdio: {
        timeout: 30000,
        maxBufferSize: 1024 * 1024, // 1MB
      },
      tools: {
        enableAll: true,
        enabledTools: [],
        disabledTools: [],
      },
    },
  },

  storage: {
    memory: {
      backend: 'sqlite',
      directory: './data/memory',
      namespace: 'claude-zen',
      enableCompression: false,
      maxMemorySize: 100 * 1024 * 1024, // 100MB
      cacheSize: 10 * 1024 * 1024, // 10MB
      enableBackup: true,
      backupInterval: 3600000, // 1 hour
    },
    database: {
      sqlite: {
        path: './data/claude-zen.db',
        enableWAL: true,
        maxConnections: 10,
        timeout: 30000,
      },
      lancedb: {
        path: './data/lancedb',
        enableVectorIndex: true,
        indexType: 'ivf',
      },
      persistence: {
        maxReaders: 6,
        maxWorkers: 3,
        mmapSize: 268435456, // 256MB
        cacheSize: -64000, // 64MB
        enableBackup: false,
        healthCheckInterval: 60000, // 1 minute
      },
    },
  },

  coordination: {
    maxAgents: 50,
    heartbeatInterval: 10000,
    timeout: 30000,
    topology: 'mesh',
    enableLoadBalancing: true,
    enableFailover: true,
    enableMetrics: true,
  },

  // External services and API keys
  services: {
    anthropic: {
      apiKey:
        process.env['ANTHROPIC_API_KEY'] ||
        (() => {
          if (process.env['NODE_ENV'] === 'production') {
            throw new Error('ANTHROPIC_API_KEY environment variable is required in production');
          }
          return null; // Allow null in development
        })(),
      baseUrl: process.env['ANTHROPIC_BASE_URL'] || 'https://api.anthropic.com',
      timeout: 30000,
      maxRetries: 3,
    },
    openai: {
      apiKey: process.env['OPENAI_API_KEY'] || null,
      baseUrl: process.env['OPENAI_BASE_URL'] || 'https://api.openai.com',
      timeout: 30000,
    },
    github: {
      token: process.env['GITHUB_TOKEN'] || null,
      baseUrl: process.env['GITHUB_API_URL'] || 'https://api.github.com',
    },
    search: {
      apiKey: process.env['SEARCH_API_KEY'] || null,
      baseUrl: process.env['SEARCH_BASE_URL'] || null,
    },
  },

  // Monitoring and logging
  monitoring: {
    dashboard: {
      port: parseInt(process.env['DASHBOARD_PORT'] || '3456', 10),
      host: process.env['DASHBOARD_HOST'] || 'localhost',
      enableMetrics: process.env['ENABLE_METRICS'] !== 'false',
      metricsInterval: parseInt(process.env['METRICS_INTERVAL'] || '10000', 10),
    },
    logging: {
      level: process.env['LOG_LEVEL'] || 'info',
      format: process.env['LOG_FORMAT'] || 'json',
      file: process.env['LOG_FILE'] || './logs/claude-zen.log',
      enableConsole: process.env['LOG_CONSOLE'] !== 'false',
      enableFile: process.env['LOG_FILE_ENABLE'] === 'true',
    },
    performance: {
      enableProfiling: process.env['ENABLE_PROFILING'] === 'true',
      sampleRate: parseFloat(process.env['PROFILE_SAMPLE_RATE'] || '0.1'),
      enableTracing: process.env['ENABLE_TRACING'] === 'true',
    },
  },

  // Network and connectivity
  network: {
    defaultTimeout: parseInt(process.env['DEFAULT_TIMEOUT'] || '30000', 10),
    maxRetries: parseInt(process.env['MAX_RETRIES'] || '3', 10),
    retryDelay: parseInt(process.env['RETRY_DELAY'] || '1000', 10),
    enableKeepAlive: process.env['KEEP_ALIVE'] !== 'false',
  },

  // Development vs Production settings
  environment: {
    isDevelopment: process.env['NODE_ENV'] === 'development',
    isProduction: process.env['NODE_ENV'] === 'production',
    isTest: process.env['NODE_ENV'] === 'test',
    allowUnsafeOperations: process.env['NODE_ENV'] === 'development',
    enableDebugEndpoints: process.env['NODE_ENV'] !== 'production',
    strictValidation: process.env['NODE_ENV'] === 'production',
  },

  neural: {
    enableWASM: true,
    enableSIMD: true,
    enableCUDA: false,
    modelPath: './data/neural',
    maxModelSize: 100 * 1024 * 1024, // 100MB
    enableTraining: false,
    enableInference: true,
    backend: 'wasm',
  },

  optimization: {
    enablePerformanceMonitoring: true,
    enableResourceOptimization: true,
    enableMemoryOptimization: true,
    enableNetworkOptimization: false,
    benchmarkInterval: 60000, // 1 minute
  },
};

/**
 * Environment variable mappings.
 */
export const ENV_MAPPINGS = {
  // Core
  CLAUDE_LOG_LEVEL: { path: 'core.logger.level', type: 'string' as const },
  CLAUDE_LOG_CONSOLE: { path: 'core.logger.console', type: 'boolean' as const },
  CLAUDE_LOG_FILE: { path: 'core.logger.file', type: 'string' as const },
  CLAUDE_ENABLE_METRICS: {
    path: 'core.performance.enableMetrics',
    type: 'boolean' as const,
  },
  CLAUDE_METRICS_INTERVAL: {
    path: 'core.performance.metricsInterval',
    type: 'number' as const,
  },

  // Interfaces
  CLAUDE_WEB_PORT: { path: 'interfaces.web.port', type: 'number' as const },
  CLAUDE_WEB_HOST: { path: 'interfaces.web.host', type: 'string' as const },
  CLAUDE_MCP_PORT: {
    path: 'interfaces.mcp.http.port',
    type: 'number' as const,
  },
  CLAUDE_MCP_HOST: {
    path: 'interfaces.mcp.http.host',
    type: 'string' as const,
  },
  CLAUDE_MCP_TIMEOUT: {
    path: 'interfaces.mcp.http.timeout',
    type: 'number' as const,
  },

  // Storage
  CLAUDE_MEMORY_BACKEND: {
    path: 'storage.memory.backend',
    type: 'string' as const,
  },
  CLAUDE_MEMORY_DIR: {
    path: 'storage.memory.directory',
    type: 'string' as const,
  },
  CLAUDE_DB_PATH: {
    path: 'storage.database.sqlite.path',
    type: 'string' as const,
  },
  CLAUDE_LANCEDB_PATH: {
    path: 'storage.database.lancedb.path',
    type: 'string' as const,
  },

  // Persistence Pool
  POOL_MAX_READERS: {
    path: 'storage.database.persistence.maxReaders',
    type: 'number' as const,
  },
  POOL_MAX_WORKERS: {
    path: 'storage.database.persistence.maxWorkers',
    type: 'number' as const,
  },
  POOL_MMAP_SIZE: {
    path: 'storage.database.persistence.mmapSize',
    type: 'number' as const,
  },
  POOL_CACHE_SIZE: {
    path: 'storage.database.persistence.cacheSize',
    type: 'number' as const,
  },
  POOL_ENABLE_BACKUP: {
    path: 'storage.database.persistence.enableBackup',
    type: 'boolean' as const,
  },

  // Coordination
  CLAUDE_MAX_AGENTS: {
    path: 'coordination.maxAgents',
    type: 'number' as const,
  },
  CLAUDE_HEARTBEAT_INTERVAL: {
    path: 'coordination.heartbeatInterval',
    type: 'number' as const,
  },
  CLAUDE_COORDINATION_TIMEOUT: {
    path: 'coordination.timeout',
    type: 'number' as const,
  },
  CLAUDE_SWARM_TOPOLOGY: {
    path: 'coordination.topology',
    type: 'string' as const,
  },

  // Neural
  CLAUDE_ENABLE_WASM: { path: 'neural.enableWASM', type: 'boolean' as const },
  CLAUDE_ENABLE_SIMD: { path: 'neural.enableSIMD', type: 'boolean' as const },
  CLAUDE_ENABLE_CUDA: { path: 'neural.enableCUDA', type: 'boolean' as const },
  CLAUDE_NEURAL_BACKEND: { path: 'neural.backend', type: 'string' as const },
  CLAUDE_MODEL_PATH: { path: 'neural.modelPath', type: 'string' as const },

  // Security
  CLAUDE_ENABLE_SANDBOX: {
    path: 'core.security.enableSandbox',
    type: 'boolean' as const,
  },
  CLAUDE_ALLOW_SHELL: {
    path: 'core.security.allowShellAccess',
    type: 'boolean' as const,
  },
  CLAUDE_TRUSTED_HOSTS: {
    path: 'core.security.trustedHosts',
    type: 'array' as const,
    parser: (value: string) => value.split(',').map((h) => h.trim()),
  },
} as const;

/**
 * Configuration validation schema with production safety.
 *
 * @example
 */
export interface ConfigValidationSchema {
  required: string[]; // Required environment variables
  optional: string[]; // Optional with defaults
  validation: {
    [key: string]: (value: any) => boolean;
  };
  production: {
    enforced: string[]; // Must be set in production
    forbidden: string[]; // Cannot be set in production
    fallbacks: { [key: string]: any }; // Safe fallbacks
  };
  portRanges: {
    development: { min: number; max: number };
    production: { min: number; max: number };
  };
}

/**
 * Production-Ready Configuration Validation Rules.
 * 
 * Comprehensive validation rule set that defines acceptable values, ranges,
 * and constraints for all system configuration parameters. Includes both
 * development and production-specific validation with automatic fallbacks,
 * conflict detection, and security enforcement.
 * 
 * Key Features:
 * - Type validation with enum constraints
 * - Production-specific min/max ranges
 * - Port conflict detection and safe fallbacks
 * - Security-aware defaults for production environments
 * - Adaptive validation based on deployment environment
 * 
 * Rule Structure:
 * - `type`: Data type validation (string, number, boolean)
 * - `enum`: Allowed enumeration values
 * - `min`/`max`: Acceptable value ranges
 * - `productionMin`/`productionMax`: Production-specific constraints
 * - `conflictCheck`: Enable port conflict detection
 * - `fallback`: Safe default value when validation fails
 * - `required`: Whether the field is mandatory
 * 
 * @example
 * ```typescript
 * import { VALIDATION_RULES } from 'claude-code-zen/config';
 * 
 * // Validate a configuration value
 * const portRule = VALIDATION_RULES['interfaces.web.port'];
 * const port = 3456;
 * 
 * if (port < portRule.min || port > portRule.max) {
 *   console.error(`Port ${port} is outside valid range ${portRule.min}-${portRule.max}`);
 *   port = portRule.fallback; // Use safe fallback
 * }
 * 
 * // Check production constraints
 * if (process.env.NODE_ENV === 'production' && port < portRule.productionMin) {
 *   console.warn(`Port ${port} below production minimum ${portRule.productionMin}`);
 * }
 * ```
 * 
 * @const VALIDATION_RULES
 * @see {@link ConfigValidator} - Uses these rules for validation
 * @see {@link PRODUCTION_VALIDATION_SCHEMA} - Production-specific schema
 * @since 1.0.0-alpha.43
 */
export const VALIDATION_RULES = {
  'core.logger.level': {
    type: 'string',
    enum: ['debug', 'info', 'warn', 'error'],
    productionDefault: 'info',
    required: false,
  },
  'interfaces.web.port': {
    type: 'number',
    min: 1,
    max: 65535,
    productionMin: 3000,
    productionMax: 65535,
    conflictCheck: true,
    fallback: 3456, // Safe fallback different from MCP
  },
  'interfaces.mcp.http.port': {
    type: 'number',
    min: 1,
    max: 65535,
    productionMin: 3000,
    productionMax: 65535,
    conflictCheck: true,
    fallback: 3000, // Primary MCP port
  },
  'coordination.maxAgents': {
    type: 'number',
    min: 1,
    max: 1000,
    productionMax: 100, // More conservative in production
    required: false,
    fallback: 10,
  },
  'coordination.topology': {
    type: 'string',
    enum: ['mesh', 'hierarchical', 'ring', 'star'],
    productionRecommended: ['hierarchical', 'ring'],
    fallback: 'hierarchical',
  },
  'neural.backend': {
    type: 'string',
    enum: ['wasm', 'native', 'fallback'],
    productionRecommended: ['wasm', 'fallback'],
    fallback: 'wasm',
  },
  'storage.memory.backend': {
    type: 'string',
    enum: ['sqlite', 'lancedb', 'json'],
    productionRecommended: ['sqlite', 'lancedb'],
    fallback: 'sqlite',
  },
  'core.security.enableSandbox': {
    type: 'boolean',
    productionRequired: true,
    fallback: true,
  },
  'core.security.allowShellAccess': {
    type: 'boolean',
    productionForbidden: true,
    fallback: false,
  },
  // Database constraints
  'storage.database.sqlite.maxConnections': {
    type: 'number',
    min: 1,
    max: 100,
    productionMax: 50,
    fallback: 10,
  },
  'storage.memory.maxMemorySize': {
    type: 'number',
    min: 1024 * 1024, // 1MB minimum
    productionMin: 50 * 1024 * 1024, // 50MB minimum in production
    fallback: 100 * 1024 * 1024, // 100MB default
  },
} as const;

/**
 * Production Environment Validation Schema.
 * 
 * Comprehensive validation schema specifically designed for production
 * deployments with enhanced security, strict validation rules, and
 * mandatory environment variable requirements. Enforces production
 * best practices and prevents unsafe configurations.
 * 
 * Security Features:
 * - Mandatory environment variables for production
 * - Forbidden unsafe configuration options
 * - Automatic fallback to secure defaults
 * - API key validation and presence checking
 * - Port range restrictions for production environments
 * 
 * Schema Components:
 * - `required`: Environment variables that must be present
 * - `optional`: Environment variables that are recommended but not mandatory
 * - `validation`: Custom validation functions for each variable
 * - `production.enforced`: Settings that are mandatory in production
 * - `production.forbidden`: Settings that are prohibited in production
 * - `production.fallbacks`: Safe default values for production
 * - `portRanges`: Environment-specific port allocation ranges
 * 
 * @example
 * ```typescript
 * import { PRODUCTION_VALIDATION_SCHEMA } from 'claude-code-zen/config';
 * 
 * // Validate production environment
 * const isValid = PRODUCTION_VALIDATION_SCHEMA.validation.NODE_ENV('production');
 * console.log('Valid NODE_ENV:', isValid); // true
 * 
 * // Check API key requirement
 * if (process.env.NODE_ENV === 'production') {
 *   const hasValidKey = PRODUCTION_VALIDATION_SCHEMA.validation.ANTHROPIC_API_KEY(
 *     process.env.ANTHROPIC_API_KEY
 *   );
 *   if (!hasValidKey) {
 *     throw new Error('ANTHROPIC_API_KEY is required in production');
 *   }
 * }
 * 
 * // Get production fallbacks
 * const fallbacks = PRODUCTION_VALIDATION_SCHEMA.production.fallbacks;
 * console.log('Safe port fallback:', fallbacks['interfaces.web.port']); // 3456
 * ```
 * 
 * @const PRODUCTION_VALIDATION_SCHEMA
 * @see {@link ConfigValidationSchema} - Schema type definition
 * @see {@link VALIDATION_RULES} - General validation rules
 * @since 1.0.0-alpha.43
 */
export const PRODUCTION_VALIDATION_SCHEMA: ConfigValidationSchema = {
  required: ['NODE_ENV'],
  optional: ['CLAUDE_WEB_PORT', 'CLAUDE_MCP_PORT', 'CLAUDE_LOG_LEVEL', 'CLAUDE_MAX_AGENTS'],
  validation: {
    NODE_ENV: (value: string) => ['production', 'development', 'test'].includes(value),
    ANTHROPIC_API_KEY: (value: string) =>
      process.env['NODE_ENV'] === 'production' ? !!value && value.length > 10 : true,
    CLAUDE_WEB_PORT: (value: string) => {
      const port = parseInt(value, 10);
      return !isNaN(port) && port >= 3000 && port <= 65535;
    },
    CLAUDE_MCP_PORT: (value: string) => {
      const port = parseInt(value, 10);
      return !isNaN(port) && port >= 3000 && port <= 65535;
    },
  },
  production: {
    enforced: ['core.security.enableSandbox', 'core.logger.level', 'environment.strictValidation'],
    forbidden: [
      'core.security.allowShellAccess',
      'environment.allowUnsafeOperations',
      'environment.enableDebugEndpoints',
    ],
    fallbacks: {
      'core.logger.level': 'info',
      'core.security.enableSandbox': true,
      'core.security.allowShellAccess': false,
      'interfaces.web.port': 3456,
      'interfaces.mcp.http.port': 3000,
      'coordination.maxAgents': 10,
      'coordination.topology': 'hierarchical',
      'storage.memory.backend': 'sqlite',
      'neural.backend': 'wasm',
    },
  },
  portRanges: {
    development: { min: 3000, max: 9999 },
    production: { min: 3000, max: 65535 },
  },
};

/**
 * Default Port Allocation Strategy.
 * 
 * Carefully planned port allocation strategy designed to prevent conflicts
 * between different system components. Provides a stable, predictable port
 * assignment scheme that works across development, testing, and production
 * environments while avoiding common port conflicts.
 * 
 * Port Assignment Philosophy:
 * - Primary services get well-known, memorable ports
 * - Sequential allocation for related services
 * - Gaps between service groups to allow expansion
 * - Avoids system ports (< 1024) and common application ports
 * - Compatible with firewall rules and load balancer configurations
 * 
 * Service Port Mapping:
 * - `3000`: MCP HTTP Server (primary Claude integration)
 * - `3456`: Web Dashboard (administrative interface)
 * - `3457`: Monitoring Dashboard (metrics and health)
 * - `3001`: Development Server (when needed)
 * - `3002`: Backup/Failover Port (high availability)
 * 
 * @example
 * ```typescript
 * import { DEFAULT_PORT_ALLOCATION } from 'claude-code-zen/config';
 * 
 * // Get assigned port for a service
 * const mcpPort = DEFAULT_PORT_ALLOCATION['interfaces.mcp.http.port'];
 * console.log('MCP server will run on port:', mcpPort); // 3000
 * 
 * // Check for conflicts before starting services
 * const webPort = DEFAULT_PORT_ALLOCATION['interfaces.web.port'];
 * const monitorPort = DEFAULT_PORT_ALLOCATION['monitoring.dashboard.port'];
 * 
 * if (webPort === monitorPort) {
 *   throw new Error('Port conflict detected!');
 * }
 * 
 * // Use in server configuration
 * const serverConfig = {
 *   mcp: { port: DEFAULT_PORT_ALLOCATION['interfaces.mcp.http.port'] },
 *   web: { port: DEFAULT_PORT_ALLOCATION['interfaces.web.port'] },
 *   monitoring: { port: DEFAULT_PORT_ALLOCATION['monitoring.dashboard.port'] }
 * };
 * ```
 * 
 * @const DEFAULT_PORT_ALLOCATION
 * @see {@link PORT_ALLOCATION_BY_ENV} - Environment-specific overrides
 * @see {@link VALIDATION_RULES} - Port validation rules
 * @since 1.0.0-alpha.43
 */
export const DEFAULT_PORT_ALLOCATION = {
  'interfaces.mcp.http.port': 3000, // Primary MCP server
  'interfaces.web.port': 3456, // Web dashboard
  'monitoring.dashboard.port': 3457, // Monitoring dashboard
  'development.port': 3001, // Development server if needed
  'backup.port': 3002, // Backup/failover port
} as const;

/**
 * Environment-Specific Port Allocation Overrides.
 * 
 * Environment-aware port allocation that provides different port assignments
 * for development, production, and testing environments. Allows for isolation
 * between environments while maintaining service functionality and preventing
 * conflicts when multiple environments run on the same system.
 * 
 * Environment Strategy:
 * - **Development**: Standard ports for easy access and debugging
 * - **Production**: Environment variable override support with fallbacks
 * - **Testing**: Offset ports to avoid conflicts with development services
 * 
 * Port Environment Mapping:
 * - Development: 3000, 3456, 3457 (standard allocation)
 * - Production: Environment variable driven with same fallbacks
 * - Testing: 3100, 3556, 3557 (offset by +100/+100/+100)
 * 
 * Environment Variables:
 * - `CLAUDE_MCP_PORT`: Override MCP server port in production
 * - `CLAUDE_WEB_PORT`: Override web dashboard port in production  
 * - `CLAUDE_MONITOR_PORT`: Override monitoring dashboard port in production
 * 
 * @example
 * ```typescript
 * import { PORT_ALLOCATION_BY_ENV } from 'claude-code-zen/config';
 * 
 * const env = process.env.NODE_ENV || 'development';
 * const ports = PORT_ALLOCATION_BY_ENV[env];
 * 
 * // Get environment-specific port
 * const mcpPort = ports['interfaces.mcp.http.port'];
 * console.log(`MCP server port for ${env}:`, mcpPort);
 * 
 * // Start services with environment-appropriate ports
 * const config = {
 *   environment: env,
 *   services: {
 *     mcp: { port: ports['interfaces.mcp.http.port'] },
 *     web: { port: ports['interfaces.web.port'] },
 *     monitoring: { port: ports['monitoring.dashboard.port'] }
 *   }
 * };
 * 
 * // Production example with environment variables
 * // CLAUDE_MCP_PORT=8080 CLAUDE_WEB_PORT=8081 npm start
 * if (env === 'production') {
 *   console.log('Production ports can be overridden via environment variables');
 * }
 * ```
 * 
 * @const PORT_ALLOCATION_BY_ENV
 * @see {@link DEFAULT_PORT_ALLOCATION} - Base port allocation strategy
 * @see {@link VALIDATION_RULES} - Port validation and conflict checking
 * @since 1.0.0-alpha.43
 */
export const PORT_ALLOCATION_BY_ENV = {
  development: {
    'interfaces.mcp.http.port': 3000,
    'interfaces.web.port': 3456,
    'monitoring.dashboard.port': 3457,
  },
  production: {
    'interfaces.mcp.http.port': parseInt(process.env['CLAUDE_MCP_PORT'] || '3000', 10),
    'interfaces.web.port': parseInt(process.env['CLAUDE_WEB_PORT'] || '3456', 10),
    'monitoring.dashboard.port': parseInt(process.env['CLAUDE_MONITOR_PORT'] || '3457', 10),
  },
  test: {
    'interfaces.mcp.http.port': 3100,
    'interfaces.web.port': 3556,
    'monitoring.dashboard.port': 3557,
  },
} as const;

/**
 * URL Builder Configuration and Utilities.
 * 
 * Comprehensive URL construction system consolidated from url-builder.ts.
 * Provides type-safe, environment-aware URL building capabilities for
 * all system services including MCP servers, web dashboards, monitoring
 * endpoints, and API routes.
 * 
 * Features:
 * - Protocol-aware URL construction (HTTP/HTTPS)
 * - Environment-specific host and port resolution
 * - Path normalization and query parameter handling
 * - Service-specific URL builders with validation
 * - Development vs production URL differences
 * 
 * @since 1.0.0-alpha.43
 */

/**
 * URL Builder Configuration Interface.
 * 
 * Defines the configuration options for URL construction including protocol
 * selection, host specification, port assignment, and path configuration.
 * Used by URLBuilder class and service-specific URL generation functions.
 * 
 * @example
 * ```typescript
 * import type { URLBuilderConfig } from 'claude-code-zen/config';
 * 
 * const config: URLBuilderConfig = {
 *   protocol: 'https',
 *   host: 'api.example.com',
 *   port: 443,
 *   path: '/v1/mcp'
 * };
 * 
 * // Used with URLBuilder
 * const builder = new URLBuilder(systemConfig);
 * const url = builder.buildURL('mcp', config);
 * ```
 * 
 * @interface URLBuilderConfig
 * @see {@link URLBuilder} - URL builder class implementation
 * @since 1.0.0-alpha.43
 */
export interface URLBuilderConfig {
  protocol?: 'http' | 'https';
  host?: string;
  port?: number;
  path?: string;
}

export class URLBuilder {
  private config: SystemConfiguration;

  constructor(config: SystemConfiguration = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Build HTTP MCP server URL.
   *
   * @param overrides
   */
  getMCPServerURL(overrides: Partial<URLBuilderConfig> = {}): string {
    const protocol = overrides.protocol || this.getProtocol();
    const host = overrides.host || this.config.interfaces.mcp.http.host;
    const port = overrides.port || this.config.interfaces.mcp.http.port;
    const path = overrides.path || '';

    return this.buildURL(protocol, host, port, path);
  }

  /**
   * Build web dashboard URL.
   *
   * @param overrides
   */
  getWebDashboardURL(overrides: Partial<URLBuilderConfig> = {}): string {
    const protocol = overrides.protocol || this.getProtocol();
    const host = overrides.host || this.config.interfaces.web.host;
    const port = overrides.port || this.config.interfaces.web.port;
    const path = overrides.path || '';

    return this.buildURL(protocol, host, port, path);
  }

  /**
   * Build monitoring dashboard URL.
   *
   * @param overrides
   */
  getMonitoringDashboardURL(overrides: Partial<URLBuilderConfig> = {}): string {
    const protocol = overrides.protocol || this.getProtocol();
    const host = overrides.host || this.config.monitoring.dashboard.host;
    const port = overrides.port || this.config.monitoring.dashboard.port;
    const path = overrides.path || '';

    return this.buildURL(protocol, host, port, path);
  }

  /**
   * Build CORS origins array.
   */
  getCORSOrigins(): string[] {
    const protocol = this.getProtocol();
    const mcpURL = this.getMCPServerURL({ protocol });
    const webURL = this.getWebDashboardURL({ protocol });
    const monitoringURL = this.getMonitoringDashboardURL({ protocol });
    const configuredOrigins = this.config.interfaces.web.corsOrigins || [];

    const updatedOrigins = configuredOrigins.map((origin) => {
      if (origin.includes('localhost') && !origin.startsWith('http')) {
        return `${protocol}://${origin}`;
      }
      if (origin.startsWith('http://localhost') && protocol === 'https') {
        return origin.replace('http://', 'https://');
      }
      return origin;
    });

    const allOrigins = [...updatedOrigins, mcpURL, webURL, monitoringURL];
    return Array.from(new Set(allOrigins));
  }

  /**
   * Get service base URL.
   *
   * @param service
   * @param overrides
   */
  getServiceBaseURL(
    service: 'mcp' | 'web' | 'monitoring',
    overrides: Partial<URLBuilderConfig> = {}
  ): string {
    switch (service) {
      case 'mcp':
        return this.getMCPServerURL(overrides);
      case 'web':
        return this.getWebDashboardURL(overrides);
      case 'monitoring':
        return this.getMonitoringDashboardURL(overrides);
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  /**
   * Build a URL from components.
   *
   * @param protocol
   * @param host
   * @param port
   * @param path
   */
  private buildURL(protocol: string, host: string, port: number, path: string): string {
    const shouldOmitPort =
      (protocol === 'http' && port === 80) || (protocol === 'https' && port === 443);

    const portPart = shouldOmitPort ? '' : `:${port}`;
    const pathPart = path.startsWith('/') ? path : `/${path}`;
    const cleanPath = path === '' ? '' : pathPart;

    return `${protocol}://${host}${portPart}${cleanPath}`;
  }

  /**
   * Get protocol based on environment and configuration.
   */
  private getProtocol(): 'http' | 'https' {
    if (process.env['FORCE_HTTPS'] === 'true') {
      return 'https';
    }
    if (process.env['FORCE_HTTP'] === 'true') {
      return 'http';
    }
    if (this.config.interfaces.web.enableHttps) {
      return 'https';
    }
    return this.config.environment.isProduction ? 'https' : 'http';
  }

  /**
   * Update configuration.
   *
   * @param config
   */
  updateConfig(config: SystemConfiguration): void {
    this.config = config;
  }
}

/**
 * Default URL builder instance using default configuration.
 */
export const defaultURLBuilder = new URLBuilder();

/**
 * Create URL builder with custom configuration.
 *
 * @param config
 */
export const createURLBuilder = (config: SystemConfiguration): URLBuilder => {
  return new URLBuilder(config);
};

/**
 * Convenience functions using default builder.
 *
 * @param overrides
 */
export const getMCPServerURL = (overrides?: Partial<URLBuilderConfig>) =>
  defaultURLBuilder.getMCPServerURL(overrides);

export const getWebDashboardURL = (overrides?: Partial<URLBuilderConfig>) =>
  defaultURLBuilder.getWebDashboardURL(overrides);

export const getMonitoringDashboardURL = (overrides?: Partial<URLBuilderConfig>) =>
  defaultURLBuilder.getMonitoringDashboardURL(overrides);

export const getCORSOrigins = () => defaultURLBuilder.getCORSOrigins();
