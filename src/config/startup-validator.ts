import { getLogger } from "../config/logging-config";
const logger = getLogger("src-config-startup-validator");
/**
 * @file Startup Configuration Validator.
 *
 * Production-ready configuration validation that runs at startup
 * Fails fast if configuration is invalid for deployment.
 */

import process from 'node:process';
import { configManager } from './manager';
import { configHealthChecker } from './health-checker';

/**
 * Startup validation options.
 *
 * @example
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
 * Startup validation result.
 *
 * @example
 */
export interface StartupValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  blockers: string[];
  environment: string;
  timestamp: number;
  validationDetails: ValidationResult;
  portConflicts: Array<{ port: number; services: string[]; severity: 'error' | 'warning' }>;
  exitCode: number;
}

/**
 * Run comprehensive startup validation.
 *
 * @param options - Validation options.
 * @returns Validation result.
 * @example
 */
export async function runStartupValidation(
  options: StartupValidationOptions = {}
): Promise<StartupValidationResult> {
  const {
    strict = process.env['NODE_ENV'] === 'production',
    enforceProductionStandards = process.env['NODE_ENV'] === 'production',
    skipValidation = [],
    outputFormat = 'console'
  } = options;

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

    const errors: string[] = [];
    const warnings: string[] = [];
    const blockers: string[] = [];

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
    const validationDetails = detailedValidation.validationDetails!;

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
    let portConflicts: Array<{ port: number; services: string[]; severity: 'error' | 'warning' }> = [];
    if (!skipValidation.includes('ports')) {
      if (outputFormat === 'console') {
        process.stdout.write('🌐 Validating port configuration... ');
      }
      
      const portCheck = await configHealthChecker?.checkPortConflicts();
      portConflicts = portCheck.conflicts;
      
      if (portConflicts.length > 0) {
        const criticalConflicts = portConflicts.filter(c => c.severity === 'error');
        if (criticalConflicts.length > 0) {
          errors.push(...criticalConflicts.map(c => `Port conflict: ${c.port} used by ${c.services.join(', ')}`));
          blockers.push(...criticalConflicts.map(c => `Critical port conflict on ${c.port}`));
        }
        
        const warningConflicts = portConflicts.filter(c => c.severity === 'warning');
        warnings.push(...warningConflicts.map(c => `Port ${c.port} shared by ${c.services.join(', ')}`));
      }
      
      if (outputFormat === 'console') {
        logger.info(
          portConflicts.length === 0 ? '✅' : portConflicts.some(c => c.severity === 'error') ? '❌' : '⚠️'
        );
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

    const result: StartupValidationResult = {
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

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    const result: StartupValidationResult = {
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
 * Validate environment variables.
 *
 * @param isProduction
 * @example
 */
async function validateEnvironmentVariables(isProduction: boolean): Promise<{
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const requiredVars = ['NODE_ENV'];
  if (isProduction) {
    requiredVars.push('ANTHROPIC_API_KEY');
  }

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      errors.push(`Required environment variable missing: ${envVar}`);
    }
  }

  // Validate NODE_ENV value
  const validNodeEnvs = ['development', 'production', 'test'];
  if (process.env['NODE_ENV'] && !validNodeEnvs?.includes(process.env['NODE_ENV'])) {
    errors.push(`Invalid NODE_ENV value: ${process.env['NODE_ENV']}. Must be one of: ${validNodeEnvs?.join(', ')}`);
  }

  // Validate API key format (basic check)
  if (process.env['ANTHROPIC_API_KEY'] && process.env['ANTHROPIC_API_KEY'].length < 10) {
    errors.push('ANTHROPIC_API_KEY appears to be too short or invalid');
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
 * @param result
 * @param format
 * @example
 */
async function outputValidationResults(
  result: StartupValidationResult,
  format: 'console' | 'json' | 'silent'
): Promise<void> {
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
    result?.blockers?.forEach(blocker => logger.info(`  ❌ ${blocker}`));
  }

  if (result?.errors.length > 0) {
    logger.info('\n❌ Errors:');
    result?.errors?.forEach(error => logger.info(`  ❌ ${error}`));
  }

  if (result?.warnings.length > 0) {
    logger.info('\n⚠️  Warnings:');
    result?.warnings?.forEach(warning => logger.info(`  ⚠️  ${warning}`));
  }

  if (result?.portConflicts.length > 0) {
    logger.info('\n🌐 Port Conflicts:');
    result?.portConflicts?.forEach(conflict => {
      const icon = conflict.severity === 'error' ? '❌' : '⚠️';
      logger.info(`  ${icon} Port ${conflict.port}: ${conflict.services.join(', ')}`);
    });
  }

  // Recommendations
  if (result?.validationDetails?.failsafeApplied.length > 0) {
    logger.info('\n🛡️  Failsafe Defaults Applied:');
    result?.validationDetails?.failsafeApplied?.forEach(applied => logger.info(`  🛡️  ${applied}`));
  }

  // Health score
  const healthReport = await configHealthChecker?.getHealthReport();
  logger.info(
    `\n💯 Configuration Health Score: ${healthReport.score}/100 (${healthReport.status.toUpperCase()})`
  );

  if (!result?.success) {
    logger.info('\n🚨 Fix the issues above before deploying to production!');
  } else if (result?.warnings.length > 0) {
    logger.info('\n✅ Configuration is valid but consider addressing the warnings above.');
  } else {
    logger.info('\n🎉 Configuration is healthy and production-ready!');
  }

  logger.info(`\nValidation completed in ${Date.now() - result?.timestamp}ms`);
}

/**
 * Run startup validation and exit process if validation fails.
 *
 * @param options - Validation options.
 * @example
 */
export async function validateAndExit(options: StartupValidationOptions = {}): Promise<never> {
  const result = await runStartupValidation(options);
  process.exit(result?.exitCode);
}

/**
 * CLI entry point for startup validation.
 *
 * @example
 */
export async function cli(): Promise<void> {
  const args = process.argv.slice(2);
  
  const options: StartupValidationOptions = {
    strict: args.includes('--strict'),
    enforceProductionStandards: args.includes('--production-standards'),
    outputFormat: args.includes('--json') ? 'json' : args.includes('--silent') ? 'silent' : 'console',
    skipValidation: []
  };

  // Parse skip validation flags
  if (args.includes('--skip-structure')) options?.["skipValidation"]!.push('structure');
  if (args.includes('--skip-security')) options?.["skipValidation"]!.push('security');
  if (args.includes('--skip-performance')) options?.["skipValidation"]!.push('performance');
  if (args.includes('--skip-ports')) options?.["skipValidation"]!.push('ports');
  if (args.includes('--skip-environment')) options?.["skipValidation"]!.push('environment');

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