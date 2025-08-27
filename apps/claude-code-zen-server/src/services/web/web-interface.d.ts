/**
 * Web Interface - Modern modular browser-based dashboard.
 *
 * Refactored into clean, maintainable modules following Google standards.
 * Orchestrates web server, API routes, WebSocket, sessions, and process management.
 */
declare class WebConfig {
    port: number;
    [key: string]: unknown;
    constructor(config: unknown);
}
/**
 * Main Web Interface orchestrator.
 *
 * Coordinates all web dashboard components using composition pattern.
 * Reduced from 728 lines to clean, maintainable architecture.
 */
export declare class WebInterface {
    private logger;
    private config;
    private container?;
    private lifecycleManager?;
    private server;
    private sessionManager;
    private dataService;
    private apiRoutes;
    private webSocketManager;
    private htmlGenerator;
    private processManager;
    private svelteProxyConfig;
    constructor(config?: WebConfig);
    /**
     * Initialize all modular components.
     */
    private initializeComponents;
    /**
     * Start the complete web interface system.
     */
    run(): Promise<void>;
    /**
     * Setup all components with proper integration.
     */
    private setupComponents;
    /**
     * Setup Svelte proxy routes for the web dashboard.
     *
     * @param app Express application
     */
    private setupSvelteProxy;
    /**
     * Setup fallback routes for HTML generation.
     *
     * @param app Express application
     */
    private setupFallbackRoutes;
    /**
     * Stop the web interface gracefully.
     */
    stop(): Promise<void>;
    /**
     * Get comprehensive system status.
     */
    getStatus(): {
        server: unknown;
        sessions: unknown;
        webSocket: unknown;
        process: unknown;
        config: WebConfig;
    };
    /**
     * Broadcast event to all connected WebSocket clients.
     *
     * @param event Event name
     * @param data Event data
     */
    broadcast(event: string, data: unknown): void;
    /**
     * Get web interface capabilities (static method).
     */
    static getCapabilities(): unknown;
    /**
     * Health check for the entire web interface.
     */
    healthCheck(): {
        status: 'healthy' | 'warning' | 'error';
        components: Record<string, unknown>;
        version: string;
        uptime: number;
    };
    /**
     * Create web configuration with defaults.
     */
    private createWebConfig;
}
export type { WebConfig } from './web-config';
export { createWebConfig } from './web-config';
//# sourceMappingURL=web-interface.d.ts.map