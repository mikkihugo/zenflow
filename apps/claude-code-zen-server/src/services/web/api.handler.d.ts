/**
 * API Route Handler - RESTful API endpoints.
 *
 * Handles all REST API routes for the web dashboard including system status,
 * swarm management, task operations, and command execution.
 */
import type { Express } from 'express';
import type { WebSocketCoordinator } from '../../infrastructure/websocket/socket.coordinator';
export interface ApiConfig {
    prefix: string;
    enableCors?: boolean;
}
export interface SystemStatus {
    status: string;
    version: string;
    uptime: number;
    memory: {
        used: number;
        total: number;
    };
    environment: string;
}
export interface SwarmInfo {
    id: string;
    name: string;
    status: string;
    agents: number;
}
export interface TaskInfo {
    id: string;
    title: string;
    status: string;
    priority: string;
}
/**
 * Handles RESTful API routes for web interface.
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
     */
    private handleHealth;
    /**
     * System status handler.
     */
    private handleSystemStatus;
    /**
     * Get swarms handler.
     */
    private handleGetSwarms;
    /**
     * Create swarm handler.
     */
    private handleCreateSwarm;
    /**
     * Get tasks handler.
     */
    private handleGetTasks;
    /**
     * Create task handler.
     */
    private handleCreateTask;
    /**
     * Get documents handler.
     */
    private handleGetDocuments;
    /**
     * Execute command handler.
     */
    private handleExecuteCommand;
    /**
     * Get settings handler.
     */
    private handleGetSettings;
    /**
     * Update settings handler.
     */
    private handleUpdateSettings;
    /**
     * Get logs handler.
     */
    private handleGetLogs;
    private getSystemStatus;
    private getSwarms;
    private createSwarm;
    private getTasks;
    private createTask;
    private getDocuments;
    private executeCommand;
    private getSettings;
    private updateSettings;
    private getLogs;
}
//# sourceMappingURL=api.handler.d.ts.map