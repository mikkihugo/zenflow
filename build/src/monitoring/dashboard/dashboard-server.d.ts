/**
 * Real-Time Monitoring Dashboard Server.
 * Web-based dashboard for performance monitoring and visualization.
 */
/**
 * @file Dashboard-server implementation.
 */
import { EventEmitter } from 'node:events';
import type { PerformanceInsights } from '../analytics/performance-analyzer.ts';
import type { CompositeMetrics } from '../core/metrics-collector.ts';
import type { OptimizationResult } from '../optimization/optimization-engine.ts';
export interface DashboardConfig {
    port: number;
    staticPath?: string;
    corsOrigins?: string[];
    updateInterval: number;
}
export interface DashboardData {
    metrics: CompositeMetrics;
    insights: PerformanceInsights;
    optimizations: OptimizationResult[];
    alerts: Array<{
        id: string;
        type: 'warning' | 'error' | 'info';
        message: string;
        timestamp: number;
    }>;
}
export declare class DashboardServer extends EventEmitter {
    private app;
    private server;
    private io;
    private config;
    private isRunning;
    private connectedClients;
    private dashboardData;
    constructor(config: DashboardConfig);
    /**
     * Setup Express middleware and static files.
     */
    private setupExpress;
    /**
     * Setup Socket.IO for real-time communication.
     */
    private setupSocketIO;
    /**
     * Setup REST API routes.
     */
    private setupRoutes;
    /**
     * Start the dashboard server.
     */
    start(): Promise<void>;
    /**
     * Stop the dashboard server.
     */
    stop(): Promise<void>;
    /**
     * Update dashboard with new metrics.
     *
     * @param metrics
     */
    updateMetrics(metrics: CompositeMetrics): void;
    /**
     * Update dashboard with new insights.
     *
     * @param insights
     */
    updateInsights(insights: PerformanceInsights): void;
    /**
     * Update dashboard with optimization results.
     *
     * @param optimizations
     */
    updateOptimizations(optimizations: OptimizationResult[]): void;
    /**
     * Add alert to dashboard.
     *
     * @param type
     * @param message
     */
    addAlert(type: 'warning' | 'error' | 'info', message: string): void;
    /**
     * Generate dashboard summary.
     */
    private generateDashboardSummary;
    /**
     * Handle export request via socket.
     *
     * @param socket
     * @param format
     */
    private handleExportRequest;
    /**
     * Handle export response via HTTP.
     *
     * @param res
     * @param format
     */
    private handleExportResponse;
    /**
     * Generate export data.
     *
     * @param format
     */
    private generateExportData;
    /**
     * Convert data to CSV format.
     *
     * @param data
     */
    private convertToCsv;
    /**
     * Get server status.
     */
    getStatus(): {
        isRunning: boolean;
        port: number;
        connectedClients: number;
        uptime: number;
    };
    /**
     * Get connected clients.
     */
    getConnectedClients(): string[];
}
//# sourceMappingURL=dashboard-server.d.ts.map