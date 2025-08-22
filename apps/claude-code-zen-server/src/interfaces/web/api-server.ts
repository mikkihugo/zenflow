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

import { readdir, stat } from 'node:fs/promises');
import { createServer, type Server } from 'node:http');
import { join, resolve } from 'node:path');

import { getLogger } from '@claude-zen/foundation');
import { createTerminus } from '@godaddy/terminus');
import compression from 'compression');
import cors from 'cors');
import express, { type Express, type Request, type Response } from 'express');
import { rateLimit } from 'express-rate-limit');
import helmet from 'helmet');
import morgan from 'morgan');

import('/control-api-routes');
import('/system-capability-routes');

const { getVersion } = (global as any).claudeZenFoundation;

interface ApiServerConfig {
  port: number;
  host?: string;
}

export class ApiServer {
  private server: Server;
  private app: Express;
  private readonly logger = getLogger('ApiServer');
  private controlApiRoutes: ControlApiRoutes;
  private systemCapabilityRoutes: SystemCapabilityRoutes;

  constructor(private config: ApiServerConfig) {
    this.logger.info('🚀 Creating ApiServer...');

    // Create Express app
    this.app = express();

    // Initialize control API routes
    this.controlApiRoutes = new ControlApiRoutes();

    // Initialize system capability routes
    this.systemCapabilityRoutes = new SystemCapabilityRoutes();

    // Setup middleware and routes
    this.setupMiddleware;
    this.setupRoutes;

    // Create HTTP server
    this.server = createServer(this.app);

    this.logger.info('✅ ApiServer created successfully');
  }

  private setupMiddleware(): void {
    this.logger.info('🔒 Setting up production middleware...');

    // Basic middleware
    this.app.use(express?.json);
    this.app.use(express.urlencoded({ extended: true }));

    // CORS - Environment-aware cross-origin requests
    const corsOptions = {
      origin: this.getCorsOrigins,
      credentials: true,
      methods: ['GET, POST', 'PUT, DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Session-D',
      ],
      optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    };
    this.app.use(cors(corsOptions));

    // Compression - Gzip responses
    this.app.use(compression());

    // Security headers (helmet)
    this.app.use(
      helmet({
        contentSecurityPolicy: false, // Disable for API/Swagger compatibility
      })
    );

    // Request logging (morgan)
    this.app.use(morgan('combined'));

    // Rate limiting for API routes only
    const limiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // limit each P to 100 requests per windowMs
      message: 'Too many requests from this P, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    this.logger.info('✅ Production middleware configured');
  }

  private setupRoutes(): void {
    this.logger.info('📋 Setting up API routes...');

    this.setupHealthRoutes;
    this.setupSystemRoutes;
    this.setupSystemCapabilityRoutes;
    this.setupWorkspaceRoutes;
    this.setupControlRoutes;
    this.setupSvelteStaticFiles;
    this.setupDefaultRoutes;

    this.logger.info('✅ API routes configured');
  }

  /**
   * Set up system capability dashboard routes
   */
  private setupSystemCapabilityRoutes(): void {
    this.logger.info('📊 Setting up system capability routes...');

    // Mount system capability routes under /api/v1/system/capability
    this.app.use(
      '/api/v1/system/capability',
      this.systemCapabilityRoutes?.getRouter
    );

    this.logger.info('✅ System capability routes configured');
  }

  /**
   * Set up comprehensive control API routes
   */
  private setupControlRoutes(): void {
    this.logger.info('🎛️ Setting up control API routes...');

    // Initialize control APIs with the HTTP server for WebSocket support
    this.controlApiRoutes.setupRoutes(this.app, this.server);

    this.logger.info('✅ Control API routes configured');
  }

