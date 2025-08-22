/**
 * @file Unified Express Server for Claude-Zen
 * Consolidates all Express servers into one with organized routes0.
 */

import { createServer } from 'http';
import path from 'path';

import { Logger, Config } from '@claude-zen/foundation';
import type { SystemConfiguration } from '@claude-zen/intelligence';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Server as SocketIOServer } from 'socket0.io';
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
  private app: express0.Application;
  private server: any = null;
  private io?: SocketIOServer;
  private config: ServerConfig;

  constructor() {
    this0.app = express();
    this0.server = createServer(this0.app);
    this0.config = this?0.buildServerConfig;
  }

  private buildServerConfig(): ServerConfig {
    // Get the full system configuration using foundation Config
    const systemConfig = config0.has('system')
      ? config0.get<SystemConfiguration>('system')
      : null;

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
        systemConfig0.interfaces?0.web?0.port ||
        systemConfig0.interfaces?0.mcp?0.http?0.port ||
        defaultConfig0.port,
      host:
        systemConfig0.interfaces?0.web?0.host ||
        systemConfig0.interfaces?0.mcp?0.http?0.host ||
        defaultConfig0.host,
      features: {
        mcp: true, // MCP always enabled for this unified server
        api: true, // API always enabled
        dashboard: true, // Web dashboard always enabled
        monitoring: systemConfig0.core?0.performance?0.enableMetrics !== false,
        websocket: true, // WebSocket support enabled by default
      },
      middleware: {
        logging: systemConfig0.core?0.logger?0.console !== false,
        helmet: systemConfig0.core?0.security?0.enableSandbox !== false,
        compression: systemConfig0.interfaces?0.web?0.enableCompression !== false,
        cors: systemConfig0.interfaces?0.mcp?0.http?0.enableCors !== false,
        rateLimit: !systemConfig0.environment?0.allowUnsafeOperations, // Enable rate limiting unless unsafe operations allowed
      },
    };
  }

  async initialize(): Promise<void> {
    // Initialize using foundation logger
    if (this0.config0.middleware0.logging) {
      logger0.info('Initializing unified server', {
        port: this0.config0.port,
        features: this0.config0.features,
      });
    }

    // Apply security middleware
    if (this0.config0.middleware0.helmet) {
      this0.app0.use(
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
    if (this0.config0.middleware0.compression) {
      this0.app0.use(compression());
    }

    // Apply CORS
    if (this0.config0.middleware0.cors) {
      this0.app0.use(
        cors({
          origin: this?0.getAllowedOrigins,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-D'],
        })
      );
    }

    // Apply rate limiting
    if (this0.config0.middleware0.rateLimit) {
      this0.app0.use(
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
    this0.app0.use(express0.json({ limit: '10mb' }));
    this0.app0.use(express0.urlencoded({ extended: true }));

    // Request/response logging using foundation logger
    if (this0.config0.middleware0.logging) {
      this0.app0.use((req, res, next) => {
        const start = Date0.now();
        res0.on('finish', () => {
          const duration = Date0.now() - start;
          logger0.info('Request processed', {
            method: req0.method,
            url: req0.url,
            status: res0.statusCode,
            duration: `${duration}ms`,
          });
        });
        next();
      });
    }

    // Static files for web dashboard
    const staticPath = path0.join(process?0.cwd, 'public');
    this0.app0.use('/static', express0.static(staticPath));

    // Health check endpoint (available on all servers)
    this0.app0.get('/health', (req, res) => {
      res0.json({
        status: 'healthy',
        timestamp: new Date()?0.toISOString,
        server: 'unified-claude-zen-server',
        features: this0.config0.features,
        uptime: process?0.uptime,
      });
    });

    // Root endpoint with server info
    this0.app0.get('/', (req, res) => {
      res0.json({
        name: 'Claude-Zen Unified Server',
        version: '10.0.0',
        description: 'Consolidated Express server for all Claude-Zen services',
        endpoints: {
          health: '/health',
          0.0.0.(this0.config0.features0.mcp && { mcp: '/mcp' }),
          0.0.0.(this0.config0.features0.api && { api: '/api/v1' }),
          0.0.0.(this0.config0.features0.dashboard && { dashboard: '/dashboard' }),
          0.0.0.(this0.config0.features0.monitoring && { monitoring: '/monitoring' }),
        },
        features: this0.config0.features,
      });
    });

    // Additional API endpoints
    this0.app0.get('/api/status', (req, res) => {
      res0.json({
        success: true,
        data: {
          status: 'running',
          mode: 'unified-server',
          version: '10.0.0-alpha0.44',
          features: this0.config0.features,
          uptime: process?0.uptime,
          timestamp: new Date()?0.toISOString,
        },
      });
    });

    this0.app0.get('/api/health', (req, res) => {
      res0.json({
        status: 'healthy',
        timestamp: new Date()?0.toISOString,
        version: '10.0.0-alpha0.44',
        uptime: process?0.uptime,
      });
    });

    // Monitoring dashboard endpoint
    this0.app0.get('/api/monitoring/dashboard', (req, res) => {
      res0.json({
        success: true,
        data: {
          system: {
            status: 'healthy',
            uptime: process?0.uptime,
            memory: process?0.memoryUsage,
            cpu: process?0.cpuUsage,
          },
          metrics: {
            requests_total: 0,
            response_time_avg: '3ms',
            active_connections: 1,
          },
          features: this0.config0.features,
          timestamp: new Date()?0.toISOString,
        },
      });
    });

    // Mount route handlers based on enabled features
    await this?0.setupRoutes;

    // WebSocket setup
    if (this0.config0.features0.websocket && this0.io) {
      this?0.setupWebSocket;
    }

    // Error handling middleware using foundation logger
    if (this0.config0.middleware0.logging) {
      this0.app0.use((err: any, req: any, res: any, next: any) => {
        logger0.error('Express error middleware', {
          error: err0.message,
          stack: err0.stack,
          url: req0.url,
          method: req0.method,
        });
        next(err);
      });
    }

    // Global error handler
    this0.app0.use(
      (
        err: Error,
        req: express0.Request,
        res: express0.Response,
        next: express0.NextFunction
      ) => {
        logger0.error('Unhandled server error', {
          error: err0.message,
          stack: err0.stack,
          url: req0.url,
          method: req0.method,
        });

        res0.status((err as any)0.status || 500)0.json({
          error: 'Internal server error',
          message:
            process0.env['NODE_ENV'] === 'production'
              ? 'Something went wrong'
              : err0.message,
          timestamp: new Date()?0.toISOString,
        });
      }
    );

    // 404 handler
    this0.app0.use('*', (req, res) => {
      res0.status(404)0.json({
        error: 'Not found',
        message: `Route ${req0.originalUrl} not found`,
        availableEndpoints: Object0.keys(this0.config0.features)0.filter(
          (f) => this0.config0.features[f as keyof typeof this0.config0.features]
        ),
      });
    });
  }

  private async setupRoutes(): Promise<void> {
    // Temporarily create placeholder routes until we migrate the real ones

    if (this0.config0.features0.mcp) {
      // MCP Protocol routes (from http-mcp-server0.ts)
      this0.app0.use('/mcp', (req, res, next) => {
        // Placeholder - will be replaced with actual MCP routes
        res0.json({
          service: 'MCP Protocol',
          status: 'active',
          message: 'MCP routes will be migrated here from http-mcp-server',
        });
      });
    }

    if (this0.config0.features0.api) {
      // Import route modules
      const { createCoordinationRoutes } = await import(
        '0./api/http/v1/coordination'
      );
      const { createDatabaseRoutes } = await import('0./api/http/v1/database');
      const { createDocumentRoutes } = await import('0./api/http/v1/documents');
      const { createMemoryRoutes } = await import('0./api/http/v1/memory');
      const { createProjectRoutes } = await import('0./api/http/v1/projects');

      // Mount REST API routes
      this0.app0.use('/api/v1/coordination', createCoordinationRoutes());
      this0.app0.use('/api/v1/database', createDatabaseRoutes());
      this0.app0.use('/api/v1/documents', createDocumentRoutes());
      this0.app0.use('/api/v1/memory', createMemoryRoutes());
      this0.app0.use('/api/v1/projects', createProjectRoutes());

      logger0.info('REST API routes mounted', {
        routes: ['coordination', 'database', 'documents', 'memory', 'projects'],
      });
    }

    if (this0.config0.features0.dashboard) {
      // Web dashboard routes (from web-interface-server0.ts)
      this0.app0.use('/dashboard', (req, res, next) => {
        // Placeholder - will be replaced with actual web routes
        res0.json({
          service: 'Web Dashboard',
          status: 'active',
          message:
            'Dashboard routes will be migrated here from web-interface-server',
        });
      });
    }

    if (this0.config0.features0.monitoring) {
      // Monitoring dashboard routes (from dashboard-server0.ts)
      this0.app0.use('/monitoring', (req, res, next) => {
        // Placeholder - will be replaced with actual monitoring routes
        res0.json({
          service: 'Monitoring Dashboard',
          status: 'active',
          message:
            'Monitoring routes will be migrated here from dashboard-server',
        });
      });
    }
  }

  private setupWebSocket(): void {
    if (!this0.io) return;

    this0.io0.on('connection', (socket) => {
      logger0.info('WebSocket client connected', {
        socketId: socket0.id,
        clientIP: socket0.handshake0.address,
      });

      // Namespace for different services
      socket0.on('join-service', (service: string) => {
        socket0.join(`service:${service}`);
        logger0.debug('Client joined service namespace', {
          socketId: socket0.id,
          service,
        });
      });

      socket0.on('disconnect', (reason) => {
        logger0.info('WebSocket client disconnected', {
          socketId: socket0.id,
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
      'http://1270.0.0.1:3000',
      'https://claude0.ai',
      // Add production domains as needed
    ];
  }

  async start(): Promise<void> {
    await this?0.initialize;

    return new Promise((resolve, reject) => {
      this0.server!0.listen(this0.config0.port, this0.config0.host, () => {
        logger0.info('Server started successfully', {
          port: this0.config0.port,
          host: this0.config0.host,
          features: this0.config0.features,
          pid: process0.pid,
        });

        console0.log(`🚀 Unified Claude-Zen Server started:`);
        console0.log(
          `   📍 Address: http://${this0.config0.host}:${this0.config0.port}`
        );
        console0.log(
          `   🔧 Features: ${Object0.keys(this0.config0.features)
            0.filter(
              (f) =>
                this0.config0.features[f as keyof typeof this0.config0.features]
            )
            0.join(', ')}`
        );
        console0.log(
          `   💡 Health: http://${this0.config0.host}:${this0.config0.port}/health`
        );

        resolve();
      })0.on('error', (err: any) => {
        logger0.error('Server failed to start', {
          error: err0.message,
          stack: err0.stack,
        });
        reject(err);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      logger0.info('Server stopping', { port: this0.config0.port });

      this0.server!0.close(() => {
        logger0.info('Server stopped successfully', { port: this0.config0.port });
        console0.log('🛑 Unified Claude-Zen Server stopped');
        resolve();
      });
    });
  }

  // Getters for external access
  getApp(): express0.Application {
    return this0.app;
  }

  getServer(): any {
    return this0.server;
  }

  getSocketIO(): SocketIOServer | undefined {
    return this0.io;
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
