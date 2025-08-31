/**
 * @fileoverview OTLP Exporter
 *
 * Exports telemetry data using OpenTelemetry Protocol (OTLP) over HTTP or gRPC.
 * Supports traces, metrics, and logs.
 */

import { getLogger} from '@claude-zen/foundation/logging';
import type { ExporterConfig, ExportResult, TelemetryData} from '../types.js';
import type { BaseExporter} from './index.js';

/**
 * OTLP exporter implementation for HTTP and gRPC
 */
export class OTLPExporter implements BaseExporter {

  constructor(config:ExporterConfig) {
    this.config = config;
    this.logger = getLogger(`OTLPExporter:${config.name}`);`

    this.maxQueueSize = config.config?.maxQueueSize || 1000;
    this.batchTimeout = config.config?.batchTimeout || 5000;
    this.maxBatchSize = config.config?.maxBatchSize || 100;
}

  async initialize():Promise<void> {
    try {
      const baseConfig = {
        url:this.config.endpoint || 'http://localhost:4318',        headers:this.config.headers || {},
        ...(this.config.timeout && { timeoutMillis:this.config.timeout}),
};

      // Initialize exporters based on supported signals
      const signals = this.config.signals || ['traces',    'metrics',    'logs'];')
      if (signals.includes('traces')) {
    ')        this.traceExporter = new OTLPTraceExporter({
          ...baseConfig,
          url:`${{}\1}.url/v1/traces`,`
});
}

      if (signals.includes('metrics')) {
    ')        this.metricExporter = new OTLPMetricExporter(
          ...baseConfig,
          url:`${{}\1}.url/v1/metrics`,`);
}

      // Start batch processing
      this.startBatchTimer();

      this.logger.info('OTLP exporter initialized',{
        endpoint:this.config.endpoint,
        type:this.config.type,
        signals,
        maxQueueSize:this.maxQueueSize,
});
} catch (error) {
      this.logger.error('Failed to initialize OTLP exporter', error);
      throw error;
}
}

  async export(data:TelemetryData): Promise<ExportResult> {
    if (this.isShuttingDown) {
      return {
        success:false,
        exported:0,
        error: 'Exporter is shutting down',        backend:this.config.name,
        duration:0,
};
}

    try {
      // Add to queue for batch processing
      if (this.queue.length >= this.maxQueueSize) {
        this.queue.shift(); // Remove oldest
        this.logger.warn('Queue full, dropping oldest item');')}

      this.queue.push(data);

      // Trigger immediate batch processing if queue is full
      if (this.queue.length >= this.maxBatchSize) {
        await this.processBatch();
}

      return {
        success:true,
        exported:1,
        backend:this.config.name,
        duration:0,
};
} catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('OTLP export failed', error);

      return {
        success:false,
        exported:0,
        error:errorMessage,
        backend:this.config.name,
        duration:0,
};
}
}

  async exportBatch(dataItems:TelemetryData[]): Promise<ExportResult> {
    if (this.isShuttingDown) {
      return {
        success:false,
        exported:0,
        error: 'Exporter is shutting down',        backend:this.config.name,
        duration:0,
};
}

    try {
      const startTime = Date.now();
      let totalExported = 0;

      // Group by signal type
      const traceItems = dataItems.filter((item) => item.type === 'traces');')      const metricItems = dataItems.filter((item) => item.type === 'metrics');')      const logItems = dataItems.filter((item) => item.type === 'logs');')
      // Export traces
      if (traceItems.length > 0 && this.traceExporter) {
        const exported = await this.exportTraces(traceItems);
        totalExported += exported;
}

      // Export metrics
      if (metricItems.length > 0 && this.metricExporter) {
        const exported = await this.exportMetrics(metricItems);
        totalExported += exported;
}

      // Export logs (if supported)
      if (logItems.length > 0) {
        const exported = await this.exportLogs(logItems);
        totalExported += exported;
}

      this.exportCount += totalExported;
      this.lastExportTime = Date.now();
      this.lastError = null;

      return {
        success:true,
        exported:totalExported,
        backend:this.config.name,
        duration:Date.now() - startTime,
};
} catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('OTLP batch export failed', error);

      return {
        success:false,
        exported:0,
        error:errorMessage,
        backend:this.config.name,
        duration:Date.now() - Date.now(),
};
}
}

  async shutdown():Promise<void> {
    this.isShuttingDown = true;

    // Stop batch timer
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
}

    // Process remaining queue
    if (this.queue.length > 0) {
      this.logger.info(
        `Processing ${this.queue.length} remaining items before shutdown``
      );
      await this.processBatch();
}

    // Shutdown exporters
    try {
      if (this.traceExporter) {
        await this.traceExporter.shutdown();
}
      if (this.metricExporter) {
        await this.metricExporter.shutdown();
}
} catch (error) {
      this.logger.error('Error shutting down OTLP exporters', error);
}

    this.logger.info('OTLP exporter shut down',{
      totalExported:this.exportCount,
});
}

  getQueueSize():number {
    return this.queue.length;
}

  async getHealthStatus():Promise<{
    status:'healthy' | ' degraded' | ' unhealthy';
    lastSuccess?:number;
    lastError?:string;
}> {
    const queueUtilization = this.queue.length / this.maxQueueSize;

    let status:'healthy' | ' degraded' | ' unhealthy' = ' healthy';

    if (this.lastError) {
      status = 'unhealthy';
} else if (queueUtilization > 0.8) {
      status = 'degraded';
}

    return {
      status,
      lastSuccess:this.lastExportTime || undefined,
      lastError:this.lastError || undefined,
};
}

  /**
   * Start batch processing timer
   */
  private startBatchTimer():void {
    this.batchTimer = setInterval(async () => {
      if (this.queue.length > 0) {
        await this.processBatch();
}
}, this.batchTimeout);
}

  /**
   * Process queued items
   */
  private async processBatch():Promise<void> {
    if (this.queue.length === 0 || this.isShuttingDown) {
      return;
}

    const items = this.queue.splice(0, this.maxBatchSize);

    try {
      await this.exportBatch(items);
} catch (error) {
      this.logger.error('Batch processing failed', error);
}
}

  /**
   * Export traces to OTLP endpoint
   */
  private async exportTraces(dataItems:TelemetryData[]): Promise<number> {
    if (!this.traceExporter) return 0;

    const spans = this.convertToOTLPTraces(dataItems);
    if (spans.length === 0) return 0;

    return new Promise<number>((resolve, reject) => {
      this.traceExporter!.export(spans, (result) => {
        if (result.code === 0) {
          resolve(spans.length);
} else {
          reject(
            new Error(
              `OTLP trace export failed:${result.error || 'Unknown error'}``
            )
          );
}
});
});
}

  /**
   * Export metrics to OTLP endpoint
   */
  private async exportMetrics(dataItems:TelemetryData[]): Promise<number> {
    if (!this.metricExporter) return 0;

    const metrics = this.convertToOTLPMetrics(dataItems);
    if (metrics.length === 0) return 0;

    return new Promise<number>((resolve, reject) => {
      this.metricExporter?.export(metrics, (result) => {
        if (result.code === 0) {
          resolve(metrics.length);
} else {
          reject(
            new Error(
              `OTLP metric export failed:${result.error || 'Unknown error'}``
            )
          );
}
});
});
}

  /**
   * Export logs to OTLP endpoint
   */
  private async exportLogs(dataItems:TelemetryData[]): Promise<number> {
    // For now, convert logs to metrics or traces
    // Full OTLP log export would require additional OTLP log exporter
    this.logger.debug(
      `Skipping ${dataItems.length} log items (OTLP log export not yet implemented)``
    );
    return 0;
}

  /**
   * Convert telemetry data to OTLP trace format
   */
  private convertToOTLPTraces(dataItems:TelemetryData[]): any[] {
    const spans:any[] = [];

    for (const data of dataItems) {
      try {
        if (data.type === 'traces' && data.data) {
    ')          if (Array.isArray(data.data)) {
            spans.push(...data.data);
} else if (data.data.spans) {
            spans.push(...data.data.spans);
} else {
            spans.push(data.data);
}
}
} catch (error) {
        this.logger.warn('Failed to convert trace data', error);')}
}

    return spans;
}

  /**
   * Convert telemetry data to OTLP metrics format
   */
  private convertToOTLPMetrics(dataItems:TelemetryData[]): any[] {
    const metrics:any[] = [];

    for (const data of dataItems) {
      try {
        if (data.type === 'metrics' && data.data) {
    ')          if (Array.isArray(data.data)) {
            metrics.push(...data.data);
} else if (data.data.metrics) {
            metrics.push(...data.data.metrics);
} else {
            metrics.push(data.data);
}
}
} catch (error) {
        this.logger.warn('Failed to convert metric data', error);')}
}

    return metrics;
}
}
