/**
 * @fileoverview Progressive Batch Linter - Process repo incrementally
 *
 * Processes files in batches from repo root, continuing until done.
 * Marks unsolvable issues with FIXME:: comments when Claude has low confidence.
 *
 * Features:
 * - Process --head 50 files at a time
 * - ESLint + Prettier + Claude AI pipeline
 * - Progress tracking and resumption
 * - FIXME:: comments for low-confidence issues
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import { getLogger } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';
import { glob } from 'fast-glob';

import {
  ClaudeESLintBridge,
  createClaudeESLintBridge,
} from './claude-eslint-bridge.js';

import { createLinterContext } from './index.js';

/**
 * Configuration for progressive batch linting
 */
export interface ProgressiveBatchConfig {
  /** Batch size (number of files to process at once) */
  batchSize: number;
  /** Root directory to start from */
  rootDir: string;
  /** File patterns to include */
  includePatterns: string[];
  /** File patterns to exclude */
  excludePatterns: string[];
  /** Confidence threshold for Claude fixes (below this = FIXME::) */
  confidenceThreshold: number;
  /** Resume from previous session */
  resume: boolean;
  /** Progress file to track completed files */
  progressFile: string;
}

/**
 * Default configuration for progressive batch linting
 */
export const DEFAULT_PROGRESSIVE_CONFIG: ProgressiveBatchConfig = {
  batchSize: 50,
  rootDir: process.cwd(),
  includePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.d.ts',
  ],
  confidenceThreshold: 0.7,
  resume: true,
  progressFile: '.ai-linter-progress.json',
};

/**
 * Progress tracking data
 */
interface ProgressData {
  completedFiles: Set<string>;
  totalFiles: number;
  currentBatch: number;
  startTime: number;
  lastUpdateTime: number;
  stats: {
    filesProcessed: number;
    filesFixed: number;
    fixmeCommentsAdded: number;
    eslintIssuesFixed: number;
    prettierChanges: number;
    claudeFixesApplied: number;
  };
}

/**
 * Progressive batch linter that processes repo incrementally
 */
export class ProgressiveBatchLinter {
  private readonly logger: Logger;
  private readonly bridge: ClaudeESLintBridge;
  private readonly config: ProgressiveBatchConfig;
  private progress: ProgressData;

  constructor(config: Partial<ProgressiveBatchConfig> = {}) {
    this.logger = getLogger('progressive-batch-linter');
    this.config = { ...DEFAULT_PROGRESSIVE_CONFIG, ...config };

    // Create event bus for bridge
    const eventBus = {
      on: () => {},
      emit: () => {},
      off: () => {},
    };

    this.bridge = createClaudeESLintBridge(eventBus, {
      enableAIRules: true,
      confidenceThreshold: this.config.confidenceThreshold,
      focusAreas: [
        'complexity',
        'maintainability',
        'type-safety',
        'performance',
      ],
    });

    this.progress = this.initializeProgress();
  }

  /**
   * Start progressive batch linting from repo root
   */
  async startProgressiveLinting(): Promise<void> {
    this.logger.info(
      `🚀 Starting progressive batch linting from ${this.config.rootDir}`
    );
    this.logger.info(`📦 Batch size: ${this.config.batchSize} files`);
    this.logger.info(
      `🎯 Confidence threshold: ${this.config.confidenceThreshold}`
    );

    try {
      // Load progress if resuming
      if (this.config.resume) {
        await this.loadProgress();
      }

      // Get all files to process
      const allFiles = await this.discoverFiles();
      this.progress.totalFiles = allFiles.length;

      this.logger.info(`📁 Found ${allFiles.length} files to process`);

      // Filter out already completed files
      const remainingFiles = allFiles.filter(
        (file) => !this.progress.completedFiles.has(file)
      );

      if (remainingFiles.length === 0) {
        this.logger.info('✅ All files already processed!');
        return;
      }

      this.logger.info(
        `📋 ${remainingFiles.length} files remaining to process`
      );

      // Process files in batches
      await this.processBatches(remainingFiles);

      // Final summary
      this.printFinalSummary();
    } catch (error) {
      this.logger.error('Progressive linting failed:', error);
      throw error;
    }
  }

  /**
   * Discover all files to process from repo root
   */
  private async discoverFiles(): Promise<string[]> {
    this.logger.info('🔍 Discovering files...');

    const files = await glob(this.config.includePatterns, {
      cwd: this.config.rootDir,
      ignore: this.config.excludePatterns,
      absolute: true,
    });

    // Filter out files that don't exist
    const existingFiles: string[] = [];
    for (const file of files) {
      try {
        await fs.access(file);
        existingFiles.push(file);
      } catch {
        // File doesn't exist, skip
      }
    }

    return existingFiles.sort(); // Consistent ordering
  }

