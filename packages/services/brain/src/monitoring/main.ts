/**
 * @fileoverview Agent Monitoring Package - Core Monitoring Primitives
 *
 * Simplified agent monitoring package focused on core monitoring primitives.
 * Business logic and complex intelligence features should be implemented in the main application.
 *
 * Key Features:
 * - Tree-shakable exports for optimal bundle size
 * - Professional naming conventions
 * - Core monitoring interfaces and basic implementations
 * - Foundation dependencies for logging and storage
 *
 * @example Importing core components
 * ```typescript`
 * import { CompleteIntelligenceSystem, ITaskPredictor} from '@claude-zen/agent-monitoring';
 * import { SimpleTaskPredictor} from '@claude-zen/agent-monitoring`;
 * ````
 *
 * @author Claude Code Zen Team - Intelligence Integration
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

// =============================================================================
// FACTORY FUNCTIONS - Quick setup methods
// =============================================================================
export {
  createBasicIntelligenceSystem,
  createIntelligenceSystem,
  createProductionIntelligenceSystem,
} from './intelligence-factory';
// =============================================================================
// PRIMARY INTELLIGENCE SYSTEM - Main implementation
// =============================================================================
export { CompleteIntelligenceSystem } from './intelligence-system';
export type {
  PerformanceSnapshot,
  PerformanceStats,
  PerformanceTrackerConfig,
  PerformanceTrackingResult,
} from './performance-tracker';
// =============================================================================
// PERFORMANCE TRACKING - Replaces Hook System Performance Tracking
// =============================================================================
export {
  createPerformanceTracker,
  DEFAULT_PERFORMANCE_CONFIG,
  getGlobalPerformanceTracker,
  PerformanceTracker,
  withPerformanceTracking,
} from './performance-tracker';
export type { TaskPredictor } from './task-predictor';
// =============================================================================
// TASK PREDICTION - Core Monitoring Primitives
// =============================================================================
export {
  createTaskPredictor,
  DEFAULT_TASK_PREDICTOR_CONFIG,
  getPredictionSummary,
  isHighConfidencePrediction,
  SimpleTaskPredictor,
} from './task-predictor';
// =============================================================================
// TYPE DEFINITIONS - All monitoring types (tree-shakable)
// =============================================================================
// =============================================================================
// CONVENIENCE EXPORTS - Re-export commonly used types
// =============================================================================
export type {
  AdaptiveLearningUpdate,
  AgentCapabilities,
  // Health and Learning Types
  AgentHealth,
  AgentHealth as Health,
  // Core Agent Types
  AgentId,
  AgentLearningState,
  AgentMetrics,
  AgentType,
  EmergentBehavior,
  EmergentBehaviorPrediction,
  ForecastHorizon,
  HealthStatus,
  HealthStatusType,
  HealthThresholds,
  // Intelligence Types
  IntelligenceMetrics,
  // Intelligence System Types
  IntelligenceSystem,
  IntelligenceSystemConfig,
  IntelligenceSystemConfig as Config,
  KnowledgeTransferPrediction,
  // Learning Types
  LearningConfiguration,
  MonitoringConfig,
  MonitoringEvent,
  MonitoringEventType,
  MultiHorizonTaskPrediction,
  PerformanceEntry,
  // Performance Types
  PerformanceHistory,
  PerformanceOptimizationForecast,
  PredictionFactor,
  // Prediction Types
  PredictionRequest,
  PredictionResult,
  ResourceUsage,
  SwarmId,
  // System Types
  SystemHealthSummary,
  SystemHealthSummary as SystemHealth,
  TaskCompletionRecord,
  // Task Prediction Types
  TaskPrediction,
  TaskPrediction as Prediction,
  TaskPredictorConfig,
  TrendType,
} from './types';

// =============================================================================
// DEFAULT CONFIGURATIONS - For easy setup
// =============================================================================
// DEFAULT_TASK_PREDICTOR_CONFIG already exported above

/**
 * Package metadata and version information
 */
export const PACKAGE_INFO = {
  name: '@claude-zen/agent-monitoring',
  version: '1.0.0',
  description: 'Core agent monitoring primitives for Claude Code Zen',
  features: [
    'Basic task prediction interfaces',
    'Simple intelligence system implementations',
    'Core monitoring types and configurations',
    'Foundation logging and storage integration',
    'Tree-shakable exports for optimal bundles',
  ],
} as const;
