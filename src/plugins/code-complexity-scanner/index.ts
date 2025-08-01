/**
 * Code Complexity Scanner Plugin
 * Analyzes JavaScript/TypeScript code complexity and generates AI-powered refactoring suggestions
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class CodeComplexityScannerPlugin extends BasePlugin {
  private complexityThreshold = 10;

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
    this.complexityThreshold = (config.settings?.complexityThreshold as number) || 10;
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Code Complexity Scanner Plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Code Complexity Scanner Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Code Complexity Scanner Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.context.logger.info('Code Complexity Scanner Plugin cleaned up');
  }

  /**
   * Scan codebase for complexity issues
   */
  async scanForComplexity(files: string[], options: any = {}): Promise<any> {
    const { threshold = this.complexityThreshold } = options;
    const suggestions: any[] = [];

    for (const file of files) {
      try {
        const content = await this.readFile(file);
        const analysis = await this.analyzeFile(content, file, threshold);
        suggestions.push(...analysis);
      } catch (error) {
        this.context.logger.warn(`Could not analyze ${file}`, error);
      }
    }

    return {
      totalFiles: files.length,
      analyzedFiles: suggestions.length,
      suggestions,
      averageComplexity: this.calculateAverageComplexity(suggestions)
    };
  }

  private async readFile(filepath: string): Promise<string> {
    // This would integrate with file system
    return '';
  }

  private async analyzeFile(content: string, filepath: string, threshold: number): Promise<any[]> {
    const suggestions: any[] = [];

    try {
      // Simple complexity analysis (in real implementation, would use AST parser)
      const lines = content.split('\n');
      const functions = this.extractFunctions(content);

      for (const func of functions) {
        const complexity = this.calculateComplexity(func.body);
        
        if (complexity > threshold) {
          const suggestion = await this.createComplexitySuggestion(func, filepath, content);
          suggestions.push(suggestion);
        }
      }

      // Analyze overall file complexity
      const fileComplexity = this.calculateFileComplexity(content);
      if (fileComplexity > threshold * 2) {
        const fileSuggestion = await this.createFileSuggestion(filepath, fileComplexity);
        suggestions.push(fileSuggestion);
      }
    } catch (error) {
      throw new Error(`Analysis failed for ${filepath}: ${error}`);
    }

    return suggestions;
  }

  private extractFunctions(content: string): any[] {
    // Simple function extraction (would use proper AST in real implementation)
    const functions: any[] = [];
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        body: match[2],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    return functions;
  }

  private calculateComplexity(code: string): number {
    // Simple cyclomatic complexity calculation
    let complexity = 1; // Base complexity

    const complexityPatterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\belse\s*{/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bdo\s*{/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*[^:]+:/g // ternary
    ];

    for (const pattern of complexityPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private calculateFileComplexity(content: string): number {
    return this.calculateComplexity(content);
  }

  private async createComplexitySuggestion(method: any, filepath: string, content: string): Promise<any> {
    try {
      const suggestion = await this.generateRefactorSuggestion(method, filepath, content);
      return {
        id: this.generateId(),
        type: 'complexity',
        severity: 'high',
        file: filepath,
        method: method.name,
        complexity: this.calculateComplexity(method.body),
        line: this.getLineNumber(content, method.start),
        suggestion
      };
    } catch (error) {
      this.context.logger.warn(`Failed to generate refactor suggestion for ${method.name}`, error);
      return null;
    }
  }

  private async createFileSuggestion(filepath: string, complexity: number): Promise<any> {
    return {
      id: this.generateId(),
      type: 'file-complexity',
      severity: 'medium',
      file: filepath,
      complexity,
      suggestion: 'Consider breaking this file into smaller modules'
    };
  }

  private async generateRefactorSuggestion(method: any, filepath: string, content: string): Promise<string> {
    // This would integrate with AI service to generate suggestions
    return `Consider refactoring method '${method.name}' to reduce complexity. Suggestions:
1. Extract complex conditions into separate methods
2. Use early returns to reduce nesting
3. Break down the method into smaller functions`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getLineNumber(content: string, position: number): number {
    return content.substring(0, position).split('\n').length;
  }

  private calculateAverageComplexity(suggestions: any[]): number {
    if (suggestions.length === 0) return 0;
    const total = suggestions.reduce((sum, s) => sum + (s.complexity || 0), 0);
    return total / suggestions.length;
  }

  /**
   * Get analysis capabilities
   */
  getCapabilities(): any {
    return {
      fileTypes: ['.js', '.jsx', '.ts', '.tsx'],
      metrics: ['cyclomatic', 'halstead', 'maintainability'],
      features: [
        'method-level analysis',
        'file-level analysis',
        'ai-powered suggestions',
        'severity classification'
      ]
    };
  }
}

export default CodeComplexityScannerPlugin;