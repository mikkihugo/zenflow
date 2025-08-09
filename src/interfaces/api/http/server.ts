import { getLogger } from '../config/logging-config';

const logger = getLogger('interfaces-api-http-server');

/**
 * REST API Server - Express with Schema-driven Development.
 *
 * Main Express server implementing Google API Design Guide standards.
 * Features automatic OpenAPI 3 documentation and request validation.
 * Clean separation: REST API layer independent from business domains.
 *
 * @file Main REST API server with domain endpoints
 */

import cors from 'cors';
// Core dependencies
import { randomBytes } from 'crypto';
import express, { type Application, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Import centralized configuration
import { DEFAULT_CONFIG } from '../config/defaults';
import { getAPIEndpoints, getCORSOrigins } from '../config/url-builder';

// Optional dependencies - handle missing gracefully
let compression: any = null;
let OpenApiValidator: any = null;
let swaggerJsdoc: any = null;
let swaggerUi: any = null;

try {
  compression = require('compression');
} catch (_e) {
  logger.warn('compression package not available - performance middleware disabled');
}

try {
  ({ OpenApiValidator } = require('express-openapi-validator'));
} catch (_e) {
  logger.warn('express-openapi-validator package not available - request validation disabled');
}

try {
  swaggerJsdoc = require('swagger-jsdoc');
  swaggerUi = require('swagger-ui-express');
} catch (_e) {
  logger.warn('swagger packages not available - API documentation disabled');
}

import { getConfig } from '../config';
import { authMiddleware } from './middleware/auth';
// Import middleware
import { errorHandler } from './middleware/errors';
import { requestLogger } from './middleware/logging';
// Import modular route handlers
import { createCoordinationRoutes } from './v1/coordination';
import { createDatabaseRoutes } from './v1/database';
import { createMemoryRoutes } from './v1/memory';
import { createNeuralRoutes } from './v1/neural';

/**
 * Main API Server Configuration.
 * Following Google's secure by default principles.
 *
 * @example
 */
export interface APIServerConfig {
  readonly port: number;
  readonly host: string;
  readonly environment: 'development' | 'production' | 'test';
  readonly enableSwagger: boolean;
  readonly enableValidation: boolean;
  readonly enableRateLimit: boolean;
  readonly rateLimitWindowMs: number;
  readonly rateLimitMaxRequests: number;
  readonly corsOrigins: string[];
}

/**
 * API Client Configuration.
 * Configuration for API client instances.
 *
 * @example
 */
export interface APIClientConfig {
  readonly baseURL: string;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly retryDelay: number;
  readonly enableAuth: boolean;
  readonly authToken?: string;
  readonly headers?: Record<string, string>;
}

/**
 * Default server configuration with secure defaults from centralized config.
 */
export const DEFAULT_API_CONFIG: APIServerConfig = (() => {
  const centralConfig = getConfig();
  return {
    port: centralConfig?.interfaces?.web?.port,
    host: centralConfig?.interfaces?.web?.host,
    environment: centralConfig?.environment?.isProduction
      ? 'production'
      : centralConfig?.environment?.isDevelopment
        ? 'development'
        : 'test',
    enableSwagger: centralConfig?.environment?.enableDebugEndpoints,
    enableValidation: centralConfig?.environment?.strictValidation,
    enableRateLimit: true,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100, // 100 requests per window
    corsOrigins: centralConfig?.interfaces?.web?.corsOrigins,
  } as const;
})();

/**
 * OpenAPI 3.0 Configuration
 * Unified documentation for all domain APIs.
 */
const swaggerOptions = (() => {
  const centralConfig = getConfig();
  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Claude Code Flow API',
        version: '1.0.0',
        description:
          'Unified API for coordination, neural networks, memory, and database operations',
        contact: {
          name: 'Claude Code Flow Team',
          url: 'https://github.com/claude-zen-flow',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: getAPIEndpoints(),
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
        {
          ApiKeyAuth: [],
        },
      ],
    },
    apis: [
      // Domain API surface files (coordination + neural) - keep explicit
      './src/coordination/api.ts',
      './src/neural/api.ts',
      // New canonical interface routes & schemas (replaces legacy ./src/api/* globs)
      './src/interfaces/api/http/v1/*.ts',
      './src/interfaces/api/http/schemas/*.ts',
    ],
  };
})();

/**
 * Main API Server Class.
 * Implements Express server with all domain APIs.
 *
 * @example
 */
export class APIServer {
  private app: Application;
  private config: APIServerConfig;
  private server?: any;

