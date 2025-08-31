/**
 * @fileoverview Internal OTEL Collector Implementation
 *
 * Central OpenTelemetry collector that receives telemetry data from foundation
 * logging and telemetry packages, processes it, and exports to multiple backends.
 */

import { createServer, type Server} from 'node:http';
import type { Logger} from '@claude-zen/foundation';
import { getLogger} from '@claude-zen/foundation';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { configManager} from './config/index.js';

/**
 * Get default configuration
 */
function getDefaultConfig() {
  return configManager.loadConfig();
}
import { ExporterManager} from './exporters/index.js';
import { ProcessorManager} from './processors/index.js';
import type {
  CollectorConfig,
  CollectorStats,
  HealthStatus,
  SignalType,
  TelemetryData,
} from './types.js';

/**
 * Internal OpenTelemetry Collector
 *
 * Centralized collector that receives telemetry data from multiple sources
 * (foundation logging, telemetry package) and exports to external systems.
 */
export class InternalOTELCollector {
  private config:CollectorConfig;
  private logger:Logger;
  private httpServer:Server | null = null;
  private exporterManager:ExporterManager;
  private processorManager:ProcessorManager;
  private stats:CollectorStats;
  private startTime:number;
  private isRunning = false;

  constructor(config:Partial<CollectorConfig> = {}) {
    this.config = { ...getDefaultConfig(), ...config};
    this.logger = getLogger('InternalOTELCollector');
    this.startTime = Date.now();

    // Initialize managers
    this.exporterManager = new ExporterManager(this.config.exporters || []);
    this.processorManager = new ProcessorManager();

    // Initialize stats
    this.stats = {
      received:{ traces: 0, metrics:0, logs:0},
      exported:{ traces: 0, metrics:0, logs:0},
      errors:{},
      queueSizes:{},
      memoryUsage:{ heapUsed: 0, heapTotal:0, external:0},
      uptime:0,
    };
}

