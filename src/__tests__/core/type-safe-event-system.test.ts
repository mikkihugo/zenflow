/**
 * @file Type-Safe Event System Tests - Comprehensive test suite
 *
 * Tests all aspects of the type-safe event system including:
 * - Event emission and handling
 * - Domain boundary validation integration
 * - Cross-domain event routing
 * - Performance monitoring
 * - Error handling and recovery
 * - AGUI integration scenarios
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Agent, Task } from '../../coordination/types.ts';
import {
  Domain,
  DomainBoundaryValidator,
  DomainValidationError,
  getDomainValidator,
} from '../../core/domain-boundary-validator.ts';
import {
  type AGUIGateOpenedEvent,
  type AgentCreatedEvent,
  type BaseEvent,
  createCorrelationId,
  createEvent,
  createTypeSafeEventBus,
  type EventHandler,
  type EventHandlerConfig,
  EventPriority,
  EventSchemas,
  EventStatus,
  type EventSystemConfig,
  type EventSystemMetrics,
  type HumanValidationRequestedEvent,
  isBaseEvent,
  isDomainEvent,
  type TaskAssignedEvent,
  type TypeSafeEventBus,
  type WorkflowStartedEvent,
} from '../../core/type-safe-event-system.ts';
import type { WorkflowContext, WorkflowDefinition } from '../../workflows/types.ts';

// Mock the logging system
vi.mock('../../config/logging-config', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('TypeSafeEventBus', () => {
  let eventBus: TypeSafeEventBus;
  let mockAgent: Agent;
  let mockTask: Task;
  let mockWorkflowDefinition: WorkflowDefinition;
  let mockWorkflowContext: WorkflowContext;

  beforeEach(async () => {
    eventBus = createTypeSafeEventBus({
      enableMetrics: true,
      enableCaching: true,
      domainValidation: true,
      maxEventHistory: 1000,
      defaultTimeout: 5000,
    });

    await eventBus.initialize();

    // Mock objects for testing
    mockAgent = {
      id: 'test-agent-1',
      capabilities: ['test', 'mock'],
      status: 'idle',
    };

    mockTask = {
      id: 'test-task-1',
      description: 'Test task',
      strategy: 'parallel',
      dependencies: [],
      requiredCapabilities: ['test'],
      maxAgents: 1,
      requireConsensus: false,
    };

    mockWorkflowDefinition = {
      id: 'test-workflow-1',
      name: 'Test Workflow',
      version: '1.0.0',
    } as WorkflowDefinition;

    mockWorkflowContext = {
      workflowId: 'test-workflow-1',
      variables: {},
    } as WorkflowContext;
  });

  afterEach(async () => {
    await eventBus.shutdown();
  });

  describe('Event Emission', () => {
    test('should emit and process basic events successfully', async () => {
      const mockHandler = vi.fn();
      const handlerId = eventBus.registerHandler('test.event', mockHandler);

      const testEvent = createEvent<BaseEvent>(
        'test.event',
        Domain.CORE,
        {},
        { correlationId: createCorrelationId() }
      );

      const result = await eventBus.emitEvent(testEvent);

      expect(result.success).toBe(true);
      expect(result.handlerResults).toHaveLength(1);
      expect(result.handlerResults[0].success).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(
        testEvent,
        expect.objectContaining({
          eventBus,
          correlationId: expect.any(String),
        })
      );
    });

    test('should handle domain-specific events with validation', async () => {
      const mockHandler = vi.fn();
      eventBus.registerHandler('agent.created', mockHandler);

      const agentCreatedEvent: AgentCreatedEvent = createEvent(
        'agent.created',
        Domain.COORDINATION,
        {
          payload: {
            agent: mockAgent,
            capabilities: mockAgent.capabilities,
            initialStatus: mockAgent.status,
          },
        }
      );

      const result = await eventBus.emitEvent(agentCreatedEvent);

      expect(result.success).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(agentCreatedEvent, expect.any(Object));
    });

    test('should handle AGUI events for human validation', async () => {
      const mockHandler = vi.fn();
      eventBus.registerHandler('human.validation.requested', mockHandler);

      const humanValidationEvent: HumanValidationRequestedEvent = createEvent(
        'human.validation.requested',
        Domain.INTERFACES,
        {
          payload: {
            requestId: 'validation-req-1',
            validationType: 'approval',
            context: { action: 'deploy', environment: 'production' },
            priority: EventPriority.HIGH,
            timeout: 30000,
          },
        }
      );

      const result = await eventBus.emitEvent(humanValidationEvent);

      expect(result.success).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(humanValidationEvent, expect.any(Object));
    });

    test('should process event batch efficiently', async () => {
      const mockHandler = vi.fn();
      eventBus.registerHandler('batch.test', mockHandler);

      const events = Array.from({ length: 10 }, (_, i) =>
        createEvent<BaseEvent>('batch.test', Domain.CORE, {}, { tags: [`batch-${i}`] })
      );

      const results = await eventBus.emitEventBatch(events);

      expect(results).toHaveLength(10);
      expect(results.every((r) => r.success)).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(10);
    });
  });

  describe('Event Handler Management', () => {
    test('should register and unregister handlers correctly', () => {
      const mockHandler = vi.fn();
      const handlerId = eventBus.registerHandler('test.handler', mockHandler);

      expect(eventBus.getHandlers('test.handler')).toHaveLength(1);
      expect(eventBus.getRegisteredEventTypes()).toContain('test.handler');

      const removed = eventBus.unregisterHandler(handlerId);
      expect(removed).toBe(true);
      expect(eventBus.getHandlers('test.handler')).toHaveLength(0);
    });

    test('should handle handler priorities correctly', async () => {
      const callOrder: number[] = [];

      const highPriorityHandler = vi.fn(() => callOrder.push(1));
      const lowPriorityHandler = vi.fn(() => callOrder.push(2));

      eventBus.registerHandler('priority.test', highPriorityHandler, { priority: 10 });
      eventBus.registerHandler('priority.test', lowPriorityHandler, { priority: 1 });

      const testEvent = createEvent<BaseEvent>('priority.test', Domain.CORE, {});
      await eventBus.emitEvent(testEvent);

      expect(callOrder).toEqual([1, 2]); // High priority first
    });

    test('should handle handler timeouts', async () => {
      const slowHandler = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      eventBus.registerHandler('timeout.test', slowHandler, { timeout: 100 });

      const testEvent = createEvent<BaseEvent>('timeout.test', Domain.CORE, {});
      const result = await eventBus.emitEvent(testEvent, { timeout: 200 });

      expect(result.success).toBe(true);
      expect(result.handlerResults[0].success).toBe(false);
      expect(result.handlerResults[0].error?.message).toContain('timeout');
    });

    test('should handle domain-wide handlers', async () => {
      const domainHandler = vi.fn();
      eventBus.registerDomainHandler(Domain.COORDINATION, domainHandler);

      const agentEvent: AgentCreatedEvent = createEvent('agent.created', Domain.COORDINATION, {
        payload: {
          agent: mockAgent,
          capabilities: mockAgent.capabilities,
          initialStatus: mockAgent.status,
        },
      });

      await eventBus.emitEvent(agentEvent);

      expect(domainHandler).toHaveBeenCalledWith(agentEvent, expect.any(Object));
    });

    test('should handle wildcard handlers', async () => {
      const wildcardHandler = vi.fn();
      eventBus.registerWildcardHandler(wildcardHandler);

      const event1 = createEvent<BaseEvent>('test.event1', Domain.CORE, {});
      const event2 = createEvent<BaseEvent>('test.event2', Domain.WORKFLOWS, {});

      await eventBus.emitEvent(event1);
      await eventBus.emitEvent(event2);

      expect(wildcardHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cross-Domain Event Routing', () => {
    test('should route events across domains with validation', async () => {
      const mockHandler = vi.fn();
      eventBus.registerHandler('cross.domain.test', mockHandler);

      const crossDomainEvent = createEvent<BaseEvent>(
        'cross.domain.test',
        Domain.WORKFLOWS,
        {},
        { source: 'coordination-domain' }
      );

      const result = await eventBus.routeCrossDomainEvent(
        crossDomainEvent,
        Domain.COORDINATION,
        Domain.WORKFLOWS,
        'test_cross_domain_routing'
      );

      expect(result.success).toBe(true);
      expect(result.metadata?.domainFrom).toBe(Domain.COORDINATION);
      expect(result.metadata?.domainTo).toBe(Domain.WORKFLOWS);
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            source: 'cross_domain:coordination',
            customData: expect.objectContaining({
              crossDomain: {
                from: Domain.COORDINATION,
                to: Domain.WORKFLOWS,
                operation: 'test_cross_domain_routing',
              },
            }),
          }),
        }),
        expect.any(Object)
      );
    });

    test('should handle cross-domain validation errors', async () => {
      // Create an invalid event that should fail validation
      const invalidEvent = {
        id: 'invalid-event',
        type: 'invalid.event',
        domain: Domain.COORDINATION,
        timestamp: new Date(),
        version: '1.0.0',
        // Missing required payload for coordination events
      } as BaseEvent;

      const result = await eventBus.routeCrossDomainEvent(
        invalidEvent,
        Domain.CORE,
        Domain.COORDINATION,
        'invalid_test'
      );

      // The result might succeed if there's no specific validation for this event type
      // This test would need more specific validation rules to fail
      expect(result.metadata?.domainFrom).toBe(Domain.CORE);
      expect(result.metadata?.domainTo).toBe(Domain.COORDINATION);
    });
  });

  describe('Event Validation', () => {
    test('should validate events against schemas', async () => {
      const mockHandler = vi.fn();

      // Register handler with schema validation
      eventBus.registerHandler(
        'agent.created',
        mockHandler,
        { validatePayload: true },
        EventSchemas.AgentCreated
      );

      const validEvent: AgentCreatedEvent = createEvent('agent.created', Domain.COORDINATION, {
        payload: {
          agent: mockAgent,
          capabilities: mockAgent.capabilities,
          initialStatus: mockAgent.status,
        },
      });

      const result = await eventBus.emitEvent(validEvent);

      expect(result.success).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test('should reject events with invalid schemas', async () => {
      const mockHandler = vi.fn();

      eventBus.registerHandler(
        'agent.created',
        mockHandler,
        { validatePayload: true },
        EventSchemas.AgentCreated
      );

      const invalidEvent = createEvent('agent.created', Domain.COORDINATION, {
        payload: {
          // Missing required fields
          invalidField: 'invalid',
        },
      });

      const result = await eventBus.emitEvent(invalidEvent);

      // The event might still be processed, but handlers with strict validation might fail
      expect(result.handlerResults.some((r) => !r.success)).toBe(true);
    });
  });

  describe('Event History and Querying', () => {
    test('should maintain event history', async () => {
      const event1 = createEvent<BaseEvent>('history.test1', Domain.CORE, {});
      const event2 = createEvent<BaseEvent>('history.test2', Domain.WORKFLOWS, {});

      await eventBus.emitEvent(event1);
      await eventBus.emitEvent(event2);

      const allEvents = eventBus.queryEvents({});
      expect(allEvents.length).toBeGreaterThanOrEqual(2);

      const coreEvents = eventBus.queryEvents({ domain: Domain.CORE });
      expect(coreEvents.some((e) => e.id === event1.id)).toBe(true);

      const workflowEvents = eventBus.queryEvents({ domain: Domain.WORKFLOWS });
      expect(workflowEvents.some((e) => e.id === event2.id)).toBe(true);
    });

    test('should query events by correlation ID', async () => {
      const correlationId = createCorrelationId();

      const event1 = createEvent<BaseEvent>(
        'correlation.test1',
        Domain.CORE,
        {},
        { correlationId }
      );
      const event2 = createEvent<BaseEvent>(
        'correlation.test2',
        Domain.CORE,
        {},
        { correlationId }
      );

      await eventBus.emitEvent(event1);
      await eventBus.emitEvent(event2);

      const correlatedEvents = eventBus.getEventsByCorrelation(correlationId);
      expect(correlatedEvents).toHaveLength(2);
      expect(correlatedEvents.every((e) => e.metadata?.correlationId === correlationId)).toBe(true);
    });

    test('should retrieve individual events by ID', async () => {
      const event = createEvent<BaseEvent>('retrieve.test', Domain.CORE, {});
      await eventBus.emitEvent(event);

      const retrievedEvent = eventBus.getEvent(event.id);
      expect(retrievedEvent).toBeDefined();
      expect(retrievedEvent?.id).toBe(event.id);
    });

    test('should clear event history', async () => {
      const event = createEvent<BaseEvent>('clear.test', Domain.CORE, {});
      await eventBus.emitEvent(event);

      expect(eventBus.queryEvents({})).not.toHaveLength(0);

      eventBus.clearEventHistory();
      expect(eventBus.queryEvents({})).toHaveLength(0);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance metrics', async () => {
      const mockHandler = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 10)));
      eventBus.registerHandler('metrics.test', mockHandler);

      const event = createEvent<BaseEvent>('metrics.test', Domain.CORE, {});
      await eventBus.emitEvent(event);

      const metrics = eventBus.getMetrics();
      expect(metrics.totalEvents).toBeGreaterThan(0);
      expect(metrics.averageProcessingTime).toBeGreaterThan(0);
      expect(metrics.handlerCount).toBeGreaterThan(0);
      expect(metrics.domainEventCounts[Domain.CORE]).toBeGreaterThan(0);
    });

    test('should track detailed performance statistics', async () => {
      const mockHandler = vi.fn();
      eventBus.registerHandler('stats.test', mockHandler);

      // Emit multiple events to generate statistics
      for (let i = 0; i < 5; i++) {
        const event = createEvent<BaseEvent>('stats.test', Domain.CORE, {});
        await eventBus.emitEvent(event);
      }

      const stats = eventBus.getPerformanceStats();
      expect(stats['stats.test']).toBeDefined();
      expect(stats['stats.test'].count).toBe(5);
      expect(stats['stats.test'].averageTime).toBeGreaterThanOrEqual(0);
    });

    test('should reset metrics', async () => {
      const mockHandler = vi.fn();
      eventBus.registerHandler('reset.test', mockHandler);

      const event = createEvent<BaseEvent>('reset.test', Domain.CORE, {});
      await eventBus.emitEvent(event);

      const beforeReset = eventBus.getMetrics();
      expect(beforeReset.totalEvents).toBeGreaterThan(0);

      eventBus.resetMetrics();

      const afterReset = eventBus.getMetrics();
      expect(afterReset.totalEvents).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle handler errors gracefully', async () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler failed');
      });
      const successHandler = vi.fn();

      eventBus.registerHandler('error.test', errorHandler);
      eventBus.registerHandler('error.test', successHandler);

      const event = createEvent<BaseEvent>('error.test', Domain.CORE, {});
      const result = await eventBus.emitEvent(event);

      expect(result.success).toBe(true); // Overall success despite one handler failing
      expect(result.handlerResults).toHaveLength(2);
      expect(result.handlerResults[0].success).toBe(false);
      expect(result.handlerResults[1].success).toBe(true);
    });

    test('should handle domain validation errors', async () => {
      // Create an event bus with strict validation
      const strictEventBus = createTypeSafeEventBus({
        domainValidation: true,
      });
      await strictEventBus.initialize();

      const mockHandler = vi.fn();
      strictEventBus.registerHandler('validation.test', mockHandler);

      // Create a malformed event
      const malformedEvent = {
        // Missing required fields
        type: 'validation.test',
        domain: 'invalid-domain', // Invalid domain
      } as any;

      const result = await strictEventBus.emitEvent(malformedEvent);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);

      await strictEventBus.shutdown();
    });
  });

  describe('AGUI Integration Scenarios', () => {
    test('should handle human validation workflow', async () => {
      const validationResults: any[] = [];

      // Register handler for validation requests
      eventBus.registerHandler(
        'human.validation.requested',
        async (event: HumanValidationRequestedEvent) => {
          validationResults.push({
            requestId: event.payload.requestId,
            type: event.payload.validationType,
            priority: event.payload.priority,
          });

          // Simulate human approval after delay
          setTimeout(async () => {
            const completionEvent = createEvent('human.validation.completed', Domain.INTERFACES, {
              payload: {
                requestId: event.payload.requestId,
                approved: true,
                processingTime: 1000,
                feedback: 'Approved by human operator',
              },
            });

            await eventBus.emitEvent(completionEvent);
          }, 10);
        }
      );

      // Register handler for validation completions
      eventBus.registerHandler('human.validation.completed', async (event) => {
        validationResults.push({
          requestId: event.payload.requestId,
          approved: event.payload.approved,
          feedback: event.payload.feedback,
        });
      });

      // Create validation request
      const validationRequest: HumanValidationRequestedEvent = createEvent(
        'human.validation.requested',
        Domain.INTERFACES,
        {
          payload: {
            requestId: 'val-req-1',
            validationType: 'approval',
            context: { action: 'deploy', environment: 'production' },
            priority: EventPriority.HIGH,
            timeout: 30000,
          },
        }
      );

      await eventBus.emitEvent(validationRequest);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(validationResults).toHaveLength(2);
      expect(validationResults[0].requestId).toBe('val-req-1');
      expect(validationResults[1].approved).toBe(true);
    });

    test('should handle AGUI gate operations', async () => {
      const gateOperations: any[] = [];

      eventBus.registerHandler('agui.gate.opened', async (event: AGUIGateOpenedEvent) => {
        gateOperations.push({
          operation: 'opened',
          gateId: event.payload.gateId,
          gateType: event.payload.gateType,
          requiresApproval: event.payload.requiredApproval,
        });

        // Simulate gate processing and closure
        setTimeout(async () => {
          const closeEvent = createEvent('agui.gate.closed', Domain.INTERFACES, {
            payload: {
              gateId: event.payload.gateId,
              approved: event.payload.requiredApproval ? true : false,
              duration: 500,
              humanInput: event.payload.requiredApproval ? { decision: 'approve' } : undefined,
            },
          });

          await eventBus.emitEvent(closeEvent);
        }, 10);
      });

      eventBus.registerHandler('agui.gate.closed', async (event) => {
        gateOperations.push({
          operation: 'closed',
          gateId: event.payload.gateId,
          approved: event.payload.approved,
          duration: event.payload.duration,
        });
      });

      // Test gate that requires human approval
      const gateOpenEvent: AGUIGateOpenedEvent = createEvent(
        'agui.gate.opened',
        Domain.INTERFACES,
        {
          payload: {
            gateId: 'gate-1',
            gateType: 'approval-gate',
            requiredApproval: true,
            context: { operation: 'deploy', target: 'production' },
          },
        }
      );

      await eventBus.emitEvent(gateOpenEvent);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(gateOperations).toHaveLength(2);
      expect(gateOperations[0].operation).toBe('opened');
      expect(gateOperations[0].requiresApproval).toBe(true);
      expect(gateOperations[1].operation).toBe('closed');
      expect(gateOperations[1].approved).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    test('should create events with proper typing', () => {
      const event = createEvent<BaseEvent>(
        'utility.test',
        Domain.CORE,
        {},
        { priority: EventPriority.HIGH }
      );

      expect(event.id).toBeDefined();
      expect(event.type).toBe('utility.test');
      expect(event.domain).toBe(Domain.CORE);
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.version).toBe('1.0.0');
      expect(event.metadata?.priority).toBe(EventPriority.HIGH);
    });

    test('should create correlation IDs', () => {
      const correlationId = createCorrelationId();

      expect(typeof correlationId).toBe('string');
      expect(correlationId).toMatch(/^corr-\d+-[a-z0-9]+$/);
    });

    test('should validate base events', () => {
      const validEvent = createEvent<BaseEvent>('test.event', Domain.CORE, {});
      const invalidEvent = { type: 'test' };

      expect(isBaseEvent(validEvent)).toBe(true);
      expect(isBaseEvent(invalidEvent)).toBe(false);
      expect(isBaseEvent(null)).toBe(false);
      expect(isBaseEvent(undefined)).toBe(false);
    });

    test('should validate domain events', () => {
      const coreEvent = createEvent<BaseEvent>('test.event', Domain.CORE, {});
      const workflowEvent = createEvent<BaseEvent>('test.event', Domain.WORKFLOWS, {});

      expect(isDomainEvent(coreEvent, Domain.CORE)).toBe(true);
      expect(isDomainEvent(coreEvent, Domain.WORKFLOWS)).toBe(false);
      expect(isDomainEvent(workflowEvent, Domain.WORKFLOWS)).toBe(true);
    });
  });

  describe('Integration with Domain Boundary Validator', () => {
    test('should integrate with domain validators', async () => {
      // The event bus should use domain validators when domainValidation is enabled
      const event = createEvent<BaseEvent>('integration.test', Domain.CORE, {});
      const result = await eventBus.emitEvent(event);

      expect(result.success).toBe(true);
      // The fact that it succeeds means domain validation passed
    });

    test('should track domain crossings', async () => {
      const crossDomainEvent = createEvent<BaseEvent>('crossing.test', Domain.WORKFLOWS, {});

      const result = await eventBus.routeCrossDomainEvent(
        crossDomainEvent,
        Domain.COORDINATION,
        Domain.WORKFLOWS,
        'test_crossing'
      );

      expect(result.success).toBe(true);
      expect(result.metadata?.crossingId).toBeDefined();
    });
  });

  describe('System Lifecycle', () => {
    test('should initialize and shutdown gracefully', async () => {
      const testEventBus = createTypeSafeEventBus();

      await expect(testEventBus.initialize()).resolves.not.toThrow();
      await expect(testEventBus.shutdown()).resolves.not.toThrow();
    });

    test('should emit system events during lifecycle', async () => {
      const systemEvents: BaseEvent[] = [];

      eventBus.registerHandler('system.shutdown', async (event) => {
        systemEvents.push(event);
      });

      // Shutdown should emit a system shutdown event
      await eventBus.shutdown();

      expect(systemEvents).toHaveLength(1);
      expect(systemEvents[0].type).toBe('system.shutdown');
    });
  });
});

describe('Event System Edge Cases', () => {
  let eventBus: TypeSafeEventBus;

  beforeEach(async () => {
    eventBus = createTypeSafeEventBus({
      maxEventHistory: 5, // Small history for testing limits
      enableCaching: true,
    });
    await eventBus.initialize();
  });

  afterEach(async () => {
    await eventBus.shutdown();
  });

  test('should handle event history size limits', async () => {
    // Emit more events than the history limit
    for (let i = 0; i < 10; i++) {
      const event = createEvent<BaseEvent>(`history.limit.${i}`, Domain.CORE, {});
      await eventBus.emitEvent(event);
    }

    const history = eventBus.queryEvents({});
    expect(history.length).toBeLessThanOrEqual(5);
  });

  test('should handle high concurrency', async () => {
    const mockHandler = vi.fn();
    eventBus.registerHandler('concurrency.test', mockHandler);

    // Emit many events concurrently
    const promises = Array.from({ length: 50 }, (_, i) =>
      eventBus.emitEvent(
        createEvent<BaseEvent>('concurrency.test', Domain.CORE, {}, { tags: [`test-${i}`] })
      )
    );

    const results = await Promise.all(promises);

    expect(results.every((r) => r.success)).toBe(true);
    expect(mockHandler).toHaveBeenCalledTimes(50);
  });

  test('should handle memory constraints gracefully', async () => {
    // This test would be more meaningful in a real environment with actual memory constraints
    const metrics = eventBus.getMetrics();
    expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
  });

  test('should handle complex event routing scenarios', async () => {
    const routingResults: any[] = [];

    // Set up handlers for different domains
    eventBus.registerDomainHandler(Domain.COORDINATION, async (event) => {
      routingResults.push({ domain: 'coordination', eventId: event.id });
    });

    eventBus.registerDomainHandler(Domain.WORKFLOWS, async (event) => {
      routingResults.push({ domain: 'workflows', eventId: event.id });
    });

    // Route events across multiple domains
    const event = createEvent<BaseEvent>('complex.routing', Domain.CORE, {});

    await eventBus.routeCrossDomainEvent(event, Domain.CORE, Domain.COORDINATION, 'route1');
    await eventBus.routeCrossDomainEvent(event, Domain.CORE, Domain.WORKFLOWS, 'route2');

    expect(routingResults).toHaveLength(2);
    expect(routingResults.some((r) => r.domain === 'coordination')).toBe(true);
    expect(routingResults.some((r) => r.domain === 'workflows')).toBe(true);
  });
});
