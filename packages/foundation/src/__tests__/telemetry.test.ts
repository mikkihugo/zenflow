/**
 * @fileoverview Foundation Telemetry Tests (Jest Version)
 * 
 * Comprehensive tests for OpenTelemetry and Prometheus integration
 * in the foundation telemetry system.
 * 
 * CONVERTED FROM VITEST: Uses Jest mocking and assertions
 */

import { jest } from '@jest/globals';

// Mock OpenTelemetry to avoid actual initialization in tests
jest.unstable_mockModule('@opentelemetry/api', () => ({
  trace: {
    getTracer: jest.fn(() => ({
      startSpan: jest.fn(() => ({
        setAttributes: jest.fn(),
        setStatus: jest.fn(),
        recordException: jest.fn(),
        addEvent: jest.fn(),
        end: jest.fn()
      }))
    })),
    getActiveSpan: jest.fn(() => ({
      setAttributes: jest.fn(),
      addEvent: jest.fn(),
      end: jest.fn()
    })),
    setSpan: jest.fn()
  },
  metrics: {
    getMeter: jest.fn(() => ({
      createCounter: jest.fn(() => ({
        add: jest.fn()
      })),
      createHistogram: jest.fn(() => ({
        record: jest.fn()
      })),
      createUpDownCounter: jest.fn(() => ({
        add: jest.fn()
      }))
    }))
  },
  context: {
    with: jest.fn((context, fn) => fn()),
    active: jest.fn()
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

jest.unstable_mockModule('@opentelemetry/sdk-node', () => ({
  NodeSDK: jest.fn(() => ({
    start: jest.fn(),
    shutdown: jest.fn()
  }))
}));

jest.unstable_mockModule('prom-client', () => ({
  Counter: jest.fn().mockImplementation(() => ({
    inc: jest.fn(),
    labels: jest.fn().mockReturnThis()
  })),
  Histogram: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    labels: jest.fn().mockReturnThis()
  })),
  Gauge: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    inc: jest.fn(),
    dec: jest.fn(),
    labels: jest.fn().mockReturnThis()
  })),
  register: {
    clear: jest.fn(),
    metrics: jest.fn().mockResolvedValue('# HELP test'),
    registerMetric: jest.fn()
  },
  collectDefaultMetrics: jest.fn()
}));

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

