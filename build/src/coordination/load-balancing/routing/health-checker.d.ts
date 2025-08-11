/**
 * @file Coordination system: health-checker
 */
/**
 * Health Checker.
 * Comprehensive agent health monitoring and status management.
 */
import { EventEmitter } from 'node:events';
interface HealthStatus {
    healthy: boolean;
    lastCheck: Date;
    details?: string;
    responseTime?: number;
    consecutiveFailures: number;
}
export declare class HealthChecker extends EventEmitter implements HealthChecker {
    private healthStatuses;
    private checkInterval;
    private healthCheckTimer;
    private activeAgents;
    constructor(checkInterval?: number);
    checkHealth(agent: Agent): Promise<boolean>;
    startHealthChecks(agents: Agent[]): Promise<void>;
    stopHealthChecks(): Promise<void>;
    getHealthStatus(agentId: string): Promise<HealthStatus>;
    private performHealthChecks;
}
export {};
//# sourceMappingURL=health-checker.d.ts.map