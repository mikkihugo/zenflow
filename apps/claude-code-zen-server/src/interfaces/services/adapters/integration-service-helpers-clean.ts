/**
 * USL Integration Service Helpers and Utilities.
 *
 * Provides helper functions and utilities for working with IntegrationServiceAdapter.
 * Instances, including common operations, batch processing, validation helpers,
 * and specialized integration patterns.
 */

import { getLogger } from '@claude-zen/foundation';
import type { APIResult } from '@claude-zen/foundation';

import type { ArchitectureDesign } from './../../types/shared-types';

import type {
  IntegrationServiceAdapter,
  IntegrationServiceAdapterConfig
} from './integration-service-adapter';

/**
 * Integration operation result type.
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
 * Provides high-level helper methods for common integration operations
 * across Architecture Storage, Safe API, and Protocol Management.
 */
export class IntegrationServiceHelper {
  private logger: any;

  constructor(private adapter: IntegrationServiceAdapter) {
    this.logger = getLogger('IntegrationServiceHelper:' + adapter.name);
  }

  // ============================================
  // Architecture Storage Helper Methods
  // ============================================

  /**
   * Save architecture with enhanced options.
   */
  async saveArchitectureEnhanced(
    architecture: ArchitectureDesign,
    config: ArchitectureOperationConfig = {}
  ): Promise<IntegrationOperationResult<string>> {
    try {
      // Apply custom validation if specified
      if (config?.customValidation) {
        const isValid = await config.customValidation(architecture);
        if (!isValid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Custom validation failed for architecture'
            }
          };
        }
      }

      // Apply tags if specified
      if (config?.tags) {
        architecture.metadata = {
          ...architecture.metadata,
          tags: config.tags
        };
      }

      return await this.adapter.execute<string>('architecture-save', {
        architecture,
        projectId: config?.projectId
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SAVE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error
        }
      };
    }
  }

  // ============================================
  // Safe API Helper Methods  
  // ============================================

  /**
   * Enhanced API request with comprehensive configuration.
   */
  async apiRequestEnhanced<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    config: APIOperationConfig = {}
  ): Promise<IntegrationOperationResult<T>> {
    try {
      const operation = 'api-' + method.toLowerCase();
      const params = {
        endpoint,
        data,
        options: {
          timeout: config?.timeout,
          retries: config?.retries,
          headers: config?.headers
        }
      };

      const result = await this.adapter.execute<APIResult<T>>(operation, params);

      if (result?.success && result?.data) {
        const apiResult = result.data;
        if (apiResult?.success) {
          return {
            success: true,
            data: apiResult.data,
            metadata: result.metadata
          };
        }
        return {
          success: false,
          error: {
            code: apiResult?.error?.code || 'API_ERROR',
            message: apiResult?.error?.message || 'API request failed',
            details: apiResult?.error?.details
          },
          metadata: result.metadata
        };
      }
      return result as IntegrationOperationResult<T>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: error instanceof Error ? error.message : 'API request failed'
        }
      };
    }
  }

  // ============================================
  // Utility Helper Methods
  // ============================================

  /**
   * Get comprehensive service statistics.
   */
  async getServiceStatistics(): Promise<IntegrationOperationResult<{
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
  }>> {
    try {
      const [serviceStats, cacheStats] = await Promise.all([
        this.adapter.execute('service-stats'),
        this.adapter.execute('cache-stats')
      ]);

      const statistics = {
        service: {
          name: this.adapter.name,
          type: this.adapter.type,
          uptime: serviceStats.data?.uptime || 0,
          operationCount: serviceStats.data?.operationCount || 0,
          errorRate: serviceStats.data?.errorRate || 0
        },
        cache: {
          size: cacheStats.data?.size || 0,
          hitRate: cacheStats.data?.hitRate || 0,
          memoryUsage: cacheStats.data?.memoryUsage || 0
        }
      };

      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATISTICS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get service statistics'
        }
      };
    }
  }
}

/**
 * Integration Service Utilities.
 *
 * Static utility functions for integration operations.
 */
export class IntegrationServiceUtils {
  /**
   * Create helper instance for an adapter.
   */
  static createHelper(adapter: IntegrationServiceAdapter): IntegrationServiceHelper {
    return new IntegrationServiceHelper(adapter);
  }

  /**
   * Validate API endpoint URL.
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
   */
  static calculateRetryDelay(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ): number {
    const delay = baseDelay * 2 ** (attempt - 1);
    return Math.min(delay + Math.random() * 1000, maxDelay); // Add jitter
  }
}

// Export types and utilities
export default {
  IntegrationServiceHelper,
  IntegrationServiceUtils
};