/**
 * Memory Coordination System - Complete Memory Orchestration
 *
 * Provides intelligent coordination for memory operations across multiple backends,
 * leveraging Foundation utilities and integrating with coordination-core.
 */

export { MemoryCoordinationSystem } from "./memory-coordination-system";
export { MemoryHealthMonitor } from "./memory-health-monitor";
export { MemoryLoadBalancer } from "./memory-load-balancer";

export type {
	MemoryCoordinationConfig,
	MemoryDistributionStrategy,
	MemoryHealthStatus,
	MemoryLoadMetrics,
	MemoryNode,
} from "./types";
