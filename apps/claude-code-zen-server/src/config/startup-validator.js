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
import { getLogger } from '../config/logging-config';
const logger = getLogger('src-config-startup-validator'); // Use any to allow flexible logger interface
import * as process from 'node:process';
import { configHealthChecker } from './health-checker';
import { configManager } from './manager';
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
export async function runStartupValidation(options = {}) {
    const { strict = process.env['NODE_ENV'] === 'production', enforceProductionStandards = process.env['NODE_ENV'] === 'production', skipValidation = [], outputFormat = 'console', } = options;
    const startTime = Date.now();
    const environment = process.env['NODE_ENV'] || 'development';
    if (outputFormat === 'console') {
        logger.info('\n🔍 Running Claude-Zen configuration validation...');
        logger.info(`Environment: ${environment}`);
        logger.info(`Strict mode: ${strict ? '✅ Enabled' : '❌ Disabled'}`);
    }
    try {
        // Initialize configuration manager
        const configValidation = await configManager?.initialize();
        // Initialize health checker
        await configHealthChecker?.initialize({ enableMonitoring: false });
        const errors = [];
        const warnings = [];
        const blockers = [];
        // 1. Structure validation (unless skipped)
        if (!skipValidation.includes('structure')) {
            if (outputFormat === 'console') {
                process.stdout.write('📋 Validating configuration structure... ');
            }
            if (!configValidation?.valid) {
                errors.push(...configValidation?.errors);
                if (strict) {
                    blockers.push(...configValidation?.errors);
                }
            }
            warnings.push(...configValidation?.warnings);
            if (outputFormat === 'console') {
                logger.info(configValidation?.valid ? '✅' : '❌');
            }
        }
        // 2. Enhanced validation with production checks
        const detailedValidation = await configHealthChecker?.getHealthReport(true);
        const validationDetails = detailedValidation.validationDetails;
        // 3. Security validation (unless skipped)
        if (!skipValidation.includes('security')) {
            if (outputFormat === 'console') {
                process.stdout.write('🔒 Validating security configuration... ');
            }
            if (validationDetails.securityIssues.length > 0) {
                errors.push(...validationDetails.securityIssues);
                if (enforceProductionStandards || environment === 'production') {
                    blockers.push(...validationDetails.securityIssues);
                }
            }
            if (outputFormat === 'console') {
                logger.info(validationDetails.securityIssues.length === 0 ? '✅' : '❌');
            }
        }
        // 4. Port conflict validation (unless skipped)
        let portConflicts = [];
        if (!skipValidation.includes('ports')) {
            if (outputFormat === 'console') {
                process.stdout.write('🌐 Validating port configuration... ');
            }
            const portCheck = await configHealthChecker?.checkPortConflicts();
            portConflicts = portCheck.conflicts;
            if (portConflicts.length > 0) {
                const criticalConflicts = portConflicts.filter((c) => c.severity === 'error');
                if (criticalConflicts.length > 0) {
                    errors.push(...criticalConflicts.map((c) => `Port conflict: ${c.port} used by ${c.services.join(', ')}`));
                    blockers.push(...criticalConflicts.map((c) => `Critical port conflict on ${c.port}`));
                }
                const warningConflicts = portConflicts.filter((c) => c.severity === 'warning');
                warnings.push(...warningConflicts.map((c) => `Port ${c.port} shared by ${c.services.join(', ')}`));
            }
            if (outputFormat === 'console') {
                logger.info(portConflicts.length === 0
                    ? '✅'
                    : portConflicts.some((c) => c.severity === 'error')
                        ? '❌'
                        : '⚠️');
            }
        }
        // 5. Environment variable validation (unless skipped)
        if (!skipValidation.includes('environment')) {
            if (outputFormat === 'console') {
                process.stdout.write('🌍 Validating environment variables... ');
            }
            const envIssues = await validateEnvironmentVariables(environment === 'production');
            if (envIssues.errors.length > 0) {
                errors.push(...envIssues.errors);
                if (environment === 'production') {
                    blockers.push(...envIssues.errors);
                }
            }
            warnings.push(...envIssues.warnings);
            if (outputFormat === 'console') {
                logger.info(envIssues.errors.length === 0 ? '✅' : '❌');
            }
        }
        // 6. Performance validation (unless skipped)
        if (!skipValidation.includes('performance')) {
            if (outputFormat === 'console') {
                process.stdout.write('⚡ Validating performance configuration... ');
            }
            warnings.push(...validationDetails.performanceWarnings);
            if (outputFormat === 'console') {
                logger.info(validationDetails.performanceWarnings.length <= 2 ? '✅' : '⚠️');
            }
        }
        // 7. Production readiness check
        if (enforceProductionStandards) {
            if (outputFormat === 'console') {
                process.stdout.write('🚀 Validating production readiness... ');
            }
            if (!validationDetails.productionReady) {
                const message = 'Configuration is not production-ready';
                errors.push(message);
                if (environment === 'production') {
                    blockers.push(message);
                }
            }
            if (outputFormat === 'console') {
                logger.info(validationDetails.productionReady ? '✅' : '❌');
            }
        }
        // Determine success and exit code
        const success = blockers.length === 0;
        const exitCode = success ? 0 : 1;
        const result = {
            success,
            errors,
            warnings,
            blockers,
            environment,
            timestamp: startTime,
            validationDetails,
            portConflicts,
            exitCode,
        };
        // Output results
        await outputValidationResults(result, outputFormat);
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        const result = {
            success: false,
            errors: [errorMessage],
            warnings: [],
            blockers: [errorMessage],
            environment,
            timestamp: startTime,
            validationDetails: {
                valid: false,
                errors: [errorMessage],
                warnings: [],
                productionReady: false,
                securityIssues: [],
                portConflicts: [],
                performanceWarnings: [],
                failsafeApplied: [],
            },
            portConflicts: [],
            exitCode: 1,
        };
        await outputValidationResults(result, outputFormat);
        return result;
    }
}
/**
 * Validate environment variables for proper configuration.
 *
 * Checks required environment variables, validates their format and values,
 * and provides warnings for potential production misconfigurations.
 *
 * @param isProduction - Whether to apply production-specific validations
 * @returns Promise resolving to validation errors and warnings
 *
 * @example Environment Validation
 * ```typescript
 * const { errors, warnings } = await validateEnvironmentVariables(true);
 * if (errors.length > 0) {
 *   console.error('Environment validation failed:', errors);
 * }
 * ```
 */
