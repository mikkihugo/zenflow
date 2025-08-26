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

// =============================================================================
// MAIN TASKMASTER API EXPORTS - SAFe 6.0 Essentials Interface
// =============================================================================


// Advanced workflow coordination (for power users)
export {
  createHighThroughputWorkflowKanban,
  createWorkflowKanban,
  WorkflowKanban,
  type WorkflowKanbanEvents,
} from './api/workflow-kanban';
// Approval gate management
export { ApprovalGateManager } from './core/approval-gate-manager';
export type { TaskMasterSystem } from './facades/taskmaster-facade';
// Main TaskMaster system (recommended for most users)
export { createTaskMaster, getTaskMaster } from './main';

// =============================================================================
// XSTATE MACHINE EXPORTS - For Advanced Integration
// =============================================================================

export {
  createConfiguredWorkflowMachine,
  createDefaultWorkflowConfig,
  createWorkflowMachine,
  WorkflowContextUtils,
  type WorkflowMachineContext,
} from './state-machines/workflow';

// =============================================================================
// COMPREHENSIVE TYPE EXPORTS - Full Domain Type System
// =============================================================================

// Core workflow types
export type {
  BottleneckReport,
  BottleneckResolution,
  BottleneckTrend,
  FlowDirection,
  // Flow metrics types
  FlowMetrics,
  FlowState,
  HealthCheckResult,
  IntelligentWIPLimits,
  KanbanOperationResult,
  OptimizationResult,
  OptimizationStrategy,
  PerformanceThreshold,
  TaskAssignment,
  // Result types
  TaskMovementResult,
  TaskPriority,
  TaskState,
  TaskStateTransition,
  TimeRange,
  // WIP management types
  WIPLimits,
  WIPViolation,
  // Bottleneck analysis types
  WorkflowBottleneck,
  WorkflowContext,
  // Event types
  WorkflowEvent,
  // Configuration types
  WorkflowKanbanConfig,
  WorkflowStatistics,
  // Task domain types
  WorkflowTask,
} from './types/index';

// Import types for runtime constants
import type {
  OptimizationStrategy,
  TaskPriority,
  TaskState,
} from './types/index';

// =============================================================================
// UTILITY EXPORTS - Library Integrations
// =============================================================================

// Immutable state utilities - Immer integration with specialized classes
export {
  ImmutableContextUtils,
  ImmutableMetricsUtils,
  ImmutableTaskUtils,
  ImmutableUtils,
  ImmutableWIPUtils,
  KanbanConfigSchema,
  TaskPrioritySchema,
  TaskStateSchema,
  ValidationUtils,
  WIPLimitsSchema,
  WorkflowTaskSchema,
} from './utilities/index';

// =============================================================================
// WORKFLOW CONSTANTS - Helper Functions and Constants
// =============================================================================

/**
 * Default task states in workflow order
 */
export const DEFAULT_WORKFLOW_STATES: TaskState[] = [
  'backlog',
  'analysis',
  'development',
  'testing',
  'review',
  'deployment',
  'done',
];

/**
 * Blocked and expedite states (special handling)
 */
export const SPECIAL_WORKFLOW_STATES: TaskState[] = ['blocked', 'expedite'];'

/**
 * All supported workflow states
 */
export const ALL_WORKFLOW_STATES: TaskState[] = [
  ...DEFAULT_WORKFLOW_STATES,
  ...SPECIAL_WORKFLOW_STATES,
];

/**
 * Task priority levels in order (highest to lowest)
 */
export const TASK_PRIORITIES: TaskPriority[] = [
  'critical',
  'high',
  'medium',
  'low',
];

/**
 * Available optimization strategies
 */
export const OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  'wip_reduction',
  'bottleneck_removal',
  'parallel_processing',
  'batch_optimization',
  'cycle_time_reduction',
];

// =============================================================================
// VALIDATION UTILITIES - Domain Validation Functions
// =============================================================================

/**
 * Validate if a state is a valid workflow state
 */
export const isValidWorkflowState = (state: string): state is TaskState => {
  return ALL_WORKFLOW_STATES.includes(state as TaskState);
};

/**
 * Validate if a priority is valid
 */
export const isValidTaskPriority = (
  priority: string
): priority is TaskPriority => {
  return TASK_PRIORITIES.includes(priority as TaskPriority);
};

/**
 * Validate if an optimization strategy is valid
 */
export const isValidOptimizationStrategy = (
  strategy: string
): strategy is OptimizationStrategy => {
  return OPTIMIZATION_STRATEGIES.includes(strategy as OptimizationStrategy);
};

/**
 * Get next state in workflow (or null if at end)
 */
export const getNextWorkflowState = (
  currentState: TaskState
): TaskState|null => {
  const currentIndex = DEFAULT_WORKFLOW_STATES.indexOf(currentState);
  if (
    currentIndex === -1||currentIndex === DEFAULT_WORKFLOW_STATES.length - 1
  ) {
    return null;
  }
  return DEFAULT_WORKFLOW_STATES[currentIndex + 1];
};

/**
 * Get previous state in workflow (or null if at beginning)
 */
export const getPreviousWorkflowState = (
  currentState: TaskState
): TaskState|null => {
  const currentIndex = DEFAULT_WORKFLOW_STATES.indexOf(currentState);
  if (currentIndex <= 0) {
    return null;
  }
  return DEFAULT_WORKFLOW_STATES[currentIndex - 1];
};

/**
 * Check if state transition is valid (follows workflow order)
 */
export const isValidStateTransition = (
  fromState: TaskState,
  toState: TaskState
): boolean => {
  // Special states can transition to any state
  if (
    SPECIAL_WORKFLOW_STATES.includes(fromState)||SPECIAL_WORKFLOW_STATES.includes(toState)
  ) {
    return true;
  }

  // Normal workflow progression
  const fromIndex = DEFAULT_WORKFLOW_STATES.indexOf(fromState);
  const toIndex = DEFAULT_WORKFLOW_STATES.indexOf(toState);

  if (fromIndex === -1||toIndex === -1) {
    return false;
  }

  // Allow forward movement, backward movement (for rework), or staying in same state
  return Math.abs(toIndex - fromIndex) <= 2||toIndex >= fromIndex;
};

// =============================================================================
// PACKAGE METADATA - Library Information
// =============================================================================

/**
 * Package metadata and feature information
 */
export const KANBAN_PACKAGE_INFO = {
  name:'@claude-zen/kanban',
  version: '1.0.0',
  description:
    'Professional workflow coordination engine with XState-powered state management',

  features: [
    'XState state management',
    'Workflow coordination API',
    'WIP limit optimization',
    'Bottleneck detection and resolution',
    'Flow metrics and performance tracking',
    'Event-driven coordination with type safety',
    'Professional error handling',
    'High-throughput configuration support',
  ],

  dependencies: [
    'xstate: State machine foundation',
    'eventemitter3: Event system',
    'immer: Immutable updates',
    'zod: Schema validation',
  ],

  useCases: [
    'Internal workflow coordination systems',
    'Queens/Commanders/Cubes orchestration',
    'Task state management and optimization',
    'Bottleneck detection and resolution',
    'Flow metrics and performance analytics',
    'Multi-agent coordination systems',
  ],

  architecture: {
    foundation: 'XState state machines + EventEmitter3 events',
    domain: 'Workflow coordination (not web UI components)',
    api: 'Clean interfaces hiding XState complexity',
    integration: 'Event system coordination for external systems',
  },
} as const;

// =============================================================================
// MIGRATION HELPERS - For Existing Flow Systems
// =============================================================================

// Legacy migration helper removed - not needed

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
