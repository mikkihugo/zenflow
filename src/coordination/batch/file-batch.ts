/**
 * @file File Batch Operations
 * Implements concurrent file operations following claude-zen patterns.
 * Achieves significant performance improvements for file-heavy workflows.
 */

import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { getLogger } from '../../config/logging-config';
import type { BatchOperation } from './batch-engine';

const logger = getLogger('FileBatch');

export interface FileOperation {
  type: 'read' | 'write' | 'create' | 'delete' | 'copy' | 'move' | 'mkdir' | 'rmdir';
  path: string;
  content?: string;
  destination?: string; // for copy/move operations
  encoding?: BufferEncoding;
  mode?: number; // for mkdir operations
}

export interface FileOperationResult {
  operation: FileOperation;
  success: boolean;
  result?: string | boolean; // file content for read, success boolean for others
  error?: string;
  size?: number; // file size in bytes
  executionTime: number;
}

/**
 * Handles concurrent file operations with intelligent batching.
 * Implements claude-zen's file operation optimization patterns.
 *
 * @example
 */
export class FileBatchOperator {
  private readonly maxConcurrentFiles: number;
  private readonly defaultEncoding: BufferEncoding;

  constructor(maxConcurrentFiles = 10, defaultEncoding: BufferEncoding = 'utf8') {
    this.maxConcurrentFiles = maxConcurrentFiles;
    this.defaultEncoding = defaultEncoding;
  }

  /**
   * Execute multiple file operations concurrently.
   * Follows claude-zen's "1 MESSAGE = ALL OPERATIONS" principle for files.
   *
   * @param operations
   */
  async executeBatch(operations: FileOperation[]): Promise<FileOperationResult[]> {
    logger.info(`Starting batch file operations: ${operations.length} files`);

    // Group operations by type for optimization
    const groupedOps = this.groupOperationsByType(operations);

    // Execute operations with dependency awareness
    const results: FileOperationResult[] = [];

    // Create directories first (dependencies for other operations)
    if (groupedOps.mkdir.length > 0) {
      const mkdirResults = await this.executeConcurrentOperations(
        groupedOps.mkdir,
        this.executeMkdir.bind(this)
      );
      results.push(...mkdirResults);
    }

    // Execute read, write, create, copy, move operations concurrently
    const mainOperations = [
      ...groupedOps.read,
      ...groupedOps.write,
      ...groupedOps.create,
      ...groupedOps.copy,
      ...groupedOps.move,
    ];

    if (mainOperations.length > 0) {
      const mainResults = await this.executeConcurrentOperations(
        mainOperations,
        this.executeFileOperation.bind(this)
      );
      results.push(...mainResults);
    }

    // Execute delete and rmdir operations last (cleanup)
    const cleanupOperations = [...groupedOps.delete, ...groupedOps.rmdir];
    if (cleanupOperations.length > 0) {
      const cleanupResults = await this.executeConcurrentOperations(
        cleanupOperations,
        this.executeFileOperation.bind(this)
      );
      results.push(...cleanupResults);
    }

    logger.info(`Completed batch file operations: ${results.length} operations processed`);
    return results;
  }

  /**
   * Group operations by type for intelligent execution order.
   *
   * @param operations
   */
  private groupOperationsByType(
    operations: FileOperation[]
  ): Record<FileOperation['type'], FileOperation[]> {
    const groups: Record<FileOperation['type'], FileOperation[]> = {
      read: [],
      write: [],
      create: [],
      delete: [],
      copy: [],
      move: [],
      mkdir: [],
      rmdir: [],
    };

    for (const operation of operations) {
      groups[operation.type]?.push(operation);
    }

    return groups;
  }

