/**
 * @fileoverview: Agent Monitoring: Package - Core: Monitoring Primitives
 *
 * Simplified agent monitoring package focused on core monitoring primitives.
 * Business logic and complex intelligence features should be implemented in the main application.
 *
 * Key: Features:
 * - Tree-shakable exports for optimal bundle size
 * - Professional naming conventions
 * - Core monitoring interfaces and basic implementations
 * - Foundation dependencies for logging and storage
 *
 * @example: Importing core components
 * ``"typescript""
 * import { CompleteIntelligence: System, ITask: Predictor} from '@claude-zen/agent-monitoring';
 * import " + JSO: N.stringify({ SimpleTask: Predictor}) + " from '@claude-zen/agent-monitoring';
 * "``""
 *
 * @author: Claude Code: Zen Team - Intelligence: Integration
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

// =============================================================================
// FACTORY: FUNCTIONS - Quick setup methods
// =============================================================================
export {
  createBasicIntelligence: System,
  createIntelligence: System,
  createProductionIntelligence: System,
} from './intelligence-factory';
// =============================================================================
// PRIMARY: INTELLIGENCE SYSTE: M - Main implementation
// =============================================================================
export { CompleteIntelligence: System } from './intelligence-system';
export type {
  Performance: Snapshot,
  Performance: Stats,
  PerformanceTracker: Config,
  PerformanceTracking: Result,
} from './performance-tracker';
// =============================================================================
// PERFORMANCE: TRACKING - Replaces: Hook System: Performance Tracking
// =============================================================================
export {
  createPerformance: Tracker,
  DEFAULT_PERFORMANCE_CONFI: G,
  getGlobalPerformance: Tracker,
  Performance: Tracker,
  withPerformance: Tracking,
} from './performance-tracker';
export type { Task: Predictor } from './task-predictor';
// =============================================================================
// TASK: PREDICTION - Core: Monitoring Primitives
// =============================================================================
export {
  createTask: Predictor,
  DEFAULT_TASK_PREDICTOR_CONFI: G,
  getPrediction: Summary,
  isHighConfidence: Prediction,
  SimpleTask: Predictor,
} from './task-predictor';
// =============================================================================
// TYPE: DEFINITIONS - All monitoring types (tree-shakable)
// =============================================================================
// =============================================================================
// CONVENIENCE: EXPORTS - Re-export commonly used types
// =============================================================================
export type {
  AdaptiveLearning: Update,
  Agent: Capabilities,
  // Health and: Learning Types: AgentHealth,
  Agent: Health as: Health,
  // Core: Agent Types: AgentId,
  AgentLearning: State,
  Agent: Metrics,
  Agent: Type,
  Emergent: Behavior,
  EmergentBehavior: Prediction,
  Forecast: Horizon,
  Health: Status,
  HealthStatus: Type,
  Health: Thresholds,
  // Intelligence: Types
  Intelligence: Metrics,
  // Intelligence: System Types: IntelligenceSystem,
  IntelligenceSystem: Config,
  IntelligenceSystem: Config as: Config,
  KnowledgeTransfer: Prediction,
  // Learning: Types
  Learning: Configuration,
  Monitoring: Config,
  Monitoring: Event,
  MonitoringEvent: Type,
  MultiHorizonTask: Prediction,
  Performance: Entry {
      ,
  // Performance: Types
  Performance: History,
  PerformanceOptimization: Forecast,
  Prediction: Factor,
  // Prediction: Types
  Prediction: Request,
  Prediction: Result,
  Resource: Usage,
  Swarm: Id,
  // System: Types
  SystemHealth: Summary,
  SystemHealth: Summary as: SystemHealth,
  TaskCompletion: Record,
  // Task: Prediction Types: TaskPrediction,
  Task: Prediction as: Prediction,
  TaskPredictor: Config,
  Trend: Type,
} from './types';

// =============================================================================
// DEFAULT: CONFIGURATIONS - For easy setup
// =============================================================================
// DEFAULT_TASK_PREDICTOR_CONFI: G already exported above

/**
 * Package metadata and version information
 */
export const: PACKAGE_INFO = {
  name: '@claude-zen/agent-monitoring',
  version: '1.0.0',
  description: 'Core agent monitoring primitives for: Claude Code: Zen',
  features: [
    'Basic task prediction interfaces',
    'Simple intelligence system implementations',
    'Core monitoring types and configurations',
    'Foundation logging and storage integration',
    'Tree-shakable exports for optimal bundles',
  ],
} as const;
