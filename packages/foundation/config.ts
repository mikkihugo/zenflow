/**
 * @fileoverview Modern Configuration System using Convict + Dotenv
 * 
 * Professional configuration management with schema validation, environment coercion,
 * and structured configuration loading. Replaces custom ZEN environment variable system.
 * 
 * Features:
 * - JSON schema validation with convict
 * - Automatic environment variable loading with dotenv
 * - Type-safe configuration with TypeScript
 * - Documentation generation from schema
 * - Environment-specific configuration files
 * 
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import convict from 'convict';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

import { getLogger } from './src/logging';

const logger = getLogger('config');

// Load environment variables
dotenv.config();

/**
 * Configuration schema definition with convict
 */
const configSchema = {
  // Logging configuration
  logging: {
    level: {
      doc: 'The logging level',
      format: ['error', 'warn', 'info', 'debug', 'trace'],
      default: 'info',
      env: 'ZEN_LOG_LEVEL'
    },
    console: {
      doc: 'Enable console logging',
      format: Boolean,
      default: true,
      env: 'ZEN_LOG_CONSOLE'
    },
    file: {
      doc: 'Enable file logging',
      format: Boolean,
      default: false,
      env: 'ZEN_LOG_FILE'
    },
    timestamp: {
      doc: 'Include timestamps in logs',
      format: Boolean,
      default: true,
      env: 'ZEN_LOG_TIMESTAMP'
    },
    format: {
      doc: 'Log format',
      format: ['text', 'json'],
      default: 'text',
      env: 'ZEN_LOG_FORMAT'
    }
  },
  
  // Metrics and monitoring
  metrics: {
    enabled: {
      doc: 'Enable metrics collection',
      format: Boolean,
      default: false,
      env: 'ZEN_ENABLE_METRICS'
    },
    interval: {
      doc: 'Metrics collection interval in milliseconds',
      format: 'int',
      default: 60000,
      env: 'ZEN_METRICS_INTERVAL'
    }
  },
  
  // Storage configuration
  storage: {
    backend: {
      doc: 'Storage backend type',
      format: ['memory', 'sqlite', 'lancedb', 'kuzu'],
      default: 'memory',
      env: 'ZEN_MEMORY_BACKEND'
    },
    memoryDir: {
      doc: 'Memory storage directory',
      format: String,
      default: './data/memory',
      env: 'ZEN_MEMORY_DIR'
    },
    dbPath: {
      doc: 'Database file path',
      format: String,
      default: './data/zen.db',
      env: 'ZEN_DB_PATH'
    }
  },
  
  // Project and workspace
  project: {
    configDir: {
      doc: 'Project configuration directory',
      format: String,
      default: '.claude-zen',
      env: 'ZEN_PROJECT_CONFIG_DIR'
    },
    workspaceDbPath: {
      doc: 'Workspace database path',
      format: String,
      default: '.claude-zen/workspace.db',
      env: 'ZEN_WORKSPACE_DB_PATH'
    },
    storeInUserHome: {
      doc: 'Store configuration in user home directory',
      format: Boolean,
      default: true,
      env: 'ZEN_STORE_CONFIG_IN_USER_HOME'
    }
  },
  
  // Neural and AI features
  neural: {
    learning: {
      doc: 'Enable neural learning features',
      format: Boolean,
      default: true,
      env: 'ZEN_NEURAL_LEARNING'
    },
    cacheSize: {
      doc: 'Neural cache size',
      format: 'int',
      default: 1000,
      env: 'ZEN_NEURAL_CACHE_SIZE'
    }
  },
  
  // Performance settings
  performance: {
    maxConcurrent: {
      doc: 'Maximum concurrent operations',
      format: 'int',
      default: 5,
      env: 'ZEN_MAX_CONCURRENT'
    },
    timeoutMs: {
      doc: 'Operation timeout in milliseconds',
      format: 'int',
      default: 300000,
      env: 'ZEN_TIMEOUT_MS'
    }
  },
  
  // Development settings
  development: {
    debug: {
      doc: 'Enable debug mode',
      format: Boolean,
      default: false,
      env: 'ZEN_DEBUG_MODE'
    },
    verboseErrors: {
      doc: 'Enable verbose error reporting',
      format: Boolean,
      default: false,
      env: 'ZEN_VERBOSE_ERRORS'
    }
  }
};

/**
 * TypeScript interfaces for configuration
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  console: boolean;
  file: boolean;
  timestamp: boolean;
  format: 'text' | 'json';
}

export interface MetricsConfig {
  enabled: boolean;
  interval: number;
}

export interface StorageConfig {
  backend: 'memory' | 'sqlite' | 'lancedb' | 'kuzu';
  memoryDir: string;
  dbPath: string;
}

export interface ProjectConfig {
  configDir: string;
  workspaceDbPath: string;
  storeInUserHome: boolean;
}

export interface NeuralConfig {
  learning: boolean;
  cacheSize: number;
}

export interface PerformanceConfig {
  maxConcurrent: number;
  timeoutMs: number;
}

export interface DevelopmentConfig {
  debug: boolean;
  verboseErrors: boolean;
}

export interface Config {
  logging: LoggingConfig;
  metrics: MetricsConfig;
  storage: StorageConfig;
  project: ProjectConfig;
  neural: NeuralConfig;
  performance: PerformanceConfig;
  development: DevelopmentConfig;
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
  has(key: string): boolean;
  toObject(): Record<string, any>;
  getSchema(): any;
  reload(): void;
}

/**
 * Create and validate configuration
 */
const config = convict(configSchema);

// Load configuration files from .claude-zen directory (user home or per-repo)
const env = process.env['NODE_ENV'] || 'development';

