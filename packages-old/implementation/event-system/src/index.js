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
export { EventBus, TypedEventBus, createTypedEventBus, createHighPerformanceEventBus, createValidatedEventBus, TypeSafeEventSystem, createTypeSafeEventBus, uel, createUEL, } from './main';
// =============================================================================
// NEURAL INTEGRATION - AI-powered event processing
// =============================================================================
export { createNeuralEventProcessor, createHighPerformanceNeuralProcessor, createFullNeuralProcessor, } from './neural-integration';
// Export constants and type guards
export { EventCategories, EventTypePatterns, EventPriorityMap, EventConstants, UELTypeGuards, } from './types/index';
// Export enums (avoiding duplicate exports - these are already exported as types above)
// =============================================================================
// VALIDATION FRAMEWORK
// =============================================================================
export { EventValidator, DomainValidator, ValidationChain, createValidationChain, BaseEventSchema, EventSchemas, } from './main';
// =============================================================================
// MIDDLEWARE SYSTEM
// =============================================================================
export { createLoggingMiddleware, createTimingMiddleware, createValidationMiddleware, createErrorHandlingMiddleware, createRateLimitingMiddleware, createConditionalMiddleware, createEventTypeMiddleware, createAsyncMiddleware, } from './main';
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
/**
 * Create a basic event system for simple use cases.
 */
export function createEventSystem(config) {
    return new EventBus(config || {});
}
/**
 * Create an event bus (alias for createEventSystem)
 */
export function createEventBus(config) {
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
