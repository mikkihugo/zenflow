/**
 * @file base-client adapter implementation
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-clients-adapters-base-client-adapter');
/**
 * Universal Abstraction and Client Layer (UACL) Base Adapter.
 *
 * Provides the foundational interfaces and patterns for all client adapters.
 * Following UACL architecture for consistent client management across the system.
 */
import { EventEmitter } from 'node:events';
/**
 * Base Client Adapter.
 *
 * Abstract base class that provides common functionality for all client adapters.
 * Implements the IClient interface with shared behavior.
 *
 * @example
 */
export class BaseClientAdapter extends EventEmitter {
    config;
    type;
    version;
    _isInitialized = false;
    _metrics;
    _startTime;
    _operationCounter = 0;
    constructor(config, type, version = '1.0.0') {
        super();
        this.config = config;
        this.type = type;
        this.version = version;
        this['_startTime'] = Date.now();
        this['_metrics'] = this.initializeMetrics();
    }
    get isInitialized() {
        return this['_isInitialized'];
    }
    /**
     * Check client health.
     */
    async healthCheck() {
        return {
            status: this['_isInitialized'] ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            components: {
                connectivity: {
                    status: this['_isInitialized'] ? 'healthy' : 'unhealthy',
                    message: this['_isInitialized'] ? 'Client initialized' : 'Client not initialized',
                },
                performance: {
                    status: this['_metrics']?.averageLatency < 5000 ? 'healthy' : 'degraded',
                    message: `Average latency: ${this['_metrics']?.averageLatency}ms`,
                },
            },
            metrics: {
                uptime: Date.now() - this['_startTime'],
                errorRate: this['_metrics']?.totalOperations > 0
                    ? this['_metrics']?.failedOperations / this['_metrics']?.totalOperations
                    : 0,
                averageLatency: this['_metrics']?.averageLatency,
                throughput: this['_metrics']?.throughput,
            },
        };
    }
    /**
     * Get client metrics.
     */
    async getMetrics() {
        this["_metrics"]?.uptime = Date.now() - this['_startTime'];
        return { ...this['_metrics'] };
    }
    /**
     * Shutdown the client.
     */
    async shutdown() {
        this['_isInitialized'] = false;
        this.emit('shutdown');
    }
    /**
     * Create a standardized client result.
     *
     * @param operationId
     * @param success
     * @param data
     * @param error
     * @param error.code
     * @param error.message
     * @param error.details
     * @param metadata
     */
    createResult(operationId, success, data, error, metadata = {}) {
        return {
            operationId,
            success,
            data,
            error,
            metadata: {
                duration: Date.now() - this['_startTime'],
                timestamp: new Date().toISOString(),
                ...metadata,
            },
        };
    }
    /**
     * Update metrics after an operation.
     *
     * @param success
     * @param duration
     * @param cached
     */
    updateMetrics(success, duration, cached = false) {
        this["_metrics"]?.totalOperations++;
        if (success) {
            this["_metrics"]?.successfulOperations++;
        }
        else {
            this["_metrics"]?.failedOperations++;
        }
        if (cached) {
            // Update cache hit ratio
            const totalCacheOps = this['_metrics']?.custom?.cacheOps || 0;
            const cacheHits = this['_metrics']?.custom?.cacheHits || 0;
            this["_metrics"]?.custom?.cacheOps = totalCacheOps + 1;
            if (cached) {
                this["_metrics"]?.custom?.cacheHits = cacheHits + 1;
            }
            this["_metrics"]?.cacheHitRatio =
                this['_metrics']?.custom?.cacheHits / this['_metrics']?.custom?.cacheOps;
        }
        // Update average latency
        const totalLatency = this['_metrics']?.averageLatency * (this['_metrics']?.totalOperations - 1);
        this["_metrics"]?.averageLatency =
            (totalLatency + duration) / this['_metrics']?.totalOperations;
        // Calculate throughput (operations per second over last minute)
        const uptimeSeconds = (Date.now() - this['_startTime']) / 1000;
        this["_metrics"]?.throughput = this['_metrics']?.totalOperations / Math.max(uptimeSeconds, 1);
    }
    /**
     * Generate a unique operation ID.
     */
    generateOperationId() {
        return `${this.type}_${++this['_operationCounter']}_${Date.now()}`;
    }
    /**
     * Log an operation (if logging is enabled)
     *
     * @param level
     * @param message
     * @param meta
     * @param _message
     * @param _meta.
     */
    log(level, _message, _meta) {
        if (this.config.logging?.enabled) {
            const _prefix = this.config.logging.prefix || this.type;
            const shouldLog = this.shouldLog(level);
            if (shouldLog) {
            }
        }
    }
    /**
     * Check if log level should be output.
     *
     * @param level
     */
    shouldLog(level) {
        const configLevel = this.config.logging?.level || 'info';
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(configLevel);
    }
    /**
     * Initialize default metrics.
     */
    initializeMetrics() {
        return {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            cacheHitRatio: 0,
            averageLatency: 0,
            throughput: 0,
            concurrentOperations: 0,
            uptime: 0,
            custom: {},
        };
    }
}
/**
 * Base Client Factory.
 *
 * Abstract base class for client factories that provides common functionality.
 * and lifecycle management.
 *
 * @example
 */
export class BaseClientFactory {
    type;
    clients = new Map();
    constructor(type) {
        this.type = type;
    }
    /**
     * Get or create a cached client instance.
     *
     * @param id
     * @param config
     */
    async getClient(id, config) {
        if (this.clients.has(id)) {
            return this.clients.get(id);
        }
        const client = await this.createClient(config);
        this.clients.set(id, client);
        // Clean up when client shuts down
        client.once('shutdown', () => {
            this.clients.delete(id);
        });
        return client;
    }
    /**
     * Validate client configuration (default implementation)
     *
     * @param config.
     */
    validateConfig(config) {
        return Boolean(config && typeof config === 'object');
    }
    /**
     * Get all active client instances.
     */
    getActiveClients() {
        return Array.from(this.clients.values());
    }
    /**
     * Shutdown all clients managed by this factory.
     */
    async shutdownAll() {
        const shutdownPromises = Array.from(this.clients.values()).map((client) => client.shutdown().catch((error) => {
            logger.error(`Error shutting down client:`, error);
        }));
        await Promise.all(shutdownPromises);
        this.clients.clear();
    }
}
