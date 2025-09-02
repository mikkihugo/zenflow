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
  getConfig,
  EventBus,
  isValidEventName,
  EventLogger,
} from '@claude-zen/foundation';

// Type imports for server components
import type { Server as HTTPServer } from 'http';
import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { Application as Express, Request, Response } from 'express';

// Initialize foundation config early
getConfig();

const logger = getLogger('claude-zen-server');

class ClaudeZenServer {
  private port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  private host: string = process.env.HOST || '0.0.0.0';
  private server: HTTPServer | null = null;
  private io: SocketIOServer | null = null;
  private isShuttingDown = false;
  
  // EventBus integration
  private eventBus: EventBus | null = null;
  private socketListeners = new Map<string, Map<string, (...args: any[]) => void>>();
  private eventBridgeEnabled = process.env.ZEN_EVENT_SERVER_SOCKET_BRIDGE === 'on';

  async start(): Promise<Result<void, Error>> {
    try {
      logger.info(' Starting Claude Code Zen Server');

      // Initialize EventBus if bridge is enabled
      if (this.eventBridgeEnabled) {
        this.eventBus = EventBus.getInstance();
        const initResult = await this.eventBus.initialize();
        if (initResult.isErr()) {
          logger.warn('Failed to initialize EventBus:', initResult.error);
          this.eventBridgeEnabled = false;
        } else {
          logger.info('🔗 EventBus bridge enabled for Socket.IO integration');
        }
      }

      const express = (await import('express')).default;
      const app = express();

      await this.setupMiddleware(app);
      this.setupRoutes(app);
      this.startServer();

      // Start the server
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(this.port, this.host, async () => {
          this.server = server;
          await this.initializeWebSockets(server);
          this.setupShutdownHandlers();
          this.logServerStartup();
          resolve();
        });
        server.on('error', reject);
      });

