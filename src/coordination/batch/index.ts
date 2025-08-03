/**
 * @fileoverview Batch Operations Module
 * Exports all batch operation components following claude-zen patterns
 */

export { BatchEngine, createBatchOperation, createToolBatch } from './batch-engine';
export type {
  BatchOperation,
  BatchExecutionConfig,
  BatchResult,
  BatchExecutionSummary,
} from './batch-engine';

export { BatchPerformanceMonitor } from './performance-monitor';
export type {
  PerformanceMetrics,
  PerformanceComparison,
  PerformanceTrend,
} from './performance-monitor';

export { FileBatchOperator } from './file-batch';
export type {
  FileOperation,
  FileOperationResult,
} from './file-batch';

export { SwarmBatchCoordinator } from './swarm-batch';
export type {
  SwarmOperation,
  SwarmOperationResult,
  SwarmBatchConfig,
} from './swarm-batch';

/**
 * Factory function to create a complete batch system with all components
 */
export function createBatchSystem(options?: {
  batchConfig?: import('./batch-engine').BatchExecutionConfig;
  swarmConfig?: import('./swarm-batch').SwarmBatchConfig;
  maxConcurrentFiles?: number;
}) {
  const batchEngine = new BatchEngine(options?.batchConfig);
  const performanceMonitor = new BatchPerformanceMonitor();
  const fileBatchOperator = new FileBatchOperator(options?.maxConcurrentFiles);
  const swarmBatchCoordinator = new SwarmBatchCoordinator(options?.swarmConfig);

  return {
    batchEngine,
    performanceMonitor,
    fileBatchOperator,
    swarmBatchCoordinator,
    
    /**
     * Execute a complete batch workflow with performance monitoring
     */
    async executeBatchWorkflow(operations: import('./batch-engine').BatchOperation[]) {
      const startTime = Date.now();
      
      // Execute batch operations
      const summary = await batchEngine.executeBatch(operations);
      
      // Record performance metrics
      const sequentialTime = summary.totalExecutionTime * summary.speedImprovement;
      const batchMetrics = performanceMonitor.recordBatchExecution(summary);
      const sequentialMetrics = performanceMonitor.recordSequentialExecution(
        summary.totalOperations,
        sequentialTime,
        summary.successfulOperations
      );
      
      // Compare performance
      const comparison = performanceMonitor.comparePerformance(batchMetrics, sequentialMetrics);
      
      return {
        summary,
        performance: comparison,
        results: batchEngine.getResults(),
      };
    }
  };
}