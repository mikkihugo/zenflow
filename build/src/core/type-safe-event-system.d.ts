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
import { EventEmitter } from 'events';
import type { Logger } from '../config/logging-config.ts';
import type { Agent, Task } from '../coordination/types.ts';
import type { WorkflowContext, WorkflowDefinition } from '../workflows/types.ts';
import { Domain, type DomainBoundaryValidator, type Result, type TypeSchema } from './domain-boundary-validator.ts';
import type { IEventBus } from './interfaces/base-interfaces.ts';
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
export declare enum EventPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3,
    URGENT = 4
}
/**
 * Event processing status
 */
export declare enum EventStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    PROCESSED = "processed",
    FAILED = "failed",
    REJECTED = "rejected",
    RETRYING = "retrying"
}
/**
 * Event handler configuration
 */
export interface EventHandlerConfig {
    readonly priority?: number;
    readonly timeout?: number;
    readonly retries?: number;
    readonly backoffStrategy?: 'linear' | 'exponential';
    readonly errorHandling?: 'ignore' | 'retry' | 'failfast';
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
/**
 * Coordination domain events
 */
export interface CoordinationEvent extends BaseEvent {
    readonly domain: Domain.COORDINATION;
}
export interface AgentCreatedEvent extends CoordinationEvent {
    readonly type: 'agent.created';
    readonly payload: {
        readonly agent: Agent;
        readonly capabilities: string[];
        readonly initialStatus: 'idle' | 'busy';
    };
}
export interface AgentDestroyedEvent extends CoordinationEvent {
    readonly type: 'agent.destroyed';
    readonly payload: {
        readonly agentId: string;
        readonly reason: string;
        readonly finalStatus: 'idle' | 'busy';
    };
}
export interface TaskAssignedEvent extends CoordinationEvent {
    readonly type: 'task.assigned';
    readonly payload: {
        readonly task: Task;
        readonly agentId: string;
        readonly assignmentTime: Date;
    };
}
export interface TaskCompletedEvent extends CoordinationEvent {
    readonly type: 'task.completed';
    readonly payload: {
        readonly taskId: string;
        readonly agentId: string;
        readonly result: unknown;
        readonly duration: number;
        readonly success: boolean;
    };
}
export interface SwarmStateChangedEvent extends CoordinationEvent {
    readonly type: 'swarm.state.changed';
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
    readonly domain: Domain.WORKFLOWS;
}
export interface WorkflowStartedEvent extends WorkflowDomainEvent {
    readonly type: 'workflow.started';
    readonly payload: {
        readonly workflowId: string;
        readonly definition: WorkflowDefinition;
        readonly context: WorkflowContext;
        readonly startTime: Date;
    };
}
export interface WorkflowCompletedEvent extends WorkflowDomainEvent {
    readonly type: 'workflow.completed';
    readonly payload: {
        readonly workflowId: string;
        readonly result: unknown;
        readonly duration: number;
        readonly stepsExecuted: number;
    };
}
export interface WorkflowFailedEvent extends WorkflowDomainEvent {
    readonly type: 'workflow.failed';
    readonly payload: {
        readonly workflowId: string;
        readonly error: Error;
        readonly failedStep?: number;
        readonly partialResult?: unknown;
    };
}
export interface WorkflowStepCompletedEvent extends WorkflowDomainEvent {
    readonly type: 'workflow.step.completed';
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
    readonly type: 'network.training.started';
    readonly payload: {
        readonly networkId: string;
        readonly architecture: number[];
        readonly trainingConfig: unknown;
        readonly datasetSize: number;
    };
}
export interface NetworkTrainingCompletedEvent extends NeuralEvent {
    readonly type: 'network.training.completed';
    readonly payload: {
        readonly networkId: string;
        readonly finalAccuracy: number;
        readonly trainingDuration: number;
        readonly epochsCompleted: number;
    };
}
export interface NetworkPredictionEvent extends NeuralEvent {
    readonly type: 'network.prediction';
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
    readonly type: 'query.executed';
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
    readonly type: 'transaction.completed';
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
    readonly type: 'memory.stored';
    readonly payload: {
        readonly key: string;
        readonly size: number;
        readonly ttl?: number;
        readonly namespace?: string;
    };
}
export interface MemoryRetrievedEvent extends MemoryEvent {
    readonly type: 'memory.retrieved';
    readonly payload: {
        readonly key: string;
        readonly found: boolean;
        readonly size?: number;
        readonly age?: number;
    };
}
export interface MemoryEvictedEvent extends MemoryEvent {
    readonly type: 'memory.evicted';
    readonly payload: {
        readonly key: string;
        readonly reason: 'ttl' | 'capacity' | 'manual';
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
    readonly type: 'knowledge.updated';
    readonly payload: {
        readonly entityId: string;
        readonly entityType: string;
        readonly updateType: 'create' | 'update' | 'delete';
        readonly version: number;
    };
}
export interface KnowledgeQueryEvent extends KnowledgeEvent {
    readonly type: 'knowledge.query';
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
    readonly domain: Domain.INTERFACES;
}
export interface HumanValidationRequestedEvent extends InterfaceEvent {
    readonly type: 'human.validation.requested';
    readonly payload: {
        readonly requestId: string;
        readonly validationType: 'approval' | 'selection' | 'input' | 'review';
        readonly context: unknown;
        readonly priority: EventPriority;
        readonly timeout?: number;
    };
}
export interface HumanValidationCompletedEvent extends InterfaceEvent {
    readonly type: 'human.validation.completed';
    readonly payload: {
        readonly requestId: string;
        readonly approved: boolean;
        readonly input?: unknown;
        readonly feedback?: string;
        readonly processingTime: number;
    };
}
export interface AGUIGateOpenedEvent extends InterfaceEvent {
    readonly type: 'agui.gate.opened';
    readonly payload: {
        readonly gateId: string;
        readonly gateType: string;
        readonly requiredApproval: boolean;
        readonly context: unknown;
    };
}
export interface AGUIGateClosedEvent extends InterfaceEvent {
    readonly type: 'agui.gate.closed';
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
    readonly type: 'system.started';
    readonly payload: {
        readonly version: string;
        readonly startTime: Date;
        readonly configuration: unknown;
    };
}
export interface SystemShutdownEvent extends CoreEvent {
    readonly type: 'system.shutdown';
    readonly payload: {
        readonly reason: string;
        readonly graceful: boolean;
        readonly uptime: number;
    };
}
export interface ErrorOccurredEvent extends CoreEvent {
    readonly type: 'error.occurred';
    readonly payload: {
        readonly error: Error;
        readonly context: unknown;
        readonly severity: 'low' | 'medium' | 'high' | 'critical';
        readonly recoverable: boolean;
    };
}
/**
 * Union type of all domain events
 */
export type DomainEvent = CoordinationEvent | WorkflowDomainEvent | NeuralEvent | DatabaseEvent | MemoryEvent | KnowledgeEvent | InterfaceEvent | CoreEvent;
/**
 * Union type of all specific event types
 */
export type SystemEvent = AgentCreatedEvent | AgentDestroyedEvent | TaskAssignedEvent | TaskCompletedEvent | SwarmStateChangedEvent | WorkflowStartedEvent | WorkflowCompletedEvent | WorkflowFailedEvent | WorkflowStepCompletedEvent | NetworkTrainingStartedEvent | NetworkTrainingCompletedEvent | NetworkPredictionEvent | QueryExecutedEvent | TransactionCompletedEvent | MemoryStoredEvent | MemoryRetrievedEvent | MemoryEvictedEvent | KnowledgeUpdatedEvent | KnowledgeQueryEvent | HumanValidationRequestedEvent | HumanValidationCompletedEvent | AGUIGateOpenedEvent | AGUIGateClosedEvent | SystemStartedEvent | SystemShutdownEvent | ErrorOccurredEvent;
/**
 * Event schemas for each domain
 */
export declare const EventSchemas: {
    readonly AgentCreated: TypeSchema<AgentCreatedEvent>;
    readonly TaskAssigned: TypeSchema<TaskAssignedEvent>;
    readonly WorkflowStarted: TypeSchema<WorkflowStartedEvent>;
    readonly HumanValidationRequested: TypeSchema<HumanValidationRequestedEvent>;
};
/**
 * Event handler function type
 */
export type EventHandler<TEvent extends BaseEvent = BaseEvent> = (event: TEvent, context: EventHandlerContext) => Promise<void> | void;
/**
 * Event handler context
 */
export interface EventHandlerContext {
    readonly eventBus: IEventBus;
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
    readonly schema?: TypeSchema<TEvent>;
}
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
export declare class TypeSafeEventBus extends EventEmitter implements IEventBus {
    private readonly systemDomainValidator?;
    private readonly logger;
    private readonly domainValidators;
    private readonly eventHandlers;
    private readonly eventHistory;
    private readonly processingStats;
    private readonly config;
    private readonly eventCache;
    private readonly schemaCache;
    private eventCounter;
    private startTime;
    constructor(config?: EventSystemConfig, systemDomainValidator?: DomainBoundaryValidator | undefined);
    /**
     * Emit a type-safe event with domain boundary validation
     */
    emitEvent<TEvent extends BaseEvent>(event: TEvent, options?: {
        skipValidation?: boolean;
        timeout?: number;
        priority?: EventPriority;
        correlationId?: string;
    }): Promise<EventProcessingResult>;
    /**
     * Emit multiple events in batch for performance
     */
    emitEventBatch<TEvent extends BaseEvent>(events: TEvent[], options?: {
        skipValidation?: boolean;
        timeout?: number;
        maxConcurrency?: number;
    }): Promise<EventProcessingResult[]>;
    /**
     * Register a type-safe event handler
     */
    registerHandler<TEvent extends BaseEvent>(eventType: string, handler: EventHandler<TEvent>, config?: EventHandlerConfig, schema?: TypeSchema<TEvent>): string;
    /**
     * Register multiple handlers for different event types
     */
    registerHandlers(registrations: Array<{
        eventType: string;
        handler: EventHandler<any>;
        config?: EventHandlerConfig;
        schema?: TypeSchema<any>;
    }>): string[];
    /**
     * Register a domain-wide handler that processes all events from a specific domain
     */
    registerDomainHandler<TEvent extends BaseEvent>(domain: Domain, handler: EventHandler<TEvent>, config?: EventHandlerConfig): string;
    /**
     * Register a wildcard handler that processes all events
     */
    registerWildcardHandler(handler: EventHandler<BaseEvent>, config?: EventHandlerConfig): string;
    /**
     * Unregister an event handler
     */
    unregisterHandler(handlerId: string): boolean;
    /**
     * Get all handlers for an event type
     */
    getHandlers(eventType: string): TypedEventHandler[];
    /**
     * Get all registered event types
     */
    getRegisteredEventTypes(): string[];
    /**
     * Route event across domain boundaries with validation
     */
    routeCrossDomainEvent<TEvent extends BaseEvent>(event: TEvent, fromDomain: Domain, toDomain: Domain, operation: string): Promise<Result<EventProcessingResult>>;
    /**
     * Query events from history
     */
    queryEvents(criteria: {
        eventType?: string;
        domain?: Domain;
        startTime?: Date;
        endTime?: Date;
        correlationId?: string;
        tags?: string[];
        limit?: number;
    }): BaseEvent[];
    /**
     * Get event by ID
     */
    getEvent(eventId: string): BaseEvent | undefined;
    /**
     * Get events by correlation ID
     */
    getEventsByCorrelation(correlationId: string): BaseEvent[];
    /**
     * Clear event history
     */
    clearEventHistory(): void;
    /**
     * Get comprehensive event system metrics
     */
    getMetrics(): EventSystemMetrics;
    /**
     * Get detailed performance statistics
     */
    getPerformanceStats(): Record<string, {
        count: number;
        averageTime: number;
        minTime: number;
        maxTime: number;
        p95Time: number;
        p99Time: number;
    }>;
    /**
     * Reset performance metrics
     */
    resetMetrics(): void;
    /**
     * Initialize the event system
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the event system gracefully
     */
    shutdown(): Promise<void>;
    private processEventHandlers;
    private validateEventAtDomainBoundary;
    private validateCrossDomainEvent;
    private getEventSchema;
    private addToEventHistory;
    private trackEventMetrics;
    private registerSystemEventHandlers;
    private generateEventId;
    private generateHandlerId;
    private generateCorrelationId;
    private generateCrossingId;
    private estimateMemoryUsage;
    private calculateCacheHitRate;
    /**
     * Legacy emit method for IEventBus compatibility
     */
    emit(eventName: string | symbol, ...args: any[]): boolean;
    /**
     * Legacy on method for IEventBus compatibility
     */
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Legacy off method for IEventBus compatibility
     */
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
}
/**
 * Create a type-safe event bus with default configuration
 */
export declare function createTypeSafeEventBus(config?: EventSystemConfig, domainValidator?: DomainBoundaryValidator): TypeSafeEventBus;
/**
 * Create an event with proper typing and metadata
 */
export declare function createEvent<TEvent extends BaseEvent>(type: TEvent['type'], domain: Domain, payload: Omit<TEvent, 'id' | 'type' | 'domain' | 'timestamp' | 'version'>, metadata?: Partial<EventMetadata>): TEvent;
/**
 * Create a correlation ID for event tracking
 */
export declare function createCorrelationId(): string;
/**
 * Type guard to check if an object is a valid base event
 */
export declare function isBaseEvent(obj: unknown): obj is BaseEvent;
/**
 * Type guard to check if an event belongs to a specific domain
 */
export declare function isDomainEvent<TDomain extends Domain>(event: BaseEvent, domain: TDomain): event is BaseEvent & {
    domain: TDomain;
};
/**
 * Extract event type from event class
 */
export declare function getEventType<TEvent extends BaseEvent>(eventClass: new (...args: any[]) => TEvent): string;
export default TypeSafeEventBus;
export type { BaseEvent, DomainEvent, SystemEvent, EventHandler, EventHandlerContext, EventHandlerConfig, EventProcessingResult, EventProcessingMetadata, EventSystemMetrics, EventSystemConfig, TypedEventHandler, CoordinationEvent, WorkflowDomainEvent, NeuralEvent, DatabaseEvent, MemoryEvent, KnowledgeEvent, InterfaceEvent, CoreEvent, AgentCreatedEvent, AgentDestroyedEvent, TaskAssignedEvent, TaskCompletedEvent, SwarmStateChangedEvent, WorkflowStartedEvent, WorkflowCompletedEvent, WorkflowFailedEvent, WorkflowStepCompletedEvent, NetworkTrainingStartedEvent, NetworkTrainingCompletedEvent, NetworkPredictionEvent, QueryExecutedEvent, TransactionCompletedEvent, MemoryStoredEvent, MemoryRetrievedEvent, MemoryEvictedEvent, KnowledgeUpdatedEvent, KnowledgeQueryEvent, HumanValidationRequestedEvent, HumanValidationCompletedEvent, AGUIGateOpenedEvent, AGUIGateClosedEvent, SystemStartedEvent, SystemShutdownEvent, ErrorOccurredEvent, };
//# sourceMappingURL=type-safe-event-system.d.ts.map