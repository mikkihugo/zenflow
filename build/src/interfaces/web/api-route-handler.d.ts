/**
 * API Route Handler - RESTful API endpoints.
 *
 * Handles all REST API routes for the web dashboard including system status,
 * swarm management, task operations, and command execution.
 */
/**
 * @file Interface implementation: api-route-handler.
 */
import type { Express } from 'express';
import type { WebSocketCoordinator } from './web-socket-coordinator.ts';
export interface ApiConfig {
    prefix: string;
    enableCors?: boolean;
}
export interface SystemStatus {
    status: string;
    version: string;
    uptime: number;
    components: {
        mcp: {
            status: string;
            port: number;
        };
        swarm: {
            status: string;
            agents: number;
        };
        memory: {
            status: string;
            usage: any;
        };
        terminal: {
            status: string;
            mode: string;
            active: boolean;
        };
    };
    environment: {
        node: string;
        platform: string;
        arch: string;
        pid: number;
    };
}
/**
 * Handles RESTful API routes for web interface.
 *
 * @example
 */
export declare class ApiRouteHandler {
    private app;
    private webSocket;
    private config;
    private logger;
    constructor(app: Express, webSocket: WebSocketCoordinator, config: ApiConfig);
    /**
     * Setup all API routes.
     */
    private setupRoutes;
    /**
     * Health check handler.
     *
     * @param _req
     * @param res
     */
    private handleHealth;
    /**
     * System status handler.
     *
     * @param _req
     * @param res
     */
    private handleSystemStatus;
    /**
     * Get swarms handler.
     *
     * @param _req
     * @param res
     */
    private handleGetSwarms;
    /**
     * Create swarm handler.
     *
     * @param req
     * @param res
     */
    private handleCreateSwarm;
    /**
     * Get tasks handler.
     *
     * @param _req
     * @param res
     */
    private handleGetTasks;
    /**
     * Create task handler.
     *
     * @param req
     * @param res
     */
    private handleCreateTask;
    /**
     * Get documents handler.
     *
     * @param _req
     * @param res
     */
    private handleGetDocuments;
    /**
     * Execute command handler.
     *
     * @param req
     * @param res
     */
    private handleExecuteCommand;
    /**
     * Get settings handler.
     *
     * @param req
     * @param res
     */
    private handleGetSettings;
    /**
     * Update settings handler.
     *
     * @param req
     * @param res
     */
    private handleUpdateSettings;
    /**
     * Get comprehensive system status.
     */
    private getSystemStatus;
    /**
     * Get available swarms.
     */
    private getSwarms;
    /**
     * Create a new swarm.
     *
     * @param config
     */
    private createSwarm;
    /**
     * Get available tasks.
     */
    private getTasks;
    /**
     * Create a new task.
     *
     * @param config
     */
    private createTask;
    /**
     * Get available documents.
     */
    private getDocuments;
    /**
     * Execute a command.
     *
     * @param command
     * @param args
     */
    private executeCommand;
}
export default ApiRouteHandler;
//# sourceMappingURL=api-route-handler.d.ts.map