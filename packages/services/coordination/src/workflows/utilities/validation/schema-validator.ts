/**
 * @fileoverview Schema Validation Utilities
 *
 * Professional runtime validation using Zod library.
 * Focused on type-safe validation and error handling.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import { z } from '@claude-zen/foundation';
/**
 * Professional schema validation utilities
 */
export class SchemaValidator {
  /**
   * Create safe parser with custom schema
   */
  static createSafeParser<T>(schema: z.ZodSchema<T>) {
    return (
      data: unknown
    ): { success: boolean; data?: T; errors?: string[] } => {
      try {
        const result = schema.parse(data);
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            errors: error.errors.map(
              (e) => `${{e.path.join('.')}: ${e.message}}``
            ),
          };
        }
        return { success: false, errors: ['Unknown validation error'] };
      }
    };
  }

  /**
   * Validate data against schema
   */
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): { success: boolean; data?: T; errors?: string[] } {
    const parser = this.createSafeParser(schema);
    return parser(data);
  }

  /**
   * Check if data matches schema
   */
  static isValid<T>(schema: z.ZodSchema<T>, data: unknown): boolean {
    const result = this.validate(schema, data);
    return result.success;
  }
}
