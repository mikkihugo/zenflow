/**
 * Resource Monitor.
 * Real-time resource monitoring and threshold management.
 */
/**
 * @file Coordination system: resource-monitor
 */

import type { LoadMetrics } from "../types";

export class ResourceMonitor implements ResourceMonitor {
	private monitoringAgents: Set<string> = new Set();
	private metricsCache: Map<string, LoadMetrics> = new Map();
	private thresholds: Map<string, Record<string, number>> = new Map();
	private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

	public startMonitoring(agentId: string): void {
		if (this.monitoringAgents.has(agentId)) return;

		this.monitoringAgents.add(agentId);

		// Start periodic monitoring
		const interval = setInterval(() => {
			this.collectMetrics(agentId);
		}, 5000); // Collect every 5 seconds

		this.monitoringIntervals.set(agentId, interval);
	}

	public stopMonitoring(agentId: string): void {
		this.monitoringAgents.delete(agentId);

		const interval = this.monitoringIntervals.get(agentId);
		if (interval) {
			clearInterval(interval);
			this.monitoringIntervals.delete(agentId);
		}

		this.metricsCache.delete(agentId);
	}

	public getCurrentMetrics(agentId: string): LoadMetrics | null {
		return this.metricsCache.get(agentId) || null;
	}

	public getHistoricalMetrics(
		agentId: string,
		_timeRange: { start: Date; end: Date },
	): LoadMetrics[] {
		// In a real implementation, this would query a time-series database
		const current = this.metricsCache.get(agentId);
		return current ? [current] : [];
	}

	public setThresholds(
		agentId: string,
		thresholds: Record<string, number>,
	): void {
		this.thresholds.set(agentId, thresholds);
	}

	private collectMetrics(agentId: string): void {
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
