/**
 * Common API Schemas.
 *
 * Shared schemas used across multiple API domains.
 * Following OpenAPI 3.0 standards for consistency.
 *
 * @file Common schemas for API responses and requests.
 */
/**
 * Common pagination parameters.
 * Standard across all list endpoints.
 *
 * @example
 * `'typescript
 * const params: PaginationParams = {
 *   limit: 20,
 *   offset: 0
 * };
 * '`'
 */
export interface PaginationParams {
    /** Maximum items to return (1-100,
    default 20) */
    readonly limit?: number;
    /** Number of items to skip (default 0) */
    readonly offset?: number;
}
/**
 * Standard pagination response.
 * Consistent pagination metadata across all endpoints.
 *
 * @example
 * '`'typescript
 * const response: PaginationResponse = {
 *   total: 1000,
 *   offset: 0,
 *   limit: 20,
 *   hasMore: true
 * };
 * '`'
 */
export interface PaginationResponse {
    /** Total number of items available */
    readonly total: number;
    /** Current offset */
    readonly offset: number;
    /** Current limit */
    readonly limit: number;
    /** Whether more items are available */
    readonly hasMore: boolean;
}
/**
 * Standard list response wrapper.
 * Generic container for paginated list responses.
 *
 * @example
 * '`'typescript
 * const response: ListResponse<User> = {
 *   items: [user1,
 *   user2],
 *   total: 1000,
 *   offset: 0,
 *   limit: 20,
 *   hasMore: true,
 *   timestamp: '2023-01-01T00:00:00.000Z'
 * };
 * '`'
 */
export interface ListResponse<T> extends PaginationResponse {
    /** Array of items */
    readonly items: readonly T[];
    /** ISO timestamp when list was generated */
    readonly timestamp: string;
}
/**
 * Standard API error response.
 * Following Google API Design Guide error format.
 *
 * @example
 * '`'typescript
 * const errorResponse: APIError = {
 *   error: {
 *     code: 'INVALID_REQUEST',
 *     message: 'Missing required field',
 *     timestamp: '2023-01-01T00:00:00.000Z',
 *     path: '/api/users',
 *     method: 'POST'
 *   }
 * };
 * '`'
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
 * '`'typescript
 * const response: SuccessResponse<User> = {
 *   success: true,
 *   data: user,
 *   timestamp: '2023-01-01T00:00:00.000Z'
 * };
 * '`'
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
 * '`'typescript
 * const health: HealthResponse = {
 *   status: 'healthy',
 *   timestamp: '2023-01-01T00:00:00.000Z',
 *   version: '1.0.0',
 *   uptime: 3600,
 *   environment: 'production'
 * };
 * '`'
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
 * '`'typescript
 * const metrics: MetricsResponse = {
 *   timestamp: '2023-01-01T00:00:00.000Z',
 *   uptime: 3600,
 *   memory: {
 *     rss: 100000,
 *     heapTotal: 50000,
 *     heapUsed: 30000,
 *     external: 5000,
 *     arrayBuffers: 1000
 *   },
 *   cpu: {
 *     user: 1000,
 *     system: 500
 *   },
 *   process: {
 *     pid: 12345,
 *     version: '18.17.0',
 *     platform: 'linux',
 *     architecture: 'x64'
 *   }
 * };
 * '`'
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
 * '`'typescript
 * const sortParams: SortParams = {
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc'
 * };
 * '`'
 */
export interface SortParams {
    /** Field to sort by */
    readonly sortBy?: string;
    /** Sort direction */
    readonly sortOrder?: 'asc' | 'desc';
}
/**
 * Standard filter parameters.
 * Common filtering patterns.
 *
 * @example
 * '`'typescript
 * const filters: FilterParams = {
 *   search: 'john doe',
 *   createdAfter: '2023-01-01T00:00:00.000Z',
 *   createdBefore: '2023-12-31T23:59:59.999Z'
 * };
 * '`'
 */
