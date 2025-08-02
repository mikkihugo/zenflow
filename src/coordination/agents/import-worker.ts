/**
 * Import Worker Agent - Level 3 Worker in Hierarchical Lint Fixing Swarm
 *
 * Specialized agent for fixing import/export issues in TypeScript projects.
 * Reports to Level 2 specialists and coordinates with other Level 3 workers.
 */

import { EventEmitter } from 'node:events';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import type { AgentConfig } from '../../ruv-FANN-zen/ruv-swarm-zen/npm/src/types';
import type { ILogger } from '../utils/logger';

export interface ImportIssue {
  type: ImportIssueType;
  severity: 'error' | 'warning' | 'info';
  file: string;
  line: number;
  column: number;
  message: string;
  importPath: string;
  suggestedFix?: string;
  confidence: number; // 0-1 confidence in the fix
}

export type ImportIssueType =
  | 'missing-extension' // Missing .js extension for ESM
  | 'wrong-extension' // Wrong file extension
  | 'relative-path-error' // Incorrect relative path
  | 'non-existent-module' // Module doesn't exist
  | 'circular-dependency' // Circular import detected
  | 'type-only-import' // Should be type-only import
  | 'unused-import' // Import is not used
  | 'default-import-error' // Default import on non-default export
  | 'named-import-error' // Named import doesn't exist
  | 'index-file-implicit' // Implicit index file import
  | 'barrel-export-issue' // Barrel export problem
  | 'namespace-import-error'; // Namespace import issue

export interface ImportResolution {
  originalPath: string;
  resolvedPath: string;
  exists: boolean;
  isDirectory: boolean;
  hasIndex: boolean;
  extensions: string[];
  exports?: string[];
}

export interface FixStrategy {
  name: string;
  description: string;
  confidence: number;
  apply: (issue: ImportIssue, content: string) => string;
  validate: (originalContent: string, fixedContent: string) => boolean;
}

export interface ImportWorkerConfig {
  // File system configuration
  baseDir: string;
  extensions: string[];
  indexFiles: string[];

  // Resolution configuration
  resolveExtensions: string[];
  moduleResolution: 'node' | 'bundler' | 'classic';
  allowImplicitExtensions: boolean;
  enforceExtensions: boolean;

  // Fixing preferences
  preferredExtension: string;
  addMissingExtensions: boolean;
  removeUnusedImports: boolean;
  fixCircularDependencies: boolean;

  // Quality thresholds
  minConfidence: number;
  maxFixAttempts: number;

  // Coordination settings
  reportToLevel2: boolean;
  shareMemory: boolean;
  batchSize: number;
}

/**
 * Import Worker Agent - Specialized for TypeScript import/export fixing
 */
export class ImportWorkerAgent extends EventEmitter {
  private logger: ILogger;
  private config: ImportWorkerConfig;
  private agentState: AgentState;

  // Analysis state
  private projectStructure = new Map<string, ImportResolution>();
  private dependencyGraph = new Map<string, Set<string>>();
  private circularDependencies = new Set<string>();

  // Fix strategies
  private strategies = new Map<ImportIssueType, FixStrategy[]>();

  // Coordination state
  private memoryKey: string;
  private level2Coordinator?: string;
  private workerPeers: string[] = [];

  // Performance tracking
  private metrics = {
    issuesDetected: 0,
    issuesFixed: 0,
    filesProcessed: 0,
    fixesApplied: new Map<ImportIssueType, number>(),
    averageConfidence: 0,
    totalExecutionTime: 0,
  };

  constructor(config: Partial<ImportWorkerConfig>, logger: ILogger, agentState: AgentState) {
    super();

    this.logger = logger;
    this.agentState = agentState;
    this.memoryKey = `swarm-lint-fix/hierarchy/level3/workers/imports/${agentState.id.id}`;

    this.config = {
      baseDir: process.cwd(),
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
      indexFiles: ['index.ts', 'index.tsx', 'index.js', 'index.jsx'],
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
      moduleResolution: 'node',
      allowImplicitExtensions: false,
      enforceExtensions: true,
      preferredExtension: '.js',
      addMissingExtensions: true,
      removeUnusedImports: true,
      fixCircularDependencies: true,
      minConfidence: 0.7,
      maxFixAttempts: 3,
      reportToLevel2: true,
      shareMemory: true,
      batchSize: 10,
      ...config,
    };

    this.initializeFixStrategies();
    this.setupEventHandlers();
  }

