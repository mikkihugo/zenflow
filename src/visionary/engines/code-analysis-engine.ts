/**
 * Code Analysis Engine
 *
 * Handles AST parsing, code metrics calculation, and complexity analysis.
 * Processes code files to extract structural information and calculate quality metrics.
 *
 * @fileoverview Core code analysis and metrics calculation engine
 * @version 1.0.0
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

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
 * AST node information
 */
export interface ASTNode {
  type: string;
  name?: string;
  line: number;
  depth: number;
  complexity?: number;
  parameters?: string[];
}

/**
 * Code metrics data
 */
export interface CodeMetrics {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  functions: number;
  classes: number;
  commentRatio: number;
}

/**
 * Function analysis data
 */
export interface FunctionData {
  name: string;
  parameters: string[];
  isAsync: boolean;
  lineNumber: number;
  complexity: number;
  lineCount: number;
  file: string;
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
 * Complexity analysis results
 */
export interface ComplexityAnalysis {
  cyclomatic: number;
  lines: number;
  functions: number;
  maxFunctionComplexity: number;
  avgComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: 'minimal' | 'low' | 'moderate' | 'high';
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
 * Code Analysis Engine
 *
 * Comprehensive code analysis system that processes source files
 * to extract structural information, calculate metrics, and analyze complexity.
 */
export class CodeAnalysisEngine {
  private readonly config: CodeAnalysisConfig;
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
  }

  /**
   * Initialize the analysis engine
   */
  async initialize(): Promise<void> {
    console.warn('🔍 Code Analysis Engine initialized');
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
      // Extract AST information
      const ast = await this.extractAST(codeData);

      // Extract functions
      const functions = await this.extractFunctions(codeData);

      // Extract classes
      const classes = await this.extractClasses(codeData);

      // Calculate complexity
      const complexity = await this.calculateCodeComplexity(codeData);

      // Analyze dependencies
      const dependencies = await this.analyzeDependencies(codeData);

      // Calculate metrics
      const metrics = await this.calculateMetrics(codeData);

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
      const stats = await import('node:fs').then((fs) => fs.promises.stat(filePath));

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
   * Detect programming language from file extension
   *
   * @param filePath - Path to the file
   * @returns Detected language name
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
   * Extract AST (Abstract Syntax Tree) information
   *
   * @param codeData - Code file data
   * @returns AST node information
   */
  private async extractAST(codeData: CodeFileData[]): Promise<ASTNode[]> {
    const astResults: ASTNode[] = [];

    for (const file of codeData) {
      try {
        const ast = await this.parseFileAST(file);
        astResults.push(...ast);
      } catch (error) {
        console.warn(`⚠️ AST parsing failed for ${file.path}:`, error.message);
      }
    }

    return astResults;
  }

  /**
   * Parse AST for a single file (simplified parser)
   *
   * @param file - Code file data
   * @returns AST nodes for the file
   */
  private async parseFileAST(file: CodeFileData): Promise<ASTNode[]> {
    // Simplified AST parsing - would use real parser in production
    if (file.language === 'javascript' || file.language === 'typescript') {
      return this.parseJavaScriptAST(file.content);
    } else if (file.language === 'python') {
      return this.parsePythonAST(file.content);
    }

    // Fallback to basic parsing
    return this.parseGenericAST(file.content);
  }

  /**
   * Parse JavaScript/TypeScript AST (simplified)
   *
   * @param code - Source code content
   * @returns AST nodes
   */
  private parseJavaScriptAST(code: string): ASTNode[] {
    const lines = code.split('\n');
    const nodes: ASTNode[] = [];
    let depth = 0;
    let maxDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Track nesting depth
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      depth += openBraces - closeBraces;
      maxDepth = Math.max(maxDepth, depth);

      // Identify significant nodes
      if (line.includes('function') || line.includes('class') || line.includes('=>')) {
        nodes.push({
          type: this.getJavaScriptNodeType(line),
          name: this.extractNodeName(line),
          line: i + 1,
          depth,
          complexity: this.calculateNodeComplexity(line),
        });
      }
    }

    return nodes.concat([{ type: 'meta', line: 0, depth: maxDepth }]);
  }

