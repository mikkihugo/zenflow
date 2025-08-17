/**
 * @fileoverview System Default Configuration - Comprehensive default settings for Claude Code Zen
 *
 * This module provides the complete default configuration system for Claude Code Zen including
 * system-wide settings, environment-specific overrides, validation schemas, and URL building
 * utilities. Serves as the single source of truth for all default system behavior and provides
 * production-ready configuration templates with intelligent fallbacks.
 *
 * **Key Features:**
 * - **Complete System Defaults**: All subsystem configurations with intelligent defaults
 * - **Environment-Aware Settings**: Development, production, and test-specific configurations
 * - **Validation Schemas**: Comprehensive validation rules with type checking and range validation
 * - **Port Allocation Strategy**: Conflict-free port assignment across all services
 * - **URL Building System**: Type-safe URL construction for all service endpoints
 * - **Production Safety**: Security-focused defaults with strict production validation
 * - **Configuration Mapping**: Environment variable to configuration path mapping
 * - **Performance Optimization**: Optimized defaults based on deployment environment
 *
 * **Configuration Categories:**
 * - Core system (logging, performance, security)
 * - Interface configuration (web, terminal)
 * - Storage systems (memory, database, persistence)
 * - Coordination and swarm management
 * - External service integrations (Anthropic, OpenAI, GitHub)
 * - Monitoring and logging infrastructure
 * - Network and connectivity settings
 * - Neural processing and WASM optimization
 * - Environment-specific behavior controls
 *
 * @example Basic System Configuration
 * ```typescript
 * import { DEFAULT_CONFIG } from './defaults';
 *
 * // Use default configuration for system startup
 * const systemConfig = {
 *   ...DEFAULT_CONFIG,
 *   // Override specific settings
 *   interfaces: {
 *     ...DEFAULT_CONFIG.interfaces,
 *     web: {
 *       ...DEFAULT_CONFIG.interfaces.web,
 *       port: 8080
 *     }
 *   }
 * };
 * ```
 *
 * @example Environment Variable Configuration
 * ```typescript
 * import { ENV_MAPPINGS, DEFAULT_CONFIG } from './defaults';
 *
 * // Map environment variables to configuration
 * const config = applyEnvironmentOverrides(DEFAULT_CONFIG, ENV_MAPPINGS);
 *
 * // Environment variables like WEB_PORT=8080 automatically applied
 * ```
 *
 * @example Production Validation
 * ```typescript
 * import { PRODUCTION_VALIDATION_SCHEMA } from './defaults';
 *
 * // Validate production configuration
 * const errors = validateProductionConfig(config, PRODUCTION_VALIDATION_SCHEMA);
 * if (errors.length > 0) {
 *   console.error('Production validation errors:', errors);
 * }
 * ```
 *
 * @example URL Building
 * ```typescript
 * import { URLBuilder, getWebDashboardURL } from './defaults';
 *
 * // Build service URLs with automatic protocol/port detection
 * const webURL = getWebDashboardURL({ host: 'dashboard.company.com' });
 *
 * // Custom URL builder
 * const builder = new URLBuilder(customConfig);
 * const monitoringURL = builder.getMonitoringDashboardURL();
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 *
 * @see {@link SystemConfiguration} Complete configuration interface
 * @see {@link ENV_MAPPINGS} Environment variable mapping system
 * @see {@link VALIDATION_RULES} Configuration validation rules
 * @see {@link URLBuilder} Service URL construction utilities
 */
/**
 * Default system configuration.
 */
