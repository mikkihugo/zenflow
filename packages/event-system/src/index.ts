/**
 * @fileoverview Event System Package - Simplified Entry Point
 * 
 * A simplified, battle-tested event system with minimal dependencies.
 * This package provides type-safe event handling for the claude-code-zen system.
 */

// =============================================================================
// MAIN EXPORTS - Core functionality from src/main
// =============================================================================
export {
  EventBus,
  TypedEventBus,
  createTypedEventBus,
  createHighPerformanceEventBus,
  createValidatedEventBus,
  TypeSafeEventBus,
  createTypeSafeEventBus,
  uel,
  createUEL
} from './main';

// Import for internal use
import { EventBus } from './main';

// =============================================================================
// NEURAL INTEGRATION - AI-powered event processing
// =============================================================================
export {
  NeuralEventProcessor,
  createNeuralEventProcessor,
  createHighPerformanceNeuralProcessor,
  createFullNeuralProcessor
} from './neural-integration';

export type {
  NeuralEventConfig,
  EventClassification
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
  AllEventTypes
} from './main';

// =============================================================================
// VALIDATION FRAMEWORK
// =============================================================================
export {
  EventValidator,
  DomainValidator,
  ValidationChain,
  createValidationChain,
  BaseEventSchema,
  EventSchemas
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
  createAsyncMiddleware
} from './main';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a basic event system for simple use cases.
 */
export function createEventSystem(config?: any) {
  return new EventBus(config || {});
}

/**
 * Package information
 */
export const VERSION = '1.0.1';
export const DESCRIPTION = 'Type-safe event system with neural intelligence';

export default createEventSystem;