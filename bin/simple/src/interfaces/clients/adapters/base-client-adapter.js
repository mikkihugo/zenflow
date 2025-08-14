import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-clients-adapters-base-client-adapter');
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
    async getMetrics() {
        this["_metrics"]?.uptime = Date.now() - this['_startTime'];
        return { ...this['_metrics'] };
    }
    async shutdown() {
        this['_isInitialized'] = false;
        this.emit('shutdown');
    }
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
    updateMetrics(success, duration, cached = false) {
        this["_metrics"]?.totalOperations++;
        if (success) {
            this["_metrics"]?.successfulOperations++;
        }
        else {
            this["_metrics"]?.failedOperations++;
        }
        if (cached) {
            const totalCacheOps = this['_metrics']?.custom?.cacheOps || 0;
            const cacheHits = this['_metrics']?.custom?.cacheHits || 0;
            this["_metrics"]?.custom?.cacheOps = totalCacheOps + 1;
            if (cached) {
                this["_metrics"]?.custom?.cacheHits = cacheHits + 1;
            }
            this["_metrics"]?.cacheHitRatio =
                this['_metrics']?.custom?.cacheHits / this['_metrics']?.custom?.cacheOps;
        }
        const totalLatency = this['_metrics']?.averageLatency * (this['_metrics']?.totalOperations - 1);
        this["_metrics"]?.averageLatency =
            (totalLatency + duration) / this['_metrics']?.totalOperations;
        const uptimeSeconds = (Date.now() - this['_startTime']) / 1000;
        this["_metrics"]?.throughput = this['_metrics']?.totalOperations / Math.max(uptimeSeconds, 1);
    }
    generateOperationId() {
        return `${this.type}_${++this['_operationCounter']}_${Date.now()}`;
    }
    log(level, _message, _meta) {
        if (this.config.logging?.enabled) {
            const _prefix = this.config.logging.prefix || this.type;
            const shouldLog = this.shouldLog(level);
            if (shouldLog) {
            }
        }
    }
    shouldLog(level) {
        const configLevel = this.config.logging?.level || 'info';
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(configLevel);
    }
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
export class BaseClientFactory {
    type;
    clients = new Map();
    constructor(type) {
        this.type = type;
    }
    async getClient(id, config) {
        if (this.clients.has(id)) {
            return this.clients.get(id);
        }
        const client = await this.createClient(config);
        this.clients.set(id, client);
        client.once('shutdown', () => {
            this.clients.delete(id);
        });
        return client;
    }
    validateConfig(config) {
        return Boolean(config && typeof config === 'object');
    }
    getActiveClients() {
        return Array.from(this.clients.values());
    }
    async shutdownAll() {
        const shutdownPromises = Array.from(this.clients.values()).map((client) => client.shutdown().catch((error) => {
            logger.error(`Error shutting down client:`, error);
        }));
        await Promise.all(shutdownPromises);
        this.clients.clear();
    }
}
//# sourceMappingURL=base-client-adapter.js.map