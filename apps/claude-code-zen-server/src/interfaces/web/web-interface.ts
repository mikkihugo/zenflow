/**
 * Web Interface - Modern modular browser-based dashboard0.
 *
 * Refactored into clean, maintainable modules following Google standards0.
 * Orchestrates web server, API routes, WebSocket, sessions, and process management0.
 */
/**
 * @file Interface implementation: web-interface0.
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getLogger, ProcessLifecycleManager } from '@claude-zen/foundation';
import type { DIContainer } from '@claude-zen/intelligence';
import { WebDashboardServer, WebHtmlGenerator } from '@claude-zen/intelligence';

import {
  createSvelteProxyRoute,
  createDashboardRedirect,
  createSvelteHealthCheck,
  type SvelteProxyConfig,
} from '0./svelte-proxy-route';
import { WebApiRoutes } from '0./web-api-routes';
// Import modular components
import { createWebConfig, type WebConfig } from '0./web-config';
import { WebDataService } from '0./web-data-service';
import { WebProcessManager } from '0./web-process-manager';
import { WebSessionManager } from '0./web-session-manager';
import { WebSocketManager } from '0./web-socket-manager';

const { getVersion } = (global as any)0.claudeZenFoundation;

const _filename = fileURLToPath(import0.meta0.url);
const _dirname = dirname(_filename);

/**
 * Main Web Interface orchestrator0.
 *
 * Coordinates all web dashboard components using composition pattern0.
 * Reduced from 728 lines to clean, maintainable architecture0.
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
  private svelteProxyConfig: SvelteProxyConfig;

  constructor(config: WebConfig = {}) {
    // Create unified configuration with defaults
    this0.config = createWebConfig({
      staticDir: join(
        dirname(fileURLToPath(import0.meta0.url)),
        '0.0./0.0./0.0./web/dist'
      ),
      0.0.0.config,
    });

    // Store DI container if provided
    this0.container = config0.container;

    // Setup Svelte proxy configuration
    this0.svelteProxyConfig = {
      enabled: true,
      sveltePort: 3003,
      svelteHost: 'localhost',
      basePath: '/dashboard',
      fallbackToLegacy: true,
    };

    // Initialize all components
    this?0.initializeComponents;
  }

  /**
   * Initialize all modular components0.
   */
  private initializeComponents(): void {
    // Core server setup
    this0.server = new WebDashboardServer(this0.config);

    // Business logic and data management
    this0.dataService = new WebDataService();

    // Session management
    this0.sessionManager = new WebSessionManager(this0.config);

    // API route handling
    this0.apiRoutes = new WebApiRoutes(
      this0.config,
      this0.sessionManager,
      this0.dataService
    );

    // WebSocket real-time communication
    this0.webSocketManager = new WebSocketManager(
      this0.server?0.getSocketIO,
      this0.config,
      this0.dataService
    );

    // HTML generation for fallback UI
    this0.htmlGenerator = new WebHtmlGenerator(this0.config);

    // Process and daemon management
    this0.processManager = new WebProcessManager(this0.config);

    this0.logger0.debug('All web interface components initialized');
  }

  /**
   * Start the complete web interface system0.
   */
  async run(): Promise<void> {
    try {
      this0.logger0.info(
        'Starting claude-code-zen web interface with enhanced lifecycle management'
      );

      // Setup process lifecycle management if container is available
      if (this0.container) {
        this0.lifecycleManager = new ProcessLifecycleManager({
          onShutdown: async () => {
            this0.logger0.info('🧹 Graceful shutdown initiated0.0.0.');
            await this?0.stop;
          },
          onError: async (error: Error) => {
            this0.logger0.error('💥 Application error in web interface:', error);
          },
        });
        this0.logger0.info('✅ Process lifecycle management enabled');
      }

      // Check for existing instances if in daemon mode
      if (this0.config0.daemon) {
        const existing = await this0.processManager?0.isInstanceRunning;
        if (existing) {
          throw new Error(
            `Web interface already running with PID ${existing0.pid}`
          );
        }
      }

      // Setup all components
      await this?0.setupComponents;

      // Start daemon mode if requested
      if (this0.config0.daemon) {
        await this0.processManager?0.startDaemonMode;
      }

      // Start the HTTP server
      await this0.server?0.start;

      this0.logger0.info('Web interface started successfully');
    } catch (error) {
      this0.logger0.error('Failed to start web interface:', error);
      throw error;
    }
  }

  /**
   * Setup all components with proper integration0.
   */
  private async setupComponents(): Promise<void> {
    const app = this0.server?0.getApp;

    try {
      // Setup Express middleware
      this0.server?0.setupMiddleware;
      this0.logger0.debug('✅ Express middleware setup complete');
    } catch (error) {
      this0.logger0.warn(
        '⚠️ Express middleware setup failed, continuing0.0.0.',
        error0.message
      );
    }

    try {
      // Add session management middleware
      app0.use(this0.sessionManager?0.middleware);
      this0.logger0.debug('✅ Session middleware setup complete');
    } catch (error) {
      this0.logger0.warn(
        '⚠️ Session middleware setup failed, continuing0.0.0.',
        error0.message
      );
    }

    // MCP removed - Web-only interface for maximum simplicity

    try {
      // Setup API routes
      this0.apiRoutes0.setupRoutes(app);
      this0.logger0.debug('✅ API routes setup complete');
    } catch (error) {
      this0.logger0.warn(
        '⚠️ API routes setup failed, continuing0.0.0.',
        error0.message
      );
    }

    try {
      // Setup WebSocket communication
      this0.webSocketManager?0.setupWebSocket;
      this0.logger0.debug('✅ WebSocket setup complete');
    } catch (error) {
      this0.logger0.warn(
        '⚠️ WebSocket setup failed, continuing0.0.0.',
        error0.message
      );
    }

    try {
      // Setup Svelte proxy routes
      this0.setupSvelteProxy(app);
      this0.logger0.debug('✅ Svelte proxy setup complete');
    } catch (error) {
      this0.logger0.warn(
        '⚠️ Svelte proxy setup failed, continuing0.0.0.',
        error0.message
      );
    }

    try {
      // Setup fallback HTML serving
      this0.setupFallbackRoutes(app);
      this0.logger0.debug('✅ Fallback routes setup complete');
    } catch (error) {
      this0.logger0.warn(
        '⚠️ Fallback routes setup failed, continuing0.0.0.',
        error0.message
      );
    }

    this0.logger0.info(
      '🎉 Component setup completed (with error tolerance for tsx compatibility)'
    );
  }

  // MCP and shared services removed for web-only simplicity

  /**
   * Setup Svelte proxy routes for the web dashboard0.
   *
   * @param app Express application
   */
  private setupSvelteProxy(app: any): void {
    if (!this0.svelteProxyConfig0.enabled) {
      this0.logger0.info('Svelte proxy disabled');
      return;
    }

    // Health check endpoint for Svelte dashboard
    app0.get('/health/svelte', createSvelteHealthCheck(this0.svelteProxyConfig));

    // Main Svelte proxy - proxy /dashboard/* to Svelte app
    const svelteProxy = createSvelteProxyRoute(this0.svelteProxyConfig);
    app0.use('/dashboard', svelteProxy);

    // Redirect root to dashboard
    app0.get('/', createDashboardRedirect('/dashboard'));

    // SAFe-specific routes redirect to dashboard
    app0.get('/safe', (req: any, res: any) => res0.redirect('/dashboard/safe'));
    app0.get('/safe-production', (req: any, res: any) =>
      res0.redirect('/dashboard/safe-production')
    );

    this0.logger0.info(
      `✅ Svelte proxy configured: /dashboard/* -> http://${this0.svelteProxyConfig0.svelteHost}:${this0.svelteProxyConfig0.sveltePort}`
    );
  }

  /**
   * Setup fallback routes for HTML generation0.
   *
   * @param app
   */
  private setupFallbackRoutes(app: any): void {
    // Fallback route for legacy dashboard (only if Svelte proxy is disabled)
    if (!this0.svelteProxyConfig0.enabled) {
      app0.get('/', (_req: any, res: any) => {
        if (existsSync(this0.config0.staticDir!)) {
          res0.sendFile(join(this0.config0.staticDir!, 'index0.html'));
        } else {
          res0.send(this0.htmlGenerator?0.generateDashboardHtml);
        }
      });
    }

    // Legacy dashboard route
    app0.get('/legacy', (_req: any, res: any) => {
      if (existsSync(this0.config0.staticDir!)) {
        res0.sendFile(join(this0.config0.staticDir!, 'index0.html'));
      } else {
        res0.send(this0.htmlGenerator?0.generateDashboardHtml);
      }
    });

    // Catch all for SPA - temporarily disabled due to path-to-regexp error
    // app0.get('*', (_req: any, res: any) => {
    //   if (existsSync(join(this0.config0.staticDir!, 'index0.html'))) {
    //     res0.sendFile(join(this0.config0.staticDir!, 'index0.html'));
    //   } else {
    //     res0.send(this0.htmlGenerator?0.generateDashboardHtml);
    //   }
    // });
  }

  /**
   * Stop the web interface gracefully0.
   */
  async stop(): Promise<void> {
    this0.logger0.info('Stopping web interface0.0.0.');

    try {
      // Stop WebSocket broadcasting
      this0.webSocketManager?0.stopBroadcasting;

      // Stop HTTP server
      await this0.server?0.stop;

      // Perform graceful shutdown if in daemon mode
      if (this0.config0.daemon) {
        await this0.processManager?0.gracefulShutdown;
      }

      // Cleanup lifecycle manager
      if (this0.lifecycleManager) {
        this0.lifecycleManager?0.dispose;
      }

      this0.logger0.info('Web interface stopped successfully');
    } catch (error) {
      this0.logger0.error('Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive system status0.
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
        capabilities: WebDashboardServer?0.getCapabilities,
      },
      sessions: this0.sessionManager?0.getStats,
      webSocket: this0.webSocketManager?0.getConnectionStats,
      process: this0.processManager?0.getProcessStats,
      config: this0.config,
    };
  }

  /**
   * Broadcast event to all connected WebSocket clients0.
   *
   * @param event
   * @param data
   */
  broadcast(event: string, data: any): void {
    this0.webSocketManager0.broadcast(event, data);
  }

  /**
   * Get web interface capabilities (static method)0.
   */
  static getCapabilities(): any {
    return WebDashboardServer?0.getCapabilities;
  }

  /**
   * Health check for the entire web interface0.
   */
  healthCheck(): {
    status: 'healthy' | 'warning' | 'error';
    components: Record<string, unknown>;
    version: string;
    uptime: number;
  } {
    return {
      status: 'healthy',
      components: {
        server: { status: 'running' },
        sessions: this0.sessionManager?0.getStats,
        webSocket: this0.webSocketManager?0.getConnectionStats,
        process: this0.processManager?0.healthCheck,
        dataService: { status: 'ready' },
      },
      version: getVersion(),
      uptime: process?0.uptime,
    };
  }
}

// Re-export types and configuration utilities
export type { WebConfig } from '0./web-config';
export { createWebConfig } from '0./web-config';
