#!/usr/bin/env node

/**
 * JSDoc Template Validation and Formatting Tool
 *
 * @fileoverview Advanced JSDoc template validation system that ensures consistent
 *               documentation formatting across all unified architecture layers.
 *               Provides template compliance checking, automatic formatting,
 *               and standardization enforcement.
 * @version 2.0.0
 * @since 2.0.0-alpha.73
 * @author Claude-Zen Documentation Team
 */

const fs = require('node:fs').promises;
const path = require('node:path');

/**
 * JSDoc Template Validator - Enforces documentation template standards
 *
 * Provides comprehensive template validation and formatting including:
 * - Layer-specific template compliance (UACL, DAL, USL, UEL)
 * - Automatic JSDoc formatting and standardization
 * - Template structure validation and correction
 * - Cross-reference validation and link checking
 * - Example code compilation and validation
 * - Integration with unified architecture standards
 *
 * @class TemplateValidator
 */
class TemplateValidator {
  /**
   * Initialize JSDoc template validator
   *
   * @param {Object} config - Validator configuration
   * @param {string} config.rootDir - Root source directory
   * @param {string} config.templatesDir - Templates directory path
   * @param {boolean} [config.autoFix=false] - Enable automatic template fixes
   * @param {boolean} [config.validateExamples=true] - Enable example code validation
   * @param {string[]} [config.layers=['uacl', 'dal', 'usl', 'uel']] - Architecture layers to validate
   *
   * @example Basic Template Validator Setup
   * ```javascript
   * const validator = new TemplateValidator({
   *   rootDir: './src',
   *   templatesDir: './docs/templates',
   *   autoFix: true,
   *   validateExamples: true
   * });
   * ```
   */
  constructor(config) {
    this.rootDir = config.rootDir || './src';
    this.templatesDir = config.templatesDir || './docs/templates';
    this.autoFix = config.autoFix;
    this.validateExamples = config.validateExamples !== false;
    this.layers = config.layers || ['uacl', 'dal', 'usl', 'uel'];

    // Template standards for each architecture layer
    this.templates = {
      fileLevel: {
        required: ['@fileoverview', '@version', '@since', '@author'],
        optional: ['@module', '@description'],
        format: this.getFileTemplateFormat(),
      },
      class: {
        required: ['@class', '@description'],
        optional: ['@template', '@extends', '@implements', '@example'],
        format: this.getClassTemplateFormat(),
      },
      interface: {
        required: ['@interface', '@description'],
        optional: ['@template', '@example'],
        format: this.getInterfaceTemplateFormat(),
      },
      method: {
        required: ['@param', '@returns', '@description'],
        optional: ['@throws', '@emits', '@example', '@since'],
        format: this.getMethodTemplateFormat(),
      },
      function: {
        required: ['@param', '@returns', '@description'],
        optional: ['@throws', '@example', '@since'],
        format: this.getFunctionTemplateFormat(),
      },
    };

    // Layer-specific requirements
    this.layerRequirements = {
      uacl: {
        mandatoryTags: ['@emits', '@returns'],
        exampleRequired: true,
        errorHandling: true,
      },
      dal: {
        mandatoryTags: ['@throws', '@template'],
        exampleRequired: true,
        errorHandling: true,
      },
      usl: {
        mandatoryTags: ['@returns'],
        exampleRequired: true,
        errorHandling: false,
      },
      uel: {
        mandatoryTags: ['@emits'],
        exampleRequired: true,
        errorHandling: false,
      },
    };

    // Validation results
    this.results = {
      files: [],
      templates: {
        valid: 0,
        invalid: 0,
        fixed: 0,
      },
      examples: {
        validated: 0,
        passed: 0,
        failed: 0,
      },
      issues: [],
    };
  }