export const DEFAULT_CONFIG = {
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
            port: Number.parseInt(process.env['WEB_PORT'] || '3000', 10),
            host: process.env['WEB_HOST'] || 'localhost',
            enableHttps: false,
            corsOrigins: ['http://localhost:3000'],
            staticPath: './public',
            enableCompression: true,
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
            apiKey: process.env['ANTHROPIC_API_KEY'] || null, // Optional - not used by default
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
            port: Number.parseInt(process.env['WEB_PORT'] || '3000', 10),
            host: process.env['WEB_HOST'] || 'localhost',
            enableMetrics: process.env['ENABLE_METRICS'] !== 'false',
            metricsInterval: Number.parseInt(process.env['METRICS_INTERVAL'] || '10000', 10),
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
            sampleRate: Number.parseFloat(process.env['PROFILE_SAMPLE_RATE'] || '0.1'),
            enableTracing: process.env['ENABLE_TRACING'] === 'true',
        },
    },
    // Network and connectivity
    network: {
        defaultTimeout: Number.parseInt(process.env['DEFAULT_TIMEOUT'] || '30000', 10),
        maxRetries: Number.parseInt(process.env['MAX_RETRIES'] || '3', 10),
        retryDelay: Number.parseInt(process.env['RETRY_DELAY'] || '1000', 10),
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
    ZEN_LOG_LEVEL: { path: 'core.logger.level', type: 'string' },
    ZEN_LOG_CONSOLE: { path: 'core.logger.console', type: 'boolean' },
    ZEN_LOG_FILE: { path: 'core.logger.file', type: 'string' },
    ZEN_ENABLE_METRICS: {
        path: 'core.performance.enableMetrics',
        type: 'boolean',
    },
    ZEN_METRICS_INTERVAL: {
        path: 'core.performance.metricsInterval',
        type: 'number',
    },
    // Interfaces
    WEB_PORT: { path: 'interfaces.web.port', type: 'number' },
    WEB_HOST: { path: 'interfaces.web.host', type: 'string' },
    // Storage
    ZEN_MEMORY_BACKEND: {
        path: 'storage.memory.backend',
        type: 'string',
    },
    ZEN_MEMORY_DIR: {
        path: 'storage.memory.directory',
        type: 'string',
    },
    ZEN_DB_PATH: {
        path: 'storage.database.sqlite.path',
        type: 'string',
    },
    ZEN_LANCEDB_PATH: {
        path: 'storage.database.lancedb.path',
        type: 'string',
    },
    // Persistence Pool
    POOL_MAX_READERS: {
        path: 'storage.database.persistence.maxReaders',
        type: 'number',
    },
    POOL_MAX_WORKERS: {
        path: 'storage.database.persistence.maxWorkers',
        type: 'number',
    },
    POOL_MMAP_SIZE: {
        path: 'storage.database.persistence.mmapSize',
        type: 'number',
    },
    POOL_CACHE_SIZE: {
        path: 'storage.database.persistence.cacheSize',
        type: 'number',
    },
    POOL_ENABLE_BACKUP: {
        path: 'storage.database.persistence.enableBackup',
        type: 'boolean',
    },
    // Coordination
    ZEN_MAX_AGENTS: {
        path: 'coordination.maxAgents',
        type: 'number',
    },
    ZEN_HEARTBEAT_INTERVAL: {
        path: 'coordination.heartbeatInterval',
        type: 'number',
    },
    ZEN_COORDINATION_TIMEOUT: {
        path: 'coordination.timeout',
        type: 'number',
    },
    ZEN_SWARM_TOPOLOGY: {
        path: 'coordination.topology',
        type: 'string',
    },
    // Neural
    ZEN_ENABLE_WASM: { path: 'neural.enableWASM', type: 'boolean' },
    ZEN_ENABLE_SIMD: { path: 'neural.enableSIMD', type: 'boolean' },
    ZEN_ENABLE_CUDA: { path: 'neural.enableCUDA', type: 'boolean' },
    ZEN_NEURAL_BACKEND: { path: 'neural.backend', type: 'string' },
    ZEN_NEURAL_MODEL_PATH: { path: 'neural.modelPath', type: 'string' },
    // Security
    ZEN_ENABLE_SANDBOX: {
        path: 'core.security.enableSandbox',
        type: 'boolean',
    },
    ZEN_ALLOW_SHELL: {
        path: 'core.security.allowShellAccess',
        type: 'boolean',
    },
    ZEN_TRUSTED_HOSTS: {
        path: 'core.security.trustedHosts',
        type: 'array',
        parser: (value) => value.split(',').map((h) => h.trim()),
    },
};
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
        fallback: 3000, // Default web port
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
};
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
export const PRODUCTION_VALIDATION_SCHEMA = {
    required: ['NODE_ENV'],
    optional: [
        'WEB_PORT',
        'ZEN_LOG_LEVEL',
        'ZEN_MAX_AGENTS',
    ],
    validation: {
        NODE_ENV: (value) => typeof value === 'string' &&
            ['production', 'development', 'test'].includes(value),
        ANTHROPIC_API_KEY: (value) => true, // Optional - not required
        WEB_PORT: (value) => {
            if (typeof value !== 'string')
                return false;
            const port = Number.parseInt(value, 10);
            return !isNaN(port) && port >= 3000 && port <= 65535;
        },
    },
    production: {
        enforced: [
            'core.security.enableSandbox',
            'core.logger.level',
            'environment.strictValidation',
        ],
        forbidden: [
            'core.security.allowShellAccess',
            'environment.allowUnsafeOperations',
            'environment.enableDebugEndpoints',
        ],
        fallbacks: {
            'core.logger.level': 'info',
            'core.security.enableSandbox': true,
            'core.security.allowShellAccess': false,
            'interfaces.web.port': 3000,
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
export class URLBuilder {
    config;
    constructor(config = DEFAULT_CONFIG) {
        this.config = config;
    }
    /**
     * Build web dashboard URL.
     *
     * @param overrides
     */
    getWebDashboardURL(overrides = {}) {
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
    getMonitoringDashboardURL(overrides = {}) {
        const protocol = overrides.protocol || this.getProtocol();
        const host = overrides.host || this.config.monitoring.dashboard.host;
        const port = overrides.port || this.config.monitoring.dashboard.port;
        const path = overrides.path || '';
        return this.buildURL(protocol, host, port, path);
    }
    /**
     * Build CORS origins array.
     */
    getCORSOrigins() {
        const protocol = this.getProtocol();
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
        const allOrigins = [...updatedOrigins, webURL, monitoringURL];
        return Array.from(new Set(allOrigins));
    }
    /**
     * Get service base URL.
     *
     * @param service
     * @param overrides
     */
    getServiceBaseURL(service, overrides = {}) {
        switch (service) {
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
    buildURL(protocol, host, port, path) {
        const shouldOmitPort = (protocol === 'http' && port === 80) ||
            (protocol === 'https' && port === 443);
        const portPart = shouldOmitPort ? '' : `:${port}`;
        const pathPart = path.startsWith('/') ? path : `/${path}`;
        const cleanPath = path === '' ? '' : pathPart;
        return `${protocol}://${host}${portPart}${cleanPath}`;
    }
    /**
     * Get protocol based on environment and configuration.
     */
    getProtocol() {
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
    updateConfig(config) {
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
export const createURLBuilder = (config) => {
    return new URLBuilder(config);
};
/**
 * Convenience functions using default builder.
 *
 * @param overrides
 */
export const getWebDashboardURL = (overrides) => defaultURLBuilder.getWebDashboardURL(overrides);
export const getMonitoringDashboardURL = (overrides) => defaultURLBuilder.getMonitoringDashboardURL(overrides);
export const getCORSOrigins = () => defaultURLBuilder.getCORSOrigins();
//# sourceMappingURL=defaults.js.map