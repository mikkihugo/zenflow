/**
 * Resource Monitor.
 * Real-time resource monitoring and threshold management.
 */
/**
 * @file Coordination system: resource-monitor
 */
import type { LoadMetrics } from '../types.ts';
export declare class ResourceMonitor implements ResourceMonitor {
    private monitoringAgents;
    private metricsCache;
    private thresholds;
    private monitoringIntervals;
    startMonitoring(agentId: string): Promise<void>;
    stopMonitoring(agentId: string): Promise<void>;
    getCurrentMetrics(agentId: string): Promise<LoadMetrics | null>;
    getHistoricalMetrics(agentId: string, _timeRange: {
        start: Date;
        end: Date;
    }): Promise<LoadMetrics[]>;
    setThresholds(agentId: string, thresholds: Record<string, number>): Promise<void>;
    private collectMetrics;
}
//# sourceMappingURL=resource-monitor.d.ts.map