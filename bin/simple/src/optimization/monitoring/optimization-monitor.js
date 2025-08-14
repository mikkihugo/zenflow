import { EventEmitter } from 'node:events';
export class OptimizationMonitor extends EventEmitter {
    config;
    metricsHistory = new Map();
    alerts = [];
    optimizationHistory = [];
    isMonitoring = false;
    monitoringInterval;
    constructor(config = {}) {
        super();
        this.config = {
            enabled: true,
            monitoringInterval: 5000,
            alertThresholds: {
                latency: 100,
                throughput: 1000,
                memoryUsage: 0.9,
                cpuUsage: 0.8,
                errorRate: 0.01,
            },
            retentionPeriod: 24 * 60 * 60 * 1000,
            realTimeUpdates: true,
            ...config,
        };
    }
    startMonitoring() {
        if (!this.config.enabled || this.isMonitoring) {
            return;
        }
        this.isMonitoring = true;
        this.emit('monitoring:started');
        this.monitoringInterval = setInterval(() => this.performMonitoringCycle(), this.config.monitoringInterval);
    }
    stopMonitoring() {
        if (!this.isMonitoring)
            return;
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        this.emit('monitoring:stopped');
    }
    recordOptimizationResult(result) {
        this.optimizationHistory.push(result);
        const cutoff = Date.now() - this.config.retentionPeriod;
        this.optimizationHistory = this.optimizationHistory.filter((r) => r.afterMetrics.timestamp.getTime() > cutoff);
        this.emit('optimization:recorded', result);
        this.checkPerformanceDegradation(result);
    }
    recordMetrics(domain, metrics) {
        const domainHistory = this.metricsHistory.get(domain) || [];
        domainHistory.push(metrics);
        const cutoff = Date.now() - this.config.retentionPeriod;
        const filteredHistory = domainHistory.filter((m) => m.timestamp.getTime() > cutoff);
        this.metricsHistory.set(domain, filteredHistory);
        this.emit('metrics:recorded', { domain, metrics });
        this.checkThresholds(domain, metrics);
    }
    getDashboard() {
        const currentMetrics = this.getCurrentMetrics();
        const trends = this.calculateTrends();
        const systemHealth = this.assessSystemHealth();
        const recommendations = this.generateRecommendations();
        return {
            currentMetrics,
            trends,
            alerts: this.getActiveAlerts(),
            optimizationHistory: this.getRecentOptimizations(),
            systemHealth,
            recommendations,
        };
    }
    getAlertsBySeverity(severity) {
        return this.alerts.filter((alert) => alert.severity === severity && !alert.acknowledged);
    }
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find((a) => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            this.emit('alert:acknowledged', alert);
        }
    }
    getOptimizationTrends(_domain, period = 3600000) {
        const cutoff = Date.now() - period;
        const recentOptimizations = this.optimizationHistory.filter((r) => r.afterMetrics.timestamp.getTime() > cutoff);
        const improvements = recentOptimizations.map((r) => r.improvement);
        const successes = recentOptimizations.filter((r) => r.success).length;
        const failures = recentOptimizations.filter((r) => !r.success).length;
        return {
            improvements,
            successes: [successes],
            failures: [failures],
        };
    }
    async performMonitoringCycle() {
        try {
            const domains = ['neural', 'swarm', 'data', 'wasm'];
            for (const domain of domains) {
                const metrics = await this.collectDomainMetrics(domain);
                this.recordMetrics(domain, metrics);
            }
            this.cleanupOldData();
            this.emit('monitoring:cycle:completed');
        }
        catch (error) {
            this.emit('monitoring:cycle:error', error);
        }
    }
    checkPerformanceDegradation(result) {
        if (!result?.success) {
            this.createAlert({
                type: 'optimization_failure',
                severity: 'high',
                domain: 'system',
                message: `Optimization failed: ${result?.error}`,
                metrics: result?.beforeMetrics,
            });
            return;
        }
        if (result?.improvement < 0) {
            this.createAlert({
                type: 'performance_degradation',
                severity: 'medium',
                domain: 'system',
                message: `Performance degraded by ${Math.abs(result?.improvement * 100).toFixed(1)}%`,
                metrics: result?.afterMetrics,
            });
        }
    }
    checkThresholds(domain, metrics) {
        const thresholds = this.config.alertThresholds;
        if (metrics.latency > thresholds.latency) {
            this.createAlert({
                type: 'resource_threshold',
                severity: 'high',
                domain,
                message: `High latency detected: ${metrics.latency.toFixed(1)}ms`,
                metrics,
            });
        }
        if (metrics.throughput < thresholds.throughput) {
            this.createAlert({
                type: 'resource_threshold',
                severity: 'medium',
                domain,
                message: `Low throughput detected: ${metrics.throughput.toFixed(0)} req/sec`,
                metrics,
            });
        }
        if (metrics.memoryUsage > thresholds.memoryUsage) {
            this.createAlert({
                type: 'resource_threshold',
                severity: 'critical',
                domain,
                message: `High memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`,
                metrics,
            });
        }
        if (metrics.cpuUsage > thresholds.cpuUsage) {
            this.createAlert({
                type: 'resource_threshold',
                severity: 'high',
                domain,
                message: `High CPU usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`,
                metrics,
            });
        }
        if (metrics.errorRate > thresholds.errorRate) {
            this.createAlert({
                type: 'resource_threshold',
                severity: 'critical',
                domain,
                message: `High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
                metrics,
            });
        }
    }
    createAlert(alertData) {
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date(),
            acknowledged: false,
            ...alertData,
        };
        this.alerts.push(alert);
        this.emit('alert:created', alert);
        const cutoff = Date.now() - this.config.retentionPeriod;
        this.alerts = this.alerts.filter((a) => a.timestamp.getTime() > cutoff);
    }
    getCurrentMetrics() {
        const allMetrics = [];
        for (const domainMetrics of this.metricsHistory.values()) {
            if (domainMetrics.length > 0) {
                const lastMetric = domainMetrics[domainMetrics.length - 1];
                if (lastMetric) {
                    allMetrics.push(lastMetric);
                }
            }
        }
        if (allMetrics.length === 0) {
            return {
                latency: 0,
                throughput: 0,
                memoryUsage: 0,
                cpuUsage: 0,
                errorRate: 0,
                timestamp: new Date(),
            };
        }
        return {
            latency: allMetrics.reduce((sum, m) => sum + m.latency, 0) / allMetrics.length,
            throughput: allMetrics.reduce((sum, m) => sum + m.throughput, 0) /
                allMetrics.length,
            memoryUsage: allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
                allMetrics.length,
            cpuUsage: allMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / allMetrics.length,
            errorRate: allMetrics.reduce((sum, m) => sum + m.errorRate, 0) / allMetrics.length,
            timestamp: new Date(),
        };
    }
    calculateTrends() {
        const trends = {
            latency: [],
            throughput: [],
            memoryUsage: [],
            cpuUsage: [],
        };
        const allMetrics = [];
        for (const domainMetrics of this.metricsHistory.values()) {
            allMetrics.push(...domainMetrics);
        }
        allMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const recentMetrics = allMetrics.slice(-20);
        trends.latency = recentMetrics.map((m) => m.latency);
        trends.throughput = recentMetrics.map((m) => m.throughput);
        trends.memoryUsage = recentMetrics.map((m) => m.memoryUsage);
        trends.cpuUsage = recentMetrics.map((m) => m.cpuUsage);
        return trends;
    }
    assessSystemHealth() {
        const thresholds = this.config.alertThresholds;
        const currentMetrics = this.getCurrentMetrics();
        const domains = {};
        let overallHealth = 'healthy';
        for (const [domain, metrics] of this.metricsHistory.entries()) {
            if (metrics.length === 0) {
                domains[domain] = 'warning';
                continue;
            }
            const lastMetric = metrics[metrics.length - 1];
            const current = lastMetric || currentMetrics;
            let domainHealth = 'healthy';
            if (current?.memoryUsage > thresholds.memoryUsage ||
                current?.errorRate > thresholds.errorRate) {
                domainHealth = 'critical';
            }
            else if (current?.latency > thresholds.latency ||
                current?.cpuUsage > thresholds.cpuUsage ||
                current?.throughput < thresholds.throughput) {
                domainHealth = 'warning';
            }
            domains[domain] = domainHealth;
            if (domainHealth === 'critical') {
                overallHealth = 'critical';
            }
            else if (domainHealth === 'warning' && overallHealth === 'healthy') {
                overallHealth = 'warning';
            }
        }
        return { overall: overallHealth, domains };
    }
    generateRecommendations() {
        const recommendations = [];
        const currentMetrics = this.getCurrentMetrics();
        const thresholds = this.config.alertThresholds;
        if (currentMetrics?.latency > thresholds.latency) {
            recommendations.push({
                id: 'latency-optimization',
                domain: 'system',
                type: 'latency_reduction',
                priority: 'high',
                description: 'Implement caching and optimize message routing to reduce latency',
                estimatedImpact: 0.4,
                implementationEffort: 'medium',
                automated: true,
            });
        }
        if (currentMetrics?.memoryUsage > thresholds.memoryUsage) {
            recommendations.push({
                id: 'memory-optimization',
                domain: 'system',
                type: 'memory_optimization',
                priority: 'critical',
                description: 'Enable memory compression and implement garbage collection optimization',
                estimatedImpact: 0.3,
                implementationEffort: 'high',
                automated: true,
            });
        }
        if (currentMetrics?.throughput < thresholds.throughput) {
            recommendations.push({
                id: 'throughput-optimization',
                domain: 'system',
                type: 'throughput_improvement',
                priority: 'medium',
                description: 'Enable batch processing and implement connection pooling',
                estimatedImpact: 0.5,
                implementationEffort: 'medium',
                automated: true,
            });
        }
        return recommendations;
    }
    getActiveAlerts() {
        return this.alerts.filter((alert) => !alert.acknowledged).slice(-10);
    }
    getRecentOptimizations() {
        return this.optimizationHistory.slice(-20);
    }
    async collectDomainMetrics(domain) {
        const baseLatency = { neural: 50, swarm: 10, data: 30, wasm: 5 }[domain] || 20;
        const baseThroughput = { neural: 500, swarm: 2000, data: 1000, wasm: 3000 }[domain] || 1000;
        return {
            latency: baseLatency + Math.random() * 20,
            throughput: baseThroughput + Math.random() * 500,
            memoryUsage: 0.3 + Math.random() * 0.4,
            cpuUsage: 0.2 + Math.random() * 0.4,
            errorRate: Math.random() * 0.005,
            timestamp: new Date(),
        };
    }
    cleanupOldData() {
        const cutoff = Date.now() - this.config.retentionPeriod;
        for (const [domain, metrics] of this.metricsHistory.entries()) {
            const filteredMetrics = metrics.filter((m) => m.timestamp.getTime() > cutoff);
            this.metricsHistory.set(domain, filteredMetrics);
        }
        this.alerts = this.alerts.filter((a) => a.timestamp.getTime() > cutoff);
        this.optimizationHistory = this.optimizationHistory.filter((r) => r.afterMetrics.timestamp.getTime() > cutoff);
    }
}
//# sourceMappingURL=optimization-monitor.js.map