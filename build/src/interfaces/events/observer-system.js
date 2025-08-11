/**
 * @file Observer Pattern Implementation for Real-Time Event System
 * Provides type-safe event handling with priority management and error recovery.
 */
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('interfaces-events-observer-system');
import { EventEmitter } from 'node:events';
// Priority queue for event processing
class PriorityQueue {
    items = [];
    enqueue(item, priority) {
        this.items.push({ item, priority });
        this.items.sort((a, b) => b.priority - a.priority);
    }
    dequeue() {
        return this.items.shift()?.item;
    }
    size() {
        return this.items.length;
    }
    clear() {
        this.items = [];
    }
}
// Concrete observer implementations
export class WebSocketObserver {
    logger;
    connections = new Set();
    healthy = true;
    constructor(logger) {
        this.logger = logger;
    }
    addConnection(socket) {
        this.connections.add(socket);
    }
    removeConnection(socket) {
        this.connections.delete(socket);
    }
    update(event) {
        try {
            const payload = this.formatEventForWebSocket(event);
            this.connections.forEach((socket) => {
                if (socket.readyState === 1) {
                    // WebSocket.OPEN
                    socket.send(JSON.stringify(payload));
                }
            });
            // Emit specific event types
            this.connections.forEach((socket) => {
                switch (event.type) {
                    case 'swarm':
                        socket.emit('swarm:update', event);
                        break;
                    case 'mcp':
                        socket.emit('mcp:execution', event);
                        break;
                    case 'interface':
                        socket.emit('interface:activity', event);
                        break;
                }
            });
        }
        catch (error) {
            this.healthy = false;
            this.logger?.error('WebSocket observer error:', error);
        }
    }
    getObserverType() {
        return 'websocket';
    }
    getPriority() {
        return 'high';
    }
    getEventTypes() {
        return ['swarm', 'mcp', 'interface'];
    }
    isHealthy() {
        return this.healthy && this.connections.size > 0;
    }
    handleError(error, event) {
        this.logger?.error('WebSocket observer error handling event:', { error, event });
        // Try to reconnect or cleanup bad connections
        this.connections.forEach((socket) => {
            if (socket.readyState !== 1) {
                this.connections.delete(socket);
            }
        });
    }
    formatEventForWebSocket(event) {
        return {
            id: event.id,
            type: event.type,
            timestamp: event.timestamp.toISOString(),
            source: event.source,
            data: event,
            priority: this.getPriority(),
        };
    }
}
export class DatabaseObserver {
    dbService;
    logger;
    healthy = true;
    batchSize = 100;
    eventBatch = [];
    flushInterval;
    constructor(dbService, logger, batchSize = 100) {
        this.dbService = dbService;
        this.logger = logger;
        this.batchSize = batchSize;
        this.flushInterval = setInterval(() => this.flushBatch(), 5000); // Flush every 5 seconds
    }
    update(event) {
        try {
            this.eventBatch.push(event);
            if (this.eventBatch.length >= this.batchSize) {
                this.flushBatch();
            }
            // Update real-time metrics
            this.updateMetrics(event);
        }
        catch (error) {
            this.healthy = false;
            this.logger?.error('Database observer error:', error);
        }
    }
    getObserverType() {
        return 'database';
    }
    getPriority() {
        return 'medium';
    }
    getEventTypes() {
        return ['swarm', 'mcp', 'neural', 'database', 'memory', 'interface'];
    }
    isHealthy() {
        return this.healthy;
    }
    async destroy() {
        clearInterval(this.flushInterval);
        await this.flushBatch();
    }
    async flushBatch() {
        if (this.eventBatch.length === 0)
            return;
        try {
            const batch = [...this.eventBatch];
            this.eventBatch = [];
            await this.dbService.query('INSERT INTO system_events (id, type, timestamp, source, data) VALUES ?', [
                batch.map((event) => [
                    event.id,
                    event.type,
                    event.timestamp,
                    event.source,
                    JSON.stringify(event),
                ]),
            ]);
        }
        catch (error) {
            this.healthy = false;
            this.logger?.error('Failed to flush event batch to database:', error);
            // Re-add events to batch for retry
            this.eventBatch.unshift(...this.eventBatch);
        }
    }
    updateMetrics(event) {
        // Update real-time metrics based on event type
        const _metricsKey = `events:${event.type}:count`;
        // This would integrate with actual metrics service
    }
}
export class LoggerObserver {
    logger;
    healthy = true;
    constructor(logger) {
        this.logger = logger;
    }
    update(event) {
        try {
            const logLevel = this.getLogLevel(event);
            const message = this.formatLogMessage(event);
            this.logger[logLevel](message, {
                eventId: event.id,
                type: event.type,
                source: event.source,
                timestamp: event.timestamp,
            });
        }
        catch (error) {
            this.healthy = false;
            logger.error('Logger observer error:', error);
        }
    }
    getObserverType() {
        return 'logger';
    }
    getPriority() {
        return 'low';
    }
    getEventTypes() {
        return ['swarm', 'mcp', 'neural', 'database', 'memory', 'interface'];
    }
    isHealthy() {
        return this.healthy;
    }
    getLogLevel(event) {
        if ('success' in event && !event.success)
            return 'error';
        if ('errors' in event && Array.isArray(event.errors) && event.errors.length > 0)
            return 'warn';
        return 'info';
    }
    formatLogMessage(event) {
        switch (event.type) {
            case 'swarm': {
                const swarmEvent = event;
                return `Swarm ${swarmEvent.operation}: ${swarmEvent.swarmId} (${swarmEvent.agentCount} agents)`;
            }
            case 'mcp': {
                const mcpEvent = event;
                return `MCP ${mcpEvent.operation}: ${mcpEvent.toolName} (${mcpEvent.executionTime}ms)`;
            }
            case 'neural': {
                const neuralEvent = event;
                return `Neural ${neuralEvent.operation}: ${neuralEvent.modelId} (${neuralEvent.processingTime}ms)`;
            }
            default:
                return `${event.type} event from ${event.source}`;
        }
    }
}
export class MetricsObserver {
    metricsService;
    healthy = true;
    metrics = new Map();
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    update(event) {
        try {
            this.collectMetrics(event);
            if (this.metricsService) {
                this.metricsService.recordEvent(event);
            }
        }
        catch (error) {
            this.healthy = false;
            logger.error('Metrics observer error:', error);
        }
    }
    getObserverType() {
        return 'metrics';
    }
    getPriority() {
        return 'medium';
    }
    getEventTypes() {
        return ['swarm', 'mcp', 'neural', 'database', 'memory', 'interface'];
    }
    isHealthy() {
        return this.healthy;
    }
    getMetrics() {
        return new Map(this.metrics);
    }
    collectMetrics(event) {
        const key = `${event.type}:${event.source}`;
        const current = this.metrics.get(key) || { count: 0, lastSeen: null };
        this.metrics.set(key, {
            count: current?.count + 1,
            lastSeen: event.timestamp,
            type: event.type,
            source: event.source,
        });
        // Collect specific metrics based on event type
        switch (event.type) {
            case 'mcp': {
                const mcpEvent = event;
                this.recordExecutionTime('mcp', mcpEvent.executionTime);
                break;
            }
            case 'neural': {
                const neuralEvent = event;
                this.recordExecutionTime('neural', neuralEvent.processingTime);
                break;
            }
            case 'database': {
                const dbEvent = event;
                this.recordExecutionTime('database', dbEvent.queryTime);
                break;
            }
        }
    }
    recordExecutionTime(type, time) {
        const key = `${type}:execution_time`;
        const current = this.metrics.get(key) || { sum: 0, count: 0, avg: 0, min: Infinity, max: 0 };
        this.metrics.set(key, {
            sum: current?.sum + time,
            count: current?.count + 1,
            avg: (current?.sum + time) / (current?.count + 1),
            min: Math.min(current?.min, time),
            max: Math.max(current?.max, time),
        });
    }
}
// Main event manager with priority handling and error recovery
export class SystemEventManager extends EventEmitter {
    logger;
    observers = new Map();
    eventQueue = new PriorityQueue();
    processing = false;
    errorRecovery = true;
    maxRetries = 3;
    retryDelay = 1000;
    constructor(logger) {
        super();
        this.logger = logger;
        this.setMaxListeners(1000);
        this.startEventProcessing();
    }
    subscribe(eventType, observer) {
        const observers = this.observers.get(eventType) || [];
        observers.push(observer);
        // Sort by priority (critical = 4, high = 3, medium = 2, low = 1)
        observers.sort((a, b) => this.getPriorityValue(b.getPriority()) - this.getPriorityValue(a.getPriority()));
        this.observers.set(eventType, observers);
        this.logger?.debug(`Observer subscribed to ${eventType}`, {
            observerType: observer.getObserverType(),
            priority: observer.getPriority(),
        });
    }
    unsubscribe(eventType, observer) {
        const observers = this.observers.get(eventType) || [];
        const index = observers.indexOf(observer);
        if (index > -1) {
            observers.splice(index, 1);
            this.observers.set(eventType, observers);
            this.logger?.debug(`Observer unsubscribed from ${eventType}`, {
                observerType: observer.getObserverType(),
            });
        }
    }
    async notify(event) {
        const observers = this.observers.get(event.type) || [];
        if (observers.length === 0) {
            this.logger?.warn(`No observers for event type: ${event.type}`);
            return;
        }
        // Add to priority queue for processing
        const priority = this.calculateEventPriority(event, observers);
        this.eventQueue.enqueue({ event, observers }, priority);
        // Emit for EventEmitter compatibility
        this.emit(event.type, event);
    }
    // Immediate notification for critical events (bypasses queue)
    async notifyImmediate(event) {
        const observers = this.observers.get(event.type) || [];
        await this.processEventWithObservers(event, observers, true);
    }
    getObserverStats() {
        const stats = [];
        this.observers.forEach((observers, eventType) => {
            const healthy = observers.filter((o) => o.isHealthy()).length;
            stats.push({
                type: eventType,
                count: observers.length,
                healthy,
            });
        });
        return stats;
    }
    getQueueStats() {
        return {
            size: this.eventQueue.size(),
            processing: this.processing,
        };
    }
    clearQueue() {
        this.eventQueue.clear();
    }
    async shutdown() {
        this.processing = false;
        this.clearQueue();
        // Notify all observers of shutdown
        const _shutdownEvent = {
            id: `shutdown-${Date.now()}`,
            timestamp: new Date(),
            source: 'system',
            type: 'system:shutdown',
        };
        for (const [, observers] of this.observers) {
            for (const observer of observers) {
                try {
                    if ('destroy' in observer && typeof observer.destroy === 'function') {
                        await observer.destroy();
                    }
                }
                catch (error) {
                    this.logger?.error('Error shutting down observer:', error);
                }
            }
        }
    }
    startEventProcessing() {
        this.processing = true;
        const processNext = async () => {
            if (!this.processing)
                return;
            const item = this.eventQueue.dequeue();
            if (item) {
                await this.processEventWithObservers(item?.event, item?.observers);
            }
            // Continue processing
            setImmediate(processNext);
        };
        processNext();
    }
    async processEventWithObservers(event, observers, immediate = false) {
        // Separate observers by priority for batch processing
        const criticalObservers = observers.filter((o) => o.getPriority() === 'critical');
        const highPriorityObservers = observers.filter((o) => o.getPriority() === 'high');
        const mediumPriorityObservers = observers.filter((o) => o.getPriority() === 'medium');
        const lowPriorityObservers = observers.filter((o) => o.getPriority() === 'low');
        try {
            // Process critical observers immediately in parallel
            if (criticalObservers.length > 0) {
                await Promise.allSettled(criticalObservers.map((observer) => this.safeUpdate(observer, event)));
            }
            // Process high priority observers in parallel
            if (highPriorityObservers.length > 0) {
                await Promise.allSettled(highPriorityObservers.map((observer) => this.safeUpdate(observer, event)));
            }
            // Process medium and low priority sequentially to avoid overwhelming system
            if (!immediate) {
                for (const observer of mediumPriorityObservers) {
                    await this.safeUpdate(observer, event);
                }
                for (const observer of lowPriorityObservers) {
                    await this.safeUpdate(observer, event);
                }
            }
        }
        catch (error) {
            this.logger?.error('Error processing event with observers:', { error, eventId: event.id });
        }
    }
    async safeUpdate(observer, event) {
        let retries = 0;
        while (retries <= this.maxRetries) {
            try {
                if (!observer.isHealthy()) {
                    this.logger?.warn('Skipping unhealthy observer', {
                        type: observer.getObserverType(),
                        eventType: event.type,
                    });
                    return;
                }
                const result = observer.update(event);
                // Handle async observers
                if (result instanceof Promise) {
                    await result;
                }
                return; // Success
            }
            catch (error) {
                retries++;
                this.logger?.error('Observer update failed', {
                    observer: observer.getObserverType(),
                    eventId: event.id,
                    attempt: retries,
                    error,
                });
                // Call observer's error handler if available
                if (observer.handleError) {
                    try {
                        observer.handleError(error, event);
                    }
                    catch (handlerError) {
                        this.logger?.error('Observer error handler failed:', handlerError);
                    }
                }
                if (retries <= this.maxRetries && this.errorRecovery) {
                    await new Promise((resolve) => setTimeout(resolve, this.retryDelay * retries));
                }
                else {
                    break;
                }
            }
        }
    }
    getPriorityValue(priority) {
        switch (priority) {
            case 'critical':
                return 4;
            case 'high':
                return 3;
            case 'medium':
                return 2;
            case 'low':
                return 1;
            default:
                return 1;
        }
    }
    calculateEventPriority(event, observers) {
        // Calculate priority based on highest priority observer and event characteristics
        const maxObserverPriority = Math.max(...observers.map((o) => this.getPriorityValue(o.getPriority())));
        // Add event-specific priority adjustments
        let eventPriorityBonus = 0;
        if ('success' in event && !event.success)
            eventPriorityBonus += 1; // Errors get higher priority
        if (event.type === 'swarm' && 'operation' in event && event.operation === 'destroy')
            eventPriorityBonus += 1;
        return maxObserverPriority + eventPriorityBonus;
    }
}
// Event builder utilities
export class EventBuilder {
    static createSwarmEvent(swarmId, operation, status, topology, metrics, source = 'swarm-coordinator') {
        return {
            id: `swarm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date(),
            source,
            type: 'swarm',
            swarmId,
            agentCount: status.activeAgents,
            status,
            topology,
            metrics,
            operation,
        };
    }
    static createMCPEvent(toolName, operation, executionTime, result, protocol, requestId, source = 'mcp-server') {
        return {
            id: `mcp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date(),
            source,
            type: 'mcp',
            toolName,
            executionTime,
            result,
            protocol,
            operation,
            requestId,
        };
    }
    static createNeuralEvent(modelId, operation, processingTime, options = {}) {
        return {
            id: `neural-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date(),
            source: options?.source || 'neural-service',
            type: 'neural',
            modelId,
            operation,
            processingTime,
            accuracy: options?.accuracy,
            loss: options?.loss,
            dataSize: options?.dataSize,
        };
    }
}