// Check environment variable or default to user home mode
const storeInUserHome = process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';

// Build configuration file paths based on mode
const configFiles: string[] = [];

if (storeInUserHome) {
  // Mode 1: User directory mode (default)
  const userConfigDir = path.join(os.homedir(), '.claude-zen');
  configFiles.push(
    `${userConfigDir}/config.json`,           // Main user config
    `${userConfigDir}/${env}.json`,           // Environment-specific user config
  );
} 

// Always check for per-repo overrides (even in user mode)
configFiles.push(
  `.claude-zen/config.json`,                  // Local repo config
  `.claude-zen/${env}.json`                   // Local repo environment config
);

// Load configuration files in priority order
for (const file of configFiles) {
  try {
    if (fs.existsSync(file)) {
      config.loadFile(file);
      logger.debug(`Loaded configuration from ${file}`);
    }
  } catch (error) {
    // File exists but can't be loaded - this is an error
    logger.warn(`Configuration file ${file} exists but couldn't be loaded:`, error);
  }
}

// Log the configuration mode for debugging
logger.debug(`Configuration mode: ${storeInUserHome ? 'User directory (~/.claude-zen)' : 'Per-repository (./.claude-zen)'}`);
if (storeInUserHome) {
  logger.debug(`User config directory: ${path.join(os.homedir(), '.claude-zen')}`);
}

// Validate configuration
try {
  config.validate({ allowed: 'strict' });
  logger.debug('Configuration validation successful');
} catch (error) {
  logger.error('Configuration validation failed:', error);
  throw error;
}

/**
 * Configuration implementation with compatibility layer
 */
class ConfigImplementation implements Config {
  get logging(): LoggingConfig { return config.get('logging') as LoggingConfig; }
  get metrics(): MetricsConfig { return config.get('metrics') as MetricsConfig; }
  get storage(): StorageConfig { return config.get('storage') as StorageConfig; }
  get project(): ProjectConfig { return config.get('project') as ProjectConfig; }
  get neural(): NeuralConfig { return config.get('neural') as NeuralConfig; }
  get performance(): PerformanceConfig { return config.get('performance') as PerformanceConfig; }
  get development(): DevelopmentConfig { return config.get('development') as DevelopmentConfig; }

  get(key: string, defaultValue?: any): any {
    try {
      return config.get(key as any);
    } catch {
      return defaultValue;
    }
  }

  set(key: string, value: any): void {
    config.set(key as any, value);
  }

  has(key: string): boolean {
    try {
      config.get(key as any);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get configuration as plain object
   */
  toObject(): Record<string, any> {
    return config.getProperties();
  }

  /**
   * Get configuration schema documentation
   */
  getSchema(): any {
    return config.getSchema();
  }

  /**
   * Reload configuration from environment and files
   */
  reload(): void {
    // Re-load environment variables
    dotenv.config();
    
    // Re-validate
    config.validate({ allowed: 'strict' });
    
    logger.info('Configuration reloaded');
  }
}

// Global configuration instance
let globalConfig: ConfigImplementation | null = null;

/**
 * Get the global configuration instance
 */
export function getConfig(): Config {
  if (!globalConfig) {
    globalConfig = new ConfigImplementation();
  }
  return globalConfig;
}

/**
 * Reload configuration from environment and files
 */
export function reloadConfig(): void {
  if (globalConfig) {
    globalConfig.reload();
  }
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return getConfig().development.debug;
}

/**
 * Check if metrics are enabled
 */
export function areMetricsEnabled(): boolean {
  return getConfig().metrics.enabled;
}

/**
 * Get storage configuration
 */
export function getStorageConfig(): StorageConfig {
  return getConfig().storage;
}

/**
 * Get neural configuration
 */
export function getNeuralConfig(): NeuralConfig {
  return getConfig().neural;
}

/**
 * Get telemetry configuration (for backward compatibility)
 */
export function getTelemetryConfig() {
  const config = getConfig();
  return {
    serviceName: 'claude-code-zen',
    serviceVersion: '1.0.0',
    enableTracing: config.metrics.enabled,
    enableMetrics: config.metrics.enabled,
    enableLogging: config.logging.console || config.logging.file,
    enableAutoInstrumentation: config.metrics.enabled,
    traceSamplingRatio: 1.0,
    metricsInterval: config.metrics.interval,
    prometheusEndpoint: '/metrics',
    prometheusPort: 9090,
    jaegerEndpoint: 'http://localhost:14268/api/traces',
    enableConsoleExporters: config.development.debug
  };
}

/**
 * Validate current configuration
 */
export function validateConfig(): void {
  if (!globalConfig) {
    globalConfig = new ConfigImplementation();
  }
  try {
    config.validate({ allowed: 'strict' });
    logger.info('Configuration validation successful');
  } catch (error) {
    logger.error('Configuration validation failed:', error);
    throw error;
  }
}

/**
 * Configuration helpers for backward compatibility
 */
export const configHelpers = {
  get: (key: string, defaultValue?: any) => getConfig().get(key, defaultValue),
  set: (key: string, value: any) => getConfig().set(key, value),
  has: (key: string) => getConfig().has(key),
  reload: () => reloadConfig(),
  validate: () => validateConfig(),
  isDebug: () => isDebugMode(),
  areMetricsEnabled: () => areMetricsEnabled(),
  getStorageConfig: () => getStorageConfig(),
  getNeuralConfig: () => getNeuralConfig(),
  toObject: () => globalConfig?.toObject() || {},
  getSchema: () => globalConfig?.getSchema() || {}
};

// Export the global config as default
export default getConfig();