  /**
   * Parse Python AST (simplified)
   *
   * @param code - Source code content
   * @returns AST nodes
   */
  private parsePythonAST(code: string): ASTNode[] {
    const lines = code.split('\n');
    const nodes: ASTNode[] = [];
    let indentLevel = 0;
    let maxIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed) {
        // Calculate indentation level
        const currentIndent = line.length - line.trimStart().length;
        indentLevel = Math.floor(currentIndent / 4);
        maxIndent = Math.max(maxIndent, indentLevel);

        // Identify significant nodes
        if (
          trimmed.startsWith('def ') ||
          trimmed.startsWith('class ') ||
          trimmed.startsWith('async def ')
        ) {
          nodes.push({
            type: this.getPythonNodeType(trimmed),
            name: this.extractNodeName(trimmed),
            line: i + 1,
            depth: indentLevel,
          });
        }
      }
    }

    return nodes.concat([{ type: 'meta', line: 0, depth: maxIndent }]);
  }

  /**
   * Parse generic AST for unsupported languages
   *
   * @param code - Source code content
   * @returns Basic AST nodes
   */
  private parseGenericAST(code: string): ASTNode[] {
    const lines = code.split('\n').filter((line) => line.trim());
    return [{ type: 'generic', line: lines.length, depth: 0 }];
  }

  /**
   * Get JavaScript node type from line content
   *
   * @param line - Line of code
   * @returns Node type
   */
  private getJavaScriptNodeType(line: string): string {
    if (line.includes('class ')) return 'class';
    if (line.includes('function ')) return 'function';
    if (line.includes('=>')) return 'arrow-function';
    if (line.includes('const ') || line.includes('let ') || line.includes('const '))
      return 'variable';
    return 'unknown';
  }

  /**
   * Get Python node type from line content
   *
   * @param line - Line of code
   * @returns Node type
   */
  private getPythonNodeType(line: string): string {
    if (line.startsWith('class ')) return 'class';
    if (line.startsWith('def ')) return 'function';
    if (line.startsWith('async def ')) return 'async-function';
    return 'unknown';
  }

  /**
   * Extract node name from line content
   *
   * @param line - Line of code
   * @returns Extracted name or undefined
   */
  private extractNodeName(line: string): string | undefined {
    const functionMatch = line.match(/(?:function\s+)?(\w+)(?:\s*\(|\s*=)/);
    const classMatch = line.match(/class\s+(\w+)/);
    return functionMatch?.[1] || classMatch?.[1];
  }

  /**
   * Calculate basic complexity for a node
   *
   * @param line - Line of code
   * @returns Complexity score
   */
  private calculateNodeComplexity(line: string): number {
    // Simple complexity calculation based on decision points
    const decisionPoints = (line.match(/if|while|for|switch|case|catch|&&|\|\|/g) || []).length;
    return Math.max(1, decisionPoints);
  }

  /**
   * Extract functions from code files
   *
   * @param codeData - Code file data
   * @returns Function analysis data
   */
  private async extractFunctions(codeData: CodeFileData[]): Promise<FunctionData[]> {
    const functions: FunctionData[] = [];

    for (const file of codeData) {
      const fileFunctions = await this.extractFileFunctions(file);
      functions.push(...fileFunctions);
    }

    return functions;
  }

  /**
   * Extract functions from a single file
   *
   * @param file - Code file data
   * @returns Functions found in file
   */
  private async extractFileFunctions(file: CodeFileData): Promise<FunctionData[]> {
    const functions: FunctionData[] = [];
    const lines = file.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const functionMatch = this.matchFunction(line, file.language);

      if (functionMatch) {
        const func: FunctionData = {
          name: functionMatch.name,
          parameters: functionMatch.parameters,
          isAsync: functionMatch.isAsync,
          lineNumber: i + 1,
          complexity: await this.calculateFunctionComplexity(lines, i),
          lineCount: await this.countFunctionLines(lines, i),
          file: file.path,
        };
        functions.push(func);
      }
    }

    return functions;
  }

  /**
   * Match function patterns in code
   *
   * @param line - Line of code
   * @param language - Programming language
   * @returns Function match data or null
   */
  private matchFunction(
    line: string,
    language: string
  ): {
    name: string;
    parameters: string[];
    isAsync: boolean;
  } | null {
    const patterns: Record<string, RegExp[]> = {
      javascript: [
        /function\s+(\w+)\s*\(([^)]*)\)/,
        /(\w+)\s*[:=]\s*\(([^)]*)\)\s*=>/,
        /(async\s+)?(\w+)\s*\(([^)]*)\)\s*=>/,
      ],
      python: [/(async\s+)?def\s+(\w+)\s*\(([^)]*)\)/],
    };

    const langPatterns = patterns[language] || patterns.javascript;

    for (const pattern of langPatterns) {
      const match = line.match(pattern);
      if (match) {
        return {
          name: match[2] || match[1],
          parameters: (match[3] || match[2] || '')
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p),
          isAsync: line.includes('async'),
        };
      }
    }

    return null;
  }

  /**
   * Calculate cyclomatic complexity for a function
   *
   * @param lines - Source code lines
   * @param startLine - Function start line
   * @returns Complexity score
   */
  private async calculateFunctionComplexity(lines: string[], startLine: number): Promise<number> {
    let complexity = 1; // Base complexity
    let braceCount = 0;
    let i = startLine;

    // Find function body and count decision points
    while (i < lines.length) {
      const line = lines[i];

      // Count decision points
      if (
        line.includes('if') ||
        line.includes('while') ||
        line.includes('for') ||
        line.includes('switch') ||
        line.includes('catch')
      ) {
        complexity++;
      }

      // Track braces to find function end
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (braceCount === 0 && i > startLine) {
        break;
      }

      i++;
    }

    return complexity;
  }

  /**
   * Count lines in a function
   *
   * @param lines - Source code lines
   * @param startLine - Function start line
   * @returns Line count
   */
  private async countFunctionLines(lines: string[], startLine: number): Promise<number> {
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
   * Extract classes from code files
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
   * Match class patterns in code
   *
   * @param line - Line of code
   * @param language - Programming language
   * @returns Class match data or null
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
   *
   * @param lines - Source code lines
   * @param startLine - Class start line
   * @returns Method count
   */
  private async countClassMethods(lines: string[], startLine: number): Promise<number> {
    let methodCount = 0;
    let braceCount = 0;
    let i = startLine;

    while (i < lines.length) {
      const line = lines[i];

      // Count methods
      if (this.matchFunction(line, 'javascript')) {
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
   *
   * @param lines - Source code lines
   * @param startLine - Class start line
   * @returns Line count
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
   * Calculate comprehensive code complexity
   *
   * @param codeData - Code file data
   * @returns Complexity analysis results
   */
  private async calculateCodeComplexity(codeData: CodeFileData[]): Promise<ComplexityAnalysis> {
    let totalComplexity = 0;
    let totalLines = 0;
    let totalFunctions = 0;
    let maxComplexity = 0;

    for (const file of codeData) {
      const fileComplexity = await this.calculateFileComplexity(file);
      totalComplexity += fileComplexity.cyclomatic;
      totalLines += fileComplexity.lines;
      totalFunctions += fileComplexity.functions;
      maxComplexity = Math.max(maxComplexity, fileComplexity.maxFunctionComplexity);
    }

    const avgComplexity = totalFunctions > 0 ? totalComplexity / totalFunctions : 0;
    const maintainabilityIndex = this.calculateMaintainabilityIndex(
      totalLines,
      totalComplexity,
      avgComplexity
    );
    const technicalDebt = this.assessTechnicalDebt(avgComplexity, maxComplexity);

    return {
      cyclomatic: totalComplexity,
      lines: totalLines,
      functions: totalFunctions,
      maxFunctionComplexity: maxComplexity,
      avgComplexity,
      maintainabilityIndex,
      technicalDebt,
    };
  }

  /**
   * Calculate complexity for a single file
   *
   * @param file - Code file data
   * @returns File complexity metrics
   */
  private async calculateFileComplexity(file: CodeFileData): Promise<{
    cyclomatic: number;
    lines: number;
    functions: number;
    maxFunctionComplexity: number;
  }> {
    const lines = file.content.split('\n');
    let complexity = 0;
    let functionCount = 0;
    let maxFunctionComplexity = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Count decision points
      const decisions = (line.match(/if|while|for|switch|case|catch|&&|\|\|/g) || []).length;
      complexity += decisions;

      // Check if this is a function and calculate its complexity
      if (this.matchFunction(line, file.language)) {
        functionCount++;
        const funcComplexity = await this.calculateFunctionComplexity(lines, i);
        maxFunctionComplexity = Math.max(maxFunctionComplexity, funcComplexity);
      }
    }

    return {
      cyclomatic: complexity,
      lines: lines.length,
      functions: functionCount,
      maxFunctionComplexity,
    };
  }

  /**
   * Calculate maintainability index
   *
   * @param lines - Total lines of code
   * @param complexity - Cyclomatic complexity
   * @param halsteadVolume - Halstead volume (simplified)
   * @returns Maintainability index (0-100)
   */
  private calculateMaintainabilityIndex(
    lines: number,
    complexity: number,
    _halsteadVolume: number
  ): number {
    // Simplified maintainability index calculation
    const volume = Math.log2(lines) * 10; // Simplified Halstead volume
    const index = Math.max(
      0,
      171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(lines)
    );
    return Math.min(100, index);
  }

  /**
   * Assess technical debt level
   *
   * @param avgComplexity - Average complexity
   * @param maxComplexity - Maximum complexity
   * @returns Technical debt level
   */
  private assessTechnicalDebt(
    avgComplexity: number,
    maxComplexity: number
  ): 'minimal' | 'low' | 'moderate' | 'high' {
    if (maxComplexity > 20 || avgComplexity > 10) return 'high';
    if (maxComplexity > 10 || avgComplexity > 7) return 'moderate';
    if (maxComplexity > 5 || avgComplexity > 4) return 'low';
    return 'minimal';
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

    // Convert sets to arrays for serialization
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

  /**
   * Extract dependencies from a single file
   *
   * @param file - Code file data
   * @returns File dependencies
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
   * Calculate comprehensive code metrics
   *
   * @param codeData - Code file data
   * @returns Code metrics
   */
  private async calculateMetrics(codeData: CodeFileData[]): Promise<CodeMetrics> {
    let totalLines = 0;
    let codeLines = 0;
    let commentLines = 0;
    let blankLines = 0;
    let totalFunctions = 0;
    let totalClasses = 0;

    for (const file of codeData) {
      const fileMetrics = await this.calculateFileMetrics(file);
      totalLines += fileMetrics.totalLines;
      codeLines += fileMetrics.codeLines;
      commentLines += fileMetrics.commentLines;
      blankLines += fileMetrics.blankLines;
      totalFunctions += fileMetrics.functions;
      totalClasses += fileMetrics.classes;
    }

    const commentRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;

    return {
      totalLines,
      codeLines,
      commentLines,
      blankLines,
      functions: totalFunctions,
      classes: totalClasses,
      commentRatio,
    };
  }

  /**
   * Calculate metrics for a single file
   *
   * @param file - Code file data
   * @returns File metrics
   */
  private async calculateFileMetrics(file: CodeFileData): Promise<CodeMetrics> {
    const lines = file.content.split('\n');
    let codeLines = 0;
    let commentLines = 0;
    let blankLines = 0;
    let functions = 0;
    let classes = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        blankLines++;
      } else if (this.isCommentLine(trimmed, file.language)) {
        commentLines++;
      } else {
        codeLines++;

        if (this.matchFunction(line, file.language)) {
          functions++;
        }

        if (this.matchClass(line, file.language)) {
          classes++;
        }
      }
    }

    return {
      totalLines: lines.length,
      codeLines,
      commentLines,
      blankLines,
      functions,
      classes,
      commentRatio: lines.length > 0 ? (commentLines / lines.length) * 100 : 0,
    };
  }

  /**
   * Check if a line is a comment
   *
   * @param line - Line content
   * @param language - Programming language
   * @returns True if line is a comment
   */
  private isCommentLine(line: string, language: string): boolean {
    const commentPatterns: Record<string, RegExp> = {
      javascript: /^\/\/|^\/\*|\*\/$/,
      python: /^#/,
      java: /^\/\/|^\/\*|\*\/$/,
      c: /^\/\/|^\/\*|\*\/$/,
      cpp: /^\/\/|^\/\*|\*\/$/,
    };

    const pattern = commentPatterns[language] || commentPatterns.javascript;
    return pattern.test(line);
  }

  /**
   * Perform AI-powered analysis (if neural engine available)
   *
   * @param codeData - Code file data
   * @param analysisType - Type of analysis to perform
   * @returns AI analysis results
   */
  private async performAIAnalysis(codeData: CodeFileData[], analysisType: string): Promise<any> {
    if (!this.config.neuralEngine) {
      throw new Error('Neural engine not available');
    }

    const codeContent = codeData.map((file) => file.content).join('\n\n');

    // Use neural engine for analysis
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
