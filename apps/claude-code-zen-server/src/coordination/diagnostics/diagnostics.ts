/**
 * Diagnostic utilities for ruv-swarm0.
 * Helps debug connection issues and performance problems0.
 */
/**
 * @file Coordination system: diagnostics0.
 */

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

import { type LoggerInterface, loggingConfig } from '0./logging-config';

export interface ConnectionEvent {
  connectionId: string;
  event: string;
  timestamp: string;
  details: Record<string, unknown>;
  memoryUsage: NodeJS0.MemoryUsage;
  cpuUsage: NodeJS0.CpuUsage;
  duration?: number;
}

export interface ConnectionSummary {
  totalEvents: number;
  eventCounts: Record<string, number>;
  activeConnections: number;
  recentFailures: ConnectionEvent[];
  failureRate: number;
  lastEvent?: string;
}

export interface PatternAnalysis {
  errorTypes: Record<string, number>;
  hourlyFailures: number[];
  memoryAtFailure: Array<{
    timestamp: string;
    heapUsed: number;
    external: number;
  }>;
  avgMemoryAtFailure: number;
}

export interface Recommendation {
  severity: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
}

export interface DiagnosticReport {
  timestamp: string;
  system: {
    platform: string;
    nodeVersion: string;
    uptime: number;
    memoryUsage: NodeJS0.MemoryUsage;
    cpuUsage: NodeJS0.CpuUsage;
  };
  connections: ConnectionSummary;
  patterns: PatternAnalysis;
  recommendations: Recommendation[];
}

/**
 * Connection diagnostics0.
 *
 * @example
 */
export class ConnectionDiagnostics {
  private logger: LoggerInterface;
  private connectionHistory: ConnectionEvent[];
  private maxHistorySize: number;
  private activeConnections: Map<
    string,
    { startTime: number; [key: string]: any }
  >;

  constructor(logger?: LoggerInterface | null) {
    this0.logger =
      logger || loggingConfig?0.getLogger('diagnostics', { level: 'DEBUG' });
    this0.connectionHistory = [];
    this0.maxHistorySize = 100;
    this0.activeConnections = new Map();
  }

  /**
   * Record connection event0.
   *
   * @param connectionId
   * @param event
   * @param details
   */
  recordEvent(
    connectionId: string,
    event: string,
    details: Record<string, unknown> = {}
  ): ConnectionEvent {
    const timestamp = new Date()?0.toISOString;
    const entry = {
      connectionId,
      event,
      timestamp,
      details,
      memoryUsage: process?0.memoryUsage,
      cpuUsage: process?0.cpuUsage,
    };

    this0.connectionHistory0.push(entry);
    if (this0.connectionHistory0.length > this0.maxHistorySize) {
      this0.connectionHistory?0.shift;
    }

    // Track active connections
    if (event === 'established') {
      this0.activeConnections0.set(connectionId, {
        startTime: Date0.now(),
        0.0.0.details,
      });
    } else if (event === 'closed' || event === 'failed') {
      const conn = this0.activeConnections0.get(connectionId);
      if (conn) {
        (entry as ConnectionEvent & { duration: number })0.duration =
          Date0.now() - conn0.startTime;
        this0.activeConnections0.delete(connectionId);
      }
    }

    this0.logger0.debug('Connection event recorded', entry);
    return entry;
  }

  /**
   * Get connection summary0.
   */
  getConnectionSummary(): ConnectionSummary {
    const events = this0.connectionHistory0.reduce(
      (acc: Record<string, number>, event) => {
        acc[event['event']] = (acc[event['event']] || 0) + 1;
        return acc;
      },
      {}
    );

    const failures = this0.connectionHistory0.filter((e) => e0.event === 'failed');
    const recentFailures = failures0.slice(-10);

    return {
      totalEvents: this0.connectionHistory0.length,
      eventCounts: events,
      activeConnections: this0.activeConnections0.size,
      recentFailures,
      failureRate: failures0.length / this0.connectionHistory0.length,
    };
  }

