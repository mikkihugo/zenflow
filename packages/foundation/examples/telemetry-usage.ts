/**
 * @fileoverview Telemetry Usage Examples
 * 
 * Comprehensive examples demonstrating how to use the telemetry system
 * in claude-code-zen packages and applications.
 */

import {
  // Core telemetry manager
  TelemetryManager,
  initializeTelemetry,
  
  // Convenience functions
  recordMetric,
  recordHistogram,
  recordGauge,
  startTrace,
  withAsyncTrace,
  recordEvent,
  setTraceAttributes,
  
  // Decorators
  traced,
  tracedAsync,
  metered,
  
  // DI integration
  injectable,
  inject,
  TOKENS,
  
  // Types
  type TelemetryConfig,
  type Span
} from '@claude-zen/foundation';

// =============================================================================
// EXAMPLE 1: Basic Usage
// =============================================================================

/**
 * Simple telemetry usage example
 */
export async function basicTelemetryExample(): Promise<void> {
  // Initialize telemetry with custom configuration
  const config: Partial<TelemetryConfig> = {
    serviceName: 'my-claude-zen-service',
    enableTracing: true,
    enableMetrics: true,
    prometheusPort: 9090
  };
  
  const result = await initializeTelemetry(config);
  if (result.isErr()) {
    console.error('Failed to initialize telemetry:', result.error);
    return;
  }
  
  console.log('✅ Telemetry initialized successfully');
  
  // Record some metrics
  recordMetric('app_startup_total', 1, { version: '1.0.0' });
  recordHistogram('operation_duration_ms', 150, { operation: 'startup' });
  recordGauge('active_connections', 42);
  
  // Create a trace
  const span = startTrace('main_operation');
  span.setAttributes({ userId: '123', operation: 'example' });
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 100));
  
  span.addEvent('work_completed');
  span.end();
  
  console.log('✅ Basic telemetry example completed');
}

// =============================================================================
// EXAMPLE 2: Advanced Usage with Decorators
// =============================================================================

/**
 * Service class demonstrating telemetry decorators
 */
@injectable()
export class ExampleService {
  private readonly name = 'ExampleService';
  
  /**
   * Method with automatic tracing
   */
  @traced('process_data')
  processData(data: any[]): any[] {
    console.log(`Processing ${data.length} items...`);
    
    // Record processing metrics
    recordMetric('items_processed_total', data.length, { service: this.name });
    
    // Add trace event
    recordEvent('data_processing_started', { itemCount: data.length });
    
    // Simulate processing
    const processed = data.map(item => ({ ...item, processed: true }));
    
    recordEvent('data_processing_completed', { 
      itemCount: processed.length,
      success: true 
    });
    
    return processed;
  }
  
