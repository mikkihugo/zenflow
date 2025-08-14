import { getLogger } from './logging-config.ts';
const logger = getLogger('src-config-startup-validator');
import * as process from 'node:process';
import { configHealthChecker } from './health-checker.ts';
import { configManager } from './manager.ts';
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
        const configValidation = await configManager?.initialize();
        await configHealthChecker?.initialize({ enableMonitoring: false });
        const errors = [];
        const warnings = [];
        const blockers = [];
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
        const detailedValidation = await configHealthChecker?.getHealthReport(true);
        const validationDetails = detailedValidation.validationDetails;
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
        if (!skipValidation.includes('performance')) {
            if (outputFormat === 'console') {
                process.stdout.write('⚡ Validating performance configuration... ');
            }
            warnings.push(...validationDetails.performanceWarnings);
            if (outputFormat === 'console') {
                logger.info(validationDetails.performanceWarnings.length <= 2 ? '✅' : '⚠️');
            }
        }
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
async function validateEnvironmentVariables(isProduction) {
    const errors = [];
    const warnings = [];
    const requiredVars = ['NODE_ENV'];
    if (isProduction) {
        requiredVars.push('ANTHROPIC_API_KEY');
    }
    for (const envVar of requiredVars) {
        if (!process.env[envVar]) {
            errors.push(`Required environment variable missing: ${envVar}`);
        }
    }
    const validNodeEnvs = ['development', 'production', 'test'];
    if (process.env['NODE_ENV'] &&
        !validNodeEnvs?.includes(process.env['NODE_ENV'])) {
        errors.push(`Invalid NODE_ENV value: ${process.env['NODE_ENV']}. Must be one of: ${validNodeEnvs?.join(', ')}`);
    }
    if (process.env['ANTHROPIC_API_KEY'] &&
        process.env['ANTHROPIC_API_KEY'].length < 10) {
        errors.push('ANTHROPIC_API_KEY appears to be too short or invalid');
    }
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
async function outputValidationResults(result, format) {
    if (format === 'silent') {
        return;
    }
    if (format === 'json') {
        logger.info(JSON.stringify(result, null, 2));
        return;
    }
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
    if (result?.validationDetails?.failsafeApplied.length > 0) {
        logger.info('\n🛡️  Failsafe Defaults Applied:');
        result?.validationDetails?.failsafeApplied?.forEach((applied) => logger.info(`  🛡️  ${applied}`));
    }
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
export async function validateAndExit(options = {}) {
    const result = await runStartupValidation(options);
    process.exit(result?.exitCode);
}
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