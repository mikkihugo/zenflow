/**
 * Memory Coordination System - Complete Memory Orchestration
 *
 * Provides intelligent coordination for memory operations across multiple backends,
 * leveraging Foundation utilities and integrating with coordination-core.
 */

export { MemoryCoordinationSystem } from './memory-coordination-system';
export { MemoryLoadBalancer } from './memory-load-balancer';
export { MemoryHealthMonitor } from './memory-health-monitor';

export type {
  MemoryCoordinationConfig,
  MemoryNode,
  MemoryDistributionStrategy,
  MemoryHealthStatus,
  MemoryLoadMetrics,
} from './types';
