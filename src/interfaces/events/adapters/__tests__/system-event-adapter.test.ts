/**
 * System Event Adapter Tests
 *
 * Comprehensive test suite using Hybrid TDD approach:
 * - TDD London (70%): For event coordination, system integration, and event processing
 * - Classical TDD (30%): For event correlation algorithms, health calculations, and performance metrics
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventManagerTypes } from '../../core/interfaces';
import type { SystemLifecycleEvent } from '../../types';
import {
  createDefaultSystemEventAdapterConfig,
  createSystemEventAdapter,
  type SystemEventAdapter,
  type SystemEventAdapterConfig,
  SystemEventHelpers,
} from '../system-event-adapter';
import { SystemEventManagerFactory } from '../system-event-factory';

// Mock logger to avoid console output during tests
vi.mock('../../../../utils/logger', () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('SystemEventAdapter', () => {
  let adapter: SystemEventAdapter;
  let config: SystemEventAdapterConfig;

  beforeEach(() => {
    config = createDefaultSystemEventAdapterConfig('test-system-adapter');
    adapter = createSystemEventAdapter(config);
  });

  afterEach(async () => {
    if (adapter?.isRunning()) {
      await adapter.stop();
    }
    await adapter?.destroy();
  });

  // ============================================
  // TDD London Tests (Mockist - 70%)
  // ============================================

  describe('Lifecycle Management (London TDD)', () => {
    it('should initialize with correct configuration', () => {
      expect(adapter.name).toBe('test-system-adapter');
      expect(adapter.type).toBe(EventManagerTypes.SYSTEM);
      expect(adapter.config.name).toBe('test-system-adapter');
      expect(adapter.isRunning()).toBe(false);
    });

    it('should start successfully and emit start event', async () => {
      const startHandler = vi.fn();
      adapter.on('start', startHandler);

      await adapter.start();

      expect(adapter.isRunning()).toBe(true);
      expect(startHandler).toHaveBeenCalledOnce();
    });

    it('should stop successfully and emit stop event', async () => {
      const stopHandler = vi.fn();
      adapter.on('stop', stopHandler);

      await adapter.start();
      await adapter.stop();

      expect(adapter.isRunning()).toBe(false);
      expect(stopHandler).toHaveBeenCalledOnce();
    });

    it('should restart successfully', async () => {
      await adapter.start();
      expect(adapter.isRunning()).toBe(true);

      await adapter.restart();
      expect(adapter.isRunning()).toBe(true);
    });

    it('should handle start when already running', async () => {
      await adapter.start();

      // Starting again should not throw
      await expect(adapter.start()).resolves.not.toThrow();
      expect(adapter.isRunning()).toBe(true);
    });

    it('should handle stop when not running', async () => {
      // Stopping when not running should not throw
      await expect(adapter.stop()).resolves.not.toThrow();
      expect(adapter.isRunning()).toBe(false);
    });
  });

  describe('Event Emission (London TDD)', () => {
    beforeEach(async () => {
      await adapter.start();
    });

    it('should emit system lifecycle event successfully', async () => {
      const mockListener = vi.fn();
      adapter.subscribe(['system:startup'], mockListener);

      const event: SystemLifecycleEvent = {
        id: 'test-event-1',
        timestamp: new Date(),
        source: 'test-component',
        type: 'system:startup',
        operation: 'start',
        status: 'success',
        priority: 'high',
      };

      await adapter.emit(event);

      expect(mockListener).toHaveBeenCalledWith(event);
    });

    it('should emit immediate event with timeout', async () => {
      const mockListener = vi.fn();
      adapter.subscribe(['system:health'], mockListener);

      const event: SystemLifecycleEvent = {
        id: 'test-event-2',
        timestamp: new Date(),
        source: 'test-component',
        type: 'system:health',
        operation: 'status',
        status: 'success',
        priority: 'medium',
      };

      await adapter.emitImmediate(event);

      expect(mockListener).toHaveBeenCalledWith(event);
    });

    it('should validate events before emission', async () => {
      const invalidEvent = {
        // Missing required fields
        source: 'test',
        type: 'system:startup',
      } as any;

      await expect(adapter.emit(invalidEvent)).rejects.toThrow();
    });

    it('should handle emission timeout', async () => {
      const slowEvent: SystemLifecycleEvent = {
        id: 'slow-event',
        timestamp: new Date(),
        source: 'test-component',
        type: 'system:startup',
        operation: 'start',
        status: 'success',
        priority: 'high',
      };

      // Mock a slow emission
      const _originalEmit = adapter.processEventEmission;
      adapter.processEventEmission = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      await expect(adapter.emit(slowEvent, { timeout: 50 })).rejects.toThrow();
    });
  });

  describe('Event Subscription (London TDD)', () => {
    beforeEach(async () => {
      await adapter.start();
    });

    it('should create subscription and return subscription ID', () => {
      const mockListener = vi.fn();
      const subscriptionId = adapter.subscribe(['system:startup'], mockListener);

      expect(subscriptionId).toBeDefined();
      expect(typeof subscriptionId).toBe('string');
      expect(subscriptionId).toMatch(/^sys-sub-/);
    });

    it('should handle multiple event types in subscription', () => {
      const mockListener = vi.fn();
      const subscriptionId = adapter.subscribe(
        ['system:startup', 'system:shutdown', 'system:health'],
        mockListener
      );

      expect(subscriptionId).toBeDefined();
      const subscriptions = adapter.getSubscriptions();
      const subscription = subscriptions.find((s) => s.id === subscriptionId);
      expect(subscription?.eventTypes).toHaveLength(3);
    });

    it('should unsubscribe successfully', () => {
      const mockListener = vi.fn();
      const subscriptionId = adapter.subscribe(['system:startup'], mockListener);

      const result = adapter.unsubscribe(subscriptionId);
      expect(result).toBe(true);

      const subscriptions = adapter.getSubscriptions();
      expect(subscriptions.find((s) => s.id === subscriptionId)).toBeUndefined();
    });

    it('should return false when unsubscribing non-existent subscription', () => {
      const result = adapter.unsubscribe('non-existent-id');
      expect(result).toBe(false);
    });

    it('should unsubscribe all listeners for event type', async () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      adapter.subscribe(['system:startup'], mockListener1);
      adapter.subscribe(['system:startup'], mockListener2);
      adapter.subscribe(['system:health'], mockListener1);

      const removedCount = adapter.unsubscribeAll('system:startup');
      expect(removedCount).toBe(2);

      const subscriptions = adapter.getSubscriptions();
      expect(subscriptions.filter((s) => s.eventTypes.includes('system:startup'))).toHaveLength(0);
      expect(subscriptions.filter((s) => s.eventTypes.includes('system:health'))).toHaveLength(1);
    });

    it('should unsubscribe all listeners when no event type specified', () => {
      const mockListener = vi.fn();
      adapter.subscribe(['system:startup'], mockListener);
      adapter.subscribe(['system:health'], mockListener);

      const removedCount = adapter.unsubscribeAll();
      expect(removedCount).toBe(2);
      expect(adapter.getSubscriptions()).toHaveLength(0);
    });
  });

  describe('Event Filtering and Transformation (London TDD)', () => {
    beforeEach(async () => {
      await adapter.start();
    });

    it('should add and remove event filters', () => {
      const filter = {
        types: ['system:startup'],
        sources: ['test-component'],
      };

      const filterId = adapter.addFilter(filter);
      expect(filterId).toBeDefined();
      expect(typeof filterId).toBe('string');

      const result = adapter.removeFilter(filterId);
      expect(result).toBe(true);
    });

    it('should add and remove event transforms', () => {
      const transform = {
        mapper: (event: any) => ({ ...event, transformed: true }),
      };

      const transformId = adapter.addTransform(transform);
      expect(transformId).toBeDefined();
      expect(typeof transformId).toBe('string');

      const result = adapter.removeTransform(transformId);
      expect(result).toBe(true);
    });

    it('should apply filters during subscription', async () => {
      const mockListener = vi.fn();
      const filter = {
        sources: ['allowed-component'],
      };

      adapter.subscribe(['system:startup'], mockListener, { filter });

      // Event from allowed source should pass
      const allowedEvent: SystemLifecycleEvent = {
        id: 'allowed-event',
        timestamp: new Date(),
        source: 'allowed-component',
        type: 'system:startup',
        operation: 'start',
        status: 'success',
        priority: 'high',
      };

      // Event from blocked source should be filtered
      const blockedEvent: SystemLifecycleEvent = {
        id: 'blocked-event',
        timestamp: new Date(),
        source: 'blocked-component',
        type: 'system:startup',
        operation: 'start',
        status: 'success',
        priority: 'high',
      };

      await adapter.emit(allowedEvent);
      await adapter.emit(blockedEvent);

      expect(mockListener).toHaveBeenCalledWith(allowedEvent);
      expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it('should apply transforms during subscription', async () => {
      const mockListener = vi.fn();
      const transform = {
        mapper: (event: any) => ({ ...event, transformed: true }),
      };

      adapter.subscribe(['system:startup'], mockListener, { transform });

      const originalEvent: SystemLifecycleEvent = {
        id: 'transform-event',
        timestamp: new Date(),
        source: 'test-component',
        type: 'system:startup',
        operation: 'start',
        status: 'success',
        priority: 'high',
      };

      await adapter.emit(originalEvent);

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          ...originalEvent,
          transformed: true,
        })
      );
    });
  });

  describe('System Component Integration (London TDD)', () => {
    it('should wrap core system events when enabled', async () => {
      const configWithCoreSystem = {
        ...config,
        coreSystem: {
          enabled: true,
          wrapLifecycleEvents: true,
          wrapHealthEvents: true,
          wrapConfigEvents: true,
        },
      };

      const adapterWithCore = createSystemEventAdapter(configWithCoreSystem);
      await adapterWithCore.start();

      // Verify core system integration is initialized
      expect(adapterWithCore.isRunning()).toBe(true);

      await adapterWithCore.destroy();
    });

    it('should wrap application coordinator events when enabled', async () => {
      const configWithAppCoordinator = {
        ...config,
        applicationCoordinator: {
          enabled: true,
          wrapComponentEvents: true,
          wrapStatusEvents: true,
          wrapWorkspaceEvents: true,
        },
      };

      const adapterWithApp = createSystemEventAdapter(configWithAppCoordinator);
      await adapterWithApp.start();

      // Verify application coordinator integration is initialized
      expect(adapterWithApp.isRunning()).toBe(true);

      await adapterWithApp.destroy();
    });

    it('should wrap error recovery events when enabled', async () => {
      const configWithErrorRecovery = {
        ...config,
        errorRecovery: {
          enabled: true,
          wrapRecoveryEvents: true,
          wrapStrategyEvents: true,
          correlateErrors: true,
        },
      };

      const adapterWithError = createSystemEventAdapter(configWithErrorRecovery);
      await adapterWithError.start();

      // Verify error recovery integration is initialized
      expect(adapterWithError.isRunning()).toBe(true);

      await adapterWithError.destroy();
    });
  });

  // ============================================
  // Classical TDD Tests (30%)
  // ============================================

  describe('Event Correlation Logic (Classical TDD)', () => {
    beforeEach(async () => {
      config.correlation = {
        enabled: true,
        strategy: 'component',
        correlationTTL: 300000,
        maxCorrelationDepth: 10,
        correlationPatterns: ['system:startup->system:health', 'system:error->system:recovery'],
      };
      adapter = createSystemEventAdapter(config);
      await adapter.start();
    });

    it('should create correlation when emitting correlated events', async () => {
      const correlationId = 'test-correlation-123';

      const startupEvent: SystemLifecycleEvent = {
        id: 'startup-event',
        timestamp: new Date(),
        source: 'test-component',
        type: 'system:startup',
        operation: 'start',
        status: 'success',
        priority: 'high',
        correlationId,
      };

      await adapter.emit(startupEvent);

      const correlation = adapter.getCorrelatedEvents(correlationId);
      expect(correlation).toBeDefined();
      expect(correlation?.events).toHaveLength(1);
      expect(correlation?.events[0].id).toBe('startup-event');
      expect(correlation?.status).toBe('active');
    });

    it('should update correlation with related events', async () => {
      const correlationId = 'test-correlation-456';

      const startupEvent: SystemLifecycleEvent = {
        id: 'startup-event',
        timestamp: new Date(),
        source: 'test-component',
        type: 'system:startup',
        operation: 'start',
        status: 'success',
        priority: 'high',
        correlationId,
      };

      const healthEvent: SystemLifecycleEvent = {
        id: 'health-event',
        timestamp: new Date(),
        source: 'test-component',
        type: 'system:health',
        operation: 'status',
        status: 'success',
        priority: 'medium',
        correlationId,
      };

      await adapter.emit(startupEvent);
      await adapter.emit(healthEvent);

      const correlation = adapter.getCorrelatedEvents(correlationId);
      expect(correlation?.events).toHaveLength(2);
      expect(correlation?.status).toBe('completed'); // Pattern matched
    });

    it('should handle correlation pattern matching correctly', async () => {
      const correlationId = 'pattern-test-789';

      // Emit events that match system:startup->system:health pattern
      const startupEvent: SystemLifecycleEvent = {
        id: 'startup-1',
        timestamp: new Date(),
        source: 'component-a',
        type: 'system:startup',
        operation: 'start',
        status: 'success',
        priority: 'high',
        correlationId,
      };

      const healthEvent: SystemLifecycleEvent = {
        id: 'health-1',
        timestamp: new Date(Date.now() + 1000),
        source: 'component-a',
        type: 'system:health',
        operation: 'status',
        status: 'success',
        priority: 'medium',
        correlationId,
      };

      await adapter.emit(startupEvent);

      let correlation = adapter.getCorrelatedEvents(correlationId);
      expect(correlation?.status).toBe('active');

      await adapter.emit(healthEvent);

      correlation = adapter.getCorrelatedEvents(correlationId);
      expect(correlation?.status).toBe('completed');
    });
  });

  describe('Health Calculation Logic (Classical TDD)', () => {
    beforeEach(async () => {
      config.healthMonitoring = {
        enabled: true,
        healthCheckInterval: 1000,
        componentHealthThresholds: {
          'test-component': 0.8,
          'critical-component': 0.95,
        },
        autoRecoveryEnabled: true,
      };
      adapter = createSystemEventAdapter(config);
      await adapter.start();
    });

    it('should calculate health status correctly based on error rates', async () => {
      // Simulate successful operations
      for (let i = 0; i < 8; i++) {
        const event: SystemLifecycleEvent = {
          id: `success-event-${i}`,
          timestamp: new Date(),
          source: 'test-component',
          type: 'system:health',
          operation: 'status',
          status: 'success',
          priority: 'medium',
        };
        await adapter.emit(event);
      }

      // Simulate 2 failed operations (20% error rate)
      for (let i = 0; i < 2; i++) {
        try {
          await adapter.emit({} as any); // Invalid event to trigger error
        } catch (_error) {
          // Expected error
        }
      }

      const healthStatus = await adapter.healthCheck();

      // With 20% error rate, status should be degraded (not healthy, not unhealthy)
      expect(healthStatus.errorRate).toBeCloseTo(0.2);
      expect(healthStatus.status).toBe('degraded');
    });

    it('should determine healthy status with low error rate', async () => {
      // Simulate many successful operations
      for (let i = 0; i < 95; i++) {
        const event: SystemLifecycleEvent = {
          id: `success-event-${i}`,
          timestamp: new Date(),
          source: 'test-component',
          type: 'system:health',
          operation: 'status',
          status: 'success',
          priority: 'medium',
        };
        await adapter.emit(event);
      }

      // Simulate few failed operations (5% error rate)
      for (let i = 0; i < 5; i++) {
        try {
          await adapter.emit({} as any); // Invalid event
        } catch (_error) {
          // Expected error
        }
      }

      const healthStatus = await adapter.healthCheck();
      expect(healthStatus.errorRate).toBeCloseTo(0.05);
      expect(healthStatus.status).toBe('healthy');
    });

    it('should determine unhealthy status with high error rate', async () => {
      // Simulate high error rate by triggering many failures
      for (let i = 0; i < 25; i++) {
        try {
          await adapter.emit({} as any); // Invalid event
        } catch (_error) {
          // Expected error
        }
      }

      const healthStatus = await adapter.healthCheck();
      expect(healthStatus.errorRate).toBeGreaterThan(0.2);
      expect(healthStatus.status).toBe('unhealthy');
    });
  });

  describe('Performance Metrics Calculation (Classical TDD)', () => {
    beforeEach(async () => {
      config.performance = {
        enableEventCorrelation: true,
        maxConcurrentEvents: 100,
        eventTimeout: 30000,
        enablePerformanceTracking: true,
      };
      adapter = createSystemEventAdapter(config);
      await adapter.start();
    });

    it('should calculate average latency correctly', async () => {
      const events = [{ delay: 100 }, { delay: 200 }, { delay: 300 }];

      // Emit events with controlled timing
      for (const eventConfig of events) {
        const _startTime = Date.now();
        const event: SystemLifecycleEvent = {
          id: `perf-event-${eventConfig?.delay}`,
          timestamp: new Date(),
          source: 'test-component',
          type: 'system:health',
          operation: 'status',
          status: 'success',
          priority: 'medium',
        };

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, eventConfig?.delay));
        await adapter.emit(event);
      }

      const metrics = await adapter.getMetrics();

      // Average should be around 200ms (100+200+300)/3
      expect(metrics.averageLatency).toBeGreaterThan(150);
      expect(metrics.averageLatency).toBeLessThan(250);
      expect(metrics.eventsProcessed).toBe(3);
      expect(metrics.eventsEmitted).toBe(3);
    });

    it('should calculate throughput correctly', async () => {
      const eventCount = 10;
      const startTime = Date.now();

      // Emit events rapidly
      for (let i = 0; i < eventCount; i++) {
        const event: SystemLifecycleEvent = {
          id: `throughput-event-${i}`,
          timestamp: new Date(),
          source: 'test-component',
          type: 'system:health',
          operation: 'status',
          status: 'success',
          priority: 'medium',
        };
        await adapter.emit(event);
      }

      const endTime = Date.now();
      const metrics = await adapter.getMetrics();

      const actualDuration = (endTime - startTime) / 1000; // seconds
      const expectedThroughput = eventCount / actualDuration;

      expect(metrics.throughput).toBeGreaterThan(expectedThroughput * 0.5); // Allow for some variance
      expect(metrics.eventsProcessed).toBe(eventCount);
    });

    it('should track memory usage growth with events', async () => {
      const initialMetrics = await adapter.getMetrics();
      const initialMemory = initialMetrics.memoryUsage;

      // Add many events to increase memory usage
      for (let i = 0; i < 100; i++) {
        const event: SystemLifecycleEvent = {
          id: `memory-event-${i}`,
          timestamp: new Date(),
          source: 'test-component',
          type: 'system:health',
          operation: 'status',
          status: 'success',
          priority: 'medium',
          metadata: {
            // Add some metadata to increase memory usage
            data: new Array(100).fill(`data-${i}`).join(','),
          },
        };
        await adapter.emit(event);
      }

      const finalMetrics = await adapter.getMetrics();
      const finalMemory = finalMetrics.memoryUsage;

      expect(finalMemory).toBeGreaterThan(initialMemory);
    });
  });

  // ============================================
  // Integration Tests (Mixed Approach)
  // ============================================

  describe('System Event Helpers (Mixed)', () => {
    it('should create startup event with correct properties', () => {
      const event = SystemEventHelpers.createStartupEvent('test-component', { version: '1.0.0' });

      expect(event.source).toBe('test-component');
      expect(event.type).toBe('system:startup');
      expect(event.operation).toBe('start');
      expect(event.status).toBe('success');
      expect(event.priority).toBe('high');
      expect(event.details).toEqual({ version: '1.0.0' });
    });

    it('should create shutdown event with correct properties', () => {
      const event = SystemEventHelpers.createShutdownEvent('test-component', {
        reason: 'maintenance',
      });

      expect(event.source).toBe('test-component');
      expect(event.type).toBe('system:shutdown');
      expect(event.operation).toBe('stop');
      expect(event.status).toBe('success');
      expect(event.priority).toBe('critical');
      expect(event.details).toEqual({ reason: 'maintenance' });
    });

    it('should create health event with correct status based on score', () => {
      const healthyEvent = SystemEventHelpers.createHealthEvent('test-component', 0.9);
      expect(healthyEvent.status).toBe('success');

      const warningEvent = SystemEventHelpers.createHealthEvent('test-component', 0.6);
      expect(warningEvent.status).toBe('warning');

      const errorEvent = SystemEventHelpers.createHealthEvent('test-component', 0.3);
      expect(errorEvent.status).toBe('error');
    });

    it('should create error event with error details', () => {
      const error = new Error('Test error message');
      const event = SystemEventHelpers.createErrorEvent('test-component', error, {
        context: 'test',
      });

      expect(event.source).toBe('test-component');
      expect(event.type).toBe('system:error');
      expect(event.status).toBe('error');
      expect(event.priority).toBe('high');
      expect(event.details?.errorCode).toBe('Error');
      expect(event.details?.errorMessage).toBe('Test error message');
      expect(event.details?.context).toBe('test');
    });
  });
});

describe('SystemEventManagerFactory', () => {
  let factory: SystemEventManagerFactory;

  beforeEach(() => {
    factory = new SystemEventManagerFactory();
  });

  afterEach(async () => {
    await factory.shutdown();
  });

  describe('Factory Operations (London TDD)', () => {
    it('should create system event manager successfully', async () => {
      const config = createDefaultSystemEventAdapterConfig('factory-test');
      const manager = await factory.create(config);

      expect(manager).toBeDefined();
      expect(manager.name).toBe('factory-test');
      expect(manager.type).toBe(EventManagerTypes.SYSTEM);
      expect(factory.has('factory-test')).toBe(true);
    });

    it('should create multiple managers', async () => {
      const configs = [
        createDefaultSystemEventAdapterConfig('manager-1'),
        createDefaultSystemEventAdapterConfig('manager-2'),
        createDefaultSystemEventAdapterConfig('manager-3'),
      ];

      const managers = await factory.createMultiple(configs);

      expect(managers).toHaveLength(3);
      expect(factory.list()).toHaveLength(3);
    });

    it('should get existing manager by name', async () => {
      const config = createDefaultSystemEventAdapterConfig('get-test');
      await factory.create(config);

      const manager = factory.get('get-test');
      expect(manager).toBeDefined();
      expect(manager?.name).toBe('get-test');
    });

    it('should remove manager successfully', async () => {
      const config = createDefaultSystemEventAdapterConfig('remove-test');
      await factory.create(config);

      expect(factory.has('remove-test')).toBe(true);

      const removed = await factory.remove('remove-test');
      expect(removed).toBe(true);
      expect(factory.has('remove-test')).toBe(false);
    });

    it('should perform health check on all managers', async () => {
      const config1 = createDefaultSystemEventAdapterConfig('health-1');
      const config2 = createDefaultSystemEventAdapterConfig('health-2');

      await factory.create(config1);
      await factory.create(config2);

      const healthResults = await factory.healthCheckAll();

      expect(healthResults.size).toBe(2);
      expect(healthResults?.has('health-1')).toBe(true);
      expect(healthResults?.has('health-2')).toBe(true);
    });

    it('should start and stop all managers', async () => {
      const config = createDefaultSystemEventAdapterConfig('lifecycle-test');
      const manager = await factory.create(config);

      expect(manager.isRunning()).toBe(false);

      await factory.startAll();
      expect(manager.isRunning()).toBe(true);

      await factory.stopAll();
      expect(manager.isRunning()).toBe(false);
    });

    it('should validate configuration during creation', async () => {
      const invalidConfig = {
        name: '', // Invalid empty name
        type: EventManagerTypes.SYSTEM,
      } as SystemEventAdapterConfig;

      await expect(factory.create(invalidConfig)).rejects.toThrow();
    });
  });

  describe('Factory Metrics (Classical TDD)', () => {
    it('should track active manager count correctly', async () => {
      expect(factory.getActiveCount()).toBe(0);

      const config1 = createDefaultSystemEventAdapterConfig('active-1');
      const config2 = createDefaultSystemEventAdapterConfig('active-2');

      const manager1 = await factory.create(config1);
      const manager2 = await factory.create(config2);

      // Managers created but not started
      expect(factory.getActiveCount()).toBe(0);

      await manager1.start();
      expect(factory.getActiveCount()).toBe(1);

      await manager2.start();
      expect(factory.getActiveCount()).toBe(2);

      await manager1.stop();
      expect(factory.getActiveCount()).toBe(1);
    });

    it('should provide accurate factory metrics', async () => {
      const configs = [
        createDefaultSystemEventAdapterConfig('metrics-1'),
        createDefaultSystemEventAdapterConfig('metrics-2'),
        createDefaultSystemEventAdapterConfig('metrics-3'),
      ];

      await factory.createMultiple(configs);
      await factory.startAll();

      const metrics = factory.getFactoryMetrics();

      expect(metrics.totalManagers).toBe(3);
      expect(metrics.runningManagers).toBe(3);
      expect(metrics.uptime).toBeGreaterThan(0);
    });
  });
});
