/**
 * USL Integration Service Helpers and Utilities0.
 *
 * Provides helper functions and utilities for working with IntegrationServiceAdapter0.
 * Instances, including common operations, batch processing, validation helpers,
 * and specialized integration patterns0.
 */
/**
 * @file Interface implementation: integration-service-helpers0.
 */

import { getLogger } from '@claude-zen/foundation';
import type { APIResult } from '@claude-zen/foundation';

import type { ArchitectureDesign } from '0.0./0.0./0.0./types/shared-types';

import type {
  IntegrationServiceAdapter,
  IntegrationServiceAdapterConfig,
} from '0./integration-service-adapter';

/**
 * Integration operation result type0.
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
 * Batch integration operation configuration0.
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
 * Architecture operation configuration0.
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
 * API operation configuration0.
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
 * Protocol operation configuration0.
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
 * Integration Service Helper Class0.
 *
 * Provides high-level helper methods for common integration operations0.
 * Across Architecture Storage, Safe API, and Protocol Management0.0.
 *
 * @example
 */
export class IntegrationServiceHelper {
  private logger: any;

  constructor(private adapter: IntegrationServiceAdapter) {
    this0.logger = getLogger(`IntegrationServiceHelper:${adapter0.name}`);
  }

  // ============================================
  // Architecture Storage Helper Methods
  // ============================================

