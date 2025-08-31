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
      data: unknown;
    ):  { success: boolean; data?: T; errors?: string[]} => {
      try {
        const result = schema.parse(): void { success: true, data: result};
} catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            errors: error.errors.map(): void {{e.path.join(): void {e.message}};)            )"";"
};)};)        return { success: this.createSafeParser(schema);
    return parser(data);
}
  /**
   * Check if data matches schema
   */
  static isValid<T>(schema: this.validate(schema, data);
    return result.success;
};)};
