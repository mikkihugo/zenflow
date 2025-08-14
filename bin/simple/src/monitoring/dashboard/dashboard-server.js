import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';
import * as path from 'node:path';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { getCORSOrigins } from '../config/url-builder';
export class DashboardServer extends EventEmitter {
    app;
    server;
    io;
    config;
    isRunning = false;
    connectedClients = new Set();
    dashboardData = {
        metrics: {},
        insights: {},
        optimizations: [],
        alerts: [],
    };
    constructor(config) {
        super();
        this.config = config;
        this.app = express();
        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: config?.corsOrigins || getCORSOrigins(),
                methods: ['GET', 'POST'],
            },
        });
        this.setupExpress();
        this.setupSocketIO();
        this.setupRoutes();
    }
    setupExpress() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        const staticPath = this.config.staticPath || path.join(__dirname, 'static');
        this.app.use(express.static(staticPath));
        this.app.use((_req, res, next) => {
            const corsOrigins = this.config.corsOrigins || getCORSOrigins();
            res.header('Access-Control-Allow-Origin', Array.isArray(corsOrigins) ? corsOrigins.join(',') : corsOrigins);
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            next();
        });
    }
    setupSocketIO() {
        this.io.on('connection', (socket) => {
            const clientId = socket.id;
            this.connectedClients.add(clientId);
            this.emit('client:connected', clientId);
            socket.emit('dashboard:initial', this.dashboardData);
            socket.on('dashboard:request-metrics', () => {
                socket.emit('dashboard:metrics', this.dashboardData.metrics);
            });
            socket.on('dashboard:request-insights', () => {
                socket.emit('dashboard:insights', this.dashboardData.insights);
            });
            socket.on('dashboard:request-optimizations', () => {
                socket.emit('dashboard:optimizations', this.dashboardData.optimizations);
            });
            socket.on('dashboard:clear-alerts', () => {
                this.dashboardData.alerts = [];
                this.io.emit('dashboard:alerts', this.dashboardData.alerts);
            });
            socket.on('dashboard:export-data', (format) => {
                this.handleExportRequest(socket, format);
            });
            socket.on('disconnect', () => {
                this.connectedClients.delete(clientId);
                this.emit('client:disconnected', clientId);
            });
        });
    }
    setupRoutes() {
        this.app.get('/health', (_req, res) => {
            res.json({
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: Date.now(),
                connectedClients: this.connectedClients.size,
            });
        });
        this.app.get('/api/metrics', (_req, res) => {
            res.json(this.dashboardData.metrics);
        });
        this.app.get('/api/insights', (_req, res) => {
            res.json(this.dashboardData.insights);
        });
        this.app.get('/api/optimizations', (_req, res) => {
            res.json(this.dashboardData.optimizations);
        });
        this.app.get('/api/alerts', (_req, res) => {
            res.json(this.dashboardData.alerts);
        });
        this.app.delete('/api/alerts', (_req, res) => {
            this.dashboardData.alerts = [];
            this.io.emit('dashboard:alerts', this.dashboardData.alerts);
            res.json({ success: true });
        });
        this.app.get('/api/summary', (_req, res) => {
            const summary = this.generateDashboardSummary();
            res.json(summary);
        });
        this.app.get('/api/export/:format', (req, res) => {
            const format = req.params.format;
            if (format !== 'json' && format !== 'csv') {
                return res
                    .status(400)
                    .json({ error: 'Invalid format. Use json or csv.' });
            }
            this.handleExportResponse(res, format);
        });
        this.app.get('/', (_req, res) => {
            res.sendFile(path.join(__dirname, 'static', 'index.html'));
        });
    }
    async start() {
        if (this.isRunning) {
            throw new Error('Dashboard server is already running');
        }
        return new Promise((resolve, reject) => {
            this.server.listen(this.config.port, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.isRunning = true;
                this.emit('server:started');
                resolve();
            });
        });
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        return new Promise((resolve) => {
            this.server.close(() => {
                this.isRunning = false;
                this.emit('server:stopped');
                resolve();
            });
        });
    }
    updateMetrics(metrics) {
        this.dashboardData.metrics = metrics;
        this.io.emit('dashboard:metrics', metrics);
        this.emit('metrics:updated', metrics);
    }
    updateInsights(insights) {
        this.dashboardData.insights = insights;
        this.io.emit('dashboard:insights', insights);
        const criticalAnomalies = insights.anomalies.filter((a) => a.severity === 'critical');
        for (const anomaly of criticalAnomalies) {
            this.addAlert('error', `Critical anomaly detected: ${anomaly.description}`);
        }
        if (insights.predictions.resourceExhaustion.length > 0) {
            this.addAlert('warning', `Resource exhaustion predicted: ${insights.predictions.resourceExhaustion.join(', ')}`);
        }
        if (insights.healthScore < 50) {
            this.addAlert('error', `System health critically low: ${insights.healthScore.toFixed(1)}%`);
        }
        else if (insights.healthScore < 70) {
            this.addAlert('warning', `System health below optimal: ${insights.healthScore.toFixed(1)}%`);
        }
        this.emit('insights:updated', insights);
    }
    updateOptimizations(optimizations) {
        this.dashboardData.optimizations = optimizations.slice(-50);
        this.io.emit('dashboard:optimizations', this.dashboardData.optimizations);
        const recentFailures = optimizations.filter((o) => !o.success && Date.now() - o.executionTime < 60000);
        for (const failure of recentFailures) {
            this.addAlert('warning', `Optimization failed: ${failure.error}`);
        }
        this.emit('optimizations:updated', optimizations);
    }
    addAlert(type, message) {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            type,
            message,
            timestamp: Date.now(),
        };
        this.dashboardData.alerts.unshift(alert);
        if (this.dashboardData.alerts.length > 100) {
            this.dashboardData.alerts = this.dashboardData.alerts.slice(0, 100);
        }
        this.io.emit('dashboard:alerts', this.dashboardData.alerts);
        this.emit('alert:added', alert);
    }
    generateDashboardSummary() {
        const metrics = this.dashboardData.metrics;
        const insights = this.dashboardData.insights;
        const optimizations = this.dashboardData.optimizations;
        if (!metrics.system) {
            return { error: 'No metrics available' };
        }
        const recentOptimizations = optimizations.filter((o) => Date.now() - o.executionTime < 3600000);
        const successfulOptimizations = recentOptimizations.filter((o) => o.success);
        return {
            timestamp: Date.now(),
            system: {
                health: insights.healthScore || 0,
                cpuUsage: metrics.system.cpu.usage,
                memoryUsage: metrics.system.memory.percentage,
                uptime: process.uptime(),
            },
            performance: {
                factCacheHitRate: metrics.fact?.cache.hitRate || 0,
                ragQueryLatency: metrics.rag?.vectors.queryLatency || 0,
                swarmActiveAgents: metrics.swarm?.agents.activeAgents || 0,
                mcpSuccessRate: metrics.mcp?.performance.overallSuccessRate || 0,
            },
            alerts: {
                total: this.dashboardData.alerts.length,
                critical: this.dashboardData.alerts.filter((a) => a.type === 'error')
                    .length,
                warnings: this.dashboardData.alerts.filter((a) => a.type === 'warning')
                    .length,
            },
            optimizations: {
                total: recentOptimizations.length,
                successful: successfulOptimizations.length,
                averageImpact: successfulOptimizations.length > 0
                    ? successfulOptimizations.reduce((sum, o) => sum + o.impact.performance, 0) / successfulOptimizations.length
                    : 0,
            },
            clients: {
                connected: this.connectedClients.size,
            },
        };
    }
    async handleExportRequest(socket, format) {
        try {
            const data = this.generateExportData(format);
            socket.emit('dashboard:export-ready', {
                format,
                data,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            socket.emit('dashboard:export-error', {
                error: error instanceof Error ? error.message : 'Export failed',
            });
        }
    }
    handleExportResponse(res, format) {
        try {
            const data = this.generateExportData(format);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `dashboard-export-${timestamp}.${format}`;
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
            res.send(data);
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Export failed',
            });
        }
    }
    generateExportData(format) {
        const exportData = {
            timestamp: Date.now(),
            summary: this.generateDashboardSummary(),
            metrics: this.dashboardData.metrics,
            insights: this.dashboardData.insights,
            optimizations: this.dashboardData.optimizations,
            alerts: this.dashboardData.alerts,
        };
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        }
        return this.convertToCsv(exportData);
    }
    convertToCsv(data) {
        const lines = [];
        lines.push('DASHBOARD SUMMARY');
        lines.push('Timestamp,Health Score,CPU Usage,Memory Usage,Alerts,Optimizations');
        const summary = data?.summary;
        lines.push([
            new Date(data?.timestamp).toISOString(),
            summary.system?.health || 0,
            summary.system?.cpuUsage || 0,
            summary.system?.memoryUsage || 0,
            summary.alerts?.total || 0,
            summary.optimizations?.total || 0,
        ].join(','));
        lines.push('');
        lines.push('ALERTS');
        lines.push('ID,Type,Message,Timestamp');
        data?.alerts?.forEach((alert) => {
            lines.push([
                alert.id,
                alert.type,
                `"${alert.message.replace(/"/g, '""')}"`,
                new Date(alert.timestamp).toISOString(),
            ].join(','));
        });
        lines.push('');
        lines.push('OPTIMIZATIONS');
        lines.push('Action ID,Success,Performance Impact,Efficiency Impact,Execution Time');
        data?.optimizations.forEach((opt) => {
            lines.push([
                opt.actionId,
                opt.success,
                opt.impact?.performance || 0,
                opt.impact?.efficiency || 0,
                opt.executionTime,
            ].join(','));
        });
        return lines.join('\n');
    }
    getStatus() {
        return {
            isRunning: this.isRunning,
            port: this.config.port,
            connectedClients: this.connectedClients.size,
            uptime: this.isRunning ? process.uptime() : 0,
        };
    }
    getConnectedClients() {
        return Array.from(this.connectedClients);
    }
}
//# sourceMappingURL=dashboard-server.js.map