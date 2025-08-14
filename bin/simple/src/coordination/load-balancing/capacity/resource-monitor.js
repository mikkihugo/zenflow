export class ResourceMonitor {
    monitoringAgents = new Set();
    metricsCache = new Map();
    thresholds = new Map();
    monitoringIntervals = new Map();
    async startMonitoring(agentId) {
        if (this.monitoringAgents.has(agentId))
            return;
        this.monitoringAgents.add(agentId);
        const interval = setInterval(async () => {
            await this.collectMetrics(agentId);
        }, 5000);
        this.monitoringIntervals.set(agentId, interval);
    }
    async stopMonitoring(agentId) {
        this.monitoringAgents.delete(agentId);
        const interval = this.monitoringIntervals.get(agentId);
        if (interval) {
            clearInterval(interval);
            this.monitoringIntervals.delete(agentId);
        }
        this.metricsCache.delete(agentId);
    }
    async getCurrentMetrics(agentId) {
        return this.metricsCache.get(agentId) || null;
    }
    async getHistoricalMetrics(agentId, _timeRange) {
        const current = this.metricsCache.get(agentId);
        return current ? [current] : [];
    }
    async setThresholds(agentId, thresholds) {
        this.thresholds.set(agentId, thresholds);
    }
    async collectMetrics(agentId) {
        const metrics = {
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
//# sourceMappingURL=resource-monitor.js.map