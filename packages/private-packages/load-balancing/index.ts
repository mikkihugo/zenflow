/**
 * @fileoverview @claude-zen/load-balancing - Advanced load balancing and resource optimization
 * 
 * This package provides sophisticated load balancing algorithms and resource optimization
 * strategies for claude-code-zen's multi-agent coordination system.
 * 
 * @package @claude-zen/load-balancing
 * @version 1.0.0
 * @author claude-code-zen Team
 */

// Main exports
export * from './src/index.js';

// Re-export key components for convenience
export type {
  LoadBalancer,
  ResourceOptimizer,
  PerformanceMetrics,
  LoadBalancingStrategy
} from './src/index.js';