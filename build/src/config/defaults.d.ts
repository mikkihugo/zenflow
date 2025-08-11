/**
 * @file Defaults implementation.
 */
import type { SystemConfiguration } from './types.ts';
/**
 * Default system configuration.
 */
export declare const DEFAULT_CONFIG: SystemConfiguration;
/**
 * Environment variable mappings.
 */
export declare const ENV_MAPPINGS: {
    readonly CLAUDE_LOG_LEVEL: {
        readonly path: "core.logger.level";
        readonly type: "string";
    };
    readonly CLAUDE_LOG_CONSOLE: {
        readonly path: "core.logger.console";
        readonly type: "boolean";
    };
    readonly CLAUDE_LOG_FILE: {
        readonly path: "core.logger.file";
        readonly type: "string";
    };
    readonly CLAUDE_ENABLE_METRICS: {
        readonly path: "core.performance.enableMetrics";
        readonly type: "boolean";
    };
    readonly CLAUDE_METRICS_INTERVAL: {
        readonly path: "core.performance.metricsInterval";
        readonly type: "number";
    };
    readonly CLAUDE_WEB_PORT: {
        readonly path: "interfaces.web.port";
        readonly type: "number";
    };
    readonly CLAUDE_WEB_HOST: {
        readonly path: "interfaces.web.host";
        readonly type: "string";
    };
    readonly CLAUDE_MCP_PORT: {
        readonly path: "interfaces.mcp.http.port";
        readonly type: "number";
    };
    readonly CLAUDE_MCP_HOST: {
        readonly path: "interfaces.mcp.http.host";
        readonly type: "string";
    };
    readonly CLAUDE_MCP_TIMEOUT: {
        readonly path: "interfaces.mcp.http.timeout";
        readonly type: "number";
    };
    readonly CLAUDE_MEMORY_BACKEND: {
        readonly path: "storage.memory.backend";
        readonly type: "string";
    };
    readonly CLAUDE_MEMORY_DIR: {
        readonly path: "storage.memory.directory";
        readonly type: "string";
    };
    readonly CLAUDE_DB_PATH: {
        readonly path: "storage.database.sqlite.path";
        readonly type: "string";
    };
    readonly CLAUDE_LANCEDB_PATH: {
        readonly path: "storage.database.lancedb.path";
        readonly type: "string";
    };
    readonly POOL_MAX_READERS: {
        readonly path: "storage.database.persistence.maxReaders";
        readonly type: "number";
    };
    readonly POOL_MAX_WORKERS: {
        readonly path: "storage.database.persistence.maxWorkers";
        readonly type: "number";
    };
    readonly POOL_MMAP_SIZE: {
        readonly path: "storage.database.persistence.mmapSize";
        readonly type: "number";
    };
    readonly POOL_CACHE_SIZE: {
        readonly path: "storage.database.persistence.cacheSize";
        readonly type: "number";
    };
    readonly POOL_ENABLE_BACKUP: {
        readonly path: "storage.database.persistence.enableBackup";
        readonly type: "boolean";
    };
    readonly CLAUDE_MAX_AGENTS: {
        readonly path: "coordination.maxAgents";
        readonly type: "number";
    };
    readonly CLAUDE_HEARTBEAT_INTERVAL: {
        readonly path: "coordination.heartbeatInterval";
        readonly type: "number";
    };
    readonly CLAUDE_COORDINATION_TIMEOUT: {
        readonly path: "coordination.timeout";
        readonly type: "number";
    };
    readonly CLAUDE_SWARM_TOPOLOGY: {
        readonly path: "coordination.topology";
        readonly type: "string";
    };
    readonly CLAUDE_ENABLE_WASM: {
        readonly path: "neural.enableWASM";
        readonly type: "boolean";
    };
    readonly CLAUDE_ENABLE_SIMD: {
        readonly path: "neural.enableSIMD";
        readonly type: "boolean";
    };
    readonly CLAUDE_ENABLE_CUDA: {
        readonly path: "neural.enableCUDA";
        readonly type: "boolean";
    };
    readonly CLAUDE_NEURAL_BACKEND: {
        readonly path: "neural.backend";
        readonly type: "string";
    };
    readonly CLAUDE_MODEL_PATH: {
        readonly path: "neural.modelPath";
        readonly type: "string";
    };
    readonly CLAUDE_ENABLE_SANDBOX: {
        readonly path: "core.security.enableSandbox";
        readonly type: "boolean";
    };
    readonly CLAUDE_ALLOW_SHELL: {
        readonly path: "core.security.allowShellAccess";
        readonly type: "boolean";
    };
    readonly CLAUDE_TRUSTED_HOSTS: {
        readonly path: "core.security.trustedHosts";
        readonly type: "array";
        readonly parser: (value: string) => string[];
    };
};
/**
 * Configuration validation schema with production safety.
 *
 * @example
 */
export interface ConfigValidationSchema {
    required: string[];
    optional: string[];
    validation: {
        [key: string]: (value: any) => boolean;
    };
    production: {
        enforced: string[];
        forbidden: string[];
        fallbacks: {
            [key: string]: any;
        };
    };
    portRanges: {
        development: {
            min: number;
            max: number;
        };
        production: {
            min: number;
            max: number;
        };
    };
}
/**
 * Production-ready configuration validation rules.
 */
