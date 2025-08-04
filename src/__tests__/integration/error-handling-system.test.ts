/**
 * Integration Tests for Comprehensive Error Handling System
 *
 * Tests the complete error handling pipeline including recovery,
 * monitoring, resilience patterns, and system integration
 */

import { errorMonitor } from '../../utils/error-monitoring';
import { errorRecoveryOrchestrator } from '../../utils/error-recovery';
import {
  executeWithErrorHandling,
  getSystemStatus,
  handleErrorGlobally,
  initializeErrorHandling,
  shutdownErrorHandling,
} from '../../utils/error-system-integration';
import { FACTError, NetworkError, RAGError, SwarmError, TimeoutError } from '../../utils/errors';
import { systemResilienceOrchestrator } from '../../utils/system-resilience';

describe('Comprehensive Error Handling System Integration', () => {
  beforeAll(async () => {
    // Initialize error handling system with test configuration
    await initializeErrorHandling({
      maxRetries: 2,
      retryDelayMs: 100, // Fast retries for testing
      monitoringEnabled: true,
      monitoringIntervalMs: 1000, // 1 second for testing
      alertsEnabled: false, // Disable alerts for testing
      emergencyShutdownEnabled: false, // Disable emergency for testing
    });
  });

  afterAll(async () => {
    await shutdownErrorHandling();
  });

  describe('Error Classification and Context', () => {
    it('should correctly classify FACT system errors', async () => {
      const factError = new FACTError('Storage operation failed', 'high');

      const result = await handleErrorGlobally(factError, {
        component: 'FACT',
        operation: 'fact_gather',
        correlationId: 'test_123',
      });

      expect(result.finalError).toBeInstanceOf(FACTError);
      expect(result.finalError?.severity).toBe('high');
      expect(result.finalError?.category).toBe('FACT');
    });

    it('should correctly classify RAG system errors', async () => {
      const ragError = new RAGError('Vector operation failed', 'medium');

      const result = await handleErrorGlobally(ragError, {
        component: 'RAG',
        operation: 'rag_search',
        correlationId: 'test_456',
      });

      expect(result.finalError).toBeInstanceOf(RAGError);
      expect(result.finalError?.severity).toBe('medium');
      expect(result.finalError?.category).toBe('RAG');
    });

    it('should correctly classify Swarm coordination errors', async () => {
      const swarmError = new SwarmError('Agent communication failed', 'swarm_01', 'high');

      const result = await handleErrorGlobally(swarmError, {
        component: 'Swarm',
        operation: 'swarm_coordination',
        correlationId: 'test_789',
      });

      expect(result.finalError).toBeInstanceOf(SwarmError);
      expect(result.finalError?.severity).toBe('high');
      expect(result.finalError?.category).toBe('Swarm');
    });
  });

  describe('Error Recovery Mechanisms', () => {
    it('should successfully recover from transient errors', async () => {
      let attemptCount = 0;

      const result = await executeWithErrorHandling(
        async () => {
          attemptCount++;
          if (attemptCount < 2) {
            throw new NetworkError('Temporary network failure', 503);
          }
          return 'Success on retry';
        },
        {
          component: 'Network',
          operation: 'api_call',
          correlationId: 'retry_test',
        },
        {
          recovery: {
            maxRetries: 3,
            fallbackEnabled: false,
          },
        }
      );

      expect(result).toBe('Success on retry');
      expect(attemptCount).toBe(2);
    });

    it('should use fallback when recovery fails', async () => {
      // Add a fallback strategy for testing
      errorRecoveryOrchestrator.addFallbackStrategy('test_operation', {
        name: 'test_fallback',
        handler: async () => 'Fallback result',
        condition: (error) => error instanceof NetworkError,
        priority: 1,
      });

      const result = await executeWithErrorHandling(
        async () => {
          throw new NetworkError('Persistent network failure', 500);
        },
        {
          component: 'Network',
          operation: 'test_operation',
          correlationId: 'fallback_test',
        },
        {
          recovery: {
            maxRetries: 1,
            fallbackEnabled: true,
          },
        }
      );

      expect(result).toBe('Fallback result');
    });

    it('should handle timeout errors appropriately', async () => {
      const timeoutError = new TimeoutError('Operation timed out', 5000, 6000);

      const result = await handleErrorGlobally(timeoutError, {
        component: 'System',
        operation: 'long_running_task',
        correlationId: 'timeout_test',
      });

      expect(result.recovered).toBe(false);
      expect(result.finalError).toBeInstanceOf(TimeoutError);
      expect(result.finalError?.recoverable).toBe(false);
    });
  });

  describe('System Resilience Patterns', () => {
    it('should enforce bulkhead isolation', async () => {
      const bulkhead = systemResilienceOrchestrator.getBulkhead('test');

      if (!bulkhead) {
        // Create test bulkhead if it doesn't exist
        const testBulkhead = systemResilienceOrchestrator.bulkheads;
        testBulkhead.set(
          'test',
          new (await import('../../utils/system-resilience')).Bulkhead({
            name: 'Test Bulkhead',
            maxConcurrentExecutions: 2,
            queueSize: 5,
            timeoutMs: 1000,
            priority: 5,
          })
        );
      }

      const results = await Promise.allSettled([
        executeWithErrorHandling(
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return 'Task 1';
          },
          { component: 'Test', operation: 'bulkhead_test_1' },
          { resilience: { bulkhead: 'test' } }
        ),
        executeWithErrorHandling(
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return 'Task 2';
          },
          { component: 'Test', operation: 'bulkhead_test_2' },
          { resilience: { bulkhead: 'test' } }
        ),
      ]);

      expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    });

    it('should manage resources properly', async () => {
      const resourceManager = systemResilienceOrchestrator.getResourceManager();

      // Allocate a resource
      const resourceId = await resourceManager.allocateResource(
        'memory',
        'test_operation',
        1024,
        async () => {
          // Cleanup function
        }
      );

      // Check resource stats
      const stats = resourceManager.getResourceStats();
      expect(stats.totalResources).toBeGreaterThan(0);
      expect(stats.resourcesByType.memory).toBeGreaterThan(0);

      // Release resource
      await resourceManager.releaseResource(resourceId);

      const statsAfter = resourceManager.getResourceStats();
      expect(statsAfter.totalResources).toBeLessThan(stats.totalResources);
    });
  });

  describe('Error Monitoring and Reporting', () => {
    it('should track error metrics correctly', async () => {
      const initialMetrics = errorMonitor.getComponentMetrics('TestComponent');

      // Generate some test errors
      for (let i = 0; i < 3; i++) {
        await handleErrorGlobally(new Error(`Test error ${i}`), {
          component: 'TestComponent',
          operation: 'test_operation',
          correlationId: `test_error_${i}`,
        });
      }

      const finalMetrics = errorMonitor.getComponentMetrics('TestComponent');
      expect(finalMetrics.errorCount).toBeGreaterThan(initialMetrics.errorCount);
    });

    it('should maintain error trends', async () => {
      // Generate errors to create trends
      for (let i = 0; i < 5; i++) {
        await handleErrorGlobally(new FACTError('Trend test error', 'medium'), {
          component: 'TrendTest',
          operation: 'trend_operation',
          correlationId: `trend_${i}`,
        });
      }

      const trends = errorMonitor.getErrorTrends();
      const trendTestTrend = trends.find((t) => t.component === 'TrendTest');

      expect(trendTestTrend).toBeDefined();
      expect(trendTestTrend?.errorCount).toBeGreaterThanOrEqual(5);
    });

    it('should provide system health metrics', async () => {
      const healthMetrics = errorMonitor.getSystemMetrics();

      expect(healthMetrics).toHaveProperty('timestamp');
      expect(healthMetrics).toHaveProperty('overallHealth');
      expect(healthMetrics).toHaveProperty('errorRate');
      expect(healthMetrics).toHaveProperty('componentHealth');
      expect(healthMetrics).toHaveProperty('uptime');

      expect(typeof healthMetrics.errorRate).toBe('number');
      expect(typeof healthMetrics.uptime).toBe('number');
      expect(['excellent', 'good', 'degraded', 'critical']).toContain(healthMetrics.overallHealth);
    });
  });

  describe('System Integration', () => {
    it('should provide comprehensive system status', async () => {
      const systemStatus = getSystemStatus();

      expect(systemStatus.initialized).toBe(true);
      expect(systemStatus.emergencyMode).toBe(false);
      expect(systemStatus).toHaveProperty('errorHandling');
      expect(systemStatus).toHaveProperty('monitoring');
      expect(systemStatus).toHaveProperty('resilience');
      expect(systemStatus).toHaveProperty('recovery');
    });

    it('should handle mixed error types in sequence', async () => {
      const errors = [
        new FACTError('FACT failure', 'medium'),
        new RAGError('RAG failure', 'high'),
        new SwarmError('Swarm failure', 'swarm_test', 'low'),
        new NetworkError('Network failure', 500),
        new TimeoutError('Timeout failure', 1000),
      ];

      const results = [];

      for (const error of errors) {
        const result = await handleErrorGlobally(error, {
          component: error.category || 'Mixed',
          operation: 'mixed_error_test',
          correlationId: `mixed_${error.constructor.name}`,
        });
        results.push(result);
      }

      // Check that all errors were processed
      expect(results).toHaveLength(5);

      // Check that different error types were classified correctly
      const errorTypes = results.map((r) => r.finalError?.constructor.name);
      expect(errorTypes).toContain('FACTError');
      expect(errorTypes).toContain('RAGError');
      expect(errorTypes).toContain('SwarmError');
      expect(errorTypes).toContain('NetworkError');
      expect(errorTypes).toContain('TimeoutError');
    });

    it('should maintain performance under load', async () => {
      const startTime = Date.now();
      const operationCount = 100;

      // Generate multiple concurrent operations with errors
      const operations = Array.from({ length: operationCount }, (_, i) =>
        executeWithErrorHandling(
          async () => {
            if (i % 10 === 0) {
              throw new Error(`Load test error ${i}`);
            }
            return `Success ${i}`;
          },
          {
            component: 'LoadTest',
            operation: 'concurrent_operation',
            correlationId: `load_${i}`,
          }
        ).catch(() => `Handled error ${i}`)
      );

      const results = await Promise.all(operations);
      const endTime = Date.now();

      expect(results).toHaveLength(operationCount);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Check that some operations succeeded and some were handled
      const successCount = results.filter((r) => r.startsWith('Success')).length;
      const handledCount = results.filter((r) => r.startsWith('Handled')).length;

      expect(successCount).toBeGreaterThan(0);
      expect(handledCount).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery Edge Cases', () => {
    it('should handle non-recoverable errors correctly', async () => {
      const nonRecoverableError = new Error('Critical system failure');
      Object.defineProperty(nonRecoverableError, 'recoverable', { value: false });

      const result = await handleErrorGlobally(nonRecoverableError, {
        component: 'System',
        operation: 'critical_operation',
        correlationId: 'non_recoverable_test',
      });

      expect(result.recovered).toBe(false);
      expect(result.finalError).toBeDefined();
    });

    it('should handle circular recovery attempts', async () => {
      let recoveryAttempts = 0;

      const _result = await executeWithErrorHandling(
        async () => {
          recoveryAttempts++;
          throw new Error('Persistent failure');
        },
        {
          component: 'Test',
          operation: 'circular_recovery_test',
          correlationId: 'circular_test',
        },
        {
          recovery: {
            maxRetries: 3,
            fallbackEnabled: false,
          },
        }
      );

      // Should not attempt infinite recovery
      expect(recoveryAttempts).toBeLessThanOrEqual(4); // Initial + 3 retries
    });

    it('should handle resource exhaustion gracefully', async () => {
      const resourceManager = systemResilienceOrchestrator.getResourceManager();

      // Try to allocate many resources to test limits
      const resourcePromises = Array.from({ length: 1000 }, (_, _i) =>
        resourceManager
          .allocateResource(
            'memory',
            'exhaustion_test',
            1024 * 1024 // 1MB each
          )
          .catch((error) => error)
      );

      const results = await Promise.allSettled(resourcePromises);

      // Should have some successful allocations and some failures due to limits
      const successes = results.filter(
        (r) => r.status === 'fulfilled' && typeof r.value === 'string'
      );
      const failures = results.filter((r) => r.status === 'fulfilled' && r.value instanceof Error);

      expect(successes.length).toBeGreaterThan(0);
      expect(failures.length).toBeGreaterThan(0);

      // Clean up allocated resources
      for (const result of successes) {
        if (result.status === 'fulfilled' && typeof result.value === 'string') {
          await resourceManager.releaseResource(result.value).catch(() => {});
        }
      }
    });
  });
});

