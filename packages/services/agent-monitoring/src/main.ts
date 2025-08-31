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
 * -  **Agent Health**:Tracks agent health status via event responses
 * - // SEARCH Task Prediction**:Provides task duration predictions via events
 * -  **Performance Tracking**:Monitors agent performance via events
 * -  **Zero Dependencies**:No foundation or external imports
 * -  **System Health**:Provides system-wide agent health summaries
 *
 * **EVENT ARCHITECTURE:**
 * Brain emits agent monitoring requests → Agent Monitor responds with intelligence data
 * Pure event coordination with no direct package dependencies.
 *
 * @example Event-Driven Usage (Brain Integration)
 * ```typescript`
 * // Brain requests agent health
 * eventSystem.async emit(): Promise<void> {

 *   logger.info(): Promise<void> {
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
function async createTaskPredictor(): Promise<void> {

  return;

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
