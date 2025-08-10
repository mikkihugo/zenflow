/**
 * @file Unified Express Server for Claude-Zen
 * Consolidates all Express servers into one with organized routes.
 */

import compression from 'compression';
import cors from 'cors';
import { randomUUID } from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import path from 'path';
import type { Server as SocketIOServer } from 'socket.io';
// Configuration system
import { config } from '../config';
import type { SystemConfiguration } from '../config/types';
// LogTape integration
import {
  createAppLogger,
  createExpressErrorLoggingMiddleware,
  createExpressLoggingMiddleware,
  initializeLogging,
  logServerEvent,
} from '../utils/logging-config.js';

// Route handlers (to be created)
// import { mcpRoutes } from './routes/mcp-routes.js';
// import { apiRoutes } from './routes/api-routes.js';
// import { webRoutes } from './routes/web-routes.js';
// import { monitoringRoutes } from './routes/monitoring-routes.js';

const logger = createAppLogger();

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
  private server: any;
  private io?: SocketIOServer;
  private config: ServerConfig;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.config = this.buildServerConfig();
  }

  private buildServerConfig(): ServerConfig {
    // Get the full system configuration
    const systemConfig = config.getAll();

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
    // Initialize logging first
    if (this.config.middleware.logging) {
      await initializeLogging();
      logServerEvent(logger, 'initializing', {
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
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
        })
      );
    }

    // Apply rate limiting
    if (this.config.middleware.rateLimit) {
      this.app.use(
        rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 1000, // Limit each IP to 1000 requests per windowMs
          message: 'Too many requests from this IP',
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    }

    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // LogTape request/response logging
    if (this.config.middleware.logging) {
      this.app.use(createExpressLoggingMiddleware());
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

    // Mount route handlers based on enabled features
    await this.setupRoutes();

    // WebSocket setup
    if (this.config.features.websocket && this.io) {
      this.setupWebSocket();
    }

    // Error handling middleware
    if (this.config.middleware.logging) {
      this.app.use(createExpressErrorLoggingMiddleware());
    }

    // Global error handler
    this.app.use(
      (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        logger.error('Unhandled server error', {
          error: err.message,
          stack: err.stack,
          url: req.url,
          method: req.method,
        });

        res.status(err.status || 500).json({
          error: 'Internal server error',
          message: process.env['NODE_ENV'] === 'production' ? 'Something went wrong' : err.message,
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
          message: 'MCP routes will be migrated here from http-mcp-server.ts',
        });
      });
    }

    if (this.config.features.api) {
      // REST API routes (from api/http/server.ts)
      this.app.use('/api/v1', (req, res, next) => {
        // Placeholder - will be replaced with actual API routes
        res.json({
          service: 'REST API',
          status: 'active',
          message: 'API routes will be migrated here from api/http/server.ts',
        });
      });
    }

    if (this.config.features.dashboard) {
      // Web dashboard routes (from web-interface-server.ts)
      this.app.use('/dashboard', (req, res, next) => {
        // Placeholder - will be replaced with actual web routes
        res.json({
          service: 'Web Dashboard',
          status: 'active',
          message: 'Dashboard routes will be migrated here from web-interface-server.ts',
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
          message: 'Monitoring routes will be migrated here from dashboard-server.ts',
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
      this.server
        .listen(this.config.port, this.config.host, () => {
          logServerEvent(logger, 'started', {
            port: this.config.port,
            host: this.config.host,
            features: this.config.features,
            pid: process.pid,
          });

          console.log(`🚀 Unified Claude-Zen Server started:`);
          console.log(`   📍 Address: http://${this.config.host}:${this.config.port}`);
          console.log(
            `   🔧 Features: ${Object.keys(this.config.features)
              .filter((f) => this.config.features[f as keyof typeof this.config.features])
              .join(', ')}`
          );
          console.log(`   💡 Health: http://${this.config.host}:${this.config.port}/health`);

          resolve();
        })
        .on('error', (err) => {
          logger.error('Server failed to start', { error: err.message, stack: err.stack });
          reject(err);
        });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      logServerEvent(logger, 'stopping', { port: this.config.port });

      this.server.close(() => {
        logServerEvent(logger, 'stopped', { port: this.config.port });
        console.log('🛑 Unified Claude-Zen Server stopped');
        resolve();
      });
    });
  }

  // Getters for external access
  getApp(): express.Application {
    return this.app;
  }

  getServer(): any {
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
