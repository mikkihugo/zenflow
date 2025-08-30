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
import { z } from '@claude-zen/foundation';
/**
 * SAFe priority levels schema
 */
export declare const SafePrioritySchema: z.ZodEnum<any>;
/**
 * SAFe feature status schema
 */
export declare const FeatureStatusSchema: z.ZodEnum<[';']>;
/**
 * SAFe value stream schema
 */
export declare const ValueStreamSchema: z.ZodObject<
  z.ZodRawShape,
  'strip',
  z.ZodTypeAny,
  {
    [x: string]: any;
  },
  {
    [x: string]: any;
  }
>;
/**
 * SAFe validation utilities class
 */
export declare class SafeValidationUtils {
  /**
   * Validate epic creation input
   */
  static validateEpic(input: z.object): any;
}
//# sourceMappingURL=safe-validation.d.ts.map
