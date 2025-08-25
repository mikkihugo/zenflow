/**
 * @fileoverview CodeQL Bridge - Main CLI Integration
 * Primary interface for CodeQL CLI operations and database management
 */

import {
  getLogger,
  Result,
  ok,
  err,
  safeAsync,
  withRetry,
  type Logger,
} from '@claude-zen/foundation';

import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';
import { glob } from 'glob';

import type {
  CodeQLConfig,
  CodeQLDatabase,
  CodeQLLanguage,
  DatabaseCreationOptions,
  DatabaseCreationResult,
  QueryPack,
  QueryExecutionOptions,
  QueryExecutionResult,
  CodeQLAnalysisResult,
  CodeQLError,
  SARIFResult,
} from './types/codeql-types';

import { DatabaseManager } from './database-manager';
import { QueryRunner } from './query-runner';
import { ResultParser } from './result-parser';

/**
 * Main CodeQL integration bridge
 * Provides high-level interface for CodeQL operations
 */
export class CodeQLBridge {
  private readonly logger: Logger;
  private readonly config: CodeQLConfig;
  private readonly databaseManager: DatabaseManager;
  private readonly queryRunner: QueryRunner;
  private readonly resultParser: ResultParser;

  constructor(config: Partial<CodeQLConfig> = {}) {
    this.logger = getLogger('CodeQLBridge');'

    // Default configuration
    this.config = {
      codeqlPath: config.codeqlPath||'codeql',
      maxMemory: config.maxMemory||4096,
      threads:
        config.threads||Math.max(1, Math.floor(require('os').cpus().length / 2)),
      verbose: config.verbose ?? false,
      timeout: config.timeout||300000, // 5 minutes
      tempDir:
        config.tempDir||path.join(require('os').tmpdir(), 'codeql-zen'),
      ...config,
    };

    // Initialize subsystems
    this.databaseManager = new DatabaseManager(this.config, this.logger);
    this.queryRunner = new QueryRunner(this.config, this.logger);
    this.resultParser = new ResultParser(this.logger);

    this.logger.info('CodeQL Bridge initialized', {'
      codeqlPath: this.config.codeqlPath,
      maxMemory: this.config.maxMemory,
      threads: this.config.threads,
    });
  }

  /**
   * Check if CodeQL CLI is available and get version
   */
  async checkAvailability(): Promise<Result<string, CodeQLError>> {
    return await safeAsync(async () => {
      const result = await this.executeCommand(['version', '--format=json']);'
      const versionData = JSON.parse(result.stdout);
      return versionData.productVersion||versionData.version||'unknown;
    });
  }

