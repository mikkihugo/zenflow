#!/usr/bin/env node

/**
 * USL Integration Validation Script
 *
 * Command-line tool for validating USL integration quality,
 * system health, configuration correctness, and migration readiness.
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// ANSI color codes for output formatting
const _colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class USLValidator {
  constructor() {
    this.startTime = Date.now();
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.validationResults = {
      overall: 'pending',
      score: 0,
      sections: {
        structure: { status: 'pending', score: 0, details: [] },
        types: { status: 'pending', score: 0, details: [] },
        implementation: { status: 'pending', score: 0, details: [] },
        integration: { status: 'pending', score: 0, details: [] },
        compatibility: { status: 'pending', score: 0, details: [] },
        documentation: { status: 'pending', score: 0, details: [] },
      },
    };
  }

  // ============================================
  // Logging and Output Methods
  // ============================================

  log(_message, _color = 'white') {}

  logSection(title) {
    this.log(`\n${'='.repeat(60)}`, 'cyan');
    this.log(`🔍 ${title}`, 'cyan');
    this.log('='.repeat(60), 'cyan');
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
    this.info.push(message);
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
    this.warnings.push(message);
  }

  logError(message) {
    this.log(`❌ ${message}`, 'red');
    this.errors.push(message);
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
    this.info.push(message);
  }

  // ============================================
  // File System Validation Methods
  // ============================================

  validateUSLStructure() {
    this.logSection('USL File Structure Validation');
    const section = this.validationResults.sections.structure;
    let score = 0;
    const maxScore = 100;

    const requiredFiles = [
      'src/interfaces/services/core/interfaces.ts',
      'src/interfaces/services/types.ts',
      'src/interfaces/services/factories.ts',
      'src/interfaces/services/registry.ts',
      'src/interfaces/services/manager.ts',
      'src/interfaces/services/compatibility.ts',
      'src/interfaces/services/validation.ts',
      'src/interfaces/services/index.ts',
      'src/interfaces/services/README.md',
    ];

    const requiredDirectories = [
      'src/interfaces/services/core',
      'src/interfaces/services/implementations',
      'src/interfaces/services/adapters',
    ];

    // Check required files
    requiredFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        this.logSuccess(`Found required file: ${filePath}`);
        score += 8;
        section.details.push({ type: 'success', message: `Required file present: ${filePath}` });
      } else {
        this.logError(`Missing required file: ${filePath}`);
        section.details.push({ type: 'error', message: `Missing required file: ${filePath}` });
      }
    });

    // Check required directories
    requiredDirectories.forEach((dirPath) => {
      if (fs.existsSync(dirPath)) {
        this.logSuccess(`Found required directory: ${dirPath}`);
        score += 4;
        section.details.push({
          type: 'success',
          message: `Required directory present: ${dirPath}`,
        });
      } else {
        this.logError(`Missing required directory: ${dirPath}`);
        section.details.push({ type: 'error', message: `Missing required directory: ${dirPath}` });
      }
    });

    // Check adapter files
    const adapterFiles = [
      'src/interfaces/services/adapters/data-service-adapter.ts',
      'src/interfaces/services/adapters/coordination-service-adapter.ts',
      'src/interfaces/services/adapters/integration-service-adapter.ts',
      'src/interfaces/services/adapters/infrastructure-service-adapter.ts',
    ];

    adapterFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        this.logSuccess(`Found adapter file: ${path.basename(filePath)}`);
        score += 2;
        section.details.push({ type: 'success', message: `Adapter file present: ${filePath}` });
      } else {
        this.logWarning(`Missing adapter file: ${filePath}`);
        section.details.push({ type: 'warning', message: `Missing adapter file: ${filePath}` });
      }
    });

    section.score = Math.min(score, maxScore);
    section.status = section.score >= 80 ? 'pass' : section.score >= 60 ? 'warning' : 'fail';

    this.logInfo(`Structure validation score: ${section.score}/${maxScore}`);
  }

  validateTypeDefinitions() {
    this.logSection('Type Definitions Validation');
    const section = this.validationResults.sections.types;
    let score = 0;
    const maxScore = 100;

    try {
      // Check types.ts content
      const typesPath = 'src/interfaces/services/types.ts';
      if (fs.existsSync(typesPath)) {
        const typesContent = fs.readFileSync(typesPath, 'utf8');

        // Check for required enums
        const requiredEnums = ['ServiceType', 'ServicePriority', 'ServiceEnvironment'];
        requiredEnums.forEach((enumName) => {
          if (typesContent.includes(`export enum ${enumName}`)) {
            this.logSuccess(`Found required enum: ${enumName}`);
            score += 10;
            section.details.push({
              type: 'success',
              message: `Required enum present: ${enumName}`,
            });
          } else {
            this.logError(`Missing required enum: ${enumName}`);
            section.details.push({ type: 'error', message: `Missing required enum: ${enumName}` });
          }
        });

        // Check for service config interfaces
        const requiredConfigs = [
          'BaseServiceConfig',
          'DataServiceConfig',
          'CoordinationServiceConfig',
          'IntegrationServiceConfig',
          'InfrastructureServiceConfig',
        ];

        requiredConfigs.forEach((configName) => {
          if (typesContent.includes(`interface ${configName}`)) {
            this.logSuccess(`Found service config: ${configName}`);
            score += 8;
            section.details.push({
              type: 'success',
              message: `Service config present: ${configName}`,
            });
          } else {
            this.logError(`Missing service config: ${configName}`);
            section.details.push({
              type: 'error',
              message: `Missing service config: ${configName}`,
            });
          }
        });

        // Check for ServiceConfigFactory
        if (typesContent.includes('export class ServiceConfigFactory')) {
          this.logSuccess('Found ServiceConfigFactory');
          score += 10;
          section.details.push({ type: 'success', message: 'ServiceConfigFactory present' });
        } else {
          this.logError('Missing ServiceConfigFactory');
          section.details.push({ type: 'error', message: 'Missing ServiceConfigFactory' });
        }

        // Check for type guards
        const typeGuards = [
          'isDataServiceConfig',
          'isCoordinationServiceConfig',
          'isIntegrationServiceConfig',
        ];
        typeGuards.forEach((guardName) => {
          if (typesContent.includes(`export function ${guardName}`)) {
            this.logSuccess(`Found type guard: ${guardName}`);
            score += 3;
            section.details.push({ type: 'success', message: `Type guard present: ${guardName}` });
          } else {
            this.logWarning(`Missing type guard: ${guardName}`);
            section.details.push({ type: 'warning', message: `Missing type guard: ${guardName}` });
          }
        });
      } else {
        this.logError('types.ts file not found');
        section.details.push({ type: 'error', message: 'types.ts file not found' });
      }

      // Check core interfaces
      const interfacesPath = 'src/interfaces/services/core/interfaces.ts';
      if (fs.existsSync(interfacesPath)) {
        const interfacesContent = fs.readFileSync(interfacesPath, 'utf8');

        const coreInterfaces = ['IService', 'IServiceFactory', 'IServiceRegistry', 'ServiceConfig'];
        coreInterfaces.forEach((interfaceName) => {
          if (
            interfacesContent.includes(`interface ${interfaceName}`) ||
            interfacesContent.includes(`export interface ${interfaceName}`)
          ) {
            this.logSuccess(`Found core interface: ${interfaceName}`);
            score += 5;
            section.details.push({
              type: 'success',
              message: `Core interface present: ${interfaceName}`,
            });
          } else {
            this.logError(`Missing core interface: ${interfaceName}`);
            section.details.push({
              type: 'error',
              message: `Missing core interface: ${interfaceName}`,
            });
          }
        });
      }
    } catch (error) {
      this.logError(`Type validation error: ${error.message}`);
      section.details.push({ type: 'error', message: `Type validation error: ${error.message}` });
    }

    section.score = Math.min(score, maxScore);
    section.status = section.score >= 80 ? 'pass' : section.score >= 60 ? 'warning' : 'fail';

    this.logInfo(`Type definitions validation score: ${section.score}/${maxScore}`);
  }

  validateImplementation() {
    this.logSection('Implementation Validation');
    const section = this.validationResults.sections.implementation;
    let score = 0;
    const maxScore = 100;

    try {
      // Check main factory implementation
      const factoriesPath = 'src/interfaces/services/factories.ts';
      if (fs.existsSync(factoriesPath)) {
        const factoriesContent = fs.readFileSync(factoriesPath, 'utf8');

        if (factoriesContent.includes('export class USLFactory')) {
          this.logSuccess('Found USLFactory implementation');
          score += 20;
          section.details.push({ type: 'success', message: 'USLFactory implementation present' });
        } else {
          this.logError('Missing USLFactory implementation');
          section.details.push({ type: 'error', message: 'Missing USLFactory implementation' });
        }

        if (factoriesContent.includes('export class ServiceRegistry')) {
          this.logSuccess('Found ServiceRegistry implementation');
          score += 15;
          section.details.push({
            type: 'success',
            message: 'ServiceRegistry implementation present',
          });
        } else {
          this.logError('Missing ServiceRegistry implementation');
          section.details.push({
            type: 'error',
            message: 'Missing ServiceRegistry implementation',
          });
        }

        if (factoriesContent.includes('globalUSLFactory')) {
          this.logSuccess('Found global USL factory instance');
          score += 10;
          section.details.push({ type: 'success', message: 'Global USL factory instance present' });
        } else {
          this.logWarning('Missing global USL factory instance');
          section.details.push({ type: 'warning', message: 'Missing global USL factory instance' });
        }
      }

      // Check service manager
      const managerPath = 'src/interfaces/services/manager.ts';
      if (fs.existsSync(managerPath)) {
        const managerContent = fs.readFileSync(managerPath, 'utf8');

        if (managerContent.includes('export class ServiceManager')) {
          this.logSuccess('Found ServiceManager implementation');
          score += 15;
          section.details.push({
            type: 'success',
            message: 'ServiceManager implementation present',
          });
        } else {
          this.logError('Missing ServiceManager implementation');
          section.details.push({ type: 'error', message: 'Missing ServiceManager implementation' });
        }
      }

      // Check enhanced registry
      const registryPath = 'src/interfaces/services/registry.ts';
      if (fs.existsSync(registryPath)) {
        const registryContent = fs.readFileSync(registryPath, 'utf8');

        if (registryContent.includes('export class EnhancedServiceRegistry')) {
          this.logSuccess('Found EnhancedServiceRegistry implementation');
          score += 15;
          section.details.push({
            type: 'success',
            message: 'EnhancedServiceRegistry implementation present',
          });
        } else {
          this.logError('Missing EnhancedServiceRegistry implementation');
          section.details.push({
            type: 'error',
            message: 'Missing EnhancedServiceRegistry implementation',
          });
        }
      }

      // Check compatibility layer
      const compatibilityPath = 'src/interfaces/services/compatibility.ts';
      if (fs.existsSync(compatibilityPath)) {
        const compatibilityContent = fs.readFileSync(compatibilityPath, 'utf8');

        if (compatibilityContent.includes('export class USLCompatibilityLayer')) {
          this.logSuccess('Found USLCompatibilityLayer implementation');
          score += 10;
          section.details.push({
            type: 'success',
            message: 'USLCompatibilityLayer implementation present',
          });
        } else {
          this.logError('Missing USLCompatibilityLayer implementation');
          section.details.push({
            type: 'error',
            message: 'Missing USLCompatibilityLayer implementation',
          });
        }
      }

      // Check validation framework
      const validationPath = 'src/interfaces/services/validation.ts';
      if (fs.existsSync(validationPath)) {
        const validationContent = fs.readFileSync(validationPath, 'utf8');

        if (validationContent.includes('export class USLValidationFramework')) {
          this.logSuccess('Found USLValidationFramework implementation');
          score += 15;
          section.details.push({
            type: 'success',
            message: 'USLValidationFramework implementation present',
          });
        } else {
          this.logError('Missing USLValidationFramework implementation');
          section.details.push({
            type: 'error',
            message: 'Missing USLValidationFramework implementation',
          });
        }
      }
    } catch (error) {
      this.logError(`Implementation validation error: ${error.message}`);
      section.details.push({
        type: 'error',
        message: `Implementation validation error: ${error.message}`,
      });
    }

    section.score = Math.min(score, maxScore);
    section.status = section.score >= 80 ? 'pass' : section.score >= 60 ? 'warning' : 'fail';

    this.logInfo(`Implementation validation score: ${section.score}/${maxScore}`);
  }

  validateIntegrationLayer() {
    this.logSection('Integration Layer Validation');
    const section = this.validationResults.sections.integration;
    let score = 0;
    const maxScore = 100;

    try {
      // Check main index exports
      const indexPath = 'src/interfaces/services/index.ts';
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');

        // Check core exports
        const coreExports = [
          'IService',
          'ServiceType',
          'USLFactory',
          'EnhancedServiceRegistry',
          'ServiceManager',
          'USLCompatibilityLayer',
          'USLValidationFramework',
        ];

        coreExports.forEach((exportName) => {
          if (indexContent.includes(exportName)) {
            this.logSuccess(`Found core export: ${exportName}`);
            score += 5;
            section.details.push({
              type: 'success',
              message: `Core export present: ${exportName}`,
            });
          } else {
            this.logError(`Missing core export: ${exportName}`);
            section.details.push({ type: 'error', message: `Missing core export: ${exportName}` });
          }
        });

        // Check USL class
        if (indexContent.includes('export class USL')) {
          this.logSuccess('Found main USL class');
          score += 10;
          section.details.push({ type: 'success', message: 'Main USL class present' });
        } else {
          this.logError('Missing main USL class');
          section.details.push({ type: 'error', message: 'Missing main USL class' });
        }

        // Check USLHelpers
        if (indexContent.includes('export const USLHelpers')) {
          this.logSuccess('Found USLHelpers utilities');
          score += 10;
          section.details.push({ type: 'success', message: 'USLHelpers utilities present' });

          // Check for enhanced helper methods
          const helperMethods = [
            'initializeCompleteUSL',
            'migrateToUSL',
            'validateSystemIntegration',
          ];

          helperMethods.forEach((method) => {
            if (indexContent.includes(method)) {
              this.logSuccess(`Found helper method: ${method}`);
              score += 3;
              section.details.push({
                type: 'success',
                message: `Helper method present: ${method}`,
              });
            } else {
              this.logWarning(`Missing helper method: ${method}`);
              section.details.push({
                type: 'warning',
                message: `Missing helper method: ${method}`,
              });
            }
          });
        } else {
          this.logError('Missing USLHelpers utilities');
          section.details.push({ type: 'error', message: 'Missing USLHelpers utilities' });
        }

        // Check convenience functions
        const convenienceFunctions = [
          'createDataService',
          'createWebDataService',
          'createCoordinationService',
          'getService',
          'startAllServices',
        ];

        convenienceFunctions.forEach((funcName) => {
          if (indexContent.includes(`export const ${funcName}`)) {
            this.logSuccess(`Found convenience function: ${funcName}`);
            score += 2;
            section.details.push({
              type: 'success',
              message: `Convenience function present: ${funcName}`,
            });
          } else {
            this.logWarning(`Missing convenience function: ${funcName}`);
            section.details.push({
              type: 'warning',
              message: `Missing convenience function: ${funcName}`,
            });
          }
        });
      } else {
        this.logError('Main index.ts file not found');
        section.details.push({ type: 'error', message: 'Main index.ts file not found' });
      }
    } catch (error) {
      this.logError(`Integration validation error: ${error.message}`);
      section.details.push({
        type: 'error',
        message: `Integration validation error: ${error.message}`,
      });
    }

    section.score = Math.min(score, maxScore);
    section.status = section.score >= 80 ? 'pass' : section.score >= 60 ? 'warning' : 'fail';

    this.logInfo(`Integration layer validation score: ${section.score}/${maxScore}`);
  }

  validateCompatibility() {
    this.logSection('Compatibility Validation');
    const section = this.validationResults.sections.compatibility;
    let score = 0;
    const maxScore = 100;

    try {
      // Check compatibility layer implementation
      const compatibilityPath = 'src/interfaces/services/compatibility.ts';
      if (fs.existsSync(compatibilityPath)) {
        const compatibilityContent = fs.readFileSync(compatibilityPath, 'utf8');

        // Check for legacy service methods
        const legacyMethods = [
          'createWebDataService',
          'createDocumentService',
          'createDAAService',
          'createSessionRecoveryService',
        ];

        legacyMethods.forEach((method) => {
          if (compatibilityContent.includes(method)) {
            this.logSuccess(`Found legacy compatibility method: ${method}`);
            score += 8;
            section.details.push({
              type: 'success',
              message: `Legacy method supported: ${method}`,
            });
          } else {
            this.logWarning(`Missing legacy compatibility method: ${method}`);
            section.details.push({ type: 'warning', message: `Missing legacy method: ${method}` });
          }
        });

        // Check migration utilities
        if (compatibilityContent.includes('migrateExistingServices')) {
          this.logSuccess('Found service migration utility');
          score += 15;
          section.details.push({ type: 'success', message: 'Service migration utility present' });
        } else {
          this.logError('Missing service migration utility');
          section.details.push({ type: 'error', message: 'Missing service migration utility' });
        }

        if (compatibilityContent.includes('generateMigrationGuide')) {
          this.logSuccess('Found migration guide generator');
          score += 10;
          section.details.push({ type: 'success', message: 'Migration guide generator present' });
        } else {
          this.logWarning('Missing migration guide generator');
          section.details.push({ type: 'warning', message: 'Missing migration guide generator' });
        }

        // Check MigrationUtils
        if (compatibilityContent.includes('export const MigrationUtils')) {
          this.logSuccess('Found MigrationUtils');
          score += 15;
          section.details.push({ type: 'success', message: 'MigrationUtils present' });
        } else {
          this.logError('Missing MigrationUtils');
          section.details.push({ type: 'error', message: 'Missing MigrationUtils' });
        }

        // Check deprecation warnings
        const deprecationCount = (compatibilityContent.match(/@deprecated/g) || []).length;
        if (deprecationCount > 0) {
          this.logSuccess(`Found ${deprecationCount} deprecation warnings`);
          score += Math.min(deprecationCount * 2, 20);
          section.details.push({
            type: 'success',
            message: `${deprecationCount} deprecation warnings present`,
          });
        } else {
          this.logWarning('No deprecation warnings found');
          section.details.push({ type: 'warning', message: 'No deprecation warnings found' });
        }
      } else {
        this.logError('Compatibility layer not found');
        section.details.push({ type: 'error', message: 'Compatibility layer not found' });
      }
    } catch (error) {
      this.logError(`Compatibility validation error: ${error.message}`);
      section.details.push({
        type: 'error',
        message: `Compatibility validation error: ${error.message}`,
      });
    }

    section.score = Math.min(score, maxScore);
    section.status = section.score >= 80 ? 'pass' : section.score >= 60 ? 'warning' : 'fail';

    this.logInfo(`Compatibility validation score: ${section.score}/${maxScore}`);
  }

  validateDocumentation() {
    this.logSection('Documentation Validation');
    const section = this.validationResults.sections.documentation;
    let score = 0;
    const maxScore = 100;

    try {
      // Check README.md
      const readmePath = 'src/interfaces/services/README.md';
      if (fs.existsSync(readmePath)) {
        const readmeContent = fs.readFileSync(readmePath, 'utf8');

        // Check for required sections
        const requiredSections = [
          'Architecture Overview',
          'Quick Start Guide',
          'Service Creation Examples',
          'Migration Guide',
          'Performance Benefits',
          'Troubleshooting',
        ];

        requiredSections.forEach((section) => {
          if (readmeContent.includes(section)) {
            this.logSuccess(`Found documentation section: ${section}`);
            score += 12;
            section.details?.push({
              type: 'success',
              message: `Documentation section present: ${section}`,
            });
          } else {
            this.logWarning(`Missing documentation section: ${section}`);
            section.details?.push({
              type: 'warning',
              message: `Missing documentation section: ${section}`,
            });
          }
        });

        // Check for code examples
        const codeBlockCount = (readmeContent.match(/```typescript/g) || []).length;
        if (codeBlockCount >= 10) {
          this.logSuccess(`Found ${codeBlockCount} TypeScript code examples`);
          score += Math.min(codeBlockCount, 20);
          section.details?.push({
            type: 'success',
            message: `${codeBlockCount} code examples present`,
          });
        } else {
          this.logWarning(`Only ${codeBlockCount} code examples found (recommended: 10+)`);
          section.details?.push({
            type: 'warning',
            message: `Only ${codeBlockCount} code examples found`,
          });
        }

        // Check README length (comprehensive documentation should be substantial)
        const wordCount = readmeContent.split(/\s+/).length;
        if (wordCount >= 5000) {
          this.logSuccess(`Comprehensive documentation: ${wordCount} words`);
          score += 16;
          section.details?.push({
            type: 'success',
            message: `Comprehensive documentation: ${wordCount} words`,
          });
        } else if (wordCount >= 2000) {
          this.logWarning(`Moderate documentation: ${wordCount} words`);
          score += 8;
          section.details?.push({
            type: 'warning',
            message: `Moderate documentation: ${wordCount} words`,
          });
        } else {
          this.logError(`Insufficient documentation: ${wordCount} words`);
          section.details?.push({
            type: 'error',
            message: `Insufficient documentation: ${wordCount} words`,
          });
        }
      } else {
        this.logError('README.md not found');
        section.details?.push({ type: 'error', message: 'README.md not found' });
      }

      // Check for TypeScript documentation (JSDoc comments)
      const files = [
        'src/interfaces/services/manager.ts',
        'src/interfaces/services/registry.ts',
        'src/interfaces/services/compatibility.ts',
        'src/interfaces/services/validation.ts',
      ];

      files.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const jsdocCount = (content.match(/\/\*\*/g) || []).length;

          if (jsdocCount >= 5) {
            this.logSuccess(
              `Good JSDoc coverage in ${path.basename(filePath)}: ${jsdocCount} comments`,
            );
            score += 2;
            section.details?.push({
              type: 'success',
              message: `JSDoc coverage in ${path.basename(filePath)}: ${jsdocCount}`,
            });
          } else {
            this.logWarning(
              `Low JSDoc coverage in ${path.basename(filePath)}: ${jsdocCount} comments`,
            );
            section.details?.push({
              type: 'warning',
              message: `Low JSDoc coverage in ${path.basename(filePath)}`,
            });
          }
        }
      });
    } catch (error) {
      this.logError(`Documentation validation error: ${error.message}`);
      section.details?.push({
        type: 'error',
        message: `Documentation validation error: ${error.message}`,
      });
    }

    this.validationResults.sections.documentation.score = Math.min(score, maxScore);
    this.validationResults.sections.documentation.status =
      this.validationResults.sections.documentation.score >= 80
        ? 'pass'
        : this.validationResults.sections.documentation.score >= 60
          ? 'warning'
          : 'fail';

    this.logInfo(
      `Documentation validation score: ${this.validationResults.sections.documentation.score}/${maxScore}`,
    );
  }

  // ============================================
  // TypeScript Compilation Check
  // ============================================

  validateTypeScriptCompilation() {
    this.logSection('TypeScript Compilation Check');

    try {
      this.logInfo('Running TypeScript compilation check...');

      // Check if we can compile the USL services without errors
      const _result = execSync('npx tsc --noEmit --skipLibCheck src/interfaces/services/index.ts', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      this.logSuccess('TypeScript compilation successful');
      return true;
    } catch (error) {
      this.logError('TypeScript compilation failed');
      this.logError(error.stdout || error.message);
      return false;
    }
  }

  // ============================================
  // Main Validation Method
  // ============================================

  async runValidation() {
    this.log('\n🚀 USL Integration Validation Starting...', 'magenta');
    this.log(`Timestamp: ${new Date().toISOString()}`, 'cyan');

    // Run all validation sections
    this.validateUSLStructure();
    this.validateTypeDefinitions();
    this.validateImplementation();
    this.validateIntegrationLayer();
    this.validateCompatibility();
    this.validateDocumentation();

    // TypeScript compilation check
    const compilationSuccess = this.validateTypeScriptCompilation();

    // Calculate overall results
    this.calculateOverallResults(compilationSuccess);

    // Generate final report
    this.generateFinalReport();

    return this.validationResults;
  }

  calculateOverallResults(compilationSuccess) {
    const sections = Object.values(this.validationResults.sections);
    const totalScore = sections.reduce((sum, section) => sum + section.score, 0);
    const sectionCount = sections.length;

    this.validationResults.score = Math.round(totalScore / sectionCount);

    // Adjust score based on compilation success
    if (!compilationSuccess) {
      this.validationResults.score = Math.max(0, this.validationResults.score - 20);
    }

    // Determine overall status
    if (this.errors.length > 0 || !compilationSuccess) {
      this.validationResults.overall = 'fail';
    } else if (this.warnings.length > 0 || this.validationResults.score < 80) {
      this.validationResults.overall = 'warning';
    } else {
      this.validationResults.overall = 'pass';
    }
  }

  generateFinalReport() {
    const duration = Date.now() - this.startTime;

    this.logSection('Final Validation Report');

    // Overall status
    const statusColor =
      this.validationResults.overall === 'pass'
        ? 'green'
        : this.validationResults.overall === 'warning'
          ? 'yellow'
          : 'red';

    this.log(`Overall Status: ${this.validationResults.overall.toUpperCase()}`, statusColor);
    this.log(`Overall Score: ${this.validationResults.score}/100`, statusColor);
    this.log(`Duration: ${duration}ms`, 'cyan');

    // Section breakdown
    this.log('\n📊 Section Breakdown:', 'cyan');
    Object.entries(this.validationResults.sections).forEach(([name, section]) => {
      const sectionColor =
        section.status === 'pass' ? 'green' : section.status === 'warning' ? 'yellow' : 'red';
      this.log(
        `  ${name.charAt(0).toUpperCase() + name.slice(1)}: ${section.status.toUpperCase()} (${section.score}/100)`,
        sectionColor,
      );
    });

    // Summary statistics
    this.log('\n📈 Summary:', 'cyan');
    this.log(`✅ Successes: ${this.info.length}`, 'green');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'yellow');
    this.log(`❌ Errors: ${this.errors.length}`, 'red');

    // Recommendations
    this.generateRecommendations();

    // Exit code based on results
    if (this.validationResults.overall === 'fail') {
      this.log('\n💥 Validation FAILED - Critical issues must be resolved', 'red');
      process.exit(1);
    } else if (this.validationResults.overall === 'warning') {
      this.log('\n⚠️  Validation PASSED with warnings - Consider addressing issues', 'yellow');
      process.exit(0);
    } else {
      this.log('\n🎉 Validation PASSED - USL integration is ready!', 'green');
      process.exit(0);
    }
  }

  generateRecommendations() {
    this.log('\n💡 Recommendations:', 'cyan');

    if (this.errors.length > 0) {
      this.log('  🔴 High Priority:', 'red');
      this.log('    - Fix all critical errors before production deployment', 'red');
      this.log('    - Ensure all required files and implementations are present', 'red');
    }

    if (this.warnings.length > 0) {
      this.log('  🟡 Medium Priority:', 'yellow');
      this.log('    - Address warnings to improve system quality', 'yellow');
      this.log('    - Complete missing optional features for full functionality', 'yellow');
    }

    if (this.validationResults.score < 90) {
      this.log('  🟢 Low Priority:', 'green');
      this.log('    - Enhance documentation and code examples', 'green');
      this.log('    - Add more comprehensive TypeScript documentation', 'green');
    }

    // Specific recommendations based on section scores
    Object.entries(this.validationResults.sections).forEach(([name, section]) => {
      if (section.score < 70) {
        this.log(`    - Focus on improving ${name} section (${section.score}/100)`, 'yellow');
      }
    });
  }
}

