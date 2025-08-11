#!/usr/bin/env node

/**
 * JSDoc Validation and Quality Checker for Unified Architecture
 *
 * @fileoverview Comprehensive JSDoc validation tool that ensures documentation
 *               quality across all four unified architecture layers (UACL, DAL, USL, UEL).
 *               Provides automated quality checks, coverage reports, and validation metrics.
 * @version 2.0.0
 * @since 2.0.0-alpha.73
 * @author Claude-Zen Documentation Team
 */

const fs = require('node:fs').promises;
const path = require('node:path');
const { execSync } = require('node:child_process');

/**
 * JSDoc Quality Validator - Validates documentation standards across unified architecture
 *
 * Provides comprehensive validation for JSDoc documentation including:
 * - Layer-specific validation rules (UACL, DAL, USL, UEL)
 * - Coverage metrics and reporting
 * - Template compliance checking
 * - Cross-layer integration documentation validation
 *
 * @class JSDocValidator
 */
class JSDocValidator {
  /**
   * Initialize JSDoc validator with configuration
   *
   * @param {Object} config - Validator configuration
   * @param {string} config.rootDir - Root directory to validate
   * @param {string[]} config.layers - Architecture layers to validate
   * @param {Object} config.rules - Validation rules by layer
   * @param {boolean} [config.strict=true] - Enable strict validation mode
   *
   * @example Basic Validator Setup
   * ```javascript
   * const validator = new JSDocValidator({
   *   rootDir: './src',
   *   layers: ['uacl', 'dal', 'usl', 'uel'],
   *   rules: {
   *     uacl: { requireExamples: true, requireReturns: true },
   *     dal: { requireThrows: true, requireTemplates: true }
   *   }
   * });
   * ```
   */
  constructor(config) {
    this.rootDir = config.rootDir || './src';
    this.layers = config.layers || ['uacl', 'dal', 'usl', 'uel'];
    this.rules = config.rules || this.getDefaultRules();
    this.strict = config.strict !== false;

    // Validation results
    this.results = {
      files: [],
      coverage: { documented: 0, total: 0 },
      quality: { passed: 0, failed: 0 },
      layers: {},
      errors: [],
    };

    // Layer mappings for directory structure
    this.layerMappings = {
      uacl: 'interfaces/clients',
      dal: 'database',
      usl: 'interfaces/services',
      uel: 'interfaces/events',
    };
  }

  /**
   * Get default validation rules for each architecture layer
   *
   * @returns {Object} Default validation rules configuration
   *
   * @example Default Rules Structure
   * ```javascript
   * {
   *   uacl: {
   *     requireExamples: true,
   *     requireReturns: true,
   *     requireParams: true,
   *     requireFileOverview: true
   *   },
   *   dal: {
   *     requireThrows: true,
   *     requireTemplates: true,
   *     requireExamples: true
   *   }
   * }
   * ```
   */
  getDefaultRules() {
    return {
      uacl: {
        requireExamples: true,
        requireReturns: true,
        requireParams: true,
        requireFileOverview: true,
        requireEmits: true, // For event-emitting clients
      },
      dal: {
        requireExamples: true,
        requireReturns: true,
        requireParams: true,
        requireFileOverview: true,
        requireThrows: true,
        requireTemplates: true, // For generic DAOs
      },
      usl: {
        requireExamples: true,
        requireReturns: true,
        requireParams: true,
        requireFileOverview: true,
        requireLifecycle: true, // Service lifecycle docs
      },
      uel: {
        requireExamples: true,
        requireReturns: true,
        requireParams: true,
        requireFileOverview: true,
        requireEmits: true, // Event emission documentation
        requireEventPayload: true,
      },
    };
  }

