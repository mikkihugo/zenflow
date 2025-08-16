/**
 * @fileoverview Shared Configuration System for ZEN Environment Variables
 * 
 * Simple configuration loading focused on ZEN_ environment variables used
 * throughout the standalone libraries. Provides consistent access to common
 * configuration without the complexity of the full configuration loader.
 */

import { getLogger } from './logging';

const logger = getLogger('shared-config');

/**
 * ZEN environment variable mappings with types
 */
export const ZEN_ENV_MAPPINGS = {
  // Logging configuration
  ZEN_LOG_LEVEL: { type: 'string' as const, default: 'info' },
  ZEN_LOG_CONSOLE: { type: 'boolean' as const, default: true },
  ZEN_LOG_FILE: { type: 'boolean' as const, default: false },
  ZEN_LOG_TIMESTAMP: { type: 'boolean' as const, default: true },
  ZEN_LOG_FORMAT: { type: 'string' as const, default: 'text' },
  
  // Metrics and monitoring
  ZEN_ENABLE_METRICS: { type: 'boolean' as const, default: false },
  ZEN_METRICS_INTERVAL: { type: 'number' as const, default: 60000 },
  
  // Memory and storage
  ZEN_MEMORY_BACKEND: { type: 'string' as const, default: 'memory' },
  ZEN_MEMORY_DIR: { type: 'string' as const, default: './data/memory' },
  ZEN_DB_PATH: { type: 'string' as const, default: './data/zen.db' },
  
  // Neural and AI features
  ZEN_NEURAL_LEARNING: { type: 'boolean' as const, default: true },
  ZEN_NEURAL_CACHE_SIZE: { type: 'number' as const, default: 1000 },
  
  // Performance settings
  ZEN_MAX_CONCURRENT: { type: 'number' as const, default: 5 },
  ZEN_TIMEOUT_MS: { type: 'number' as const, default: 300000 },
  
  // Development settings
  ZEN_DEBUG_MODE: { type: 'boolean' as const, default: false },
  ZEN_VERBOSE_ERRORS: { type: 'boolean' as const, default: false },
} as const;

export type ZenConfigKey = keyof typeof ZEN_ENV_MAPPINGS;
export type ZenConfigValue = string | number | boolean;

/**
 * Shared configuration interface for libs
 */
export interface SharedConfig {
  logging: {
    level: string;
    console: boolean;
    file: boolean;
    timestamp: boolean;
    format: string;
  };
  metrics: {
    enabled: boolean;
    interval: number;
  };
  storage: {
    backend: string;
    memoryDir: string;
    dbPath: string;
  };
  neural: {
    learning: boolean;
    cacheSize: number;
  };
  performance: {
    maxConcurrent: number;
    timeoutMs: number;
  };
  development: {
    debug: boolean;
    verboseErrors: boolean;
  };
  
  // Extended methods for event system compatibility
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
  has(key: string): boolean;
}

/**
 * Parse environment variable value based on type
 */
function parseEnvValue(value: string, type: 'string' | 'number' | 'boolean'): ZenConfigValue {
  switch (type) {
    case 'boolean':
      return value.toLowerCase() === 'true' || value === '1';
    case 'number':
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        throw new Error(`Invalid number value: ${value}`);
      }
      return parsed;
    case 'string':
    default:
      return value;
  }
}

/**
 * Load ZEN environment variables with defaults and NODE_ENV hierarchy
 */
