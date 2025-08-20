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
 * ```typescript
 * import { CompleteIntelligenceSystem, ITaskPredictor } from '@claude-zen/agent-monitoring';
 * import { SimpleTaskPredictor } from '@claude-zen/agent-monitoring';
 * ```
 *
 * @author Claude Code Zen Team - Intelligence Integration
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

// =============================================================================
// PRIMARY INTELLIGENCE SYSTEM - Main implementation
// =============================================================================
export { CompleteIntelligenceSystem } from './intelligence-system';

// =============================================================================
// FACTORY FUNCTIONS - Quick setup methods
// =============================================================================
export {
  createIntelligenceSystem,
  createBasicIntelligenceSystem,
  createProductionIntelligenceSystem
} from './intelligence-factory';

// =============================================================================
// TASK PREDICTION - Core Monitoring Primitives
// =============================================================================
export {
  SimpleTaskPredictor,
  createTaskPredictor,
  isHighConfidencePrediction,
  getPredictionSummary,
} from './task-predictor';

export type {
  TaskPredictor,
} from './task-predictor';

// =============================================================================
// PERFORMANCE TRACKING - Replaces Hook System Performance Tracking
// =============================================================================
export {
  PerformanceTracker,
  createPerformanceTracker,
  getGlobalPerformanceTracker,
  withPerformanceTracking,
  DEFAULT_PERFORMANCE_CONFIG
} from './performance-tracker';

export type {
  PerformanceSnapshot,
  PerformanceTrackingResult,
  PerformanceStats,
  PerformanceTrackerConfig,
} from './performance-tracker';

export { DEFAULT_TASK_PREDICTOR_CONFIG } from './task-predictor';

// =============================================================================
// TYPE DEFINITIONS - All monitoring types (tree-shakable)
// =============================================================================
export type {
  // Core Agent Types
  AgentId,
  AgentType,
  SwarmId,
  ForecastHorizon,

  // Intelligence System Types
  IntelligenceSystem,
  IntelligenceSystemConfig,

  // Task Prediction Types
  TaskPrediction,
  MultiHorizonTaskPrediction,
  TaskPredictorConfig,
  TaskCompletionRecord,
  PredictionFactor,

  // Health and Learning Types
  AgentHealth,
  AgentLearningState,
  AgentMetrics,
  HealthStatus,
  HealthThresholds,

  // Performance Types
  PerformanceHistory,
  PerformanceEntry,
  ResourceUsage,

  // Prediction Types
  PredictionRequest,
  PredictionResult,
  PerformanceOptimizationForecast,
  KnowledgeTransferPrediction,
  EmergentBehaviorPrediction,
  AdaptiveLearningUpdate,

  // System Types
  SystemHealthSummary,
  MonitoringConfig,
  MonitoringEvent,
  MonitoringEventType,
  HealthStatusType,
  TrendType,

  // Intelligence Types
  IntelligenceMetrics,
  EmergentBehavior,
  AgentCapabilities,

  // Learning Types
  LearningConfiguration,
} from './types';

// =============================================================================
// CONVENIENCE EXPORTS - Re-export commonly used types
// =============================================================================
export type {
  IntelligenceSystemConfig as Config,
  TaskPrediction as Prediction,
  AgentHealth as Health,
  SystemHealthSummary as SystemHealth
} from './types';

// =============================================================================
// DEFAULT CONFIGURATIONS - For easy setup
// =============================================================================
// DEFAULT_TASK_PREDICTOR_CONFIG already exported above

// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================

export async function getAgentMonitoringSystemAccess(config?: IntelligenceSystemConfig): Promise<any> {
  const intelligenceSystem = new CompleteIntelligenceSystem(config);
  await intelligenceSystem.initialize();
  return {
    createIntelligenceSystem: (systemConfig?: IntelligenceSystemConfig) => createIntelligenceSystem(systemConfig),
    createBasicSystem: (systemConfig?: IntelligenceSystemConfig) => createBasicIntelligenceSystem(systemConfig),
    createProductionSystem: (systemConfig?: IntelligenceSystemConfig) => createProductionIntelligenceSystem(systemConfig),
    createTaskPredictor: (predictorConfig?: TaskPredictorConfig) => createTaskPredictor(predictorConfig),
    createPerformanceTracker: (trackerConfig?: PerformanceTrackerConfig) => createPerformanceTracker(trackerConfig),
    getGlobalPerformanceTracker: () => getGlobalPerformanceTracker(),
    withPerformanceTracking: <T>(fn: () => T) => withPerformanceTracking(fn),
    predict: (request: PredictionRequest) => intelligenceSystem.predict(request),
    getHealth: (agentId: AgentId) => intelligenceSystem.getAgentHealth(agentId),
    updateHealth: (agentId: AgentId, health: AgentHealth) => intelligenceSystem.updateAgentHealth(agentId, health),
    getMetrics: () => intelligenceSystem.getIntelligenceMetrics(),
    shutdown: () => intelligenceSystem.shutdown()
  };
}

export async function getIntelligenceSystemInstance(config?: IntelligenceSystemConfig): Promise<CompleteIntelligenceSystem> {
  const system = new CompleteIntelligenceSystem(config);
  await system.initialize();
  return system;
}

export async function getTaskPredictionAccess(config?: TaskPredictorConfig): Promise<any> {
  const predictor = createTaskPredictor(config);
  return {
    predict: (request: PredictionRequest) => predictor.predict(request),
    isHighConfidence: (prediction: TaskPrediction) => isHighConfidencePrediction(prediction),
    getSummary: (predictions: TaskPrediction[]) => getPredictionSummary(predictions),
    updateLearning: (record: TaskCompletionRecord) => predictor.updateLearning?.(record)
  };
}

export async function getPerformanceMonitoring(config?: PerformanceTrackerConfig): Promise<any> {
  const tracker = createPerformanceTracker(config);
  return {
    track: <T>(fn: () => T) => withPerformanceTracking(fn),
    snapshot: () => tracker.getSnapshot(),
    getStats: () => tracker.getStats(),
    reset: () => tracker.reset?.()
  };
}

export async function getAgentHealthMonitoring(config?: IntelligenceSystemConfig): Promise<any> {
  const system = await getAgentMonitoringSystemAccess(config);
  return {
    checkHealth: (agentId: AgentId) => system.getHealth(agentId),
    updateHealth: (agentId: AgentId, health: AgentHealth) => system.updateHealth(agentId, health),
    getSystemHealth: () => system.getMetrics(),
    monitorAgent: (agentId: AgentId) => ({
      getHealth: () => system.getHealth(agentId),
      updateHealth: (health: AgentHealth) => system.updateHealth(agentId, health)
    })
  };
}

// Professional agent monitoring system object with proper naming (matches brainSystem pattern)
export const agentMonitoringSystem = {
  getAccess: getAgentMonitoringSystemAccess,
  getIntelligence: getIntelligenceSystemInstance,
  getPrediction: getTaskPredictionAccess,
  getPerformance: getPerformanceMonitoring,
  getHealthMonitoring: getAgentHealthMonitoring,
  createSystem: createIntelligenceSystem,
  createBasic: createBasicIntelligenceSystem,
  createProduction: createProductionIntelligenceSystem
};

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
    'Tree-shakable exports for optimal bundles'
  ]
} as const;