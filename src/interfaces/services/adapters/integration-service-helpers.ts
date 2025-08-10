/**
 * USL Integration Service Helpers and Utilities.
 *
 * Provides helper functions and utilities for working with IntegrationServiceAdapter.
 * Instances, including common operations, batch processing, validation helpers,
 * and specialized integration patterns.
 */
/**
 * @file Interface implementation: integration-service-helpers.
 */

import { getLogger } from '../../../config/logging-config';
import type { ArchitectureDesign } from '../../../types/shared-types';
import type { APIResult } from '../../types/shared-types';
import type {
  IntegrationServiceAdapter,
  IntegrationServiceAdapterConfig,
} from './integration-service-adapter';

/**
 * Integration operation result type.
 *
 * @example
 */
export interface IntegrationOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    duration: number;
    timestamp: Date;
    operationId: string;
    retryCount?: number;
    cacheHit?: boolean;
  };
}

/**
 * Batch integration operation configuration.
 *
 * @example
 */
export interface BatchIntegrationConfig {
  /** Maximum number of operations to run concurrently */
  maxConcurrency?: number;
  /** Whether to fail fast on first error or continue with remaining operations */
  failFast?: boolean;
  /** Operation timeout in milliseconds */
  operationTimeout?: number;
  /** Whether to use caching for batch operations */
  enableCaching?: boolean;
  /** Whether to deduplicate similar operations */
  enableDeduplication?: boolean;
}

/**
 * Architecture operation configuration.
 *
 * @example
 */
export interface ArchitectureOperationConfig {
  /** Whether to enable versioning for the operation */
  enableVersioning?: boolean;
  /** Whether to validate the architecture before saving */
  validateBeforeSave?: boolean;
  /** Custom validation rules */
  customValidation?: (architecture: ArchitectureDesign) => Promise<boolean>;
  /** Project ID to associate with the architecture */
  projectId?: string;
  /** Tags to apply to the architecture */
  tags?: string[];
}

/**
 * API operation configuration.
 *
 * @example
 */
export interface APIOperationConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
  /** Whether to validate request before sending */
  validateRequest?: boolean;
  /** Whether to sanitize response after receiving */
  sanitizeResponse?: boolean;
  /** Custom headers to include */
  headers?: Record<string, string>;
  /** Request rate limiting configuration */
  rateLimit?: {
    requestsPerSecond: number;
    burstSize: number;
  };
}

/**
 * Protocol operation configuration.
 *
 * @example
 */
export interface ProtocolOperationConfig {
  /** Protocol to use for the operation */
  protocol?: string;
  /** Whether to enable connection pooling */
  useConnectionPooling?: boolean;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Whether to enable automatic failover */
  enableFailover?: boolean;
  /** Health check configuration */
  healthCheck?: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
}

/**
 * Integration Service Helper Class.
 *
 * Provides high-level helper methods for common integration operations.
 * Across Architecture Storage, Safe API, and Protocol Management..
 *
 * @example
 */
export class IntegrationServiceHelper {
  private logger: any;

  constructor(private adapter: IntegrationServiceAdapter) {
    this.logger = getLogger(`IntegrationServiceHelper:${adapter.name}`);
  }

  // ============================================
  // Architecture Storage Helper Methods
  // ============================================

  /**
   * Save architecture with enhanced options.
   *
   * @param architecture
   * @param config
   */
  async saveArchitectureEnhanced(
    architecture: ArchitectureDesign,
    config: ArchitectureOperationConfig = {}
  ): Promise<IntegrationOperationResult<string>> {
    try {
      // Apply custom validation if specified
      if (config?.customValidation) {
        const isValid = await config?.customValidation(architecture);
        if (!isValid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Custom validation failed for architecture',
            },
          };
        }
      }

      // Apply tags if specified
      if (config?.tags) {
        architecture.metadata = {
          ...architecture.metadata,
          tags: config?.tags,
        };
      }