  /**
   * Async method with automatic tracing and metrics
   */
  @tracedAsync('fetch_remote_data')
  @metered('remote_fetch')
  async fetchRemoteData(url: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Set trace attributes
      setTraceAttributes({ 
        url, 
        service: this.name,
        operation: 'fetch'
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
      
      const duration = Date.now() - startTime;
      recordHistogram('api_request_duration_ms', duration, { 
        endpoint: url,
        status: 'success'
      });
      
      return { data: 'mock data', timestamp: Date.now() };
    } catch (error) {
      const duration = Date.now() - startTime;
      recordHistogram('api_request_duration_ms', duration, { 
        endpoint: url,
        status: 'error'
      });
      
      recordMetric('api_errors_total', 1, { 
        endpoint: url,
        error: error instanceof Error ? error.name : 'unknown'
      });
      
      throw error;
    }
  }
  
  /**
   * Method with manual tracing for fine-grained control
   */
  async complexOperation(items: any[]): Promise<void> {
    await withAsyncTrace('complex_operation', async (span) => {
      span.setAttributes({
        itemCount: items.length,
        service: this.name
      });
      
      // Step 1: Validation
      await withAsyncTrace('validation_step', async (validationSpan) => {
        validationSpan.setAttributes({ step: 'validation' });
        
        const validItems = items.filter(item => item.id);
        recordGauge('valid_items_count', validItems.length);
        
        if (validItems.length !== items.length) {
          const invalidCount = items.length - validItems.length;
          recordMetric('validation_errors_total', invalidCount);
          validationSpan.addEvent('validation_warnings', { invalidCount });
        }
      });
      
      // Step 2: Processing
      await withAsyncTrace('processing_step', async (processingSpan) => {
        processingSpan.setAttributes({ step: 'processing' });
        
        for (let i = 0; i < items.length; i++) {
          await this.processItem(items[i], i);
          recordGauge('processed_items_count', i + 1);
        }
      });
      
      // Step 3: Finalization
      span.addEvent('operation_completed', { 
        totalItems: items.length,
        success: true
      });
    });
  }
  
  private async processItem(item: any, index: number): Promise<void> {
    const span = startTrace('process_single_item');
    span.setAttributes({ itemIndex: index, itemId: item.id });
    
    try {
      // Simulate item processing
      await new Promise(resolve => setTimeout(resolve, 10));
      span.setStatus({ code: 1 }); // OK
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      span.setStatus({ code: 2, message: 'Processing failed' }); // ERROR
      throw error;
    } finally {
      span.end();
    }
  }
}

// =============================================================================
// EXAMPLE 3: DI Integration
// =============================================================================

/**
 * Service that uses telemetry via dependency injection
 */
@injectable()
export class TelemetryAwareService {
  constructor(
    @inject(TOKENS.TelemetryManager) private telemetry: TelemetryManager
  ) {}
  
  async performWork(workload: any): Promise<void> {
    const span = this.telemetry.startSpan('perform_work');
    
    try {
      span.setAttributes({
        workloadType: typeof workload,
        workloadSize: JSON.stringify(workload).length
      });
      
      // Record work metrics
      this.telemetry.recordCounter('work_requests_total', 1, {
        type: typeof workload
      });
      
      // Simulate work
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 100));
      const duration = Date.now() - startTime;
      
      this.telemetry.recordHistogram('work_duration_ms', duration, {
        type: typeof workload
      });
      
      span.addEvent('work_completed', { duration });
      span.setStatus({ code: 1 }); // OK
      
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      span.setStatus({ code: 2, message: 'Work failed' }); // ERROR
      
      this.telemetry.recordCounter('work_errors_total', 1, {
        error: error instanceof Error ? error.name : 'unknown'
      });
      
      throw error;
    } finally {
      span.end();
    }
  }
}

// =============================================================================
// EXAMPLE 4: Environment-based Configuration
// =============================================================================

/**
 * Example of loading telemetry configuration from environment
 */
export function createTelemetryFromEnvironment(): TelemetryManager {
  // These environment variables would be set in your deployment
  const config: Partial<TelemetryConfig> = {
    serviceName: process.env['SERVICE_NAME'] || 'claude-zen-service',
    serviceVersion: process.env['SERVICE_VERSION'] || '1.0.0',
    enableTracing: process.env['ENABLE_TRACING'] !== 'false',
    enableMetrics: process.env['ENABLE_METRICS'] !== 'false',
    prometheusPort: parseInt(process.env['PROMETHEUS_PORT'] || '9090', 10),
    jaegerEndpoint: process.env['JAEGER_ENDPOINT'] || 'http://localhost:14268/api/traces',
    traceSamplingRatio: parseFloat(process.env['TRACE_SAMPLING_RATIO'] || '1.0'),
    enableConsoleExporters: process.env['NODE_ENV'] === 'development'
  };
  
  return new TelemetryManager(config);
}

// =============================================================================
// EXAMPLE 5: High-Level Metrics Dashboard
// =============================================================================

/**
 * Example metrics dashboard that demonstrates common patterns
 */
