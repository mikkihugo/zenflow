/**
 * @fileoverview Local OpenTelemetry Consumer for Phase 3 Ensemble Telemetry
 *
 * Local OTel metrics consumer that ingests telemetry data from any source
 * (Claude Code native, Phase 3 ensemble, external systems) and provides
 * unified metrics for the TUI dashboard.
 *
 * @author Claude Code Zen Team - Telemetry Infrastructure
 * @since 1.0.0-alpha.44
 * @version 1.0.0
 */

import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';
import { performance } from 'node:perf_hooks';
import { getLogger } from '../config/logging-config';

interface OTelMetric {
  name: string;
  value: number;
  timestamp: number;
  attributes?: Record<string, string | number>;
  resource?: Record<string, string>;
}

interface OTelSpan {
  traceId: string;
  spanId: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes?: Record<string, any>;
  status?: 'ok' | 'error' | 'timeout';
}

interface OTelEvent {
  name: string;
  timestamp: number;
  attributes: Record<string, any>;
  resource?: Record<string, string>;
}

interface TelemetryStats {
  // Performance metrics
  accuracy: number;
  confidence: number;
  tokensPerSecond: number;
  tasksPerHour: number;
  averageResponseTime: number;

  // Learning metrics
  learningEvents: number;
  adaptations: number;
  modelUpdates: number;
  strategyChanges: number;

  // Resource metrics
  cpuUsage: number;
  memoryUsage: number;
  activeAgents: number;
  concurrentTasks: number;

  // Quality metrics
  errorRate: number;
  successRate: number;
  userSatisfaction: number;

  // Tier-specific metrics
  tierPerformance: {
    tier1: { accuracy: number; models: number; throughput: number };
    tier2: { accuracy: number; models: number; throughput: number };
    tier3: { accuracy: number; models: number; throughput: number };
  };
}

/**
 * Local OpenTelemetry Consumer for Live Monitoring
 */
export class LocalOTelConsumer extends EventEmitter {
  private server: any;
  private port: number = 4318; // Standard OTel HTTP port
  private metrics: Map<string, OTelMetric[]> = new Map();
  private spans: Map<string, OTelSpan[]> = new Map();
  private events: OTelEvent[] = [];
  private stats: TelemetryStats;
  private logger = getLogger('LocalOTelConsumer');
  private isRunning = false;
  private metricsRetentionMs = 30 * 60 * 1000; // 30 minutes
  private cleanupInterval: NodeJS.Timeout;

  constructor(port?: number) {
    super();
    if (port) this.port = port;
    this.initializeStats();
    this.setupCleanupInterval();
  }

  /**
   * Initialize telemetry stats structure
   */
  private initializeStats(): void {
    this.stats = {
      accuracy: 0,
      confidence: 0,
      tokensPerSecond: 0,
      tasksPerHour: 0,
      averageResponseTime: 0,
      learningEvents: 0,
      adaptations: 0,
      modelUpdates: 0,
      strategyChanges: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      activeAgents: 0,
      concurrentTasks: 0,
      errorRate: 0,
      successRate: 0,
      userSatisfaction: 0,
      tierPerformance: {
        tier1: { accuracy: 0, models: 0, throughput: 0 },
        tier2: { accuracy: 0, models: 0, throughput: 0 },
        tier3: { accuracy: 0, models: 0, throughput: 0 },
      },
    };
  }

