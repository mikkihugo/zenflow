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
import { getLogger } from './logging';
const logger = getLogger('modern-config');
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
 * Create and validate configuration
 */
const config = convict(configSchema);
// Load environment-specific configuration files if they exist
const env = process.env['NODE_ENV'] || 'development';
const configFiles = [
    `config/${env}.json`,
    `config/${env}.js`,
    `.claude-zen/config.json`,
    `.claude-zen/${env}.json`
];
for (const file of configFiles) {
    try {
        config.loadFile(file);
        logger.debug(`Loaded configuration from ${file}`);
    }
    catch (error) {
        // File doesn't exist or can't be loaded - this is normal
        logger.debug(`Configuration file ${file} not found or invalid`);
    }
}
// Validate configuration
try {
    config.validate({ allowed: 'strict' });
    logger.debug('Configuration validation successful');
}
catch (error) {
    logger.error('Configuration validation failed:', error);
    throw error;
}
/**
 * Configuration implementation with compatibility layer
 */
class ConfigImplementation {
    get logging() { return config.get('logging'); }
    get metrics() { return config.get('metrics'); }
    get storage() { return config.get('storage'); }
    get project() { return config.get('project'); }
    get neural() { return config.get('neural'); }
    get performance() { return config.get('performance'); }
    get development() { return config.get('development'); }
    get(key, defaultValue) {
        try {
            return config.get(key);
        }
        catch {
            return defaultValue;
        }
    }
    set(key, value) {
        config.set(key, value);
    }
    has(key) {
        try {
            config.get(key);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get the raw convict config for advanced usage
     */
    getRawConfig() {
        return config;
    }
    /**
     * Get configuration as plain object
     */
    toObject() {
        return config.getProperties();
    }
    /**
     * Get configuration schema documentation
     */
    getSchema() {
        return config.getSchema();
    }
    /**
     * Reload configuration from environment and files
     */
    reload() {
        // Re-load environment variables
        dotenv.config();
        // Re-validate
        config.validate({ allowed: 'strict' });
        logger.info('Configuration reloaded');
    }
}
// Global configuration instance
let globalConfig = null;
/**
 * Get the global configuration instance
 */
export function getModernConfig() {
    if (!globalConfig) {
        globalConfig = new ConfigImplementation();
    }
    return globalConfig;
}
/**
 * Reload configuration from environment and files
 */
export function reloadModernConfig() {
    if (globalConfig) {
        globalConfig.reload();
    }
}
/**
 * Check if debug mode is enabled
 */
export function isDebugMode() {
    return getModernConfig().development.debug;
}
/**
 * Check if metrics are enabled
 */
export function areMetricsEnabled() {
    return getModernConfig().metrics.enabled;
}
/**
 * Get storage configuration
 */
export function getStorageConfig() {
    return getModernConfig().storage;
}
/**
 * Get neural configuration
 */
export function getNeuralConfig() {
    return getModernConfig().neural;
}
/**
 * Validate current configuration
 */
export function validateModernConfig() {
    if (!globalConfig) {
        globalConfig = new ConfigImplementation();
    }
    try {
        globalConfig.getRawConfig().validate({ allowed: 'strict' });
        logger.info('Configuration validation successful');
    }
    catch (error) {
        logger.error('Configuration validation failed:', error);
        throw error;
    }
}
/**
 * Configuration helpers for backward compatibility
 */
export const modernConfigHelpers = {
    get: (key, defaultValue) => getModernConfig().get(key, defaultValue),
    set: (key, value) => getModernConfig().set(key, value),
    has: (key) => getModernConfig().has(key),
    reload: () => reloadModernConfig(),
    validate: () => validateModernConfig(),
    isDebug: () => isDebugMode(),
    areMetricsEnabled: () => areMetricsEnabled(),
    getStorageConfig: () => getStorageConfig(),
    getNeuralConfig: () => getNeuralConfig(),
    toObject: () => globalConfig?.toObject() || {},
    getSchema: () => globalConfig?.getSchema() || {}
};
// Export the global config as default
export default getModernConfig();