  /**
   * Create CodeQL database for a repository
   */
  async createDatabase(
    repositoryPath: string,
    options: DatabaseCreationOptions
  ): Promise<DatabaseCreationResult> {
    return await withRetry(
      async () => {
        this.logger.info('Creating CodeQL database', {'
          repositoryPath,
          languages: options.languages,
        });

        // Validate repository path
        const repoStats = await fs.stat(repositoryPath);
        if (!repoStats.isDirectory()) {
          throw this.createError(
            'config',
            `Repository path is not a directory: ${repositoryPath}``
          );
        }

        // Create database using database manager
        const database = await this.databaseManager.createDatabase(
          repositoryPath,
          options
        );

        this.logger.info('CodeQL database created successfully', {'
          databaseId: database.id,
          path: database.path,
          language: database.language,
        });

        return database;
      },
      { retries: 2, minTimeout: 2000 }
    );
  }

  /**
   * Analyze repository with CodeQL queries
   */
  async analyzeRepository(
    repositoryPath: string,
    queryPacks: QueryPack[],
    options: Partial<DatabaseCreationOptions & QueryExecutionOptions> = {}
  ): Promise<QueryExecutionResult> {
    return await safeAsync(async (): Promise<CodeQLAnalysisResult> => {
      this.logger.info('Starting CodeQL repository analysis', {'
        repositoryPath,
        queryPackCount: queryPacks.length,
      });

      const startTime = Date.now();

      // Step 1: Detect languages in repository
      const languages = await this.detectLanguages(repositoryPath);
      if (languages.length === 0) {
        throw this.createError(
          'config',
          'No supported languages detected in repository');'
      }

      // Step 2: Create database
      const databaseOptions: DatabaseCreationOptions = {
        languages,
        buildCommand: options.buildCommand,
        additionalSources: options.additionalSources,
        excludePatterns: options.excludePatterns||['**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/.git/**',
        ],
        overwrite: options.overwrite ?? true,
        workingDirectory: options.workingDirectory||repositoryPath,
        environmentVariables: options.environmentVariables,
      };

      const database = await this.createDatabase(
        repositoryPath,
        databaseOptions
      );

      // Step 3: Execute queries
      const queryOptions: QueryExecutionOptions = {
        format: options.format||'sarif-latest',
        outputPath: options.outputPath,
        maxResults: options.maxResults||10000,
        queryTimeout: options.queryTimeout||60000,
        additionalArgs: options.additionalArgs||[],
      };

      const queryResults = await this.queryRunner.executeQueries(
        database,
        queryPacks,
        queryOptions
      );

      // Step 4: Process and parse results
      const analysisResult: CodeQLAnalysisResult = {
        id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,`
        database,
        queryPacks,
        sarifResults: queryResults.sarifResults,
        findings: queryResults.findings,
        metadata: {
          startTime: new Date(startTime),
          endTime: new Date(),
          codeqlVersion: await this.getCodeQLVersion(),
          queryPackVersions: this.extractQueryPackVersions(queryPacks),
          configuration: {
            ...databaseOptions,
            ...queryOptions,
          },
        },
        metrics: {
          durationMs: Date.now() - startTime,
          databaseSizeBytes: database.sizeBytes,
          filesAnalyzed: await this.countAnalyzedFiles(database),
          linesAnalyzed: 0, // Would need to calculate from database
          peakMemoryMb: this.config.maxMemory||0,
          cpuTimeMs: 0, // Would need OS-level tracking
        },
      };

      this.logger.info('CodeQL analysis completed', {'
        analysisId: analysisResult.id,
        findingCount: analysisResult.findings.length,
        durationMs: analysisResult.metrics.durationMs,
      });

      return analysisResult;
    });
  }

  /**
   * Analyze single file with CodeQL
   */
  async analyzeFile(
    filePath: string,
    queryPacks: QueryPack[],
    options: Partial<QueryExecutionOptions> = {}
  ): Promise<QueryExecutionResult> {
    const repositoryPath = path.dirname(filePath);
    const analysisOptions = {
      ...options,
      additionalSources: [filePath],
    };

    return this.analyzeRepository(repositoryPath, queryPacks, analysisOptions);
  }

  /**
   * List available databases
   */
  async listDatabases(): Promise<Result<CodeQLDatabase[], CodeQLError>> {
    return this.databaseManager.listDatabases();
  }

  /**
   * Delete a database
   */
  async deleteDatabase(databaseId: string): Promise<Result<void, CodeQLError>> {
    return this.databaseManager.deleteDatabase(databaseId);
  }

  /**
   * Get default query packs for languages
   */
  getDefaultQueryPacks(languages: CodeQLLanguage[]): QueryPack[] {
    const queryPacks: QueryPack[] = [];

    for (const language of languages) {
      // Standard security queries
      queryPacks.push({
        name: `${language}-security-extended`,`
        version: 'latest',
        metadata: {
          description: `Extended security queries for ${language}`,`
          category: 'security',
        },
      });

      // Code quality queries
      queryPacks.push({
        name: `${language}-code-scanning`,`
        version: 'latest',
        metadata: {
          description: `Code scanning queries for ${language}`,`
          category: 'quality',
        },
      });
    }