function loadZenEnvironment(): Record<ZenConfigKey, ZenConfigValue> {
  const config: Record<string, ZenConfigValue> = {};
  const nodeEnv = (process.env['NODE_ENV'] || 'development') as keyof typeof ENV_DEFAULTS;
  const envDefaults = ENV_DEFAULTS[nodeEnv] || ENV_DEFAULTS.development;
  
  for (const [key, spec] of Object.entries(ZEN_ENV_MAPPINGS)) {
    const envValue = process.env[key];
    
    if (envValue !== undefined) {
      try {
        config[key] = parseEnvValue(envValue, spec.type);
      } catch (error) {
        logger.warn(`Invalid ${key} value: ${envValue}, using default: ${spec.default}`);
        config[key] = spec.default;
      }
    } else {
      // Check for NODE_ENV specific default first
      const envSpecificDefault = envDefaults[key as keyof typeof envDefaults];
      config[key] = envSpecificDefault !== undefined ? envSpecificDefault : spec.default;
    }
  }
  
  return config as Record<ZenConfigKey, ZenConfigValue>;
}

/**
 * Configuration schema for validation
 */
export const CONFIG_SCHEMA = {
  logging: {
    level: ['debug', 'info', 'warn', 'error'],
    format: ['text', 'json']
  },
  metrics: {
    interval: { min: 1000, max: 3600000 }
  },
  performance: {
    timeoutMs: { min: 1000, max: 600000 },
    maxConcurrent: { min: 1, max: 100 }
  },
  neural: {
    cacheSize: { min: 100, max: 10000 }
  }
} as const;

/**
 * Environment-specific defaults based on NODE_ENV
 */
const ENV_DEFAULTS = {
  development: {
    ZEN_DEBUG_MODE: true,
    ZEN_LOG_LEVEL: 'debug',
    ZEN_VERBOSE_ERRORS: true
  },
  production: {
    ZEN_DEBUG_MODE: false,
    ZEN_LOG_LEVEL: 'info',
    ZEN_VERBOSE_ERRORS: false
  },
  test: {
    ZEN_DEBUG_MODE: false,
    ZEN_LOG_LEVEL: 'warn',
    ZEN_VERBOSE_ERRORS: false
  }
} as const;

/**
 * Configuration manager for shared lib usage
 */
class SharedConfigManager {
  private static instance: SharedConfigManager;
  private config: SharedConfig;
  private envConfig: Record<ZenConfigKey, ZenConfigValue>;
  private pathCache = new Map<string, string[]>();
  private watchCallbacks = new Set<() => void>();
  
  private constructor() {
    this.envConfig = loadZenEnvironment();
    this.config = this.createSharedConfig();
  }
  
  static getInstance(): SharedConfigManager {
    if (!SharedConfigManager.instance) {
      SharedConfigManager.instance = new SharedConfigManager();
    }
    return SharedConfigManager.instance;
  }
  
  private createSharedConfig(): SharedConfig {
    const baseConfig = {
      logging: {
        level: this.envConfig.ZEN_LOG_LEVEL as string,
        console: this.envConfig.ZEN_LOG_CONSOLE as boolean,
        file: this.envConfig.ZEN_LOG_FILE as boolean,
        timestamp: this.envConfig.ZEN_LOG_TIMESTAMP as boolean,
        format: this.envConfig.ZEN_LOG_FORMAT as string,
      },
      metrics: {
        enabled: this.envConfig.ZEN_ENABLE_METRICS as boolean,
        interval: this.envConfig.ZEN_METRICS_INTERVAL as number,
      },
      storage: {
        backend: this.envConfig.ZEN_MEMORY_BACKEND as string,
        memoryDir: this.envConfig.ZEN_MEMORY_DIR as string,
        dbPath: this.envConfig.ZEN_DB_PATH as string,
      },
      neural: {
        learning: this.envConfig.ZEN_NEURAL_LEARNING as boolean,
        cacheSize: this.envConfig.ZEN_NEURAL_CACHE_SIZE as number,
      },
      performance: {
        maxConcurrent: this.envConfig.ZEN_MAX_CONCURRENT as number,
        timeoutMs: this.envConfig.ZEN_TIMEOUT_MS as number,
      },
      development: {
        debug: this.envConfig.ZEN_DEBUG_MODE as boolean,
        verboseErrors: this.envConfig.ZEN_VERBOSE_ERRORS as boolean,
      },
    };

    // Add methods to make it a full SharedConfig
    return Object.assign(baseConfig, {
      get: (key: string, defaultValue?: any): any => this.getConfig().get(key, defaultValue),
      set: (key: string, value: any): void => this.getConfig().set(key, value),
      has: (key: string): boolean => this.getConfig().has(key)
    }) as SharedConfig;
  }
  
