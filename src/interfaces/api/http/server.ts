/**
 * REST API Server - Express with Schema-driven Development
 *
 * Main Express server implementing Google API Design Guide standards.
 * Features automatic OpenAPI 3 documentation and request validation.
 * Clean separation: REST API layer independent from business domains.
 *
 * @fileoverview Main REST API server with domain endpoints
 */

import compression from 'compression';
import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import { OpenApiValidator } from 'express-openapi-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
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
 * Main API Server Configuration
 * Following Google's secure by default principles
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
  readonly corsOrigins: readonly string[];
}

/**
 * API Client Configuration
 * Configuration for API client instances
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
 * Default server configuration with secure defaults
 */
export const DEFAULT_API_CONFIG: APIServerConfig = {
  port: 3000,
  host: 'localhost',
  environment: (process.env.NODE_ENV as any) || 'development',
  enableSwagger: true,
  enableValidation: true,
  enableRateLimit: true,
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100, // 100 requests per window
  corsOrigins: ['http://localhost:3000', 'http://localhost:3001'],
} as const;

/**
 * OpenAPI 3.0 Configuration
 * Unified documentation for all domain APIs
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Claude Code Flow API',
      version: '1.0.0',
      description: 'Unified API for coordination, neural networks, memory, and database operations',
      contact: {
        name: 'Claude Code Flow Team',
        url: 'https://github.com/claude-zen-flow',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.claude-zen-flow.com',
        description: 'Production server',
      },
    ],
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
    './src/coordination/api.ts',
    './src/neural/api.ts',
    './src/api/v1/*.ts',
    './src/api/schemas/*.ts',
  ],
};

/**
 * Main API Server Class
 * Implements Express server with all domain APIs
 */
export class APIServer {
  private app: Application;
  private config: APIServerConfig;
  private server?: any;

  constructor(config: Partial<APIServerConfig> = {}) {
    this.config = { ...DEFAULT_API_CONFIG, ...config };
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware stack
   * Following Google security and performance best practices
   */
  private setupMiddleware(): void {
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
    this.app.use(compression());

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
   * Setup API routes
   * All domain APIs under /api/v1/ with unified documentation
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
    if (this.config.enableSwagger) {
      const specs = swaggerJsdoc(swaggerOptions);
      this.app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(specs, {
          explorer: true,
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'Claude Code Flow API Documentation',
        })
      );

      // Raw OpenAPI spec endpoint
      this.app.get('/openapi.json', (_req: Request, res: Response) => {
        res.json(specs);
      });
    }

    // Setup OpenAPI validation
    if (this.config.enableValidation) {
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
   * Setup coordination domain routes
   * Uses modular route handlers from v1/coordination.ts
   */
  private setupCoordinationRoutes(): void {
    this.app.use('/api/v1/coordination', createCoordinationRoutes());
  }

  /**
   * Setup neural network domain routes
   * Uses modular route handlers from v1/neural.ts
   */
  private setupNeuralRoutes(): void {
    this.app.use('/api/v1/neural', createNeuralRoutes());
  }

  /**
   * Setup memory domain routes
   * Uses modular route handlers from v1/memory.ts
   */
  private setupMemoryRoutes(): void {
    this.app.use('/api/v1/memory', createMemoryRoutes());
  }

  /**
   * Setup database domain routes
   * Uses modular route handlers from v1/database.ts
   */
  private setupDatabaseRoutes(): void {
    this.app.use('/api/v1/database', createDatabaseRoutes());
  }

  /**
   * Setup system-wide routes
   * System health, metrics, configuration
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
   * Setup error handling
   * Standardized error responses following Google API Design Guide
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Start the API server
   * Returns a promise that resolves when server is listening
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
   * Stop the API server
   * Gracefully closes all connections
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
   * Get the Express app instance
   * Useful for testing and custom middleware
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Get current server configuration
   */
  public getConfig(): APIServerConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create and start API server
 * Convenient for simple use cases
 */
export const createAPIServer = async (config?: Partial<APIServerConfig>): Promise<APIServer> => {
  const server = new APIServer(config);
  await server.start();
  return server;
};

/**
 * Main entry point when run directly
 * Starts the API server with default configuration
 */
if (require.main === module) {
  const server = new APIServer();

  // Graceful shutdown handling
  const shutdown = async (_signal: string) => {
    try {
      await server.stop();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Start server
  server.start().catch((error) => {
    console.error('Failed to start API server:', error);
    process.exit(1);
  });
}