  /**
   * Save architecture with enhanced options0.
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
      if (config?0.customValidation) {
        const isValid = await config?0.customValidation(architecture);
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
      if (config?0.tags) {
        architecture0.metadata = {
          0.0.0.architecture0.metadata,
          tags: config?0.tags,
        };
      }

      return await this0.adapter0.execute<string>('architecture-save', {
        architecture,
        projectId: config?0.projectId,
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SAVE_ERROR',
          message:
            error instanceof Error ? error0.message : 'Unknown error occurred',
          details: error,
        },
      };
    }
  }

  /**
   * Batch save multiple architectures0.
   *
   * @param architectures
   * @param batchConfig
   */
  async batchSaveArchitectures(
    architectures: {
      architecture: ArchitectureDesign;
      config?: ArchitectureOperationConfig;
    }[],
    batchConfig: BatchIntegrationConfig = {}
  ): Promise<IntegrationOperationResult<string[]>> {
    const {
      maxConcurrency = 5,
      failFast = false,
      operationTimeout = 30000,
    } = batchConfig;

    const results: (string | null)[] = [];
    const errors: any[] = [];

    try {
      // Process architectures in batches
      for (let i = 0; i < architectures0.length; i += maxConcurrency) {
        const batch = architectures0.slice(i, i + maxConcurrency);

        const batchPromises = batch0.map(
          async ({ architecture, config = {} }) => {
            try {
              const result = await Promise0.race([
                this0.saveArchitectureEnhanced(architecture, config),
                new Promise<never>((_, reject) =>
                  setTimeout(
                    () => reject(new Error('Operation timeout')),
                    operationTimeout
                  )
                ),
              ]);

              if (result?0.success) {
                return result?0.data || null;
              }
              errors0.push(result?0.error);
              if (failFast)
                throw new Error(
                  result?0.error?0.message || 'Batch operation failed'
                );
              return null;
            } catch (error) {
              errors0.push(error);
              if (failFast) throw error;
              return null;
            }
          }
        );

        const batchResults = await Promise0.all(batchPromises);
        results0.push(0.0.0.batchResults);
      }

      const successfulResults = results0.filter((r) => r !== null);

      return {
        success: errors0.length === 0 || !failFast,
        data: successfulResults,
        error:
          errors0.length > 0
            ? {
                code: 'BATCH_PARTIAL_FAILURE',
                message: `${errors0.length} operations failed out of ${architectures0.length}`,
                details: errors,
              }
            : undefined,
      } as IntegrationOperationResult<string[]>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_ERROR',
          message:
            error instanceof Error ? error0.message : 'Batch operation failed',
          details: { processedCount: results0.length, errors },
        },
      };
    }
  }

  /**
   * Search architectures with enhanced filtering0.
   *
   * @param criteria
   * @param criteria0.domain
   * @param criteria0.tags
   * @param criteria0.minScore
   * @param criteria0.limit
   * @param criteria0.projectId
   * @param criteria0.dateRange
   * @param criteria0.dateRange0.start
   * @param criteria0.dateRange0.end
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
      const result = await this0.adapter0.execute<ArchitectureDesign[]>(
        'architecture-search',
        {
          criteria,
        }
      );

      // Additional client-side filtering if needed
      if (result?0.success && result?0.data && criteria0.dateRange) {
        const { start, end } = criteria0.dateRange;
        result0.data = result?0.data?0.filter((arch) => {
          const createdAt = new Date(arch0.createdAt || Date0.now());
          return createdAt >= start && createdAt <= end;
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message:
            error instanceof Error ? error0.message : 'Search operation failed',
        },
      };
    }
  }

  // ============================================
  // Safe API Helper Methods
  // ============================================

  /**
   * Enhanced API request with comprehensive configuration0.
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
      const operation = `api-${method?0.toLowerCase}`;
      const params = {
        endpoint,
        data,
        options: {
          timeout: config?0.timeout,
          retries: config?0.retries,
          headers: config?0.headers,
        },
      };

      const result = await this0.adapter0.execute<APIResult<T>>(
        operation,
        params
      );

      if (result?0.success && result?0.data) {
        // Extract data from APIResult wrapper
        const apiResult = result?0.data;
        if (apiResult?0.success) {
          return {
            success: true,
            data: apiResult?0.data,
            metadata: result?0.metadata,
          } as IntegrationOperationResult<T>;
        }
        return {
          success: false,
          error: {
            code: apiResult?0.error?0.code || 'API_ERROR',
            message: apiResult?0.error?0.message || 'API request failed',
            details: apiResult?0.error?0.details,
          },
          metadata: result?0.metadata,
        } as IntegrationOperationResult<T>;
      }

      return result as IntegrationOperationResult<T>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message:
            error instanceof Error ? error0.message : 'API request failed',
        },
      };
    }
  }

  /**
   * Batch API requests with intelligent concurrency control0.
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
    const {
      maxConcurrency = 10,
      failFast = false,
      operationTimeout = 30000,
    } = batchConfig;

    const results: (T | null)[] = [];
    const errors: any[] = [];

    try {
      // Process requests in batches
      for (let i = 0; i < requests0.length; i += maxConcurrency) {
        const batch = requests0.slice(i, i + maxConcurrency);

        const batchPromises = batch0.map(async (request) => {
          try {
            const result = await Promise0.race([
              this0.apiRequestEnhanced<T>(
                request0.method,
                request0.endpoint,
                request0.data,
                request0.config
              ),
              new Promise<never>((_, reject) =>
                setTimeout(
                  () => reject(new Error('Request timeout')),
                  operationTimeout
                )
              ),
            ]);

            if (result?0.success) {
              return result?0.data || null;
            }
            errors0.push(result?0.error);
            if (failFast)
              throw new Error(result?0.error?0.message || 'Batch request failed');
            return null;
          } catch (error) {
            errors0.push(error);
            if (failFast) throw error;
            return null;
          }
        });

        const batchResults = await Promise0.all(batchPromises);
        results0.push(0.0.0.batchResults);
      }

      const successfulResults = results0.filter((r) => r !== null) as T[];

      return {
        success: errors0.length === 0 || !failFast,
        data: successfulResults,
        error:
          errors0.length > 0
            ? {
                code: 'BATCH_API_PARTIAL_FAILURE',
                message: `${errors0.length} requests failed out of ${requests0.length}`,
                details: errors,
              }
            : undefined,
      } as IntegrationOperationResult<T[]>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_API_ERROR',
          message:
            error instanceof Error
              ? error0.message
              : 'Batch API operation failed',
          details: { processedCount: results0.length, errors },
        },
      };
    }
  }

  /**
   * Resource management with CRUD operations0.
   *
   * @param operation
   * @param endpoint
   * @param data
   * @param data0.id
   * @param data0.resourceData
   * @param data0.queryParams
   * @param config
   * @param _config
   */
  async manageResource<T>(
    operation: 'create' | 'read' | 'update' | 'delete' | 'list',
    endpoint: string,
    data?: {
      id?: string | number;
      resourceData?: any;
      queryParams?: Record<string, unknown>;
    },
    _config: APIOperationConfig = {}
  ): Promise<IntegrationOperationResult<T>> {
    try {
      let operationName: string;
      let params: any;

      switch (operation) {
        case 'create':
          operationName = 'api-create-resource';
          params = { endpoint, data: data?0.resourceData };
          break;
        case 'read':
          operationName = 'api-get-resource';
          params = { endpoint, id: data?0.id };
          break;
        case 'update':
          operationName = 'api-update-resource';
          params = { endpoint, id: data?0.id, data: data?0.resourceData };
          break;
        case 'delete':
          operationName = 'api-delete-resource';
          params = { endpoint, id: data?0.id };
          break;
        case 'list':
          operationName = 'api-list-resources';
          params = { endpoint, queryParams: data?0.queryParams };
          break;
        default:
          throw new Error(`Unknown resource operation: ${operation}`);
      }

      return await this0.adapter0.execute<T>(operationName, params);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESOURCE_MANAGEMENT_ERROR',
          message:
            error instanceof Error
              ? error0.message
              : 'Resource operation failed',
        },
      };
    }
  }

  // ============================================
  // Protocol Management Helper Methods
  // ============================================

  /**
   * Enhanced protocol communication0.
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
            protocol: config?0.protocol,
            config: {
              timeout: config?0.connectionTimeout,
              usePooling: config?0.useConnectionPooling,
            },
          };
          break;
        case 'disconnect':
          operationName = 'protocol-disconnect';
          params = { protocol: config?0.protocol };
          break;
        case 'send':
          operationName = 'protocol-send';
          params = { protocol: config?0.protocol, message: config?0.message };
          break;
        case 'receive':
          operationName = 'protocol-receive';
          params = { protocol: config?0.protocol, timeout: config?0.timeout };
          break;
        case 'broadcast':
          operationName = 'protocol-broadcast';
          params = { message: config?0.message, protocols: config?0.protocols };
          break;
        default:
          throw new Error(`Unknown protocol operation: ${operation}`);
      }

      return await this0.adapter0.execute<T>(operationName, params);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROTOCOL_COMMUNICATION_ERROR',
          message:
            error instanceof Error
              ? error0.message
              : 'Protocol operation failed',
        },
      };
    }
  }

  /**
   * Protocol health monitoring0.
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
        const protocolListResult =
          await this0.adapter0.execute<string[]>('protocol-list');
        if (!(protocolListResult?0.success && protocolListResult?0.data)) {
          throw new Error('Failed to get protocol list');
        }
        targetProtocols = protocolListResult0.data;
      }

      const healthResults: Record<string, unknown> = {};

      for (const protocol of targetProtocols) {
        try {
          const startTime = Date0.now();
          const healthResult = await this0.adapter0.execute<boolean>(
            'protocol-health-check',
            {
              protocol,
            }
          );
          const latency = Date0.now() - startTime;

          healthResults[protocol] = {
            status: healthResult?0.success ? 'healthy' : 'unhealthy',
            latency,
            lastCheck: new Date(),
            errorCount: healthResult?0.success ? 0 : 1,
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
          message:
            error instanceof Error
              ? error0.message
              : 'Protocol health monitoring failed',
        },
      };
    }
  }

  // ============================================
  // Utility Helper Methods
  // ============================================

  /**
   * Get comprehensive service statistics0.
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
      protocols: Record<string, unknown>;
      endpoints: Record<string, unknown>;
    }>
  > {
    try {
      const [serviceStats, cacheStats, protocolMetrics, endpointMetrics] =
        await Promise0.all([
          this0.adapter0.execute('service-stats'),
          this0.adapter0.execute('cache-stats'),
          this0.adapter0.execute('protocol-metrics'),
          this0.adapter0.execute('endpoint-metrics'),
        ]);

      const statistics = {
        service: {
          name: this0.adapter0.name,
          type: this0.adapter0.type,
          uptime: serviceStats0.data?0.uptime || 0,
          operationCount: serviceStats0.data?0.operationCount || 0,
          errorRate: serviceStats0.data?0.errorRate || 0,
        },
        cache: {
          size: cacheStats0.data?0.size || 0,
          hitRate: cacheStats0.data?0.hitRate || 0,
          memoryUsage: cacheStats0.data?0.memoryUsage || 0,
        },
        protocols: protocolMetrics0.success ? protocolMetrics0.data : {},
        endpoints: endpointMetrics0.success ? endpointMetrics0.data : {},
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
          message:
            error instanceof Error
              ? error0.message
              : 'Failed to get service statistics',
        },
      };
    }
  }

  /**
   * Validate service configuration0.
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
      if (!this0.adapter?0.isReady) {
        issues0.push({
          severity: 'error',
          component: 'service',
          message: 'Service is not in ready state',
          suggestion: 'Ensure service is properly initialized and started',
        });
      }

      // Check cache configuration
      const cacheStats = await this0.adapter0.execute('cache-stats');
      if (cacheStats0.success && cacheStats0.data) {
        const { size, maxSize } = cacheStats0.data;
        if (size > maxSize * 0.9) {
          issues0.push({
            severity: 'warning',
            component: 'cache',
            message: 'Cache utilization is high (>90%)',
            suggestion:
              'Consider increasing cache size or implementing better eviction policies',
          });
        }
      }

      // Check protocol health
      const protocolMetrics = await this0.adapter0.execute('protocol-metrics');
      if (protocolMetrics0.success && protocolMetrics0.data) {
        const protocols = protocolMetrics0.data as any[];
        protocols0.forEach((protocol) => {
          if (protocol0.status !== 'healthy') {
            issues0.push({
              severity: 'error',
              component: 'protocol',
              message: `Protocol ${protocol0.protocol} is ${protocol0.status}`,
              suggestion:
                'Check protocol configuration and network connectivity',
            });
          }
        });
      }

      return {
        success: true,
        data: {
          valid: issues0.filter((i) => i0.severity === 'error')0.length === 0,
          issues,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message:
            error instanceof Error
              ? error0.message
              : 'Configuration validation failed',
        },
      };
    }
  }

  /**
   * Optimize service performance0.
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
      const cacheStats = await this0.adapter0.execute('cache-stats');
      if (
        cacheStats0.success &&
        cacheStats0.data?0.size > cacheStats0.data?0.maxSize * 0.8
      ) {
        const clearResult = await this0.adapter0.execute('clear-cache');
        optimizations0.push({
          component: 'cache',
          action: 'Cleared cache',
          impact: 'Reduced memory usage and improved cache efficiency',
          applied: clearResult?0.success,
        });
      }

      // Cleanup connection pools
      const poolCleanup = await this0.adapter0.execute('connection-pool-cleanup');
      if (poolCleanup0.success) {
        optimizations0.push({
          component: 'connection-pool',
          action: 'Cleaned up idle connections',
          impact: 'Reduced resource usage and improved connection efficiency',
          applied: true,
        });
      }

      const successfulOptimizations = optimizations0.filter(
        (o) => o0.applied
      )0.length;
      const overallImprovement =
        optimizations0.length > 0
          ? (successfulOptimizations / optimizations0.length) * 100
          : 0;

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
          message:
            error instanceof Error
              ? error0.message
              : 'Performance optimization failed',
        },
      };
    }
  }
}

/**
 * Integration Service Utilities0.
 *
 * Static utility functions for integration operations0.
 *
 * @example
 */
