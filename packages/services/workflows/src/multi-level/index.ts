/**
 * @fileoverview Multi-Level Orchestration - Integrated with Workflows
 *
 * Consolidated multi-level orchestration functionality that was previously
 * in a separate package. Now integrated directly with the workflows system
 * for unified orchestration capabilities.
 */

// Export types
export type {
  OrchestrationLevel,
  WIPLimits,
  FlowMetrics,
  BottleneckInfo,
  StreamStatus,
  StreamMetrics,
  StreamConfiguration,
  WorkflowStream,
  PortfolioItem,
  ProgramItem,
  SwarmExecutionItem,
  SuccessMetric,
  TechnicalSpecification,
  CodeArtifact,
  QualityGate,
  QualityGateResult,
  CrossLevelDependency,
  OptimizationRecommendation,
  MultiLevelOrchestratorState,
  SystemPerformanceMetrics,
  SPARCPhase,
  SPARCProjectRef,
} from './types';

// Export enums
export { OrchestrationLevel, SPARCPhase } from './types';