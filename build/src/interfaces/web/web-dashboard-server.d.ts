/**
 * Web Dashboard Server - Express.js HTTP server setup.
 *
 * Handles Express server initialization, middleware, and core HTTP functionality.
 * Separated from business logic for better maintainability.
 */
/**
 * @file Interface implementation: web-dashboard-server.
 */
import { type Server as HTTPServer } from 'node:http';
import { type Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import type { WebConfig } from './web-config.ts';
export declare class WebDashboardServer {
    private logger;
    private app;
    private server;
    private io;
    private config;
    constructor(config: WebConfig);
    /**
     * Get Express app instance.
     */
    getApp(): Express;
    /**
     * Get HTTP server instance.
     */
    getServer(): HTTPServer;
    /**
     * Get Socket.IO instance.
     */
    getSocketIO(): SocketIOServer;
    /**
     * Setup Express middleware.
     */
    setupMiddleware(): void;
    /**
     * Start the HTTP server.
     */
    start(): Promise<void>;
    /**
     * Stop the HTTP server.
     */
    stop(): Promise<void>;
    /**
     * Get server capabilities.
     */
    static getCapabilities(): any;
}
//# sourceMappingURL=web-dashboard-server.d.ts.map