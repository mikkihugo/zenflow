import { getLogger } from "../../../config/logging-config";
const logger = getLogger("interfaces-api-http-index");
/**
 * REST API Layer - Main Entry Point
 *
 * Central export point for the REST API layer.
 * Following Google Code Standards with explicit exports.
 * Clean separation between API layer and business domains.
 *
 * @file Main entry point for REST API layer
 */

import { APIClient } from './client';
// Import server types for internal use
import { type APIClientConfig, APIServer, type APIServerConfig } from './server';
import { getMCPServerURL, getCORSOrigins } from '../../config/url-builder';

export type { APIClientConfig, PaginationOptions, RequestOptions } from './client';
// ===== API CLIENT SDK =====
export { APIClient, apiClient, createAPIClient } from './client';
export type { AuthContext, User } from './middleware/auth';
export {
  authMiddleware,
  getCurrentUser,
  hasPermission,
  hasRole,
  isAdmin,
  optionalAuthMiddleware,
} from './middleware/auth';
// ===== MIDDLEWARE =====
export {
  APIError as APIErrorClass,
  asyncHandler,
  createConflictError,
  createInternalError,
  createNotFoundError,
  createRateLimitError,
  createValidationError,
  errorHandler,
  notFoundHandler,
} from './middleware/errors';
export { LogLevel, log, logError, logPerformance, requestLogger } from './middleware/logging';
export type {
  // Coordination types (re-exported from domain)
  Agent,
  APIError,
  CoordinationError,
  EvaluationMetrics,
  HealthResponse,
  HealthStatus,
  ListResponse,
  MetricsResponse,
  NeuralLayer,
  // Neural types
  NeuralNetwork,
  // Common types
  PaginationParams,
  PaginationResponse,
  PerformanceMetrics,
  PredictionRequest,
  PredictionResponse,
  SuccessResponse,
  SwarmConfig,
  Task,
  TrainingConfig,
  TrainingJob,
  TrainingRequest,
} from './schemas/index';
// ===== SCHEMAS AND TYPES =====
export { RestAPISchema } from './schemas/index';
export type { APIServerConfig } from './server';
// ===== API SERVER =====
export { APIServer, createAPIServer, DEFAULT_API_CONFIG } from './server';

// ===== ROUTE CREATORS =====
export { createCoordinationRoutes } from './v1/coordination';
export { createDatabaseRoutes } from './v1/database';
export { createMemoryRoutes } from './v1/memory';
export { createNeuralRoutes } from './v1/neural';

// ===== VERSION INFORMATION =====
export const REST_API_VERSION = '1.0.0' as const;
export const SUPPORTED_API_VERSIONS = ['v1'] as const;

/**
 * API Layer Configuration
 * Central configuration for the entire API layer
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
 * Default API layer configuration
 */
export const DEFAULT_API_LAYER_CONFIG: APILayerConfig = {
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
} as const;

/**
 * API Layer Factory
 * Creates complete API layer with server and client
 *
 * @example
 */
export class APILayer {
  private server: APIServer;
  private client: APIClient;
  private config: APILayerConfig;

  constructor(config: Partial<APILayerConfig> = {}) {
    this.config = { ...DEFAULT_API_LAYER_CONFIG, ...config };
    this.server = new APIServer(this.config.server);
    this.client = new APIClient(this.config.client);
  }

  /**
   * Start the API server
   */
  public async start(): Promise<void> {
    await this.server.start();
  }

  /**
   * Stop the API server
   */
  public async stop(): Promise<void> {
    await this.server.stop();
  }

  /**
   * Get the API server instance
   */
  public getServer(): APIServer {
    return this.server;
  }

  /**
   * Get the API client instance
   */
  public getClient(): APIClient {
    return this.client;
  }

  /**
   * Get current configuration
   */
  public getConfig(): APILayerConfig {
    return { ...this.config };
  }

  /**
   * Test API connectivity
   */
  public async ping(): Promise<boolean> {
    return this.client.ping();
  }
}

/**
 * Create API layer with configuration
 *
 * @param config
 */
export const createAPILayer = (config?: Partial<APILayerConfig>): APILayer => {
  return new APILayer(config);
};

/**
 * API Layer Health Check
 * Comprehensive health check for the entire API layer
 *
 * @param layer
 */
export const checkAPILayerHealth = async (
  layer: APILayer
): Promise<{
  status: 'healthy' | 'unhealthy';
  checks: {
    server: boolean;
    client: boolean;
    connectivity: boolean;
  };
  timestamp: string;
}> => {
  const checks = {
    server: false,
    client: false,
    connectivity: false,
  };

  try {
    // Check if server is running
    const serverConfig = layer.getServer().getConfig();
    checks.server = serverConfig.port > 0;

    // Check if client is configured
    const clientConfig = layer.getClient().getConfig();
    checks.client = !!clientConfig.baseURL;

    // Check connectivity
    checks.connectivity = await layer.ping();
  } catch (error) {
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
 * API Documentation URLs
 * Standard endpoints for API documentation
 */
export const API_DOCS = {
  swagger: '/docs',
  openapi: '/openapi.json',
  health: '/health',
  metrics: '/api/v1/system/metrics',
} as const;

/**
 * API Endpoint Patterns
 * Standard URL patterns following Google API Design Guide
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
} as const;

/**
 * Standard HTTP Status Codes
 * Following Google API Design Guide recommendations
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
} as const;

/**
 * Standard Error Codes
 * Following Google API Design Guide error codes
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
} as const;
