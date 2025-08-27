/**
 * @fileoverview TaskMaster - SAFe 6.0 Essentials Workflow Engine
 *
 * Complete SAFe 6.0 Essentials implementation with XState workflow management,
 * PI Planning coordination, approval gates, and real-time flow metrics.
 *
 * **SAFe 6.0 ESSENTIALS FEATURES:**
 * - PI Planning event coordination and facilitation
 * - ART sync and system demo orchestration
 * - Inspect & Adapt workflow automation
 * - Approval gate management with SOC2 compliance
 * - Real-time flow metrics and bottleneck detection
 * - Database integration with migration schemas
 * - Web dashboard integration for live SAFe metrics
 *
 * **BATTLE-TESTED FOUNDATION:**
 * - XState 5.20.2 state machines for reliable workflow management
 * - Database integration using existing migration schemas
 * - Strategic facade integration for main app connectivity
 * - Event-driven coordination with comprehensive type safety
 *
 * **INTEGRATION POINTS:**
 * - Main App: Via claude-code-zen-server using strategic facades
 * - Web Dashboard: Real-time SAFe metrics and role-based UI
 * - Database: Uses existing tasks table and approval gate schemas
 *
 * @example SAFe 6.0 Workflow Management
 * ```typescript`
 * import { getTaskMaster } from '@claude-zen/taskmaster';
 *
 * // Get TaskMaster system for SAFe workflow
 * const taskMaster = await getTaskMaster();
 * await taskMaster.initialize();
 *
 * // Create SAFe user story
 * const story = await taskMaster.createTask({
 *   title: 'As a user, I want to toggle features',
 *   priority: 'high',
 *   estimatedEffort: 13 // Story points
 * });
 *
 * // Move through SAFe workflow states
 * await taskMaster.moveTask(story.id, 'analysis');    // Backlog refinement'
 * await taskMaster.moveTask(story.id, 'development'); // Sprint execution'
 * await taskMaster.moveTask(story.id, 'testing');     // QA validation'
 * await taskMaster.moveTask(story.id, 'done');        // Definition of done'
 *
 * // Create PI Planning event
 * const piEvent = await taskMaster.createPIPlanningEvent({
 *   planningIntervalNumber: 2024.3,
 *   artId: 'platform-train',
 *   startDate: new Date(),
 *   endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
 *   facilitator: 'rte-user-id''
 * });
 *
 * // Monitor SAFe flow health
 * const metrics = await taskMaster.getFlowMetrics();
 * const health = await taskMaster.getSystemHealth();
 * ````
 *
 * @example High-Throughput Configuration
 * ```typescript`
 * import { createTaskFlowController } from '@claude-zen/taskmaster';
 *
 * const kanban = createHighThroughputWorkflowKanban(eventBus);
 * await kanban.initialize();
 *
 * // Optimized for high-volume workflow coordination
 * // with reduced monitoring intervals and increased limits
 * ````
 *
 * @example Event-Driven Integration
 * ```typescript`
 * import { WorkflowKanban } from '@claude-zen/taskmaster';
 * import type { TypeSafeEventBus } from '@claude-zen/event-system';
 *
 * const kanban = new WorkflowKanban(config, eventBus);
 *
 * // Listen to workflow events
 * kanban.on('task:created', (task) => {'
 *   console.log('New task created:', task.title);'
 * });
 *
 * kanban.on('bottleneck:detected', (bottleneck) => {'
 *   console.log('Bottleneck detected:', bottleneck.state);'
 * });
 *
 * kanban.on('wip:exceeded', (state, count, limit) => {'
 *   console.log(`WIP exceeded in ${state}: ${count}/${limit}`);`
 * });
 * ````
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 *
 * @requires xstate - Battle-tested state machine foundation
 * @requires eventemitter3 - High-performance event system
 * @requires @claude-zen/foundation - Logging and utilities
 * @requires @claude-zen/event-system - Type-safe event coordination
 */
