/**
 * Memory Domain REST API Controller.
 * Provides comprehensive REST endpoints for memory management.
 *
 * @file Memory-controller.ts.
 * @description Enhanced memory controller with DI integration for Issue #63.
 */
import type {
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
    type: 'store | retrieve|delete';
    /** Key for the operation */
    key: string;
    /** Value for store operations */
    value?: unknown;
    /** Options for the operation */
    options?: MemoryRequest['options'];
  }>;
  /** Whether to stop on first error or continue */
  continueOnError?: boolean;
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
    status: 'healthy | warning|critical';
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
export declare class MemoryController {
  private _factory;
  private _config;
  private _logger;
  private backend;
  private performanceMetrics;
  constructor(
    _factory: MemoryProviderFactory,
    _config: MemoryConfig,
    _logger: Logger
  );
  /**
   * GET /api/memory/status.
   * Get memory system status and health information.
   */
  getMemoryStatus(): Promise<MemoryResponse>;
  /**
   * POST /api/memory/store.
   * Store data in memory with optional TTL and compression.
   *
   * @param request
   */
  storeMemory(request: MemoryRequest): Promise<MemoryResponse>;
  /**
   * GET /api/memory/retrieve/:key.
   * Retrieve data from memory by key.
   *
   * @param key
   */
  retrieveMemory(key: string): Promise<MemoryResponse>;
  /**
   * DELETE /api/memory/delete/:key.
   * Delete data from memory by key.
   *
   * @param key
   */
  deleteMemory(key: string): Promise<MemoryResponse>;
  /**
   * POST /api/memory/clear.
   * Clear all memory data.
   */
  clearMemory(): Promise<MemoryResponse>;
  /**
   * POST /api/memory/batch.
   * Perform multiple memory operations in a single request.
   *
   * @param request
   */
  batchOperations(request: MemoryBatchRequest): Promise<MemoryResponse>;
  /**
   * GET /api/memory/analytics.
   * Get comprehensive memory analytics and performance metrics.
   */
  getMemoryAnalytics(): Promise<MemoryResponse>;
  /**
   * Initialize the memory backend.
   */
  private initializeBackend;
  /**
   * Process value for storage (add metadata, compression, etc.).
   *
   * @param value
   * @param options
   */
  private processValueForStorage;
  /**
   * Process value from storage (decompress, check TTL, etc.).
   *
   * @param rawValue
   */
  private processValueFromStorage;
  /**
   * Update performance metrics.
   *
   * @param responseTime
   * @param success
   */
  private updateMetrics;
  /**
   * Calculate operations per second.
   */
  private calculateOperationsPerSecond;
}
interface Logger {
  info(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  debug(message: string): void;
}
export {};
//# sourceMappingURL=memory-controller.d.ts.map
