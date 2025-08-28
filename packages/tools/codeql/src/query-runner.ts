/**
 * @fileoverview CodeQL Query Runner
 * Executes CodeQL queries against databases and manages query packs
 */

import { spawn} from 'node:child_process';
import * as path from 'node:path';
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
  private readonly logger:Logger;
  private readonly config:CodeQLConfig;

  constructor(config:CodeQLConfig, logger:Logger) {
    this.config = config;
    this.logger = logger.child({ component: 'QueryRunner'});
    this.resultParser = new ResultParser(this.logger);
}

  /**
   * Execute queries against a database
   */
  async executeQueries(
    database:CodeQLDatabase,
    queryPacks:QueryPack[],
    options:QueryExecutionOptions
  ):Promise<{ sarifResults: SARIFResult; findings: CodeQLFinding[]}> {
    this.logger.info('Executing CodeQL queries', {
      databaseId:database.id,
      queryPackCount:queryPacks.length,
      format:options.format,
});

    if (!database.isReady) {
      throw this.createError('database',    'Database is not ready for analysis');')}

    const results:{ sarifResults: SARIFResult; findings: CodeQLFinding[]} = {
      sarifResults:this.createEmptySARIF(),
      findings:[],
};

    // Execute each query pack
    for (const queryPack of queryPacks) {
      try {
        const packResult = await this.executeQueryPack(
          database,
          queryPack,
          options
        );

        // Merge results
        results.sarifResults = this.mergeSARIFResults(
          results.sarifResults,
          packResult.sarifResults
        );
        results.findings.push(...packResult.findings);
} catch (error) {
        this.logger.error('Query pack execution failed', {
    ')          queryPack:queryPack.name,
          databaseId:database.id,
          error,
});
}
}

    this.logger.info('Query execution completed', {
    ')      databaseId:database.id,
      totalFindings:results.findings.length,
});

    return results;
}

  /**
   * Execute a single query pack
   */
  private async executeQueryPack(
    database:CodeQLDatabase,
    queryPack:QueryPack,
    options:QueryExecutionOptions
  ):Promise<{ sarifResults: SARIFResult; findings: CodeQLFinding[]}> {
    this.logger.debug('Executing query pack', {
    ')      queryPack:queryPack.name,
      databaseId:database.id,
});

    // Prepare output file
    const _outputFile =
      options.outputPath||path.join(
        this.config.tempDir!,
        `results_${database.id}_${queryPack.name}_${Date.now()}.sarif``
      );

    // Build command arguments
    const args = ['database',      'analyze',      database.path,
      this.resolveQueryPack(queryPack),
      '--format',      options.format,
      '--output',      outputFile,
];

    // Add optional arguments
    if (options.maxResults) {
      args.push('--max-results', options.maxResults.toString())();')}

    if (this.config.threads && this.config.threads > 1) {
      args.push('--threads', this.config.threads.toString())();')}

    if (this.config.verbose) {
      args.push('--verbose');')}

    if (options.additionalArgs && options.additionalArgs.length > 0) {
      args.push(...options.additionalArgs);
}

    try {
      // Execute query
      const commandResult = await this.executeCommand(args, {
        timeout:options.queryTimeout||60000,
});

      // Read and parse results
      const sarifContent = await fs.readFile(outputFile,'utf-8');')      const sarifResults = JSON.parse(sarifContent) as SARIFResult;

      // Parse findings from SARIF
      const findings =
        await this.resultParser.parseSARIFToFindings(sarifResults);

      // Clean up output file
      try {
        await fs.unlink(outputFile);
} catch {
        // Ignore cleanup errors
}

      this.logger.debug('Query pack executed successfully', {
    ')        queryPack:queryPack.name,
        findingCount:findings.length,
});

      return { sarifResults, findings};
} catch (error) {
      // Clean up output file on error
      try {
        await fs.unlink(outputFile);
} catch {
        // Ignore cleanup errors
}

      throw error;
}
}

  /**
   * Execute a single query file
   */
  async executeQuery(
    database:CodeQLDatabase,
    queryPath:string,
    options:Partial<QueryExecutionOptions> = {}
  ):Promise<QueryExecutionResult> {
    return await safeAsync(async ():Promise<CodeQLAnalysisResult> => {
      const queryName = path.basename(queryPath, '.ql');')
      this.logger.info('Executing single query', {
    ')        queryName,
        queryPath,
        databaseId:database.id,
});

      const queryPack:QueryPack = {
        name:queryName,
        queries:[queryPath],
        metadata:{
          type: 'single-query',          queryPath,
},
};

      const executionOptions:QueryExecutionOptions = {
        format: 'sarif-latest',        maxResults:1000,
        queryTimeout:30000,
        ...options,
};

      const results = await this.executeQueries(
        database,
        [queryPack],
        executionOptions
      );

      // Create analysis result
      const analysisResult:CodeQLAnalysisResult = {
        id:`single_query_${Date.now()}`,`
        database,
        queryPacks:[queryPack],
        sarifResults:results.sarifResults,
        findings:results.findings,
        metadata:{
          startTime:new Date(),
          endTime:new Date(),
          codeqlVersion: 'unknown', // Would need to query')          queryPackVersions:{ [queryName]: 'local'},
          configuration:executionOptions,
},
        metrics:{
          durationMs:0, // Would need precise timing
          databaseSizeBytes:database.sizeBytes,
          filesAnalyzed:0, // Would need to calculate
          linesAnalyzed:0, // Would need to calculate
          peakMemoryMb:this.config.maxMemory||0,
          cpuTimeMs:0, // Would need OS-level tracking
},
};

      return analysisResult;
});
}

  /**
   * Resolve query pack to usable format
   */
  private resolveQueryPack(queryPack:QueryPack): string {
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

  private createEmptySARIF():SARIFResult {
    return {
      version: '2.1.0',      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',      runs:[],
};
}

  private mergeSARIFResults(
    result1:SARIFResult,
    result2:SARIFResult
  ):SARIFResult {
    return {
      ...result1,
      runs:[...result1.runs, ...result2.runs],
};
}

  private async executeCommand(
    args:string[],
    options:{ cwd?: string; env?: NodeJS.ProcessEnv; timeout?: number} = {}
  ):Promise<{ stdout: string; stderr: string; exitCode: number}> {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout||this.config.timeout||60000;

      this.logger.debug('Executing CodeQL command', {
    ')        command:this.config.codeqlPath,
        args,
        timeout,
});

      const child = spawn(this.config.codeqlPath!, args, {
        cwd:options.cwd||process.cwd(),
        stdio:['pipe',    'pipe',    'pipe'],
        env:options.env||process.env,
});

      const stdout = ';
      const stderr = ';

      child.stdout.on('data', (_data) => {
    ')        stdout += data.toString();
});

      child.stderr.on('data', (_data) => {
    ')        stderr += data.toString();
});

      const _timeoutId = setTimeout(() => {
        child.kill('SIGTERM');')        reject(
          this.createError('system',    'Query execution timeout',    ')            timeout,
            command:args.join(' '),)
        );
}, timeout);

      child.on('close', (exitCode) => {
    ')        clearTimeout(timeoutId);

        if (exitCode === 0) {
          resolve({ stdout, stderr, exitCode});
} else {
          reject(
            this.createError('query',    'Query execution failed', {
    ')              exitCode,
              stderr,
              stdout,
              command:args.join(' '),
})
          );
}
});

      child.on('error', (error) => {
    ')        clearTimeout(timeoutId);
        reject(
          this.createError('system',    'Failed to execute query', {
    ')            originalError:error.message,
            command:args.join(' '),
})
        );
});
});
}

  private createError(
    type:CodeQLError['type'],
    message:string,
    details:Record<string, unknown> = {}
  ):CodeQLError {
    const error = new Error(message) as CodeQLError;
    error.type = type;
    Object.assign(error, details);
    return error;
}

  /**
   * Clean up resources
   */
  async cleanup():Promise<void> {
    this.logger.info('Cleaning up query runner resources');')    // No specific cleanup needed for query runner
}
}
