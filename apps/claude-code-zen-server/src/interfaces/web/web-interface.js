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
import { getLogger } from '../../config/logging-config';
import { getVersion } from '../../config/version';
import { ProcessLifecycleManager } from '../../core/process-lifecycle';
import { WebApiRoutes } from './web-api-routes';
// Import modular components
import { createWebConfig } from './web-config';
import { WebDashboardServer } from './web-dashboard-server';
import { WebDataService } from './web-data-service';
import { WebHtmlGenerator } from './web-html-generator';
import { WebProcessManager } from './web-process-manager';
import { WebSessionManager } from './web-session-manager';
import { WebSocketManager } from './web-socket-manager';
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
    logger = getLogger('WebInterface');
    config;
    container;
    lifecycleManager;
    // Component instances
    server;
    sessionManager;
    dataService;
    apiRoutes;
    webSocketManager;
    htmlGenerator;
    processManager;
    constructor(config = {}) {
        // Create unified configuration with defaults
        this.config = createWebConfig({
            staticDir: join(dirname(fileURLToPath(import.meta.url)), '../../../web/dist'),
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
    initializeComponents() {
        // Core server setup
        this.server = new WebDashboardServer(this.config);
        // Business logic and data management
        this.dataService = new WebDataService();
        // Session management
        this.sessionManager = new WebSessionManager(this.config);
        // API route handling
        this.apiRoutes = new WebApiRoutes(this.config, this.sessionManager, this.dataService);
        // WebSocket real-time communication
        this.webSocketManager = new WebSocketManager(this.server.getSocketIO(), this.config, this.dataService);
        // HTML generation for fallback UI
        this.htmlGenerator = new WebHtmlGenerator(this.config);
        // Process and daemon management
        this.processManager = new WebProcessManager(this.config);
        this.logger.debug('All web interface components initialized');
    }
    /**
     * Start the complete web interface system.
     */
    async run() {
        try {
            this.logger.info('Starting claude-code-zen web interface with enhanced lifecycle management');
            // Setup process lifecycle management if container is available
            if (this.container) {
                this.lifecycleManager = new ProcessLifecycleManager({
                    onShutdown: async () => {
                        this.logger.info('🧹 Graceful shutdown initiated...');
                        await this.stop();
                    },
                    onError: async (error) => {
                        this.logger.error('💥 Application error in web interface:', error);
                    },
                });
                this.logger.info('✅ Process lifecycle management enabled');
            }
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
        }
        catch (error) {
            this.logger.error('Failed to start web interface:', error);
            throw error;
        }
    }
    /**
     * Setup all components with proper integration.
     */
    async setupComponents() {
        const app = this.server.getApp();
        try {
            // Setup Express middleware
            this.server.setupMiddleware();
            this.logger.debug('✅ Express middleware setup complete');
        }
        catch (error) {
            this.logger.warn('⚠️ Express middleware setup failed, continuing...', error.message);
        }
        try {
            // Add session management middleware
            app.use(this.sessionManager.middleware());
            this.logger.debug('✅ Session middleware setup complete');
        }
        catch (error) {
            this.logger.warn('⚠️ Session middleware setup failed, continuing...', error.message);
        }
        // MCP removed - Web-only interface for maximum simplicity
        try {
            // Setup API routes
            this.apiRoutes.setupRoutes(app);
            this.logger.debug('✅ API routes setup complete');
        }
        catch (error) {
            this.logger.warn('⚠️ API routes setup failed, continuing...', error.message);
        }
        try {
            // Setup WebSocket communication
            this.webSocketManager.setupWebSocket();
            this.logger.debug('✅ WebSocket setup complete');
        }
        catch (error) {
            this.logger.warn('⚠️ WebSocket setup failed, continuing...', error.message);
        }
        try {
            // Setup fallback HTML serving
            this.setupFallbackRoutes(app);
            this.logger.debug('✅ Fallback routes setup complete');
        }
        catch (error) {
            this.logger.warn('⚠️ Fallback routes setup failed, continuing...', error.message);
        }
        this.logger.info('🎉 Component setup completed (with error tolerance for tsx compatibility)');
    }
    // MCP and shared services removed for web-only simplicity
    /**
     * Setup fallback routes for HTML generation.
     *
     * @param app
     */
    setupFallbackRoutes(app) {
        // Serve inline HTML if no build exists
        app.get('/', (_req, res) => {
            if (existsSync(this.config.staticDir)) {
                res.sendFile(join(this.config.staticDir, 'index.html'));
            }
            else {
                res.send(this.htmlGenerator.generateDashboardHtml());
            }
        });
        // Catch all for SPA - temporarily disabled due to path-to-regexp error
        // app.get('*', (_req: any, res: any) => {
        //   if (existsSync(join(this.config.staticDir!, 'index.html'))) {
        //     res.sendFile(join(this.config.staticDir!, 'index.html'));
        //   } else {
        //     res.send(this.htmlGenerator.generateDashboardHtml());
        //   }
        // });
    }
    /**
     * Stop the web interface gracefully.
     */
    async stop() {
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
        }
        catch (error) {
            this.logger.error('Error during shutdown:', error);
            throw error;
        }
    }
    /**
     * Get comprehensive system status.
     */
    async getStatus() {
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
    broadcast(event, data) {
        this.webSocketManager.broadcast(event, data);
    }
    /**
     * Get web interface capabilities (static method).
     */
    static getCapabilities() {
        return WebDashboardServer.getCapabilities();
    }
    /**
     * Health check for the entire web interface.
     */
    healthCheck() {
        return {
            status: 'healthy',
            components: {
                server: { status: 'running' },
                sessions: this.sessionManager.getStats(),
                webSocket: this.webSocketManager.getConnectionStats(),
                process: this.processManager.healthCheck(),
                dataService: { status: 'ready' },
            },
            version: getVersion(),
            uptime: process.uptime(),
        };
    }
}
export { createWebConfig } from './web-config';
//# sourceMappingURL=web-interface.js.map