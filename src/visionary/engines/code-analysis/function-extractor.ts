/**
 * Function Extractor
 *
 * Extracts function information from source code including parameters,
 * complexity, line counts, and other function-specific metrics.
 *
 * @fileoverview Function extraction and analysis system
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
 * Function match result
 */
interface FunctionMatch {
  name: string;
  parameters: string[];
  isAsync: boolean;
}

/**
 * Function Extractor
 *
 * Specialized system for extracting and analyzing function information
 * from source code across multiple programming languages.
 */
export class FunctionExtractor {
  /**
   * Extract functions from code files
   *
   * @param codeData - Code file data
   * @returns Function analysis data
   */
  async extractFunctions(codeData: CodeFileData[]): Promise<FunctionData[]> {
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
   * Find long methods that exceed threshold
   *
   * @param content - File content
   * @param threshold - Line count threshold (default: 50)
   * @returns Long methods found
   */
  findLongMethods(
    content: string,
    threshold: number = 50
  ): Array<{ name: string; lineCount: number; lineNumber: number }> {
    const methods: Array<{ name: string; lineCount: number; lineNumber: number }> = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const functionMatch = this.matchFunction(line, 'javascript'); // Simplified for example

      if (functionMatch) {
        const methodLines = this.countMethodLines(lines, i);
        if (methodLines > threshold) {
          methods.push({
            name: functionMatch.name,
            lineCount: methodLines,
            lineNumber: i + 1,
          });
        }
      }
    }

    return methods;
  }

  /**
   * Find methods with long parameter lists
   *
   * @param content - File content
   * @param threshold - Parameter count threshold (default: 5)
   * @returns Methods with long parameter lists
   */
  findLongParameterMethods(
    content: string,
    threshold: number = 5
  ): Array<{ name: string; paramCount: number; lineNumber: number }> {
    const methods: Array<{ name: string; paramCount: number; lineNumber: number }> = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const functionMatch = line.match(
        /function\s+(\w+)\s*\(([^)]*)\)|(\w+)\s*[:=]\s*function\s*\(([^)]*)\)|(\w+)\s*\(([^)]*)\)\s*=>/
      );

      if (functionMatch) {
        const params = functionMatch[2] || functionMatch[4] || functionMatch[6] || '';
        const paramCount = params.split(',').filter((p) => p.trim()).length;

        if (paramCount > threshold) {
          methods.push({
            name: functionMatch[1] || functionMatch[3] || functionMatch[5] || 'anonymous',
            paramCount,
            lineNumber: i + 1,
          });
        }
      }
    }

    return methods;
  }

  /**
   * Count lines in a method (simplified version)
   *
   * @param lines - Source code lines
   * @param startIndex - Method start index
   * @returns Line count
   */
  private countMethodLines(lines: string[], startIndex: number): number {
    let braceCount = 0;
    let lineCount = 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      lineCount++;

      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (braceCount === 0 && i > startIndex) {
        break;
      }
    }

    return lineCount;
  }
}

export default FunctionExtractor;
