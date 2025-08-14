export class BaseEventManager {
    name;
    type;
    subscribers = new Map();
    eventQueue = [];
    processingBatch = [];
    isProcessing = false;
    isRunning = false;
    processingStrategy;
    metrics = {
        eventsEmitted: 0,
        eventsProcessed: 0,
        eventsFailed: 0,
        subscriptionCount: 0,
        averageLatency: 0,
        totalProcessingTime: 0,
        lastEmissionTime: new Date(),
        startTime: new Date(),
        errorCount: 0,
        retryCount: 0,
    };
    config;
    logger;
    processingInterval;
    healthCheckInterval;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.name = config.name;
        this.type = config.type;
        this.processingStrategy = config.processing?.strategy || 'immediate';
        this.logger.debug(`BaseEventManager initialized: ${this.name} (${this.type})`);
    }
    async start() {
        if (this.isRunning) {
            this.logger.warn(`Event manager already running: ${this.name}`);
            return;
        }
        this.isRunning = true;
        this.metrics.startTime = new Date();
        if (this.processingStrategy === 'queued' ||
            this.processingStrategy === 'batched') {
            this.startQueueProcessing();
        }
        if (this.config.monitoring?.enabled) {
            this.startHealthMonitoring();
        }
        this.logger.info(`Event manager started: ${this.name}`);
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = undefined;
        }
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
        if (this.eventQueue.length > 0) {
            await this.processEventQueue();
        }
        this.logger.info(`Event manager stopped: ${this.name}`);
    }
    async destroy() {
        await this.stop();
        this.subscribers.clear();
        this.eventQueue.length = 0;
        this.processingBatch.length = 0;
        this.logger.info(`Event manager destroyed: ${this.name}`);
    }
    async emit(event, options) {
        if (!this.isRunning) {
            this.logger.warn(`Event manager not running, queuing event: ${event.id}`);
            this.eventQueue.push(event);
            return;
        }
        const startTime = Date.now();
        this.metrics.eventsEmitted++;
        this.metrics.lastEmissionTime = new Date();
        try {
            const enrichedEvent = {
                ...event,
                priority: options?.priority || 'medium',
                metadata: {
                    ...event.metadata,
                    emittedAt: new Date(),
                    managerId: this.name,
                },
            };
            switch (this.processingStrategy) {
                case 'immediate':
                    await this.processEventImmediate(enrichedEvent);
                    break;
                case 'queued':
                    this.eventQueue.push(enrichedEvent);
                    break;
                case 'batched':
                    this.processingBatch.push(enrichedEvent);
                    if (this.processingBatch.length >=
                        (this.config.processing?.batchSize || 10)) {
                        await this.processBatch();
                    }
                    break;
                case 'throttled':
                    await this.processEventThrottled(enrichedEvent);
                    break;
                default:
                    await this.processEventImmediate(enrichedEvent);
            }
            const processingTime = Date.now() - startTime;
            this.metrics.totalProcessingTime += processingTime;
            this.metrics.averageLatency =
                this.metrics.totalProcessingTime / this.metrics.eventsEmitted;
            this.metrics.eventsProcessed++;
            this.logger.debug(`Event emitted: ${event.type} (${processingTime}ms)`);
        }
        catch (error) {
            this.metrics.eventsFailed++;
            this.metrics.errorCount++;
            this.logger.error(`Event emission failed: ${event.id}`, error);
            if (options?.retries && options.retries > 0) {
                this.metrics.retryCount++;
                await this.emit(event, { ...options, retries: options.retries - 1 });
            }
            else {
                throw error;
            }
        }
    }
    subscribe(eventTypes, listener, options) {
        const subscriptionId = this.generateSubscriptionId();
        const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
        this.subscribers.set(subscriptionId, {
            eventTypes: types,
            listener: options?.once
                ? this.wrapOnceListener(listener, subscriptionId)
                : listener,
            filter: options?.filter,
            subscriptionTime: new Date(),
            eventCount: 0,
        });
        this.metrics.subscriptionCount++;
        this.logger.debug(`Subscription created: ${subscriptionId} for types ${types.join(', ')}`);
        return subscriptionId;
    }
    unsubscribe(subscriptionId) {
        const removed = this.subscribers.delete(subscriptionId);
        if (removed) {
            this.metrics.subscriptionCount--;
            this.logger.debug(`Subscription removed: ${subscriptionId}`);
        }
        return removed;
    }
    async getMetrics() {
        const uptime = Date.now() - this.metrics.startTime.getTime();
        return {
            name: this.name,
            type: this.type,
            eventsProcessed: this.metrics.eventsProcessed,
            eventsFailed: this.metrics.eventsFailed,
            subscriptionCount: this.metrics.subscriptionCount,
            averageLatency: this.metrics.averageLatency,
            uptime,
            queueSize: this.eventQueue.length,
            errorRate: this.metrics.eventsEmitted > 0
                ? this.metrics.eventsFailed / this.metrics.eventsEmitted
                : 0,
            lastActivity: this.metrics.lastEmissionTime,
            isRunning: this.isRunning,
            customMetrics: {},
        };
    }
    async healthCheck() {
        const metrics = await this.getMetrics();
        const queueBacklog = this.eventQueue.length > (this.config.processing?.queueSize || 1000);
        const highErrorRate = metrics.errorRate > 0.1;
        const notResponsive = !this.isRunning;
        const isHealthy = !(queueBacklog || highErrorRate || notResponsive);
        return {
            name: this.name,
            type: this.type,
            status: isHealthy ? 'healthy' : 'unhealthy',
            lastCheck: new Date(),
            subscriptions: this.metrics.subscriptionCount,
            queueSize: this.eventQueue.length,
            errorRate: metrics.errorRate,
            uptime: metrics.uptime,
            metadata: {
                isRunning: this.isRunning,
                processingStrategy: this.processingStrategy,
                queueBacklog,
                highErrorRate,
                lastActivity: this.metrics.lastEmissionTime,
            },
        };
    }
    getSubscriptions() {
        return Array.from(this.subscribers.entries()).map(([id, subscription]) => ({
            id,
            eventTypes: subscription.eventTypes,
            eventCount: subscription.eventCount,
            subscriptionTime: subscription.subscriptionTime,
        }));
    }
    clearSubscriptions() {
        this.subscribers.clear();
        this.metrics.subscriptionCount = 0;
        this.logger.debug(`All subscriptions cleared for manager: ${this.name}`);
    }
    async processEventImmediate(event) {
        await this.notifySubscribers(event);
    }
    async processEventThrottled(event) {
        const delay = this.config.processing?.throttleDelay || 100;
        setTimeout(async () => {
            await this.notifySubscribers(event);
        }, delay);
    }
    async processBatch() {
        if (this.processingBatch.length === 0 || this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        const batch = [...this.processingBatch];
        this.processingBatch.length = 0;
        try {
            await Promise.allSettled(batch.map((event) => this.notifySubscribers(event)));
        }
        catch (error) {
            this.logger.error('Batch processing failed:', error);
        }
        finally {
            this.isProcessing = false;
        }
    }
    async processEventQueue() {
        if (this.eventQueue.length === 0 || this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        const batchSize = this.config.processing?.batchSize || 10;
        const batch = this.eventQueue.splice(0, batchSize);
        try {
            for (const event of batch) {
                await this.processEventImmediate(event);
            }
        }
        catch (error) {
            this.logger.error('Queue processing failed:', error);
            this.metrics.errorCount++;
        }
        finally {
            this.isProcessing = false;
        }
    }
    async notifySubscribers(event) {
        const matchingSubscribers = this.findMatchingSubscribers(event);
        if (matchingSubscribers.length === 0) {
            return;
        }
        const notifications = matchingSubscribers.map(async (subscription) => {
            try {
                subscription.eventCount++;
                await subscription.listener(event);
            }
            catch (error) {
                this.logger.error(`Subscriber notification failed: ${error}`);
                this.metrics.errorCount++;
            }
        });
        await Promise.allSettled(notifications);
    }
    findMatchingSubscribers(event) {
        const matching = [];
        for (const subscription of this.subscribers.values()) {
            if (!subscription.eventTypes.some((type) => this.eventTypeMatches(event.type, type))) {
                continue;
            }
            if (subscription.filter &&
                !this.eventMatchesFilter(event, subscription.filter)) {
                continue;
            }
            matching.push(subscription);
        }
        return matching;
    }
    eventTypeMatches(eventType, subscriptionType) {
        if (subscriptionType.includes('*')) {
            const pattern = subscriptionType.replace(/\*/g, '.*');
            return new RegExp(`^${pattern}$`).test(eventType);
        }
        return eventType === subscriptionType;
    }
    eventMatchesFilter(event, filter) {
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
    generateSubscriptionId() {
        return `${this.name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    wrapOnceListener(listener, subscriptionId) {
        return async (event) => {
            try {
                await listener(event);
            }
            finally {
                this.unsubscribe(subscriptionId);
            }
        };
    }
    startQueueProcessing() {
        const interval = this.config.processing?.processInterval || 100;
        this.processingInterval = setInterval(async () => {
            if (this.eventQueue.length > 0) {
                await this.processEventQueue();
            }
            if (this.processingBatch.length > 0 &&
                this.processingStrategy === 'batched') {
                await this.processBatch();
            }
        }, interval);
    }
    startHealthMonitoring() {
        const interval = this.config.monitoring?.healthCheckInterval || 60000;
        this.healthCheckInterval = setInterval(async () => {
            try {
                const status = await this.healthCheck();
                if (status.status !== 'healthy') {
                    this.logger.warn(`Event manager health check failed: ${this.name}`, status);
                }
            }
            catch (error) {
                this.logger.error(`Health check error for manager ${this.name}:`, error);
            }
        }, interval);
    }
}
export default BaseEventManager;
//# sourceMappingURL=base-event-manager.js.map