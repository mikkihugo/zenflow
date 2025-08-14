import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('interfaces-services-index');
import { createDefaultIntegrationServiceAdapterConfig, globalDataServiceFactory, } from './adapters/index.js';
import { USLCompatibilityLayer } from './compatibility.ts';
import { ServiceDependencyError } from './core/interfaces.ts';
import { globalServiceCapabilityRegistry, globalServiceRegistry, globalUSLFactory, } from './factories.ts';
import { ServiceConfigFactory, ServiceType, } from './types.ts';
export { createDataServiceAdapter, createDefaultDataServiceAdapterConfig, createDefaultIntegrationServiceAdapterConfig, DataServiceAdapter, DataServiceFactory, DataServiceHelper, DataServiceUtils, globalDataServiceFactory, IntegrationServiceAdapter, IntegrationServiceFactory, IntegrationServiceHelper, IntegrationServiceUtils, integrationServiceFactory, } from './adapters/index.js';
export { initializeCompatibility, MigrationUtils, } from './compatibility.ts';
let _compat;
let _usl;
function initializeGlobals() {
    if (!_compat) {
        _compat = new USLCompatibilityLayer();
    }
    if (!_usl) {
        _usl = USL.getInstance();
        _compat.setUSLInstance(_usl);
    }
    return { compat: _compat, usl: _usl };
}
export const compat = (() => {
    const globals = initializeGlobals();
    return globals.compat;
})();
export { ServiceConfigurationError, ServiceDependencyError, ServiceError, ServiceInitializationError, ServiceOperationError, ServiceTimeoutError, } from './core/interfaces.ts';
export { globalServiceCapabilityRegistry, globalServiceConfigValidator, globalServiceRegistry, globalUSLFactory, ServiceCapabilityRegistry, ServiceConfigValidator, ServiceRegistry, USLFactory, } from './factories.ts';
export { ServiceManager, } from './manager.ts';
export { EnhancedServiceRegistry, } from './registry.ts';
export { isCoordinationServiceConfig, isDatabaseServiceConfig, isDataServiceConfig, isIntegrationServiceConfig, isMemoryServiceConfig, isMonitoringServiceConfig, isNeuralServiceConfig, isWebServiceConfig, ServiceConfigFactory, ServiceEnvironment, ServicePriority, ServiceType, } from './types.ts';
export { USLValidationFramework, } from './validation.ts';
export class USL {
    static instance;
    initialized = false;
    constructor() { }
    static getInstance() {
        if (!USL.instance) {
            USL.instance = new USL();
        }
        return USL.instance;
    }
    async initialize(_config) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
    }
    isInitialized() {
        return this.initialized;
    }
    async createDataService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = ServiceConfigFactory.createDataServiceConfig(name, {
            type: ServiceType.DATA,
            ...options,
        });
        return globalUSLFactory.create(config);
    }
    async createWebDataService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const adapter = await globalDataServiceFactory.createWebDataAdapter(name, options);
        return adapter;
    }
    async createDocumentService(name, databaseType = 'postgresql', options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const adapter = await globalDataServiceFactory.createDocumentAdapter(name, databaseType, options);
        return adapter;
    }
    async createUnifiedDataService(name, databaseType = 'postgresql', options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const adapter = await globalDataServiceFactory.createUnifiedDataAdapter(name, databaseType, options);
        return adapter;
    }
    async createWebService(name, port = 3000, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = ServiceConfigFactory.createWebServiceConfig(name, {
            type: ServiceType.WEB,
            server: { port, host: 'localhost' },
            ...options,
        });
        return globalUSLFactory.create(config);
    }
    async createCoordinationService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = ServiceConfigFactory.createCoordinationServiceConfig(name, {
            type: ServiceType.SWARM,
            ...options,
        });
        return globalUSLFactory.create(config);
    }
    async createNeuralService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = ServiceConfigFactory.createNeuralServiceConfig(name, {
            type: ServiceType.NEURAL,
            ...options,
        });
        return globalUSLFactory.create(config);
    }
    async createMemoryService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = ServiceConfigFactory.createMemoryServiceConfig(name, {
            type: ServiceType.MEMORY,
            ...options,
        });
        return globalUSLFactory.create(config);
    }
    async createDatabaseService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = ServiceConfigFactory.createDatabaseServiceConfig(name, {
            type: ServiceType.DATABASE,
            ...options,
        });
        return globalUSLFactory.create(config);
    }
    async createIntegrationService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = ServiceConfigFactory.createIntegrationServiceConfig(name, {
            type: ServiceType.API,
            ...options,
        });
        return globalUSLFactory.create(config);
    }
    async createIntegrationServiceAdapter(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = createDefaultIntegrationServiceAdapterConfig(name, options);
        const { createIntegrationServiceAdapter } = await import('./adapters/index.js');
        const adapter = createIntegrationServiceAdapter(config);
        await adapter.initialize();
        return adapter;
    }
    async createArchitectureStorageService(name, databaseType = 'postgresql', options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const adapter = await this.createIntegrationServiceAdapter(name, {
            architectureStorage: {
                enabled: true,
                databaseType,
                autoInitialize: true,
                enableVersioning: true,
                enableValidationTracking: true,
                cachingEnabled: true,
            },
            safeAPI: { enabled: false },
            protocolManagement: { enabled: false },
            ...options,
        });
        return adapter;
    }
    async createSafeAPIService(name, baseURL, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const adapter = await this.createIntegrationServiceAdapter(name, {
            architectureStorage: { enabled: false },
            safeAPI: {
                enabled: true,
                baseURL,
                timeout: 30000,
                retries: 3,
                validation: {
                    enabled: true,
                    strictMode: false,
                    sanitization: true,
                },
            },
            protocolManagement: { enabled: false },
            ...options,
        });
        return adapter;
    }
    async createProtocolManagementService(name, supportedProtocols = ['http', 'websocket', 'mcp-http'], options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const adapter = await this.createIntegrationServiceAdapter(name, {
            architectureStorage: { enabled: false },
            safeAPI: { enabled: false },
            protocolManagement: {
                enabled: true,
                supportedProtocols,
                defaultProtocol: supportedProtocols[0] || 'http',
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
            },
            ...options,
        });
        return adapter;
    }
    async createUnifiedIntegrationService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const { baseURL = 'http://localhost:3001', databaseType = 'postgresql', supportedProtocols = ['http', 'websocket', 'mcp-http', 'mcp-stdio'], ...adapterOptions } = options;
        const adapter = await this.createIntegrationServiceAdapter(name, {
            architectureStorage: {
                enabled: true,
                databaseType,
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
                validation: {
                    enabled: true,
                    strictMode: false,
                    sanitization: true,
                },
            },
            protocolManagement: {
                enabled: true,
                supportedProtocols,
                defaultProtocol: supportedProtocols[0] || 'http',
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
            },
            ...adapterOptions,
        });
        return adapter;
    }
    async createMonitoringService(name, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        const config = ServiceConfigFactory.createMonitoringServiceConfig(name, {
            type: ServiceType.MONITORING,
            ...options,
        });
        return globalUSLFactory.create(config);
    }
    getService(serviceName) {
        return globalServiceRegistry.findService(serviceName);
    }
    getServicesByType(type) {
        return globalServiceRegistry.getServicesByType(type);
    }
    getAllServices() {
        return globalServiceRegistry.getAllServices();
    }
    async startAllServices() {
        await globalServiceRegistry.startAllServices();
    }
    async stopAllServices() {
        await globalServiceRegistry.stopAllServices();
    }
    async getSystemHealth() {
        const serviceStatuses = await globalServiceRegistry.healthCheckAll();
        const statusValues = Array.from(serviceStatuses.values());
        const healthy = statusValues.filter((s) => s.health === 'healthy').length;
        const degraded = statusValues.filter((s) => s.health === 'degraded').length;
        const unhealthy = statusValues.filter((s) => s.health === 'unhealthy').length;
        const total = statusValues.length;
        const errorRate = total > 0 ? ((degraded + unhealthy) / total) * 100 : 0;
        let overall;
        if (errorRate === 0) {
            overall = 'healthy';
        }
        else if (errorRate <= 20) {
            overall = 'degraded';
        }
        else {
            overall = 'unhealthy';
        }
        return {
            overall,
            services: serviceStatuses,
            summary: {
                total,
                healthy,
                degraded,
                unhealthy,
                errorRate,
            },
        };
    }
    async getSystemMetrics() {
        const metrics = await globalServiceRegistry.getSystemMetrics();
        const performanceSummary = metrics.aggregatedMetrics.reduce((acc, metric) => ({
            averageLatency: (acc.averageLatency + metric.averageLatency) / 2,
            totalThroughput: acc.totalThroughput + metric.throughput,
            totalErrors: acc.totalErrors + metric.errorCount,
            totalOperations: acc.totalOperations + metric.operationCount,
        }), {
            averageLatency: 0,
            totalThroughput: 0,
            totalErrors: 0,
            totalOperations: 0,
        });
        return {
            ...metrics,
            performanceSummary,
        };
    }
    discoverServices(criteria) {
        return globalServiceRegistry.discoverServices(criteria);
    }
    registerCapability(serviceName, capability) {
        globalServiceCapabilityRegistry.register(serviceName, capability);
    }
    findServicesByCapability(capabilityName) {
        return globalServiceCapabilityRegistry.findServicesByCapability(capabilityName);
    }
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        await globalServiceRegistry.shutdownAll();
        this.initialized = false;
    }
}
function getUSLInstance() {
    const globals = initializeGlobals();
    return globals.usl;
}
export const usl = getUSLInstance();
export const initializeUSL = async (config) => {
    await usl.initialize(config);
};
export const USLHelpers = {
    async setupCommonServices(config) {
        await usl.initialize();
        const services = {};
        try {
            services.memory = await usl.createMemoryService('default-memory', config?.memoryConfig);
            services.data = await usl.createDataService('default-data');
            if (config?.webPort) {
                services.web = await usl.createWebService('default-web', config?.webPort);
            }
            if (config?.databaseConfig) {
                services.database = await usl.createDatabaseService('default-database', config?.databaseConfig);
            }
            if (config?.enableCoordination) {
                services.coordination = await usl.createCoordinationService('default-coordination');
            }
            if (config?.enableNeural) {
                services.neural = await usl.createNeuralService('default-neural');
            }
            if (config?.enableMonitoring) {
                services.monitoring =
                    await usl.createMonitoringService('default-monitoring');
            }
            await usl.startAllServices();
            return services;
        }
        catch (error) {
            logger.error('❌ Failed to setup common services:', error);
            throw error;
        }
    },
    async getQuickStatus() {
        if (!usl.isInitialized()) {
            return {
                initialized: false,
                totalServices: 0,
                healthyServices: 0,
                healthPercentage: 0,
                status: 'unhealthy',
                uptime: 0,
            };
        }
        const health = await usl.getSystemHealth();
        const healthPercentage = health.summary.total > 0
            ? (health.summary.healthy / health.summary.total) * 100
            : 100;
        const status = health.overall;
        const uptime = process.uptime();
        return {
            initialized: true,
            totalServices: health.summary.total,
            healthyServices: health.summary.healthy,
            healthPercentage,
            status,
            uptime,
        };
    },
    async performHealthCheck() {
        const health = await usl.getSystemHealth();
        const services = {};
        let totalResponseTime = 0;
        let responseTimeCount = 0;
        health.services.forEach((status, name) => {
            services[name] = {
                status: status.health,
                responseTime: 0,
                errorRate: status.errorRate,
                uptime: status.uptime,
                details: status.metadata,
            };
            const simulatedResponseTime = Math.random() * 100 + 10;
            services[name].responseTime = simulatedResponseTime;
            totalResponseTime += simulatedResponseTime;
            responseTimeCount++;
        });
        const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
        return {
            overall: health.overall,
            services,
            summary: {
                ...health.summary,
                averageResponseTime,
            },
        };
    },
    async getPerformanceMetrics() {
        const metrics = await usl.getSystemMetrics();
        const services = {};
        let totalOperations = 0;
        let totalErrors = 0;
        let totalThroughput = 0;
        let totalLatency = 0;
        let serviceCount = 0;
        metrics.aggregatedMetrics.forEach((metric) => {
            services[metric.name] = {
                name: metric.name,
                type: metric.type,
                latency: {
                    average: metric.averageLatency,
                    p95: metric.p95Latency,
                    p99: metric.p99Latency,
                },
                throughput: metric.throughput,
                errorRate: metric.operationCount > 0
                    ? (metric.errorCount / metric.operationCount) * 100
                    : 0,
                operationsPerSecond: metric.throughput,
                memoryUsage: metric.memoryUsage,
            };
            totalOperations += metric.operationCount;
            totalErrors += metric.errorCount;
            totalThroughput += metric.throughput;
            totalLatency += metric.averageLatency;
            serviceCount++;
        });
        const averageLatency = serviceCount > 0 ? totalLatency / serviceCount : 0;
        const systemErrorRate = totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0;
        return {
            timestamp: new Date(),
            services,
            aggregate: {
                totalOperations,
                totalErrors,
                averageLatency,
                totalThroughput,
                systemErrorRate,
            },
        };
    },
    async createServiceWithDependencies(config, dependencies = []) {
        for (const depName of dependencies) {
            const existingService = usl.getService(depName);
            if (!existingService) {
                throw new ServiceDependencyError(config?.name, depName);
            }
        }
        const configWithDeps = {
            ...config,
            dependencies: dependencies.map((serviceName) => ({
                serviceName,
                required: true,
                healthCheck: true,
                timeout: 5000,
                retries: 3,
            })),
        };
        return await globalUSLFactory.create(configWithDeps);
    },
    async createServiceBatch(configs) {
        const sortedConfigs = [...configs].sort((a, b) => {
            const aDeps = a.dependencies?.length || 0;
            const bDeps = b.dependencies?.length || 0;
            return aDeps - bDeps;
        });
        const createdServices = [];
        for (const { config, dependencies = [] } of sortedConfigs) {
            try {
                const service = await USLHelpers.createServiceWithDependencies(config, dependencies);
                createdServices.push(service);
            }
            catch (error) {
                logger.error(`Failed to create service ${config?.name}:`, error);
                throw error;
            }
        }
        return createdServices;
    },
    async initializeCompleteUSL(config) {
        await usl.initialize();
        const result = { usl };
        try {
            if (config?.enableServiceManager ?? true) {
                const { ServiceManager } = await import('./manager.ts');
                const serviceManager = new ServiceManager(config?.serviceManagerConfig);
                await serviceManager.initialize();
                result.serviceManager = serviceManager;
            }
            if (config?.enableEnhancedRegistry ?? true) {
                const { EnhancedServiceRegistry } = await import('./registry.ts');
                const registry = new EnhancedServiceRegistry(config?.registryConfig);
                result.registry = registry;
            }
            if (config?.enableCompatibilityLayer ?? true) {
                const { USLCompatibilityLayer } = await import('./compatibility.ts');
                const compatibility = new USLCompatibilityLayer(config?.compatibilityConfig);
                await compatibility.initialize();
                result.compatibility = compatibility;
            }
            if (config?.enableValidationFramework ?? false) {
                const { USLValidationFramework } = await import('./validation.ts');
                if (result?.serviceManager && result?.registry) {
                    const validation = new USLValidationFramework(result?.serviceManager, result?.registry, config?.validationConfig);
                    result.validation = validation;
                }
            }
            return result;
        }
        catch (error) {
            logger.error('❌ Failed to initialize complete USL system:', error);
            throw error;
        }
    },
    async migrateToUSL(existingServices) {
        try {
            const { USLCompatibilityLayer } = await import('./compatibility.ts');
            const compatibility = new USLCompatibilityLayer();
            await compatibility.initialize();
            const migrationResult = await compatibility.migrateExistingServices(existingServices);
            const { MigrationUtils } = await import('./compatibility.ts');
            const compatibilityReport = MigrationUtils.generateCompatibilityReport();
            return {
                success: migrationResult?.failed.length === 0,
                migrated: migrationResult?.migrated,
                failed: migrationResult?.failed,
                warnings: migrationResult?.warnings,
                compatibilityReport,
            };
        }
        catch (error) {
            logger.error('❌ Migration to USL failed:', error);
            return {
                success: false,
                migrated: [],
                failed: [
                    {
                        name: 'system',
                        error: error instanceof Error ? error.message : String(error),
                    },
                ],
                warnings: [],
                compatibilityReport: null,
            };
        }
    },
    async validateSystemIntegration(config) {
        try {
            const system = await USLHelpers.initializeCompleteUSL({
                enableValidationFramework: true,
                validationConfig: config ?? undefined,
            });
            if (!(system.validation && system.serviceManager && system.registry)) {
                throw new Error('Validation framework not properly initialized');
            }
            const validationResult = await system.validation.validateSystem();
            const healthValidation = await system.validation.validateSystemHealth();
            const recommendations = [];
            if (validationResult?.overall === 'fail') {
                recommendations.push('Address critical validation failures before production deployment');
            }
            if (healthValidation.overallHealth !== 'healthy') {
                recommendations.push('Resolve system health issues to ensure optimal performance');
            }
            recommendations.push(...validationResult?.recommendations.map((rec) => rec.action));
            return {
                success: validationResult?.overall !== 'fail',
                validationResult,
                healthValidation,
                recommendations,
            };
        }
        catch (error) {
            logger.error('❌ System validation failed:', error);
            return {
                success: false,
                validationResult: {
                    overall: 'fail',
                    score: 0,
                    timestamp: new Date(),
                    duration: 0,
                    results: {
                        configuration: {
                            status: 'fail',
                            score: 0,
                            checks: [],
                            warnings: [],
                            errors: [],
                        },
                        dependencies: {
                            status: 'fail',
                            score: 0,
                            checks: [],
                            warnings: [],
                            errors: [],
                        },
                        performance: {
                            status: 'fail',
                            score: 0,
                            checks: [],
                            warnings: [],
                            errors: [],
                        },
                        security: {
                            status: 'fail',
                            score: 0,
                            checks: [],
                            warnings: [],
                            errors: [],
                        },
                        compatibility: {
                            status: 'fail',
                            score: 0,
                            checks: [],
                            warnings: [],
                            errors: [],
                        },
                        integration: {
                            status: 'fail',
                            score: 0,
                            checks: [],
                            warnings: [],
                            errors: [],
                        },
                    },
                    summary: {
                        totalChecks: 0,
                        passed: 0,
                        warnings: 0,
                        failures: 1,
                        criticalIssues: 1,
                    },
                    recommendations: [
                        {
                            type: 'critical',
                            category: 'system',
                            description: 'Validation system failure',
                            impact: 'high',
                            effort: 'high',
                            action: `Resolve validation error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                },
                healthValidation: {
                    overallHealth: 'unhealthy',
                    serviceHealth: new Map(),
                    systemMetrics: {
                        totalServices: 0,
                        healthyServices: 0,
                        responseTimeP95: 0,
                        errorRate: 100,
                        memoryUsage: 0,
                        uptime: 0,
                    },
                    alerts: [
                        {
                            severity: 'critical',
                            message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
                            timestamp: new Date(),
                        },
                    ],
                },
                recommendations: ['Fix validation system errors before proceeding'],
            };
        }
    },
};
export const createDataService = usl.createDataService.bind(usl);
export const createWebDataService = usl.createWebDataService.bind(usl);
export const createDocumentService = usl.createDocumentService.bind(usl);
export const createUnifiedDataService = usl.createUnifiedDataService.bind(usl);
export const createWebService = usl.createWebService.bind(usl);
export const createCoordinationService = usl.createCoordinationService.bind(usl);
export const createNeuralService = usl.createNeuralService.bind(usl);
export const createMemoryService = usl.createMemoryService.bind(usl);
export const createDatabaseService = usl.createDatabaseService.bind(usl);
export const createIntegrationService = usl.createIntegrationService.bind(usl);
export const createIntegrationServiceAdapterBound = usl.createIntegrationServiceAdapter.bind(usl);
export const createArchitectureStorageService = usl.createArchitectureStorageService.bind(usl);
export const createSafeAPIService = usl.createSafeAPIService.bind(usl);
export const createProtocolManagementService = usl.createProtocolManagementService.bind(usl);
export const createUnifiedIntegrationService = usl.createUnifiedIntegrationService.bind(usl);
export const createMonitoringService = usl.createMonitoringService.bind(usl);
export const getService = usl.getService.bind(usl);
export const getServicesByType = usl.getServicesByType.bind(usl);
export const getAllServices = usl.getAllServices.bind(usl);
export const discoverServices = usl.discoverServices.bind(usl);
export const startAllServices = usl.startAllServices.bind(usl);
export const stopAllServices = usl.stopAllServices.bind(usl);
export const getSystemHealth = usl.getSystemHealth.bind(usl);
export const getSystemMetrics = usl.getSystemMetrics.bind(usl);
export default usl;
//# sourceMappingURL=index.js.map