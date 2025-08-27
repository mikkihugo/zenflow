/**
 * @fileoverview Event System Package - Simplified Entry Point
 *
 * A simplified, battle-tested event system with minimal dependencies.
 * This package provides type-safe event handling for the claude-code-zen system.
 */
import { EventBus } from './main';
export { EventBus, TypedEventBus, createTypedEventBus, createHighPerformanceEventBus, createValidatedEventBus, TypeSafeEventSystem, createTypeSafeEventBus, uel, createUEL, } from './main';
export { createNeuralEventProcessor, createHighPerformanceNeuralProcessor, createFullNeuralProcessor, } from './neural-integration';
export type { NeuralEventProcessor, NeuralEventConfig, EventClassification, } from './neural-integration';
export type { EventManagerConfig, EventManagerStatus, EventManagerMetrics, EventFilter, EventManagerType, EventListener, EventSubscription, EventManager, EventManagerFactory, EventManagerRegistry, EventBusConfig, EventBusMetrics, EventSystemOptions, UELConfig, ValidationResult, DomainBoundary, TypedEventBusConfig, TypedEventMap, TypedEventHandler, WildcardHandler, EventMiddleware, EventContext, BaseEvent, CoordinationEvent, WorkflowEvent, InterfaceEvent, CoreEvent, EventTypeFromSchema, AllEventTypes, } from './main';
export type { EventPriority, SystemEvent, ProcessingStrategy, BackoffStrategy, ReliabilityLevel, EventManagerConfig as EventManagerDomainConfig, ProcessingConfig, RetryConfig, HealthConfig, MonitoringConfig, SystemLifecycleEvent, CoordinationEvent as CoordinationDomainEvent, CommunicationEvent, MonitoringEvent, InterfaceEvent as InterfaceDomainEvent, NeuralEvent, DatabaseEvent, MemoryEvent, WorkflowEvent as WorkflowDomainEvent, OrchestrationEvent, SafeEvent, MemoryOrchestrationEvent, UELEvent, CoordinationTopology, CommunicationProtocol, ProcessingStatus, SubscriptionInfo, EventError, ProcessingError, EventSubscriptionError, EventResult, EventProcessingResult, EventSubscriptionResult, } from './types/index';
export { EventCategories, EventTypePatterns, EventPriorityMap, EventConstants, UELTypeGuards, } from './types/index';
export { EventValidator, DomainValidator, ValidationChain, createValidationChain, BaseEventSchema, EventSchemas, } from './main';
export { createLoggingMiddleware, createTimingMiddleware, createValidationMiddleware, createErrorHandlingMiddleware, createRateLimitingMiddleware, createConditionalMiddleware, createEventTypeMiddleware, createAsyncMiddleware, } from './main';
/**
 * Create a basic event system for simple use cases.
 */
export declare function createEventSystem(config?: any): EventBus;
/**
 * Create an event bus (alias for createEventSystem)
 */
export declare function createEventBus(config?: any): EventBus;
/**
 * Get the default event system instance
 */
export declare function getEventSystem(): EventBus;
/**
 * Package information
 */
export declare const VERSION = "1.0.1";
export declare const DESCRIPTION = "Type-safe event system with neural intelligence";
export default createEventSystem;
//# sourceMappingURL=index.d.ts.map