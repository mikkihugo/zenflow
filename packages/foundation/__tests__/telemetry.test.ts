/**
 * @fileoverview Tests for the Telemetry System
 * 
 * Comprehensive tests for OpenTelemetry and Prometheus integration
 * in the foundation telemetry system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  TelemetryManager,
  getTelemetry,
  initializeTelemetry,
  shutdownTelemetry,
  recordMetric,
  recordHistogram,
  recordGauge,
  startTrace,
  withTrace,
  withAsyncTrace,
  traced,
  tracedAsync,
  metered,
  type TelemetryConfig
} from '../telemetry';

// Mock OpenTelemetry to avoid actual initialization in tests
vi.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: vi.fn(() => ({
      startSpan: vi.fn(() => ({
        setAttributes: vi.fn(),
        setStatus: vi.fn(),
        recordException: vi.fn(),
        addEvent: vi.fn(),
        end: vi.fn()
      }))
    })),
    getActiveSpan: vi.fn(() => ({
      setAttributes: vi.fn(),
      addEvent: vi.fn(),
      end: vi.fn()
    })),
    setSpan: vi.fn()
  },
  metrics: {
    getMeter: vi.fn(() => ({
      createCounter: vi.fn(() => ({
        add: vi.fn()
      })),
      createHistogram: vi.fn(() => ({
        record: vi.fn()
      })),
      createUpDownCounter: vi.fn(() => ({
        add: vi.fn()
      }))
    }))
  },
  context: {
    with: vi.fn((context, fn) => fn()),
    active: vi.fn()
  },
  SpanKind: {
    INTERNAL: 'internal',
    CLIENT: 'client',
    SERVER: 'server'
  },
  SpanStatusCode: {
    OK: 'ok',
    ERROR: 'error'
  }
}));

vi.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: vi.fn(() => ({
    start: vi.fn(),
    shutdown: vi.fn()
  }))
}));

vi.mock('prom-client', () => ({
  register: {
    clear: vi.fn(),
    registerMetric: vi.fn()
  },
  Counter: vi.fn(() => ({
    inc: vi.fn(),
    labels: vi.fn(() => ({ inc: vi.fn() }))
  })),
  Histogram: vi.fn(() => ({
    observe: vi.fn(),
    labels: vi.fn(() => ({ observe: vi.fn() }))
  })),
  Gauge: vi.fn(() => ({
    set: vi.fn(),
    labels: vi.fn(() => ({ set: vi.fn() }))
  }))
}));

describe('TelemetryManager', () => {
  let telemetryManager: TelemetryManager;

  beforeEach(() => {
    // Reset any global state
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (telemetryManager) {
      await telemetryManager.shutdown();
    }
    await shutdownTelemetry();
  });

  describe('Initialization', () => {
    it('should create telemetry manager with default config', () => {
      telemetryManager = new TelemetryManager();
      expect(telemetryManager).toBeInstanceOf(TelemetryManager);
      expect(telemetryManager.getConfig()).toMatchObject({
        serviceName: 'claude-code-zen',
        enableTracing: true,
        enableMetrics: true,
        enableAutoInstrumentation: true
      });
    });

    it('should create telemetry manager with custom config', () => {
      const customConfig: Partial<TelemetryConfig> = {
        serviceName: 'test-service',
        enableTracing: false,
        enableMetrics: true,
        prometheusPort: 9999
      };

      telemetryManager = new TelemetryManager(customConfig);
      expect(telemetryManager.getConfig()).toMatchObject(customConfig);
    });

    it('should load config from environment variables', () => {
      // Set environment variables
      process.env['ZEN_TELEMETRY_SERVICE_NAME'] = 'env-service';
      process.env['ZEN_TELEMETRY_ENABLE_TRACING'] = 'false';
      process.env['ZEN_TELEMETRY_PROMETHEUS_PORT'] = '8888';

      telemetryManager = new TelemetryManager();
      const config = telemetryManager.getConfig();
      
      expect(config.serviceName).toBe('env-service');
      expect(config.enableTracing).toBe(false);
      expect(config.prometheusPort).toBe(8888);

      // Cleanup
      delete process.env['ZEN_TELEMETRY_SERVICE_NAME'];
      delete process.env['ZEN_TELEMETRY_ENABLE_TRACING'];
      delete process.env['ZEN_TELEMETRY_PROMETHEUS_PORT'];
    });

    it('should initialize successfully', async () => {
      telemetryManager = new TelemetryManager();
      const result = await telemetryManager.initialize();
      
      expect(result.isOk()).toBe(true);
      expect(telemetryManager.isInitialized()).toBe(true);
    });

    it('should handle initialization already done', async () => {
      telemetryManager = new TelemetryManager();
      await telemetryManager.initialize();
      
      // Second initialization should also succeed
      const result = await telemetryManager.initialize();
      expect(result.isOk()).toBe(true);
    });
  });

  describe('Metrics', () => {
    beforeEach(async () => {
      telemetryManager = new TelemetryManager();
      await telemetryManager.initialize();
    });

    it('should record counter metrics', () => {
      expect(() => {
        telemetryManager.recordCounter('test_counter', 1, { label: 'value' });
      }).not.toThrow();
    });

    it('should record histogram metrics', () => {
      expect(() => {
        telemetryManager.recordHistogram('test_histogram', 100, { label: 'value' });
      }).not.toThrow();
    });

    it('should record gauge metrics', () => {
      expect(() => {
        telemetryManager.recordGauge('test_gauge', 50, { label: 'value' });
      }).not.toThrow();
    });

    it('should handle metrics when not initialized', () => {
      const uninitializedManager = new TelemetryManager();
      
      expect(() => {
        uninitializedManager.recordCounter('test_counter', 1);
      }).not.toThrow();
    });

    it('should handle metrics when disabled', async () => {
      const configWithoutMetrics = { enableMetrics: false };
      const managerWithoutMetrics = new TelemetryManager(configWithoutMetrics);
      await managerWithoutMetrics.initialize();
      
      expect(() => {
        managerWithoutMetrics.recordCounter('test_counter', 1);
      }).not.toThrow();
      
      await managerWithoutMetrics.shutdown();
    });
  });

  describe('Tracing', () => {
    beforeEach(async () => {
      telemetryManager = new TelemetryManager();
      await telemetryManager.initialize();
    });

    it('should start spans', () => {
      const span = telemetryManager.startSpan('test_operation');
      expect(span).toBeDefined();
      expect(span.end).toBeDefined();
    });

    it('should execute function with span context', () => {
      const result = telemetryManager.withSpan('test_operation', (span) => {
        expect(span).toBeDefined();
        return 'success';
      });
      
      expect(result).toBe('success');
    });

    it('should execute async function with span context', async () => {
      const result = await telemetryManager.withAsyncSpan('test_operation', async (span) => {
        expect(span).toBeDefined();
        await new Promise(resolve => setTimeout(resolve, 1));
        return 'async_success';
      });
      
      expect(result).toBe('async_success');
    });

    it('should handle errors in traced functions', () => {
      expect(() => {
        telemetryManager.withSpan('test_operation', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });

    it('should handle errors in async traced functions', async () => {
      await expect(
        telemetryManager.withAsyncSpan('test_operation', async () => {
          throw new Error('Async test error');
        })
      ).rejects.toThrow('Async test error');
    });

    it('should add events to current span', () => {
      expect(() => {
        telemetryManager.addEvent('test_event', { key: 'value' });
      }).not.toThrow();
    });

    it('should set span attributes', () => {
      expect(() => {
        telemetryManager.setSpanAttributes({ key: 'value' });
      }).not.toThrow();
    });
  });

  describe('Global Functions', () => {
    beforeEach(async () => {
      await initializeTelemetry();
    });

    it('should work with global telemetry functions', () => {
      expect(() => {
        recordMetric('global_counter', 1);
        recordHistogram('global_histogram', 100);
        recordGauge('global_gauge', 50);
      }).not.toThrow();
    });

    it('should work with global tracing functions', () => {
      const span = startTrace('global_operation');
      expect(span).toBeDefined();
      span.end();
    });

    it('should work with global trace wrappers', () => {
      const result = withTrace('global_operation', () => 'wrapped');
      expect(result).toBe('wrapped');
    });

    it('should work with global async trace wrappers', async () => {
      const result = await withAsyncTrace('global_operation', async () => 'async_wrapped');
      expect(result).toBe('async_wrapped');
    });
  });

  describe('Decorators', () => {
    class TestClass {
      @traced('custom_trace_name')
      tracedMethod(value: string): string {
        return `traced_${value}`;
      }

      @tracedAsync('custom_async_trace_name')
      async tracedAsyncMethod(value: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 1));
        return `async_traced_${value}`;
      }

      @metered('custom_metric_name')
      meteredMethod(value: number): number {
        return value * 2;
      }
    }

    beforeEach(async () => {
      await initializeTelemetry();
    });

    it('should trace method calls with decorator', () => {
      const instance = new TestClass();
      const result = instance.tracedMethod('test');
      expect(result).toBe('traced_test');
    });

    it('should trace async method calls with decorator', async () => {
      const instance = new TestClass();
      const result = await instance.tracedAsyncMethod('test');
      expect(result).toBe('async_traced_test');
    });

    it('should meter method calls with decorator', () => {
      const instance = new TestClass();
      const result = instance.meteredMethod(5);
      expect(result).toBe(10);
    });
  });

  describe('Shutdown', () => {
    it('should shutdown successfully', async () => {
      telemetryManager = new TelemetryManager();
      await telemetryManager.initialize();
      
      const result = await telemetryManager.shutdown();
      expect(result.isOk()).toBe(true);
      expect(telemetryManager.isInitialized()).toBe(false);
    });

    it('should handle shutdown when not initialized', async () => {
      telemetryManager = new TelemetryManager();
      
      const result = await telemetryManager.shutdown();
      expect(result.isOk()).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      telemetryManager = new TelemetryManager();
      await telemetryManager.initialize();
    });

    it('should return configuration', () => {
      const config = telemetryManager.getConfig();
      expect(config).toBeDefined();
      expect(config.serviceName).toBe('claude-code-zen');
    });

    it('should return initialization status', () => {
      expect(telemetryManager.isInitialized()).toBe(true);
    });

    it('should return prometheus registry', () => {
      const registry = telemetryManager.getPrometheusRegistry();
      expect(registry).toBeDefined();
    });

    it('should return tracer instance', () => {
      const tracer = telemetryManager.getTracer();
      expect(tracer).toBeDefined();
    });

    it('should return meter instance', () => {
      const meter = telemetryManager.getMeter();
      expect(meter).toBeDefined();
    });
  });
});