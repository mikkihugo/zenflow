/**
 * @fileoverview System Monitoring Types
 */
/**
 * System metrics data structure
 */
export interface SystemMetrics {
    /** CPU usage percentage */
    cpu: {
        usage: number;
        load: number[];
        cores: number;
    };
    /** Memory usage */
    memory: {
        total: number;
        used: number;
        free: number;
        usage: number;
    };
    /** Disk usage */
    disk: {
        total: number;
        used: number;
        free: number;
        usage: number;
    };
    /** Network statistics */
    network: {
        bytesIn: number;
        bytesOut: number;
        packetsIn: number;
        packetsOut: number;
    };
    /** System uptime */
    uptime: number;
    /** Timestamp */
    timestamp: number;
}
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    /** Operation timings */
    operations: Record<string, {
        count: number;
        totalTime: number;
        avgTime: number;
        minTime: number;
        maxTime: number;
        p50?: number;
        p90?: number;
        p95?: number;
        p99?: number;
        stdDev?: number;
        throughput?: number;
        trend?: 'improving' | 'stable' | 'declining' | stable | degrading;
    }>;
    /** System performance */
    system: {
        responseTime: number;
        throughput: number;
        errorRate: number;
    };
    /** Timestamp */
    timestamp: number;
}
/**
 * Health check status
 */
export interface HealthStatus {
    /** Overall health status */
    status: 'healthy | degraded|unhealthy;;
    /** Individual check results */
    checks: Record<string, {
        status: 'ok | warning|error;;
        message?: string;
        value?: number;
        threshold?: number;
    }>;
    /** Additional health details */
    details?: {
        systemLoad?: number[];
        processCount?: number;
        memoryDetails?: {
            total: string;
            used: string;
            free: string;
        };
        [key: string]: any;
    };
    /** Timestamp */
    timestamp: number;
}
/**
 * Infrastructure monitoring configuration
 */
export interface InfrastructureConfig {
    /** Enable system metrics collection */
    enableSystemMetrics?: boolean;
    /** System metrics collection interval (ms) */
    systemMetricsInterval?: number;
    /** Enable performance tracking */
    enablePerformanceTracking?: boolean;
    /** Enable health checks */
    enableHealthChecks?: boolean;
    /** Health check interval (ms) */
    healthCheckInterval?: number;
    /** CPU usage warning threshold */
    cpuWarningThreshold?: number;
    /** CPU usage error threshold */
    cpuErrorThreshold?: number;
    /** Memory usage warning threshold */
    memoryWarningThreshold?: number;
    /** Memory usage error threshold */
    memoryErrorThreshold?: number;
    /** Disk usage warning threshold */
    diskWarningThreshold?: number;
    /** Disk usage error threshold */
    diskErrorThreshold?: number;
}
/**
 * System monitoring configuration
 */
export interface SystemMonitoringConfig extends InfrastructureConfig {
    /** Service name for telemetry */
    serviceName?: string;
    /** Additional labels for metrics */
    labels?: Record<string, string>;
}
//# sourceMappingURL=types.d.ts.map