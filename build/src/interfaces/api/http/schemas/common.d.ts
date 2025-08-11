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
 */
export interface PaginationParams {
    readonly limit?: number;
    readonly offset?: number;
}
/**
 * Standard pagination response.
 * Consistent pagination metadata across all endpoints.
 *
 * @example
 */
export interface PaginationResponse {
    readonly total: number;
    readonly offset: number;
    readonly limit: number;
    readonly hasMore: boolean;
}
/**
 * Standard list response wrapper.
 * Generic container for paginated list responses.
 *
 * @example
 */
export interface ListResponse<T> extends PaginationResponse {
    readonly items: readonly T[];
    readonly timestamp: string;
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
    readonly sortBy?: string;
    readonly sortOrder?: 'asc' | 'desc';
}
/**
 * Standard filter parameters.
 * Common filtering patterns.
 *
 * @example
 */
export interface FilterParams {
    readonly search?: string;
    readonly createdAfter?: string;
    readonly createdBefore?: string;
    readonly updatedAfter?: string;
    readonly updatedBefore?: string;
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
    readonly progress?: number;
    readonly message?: string;
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
    readonly reset: number;
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
};
//# sourceMappingURL=common.d.ts.map