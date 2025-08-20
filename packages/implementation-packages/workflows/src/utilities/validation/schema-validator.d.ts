/**
 * @fileoverview Schema Validation Utilities
 *
 * Professional runtime validation using Zod library.
 * Focused on type-safe validation and error handling.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { z } from 'zod';
/**
 * Professional schema validation utilities
 */
export declare class SchemaValidator {
    /**
     * Create safe parser with custom schema
     */
    static createSafeParser<T>(schema: z.ZodSchema<T>): (data: unknown) => {
        success: boolean;
        data?: T;
        errors?: string[];
    };
    /**
     * Validate data against schema
     */
    static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
        success: boolean;
        data?: T;
        errors?: string[];
    };
    /**
     * Check if data matches schema
     */
    static isValid<T>(schema: z.ZodSchema<T>, data: unknown): boolean;
}
//# sourceMappingURL=schema-validator.d.ts.map