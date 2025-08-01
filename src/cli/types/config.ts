/**
 * Configuration Type Definitions
 *
 * This module defines configuration interfaces for the CLI system,
 * including CLI settings, swarm configuration, and database settings.
 */

/**
 * Main CLI configuration interface
 */
export interface CliConfig {
  /** CLI application metadata */
  app: {
    /** Application name */
    name: string;

    /** Application version */
    version: string;

    /** Application description */
    description?: string;

    /** Application author */
    author?: string;

    /** Application license */
    license?: string;
  };

  /** Default command flags */
  defaults: {
    /** Default debug mode */
    debug: boolean;

    /** Default verbose mode */
    verbose: boolean;

    /** Default output format */
    format: 'json' | 'yaml' | 'table' | 'text';

    /** Default timeout in milliseconds */
    timeout: number;

    /** Default retry attempts */
    retries: number;
  };

  /** Plugin configuration */
  plugins: PluginConfig;

  /** Swarm configuration */
  swarm: SwarmConfig;

  /** Database configuration */
  database: DatabaseConfig;

  /** UI configuration */
  ui: UIConfig;

  /** Logging configuration */
  logging: LoggingConfig;

  /** Security configuration */
  security: SecurityConfig;

  /** Performance configuration */
  performance: PerformanceConfig;
}

/**
 * Plugin system configuration
 */
export interface PluginConfig {
  /** Whether plugins are enabled */
  enabled: boolean;

  /** Plugin discovery paths */
  paths: string[];

  /** Auto-load plugins on startup */
  autoLoad: boolean;

  /** Plugin initialization timeout */
  initTimeout: number;

  /** Error handling strategy */
  errorHandling: 'strict' | 'graceful' | 'ignore';

  /** Allowed plugin types */
  allowedTypes: string[];

  /** Plugin security settings */
  security: {
    /** Require plugin signatures */
    requireSignatures: boolean;

    /** Allowed plugin sources */
    allowedSources: string[];

    /** Sandbox plugins */
    sandbox: boolean;
  };
}

/**
 * Swarm orchestration configuration
 */
export interface SwarmConfig {
  /** Whether swarm functionality is enabled */
  enabled: boolean;

  /** Default swarm topology */
  defaultTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';

  /** Maximum number of agents */
  maxAgents: number;

  /** Default execution strategy */
  defaultStrategy: 'balanced' | 'specialized' | 'parallel' | 'adaptive';

  /** Agent configuration */
  agents: {
    /** Default agent types */
    defaultTypes: AgentType[];

    /** Agent spawn timeout */
    spawnTimeout: number;

    /** Agent heartbeat interval */
    heartbeatInterval: number;

    /** Agent cleanup timeout */
    cleanupTimeout: number;
  };

  /** Memory configuration */
  memory: {
    /** Memory persistence enabled */
    persistent: boolean;

    /** Memory storage path */
    storagePath: string;

    /** Memory retention period in days */
    retentionDays: number;

    /** Maximum memory size in MB */
    maxSizeMB: number;
  };

  /** Communication configuration */
  communication: {
    /** Communication protocol */
    protocol: 'websocket' | 'http' | 'grpc';

    /** Communication port */
    port: number;

    /** Message timeout */
    messageTimeout: number;

    /** Retry configuration */
    retries: {
      maxAttempts: number;
      backoffMs: number;
    };
  };
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  /** Database type */
  type: 'sqlite' | 'postgresql' | 'mysql' | 'mongodb';

  /** Connection configuration */
  connection: {
    /** Database host */
    host?: string;

    /** Database port */
    port?: number;

    /** Database name */
    database: string;

    /** Database username */
    username?: string;

    /** Database password */
    password?: string;

    /** Connection string (alternative to individual fields) */
    url?: string;

    /** SSL configuration */
    ssl?: boolean | SSLConfig;
  };

  /** Connection pool configuration */
  pool: {
    /** Minimum pool size */
    min: number;

    /** Maximum pool size */
    max: number;

    /** Connection timeout */
    acquireTimeoutMillis: number;

    /** Idle timeout */
    idleTimeoutMillis: number;
  };