    return queryPacks;
  }

  /**
   * Get custom query packs from local directories
   */
  async getCustomQueryPacks(): Promise<QueryPack[]> {
    const queryPacks: QueryPack[] = [];
    const queriesDir = path.join(__dirname, '..', 'queries');'

    try {
      const languageDirs = await fs.readdir(queriesDir);

      for (const languageDir of languageDirs) {
        const languagePath = path.join(queriesDir, languageDir);
        const stats = await fs.stat(languagePath);

        if (stats.isDirectory()) {
          queryPacks.push({
            name: `claude-zen-${languageDir}`,`
            path: languagePath,
            metadata: {
              description: `Claude Zen custom queries for ${languageDir}`,`
              category: 'custom',
              source: 'claude-zen',
            },
          });
        }
      }
    } catch (error) {
      this.logger.warn('Could not load custom query packs', { error });'
    }

    return queryPacks;
  }

  // Private helper methods

  private async executeCommand(
    args: string[],
    options: { cwd?: string; timeout?: number } = {}
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout||this.config.timeout||300000;
      const cwd = options.cwd||process.cwd();

      this.logger.debug('Executing CodeQL command', {'
        command: this.config.codeqlPath,
        args,
        cwd,
        timeout,
      });

      const child = spawn(this.config.codeqlPath!, args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: process.env,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {'
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {'
        stderr += data.toString();
      });

      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');'
        reject(
          this.createError('system', 'Command timeout exceeded', {'
            command: args.join(' '),
            timeout,
          })
        );
      }, timeout);

      child.on('close', (exitCode) => {'
        clearTimeout(timeoutId);

        if (exitCode === 0) {
          resolve({ stdout, stderr, exitCode });
        } else {
          reject(
            this.createError('system', 'Command failed', {'
              command: args.join(' '),
              exitCode,
              stderr,
            })
          );
        }
      });

      child.on('error', (error) => {'
        clearTimeout(timeoutId);
        reject(
          this.createError('system', 'Failed to execute command', {'
            command: args.join(' '),
            originalError: error.message,
          })
        );
      });
    });
  }

  private async detectLanguages(
    repositoryPath: string
  ): Promise<CodeQLLanguage[]> {
    const languages: Set<CodeQLLanguage> = new Set();

    try {
      // Define language patterns
      const languagePatterns: Record<string, CodeQLLanguage> = {
        '**/*.ts': 'typescript',
        '**/*.tsx': 'typescript',
        '**/*.js': 'javascript',
        '**/*.jsx': 'javascript',
        '**/*.py': 'python',
        '**/*.java': 'java',
        '**/*.cs': 'csharp',
        '**/*.cpp': 'cpp',
        '**/*.cc': 'cpp',
        '**/*.cxx': 'cpp',
        '**/*.go': 'go',
        '**/*.rb': 'ruby',
        '**/*.swift': 'swift',
        '**/*.kt': 'kotlin',
      };

      for (const [pattern, language] of Object.entries(languagePatterns)) {
        const files = await glob(pattern, {
          cwd: repositoryPath,
          ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
          absolute: false,
        });

        if (files.length > 0) {
          languages.add(language);
        }
      }

      this.logger.debug('Detected languages', {'
        repositoryPath,
        languages: Array.from(languages),
      });
    } catch (error) {
      this.logger.warn('Error detecting languages', { repositoryPath, error });'
    }

    return Array.from(languages);
  }

  private async getCodeQLVersion(): Promise<string> {
    try {
      const versionResult = await this.checkAvailability();
      return versionResult.isOk() ? versionResult.value : 'unknown;
    } catch {
      return 'unknown;
    }
  }

  private extractQueryPackVersions(
    queryPacks: QueryPack[]
  ): Record<string, string> {
    const versions: Record<string, string> = {};

    for (const pack of queryPacks) {
      versions[pack.name] = pack.version||'latest;
    }

    return versions;
  }

  private async countAnalyzedFiles(database: CodeQLDatabase): Promise<number> {
    try {
      // This would query the database for file count
      // For now, return estimated count based on source directory
      const files = await glob('**/*', {'
        cwd: database.sourceRoot,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
        nodir: true,
      });

      return files.length;
    } catch {
      return 0;
    }
  }

  private createError(
    type: CodeQLError['type'],
    message: string,
    details: Record<string, unknown> = {}
  ): CodeQLError {
    const error = new Error(message) as CodeQLError;
    error.type = type;
    Object.assign(error, details);
    return error;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up CodeQL resources');'
    await this.databaseManager.cleanup();
    await this.queryRunner.cleanup();
  }
}

/**
 * Create CodeQL bridge with configuration
 */
export function createCodeQLBridge(
  config?: Partial<CodeQLConfig>
): CodeQLBridge {
  return new CodeQLBridge(config);
}

/**
 * Check if CodeQL is available on the system
 */
export async function checkCodeQLAvailability(
  codeqlPath?: string
): Promise<boolean> {
  try {
    const bridge = new CodeQLBridge({ codeqlPath });
    const result = await bridge.checkAvailability();
    return result.isOk();
  } catch {
    return false;
  }
}
