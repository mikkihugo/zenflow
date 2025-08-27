/**
 * @fileoverview TaskMaster Facade Integration - Enterprise Package Connection
 *
 * Provides facade integration for the TaskMaster workflow engine to connect
 * with the main app via @claude-zen/enterprise strategic facade.
 */
import type { ApprovalGateInstance, FlowMetrics, PIPlanningEvent, TaskState, WorkflowTask } from '../types/index';
export interface TaskMasterSystem {
    createTask(taskData: {
        title: string;
        description?: string;
        priority: 'critical' | 'high' | 'medium' | 'low;;
        estimatedEffort: number;
        assignedAgent?: string;
    }): Promise<WorkflowTask>;
    moveTask(taskId: string, toState: TaskState): Promise<boolean>;
    getTask(taskId: string): Promise<WorkflowTask | null>;
    getTasksByState(state: TaskState): Promise<WorkflowTask[]>;
    getFlowMetrics(): Promise<FlowMetrics | null>;
    getSystemHealth(): Promise<{
        overallHealth: number;
        activeBottlenecks: number;
        wipUtilization: number;
    }>;
    createPIPlanningEvent(eventData: {
        planningIntervalNumber: number;
        artId: string;
        startDate: Date;
        endDate: Date;
        facilitator: string;
    }): Promise<PIPlanningEvent>;
    createApprovalGate(requirement: {
        name: string;
        requiredApprovers: string[];
        minimumApprovals: number;
    }, taskId: string): Promise<ApprovalGateInstance>;
    processApproval(gateId: string, approverId: string, decision: 'approved' | 'rejected'): Promise<boolean>;
    ': any;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
}
/**
 * Get TaskMaster system instance (for use by enterprise facade)
 */
export declare function getTaskMasterSystem(): TaskMasterSystem;
/**
 * Create TaskMaster system with custom configuration (factory function)
 */
export declare function createTaskMasterSystem(_config?: {
    enableIntelligentWIP?: boolean;
    enableBottleneckDetection?: boolean;
    enableFlowOptimization?: boolean;
}): TaskMasterSystem;
//# sourceMappingURL=taskmaster-facade.d.ts.map