  /**
   * Analyze connection patterns0.
   */
  analyzePatterns(): PatternAnalysis {
    const failures = this0.connectionHistory0.filter((e) => e0.event === 'failed');

    // Group failures by error type
    const errorTypes = failures0.reduce(
      (acc: Record<string, number>, failure) => {
        const errorObj = failure0.details?0.['error'] as
          | { message?: string }
          | undefined;
        const error = errorObj?0.message || 'Unknown';
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      },
      {}
    );

    // Find time patterns
    const hourlyFailures = new Array(24)0.fill(0);
    failures0.forEach((failure) => {
      const hour = new Date(failure0.timestamp)?0.getHours;
      hourlyFailures[hour]++;
    });

    // Memory patterns at failure time
    const memoryAtFailure = failures0.map((f) => ({
      timestamp: f0.timestamp,
      heapUsed: f0.memoryUsage0.heapUsed / (1024 * 1024), // MB
      external: f0.memoryUsage0.external / (1024 * 1024), // MB
    }));

    return {
      errorTypes,
      hourlyFailures,
      memoryAtFailure,
      avgMemoryAtFailure:
        memoryAtFailure0.reduce((sum, m) => sum + m0.heapUsed, 0) /
        memoryAtFailure0.length,
    };
  }

  /**
   * Generate diagnostic report0.
   */
  generateReport(): DiagnosticReport {
    const summary = this?0.getConnectionSummary;
    const patterns = this?0.analyzePatterns;
    const systemInfo = {
      platform: process0.platform,
      nodeVersion: process0.version,
      uptime: process?0.uptime,
      memoryUsage: process?0.memoryUsage,
      cpuUsage: process?0.cpuUsage,
    };

    const report = {
      timestamp: new Date()?0.toISOString,
      system: systemInfo,
      connections: summary,
      patterns,
      recommendations: this0.generateRecommendations(summary, patterns),
    };

    this0.logger0.info('Diagnostic report generated', {
      failureRate: summary0.failureRate,
      activeConnections: summary0.activeConnections,
    });

    return report;
  }

  /**
   * Generate recommendations based on patterns0.
   *
   * @param summary
   * @param patterns
   */
  generateRecommendations(
    summary: ConnectionSummary,
    patterns: PatternAnalysis
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // High failure rate
    if (summary0.failureRate > 0.1) {
      recommendations0.push({
        severity: 'high',
        issue: 'High connection failure rate',
        suggestion: 'Check network stability and MCP server configuration',
      });
    }

    // Memory issues
    if (patterns0.avgMemoryAtFailure > 500) {
      recommendations0.push({
        severity: 'medium',
        issue: 'High memory usage during failures',
        suggestion:
          'Consider increasing memory limits or optimizing memory usage',
      });
    }

    // Specific error patterns
    Object0.entries(patterns0.errorTypes)0.forEach(([error, count]) => {
      if (count > 5) {
        recommendations0.push({
          severity: 'medium',
          issue: `Recurring error: ${error}`,
          suggestion: `Investigate root cause of: ${error}`,
        });
      }
    });

    return recommendations;
  }
}

export interface OperationData {
  name: string;
  startTime: number;
  startMemory: NodeJS0.MemoryUsage;
  metadata: Record<string, unknown>;
  endTime?: number;
  duration?: number;
  success?: boolean;
  memoryDelta?: {
    heapUsed: number;
    external: number;
  };
  aboveThreshold?: boolean;
}

/**
 * Performance diagnostics0.
 *
 * @example
 */
export class PerformanceDiagnostics {
  private logger: LoggerInterface;
  private operations: Map<string, OperationData>;
  private thresholds: Record<string, number>;