      const result = await this.adapter.execute<string>('architecture-save', {
        architecture,
        projectId: config?.projectId,
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SAVE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      };
    }
  }

  /**
   * Batch save multiple architectures.
   *
   * @param architectures
   * @param batchConfig
   */
  async batchSaveArchitectures(
    architectures: { architecture: ArchitectureDesign; config?: ArchitectureOperationConfig }[],
    batchConfig: BatchIntegrationConfig = {}
  ): Promise<IntegrationOperationResult<string[]>> {
    const { maxConcurrency = 5, failFast = false, operationTimeout = 30000 } = batchConfig;

    const results: (string | null)[] = [];
    const errors: any[] = [];

    try {
      // Process architectures in batches
      for (let i = 0; i < architectures.length; i += maxConcurrency) {
        const batch = architectures.slice(i, i + maxConcurrency);

        const batchPromises = batch.map(async ({ architecture, config = {} }) => {
          try {
            const result = await Promise.race([
              this.saveArchitectureEnhanced(architecture, config),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Operation timeout')), operationTimeout)
              ),
            ]);

            if (result?.success) {
              return result?.data || null;
            } else {
              errors.push(result?.error);
              if (failFast) throw new Error(result?.error?.message || 'Batch operation failed');
              return null;
            }
          } catch (error) {
            errors.push(error);
            if (failFast) throw error;
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      const successfulResults = results.filter((r) => r !== null) as string[];

      return {
        success: errors.length === 0 || !failFast,
        data: successfulResults,
        error:
          errors.length > 0
            ? {
                code: 'BATCH_PARTIAL_FAILURE',
                message: `${errors.length} operations failed out of ${architectures.length}`,
                details: errors,
              }
            : undefined,
      } as IntegrationOperationResult<string[]>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_ERROR',
          message: error instanceof Error ? error.message : 'Batch operation failed',
          details: { processedCount: results.length, errors },
        },
      };
    }
  }

  /**
   * Search architectures with enhanced filtering.
   *
   * @param criteria
   * @param criteria.domain
   * @param criteria.tags
   * @param criteria.minScore
   * @param criteria.limit
   * @param criteria.projectId
   * @param criteria.dateRange
   * @param criteria.dateRange.start
   * @param criteria.dateRange.end
   */
  async searchArchitecturesEnhanced(criteria: {
    domain?: string;
    tags?: string[];
    minScore?: number;
    limit?: number;
    projectId?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  }): Promise<IntegrationOperationResult<ArchitectureDesign[]>> {
    try {
      const result = await this.adapter.execute<ArchitectureDesign[]>('architecture-search', {
        criteria,
      });

      // Additional client-side filtering if needed
      if (result?.success && result?.data && criteria.dateRange) {
        const { start, end } = criteria.dateRange;
        result.data = result?.data?.filter((arch) => {
          const createdAt = new Date(arch.createdAt || Date.now());
          return createdAt >= start && createdAt <= end;
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Search operation failed',
        },
      };
    }
  }

  // ============================================
  // Safe API Helper Methods
  // ============================================

  /**
   * Enhanced API request with comprehensive configuration.
   *
   * @param method
   * @param endpoint
   * @param data
   * @param config
   */
  async apiRequestEnhanced<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    config: APIOperationConfig = {}
  ): Promise<IntegrationOperationResult<T>> {
    try {
      const operation = `api-${method.toLowerCase()}`;
      const params = {
        endpoint,
        data,
        options: {
          timeout: config?.timeout,
          retries: config?.retries,
          headers: config?.headers,
        },
      };

      const result = await this.adapter.execute<APIResult<T>>(operation, params);

      if (result?.success && result?.data) {
        // Extract data from APIResult wrapper
        const apiResult = result?.data;
        if (apiResult?.success) {
          return {
            success: true,
            data: apiResult?.data,
            metadata: result?.metadata,
          } as IntegrationOperationResult<T>;
        } else {
          return {
            success: false,
            error: {
              code: apiResult?.error?.code || 'API_ERROR',
              message: apiResult?.error?.message || 'API request failed',
              details: apiResult?.error?.details,
            },
            metadata: result?.metadata,
          } as IntegrationOperationResult<T>;
        }
      }

      return result as IntegrationOperationResult<T>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: error instanceof Error ? error.message : 'API request failed',
        },
      };
    }
  }

  /**
   * Batch API requests with intelligent concurrency control.
   *
   * @param requests
   * @param batchConfig
   */
  async batchAPIRequests<T>(
    requests: Array<{
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      endpoint: string;
      data?: any;
      config?: APIOperationConfig;
    }>,
    batchConfig: BatchIntegrationConfig = {}
  ): Promise<IntegrationOperationResult<T[]>> {
    const { maxConcurrency = 10, failFast = false, operationTimeout = 30000 } = batchConfig;

    const results: (T | null)[] = [];
    const errors: any[] = [];

    try {
      // Process requests in batches
      for (let i = 0; i < requests.length; i += maxConcurrency) {
        const batch = requests.slice(i, i + maxConcurrency);

        const batchPromises = batch.map(async (request) => {
          try {
            const result = await Promise.race([
              this.apiRequestEnhanced<T>(
                request.method,
                request.endpoint,
                request.data,
                request.config
              ),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), operationTimeout)
              ),
            ]);

            if (result?.success) {
              return result?.data || null;
            } else {
              errors.push(result?.error);
              if (failFast) throw new Error(result?.error?.message || 'Batch request failed');
              return null;
            }
          } catch (error) {
            errors.push(error);
            if (failFast) throw error;
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      const successfulResults = results.filter((r) => r !== null) as T[];

      return {
        success: errors.length === 0 || !failFast,
        data: successfulResults,
        error:
          errors.length > 0
            ? {
                code: 'BATCH_API_PARTIAL_FAILURE',
                message: `${errors.length} requests failed out of ${requests.length}`,
                details: errors,
              }
            : undefined,
      } as IntegrationOperationResult<T[]>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_API_ERROR',
          message: error instanceof Error ? error.message : 'Batch API operation failed',
          details: { processedCount: results.length, errors },
        },
      };
    }
  }

  /**
   * Resource management with CRUD operations.
   *
   * @param operation
   * @param endpoint
   * @param data
   * @param data.id
   * @param data.resourceData
   * @param data.queryParams
   * @param config
   * @param _config
   */
  async manageResource<T>(
    operation: 'create' | 'read' | 'update' | 'delete' | 'list',
    endpoint: string,
    data?: {
      id?: string | number;
      resourceData?: any;
      queryParams?: Record<string, any>;
    },
    _config: APIOperationConfig = {}
  ): Promise<IntegrationOperationResult<T>> {
    try {
      let operationName: string;
      let params: any;

      switch (operation) {
        case 'create':
          operationName = 'api-create-resource';
          params = { endpoint, data: data?.resourceData };
          break;
        case 'read':
          operationName = 'api-get-resource';
          params = { endpoint, id: data?.id };
          break;
        case 'update':
          operationName = 'api-update-resource';
          params = { endpoint, id: data?.id, data: data?.resourceData };
          break;
        case 'delete':
          operationName = 'api-delete-resource';
          params = { endpoint, id: data?.id };
          break;
        case 'list':
          operationName = 'api-list-resources';
          params = { endpoint, queryParams: data?.queryParams };
          break;
        default:
          throw new Error(`Unknown resource operation: ${operation}`);
      }

      return await this.adapter.execute<T>(operationName, params);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESOURCE_MANAGEMENT_ERROR',
          message: error instanceof Error ? error.message : 'Resource operation failed',
        },
      };
    }
  }

  // ============================================
  // Protocol Management Helper Methods
  // ============================================

  /**
   * Enhanced protocol communication.
   *
   * @param operation
   * @param config
   */
  async protocolCommunicate<T>(
    operation: 'connect' | 'disconnect' | 'send' | 'receive' | 'broadcast',
    config: ProtocolOperationConfig & {
      message?: any;
      protocols?: string[];
      timeout?: number;
    } = {}
  ): Promise<IntegrationOperationResult<T>> {
    try {
      let operationName: string;
      let params: any;

      switch (operation) {
        case 'connect':
          operationName = 'protocol-connect';
          params = {
            protocol: config?.protocol,
            config: {
              timeout: config?.connectionTimeout,
              usePooling: config?.useConnectionPooling,
            },
          };
          break;
        case 'disconnect':
          operationName = 'protocol-disconnect';
          params = { protocol: config?.protocol };
          break;
        case 'send':
          operationName = 'protocol-send';
          params = { protocol: config?.protocol, message: config?.message };
          break;
        case 'receive':
          operationName = 'protocol-receive';
          params = { protocol: config?.protocol, timeout: config?.timeout };
          break;
        case 'broadcast':
          operationName = 'protocol-broadcast';
          params = { message: config?.message, protocols: config?.protocols };
          break;
        default:
          throw new Error(`Unknown protocol operation: ${operation}`);
      }

      return await this.adapter.execute<T>(operationName, params);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROTOCOL_COMMUNICATION_ERROR',
          message: error instanceof Error ? error.message : 'Protocol operation failed',
        },
      };
    }
  }

  /**
   * Protocol health monitoring.
   *
   * @param protocols
   */
  async monitorProtocolHealth(protocols?: string[]): Promise<
    IntegrationOperationResult<
      Record<
        string,
        {
          status: 'healthy' | 'degraded' | 'unhealthy';
          latency: number;
          lastCheck: Date;
          errorCount: number;
        }
      >
    >
  > {
    try {
      let targetProtocols: string[];
      if (protocols) {
        targetProtocols = protocols;
      } else {
        const protocolListResult = await this.adapter.execute<string[]>('protocol-list');
        if (!protocolListResult?.success || !protocolListResult?.data) {
          throw new Error('Failed to get protocol list');
        }
        targetProtocols = protocolListResult.data;
      }

      const healthResults: Record<string, any> = {};

      for (const protocol of targetProtocols) {
        try {
          const startTime = Date.now();
          const healthResult = await this.adapter.execute<boolean>('protocol-health-check', {
            protocol,
          });
          const latency = Date.now() - startTime;

          healthResults[protocol] = {
            status: healthResult?.success ? 'healthy' : 'unhealthy',
            latency,
            lastCheck: new Date(),
            errorCount: healthResult?.success ? 0 : 1,
          };
        } catch (_error) {
          healthResults[protocol] = {
            status: 'unhealthy',
            latency: -1,
            lastCheck: new Date(),
            errorCount: 1,
          };
        }
      }

      return {
        success: true,
        data: healthResults,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROTOCOL_HEALTH_MONITOR_ERROR',
          message: error instanceof Error ? error.message : 'Protocol health monitoring failed',
        },
      };
    }
  }

  // ============================================
  // Utility Helper Methods
  // ============================================

  /**
   * Get comprehensive service statistics.
   */
  async getServiceStatistics(): Promise<
    IntegrationOperationResult<{
      service: {
        name: string;
        type: string;
        uptime: number;
        operationCount: number;
        errorRate: number;
      };
      cache: {
        size: number;
        hitRate: number;
        memoryUsage: number;
      };
      protocols: Record<string, any>;
      endpoints: Record<string, any>;
    }>
  > {
    try {
      const [serviceStats, cacheStats, protocolMetrics, endpointMetrics] = await Promise.all([
        this.adapter.execute('service-stats'),
        this.adapter.execute('cache-stats'),
        this.adapter.execute('protocol-metrics'),
        this.adapter.execute('endpoint-metrics'),
      ]);

      const statistics = {
        service: {
          name: this.adapter.name,
          type: this.adapter.type,
          uptime: serviceStats.data?.uptime || 0,
          operationCount: serviceStats.data?.operationCount || 0,
          errorRate: serviceStats.data?.errorRate || 0,
        },
        cache: {
          size: cacheStats.data?.size || 0,
          hitRate: cacheStats.data?.hitRate || 0,
          memoryUsage: cacheStats.data?.memoryUsage || 0,
        },
        protocols: protocolMetrics.success ? protocolMetrics.data : {},
        endpoints: endpointMetrics.success ? endpointMetrics.data : {},
      };

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATISTICS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get service statistics',
        },
      };
    }
  }

  /**
   * Validate service configuration.
   */
  async validateConfiguration(): Promise<
    IntegrationOperationResult<{
      valid: boolean;
      issues: Array<{
        severity: 'warning' | 'error';
        component: string;
        message: string;
        suggestion?: string;
      }>;
    }>
  > {
    const issues: Array<{
      severity: 'warning' | 'error';
      component: string;
      message: string;
      suggestion?: string;
    }> = [];

    try {
      // Check if service is ready
      if (!this.adapter.isReady()) {
        issues.push({
          severity: 'error',
          component: 'service',
          message: 'Service is not in ready state',
          suggestion: 'Ensure service is properly initialized and started',
        });
      }

      // Check cache configuration
      const cacheStats = await this.adapter.execute('cache-stats');
      if (cacheStats.success && cacheStats.data) {
        const { size, maxSize } = cacheStats.data;
        if (size > maxSize * 0.9) {
          issues.push({
            severity: 'warning',
            component: 'cache',
            message: 'Cache utilization is high (>90%)',
            suggestion: 'Consider increasing cache size or implementing better eviction policies',
          });
        }
      }

      // Check protocol health
      const protocolMetrics = await this.adapter.execute('protocol-metrics');
      if (protocolMetrics.success && protocolMetrics.data) {
        const protocols = protocolMetrics.data as any[];
        protocols.forEach((protocol) => {
          if (protocol.status !== 'healthy') {
            issues.push({
              severity: 'error',
              component: 'protocol',
              message: `Protocol ${protocol.protocol} is ${protocol.status}`,
              suggestion: 'Check protocol configuration and network connectivity',
            });
          }
        });
      }

      return {
        success: true,
        data: {
          valid: issues.filter((i) => i.severity === 'error').length === 0,
          issues,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Configuration validation failed',
        },
      };
    }
  }

  /**
   * Optimize service performance.
   */
  async optimizePerformance(): Promise<
    IntegrationOperationResult<{
      optimizations: Array<{
        component: string;
        action: string;
        impact: string;
        applied: boolean;
      }>;
      overallImprovement: number;
    }>
  > {
    const optimizations: Array<{
      component: string;
      action: string;
      impact: string;
      applied: boolean;
    }> = [];

    try {
      // Clear cache if it's too full
      const cacheStats = await this.adapter.execute('cache-stats');
      if (cacheStats.success && cacheStats.data?.size > cacheStats.data?.maxSize * 0.8) {
        const clearResult = await this.adapter.execute('clear-cache');
        optimizations.push({
          component: 'cache',
          action: 'Cleared cache',
          impact: 'Reduced memory usage and improved cache efficiency',
          applied: clearResult?.success,
        });
      }

      // Cleanup connection pools
      const poolCleanup = await this.adapter.execute('connection-pool-cleanup');
      if (poolCleanup.success) {
        optimizations.push({
          component: 'connection-pool',
          action: 'Cleaned up idle connections',
          impact: 'Reduced resource usage and improved connection efficiency',
          applied: true,
        });
      }

      const successfulOptimizations = optimizations.filter((o) => o.applied).length;
      const overallImprovement =
        optimizations.length > 0 ? (successfulOptimizations / optimizations.length) * 100 : 0;

      return {
        success: true,
        data: {
          optimizations,
          overallImprovement,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'OPTIMIZATION_ERROR',
          message: error instanceof Error ? error.message : 'Performance optimization failed',
        },
      };
    }
  }
}

