/**
* @fileoverview Kanban Workflow Engine
*
* Core kanban workflow engine shared across coordination systems.
* Provides XState-powered workflow management with WIP limits,
* bottleneck detection, and flow metrics.
*
* **Used By: **
* - TaskMaster: Enterprise task management with human approval gates
* - SAFe: Portfolio/Program/Team flow configurations
* - Workflows: Process orchestration with flow state management
*
* **Features:**
* - XState state machines for reliable workflow coordination
* - WIP limit enforcement with intelligent optimization
* - Real-time bottleneck detection and resolution
* - Flow metrics and performance tracking
* - Event-driven coordination with type safety
* - Immutable state management with professional error handling
*
* @author Claude-Zen Team
* @since 1.0.0
* @version 1.0.0
*/
export { KanbanEngine, type WorkflowKanbanEvents } from './api/kanban-engine';
export { createConfiguredWorkflowMachine, createDefaultWorkflowConfig, createWorkflowMachine, WorkflowContextUtils, type WorkflowMachineContext } from './state-machines/index';
export type { BottleneckReport, BottleneckResolution, BottleneckTrend, FlowDirection, FlowMetrics, FlowState, HealthCheckResult, IntelligentWIPLimits, KanbanOperationResult, OptimizationResult, OptimizationStrategy, PerformanceThreshold, TaskAssignment, TaskMovementResult, TaskPriority, TaskState, TaskStateTransition, TimeRange, WIPLimits, WIPViolation, WorkflowBottleneck, WorkflowContext, WorkflowEvent, WorkflowKanbanConfig, WorkflowStatistics, WorkflowTask } from './types/index';
export { ImmutableContextUtils, ImmutableMetricsUtils, ImmutableTaskUtils, ImmutableUtils, ImmutableWIPUtils, KanbanConfigSchema, TaskPrioritySchema, TaskStateSchema, ValidationUtils, WIPLimitsSchema, WorkflowTaskSchema } from './utilities/index';
/**
 * Default task states in workflow order
 */
export declare const DEFAULT_WORKFLOW_STATES: [
  'backlog',
  'analysis'
];

/**
 * All supported workflow states
 */
export declare const ALL_WORKFLOW_STATES: [
  ...DEFAULT_WORKFLOW_STATES,
  'ready',
  'in_progress',
  'review',
  'done'
];
/**
 * Task priority levels in order (highest to lowest)
 */
export declare const TASK_PRIORITIES: [
  'critical',
  'high',
  'medium',
  'low'
];

/**
 * Available optimization strategies
 */
export declare const OPTIMIZATION_STRATEGIES: [
  'wip_reduction',
  'bottleneck_removal'
];
/**
* Validate if a state is a valid workflow state
*/
export declare const isValidWorkflowState: (state: string) => state is TaskState;
/**
* Validate if a priority is valid
*/
export declare const isValidTaskPriority: (priority: string) => priority is TaskPriority;
//# sourceMappingURL=index.d.ts.map