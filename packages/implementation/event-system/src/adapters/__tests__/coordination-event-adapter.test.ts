/**
 * CoordinationEventAdapter Tests.
 *
 * Comprehensive hybrid TDD test suite for the CoordinationEventAdapter
 * following the 70% London + 30% Classical testing strategy.
 *
 * London TDD (Mockist) Tests:
 * - Event subscription and emission patterns
 * - Component interaction verification
 * - Factory integration testing.
 *
 * Classical TDD (Detroit) Tests:
 * - Event correlation algorithms
 * - Performance metric calculations
 * - Health monitoring computations.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventManagerTypes } from '../../core/interfaces';
import type { CoordinationEvent } from '../../types';
import {
  CoordinationEventAdapter,
  type CoordinationEventAdapterConfig,
  CoordinationEventHelpers,
  createCoordinationEventAdapter,
  createDefaultCoordinationEventAdapterConfig,
} from '../coordination-event-adapter';

describe('CoordinationEventAdapter', () => {'
  let adapter: CoordinationEventAdapter;
  let config: CoordinationEventAdapterConfig;

  beforeEach(() => {
    config = createDefaultCoordinationEventAdapterConfig('test-coordination');'
    adapter = new CoordinationEventAdapter(config);
  });

  afterEach(async () => {
    if (adapter?.isRunning()) {
      await adapter.stop();
    }
    if (adapter) {
      await adapter.destroy();
    }
  });

  describe('Initialization and Configuration', () => {'
    // London TDD: Test configuration setup and initialization
    it('should initialize with correct configuration', () => {'
      expect(adapter.name).toBe('test-coordination');'
      expect(adapter.type).toBe(EventManagerTypes.COORDINATION);
      expect(adapter.config.name).toBe('test-coordination');'
      expect(adapter.config.type).toBe(EventManagerTypes.COORDINATION);
    });

    it('should have default coordination configuration', () => {'
      expect(adapter.config.swarmCoordination?.enabled).toBe(true);
      expect(adapter.config.agentManagement?.enabled).toBe(true);
      expect(adapter.config.taskOrchestration?.enabled).toBe(true);
      expect(adapter.config.coordination?.enabled).toBe(true);
    });

    it('should initialize as not running', () => {'
      expect(adapter.isRunning()).toBe(false);
    });
  });

  describe('Lifecycle Management (London TDD)', () => {'
    // London TDD: Mock internal dependencies and verify interactions
    it('should start successfully and emit start event', async () => {'
      const startHandler = vi.fn();
      adapter.on('start', startHandler);'

      await adapter.start();

      expect(adapter.isRunning()).toBe(true);
      expect(startHandler).toHaveBeenCalled();
    });

    it('should stop successfully and emit stop event', async () => {'
      const stopHandler = vi.fn();
      adapter.on('stop', stopHandler);'

      await adapter.start();
      await adapter.stop();

      expect(adapter.isRunning()).toBe(false);
      expect(stopHandler).toHaveBeenCalled();
    });

    it('should restart successfully', async () => {'
      const startHandler = vi.fn();
      const stopHandler = vi.fn();

      adapter.on('start', startHandler);'
      adapter.on('stop', stopHandler);'

      await adapter.start();
      await adapter.restart();

      expect(adapter.isRunning()).toBe(true);
      expect(stopHandler).toHaveBeenCalled();
      expect(startHandler).toHaveBeenCalledTimes(2); // Once for start, once for restart
    });

    it('should handle start when already running', async () => {'
      await adapter.start();

      // Should not throw and remain running
      await adapter.start();
      expect(adapter.isRunning()).toBe(true);
    });

    it('should handle stop when not running', async () => {'
      // Should not throw
      await adapter.stop();
      expect(adapter.isRunning()).toBe(false);
    });
  });

  describe('Event Subscription Management (London TDD)', () => {'
    // London TDD: Test subscription interactions and listener calls
    beforeEach(async () => {
      await adapter.start();
    });

    it('should subscribe to coordination events', () => {'
      const listener = vi.fn();
      const subscriptionId = adapter.subscribe(
        ['coordination:swarm'],
        listener
      );

      expect(subscriptionId).toMatch(/coord-sub-/);
      expect(adapter.getSubscriptions()).toHaveLength(1);
    });

    it('should unsubscribe from coordination events', () => {'
      const listener = vi.fn();
      const subscriptionId = adapter.subscribe(
        ['coordination:swarm'],
        listener
      );

      const result = adapter.unsubscribe(subscriptionId);

      expect(result).toBe(true);
      expect(adapter.getSubscriptions()).toHaveLength(0);
    });

    it('should unsubscribe all listeners for event type', () => {'
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      adapter.subscribe(['coordination:swarm'], listener1);'
      adapter.subscribe(['coordination:swarm'], listener2);'
      adapter.subscribe(['coordination:agent'], listener1);'

      const removedCount = adapter.unsubscribeAll('coordination:swarm');'

      expect(removedCount).toBe(2);
      expect(adapter.getSubscriptions()).toHaveLength(1);
    });

    it('should call subscribed listeners when events are emitted', async () => {'
      const listener = vi.fn();
      adapter.subscribe(['coordination:swarm'], listener);'

      const event: CoordinationEvent = {
        id: 'test-event',
        timestamp: new Date(),
        source: 'test-source',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
      };

      await adapter.emit(event);

      expect(listener).toHaveBeenCalledWith(event);
    });
  });

  describe('Event Emission and Processing (London TDD)', () => {'
    beforeEach(async () => {
      await adapter.start();
    });

    it('should emit coordination events with proper validation', async () => {'
      const emissionHandler = vi.fn();
      adapter.on('emission', emissionHandler);'

      const event: CoordinationEvent = {
        id: 'test-event',
        timestamp: new Date(),
        source: 'swarm-coordinator',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
        details: {
          topology: 'mesh',
          agentCount: 5,
        },
      };

      await adapter.emit(event);

      expect(emissionHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          event,
          success: true,
          duration: expect.any(Number),
        })
      );
    });

    it('should emit coordination events immediately', async () => {'
      const listener = vi.fn();
      adapter.subscribe(['coordination:agent'], listener);'

      const event: CoordinationEvent = {
        id: 'test-immediate',
        timestamp: new Date(),
        source: 'agent-manager',
        type: 'coordination:agent',
        operation: 'spawn',
        targetId: 'test-agent',
        payload: {},
      };

      await adapter.emitImmediate(event);

      expect(listener).toHaveBeenCalledWith(event);
    });

    it('should process event batches correctly', async () => {'
      const listener = vi.fn();
      adapter.subscribe(['coordination:task'], listener);'

      const events: CoordinationEvent[] = [
        {
          id: 'batch-1',
          timestamp: new Date(),
          source: 'orchestrator',
          type: 'coordination:task',
          operation: 'distribute',
          targetId: 'task-1',
          payload: {},
        },
        {
          id: 'batch-2',
          timestamp: new Date(),
          source: 'orchestrator',
          type: 'coordination:task',
          operation: 'distribute',
          targetId: 'task-2',
          payload: {},
        },
      ];

      const batch = {
        id: 'test-batch',
        events,
        size: events.length,
        created: new Date(),
      };

      await adapter.emitBatch(batch);

      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Filtering and Transformation (London TDD)', () => {'
    beforeEach(async () => {
      await adapter.start();
    });

    it('should add and apply event filters', async () => {'
      const listener = vi.fn();
      adapter.subscribe(['coordination:swarm'], listener);'

      // Add filter that only allows events from specific source
      const filterId = adapter.addFilter({
        sources: ['swarm-coordinator'],
      });

      const allowedEvent: CoordinationEvent = {
        id: 'allowed',
        timestamp: new Date(),
        source: 'swarm-coordinator',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
      };

      const filteredEvent: CoordinationEvent = {
        id: 'filtered',
        timestamp: new Date(),
        source: 'other-source',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
      };

      await adapter.emit(allowedEvent);
      await adapter.emit(filteredEvent);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(allowedEvent);

      expect(adapter.removeFilter(filterId)).toBe(true);
    });

    it('should add and apply event transforms', async () => {'
      const listener = vi.fn();
      adapter.subscribe(['coordination:agent'], listener);'

      // Add transform that enriches events
      const transformId = adapter.addTransform({
        enricher: async (event) => ({
          ...event,
          metadata: { ...event.metadata, transformed: true },
        }),
      });

      const event: CoordinationEvent = {
        id: 'transform-test',
        timestamp: new Date(),
        source: 'agent-manager',
        type: 'coordination:agent',
        operation: 'spawn',
        targetId: 'test-agent',
        payload: {},
      };

      await adapter.emit(event);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          ...event,
          metadata: { transformed: true },
        })
      );

      expect(adapter.removeTransform(transformId)).toBe(true);
    });
  });

  describe('Health Monitoring and Status (Classical TDD)', () => {'
    // Classical TDD: Test actual health calculation results
    beforeEach(async () => {
      await adapter.start();
    });

    it('should provide health status with correct structure', async () => {'
      const status = await adapter.healthCheck();

      expect(status).toMatchObject({
        name: 'test-coordination',
        type: EventManagerTypes.COORDINATION,
        status: expect.stringMatching(/healthy | degraded | unhealthy | stopped/),
        lastCheck: expect.any(Date),
        subscriptions: expect.any(Number),
        queueSize: expect.any(Number),
        errorRate: expect.any(Number),
        uptime: expect.any(Number),
        metadata: expect.any(Object),
      });
    });

    it('should calculate error rate correctly', async () => {'
      // Emit successful events
      const successEvent: CoordinationEvent = {
        id: 'success-1',
        timestamp: new Date(),
        source: 'test-source',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
      };

      await adapter.emit(successEvent);
      await adapter.emit(successEvent);

      const initialStatus = await adapter.healthCheck();
      expect(initialStatus.errorRate).toBe(0);

      // Create a failing event scenario
      try {
        await adapter.emit({
          id: '', // Invalid event to trigger error'
          timestamp: new Date(),
          source: '',
          type: 'coordination:swarm',
          operation: 'init',
          targetId: '',
          payload: {},
        } as CoordinationEvent);
      } catch {
        // Expected to fail
      }

      const finalStatus = await adapter.healthCheck();
      expect(finalStatus.errorRate).toBeGreaterThan(0);
    });

    it('should calculate uptime correctly', async () => {'
      const _startTime = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms

      const status = await adapter.healthCheck();
      const uptime = status.uptime;

      expect(uptime).toBeGreaterThanOrEqual(90); // Allow some margin
      expect(uptime).toBeLessThan(200);
    });
  });

  describe('Performance Metrics (Classical TDD)', () => {'
    // Classical TDD: Test actual performance calculations
    beforeEach(async () => {
      await adapter.start();
    });

    it('should track events processed correctly', async () => {'
      const event: CoordinationEvent = {
        id: 'metrics-test',
        timestamp: new Date(),
        source: 'test-source',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
      };

      await adapter.emit(event);
      await adapter.emit(event);

      const metrics = await adapter.getMetrics();

      expect(metrics.eventsProcessed).toBe(2);
      expect(metrics.eventsEmitted).toBe(2);
      expect(metrics.eventsFailed).toBe(0);
    });

    it('should calculate average latency', async () => {'
      const event: CoordinationEvent = {
        id: 'latency-test',
        timestamp: new Date(),
        source: 'test-source',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
      };

      await adapter.emit(event);

      const metrics = await adapter.getMetrics();

      expect(metrics.averageLatency).toBeGreaterThan(0);
      expect(metrics.averageLatency).toBeLessThan(1000); // Should be reasonable
    });

    it('should track throughput over time', async () => {'
      const events = Array.from({ length: 5 }, (_, i) => ({
        id: `throughput-${i}`,`
        timestamp: new Date(),
        source: 'test-source',
        type: 'coordination:swarm' as const,
        operation: 'init' as const,
        targetId: `test-swarm-${i}`,`
        payload: {},
      }));

      // Emit events quickly
      await Promise.all(events.map((event) => adapter.emit(event)));

      const metrics = await adapter.getMetrics();

      expect(metrics.throughput).toBeGreaterThan(0);
      expect(metrics.eventsProcessed).toBe(5);
    });
  });

  describe('Event History and Querying (Classical TDD)', () => {'
    beforeEach(async () => {
      await adapter.start();
    });

    it('should maintain event history', async () => {'
      const events: CoordinationEvent[] = [
        {
          id: 'history-1',
          timestamp: new Date(),
          source: 'swarm-coordinator',
          type: 'coordination:swarm',
          operation: 'init',
          targetId: 'swarm-1',
          payload: {},
        },
        {
          id: 'history-2',
          timestamp: new Date(),
          source: 'agent-manager',
          type: 'coordination:agent',
          operation: 'spawn',
          targetId: 'agent-1',
          payload: {},
        },
      ];

      for (const event of events) {
        await adapter.emit(event);
      }

      const history = await adapter.getEventHistory('coordination:swarm');'
      expect(history).toHaveLength(1);
      expect(history[0]?.id).toBe('history-1');'
    });

    it('should query events with filters', async () => {'
      const events: CoordinationEvent[] = [
        {
          id: 'query-1',
          timestamp: new Date(Date.now() - 1000),
          source: 'swarm-coordinator',
          type: 'coordination:swarm',
          operation: 'init',
          targetId: 'swarm-1',
          payload: {},
          priority: 'high',
        },
        {
          id: 'query-2',
          timestamp: new Date(),
          source: 'agent-manager',
          type: 'coordination:agent',
          operation: 'spawn',
          targetId: 'agent-1',
          payload: {},
          priority: 'medium',
        },
      ];

      for (const event of events) {
        await adapter.emit(event);
      }

      const highPriorityEvents = await adapter.query({
        filter: {
          priorities: ['high'],
        },
      });

      expect(highPriorityEvents).toHaveLength(1);
      expect(highPriorityEvents[0]?.id).toBe('query-1');'
    });

    it('should sort and paginate query results', async () => {'
      const events: CoordinationEvent[] = Array.from({ length: 5 }, (_, i) => ({
        id: `sort-${i}`,`
        timestamp: new Date(Date.now() - i * 1000), // Spread timestamps
        source: 'test-source',
        type: 'coordination:swarm' as const,
        operation: 'init' as const,
        targetId: `swarm-${i}`,`
        payload: {},
      }));

      for (const event of events) {
        await adapter.emit(event);
      }

      const sortedEvents = await adapter.query({
        sortBy: 'timestamp',
        sortOrder: 'desc',
        limit: 3,
        offset: 1,
      });

      expect(sortedEvents).toHaveLength(3);
      // Events should be sorted by timestamp descending
      expect(sortedEvents[0]?.timestamp?.getTime()).toBeGreaterThan(
        sortedEvents[1]?.timestamp?.getTime() ?? 0
      );
    });
  });

  describe('Coordination-Specific Methods (London TDD)', () => {'
    beforeEach(async () => {
      await adapter.start();
    });

    it('should emit swarm coordination events', async () => {'
      const listener = vi.fn();
      adapter.subscribe(['coordination:swarm'], listener);'

      await adapter.emitSwarmCoordinationEvent({
        source: 'swarm-coordinator',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
        details: {
          topology: 'hierarchical',
          agentCount: 10,
        },
      });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'swarm-coordinator',
          type: 'coordination:swarm',
          operation: 'init',
          targetId: 'test-swarm',
          payload: {},
        })
      );
    });

    it('should subscribe to swarm lifecycle events', () => {'
      const listener = vi.fn();
      const subscriptionId = adapter.subscribeSwarmLifecycleEvents(listener);

      expect(subscriptionId).toMatch(/coord-sub-/);
      expect(adapter.getSubscriptions()).toHaveLength(1);
      expect(adapter.getSubscriptions()[0]?.eventTypes).toContain(
        'coordination:swarm''
      );
    });

    it('should subscribe to agent management events', () => {'
      const listener = vi.fn();
      const subscriptionId = adapter.subscribeAgentManagementEvents(listener);

      expect(subscriptionId).toMatch(/coord-sub-/);
      expect(adapter.getSubscriptions()[0]?.eventTypes).toContain(
        'coordination:agent''
      );
    });

    it('should subscribe to task orchestration events', () => {'
      const listener = vi.fn();
      const subscriptionId = adapter.subscribeTaskOrchestrationEvents(listener);

      expect(subscriptionId).toMatch(/coord-sub-/);
      expect(adapter.getSubscriptions()[0]?.eventTypes).toContain(
        'coordination:task''
      );
    });
  });

  describe('Configuration Updates (London TDD)', () => {'
    beforeEach(async () => {
      await adapter.start();
    });

    it('should update configuration', () => {'
      const newConfig = {
        swarmOptimization: {
          enabled: false,
          optimizationInterval: 120000,
          performanceThresholds: {
            latency: 100,
            throughput: 50,
            reliability: 0.9,
          },
          autoScaling: false,
          loadBalancing: false,
        },
      };

      adapter.updateConfig(newConfig);

      expect(adapter.config.swarmOptimization?.enabled).toBe(false);
      expect(adapter.config.swarmOptimization?.optimizationInterval).toBe(
        120000
      );
    });
  });

  describe('Error Handling (London TDD)', () => {'
    beforeEach(async () => {
      await adapter.start();
    });

    it('should handle invalid events gracefully', async () => {'
      const errorHandler = vi.fn();
      adapter.on('error', errorHandler);'

      try {
        await adapter.emit({
          id: '',
          timestamp: new Date(),
          source: '',
          type: 'coordination:swarm',
          operation: 'init',
          targetId: '',
          payload: {},
        } as CoordinationEvent);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle subscription errors gracefully', async () => {'
      const faultyListener = vi
        .fn()
        .mockRejectedValue(new Error('Listener error'));'
      const subscriptionErrorHandler = vi.fn();

      adapter.on('error', subscriptionErrorHandler);'
      adapter.subscribe(['coordination:swarm'], faultyListener);'

      const event: CoordinationEvent = {
        id: 'error-test',
        timestamp: new Date(),
        source: 'test-source',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
      };

      await adapter.emit(event);

      expect(subscriptionErrorHandler).toHaveBeenCalled();
    });
  });
});

describe('CoordinationEventAdapter Factory Functions', () => {'
  describe('createCoordinationEventAdapter', () => {'
    it('should create adapter with custom configuration', () => {'
      const config = createDefaultCoordinationEventAdapterConfig(
        'factory-test',
        {
          swarmOptimization: {
            enabled: false,
            optimizationInterval: 60000,
            performanceThresholds: {
              latency: 50,
              throughput: 100,
              reliability: 0.95,
            },
            autoScaling: false,
            loadBalancing: false,
          },
        }
      );

      const adapter = createCoordinationEventAdapter(config);

      expect(adapter.name).toBe('factory-test');'
      expect(adapter.config.swarmOptimization?.enabled).toBe(false);
    });
  });

  describe('createDefaultCoordinationEventAdapterConfig', () => {'
    it('should create default configuration with overrides', () => {'
      const config = createDefaultCoordinationEventAdapterConfig(
        'default-test',
        {
          coordination: {
            enabled: false,
            strategy: 'agent',
            correlationTTL: 60000,
            maxCorrelationDepth: 5,
            correlationPatterns: ['test-pattern'],
            trackAgentCommunication: false,
            trackSwarmHealth: false,
          },
        }
      );

      expect(config?.name).toBe('default-test');'
      expect(config?.type).toBe(EventManagerTypes.COORDINATION);
      expect(config?.coordination?.enabled).toBe(false);
      expect(config?.coordination?.strategy).toBe('agent');'
    });
  });
});

describe('CoordinationEventHelpers', () => {'
  describe('createSwarmInitEvent', () => {'
    it('should create swarm initialization event', () => {'
      const event = CoordinationEventHelpers.createSwarmInitEvent(
        'test-swarm',
        'mesh',
        {
          agentCount: 5,
        }
      );

      expect(event).toMatchObject({
        source: 'swarm-coordinator',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'test-swarm',
        payload: {},
        priority: 'high',
        details: {
          topology: 'mesh',
          agentCount: 5,
        },
      });
    });
  });

  describe('createAgentSpawnEvent', () => {'
    it('should create agent spawn event', () => {'
      const event = CoordinationEventHelpers.createAgentSpawnEvent(
        'test-agent',
        'test-swarm',
        {
          capabilities: ['research'],
        }
      );

      expect(event).toMatchObject({
        source: 'agent-manager',
        type: 'coordination:agent',
        operation: 'spawn',
        targetId: 'test-agent',
        payload: {},
        priority: 'high',
        details: {
          swarmId: 'test-swarm',
          capabilities: ['research'],
        },
      });
    });
  });

  describe('createTaskDistributionEvent', () => {'
    it('should create task distribution event', () => {'
      const event = CoordinationEventHelpers.createTaskDistributionEvent(
        'test-task',
        ['agent-1', 'agent-2'],
        { taskType: 'analysis' }'
      );

      expect(event).toMatchObject({
        source: 'orchestrator',
        type: 'coordination:task',
        operation: 'distribute',
        targetId: 'test-task',
        payload: {},
        priority: 'medium',
        details: {
          assignedTo: ['agent-1', 'agent-2'],
          taskType: 'analysis',
        },
      });
    });
  });

  describe('createTopologyChangeEvent', () => {'
    it('should create topology change event', () => {'
      const event = CoordinationEventHelpers.createTopologyChangeEvent(
        'test-swarm',
        'hierarchical',
        { nodeCount: 8 }
      );

      expect(event).toMatchObject({
        source: 'topology-manager',
        type: 'coordination:topology',
        operation: 'coordinate',
        targetId: 'test-swarm',
        payload: {},
        priority: 'medium',
        details: {
          topology: 'hierarchical',
          nodeCount: 8,
        },
      });
    });
  });

  describe('createCoordinationErrorEvent', () => {'
    it('should create coordination error event', () => {'
      const error = new Error('Test coordination error');'
      const event = CoordinationEventHelpers.createCoordinationErrorEvent(
        'swarm-coordinator',
        'test-swarm',
        error,
        { context: 'initialization' }'
      );

      expect(event).toMatchObject({
        source: 'swarm-coordinator',
        type: 'coordination:swarm',
        operation: 'fail',
        targetId: 'test-swarm',
        payload: {},
        priority: 'high',
        details: {
          errorCode: 'Error',
          errorMessage: 'Test coordination error',
          context: 'initialization',
        },
      });
    });
  });
});
