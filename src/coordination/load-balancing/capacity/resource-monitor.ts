/**
 * Resource Monitor
 * Real-time resource monitoring and threshold management
 */

import type { IResourceMonitor } from '../interfaces';
import type { LoadMetrics } from '../types';

export class ResourceMonitor implements IResourceMonitor {
  private monitoringAgents: Set<string> = new Set();
  private metricsCache: Map<string, LoadMetrics> = new Map();
  private thresholds: Map<string, Record<string, number>> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  public async startMonitoring(agentId: string): Promise<void> {
    if (this.monitoringAgents.has(agentId)) return;

    this.monitoringAgents.add(agentId);

    // Start periodic monitoring
    const interval = setInterval(async () => {
      await this.collectMetrics(agentId);
    }, 5000); // Collect every 5 seconds

    this.monitoringIntervals.set(agentId, interval);
  }

  public async stopMonitoring(agentId: string): Promise<void> {
    this.monitoringAgents.delete(agentId);

    const interval = this.monitoringIntervals.get(agentId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(agentId);
    }

    this.metricsCache.delete(agentId);
  }

  public async getCurrentMetrics(agentId: string): Promise<LoadMetrics | null> {
    return this.metricsCache.get(agentId) || null;
  }

  public async getHistoricalMetrics(
    agentId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<LoadMetrics[]> {
    // In a real implementation, this would query a time-series database
    const current = this.metricsCache.get(agentId);
    return current ? [current] : [];
  }

  public async setThresholds(agentId: string, thresholds: Record<string, number>): Promise<void> {
    this.thresholds.set(agentId, thresholds);
  }

  private async collectMetrics(agentId: string): Promise<void> {
    // Mock metrics collection - in practice this would query actual agent metrics
    const metrics: LoadMetrics = {
      timestamp: new Date(),
      cpuUsage: Math.random() * 0.8,
      memoryUsage: Math.random() * 0.8,
      diskUsage: Math.random() * 0.6,
      networkUsage: Math.random() * 0.5,
      activeTasks: Math.floor(Math.random() * 10),
      queueLength: Math.floor(Math.random() * 5),
      responseTime: 500 + Math.random() * 1500,
      errorRate: Math.random() * 0.02,
      throughput: Math.random() * 100,
    };

    this.metricsCache.set(agentId, metrics);
  }
}