async function validateEnvironmentVariables(isProduction) {
    const errors = [];
    const warnings = [];
    // Required environment variables
    const requiredVars = ['NODE_ENV'];
    // Note: ANTHROPIC_API_KEY is optional - only needed for FACT integration
    for (const envVar of requiredVars) {
        if (!process.env[envVar]) {
            errors.push(`Required environment variable missing: ${envVar}`);
        }
    }
    // Validate NODE_ENV value
    const validNodeEnvs = ['development', 'production', 'test'];
    if (process.env['NODE_ENV'] &&
        !validNodeEnvs?.includes(process.env['NODE_ENV'])) {
        errors.push(`Invalid NODE_ENV value: ${process.env['NODE_ENV']}. Must be one of: ${validNodeEnvs?.join(', ')}`);
    }
    // Validate API key format (basic check - only warn if provided)
    if (process.env['ANTHROPIC_API_KEY'] &&
        process.env['ANTHROPIC_API_KEY'].length < 10) {
        warnings.push('ANTHROPIC_API_KEY appears to be too short or invalid (only needed for FACT integration)');
    }
    // Check for common production misconfigurations
    if (isProduction) {
        if (process.env['DEBUG']) {
            warnings.push('DEBUG environment variable is set in production');
        }
        if (process.env['CLAUDE_LOG_LEVEL'] === 'debug') {
            warnings.push('Debug logging enabled in production - consider using "info" level');
        }
    }
    return { errors, warnings };
}
/**
 * Output validation results in the specified format.
 *
 * Formats and displays validation results according to the requested output
 * format (console, JSON, or silent). Provides comprehensive reporting including
 * health scores, recommendations, and detailed issue breakdown.
 *
 * @param result - Validation result to output
 * @param format - Output format (console, json, or silent)
 * @returns Promise resolving when output is complete
 *
 * @example Console Output
 * ```typescript
 * await outputValidationResults(result, 'console');
 * // Displays formatted console output with icons and colors
 * ```
 *
 * @example JSON Output
 * ```typescript
 * await outputValidationResults(result, 'json');
 * // Outputs structured JSON for CI/CD integration
 * ```
 */
