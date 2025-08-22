/**
 * @fileoverview Kanban Package - Workflow Coordination Engine
 *
 * Workflow coordination engine with XState state management,
 * WIP optimization, and bottleneck detection. Designed for
 * internal workflow coordination systems.
 *
 * Features:
 * - XState state management
 * - Workflow coordination API
 * - WIP limit optimization
 * - Bottleneck detection and resolution
 * - Flow metrics and performance tracking
 * - Event-driven coordination with type safety
 * - Professional error handling
 *
 * Architecture:
 * - Foundation: XState state machines + EventEmitter3 events
 * - Domain: Workflow coordination (not web UI components)
 * - API: Clean interfaces hiding XState complexity
 * - Integration: Event system coordination for external systems
 *
 * Use cases:
 * - Internal workflow coordination systems
 * - Task state management and optimization
 * - Bottleneck detection and resolution
 * - Flow metrics and performance analytics
 *
 * @example Basic Workflow Coordination
 * ```typescript
 * import { WorkflowKanban, createWorkflowKanban } from '@claude-zen/kanban';
 *
 * // Create workflow kanban engine
 * const kanban = createWorkflowKanban({
 *   enableIntelligentWIP: true,
 *   enableBottleneckDetection: true,
 *   enableFlowOptimization: true
 * });
 *
 * await kanban.initialize();
 *
 * // Create and coordinate tasks
 * const task = await kanban.createTask({
 *   title: 'Implement feature X',
 *   priority: 'high',
 *   estimatedEffort: 8
 * });
 *
 * // Move through workflow with WIP checking
 * await kanban.moveTask(task.data!.id, 'development');
 * await kanban.moveTask(task.data!.id, 'testing');
 * await kanban.moveTask(task.data!.id, 'done');
 *
 * // Monitor flow health
 * const metrics = await kanban.getFlowMetrics();
 * const bottlenecks = await kanban.detectBottlenecks();
 * const health = await kanban.getHealthStatus();
 * ```
 *
 * @example High-Throughput Configuration
 * ```typescript
 * import { createHighThroughputWorkflowKanban } from '@claude-zen/kanban';
 *
 * const kanban = createHighThroughputWorkflowKanban(eventBus);
 * await kanban.initialize();
 *
 * // Optimized for high-volume workflow coordination
 * // with reduced monitoring intervals and increased limits
 * ```
 *
 * @example Event-Driven Integration
 * ```typescript
 * import { WorkflowKanban } from '@claude-zen/kanban';
 * import type { TypeSafeEventBus } from '@claude-zen/event-system';
 *
 * const kanban = new WorkflowKanban(config, eventBus);
 *
 * // Listen to workflow events
 * kanban.on('task:created', (task) => {
 *   console.log('New task created:', task.title);
 * });
 *
 * kanban.on('bottleneck:detected', (bottleneck) => {
 *   console.log('Bottleneck detected:', bottleneck.state);
 * });
 *
 * kanban.on('wip:exceeded', (state, count, limit) => {
 *   console.log(`WIP exceeded in ${state}: ${count}/${limit}`);
 * });
 * ```
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
// MAIN API EXPORTS - Professional Workflow Coordination Interface
// =============================================================================

export {
  createHighThroughputWorkflowKanban,
  createWorkflowKanban,
  WorkflowKanban,
  type WorkflowKanbanEvents,
} from './api/workflow-kanban';

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
  WIPLimits,
  WorkflowTask,
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
export const SPECIAL_WORKFLOW_STATES: TaskState[] = ['blocked', 'expedite'];

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
