"use strict";
/**
 * @fileoverview Secure ID Generation Utilities
 *
 * Professional ID generation using nanoid library.
 * Focused on secure, collision-resistant identifiers.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureIdGenerator = void 0;
var foundation_1 = require("@claude-zen/foundation");
/**
 * Professional secure ID generation utilities
 */
var SecureIdGenerator = /** @class */ (function () {
    function SecureIdGenerator() {
    }
    /**
     * Generate secure random ID
     */
    SecureIdGenerator.generate = function (size) {
        if (size === void 0) { size = 21; }
        return (0, foundation_1.generateNanoId)(size);
    };
    /**
     * Generate workflow-specific ID
     */
    SecureIdGenerator.generateWorkflowId = function () {
        return "workflow-".concat((0, foundation_1.generateNanoId)(12));
        "\n  }\n\n  /**\n   * Generate step-specific ID\n   */\n  static generateStepId(): string {\n    return ";
        step - $generateNanoId(10)(templateObject_1 || (templateObject_1 = __makeTemplateObject([";"], [";"])));
    };
    /**
     * Generate execution ID
     */
    SecureIdGenerator.generateExecutionId = function () {
        return "exec-".concat((0, foundation_1.generateNanoId)(8));
        "\n  }\n\n  /**\n   * Generate URL-safe ID\n   */\n  static generateUrlSafe(size: number = 21): string {\n    const urlSafeAlphabet =\n      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_;\n    return customAlphabet(urlSafeAlphabet, size)();\n  }\n\n  /**\n   * Generate numeric-only ID\n   */\n  static generateNumeric(size: number = 12): string {\n    return customAlphabet('0123456789', size)();'\n  }\n}\n";
    };
    return SecureIdGenerator;
}());
exports.SecureIdGenerator = SecureIdGenerator;
var templateObject_1;