export declare const VALIDATION_RULES: {
    readonly 'core.logger.level': {
        readonly type: "string";
        readonly enum: readonly ["debug", "info", "warn", "error"];
        readonly productionDefault: "info";
        readonly required: false;
    };
    readonly 'interfaces.web.port': {
        readonly type: "number";
        readonly min: 1;
        readonly max: 65535;
        readonly productionMin: 3000;
        readonly productionMax: 65535;
        readonly conflictCheck: true;
        readonly fallback: 3456;
    };
    readonly 'interfaces.mcp.http.port': {
        readonly type: "number";
        readonly min: 1;
        readonly max: 65535;
        readonly productionMin: 3000;
        readonly productionMax: 65535;
        readonly conflictCheck: true;
        readonly fallback: 3000;
    };
    readonly 'coordination.maxAgents': {
        readonly type: "number";
        readonly min: 1;
        readonly max: 1000;
        readonly productionMax: 100;
        readonly required: false;
        readonly fallback: 10;
    };
    readonly 'coordination.topology': {
        readonly type: "string";
        readonly enum: readonly ["mesh", "hierarchical", "ring", "star"];
        readonly productionRecommended: readonly ["hierarchical", "ring"];
        readonly fallback: "hierarchical";
    };
    readonly 'neural.backend': {
        readonly type: "string";
        readonly enum: readonly ["wasm", "native", "fallback"];
        readonly productionRecommended: readonly ["wasm", "fallback"];
        readonly fallback: "wasm";
    };
    readonly 'storage.memory.backend': {
        readonly type: "string";
        readonly enum: readonly ["sqlite", "lancedb", "json"];
        readonly productionRecommended: readonly ["sqlite", "lancedb"];
        readonly fallback: "sqlite";
    };
    readonly 'core.security.enableSandbox': {
        readonly type: "boolean";
        readonly productionRequired: true;
        readonly fallback: true;
    };
    readonly 'core.security.allowShellAccess': {
        readonly type: "boolean";
        readonly productionForbidden: true;
        readonly fallback: false;
    };
    readonly 'storage.database.sqlite.maxConnections': {
        readonly type: "number";
        readonly min: 1;
        readonly max: 100;
        readonly productionMax: 50;
        readonly fallback: 10;
    };
    readonly 'storage.memory.maxMemorySize': {
        readonly type: "number";
        readonly min: number;
        readonly productionMin: number;
        readonly fallback: number;
    };
};
/**
 * Production environment validation schema.
 */
export declare const PRODUCTION_VALIDATION_SCHEMA: ConfigValidationSchema;
/**
 * Port allocation strategy to avoid conflicts.
 */
export declare const DEFAULT_PORT_ALLOCATION: {
    readonly 'interfaces.mcp.http.port': 3000;
    readonly 'interfaces.web.port': 3456;
    readonly 'monitoring.dashboard.port': 3457;
    readonly 'development.port': 3001;
    readonly 'backup.port': 3002;
};
/**
 * Environment-specific overrides for port allocation.
 */
export declare const PORT_ALLOCATION_BY_ENV: {
    readonly development: {
        readonly 'interfaces.mcp.http.port': 3000;
        readonly 'interfaces.web.port': 3456;
        readonly 'monitoring.dashboard.port': 3457;
    };
    readonly production: {
        readonly 'interfaces.mcp.http.port': number;
        readonly 'interfaces.web.port': number;
        readonly 'monitoring.dashboard.port': number;
    };
    readonly test: {
        readonly 'interfaces.mcp.http.port': 3100;
        readonly 'interfaces.web.port': 3556;
        readonly 'monitoring.dashboard.port': 3557;
    };
};
/**
 * URL Builder Configuration and Utilities (consolidated from url-builder.ts).
 */
export interface URLBuilderConfig {
    protocol?: 'http' | 'https';
    host?: string;
    port?: number;
    path?: string;
}
export declare class URLBuilder {
    private config;
    constructor(config?: SystemConfiguration);
    /**
     * Build HTTP MCP server URL.
     *
     * @param overrides
     */
    getMCPServerURL(overrides?: Partial<URLBuilderConfig>): string;
    /**
     * Build web dashboard URL.
     *
     * @param overrides
     */
    getWebDashboardURL(overrides?: Partial<URLBuilderConfig>): string;
    /**
     * Build monitoring dashboard URL.
     *
     * @param overrides
     */
    getMonitoringDashboardURL(overrides?: Partial<URLBuilderConfig>): string;
    /**
     * Build CORS origins array.
     */
    getCORSOrigins(): string[];
    /**
     * Get service base URL.
     *
     * @param service
     * @param overrides
     */
    getServiceBaseURL(service: 'mcp' | 'web' | 'monitoring', overrides?: Partial<URLBuilderConfig>): string;
    /**
     * Build a URL from components.
     *
     * @param protocol
     * @param host
     * @param port
     * @param path
     */
    private buildURL;
    /**
     * Get protocol based on environment and configuration.
     */
    private getProtocol;
    /**
     * Update configuration.
     *
     * @param config
     */
    updateConfig(config: SystemConfiguration): void;
}
/**
 * Default URL builder instance using default configuration.
 */
export declare const defaultURLBuilder: URLBuilder;
/**
 * Create URL builder with custom configuration.
 *
 * @param config
 */
export declare const createURLBuilder: (config: SystemConfiguration) => URLBuilder;
/**
 * Convenience functions using default builder.
 *
 * @param overrides
 */
export declare const getMCPServerURL: (overrides?: Partial<URLBuilderConfig>) => string;
export declare const getWebDashboardURL: (overrides?: Partial<URLBuilderConfig>) => string;
export declare const getMonitoringDashboardURL: (overrides?: Partial<URLBuilderConfig>) => string;
export declare const getCORSOrigins: () => string[];
//# sourceMappingURL=defaults.d.ts.map