  /**
   * Start the OTEL collector
   */
  async start():Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Collector is already running');
      return;
}

    try {
      // Initialize exporters
      await this.exporterManager.initialize();

      // Initialize processors
      await this.processorManager.initialize(this.config.processors || []);

      // Start HTTP server for telemetry ingestion
      await this.startHttpServer();

      // Start periodic tasks
      this.startPeriodicTasks();

      this.isRunning = true;
      this.logger.info('Internal OTEL Collector started', {
        httpPort:this.config.httpPort,
        grpcPort:this.config.grpcPort,
        exporters:this.config.exporters?.length || 0,
        processors:this.config.processors?.length || 0,
      });
} catch (error) {
      this.logger.error('Failed to start OTEL collector', error);
      throw error;
}
}

  /**
   * Stop the OTEL collector
   */
  async stop():Promise<void> {
    if (!this.isRunning) return;

    try {
      // Stop HTTP server
      if (this.httpServer) {
        await new Promise<void>((resolve) => {
          this.httpServer?.close(() => resolve());
});
        this.httpServer = null;
}

      // Shutdown exporters (flush remaining data)
      await this.exporterManager.shutdown();

      // Shutdown processors
      await this.processorManager.shutdown();

      this.isRunning = false;
      this.logger.info('Internal OTEL Collector stopped');
} catch (error) {
      this.logger.error('Error stopping OTEL collector', error);
      throw error;
}
}

  /**
   * Ingest telemetry data
   */
  async ingest(data:TelemetryData): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Collector is not running');
}

    try {
      // Update received stats
      this.stats.received[data.type]++;

      // Process the data
      const processedData = await this.processorManager.process(data);

      // Export to backends if processing didn't filter out the data
      if (processedData) {
        const exportResults = await this.exporterManager.export(processedData);

        // Update export stats
        for (const result of exportResults) {
          if (result.success) {
            this.stats.exported[data.type]++;
          }
        }
      }
} else {
          this.stats.errors[result.backend] =
            (this.stats.errors[result.backend] || 0) + 1;
}
}
} catch (error) {
      this.logger.error('Failed to ingest telemetry data', {
        error,
        dataType:data.type,
});
      throw error;
}
}

  /**
   * Ingest multiple telemetry data items (batch)
   */
  async ingestBatch(dataItems:TelemetryData[]): Promise<void> {
    const results = await Promise.allSettled(
      dataItems.map((data) => this.ingest(data))
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
      this.logger.warn('Some batch items failed to ingest', {
        total:dataItems.length,
        failed,
});
}
}

  /**
   * Get collector statistics
   */
  getStats():CollectorStats {
    const memUsage = process.memoryUsage();
    return {
      ...this.stats,
      memoryUsage:{
        heapUsed:memUsage.heapUsed,
        heapTotal:memUsage.heapTotal,
        external:memUsage.external,
},
      uptime:Date.now() - this.startTime,
      queueSizes:this.exporterManager.getQueueSizes(),
};
}

  /**
   * Get health status
   */
  async getHealthStatus():Promise<HealthStatus> {
    const exporterHealth = await this.exporterManager.getHealthStatus();
    const __stats = this.getStats();

    // Determine overall status
    const hasUnhealthyExporter = Object.values(exporterHealth).some(
      (h) => h.status.trim() === 'unhealthy'
    );
    const hasDegradedExporter = Object.values(exporterHealth).some(
      (h) => h.status.trim() === 'degraded'
    );

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (hasUnhealthyExporter) {
      overallStatus = 'unhealthy';
    } else if (hasDegradedExporter) {
      overallStatus = 'degraded';
    }

    // Check resource usage
    const memUsedMB = __stats.memoryUsage.heapUsed / (1024 * 1024);
    const memTotalMB = __stats.memoryUsage.heapTotal / (1024 * 1024);
    const memUsagePercent = (memUsedMB / memTotalMB) * 100;

    return {
      status: overallStatus,
      exporters: exporterHealth as Record<string, { status: 'healthy' | 'degraded' | 'unhealthy'; lastSuccess?: number; lastError?: string; }>,
      resources: {
        memory:
          memUsagePercent > 90
            ? 'critical'
            : memUsagePercent > 75
              ? 'warning'
              : 'ok',
        disk: 'ok', // TODO: Implement disk usage check
        cpu: 'ok', // TODO: Implement CPU usage check
      },
      timestamp: Date.now(),
    };
}

  /**
   * Start HTTP server for telemetry ingestion
   */
  private async startHttpServer():Promise<void> {
    const app = express();

    // Security middleware
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(express.json({ limit: '10mb'}));

    // Health endpoint
    app.get('/health', async (_req, res) => {
      try {
        const health = await this.getHealthStatus();
        res.status(health.status === 'healthy' ? 200:503).json(health);
} catch (error) {
        res.status(500).json({ status: 'unhealthy', error:String(error)});
}
});

    // Stats endpoint
    app.get('/stats', (_req, res) => {
      try {
        const __stats = this.getStats();
        res.json(__stats);
} catch (error) {
        res.status(500).json({ error:String(error)});
}
});

    // Telemetry ingestion endpoints
    app.post('/v1/traces', async (req, res) => {
      await this.handleTelemetryIngestion(req, res, 'traces');
});

    app.post('/v1/metrics', async (req, res) => {
      await this.handleTelemetryIngestion(req, res, 'metrics');
});

    app.post('/v1/logs', async (req, res) => {
      await this.handleTelemetryIngestion(req, res, 'logs');
});

    // Generic ingestion endpoint
    app.post('/v1/telemetry', async (req, res) => {
      try {
        const telemetryData = req.body as TelemetryData;
        await this.ingest(telemetryData);
        res.status(200).json({ success:true});
} catch (error) {
        this.logger.error('Failed to handle telemetry ingestion', error);
        res.status(500).json({ error:String(error)});
}
});

    // Batch ingestion endpoint
    app.post('/v1/telemetry/batch', async (req, res) => {
      try {
        const telemetryData = req.body as TelemetryData[];
        await this.ingestBatch(telemetryData);
        res.status(200).json({ success:true, count:telemetryData.length});
} catch (error) {
        this.logger.error('Failed to handle batch telemetry ingestion', error);
        res.status(500).json({ error:String(error)});
}
});

    // Start server
    const port = this.config.httpPort || 4318;
    this.httpServer = createServer(app);

    await new Promise<void>((resolve, reject) => {
      this.httpServer?.listen(port, () => {
        this.logger.info(
          `OTEL Collector HTTP server listening on port ${port}`
        );
        resolve();
});

      this.httpServer!.on('error', reject);
});
}

  /**
   * Handle telemetry ingestion for specific signal types
   */
  private async handleTelemetryIngestion(
    req:express.Request,
    res:express.Response,
    signalType:SignalType
  ):Promise<void> {
    try {
      const telemetryData:TelemetryData = {
        type:signalType,
        timestamp:Date.now(),
        service:{
          name:(req.headers['x-service-name'] as string) || ' unknown',          version:req.headers['x-service-version'] as string,
          instance:req.headers['x-service-instance'] as string,
},
        data:req.body,
        attributes:{},
};

      await this.ingest(telemetryData);
      res.status(200).json({ success:true});
} catch (error) {
      this.logger.error(`Failed to handle ${signalType} ingestion`, error);
      res.status(500).json({ error:String(error)});
}
}

  /**
   * Start periodic maintenance tasks
   */
  private startPeriodicTasks():void {
    // Update stats every 30 seconds
    setInterval(() => {
      this.updateStats();
}, 30000);

    // Health check every minute
    setInterval(async () => {
      try {
        const health = await this.getHealthStatus();
        if (health.status !== 'healthy') {
          this.logger.warn('Collector health status degraded', health);
}
} catch (error) {
        this.logger.error('Failed to perform health check', error);
}
}, 60000);
}

  /**
   * Update internal statistics
   */
  private updateStats():void {
    const memUsage = process.memoryUsage();
    this.stats.memoryUsage = {
      heapUsed:memUsage.heapUsed,
      heapTotal:memUsage.heapTotal,
      external:memUsage.external,
};
    this.stats.uptime = Date.now() - this.startTime;
    this.stats.queueSizes = this.exporterManager.getQueueSizes();
}

  /**
   * Check if collector is running
   */
  isCollectorRunning():boolean {
    return this.isRunning;
}

  /**
   * Get collector configuration
   */
  getConfig():CollectorConfig {
    return { ...this.config};
}
}

/**
 * Global collector instance
 */
let globalCollector:InternalOTELCollector | null = null;

/**
 * Get global collector instance
 */
export function getOTELCollector(
  config?:Partial<CollectorConfig>
):InternalOTELCollector {
  if (!globalCollector) {
    globalCollector = new InternalOTELCollector(config);
}
  return globalCollector;
}

/**
 * Initialize global collector
 */
export async function initializeOTELCollector(
  config?:Partial<CollectorConfig>
):Promise<InternalOTELCollector> {
  if (config) {
    globalCollector = new InternalOTELCollector(config);
} else if (!globalCollector) {
    globalCollector = new InternalOTELCollector();
}

  await globalCollector.start();
  return globalCollector;
}

/**
 * Shutdown global collector
 */
export async function shutdownOTELCollector():Promise<void> {
  if (globalCollector) {
    await globalCollector.stop();
    globalCollector = null;
}
}
