/**
 * @file Monitoring Event Factory - Type Definitions
 *
 * Type definitions and interfaces for monitoring event factory.
 */
export interface MonitoringEventFactoryConfig {
    enableMonitoring?: boolean;
    healthCheckInterval?: number;
}
export interface MonitoringFactoryMetrics {
    totalCreated: number;
    totalErrors: number;
    activeInstances: number;
    runningInstances: number;
    uptime: number;
    creationRate: number;
    errorRate: number;
    monitoringMetrics: {
        totalMonitors: number;
        activeMonitors: number;
        failedMonitors: number;
        averageResponseTime: number;
    };
    timestamp: Date;
}
export interface MonitoringHealthResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    activeInstances: number;
    runningInstances: number;
    errorRate: number;
    monitoringSuccessRate: number;
    uptime: number;
    timestamp: Date;
    details: {
        factoryHealth: string;
        monitoringHealth: string;
        instanceHealth: Array<{
            name: string;
            status: string;
            activeMonitors: number;
            lastCheck: Date;
        }>;
    };
}
export interface FactoryOperationResult {
    success: boolean;
    instanceName?: string;
    error?: string;
    duration: number;
    timestamp: Date;
}
export interface BulkOperationResult {
    totalProcessed: number;
    successful: number;
    failed: number;
    results: FactoryOperationResult[];
    duration: number;
    timestamp: Date;
}
//# sourceMappingURL=types.d.ts.map