describe('Foundation Telemetry (Jest)', () => {
  let telemetryManager: TelemetryManager;

  beforeEach(async () => {
    // Clear any previous telemetry instance
    await shutdownTelemetry();
    
    const config: TelemetryConfig = {
      serviceName: 'test-service',
      version: '1.0.0',
      environment: 'test',
      enableTracing: true,
      enableMetrics: true,
      enablePrometheus: true
    };

    telemetryManager = new TelemetryManager(config);
    await telemetryManager.initialize();
  });

  afterEach(async () => {
    await telemetryManager?.shutdown();
  });

  describe('TelemetryManager', () => {
    it('should initialize with default configuration', () => {
      expect(telemetryManager).toBeDefined();
      expect(telemetryManager.getConfig().serviceName).toBe('test-service');
      expect(telemetryManager.getConfig().version).toBe('1.0.0');
      expect(telemetryManager.getConfig().environment).toBe('test');
    });

    it('should initialize tracing when enabled', async () => {
      const config: TelemetryConfig = {
        serviceName: 'trace-test',
        enableTracing: true,
        enableMetrics: false
      };

      const manager = new TelemetryManager(config);
      await manager.initialize();

      expect(manager.getTracer).toBeDefined();
      
      await manager.shutdown();
    });

    it('should initialize metrics when enabled', async () => {
      const config: TelemetryConfig = {
        serviceName: 'metrics-test',
        enableTracing: false,
        enableMetrics: true
      };

      const manager = new TelemetryManager(config);
      await manager.initialize();

      expect(manager.getMeter).toBeDefined();
      
      await manager.shutdown();
    });

    it('should handle shutdown gracefully', async () => {
      await expect(telemetryManager.shutdown()).resolves.not.toThrow();
    });
  });

  describe('Global Telemetry Functions', () => {
    beforeEach(async () => {
      await initializeTelemetry({
        serviceName: 'global-test',
        enableTracing: true,
        enableMetrics: true
      });
    });

    it('should get global telemetry instance', () => {
      const telemetry = getTelemetry();
      expect(telemetry).toBeDefined();
    });

    it('should record counter metric', () => {
      expect(() => {
        recordMetric('test_counter', 1, { tag: 'value' });
      }).not.toThrow();
    });

    it('should record histogram metric', () => {
      expect(() => {
        recordHistogram('test_histogram', 0.5, { tag: 'value' });
      }).not.toThrow();
    });

    it('should record gauge metric', () => {
      expect(() => {
        recordGauge('test_gauge', 10, { tag: 'value' });
      }).not.toThrow();
    });
  });

  describe('Tracing Utilities', () => {
    beforeEach(async () => {
      await initializeTelemetry({
        serviceName: 'tracing-test',
        enableTracing: true
      });
    });

    it('should start a trace span', () => {
      const span = startTrace('test_operation', { key: 'value' });
      expect(span).toBeDefined();
      expect(typeof span?.end).toBe('function');
    });

    it('should execute function with trace', async () => {
      const fn = jest.fn().mockReturnValue('result');
      const result = withTrace('test_operation', fn);

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalled();
    });

    it('should execute async function with trace', async () => {
      const fn = jest.fn().mockResolvedValue('async-result');
      const result = await withAsyncTrace('async_operation', fn);

      expect(result).toBe('async-result');
      expect(fn).toHaveBeenCalled();
    });

    it('should handle tracing errors gracefully', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('test error'));
      
      await expect(withAsyncTrace('error_operation', fn)).rejects.toThrow('test error');
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('Decorators', () => {
    beforeEach(async () => {
      await initializeTelemetry({
        serviceName: 'decorator-test',
        enableTracing: true,
        enableMetrics: true
      });
    });

    it('should trace synchronous method', () => {
      class TestClass {
        @traced('sync_method')
        syncMethod(value: string): string {
          return `processed: ${value}`;
        }
      }

      const instance = new TestClass();
      const result = instance.syncMethod('test');

      expect(result).toBe('processed: test');
    });

    it('should trace asynchronous method', async () => {
      class TestClass {
        @tracedAsync('async_method')
        async asyncMethod(value: string): Promise<string> {
          return Promise.resolve(`processed: ${value}`);
        }
      }

      const instance = new TestClass();
      const result = await instance.asyncMethod('test');

      expect(result).toBe('processed: test');
    });

    it('should meter method calls', () => {
      class TestClass {
        @metered('metered_method')
        meteredMethod(value: number): number {
          return value * 2;
        }
      }

      const instance = new TestClass();
      const result = instance.meteredMethod(5);

      expect(result).toBe(10);
    });

    it('should handle decorated method errors', async () => {
      class TestClass {
        @tracedAsync('error_method')
        async errorMethod(): Promise<void> {
          throw new Error('decorator error');
        }
      }

      const instance = new TestClass();
      
      await expect(instance.errorMethod()).rejects.toThrow('decorator error');
    });
  });

  describe('Performance Tracking', () => {
    beforeEach(async () => {
      await initializeTelemetry({
        serviceName: 'performance-test',
        enableTracing: true,
        enableMetrics: true
      });
    });

    it('should track operation duration with histogram', () => {
      const startTime = Date.now();
      
      // Simulate some work
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(() => {
        recordHistogram('operation_duration', duration / 1000);
      }).not.toThrow();
    });

    it('should track memory usage with gauge', () => {
      const memoryUsage = process.memoryUsage();
      
      expect(() => {
        recordGauge('memory_heap_used', memoryUsage.heapUsed);
        recordGauge('memory_heap_total', memoryUsage.heapTotal);
      }).not.toThrow();
    });

    it('should track request rates with counter', () => {
      expect(() => {
        recordMetric('http_requests_total', 1, { 
          method: 'GET', 
          status: '200' 
        });
      }).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should validate required configuration', () => {
      expect(() => {
        new TelemetryManager({} as TelemetryConfig);
      }).not.toThrow(); // Should use defaults
    });

    it('should merge with default configuration', () => {
      const config: Partial<TelemetryConfig> = {
        serviceName: 'custom-service',
        enableTracing: false
      };

      const manager = new TelemetryManager(config);
      const fullConfig = manager.getConfig();

      expect(fullConfig.serviceName).toBe('custom-service');
      expect(fullConfig.enableTracing).toBe(false);
      expect(fullConfig.enableMetrics).toBeDefined(); // Should have default
    });

    it('should handle environment variables', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        ZEN_TELEMETRY_SERVICE_NAME: 'env-service',
        ZEN_TELEMETRY_SERVICE_VERSION: 'v1.0.0'
      };

      const manager = new TelemetryManager({});
      const config = manager.getConfig();

      // Should use environment values if available
      expect(config.serviceName).toBe('env-service');
      expect(config.serviceVersion).toBe('v1.0.0');

      process.env = originalEnv;
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization failures gracefully', async () => {
      // Mock a failure scenario
      const invalidConfig: TelemetryConfig = {
        serviceName: '',
        enableTracing: true
      };

      const manager = new TelemetryManager(invalidConfig);
      
      // Should not throw but handle gracefully
      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it('should handle missing telemetry gracefully', () => {
      // Shutdown telemetry first
      shutdownTelemetry();

      // These should not throw even without telemetry
      expect(() => {
        recordMetric('test_metric', 1);
        recordHistogram('test_histogram', 0.5);
        recordGauge('test_gauge', 10);
      }).not.toThrow();
    });

    it('should handle tracing errors gracefully', () => {
      shutdownTelemetry();

      expect(() => {
        const span = startTrace('test_span');
        span?.end();
      }).not.toThrow();

      expect(() => {
        withTrace('test_trace', () => 'result');
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work with multiple telemetry instances', async () => {
      const manager1 = new TelemetryManager({
        serviceName: 'service-1',
        enableTracing: true
      });
      
      const manager2 = new TelemetryManager({
        serviceName: 'service-2',
        enableMetrics: true
      });

      await manager1.initialize();
      await manager2.initialize();

      expect(manager1.getConfig().serviceName).toBe('service-1');
      expect(manager2.getConfig().serviceName).toBe('service-2');

      await manager1.shutdown();
      await manager2.shutdown();
    });

    it('should handle concurrent operations', async () => {
      await initializeTelemetry({
        serviceName: 'concurrent-test',
        enableTracing: true,
        enableMetrics: true
      });

      const operations = Array.from({ length: 10 }, (_, i) =>
        withAsyncTrace(`concurrent_op_${i}`, async () => {
          recordMetric('concurrent_counter', 1);
          await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
          return `result-${i}`;
        })
      );

      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result).toBe(`result-${i}`);
      });
    });
  });
});