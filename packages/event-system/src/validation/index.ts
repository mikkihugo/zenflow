/**
 * @fileoverview Event Validation Exports
 * 
 * Re-exports event validation utilities and domain validators.
 */

// Export validation from core
export { SimpleDomainValidator, getDomainValidator } from '../core/domain-validator';

// Export validation utilities from main validation file
export * from '../validation';