  /**
   * Validate JSDoc documentation across all specified layers
   *
   * @returns {Promise<ValidationResults>} Comprehensive validation results
   *
   * @throws {ValidationError} When critical validation failures occur
   *
   * @example Complete Validation Run
   * ```javascript
   * const validator = new JSDocValidator({ rootDir: './src' });
   *
   * try {
   *   const results = await validator.validate();
   *
   *   console.log('Documentation Coverage:', results.coverage.percentage);
   *   console.log('Quality Score:', results.quality.score);
   *   console.log('Layer Breakdown:', results.layers);
   *
   *   if (results.errors.length > 0) {
   *     console.error('Validation Errors:', results.errors);
   *   }
   * } catch (error) {
   *   console.error('Validation failed:', error.message);
   * }
   * ```
   */
  async validate() {
    try {
      // Initialize layer results
      for (const layer of this.layers) {
        this.results.layers[layer] = {
          files: [],
          coverage: { documented: 0, total: 0 },
          quality: { passed: 0, failed: 0 },
          errors: [],
        };
      }

      // Validate each layer
      for (const layer of this.layers) {
        await this.validateLayer(layer);
      }

      // Generate overall metrics
      this.calculateMetrics();

      // Generate report
      await this.generateReport();
      return this.results;
    } catch (error) {
      // console.error('❌ JSDoc validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate documentation for a specific architecture layer
   *
   * @param {string} layer - Architecture layer to validate (uacl, dal, usl, uel)
   *
   * @returns {Promise<LayerResults>} Layer-specific validation results
   *
   * @throws {LayerValidationError} When layer validation fails
   *
   * @example Layer Validation
   * ```javascript
   * // Validate only DAL layer
   * await validator.validateLayer('dal');
   *
   * // Check DAL-specific requirements
   * const dalResults = validator.results.layers.dal;
   * console.log('DAL Coverage:', dalResults.coverage);
   * console.log('DAL Quality Score:', dalResults.quality.score);
   * ```
   */
  async validateLayer(layer) {
    const layerPath = path.join(this.rootDir, this.layerMappings[layer]);

    try {
      // Check if layer directory exists
      await fs.access(layerPath);

      // Find TypeScript files in layer
      const files = await this.findTypeScriptFiles(layerPath);

      // Validate each file
      for (const file of files) {
        await this.validateFile(file, layer);
      }
    } catch (error) {
      const layerError = `Layer ${layer} validation failed: ${error.message}`;
      this.results.errors.push(layerError);
      this.results.layers[layer].errors.push(layerError);
    }
  }

  /**
   * Find all TypeScript files in a directory recursively
   *
   * @param {string} dir - Directory to search
   * @returns {Promise<string[]>} Array of TypeScript file paths
   *
   * @example Find TypeScript Files
   * ```javascript
   * const files = await validator.findTypeScriptFiles('./src/database');
   * console.log(`Found ${files.length} TypeScript files`);
   * ```
   */
  async findTypeScriptFiles(dir) {
    const files = [];

    async function traverse(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          // Skip test directories and node_modules
          if (
            !entry.name.startsWith('.') &&
            entry.name !== 'node_modules' &&
            entry.name !== '__tests__' &&
            entry.name !== 'tests'
          ) {
            await traverse(fullPath);
          }
        } else if (
          entry.isFile() &&
          (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
          !entry.name.endsWith('.test.ts') &&
          !entry.name.endsWith('.spec.ts')
        ) {
          files.push(fullPath);
        }
      }
    }

    await traverse(dir);
    return files;
  }

  /**
   * Validate JSDoc documentation in a single file
   *
   * @param {string} filePath - Path to TypeScript file
   * @param {string} layer - Architecture layer (uacl, dal, usl, uel)
   *
   * @returns {Promise<FileResults>} File validation results
   *
   * @example File Validation
   * ```javascript
   * const fileResults = await validator.validateFile(
   *   './src/database/factory.ts',
   *   'dal'
   * );
   *
   * console.log('File Coverage:', fileResults.coverage);
   * console.log('JSDoc Errors:', fileResults.errors);
   * ```
   */
  async validateFile(filePath, layer) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const fileResults = {
      path: filePath,
      layer: layer,
      coverage: { documented: 0, total: 0 },
      errors: [],
      warnings: [],
    };

    try {
      // Parse file for JSDoc and TypeScript constructs
      const analysis = this.parseFileContent(fileContent);

      // Apply layer-specific validation rules
      const layerRules = this.rules[layer] || {};

      // Validate file-level documentation
      this.validateFileLevel(analysis, layerRules, fileResults);

      // Validate classes and interfaces
      this.validateClassesAndInterfaces(analysis, layerRules, fileResults);

      // Validate functions and methods
      this.validateFunctionsAndMethods(analysis, layerRules, fileResults);

      // Calculate file coverage
      fileResults.coverage.percentage =
        fileResults.coverage.total > 0
          ? ((fileResults.coverage.documented / fileResults.coverage.total) * 100).toFixed(2)
          : 0;

      // Add to layer results
      this.results.layers[layer].files.push(fileResults);
      this.results.files.push(fileResults);
    } catch (error) {
      const fileError = `File ${filePath} validation failed: ${error.message}`;
      fileResults.errors.push(fileError);
      this.results.errors.push(fileError);
    }

    return fileResults;
  }