  /**
   * Execute operations concurrently with controlled concurrency.
   *
   * @param operations
   * @param executor
   */
  private async executeConcurrentOperations<T>(
    operations: T[],
    executor: (operation: T) => Promise<FileOperationResult>
  ): Promise<FileOperationResult[]> {
    const results: FileOperationResult[] = [];

    // Process operations in chunks to control concurrency
    for (let i = 0; i < operations.length; i += this.maxConcurrentFiles) {
      const chunk = operations.slice(i, i + this.maxConcurrentFiles);
      const chunkPromises = chunk.map(executor);

      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults?.forEach((result, index) => {
        if (result?.status === 'fulfilled') {
          results.push(result?.value);
        } else {
          // Create error result for failed operations
          const operation = chunk[index] as FileOperation;
          results.push({
            operation,
            success: false,
            error: result?.reason?.message || 'Unknown error',
            executionTime: 0,
          });
        }
      });
    }

    return results;
  }

  /**
   * Execute a single file operation.
   *
   * @param operation
   */
  private async executeFileOperation(operation: FileOperation): Promise<FileOperationResult> {
    const startTime = Date.now();

    try {
      switch (operation.type) {
        case 'read':
          return await this.executeRead(operation, startTime);
        case 'write':
          return await this.executeWrite(operation, startTime);
        case 'create':
          return await this.executeCreate(operation, startTime);
        case 'delete':
          return await this.executeDelete(operation, startTime);
        case 'copy':
          return await this.executeCopy(operation, startTime);
        case 'move':
          return await this.executeMove(operation, startTime);
        case 'rmdir':
          return await this.executeRmdir(operation, startTime);
        default:
          throw new Error(`Unsupported operation type: ${operation.type}`);
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        operation,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime,
      };
    }
  }

