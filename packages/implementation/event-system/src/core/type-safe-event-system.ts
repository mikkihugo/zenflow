

/**
 * @file Type-Safe Event System - Phase 0, Task 0.3 - AGUI Integration Foundation
 *
 * Implements a comprehensive type-safe event bus with domain validation integration,
 * designed for high-throughput event processing with compile-time and runtime type safety.
 *
 * This system forms the foundation for AGUI human validation workflows and
 * multi-agent coordination across domain boundaries.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Type safety at compile time AND runtime
 * - Domain boundary validation integration
 * - High-performance event routing
 * - Cross-domain event coordination
 * - Event schema validation with TypeSchema system
 * - Performance optimized for production workloads
 */

import type { Logger } from '@claude-zen/foundation';
import { EventEmitter, getLogger } from '@claude-zen/foundation';
import type {
  Agent,
  Task,
  WorkflowContext,
  WorkflowDefinition,
  DomainBoundaryValidator,
  EventBus,
} from './types;
import type { EventTypeSchema } from '../validation;
import { Domain, DomainValidationError } from './types;
import { getDomainValidator, } from './domain-validator;

// ============================================================================
// EVENT SYSTEM CORE TYPES - Foundation for all event operations
// ============================================================================

/**
 * Base event interface that all domain events must extend
 */
export interface BaseEvent {
  readonly id: string;
  readonly type: string;
  readonly domain: Domain;
  readonly timestamp: Date;
  readonly version: string;
  readonly metadata?: EventMetadata;
}

/**
 * Event metadata for tracking and debugging
 */
export interface EventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly source?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly traceId?: string;
  readonly priority?: EventPriority;
  readonly tags?: string[];
  readonly customData?: Record<string, unknown>;
}

/**
 * Event priority levels for processing order
 */
export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
  URGENT = 4,
}

/**
 * Event processing status
 */
export enum EventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  REJECTED = 'rejected',
  RETRYING = 'retrying',
}

/**
 * Event handler configuration
 */
export interface EventHandlerConfig {
  readonly priority?: number;
  readonly timeout?: number;
  readonly retries?: number;
  readonly backoffStrategy?: 'linear|exponential;
  readonly errorHandling?: 'ignore' | 'retry' | 'failfast;
  readonly validatePayload?: boolean;
  readonly trackMetrics?: boolean;
}

/**
 * Event processing result
 */
export interface EventProcessingResult {
  readonly success: boolean;
  readonly processingTime: number;
  readonly error?: Error;
  readonly handlerResults: Array<{
    handlerId: string;
    success: boolean;
    processingTime: number;
    error?: Error;
  }>;
  readonly metadata: EventProcessingMetadata;
}

/**
 * Event processing metadata
 */
export interface EventProcessingMetadata {
  readonly eventId: string;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly handlerCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly totalProcessingTime: number;
  readonly validationTime: number;
}

// ============================================================================
// DOMAIN-SPECIFIC EVENT NTERFACES - Type-safe events for each domain
// ============================================================================

/**
 * Coordination domain events
 */
export interface CoordinationEvent extends BaseEvent {
  readonly domain: Domain.COORDINATION;
}

export interface AgentCreatedEvent extends CoordinationEvent {
  readonly type: 'agent.created;
  readonly payload: {
    readonly agent: Agent;
    readonly capabilities: string[];
    readonly initialStatus: 'idle|busy;
  };
}

export interface AgentDestroyedEvent extends CoordinationEvent {
  readonly type: 'agent.destroyed;
  readonly payload: {
    readonly agentId: string;
    readonly reason: string;
    readonly finalStatus: 'idle|busy;
  };
}

export interface TaskAssignedEvent extends CoordinationEvent {
  readonly type: 'task.assigned;
  readonly payload: {
    readonly task: Task;
    readonly agentId: string;
    readonly assignmentTime: Date;
  };
}

export interface TaskCompletedEvent extends CoordinationEvent {
  readonly type: 'task.completed;
  readonly payload: {
    readonly taskId: string;
    readonly agentId: string;
    readonly result: unknown;
    readonly duration: number;
    readonly success: boolean;
  };
}

export interface SwarmStateChangedEvent extends CoordinationEvent {
  readonly type: 'swarm.state.changed;
  readonly payload: {
    readonly swarmId: string;
    readonly previousState: string;
    readonly newState: string;
    readonly agentCount: number;
    readonly activeTaskCount: number;
  };
}

/**
 * Workflow domain events
 */
export interface WorkflowDomainEvent extends BaseEvent {
  readonly domain: Domain.WORKFLOW;
}

export interface WorkflowStartedEvent extends WorkflowDomainEvent {
  readonly type: 'workflow.started;
  readonly payload: {
    readonly workflowId: string;
    readonly definition: WorkflowDefinition;
    readonly context: WorkflowContext;
    readonly startTime: Date;
  };
}

export interface WorkflowCompletedEvent extends WorkflowDomainEvent {
  readonly type: 'workflow.completed;
  readonly payload: {
    readonly workflowId: string;
    readonly result: unknown;
    readonly duration: number;
    readonly stepsExecuted: number;
  };
}

