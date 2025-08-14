import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-events-adapters-monitoring-event-adapter');
import { EventManagerTypes, } from '../core/interfaces.ts';
import { EventPriorityMap } from '../types.ts';
const createLogger = (name) => ({
    info: (_message, _meta) => { },
    debug: (_message, _meta) => { },
    warn: (message, meta) => logger.warn(`[WARN] ${name}: ${message}`, meta),
    error: (message, meta, error) => logger.error(`[ERROR] ${name}: ${message}`, meta, error),
});
import { EventEmitter } from 'node:events';
export class MonitoringEventAdapter {
    config;
    name;
    type;
    running = false;
    eventEmitter = new EventEmitter();
    logger;
    startTime;
    eventCount = 0;
    successCount = 0;
    errorCount = 0;
    totalLatency = 0;
    wrappedComponents = new Map();
    performanceMonitors = new Map();
    metricsCollectors = new Map();
    analyticsComponents = new Map();
    dashboardComponents = new Map();
    monitoringCorrelations = new Map();
    monitoringHealth = new Map();
    metrics = [];
    subscriptions = new Map();
    filters = new Map();
    transforms = new Map();
    eventQueue = [];
    processingEvents = false;
    eventHistory = [];
    metricsData = new Map();
    healthData = new Map();
    alertData = new Map();
    performanceInsights = new Map();
    constructor(config) {
        this.name = config?.name;
        this.type = EventManagerTypes.MONITORING;
        this.config = {
            performanceMonitoring: {
                enabled: true,
                wrapMetricsEvents: true,
                wrapThresholdEvents: true,
                wrapAlertEvents: true,
                wrapOptimizationEvents: true,
                monitors: ['default-performance-monitor'],
                ...config?.performanceMonitoring,
            },
            healthMonitoring: {
                enabled: true,
                wrapHealthCheckEvents: true,
                wrapStatusEvents: true,
                wrapRecoveryEvents: true,
                wrapCorrelationEvents: true,
                components: ['system-health', 'service-health', 'component-health'],
                ...config?.healthMonitoring,
            },
            analyticsMonitoring: {
                enabled: true,
                wrapCollectionEvents: true,
                wrapAggregationEvents: true,
                wrapReportingEvents: true,
                wrapInsightEvents: true,
                analyzers: [
                    'performance-analyzer',
                    'trend-analyzer',
                    'anomaly-detector',
                ],
                ...config?.analyticsMonitoring,
            },
            alertManagement: {
                enabled: true,
                wrapAlertEvents: true,
                wrapEscalationEvents: true,
                wrapResolutionEvents: true,
                wrapNotificationEvents: true,
                alertLevels: ['info', 'warning', 'error', 'critical'],
                ...config?.alertManagement,
            },
            dashboardIntegration: {
                enabled: true,
                wrapUpdateEvents: true,
                wrapVisualizationEvents: true,
                wrapStreamingEvents: true,
                wrapInteractionEvents: true,
                dashboards: ['main-dashboard', 'metrics-dashboard', 'health-dashboard'],
                ...config?.dashboardIntegration,
            },
            performance: {
                enableMetricsCorrelation: true,
                enableRealTimeTracking: true,
                enablePerformanceAggregation: true,
                maxConcurrentMonitors: 50,
                monitoringInterval: 5000,
                enablePerformanceTracking: true,
                ...config?.performance,
            },
            monitoring: {
                enabled: true,
                strategy: 'metrics',
                correlationTTL: 600000,
                maxCorrelationDepth: 25,
                correlationPatterns: [
                    'monitoring:metrics->monitoring:health',
                    'monitoring:health->monitoring:alert',
                    'monitoring:performance->monitoring:metrics',
                    'monitoring:alert->monitoring:health',
                ],
                trackMetricsFlow: true,
                trackHealthStatus: true,
                trackPerformanceInsights: true,
                ...config?.monitoring,
            },
            healthMonitoringConfig: {
                enabled: true,
                healthCheckInterval: 30000,
                healthThresholds: {
                    'performance-monitor': 0.9,
                    'metrics-collector': 0.85,
                    'analytics-component': 0.8,
                    'dashboard-component': 0.75,
                    'alert-manager': 0.95,
                },
                alertThresholds: {
                    'monitoring-latency': 200,
                    'data-accuracy': 0.95,
                    'resource-usage': 0.8,
                    'monitoring-availability': 0.9,
                },
                autoRecoveryEnabled: true,
                correlateHealthData: true,
                ...config?.healthMonitoringConfig,
            },
            metricsOptimization: {
                enabled: true,
                optimizationInterval: 120000,
                performanceThresholds: {
                    latency: 100,
                    throughput: 1000,
                    accuracy: 0.98,
                    resourceUsage: 0.7,
                },
                dataAggregation: true,
                intelligentSampling: true,
                anomalyDetection: true,
                ...config?.metricsOptimization,
            },
            ...config,
        };
        this.logger = createLogger(`MonitoringEventAdapter:${this.name}`);
        this.logger.info(`Creating monitoring event adapter: ${this.name}`);
        this.eventEmitter.setMaxListeners(3000);
    }
    async start() {
        if (this.running) {
            this.logger.warn(`Monitoring event adapter ${this.name} is already running`);
            return;
        }
        this.logger.info(`Starting monitoring event adapter: ${this.name}`);
        try {
            await this.initializeMonitoringIntegrations();
            this.startEventProcessing();
            if (this.config.healthMonitoringConfig?.enabled) {
                this.startMonitoringHealthMonitoring();
            }
            if (this.config.monitoring?.enabled) {
                this.startMonitoringCorrelationCleanup();
            }
            if (this.config.metricsOptimization?.enabled) {
                this.startMetricsOptimization();
            }
            this.running = true;
            this.startTime = new Date();
            this.emitInternal('start');
            this.logger.info(`Monitoring event adapter started successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to start monitoring event adapter ${this.name}:`, error);
            this.emitInternal('error', error);
            throw error;
        }
    }
    async stop() {
        if (!this.running) {
            this.logger.warn(`Monitoring event adapter ${this.name} is not running`);
            return;
        }
        this.logger.info(`Stopping monitoring event adapter: ${this.name}`);
        try {
            this.processingEvents = false;
            await this.unwrapMonitoringComponents();
            this.eventQueue.length = 0;
            this.running = false;
            this.emitInternal('stop');
            this.logger.info(`Monitoring event adapter stopped successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to stop monitoring event adapter ${this.name}:`, error);
            this.emitInternal('error', error);
            throw error;
        }
    }
    async restart() {
        this.logger.info(`Restarting monitoring event adapter: ${this.name}`);
        await this.stop();
        await this.start();
    }
    isRunning() {
        return this.running;
    }
    async emit(event, options) {
        const startTime = Date.now();
        const _eventId = event.id || this.generateEventId();
        try {
            if (!(event.id && event.timestamp && event.source && event.type)) {
                throw new Error('Invalid monitoring event format');
            }
            const timeout = options?.timeout ||
                this.config.performance?.monitoringInterval ||
                30000;
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Event timeout after ${timeout}ms`)), timeout);
            });
            const emissionPromise = this.processMonitoringEventEmission(event, options);
            await Promise.race([emissionPromise, timeoutPromise]);
            const duration = Date.now() - startTime;
            this.recordMonitoringEventMetrics({
                eventType: event.type,
                component: event.source,
                operation: event.operation || 'unknown',
                executionTime: duration,
                success: true,
                correlationId: event.correlationId,
                metricName: this.extractMetricName(event),
                metricValue: this.extractMetricValue(event),
                alertLevel: this.extractAlertLevel(event),
                healthScore: this.extractHealthScore(event),
                performanceData: this.extractPerformanceData(event),
                timestamp: new Date(),
            });
            this.eventCount++;
            this.successCount++;
            this.totalLatency += duration;
            this.eventEmitter.emit('emission', { event, success: true, duration });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.recordMonitoringEventMetrics({
                eventType: event.type,
                component: event.source,
                operation: event.operation || 'unknown',
                executionTime: duration,
                success: false,
                correlationId: event.correlationId,
                metricName: this.extractMetricName(event),
                metricValue: this.extractMetricValue(event),
                alertLevel: this.extractAlertLevel(event),
                healthScore: this.extractHealthScore(event),
                performanceData: this.extractPerformanceData(event),
                errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
                recoveryAttempts: undefined,
                timestamp: new Date(),
            });
            this.eventCount++;
            this.errorCount++;
            this.totalLatency += duration;
            this.eventEmitter.emit('emission', {
                event,
                success: false,
                duration,
                error,
            });
            this.eventEmitter.emit('error', error);
            this.logger.error(`Monitoring event emission failed for ${event.type}:`, error);
            throw error;
        }
    }
    async emitBatch(batch, options) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Emitting monitoring event batch: ${batch.id} (${batch.events.length} events)`);
            switch (this.config.processing?.strategy) {
                case 'immediate':
                    await this.processMonitoringBatchImmediate(batch, options);
                    break;
                case 'queued':
                    await this.processMonitoringBatchQueued(batch, options);
                    break;
                case 'batched':
                    await this.processMonitoringBatchBatched(batch, options);
                    break;
                case 'throttled':
                    await this.processMonitoringBatchThrottled(batch, options);
                    break;
                default:
                    await this.processMonitoringBatchQueued(batch, options);
            }
            const duration = Date.now() - startTime;
            this.logger.debug(`Monitoring event batch processed successfully: ${batch.id} in ${duration}ms`);
        }
        catch (error) {
            this.logger.error(`Monitoring event batch processing failed for ${batch.id}:`, error);
            throw error;
        }
    }
    async emitImmediate(event) {
        await this.emit(event, { timeout: 5000 });
    }
    subscribe(eventTypes, listener, options) {
        const subscriptionId = this.generateSubscriptionId();
        const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
        const subscription = {
            id: subscriptionId,
            eventTypes: types,
            listener,
            ...(options?.filter && { filter: options?.filter }),
            ...(options?.transform && { transform: options?.transform }),
            priority: options?.priority || 'medium',
            created: new Date(),
            active: true,
            metadata: options?.metadata || {},
        };
        this.subscriptions.set(subscriptionId, subscription);
        this.logger.debug(`Created monitoring subscription ${subscriptionId} for events: ${types.join(', ')}`);
        this.eventEmitter.emit('subscription', { subscriptionId, subscription });
        return subscriptionId;
    }
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            return false;
        }
        subscription.active = false;
        this.subscriptions.delete(subscriptionId);
        this.logger.debug(`Removed monitoring subscription: ${subscriptionId}`);
        return true;
    }
    unsubscribeAll(eventType) {
        let removedCount = 0;
        if (eventType) {
            for (const [id, subscription] of Array.from(this.subscriptions.entries())) {
                if (subscription.eventTypes.includes(eventType)) {
                    this.unsubscribe(id);
                    removedCount++;
                }
            }
        }
        else {
            removedCount = this.subscriptions.size;
            this.subscriptions.clear();
            this.eventEmitter.removeAllListeners();
        }
        this.logger.debug(`Removed ${removedCount} monitoring subscriptions${eventType ? ` for ${eventType}` : ''}`);
        return removedCount;
    }
    addFilter(filter) {
        const filterId = this.generateFilterId();
        this.filters.set(filterId, filter);
        this.logger.debug(`Added monitoring event filter: ${filterId}`);
        return filterId;
    }
    removeFilter(filterId) {
        const result = this.filters.delete(filterId);
        if (result) {
            this.logger.debug(`Removed monitoring event filter: ${filterId}`);
        }
        return result;
    }
    addTransform(transform) {
        const transformId = this.generateTransformId();
        this.transforms.set(transformId, transform);
        this.logger.debug(`Added monitoring event transform: ${transformId}`);
        return transformId;
    }
    removeTransform(transformId) {
        const result = this.transforms.delete(transformId);
        if (result) {
            this.logger.debug(`Removed monitoring event transform: ${transformId}`);
        }
        return result;
    }
    async query(options) {
        let events = [...this.eventHistory];
        if (options?.filter) {
            events = events.filter((event) => this.applyFilter(event, options?.filter));
        }
        if (options?.sortBy) {
            events.sort((a, b) => {
                const aVal = this.getEventSortValue(a, options?.sortBy);
                const bVal = this.getEventSortValue(b, options?.sortBy);
                const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return options.sortOrder === 'desc' ? -comparison : comparison;
            });
        }
        const offset = options?.offset || 0;
        const limit = options?.limit || 100;
        events = events.slice(offset, offset + limit);
        return events;
    }
    async getEventHistory(eventType, limit) {
        const events = this.eventHistory.filter((event) => event.type === eventType);
        return limit ? events.slice(-limit) : events;
    }
    async healthCheck() {
        const now = new Date();
        const uptime = this.startTime
            ? now.getTime() - this.startTime.getTime()
            : 0;
        const errorRate = this.eventCount > 0 ? (this.errorCount / this.eventCount) * 100 : 0;
        const componentHealth = await this.checkMonitoringComponentHealth();
        let status = 'healthy';
        if (errorRate > 15 || !this.running) {
            status = 'unhealthy';
        }
        else if (errorRate > 8 ||
            Object.values(componentHealth).some((h) => h.status !== 'healthy')) {
            status = 'degraded';
        }
        return {
            name: this.name,
            type: this.type,
            status,
            lastCheck: now,
            subscriptions: this.subscriptions.size,
            queueSize: this.eventQueue.length,
            errorRate: errorRate / 100,
            uptime,
            metadata: {
                eventCount: this.eventCount,
                successCount: this.successCount,
                errorCount: this.errorCount,
                correlations: this.monitoringCorrelations.size,
                wrappedComponents: this.wrappedComponents.size,
                performanceMonitors: this.performanceMonitors.size,
                metricsCollectors: this.metricsCollectors.size,
                analyticsComponents: this.analyticsComponents.size,
                dashboardComponents: this.dashboardComponents.size,
                componentHealth,
                avgMonitoringLatency: this.eventCount > 0 ? this.totalLatency / this.eventCount : 0,
            },
        };
    }
    async getMetrics() {
        const now = new Date();
        const recentMetrics = this.metrics.filter((m) => now.getTime() - m.timestamp.getTime() < 300000);
        const avgLatency = this.eventCount > 0 ? this.totalLatency / this.eventCount : 0;
        const throughput = recentMetrics.length > 0 ? recentMetrics.length / 300 : 0;
        const latencies = recentMetrics
            .map((m) => m.executionTime)
            .sort((a, b) => a - b);
        const p95Index = Math.floor(latencies.length * 0.95);
        const p99Index = Math.floor(latencies.length * 0.99);
        return {
            name: this.name,
            type: this.type,
            eventsProcessed: this.eventCount,
            eventsEmitted: this.successCount,
            eventsFailed: this.errorCount,
            averageLatency: avgLatency,
            p95Latency: latencies[p95Index] || 0,
            p99Latency: latencies[p99Index] || 0,
            throughput,
            subscriptionCount: this.subscriptions.size,
            queueSize: this.eventQueue.length,
            memoryUsage: this.estimateMemoryUsage(),
            timestamp: now,
        };
    }
    getSubscriptions() {
        return Array.from(this.subscriptions.values()).filter((sub) => sub.active);
    }
    updateConfig(config) {
        this.logger.info(`Updating configuration for monitoring event adapter: ${this.name}`);
        Object.assign(this.config, config);
        this.logger.info(`Configuration updated successfully for: ${this.name}`);
    }
    on(event, handler) {
        this.eventEmitter.on(event, handler);
    }
    off(event, handler) {
        if (handler) {
            this.eventEmitter.off(event, handler);
        }
        else {
            this.eventEmitter.removeAllListeners(event);
        }
    }
    once(event, handler) {
        this.eventEmitter.once(event, handler);
    }
    async destroy() {
        this.logger.info(`Destroying monitoring event adapter: ${this.name}`);
        try {
            if (this.running) {
                await this.stop();
            }
            this.subscriptions.clear();
            this.filters.clear();
            this.transforms.clear();
            this.monitoringCorrelations.clear();
            this.monitoringHealth.clear();
            this.metrics.length = 0;
            this.eventHistory.length = 0;
            this.eventQueue.length = 0;
            this.wrappedComponents.clear();
            this.performanceMonitors.clear();
            this.metricsCollectors.clear();
            this.analyticsComponents.clear();
            this.dashboardComponents.clear();
            this.metricsData.clear();
            this.healthData.clear();
            this.alertData.clear();
            this.performanceInsights.clear();
            this.eventEmitter.removeAllListeners();
            this.logger.info(`Monitoring event adapter destroyed successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to destroy monitoring event adapter ${this.name}:`, error);
            throw error;
        }
    }
    async emitPerformanceMonitoringEvent(event) {
        const monitoringEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: new Date(),
            priority: event.priority || EventPriorityMap[event.type] || 'medium',
            correlationId: event.correlationId || this.generateCorrelationId(),
        };
        if (this.config.monitoring?.enabled) {
            this.startMonitoringEventCorrelation(monitoringEvent);
        }
        await this.emit(monitoringEvent);
    }
    async emitHealthMonitoringEvent(event) {
        const monitoringEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: new Date(),
            priority: event.priority || EventPriorityMap[event.type] || 'medium',
            correlationId: event.correlationId || this.generateCorrelationId(),
        };
        if (this.config.monitoring?.enabled) {
            this.startMonitoringEventCorrelation(monitoringEvent);
        }
        await this.emit(monitoringEvent);
    }
    async emitAnalyticsMonitoringEvent(event) {
        const monitoringEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: new Date(),
            priority: event.priority || EventPriorityMap[event.type] || 'medium',
            correlationId: event.correlationId || this.generateCorrelationId(),
        };
        if (this.config.monitoring?.enabled) {
            this.startMonitoringEventCorrelation(monitoringEvent);
        }
        await this.emit(monitoringEvent);
    }
    async emitAlertMonitoringEvent(event) {
        const monitoringEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: new Date(),
            priority: event.priority || 'high',
            correlationId: event.correlationId || this.generateCorrelationId(),
        };
        if (this.config.monitoring?.enabled) {
            this.startMonitoringEventCorrelation(monitoringEvent);
        }
        await this.emit(monitoringEvent);
    }
    subscribePerformanceMonitoringEvents(listener) {
        return this.subscribe(['monitoring:performance'], listener);
    }
    subscribeHealthMonitoringEvents(listener) {
        return this.subscribe(['monitoring:health'], listener);
    }
    subscribeMetricsEvents(listener) {
        return this.subscribe(['monitoring:metrics'], listener);
    }
    subscribeAlertEvents(listener) {
        return this.subscribe(['monitoring:alert'], listener);
    }
    async getMonitoringHealthStatus() {
        const healthStatus = {};
        for (const [component, health] of Array.from(this.monitoringHealth.entries())) {
            healthStatus[component] = { ...health };
        }
        return healthStatus;
    }
    getMonitoringCorrelatedEvents(correlationId) {
        return this.monitoringCorrelations.get(correlationId) || null;
    }
    getActiveMonitoringCorrelations() {
        return Array.from(this.monitoringCorrelations.values()).filter((c) => c.status === 'active');
    }
    getMetricsData(metricName) {
        if (metricName) {
            return this.metricsData.get(metricName) || {};
        }
        return Object.fromEntries(this.metricsData.entries());
    }
    getHealthData(component) {
        if (component) {
            return this.healthData.get(component) || {};
        }
        return Object.fromEntries(this.healthData.entries());
    }
    getAlertData(alertId) {
        if (alertId) {
            return this.alertData.get(alertId) || {};
        }
        return Object.fromEntries(this.alertData.entries());
    }
    getPerformanceInsights(component) {
        if (component) {
            return this.performanceInsights.get(component) || {};
        }
        return Object.fromEntries(Array.from(this.performanceInsights.entries()));
    }
    async performMonitoringHealthCheck() {
        const healthResults = {};
        for (const [componentName, wrapped] of Array.from(this.wrappedComponents.entries())) {
            try {
                const startTime = Date.now();
                const isHealthy = wrapped.isActive;
                let monitoringLatency = 0;
                let dataAccuracy = 1.0;
                let healthScore = 0.8;
                if (wrapped.component &&
                    typeof wrapped.component.healthCheck === 'function') {
                    const health = await wrapped.component.healthCheck();
                    monitoringLatency = health.responseTime || 0;
                    dataAccuracy = 1 - (health.errorRate || 0);
                    healthScore = health.healthScore || 0.8;
                }
                else if (wrapped.component &&
                    typeof wrapped.component.getMetrics === 'function') {
                    const metrics = await wrapped.component.getMetrics();
                    monitoringLatency = metrics.averageLatency || 0;
                    dataAccuracy =
                        1 - metrics.errorCount / Math.max(metrics.requestCount, 1);
                    healthScore = metrics.performance?.healthScore || 0.8;
                }
                const responseTime = Date.now() - startTime;
                const threshold = this.config.healthMonitoringConfig?.healthThresholds?.[componentName] || 0.7;
                const calculatedHealthScore = dataAccuracy * (monitoringLatency < 200 ? 1 : 0.5) * healthScore;
                const healthEntry = {
                    component: componentName,
                    componentType: wrapped.componentType,
                    status: calculatedHealthScore >= threshold
                        ? 'healthy'
                        : calculatedHealthScore >= threshold * 0.7
                            ? 'degraded'
                            : 'unhealthy',
                    lastCheck: new Date(),
                    consecutiveFailures: isHealthy
                        ? 0
                        : (this.monitoringHealth.get(componentName)?.consecutiveFailures ||
                            0) + 1,
                    monitoringLatency,
                    dataAccuracy,
                    resourceUsage: {
                        cpu: 0,
                        memory: 0,
                        disk: 0,
                        network: 0,
                    },
                    healthScore: calculatedHealthScore,
                    metadata: {
                        healthScore: calculatedHealthScore,
                        threshold,
                        isActive: wrapped.isActive,
                        responseTime,
                    },
                };
                if (wrapped.componentType === 'performance') {
                    healthEntry.metricsCount = this.getActiveMetricsCount(componentName);
                }
                else if (wrapped.componentType === 'alert') {
                    healthEntry.alertsCount = this.getActiveAlertsCount(componentName);
                }
                this.monitoringHealth.set(componentName, healthEntry);
                healthResults[componentName] = healthEntry;
            }
            catch (error) {
                const healthEntry = {
                    component: componentName,
                    componentType: wrapped.componentType,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    consecutiveFailures: (this.monitoringHealth.get(componentName)?.consecutiveFailures ||
                        0) + 1,
                    monitoringLatency: 0,
                    dataAccuracy: 0,
                    resourceUsage: { cpu: 0, memory: 0, disk: 0, network: 0 },
                    metadata: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                };
                this.monitoringHealth.set(componentName, healthEntry);
                healthResults[componentName] = healthEntry;
            }
        }
        return healthResults;
    }
    async initializeMonitoringIntegrations() {
        this.logger.debug('Initializing monitoring component integrations');
        if (this.config.performanceMonitoring?.enabled) {
            await this.wrapPerformanceMonitors();
        }
        if (this.config.healthMonitoring?.enabled) {
            await this.wrapHealthComponents();
        }
        if (this.config.analyticsMonitoring?.enabled) {
            await this.wrapAnalyticsComponents();
        }
        if (this.config.alertManagement?.enabled) {
            await this.wrapAlertManagement();
        }
        if (this.config.dashboardIntegration?.enabled) {
            await this.wrapDashboardIntegration();
        }
        this.logger.debug(`Wrapped ${this.wrappedComponents.size} monitoring components`);
    }
    async wrapPerformanceMonitors() {
        const monitors = this.config.performanceMonitoring?.monitors || [
            'default-performance-monitor',
        ];
        for (const monitorName of monitors) {
            const wrapper = new EventEmitter();
            const wrappedComponent = {
                component: {},
                componentType: 'performance',
                wrapper,
                originalMethods: new Map(),
                eventMappings: new Map([
                    ['monitoring:started', 'monitoring:performance'],
                    ['monitoring:stopped', 'monitoring:performance'],
                    ['metric:recorded', 'monitoring:metrics'],
                    ['alert:triggered', 'monitoring:alert'],
                    ['threshold:exceeded', 'monitoring:alert'],
                    ['optimization:triggered', 'monitoring:performance'],
                ]),
                isActive: true,
                healthMetrics: {
                    lastSeen: new Date(),
                    monitoringCount: 0,
                    errorCount: 0,
                    avgLatency: 0,
                },
            };
            wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
                wrapper.on(originalEvent, (data) => {
                    const monitoringEvent = {
                        id: this.generateEventId(),
                        timestamp: new Date(),
                        source: `performance-monitor-${monitorName}`,
                        type: uelEvent,
                        operation: this.extractMonitoringOperation(originalEvent),
                        component: monitorName,
                        priority: EventPriorityMap[uelEvent] || 'medium',
                        correlationId: this.generateCorrelationId(),
                        details: {
                            ...data,
                            metricName: data?.metricName || data?.name,
                            metricValue: data?.value,
                            threshold: data?.threshold,
                            severity: data?.severity || 'info',
                            performanceData: data?.performanceData,
                        },
                        metadata: { originalEvent, data, monitorName },
                    };
                    this.eventEmitter.emit(uelEvent, monitoringEvent);
                    this.updateComponentHealthMetrics(`performance-monitor-${monitorName}`, !originalEvent.includes('error'));
                });
            });
            this.wrappedComponents.set(`performance-monitor-${monitorName}`, wrappedComponent);
            this.logger.debug(`Wrapped performance monitor events: ${monitorName}`);
        }
    }
    async wrapHealthComponents() {
        const components = this.config.healthMonitoring?.components || [
            'system-health',
            'service-health',
        ];
        for (const componentName of components) {
            const wrapper = new EventEmitter();
            const wrappedComponent = {
                component: {},
                componentType: 'health',
                wrapper,
                originalMethods: new Map(),
                eventMappings: new Map([
                    ['health:check', 'monitoring:health'],
                    ['health:status', 'monitoring:health'],
                    ['health:recovered', 'monitoring:health'],
                    ['health:degraded', 'monitoring:health'],
                    ['health:failed', 'monitoring:health'],
                    ['correlation:updated', 'monitoring:health'],
                ]),
                isActive: true,
                healthMetrics: {
                    lastSeen: new Date(),
                    monitoringCount: 0,
                    errorCount: 0,
                    avgLatency: 0,
                },
            };
            wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
                wrapper.on(originalEvent, (data) => {
                    const monitoringEvent = {
                        id: this.generateEventId(),
                        timestamp: new Date(),
                        source: `health-component-${componentName}`,
                        type: uelEvent,
                        operation: this.extractMonitoringOperation(originalEvent),
                        component: componentName,
                        priority: this.determineMonitoringEventPriority(originalEvent),
                        correlationId: this.generateCorrelationId(),
                        details: {
                            ...data,
                            healthScore: data?.healthScore,
                            severity: data.status === 'unhealthy'
                                ? 'error'
                                : data.status === 'degraded'
                                    ? 'warning'
                                    : 'info',
                            performanceData: data?.performanceData,
                        },
                        metadata: { originalEvent, data, componentName },
                    };
                    this.eventEmitter.emit(uelEvent, monitoringEvent);
                    this.updateComponentHealthMetrics(`health-component-${componentName}`, !originalEvent.includes('failed'));
                });
            });
            this.wrappedComponents.set(`health-component-${componentName}`, wrappedComponent);
            this.logger.debug(`Wrapped health component events: ${componentName}`);
        }
    }
    async wrapAnalyticsComponents() {
        const analyzers = this.config.analyticsMonitoring?.analyzers || [
            'performance-analyzer',
        ];
        for (const analyzerName of analyzers) {
            const wrapper = new EventEmitter();
            const wrappedComponent = {
                component: {},
                componentType: 'analytics',
                wrapper,
                originalMethods: new Map(),
                eventMappings: new Map([
                    ['analysis:started', 'monitoring:performance'],
                    ['analysis:stopped', 'monitoring:performance'],
                    ['insights:generated', 'monitoring:metrics'],
                    ['anomaly:detected', 'monitoring:alert'],
                    ['trend:identified', 'monitoring:metrics'],
                    ['bottleneck:found', 'monitoring:alert'],
                ]),
                isActive: true,
                healthMetrics: {
                    lastSeen: new Date(),
                    monitoringCount: 0,
                    errorCount: 0,
                    avgLatency: 0,
                },
            };
            wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
                wrapper.on(originalEvent, (data) => {
                    const monitoringEvent = {
                        id: this.generateEventId(),
                        timestamp: new Date(),
                        source: `analytics-component-${analyzerName}`,
                        type: uelEvent,
                        operation: this.extractMonitoringOperation(originalEvent),
                        component: analyzerName,
                        priority: this.determineMonitoringEventPriority(originalEvent),
                        correlationId: this.generateCorrelationId(),
                        details: {
                            ...data,
                            severity: data?.severity || 'info',
                            performanceData: data?.performanceData || data?.insights?.performance,
                        },
                        metadata: { originalEvent, data, analyzerName },
                    };
                    this.eventEmitter.emit(uelEvent, monitoringEvent);
                    this.updateComponentHealthMetrics(`analytics-component-${analyzerName}`, !originalEvent.includes('error'));
                });
            });
            this.wrappedComponents.set(`analytics-component-${analyzerName}`, wrappedComponent);
            this.logger.debug(`Wrapped analytics component events: ${analyzerName}`);
        }
    }
    async wrapAlertManagement() {
        const wrapper = new EventEmitter();
        const wrappedComponent = {
            component: {},
            componentType: 'alert',
            wrapper,
            originalMethods: new Map(),
            eventMappings: new Map([
                ['alert:created', 'monitoring:alert'],
                ['alert:escalated', 'monitoring:alert'],
                ['alert:resolved', 'monitoring:alert'],
                ['notification:sent', 'monitoring:alert'],
                ['threshold:breached', 'monitoring:alert'],
            ]),
            isActive: true,
            healthMetrics: {
                lastSeen: new Date(),
                monitoringCount: 0,
                errorCount: 0,
                avgLatency: 0,
            },
        };
        wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
            wrapper.on(originalEvent, (data) => {
                const monitoringEvent = {
                    id: this.generateEventId(),
                    timestamp: new Date(),
                    source: 'alert-management',
                    type: uelEvent,
                    operation: this.extractMonitoringOperation(originalEvent),
                    component: 'alert-manager',
                    priority: 'high',
                    correlationId: this.generateCorrelationId(),
                    details: {
                        ...data,
                        alertId: data?.alertId,
                        severity: data?.severity || 'warning',
                    },
                    metadata: { originalEvent, data },
                };
                this.eventEmitter.emit(uelEvent, monitoringEvent);
                this.updateComponentHealthMetrics('alert-management', !originalEvent.includes('error'));
            });
        });
        this.wrappedComponents.set('alert-management', wrappedComponent);
        this.logger.debug('Wrapped alert management events');
    }
    async wrapDashboardIntegration() {
        const dashboards = this.config.dashboardIntegration?.dashboards || [
            'main-dashboard',
        ];
        for (const dashboardName of dashboards) {
            const wrapper = new EventEmitter();
            const wrappedComponent = {
                component: {},
                componentType: 'dashboard',
                wrapper,
                originalMethods: new Map(),
                eventMappings: new Map([
                    ['dashboard:updated', 'monitoring:metrics'],
                    ['visualization:rendered', 'monitoring:performance'],
                    ['data:streamed', 'monitoring:metrics'],
                    ['interaction:tracked', 'monitoring:performance'],
                ]),
                isActive: true,
                healthMetrics: {
                    lastSeen: new Date(),
                    monitoringCount: 0,
                    errorCount: 0,
                    avgLatency: 0,
                },
            };
            wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
                wrapper.on(originalEvent, (data) => {
                    const monitoringEvent = {
                        id: this.generateEventId(),
                        timestamp: new Date(),
                        source: `dashboard-${dashboardName}`,
                        type: uelEvent,
                        operation: this.extractMonitoringOperation(originalEvent),
                        component: dashboardName,
                        priority: 'medium',
                        correlationId: this.generateCorrelationId(),
                        details: {
                            ...data,
                            severity: 'info',
                        },
                        metadata: { originalEvent, data, dashboardName },
                    };
                    this.eventEmitter.emit(uelEvent, monitoringEvent);
                    this.updateComponentHealthMetrics(`dashboard-${dashboardName}`, !originalEvent.includes('error'));
                });
            });
            this.wrappedComponents.set(`dashboard-${dashboardName}`, wrappedComponent);
            this.logger.debug(`Wrapped dashboard events: ${dashboardName}`);
        }
    }
    async unwrapMonitoringComponents() {
        for (const [componentName, wrapped] of Array.from(this.wrappedComponents.entries())) {
            try {
                wrapped.originalMethods.forEach((originalMethod, methodName) => {
                    if (wrapped.component?.[methodName]) {
                        wrapped.component[methodName] = originalMethod;
                    }
                });
                wrapped.wrapper.removeAllListeners();
                wrapped.isActive = false;
                this.logger.debug(`Unwrapped monitoring component: ${componentName}`);
            }
            catch (error) {
                this.logger.warn(`Failed to unwrap monitoring component ${componentName}:`, error);
            }
        }
        this.wrappedComponents.clear();
    }
    async processMonitoringEventEmission(event, _options) {
        if (event.type.startsWith('monitoring:')) {
            this.eventHistory.push(event);
            if (this.eventHistory.length > 20000) {
                this.eventHistory = this.eventHistory.slice(-10000);
            }
            if (this.config.monitoring?.enabled && event.correlationId) {
                this.updateMonitoringEventCorrelation(event);
            }
            this.updateMonitoringMetrics(event);
        }
        for (const filter of Array.from(this.filters.values())) {
            if (!this.applyFilter(event, filter)) {
                this.logger.debug(`Monitoring event ${event.id} filtered out`);
                return;
            }
        }
        let transformedEvent = event;
        for (const transform of Array.from(this.transforms.values())) {
            transformedEvent = await this.applyTransform(transformedEvent, transform);
        }
        for (const subscription of Array.from(this.subscriptions.values())) {
            if (!(subscription.active &&
                subscription.eventTypes.includes(transformedEvent.type))) {
                continue;
            }
            try {
                if (subscription.filter &&
                    !this.applyFilter(transformedEvent, subscription.filter)) {
                    continue;
                }
                let subscriptionEvent = transformedEvent;
                if (subscription.transform) {
                    subscriptionEvent = await this.applyTransform(transformedEvent, subscription.transform);
                }
                await subscription.listener(subscriptionEvent);
            }
            catch (error) {
                this.logger.error(`Monitoring subscription listener error for ${subscription.id}:`, error);
                this.eventEmitter.emit('subscription-error', {
                    subscriptionId: subscription.id,
                    error,
                });
            }
        }
        this.eventEmitter.emit(transformedEvent.type, transformedEvent);
        this.eventEmitter.emit('*', transformedEvent);
    }
    startEventProcessing() {
        this.processingEvents = true;
        const processQueue = async () => {
            if (!this.processingEvents || this.eventQueue.length === 0) {
                setTimeout(processQueue, 100);
                return;
            }
            const event = this.eventQueue.shift();
            if (event) {
                try {
                    await this.processMonitoringEventEmission(event);
                }
                catch (error) {
                    this.logger.error('Monitoring event processing error:', error);
                }
            }
            setImmediate(processQueue);
        };
        processQueue();
    }
    startMonitoringHealthMonitoring() {
        const interval = this.config.healthMonitoringConfig?.healthCheckInterval || 30000;
        setInterval(async () => {
            try {
                await this.performMonitoringHealthCheck();
                for (const [component, health] of Array.from(this.monitoringHealth.entries())) {
                    if (health.status !== 'healthy') {
                        await this.emitHealthMonitoringEvent({
                            source: component,
                            type: 'monitoring:health',
                            operation: 'alert',
                            component: component,
                            details: {
                                healthScore: health.healthScore,
                                severity: health.status === 'unhealthy'
                                    ? 'error'
                                    : 'warning',
                                performanceData: {
                                    cpu: health.resourceUsage.cpu,
                                    memory: health.resourceUsage.memory,
                                    disk: health.resourceUsage.disk,
                                    network: health.resourceUsage.network,
                                    latency: health.monitoringLatency,
                                    throughput: 0,
                                    errorRate: health.consecutiveFailures > 0 ? 0.1 : 0,
                                },
                            },
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error('Monitoring health monitoring error:', error);
            }
        }, interval);
    }
    startMonitoringCorrelationCleanup() {
        const cleanupInterval = 60000;
        const correlationTTL = this.config.monitoring?.correlationTTL || 600000;
        setInterval(() => {
            const now = Date.now();
            const expiredCorrelations = [];
            for (const [correlationId, correlation] of Array.from(this.monitoringCorrelations.entries())) {
                if (now - correlation.lastUpdate.getTime() > correlationTTL) {
                    expiredCorrelations.push(correlationId);
                }
            }
            expiredCorrelations.forEach((id) => {
                const correlation = this.monitoringCorrelations.get(id);
                if (correlation) {
                    correlation.status = 'timeout';
                    this.monitoringCorrelations.delete(id);
                }
            });
            if (expiredCorrelations.length > 0) {
                this.logger.debug(`Cleaned up ${expiredCorrelations.length} expired monitoring correlations`);
            }
        }, cleanupInterval);
    }
    startMetricsOptimization() {
        const interval = this.config.metricsOptimization?.optimizationInterval || 120000;
        setInterval(async () => {
            if (!this.config.metricsOptimization?.enabled)
                return;
            try {
                const monitoringHealth = await this.performMonitoringHealthCheck();
                for (const [componentName, health] of Object.entries(monitoringHealth)) {
                    const thresholds = this.config.metricsOptimization.performanceThresholds;
                    if (health.monitoringLatency > thresholds.latency ||
                        health.dataAccuracy < thresholds.accuracy ||
                        (health.resourceUsage.cpu + health.resourceUsage.memory) / 2 >
                            thresholds.resourceUsage) {
                        this.logger.info(`Triggering optimization for ${componentName}`, {
                            latency: health.monitoringLatency,
                            accuracy: health.dataAccuracy,
                            resourceUsage: health.resourceUsage,
                        });
                        await this.emitPerformanceMonitoringEvent({
                            source: 'metrics-optimizer',
                            type: 'monitoring:performance',
                            operation: 'collect',
                            component: componentName,
                            details: {
                                severity: health.dataAccuracy < thresholds.accuracy
                                    ? 'warning'
                                    : 'info',
                                performanceData: {
                                    cpu: health.resourceUsage.cpu,
                                    memory: health.resourceUsage.memory,
                                    disk: health.resourceUsage.disk,
                                    network: health.resourceUsage.network,
                                    latency: health.monitoringLatency,
                                    throughput: 0,
                                    errorRate: health.consecutiveFailures > 0 ? 0.1 : 0,
                                },
                            },
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error('Metrics optimization error:', error);
            }
        }, interval);
    }
    startMonitoringEventCorrelation(event) {
        const correlationId = event.correlationId || this.generateCorrelationId();
        if (this.monitoringCorrelations.has(correlationId)) {
            this.updateMonitoringEventCorrelation(event);
        }
        else {
            const correlation = {
                correlationId,
                events: [event],
                startTime: new Date(),
                lastUpdate: new Date(),
                component: event.component,
                monitoringType: this.extractMonitoringType(event),
                metricNames: this.extractMetricNames(event),
                operation: event.operation,
                status: 'active',
                performance: {
                    totalLatency: 0,
                    monitoringEfficiency: 1.0,
                    dataAccuracy: 1.0,
                    resourceUtilization: 0,
                },
                metadata: {},
            };
            this.monitoringCorrelations.set(correlationId, correlation);
        }
    }
    updateMonitoringEventCorrelation(event) {
        const correlationId = event.correlationId;
        if (!correlationId)
            return;
        const correlation = this.monitoringCorrelations.get(correlationId);
        if (correlation) {
            correlation.events.push(event);
            correlation.lastUpdate = new Date();
            const metricName = this.extractMetricName(event);
            const component = event.component;
            if (metricName && !correlation.metricNames.includes(metricName)) {
                correlation.metricNames.push(metricName);
            }
            if (component && !correlation.component) {
                correlation.component = component;
            }
            const totalTime = correlation.lastUpdate.getTime() - correlation.startTime.getTime();
            correlation.performance.totalLatency = totalTime;
            correlation.performance.monitoringEfficiency =
                this.calculateMonitoringEfficiency(correlation);
            correlation.performance.dataAccuracy =
                this.calculateDataAccuracy(correlation);
            if (this.isMonitoringCorrelationComplete(correlation)) {
                correlation.status = 'completed';
            }
        }
    }
    isMonitoringCorrelationComplete(correlation) {
        const patterns = this.config.monitoring?.correlationPatterns || [];
        for (const pattern of patterns) {
            const [startEvent, endEvent] = pattern.split('->');
            const hasStart = correlation.events.some((e) => e.type === startEvent);
            const hasEnd = correlation.events.some((e) => e.type === endEvent);
            if (hasStart && hasEnd) {
                return true;
            }
        }
        return false;
    }
    calculateMonitoringEfficiency(correlation) {
        const events = correlation.events;
        if (events.length < 2)
            return 1.0;
        const successfulEvents = events.filter((e) => e.details?.severity !== 'error' && e.operation !== 'alert').length;
        const timeEfficiency = Math.max(0, 1 - correlation.performance.totalLatency / 120000);
        const successRate = successfulEvents / events.length;
        return (timeEfficiency + successRate) / 2;
    }
    calculateDataAccuracy(correlation) {
        const events = correlation.events;
        if (events.length === 0)
            return 1.0;
        const validEvents = events.filter((e) => e.details?.metricValue !== undefined ||
            e.details?.healthScore !== undefined).length;
        const consistencyScore = validEvents / events.length;
        return consistencyScore;
    }
    async checkMonitoringComponentHealth() {
        const componentHealth = {};
        for (const [componentName, wrapped] of Array.from(this.wrappedComponents.entries())) {
            const existing = this.monitoringHealth.get(componentName);
            const healthEntry = existing || {
                component: componentName,
                componentType: wrapped.componentType,
                status: wrapped.isActive ? 'healthy' : 'unhealthy',
                lastCheck: new Date(),
                consecutiveFailures: 0,
                monitoringLatency: wrapped.healthMetrics.avgLatency,
                dataAccuracy: wrapped.healthMetrics.errorCount === 0 ? 1.0 : 0.8,
                resourceUsage: { cpu: 0, memory: 0, disk: 0, network: 0 },
                metadata: {},
            };
            componentHealth[componentName] = healthEntry;
        }
        return componentHealth;
    }
    async processMonitoringBatchImmediate(batch, options) {
        await Promise.all(batch.events.map((event) => this.emit(event, options)));
    }
    async processMonitoringBatchQueued(batch, _options) {
        const monitoringEvents = batch.events.filter((e) => e.type.startsWith('monitoring:'));
        this.eventQueue.push(...monitoringEvents);
    }
    async processMonitoringBatchBatched(batch, options) {
        const batchSize = this.config.processing?.batchSize || 50;
        for (let i = 0; i < batch.events.length; i += batchSize) {
            const chunk = batch.events.slice(i, i + batchSize);
            await Promise.all(chunk.map((event) => this.emit(event, options)));
        }
    }
    async processMonitoringBatchThrottled(batch, options) {
        const throttleMs = this.config.processing?.throttleMs || 100;
        for (const event of batch.events) {
            await this.emit(event, options);
            await new Promise((resolve) => setTimeout(resolve, throttleMs));
        }
    }
    applyFilter(event, filter) {
        if (filter.types && !filter.types.includes(event.type)) {
            return false;
        }
        if (filter.sources && !filter.sources.includes(event.source)) {
            return false;
        }
        if (filter.priorities &&
            event.priority &&
            !filter.priorities.includes(event.priority)) {
            return false;
        }
        if (filter.metadata) {
            for (const [key, value] of Object.entries(filter.metadata)) {
                if (!event.metadata || event.metadata[key] !== value) {
                    return false;
                }
            }
        }
        if (filter.customFilter && !filter.customFilter(event)) {
            return false;
        }
        return true;
    }
    async applyTransform(event, transform) {
        let transformedEvent = event;
        if (transform.mapper) {
            transformedEvent = transform.mapper(transformedEvent);
        }
        if (transform.enricher) {
            transformedEvent = (await transform.enricher(transformedEvent));
        }
        if (transform.validator && !transform.validator(transformedEvent)) {
            throw new Error(`Monitoring event transformation validation failed for ${event.id}`);
        }
        return transformedEvent;
    }
    getEventSortValue(event, sortBy) {
        switch (sortBy) {
            case 'timestamp':
                return event.timestamp.getTime();
            case 'priority': {
                const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
                return priorities[event.priority || 'medium'];
            }
            case 'type':
                return event.type;
            case 'source':
                return event.source;
            case 'component':
                return event.component || event.source;
            default:
                return event.timestamp.getTime();
        }
    }
    extractMonitoringOperation(eventType) {
        if (eventType.includes('collect'))
            return 'collect';
        if (eventType.includes('report'))
            return 'report';
        if (eventType.includes('alert'))
            return 'alert';
        if (eventType.includes('recover'))
            return 'recover';
        if (eventType.includes('threshold'))
            return 'threshold';
        if (eventType.includes('anomaly'))
            return 'anomaly';
        return 'collect';
    }
    extractMetricName(event) {
        return event.details?.metricName || event.metadata?.['metricName'];
    }
    extractMetricValue(event) {
        return (event.details?.metricValue || event.metadata?.['metricValue']);
    }
    extractAlertLevel(event) {
        return event.details?.severity || event.metadata?.['severity'];
    }
    extractHealthScore(event) {
        return (event.details?.healthScore || event.metadata?.['healthScore']);
    }
    extractPerformanceData(event) {
        return (event.details?.performanceData ||
            event.metadata?.['performanceData']);
    }
    extractMonitoringType(event) {
        if (event.type.includes('performance'))
            return 'performance';
        if (event.type.includes('health'))
            return 'health';
        if (event.type.includes('metrics'))
            return 'metrics';
        if (event.type.includes('alert'))
            return 'alert';
        return 'monitoring';
    }
    extractMetricNames(event) {
        const metricName = this.extractMetricName(event);
        return metricName ? [metricName] : [];
    }
    determineMonitoringEventPriority(eventType) {
        if (eventType.includes('alert') ||
            eventType.includes('failed') ||
            eventType.includes('error'))
            return 'high';
        if (eventType.includes('degraded') ||
            eventType.includes('warning') ||
            eventType.includes('threshold'))
            return 'medium';
        if (eventType.includes('recovered') ||
            eventType.includes('started') ||
            eventType.includes('completed'))
            return 'medium';
        return 'low';
    }
    updateComponentHealthMetrics(componentName, success) {
        const wrapped = this.wrappedComponents.get(componentName);
        if (wrapped) {
            wrapped.healthMetrics.lastSeen = new Date();
            wrapped.healthMetrics.monitoringCount++;
            if (!success) {
                wrapped.healthMetrics.errorCount++;
            }
        }
    }
    updateMonitoringMetrics(event) {
        const metricName = this.extractMetricName(event);
        if (metricName && event.type === 'monitoring:metrics') {
            const metrics = this.metricsData.get(metricName) || {
                eventCount: 0,
                lastUpdate: new Date(),
            };
            metrics.eventCount++;
            metrics.lastUpdate = new Date();
            if (event.details?.metricValue !== undefined) {
                metrics.latestValue = event.details.metricValue;
            }
            this.metricsData.set(metricName, metrics);
        }
        const component = event.component;
        if (component && event.type === 'monitoring:health') {
            const health = this.healthData.get(component) || {
                eventCount: 0,
                lastUpdate: new Date(),
            };
            health.eventCount++;
            health.lastUpdate = new Date();
            if (event.details?.healthScore !== undefined) {
                health.latestScore = event.details.healthScore;
            }
            this.healthData.set(component, health);
        }
        const alertId = event.details?.alertId;
        if (alertId && event.type === 'monitoring:alert') {
            const alert = this.alertData.get(alertId) || {
                eventCount: 0,
                lastUpdate: new Date(),
            };
            alert.eventCount++;
            alert.lastUpdate = new Date();
            alert.severity = event.details?.severity || 'info';
            this.alertData.set(alertId, alert);
        }
        if (event.type === 'monitoring:performance' &&
            event.details?.performanceData) {
            const insights = this.performanceInsights.get(component) || {
                eventCount: 0,
                lastUpdate: new Date(),
            };
            insights.eventCount++;
            insights.lastUpdate = new Date();
            insights.performanceData = event.details.performanceData;
            this.performanceInsights.set(component, insights);
        }
    }
    getActiveMetricsCount(_componentName) {
        return this.metricsData.size;
    }
    getActiveAlertsCount(_componentName) {
        return this.alertData.size;
    }
    recordMonitoringEventMetrics(metrics) {
        if (!this.config.performance?.enablePerformanceTracking) {
            return;
        }
        this.metrics.push(metrics);
        const cutoff = new Date(Date.now() - 3600000);
        this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
    }
    estimateMemoryUsage() {
        let size = 0;
        size += this.subscriptions.size * 300;
        size += this.eventHistory.length * 1000;
        for (const correlation of Array.from(this.monitoringCorrelations.values())) {
            size += correlation.events.length * 600;
        }
        size += this.metrics.length * 250;
        size += this.metricsData.size * 150;
        size += this.healthData.size * 150;
        size += this.alertData.size * 150;
        size += this.performanceInsights.size * 200;
        return size;
    }
    generateEventId() {
        return `mon-evt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateSubscriptionId() {
        return `mon-sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateFilterId() {
        return `mon-flt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateTransformId() {
        return `mon-txf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateCorrelationId() {
        return `mon-cor-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    emitInternal(event, data) {
        this.eventEmitter.emit(event, data);
    }
}
export function createMonitoringEventAdapter(config) {
    return new MonitoringEventAdapter(config);
}
export function createDefaultMonitoringEventAdapterConfig(name, overrides) {
    return {
        name,
        type: EventManagerTypes.MONITORING,
        processing: {
            strategy: 'immediate',
            queueSize: 8000,
        },
        retry: {
            attempts: 3,
            delay: 1000,
            backoff: 'linear',
            maxDelay: 5000,
        },
        health: {
            checkInterval: 30000,
            timeout: 5000,
            failureThreshold: 3,
            successThreshold: 2,
            enableAutoRecovery: true,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 2000,
            trackLatency: true,
            trackThroughput: true,
            trackErrors: true,
            enableProfiling: false,
            strategy: 'metrics',
            correlationTTL: 600000,
            maxCorrelationDepth: 25,
            correlationPatterns: [
                'monitoring:metrics->monitoring:health',
                'monitoring:health->monitoring:alert',
                'monitoring:performance->monitoring:metrics',
                'monitoring:alert->monitoring:health',
            ],
            trackMetricsFlow: true,
            trackHealthStatus: true,
            trackPerformanceInsights: true,
        },
        performanceMonitoring: {
            enabled: true,
            wrapMetricsEvents: true,
            wrapThresholdEvents: true,
            wrapAlertEvents: true,
            wrapOptimizationEvents: true,
            monitors: ['default-performance-monitor'],
        },
        healthMonitoring: {
            enabled: true,
            wrapHealthCheckEvents: true,
            wrapStatusEvents: true,
            wrapRecoveryEvents: true,
            wrapCorrelationEvents: true,
            components: ['system-health', 'service-health', 'component-health'],
        },
        analyticsMonitoring: {
            enabled: true,
            wrapCollectionEvents: true,
            wrapAggregationEvents: true,
            wrapReportingEvents: true,
            wrapInsightEvents: true,
            analyzers: ['performance-analyzer', 'trend-analyzer', 'anomaly-detector'],
        },
        alertManagement: {
            enabled: true,
            wrapAlertEvents: true,
            wrapEscalationEvents: true,
            wrapResolutionEvents: true,
            wrapNotificationEvents: true,
            alertLevels: ['info', 'warning', 'error', 'critical'],
        },
        dashboardIntegration: {
            enabled: true,
            wrapUpdateEvents: true,
            wrapVisualizationEvents: true,
            wrapStreamingEvents: true,
            wrapInteractionEvents: true,
            dashboards: ['main-dashboard', 'metrics-dashboard', 'health-dashboard'],
        },
        performance: {
            enableMetricsCorrelation: true,
            enableRealTimeTracking: true,
            enablePerformanceAggregation: true,
            maxConcurrentMonitors: 50,
            monitoringInterval: 5000,
            enablePerformanceTracking: true,
        },
        healthMonitoringConfig: {
            enabled: true,
            healthCheckInterval: 30000,
            healthThresholds: {
                'performance-monitor': 0.9,
                'metrics-collector': 0.85,
                'analytics-component': 0.8,
                'dashboard-component': 0.75,
                'alert-manager': 0.95,
            },
            alertThresholds: {
                'monitoring-latency': 200,
                'data-accuracy': 0.95,
                'resource-usage': 0.8,
                'monitoring-availability': 0.9,
            },
            autoRecoveryEnabled: true,
            correlateHealthData: true,
        },
        metricsOptimization: {
            enabled: true,
            optimizationInterval: 120000,
            performanceThresholds: {
                latency: 100,
                throughput: 1000,
                accuracy: 0.98,
                resourceUsage: 0.7,
            },
            dataAggregation: true,
            intelligentSampling: true,
            anomalyDetection: true,
        },
        ...overrides,
    };
}
export const MonitoringEventHelpers = {
    createPerformanceMetricsEvent(metricName, metricValue, component, details) {
        return {
            source: 'performance-monitor',
            type: 'monitoring:metrics',
            operation: 'collect',
            component,
            priority: 'medium',
            details: {
                ...details,
                metricName,
                metricValue,
                severity: 'info',
            },
        };
    },
    createHealthStatusEvent(component, healthScore, status, details) {
        return {
            source: 'health-monitor',
            type: 'monitoring:health',
            operation: status === 'healthy' ? 'recover' : 'alert',
            component,
            priority: status === 'unhealthy' ? 'high' : 'medium',
            details: {
                ...details,
                healthScore,
                severity: status === 'unhealthy'
                    ? 'error'
                    : status === 'degraded'
                        ? 'warning'
                        : 'info',
            },
        };
    },
    createAlertEvent(alertId, severity, component, details) {
        return {
            source: 'alert-manager',
            type: 'monitoring:alert',
            operation: 'alert',
            component,
            priority: severity === 'critical'
                ? 'critical'
                : severity === 'error'
                    ? 'high'
                    : 'medium',
            details: {
                ...details,
                alertId,
                severity,
            },
        };
    },
    createAnalyticsInsightEvent(component, insights, details) {
        return {
            source: 'analytics-engine',
            type: 'monitoring:metrics',
            operation: 'report',
            component,
            priority: 'medium',
            details: {
                ...details,
                insights,
                severity: 'info',
            },
        };
    },
    createMonitoringErrorEvent(component, error, _operation, details) {
        return {
            source: component,
            type: 'monitoring:alert',
            operation: 'alert',
            component,
            priority: 'high',
            details: {
                ...details,
                severity: 'error',
                errorCode: error.name,
                errorMessage: error.message,
            },
        };
    },
};
export default MonitoringEventAdapter;
//# sourceMappingURL=monitoring-event-adapter.js.map