export { createHighThroughputWorkflowKanban, createWorkflowKanban, WorkflowKanban, type WorkflowKanbanEvents, } from './api/workflow-kanban';
export { ApprovalGateManager } from './core/approval-gate-manager';
export type { TaskMasterSystem } from './facades/taskmaster-facade';
export { createTaskMaster, getTaskMaster } from './main';
export { createConfiguredWorkflowMachine, createDefaultWorkflowConfig, createWorkflowMachine, WorkflowContextUtils, type WorkflowMachineContext, } from './state-machines/workflow';
export type { BottleneckReport, BottleneckResolution, BottleneckTrend, FlowDirection, FlowMetrics, FlowState, HealthCheckResult, IntelligentWIPLimits, KanbanOperationResult, OptimizationResult, OptimizationStrategy, PerformanceThreshold, TaskAssignment, TaskMovementResult, TaskPriority, TaskState, TaskStateTransition, TimeRange, WIPLimits, WIPViolation, WorkflowBottleneck, WorkflowContext, WorkflowEvent, WorkflowKanbanConfig, WorkflowStatistics, WorkflowTask, } from './types/index';
import type { OptimizationStrategy, TaskPriority, TaskState } from './types/index';
export { ImmutableContextUtils, ImmutableMetricsUtils, ImmutableTaskUtils, ImmutableUtils, ImmutableWIPUtils, KanbanConfigSchema, TaskPrioritySchema, TaskStateSchema, ValidationUtils, WIPLimitsSchema, WorkflowTaskSchema, } from './utilities/index';
/**
 * Default task states in workflow order
 */
export declare const DEFAULT_WORKFLOW_STATES: TaskState[];
/**
 * Blocked and expedite states (special handling)
 */
export declare const SPECIAL_WORKFLOW_STATES: TaskState[];
/**
 * All supported workflow states
 */
export declare const ALL_WORKFLOW_STATES: TaskState[];
/**
 * Task priority levels in order (highest to lowest)
 */
export declare const TASK_PRIORITIES: TaskPriority[];
/**
 * Available optimization strategies
 */
export declare const OPTIMIZATION_STRATEGIES: OptimizationStrategy[];
/**
 * Validate if a state is a valid workflow state
 */
export declare const isValidWorkflowState: (state: string) => state is TaskState;
/**
 * Validate if a priority is valid
 */
export declare const isValidTaskPriority: (priority: string) => priority is TaskPriority;
/**
 * Validate if an optimization strategy is valid
 */
export declare const isValidOptimizationStrategy: (strategy: string) => strategy is OptimizationStrategy;
/**
 * Get next state in workflow (or null if at end)
 */
export declare const getNextWorkflowState: (currentState: TaskState) => TaskState | null;
/**
 * Get previous state in workflow (or null if at beginning)
 */
export declare const getPreviousWorkflowState: (currentState: TaskState) => TaskState | null;
/**
 * Check if state transition is valid (follows workflow order)
 */
export declare const isValidStateTransition: (fromState: TaskState, toState: TaskState) => boolean;
/**
 * Package metadata and feature information
 */
export declare const KANBAN_PACKAGE_INFO: {
    readonly name: "@claude-zen/kanban";
    readonly version: "1.0.0";
    readonly description: "Professional workflow coordination engine with XState-powered state management";
    readonly features: readonly ["XState state management", "Workflow coordination API", "WIP limit optimization", "Bottleneck detection and resolution", "Flow metrics and performance tracking", "Event-driven coordination with type safety", "Professional error handling", "High-throughput configuration support"];
    readonly dependencies: readonly ["xstate: State machine foundation", "eventemitter3: Event system", "immer: Immutable updates", "zod: Schema validation"];
    readonly useCases: readonly ["Internal workflow coordination systems", "Queens/Commanders/Cubes orchestration", "Task state management and optimization", "Bottleneck detection and resolution", "Flow metrics and performance analytics", "Multi-agent coordination systems"];
    readonly architecture: {
        readonly foundation: "XState state machines + EventEmitter3 events";
        readonly domain: "Workflow coordination (not web UI components)";
        readonly api: "Clean interfaces hiding XState complexity";
        readonly integration: "Event system coordination for external systems";
    };
};
/**
 * MIGRATION COMPLETE - READY FOR PRODUCTION USE
 *
 * This @claude-zen/kanban package provides a complete replacement for
 * custom flow management systems with:
 *
 * - XState state management
 * - Workflow coordination API
 * - WIP optimization and bottleneck detection
 * - Professional error handling
 * - Event-driven coordination for external system integration
 * - High-throughput configuration
 *
 * Replace existing flow-manager.ts (1,641 lines) with this solution.
 */
//# sourceMappingURL=index.d.ts.map