  /**
   * Get the shared configuration
   */
  getConfig(): SharedConfig {
    const config = { ...this.config };
    
    // Add get/set/has methods to the returned config object
    return Object.assign(config, {
      get: (key: string, defaultValue?: any): any => {
        // Use cached path parts for performance
        let keyParts = this.pathCache.get(key);
        if (!keyParts) {
          keyParts = key.split('.');
          this.pathCache.set(key, keyParts);
        }
        
        let value: any = config;
        
        for (const part of keyParts) {
          value = value?.[part];
          if (value === undefined) {
            logger.debug(`Config key not found: ${key}, using default: ${defaultValue}`);
            return defaultValue;
          }
        }
        
        return value;
      },
      
      set: (key: string, value: any): void => {
        logger.warn(
          `Attempted to set config key '${key}' to '${value}'. ` +
          `SharedConfig is readonly. Consider using environment variables instead.`
        );
      },
      
      has: (key: string): boolean => {
        // Use cached path parts for performance
        let keyParts = this.pathCache.get(key);
        if (!keyParts) {
          keyParts = key.split('.');
          this.pathCache.set(key, keyParts);
        }
        
        let value: any = config;
        
        for (const part of keyParts) {
          value = value?.[part];
          if (value === undefined) {
            return false;
          }
        }
        
        return value !== undefined;
      }
    });
  }
  
  /**
   * Get specific environment variable value
   */
  getEnv<K extends ZenConfigKey>(key: K): ZenConfigValue {
    return this.envConfig[key];
  }
  
  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.config.development.debug;
  }
  
  /**
   * Check if metrics are enabled
   */
  areMetricsEnabled(): boolean {
    return this.config.metrics.enabled;
  }
  
  /**
   * Get storage configuration
   */
  getStorageConfig(): SharedConfig['storage'] {
    return { ...this.config.storage };
  }
  
  /**
   * Get neural learning configuration
   */
  getNeuralConfig(): SharedConfig['neural'] {
    return { ...this.config.neural };
  }
  
  /**
   * Reload configuration from environment
   */
  reload(): void {
    this.envConfig = loadZenEnvironment();
    this.config = this.createSharedConfig();
    this.pathCache.clear(); // Clear cache after reload
    logger.info('Shared configuration reloaded from environment');
    this.notifyWatchers();
  }
  
  /**
   * Validate configuration using schema
   */
  validate(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Validate using schema
    this.validateWithSchema(this.config, CONFIG_SCHEMA, '', issues);
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  }
  
  /**
   * Recursive schema validation helper
   */
  private validateWithSchema(
    value: any,
    schema: any,
    path: string,
    issues: string[]
  ): void {
    for (const [key, schemaValue] of Object.entries(schema)) {
      const currentPath = path ? `${path}.${key}` : key;
      const currentValue = value?.[key];
      
      if (currentValue === undefined) continue;
      
      if (Array.isArray(schemaValue)) {
        // Enum validation
        if (!schemaValue.includes(currentValue)) {
          issues.push(`Invalid ${currentPath}: ${currentValue}. Must be one of: ${schemaValue.join(', ')}`);
        }
      } else if (typeof schemaValue === 'object' && schemaValue !== null && 'min' in schemaValue && 'max' in schemaValue) {
        // Range validation
        if (typeof currentValue === 'number') {
          const minValue = schemaValue.min as number;
          const maxValue = schemaValue.max as number;
          if (currentValue < minValue) {
            issues.push(`${currentPath} too small: ${currentValue}. Minimum: ${minValue}`);
          }
          if (currentValue > maxValue) {
            issues.push(`${currentPath} too large: ${currentValue}. Maximum: ${maxValue}`);
          }
        }
      } else if (typeof schemaValue === 'object') {
        // Nested object validation
        this.validateWithSchema(currentValue, schemaValue, currentPath, issues);
      }
    }
  }
  
  /**
   * Watch for configuration changes
   */
  watch(callback: () => void): () => void {
    this.watchCallbacks.add(callback);
    
    // Return unwatch function
    return () => {
      this.watchCallbacks.delete(callback);
    };
  }
  
  /**
   * Notify watchers of configuration changes
   */
  private notifyWatchers(): void {
    this.watchCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        logger.error('Error in config watch callback:', error);
      }
    });
  }
}

