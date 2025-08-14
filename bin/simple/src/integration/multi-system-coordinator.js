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
import { EventEmitter } from 'node:events';
import { inject } from '../di/decorators/inject.ts';
import { injectable } from '../di/decorators/injectable.ts';
import { CORE_TOKENS } from '../di/tokens/core-tokens.ts';
let MultiSystemCoordinator = class MultiSystemCoordinator extends EventEmitter {
    _logger;
    config;
    isInitialized = false;
    activeOperations = new Map();
    crossSystemCache = new Map();
    constructor(_logger, config = {}) {
        super();
        this._logger = _logger;
        this.config = config;
        this["_logger"]?.info("MultiSystemCoordinator created");
    }
    async initialize() {
        this['_logger']?.info('Initializing Multi-System Coordinator...');
        try {
            this.isInitialized = true;
            this['_logger']?.info('Multi-System Coordinator initialized successfully');
        }
        catch (error) {
            this['_logger']?.error('Failed to initialize Multi-System Coordinator', error);
            throw error;
        }
    }
    async coordinateOperation(operation, data) {
        if (!this.isInitialized) {
            throw new Error('MultiSystemCoordinator not initialized');
        }
        const operationId = `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        this.activeOperations.set(operationId, {
            operation,
            data,
            startTime: Date.now(),
        });
        try {
            this['_logger']?.debug(`Coordinating operation: ${operation}`, {
                operationId,
            });
            const result = { operationId, operation, status: 'completed', data };
            this.activeOperations.delete(operationId);
            return result;
        }
        catch (error) {
            this.activeOperations.delete(operationId);
            this['_logger']?.error(`Operation failed: ${operation}`, error);
            throw error;
        }
    }
    getStatus() {
        return {
            initialized: this.isInitialized,
            activeOperations: this.activeOperations.size,
            cacheSize: this.crossSystemCache.size,
        };
    }
    async shutdown() {
        this['_logger']?.info('Shutting down Multi-System Coordinator...');
        this.activeOperations.clear();
        this.crossSystemCache.clear();
        this.isInitialized = false;
        this['_logger']?.info('Multi-System Coordinator shutdown completed');
    }
};
MultiSystemCoordinator = __decorate([
    injectable,
    __param(0, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Object, Object])
], MultiSystemCoordinator);
export { MultiSystemCoordinator };
//# sourceMappingURL=multi-system-coordinator.js.map