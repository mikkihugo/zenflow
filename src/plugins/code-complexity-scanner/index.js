/**
 * Code Complexity Scanner Plugin
 * Analyzes JavaScript/TypeScript code complexity and generates AI-powered refactoring suggestions
 */

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import pkg from 'escomplex';
const { analyse } = pkg;

export class CodeComplexityScannerPlugin {
  constructor(config = {}) {
    this.config = {
      complexityThreshold: 10,
      filePatterns: ['**/*.{js,jsx,ts,tsx}'],
      ignorePatterns: ['node_modules/**', '.git/**', '.hive-mind/**', 'dist/**'],
      enableRefactorSuggestions: true,
      aiProvider: null, // Will be injected
      ...config
    };
  }

  async initialize() {
    console.log('🔍 Code Complexity Scanner Plugin initialized');
    
    if (!this.config.aiProvider) {
      console.warn('⚠️ No AI provider configured, refactor suggestions disabled');
      this.config.enableRefactorSuggestions = false;
    }
  }

  /**
   * Scan codebase for complexity issues
   */
  async scanForComplexity(options = {}) {
    const { threshold = this.config.complexityThreshold } = options;
    const suggestions = [];
    
    const codeFiles = await glob(this.config.filePatterns, { 
      ignore: this.config.ignorePatterns 
    });

    console.log(`📊 Analyzing ${codeFiles.length} code files for complexity...`);

    for (const file of codeFiles) {
      try {
        const content = await readFile(file, 'utf8');
        const analysis = await this.analyzeFile(content, file, threshold);
        suggestions.push(...analysis);
      } catch (error) {
        console.warn(`⚠️ Could not analyze ${file}: ${error.message}`);
      }
    }

    return {
      totalFiles: codeFiles.length,
      complexIssues: suggestions.length,
      suggestions,
      summary: this.generateSummary(suggestions)
    };
  }

  /**
   * Analyze individual file for complexity
   */
  async analyzeFile(content, filepath, threshold) {
    const suggestions = [];
    
    try {
      const analysis = analyse(content);
      
      // Analyze methods/functions
      for (const method of analysis.methods || []) {
        if (method.cyclomatic > threshold) {
          const suggestion = await this.createComplexitySuggestion(
            method, filepath, content
          );
          suggestions.push(suggestion);
        }
      }
      
      // Analyze overall file complexity
      if (analysis.cyclomatic > threshold * 2) {
        const fileSuggestion = await this.createFileSuggestion(
          analysis, filepath
        );
        suggestions.push(fileSuggestion);
      }
      
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }

    return suggestions;
  }

  /**
   * Create suggestion for complex method
   */
  async createComplexitySuggestion(method, filepath, content) {
    const suggestion = {
      id: `complexity-${filepath}-${method.name}`,
      type: 'method_complexity',
      severity: this.getSeverityLevel(method.cyclomatic),
      file: filepath,
      methodName: method.name,
      complexity: method.cyclomatic,
      lineStart: method.lineStart,
      lineEnd: method.lineEnd,
      description: `High cyclomatic complexity (${method.cyclomatic}) in function '${method.name}'`,
      metrics: {
        cyclomatic: method.cyclomatic,
        halstead: method.halstead,
        maintainability: analysis.maintainability
      }
    };

    // Generate AI-powered refactoring suggestion
    if (this.config.enableRefactorSuggestions && this.config.aiProvider) {
      try {
        suggestion.refactorSuggestion = await this.generateRefactorSuggestion(
          method, filepath, content
        );
      } catch (error) {
        console.warn(`Failed to generate refactor suggestion: ${error.message}`);
      }
    }

    return suggestion;
  }

  /**
   * Create suggestion for complex file
   */
  async createFileSuggestion(analysis, filepath) {
    return {
      id: `file-complexity-${filepath}`,
      type: 'file_complexity',
      severity: 'high',
      file: filepath,
      complexity: analysis.cyclomatic,
      description: `File has high overall complexity (${analysis.cyclomatic})`,
      metrics: {
        cyclomatic: analysis.cyclomatic,
        maintainability: analysis.maintainability,
        methods: analysis.methods?.length || 0
      },
      recommendation: 'Consider splitting this file into smaller, focused modules'
    };
  }

  /**
   * Generate AI-powered refactoring suggestion
   */
  async generateRefactorSuggestion(method, filepath, content) {
    const prompt = this.buildRefactorPrompt(method, filepath, content);
    
    const response = await this.config.aiProvider.generateStructured(prompt, {
      type: 'object',
      properties: {
        approach: { type: 'string' },
        explanation: { type: 'string' },
        techniques: { type: 'array', items: { type: 'string' } },
        example: { type: 'string' }
      }
    });

    return response;
  }

  buildRefactorPrompt(method, filepath, content) {
    return `Analyze this JavaScript/TypeScript function with high cyclomatic complexity:

File: ${filepath}
Function: ${method.name}
Complexity: ${method.cyclomatic}

Provide refactoring suggestions to reduce complexity and improve maintainability. Include:
1. Specific refactoring approach
2. Explanation of the benefits
3. Key techniques to apply
4. Brief code example if helpful

Focus on practical, implementable suggestions.`;
  }

  /**
   * Get severity level based on complexity
   */
  getSeverityLevel(complexity) {
    if (complexity > 30) return 'critical';
    if (complexity > 20) return 'high';
    if (complexity > 15) return 'medium';
    return 'low';
  }

  /**
   * Generate summary of analysis results
   */
  generateSummary(suggestions) {
    const severityCounts = suggestions.reduce((acc, s) => {
      acc[s.severity] = (acc[s.severity] || 0) + 1;
      return acc;
    }, {});

    const avgComplexity = suggestions.length > 0 
      ? suggestions.reduce((sum, s) => sum + s.complexity, 0) / suggestions.length
      : 0;

    return {
      totalIssues: suggestions.length,
      severityBreakdown: severityCounts,
      averageComplexity: Math.round(avgComplexity * 100) / 100,
      mostComplexFile: suggestions.length > 0 
        ? suggestions.reduce((max, s) => s.complexity > max.complexity ? s : max)
        : null
    };
  }

  /**
   * Get analysis capabilities
   */
  getCapabilities() {
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

  async cleanup() {
    console.log('🔍 Code Complexity Scanner Plugin cleaned up');
  }
}

export default CodeComplexityScannerPlugin;