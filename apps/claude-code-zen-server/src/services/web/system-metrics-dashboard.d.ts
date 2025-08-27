/**
 * System Metrics Dashboard - Foundation Pattern
 *
 * Uses single coordinating facade instead of multiple facade imports.
 * Follows foundation principles for clean architecture.
 */
import { EventEmitter, type Result } from '@claude-zen/foundation';
interface DashboardConfig {
    refreshInterval?: number;
    enableRealtime?: boolean;
    maxDataPoints?: number;
    alertThresholds?: {
        latency?: number;
        errorRate?: number;
        memoryUsage?: number;
    };
}
interface SystemHealth {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    overall: number;
}
interface SystemMetrics {
    uptime: number;
    requests: number;
    errors: number;
    responseTime: number;
    throughput: number;
}
interface DashboardStatus {
    health: SystemHealth;
    metrics: SystemMetrics;
    timestamp: number;
}
/**
 * Unified Performance Dashboard using coordinating facade pattern
 */
export declare class UnifiedPerformanceDashboard extends EventEmitter {
    private systemCoordinator;
    private configuration;
    private refreshTimer?;
    private isRunning;
    constructor(config?: DashboardConfig);
    /**
     * Start the dashboard monitoring
     */
    start(): Promise<Result<void, Error>>;
    /**
     * Stop the dashboard monitoring
     */
    stop(): Promise<Result<void, Error>>;
    /**
     * Get comprehensive system status using coordinating facade
     */
    getSystemStatus(): Promise<Result<DashboardStatus, Error>>;
    /**
     * Generate comprehensive system report
     */
    generateReport(): Promise<Result<string, Error>>;
    /**
     * Update dashboard display
     */
    private updateDashboard;
    /**
     * Display initial status
     */
    private displayInitialStatus;
    /**
     * Display console status (fallback when no UI connected)
     */
    private displayConsoleStatus;
    /**
     * Get dashboard configuration
     */
    getConfig(): DashboardConfig;
    /**
     * Update dashboard configuration
     */
    updateConfig(updates: Partial<DashboardConfig>): void;
    /**
     * Check if dashboard is running
     */
    isActive(): boolean;
}
export default UnifiedPerformanceDashboard;
//# sourceMappingURL=system-metrics-dashboard.d.ts.map