/**
 * USL Integration Service Factory.
 *
 * Factory for creating and managing IntegrationServiceAdapter instances.
 * With predefined configurations for different integration scenarios.
 * Provides convenience methods for Architecture Storage, Safe API, and.
 * Protocol Management integration patterns.
 */
/**
 * @file Interface implementation: integration-service-factory.
 */
import { getMCPServerURL } from '../../../config';
import { getLogger } from '../../../config/logging-config.ts';
import { createDefaultIntegrationServiceAdapterConfig, createIntegrationServiceAdapter, } from './integration-service-adapter.ts';
/**
 * Integration Service Factory.
 *
 * Creates specialized IntegrationServiceAdapter instances for different
 * integration patterns including Architecture Storage, Safe API, and.
 * Protocol Management scenarios.
 *
 * @example
 */
export class IntegrationServiceFactory {
    logger;
    options;
    createdServices = new Map();
    constructor(options = {}) {
        this.logger = getLogger('IntegrationServiceFactory');
        this.options = {
            defaultBaseURL: getMCPServerURL(),
            defaultDatabaseType: 'postgresql',
            defaultProtocols: ['http', 'websocket', 'mcp-http', 'mcp-stdio'],
            enableGlobalCaching: true,
            enableGlobalMetrics: true,
            defaultRetrySettings: {
                enabled: true,
                maxAttempts: 3,
                backoffMultiplier: 2,
            },
            defaultSecuritySettings: {
                enableValidation: true,
                enableSanitization: true,
                enableRateLimiting: true,
                enableAuditLogging: true,
            },
            ...options,
        };
        this.logger.info('IntegrationServiceFactory initialized');
    }
    /**
     * IServiceFactory implementation - create service from configuration.
     *
     * @param config
     */
    async create(config) {
        this.logger.info(`Creating integration service: ${config?.name}`);
        if (!this.canHandle(config?.type)) {
            throw new Error(`IntegrationServiceFactory cannot handle service type: ${config?.type}`);
        }
        // Convert ServiceConfig to IntegrationServiceAdapterConfig
        const adapterConfig = this.convertToAdapterConfig(config);
        const adapter = createIntegrationServiceAdapter(adapterConfig);
        await adapter.initialize();
        this.createdServices.set(config?.name, adapter);
        this.logger.info(`Integration service created successfully: ${config?.name}`);
        return adapter;
    }
    /**
     * Check if factory can handle the given service type.
     *
     * @param type
     */
    canHandle(type) {
        const integrationTypes = [
            'api',
            'safe-api',
            'architecture-storage',
            'integration',
            'protocol',
            'multi-protocol',
        ];
        return integrationTypes.includes(type.toString().toLowerCase());
    }
    /**
     * Create multiple service instances.
     *
     * @param configs
     */
    async createMultiple(configs) {
        return Promise.all(configs.map((config) => this.create(config)));
    }
    /**
     * Get a service instance by name.
     *
     * @param name
     */
    get(name) {
        return this.createdServices.get(name);
    }
    /**
     * List all managed service instances.
     */
    list() {
        return Array.from(this.createdServices.values());
    }
    /**
     * Check if a service with the given name exists.
     *
     * @param name
     */
    has(name) {
        return this.createdServices.has(name);
    }
    /**
     * Remove and destroy a service instance.
     *
     * @param name
     */
    async remove(name) {
        return await this.removeService(name);
    }
    /**
     * Check if factory supports the given service type.
     *
     * @param type
     */
    supportsType(type) {
        return this.canHandle(type);
    }
    /**
     * Start all services.
     */
    async startAll() {
        const startPromises = Array.from(this.createdServices.values()).map(async (service) => {
            try {
                await service.start();
            }
            catch (error) {
                this.logger.error(`Error starting service ${service.name}:`, error);
            }
        });
        await Promise.all(startPromises);
    }
    /**
     * Stop all services.
     */
    async stopAll() {
        const stopPromises = Array.from(this.createdServices.values()).map(async (service) => {
            try {
                await service.stop();
            }
            catch (error) {
                this.logger.error(`Error stopping service ${service.name}:`, error);
            }
        });
        await Promise.all(stopPromises);
    }
    /**
     * Health check all services.
     */
    async healthCheckAll() {
        const results = new Map();
        for (const [name, service] of this.createdServices) {
            try {
                results.set(name, await service.getStatus());
            }
            catch (error) {
                results.set(name, { health: 'unhealthy', error: error.message });
            }
        }
        return results;
    }
    /**
     * Get metrics for all services.
     */
    async getMetricsAll() {
        const results = new Map();
        for (const [name, service] of this.createdServices) {
            try {
                results.set(name, await service.getMetrics());
            }
            catch (error) {
                results.set(name, { error: error.message });
            }
        }
        return results;
    }
    /**
     * Get active service count.
     */
    getActiveCount() {
        return this.createdServices.size;
    }
    /**
     * Get services by type.
     *
     * @param type
     */
    getServicesByType(type) {
        return Array.from(this.createdServices.values()).filter((service) => service.type === type);
    }
    /**
     * Validate configuration.
     *
     * @param config
     */
    async validateConfig(config) {
        try {
            return this.canHandle(config.type) && config.name != null;
        }
        catch {
            return false;
        }
    }
    /**
     * Get configuration schema.
     *
     * @param type
     */
    getConfigSchema(type) {
        if (this.canHandle(type)) {
            return {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string' },
                    enabled: { type: 'boolean' },
                    timeout: { type: 'number' },
                },
                required: ['name', 'type'],
            };
        }
        return undefined;
    }
    /**
     * Get supported service types.
     */
    getSupportedTypes() {
        return ['api', 'safe-api', 'architecture-storage', 'integration'];
    }
    /**
     * Create Architecture Storage integration adapter.
     *
     * @param name
     * @param databaseType
     * @param options
     */
    async createArchitectureStorageAdapter(name, databaseType = 'postgresql', options = {}) {
        this.logger.info(`Creating Architecture Storage adapter: ${name}`);
        const config = createDefaultIntegrationServiceAdapterConfig(name, {
            architectureStorage: {
                enabled: true,
                databaseType: databaseType || this.options.defaultDatabaseType,
                autoInitialize: true,
                enableVersioning: true,
                enableValidationTracking: true,
                ...(this.options.enableGlobalCaching !== undefined && {
                    cachingEnabled: this.options.enableGlobalCaching,
                }),
            },
            safeAPI: { enabled: false },
            protocolManagement: {
                enabled: false,
                supportedProtocols: [],
                defaultProtocol: 'http',
            },
            cache: {
                enabled: this.options.enableGlobalCaching ?? true,
                strategy: 'memory',
                defaultTTL: 600000,
                maxSize: 1000,
                keyPrefix: `arch-storage-${name}:`,
            },
            retry: this.options.defaultRetrySettings
                ? {
                    ...this.options.defaultRetrySettings,
                    retryableOperations: this.options.defaultRetrySettings.retryableOperations || [
                        'architecture-save',
                        'architecture-retrieve',
                        'architecture-update',
                        'architecture-search',
                    ],
                }
                : undefined,
            security: this.options.defaultSecuritySettings,
            performance: {
                enableRequestDeduplication: true,
                connectionPooling: true,
                maxConcurrency: 10,
                ...(this.options.enableGlobalMetrics !== undefined && {
                    enableMetricsCollection: this.options.enableGlobalMetrics,
                }),
            },
            ...options,
        });
        const adapter = createIntegrationServiceAdapter(config);
        await adapter.initialize();
        this.createdServices.set(name, adapter);
        this.logger.info(`Architecture Storage adapter created: ${name}`);
        return adapter;
    }
    /**
     * Create Safe API integration adapter.
     *
     * @param name
     * @param baseURL
     * @param options
     */
    async createSafeAPIAdapter(name, baseURL, options = {}) {
        this.logger.info(`Creating Safe API adapter: ${name}`);
        const config = createDefaultIntegrationServiceAdapterConfig(name, {
            architectureStorage: { enabled: false },
            safeAPI: {
                enabled: true,
                baseURL: baseURL || this.options.defaultBaseURL,
                timeout: 30000,
                retries: 3,
                rateLimiting: {
                    enabled: true,
                    requestsPerSecond: 100,
                    burstSize: 200,
                },
                authentication: {
                    type: 'bearer',
                },
                validation: {
                    enabled: true,
                    strictMode: false,
                    sanitization: true,
                },
            },
            protocolManagement: {
                enabled: false,
                supportedProtocols: [],
                defaultProtocol: 'http',
            },
            cache: {
                enabled: this.options.enableGlobalCaching ?? true,
                strategy: 'memory',
                defaultTTL: 300000, // 5 minutes for API responses
                maxSize: 500,
                keyPrefix: `safe-api-${name}:`,
            },
            retry: this.options.defaultRetrySettings
                ? {
                    ...this.options.defaultRetrySettings,
                    retryableOperations: this.options.defaultRetrySettings.retryableOperations || [
                        'api-get',
                        'api-post',
                        'api-put',
                        'api-delete',
                    ],
                }
                : undefined,
            security: this.options.defaultSecuritySettings,
            performance: {
                enableRequestDeduplication: true,
                connectionPooling: true,
                maxConcurrency: 20,
                ...(this.options.enableGlobalMetrics !== undefined && {
                    enableMetricsCollection: this.options.enableGlobalMetrics,
                }),
            },
            ...options,
        });
        const adapter = createIntegrationServiceAdapter(config);
        await adapter.initialize();
        this.createdServices.set(name, adapter);
        this.logger.info(`Safe API adapter created: ${name}`);
        return adapter;
    }
    /**
     * Create Protocol Management integration adapter.
     *
     * @param name
     * @param supportedProtocols
     * @param options
     */
    async createProtocolManagementAdapter(name, supportedProtocols, options = {}) {
        this.logger.info(`Creating Protocol Management adapter: ${name}`);
        const protocols = supportedProtocols || this.options.defaultProtocols || ['http', 'websocket'];
        const config = createDefaultIntegrationServiceAdapterConfig(name, {
            architectureStorage: { enabled: false },
            safeAPI: { enabled: false },
            protocolManagement: {
                enabled: true,
                supportedProtocols: protocols,
                defaultProtocol: protocols[0] || 'http',
                connectionPooling: {
                    enabled: true,
                    maxConnections: 50,
                    idleTimeout: 300000,
                },
                failover: {
                    enabled: true,
                    retryAttempts: 3,
                    backoffMultiplier: 2,
                },
                healthChecking: {
                    enabled: true,
                    interval: 30000,
                    timeout: 5000,
                },
            },
            multiProtocol: {
                enableProtocolSwitching: true,
                protocolPriorityOrder: protocols,
                enableLoadBalancing: true,
                enableCircuitBreaker: true,
            },
            cache: {
                enabled: this.options.enableGlobalCaching ?? true,
                strategy: 'memory',
                defaultTTL: 120000, // 2 minutes for protocol data
                maxSize: 200,
                keyPrefix: `protocol-mgmt-${name}:`,
            },
            retry: this.options.defaultRetrySettings
                ? {
                    ...this.options.defaultRetrySettings,
                    retryableOperations: this.options.defaultRetrySettings.retryableOperations || [
                        'protocol-connect',
                        'protocol-send',
                        'protocol-healthcheck',
                    ],
                }
                : undefined,
            security: this.options.defaultSecuritySettings,
            performance: {
                enableRequestDeduplication: false, // Protocols may need exact message delivery
                connectionPooling: true,
                maxConcurrency: 30,
                ...(this.options.enableGlobalMetrics !== undefined && {
                    enableMetricsCollection: this.options.enableGlobalMetrics,
                }),
            },
            ...options,
        });
        const adapter = createIntegrationServiceAdapter(config);
        await adapter.initialize();
        this.createdServices.set(name, adapter);
        this.logger.info(`Protocol Management adapter created: ${name}`);
        return adapter;
    }
    /**
     * Create unified integration adapter (all features enabled).
     *
     * @param name
     * @param options.
     * @param options
     */
    async createUnifiedIntegrationAdapter(name, options = {}) {
        this.logger.info(`Creating Unified Integration adapter: ${name}`);
        const { baseURL = this.options.defaultBaseURL, databaseType = this.options.defaultDatabaseType, supportedProtocols = this.options.defaultProtocols, ...adapterOptions } = options;
        const config = createDefaultIntegrationServiceAdapterConfig(name, {
            architectureStorage: {
                enabled: true,
                ...(databaseType !== undefined && { databaseType }),
                autoInitialize: true,
                enableVersioning: true,
                enableValidationTracking: true,
                cachingEnabled: true,
            },
            safeAPI: {
                enabled: true,
                baseURL,
                timeout: 30000,
                retries: 3,
                rateLimiting: {
                    enabled: true,
                    requestsPerSecond: 100,
                    burstSize: 200,
                },
                authentication: {
                    type: 'bearer',
                },
                validation: {
                    enabled: true,
                    strictMode: false,
                    sanitization: true,
                },
            },
            protocolManagement: {
                enabled: true,
                supportedProtocols: supportedProtocols ?? ['http'],
                defaultProtocol: supportedProtocols?.[0] || 'http',
                connectionPooling: {
                    enabled: true,
                    maxConnections: 50,
                    idleTimeout: 300000,
                },
                failover: {
                    enabled: true,
                    retryAttempts: 3,
                    backoffMultiplier: 2,
                },
                healthChecking: {
                    enabled: true,
                    interval: 30000,
                    timeout: 5000,
                },
            },
            multiProtocol: {
                enableProtocolSwitching: true,
                protocolPriorityOrder: supportedProtocols || ['http', 'websocket'],
                enableLoadBalancing: true,
                enableCircuitBreaker: true,
            },
            cache: {
                enabled: this.options.enableGlobalCaching ?? true,
                strategy: 'memory',
                defaultTTL: 600000,
                maxSize: 2000, // Larger cache for unified service
                keyPrefix: `unified-integration-${name}:`,
            },
            retry: this.options.defaultRetrySettings
                ? {
                    ...this.options.defaultRetrySettings,
                    retryableOperations: this.options.defaultRetrySettings.retryableOperations || [
                        'architecture-save',
                        'architecture-retrieve',
                        'api-get',
                        'api-post',
                        'protocol-connect',
                    ],
                }
                : undefined,
            security: this.options.defaultSecuritySettings,
            performance: {
                enableRequestDeduplication: true,
                connectionPooling: true,
                maxConcurrency: 50,
                ...(this.options.enableGlobalMetrics !== undefined && {
                    enableMetricsCollection: this.options.enableGlobalMetrics,
                }),
            },
            ...adapterOptions,
        });
        const adapter = createIntegrationServiceAdapter(config);
        await adapter.initialize();
        this.createdServices.set(name, adapter);
        this.logger.info(`Unified Integration adapter created: ${name}`);
        return adapter;
    }
    /**
     * Create Web Data integration adapter (specialized for web-based data operations).
     *
     * @param name
     * @param baseURL
     * @param options.
     * @param options
     */
    async createWebDataIntegrationAdapter(name, baseURL, options = {}) {
        this.logger.info(`Creating Web Data Integration adapter: ${name}`);
        const config = createDefaultIntegrationServiceAdapterConfig(name, {
            architectureStorage: { enabled: false },
            safeAPI: {
                enabled: true,
                baseURL,
                timeout: 60000, // Longer timeout for data operations
                retries: 5, // More retries for data operations
                rateLimiting: {
                    enabled: true,
                    requestsPerSecond: 50, // Conservative for data operations
                    burstSize: 100,
                },
                validation: {
                    enabled: true,
                    strictMode: true, // Strict validation for data
                    sanitization: true,
                },
            },
            protocolManagement: {
                enabled: true,
                supportedProtocols: ['http', 'websocket'],
                defaultProtocol: 'http',
            },
            cache: {
                enabled: true,
                strategy: 'memory',
                defaultTTL: 1800000, // 30 minutes for data
                maxSize: 1000,
                keyPrefix: `web-data-${name}:`,
            },
            retry: {
                enabled: true,
                maxAttempts: 5,
                backoffMultiplier: 2,
                retryableOperations: [
                    'api-get',
                    'api-post',
                    'api-put',
                    'api-delete',
                    'api-get-resource',
                    'api-list-resources',
                ],
            },
            security: {
                enableRequestValidation: true,
                enableResponseSanitization: true,
                enableRateLimiting: true,
                enableAuditLogging: true,
            },
            performance: {
                enableMetricsCollection: true,
                enableRequestDeduplication: true,
                connectionPooling: true,
                maxConcurrency: 15, // Conservative for data operations
            },
            ...options,
        });
        const adapter = createIntegrationServiceAdapter(config);
        await adapter.initialize();
        this.createdServices.set(name, adapter);
        this.logger.info(`Web Data Integration adapter created: ${name}`);
        return adapter;
    }
    /**
     * Create Document integration adapter (specialized for document operations).
     *
     * @param name
     * @param databaseType
     * @param options.
     * @param options
     */
    async createDocumentIntegrationAdapter(name, databaseType = 'postgresql', options = {}) {
        this.logger.info(`Creating Document Integration adapter: ${name}`);
        const config = createDefaultIntegrationServiceAdapterConfig(name, {
            architectureStorage: {
                enabled: true,
                databaseType,
                autoInitialize: true,
                enableVersioning: true,
                enableValidationTracking: true,
                cachingEnabled: true,
            },
            safeAPI: { enabled: false },
            protocolManagement: {
                enabled: false,
                supportedProtocols: [],
                defaultProtocol: 'http',
            },
            cache: {
                enabled: true,
                strategy: 'memory',
                defaultTTL: 3600000, // 1 hour for documents
                maxSize: 500,
                keyPrefix: `document-${name}:`,
            },
            retry: {
                enabled: true,
                maxAttempts: 3,
                backoffMultiplier: 1.5, // Gentler backoff for database operations
                retryableOperations: [
                    'architecture-save',
                    'architecture-retrieve',
                    'architecture-update',
                    'architecture-search',
                    'architecture-validation-save',
                ],
            },
            security: {
                enableRequestValidation: true,
                enableResponseSanitization: false, // Documents might contain special content
                enableRateLimiting: false, // No rate limiting for database operations
                enableAuditLogging: true,
            },
            performance: {
                enableMetricsCollection: true,
                enableRequestDeduplication: true,
                connectionPooling: true,
                maxConcurrency: 10, // Conservative for database operations
            },
            ...options,
        });
        const adapter = createIntegrationServiceAdapter(config);
        await adapter.initialize();
        this.createdServices.set(name, adapter);
        this.logger.info(`Document Integration adapter created: ${name}`);
        return adapter;
    }
    /**
     * Get all created services.
     */
    getCreatedServices() {
        return new Map(this.createdServices);
    }
    /**
     * Get service by name.
     *
     * @param name
     */
    getService(name) {
        return this.createdServices.get(name);
    }
    /**
     * Check if service exists.
     *
     * @param name
     */
    hasService(name) {
        return this.createdServices.has(name);
    }
    /**
     * Remove service from tracking.
     *
     * @param name
     */
    async removeService(name) {
        const service = this.createdServices.get(name);
        if (service) {
            try {
                await service.destroy();
                this.createdServices.delete(name);
                this.logger.info(`Service removed: ${name}`);
                return true;
            }
            catch (error) {
                this.logger.error(`Failed to remove service ${name}:`, error);
                return false;
            }
        }
        return false;
    }
    /**
     * Get factory statistics.
     */
    getFactoryStats() {
        const serviceTypes = {};
        let memoryUsage = 0;
        this.createdServices.forEach((service) => {
            const type = service.type;
            serviceTypes[type] = (serviceTypes[type] || 0) + 1;
            // Estimate memory usage (would need actual implementation)
            memoryUsage += 1000; // Rough estimate
        });
        return {
            totalCreatedServices: this.createdServices.size,
            activeServices: this.createdServices.size, // All tracked services are active
            serviceTypes,
            memoryUsage,
        };
    }
    /**
     * Shutdown all created services.
     */
    async shutdown() {
        this.logger.info('Shutting down IntegrationServiceFactory');
        const shutdownPromises = Array.from(this.createdServices.values()).map(async (service) => {
            try {
                await service.destroy();
            }
            catch (error) {
                this.logger.error(`Error shutting down service ${service.name}:`, error);
            }
        });
        await Promise.all(shutdownPromises);
        this.createdServices.clear();
        this.logger.info('IntegrationServiceFactory shutdown complete');
    }
    /**
     * Convert ServiceConfig to IntegrationServiceAdapterConfig.
     *
     * @param config
     */
    convertToAdapterConfig(config) {
        // Start with default configuration
        const adapterConfig = createDefaultIntegrationServiceAdapterConfig(config?.name);
        // Apply common ServiceConfig properties
        adapterConfig.enabled = config?.enabled ?? true;
        adapterConfig.timeout = config?.timeout ?? 30000;
        // Apply health configuration if present
        if (config?.health) {
            adapterConfig.health = { ...adapterConfig?.health, ...config?.health };
        }
        // Apply monitoring configuration if present
        if (config?.monitoring) {
            adapterConfig.monitoring = { ...adapterConfig?.monitoring, ...config?.monitoring };
        }
        // Apply global factory settings
        if (this.options.enableGlobalCaching !== undefined) {
            adapterConfig.cache = {
                enabled: this.options.enableGlobalCaching,
                strategy: adapterConfig?.cache?.strategy || 'memory',
                defaultTTL: adapterConfig?.cache?.defaultTTL || 300000,
                maxSize: adapterConfig?.cache?.maxSize || 1000,
                keyPrefix: adapterConfig?.cache?.keyPrefix || 'default:',
            };
        }
        if (this.options.enableGlobalMetrics !== undefined) {
            adapterConfig.performance = {
                ...adapterConfig?.performance,
                enableMetricsCollection: this.options.enableGlobalMetrics,
            };
        }
        if (this.options.defaultRetrySettings) {
            adapterConfig.retry = {
                enabled: this.options.defaultRetrySettings.enabled,
                maxAttempts: this.options.defaultRetrySettings.maxAttempts,
                backoffMultiplier: this.options.defaultRetrySettings.backoffMultiplier,
                retryableOperations: this.options.defaultRetrySettings.retryableOperations || [],
            };
        }
        if (this.options.defaultSecuritySettings) {
            adapterConfig.security = {
                ...adapterConfig?.security,
                ...this.options.defaultSecuritySettings,
            };
        }
        return adapterConfig;
    }
}
/**
 * Global integration service factory instance.
 */
