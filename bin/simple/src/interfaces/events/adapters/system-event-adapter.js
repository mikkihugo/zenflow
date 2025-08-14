import { EventEmitter } from 'node:events';
import { getLogger } from '../../../config/logging-config.ts';
import { EventEmissionError, EventManagerTypes, EventTimeoutError, } from '../core/interfaces.ts';
import { EventPriorityMap } from '../types.ts';
export class SystemEventAdapter {
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
    coreSystem;
    applicationCoordinator;
    eventCorrelations = new Map();
    systemHealth = new Map();
    metrics = [];
    subscriptions = new Map();
    filters = new Map();
    transforms = new Map();
    eventQueue = [];
    processingEvents = false;
    eventHistory = [];
    constructor(config) {
        this.name = config?.name;
        this.type = config?.type;
        this.config = {
            coreSystem: {
                enabled: true,
                wrapLifecycleEvents: true,
                wrapHealthEvents: true,
                wrapConfigEvents: true,
                ...config?.coreSystem,
            },
            applicationCoordinator: {
                enabled: true,
                wrapComponentEvents: true,
                wrapStatusEvents: true,
                wrapWorkspaceEvents: true,
                ...config?.applicationCoordinator,
            },
            processManagement: {
                enabled: true,
                wrapServiceEvents: true,
                wrapDaemonEvents: true,
                wrapResourceEvents: true,
                ...config?.processManagement,
            },
            errorRecovery: {
                enabled: true,
                wrapRecoveryEvents: true,
                wrapStrategyEvents: true,
                correlateErrors: true,
                ...config?.errorRecovery,
            },
            performance: {
                enableEventCorrelation: true,
                maxConcurrentEvents: 100,
                eventTimeout: 30000,
                enablePerformanceTracking: true,
                ...config?.performance,
            },
            correlation: {
                enabled: true,
                strategy: 'component',
                correlationTTL: 300000,
                maxCorrelationDepth: 10,
                correlationPatterns: [
                    'system:startup->system:health',
                    'system:error->system:recovery',
                    'config:change->system:restart',
                ],
                ...config?.correlation,
            },
            healthMonitoring: {
                enabled: true,
                healthCheckInterval: 30000,
                componentHealthThresholds: {
                    'core-system': 0.95,
                    'application-coordinator': 0.9,
                    'workflow-engine': 0.85,
                    'memory-system': 0.9,
                    'interface-manager': 0.8,
                },
                autoRecoveryEnabled: true,
                ...config?.healthMonitoring,
            },
            ...config,
        };
        this.logger = getLogger(`SystemEventAdapter:${this.name}`);
        this.logger.info(`Creating system event adapter: ${this.name}`);
        this.eventEmitter.setMaxListeners(1000);
    }
    async start() {
        if (this.running) {
            this.logger.warn(`System event adapter ${this.name} is already running`);
            return;
        }
        this.logger.info(`Starting system event adapter: ${this.name}`);
        try {
            await this.initializeSystemIntegrations();
            this.startEventProcessing();
            if (this.config.healthMonitoring?.enabled) {
                this.startHealthMonitoring();
            }
            if (this.config.correlation?.enabled) {
                this.startCorrelationCleanup();
            }
            this.running = true;
            this.startTime = new Date();
            this.emitInternal('start');
            this.logger.info(`System event adapter started successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to start system event adapter ${this.name}:`, error);
            this.emitInternal('error', error);
            throw error;
        }
    }
    async stop() {
        if (!this.running) {
            this.logger.warn(`System event adapter ${this.name} is not running`);
            return;
        }
        this.logger.info(`Stopping system event adapter: ${this.name}`);
        try {
            this.processingEvents = false;
            await this.unwrapSystemComponents();
            this.eventQueue.length = 0;
            this.running = false;
            this.emitInternal('stop');
            this.logger.info(`System event adapter stopped successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to stop system event adapter ${this.name}:`, error);
            this.emitInternal('error', error);
            throw error;
        }
    }
    async restart() {
        this.logger.info(`Restarting system event adapter: ${this.name}`);
        await this.stop();
        await this.start();
    }
    isRunning() {
        return this.running;
    }
    async emit(event, options) {
        const startTime = Date.now();
        const eventId = event.id || this.generateEventId();
        try {
            if (!this.validateEvent(event)) {
                throw new EventEmissionError(this.name, eventId, new Error('Invalid event format'));
            }
            const timeout = options?.timeout || this.config.performance?.eventTimeout || 30000;
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new EventTimeoutError(this.name, timeout, eventId)), timeout);
            });
            const emissionPromise = this.processEventEmission(event, options);
            await Promise.race([emissionPromise, timeoutPromise]);
            const duration = Date.now() - startTime;
            this.recordEventMetrics({
                eventType: event.type,
                component: event.source,
                operation: 'emit',
                executionTime: duration,
                success: true,
                correlationId: event.correlationId || undefined,
                timestamp: new Date(),
            });
            this.eventCount++;
            this.successCount++;
            this.totalLatency += duration;
            this.eventEmitter.emit('emission', { event, success: true, duration });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.recordEventMetrics({
                eventType: event.type,
                component: event.source,
                operation: 'emit',
                executionTime: duration,
                success: false,
                correlationId: event.correlationId || undefined,
                errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
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
            this.logger.error(`Event emission failed for ${event.type}:`, error);
            throw error;
        }
    }
    async emitBatch(batch, options) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Emitting event batch: ${batch.id} (${batch.events.length} events)`);
            switch (this.config.processing?.strategy) {
                case 'immediate':
                    await this.processBatchImmediate(batch, options);
                    break;
                case 'queued':
                    await this.processBatchQueued(batch, options);
                    break;
                case 'batched':
                    await this.processBatchBatched(batch, options);
                    break;
                case 'throttled':
                    await this.processBatchThrottled(batch, options);
                    break;
                default:
                    await this.processBatchQueued(batch, options);
            }
            const duration = Date.now() - startTime;
            this.logger.debug(`Event batch processed successfully: ${batch.id} in ${duration}ms`);
        }
        catch (error) {
            this.logger.error(`Event batch processing failed for ${batch.id}:`, error);
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
        this.logger.debug(`Created subscription ${subscriptionId} for events: ${types.join(', ')}`);
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
        this.logger.debug(`Removed subscription: ${subscriptionId}`);
        return true;
    }
    unsubscribeAll(eventType) {
        let removedCount = 0;
        if (eventType) {
            for (const [id, subscription] of this.subscriptions.entries()) {
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
        this.logger.debug(`Removed ${removedCount} subscriptions${eventType ? ` for ${eventType}` : ''}`);
        return removedCount;
    }
    addFilter(filter) {
        const filterId = this.generateFilterId();
        this.filters.set(filterId, filter);
        this.logger.debug(`Added event filter: ${filterId}`);
        return filterId;
    }
    removeFilter(filterId) {
        const result = this.filters.delete(filterId);
        if (result) {
            this.logger.debug(`Removed event filter: ${filterId}`);
        }
        return result;
    }
    addTransform(transform) {
        const transformId = this.generateTransformId();
        this.transforms.set(transformId, transform);
        this.logger.debug(`Added event transform: ${transformId}`);
        return transformId;
    }
    removeTransform(transformId) {
        const result = this.transforms.delete(transformId);
        if (result) {
            this.logger.debug(`Removed event transform: ${transformId}`);
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
        const componentHealth = await this.checkSystemComponentHealth();
        let status = 'healthy';
        if (errorRate > 20 || !this.running) {
            status = 'unhealthy';
        }
        else if (errorRate > 10 ||
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
                correlations: this.eventCorrelations.size,
                wrappedComponents: this.wrappedComponents.size,
                componentHealth,
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
        this.logger.info(`Updating configuration for system event adapter: ${this.name}`);
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
        this.logger.info(`Destroying system event adapter: ${this.name}`);
        try {
            if (this.running) {
                await this.stop();
            }
            this.subscriptions.clear();
            this.filters.clear();
            this.transforms.clear();
            this.eventCorrelations.clear();
            this.systemHealth.clear();
            this.metrics.length = 0;
            this.eventHistory.length = 0;
            this.eventQueue.length = 0;
            this.wrappedComponents.clear();
            this.eventEmitter.removeAllListeners();
            this.logger.info(`System event adapter destroyed successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to destroy system event adapter ${this.name}:`, error);
            throw error;
        }
    }
    async emitSystemLifecycleEvent(event) {
        const systemEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: new Date(),
            priority: event.priority || EventPriorityMap[event.type] || 'medium',
            correlationId: event.correlationId || this.generateCorrelationId(),
        };
        if (this.config.correlation?.enabled) {
            this.startEventCorrelation(systemEvent);
        }
        await this.emit(systemEvent);
    }
    subscribeSystemLifecycleEvents(listener) {
        return this.subscribe([
            'system:startup',
            'system:shutdown',
            'system:restart',
            'system:error',
            'system:health',
        ], listener);
    }
    subscribeApplicationEvents(listener) {
        return this.subscribe(['system:startup', 'system:health'], listener);
    }
    subscribeErrorRecoveryEvents(listener) {
        return this.subscribe(['system:error'], listener);
    }
    async getSystemHealthStatus() {
        const healthStatus = {};
        for (const [component, health] of this.systemHealth.entries()) {
            healthStatus[component] = { ...health };
        }
        return healthStatus;
    }
    getCorrelatedEvents(correlationId) {
        return this.eventCorrelations.get(correlationId) || null;
    }
    getActiveCorrelations() {
        return Array.from(this.eventCorrelations.values()).filter((c) => c.status === 'active');
    }
    async performSystemHealthCheck() {
        const healthResults = {};
        for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
            try {
                const startTime = Date.now();
                let isHealthy = wrapped.isActive;
                let errorRate = 0;
                if (wrapped.component &&
                    typeof wrapped.component.getStatus === 'function') {
                    const status = await wrapped.component.getStatus();
                    isHealthy = status.status === 'ready' || status.status === 'healthy';
                    errorRate = status.errorRate || 0;
                }
                const responseTime = Date.now() - startTime;
                const threshold = this.config.healthMonitoring?.componentHealthThresholds?.[componentName] || 0.8;
                const healthScore = isHealthy ? 1 - errorRate : 0;
                const healthEntry = {
                    component: componentName,
                    status: healthScore >= threshold
                        ? 'healthy'
                        : healthScore >= threshold * 0.7
                            ? 'degraded'
                            : 'unhealthy',
                    lastCheck: new Date(),
                    consecutiveFailures: isHealthy
                        ? 0
                        : (this.systemHealth.get(componentName)?.consecutiveFailures || 0) +
                            1,
                    errorRate,
                    responseTime,
                    metadata: {
                        healthScore,
                        threshold,
                        isActive: wrapped.isActive,
                    },
                };
                this.systemHealth.set(componentName, healthEntry);
                healthResults[componentName] = healthEntry;
            }
            catch (error) {
                const healthEntry = {
                    component: componentName,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    consecutiveFailures: (this.systemHealth.get(componentName)?.consecutiveFailures || 0) +
                        1,
                    errorRate: 1.0,
                    responseTime: 0,
                    metadata: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                };
                this.systemHealth.set(componentName, healthEntry);
                healthResults[componentName] = healthEntry;
            }
        }
        return healthResults;
    }
    async initializeSystemIntegrations() {
        this.logger.debug('Initializing system component integrations');
        if (this.config.coreSystem?.enabled) {
            await this.wrapCoreSystem();
        }
        if (this.config.applicationCoordinator?.enabled) {
            await this.wrapApplicationCoordinator();
        }
        if (this.config.errorRecovery?.enabled) {
            await this.wrapErrorRecoverySystem();
        }
        this.logger.debug(`Wrapped ${this.wrappedComponents.size} system components`);
    }
    async wrapCoreSystem() {
        const wrapper = new EventEmitter();
        const wrappedComponent = {
            component: null,
            wrapper,
            originalMethods: new Map(),
            eventMappings: new Map([
                ['system-initialized', 'system:startup'],
                ['system-ready', 'system:health'],
                ['system-error', 'system:error'],
                ['system-shutdown', 'system:shutdown'],
            ]),
            isActive: true,
        };
        wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
            wrapper.on(originalEvent, (data) => {
                const systemEvent = {
                    id: this.generateEventId(),
                    timestamp: new Date(),
                    source: 'core-system',
                    type: uelEvent,
                    operation: this.extractOperationFromEvent(originalEvent),
                    status: this.extractStatusFromData(data),
                    priority: EventPriorityMap[uelEvent] || 'medium',
                    correlationId: this.generateCorrelationId(),
                    metadata: { originalEvent, data },
                };
                this.eventEmitter.emit(uelEvent, systemEvent);
            });
        });
        this.wrappedComponents.set('core-system', wrappedComponent);
        this.logger.debug('Wrapped CoreSystem events');
    }
    async wrapApplicationCoordinator() {
        const wrapper = new EventEmitter();
        const wrappedComponent = {
            component: null,
            wrapper,
            originalMethods: new Map(),
            eventMappings: new Map([
                ['component-initialized', 'system:startup'],
                ['component-status-change', 'system:health'],
                ['component-error', 'system:error'],
                ['workspace-loaded', 'system:health'],
            ]),
            isActive: true,
        };
        wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
            wrapper.on(originalEvent, (data) => {
                const systemEvent = {
                    id: this.generateEventId(),
                    timestamp: new Date(),
                    source: 'application-coordinator',
                    type: uelEvent,
                    operation: this.extractOperationFromEvent(originalEvent),
                    status: this.extractStatusFromData(data),
                    priority: EventPriorityMap[uelEvent] || 'medium',
                    correlationId: this.generateCorrelationId(),
                    metadata: { originalEvent, data },
                };
                this.eventEmitter.emit(uelEvent, systemEvent);
            });
        });
        this.wrappedComponents.set('application-coordinator', wrappedComponent);
        this.logger.debug('Wrapped ApplicationCoordinator events');
    }
    async wrapErrorRecoverySystem() {
        const wrapper = new EventEmitter();
        const wrappedComponent = {
            component: null,
            wrapper,
            originalMethods: new Map(),
            eventMappings: new Map([
                ['recovery:started', 'system:error'],
                ['recovery:completed', 'system:health'],
                ['recovery:failed', 'system:error'],
                ['strategy:registered', 'system:health'],
            ]),
            isActive: true,
        };
        wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
            wrapper.on(originalEvent, (data) => {
                const systemEvent = {
                    id: this.generateEventId(),
                    timestamp: new Date(),
                    source: 'error-recovery',
                    type: uelEvent,
                    operation: this.extractOperationFromEvent(originalEvent),
                    status: this.extractStatusFromData(data),
                    priority: 'high',
                    correlationId: this.generateCorrelationId(),
                    metadata: { originalEvent, data },
                };
                this.eventEmitter.emit(uelEvent, systemEvent);
                if (this.config.errorRecovery?.correlateErrors) {
                    this.correlateErrorRecoveryEvent(systemEvent, data);
                }
            });
        });
        this.wrappedComponents.set('error-recovery', wrappedComponent);
        this.logger.debug('Wrapped ErrorRecoverySystem events');
    }
    async unwrapSystemComponents() {
        for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
            try {
                wrapped.originalMethods.forEach((originalMethod, methodName) => {
                    if (wrapped.component?.[methodName]) {
                        wrapped.component[methodName] = originalMethod;
                    }
                });
                wrapped.wrapper.removeAllListeners();
                wrapped.isActive = false;
                this.logger.debug(`Unwrapped component: ${componentName}`);
            }
            catch (error) {
                this.logger.warn(`Failed to unwrap component ${componentName}:`, error);
            }
        }
        this.wrappedComponents.clear();
    }
    async processEventEmission(event, _options) {
        this.eventHistory.push(event);
        if (this.eventHistory.length > 10000) {
            this.eventHistory = this.eventHistory.slice(-5000);
        }
        if (this.config.correlation?.enabled && event.correlationId) {
            this.updateEventCorrelation(event);
        }
        for (const filter of this.filters.values()) {
            if (!this.applyFilter(event, filter)) {
                this.logger.debug(`Event ${event.id} filtered out`);
                return;
            }
        }
        let transformedEvent = event;
        for (const transform of this.transforms.values()) {
            transformedEvent = await this.applyTransform(transformedEvent, transform);
        }
        for (const subscription of this.subscriptions.values()) {
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
                this.logger.error(`Subscription listener error for ${subscription.id}:`, error);
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
                    await this.processEventEmission(event);
                }
                catch (error) {
                    this.logger.error('Event processing error:', error);
                }
            }
            setImmediate(processQueue);
        };
        processQueue();
    }
    startHealthMonitoring() {
        const interval = this.config.healthMonitoring?.healthCheckInterval || 30000;
        setInterval(async () => {
            try {
                await this.performSystemHealthCheck();
                for (const [component, health] of this.systemHealth.entries()) {
                    if (health.status !== 'healthy') {
                        await this.emitSystemLifecycleEvent({
                            source: component,
                            type: 'system:health',
                            operation: 'status',
                            status: health.status === 'unhealthy' ? 'error' : 'warning',
                            details: {
                                component,
                                healthScore: health.metadata?.['healthScore'],
                                errorRate: health.errorRate,
                                consecutiveFailures: health.consecutiveFailures,
                            },
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error('Health monitoring error:', error);
            }
        }, interval);
    }
    startCorrelationCleanup() {
        const cleanupInterval = 60000;
        const correlationTTL = this.config.correlation?.correlationTTL || 300000;
        setInterval(() => {
            const now = Date.now();
            const expiredCorrelations = [];
            for (const [correlationId, correlation,] of this.eventCorrelations.entries()) {
                if (now - correlation.lastUpdate.getTime() > correlationTTL) {
                    expiredCorrelations.push(correlationId);
                }
            }
            expiredCorrelations.forEach((id) => {
                const correlation = this.eventCorrelations.get(id);
                if (correlation) {
                    correlation.status = 'timeout';
                    this.eventCorrelations.delete(id);
                }
            });
            if (expiredCorrelations.length > 0) {
                this.logger.debug(`Cleaned up ${expiredCorrelations.length} expired correlations`);
            }
        }, cleanupInterval);
    }
    startEventCorrelation(event) {
        const correlationId = event.correlationId || this.generateCorrelationId();
        if (this.eventCorrelations.has(correlationId)) {
            this.updateEventCorrelation(event);
        }
        else {
            const correlation = {
                correlationId,
                events: [event],
                startTime: new Date(),
                lastUpdate: new Date(),
                component: event.source,
                operation: this.extractOperationFromEvent(event.type),
                status: 'active',
                metadata: {},
            };
            this.eventCorrelations.set(correlationId, correlation);
        }
    }
    updateEventCorrelation(event) {
        const correlationId = event.correlationId;
        if (!correlationId)
            return;
        const correlation = this.eventCorrelations.get(correlationId);
        if (correlation) {
            correlation.events.push(event);
            correlation.lastUpdate = new Date();
            if (this.isCorrelationComplete(correlation)) {
                correlation.status = 'completed';
            }
        }
    }
    correlateErrorRecoveryEvent(event, data) {
        const recoveryCorrelationId = this.generateCorrelationId();
        event.correlationId = recoveryCorrelationId;
        event.metadata = {
            ...event.metadata,
            recoveryData: data,
        };
        this.startEventCorrelation(event);
    }
    isCorrelationComplete(correlation) {
        const patterns = this.config.correlation?.correlationPatterns || [];
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
    async checkSystemComponentHealth() {
        const componentHealth = {};
        for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
            const existing = this.systemHealth.get(componentName);
            const healthEntry = existing || {
                component: componentName,
                status: wrapped.isActive ? 'healthy' : 'unhealthy',
                lastCheck: new Date(),
                consecutiveFailures: 0,
                errorRate: 0,
                responseTime: 0,
                metadata: {},
            };
            componentHealth[componentName] = healthEntry;
        }
        return componentHealth;
    }
    async processBatchImmediate(batch, options) {
        await Promise.all(batch.events.map((event) => this.emit(event, options)));
    }
    async processBatchQueued(batch, _options) {
        this.eventQueue.push(...batch.events);
    }
    async processBatchBatched(batch, options) {
        const batchSize = this.config.processing?.batchSize || 50;
        for (let i = 0; i < batch.events.length; i += batchSize) {
            const chunk = batch.events.slice(i, i + batchSize);
            await Promise.all(chunk.map((event) => this.emit(event, options)));
        }
    }
    async processBatchThrottled(batch, options) {
        const throttleMs = this.config.processing?.throttleMs || 100;
        for (const event of batch.events) {
            await this.emit(event, options);
            await new Promise((resolve) => setTimeout(resolve, throttleMs));
        }
    }
    validateEvent(event) {
        return !!(event.id && event.timestamp && event.source && event.type);
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
            throw new Error(`Event transformation validation failed for ${event.id}`);
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
            default:
                return event.timestamp.getTime();
        }
    }
    extractOperationFromEvent(eventType) {
        if (eventType.includes('start') || eventType.includes('init'))
            return 'start';
        if (eventType.includes('stop') || eventType.includes('shutdown'))
            return 'stop';
        if (eventType.includes('restart'))
            return 'restart';
        if (eventType.includes('health'))
            return 'status';
        return 'status';
    }
    extractStatusFromData(data) {
        if (!data)
            return 'success';
        const dataObj = data;
        if (dataObj?.error || dataObj?.status === 'error')
            return 'error';
        if (dataObj?.warning || dataObj?.status === 'warning')
            return 'warning';
        if (dataObj?.status === 'critical')
            return 'critical';
        return 'success';
    }
    recordEventMetrics(metrics) {
        if (!this.config.performance?.enablePerformanceTracking) {
            return;
        }
        this.metrics.push(metrics);
        const cutoff = new Date(Date.now() - 3600000);
        this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
    }
    estimateMemoryUsage() {
        let size = 0;
        size += this.subscriptions.size * 200;
        size += this.eventHistory.length * 500;
        for (const correlation of this.eventCorrelations.values()) {
            size += correlation.events.length * 300;
        }
        size += this.metrics.length * 150;
        return size;
    }
    generateEventId() {
        return `sys-evt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateSubscriptionId() {
        return `sys-sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateFilterId() {
        return `sys-flt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateTransformId() {
        return `sys-txf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateCorrelationId() {
        return `sys-cor-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    emitInternal(event, data) {
        this.eventEmitter.emit(event, data);
    }
}
export function createSystemEventAdapter(config) {
    return new SystemEventAdapter(config);
}
export function createDefaultSystemEventAdapterConfig(name, overrides) {
    return {
        name,
        type: EventManagerTypes.SYSTEM,
        processing: {
            strategy: 'immediate',
            queueSize: 1000,
        },
        retry: {
            attempts: 3,
            delay: 1000,
            backoff: 'exponential',
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
            metricsInterval: 10000,
            trackLatency: true,
            trackThroughput: true,
            trackErrors: true,
            enableProfiling: false,
        },
        coreSystem: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapHealthEvents: true,
            wrapConfigEvents: true,
        },
        applicationCoordinator: {
            enabled: true,
            wrapComponentEvents: true,
            wrapStatusEvents: true,
            wrapWorkspaceEvents: true,
        },
        processManagement: {
            enabled: true,
            wrapServiceEvents: true,
            wrapDaemonEvents: true,
            wrapResourceEvents: true,
        },
        errorRecovery: {
            enabled: true,
            wrapRecoveryEvents: true,
            wrapStrategyEvents: true,
            correlateErrors: true,
        },
        performance: {
            enableEventCorrelation: true,
            maxConcurrentEvents: 100,
            eventTimeout: 30000,
            enablePerformanceTracking: true,
        },
        correlation: {
            enabled: true,
            strategy: 'component',
            correlationTTL: 300000,
            maxCorrelationDepth: 10,
            correlationPatterns: [
                'system:startup->system:health',
                'system:error->system:recovery',
                'config:change->system:restart',
            ],
        },
        healthMonitoring: {
            enabled: true,
            healthCheckInterval: 30000,
            componentHealthThresholds: {
                'core-system': 0.95,
                'application-coordinator': 0.9,
                'workflow-engine': 0.85,
                'memory-system': 0.9,
                'interface-manager': 0.8,
            },
            autoRecoveryEnabled: true,
        },
        ...overrides,
    };
}
export const SystemEventHelpers = {
    createStartupEvent(component, details) {
        return {
            source: component,
            type: 'system:startup',
            operation: 'start',
            status: 'success',
            priority: 'high',
            details,
        };
    },
    createShutdownEvent(component, details) {
        return {
            source: component,
            type: 'system:shutdown',
            operation: 'stop',
            status: 'success',
            priority: 'critical',
            details,
        };
    },
    createHealthEvent(component, healthScore, details) {
        return {
            source: component,
            type: 'system:health',
            operation: 'status',
            status: healthScore >= 0.8
                ? 'success'
                : healthScore >= 0.5
                    ? 'warning'
                    : 'error',
            priority: 'medium',
            details: {
                ...details,
                healthScore,
            },
        };
    },
    createErrorEvent(component, error, details) {
        return {
            source: component,
            type: 'system:error',
            operation: 'status',
            status: 'error',
            priority: 'high',
            details: {
                ...details,
                errorCode: error.name,
                errorMessage: error.message,
            },
        };
    },
};
export default SystemEventAdapter;
//# sourceMappingURL=system-event-adapter.js.map