  /**
   * Start the OTel consumer server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.port, () => {
        this.isRunning = true;
        this.logger.info(`🔄 Local OTel consumer started on port ${this.port}`);
        this.logger.info(`📊 Ready to receive telemetry from any source`);
        resolve();
      });

      this.server.on('error', (error: Error) => {
        this.logger.error('Failed to start OTel consumer:', error);
        reject(error);
      });
    });
  }

  /**
   * Handle incoming HTTP requests (OTel format)
   */
  private handleRequest(req: any, res: any): void {
    const url = new URL(req.url, `http://localhost:${this.port}`);

    // Set CORS headers for web clients
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === 'POST') {
      let body = '';

      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          this.processOTelData(url.pathname, body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'success' }));
        } catch (error) {
          this.logger.error('Failed to process OTel data:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    } else if (req.method === 'GET' && url.pathname === '/metrics') {
      // Provide current stats for debugging
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.stats, null, 2));
    } else {
      res.writeHead(404);
      res.end();
    }
  }

  /**
   * Process incoming OTel data based on endpoint
   */
  private processOTelData(endpoint: string, body: string): void {
    try {
      const data = JSON.parse(body);

      switch (endpoint) {
        case '/v1/metrics':
          this.processMetrics(data);
          break;
        case '/v1/traces':
          this.processTraces(data);
          break;
        case '/v1/events':
          this.processEvents(data);
          break;
        default:
          // Try to auto-detect data type
          this.autoProcessData(data);
      }

      // Update computed stats after processing new data
      this.updateComputedStats();

      // Emit update event for dashboard
      this.emit('stats:updated', this.stats);
    } catch (error) {
      this.logger.error('Failed to parse OTel data:', error);
      throw error;
    }
  }

  /**
   * Process OTel metrics data
   */
  private processMetrics(data: any): void {
    const resourceMetrics = data.resourceMetrics || data.resource_metrics || [];

    resourceMetrics.forEach((resource: any) => {
      const instrumentationMetrics =
        resource.instrumentationLibraryMetrics || resource.scopeMetrics || [];

      instrumentationMetrics.forEach((instrumentation: any) => {
        const metrics = instrumentation.metrics || [];

        metrics.forEach((metric: any) => {
          this.storeMetric({
            name: metric.name,
            value: this.extractMetricValue(metric),
            timestamp: Date.now(),
            attributes: metric.attributes || {},
            resource: resource.resource?.attributes || {},
          });
        });
      });
    });
  }

  /**
   * Process OTel traces data
   */
  private processTraces(data: any): void {
    const resourceSpans = data.resourceSpans || data.resource_spans || [];

    resourceSpans.forEach((resource: any) => {
      const instrumentationSpans =
        resource.instrumentationLibrarySpans || resource.scopeSpans || [];

      instrumentationSpans.forEach((instrumentation: any) => {
        const spans = instrumentation.spans || [];

        spans.forEach((span: any) => {
          this.storeSpan({
            traceId: span.traceId || span.trace_id,
            spanId: span.spanId || span.span_id,
            operationName: span.name,
            startTime: this.parseOTelTimestamp(
              span.startTimeUnixNano || span.start_time_unix_nano
            ),
            endTime: this.parseOTelTimestamp(
              span.endTimeUnixNano || span.end_time_unix_nano
            ),
            attributes: span.attributes || {},
            status: span.status?.code === 0 ? 'ok' : 'error',
          });
        });
      });
    });
  }

  /**
   * Process OTel events/logs data
   */
  private processEvents(data: any): void {
    const events = data.events || data.logs || [];

    events.forEach((event: any) => {
      this.events.push({
        name: event.name || event.message || 'unknown',
        timestamp: Date.now(),
        attributes: event.attributes || {},
        resource: event.resource?.attributes || {},
      });
    });

    // Keep only recent events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  /**
   * Auto-detect and process unknown data formats
   */
  private autoProcessData(data: any): void {
    // Try to detect Phase 3 ensemble data
    if (data.ensembleStatus || data.globalMetrics) {
      this.processPhase3Data(data);
      return;
    }

    // Try to detect Claude Code data
    if (data.tokensUsed || data.commandsExecuted) {
      this.processClaudeCodeData(data);
      return;
    }

    // Try to detect raw metrics
    if (Array.isArray(data.metrics)) {
      data.metrics.forEach((metric: any) => {
        this.storeMetric({
          name: metric.name || 'unknown',
          value: metric.value || 0,
          timestamp: Date.now(),
          attributes: metric.attributes || {},
        });
      });
    }
  }

  /**
   * Process Phase 3 ensemble data format
   */
  private processPhase3Data(data: any): void {
    if (data.globalMetrics) {
      this.storeMetric({
        name: 'ensemble.accuracy',
        value: data.globalMetrics.averageAccuracy * 100,
        timestamp: Date.now(),
        attributes: { source: 'phase3-ensemble' },
      });

      this.storeMetric({
        name: 'ensemble.confidence',
        value: data.globalMetrics.averageConfidence * 100,
        timestamp: Date.now(),
        attributes: { source: 'phase3-ensemble' },
      });

      this.storeMetric({
        name: 'ensemble.predictions.total',
        value: data.globalMetrics.totalPredictions,
        timestamp: Date.now(),
        attributes: { source: 'phase3-ensemble' },
      });
    }

    if (data.tierStatus) {
      Object.entries(data.tierStatus).forEach(
        ([tier, status]: [string, any]) => {
          this.storeMetric({
            name: `ensemble.tier${tier}.accuracy`,
            value: status.averageAccuracy * 100,
            timestamp: Date.now(),
            attributes: { tier, source: 'phase3-ensemble' },
          });

          this.storeMetric({
            name: `ensemble.tier${tier}.models`,
            value: status.modelCount,
            timestamp: Date.now(),
            attributes: { tier, source: 'phase3-ensemble' },
          });
        }
      );
    }
  }

  /**
   * Process Claude Code telemetry data format
   */
  private processClaudeCodeData(data: any): void {
    if (data.tokensUsed) {
      this.storeMetric({
        name: 'claude.tokens.used',
        value: data.tokensUsed,
        timestamp: Date.now(),
        attributes: { source: 'claude-code' },
      });
    }

    if (data.commandsExecuted) {
      this.storeMetric({
        name: 'claude.commands.total',
        value: data.commandsExecuted.length,
        timestamp: Date.now(),
        attributes: { source: 'claude-code' },
      });
    }

    if (data.executionTimes) {
      const avgTime =
        data.executionTimes.reduce((a: number, b: number) => a + b, 0) /
        data.executionTimes.length;
      this.storeMetric({
        name: 'claude.execution.average_time',
        value: avgTime,
        timestamp: Date.now(),
        attributes: { source: 'claude-code' },
      });
    }
  }

  /**
   * Store metric in local storage
   */
  private storeMetric(metric: OTelMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metricList = this.metrics.get(metric.name)!;
    metricList.push(metric);

    // Keep only recent metrics per name (last 100 points)
    if (metricList.length > 100) {
      metricList.shift();
    }

    this.logger.debug(`📊 Metric received: ${metric.name} = ${metric.value}`);
  }

  /**
   * Store span in local storage
   */
  private storeSpan(span: OTelSpan): void {
    const operation = span.operationName || 'unknown';

    if (!this.spans.has(operation)) {
      this.spans.set(operation, []);
    }

    // Calculate duration if not provided
    if (span.endTime && span.startTime && !span.duration) {
      span.duration = span.endTime - span.startTime;
    }

    const spanList = this.spans.get(operation)!;
    spanList.push(span);

    // Keep only recent spans per operation (last 50)
    if (spanList.length > 50) {
      spanList.shift();
    }

    this.logger.debug(`🔍 Span received: ${operation} (${span.duration}ms)`);
  }

  /**
   * Update computed statistics from raw metrics
   */
  private updateComputedStats(): void {
    // Update performance metrics
    this.stats.accuracy =
      this.getLatestMetricValue('ensemble.accuracy') ||
      this.computeAverageAccuracy();
    this.stats.confidence =
      this.getLatestMetricValue('ensemble.confidence') || this.stats.confidence;

    // Update resource metrics
    this.stats.cpuUsage = this.getLatestMetricValue('system.cpu.usage') || 0;
    this.stats.memoryUsage =
      this.getLatestMetricValue('system.memory.usage') || 0;
    this.stats.activeAgents = this.getLatestMetricValue('agents.active') || 0;

    // Update learning metrics
    this.stats.learningEvents = this.getMetricSum('learning.events') || 0;
    this.stats.adaptations = this.getMetricSum('learning.adaptations') || 0;
    this.stats.modelUpdates = this.getMetricSum('learning.model.updates') || 0;

    // Update tier performance
    for (let tier = 1; tier <= 3; tier++) {
      const tierKey = `tier${tier}` as keyof typeof this.stats.tierPerformance;
      this.stats.tierPerformance[tierKey] = {
        accuracy:
          this.getLatestMetricValue(`ensemble.tier${tier}.accuracy`) || 0,
        models: this.getLatestMetricValue(`ensemble.tier${tier}.models`) || 0,
        throughput: this.getMetricRate(`tier${tier}.tasks.completed`) || 0,
      };
    }

    // Update computed rates
    this.stats.tokensPerSecond = this.getMetricRate('claude.tokens.used') || 0;
    this.stats.tasksPerHour = this.getMetricRate('tasks.completed') * 3600 || 0;
    this.stats.averageResponseTime = this.computeAverageResponseTime();
    this.stats.successRate = this.computeSuccessRate();
    this.stats.errorRate = 1 - this.stats.successRate;
  }

  /**
   * Get latest value for a metric
   */
  private getLatestMetricValue(metricName: string): number | null {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) return null;

    return metrics[metrics.length - 1].value;
  }

  /**
   * Get sum of all values for a metric
   */
  private getMetricSum(metricName: string): number {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) return 0;

    return metrics.reduce((sum, metric) => sum + metric.value, 0);
  }

  /**
   * Get rate (per second) for a metric
   */
  private getMetricRate(metricName: string): number {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length < 2) return 0;

    const recent = metrics.slice(-10); // Last 10 points
    const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
    const valueSpan = recent[recent.length - 1].value - recent[0].value;

    if (timeSpan === 0) return 0;
    return (valueSpan / timeSpan) * 1000; // Convert to per-second
  }

  /**
   * Compute average accuracy across all sources
   */
  private computeAverageAccuracy(): number {
    const accuracyMetrics = Array.from(this.metrics.keys())
      .filter((key) => key.includes('accuracy'))
      .map((key) => this.getLatestMetricValue(key))
      .filter((val) => val !== null) as number[];

    if (accuracyMetrics.length === 0) return 0;
    return (
      accuracyMetrics.reduce((sum, val) => sum + val, 0) /
      accuracyMetrics.length
    );
  }

  /**
   * Compute average response time from spans
   */
  private computeAverageResponseTime(): number {
    const allSpans = Array.from(this.spans.values()).flat();
    const validSpans = allSpans.filter(
      (span) => span.duration && span.duration > 0
    );

    if (validSpans.length === 0) return 0;

    const totalDuration = validSpans.reduce(
      (sum, span) => sum + (span.duration || 0),
      0
    );
    return totalDuration / validSpans.length;
  }

  /**
   * Compute success rate from spans and metrics
   */
  private computeSuccessRate(): number {
    const allSpans = Array.from(this.spans.values()).flat();
    if (allSpans.length === 0) return 1; // Assume success if no data

    const successfulSpans = allSpans.filter((span) => span.status === 'ok');
    return successfulSpans.length / allSpans.length;
  }

  /**
   * Extract metric value from OTel metric data
   */
  private extractMetricValue(metric: any): number {
    // Handle different OTel metric types
    if (metric.gauge?.dataPoints?.[0]?.asDouble !== undefined) {
      return metric.gauge.dataPoints[0].asDouble;
    }
    if (metric.gauge?.dataPoints?.[0]?.asInt !== undefined) {
      return metric.gauge.dataPoints[0].asInt;
    }
    if (metric.counter?.dataPoints?.[0]?.asDouble !== undefined) {
      return metric.counter.dataPoints[0].asDouble;
    }
    if (metric.counter?.dataPoints?.[0]?.asInt !== undefined) {
      return metric.counter.dataPoints[0].asInt;
    }
    if (metric.sum?.dataPoints?.[0]?.asDouble !== undefined) {
      return metric.sum.dataPoints[0].asDouble;
    }
    if (metric.sum?.dataPoints?.[0]?.asInt !== undefined) {
      return metric.sum.dataPoints[0].asInt;
    }

    // Fallback to simple value
    return metric.value || 0;
  }

  /**
   * Parse OTel nanosecond timestamp to milliseconds
   */
  private parseOTelTimestamp(nanoTimestamp: string | number): number {
    if (typeof nanoTimestamp === 'string') {
      return parseInt(nanoTimestamp) / 1_000_000;
    }
    return nanoTimestamp / 1_000_000;
  }

  /**
   * Setup periodic cleanup of old data
   */
  private setupCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupOldData();
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }

  /**
   * Clean up old telemetry data
   */
  private cleanupOldData(): void {
    const cutoffTime = Date.now() - this.metricsRetentionMs;

    // Clean up old metrics
    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(
        (metric) => metric.timestamp > cutoffTime
      );
      if (filtered.length !== metrics.length) {
        this.metrics.set(name, filtered);
      }
    }

    // Clean up old events
    this.events = this.events.filter((event) => event.timestamp > cutoffTime);

    // Clean up old spans
    for (const [operation, spans] of this.spans.entries()) {
      const filtered = spans.filter((span) => span.startTime > cutoffTime);
      if (filtered.length !== spans.length) {
        this.spans.set(operation, filtered);
      }
    }
  }

  /**
   * Get current telemetry statistics
   */
  public getStats(): TelemetryStats {
    return { ...this.stats };
  }

  /**
   * Get raw metrics for debugging
   */
  public getRawMetrics(): Map<string, OTelMetric[]> {
    return new Map(this.metrics);
  }

  /**
   * Get available metric names
   */
  public getAvailableMetrics(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Push telemetry data directly (for testing or direct integration)
   */
  public pushMetric(
    name: string,
    value: number,
    attributes?: Record<string, any>
  ): void {
    this.storeMetric({
      name,
      value,
      timestamp: Date.now(),
      attributes: attributes || {},
    });

    this.updateComputedStats();
    this.emit('stats:updated', this.stats);
  }

  /**
   * Stop the OTel consumer
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      if (this.server) {
        this.server.close(() => {
          this.isRunning = false;
          this.logger.info('🛑 Local OTel consumer stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

/**
 * Create and start local OTel consumer
 */
export async function createOTelConsumer(
  port?: number
): Promise<LocalOTelConsumer> {
  const consumer = new LocalOTelConsumer(port);
  await consumer.start();
  return consumer;
}
