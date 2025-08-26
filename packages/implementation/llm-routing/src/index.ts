/**
 * @fileoverview LLM Routing Package - Main Exports
 *
 * Intelligent multi-provider LLM routing and management system.
 *
 * This package provides:
 * - Multi-provider LLM configuration and management
 * - Intelligent routing based on context and requirements
 * - Comprehensive statistics and analytics
 * - Performance monitoring and optimization
 * - Cost optimization through smart provider selection
 * - Rate limiting and fallback management
 *
 * Key Features:
 * - Context-aware routing (small vs large contexts)
 * - Capability-based provider selection (file ops, streaming, etc.)
 * - Real-time performance tracking
 * - Health monitoring with alerts
 * - Cost analysis and optimization recommendations
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

// Configuration exports
export * from "./config/index";
// Convenience exports for common usage
export {
	addProvider,
	getOptimalProvider,
	getProvider,
	getProviderIds,
	getProvidersByCapability,
	LLM_PROVIDER_CONFIG,
	ROUTING_STRATEGY,
	removeProvider,
	updateProvider,
} from "./config/providers";
// Statistics exports
export * from "./stats/index";

// Main service class
export { default as LLMStatsService } from "./stats/llm-stats-service";
// Type exports
export * from "./types/index";
