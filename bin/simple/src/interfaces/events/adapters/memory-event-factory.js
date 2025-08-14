import { BaseEventManager } from '../core/base-event-manager.ts';
class MemoryEventManager extends BaseEventManager {
    memoryMetrics = {
        cacheHits: 0,
        cacheMisses: 0,
        cacheEvictions: 0,
        totalMemoryUsage: 0,
        maxMemoryUsage: 0,
        gcCollections: 0,
        gcTime: 0,
        storageOperations: 0,
        compressionRatio: 0,
        accessPatterns: new Map(),
        performanceStats: {
            hitRatio: 0,
            averageAccessTime: 0,
            memoryEfficiency: 0,
            lastCalculated: new Date(),
        },
    };
    subscriptions = {
        cache: new Map(),
        gc: new Map(),
        storage: new Map(),
        performance: new Map(),
        lifecycle: new Map(),
    };
    constructor(config, logger) {
        super(config, logger);
        this.initializeMemoryHandlers();
    }
    async emitMemoryEvent(event) {
        try {
            this.updateMemoryMetrics(event);
            const enrichedEvent = {
                ...event,
                metadata: {
                    ...event.metadata,
                    timestamp: new Date(),
                    processingTime: Date.now(),
                    memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
                    cacheSize: event.data?.cacheSize,
                },
            };
            await this.emit(enrichedEvent);
            await this.routeMemoryEvent(enrichedEvent);
            this.logger.debug(`Memory event emitted: ${event.operation} for ${event.key || 'system'}`);
        }
        catch (error) {
            this.logger.error('Failed to emit memory event:', error);
            throw error;
        }
    }
    subscribeCacheEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.cache.set(subscriptionId, listener);
        this.logger.debug(`Cache event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeGCEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.gc.set(subscriptionId, listener);
        this.logger.debug(`GC event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeStorageEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.storage.set(subscriptionId, listener);
        this.logger.debug(`Storage event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribePerformanceEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.performance.set(subscriptionId, listener);
        this.logger.debug(`Performance event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeLifecycleEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.lifecycle.set(subscriptionId, listener);
        this.logger.debug(`Lifecycle event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    async getMemoryMetrics() {
        const totalCacheOperations = this.memoryMetrics.cacheHits + this.memoryMetrics.cacheMisses;
        const hitRate = totalCacheOperations > 0
            ? this.memoryMetrics.cacheHits / totalCacheOperations
            : 0;
        const gcFrequency = this.memoryMetrics.gcCollections;
        const averageGcTime = this.memoryMetrics.gcCollections > 0
            ? this.memoryMetrics.gcTime / this.memoryMetrics.gcCollections
            : 0;
        this.updatePerformanceStats();
        return {
            cacheHitRate: hitRate,
            memoryUsage: this.memoryMetrics.totalMemoryUsage,
            gcFrequency,
            performance: {
                hitRatio: this.memoryMetrics.performanceStats.hitRatio,
                averageAccessTime: this.memoryMetrics.performanceStats.averageAccessTime,
                memoryEfficiency: this.memoryMetrics.performanceStats.memoryEfficiency,
            },
            cache: {
                hits: this.memoryMetrics.cacheHits,
                misses: this.memoryMetrics.cacheMisses,
                evictions: this.memoryMetrics.cacheEvictions,
                totalOperations: totalCacheOperations,
            },
            gc: {
                collections: this.memoryMetrics.gcCollections,
                totalTime: this.memoryMetrics.gcTime,
                averageTime: averageGcTime,
            },
            storage: {
                operations: this.memoryMetrics.storageOperations,
                compressionRatio: this.memoryMetrics.compressionRatio,
            },
        };
    }
    async getMetrics() {
        const baseMetrics = await super.getMetrics();
        const memoryMetrics = await this.getMemoryMetrics();
        return {
            ...baseMetrics,
            customMetrics: {
                memory: memoryMetrics,
            },
        };
    }
    async healthCheck() {
        const baseStatus = await super.healthCheck();
        const memoryMetrics = await this.getMemoryMetrics();
        const lowHitRate = memoryMetrics.cacheHitRate < 0.5;
        const highMemoryUsage = memoryMetrics.memoryUsage > 1024 * 1024 * 1024;
        const frequentGC = memoryMetrics.gcFrequency > 100;
        const poorEfficiency = memoryMetrics.performance.memoryEfficiency < 0.7;
        const isHealthy = baseStatus.status === 'healthy' &&
            !lowHitRate &&
            !highMemoryUsage &&
            !frequentGC &&
            !poorEfficiency;
        return {
            ...baseStatus,
            status: isHealthy ? 'healthy' : 'degraded',
            metadata: {
                ...baseStatus.metadata,
                memory: {
                    hitRate: memoryMetrics.cacheHitRate,
                    memoryUsage: memoryMetrics.memoryUsage,
                    gcFrequency: memoryMetrics.gcFrequency,
                    efficiency: memoryMetrics.performance.memoryEfficiency,
                },
            },
        };
    }
    initializeMemoryHandlers() {
        this.logger.debug('Initializing memory event handlers');
        this.subscribe([
            'memory:cache',
            'memory:gc',
            'memory:storage',
            'memory:performance',
            'memory:lifecycle',
        ], this.handleMemoryEvent.bind(this));
    }
    async handleMemoryEvent(event) {
        const startTime = Date.now();
        try {
            const operationType = event.type.split(':')[1];
            switch (operationType) {
                case 'cache':
                    await this.notifySubscribers(this.subscriptions.cache, event);
                    break;
                case 'gc':
                    await this.notifySubscribers(this.subscriptions.gc, event);
                    break;
                case 'storage':
                    await this.notifySubscribers(this.subscriptions.storage, event);
                    break;
                case 'performance':
                    await this.notifySubscribers(this.subscriptions.performance, event);
                    break;
                case 'lifecycle':
                    await this.notifySubscribers(this.subscriptions.lifecycle, event);
                    break;
                default:
                    this.logger.warn(`Unknown memory operation type: ${operationType}`);
            }
            if (event.key) {
                const currentCount = this.memoryMetrics.accessPatterns.get(event.key) || 0;
                this.memoryMetrics.accessPatterns.set(event.key, currentCount + 1);
            }
        }
        catch (error) {
            this.logger.error('Memory event handling failed:', error);
            throw error;
        }
    }
    async routeMemoryEvent(event) {
        switch (event.operation) {
            case 'hit':
                this.logger.debug(`Cache hit: ${event.key}`);
                break;
            case 'miss':
                this.logger.debug(`Cache miss: ${event.key}`);
                break;
            case 'evict':
                this.logger.debug(`Cache eviction: ${event.key}`);
                break;
            case 'gc-start':
                this.logger.debug('Garbage collection started');
                break;
            case 'gc-end':
                if (event.data?.duration) {
                    this.memoryMetrics.gcTime += event.data.duration;
                }
                this.logger.debug(`Garbage collection completed in ${event.data?.duration}ms`);
                break;
            case 'serialize':
                this.logger.debug(`Data serialized: ${event.key} (${event.data?.size} bytes)`);
                break;
            case 'compress':
                if (event.data?.compressionRatio) {
                    this.memoryMetrics.compressionRatio = event.data.compressionRatio;
                }
                this.logger.debug(`Data compressed: ${event.key} (ratio: ${event.data?.compressionRatio})`);
                break;
            case 'expire':
                this.logger.debug(`Cache item expired: ${event.key}`);
                break;
            case 'cleanup':
                this.logger.debug('Memory cleanup performed');
                break;
            case 'pressure':
                this.logger.warn(`Memory pressure detected: ${event.data?.level}`);
                break;
        }
        if (event.data?.memoryUsage) {
            this.memoryMetrics.totalMemoryUsage = event.data.memoryUsage;
            if (event.data.memoryUsage > this.memoryMetrics.maxMemoryUsage) {
                this.memoryMetrics.maxMemoryUsage = event.data.memoryUsage;
            }
        }
    }
    updateMemoryMetrics(event) {
        const operationType = event.type.split(':')[1];
        switch (operationType) {
            case 'cache':
                if (event.operation === 'hit') {
                    this.memoryMetrics.cacheHits++;
                }
                else if (event.operation === 'miss') {
                    this.memoryMetrics.cacheMisses++;
                }
                else if (event.operation === 'evict') {
                    this.memoryMetrics.cacheEvictions++;
                }
                break;
            case 'gc':
                if (event.operation === 'gc-end') {
                    this.memoryMetrics.gcCollections++;
                }
                break;
            case 'storage':
                this.memoryMetrics.storageOperations++;
                break;
        }
    }
    updatePerformanceStats() {
        const totalOperations = this.memoryMetrics.cacheHits + this.memoryMetrics.cacheMisses;
        this.memoryMetrics.performanceStats.hitRatio =
            totalOperations > 0 ? this.memoryMetrics.cacheHits / totalOperations : 0;
        const maxUsage = this.memoryMetrics.maxMemoryUsage;
        const currentUsage = this.memoryMetrics.totalMemoryUsage;
        this.memoryMetrics.performanceStats.memoryEfficiency =
            maxUsage > 0 ? 1 - currentUsage / maxUsage : 1;
        this.memoryMetrics.performanceStats.lastCalculated = new Date();
    }
    async notifySubscribers(subscribers, event) {
        const notifications = Array.from(subscribers.values()).map(async (listener) => {
            try {
                await listener(event);
            }
            catch (error) {
                this.logger.error('Memory event listener failed:', error);
            }
        });
        await Promise.allSettled(notifications);
    }
    generateSubscriptionId() {
        return `memory-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
export class MemoryEventManagerFactory {
    logger;
    config;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
        this.logger.debug('MemoryEventManagerFactory initialized');
    }
    async create(config) {
        this.logger.info(`Creating memory event manager: ${config.name}`);
        this.validateConfig(config);
        const optimizedConfig = this.applyMemoryDefaults(config);
        const manager = new MemoryEventManager(optimizedConfig, this.logger);
        await this.configureMemoryManager(manager, optimizedConfig);
        this.logger.info(`Memory event manager created successfully: ${config.name}`);
        return manager;
    }
    validateConfig(config) {
        if (!config.name) {
            throw new Error('Memory event manager name is required');
        }
        if (config.type !== 'memory') {
            throw new Error('Manager type must be "memory"');
        }
        if (config.maxListeners && config.maxListeners < 100) {
            this.logger.warn('Memory managers should support at least 100 listeners for high-frequency operations');
        }
    }
    applyMemoryDefaults(config) {
        return {
            ...config,
            maxListeners: config.maxListeners || 500,
            processing: {
                strategy: 'immediate',
                timeout: 50,
                retries: 1,
                batchSize: 200,
                ...config.processing,
            },
            persistence: {
                enabled: false,
                ...config.persistence,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                healthCheckInterval: 30000,
                ...config.monitoring,
            },
        };
    }
    async configureMemoryManager(manager, config) {
        if (config.monitoring?.enabled) {
            await manager.start();
            this.logger.debug(`Memory event manager monitoring started: ${config.name}`);
        }
        if (config.monitoring?.healthCheckInterval) {
            setInterval(async () => {
                try {
                    const status = await manager.healthCheck();
                    if (status.status !== 'healthy') {
                        this.logger.warn(`Memory manager health degraded: ${config.name}`, status.metadata);
                    }
                }
                catch (error) {
                    this.logger.error(`Memory manager health check failed: ${config.name}`, error);
                }
            }, config.monitoring.healthCheckInterval);
        }
    }
}
export default MemoryEventManagerFactory;
//# sourceMappingURL=memory-event-factory.js.map