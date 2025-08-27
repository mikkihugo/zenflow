/**
 * @file Domain Boundary Validator
 *
 * Standalone domain validation implementation
 */
import type { Domain, DomainBoundaryValidator, Result, TypeSchema } from './types';
/**
 * Simple domain boundary validator implementation
 */
export declare class SimpleDomainValidator implements DomainBoundaryValidator {
    validate<T>(data: T, schema: TypeSchema): Result<T>;
    validateCrossDomain<T>(source: Domain, target: Domain, data: T): Result<T>;
    trackCrossings(fromDomain: Domain, toDomain: Domain, operation: string): void;
    validateInput<T>(data: T, schema: TypeSchema): Result<T>;
}
/**
 * Get a domain validator instance
 */
export declare function getDomainValidator(): DomainBoundaryValidator;
/**
 * Validate cross-domain operation
 */
export declare function validateCrossDomain<T>(source: Domain, target: Domain, data: T): Result<T>;
//# sourceMappingURL=domain-validator.d.ts.map