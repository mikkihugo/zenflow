import { EventEmitter } from 'node:events';
import { ErrorFactory } from './errors.ts';
import { Logger } from './logger.ts';
export class MonitoringDashboard extends EventEmitter {
    options;
    logger;
    metrics;
    aggregatedMetrics;
    alerts;
    trends;
    healthStatus;
    streamingClients;
    lastUpdate;
    healthMonitor;
    recoveryWorkflows;
    connectionManager;
    mcpTools;
    aggregationTimer;
    constructor(options = {}) {
        super();
        this.options = {
            metricsRetentionPeriod: options?.metricsRetentionPeriod || 86400000,
            aggregationInterval: options?.aggregationInterval || 60000,
            enableRealTimeStreaming: options?.enableRealTimeStreaming !== false,
            enableTrendAnalysis: options?.enableTrendAnalysis !== false,
            maxDataPoints: options?.maxDataPoints || 1440,
            exportFormats: options?.exportFormats || [
                'prometheus',
                'json',
                'grafana',
            ],
            ...options,
        };
        this.logger = new Logger({
            name: 'monitoring-dashboard',
            level: process.env['LOG_LEVEL'] || 'INFO',
            metadata: { component: 'monitoring-dashboard' },
        });
        this.metrics = new Map();
        this.aggregatedMetrics = new Map();
        this.alerts = new Map();
        this.trends = new Map();
        this.healthStatus = new Map();
        this.streamingClients = new Set();
        this.lastUpdate = new Date();
        this.healthMonitor = null;
        this.recoveryWorkflows = null;
        this.connectionManager = null;
        this.mcpTools = null;
        this.aggregationTimer = null;
        this.initialize();
    }
    async initialize() {
        try {
            this.logger.info('Initializing Monitoring Dashboard');
            this.startMetricAggregation();
            this.setupDataCollection();
            this.logger.info('Monitoring Dashboard initialized successfully');
            this.emit('dashboard:initialized');
        }
        catch (error) {
            const dashboardError = ErrorFactory.createError('resource', 'Failed to initialize monitoring dashboard', {
                error: error.message,
                component: 'monitoring-dashboard',
            });
            this.logger.error('Monitoring Dashboard initialization failed', dashboardError);
            throw dashboardError;
        }
    }
    setHealthMonitor(healthMonitor) {
        this.healthMonitor = healthMonitor;
        healthMonitor.on('health:check', (result) => {
            this.recordHealthMetric(result);
        });
        healthMonitor.on('health:alert', (alert) => {
            this.recordAlert(alert);
        });
        this.logger.info('Health Monitor integration configured');
    }
    setRecoveryWorkflows(recoveryWorkflows) {
        this.recoveryWorkflows = recoveryWorkflows;
        recoveryWorkflows.on('recovery:started', (event) => {
            this.recordRecoveryMetric('started', event);
        });
        recoveryWorkflows.on('recovery:completed', (event) => {
            this.recordRecoveryMetric('completed', event);
        });
        recoveryWorkflows.on('recovery:failed', (event) => {
            this.recordRecoveryMetric('failed', event);
        });
        this.logger.info('Recovery Workflows integration configured');
    }
    setConnectionManager(connectionManager) {
        this.connectionManager = connectionManager;
        connectionManager.on('connection:established', (event) => {
            this.recordConnectionMetric('established', event);
        });
        connectionManager.on('connection:failed', (event) => {
            this.recordConnectionMetric('failed', event);
        });
        connectionManager.on('connection:closed', (event) => {
            this.recordConnectionMetric('closed', event);
        });
        this.logger.info('Connection Manager integration configured');
    }
    setMCPTools(mcpTools) {
        this.mcpTools = mcpTools;
        this.logger.info('MCP Tools integration configured');
    }
    recordHealthMetric(healthResult) {
        const timestamp = new Date();
        const metricKey = `health.${healthResult?.name}`;
        const metric = {
            timestamp,
            name: healthResult?.name,
            status: healthResult?.status,
            duration: healthResult?.duration,
            category: healthResult?.metadata?.category || 'unknown',
            priority: healthResult?.metadata?.priority || 'normal',
            failureCount: healthResult?.failureCount || 0,
        };
        this.addMetric(metricKey, metric);
        this.healthStatus.set(healthResult?.name, {
            status: healthResult?.status,
            lastUpdate: timestamp,
            failureCount: healthResult?.failureCount || 0,
        });
        if (this.options.enableRealTimeStreaming) {
            this.streamUpdate('health', metric);
        }
    }
    recordAlert(alert) {
        const timestamp = new Date();
        const alertKey = `alert.${alert.id}`;
        const alertMetric = {
            timestamp,
            id: alert.id,
            name: alert.name,
            severity: alert.severity,
            category: alert.healthCheck?.category || 'unknown',
            priority: alert.healthCheck?.priority || 'normal',
            acknowledged: alert.acknowledged,
        };
        this.addMetric(alertKey, alertMetric);
        this.alerts.set(alert.id, alertMetric);
        if (this.options.enableRealTimeStreaming) {
            this.streamUpdate('alert', alertMetric);
        }
    }
    recordRecoveryMetric(eventType, event) {
        const timestamp = new Date();
        const metricKey = `recovery.${eventType}`;
        const metric = {
            timestamp,
            eventType,
            executionId: event.executionId,
            workflowName: event.workflow?.name || event.execution?.workflowName,
            duration: event.execution?.duration,
            status: event.execution?.status,
            stepCount: event.execution?.steps?.length || 0,
        };
        this.addMetric(metricKey, metric);
        if (this.options.enableRealTimeStreaming) {
            this.streamUpdate('recovery', metric);
        }
    }
    recordConnectionMetric(eventType, event) {
        const timestamp = new Date();
        const metricKey = `connection.${eventType}`;
        const metric = {
            timestamp,
            eventType,
            connectionId: event.connectionId,
            connectionType: event.connection?.type,
            reconnectAttempts: event.connection?.reconnectAttempts || 0,
        };
        this.addMetric(metricKey, metric);
        if (this.options.enableRealTimeStreaming) {
            this.streamUpdate('connection', metric);
        }
    }
    addMetric(key, metric) {
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }
        const metrics = this.metrics.get(key);
        if (metrics) {
            metrics.push(metric);
            const cutoffTime = Date.now() - this.options.metricsRetentionPeriod;
            const filtered = metrics
                .filter((m) => m.timestamp.getTime() > cutoffTime)
                .slice(-this.options.maxDataPoints);
            this.metrics.set(key, filtered);
        }
    }
    startMetricAggregation() {
        this.aggregationTimer = setInterval(() => {
            try {
                this.aggregateMetrics();
            }
            catch (error) {
                this.logger.error('Error in metric aggregation', {
                    error: error.message,
                });
            }
        }, this.options.aggregationInterval);
        this.logger.debug('Metric aggregation started');
    }
    aggregateMetrics() {
        const timestamp = new Date();
        const aggregations = new Map();
        this.aggregateHealthMetrics(aggregations, timestamp);
        this.aggregateRecoveryMetrics(aggregations, timestamp);
        this.aggregateConnectionMetrics(aggregations, timestamp);
        this.aggregateSystemMetrics(aggregations, timestamp);
        this.aggregatedMetrics.set(timestamp.getTime(), aggregations);
        const cutoffTime = Date.now() - this.options.metricsRetentionPeriod;
        let deletedCount = 0;
        for (const [ts, aggregation] of this.aggregatedMetrics) {
            if (ts < cutoffTime) {
                this.aggregatedMetrics.delete(ts);
                deletedCount++;
                this.logger.debug('Cleaned up old aggregation', {
                    timestamp: new Date(ts),
                    dataKeys: Object.keys(aggregation),
                    totalDeleted: deletedCount,
                });
            }
        }
        if (this.options.enableTrendAnalysis) {
            this.updateTrends(aggregations, timestamp);
        }
        if (this.options.enableRealTimeStreaming) {
            this.streamUpdate('aggregation', Object.fromEntries(aggregations));
        }
        this.lastUpdate = timestamp;
    }
    aggregateHealthMetrics(aggregations, timestamp) {
        const healthMetrics = {
            totalChecks: 0,
            healthyChecks: 0,
            unhealthyChecks: 0,
            averageDuration: 0,
            totalDuration: 0,
            categories: {},
            priorities: {},
        };
        const since = timestamp.getTime() - this.options.aggregationInterval;
        for (const [key, metrics] of this.metrics) {
            if (key.startsWith('health.')) {
                const recentMetrics = metrics.filter((m) => m.timestamp.getTime() > since);
                recentMetrics.forEach((metric) => {
                    healthMetrics.totalChecks++;
                    healthMetrics.totalDuration += metric.duration || 0;
                    if (metric.status === 'healthy') {
                        healthMetrics.healthyChecks++;
                    }
                    else {
                        healthMetrics.unhealthyChecks++;
                    }
                    const category = metric.category || 'unknown';
                    healthMetrics.categories[category] =
                        (healthMetrics.categories[category] || 0) + 1;
                    const priority = metric.priority || 'normal';
                    healthMetrics.priorities[priority] =
                        (healthMetrics.priorities[priority] || 0) + 1;
                });
            }
        }
        if (healthMetrics.totalChecks > 0) {
            healthMetrics.averageDuration =
                healthMetrics.totalDuration / healthMetrics.totalChecks;
        }
        aggregations.set('health', healthMetrics);
    }
    aggregateRecoveryMetrics(aggregations, timestamp) {
        const recoveryMetrics = {
            totalRecoveries: 0,
            startedRecoveries: 0,
            completedRecoveries: 0,
            failedRecoveries: 0,
            averageDuration: 0,
            totalDuration: 0,
            workflows: {},
        };
        const since = timestamp.getTime() - this.options.aggregationInterval;
        for (const [key, metrics] of this.metrics) {
            if (key.startsWith('recovery.')) {
                const recentMetrics = metrics.filter((m) => m.timestamp.getTime() > since);
                recentMetrics.forEach((metric) => {
                    if (metric.eventType === 'started') {
                        recoveryMetrics.startedRecoveries++;
                    }
                    else if (metric.eventType === 'completed') {
                        recoveryMetrics.completedRecoveries++;
                        if (metric.duration) {
                            recoveryMetrics.totalDuration += metric.duration;
                            recoveryMetrics.totalRecoveries++;
                        }
                    }
                    else if (metric.eventType === 'failed') {
                        recoveryMetrics.failedRecoveries++;
                        if (metric.duration) {
                            recoveryMetrics.totalDuration += metric.duration;
                            recoveryMetrics.totalRecoveries++;
                        }
                    }
                    if (metric.workflowName) {
                        recoveryMetrics.workflows[metric.workflowName] =
                            (recoveryMetrics.workflows[metric.workflowName] || 0) + 1;
                    }
                });
            }
        }
        if (recoveryMetrics.totalRecoveries > 0) {
            recoveryMetrics.averageDuration =
                recoveryMetrics.totalDuration / recoveryMetrics.totalRecoveries;
        }
        aggregations.set('recovery', recoveryMetrics);
    }
    aggregateConnectionMetrics(aggregations, timestamp) {
        const connectionMetrics = {
            establishedConnections: 0,
            failedConnections: 0,
            closedConnections: 0,
            connectionTypes: {},
            totalReconnectAttempts: 0,
        };
        const since = timestamp.getTime() - this.options.aggregationInterval;
        for (const [key, metrics] of this.metrics) {
            if (key.startsWith('connection.')) {
                const recentMetrics = metrics.filter((m) => m.timestamp.getTime() > since);
                recentMetrics.forEach((metric) => {
                    if (metric.eventType === 'established') {
                        connectionMetrics.establishedConnections++;
                    }
                    else if (metric.eventType === 'failed') {
                        connectionMetrics.failedConnections++;
                    }
                    else if (metric.eventType === 'closed') {
                        connectionMetrics.closedConnections++;
                    }
                    if (metric.connectionType) {
                        connectionMetrics.connectionTypes[metric.connectionType] =
                            (connectionMetrics.connectionTypes[metric.connectionType] || 0) +
                                1;
                    }
                    connectionMetrics.totalReconnectAttempts +=
                        metric.reconnectAttempts || 0;
                });
            }
        }
        aggregations.set('connection', connectionMetrics);
    }
    aggregateSystemMetrics(aggregations, timestamp) {
        const systemMetrics = {
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            uptime: process.uptime(),
            timestamp: timestamp.getTime(),
        };
        try {
            const os = require('node:os');
            systemMetrics.loadAverage = os.loadavg();
            systemMetrics.totalMemory = os.totalmem();
            systemMetrics.freeMemory = os.freemem();
            systemMetrics.cpuCount = os.cpus().length;
        }
        catch (error) {
            this.logger.warn('Could not collect system metrics', {
                error: error.message,
            });
        }
        aggregations.set('system', systemMetrics);
    }
    updateTrends(aggregations, timestamp) {
        for (const [category, data] of aggregations) {
            if (!this.trends.has(category)) {
                this.trends.set(category, []);
            }
            const trend = this.trends.get(category);
            if (trend) {
                trend.push({
                    timestamp,
                    data,
                });
                const cutoffTime = Date.now() - this.options.metricsRetentionPeriod;
                const filteredTrend = trend.filter((t) => t.timestamp.getTime() > cutoffTime);
                this.trends.set(category, filteredTrend);
            }
        }
    }
    setupDataCollection() {
        this.collectSystemState();
        setInterval(() => {
            this.collectSystemState();
        }, this.options.aggregationInterval);
    }
    collectSystemState() {
        try {
            if (this.healthMonitor) {
                const healthData = this.healthMonitor.exportHealthData();
                this.recordSystemMetric('health_summary', {
                    totalChecks: healthData?.healthChecks.length,
                    activeAlerts: healthData?.alerts.length,
                    isMonitoring: healthData?.stats?.isRunning,
                });
            }
            if (this.recoveryWorkflows) {
                const recoveryData = this.recoveryWorkflows.exportRecoveryData();
                this.recordSystemMetric('recovery_summary', {
                    activeRecoveries: recoveryData?.activeRecoveries.length,
                    totalWorkflows: recoveryData?.workflows.length,
                    stats: recoveryData?.stats,
                });
            }
            if (this.connectionManager) {
                const connectionData = this.connectionManager.exportConnectionData();
                this.recordSystemMetric('connection_summary', {
                    totalConnections: Object.keys(connectionData?.connections).length,
                    activeConnections: connectionData?.stats?.activeConnections,
                    stats: connectionData?.stats,
                });
            }
        }
        catch (error) {
            this.logger.error('Error collecting system state', {
                error: error.message,
            });
        }
    }
    recordSystemMetric(name, data) {
        const timestamp = new Date();
        const metricKey = `system.${name}`;
        const metric = {
            timestamp,
            name,
            data,
        };
        this.addMetric(metricKey, metric);
    }
    streamUpdate(type, data) {
        const update = {
            type,
            timestamp: new Date(),
            data,
        };
        this.emit('stream:update', update);
        for (const client of this.streamingClients) {
            try {
                if (client.readyState === 1) {
                    client.send(JSON.stringify(update));
                }
            }
            catch (error) {
                this.logger.warn('Error sending stream update to client', {
                    error: error.message,
                });
                this.streamingClients.delete(client);
            }
        }
    }
    addStreamingClient(client) {
        this.streamingClients.add(client);
        const initialData = this.exportDashboardData();
        try {
            client.send(JSON.stringify({
                type: 'initial',
                timestamp: new Date(),
                data: initialData,
            }));
        }
        catch (error) {
            this.logger.warn('Error sending initial data to streaming client', {
                error: error.message,
            });
        }
        client.on('close', () => {
            this.streamingClients.delete(client);
        });
        this.logger.debug('Added streaming client', {
            totalClients: this.streamingClients.size,
        });
    }
    exportDashboardData(format = 'json') {
        const data = {
            timestamp: new Date(),
            lastUpdate: this.lastUpdate,
            summary: this.generateSummary(),
            health: this.exportHealthData(),
            recovery: this.exportRecoveryData(),
            connections: this.exportConnectionData(),
            system: this.exportSystemData(),
            alerts: this.exportAlertData(),
            trends: this.exportTrendData(),
        };
        switch (format.toLowerCase()) {
            case 'prometheus':
                return this.formatForPrometheus(data);
            case 'grafana':
                return this.formatForGrafana(data);
            default:
                return data;
        }
    }
    generateSummary() {
        const now = Date.now();
        const recentWindow = now - this.options.aggregationInterval;
        let healthySystems = 0;
        let totalSystems = 0;
        let activeAlerts = 0;
        let activeRecoveries = 0;
        let activeConnections = 0;
        for (const [name, status] of this.healthStatus) {
            totalSystems++;
            if (status.status === 'healthy') {
                healthySystems++;
            }
            this.logger.debug(`System health check: ${name}`, {
                status: status.status,
                lastUpdate: status.lastUpdate,
                failureCount: status.failureCount,
                recentWindow: now - status.lastUpdate.getTime() < recentWindow,
            });
        }
        activeAlerts = Array.from(this.alerts.values()).filter((alert) => !alert.acknowledged).length;
        if (this.recoveryWorkflows) {
            const recoveryData = this.recoveryWorkflows.exportRecoveryData();
            activeRecoveries = recoveryData?.activeRecoveries.length;
        }
        if (this.connectionManager) {
            const connectionData = this.connectionManager.exportConnectionData();
            activeConnections = connectionData?.stats?.activeConnections;
        }
        return {
            overallHealth: totalSystems > 0 ? (healthySystems / totalSystems) * 100 : 100,
            totalSystems,
            healthySystems,
            activeAlerts,
            activeRecoveries,
            activeConnections,
            lastUpdate: this.lastUpdate,
        };
    }
    exportHealthData() {
        return {
            currentStatus: Object.fromEntries(this.healthStatus),
            recentMetrics: this.getRecentMetrics('health'),
            categories: this.getCategoryBreakdown('health'),
            priorities: this.getPriorityBreakdown('health'),
        };
    }
    exportRecoveryData() {
        return {
            recentMetrics: this.getRecentMetrics('recovery'),
            workflowBreakdown: this.getWorkflowBreakdown(),
            successRate: this.getRecoverySuccessRate(),
        };
    }
    exportConnectionData() {
        return {
            recentMetrics: this.getRecentMetrics('connection'),
            typeBreakdown: this.getConnectionTypeBreakdown(),
            healthStatus: this.getConnectionHealthStatus(),
        };
    }
    exportSystemData() {
        return {
            recentMetrics: this.getRecentMetrics('system'),
            currentState: this.getCurrentSystemState(),
        };
    }
    exportAlertData() {
        const recentAlerts = Array.from(this.alerts.values())
            .filter((alert) => {
            const alertAge = Date.now() - alert.timestamp.getTime();
            return alertAge < this.options.metricsRetentionPeriod;
        })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return {
            recent: recentAlerts.slice(0, 50),
            breakdown: this.getAlertBreakdown(recentAlerts),
            acknowledged: recentAlerts.filter((a) => a.acknowledged).length,
            unacknowledged: recentAlerts.filter((a) => !a.acknowledged).length,
        };
    }
    exportTrendData() {
        const trends = {};
        for (const [category, trendData] of this.trends) {
            trends[category] = trendData?.slice(-100);
        }
        return trends;
    }
    getRecentMetrics(category, limit = 100) {
        const recentMetrics = [];
        const since = Date.now() - this.options.aggregationInterval * 5;
        for (const [key, metrics] of this.metrics) {
            if (key.startsWith(`${category}.`)) {
                const recent = metrics
                    .filter((m) => m.timestamp.getTime() > since)
                    .slice(-limit);
                recentMetrics.push(...recent);
            }
        }
        return recentMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    getCategoryBreakdown(category) {
        const breakdown = {};
        const recentMetrics = this.getRecentMetrics(category);
        recentMetrics.forEach((metric) => {
            if (metric.category) {
                breakdown[metric.category] = (breakdown[metric.category] || 0) + 1;
            }
        });
        return breakdown;
    }
    getPriorityBreakdown(category) {
        const breakdown = {};
        const recentMetrics = this.getRecentMetrics(category);
        recentMetrics.forEach((metric) => {
            if (metric.priority) {
                breakdown[metric.priority] = (breakdown[metric.priority] || 0) + 1;
            }
        });
        return breakdown;
    }
    getWorkflowBreakdown() {
        const breakdown = {};
        const recoveryMetrics = this.getRecentMetrics('recovery');
        recoveryMetrics.forEach((metric) => {
            if (metric.workflowName) {
                breakdown[metric.workflowName] =
                    (breakdown[metric.workflowName] || 0) + 1;
            }
        });
        return breakdown;
    }
    getRecoverySuccessRate() {
        const recoveryMetrics = this.getRecentMetrics('recovery');
        const completed = recoveryMetrics.filter((m) => m.eventType === 'completed').length;
        const failed = recoveryMetrics.filter((m) => m.eventType === 'failed').length;
        const total = completed + failed;
        return total > 0 ? (completed / total) * 100 : 0;
    }
    getConnectionTypeBreakdown() {
        const breakdown = {};
        const connectionMetrics = this.getRecentMetrics('connection');
        connectionMetrics.forEach((metric) => {
            if (metric.connectionType) {
                breakdown[metric.connectionType] =
                    (breakdown[metric.connectionType] || 0) + 1;
            }
        });
        return breakdown;
    }
    getConnectionHealthStatus() {
        if (!this.connectionManager)
            return {};
        const connectionData = this.connectionManager.exportConnectionData();
        const healthStatus = {};
        connectionData?.connections?.forEach((connection) => {
            healthStatus[connection.id] = {
                status: connection.health?.status || 'unknown',
                latency: connection.health?.latency,
                lastCheck: connection.health?.lastCheck,
            };
        });
        return healthStatus;
    }
    getCurrentSystemState() {
        return {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime(),
            nodeVersion: process.version,
            platform: process.platform,
            pid: process.pid,
        };
    }
    getAlertBreakdown(alerts) {
        const breakdown = {
            severity: {},
            category: {},
            priority: {},
        };
        alerts.forEach((alert) => {
            breakdown.severity[alert.severity] =
                (breakdown.severity[alert.severity] || 0) + 1;
            breakdown.category[alert.category] =
                (breakdown.category[alert.category] || 0) + 1;
            breakdown.priority[alert.priority] =
                (breakdown.priority[alert.priority] || 0) + 1;
        });
        return breakdown;
    }
    formatForPrometheus(data) {
        const metrics = [];
        metrics.push('# HELP ruv_swarm_health_checks_total Total number of health checks');
        metrics.push('# TYPE ruv_swarm_health_checks_total counter');
        metrics.push(`ruv_swarm_health_checks_total ${data?.health?.recentMetrics.length}`);
        metrics.push('# HELP ruv_swarm_recoveries_total Total number of recoveries');
        metrics.push('# TYPE ruv_swarm_recoveries_total counter');
        const recoveryTotal = data?.recovery?.recentMetrics.length;
        metrics.push(`ruv_swarm_recoveries_total ${recoveryTotal}`);
        metrics.push('# HELP ruv_swarm_connections_active Active connections');
        metrics.push('# TYPE ruv_swarm_connections_active gauge');
        metrics.push(`ruv_swarm_connections_active ${data?.summary?.activeConnections}`);
        metrics.push('# HELP ruv_swarm_alerts_active Active alerts');
        metrics.push('# TYPE ruv_swarm_alerts_active gauge');
        metrics.push(`ruv_swarm_alerts_active ${data?.summary?.activeAlerts}`);
        return metrics.join('\n');
    }
    formatForGrafana(data) {
        return {
            ...data,
            panels: [
                {
                    title: 'System Health Overview',
                    type: 'stat',
                    targets: [
                        {
                            expr: 'ruv_swarm_health_checks_total',
                            legendFormat: 'Health Checks',
                        },
                    ],
                },
                {
                    title: 'Recovery Success Rate',
                    type: 'stat',
                    targets: [
                        {
                            expr: 'ruv_swarm_recovery_success_rate',
                            legendFormat: 'Success Rate',
                        },
                    ],
                },
                {
                    title: 'Active Connections',
                    type: 'graph',
                    targets: [
                        {
                            expr: 'ruv_swarm_connections_active',
                            legendFormat: 'Active Connections',
                        },
                    ],
                },
                {
                    title: 'Alert Distribution',
                    type: 'piechart',
                    targets: [
                        {
                            expr: 'ruv_swarm_alerts_by_severity',
                            legendFormat: '{{severity}}',
                        },
                    ],
                },
            ],
        };
    }
    acknowledgeAlert(alertId, acknowledgedBy = 'system') {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            throw new Error(`Alert ${alertId} not found`);
        }
        alert.acknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        this.logger.info(`Alert acknowledged: ${alertId}`, {
            acknowledgedBy,
            alertName: alert.name,
        });
        if (this.options.enableRealTimeStreaming) {
            this.streamUpdate('alert_acknowledged', alert);
        }
    }
    getMonitoringStats() {
        return {
            metricsCount: this.metrics.size,
            totalDataPoints: Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0),
            aggregationsCount: this.aggregatedMetrics.size,
            activeAlerts: this.alerts.size,
            streamingClients: this.streamingClients.size,
            trendsCount: this.trends.size,
            lastUpdate: this.lastUpdate,
            retentionPeriod: this.options.metricsRetentionPeriod,
            aggregationInterval: this.options.aggregationInterval,
        };
    }
    async shutdown() {
        this.logger.info('Shutting down Monitoring Dashboard');
        if (this.aggregationTimer) {
            clearInterval(this.aggregationTimer);
        }
        for (const client of this.streamingClients) {
            try {
                client.close();
            }
            catch (error) {
                this.logger.warn('Error closing streaming client', {
                    error: error.message,
                });
            }
        }
        this.streamingClients.clear();
        this.metrics.clear();
        this.aggregatedMetrics.clear();
        this.alerts.clear();
        this.trends.clear();
        this.healthStatus.clear();
        this.emit('dashboard:shutdown');
    }
}
export default MonitoringDashboard;
//# sourceMappingURL=monitoring-dashboard.js.map