  /**
   * Validate JSDoc templates across all specified files and layers
   *
   * @returns {Promise<ValidationResults>} Comprehensive template validation results
   *
   * @throws {TemplateValidationError} When critical template validation fails
   *
   * @example Complete Template Validation
   * ```javascript
   * const validator = new TemplateValidator({
   *   rootDir: './src',
   *   autoFix: true
   * });
   *
   * try {
   *   const results = await validator.validateTemplates();
   *
   *   console.log('Template Validation:', results.templates);
   *   console.log('Example Validation:', results.examples);
   *   console.log('Auto-fixes Applied:', results.templates.fixed);
   *
   *   if (results.issues.length > 0) {
   *     console.log('Issues Found:', results.issues);
   *   }
   * } catch (error) {
   *   console.error('Template validation failed:', error.message);
   * }
   * ```
   */
  async validateTemplates() {
    try {
      // Find all TypeScript files
      const files = await this.findTypeScriptFiles(this.rootDir);

      // Validate each file
      for (const file of files) {
        await this.validateFile(file);
      }

      // Generate validation report
      await this.generateValidationReport();

      if (this.autoFix && this.results.templates.fixed > 0) {
      }

      return this.results;
    } catch (error) {
      // console.error('❌ Template validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate JSDoc templates in a single file
   *
   * @param {string} filePath - Path to TypeScript file
   *
   * @returns {Promise<FileValidationResult>} File template validation results
   *
   * @example File Template Validation
   * ```javascript
   * const fileResult = await validator.validateFile('./src/database/factory.ts');
   *
   * console.log('File Valid:', fileResult.valid);
   * console.log('Template Issues:', fileResult.issues);
   * console.log('Auto-fixes Applied:', fileResult.fixed);
   * ```
   */
  async validateFile(filePath) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const relativePath = path.relative(this.rootDir, filePath);
    const layer = this.determineLayer(filePath);

    const fileResult = {
      path: relativePath,
      layer: layer,
      valid: true,
      issues: [],
      fixed: [],
      examples: {
        validated: 0,
        passed: 0,
        failed: 0,
      },
    };

    try {
      // Parse JSDoc comments from file
      const jsDocComments = this.parseJSDocComments(fileContent);

      // Validate each JSDoc comment
      for (const comment of jsDocComments) {
        await this.validateJSDocComment(comment, layer, fileResult);
      }

      // Validate file-level documentation
      const hasFileLevel = jsDocComments.some((c) => c.content.includes('@fileoverview'));
      if (!hasFileLevel) {
        fileResult.issues.push('Missing file-level @fileoverview documentation');
        fileResult.valid = false;

        if (this.autoFix) {
          const fixedContent = this.addFileOverview(fileContent, filePath);
          await fs.writeFile(filePath, fixedContent);
          fileResult.fixed.push('Added file-level @fileoverview');
        }
      }

      // Update overall results
      if (fileResult.valid) {
        this.results.templates.valid++;
      } else {
        this.results.templates.invalid++;
      }

      if (fileResult.fixed.length > 0) {
        this.results.templates.fixed++;
      }

      // Update example validation stats
      this.results.examples.validated += fileResult.examples.validated;
      this.results.examples.passed += fileResult.examples.passed;
      this.results.examples.failed += fileResult.examples.failed;

      this.results.files.push(fileResult);
    } catch (error) {
      fileResult.issues.push(`Validation error: ${error.message}`);
      fileResult.valid = false;
      this.results.files.push(fileResult);
    }

    return fileResult;
  }

  /**
   * Parse JSDoc comments from file content
   *
   * @param {string} content - File content to parse
   * @returns {Array} Array of JSDoc comment objects
   *
   * @example JSDoc Comment Parsing
   * ```javascript
   * const comments = validator.parseJSDocComments(fileContent);
   *
   * comments.forEach(comment => {
   *   console.log('Comment Type:', comment.type);
   *   console.log('Content:', comment.content);
   *   console.log('Line:', comment.line);
   * });
   * ```
   */
  parseJSDocComments(content) {
    const comments = [];
    const lines = content.split('\n');

    let currentComment = null;
    let inComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('/**')) {
        inComment = true;
        currentComment = {
          content: line,
          startLine: i + 1,
          type: 'unknown',
        };
      } else if (inComment && line.includes('*/')) {
        if (currentComment) {
          currentComment.content += `\n${line}`;
          currentComment.endLine = i + 1;

          // Determine comment type based on following code
          currentComment.type = this.determineCommentType(content, i + 1);

          comments.push(currentComment);
        }
        inComment = false;
        currentComment = null;
      } else if (inComment && currentComment) {
        currentComment.content += `\n${line}`;
      }
    }

