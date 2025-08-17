/**
 * @fileoverview Startup Configuration Validator - Production-ready configuration validation at startup
 *
 * This module provides comprehensive startup validation for Claude Code Zen configuration
 * to ensure the system is properly configured before deployment. Performs fail-fast validation
 * with detailed reporting for production readiness, security compliance, and operational safety.
 *
 * **Key Features:**
 * - **Fail-Fast Validation**: Immediate validation at startup with process exit on critical errors
 * - **Production Readiness**: Comprehensive production deployment validation checks
 * - **Security Validation**: Security configuration compliance and vulnerability detection
 * - **Port Conflict Detection**: Automatic detection and reporting of port conflicts
 * - **Environment Validation**: Environment variable validation and best practices
 * - **Performance Assessment**: Performance configuration validation and optimization recommendations
 * - **Multiple Output Formats**: Console, JSON, and silent output modes for different use cases
 * - **Selective Validation**: Skip specific validation categories when needed
 *
 * **Validation Categories:**
 * - **Structure**: Configuration file structure and required fields
 * - **Security**: Security settings, API keys, and compliance checks
 * - **Performance**: Performance configuration and optimization settings
 * - **Ports**: Port allocation and conflict detection
 * - **Environment**: Environment variables and deployment-specific settings
 * - **Production Readiness**: Overall production deployment suitability
 *
 * **Exit Codes:**
 * - 0: Validation passed successfully
 * - 1: Validation failed with critical errors (deployment blockers)
 *
 * @example Basic Startup Validation
 * ```typescript
 * import { runStartupValidation } from './startup-validator';
 *
 * // Basic validation with default settings
 * const result = await runStartupValidation();
 *
 * if (result.success) {
 *   console.log('✅ Configuration validation passed');
 *   console.log(`Health score: ${result.validationDetails.score}/100`);
 * } else {
 *   console.error('❌ Configuration validation failed');
 *   console.error('Blockers:', result.blockers);
 *   process.exit(result.exitCode);
 * }
 * ```
 *
 * @example Production Deployment Validation
 * ```typescript
 * import { runStartupValidation } from './startup-validator';
 *
 * // Strict validation for production deployment
 * const result = await runStartupValidation({
 *   strict: true,
 *   enforceProductionStandards: true,
 *   outputFormat: 'json'
 * });
 *
 * // Export results for CI/CD pipeline
 * if (!result.success) {
 *   console.error(JSON.stringify({
 *     status: 'failed',
 *     blockers: result.blockers,
 *     errors: result.errors,
 *     warnings: result.warnings
 *   }));
 *   process.exit(1);
 * }
 * ```
 *
 * @example Selective Validation
 * ```typescript
 * import { runStartupValidation } from './startup-validator';
 *
 * // Skip specific validation categories
 * const result = await runStartupValidation({
 *   skipValidation: ['performance', 'environment'],
 *   outputFormat: 'console'
 * });
 *
 * // Only validate structure, security, and ports
 * console.log('Validation completed with selective checks');
 * ```
 *
 * @example CLI Integration
 * ```bash
 * # Basic validation
 * node startup-validator.js
 *
 * # Strict production validation
 * node startup-validator.js --strict --production-standards
 *
 * # JSON output for automation
 * node startup-validator.js --json --strict
 *
 * # Skip specific validations
 * node startup-validator.js --skip-performance --skip-environment
 * ```
 *
 * @example Process Exit Validation
 * ```typescript
 * import { validateAndExit } from './startup-validator';
 *
 * // Validate and exit process automatically
 * await validateAndExit({
 *   strict: process.env.NODE_ENV === 'production',
 *   enforceProductionStandards: true
 * });
 *
 * // This line will only execute if validation passes
 * console.log('✅ All validations passed, starting application...');
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 *
 * @see {@link StartupValidationOptions} Validation configuration options
 * @see {@link StartupValidationResult} Validation result interface
 * @see {@link validateAndExit} Process exit validation function
 * @see {@link cli} CLI entry point for validation
 */
