/**
 * @fileoverview Unified Server Interface for Claude Code Zen
 *
 * This file provides the main server interface that unifies all server implementations
 * across the claude-code-zen platform. It uses the 3-tier architecture with strategic
 * facade pattern to provide a stable interface regardless of underlying implementation.
 *
 * Architecture:
 * - Tier 1:Strategic facades from @claude-zen packages
 * - Unified interface for web API server, coordination server, and database backends
 * - Event-driven coordination with comprehensive type safety
 * - Multi-database support (SQLite, LanceDB, Kuzu graph)
 *
 * @author Claude Code Zen Team
 * @version 2.1.0
 * @since 1.0.0
 */

import {
  createContainer,
  EventEmitter,
  generateUUID,
  getLogger,
  type Result,
  safeAsync,
  withTimeout,
} from '@claude-zen/foundation';
import type {
  DatabaseAdapter,
  EventAdapter,
  HttpAdapter,
  WebSocketAdapter,
} from './adapters/types';
import type {
  HealthCheckResult,
  LifecycleHook,
  RequestContext,
  ResponseData,
  ServerConfig,
  ServerEvent,
  ServerMetrics,
  ServerStatus,
} from './types/server-types';

const logger = getLogger('server-interface');

/**
 * Unified Claude Zen Server Interface
 *
 * Provides a consistent interface for all server types in the claude-code-zen ecosystem.
 * Uses strategic facade pattern to delegate to appropriate implementation packages
 * while maintaining backward compatibility and graceful degradation.
 */
export interface UnifiedClaudeZenServer {
  readonly id: string;
  readonly config: ServerConfig;
  readonly status: ServerStatus;
  readonly metrics: ServerMetrics;

  // Lifecycle management
  initialize(): Promise<Result<void, Error>>;
  start(): Promise<Result<void, Error>>;
  stop(): Promise<Result<void, Error>>;
  restart(): Promise<Result<void, Error>>;
  shutdown(): Promise<Result<void, Error>>;

  // Health and monitoring
  getHealth(): Promise<HealthCheckResult>;
  getMetrics(): Promise<ServerMetrics>;
  getStatus(): ServerStatus;

  // Request handling
  handleRequest<T = unknown>(
    context: RequestContext,
    handler: (ctx: RequestContext) => Promise<ResponseData<T>>
  ): Promise<Result<ResponseData<T>, Error>>;

  // Event system
  on<T extends ServerEvent>(
    event: T['type'],
    handler: (data: T['payload']) => void | Promise<void>
  ): void;
  emit<T extends ServerEvent>(
    event: T['type'],
    payload: T['payload']
  ): Promise<void>;

  // Adapter management
  registerHttpAdapter(adapter: HttpAdapter): Promise<Result<void, Error>>;
  registerWebSocketAdapter(
    adapter: WebSocketAdapter
  ): Promise<Result<void, Error>>;
  registerDatabaseAdapter(
    adapter: DatabaseAdapter
  ): Promise<Result<void, Error>>;
  registerEventAdapter(adapter: EventAdapter): Promise<Result<void, Error>>;

  // Hooks system
  addLifecycleHook(phase: keyof ServerStatus, hook: LifecycleHook): void;
  removeLifecycleHook(phase: keyof ServerStatus, hook: LifecycleHook): void;
}

/**
 * Default Server Configuration
 */
export const DEFAULT_SERVER_CONFIG: Partial<ServerConfig> = {
  port: 3000,
  host: '0.0.0.0',
  environment: 'development',
  timeout: 30000,
  maxConnections: 1000,
  enableMetrics: true,
  enableEvents: true,
  database: {
    type: 'sqlite',
    path: './data/server.db',
  },
  security: {
    enableCors: true,
    enableHelmet: true,
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
    },
  },
};

/**
 * Server Factory Interface
 *
 * Provides factory methods for creating different types of servers
 * with appropriate configurations and adapters.
 */
export interface ServerFactory {
  createWebApiServer(
    config?: Partial<ServerConfig>
  ): Promise<UnifiedClaudeZenServer>;
  createCoordinationServer(
    config?: Partial<ServerConfig>
  ): Promise<UnifiedClaudeZenServer>;
  createDevelopmentServer(
    config?: Partial<ServerConfig>
  ): Promise<UnifiedClaudeZenServer>;
  createProductionServer(
    config?: Partial<ServerConfig>
  ): Promise<UnifiedClaudeZenServer>;
}

