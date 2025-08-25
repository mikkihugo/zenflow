/**
 * Memory Health Monitor - Continuous Health Monitoring
 *
 * Monitors health of memory nodes with configurable health checks,
 * automatic recovery detection, and comprehensive health reporting.
 */
import { TypedEventBase } from '@claude-zen/foundation';
import type { MemoryNode, MemoryHealthStatus } from './types';
interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
  checkEndpoints: boolean;
  detailedChecks: boolean;
}
interface HealthCheckResult {
  nodeId: string;
  healthy: boolean;
  latency: number;
  timestamp: number;
  details: {
    connectivity: boolean;
    responsiveness: boolean;
    errorRate: number;
    memoryUsage: number;
    storageUsage: number;
    lastError?: string;
  };
}
interface HealthStats {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageLatency: number;
  healthyNodes: number;
  unhealthyNodes: number;
  recoveringNodes: number;
}
export declare class MemoryHealthMonitor extends TypedEventBase {
  private logger;
  private config;
  private nodes;
  private healthHistory;
  private checkIntervals;
  private stats;
  private initialized;
  constructor(config: HealthCheckConfig);
  initialize(): Promise<void>;
  addNode(node: MemoryNode): void;
  removeNode(nodeId: string): void;
  private startHealthChecking;
  private stopHealthChecking;
  private performHealthCheck;
  private checkNodeHealth;
  private evaluateHealth;
  private storeHealthResult;
  private updateNodeStatus;
  private checkHealthStatusChange;
  private getConsecutiveFailures;
  private getConsecutiveSuccesses;
  private updateHealthStats;
  getNodeHealth(nodeId: string): MemoryHealthStatus|null;
  getNodeHealthHistory(nodeId: string, limit?: number): HealthCheckResult[];
  getOverallHealth(): {
    status:'healthy' | 'degraded' | 'unhealthy';
    score: number;
    summary: string;
    details: HealthStats;
  };
  getStats(): HealthStats;
  forceHealthCheck(nodeId?: string): Promise<void>;
  reset(): void;
  shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=memory-health-monitor.d.ts.map
