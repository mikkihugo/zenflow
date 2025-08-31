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
 * '''typescript'
 * import { CompleteIntelligenceSystem, ITaskPredictor} from '@claude-zen/agent-monitoring';
 * import { SimpleTaskPredictor} from '@claude-zen/agent-monitoring';
 * `
 *
 * @author Claude Code Zen Team - Intelligence Integration
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */
export { createBasicIntelligenceSystem, createIntelligenceSystem, createProductionIntelligenceSystem, } from './intelligence-factory';
export { CompleteIntelligenceSystem } from './intelligence-system';
export type { PerformanceSnapshot, PerformanceStats, PerformanceTrackerConfig, PerformanceTrackingResult, } from './performance-tracker';
export { createPerformanceTracker, DEFAULT_PERFORMANCE_CONFIG, getGlobalPerformanceTracker, PerformanceTracker, withPerformanceTracking, } from './performance-tracker';
export type { TaskPredictor } from './task-predictor';
export { createTaskPredictor, DEFAULT_TASK_PREDICTOR_CONFIG, getPredictionSummary, isHighConfidencePrediction, SimpleTaskPredictor, } from './task-predictor';
export type { AdaptiveLearningUpdate, AgentCapabilities, AgentHealth, AgentHealth as Health, AgentId, AgentLearningState, AgentMetrics, AgentType, EmergentBehavior, EmergentBehaviorPrediction, ForecastHorizon, HealthStatus, HealthStatusType, HealthThresholds, IntelligenceMetrics, IntelligenceSystem, IntelligenceSystemConfig, IntelligenceSystemConfig as Config, KnowledgeTransferPrediction, LearningConfiguration, MonitoringConfig, MonitoringEvent, MonitoringEventType, MultiHorizonTaskPrediction, PerformanceEntry, PerformanceHistory, PerformanceOptimizationForecast, PredictionFactor, PredictionRequest, PredictionResult, ResourceUsage, SwarmId, SystemHealthSummary, SystemHealthSummary as SystemHealth, TaskCompletionRecord, TaskPrediction, TaskPrediction as Prediction, TaskPredictorConfig, TrendType, } from './types';
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