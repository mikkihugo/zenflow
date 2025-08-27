/**
 * Web Data Service - Production Business Logic and Data Management
 *
 * Real data services for API endpoints using strategic facades.
 * Provides comprehensive system status, metrics, and data management.
 */
export interface SystemStatusData {
    system: string;
    version: string;
    swarms: {
        active: number;
        total: number;
        queens: number;
        commanders: number;
        agents: number;
    };
    tasks: {
        pending: number;
        running: number;
        completed: number;
        failed: number;
        blocked: number;
    };
    performance: {
        cpuUsage: number;
        memoryUsage: number;
        uptime: number;
        throughput: number;
    };
    health: {
        overall: number;
        database: number;
        api: number;
        brain: number;
        safety: number;
    };
    timestamp: string;
}
export interface SwarmStatusData {
    id: string;
    name: string;
    type: 'queen' | 'commander' | 'agent';
    status: 'active' | 'idle' | 'busy' | 'error';
    tasks: {
        current: number;
        completed: number;
        failed: number;
    };
    performance: {
        efficiency: number;
        responseTime: number;
        successRate: number;
    };
    lastActive: string;
}
export interface TaskMetricsData {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageDuration: number;
    successRate: number;
    throughputPerHour: number;
    currentLoad: number;
    peakLoad: number;
    bottlenecks: string[];
    recommendations: string[];
}
/**
 * Production Web Data Service with real business logic
 */
export declare class WebDataService {
    private databaseSystem;
    private eventSystem;
    private taskMasterSystem;
    private workflowEngine;
    private safetyFramework;
    private brainSystem;
    private memorySystem;
    private systemMonitor;
    private telemetryCollector;
    private codeAnalyzer;
    private repoAnalyzer;
    private gitOperations;
    constructor();
    /**
     * Initialize all direct package systems
     */
    private initializeDirectSystems;
    private getTaskStatistics;
    private getPerformanceMetrics;
    private getSwarmStatistics;
    private buildSystemHealthStatus;
    /**
     * Get comprehensive system status with real data
     */
    getSystemStatus(): Promise<SystemStatusData>;
    /**
     * Get comprehensive system health metrics
     */
    private getSystemHealthMetrics;
    /**
     * Check database system health
     */
    private checkDatabaseHealth;
    /**
     * Check API health
     */
    private checkApiHealth;
    /**
     * Check brain system health
     */
    private checkBrainHealth;
    /**
     * Check safety framework health
     */
    private checkSafetyHealth;
    private getBrainCoordinationData;
    private createSwarmDataFromAgent;
    private getMockSwarmData;
    /**
     * Get real swarm status data
     */
    getSwarmStatus(): Promise<SwarmStatusData[]>;
    private getTaskMasterFlowData;
    private calculateTaskMetrics;
    private getFallbackTaskMetrics;
    /**
     * Get comprehensive task metrics
     */
    getTaskMetrics(): Promise<TaskMetricsData>;
    /**
     * Identify bottlenecks from flow metrics
     */
    private identifyBottlenecks;
    /**
     * Generate performance recommendations
     */
    private generateRecommendations;
    /**
     * Cleanup and shutdown
     */
    shutdown(): void;
}
//# sourceMappingURL=data.handler.d.ts.map