async function outputValidationResults(result, format) {
    if (format === 'silent') {
        return;
    }
    if (format === 'json') {
        logger.info(JSON.stringify(result, null, 2));
        return;
    }
    // Console output
    logger.info('\n📊 Validation Results:');
    logger.info(`Overall: ${result?.success ? '✅ PASSED' : '❌ FAILED'}`);
    if (result?.blockers.length > 0) {
        logger.info('\n🚫 Critical Issues (deployment blockers):');
        result?.blockers.forEach((blocker) => logger.info(`  ❌ ${blocker}`));
    }
    if (result?.errors.length > 0) {
        logger.info('\n❌ Errors:');
        result?.errors.forEach((error) => logger.info(`  ❌ ${error}`));
    }
    if (result?.warnings.length > 0) {
        logger.info('\n⚠️  Warnings:');
        result?.warnings.forEach((warning) => logger.info(`  ⚠️  ${warning}`));
    }
    if (result?.portConflicts.length > 0) {
        logger.info('\n🌐 Port Conflicts:');
        result?.portConflicts?.forEach((conflict) => {
            const icon = conflict.severity === 'error' ? '❌' : '⚠️';
            logger.info(`  ${icon} Port ${conflict.port}: ${conflict.services.join(', ')}`);
        });
    }
    // Recommendations
    if (result?.validationDetails?.failsafeApplied.length > 0) {
        logger.info('\n🛡️  Failsafe Defaults Applied:');
        result?.validationDetails?.failsafeApplied?.forEach((applied) => logger.info(`  🛡️  ${applied}`));
    }
    // Health score
    const healthReport = await configHealthChecker?.getHealthReport();
    logger.info(`\n💯 Configuration Health Score: ${healthReport.score}/100 (${healthReport.status.toUpperCase()})`);
    if (!result?.success) {
        logger.info('\n🚨 Fix the issues above before deploying to production!');
    }
    else if (result?.warnings.length > 0) {
        logger.info('\n✅ Configuration is valid but consider addressing the warnings above.');
    }
    else {
        logger.info('\n🎉 Configuration is healthy and production-ready!');
    }
    logger.info(`\nValidation completed in ${Date.now() - result?.timestamp}ms`);
}
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
export async function validateAndExit(options = {}) {
    const result = await runStartupValidation(options);
    process.exit(result?.exitCode);
}
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
export async function cli() {
    const args = process.argv.slice(2);
    const options = {
        strict: args.includes('--strict'),
        enforceProductionStandards: args.includes('--production-standards'),
        outputFormat: args.includes('--json')
            ? 'json'
            : args.includes('--silent')
                ? 'silent'
                : 'console',
        skipValidation: [],
    };
    // Parse skip validation flags
    if (args.includes('--skip-structure'))
        options?.['skipValidation'].push('structure');
    if (args.includes('--skip-security'))
        options?.['skipValidation'].push('security');
    if (args.includes('--skip-performance'))
        options?.['skipValidation'].push('performance');
    if (args.includes('--skip-ports'))
        options?.['skipValidation'].push('ports');
    if (args.includes('--skip-environment'))
        options?.['skipValidation'].push('environment');
    // Show help
    if (args.includes('--help') || args.includes('-h')) {
        logger.info(`
Claude-Zen Configuration Startup Validator

Usage: node startup-validator.js [options]

Options:
  --strict                    Fail on any configuration errors
  --production-standards      Enforce production standards even in development
  --json                     Output results in JSON format
  --silent                   Suppress all output
  --skip-structure           Skip structure validation
  --skip-security            Skip security validation
  --skip-performance         Skip performance validation
  --skip-ports               Skip port conflict validation
  --skip-environment         Skip environment variable validation
  --help, -h                 Show this help message

Examples:
  # Basic validation
  node startup-validator.js

  # Strict validation for production deployment
  node startup-validator.js --strict --production-standards

  # JSON output for CI/CD integration
  node startup-validator.js --json --strict
`);
        process.exit(0);
    }
    await validateAndExit(options);
}
//# sourceMappingURL=startup-validator.js.map