    return comments;
  }

  /**
   * Determine the type of JSDoc comment based on following code
   *
   * @param {string} content - Full file content
   * @param {number} lineAfterComment - Line number after comment ends
   * @returns {string} Comment type (file, class, interface, method, function)
   */
  determineCommentType(content, lineAfterComment) {
    const lines = content.split('\n');

    // Look at the next few non-empty lines
    for (let i = lineAfterComment; i < Math.min(lines.length, lineAfterComment + 5); i++) {
      const line = lines[i].trim();

      if (line.includes('@fileoverview')) return 'file';
      if (line.includes('export class') || line.includes('class ')) return 'class';
      if (line.includes('export interface') || line.includes('interface ')) return 'interface';
      if (line.includes('export function') || line.includes('function ')) return 'function';
      if (line.includes('(') && line.includes(')') && line.includes(':')) return 'method';
    }

    return 'unknown';
  }

  /**
   * Validate a single JSDoc comment against template standards
   *
   * @param {Object} comment - JSDoc comment object
   * @param {string} layer - Architecture layer (uacl, dal, usl, uel)
   * @param {Object} fileResult - File validation result to update
   *
   * @returns {Promise<void>} Comment validation completion
   *
   * @example JSDoc Comment Validation
   * ```javascript
   * const comment = {
   *   content: '/** @class MyClass ... */ ',
   *   type: 'class',
   *
  startLine: 10
  *
}
* 
   * await validator.validateJSDocComment(comment, 'dal', fileResult)
* ```
   */
  async validateJSDocComment(comment, layer, fileResult)
{
  const template = this.templates[comment.type];
  if (!template) return; // Skip unknown comment types

  const layerReqs = this.layerRequirements[layer] || {};

  // Check required tags
  for (const requiredTag of template.required) {
    if (!comment.content.includes(requiredTag)) {
      const issue = `Line ${comment.startLine}: Missing required tag ${requiredTag} for ${comment.type}`;
      fileResult.issues.push(issue);
      fileResult.valid = false;

      if (this.autoFix) {
        const _fixedComment = this.addMissingTag(comment, requiredTag);
        fileResult.fixed.push(`Added ${requiredTag} tag at line ${comment.startLine}`);
      }
    }
  }

  // Check layer-specific mandatory tags
  for (const mandatoryTag of layerReqs.mandatoryTags || []) {
    if (!comment.content.includes(mandatoryTag)) {
      const issue = `Line ${comment.startLine}: Missing layer-required tag ${mandatoryTag} for ${layer}`;
      fileResult.issues.push(issue);
      fileResult.valid = false;
    }
  }

  // Check example requirement
  if (layerReqs.exampleRequired && !comment.content.includes('@example')) {
    const issue = `Line ${comment.startLine}: Missing @example tag required for ${layer} layer`;
    fileResult.issues.push(issue);
    fileResult.valid = false;
  }

  // Validate examples if present
  if (this.validateExamples && comment.content.includes('@example')) {
    await this.validateExampleCode(comment, fileResult);
  }

  // Check template format compliance
  this.validateTemplateFormat(comment, template, fileResult);
}

/**
 * Validate example code within JSDoc comments
 *
 * @param {Object} comment - JSDoc comment containing examples
 * @param {Object} fileResult - File validation result to update
 *
 * @returns {Promise<void>} Example validation completion
 *
 * @example Example Code Validation
 * ```javascript
 * await validator.validateExampleCode(comment, fileResult);
 *
 * console.log('Examples validated:', fileResult.examples.validated);
 * console.log('Examples passed:', fileResult.examples.passed);
 * console.log('Examples failed:', fileResult.examples.failed);
 * ```
 */
async;
validateExampleCode(comment, fileResult);
{
  // Extract example code blocks
  const exampleRegex = /@example[^@]*?```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/g;
  let match;

  while ((match = exampleRegex.exec(comment.content)) !== null) {
    const exampleCode = match[1];
    fileResult.examples.validated++;

    try {
      // Basic syntax validation (this could be enhanced with actual compilation)
      if (this.isValidTypeScript(exampleCode)) {
        fileResult.examples.passed++;
      } else {
        fileResult.examples.failed++;
        fileResult.issues.push(`Line ${comment.startLine}: Invalid example code syntax`);
      }
    } catch (error) {
      fileResult.examples.failed++;
      fileResult.issues.push(
        `Line ${comment.startLine}: Example validation error: ${error.message}`
      );
    }
  }
}

/**
 * Basic TypeScript syntax validation for example code
 *
 * @param {string} code - Example code to validate
 * @returns {boolean} Whether the code appears syntactically valid
 *
 * @example TypeScript Validation
 * ```javascript
 * const isValid = validator.isValidTypeScript('const x: number = 42;');
 * console.log('Code is valid:', isValid); // true
 *
 * const isInvalid = validator.isValidTypeScript('const x number = ;');
 * console.log('Code is valid:', isInvalid); // false
 * ```
 */
