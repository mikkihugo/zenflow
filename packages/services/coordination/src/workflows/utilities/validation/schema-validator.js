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
  static createSafeParser(schema) {
    return (data) => {
      try {
        const result = schema.parse(data);
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            errors: error.errors.map(
              (e) => `${e.path.join('.')}: ${e.message}`
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
  static validate(schema, data) {
    const parser = SchemaValidator.createSafeParser(schema);
    return parser(data);
  }
  /**
   * Check if data matches schema
   */
  static isValid(schema, data) {
    const result = SchemaValidator.validate(schema, data);
    return result.success;
  }
}
//# sourceMappingURL=schema-validator.js.map
