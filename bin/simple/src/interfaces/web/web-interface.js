import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLogger } from '../../config/logging-config.ts';
import { ProcessLifecycleManager } from '../../core/process-lifecycle.ts';
import { WebApiRoutes } from './web-api-routes.ts';
import { createWebConfig } from './web-config.ts';
import { WebDashboardServer } from './web-dashboard-server.ts';
import { WebDataService } from './web-data-service.ts';
import { WebHtmlGenerator } from './web-html-generator.ts';
import { WebProcessManager } from './web-process-manager.ts';
import { WebSessionManager } from './web-session-manager.ts';
import { WebSocketManager } from './web-socket-manager.ts';
const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
export class WebInterface {
    logger = getLogger('WebInterface');
    config;
    container;
    lifecycleManager;
    server;
    sessionManager;
    dataService;
    apiRoutes;
    webSocketManager;
    htmlGenerator;
    processManager;
    constructor(config = {}) {
        this.config = createWebConfig({
            staticDir: join(__dirname, '../../../web/dist'),
            ...config,
        });
        this.container = config.container;
        this.initializeComponents();
    }
    initializeComponents() {
        this.server = new WebDashboardServer(this.config);
        this.dataService = new WebDataService();
        this.sessionManager = new WebSessionManager(this.config);
        this.apiRoutes = new WebApiRoutes(this.config, this.sessionManager, this.dataService);
        this.webSocketManager = new WebSocketManager(this.server.getSocketIO(), this.config, this.dataService);
        this.htmlGenerator = new WebHtmlGenerator(this.config);
        this.processManager = new WebProcessManager(this.config);
        this.logger.debug('All web interface components initialized');
    }
    async run() {
        try {
            this.logger.info('Starting Claude Code Flow web interface with enhanced lifecycle management');
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
            if (this.config.daemon) {
                const existing = await this.processManager.isInstanceRunning();
                if (existing) {
                    throw new Error(`Web interface already running with PID ${existing.pid}`);
                }
            }
            await this.setupComponents();
            if (this.config.daemon) {
                await this.processManager.startDaemonMode();
            }
            await this.server.start();
            this.logger.info('Web interface started successfully');
        }
        catch (error) {
            this.logger.error('Failed to start web interface:', error);
            throw error;
        }
    }
    async setupComponents() {
        const app = this.server.getApp();
        this.server.setupMiddleware();
        app.use(this.sessionManager.middleware());
        await this.autoConvertMCPTools(app);
        this.apiRoutes.setupRoutes(app);
        this.webSocketManager.setupWebSocket();
        this.setupFallbackRoutes(app);
        this.logger.debug('All components configured and integrated');
    }
    async autoConvertMCPTools(app) {
        try {
            this.logger.info('🔄 Setting up shared services API routes...');
            const { swarmRouter } = await import('./api/swarm-routes.js');
            app.use('/api/v1/swarm', swarmRouter);
            this.logger.info('✅ Swarm API routes registered at /api/v1/swarm/*');
            this.logger.info('   Same business logic as stdio MCP server');
            this.logger.info('   Available for web dashboard and HTTP MCP server');
        }
        catch (error) {
            this.logger.warn('Shared services setup failed, continuing without:', error instanceof Error ? error.message : String(error));
        }
    }
    setupFallbackRoutes(app) {
        app.get('/', (_req, res) => {
            if (existsSync(this.config.staticDir)) {
                res.sendFile(join(this.config.staticDir, 'index.html'));
            }
            else {
                res.send(this.htmlGenerator.generateDashboardHtml());
            }
        });
        app.get('*', (_req, res) => {
            if (existsSync(join(this.config.staticDir, 'index.html'))) {
                res.sendFile(join(this.config.staticDir, 'index.html'));
            }
            else {
                res.send(this.htmlGenerator.generateDashboardHtml());
            }
        });
    }
    async stop() {
        this.logger.info('Stopping web interface...');
        try {
            this.webSocketManager.stopBroadcasting();
            await this.server.stop();
            if (this.config.daemon) {
                await this.processManager.gracefulShutdown();
            }
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
    broadcast(event, data) {
        this.webSocketManager.broadcast(event, data);
    }
    static getCapabilities() {
        return WebDashboardServer.getCapabilities();
    }
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
            version: '2.0.0-alpha.73',
            uptime: process.uptime(),
        };
    }
}
export { createWebConfig } from './web-config.ts';
//# sourceMappingURL=web-interface.js.map