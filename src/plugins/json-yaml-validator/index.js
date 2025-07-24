/**
 * JSON/YAML Validator Plugin
 * Validation, formatting, and schema checking for JSON/YAML files
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export class JsonYamlValidatorPlugin {
  constructor(config = {}) {
    this.config = {
      filePatterns: ['**/*.{json,yaml,yml}'],
      ignorePatterns: ['node_modules/**', '.git/**', '.hive-mind/**', 'dist/**'],
      validateSchema: true,
      autoFix: false,
      indentSize: 2,
      maxFileSize: 1024 * 1024, // 1MB
      enableSorting: true,
      customSchemas: {},
      ...config
    };
    
    this.validators = new Map();
    this.schemas = new Map();
    this.stats = {
      filesScanned: 0,
      issuesFound: 0,
      autoFixed: 0
    };
  }

  async initialize() {
    console.log('📄 JSON/YAML Validator Plugin initialized');
    
    // Initialize validators
    await this.initializeValidators();
    
    // Load schemas
    await this.loadSchemas();
  }

  async initializeValidators() {
    // JSON Validator
    this.validators.set('json', {
      type: 'json',
      extensions: ['.json'],
      
      async validate(content, filename) {
        const issues = [];
        
        try {
          const parsed = JSON.parse(content);
          
          // Check formatting
          const formatted = JSON.stringify(parsed, null, this.config.indentSize);
          if (content.trim() !== formatted.trim()) {
            issues.push({
              type: 'formatting',
              severity: 'low',
              message: 'JSON formatting could be improved',
              line: null,
              column: null,
              fixable: true,
              suggestion: formatted
            });
          }
          
          // Check for common JSON issues
          const jsonIssues = await this.validateJsonStructure(parsed, filename);
          issues.push(...jsonIssues);
          
          return {
            valid: true,
            parsed: parsed,
            issues: issues
          };
        } catch (error) {
          return {
            valid: false,
            parsed: null,
            issues: [{
              type: 'syntax',
              severity: 'high',
              message: `JSON syntax error: ${error.message}`,
              line: this.extractLineNumber(error.message),
              column: null,
              fixable: false
            }]
          };
        }
      },
      
      async format(content) {
        try {
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed, null, this.config.indentSize);
        } catch (error) {
          throw new Error(`Cannot format invalid JSON: ${error.message}`);
        }
      }
    });

    // YAML Validator
    this.validators.set('yaml', {
      type: 'yaml',
      extensions: ['.yaml', '.yml'],
      
      async validate(content, filename) {
        const issues = [];
        
        try {
          const yaml = await import('js-yaml');
          const parsed = yaml.load(content);
          
          // Check formatting
          const formatted = yaml.dump(parsed, { 
            indent: this.config.indentSize,
            lineWidth: 120,
            noRefs: true
          });
          
          if (content.trim() !== formatted.trim()) {
            issues.push({
              type: 'formatting',
              severity: 'low',
              message: 'YAML formatting could be improved',
              line: null,
              column: null,
              fixable: true,
              suggestion: formatted
            });
          }
          
          // Check for common YAML issues
          const yamlIssues = await this.validateYamlStructure(parsed, content, filename);
          issues.push(...yamlIssues);
          
          return {
            valid: true,
            parsed: parsed,
            issues: issues
          };
        } catch (error) {
          return {
            valid: false,
            parsed: null,
            issues: [{
              type: 'syntax',
              severity: 'high',
              message: `YAML syntax error: ${error.message}`,
              line: error.mark?.line || null,
              column: error.mark?.column || null,
              fixable: false
            }]
          };
        }
      },
      
      async format(content) {
        try {
          const yaml = await import('js-yaml');
          const parsed = yaml.load(content);
          return yaml.dump(parsed, { 
            indent: this.config.indentSize,
            lineWidth: 120,
            noRefs: true
          });
        } catch (error) {
          throw new Error(`Cannot format invalid YAML: ${error.message}`);
        }
      }
    });

    console.log(`✅ Initialized ${this.validators.size} file validators`);
  }

  async loadSchemas() {
    // Built-in schemas for common file types
    const builtinSchemas = {
      'package.json': {
        type: 'object',
        properties: {
          name: { type: 'string' },
          version: { type: 'string' },
          description: { type: 'string' },
          main: { type: 'string' },
          scripts: { type: 'object' },
          dependencies: { type: 'object' },
          devDependencies: { type: 'object' }
        },
        required: ['name', 'version']
      },
      'tsconfig.json': {
        type: 'object',
        properties: {
          compilerOptions: { type: 'object' },
          include: { type: 'array' },
          exclude: { type: 'array' }
        }
      },
      'docker-compose.yml': {
        type: 'object',
        properties: {
          version: { type: 'string' },
          services: { type: 'object' },
          networks: { type: 'object' },
          volumes: { type: 'object' }
        }
      },
      '.github/workflows/*.yml': {
        type: 'object',
        properties: {
          name: { type: 'string' },
          on: { oneOf: [{ type: 'string' }, { type: 'object' }] },
          jobs: { type: 'object' }
        },
        required: ['on', 'jobs']
      }
    };

    // Load built-in schemas
    for (const [pattern, schema] of Object.entries(builtinSchemas)) {
      this.schemas.set(pattern, schema);
    }

    // Load custom schemas
    for (const [pattern, schema] of Object.entries(this.config.customSchemas)) {
      this.schemas.set(pattern, schema);
    }

    console.log(`📋 Loaded ${this.schemas.size} validation schemas`);
  }

  async scan(rootPath, options = {}) {
    console.log(`🔍 Scanning JSON/YAML files in ${rootPath}`);
    
    this.stats = { filesScanned: 0, issuesFound: 0, autoFixed: 0 };
    const results = {
      summary: {
        filesScanned: 0,
        validFiles: 0,
        invalidFiles: 0,
        issuesFound: 0,
        autoFixed: 0
      },
      files: [],
      suggestions: []
    };

    try {
      // Find JSON/YAML files
      const files = await this.findFiles(rootPath);
      
      for (const file of files) {
        const fileResult = await this.validateFile(file, options);
        results.files.push(fileResult);
        
        this.stats.filesScanned++;
        if (fileResult.valid) {
          results.summary.validFiles++;
        } else {
          results.summary.invalidFiles++;
        }
        
        this.stats.issuesFound += fileResult.issues.length;
        results.summary.issuesFound += fileResult.issues.length;
        
        // Convert issues to suggestions
        for (const issue of fileResult.issues) {
          if (issue.severity === 'high' || issue.severity === 'medium') {
            results.suggestions.push({
              id: `json-yaml-${path.basename(file)}-${issue.type}`,
              description: `${issue.message} in ${file}`,
              action: issue.fixable ? 'fix_formatting' : 'manual_review',
              file: file,
              issue: issue,
              severity: issue.severity,
              fixable: issue.fixable
            });
          }
        }
        
        // Auto-fix if enabled
        if (this.config.autoFix && fileResult.issues.some(i => i.fixable)) {
          await this.autoFixFile(file, fileResult);
          this.stats.autoFixed++;
          results.summary.autoFixed++;
        }
      }
      
      results.summary.filesScanned = this.stats.filesScanned;
      
      console.log(`✅ Scanned ${results.summary.filesScanned} files, found ${results.summary.issuesFound} issues`);
      
      return results;
    } catch (error) {
      console.error('❌ JSON/YAML scanning failed:', error.message);
      throw error;
    }
  }

  async validateFile(filePath, options = {}) {
    const result = {
      file: filePath,
      valid: true,
      issues: [],
      metadata: {
        size: 0,
        type: null,
        schema: null
      }
    };

    try {
      // Check file size
      const stats = await import('fs').then(fs => fs.promises.stat(filePath));
      result.metadata.size = stats.size;
      
      if (stats.size > this.config.maxFileSize) {
        result.issues.push({
          type: 'size',
          severity: 'medium',
          message: `File size (${Math.round(stats.size / 1024)}KB) exceeds limit (${Math.round(this.config.maxFileSize / 1024)}KB)`,
          fixable: false
        });
      }

      // Read file content
      const content = await readFile(filePath, 'utf8');
      
      // Determine file type
      const ext = path.extname(filePath).toLowerCase();
      const validator = Array.from(this.validators.values())
        .find(v => v.extensions.includes(ext));
      
      if (!validator) {
        result.issues.push({
          type: 'unsupported',
          severity: 'low',
          message: `Unsupported file type: ${ext}`,
          fixable: false
        });
        return result;
      }

      result.metadata.type = validator.type;
      
      // Validate syntax and formatting
      const validation = await validator.validate.call(this, content, filePath);
      result.valid = validation.valid;
      result.issues.push(...validation.issues);
      
      // Schema validation
      if (validation.valid && this.config.validateSchema) {
        const schemaIssues = await this.validateSchema(validation.parsed, filePath);
        result.issues.push(...schemaIssues);
        if (schemaIssues.length > 0) {
          result.metadata.schema = 'validated';
        }
      }
      
      // Security checks
      const securityIssues = await this.performSecurityChecks(content, filePath);
      result.issues.push(...securityIssues);
      
    } catch (error) {
      result.valid = false;
      result.issues.push({
        type: 'error',
        severity: 'high',
        message: `Validation error: ${error.message}`,
        fixable: false
      });
    }

    return result;
  }

  async validateJsonStructure(parsed, filename) {
    const issues = [];
    
    // Check for empty objects/arrays
    if (typeof parsed === 'object' && Object.keys(parsed).length === 0) {
      issues.push({
        type: 'structure',
        severity: 'low',
        message: 'File contains empty object/array',
        fixable: false
      });
    }
    
    // Check for null values (might be intentional)
    const nullCount = this.countNullValues(parsed);
    if (nullCount > 0) {
      issues.push({
        type: 'structure',
        severity: 'low',
        message: `Contains ${nullCount} null values - verify if intentional`,
        fixable: false
      });
    }
    
    // Check for very deep nesting
    const depth = this.calculateDepth(parsed);
    if (depth > 10) {
      issues.push({
        type: 'structure',
        severity: 'medium',
        message: `Very deep nesting (${depth} levels) - consider flattening`,
        fixable: false
      });
    }
    
    // Package.json specific checks
    if (filename.endsWith('package.json')) {
      const packageIssues = this.validatePackageJson(parsed);
      issues.push(...packageIssues);
    }
    
    return issues;
  }

  async validateYamlStructure(parsed, content, filename) {
    const issues = [];
    
    // Check for tabs (YAML should use spaces)
    if (content.includes('\t')) {
      issues.push({
        type: 'style',
        severity: 'medium',
        message: 'YAML should use spaces, not tabs for indentation',
        fixable: true
      });
    }
    
    // Check for inconsistent indentation
    const lines = content.split('\n');
    const indentationIssues = this.checkYamlIndentation(lines);
    issues.push(...indentationIssues);
    
    // Docker Compose specific checks
    if (filename.includes('docker-compose')) {
      const dockerIssues = this.validateDockerCompose(parsed);
      issues.push(...dockerIssues);
    }
    
    // GitHub Actions workflow checks
    if (filename.includes('.github/workflows')) {
      const workflowIssues = this.validateGitHubWorkflow(parsed);
      issues.push(...workflowIssues);
    }
    
    return issues;
  }

  async validateSchema(data, filePath) {
    const issues = [];
    
    // Find matching schema
    let matchingSchema = null;
    const fileName = path.basename(filePath);
    
    for (const [pattern, schema] of this.schemas) {
      if (this.matchesPattern(filePath, pattern) || fileName === pattern) {
        matchingSchema = schema;
        break;
      }
    }
    
    if (!matchingSchema) {
      return issues; // No schema to validate against
    }
    
    try {
      // Simple schema validation (in production, use ajv or similar)
      const validationErrors = this.validateAgainstSchema(data, matchingSchema);
      for (const error of validationErrors) {
        issues.push({
          type: 'schema',
          severity: 'medium',
          message: `Schema validation: ${error}`,
          fixable: false
        });
      }
    } catch (error) {
      issues.push({
        type: 'schema',
        severity: 'low',
        message: `Schema validation failed: ${error.message}`,
        fixable: false
      });
    }
    
    return issues;
  }

  async performSecurityChecks(content, filePath) {
    const issues = [];
    
    // Check for potential secrets
    const secretPatterns = [
      { pattern: /"password"\s*:\s*"[^"]{8,}"/, message: 'Potential password in JSON' },
      { pattern: /"api[_-]?key"\s*:\s*"[^"]{10,}"/, message: 'Potential API key in JSON' },
      { pattern: /"secret"\s*:\s*"[^"]{8,}"/, message: 'Potential secret in JSON' },
      { pattern: /password:\s*['"][^'"]{8,}['"]/, message: 'Potential password in YAML' },
      { pattern: /api[_-]?key:\s*['"][^'"]{10,}['"]/, message: 'Potential API key in YAML' }
    ];
    
    for (const { pattern, message } of secretPatterns) {
      if (pattern.test(content)) {
        issues.push({
          type: 'security',
          severity: 'high',
          message: message,
          fixable: false
        });
      }
    }
    
    // Check for suspicious URLs
    const urlPattern = /https?:\/\/[^\s"']+/g;
    const urls = content.match(urlPattern) || [];
    for (const url of urls) {
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        issues.push({
          type: 'security',
          severity: 'low',
          message: `Localhost URL found: ${url} - consider using environment variables`,
          fixable: false
        });
      }
    }
    
    return issues;
  }

  validatePackageJson(data) {
    const issues = [];
    
    // Check for missing important fields
    const importantFields = ['description', 'author', 'license', 'repository'];
    for (const field of importantFields) {
      if (!data[field]) {
        issues.push({
          type: 'package',
          severity: 'low',
          message: `Missing recommended field: ${field}`,
          fixable: false
        });
      }
    }
    
    // Check for security vulnerabilities in dependencies
    if (data.dependencies) {
      for (const [dep, version] of Object.entries(data.dependencies)) {
        if (version.includes('*') || version.includes('latest')) {
          issues.push({
            type: 'package',
            severity: 'medium',
            message: `Unpinned dependency version: ${dep}@${version}`,
            fixable: false
          });
        }
      }
    }
    
    return issues;
  }

  validateDockerCompose(data) {
    const issues = [];
    
    if (!data.version) {
      issues.push({
        type: 'docker',
        severity: 'medium',
        message: 'Missing version field in docker-compose.yml',
        fixable: false
      });
    }
    
    if (!data.services) {
      issues.push({
        type: 'docker',
        severity: 'high',
        message: 'No services defined in docker-compose.yml',
        fixable: false
      });
    } else {
      // Check each service
      for (const [serviceName, service] of Object.entries(data.services)) {
        if (!service.image && !service.build) {
          issues.push({
            type: 'docker',
            severity: 'high',
            message: `Service ${serviceName} missing image or build configuration`,
            fixable: false
          });
        }
      }
    }
    
    return issues;
  }

  validateGitHubWorkflow(data) {
    const issues = [];
    
    if (!data.on) {
      issues.push({
        type: 'workflow',
        severity: 'high',
        message: 'GitHub workflow missing trigger (on) configuration',
        fixable: false
      });
    }
    
    if (!data.jobs || Object.keys(data.jobs).length === 0) {
      issues.push({
        type: 'workflow',
        severity: 'high',
        message: 'GitHub workflow has no jobs defined',
        fixable: false
      });
    }
    
    return issues;
  }

  // Helper methods
  async findFiles(rootPath) {
    const { glob } = await import('glob');
    
    const files = [];
    for (const pattern of this.config.filePatterns) {
      const matches = await glob(pattern, {
        cwd: rootPath,
        absolute: true,
        ignore: this.config.ignorePatterns
      });
      files.push(...matches);
    }
    
    return [...new Set(files)]; // Remove duplicates
  }

  async autoFixFile(filePath, validationResult) {
    const fixableIssues = validationResult.issues.filter(i => i.fixable);
    if (fixableIssues.length === 0) return;
    
    try {
      const content = await readFile(filePath, 'utf8');
      const ext = path.extname(filePath).toLowerCase();
      const validator = Array.from(this.validators.values())
        .find(v => v.extensions.includes(ext));
      
      if (validator) {
        const formatted = await validator.format.call(this, content);
        await writeFile(filePath, formatted, 'utf8');
        console.log(`🔧 Auto-fixed formatting in ${filePath}`);
      }
    } catch (error) {
      console.warn(`⚠️ Auto-fix failed for ${filePath}: ${error.message}`);
    }
  }

  // Utility methods
  extractLineNumber(errorMessage) {
    const match = errorMessage.match(/line (\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  countNullValues(obj, count = 0) {
    if (obj === null) return count + 1;
    if (typeof obj === 'object' && obj !== null) {
      for (const value of Object.values(obj)) {
        count = this.countNullValues(value, count);
      }
    }
    return count;
  }

  calculateDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) return depth;
    return Math.max(...Object.values(obj).map(v => this.calculateDepth(v, depth + 1)));
  }

  checkYamlIndentation(lines) {
    const issues = [];
    const expectedIndent = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '' || line.trim().startsWith('#')) continue;
      
      const indent = line.match(/^(\s*)/)[1].length;
      if (indent % this.config.indentSize !== 0) {
        issues.push({
          type: 'indentation',
          severity: 'low',
          message: `Inconsistent indentation on line ${i + 1}`,
          line: i + 1,
          fixable: true
        });
      }
    }
    
    return issues;
  }

  matchesPattern(filePath, pattern) {
    // Simple pattern matching (in production, use minimatch or similar)
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  }

  validateAgainstSchema(data, schema) {
    const errors = [];
    
    // Simple schema validation
    if (schema.type && typeof data !== schema.type) {
      errors.push(`Expected type ${schema.type}, got ${typeof data}`);
    }
    
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }
    
    return errors;
  }

  async getStats() {
    return {
      ...this.stats,
      validators: this.validators.size,
      schemas: this.schemas.size,
      filePatterns: this.config.filePatterns,
      autoFixEnabled: this.config.autoFix
    };
  }

  async cleanup() {
    this.validators.clear();
    this.schemas.clear();
    console.log('📄 JSON/YAML Validator Plugin cleaned up');
  }
}

export default JsonYamlValidatorPlugin;