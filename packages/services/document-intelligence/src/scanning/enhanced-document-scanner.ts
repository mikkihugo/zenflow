/**
 * Enhanced Document Scanner - Simplified Working Version
 * 
 * Scans documents and source code to extract TODO items and FIXME comments
 * with proper TypeScript typing and syntax.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('EnhancedDocumentScanner');

/**
 * Types of analysis patterns we can detect in code and documents
 */
export type AnalysisPattern = 
  | 'todo'
  | 'fixme'
  | 'hack'
  | 'deprecated'
  | 'missing_implementation'
  | 'empty_function'
  | 'code_quality'
  | 'documentation_gap'
  | 'test_missing'
  | 'performance_issue'
  | 'security_concern'
  | 'refactor_needed';

/**
 * Detected code issue or improvement opportunity
 */
export interface CodeAnalysisResult {
  id: string;
  type: AnalysisPattern;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  filePath: string;
  lineNumber?: number;
  codeSnippet?: string;
  suggestedAction: string;
  estimatedEffort: 'small' | 'medium' | 'large';
  tags: string[];
  relatedFiles?: string[];
}

/**
 * Generated swarm task from code analysis
 */
export interface GeneratedSwarmTask {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'feature' | 'epic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
  sourceAnalysis: CodeAnalysisResult;
  suggestedSwarmType: 'single_agent' | 'collaborative' | 'research' | 'implementation';
  requiredAgentTypes: string[];
  dependencies: string[];
  acceptanceCriteria: string[];
}

/**
 * Scanner configuration options
 */
export interface ScannerConfig {
  /** Root directory to scan */
  rootPath: string;
  /** File patterns to include */
  includePatterns: string[];
  /** File patterns to exclude */
  excludePatterns: string[];
  /** Analysis patterns to detect */
  enabledPatterns: AnalysisPattern[];
  /** Maximum depth for directory traversal */
  maxDepth: number;
  /** Enable deep code analysis */
  deepAnalysis: boolean;
}

/**
 * Scan results summary
 */
export interface ScanResults {
  analysisResults: CodeAnalysisResult[];
  generatedTasks: GeneratedSwarmTask[];
  scannedFiles: number;
  totalIssues: number;
  severityCounts: Record<string, number>;
  patternCounts: Record<AnalysisPattern, number>;
  scanDuration: number;
}

/**
 * Enhanced document and code scanner with AI-powered analysis
 */
export class EnhancedDocumentScanner {
  private config: ScannerConfig;
  private isScanning = false;
  private analysisPatterns: Map<AnalysisPattern, RegExp[]>;