  /**
   * Process files in batches of specified size
   */
  private async processBatches(files: string[]): Promise<void> {
    const totalBatches = Math.ceil(files.length / this.config.batchSize);

    for (let i = 0; i < files.length; i += this.config.batchSize) {
      const batch = files.slice(i, i + this.config.batchSize);
      const batchNumber = Math.floor(i / this.config.batchSize) + 1;

      this.progress.currentBatch = batchNumber;

      this.logger.info(
        `📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`
      );

      await this.processBatch(batch);

      // Save progress after each batch
      await this.saveProgress();

      // Show progress
      this.printProgress();
    }
  }

  /**
   * Process a single batch of files
   */
  private async processBatch(files: string[]): Promise<void> {
    for (const filePath of files) {
      try {
        await this.processFile(filePath);
        this.progress.completedFiles.add(filePath);
        this.progress.stats.filesProcessed++;
      } catch (error) {
        this.logger.error(`Failed to process ${filePath}:`, error);
        // Add FIXME comment for failed processing
        await this.addFixmeComment(filePath, `Failed to process: ${error}`);
      }
    }
  }

  /**
   * Process a single file through the complete pipeline
   */
  private async processFile(filePath: string): Promise<void> {
    const relativePath = path.relative(this.config.rootDir, filePath);
    this.logger.debug(`🔧 Processing ${relativePath}`);

    // Read file content
    const originalContent = await fs.readFile(filePath, 'utf-8');

    // Create linter context
    const context = createLinterContext(
      filePath,
      this.getLanguageFromPath(filePath),
      this.config.rootDir
    );

    // Analyze with AI linter
    const analysis = await this.bridge.analyzeCodeWithAI(
      filePath,
      originalContent,
      context
    );

    // Apply comprehensive auto-fix (ESLint + Prettier + Claude)
    const fixedContent = await this.bridge.autoFixCode(
      filePath,
      originalContent,
      analysis
    );

    // Check if Claude fixes were applied with low confidence
    const lowConfidenceIssues = this.identifyLowConfidenceIssues(analysis);

    let finalContent = fixedContent;

    // Add FIXME comments for low-confidence issues
    if (lowConfidenceIssues.length > 0) {
      finalContent = await this.addLowConfidenceFixmes(
        fixedContent,
        filePath,
        lowConfidenceIssues
      );
      this.progress.stats.fixmeCommentsAdded += lowConfidenceIssues.length;
    }

    // Write fixed content back to file (only if changed)
    if (finalContent !== originalContent) {
      await fs.writeFile(filePath, finalContent, 'utf-8');
      this.progress.stats.filesFixed++;
      this.logger.debug(`✅ Fixed ${relativePath}`);
    }
  }

  /**
   * Identify issues with low confidence that should get FIXME comments
   */
  private identifyLowConfidenceIssues(
    analysis: any
  ): Array<{ line: number; issue: string; confidence: number }> {
    const lowConfidenceIssues: Array<{
      line: number;
      issue: string;
      confidence: number;
    }> = [];

    // Check if overall confidence is below threshold
    if (analysis.confidence < this.config.confidenceThreshold) {
      // Add issues that Claude couldn't fix with high confidence
      const complexityIssues = analysis.claudeInsights.complexity_issues'' | '''' | ''[];
      const typeSafetyIssues =
        analysis.claudeInsights.type_safety_concerns'' | '''' | ''[];

      for (const issue of complexityIssues) {
        if (issue.complexityScore > 15) {
          // High complexity
          lowConfidenceIssues.push({
            line: issue.location?.line'' | '''' | ''1,
            issue: `High complexity (${issue.complexityScore}): ${issue.functionName}`,
            confidence: analysis.confidence,
          });
        }
      }

      for (const issue of typeSafetyIssues) {
        if (issue.severity ==='error''' | '''' | ''issue.severity ==='critical') {
          lowConfidenceIssues.push({
            line: issue.location?.line'' | '''' | ''1,
            issue: `Type safety: ${issue.description}`,
            confidence: analysis.confidence,
          });
        }
      }
    }

    return lowConfidenceIssues;
  }

  /**
   * Add FIXME comments for low-confidence issues
   */
  private async addLowConfidenceFixmes(
    content: string,
    filePath: string,
    issues: Array<{ line: number; issue: string; confidence: number }>
  ): Promise<string> {
    const lines = content.split('\n');

    // Sort issues by line number (descending) to avoid line number shifts
    const sortedIssues = issues.sort((a, b) => b.line - a.line);

    for (const issue of sortedIssues) {
      const lineIndex = Math.max(0, issue.line - 1);
      const commentPrefix = this.getCommentPrefix(filePath);
      const fixmeComment = `${commentPrefix} FIXME:: Claude AI couldn't fix with high confidence (${(issue.confidence * 100).toFixed(1)}%): ${issue.issue}`;

      // Insert FIXME comment above the problematic line
      lines.splice(lineIndex, 0, fixmeComment);
    }

    return lines.join('\n');
  }

  /**
   * Add FIXME comment for processing failures
   */
  private async addFixmeComment(filePath: string, error: any): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const commentPrefix = this.getCommentPrefix(filePath);
      const fixmeComment = `${commentPrefix} FIXME:: AI Linter processing failed: ${error}`;

      const updatedContent = `${fixmeComment}\n${content}`;
      await fs.writeFile(filePath, updatedContent, 'utf-8');

