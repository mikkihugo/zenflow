/**
 * @file Main entry point for REST API layer.
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-api-http-index');
/**
 * REST API Layer - Main Entry Point.
 *
 * Central export point for the REST API layer.
 * Following Google Code Standards with explicit exports.
 * Clean separation between API layer and business domains.
 */
import { getCORSOrigins, getMCPServerURL } from '../config/url-builder';
import { APIClient } from './client.ts';
// Import server types for internal use
import { APIServer } from './server.ts';
// ===== API CLIENT SDK =====
export { APIClient, apiClient, createAPIClient } from './client.ts';
export { authMiddleware, getCurrentUser, hasPermission, hasRole, isAdmin, optionalAuthMiddleware, } from './middleware/auth.ts';
// ===== MIDDLEWARE =====
export { APIError as APIErrorClass, asyncHandler, createConflictError, createInternalError, createNotFoundError, createRateLimitError, createValidationError, errorHandler, notFoundHandler, } from './middleware/errors.ts';
export { LogLevel, log, logError, logPerformance, requestLogger } from './middleware/logging.ts';
// ===== SCHEMAS AND TYPES =====
export { RestAPISchema } from './schemas/index.ts';
// ===== API SERVER =====
export { APIServer, createAPIServer, DEFAULT_API_CONFIG } from './server.ts';
// ===== ROUTE CREATORS =====
export { createCoordinationRoutes } from './v1/coordination.ts';
export { createDatabaseRoutes } from './v1/database.ts';
export { createMemoryRoutes } from './v1/memory.ts';
export { createNeuralRoutes } from './v1/neural.ts';
// ===== VERSION INFORMATION =====
export const REST_API_VERSION = '1.0.0';
export const SUPPORTED_API_VERSIONS = ['v1'];
/**
 * Default API layer configuration.
 */
export const DEFAULT_API_LAYER_CONFIG = {
    server: {
        port: 3000,
        host: 'localhost',
        environment: 'development',
        enableSwagger: true,
        enableValidation: true,
        enableRateLimit: true,
        rateLimitWindowMs: 15 * 60 * 1000,
        rateLimitMaxRequests: 100,
        corsOrigins: getCORSOrigins(),
    },
    client: {
        baseURL: getMCPServerURL(),
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        enableAuth: false,
    },
    enableSwagger: true,
    enableValidation: true,
    enableRateLimit: true,
    logLevel: 'info',
};
/**
 * API Layer Factory.
 * Creates complete API layer with server and client.
 *
 * @example
 */
export class APILayer {
    server;
    client;
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_API_LAYER_CONFIG, ...config };
        this.server = new APIServer(this.config.server);
        this.client = new APIClient(this.config.client);
    }
    /**
     * Start the API server.
     */
    async start() {
        await this.server.start();
    }
    /**
     * Stop the API server.
     */
    async stop() {
        await this.server.stop();
    }
    /**
     * Get the API server instance.
     */
    getServer() {
        return this.server;
    }
    /**
     * Get the API client instance.
     */
    getClient() {
        return this.client;
    }
    /**
     * Get current configuration.
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Test API connectivity.
     */
    async ping() {
        return this.client.ping();
    }
}
/**
 * Create API layer with configuration.
 *
 * @param config
 */
export const createAPILayer = (config) => {
    return new APILayer(config);
};
/**
 * API Layer Health Check.
 * Comprehensive health check for the entire API layer.
 *
 * @param layer
 */
export const checkAPILayerHealth = async (layer) => {
    const checks = {
        server: false,
        client: false,
        connectivity: false,
    };
    try {
        // Check if server is running
        const serverConfig = layer.getServer().getConfig();
        checks.server = serverConfig?.port > 0;
        // Check if client is configured
        const clientConfig = layer.getClient().getConfig();
        checks.client = !!clientConfig?.baseURL;
        // Check connectivity
        checks.connectivity = await layer.ping();
    }
    catch (error) {
        logger.error('API layer health check failed:', error);
    }
    const allHealthy = Object.values(checks).every((check) => check === true);
    return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date().toISOString(),
    };
};
/**
 * API Documentation URLs.
 * Standard endpoints for API documentation.
 */
export const API_DOCS = {
    swagger: '/docs',
    openapi: '/openapi.json',
    health: '/health',
    metrics: '/api/v1/system/metrics',
};
/**
 * API Endpoint Patterns.
 * Standard URL patterns following Google API Design Guide.
 */
export const API_PATTERNS = {
    // Collection patterns
    listResources: '/api/v1/{domain}/{resources}',
    createResource: '/api/v1/{domain}/{resources}',
    // Resource patterns
    getResource: '/api/v1/{domain}/{resources}/{id}',
    updateResource: '/api/v1/{domain}/{resources}/{id}',
    deleteResource: '/api/v1/{domain}/{resources}/{id}',
    // Sub-resource patterns
    listSubResources: '/api/v1/{domain}/{resources}/{id}/{sub_resources}',
    createSubResource: '/api/v1/{domain}/{resources}/{id}/{sub_resources}',
    // Action patterns
    performAction: '/api/v1/{domain}/{resources}/{id}:{action}',
    // System patterns
    health: '/health',
    systemHealth: '/api/v1/system/health',
    systemMetrics: '/api/v1/system/metrics',
};
/**
 * Standard HTTP Status Codes.
 * Following Google API Design Guide recommendations.
 */
export const HTTP_STATUS = {
    // Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    // Client Error
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    // Server Error
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};
/**
 * Standard Error Codes.
 * Following Google API Design Guide error codes.
 */
export const ERROR_CODES = {
    // Client errors
    INVALID_REQUEST: 'INVALID_REQUEST',
    AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    METHOD_NOT_SUPPORTED: 'METHOD_NOT_SUPPORTED',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    // Server errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    FEATURE_NOT_IMPLEMENTED: 'FEATURE_NOT_IMPLEMENTED',
    UPSTREAM_ERROR: 'UPSTREAM_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
};
