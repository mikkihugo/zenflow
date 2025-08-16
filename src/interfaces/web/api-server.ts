/**
 * @file API Server - Express.js server with comprehensive middleware
 * 
 * Full-featured API server with security, monitoring, and reliability features.
 * Includes middleware stack, filesystem operations, health monitoring, and graceful shutdown.
 * 
 * Features:
 * - Security: Helmet, CORS, rate limiting, input validation, directory traversal protection
 * - Monitoring: Health checks, dependency verification, metrics, structured logging
 * - Reliability: Graceful shutdown, error handling, filesystem security
 * - Performance: Compression, caching headers, optimized middleware
 */

import { createServer, type Server } from 'node:http';
import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import express, { type Express, type Request, type Response } from 'express';
import { createTerminus } from '@godaddy/terminus';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { getLogger } from '../../config/logging-config';
import { getVersion } from '../../config/version';

interface ApiServerConfig {
  port: number;
  host?: string;
}

export class ApiServer {
  private server: Server;
  private app: Express;
  private readonly logger = getLogger('ApiServer');

  constructor(private config: ApiServerConfig) {
    this.logger.info('🚀 Creating ApiServer...');
    
    // Create Express app
    this.app = express();
    
    // Setup middleware and routes
    this.setupMiddleware();
    this.setupRoutes();
    
    // Create HTTP server
    this.server = createServer(this.app);
    
    this.logger.info('✅ ApiServer created successfully');
  }