export interface FilterParams {
    /** Text search query */
    readonly search?: string;
    /** ISO date filter */
    readonly createdAfter?: string;
    /** ISO date filter */
    readonly createdBefore?: string;
    /** ISO date filter */
    readonly updatedAfter?: string;
    /** ISO date filter */
    readonly updatedBefore?: string;
}
/**
 * Standard timestamp fields.
 * Common timestamp properties for entities.
 *
 * @example
 * '`'typescript
 * const entity: TimestampFields = {
 *   created: new Date(),
 *   updated: new Date()
 * };
 * '`'
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
 * '`'typescript
 * const entity: EntityFields = {
 *   id: 'user-123',
 *   version: 1,
 *   etag: 'abc123'
 * };
 * '`'
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
 * '`'typescript
 * const auditInfo: AuditFields = {
 *   created: new Date(),
 *   createdBy: 'user-123',
 *   updated: new Date(),
 *   updatedBy: 'user-456'
 * };
 * '`'
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
 * '`'typescript
 * const state: ResourceState = {
 *   status: 'active',
 *   statusMessage: 'Resource is operational',
 *   statusUpdated: new Date()
 * };
 * '`'
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
 * '`'typescript
 * const config: ConfigurationFields = {
 *   enabled: true,
 *   config: { timeout: 5000 },
 *   tags: ['production', 'api'],
 *   metadata: { region: 'us-east-1' }
 * };
 * '`'
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
 * '`'typescript
 * const error: ValidationError = {
 *   field: 'email',
 *   code: 'INVALID_FORMAT',
 *   message: 'Email must be a valid email address',
 *   value: 'invalid-email',
 *   constraint: 'email'
 * };
 * '`'
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
 * '`'typescript
 * const batchRequest: BatchRequest<CreateUserRequest> = {
 *   items: [user1Request, user2Request],
 *   options: {
 *     failOnError: false,
 *     maxBatchSize: 100,
 *     timeout: 30000
 *   }
 * };
 * '`'
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
 * '`'typescript
 * const batchResponse: BatchResponse<User> = {
 *   results: [
 *     {
 *       index: 0,
 *       success: true,
 *       data: user1
 *     },
 *     { index: 1, success: false, error: { error: {
 *       code: 'INVALID_INPUT',
 *       message: 'Invalid data',
 *       timestamp: '...',
 *       path: '/batch',
 *       method: 'POST'
 *     } } }
 *   ],
 *   summary: {
 *     total: 2,
 *     successful: 1,
 *     failed: 1,
 *     duration: 1500
 *   },
 *   timestamp: '2023-01-01T00:00:00.000Z'
 * };
 * '`'
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
 * '`'typescript
 * const asyncOp: AsyncOperationResponse = {
 *   operationId: 'op-123',
 *   status: 'running',
 *   progress: 50,
 *   message: 'Processing data...',
 *   created: '2023-01-01T00:00:00.000Z',
 *   updated: '2023-01-01T00:05:00.000Z'
 * };
 * '`'
 */
