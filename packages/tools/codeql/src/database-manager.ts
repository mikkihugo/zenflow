/**
 * @fileoverview CodeQL Database Manager
 * Handles database creation, management, and lifecycle operations
 */

import { spawn} from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  type Logger,
  safeAsync,
} from '@claude-zen/foundation';

import type {
  CodeQLConfig,
  CodeQLDatabase,
  CodeQLError,
  DatabaseCreationOptions,
} from './types/codeql-types';

/**
 * Manages CodeQL database operations
 */
export class DatabaseManager {
  private readonly config:CodeQLConfig;

  constructor(config:CodeQLConfig, logger:Logger) {
    this.config = config;
    this.logger = logger.child({ component: 'DatabaseManager'});')}

  /**
   * Create a new CodeQL database
   */
  async createDatabase(
    repositoryPath:string,
    options:DatabaseCreationOptions
  ):Promise<CodeQLDatabase> {
    const absolutePath = path.resolve(repositoryPath);
    const databaseId = this.generateDatabaseId(absolutePath, options.languages);
    const _databasePath = path.join(this.config.tempDir!, `${databaseId}.db`);`

    this.logger.info('Creating CodeQL database', {
    ')      databaseId,
      repositoryPath:absolutePath,
      databasePath,
      languages:options.languages,
});

    // Ensure temp directory exists
    await fs.mkdir(this.config.tempDir!, { recursive:true});

    // Remove existing database if overwrite is enabled
    if (options.overwrite && (await this.databaseExists(databasePath))) {
      await this.deleteDatabaseFiles(databasePath);
}

    // Build command arguments
    const args = [
      'database',      'create',      databasePath,
      '--source-root',      absolutePath,
      '--language',      options.languages.join(',    '),
];

    // Add optional arguments
    if (options.buildCommand) {
      args.push('--command', options.buildCommand);')}

    if (options.additionalSources && options.additionalSources.length > 0) {
      for (const source of options.additionalSources) {
        args.push('--additional-sources', source);')}
}

    if (options.excludePatterns && options.excludePatterns.length > 0) {
      // Create exclude file
      const excludeFile = path.join(
        this.config.tempDir!,
        `$databaseId.exclude``
      );
      await fs.writeFile(excludeFile, options.excludePatterns.join('\n'));')      args.push('--exclude', excludeFile);')}

    if (this._config._threads && this.config.threads > 1) {
      args.push('--threads', this.config.threads.toString())();')}

    if (this._config._verbose) {
      args.push('--verbose');')}

    // Set working directory
    const workingDirectory = options.workingDirectory||absolutePath;

    try {
      // Execute database creation
      const result = await this.executeCommand(args, {
        cwd:workingDirectory,
        env:{
          ...process.env,
          ...(options.environmentVariables||{}),
},
});

      // Verify database was created
      const databaseSize = await this.calculateDatabaseSize(databasePath);

      // Create database object
      const database:CodeQLDatabase = {
        id:databaseId,
        path:databasePath,
        language:options.languages[0], // Primary language
        additionalLanguages:options.languages.slice(1),
        sourceRoot:absolutePath,
        createdAt:new Date(),
        sizeBytes:databaseSize,
        isReady:true,
        buildCommand:options.buildCommand,
        metadata:{
          creationArgs:args,
          workingDirectory,
          excludePatterns:options.excludePatterns,
          stdout:result.stdout,
          stderr:result.stderr,
},
};

      // Store in registry
      this.databases.set(databaseId, database);

      this.logger.info('Database created successfully', {
    ')        databaseId,
        sizeBytes:databaseSize,
        languages:options.languages,
});

      return database;
} catch (error) {
      this.logger.error('Database creation failed', {
    ')        databaseId,
        repositoryPath:absolutePath,
        error,
});

      // Clean up failed database
      try {
        await this.deleteDatabaseFiles(databasePath);
} catch (cleanupError) {
        this.logger.warn('Failed to clean up failed database', {
    ')          cleanupError,
});
}

      throw error;
}
}

  /**
   * List all managed databases
   */
  async listDatabases():Promise<Result<CodeQLDatabase[], CodeQLError>> {
    return await safeAsync(async () => {
      const databases = Array.from(this.databases.values())();

      // Verify database files still exist
      const validDatabases:CodeQLDatabase[] = [];

      for (const database of databases) {
        if (await this.databaseExists(database.path)) {
          validDatabases.push(database);
} else {
          this.logger.warn('Database file missing, removing from registry', {
    ')            databaseId:database.id,
            path:database.path,
});
          this.databases.delete(database.id);
}
}

      return validDatabases;
});
}

  /**
   * Delete a database
   */
  async deleteDatabase(databaseId:string): Promise<Result<void, CodeQLError>> {
    return await safeAsync(async () => {
      const database = this.databases.get(databaseId);

      if (!database) {
        throw this.createError('config', `Database not found:${databaseId}`);`
}

      this.logger.info('Deleting database', {
    ')        databaseId,
        path:database.path,
});

      // Delete database files
      await this.deleteDatabaseFiles(database.path);

      // Remove from registry
      this.databases.delete(databaseId);

      this.logger.info('Database deleted successfully', { databaseId});')});
}

  /**
   * Clean up all databases and temporary files
   */
  async cleanup():Promise<void> {
    this.logger.info('Cleaning up all databases');')
    const databases = Array.from(this.databases.values())();

    for (const database of databases) {
      try {
        await this.deleteDatabaseFiles(database.path);
} catch (error) {
        this.logger.warn('Failed to delete database during cleanup', {
    ')          databaseId:database.id,
          error,
});
}
}

    this.databases.clear();

    // Clean up temp directory
    try {
      await fs.rmdir(this.config.tempDir!, { recursive:true});
} catch (error) {
      this.logger.warn('Failed to clean temp directory', {
    ')        tempDir:this.config.tempDir,
        error,
});
}
}

  // Private helper methods

  private generateDatabaseId(
    repositoryPath:string,
    languages:CodeQLLanguage[]
  ):string {
    const repoName = path.basename(repositoryPath);
    const langString = languages.sort().join('-');')    const timestamp = Date.now();
    return `$repoName_$langString_$timestamp`;`
}

  private async databaseExists(databasePath:string): Promise<boolean> 
    try {
      const stats = await fs.stat(databasePath);
      return stats.isDirectory();
} catch {
      return false;
}

  private async deleteDatabaseFiles(databasePath:string): Promise<void> 
    try {
      await fs.rm(databasePath, { recursive:true, force:true});
} catch (error) {
      this.logger.warn('Failed to delete database files', {
    ')        databasePath,
        error,
});
      throw error;
}

  private async calculateDatabaseSize(databasePath:string): Promise<number> 
    try {
      let totalSize = 0;

      const calculateDirectorySize = async (
        dirPath:string
      ):Promise<number> => {
        let size = 0;
        const entries = await fs.readdir(dirPath, { withFileTypes:true});

        for (const entry of entries) {
          const entryPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            size += await calculateDirectorySize(entryPath);
} else {
            const stats = await fs.stat(entryPath);
            size += stats.size;
}
}

        return size;
};

      totalSize = await calculateDirectorySize(databasePath);
      return totalSize;
} catch {
      return 0;
}

  private async executeCommand(
    args:string[],
    options:{ cwd?: string; env?: NodeJS.ProcessEnv} = {}
  ):Promise<stdout: string; stderr: string; exitCode: number > 
    return new Promise((resolve, reject) => {
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
          this.createError('system',    'Database creation timeout',    ')            timeout:this.config.timeout,)
        );
}, this.config.timeout);

      child.on('close', (exitCode) => {
    ')        clearTimeout(timeoutId);

        if (exitCode === 0) {
          resolve({ stdout, stderr, exitCode});
} else {
          reject(
            this.createError('database',    'Database creation failed', {
    ')              exitCode,
              stderr,
              stdout,
})
          );
}
});

      child.on('error', (error) => {
    ')        clearTimeout(timeoutId);
        reject(
          this.createError('system',    'Failed to spawn CodeQL process', {
    ')            originalError:error.message,
})
        );
});
});

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
}
