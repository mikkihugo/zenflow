/**
 * @file Interface implementation: system-metrics-dashboard.
 */
/** Unified Performance Dashboard */
/** Real-time monitoring and analytics for Claude Zen systems */
import { EventEmitter } from 'node:events';
type MCPPerformanceMetrics = any;
import type EnhancedMemory from '../../memory/memory.ts';
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
    overall: 'healthy' | 'warning' | 'critical';
    components: {
        mcp: 'healthy' | 'warning' | 'critical';
        memory: 'healthy' | 'warning' | 'critical';
        database: 'healthy' | 'warning' | 'critical';
        neural: 'healthy' | 'warning' | 'critical';
        clients: 'healthy' | 'warning' | 'critical';
    };
    alerts: Array<{
        level: 'info' | 'warning' | 'error';
        component: string;
        message: string;
        timestamp: number;
    }>;
}
export declare class UnifiedPerformanceDashboard extends EventEmitter {
    private mcpMetrics;
    private enhancedMemory;
    private vectorRepository?;
    private config;
    private refreshTimer?;
    private isRunning;
    constructor(mcpMetrics: MCPPerformanceMetrics, enhancedMemory: EnhancedMemory, config?: DashboardConfig);
    /** Start the dashboard monitoring */
    start(): Promise<void>;
    /** Stop the dashboard monitoring */
    stop(): Promise<void>;
    /** Get comprehensive system status */
    getSystemStatus(): Promise<{
        health: SystemHealth;
        metrics: {
            mcp: any;
            memory: any;
            database: any;
            neural: any;
            clients: any;
        };
        performance: {
            uptime: number;
            totalOperations: number;
            systemLoad: number;
            memoryUsage: number;
        };
    }>;
    /**
     * Assess overall system health.
     *
     * @param mcpMetrics
     * @param memoryStats
     * @param dbStats
     * @param clientMetrics
     */
    private assessSystemHealth;
    /**
     * Assess individual component health.
     *
     * @param latency
     * @param errorRate
     * @param component
     * @param memoryUsage
     */
    private assessComponentHealth;
    /** Get system load (simplified) */
    private getSystemLoad;
    /** Update dashboard display */
    private updateDashboard;
    /** Display initial status */
    private displayInitialStatus;
    /** Get database statistics using DAL */
    private getDatabaseStats;
    /**
     * Display console status (fallback).
     *
     * @param status
     */
    private displayConsoleStatus;
    /** Get UACL client metrics */
    private getClientMetrics;
    /**
     * Assess client health and add alerts.
     *
     * @param clientMetrics
     * @param alerts
     */
    private assessClientHealth;
    /** Generate comprehensive report */
    generateReport(): Promise<string>;
}
export default UnifiedPerformanceDashboard;
//# sourceMappingURL=system-metrics-dashboard.d.ts.map