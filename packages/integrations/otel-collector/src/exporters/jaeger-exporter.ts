/**
 * @fileoverview Jaeger Exporter
 *
 * Exports telemetry data to Jaeger for distributed tracing.
 * Primarily handles trace data but can also export logs and metrics.
 */

import type { Logger} from '@claude-zen/foundation';
import { getLogger} from '@claude-zen/foundation';
import type { JaegerExporter as OTELJaegerExporter} from '@opentelemetry/exporter-jaeger';
import type { ExporterConfig, ExportResult, TelemetryData} from '../types.js';
import type { BaseExporter} from './index.js';

/**
 * Queue item for batching exports
 */
interface QueueItem {
  data:TelemetryData;
  timestamp:number;
}

/**
 * Jaeger exporter implementation
 */
export class JaegerExporter implements BaseExporter {
  private logger:Logger;
  private jaegerExporter:OTELJaegerExporter  |  null = null;
  private queue:QueueItem[] = [];
  private batchTimer:NodeJS.Timeout  |  null = null;
  private exportCount = 0;
  private lastExportTime: 'number' | 'null' = null;
  private lastError: 'string' | 'null' = null;
  private isShuttingDown = false;
  
  // Configuration
  private readonly maxQueueSize:number;
  private readonly batchTimeout:number;
  private readonly maxBatchSize:number;

  constructor(private config:ExporterConfig) {
    this.logger = getLogger(`JaegerExporter:${  config.name}`);

    // Extract configuration values
    this.maxQueueSize = config.config?.maxQueueSize   ||   1000;
    this.batchTimeout = config.config?.batchTimeout   ||   5000; // 5 seconds
    this.maxBatchSize = config.config?.maxBatchSize   ||   100;
}

  async initialize():Promise<void> {
    try {
      // Create Jaeger exporter
      this.jaegerExporter = new OTELJaegerExporter({
        endpoint:this.config.endpoint   ||   'http://localhost:14268/api/traces',        headers:this.config.headers   ||   {},
        // Add timeout if specified
        ...(this.config.timeout  &&  { timeout:this.config.timeout}),
});

      // Start batch processing timer
      this.startBatchTimer();

      this.logger.info('Jaeger exporter initialized', {
        endpoint:this.config.endpoint,
        maxQueueSize:this.maxQueueSize,
        batchTimeout:this.batchTimeout,
        maxBatchSize:this.maxBatchSize,
});
} catch (error) {
      this.logger.error('Failed to initialize Jaeger exporter', error);
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
        // Remove oldest item to make room
        this.queue.shift();
        this.logger.warn('Queue full, dropping oldest item');
}

      this.queue.push({
        data,
        timestamp:Date.now(),
});

      // If queue is getting full, trigger immediate batch processing
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
      this.logger.error('Jaeger export failed', error);

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

      // Filter for trace data (Jaeger primarily handles traces)
      const traceItems = dataItems.filter((item) => item.type === 'traces');

      if (traceItems.length === 0) {
        return {
          success:true,
          exported:0,
          backend:this.config.name,
          duration:Date.now() - startTime,
};
}

      // Convert to Jaeger format and export
      await this.exportToJaeger(traceItems);

      this.exportCount += traceItems.length;
      this.lastExportTime = Date.now();
      this.lastError = null;

      return {
        success:true,
        exported:traceItems.length,
        backend:this.config.name,
        duration:Date.now() - startTime,
};
} catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Jaeger batch export failed', error);

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

    // Process remaining items in queue
    if (this.queue.length > 0) {
      this.logger.info(
        `Processing ${  this.queue.length  } remaining items before shutdown`
      );
      await this.processBatch();
}

    // Shutdown Jaeger exporter
    if (this.jaegerExporter) {
      try {
        await this.jaegerExporter.shutdown();
} catch (error) {
        this.logger.error('Error shutting down Jaeger exporter', error);
}
}

    this.logger.info('Jaeger exporter shut down', {
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
    // Check if queue is getting too full
    const queueUtilization = this.queue.length / this.maxQueueSize;

    let status:'healthy' | ' degraded' | ' unhealthy' = ' healthy';

    if (this.lastError) {
      status = 'unhealthy';
} else if (queueUtilization > 0.8) {
      status = 'degraded';
}

    return {
      status,
      lastSuccess:this.lastExportTime   ||   undefined,
      lastError:this.lastError   ||   undefined,
};
}

  /**
   * Start the batch processing timer
   */
  private startBatchTimer():void {
    this.batchTimer = setInterval(async () => {
      if (this.queue.length > 0) {
        await this.processBatch();
}
}, this.batchTimeout);
}

  /**
   * Process queued items in batches
   */
  private async processBatch():Promise<void> {
    if (this.queue.length === 0   ||   this.isShuttingDown) {
      return;
}

    // Take items from queue for processing
    const items = this.queue.splice(0, this.maxBatchSize);
    const dataItems = items.map((item) => item.data);

    try {
      await this.exportBatch(dataItems);
} catch (error) {
      this.logger.error('Batch processing failed', error);
      // Items are already removed from queue, so they're lost
      // This is intentional to prevent infinite retry loops
}
}

  /**
   * Export data to Jaeger
   */
  private async exportToJaeger(dataItems:TelemetryData[]): Promise<void> {
    if (!this.jaegerExporter) {
      throw new Error('Jaeger exporter not initialized');
}

    // Convert telemetry data to OpenTelemetry format
    const spans = this.convertToOTELSpans(dataItems);

    if (spans.length === 0) {
      return;
}

    // Export to Jaeger
    return new Promise<void>((resolve, reject) => {
      this.jaegerExporter?.export(spans, (result) => {
        if (result.code === 0) {
          // SUCCESS
          resolve();
} else {
          reject(
            new Error(
              `Jaeger export failed:${  result.error}`   ||   'Unknown error'
            )
          );
}
});
});
}

  /**
   * Convert telemetry data to OpenTelemetry span format
   */
  private convertToOTELSpans(dataItems:TelemetryData[]): any[] {
    const spans:any[] = [];

    for (const data of dataItems) {
      try {
        if (data.type === 'traces'  &&  data.data) {
          // Handle different trace data formats
          if (Array.isArray(data.data)) {
            spans.push(...data.data);
} else if (data.data.spans  &&  Array.isArray(data.data.spans)) {
            spans.push(...data.data.spans);
} else if (data.data.resourceSpans) {
            // OTLP format
            for (const resourceSpan of data.data.resourceSpans) {
              if (resourceSpan.scopeSpans) {
                for (const scopeSpan of resourceSpan.scopeSpans) {
                  if (scopeSpan.spans) {
                    spans.push(...scopeSpan.spans);
}
}
}
}
} else {
            // Single span
            spans.push(data.data);
}
}
} catch (error) {
        this.logger.warn('Failed to convert data item to span', {
          error,
          dataType:data.type,
});
}
}

    return spans;
}
}
