/**
 * @fileoverview Agent Monitoring Package - 100% EVENT-DRIVEN
 *
 * **100% EVENT-BASED AGENT MONITORING**
 *
 * Pure event-driven agent monitoring with ZERO imports.
 * Listens to brain events and responds with agent intelligence and monitoring data.
 *
 * **EVENT-DRIVEN CAPABILITIES:**
 * - 🧠 **Brain Integration**:Responds to brain agent monitoring requests via events
 * - 📊 **Agent Health**:Tracks agent health status via event responses
 * - 🔍 **Task Prediction**:Provides task duration predictions via events
 * - 📈 **Performance Tracking**:Monitors agent performance via events
 * - 🎯 **Zero Dependencies**:No foundation or external imports
 * - ⚡ **System Health**:Provides system-wide agent health summaries
 *
 * **EVENT ARCHITECTURE:**
 * Brain emits agent monitoring requests → Agent Monitor responds with intelligence data
 * Pure event coordination with no direct package dependencies.
 *
 * @example Event-Driven Usage (Brain Integration)
 * ```typescript`
 * // Brain requests agent health
 * eventSystem.emit('brain: agent-monitoring: get-agent-health', { 
 *   requestId: '123', *   agentId:{ id: 'agent-1', swarmId: ' swarm-1', type: ' coordinator', instance:1},
 *   timestamp: Date.now() 
 *});
 *
 * // Agent monitoring responds with health data
 * eventSystem.on('agent-monitoring: agent-health', (data) => {
 *   logger.info('Agent health: ', data.health);
' *});
 * ````
 *
 * @author Claude Code Zen Team - Intelligence Integration
 * @since 1.0.0-alpha.43
 * @version 2.0.0-event-driven
 */

// =============================================================================
// PRIMARY EVENT-DRIVEN EXPORTS (ZERO IMPORTS)
// =============================================================================
export {
  createEventDrivenIntelligenceSystem,
  EventDrivenIntelligenceSystem,
  EventDrivenIntelligenceSystem as EventDrivenAgentMonitoring,
} from './intelligence-system-event-driven.js';

// =============================================================================
// LEGACY EXPORTS (WITH IMPORTS - DEPRECATED)
// =============================================================================

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
  // (PredictionRequest, AgentId, AgentHealth already imported above)
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

// Import implementations
import { CompleteIntelligenceSystem } from './intelligence-system';
import {
  SimpleTaskPredictor,
  TaskPredictorConfig,
  isHighConfidencePrediction as highConfidencePrediction,
  getPredictionSummary as predictionSummary,
} from './task-predictor';
import {
  PerformanceTracker,
  PerformanceTrackerConfig,
} from './performance-tracker';
import {
  createIntelligenceSystem,
  createBasicIntelligenceSystem,
  createProductionIntelligenceSystem,
} from './intelligence-factory';

// Factory functions for missing exports
function createTaskPredictor(config?: TaskPredictorConfig) {
  return new SimpleTaskPredictor(config);
}

function createPerformanceTracker(config?: PerformanceTrackerConfig) {
  return new PerformanceTracker(config);
}

function getGlobalPerformanceTracker() {
  return (
    globalPerformanceTracker ||
    (globalPerformanceTracker = new PerformanceTracker())
  );
}

function withPerformanceTracking<T>(fn: () => T): T {
  // Simple wrapper that just calls the function
  return fn();
}

// Use the imported functions
const isHighConfidencePrediction = highConfidencePrediction;
const getPredictionSummary = predictionSummary;

// Global performance tracker instance
let globalPerformanceTracker: PerformanceTracker;

// Type aliases for function signatures - using any for complex config functions
type ISystemConfig = any;
type ITaskPredictorConfig = any;
type IPerformanceTrackerConfig = any;
type IPredictionRequest = any;
type IAgentId = any;
type IAgentHealth = any;
type ITaskPrediction = any;
type ITaskCompletionRecord = any;

// =============================================================================
// DEFAULT CONFIGURATIONS - For easy setup
// =============================================================================
// DEFAULT_TASK_PREDICTOR_CONFIG already exported above

// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================

export async function getAgentMonitoringSystemAccess(
  config?: ISystemConfig
): Promise<any> {
  const intelligenceSystem = new CompleteIntelligenceSystem(config);
  await intelligenceSystem.initialize();
  return {
    createIntelligenceSystem: (systemConfig?: ISystemConfig) =>
      createIntelligenceSystem(systemConfig),
    createBasicSystem: (systemConfig?: ISystemConfig) =>
      createBasicIntelligenceSystem(systemConfig),
    createProductionSystem: (systemConfig?: ISystemConfig) =>
      createProductionIntelligenceSystem(systemConfig),
    createTaskPredictor: (predictorConfig?: ITaskPredictorConfig) =>
      createTaskPredictor(predictorConfig),
    createPerformanceTracker: (trackerConfig?: IPerformanceTrackerConfig) =>
      createPerformanceTracker(trackerConfig),
    getGlobalPerformanceTracker: () => getGlobalPerformanceTracker(),
    withPerformanceTracking: <T>(fn: () => T) => withPerformanceTracking(fn),
    predict: (request: IPredictionRequest) =>
      intelligenceSystem.predict(request),
    getHealth: (agentId: IAgentId) =>
      intelligenceSystem.getAgentHealth(agentId),
    updateHealth: (agentId: IAgentId, health: IAgentHealth) =>
      intelligenceSystem.updateAgentHealth(agentId, health),
    getMetrics: () => intelligenceSystem.getIntelligenceMetrics(),
    shutdown: () => intelligenceSystem.shutdown(),
  };
}

export async function getIntelligenceSystemInstance(
  config?: ISystemConfig
): Promise<CompleteIntelligenceSystem> {
  const system = new CompleteIntelligenceSystem(config);
  await system.initialize();
  return system;
}

export async function getTaskPredictionAccess(
  config?: ITaskPredictorConfig
): Promise<any> {
  const predictor = createTaskPredictor(config);
  return {
    predict: (request: IPredictionRequest) => predictor.predict(request),
    isHighConfidence: (prediction: ITaskPrediction) =>
      isHighConfidencePrediction(prediction),
    getSummary: (prediction: ITaskPrediction) =>
      getPredictionSummary(prediction),
    getSummaries: (predictions: ITaskPrediction[]) =>
      predictions.map((p) => getPredictionSummary(p)),
    updateLearning: (record: ITaskCompletionRecord) =>
      predictor.updateLearning?.(record),
  };
}

export async function getPerformanceMonitoring(
  config?: PerformanceTrackerConfig
): Promise<any> {
  const tracker = createPerformanceTracker(config);
  return {
    track: <T>(fn: () => T) => withPerformanceTracking(fn),
    snapshot: () => tracker.getSnapshot(),
    getStats: () => tracker.getStats(),
    reset: () => tracker.reset?.(),
  };
}

export async function getAgentHealthMonitoring(
  config?: ISystemConfig
): Promise<any> {
  const system = await getAgentMonitoringSystemAccess(config);
  return {
    checkHealth: (agentId: IAgentId) => system.getHealth(agentId),
    updateHealth: (agentId: IAgentId, health: IAgentHealth) =>
      system.updateHealth(agentId, health),
    getSystemHealth: () => system.getMetrics(),
    monitorAgent: (agentId: IAgentId) => ({
      getHealth: () => system.getHealth(agentId),
      updateHealth: (health: IAgentHealth) =>
        system.updateHealth(agentId, health),
    }),
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
  createProduction: createProductionIntelligenceSystem,
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
    'Tree-shakable exports for optimal bundles',
  ],
} as const;
