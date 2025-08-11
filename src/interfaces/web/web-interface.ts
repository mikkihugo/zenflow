/**
 * Web Interface - Modern modular browser-based dashboard.
 *
 * Refactored into clean, maintainable modules following Google standards.
 * Orchestrates web server, API routes, WebSocket, sessions, and process management.
 */
/**
 * @file Interface implementation: web-interface.
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLogger } from '../../config/logging-config.ts';
import { ProcessLifecycleManager } from '../../core/process-lifecycle.js';
import type { DIContainer } from '../../di/index.js';
import { WebApiRoutes } from './web-api-routes.ts';
// Import modular components
import { createWebConfig, type WebConfig } from './web-config.ts';
import { WebDashboardServer } from './web-dashboard-server.ts';
import { WebDataService } from './web-data-service.ts';
import { WebHtmlGenerator } from './web-html-generator.ts';
import { WebProcessManager } from './web-process-manager.ts';
import { WebSessionManager } from './web-session-manager.ts';
import { WebSocketManager } from './web-socket-manager.ts';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

/**
 * Main Web Interface orchestrator.
 *
 * Coordinates all web dashboard components using composition pattern.
 * Reduced from 728 lines to clean, maintainable architecture.
 *
 * @example
 */
export class WebInterface {
  private logger = getLogger('WebInterface');
  private config: WebConfig;
  private container?: DIContainer;
  private lifecycleManager?: ProcessLifecycleManager;

  // Component instances
  private server: WebDashboardServer;
  private sessionManager: WebSessionManager;
  private dataService: WebDataService;
  private apiRoutes: WebApiRoutes;
  private webSocketManager: WebSocketManager;
  private htmlGenerator: WebHtmlGenerator;
  private processManager: WebProcessManager;

  constructor(config: WebConfig = {}) {
    // Create unified configuration with defaults
    this.config = createWebConfig({
      staticDir: join(__dirname, '../../../web/dist'),
      ...config,
    });

    // Store DI container if provided
    this.container = config.container;

    // Initialize all components
    this.initializeComponents();
  }

  /**
   * Initialize all modular components.
   */
  private initializeComponents(): void {
    // Core server setup
    this.server = new WebDashboardServer(this.config);

    // Business logic and data management
    this.dataService = new WebDataService();

    // Session management
    this.sessionManager = new WebSessionManager(this.config);

    // API route handling
    this.apiRoutes = new WebApiRoutes(
      this.config,
      this.sessionManager,
      this.dataService,
    );

    // WebSocket real-time communication
    this.webSocketManager = new WebSocketManager(
      this.server.getSocketIO(),
      this.config,
      this.dataService,
    );

    // HTML generation for fallback UI
    this.htmlGenerator = new WebHtmlGenerator(this.config);

    // Process and daemon management
    this.processManager = new WebProcessManager(this.config);

    this.logger.debug('All web interface components initialized');
  }

  /**
   * Start the complete web interface system.
   */
  async run(): Promise<void> {
    try {
      this.logger.info(
        'Starting Claude Code Flow web interface with enhanced lifecycle management',
      );

      // Setup process lifecycle management if container is available
      if (this.container) {
        this.lifecycleManager = new ProcessLifecycleManager({
          onShutdown: async () => {
            this.logger.info('🧹 Graceful shutdown initiated...');
            await this.stop();
          },
          onError: async (error: Error) => {
            this.logger.error('💥 Application error in web interface:', error);
          },
        });
        this.logger.info('✅ Process lifecycle management enabled');
      }

      // Check for existing instances if in daemon mode
      if (this.config.daemon) {
        const existing = await this.processManager.isInstanceRunning();
        if (existing) {
          throw new Error(
            `Web interface already running with PID ${existing.pid}`,
          );
        }
      }

      // Setup all components
      await this.setupComponents();

      // Start daemon mode if requested
      if (this.config.daemon) {
        await this.processManager.startDaemonMode();
      }

      // Start the HTTP server
      await this.server.start();

      this.logger.info('Web interface started successfully');
    } catch (error) {
      this.logger.error('Failed to start web interface:', error);
      throw error;
    }
  }

