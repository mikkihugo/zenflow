/**
 * @file Configuration Validator.
 *
 * Validates configuration against schema and provides detailed error reporting.
 */
import type { ConfigValidationResult, SystemConfiguration, ValidationResult } from './types.ts';
/**
 * Configuration validator.
 *
 * @example
 */
export declare class ConfigValidator {
    /**
     * Validate configuration object.
     *
     * @param config
     */
    validate(config: SystemConfiguration): ConfigValidationResult;
    /**
     * Validate basic structure.
     *
     * @param config
     * @param errors
     */
    private validateStructure;
    /**
     * Validate against specific rules.
     *
     * @param config
     * @param errors
     * @param warnings
     */
    private validateRules;
    /**
     * Validate configuration dependencies.
     *
     * @param config
     * @param errors
     * @param warnings
     */
    private validateDependencies;
    /**
     * Validate constraints and logical consistency.
     *
     * @param config
     * @param errors
     * @param warnings
     */
    private validateConstraints;
    /**
     * Get nested value using dot notation.
     *
     * @param obj
     * @param path
     */
    private getNestedValue;
    /**
     * Validate specific configuration section.
     *
     * @param _config
     * @param section
     */
    validateSection(_config: SystemConfiguration, section: string): ConfigValidationResult;
    /**
     * Enhanced validation with production readiness check.
     *
     * @param config - System configuration to validate.
     * @returns Enhanced validation result with production readiness details.
     */
    validateEnhanced(config: SystemConfiguration): ValidationResult;
    /**
     * Get configuration health report.
     *
     * @param config
     */
    getHealthReport(config: SystemConfiguration): {
        status: 'healthy' | 'warning' | 'critical';
        score: number;
        details: {
            structure: boolean;
            security: boolean;
            performance: boolean;
            production: boolean;
        };
        recommendations: string[];
    };
}
//# sourceMappingURL=validator.d.ts.map