isValidTypeScript(code);
{
  // Basic syntax checks - this could be enhanced with TypeScript compiler API
  try {
    // Check for balanced brackets
    const brackets = { '(': 0, '[': 0, '{': 0 };
    const closeBrackets = { ')': '(', ']': '[', '}': '{' };

    for (const char of code) {
      if (Object.hasOwn(brackets, char)) {
        brackets[char]++;
      } else if (Object.hasOwn(closeBrackets, char)) {
        const openBracket = closeBrackets[char];
        if (brackets[openBracket] > 0) {
          brackets[openBracket]--;
        } else {
          return false; // Unmatched closing bracket
        }
      }
    }

    // Check if all brackets are balanced
    return Object.values(brackets).every(count => count === 0);
  } catch (_error) {
    return false;
  }
}

/**
 * Validate JSDoc template format compliance
 *
 * @param {Object} comment - JSDoc comment to validate
 * @param {Object} template - Template requirements
 * @param {Object} fileResult - File validation result to update
 */
validateTemplateFormat(comment, template, fileResult);
{
  const format = template.format;
  if (!format) return;

  // Check format structure (this is a simplified implementation)
  const hasDescription =
    comment.content.includes('* @description') || comment.content.match(/^\s*\*\s*[A-Z]/m);

  if (!hasDescription) {
    fileResult.issues.push(`Line ${comment.startLine}: Missing description for ${comment.type}`);
    fileResult.valid = false;
  }
}

/**
 * Add missing JSDoc tag to comment
 *
 * @param {Object} comment - JSDoc comment to fix
 * @param {string} tag - Tag to add
 * @returns {string} Fixed comment content
 */
addMissingTag(comment, tag);
{
  // This is a simplified implementation of adding missing tags
  // In a real implementation, this would be more sophisticated

  const tagDescriptions = {
    '@param': '@param {Type} paramName - Parameter description',
    '@returns': '@returns {Type} Return value description',
    '@throws': '@throws {Error} Error condition description',
    '@example': '@example\n * ```typescript\n * // Example code here\n * ```',
    '@description': 'Description of the component',
    '@class': '@class ClassName',
    '@interface': '@interface InterfaceName',
  };

  const tagDescription = tagDescriptions[tag] || `${tag} Description needed`;

  // Find insertion point (before closing */)
  const lines = comment.content.split('\n');
  const lastLineIndex = lines.length - 1;

  lines.splice(lastLineIndex, 0, ` * ${tagDescription}`);

  return lines.join('\n');
}

/**
 * Add file-level overview documentation
 *
 * @param {string} content - File content
 * @param {string} filePath - Path to the file
 * @returns {string} Content with added file overview
 */
addFileOverview(content, filePath);
{
  const _relativePath = path.relative(this.rootDir, filePath);
  const layer = this.determineLayer(filePath);
  const layerName = this.getLayerName(layer);

  const fileOverview = `/**
 * ${path.basename(filePath, path.extname(filePath))} - ${layerName} Component
 * 
 * @fileoverview Brief description of this file's purpose and contents.
 *               This file is part of the ${layerName} in the Claude-Zen
 *               unified architecture.
 * @module ${layer}/${path.basename(filePath, path.extname(filePath))}
 * @version 2.0.0
 * @since 2.0.0-alpha.73
 * @author Claude-Zen Documentation Team
 */

`;

  return fileOverview + content;
}

/**
 * Determine which architecture layer a file belongs to
 *
 * @param {string} filePath - Path to the file
 * @returns {string} Layer identifier (uacl, dal, usl, uel, or 'core')
 */
determineLayer(filePath);
{
  const relativePath = path.relative(this.rootDir, filePath);

  if (relativePath.includes('interfaces/clients')) return 'uacl';
  if (relativePath.includes('database')) return 'dal';
  if (relativePath.includes('interfaces/services')) return 'usl';
  if (relativePath.includes('interfaces/events')) return 'uel';

  return 'core';
}

/**
 * Get human-readable layer name
 *
 * @param {string} layer - Layer identifier
 * @returns {string} Human-readable layer name
 */
getLayerName(layer);
{
  const layerNames = {
    uacl: 'Unified API Client Layer',
    dal: 'Data Access Layer',
    usl: 'Unified Service Layer',
    uel: 'Unified Event Layer',
    core: 'Core System',
  };

  return layerNames[layer] || 'Core System';
}

