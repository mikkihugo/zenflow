/**
 * @file Batch Operations Module
 * Exports all batch operation components following claude-zen patterns.
 */

// Import the actual classes for use in factory functions
import { BatchEngine } from './batch-engine';
import { FileBatchOperator } from './file-batch';
import { BatchPerformanceMonitor } from './performance-monitor';
import { SwarmBatchCoordinator } from './swarm-batch';

export type {
  BatchExecutionConfig,
  BatchOperation,
  BatchResult,
  ExtendedBatchExecutionSummary,
} from './batch-engine';
export {
  BatchEngine,
  createBatchOperation,
  createToolBatch,
} from './batch-engine';
export type { FileOperation, FileOperationResult } from './file-batch';
export { FileBatchOperator } from './file-batch';
export type {
  PerformanceComparison,
  PerformanceMetrics,
  PerformanceTrend,
} from './performance-monitor';
export { BatchPerformanceMonitor } from './performance-monitor';
export type {
  SwarmBatchConfig,
  SwarmOperation,
  SwarmOperationResult,
} from './swarm-batch';
export { SwarmBatchCoordinator } from './swarm-batch';

/**
 * Factory function to create a complete batch system with all components.
 *
 * @param options
 * @param options.batchConfig
 * @param options.swarmConfig
 * @param options.maxConcurrentFiles
 * @example
 */
export function createBatchSystem(options?: {
  batchConfig?: import('./batch-engine.ts').BatchExecutionConfig;
  swarmConfig?: import('./swarm-batch.ts').SwarmBatchConfig;
  maxConcurrentFiles?: number;
}) {
  const batchEngine = new BatchEngine(options?.['batchConfig']);
  const performanceMonitor = new BatchPerformanceMonitor();
  const fileBatchOperator = new FileBatchOperator(
    options?.['maxConcurrentFiles']
  );
  const swarmBatchCoordinator = new SwarmBatchCoordinator(
    options?.['swarmConfig']
  );

  return {
    batchEngine,
    performanceMonitor,
    fileBatchOperator,
    swarmBatchCoordinator,

    /**
     * Execute a complete batch workflow with performance monitoring.
     *
     * @param operations
     */
    async executeBatchWorkflow(
      operations: import('./batch-engine.ts').BatchOperation[]
    ) {
      // Execute batch operations
      const summary = await batchEngine.executeBatch(operations);

      // Record performance metrics
      const sequentialTime =
        summary.totalExecutionTime * summary.speedImprovement;
      const batchMetrics = performanceMonitor.recordBatchExecution(summary);
      const sequentialMetrics = performanceMonitor.recordSequentialExecution(
        summary.totalOperations,
        sequentialTime,
        summary.successfulOperations
      );

      // Compare performance
      const comparison = performanceMonitor.comparePerformance(
        batchMetrics,
        sequentialMetrics
      );

      return {
        summary,
        performance: comparison,
        results: batchEngine.getResults(),
      };
    },
  };
}
