/**
 * Common API Schemas.
 *
 * Shared schemas used across multiple API domains.
 * Following OpenAPI 3.0 standards for consistency.
 *
 * @file Common schemas for API responses and requests
 */

/**
 * Common pagination parameters.
 * Standard across all list endpoints.
 *
 * @example
 */
export interface PaginationParams {
  readonly limit?: number; // Maximum items to return (1-100, default 20)
  readonly offset?: number; // Number of items to skip (default 0)
}

/**
 * Standard pagination response.
 * Consistent pagination metadata across all endpoints.
 *
 * @example
 */
export interface PaginationResponse {
  readonly total: number; // Total number of items available
  readonly offset: number; // Current offset
  readonly limit: number; // Current limit
  readonly hasMore: boolean; // Whether more items are available
}

/**
 * Standard list response wrapper.
 * Generic container for paginated list responses.
 *
 * @example
 */
export interface ListResponse<T> extends PaginationResponse {
  readonly items: readonly T[];
  readonly timestamp: string; // ISO timestamp when list was generated
}

/**
 * Standard API error response.
 * Following Google API Design Guide error format.
 *
 * @example
 */
export interface APIError {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
    readonly timestamp: string;
    readonly path: string;
    readonly method: string;
    readonly traceId?: string;
  };
}

/**
 * Standard success response wrapper.
 * Generic container for successful API responses.
 *
 * @example
 */