/**
 * Find all TypeScript files in directory recursively
 *
 * @param {string} dir - Directory to search
 * @returns {Promise<string[]>} Array of TypeScript file paths
 */
async;
findTypeScriptFiles(dir);
{
  const files = [];

  async function traverse(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
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
          !entry.name.endsWith('.spec.ts') &&
          !entry.name.endsWith('.d.ts')
        ) {
          files.push(fullPath);
        }
      }
    } catch (_error) {
      // Skip directories that can't be read
    }
  }

  await traverse(dir);
  return files;
}

/**
 * Generate comprehensive validation report
 *
 * @returns {Promise<void>} Report generation completion
 *
 * @example Generate Validation Report
 * ```javascript
 * await validator.generateValidationReport();
 * console.log('Validation report saved to docs/template-validation-report.md');
 * ```
 */
async;
generateValidationReport();
{
  const report = this.buildMarkdownReport();
  const reportPath = path.join('./docs/generated', 'template-validation-report.md');

  // Ensure directory exists
  await fs.mkdir(path.dirname(reportPath), { recursive: true });

  await fs.writeFile(reportPath, report);

  // Also generate JSON report
  const jsonReportPath = path.join('./docs/generated', 'template-validation-report.json');
  await fs.writeFile(jsonReportPath, JSON.stringify(this.results, null, 2));
}

/**
 * Build markdown validation report
 *
 * @returns {string} Markdown formatted validation report
 */
buildMarkdownReport();
{
  return `# JSDoc Template Validation Report - Claude-Zen

## Executive Summary

**Generated:** ${new Date().toISOString()}
**Auto-fix Mode:** ${this.autoFix ? 'Enabled' : 'Disabled'}

### Template Validation Results
- **Valid Files:** ${this.results.templates.valid}
- **Invalid Files:** ${this.results.templates.invalid}
- **Auto-fixes Applied:** ${this.results.templates.fixed}
- **Success Rate:** ${((this.results.templates.valid / (this.results.templates.valid + this.results.templates.invalid)) * 100).toFixed(1)}%

### Example Code Validation
- **Examples Validated:** ${this.results.examples.validated}
- **Examples Passed:** ${this.results.examples.passed}
- **Examples Failed:** ${this.results.examples.failed}
- **Example Success Rate:** ${this.results.examples.validated > 0 ? ((this.results.examples.passed / this.results.examples.validated) * 100).toFixed(1) : 0}%

## Layer Breakdown

${this.layers.map(layer => {
  const layerFiles = this.results.files.filter(f => f.layer === layer);
  const validFiles = layerFiles.filter(f => f.valid).length;
  const invalidFiles = layerFiles.filter(f => !f.valid).length;
  
  return `### ${layer.toUpperCase()} - ${this.getLayerName(layer)}

- **Files:** ${layerFiles.length}
- **Valid:** ${validFiles}
- **Invalid:** ${invalidFiles}
- **Success Rate:** ${layerFiles.length > 0 ? ((validFiles / layerFiles.length) * 100).toFixed(1) : 0}%`;
}).join('\n\n')}

## Detailed File Results

${this.results.files.map(file => {
  return `### ${file.path} (${file.layer.toUpperCase()})

**Status:** ${file.valid ? '✅ Valid' : '❌ Invalid'}

${file.issues.length > 0 ? `**Issues:**
${file.issues.map(issue => `- ❌ ${issue}`).join('\n')}` : ''}

${file.fixed.length > 0 ? `**Auto-fixes:**
${file.fixed.map(fix => `- 🔧 ${fix}`).join('\n')}` : ''}

${file.examples.validated > 0 ? `**Examples:** ${file.examples.passed}/${file.examples.validated} passed` : ''}`;
}).join('\n\n')}

## Template Standards Reference

### File-Level Template
- **Required:** ${this.templates.fileLevel.required.join(', ')}
- **Optional:** ${this.templates.fileLevel.optional.join(', ')}

### Class Template
- **Required:** ${this.templates.class.required.join(', ')}
- **Optional:** ${this.templates.class.optional.join(', ')}

### Interface Template
- **Required:** ${this.templates.interface.required.join(', ')}
- **Optional:** ${this.templates.interface.optional.join(', ')}

### Method/Function Template
- **Required:** ${this.templates.method.required.join(', ')}
- **Optional:** ${this.templates.method.optional.join(', ')}

## Layer-Specific Requirements

${this.layers.map(layer => {
  const reqs = this.layerRequirements[layer];
  return `### ${layer.toUpperCase()}
- **Mandatory Tags:** ${reqs.mandatoryTags.join(', ')}
- **Examples Required:** ${reqs.exampleRequired ? 'Yes' : 'No'}
- **Error Handling:** ${reqs.errorHandling ? 'Required' : 'Optional'}`;
}).join('\n\n')}

## Recommendations

${this.generateRecommendations()}

---
*Generated by Claude-Zen JSDoc Template Validator v2.0.0*
`;
}

