/**
 * @fileoverview Minimal Foundation Configuration System
 *
 * Contains ONLY the 5 core foundation systems configuration:
 * - Logging configuration
 * - Basic development settings
 * - Environment detection
 * - Core system settings
 *
 * All other configurations (storage, neural, telemetry, etc.) belong in
 * their respective implementation packages.
 */

import convict from 'convict';
import { getLogger } from './logging';
import type { JsonObject } from './types/primitives';

const logger = getLogger('foundation-config');

// =============================================================================
// MINIMAL CONFIGURATION SCHEMA - Foundation Core Only
// =============================================================================

const configSchema = convict({
  // Environment Configuration
  env: {
    doc: 'Application environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
    arg: 'env',
  },

  // Logging Configuration (Foundation Core System)
  logging: {
    level: {
      doc: 'Default logging level',
      format: ['error', 'warn', 'info', 'debug'],
      default: 'info',
      env: 'ZEN_LOG_LEVEL',
      sensitive: false,
    },
    format: {
      doc: 'Log output format',
      format: ['json', 'text'],
      default: 'text',
      env: 'ZEN_LOG_FORMAT',
    },
    console: {
      doc: 'Enable console logging',
      format: 'Boolean',
      default: true,
      env: 'ZEN_LOG_CONSOLE',
    },
    file: {
      doc: 'Log file path (optional)',
      format: String,
      default: '',
      env: 'ZEN_LOG_FILE',
      sensitive: false,
    },
    timestamp: {
      doc: 'Include timestamps in logs',
      format: 'Boolean',
      default: true,
      env: 'ZEN_LOG_TIMESTAMP',
    },
  },

  // System Configuration
  system: {
    hostname: {
      doc: 'System hostname',
      format: String,
      default: 'localhost',
      env: 'HOSTNAME',
    },
    instanceId: {
      doc: 'Unique instance identifier',
      format: String,
      default: 'foundation-default',
      env: 'ZEN_INSTANCE_ID',
      sensitive: false,
    },
  },

  // Development Environment Detection
  development: {
    debug: {
      doc: 'Enable debug mode',
      format: 'Boolean',
      default: false,
      env: 'ZEN_DEBUG_MODE',
    },
    inNixShell: {
      doc: 'Running in Nix development shell',
      format: 'Boolean',
      default: false,
      env: 'IN_NIX_SHELL',
    },
    flakeDevShell: {
      doc: 'Running in Flake development shell',
      format: 'Boolean',
      default: false,
      env: 'FLAKE_DEVSHELL',
    },
  },

  // Basic Project Configuration (for foundation config storage only)
  project: {
    configDir: {
      doc: 'Project configuration directory',
      format: String,
      default: '.claude-zen',
      env: 'ZEN_PROJECT_CONFIG_DIR',
    },
    storeInUserHome: {
      doc: 'Store configuration in user home directory',
      format: 'Boolean',
      default: true,
      env: 'ZEN_STORE_CONFIG_IN_USER_HOME',
    },
  },

  // OpenTelemetry Configuration (foundation-only, basic settings)
  otel: {
    enabled: {
      doc: 'Enable OpenTelemetry integration',
      format: 'Boolean',
      default: false,
      env: 'ZEN_OTEL_ENABLED',
    },
    useInternalCollector: {
      doc: 'Use internal OTEL collector',
      format: 'Boolean',
      default: true,
      env: 'ZEN_USE_INTERNAL_OTEL_COLLECTOR',
    },
    internalCollectorEndpoint: {
      doc: 'Internal OTEL collector endpoint',
      format: String,
      default: 'http://localhost:4318',
      env: 'ZEN_INTERNAL_COLLECTOR_ENDPOINT',
    },
  },
});

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Config {
  logging: {
    level: string;
    format: string;
    console: boolean;
    file: string;
    timestamp: boolean;
  };
  system: {
    hostname: string;
    instanceId: string;
  };
  development: {
    debug: boolean;
    inNixShell: boolean;
    flakeDevShell: boolean;
  };
  project: {
    configDir: string;
    storeInUserHome: boolean;
  };
  otel: {
    enabled: boolean;
    useInternalCollector: boolean;
    internalCollectorEndpoint: string;
  };
}

// =============================================================================
// CONFIGURATION MANAGEMENT CLASS
// =============================================================================

export class FoundationConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private config: convict.Config<any>;
  private isInitialized = false;

  constructor() {
    this.config = configSchema;
  }

  initialize(): void {
    try {
      this.config.validate();
      this.isInitialized = true;
      logger.info('Foundation configuration initialized successfully');
    } catch (error) {
      logger.error('Foundation configuration initialization failed:', error);
      throw new Error(
        `Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  get(key: string): unknown {
    this.ensureInitialized();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (this.config as any).get(key);
    } catch (error) {
      logger.error(`Failed to get config key '${key}':`, error);
      throw new Error(`Configuration key '${key}' not found or invalid`);
    }
  }

  getAll(): JsonObject {
    this.ensureInitialized();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.config.getProperties() as any;
  }

  validate(): boolean {
    try {
      this.config.validate();
      return true;
    } catch (error) {
      logger.error('Configuration validation failed:', error);
      return false;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        'Configuration not initialized. Call initialize() first.',
      );
    }
  }
}

// =============================================================================
// GLOBAL CONFIGURATION INSTANCE
// =============================================================================

const globalConfig = new FoundationConfig();

// Auto-initialize
globalConfig.initialize();

// =============================================================================
// PUBLIC API
// =============================================================================

export function getConfig(): Config {
  return globalConfig.getAll() as unknown as Config;
}

export function validateConfig(): boolean {
  return globalConfig.validate();
}

export function reloadConfig(): void {
  globalConfig.initialize();
}

export function isDebugMode(): boolean {
  return globalConfig.get('development.debug') as boolean;
}

export const configHelpers = {
  get: (key: string) => globalConfig.get(key),
  getAll: () => globalConfig.getAll(),
  validate: validateConfig,
  reload: reloadConfig,
  isDebug: isDebugMode,
};

export default globalConfig;
