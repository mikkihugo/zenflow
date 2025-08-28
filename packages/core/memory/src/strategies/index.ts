/**
 * Memory Optimization Strategies - Performance and Efficiency Optimization
 *
 * Provides advanced strategies for memory optimization, cache management,
 * data lifecycle, performance tuning, and swarm knowledge extraction leveraging
 * Foundation utilities and ML tools.
 */

export { CacheEvictionStrategy} from './cache-eviction-strategy';
export { MemoryOptimizationEngine} from './memory-optimization-engine';
export { DataLifecycleManager} from './data-lifecycle-manager';
export { PerformanceTuningStrategy} from './performance-tuning-strategy';
export { SwarmKnowledgeExtractor} from './swarm-knowledge-extractor';

export type {
  CacheEvictionConfig,
  CacheEntry,
  EvictionReason,
  OptimizationConfig,
  OptimizationMetrics,
  LifecycleConfig,
  LifecycleStage,
  PerformanceConfig,
  TuningAction,
} from './types';