  /**
   * Setup all components with proper integration.
   */
  private async setupComponents(): Promise<void> {
    const app = this.server.getApp();

    // Setup Express middleware
    this.server.setupMiddleware();

    // Add session management middleware
    app.use(this.sessionManager.middleware());

    // Auto-convert MCP tools to API endpoints on startup
    await this.autoConvertMCPTools(app);

    // Setup API routes
    this.apiRoutes.setupRoutes(app);

    // Setup WebSocket communication
    this.webSocketManager.setupWebSocket();

    // Setup fallback HTML serving
    this.setupFallbackRoutes(app);

    this.logger.debug('All components configured and integrated');
  }

  /**
   * Auto-setup shared services and API routes
   */
  private async autoConvertMCPTools(app: any): Promise<void> {
    try {
      this.logger.info('🔄 Setting up shared services API routes...');

      // Add swarm API routes
      const { swarmRouter } = await import('./api/swarm-routes.js');
      app.use('/api/v1/swarm', swarmRouter);

      this.logger.info('✅ Swarm API routes registered at /api/v1/swarm/*');
      this.logger.info('   Same business logic as stdio MCP server');
      this.logger.info('   Available for web dashboard and HTTP MCP server');

      // Additional service routes can be added here as needed
    } catch (error) {
      this.logger.warn(
        'Shared services setup failed, continuing without:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Setup fallback routes for HTML generation.
   *
   * @param app
   */
  private setupFallbackRoutes(app: any): void {
    // Serve inline HTML if no build exists
    app.get('/', (_req: any, res: any) => {
      if (existsSync(this.config.staticDir!)) {
        res.sendFile(join(this.config.staticDir!, 'index.html'));
      } else {
        res.send(this.htmlGenerator.generateDashboardHtml());
      }
    });

    // Catch all for SPA
    app.get('*', (_req: any, res: any) => {
      if (existsSync(join(this.config.staticDir!, 'index.html'))) {
        res.sendFile(join(this.config.staticDir!, 'index.html'));
      } else {
        res.send(this.htmlGenerator.generateDashboardHtml());
      }
    });
  }

  /**
   * Stop the web interface gracefully.
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping web interface...');

    try {
      // Stop WebSocket broadcasting
      this.webSocketManager.stopBroadcasting();

      // Stop HTTP server
      await this.server.stop();

      // Perform graceful shutdown if in daemon mode
      if (this.config.daemon) {
        await this.processManager.gracefulShutdown();
      }

      // Cleanup lifecycle manager
      if (this.lifecycleManager) {
        this.lifecycleManager.dispose();
      }

      this.logger.info('Web interface stopped successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive system status.
   */
  async getStatus(): Promise<{
    server: any;
    sessions: any;
    webSocket: any;
    process: any;
    config: WebConfig;
  }> {
    return {
      server: {
        status: 'running',
        capabilities: WebDashboardServer.getCapabilities(),
      },
      sessions: this.sessionManager.getStats(),
      webSocket: this.webSocketManager.getConnectionStats(),
      process: this.processManager.getProcessStats(),
      config: this.config,
    };
  }

  /**
   * Broadcast event to all connected WebSocket clients.
   *
   * @param event
   * @param data
   */
  broadcast(event: string, data: any): void {
    this.webSocketManager.broadcast(event, data);
  }

  /**
   * Get web interface capabilities (static method).
   */
  static getCapabilities(): any {
    return WebDashboardServer.getCapabilities();
  }

  /**
   * Health check for the entire web interface.
   */
  healthCheck(): {
    status: 'healthy' | 'warning' | 'error';
    components: Record<string, any>;
    version: string;
    uptime: number;
  } {
    return {
      status: 'healthy',
      components: {
        server: { status: 'running' },
        sessions: this.sessionManager.getStats(),
        webSocket: this.webSocketManager.getConnectionStats(),
        process: this.processManager.healthCheck(),
        dataService: { status: 'ready' },
      },
      version: '2.0.0-alpha.73',
      uptime: process.uptime(),
    };
  }
}

// Re-export types and configuration utilities
export type { WebConfig } from './web-config.ts';
export { createWebConfig } from './web-config.ts';
