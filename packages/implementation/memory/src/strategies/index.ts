/**
 * Memory Optimization Strategies - Performance and Efficiency Optimization
 *
 * Provides advanced strategies for memory optimization, cache management,
 * data lifecycle, performance tuning, and swarm knowledge extraction leveraging
 * Foundation utilities and ML tools.
 */

export { CacheEvictionStrategy } from "./cache-eviction-strategy";
export { DataLifecycleManager } from "./data-lifecycle-manager";
export { MemoryOptimizationEngine } from "./memory-optimization-engine";
export { PerformanceTuningStrategy } from "./performance-tuning-strategy";
export { SwarmKnowledgeExtractor } from "./swarm-knowledge-extractor";

export type {
	CacheEntry,
	CacheEvictionConfig,
	EvictionReason,
	LifecycleConfig,
	LifecycleStage,
	OptimizationConfig,
	OptimizationMetrics,
	PerformanceConfig,
	TuningAction,
} from "./types";
