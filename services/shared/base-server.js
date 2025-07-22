/**
 * Base Express Server Template for Vision-to-Code Services
 * Provides common middleware and configuration for all services
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { getJWTManager } from './auth/src/jwt.js';
import { getPermissionManager } from './auth/src/permissions.js';
import { createRateLimiter } from './middleware/src/rateLimiter.js';
import { registry as circuitBreakerRegistry } from './middleware/src/circuitBreaker.js';
import { 
  requestIdMiddleware, 
  errorHandler, 
  notFoundHandler 
} from './middleware/src/errorHandler.js';

class BaseServer {
  constructor(config = {}) {
    this.config = {
      name: config.name || 'vision-to-code-service',
      port: config.port || process.env.PORT || 3000,
      env: config.env || process.env.NODE_ENV || 'development',
      corsOrigins: config.corsOrigins || process.env.CORS_ORIGINS?.split(',') || ['*'],
      trustProxy: config.trustProxy || process.env.TRUST_PROXY === 'true',
      ...config
    };

    this.app = express();
    this.server = null;
    this.jwtManager = getJWTManager();
    this.permissionManager = getPermissionManager();
    this.rateLimiter = createRateLimiter({
      redis: config.redis,
      defaults: config.rateLimits
    });

    this.setupMiddleware();
  }

  /**
   * Set up common middleware
   */
  setupMiddleware() {
    // Trust proxy if configured
    if (this.config.trustProxy) {
      this.app.set('trust proxy', true);
    }

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (this.config.corsOrigins.includes('*') || 
            this.config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
    }));

    // Request ID
    this.app.use(requestIdMiddleware);

    // Logging
    if (this.config.env !== 'test') {
      this.app.use(morgan('combined', {
        stream: {
          write: (message) => {
            console.log(message.trim());
          }
        }
      }));
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Default rate limiting (can be overridden per route)
    this.app.use(this.rateLimiter.middleware());

    // Health check endpoint (no auth required)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: this.config.name,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        circuitBreakers: circuitBreakerRegistry.getAllStats()
      });
    });

    // Readiness check endpoint
    this.app.get('/ready', async (req, res) => {
      try {
        // Check dependencies (override in subclass)
        const isReady = await this.checkReadiness();
        
        if (isReady) {
          res.json({
            status: 'ready',
            service: this.config.name,
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(503).json({
            status: 'not_ready',
            service: this.config.name,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        res.status(503).json({
          status: 'error',
          service: this.config.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Metrics endpoint (requires authentication)
    this.app.get('/metrics', 
      this.jwtManager.middleware({ required: true }),
      (req, res) => {
        res.json({
          service: this.config.name,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          circuitBreakers: circuitBreakerRegistry.getAllStats(),
          // Add custom metrics in subclass
          custom: this.getCustomMetrics()
        });
      }
    );
  }

  /**
   * Add routes (override in subclass)
   */
  setupRoutes() {
    // Override in subclass to add service-specific routes
    throw new Error('setupRoutes() must be implemented in subclass');
  }

  /**
   * Check service readiness (override in subclass)
   */
  async checkReadiness() {
    // Override in subclass to check dependencies
    return true;
  }

  /**
   * Get custom metrics (override in subclass)
   */
  getCustomMetrics() {
    // Override in subclass to return service-specific metrics
    return {};
  }

  /**
   * Set up error handling (must be called after routes)
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Error handler
    this.app.use(errorHandler({
      logErrors: this.config.env !== 'test',
      includeStackTrace: this.config.env === 'development'
    }));
  }

  /**
   * Start the server
   */
  async start() {
    // Set up routes
    this.setupRoutes();

    // Set up error handling (must be after routes)
    this.setupErrorHandling();

    // Start server
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`🚀 ${this.config.name} started on port ${this.config.port}`);
          resolve(this.server);
        }
      });
    });
  }

  /**
   * Stop the server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log(`${this.config.name} stopped`);
          resolve();
        });
      });
    }
  }

  /**
   * Get Express app instance
   */
  getApp() {
    return this.app;
  }

  /**
   * Add a circuit breaker for an external service
   */
  addCircuitBreaker(name, options) {
    return circuitBreakerRegistry.getBreaker(name, options);
  }

  /**
   * Create an authenticated route
   */
  authenticatedRoute(path, method, handler, options = {}) {
    const { permissions = [], serviceOnly = false } = options;
    
    const middlewares = [
      this.jwtManager.middleware({ required: true, serviceOnly })
    ];

    if (permissions.length > 0) {
      middlewares.push(
        this.permissionManager.requirePermissions(...permissions)
      );
    }

    this.app[method.toLowerCase()](path, ...middlewares, handler);
  }

  /**
   * Create a rate-limited route
   */
  rateLimitedRoute(path, method, handler, rateLimitOptions = {}) {
    this.app[method.toLowerCase()](
      path,
      this.rateLimiter.middleware(rateLimitOptions),
      handler
    );
  }
}

export default BaseServer;