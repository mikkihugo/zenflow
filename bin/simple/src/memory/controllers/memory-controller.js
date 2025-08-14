var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { inject, injectable } from '../di/decorators/injectable';
import { CORE_TOKENS, MEMORY_TOKENS } from '../di/tokens/core-tokens';
let MemoryController = class MemoryController {
    _factory;
    _config;
    _logger;
    backend;
    performanceMetrics = {
        operationCount: 0,
        totalResponseTime: 0,
        errorCount: 0,
        startTime: Date.now(),
    };
    constructor(_factory, _config, _logger) {
        this._factory = _factory;
        this._config = _config;
        this._logger = _logger;
        this.initializeBackend();
    }
    async getMemoryStatus() {
        const startTime = Date.now();
        try {
            this._logger.debug('Getting memory system status');
            const [size, isHealthy] = await Promise.all([this.backend.size(), this.backend.health()]);
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            return {
                success: true,
                data: {
                    status: isHealthy ? 'healthy' : 'unhealthy',
                    totalKeys: size,
                    backend: this._config.type,
                    uptime: Math.floor((Date.now() - this.performanceMetrics.startTime) / 1000),
                    configuration: {
                        type: this._config.type,
                        maxSize: this._config.maxSize || -1,
                        ttl: this._config.ttl || 0,
                        compression: this._config.compression,
                    },
                },
                metadata: {
                    size,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to get memory status: ${error}`);
            return {
                success: false,
                error: `Failed to get memory status: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    size: 0,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
    }
    async storeMemory(request) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Storing memory key: ${request.key}`);
            if (!request.key) {
                throw new Error('Key is required for store operation');
            }
            if (request.value === undefined) {
                throw new Error('Value is required for store operation');
            }
            const processedValue = this.processValueForStorage(request.value, request.options);
            await this.backend.store(request.key, processedValue);
            const size = await this.backend.size();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this._logger.debug(`Successfully stored key: ${request.key}`);
            return {
                success: true,
                data: {
                    key: request.key,
                    stored: true,
                    compressed: request.options?.compress,
                    ttl: request.options?.ttl || 0,
                },
                metadata: {
                    size,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to store memory key ${request.key}: ${error}`);
            return {
                success: false,
                error: `Failed to store memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    size: 0,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
    }
    async retrieveMemory(key) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Retrieving memory key: ${key}`);
            if (!key) {
                throw new Error('Key is required for retrieve operation');
            }
            const rawValue = await this.backend.retrieve(key);
            const processedValue = this.processValueFromStorage(rawValue);
            const size = await this.backend.size();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this._logger.debug(`Successfully retrieved key: ${key}`);
            return {
                success: true,
                data: {
                    key,
                    value: processedValue?.value,
                    exists: rawValue !== undefined,
                    metadata: processedValue?.metadata || {},
                    retrieved: true,
                },
                metadata: {
                    size,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to retrieve memory key ${key}: ${error}`);
            return {
                success: false,
                error: `Failed to retrieve memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    size: 0,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
    }
    async deleteMemory(key) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Deleting memory key: ${key}`);
            if (!key) {
                throw new Error('Key is required for delete operation');
            }
            await this.backend.delete(key);
            const size = await this.backend.size();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this._logger.debug(`Successfully deleted key: ${key}`);
            return {
                success: true,
                data: {
                    key,
                    deleted: true,
                },
                metadata: {
                    size,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to delete memory key ${key}: ${error}`);
            return {
                success: false,
                error: `Failed to delete memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    size: 0,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
    }
    async clearMemory() {
        const startTime = Date.now();
        try {
            this._logger.info('Clearing all memory data');
            await this.backend.clear();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this._logger.info('Successfully cleared all memory data');
            return {
                success: true,
                data: {
                    cleared: true,
                    totalKeys: 0,
                },
                metadata: {
                    size: 0,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to clear memory: ${error}`);
            return {
                success: false,
                error: `Failed to clear memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    size: 0,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
    }
    async batchOperations(request) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Executing batch operations: ${request.operations.length} operations`);
            const results = [];
            let errorCount = 0;
            for (const operation of request.operations) {
                try {
                    let result;
                    switch (operation.type) {
                        case 'store':
                            result = await this.storeMemory({
                                key: operation.key,
                                value: operation.value,
                                options: operation.options,
                            });
                            break;
                        case 'retrieve':
                            result = await this.retrieveMemory(operation.key);
                            break;
                        case 'delete':
                            result = await this.deleteMemory(operation.key);
                            break;
                        default:
                            throw new Error(`Unsupported operation type: ${operation.type}`);
                    }
                    results.push({
                        operation: operation.type,
                        key: operation.key,
                        success: result?.success,
                        data: result?.data,
                        error: result?.error,
                    });
                    if (!result?.success) {
                        errorCount++;
                        if (!request.continueOnError) {
                            break;
                        }
                    }
                }
                catch (error) {
                    errorCount++;
                    results.push({
                        operation: operation.type,
                        key: operation.key,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    if (!request.continueOnError) {
                        break;
                    }
                }
            }
            const size = await this.backend.size();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, errorCount === 0);
            this._logger.debug(`Batch operations completed: ${results.length} operations, ${errorCount} errors`);
            return {
                success: errorCount === 0,
                data: {
                    results,
                    totalOperations: request.operations.length,
                    successfulOperations: results.length - errorCount,
                    failedOperations: errorCount,
                },
                metadata: {
                    size,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Batch operations failed: ${error}`);
            return {
                success: false,
                error: `Batch operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    size: 0,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
    }
    async getMemoryAnalytics() {
        const startTime = Date.now();
        try {
            this._logger.debug('Getting memory analytics');
            const size = await this.backend.size();
            const isHealthy = await this.backend.health();
            const analytics = {
                totalKeys: size,
                backend: this._config.type,
                performance: {
                    averageResponseTime: this.performanceMetrics.operationCount > 0
                        ? this.performanceMetrics.totalResponseTime / this.performanceMetrics.operationCount
                        : 0,
                    successRate: this.performanceMetrics.operationCount > 0
                        ? ((this.performanceMetrics.operationCount - this.performanceMetrics.errorCount) /
                            this.performanceMetrics.operationCount) *
                            100
                        : 100,
                    errorRate: this.performanceMetrics.operationCount > 0
                        ? (this.performanceMetrics.errorCount / this.performanceMetrics.operationCount) * 100
                        : 0,
                    operationsPerSecond: this.calculateOperationsPerSecond(),
                },
                usage: {
                    memoryUsed: process.memoryUsage().heapUsed,
                    maxMemory: this._config.maxSize || -1,
                    utilizationPercent: this._config.maxSize ? (size / this._config.maxSize) * 100 : 0,
                },
                health: {
                    status: isHealthy ? 'healthy' : 'critical',
                    uptime: Math.floor((Date.now() - this.performanceMetrics.startTime) / 1000),
                    lastHealthCheck: Date.now(),
                },
            };
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            return {
                success: true,
                data: analytics,
                metadata: {
                    size,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to get analytics: ${error}`);
            return {
                success: false,
                error: `Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    size: 0,
                    timestamp: Date.now(),
                    executionTime,
                    backend: this._config.type,
                },
            };
        }
    }
    initializeBackend() {
        try {
            this.backend = this._factory.createProvider(this._config);
            this._logger.info(`Memory controller initialized with ${this._config.type} backend`);
        }
        catch (error) {
            this._logger.error(`Failed to initialize memory backend: ${error}`);
            throw error;
        }
    }
    processValueForStorage(value, options) {
        const processed = {
            value,
            metadata: {
                storedAt: Date.now(),
                ttl: options?.ttl || 0,
                compressed: options?.compress,
                originalSize: 0,
                ...options?.metadata,
            },
        };
        if (options?.compress) {
            processed.metadata.originalSize = JSON.stringify(value).length;
        }
        return processed;
    }
    processValueFromStorage(rawValue) {
        if (!rawValue || typeof rawValue !== 'object') {
            return { value: rawValue, metadata: {} };
        }
        if (rawValue.metadata?.ttl && rawValue.metadata?.storedAt) {
            const now = Date.now();
            const expiration = rawValue.metadata.storedAt + rawValue.metadata.ttl;
            if (now > expiration) {
                return { value: undefined, metadata: { expired: true } };
            }
        }
        if (rawValue.metadata?.compressed) {
        }
        return rawValue;
    }
    updateMetrics(responseTime, success) {
        this.performanceMetrics.operationCount++;
        this.performanceMetrics.totalResponseTime += responseTime;
        if (!success) {
            this.performanceMetrics.errorCount++;
        }
    }
    calculateOperationsPerSecond() {
        const uptimeSeconds = (Date.now() - this.performanceMetrics.startTime) / 1000;
        return uptimeSeconds > 0 ? this.performanceMetrics.operationCount / uptimeSeconds : 0;
    }
};
MemoryController = __decorate([
    injectable,
    __param(0, inject(MEMORY_TOKENS.ProviderFactory)),
    __param(1, inject(MEMORY_TOKENS.Config)),
    __param(2, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Function, Object, Object])
], MemoryController);
export { MemoryController };
//# sourceMappingURL=memory-controller.js.map