// ============================================
// Command Line Interface
// ============================================

function showHelp() {}

async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options = {
    help: args.includes('--help') || args.includes('-h'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    json: args.includes('--json'),
    quiet: args.includes('--quiet') || args.includes('-q'),
    section: null,
  };

  // Extract section option
  const sectionIndex = args.findIndex((arg) => arg === '--section');
  if (sectionIndex !== -1 && args[sectionIndex + 1]) {
    options.section = args[sectionIndex + 1];
  }

  if (options.help) {
    showHelp();
    return;
  }

  // Override console.log for quiet mode
  if (options.quiet) {
    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0] && (args[0].includes('❌') || args[0].includes('ERROR'))) {
        originalLog(...args);
      }
    };
  }

  try {
    const validator = new USLValidator();

    if (options.section) {
      // Run specific section validation
      switch (options.section) {
        case 'structure':
          validator.validateUSLStructure();
          break;
        case 'types':
          validator.validateTypeDefinitions();
          break;
        case 'implementation':
          validator.validateImplementation();
          break;
        case 'integration':
          validator.validateIntegrationLayer();
          break;
        case 'compatibility':
          validator.validateCompatibility();
          break;
        case 'documentation':
          validator.validateDocumentation();
          break;
        default:
          console.error(`Unknown section: ${options.section}`);
          process.exit(1);
      }
    } else {
      // Run full validation
      const _results = await validator.runValidation();

      if (options.json) {
      }
    }
  } catch (error) {
    console.error('Validation failed with error:', error.message);
    process.exit(1);
  }
}

// Run the validation if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { USLValidator };
