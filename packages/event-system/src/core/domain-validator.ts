/**
 * @file Domain Boundary Validator
 * 
 * Standalone domain validation implementation
 */

import type { 
  Domain, 
  DomainBoundaryValidator, 
  DomainValidationError,
  Result, 
  TypeSchema 
} from './types';

/**
 * Simple domain boundary validator implementation
 */
export class SimpleDomainValidator implements DomainBoundaryValidator {
  validate<T>(data: T, schema: TypeSchema): Result<T> {
    try {
      // Basic validation - just check if data exists and matches basic type
      if (data === null || data === undefined) {
        return { 
          success: false, 
          error: new Error('Data is null or undefined') 
        };
      }

      if (schema.type && typeof data !== schema.type && schema.type !== 'object') {
        return { 
          success: false, 
          error: new Error(`Expected type ${schema.type}, got ${typeof data}`) 
        };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Validation failed') 
      };
    }
  }

  validateCrossDomain<T>(source: Domain, target: Domain, data: T): Result<T> {
    try {
      // Basic cross-domain validation
      if (!source || !target) {
        return { 
          success: false, 
          error: new Error('Source and target domains are required') 
        };
      }

      // Allow all cross-domain transfers for now
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Cross-domain validation failed') 
      };
    }
  }

  trackCrossings(fromDomain: Domain, toDomain: Domain, operation: string): void {
    // Track cross-domain operations for audit and monitoring
    console.debug(`Cross-domain operation: ${operation} from ${fromDomain} to ${toDomain}`);
  }

  validateInput<T>(data: T, schema: TypeSchema): Result<T> {
    // Use the same validation logic as validate()
    return this.validate(data, schema);
  }
}

/**
 * Get a domain validator instance
 */
export function getDomainValidator(): DomainBoundaryValidator {
  return new SimpleDomainValidator();
}

/**
 * Validate cross-domain operation
 */
export function validateCrossDomain<T>(source: Domain, target: Domain, data: T): Result<T> {
  return getDomainValidator().validateCrossDomain(source, target, data);
}