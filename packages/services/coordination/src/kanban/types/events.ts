/**
 * @fileoverview Kanban Events and Core Types
 *
 * Core domain types and event definitions for the kanban system.
 * These are the fundamental types that all other components depend on.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
/**
 * Task states in the workflow
 */
export type TaskState = ;
|'backlog';
|'analysis';
|'development';
|'testing';
|'review';
|'deployment';
|'done';
|'blocked';
|'expedite'/**';
 * Task priority levels
 */
export type TaskPriority ='critical' | ' high'|' medium' | ' low'/**';
 * Optimization strategies for workflow improvement
 */
export type OptimizationStrategy =;
|'wip_reduction';
|'bottleneck_removal ' | 'parallel_processing';
|'batch_optimization';
|'cycle_time_reduction'/**';
 * WIP (Work In Progress) limits for each workflow state
 */
export interface WIPLimits {
  readonly analysis: number;
  readonly development: number;
  readonly testing: number;
  readonly review: number;
  readonly deployment: number;
  readonly blocked: number;
  readonly done: number;
}
/**
 * Core workflow task
 */
export interface WorkflowTask {
  readonly id: string;
  readonly title: string;
  readonly description?:string;
  readonly state: TaskState;
  readonly priority: TaskPriority;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly startedAt?:Date;
  readonly completedAt?:Date;
  readonly assignedTo?:string;
  readonly estimatedEffort?:number;
  readonly actualEffort?:number;
  readonly dependencies?:string[];
  readonly tags?:string[];
  readonly metadata?:Record<string, any>;
}
/**
 * Workflow bottleneck information
 */
export interface WorkflowBottleneck {
  readonly id: string;
  readonly state: TaskState;
  readonly type : 'capacity' | ' process'|' dependency'  readonly severity: low' | ' medium'|' high' | ' critical'  readonly impactScore: number; // 0-1';
  readonly detectedAt: Date;
  readonly affectedTasks: string[];
  readonly estimatedDelay: number; // hours
  readonly recommendedResolution: string;
  readonly metadata?:Record<string, any>;
}
/**
 * Flow metrics for performance analysis
 */
export interface FlowMetrics {
  readonly timestamp: Date;
  readonly throughput: number; // tasks per day
  readonly averageCycleTime: number; // hours
  readonly averageLeadTime: number; // hours
  readonly flowEfficiency: number; // 0-1
  readonly predictability: number; // 0-1
  readonly qualityIndex: number; // 0-1
  readonly wipEfficiency: number; // 0-1
}
/**
 * Workflow kanban configuration
 */
export interface WorkflowKanbanConfig {
  readonly enableIntelligentWIP: boolean;
  readonly enableBottleneckDetection: boolean;
  readonly enableFlowOptimization: boolean;
  readonly enableHealthMonitoring: boolean;
  readonly enableEventSystem: boolean;
  readonly wipLimits: WIPLimits;
  readonly maxConcurrentTasks: number;
  readonly performanceTrackingEnabled: boolean;
}
/**
 * Kanban context for state machines and operations
 */
export interface KanbanContext {
  readonly taskId?:string;
  readonly currentState?:TaskState;
  readonly metadata?:Record<string, any>;
}
/**
 * Event definitions for the kanban system
 */
export interface WorkflowKanbanEvents {
  // Kanban system events;
 'kanban: initialized:  {';
    timestamp: Date;
    config: WorkflowKanbanConfig;
};
  // Task lifecycle events
 'task: created: WorkflowTask[];) 'task: updated:  {';
    taskId: string;
    changes: Partial<WorkflowTask>;
    timestamp: Date;
};
 'task: moved: [string, TaskState, TaskState];; // taskId, fromState, toState';
 'task: deleted:  {';
    taskId: string;
    timestamp: Date;
};
  // WIP management events
 'wip: limit_exceeded:  {';
    state: TaskState;
    currentCount: number;
    limit: number;
    timestamp: Date;
};
 'wip: limits_updated:  {';
    oldLimits: WIPLimits;
    newLimits: WIPLimits;
    timestamp: Date;
};
  // Bottleneck detection events
 'bottleneck: detected:  {';
    bottleneck: WorkflowBottleneck;
    timestamp: Date;
};
 'bottleneck: resolved:  {';
    bottleneckId: string;
    resolution: string;
    timestamp: Date;
};
  // Flow metrics events
 'flow: metrics_calculated:  {';
    metrics: FlowMetrics;
    timestamp: Date;
};
  // Health monitoring events
 'health: check_completed:  {';
    overallHealth: number;
    componentHealth: Record<string, number>;
    timestamp: Date;
};
  // Workflow state machine events
 'workflow: machine_created:  {';
    machineId: string;
    initialState: string;
    context: KanbanContext;
    timestamp: Date;
};
 'workflow: state_changed:  {';
    machineId: string;
    fromState: string;
    toState: string;
    eventType: string;
    context: KanbanContext;
    timestamp: Date;
};
 'workflow: machine_stopped:  {';
    machineId: string;
    finalState: string;
    context: KanbanContext;
    timestamp: Date;
};
  // Persistence events
 'persistence: task_saved:  {';
    taskId: string;
    operation : 'save' | ' update'|' delete'    timestamp: Date;;
};
 'persistence: wip_limits_saved:  {';
    limits: WIPLimits;
    timestamp: Date;
};
  // Event bus system events  
 'eventbus: initialized:  {';
    timestamp: Date;
};
}