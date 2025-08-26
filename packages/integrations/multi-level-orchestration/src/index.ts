/**
 * @fileoverview Multi-Level Orchestration Package
 *
 * Comprehensive orchestration system providing Portfolio → Program → Swarm execution
 * coordination with intelligent WIP management, flow optimization, and cross-level dependency management.
 */


// ============================================================================
// EVENTS - Event system integration
// ============================================================================
export type {
  OrchestrationEvent,
  OrchestrationEventType,
  StreamStatusChangedEvent,
  WIPLimitExceededEvent,
} from './events/orchestration-events';
export { isStreamEvent } from './events/orchestration-events';
// ============================================================================
// TYPES - Core orchestration type definitions
// ============================================================================
export type {
  BottleneckInfo,
  CodeArtifact,

  // Coordination types
  CrossLevelDependency,
  FlowMetrics,
  MultiLevelOrchestratorState,
  OptimizationRecommendation,
  // Core types
  OrchestrationLevel,

  // Work item types
  PortfolioItem,
  ProgramItem,
  QualityGate,
  QualityGateResult,

  // SPARC integration
  SPARCPhase,
  SPARCProjectRef,
  StreamConfiguration,
  StreamMetrics,
  StreamStatus,
  SuccessMetric,
  SwarmExecutionItem,
  SystemPerformanceMetrics,
  TechnicalSpecification,
  WIPLimits,
  WorkflowStream,
} from './types';

// ============================================================================
// ORCHESTRATORS - Core orchestration engines
// ============================================================================


// Export additional types from the production manager (not duplicating existing types)
export type {
  ExecutionPhase,
  ExecutionPlan,
  LevelTransition,
  LevelTransitionConfig,
  MultiLevelOrchestrationConfig,
  OrchestrationError,
  OrchestrationResult,
  OrchestrationWarning,
  TransitionCriterion,
  TransitionTrigger,
  WIPStatus,
  WIPViolation,
} from './core/multi-level-orchestration-manager';
// Production Multi-Level Orchestration Manager
export { MultiLevelOrchestrationManager } from './core/multi-level-orchestration-manager';

/**
 * Legacy alias for compatibility - use MultiLevelOrchestrationManager instead
 */
export class MultiLevelOrchestrator {
  public readonly id: string;

  constructor(_config: { wipLimits: WIPLimits }) {
    this.id = `orchestrator-${Date.now()}`;`
    console.warn(
      'MultiLevelOrchestrator is deprecated. Use MultiLevelOrchestrationManager instead.''
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
  } = require('./core/multi-level-orchestration-manager');'
  return new MultiLevelOrchestrationManager(config);
}

// Re-export types from events
import type { WIPLimits } from './types';
