/**
 * @fileoverview System Metrics Collection - System Monitoring Implementation
 *
 * **MOVED FROM FOUNDATION  SYSTEM MONITORING IMPLEMENTATION**
 *
 * Real system metrics collection implementation for accurate CPU, memory, and performance measurements.
 * This belongs in the implementation package, not in the foundation facade.
 *
 * Key Features:
 * - Real-time system performance monitoring
 * - CPU usage tracking with baseline measurements
 * - Memory metrics (system and process heap)
 * - Performance tracking for operations
 * - System health assessment with recommendations
 * - Agent-specific metrics with realistic variations
 *
 * **FOUNDATION INTEGRATION:**
 * - Uses foundation Logger interface
 * - Integrates with foundation error handling
 * - Available for DI injection
 * - Follows foundation patterns
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (extracted from main app)
 * @version 1.0.0
 */


import { cpus, freemem, loadavg, totalmem} from 'node:os';
import { cpuUsage, memoryUsage} from 'node:process';
import { type Logger, getLogger } from '@claude-zen/foundation';

// ============================================================================
// FOUNDATION-INTEGRATED SYSTEM METRICS TYPES
// ============================================================================

export interface CpuMetrics {
  usage_percent:number;
  user_time_ms:number;
  system_time_ms:number;
  cores:number;
  load_average:number[];
}

export interface MemoryMetrics {
  used_mb:number;
  total_mb:number;
  free_mb:number;
  heap_used_mb:number;
  heap_total_mb:number;
  external_mb:number;
  rss_mb:number;
}

export interface SystemPerformanceTracker {
  start_time:number;
  end_time?:number;
  duration_ms?:number;
  memory_start:NodeJS.MemoryUsage;
  memory_end?:NodeJS.MemoryUsage;
  memory_delta_mb?:number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  cpu_health: 'good' | 'high' | 'critical';
  memory_health: 'good' | 'high' | 'critical';
  load_health: 'good' | 'high' | 'critical';
  recommendations:string[];
}

export class SystemMetricsError extends Error {
  constructor(
    message:string,
    public readonly metric?:string
  ) {
    super(message);
    this.name = 'SystemMetricsError';
}
}

// ============================================================================
// SYSTEM METRICS COLLECTOR WITH FOUNDATION INTEGRATION
// ============================================================================

export class SystemMetricsCollector {
  private static instance:SystemMetricsCollector;
  private cpuBaseline:NodeJS.CpuUsage;
  private lastCpuCheck:number;
  private performanceTrackers = new Map<string, SystemPerformanceTracker>();
  private logger:Logger;

  private constructor(logger?:Logger) {
    this.logger = logger||getLogger('SystemMetricsCollector');
    this.cpuBaseline = cpuUsage();
    this.lastCpuCheck = Date.now();
}

  /**
   * Get singleton instance with optional logger
   */
  public static getInstance(logger?:Logger): SystemMetricsCollector {
    if (!SystemMetricsCollector.instance) {
      SystemMetricsCollector.instance = new SystemMetricsCollector(logger);
}
    return SystemMetricsCollector.instance;
}

  /**
   * Get CPU metrics
   */
  public getCpuMetrics():CpuMetrics {
    const currentCpuUsage = cpuUsage(this.cpuBaseline);
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastCpuCheck;

    // Calculate CPU percentage based on elapsed time
    const totalTime = currentCpuUsage.user + currentCpuUsage.system;
    const cpuPercent =
      timeDiff > 0 ? Math.min((totalTime / (timeDiff * 1000)) * 100, 100) :0;

    // Update baseline for next measurement
    this.cpuBaseline = cpuUsage();
    this.lastCpuCheck = currentTime;

    return {
      usage_percent:Math.round(cpuPercent * 100) / 100,
      user_time_ms:currentCpuUsage.user / 1000, // Convert microseconds to milliseconds
      system_time_ms:currentCpuUsage.system / 1000,
      cores:cpus().length,
      load_average:loadavg(),
};
}