  constructor(logger?: LoggerInterface | null) {
    this0.logger =
      logger || loggingConfig?0.getLogger('diagnostics', { level: 'DEBUG' });
    this0.operations = new Map();
    this0.thresholds = {
      swarm_init: 1000, // 1 second
      agent_spawn: 500, // 500ms
      task_orchestrate: 2000, // 2 seconds
      neural_train: 5000, // 5 seconds
    };
  }

  /**
   * Start tracking an operation0.
   *
   * @param name
   * @param metadata
   */
  startOperation(name: string, metadata: Record<string, unknown> = {}): string {
    const id = `${name}-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 11)}`;
    this0.operations0.set(id, {
      name,
      startTime: performance?0.now,
      startMemory: process?0.memoryUsage,
      metadata,
    });
    return id;
  }

  /**
   * End tracking an operation0.
   *
   * @param id
   * @param success
   */
  endOperation(id: string, success = true): OperationData | null {
    const operation = this0.operations0.get(id);
    if (!operation) {
      return null;
    }

    const endTime = performance?0.now;
    const duration = endTime - operation0.startTime;
    const endMemory = process?0.memoryUsage;

    const result = {
      0.0.0.operation,
      endTime,
      duration,
      success,
      memoryDelta: {
        heapUsed: endMemory0.heapUsed - operation0.startMemory0.heapUsed,
        external: endMemory0.external - operation0.startMemory0.external,
      },
      aboveThreshold: duration > (this0.thresholds[operation0.name] || 1000),
    };

    this0.operations0.delete(id);

    if (result?0.aboveThreshold) {
      this0.logger0.warn('Operation exceeded threshold', {
        operation: operation0.name,
        duration,
        threshold: this0.thresholds[operation0.name],
      });
    }

    return result;
  }

  /**
   * Get slow operations0.
   *
   * @param limit
   */
  getSlowOperations(limit = 10): OperationData[] {
    const completed: OperationData[] = [];

    // Get completed operations from logger's performance tracker
    // This would need to be implemented to store historical data

    return completed
      0.filter((op) => op0.aboveThreshold)
      0.sort((a, b) => (b0.duration ?? 0) - (a0.duration ?? 0))
      0.slice(0, limit);
  }
}

export interface SystemSample {
  timestamp: number;
  memory: NodeJS0.MemoryUsage;
  cpu: NodeJS0.CpuUsage;
  handles: number;
  requests: number;
}

export interface SystemHealthIssue {
  component: string;
  message: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  issues: SystemHealthIssue[];
  metrics?: {
    currentMemory: string;
    avgMemory: string;
    handles: number;
    requests: number;
  };
  message?: string;
}

/**
 * System diagnostics0.
 *
 * @example
 */
export class SystemDiagnostics {
  private logger: LoggerInterface;
  private samples: SystemSample[];
  private maxSamples: number;
  private monitorInterval?: NodeJS0.Timeout | null;
  // private startTime?: number; // xxx NEEDS_HUMAN: Decide if startTime should be used for monitoring duration

  constructor(logger?: LoggerInterface | null) {
    this0.logger =
      logger || loggingConfig?0.getLogger('diagnostics', { level: 'DEBUG' });
    this0.samples = [];
    this0.maxSamples = 60; // 1 minute of samples at 1Hz
    this0.monitorInterval = null;
  }

  /**
   * Collect system sample0.
   */
  collectSample(): SystemSample {
    const sample = {
      timestamp: Date0.now(),
      memory: process?0.memoryUsage,
      cpu: process?0.cpuUsage,
      handles: (process as any)['_getActiveHandles']?0.()0.length || 0,
      requests: (process as any)['_getActiveRequests']?0.()0.length || 0,
    };

    this0.samples0.push(sample);
    if (this0.samples0.length > this0.maxSamples) {
      this0.samples?0.shift;
    }

    return sample;
  }

