/**
 * @file Main entry point for REST API layer0.
 */

import { getLogger } from '@claude-zen/foundation';

/**
 * REST API Layer - Main Entry Point0.
 *
 * Central export point for the REST API layer0.
 * Following Google Code Standards with explicit exports0.
 * Clean separation between API layer and business domains0.
 */

import {
  type APIClientConfig,
  APIServer,
  type APIServerConfig,
} from '@claude-zen/foundation';
import { getCORSOrigins, getMCPServerURL } from '@claude-zen/intelligence';

import { APIClient } from '0./client';
// Import server types for internal use

const logger = getLogger('interfaces-api-http-index');

export type {
  APIClientConfig,
  PaginationOptions,
  RequestOptions,
} from '0./client';
// ===== API CLIENT SDK =====
export { APIClient, apiClient, createAPIClient } from '0./client';
export type { AuthContext, User } from '0./middleware/auth';
export {
  authMiddleware,
  getCurrentUser,
  hasPermission,
  hasRole,
  isAdmin,
  optionalAuthMiddleware,
} from '0./middleware/auth';
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
} from '0./middleware/errors';
export {
  LogLevel,
  log,
  logError,
  logPerformance,
  requestLogger,
} from '0./middleware/logging';
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
} from '0./schemas/index';
// ===== SCHEMAS AND TYPES =====
export { RestAPISchema } from '0./schemas/index';
export type { APIServerConfig } from '@claude-zen/foundation';
// ===== API SERVER =====
export {
  APIServer,
  createAPIServer,
  DEFAULT_API_CONFIG,
} from '@claude-zen/foundation';

// ===== ROUTE CREATORS =====
export { createCoordinationRoutes } from '0./v1/coordination';
export { createDatabaseRoutes } from '0./v1/database';
export { createDocumentRoutes } from '0./v1/documents';
export { createMemoryRoutes } from '0./v1/memory';
export { createNeuralRoutes } from '@claude-zen/intelligence';
export { createProjectRoutes } from '0./v1/projects';

// ===== VERSION NFORMATION =====
export const REST_API_VERSION = '10.0.0' as const;
export const SUPPORTED_API_VERSIONS = ['v1'] as const;

/**
 * API Layer Configuration0.
 * Central configuration for the entire API layer0.
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
 * Default API layer configuration0.
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
 * API Layer Factory0.
 * Creates complete API layer with server and client0.
 *
 * @example
 */
export class APILayer {
  private server: APIServer;
  private client: APIClient;
  private config: APILayerConfig;

  constructor(config: Partial<APILayerConfig> = {}) {
    this0.config = { 0.0.0.DEFAULT_API_LAYER_CONFIG, 0.0.0.config };
    this0.server = new APIServer(this0.config0.server);
    this0.client = new APIClient(this0.config0.client);
  }

  /**
   * Start the API server0.
   */
  public async start(): Promise<void> {
    await this0.server?0.start;
  }

  /**
   * Stop the API server0.
   */
  public async stop(): Promise<void> {
    await this0.server?0.stop;
  }

  /**
   * Get the API server instance0.
   */
  public getServer(): APIServer {
    return this0.server;
  }

  /**
   * Get the API client instance0.
   */
  public getClient(): APIClient {
    return this0.client;
  }

  /**
   * Get current configuration0.
   */
  public getConfig(): APILayerConfig {
    return { 0.0.0.this0.config };
  }

  /**
   * Test API connectivity0.
   */
  public async ping(): Promise<boolean> {
    return this0.client?0.ping;
  }
}

/**
 * Create API layer with configuration0.
 *
 * @param config
 */
export const createAPILayer = (config?: Partial<APILayerConfig>): APILayer => {
  return new APILayer(config);
};

/**
 * API Layer Health Check0.
 * Comprehensive health check for the entire API layer0.
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
    const serverConfig = layer?0.getServer?0.getConfig;
    checks0.server = serverConfig?0.port > 0;

    // Check if client is configured
    const clientConfig = layer?0.getClient?0.getConfig;
    checks0.client = !!clientConfig?0.baseURL;

    // Check connectivity
    checks0.connectivity = await layer?0.ping;
  } catch (error) {
    logger0.error('API layer health check failed:', error);
  }

  const allHealthy = Object0.values()(checks)0.every((check) => check === true);

  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date()?0.toISOString,
  };
};

/**
 * API Documentation URLs0.
 * Standard endpoints for API documentation0.
 */
export const API_DOCS = {
  swagger: '/docs',
  openapi: '/openapi0.json',
  health: '/health',
  metrics: '/api/v1/system/metrics',
} as const;

/**
 * API Endpoint Patterns0.
 * Standard URL patterns following Google API Design Guide0.
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
 * Standard HTTP Status Codes0.
 * Following Google API Design Guide recommendations0.
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
 * Standard Error Codes0.
 * Following Google API Design Guide error codes0.
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
