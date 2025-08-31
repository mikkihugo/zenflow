#!/usr/bin/env node

/**
 * @file Claude Code Zen - Server Entry Point
 *
 * Complete server implementation with core functionality and static dashboard serving.
 */

import {
  getLogger,
  Result,
  ok,
  err,
  eventRegistryInitializer,
} from '@claude-zen/foundation';
import { eventRegistryWebSocketService } from './services/websocket/event-registry-websocket.js';
import type { Express, Request, Response } from 'express';
import type { Server as HTTPServer } from 'http';
import type { Server as SocketIOServer, Socket } from 'socket.io';

const logger = getLogger('claude-zen-server');

class ClaudeZenServer {
  private port: number = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
  private host: string = process.env['HOST'] || '0.0.0.0';

  async start(): Promise<Result<void, Error>> {
    try {
      logger.info(' Starting Claude Code Zen Server');

      const express = (await import('express')).default;
      const app = express();

      await this.setupMiddleware(app);
      this.setupRoutes(app);
      this.startServer();

      // Start the server
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(this.port, this.host, async () => {
          await this.initializeWebSockets(server);
          this.logServerStartup();
          resolve();
        });
        server.on('error', reject);
      });

      return ok();
    } catch (_error) {
      logger.error(' Failed to start server: ', error);
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Setup Express middleware
   */
  private async setupMiddleware(app: Express): Promise<void> {
    logger.debug('Setting up middleware...');

    // Import middleware dynamically
    const cors = (await import('cors')).default;
    const compression = (await import('compression')).default;
    const express = (await import('express')).default;

    // CORS middleware - allow all origins for development
    app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
      })
    );

    // Compression middleware
    app.use(compression());

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    if (process.env['NODE_ENV'] !== 'production') {
      const morgan = (await import('morgan')).default;
      app.use(morgan('combined'));
    }

    logger.debug(' Middleware setup complete');
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(app: Express): void {
    logger.debug('Setting up routes...');

    // Health check endpoint
    app.get('/health', (_req: Request, _res: Response) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
      });
    });

    // API routes
    app.get('/api/v1/health', (_req: Request, _res: Response) => {
      res.json({
        status: 'healthy',
        service: 'claude-code-zen-server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Basic dashboard route (if no static serving is set up)
    app.get('/', (_req: Request, _res: Response) => {
      res.json({
        message: 'Claude Code Zen Server',
        status: 'running',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          api: '/api/v1/health',
          websocket: '/socket.io/',
        },
      });
    });

    // Catch all for API routes
    app.use('/api', (_req: Request, _res: Response) => {
      res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
        method: req.method,
      });
    });

    logger.debug(' Routes setup complete');
  }

  /**
   * Additional server setup
   */
  private startServer(): void {
    logger.debug('Server initialization complete, ready to listen...');
  }

  /**
   * Initialize WebSocket services
   */
  private async initializeWebSockets(server: HTTPServer): Promise<void> {
    // Initialize WebSocket service for event registry
    eventRegistryWebSocketService.initialize(server);

    // Set up broadcast callback to connect event registry with WebSocket service
    eventRegistryInitializer.setBroadcastCallback(
      (type: string, _data: unknown) => {
        eventRegistryWebSocketService.broadcast(
          type as
            | 'module-status'
            | ' module-registry'
            | ' module-list'
            | ' module-update'
            | ' event-flows'
            | ' event-metrics'
            | ' event-flow'
            | ' heartbeat',
          data
        );
      }
    );

    await this.initializeSocketIO(server);
  }

  /**
   * Initialize Socket.IO for dashboard real-time updates
   */
  private async initializeSocketIO(server: HTTPServer): Promise<void> {
    try {
      const { Server: socketIOServer } = await import('socket.io');
      const io = new socketIOServer(server, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
        transports: ['polling', 'websocket'],
        allowEIO3: true,
      });

      this.setupSocketHandlers(io);
      logger.info(
        ' Socket.IO server initialized for dashboard real-time updates'
      );
    } catch (_error) {
      logger.warn(
        'Failed to initialize Socket.IO, dashboard real-time features may not work:',
        error
      );
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketHandlers(io: SocketIOServer): void {
    io.on('connection', (socket: Socket) => {
      logger.debug('Dashboard client connected: ' + socket.id);

      // Send initial connection data
      socket.emit('connected', {
        sessionId: socket.id,
        timestamp: new Date().toISOString(),
        serverVersion: '1.0.0',
      });

      this.setupSocketSubscriptions(socket);
      this.setupSocketUtilities(socket);
    });
  }

  /**
   * Setup socket subscription handlers
   */
  private setupSocketSubscriptions(socket: Socket): void {
    socket.on('subscribe', (channel: string) => {
      socket.join(channel);
      logger.debug('Client ${socket.id} subscribed to ' + channel);

      // Send initial data based on channel
      switch (channel) {
        case 'system':
          socket.emit('system:initial', {
            data: { status: 'operational', uptime: process.uptime() },
            timestamp: new Date().toISOString(),
          });
          break;
        case 'tasks':
          socket.emit('tasks:initial', {
            data: [],
            timestamp: new Date().toISOString(),
          });
          break;
        case 'logs':
          socket.emit('logs:initial', {
            data: [],
            timestamp: new Date().toISOString(),
          });
          break;
      }
    });

    socket.on('unsubscribe', (channel: string) => {
      socket.leave(channel);
      logger.debug('Client ${socket.id} unsubscribed from ' + channel);
    });
  }

  /**
   * Setup socket utility handlers
   */
  private setupSocketUtilities(socket: Socket): void {
    // Handle ping for connection keep-alive
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason: string) => {
      logger.debug(
        'Dashboard client disconnected: ${socket.id}, reason: ' + reason
      );
    });
  }

  /**
   * Log server startup information
   */
  private logServerStartup(): void {
    logger.info(
      ' Claude Code Zen Server running on http://${this.host}:' + this.port
    );
    logger.info(' Dashboard available at http://${this.host}:' + this.port);
    logger.info(
      ' Event Registry WebSocket available at ws://${this.host}:' + this.port + '/api/events/ws'
    );
  }
}

// Start the server
const server = new ClaudeZenServer();
server
  .start()
  .then((_result) => {
    if (result.isErr()) {
      logger.error('Failed to start server: ', result.error);
      process.exit(1);
    }
  })
  .catch((_error) => {
    logger.error('Unexpected error: ', error);
    process.exit(1);
  });
