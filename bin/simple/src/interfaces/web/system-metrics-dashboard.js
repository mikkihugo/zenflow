import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('interfaces-web-system-metrics-dashboard');
import { EventEmitter } from 'node:events';
import { createRepository, DatabaseTypes, EntityTypes, } from '../../database/index.ts';
import { UACLHelpers, uacl } from '../clients/index.ts';
export class UnifiedPerformanceDashboard extends EventEmitter {
    mcpMetrics;
    enhancedMemory;
    vectorRepository;
    config;
    refreshTimer;
    isRunning = false;
    constructor(mcpMetrics, enhancedMemory, config = {}) {
        super();
        this.mcpMetrics = mcpMetrics;
        this.enhancedMemory = enhancedMemory;
        this.config = {
            refreshInterval: config?.refreshInterval ?? 1000,
            enableRealtime: config?.enableRealtime ?? true,
            maxDataPoints: config?.maxDataPoints ?? 1000,
            alertThresholds: {
                latency: config?.alertThresholds?.latency ?? 1000,
                errorRate: config?.alertThresholds?.errorRate ?? 0.05,
                memoryUsage: config?.alertThresholds?.memoryUsage ?? 100 * 1024 * 1024,
                ...config?.alertThresholds,
            },
        };
    }
    async start() {
        if (this.isRunning)
            return;
        try {
            if (!uacl.isInitialized()) {
                await uacl.initialize({
                    healthCheckInterval: this.config.refreshInterval,
                });
                const defaultHttpURL = 'http://localhost:8951';
                const defaultWsURL = 'ws://localhost:8952';
                await UACLHelpers.setupCommonClients({
                    httpBaseURL: defaultHttpURL,
                    websocketURL: defaultWsURL,
                });
            }
        }
        catch (error) {
            logger.warn('⚠️ Could not initialize UACL for dashboard:', error);
        }
        try {
            this.vectorRepository = await createRepository(EntityTypes.VectorDocument, DatabaseTypes?.LanceDB, {
                database: './data/dashboard-metrics',
                options: { vectorSize: 384, metricType: 'cosine' },
            });
        }
        catch (error) {
            logger.warn('⚠️ Could not initialize database metrics repository:', error);
        }
        if (this.config.enableRealtime) {
            this.refreshTimer = setInterval(() => {
                this.updateDashboard();
            }, this.config.refreshInterval);
        }
        this.isRunning = true;
        this.emit('started');
        this.displayInitialStatus();
    }
    async stop() {
        if (!this.isRunning)
            return;
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = undefined;
        }
        this.isRunning = false;
        this.emit('stopped');
    }
    async getSystemStatus() {
        const mcpMetrics = this.mcpMetrics.getMetrics();
        const mcpSummary = this.mcpMetrics.getPerformanceSummary();
        const memoryStats = this.enhancedMemory.getStats();
        const dbStats = await this.getDatabaseStats();
        const clientMetrics = await this.getClientMetrics();
        const health = this.assessSystemHealth(mcpMetrics, memoryStats, dbStats, clientMetrics);
        return {
            health,
            metrics: {
                mcp: mcpMetrics,
                memory: memoryStats,
                database: dbStats,
                neural: mcpMetrics.neural,
                clients: clientMetrics,
            },
            performance: {
                uptime: mcpSummary.uptime,
                totalOperations: mcpSummary.totalOperations,
                systemLoad: this.getSystemLoad(),
                memoryUsage: process.memoryUsage().heapUsed,
            },
        };
    }
    assessSystemHealth(mcpMetrics, memoryStats, dbStats, clientMetrics) {
        const alerts = [];
        const mcpErrorRate = mcpMetrics.requests.failed / Math.max(1, mcpMetrics.requests.total);
        const mcpHealth = this.assessComponentHealth(mcpMetrics.requests.averageLatency, mcpErrorRate, 'mcp');
        if (mcpHealth !== 'healthy') {
            alerts.push({
                level: mcpHealth === 'warning' ? 'warning' : 'error',
                component: 'MCP',
                message: `High latency (${mcpMetrics.requests.averageLatency}ms) or error rate (${(mcpErrorRate * 100).toFixed(1)}%)`,
                timestamp: Date.now(),
            });
        }
        const memoryHealth = this.assessComponentHealth(0, 0, 'memory', memoryStats.totalSize);
        if (memoryHealth !== 'healthy') {
            alerts.push({
                level: 'warning',
                component: 'Memory',
                message: `High memory usage: ${Math.round(memoryStats.totalSize / 1024 / 1024)}MB`,
                timestamp: Date.now(),
            });
        }
        const dbHealth = this.assessComponentHealth(dbStats.averageSearchTime, 0, 'database');
        if (dbHealth !== 'healthy' && dbStats.totalVectors > 0) {
            alerts.push({
                level: 'warning',
                component: 'Database',
                message: `Slow search performance: ${dbStats.averageSearchTime}ms average`,
                timestamp: Date.now(),
            });
        }
        const neuralHealth = mcpMetrics.neural.accuracy < 0.8 ? 'warning' : 'healthy';
        if (neuralHealth !== 'healthy') {
            alerts.push({
                level: 'warning',
                component: 'Neural',
                message: `Low accuracy: ${(mcpMetrics.neural.accuracy * 100).toFixed(1)}%`,
                timestamp: Date.now(),
            });
        }
        const clientHealth = this.assessClientHealth(clientMetrics, alerts);
        const componentHealths = [
            mcpHealth,
            memoryHealth,
            dbHealth,
            neuralHealth,
            clientHealth,
        ];
        const overall = componentHealths.includes('critical')
            ? 'critical'
            : componentHealths.includes('warning')
                ? 'warning'
                : 'healthy';
        return {
            overall,
            components: {
                mcp: mcpHealth,
                memory: memoryHealth,
                database: dbHealth,
                neural: neuralHealth,
                clients: clientHealth,
            },
            alerts,
        };
    }
    assessComponentHealth(latency, errorRate, component, memoryUsage) {
        if (component === 'memory' && memoryUsage) {
            if (memoryUsage > this.config.alertThresholds.memoryUsage * 2) {
                return 'critical';
            }
            if (memoryUsage > this.config.alertThresholds.memoryUsage) {
                return 'warning';
            }
        }
        if (latency > this.config.alertThresholds.latency * 2 ||
            errorRate > this.config.alertThresholds.errorRate * 2) {
            return 'critical';
        }
        if (latency > this.config.alertThresholds.latency ||
            errorRate > this.config.alertThresholds.errorRate) {
            return 'warning';
        }
        return 'healthy';
    }
    getSystemLoad() {
        const usage = process.cpuUsage();
        return (usage.user + usage.system) / 1000000;
    }
    async updateDashboard() {
        try {
            const status = await this.getSystemStatus();
            this.emit('statusUpdate', status);
            if (this.listenerCount('statusUpdate') === 0) {
                this.displayConsoleStatus(status);
            }
        }
        catch (error) {
            logger.error('❌ Dashboard update failed:', error);
        }
    }
    displayInitialStatus() { }
    async getDatabaseStats() {
        try {
            if (!this.vectorRepository) {
                return {
                    totalVectors: 0,
                    totalTables: 0,
                    averageSearchTime: 0,
                    indexedVectors: 0,
                    cacheHitRate: 0,
                };
            }
            const startTime = Date.now();
            const allVectors = await this.vectorRepository.findAll({ limit: 1000 });
            const searchTime = Date.now() - startTime;
            return {
                totalVectors: allVectors.length,
                totalTables: 1,
                averageSearchTime: searchTime,
                indexedVectors: allVectors.length,
                cacheHitRate: 0.85,
            };
        }
        catch (error) {
            logger.warn('⚠️ Could not get database stats:', error);
            return {
                totalVectors: 0,
                totalTables: 0,
                averageSearchTime: 0,
                indexedVectors: 0,
                cacheHitRate: 0,
            };
        }
    }
    displayConsoleStatus(status) {
        const _healthEmoji = status.health.overall === 'healthy'
            ? '✅'
            : status.health.overall === 'warning'
                ? '⚠️'
                : '❌';
        if (status.health.alerts.length > 0) {
            status.health.alerts.forEach((alert) => {
                const _alertEmoji = alert.level === 'error'
                    ? '❌'
                    : alert.level === 'warning'
                        ? '⚠️'
                        : 'ℹ️';
            });
        }
        else {
        }
    }
    async getClientMetrics() {
        try {
            if (!uacl.isInitialized()) {
                return {
                    total: 0,
                    connected: 0,
                    byType: {},
                    avgLatency: 0,
                    errors: 0,
                    healthPercentage: 0,
                };
            }
            const metrics = uacl.getMetrics();
            const healthPercentage = metrics.total > 0 ? (metrics.connected / metrics.total) * 100 : 100;
            return {
                total: metrics.total,
                connected: metrics.connected,
                byType: metrics.byType,
                avgLatency: metrics.avgLatency,
                errors: metrics.totalErrors,
                healthPercentage,
            };
        }
        catch (error) {
            logger.warn('⚠️ Could not get client metrics:', error);
            return {
                total: 0,
                connected: 0,
                byType: {},
                avgLatency: 0,
                errors: 0,
                healthPercentage: 0,
            };
        }
    }
    assessClientHealth(clientMetrics, alerts) {
        if (!clientMetrics || clientMetrics.total === 0) {
            return 'healthy';
        }
        const { healthPercentage, errors, avgLatency } = clientMetrics;
        let clientHealth = 'healthy';
        if (healthPercentage < 50) {
            clientHealth = 'critical';
            alerts.push({
                level: 'error',
                component: 'Clients',
                message: `Critical: Only ${healthPercentage.toFixed(1)}% of clients are healthy`,
                timestamp: Date.now(),
            });
        }
        else if (healthPercentage < 80) {
            clientHealth = 'warning';
            alerts.push({
                level: 'warning',
                component: 'Clients',
                message: `Warning: ${healthPercentage.toFixed(1)}% of clients are healthy`,
                timestamp: Date.now(),
            });
        }
        if (errors > 10) {
            if (clientHealth !== 'critical') {
                clientHealth = 'warning';
            }
            alerts.push({
                level: 'warning',
                component: 'Clients',
                message: `High error count: ${errors} client errors detected`,
                timestamp: Date.now(),
            });
        }
        if (avgLatency > 5000) {
            if (clientHealth !== 'critical') {
                clientHealth = 'warning';
            }
            alerts.push({
                level: 'warning',
                component: 'Clients',
                message: `High latency: ${avgLatency.toFixed(0)}ms average response time`,
                timestamp: Date.now(),
            });
        }
        return clientHealth;
    }
    async generateReport() {
        const status = await this.getSystemStatus();
        const recommendations = this.mcpMetrics.getOptimizationRecommendations();
        const report = {
            timestamp: new Date().toISOString(),
            dashboard: 'Claude Zen Performance Dashboard',
            version: '2.0.0',
            status,
            recommendations,
            summary: {
                totalComponents: 4,
                healthyComponents: Object.values(status.health.components).filter((h) => h === 'healthy').length,
                totalAlerts: status.health.alerts.length,
                uptime: status.performance.uptime,
                systemLoad: status.performance.systemLoad,
            },
        };
        return JSON.stringify(report, null, 2);
    }
}
export default UnifiedPerformanceDashboard;
//# sourceMappingURL=system-metrics-dashboard.js.map