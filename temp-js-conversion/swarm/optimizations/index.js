"use strict";
/**
 * Swarm Optimizations
 * Export all optimization components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOptimizedSwarmStack = exports.OptimizedExecutor = exports.TTLMap = exports.CircularBuffer = exports.AsyncFileManager = exports.ClaudeConnectionPool = void 0;
var connection_pool_js_1 = require("./connection-pool.js");
Object.defineProperty(exports, "ClaudeConnectionPool", { enumerable: true, get: function () { return connection_pool_js_1.ClaudeConnectionPool; } });
var async_file_manager_js_1 = require("./async-file-manager.js");
Object.defineProperty(exports, "AsyncFileManager", { enumerable: true, get: function () { return async_file_manager_js_1.AsyncFileManager; } });
var circular_buffer_js_1 = require("./circular-buffer.js");
Object.defineProperty(exports, "CircularBuffer", { enumerable: true, get: function () { return circular_buffer_js_1.CircularBuffer; } });
var ttl_map_js_1 = require("./ttl-map.js");
Object.defineProperty(exports, "TTLMap", { enumerable: true, get: function () { return ttl_map_js_1.TTLMap; } });
var optimized_executor_js_1 = require("./optimized-executor.js");
Object.defineProperty(exports, "OptimizedExecutor", { enumerable: true, get: function () { return optimized_executor_js_1.OptimizedExecutor; } });
// Re-export commonly used together
const createOptimizedSwarmStack = (config) => {
    const connectionPool = new ClaudeConnectionPool(config?.connectionPool);
    const fileManager = new AsyncFileManager(config?.fileManager);
    const executor = new OptimizedExecutor({
        ...config?.executor,
        connectionPool: config?.connectionPool,
        fileOperations: config?.fileManager
    });
    return {
        connectionPool,
        fileManager,
        executor,
        shutdown: async () => {
            await executor.shutdown();
            await fileManager.waitForPendingOperations();
            await connectionPool.drain();
        }
    };
};
exports.createOptimizedSwarmStack = createOptimizedSwarmStack;
