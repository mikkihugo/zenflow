/**
 * @fileoverview Event System Package - Simplified Entry Point
 *
 * A simplified, battle-tested event system with minimal dependencies.
 * This package provides type-safe event handling for the claude-code-zen system.
 */

// =============================================================================
// MAIN EXPORTS - Core functionality from src/main
// =============================================================================
// Import for internal use
import { EventBus } from './main';

export {
  EventBus,
  TypedEventBus,
  createTypedEventBus,
  createHighPerformanceEventBus,
  createValidatedEventBus,
  TypeSafeEventBus,
  createTypeSafeEventBus,
  uel,
  createUEL,
} from './main';

// =============================================================================
// NEURAL INTEGRATION - AI-powered event processing
// =============================================================================
export {
  NeuralEventProcessor,
  createNeuralEventProcessor,
  createHighPerformanceNeuralProcessor,
  createFullNeuralProcessor,
} from './neural-integration';

export type {
  NeuralEventConfig,
  EventClassification,
} from './neural-integration';

// =============================================================================
// CORE TYPES - Essential interfaces
// =============================================================================
export type {
  EventManagerConfig,
  EventManagerStatus,
  EventManagerMetrics,
  EventFilter,
  EventManagerType,
  EventListener,
  EventSubscription,
  EventManager,
  EventManagerFactory,
  EventManagerRegistry,
  EventBusConfig,
  EventBusMetrics,
  EventSystemOptions,
  UELConfig,
  ValidationResult,
  DomainBoundary,
  TypedEventBusConfig,
  TypedEventMap,
  TypedEventHandler,
  WildcardHandler,
  EventMiddleware,
  EventContext,
  BaseEvent,
  CoordinationEvent,
  WorkflowEvent,
  InterfaceEvent,
  CoreEvent,
  EventTypeFromSchema,
  AllEventTypes,
} from './main';

// =============================================================================
// EVENT SYSTEM DOMAIN TYPES - Comprehensive event domain types
// =============================================================================

export type {
  // Core event system types
  EventPriority,
  SystemEvent,
  ProcessingStrategy,
  BackoffStrategy,
  ReliabilityLevel,

  // Configuration types
  EventManagerConfig as EventManagerDomainConfig,
  ProcessingConfig,
  RetryConfig,
  HealthConfig,
  MonitoringConfig,

  // Event types by domain
  SystemLifecycleEvent,
  CoordinationEvent as CoordinationDomainEvent,
  CommunicationEvent,
  MonitoringEvent,
  InterfaceEvent as InterfaceDomainEvent,
  NeuralEvent,
  DatabaseEvent,
  MemoryEvent,
  WorkflowEvent as WorkflowDomainEvent,
  OrchestrationEvent,
  SafeEvent,
  MemoryOrchestrationEvent,

  // Unified event types
  UELEvent,

  // Coordination types
  CoordinationTopology,
  CommunicationProtocol,

  // Processing types
  ProcessingStatus,
  SubscriptionInfo,

  // Error types
  EventError,
  ProcessingError,
  SubscriptionError,

  // Result types
  EventResult,
  EventProcessingResult,
  EventSubscriptionResult,
} from './types/index';

// Export constants and type guards
export {
  EventCategories,
  EventTypePatterns,
  EventPriorityMap,
  EventConstants,
  UELTypeGuards,
} from './types/index';

// Export enums (avoiding duplicate exports - these are already exported as types above)

// =============================================================================
// VALIDATION FRAMEWORK
// =============================================================================
export {
  EventValidator,
  DomainValidator,
  ValidationChain,
  createValidationChain,
  BaseEventSchema,
  EventSchemas,
} from './main';

// =============================================================================
// MIDDLEWARE SYSTEM
// =============================================================================
export {
  createLoggingMiddleware,
  createTimingMiddleware,
  createValidationMiddleware,
  createErrorHandlingMiddleware,
  createRateLimitingMiddleware,
  createConditionalMiddleware,
  createEventTypeMiddleware,
  createAsyncMiddleware,
} from './main';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a basic event system for simple use cases.
 */
export function createEventSystem(config?: any) {
  return new EventBus(config||{});
}

/**
 * Create an event bus (alias for createEventSystem)
 */
export function createEventBus(config?: any) {
  return createEventSystem(config);
}

/**
 * Get the default event system instance
 */
export function getEventSystem() {
  return createEventSystem();
}

/**
 * Package information
 */
export const VERSION = '1.0.1';
export const DESCRIPTION = 'Type-safe event system with neural intelligence';

export default createEventSystem;
