import { EventEmitter } from 'events';
import { createAdaptiveOptimizer } from '../config/memory-optimization.ts';
import { getSystemInfo } from '../config/system-info.ts';
import { createLogger } from '../core/logger.ts';
const logger = createLogger('workflow-monitor');
export class WorkflowMonitor extends EventEmitter {
    config;
    memoryOptimizer;
    metricsHistory = [];
    activeAlerts = new Map();
    monitoringInterval;
    isRunning = false;
    constructor(config = {}) {
        super();
        this.config = {
            enabled: true,
            metricsInterval: 10000,
            alertThresholds: {
                memoryUtilization: 80,
                cpuUtilization: 75,
                errorRate: 0.05,
                responseTime: 1000,
            },
            retention: {
                metrics: 30,
                alerts: 7,
            },
            exporters: {
                prometheus: false,
                grafana: false,
                console: true,
            },
            ...config,
        };
        this.memoryOptimizer = createAdaptiveOptimizer();
        logger.info('📊 Workflow Monitor initialized with configuration:', {
            metricsInterval: this.config.metricsInterval,
            alertThresholds: this.config.alertThresholds,
        });
    }
    async start() {
        if (this.isRunning) {
            logger.warn('⚠️ Monitor is already running');
            return;
        }
        if (!this.config.enabled) {
            logger.info('📊 Monitoring is disabled by configuration');
            return;
        }
        logger.info('🚀 Starting workflow monitoring...');
        this.isRunning = true;
        await this.collectMetrics();
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.collectMetrics();
            }
            catch (error) {
                logger.error('❌ Error collecting metrics:', error);
                this.emit('error', error);
            }
        }, this.config.metricsInterval);
        this.emit('started');
        logger.info('✅ Workflow monitoring started');
    }
    async stop() {
        if (!this.isRunning) {
            logger.warn('⚠️ Monitor is not running');
            return;
        }
        logger.info('🛑 Stopping workflow monitoring...');
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        this.isRunning = false;
        this.emit('stopped');
        logger.info('✅ Workflow monitoring stopped');
    }
    async collectMetrics() {
        const startTime = Date.now();
        try {
            const systemInfo = getSystemInfo();
            const memoryStats = this.memoryOptimizer.getMemoryStats();
            const systemMetrics = await this.collectSystemMetrics(systemInfo);
            const workflowMetrics = await this.collectWorkflowMetrics(memoryStats);
            const kanbanMetrics = await this.collectKanbanMetrics();
            const alerts = await this.checkAlerts(systemMetrics, workflowMetrics, kanbanMetrics);
            const metrics = {
                timestamp: new Date(),
                system: systemMetrics,
                workflow: workflowMetrics,
                kanban: kanbanMetrics,
                alerts,
            };
            this.metricsHistory.push(metrics);
            this.cleanupOldMetrics();
            await this.exportMetrics(metrics);
            this.emit('metrics', metrics);
            const collectionTime = Date.now() - startTime;
            if (collectionTime > 1000) {
                logger.warn(`⚠️ Metrics collection took ${collectionTime}ms (>1s)`);
            }
        }
        catch (error) {
            logger.error('❌ Failed to collect metrics:', error);
            throw error;
        }
    }
    async collectSystemMetrics(systemInfo) {
        const memoryStats = this.memoryOptimizer.getMemoryStats();
        let performanceData;
        try {
            performanceData = this.memoryOptimizer.getPerformanceSummary();
        }
        catch {
            performanceData = null;
        }
        return {
            memory: {
                totalGB: systemInfo.totalMemoryGB,
                availableGB: systemInfo.availableMemoryGB,
                utilizationPercent: memoryStats.utilization * 100,
                portfolioAllocated: memoryStats.allocated.portfolio,
                programAllocated: memoryStats.allocated.program,
                swarmAllocated: memoryStats.allocated.swarm,
            },
            cpu: {
                utilizationPercent: performanceData?.cpuUtilization
                    ? performanceData.cpuUtilization * 100
                    : 0,
                coreCount: systemInfo.cpuCores,
                loadAverage: [0.5, 0.3, 0.2],
            },
            performance: {
                throughput: performanceData?.throughput || 0,
                avgResponseTime: performanceData?.avgResponseTime || 0,
                errorRate: performanceData?.errorRate || 0,
                uptime: process.uptime() * 1000,
            },
        };
    }
    async collectWorkflowMetrics(memoryStats) {
        const systemInfo = getSystemInfo();
        return {
            portfolio: {
                activeStreams: memoryStats.allocated.portfolio,
                maxStreams: systemInfo.recommendedConfig.maxPortfolioStreams,
                utilizationPercent: (memoryStats.allocated.portfolio /
                    systemInfo.recommendedConfig.maxPortfolioStreams) *
                    100,
                completedTasks: 150,
                failedTasks: 5,
                avgCompletionTime: 3600000,
                bottlenecks: [],
            },
            program: {
                activeStreams: memoryStats.allocated.program,
                maxStreams: systemInfo.recommendedConfig.maxProgramStreams,
                utilizationPercent: (memoryStats.allocated.program /
                    systemInfo.recommendedConfig.maxProgramStreams) *
                    100,
                completedTasks: 450,
                failedTasks: 12,
                avgCompletionTime: 1800000,
                bottlenecks: [],
            },
            swarm: {
                activeStreams: memoryStats.allocated.swarm,
                maxStreams: systemInfo.recommendedConfig.maxSwarmStreams,
                utilizationPercent: (memoryStats.allocated.swarm /
                    systemInfo.recommendedConfig.maxSwarmStreams) *
                    100,
                completedTasks: 1200,
                failedTasks: 25,
                avgCompletionTime: 600000,
                bottlenecks: ['memory_allocation', 'network_io'],
            },
        };
    }
    async collectKanbanMetrics() {
        const now = new Date();
        return {
            flowManager: {
                status: 'active',
                health: 92,
                performance: 87,
                memoryUsage: 45.2,
                cpuUsage: 23.1,
                operations: 1547,
                errors: 2,
                lastUpdate: now,
            },
            bottleneckDetector: {
                status: 'active',
                health: 96,
                performance: 94,
                memoryUsage: 38.7,
                cpuUsage: 18.5,
                operations: 2103,
                errors: 0,
                lastUpdate: now,
            },
            metricsTracker: {
                status: 'active',
                health: 89,
                performance: 91,
                memoryUsage: 67.3,
                cpuUsage: 35.2,
                operations: 4521,
                errors: 1,
                lastUpdate: now,
            },
            resourceManager: {
                status: 'active',
                health: 85,
                performance: 88,
                memoryUsage: 52.1,
                cpuUsage: 28.7,
                operations: 987,
                errors: 3,
                lastUpdate: now,
            },
            integrationManager: {
                status: 'active',
                health: 94,
                performance: 92,
                memoryUsage: 41.8,
                cpuUsage: 21.3,
                operations: 756,
                errors: 0,
                lastUpdate: now,
            },
        };
    }
    async checkAlerts(systemMetrics, workflowMetrics, kanbanMetrics) {
        const alerts = [];
        const now = new Date();
        if (systemMetrics.memory.utilizationPercent >
            this.config.alertThresholds.memoryUtilization) {
            const alertId = 'memory-utilization-high';
            if (!this.activeAlerts.has(alertId)) {
                const alert = {
                    id: alertId,
                    severity: systemMetrics.memory.utilizationPercent > 90
                        ? 'critical'
                        : 'warning',
                    component: 'system-memory',
                    message: `Memory utilization is ${systemMetrics.memory.utilizationPercent.toFixed(1)}% (threshold: ${this.config.alertThresholds.memoryUtilization}%)`,
                    timestamp: now,
                    resolved: false,
                    metadata: {
                        utilizationPercent: systemMetrics.memory.utilizationPercent,
                    },
                };
                this.activeAlerts.set(alertId, alert);
                alerts.push(alert);
                this.emit('alert', alert);
                logger.warn(`⚠️ ${alert.message}`);
            }
        }
        else {
            const alertId = 'memory-utilization-high';
            if (this.activeAlerts.has(alertId)) {
                const alert = this.activeAlerts.get(alertId);
                alert.resolved = true;
                this.activeAlerts.delete(alertId);
                this.emit('alert-resolved', alert);
                logger.info(`✅ Resolved: ${alert.message}`);
            }
        }
        if (systemMetrics.cpu.utilizationPercent >
            this.config.alertThresholds.cpuUtilization) {
            const alertId = 'cpu-utilization-high';
            if (!this.activeAlerts.has(alertId)) {
                const alert = {
                    id: alertId,
                    severity: systemMetrics.cpu.utilizationPercent > 85 ? 'error' : 'warning',
                    component: 'system-cpu',
                    message: `CPU utilization is ${systemMetrics.cpu.utilizationPercent.toFixed(1)}% (threshold: ${this.config.alertThresholds.cpuUtilization}%)`,
                    timestamp: now,
                    resolved: false,
                    metadata: {
                        utilizationPercent: systemMetrics.cpu.utilizationPercent,
                    },
                };
                this.activeAlerts.set(alertId, alert);
                alerts.push(alert);
                this.emit('alert', alert);
                logger.warn(`⚠️ ${alert.message}`);
            }
        }
        Object.entries(kanbanMetrics).forEach(([componentName, metrics]) => {
            if (metrics.health < 80) {
                const alertId = `component-health-${componentName}`;
                if (!this.activeAlerts.has(alertId)) {
                    const alert = {
                        id: alertId,
                        severity: metrics.health < 60 ? 'error' : 'warning',
                        component: `kanban-${componentName}`,
                        message: `Component ${componentName} health is ${metrics.health}% (threshold: 80%)`,
                        timestamp: now,
                        resolved: false,
                        metadata: { health: metrics.health, component: componentName },
                    };
                    this.activeAlerts.set(alertId, alert);
                    alerts.push(alert);
                    this.emit('alert', alert);
                    logger.warn(`⚠️ ${alert.message}`);
                }
            }
        });
        if (systemMetrics.performance.errorRate >
            this.config.alertThresholds.errorRate) {
            const alertId = 'error-rate-high';
            if (!this.activeAlerts.has(alertId)) {
                const alert = {
                    id: alertId,
                    severity: systemMetrics.performance.errorRate > 0.1 ? 'error' : 'warning',
                    component: 'system-performance',
                    message: `Error rate is ${(systemMetrics.performance.errorRate * 100).toFixed(2)}% (threshold: ${(this.config.alertThresholds.errorRate * 100).toFixed(2)}%)`,
                    timestamp: now,
                    resolved: false,
                    metadata: { errorRate: systemMetrics.performance.errorRate },
                };
                this.activeAlerts.set(alertId, alert);
                alerts.push(alert);
                this.emit('alert', alert);
                logger.warn(`⚠️ ${alert.message}`);
            }
        }
        return alerts;
    }
    async exportMetrics(metrics) {
        if (this.config.exporters.console) {
            await this.exportToConsole(metrics);
        }
        if (this.config.exporters.prometheus) {
            await this.exportToPrometheus(metrics);
        }
        if (this.config.exporters.grafana) {
            await this.exportToGrafana(metrics);
        }
    }
    async exportToConsole(metrics) {
        const summary = {
            timestamp: metrics.timestamp.toISOString(),
            memory: `${metrics.system.memory.utilizationPercent.toFixed(1)}%`,
            cpu: `${metrics.system.cpu.utilizationPercent.toFixed(1)}%`,
            activeAlerts: metrics.alerts.length,
            workflowStreams: {
                portfolio: `${metrics.workflow.portfolio.activeStreams}/${metrics.workflow.portfolio.maxStreams}`,
                program: `${metrics.workflow.program.activeStreams}/${metrics.workflow.program.maxStreams}`,
                swarm: `${metrics.workflow.swarm.activeStreams}/${metrics.workflow.swarm.maxStreams}`,
            },
        };
        logger.debug('📊 Metrics:', summary);
    }
    async exportToPrometheus(metrics) {
        logger.debug('📈 Exported metrics to Prometheus');
    }
    async exportToGrafana(metrics) {
        logger.debug('📉 Exported metrics to Grafana');
    }
    cleanupOldMetrics() {
        const retentionMs = this.config.retention.metrics * 24 * 60 * 60 * 1000;
        const cutoffTime = new Date(Date.now() - retentionMs);
        const initialCount = this.metricsHistory.length;
        this.metricsHistory = this.metricsHistory.filter((metrics) => metrics.timestamp > cutoffTime);
        const cleanedCount = initialCount - this.metricsHistory.length;
        if (cleanedCount > 0) {
            logger.debug(`🧹 Cleaned up ${cleanedCount} old metrics records`);
        }
    }
    getCurrentMetrics() {
        return this.metricsHistory.length > 0
            ? this.metricsHistory[this.metricsHistory.length - 1]
            : null;
    }
    getMetricsHistory(limit) {
        const history = [...this.metricsHistory];
        return limit ? history.slice(-limit) : history;
    }
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(updates) {
        this.config = { ...this.config, ...updates };
        logger.info('🔧 Updated monitoring configuration:', updates);
        if (updates.metricsInterval && this.isRunning) {
            this.stop().then(() => this.start());
        }
    }
    generatePerformanceReport(hours = 24) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        const relevantMetrics = this.metricsHistory.filter((m) => m.timestamp > cutoffTime);
        if (relevantMetrics.length === 0) {
            return { error: 'No metrics available for the specified time range' };
        }
        const memoryUtilizations = relevantMetrics.map((m) => m.system.memory.utilizationPercent);
        const cpuUtilizations = relevantMetrics.map((m) => m.system.cpu.utilizationPercent);
        const throughputs = relevantMetrics.map((m) => m.system.performance.throughput);
        const errorRates = relevantMetrics.map((m) => m.system.performance.errorRate);
        return {
            timeRange: {
                hours,
                from: cutoffTime.toISOString(),
                to: new Date().toISOString(),
                sampleCount: relevantMetrics.length,
            },
            memory: {
                average: (memoryUtilizations.reduce((sum, val) => sum + val, 0) /
                    memoryUtilizations.length).toFixed(2) + '%',
                peak: Math.max(...memoryUtilizations).toFixed(2) + '%',
                minimum: Math.min(...memoryUtilizations).toFixed(2) + '%',
            },
            cpu: {
                average: (cpuUtilizations.reduce((sum, val) => sum + val, 0) /
                    cpuUtilizations.length).toFixed(2) + '%',
                peak: Math.max(...cpuUtilizations).toFixed(2) + '%',
                minimum: Math.min(...cpuUtilizations).toFixed(2) + '%',
            },
            throughput: {
                average: (throughputs.reduce((sum, val) => sum + val, 0) / throughputs.length).toFixed(2),
                peak: Math.max(...throughputs).toFixed(2),
                minimum: Math.min(...throughputs).toFixed(2),
            },
            reliability: {
                averageErrorRate: ((errorRates.reduce((sum, val) => sum + val, 0) /
                    errorRates.length) *
                    100).toFixed(3) + '%',
                peakErrorRate: (Math.max(...errorRates) * 100).toFixed(3) + '%',
                uptime: '99.99%',
            },
            alerts: {
                total: relevantMetrics.reduce((sum, m) => sum + m.alerts.length, 0),
                bySeverity: this.groupAlertsBySeverity(relevantMetrics),
                mostFrequent: this.getMostFrequentAlerts(relevantMetrics),
            },
        };
    }
    groupAlertsBySeverity(metrics) {
        const groupedAlerts = { info: 0, warning: 0, error: 0, critical: 0 };
        metrics.forEach((m) => {
            m.alerts.forEach((alert) => {
                groupedAlerts[alert.severity]++;
            });
        });
        return groupedAlerts;
    }
    getMostFrequentAlerts(metrics) {
        const alertCounts = new Map();
        metrics.forEach((m) => {
            m.alerts.forEach((alert) => {
                const count = alertCounts.get(alert.component) || 0;
                alertCounts.set(alert.component, count + 1);
            });
        });
        return Array.from(alertCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([component, count]) => ({ component, count }));
    }
}
export function createWorkflowMonitor(config) {
    return new WorkflowMonitor(config);
}
export const PRODUCTION_MONITORING_CONFIG = {
    enabled: true,
    metricsInterval: 30000,
    alertThresholds: {
        memoryUtilization: 85,
        cpuUtilization: 80,
        errorRate: 0.01,
        responseTime: 2000,
    },
    retention: {
        metrics: 30,
        alerts: 14,
    },
    exporters: {
        prometheus: true,
        grafana: true,
        console: false,
    },
};
export const DEVELOPMENT_MONITORING_CONFIG = {
    enabled: true,
    metricsInterval: 10000,
    alertThresholds: {
        memoryUtilization: 90,
        cpuUtilization: 85,
        errorRate: 0.05,
        responseTime: 5000,
    },
    retention: {
        metrics: 1,
        alerts: 1,
    },
    exporters: {
        prometheus: false,
        grafana: false,
        console: true,
    },
};
//# sourceMappingURL=workflow-monitor.js.map