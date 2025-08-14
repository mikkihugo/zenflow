import { getLogger } from '../../../config/logging-config.js';
const logger = getLogger('interfaces-api-http-index');
import { getCORSOrigins, getMCPServerURL } from '../../../config/defaults.js';
import { APIClient } from './client.ts';
import { APIServer, } from './server.ts';
export { APIClient, apiClient, createAPIClient } from './client.ts';
export { authMiddleware, getCurrentUser, hasPermission, hasRole, isAdmin, optionalAuthMiddleware, } from './middleware/auth.ts';
export { APIError as APIErrorClass, asyncHandler, createConflictError, createInternalError, createNotFoundError, createRateLimitError, createValidationError, errorHandler, notFoundHandler, } from './middleware/errors.ts';
export { LogLevel, log, logError, logPerformance, requestLogger, } from './middleware/logging.ts';
export { RestAPISchema } from './schemas/index.ts';
export { APIServer, createAPIServer, DEFAULT_API_CONFIG } from './server.ts';
export { createCoordinationRoutes } from './v1/coordination.ts';
export { createDatabaseRoutes } from './v1/database.ts';
export { createMemoryRoutes } from './v1/memory.ts';
export { createNeuralRoutes } from './v1/neural.ts';
export const REST_API_VERSION = '1.0.0';
export const SUPPORTED_API_VERSIONS = ['v1'];
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
export class APILayer {
    server;
    client;
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_API_LAYER_CONFIG, ...config };
        this.server = new APIServer(this.config.server);
        this.client = new APIClient(this.config.client);
    }
    async start() {
        await this.server.start();
    }
    async stop() {
        await this.server.stop();
    }
    getServer() {
        return this.server;
    }
    getClient() {
        return this.client;
    }
    getConfig() {
        return { ...this.config };
    }
    async ping() {
        return this.client.ping();
    }
}
export const createAPILayer = (config) => {
    return new APILayer(config);
};
export const checkAPILayerHealth = async (layer) => {
    const checks = {
        server: false,
        client: false,
        connectivity: false,
    };
    try {
        const serverConfig = layer.getServer().getConfig();
        checks.server = serverConfig?.port > 0;
        const clientConfig = layer.getClient().getConfig();
        checks.client = !!clientConfig?.baseURL;
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
export const API_DOCS = {
    swagger: '/docs',
    openapi: '/openapi.json',
    health: '/health',
    metrics: '/api/v1/system/metrics',
};
export const API_PATTERNS = {
    listResources: '/api/v1/{domain}/{resources}',
    createResource: '/api/v1/{domain}/{resources}',
    getResource: '/api/v1/{domain}/{resources}/{id}',
    updateResource: '/api/v1/{domain}/{resources}/{id}',
    deleteResource: '/api/v1/{domain}/{resources}/{id}',
    listSubResources: '/api/v1/{domain}/{resources}/{id}/{sub_resources}',
    createSubResource: '/api/v1/{domain}/{resources}/{id}/{sub_resources}',
    performAction: '/api/v1/{domain}/{resources}/{id}:{action}',
    health: '/health',
    systemHealth: '/api/v1/system/health',
    systemMetrics: '/api/v1/system/metrics',
};
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};
export const ERROR_CODES = {
    INVALID_REQUEST: 'INVALID_REQUEST',
    AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    METHOD_NOT_SUPPORTED: 'METHOD_NOT_SUPPORTED',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    FEATURE_NOT_IMPLEMENTED: 'FEATURE_NOT_IMPLEMENTED',
    UPSTREAM_ERROR: 'UPSTREAM_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
};
//# sourceMappingURL=index.js.map