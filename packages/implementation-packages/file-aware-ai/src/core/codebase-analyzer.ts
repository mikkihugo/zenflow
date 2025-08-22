/**
 * @fileoverview Codebase Analyzer
 *
 * Analyzes codebase structure, creates indexes, and provides intelligent
 * file selection and context management for AI operations.
 */

import { promises as fs } from 'fs';
import { join, relative, extname, dirname, basename } from 'path';
import { createHash } from 'crypto';
import * as ts from 'typescript';
import glob from 'fast-glob';
import ignore from 'ignore';
import { getLogger } from '@claude-zen/foundation';
import type {
  CodebaseIndex,
  FileInfo,
  SymbolReference,
  FileDependency,
  FileAwareConfig,
  AnalyzedContext,
} from '../types/index.js';

const logger = getLogger('file-aware-ai:codebase-analyzer');

export class CodebaseAnalyzer {
  private index: CodebaseIndex'' | ''null = null;
  private gitignore: ReturnType<typeof ignore>'' | ''null = null;
  private readonly rootPath: string;
  private readonly config: FileAwareConfig;

  constructor(rootPath: string, config: FileAwareConfig) {
    this.rootPath = rootPath;
    this.config = config;
  }

  /**
   * Initialize the analyzer by creating the codebase index
   */
  async initialize(): Promise<void> {
    logger.info('Initializing codebase analyzer', { rootPath: this.rootPath });

    // Load .gitignore if it exists
    await this.loadGitignore();

    // Create initial index
    await this.buildIndex();

    // Set up file watching if enabled
    if (this.config.indexing.watchFiles) {
      await this.setupFileWatcher();
    }

    logger.info('Codebase analyzer initialized', {
      filesIndexed: this.index?.files.length'' | '''' | ''0,
      symbolsIndexed: this.index?.symbols.size'' | '''' | ''0,
    });
  }

  /**
   * Get relevant files and context for a given task
   */
  async getRelevantContext(
    task: string,
    focusFiles?: string[],
    maxFiles: number = 10
  ): Promise<AnalyzedContext> {
    if (!this.index) {
      throw new Error('Codebase analyzer not initialized');
    }

    logger.debug('Getting relevant context', { task, focusFiles, maxFiles });

    let relevantFiles: string[] = [];
    let dependencies: FileDependency[] = [];
    let symbols: SymbolReference[] = [];

    if (focusFiles && focusFiles.length > 0) {
      // Start with explicitly requested files
      relevantFiles = focusFiles.filter((file) =>
        this.index!.files.some((f) => f.path === file)
      );

      // Add dependencies of focus files
      for (const file of relevantFiles) {
        const fileDeps = this.getDependenciesForFile(file);
        dependencies.push(...fileDeps);

        // Add dependent files up to maxFiles limit
        for (const dep of fileDeps) {
          if (relevantFiles.length >= maxFiles) break;
          if (!relevantFiles.includes(dep.to)) {
            relevantFiles.push(dep.to);
          }
        }
      }
    } else {
      // Use semantic analysis to find relevant files
      relevantFiles = await this.findRelevantFiles(task, maxFiles);

      // Get dependencies for relevant files
      for (const file of relevantFiles) {
        const fileDeps = this.getDependenciesForFile(file);
        dependencies.push(...fileDeps);
      }
    }

    // Extract symbols from relevant files
    for (const file of relevantFiles) {
      const fileSymbols = this.getSymbolsForFile(file);
      symbols.push(...fileSymbols);
    }

    // Generate summary
    const summary = this.generateContextSummary(relevantFiles, task);

    // Assess complexity
    const complexity = this.assessComplexity(relevantFiles, dependencies);

    return {
      relevantFiles,
      dependencies,
      symbols,
      summary,
      complexity,
    };
  }