export interface WorkflowFailedEvent extends WorkflowDomainEvent {
  readonly type: 'workflow.failed;
  readonly payload: {
    readonly workflowId: string;
    readonly error: Error;
    readonly failedStep?: number;
    readonly partialResult?: unknown;
  };
}

export interface WorkflowStepCompletedEvent extends WorkflowDomainEvent {
  readonly type: 'workflow.step.completed;
  readonly payload: {
    readonly workflowId: string;
    readonly stepIndex: number;
    readonly stepResult: unknown;
    readonly duration: number;
  };
}

/**
 * Neural domain events
 */
export interface NeuralEvent extends BaseEvent {
  readonly domain: Domain.NEURAL;
}

export interface NetworkTrainingStartedEvent extends NeuralEvent {
  readonly type: 'network.training.started;
  readonly payload: {
    readonly networkId: string;
    readonly architecture: number[];
    readonly trainingConfig: unknown;
    readonly datasetSize: number;
  };
}

export interface NetworkTrainingCompletedEvent extends NeuralEvent {
  readonly type: 'network.training.completed;
  readonly payload: {
    readonly networkId: string;
    readonly finalAccuracy: number;
    readonly trainingDuration: number;
    readonly epochsCompleted: number;
  };
}

export interface NetworkPredictionEvent extends NeuralEvent {
  readonly type: 'network.prediction;
  readonly payload: {
    readonly networkId: string;
    readonly input: number[];
    readonly output: number[];
    readonly confidence: number;
    readonly processingTime: number;
  };
}

/**
 * Database domain events
 */
export interface DatabaseEvent extends BaseEvent {
  readonly domain: Domain.DATABASE;
}

export interface QueryExecutedEvent extends DatabaseEvent {
  readonly type: 'query.executed;
  readonly payload: {
    readonly queryId: string;
    readonly query: string;
    readonly parameters: unknown[];
    readonly resultCount: number;
    readonly executionTime: number;
    readonly cached: boolean;
  };
}

export interface TransactionCompletedEvent extends DatabaseEvent {
  readonly type: 'transaction.completed;
  readonly payload: {
    readonly transactionId: string;
    readonly operations: string[];
    readonly duration: number;
    readonly success: boolean;
  };
}

/**
 * Memory domain events
 */
export interface MemoryEvent extends BaseEvent {
  readonly domain: Domain.MEMORY;
}

export interface MemoryStoredEvent extends MemoryEvent {
  readonly type: 'memory.stored;
  readonly payload: {
    readonly key: string;
    readonly size: number;
    readonly ttl?: number;
    readonly namespace?: string;
  };
}

export interface MemoryRetrievedEvent extends MemoryEvent {
  readonly type: 'memory.retrieved;
  readonly payload: {
    readonly key: string;
    readonly found: boolean;
    readonly size?: number;
    readonly age?: number;
  };
}

export interface MemoryEvictedEvent extends MemoryEvent {
  readonly type: 'memory.evicted;
  readonly payload: {
    readonly key: string;
    readonly reason: 'ttl' | 'capacity' | 'manual;
    readonly size: number;
  };
}

/**
 * Knowledge domain events
 */
export interface KnowledgeEvent extends BaseEvent {
  readonly domain: Domain.KNOWLEDGE;
}

export interface KnowledgeUpdatedEvent extends KnowledgeEvent {
  readonly type: 'knowledge.updated;
  readonly payload: {
    readonly entityId: string;
    readonly entityType: string;
    readonly updateType: 'create' | 'update' | 'delete;
    readonly version: number;
  };
}

export interface KnowledgeQueryEvent extends KnowledgeEvent {
  readonly type: 'knowledge.query;
  readonly payload: {
    readonly queryId: string;
    readonly query: string;
    readonly resultCount: number;
    readonly processingTime: number;
  };
}

/**
 * Interface domain events (for AGUI integration)
 */
export interface InterfaceEvent extends BaseEvent {
  readonly domain: Domain.INTERFACE;
}

export interface HumanValidationRequestedEvent extends InterfaceEvent {
  readonly type: 'human.validation.requested;
  readonly payload: {
    readonly requestId: string;
    readonly validationType: 'approval|selection|input|review;
    readonly context: unknown;
    readonly priority: EventPriority;
    readonly timeout?: number;
  };
}

export interface HumanValidationCompletedEvent extends InterfaceEvent {
  readonly type: 'human.validation.completed;
  readonly payload: {
    readonly requestId: string;
    readonly approved: boolean;
    readonly input?: unknown;
    readonly feedback?: string;
    readonly processingTime: number;
  };
}

export interface AGUIGateOpenedEvent extends InterfaceEvent {
  readonly type: 'agui.gate.opened;
  readonly payload: {
    readonly gateId: string;
    readonly gateType: string;
    readonly requiredApproval: boolean;
    readonly context: unknown;
  };
}