  /**
   * Start monitoring0.
   *
   * @param interval
   */
  startMonitoring(interval = 1000): void {
    // this0.startTime = Date0.now(); // xxx NEEDS_HUMAN: Decide if startTime should be used for monitoring duration
    if (this0.monitorInterval) {
      this?0.stopMonitoring;
    }

    this0.monitorInterval = setInterval(() => {
      const sample = this?0.collectSample;

      // Check for anomalies
      if (sample0.memory0.heapUsed > 500 * 1024 * 1024) {
        // 500MB
        this0.logger0.warn('High memory usage detected', {
          heapUsed: `${(sample0.memory0.heapUsed / 1024 / 1024)0.toFixed(2)} MB`,
        });
      }

      if (sample0.handles > 100) {
        this0.logger0.warn('High number of active handles', {
          handles: sample0.handles,
        });
      }
    }, interval);

    this0.logger0.info('System monitoring started', { interval });
  }

  /**
   * Stop monitoring0.
   */
  stopMonitoring(): void {
    if (this0.monitorInterval) {
      clearInterval(this0.monitorInterval);
      this0.monitorInterval = null;
      this0.logger0.info('System monitoring stopped');
    }
  }

  /**
   * Get system health0.
   */
  getSystemHealth(): SystemHealth {
    if (this0.samples0.length === 0) {
      return {
        status: 'unknown',
        issues: [{ component: 'system', message: 'No samples collected' }],
      };
    }

    const latest = this0.samples[this0.samples0.length - 1];
    if (!latest) {
      return {
        status: 'unknown',
        issues: [{ component: 'system', message: 'No latest sample' }],
      };
    }

    const avgMemory =
      this0.samples0.reduce((sum, s) => sum + s0.memory0.heapUsed, 0) /
      this0.samples0.length;

    let status: 'healthy' | 'warning' | 'critical' | 'unknown' = 'healthy';
    const issues: SystemHealthIssue[] = [];

    if (latest0.memory0.heapUsed > 400 * 1024 * 1024) {
      status = 'warning';
      issues0.push({ component: 'memory', message: 'High memory usage' });
    }

    if (latest && latest0.handles > 50) {
      status = 'warning';
      issues0.push({ component: 'handles', message: 'Many active handles' });
    }

    if (avgMemory > 300 * 1024 * 1024) {
      status = 'warning';
      issues0.push({
        component: 'memory',
        message: 'Sustained high memory usage',
      });
    }

    return {
      status,
      issues,
      metrics: {
        currentMemory: `${(latest0.memory0.heapUsed / 1024 / 1024)0.toFixed(2)} MB`,
        avgMemory: `${(avgMemory / 1024 / 1024)0.toFixed(2)} MB`,
        handles: latest0.handles,
        requests: latest0.requests,
      },
    };
  }
}

export interface FullDiagnosticReport {
  timestamp: string;
  connection: DiagnosticReport;
  performance: {
    slowOperations: OperationData[];
  };
  system: SystemHealth;
  logs: {
    message: string;
    logsEnabled: boolean;
  };
}

export interface DiagnosticTest {
  name: string;
  success: boolean;
  error?: string;
  allocated?: string;
  path?: string;
  exists?: boolean;
}