export class MetricsDashboard {
  private readonly metrics = {
    requestsTotal: 'http_requests_total',
    requestDuration: 'http_request_duration_seconds',
    activeConnections: 'active_connections',
    errorRate: 'error_rate',
    memoryUsage: 'memory_usage_bytes',
    cpuUsage: 'cpu_usage_percent'
  };
  
  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(method: string, path: string, statusCode: number, duration: number): void {
    const labels = { method, path, status: statusCode.toString() };
    
    recordMetric(this.metrics.requestsTotal, 1, labels);
    recordHistogram(this.metrics.requestDuration, duration / 1000, labels);
    
    if (statusCode >= 400) {
      recordMetric(this.metrics.errorRate, 1, labels);
    }
  }
  
  /**
   * Record system resource metrics
   */
  recordSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    recordGauge(this.metrics.memoryUsage, memoryUsage.heapUsed);
    recordGauge(this.metrics.cpuUsage, (cpuUsage.user + cpuUsage.system) / 1000);
  }
  
  /**
   * Record connection metrics
   */
  recordConnectionMetrics(activeCount: number): void {
    recordGauge(this.metrics.activeConnections, activeCount);
  }
  
  /**
   * Create a span for request tracing
   */
  traceHttpRequest<T>(
    method: string, 
    path: string, 
    handler: (span: Span) => Promise<T>
  ): Promise<T> {
    return withAsyncTrace(`http_${method.toLowerCase()}_${path}`, async (span) => {
      span.setAttributes({
        'http.method': method,
        'http.path': path,
        'http.scheme': 'http'
      });
      
      const startTime = Date.now();
      
      try {
        const result = await handler(span);
        const duration = Date.now() - startTime;
        
        span.setAttributes({
          'http.status_code': 200,
          'http.response_time_ms': duration
        });
        
        this.recordHttpRequest(method, path, 200, duration);
        return result;
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const statusCode = error instanceof Error && 'statusCode' in error 
          ? (error as any).statusCode 
          : 500;
        
        span.setAttributes({
          'http.status_code': statusCode,
          'http.response_time_ms': duration
        });
        
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        this.recordHttpRequest(method, path, statusCode, duration);
        
        throw error;
      }
    });
  }
}

// =============================================================================
// EXAMPLE 6: Usage in Other Packages
// =============================================================================

/**
 * Example showing how other packages should use foundation telemetry
 */

// In packages/monitoring/src/performance-monitor.ts:
/*
import { recordMetric, recordHistogram, withAsyncTrace } from '@claude-zen/foundation/telemetry';

export class PerformanceMonitor {
  async measurePerformance<T>(name: string, operation: () => Promise<T>): Promise<T> {
    return withAsyncTrace(`performance_${name}`, async (span) => {
      const startTime = Date.now();
      
      try {
        const result = await operation();
        const duration = Date.now() - startTime;
        
        recordHistogram('operation_duration_ms', duration, { operation: name });
        recordMetric('operations_total', 1, { operation: name, status: 'success' });
        
        span.setAttributes({ operation: name, duration, status: 'success' });
        return result;
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        recordHistogram('operation_duration_ms', duration, { operation: name });
        recordMetric('operations_total', 1, { operation: name, status: 'error' });
        
        span.setAttributes({ operation: name, duration, status: 'error' });
        throw error;
      }
    });
  }
}
*/

// In packages/brain/src/neural-engine.ts:
/*
import { traced, tracedAsync, recordMetric } from '@claude-zen/foundation/telemetry';

export class NeuralEngine {
  @tracedAsync('neural_inference')
  async runInference(input: any): Promise<any> {
    recordMetric('neural_inference_requests_total', 1);
    
    // Neural processing logic...
    const result = await this.processInput(input);
    
    recordMetric('neural_inference_success_total', 1);
    return result;
  }
  
  @traced('model_training')
  trainModel(data: any[]): void {
    recordMetric('model_training_started_total', 1, { 
      dataSize: data.length.toString() 
    });
    
    // Training logic...
  }
}
*/

// Export examples for documentation and testing
// (already exported inline above)