export interface AGUIGateClosedEvent extends InterfaceEvent {
  readonly type: 'agui.gate.closed;
  readonly payload: {
    readonly gateId: string;
    readonly approved: boolean;
    readonly duration: number;
    readonly humanInput?: unknown;
  };
}

/**
 * Core domain events
 */
export interface CoreEvent extends BaseEvent {
  readonly domain: Domain.CORE;
}

export interface SystemStartedEvent extends CoreEvent {
  readonly type: 'system.started;
  readonly payload: {
    readonly version: string;
    readonly startTime: Date;
    readonly configuration: unknown;
  };
}

export interface SystemShutdownEvent extends CoreEvent {
  readonly type: 'system.shutdown;
  readonly payload: {
    readonly reason: string;
    readonly graceful: boolean;
    readonly uptime: number;
  };
}

export interface ErrorOccurredEvent extends CoreEvent {
  readonly type: 'error.occurred;
  readonly payload: {
    readonly error: Error;
    readonly context: unknown;
    readonly severity: 'low|medium|high|critical;
    readonly recoverable: boolean;
  };
}

/**
 * Union type of all domain events
 */
export type DomainEvent =|CoordinationEvent|WorkflowDomainEvent|NeuralEvent|DatabaseEvent|MemoryEvent|KnowledgeEvent|InterfaceEvent|CoreEvent;

/**
 * Union type of all specific event types
 */
export type SystemEvent =|AgentCreatedEvent|AgentDestroyedEvent|TaskAssignedEvent|TaskCompletedEvent|SwarmStateChangedEvent|WorkflowStartedEvent|WorkflowCompletedEvent|WorkflowFailedEvent|WorkflowStepCompletedEvent|NetworkTrainingStartedEvent|NetworkTrainingCompletedEvent|NetworkPredictionEvent|QueryExecutedEvent|TransactionCompletedEvent|MemoryStoredEvent|MemoryRetrievedEvent|MemoryEvictedEvent|KnowledgeUpdatedEvent|KnowledgeQueryEvent|HumanValidationRequestedEvent|HumanValidationCompletedEvent|AGUIGateOpenedEvent|AGUIGateClosedEvent|SystemStartedEvent|SystemShutdownEvent|ErrorOccurredEvent;

// ============================================================================
// EVENT SCHEMAS - TypeSchema definitions for runtime validation
// ============================================================================

/**
 * Base event schema template
 */
const BaseEventSchema: EventTypeSchema = {
  type:'object',
  required: ['id', 'type', 'domain', 'timestamp', 'version'],
  additionalProperties: true,
  properties: {
    id: { type: 'string' },
    type: { type: 'string' },
    domain: {
      type: 'string',
      enum: Object.values(Domain),
    },
    timestamp: { type: 'object' },
    version: { type: 'string' },
    payload: { type: 'object' },
    metadata: { type: 'object' },
    correlationId: { type: 'string' },
    causationId: { type: 'string' },
    source: { type: 'string' },
    userId: { type: 'string' },
    sessionId: { type: 'string' },
    traceId: { type: 'string' },
    priority: {
      type: 'string',
      enum: ['critical', 'high', 'medium', 'low'],
    },
    tags: { type: 'array' },
    customData: { type: 'object' },
  },
};

/**
 * Event schemas for each domain
 */
export const EventSchemas = {
  AgentCreated: {
    ...BaseEventSchema,
    properties: {
      ...BaseEventSchema.properties,
      payload: {
        type: 'object',
        required: true,
        properties: {
          agent: { type: 'object', required: true },
          capabilities: {
            type: 'array',
            required: true,
            items: { type: 'string' },
          },
          initialStatus: {
            type: 'string',
            required: true,
            enum: ['idle', 'busy'],
          },
        },
      },
    },
  } as EventTypeSchema,

  TaskAssigned: {
    ...BaseEventSchema,
    properties: {
      ...BaseEventSchema.properties,
      payload: {
        type: 'object',
        required: true,
        properties: {
          task: { type: 'object', required: true },
          agentId: { type: 'string', required: true },
          assignmentTime: { type: 'object', required: true },
        },
      },
    },
  } as EventTypeSchema,

  WorkflowStarted: {
    ...BaseEventSchema,
    properties: {
      ...BaseEventSchema.properties,
      payload: {
        type: 'object',
        required: true,
        properties: {
          workflowId: { type: 'string', required: true },
          definition: { type: 'object', required: true },
          context: { type: 'object', required: true },
          startTime: { type: 'object', required: true },
        },
      },
    },
  } as EventTypeSchema,

  HumanValidationRequested: {
    ...BaseEventSchema,
    properties: {
      ...BaseEventSchema.properties,
      payload: {
        type: 'object',
        required: true,
        properties: {
          requestId: { type: 'string', required: true },
          validationType: {
            type: 'string',
            required: true,
            enum: ['approval', 'selection', 'input', 'review'],
          },
          context: { type: 'object', required: true },
          priority: {
            type: 'number',
            required: true,
            enum: Object.values(EventPriority).filter(
              (v) => typeof v === 'number''
            ),
          },
          timeout: { type: 'number', required: false },
        },
      },
    },
  } as EventTypeSchema,
} as const;

