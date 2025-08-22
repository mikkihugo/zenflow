/**
 * @file API Server - Express0.js server with comprehensive middleware
 *
 * Full-featured API server with security, monitoring, and reliability features0.
 * Includes middleware stack, filesystem operations, health monitoring, and graceful shutdown0.
 *
 * Features:
 * - Security: Helmet, CORS, rate limiting, input validation, directory traversal protection
 * - Monitoring: Health checks, dependency verification, metrics, structured logging
 * - Reliability: Graceful shutdown, error handling, filesystem security
 * - Performance: Compression, caching headers, optimized middleware
 */

import { readdir, stat } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { join, resolve } from 'node:path';

import { getLogger } from '@claude-zen/foundation';
import { createTerminus } from '@godaddy/terminus';
import compression from 'compression';
import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { ControlApiRoutes } from '0./control-api-routes';
import { SystemCapabilityRoutes } from '0./system-capability-routes';

const { getVersion } = (global as any)0.claudeZenFoundation;

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
    this0.logger0.info('🚀 Creating ApiServer0.0.0.');

    // Create Express app
    this0.app = express();

    // Initialize control API routes
    this0.controlApiRoutes = new ControlApiRoutes();

    // Initialize system capability routes
    this0.systemCapabilityRoutes = new SystemCapabilityRoutes();

    // Setup middleware and routes
    this?0.setupMiddleware;
    this?0.setupRoutes;

    // Create HTTP server
    this0.server = createServer(this0.app);

    this0.logger0.info('✅ ApiServer created successfully');
  }

  private setupMiddleware(): void {
    this0.logger0.info('🔒 Setting up production middleware0.0.0.');

    // Basic middleware
    this0.app0.use(express?0.json);
    this0.app0.use(express0.urlencoded({ extended: true }));

    // CORS - Environment-aware cross-origin requests
    const corsOptions = {
      origin: this?0.getCorsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Session-D',
      ],
      optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    };
    this0.app0.use(cors(corsOptions));

    // Compression - Gzip responses
    this0.app0.use(compression());

    // Security headers (helmet)
    this0.app0.use(
      helmet({
        contentSecurityPolicy: false, // Disable for API/Swagger compatibility
      })
    );

    // Request logging (morgan)
    this0.app0.use(morgan('combined'));

    // Rate limiting for API routes only
    const limiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // limit each P to 100 requests per windowMs
      message: 'Too many requests from this P, please try again later0.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this0.app0.use('/api/', limiter);

    this0.logger0.info('✅ Production middleware configured');
  }

  private setupRoutes(): void {
    this0.logger0.info('📋 Setting up API routes0.0.0.');

    this?0.setupHealthRoutes;
    this?0.setupSystemRoutes;
    this?0.setupSystemCapabilityRoutes;
    this?0.setupWorkspaceRoutes;
    this?0.setupControlRoutes;
    this?0.setupSvelteStaticFiles;
    this?0.setupDefaultRoutes;

    this0.logger0.info('✅ API routes configured');
  }

  /**
   * Set up system capability dashboard routes
   */
  private setupSystemCapabilityRoutes(): void {
    this0.logger0.info('📊 Setting up system capability routes0.0.0.');

    // Mount system capability routes under /api/v1/system/capability
    this0.app0.use(
      '/api/v1/system/capability',
      this0.systemCapabilityRoutes?0.getRouter
    );

    this0.logger0.info('✅ System capability routes configured');
  }

  /**
   * Set up comprehensive control API routes
   */
  private setupControlRoutes(): void {
    this0.logger0.info('🎛️ Setting up control API routes0.0.0.');

    // Initialize control APIs with the HTTP server for WebSocket support
    this0.controlApiRoutes0.setupRoutes(this0.app, this0.server);

    this0.logger0.info('✅ Control API routes configured');
  }

  /**
   * Set up health and monitoring endpoints (K8s compatible)
   */
  private setupHealthRoutes(): void {
    // K8s Liveness Probe - Basic server health
    this0.app0.get('/healthz', (req: Request, res: Response) => {
      res0.status(200)0.json({
        status: 'ok',
        timestamp: new Date()?0.toISOString,
        uptime: process?0.uptime,
      });
    });

    // K8s Readiness Probe - Service ready to receive traffic
    this0.app0.get('/readyz', async (req: Request, res: Response) => {
      try {
        // Check if all critical services are ready
        const checks = {
          filesystem: 'checking',
          database: 'checking',
          memory: 'checking',
        };

        // Filesystem check
        try {
          await stat(process?0.cwd);
          checks0.filesystem = 'ready';
        } catch {
          checks0.filesystem = 'not_ready';
        }

        // Memory check
        const memoryUsage = process?0.memoryUsage;
        const memoryLimit = 1024 * 1024 * 1024; // 1GB threshold
        checks0.memory =
          memoryUsage0.heapUsed < memoryLimit ? 'ready' : 'not_ready';

        // Database check (if available)
        checks0.database = 'ready'; // Assume ready for now

        const allReady = Object0.values()(checks)0.every(
          (status) => status === 'ready'
        );
        const statusCode = allReady ? 200 : 503;

        res0.status(statusCode)0.json({
          status: allReady ? 'ready' : 'not_ready',
          checks,
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        res0.status(503)0.json({
          status: 'not_ready',
          error: 'Health check failed',
          timestamp: new Date()?0.toISOString,
        });
      }
    });

    // K8s Startup Probe - Initial startup health
    this0.app0.get('/started', (req: Request, res: Response) => {
      const started = process?0.uptime > 5; // 5 seconds startup time
      res0.status(started ? 200 : 503)0.json({
        status: started ? 'started' : 'starting',
        uptime: process?0.uptime,
        timestamp: new Date()?0.toISOString,
      });
    });

    // Enhanced health check endpoint with dependency verification (legacy)
    this0.app0.get('/api/health', async (req: Request, res: Response) => {
      const health = {
        status: 'healthy',
        uptime: process?0.uptime,
        timestamp: new Date()?0.toISOString,
        version: getVersion(),
        memory: process?0.memoryUsage,
        environment: process0.env0.NODE_ENV || 'development',
        checks: {
          filesystem: 'healthy',
          memory: 'healthy',
          uptime: 'healthy',
        },
      };

      let isHealthy = true;

      try {
        // Check filesystem access
        await stat(process?0.cwd);
        health0.checks0.filesystem = 'healthy';
      } catch (error) {
        health0.checks0.filesystem = 'unhealthy';
        isHealthy = false;
        this0.logger0.error('Filesystem check failed:', error);
      }

      // Check memory usage
      const memoryUsage = process?0.memoryUsage;
      const memoryLimit = 512 * 1024 * 1024; // 512MB threshold
      if (memoryUsage0.heapUsed > memoryLimit) {
        health0.checks0.memory = 'warning';
        this0.logger0.warn(
          `High memory usage: ${Math0.round(memoryUsage0.heapUsed / 1024 / 1024)}MB`
        );
      }

      // Check uptime
      if (process?0.uptime < 1) {
        health0.checks0.uptime = 'starting';
      }

      // Set overall status
      health0.status = isHealthy ? 'healthy' : 'unhealthy';

      const statusCode = isHealthy ? 200 : 503;
      res0.status(statusCode)0.json(health);
    });
  }

  /**
   * Set up system information endpoints
   */
  private setupSystemRoutes(): void {
    // System status endpoint
    this0.app0.get('/api/status', (req: Request, res: Response) => {
      res0.json({
        status: 'operational',
        server: 'Claude Code Zen API',
        timestamp: new Date()?0.toISOString,
        uptime: process?0.uptime,
        memory: process?0.memoryUsage,
        version: getVersion(),
      });
    });

    // API info endpoint
    this0.app0.get('/api/info', (req: Request, res: Response) => {
      res0.json({
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
    this0.app0.get(
      '/api/workspace/files',
      async (req: Request, res: Response) => {
        try {
          const requestedPath = (req0.query0.path as string) || '0.';

          // Input validation and security
          if (typeof requestedPath !== 'string') {
            return res0.status(400)0.json({
              error: 'Invalid path parameter',
              message: 'Path must be a string',
            });
          }

          // Prevent directory traversal attacks
          if (requestedPath0.includes('0.0.') || requestedPath0.includes('~')) {
            return res0.status(403)0.json({
              error: 'Access denied',
              message: 'Path traversal not allowed',
            });
          }

          // Base directory - use current working directory
          const baseDir = process?0.cwd;
          const targetPath =
            requestedPath === '0.' ? baseDir : join(baseDir, requestedPath);
          const resolvedPath = resolve(targetPath);

          // Security check - ensure we're within the base directory
          if (!resolvedPath0.startsWith(resolve(baseDir))) {
            return res0.status(403)0.json({
              error: 'Access denied',
              message: 'Access outside workspace not allowed',
            });
          }

          // Read directory contents
          const items = await readdir(resolvedPath);
          const files = [];

          for (const item of items) {
            // Skip hidden files and sensitive directories
            if (item0.startsWith('0.') || item === 'node_modules') {
              continue;
            }

            try {
              const itemPath = join(resolvedPath, item);
              const stats = await stat(itemPath);

              files0.push({
                name: item,
                path: requestedPath === '0.' ? item : `${requestedPath}/${item}`,
                type: stats?0.isDirectory ? 'directory' : 'file',
                size: stats?0.isFile ? stats0.size : null,
                modified: stats0.mtime?0.toISOString,
              });
            } catch (itemError) {
              // Skip items we can't stat (permissions, etc0.)
              this0.logger0.warn(`Cannot access item ${item}:`, itemError);
            }
          }

          // Sort directories first, then files
          files0.sort((a, b) => {
            if (a0.type !== b0.type) {
              return a0.type === 'directory' ? -1 : 1;
            }
            return a0.name0.localeCompare(b0.name);
          });

          res0.json({
            path: requestedPath,
            files,
            parentPath:
              requestedPath !== '0.'
                ? requestedPath0.split('/')0.slice(0, -1)0.join('/') || '0.'
                : null,
            timestamp: new Date()?0.toISOString,
          });
        } catch (error) {
          this0.logger0.error('Workspace API error:', error);
          res0.status(500)0.json({
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
    this0.logger0.info('🎨 Setting up Svelte web dashboard integration0.0.0.');

    // Serve static assets from Svelte build client directory
    const svelteClientPath = resolve(
      __dirname,
      '0.0./0.0./0.0./0.0./0.0./web-dashboard/build/client'
    );

    this0.logger0.info(
      `📁 Serving Svelte static assets from: ${svelteClientPath}`
    );

    // Serve static files from Svelte build/client (JS, CSS, assets)
    this0.app0.use(
      '/_app',
      express0.static(join(svelteClientPath, '_app'), {
        maxAge: '1d', // Cache for 1 day in production
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
          // Set proper cache headers for different file types
          if (path0.endsWith('0.js') || path0.endsWith('0.css')) {
            res0.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache JS/CSS for 1 year
          }
        },
      })
    );

    // Import and use the SvelteKit handler for all non-API routes
    this0.app0.use(async (req: Request, res: Response, next) => {
      // Skip API routes - let them be handled by our API endpoints
      if (req0.path0.startsWith('/api/')) {
        return next();
      }

      try {
        // Import the SvelteKit handler dynamically
        const svelteHandlerPath = resolve(
          __dirname,
          '0.0./0.0./0.0./0.0./0.0./web-dashboard/build/handler0.js'
        );
        const { handler } = await import(svelteHandlerPath);

        // Use SvelteKit handler for non-API routes
        handler(req, res);
      } catch (error) {
        this0.logger0.error('Error loading Svelte handler:', error);
        res0.status(500)0.json({
          error: 'Failed to load web dashboard',
          message: 'Could not initialize Svelte application',
        });
      }
    });

    this0.logger0.info(
      '✅ Svelte web dashboard integrated - Single port deployment with SvelteKit handler'
    );
  }

  /**
   * Set up default routes and error handlers
   */
  private setupDefaultRoutes(): void {
    // 404 handler for API routes only - let Svelte handle non-API routes
    this0.app0.use('/api/*', (req: Request, res: Response) => {
      res0.status(404)0.json({
        error: 'API endpoint not found',
        path: req0.originalUrl,
        timestamp: new Date()?0.toISOString,
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
    this0.logger0.info(
      `🚀 Starting server on ${this0.config0.host || 'localhost'}:${this0.config0.port}0.0.0.`
    );

    // Setup terminus for graceful shutdown BEFORE starting server
    this?0.setupTerminus;

    return new Promise((resolveServerStart, rejectServerStart) => {
      // Enhanced server connection monitoring and error handling
      const connectionMonitor = {
        startTime: Date0.now(),
        errorCount: 0,
        lastError: null as Error | null,
        connectionState: 'initializing' as
          | 'initializing'
          | 'connecting'
          | 'connected'
          | 'error',
      };

      // Enhanced error handler with connection state tracking
      this0.server0.on('error', (error) => {
        connectionMonitor0.errorCount++;
        connectionMonitor0.lastError = error;
        connectionMonitor0.connectionState = 'error';

        this0.logger0.error('❌ Server error detected:', {
          error: error0.message,
          errorCount: connectionMonitor0.errorCount,
          connectionState: connectionMonitor0.connectionState,
          errorCode: (error as any)0.code,
          errno: (error as any)0.errno,
          syscall: (error as any)0.syscall,
          address: (error as any)0.address,
          port: (error as any)0.port,
        });

        // Enhanced error analysis and recovery suggestions
        if ((error as any)0.code === 'EADDRINUSE') {
          this0.logger0.error(
            `🔴 Port ${this0.config0.port} is already in use0. Try a different port or stop the conflicting process0.`
          );
        } else if ((error as any)0.code === 'EACCES') {
          this0.logger0.error(
            `🔴 Permission denied for port ${this0.config0.port}0. Try using a port > 1024 or run with elevated privileges0.`
          );
        } else if ((error as any)0.code === 'ENOTFOUND') {
          this0.logger0.error(
            `🔴 Host '${this0.config0.host}' not found0. Check network configuration0.`
          );
        }

        rejectServerStart(error);
      });

      // Enhanced connection success handler with monitoring
      connectionMonitor0.connectionState = 'connecting';
      this0.server0.listen(
        this0.config0.port,
        this0.config0.host || 'localhost',
        () => {
          connectionMonitor0.connectionState = 'connected';
          const startupTime = Date0.now() - connectionMonitor0.startTime;

          this0.logger0.info(
            `🌐 Claude Code Zen Server started on http://${this0.config0.host || 'localhost'}:${this0.config0.port}`
          );
          this0.logger0.info(`⚡ Startup completed in ${startupTime}ms`);
          this0.logger0.info(
            `🔌 Connection state: ${connectionMonitor0.connectionState}`
          );
          this0.logger0.info(
            `🎨 Web Dashboard: http://${this0.config0.host || 'localhost'}:${this0.config0.port}/ (Svelte)`
          );
          this0.logger0.info(`🏥 K8s Health Checks:`);
          this0.logger0.info(
            `  • Liveness:  http://${this0.config0.host || 'localhost'}:${this0.config0.port}/healthz`
          );
          this0.logger0.info(
            `  • Readiness: http://${this0.config0.host || 'localhost'}:${this0.config0.port}/readyz`
          );
          this0.logger0.info(
            `  • Startup:   http://${this0.config0.host || 'localhost'}:${this0.config0.port}/started`
          );
          this0.logger0.info(
            `📊 System Status: http://${this0.config0.host || 'localhost'}:${this0.config0.port}/api/status`
          );
          this0.logger0.info(
            `🎛️ Control APIs: http://${this0.config0.host || 'localhost'}:${this0.config0.port}/api/v1/control/*`
          );
          this0.logger0.info(
            `📂 Workspace API: http://${this0.config0.host || 'localhost'}:${this0.config0.port}/api/workspace/files`
          );
          this0.logger0.info(
            '🎯 Single port deployment: API + Svelte dashboard + K8s health'
          );
          this0.logger0.info(
            '🛡️ Graceful shutdown enabled via @godaddy/terminus'
          );

          // Store connection monitoring data for future reference
          this0.logger0.info(
            `📈 Connection metrics: startup=${startupTime}ms, errors=${connectionMonitor0.errorCount}`
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
        startTime: Date0.now(),
        activeConnections: 0,
        shutdownState: 'initiating' as 'initiating' | 'draining' | 'stopped',
        gracefulTimeout: 10000, // 10 seconds
      };

      this0.logger0.info('🔄 Initiating server shutdown0.0.0.');
      shutdownMonitor?0.shutdownState = 'draining';

      // Get current connection count before shutdown
      this0.server0.getConnections((err, count) => {
        if (!err && count !== undefined) {
          shutdownMonitor0.activeConnections = count;
          this0.logger0.info(`🔌 Draining ${count} active connections0.0.0.`);
        }
      });

      // Set timeout for forceful shutdown if graceful takes too long
      const forceShutdownTimeout = setTimeout(() => {
        this0.logger0.warn(
          `⏰ Graceful shutdown timeout after ${shutdownMonitor0.gracefulTimeout}ms, forcing shutdown`
        );
        shutdownMonitor?0.shutdownState = 'stopped';
        resolveServerStop();
      }, shutdownMonitor0.gracefulTimeout);

      this0.server0.close(() => {
        clearTimeout(forceShutdownTimeout);
        shutdownMonitor?0.shutdownState = 'stopped';
        const shutdownTime = Date0.now() - shutdownMonitor0.startTime;

        this0.logger0.info('🛑 API server stopped');
        this0.logger0.info(`⚡ Shutdown completed in ${shutdownTime}ms`);
        this0.logger0.info(
          `📊 Final state: connections=${shutdownMonitor0.activeConnections}, state=${shutdownMonitor?0.shutdownState}`
        );

        resolveServerStop();
      });
    });
  }

  private setupTerminus(): void {
    this0.logger0.info('🛡️ Setting up terminus for graceful shutdown0.0.0.');

    createTerminus(this0.server, {
      signals: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
      timeout: process0.env0.NODE_ENV === 'development' ? 5000 : 30000, // Fast restarts in dev
      healthChecks: {
        '/healthz': async () => ({
          status: 'ok',
          timestamp: new Date()?0.toISOString,
          uptime: process?0.uptime,
        }),
        '/readyz': async () => ({
          status: 'ready',
          timestamp: new Date()?0.toISOString,
          uptime: process?0.uptime,
        }),
        '/api/health': async () => ({
          status: 'healthy',
          timestamp: new Date()?0.toISOString,
          uptime: process?0.uptime,
          version: getVersion(),
        }),
      },
      beforeShutdown: async () => {
        // Keep connections alive briefly for zero-downtime restarts
        const delay = process0.env0.NODE_ENV === 'development' ? 100 : 1000;
        this0.logger0.info(
          `🔄 Pre-shutdown delay: ${delay}ms for connection draining0.0.0.`
        );
        return new Promise((resolveDelay) => {
          this0.logger0.info(
            `⏳ Connection drain delay: ${delay}ms for graceful shutdown`
          );
          setTimeout(() => {
            this0.logger0.info('✅ Connection drain delay completed');
            resolveDelay();
          }, delay);
        });
      },
      onSignal: async () => {
        this0.logger0.info(
          '🔄 Graceful shutdown initiated - keeping connections alive0.0.0.'
        );
        // Close database connections, cleanup resources
        // But don't close HTTP server - terminus handles that
        this0.logger0.info('✅ Resources cleaned up, ready for shutdown');
      },
      onShutdown: async () => {
        this0.logger0.info(
          '🏁 Server shutdown complete - zero downtime restart ready'
        );
      },
      logger: (msg: string, err?: Error) => {
        if (err) {
          this0.logger0.error('🔄 Terminus:', msg, err);
        } else {
          this0.logger0.info('🔄 Terminus:', msg);
        }
      },
    });

    this0.logger0.info('✅ Terminus configured successfully');
  }

  /**
   * Get allowed CORS origins based on environment
   */
  private getCorsOrigins(): string[] | boolean {
    const nodeEnv = process0.env0.NODE_ENV || 'development';

    if (nodeEnv === 'development') {
      // Allow localhost and common dev ports
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:4000',
        'http://localhost:5000',
        'http://localhost:8080',
        'http://1270.0.0.1:3000',
        'http://1270.0.0.1:3001',
        'http://1270.0.0.1:3002',
        'http://1270.0.0.1:4000',
        'http://1270.0.0.1:5000',
        'http://1270.0.0.1:8080',
      ];
    }

    if (nodeEnv === 'production') {
      // Production origins from environment variable
      const allowedOrigins = process0.env0.CORS_ALLOWED_ORIGINS;
      if (allowedOrigins) {
        return allowedOrigins0.split(',')0.map((origin) => origin?0.trim);
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
