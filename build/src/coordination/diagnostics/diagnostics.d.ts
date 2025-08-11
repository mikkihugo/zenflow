/**
 * Diagnostic utilities for ruv-swarm.
 * Helps debug connection issues and performance problems.
 */
/**
 * @file Coordination system: diagnostics.
 */
import { type LoggerInterface } from './logging-config.ts';
export interface ConnectionEvent {
    connectionId: string;
    event: string;
    timestamp: string;
    details: Record<string, any>;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
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
        memoryUsage: NodeJS.MemoryUsage;
        cpuUsage: NodeJS.CpuUsage;
    };
    connections: ConnectionSummary;
    patterns: PatternAnalysis;
    recommendations: Recommendation[];
}
/**
 * Connection diagnostics.
 *
 * @example
 */
export declare class ConnectionDiagnostics {
    private logger;
    private connectionHistory;
    private maxHistorySize;
    private activeConnections;
    constructor(logger?: LoggerInterface | null);
    /**
     * Record connection event.
     *
     * @param connectionId
     * @param event
     * @param details
     */
    recordEvent(connectionId: string, event: string, details?: Record<string, any>): ConnectionEvent;
    /**
     * Get connection summary.
     */
    getConnectionSummary(): ConnectionSummary;
    /**
     * Analyze connection patterns.
     */
    analyzePatterns(): PatternAnalysis;
    /**
     * Generate diagnostic report.
     */
    generateReport(): DiagnosticReport;
    /**
     * Generate recommendations based on patterns.
     *
     * @param summary
     * @param patterns
     */
    generateRecommendations(summary: ConnectionSummary, patterns: PatternAnalysis): Recommendation[];
}
export interface OperationData {
    name: string;
    startTime: number;
    startMemory: NodeJS.MemoryUsage;
    metadata: Record<string, any>;
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
 * Performance diagnostics.
 *
 * @example
 */
export declare class PerformanceDiagnostics {
    private logger;
    private operations;
    private thresholds;
    constructor(logger?: LoggerInterface | null);
    /**
     * Start tracking an operation.
     *
     * @param name
     * @param metadata
     */
    startOperation(name: string, metadata?: Record<string, any>): string;
    /**
     * End tracking an operation.
     *
     * @param id
     * @param success
     */
    endOperation(id: string, success?: boolean): OperationData | null;
    /**
     * Get slow operations.
     *
     * @param limit
     */
    getSlowOperations(limit?: number): OperationData[];
}
export interface SystemSample {
    timestamp: number;
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
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
 * System diagnostics.
 *
 * @example
 */
export declare class SystemDiagnostics {
    private logger;
    private samples;
    private maxSamples;
    private monitorInterval?;
    constructor(logger?: LoggerInterface | null);
    /**
     * Collect system sample.
     */
    collectSample(): SystemSample;
    /**
     * Start monitoring.
     *
     * @param interval
     */
    startMonitoring(interval?: number): void;
    /**
     * Stop monitoring.
     */
    stopMonitoring(): void;
    /**
     * Get system health.
     */
    getSystemHealth(): SystemHealth;
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
 * Main diagnostics manager.
 *
 * @example
 */
export declare class DiagnosticsManager {
    private logger;
    connection: ConnectionDiagnostics;
    performance: PerformanceDiagnostics;
    system: SystemDiagnostics;
    constructor();
    /**
     * Enable all diagnostics.
     */
    enableAll(): void;
    /**
     * Disable all diagnostics.
     */
    disableAll(): void;
    /**
     * Generate full diagnostic report.
     *
     * @param outputPath
     */
    generateFullReport(outputPath?: string | null): Promise<FullDiagnosticReport>;
    /**
     * Collect recent logs.
     */
    collectRecentLogs(): Promise<{
        message: string;
        logsEnabled: boolean;
    }>;
    /**
     * Run diagnostic tests.
     */
    runDiagnosticTests(): Promise<DiagnosticTestResults>;
    testMemoryAllocation(): Promise<DiagnosticTest>;
    testFileSystem(): Promise<DiagnosticTest>;
    testWasmLoading(): Promise<DiagnosticTest>;
}
export declare const diagnostics: DiagnosticsManager;
export default diagnostics;
//# sourceMappingURL=diagnostics.d.ts.map