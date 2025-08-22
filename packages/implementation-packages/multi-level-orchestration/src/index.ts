/**
 * @fileoverview Multi-Level Orchestration Package
 *
 * Comprehensive orchestration system providing Portfolio → Program → Swarm execution
 * coordination with intelligent WIP management, flow optimization, and cross-level dependency management.
 */

// ============================================================================
// TYPES - Core orchestration type definitions
// ============================================================================
export type {
  // Core types
  OrchestrationLevel,
  WIPLimits,
  FlowMetrics,
  BottleneckInfo,
  WorkflowStream,
  StreamStatus,
  StreamMetrics,
  StreamConfiguration,

  // Work item types
  PortfolioItem,
  ProgramItem,
  SwarmExecutionItem,
  SuccessMetric,
  TechnicalSpecification,
  CodeArtifact,
  QualityGate,
  QualityGateResult,

  // Coordination types
  CrossLevelDependency,
  OptimizationRecommendation,
  MultiLevelOrchestratorState,
  SystemPerformanceMetrics,

  // SPARC integration
  SPARCPhase,
  SPARCProjectRef,
} from './types';

// ============================================================================
// EVENTS - Event system integration
// ============================================================================
export type {
  OrchestrationEvent,
  StreamStatusChangedEvent,
  WIPLimitExceededEvent,
  OrchestrationEventType,
} from './events/orchestration-events';

export { isStreamEvent } from './events/orchestration-events';

// ============================================================================
// ORCHESTRATORS - Core orchestration engines
// ============================================================================

// Production Multi-Level Orchestration Manager
export { MultiLevelOrchestrationManager } from './core/multi-level-orchestration-manager';

// Export additional types from the production manager (not duplicating existing types)
export type {
  WIPStatus,
  WIPViolation,
  LevelTransition,
  MultiLevelOrchestrationConfig,
  LevelTransitionConfig,
  TransitionTrigger,
  TransitionCriterion,
  OrchestrationResult,
  OrchestrationError,
  OrchestrationWarning,
  ExecutionPlan,
  ExecutionPhase,
} from './core/multi-level-orchestration-manager';

/**
 * Legacy alias for compatibility - use MultiLevelOrchestrationManager instead
 */
export class MultiLevelOrchestrator {
  public readonly id: string;

  constructor(config: { wipLimits: WIPLimits }) {
    this.id = `orchestrator-${Date.now()}`;
    console.warn(
      'MultiLevelOrchestrator is deprecated. Use MultiLevelOrchestrationManager instead.'
    );
  }

  async initialize(): Promise<void> {
    // Implementation to be added
  }
}

// ============================================================================
// UTILITIES AND FACTORIES
// ============================================================================

/**
 * Create a multi-level orchestration system
 */
export function createMultiLevelOrchestration(config: {
  wipLimits: WIPLimits;
  enableOptimization?: boolean;
  enableMetrics?: boolean;
}) {
  // Import locally to avoid circular dependency
  const {
    MultiLevelOrchestrationManager,
  } = require('./core/multi-level-orchestration-manager');
  return new MultiLevelOrchestrationManager(config);
}

// Re-export types from events
import type { WIPLimits } from './types';
