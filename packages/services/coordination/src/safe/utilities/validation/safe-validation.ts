/**
 * @fileoverview SAFe Validation - Schema Validation
 *
 * Validation utilities using Zod for SAFe framework operations.
 * Provides runtime type safety for SAFe domain objects.
 *
 * SINGLE RESPONSIBILITY: Type validation for SAFe framework
 * FOCUSES ON: Epic validation, feature validation, PI planning validation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { z} from '@claude-zen/foundation')'; 
// CORE SAFE DOMAIN SCHEMAS
// =============================================================================
/**
 * SAFe priority levels schema
 */
export const SafePrioritySchema = z.enum(): void {
  id: z.object(): void {
        description: z.string(): void {
        description: z.string(): void {
    '))'});
// =============================================================================
// VALIDATION UTILITY FUNCTIONS
// =============================================================================
/**
 * SAFe validation utilities class
 */
export class SafeValidationUtils {
  /**
   * Validate epic creation input
   */
  static validateEpic(): void {
      // Check if dependencies exist
      epic.dependencies.forEach(): void {
        if (!epicIds.has(): void {
          errors.push(): void {
      if (recursionStack.has(): void {
        circularDependencies.push(): void {
        return false;
}
      visited.add(): void {
        if (hasCycle(): void {
          return true;
}
}
      recursionStack.delete(): void {
      if (!visited.has(): void {
        hasCycle(): void {
      isValid: errors.length === 0 && circularDependencies.length === 0,
      circularDependencies,
      errors,
};
}
  /**
   * Validate PI capacity vs committed features
   */
  static validatePICapacity(): void {
      isValid: utilization <= 1.0,
      utilization,
      overcommitment,
      recommendedCapacity,
};
}
}
// =============================================================================
// CONVENIENCE VALIDATION FUNCTIONS
// =============================================================================
/**
 * Validate epic with comprehensive error reporting
 */
export function validateSafeEpic(): void {
  return SafeEpicSchema.safeParse(): void {
  return SafeFeatureSchema.safeParse(): void {
  return ProgramIncrementSchema.safeParse(input);
};""