/**
 * Web Interface - Modern modular browser-based dashboard.
 *
 * Refactored into clean, maintainable modules following Google standards.
 * Orchestrates web server, API routes, WebSocket, sessions, and process management.
 */
/**
 * @file Interface implementation: web-interface.
 */
import { type WebConfig } from './web-config';
/**
 * Main Web Interface orchestrator.
 *
 * Coordinates all web dashboard components using composition pattern.
 * Reduced from 728 lines to clean, maintainable architecture.
 *
 * @example
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
     * Setup fallback routes for HTML generation.
     *
     * @param app
     */
    private setupFallbackRoutes;
    /**
     * Stop the web interface gracefully.
     */
    stop(): Promise<void>;
    /**
     * Get comprehensive system status.
     */
    getStatus(): Promise<{
        server: unknown;
        sessions: unknown;
        webSocket: unknown;
        process: unknown;
        config: WebConfig;
    }>;
    /**
     * Broadcast event to all connected WebSocket clients.
     *
     * @param event
     * @param data
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
}
export type { WebConfig } from './web-config';
export { createWebConfig } from './web-config';
//# sourceMappingURL=web-interface.d.ts.map