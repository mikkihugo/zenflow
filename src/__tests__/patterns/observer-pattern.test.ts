/**
 * @file Observer Pattern Tests
 * Hybrid TDD approach: London TDD for event handling logic, Classical TDD for event algorithms
 */

import {
  type AllSystemEvents,
  DatabaseObserver,
  EventBuilder,
  LoggerObserver,
  MetricsObserver,
  SystemEventManager,
  type SystemObserver,
  WebSocketObserver,
} from '../../interfaces/events/observer-system';

// Mock dependencies for testing
interface MockLogger {
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
  debug: jest.Mock;
}

interface MockWebSocket {
  send: jest.Mock;
  readyState: number;
}

interface MockDatabase {
  insert: jest.Mock;
  update: jest.Mock;
  query: jest.Mock;
}

describe('Observer Pattern Implementation', () => {
  // Classical TDD - Test actual event processing algorithms and results
  describe('Event Processing Algorithms (Classical TDD)', () => {
    let eventManager: SystemEventManager;
    let mockLogger: MockLogger;

    beforeEach(() => {
      mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      };
      eventManager = new SystemEventManager(mockLogger);
    });

    describe('EventBuilder', () => {
      it('should create valid swarm events with correct structure', () => {
        const swarmEvent = EventBuilder.createSwarmEvent(
          'test-swarm-id',
          'init',
          { healthy: true, activeAgents: 5, completedTasks: 0, errors: [] },
          'mesh',
          {
            latency: 50,
            throughput: 100,
            reliability: 0.99,
            resourceUsage: { cpu: 0.5, memory: 0.6, network: 0.4 },
          }
        );

        expect(swarmEvent.type).toBe('swarm');
        expect(swarmEvent.subtype).toBe('init');
        expect(swarmEvent.swarmId).toBe('test-swarm-id');
        expect(swarmEvent.payload.topology).toBe('mesh');
        expect(swarmEvent.payload.status.healthy).toBe(true);
        expect(swarmEvent.payload.metrics.latency).toBe(50);
        expect(swarmEvent.timestamp).toBeInstanceOf(Date);
        expect(swarmEvent.id).toMatch(/^swarm-\d+$/);
      });

      it('should create valid MCP events with proper metadata', () => {
        const mcpEvent = EventBuilder.createMCPEvent(
          'test-session',
          'tool_call',
          { tool: 'swarm_init', args: { topology: 'hierarchical' } },
          { latency: 25, success: true, tokenUsage: 150 }
        );

        expect(mcpEvent.type).toBe('mcp');
        expect(mcpEvent.subtype).toBe('tool_call');
        expect(mcpEvent.sessionId).toBe('test-session');
        expect(mcpEvent.payload.tool).toBe('swarm_init');
        expect(mcpEvent.payload.metrics.latency).toBe(25);
        expect(mcpEvent.timestamp).toBeInstanceOf(Date);
      });

      it('should create neural events with training metrics', () => {
        const neuralEvent = EventBuilder.createNeuralEvent(
          'model-v1',
          'training_complete',
          { modelPath: '/models/v1', dataSize: 1000 },
          { accuracy: 0.95, loss: 0.05, epochs: 100, trainingTime: 3600 }
        );

        expect(neuralEvent.type).toBe('neural');
        expect(neuralEvent.subtype).toBe('training_complete');
        expect(neuralEvent.modelId).toBe('model-v1');
        expect(neuralEvent.payload.metrics.accuracy).toBe(0.95);
        expect(neuralEvent.payload.metrics.trainingTime).toBe(3600);
      });
    });

    describe('Priority Calculation', () => {
      it('should calculate higher priority for critical events', async () => {
        const criticalEvent = EventBuilder.createSwarmEvent(
          'critical-swarm',
          'error',
          {
            healthy: false,
            activeAgents: 0,
            completedTasks: 5,
            errors: ['Connection lost', 'Agent timeout'],
          },
          'mesh',
          {
            latency: 1000,
            throughput: 0,
            reliability: 0.1,
            resourceUsage: { cpu: 1.0, memory: 0.9, network: 0.1 },
          }
        );

        const normalEvent = EventBuilder.createSwarmEvent(
          'normal-swarm',
          'update',
          { healthy: true, activeAgents: 3, completedTasks: 10, errors: [] },
          'hierarchical',
          {
            latency: 50,
            throughput: 200,
            reliability: 0.98,
            resourceUsage: { cpu: 0.3, memory: 0.4, network: 0.8 },
          }
        );

        const mockObserver: SystemObserver = {
          update: vi.fn(),
          getInterests: () => ['swarm'],
          getId: () => 'test-observer',
          getPriority: () => 1,
        };

        eventManager.subscribe('swarm', mockObserver);

        await eventManager.notify(criticalEvent);
        await eventManager.notify(normalEvent);

        // Critical events should be processed first due to higher priority
        const queueStats = eventManager.getQueueStats();
        expect(queueStats.processedCount).toBe(2);
        expect(queueStats.averageProcessingTime).toBeGreaterThan(0);
      });

      it('should handle event bursts efficiently with priority ordering', async () => {
        const events: AllSystemEvents[] = [];

        // Create mix of high and low priority events
        for (let i = 0; i < 10; i++) {
          const isHighPriority = i % 3 === 0;
          events.push(
            EventBuilder.createSwarmEvent(
              `swarm-${i}`,
              isHighPriority ? 'error' : 'update',
              {
                healthy: !isHighPriority,
                activeAgents: isHighPriority ? 0 : 5,
                completedTasks: i,
                errors: isHighPriority ? ['Error'] : [],
              },
              'mesh',
              {
                latency: isHighPriority ? 500 : 50,
                throughput: isHighPriority ? 0 : 100,
                reliability: isHighPriority ? 0.5 : 0.95,
                resourceUsage: { cpu: 0.5, memory: 0.5, network: 0.5 },
              }
            )
          );
        }

        const processedEvents: AllSystemEvents[] = [];
        const mockObserver: SystemObserver = {
          update: (event) => {
            processedEvents.push(event);
          },
          getInterests: () => ['swarm'],
          getId: () => 'priority-tester',
          getPriority: () => 1,
        };

        eventManager.subscribe('swarm', mockObserver);

        // Process all events
        await Promise.all(events.map((event) => eventManager.notify(event)));

        // Verify processing order - errors should come first
        const errorEvents = processedEvents.filter((e) => e.subtype === 'error');
        const updateEvents = processedEvents.filter((e) => e.subtype === 'update');

        expect(errorEvents.length).toBe(4); // Every 3rd event (0,3,6,9)
        expect(updateEvents.length).toBe(6);
      });
    });

    describe('Event Filtering and Routing', () => {
      it('should route events to interested observers only', async () => {
        const swarmObserver: SystemObserver = {
          update: vi.fn(),
          getInterests: () => ['swarm'],
          getId: () => 'swarm-observer',
          getPriority: () => 1,
        };

        const mcpObserver: SystemObserver = {
          update: vi.fn(),
          getInterests: () => ['mcp'],
          getId: () => 'mcp-observer',
          getPriority: () => 1,
        };

        const universalObserver: SystemObserver = {
          update: vi.fn(),
          getInterests: () => ['swarm', 'mcp', 'neural'],
          getId: () => 'universal-observer',
          getPriority: () => 1,
        };

        eventManager.subscribe('swarm', swarmObserver);
        eventManager.subscribe('mcp', mcpObserver);
        eventManager.subscribe('swarm', universalObserver);
        eventManager.subscribe('mcp', universalObserver);

        const swarmEvent = EventBuilder.createSwarmEvent(
          'test-swarm',
          'init',
          { healthy: true, activeAgents: 2, completedTasks: 0, errors: [] },
          'star',
          {
            latency: 30,
            throughput: 150,
            reliability: 0.97,
            resourceUsage: { cpu: 0.2, memory: 0.3, network: 0.5 },
          }
        );

        const mcpEvent = EventBuilder.createMCPEvent(
          'test-session',
          'response',
          { result: 'success', data: { message: 'Operation completed' } },
          { latency: 15, success: true, tokenUsage: 75 }
        );

        await eventManager.notify(swarmEvent);
        await eventManager.notify(mcpEvent);

        // Verify correct routing
        expect(swarmObserver.update).toHaveBeenCalledWith(swarmEvent);
        expect(swarmObserver.update).not.toHaveBeenCalledWith(mcpEvent);

        expect(mcpObserver.update).toHaveBeenCalledWith(mcpEvent);
        expect(mcpObserver.update).not.toHaveBeenCalledWith(swarmEvent);

        expect(universalObserver.update).toHaveBeenCalledWith(swarmEvent);
        expect(universalObserver.update).toHaveBeenCalledWith(mcpEvent);
      });
    });

    describe('Error Recovery and Resilience', () => {
      it('should handle observer failures gracefully', async () => {
        const failingObserver: SystemObserver = {
          update: vi.fn().mockImplementation(() => {
            throw new Error('Observer processing failed');
          }),
          getInterests: () => ['swarm'],
          getId: () => 'failing-observer',
          getPriority: () => 1,
        };

        const workingObserver: SystemObserver = {
          update: vi.fn(),
          getInterests: () => ['swarm'],
          getId: () => 'working-observer',
          getPriority: () => 1,
        };

        eventManager.subscribe('swarm', failingObserver);
        eventManager.subscribe('swarm', workingObserver);

        const testEvent = EventBuilder.createSwarmEvent(
          'test-swarm',
          'update',
          { healthy: true, activeAgents: 1, completedTasks: 5, errors: [] },
          'ring',
          {
            latency: 80,
            throughput: 75,
            reliability: 0.92,
            resourceUsage: { cpu: 0.4, memory: 0.5, network: 0.6 },
          }
        );

        // Should not throw despite failing observer
        await expect(eventManager.notify(testEvent)).resolves.not.toThrow();

        // Working observer should still receive the event
        expect(workingObserver.update).toHaveBeenCalledWith(testEvent);
        expect(failingObserver.update).toHaveBeenCalledWith(testEvent);
      });

      it('should maintain performance under load', async () => {
        const highVolumeObserver: SystemObserver = {
          update: vi.fn(),
          getInterests: () => ['swarm', 'mcp', 'neural'],
          getId: () => 'high-volume-observer',
          getPriority: () => 1,
        };

        eventManager.subscribe('swarm', highVolumeObserver);
        eventManager.subscribe('mcp', highVolumeObserver);
        eventManager.subscribe('neural', highVolumeObserver);

        const startTime = Date.now();
        const eventPromises: Promise<void>[] = [];

        // Generate 100 mixed events
        for (let i = 0; i < 100; i++) {
          const eventType = ['swarm', 'mcp', 'neural'][i % 3];
          let event: AllSystemEvents;

          switch (eventType) {
            case 'swarm':
              event = EventBuilder.createSwarmEvent(
                `swarm-${i}`,
                'update',
                { healthy: true, activeAgents: i % 5, completedTasks: i, errors: [] },
                'mesh',
                {
                  latency: 50,
                  throughput: 100,
                  reliability: 0.95,
                  resourceUsage: { cpu: 0.3, memory: 0.4, network: 0.5 },
                }
              );
              break;
            case 'mcp':
              event = EventBuilder.createMCPEvent(
                `session-${i}`,
                'tool_call',
                { tool: 'test_tool', args: { index: i } },
                { latency: 20, success: true, tokenUsage: 50 }
              );
              break;
            default:
              event = EventBuilder.createNeuralEvent(
                `model-${i}`,
                'prediction',
                { input: `data-${i}`, prediction: i % 2 === 0 ? 'positive' : 'negative' },
                { confidence: 0.85, processingTime: 10, modelVersion: '1.0.0' }
              );
          }

          eventPromises.push(eventManager.notify(event));
        }

        await Promise.all(eventPromises);
        const processingTime = Date.now() - startTime;

        // Should process 100 events in reasonable time (< 1 second)
        expect(processingTime).toBeLessThan(1000);
        expect(highVolumeObserver.update).toHaveBeenCalledTimes(100);

        const queueStats = eventManager.getQueueStats();
        expect(queueStats.processedCount).toBe(100);
        expect(queueStats.averageProcessingTime).toBeLessThan(50); // Average < 50ms per event
      });
    });
  });

  // London TDD - Test observer subscription and notification interactions
  describe('Observer Management (London TDD)', () => {
    let eventManager: SystemEventManager;
    let mockLogger: MockLogger;
    let mockObserver: jest.Mocked<SystemObserver>;

    beforeEach(() => {
      mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      };

      mockObserver = {
        update: vi.fn(),
        getInterests: vi.fn().mockReturnValue(['swarm']),
        getId: vi.fn().mockReturnValue('mock-observer'),
        getPriority: vi.fn().mockReturnValue(1),
      };

      eventManager = new SystemEventManager(mockLogger);
    });

    it('should subscribe observers correctly', () => {
      eventManager.subscribe('swarm', mockObserver);

      const stats = eventManager.getObserverStats();
      expect(stats).toContainEqual(
        expect.objectContaining({
          type: 'swarm',
          observerId: 'mock-observer',
          priority: 1,
        })
      );
    });

    it('should unsubscribe observers correctly', () => {
      eventManager.subscribe('swarm', mockObserver);
      eventManager.unsubscribe('swarm', mockObserver);

      const stats = eventManager.getObserverStats();
      expect(stats.find((s) => s.observerId === 'mock-observer')).toBeUndefined();
    });

    it('should notify subscribed observers', async () => {
      eventManager.subscribe('swarm', mockObserver);

      const testEvent = EventBuilder.createSwarmEvent(
        'test-swarm',
        'init',
        { healthy: true, activeAgents: 1, completedTasks: 0, errors: [] },
        'mesh',
        {
          latency: 50,
          throughput: 100,
          reliability: 0.95,
          resourceUsage: { cpu: 0.3, memory: 0.4, network: 0.5 },
        }
      );

      await eventManager.notify(testEvent);

      expect(mockObserver.update).toHaveBeenCalledTimes(1);
      expect(mockObserver.update).toHaveBeenCalledWith(testEvent);
    });

    it('should not notify unsubscribed observers', async () => {
      eventManager.subscribe('swarm', mockObserver);
      eventManager.unsubscribe('swarm', mockObserver);

      const testEvent = EventBuilder.createSwarmEvent(
        'test-swarm',
        'update',
        { healthy: true, activeAgents: 2, completedTasks: 1, errors: [] },
        'star',
        {
          latency: 30,
          throughput: 120,
          reliability: 0.96,
          resourceUsage: { cpu: 0.2, memory: 0.3, network: 0.4 },
        }
      );

      await eventManager.notify(testEvent);

      expect(mockObserver.update).not.toHaveBeenCalled();
    });

    it('should handle multiple observers for same event type', async () => {
      const secondObserver = {
        update: vi.fn(),
        getInterests: vi.fn().mockReturnValue(['swarm']),
        getId: vi.fn().mockReturnValue('second-observer'),
        getPriority: vi.fn().mockReturnValue(2),
      };

      eventManager.subscribe('swarm', mockObserver);
      eventManager.subscribe('swarm', secondObserver);

      const testEvent = EventBuilder.createSwarmEvent(
        'test-swarm',
        'update',
        { healthy: true, activeAgents: 3, completedTasks: 2, errors: [] },
        'hierarchical',
        {
          latency: 75,
          throughput: 90,
          reliability: 0.93,
          resourceUsage: { cpu: 0.5, memory: 0.6, network: 0.7 },
        }
      );

      await eventManager.notify(testEvent);

      expect(mockObserver.update).toHaveBeenCalledWith(testEvent);
      expect(secondObserver.update).toHaveBeenCalledWith(testEvent);
    });

    it('should respect observer priorities in processing order', async () => {
      const highPriorityObserver = {
        update: vi.fn(),
        getInterests: vi.fn().mockReturnValue(['swarm']),
        getId: vi.fn().mockReturnValue('high-priority'),
        getPriority: vi.fn().mockReturnValue(3),
      };

      const lowPriorityObserver = {
        update: vi.fn(),
        getInterests: vi.fn().mockReturnValue(['swarm']),
        getId: vi.fn().mockReturnValue('low-priority'),
        getPriority: vi.fn().mockReturnValue(1),
      };

      eventManager.subscribe('swarm', lowPriorityObserver);
      eventManager.subscribe('swarm', highPriorityObserver);

      const testEvent = EventBuilder.createSwarmEvent(
        'priority-test',
        'update',
        { healthy: true, activeAgents: 1, completedTasks: 0, errors: [] },
        'ring',
        {
          latency: 100,
          throughput: 60,
          reliability: 0.9,
          resourceUsage: { cpu: 0.6, memory: 0.7, network: 0.8 },
        }
      );

      await eventManager.notify(testEvent);

      expect(highPriorityObserver.update).toHaveBeenCalledWith(testEvent);
      expect(lowPriorityObserver.update).toHaveBeenCalledWith(testEvent);
    });
  });

  describe('Concrete Observer Implementations (London TDD)', () => {
    describe('LoggerObserver', () => {
      let mockLogger: MockLogger;
      let loggerObserver: LoggerObserver;

      beforeEach(() => {
        mockLogger = {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          debug: vi.fn(),
        };
        loggerObserver = new LoggerObserver(mockLogger);
      });

      it('should log swarm events with appropriate levels', () => {
        const normalEvent = EventBuilder.createSwarmEvent(
          'test-swarm',
          'update',
          { healthy: true, activeAgents: 2, completedTasks: 5, errors: [] },
          'mesh',
          {
            latency: 50,
            throughput: 100,
            reliability: 0.95,
            resourceUsage: { cpu: 0.3, memory: 0.4, network: 0.5 },
          }
        );

        const errorEvent = EventBuilder.createSwarmEvent(
          'error-swarm',
          'error',
          { healthy: false, activeAgents: 0, completedTasks: 3, errors: ['Connection failed'] },
          'star',
          {
            latency: 1000,
            throughput: 0,
            reliability: 0.2,
            resourceUsage: { cpu: 0.9, memory: 0.8, network: 0.1 },
          }
        );

        loggerObserver.update(normalEvent);
        loggerObserver.update(errorEvent);

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining('Swarm update'),
          expect.objectContaining({ swarmId: 'test-swarm' })
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.stringContaining('Swarm error'),
          expect.objectContaining({ swarmId: 'error-swarm' })
        );
      });

      it('should have correct observer metadata', () => {
        expect(loggerObserver.getId()).toBe('logger-observer');
        expect(loggerObserver.getInterests()).toEqual(['swarm', 'mcp', 'neural']);
        expect(loggerObserver.getPriority()).toBe(1);
      });
    });

    describe('MetricsObserver', () => {
      let metricsObserver: MetricsObserver;

      beforeEach(() => {
        metricsObserver = new MetricsObserver();
      });

      it('should collect and aggregate metrics from events', () => {
        const event1 = EventBuilder.createSwarmEvent(
          'swarm1',
          'update',
          { healthy: true, activeAgents: 3, completedTasks: 10, errors: [] },
          'mesh',
          {
            latency: 50,
            throughput: 100,
            reliability: 0.95,
            resourceUsage: { cpu: 0.3, memory: 0.4, network: 0.5 },
          }
        );

        const event2 = EventBuilder.createMCPEvent(
          'session1',
          'tool_call',
          { tool: 'test_tool', args: {} },
          { latency: 25, success: true, tokenUsage: 150 }
        );

        metricsObserver.update(event1);
        metricsObserver.update(event2);

        const metrics = metricsObserver.getAggregatedMetrics();

        expect(metrics.swarm).toBeDefined();
        expect(metrics.swarm.totalEvents).toBe(1);
        expect(metrics.swarm.averageLatency).toBe(50);

        expect(metrics.mcp).toBeDefined();
        expect(metrics.mcp.totalEvents).toBe(1);
        expect(metrics.mcp.averageLatency).toBe(25);
      });

      it('should reset metrics when requested', () => {
        const event = EventBuilder.createNeuralEvent(
          'model1',
          'training_complete',
          { modelPath: '/models/test' },
          { accuracy: 0.92, loss: 0.08, epochs: 50, trainingTime: 1800 }
        );

        metricsObserver.update(event);
        metricsObserver.resetMetrics();

        const metrics = metricsObserver.getAggregatedMetrics();
        expect(metrics.neural?.totalEvents || 0).toBe(0);
      });
    });

    describe('WebSocketObserver', () => {
      let mockWebSocket: MockWebSocket;
      let wsObserver: WebSocketObserver;

      beforeEach(() => {
        mockWebSocket = {
          send: vi.fn(),
          readyState: 1, // WebSocket.OPEN
        };
        wsObserver = new WebSocketObserver(mockWebSocket as any);
      });

      it('should send events through WebSocket when connected', () => {
        const testEvent = EventBuilder.createSwarmEvent(
          'ws-test',
          'init',
          { healthy: true, activeAgents: 1, completedTasks: 0, errors: [] },
          'hierarchical',
          {
            latency: 60,
            throughput: 80,
            reliability: 0.94,
            resourceUsage: { cpu: 0.4, memory: 0.5, network: 0.6 },
          }
        );

        wsObserver.update(testEvent);

        expect(mockWebSocket.send).toHaveBeenCalledWith(
          JSON.stringify({
            type: 'event_notification',
            event: testEvent,
            timestamp: expect.any(String),
          })
        );
      });

      it('should not send when WebSocket is not connected', () => {
        mockWebSocket.readyState = 0; // WebSocket.CONNECTING

        const testEvent = EventBuilder.createMCPEvent(
          'session-test',
          'response',
          { result: 'test' },
          { latency: 20, success: true, tokenUsage: 100 }
        );

        wsObserver.update(testEvent);

        expect(mockWebSocket.send).not.toHaveBeenCalled();
      });
    });

    describe('DatabaseObserver', () => {
      let mockDatabase: MockDatabase;
      let mockLogger: MockLogger;
      let dbObserver: DatabaseObserver;

      beforeEach(() => {
        mockDatabase = {
          insert: vi.fn().mockResolvedValue('event-id-123'),
          update: vi.fn().mockResolvedValue(true),
          query: vi.fn().mockResolvedValue([]),
        };

        mockLogger = {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          debug: vi.fn(),
        };

        dbObserver = new DatabaseObserver(mockDatabase as any, mockLogger);
      });

      it('should persist events to database', async () => {
        const testEvent = EventBuilder.createNeuralEvent(
          'persist-test',
          'prediction',
          { input: 'test-data', prediction: 'positive' },
          { confidence: 0.87, processingTime: 15, modelVersion: '2.0.0' }
        );

        await dbObserver.update(testEvent);

        expect(mockDatabase.insert).toHaveBeenCalledWith(
          'system_events',
          expect.objectContaining({
            event_id: testEvent.id,
            event_type: testEvent.type,
            event_subtype: testEvent.subtype,
            payload: JSON.stringify(testEvent.payload),
          })
        );
      });

      it('should handle database errors gracefully', async () => {
        mockDatabase.insert.mockRejectedValue(new Error('Database connection failed'));

        const testEvent = EventBuilder.createSwarmEvent(
          'error-test',
          'update',
          { healthy: true, activeAgents: 1, completedTasks: 1, errors: [] },
          'ring',
          {
            latency: 70,
            throughput: 85,
            reliability: 0.91,
            resourceUsage: { cpu: 0.5, memory: 0.6, network: 0.7 },
          }
        );

        await expect(dbObserver.update(testEvent)).resolves.not.toThrow();

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to persist event to database:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Event System Integration (Hybrid TDD)', () => {
    let eventManager: SystemEventManager;
    let mockLogger: MockLogger;

    beforeEach(() => {
      mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      };
      eventManager = new SystemEventManager(mockLogger);
    });

    it('should handle complex event workflows with multiple observers', async () => {
      // Setup multiple observer types
      const loggerObserver = new LoggerObserver(mockLogger);
      const metricsObserver = new MetricsObserver();

      eventManager.subscribe('swarm', loggerObserver);
      eventManager.subscribe('mcp', loggerObserver);
      eventManager.subscribe('swarm', metricsObserver);
      eventManager.subscribe('mcp', metricsObserver);

      // Simulate a complex workflow
      const events = [
        EventBuilder.createSwarmEvent(
          'workflow-swarm',
          'init',
          { healthy: true, activeAgents: 0, completedTasks: 0, errors: [] },
          'mesh',
          {
            latency: 0,
            throughput: 0,
            reliability: 1,
            resourceUsage: { cpu: 0, memory: 0, network: 0 },
          }
        ),
        EventBuilder.createMCPEvent(
          'workflow-session',
          'tool_call',
          { tool: 'agent_spawn', args: { type: 'worker', count: 3 } },
          { latency: 30, success: true, tokenUsage: 200 }
        ),
        EventBuilder.createSwarmEvent(
          'workflow-swarm',
          'update',
          { healthy: true, activeAgents: 3, completedTasks: 0, errors: [] },
          'mesh',
          {
            latency: 45,
            throughput: 150,
            reliability: 0.98,
            resourceUsage: { cpu: 0.4, memory: 0.5, network: 0.6 },
          }
        ),
        EventBuilder.createMCPEvent(
          'workflow-session',
          'tool_call',
          {
            tool: 'task_orchestrate',
            args: { task: 'data_processing', agents: ['agent1', 'agent2', 'agent3'] },
          },
          { latency: 50, success: true, tokenUsage: 300 }
        ),
        EventBuilder.createSwarmEvent(
          'workflow-swarm',
          'update',
          { healthy: true, activeAgents: 3, completedTasks: 1, errors: [] },
          'mesh',
          {
            latency: 55,
            throughput: 180,
            reliability: 0.97,
            resourceUsage: { cpu: 0.7, memory: 0.8, network: 0.9 },
          }
        ),
      ];

      // Process workflow events
      for (const event of events) {
        await eventManager.notify(event);
      }

      // Verify logging occurred
      expect(mockLogger.info).toHaveBeenCalledTimes(5);

      // Verify metrics collection
      const metrics = metricsObserver.getAggregatedMetrics();
      expect(metrics.swarm.totalEvents).toBe(3);
      expect(metrics.mcp.totalEvents).toBe(2);
      expect(metrics.swarm.averageLatency).toBe((0 + 45 + 55) / 3);
      expect(metrics.mcp.averageLatency).toBe((30 + 50) / 2);
    });

    it('should maintain system performance under concurrent load', async () => {
      const performanceObserver: SystemObserver = {
        update: vi.fn().mockImplementation(() => {
          // Simulate some processing time
          return new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
        }),
        getInterests: () => ['swarm', 'mcp', 'neural'],
        getId: () => 'performance-observer',
        getPriority: () => 1,
      };

      eventManager.subscribe('swarm', performanceObserver);
      eventManager.subscribe('mcp', performanceObserver);
      eventManager.subscribe('neural', performanceObserver);

      const startTime = Date.now();
      const concurrentPromises: Promise<void>[] = [];

      // Generate 50 concurrent events of different types
      for (let i = 0; i < 50; i++) {
        const eventType = ['swarm', 'mcp', 'neural'][i % 3];
        let event: AllSystemEvents;

        switch (eventType) {
          case 'swarm':
            event = EventBuilder.createSwarmEvent(
              `concurrent-swarm-${i}`,
              'update',
              { healthy: true, activeAgents: i % 5, completedTasks: i, errors: [] },
              'hierarchical',
              {
                latency: 50 + (i % 10),
                throughput: 100 + (i % 20),
                reliability: 0.9 + (i % 10) / 100,
                resourceUsage: { cpu: 0.5, memory: 0.5, network: 0.5 },
              }
            );
            break;
          case 'mcp':
            event = EventBuilder.createMCPEvent(
              `concurrent-session-${i}`,
              'tool_call',
              { tool: `tool_${i}`, args: { index: i } },
              { latency: 20 + (i % 5), success: true, tokenUsage: 100 + (i % 50) }
            );
            break;
          default:
            event = EventBuilder.createNeuralEvent(
              `concurrent-model-${i}`,
              'prediction',
              { input: `data-${i}`, prediction: i % 2 === 0 ? 'positive' : 'negative' },
              {
                confidence: 0.8 + (i % 20) / 100,
                processingTime: 10 + (i % 5),
                modelVersion: '1.0.0',
              }
            );
        }

        concurrentPromises.push(eventManager.notify(event));
      }

      await Promise.all(concurrentPromises);
      const totalTime = Date.now() - startTime;

      // Should handle 50 concurrent events efficiently
      expect(totalTime).toBeLessThan(2000); // Less than 2 seconds
      expect(performanceObserver.update).toHaveBeenCalledTimes(50);

      const queueStats = eventManager.getQueueStats();
      expect(queueStats.processedCount).toBe(50);
      expect(queueStats.averageProcessingTime).toBeLessThan(100); // Average processing time reasonable
    });
  });

  describe('System Shutdown and Cleanup (London TDD)', () => {
    let eventManager: SystemEventManager;
    let mockLogger: MockLogger;

    beforeEach(() => {
      mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      };
      eventManager = new SystemEventManager(mockLogger);
    });

    it('should cleanup resources on shutdown', async () => {
      const mockObserver: SystemObserver = {
        update: vi.fn(),
        getInterests: () => ['swarm'],
        getId: () => 'cleanup-test',
        getPriority: () => 1,
      };

      eventManager.subscribe('swarm', mockObserver);

      await eventManager.shutdown();

      // Should clear observer stats after shutdown
      const stats = eventManager.getObserverStats();
      expect(stats).toHaveLength(0);

      // Queue should be cleared
      const queueStats = eventManager.getQueueStats();
      expect(queueStats.queueSize).toBe(0);
    });

    it('should handle shutdown gracefully even with pending events', async () => {
      const slowObserver: SystemObserver = {
        update: jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100))),
        getInterests: () => ['swarm'],
        getId: () => 'slow-observer',
        getPriority: () => 1,
      };

      eventManager.subscribe('swarm', slowObserver);

      // Queue up some events
      const eventPromises = [];
      for (let i = 0; i < 5; i++) {
        const event = EventBuilder.createSwarmEvent(
          `shutdown-test-${i}`,
          'update',
          { healthy: true, activeAgents: 1, completedTasks: i, errors: [] },
          'star',
          {
            latency: 40,
            throughput: 110,
            reliability: 0.96,
            resourceUsage: { cpu: 0.3, memory: 0.4, network: 0.5 },
          }
        );
        eventPromises.push(eventManager.notify(event));
      }

      // Shutdown should complete even with pending events
      const shutdownPromise = eventManager.shutdown();
      await expect(shutdownPromise).resolves.not.toThrow();

      // Wait for any remaining events to process
      await Promise.allSettled(eventPromises);
    });
  });
});
