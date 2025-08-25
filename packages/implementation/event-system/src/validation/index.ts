/**
 * @fileoverview Event Validation Exports - Modern Battle-Tested Architecture
 *
 * Professional event validation using zod schema validation.
 * Provides type-safe validation with excellent error messages and performance.
 *
 * **MIGRATION COMPLETE**: Custom validation replaced with zod for:
 * - Better type safety (compile-time + runtime)
 * - Superior error messages and debugging
 * - Industry-standard schema validation
 * - Foundation integration with Result patterns
 */

// =============================================================================
// PRIMARY EXPORTS - Modern zod-based validation
// =============================================================================
export {
  EventValidator,
  ValidationChain,
  createEventValidator,
  createValidationChain,
  createTypedEventValidator,
  validateBaseEvent,
  EventSchemas,
  BaseEventSchema,
  CoordinationEventSchemas,
  WorkflowEventSchemas,
  InterfaceEventSchemas,
  CoreEventSchemas,
} from './zod-validation';

export type {
  BaseEvent,
  CoordinationEvent,
  WorkflowEvent,
  InterfaceEvent,
  CoreEvent,
  EventTypeFromSchema,
  AllEventTypes,
} from './zod-validation';

// =============================================================================
// LEGACY DOMAIN VALIDATION - Keep for domain boundary validation
// =============================================================================
export {
  SimpleDomainValidator,
  getDomainValidator,
} from '../core/domain-validator';
export { SimpleDomainValidator as DomainValidator } from '../core/domain-validator';

// Export validation utilities from main validation file
export * from '../validation';
