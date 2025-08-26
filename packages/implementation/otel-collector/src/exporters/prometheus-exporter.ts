/**
 * @fileoverview Prometheus Exporter
 *
 * Exports metrics in Prometheus format via HTTP endpoint.
 * Converts telemetry metrics to Prometheus metrics and serves them.
 */

import { getLogger } from '@claude-zen/foundation/logging';
import type { ExporterConfig, } from '../types.js';
import type { BaseExporter } from './index.js';

/**
 * Prometheus exporter implementation
 */
export class PrometheusExporter implements BaseExporter {

  constructor(config: ExporterConfig) {
    this.config = config;
    this.logger = getLogger(`PrometheusExporter:${config.name}`);`
  }

  async initialize(): Promise<void> {
    try {
      // Clear default metrics and create a new registry if needed
      if (this.config.config?.useCustomRegistry) {
        const { Registry } = await import('prom-client');'
        this.metricsRegistry = new Registry();
      } else {
        // Use default registry but clear it first
        this.metricsRegistry.clear();
      }

      // Start HTTP server to serve metrics
      await this.startMetricsServer();

      this.logger.info('Prometheus exporter initialized', {'
        endpoint: this.getMetricsEndpoint(),
        port: this.getPort(),
        customRegistry: !!this.config.config?.useCustomRegistry,
      });
    } catch (error) {
      this.logger.error('Failed to initialize Prometheus exporter', error);'
      throw error;
    }
  }

  async export(data: TelemetryData): Promise<ExportResult> {
    try {
      if (data.type === 'metrics') {'
        await this.processMetricData(data);
        this.exportCount++;
        this.lastExportTime = Date.now();
        this.lastError = null;

        return {
          success: true,
          exported: 1,
          backend: this.config.name,
          duration: 0,
        };
      }

      // Skip non-metric data
      return {
        success: true,
        exported: 0,
        backend: this.config.name,
        duration: 0,
      };
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Prometheus export failed', error);'

      return {
        success: false,
        exported: 0,
        error: errorMessage,
        backend: this.config.name,
        duration: 0,
      };
    }
  }

  async exportBatch(dataItems: TelemetryData[]): Promise<ExportResult> {
    try {
      const startTime = Date.now();
      let processedCount = 0;

      // Filter and process metric data
      const metricItems = dataItems.filter((item) => item.type === 'metrics');'

      for (const data of metricItems) {
        await this.processMetricData(data);
        processedCount++;
      }

      this.exportCount += processedCount;
      this.lastExportTime = Date.now();
      this.lastError = null;

      return {
        success: true,
        exported: processedCount,
        backend: this.config.name,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Prometheus batch export failed', error);'

      return {
        success: false,
        exported: 0,
        error: errorMessage,
        backend: this.config.name,
        duration: Date.now() - Date.now(),
      };
    }
  }

  async shutdown(): Promise<void> {
    // Stop HTTP server
    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => resolve())();
      });
      this.httpServer = null;
    }

    // Clear metrics
    this.metrics.clear();
    if (this.config.config?.useCustomRegistry) {
      this.metricsRegistry.clear();
    }

    this.logger.info('Prometheus exporter shut down', {'
      totalExported: this.exportCount,
    });
  }

  getQueueSize(): number {
    return 0; // Prometheus exporter doesn't queue, it updates metrics in real-time'
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastSuccess?: number;
    lastError?: string;
  }> {
    return {
      status: this.lastError ? 'unhealthy' : 'healthy',
      lastSuccess: this.lastExportTime||undefined,
      lastError: this.lastError||undefined,
    };
  }

  /**
   * Start HTTP server to serve Prometheus metrics
   */
  private async startMetricsServer(): Promise<void> {
    const app = express();
    const port = this.getPort();

    // Health endpoint
    app.get('/health', (req, res) => {'
      res.status(200).json({ status: 'healthy' });'
    });

    // Metrics endpoint
    app.get('/metrics', async (req, res) => {'
      try {
        res.set('Content-Type', this.metricsRegistry.contentType);'
        const metrics = await this.metricsRegistry.metrics();
        res.end(metrics);
      } catch (error) {
        this.logger.error('Failed to serve metrics', error);'
        res.status(500).send('Internal server error');'
      }
    });

    // Custom metrics endpoint (if configured)
    const customPath = this.config.config?.metricsPath||'/metrics;
    if (customPath !== '/metrics') {'
      app.get(customPath, async (req, res) => {
        try {
          res.set('Content-Type', this.metricsRegistry.contentType);'
          const metrics = await this.metricsRegistry.metrics();
          res.end(metrics);
        } catch (error) {
          this.logger.error('Failed to serve custom metrics', error);'
          res.status(500).send('Internal server error');'
        }
      });
    }

    // Start server
    this.httpServer = createServer(app);

    await new Promise<void>((resolve, reject) => {
      this.httpServer!.listen(port, () => {
        this.logger.info(`Prometheus metrics server listening on port $port`);`
        resolve();
      });

      this.httpServer!.on('error', reject);'
    });
  }

  /**
   * Process metric data and update Prometheus metrics
   */
  private async processMetricData(data: TelemetryData): Promise<void> {
    if (!data.data) return;

    try {
      // Handle different metric data formats
      let metricsData: any[] = [];

      if (Array.isArray(data.data)) {
        metricsData = data.data;
      } else if (data.data.metrics && Array.isArray(data.data.metrics)) {
        metricsData = data.data.metrics;
      } else if (typeof data.data === 'object') {'
        // Single metric object
        metricsData = [data.data];
      }

      // Process each metric
      for (const metricData of metricsData) {
        await this.updatePrometheusMetric(metricData, data);
      }
    } catch (error) {
      this.logger.error('Failed to process metric data', error);'
      throw error;
    }
  }

  /**
   * Update or create Prometheus metric
   */
  private async updatePrometheusMetric(
    metricData: any,
    telemetryData: TelemetryData
  ): Promise<void> {
    const name = this.sanitizeMetricName(metricData.name||'unnamed_metric');'
    const _help =
      metricData.description||`Metric ${name} from ${telemetryData.service.name}`;`
    const value = metricData.value||metricData.count||metricData.sum||0;
    const labels = {
      ...metricData.labels,
      ...metricData.attributes,
      service: telemetryData.service.name,
      ...(telemetryData.service.version && {
        version: telemetryData.service.version,
      }),
      ...(telemetryData.service.instance && {
        instance: telemetryData.service.instance,
      }),
    };

    // Determine metric type
    const metricType = metricData.type||this.inferMetricType(metricData);

    try {
      let metric = this.metrics.get(name);

      if (!metric) {
        // Create new metric
        switch (metricType) {
          case'counter':'
            metric = new Counter({
              name,
              help,
              labelNames: Object.keys(labels),
              registers: [this.metricsRegistry],
            });
            break;
          case 'histogram':'
            metric = new Histogram({
              name,
              help,
              labelNames: Object.keys(labels),
              buckets: metricData.buckets||[0.1, 0.5, 1, 2.5, 5, 10],
              registers: [this.metricsRegistry],
            });
            break;
          case'gauge':'
          default:
            metric = new Gauge({
              name,
              help,
              labelNames: Object.keys(labels),
              registers: [this.metricsRegistry],
            });
            break;
        }

        this.metrics.set(name, metric);
      }

      // Update metric value
      if (metric instanceof Counter) {
        (metric as Counter).inc(labels, value);
      } else if (metric instanceof Histogram) {
        (metric as Histogram).observe(labels, value);
      } else if (metric instanceof Gauge) {
        (metric as Gauge).set(labels, value);
      }
    } catch (error) {
      this.logger.error(`Failed to update Prometheus metric $name`, error);`
      throw error;
    }
  }

  /**
   * Sanitize metric name for Prometheus
   */
  private sanitizeMetricName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9_:]/g, '_')'
      .replace(/^[^a-zA-Z_:]/, '_')'
      .toLowerCase();
  }

  /**
   * Infer metric type from metric data
   */
  private inferMetricType(metricData: any): string {
    if (metricData.buckets||metricData.histogram) {
      return'histogram;
    } else if (metricData.monotonic||metricData.counter) {
      return'counter;
    } else {
      return 'gauge;
    }
  }

  /**
   * Get port for metrics server
   */
  private getPort(): number {
    return this.config.config?.port||9090;
  }

  /**
   * Get metrics endpoint URL
   */
  private getMetricsEndpoint(): string {
    const port = this.getPort();
    const path = this.config.config?.metricsPath||'/metrics;
    return `http://localhost:${port}${path}`;`
  }
}
