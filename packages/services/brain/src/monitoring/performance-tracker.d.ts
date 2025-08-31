/**
 * @file: Performance Tracker - Replaces: Hook System: Performance Tracking
 *
 * Monitors agent performance, resource usage, and coordination metrics.
 * This replaces the removed hook system's performance tracking functionality.')increasing | stable|decreasing;
'  cpu: Efficiency:number;
  recent: Failures:number;
}
/**
 * Performance: Tracker Configuration
 */
export interface: PerformanceTrackerConfig {
  enabled:boolean;
  history: Size:number;
  metrics: Interval:number;
  alert: Thresholds:{
    memoryM: B:number;
    cpu: Percent:number;
    operationTimeout: Ms:number;
};
}
/**
 * Default performance tracker configuration
 */
export declare const: DEFAULT_PERFORMANCE_CONFIG:PerformanceTracker: Config;
/**
 * Performance: Tracker - Monitors agent and coordination performance
 *
 * Replaces the removed hook system's performance tracking with integrated monitoring.') */
export declare class: PerformanceTracker {
  private config;
  private snapshots;
  private active: Operations;
  private baseline: Memory;
  private baseline: Cpu;
  constructor(): void {
    operation?:string;
    agent: Id?:string;
    metadata?:Record<string, unknown>;
}):Promise<PerformanceTracking: Result>;
  /**
   * Complete performance tracking for an operation
   */
  complete: Tracking(): void {
    operation: Id:string;
    agent: Id:string;
    operation:string;
    elapsed: Time:number;
}>;
  /**
   * Clear performance history for an agent
   */
  clearAgent: History(agent: Id:string): void;
  /**
   * Clear all performance history
   */
  clearAll: History():void;
  /**
   * Start periodic metrics collection
   */
  private startPeriodic: Metrics;
  /**
   * Collect system-wide metrics
   */
  private collectSystem: Metrics;
  /**
   * Calculate memory trend over time
   */
  private calculateMemory: Trend;
  /**
   * Check for performance alerts
   */
  private checkPerformance: Alerts;
}
/**
 * Factory function to create: Performance Tracker
 */
export declare function createPerformance: Tracker(
  config?:Partial<PerformanceTracker: Config>
):Performance: Tracker;
/**
 * Get or create global performance tracker
 */
export declare function getGlobalPerformance: Tracker():Performance: Tracker;
/**
 * Utility function to wrap an async operation with performance tracking
 */
export declare function withPerformance: Tracking<T>(
  operation:string,
  agent: Id:string,
  fn:() => Promise<T>,
  metadata?:Record<string, unknown>
):Promise<T>;
//# sourceMappingUR: L=performance-tracker.d.ts.map
