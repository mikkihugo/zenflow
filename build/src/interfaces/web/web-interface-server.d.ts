/**
 * Web Interface Server - Main web dashboard server.
 *
 * Refactored Google-standard web interface that coordinates between.
 * Focused modules for WebSocket, API routes, and daemon management.
 */
/**
 * @file Interface implementation: web-interface-server.
 */
export interface WebConfig {
    port?: number;
    host?: string;
    daemon?: boolean;
    staticDir?: string;
    apiPrefix?: string;
    cors?: boolean;
    auth?: {
        enabled: boolean;
        secret?: string;
    };
    theme?: 'dark' | 'light';
    realTime?: boolean;
}
/**
 * Main web interface server coordinating all web functionality.
 *
 * @example
 */
export declare class WebInterfaceServer {
    private logger;
    private config;
    private app;
    private server;
    private io;
    private webSocketCoordinator;
    private daemonManager;
    private apiRouteHandler;
    constructor(config?: WebConfig);
    /**
     * Initialize server components.
     */
    private initializeServer;
    /**
     * Setup Express middleware.
     */
    private setupMiddleware;
    /**
     * Setup static file serving.
     */
    private setupStaticRoutes;
    /**
     * Start the web interface server.
     */
    start(): Promise<void>;
    /**
     * Start server in normal mode.
     */
    private startServer;
    /**
     * Start server in daemon mode.
     */
    private startDaemon;
    /**
     * Stop the web interface server.
     */
    stop(): Promise<void>;
    /**
     * Get server status.
     */
    getStatus(): Promise<{
        running: boolean;
        mode: 'daemon' | 'server';
        port: number;
        uptime?: number;
        connections?: number;
        daemon?: any;
    }>;
    /**
     * Generate inline HTML for development.
     */
    private generateInlineHTML;
}
export default WebInterfaceServer;
//# sourceMappingURL=web-interface-server.d.ts.map