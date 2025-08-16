/**
 * @file Task coordination system.
 */
import type { FeatureDocumentEntity, TaskDocumentEntity } from '../database/entities/product-entities';
import type { AgentType } from '../types/agent-types';
import type { DatabaseSPARCBridge } from './database-sparc-bridge';
import type { SPARCSwarmCoordinator } from './swarm/core/sparc-swarm-coordinator';
export interface TaskConfig {
    description: string;
    prompt: string;
    subagent_type: AgentType;
    use_claude_subagent?: boolean;
    use_sparc_methodology?: boolean;
    domain_context?: string;
    expected_output?: string;
    tools_required?: string[];
    priority?: 'low' | 'medium' | 'high' | 'critical';
    dependencies?: string[];
    timeout_minutes?: number;
    source_document?: FeatureDocumentEntity | TaskDocumentEntity;
}
export interface TaskResult {
    success: boolean;
    output?: string;
    agent_used: string;
    execution_time_ms: number;
    tools_used: string[];
    sparc_task_id?: string;
    implementation_artifacts?: string[];
    methodology_applied?: 'direct' | 'sparc';
    error?: string;
}
/**
 * SPARC-Enhanced Task Coordinator.
 *
 * @example
 */
export declare class TaskCoordinator {
    private static instance;
    private taskHistory;
    private activeSubAgents;
    private sparcBridge?;
    private sparcSwarm?;
    static getInstance(): TaskCoordinator;
    /**
     * Initialize with SPARC integration.
     *
     * @param sparcBridge
     * @param sparcSwarm
     */
    initializeSPARCIntegration(sparcBridge: DatabaseSPARCBridge, sparcSwarm: SPARCSwarmCoordinator): Promise<void>;
    /**
     * Execute task with optimal agent selection and methodology.
     *
     * @param config
     */
    executeTask(config: TaskConfig): Promise<TaskResult>;
    /**
     * NEW: Execute task using SPARC methodology.
     *
     * @param config
     * @param startTime
     * @param _startTime
     * @param taskId
     */
    private executeWithSPARC;
    /**
     * Execute task directly (original logic).
     *
     * @param config
     * @param startTime
     * @param taskId
     */
    private executeDirectly;
    /**
     * NEW: Determine if SPARC methodology should be used.
     *
     * @param config
     */
    private shouldUseSPARC;
    /**
     * NEW: Check if document represents complex work.
     *
     * @param document
     */
    private isComplexDocument;
    /**
     * NEW: Create temporary task document for SPARC processing.
     *
     * @param config
     */
    private createTempTaskDocument;
    /**
     * NEW: Wait for SPARC completion (simplified implementation).
     *
     * @param assignmentId
     */
    private waitForSPARCCompletion;
    /**
     * Select optimal agent strategy based on task requirements.
     *
     * @param config
     */
    private selectAgentStrategy;
    /**
     * Determine if Claude Code sub-agent is optimal for this task.
     *
     * @param config
     */
    private isClaudeSubAgentOptimal;
    /**
     * Prepare execution context for agent.
     *
     * @param config
     * @param strategy
     */
    private prepareExecutionContext;
    /**
     * Execute task with selected agent.
     *
     * @param context
     */
    private executeWithAgent;
    /**
     * Generate unique task ID.
     *
     * @param config
     */
    private generateTaskId;
    /**
     * Simple hash function for task Ds.
     *
     * @param str
     */
    private simpleHash;
    /**
     * Get task execution history.
     */
    getTaskHistory(): Map<string, TaskResult>;
    /**
     * Get currently active sub-agents.
     */
    getActiveSubAgents(): string[];
    /**
     * Get performance metrics.
     */
    getPerformanceMetrics(): TaskPerformanceMetrics;
    private getMostUsedAgents;
    private getToolsUsage;
}
interface TaskPerformanceMetrics {
    total_tasks: number;
    successful_tasks: number;
    failed_tasks: number;
    success_rate: number;
    average_execution_time_ms: number;
    most_used_agents: Record<string, number>;
    tools_usage: Record<string, number>;
}
/**
 * Convenience function for quick task execution.
 *
 * @param config
 * @example
 */
export declare function executeTask(config: TaskConfig): Promise<TaskResult>;
/**
 * Batch task execution with parallel processing.
 *
 * @param configs
 * @example
 */
export declare function executeBatchTasks(configs: TaskConfig[]): Promise<TaskResult[]>;
export default TaskCoordinator;
//# sourceMappingURL=task-coordinator.d.ts.map