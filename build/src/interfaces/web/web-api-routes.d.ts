/**
 * Web API Routes - RESTful API endpoint definitions.
 *
 * Centralized API route definitions for the web dashboard.
 * Handles all HTTP API endpoints with proper error handling.
 */
/**
 * @file Interface implementation: web-api-routes.
 */
import type { Express } from 'express';
import type { WebConfig } from './web-config.ts';
import type { WebDataService } from './web-data-service.ts';
import type { WebSessionManager } from './web-session-manager.ts';
export declare class WebApiRoutes {
    private logger;
    private config;
    private sessionManager;
    private dataService;
    constructor(config: WebConfig, sessionManager: WebSessionManager, dataService: WebDataService);
    /**
     * Setup all API routes.
     *
     * @param app
     */
    setupRoutes(app: Express): void;
    /**
     * Health check endpoint.
     *
     * @param _req
     * @param res
     */
    private handleHealthCheck;
    /**
     * System status endpoint.
     *
     * @param _req
     * @param res
     */
    private handleSystemStatus;
    /**
     * Get swarms endpoint.
     *
     * @param _req
     * @param res
     */
    private handleGetSwarms;
    /**
     * Create swarm endpoint.
     *
     * @param req
     * @param res
     */
    private handleCreateSwarm;
    /**
     * Get tasks endpoint.
     *
     * @param _req
     * @param res
     */
    private handleGetTasks;
    /**
     * Create task endpoint.
     *
     * @param req
     * @param res
     */
    private handleCreateTask;
    /**
     * Get documents endpoint.
     *
     * @param _req
     * @param res
     */
    private handleGetDocuments;
    /**
     * Execute command endpoint.
     *
     * @param req
     * @param res
     */
    private handleExecuteCommand;
    /**
     * Get settings endpoint.
     *
     * @param req
     * @param res
     */
    private handleGetSettings;
    /**
     * Update settings endpoint.
     *
     * @param req
     * @param res
     */
    private handleUpdateSettings;
}
//# sourceMappingURL=web-api-routes.d.ts.map