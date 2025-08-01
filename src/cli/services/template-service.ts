/**
 * Template Service
 * 
 * Provides template operations for project initialization and code generation.
 * Supports multiple template engines, variable substitution, and custom templates.
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { EventEmitter } from 'events';
import { createLogger, type Logger } from '../utils/logger';
import { ensureDirectory, copyFile, findFiles, isDirectory } from '../utils/file-system';
import { validateString, validateObject } from '../utils/validation';
import type { Result, ValidationResult } from '../types/index';

/**
 * Template variable definition
 */
export interface TemplateVariable {
  /** Variable name */
  name: string;
  
  /** Variable description */
  description: string;
  
  /** Variable type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  
  /** Default value */
  defaultValue?: any;
  
  /** Whether variable is required */
  required?: boolean;
  
  /** Validation pattern (for strings) */
  pattern?: string;
  
  /** Allowed values (enum) */
  allowedValues?: any[];
  
  /** Prompt message for interactive input */
  prompt?: string;
}

/**
 * Template context for rendering
 */
export interface TemplateContext {
  /** Template variables */
  variables: Record<string, any>;
  
  /** Template metadata */
  metadata: {
    templateName: string;
    templateVersion: string;
    generatedAt: Date;
    generatedBy: string;
  };
  
  /** Helper functions */
  helpers: Record<string, (...args: any[]) => any>;
}

/**
 * Template configuration
 */
export interface TemplateConfig {
  /** Template name */
  name: string;
  
  /** Template version */
  version: string;
  
  /** Template description */
  description: string;
  
  /** Template author */
  author?: string;
  
  /** Template license */
  license?: string;
  
  /** Template tags */
  tags?: string[];
  
  /** Template variables */
  variables: TemplateVariable[];
  
  /** Files to ignore during template processing */
  ignore?: string[];
  
  /** File patterns to process */
  include?: string[];
  
  /** Template engine to use */
  engine?: 'handlebars' | 'mustache' | 'simple' | 'custom';
  
  /** Custom template engine configuration */
  engineConfig?: Record<string, any>;
  
  /** Post-processing scripts */
  postProcess?: string[];
  
  /** Dependencies to install */
  dependencies?: {
    npm?: string[];
    system?: string[];
  };
}

/**
 * Project template definition
 */
export interface ProjectTemplate {
  /** Template configuration */
  config: TemplateConfig;
  
  /** Template directory path */
  path: string;
  
  /** Template files */
  files: string[];
  
  /** Template size in bytes */
  size: number;
  
  /** Template creation date */
  createdAt: Date;
  
  /** Template modification date */
  modifiedAt: Date;
}

/**
 * Template render result
 */
export interface TemplateRenderResult {
  /** Render success */
  success: boolean;
  
  /** Render message */
  message: string;
  
  /** Generated files */
  generatedFiles: string[];
  
  /** Skipped files */
  skippedFiles: string[];
  
  /** Errors encountered */
  errors: Array<{
    file: string;
    error: string;
  }>;
  
  /** Render duration */
  duration: number;
  
  /** Output directory */
  outputDir: string;
}

/**
 * Template engine interface
 */
export interface TemplateEngine {
  /** Engine name */
  name: string;
  
  /** Render template content */
  render(content: string, context: TemplateContext): Promise<string>;
  
  /** Check if file should be processed */
  shouldProcess(filePath: string): boolean;
  
  /** Get file patterns this engine handles */
  getPatterns(): string[];
}

/**
 * Simple template engine implementation
 */
class SimpleTemplateEngine implements TemplateEngine {
  name = 'simple';
  