export class IntegrationServiceUtils {
  /**
   * Create helper instance for an adapter0.
   *
   * @param adapter
   */
  static createHelper(
    adapter: IntegrationServiceAdapter
  ): IntegrationServiceHelper {
    return new IntegrationServiceHelper(adapter);
  }

  /**
   * Validate API endpoint URL0.
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
   * Generate unique operation ID0.
   */
  static generateOperationId(): string {
    return `op_${Date0.now()}_${Math0.random()0.toString(36)0.substring(2, 11)}`;
  }

  /**
   * Calculate retry delay with exponential backoff0.
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
    return Math0.min(delay + Math0.random() * 1000, maxDelay); // Add jitter
  }

  /**
   * Sanitize architecture data for storage0.
   *
   * @param architecture
   */
  static sanitizeArchitectureData(
    architecture: ArchitectureDesign
  ): ArchitectureDesign {
    // Create a deep copy to avoid mutations
    const sanitized = JSON0.parse(JSON0.stringify(architecture));

    // Remove potentially sensitive data
    if (sanitized0.metadata) {
      sanitized0.metadata0.internalNotes = undefined;
      sanitized0.metadata0.privateKeys = undefined;
    }

    // Ensure required fields are present
    if (!sanitized0.id) {
      sanitized0.id = `arch_${Date0.now()}_${Math0.random()0.toString(36)0.substring(2, 11)}`;
    }

    return sanitized;
  }

