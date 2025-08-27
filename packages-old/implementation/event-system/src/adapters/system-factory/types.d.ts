/**
 * @file System Event Factory - Type Definitions
 *
 * Type definitions and interfaces for system event factory.
 */
export interface SystemEventFactoryConfig {
    enableSystemMonitoring?: boolean;
    healthCheckInterval?: number;
    resourceTracking?: boolean;
}
export interface SystemFactoryMetrics {
    totalCreated: number;
    totalErrors: number;
    activeInstances: number;
    runningInstances: number;
    uptime: number;
    creationRate: number;
    errorRate: number;
    systemMetrics: {
        totalSystemMonitors: number;
        activeSystemMonitors: number;
        failedSystemMonitors: number;
        averageSystemLoad: number;
    };
    timestamp: Date;
}
export interface SystemHealthResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    activeInstances: number;
    runningInstances: number;
    errorRate: number;
    systemSuccessRate: number;
    uptime: number;
    timestamp: Date;
    details: {
        factoryHealth: string;
        systemHealth: string;
        instanceHealth: Array<{
            name: string;
            status: string;
            activeSystemMonitors: number;
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