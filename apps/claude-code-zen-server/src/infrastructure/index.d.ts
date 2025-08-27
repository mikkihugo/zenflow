/**
 * Infrastructure Layer - Foundation Pattern
 *
 * Single coordinating facade for system infrastructure.
 * Internally delegates to strategic facades when needed.
 */
import { type Result } from '@claude-zen/foundation';
/**
 * System Coordinator - Single point of entry for complex operations
 */
export interface SystemCoordinator {
    getSystemHealth(): Promise<Result<SystemHealth, Error>>;
    getSystemMetrics(): Promise<Result<SystemMetrics, Error>>;
    initializeSystem(): Promise<Result<void, Error>>;
    shutdownSystem(): Promise<Result<void, Error>>;
}
export interface SystemHealth {
    overall: 'healthy' | 'warning' | 'critical';
    components: {
        brain: 'healthy' | 'warning' | 'critical';
        memory: 'healthy' | 'warning' | 'critical';
        database: 'healthy' | 'warning' | 'critical';
        coordination: 'healthy' | 'warning' | 'critical';
    };
    alerts: Array<{
        level: 'info' | 'warning' | 'error';
        component: string;
        message: string;
        timestamp: number;
    }>;
}
export interface SystemMetrics {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    performance: {
        averageLatency: number;
        errorRate: number;
        throughput: number;
    };
}
/**
 * Get system coordinator instance (Strategic Facade)
 */
export declare function getSystemCoordinator(): SystemCoordinator;
/**
 * Infrastructure service container
 */
export declare const infrastructureContainer: import("@claude-zen/foundation").Container;
export type { ProcessInfo } from './process/web.manager';
export { WebProcessManager } from './process/web.manager';
export type { WebSession } from './session.manager';
export { WebSessionManager } from './session.manager';
//# sourceMappingURL=index.d.ts.map