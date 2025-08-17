/**
 * @fileoverview Configuration Validator - Comprehensive configuration validation and health checking
 *
 * This module provides robust configuration validation with detailed error reporting,
 * health assessment, and production readiness checking. Validates configuration structure,
 * rules compliance, dependencies, constraints, and provides comprehensive health reports.
 *
 * **Key Features:**
 * - **Structure Validation**: Required sections and subsections validation
 * - **Rule Compliance**: Validation against predefined rules and schemas
 * - **Dependency Checking**: Inter-configuration dependency validation
 * - **Constraint Validation**: Logical consistency and resource constraint checking
 * - **Health Assessment**: Comprehensive health scoring and status reporting
 * - **Production Readiness**: Production deployment suitability validation
 * - **Security Validation**: Security configuration compliance checking
 * - **Performance Assessment**: Performance configuration optimization recommendations
 *
 * **Validation Categories:**
 * - **Structure**: Required configuration sections and subsections
 * - **Types**: Data type validation (string, number, boolean, enum)
 * - **Ranges**: Numeric range and boundary validation
 * - **Dependencies**: Inter-configuration dependency validation
 * - **Constraints**: Logical consistency and resource constraints
 * - **Security**: Security settings and compliance validation
 * - **Performance**: Performance impact assessment and optimization
 *
 * @example Basic Configuration Validation
 * ```typescript
 * import { ConfigValidator } from './validator';
 *
 * const validator = new ConfigValidator();
 * const result = validator.validate(config);
 *
 * if (result.valid) {
 *   console.log('✅ Configuration is valid');
 * } else {
 *   console.error('❌ Configuration validation failed:');
 *   result.errors.forEach(error => console.error('  -', error));
 * }
 *
 * if (result.warnings.length > 0) {
 *   console.warn('⚠️ Configuration warnings:');
 *   result.warnings.forEach(warning => console.warn('  -', warning));
 * }
 * ```
 *
 * @example Enhanced Validation with Production Readiness
 * ```typescript
 * const validator = new ConfigValidator();
 * const result = validator.validateEnhanced(config);
 *
 * console.log('Production ready:', result.productionReady);
 * console.log('Security issues:', result.securityIssues.length);
 * console.log('Port conflicts:', result.portConflicts.length);
 * console.log('Performance warnings:', result.performanceWarnings.length);
 *
 * if (!result.productionReady) {
 *   console.error('Configuration not ready for production deployment');
 * }
 * ```
 *
 * @example Configuration Health Assessment
 * ```typescript
 * const validator = new ConfigValidator();
 * const healthReport = validator.getHealthReport(config);
 *
 * console.log(`Health Status: ${healthReport.status}`);
 * console.log(`Health Score: ${healthReport.score}/100`);
 * console.log('Component Health:');
 * console.log('  Structure:', healthReport.details.structure ? '✅' : '❌');
 * console.log('  Security:', healthReport.details.security ? '✅' : '❌');
 * console.log('  Performance:', healthReport.details.performance ? '✅' : '❌');
 * console.log('  Production:', healthReport.details.production ? '✅' : '❌');
 *
 * if (healthReport.recommendations.length > 0) {
 *   console.log('Recommendations:');
 *   healthReport.recommendations.forEach(rec => console.log('  -', rec));
 * }
 * ```
 *
 * @example Section-Specific Validation
 * ```typescript
 * const validator = new ConfigValidator();
 *
 * // Validate specific configuration sections
 * const coreValidation = validator.validateSection(config, 'core');
 * const interfacesValidation = validator.validateSection(config, 'interfaces');
 * const storageValidation = validator.validateSection(config, 'storage');
 *
 * console.log('Core section valid:', coreValidation.valid);
 * console.log('Interfaces section valid:', interfacesValidation.valid);
 * console.log('Storage section valid:', storageValidation.valid);
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 *
 * @see {@link ConfigValidationResult} Basic validation result interface
 * @see {@link ValidationResult} Enhanced validation result interface
 * @see {@link SystemConfiguration} System configuration interface
 * @see {@link VALIDATION_RULES} Configuration validation rules
 */
import type { ConfigValidationResult, SystemConfiguration, ValidationResult } from '../types/config-types';
/**
 * Configuration validator with comprehensive validation and health assessment capabilities.
 *
 * Provides thorough validation of system configuration including structure validation,
 * rule compliance checking, dependency validation, constraint verification, and
 * comprehensive health assessment with production readiness evaluation.
 *
 * **Validation Features:**
 * - **Structure validation**: Required sections and subsections
 * - **Type validation**: Data type checking and conversion
 * - **Rule compliance**: Validation against predefined rules
 * - **Dependency checking**: Inter-configuration dependency validation
 * - **Constraint validation**: Logical consistency and resource constraints
 * - **Health assessment**: Comprehensive health scoring and reporting
 * - **Production readiness**: Deployment suitability evaluation
 *
 * @example Basic Usage
 * ```typescript
 * const validator = new ConfigValidator();
 * const result = validator.validate(config);
 *
 * if (!result.valid) {
 *   console.error('Validation failed:', result.errors);
 * }
 * ```
 *
 * @example Health Assessment
 * ```typescript
 * const validator = new ConfigValidator();
 * const health = validator.getHealthReport(config);
 *
 * console.log(`Health: ${health.status} (${health.score}/100)`);
 * ```
 *
 * @example Enhanced Validation
 * ```typescript
 * const validator = new ConfigValidator();
 * const result = validator.validateEnhanced(config);
 *
 * console.log('Production ready:', result.productionReady);
 * console.log('Security issues:', result.securityIssues);
 * ```
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