      return ok();
    } catch (error) {
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
    if (process.env.NODE_ENV !== 'production') {
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
    app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: this.isShuttingDown ? 'shutting_down' : 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        shutdownStatus: {
          isShuttingDown: this.isShuttingDown,
          emergencyShutdownAvailable: true
        }
      });
    });

    // API routes
    app.get('/api/v1/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        service: 'claude-code-zen-server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Emergency shutdown endpoint (protected)
    app.post('/api/v1/admin/emergency-shutdown', (req: Request, res: Response) => {
      const authToken = req.headers.authorization;
      const expectedToken = process.env.EMERGENCY_SHUTDOWN_TOKEN || 'emergency-shutdown-2025';

      if (!authToken || authToken !== `Bearer ${expectedToken}`) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Valid emergency shutdown token required'
        });
      }

      logger.warn('🚨 Emergency shutdown triggered via API endpoint');
      res.json({
        message: 'Emergency shutdown initiated',
        timestamp: new Date().toISOString()
      });

      // Trigger emergency shutdown after response
      setTimeout(() => {
        this.emergencyShutdown('api-endpoint');
      }, 1000);
    });

    // Basic dashboard route (if no static serving is set up)
    app.get('/', (req: Request, res: Response) => {
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
    app.use('/api', (req: Request, res: Response) => {
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
   * Log server startup information
   */
  private logServerStartup(): void {
    const bridgeStatus = this.eventBridgeEnabled ? 'ENABLED' : 'DISABLED';
    logger.info(`
🚀 Claude Code Zen Server Started Successfully
   📍 Address: http://${this.host}:${this.port}
   🌐 Health: http://${this.host}:${this.port}/health
   🔗 Socket.IO: http://${this.host}:${this.port}/socket.io/
   ⚡ EventBus Bridge: ${bridgeStatus}
   
   Ready to serve requests and handle WebSocket connections!
    `.trim());
  }

  /**
   * Initialize WebSocket services (Socket.IO only)
   */
  private async initializeWebSockets(server: HTTPServer): Promise<void> {
    await this.initializeSocketIO(server);
  }

  /**
   * Initialize Socket.IO for all real-time updates
   */
  private async initializeSocketIO(server: HTTPServer): Promise<void> {
    try {
      const { Server: socketIOServer } = await import('socket.io');
      this.io = new socketIOServer(server, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
        transports: ['polling', 'websocket'],
        allowEIO3: true,
      });

      this.setupSocketHandlers(this.io);
      logger.info(
        `🔌 Socket.IO server initialized for real-time updates`
      );
    } catch (error) {
      logger.warn(
        'Failed to initialize Socket.IO, real-time features may not work:',
        error
      );
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketHandlers(io: SocketIOServer): void {
    io.on('connection', (socket: Socket) => {
      logger.debug(`Client connected: ${socket.id}`);

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
   * Setup socket subscription handlers with EventBus bridge
   */
  private setupSocketSubscriptions(socket: Socket): void {
    socket.on('subscribe', (channel: string) => {
      socket.join(channel);
      logger.debug(`Client ${socket.id} subscribed to ${channel}`);

      // EventBus bridge: attach listeners for this channel
      if (this.eventBridgeEnabled && this.eventBus) {
        this.attachEventBusListeners(socket, channel);
      }

      // Send initial data based on channel (keep existing behavior)
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
      logger.debug(`Client ${socket.id} unsubscribed from ${channel}`);

      // EventBus bridge: remove listeners for this channel
      if (this.eventBridgeEnabled && this.eventBus) {
        this.removeEventBusListeners(socket, channel);
      }
    });

    // EventBus bridge: handle client publishes (optional)
    if (this.eventBridgeEnabled && this.eventBus) {
      socket.on('publish', (data: { channel: string; event: string; payload?: unknown }) => {
        this.handleClientPublish(socket, data);
      });
    }

    // Clean up listeners on disconnect
    socket.on('disconnect', () => {
      if (this.eventBridgeEnabled) {
        this.cleanupSocketListeners(socket.id);
      }
    });
  }

  /**
   * Attach EventBus listeners for a socket channel
   */
  private attachEventBusListeners(socket: Socket, channel: string): void {
    if (!this.eventBus) return;

    // Initialize listener map for this socket if not exists
    if (!this.socketListeners.has(socket.id)) {
      this.socketListeners.set(socket.id, new Map());
    }

    const socketListeners = this.socketListeners.get(socket.id)!;

    // Create event pattern based on channel (e.g., 'system' -> 'system:*')
    const eventPattern = `${channel}:`;
    
    // Create listener function that forwards events to socket
    const listener = (eventData: unknown) => {
      try {
        socket.emit(eventPattern.slice(0, -1), {
          data: eventData,
          timestamp: new Date().toISOString(),
        });
        EventLogger.logEvent(`eventbus-to-socket:${channel}`, { socketId: socket.id, data: eventData });
      } catch (error) {
        EventLogger.logError(`eventbus-to-socket-error:${channel}`, error, { socketId: socket.id });
      }
    };

    // Listen for events matching the pattern
    // For simplicity, we'll listen to specific event names based on channel
    const eventNames = this.getEventNamesForChannel(channel);
    
    eventNames.forEach(eventName => {
      if (isValidEventName(eventName)) {
        this.eventBus!.on(eventName, listener);
        socketListeners.set(eventName, listener);
        logger.debug(`Attached EventBus listener for ${eventName} to socket ${socket.id}`);
      }
    });
  }

  /**
   * Remove EventBus listeners for a socket channel
   */
  private removeEventBusListeners(socket: Socket, channel: string): void {
    if (!this.eventBus) return;

    const socketListeners = this.socketListeners.get(socket.id);
    if (!socketListeners) return;

    const eventNames = this.getEventNamesForChannel(channel);
    
    eventNames.forEach(eventName => {
      const listener = socketListeners.get(eventName);
      if (listener && isValidEventName(eventName)) {
        this.eventBus!.off(eventName, listener);
        socketListeners.delete(eventName);
        logger.debug(`Removed EventBus listener for ${eventName} from socket ${socket.id}`);
      }
    });

    // Clean up socket entry if no listeners remain
    if (socketListeners.size === 0) {
      this.socketListeners.delete(socket.id);
    }
  }

  /**
   * Clean up all listeners for a socket
   */
  private cleanupSocketListeners(socketId: string): void {
    if (!this.eventBus) return;

    const socketListeners = this.socketListeners.get(socketId);
    if (!socketListeners) return;

    // Remove all listeners for this socket
    for (const [eventName, listener] of socketListeners.entries()) {
      if (isValidEventName(eventName)) {
        this.eventBus.off(eventName, listener);
      }
    }

    this.socketListeners.delete(socketId);
    logger.debug(`Cleaned up all EventBus listeners for socket ${socketId}`);
  }

  /**
   * Handle client publish requests with validation
   */
  private handleClientPublish(socket: Socket, data: { channel: string; event: string; payload?: unknown }): void {
    try {
      // Validate event name format and whitelist
      const { channel, event, payload } = data;
      const eventName = `${channel}:${event}`;

      // Check if event is whitelisted (system:, registry:, agent:, llm:)
      const whitelistedPrefixes = ['system:', 'registry:', 'agent:', 'llm:'];
      const isWhitelisted = whitelistedPrefixes.some(prefix => eventName.startsWith(prefix));

      if (!isWhitelisted) {
        EventLogger.logError('client-publish-rejected', `Event ${eventName} not whitelisted`, { socketId: socket.id });
        socket.emit('publish-error', { error: 'Event type not allowed', eventName });
        return;
      }

      if (!isValidEventName(eventName)) {
        EventLogger.logError('client-publish-invalid', `Event ${eventName} not in catalog`, { socketId: socket.id });
        socket.emit('publish-error', { error: 'Invalid event name', eventName });
        return;
      }

      // Emit to EventBus
      if (this.eventBus) {
        this.eventBus.emit(eventName, payload);
        EventLogger.logEvent('client-publish-success', { eventName, socketId: socket.id });
        logger.debug(`Client ${socket.id} published ${eventName} to EventBus`);
      }
    } catch (error) {
      EventLogger.logError('client-publish-error', error, { socketId: socket.id, data });
      socket.emit('publish-error', { error: 'Failed to publish event' });
    }
  }

  /**
   * Get event names that should be listened to for a given channel
   */
  private getEventNamesForChannel(channel: string): string[] {
    const eventMap: Record<string, string[]> = {
      system: ['system:start', 'system:error'],
      registry: ['registry:agent-registered', 'registry:agent-unregistered'], 
      agent: ['agent:task-started', 'agent:task-completed', 'agent:task-failed'],
      llm: ['llm:inference-request', 'llm:inference-complete', 'llm:inference-failed'],
      tasks: [], // Could be extended with task-specific events
      logs: [], // Could be extended with log events
    };

    return eventMap[channel] || [];
  }

  /**
   * Setup socket utility handlers
   */
  private setupSocketUtilities(socket: Socket): void {
    // Handle ping for connection keep-alive
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Emergency shutdown request from client (admin only)
    socket.on('request-emergency-shutdown', (data: { token: string }) => {
      const expectedToken = process.env.EMERGENCY_SHUTDOWN_TOKEN || 'emergency-shutdown-2025';

      if (data.token === expectedToken) {
        logger.warn(`🚨 Emergency shutdown requested by client ${socket.id}`);
        socket.emit('emergency-shutdown-granted', {
          message: 'Emergency shutdown initiated',
          timestamp: new Date().toISOString()
        });

        setTimeout(() => {
          this.emergencyShutdown('client-request');
        }, 1000);
      } else {
        socket.emit('emergency-shutdown-denied', {
          error: 'Invalid emergency shutdown token',
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', (reason: string) => {
      logger.debug(
        `Dashboard client disconnected: ${socket.id}, reason: ${reason}`
      );
    });
  }

  /**
   * Setup shutdown handlers for graceful and emergency shutdown
   */
  private setupShutdownHandlers(): void {
    // Graceful shutdown signals
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

    // Emergency shutdown signals
    process.on('SIGUSR1', () => this.emergencyShutdown('SIGUSR1'));
    process.on('SIGUSR2', () => this.emergencyShutdown('SIGUSR2'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.emergencyShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.emergencyShutdown('unhandledRejection');
    });

    logger.info('🛡️ Emergency shutdown handlers configured');
  }

  /**
   * Graceful shutdown - clean up resources and exit
   */
  private gracefulShutdown(signal: string): void {
    if (this.isShuttingDown) {
      logger.warn(`Already shutting down, ignoring ${signal}`);
      return;
    }

    logger.info(`🛑 Received ${signal}, starting graceful shutdown...`);
    this.isShuttingDown = true;

    // Stop accepting new connections
    if (this.server) {
      this.server.close((error) => {
        if (error) {
          logger.error('Error closing server:', error);
        } else {
          logger.info('✅ Server closed successfully');
        }
      });
    }

    // Clean up EventBus listeners
    if (this.eventBridgeEnabled) {
      for (const socketId of this.socketListeners.keys()) {
        this.cleanupSocketListeners(socketId);
      }
      logger.info('✅ EventBus listeners cleaned up');
    }

    // Close Socket.IO connections
    if (this.io) {
      this.io.close((error) => {
        if (error) {
          logger.error('Error closing Socket.IO:', error);
        } else {
          logger.info('✅ Socket.IO closed successfully');
        }
      });
    }

    // Give connections 10 seconds to close gracefully
    setTimeout(() => {
      logger.info('⏰ Graceful shutdown timeout reached, forcing exit...');
      process.exit(0);
    }, 10000);
  }

  /**
   * Emergency shutdown - immediate termination for critical situations
   */
  private emergencyShutdown(reason: string): void {
    logger.error(`🚨 EMERGENCY SHUTDOWN triggered by: ${reason}`);

    // Broadcast emergency shutdown to all clients
    if (this.io) {
      this.io.emit('emergency-shutdown', {
        reason,
        timestamp: new Date().toISOString(),
        message: 'Server is shutting down immediately due to critical error'
      });
    }

    // Force immediate exit
    logger.error('💥 Force exiting due to emergency shutdown');
    process.exit(1);
  }
}

// Start the server
const server = new ClaudeZenServer();
server
  .start()
  .then((result) => {
    if (result.isErr()) {
      logger.error('Failed to start server: ', result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    logger.error('Unexpected error: ', error);
    process.exit(1);
  });
