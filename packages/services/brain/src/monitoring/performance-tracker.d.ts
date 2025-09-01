/**
 * @file Performance Tracker - Replaces Hook System Performance Tracking
 *
 * Monitors agent performance, resource usage, and coordination metrics.
 * This replaces the removed hook system's performance tracking functionality.') */
/**
 * Performance metrics snapshot
 */
export interface PerformanceSnapshot {
  timestamp:number;
  agentId:string;
  operation:string;
  duration:number;
  memoryUsage:{
    rss:number;
    heapUsed:number;
    heapTotal:number;
    external:number;
};
  cpuUsage:{
    user:number;
    system:number;
};
  success:boolean;
  error?:string;
  metadata?:Record<string, unknown>;
}
/**
 * Performance tracking result (replaces hook performance tracking)
 */
export interface PerformanceTrackingResult {
  tracked:boolean;
  startTime:number;
  metrics:{
    memoryUsage:NodeJS.MemoryUsage;
    cpuUsage:NodeJS.CpuUsage;
};
  operation?:string;
  agentId?:string;
  error?:string;
}
/**
 * Performance statistics
 */
export interface PerformanceStats {
  totalOperations:number;
  avgDuration:number;
  successRate:number;
  memoryTrend: 'increasing | stable|decreasing;
'  cpuEfficiency:number;
  recentFailures:number;
}
/**
 * Performance Tracker Configuration
 */
export interface PerformanceTrackerConfig {
  enabled:boolean;
  historySize:number;
  metricsInterval:number;
  alertThresholds:{
    memoryMB:number;
    cpuPercent:number;
    operationTimeoutMs:number;
};
}
/**
 * Default performance tracker configuration
 */
export declare const DEFAULT_PERFORMANCE_CONFIG:PerformanceTrackerConfig;
/**
 * Performance Tracker - Monitors agent and coordination performance
 *
 * Replaces the removed hook system's performance tracking with integrated monitoring.') */
export declare class PerformanceTracker {
  private config;
  private snapshots;
  private activeOperations;
  private baselineMemory;
  private baselineCpu;
  constructor(config?:Partial<PerformanceTrackerConfig>);
  /**
   * Start tracking a performance operation (replaces hook system)
   */
  trackPerformance(context:{
    operation?:string;
    agentId?:string;
    metadata?:Record<string, unknown>;
}):Promise<PerformanceTrackingResult>;
  /**
   * Complete performance tracking for an operation
   */
  completeTracking(
    agentId:string,
    operation:string,
    startTime:number,
    success?:boolean,
    error?:string,
    metadata?:Record<string, unknown>
  ):PerformanceSnapshot;
  /**
   * Get performance statistics for an agent
   */
  getAgentPerformanceStats(agentId:string): PerformanceStats | null;
  /**
   * Get all active operations (for monitoring)
   */
  getActiveOperations():Array<{
    operationId:string;
    agentId:string;
    operation:string;
    elapsedTime:number;
}>;
  /**
   * Clear performance history for an agent
   */
  clearAgentHistory(agentId:string): void;
  /**
   * Clear all performance history
   */
  clearAllHistory():void;
  /**
   * Start periodic metrics collection
   */
  private startPeriodicMetrics;
  /**
   * Collect system-wide metrics
   */
  private collectSystemMetrics;
  /**
   * Calculate memory trend over time
   */
  private calculateMemoryTrend;
  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts;
}
/**
 * Factory function to create Performance Tracker
 */
export declare function createPerformanceTracker(
  config?:Partial<PerformanceTrackerConfig>
):PerformanceTracker;
/**
 * Get or create global performance tracker
 */
export declare function getGlobalPerformanceTracker():PerformanceTracker;
/**
 * Utility function to wrap an async operation with performance tracking
 */
export declare function withPerformanceTracking<T>(
  operation:string,
  agentId:string,
  fn:() => Promise<T>,
  metadata?:Record<string, unknown>
):Promise<T>;
//# sourceMappingURL=performance-tracker.d.ts.map
