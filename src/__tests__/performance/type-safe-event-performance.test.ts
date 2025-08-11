/**
 * @file Type-Safe Event System Performance Tests
 *
 * Comprehensive performance benchmarks for the type-safe event system
 * validating high-throughput event processing capabilities.
 *
 * Tests include:
 * - High-frequency event emission
 * - Concurrent handler processing
 * - Memory usage optimization
 * - Domain boundary validation performance
 * - Cross-domain routing efficiency
 * - AGUI integration performance
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Domain } from '../../core/domain-boundary-validator.ts';
import {
  type BaseEvent,
  createCorrelationId,
  createEvent,
  createTypeSafeEventBus,
  EventPriority,
  type EventSystemConfig,
  type EventSystemMetrics,
  type TypeSafeEventBus,
} from '../../core/type-safe-event-system.ts';

// Mock the logging system for performance tests
vi.mock('../../config/logging-config', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('TypeSafeEventBus Performance Tests', () => {
  let eventBus: TypeSafeEventBus;

  beforeEach(async () => {
    const config: EventSystemConfig = {
      enableMetrics: true,
      enableCaching: true,
      domainValidation: true,
      maxEventHistory: 50000,
      defaultTimeout: 5000,
      maxConcurrency: 1000,
      batchSize: 100,
      retryAttempts: 3,
    };

    eventBus = createTypeSafeEventBus(config);
    await eventBus.initialize();
  });

  afterEach(async () => {
    await eventBus.shutdown();
  });

  describe('High-Frequency Event Emission', () => {
    test('should handle 10,000 events efficiently', async () => {
      const startTime = Date.now();
      const eventCount = 10000;
      const mockHandler = vi.fn();

      eventBus.registerHandler('performance.test', mockHandler);

      // Create events
      const events = Array.from({ length: eventCount }, (_, i) =>
        createEvent<BaseEvent>(
          'performance.test',
          Domain.CORE,
          {},
          { tags: [`batch-${Math.floor(i / 100)}`, `event-${i}`] }
        )
      );

      // Emit events in batch
      const results = await eventBus.emitEventBatch(events, {
        maxConcurrency: 100,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const eventsPerSecond = eventCount / (duration / 1000);

      // Performance assertions
      expect(results).toHaveLength(eventCount);
      expect(results.every((r) => r.success)).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(eventCount);
      expect(eventsPerSecond).toBeGreaterThan(1000); // At least 1000 events/sec
      expect(duration).toBeLessThan(30000); // Less than 30 seconds

      console.log(`Performance Test Results:
        Events: ${eventCount}
        Duration: ${duration}ms
        Events/sec: ${eventsPerSecond.toFixed(2)}
        Avg processing time: ${(duration / eventCount).toFixed(2)}ms per event`);

      // Verify metrics
      const metrics = eventBus.getMetrics();
      expect(metrics.totalEvents).toBeGreaterThanOrEqual(eventCount);
      expect(metrics.averageProcessingTime).toBeLessThan(100); // Less than 100ms avg
    }, 60000); // 60 second timeout

    test('should maintain performance with multiple handlers', async () => {
      const eventCount = 5000;
      const handlerCount = 10;
      const mockHandlers = Array.from({ length: handlerCount }, () => vi.fn());

      // Register multiple handlers for the same event
      mockHandlers.forEach((handler, index) => {
        eventBus.registerHandler('multi-handler.test', handler, {
          priority: index % 3, // Vary priorities
        });
      });

      const startTime = Date.now();

      // Create and emit events
      const events = Array.from({ length: eventCount }, (_, i) =>
        createEvent<BaseEvent>('multi-handler.test', Domain.CORE, {}, { tags: [`test-${i}`] })
      );

      const results = await eventBus.emitEventBatch(events);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Performance assertions
      expect(results.every((r) => r.success)).toBe(true);
      expect(results.every((r) => r.handlerResults.length === handlerCount)).toBe(true);

      // Each handler should have been called for each event
      mockHandlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledTimes(eventCount);
      });

      const totalHandlerExecutions = eventCount * handlerCount;
      const executionsPerSecond = totalHandlerExecutions / (duration / 1000);

      expect(executionsPerSecond).toBeGreaterThan(5000); // At least 5000 handler executions/sec

      console.log(`Multi-Handler Performance:
        Events: ${eventCount}
        Handlers per event: ${handlerCount}
        Total executions: ${totalHandlerExecutions}
        Duration: ${duration}ms
        Executions/sec: ${executionsPerSecond.toFixed(2)}`);
    }, 60000);

    test('should handle concurrent event emission from multiple sources', async () => {
      const concurrentSources = 20;
      const eventsPerSource = 500;
      const mockHandler = vi.fn();

      eventBus.registerHandler('concurrent.test', mockHandler);

      const startTime = Date.now();

      // Create concurrent event sources
      const sourcePromises = Array.from({ length: concurrentSources }, async (_, sourceIndex) => {
        const events = Array.from({ length: eventsPerSource }, (_, eventIndex) =>
          createEvent<BaseEvent>(
            'concurrent.test',
            Domain.CORE,
            {},
            {
              source: `source-${sourceIndex}`,
              tags: [`source-${sourceIndex}`, `event-${eventIndex}`],
            }
          )
        );

        return eventBus.emitEventBatch(events, { maxConcurrency: 50 });
      });

      const allResults = await Promise.all(sourcePromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Flatten results
      const flatResults = allResults.flat();
      const totalEvents = concurrentSources * eventsPerSource;

      expect(flatResults).toHaveLength(totalEvents);
      expect(flatResults.every((r) => r.success)).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(totalEvents);

      const eventsPerSecond = totalEvents / (duration / 1000);
      expect(eventsPerSecond).toBeGreaterThan(500); // At least 500 events/sec with concurrency

      console.log(`Concurrent Sources Performance:
        Sources: ${concurrentSources}
        Events per source: ${eventsPerSource}
        Total events: ${totalEvents}
        Duration: ${duration}ms
        Events/sec: ${eventsPerSecond.toFixed(2)}`);
    }, 60000);
  });

  describe('Memory Usage and Optimization', () => {
    test('should maintain reasonable memory usage under load', async () => {
      const eventCount = 20000;
      const mockHandler = vi.fn();

      eventBus.registerHandler('memory.test', mockHandler);

      // Measure initial memory
      const initialMetrics = eventBus.getMetrics();
      const initialMemory = initialMetrics.memoryUsage;

      // Process events in chunks to simulate real-world usage
      const chunkSize = 1000;
      for (let i = 0; i < eventCount; i += chunkSize) {
        const chunk = Array.from({ length: Math.min(chunkSize, eventCount - i) }, (_, j) =>
          createEvent<BaseEvent>(
            'memory.test',
            Domain.CORE,
            { data: `test-data-${i + j}` }, // Add some data to test memory usage
            { tags: [`chunk-${Math.floor(i / chunkSize)}`, `event-${i + j}`] }
          )
        );

        await eventBus.emitEventBatch(chunk);

        // Force garbage collection if available (Node.js with --expose-gc)
        if (global.gc) {
          global.gc();
        }
      }

      // Measure final memory
      const finalMetrics = eventBus.getMetrics();
      const finalMemory = finalMetrics.memoryUsage;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be reasonable (less than 100MB for 20k events)
      expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024); // 100MB

      // Event history should be limited
      const eventHistory = eventBus.queryEvents({});
      expect(eventHistory.length).toBeLessThanOrEqual(50000); // Based on maxEventHistory config

      console.log(`Memory Usage Analysis:
        Events processed: ${eventCount}
        Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB
        Final memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB
        Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB
        Memory per event: ${(memoryGrowth / eventCount).toFixed(2)} bytes
        Event history size: ${eventHistory.length}`);
    }, 60000);

    test('should efficiently manage cache performance', async () => {
      const eventCount = 10000;
      const uniqueEventTypes = 50;
      const mockHandlers = new Map<string, vi.Mock>();

      // Register handlers for different event types
      for (let i = 0; i < uniqueEventTypes; i++) {
        const eventType = `cache.test.${i}`;
        const handler = vi.fn();
        mockHandlers.set(eventType, handler);
        eventBus.registerHandler(eventType, handler);
      }

      const startTime = Date.now();

      // Create events with repeated patterns to test caching
      const events: BaseEvent[] = [];
      for (let i = 0; i < eventCount; i++) {
        const eventType = `cache.test.${i % uniqueEventTypes}`;
        events.push(
          createEvent<BaseEvent>(
            eventType,
            Domain.CORE,
            { value: i % 100 }, // Repeated data patterns
            { correlationId: createCorrelationId() }
          )
        );
      }

      const results = await eventBus.emitEventBatch(events);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.every((r) => r.success)).toBe(true);

      // Verify all handlers were called appropriately
      const expectedCallsPerHandler = eventCount / uniqueEventTypes;
      mockHandlers.forEach((handler, eventType) => {
        expect(handler).toHaveBeenCalledTimes(expectedCallsPerHandler);
      });

      // Cache performance should improve with repeated patterns
      const metrics = eventBus.getMetrics();
      expect(metrics.cacheHitRate).toBeGreaterThan(0.5); // At least 50% cache hit rate

      console.log(`Cache Performance Analysis:
        Events: ${eventCount}
        Unique event types: ${uniqueEventTypes}
        Duration: ${duration}ms
        Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%
        Events/sec: ${(eventCount / (duration / 1000)).toFixed(2)}`);
    }, 60000);
  });

  describe('Domain Boundary Validation Performance', () => {
    test('should maintain performance with domain validation enabled', async () => {
      const eventCount = 5000;
      const domains = [Domain.CORE, Domain.COORDINATION, Domain.WORKFLOWS, Domain.NEURAL];
      const mockHandler = vi.fn();

      // Register handler for all domains
      domains.forEach((domain) => {
        eventBus.registerDomainHandler(domain, mockHandler);
      });

      const startTime = Date.now();

      // Create events across different domains
      const events = Array.from({ length: eventCount }, (_, i) =>
        createEvent<BaseEvent>(
          'validation.test',
          domains[i % domains.length],
          { index: i },
          { correlationId: createCorrelationId() }
        )
      );

      const results = await eventBus.emitEventBatch(events);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.every((r) => r.success)).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(eventCount);

      const eventsPerSecond = eventCount / (duration / 1000);
      expect(eventsPerSecond).toBeGreaterThan(200); // Should maintain good performance with validation

      console.log(`Domain Validation Performance:
        Events: ${eventCount}
        Domains tested: ${domains.length}
        Duration: ${duration}ms
        Events/sec: ${eventsPerSecond.toFixed(2)}
        Avg validation time: ${(duration / eventCount).toFixed(2)}ms per event`);
    }, 60000);

    test('should efficiently handle cross-domain routing', async () => {
      const routingCount = 1000;
      const mockHandler = vi.fn();

      eventBus.registerHandler('cross.domain.test', mockHandler);

      const startTime = Date.now();

      // Create cross-domain routing operations
      const routingPromises = Array.from({ length: routingCount }, (_, i) => {
        const event = createEvent<BaseEvent>(
          'cross.domain.test',
          Domain.WORKFLOWS,
          { routingIndex: i },
          { correlationId: createCorrelationId() }
        );

        const fromDomain = i % 2 === 0 ? Domain.CORE : Domain.COORDINATION;
        const toDomain = Domain.WORKFLOWS;

        return eventBus.routeCrossDomainEvent(event, fromDomain, toDomain, `routing_test_${i}`);
      });

      const results = await Promise.all(routingPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.every((r) => r.success)).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(routingCount);

      const routingsPerSecond = routingCount / (duration / 1000);
      expect(routingsPerSecond).toBeGreaterThan(50); // Cross-domain routing should be reasonable

      console.log(`Cross-Domain Routing Performance:
        Cross-domain routings: ${routingCount}
        Duration: ${duration}ms
        Routings/sec: ${routingsPerSecond.toFixed(2)}
        Avg routing time: ${(duration / routingCount).toFixed(2)}ms per routing`);
    }, 60000);
  });

  describe('Handler Performance Under Load', () => {
    test('should handle slow handlers gracefully', async () => {
      const eventCount = 100;
      const slowHandlerDelay = 50; // 50ms delay per handler

      const fastHandler = vi.fn();
      const slowHandler = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, slowHandlerDelay));
      });

      eventBus.registerHandler('mixed.speed.test', fastHandler, { priority: 2 });
      eventBus.registerHandler('mixed.speed.test', slowHandler, { priority: 1 });

      const startTime = Date.now();

      const events = Array.from({ length: eventCount }, (_, i) =>
        createEvent<BaseEvent>('mixed.speed.test', Domain.CORE, { index: i })
      );

      const results = await eventBus.emitEventBatch(events, { maxConcurrency: 10 });
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.every((r) => r.success)).toBe(true);
      expect(fastHandler).toHaveBeenCalledTimes(eventCount);
      expect(slowHandler).toHaveBeenCalledTimes(eventCount);

      // Should complete in reasonable time despite slow handlers (due to concurrency)
      const expectedMinDuration = (eventCount * slowHandlerDelay) / 10; // With concurrency
      expect(duration).toBeGreaterThan(expectedMinDuration * 0.5); // At least 50% of expected
      expect(duration).toBeLessThan(expectedMinDuration * 3); // Not more than 3x expected

      console.log(`Mixed Handler Speed Performance:
        Events: ${eventCount}
        Slow handler delay: ${slowHandlerDelay}ms
        Duration: ${duration}ms
        Expected min duration: ${expectedMinDuration}ms
        Concurrency factor: ${(expectedMinDuration / duration).toFixed(2)}x`);
    }, 60000);

    test('should handle handler errors without affecting overall performance', async () => {
      const eventCount = 5000;
      const errorRate = 0.1; // 10% error rate

      const successHandler = vi.fn();
      const errorHandler = vi.fn((event: BaseEvent) => {
        const shouldError = Math.random() < errorRate;
        if (shouldError) {
          throw new Error(`Simulated error for event ${event.id}`);
        }
      });

      eventBus.registerHandler('error.resilience.test', successHandler);
      eventBus.registerHandler('error.resilience.test', errorHandler);

      const startTime = Date.now();

      const events = Array.from({ length: eventCount }, (_, i) =>
        createEvent<BaseEvent>('error.resilience.test', Domain.CORE, { index: i })
      );

      const results = await eventBus.emitEventBatch(events);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All events should still be processed successfully (overall success)
      expect(results.every((r) => r.success)).toBe(true);
      expect(successHandler).toHaveBeenCalledTimes(eventCount);
      expect(errorHandler).toHaveBeenCalledTimes(eventCount);

      // Count actual errors in handler results
      const totalHandlerErrors = results.reduce(
        (sum, result) => sum + result.handlerResults.filter((hr) => !hr.success).length,
        0
      );

      const actualErrorRate = totalHandlerErrors / (eventCount * 2); // 2 handlers per event
      expect(actualErrorRate).toBeLessThan(errorRate * 1.5); // Allow some variance

      const eventsPerSecond = eventCount / (duration / 1000);
      expect(eventsPerSecond).toBeGreaterThan(500); // Should maintain reasonable performance

      console.log(`Error Resilience Performance:
        Events: ${eventCount}
        Expected error rate: ${(errorRate * 100).toFixed(1)}%
        Actual error rate: ${(actualErrorRate * 100).toFixed(1)}%
        Total handler errors: ${totalHandlerErrors}
        Duration: ${duration}ms
        Events/sec: ${eventsPerSecond.toFixed(2)}`);
    }, 60000);
  });

  describe('AGUI Integration Performance', () => {
    test('should handle high-frequency AGUI events efficiently', async () => {
      const aguiEventCount = 1000;
      const validationHandler = vi.fn();
      const gateHandler = vi.fn();

      eventBus.registerHandler('human.validation.requested', validationHandler);
      eventBus.registerHandler('agui.gate.opened', gateHandler);

      const startTime = Date.now();

      // Create mixed AGUI events
      const events: BaseEvent[] = [];
      for (let i = 0; i < aguiEventCount; i++) {
        if (i % 2 === 0) {
          events.push(
            createEvent('human.validation.requested', Domain.INTERFACES, {
              payload: {
                requestId: `validation-${i}`,
                validationType: 'approval' as const,
                context: { test: true, index: i },
                priority: EventPriority.NORMAL,
                timeout: 30000,
              },
            })
          );
        } else {
          events.push(
            createEvent('agui.gate.opened', Domain.INTERFACES, {
              payload: {
                gateId: `gate-${i}`,
                gateType: 'approval-gate',
                requiredApproval: true,
                context: { test: true, index: i },
              },
            })
          );
        }
      }

      const results = await eventBus.emitEventBatch(events);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.every((r) => r.success)).toBe(true);

      const validationEvents = aguiEventCount / 2;
      const gateEvents = aguiEventCount / 2;

      expect(validationHandler).toHaveBeenCalledTimes(validationEvents);
      expect(gateHandler).toHaveBeenCalledTimes(gateEvents);

      const eventsPerSecond = aguiEventCount / (duration / 1000);
      expect(eventsPerSecond).toBeGreaterThan(100); // AGUI events should process efficiently

      console.log(`AGUI Integration Performance:
        AGUI events: ${aguiEventCount}
        Validation events: ${validationEvents}
        Gate events: ${gateEvents}
        Duration: ${duration}ms
        Events/sec: ${eventsPerSecond.toFixed(2)}`);
    }, 60000);
  });

  describe('System Resource Monitoring', () => {
    test('should provide accurate performance metrics under load', async () => {
      const testDuration = 10000; // 10 seconds
      const eventInterval = 10; // Emit event every 10ms
      let eventsEmitted = 0;

      const mockHandler = vi.fn();
      eventBus.registerHandler('metrics.monitoring', mockHandler);

      const startTime = Date.now();
      let endTime = startTime;

      // Emit events at regular intervals
      const emissionInterval = setInterval(async () => {
        const event = createEvent<BaseEvent>('metrics.monitoring', Domain.CORE, {
          timestamp: Date.now(),
        });

        await eventBus.emitEvent(event);
        eventsEmitted++;
        endTime = Date.now();

        if (endTime - startTime >= testDuration) {
          clearInterval(emissionInterval);
        }
      }, eventInterval);

      // Wait for test completion
      await new Promise((resolve) => {
        const checkCompletion = setInterval(() => {
          if (Date.now() - startTime >= testDuration) {
            clearInterval(checkCompletion);
            clearInterval(emissionInterval);
            resolve(void 0);
          }
        }, 100);
      });

      const actualDuration = endTime - startTime;
      const metrics = eventBus.getMetrics();
      const performanceStats = eventBus.getPerformanceStats();

      // Verify metrics accuracy
      expect(metrics.totalEvents).toBeGreaterThanOrEqual(eventsEmitted * 0.8); // Allow some variance
      expect(metrics.eventsPerSecond).toBeGreaterThan(50); // Should handle at least 50 events/sec
      expect(metrics.averageProcessingTime).toBeLessThan(50); // Should process quickly

      // Verify performance stats
      expect(performanceStats['metrics.monitoring']).toBeDefined();
      expect(performanceStats['metrics.monitoring'].count).toBeGreaterThan(0);

      console.log(`Resource Monitoring Analysis:
        Test duration: ${actualDuration}ms
        Events emitted: ${eventsEmitted}
        Expected events/sec: ${1000 / eventInterval}
        Actual events/sec: ${metrics.eventsPerSecond.toFixed(2)}
        Average processing time: ${metrics.averageProcessingTime.toFixed(2)}ms
        Total handlers: ${metrics.handlerCount}
        Memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
        Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%`);

      expect(mockHandler).toHaveBeenCalledTimes(eventsEmitted);
    }, 20000);

    test('should maintain stable performance over extended periods', async () => {
      const phases = 5;
      const eventsPerPhase = 2000;
      const mockHandler = vi.fn();

      eventBus.registerHandler('stability.test', mockHandler);

      const phaseResults: Array<{
        phase: number;
        duration: number;
        eventsPerSecond: number;
        averageProcessingTime: number;
      }> = [];

      for (let phase = 0; phase < phases; phase++) {
        const phaseStartTime = Date.now();

        const events = Array.from({ length: eventsPerPhase }, (_, i) =>
          createEvent<BaseEvent>(
            'stability.test',
            Domain.CORE,
            { phase, index: i },
            { tags: [`phase-${phase}`, `event-${i}`] }
          )
        );

        await eventBus.emitEventBatch(events);

        const phaseEndTime = Date.now();
        const phaseDuration = phaseEndTime - phaseStartTime;
        const phaseEventsPerSecond = eventsPerPhase / (phaseDuration / 1000);

        const phaseMetrics = eventBus.getMetrics();

        phaseResults.push({
          phase,
          duration: phaseDuration,
          eventsPerSecond: phaseEventsPerSecond,
          averageProcessingTime: phaseMetrics.averageProcessingTime,
        });

        console.log(`Phase ${phase + 1}/${phases}:
          Duration: ${phaseDuration}ms
          Events/sec: ${phaseEventsPerSecond.toFixed(2)}
          Avg processing time: ${phaseMetrics.averageProcessingTime.toFixed(2)}ms`);

        // Brief pause between phases
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Verify stability across phases
      const avgEventsPerSecond =
        phaseResults.reduce((sum, p) => sum + p.eventsPerSecond, 0) / phases;
      const eventsPerSecondVariance =
        phaseResults.reduce((sum, p) => sum + (p.eventsPerSecond - avgEventsPerSecond) ** 2, 0) /
        phases;
      const eventsPerSecondStdDev = Math.sqrt(eventsPerSecondVariance);
      const coefficientOfVariation = eventsPerSecondStdDev / avgEventsPerSecond;

      // Performance should be stable (CV < 20%)
      expect(coefficientOfVariation).toBeLessThan(0.2);
      expect(avgEventsPerSecond).toBeGreaterThan(200);

      console.log(`Stability Analysis:
        Phases: ${phases}
        Events per phase: ${eventsPerPhase}
        Avg events/sec: ${avgEventsPerSecond.toFixed(2)}
        Std deviation: ${eventsPerSecondStdDev.toFixed(2)}
        Coefficient of variation: ${(coefficientOfVariation * 100).toFixed(2)}%
        Total handler calls: ${mockHandler.mock.calls.length}`);
    }, 60000);
  });
});

describe('Event System Stress Tests', () => {
  test('should handle extreme load gracefully', async () => {
    const config: EventSystemConfig = {
      enableMetrics: true,
      enableCaching: true,
      domainValidation: false, // Disable for max performance
      maxEventHistory: 1000, // Reduced for memory efficiency
      defaultTimeout: 10000,
      maxConcurrency: 200,
      batchSize: 200,
    };

    const eventBus = createTypeSafeEventBus(config);
    await eventBus.initialize();

    try {
      const extremeEventCount = 50000;
      const mockHandler = vi.fn();

      eventBus.registerHandler('stress.test', mockHandler);

      const startTime = Date.now();

      // Create extreme load
      const batchSize = 5000;
      const batches = Math.ceil(extremeEventCount / batchSize);

      for (let batch = 0; batch < batches; batch++) {
        const batchStartIndex = batch * batchSize;
        const batchEndIndex = Math.min(batchStartIndex + batchSize, extremeEventCount);
        const batchEvents = Array.from({ length: batchEndIndex - batchStartIndex }, (_, i) =>
          createEvent<BaseEvent>('stress.test', Domain.CORE, {
            batchIndex: batch,
            eventIndex: batchStartIndex + i,
          })
        );

        await eventBus.emitEventBatch(batchEvents);

        // Brief pause to prevent overwhelming the system
        if (batch < batches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const eventsPerSecond = extremeEventCount / (duration / 1000);

      expect(mockHandler).toHaveBeenCalledTimes(extremeEventCount);
      expect(eventsPerSecond).toBeGreaterThan(500); // Should maintain reasonable performance

      const finalMetrics = eventBus.getMetrics();

      console.log(`Extreme Load Stress Test Results:
        Events processed: ${extremeEventCount}
        Duration: ${(duration / 1000).toFixed(2)}s
        Events/sec: ${eventsPerSecond.toFixed(2)}
        Final metrics:
          - Average processing time: ${finalMetrics.averageProcessingTime.toFixed(2)}ms
          - Failure rate: ${(finalMetrics.failureRate * 100).toFixed(2)}%
          - Memory usage: ${(finalMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
          - Cache hit rate: ${(finalMetrics.cacheHitRate * 100).toFixed(2)}%`);
    } finally {
      await eventBus.shutdown();
    }
  }, 120000); // 2 minute timeout for extreme load test
});
