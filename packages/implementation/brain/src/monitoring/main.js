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

// =============================================================================
// FACTORY FUNCTIONS - Quick setup methods
// =============================================================================
export {
	createBasicIntelligenceSystem,
	createIntelligenceSystem,
	createProductionIntelligenceSystem,
} from "./intelligence-factory";
export { CompleteIntelligenceSystem } from "./intelligence-system";
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
// DEFAULT CONFIGURATIONS - For easy setup
// =============================================================================
// DEFAULT_TASK_PREDICTOR_CONFIG already exported above
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
};
//# sourceMappingURL=main.js.map
