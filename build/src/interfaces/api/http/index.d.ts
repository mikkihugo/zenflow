/**
 * @file Main entry point for REST API layer.
 */
import { APIClient } from './client.ts';
import { type APIClientConfig, APIServer, type APIServerConfig } from './server.ts';
export type { APIClientConfig, PaginationOptions, RequestOptions } from './client.ts';
export { APIClient, apiClient, createAPIClient } from './client.ts';
export type { AuthContext, User } from './middleware/auth.ts';
export { authMiddleware, getCurrentUser, hasPermission, hasRole, isAdmin, optionalAuthMiddleware, } from './middleware/auth.ts';
export { APIError as APIErrorClass, asyncHandler, createConflictError, createInternalError, createNotFoundError, createRateLimitError, createValidationError, errorHandler, notFoundHandler, } from './middleware/errors.ts';
export { LogLevel, log, logError, logPerformance, requestLogger } from './middleware/logging.ts';
export type { Agent, APIError, CoordinationError, EvaluationMetrics, HealthResponse, HealthStatus, ListResponse, MetricsResponse, NeuralLayer, NeuralNetwork, PaginationParams, PaginationResponse, PerformanceMetrics, PredictionRequest, PredictionResponse, SuccessResponse, SwarmConfig, Task, TrainingConfig, TrainingJob, TrainingRequest, } from './schemas/index.ts';
export { RestAPISchema } from './schemas/index.ts';
export type { APIServerConfig } from './server.ts';
export { APIServer, createAPIServer, DEFAULT_API_CONFIG } from './server.ts';
export { createCoordinationRoutes } from './v1/coordination.ts';
export { createDatabaseRoutes } from './v1/database.ts';
export { createMemoryRoutes } from './v1/memory.ts';
export { createNeuralRoutes } from './v1/neural.ts';
export declare const REST_API_VERSION: "1.0.0";
export declare const SUPPORTED_API_VERSIONS: readonly ["v1"];
/**
 * API Layer Configuration.
 * Central configuration for the entire API layer.
 *
 * @example
 */
export interface APILayerConfig {
    readonly server: APIServerConfig;
    readonly client: APIClientConfig;
    readonly enableSwagger: boolean;
    readonly enableValidation: boolean;
    readonly enableRateLimit: boolean;
    readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * Default API layer configuration.
 */
export declare const DEFAULT_API_LAYER_CONFIG: APILayerConfig;
/**
 * API Layer Factory.
 * Creates complete API layer with server and client.
 *
 * @example
 */
export declare class APILayer {
    private server;
    private client;
    private config;
    constructor(config?: Partial<APILayerConfig>);
    /**
     * Start the API server.
     */
    start(): Promise<void>;
    /**
     * Stop the API server.
     */
    stop(): Promise<void>;
    /**
     * Get the API server instance.
     */
    getServer(): APIServer;
    /**
     * Get the API client instance.
     */
    getClient(): APIClient;
    /**
     * Get current configuration.
     */
    getConfig(): APILayerConfig;
    /**
     * Test API connectivity.
     */
    ping(): Promise<boolean>;
}
/**
 * Create API layer with configuration.
 *
 * @param config
 */
export declare const createAPILayer: (config?: Partial<APILayerConfig>) => APILayer;
/**
 * API Layer Health Check.
 * Comprehensive health check for the entire API layer.
 *
 * @param layer
 */
export declare const checkAPILayerHealth: (layer: APILayer) => Promise<{
    status: "healthy" | "unhealthy";
    checks: {
        server: boolean;
        client: boolean;
        connectivity: boolean;
    };
    timestamp: string;
}>;
/**
 * API Documentation URLs.
 * Standard endpoints for API documentation.
 */
export declare const API_DOCS: {
    readonly swagger: "/docs";
    readonly openapi: "/openapi.json";
    readonly health: "/health";
    readonly metrics: "/api/v1/system/metrics";
};
/**
 * API Endpoint Patterns.
 * Standard URL patterns following Google API Design Guide.
 */
export declare const API_PATTERNS: {
    readonly listResources: "/api/v1/{domain}/{resources}";
    readonly createResource: "/api/v1/{domain}/{resources}";
    readonly getResource: "/api/v1/{domain}/{resources}/{id}";
    readonly updateResource: "/api/v1/{domain}/{resources}/{id}";
    readonly deleteResource: "/api/v1/{domain}/{resources}/{id}";
    readonly listSubResources: "/api/v1/{domain}/{resources}/{id}/{sub_resources}";
    readonly createSubResource: "/api/v1/{domain}/{resources}/{id}/{sub_resources}";
    readonly performAction: "/api/v1/{domain}/{resources}/{id}:{action}";
    readonly health: "/health";
    readonly systemHealth: "/api/v1/system/health";
    readonly systemMetrics: "/api/v1/system/metrics";
};
/**
 * Standard HTTP Status Codes.
 * Following Google API Design Guide recommendations.
 */
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly ACCEPTED: 202;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_IMPLEMENTED: 501;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
    readonly GATEWAY_TIMEOUT: 504;
};
/**
 * Standard Error Codes.
 * Following Google API Design Guide error codes.
 */
export declare const ERROR_CODES: {
    readonly INVALID_REQUEST: "INVALID_REQUEST";
    readonly AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED";
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
    readonly RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND";
    readonly METHOD_NOT_SUPPORTED: "METHOD_NOT_SUPPORTED";
    readonly RESOURCE_CONFLICT: "RESOURCE_CONFLICT";
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly FEATURE_NOT_IMPLEMENTED: "FEATURE_NOT_IMPLEMENTED";
    readonly UPSTREAM_ERROR: "UPSTREAM_ERROR";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
    readonly TIMEOUT_ERROR: "TIMEOUT_ERROR";
};
//# sourceMappingURL=index.d.ts.map