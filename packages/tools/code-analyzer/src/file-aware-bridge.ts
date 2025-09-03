/**
 * @fileoverview File-Aware AI Bridge
 * 
 * Bridge between TypeScript code analysis and Rust AI engine
 * Recreates the lost singularity-coder functionality
 */

import { promises as fs } from 'fs';
import * as path from 'node:path';
import { Project, SourceFile } from 'ts-morph';
import { getLogger, Result, ok, err } from '@claude-zen/foundation';

const logger = getLogger('FileAwareBridge');

// Types that match the Rust side
export interface FileAwareRequest {
  task: string;
  files?: string[];
  context?: {
    maxFiles?: number;
    includeTests?: boolean;
    includeDocs?: boolean;
  };
  options?: {
    dryRun?: boolean;
    model?: string;
    maxTokens?: number;
  };
}

export interface AnalyzedContext {
  relevantFiles: string[];
  dependencies: FileDependency[];
  symbols: SymbolReference[];
  summary: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface FileDependency {
  from: string;
  to: string;
  dependencyType: 'import' | 'reference' | 'inheritance';
}

export interface SymbolReference {
  name: string;
  symbolType: 'function' | 'class' | 'interface' | 'variable' | 'type';
  file: string;
  line: number;
  column: number;
}

export class FileAwareBridge {
  private readonly project: Project;
  private readonly rootPath: string;
  private readonly excludePatterns: string[];