  /**
   * Parse file content to extract TypeScript constructs and JSDoc comments
   *
   * @param {string} content - File content to parse
   * @returns {Object} Parsed analysis data
   *
   * @example Parse File Analysis
   * ```javascript
   * const analysis = validator.parseFileContent(fileContent);
   * console.log('Classes found:', analysis.classes.length);
   * console.log('Functions found:', analysis.functions.length);
   * console.log('Interfaces found:', analysis.interfaces.length);
   * ```
   */
  parseFileContent(content) {
    const analysis = {
      hasFileOverview: false,
      classes: [],
      interfaces: [],
      functions: [],
      methods: [],
      exports: [],
    };

    // Check for file-level JSDoc
    const fileOverviewRegex = /@fileoverview\s+/;
    analysis.hasFileOverview = fileOverviewRegex.test(content);

    // Find classes with their JSDoc
    const classRegex = /\/\*\*[\s\S]*?\*\/\s*export\s+class\s+(\w+)/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      const jsDoc = this.extractJSDocFromMatch(content, match.index);
      analysis.classes.push({
        name: match[1],
        hasJSDoc: jsDoc.length > 0,
        jsDoc: jsDoc,
      });
    }

    // Find interfaces with their JSDoc
    const interfaceRegex = /\/\*\*[\s\S]*?\*\/\s*export\s+interface\s+(\w+)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      const jsDoc = this.extractJSDocFromMatch(content, match.index);
      analysis.interfaces.push({
        name: match[1],
        hasJSDoc: jsDoc.length > 0,
        jsDoc: jsDoc,
      });
    }

    // Find functions with their JSDoc
    const functionRegex = /\/\*\*[\s\S]*?\*\/\s*export\s+(?:async\s+)?function\s+(\w+)/g;
    while ((match = functionRegex.exec(content)) !== null) {
      const jsDoc = this.extractJSDocFromMatch(content, match.index);
      analysis.functions.push({
        name: match[1],
        hasJSDoc: jsDoc.length > 0,
        jsDoc: jsDoc,
      });
    }

    return analysis;
  }

  /**
   * Extract JSDoc comment from a match position
   *
   * @param {string} content - File content
   * @param {number} matchIndex - Index of the match
   * @returns {string} Extracted JSDoc comment
   */
  extractJSDocFromMatch(content, matchIndex) {
    // Find the JSDoc comment preceding the match
    const beforeMatch = content.substring(0, matchIndex);
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\/\s*$/;
    const jsDocMatch = beforeMatch.match(jsDocRegex);
    return jsDocMatch ? jsDocMatch[1] : '';
  }

  /**
   * Validate file-level JSDoc documentation
   *
   * @param {Object} analysis - File analysis data
   * @param {Object} rules - Layer-specific validation rules
   * @param {Object} results - File validation results to update
   */
  validateFileLevel(analysis, rules, results) {
    results.coverage.total += 1;

    if (rules.requireFileOverview && !analysis.hasFileOverview) {
      results.errors.push('Missing @fileoverview tag');
    } else if (analysis.hasFileOverview) {
      results.coverage.documented += 1;
    }
  }

  /**
   * Validate classes and interfaces JSDoc documentation
   *
   * @param {Object} analysis - File analysis data
   * @param {Object} rules - Layer-specific validation rules
   * @param {Object} results - File validation results to update
   */
  validateClassesAndInterfaces(analysis, rules, results) {
    // Validate classes
    for (const cls of analysis.classes) {
      results.coverage.total += 1;

      if (!cls.hasJSDoc) {
        results.errors.push(`Class ${cls.name} missing JSDoc`);
      } else {
        results.coverage.documented += 1;
        this.validateJSDocContent(cls.jsDoc, rules, `Class ${cls.name}`, results);
      }
    }

    // Validate interfaces
    for (const intf of analysis.interfaces) {
      results.coverage.total += 1;

      if (!intf.hasJSDoc) {
        results.errors.push(`Interface ${intf.name} missing JSDoc`);
      } else {
        results.coverage.documented += 1;
        this.validateJSDocContent(intf.jsDoc, rules, `Interface ${intf.name}`, results);
      }
    }
  }

  /**
   * Validate functions and methods JSDoc documentation
   *
   * @param {Object} analysis - File analysis data
   * @param {Object} rules - Layer-specific validation rules
   * @param {Object} results - File validation results to update
   */
  validateFunctionsAndMethods(analysis, rules, results) {
    for (const func of analysis.functions) {
      results.coverage.total += 1;

      if (!func.hasJSDoc) {
        results.errors.push(`Function ${func.name} missing JSDoc`);
      } else {
        results.coverage.documented += 1;
        this.validateJSDocContent(func.jsDoc, rules, `Function ${func.name}`, results);
      }
    }
  }

  /**
   * Validate JSDoc content against layer-specific rules
   *
   * @param {string} jsDoc - JSDoc content to validate
   * @param {Object} rules - Validation rules to apply
   * @param {string} context - Context for error reporting
   * @param {Object} results - Results object to update
   */
  validateJSDocContent(jsDoc, rules, context, results) {
    if (rules.requireExamples && !jsDoc.includes('@example')) {
      results.warnings.push(`${context} missing @example tag`);
    }

    if (rules.requireReturns && !jsDoc.includes('@returns')) {
      results.warnings.push(`${context} missing @returns tag`);
    }

    if (rules.requireParams && !jsDoc.includes('@param')) {
      results.warnings.push(`${context} missing @param tag`);
    }

    if (rules.requireThrows && !jsDoc.includes('@throws')) {
      results.warnings.push(`${context} missing @throws tag`);
    }

    if (rules.requireEmits && !jsDoc.includes('@emits')) {
      results.warnings.push(`${context} missing @emits tag`);
    }

    if (rules.requireTemplates && !jsDoc.includes('@template')) {
      results.warnings.push(`${context} missing @template tag`);
    }
  }

  /**
   * Calculate overall validation metrics
   *
   * @example Metrics Calculation
   * ```javascript
   * validator.calculateMetrics();
   *
   * console.log('Overall Coverage:', validator.results.coverage.percentage);
   * console.log('Quality Score:', validator.results.quality.score);
   * ```
   */
  calculateMetrics() {
    // Calculate overall coverage
    this.results.coverage.documented = this.results.files.reduce(
      (sum, file) => sum + file.coverage.documented,
      0
    );
    this.results.coverage.total = this.results.files.reduce(
      (sum, file) => sum + file.coverage.total,
      0
    );
    this.results.coverage.percentage =
      this.results.coverage.total > 0
        ? ((this.results.coverage.documented / this.results.coverage.total) * 100).toFixed(2)
        : 0;

    // Calculate quality metrics
    const totalFiles = this.results.files.length;
    const filesWithErrors = this.results.files.filter((f) => f.errors.length > 0).length;

    this.results.quality.passed = totalFiles - filesWithErrors;
    this.results.quality.failed = filesWithErrors;
    this.results.quality.score =
      totalFiles > 0 ? ((this.results.quality.passed / totalFiles) * 100).toFixed(2) : 0;

    // Calculate layer-specific metrics
    for (const layer of this.layers) {
      const layerData = this.results.layers[layer];
      layerData.coverage.documented = layerData.files.reduce(
        (sum, file) => sum + file.coverage.documented,
        0
      );
      layerData.coverage.total = layerData.files.reduce(
        (sum, file) => sum + file.coverage.total,
        0
      );
      layerData.coverage.percentage =
        layerData.coverage.total > 0
          ? ((layerData.coverage.documented / layerData.coverage.total) * 100).toFixed(2)
          : 0;

      const layerFiles = layerData.files.length;
      const layerFilesWithErrors = layerData.files.filter((f) => f.errors.length > 0).length;

      layerData.quality.passed = layerFiles - layerFilesWithErrors;
      layerData.quality.failed = layerFilesWithErrors;
      layerData.quality.score =
        layerFiles > 0 ? ((layerData.quality.passed / layerFiles) * 100).toFixed(2) : 0;
    }
  }

  /**
   * Generate comprehensive validation report
   *
   * @returns {Promise<void>} Report generation completion
   *
   * @example Generate Report
   * ```javascript
   * await validator.generateReport();
   * console.log('Validation report saved to docs/jsdoc-validation-report.md');
   * ```
   */
  async generateReport() {
    const report = this.buildMarkdownReport();
    const reportPath = path.join('./docs/generated', 'jsdoc-validation-report.md');

    // Ensure directory exists
    await fs.mkdir(path.dirname(reportPath), { recursive: true });

    await fs.writeFile(reportPath, report);

    // Also generate JSON report for CI/CD
    const jsonReportPath = path.join('./docs/generated', 'jsdoc-validation-report.json');
    await fs.writeFile(jsonReportPath, JSON.stringify(this.results, null, 2));
  }

  /**
   * Build markdown validation report
   *
   * @returns {string} Markdown formatted validation report
   */
  buildMarkdownReport() {
    return `# JSDoc Validation Report - Claude-Zen Unified Architecture

## Executive Summary

**Generated:** ${new Date().toISOString()}
**Validation Mode:** ${this.strict ? 'Strict' : 'Standard'}

### Overall Metrics
- **Documentation Coverage:** ${this.results.coverage.percentage}% (${this.results.coverage.documented}/${this.results.coverage.total})
- **Quality Score:** ${this.results.quality.score}% (${this.results.quality.passed}/${this.results.quality.passed + this.results.quality.failed} files passed)
- **Total Files Validated:** ${this.results.files.length}
- **Total Errors:** ${this.results.errors.length}

## Layer Breakdown

${this.layers
  .map((layer) => {
    const layerData = this.results.layers[layer];
    return `### ${layer.toUpperCase()} - ${this.getLayerName(layer)}

- **Coverage:** ${layerData.coverage.percentage}% (${layerData.coverage.documented}/${layerData.coverage.total})
- **Quality:** ${layerData.quality.score}% (${layerData.quality.passed}/${layerData.files.length} files)
- **Files:** ${layerData.files.length}
- **Errors:** ${layerData.errors.length}`;
  })
  .join('\n\n')}

## Detailed Results

${this.results.files
  .map((file) => {
    return `### ${path.relative(this.rootDir, file.path)}

- **Layer:** ${file.layer.toUpperCase()}
- **Coverage:** ${file.coverage.percentage}%
- **Errors:** ${file.errors.length}
- **Warnings:** ${file.warnings.length}

${
  file.errors.length > 0
    ? `#### Errors
${file.errors.map((error) => `- ❌ ${error}`).join('\n')}`
    : ''
}

${
  file.warnings.length > 0
    ? `#### Warnings  
${file.warnings.map((warning) => `- ⚠️ ${warning}`).join('\n')}`
    : ''
}`;
  })
  .join('\n\n')}

## Recommendations

${this.generateRecommendations()}

---
*Generated by Claude-Zen JSDoc Validator v2.0.0*
`;
  }

  /**
   * Get human-readable layer name
   *
   * @param {string} layer - Layer code
   * @returns {string} Human-readable layer name
   */
  getLayerName(layer) {
    const names = {
      uacl: 'Unified API Client Layer',
      dal: 'Data Access Layer',
      usl: 'Unified Service Layer',
      uel: 'Unified Event Layer',
    };
    return names[layer] || layer;
  }

  /**
   * Generate improvement recommendations based on validation results
   *
   * @returns {string} Markdown formatted recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (parseFloat(this.results.coverage.percentage) < 80) {
      recommendations.push(
        '📈 **Improve Documentation Coverage**: Current coverage is below 80%. Focus on adding JSDoc to undocumented classes, interfaces, and functions.'
      );
    }

    if (this.results.quality.failed > 0) {
      recommendations.push(
        '🔧 **Fix Quality Issues**: Address JSDoc validation errors to improve overall quality score.'
      );
    }

    // Layer-specific recommendations
    for (const layer of this.layers) {
      const layerData = this.results.layers[layer];
      if (parseFloat(layerData.coverage.percentage) < 70) {
        recommendations.push(
          `🎯 **${layer.toUpperCase()} Focus**: ${this.getLayerName(layer)} has low coverage (${layerData.coverage.percentage}%). Prioritize documentation in this layer.`
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push(
        '✅ **Excellent Documentation**: All validation metrics are within acceptable ranges. Continue maintaining high documentation standards.'
      );
    }

    return recommendations.join('\n\n');
  }
}

/**
 * Command-line interface for JSDoc validator
 *
 * @example CLI Usage
 * ```bash
 * # Validate all layers
 * node scripts/jsdoc-validator.js
 *
 * # Validate specific layer
 * node scripts/jsdoc-validator.js --layer dal
 *
 * # Strict validation mode
 * node scripts/jsdoc-validator.js --strict
 *
 * # Custom root directory
 * node scripts/jsdoc-validator.js --root ./custom/src
 * ```
 */
async function main() {
  const args = process.argv.slice(2);
  const config = {
    rootDir: './src',
    layers: ['uacl', 'dal', 'usl', 'uel'],
    strict: args.includes('--strict'),
  };

  // Parse command line arguments
  const rootIndex = args.indexOf('--root');
  if (rootIndex !== -1 && args[rootIndex + 1]) {
    config.rootDir = args[rootIndex + 1];
  }

  const layerIndex = args.indexOf('--layer');
  if (layerIndex !== -1 && args[layerIndex + 1]) {
    config.layers = [args[layerIndex + 1]];
  }

  try {
    const validator = new JSDocValidator(config);
    const results = await validator.validate();

    // Exit with error code if validation fails
    const exitCode = results.quality.failed > 0 ? 1 : 0;

    if (exitCode === 0) {
    } else {
    }

    process.exit(exitCode);
  } catch (error) {
    // console.error('💥 JSDoc validation failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { JSDocValidator };
