/**
 * Real-Time Monitoring Dashboard Server
 * Web-based dashboard for performance monitoring and visualization
 */

import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';
import * as path from 'node:path';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import type { PerformanceInsights } from '../analytics/performance-analyzer';
import type { CompositeMetrics } from '../core/metrics-collector';
import type { OptimizationResult } from '../optimization/optimization-engine';

export interface DashboardConfig {
  port: number;
  staticPath?: string;
  corsOrigins?: string[];
  updateInterval: number;
}

export interface DashboardData {
  metrics: CompositeMetrics;
  insights: PerformanceInsights;
  optimizations: OptimizationResult[];
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>;
}

export class DashboardServer extends EventEmitter {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private config: DashboardConfig;
  private isRunning = false;
  private connectedClients = new Set<string>();
  private dashboardData: DashboardData = {
    metrics: {} as CompositeMetrics,
    insights: {} as PerformanceInsights,
    optimizations: [],
    alerts: [],
  };

  constructor(config: DashboardConfig) {
    super();
    this.config = config;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.corsOrigins || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
    });

    this.setupExpress();
    this.setupSocketIO();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware and static files
   */
  private setupExpress(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static dashboard files
    const staticPath = this.config.staticPath || path.join(__dirname, 'static');
    this.app.use(express.static(staticPath));

    // CORS middleware
    this.app.use((_req, res, next) => {
      res.header('Access-Control-Allow-Origin', this.config.corsOrigins?.join(',') || '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
  }

  /**
   * Setup Socket.IO for real-time communication
   */
  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      const clientId = socket.id;
      this.connectedClients.add(clientId);
      this.emit('client:connected', clientId);

      // Send initial data to new client
      socket.emit('dashboard:initial', this.dashboardData);

      // Handle client requests
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

      socket.on('dashboard:export-data', (format: 'json' | 'csv') => {
        this.handleExportRequest(socket, format);
      });

      socket.on('disconnect', () => {
        this.connectedClients.delete(clientId);
        this.emit('client:disconnected', clientId);
      });
    });
  }

  /**
   * Setup REST API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: Date.now(),
        connectedClients: this.connectedClients.size,
      });
    });

    // Get current metrics
    this.app.get('/api/metrics', (_req, res) => {
      res.json(this.dashboardData.metrics);
    });

    // Get performance insights
    this.app.get('/api/insights', (_req, res) => {
      res.json(this.dashboardData.insights);
    });

    // Get optimization results
    this.app.get('/api/optimizations', (_req, res) => {
      res.json(this.dashboardData.optimizations);
    });

    // Get alerts
    this.app.get('/api/alerts', (_req, res) => {
      res.json(this.dashboardData.alerts);
    });

    // Clear alerts
    this.app.delete('/api/alerts', (_req, res) => {
      this.dashboardData.alerts = [];
      this.io.emit('dashboard:alerts', this.dashboardData.alerts);
      res.json({ success: true });
    });

    // Get dashboard summary
    this.app.get('/api/summary', (_req, res) => {
      const summary = this.generateDashboardSummary();
      res.json(summary);
    });

    // Export data
    this.app.get('/api/export/:format', (req, res) => {
      const format = req.params.format as 'json' | 'csv';
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ error: 'Invalid format. Use json or csv.' });
      }

      this.handleExportResponse(res, format);
    });

    // Serve dashboard HTML
    this.app.get('/', (_req, res) => {
      res.sendFile(path.join(__dirname, 'static', 'index.html'));
    });
  }

  /**
   * Start the dashboard server
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Dashboard server is already running');
    }

    return new Promise((resolve, reject) => {
      this.server.listen(this.config.port, (err: any) => {
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

  /**
   * Stop the dashboard server
   */
  public async stop(): Promise<void> {
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

  /**
   * Update dashboard with new metrics
   *
   * @param metrics
   */
  public updateMetrics(metrics: CompositeMetrics): void {
    this.dashboardData.metrics = metrics;
    this.io.emit('dashboard:metrics', metrics);
    this.emit('metrics:updated', metrics);
  }

  /**
   * Update dashboard with new insights
   *
   * @param insights
   */
  public updateInsights(insights: PerformanceInsights): void {
    this.dashboardData.insights = insights;
    this.io.emit('dashboard:insights', insights);

    // Create alerts for critical anomalies
    const criticalAnomalies = insights.anomalies.filter((a) => a.severity === 'critical');
    for (const anomaly of criticalAnomalies) {
      this.addAlert('error', `Critical anomaly detected: ${anomaly.description}`);
    }

    // Create alerts for resource exhaustion predictions
    if (insights.predictions.resourceExhaustion.length > 0) {
      this.addAlert(
        'warning',
        `Resource exhaustion predicted: ${insights.predictions.resourceExhaustion.join(', ')}`
      );
    }

    // Create alerts for low health score
    if (insights.healthScore < 50) {
      this.addAlert('error', `System health critically low: ${insights.healthScore.toFixed(1)}%`);
    } else if (insights.healthScore < 70) {
      this.addAlert('warning', `System health below optimal: ${insights.healthScore.toFixed(1)}%`);
    }

    this.emit('insights:updated', insights);
  }

  /**
   * Update dashboard with optimization results
   *
   * @param optimizations
   */
  public updateOptimizations(optimizations: OptimizationResult[]): void {
    this.dashboardData.optimizations = optimizations.slice(-50); // Keep last 50 results
    this.io.emit('dashboard:optimizations', this.dashboardData.optimizations);

    // Create alerts for failed optimizations
    const recentFailures = optimizations.filter(
      (o) => !o.success && Date.now() - o.executionTime < 60000
    );
    for (const failure of recentFailures) {
      this.addAlert('warning', `Optimization failed: ${failure.error}`);
    }

    this.emit('optimizations:updated', optimizations);
  }

  /**
   * Add alert to dashboard
   *
   * @param type
   * @param message
   */
  public addAlert(type: 'warning' | 'error' | 'info', message: string): void {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now(),
    };

    this.dashboardData.alerts.unshift(alert);

    // Keep only recent alerts (max 100)
    if (this.dashboardData.alerts.length > 100) {
      this.dashboardData.alerts = this.dashboardData.alerts.slice(0, 100);
    }

    this.io.emit('dashboard:alerts', this.dashboardData.alerts);
    this.emit('alert:added', alert);
  }

  /**
   * Generate dashboard summary
   */
  private generateDashboardSummary(): any {
    const metrics = this.dashboardData.metrics;
    const insights = this.dashboardData.insights;
    const optimizations = this.dashboardData.optimizations;

    if (!metrics.system) {
      return { error: 'No metrics available' };
    }

    const recentOptimizations = optimizations.filter(
      (o) => Date.now() - o.executionTime < 3600000 // Last hour
    );

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
        critical: this.dashboardData.alerts.filter((a) => a.type === 'error').length,
        warnings: this.dashboardData.alerts.filter((a) => a.type === 'warning').length,
      },
      optimizations: {
        total: recentOptimizations.length,
        successful: successfulOptimizations.length,
        averageImpact:
          successfulOptimizations.length > 0
            ? successfulOptimizations.reduce((sum, o) => sum + o.impact.performance, 0) /
              successfulOptimizations.length
            : 0,
      },
      clients: {
        connected: this.connectedClients.size,
      },
    };
  }

  /**
   * Handle export request via socket
   *
   * @param socket
   * @param format
   */
  private async handleExportRequest(socket: any, format: 'json' | 'csv'): Promise<void> {
    try {
      const data = this.generateExportData(format);
      socket.emit('dashboard:export-ready', {
        format,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      socket.emit('dashboard:export-error', {
        error: error instanceof Error ? error.message : 'Export failed',
      });
    }
  }

  /**
   * Handle export response via HTTP
   *
   * @param res
   * @param format
   */
  private handleExportResponse(res: express.Response, format: 'json' | 'csv'): void {
    try {
      const data = this.generateExportData(format);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `dashboard-export-${timestamp}.${format}`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
      res.send(data);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Export failed',
      });
    }
  }

  /**
   * Generate export data
   *
   * @param format
   */
  private generateExportData(format: 'json' | 'csv'): string {
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
    } else {
      return this.convertToCsv(exportData);
    }
  }

  /**
   * Convert data to CSV format
   *
   * @param data
   */
  private convertToCsv(data: any): string {
    const lines: string[] = [];

    // Summary section
    lines.push('DASHBOARD SUMMARY');
    lines.push('Timestamp,Health Score,CPU Usage,Memory Usage,Alerts,Optimizations');
    const summary = data.summary;
    lines.push(
      [
        new Date(data.timestamp).toISOString(),
        summary.system?.health || 0,
        summary.system?.cpuUsage || 0,
        summary.system?.memoryUsage || 0,
        summary.alerts?.total || 0,
        summary.optimizations?.total || 0,
      ].join(',')
    );

    lines.push('');

    // Alerts section
    lines.push('ALERTS');
    lines.push('ID,Type,Message,Timestamp');
    data.alerts.forEach((alert: any) => {
      lines.push(
        [
          alert.id,
          alert.type,
          `"${alert.message.replace(/"/g, '""')}"`,
          new Date(alert.timestamp).toISOString(),
        ].join(',')
      );
    });

    lines.push('');

    // Optimizations section
    lines.push('OPTIMIZATIONS');
    lines.push('Action ID,Success,Performance Impact,Efficiency Impact,Execution Time');
    data.optimizations.forEach((opt: any) => {
      lines.push(
        [
          opt.actionId,
          opt.success,
          opt.impact?.performance || 0,
          opt.impact?.efficiency || 0,
          opt.executionTime,
        ].join(',')
      );
    });

    return lines.join('\n');
  }

  /**
   * Get server status
   */
  public getStatus(): {
    isRunning: boolean;
    port: number;
    connectedClients: number;
    uptime: number;
  } {
    return {
      isRunning: this.isRunning,
      port: this.config.port,
      connectedClients: this.connectedClients.size,
      uptime: this.isRunning ? process.uptime() : 0,
    };
  }

  /**
   * Get connected clients
   */
  public getConnectedClients(): string[] {
    return Array.from(this.connectedClients);
  }
}