/**
 * Integration Service Utilities.
 *
 * Static utility functions for integration operations.
 *
 * @example
 */
export class IntegrationServiceUtils {
  /**
   * Create helper instance for an adapter.
   *
   * @param adapter
   */
  static createHelper(adapter: IntegrationServiceAdapter): IntegrationServiceHelper {
    return new IntegrationServiceHelper(adapter);
  }

  /**
   * Validate API endpoint URL.
   *
   * @param url
   */
  static validateEndpoint(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate unique operation ID.
   */
  static generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Calculate retry delay with exponential backoff.
   *
   * @param attempt
   * @param baseDelay
   * @param maxDelay
   */
  static calculateRetryDelay(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ): number {
    const delay = baseDelay * 2 ** (attempt - 1);
    return Math.min(delay + Math.random() * 1000, maxDelay); // Add jitter
  }

  /**
   * Sanitize architecture data for storage.
   *
   * @param architecture
   */
  static sanitizeArchitectureData(architecture: ArchitectureDesign): ArchitectureDesign {
    // Create a deep copy to avoid mutations
    const sanitized = JSON.parse(JSON.stringify(architecture));

    // Remove potentially sensitive data
    if (sanitized.metadata) {
      delete sanitized.metadata.internalNotes;
      delete sanitized.metadata.privateKeys;
    }

    // Ensure required fields are present
    if (!sanitized.id) {
      sanitized.id = `arch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    return sanitized;
  }

  /**
   * Validate protocol name.
   *
   * @param protocol
   */
  static validateProtocolName(protocol: string): boolean {
    const validProtocols = ['http', 'https', 'websocket', 'mcp-http', 'mcp-stdio', 'tcp', 'udp'];
    return validProtocols.includes(protocol.toLowerCase());
  }

  /**
   * Format error for logging.
   *
   * @param error
   */
  static formatError(error: any): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
    }
    return JSON.stringify(error, null, 2);
  }

  /**
   * Calculate success rate from operation results.
   *
   * @param results
   */
  static calculateSuccessRate(results: IntegrationOperationResult[]): number {
    if (results.length === 0) return 0;
    const successCount = results.filter((r) => r.success).length;
    return (successCount / results.length) * 100;
  }

  /**
   * Merge integration configurations.
   *
   * @param base
   * @param override
   */
  static mergeConfigurations(
    base: Partial<IntegrationServiceAdapterConfig>,
    override: Partial<IntegrationServiceAdapterConfig>
  ): Partial<IntegrationServiceAdapterConfig> {
    return {
      ...base,
      ...override,
      architectureStorage: {
        enabled: true,
        ...base.architectureStorage,
        ...override.architectureStorage,
      },
      safeAPI: {
        enabled: true,
        ...base.safeAPI,
        ...override.safeAPI,
      },
      protocolManagement: {
        enabled: true,
        supportedProtocols: ['http', 'https', 'websocket'],
        defaultProtocol: 'http',
        ...base.protocolManagement,
        ...override.protocolManagement,
      },
      performance: {
        ...base.performance,
        ...override.performance,
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2,
        retryableOperations: ['GET', 'POST', 'PUT', 'DELETE'],
        ...base.retry,
        ...override.retry,
      },
      cache: {
        enabled: true,
        strategy: 'memory' as const,
        defaultTTL: 300000,
        maxSize: 1000,
        keyPrefix: 'integration:',
        ...base.cache,
        ...override.cache,
      },
      security: {
        ...base.security,
        ...override.security,
      },
      multiProtocol: {
        ...base.multiProtocol,
        ...override.multiProtocol,
      },
    };
  }

  /**
   * Extract metrics from operation results.
   *
   * @param results
   */
  static extractMetrics(results: IntegrationOperationResult[]): {
    totalOperations: number;
    successCount: number;
    errorCount: number;
    averageLatency: number;
    successRate: number;
    errorRate: number;
  } {
    const totalOperations = results.length;
    const successCount = results.filter((r) => r.success).length;
    const errorCount = totalOperations - successCount;

    const latencies = results.filter((r) => r.metadata?.duration).map((r) => r.metadata!.duration!);

    const averageLatency =
      latencies.length > 0
        ? latencies.reduce((sum, lat) => (sum || 0) + (lat || 0), 0) / latencies.length
        : 0;

    const successRate = totalOperations > 0 ? (successCount / totalOperations) * 100 : 0;
    const errorRate = totalOperations > 0 ? (errorCount / totalOperations) * 100 : 0;

    return {
      totalOperations,
      successCount,
      errorCount,
      averageLatency,
      successRate,
      errorRate,
    };
  }
}

// Export types and utilities
export default {
  IntegrationServiceHelper,
  IntegrationServiceUtils,
};
