/**
 * USL Service Registry - Complete Service Management System.
 *
 * Advanced service registry providing comprehensive service management,
 * health monitoring, lifecycle orchestration, and service discovery.
 * Following the same patterns as UACL Agent 6.
 */
/**
 * @file Interface implementation: registry.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
import { ServiceOperationError } from './core/interfaces.ts';
/**
 * Enhanced Service Registry with comprehensive service management capabilities.
 *
 * @example
 */
export class EnhancedServiceRegistry extends EventEmitter {
    factories = new Map();
    services = new Map();
    serviceDiscovery = new Map();
    dependencyGraph = null;
    healthStatuses = new Map();
    metricsHistory = new Map();
    config;
    logger;
    // Monitoring intervals
    healthMonitoringInterval;
    metricsCollectionInterval;
    discoveryInterval;
    // Performance tracking
    operationMetrics = new Map();
    constructor(config) {
        super();
        this.logger = getLogger('EnhancedServiceRegistry');
        this.config = {
            healthMonitoring: {
                enabled: config?.healthMonitoring?.enabled ?? true,
                interval: config?.healthMonitoring?.interval ?? 30000,
                timeout: config?.healthMonitoring?.timeout ?? 5000,
                alertThresholds: {
                    errorRate: config?.healthMonitoring?.alertThresholds?.errorRate ?? 5,
                    responseTime: config?.healthMonitoring?.alertThresholds?.responseTime ?? 1000,
                    resourceUsage: config?.healthMonitoring?.alertThresholds?.resourceUsage ?? 80,
                },
            },
            metricsCollection: {
                enabled: config?.metricsCollection?.enabled ?? true,
                interval: config?.metricsCollection?.interval ?? 10000,
                retention: config?.metricsCollection?.retention ?? 86400000, // 24 hours
                aggregationWindow: config?.metricsCollection?.aggregationWindow ?? 300000, // 5 minutes
            },
            discovery: {
                enabled: config?.discovery?.enabled ?? true,
                heartbeatInterval: config?.discovery?.heartbeatInterval ?? 10000,
                advertisementInterval: config?.discovery?.advertisementInterval ?? 30000,
                timeoutThreshold: config?.discovery?.timeoutThreshold ?? 60000,
            },
            autoRecovery: {
                enabled: config?.autoRecovery?.enabled ?? true,
                maxRetries: config?.autoRecovery?.maxRetries ?? 3,
                backoffMultiplier: config?.autoRecovery?.backoffMultiplier ?? 2,
                recoveryTimeout: config?.autoRecovery?.recoveryTimeout ?? 30000,
            },
            dependencyManagement: {
                enabled: config?.dependencyManagement?.enabled ?? true,
                resolutionTimeout: config?.dependencyManagement?.resolutionTimeout ?? 30000,
                circularDependencyCheck: config?.dependencyManagement?.circularDependencyCheck ?? true,
                dependencyHealthCheck: config?.dependencyManagement?.dependencyHealthCheck ?? true,
            },
            performance: {
                enableCaching: config?.performance?.enableCaching ?? true,
                enableConnectionPooling: config?.performance?.enableConnectionPooling ?? true,
                enableServiceMemoization: config?.performance?.enableServiceMemoization ?? true,
                maxConcurrentOperations: config?.performance?.maxConcurrentOperations ?? 50,
            },
        };
        this.initializeMonitoring();
    }
    // ============================================
    // Factory Registration and Management
    // ============================================
    registerFactory(type, factory) {
        this.logger.info(`Registering factory for service type: ${type}`);
        this.factories.set(type, factory);
        // Set up factory event handling
        this.setupFactoryEventHandling(type, factory);
        this.emit('factory-registered', type, factory);
        this.logger.debug(`Factory registered successfully: ${type}`);
    }
    getFactory(type) {
        return this.factories.get(type);
    }
    listFactoryTypes() {
        return Array.from(this.factories.keys());
    }
    unregisterFactory(type) {
        this.logger.info(`Unregistering factory for service type: ${type}`);
        const factory = this.factories.get(type);
        if (factory) {
            // Stop all services from this factory
            factory.list().forEach((service) => {
                this.removeServiceFromRegistry(service.name);
            });
            this.factories.delete(type);
            this.emit('factory-unregistered', type);
            this.logger.debug(`Factory unregistered successfully: ${type}`);
        }
    }
    // ============================================
    // Service Management and Discovery
    // ============================================
    getAllServices() {
        const allServices = new Map();
        // Collect services from all factories
        for (const factory of this.factories.values()) {
            factory.list().forEach((service) => {
                allServices.set(service.name, service);
            });
        }
        // Include directly registered services
        this.services.forEach((service, name) => {
            allServices.set(name, service);
        });
        return allServices;
    }
    findService(name) {
        // Check directly registered services first
        if (this.services.has(name)) {
            return this.services.get(name);
        }
        // Search in all factories
        for (const factory of this.factories.values()) {
            const service = factory.get(name);
            if (service) {
                // Cache for faster future lookups
                if (this.config.performance.enableCaching) {
                    this.services.set(name, service);
                }
                return service;
            }
        }
        return undefined;
    }
    getServicesByType(type) {
        const factory = this.factories.get(type);
        if (factory) {
            return factory.list();
        }
        // Fallback: search all services
        return Array.from(this.getAllServices().values()).filter((service) => service.type === type);
    }
    getServicesByStatus(status) {
        const matchingServices = [];
        const allServices = this.getAllServices();
        for (const service of allServices.values()) {
            const serviceStatus = this.healthStatuses.get(service.name);
            if (serviceStatus && serviceStatus.lifecycle === status) {
                matchingServices.push(service);
            }
        }
        return matchingServices;
    }
    // ============================================
    // Service Lifecycle Management
    // ============================================
    async startAllServices() {
        this.logger.info('Starting all services with dependency resolution...');
        if (this.config.dependencyManagement.enabled) {
            await this.buildDependencyGraph();
            await this.startServicesInOrder();
        }
        else {
            await this.startServicesParallel();
        }
        this.logger.info('All services started successfully');
    }
    async stopAllServices() {
        this.logger.info('Stopping all services in reverse dependency order...');
        if (this.dependencyGraph) {
            await this.stopServicesInOrder();
        }
        else {
            await this.stopServicesParallel();
        }
        this.logger.info('All services stopped successfully');
    }
    async healthCheckAll() {
        const results = new Map();
        const allServices = this.getAllServices();
        const healthCheckPromises = Array.from(allServices.entries()).map(async ([name, service]) => {
            try {
                const status = await this.performServiceHealthCheck(service);
                results?.set(name, status);
                this.healthStatuses.set(name, status);
            }
            catch (error) {
                this.logger.error(`Health check failed for service ${name}:`, error);
                const errorStatus = {
                    name,
                    type: service.type,
                    lifecycle: 'error',
                    health: 'unhealthy',
                    lastCheck: new Date(),
                    uptime: 0,
                    errorCount: 1,
                    errorRate: 100,
                    metadata: { error: error instanceof Error ? error.message : String(error) },
                };
                results?.set(name, errorStatus);
                this.healthStatuses.set(name, errorStatus);
            }
        });
        await Promise.allSettled(healthCheckPromises);
        return results;
    }
    async getSystemMetrics() {
        const allServices = this.getAllServices();
        const healthStatuses = await this.healthCheckAll();
        const totalServices = allServices.size;
        const runningServices = Array.from(healthStatuses.values()).filter((status) => status.lifecycle === 'running').length;
        const healthyServices = Array.from(healthStatuses.values()).filter((status) => status.health === 'healthy').length;
        const errorServices = Array.from(healthStatuses.values()).filter((status) => status.lifecycle === 'error' || status.health === 'unhealthy').length;
        // Collect metrics from all services
        const aggregatedMetrics = [];
        const metricsPromises = Array.from(allServices.values()).map(async (service) => {
            try {
                const metrics = await service.getMetrics();
                aggregatedMetrics.push(metrics);
            }
            catch (error) {
                this.logger.error(`Failed to get metrics for service ${service.name}:`, error);
            }
        });
        await Promise.allSettled(metricsPromises);
        return {
            totalServices,
            runningServices,
            healthyServices,
            errorServices,
            aggregatedMetrics,
        };
    }
    async shutdownAll() {
        this.logger.info('Shutting down service registry...');
        try {
            // Stop monitoring
            this.stopMonitoring();
            // Stop all services
            await this.stopAllServices();
            // Shutdown all factories
            const shutdownPromises = Array.from(this.factories.values()).map((factory) => factory.shutdown());
            await Promise.allSettled(shutdownPromises);
            // Clear all registries
            this.factories.clear();
            this.services.clear();
            this.serviceDiscovery.clear();
            this.healthStatuses.clear();
            this.metricsHistory.clear();
            this.operationMetrics.clear();
            // Remove all listeners
            this.removeAllListeners();
            this.logger.info('Service registry shutdown completed');
        }
        catch (error) {
            this.logger.error('Error during service registry shutdown:', error);
            throw error;
        }
    }
    // ============================================
    // Advanced Service Discovery
    // ============================================
    discoverServices(criteria) {
        const allServices = Array.from(this.getAllServices().values());
        if (!criteria) {
            return allServices;
        }
        return allServices.filter((service) => {
            const discoveryInfo = this.serviceDiscovery.get(service.name);
            // Filter by type
            if (criteria.type && service.type !== criteria.type) {
                return false;
            }
            // Filter by capabilities
            if (criteria.capabilities) {
                const serviceCapabilities = service.getCapabilities();
                const hasAllCapabilities = criteria.capabilities.every((cap) => serviceCapabilities.includes(cap));
                if (!hasAllCapabilities) {
                    return false;
                }
            }
            // Filter by health
            if (criteria.health && discoveryInfo) {
                if (discoveryInfo.health !== criteria.health) {
                    return false;
                }
            }
            // Filter by tags
            if (criteria.tags && discoveryInfo) {
                const hasAllTags = criteria.tags.every((tag) => discoveryInfo.tags.includes(tag));
                if (!hasAllTags) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * Get comprehensive service discovery information.
     */
    getServiceDiscoveryInfo() {
        return new Map(this.serviceDiscovery);
    }
    /**
     * Register service for discovery.
     *
     * @param service
     * @param metadata
     */
    registerServiceForDiscovery(service, metadata) {
        const discoveryInfo = {
            serviceName: service.name,
            serviceType: service.type,
            version: service.config.version || '1.0.0',
            capabilities: service.getCapabilities(),
            tags: service.config.tags || [],
            metadata: { ...service.config.metadata, ...metadata },
            lastHeartbeat: new Date(),
            health: 'healthy',
        };
        this.serviceDiscovery.set(service.name, discoveryInfo);
        this.emit('service-discovered', service.name, discoveryInfo);
    }
    /**
     * Update service heartbeat.
     *
     * @param serviceName
     */
    updateServiceHeartbeat(serviceName) {
        const discoveryInfo = this.serviceDiscovery.get(serviceName);
        if (discoveryInfo) {
            discoveryInfo.lastHeartbeat = new Date();
            this.serviceDiscovery.set(serviceName, discoveryInfo);
        }
    }
    // ============================================
    // Event Handling
    // ============================================
    on(event, handler) {
        super.on(event, handler);
    }
    off(event, handler) {
        if (handler) {
            super.off(event, handler);
        }
        else {
            super.removeAllListeners(event);
        }
    }
    // ============================================
    // Private Implementation Methods
    // ============================================
    initializeMonitoring() {
        if (this.config.healthMonitoring.enabled) {
            this.startHealthMonitoring();
        }
        if (this.config.metricsCollection.enabled) {
            this.startMetricsCollection();
        }
        if (this.config.discovery.enabled) {
            this.startServiceDiscovery();
        }
    }
    startHealthMonitoring() {
        this.healthMonitoringInterval = setInterval(async () => {
            try {
                await this.performSystemHealthCheck();
            }
            catch (error) {
                this.logger.error('System health check failed:', error);
            }
        }, this.config.healthMonitoring.interval);
        this.logger.debug('Health monitoring started');
    }
    startMetricsCollection() {
        this.metricsCollectionInterval = setInterval(async () => {
            try {
                await this.collectSystemMetrics();
            }
            catch (error) {
                this.logger.error('Metrics collection failed:', error);
            }
        }, this.config.metricsCollection.interval);
        this.logger.debug('Metrics collection started');
    }
    startServiceDiscovery() {
        this.discoveryInterval = setInterval(() => {
            try {
                this.performServiceDiscoveryMaintenance();
            }
            catch (error) {
                this.logger.error('Service discovery maintenance failed:', error);
            }
        }, this.config.discovery.advertisementInterval);
        this.logger.debug('Service discovery started');
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
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = undefined;
        }
        this.logger.debug('Monitoring stopped');
    }
    setupFactoryEventHandling(_type, factory) {
        // Handle service creation events from factory
        if ('on' in factory && typeof factory.on === 'function') {
            factory.on('service-created', (_serviceName, service) => {
                this.handleServiceRegistration(service);
            });
            factory.on('service-removed', (serviceName) => {
                this.removeServiceFromRegistry(serviceName);
            });
        }
    }
    handleServiceRegistration(service) {
        this.logger.debug(`Handling service registration: ${service.name}`);
        // Register for discovery
        this.registerServiceForDiscovery(service);
        // Set up service event handling
        this.setupServiceEventHandling(service);
        // Emit registration event
        this.emit('service-registered', service.name, service);
    }
    setupServiceEventHandling(service) {
        const eventTypes = [
            'initializing',
            'initialized',
            'starting',
            'started',
            'stopping',
            'stopped',
            'error',
            'operation',
            'health-check',
            'metrics-update',
        ];
        eventTypes.forEach((eventType) => {
            service.on(eventType, (event) => {
                this.handleServiceEvent(service, eventType, event);
            });
        });
    }
    handleServiceEvent(service, eventType, event) {
        // Update discovery info
        this.updateServiceHeartbeat(service.name);
        // Handle specific event types
        switch (eventType) {
            case 'error':
                if (this.config.autoRecovery.enabled) {
                    this.scheduleServiceRecovery(service);
                }
                break;
            case 'health-check':
                this.updateServiceHealth(service.name, event.data);
                break;
            case 'metrics-update':
                this.updateServiceMetrics(service.name, event.data);
                break;
        }
        // Emit to registry listeners
        this.emit(`service-${eventType}`, service.name, event);
        this.emit('service-status-changed', service.name, service);
    }
    removeServiceFromRegistry(serviceName) {
        this.services.delete(serviceName);
        this.serviceDiscovery.delete(serviceName);
        this.healthStatuses.delete(serviceName);
        this.metricsHistory.delete(serviceName);
        this.operationMetrics.delete(serviceName);
        this.emit('service-unregistered', serviceName);
    }
    async performServiceHealthCheck(service) {
        const startTime = Date.now();
        try {
            const status = await Promise.race([
                service.getStatus(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), this.config.healthMonitoring.timeout)),
            ]);
            const _responseTime = Date.now() - startTime;
            // Update discovery info health
            const discoveryInfo = this.serviceDiscovery.get(service.name);
            if (discoveryInfo) {
                discoveryInfo.health = status.health;
                discoveryInfo.lastHeartbeat = new Date();
            }
            return status;
        }
        catch (error) {
            throw new ServiceOperationError(service.name, 'health-check', error);
        }
    }
    async performSystemHealthCheck() {
        const healthResults = await this.healthCheckAll();
        // Check for alerts
        const unhealthyServices = Array.from(healthResults?.entries())
            .filter(([_, status]) => status.health !== 'healthy')
            .map(([name, _]) => name);
        if (unhealthyServices.length > 0) {
            this.logger.warn(`Unhealthy services detected: ${unhealthyServices.join(', ')}`);
            this.emit('health-alert', unhealthyServices);
        }
        // Check alert thresholds
        this.checkAlertThresholds(healthResults);
    }
    checkAlertThresholds(healthResults) {
        const totalServices = healthResults.size;
        if (totalServices === 0)
            return;
        const unhealthyCount = Array.from(healthResults?.values()).filter((status) => status.health !== 'healthy').length;
        const errorRate = (unhealthyCount / totalServices) * 100;
        if (errorRate > this.config.healthMonitoring.alertThresholds.errorRate) {
            this.emit('system-alert', {
                type: 'high-error-rate',
                value: errorRate,
                threshold: this.config.healthMonitoring.alertThresholds.errorRate,
                affectedServices: unhealthyCount,
            });
        }
    }
    async collectSystemMetrics() {
        const metrics = await this.getSystemMetrics();
        // Store metrics history
        metrics.aggregatedMetrics.forEach((metric) => {
            if (!this.metricsHistory.has(metric.name)) {
                this.metricsHistory.set(metric.name, []);
            }
            const history = this.metricsHistory.get(metric.name);
            history.push(metric);
            // Keep only recent metrics within retention period
            const cutoffTime = new Date(Date.now() - this.config.metricsCollection.retention);
            const filteredHistory = history.filter((m) => m.timestamp > cutoffTime);
            this.metricsHistory.set(metric.name, filteredHistory);
        });
        this.emit('metrics-collected', metrics);
    }
    performServiceDiscoveryMaintenance() {
        const currentTime = new Date();
        const timeoutThreshold = this.config.discovery.timeoutThreshold;
        // Check for stale services
        const staleServices = [];
        this.serviceDiscovery.forEach((info, serviceName) => {
            const timeSinceHeartbeat = currentTime?.getTime() - info.lastHeartbeat.getTime();
            if (timeSinceHeartbeat > timeoutThreshold) {
                staleServices.push(serviceName);
            }
        });
        // Remove stale services
        staleServices.forEach((serviceName) => {
            this.logger.warn(`Removing stale service from discovery: ${serviceName}`);
            this.serviceDiscovery.delete(serviceName);
            this.emit('service-timeout', serviceName);
        });
        // Emit discovery heartbeat
        this.emit('discovery-heartbeat', {
            totalServices: this.serviceDiscovery.size,
            activeServices: this.serviceDiscovery.size - staleServices.length,
            staleServices: staleServices.length,
            timestamp: currentTime,
        });
    }
    updateServiceHealth(serviceName, healthData) {
        const discoveryInfo = this.serviceDiscovery.get(serviceName);
        if (discoveryInfo && healthData) {
            discoveryInfo.health = healthData?.health || discoveryInfo.health;
            discoveryInfo.lastHeartbeat = new Date();
        }
    }
    updateServiceMetrics(serviceName, metricsData) {
        if (!this.operationMetrics.has(serviceName)) {
            this.operationMetrics.set(serviceName, {
                totalOperations: 0,
                successfulOperations: 0,
                averageLatency: 0,
                lastOperation: new Date(),
            });
        }
        const metrics = this.operationMetrics.get(serviceName);
        if (metricsData) {
            metrics.totalOperations += 1;
            if (metricsData?.success) {
                metrics.successfulOperations += 1;
            }
            metrics.averageLatency = (metrics.averageLatency + (metricsData?.latency || 0)) / 2;
            metrics.lastOperation = new Date();
        }
    }
    async buildDependencyGraph() {
        // Implementation for dependency graph building
        // This would analyze service dependencies and create a proper graph
        this.logger.debug('Building service dependency graph...');
        const allServices = this.getAllServices();
        const nodes = new Map();
        // Build dependency nodes
        for (const [name, service] of allServices) {
            nodes?.set(name, {
                service,
                dependencies: new Set(service.config.dependencies?.map((dep) => dep.serviceName) || []),
                dependents: new Set(),
                level: 0,
            });
        }
        // Calculate dependents and levels
        for (const [nodeName, node] of nodes) {
            for (const depName of node?.dependencies) {
                const depNode = nodes?.get(depName);
                if (depNode) {
                    depNode?.dependents?.add(nodeName);
                }
            }
        }
        // Create startup/shutdown order
        const startupOrder = this.calculateStartupOrder(nodes);
        const shutdownOrder = [...startupOrder].reverse();
        this.dependencyGraph = {
            nodes,
            cycles: [], // TODO: Implement cycle detection
            startupOrder,
            shutdownOrder,
        };
        this.logger.debug(`Dependency graph built with ${nodes.size} services`);
    }
    calculateStartupOrder(nodes) {
        const order = [];
        const visited = new Set();
        const visit = (nodeName) => {
            if (visited.has(nodeName))
                return;
            const node = nodes?.get(nodeName);
            if (!node)
                return;
            // Visit dependencies first
            for (const depName of node?.dependencies) {
                visit(depName);
            }
            visited.add(nodeName);
            order.push(nodeName);
        };
        // Visit all nodes
        for (const nodeName of nodes?.keys()) {
            visit(nodeName);
        }
        return order;
    }
    async startServicesInOrder() {
        if (!this.dependencyGraph) {
            throw new Error('Dependency graph not built');
        }
        for (const serviceName of this.dependencyGraph.startupOrder) {
            const service = this.findService(serviceName);
            if (service) {
                try {
                    this.logger.debug(`Starting service: ${serviceName}`);
                    await service.start();
                }
                catch (error) {
                    this.logger.error(`Failed to start service ${serviceName}:`, error);
                    if (this.config.autoRecovery.enabled) {
                        this.scheduleServiceRecovery(service);
                    }
                }
            }
        }
    }
    async stopServicesInOrder() {
        if (!this.dependencyGraph) {
            throw new Error('Dependency graph not built');
        }
        for (const serviceName of this.dependencyGraph.shutdownOrder) {
            const service = this.findService(serviceName);
            if (service) {
                try {
                    this.logger.debug(`Stopping service: ${serviceName}`);
                    await service.stop();
                }
                catch (error) {
                    this.logger.error(`Failed to stop service ${serviceName}:`, error);
                }
            }
        }
    }
    async startServicesParallel() {
        const allServices = this.getAllServices();
        const startPromises = Array.from(allServices.values()).map(async (service) => {
            try {
                await service.start();
            }
            catch (error) {
                this.logger.error(`Failed to start service ${service.name}:`, error);
                if (this.config.autoRecovery.enabled) {
                    this.scheduleServiceRecovery(service);
                }
            }
        });
        await Promise.allSettled(startPromises);
    }
    async stopServicesParallel() {
        const allServices = this.getAllServices();
        const stopPromises = Array.from(allServices.values()).map(async (service) => {
            try {
                await service.stop();
            }
            catch (error) {
                this.logger.error(`Failed to stop service ${service.name}:`, error);
            }
        });
        await Promise.allSettled(stopPromises);
    }
    scheduleServiceRecovery(service) {
        // Implementation for auto-recovery scheduling
        this.logger.info(`Scheduling recovery for service: ${service.name}`);
        setTimeout(async () => {
            try {
                await this.performServiceRecovery(service);
            }
            catch (error) {
                this.logger.error(`Service recovery failed for ${service.name}:`, error);
            }
        }, 5000); // 5 second delay before recovery attempt
    }
    async performServiceRecovery(service) {
        const maxRetries = this.config.autoRecovery.maxRetries;
        const backoffMultiplier = this.config.autoRecovery.backoffMultiplier;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.info(`Recovery attempt ${attempt}/${maxRetries} for service: ${service.name}`);
                // Stop and restart the service
                await service.stop();
                await service.start();
                // Verify health
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
                    const delay = backoffMultiplier ** attempt * 1000;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        this.logger.error(`Service recovery failed after ${maxRetries} attempts: ${service.name}`);
        this.emit('service-recovery-failed', service.name);
    }
}
export default EnhancedServiceRegistry;
