/**
 * Resource Monitor.
 * Real-time resource monitoring and threshold management.
 */
/**
 * @file Coordination system:resource-monitor
 */
import type { LoadMetrics } from '../types';
export declare class ResourceMonitor implements ResourceMonitor {
    private monitoringAgents;
    private metricsCache;
    private thresholds;
    private monitoringIntervals;
    startMonitoring(): void {
        start: Date;
        end: Date;
    }): LoadMetrics[];
    setThresholds(agentId: string, thresholds: Record<string, number>): void;
    private collectMetrics;
}
//# sourceMappingURL=resource-monitor.d.ts.map