  async render(content: string, context: TemplateContext): Promise<string> {
    let result = content;
    
    // Replace variables using {{variable}} syntax
    for (const [key, value] of Object.entries(context.variables)) {
      const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(pattern, String(value));
    }
    
    // Replace metadata variables
    result = result.replace(/\{\{\s*templateName\s*\}\}/g, context.metadata.templateName);
    result = result.replace(/\{\{\s*templateVersion\s*\}\}/g, context.metadata.templateVersion);
    result = result.replace(/\{\{\s*generatedAt\s*\}\}/g, context.metadata.generatedAt.toISOString());
    result = result.replace(/\{\{\s*generatedBy\s*\}\}/g, context.metadata.generatedBy);
    
    // Apply helper functions
    for (const [helperName, helperFn] of Object.entries(context.helpers)) {
      const pattern = new RegExp(`\\{\\{\\s*${helperName}\\s*\\(([^)]+)\\)\\s*\\}\\}`, 'g');
      result = result.replace(pattern, (match, args) => {
        try {
          const argList = args.split(',').map((arg: string) => arg.trim().replace(/["']/g, ''));
          return String(helperFn(...argList));
        } catch (error) {
          return match; // Keep original if helper fails
        }
      });
    }
    
    return result;
  }
  
  shouldProcess(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return !['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.zip', '.tar', '.gz'].includes(ext);
  }
  
  getPatterns(): string[] {
    return ['**/*'];
  }
}

/**
 * Default template helpers
 */
const DEFAULT_HELPERS = {
  uppercase: (str: string) => str.toUpperCase(),
  lowercase: (str: string) => str.toLowerCase(),
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  camelCase: (str: string) => str.replace(/[-_\s](.)/g, (_, char) => char.toUpperCase()),
  kebabCase: (str: string) => str.replace(/[A-Z]/g, (char) => '-' + char.toLowerCase()).replace(/^-/, ''),
  snakeCase: (str: string) => str.replace(/[A-Z]/g, (char) => '_' + char.toLowerCase()).replace(/^_/, ''),
  pascalCase: (str: string) => str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_\s](.)/g, (_, char) => char.toUpperCase()),
  pluralize: (str: string) => str.endsWith('s') ? str : str + 's',
  singularize: (str: string) => str.endsWith('s') ? str.slice(0, -1) : str,
  now: () => new Date().toISOString(),
  timestamp: () => Date.now(),
  uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }),
};

/**
 * Template service implementation
 */
export class TemplateService extends EventEmitter {
  private logger: Logger;
  private templatesDir: string;
  private engines = new Map<string, TemplateEngine>();
  private templates = new Map<string, ProjectTemplate>();
  private initialized = false;
  
  constructor(config?: Record<string, any>) {
    super();
    this.logger = createLogger({ prefix: 'TemplateService' });
    this.templatesDir = config?.templatesDir || join(process.cwd(), 'templates');
    
    // Register default template engine
    this.registerEngine(new SimpleTemplateEngine());
  }
  
