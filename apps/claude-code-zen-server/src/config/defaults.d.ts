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
import type { SystemConfiguration } from '../types/system-config';
/**
 * Default system configuration.
 */
export declare const DEFAULT_CONFIG: SystemConfiguration;
/**
 * Environment variable mappings.
 */
export declare const ENV_MAPPINGS: {
    readonly ZEN_LOG_LEVEL: {
        readonly path: "core.logger.level";
        readonly type: "string";
    };
    readonly ZEN_LOG_CONSOLE: {
        readonly path: "core.logger.console";
        readonly type: "boolean";
    };
    readonly ZEN_LOG_FILE: {
        readonly path: "core.logger.file";
        readonly type: "string";
    };
    readonly ZEN_ENABLE_METRICS: {
        readonly path: "core.performance.enableMetrics";
        readonly type: "boolean";
    };
    readonly ZEN_METRICS_INTERVAL: {
        readonly path: "core.performance.metricsInterval";
        readonly type: "number";
    };
    readonly WEB_PORT: {
        readonly path: "interfaces.web.port";
        readonly type: "number";
    };
    readonly WEB_HOST: {
        readonly path: "interfaces.web.host";
        readonly type: "string";
    };
    readonly ZEN_MEMORY_BACKEND: {
        readonly path: "storage.memory.backend";
        readonly type: "string";
    };
    readonly ZEN_MEMORY_DIR: {
        readonly path: "storage.memory.directory";
        readonly type: "string";
    };
    readonly ZEN_DB_PATH: {
        readonly path: "storage.database.sqlite.path";
        readonly type: "string";
    };
    readonly ZEN_LANCEDB_PATH: {
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
    readonly ZEN_MAX_AGENTS: {
        readonly path: "coordination.maxAgents";
        readonly type: "number";
    };
    readonly ZEN_HEARTBEAT_INTERVAL: {
        readonly path: "coordination.heartbeatInterval";
        readonly type: "number";
    };
    readonly ZEN_COORDINATION_TIMEOUT: {
        readonly path: "coordination.timeout";
        readonly type: "number";
    };
    readonly ZEN_SWARM_TOPOLOGY: {
        readonly path: "coordination.topology";
        readonly type: "string";
    };
    readonly ZEN_ENABLE_WASM: {
        readonly path: "neural.enableWASM";
        readonly type: "boolean";
    };
    readonly ZEN_ENABLE_SIMD: {
        readonly path: "neural.enableSIMD";
        readonly type: "boolean";
    };
    readonly ZEN_ENABLE_CUDA: {
        readonly path: "neural.enableCUDA";
        readonly type: "boolean";
    };
    readonly ZEN_NEURAL_BACKEND: {
        readonly path: "neural.backend";
        readonly type: "string";
    };
    readonly ZEN_NEURAL_MODEL_PATH: {
        readonly path: "neural.modelPath";
        readonly type: "string";
    };
    readonly ZEN_ENABLE_SANDBOX: {
        readonly path: "core.security.enableSandbox";
        readonly type: "boolean";
    };
    readonly ZEN_ALLOW_SHELL: {
        readonly path: "core.security.allowShellAccess";
        readonly type: "boolean";
    };
    readonly ZEN_TRUSTED_HOSTS: {
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
        [key: string]: (value: unknown) => boolean;
    };
    production: {
        enforced: string[];
        forbidden: string[];
        fallbacks: {
            [key: string]: unknown;
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
export declare const PRODUCTION_VALIDATION_SCHEMA: ConfigValidationSchema;
/**
 * URL Builder Configuration and Utilities.
 *
 * Comprehensive URL construction system consolidated from url-builder.ts.
 * Provides type-safe, environment-aware URL building capabilities for
 * all system services including web dashboards, monitoring
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
 *   path: '/v1/api'
 * };
 *
 * // Used with URLBuilder
 * const builder = new URLBuilder(systemConfig);
 * const url = builder.buildURL('web', config);
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
export declare class URLBuilder {
    private config;
    constructor(config?: SystemConfiguration);
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
    getServiceBaseURL(service: 'web' | 'monitoring', overrides?: Partial<URLBuilderConfig>): string;
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
export declare const getWebDashboardURL: (overrides?: Partial<URLBuilderConfig>) => string;
export declare const getMonitoringDashboardURL: (overrides?: Partial<URLBuilderConfig>) => string;
export declare const getCORSOrigins: () => string[];
//# sourceMappingURL=defaults.d.ts.map