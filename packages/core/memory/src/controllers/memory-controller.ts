/**
 * Memory Domain REST API Controller.
 * Provides comprehensive REST endpoints for memory management.
 *
 * @file Memory-controller.ts.
 * @description Enhanced memory controller with DI integration for Issue #63.
 */

import { inject, injectable } from '../di/decorators/injectable';
import { CORE_TOKENS, MEMORY_TOKENS } from '../di/tokens/core-tokens';
import type {
  MemoryBackend,
  MemoryConfig,
  MemoryProviderFactory,
} from '../providers/memory-providers';

/**
 * Request interface for memory operations.
 *
 * @example
 */
export interface MemoryRequest {
  /** Key for the memory entry */
  key: string;
  /** Value to store (optional for retrieval/delete operations) */
  value?: unknown;
  /** Additional options for the operation */
  options?: {
    /** Time-to-live in milliseconds */
    ttl?: number;
    /** Enable compression for this entry */
    compress?: boolean;
    /** Metadata to store with the entry */
    metadata?: Record<string, unknown>;
  };
}

/**
 * Response interface for memory operations.
 *
 * @example
 */
export interface MemoryResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Response data (varies by operation) */
  data?: unknown;
  /** Error message if operation failed */
  error?: string;
  /** Operation metadata and statistics */
  metadata?: {
    /** Current total size of memory store */
    size: number;
    /** Timestamp of the operation */
    timestamp: number;
    /** Execution time in milliseconds */
    executionTime?: number;
    /** Backend type used */
    backend?: string;
  };
}

/**
 * Batch operation request.
 *
 * @example
 */
export interface MemoryBatchRequest {
  /** Array of operations to perform */
  operations: Array<{
    /** Type of operation */
    type: 'store' | 'retrieve' | 'delete';
    /** Key for the operation */
    key: string;
    /** Value for store operations */
    value?: unknown;
    /** Options for the operation */
    options?:MemoryRequest['options'];
  }>;
  /** Whether to stop on first error or continue */
  continueOnError?: boolean;
}

/** Single batch operation type */
type BatchOperation = MemoryBatchRequest['operations'][0];

/** Result of a single batch operation */
interface BatchOperationResult {
  operation: string;
  key: string;
  success?: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Memory analytics response.
 *
 * @example
 */
export interface MemoryAnalytics {
  /** Total number of keys stored */
  totalKeys: number;
  /** Backend type being used */
  backend: string;
  /** Performance metrics */
  performance: {
    /** Average response time in milliseconds */
    averageResponseTime: number;
    /** Success rate percentage */
    successRate: number;
    /** Error rate percentage */
    errorRate: number;
    /** Operations per second */
    operationsPerSecond: number;
  };
  /** Memory usage statistics */
  usage: {
    /** Current memory used in bytes */
    memoryUsed: number;
    /** Maximum memory limit (-1 for unlimited) */
    maxMemory: number;
    /** Memory utilization percentage */
    utilizationPercent: number;
  };
  /** System health information */
  health: {
    /** Overall health status */
    status: 'healthy|warning|critical';
    /** System uptime in seconds */
    uptime: number;
    /** Last health check timestamp */
    lastHealthCheck: number;
  };
}

/**
 * Memory REST API Controller.
 * Provides comprehensive memory management through REST endpoints.
 *
 * @example
 */
@injectable
export class MemoryController {
  private backend: MemoryBackend;
  private performanceMetrics = {
    operationCount: 0,
    totalResponseTime: 0,
    errorCount: 0,
    startTime: Date.now(),
  };

  constructor(
    @inject(MEMORY_TOKENS.ProviderFactory)
    private _factory: MemoryProviderFactory,
    @inject(MEMORY_TOKENS.Config) private _config: MemoryConfig,
    @inject(CORE_TOKENS.Logger) private _logger: Logger
  ) {
    this.initializeBackend();
  }