  constructor(config: Partial<APIServerConfig> = {}) {
    // Merge config and populate CORS origins dynamically from centralized configuration
    this.config = {
      ...DEFAULT_API_CONFIG,
      ...config,
      corsOrigins: config?.corsOrigins || getCORSOrigins(),
    };
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware stack.
   * Following Google security and performance best practices.
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use((_req, res, next) => {
      res.locals.nonce = randomBytes(16).toString('hex');
      next();
    });

    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
            styleSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: this.config.corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      })
    );

    // Performance middleware
    if (compression) {
      this.app.use(compression());
    }

    // Rate limiting
    if (this.config.enableRateLimit) {
      const limiter = rateLimit({
        windowMs: this.config.rateLimitWindowMs,
        max: this.config.rateLimitMaxRequests,
        message: {
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(this.config.rateLimitWindowMs / 1000),
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
      this.app.use('/api/', limiter);
    }

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Optional authentication middleware (no auth required but provides structure)
    this.app.use('/api/v1/', authMiddleware);
  }

  /**
   * Setup API routes.
   * All domain APIs under /api/v1/ with unified documentation.
   */
  private setupRoutes(): void {
    // Health check endpoint (no auth required)
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        environment: this.config.environment,
      });
    });

    // API info endpoint
    this.app.get('/api', (_req: Request, res: Response) => {
      res.json({
        name: 'Claude Code Flow API',
        version: '1.0.0',
        documentation: '/docs',
        endpoints: {
          coordination: '/api/v1/coordination',
          neural: '/api/v1/neural',
          memory: '/api/v1/memory',
          database: '/api/v1/database',
          health: '/api/v1/health',
        },
      });
    });

    // Setup Swagger documentation
    if (this.config.enableSwagger && swaggerJsdoc && swaggerUi) {
      const specs = swaggerJsdoc(swaggerOptions);
      this.app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(specs, {
          explorer: true,
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'Claude Code Flow API Documentation',
          swaggerOptions: {
            requestInterceptor: (req: any) => {
              req.headers['X-Content-Security-Policy-Nonce'] = document
                .querySelector('meta[name="csp-nonce"]')
                ?.getAttribute('content');
              return req;
            },
          },
        })
      );

      // Raw OpenAPI spec endpoint
      this.app.get('/openapi.json', (_req: Request, res: Response) => {
        res.json(specs);
      });
    }

    // Setup OpenAPI validation
    if (this.config.enableValidation && OpenApiValidator && swaggerJsdoc) {
      const validator = new OpenApiValidator({
        apiSpec: swaggerJsdoc(swaggerOptions),
        validateRequests: true,
        validateResponses: false, // Disable in production for performance
        ignorePaths: /.*\/docs.*/,
      });
      this.app.use(validator.middleware());
    }

    // Domain API routes
    this.setupCoordinationRoutes();
    this.setupNeuralRoutes();
    this.setupMemoryRoutes();
    this.setupDatabaseRoutes();
    this.setupSystemRoutes();

    // Catch-all for unmatched routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Endpoint not found',
        code: 'ENDPOINT_NOT_FOUND',
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
        availableEndpoints: '/api',
      });
    });
  }

  /**
   * Setup coordination domain routes.
   * Uses modular route handlers from v1/coordination.ts
   */
  private setupCoordinationRoutes(): void {
    this.app.use('/api/v1/coordination', createCoordinationRoutes());
  }

  /**
   * Setup neural network domain routes.
   * Uses modular route handlers from v1/neural.ts
   */
  private setupNeuralRoutes(): void {
    this.app.use('/api/v1/neural', createNeuralRoutes());
  }

  /**
   * Setup memory domain routes.
   * Uses modular route handlers from v1/memory.ts
   */
  private setupMemoryRoutes(): void {
    this.app.use('/api/v1/memory', createMemoryRoutes());
  }

  /**
   * Setup database domain routes.
   * Uses modular route handlers from v1/database.ts
   */
  private setupDatabaseRoutes(): void {
    this.app.use('/api/v1/database', createDatabaseRoutes());
  }

  /**
   * Setup system-wide routes.
   * System health, metrics, configuration.
   */
  private setupSystemRoutes(): void {
    const router = express.Router();

    // System health endpoint
    router.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          coordination: 'healthy',
          neural: 'healthy',
          memory: 'not_implemented',
          database: 'not_implemented',
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
      });
    });

    // System metrics endpoint
    router.get('/metrics', (_req: Request, res: Response) => {
      res.json({
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
        architecture: process.arch,
      });
    });

    this.app.use('/api/v1/system', router);
  }

  /**
   * Setup error handling.
   * Standardized error responses following Google API Design Guide.
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Start the API server.
   * Returns a promise that resolves when server is listening.
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, this.config.host, () => {
          resolve();
        });

        this.server.on('error', (error: Error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the API server.
   * Gracefully closes all connections.
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((error: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get the Express app instance.
   * Useful for testing and custom middleware.
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Get current server configuration.
   */
  public getConfig(): APIServerConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create and start API server.
 * Convenient for simple use cases.
 *
 * @param config
 */
export const createAPIServer = async (config?: Partial<APIServerConfig>): Promise<APIServer> => {
  const server = new APIServer(config);
  await server.start();
  return server;
};

/**
 * Main entry point when run directly.
 * Starts the API server with default configuration.
 */
if (require.main === module) {
  const server = new APIServer();

  // Graceful shutdown handling
  const shutdown = async (_signal: string) => {
    try {
      await server.stop();
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Start server
  server.start().catch((error) => {
    logger.error('Failed to start API server:', error);
    process.exit(1);
  });
}