  /** Migration configuration */
  migrations: {
    /** Migrations directory */
    directory: string;

    /** Auto-run migrations */
    autoRun: boolean;

    /** Migration table name */
    tableName: string;
  };

  /** Backup configuration */
  backup: {
    /** Backup enabled */
    enabled: boolean;

    /** Backup directory */
    directory: string;

    /** Backup interval in hours */
    intervalHours: number;

    /** Backup retention days */
    retentionDays: number;
  };
}

/**
 * SSL configuration for database connections
 */
export interface SSLConfig {
  /** SSL certificate file */
  cert?: string;

  /** SSL key file */
  key?: string;

  /** SSL CA file */
  ca?: string;

  /** Reject unauthorized certificates */
  rejectUnauthorized: boolean;
}

/**
 * UI configuration
 */
export interface UIConfig {
  /** Default theme */
  theme: 'light' | 'dark' | 'auto';

  /** Color scheme */
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  /** Animation settings */
  animations: {
    enabled: boolean;
    duration: number;
  };

  /** Terminal configuration */
  terminal: {
    /** Support color output */
    colors: boolean;

    /** Support Unicode characters */
    unicode: boolean;

    /** Terminal width override */
    width?: number;

    /** Terminal height override */
    height?: number;
  };
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  /** Logging level */
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';

  /** Log format */
  format: 'json' | 'text' | 'structured';

  /** Log output targets */
  outputs: LogOutput[];

  /** Log rotation configuration */
  rotation: {
    enabled: boolean;
    maxFiles: number;
    maxSizeMB: number;
  };

  /** Structured logging fields */
  fields: {
    timestamp: boolean;
    level: boolean;
    component: boolean;
    requestId: boolean;
    userId: boolean;
  };
}

/**
 * Log output configuration
 */
export interface LogOutput {
  /** Output type */
  type: 'console' | 'file' | 'http' | 'database';

  /** Output configuration */
  config: Record<string, unknown>;

  /** Minimum log level for this output */
  level?: string;

  /** Output enabled */
  enabled: boolean;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  /** Authentication configuration */
  auth: {
    enabled: boolean;
    provider: 'local' | 'oauth' | 'ldap' | 'saml';
    config: Record<string, unknown>;
  };

  /** Authorization configuration */
  authorization: {
    enabled: boolean;
    rbac: boolean;
    policies: string[];
  };

  /** Encryption configuration */
  encryption: {
    algorithm: string;
    keySize: number;
    keyRotationDays: number;
  };

  /** Rate limiting configuration */
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  /** Caching configuration */
  cache: {
    enabled: boolean;
    type: 'memory' | 'redis' | 'file';
    ttlSeconds: number;
    maxItems: number;
  };

  /** Worker threads configuration */
  workers: {
    enabled: boolean;
    poolSize: number;
    taskTimeout: number;
  };

  /** Memory limits */
  memory: {
    heapLimitMB: number;
    gcEnabled: boolean;
    monitoringEnabled: boolean;
  };

  /** CPU limits */
  cpu: {
    maxUsagePercent: number;
    throttleEnabled: boolean;
  };
}

/**
 * Agent type enumeration
 */
export type AgentType =
  | 'coordinator'
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'tester'
  | 'architect'
  | 'documenter'
  | 'reviewer'
  | 'deployer'
  | 'monitor';

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /** Whether configuration is valid */
  valid: boolean;

  /** Validation errors */
  errors: ConfigValidationError[];

  /** Validation warnings */
  warnings: ConfigValidationWarning[];

  /** Validated configuration */
  config?: CliConfig;
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  /** Error message */
  message: string;

  /** Configuration path where error occurred */
  path: string;

  /** Expected value or type */
  expected?: string;

  /** Actual value */
  actual?: unknown;
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  /** Warning message */
  message: string;

  /** Configuration path where warning occurred */
  path: string;

  /** Suggested action */
  suggestion?: string;
}
