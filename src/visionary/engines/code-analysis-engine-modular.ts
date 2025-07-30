/**
 * Code Analysis Engine - Modular Version
 *
 * Orchestrates code analysis using specialized components for AST parsing,
 * metrics calculation, and function/class extraction.
 *
 * @fileoverview Modular code analysis engine with focused components
 * @version 2.0.0
 */

import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { type ASTNode, ASTParser } from './code-analysis/ast-parser';
import { type FunctionData, FunctionExtractor } from './code-analysis/function-extractor';
import {
  type CodeMetrics,
  type ComplexityAnalysis,
  MetricsCalculator,
} from './code-analysis/metrics-calculator';

/**
 * Code file data structure
 */
export interface CodeFileData {
  content: string;
  path: string;
  language: string;
  size: number;
  lastModified: Date;
}

/**
 * Class analysis data
 */
export interface ClassData {
  name: string;
  extends?: string[];
  implements?: string[];
  lineNumber: number;
  methodCount: number;
  lineCount: number;
  file: string;
}

/**
 * Dependency analysis results
 */
export interface DependencyAnalysis {
  external: string[];
  internal: string[];
  totalCount: number;
  externalCount: number;
  internalCount: number;
}

/**
 * Complete code analysis results
 */
export interface CodeAnalysisResult {
  ast: ASTNode[];
  functions: FunctionData[];
  classes: ClassData[];
  complexity: ComplexityAnalysis;
  dependencies: DependencyAnalysis;
  metrics: CodeMetrics;
  aiInsights?: any;
  metadata: {
    filesAnalyzed: number;
    totalLinesProcessed: number;
    analysisTime: number;
    language: string;
  };
}

/**
 * Configuration for the code analysis engine
 */
export interface CodeAnalysisConfig {
  outputDir: string;
  enableAnalytics: boolean;
  supportedFormats: string[];
  neuralEngine?: any;
}

/**
 * Modular Code Analysis Engine
 *
 * Uses specialized components for different aspects of code analysis,
 * providing better maintainability and focused responsibilities.
 */
export class CodeAnalysisEngine {
  private readonly config: CodeAnalysisConfig;
  private readonly astParser: ASTParser;
  private readonly metricsCalculator: MetricsCalculator;
  private readonly functionExtractor: FunctionExtractor;

  private readonly supportedLanguages = new Set([
    'javascript',
    'typescript',
    'python',
    'java',
    'go',
    'rust',
    'cpp',
    'c',
    'php',
    'ruby',
  ]);

  /**
   * Initialize the Code Analysis Engine
   *
   * @param config - Configuration options
   */
  constructor(config: CodeAnalysisConfig) {
    this.config = config;
    this.astParser = new ASTParser();
    this.metricsCalculator = new MetricsCalculator();
    this.functionExtractor = new FunctionExtractor();
  }

  /**
   * Initialize the analysis engine
   */
  async initialize(): Promise<void> {
    console.warn('🔍 Code Analysis Engine (Modular) initialized');
  }

  /**
   * Analyze code files and return comprehensive analysis results
   *
   * @param codeData - Array of code file data
   * @returns Complete code analysis results
   */
  async analyzeCode(codeData: CodeFileData[]): Promise<CodeAnalysisResult> {
    const startTime = Date.now();
    let totalLines = 0;

    try {
      // Use specialized components for analysis
      const ast = await this.astParser.extractAST(codeData);
      const functions = await this.functionExtractor.extractFunctions(codeData);
      const classes = await this.extractClasses(codeData);
      const complexity = await this.metricsCalculator.calculateCodeComplexity(codeData);
      const dependencies = await this.analyzeDependencies(codeData);
      const metrics = await this.metricsCalculator.calculateMetrics(codeData);

      totalLines = metrics.totalLines;

      // Optional AI analysis
      let aiInsights;
      if (this.config.neuralEngine) {
        try {
          aiInsights = await this.performAIAnalysis(codeData, 'code-analysis');
        } catch (error) {
          console.warn('AI analysis unavailable:', error.message);
        }
      }

      const analysisTime = Date.now() - startTime;

      return {
        ast,
        functions,
        classes,
        complexity,
        dependencies,
        metrics,
        aiInsights,
        metadata: {
          filesAnalyzed: codeData.length,
          totalLinesProcessed: totalLines,
          analysisTime,
          language: codeData[0]?.language || 'unknown',
        },
      };
    } catch (error) {
      console.error('❌ Code analysis failed:', error);
      throw error;
    }
  }

  /**
   * Read and process code files from filesystem
   *
   * @param codeFiles - Array of file paths
   * @returns Processed code file data
   */
  async readCodeData(codeFiles: string[]): Promise<CodeFileData[]> {
    const codeData: CodeFileData[] = [];

    for (const filePath of codeFiles) {
      if (!existsSync(filePath)) {
        throw new Error(`Code file not found: ${filePath}`);
      }

      const content = await readFile(filePath, 'utf8');
      const stats = await stat(filePath);

      codeData.push({
        content,
        path: filePath,
        language: this.detectLanguage(filePath),
        size: stats.size,
        lastModified: stats.mtime,
      });
    }

    return codeData;
  }

