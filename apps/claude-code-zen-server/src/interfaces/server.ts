/**
 * @file Unified Express Server for Claude-Zen
 * Consolidates all Express servers into one with organized routes.
 */

import { createServer } from 'http';
import path from 'path';

import { Logger, Config } from '@claude-zen/foundation';
import type { SystemConfiguration } from '@claude-zen/infrastructure';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Server as SocketIOServer } from 'socket.io';
// Foundation package - unified interface for all shared utilities

// Type moved to @claude-zen/infrastructure

const logger = new Logger('interfaces-server');
const config = new Config();

// Server-specific configuration interface
interface ServerConfig {
  port: number;
  host: string;
  features: {
    mcp: boolean;
    api: boolean;
    dashboard: boolean;
    monitoring: boolean;
    websocket: boolean;
  };
  middleware: {
    logging: boolean;
    helmet: boolean;
    compression: boolean;
    cors: boolean;
    rateLimit: boolean;
  };
}

export class UnifiedClaudeZenServer {
  private app: express.Application;
  private server: unknown = null;
  private io?: SocketIOServer;
  private config: ServerConfig;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.config = this.buildServerConfig();
  }

  private buildServerConfig(): ServerConfig {
    // Get the full system configuration using foundation Config
    const systemConfig = config.has('system') ? config.get<SystemConfiguration>('system') : null;

    // Default fallback configuration if system config is not available
    const defaultConfig: ServerConfig = {
      port: 3000,
      host: 'localhost',
      features: {
        mcp: true,
        api: true,
        dashboard: true,
        monitoring: true,
        websocket: true,
      },
      middleware: {
        logging: true,
        helmet: true,
        compression: true,
        cors: true,
        rateLimit: true,
      },
    };

    if (!systemConfig) {
      return defaultConfig;
    }

    // Transform SystemConfiguration to ServerConfig
    return {
      port:
        systemConfig.interfaces?.web?.port ||
        systemConfig.interfaces?.mcp?.http?.port ||
        defaultConfig.port,
      host:
        systemConfig.interfaces?.web?.host ||
        systemConfig.interfaces?.mcp?.http?.host ||
        defaultConfig.host,
      features: {
        mcp: true, // MCP always enabled for this unified server
        api: true, // API always enabled
        dashboard: true, // Web dashboard always enabled
        monitoring: systemConfig.core?.performance?.enableMetrics !== false,
        websocket: true, // WebSocket support enabled by default
      },
      middleware: {
        logging: systemConfig.core?.logger?.console !== false,
        helmet: systemConfig.core?.security?.enableSandbox !== false,
        compression: systemConfig.interfaces?.web?.enableCompression !== false,
        cors: systemConfig.interfaces?.mcp?.http?.enableCors !== false,
        rateLimit: !systemConfig.environment?.allowUnsafeOperations, // Enable rate limiting unless unsafe operations allowed
      },
    };
  }

  async initialize(): Promise<void> {
    // Initialize using foundation logger
    if (this.config.middleware.logging) {
      logger.info('Initializing unified server', {
        port: this.config.port,
        features: this.config.features,
      });
    }

    // Apply security middleware
    if (this.config.middleware.helmet) {
      this.app.use(
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
            },
          },
        })
      );
    }

    // Apply performance middleware
    if (this.config.middleware.compression) {
      this.app.use(compression());
    }

    // Apply CORS
    if (this.config.middleware.cors) {
      this.app.use(
        cors({
          origin: this.getAllowedOrigins(),
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-D'],
        })
      );
    }

    // Apply rate limiting
    if (this.config.middleware.rateLimit) {
      this.app.use(
        rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 1000, // Limit each P to 1000 requests per windowMs
          message: 'Too many requests from this P',
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    }

    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request/response logging using foundation logger
    if (this.config.middleware.logging) {
      this.app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          logger.info('Request processed', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`
          });
        });
        next();
      });
    }

    // Static files for web dashboard
    const staticPath = path.join(process.cwd(), 'public');
    this.app.use('/static', express.static(staticPath));

    // Health check endpoint (available on all servers)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'unified-claude-zen-server',
        features: this.config.features,
        uptime: process.uptime(),
      });
    });

    // Root endpoint with server info
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Claude-Zen Unified Server',
        version: '1.0.0',
        description: 'Consolidated Express server for all Claude-Zen services',
        endpoints: {
          health: '/health',
          ...(this.config.features.mcp && { mcp: '/mcp' }),
          ...(this.config.features.api && { api: '/api/v1' }),
          ...(this.config.features.dashboard && { dashboard: '/dashboard' }),
          ...(this.config.features.monitoring && { monitoring: '/monitoring' }),
        },
        features: this.config.features,
      });
    });

    // Additional API endpoints
    this.app.get('/api/status', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'running',
          mode: 'unified-server',
          version: '1.0.0-alpha.44',
          features: this.config.features,
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }
      });
    });

    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0-alpha.44',
        uptime: process.uptime()
      });
    });

    // Monitoring dashboard endpoint
    this.app.get('/api/monitoring/dashboard', (req, res) => {
      res.json({
        success: true,
        data: {
          system: {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
          },
          metrics: {
            requests_total: 0,
            response_time_avg: '3ms',
            active_connections: 1
          },
          features: this.config.features,
          timestamp: new Date().toISOString()
        }
      });
    });

    // Mount route handlers based on enabled features
    await this.setupRoutes();

    // WebSocket setup
    if (this.config.features.websocket && this.io) {
      this.setupWebSocket();
    }

    // Error handling middleware using foundation logger
    if (this.config.middleware.logging) {
      this.app.use((err: any, req: any, res: any, next: any) => {
        logger.error('Express error middleware', {
          error: err.message,
          stack: err.stack,
          url: req.url,
          method: req.method
        });
        next(err);
      });
    }

    // Global error handler
    this.app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        logger.error('Unhandled server error', {
          error: err.message,
          stack: err.stack,
          url: req.url,
          method: req.method,
        });

        res.status((err as any).status || 500).json({
          error: 'Internal server error',
          message:
            process.env['NODE_ENV'] === 'production'
              ? 'Something went wrong'
              : err.message,
          timestamp: new Date().toISOString(),
        });
      }
    );

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`,
        availableEndpoints: Object.keys(this.config.features).filter(
          (f) => this.config.features[f as keyof typeof this.config.features]
        ),
      });
    });
  }

  private async setupRoutes(): Promise<void> {
    // Temporarily create placeholder routes until we migrate the real ones

    if (this.config.features.mcp) {
      // MCP Protocol routes (from http-mcp-server.ts)
      this.app.use('/mcp', (req, res, next) => {
        // Placeholder - will be replaced with actual MCP routes
        res.json({
          service: 'MCP Protocol',
          status: 'active',
          message: 'MCP routes will be migrated here from http-mcp-server',
        });
      });
    }

    if (this.config.features.api) {
      // Import route modules
      const { createCoordinationRoutes } = await import('./api/http/v1/coordination');
      const { createDatabaseRoutes } = await import('./api/http/v1/database');
      const { createDocumentRoutes } = await import('./api/http/v1/documents');
      const { createMemoryRoutes } = await import('./api/http/v1/memory');
      const { createProjectRoutes } = await import('./api/http/v1/projects');

      // Mount REST API routes
      this.app.use('/api/v1/coordination', createCoordinationRoutes());
      this.app.use('/api/v1/database', createDatabaseRoutes());
      this.app.use('/api/v1/documents', createDocumentRoutes());
      this.app.use('/api/v1/memory', createMemoryRoutes());
      this.app.use('/api/v1/projects', createProjectRoutes());

      logger.info('REST API routes mounted', {
        routes: ['coordination', 'database', 'documents', 'memory', 'projects']
      });
    }

    if (this.config.features.dashboard) {
      // Web dashboard routes (from web-interface-server.ts)
      this.app.use('/dashboard', (req, res, next) => {
        // Placeholder - will be replaced with actual web routes
        res.json({
          service: 'Web Dashboard',
          status: 'active',
          message:
            'Dashboard routes will be migrated here from web-interface-server',
        });
      });
    }

    if (this.config.features.monitoring) {
      // Monitoring dashboard routes (from dashboard-server.ts)
      this.app.use('/monitoring', (req, res, next) => {
        // Placeholder - will be replaced with actual monitoring routes
        res.json({
          service: 'Monitoring Dashboard',
          status: 'active',
          message:
            'Monitoring routes will be migrated here from dashboard-server',
        });
      });
    }
  }

  private setupWebSocket(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info('WebSocket client connected', {
        socketId: socket.id,
        clientIP: socket.handshake.address,
      });

      // Namespace for different services
      socket.on('join-service', (service: string) => {
        socket.join(`service:${service}`);
        logger.debug('Client joined service namespace', {
          socketId: socket.id,
          service,
        });
      });

      socket.on('disconnect', (reason) => {
        logger.info('WebSocket client disconnected', {
          socketId: socket.id,
          reason,
        });
      });
    });
  }

  private getAllowedOrigins(): string[] {
    // Allow common development and production origins
    return [
      'http://localhost:3000',
      'http://localhost:3456', // Legacy web dashboard port
      'http://127.0.0.1:3000',
      'https://claude.ai',
      // Add production domains as needed
    ];
  }

  async start(): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.server!.listen(this.config.port, this.config.host, () => {
        logger.info('Server started successfully', {
          port: this.config.port,
          host: this.config.host,
          features: this.config.features,
          pid: process.pid,
        });

        console.log(`🚀 Unified Claude-Zen Server started:`);
        console.log(
          `   📍 Address: http://${this.config.host}:${this.config.port}`
        );
        console.log(
          `   🔧 Features: ${Object.keys(this.config.features)
            .filter(
              (f) =>
                this.config.features[f as keyof typeof this.config.features]
            )
            .join(', ')}`
        );
        console.log(
          `   💡 Health: http://${this.config.host}:${this.config.port}/health`
        );

        resolve();
      }).on('error', (err: any) => {
        logger.error('Server failed to start', {
          error: err.message,
          stack: err.stack,
        });
        reject(err);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      logger.info('Server stopping', { port: this.config.port });

      this.server!.close(() => {
        logger.info('Server stopped successfully', { port: this.config.port });
        console.log('🛑 Unified Claude-Zen Server stopped');
        resolve();
      });
    });
  }

  // Getters for external access
  getApp(): express.Application {
    return this.app;
  }

  getServer(): unknown {
    return this.server;
  }

  getSocketIO(): SocketIOServer | undefined {
    return this.io;
  }
}

// Default server instance
export const unifiedServer = new UnifiedClaudeZenServer();

// Backward compatibility exports
export { UnifiedClaudeZenServer as HTTPMCPServer };
export { UnifiedClaudeZenServer as WebInterfaceServer };
export { UnifiedClaudeZenServer as APIServer };
export { UnifiedClaudeZenServer as DashboardServer };

export default UnifiedClaudeZenServer;