export interface SuccessResponse<T = unknown> {
  readonly success: true;
  readonly data: T;
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Standard health check response.
 * Consistent health check format across all services.
 *
 * @example
 */
export interface HealthResponse {
  readonly status: 'healthy' | 'unhealthy' | 'degraded';
  readonly timestamp: string;
  readonly version: string;
  readonly uptime: number;
  readonly environment: 'development' | 'production' | 'test';
  readonly services?: Record<string, 'healthy' | 'unhealthy' | 'degraded'>;
  readonly checks?: readonly {
    readonly name: string;
    readonly status: 'healthy' | 'unhealthy';
    readonly message?: string;
    readonly duration?: number;
  }[];
}

/**
 * Standard metrics response.
 * Performance and operational metrics.
 *
 * @example
 */
export interface MetricsResponse {
  readonly timestamp: string;
  readonly uptime: number;
  readonly memory: {
    readonly rss: number;
    readonly heapTotal: number;
    readonly heapUsed: number;
    readonly external: number;
    readonly arrayBuffers: number;
  };
  readonly cpu: {
    readonly user: number;
    readonly system: number;
  };
  readonly process: {
    readonly pid: number;
    readonly version: string;
    readonly platform: string;
    readonly architecture: string;
  };
  readonly custom?: Record<string, number | string>;
}

/**
 * Standard sort parameters.
 * Consistent sorting across list endpoints.
 *
 * @example
 */
export interface SortParams {
  readonly sortBy?: string; // Field to sort by
  readonly sortOrder?: 'asc' | 'desc'; // Sort direction
}

/**
 * Standard filter parameters.
 * Common filtering patterns.
 *
 * @example
 */
export interface FilterParams {
  readonly search?: string; // Text search query
  readonly createdAfter?: string; // ISO date filter
  readonly createdBefore?: string; // ISO date filter
  readonly updatedAfter?: string; // ISO date filter
  readonly updatedBefore?: string; // ISO date filter
}

/**
 * Standard timestamp fields.
 * Common timestamp properties for entities.
 *
 * @example
 */
export interface TimestampFields {
  readonly created: Date;
  readonly updated?: Date;
}

/**
 * Standard identification fields.
 * Common ID and metadata for entities.
 *
 * @example
 */
export interface EntityFields {
  readonly id: string;
  readonly version?: number;
  readonly etag?: string;
}

/**
 * Standard audit fields.
 * Audit trail information.
 *
 * @example
 */
export interface AuditFields extends TimestampFields {
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly deletedAt?: Date;
  readonly deletedBy?: string;
}

/**
 * Standard resource state.
 * Common state management for resources.
 *
 * @example
 */
export interface ResourceState {
  readonly status: 'active' | 'inactive' | 'pending' | 'error' | 'deleted';
  readonly statusMessage?: string;
  readonly statusUpdated?: Date;
}

/**
 * Standard configuration fields.
 * Common configuration properties.
 *
 * @example
 */
export interface ConfigurationFields {
  readonly enabled: boolean;
  readonly config?: Record<string, unknown>;
  readonly tags?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * Standard validation error detail.
 * Detailed validation error information.
 *
 * @example
 */
export interface ValidationError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly value?: unknown;
  readonly constraint?: string;
}

/**
 * Batch operation request.
 * Standard format for batch operations.
 *
 * @example
 */
export interface BatchRequest<T> {
  readonly items: readonly T[];
  readonly options?: {
    readonly failOnError?: boolean;
    readonly maxBatchSize?: number;
    readonly timeout?: number;
  };
}

/**
 * Batch operation response.
 * Standard format for batch operation results.
 *
 * @example
 */
export interface BatchResponse<T> {
  readonly results: readonly {
    readonly index: number;
    readonly success: boolean;
    readonly data?: T;
    readonly error?: APIError['error'];
  }[];
  readonly summary: {
    readonly total: number;
    readonly successful: number;
    readonly failed: number;
    readonly duration: number;
  };
  readonly timestamp: string;
}

/**
 * Standard async operation response.
 * For long-running operations.
 *
 * @example
 */
export interface AsyncOperationResponse {
  readonly operationId: string;
  readonly status: 'pending' | 'running' | 'completed' | 'failed';
  readonly progress?: number; // 0-100
  readonly message?: string;
  readonly estimatedCompletion?: string; // ISO timestamp
  readonly result?: unknown;
  readonly error?: APIError['error'];
  readonly created: string;
  readonly updated: string;
}

/**
 * Standard file upload response.
 * For file upload operations.
 *
 * @example
 */
export interface FileUploadResponse {
  readonly fileId: string;
  readonly filename: string;
  readonly size: number;
  readonly mimeType: string;
  readonly url?: string;
  readonly checksum?: string;
  readonly uploaded: string;
  readonly expiresAt?: string;
}

/**
 * Standard rate limit information.
 * Rate limiting metadata in response headers.
 *
 * @example
 */
export interface RateLimitInfo {
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number; // Unix timestamp
  readonly window: number; // Window size in seconds
}

// OpenAPI 3.0 Schema definitions for common types
export const Schemas = {
  PaginationParams: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
        description: 'Maximum number of items to return',
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Number of items to skip',
      },
    },
  },

  SortParams: {
    type: 'object',
    properties: {
      sortBy: {
        type: 'string',
        description: 'Field to sort by',
      },
      sortOrder: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc',
        description: 'Sort direction',
      },
    },
  },

  ErrorResponse: {
    type: 'object',
    required: ['error'],
    properties: {
      error: {
        type: 'object',
        required: ['code', 'message', 'timestamp', 'path', 'method'],
        properties: {
          code: {
            type: 'string',
            description: 'Error code for programmatic handling',
          },
          message: {
            type: 'string',
            description: 'Human-readable error message',
          },
          details: {
            type: 'object',
            description: 'Additional error details',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'When the error occurred',
          },
          path: {
            type: 'string',
            description: 'Request path that caused the error',
          },
          method: {
            type: 'string',
            description: 'HTTP method that caused the error',
          },
          traceId: {
            type: 'string',
            description: 'Trace ID for debugging',
          },
        },
      },
    },
  },

  HealthResponse: {
    type: 'object',
    required: ['status', 'timestamp', 'version', 'uptime', 'environment'],
    properties: {
      status: {
        type: 'string',
        enum: ['healthy', 'unhealthy', 'degraded'],
        description: 'Overall system health status',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'When health check was performed',
      },
      version: {
        type: 'string',
        description: 'Application version',
      },
      uptime: {
        type: 'number',
        description: 'System uptime in seconds',
      },
      environment: {
        type: 'string',
        enum: ['development', 'production', 'test'],
        description: 'Runtime environment',
      },
      services: {
        type: 'object',
        additionalProperties: {
          type: 'string',
          enum: ['healthy', 'unhealthy', 'degraded'],
        },
        description: 'Health status of individual services',
      },
    },
  },

  MetricsResponse: {
    type: 'object',
    required: ['timestamp', 'uptime', 'memory', 'cpu', 'process'],
    properties: {
      timestamp: {
        type: 'string',
        format: 'date-time',
      },
      uptime: {
        type: 'number',
        description: 'System uptime in seconds',
      },
      memory: {
        type: 'object',
        properties: {
          rss: { type: 'number' },
          heapTotal: { type: 'number' },
          heapUsed: { type: 'number' },
          external: { type: 'number' },
          arrayBuffers: { type: 'number' },
        },
      },
      cpu: {
        type: 'object',
        properties: {
          user: { type: 'number' },
          system: { type: 'number' },
        },
      },
      process: {
        type: 'object',
        properties: {
          pid: { type: 'number' },
          version: { type: 'string' },
          platform: { type: 'string' },
          architecture: { type: 'string' },
        },
      },
    },
  },
} as const;
