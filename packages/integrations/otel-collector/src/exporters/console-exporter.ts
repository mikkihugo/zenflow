/**
 * @fileoverview Console Exporter
 *
 * Simple console-based exporter for development and debugging.
 * Outputs formatted telemetry data to console with color coding.
 */

import type { Logger} from '@claude-zen/foundation';
import { getLogger} from '@claude-zen/foundation/logging';
import type { ExporterConfig, ExportResult, TelemetryData} from '../types.js';
import type { BaseExporter} from './index.js';

/**
 * Console exporter for development and debugging
 */
export class ConsoleExporter implements BaseExporter {
 private config:ExporterConfig;
 private logger:Logger;
 private exportCount = 0;
 private lastExportTime: number | null = null;
 private lastError: string | null = null;

 constructor(config:ExporterConfig) {
   this.config = config;
   this.logger = getLogger(`ConsoleExporter:${config.name}`);
 }

 async initialize():Promise<void> {
 this.logger.info('Console exporter initialized', {
 name:this.config.name,
 signals:this.config.signals || ['traces', 'metrics', 'logs'],
});
}

 async export(data:TelemetryData): Promise<ExportResult> {
 try {
 this.formatAndLog(data);

 this.exportCount++;
 this.lastExportTime = Date.now();
 this.lastError = null;

 return {
 success:true,
 exported:1,
 backend:this.config.name,
 duration:0,
};
} catch (error) {
 const errorMessage = String(error);
 this.lastError = errorMessage;
 this.logger.error('Console export failed', error);

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
 try {
 this.logger.info(
 ` Batch Export (${dataItems.length} items) - ${this.config.name}`
 );

 for (const data of dataItems) {
 this.formatAndLog(data);
}

 this.exportCount += dataItems.length;
 this.lastExportTime = Date.now();
 this.lastError = null;

 return {
 success:true,
 exported:dataItems.length,
 backend:this.config.name,
 duration:0,
};
} catch (error) {
 const errorMessage = String(error);
 this.lastError = errorMessage;
 this.logger.error('Console batch export failed', error);

 return {
 success:false,
 exported:0,
 error:errorMessage,
 backend:this.config.name,
 duration:0,
};
}
}

 async shutdown():Promise<void> {
 this.logger.info('Console exporter shut down', {
 totalExported:this.exportCount,
});
}

 getQueueSize():number {
 return 0; // Console exporter has no queue
}

 async getHealthStatus():Promise<{
 status:'healthy' | ' degraded' | ' unhealthy';
 lastSuccess?:number;
 lastError?:string;
}> {
 return {
 status:this.lastError ? 'degraded' : ' healthy', lastSuccess:this.lastExportTime || undefined,
 lastError:this.lastError || undefined,
};
}

 /**
 * Format and log telemetry data to console
 */
 private formatAndLog(data: TelemetryData): void {
 const timestamp = new Date(data.timestamp).toISOString();
 const service = `${data.service.name}${data.service.version ? `@${data.service.version}` : ''}`

 let emoji = 'METRICS';
 let color = '';

 switch (data.type) {
 case 'traces':
 emoji = 'TRACES';
 color = '\x1b[36m'; // Cyan
 break;
 case 'metrics':
 emoji = 'METRICS';
 color = '\x1b[32m'; // Green
 break;
 case 'logs':
 emoji = 'LOGS';
 color = '\x1b[33m'; // Yellow
 break;
}

 const reset = '\x1b[0m';

 logger.info(
 `${color}${emoji}[${timestamp}] ${data.type.toUpperCase()} ${service}${reset}`
 );

 // Format the data payload
 if (data.type === 'traces') {
 this.logTraceData(data);
} else if (data.type === 'metrics') {
 this.logMetricData(data);
} else if (data.type === 'logs') {
 this.logLogData(data);
}

 // Log attributes if present
 if (data.attributes && Object.keys(data.attributes).length > 0) {
 logger.info(
 ` ${color}Attributes:${reset}`,
 JSON.stringify(data.attributes, null, 2)
 );
 }

 logger.info(''); // Empty line for readability
 }

 /**
 * Format and log trace data
 */
 private logTraceData(data:TelemetryData): void {
 try {
   logger.info(` Spans:${data.data.spans.length}`);
   for (const span of data.data.spans.slice(0, 3)) {
     // Show first 3 spans
     logger.info(
       ` ├─ ${span.name || 'unnamed'} (${span.duration || 'unknown'}ms)`
     );
   }
   if (data.data.spans.length > 3) {
     logger.info(` └─ ... and ${data.data.spans.length - 3} more`);
   }
 } catch (error) {
   logger.info(` ERROR Invalid trace data:`, data.data);
 }
}

 /**
 * Format and log metric data
 */
 private logMetricData(data:TelemetryData): void {
 try {
   logger.info(` Metrics:${data.data.metrics.length}`);
   for (const metric of data.data.metrics.slice(0, 5)) {
     // Show first 5 metrics
     const value = metric.value || metric.count || metric.sum || 'N/A';
     logger.info(` ├─ ${metric.name}: ${value} ${metric.unit || ''}`);
   }
   if (data.data.metrics.length > 5) {
     logger.info(` └─ ... and ${data.data.metrics.length - 5} more`);
   }
 } else {
 logger.info(` Data:`, JSON.stringify(data.data, null, 2));
 }
 } catch (error) {
 logger.info(` Invalid metric data:`, data.data);
 }
}

 /**
 * Format and log log data
 */
 private logLogData(data:TelemetryData): void {
 try {
 if (data.data && data.data.logs) {
 logger.info(` Logs:${data.data.logs.length}`
 for (const log of data.data.logs.slice(0, 3)) {
 // Show first 3 logs
 const level = log.level || 'INFO';
 const message = (log.message || log.body || 'no message').substring(
 0,
 100
 );
 logger.info(
 ` ├─ [${level}] ${message}${message.length === 100 ? '...' : ''}`
 );
 }
 if (data.data.logs.length > 3) {
 logger.info(` └─ ... and ${data.data.logs.length - 3} more`
 }
 } else if (typeof data.data === 'string') {
 logger.info(
 ` LOGS Message: ${data.data.substring(0, 200)}${data.data.length > 200 ? '...' : ''}`
 );
 } else {
 logger.info(` DATA:`, JSON.stringify(data.data, null, 2));
 }
 } catch (error) {
 logger.info(` ERROR Invalid log data:`, data.data);
 }
}
}