  /**
   * Get memory metrics
   */
  public getMemoryMetrics():MemoryMetrics {
    const processMemory = memoryUsage();
    const totalSystemMemory = totalmem();
    const freeSystemMemory = freemem();
    const MB_DIVISOR = 1024 * 1024;

    return {
      used_mb:
        Math.round(
          ((totalSystemMemory - freeSystemMemory) / MB_DIVISOR) * 100
        ) / 100,
      total_mb:Math.round((totalSystemMemory / MB_DIVISOR) * 100) / 100,
      free_mb:Math.round((freeSystemMemory / MB_DIVISOR) * 100) / 100,
      heap_used_mb:
        Math.round((processMemory.heapUsed / MB_DIVISOR) * 100) / 100,
      heap_total_mb:
        Math.round((processMemory.heapTotal / MB_DIVISOR) * 100) / 100,
      external_mb:
        Math.round((processMemory.external / MB_DIVISOR) * 100) / 100,
      rss_mb:Math.round((processMemory.rss / MB_DIVISOR) * 100) / 100,
};
}

  /**
   * Start performance tracking for an operation
   */
  public startPerformanceTracking(operationId:string): void {
    this.performanceTrackers.set(operationId, {
      start_time:Date.now(),
      memory_start:memoryUsage(),
});
    this.logger.debug(`Started performance tracking for:${  operationId}`);
}

  /**
   * End performance tracking and get results
   */
  public endPerformanceTracking(
    operationId:string
  ):SystemPerformanceTracker|null {
    const tracker = this.performanceTrackers.get(operationId);
    if (!tracker) {
      this.logger.warn(`No performance tracker found for: ${  operationId}`);
      return null;
}

    const endTime = Date.now();
    const endMemory = memoryUsage();
    const MB_DIVISOR = 1024 * 1024;

    tracker.end_time = endTime;
    tracker.duration_ms = endTime - tracker.start_time;
    tracker.memory_end = endMemory;
    tracker.memory_delta_mb =
      Math.round(
        ((endMemory.heapUsed - tracker.memory_start.heapUsed) / MB_DIVISOR) *
          100
      ) / 100;

    // Clean up tracker
    this.performanceTrackers.delete(operationId);

    this.logger.debug(`Completed performance tracking for:${  operationId}`, {
      duration_ms: tracker.duration_ms,
      memory_delta_mb: tracker.memory_delta_mb,
    });

    return tracker;
}

  /**
   * Get current system performance snapshot
   */
  public getPerformanceSnapshot():{
    cpu:CpuMetrics;
    memory:MemoryMetrics;
    timestamp:string;
    uptime_seconds:number;
} {
    return {
      cpu:this.getCpuMetrics(),
      memory:this.getMemoryMetrics(),
      timestamp:new Date().toISOString(),
      uptime_seconds:Math.floor(process.uptime()),
};
}

  /**
   * Get system health status with recommendations
   */
  public getSystemHealth():SystemHealth {
    const cpu = this.getCpuMetrics();
    const memory = this.getMemoryMetrics();

    // Health thresholds
    const cpuHealth =
      cpu.usage_percent > 90
        ? 'critical'
        : cpu.usage_percent > 70
          ? 'high'
          : 'good';
    
    const memoryPressure = memory.used_mb / memory.total_mb;
    const memoryHealth =
      memoryPressure > 0.95
        ? 'critical'
        : memoryPressure > 0.8
          ? 'high'
          : 'good';

    const loadAvg1Min = (cpu.load_average[0] ?? 0) / cpu.cores;
    const loadHealth =
      loadAvg1Min > 2 ? 'critical' : loadAvg1Min > 1 ? 'high' : 'good';

    // Overall status
    const healths = [cpuHealth, memoryHealth, loadHealth];
    const status = healths.includes('critical')
      ? 'critical'
      : healths.includes('high')
        ? 'warning'
        : 'healthy';

    // Recommendations
    const recommendations: string[] = [];
    if (cpuHealth !== 'good') {
      recommendations.push(
        'High CPU usage detected - consider reducing agent count'
      );
    }
    if (memoryHealth !== 'good') {
      recommendations.push(
        'High memory usage detected - implement cleanup policies'
      );
    }
    if (loadHealth !== 'good') {
      recommendations.push('High system load - consider distributing work');
    }

    return {
      status,
      cpu_health:cpuHealth,
      memory_health:memoryHealth,
      load_health:loadHealth,
      recommendations,
};
}
}

// ============================================================================
// DI CONTAINER INTEGRATION
// ============================================================================

/**
 * DI token for SystemMetricsCollector
 */
export const SYSTEM_METRICS_COLLECTOR_TOKEN = Symbol('SystemMetricsCollector');
/**
 * Create SystemMetricsCollector with DI
 */
export function createSystemMetricsCollector(
  logger?:Logger
):SystemMetricsCollector {
  return SystemMetricsCollector.getInstance(logger);
}
