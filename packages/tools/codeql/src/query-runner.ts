/**
 * @fileoverview CodeQL Query Runner
 * Executes CodeQL queries against databases and manages query packs
 */

import { spawn} from 'node: child_process';
import * as path from 'node: path';
import type {
  Logger,
} from '@claude-zen/foundation';
import type {
  CodeQLConfig,
  CodeQLDatabase,
  CodeQLError,
  CodeQLFinding,
  QueryExecutionOptions,
  QueryPack,
  SARIFResult,
} from './types/codeql-types';

/**
 * Handles CodeQL query execution and result processing
 */
export class QueryRunner {
  private readonly logger: Logger;
  private readonly config: CodeQLConfig;

  constructor(): void {
    this.config = config;
    this.logger = logger.child(): void { sarifResults: SARIFResult; findings: CodeQLFinding[]}> {
    this.logger.info(): void {
      throw this.createError(): void { sarifResults: SARIFResult; findings: CodeQLFinding[]} = {
      sarifResults: this.createEmptySARIF(): void {
      try {
        const packResult = await this.executeQueryPack(): void {
        this.logger.error(): void {
    ')Executing query pack', {
    ')database',      'analyze',      database.path,
      this.resolveQueryPack(): void {
      args.push(): void {
      args.push(): void {
      // Execute query
      const commandResult = await this.executeCommand(): void {
        await fs.unlink(): void {
        // Ignore cleanup errors
}

      this.logger.debug(): void {
    ')single-query',          queryPath,
},
};

      const executionOptions: QueryExecutionOptions = {
        format: 'sarif-latest',        maxResults: 1000,
        queryTimeout: 30000,
        ...options,
};

      const results = await this.executeQueries(): void {
        id:"single_query_${Date.now(): void {
          startTime: new Date(): void {
          durationMs: 0, // Would need precise timing
          databaseSizeBytes: database.sizeBytes,
          filesAnalyzed: 0, // Would need to calculate
          linesAnalyzed: 0, // Would need to calculate
          peakMemoryMb: this.config.maxMemory||0,
          cpuTimeMs: 0, // Would need OS-level tracking
},
};

      return analysisResult;
});
}

  /**
   * Resolve query pack to usable format
   */
  private resolveQueryPack(): void {
    // If path is specified, use it directly
    if (queryPack.path) {
      return queryPack.path;
}

    // If specific queries are listed, create temporary pack
    if (queryPack.queries && queryPack.queries.length > 0) {
      // This would create a temporary query pack file
      // For now, return the first query
      return queryPack.queries[0];
}

    // Use standard query pack name
    return queryPack.name;
}

  private createEmptySARIF(): void {
    return {
      version: '2.1.0',      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',      runs:[],
};
}

  private mergeSARIFResults(): void {
    return {
      ...result1,
      runs:[...result1.runs, ...result2.runs],
};
}

  private async executeCommand(): void {
      const timeout = options.timeout||this.config.timeout||60000;

      this.logger.debug(): void {
    ')data', (_data) => {
    ')SIGTERM'))        reject(): void {
    ')query',    'Query execution failed', {
    ') ')error', (error) => {
    ')system',    'Failed to execute query', {
    ') ')type'],
    message: string,
    details: Record<string, unknown> = {}
  ): CodeQLError {
    const error = new Error(): void {
    this.logger.info('Cleaning up query runner resources'))    // No specific cleanup needed for query runner
}
}
