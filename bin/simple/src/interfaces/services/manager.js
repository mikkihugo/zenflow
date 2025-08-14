import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
import { coordinationServiceFactory, } from './adapters/coordination-service-factory.ts';
import { globalDataServiceFactory, } from './adapters/data-service-factory.ts';
import { getInfrastructureServiceFactory, } from './adapters/infrastructure-service-factory.ts';
import { integrationServiceFactory, } from './adapters/integration-service-factory.ts';
import { ServiceDependencyError, ServiceInitializationError, ServiceOperationError, } from './core/interfaces.ts';
import { USLFactory } from './factories.ts';
import { EnhancedServiceRegistry, } from './registry.ts';
import { ServicePriority, ServiceType, } from './types.ts';
export class ServiceManager extends EventEmitter {
    registry;
    mainFactory;
    config;
    logger;
    initialized = false;
    startTime = Date.now();
    dataServiceFactory;
    coordinationServiceFactory;
    integrationServiceFactory;
    infrastructureServiceFactory;
    healthMonitoringInterval;
    metricsCollectionInterval;
    systemStatusInterval;
    constructor(config) {
        super();
        this.logger = getLogger('ServiceManager');
        this.config = this.initializeConfig(config);
        this.registry = new EnhancedServiceRegistry(this.config.registry);
        this.mainFactory = new USLFactory(this.config.factory);
        this.dataServiceFactory = globalDataServiceFactory;
        this.coordinationServiceFactory = coordinationServiceFactory;
        this.integrationServiceFactory = integrationServiceFactory;
        this.infrastructureServiceFactory = getInfrastructureServiceFactory();
        this.setupEventHandling();
    }
    async initialize() {
        if (this.initialized) {
            this.logger.warn('Service manager already initialized');
            return;
        }
        this.logger.info('Initializing USL Service Manager...');
        try {
            await this.registerServiceFactories();
            this.initializeMonitoring();
            if (this.config.discovery.enabled) {
                await this.initializeServiceDiscovery();
            }
            this.initialized = true;
            this.startTime = Date.now();
            this.logger.info('USL Service Manager initialized successfully');
            this.emit('manager-initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize service manager:', error);
            throw new ServiceInitializationError('ServiceManager', error);
        }
    }
    isInitialized() {
        return this.initialized;
    }
    async getStatus() {
        const systemMetrics = await this.registry.getSystemMetrics();
        const healthResults = await this.registry.healthCheckAll();
        const _healthyCount = Array.from(healthResults?.values()).filter((status) => status.health === 'healthy').length;
        const errorCount = Array.from(healthResults?.values()).filter((status) => status.health === 'unhealthy' || status.lifecycle === 'error').length;
        const totalServices = systemMetrics.totalServices;
        const systemErrorRate = totalServices > 0 ? (errorCount / totalServices) * 100 : 0;
        const averageResponseTime = systemMetrics.aggregatedMetrics.length > 0
            ? systemMetrics.aggregatedMetrics.reduce((sum, metric) => sum + metric.averageLatency, 0) / systemMetrics.aggregatedMetrics.length
            : 0;
        let systemHealth;
        if (systemErrorRate === 0) {
            systemHealth = 'healthy';
        }
        else if (systemErrorRate <= 10) {
            systemHealth = 'degraded';
        }
        else {
            systemHealth = 'unhealthy';
        }
        return {
            initialized: this.initialized,
            totalServices: systemMetrics.totalServices,
            runningServices: systemMetrics.runningServices,
            healthyServices: systemMetrics.healthyServices,
            errorServices: systemMetrics.errorServices,
            averageResponseTime,
            systemErrorRate,
            uptime: Date.now() - this.startTime,
            factoriesRegistered: this.registry.listFactoryTypes().length,
            lastHealthCheck: new Date(),
            systemHealth,
        };
    }
    async createService(request) {
        if (!this.initialized) {
            await this.initialize();
        }
        this.logger.info(`Creating service: ${request.name} (${request.type})`);
        try {
            const factory = this.getFactoryForServiceType(request.type);
            if (!factory) {
                return await this.createServiceWithMainFactory(request);
            }
            return await this.createServiceWithSpecializedFactory(factory, request);
        }
        catch (error) {
            this.logger.error(`Failed to create service ${request.name}:`, error);
            throw new ServiceInitializationError(request.name, error);
        }
    }
    async createServices(request) {
        if (!this.initialized) {
            await this.initialize();
        }
        this.logger.info(`Creating batch of ${request.services.length} services`);
        const createdServices = [];
        try {
            if (request.dependencyResolution) {
                const orderedServices = this.resolveDependencyOrder(request.services);
                for (const serviceRequest of orderedServices) {
                    const service = await this.createService(serviceRequest);
                    createdServices.push(service);
                }
            }
            else if (request.parallel) {
                const createPromises = request.services.map((serviceRequest) => this.createService(serviceRequest));
                const results = await Promise.allSettled(createPromises);
                results?.forEach((result, index) => {
                    if (result?.status === 'fulfilled') {
                        createdServices.push(result?.value);
                    }
                    else {
                        this.logger.error(`Failed to create service ${request.services[index]?.name}:`, result?.reason);
                    }
                });
            }
            else {
                for (const serviceRequest of request.services) {
                    try {
                        const service = await this.createService(serviceRequest);
                        createdServices.push(service);
                    }
                    catch (error) {
                        this.logger.error(`Failed to create service ${serviceRequest.name}:`, error);
                    }
                }
            }
            if (request.startImmediately) {
                await this.startServices(createdServices.map((s) => s.name));
            }
            this.logger.info(`Successfully created ${createdServices.length} services`);
            return createdServices;
        }
        catch (error) {
            this.logger.error('Failed to create service batch:', error);
            throw error;
        }
    }
    async createWebDataService(name, config) {
        return (await this.dataServiceFactory.createWebDataAdapter(name, config));
    }
    async createDocumentService(name, databaseType = 'postgresql', config) {
        return (await this.dataServiceFactory.createDocumentAdapter(name, databaseType, config));
    }
    async createUnifiedDataService(name, databaseType = 'postgresql', config) {
        return (await this.dataServiceFactory.createUnifiedDataAdapter(name, databaseType, config));
    }
    async createDaaService(name, config) {
        const daaConfig = {
            name,
            type: 'DAA',
            enabled: true,
            daaService: { enabled: true },
            ...config,
        };
        return (await this.coordinationServiceFactory.create(daaConfig));
    }
    async createSessionRecoveryService(name, config) {
        const sessionConfig = {
            name,
            type: 'SESSION_RECOVERY',
            enabled: true,
            sessionService: { enabled: true },
            ...config,
        };
        return (await this.coordinationServiceFactory.create(sessionConfig));
    }
    async createUnifiedCoordinationService(name, config) {
        const unifiedConfig = {
            name,
            type: 'COORDINATION',
            enabled: true,
            ...config,
        };
        return (await this.coordinationServiceFactory.create(unifiedConfig));
    }
    async createArchitectureStorageService(name, databaseType = 'postgresql', config) {
        return (await this.integrationServiceFactory.createArchitectureStorageAdapter(name, databaseType, config));
    }
    async createSafeAPIService(name, baseURL, config) {
        return (await this.integrationServiceFactory.createSafeAPIAdapter(name, baseURL, config));
    }
    async createUnifiedIntegrationService(name, options = {}, config) {
        return (await this.integrationServiceFactory.createUnifiedIntegrationAdapter(name, {
            ...options,
            ...config,
        }));
    }
    async createFacadeService(name, config) {
        return (await this.infrastructureServiceFactory.createService(name, {
            config: config || undefined,
            autoStart: true,
        }));
    }
    async createPatternIntegrationService(name, configProfile = 'default', config) {
        return (await this.infrastructureServiceFactory.createService(`${name}-${configProfile}`, {
            config: config || undefined,
            autoStart: true,
            tags: ['pattern-integration', configProfile],
        }));
    }
    async createUnifiedInfrastructureService(name, configProfile = 'default', config) {
        return (await this.infrastructureServiceFactory.createService(`${name}-unified-${configProfile}`, {
            config: config || undefined,
            autoStart: true,
            tags: ['unified-infrastructure', configProfile],
        }));
    }
    async startServices(serviceNames) {
        this.logger.info(`Starting ${serviceNames.length} services`);
        if (this.config.lifecycle.dependencyResolution) {
            await this.startServicesWithDependencyResolution(serviceNames);
        }
        else if (this.config.lifecycle.parallelStartup) {
            await this.startServicesParallel(serviceNames);
        }
        else {
            await this.startServicesSequential(serviceNames);
        }
    }
    async stopServices(serviceNames) {
        this.logger.info(`Stopping ${serviceNames.length} services`);
        const orderedNames = [...serviceNames].reverse();
        for (const serviceName of orderedNames) {
            const service = this.registry.findService(serviceName);
            if (service) {
                try {
                    await this.stopServiceWithTimeout(service);
                }
                catch (error) {
                    this.logger.error(`Failed to stop service ${serviceName}:`, error);
                }
            }
        }
    }
    async startAllServices() {
        this.logger.info('Starting all services...');
        await this.registry.startAllServices();
    }
    async stopAllServices() {
        this.logger.info('Stopping all services...');
        await this.registry.stopAllServices();
    }
    async restartServices(serviceNames) {
        this.logger.info(`Restarting ${serviceNames.length} services`);
        for (const serviceName of serviceNames) {
            const service = this.registry.findService(serviceName);
            if (service) {
                try {
                    await this.stopServiceWithTimeout(service);
                    await this.startServiceWithTimeout(service);
                    this.logger.info(`Service restarted successfully: ${serviceName}`);
                }
                catch (error) {
                    this.logger.error(`Failed to restart service ${serviceName}:`, error);
                    if (this.config.recovery.enabled) {
                        this.scheduleServiceRecovery(service);
                    }
                }
            }
        }
    }
    async getSystemHealth() {
        const healthResults = await this.registry.healthCheckAll();
        const metrics = await this.registry.getSystemMetrics();
        const total = healthResults.size;
        const healthy = Array.from(healthResults?.values()).filter((s) => s.health === 'healthy').length;
        const degraded = Array.from(healthResults?.values()).filter((s) => s.health === 'degraded').length;
        const unhealthy = Array.from(healthResults?.values()).filter((s) => s.health === 'unhealthy').length;
        const errorRate = total > 0 ? ((degraded + unhealthy) / total) * 100 : 0;
        const averageResponseTime = metrics.aggregatedMetrics.length > 0
            ? metrics.aggregatedMetrics.reduce((sum, m) => sum + m.averageLatency, 0) / metrics.aggregatedMetrics.length
            : 0;
        let overall;
        if (errorRate === 0) {
            overall = 'healthy';
        }
        else if (errorRate <= 10) {
            overall = 'degraded';
        }
        else {
            overall = 'unhealthy';
        }
        const alerts = this.generateHealthAlerts(healthResults, metrics);
        return {
            overall,
            services: healthResults,
            summary: {
                total,
                healthy,
                degraded,
                unhealthy,
                errorRate,
                averageResponseTime,
                uptime: Date.now() - this.startTime,
            },
            alerts,
        };
    }
    async getPerformanceMetrics() {
        const metrics = await this.registry.getSystemMetrics();
        const healthResults = await this.registry.healthCheckAll();
        const services = {};
        let totalOperations = 0;
        let totalSuccess = 0;
        let totalLatency = 0;
        let totalThroughput = 0;
        let serviceCount = 0;
        metrics.aggregatedMetrics.forEach((metric) => {
            const health = healthResults?.get(metric.name);
            if (!health)
                return;
            const _successRate = metric.operationCount > 0
                ? ((metric.operationCount - metric.errorCount) /
                    metric.operationCount) *
                    100
                : 100;
            const availability = health.uptime > 0
                ? ((health.uptime - health.errorCount * 1000) / health.uptime) * 100
                : 100;
            services[metric.name] = {
                name: metric.name,
                type: metric.type,
                metrics: metric,
                health,
                performance: {
                    responseTime: metric.averageLatency,
                    throughput: metric.throughput,
                    errorRate: metric.operationCount > 0
                        ? (metric.errorCount / metric.operationCount) * 100
                        : 0,
                    availability: Math.max(0, availability),
                },
            };
            totalOperations += metric.operationCount;
            totalSuccess += metric.operationCount - metric.errorCount;
            totalLatency += metric.averageLatency;
            totalThroughput += metric.throughput;
            serviceCount++;
        });
        const systemSuccessRate = totalOperations > 0 ? (totalSuccess / totalOperations) * 100 : 100;
        const systemErrorRate = 100 - systemSuccessRate;
        const averageLatency = serviceCount > 0 ? totalLatency / serviceCount : 0;
        return {
            timestamp: new Date(),
            system: {
                totalOperations,
                successRate: systemSuccessRate,
                averageLatency,
                throughput: totalThroughput,
                errorRate: systemErrorRate,
            },
            services,
        };
    }
    discoverServices(criteria) {
        return this.registry.discoverServices(criteria);
    }
    getService(name) {
        return this.registry.findService(name);
    }
    getAllServices() {
        return this.registry.getAllServices();
    }
    getServicesByType(type) {
        return this.registry.getServicesByType(type);
    }
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        this.logger.info('Shutting down Service Manager...');
        try {
            this.stopMonitoring();
            await this.registry.shutdownAll();
            await this.mainFactory.shutdown();
            this.initialized = false;
            this.removeAllListeners();
            this.logger.info('Service Manager shutdown completed');
            this.emit('manager-shutdown');
        }
        catch (error) {
            this.logger.error('Error during Service Manager shutdown:', error);
            throw error;
        }
    }
    initializeConfig(config) {
        return {
            factory: config?.factory || {},
            registry: config?.registry || {
                healthMonitoring: {
                    enabled: true,
                    interval: 30000,
                    timeout: 5000,
                    alertThresholds: {
                        errorRate: 5,
                        responseTime: 1000,
                        resourceUsage: 80,
                    },
                },
                metricsCollection: {
                    enabled: true,
                    interval: 10000,
                    retention: 86400000,
                    aggregationWindow: 300000,
                },
                discovery: {
                    enabled: true,
                    heartbeatInterval: 10000,
                    advertisementInterval: 30000,
                    timeoutThreshold: 60000,
                },
                autoRecovery: {
                    enabled: true,
                    maxRetries: 3,
                    backoffMultiplier: 2,
                    recoveryTimeout: 30000,
                },
                dependencyManagement: {
                    enabled: true,
                    resolutionTimeout: 30000,
                    circularDependencyCheck: true,
                    dependencyHealthCheck: true,
                },
                performance: {
                    enableCaching: true,
                    enableConnectionPooling: true,
                    enableServiceMemoization: true,
                    maxConcurrentOperations: 50,
                },
            },
            lifecycle: {
                startupTimeout: config?.lifecycle?.startupTimeout || 60000,
                shutdownTimeout: config?.lifecycle?.shutdownTimeout || 30000,
                gracefulShutdownPeriod: config?.lifecycle?.gracefulShutdownPeriod || 10000,
                parallelStartup: config?.lifecycle?.parallelStartup ?? true,
                dependencyResolution: config?.lifecycle?.dependencyResolution ?? true,
                ...config?.lifecycle,
            },
            monitoring: {
                healthCheckInterval: 30000,
                metricsCollectionInterval: 10000,
                performanceThresholds: {
                    responseTime: 1000,
                    errorRate: 5,
                    memoryUsage: 80,
                    cpuUsage: 80,
                },
                alerting: {
                    enabled: true,
                    channels: [{ type: 'console', config: {} }],
                },
                ...config?.monitoring,
            },
            recovery: {
                enabled: true,
                maxRetries: 3,
                backoffStrategy: 'exponential',
                backoffMultiplier: 2,
                recoveryTimeout: 30000,
                circuitBreaker: {
                    enabled: true,
                    failureThreshold: 5,
                    recoveryTime: 60000,
                },
                ...config?.recovery,
            },
            discovery: {
                enabled: true,
                protocol: 'http',
                heartbeatInterval: 10000,
                advertisementInterval: 30000,
                serviceRegistry: {
                    persistent: false,
                    storageType: 'memory',
                },
                ...config?.discovery,
            },
            performance: {
                connectionPooling: {
                    enabled: true,
                    maxConnections: 100,
                    idleTimeout: 300000,
                },
                caching: {
                    enabled: true,
                    ttl: 300000,
                    maxSize: 1000,
                },
                loadBalancing: {
                    enabled: false,
                    strategy: 'round-robin',
                },
                ...config?.performance,
            },
        };
    }
    async registerServiceFactories() {
        this.logger.info('Registering service adapter factories...');
        this.registry.registerFactory('usl', this.mainFactory);
        this.registry.registerFactory('data', this.dataServiceFactory);
        this.registry.registerFactory('coordination', this.coordinationServiceFactory);
        this.registry.registerFactory('integration', this.integrationServiceFactory);
        this.registry.registerFactory('infrastructure', this.infrastructureServiceFactory);
        const serviceTypeFactoryMappings = [
            {
                types: [ServiceType.DATA, ServiceType.WEB_DATA, ServiceType.DOCUMENT],
                factory: this.dataServiceFactory,
            },
            {
                types: [
                    ServiceType.COORDINATION,
                    ServiceType.DAA,
                    ServiceType.SESSION_RECOVERY,
                    ServiceType.SWARM,
                ],
                factory: this.coordinationServiceFactory,
            },
            {
                types: [
                    ServiceType.API,
                    ServiceType.SAFE_API,
                    ServiceType.ARCHITECTURE_STORAGE,
                ],
                factory: this.integrationServiceFactory,
            },
            {
                types: [ServiceType.INFRASTRUCTURE, ServiceType.SYSTEM],
                factory: this.infrastructureServiceFactory,
            },
        ];
        serviceTypeFactoryMappings.forEach(({ types, factory }) => {
            types.forEach((type) => {
                this.registry.registerFactory(type, factory);
            });
        });
        this.logger.info(`Registered ${this.registry.listFactoryTypes().length} service factories`);
    }
    initializeMonitoring() {
        if (this.config.monitoring.healthCheckInterval > 0) {
            this.healthMonitoringInterval = setInterval(() => this.performSystemHealthCheck(), this.config.monitoring.healthCheckInterval);
        }
        if (this.config.monitoring.metricsCollectionInterval > 0) {
            this.metricsCollectionInterval = setInterval(() => this.collectSystemMetrics(), this.config.monitoring.metricsCollectionInterval);
        }
        this.systemStatusInterval = setInterval(() => this.reportSystemStatus(), 60000);
        this.logger.debug('Monitoring systems initialized');
    }
    stopMonitoring() {
        if (this.healthMonitoringInterval) {
            clearInterval(this.healthMonitoringInterval);
            this.healthMonitoringInterval = undefined;
        }
        if (this.metricsCollectionInterval) {
            clearInterval(this.metricsCollectionInterval);
            this.metricsCollectionInterval = undefined;
        }
        if (this.systemStatusInterval) {
            clearInterval(this.systemStatusInterval);
            this.systemStatusInterval = undefined;
        }
        this.logger.debug('Monitoring systems stopped');
    }
    async initializeServiceDiscovery() {
        this.logger.info('Initializing service discovery...');
        this.registry.on('service-registered', (_serviceName, service) => {
            if (service) {
                this.announceServiceDiscovery(service);
            }
        });
        this.registry.on('service-unregistered', (serviceName) => {
            this.announceServiceRemoval(serviceName);
        });
        this.logger.debug('Service discovery initialized');
    }
    setupEventHandling() {
        this.registry.on('health-alert', (serviceName, service) => {
            this.emit('health-alert', serviceName);
        });
        this.registry.on('service-recovered', (serviceName) => {
            this.emit('service-recovered', serviceName);
        });
        this.registry.on('service-recovery-failed', (serviceName) => {
            this.emit('service-recovery-failed', serviceName);
        });
        this.mainFactory.on('service-created', (serviceName, service) => {
            this.emit('service-created', serviceName, service);
        });
        this.mainFactory.on('service-removed', (serviceName) => {
            this.emit('service-removed', serviceName);
        });
    }
    getFactoryForServiceType(serviceType) {
        switch (serviceType) {
            case ServiceType.DATA:
            case ServiceType.WEB_DATA:
            case ServiceType.DOCUMENT:
                return this.dataServiceFactory;
            case ServiceType.COORDINATION:
            case ServiceType.DAA:
            case ServiceType.SESSION_RECOVERY:
                return this.coordinationServiceFactory;
            case ServiceType.API:
            case ServiceType.SAFE_API:
            case ServiceType.ARCHITECTURE_STORAGE:
                return this.integrationServiceFactory;
            case ServiceType.INFRASTRUCTURE:
            case ServiceType.SYSTEM:
                return this.infrastructureServiceFactory;
            default:
                return null;
        }
    }
    async createServiceWithMainFactory(request) {
        const config = {
            name: request.name,
            type: request.type,
            enabled: true,
            priority: request.priority || ServicePriority.NORMAL,
            tags: request.tags,
            metadata: request.metadata,
            dependencies: request.dependencies?.map((dep) => ({
                serviceName: dep,
                required: true,
                healthCheck: true,
                timeout: 5000,
                retries: 3,
            })),
            ...request.config,
        };
        return await this.mainFactory.create(config);
    }
    async createServiceWithSpecializedFactory(factory, request) {
        const config = {
            name: request.name,
            type: request.type,
            enabled: true,
            priority: request.priority || ServicePriority.NORMAL,
            tags: request.tags,
            metadata: request.metadata,
            dependencies: request.dependencies?.map((dep) => ({
                serviceName: dep,
                required: true,
                healthCheck: true,
                timeout: 5000,
                retries: 3,
            })),
            ...request.config,
        };
        return await factory.create(config);
    }
    resolveDependencyOrder(services) {
        const serviceMap = new Map(services.map((s) => [s.name, s]));
        const visited = new Set();
        const visiting = new Set();
        const result = [];
        const visit = (serviceName) => {
            if (visiting.has(serviceName)) {
                throw new ServiceDependencyError(serviceName, 'circular dependency detected');
            }
            if (visited.has(serviceName)) {
                return;
            }
            const service = serviceMap.get(serviceName);
            if (!service) {
                return;
            }
            visiting.add(serviceName);
            service.dependencies?.forEach((dep) => visit(dep));
            visiting.delete(serviceName);
            visited.add(serviceName);
            result.push(service);
        };
        services.forEach((service) => visit(service.name));
        return result;
    }
    async startServicesWithDependencyResolution(serviceNames) {
        const services = serviceNames
            .map((name) => this.registry.findService(name))
            .filter((service) => service !== undefined);
        for (const service of services) {
            try {
                await this.startServiceWithTimeout(service);
            }
            catch (error) {
                this.logger.error(`Failed to start service ${service.name}:`, error);
                if (this.config.recovery.enabled) {
                    this.scheduleServiceRecovery(service);
                }
            }
        }
    }
    async startServicesParallel(serviceNames) {
        const startPromises = serviceNames.map(async (serviceName) => {
            const service = this.registry.findService(serviceName);
            if (service) {
                try {
                    await this.startServiceWithTimeout(service);
                }
                catch (error) {
                    this.logger.error(`Failed to start service ${serviceName}:`, error);
                    if (this.config.recovery.enabled) {
                        this.scheduleServiceRecovery(service);
                    }
                }
            }
        });
        await Promise.allSettled(startPromises);
    }
    async startServicesSequential(serviceNames) {
        for (const serviceName of serviceNames) {
            const service = this.registry.findService(serviceName);
            if (service) {
                try {
                    await this.startServiceWithTimeout(service);
                }
                catch (error) {
                    this.logger.error(`Failed to start service ${serviceName}:`, error);
                    if (this.config.recovery.enabled) {
                        this.scheduleServiceRecovery(service);
                    }
                }
            }
        }
    }
    async startServiceWithTimeout(service) {
        const timeout = this.config.lifecycle.startupTimeout;
        return Promise.race([
            service.start(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Service startup timeout: ${service.name}`)), timeout)),
        ]);
    }
    async stopServiceWithTimeout(service) {
        const timeout = this.config.lifecycle.shutdownTimeout;
        return Promise.race([
            service.stop(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Service shutdown timeout: ${service.name}`)), timeout)),
        ]);
    }
    scheduleServiceRecovery(service) {
        if (!this.config.recovery.enabled) {
            return;
        }
        this.logger.info(`Scheduling recovery for service: ${service.name}`);
        setTimeout(async () => {
            try {
                await this.performServiceRecovery(service);
            }
            catch (error) {
                this.logger.error(`Service recovery failed for ${service.name}:`, error);
                this.emit('service-recovery-failed', service.name);
            }
        }, 5000);
    }
    async performServiceRecovery(service) {
        const maxRetries = this.config.recovery.maxRetries;
        const backoffMultiplier = this.config.recovery.backoffMultiplier;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.info(`Recovery attempt ${attempt}/${maxRetries} for service: ${service.name}`);
                await this.stopServiceWithTimeout(service);
                await this.startServiceWithTimeout(service);
                const isHealthy = await service.healthCheck();
                if (isHealthy) {
                    this.logger.info(`Service recovery successful: ${service.name}`);
                    this.emit('service-recovered', service.name);
                    return;
                }
            }
            catch (error) {
                this.logger.warn(`Recovery attempt ${attempt} failed for ${service.name}:`, error);
                if (attempt < maxRetries) {
                    const delay = this.calculateBackoffDelay(attempt, backoffMultiplier);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        throw new ServiceOperationError(service.name, 'recovery', new Error(`All ${maxRetries} recovery attempts failed`));
    }
    calculateBackoffDelay(attempt, multiplier) {
        switch (this.config.recovery.backoffStrategy) {
            case 'linear':
                return attempt * 1000 * multiplier;
            case 'exponential':
                return multiplier ** attempt * 1000;
            default:
                return 5000;
        }
    }
    async performSystemHealthCheck() {
        try {
            const healthReport = await this.getSystemHealth();
            if (healthReport.overall !== 'healthy') {
                this.logger.warn(`System health: ${healthReport.overall} (${healthReport.summary.unhealthy} unhealthy services)`);
                this.emit('system-health-degraded', healthReport);
            }
            if (healthReport.summary.averageResponseTime >
                this.config.monitoring.performanceThresholds.responseTime) {
                this.emit('performance-alert', {
                    type: 'high-response-time',
                    value: healthReport.summary.averageResponseTime,
                    threshold: this.config.monitoring.performanceThresholds.responseTime,
                });
            }
        }
        catch (error) {
            this.logger.error('System health check failed:', error);
        }
    }
    async collectSystemMetrics() {
        try {
            const metrics = await this.getPerformanceMetrics();
            const systemMetrics = {
                totalOperations: metrics.system.totalOperations,
                successfulOperations: Math.round(metrics.system.totalOperations * (metrics.system.successRate / 100)),
                totalErrors: Math.round(metrics.system.totalOperations * (metrics.system.errorRate / 100)),
                averageLatency: metrics.system.averageLatency,
                lastUpdate: new Date(),
            };
            this.systemMetrics = systemMetrics;
            this.emit('metrics-updated', metrics);
        }
        catch (error) {
            this.logger.error('System metrics collection failed:', error);
        }
    }
    async reportSystemStatus() {
        try {
            const status = await this.getStatus();
            this.logger.info(`System Status: ${status.systemHealth} | ` +
                `Services: ${status.runningServices}/${status.totalServices} | ` +
                `Response Time: ${Math.round(status.averageResponseTime)}ms | ` +
                `Error Rate: ${status.systemErrorRate.toFixed(2)}%`);
            this.emit('status-report', status);
        }
        catch (error) {
            this.logger.error('System status reporting failed:', error);
        }
    }
    generateHealthAlerts(healthResults, metrics) {
        const alerts = [];
        const timestamp = new Date();
        healthResults?.forEach((status, serviceName) => {
            if (status.health !== 'healthy') {
                alerts.push({
                    type: 'service-health',
                    severity: status.health === 'unhealthy' ? 'critical' : 'warning',
                    message: `Service ${serviceName} is ${status.health}`,
                    service: serviceName,
                    timestamp,
                });
            }
            if (status.errorRate >
                this.config.monitoring.performanceThresholds.errorRate) {
                alerts.push({
                    type: 'high-error-rate',
                    severity: status.errorRate > 20 ? 'error' : 'warning',
                    message: `High error rate for service ${serviceName}: ${status.errorRate.toFixed(2)}%`,
                    service: serviceName,
                    timestamp,
                });
            }
        });
        metrics.aggregatedMetrics.forEach((metric) => {
            if (metric.averageLatency >
                this.config.monitoring.performanceThresholds.responseTime) {
                alerts.push({
                    type: 'high-latency',
                    severity: metric.averageLatency >
                        this.config.monitoring.performanceThresholds.responseTime * 2
                        ? 'error'
                        : 'warning',
                    message: `High response time for service ${metric.name}: ${metric.averageLatency.toFixed(2)}ms`,
                    service: metric.name,
                    timestamp,
                });
            }
        });
        return alerts;
    }
    announceServiceDiscovery(service) {
        if (this.config.discovery.enabled) {
            this.logger.debug(`Announcing service discovery: ${service.name}`);
            this.emit('service-announced', {
                name: service.name,
                type: service.type,
                capabilities: service.getCapabilities(),
                timestamp: new Date(),
            });
        }
    }
    announceServiceRemoval(serviceName) {
        if (this.config.discovery.enabled) {
            this.logger.debug(`Announcing service removal: ${serviceName}`);
            this.emit('service-removed-announcement', {
                name: serviceName,
                timestamp: new Date(),
            });
        }
    }
}
export default ServiceManager;
//# sourceMappingURL=manager.js.map