      this.progress.stats.fixmeCommentsAdded++;
    } catch (writeError) {
      this.logger.error(
        `Failed to add FIXME comment to ${filePath}:`,
        writeError
      );
    }
  }

  /**
   * Get comment prefix for different file types
   */
  private getCommentPrefix(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const commentMap: Record<string, string> = {
      '.js': '//',
      '.jsx': '//',
      '.ts': '//',
      '.tsx': '//',
      '.py': '#',
      '.rb': '#',
      '.sh': '#',
      '.yml': '#',
      '.yaml': '#',
      '.css': '/*',
      '.scss': '//',
      '.less': '//',
      '.html': '<!--',
      '.xml': '<!--',
    };
    return commentMap[ext]'' | '''' | '''//';
  }

  /**
   * Get programming language from file path
   */
  private getLanguageFromPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const langMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.cs': 'csharp',
      '.php': 'php',
    };
    return langMap[ext]'' | '''' | '''typescript';
  }

  /**
   * Initialize progress tracking
   */
  private initializeProgress(): ProgressData {
    return {
      completedFiles: new Set<string>(),
      totalFiles: 0,
      currentBatch: 0,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      stats: {
        filesProcessed: 0,
        filesFixed: 0,
        fixmeCommentsAdded: 0,
        eslintIssuesFixed: 0,
        prettierChanges: 0,
        claudeFixesApplied: 0,
      },
    };
  }

  /**
   * Load progress from previous session
   */
  private async loadProgress(): Promise<void> {
    try {
      const progressPath = path.join(
        this.config.rootDir,
        this.config.progressFile
      );
      const progressData = await fs.readFile(progressPath, 'utf-8');
      const saved = JSON.parse(progressData);

      this.progress.completedFiles = new Set(saved.completedFiles);
      this.progress.currentBatch = saved.currentBatch'' | '''' | ''0;
      this.progress.stats = { ...this.progress.stats, ...saved.stats };

      this.logger.info(
        `📋 Resumed from previous session: ${this.progress.completedFiles.size} files already processed`
      );
    } catch (error) {
      this.logger.info('No previous progress found, starting fresh');
    }
  }

  /**
   * Save progress to file
   */
  private async saveProgress(): Promise<void> {
    try {
      const progressPath = path.join(
        this.config.rootDir,
        this.config.progressFile
      );
      const progressData = {
        completedFiles: Array.from(this.progress.completedFiles),
        totalFiles: this.progress.totalFiles,
        currentBatch: this.progress.currentBatch,
        lastUpdateTime: Date.now(),
        stats: this.progress.stats,
      };

      await fs.writeFile(
        progressPath,
        JSON.stringify(progressData, null, 2),
        'utf-8'
      );
    } catch (error) {
      this.logger.warn('Failed to save progress:', error);
    }
  }

  /**
   * Print current progress
   */
  private printProgress(): void {
    const percent =
      this.progress.totalFiles > 0
        ? (
            (this.progress.stats.filesProcessed / this.progress.totalFiles) *
            100
          ).toFixed(1)
        : '0.0';

    this.logger.info(
      `📊 Progress: ${this.progress.stats.filesProcessed}/${this.progress.totalFiles} files (${percent}%)`
    );
    this.logger.info(`🔧 Fixed: ${this.progress.stats.filesFixed} files`);
    this.logger.info(
      `⚠️  FIXME comments: ${this.progress.stats.fixmeCommentsAdded}`
    );
  }

  /**
   * Print final summary
   */
  private printFinalSummary(): void {
    const duration = Date.now() - this.progress.startTime;
    const durationMinutes = (duration / 60000).toFixed(1);

    this.logger.info('🎉 Progressive batch linting completed!');
    this.logger.info(`⏱️  Total time: ${durationMinutes} minutes`);
    this.logger.info(
      `📁 Files processed: ${this.progress.stats.filesProcessed}`
    );
    this.logger.info(`🔧 Files fixed: ${this.progress.stats.filesFixed}`);
    this.logger.info(
      `⚠️  FIXME comments added: ${this.progress.stats.fixmeCommentsAdded}`
    );

    if (this.progress.stats.fixmeCommentsAdded > 0) {
      this.logger.info(
        `📝 Search for "FIXME::" to find issues that need manual review`
      );
    }
  }
}

/**
 * Factory function to create progressive batch linter
 */
export function createProgressiveBatchLinter(
  config?: Partial<ProgressiveBatchConfig>
): ProgressiveBatchLinter {
  return new ProgressiveBatchLinter(config);
}

/**
 * CLI entry point for progressive batch linting
 */
export async function runProgressiveBatchLinting(
  rootDir?: string,
  batchSize?: number
): Promise<void> {
  const config: Partial<ProgressiveBatchConfig> = {};

  if (rootDir) {
    config.rootDir = rootDir;
  }

  if (batchSize) {
    config.batchSize = batchSize;
  }

  const linter = createProgressiveBatchLinter(config);
  await linter.startProgressiveLinting();
}
