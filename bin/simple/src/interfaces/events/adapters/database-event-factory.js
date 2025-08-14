import { BaseEventManager } from '../core/base-event-manager.ts';
class DatabaseEventManager extends BaseEventManager {
    databaseMetrics = {
        totalQueries: 0,
        totalConnections: 0,
        activeConnections: 0,
        totalTransactions: 0,
        failedQueries: 0,
        rollbackCount: 0,
        totalQueryTime: 0,
        slowQueries: 0,
        connectionPoolStats: {
            activeConnections: 0,
            idleConnections: 0,
            waitingRequests: 0,
            maxConnections: 0,
        },
        performanceStats: {
            averageQueryTime: 0,
            longestQueryTime: 0,
            queriesPerSecond: 0,
            lastCalculated: new Date(),
        },
    };
    subscriptions = {
        query: new Map(),
        transaction: new Map(),
        connection: new Map(),
        migration: new Map(),
        performance: new Map(),
    };
    constructor(config, logger) {
        super(config, logger);
        this.initializeDatabaseHandlers();
    }
    async emitDatabaseEvent(event) {
        try {
            this.updateDatabaseMetrics(event);
            const enrichedEvent = {
                ...event,
                metadata: {
                    ...event.metadata,
                    timestamp: new Date(),
                    processingTime: Date.now(),
                    database: event.database || 'default',
                    connectionId: event.data?.connectionId,
                },
            };
            await this.emit(enrichedEvent);
            await this.routeDatabaseEvent(enrichedEvent);
            this.logger.debug(`Database event emitted: ${event.operation} on ${event.database}/${event.table}`);
        }
        catch (error) {
            this.databaseMetrics.failedQueries++;
            this.logger.error('Failed to emit database event:', error);
            throw error;
        }
    }
    subscribeQueryEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.query.set(subscriptionId, listener);
        this.logger.debug(`Query event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeTransactionEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.transaction.set(subscriptionId, listener);
        this.logger.debug(`Transaction event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeConnectionEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.connection.set(subscriptionId, listener);
        this.logger.debug(`Connection event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeMigrationEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.migration.set(subscriptionId, listener);
        this.logger.debug(`Migration event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribePerformanceEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.performance.set(subscriptionId, listener);
        this.logger.debug(`Performance event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    async getDatabaseMetrics() {
        const errorRate = this.databaseMetrics.totalQueries > 0
            ? this.databaseMetrics.failedQueries / this.databaseMetrics.totalQueries
            : 0;
        const rollbackRate = this.databaseMetrics.totalTransactions > 0
            ? this.databaseMetrics.rollbackCount /
                this.databaseMetrics.totalTransactions
            : 0;
        this.updatePerformanceStats();
        return {
            activeConnections: this.databaseMetrics.activeConnections,
            queryCount: this.databaseMetrics.totalQueries,
            averageQueryTime: this.databaseMetrics.performanceStats.averageQueryTime,
            errorRate,
            transactionStats: {
                total: this.databaseMetrics.totalTransactions,
                rollbackRate,
            },
            performance: {
                slowQueries: this.databaseMetrics.slowQueries,
                queriesPerSecond: this.databaseMetrics.performanceStats.queriesPerSecond,
                longestQueryTime: this.databaseMetrics.performanceStats.longestQueryTime,
            },
            connectionPool: {
                active: this.databaseMetrics.connectionPoolStats.activeConnections,
                idle: this.databaseMetrics.connectionPoolStats.idleConnections,
                waiting: this.databaseMetrics.connectionPoolStats.waitingRequests,
                max: this.databaseMetrics.connectionPoolStats.maxConnections,
            },
        };
    }
    async getMetrics() {
        const baseMetrics = await super.getMetrics();
        const databaseMetrics = await this.getDatabaseMetrics();
        return {
            ...baseMetrics,
            customMetrics: {
                database: databaseMetrics,
            },
        };
    }
    async healthCheck() {
        const baseStatus = await super.healthCheck();
        const databaseMetrics = await this.getDatabaseMetrics();
        const highErrorRate = databaseMetrics.errorRate > 0.1;
        const slowQueries = databaseMetrics.performance.slowQueries > 50;
        const poolExhausted = databaseMetrics.connectionPool.waiting > 20;
        const highRollbackRate = databaseMetrics.transactionStats.rollbackRate > 0.2;
        const isHealthy = baseStatus.status === 'healthy' &&
            !highErrorRate &&
            !slowQueries &&
            !poolExhausted &&
            !highRollbackRate;
        return {
            ...baseStatus,
            status: isHealthy ? 'healthy' : 'degraded',
            metadata: {
                ...baseStatus.metadata,
                database: {
                    errorRate: databaseMetrics.errorRate,
                    averageQueryTime: databaseMetrics.averageQueryTime,
                    activeConnections: databaseMetrics.activeConnections,
                    slowQueries: databaseMetrics.performance.slowQueries,
                    rollbackRate: databaseMetrics.transactionStats.rollbackRate,
                },
            },
        };
    }
    initializeDatabaseHandlers() {
        this.logger.debug('Initializing database event handlers');
        this.subscribe([
            'database:query',
            'database:transaction',
            'database:connection',
            'database:migration',
            'database:performance',
        ], this.handleDatabaseEvent.bind(this));
    }
    async handleDatabaseEvent(event) {
        const startTime = Date.now();
        try {
            const operationType = event.type.split(':')[1];
            switch (operationType) {
                case 'query':
                    await this.notifySubscribers(this.subscriptions.query, event);
                    break;
                case 'transaction':
                    await this.notifySubscribers(this.subscriptions.transaction, event);
                    break;
                case 'connection':
                    await this.notifySubscribers(this.subscriptions.connection, event);
                    break;
                case 'migration':
                    await this.notifySubscribers(this.subscriptions.migration, event);
                    break;
                case 'performance':
                    await this.notifySubscribers(this.subscriptions.performance, event);
                    break;
                default:
                    this.logger.warn(`Unknown database operation type: ${operationType}`);
            }
            const processingTime = Date.now() - startTime;
            this.databaseMetrics.totalQueryTime += processingTime;
        }
        catch (error) {
            this.databaseMetrics.failedQueries++;
            this.logger.error('Database event handling failed:', error);
            throw error;
        }
    }
    async routeDatabaseEvent(event) {
        switch (event.operation) {
            case 'SELECT':
            case 'INSERT':
            case 'UPDATE':
            case 'DELETE':
                if (event.data?.duration && event.data.duration > 1000) {
                    this.databaseMetrics.slowQueries++;
                    this.logger.warn(`Slow query detected: ${event.data.duration}ms - ${event.data?.sql}`);
                }
                break;
            case 'BEGIN':
                this.logger.debug(`Transaction started: ${event.data?.transactionId}`);
                break;
            case 'COMMIT':
                this.logger.debug(`Transaction committed: ${event.data?.transactionId}`);
                break;
            case 'ROLLBACK':
                this.databaseMetrics.rollbackCount++;
                this.logger.debug(`Transaction rolled back: ${event.data?.transactionId}`);
                break;
            case 'CONNECT':
                this.databaseMetrics.activeConnections++;
                this.logger.debug(`Database connection established: ${event.data?.connectionId}`);
                break;
            case 'DISCONNECT':
                this.databaseMetrics.activeConnections = Math.max(0, this.databaseMetrics.activeConnections - 1);
                this.logger.debug(`Database connection closed: ${event.data?.connectionId}`);
                break;
            case 'MIGRATION':
                this.logger.info(`Database migration: ${event.data?.version} - ${event.data?.description}`);
                break;
            case 'ERROR':
                this.logger.error(`Database error: ${event.data?.error} - Query: ${event.data?.sql}`);
                break;
        }
        if (event.data?.duration) {
            if (event.data.duration >
                this.databaseMetrics.performanceStats.longestQueryTime) {
                this.databaseMetrics.performanceStats.longestQueryTime =
                    event.data.duration;
            }
        }
    }
    updateDatabaseMetrics(event) {
        const operationType = event.type.split(':')[1];
        switch (operationType) {
            case 'query':
                this.databaseMetrics.totalQueries++;
                break;
            case 'transaction':
                if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(event.operation)) {
                    this.databaseMetrics.totalTransactions++;
                }
                break;
            case 'connection':
                if (event.operation === 'CONNECT') {
                    this.databaseMetrics.totalConnections++;
                }
                break;
        }
        if (event.data?.connectionPool) {
            this.databaseMetrics.connectionPoolStats = {
                ...this.databaseMetrics.connectionPoolStats,
                ...event.data.connectionPool,
            };
        }
    }
    updatePerformanceStats() {
        const now = new Date();
        const timeDiff = (now.getTime() -
            this.databaseMetrics.performanceStats.lastCalculated.getTime()) /
            1000;
        if (timeDiff > 60) {
            this.databaseMetrics.performanceStats.queriesPerSecond =
                this.databaseMetrics.totalQueries / timeDiff;
            this.databaseMetrics.performanceStats.averageQueryTime =
                this.databaseMetrics.totalQueries > 0
                    ? this.databaseMetrics.totalQueryTime /
                        this.databaseMetrics.totalQueries
                    : 0;
            this.databaseMetrics.performanceStats.lastCalculated = now;
        }
    }
    async notifySubscribers(subscribers, event) {
        const notifications = Array.from(subscribers.values()).map(async (listener) => {
            try {
                await listener(event);
            }
            catch (error) {
                this.logger.error('Database event listener failed:', error);
            }
        });
        await Promise.allSettled(notifications);
    }
    generateSubscriptionId() {
        return `database-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
export class DatabaseEventManagerFactory {
    logger;
    config;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
        this.logger.debug('DatabaseEventManagerFactory initialized');
    }
    async create(config) {
        this.logger.info(`Creating database event manager: ${config.name}`);
        this.validateConfig(config);
        const optimizedConfig = this.applyDatabaseDefaults(config);
        const manager = new DatabaseEventManager(optimizedConfig, this.logger);
        await this.configureDatabaseManager(manager, optimizedConfig);
        this.logger.info(`Database event manager created successfully: ${config.name}`);
        return manager;
    }
    validateConfig(config) {
        if (!config.name) {
            throw new Error('Database event manager name is required');
        }
        if (config.type !== 'database') {
            throw new Error('Manager type must be "database"');
        }
        if (config.processing?.batchSize && config.processing.batchSize < 10) {
            this.logger.warn('Database batch size < 10 may be inefficient for database operations');
        }
        if (config.maxListeners && config.maxListeners < 100) {
            this.logger.warn('Database managers should support at least 100 listeners for concurrent operations');
        }
    }
    applyDatabaseDefaults(config) {
        return {
            ...config,
            maxListeners: config.maxListeners || 300,
            processing: {
                strategy: 'queued',
                timeout: 10000,
                retries: 3,
                batchSize: 100,
                ...config.processing,
            },
            persistence: {
                enabled: true,
                maxAge: 604800000,
                ...config.persistence,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 30000,
                healthCheckInterval: 120000,
                ...config.monitoring,
            },
        };
    }
    async configureDatabaseManager(manager, config) {
        if (config.monitoring?.enabled) {
            await manager.start();
            this.logger.debug(`Database event manager monitoring started: ${config.name}`);
        }
        if (config.monitoring?.healthCheckInterval) {
            setInterval(async () => {
                try {
                    const status = await manager.healthCheck();
                    if (status.status !== 'healthy') {
                        this.logger.warn(`Database manager health degraded: ${config.name}`, status.metadata);
                    }
                }
                catch (error) {
                    this.logger.error(`Database manager health check failed: ${config.name}`, error);
                }
            }, config.monitoring.healthCheckInterval);
        }
    }
}
export default DatabaseEventManagerFactory;
//# sourceMappingURL=database-event-factory.js.map