  /**
   * Execute read operation.
   *
   * @param operation
   * @param startTime
   */
  private async executeRead(
    operation: FileOperation,
    startTime: number
  ): Promise<FileOperationResult> {
    const encoding = operation.encoding || this.defaultEncoding;
    const content = await fs.readFile(operation.path, encoding);
    const stats = await fs.stat(operation.path);

    return {
      operation,
      success: true,
      result: content,
      size: stats.size,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute write operation.
   *
   * @param operation
   * @param startTime
   */
  private async executeWrite(
    operation: FileOperation,
    startTime: number
  ): Promise<FileOperationResult> {
    if (!operation.content) {
      throw new Error('Write operation requires content');
    }

    // Ensure directory exists
    await this.ensureDirectoryExists(dirname(operation.path));

    const encoding = operation.encoding || this.defaultEncoding;
    await fs.writeFile(operation.path, operation.content, encoding);

    const stats = await fs.stat(operation.path);

    return {
      operation,
      success: true,
      result: true,
      size: stats.size,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute create operation (write with exclusive flag).
   *
   * @param operation
   * @param startTime
   */
  private async executeCreate(
    operation: FileOperation,
    startTime: number
  ): Promise<FileOperationResult> {
    if (!operation.content) {
      throw new Error('Create operation requires content');
    }

    // Ensure directory exists
    await this.ensureDirectoryExists(dirname(operation.path));

    const encoding = operation.encoding || this.defaultEncoding;
    await fs.writeFile(operation.path, operation.content, { encoding, flag: 'wx' });

    const stats = await fs.stat(operation.path);

    return {
      operation,
      success: true,
      result: true,
      size: stats.size,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute delete operation.
   *
   * @param operation
   * @param startTime
   */
  private async executeDelete(
    operation: FileOperation,
    startTime: number
  ): Promise<FileOperationResult> {
    await fs.unlink(operation.path);

    return {
      operation,
      success: true,
      result: true,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute copy operation.
   *
   * @param operation
   * @param startTime
   */
  private async executeCopy(
    operation: FileOperation,
    startTime: number
  ): Promise<FileOperationResult> {
    if (!operation.destination) {
      throw new Error('Copy operation requires destination');
    }

    // Ensure destination directory exists
    await this.ensureDirectoryExists(dirname(operation.destination));

    await fs.copyFile(operation.path, operation.destination);

    const stats = await fs.stat(operation.destination);

    return {
      operation,
      success: true,
      result: true,
      size: stats.size,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute move operation.
   *
   * @param operation
   * @param startTime
   */
  private async executeMove(
    operation: FileOperation,
    startTime: number
  ): Promise<FileOperationResult> {
    if (!operation.destination) {
      throw new Error('Move operation requires destination');
    }

    // Ensure destination directory exists
    await this.ensureDirectoryExists(dirname(operation.destination));

    await fs.rename(operation.path, operation.destination);

    const stats = await fs.stat(operation.destination);

    return {
      operation,
      success: true,
      result: true,
      size: stats.size,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute mkdir operation.
   *
   * @param operation
   */
  private async executeMkdir(operation: FileOperation): Promise<FileOperationResult> {
    const startTime = Date.now();

    try {
      await fs.mkdir(operation.path, {
        recursive: true,
        mode: operation.mode || 0o755,
      });

      return {
        operation,
        success: true,
        result: true,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      // Ignore error if directory already exists
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        return {
          operation,
          success: true,
          result: true,
          executionTime: Date.now() - startTime,
        };
      }
      throw error;
    }
  }

  /**
   * Execute rmdir operation.
   *
   * @param operation
   * @param startTime
   */
  private async executeRmdir(
    operation: FileOperation,
    startTime: number
  ): Promise<FileOperationResult> {
    await fs.rmdir(operation.path, { recursive: true });

    return {
      operation,
      success: true,
      result: true,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Ensure directory exists (create if necessary).
   *
   * @param dirPath.
   * @param dirPath
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Convert FileOperation to BatchOperation for use with BatchEngine.
   *
   * @param fileOps
   */
  static createBatchOperations(fileOps: FileOperation[]): BatchOperation[] {
    return fileOps.map((fileOp, index) => ({
      id: `file-${index}-${fileOp.type}-${Date.now()}`,
      type: 'file',
      operation: fileOp.type,
      params: {
        path: fileOp.path,
        content: fileOp.content,
        destination: fileOp.destination,
        encoding: fileOp.encoding,
        mode: fileOp.mode,
      },
    }));
  }

  /**
   * Create multiple file write operations for batch execution.
   * Implements claude-zen's "BatchWrite" pattern.
   *
   * @param files
   */
  static createWriteBatch(
    files: Array<{
      path: string;
      content: string;
      encoding?: BufferEncoding;
    }>
  ): FileOperation[] {
    return files.map((file) => {
      const operation: FileOperation = {
        type: 'write',
        path: file.path,
        content: file.content,
      };

      if (file.encoding !== undefined) {
        operation.encoding = file.encoding;
      }

      return operation;
    });
  }

  /**
   * Create project structure batch operations.
   * Implements claude-zen's project initialization pattern.
   *
   * @param basePath
   * @param structure
   */
  static createProjectStructure(
    basePath: string,
    structure: Record<string, string | null>
  ): FileOperation[] {
    const operations: FileOperation[] = [];
    const directories = new Set<string>();

    // Collect all directories that need to be created
    for (const filePath of Object.keys(structure)) {
      const fullPath = join(basePath, filePath);
      let currentDir = dirname(fullPath);

      while (currentDir !== basePath && currentDir !== '.') {
        directories.add(currentDir);
        currentDir = dirname(currentDir);
      }
    }

    // Add mkdir operations for directories
    for (const dir of Array.from(directories).sort()) {
      operations.push({
        type: 'mkdir',
        path: dir,
      });
    }

    // Add file operations
    for (const [filePath, content] of Object.entries(structure)) {
      const fullPath = join(basePath, filePath);

      if (content !== null) {
        operations.push({
          type: 'write',
          path: fullPath,
          content,
        });
      }
    }

    return operations;
  }

  /**
   * Validate file operations before execution.
   *
   * @param operations
   */
  static validateOperations(operations: FileOperation[]): string[] {
    const errors: string[] = [];

    for (const [index, operation] of operations.entries()) {
      const prefix = `Operation ${index} (${operation.type}):`;

      if (!operation.path) {
        errors.push(`${prefix} Missing required path`);
        continue;
      }

      switch (operation.type) {
        case 'write':
        case 'create':
          if (operation.content === undefined) {
            errors.push(`${prefix} Missing required content`);
          }
          break;

        case 'copy':
        case 'move':
          if (!operation.destination) {
            errors.push(`${prefix} Missing required destination`);
          }
          break;
      }
    }

    return errors;
  }
}
