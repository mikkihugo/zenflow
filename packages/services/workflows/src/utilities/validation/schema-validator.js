"use strict";
/**
 * @fileoverview Schema Validation Utilities
 *
 * Professional runtime validation using Zod library.
 * Focused on type-safe validation and error handling.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidator = void 0;
var foundation_1 = require("@claude-zen/foundation");
/**
 * Professional schema validation utilities
 */
var SchemaValidator = /** @class */ (function () {
    function SchemaValidator() {
    }
    /**
     * Create safe parser with custom schema
     */
    SchemaValidator.createSafeParser = function (schema) {
        return function (data) {
            try {
                var result = schema.parse(data);
                return { success: true, data: result };
            }
            catch (error) {
                if (error instanceof foundation_1.z.ZodError) {
                    return {
                        success: false,
                        errors: error.errors.map(function (e) { return "".concat(e.path.join('.'), ": ").concat(e.message)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            ),\n          };\n        }\n        return { success: false, errors: ['Unknown validation error'] };'\n      }\n    };\n  }\n\n  /**\n   * Validate data against schema\n   */\n  static validate<T>(\n    schema: z.ZodSchema<T>,\n    data: unknown\n  ): { success: boolean; data?: T; errors?: string[] } {\n    const parser = this.createSafeParser(schema);\n    return parser(data);\n  }\n\n  /**\n   * Check if data matches schema\n   */\n  static isValid<T>(schema: z.ZodSchema<T>, data: unknown): boolean {\n    const result = this.validate(schema, data);\n    return result.success;\n  }\n}\n"], ["\n            ),\n          };\n        }\n        return { success: false, errors: ['Unknown validation error'] };'\n      }\n    };\n  }\n\n  /**\n   * Validate data against schema\n   */\n  static validate<T>(\n    schema: z.ZodSchema<T>,\n    data: unknown\n  ): { success: boolean; data?: T; errors?: string[] } {\n    const parser = this.createSafeParser(schema);\n    return parser(data);\n  }\n\n  /**\n   * Check if data matches schema\n   */\n  static isValid<T>(schema: z.ZodSchema<T>, data: unknown): boolean {\n    const result = this.validate(schema, data);\n    return result.success;\n  }\n}\n"]))); })
                    };
                }
            }
        };
    };
    return SchemaValidator;
}());
exports.SchemaValidator = SchemaValidator;
var templateObject_1;