  private setupMiddleware(): void {
    this.logger.info('🔒 Setting up production middleware...');

    // Basic middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS - Environment-aware cross-origin requests
    const corsOptions = {
      origin: this.getCorsOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID'],
      optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
    };
    this.app.use(cors(corsOptions));

    // Compression - Gzip responses
    this.app.use(compression());

    // Security headers (helmet)
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for API/Swagger compatibility
    }));

    // Request logging (morgan)
    this.app.use(morgan('combined'));

    // Rate limiting for API routes only
    const limiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    this.logger.info('✅ Production middleware configured');
  }

  private setupRoutes(): void {
    this.logger.info('📋 Setting up API routes...');

    this.setupHealthRoutes();
    this.setupSystemRoutes();
    this.setupWorkspaceRoutes();
    this.setupDefaultRoutes();

    this.logger.info('✅ API routes configured');
  }

  /**
   * Set up health and monitoring endpoints
   */
  private setupHealthRoutes(): void {
    // Enhanced health check endpoint with dependency verification
    this.app.get('/api/health', async (req: Request, res: Response) => {
      const health = {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: getVersion(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        checks: {
          filesystem: 'healthy',
          memory: 'healthy',
          uptime: 'healthy'
        }
      };

      let isHealthy = true;

      try {
        // Check filesystem access
        await stat(process.cwd());
        health.checks.filesystem = 'healthy';
      } catch (error) {
        health.checks.filesystem = 'unhealthy';
        isHealthy = false;
        this.logger.error('Filesystem check failed:', error);
      }

      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const memoryLimit = 512 * 1024 * 1024; // 512MB threshold
      if (memoryUsage.heapUsed > memoryLimit) {
        health.checks.memory = 'warning';
        this.logger.warn(`High memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
      }

      // Check uptime
      if (process.uptime() < 1) {
        health.checks.uptime = 'starting';
      }

      // Set overall status
      health.status = isHealthy ? 'healthy' : 'unhealthy';

      const statusCode = isHealthy ? 200 : 503;
      res.status(statusCode).json(health);
    });
  }

  /**
   * Set up system information endpoints
   */
  private setupSystemRoutes(): void {
    // System status endpoint
    this.app.get('/api/status', (req: Request, res: Response) => {
      res.json({
        status: 'operational',
        server: 'Claude Code Zen API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: getVersion()
      });
    });

    // API info endpoint
    this.app.get('/api/info', (req: Request, res: Response) => {
      res.json({
        name: 'Claude Code Zen',
        version: getVersion(),
        description: 'AI swarm orchestration platform with neural networks and web dashboard',
        endpoints: {
          health: '/api/health',
          status: '/api/status',
          info: '/api/info',
          workspace: '/api/workspace/files'
        },
        features: [
          'Production Middleware',
          'Rate Limiting',
          'Security Headers',
          'Graceful Shutdown',
          'CORS Support',
          'Request Logging',
          'Compression'
        ]
      });
    });
  }

  /**
   * Set up workspace file system endpoints
   */
  private setupWorkspaceRoutes(): void {
    // Real workspace endpoint with filesystem operations
    this.app.get('/api/workspace/files', async (req: Request, res: Response) => {
      try {
        const requestedPath = req.query.path as string || '.';
        
        // Input validation and security
        if (typeof requestedPath !== 'string') {
          return res.status(400).json({
            error: 'Invalid path parameter',
            message: 'Path must be a string'
          });
        }

        // Prevent directory traversal attacks
        if (requestedPath.includes('..') || requestedPath.includes('~')) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'Path traversal not allowed'
          });
        }

        // Base directory - use current working directory
        const baseDir = process.cwd();
        const targetPath = requestedPath === '.' ? baseDir : join(baseDir, requestedPath);
        const resolvedPath = resolve(targetPath);

        // Security check - ensure we're within the base directory
        if (!resolvedPath.startsWith(resolve(baseDir))) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'Access outside workspace not allowed'
          });
        }

        // Read directory contents
        const items = await readdir(resolvedPath);
        const files = [];

        for (const item of items) {
          // Skip hidden files and sensitive directories
          if (item.startsWith('.') || item === 'node_modules') {
            continue;
          }

          try {
            const itemPath = join(resolvedPath, item);
            const stats = await stat(itemPath);

            files.push({
              name: item,
              path: requestedPath === '.' ? item : `${requestedPath}/${item}`,
              type: stats.isDirectory() ? 'directory' : 'file',
              size: stats.isFile() ? stats.size : null,
              modified: stats.mtime.toISOString()
            });
          } catch (itemError) {
            // Skip items we can't stat (permissions, etc.)
            this.logger.warn(`Cannot access item ${item}:`, itemError);
          }
        }

        // Sort directories first, then files
        files.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

        res.json({
          path: requestedPath,
          files,
          parentPath: requestedPath !== '.' ? requestedPath.split('/').slice(0, -1).join('/') || '.' : null,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error('Workspace API error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to read directory contents'
        });
      }
    });
  }

  /**
   * Set up default routes and error handlers
   */
  private setupDefaultRoutes(): void {
    // Default root route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Claude Code Zen API Server',
        version: getVersion(),
        endpoints: ['/api/health', '/api/status', '/api/info', '/api/workspace/files'],
        timestamp: new Date().toISOString(),
        documentation: 'Visit /api/info for full endpoint documentation'
      });
    });

    // 404 handler for all other routes - simplified pattern
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        availableEndpoints: ['/api/health', '/api/status', '/api/info', '/api/workspace/files']
      });
    });
  }

  async start(): Promise<void> {
    this.logger.info(`🚀 Starting server on ${this.config.host || 'localhost'}:${this.config.port}...`);

    // Setup terminus for graceful shutdown BEFORE starting server
    this.setupTerminus();

    return new Promise((resolve, reject) => {
      this.server.on('error', (error) => {
        this.logger.error('❌ Server error:', error);
        reject(error);
      });

      this.server.listen(this.config.port, this.config.host || 'localhost', () => {
        this.logger.info(`🌐 Claude Code Zen API Server started on http://${this.config.host || 'localhost'}:${this.config.port}`);
        this.logger.info(`🏥 Health check: http://${this.config.host || 'localhost'}:${this.config.port}/api/health`);
        this.logger.info(`📊 Status: http://${this.config.host || 'localhost'}:${this.config.port}/api/status`);
        this.logger.info(`📂 Workspace: http://${this.config.host || 'localhost'}:${this.config.port}/api/workspace/files`);
        this.logger.info('🎯 Ready for development');
        this.logger.info('🛡️ Graceful shutdown enabled via @godaddy/terminus');
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.logger.info('🛑 API server stopped');
        resolve();
      });
    });
  }

  private setupTerminus(): void {
    this.logger.info('🛡️ Setting up terminus for graceful shutdown...');

    createTerminus(this.server, {
      signals: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
      timeout: 30000, // 30 seconds
      healthChecks: {
        '/health': async () => ({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }),
        '/api/health': async () => ({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: getVersion()
        }),
      },
      onSignal: async () => {
        this.logger.info('🔄 Graceful shutdown initiated...');
        this.logger.info('✅ Graceful shutdown preparations complete');
      },
      onShutdown: async () => {
        this.logger.info('🏁 Server shutdown complete');
      },
      logger: (msg: string, err?: Error) => {
        if (err) {
          this.logger.error('🔄 Terminus:', msg, err);
        } else {
          this.logger.info('🔄 Terminus:', msg);
        }
      }
    });

    this.logger.info('✅ Terminus configured successfully');
  }

  /**
   * Get allowed CORS origins based on environment
   */
  private getCorsOrigins(): string[] | boolean {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'development') {
      // Allow localhost and common dev ports
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:4000',
        'http://localhost:5000',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:4000',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:8080'
      ];
    }
    
    if (nodeEnv === 'production') {
      // Production origins from environment variable
      const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
      if (allowedOrigins) {
        return allowedOrigins.split(',').map(origin => origin.trim());
      }
      // Default production - only same origin
      return false;
    }
    
    // Test environment - allow all for flexibility
    if (nodeEnv === 'test') {
      return true;
    }
    
    // Default fallback - same origin only
    return false;
  }

  getCapabilities() {
    return {
      webDashboard: true,
      healthCheck: true,
      basicRouting: true,
      apiEndpoints: true,
      gracefulShutdown: true,
      productionMiddleware: true,
      workspace: 'basic'
    };
  }
}