import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-events-adapters-communication-event-adapter');
import { EventManagerTypes } from '../core/interfaces.ts';
import { EventPriorityMap } from '../types.ts';
import { EventEmitter } from 'node:events';
export class CommunicationEventAdapter {
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
    websocketClients = new Map();
    mcpServers = new Map();
    mcpClients = new Map();
    communicationCorrelations = new Map();
    communicationHealth = new Map();
    metrics = [];
    subscriptions = new Map();
    filters = new Map();
    transforms = new Map();
    eventQueue = [];
    processingEvents = false;
    eventHistory = [];
    connectionMetrics = new Map();
    messageMetrics = new Map();
    protocolMetrics = new Map();
    communicationPatterns = new Map();
    constructor(config) {
        this.name = config?.name;
        this.type = EventManagerTypes.COMMUNICATION;
        this.config = {
            websocketCommunication: {
                enabled: true,
                wrapConnectionEvents: true,
                wrapMessageEvents: true,
                wrapHealthEvents: true,
                wrapReconnectionEvents: true,
                clients: ['default'],
                ...config?.websocketCommunication,
            },
            mcpProtocol: {
                enabled: true,
                wrapServerEvents: true,
                wrapClientEvents: true,
                wrapToolEvents: true,
                wrapProtocolEvents: true,
                servers: ['http-mcp-server'],
                clients: ['default-mcp-client'],
                ...config?.mcpProtocol,
            },
            protocolCommunication: {
                enabled: true,
                wrapRoutingEvents: true,
                wrapOptimizationEvents: true,
                wrapFailoverEvents: true,
                wrapSwitchingEvents: true,
                protocols: ['http', 'https', 'ws', 'wss', 'stdio'],
                ...config?.protocolCommunication,
            },
            httpCommunication: {
                enabled: true,
                wrapRequestEvents: true,
                wrapResponseEvents: true,
                wrapTimeoutEvents: true,
                wrapRetryEvents: true,
                ...config?.httpCommunication,
            },
            performance: {
                enableConnectionCorrelation: true,
                enableMessageTracking: true,
                enableProtocolMetrics: true,
                maxConcurrentConnections: 1000,
                connectionTimeout: 30000,
                enablePerformanceTracking: true,
                ...config?.performance,
            },
            communication: {
                enabled: true,
                strategy: 'websocket',
                correlationTTL: 300000,
                maxCorrelationDepth: 20,
                correlationPatterns: [
                    'communication:websocket->communication:mcp',
                    'communication:http->communication:mcp',
                    'communication:protocol->communication:websocket',
                    'communication:mcp->communication:http',
                ],
                trackMessageFlow: true,
                trackConnectionHealth: true,
                ...config?.communication,
            },
            connectionHealthMonitoring: {
                enabled: true,
                healthCheckInterval: 30000,
                connectionHealthThresholds: {
                    'websocket-client': 0.95,
                    'mcp-server': 0.9,
                    'mcp-client': 0.85,
                    'http-client': 0.9,
                    'protocol-manager': 0.8,
                },
                protocolHealthThresholds: {
                    'communication-latency': 100,
                    throughput: 1000,
                    reliability: 0.95,
                    'connection-availability': 0.9,
                },
                autoRecoveryEnabled: true,
                ...config?.connectionHealthMonitoring,
            },
            communicationOptimization: {
                enabled: true,
                optimizationInterval: 60000,
                performanceThresholds: {
                    latency: 50,
                    throughput: 500,
                    reliability: 0.98,
                },
                connectionPooling: true,
                messageCompression: true,
                ...config?.communicationOptimization,
            },
            ...config,
        };
        this.logger = createLogger(`CommunicationEventAdapter:${this.name}`);
        this.logger.info(`Creating communication event adapter: ${this.name}`);
        this.eventEmitter.setMaxListeners(2000);
    }
    async start() {
        if (this.running) {
            this.logger.warn(`Communication event adapter ${this.name} is already running`);
            return;
        }
        this.logger.info(`Starting communication event adapter: ${this.name}`);
        try {
            await this.initializeCommunicationIntegrations();
            this.startEventProcessing();
            if (this.config.connectionHealthMonitoring?.enabled) {
                this.startCommunicationHealthMonitoring();
            }
            if (this.config.communication?.enabled) {
                this.startCommunicationCorrelationCleanup();
            }
            if (this.config.communicationOptimization?.enabled) {
                this.startCommunicationOptimization();
            }
            this.running = true;
            this.startTime = new Date();
            this.emitInternal('start');
            this.logger.info(`Communication event adapter started successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to start communication event adapter ${this.name}:`, error);
            this.emitInternal('error', error);
            throw error;
        }
    }
    async stop() {
        if (!this.running) {
            this.logger.warn(`Communication event adapter ${this.name} is not running`);
            return;
        }
        this.logger.info(`Stopping communication event adapter: ${this.name}`);
        try {
            this.processingEvents = false;
            await this.unwrapCommunicationComponents();
            this.eventQueue.length = 0;
            this.running = false;
            this.emitInternal('stop');
            this.logger.info(`Communication event adapter stopped successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to stop communication event adapter ${this.name}:`, error);
            this.emitInternal('error', error);
            throw error;
        }
    }
    async restart() {
        this.logger.info(`Restarting communication event adapter: ${this.name}`);
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
                throw new Error('Invalid communication event format');
            }
            const timeout = options?.timeout || this.config.performance?.connectionTimeout || 30000;
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Event timeout after ${timeout}ms`)), timeout);
            });
            const emissionPromise = this.processCommunicationEventEmission(event, options);
            await Promise.race([emissionPromise, timeoutPromise]);
            const duration = Date.now() - startTime;
            this.recordCommunicationEventMetrics({
                eventType: event.type,
                component: event.source,
                operation: event.operation,
                executionTime: duration,
                success: true,
                correlationId: event.correlationId,
                connectionId: this.extractConnectionId(event),
                messageId: this.extractMessageId(event),
                protocolType: this.extractProtocolType(event),
                communicationLatency: duration,
                timestamp: new Date(),
            });
            this.eventCount++;
            this.successCount++;
            this.totalLatency += duration;
            this.eventEmitter.emit('emission', { event, success: true, duration });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.recordCommunicationEventMetrics({
                eventType: event.type,
                component: event.source,
                operation: event.operation,
                executionTime: duration,
                success: false,
                correlationId: event.correlationId,
                connectionId: this.extractConnectionId(event),
                messageId: this.extractMessageId(event),
                protocolType: this.extractProtocolType(event),
                communicationLatency: duration,
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
            this.logger.error(`Communication event emission failed for ${event.type}:`, error);
            throw error;
        }
    }
    async emitBatch(batch, options) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Emitting communication event batch: ${batch.id} (${batch.events.length} events)`);
            switch (this.config.processing?.strategy) {
                case 'immediate':
                    await this.processCommunicationBatchImmediate(batch, options);
                    break;
                case 'queued':
                    await this.processCommunicationBatchQueued(batch, options);
                    break;
                case 'batched':
                    await this.processCommunicationBatchBatched(batch, options);
                    break;
                case 'throttled':
                    await this.processCommunicationBatchThrottled(batch, options);
                    break;
                default:
                    await this.processCommunicationBatchQueued(batch, options);
            }
            const duration = Date.now() - startTime;
            this.logger.debug(`Communication event batch processed successfully: ${batch.id} in ${duration}ms`);
        }
        catch (error) {
            this.logger.error(`Communication event batch processing failed for ${batch.id}:`, error);
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
        this.logger.debug(`Created communication subscription ${subscriptionId} for events: ${types.join(', ')}`);
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
        this.logger.debug(`Removed communication subscription: ${subscriptionId}`);
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
        this.logger.debug(`Removed ${removedCount} communication subscriptions${eventType ? ` for ${eventType}` : ''}`);
        return removedCount;
    }
    addFilter(filter) {
        const filterId = this.generateFilterId();
        this.filters.set(filterId, filter);
        this.logger.debug(`Added communication event filter: ${filterId}`);
        return filterId;
    }
    removeFilter(filterId) {
        const result = this.filters.delete(filterId);
        if (result) {
            this.logger.debug(`Removed communication event filter: ${filterId}`);
        }
        return result;
    }
    addTransform(transform) {
        const transformId = this.generateTransformId();
        this.transforms.set(transformId, transform);
        this.logger.debug(`Added communication event transform: ${transformId}`);
        return transformId;
    }
    removeTransform(transformId) {
        const result = this.transforms.delete(transformId);
        if (result) {
            this.logger.debug(`Removed communication event transform: ${transformId}`);
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
        const componentHealth = await this.checkCommunicationComponentHealth();
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
                correlations: this.communicationCorrelations.size,
                wrappedComponents: this.wrappedComponents.size,
                websocketClients: this.websocketClients.size,
                mcpServers: this.mcpServers.size,
                mcpClients: this.mcpClients.size,
                componentHealth,
                avgCommunicationLatency: this.eventCount > 0 ? this.totalLatency / this.eventCount : 0,
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
        this.logger.info(`Updating configuration for communication event adapter: ${this.name}`);
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
        this.logger.info(`Destroying communication event adapter: ${this.name}`);
        try {
            if (this.running) {
                await this.stop();
            }
            this.subscriptions.clear();
            this.filters.clear();
            this.transforms.clear();
            this.communicationCorrelations.clear();
            this.communicationHealth.clear();
            this.metrics.length = 0;
            this.eventHistory.length = 0;
            this.eventQueue.length = 0;
            this.wrappedComponents.clear();
            this.websocketClients.clear();
            this.mcpServers.clear();
            this.mcpClients.clear();
            this.connectionMetrics.clear();
            this.messageMetrics.clear();
            this.protocolMetrics.clear();
            this.communicationPatterns.clear();
            this.eventEmitter.removeAllListeners();
            this.logger.info(`Communication event adapter destroyed successfully: ${this.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to destroy communication event adapter ${this.name}:`, error);
            throw error;
        }
    }
    async emitWebSocketCommunicationEvent(event) {
        const communicationEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: new Date(),
            priority: event.priority || EventPriorityMap[event.type] || 'medium',
            correlationId: event.correlationId || this.generateCorrelationId(),
        };
        if (this.config.communication?.enabled) {
            this.startCommunicationEventCorrelation(communicationEvent);
        }
        await this.emit(communicationEvent);
    }
    async emitMCPProtocolEvent(event) {
        const communicationEvent = {
            ...event,
            id: this.generateEventId(),
            timestamp: new Date(),
            priority: event.priority || EventPriorityMap[event.type] || 'medium',
            correlationId: event.correlationId || this.generateCorrelationId(),
        };
        if (this.config.communication?.enabled) {
            this.startCommunicationEventCorrelation(communicationEvent);
        }
        await this.emit(communicationEvent);
    }
    subscribeWebSocketCommunicationEvents(listener) {
        return this.subscribe(['communication:websocket'], listener);
    }
    subscribeMCPProtocolEvents(listener) {
        return this.subscribe(['communication:mcp'], listener);
    }
    subscribeHTTPCommunicationEvents(listener) {
        return this.subscribe(['communication:http'], listener);
    }
    subscribeProtocolCommunicationEvents(listener) {
        return this.subscribe(['communication:protocol'], listener);
    }
    async getCommunicationHealthStatus() {
        const healthStatus = {};
        for (const [component, health] of this.communicationHealth.entries()) {
            healthStatus[component] = { ...health };
        }
        return healthStatus;
    }
    getCommunicationCorrelatedEvents(correlationId) {
        return this.communicationCorrelations.get(correlationId) || null;
    }
    getActiveCommunicationCorrelations() {
        return Array.from(this.communicationCorrelations.values()).filter((c) => c.status === 'active');
    }
    getConnectionMetrics(connectionId) {
        if (connectionId) {
            return this.connectionMetrics.get(connectionId) || {};
        }
        return Object.fromEntries(this.connectionMetrics.entries());
    }
    getMessageMetrics(messageId) {
        if (messageId) {
            return this.messageMetrics.get(messageId) || {};
        }
        return Object.fromEntries(this.messageMetrics.entries());
    }
    getProtocolMetrics(protocolType) {
        if (protocolType) {
            return this.protocolMetrics.get(protocolType) || {};
        }
        return Object.fromEntries(this.protocolMetrics.entries());
    }
    async performCommunicationHealthCheck() {
        const healthResults = {};
        for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
            try {
                const startTime = Date.now();
                const isHealthy = wrapped.isActive;
                let communicationLatency = 0;
                let throughput = 0;
                let reliability = 1.0;
                if (wrapped.component &&
                    typeof wrapped.component.healthCheck === 'function') {
                    const health = await wrapped.component.healthCheck();
                    communicationLatency = health.responseTime || 0;
                    reliability = 1 - (health.errorRate || 0);
                }
                else if (wrapped.component &&
                    typeof wrapped.component.getMetrics === 'function') {
                    const metrics = await wrapped.component.getMetrics();
                    communicationLatency = metrics.averageLatency || 0;
                    throughput = metrics.throughput || 0;
                    reliability =
                        1 - metrics.errorCount / Math.max(metrics.requestCount, 1);
                }
                const responseTime = Date.now() - startTime;
                const threshold = this.config.connectionHealthMonitoring?.connectionHealthThresholds?.[componentName] || 0.8;
                const healthScore = reliability *
                    (communicationLatency < 100 ? 1 : 0.5) *
                    (throughput > 10 ? 1 : 0.5);
                const healthEntry = {
                    component: componentName,
                    componentType: wrapped.componentType,
                    status: healthScore >= threshold
                        ? 'healthy'
                        : healthScore >= threshold * 0.7
                            ? 'degraded'
                            : 'unhealthy',
                    lastCheck: new Date(),
                    consecutiveFailures: isHealthy
                        ? 0
                        : (this.communicationHealth.get(componentName)
                            ?.consecutiveFailures || 0) + 1,
                    communicationLatency,
                    throughput,
                    reliability,
                    resourceUsage: {
                        cpu: 0,
                        memory: 0,
                        network: 0,
                    },
                    metadata: {
                        healthScore,
                        threshold,
                        isActive: wrapped.isActive,
                        responseTime,
                    },
                };
                if (wrapped.componentType === 'websocket') {
                    healthEntry.connectionCount =
                        this.getActiveConnectionCount(componentName);
                }
                else if (wrapped.componentType === 'mcp-server') {
                    healthEntry.activeMessageCount =
                        this.getActiveMessageCount(componentName);
                }
                this.communicationHealth.set(componentName, healthEntry);
                healthResults[componentName] = healthEntry;
            }
            catch (error) {
                const healthEntry = {
                    component: componentName,
                    componentType: wrapped.componentType,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    consecutiveFailures: (this.communicationHealth.get(componentName)?.consecutiveFailures ||
                        0) + 1,
                    communicationLatency: 0,
                    throughput: 0,
                    reliability: 0,
                    resourceUsage: { cpu: 0, memory: 0, network: 0 },
                    metadata: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                };
                this.communicationHealth.set(componentName, healthEntry);
                healthResults[componentName] = healthEntry;
            }
        }
        return healthResults;
    }
    async initializeCommunicationIntegrations() {
        this.logger.debug('Initializing communication component integrations');
        if (this.config.websocketCommunication?.enabled) {
            await this.wrapWebSocketClients();
        }
        if (this.config.mcpProtocol?.enabled) {
            await this.wrapMCPServers();
            await this.wrapMCPClients();
        }
        if (this.config.httpCommunication?.enabled) {
            await this.wrapHTTPCommunication();
        }
        if (this.config.protocolCommunication?.enabled) {
            await this.wrapProtocolCommunication();
        }
        this.logger.debug(`Wrapped ${this.wrappedComponents.size} communication components`);
    }
    async wrapWebSocketClients() {
        const clients = this.config.websocketCommunication?.clients || ['default'];
        for (const clientName of clients) {
            const wrapper = new EventEmitter();
            const wrappedComponent = {
                component: null,
                componentType: 'websocket',
                wrapper,
                originalMethods: new Map(),
                eventMappings: new Map([
                    ['connect', 'communication:websocket'],
                    ['disconnect', 'communication:websocket'],
                    ['message', 'communication:websocket'],
                    ['error', 'communication:websocket'],
                    ['reconnecting', 'communication:websocket'],
                    ['reconnected', 'communication:websocket'],
                    ['heartbeat', 'communication:websocket'],
                ]),
                isActive: true,
                healthMetrics: {
                    lastSeen: new Date(),
                    communicationCount: 0,
                    errorCount: 0,
                    avgLatency: 0,
                },
            };
            wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
                wrapper.on(originalEvent, (data) => {
                    const communicationEvent = {
                        id: this.generateEventId(),
                        timestamp: new Date(),
                        source: `websocket-client-${clientName}`,
                        type: uelEvent,
                        operation: this.extractCommunicationOperation(originalEvent),
                        protocol: this.extractProtocol(originalEvent, data),
                        endpoint: data?.endpoint || data?.url,
                        priority: EventPriorityMap[uelEvent] || 'medium',
                        correlationId: this.generateCorrelationId(),
                        details: {
                            ...data,
                            connectionId: data?.connectionId,
                            messageType: data?.messageType,
                            responseTime: data?.duration || data?.responseTime,
                            dataSize: data?.dataSize,
                        },
                        metadata: { originalEvent, data, clientName },
                    };
                    this.eventEmitter.emit(uelEvent, communicationEvent);
                    this.updateComponentHealthMetrics(clientName, !originalEvent.includes('error'));
                });
            });
            this.wrappedComponents.set(`websocket-client-${clientName}`, wrappedComponent);
            this.logger.debug(`Wrapped WebSocket client events: ${clientName}`);
        }
    }
    async wrapMCPServers() {
        const servers = this.config.mcpProtocol?.servers || ['http-mcp-server'];
        for (const serverName of servers) {
            const wrapper = new EventEmitter();
            const wrappedComponent = {
                component: null,
                componentType: 'mcp-server',
                wrapper,
                originalMethods: new Map(),
                eventMappings: new Map([
                    ['server:started', 'communication:mcp'],
                    ['server:stopped', 'communication:mcp'],
                    ['tool:called', 'communication:mcp'],
                    ['tool:completed', 'communication:mcp'],
                    ['tool:error', 'communication:mcp'],
                    ['client:connected', 'communication:mcp'],
                    ['client:disconnected', 'communication:mcp'],
                    ['protocol:error', 'communication:mcp'],
                ]),
                isActive: true,
                healthMetrics: {
                    lastSeen: new Date(),
                    communicationCount: 0,
                    errorCount: 0,
                    avgLatency: 0,
                },
            };
            wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
                wrapper.on(originalEvent, (data) => {
                    const communicationEvent = {
                        id: this.generateEventId(),
                        timestamp: new Date(),
                        source: `mcp-server-${serverName}`,
                        type: uelEvent,
                        operation: this.extractCommunicationOperation(originalEvent),
                        protocol: 'http',
                        endpoint: data?.endpoint,
                        priority: this.determineCommunicationEventPriority(originalEvent),
                        correlationId: this.generateCorrelationId(),
                        details: {
                            ...data,
                            toolName: data?.toolName,
                            requestId: data?.requestId,
                            statusCode: data?.statusCode,
                            responseTime: data?.responseTime,
                        },
                        metadata: { originalEvent, data, serverName },
                    };
                    this.eventEmitter.emit(uelEvent, communicationEvent);
                    this.updateComponentHealthMetrics(`mcp-server-${serverName}`, !originalEvent.includes('error'));
                });
            });
            this.wrappedComponents.set(`mcp-server-${serverName}`, wrappedComponent);
            this.logger.debug(`Wrapped MCP server events: ${serverName}`);
        }
    }
    async wrapMCPClients() {
        const clients = this.config.mcpProtocol?.clients || ['default-mcp-client'];
        for (const clientName of clients) {
            const wrapper = new EventEmitter();
            const wrappedComponent = {
                component: null,
                componentType: 'mcp-client',
                wrapper,
                originalMethods: new Map(),
                eventMappings: new Map([
                    ['client:connected', 'communication:mcp'],
                    ['client:disconnected', 'communication:mcp'],
                    ['tool:request', 'communication:mcp'],
                    ['tool:response', 'communication:mcp'],
                    ['tool:timeout', 'communication:mcp'],
                    ['protocol:error', 'communication:mcp'],
                ]),
                isActive: true,
                healthMetrics: {
                    lastSeen: new Date(),
                    communicationCount: 0,
                    errorCount: 0,
                    avgLatency: 0,
                },
            };
            wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
                wrapper.on(originalEvent, (data) => {
                    const communicationEvent = {
                        id: this.generateEventId(),
                        timestamp: new Date(),
                        source: `mcp-client-${clientName}`,
                        type: uelEvent,
                        operation: this.extractCommunicationOperation(originalEvent),
                        protocol: data?.protocol || 'stdio',
                        endpoint: data?.endpoint,
                        priority: this.determineCommunicationEventPriority(originalEvent),
                        correlationId: this.generateCorrelationId(),
                        details: {
                            ...data,
                            toolName: data?.toolName,
                            requestId: data?.requestId,
                            responseTime: data?.responseTime,
                        },
                        metadata: { originalEvent, data, clientName },
                    };
                    this.eventEmitter.emit(uelEvent, communicationEvent);
                    this.updateComponentHealthMetrics(`mcp-client-${clientName}`, !originalEvent.includes('error'));
                });
            });
            this.wrappedComponents.set(`mcp-client-${clientName}`, wrappedComponent);
            this.logger.debug(`Wrapped MCP client events: ${clientName}`);
        }
    }
    async wrapHTTPCommunication() {
        const wrapper = new EventEmitter();
        const wrappedComponent = {
            component: null,
            componentType: 'http',
            wrapper,
            originalMethods: new Map(),
            eventMappings: new Map([
                ['request', 'communication:http'],
                ['response', 'communication:http'],
                ['timeout', 'communication:http'],
                ['error', 'communication:http'],
                ['retry', 'communication:http'],
            ]),
            isActive: true,
            healthMetrics: {
                lastSeen: new Date(),
                communicationCount: 0,
                errorCount: 0,
                avgLatency: 0,
            },
        };
        wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
            wrapper.on(originalEvent, (data) => {
                const communicationEvent = {
                    id: this.generateEventId(),
                    timestamp: new Date(),
                    source: 'http-communication',
                    type: uelEvent,
                    operation: this.extractCommunicationOperation(originalEvent),
                    protocol: data?.protocol || 'http',
                    endpoint: data?.url || data?.endpoint,
                    priority: this.determineCommunicationEventPriority(originalEvent),
                    correlationId: this.generateCorrelationId(),
                    details: {
                        ...data,
                        statusCode: data?.statusCode,
                        responseTime: data?.responseTime,
                        retryAttempt: data?.retryAttempt,
                    },
                    metadata: { originalEvent, data },
                };
                this.eventEmitter.emit(uelEvent, communicationEvent);
                this.updateComponentHealthMetrics('http-communication', !originalEvent.includes('error'));
            });
        });
        this.wrappedComponents.set('http-communication', wrappedComponent);
        this.logger.debug('Wrapped HTTP communication events');
    }
    async wrapProtocolCommunication() {
        const protocols = this.config.protocolCommunication?.protocols || [
            'http',
            'https',
            'ws',
            'wss',
            'stdio',
        ];
        for (const protocolType of protocols) {
            const wrapper = new EventEmitter();
            const wrappedComponent = {
                component: null,
                componentType: 'protocol',
                wrapper,
                originalMethods: new Map(),
                eventMappings: new Map([
                    ['protocol:initialized', 'communication:protocol'],
                    ['protocol:switched', 'communication:protocol'],
                    ['protocol:optimized', 'communication:protocol'],
                    ['protocol:failover', 'communication:protocol'],
                    ['routing:message', 'communication:protocol'],
                    ['routing:error', 'communication:protocol'],
                ]),
                isActive: true,
                healthMetrics: {
                    lastSeen: new Date(),
                    communicationCount: 0,
                    errorCount: 0,
                    avgLatency: 0,
                },
            };
            wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
                wrapper.on(originalEvent, (data) => {
                    const communicationEvent = {
                        id: this.generateEventId(),
                        timestamp: new Date(),
                        source: `${protocolType}-protocol`,
                        type: uelEvent,
                        operation: this.extractCommunicationOperation(originalEvent),
                        protocol: protocolType,
                        endpoint: data?.endpoint,
                        priority: this.determineCommunicationEventPriority(originalEvent),
                        correlationId: this.generateCorrelationId(),
                        details: {
                            ...data,
                            protocolType,
                            routingInfo: data?.routingInfo,
                        },
                        metadata: { originalEvent, data, protocolType },
                    };
                    this.eventEmitter.emit(uelEvent, communicationEvent);
                    this.updateComponentHealthMetrics(`${protocolType}-protocol`, !originalEvent.includes('error'));
                });
            });
            this.wrappedComponents.set(`${protocolType}-protocol`, wrappedComponent);
            this.logger.debug(`Wrapped ${protocolType} protocol events`);
        }
    }
    async unwrapCommunicationComponents() {
        for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
            try {
                wrapped.originalMethods.forEach((originalMethod, methodName) => {
                    if (wrapped.component?.[methodName]) {
                        wrapped.component[methodName] = originalMethod;
                    }
                });
                wrapped.wrapper.removeAllListeners();
                wrapped.isActive = false;
                this.logger.debug(`Unwrapped communication component: ${componentName}`);
            }
            catch (error) {
                this.logger.warn(`Failed to unwrap communication component ${componentName}:`, error);
            }
        }
        this.wrappedComponents.clear();
    }
    async processCommunicationEventEmission(event, _options) {
        this.eventHistory.push(event);
        if (this.eventHistory.length > 15000) {
            this.eventHistory = this.eventHistory.slice(-7500);
        }
        if (this.config.communication?.enabled && event.correlationId) {
            this.updateCommunicationEventCorrelation(event);
        }
        this.updateCommunicationMetrics(event);
        for (const filter of this.filters.values()) {
            if (!this.applyFilter(event, filter)) {
                this.logger.debug(`Communication event ${event.id} filtered out`);
                return;
            }
        }
        let transformedEvent = event;
        for (const transform of this.transforms.values()) {
            transformedEvent = (await this.applyTransform(transformedEvent, transform));
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
                    subscriptionEvent = (await this.applyTransform(transformedEvent, subscription.transform));
                }
                await subscription.listener(subscriptionEvent);
            }
            catch (error) {
                this.logger.error(`Communication subscription listener error for ${subscription.id}:`, error);
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
                    await this.processCommunicationEventEmission(event);
                }
                catch (error) {
                    this.logger.error('Communication event processing error:', error);
                }
            }
            setImmediate(processQueue);
        };
        processQueue();
    }
    startCommunicationHealthMonitoring() {
        const interval = this.config.connectionHealthMonitoring?.healthCheckInterval || 30000;
        setInterval(async () => {
            try {
                await this.performCommunicationHealthCheck();
                for (const [component, health] of this.communicationHealth.entries()) {
                    if (health.status !== 'healthy') {
                        await this.emitWebSocketCommunicationEvent({
                            source: component,
                            type: 'communication:websocket',
                            operation: 'error',
                            protocol: 'ws',
                            endpoint: component,
                            details: {
                                requestId: `health-${Date.now()}`,
                                responseTime: health.communicationLatency,
                                errorCode: 'HEALTH_DEGRADED',
                            },
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error('Communication health monitoring error:', error);
            }
        }, interval);
    }
    startCommunicationCorrelationCleanup() {
        const cleanupInterval = 60000;
        const correlationTTL = this.config.communication?.correlationTTL || 300000;
        setInterval(() => {
            const now = Date.now();
            const expiredCorrelations = [];
            for (const [correlationId, correlation,] of this.communicationCorrelations.entries()) {
                if (now - correlation.lastUpdate.getTime() > correlationTTL) {
                    expiredCorrelations.push(correlationId);
                }
            }
            expiredCorrelations.forEach((id) => {
                const correlation = this.communicationCorrelations.get(id);
                if (correlation) {
                    correlation.status = 'timeout';
                    this.communicationCorrelations.delete(id);
                }
            });
            if (expiredCorrelations.length > 0) {
                this.logger.debug(`Cleaned up ${expiredCorrelations.length} expired communication correlations`);
            }
        }, cleanupInterval);
    }
    startCommunicationOptimization() {
        const interval = this.config.communicationOptimization?.optimizationInterval || 60000;
        setInterval(async () => {
            if (!this.config.communicationOptimization?.enabled)
                return;
            try {
                const communicationHealth = await this.performCommunicationHealthCheck();
                for (const [componentName, health] of Object.entries(communicationHealth)) {
                    const thresholds = this.config.communicationOptimization.performanceThresholds;
                    if (health.communicationLatency > thresholds.latency ||
                        health.throughput < thresholds.throughput ||
                        health.reliability < thresholds.reliability) {
                        this.logger.info(`Triggering optimization for ${componentName}`, {
                            latency: health.communicationLatency,
                            throughput: health.throughput,
                            reliability: health.reliability,
                        });
                        await this.emitWebSocketCommunicationEvent({
                            source: 'communication-optimizer',
                            type: 'communication:protocol',
                            operation: 'send',
                            protocol: 'custom',
                            endpoint: componentName,
                            details: {
                                requestId: `optimization-${Date.now()}`,
                                responseTime: health.communicationLatency,
                                statusCode: health.throughput > thresholds.throughput ? 200 : 500,
                            },
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error('Communication optimization error:', error);
            }
        }, interval);
    }
    startCommunicationEventCorrelation(event) {
        const correlationId = event.correlationId || this.generateCorrelationId();
        if (this.communicationCorrelations.has(correlationId)) {
            this.updateCommunicationEventCorrelation(event);
        }
        else {
            const correlation = {
                correlationId,
                events: [event],
                startTime: new Date(),
                lastUpdate: new Date(),
                connectionId: this.extractConnectionId(event),
                protocolType: this.extractProtocolType(event),
                messageIds: this.extractMessageIds(event),
                operation: event.operation,
                status: 'active',
                performance: {
                    totalLatency: 0,
                    communicationEfficiency: 1.0,
                    resourceUtilization: 0,
                },
                metadata: {},
            };
            this.communicationCorrelations.set(correlationId, correlation);
        }
    }
    updateCommunicationEventCorrelation(event) {
        const correlationId = event.correlationId;
        if (!correlationId)
            return;
        const correlation = this.communicationCorrelations.get(correlationId);
        if (correlation) {
            correlation.events.push(event);
            correlation.lastUpdate = new Date();
            const messageId = this.extractMessageId(event);
            const connectionId = this.extractConnectionId(event);
            if (messageId && !correlation.messageIds.includes(messageId)) {
                correlation.messageIds.push(messageId);
            }
            if (connectionId && !correlation.connectionId) {
                correlation.connectionId = connectionId;
            }
            const totalTime = correlation.lastUpdate.getTime() - correlation.startTime.getTime();
            correlation.performance.totalLatency = totalTime;
            correlation.performance.communicationEfficiency =
                this.calculateCommunicationEfficiency(correlation);
            if (this.isCommunicationCorrelationComplete(correlation)) {
                correlation.status = 'completed';
            }
        }
    }
    isCommunicationCorrelationComplete(correlation) {
        const patterns = this.config.communication?.correlationPatterns || [];
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
    calculateCommunicationEfficiency(correlation) {
        const events = correlation.events;
        if (events.length < 2)
            return 1.0;
        const successfulEvents = events.filter((e) => e.details?.statusCode !== undefined
            ? e.details.statusCode < 400
            : e.operation !== 'error').length;
        const timeEfficiency = Math.max(0, 1 - correlation.performance.totalLatency / 60000);
        const successRate = successfulEvents / events.length;
        return (timeEfficiency + successRate) / 2;
    }
    async checkCommunicationComponentHealth() {
        const componentHealth = {};
        for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
            const existing = this.communicationHealth.get(componentName);
            const healthEntry = existing || {
                component: componentName,
                componentType: wrapped.componentType,
                status: wrapped.isActive ? 'healthy' : 'unhealthy',
                lastCheck: new Date(),
                consecutiveFailures: 0,
                communicationLatency: wrapped.healthMetrics.avgLatency,
                throughput: 0,
                reliability: wrapped.healthMetrics.errorCount === 0 ? 1.0 : 0.8,
                resourceUsage: { cpu: 0, memory: 0, network: 0 },
                metadata: {},
            };
            componentHealth[componentName] = healthEntry;
        }
        return componentHealth;
    }
    async processCommunicationBatchImmediate(batch, options) {
        await Promise.all(batch.events.map((event) => this.emit(event, options)));
    }
    async processCommunicationBatchQueued(batch, _options) {
        this.eventQueue.push(...batch.events);
    }
    async processCommunicationBatchBatched(batch, options) {
        const batchSize = this.config.processing?.batchSize || 50;
        for (let i = 0; i < batch.events.length; i += batchSize) {
            const chunk = batch.events.slice(i, i + batchSize);
            await Promise.all(chunk.map((event) => this.emit(event, options)));
        }
    }
    async processCommunicationBatchThrottled(batch, options) {
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
            throw new Error(`Communication event transformation validation failed for ${event.id}`);
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
    extractCommunicationOperation(eventType) {
        if (eventType.includes('connect'))
            return 'connect';
        if (eventType.includes('disconnect'))
            return 'disconnect';
        if (eventType.includes('send') || eventType.includes('request'))
            return 'send';
        if (eventType.includes('receive') || eventType.includes('response'))
            return 'receive';
        if (eventType.includes('error'))
            return 'error';
        if (eventType.includes('timeout'))
            return 'timeout';
        if (eventType.includes('retry'))
            return 'retry';
        return 'send';
    }
    extractProtocol(eventType, data) {
        if (data?.protocol)
            return data?.protocol;
        if (eventType.includes('websocket') || eventType.includes('ws'))
            return 'ws';
        if (eventType.includes('http'))
            return 'http';
        if (eventType.includes('mcp'))
            return 'stdio';
        return 'custom';
    }
    extractConnectionId(event) {
        return event.details?.connectionId || event.metadata?.['connectionId'];
    }
    extractMessageId(event) {
        return event.details?.requestId || event.metadata?.['messageId'];
    }
    extractProtocolType(event) {
        return event.protocol || 'unknown';
    }
    extractMessageIds(event) {
        const messageId = this.extractMessageId(event);
        return messageId ? [messageId] : [];
    }
    determineCommunicationEventPriority(eventType) {
        if (eventType.includes('error') ||
            eventType.includes('timeout') ||
            eventType.includes('disconnect'))
            return 'high';
        if (eventType.includes('connect') ||
            eventType.includes('started') ||
            eventType.includes('stopped'))
            return 'high';
        if (eventType.includes('completed') || eventType.includes('response'))
            return 'medium';
        return 'medium';
    }
    updateComponentHealthMetrics(componentName, success) {
        const wrapped = this.wrappedComponents.get(componentName);
        if (wrapped) {
            wrapped.healthMetrics.lastSeen = new Date();
            wrapped.healthMetrics.communicationCount++;
            if (!success) {
                wrapped.healthMetrics.errorCount++;
            }
        }
    }
    updateCommunicationMetrics(event) {
        const connectionId = this.extractConnectionId(event);
        if (connectionId && event.type === 'communication:websocket') {
            const metrics = this.connectionMetrics.get(connectionId) || {
                eventCount: 0,
                lastUpdate: new Date(),
            };
            metrics.eventCount++;
            metrics.lastUpdate = new Date();
            this.connectionMetrics.set(connectionId, metrics);
        }
        const messageId = this.extractMessageId(event);
        if (messageId &&
            (event.type === 'communication:mcp' ||
                event.type === 'communication:http')) {
            const metrics = this.messageMetrics.get(messageId) || {
                eventCount: 0,
                lastUpdate: new Date(),
            };
            metrics.eventCount++;
            metrics.lastUpdate = new Date();
            this.messageMetrics.set(messageId, metrics);
        }
        const protocolType = this.extractProtocolType(event);
        if (protocolType && event.type === 'communication:protocol') {
            const metrics = this.protocolMetrics.get(protocolType) || {
                eventCount: 0,
                lastUpdate: new Date(),
            };
            metrics.eventCount++;
            metrics.lastUpdate = new Date();
            this.protocolMetrics.set(protocolType, metrics);
        }
    }
    getActiveConnectionCount(_componentName) {
        return this.connectionMetrics.size;
    }
    getActiveMessageCount(_componentName) {
        return this.messageMetrics.size;
    }
    recordCommunicationEventMetrics(metrics) {
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
        size += this.eventHistory.length * 800;
        for (const correlation of this.communicationCorrelations.values()) {
            size += correlation.events.length * 500;
        }
        size += this.metrics.length * 200;
        size += this.connectionMetrics.size * 100;
        size += this.messageMetrics.size * 100;
        size += this.protocolMetrics.size * 100;
        return size;
    }
    generateEventId() {
        return `comm-evt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateSubscriptionId() {
        return `comm-sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateFilterId() {
        return `comm-flt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateTransformId() {
        return `comm-txf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateCorrelationId() {
        return `comm-cor-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    emitInternal(event, data) {
        this.eventEmitter.emit(event, data);
    }
}
export function createCommunicationEventAdapter(config) {
    return new CommunicationEventAdapter(config);
}
export function createDefaultCommunicationEventAdapterConfig(name, overrides) {
    return {
        name,
        type: EventManagerTypes.COMMUNICATION,
        processing: {
            strategy: 'immediate',
            queueSize: 5000,
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
        },
        websocketCommunication: {
            enabled: true,
            wrapConnectionEvents: true,
            wrapMessageEvents: true,
            wrapHealthEvents: true,
            wrapReconnectionEvents: true,
            clients: ['default'],
        },
        mcpProtocol: {
            enabled: true,
            wrapServerEvents: true,
            wrapClientEvents: true,
            wrapToolEvents: true,
            wrapProtocolEvents: true,
            servers: ['http-mcp-server'],
            clients: ['default-mcp-client'],
        },
        protocolCommunication: {
            enabled: true,
            wrapRoutingEvents: true,
            wrapOptimizationEvents: true,
            wrapFailoverEvents: true,
            wrapSwitchingEvents: true,
            protocols: ['http', 'https', 'ws', 'wss', 'stdio'],
        },
        httpCommunication: {
            enabled: true,
            wrapRequestEvents: true,
            wrapResponseEvents: true,
            wrapTimeoutEvents: true,
            wrapRetryEvents: true,
        },
        performance: {
            enableConnectionCorrelation: true,
            enableMessageTracking: true,
            enableProtocolMetrics: true,
            maxConcurrentConnections: 1000,
            connectionTimeout: 30000,
            enablePerformanceTracking: true,
        },
        communication: {
            enabled: true,
            strategy: 'websocket',
            correlationTTL: 300000,
            maxCorrelationDepth: 20,
            correlationPatterns: [
                'communication:websocket->communication:mcp',
                'communication:http->communication:mcp',
                'communication:protocol->communication:websocket',
                'communication:mcp->communication:http',
            ],
            trackMessageFlow: true,
            trackConnectionHealth: true,
        },
        connectionHealthMonitoring: {
            enabled: true,
            healthCheckInterval: 30000,
            connectionHealthThresholds: {
                'websocket-client': 0.95,
                'mcp-server': 0.9,
                'mcp-client': 0.85,
                'http-client': 0.9,
                'protocol-manager': 0.8,
            },
            protocolHealthThresholds: {
                'communication-latency': 100,
                throughput: 1000,
                reliability: 0.95,
                'connection-availability': 0.9,
            },
            autoRecoveryEnabled: true,
        },
        communicationOptimization: {
            enabled: true,
            optimizationInterval: 60000,
            performanceThresholds: {
                latency: 50,
                throughput: 500,
                reliability: 0.98,
            },
            connectionPooling: true,
            messageCompression: true,
        },
        ...overrides,
    };
}
export const CommunicationEventHelpers = {
    createWebSocketConnectionEvent(connectionId, url, details) {
        return {
            source: 'websocket-client',
            type: 'communication:websocket',
            operation: 'connect',
            protocol: 'ws',
            endpoint: url,
            priority: 'high',
            details: {
                ...details,
                connectionId,
            },
        };
    },
    createMCPToolExecutionEvent(toolName, requestId, details) {
        return {
            source: 'mcp-server',
            type: 'communication:mcp',
            operation: 'send',
            protocol: 'http',
            endpoint: `/tools/${toolName}`,
            priority: 'medium',
            details: {
                ...details,
                toolName,
                requestId,
            },
        };
    },
    createHTTPRequestEvent(method, url, details) {
        return {
            source: 'http-client',
            type: 'communication:http',
            operation: 'send',
            protocol: 'http',
            endpoint: url,
            priority: 'medium',
            details: {
                ...details,
                method,
            },
        };
    },
    createProtocolSwitchingEvent(fromProtocol, toProtocol, details) {
        return {
            source: 'protocol-manager',
            type: 'communication:protocol',
            operation: 'send',
            protocol: toProtocol,
            endpoint: 'protocol-switch',
            priority: 'medium',
            details: {
                ...details,
                fromProtocol,
                toProtocol,
            },
        };
    },
    createCommunicationErrorEvent(component, protocol, error, details) {
        return {
            source: component,
            type: 'communication:websocket',
            operation: 'error',
            protocol: protocol,
            endpoint: component,
            priority: 'high',
            details: {
                ...details,
                errorCode: error.name,
                errorMessage: error.message,
            },
        };
    },
};
export default CommunicationEventAdapter;
//# sourceMappingURL=communication-event-adapter.js.map