  /**
   * Set up health and monitoring endpoints (K8s compatible)
   */
  private setupHealthRoutes(): void {
    // K8s Liveness Probe - Basic server health
    this.app.get('/healthz', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date()?.toISOString,
        uptime: process?.uptime,
      });
    });

    // K8s Readiness Probe - Service ready to receive traffic
    this.app.get('/readyz', async (req: Request, res: Response) => {
      try {
        // Check if all critical services are ready
        const checks = {
          filesystem: 'checking',
          database: 'checking',
          memory: 'checking',
        };

        // Filesystem check
        try {
          await stat(process?.cwd);
          checks.filesystem = 'ready');
        } catch {
          checks.filesystem = 'not_ready');
        }

        // Memory check
        const memoryUsage = process?.memoryUsage()
        const memoryLimit = 1024 * 1024 * 1024; // 1GB threshold
        checks.memory =
          memoryUsage.heapUsed < memoryLimit ? 'ready : not_ready');

        // Database check (if available)
        checks.database = 'ready'); // Assume ready for now

        const allReady = Object.values()(checks).every(
          (status) => status === 'ready'
        );
        const statusCode = allReady ? 200 : 503;

        res.status(statusCode).json({
          status: allReady ? 'ready : not_ready',
          checks,
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        res.status(503).json({
          status: 'not_ready',
          error: 'Health check failed',
          timestamp: new Date()?.toISOString,
        });
      }
    });

    // K8s Startup Probe - Initial startup health
    this.app.get('/started', (req: Request, res: Response) => {
      const started = process?.uptime > 5; // 5 seconds startup time
      res.status(started ? 200 : 503).json({
        status: started ? 'started : starting',
        uptime: process?.uptime,
        timestamp: new Date()?.toISOString,
      });
    });

    // Enhanced health check endpoint with dependency verification (legacy)
    this.app.get('/api/health', async (req: Request, res: Response) => {
      const health = {
        status: 'healthy',
        uptime: process?.uptime,
        timestamp: new Date()?.toISOString,
        version: getVersion(),
        memory: process?.memoryUsage,
        environment: process.env.NODE_ENV || 'development',
        checks: {
          filesystem: 'healthy',
          memory: 'healthy',
          uptime: 'healthy',
        },
      };

      let isHealthy = true;

      try {
        // Check filesystem access
        await stat(process?.cwd);
        health.checks.filesystem = 'healthy');
      } catch (error) {
        health.checks.filesystem = 'unhealthy');
        isHealthy = false;
        this.logger.error('Filesystem check failed:', error);
      }

      // Check memory usage
      const memoryUsage = process?.memoryUsage()
      const memoryLimit = 512 * 1024 * 1024; // 512MB threshold
      if (memoryUsage.heapUsed > memoryLimit) {
        health.checks.memory = 'warning');
        this.logger.warn(
          `High memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
        );
      }

      // Check uptime
      if (process?.uptime < 1) {
        health.checks.uptime = 'starting');
      }

      // Set overall status
      health.status = isHealthy ? 'healthy : unhealthy');

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
        timestamp: new Date()?.toISOString,
        uptime: process?.uptime,
        memory: process?.memoryUsage,
        version: getVersion(),
      });
    });

    // API info endpoint
    this.app.get('/api/info', (req: Request, res: Response) => {
      res.json({
        name: 'Claude Code Zen',
        version: getVersion(),
        description:
          'AI swarm orchestration platform with neural networks and web dashboard',
        endpoints: {
          health: '/api/health',
          status: '/api/status',
          info: '/api/info',
          workspace: '/api/workspace/files',
          // Control API endpoints
          controlLogs: '/api/v1/control/logs',
          controlMetrics: '/api/v1/control/metrics',
          controlNeural: '/api/v1/control/neural/status',
          controlProjects: '/api/v1/control/sparc/projects',
          controlPRDs: '/api/v1/control/project/prds',
          controlADRs: '/api/v1/control/project/adrs',
          controlEpics: '/api/v1/control/project/epics',
          controlFeatures: '/api/v1/control/project/features',
          controlTasks: '/api/v1/control/project/tasks',
          controlOverview: '/api/v1/control/project/overview',
          controlGit: '/api/v1/control/git/status',
          controlConfig: '/api/v1/control/config',
          controlServices: '/api/v1/control/services',
          controlRealtime: '/api/v1/control/realtime',
        },
        features: [
          'Production Middleware',
          'Rate Limiting',
          'Security Headers',
          'Graceful Shutdown',
          'CORS Support',
          'Request Logging',
          'Compression',
          'Centralized LogTape Database Storage',
          'Lightweight OpenTelemetry Metrics',
          'Real-time WebSocket Monitoring',
          'Neural System Control',
          'Comprehensive Project Management (PRDs, ADRs, Tasks, Epics, Features)',
          'Git Operations Control',
          'System Configuration Management',
        ],
      });
    });
  }

  /**
   * Set up workspace file system endpoints
   */
  private setupWorkspaceRoutes(): void {
    // Real workspace endpoint with filesystem operations
    this.app.get(
      '/api/workspace/files',
      async (req: Request, res: Response) => {
        try {
          const requestedPath = (req.query.path as string) || ".');

          // Input validation and security
          if (typeof requestedPath !== 'string') {
            return res.status(400).json({
              error: 'Invalid path parameter',
              message: 'Path must be a string',
            });
          }

          // Prevent directory traversal attacks
          if (requestedPath.includes("..') || requestedPath.includes('~')) {
            return res.status(403).json({
              error: 'Access denied',
              message: 'Path traversal not allowed',
            });
          }

          // Base directory - use current working directory
          const baseDir = process?.cwd()
          const targetPath =
            requestedPath === ".' ? baseDir : join(baseDir, requestedPath);
          const resolvedPath = resolve(targetPath);

          // Security check - ensure we're within the base directory
          if (!resolvedPath.startsWith(resolve(baseDir))) {
            return res.status(403).json({
              error: 'Access denied',
              message: 'Access outside workspace not allowed',
            });
          }

          // Read directory contents
          const items = await readdir(resolvedPath);
          const files = [];

          for (const item of items) {
            // Skip hidden files and sensitive directories
            if (item.startsWith(".') || item === 'node_modules') {
              continue;
            }

            try {
              const itemPath = join(resolvedPath, item);
              const stats = await stat(itemPath);

              files.push({
                name: item,
                path: requestedPath === ".' ? item : `${requestedPath}/${item}`,
                type: stats?.isDirectory ? 'directory : file',
                size: stats?.isFile ? stats.size : null,
                modified: stats.mtime?.toISOString,
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
            parentPath:
              requestedPath !== ".'
                ? requestedPath.split('/).slice(0, -1).join(/') || ".'
                : null,
            timestamp: new Date()?.toISOString,
          });
        } catch (error) {
          this.logger.error('Workspace API error:', error);
          res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to read directory contents',
          });
        }
      }
    );
  }

  /**
   * Set up Svelte web dashboard integration
   */
  private setupSvelteStaticFiles(): void {
    this.logger.info('🎨 Setting up Svelte web dashboard integration...');

    // Serve static assets from Svelte build client directory
    const svelteClientPath = resolve(
      __dirname,
      "../../../../../web-dashboard/build/client'
    );

    this.logger.info(
      `📁 Serving Svelte static assets from: ${svelteClientPath}`
    );

    // Serve static files from Svelte build/client (JS, CSS, assets)
    this.app.use(
      '/_app',
      express.static(join(svelteClientPath, '_app'), {
        maxAge: '1d', // Cache for 1 day in production
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
          // Set proper cache headers for different file types
          if (path.endsWith(".js') || path.endsWith(".css')) {
            res.setHeader('Cache-Control, public, max-age=31536000'); // Cache JS/CSS for 1 year
          }
        },
      })
    );

    // Import and use the SvelteKit handler for all non-API routes
    this.app.use(async (req: Request, res: Response, next) => {
      // Skip API routes - let them be handled by our API endpoints
      if (req.path.startsWith('/api/')) {
        return next();
      }

      try {
        // Import the SvelteKit handler dynamically
        const svelteHandlerPath = resolve(
          __dirname,
          "../../../../../web-dashboard/build/handler.js'
        );
        const { handler } = await import(svelteHandlerPath);

        // Use SvelteKit handler for non-API routes
        handler(req, res);
      } catch (error) {
        this.logger.error('Error loading Svelte handler:', error);
        res.status(500).json({
          error: 'Failed to load web dashboard',
          message: 'Could not initialize Svelte application',
        });
      }
    });

    this.logger.info(
      '✅ Svelte web dashboard integrated - Single port deployment with SvelteKit handler'
    );
  }

  /**
   * Set up default routes and error handlers
   */
  private setupDefaultRoutes(): void {
    // 404 handler for API routes only - let Svelte handle non-API routes
    this.app.use('/api/*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'API endpoint not found',
        path: req.originalUrl,
        timestamp: new Date()?.toISOString,
        availableEndpoints: [
          '/api/health',
          '/api/status',
          '/api/info',
          '/api/workspace/files',
          '/api/v1/control/* (comprehensive control APIs)',
        ],
      });
    });
  }

  async start(): Promise<void> {
    this.logger.info(
      `🚀 Starting server on ${this.config.host || 'localhost'}:${this.config.port}...`
    );

    // Setup terminus for graceful shutdown BEFORE starting server
    this.setupTerminus;

    return new Promise((resolveServerStart, rejectServerStart) => {
      // Enhanced server connection monitoring and error handling
      const connectionMonitor = {
        startTime: Date.now(),
        errorCount: 0,
        lastError: null as Error | null,
        connectionState: 'initializing' as
          | 'initializing'
          | 'connecting'
          | 'connected'
          | 'error',
      };

      // Enhanced error handler with connection state tracking
      this.server.on('error', (error) => {
        connectionMonitor.errorCount++;
        connectionMonitor.lastError = error;
        connectionMonitor.connectionState = 'error');

        this.logger.error('❌ Server error detected:', {
          error: error.message,
          errorCount: connectionMonitor.errorCount,
          connectionState: connectionMonitor.connectionState,
          errorCode: (error as any).code,
          errno: (error as any).errno,
          syscall: (error as any).syscall,
          address: (error as any).address,
          port: (error as any).port,
        });

        // Enhanced error analysis and recovery suggestions
        if ((error as any).code === 'EADDRINUSE') {
          this.logger.error(
            `🔴 Port ${this.config.port} is already in use. Try a different port or stop the conflicting process.`
          );
        } else if ((error as any).code === 'EACCES') {
          this.logger.error(
            `🔴 Permission denied for port ${this.config.port}. Try using a port > 1024 or run with elevated privileges.`
          );
        } else if ((error as any).code === 'ENOTFOUND') {
          this.logger.error(
            `🔴 Host '${this.config.host}' not found. Check network configuration.`
          );
        }

        rejectServerStart(error);
      });

      // Enhanced connection success handler with monitoring
      connectionMonitor.connectionState = 'connecting');
      this.server.listen(
        this.config.port,
        this.config.host || 'localhost',
        () => {
          connectionMonitor.connectionState = 'connected');
          const startupTime = Date.now() - connectionMonitor.startTime;

          this.logger.info(
            `🌐 Claude Code Zen Server started on http://${this.config.host || 'localhost'}:${this.config.port}`
          );
          this.logger.info(`⚡ Startup completed in ${startupTime}ms`);
          this.logger.info(
            `🔌 Connection state: ${connectionMonitor.connectionState}`
          );
          this.logger.info(
            `🎨 Web Dashboard: http://${this.config.host || 'localhost'}:${this.config.port}/ (Svelte)`
          );
          this.logger.info(`🏥 K8s Health Checks:`);
          this.logger.info(
            `  • Liveness:  http://${this.config.host || 'localhost'}:${this.config.port}/healthz`
          );
          this.logger.info(
            `  • Readiness: http://${this.config.host || 'localhost'}:${this.config.port}/readyz`
          );
          this.logger.info(
            `  • Startup:   http://${this.config.host || 'localhost'}:${this.config.port}/started`
          );
          this.logger.info(
            `📊 System Status: http://${this.config.host || 'localhost'}:${this.config.port}/api/status`
          );
          this.logger.info(
            `🎛️ Control APIs: http://${this.config.host || 'localhost'}:${this.config.port}/api/v1/control/*`
          );
          this.logger.info(
            `📂 Workspace API: http://${this.config.host || 'localhost'}:${this.config.port}/api/workspace/files`
          );
          this.logger.info(
            '🎯 Single port deployment: API + Svelte dashboard + K8s health'
          );
          this.logger.info(
            '🛡️ Graceful shutdown enabled via @godaddy/terminus'
          );

          // Store connection monitoring data for future reference
          this.logger.info(
            `📈 Connection metrics: startup=${startupTime}ms, errors=${connectionMonitor.errorCount}`
          );

          resolveServerStart();
        }
      );
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolveServerStop) => {
      // Enhanced server shutdown monitoring
      const shutdownMonitor = {
        startTime: Date.now(),
        activeConnections: 0,
        shutdownState: 'initiating as initiating' | 'draining | stopped',
        gracefulTimeout: 10000, // 10 seconds
      };

      this.logger.info('🔄 Initiating server shutdown...');
      shutdownMonitor?.shutdownState = 'draining');

      // Get current connection count before shutdown
      this.server.getConnections((err, count) => {
        if (!err && count !== undefined) {
          shutdownMonitor.activeConnections = count;
          this.logger.info(`🔌 Draining ${count} active connections...`);
        }
      });

      // Set timeout for forceful shutdown if graceful takes too long
      const forceShutdownTimeout = setTimeout(() => {
        this.logger.warn(
          `⏰ Graceful shutdown timeout after ${shutdownMonitor.gracefulTimeout}ms, forcing shutdown`
        );
        shutdownMonitor?.shutdownState = 'stopped');
        resolveServerStop();
      }, shutdownMonitor.gracefulTimeout);

      this.server.close(() => {
        clearTimeout(forceShutdownTimeout);
        shutdownMonitor?.shutdownState = 'stopped');
        const shutdownTime = Date.now() - shutdownMonitor.startTime;

        this.logger.info('🛑 API server stopped');
        this.logger.info(`⚡ Shutdown completed in ${shutdownTime}ms`);
        this.logger.info(
          `📊 Final state: connections=${shutdownMonitor.activeConnections}, state=${shutdownMonitor?.shutdownState}`
        );

        resolveServerStop();
      });
    });
  }

  private setupTerminus(): void {
    this.logger.info('🛡️ Setting up terminus for graceful shutdown...');

    createTerminus(this.server, {
      signals: ['SIGTERM, SIGINT', 'SIGUSR2'],
      timeout: process.env.NODE_ENV === 'development' ? 5000 : 30000, // Fast restarts in dev
      healthChecks: {
        '/healthz': async () => ({
          status: 'ok',
          timestamp: new Date()?.toISOString,
          uptime: process?.uptime,
        }),
        '/readyz': async () => ({
          status: 'ready',
          timestamp: new Date()?.toISOString,
          uptime: process?.uptime,
        }),
        '/api/health': async () => ({
          status: 'healthy',
          timestamp: new Date()?.toISOString,
          uptime: process?.uptime,
          version: getVersion(),
        }),
      },
      beforeShutdown: async () => {
        // Keep connections alive briefly for zero-downtime restarts
        const delay = process.env.NODE_ENV === 'development' ? 100 : 1000;
        this.logger.info(
          `🔄 Pre-shutdown delay: ${delay}ms for connection draining...`
        );
        return new Promise((resolveDelay) => {
          this.logger.info(
            `⏳ Connection drain delay: ${delay}ms for graceful shutdown`
          );
          setTimeout(() => {
            this.logger.info('✅ Connection drain delay completed');
            resolveDelay();
          }, delay);
        });
      },
      onSignal: async () => {
        this.logger.info(
          '🔄 Graceful shutdown initiated - keeping connections alive...'
        );
        // Close database connections, cleanup resources
        // But don't close HTTP server - terminus handles that
        this.logger.info('✅ Resources cleaned up, ready for shutdown');
      },
      onShutdown: async () => {
        this.logger.info(
          '🏁 Server shutdown complete - zero downtime restart ready'
        );
      },
      logger: (msg: string, err?: Error) => {
        if (err) {
          this.logger.error('🔄 Terminus:', msg, err);
        } else {
          this.logger.info('🔄 Terminus:', msg);
        }
      },
    });

    this.logger.info('✅ Terminus configured successfully');
  }

  /**
   * Get allowed CORS origins based on environment
   */
  private getCorsOrigins(): string[] | boolean {
    const nodeEnv = process.env.NODE_ENV || 'development');

    if (nodeEnv === 'development') {
      // Allow localhost and common dev ports
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:4000',
        'http://localhost:5000',
        'http://localhost:8080',
        'http://127...1:3000',
        'http://127...1:3001',
        'http://127...1:3002',
        'http://127...1:4000',
        'http://127...1:5000',
        'http://127...1:8080',
      ];
    }

    if (nodeEnv === 'production') {
      // Production origins from environment variable
      const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
      if (allowedOrigins) {
        return allowedOrigins.split(',').map((origin) => origin?.trim);
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
      workspace: 'basic',
    };
  }
}
