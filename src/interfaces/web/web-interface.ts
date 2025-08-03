/**
 * Web Interface - Modern modular browser-based dashboard
 *
 * Refactored into clean, maintainable modules following Google standards.
 * Orchestrates web server, API routes, WebSocket, sessions, and process management.
 */

import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../../utils/logger';
import { WebApiRoutes } from './WebApiRoutes';
// Import modular components
import { createWebConfig, type WebConfig } from './WebConfig';
import { WebDashboardServer } from './WebDashboardServer';
import { WebDataService } from './WebDataService';
import { WebHtmlGenerator } from './WebHtmlGenerator';
import { WebProcessManager } from './WebProcessManager';
import { WebSessionManager } from './WebSessionManager';
import { WebSocketManager } from './WebSocketManager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main Web Interface orchestrator
 *
 * Coordinates all web dashboard components using composition pattern.
 * Reduced from 728 lines to clean, maintainable architecture.
 */
export class WebInterface {
  private logger = createLogger('WebInterface');
  private config: WebConfig;

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

    // Initialize all components
    this.initializeComponents();
  }

  /**
   * Initialize all modular components
   */
  private initializeComponents(): void {
    // Core server setup
    this.server = new WebDashboardServer(this.config);

    // Business logic and data management
    this.dataService = new WebDataService();

    // Session management
    this.sessionManager = new WebSessionManager(this.config);

    // API route handling
    this.apiRoutes = new WebApiRoutes(this.config, this.sessionManager, this.dataService);

    // WebSocket real-time communication
    this.webSocketManager = new WebSocketManager(
      this.server.getSocketIO(),
      this.config,
      this.dataService
    );

    // HTML generation for fallback UI
    this.htmlGenerator = new WebHtmlGenerator(this.config);

    // Process and daemon management
    this.processManager = new WebProcessManager(this.config);

    this.logger.debug('All web interface components initialized');
  }

  /**
   * Start the complete web interface system
   */
  async run(): Promise<void> {
    try {
      this.logger.info('Starting Claude Code Flow web interface');

      // Check for existing instances if in daemon mode
      if (this.config.daemon) {
        const existing = await this.processManager.isInstanceRunning();
        if (existing) {
          throw new Error(`Web interface already running with PID ${existing.pid}`);
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
   * Setup all components with proper integration
   */
  private async setupComponents(): Promise<void> {
    const app = this.server.getApp();

    // Setup Express middleware
    this.server.setupMiddleware();

    // Add session management middleware
    app.use(this.sessionManager.middleware());

    // Setup API routes
    this.apiRoutes.setupRoutes(app);

    // Setup WebSocket communication
    this.webSocketManager.setupWebSocket();

    // Setup fallback HTML serving
    this.setupFallbackRoutes(app);

    this.logger.debug('All components configured and integrated');
  }

  /**
   * Setup fallback routes for HTML generation
   */
  private setupFallbackRoutes(app: any): void {
    // Serve inline HTML if no build exists
    app.get('/', (req: any, res: any) => {
      if (existsSync(this.config.staticDir!)) {
        res.sendFile(join(this.config.staticDir!, 'index.html'));
      } else {
        res.send(this.htmlGenerator.generateDashboardHtml());
      }
    });

    // Catch all for SPA
    app.get('*', (req: any, res: any) => {
      if (existsSync(join(this.config.staticDir!, 'index.html'))) {
        res.sendFile(join(this.config.staticDir!, 'index.html'));
      } else {
        res.send(this.htmlGenerator.generateDashboardHtml());
      }
    });
  }

  /**
   * Stop the web interface gracefully
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

      this.logger.info('Web interface stopped successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive system status
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
   * Broadcast event to all connected WebSocket clients
   */
  broadcast(event: string, data: any): void {
    this.webSocketManager.broadcast(event, data);
  }

  /**
   * Get web interface capabilities (static method)
   */
  static getCapabilities(): any {
    return WebDashboardServer.getCapabilities();
  }

  /**
   * Health check for the entire web interface
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
export type { WebConfig } from './WebConfig';
export { createWebConfig } from './WebConfig';
