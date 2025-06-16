/**
 * Swarm Optimizations
 * Export all optimization components
 */

export { ClaudeConnectionPool } from './connection-pool.ts';
export type { PoolConfig, PooledConnection } from './connection-pool.ts';

export { AsyncFileManager } from './async-file-manager.ts';
export type { FileOperationResult } from './async-file-manager.ts';

export { CircularBuffer } from './circular-buffer.ts';

export { TTLMap } from './ttl-map.ts';
export type { TTLMapOptions } from './ttl-map.ts';

export { OptimizedExecutor } from './optimized-executor.ts';
export type { ExecutorConfig, ExecutionMetrics } from './optimized-executor.ts';

// Re-export commonly used together
export const createOptimizedSwarmStack = (config?: {
  connectionPool?: any;
  executor?: any;
  fileManager?: any;
}) => {
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