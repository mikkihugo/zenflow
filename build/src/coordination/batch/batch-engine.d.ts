/**
 * @file Claude-Zen Batch Execution Engine
 * Implementation of claude-zen's "1 MESSAGE = ALL OPERATIONS" principle.
 * Achieves 2.8-4.4x speed improvements through concurrent execution.
 */
import type { BatchExecutionSummary } from './performance-monitor.ts';
export interface BatchOperation {
    id: string;
    type: 'tool' | 'file' | 'swarm' | 'agent';
    operation: string;
    params: Record<string, unknown>;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    dependencies?: string[];
    timeout?: number;
}
export interface BatchExecutionConfig {
    maxConcurrency?: number;
    timeoutMs?: number;
    retryAttempts?: number;
    enableDependencyResolution?: boolean;
    trackPerformance?: boolean;
}
export interface BatchResult {
    operationId: string;
    success: boolean;
    result?: unknown;
    error?: string;
    executionTime: number;
    startTime: number;
    endTime: number;
}
export interface ExtendedBatchExecutionSummary extends BatchExecutionSummary {
    concurrencyAchieved: number;
    speedImprovement: number;
    tokenReduction: number;
}
/**
 * Core batch execution engine implementing claude-zen's concurrent patterns.
 * Follows the "1 MESSAGE = ALL OPERATIONS" principle for maximum efficiency.
 *
 * @example
 */
export declare class BatchEngine {
    private readonly config;
    private readonly executionQueue;
    private readonly results;
    private activeOperations;
    constructor(config?: BatchExecutionConfig);
    /**
     * Execute multiple operations concurrently following the claude-zen pattern
     * This is the core implementation of "1 MESSAGE = ALL OPERATIONS".
     *
     * @param operations.
     * @param operations
     */
    executeBatch(operations: BatchOperation[]): Promise<ExtendedBatchExecutionSummary>;
    /**
     * Execute operations with smart concurrency control and dependency resolution.
     */
    private executeWithConcurrencyControl;
    /**
     * Find operations that have all dependencies resolved.
     */
    private findReadyOperations;
    /**
     * Execute a single operation with error handling and timeout.
     *
     * @param operation
     */
    private executeOperation;
    /**
     * Execute operation based on its type.
     *
     * @param operation
     */
    private executeByType;
    /**
     * Perform the actual operation (to be extended by specific implementations).
     *
     * @param operation.
     * @param operation
     */
    private performOperation;
    /**
     * Execute tool operation (to be implemented by specific tool handlers).
     *
     * @param operation
     */
    private executeTool;
    /**
     * Execute file operation (implemented by file-batch.ts).
     *
     * @param operation
     */
    private executeFileOperation;
    /**
     * Execute swarm operation (implemented by swarm-batch.ts).
     *
     * @param operation
     */
    private executeSwarmOperation;
    /**
     * Execute agent operation.
     *
     * @param operation
     */
    private executeAgentOperation;
    /**
     * Calculate performance summary including speed improvements.
     *
     * @param totalExecutionTime
     * @param totalOperations
     */
    private calculatePerformanceSummary;
    /**
     * Get results for specific operations.
     *
     * @param operationIds
     */
    getResults(operationIds?: string[]): BatchResult[];
    /**
     * Check if batch execution is currently running.
     */
    isExecuting(): boolean;
    /**
     * Get current execution status.
     */
    getExecutionStatus(): {
        queuedOperations: number;
        activeOperations: number;
        completedOperations: number;
    };
}
/**
 * Factory function to create batch operations.
 *
 * @param id
 * @param type
 * @param operation
 * @param params
 * @param options
 * @example
 */
export declare function createBatchOperation(id: string, type: BatchOperation['type'], operation: string, params: Record<string, unknown>, options?: Partial<Pick<BatchOperation, 'priority' | 'dependencies' | 'timeout'>>): BatchOperation;
/**
 * Utility to create multiple tool operations for batch execution.
 *
 * @param tools
 * @example
 */
export declare function createToolBatch(tools: Array<{
    name: string;
    params: Record<string, unknown>;
    dependencies?: string[];
}>): BatchOperation[];
//# sourceMappingURL=batch-engine.d.ts.map