export interface AsyncOperationResponse {
    readonly operationId: string;
    readonly status: 'pending' | 'running' | 'completed' | 'failed';
    /** Progress percentage (0-100) */
    readonly progress?: number;
    readonly message?: string;
    /** ISO timestamp */
    readonly estimatedCompletion?: string;
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
 * '`'typescript
 * const uploadResponse: FileUploadResponse = {
 *   fileId: 'file-123',
 *   filename: 'document.pdf',
 *   size: 1024000,
 *   mimeType: 'application/pdf',
 *   url: 'https://example.com/files/file-123',
 *   uploaded: '2023-01-01T00:00:00.000Z'
 * };
 * '`'
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
 * '`'typescript
 * const rateLimit: RateLimitInfo = {
 *   limit: 1000,
 *   remaining: 950,
 *   reset: 1672531200,
 *   window: 3600
 * };
 * '`'
 */
export interface RateLimitInfo {
    readonly limit: number;
    readonly remaining: number;
    /** Unix timestamp */
    readonly reset: number;
    /** Window size in seconds */
    readonly window: number;
}
export declare const Schemas: {
    readonly PaginationParams: {
        readonly type: "object";
        readonly properties: {
            readonly limit: {
                readonly type: "integer";
                readonly minimum: 1;
                readonly maximum: 100;
                readonly default: 20;
                readonly description: "Maximum number of items to return";
            };
            readonly offset: {
                readonly type: "integer";
                readonly minimum: 0;
                readonly default: 0;
                readonly description: "Number of items to skip";
            };
        };
    };
    readonly SortParams: {
        readonly type: "object";
        readonly properties: {
            readonly sortBy: {
                readonly type: "string";
                readonly description: "Field to sort by";
            };
            readonly sortOrder: {
                readonly type: "string";
                readonly enum: readonly ["asc", "desc"];
                readonly default: "asc";
                readonly description: "Sort direction";
            };
        };
    };
    readonly ErrorResponse: {
        readonly type: "object";
        readonly required: readonly ["error"];
        readonly properties: {
            readonly error: {
                readonly type: "object";
                readonly required: readonly ["code", "message", "timestamp", "path", "method"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly description: "Error code for programmatic handling";
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly description: "Human-readable error message";
                    };
                    readonly details: {
                        readonly type: "object";
                        readonly description: "Additional error details";
                    };
                    readonly timestamp: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly description: "When the error occurred";
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly description: "Request path that caused the error";
                    };
                    readonly method: {
                        readonly type: "string";
                        readonly description: "HTTP method that caused the error";
                    };
                    readonly traceId: {
                        readonly type: "string";
                        readonly description: "Trace ID for debugging";
                    };
                };
            };
        };
    };
    readonly HealthResponse: {
        readonly type: "object";
        readonly required: readonly ["status", "timestamp", "version", "uptime", "environment"];
        readonly properties: {
            readonly status: {
                readonly type: "string";
                readonly enum: readonly ["healthy", "unhealthy", "degraded"];
                readonly description: "Overall system health status";
            };
            readonly timestamp: {
                readonly type: "string";
                readonly format: "date-time";
                readonly description: "When health check was performed";
            };
            readonly version: {
                readonly type: "string";
                readonly description: "Application version";
            };
            readonly uptime: {
                readonly type: "number";
                readonly description: "System uptime in seconds";
            };
            readonly environment: {
                readonly type: "string";
                readonly enum: readonly ["development", "production", "test"];
                readonly description: "Runtime environment";
            };
            readonly services: {
                readonly type: "object";
                readonly additionalProperties: {
                    readonly type: "string";
                    readonly enum: readonly ["healthy", "unhealthy", "degraded"];
                };
                readonly description: "Health status of individual services";
            };
        };
    };
    readonly MetricsResponse: {
        readonly type: "object";
        readonly required: readonly ["timestamp", "uptime", "memory", "cpu", "process"];
        readonly properties: {
            readonly timestamp: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly uptime: {
                readonly type: "number";
                readonly description: "System uptime in seconds";
            };
            readonly memory: {
                readonly type: "object";
                readonly properties: {
                    readonly rss: {
                        readonly type: "number";
                    };
                    readonly heapTotal: {
                        readonly type: "number";
                    };
                    readonly heapUsed: {
                        readonly type: "number";
                    };
                    readonly external: {
                        readonly type: "number";
                    };
                    readonly arrayBuffers: {
                        readonly type: "number";
                    };
                };
            };
            readonly cpu: {
                readonly type: "object";
                readonly properties: {
                    readonly user: {
                        readonly type: "number";
                    };
                    readonly system: {
                        readonly type: "number";
                    };
                };
            };
            readonly process: {
                readonly type: "object";
                readonly properties: {
                    readonly pid: {
                        readonly type: "number";
                    };
                    readonly version: {
                        readonly type: "string";
                    };
                    readonly platform: {
                        readonly type: "string";
                    };
                    readonly architecture: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
    readonly FilterParams: {
        readonly type: "object";
        readonly properties: {
            readonly search: {
                readonly type: "string";
                readonly description: "Text search query";
            };
            readonly createdAfter: {
                readonly type: "string";
                readonly format: "date-time";
                readonly description: "Filter items created after this date";
            };
            readonly createdBefore: {
                readonly type: "string";
                readonly format: "date-time";
                readonly description: "Filter items created before this date";
            };
            readonly updatedAfter: {
                readonly type: "string";
                readonly format: "date-time";
                readonly description: "Filter items updated after this date";
            };
            readonly updatedBefore: {
                readonly type: "string";
                readonly format: "date-time";
                readonly description: "Filter items updated before this date";
            };
        };
    };
    readonly ValidationError: {
        readonly type: "object";
        readonly required: readonly ["field", "code", "message"];
        readonly properties: {
            readonly field: {
                readonly type: "string";
                readonly description: "Field that failed validation";
            };
            readonly code: {
                readonly type: "string";
                readonly description: "Validation error code";
            };
            readonly message: {
                readonly type: "string";
                readonly description: "Human-readable error message";
            };
            readonly value: {
                readonly description: "Value that failed validation";
            };
            readonly constraint: {
                readonly type: "string";
                readonly description: "Validation constraint that was violated";
            };
        };
    };
};
//# sourceMappingURL=common.d.ts.map