describe('MCP Error Handling Integration', () => {
  it('should wrap MCP tools with error handling automatically', async () => {
    const { MCPToolWrapper } = await import('../../coordination/mcp/core/error-handler');

    const mockTool = {
      name: 'test_tool',
      description: 'Test tool for error handling',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' },
        },
        required: ['input'],
      },
      handler: async (params: any) => {
        if (params.input === 'error') {
          throw new Error('Simulated tool error');
        }
        return {
          success: true,
          content: [{ type: 'text', text: `Processed: ${params.input}` }],
        };
      },
    };

    const wrappedTool = MCPToolWrapper.wrapTool(mockTool);

    // Test successful execution
    const successResult = await wrappedTool.handler({ input: 'test' });
    expect(successResult.success).toBe(true);

    // Test error handling
    const errorResult = await wrappedTool.handler({ input: 'error' });
    expect(errorResult.success).toBe(false);
    expect(errorResult.content[0].text).toContain('execution failed');
  });

  it('should validate MCP tool parameters', async () => {
    const { MCPParameterValidator } = await import('../../coordination/mcp/core/error-handler');

    const schema = {
      type: 'object',
      properties: {
        required_param: { type: 'string' },
        optional_param: { type: 'number', minimum: 0, maximum: 100 },
      },
      required: ['required_param'],
    };

    // Test valid parameters
    const validResult = MCPParameterValidator.validateParameters(
      'test_tool',
      { required_param: 'test', optional_param: 50 },
      schema
    );
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    // Test missing required parameter
    const missingResult = MCPParameterValidator.validateParameters(
      'test_tool',
      { optional_param: 50 },
      schema
    );
    expect(missingResult.valid).toBe(false);
    expect(missingResult.errors).toContain('Missing required parameter: required_param');

    // Test invalid parameter type
    const typeResult = MCPParameterValidator.validateParameters(
      'test_tool',
      { required_param: 123 }, // Should be string
      schema
    );
    expect(typeResult.valid).toBe(false);
    expect(typeResult.errors.some((e) => e.includes('expected type string'))).toBe(true);

    // Test parameter constraints
    const constraintResult = MCPParameterValidator.validateParameters(
      'test_tool',
      { required_param: 'test', optional_param: 150 }, // Exceeds maximum
      schema
    );
    expect(constraintResult.valid).toBe(false);
    expect(constraintResult.errors.some((e) => e.includes('must be at most 100'))).toBe(true);
  });
});

describe('Performance and Scalability', () => {
  it('should maintain low latency under normal operations', async () => {
    const iterations = 1000;
    const startTime = Date.now();

    // Test rapid error handling operations
    for (let i = 0; i < iterations; i++) {
      await handleErrorGlobally(new Error(`Performance test ${i}`), {
        component: 'Performance',
        operation: 'latency_test',
        correlationId: `perf_${i}`,
      });
    }

    const endTime = Date.now();
    const averageLatency = (endTime - startTime) / iterations;

    // Should handle errors quickly (< 5ms average)
    expect(averageLatency).toBeLessThan(5);
  });

  it('should handle memory efficiently', async () => {
    const initialMemory = process.memoryUsage();

    // Generate many errors to test memory management
    for (let i = 0; i < 10000; i++) {
      await handleErrorGlobally(new Error(`Memory test ${i}`), {
        component: 'Memory',
        operation: 'memory_test',
        correlationId: `mem_${i}`,
      });
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

    // Memory increase should be reasonable (< 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