export const integrationServiceFactory = new IntegrationServiceFactory();
/**
 * Convenience functions for creating integration services.
 */
export const IntegrationServiceHelpers = {
    /**
     * Create architecture storage service.
     *
     * @param name
     * @param databaseType
     */
    async createArchitectureStorage(name, databaseType = 'postgresql') {
        return await integrationServiceFactory.createArchitectureStorageAdapter(name, databaseType);
    },
    /**
     * Create safe API service.
     *
     * @param name
     * @param baseURL
     */
    async createSafeAPI(name, baseURL) {
        return await integrationServiceFactory.createSafeAPIAdapter(name, baseURL);
    },
    /**
     * Create protocol management service.
     *
     * @param name
     * @param protocols
     */
    async createProtocolManagement(name, protocols = ['http', 'websocket']) {
        return await integrationServiceFactory.createProtocolManagementAdapter(name, protocols);
    },
    /**
     * Create unified integration service.
     *
     * @param name
     * @param options
     * @param options.baseURL
     * @param options.databaseType
     * @param options.supportedProtocols
     */
    async createUnifiedIntegration(name, options = {}) {
        return await integrationServiceFactory.createUnifiedIntegrationAdapter(name, options);
    },
    /**
     * Create web data integration service.
     *
     * @param name
     * @param baseURL
     */
    async createWebDataIntegration(name, baseURL) {
        return await integrationServiceFactory.createWebDataIntegrationAdapter(name, baseURL);
    },
    /**
     * Create document integration service.
     *
     * @param name
     * @param databaseType
     */
    async createDocumentIntegration(name, databaseType = 'postgresql') {
        return await integrationServiceFactory.createDocumentIntegrationAdapter(name, databaseType);
    },
};
export default integrationServiceFactory;
