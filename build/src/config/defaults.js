/**
 * @file Defaults implementation.
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
            apiKey: process.env['ANTHROPIC_API_KEY'] ||
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
    CLAUDE_LOG_LEVEL: { path: 'core.logger.level', type: 'string' },
    CLAUDE_LOG_CONSOLE: { path: 'core.logger.console', type: 'boolean' },
    CLAUDE_LOG_FILE: { path: 'core.logger.file', type: 'string' },
    CLAUDE_ENABLE_METRICS: {
        path: 'core.performance.enableMetrics',
        type: 'boolean',
    },
    CLAUDE_METRICS_INTERVAL: {
        path: 'core.performance.metricsInterval',
        type: 'number',
    },
    // Interfaces
    CLAUDE_WEB_PORT: { path: 'interfaces.web.port', type: 'number' },
    CLAUDE_WEB_HOST: { path: 'interfaces.web.host', type: 'string' },
    CLAUDE_MCP_PORT: {
        path: 'interfaces.mcp.http.port',
        type: 'number',
    },
    CLAUDE_MCP_HOST: {
        path: 'interfaces.mcp.http.host',
        type: 'string',
    },
    CLAUDE_MCP_TIMEOUT: {
        path: 'interfaces.mcp.http.timeout',
        type: 'number',
    },
    // Storage
    CLAUDE_MEMORY_BACKEND: {
        path: 'storage.memory.backend',
        type: 'string',
    },
    CLAUDE_MEMORY_DIR: {
        path: 'storage.memory.directory',
        type: 'string',
    },
    CLAUDE_DB_PATH: {
        path: 'storage.database.sqlite.path',
        type: 'string',
    },
    CLAUDE_LANCEDB_PATH: {
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
    CLAUDE_MAX_AGENTS: {
        path: 'coordination.maxAgents',
        type: 'number',
    },
    CLAUDE_HEARTBEAT_INTERVAL: {
        path: 'coordination.heartbeatInterval',
        type: 'number',
    },
    CLAUDE_COORDINATION_TIMEOUT: {
        path: 'coordination.timeout',
        type: 'number',
    },
    CLAUDE_SWARM_TOPOLOGY: {
        path: 'coordination.topology',
        type: 'string',
    },
    // Neural
    CLAUDE_ENABLE_WASM: { path: 'neural.enableWASM', type: 'boolean' },
    CLAUDE_ENABLE_SIMD: { path: 'neural.enableSIMD', type: 'boolean' },
    CLAUDE_ENABLE_CUDA: { path: 'neural.enableCUDA', type: 'boolean' },
    CLAUDE_NEURAL_BACKEND: { path: 'neural.backend', type: 'string' },
    CLAUDE_MODEL_PATH: { path: 'neural.modelPath', type: 'string' },
    // Security
    CLAUDE_ENABLE_SANDBOX: {
        path: 'core.security.enableSandbox',
        type: 'boolean',
    },
    CLAUDE_ALLOW_SHELL: {
        path: 'core.security.allowShellAccess',
        type: 'boolean',
    },
    CLAUDE_TRUSTED_HOSTS: {
        path: 'core.security.trustedHosts',
        type: 'array',
        parser: (value) => value.split(',').map((h) => h.trim()),
    },
};
/**
 * Production-ready configuration validation rules.
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
};
/**
 * Production environment validation schema.
 */
export const PRODUCTION_VALIDATION_SCHEMA = {
    required: ['NODE_ENV'],
    optional: ['CLAUDE_WEB_PORT', 'CLAUDE_MCP_PORT', 'CLAUDE_LOG_LEVEL', 'CLAUDE_MAX_AGENTS'],
    validation: {
        NODE_ENV: (value) => ['production', 'development', 'test'].includes(value),
        ANTHROPIC_API_KEY: (value) => process.env['NODE_ENV'] === 'production' ? !!value && value.length > 10 : true,
        CLAUDE_WEB_PORT: (value) => {
            const port = parseInt(value, 10);
            return !isNaN(port) && port >= 3000 && port <= 65535;
        },
        CLAUDE_MCP_PORT: (value) => {
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
 * Port allocation strategy to avoid conflicts.
 */
export const DEFAULT_PORT_ALLOCATION = {
    'interfaces.mcp.http.port': 3000, // Primary MCP server
    'interfaces.web.port': 3456, // Web dashboard
    'monitoring.dashboard.port': 3457, // Monitoring dashboard
    'development.port': 3001, // Development server if needed
    'backup.port': 3002, // Backup/failover port
};
/**
 * Environment-specific overrides for port allocation.
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
};
export class URLBuilder {
    config;
    constructor(config = DEFAULT_CONFIG) {
        this.config = config;
    }
    /**
     * Build HTTP MCP server URL.
     *
     * @param overrides
     */
    getMCPServerURL(overrides = {}) {
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
    getServiceBaseURL(service, overrides = {}) {
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
    buildURL(protocol, host, port, path) {
        const shouldOmitPort = (protocol === 'http' && port === 80) || (protocol === 'https' && port === 443);
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
export const getMCPServerURL = (overrides) => defaultURLBuilder.getMCPServerURL(overrides);
export const getWebDashboardURL = (overrides) => defaultURLBuilder.getWebDashboardURL(overrides);
export const getMonitoringDashboardURL = (overrides) => defaultURLBuilder.getMonitoringDashboardURL(overrides);
export const getCORSOrigins = () => defaultURLBuilder.getCORSOrigins();
