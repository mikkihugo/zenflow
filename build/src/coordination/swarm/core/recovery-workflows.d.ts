/**
 * Recovery Workflows System for ZenSwarm.
 *
 * Provides comprehensive recovery workflows for different failure scenarios,
 * automatic recovery procedures, and integration with health monitoring.
 *
 * Features:
 * - Pre-defined recovery workflows for common failure types
 * - Custom workflow creation and registration
 * - Automatic triggering based on health monitor alerts
 * - Step-by-step execution with rollback capabilities
 * - Integration with MCP connection state management.
 * - Chaos engineering support for testing recovery procedures.
 */
/**
 * @file Coordination system: recovery-workflows.
 */
import { EventEmitter } from 'node:events';
interface WorkflowDefinition {
    id?: string;
    name: string;
    description?: string;
    triggers?: any[];
    steps?: any[];
    rollbackSteps?: any[];
    timeout?: number;
    maxRetries?: number;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    category?: string;
    enabled?: boolean;
    metadata?: any;
    createdAt?: Date;
}
export declare class RecoveryWorkflows extends EventEmitter {
    options: any;
    logger: any;
    workflows: Map<string, WorkflowDefinition>;
    activeRecoveries: Map<string, any>;
    recoveryHistory: Map<string, any>;
    healthMonitor: any;
    mcpTools: any;
    connectionManager: any;
    stats: any;
    constructor(options?: any);
    /**
     * Initialize recovery workflows.
     */
    initialize(): Promise<void>;
    /**
     * Register a recovery workflow.
     *
     * @param name
     * @param workflowDefinition
     */
    registerWorkflow(name: string, workflowDefinition: any): string;
    /**
     * Trigger recovery workflow.
     *
     * @param triggerSource
     * @param context
     */
    triggerRecovery(triggerSource: string, context?: any): Promise<{
        id: string;
        workflowName: string;
        workflowId: string | undefined;
        status: string;
        startTime: Date;
        endTime: Date | null;
        duration: number;
        error: string | null;
        context: any;
        steps: Array<{
            name: any;
            status: string;
            startTime: Date;
            endTime: Date | null;
            duration: number;
            error: string | null;
            result: any;
            context: any;
        }>;
        currentStep: number;
        retryCount: number;
        rollbackRequired: boolean;
    } | {
        status: string;
        triggerSource: string;
        context: any;
    }>;
    /**
     * Execute a recovery workflow.
     *
     * @param workflow
     * @param context
     */
    executeWorkflow(workflow: WorkflowDefinition, context?: any): Promise<{
        id: string;
        workflowName: string;
        workflowId: string | undefined;
        status: string;
        startTime: Date;
        endTime: Date | null;
        duration: number;
        error: string | null;
        context: any;
        steps: Array<{
            name: any;
            status: string;
            startTime: Date;
            endTime: Date | null;
            duration: number;
            error: string | null;
            result: any;
            context: any;
        }>;
        currentStep: number;
        retryCount: number;
        rollbackRequired: boolean;
    }>;
    /**
     * Execute a single workflow step.
     *
     * @param step
     * @param context
     * @param execution
     */
    executeStep(step: any, context: any, execution: any): Promise<{
        name: any;
        status: string;
        startTime: Date;
        endTime: Date | null;
        duration: number;
        error: string | null;
        result: any;
        context: any;
    }>;
    /**
     * Run the actual step function.
     *
     * @param step
     * @param context
     * @param execution
     */
    runStepFunction(step: any, context: any, execution: any): Promise<any>;
    /**
     * Execute rollback steps.
     *
     * @param workflow
     * @param execution
     * @param context
     */
    executeRollback(workflow: WorkflowDefinition, execution: any, context: any): Promise<void>;
    /**
     * Run built-in recovery actions.
     *
     * @param actionName
     * @param parameters
     * @param context
     * @param _execution
     */
    runBuiltInAction(actionName: string, parameters: any, context: any, _execution: any): Promise<{
        swarmId: string;
        restarted: boolean;
        result: any;
    } | {
        oldAgentId: string;
        newAgentId: any;
        restarted: boolean;
    } | {
        cacheType: string;
        clearedCaches: string[];
        timestamp: number;
    } | {
        connectionId: string;
        restarted: boolean;
        timestamp: number;
    } | {
        swarmId: string;
        scaledUp: number;
        newAgents: string[];
        scaledDown?: never;
        noScalingNeeded?: never;
        currentCount?: never;
    } | {
        swarmId: string;
        scaledDown: number;
        scaledUp?: never;
        newAgents?: never;
        noScalingNeeded?: never;
        currentCount?: never;
    } | {
        swarmId: string;
        noScalingNeeded: boolean;
        currentCount: any;
        scaledUp?: never;
        newAgents?: never;
        scaledDown?: never;
    } | {
        resourceType: string;
        cleanedResources: string[];
        timestamp: number;
    } | {
        networkId: string;
        reset: boolean;
        result: any;
    } | {
        action: string;
        duration: any;
        message?: never;
    } | {
        action: string;
        message: any;
        duration?: never;
    }>;
    /**
     * Find workflows that match the trigger.
     *
     * @param triggerSource
     * @param context
     */
    findMatchingWorkflows(triggerSource: string, context: any): WorkflowDefinition[];
    /**
     * Evaluate complex trigger conditions.
     *
     * @param trigger
     * @param triggerSource
     * @param context
     */
    evaluateTriggerCondition(trigger: any, triggerSource: string, context: any): boolean;
    /**
     * Cancel an active recovery.
     *
     * @param executionId
     * @param reason
     */
    cancelRecovery(executionId: string, reason?: string): Promise<void>;
    /**
     * Get recovery status.
     *
     * @param executionId
     */
    getRecoveryStatus(executionId?: string | null): any;
    /**
     * Get recovery statistics.
     */
    getRecoveryStats(): any;
    /**
     * Set integration points.
     *
     * @param healthMonitor
     */
    setHealthMonitor(healthMonitor: any): void;
    setMCPTools(mcpTools: any): void;
    setConnectionManager(connectionManager: any): void;
    /**
     * Register built-in recovery workflows.
     */
    registerBuiltInWorkflows(): void;
    /**
     * Built-in recovery action implementations.
     */
    restartSwarm(swarmId: string, _context: any): Promise<{
        swarmId: string;
        restarted: boolean;
        result: any;
    }>;
    restartAgent(agentId: string, _context: any): Promise<{
        oldAgentId: string;
        newAgentId: any;
        restarted: boolean;
    }>;
    clearCache(cacheType: string, _context: any): Promise<{
        cacheType: string;
        clearedCaches: string[];
        timestamp: number;
    }>;
    restartMCPConnection(connectionId: string, _context: any): Promise<{
        connectionId: string;
        restarted: boolean;
        timestamp: number;
    }>;
    scaleAgents(swarmId: string, targetCount: number, _context: any): Promise<{
        swarmId: string;
        scaledUp: number;
        newAgents: string[];
        scaledDown?: never;
        noScalingNeeded?: never;
        currentCount?: never;
    } | {
        swarmId: string;
        scaledDown: number;
        scaledUp?: never;
        newAgents?: never;
        noScalingNeeded?: never;
        currentCount?: never;
    } | {
        swarmId: string;
        noScalingNeeded: boolean;
        currentCount: any;
        scaledUp?: never;
        newAgents?: never;
        scaledDown?: never;
    }>;
    cleanupResources(resourceType: string, _context: any): Promise<{
        resourceType: string;
        cleanedResources: string[];
        timestamp: number;
    }>;
    resetNeuralNetwork(networkId: string, _context: any): Promise<{
        networkId: string;
        reset: boolean;
        result: any;
    }>;
    /**
     * Export recovery data for analysis.
     */
    exportRecoveryData(): {
        timestamp: Date;
        stats: any;
        workflows: {
            history: any;
            id?: string;
            name: string;
            description?: string;
            triggers?: any[];
            steps?: any[];
            rollbackSteps?: any[];
            timeout?: number;
            maxRetries?: number;
            priority?: "low" | "normal" | "high" | "critical";
            category?: string;
            enabled?: boolean;
            metadata?: any;
            createdAt?: Date;
        }[];
        activeRecoveries: any[];
    };
    /**
     * Chaos engineering - inject failures for testing.
     *
     * @param failureType
     * @param parameters
     */
    injectChaosFailure(failureType: string, parameters?: any): Promise<{
        chaosType: string;
        allocSize: any;
        duration: any;
    } | {
        chaosType: string;
        agentId: any;
    } | {
        chaosType: string;
        parameters: any;
    }>;
    simulateMemoryPressure(parameters: any): Promise<{
        chaosType: string;
        allocSize: any;
        duration: any;
    }>;
    simulateAgentFailure(parameters: any): Promise<{
        chaosType: string;
        agentId: any;
    }>;
    simulateConnectionFailure(parameters: any): Promise<{
        chaosType: string;
        parameters: any;
    }>;
    /**
     * Cleanup and shutdown.
     */
    shutdown(): Promise<void>;
}
export default RecoveryWorkflows;
//# sourceMappingURL=recovery-workflows.d.ts.map