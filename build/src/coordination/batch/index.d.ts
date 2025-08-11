/**
 * @file Batch Operations Module
 * Exports all batch operation components following claude-zen patterns.
 */
import { BatchEngine } from './batch-engine.ts';
import { FileBatchOperator } from './file-batch.ts';
import { BatchPerformanceMonitor } from './performance-monitor.ts';
import { SwarmBatchCoordinator } from './swarm-batch.ts';
export type { BatchExecutionConfig, BatchOperation, BatchResult, ExtendedBatchExecutionSummary, } from './batch-engine.ts';
export { BatchEngine, createBatchOperation, createToolBatch } from './batch-engine.ts';
export type { FileOperation, FileOperationResult } from './file-batch.ts';
export { FileBatchOperator } from './file-batch.ts';
export type { PerformanceComparison, PerformanceMetrics, PerformanceTrend, } from './performance-monitor.ts';
export { BatchPerformanceMonitor } from './performance-monitor.ts';
export type { SwarmBatchConfig, SwarmOperation, SwarmOperationResult } from './swarm-batch.ts';
export { SwarmBatchCoordinator } from './swarm-batch.ts';
/**
 * Factory function to create a complete batch system with all components.
 *
 * @param options
 * @param options.batchConfig
 * @param options.swarmConfig
 * @param options.maxConcurrentFiles
 * @example
 */
export declare function createBatchSystem(options?: {
    batchConfig?: import('./batch-engine.ts').BatchExecutionConfig;
    swarmConfig?: import('./swarm-batch.ts').SwarmBatchConfig;
    maxConcurrentFiles?: number;
}): {
    batchEngine: BatchEngine;
    performanceMonitor: BatchPerformanceMonitor;
    fileBatchOperator: FileBatchOperator;
    swarmBatchCoordinator: SwarmBatchCoordinator;
    /**
     * Execute a complete batch workflow with performance monitoring.
     *
     * @param operations
     */
    executeBatchWorkflow(operations: import("./batch-engine.ts").BatchOperation[]): Promise<{
        summary: import("./batch-engine.ts").ExtendedBatchExecutionSummary;
        performance: import("./performance-monitor.ts").PerformanceComparison;
        results: import("./batch-engine.ts").BatchResult[];
    }>;
};
//# sourceMappingURL=index.d.ts.map