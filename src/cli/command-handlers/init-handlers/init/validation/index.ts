// validation/index.js - Comprehensive validation system for SPARC initialization

import { ConfigValidator } from './config-validator.js';
import { HealthChecker } from './health-checker.js';
import { ModeValidator } from './mode-validator.js';
import { PostInitValidator } from './post-init-validator.js';
import { PreInitValidator } from './pre-init-validator.js';

/**
 * Main validation orchestrator
 */
export class ValidationSystem {
  constructor(workingDir = workingDir;
  this;
  .
  preInitValidator = new PreInitValidator(workingDir);
  this;
  .
  postInitValidator = new PostInitValidator(workingDir);
  this;
  .
  configValidator = new ConfigValidator(workingDir);
  this;
  .
  modeValidator = new ModeValidator(workingDir);
  this;
  .
  healthChecker = new HealthChecker(workingDir);
}

/**
 * Run all pre-initialization checks
 * @returns {Object} Validation result with status and details
 */
async;
validatePreInit((options = {}));
: any
{
  const results = {success = await this.preInitValidator.checkPermissions();
  results.checks.permissions = permissionCheck;
  if (!permissionCheck.success) {
    results.success = false;
    results.errors.push(...permissionCheck.errors);
  }

  // Check disk space
  const spaceCheck = await this.preInitValidator.checkDiskSpace();
  results.checks.diskSpace = spaceCheck;
  if (!spaceCheck.success) {
    results.success = false;
    results.errors.push(...spaceCheck.errors);
  }

  // Check for conflicts
  const conflictCheck = await this.preInitValidator.checkConflicts(options.force);
  results.checks.conflicts = conflictCheck;
  if (!conflictCheck.success && !options.force) {
    results.success = false;
    results.errors.push(...conflictCheck.errors);
  } else if (conflictCheck.warnings.length > 0) {
    results.warnings.push(...conflictCheck.warnings);
  }

  // Check dependencies
  const depCheck = await this.preInitValidator.checkDependencies();
  results.checks.dependencies = depCheck;
  if (!depCheck.success) {
    results.warnings.push(...depCheck.errors);
  }

  // Check environment
  const envCheck = await this.preInitValidator.checkEnvironment();
  results.checks.environment = envCheck;
  if (!envCheck.success) {
    results.warnings.push(...envCheck.errors);
  }
}
catch(error)
{
  results.success = false;
  results.errors.push(`Pre-initialization validation failed = {success = await this.postInitValidator.checkFileIntegrity();
      results.checks.fileIntegrity = integrityCheck;
      if(!integrityCheck.success) {
        results.success = false;
        results.errors.push(...integrityCheck.errors);
      }

      // Check completeness
      const completenessCheck = await this.postInitValidator.checkCompleteness();
      results.checks.completeness = completenessCheck;
      if(!completenessCheck.success) {
        results.success = false;
        results.errors.push(...completenessCheck.errors);
      }

      // Validate structure
      const structureCheck = await this.postInitValidator.validateStructure();
      results.checks.structure = structureCheck;
      if(!structureCheck.success) {
        results.success = false;
        results.errors.push(...structureCheck.errors);
      }

      // Check permissions on created files
      const permissionCheck = await this.postInitValidator.checkPermissions();
      results.checks.permissions = permissionCheck;
      if(!permissionCheck.success) {
        results.warnings.push(...permissionCheck.errors);
      }
    } catch(error) {
      results.success = false;
      results.errors.push(`Post-initialization validation failed = {success = await this.configValidator.validateRoomodes();
  results.checks.roomodes = roomodesCheck;
  if (!roomodesCheck.success) {
    results.success = false;
    results.errors.push(...roomodesCheck.errors);
  }

  // Validate CLAUDE.md
  const claudeMdCheck = await this.configValidator.validateClaudeMd();
  results.checks.claudeMd = claudeMdCheck;
  if (!claudeMdCheck.success) {
    results.warnings.push(...claudeMdCheck.errors);
  }

  // Validate memory configuration
  const memoryCheck = await this.configValidator.validateMemoryConfig();
  results.checks.memory = memoryCheck;
  if (!memoryCheck.success) {
    results.warnings.push(...memoryCheck.errors);
  }

  // Validate coordination configuration
  const coordinationCheck = await this.configValidator.validateCoordinationConfig();
  results.checks.coordination = coordinationCheck;
  if (!coordinationCheck.success) {
    results.warnings.push(...coordinationCheck.errors);
  }
}
catch(error)
{
  results.success = false;
  results.errors.push(`Configuration validation failed = {success = await this.modeValidator.testAllModes();
      results.modes = modeTests.modes;

      if(!modeTests.success) {
        results.success = false;
        results.errors.push(...modeTests.errors);
      }

      if(modeTests.warnings.length > 0) {
        results.warnings.push(...modeTests.warnings);
      }
    } catch(error) {
      results.success = false;
      results.errors.push(`Mode functionality testing failed = {success = await this.healthChecker.checkModeAvailability();
  results.health.modes = modeHealth;
  if (!modeHealth.success) {
    results.warnings.push(...modeHealth.errors);
  }

  // Check template integrity
  const templateHealth = await this.healthChecker.checkTemplateIntegrity();
  results.health.templates = templateHealth;
  if (!templateHealth.success) {
    results.success = false;
    results.errors.push(...templateHealth.errors);
  }

  // Check configuration consistency
  const configHealth = await this.healthChecker.checkConfigConsistency();
  results.health.configuration = configHealth;
  if (!configHealth.success) {
    results.warnings.push(...configHealth.errors);
  }

  // Check system resources
  const resourceHealth = await this.healthChecker.checkSystemResources();
  results.health.resources = resourceHealth;
  if (!resourceHealth.success) {
    results.warnings.push(...resourceHealth.errors);
  }
}
catch(error)
{
  results.success = false;
  results.errors.push(`Health checkfailed = [];
    report.push('=== SPARC Initialization Validation Report ===\n');

    // Summary

      }
      return acc;
    }, 0);

    const warnings = validationResults.warnings?.length || 0;

    report.push(`Summary = === 'object' && results.checks)
  report.push(`\n${phase.toUpperCase()}Phase = result.success ? '✓' : '✗';
          report.push(`  ${status} ${check}: ${result.message || 'Completed'}`);
}
}

// Errors
if (validationResults.errors?.length > 0) {
  report.push('\n❌ ERRORS => {
        report.push(`  - ${error}`);
}
)
}

// Warnings
if (validationResults.warnings?.length > 0) {
  report.push('\n⚠️  WARNINGS => {
        report.push(`  - ${warning}`);
}
)
}

    report.push('\n=== End of Report ===')
return report.join('\n');
}
}

/**
 * Run full validation suite
 */
export async function runFullValidation(workingDir = {}): any {
  const validator = new ValidationSystem(workingDir);
  const results = {success = await validator.validatePreInit(options);
  results.preInit = preInitResults;
  if (!preInitResults.success) {
    results.success = false;
    results.errors.push(...preInitResults.errors);
    results.warnings.push(...preInitResults.warnings);
    return results; // Stop if pre-init fails
  }
}

// Post-init validation (if applicable)
if (options.postInit) {
  const postInitResults = await validator.validatePostInit();
  results.postInit = postInitResults;
  if (!postInitResults.success) {
    results.success = false;
    results.errors.push(...postInitResults.errors);
  }
  results.warnings.push(...postInitResults.warnings);
}

// Configuration validation
if (!options.skipConfig) {
  const configResults = await validator.validateConfiguration();
  results.configuration = configResults;
  if (!configResults.success) {
    results.success = false;
    results.errors.push(...configResults.errors);
  }
  results.warnings.push(...configResults.warnings);
}

// Mode functionality testing
if (!options.skipModeTest) {
  const modeResults = await validator.testModeFunctionality();
  results.modeFunctionality = modeResults;
  if (!modeResults.success) {
    results.success = false;
    results.errors.push(...modeResults.errors);
  }
  results.warnings.push(...modeResults.warnings);
}

// Health checks
const healthResults = await validator.runHealthChecks();
results.health = healthResults;
if (!healthResults.success) {
  results.success = false;
  results.errors.push(...healthResults.errors);
}
results.warnings.push(...healthResults.warnings);

// Generate report
results.report = validator.generateReport(results);

return results;
}