  /**
   * Build the codebase index
   */
  private async buildIndex(): Promise<void> {
    const files: FileInfo[] = [];
    const symbols = new Map<string, SymbolReference>();
    const dependencies: FileDependency[] = [];

    // Find all relevant files
    const patterns = this.config.indexing.supportedLanguages.map(
      (lang) => `**/*.${lang}`
    );
    const foundFiles = await glob(patterns, {
      cwd: this.rootPath,
      ignore: this.config.indexing.ignorePatterns,
      absolute: true,
    });

    logger.debug('Found files for indexing', { count: foundFiles.length });

    for (const filePath of foundFiles) {
      try {
        // Skip if file is too large
        const stats = await fs.stat(filePath);
        if (stats.size > this.config.indexing.maxFileSize) {
          logger.debug('Skipping large file', { filePath, size: stats.size });
          continue;
        }

        // Skip if ignored by gitignore
        const relativePath = relative(this.rootPath, filePath);
        if (this.gitignore && this.gitignore.ignores(relativePath)) {
          continue;
        }

        const fileInfo = await this.analyzeFile(filePath);
        if (fileInfo) {
          files.push(fileInfo);

          // Extract symbols and dependencies for TypeScript files
          if (
            fileInfo.language === 'ts''' | '''' | ''fileInfo.language ==='tsx''' | '''' | ''fileInfo.language ==='js''' | '''' | ''fileInfo.language ==='jsx'
          ) {
            const analysis = await this.analyzeTypeScriptFile(filePath);

            // Add symbols to index
            for (const symbol of analysis.symbols) {
              symbols.set(`${symbol.file}:${symbol.name}`, symbol);
            }

            // Add dependencies
            dependencies.push(...analysis.dependencies);
          }
        }
      } catch (error) {
        logger.warn('Error analyzing file', {
          filePath,
          error: (error as Error).message,
        });
      }
    }

    this.index = {
      files,
      symbols,
      dependencies,
      lastUpdated: new Date(),
      version: '1.0.0',
    };

    logger.info('Codebase index built', {
      files: files.length,
      symbols: symbols.size,
      dependencies: dependencies.length,
    });
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string): Promise<FileInfo'' | ''null> {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath,'utf8');
      const relativePath = relative(this.rootPath, filePath);
      const ext = extname(filePath).slice(1);

      // Create checksum
      const checksum = createHash('md5').update(content).digest('hex');

      return {
        path: relativePath,
        language: ext,
        size: stats.size,
        lastModified: stats.mtime,
        checksum,
        exports: [],
        imports: [],
        functions: [],
        classes: [],
        interfaces: [],
      };
    } catch (error) {
      logger.error('Error analyzing file', {
        filePath,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Analyze TypeScript/JavaScript file for symbols and dependencies
   */
  private async analyzeTypeScriptFile(filePath: string): Promise<{
    symbols: SymbolReference[];
    dependencies: FileDependency[];
  }> {
    const symbols: SymbolReference[] = [];
    const dependencies: FileDependency[] = [];
    const relativePath = relative(this.rootPath, filePath);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      // Extract symbols and dependencies
      const visit = (node: ts.Node) => {
        // Function declarations
        if (ts.isFunctionDeclaration(node) && node.name) {
          symbols.push({
            name: node.name.text,
            type: 'function',
            file: relativePath,
            line:
              sourceFile.getLineAndCharacterOfPosition(node.getStart()).line +
              1,
            column:
              sourceFile.getLineAndCharacterOfPosition(node.getStart())
                .character + 1,
            usages: [],
          });
        }

        // Class declarations
        if (ts.isClassDeclaration(node) && node.name) {
          symbols.push({
            name: node.name.text,
            type: 'class',
            file: relativePath,
            line:
              sourceFile.getLineAndCharacterOfPosition(node.getStart()).line +
              1,
            column:
              sourceFile.getLineAndCharacterOfPosition(node.getStart())
                .character + 1,
            usages: [],
          });
        }

        // Interface declarations
        if (ts.isInterfaceDeclaration(node)) {
          symbols.push({
            name: node.name.text,
            type: 'interface',
            file: relativePath,
            line:
              sourceFile.getLineAndCharacterOfPosition(node.getStart()).line +
              1,
            column:
              sourceFile.getLineAndCharacterOfPosition(node.getStart())
                .character + 1,
            usages: [],
          });
        }

        // Import declarations
        if (
          ts.isImportDeclaration(node) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        ) {
          const importPath = node.moduleSpecifier.text;
          const importedSymbols: string[] = [];

          if (node.importClause) {
            // Named imports
            if (
              node.importClause.namedBindings &&
              ts.isNamedImports(node.importClause.namedBindings)
            ) {
              for (const element of node.importClause.namedBindings.elements) {
                importedSymbols.push(element.name.text);
              }
            }
            // Default import
            if (node.importClause.name) {
              importedSymbols.push(node.importClause.name.text);
            }
          }

          dependencies.push({
            from: relativePath,
            to: importPath,
            type: 'import',
            symbols: importedSymbols,
          });
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
    } catch (error) {
      logger.warn('Error analyzing TypeScript file', {
        filePath,
        error: (error as Error).message,
      });
    }

    return { symbols, dependencies };
  }

  /**
   * Find files relevant to a given task using semantic analysis
   */
  private async findRelevantFiles(
    task: string,
    maxFiles: number
  ): Promise<string[]> {
    if (!this.index) return [];

    // Simple keyword-based relevance for now
    // TODO: Implement proper semantic search with embeddings
    const keywords = task.toLowerCase().split(/\s+/);
    const scored: Array<{ file: string; score: number }> = [];

    for (const fileInfo of this.index.files) {
      let score = 0;
      const filePath = fileInfo.path.toLowerCase();

      // Score based on filename matches
      for (const keyword of keywords) {
        if (filePath.includes(keyword)) {
          score += 10;
        }
      }

      // Score based on symbol matches
      const fileSymbols = this.getSymbolsForFile(fileInfo.path);
      for (const symbol of fileSymbols) {
        for (const keyword of keywords) {
          if (symbol.name.toLowerCase().includes(keyword)) {
            score += 5;
          }
        }
      }

      if (score > 0) {
        scored.push({ file: fileInfo.path, score });
      }
    }

    // Sort by score and return top files
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxFiles)
      .map((item) => item.file);
  }

  /**
   * Get dependencies for a specific file
   */
  private getDependenciesForFile(filePath: string): FileDependency[] {
    if (!this.index) return [];
    return this.index.dependencies.filter(
      (dep) => dep.from === filePath'' | '''' | ''dep.to === filePath
    );
  }

  /**
   * Get symbols for a specific file
   */
  private getSymbolsForFile(filePath: string): SymbolReference[] {
    if (!this.index) return [];
    return Array.from(this.index.symbols.values()).filter(
      (symbol) => symbol.file === filePath
    );
  }

  /**
   * Generate a context summary
   */
  private generateContextSummary(files: string[], task: string): string {
    const fileCount = files.length;
    const languages = [...new Set(files.map((f) => extname(f).slice(1)))];

    return (
      `Task: ${task}\n` +
      `Relevant files: ${fileCount}\n` +
      `Languages: ${languages.join(', ')}\n` +
      `Files: ${files.map((f) => basename(f)).join(', ')}`
    );
  }

  /**
   * Assess complexity of the context
   */
  private assessComplexity(
    files: string[],
    dependencies: FileDependency[]
  ): 'low | medium' | 'high' {
    if (files.length <= 3 && dependencies.length <= 5) return 'low';
    if (files.length <= 10 && dependencies.length <= 20) return 'medium';
    return 'high';
  }

  /**
   * Load .gitignore file
   */
  private async loadGitignore(): Promise<void> {
    try {
      const gitignorePath = join(this.rootPath, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf8');
      this.gitignore = ignore().add(content);
      logger.debug('Loaded .gitignore');
    } catch (error) {
      // .gitignore doesn't exist or can't be read - that's ok
      logger.debug('No .gitignore found or error reading it');
    }
  }

  /**
   * Set up file watching for real-time index updates
   */
  private async setupFileWatcher(): Promise<void> {
    // TODO: Implement file watching with chokidar
    // This would update the index when files change
    logger.debug('File watching not implemented yet');
  }
}