  /**
   * Initialize the template service
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      // Ensure templates directory exists
      await ensureDirectory(this.templatesDir);
      
      // Load available templates
      await this.loadTemplates();
      
      this.initialized = true;
      this.logger.info('Template service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize template service:', error);
      throw error;
    }
  }
  
  /**
   * Dispose the template service
   */
  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    try {
      this.templates.clear();
      this.engines.clear();
      this.initialized = false;
      
      this.logger.info('Template service disposed');
    } catch (error) {
      this.logger.error('Error disposing template service:', error);
    }
  }
  
  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      if (!this.initialized) {
        return {
          healthy: false,
          message: 'Service not initialized',
        };
      }
      
      // Check if templates directory exists
      if (!existsSync(this.templatesDir)) {
        return {
          healthy: false,
          message: 'Templates directory not accessible',
        };
      }
      
      const templateCount = this.templates.size;
      const engineCount = this.engines.size;
      
      return {
        healthy: true,
        message: `${templateCount} templates, ${engineCount} engines`,
      };
    } catch (error) {
      return {
        healthy: false,
        message: (error as Error).message,
      };
    }
  }
  
  /**
   * Register a template engine
   */
  registerEngine(engine: TemplateEngine): void {
    this.engines.set(engine.name, engine);
    this.logger.debug(`Registered template engine: ${engine.name}`);
  }
  
  /**
   * Get available templates
   */
  async getTemplates(): Promise<Result<ProjectTemplate[]>> {
    try {
      await this.loadTemplates(); // Refresh templates
      return {
        success: true,
        data: Array.from(this.templates.values()),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
  
  /**
   * Get a specific template
   */
  async getTemplate(name: string): Promise<Result<ProjectTemplate>> {
    try {
      const template = this.templates.get(name);
      if (!template) {
        return {
          success: false,
          error: new Error(`Template '${name}' not found`),
        };
      }
      
      return {
        success: true,
        data: template,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
  
  /**
   * Render a template to a target directory
   */
  async renderTemplate(
    templateName: string,
    outputDir: string,
    variables: Record<string, any> = {},
    options: {
      overwrite?: boolean;
      dryRun?: boolean;
      customHelpers?: Record<string, (...args: any[]) => any>;
    } = {}
  ): Promise<Result<TemplateRenderResult>> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Rendering template '${templateName}' to '${outputDir}'`);
      
      // Get template
      const templateResult = await this.getTemplate(templateName);
      if (!templateResult.success) {
        return templateResult as Result<TemplateRenderResult>;
      }
      
      const template = templateResult.data;
      
      // Validate variables
      const validationResult = await this.validateVariables(template.config.variables, variables);
      if (!validationResult.valid) {
        return {
          success: false,
          error: new Error(`Variable validation failed: ${validationResult.errors[0]?.message}`),
        };
      }
      
      // Prepare template context
      const context: TemplateContext = {
        variables,
        metadata: {
          templateName: template.config.name,
          templateVersion: template.config.version,
          generatedAt: new Date(),
          generatedBy: 'claude-flow',
        },
        helpers: {
          ...DEFAULT_HELPERS,
          ...options.customHelpers,
        },
      };
      
      // Get template engine
      const engineName = template.config.engine || 'simple';
      const engine = this.engines.get(engineName);
      if (!engine) {
        return {
          success: false,
          error: new Error(`Template engine '${engineName}' not found`),
        };
      }
      
      // Ensure output directory exists (unless dry run)
      if (!options.dryRun) {
        await ensureDirectory(outputDir);
      }
      
      const result: TemplateRenderResult = {
        success: true,
        message: 'Template rendered successfully',
        generatedFiles: [],
        skippedFiles: [],
        errors: [],
        duration: 0,
        outputDir,
      };
      
      // Process template files
      for (const relativeFilePath of template.files) {
        const sourceFilePath = join(template.path, relativeFilePath);
        const targetFilePath = join(outputDir, relativeFilePath);
        
        try {
          // Check if file should be skipped
          if (this.shouldSkipFile(relativeFilePath, template.config)) {
            result.skippedFiles.push(relativeFilePath);
            continue;
          }
          
          // Check if target exists and overwrite is disabled
          if (!options.overwrite && existsSync(targetFilePath) && !options.dryRun) {
            result.skippedFiles.push(relativeFilePath);
            this.logger.debug(`Skipped existing file: ${relativeFilePath}`);
            continue;
          }
          
          // Process file
          if (engine.shouldProcess(sourceFilePath)) {
            // Read, render, and write template file
            const content = await readFile(sourceFilePath, 'utf8');
            const renderedContent = await engine.render(content, context);
            
            if (!options.dryRun) {
              await ensureDirectory(dirname(targetFilePath));
              await writeFile(targetFilePath, renderedContent, 'utf8');
            }
            
            result.generatedFiles.push(relativeFilePath);
            this.logger.debug(`Processed template file: ${relativeFilePath}`);
          } else {
            // Copy binary file as-is
            if (!options.dryRun) {
              await ensureDirectory(dirname(targetFilePath));
              await copyFile(sourceFilePath, targetFilePath, { overwrite: options.overwrite });
            }
            
            result.generatedFiles.push(relativeFilePath);
            this.logger.debug(`Copied binary file: ${relativeFilePath}`);
          }
        } catch (error) {
          result.errors.push({
            file: relativeFilePath,
            error: (error as Error).message,
          });
          this.logger.error(`Error processing file ${relativeFilePath}:`, error);
        }
      }
      
      result.duration = Date.now() - startTime;
      
      // Run post-processing scripts
      if (template.config.postProcess && !options.dryRun) {
        await this.runPostProcessing(template.config.postProcess, outputDir);
      }
      
      this.emit('templateRendered', {
        templateName,
        outputDir,
        result,
      });
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
  
  /**
   * Create a new template from a directory
   */
  async createTemplate(
    sourceDir: string,
    templateName: string,
    config: Partial<TemplateConfig>
  ): Promise<Result<ProjectTemplate>> {
    try {
      this.logger.info(`Creating template '${templateName}' from '${sourceDir}'`);
      
      // Validate source directory
      if (!(await isDirectory(sourceDir))) {
        return {
          success: false,
          error: new Error(`Source directory '${sourceDir}' does not exist`),
        };
      }
      
      // Create template directory
      const templateDir = join(this.templatesDir, templateName);
      await ensureDirectory(templateDir);
      
      // Copy source files to template directory
      const files = await findFiles(sourceDir, '**/*', { recursive: true });
      const relativeFiles: string[] = [];
      
      for (const file of files) {
        const relativePath = file.replace(sourceDir, '').replace(/^[\\/]/, '');
        const targetPath = join(templateDir, relativePath);
        
        await ensureDirectory(dirname(targetPath));
        await copyFile(file, targetPath, { overwrite: true });
        
        relativeFiles.push(relativePath);
      }
      
      // Create template configuration
      const templateConfig: TemplateConfig = {
        name: templateName,
        version: '1.0.0',
        description: config.description || `Template created from ${sourceDir}`,
        author: config.author,
        license: config.license,
        tags: config.tags || [],
        variables: config.variables || [],
        ignore: config.ignore || ['node_modules/**', '.git/**', '**/*.log'],
        include: config.include || ['**/*'],
        engine: config.engine || 'simple',
        engineConfig: config.engineConfig || {},
        postProcess: config.postProcess || [],
        dependencies: config.dependencies,
      };
      
      // Save template configuration
      const configPath = join(templateDir, 'template.json');
      await writeFile(configPath, JSON.stringify(templateConfig, null, 2));
      
      // Create template object
      const template: ProjectTemplate = {
        config: templateConfig,
        path: templateDir,
        files: relativeFiles,
        size: 0, // Would calculate actual size
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      
      // Add to templates cache
      this.templates.set(templateName, template);
      
      this.emit('templateCreated', { templateName, template });
      
      return {
        success: true,
        data: template,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
  
  /**
   * Load templates from the templates directory
   */
  private async loadTemplates(): Promise<void> {
    try {
      if (!existsSync(this.templatesDir)) {
        return;
      }
      
      const entries = await readdir(this.templatesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const templateDir = join(this.templatesDir, entry.name);
          const configPath = join(templateDir, 'template.json');
          
          if (existsSync(configPath)) {
            try {
              const configData = await readFile(configPath, 'utf8');
              const config = JSON.parse(configData) as TemplateConfig;
              
              // Get template files
              const files = await findFiles(templateDir, '**/*', { recursive: true });
              const relativeFiles = files
                .map(file => file.replace(templateDir, '').replace(/^[\\/]/, ''))
                .filter(file => file !== 'template.json');
              
              // Get directory stats
              const stats = await stat(templateDir);
              
              const template: ProjectTemplate = {
                config,
                path: templateDir,
                files: relativeFiles,
                size: 0, // Would calculate actual size
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
              };
              
              this.templates.set(config.name, template);
              this.logger.debug(`Loaded template: ${config.name}`);
            } catch (error) {
              this.logger.warn(`Failed to load template from ${templateDir}:`, error);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to load templates:', error);
    }
  }
  
  /**
   * Validate template variables
   */
  private async validateVariables(
    templateVars: TemplateVariable[],
    providedVars: Record<string, any>
  ): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    
    for (const templateVar of templateVars) {
      const value = providedVars[templateVar.name];
      
      // Check required variables
      if (templateVar.required && (value === undefined || value === null)) {
        errors.push({
          message: `Required variable '${templateVar.name}' is missing`,
          code: 'MISSING_REQUIRED_VARIABLE',
          path: templateVar.name,
          expected: templateVar.type,
          actual: 'undefined',
        });
        continue;
      }
      
      // Skip validation if variable is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }
      
      // Validate variable type and constraints
      const validation = this.validateVariable(templateVar, value);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  /**
   * Validate a single template variable
   */
  private validateVariable(templateVar: TemplateVariable, value: any): ValidationResult {
    switch (templateVar.type) {
      case 'string':
        return validateString(value, {
          fieldName: templateVar.name,
          pattern: templateVar.pattern ? new RegExp(templateVar.pattern) : undefined,
        });
      
      case 'number':
        if (typeof value !== 'number') {
          return {
            valid: false,
            errors: [{
              message: `Variable '${templateVar.name}' must be a number`,
              code: 'INVALID_TYPE',
              path: templateVar.name,
              expected: 'number',
              actual: typeof value,
            }],
            warnings: [],
          };
        }
        break;
      
      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            valid: false,
            errors: [{
              message: `Variable '${templateVar.name}' must be a boolean`,
              code: 'INVALID_TYPE',
              path: templateVar.name,
              expected: 'boolean',
              actual: typeof value,
            }],
            warnings: [],
          };
        }
        break;
      
      case 'array':
        if (!Array.isArray(value)) {
          return {
            valid: false,
            errors: [{
              message: `Variable '${templateVar.name}' must be an array`,
              code: 'INVALID_TYPE',
              path: templateVar.name,
              expected: 'array',
              actual: typeof value,
            }],
            warnings: [],
          };
        }
        break;
      
      case 'object':
        return validateObject(value, {
          fieldName: templateVar.name,
          allowNull: false,
        });
    }
    
    // Check allowed values
    if (templateVar.allowedValues && !templateVar.allowedValues.includes(value)) {
      return {
        valid: false,
        errors: [{
          message: `Variable '${templateVar.name}' must be one of: ${templateVar.allowedValues.join(', ')}`,
          code: 'INVALID_VALUE',
          path: templateVar.name,
          expected: templateVar.allowedValues.join(' | '),
          actual: value,
        }],
        warnings: [],
      };
    }
    
    return { valid: true, errors: [], warnings: [] };
  }
  
  /**
   * Check if a file should be skipped during template processing
   */
  private shouldSkipFile(filePath: string, config: TemplateConfig): boolean {
    // Check ignore patterns
    if (config.ignore) {
      for (const pattern of config.ignore) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        if (regex.test(filePath)) {
          return true;
        }
      }
    }
    
    // Check include patterns
    if (config.include) {
      let included = false;
      for (const pattern of config.include) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        if (regex.test(filePath)) {
          included = true;
          break;
        }
      }
      if (!included) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Run post-processing scripts
   */
  private async runPostProcessing(scripts: string[], outputDir: string): Promise<void> {
    for (const script of scripts) {
      try {
        this.logger.info(`Running post-processing script: ${script}`);
        
        const { spawn } = await import('child_process');
        const process = spawn('sh', ['-c', script], {
          cwd: outputDir,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        
        process.stdout?.on('data', (data) => {
          this.logger.debug(`Script output: ${data.toString().trim()}`);
        });
        
        process.stderr?.on('data', (data) => {
          this.logger.warn(`Script error: ${data.toString().trim()}`);
        });
        
        await new Promise<void>((resolve, reject) => {
          process.on('exit', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Post-processing script failed with code ${code}`));
            }
          });
        });
      } catch (error) {
        this.logger.error(`Post-processing script failed: ${script}`, error);
        throw error;
      }
    }
  }
}