/**
 * Main Server Implementation
 *
 * This implementation uses the strategic facade pattern to delegate to appropriate
 * implementation packages while providing a stable interface. It includes graceful
 * fallbacks and lazy loading of implementation packages.
 */
export class ClaudeZenServerImpl implements UnifiedClaudeZenServer {
  public readonly id: string;
  public readonly config: ServerConfig;
  private serverStatus: ServerStatus;
  private serverMetrics: ServerMetrics;
  private readonly eventBus: EventEmitter;
  private readonly serviceContainer: Awaited<
    ReturnType<typeof createContainer>
  >;
  private readonly lifecycleHooks: Map<keyof ServerStatus, LifecycleHook[]>;
  private readonly adapters: {
    http?: HttpAdapter;
    websocket?: WebSocketAdapter;
    database?: DatabaseAdapter;
    event?: EventAdapter;
  };

  constructor(config: Partial<ServerConfig> = {}) {
    this.id = generateUUID();
    this.config = { ...DEFAULT_SERVER_CONFIG, ...config } as ServerConfig;
    this.serverStatus = {
      initialized: false,
      running: false,
      healthy: true,
      connections: 0,
      uptime: 0,
      lastError: null,
    };
    this.serverMetrics = {
      requests: 0,
      errors: 0,
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
    this.eventBus = new EventEmitter();
    this.serviceContainer = null as unknown as Awaited<
      ReturnType<typeof createContainer>
    >;
    this.lifecycleHooks = new Map();
    this.adapters = {};

    logger.info('Server instance created', {
      id: this.id,
      config: this.config,
    });
  }

  public get status(): ServerStatus {
    return { ...this.serverStatus };
  }

  public get metrics(): ServerMetrics {
    return { ...this.serverMetrics };
  }

  initialize(): Promise<Result<void, Error>> {
    logger.info('Initializing server', { id: this.id });

    return safeAsync(async () => {
      // Execute pre-initialization hooks
      await this.executeLifecycleHooks('initialized');

      // Initialize service container
      Object.assign(this, {
        serviceContainer: await createContainer('server-' + this.id),
      });

      // Initialize strategic facades
      this.initializeStrategicFacades();

      // Initialize adapters
      await this.initializeAdapters();

      // Update status
      this.serverStatus.initialized = true;

      // Emit initialization event
      await this.emit('server:initialized', {
        serverId: this.id,
        timestamp: Date.now(),
      });

      logger.info('Server initialized successfully', { id: this.id });
    });
  }

  async start(): Promise<Result<void, Error>> {
    if (!this.serverStatus.initialized) {
      const initResult = await this.initialize();
      if (initResult.isErr()) {
        return initResult;
      }
    }

    logger.info('Starting server', { id: this.id, port: this.config.port });

    return safeAsync(async () => {
      // Execute pre-start hooks
      await this.executeLifecycleHooks('running');

      // Start HTTP adapter if available
      if (this.adapters.http) {
        await this.adapters.http.start(this.config);
      }

      // Start WebSocket adapter if available
      if (this.adapters.websocket) {
        await this.adapters.websocket.start(this.config);
      }

      // Start event adapter if available
      if (this.adapters._event) {
        await this.adapters.event.start(this.config);
      }

      // Update status
      this.serverStatus.running = true;
      this.serverStatus.uptime = Date.now();

      // Emit start event
      await this.emit('server:started', {
        serverId: this.id,
        port: this.config.port,
        timestamp: Date.now(),
      });

      logger.info('Server started successfully', {
        id: this.id,
        port: this.config.port,
        host: this.config.host,
      });
    });
  }

  stop(): Promise<Result<void, Error>> {
    logger.info('Stopping server', { id: this.id });

    return safeAsync(async () => {
      // Execute pre-stop hooks
      await this.executeLifecycleHooks('running');

      // Stop adapters in reverse order
      if (this.adapters._event) {
        await this.adapters.event.stop();
      }
      if (this.adapters.websocket) {
        await this.adapters.websocket.stop();
      }
      if (this.adapters.http) {
        await this.adapters.http.stop();
      }

      // Update status
      this.serverStatus.running = false;

      // Emit stop event
      await this.emit('server:stopped', {
        serverId: this.id,
        timestamp: Date.now(),
      });

      logger.info('Server stopped successfully', { id: this.id });
    });
  }

  async restart(): Promise<Result<void, Error>> {
    logger.info('Restarting server', { id: this.id });

    const stopResult = await this.stop();
    if (stopResult.isErr()) {
      return stopResult;
    }

    // Wait a brief moment before restarting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return this.start();
  }

  shutdown(): Promise<Result<void, Error>> {
    logger.info('Shutting down server', { id: this.id });

    return safeAsync(async () => {
      // Stop the server first
      const stopResult = await this.stop();
      if (stopResult.isErr()) {
        logger.error(
          'Error during server stop in shutdown',
          stopResult.unwrapErr()
        );
      }

      // Clean up resources
      if (this.adapters.database) {
        await this.adapters.database.disconnect();
      }

      // Clear service container
      if (this.serviceContainer) {
        this.serviceContainer.clear();
      }

      // Update status
      this.serverStatus.initialized = false;
      this.serverStatus.healthy = false;

      // Emit shutdown event
      await this.emit('server:shutdown', {
        serverId: this.id,
        timestamp: Date.now(),
      });

      logger.info('Server shutdown complete', { id: this.id });
    });
  }

  async getHealth(): Promise<HealthCheckResult> {
    const healthChecks: Array<{
      name: string;
      status: 'ok' | ' error';
      message?: string;
    }> = [];

    // Check server status
    healthChecks.push({
      name: 'server',
      status:
        this.serverStatus.running && this.serverStatus.healthy ? 'ok' : 'error',
      message: this.serverStatus.running
        ? 'Server is running'
        : 'Server is not running',
    });

    // Check adapters
    if (this.adapters.http) {
      try {
        const httpHealth = await this.adapters.http.getHealth();
        healthChecks.push({
          name: 'http',
          status: httpHealth.healthy ? 'ok' : ' error',
          message: httpHealth.message,
        });
      } catch (_error) {
        healthChecks.push({
          name: 'http',
          status: 'error',
          message: 'HTTP adapter health check failed: ' + error,
        });
      }
    }

    if (this.adapters.database) {
      try {
        const dbHealth = await this.adapters.database.getHealth();
        healthChecks.push({
          name: 'database',
          status: dbHealth.healthy ? 'ok' : ' error',
          message: dbHealth.message,
        });
      } catch (_error) {
        healthChecks.push({
          name: 'database',
          status: 'error',
          message: 'Database adapter health check failed: ' + error,
        });
      }
    }

    const hasErrors = healthChecks.some((check) => check.status === 'error');

    return {
      healthy: !hasErrors,
      timestamp: Date.now(),
      uptime: this.serverStatus.running
        ? Date.now() - this.serverStatus.uptime
        : 0,
      checks: healthChecks,
    };
  }

  getMetrics(): ServerMetrics {
    // Update memory and CPU usage
    if (typeof process !== 'undefined') {
      const memUsage = process.memoryUsage();
      this.serverMetrics.memoryUsage = memUsage.heapUsed;

      // Simple CPU usage approximation (not accurate, but functional)
      this.serverMetrics.cpuUsage = process.cpuUsage().user / 1000000; // Convert to seconds
    }

    return { ...this.serverMetrics };
  }

  getStatus(): ServerStatus {
    return this.status;
  }

  handleRequest<T = unknown>(
    context: RequestContext,
    handler: (ctx: RequestContext) => Promise<ResponseData<T>>
  ): Promise<Result<ResponseData<T>, Error>> {
    const startTime = Date.now();
    this.serverMetrics.requests++;

    return safeAsync(async () => {
      // Add request timeout
      const result = await withTimeout(
        handler(context),
        this.config.timeout || 30000
      );

      // Update metrics
      this.serverMetrics.responseTime = Date.now() - startTime;

      // Emit request handled event
      await this.emit('request:handled', {
        requestId: context.id || generateUUID(),
        path: context.path,
        method: context.method,
        duration: this.serverMetrics.responseTime,
        timestamp: Date.now(),
      });

      return result;
    }).catch(async (_error) => {
      // Update error metrics
      this.serverMetrics.errors++;
      this.serverStatus.lastError = (error as Error).message;

      // Emit error event
      await this.emit('request:error', {
        requestId: context.id || generateUUID(),
        path: context.path,
        method: context.method,
        error: (error as Error).message,
        timestamp: Date.now(),
      });

      throw error;
    });
  }

  on<T extends ServerEvent>(
    event: T['type'],
    handler: (data: T['payload']) => void | Promise<void>
  ): void {
    this.eventBus.on(event, handler);
  }

  async emit<T extends ServerEvent>(
    event: T['type'],
    payload: T['payload']
  ): Promise<void> {
    await this.eventBus.emit(event, payload);
  }

  registerHttpAdapter(adapter: HttpAdapter): Result<void, Error> {
    try {
      this.adapters.http = adapter;
      logger.info('HTTP adapter registered', { serverId: this.id });
      return { success: true, data: undefined };
    } catch (_error) {
      return { success: false, error: error as Error };
    }
  }

  registerWebSocketAdapter(adapter: WebSocketAdapter): Result<void, Error> {
    try {
      this.adapters.websocket = adapter;
      logger.info('WebSocket adapter registered', { serverId: this.id });
      return { success: true, data: undefined };
    } catch (_error) {
      return { success: false, error: error as Error };
    }
  }

  registerDatabaseAdapter(adapter: DatabaseAdapter): Result<void, Error> {
    try {
      this.adapters.database = adapter;
      logger.info('Database adapter registered', { serverId: this.id });
      return { success: true, data: undefined };
    } catch (_error) {
      return { success: false, error: error as Error };
    }
  }

  registerEventAdapter(adapter: EventAdapter): Result<void, Error> {
    try {
      this.adapters.event = adapter;
      logger.info('Event adapter registered', { serverId: this.id });
      return { success: true, data: undefined };
    } catch (_error) {
      return { success: false, error: error as Error };
    }
  }

  addLifecycleHook(phase: keyof ServerStatus, hook: LifecycleHook): void {
    const hooks = this.lifecycleHooks.get(phase) || [];
    hooks.push(hook);
    this.lifecycleHooks.set(phase, hooks);
    logger.debug('Lifecycle hook added', { serverId: this.id, phase });
  }

  removeLifecycleHook(phase: keyof ServerStatus, hook: LifecycleHook): void {
    const hooks = this.lifecycleHooks.get(phase) || [];
    const index = hooks.indexOf(hook);
    if (index > -1) {
      hooks.splice(index, 1);
      this.lifecycleHooks.set(phase, hooks);
      logger.debug('Lifecycle hook removed', { serverId: this.id, phase });
    }
  }

  // Private methods

  private initializeStrategicFacades(): void {
    try {
      // No strategic facades currently available - all removed
      logger.debug('Strategic facades skipped (none available)', {
        serverId: this.id,
      });
    } catch (_error) {
      logger.warn('Strategic facades initialization skipped', {
        serverId: this.id,
        error: error instanceof Error ? (error as Error).message : String(error),
      });
    }
  }

  private async initializeAdapters(): Promise<void> {
    // Initialize default adapters if none provided
    if (!this.adapters.database && this.config.database) {
      try {
        // Try to load database adapter
        const { createDatabaseAdapter } = await import(
          './adapters/database-adapter'
        );
        this.adapters.database = await createDatabaseAdapter(
          this.config.database
        );
        logger.debug('Default database adapter initialized', {
          serverId: this.id,
        });
      } catch (_error) {
        logger.warn('Database adapter initialization failed', {
          serverId: this.id,
          error: error instanceof Error ? (error as Error).message : String(error),
        });
      }
    }

    if (!this.adapters.event && this.config.enableEvents) {
      try {
        // Try to load event adapter
        const { createEventAdapter } = await import('./adapters/event-adapter');
        this.adapters.event = await createEventAdapter(this.config);
        logger.debug('Default event adapter initialized', {
          serverId: this.id,
        });
      } catch (_error) {
        logger.warn('Event adapter initialization failed', {
          serverId: this.id,
          error: error instanceof Error ? (error as Error).message : String(error),
        });
      }
    }
  }

  private async executeLifecycleHooks(
    phase: keyof ServerStatus
  ): Promise<void> {
    const hooks = this.lifecycleHooks.get(phase);
    if (hooks) {
      for (const hook of hooks) {
        try {
          await hook(this);
        } catch (_error) {
          logger.error('Lifecycle hook execution failed', {
            serverId: this.id,
            phase,
            error: error instanceof Error ? (error as Error).message : String(error),
          });
        }
      }
    }
  }
}

/**
 * Server Factory Implementation
 */
export class ClaudeZenServerFactory implements ServerFactory {
  async createWebApiServer(
    config: Partial<ServerConfig> = {}
  ): Promise<UnifiedClaudeZenServer> {
    const webApiConfig: Partial<ServerConfig> = {
      ...config,
      port: config.port || 3000,
      environment: 'production',
      enableMetrics: true,
      enableEvents: true,
      security: {
        enableCors: true,
        enableHelmet: true,
        rateLimiting: {
          windowMs: 15 * 60 * 1000,
          max: 100,
        },
      },
    };

    const server = new ClaudeZenServerImpl(webApiConfig);

    // Register web-specific adapters
    try {
      const { createHttpAdapter } = await import('./adapters/http-adapter');
      const { createWebSocketAdapter } = await import(
        './adapters/websocket-adapter'
      );

      await server.registerHttpAdapter(await createHttpAdapter(webApiConfig));
      await server.registerWebSocketAdapter(
        await createWebSocketAdapter(webApiConfig)
      );
    } catch (_error) {
      logger.warn('Some web adapters not available', {
        error: error instanceof Error ? (error as Error).message : String(error),
      });
    }

    return server;
  }