import type { ValidationResult } from '../types/config-types';
/**
 * Startup validation options for configuring validation behavior.
 *
 * Provides comprehensive configuration for startup validation including
 * strictness levels, production standards enforcement, selective validation
 * skipping, and output format control.
 *
 * @example Basic Options
 * ```typescript
 * const options: StartupValidationOptions = {
 *   strict: true,
 *   enforceProductionStandards: true,
 *   outputFormat: 'console'
 * };
 * ```
 *
 * @example Selective Validation
 * ```typescript
 * const options: StartupValidationOptions = {
 *   skipValidation: ['performance', 'environment'],
 *   outputFormat: 'json'
 * };
 * ```
 */
export interface StartupValidationOptions {
    /** Fail fast on any configuration errors */
    strict?: boolean;
    /** Check production readiness even in development */
    enforceProductionStandards?: boolean;
    /** Skip certain validation categories */
    skipValidation?: Array<'structure' | 'security' | 'performance' | 'ports' | 'environment'>;
    /** Output format for validation results */
    outputFormat?: 'console' | 'json' | 'silent';
}
/**
 * Startup validation result containing comprehensive validation information.
 *
 * Provides detailed validation results including success status, errors,
 * warnings, deployment blockers, port conflicts, and validation details
 * for comprehensive assessment of configuration health.
 *
 * @example Result Processing
 * ```typescript
 * const result: StartupValidationResult = await runStartupValidation();
 *
 * if (!result.success) {
 *   console.error('Validation failed:');
 *   result.blockers.forEach(blocker => console.error('- ' + blocker));
 *   process.exit(result.exitCode);
 * }
 *
 * if (result.warnings.length > 0) {
 *   console.warn('Warnings detected:');
 *   result.warnings.forEach(warning => console.warn('- ' + warning));
 * }
 * ```
 */
export interface StartupValidationResult {
    success: boolean;
    errors: string[];
    warnings: string[];
    blockers: string[];
    environment: string;
    timestamp: number;
    validationDetails: ValidationResult;
    portConflicts: Array<{
        port: number;
        services: string[];
        severity: 'error' | 'warning';
    }>;
    exitCode: number;
}
/**
 * Run comprehensive startup validation with configurable options.
 *
 * Performs thorough validation of configuration, security, performance,
 * ports, environment variables, and production readiness. Provides
 * detailed reporting and fail-fast behavior for critical issues.
 *
 * @param options - Validation configuration options
 * @returns Promise resolving to comprehensive validation result
 *
 * @example Basic Validation
 * ```typescript
 * const result = await runStartupValidation();
 * if (!result.success) {
 *   console.error('Validation failed:', result.errors);
 * }
 * ```
 *
 * @example Production Validation
 * ```typescript
 * const result = await runStartupValidation({
 *   strict: true,
 *   enforceProductionStandards: true,
 *   outputFormat: 'json'
 * });
 * ```
 */
export declare function runStartupValidation(options?: StartupValidationOptions): Promise<StartupValidationResult>;
/**
 * Run startup validation and exit process if validation fails.
 *
 * Convenience function that performs validation and automatically exits
 * the process with appropriate exit codes. Useful for startup scripts
 * and deployment validation where immediate failure is desired.
 *
 * @param options - Validation configuration options
 * @returns Never returns (always exits process)
 *
 * @example Process Exit Validation
 * ```typescript
 * // This will exit the process if validation fails
 * await validateAndExit({
 *   strict: true,
 *   enforceProductionStandards: true
 * });
 *
 * // Code here only runs if validation passes
 * console.log('Starting application...');
 * ```
 */
export declare function validateAndExit(options?: StartupValidationOptions): Promise<never>;
/**
 * CLI entry point for startup validation with argument parsing.
 *
 * Provides command-line interface for startup validation with support
 * for various flags and options. Parses command-line arguments and
 * executes validation with appropriate configuration.
 *
 * @returns Promise resolving when CLI execution is complete
 *
 * @example CLI Usage
 * ```bash
 * # Basic validation
 * node startup-validator.js
 *
 * # Strict validation
 * node startup-validator.js --strict
 *
 * # JSON output
 * node startup-validator.js --json
 *
 * # Skip specific validations
 * node startup-validator.js --skip-performance --skip-environment
 * ```
 */
export declare function cli(): Promise<void>;
//# sourceMappingURL=startup-validator.d.ts.map