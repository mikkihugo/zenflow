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
export { CompleteIntelligenceSystem } from './intelligence-system';
export { createIntelligenceSystem, createBasicIntelligenceSystem, createProductionIntelligenceSystem } from './intelligence-factory';
export { SimpleTaskPredictor, createTaskPredictor, isHighConfidencePrediction, getPredictionSummary, } from './task-predictor';
export type { TaskPredictor, } from './task-predictor';
export { PerformanceTracker, createPerformanceTracker, getGlobalPerformanceTracker, withPerformanceTracking, DEFAULT_PERFORMANCE_CONFIG } from './performance-tracker';
export type { PerformanceSnapshot, PerformanceTrackingResult, PerformanceStats, PerformanceTrackerConfig, } from './performance-tracker';
export { DEFAULT_TASK_PREDICTOR_CONFIG } from './task-predictor';
export type { AgentId, AgentType, SwarmId, ForecastHorizon, IntelligenceSystem, IntelligenceSystemConfig, TaskPrediction, MultiHorizonTaskPrediction, TaskPredictorConfig, TaskCompletionRecord, PredictionFactor, AgentHealth, AgentLearningState, AgentMetrics, HealthStatus, HealthThresholds, PerformanceHistory, PerformanceEntry, ResourceUsage, PredictionRequest, PredictionResult, PerformanceOptimizationForecast, KnowledgeTransferPrediction, EmergentBehaviorPrediction, AdaptiveLearningUpdate, SystemHealthSummary, MonitoringConfig, MonitoringEvent, MonitoringEventType, HealthStatusType, TrendType, IntelligenceMetrics, EmergentBehavior, AgentCapabilities, LearningConfiguration, } from './types';
export type { IntelligenceSystemConfig as Config, TaskPrediction as Prediction, AgentHealth as Health, SystemHealthSummary as SystemHealth } from './types';
/**
 * Package metadata and version information
 */
export declare const PACKAGE_INFO: {
    readonly name: "@claude-zen/agent-monitoring";
    readonly version: "1.0.0";
    readonly description: "Core agent monitoring primitives for Claude Code Zen";
    readonly features: readonly ["Basic task prediction interfaces", "Simple intelligence system implementations", "Core monitoring types and configurations", "Foundation logging and storage integration", "Tree-shakable exports for optimal bundles"];
};
//# sourceMappingURL=main.d.ts.map