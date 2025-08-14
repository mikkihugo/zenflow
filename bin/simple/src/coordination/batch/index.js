import { BatchEngine } from './batch-engine.ts';
import { FileBatchOperator } from './file-batch.ts';
import { BatchPerformanceMonitor } from './performance-monitor.ts';
import { SwarmBatchCoordinator } from './swarm-batch.ts';
export { BatchEngine, createBatchOperation, createToolBatch, } from './batch-engine.ts';
export { FileBatchOperator } from './file-batch.ts';
export { BatchPerformanceMonitor } from './performance-monitor.ts';
export { SwarmBatchCoordinator } from './swarm-batch.ts';
export function createBatchSystem(options) {
    const batchEngine = new BatchEngine(options?.['batchConfig']);
    const performanceMonitor = new BatchPerformanceMonitor();
    const fileBatchOperator = new FileBatchOperator(options?.['maxConcurrentFiles']);
    const swarmBatchCoordinator = new SwarmBatchCoordinator(options?.['swarmConfig']);
    return {
        batchEngine,
        performanceMonitor,
        fileBatchOperator,
        swarmBatchCoordinator,
        async executeBatchWorkflow(operations) {
            const summary = await batchEngine.executeBatch(operations);
            const sequentialTime = summary.totalExecutionTime * summary.speedImprovement;
            const batchMetrics = performanceMonitor.recordBatchExecution(summary);
            const sequentialMetrics = performanceMonitor.recordSequentialExecution(summary.totalOperations, sequentialTime, summary.successfulOperations);
            const comparison = performanceMonitor.comparePerformance(batchMetrics, sequentialMetrics);
            return {
                summary,
                performance: comparison,
                results: batchEngine.getResults(),
            };
        },
    };
}
//# sourceMappingURL=index.js.map