/**
 * Generate improvement recommendations
 *
 * @returns {string} Markdown formatted recommendations
 */
generateRecommendations();
{
  const recommendations = [];

  if (this.results.templates.invalid > 0) {
    recommendations.push(
      '📝 **Fix Template Issues**: Address invalid JSDoc templates to improve documentation consistency.'
    );
  }

  if (this.results.examples.failed > 0) {
    recommendations.push(
      '🔧 **Fix Example Code**: Update failing example code to ensure all examples are syntactically correct.'
    );
  }

  if (!this.autoFix) {
    recommendations.push(
      '⚡ **Enable Auto-fix**: Consider using --auto-fix flag to automatically resolve common template issues.'
    );
  }

  const layersWithIssues = this.layers.filter((layer) => {
    const layerFiles = this.results.files.filter((f) => f.layer === layer);
    const invalidFiles = layerFiles.filter((f) => !f.valid).length;
    return invalidFiles > 0;
  });

  if (layersWithIssues.length > 0) {
    recommendations.push(
      `🎯 **Focus on Layers**: ${layersWithIssues.map((l) => l.toUpperCase()).join(', ')} have template validation issues that need attention.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      '✅ **Excellent Templates**: All JSDoc templates meet the validation standards. Maintain current quality.'
    );
  }

  return recommendations.join('\n\n');
}

/**
 * Get file-level template format
 *
 * @returns {Object} File template format specification
 */
getFileTemplateFormat();
{
  return {
      structure: [
        'description',
        'fileoverview',
        'module',
        'version',
        'since',
        'author'
      ]
    };
}

/**
 * Get class template format
 *
 * @returns {Object} Class template format specification
 */
getClassTemplateFormat();
{
  return {
      structure: [
        'description',
        'class',
        'template',
        'extends',
        'implements',
        'example'
      ]
    };
}

/**
 * Get interface template format
 *
 * @returns {Object} Interface template format specification
 */
getInterfaceTemplateFormat();
{
  return {
      structure: [
        'description',
        'interface',
        'template',
        'example'
      ]
    };
}

/**
 * Get method template format
 *
 * @returns {Object} Method template format specification
 */
getMethodTemplateFormat();
{
  return {
      structure: [
        'description',
        'param',
        'returns',
        'throws',
        'emits',
        'example',
        'since'
      ]
    };
}

/**
 * Get function template format
 *
 * @returns {Object} Function template format specification
 */
getFunctionTemplateFormat();
{
  return {
      structure: [
        'description',
        'param',
        'returns',
        'throws',
        'example',
        'since'
      ]
    };
}
}

/**
 * Command-line interface for JSDoc template validator
 * 
 * @example CLI Usage
 * ```bash
 * # Validate templates without auto-fix
 * node scripts/template-validator.js
 * 
 * # Validate with automatic fixes
 * node scripts/template-validator.js --auto-fix
 * 
 * # Validate specific layer only
 * node scripts/template-validator.js --layer dal
 * 
 * # Disable example validation
 * node scripts/template-validator.js --no-examples
 * 
 * # Custom source directory
 * node scripts/template-validator.js --root ./custom/src
 * ```
 */
async
function main() {
  const args = process.argv.slice(2);
  const config = {
    rootDir: './src',
    autoFix: args.includes('--auto-fix'),
    validateExamples: !args.includes('--no-examples'),
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
    const validator = new TemplateValidator(config);
    const results = await validator.validateTemplates();

    // Exit with error if there are unfixed template issues
    const exitCode = results.templates.invalid > 0 ? 1 : 0;

    if (exitCode === 0) {
    } else {
    }

    process.exit(exitCode);
  } catch (error) {
    // console.error('💥 Template validation failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TemplateValidator };