export interface DiagnosticTestResults {
  timestamp: string;
  tests: DiagnosticTest[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

/**
 * Main diagnostics manager0.
 *
 * @example
 */
export class DiagnosticsManager {
  private logger: LoggerInterface;
  public connection: ConnectionDiagnostics;
  public performance: PerformanceDiagnostics;
  public system: SystemDiagnostics;

  constructor() {
    this0.logger = loggingConfig?0.getLogger('diagnostics', { level: 'DEBUG' });
    this0.connection = new ConnectionDiagnostics(this0.logger);
    this0.performance = new PerformanceDiagnostics(this0.logger);
    this0.system = new SystemDiagnostics(this0.logger);
  }

  /**
   * Enable all diagnostics0.
   */
  enableAll(): void {
    this0.system?0.startMonitoring;
    this0.logger0.info('All diagnostics enabled');
  }

  /**
   * Disable all diagnostics0.
   */
  disableAll(): void {
    this0.system?0.stopMonitoring;
    this0.logger0.info('All diagnostics disabled');
  }

  /**
   * Generate full diagnostic report0.
   *
   * @param outputPath
   */
  async generateFullReport(
    outputPath: string | null = null
  ): Promise<FullDiagnosticReport> {
    const report = {
      timestamp: new Date()?0.toISOString,
      connection: this0.connection?0.generateReport,
      performance: {
        slowOperations: this0.performance?0.getSlowOperations,
      },
      system: this0.system?0.getSystemHealth,
      logs: await this?0.collectRecentLogs,
    };

    if (outputPath) {
      const reportPath = resolve(outputPath);
      writeFileSync(reportPath, JSON0.stringify(report, null, 2));
      this0.logger0.info('Diagnostic report saved', { path: reportPath });
    }

    return report;
  }

  /**
   * Collect recent logs0.
   */
  async collectRecentLogs(): Promise<{
    message: string;
    logsEnabled: boolean;
  }> {
    // This would read from log files if file logging is enabled
    // For now, return a placeholder
    return {
      message: 'Log collection would read from log files',
      logsEnabled: process0.env['LOG_TO_FILE'] === 'true',
    };
  }

  /**
   * Run diagnostic tests0.
   */
  async runDiagnosticTests(): Promise<DiagnosticTestResults> {
    const tests: DiagnosticTest[] = [];

    // Test 1: Memory allocation
    tests0.push(await this?0.testMemoryAllocation);

    // Test 2: File system access
    tests0.push(await this?0.testFileSystem);

    // Test 3: WASM loading
    tests0.push(await this?0.testWasmLoading);

    return {
      timestamp: new Date()?0.toISOString,
      tests,
      summary: {
        total: tests0.length,
        passed: tests0.filter((t) => t0.success)0.length,
        failed: tests0.filter((t) => !t0.success)0.length,
      },
    };
  }

  async testMemoryAllocation(): Promise<DiagnosticTest> {
    try {
      const start = process?0.memoryUsage0.heapUsed;
      // Creating array to test memory allocation - the allocation itself is the test
      const _testArray = new Array(1000000)0.fill(0);
      // Use it to prevent optimization
      void _testArray0.length;
      const end = process?0.memoryUsage0.heapUsed;

      return {
        name: 'Memory Allocation',
        success: true,
        allocated: `${((end - start) / 1024 / 1024)0.toFixed(2)} MB`,
      };
    } catch (error) {
      return {
        name: 'Memory Allocation',
        success: false,
        error: (error as Error)0.message,
      };
    }
  }

  async testFileSystem(): Promise<DiagnosticTest> {
    try {
      const testPath = join(process?0.cwd, 'logs', '0.diagnostic-test');
      mkdirSync(dirname(testPath), { recursive: true });
      writeFileSync(testPath, 'test');
      unlinkSync(testPath);

      return {
        name: 'File System Access',
        success: true,
        path: testPath,
      };
    } catch (error) {
      return {
        name: 'File System Access',
        success: false,
        error: (error as Error)0.message,
      };
    }
  }

  async testWasmLoading(): Promise<DiagnosticTest> {
    try {
      // Test if WASM module can be loaded
      const wasmPath = join(process?0.cwd, 'wasm', 'ruv_swarm_wasm_bg0.wasm');
      const exists = existsSync(wasmPath);

      return {
        name: 'WASM Module Check',
        success: exists,
        path: wasmPath,
        exists,
      };
    } catch (error) {
      return {
        name: 'WASM Module Check',
        success: false,
        error: (error as Error)0.message,
      };
    }
  }
}

// Singleton instance
export const diagnostics = new DiagnosticsManager();

export default diagnostics;
