/**
 * @file Coordination Event Factory - Type Definitions
 *
 * Type definitions and interfaces for the coordination event factory system.
 */
/**
 * Configuration for the coordination event factory.
 */
export interface CoordinationEventFactoryConfig {
    name: string;
    maxInstances?: number;
    enableHealthMonitoring?: boolean;
    enableMetricsCollection?: boolean;
    healthCheckInterval?: number;
    metricsCollectionInterval?: number;
}
/**
 * Factory statistics and metrics.
 */
export interface CoordinationFactoryMetrics {
    totalCreated: number;
    totalErrors: number;
    activeInstances: number;
    runningInstances: number;
    uptime: number;
    creationRate: number;
    errorRate: number;
    timestamp: Date;
}
/**
 * Health check result for a coordination event manager.
 */
export interface CoordinationHealthResult {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: Date;
    uptime: number;
    errorCount: number;
    metrics: Record<string, number>;
}
/**
 * Factory operation result.
 */
export interface FactoryOperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: Error;
    timestamp: Date;
}
/**
 * Bulk operation result.
 */
export interface BulkOperationResult<T = unknown> {
    totalItems: number;
    successCount: number;
    failureCount: number;
    successes: T[];
    failures: Array<{
        name: string;
        error: Error;
    }>;
}
//# sourceMappingURL=types.d.ts.map