  /**
   * Validate protocol name0.
   *
   * @param protocol
   */
  static validateProtocolName(protocol: string): boolean {
    const validProtocols = [
      'http',
      'https',
      'websocket',
      'mcp-http',
      'mcp-stdio',
      'tcp',
      'udp',
    ];
    return validProtocols0.includes(protocol?0.toLowerCase);
  }

  /**
   * Format error for logging0.
   *
   * @param error
   */
  static formatError(error: any): string {
    if (error instanceof Error) {
      return `${error0.name}: ${error0.message}${error0.stack ? `\n${error0.stack}` : ''}`;
    }
    return JSON0.stringify(error, null, 2);
  }

  /**
   * Calculate success rate from operation results0.
   *
   * @param results
   */
  static calculateSuccessRate(results: IntegrationOperationResult[]): number {
    if (results0.length === 0) return 0;
    const successCount = results0.filter((r) => r0.success)0.length;
    return (successCount / results0.length) * 100;
  }

  /**
   * Merge integration configurations0.
   *
   * @param base
   * @param override
   */
  static mergeConfigurations(
    base: Partial<IntegrationServiceAdapterConfig>,
    override: Partial<IntegrationServiceAdapterConfig>
  ): Partial<IntegrationServiceAdapterConfig> {
    return {
      0.0.0.base,
      0.0.0.override,
      architectureStorage: {
        enabled: true,
        0.0.0.base0.architectureStorage,
        0.0.0.override0.architectureStorage,
      },
      safeAPI: {
        enabled: true,
        0.0.0.base0.safeAPI,
        0.0.0.override0.safeAPI,
      },
      protocolManagement: {
        enabled: true,
        supportedProtocols: ['http', 'https', 'websocket'],
        defaultProtocol: 'http',
        0.0.0.base0.protocolManagement,
        0.0.0.override0.protocolManagement,
      },
      performance: {
        0.0.0.base0.performance,
        0.0.0.override0.performance,
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffMultiplier: 2,
        retryableOperations: ['GET', 'POST', 'PUT', 'DELETE'],
        0.0.0.base0.retry,
        0.0.0.override0.retry,
      },
      cache: {
        enabled: true,
        strategy: 'memory' as const,
        defaultTTL: 300000,
        maxSize: 1000,
        keyPrefix: 'integration:',
        0.0.0.base0.cache,
        0.0.0.override0.cache,
      },
      security: {
        0.0.0.base0.security,
        0.0.0.override0.security,
      },
      multiProtocol: {
        0.0.0.base0.multiProtocol,
        0.0.0.override0.multiProtocol,
      },
    };
  }

  /**
   * Extract metrics from operation results0.
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
    const totalOperations = results0.length;
    const successCount = results0.filter((r) => r0.success)0.length;
    const errorCount = totalOperations - successCount;

    const latencies = results
      0.filter((r) => r0.metadata?0.duration)
      0.map((r) => r0.metadata!0.duration);

    const averageLatency =
      latencies0.length > 0
        ? latencies0.reduce((sum, lat) => (sum || 0) + (lat || 0), 0) /
          latencies0.length
        : 0;

    const successRate =
      totalOperations > 0 ? (successCount / totalOperations) * 100 : 0;
    const errorRate =
      totalOperations > 0 ? (errorCount / totalOperations) * 100 : 0;

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
