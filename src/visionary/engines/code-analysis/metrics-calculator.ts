/**
 * Metrics Calculator
 *
 * Calculates comprehensive code metrics including lines of code, complexity,
 * maintainability index, and various quality metrics.
 *
 * @fileoverview Code metrics calculation and analysis system
 * @version 1.0.0
 */

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
 * Function match result
 */
interface FunctionMatch {
  name: string;
  parameters: string[];
  isAsync: boolean;
}

/**
 * Class match result
 */
interface ClassMatch {
  name: string;
  extends?: string[];
  implements?: string[];
}

/**
 * Metrics Calculator
 *
 * Comprehensive system for calculating code metrics, complexity analysis,
 * and quality measurements across multiple programming languages.
 */
export class MetricsCalculator {
  /**
   * Calculate comprehensive code complexity
   *
   * @param codeData - Code file data
   * @returns Complexity analysis results
   */
  async calculateCodeComplexity(codeData: CodeFileData[]): Promise<ComplexityAnalysis> {
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
   * Calculate comprehensive code metrics
   *
   * @param codeData - Code file data
   * @returns Code metrics
   */
  async calculateMetrics(codeData: CodeFileData[]): Promise<CodeMetrics> {
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
   * Match function patterns in code
   *
   * @param line - Line of code
   * @param language - Programming language
   * @returns Function match data or null
   */
  private matchFunction(line: string, language: string): FunctionMatch | null {
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
   * Match class patterns in code
   *
   * @param line - Line of code
   * @param language - Programming language
   * @returns Class match data or null
   */
  private matchClass(line: string, language: string): ClassMatch | null {
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
}

export default MetricsCalculator;