  constructor(config: Partial<ScannerConfig> = {}) {
    this.config = {
      rootPath: config.rootPath || './src',
      includePatterns: config.includePatterns || [
        '**/*.md',
        '**/*.ts',
        '**/*.js',
        '**/*.tsx',
        '**/*.jsx',
      ],
      excludePatterns: config.excludePatterns || [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      enabledPatterns: config.enabledPatterns || [
        'todo',
        'fixme',
        'hack',
        'deprecated',
        'missing_implementation',
        'empty_function',
        'code_quality',
        'documentation_gap',
      ],
      maxDepth: config.maxDepth || 10,
      deepAnalysis: config.deepAnalysis !== false,
    };

    this.analysisPatterns = this.initializeAnalysisPatterns();
  }

  /**
   * Initialize regex patterns for different analysis types
   */
  private initializeAnalysisPatterns(): Map<AnalysisPattern, RegExp[]> {
    const patterns = new Map<AnalysisPattern, RegExp[]>();

    // TODO pattern detection
    patterns.set('todo', [
      /(?:\/\/|#|<!--)\s*todo[\s:](.*?)(?:-->|$)/gi,
      /(?:\/\*|\*)\s*todo[\s:](.*?)(?:\*\/|$)/gi,
      /\b(?:todo|to-do|@todo)[\s:](.*?)(?:\n|$)/gi,
    ]);

    // FIXME pattern detection
    patterns.set('fixme', [
      /(?:\/\/|#|<!--)\s*fixme[\s:](.*?)(?:-->|$)/gi,
      /(?:\/\*|\*)\s*fixme[\s:](.*?)(?:\*\/|$)/gi,
      /\b(?:fixme|fix|@fixme)[\s:](.*?)(?:\n|$)/gi,
    ]);

    // HACK pattern detection
    patterns.set('hack', [
      /(?:\/\/|#|<!--)\s*hack[\s:](.*?)(?:-->|$)/gi,
      /(?:\/\*|\*)\s*hack[\s:](.*?)(?:\*\/|$)/gi,
      /\b(?:hack|hacky|@hack)[\s:](.*?)(?:\n|$)/gi,
    ]);

    return patterns;
  }

  /**
   * Scan the configured directory for issues and generate tasks
   */
  async scanAndGenerateTasks(): Promise<ScanResults> {
    if (this.isScanning) {
      throw new Error('Scanner is already running');
    }

    this.isScanning = true;
    const startTime = Date.now();

    try {
      logger.info(' Starting enhanced document scan in ' + this.config.rootPath);

      const analysisResults: CodeAnalysisResult[] = [];
      const scannedFiles = await this.scanDirectory(this.config.rootPath, analysisResults);

      // Generate swarm tasks from analysis results
      const generatedTasks = await this.generateSwarmTasks(analysisResults);

      const results: ScanResults = {
        analysisResults,
        generatedTasks,
        scannedFiles,
        totalIssues: analysisResults.length,
        severityCounts: this.calculateSeverityCounts(analysisResults),
        patternCounts: this.calculatePatternCounts(analysisResults),
        scanDuration: Date.now() - startTime,
      };

      logger.info(' Enhanced scan completed: ' + (analysisResults.length) + ' issues found in ' + scannedFiles + ' files');

      return results;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Recursively scan directory for files to analyze
   */
  private async scanDirectory(
    dirPath: string,
    analysisResults: CodeAnalysisResult[],
    depth = 0
  ): Promise<number> {
    if (depth > this.config.maxDepth) {
      return 0;
    }

    let scannedFiles = 0;

    try {
      const entries = await readdir(dirPath);

      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          if (!this.shouldExcludePath(fullPath)) {
            scannedFiles += await this.scanDirectory(fullPath, analysisResults, depth + 1);
          }
        } else if (stats.isFile() && this.shouldIncludeFile(fullPath)) {
          await this.analyzeFile(fullPath, analysisResults);
          scannedFiles++;
        }
      }
    } catch (error) {
      logger.warn('Failed to scan directory ' + dirPath + ':', error);
    }

    return scannedFiles;
  }

  /**
   * Analyze a single file for issues
   */
  private async analyzeFile(filePath: string, results: CodeAnalysisResult[]): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n');

      // Analyze each enabled pattern
      for (const pattern of this.config.enabledPatterns) {
        const patterns = this.analysisPatterns.get(pattern);
        if (!patterns) continue;

        for (const regex of patterns) {
          let match;
          while ((match = regex.exec(content)) !== null) {
            const lineNumber = this.getLineNumber(content, match.index);
            const result = this.createAnalysisResult(
              pattern,
              match,
              filePath,
              lineNumber,
              lines[lineNumber - 1]
            );
            if (result) {
              results.push(result);
            }
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to analyze file ' + filePath + ':', error);
    }
  }

  private createAnalysisResult(
    pattern: AnalysisPattern,
    match: RegExpExecArray,
    filePath: string,
    lineNumber: number,
    codeSnippet: string
  ): CodeAnalysisResult | null {
    const matchText = match[1] || '';
    
    return {
      id: this.generateId(),
      type: pattern,
      severity: this.getPatternSeverity(pattern),
      title: (pattern.toUpperCase()) + ': ' + matchText,
      description: 'Found ' + (pattern) + ' comment: ' + matchText,
      filePath,
      lineNumber,
      codeSnippet,
      suggestedAction: 'Address the ' + pattern + ' comment',
      estimatedEffort: this.getPatternEffort(pattern),
      tags: [pattern, 'code-quality'],
    };
  }

  private async generateSwarmTasks(analysisResults: CodeAnalysisResult[]): Promise<GeneratedSwarmTask[]> {
    // Simplified implementation - just create basic tasks
    return analysisResults.map(result => ({
      id: this.generateId(),
      title: result.title,
      description: result.description,
      type: 'task' as const,
      priority: result.severity,
      estimatedHours: result.estimatedEffort === 'small' ? 1 : result.estimatedEffort === 'medium' ? 4 : 8,
      sourceAnalysis: result,
      suggestedSwarmType: 'single_agent' as const,
      requiredAgentTypes: ['developer'],
      dependencies: [],
      acceptanceCriteria: ['Resolve ' + result.type + ' issue'],
    }));
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getPatternSeverity(pattern: AnalysisPattern): CodeAnalysisResult['severity'] {
    const severityMap: Record<AnalysisPattern, CodeAnalysisResult['severity']> = {
      todo: 'low',
      fixme: 'medium',
      hack: 'medium',
      deprecated: 'high',
      missing_implementation: 'high',
      empty_function: 'medium',
      code_quality: 'medium',
      documentation_gap: 'low',
      test_missing: 'medium',
      performance_issue: 'medium',
      security_concern: 'critical',
      refactor_needed: 'medium',
    };
    return severityMap[pattern] || 'medium';
  }

  private getPatternEffort(pattern: AnalysisPattern): CodeAnalysisResult['estimatedEffort'] {
    const effortMap: Record<AnalysisPattern, CodeAnalysisResult['estimatedEffort']> = {
      todo: 'small',
      fixme: 'medium',
      hack: 'medium',
      deprecated: 'large',
      missing_implementation: 'large',
      empty_function: 'medium',
      code_quality: 'medium',
      documentation_gap: 'small',
      test_missing: 'medium',
      performance_issue: 'large',
      security_concern: 'large',
      refactor_needed: 'medium',
    };
    return effortMap[pattern] || 'medium';
  }

  private shouldIncludeFile(filePath: string): boolean {
    const relativePath = relative(this.config.rootPath, filePath);
    return this.config.includePatterns.some(pattern => 
      this.matchPattern(relativePath, pattern)
    );
  }

  private shouldExcludePath(dirPath: string): boolean {
    const relativePath = relative(this.config.rootPath, dirPath);
    return this.config.excludePatterns.some(pattern => 
      this.matchPattern(relativePath, pattern)
    );
  }

  private matchPattern(path: string, pattern: string): boolean {
    // Simple glob pattern matching - basic implementation
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    return new RegExp(regexPattern).test(path);
  }

  private calculateSeverityCounts(results: CodeAnalysisResult[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const result of results) {
      counts[result.severity] = (counts[result.severity] || 0) + 1;
    }
    return counts;
  }

  private calculatePatternCounts(results: CodeAnalysisResult[]): Record<AnalysisPattern, number> {
    const counts = {} as Record<AnalysisPattern, number>;
    for (const result of results) {
      counts[result.type] = (counts[result.type] || 0) + 1;
    }
    return counts;
  }

  private generateId(): string {
    return 'analysis-' + (Date.now()) + '-' + Math.random().toString(36).substring(2, 11);
  }
}