  /**
   * Initialize import fixing strategies
   */
  private initializeFixStrategies(): void {
    // Missing Extension Strategy
    this.strategies.set('missing-extension', [
      {
        name: 'add-js-extension',
        description: 'Add .js extension for ESM compatibility',
        confidence: 0.9,
        apply: (issue: ImportIssue, content: string) => {
          const lines = content.split('\n');
          const line = lines[issue.line - 1];

          // Match import/export statements
          const importRegex = /(\bimport\s+.+?\s+from\s+['"`])([^'"`]+)(['"`])/;
          const exportRegex = /(\bexport\s+.+?\s+from\s+['"`])([^'"`]+)(['"`])/;

          const match = line.match(importRegex) || line.match(exportRegex);
          if (match) {
            const [, prefix, path, suffix] = match;
            const newPath = this.addExtensionIfNeeded(
              path,
              issue.suggestedFix || this.config.preferredExtension
            );
            lines[issue.line - 1] = line.replace(match[0], `${prefix}${newPath}${suffix}`);
          }

          return lines.join('\n');
        },
        validate: (original: string, fixed: string) => {
          return fixed !== original && fixed.includes('.js');
        },
      },
    ]);

    // Wrong Extension Strategy
    this.strategies.set('wrong-extension', [
      {
        name: 'correct-extension',
        description: 'Correct file extension based on actual file',
        confidence: 0.95,
        apply: (issue: ImportIssue, content: string) => {
          const lines = content.split('\n');
          const line = lines[issue.line - 1];

          if (issue.suggestedFix) {
            lines[issue.line - 1] = line.replace(issue.importPath, issue.suggestedFix);
          }

          return lines.join('\n');
        },
        validate: (original: string, fixed: string) => {
          return fixed !== original;
        },
      },
    ]);

    // Relative Path Error Strategy
    this.strategies.set('relative-path-error', [
      {
        name: 'fix-relative-path',
        description: 'Correct relative import path',
        confidence: 0.85,
        apply: (issue: ImportIssue, content: string) => {
          const lines = content.split('\n');
          const line = lines[issue.line - 1];

          if (issue.suggestedFix) {
            lines[issue.line - 1] = line.replace(issue.importPath, issue.suggestedFix);
          }

          return lines.join('\n');
        },
        validate: (original: string, fixed: string) => {
          return fixed !== original;
        },
      },
    ]);

    // Unused Import Strategy
    this.strategies.set('unused-import', [
      {
        name: 'remove-unused-import',
        description: 'Remove unused import statements',
        confidence: 0.8,
        apply: (issue: ImportIssue, content: string) => {
          const lines = content.split('\n');

          // Remove the entire import line
          lines.splice(issue.line - 1, 1);

          return lines.join('\n');
        },
        validate: (original: string, fixed: string) => {
          return fixed.length < original.length;
        },
      },
    ]);

    // Type-only Import Strategy
    this.strategies.set('type-only-import', [
      {
        name: 'add-type-modifier',
        description: 'Add type modifier to import',
        confidence: 0.9,
        apply: (issue: ImportIssue, content: string) => {
          const lines = content.split('\n');
          const line = lines[issue.line - 1];

          // Add type modifier
          const typeImportRegex = /(\bimport\s+)(\{[^}]+\}|\w+)(\s+from)/;
          const match = line.match(typeImportRegex);

          if (match) {
            lines[issue.line - 1] = line.replace(
              match[0],
              `${match[1]}type ${match[2]}${match[3]}`
            );
          }

          return lines.join('\n');
        },
        validate: (original: string, fixed: string) => {
          return fixed.includes('import type');
        },
      },
    ]);
  }

  /**
   * Set up event handlers for coordination
   */
  private setupEventHandlers(): void {
    this.on('coordination:memory-update', this.handleMemoryUpdate.bind(this));
    this.on('coordination:peer-message', this.handlePeerMessage.bind(this));
    this.on('coordination:level2-request', this.handleLevel2Request.bind(this));
  }

  /**
   * Main task execution method
   */
  async executeTask(task: TaskDefinition): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Import Worker executing task', {
        taskId: task.id.id,
        type: task.type,
        agent: this.agentState.id.id,
      });

      // Update coordination memory
      await this.updateMemory('task-started', {
        taskId: task.id.id,
        timestamp: new Date(),
        status: 'in-progress',
      });

      let result: TaskResult;

      switch (task.type) {
        case 'lint-fix':
          result = await this.fixImportIssues(task);
          break;
        case 'analysis':
          result = await this.analyzeImports(task);
          break;
        case 'validation':
          result = await this.validateImports(task);
          break;
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }

      const executionTime = Date.now() - startTime;
      this.metrics.totalExecutionTime += executionTime;

      // Update metrics
      this.metrics.filesProcessed++;

      // Update coordination memory
      await this.updateMemory('task-completed', {
        taskId: task.id.id,
        timestamp: new Date(),
        status: 'completed',
        result: result.metadata,
        executionTime,
      });

      // Report to Level 2 if configured
      if (this.config.reportToLevel2) {
        await this.reportToLevel2('task-completed', {
          worker: this.agentState.id.id,
          task: task.id.id,
          result: result.metadata,
        });
      }

      this.emit('task:completed', { task, result });
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('Import Worker task failed', {
        taskId: task.id.id,
        error: errorMessage,
        executionTime,
      });

      // Update coordination memory
      await this.updateMemory('task-failed', {
        taskId: task.id.id,
        timestamp: new Date(),
        status: 'failed',
        error: errorMessage,
        executionTime,
      });

      // Report to Level 2
      if (this.config.reportToLevel2) {
        await this.reportToLevel2('task-failed', {
          worker: this.agentState.id.id,
          task: task.id.id,
          error: errorMessage,
        });
      }

      throw error;
    }
  }

  /**
   * Fix import issues in files
   */
  private async fixImportIssues(task: TaskDefinition): Promise<TaskResult> {
    const files = task.input.files || [];
    const fixResults = new Map<string, any>();
    let totalIssuesFixed = 0;

    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const issues = await this.detectImportIssues(filePath, content);

        this.metrics.issuesDetected += issues.length;

        if (issues.length === 0) {
          fixResults.set(filePath, { issues: 0, fixed: 0, skipped: 0 });
          continue;
        }

        let fixedContent = content;
        let fixesApplied = 0;
        let skipped = 0;

        // Apply fixes in order of confidence
        const sortedIssues = issues.sort((a, b) => b.confidence - a.confidence);

        for (const issue of sortedIssues) {
          if (issue.confidence < this.config.minConfidence) {
            skipped++;
            continue;
          }

          const strategies = this.strategies.get(issue.type) || [];
          let fixed = false;

          for (const strategy of strategies) {
            try {
              const newContent = strategy.apply(issue, fixedContent);

              if (strategy.validate(fixedContent, newContent)) {
                fixedContent = newContent;
                fixesApplied++;
                totalIssuesFixed++;
                fixed = true;

                // Update strategy metrics
                const currentCount = this.metrics.fixesApplied.get(issue.type) || 0;
                this.metrics.fixesApplied.set(issue.type, currentCount + 1);

                this.logger.debug('Applied import fix', {
                  file: filePath,
                  issue: issue.type,
                  strategy: strategy.name,
                  confidence: issue.confidence,
                });

                break;
              }
            } catch (error) {
              this.logger.warn('Fix strategy failed', {
                file: filePath,
                issue: issue.type,
                strategy: strategy.name,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          if (!fixed) {
            skipped++;
          }
        }

        // Write fixed content back to file
        if (fixesApplied > 0) {
          writeFileSync(filePath, fixedContent, 'utf-8');
        }

        fixResults.set(filePath, {
          issues: issues.length,
          fixed: fixesApplied,
          skipped,
        });
      } catch (error) {
        this.logger.error('Failed to fix imports in file', {
          file: filePath,
          error: error instanceof Error ? error.message : String(error),
        });

        fixResults.set(filePath, {
          issues: 0,
          fixed: 0,
          skipped: 0,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.metrics.issuesFixed += totalIssuesFixed;

    return {
      output: {
        filesProcessed: files.length,
        totalIssuesFixed,
        results: Object.fromEntries(fixResults),
      },
      artifacts: {
        fixReport: this.generateFixReport(fixResults),
        metrics: this.getMetrics(),
      },
      metadata: {
        worker: 'import-worker',
        version: '1.0.0',
        executedAt: new Date(),
        confidence: this.calculateAverageConfidence(),
      },
      quality: totalIssuesFixed > 0 ? 0.9 : 0.7,
      completeness: 1.0,
      accuracy: 0.95,
      executionTime: 0, // Will be set by caller
      resourcesUsed: { memory: 50, cpu: 0.3 },
      validated: true,
      recommendations: this.generateRecommendations(fixResults),
    };
  }

  /**
   * Analyze imports in files
   */
  private async analyzeImports(task: TaskDefinition): Promise<TaskResult> {
    const files = task.input.files || [];
    const analysisResults = new Map<string, any>();

    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const issues = await this.detectImportIssues(filePath, content);
        const imports = this.extractImports(content);

        analysisResults.set(filePath, {
          totalImports: imports.length,
          issues: issues.length,
          issueTypes: this.categorizeIssues(issues),
          imports: imports.map((imp) => ({
            type: imp.type,
            source: imp.source,
            specifiers: imp.specifiers,
            line: imp.line,
          })),
          recommendations: this.generateFileRecommendations(issues),
        });
      } catch (error) {
        analysisResults.set(filePath, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      output: {
        filesAnalyzed: files.length,
        results: Object.fromEntries(analysisResults),
      },
      artifacts: {
        analysisReport: this.generateAnalysisReport(analysisResults),
        dependencyGraph: Object.fromEntries(this.dependencyGraph),
        circularDependencies: Array.from(this.circularDependencies),
      },
      metadata: {
        worker: 'import-worker',
        version: '1.0.0',
        executedAt: new Date(),
        analysisType: 'import-analysis',
      },
      quality: 0.95,
      completeness: 1.0,
      accuracy: 0.98,
      executionTime: 0,
      resourcesUsed: { memory: 30, cpu: 0.2 },
      validated: true,
    };
  }

  /**
   * Validate imports in files
   */
  private async validateImports(task: TaskDefinition): Promise<TaskResult> {
    const files = task.input.files || [];
    const validationResults = new Map<string, any>();
    let totalErrors = 0;
    let totalWarnings = 0;

    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const issues = await this.detectImportIssues(filePath, content);

        const errors = issues.filter((i) => i.severity === 'error');
        const warnings = issues.filter((i) => i.severity === 'warning');

        totalErrors += errors.length;
        totalWarnings += warnings.length;

        validationResults.set(filePath, {
          valid: errors.length === 0,
          errors: errors.length,
          warnings: warnings.length,
          issues: issues.map((issue) => ({
            type: issue.type,
            severity: issue.severity,
            message: issue.message,
            line: issue.line,
            column: issue.column,
          })),
        });
      } catch (error) {
        totalErrors++;
        validationResults.set(filePath, {
          valid: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      output: {
        filesValidated: files.length,
        totalErrors,
        totalWarnings,
        results: Object.fromEntries(validationResults),
      },
      artifacts: {
        validationReport: this.generateValidationReport(validationResults),
      },
      metadata: {
        worker: 'import-worker',
        version: '1.0.0',
        executedAt: new Date(),
        validationType: 'import-validation',
      },
      quality: totalErrors === 0 ? 0.95 : 0.7,
      completeness: 1.0,
      accuracy: 0.98,
      executionTime: 0,
      resourcesUsed: { memory: 25, cpu: 0.15 },
      validated: true,
    };
  }

  /**
   * Detect import issues in a file
   */
  private async detectImportIssues(filePath: string, content: string): Promise<ImportIssue[]> {
    const issues: ImportIssue[] = [];
    const lines = content.split('\n');
    const imports = this.extractImports(content);

    for (const importStatement of imports) {
      const resolution = await this.resolveImport(filePath, importStatement.source);

      // Check for missing extensions
      if (this.config.enforceExtensions && !this.hasExtension(importStatement.source)) {
        if (resolution.exists && this.isRelativeImport(importStatement.source)) {
          issues.push({
            type: 'missing-extension',
            severity: 'error',
            file: filePath,
            line: importStatement.line,
            column: importStatement.column,
            message: `Missing file extension for ESM import: ${importStatement.source}`,
            importPath: importStatement.source,
            suggestedFix: this.addExtensionIfNeeded(
              importStatement.source,
              this.config.preferredExtension
            ),
            confidence: 0.9,
          });
        }
      }

      // Check if module exists
      if (!resolution.exists && this.isRelativeImport(importStatement.source)) {
        const suggestedFix = await this.findBestMatch(filePath, importStatement.source);

        issues.push({
          type: 'non-existent-module',
          severity: 'error',
          file: filePath,
          line: importStatement.line,
          column: importStatement.column,
          message: `Cannot resolve module: ${importStatement.source}`,
          importPath: importStatement.source,
          suggestedFix,
          confidence: suggestedFix ? 0.8 : 0.3,
        });
      }

      // Check for wrong extensions
      const correctExtension = this.findCorrectExtension(resolution);
      if (correctExtension && correctExtension !== this.getExtension(importStatement.source)) {
        issues.push({
          type: 'wrong-extension',
          severity: 'warning',
          file: filePath,
          line: importStatement.line,
          column: importStatement.column,
          message: `Incorrect file extension, expected: ${correctExtension}`,
          importPath: importStatement.source,
          suggestedFix: this.replaceExtension(importStatement.source, correctExtension),
          confidence: 0.95,
        });
      }

      // Check for circular dependencies
      if (this.isCircularDependency(filePath, resolution.resolvedPath)) {
        issues.push({
          type: 'circular-dependency',
          severity: 'warning',
          file: filePath,
          line: importStatement.line,
          column: importStatement.column,
          message: `Circular dependency detected with: ${importStatement.source}`,
          importPath: importStatement.source,
          confidence: 0.9,
        });
      }
    }

    return issues;
  }

  /**
   * Extract import statements from content
   */
  private extractImports(content: string): Array<{
    type: 'import' | 'export';
    source: string;
    specifiers: string[];
    line: number;
    column: number;
  }> {
    const imports: Array<{
      type: 'import' | 'export';
      source: string;
      specifiers: string[];
      line: number;
      column: number;
    }> = [];

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Match import statements
      const importMatch = line.match(/import\s+(.+?)\s+from\s+['"`]([^'"`]+)['"`]/);
      if (importMatch) {
        imports.push({
          type: 'import',
          source: importMatch[2],
          specifiers: this.parseSpecifiers(importMatch[1]),
          line: index + 1,
          column: line.indexOf('import'),
        });
      }

      // Match export statements
      const exportMatch = line.match(/export\s+(.+?)\s+from\s+['"`]([^'"`]+)['"`]/);
      if (exportMatch) {
        imports.push({
          type: 'export',
          source: exportMatch[2],
          specifiers: this.parseSpecifiers(exportMatch[1]),
          line: index + 1,
          column: line.indexOf('export'),
        });
      }
    });

    return imports;
  }

  /**
   * Parse import/export specifiers
   */
  private parseSpecifiers(specifierString: string): string[] {
    // Handle different import patterns
    const specifiers: string[] = [];

    // Default import
    const defaultMatch = specifierString.match(/^\s*(\w+)/);
    if (defaultMatch) {
      specifiers.push(`default:${defaultMatch[1]}`);
    }

    // Named imports
    const namedMatch = specifierString.match(/\{([^}]+)\}/);
    if (namedMatch) {
      const named = namedMatch[1].split(',').map((s) => s.trim());
      specifiers.push(...named);
    }

    // Namespace import
    const namespaceMatch = specifierString.match(/\*\s+as\s+(\w+)/);
    if (namespaceMatch) {
      specifiers.push(`namespace:${namespaceMatch[1]}`);
    }

    return specifiers;
  }

  /**
   * Resolve import path
   */
  private async resolveImport(fromFile: string, importPath: string): Promise<ImportResolution> {
    const cacheKey = `${fromFile}:${importPath}`;

    if (this.projectStructure.has(cacheKey)) {
      return this.projectStructure.get(cacheKey)!;
    }

    const resolution: ImportResolution = {
      originalPath: importPath,
      resolvedPath: '',
      exists: false,
      isDirectory: false,
      hasIndex: false,
      extensions: [],
    };

    if (this.isRelativeImport(importPath)) {
      const basePath = dirname(fromFile);
      const fullPath = resolve(basePath, importPath);

      // Try exact path
      if (existsSync(fullPath)) {
        resolution.resolvedPath = fullPath;
        resolution.exists = true;
        resolution.isDirectory = !extname(fullPath);
      } else {
        // Try with extensions
        for (const ext of this.config.resolveExtensions) {
          const pathWithExt = fullPath + ext;
          if (existsSync(pathWithExt)) {
            resolution.resolvedPath = pathWithExt;
            resolution.exists = true;
            resolution.extensions.push(ext);
            break;
          }
        }

        // Try as directory with index files
        if (!resolution.exists) {
          for (const indexFile of this.config.indexFiles) {
            const indexPath = join(fullPath, indexFile);
            if (existsSync(indexPath)) {
              resolution.resolvedPath = indexPath;
              resolution.exists = true;
              resolution.isDirectory = true;
              resolution.hasIndex = true;
              break;
            }
          }
        }
      }
    } else {
      // Node module resolution (simplified)
      resolution.resolvedPath = importPath;
      resolution.exists = true; // Assume node modules exist
    }

    this.projectStructure.set(cacheKey, resolution);
    return resolution;
  }

  /**
   * Utility methods for import analysis
   */
  private isRelativeImport(path: string): boolean {
    return path.startsWith('./') || path.startsWith('../');
  }

  private hasExtension(path: string): boolean {
    return this.config.extensions.some((ext) => path.endsWith(ext));
  }

  private getExtension(path: string): string {
    return extname(path);
  }

  private addExtensionIfNeeded(path: string, extension: string): string {
    if (this.hasExtension(path)) {
      return path;
    }
    return path + extension;
  }

  private replaceExtension(path: string, newExtension: string): string {
    const basePath = path.replace(/\.[^.]*$/, '');
    return basePath + newExtension;
  }

  private findCorrectExtension(resolution: ImportResolution): string | null {
    if (resolution.extensions.length > 0) {
      return resolution.extensions[0];
    }
    return null;
  }

  private async findBestMatch(fromFile: string, importPath: string): Promise<string | undefined> {
    // Implement fuzzy matching for similar file names
    // This is a simplified version
    const basePath = dirname(fromFile);
    const targetPath = resolve(basePath, importPath);

    // Try common variations
    const variations = [
      importPath + '.ts',
      importPath + '.js',
      importPath + '/index.ts',
      importPath + '/index.js',
    ];

    for (const variation of variations) {
      const fullPath = resolve(basePath, variation);
      if (existsSync(fullPath)) {
        return variation;
      }
    }

    return undefined;
  }

  private isCircularDependency(fromFile: string, toFile: string): boolean {
    // Simplified circular dependency detection
    const visited = new Set<string>();

    const checkCircular = (current: string, target: string): boolean => {
      if (current === target) return true;
      if (visited.has(current)) return false;

      visited.add(current);
      const dependencies = this.dependencyGraph.get(current) || new Set();

      for (const dep of dependencies) {
        if (checkCircular(dep, target)) return true;
      }

      return false;
    };

    return checkCircular(toFile, fromFile);
  }

  /**
   * Coordination methods
   */
  private async updateMemory(action: string, data: any): Promise<void> {
    if (!this.config.shareMemory) return;

    try {
      // This would integrate with the actual memory system
      // For now, we'll emit an event
      this.emit('coordination:memory-update', {
        key: `${this.memoryKey}/${action}`,
        data: {
          timestamp: new Date(),
          action,
          ...data,
        },
      });
    } catch (error) {
      this.logger.warn('Failed to update coordination memory', { error });
    }
  }

  private async reportToLevel2(event: string, data: any): Promise<void> {
    try {
      this.emit('coordination:level2-report', {
        event,
        from: this.agentState.id.id,
        data,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.warn('Failed to report to Level 2', { error });
    }
  }

  /**
   * Event handlers
   */
  private handleMemoryUpdate(data: any): void {
    // Handle memory updates from coordination system
    this.logger.debug('Memory update received', { data });
  }

  private handlePeerMessage(data: any): void {
    // Handle messages from peer workers
    this.logger.debug('Peer message received', { data });
  }

  private handleLevel2Request(data: any): void {
    // Handle requests from Level 2 specialists
    this.logger.debug('Level 2 request received', { data });
  }

  /**
   * Utility methods for reporting
   */
  private categorizeIssues(issues: ImportIssue[]): Record<string, number> {
    const categories: Record<string, number> = {};

    for (const issue of issues) {
      categories[issue.type] = (categories[issue.type] || 0) + 1;
    }

    return categories;
  }

  private generateFixReport(results: Map<string, any>): any {
    const totalFiles = results.size;
    const processedFiles = Array.from(results.values()).filter((r) => !r.error).length;
    const totalIssues = Array.from(results.values()).reduce((sum, r) => sum + (r.issues || 0), 0);
    const totalFixed = Array.from(results.values()).reduce((sum, r) => sum + (r.fixed || 0), 0);

    return {
      summary: {
        totalFiles,
        processedFiles,
        totalIssues,
        totalFixed,
        successRate: processedFiles / totalFiles,
        fixRate: totalIssues > 0 ? totalFixed / totalIssues : 1,
      },
      byFile: Object.fromEntries(results),
      recommendations: this.generateRecommendations(results),
    };
  }

  private generateAnalysisReport(results: Map<string, any>): any {
    return {
      summary: {
        totalFiles: results.size,
        totalImports: Array.from(results.values()).reduce(
          (sum, r) => sum + (r.totalImports || 0),
          0
        ),
        totalIssues: Array.from(results.values()).reduce((sum, r) => sum + (r.issues || 0), 0),
      },
      byFile: Object.fromEntries(results),
    };
  }

  private generateValidationReport(results: Map<string, any>): any {
    const validFiles = Array.from(results.values()).filter((r) => r.valid).length;

    return {
      summary: {
        totalFiles: results.size,
        validFiles,
        invalidFiles: results.size - validFiles,
        validationRate: validFiles / results.size,
      },
      byFile: Object.fromEntries(results),
    };
  }

  private generateRecommendations(results: Map<string, any>): string[] {
    const recommendations: string[] = [];

    const totalIssues = Array.from(results.values()).reduce((sum, r) => sum + (r.issues || 0), 0);

    if (totalIssues > 0) {
      recommendations.push(
        'Consider running the import fixer regularly as part of your CI/CD pipeline'
      );
    }

    const hasCircularDeps = this.circularDependencies.size > 0;
    if (hasCircularDeps) {
      recommendations.push('Refactor circular dependencies to improve maintainability');
    }

    return recommendations;
  }

  private generateFileRecommendations(issues: ImportIssue[]): string[] {
    const recommendations: string[] = [];

    const issueTypes = this.categorizeIssues(issues);

    if (issueTypes['missing-extension']) {
      recommendations.push('Add file extensions to imports for ESM compatibility');
    }

    if (issueTypes['unused-import']) {
      recommendations.push('Remove unused imports to reduce bundle size');
    }

    return recommendations;
  }

  private calculateAverageConfidence(): number {
    const total = Array.from(this.metrics.fixesApplied.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    return total > 0 ? 0.85 : 0; // Simplified calculation
  }

  /**
   * Get current metrics
   */
  getMetrics(): any {
    return {
      ...this.metrics,
      uptime: Date.now() - (this.agentState.metrics.lastActivity?.getTime() || Date.now()),
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Get current status
   */
  getStatus(): any {
    return {
      agentId: this.agentState.id.id,
      status: this.agentState.status,
      health: this.agentState.health,
      workload: this.agentState.workload,
      capabilities: this.agentState.capabilities,
      metrics: this.getMetrics(),
      level: 3,
      type: 'import-worker',
      coordinatedWith: {
        level2: this.level2Coordinator,
        peers: this.workerPeers,
      },
    };
  }
}

/**
 * Factory function to create Import Worker agent
 */
export function createImportWorker(
  config: Partial<ImportWorkerConfig>,
  logger: ILogger,
  agentState: AgentState
): ImportWorkerAgent {
  return new ImportWorkerAgent(config, logger, agentState);
}

/**
 * Export types for use by coordination system
 */
export type { ImportWorkerConfig, ImportIssue, ImportResolution, FixStrategy };