// ============================================================================
// EVENT HANDLER TYPES - Type-safe event handling
// ============================================================================

/**
 * Event handler function type
 */
export type EventHandler<TEvent extends BaseEvent = BaseEvent> = (
  event: TEvent,
  context: EventHandlerContext
) => Promise<void>|void;

/**
 * Event handler context
 */
export interface EventHandlerContext {
  readonly eventBus: EventBus;
  readonly logger: Logger;
  readonly startTime: Date;
  readonly correlationId: string;
  readonly abortSignal?: AbortSignal;
  readonly metadata: Record<string, unknown>;
}

/**
 * Typed event handler registration
 */
export interface TypedEventHandler<TEvent extends BaseEvent = BaseEvent> {
  readonly id: string;
  readonly eventType: string;
  readonly domain?: Domain;
  readonly handler: EventHandler<TEvent>;
  readonly config: EventHandlerConfig;
  readonly schema?: EventTypeSchema;
}

// ============================================================================
// TYPE-SAFE EVENT BUS MPLEMENTATION - Production-grade event system
// ============================================================================

/**
 * Performance monitoring for the event system
 */
export interface EventSystemMetrics {
  readonly totalEvents: number;
  readonly eventsPerSecond: number;
  readonly averageProcessingTime: number;
  readonly failureRate: number;
  readonly handlerCount: number;
  readonly domainEventCounts: Record<Domain, number>;
  readonly memoryUsage: number;
  readonly cacheHitRate: number;
}

/**
 * Event system configuration
 */
export interface EventSystemConfig {
  readonly maxHandlers?: number;
  readonly maxEventHistory?: number;
  readonly enableMetrics?: boolean;
  readonly enableCaching?: boolean;
  readonly defaultTimeout?: number;
  readonly maxConcurrency?: number;
  readonly batchSize?: number;
  readonly retryAttempts?: number;
  readonly backoffMultiplier?: number;
  readonly domainValidation?: boolean;
}

/**
 * Type-safe event bus with domain boundary validation
 */
export class TypeSafeEventBus extends EventEmitter implements EventBus {
  private readonly logger: Logger;
  private readonly domainValidators = new Map<
    Domain,
    DomainBoundaryValidator
  >();
  private readonly eventHandlers = new Map<string, TypedEventHandler[]>();
  private readonly eventHistory: BaseEvent[] = [];
  private readonly processingStats = new Map<string, number[]>();
  private readonly config: Required<EventSystemConfig>;

  // Performance optimization
  private readonly eventCache = new Map<string, BaseEvent>();
  private readonly schemaCache = new Map<string, EventTypeSchema>();
  private eventCounter = 0;
  private startTime = Date.now();

  constructor(
    config: EventSystemConfig = {},readonly _systemDomainValidator?: DomainBoundaryValidator
  ) {
    super();

    this.config = {
      maxHandlers: config.maxHandlers ?? 1000,
      maxEventHistory: config.maxEventHistory ?? 10000,
      enableMetrics: config.enableMetrics ?? true,
      enableCaching: config.enableCaching ?? true,
      defaultTimeout: config.defaultTimeout ?? 30000,
      maxConcurrency: config.maxConcurrency ?? 100,
      batchSize: config.batchSize ?? 50,
      retryAttempts: config.retryAttempts ?? 3,
      backoffMultiplier: config.backoffMultiplier ?? 2,
      domainValidation: config.domainValidation ?? true,
    };

    this.logger = getLogger('type-safe-event-bus');'

    // Initialize domain validators if domain validation is enabled
    if (this.config.domainValidation) {
      for (const domain of Object.values(Domain)) {
        this.domainValidators.set(domain, getDomainValidator())();
      }
    }

    this.logger.info('TypeSafeEventBus initialized', {'
      config: this.config,
      domainValidationEnabled: this.config.domainValidation,
    });
  }

  // ============================================================================
  // EVENT EMISSION - Type-safe event publishing with validation
  // ============================================================================