  /**
   * Helper to get error message from unknown error
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  /**
   * GET /api/memory/status.
   * Get memory system status and health information.
   */
  async getMemoryStatus(): Promise<MemoryResponse> {
    const startTime = Date.now();

    try {
      this._logger.debug('Getting memory system status');

      const [size, isHealthy] = await Promise.all([
        this.backend.size(),
        this.backend.health(),
      ]);

      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      return {
        success: true,
        data: {
          status: isHealthy ? 'healthy' : ' unhealthy',
          totalKeys: size,
          backend: this._config.type,
          uptime: Math.floor(
            (Date.now() - this.performanceMetrics.startTime) / 1000
          ),
          configuration: {
            type: this._config.type,
            maxSize: this._config.maxSize || -1,
            ttl: this._config.ttl || 0,
            compression: this._config.compression,
          },
        },
        metadata: {
          size,
          timestamp: Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      this._logger.error(`Failed to get memory status:${error}`);

      return {
        success:false,
        error:`Failed to get memory status: ${this.getErrorMessage(error)}`,
        metadata:{
          size:0,
          timestamp:Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    }
  }

  /**
   * POST /api/memory/store.
   * Store data in memory with optional TTL and compression.
   *
   * @param request
   */
  async storeMemory(request: MemoryRequest): Promise<MemoryResponse> {
    const startTime = Date.now();

    try {
      this._logger.debug(`Storing memory key:${request.key}`);

      if (!request.key) {
        throw new Error('Key is required for store operation');
      }

      if (request.value === undefined) {
        throw new Error('Value is required for store operation');
      }

      // Process value with options (TTL, compression, etc.)
      const processedValue = this.processValueForStorage(
        request.value,
        request.options
      );

      await this.backend.store(request.key, processedValue);
      const size = await this.backend.size();

      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      this._logger.debug(`Successfully stored key:${request.key}`);

      return {
        success: true,
        data: {
          key: request.key,
          stored: true,
          compressed: request.options?.compress,
          ttl: request.options?.ttl || 0,
        },
        metadata: {
          size,
          timestamp: Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      this._logger.error(`Failed to store memory key ${request.key}:${error}`);

      return {
        success:false,
        error:`Failed to store memory: ${this.getErrorMessage(error)}`,
        metadata:{
          size:0,
          timestamp:Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    }
  }

  /**
   * GET /api/memory/retrieve/:key.
   * Retrieve data from memory by key.
   *
   * @param key
   */
  async retrieveMemory(key: string): Promise<MemoryResponse> {
    const startTime = Date.now();

    try {
      this._logger.debug(`Retrieving memory key:${key}`);

      if (!key) {
        throw new Error('Key is required for retrieve operation');
      }

      const rawValue = await this.backend.retrieve(key);
      const processedValue = this.processValueFromStorage(rawValue);
      const size = await this.backend.size();

      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      this._logger.debug(`Successfully retrieved key:${key}`);

      return {
        success: true,
        data: {
          key,
          value: processedValue?.value,
          exists: rawValue !== undefined,
          metadata: processedValue?.metadata || {},
          retrieved: true,
        },
        metadata: {
          size,
          timestamp: Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      this._logger.error(`Failed to retrieve memory key ${key}:${error}`);

      return {
        success:false,
        error:`Failed to retrieve memory: ${this.getErrorMessage(error)}`,
        metadata:{
          size:0,
          timestamp:Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    }
  }

  /**
   * DELETE /api/memory/delete/:key.
   * Delete data from memory by key.
   *
   * @param key
   */
  async deleteMemory(key: string): Promise<MemoryResponse> {
    const startTime = Date.now();

    try {
      this._logger.debug(`Deleting memory key:${key}`);

      if (!key) {
        throw new Error('Key is required for delete operation');
      }

      await this.backend.delete(key);
      const size = await this.backend.size();

      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      this._logger.debug(`Successfully deleted key:${key}`);

      return {
        success: true,
        data: {
          key,
          deleted: true,
        },
        metadata: {
          size,
          timestamp: Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      this._logger.error(`Failed to delete memory key ${key}:${error}`);

      return {
        success:false,
        error:`Failed to delete memory: ${this.getErrorMessage(error)}`,
        metadata:{
          size:0,
          timestamp:Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    }
  }

  /**
   * POST /api/memory/clear.
   * Clear all memory data.
   */
  async clearMemory(): Promise<MemoryResponse> {
    const startTime = Date.now();

    try {
      this._logger.info('Clearing all memory data');

      await this.backend.clear();

      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      this._logger.info('Successfully cleared all memory data');

      return {
        success: true,
        data: {
          cleared: true,
          totalKeys: 0,
        },
        metadata: {
          size: 0,
          timestamp: Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      this._logger.error(`Failed to clear memory:${error}`);

      return {
        success:false,
        error:`Failed to clear memory: ${this.getErrorMessage(error)}`,
        metadata:{
          size:0,
          timestamp:Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    }
  }

  /**
   * Handle batch operation result and determine if processing should continue
   */
  private handleBatchResult(result: BatchOperationResult, request: MemoryBatchRequest): boolean {
    return !result.success && !request.continueOnError;
  }
  private handleBatchError(operation: BatchOperation, error: unknown, request: MemoryBatchRequest, results: BatchOperationResult[]): boolean {
    results.push({
      operation: operation.type,
      key: operation.key,
      success: false,
      error: this.getErrorMessage(error),
    });

    return !request.continueOnError;
  }
  private async processBatchOperation(operation: BatchOperation): Promise<BatchOperationResult> {
    let result;

    switch (operation.type) {
      case 'store':
        result = await this.storeMemory({
          key:operation.key,
          value:operation.value,
          options:operation.options,
        });
        break;
      case 'retrieve':
        result = await this.retrieveMemory(operation.key);
        break;
      case 'delete':
        result = await this.deleteMemory(operation.key);
        break;
      default:
        throw new Error(`Unsupported operation type:${operation.type}`);
    }

    return {
      operation:operation.type,
      key:operation.key,
      success:result?.success,
      data:result?.data,
      error:result?.error,
    };
  }

  /**
   * POST /api/memory/batch.
   * Perform multiple memory operations in a single request.
   *
   * @param request
   */
  async batchOperations(request: MemoryBatchRequest): Promise<MemoryResponse> {
    const startTime = Date.now();

    try {
      this._logger.debug(
        `Executing batch operations:${request.operations.length} operations`
      );

      const results = [];
      let errorCount = 0;

      for (const operation of request.operations) {
        try {
          const result = await this.processBatchOperation(operation);
          results.push(result);

          if (!result.success) {
            errorCount++;
          }
          
          if (this.handleBatchResult(result, request)) {
            break;
          }
        } catch (error) {
          errorCount++;
          const shouldStop = this.handleBatchError(operation, error, request, results);
          if (shouldStop) {
            break;
          }
        }
      }

      const size = await this.backend.size();
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, errorCount === 0);

      this._logger.debug(
        `Batch operations completed:${results.length} operations, ${errorCount} errors`
      );

      return {
        success: errorCount === 0,
        data: {
          results,
          totalOperations: request.operations.length,
          successfulOperations: results.length - errorCount,
          failedOperations: errorCount,
        },
        metadata: {
          size,
          timestamp: Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      this._logger.error(`Batch operations failed:${error}`);

      return {
        success:false,
        error:`Batch operations failed: ${this.getErrorMessage(error)}`,
        metadata:{
          size:0,
          timestamp:Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    }
  }

  /**
   * GET /api/memory/analytics.
   * Get comprehensive memory analytics and performance metrics.
   */
  async getMemoryAnalytics(): Promise<MemoryResponse> {
    const startTime = Date.now();

    try {
      this._logger.debug('Getting memory analytics');

      const size = await this.backend.size();
      const isHealthy = await this.backend.health();

      const analytics: MemoryAnalytics = {
        totalKeys: size,
        backend: this._config.type,
        performance: {
          averageResponseTime:
            this.performanceMetrics.operationCount > 0
              ? this.performanceMetrics.totalResponseTime /
                this.performanceMetrics.operationCount
              : 0,
          successRate:
            this.performanceMetrics.operationCount > 0
              ? ((this.performanceMetrics.operationCount -
                  this.performanceMetrics.errorCount) /
                  this.performanceMetrics.operationCount) *
                100
              : 100,
          errorRate:
            this.performanceMetrics.operationCount > 0
              ? (this.performanceMetrics.errorCount /
                  this.performanceMetrics.operationCount) *
                100
              : 0,
          operationsPerSecond: this.calculateOperationsPerSecond(),
        },
        usage: {
          memoryUsed: process.memoryUsage().heapUsed,
          maxMemory: this._config.maxSize || -1,
          utilizationPercent: this._config.maxSize
            ? (size / this._config.maxSize) * 100
            : 0,
        },
        health: {
          status: isHealthy ? 'healthy' : ' critical',
          uptime: Math.floor(
            (Date.now() - this.performanceMetrics.startTime) / 1000
          ),
          lastHealthCheck: Date.now(),
        },
      };

      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      return {
        success: true,
        data: analytics,
        metadata: {
          size,
          timestamp: Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      this._logger.error(`Failed to get analytics:${error}`);

      return {
        success:false,
        error:`Failed to get analytics: ${this.getErrorMessage(error)}`,
        metadata:{
          size:0,
          timestamp:Date.now(),
          executionTime,
          backend: this._config.type,
        },
      };
    }
  }

  /**
   * Initialize the memory backend.
   */
  private initializeBackend(): void {
    try {
      this.backend = this._factory.createProvider(this._config);
      this._logger.info(
        `Memory controller initialized with ${this._config.type} backend`
      );
    } catch (error) {
      this._logger.error(`Failed to initialize memory backend:${error}`);
      throw error;
    }
  }

  /**
   * Process value for storage (add metadata, compression, etc.).
   *
   * @param value
   * @param options
   */
  private processValueForStorage(
    value: unknown,
    options?: MemoryRequest['options']
  ): unknown {
    const processed = {
      value,
      metadata: {
        storedAt: Date.now(),
        ttl: options?.ttl || 0,
        compressed: options?.compress,
        originalSize: 0, // Will be set below if compression is enabled
        ...options?.metadata,
      },
    };

    // Add compression logic here if needed
    if (options?.compress) {
      // Compression implementation would go here
      processed.metadata.originalSize = JSON.stringify(value).length;
    }

    return processed;
  }

  /**
   * Process value from storage (decompress, check TTL, etc.).
   *
   * @param rawValue
   */
  private processValueFromStorage(rawValue: unknown): unknown {
    if (!rawValue || typeof rawValue !== 'object') {
      return { value: rawValue, metadata: {} };
    }

    // Check TTL expiration
    if (rawValue.metadata?.ttl && rawValue.metadata?.storedAt) {
      const now = Date.now();
      const expiration = rawValue.metadata.storedAt + rawValue.metadata.ttl;
      if (now > expiration) {
        return { value: undefined, metadata: { expired: true } };
      }
    }

    // Add decompression logic here if needed
    if (rawValue.metadata?.compressed) {
      // Decompression implementation would go here
    }

    return rawValue;
  }

  /**
   * Update performance metrics.
   *
   * @param responseTime
   * @param success
   */
  private updateMetrics(responseTime: number, success: boolean): void {
    this.performanceMetrics.operationCount++;
    this.performanceMetrics.totalResponseTime += responseTime;
    if (!success) {
      this.performanceMetrics.errorCount++;
    }
  }

  /**
   * Calculate operations per second.
   */
  private calculateOperationsPerSecond(): number {
    const uptimeSeconds =
      (Date.now() - this.performanceMetrics.startTime) / 1000;
    return uptimeSeconds > 0
      ? this.performanceMetrics.operationCount / uptimeSeconds
      : 0;
  }
}

// Type definitions for DI integration
interface Logger {
  info(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  debug(message: string): void;
}