  async createCoordinationServer(
    config: Partial<ServerConfig> = {}
  ): Promise<UnifiedClaudeZenServer> {
    const coordinationConfig: Partial<ServerConfig> = {
      ...config,
      port: config.port || 3001,
      environment: 'development',
      enableMetrics: true,
      enableEvents: true,
      database: {
        type: 'sqlite',
        path: './data/coordination.db',
      },
    };

    const server = new ClaudeZenServerImpl(coordinationConfig);

    // Register coordination-specific adapters
    try {
      const { createEventAdapter } = await import('./adapters/event-adapter');
      await server.registerEventAdapter(
        await createEventAdapter(coordinationConfig)
      );
    } catch (_error) {
      logger.warn('Event adapter not available for coordination server', {
        error: error instanceof Error ? (error as Error).message : String(error),
      });
    }

    return server;
  }

  createDevelopmentServer(
    config: Partial<ServerConfig> = {}
  ): UnifiedClaudeZenServer {
    const devConfig: Partial<ServerConfig> = {
      ...config,
      port: config.port || 3002,
      host: '127.0.0.1',
      environment: 'development',
      enableMetrics: false,
      timeout: 60000, // Longer timeout for development
    };

    return new ClaudeZenServerImpl(devConfig);
  }

  async createProductionServer(
    config: Partial<ServerConfig> = {}
  ): Promise<UnifiedClaudeZenServer> {
    const prodConfig: Partial<ServerConfig> = {
      ...config,
      environment: 'production',
      enableMetrics: true,
      enableEvents: true,
      security: {
        enableCors: false, // Disable CORS for production
        enableHelmet: true,
        rateLimiting: {
          windowMs: 5 * 60 * 1000, // Stricter rate limiting
          max: 50,
        },
      },
    };

    const server = new ClaudeZenServerImpl(prodConfig);

    // Register all production adapters
    try {
      const { createHttpAdapter } = await import('./adapters/http-adapter');
      const { createDatabaseAdapter } = await import(
        './adapters/database-adapter'
      );
      const { createEventAdapter } = await import('./adapters/event-adapter');

      await Promise.all([
        server.registerHttpAdapter(await createHttpAdapter(prodConfig)),
        server.registerDatabaseAdapter(
          await createDatabaseAdapter(prodConfig.database!)
        ),
        server.registerEventAdapter(await createEventAdapter(prodConfig)),
      ]);
    } catch (_error) {
      logger.warn('Some production adapters not available', {
        error: error instanceof Error ? (error as Error).message : String(error),
      });
    }

    return server;
  }
}

// Default factory instance
export const serverFactory = new ClaudeZenServerFactory();

// Convenience factory functions
export function createWebApiServer(
  config?: Partial<ServerConfig>
): UnifiedClaudeZenServer {
  return serverFactory.createWebApiServer(config);
}

export function createCoordinationServer(
  config?: Partial<ServerConfig>
): UnifiedClaudeZenServer {
  return serverFactory.createCoordinationServer(config);
}

export function createDevelopmentServer(
  config?: Partial<ServerConfig>
): UnifiedClaudeZenServer {
  return serverFactory.createDevelopmentServer(config);
}

export function createProductionServer(
  config?: Partial<ServerConfig>
): UnifiedClaudeZenServer {
  return serverFactory.createProductionServer(config);
}

// Legacy compatibility exports
export { ClaudeZenServerImpl as UnifiedClaudeZenServer };
export { ClaudeZenServerFactory as ServerFactory };
export type { ServerConfig, ServerStatus, HealthCheckResult, ServerMetrics };