  constructor(rootPath: string, excludePatterns: string[] = []) {
    this.rootPath = rootPath;
    this.excludePatterns = [
      'node_modules/**',
      'dist/**',
      'build/**',
      'target/**',
      '.git/**',
      ...excludePatterns
    ];

    this.project = new Project({
      tsConfigFilePath: path.join(rootPath, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: false,
    });
  }

  /**
   * Analyze codebase context for AI processing
   */
  async analyzeContext(
    files: string[] = [],
    maxFiles: number = 50
  ): Promise<Result<AnalyzedContext, Error>> {
    try {
      logger.info('Analyzing codebase context', { files: files.length, maxFiles });

      // Step 1: Discover relevant files
      const relevantFiles = await this.findRelevantFiles(files, maxFiles);
      
      // Step 2: Analyze dependencies
      const dependencies = await this.analyzeDependencies(relevantFiles);
      
      // Step 3: Extract symbols
      const symbols = await this.extractSymbols(relevantFiles);
      
      // Step 4: Assess complexity
      const complexity = this.assessComplexity(relevantFiles, dependencies, symbols);
      
      // Step 5: Generate summary
      const summary = this.generateSummary(relevantFiles, dependencies, symbols, complexity);

      return ok({
        relevantFiles,
        dependencies,
        symbols,
        summary,
        complexity,
      });
    } catch (error) {
      logger.error('Failed to analyze context', { error });
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Find relevant files based on request
   */
  private async findRelevantFiles(requestedFiles: string[], maxFiles: number): Promise<string[]> {
    const files: string[] = [];

    if (requestedFiles.length > 0) {
      // Use explicitly requested files
      for (const file of requestedFiles) {
        const fullPath = path.resolve(this.rootPath, file);
        if (await fs.access(fullPath).then(() => true).catch(() => false)) {
          files.push(file);
        }
      }
    } else {
      // Auto-discover relevant files
      const sourceFiles = this.project.getSourceFiles();
      files.push(...sourceFiles
        .map(sf => path.relative(this.rootPath, sf.getFilePath()))
        .filter(file => !this.excludePatterns.some(pattern => 
          file.includes(pattern.replace('/**', ''))
        ))
        .slice(0, maxFiles)
      );
    }

    return files.slice(0, maxFiles);
  }

  /**
   * Analyze file dependencies
   */
  private async analyzeDependencies(files: string[]): Promise<FileDependency[]> {
    const dependencies: FileDependency[] = [];

    for (const file of files) {
      try {
        const sourceFile = this.project.getSourceFile(path.resolve(this.rootPath, file));
        if (!sourceFile) continue;

        // Analyze imports
        const imports = sourceFile.getImportDeclarations();
        for (const importDecl of imports) {
          const moduleSpecifier = importDecl.getModuleSpecifierValue();
          if (moduleSpecifier.startsWith('./') || moduleSpecifier.startsWith('../')) {
            dependencies.push({
              from: file,
              to: this.resolveRelativeImport(file, moduleSpecifier),
              dependencyType: 'import',
            });
          }
        }

        // Analyze class inheritance
        const classes = sourceFile.getClasses();
        for (const classDecl of classes) {
          const heritage = classDecl.getHeritageClauses();
          for (const clause of heritage) {
            dependencies.push({
              from: file,
              to: clause.getText(),
              dependencyType: 'inheritance',
            });
          }
        }
      } catch (error) {
        logger.warn('Failed to analyze dependencies for file', { file, error });
      }
    }

    return dependencies;
  }

  /**
   * Extract symbol references
   */
  private async extractSymbols(files: string[]): Promise<SymbolReference[]> {
    const symbols: SymbolReference[] = [];

    for (const file of files) {
      try {
        const sourceFile = this.project.getSourceFile(path.resolve(this.rootPath, file));
        if (!sourceFile) continue;

        // Extract functions
        const functions = sourceFile.getFunctions();
        for (const func of functions) {
          const pos = func.getStartLineNumber();
          symbols.push({
            name: func.getName() || 'anonymous',
            symbolType: 'function',
            file,
            line: pos,
            column: 1,
          });
        }

        // Extract classes
        const classes = sourceFile.getClasses();
        for (const classDecl of classes) {
          const pos = classDecl.getStartLineNumber();
          symbols.push({
            name: classDecl.getName() || 'anonymous',
            symbolType: 'class',
            file,
            line: pos,
            column: 1,
          });
        }

        // Extract interfaces
        const interfaces = sourceFile.getInterfaces();
        for (const interfaceDecl of interfaces) {
          const pos = interfaceDecl.getStartLineNumber();
          symbols.push({
            name: interfaceDecl.getName(),
            symbolType: 'interface',
            file,
            line: pos,
            column: 1,
          });
        }
      } catch (error) {
        logger.warn('Failed to extract symbols for file', { file, error });
      }
    }

    return symbols;
  }

  /**
   * Assess codebase complexity
   */
  private assessComplexity(
    files: string[],
    dependencies: FileDependency[],
    symbols: SymbolReference[]
  ): 'low' | 'medium' | 'high' {
    const fileCount = files.length;
    const dependencyCount = dependencies.length;
    const symbolCount = symbols.length;

    const complexityScore = fileCount * 0.3 + dependencyCount * 0.4 + symbolCount * 0.3;

    if (complexityScore < 20) return 'low';
    if (complexityScore < 100) return 'medium';
    return 'high';
  }

  /**
   * Generate context summary
   */
  private generateSummary(
    files: string[],
    dependencies: FileDependency[],
    symbols: SymbolReference[],
    complexity: 'low' | 'medium' | 'high'
  ): string {
    return `Analyzed ${files.length} files with ${dependencies.length} dependencies and ${symbols.length} symbols. ` +
           `Assessed complexity as ${complexity}. ` +
           `Primary file types: ${this.getFileTypesCount(files)}`;
  }

  /**
   * Get file types breakdown
   */
  private getFileTypesCount(files: string[]): string {
    const types: Record<string, number> = {};
    for (const file of files) {
      const ext = path.extname(file);
      types[ext] = (types[ext] || 0) + 1;
    }
    return Object.entries(types)
      .map(([ext, count]) => `${ext}(${count})`)
      .join(', ');
  }

  /**
   * Resolve relative import paths
   */
  private resolveRelativeImport(fromFile: string, importPath: string): string {
    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(fromDir, importPath);
    return path.relative(this.rootPath, resolved);
  }
}