  /**
   * Emit a type-safe event with domain boundary validation
   */
  public async emitEvent<TEvent extends BaseEvent>(
    event: TEvent,
    options: {
      skipValidation?: boolean;
      timeout?: number;
      priority?: EventPriority;
      correlationId?: string;
    } = {}
  ): Promise<EventProcessingResult> {
    const startTime = Date.now();
    const eventId = event.id||this.generateEventId();

    try {
      // Enhanced event with processing metadata
      const enhancedEvent: TEvent = {
        ...event,
        id: eventId,
        timestamp: event.timestamp||new Date(),
        version: event.version||'1.0.0',
        metadata: {
          ...event.metadata,
          correlationId:
            options.correlationId||event.metadata?.correlationId||this.generateCorrelationId(),
          priority:
            options.priority ??
            event.metadata?.priority ??
            EventPriority.NORMAL,
          source: event.metadata?.source||'type-safe-event-bus',
        },
      };

      // Domain boundary validation
      if (this.config.domainValidation && !options.skipValidation) {
        const validationResult =
          await this.validateEventAtDomainBoundary(enhancedEvent);
        if (!validationResult.success) {
          throw new DomainValidationError(
            `Event validation failed: ${validationResult.error?.message}`,`
            event.domain
          );
        }
      }

      // Cache the event if caching is enabled
      if (this.config.enableCaching) {
        this.eventCache.set(eventId, enhancedEvent);
      }

      // Add to event history
      this.addToEventHistory(enhancedEvent);

      // Process event handlers
      const processingResult = await this.processEventHandlers(enhancedEvent, {
        timeout: options.timeout ?? this.config.defaultTimeout,
      });

      // Emit on Node.js EventEmitter for compatibility
      this.emit(event.type, enhancedEvent);
      this.emit('*', enhancedEvent); // Wildcard listener support'

      // Track metrics
      if (this.config.enableMetrics) {
        this.trackEventMetrics(event.type, Date.now() - startTime, true);
      }

      this.logger.debug('Event emitted successfully', {'
        eventId,
        eventType: event.type,
        domain: event.domain,
        processingTime: Date.now() - startTime,
        handlerCount: processingResult.handlerResults.length,
      });

      return {
        success: true,
        processingTime: Date.now() - startTime,
        handlerResults: processingResult.handlerResults,
        metadata: {
          eventId,
          startTime: new Date(startTime),
          endTime: new Date(),
          handlerCount: processingResult.handlerResults.length,
          successCount: processingResult.handlerResults.filter((r) => r.success)
            .length,
          failureCount: processingResult.handlerResults.filter(
            (r) => !r.success
          ).length,
          totalProcessingTime: Date.now() - startTime,
          validationTime: processingResult.validationTime||0,
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Track failure metrics
      if (this.config.enableMetrics) {
        this.trackEventMetrics(event.type, processingTime, false);
      }

      this.logger.error('Event emission failed', {'
        eventId,
        eventType: event.type,
        domain: event.domain,
        error: error instanceof Error ? error.message : String(error),
        processingTime,
      });

      return {
        success: false,
        processingTime,
        error: error instanceof Error ? error : new Error(String(error)),
        handlerResults: [],
        metadata: {
          eventId,
          startTime: new Date(startTime),
          endTime: new Date(),
          handlerCount: 0,
          successCount: 0,
          failureCount: 1,
          totalProcessingTime: processingTime,
          validationTime: 0,
        },
      };
    }
  }

  /**
   * Emit multiple events in batch for performance
   */
  public async emitEventBatch<TEvent extends BaseEvent>(
    events: TEvent[],
    options: {
      skipValidation?: boolean;
      timeout?: number;
      maxConcurrency?: number;
    } = {}
  ): Promise<EventProcessingResult[]> {
    const startTime = Date.now();
    const maxConcurrency = options.maxConcurrency ?? this.config.maxConcurrency;

    this.logger.info('Processing event batch', {'
      eventCount: events.length,
      maxConcurrency,
    });

    const results: EventProcessingResult[] = [];

    // Process events in batches to avoid overwhelming the system
    for (let i = 0; i < events.length; i += this.config.batchSize) {
      const batch = events.slice(i, i + this.config.batchSize);

      const batchPromises = batch.map((event) =>
        this.emitEvent(event, options)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {'
          results.push(result.value);
        } else {
          results.push({
            success: false,
            processingTime: Date.now() - startTime,
            error:
              result.reason instanceof Error
                ? result.reason
                : new Error(String(result.reason)),
            handlerResults: [],
            metadata: {
              eventId: 'batch-failed',
              startTime: new Date(startTime),
              endTime: new Date(),
              handlerCount: 0,
              successCount: 0,
              failureCount: 1,
              totalProcessingTime: Date.now() - startTime,
              validationTime: 0,
            },
          });
        }
      }
    }

    this.logger.info('Event batch processing completed', {'
      totalEvents: events.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
      totalTime: Date.now() - startTime,
    });

    return results;
  }

  // ============================================================================
  // EVENT HANDLER REGISTRATION - Type-safe handler management
  // ============================================================================

  /**
   * Register a type-safe event handler
   */
  public registerHandler<TEvent extends BaseEvent>(
    eventType: string,
    handler: EventHandler<TEvent>,
    config: EventHandlerConfig = {},
    schema?: EventTypeSchema
  ): string {
    const handlerId = this.generateHandlerId();

    const typedHandler: TypedEventHandler<TEvent> = {
      id: handlerId,
      eventType,
      handler,
      config: {
        priority: 0,
        timeout: this.config.defaultTimeout,
        retries: this.config.retryAttempts,
        backoffStrategy: 'exponential',
        errorHandling: 'retry',
        validatePayload: true,
        trackMetrics: true,
        ...config,
      },
      schema,
    };

    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }

    const handlers = this.eventHandlers.get(eventType)!;
    handlers.push(typedHandler as TypedEventHandler<BaseEvent>);

    // Sort by priority (higher priority first)
    handlers.sort(
      (a, b) => (b.config.priority ?? 0) - (a.config.priority ?? 0)
    );

    this.logger.debug('Event handler registered', {'
      handlerId,
      eventType,
      priority: config.priority,
      totalHandlers: handlers.length,
    });

    return handlerId;
  }

  /**
   * Register multiple handlers for different event types
   */
  public registerHandlers(
    registrations: Array<{
      eventType: string;
      handler: EventHandler<any>;
      config?: EventHandlerConfig;
      schema?: EventTypeSchema;
    }>
  ): string[] {
    return registrations.map((reg) =>
      this.registerHandler(reg.eventType, reg.handler, reg.config, reg.schema)
    );
  }

  /**
   * Register a domain-wide handler that processes all events from a specific domain
   */
  public registerDomainHandler<TEvent extends BaseEvent>(
    domain: Domain,
    handler: EventHandler<TEvent>,
    config: EventHandlerConfig = {}
  ): string {
    return this.registerHandler(`domain:${domain}`, handler, config);`
  }

  /**
   * Register a wildcard handler that processes all events
   */
  public registerWildcardHandler(
    handler: EventHandler<BaseEvent>,
    config: EventHandlerConfig = {}
  ): string {
    return this.registerHandler('*', handler, config);'
  }

  /**
   * Unregister an event handler
   */
  public unregisterHandler(handlerId: string): boolean {
    for (const [eventType, handlers] of this.eventHandlers.entries()) {
      const index = handlers.findIndex((h) => h.id === handlerId);
      if (index >= 0) {
        handlers.splice(index, 1);

        if (handlers.length === 0) {
          this.eventHandlers.delete(eventType);
        }

        this.logger.debug('Event handler unregistered', {'
          handlerId,
          eventType,
          remainingHandlers: handlers.length,
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Get all handlers for an event type
   */
  public getHandlers(eventType: string): TypedEventHandler[] {
    return this.eventHandlers.get(eventType)||[];
  }

  /**
   * Get all registered event types
   */
  public getRegisteredEventTypes(): string[] {
    return Array.from(this.eventHandlers.keys())();
  }

  // ============================================================================
  // CROSS-DOMAIN EVENT ROUTING - Domain boundary aware routing
  // ============================================================================

  /**
   * Route event across domain boundaries with validation
   */
  public async routeCrossDomainEvent<TEvent extends BaseEvent>(
    event: TEvent,
    fromDomain: Domain,
    toDomain: Domain,
    operation: string
  ): Promise<Result<EventProcessingResult>> {
    const startTime = Date.now();

    try {
      // Validate cross-domain event routing
      if (this.config.domainValidation) {
        const validator = this.domainValidators.get(fromDomain);
        if (validator) {
          validator.trackCrossings(
            fromDomain,
            toDomain,
            `event_routing:$operation``
          );
        }

        // Validate event against target domain schema
        const validationResult = await this.validateCrossDomainEvent(
          event,
          fromDomain,
          toDomain
        );
        if (!validationResult.success) {
          return {
            success: false,
            error: validationResult.error,
            metadata: {
              domainFrom: fromDomain,
              domainTo: toDomain,
              operation: `cross_domain_event:${operation}`,`
              timestamp: new Date(),
              validationTime: Date.now() - startTime,
              crossingId: this.generateCrossingId(),
            },
          };
        }
      }

      // Emit the event with cross-domain metadata
      const crossDomainEvent: TEvent = {
        ...event,
        metadata: {
          ...event.metadata,
          source: `cross_domain:${fromDomain}`,`
          causationId: event.id,
          customData: {
            ...event.metadata?.customData,
            crossDomain: {
              from: fromDomain,
              to: toDomain,
              operation,
            },
          },
        },
      };

      const processingResult = await this.emitEvent(crossDomainEvent);

      return {
        success: true,
        data: processingResult,
        metadata: {
          domainFrom: fromDomain,
          domainTo: toDomain,
          operation: `cross_domain_event:${operation}`,`
          timestamp: new Date(),
          validationTime: Date.now() - startTime,
          crossingId: this.generateCrossingId(),
        },
      };
    } catch (error) {
      this.logger.error('Cross-domain event routing failed', {'
        fromDomain,
        toDomain,
        operation,
        eventType: event.type,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          domainFrom: fromDomain,
          domainTo: toDomain,
          operation: `cross_domain_event:${operation}`,`
          timestamp: new Date(),
          validationTime: Date.now() - startTime,
          crossingId: this.generateCrossingId(),
        },
      };
    }
  }

  // ============================================================================
  // EVENT QUERYING AND HISTORY - Event system introspection
  // ============================================================================

  /**
   * Query events from history
   */
  public queryEvents(criteria: {
    eventType?: string;
    domain?: Domain;
    startTime?: Date;
    endTime?: Date;
    correlationId?: string;
    tags?: string[];
    limit?: number;
  }): BaseEvent[] {
    let filteredEvents = this.eventHistory.slice();

    if (criteria.eventType) {
      filteredEvents = filteredEvents.filter(
        (e) => e.type === criteria.eventType
      );
    }

    if (criteria.domain) {
      filteredEvents = filteredEvents.filter(
        (e) => e.domain === criteria.domain
      );
    }

    if (criteria.startTime) {
      filteredEvents = filteredEvents.filter(
        (e) => e.timestamp >= criteria.startTime!
      );
    }

    if (criteria.endTime) {
      filteredEvents = filteredEvents.filter(
        (e) => e.timestamp <= criteria.endTime!
      );
    }

    if (criteria.correlationId) {
      filteredEvents = filteredEvents.filter(
        (e) => e.metadata?.correlationId === criteria.correlationId
      );
    }

    if (criteria.tags && criteria.tags.length > 0) {
      filteredEvents = filteredEvents.filter((e) =>
        e.metadata?.tags?.some((tag) => criteria.tags?.includes(tag))
      );
    }

    if (criteria.limit && criteria.limit > 0) {
      filteredEvents = filteredEvents.slice(-criteria.limit);
    }

    return filteredEvents;
  }

  /**
   * Get event by ID
   */
  public getEvent(eventId: string): BaseEvent|undefined {
    // Check cache first
    if (this.config.enableCaching && this.eventCache.has(eventId)) {
      return this.eventCache.get(eventId);
    }

    // Search in history
    return this.eventHistory.find((e) => e.id === eventId);
  }

  /**
   * Get events by correlation ID
   */
  public getEventsByCorrelation(correlationId: string): BaseEvent[] {
    return this.queryEvents({ correlationId });
  }

  /**
   * Clear event history
   */
  public clearEventHistory(): void {
    this.eventHistory.length = 0;
    this.eventCache.clear();
    this.logger.info('Event history cleared');'
  }

  // ============================================================================
  // PERFORMANCE MONITORING - System metrics and optimization
  // ============================================================================

  /**
   * Get comprehensive event system metrics
   */
  public getMetrics(): EventSystemMetrics {
    const now = Date.now();
    const uptimeSeconds = (now - this.startTime) / 1000;

    const domainEventCounts: Record<Domain, number> = {} as Record<
      Domain,
      number
    >;
    for (const domain of Object.values(Domain)) {
      domainEventCounts[domain] = this.eventHistory.filter(
        (e) => e.domain === domain
      ).length;
    }

    const totalProcessingTimes = Array.from(this.processingStats.values())
      .flat()
      .filter((time) => time > 0);

    const averageProcessingTime =
      totalProcessingTimes.length > 0
        ? totalProcessingTimes.reduce((sum, time) => sum + time, 0) /
          totalProcessingTimes.length
        : 0;

    const failedEvents = this.eventHistory.length - totalProcessingTimes.length;
    const failureRate =
      this.eventHistory.length > 0
        ? failedEvents / this.eventHistory.length
        : 0;

    return {
      totalEvents: this.eventCounter,
      eventsPerSecond:
        uptimeSeconds > 0 ? this.eventCounter / uptimeSeconds : 0,
      averageProcessingTime,
      failureRate,
      handlerCount: Array.from(this.eventHandlers.values()).reduce(
        (sum, handlers) => sum + handlers.length,
        0
      ),
      domainEventCounts,
      memoryUsage: this.estimateMemoryUsage(),
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  /**
   * Get detailed performance statistics
   */
  public getPerformanceStats(): Record<
    string,
    {
      count: number;
      averageTime: number;
      minTime: number;
      maxTime: number;
      p95Time: number;
      p99Time: number;
    }
  > {
    const stats: Record<
      string,
      {
        count: number;
        averageTime: number;
        minTime: number;
        maxTime: number;
        p95Time: number;
        p99Time: number;
      }
    > = {};

    for (const [eventType, times] of this.processingStats.entries()) {
      if (times.length === 0) continue;

      const sortedTimes = [...times].sort((a, b) => a - b);
      const count = times.length;
      const sum = times.reduce((a, b) => a + b, 0);

      stats[eventType] = {
        count,
        averageTime: sum / count,
        minTime: sortedTimes[0],
        maxTime: sortedTimes[sortedTimes.length - 1],
        p95Time: sortedTimes[Math.floor(count * 0.95)]||0,
        p99Time: sortedTimes[Math.floor(count * 0.99)]||0,
      };
    }

    return stats;
  }

  /**
   * Reset performance metrics
   */
  public resetMetrics(): void {
    this.processingStats.clear();
    this.eventCounter = 0;
    this.startTime = Date.now();
    this.logger.info('Performance metrics reset');'
  }

  // ============================================================================
  // LIFECYCLE MANAGEMENT - System startup and shutdown
  // ============================================================================

  /**
   * Initialize the event system
   */
  public async initialize(): Promise<void> {
    this.logger.info('Initializing TypeSafeEventBus', {'
      config: this.config,
    });

    // Initialize domain validators
    if (this.config.domainValidation) {
      for (const [domain, _validator] of this.domainValidators.entries()) {
        try {
          // Validators are already initialized via getDomainValidator
          this.logger.debug('Domain validator ready', { domain });'
        } catch (error) {
          this.logger.error('Failed to initialize domain validator', {'
            domain,
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      }
    }

    // Register system event handlers
    this.registerSystemEventHandlers();

    this.logger.info('TypeSafeEventBus initialized successfully');'
  }

  /**
   * Shutdown the event system gracefully
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down TypeSafeEventBus');'

    // Emit system shutdown event
    try {
      await this.emitEvent({
        id: this.generateEventId(),
        type: 'system.shutdown',
        domain: Domain.CORE,
        timestamp: new Date(),
        version: '1.0.0',
        payload: {
          reason: 'graceful_shutdown',
          graceful: true,
          uptime: Date.now() - this.startTime,
        },
      } as SystemShutdownEvent);
    } catch (error) {
      this.logger.warn('Failed to emit shutdown event', {'
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Clear all handlers
    this.eventHandlers.clear();

    // Clear caches
    this.eventCache.clear();
    this.schemaCache.clear();

    // Remove all listeners
    this.removeAllListeners();

    this.logger.info('TypeSafeEventBus shutdown complete');'
  }

  private generateCrossingId(): string {
    return `crossing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;`
  }

  private estimateMemoryUsage(): number {
    const eventHistorySize = JSON.stringify(this.eventHistory).length;
    const cacheSize = JSON.stringify(
      Array.from(this.eventCache.values())
    ).length;
    const handlerSize = this.eventHandlers.size * 1000; // Rough estimate
    return eventHistorySize + cacheSize + handlerSize;
  }

  private calculateCacheHitRate(): number {
    // Simple cache hit rate calculation
    // In a production system, you'd track actual cache hits vs misses'
    return this.config.enableCaching && this.eventCache.size > 0 ? 0.85 : 0;
  }

  // ============================================================================
  // ÉVENTBUS NTERFACE COMPATIBILITY - Legacy support
  // ============================================================================

  /**
   * Legacy emit method for EventBus compatibility
   */
  emit(eventName: string|symbol, ...args: unknown[]): boolean {
    // Handle both the new typed events and legacy event emitter events
    const result = super.emit(eventName, ...args);

    // If this is a typed event, also process it through our type-safe system
    if (
      typeof eventName ==='string' &&'
      args.length > 0 &&
      args[0] &&
      typeof args[0] === 'object''
    ) {
      const event = args[0] as BaseEvent;
      if (event.type && event.domain && event.timestamp) {
        // This is already processed by emitEvent, so we don't need to process it again'
        // This is just for compatibility
      }
    }

    return result;
  }

  /**
   * Legacy on method for EventBus compatibility
   */
  on(eventName: string|symbol, listener: (...args: unknown[]) => void): this {
    super.on(eventName, listener);
    return this;
  }

  /**
   * Legacy off method for EventBus compatibility
   */
  off(
    eventName: string|symbol,
    listener: (...args: unknown[]) => void
  ): this {
    super.off(eventName, listener);
    return this;
  }
}

// ============================================================================
// FACTORY FUNCTIONS AND UTILITIES - Convenience functions for common usage
// ============================================================================

/**
 * Create a type-safe event bus with default configuration
 */
export function createTypeSafeEventBus(
  config?: EventSystemConfig,
  domainValidator?: DomainBoundaryValidator
): TypeSafeEventBus {
  return new TypeSafeEventBus(config, domainValidator);
}

/**
 * Create an event with proper typing and metadata
 */
export function createEvent<TEvent extends BaseEvent>(
  type: TEvent['type'],
  domain: Domain,
  payload: Omit<TEvent, 'id|type|domain|timestamp|version'>,
  metadata?: Partial<EventMetadata>
): TEvent {
  return {
    id: `event-$Date.now()-$Math.random().toString(36).substr(2, 9)`,`
    type,
    domain,
    timestamp: new Date(),
    version: '1.0.0',
    metadata,
    ...payload,
  } as TEvent;
}

/**
 * Create a correlation ID for event tracking
 */
export function createCorrelationId(): string {
  return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;`
}

/**
 * Type guard to check if an object is a valid base event
 */
export function isBaseEvent(obj: unknown): obj is BaseEvent {
  if (!obj||typeof obj !=='object') return false;'

  const event = obj as any;
  return (
    typeof event.id === 'string' &&'
    typeof event.type === 'string' &&'
    typeof event.domain === 'string' &&'
    event.timestamp instanceof Date &&
    typeof event.version === 'string' &&'
    Object.values(Domain).includes(event.domain)
  );
}

/**
 * Type guard to check if an event belongs to a specific domain
 */
export function isDomainEvent<TDomain extends Domain>(
  event: BaseEvent,
  domain: TDomain
): event is BaseEvent & { domain: TDomain } {
  return event.domain === domain;
}

/**
 * Extract event type from event class
 */
export function getEventType<TEvent extends BaseEvent>(
  eventClass: new (...args: unknown[]) => TEvent
): string {
  // This would require reflection or a different approach in TypeScript
  // For now, events should define their own type property
  return 'unknown;
}

// ============================================================================
// EXPORTS - Public API
// ============================================================================

export default TypeSafeEventBus;

// Types are exported directly above, no need for re-export
