/**
 * @file File Batch Operations
 * Implements concurrent file operations following claude-zen patterns.
 * Achieves significant performance improvements for file-heavy workflows.
 */
import type { BatchOperation } from './batch-engine.ts';
export interface FileOperation {
    type: 'read' | 'write' | 'create' | 'delete' | 'copy' | 'move' | 'mkdir' | 'rmdir';
    path: string;
    content?: string;
    destination?: string;
    encoding?: BufferEncoding;
    mode?: number;
}
export interface FileOperationResult {
    operation: FileOperation;
    success: boolean;
    result?: string | boolean;
    error?: string;
    size?: number;
    executionTime: number;
}
/**
 * Handles concurrent file operations with intelligent batching.
 * Implements claude-zen's file operation optimization patterns.
 *
 * @example
 */
export declare class FileBatchOperator {
    private readonly maxConcurrentFiles;
    private readonly defaultEncoding;
    constructor(maxConcurrentFiles?: number, defaultEncoding?: BufferEncoding);
    /**
     * Execute multiple file operations concurrently.
     * Follows claude-zen's "1 MESSAGE = ALL OPERATIONS" principle for files.
     *
     * @param operations
     */
    executeBatch(operations: FileOperation[]): Promise<FileOperationResult[]>;
    /**
     * Group operations by type for intelligent execution order.
     *
     * @param operations
     */
    private groupOperationsByType;
    /**
     * Execute operations concurrently with controlled concurrency.
     *
     * @param operations
     * @param executor
     */
    private executeConcurrentOperations;
    /**
     * Execute a single file operation.
     *
     * @param operation
     */
    private executeFileOperation;
    /**
     * Execute read operation.
     *
     * @param operation
     * @param startTime
     */
    private executeRead;
    /**
     * Execute write operation.
     *
     * @param operation
     * @param startTime
     */
    private executeWrite;
    /**
     * Execute create operation (write with exclusive flag).
     *
     * @param operation
     * @param startTime
     */
    private executeCreate;
    /**
     * Execute delete operation.
     *
     * @param operation
     * @param startTime
     */
    private executeDelete;
    /**
     * Execute copy operation.
     *
     * @param operation
     * @param startTime
     */
    private executeCopy;
    /**
     * Execute move operation.
     *
     * @param operation
     * @param startTime
     */
    private executeMove;
    /**
     * Execute mkdir operation.
     *
     * @param operation
     */
    private executeMkdir;
    /**
     * Execute rmdir operation.
     *
     * @param operation
     * @param startTime
     */
    private executeRmdir;
    /**
     * Ensure directory exists (create if necessary).
     *
     * @param dirPath.
     * @param dirPath
     */
    private ensureDirectoryExists;
    /**
     * Convert FileOperation to BatchOperation for use with BatchEngine.
     *
     * @param fileOps
     */
    static createBatchOperations(fileOps: FileOperation[]): BatchOperation[];
    /**
     * Create multiple file write operations for batch execution.
     * Implements claude-zen's "BatchWrite" pattern.
     *
     * @param files
     */
    static createWriteBatch(files: Array<{
        path: string;
        content: string;
        encoding?: BufferEncoding;
    }>): FileOperation[];
    /**
     * Create project structure batch operations.
     * Implements claude-zen's project initialization pattern.
     *
     * @param basePath
     * @param structure
     */
    static createProjectStructure(basePath: string, structure: Record<string, string | null>): FileOperation[];
    /**
     * Validate file operations before execution.
     *
     * @param operations
     */
    static validateOperations(operations: FileOperation[]): string[];
}
//# sourceMappingURL=file-batch.d.ts.map