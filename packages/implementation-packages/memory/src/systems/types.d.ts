/**
 * Memory Systems Types
 *
 * Type definitions for memory system management, clustering, and adaptive systems.
 */
import type { MemoryCoordinationConfig } from '../coordinators/types';
export interface MemorySystemConfig {
  enabled: boolean;
  name: string;
  mode: 'standalone | distributed' | 'adaptive''' | '''cluster';
  coordination: MemoryCoordinationConfig;
  clustering?: ClusterConfig;
  adaptive?: AdaptiveConfig;
  monitoring: {
    enabled: boolean;
    interval: number;
    healthChecks: boolean;
    performance: boolean;
    alerts: boolean;
  };
}
export interface MemorySystemStatus {
  name: string;
  mode: string;
  status: 'initializing | healthy' | 'degraded' | 'unhealthy' | 'offline';
  uptime: number;
  nodes: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
  performance: {
    averageResponseTime: number;
    throughput: number;
    cacheHitRate: number;
    errorRate: number;
  };
  resources: {
    memoryUsage: number;
    storageUsage: number;
    cpuUsage: number;
    networkUsage?: number;
  };
  optimization: {
    optimizationsApplied: number;
    improvementScore: number;
    lastOptimization: number;
  };
  health: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}
export interface ClusterConfig {
  enabled: boolean;
  nodeId: string;
  discovery: {
    method: 'static | dns' | 'consul''' | '''etcd';
    endpoints: string[];
    interval: number;
  };
  replication: {
    factor: number;
    strategy: 'sync | async' | 'quorum';
    consistency: 'strong | eventual' | 'weak';
  };
  partitioning: {
    enabled: boolean;
    strategy: 'hash | range' | 'directory';
    partitions: number;
    rebalancing: boolean;
  };
  failover: {
    enabled: boolean;
    timeout: number;
    maxRetries: number;
    backoffMultiplier: number;
  };
  networking: {
    port: number;
    protocol: 'tcp | udp' | 'http';
    encryption: boolean;
    compression: boolean;
  };
}
export interface ClusterNode {
  id: string;
  address: string;
  port: number;
  role: 'leader | follower' | 'candidate';
  status: 'active | inactive' | 'suspected''' | '''failed';
  lastSeen: number;
  load: number;
  capacity: number;
  partitions: number[];
  metadata: Record<string, unknown>;
}
export interface AdaptiveConfig {
  enabled: boolean;
  learning: {
    enabled: boolean;
    algorithm: 'gradient | genetic' | 'reinforcement''' | '''ensemble';
    learningRate: number;
    exploration: number;
    memorySize: number;
  };
  adaptation: {
    interval: number;
    threshold: number;
    maxChanges: number;
    rollbackOnRegression: boolean;
  };
  features: {
    accessPatterns: boolean;
    workloadPrediction: boolean;
    resourcePrediction: boolean;
    anomalyDetection: boolean;
    autoScaling: boolean;
  };
  constraints: {
    maxMemoryIncrease: number;
    maxLatencyIncrease: number;
    minThroughput: number;
    stabilityPeriod: number;
  };
}
export interface SystemMetrics {
  system: {
    name: string;
    uptime: number;
    version: string;
    mode: string;
  };
  coordination: {
    totalNodes: number;
    healthyNodes: number;
    operationsPerSecond: number;
    averageLatency: number;
    successRate: number;
  };
  optimization: {
    optimizationCycles: number;
    improvementsApplied: number;
    performanceGain: number;
    memoryEfficiency: number;
  };
  lifecycle: {
    totalEntries: number;
    hotEntries: number;
    warmEntries: number;
    coldEntries: number;
    archivedEntries: number;
    migrationsPerHour: number;
  };
  performance: {
    responseTime: {
      p50: number;
      p95: number;
      p99: number;
    };
    throughput: number;
    cacheMetrics: {
      hitRate: number;
      evictionsPerHour: number;
      compressionRatio: number;
    };
    errorRate: number;
  };
  resources: {
    memory: {
      used: number;
      available: number;
      peak: number;
    };
    storage: {
      used: number;
      available: number;
      iops: number;
    };
    network: {
      bytesIn: number;
      bytesOut: number;
      connectionsActive: number;
    };
  };
  clustering?: {
    nodeCount: number;
    leaderElections: number;
    replicationLag: number;
    partitionBalance: number;
  };
  adaptive?: {
    learningCycles: number;
    modelAccuracy: number;
    adaptationsApplied: number;
    predictionAccuracy: number;
  };
}
//# sourceMappingURL=types.d.ts.map