  /**
   * Validate code inputs
   *
   * @param codeFiles - File paths to validate
   * @param language - Expected language
   */
  async validateCodeInputs(codeFiles: string[], language: string): Promise<void> {
    // Validate code files exist
    for (const filePath of codeFiles) {
      if (!existsSync(filePath)) {
        throw new Error(`Code file not found: ${filePath}`);
      }

      const extension = path.extname(filePath).toLowerCase().substring(1);
      if (!this.config.supportedFormats.includes(extension)) {
        throw new Error(`Unsupported code file format: ${extension}`);
      }
    }

    // Validate language is supported
    if (!this.supportedLanguages.has(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
  }

  /**
   * Extract classes from code files (simplified implementation)
   *
   * @param codeData - Code file data
   * @returns Class analysis data
   */
  private async extractClasses(codeData: CodeFileData[]): Promise<ClassData[]> {
    const classes: ClassData[] = [];

    for (const file of codeData) {
      const fileClasses = await this.extractFileClasses(file);
      classes.push(...fileClasses);
    }

    return classes;
  }

  /**
   * Extract classes from a single file
   *
   * @param file - Code file data
   * @returns Classes found in file
   */
  private async extractFileClasses(file: CodeFileData): Promise<ClassData[]> {
    const classes: ClassData[] = [];
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const classMatch = this.matchClass(line, file.language);

      if (classMatch) {
        const cls: ClassData = {
          name: classMatch.name,
          extends: classMatch.extends,
          implements: classMatch.implements,
          lineNumber: i + 1,
          methodCount: await this.countClassMethods(lines, i),
          lineCount: await this.countClassLines(lines, i),
          file: file.path,
        };
        classes.push(cls);
      }
    }

    return classes;
  }

  /**
   * Analyze code dependencies
   *
   * @param codeData - Code file data
   * @returns Dependency analysis results
   */
  private async analyzeDependencies(codeData: CodeFileData[]): Promise<DependencyAnalysis> {
    const dependencies = {
      external: new Set<string>(),
      internal: new Set<string>(),
    };

    for (const file of codeData) {
      const fileDeps = await this.extractFileDependencies(file);
      fileDeps.external.forEach((dep) => dependencies.external.add(dep));
      fileDeps.internal.forEach((dep) => dependencies.internal.add(dep));
    }

    const external = Array.from(dependencies.external);
    const internal = Array.from(dependencies.internal);

    return {
      external,
      internal,
      totalCount: external.length + internal.length,
      externalCount: external.length,
      internalCount: internal.length,
    };
  }

  // Helper methods

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust',
      '.cpp': 'cpp',
      '.c': 'c',
      '.php': 'php',
      '.rb': 'ruby',
    };
    return languageMap[extension] || 'unknown';
  }

  /**
   * Match class patterns in code
   */
  private matchClass(
    line: string,
    language: string
  ): {
    name: string;
    extends?: string[];
    implements?: string[];
  } | null {
    const patterns: Record<string, RegExp> = {
      javascript: /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/,
      python: /class\s+(\w+)(?:\(([^)]+)\))?/,
    };

    const pattern = patterns[language] || patterns.javascript;
    const match = line.match(pattern);

    if (match) {
      return {
        name: match[1],
        extends: match[2] ? [match[2]] : undefined,
        implements: match[3] ? match[3].split(',').map((i) => i.trim()) : undefined,
      };
    }

    return null;
  }

  /**
   * Count methods in a class
   */
  private async countClassMethods(lines: string[], startLine: number): Promise<number> {
    let methodCount = 0;
    let braceCount = 0;
    let i = startLine;

    while (i < lines.length) {
      const line = lines[i];

      // Simplified method detection
      if (line.trim().includes('function') || line.trim().match(/\w+\s*\(/)) {
        methodCount++;
      }

      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (braceCount === 0 && i > startLine) {
        break;
      }

      i++;
    }

    return methodCount;
  }

  /**
   * Count lines in a class
   */
  private async countClassLines(lines: string[], startLine: number): Promise<number> {
    let braceCount = 0;
    let i = startLine;
    let lineCount = 0;

    while (i < lines.length) {
      lineCount++;
      const line = lines[i];

      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (braceCount === 0 && i > startLine) {
        break;
      }

      i++;
    }

    return lineCount;
  }

  /**
   * Extract dependencies from a single file
   */
  private async extractFileDependencies(file: CodeFileData): Promise<{
    external: Set<string>;
    internal: Set<string>;
  }> {
    const dependencies = {
      external: new Set<string>(),
      internal: new Set<string>(),
    };

    const lines = file.content.split('\n');

    for (const line of lines) {
      // Extract import statements
      const importMatch = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const dep = importMatch[1];
        if (dep.startsWith('.') || dep.startsWith('/')) {
          dependencies.internal.add(dep);
        } else {
          dependencies.external.add(dep);
        }
      }

      // Extract require statements
      const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
      if (requireMatch) {
        const dep = requireMatch[1];
        if (dep.startsWith('.') || dep.startsWith('/')) {
          dependencies.internal.add(dep);
        } else {
          dependencies.external.add(dep);
        }
      }
    }

    return dependencies;
  }

  /**
   * Perform AI-powered analysis (if neural engine available)
   */
  private async performAIAnalysis(codeData: CodeFileData[], analysisType: string): Promise<any> {
    if (!this.config.neuralEngine) {
      throw new Error('Neural engine not available');
    }

    const codeContent = codeData.map((file) => file.content).join('\n\n');
    const result = await this.config.neuralEngine.infer(
      'analysis',
      'analyzeComplexity',
      codeContent
    );

    return {
      type: analysisType,
      insights: result,
      confidence: 0.85,
    };
  }
}

export default CodeAnalysisEngine;
