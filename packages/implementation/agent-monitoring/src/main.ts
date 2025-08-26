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
 * import { CompleteIntelligenceSystem, ITaskPredictor } from '@claude-zen/agent-monitoring';
 * import { SimpleTaskPredictor } from '@claude-zen/agent-monitoring';
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
} from "./intelligence-factory";
// =============================================================================
// PRIMARY INTELLIGENCE SYSTEM - Main implementation
// =============================================================================
export { CompleteIntelligenceSystem } from "./intelligence-system";
export type {
	PerformanceSnapshot,
	PerformanceStats,
	PerformanceTrackerConfig,
	PerformanceTrackingResult,
} from "./performance-tracker";
// =============================================================================
// PERFORMANCE TRACKING - Replaces Hook System Performance Tracking
// =============================================================================
export {
	createPerformanceTracker,
	DEFAULT_PERFORMANCE_CONFIG,
	getGlobalPerformanceTracker,
	PerformanceTracker,
	withPerformanceTracking,
} from "./performance-tracker";
export type { TaskPredictor } from "./task-predictor";
// =============================================================================
// TASK PREDICTION - Core Monitoring Primitives
// =============================================================================
export {
	createTaskPredictor,
	DEFAULT_TASK_PREDICTOR_CONFIG,
	getPredictionSummary,
	isHighConfidencePrediction,
	SimpleTaskPredictor,
} from "./task-predictor";
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
} from "./types";

// =============================================================================
// DEFAULT CONFIGURATIONS - For easy setup
// =============================================================================
// DEFAULT_TASK_PREDICTOR_CONFIG already exported above

// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================

export async function getAgentMonitoringSystemAccess(
	config?: IntelligenceSystemConfig,
): Promise<any> {
	const intelligenceSystem = new CompleteIntelligenceSystem(config);
	await intelligenceSystem.initialize();
	return {
		createIntelligenceSystem: (systemConfig?: IntelligenceSystemConfig) =>
			createIntelligenceSystem(systemConfig),
		createBasicSystem: (systemConfig?: IntelligenceSystemConfig) =>
			createBasicIntelligenceSystem(systemConfig),
		createProductionSystem: (systemConfig?: IntelligenceSystemConfig) =>
			createProductionIntelligenceSystem(systemConfig),
		createTaskPredictor: (predictorConfig?: TaskPredictorConfig) =>
			createTaskPredictor(predictorConfig),
		createPerformanceTracker: (trackerConfig?: PerformanceTrackerConfig) =>
			createPerformanceTracker(trackerConfig),
		getGlobalPerformanceTracker: () => getGlobalPerformanceTracker(),
		withPerformanceTracking: <T>(fn: () => T) => withPerformanceTracking(fn),
		predict: (request: PredictionRequest) =>
			intelligenceSystem.predict(request),
		getHealth: (agentId: AgentId) => intelligenceSystem.getAgentHealth(agentId),
		updateHealth: (agentId: AgentId, health: AgentHealth) =>
			intelligenceSystem.updateAgentHealth(agentId, health),
		getMetrics: () => intelligenceSystem.getIntelligenceMetrics(),
		shutdown: () => intelligenceSystem.shutdown(),
	};
}

export async function getIntelligenceSystemInstance(
	config?: IntelligenceSystemConfig,
): Promise<CompleteIntelligenceSystem> {
	const system = new CompleteIntelligenceSystem(config);
	await system.initialize();
	return system;
}

export async function getTaskPredictionAccess(
	config?: TaskPredictorConfig,
): Promise<any> {
	const predictor = createTaskPredictor(config);
	return {
		predict: (request: PredictionRequest) => predictor.predict(request),
		isHighConfidence: (prediction: TaskPrediction) =>
			isHighConfidencePrediction(prediction),
		getSummary: (predictions: TaskPrediction[]) =>
			getPredictionSummary(predictions),
		updateLearning: (record: TaskCompletionRecord) =>
			predictor.updateLearning?.(record),
	};
}

export async function getPerformanceMonitoring(
	config?: PerformanceTrackerConfig,
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
	config?: IntelligenceSystemConfig,
): Promise<any> {
	const system = await getAgentMonitoringSystemAccess(config);
	return {
		checkHealth: (agentId: AgentId) => system.getHealth(agentId),
		updateHealth: (agentId: AgentId, health: AgentHealth) =>
			system.updateHealth(agentId, health),
		getSystemHealth: () => system.getMetrics(),
		monitorAgent: (agentId: AgentId) => ({
			getHealth: () => system.getHealth(agentId),
			updateHealth: (health: AgentHealth) =>
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
	name: "@claude-zen/agent-monitoring",
	version: "1.0.0",
	description: "Core agent monitoring primitives for Claude Code Zen",
	features: [
		"Basic task prediction interfaces",
		"Simple intelligence system implementations",
		"Core monitoring types and configurations",
		"Foundation logging and storage integration",
		"Tree-shakable exports for optimal bundles",
	],
} as const;