// Singleton instance
const configManager = SharedConfigManager.getInstance();

/**
 * Get shared configuration for standalone libs
 */
export function getSharedConfig(): SharedConfig {
  return configManager.getConfig();
}

/**
 * Get specific ZEN environment variable
 */
export function getZenEnv<K extends ZenConfigKey>(key: K): ZenConfigValue {
  return configManager.getEnv(key);
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return configManager.isDebugMode();
}

/**
 * Check if metrics are enabled
 */
export function areMetricsEnabled(): boolean {
  return configManager.areMetricsEnabled();
}

/**
 * Get storage configuration
 */
export function getStorageConfig(): SharedConfig['storage'] {
  return configManager.getStorageConfig();
}

/**
 * Get neural configuration
 */
export function getNeuralConfig(): SharedConfig['neural'] {
  return configManager.getNeuralConfig();
}

/**
 * Reload configuration from environment
 */
export function reloadSharedConfig(): void {
  configManager.reload();
}

/**
 * Validate shared configuration
 */
export function validateSharedConfig(): { isValid: boolean; issues: string[] } {
  return configManager.validate();
}

/**
 * Watch for configuration changes
 */
export function watchSharedConfig(callback: () => void): () => void {
  return configManager.watch(callback);
}

/**
 * Component-specific configuration helpers
 */
export const configHelpers = {
  /**
   * Get logging configuration for a component
   */
  getLoggingConfig: (componentName?: string): SharedConfig['logging'] => {
    const config = getSharedConfig();
    // Check for component-specific log level override
    const componentLogLevel = process.env[`ZEN_LOG_COMPONENT_${componentName?.toUpperCase()}`];
    if (componentLogLevel) {
      return { ...config.logging, level: componentLogLevel };
    }
    return config.logging;
  },
  
  /**
   * Get timeout for a specific operation type
   */
  getTimeout: (operationType: 'llm' | 'storage' | 'network' | 'general' = 'general'): number => {
    const config = getSharedConfig();
    const baseTimeout = config.performance.timeoutMs;
    
    // Adjust timeout based on operation type
    switch (operationType) {
      case 'llm':
        return baseTimeout; // Full timeout for LLM operations
      case 'storage':
        return Math.min(baseTimeout / 4, 30000); // Shorter for storage
      case 'network':
        return Math.min(baseTimeout / 2, 60000); // Medium for network
      case 'general':
      default:
        return baseTimeout;
    }
  },
  
  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled: (feature: 'metrics' | 'neural' | 'debug'): boolean => {
    const config = getSharedConfig();
    switch (feature) {
      case 'metrics':
        return config.metrics.enabled;
      case 'neural':
        return config.neural.learning;
      case 'debug':
        return config.development.debug;
      default:
        return false;
    }
  },
};

// Default export for convenience
export default {
  getSharedConfig,
  getZenEnv,
  isDebugMode,
  areMetricsEnabled,
  getStorageConfig,
  getNeuralConfig,
  reloadSharedConfig,
  validateSharedConfig,
  watchSharedConfig,
  configHelpers,
  ZEN_ENV_MAPPINGS,
  CONFIG_SCHEMA,
};