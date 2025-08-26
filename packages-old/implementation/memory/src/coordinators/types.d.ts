/**
 * Memory Coordination System Types
 *
 * Type definitions for memory coordination, load balancing, and health monitoring.
 */
import type { BaseMemoryBackend } from '../backends/base-backend';
export interface MemoryCoordinationConfig {
  enabled: boolean;
  strategy: MemoryDistributionStrategy;
  replication: number;
  consistency: 'strong|eventual|weak';
  healthCheck: {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
  };
  loadBalancing: {
    enabled: boolean;
    algorithm:
      | 'round-robin'
      | 'least-connections'
      | 'weighted'
      | 'resource-aware';
    weights?: Record<string, number>;
  };
  failover: {
    enabled: boolean;
    maxRetries: number;
    backoffMultiplier: number;
  };
}
export type MemoryDistributionStrategy =
  | 'single'
  | 'replicated'
  | 'sharded'
  | 'tiered'
  | 'intelligent';
export interface MemoryNode {
  id: string;
  backend: BaseMemoryBackend;
  weight: number;
  priority: number;
  tier: 'hot|warm|cold';
  status: MemoryHealthStatus;
  metrics: MemoryLoadMetrics;
  lastHealthCheck: number;
}
export interface MemoryHealthStatus {
  healthy: boolean;
  latency: number;
  errorRate: number;
  uptime: number;
  lastError?: string;
  details: Record<string, unknown>;
}
export interface MemoryLoadMetrics {
  connections: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  memoryUsage: number;
  storageUsage: number;
  cacheHitRate: number;
  operationCounts: {
    reads: number;
    writes: number;
    deletes: number;
  };
}
export interface MemoryOperationRequest {
  operation: 'store|retrieve|delete|list|search|clear';
  key?: string;
  value?: unknown;
  namespace?: string;
  options?: {
    consistency?: 'strong' | 'eventual';
    timeout?: number;
    retries?: number;
    tier?: 'hot|warm|cold';
  };
}
export interface MemoryOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    nodeId: string;
    latency: number;
    fromCache: boolean;
    consistency: string;
    timestamp: number;
  };
}
export interface MemoryShardConfig {
  shardCount: number;
  hashFunction: 'md5|sha1|sha256|murmur3';
  replicationFactor: number;
  virtualNodes: number;
}
export interface MemoryTierConfig {
  hotTier: {
    maxSize: number;
    ttl: number;
    backends: string[];
  };
  warmTier: {
    maxSize: number;
    ttl: number;
    backends: string[];
  };
  coldTier: {
    maxSize: number;
    ttl: number;
    backends: string[];
  };
  migrationRules: {
    accessThreshold: number;
    timeThreshold: number;
    sizeThreshold: number;
  };
}
//# sourceMappingURL=types.d.ts.map
