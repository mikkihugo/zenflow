
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  configHealthChecker,
  configManager
} from "./chunk-FM4MP6XX.js";
import {
  getLogger
} from "./chunk-NECHN6IW.js";
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/config/startup-validator.ts
import * as process from "node:process";
var logger = getLogger("src-config-startup-validator");
async function runStartupValidation(options = {}) {
  const {
    strict = process.env["NODE_ENV"] === "production",
    enforceProductionStandards = process.env["NODE_ENV"] === "production",
    skipValidation = [],
    outputFormat = "console"
  } = options;
  const startTime = Date.now();
  const environment = process.env["NODE_ENV"] || "development";
  if (outputFormat === "console") {
    logger.info("\n\u{1F50D} Running Claude-Zen configuration validation...");
    logger.info(`Environment: ${environment}`);
    logger.info(`Strict mode: ${strict ? "\u2705 Enabled" : "\u274C Disabled"}`);
  }
  try {
    const configValidation = await configManager?.initialize();
    await configHealthChecker?.initialize({ enableMonitoring: false });
    const errors = [];
    const warnings = [];
    const blockers = [];
    if (!skipValidation.includes("structure")) {
      if (outputFormat === "console") {
        process.stdout.write("\u{1F4CB} Validating configuration structure... ");
      }
      if (!configValidation?.valid) {
        errors.push(...configValidation?.errors);
        if (strict) {
          blockers.push(...configValidation?.errors);
        }
      }
      warnings.push(...configValidation?.warnings);
      if (outputFormat === "console") {
        logger.info(configValidation?.valid ? "\u2705" : "\u274C");
      }
    }
    const detailedValidation = await configHealthChecker?.getHealthReport(true);
    const validationDetails = detailedValidation.validationDetails;
    if (!skipValidation.includes("security")) {
      if (outputFormat === "console") {
        process.stdout.write("\u{1F512} Validating security configuration... ");
      }
      if (validationDetails.securityIssues.length > 0) {
        errors.push(...validationDetails.securityIssues);
        if (enforceProductionStandards || environment === "production") {
          blockers.push(...validationDetails.securityIssues);
        }
      }
      if (outputFormat === "console") {
        logger.info(validationDetails.securityIssues.length === 0 ? "\u2705" : "\u274C");
      }
    }
    let portConflicts = [];
    if (!skipValidation.includes("ports")) {
      if (outputFormat === "console") {
        process.stdout.write("\u{1F310} Validating port configuration... ");
      }
      const portCheck = await configHealthChecker?.checkPortConflicts();
      portConflicts = portCheck.conflicts;
      if (portConflicts.length > 0) {
        const criticalConflicts = portConflicts.filter((c) => c.severity === "error");
        if (criticalConflicts.length > 0) {
          errors.push(
            ...criticalConflicts.map(
              (c) => `Port conflict: ${c.port} used by ${c.services.join(", ")}`
            )
          );
          blockers.push(...criticalConflicts.map((c) => `Critical port conflict on ${c.port}`));
        }
        const warningConflicts = portConflicts.filter((c) => c.severity === "warning");
        warnings.push(
          ...warningConflicts.map((c) => `Port ${c.port} shared by ${c.services.join(", ")}`)
        );
      }
      if (outputFormat === "console") {
        logger.info(
          portConflicts.length === 0 ? "\u2705" : portConflicts.some((c) => c.severity === "error") ? "\u274C" : "\u26A0\uFE0F"
        );
      }
    }
    if (!skipValidation.includes("environment")) {
      if (outputFormat === "console") {
        process.stdout.write("\u{1F30D} Validating environment variables... ");
      }
      const envIssues = await validateEnvironmentVariables(environment === "production");
      if (envIssues.errors.length > 0) {
        errors.push(...envIssues.errors);
        if (environment === "production") {
          blockers.push(...envIssues.errors);
        }
      }
      warnings.push(...envIssues.warnings);
      if (outputFormat === "console") {
        logger.info(envIssues.errors.length === 0 ? "\u2705" : "\u274C");
      }
    }
    if (!skipValidation.includes("performance")) {
      if (outputFormat === "console") {
        process.stdout.write("\u26A1 Validating performance configuration... ");
      }
      warnings.push(...validationDetails.performanceWarnings);
      if (outputFormat === "console") {
        logger.info(validationDetails.performanceWarnings.length <= 2 ? "\u2705" : "\u26A0\uFE0F");
      }
    }
    if (enforceProductionStandards) {
      if (outputFormat === "console") {
        process.stdout.write("\u{1F680} Validating production readiness... ");
      }
      if (!validationDetails.productionReady) {
        const message = "Configuration is not production-ready";
        errors.push(message);
        if (environment === "production") {
          blockers.push(message);
        }
      }
      if (outputFormat === "console") {
        logger.info(validationDetails.productionReady ? "\u2705" : "\u274C");
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
      exitCode
    };
    await outputValidationResults(result, outputFormat);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown validation error";
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
        failsafeApplied: []
      },
      portConflicts: [],
      exitCode: 1
    };
    await outputValidationResults(result, outputFormat);
    return result;
  }
}
__name(runStartupValidation, "runStartupValidation");
async function validateEnvironmentVariables(isProduction) {
  const errors = [];
  const warnings = [];
  const requiredVars = ["NODE_ENV"];
  if (isProduction) {
    requiredVars.push("ANTHROPIC_API_KEY");
  }
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      errors.push(`Required environment variable missing: ${envVar}`);
    }
  }
  const validNodeEnvs = ["development", "production", "test"];
  if (process.env["NODE_ENV"] && !validNodeEnvs?.includes(process.env["NODE_ENV"])) {
    errors.push(
      `Invalid NODE_ENV value: ${process.env["NODE_ENV"]}. Must be one of: ${validNodeEnvs?.join(", ")}`
    );
  }
  if (process.env["ANTHROPIC_API_KEY"] && process.env["ANTHROPIC_API_KEY"].length < 10) {
    errors.push("ANTHROPIC_API_KEY appears to be too short or invalid");
  }
  if (isProduction) {
    if (process.env["DEBUG"]) {
      warnings.push("DEBUG environment variable is set in production");
    }
    if (process.env["CLAUDE_LOG_LEVEL"] === "debug") {
      warnings.push('Debug logging enabled in production - consider using "info" level');
    }
  }
  return { errors, warnings };
}
__name(validateEnvironmentVariables, "validateEnvironmentVariables");
async function outputValidationResults(result, format) {
  if (format === "silent") {
    return;
  }
  if (format === "json") {
    logger.info(JSON.stringify(result, null, 2));
    return;
  }
  logger.info("\n\u{1F4CA} Validation Results:");
  logger.info(`Overall: ${result?.success ? "\u2705 PASSED" : "\u274C FAILED"}`);
  if (result?.blockers.length > 0) {
    logger.info("\n\u{1F6AB} Critical Issues (deployment blockers):");
    result?.blockers.forEach((blocker) => logger.info(`  \u274C ${blocker}`));
  }
  if (result?.errors.length > 0) {
    logger.info("\n\u274C Errors:");
    result?.errors.forEach((error) => logger.info(`  \u274C ${error}`));
  }
  if (result?.warnings.length > 0) {
    logger.info("\n\u26A0\uFE0F  Warnings:");
    result?.warnings.forEach((warning) => logger.info(`  \u26A0\uFE0F  ${warning}`));
  }
  if (result?.portConflicts.length > 0) {
    logger.info("\n\u{1F310} Port Conflicts:");
    result?.portConflicts?.forEach((conflict) => {
      const icon = conflict.severity === "error" ? "\u274C" : "\u26A0\uFE0F";
      logger.info(`  ${icon} Port ${conflict.port}: ${conflict.services.join(", ")}`);
    });
  }
  if (result?.validationDetails?.failsafeApplied.length > 0) {
    logger.info("\n\u{1F6E1}\uFE0F  Failsafe Defaults Applied:");
    result?.validationDetails?.failsafeApplied?.forEach(
      (applied) => logger.info(`  \u{1F6E1}\uFE0F  ${applied}`)
    );
  }
  const healthReport = await configHealthChecker?.getHealthReport();
  logger.info(
    `
\u{1F4AF} Configuration Health Score: ${healthReport.score}/100 (${healthReport.status.toUpperCase()})`
  );
  if (!result?.success) {
    logger.info("\n\u{1F6A8} Fix the issues above before deploying to production!");
  } else if (result?.warnings.length > 0) {
    logger.info("\n\u2705 Configuration is valid but consider addressing the warnings above.");
  } else {
    logger.info("\n\u{1F389} Configuration is healthy and production-ready!");
  }
  logger.info(`
Validation completed in ${Date.now() - result?.timestamp}ms`);
}
__name(outputValidationResults, "outputValidationResults");
async function validateAndExit(options = {}) {
  const result = await runStartupValidation(options);
  process.exit(result?.exitCode);
}
__name(validateAndExit, "validateAndExit");
async function cli() {
  const args = process.argv.slice(2);
  const options = {
    strict: args.includes("--strict"),
    enforceProductionStandards: args.includes("--production-standards"),
    outputFormat: args.includes("--json") ? "json" : args.includes("--silent") ? "silent" : "console",
    skipValidation: []
  };
  if (args.includes("--skip-structure")) options?.["skipValidation"].push("structure");
  if (args.includes("--skip-security")) options?.["skipValidation"].push("security");
  if (args.includes("--skip-performance")) options?.["skipValidation"].push("performance");
  if (args.includes("--skip-ports")) options?.["skipValidation"].push("ports");
  if (args.includes("--skip-environment")) options?.["skipValidation"].push("environment");
  if (args.includes("--help") || args.includes("-h")) {
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
__name(cli, "cli");

export {
  runStartupValidation,
  validateAndExit,
  cli
};
//# sourceMappingURL=chunk-76T2GSN4.js.map
