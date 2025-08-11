/**
 * @file REST API Server - Express with Schema-driven Development.
 *
 * Main Express server implementing Google API Design Guide standards.
 * Features automatic OpenAPI 3 documentation and request validation.
 * Clean separation: REST API layer independent from business domains.
 */
import { type Application } from 'express';
/**
 * Main API Server Configuration.
 * Following Google's secure by default principles.
 *
 * @example
 */
export interface APIServerConfig {
    readonly port: number;
    readonly host: string;
    readonly environment: 'development' | 'production' | 'test';
    readonly enableSwagger: boolean;
    readonly enableValidation: boolean;
    readonly enableRateLimit: boolean;
    readonly rateLimitWindowMs: number;
    readonly rateLimitMaxRequests: number;
    readonly corsOrigins: string[];
}
/**
 * API Client Configuration.
 * Configuration for API client instances.
 *
 * @example
 */
export interface APIClientConfig {
    readonly baseURL: string;
    readonly timeout: number;
    readonly retryAttempts: number;
    readonly retryDelay: number;
    readonly enableAuth: boolean;
    readonly authToken?: string;
    readonly headers?: Record<string, string>;
}
/**
 * Default server configuration with secure defaults from centralized config.
 */
export declare const DEFAULT_API_CONFIG: APIServerConfig;
/**
 * Main API Server Class.
 * Implements Express server with all domain APIs.
 *
 * @example
 */
export declare class APIServer {
    private app;
    private config;
    private server?;
    constructor(config?: Partial<APIServerConfig>);
    /**
     * Setup middleware stack.
     * Following Google security and performance best practices.
     */
    private setupMiddleware;
    /**
     * Setup API routes.
     * All domain APIs under /api/v1/ with unified documentation.
     */
    private setupRoutes;
    /**
     * Setup coordination domain routes.
     * Uses modular route handlers from v1/coordination.ts.
     */
    private setupCoordinationRoutes;
    /**
     * Setup neural network domain routes.
     * Uses modular route handlers from v1/neural.ts.
     */
    private setupNeuralRoutes;
    /**
     * Setup memory domain routes.
     * Uses modular route handlers from v1/memory.ts.
     */
    private setupMemoryRoutes;
    /**
     * Setup database domain routes.
     * Uses modular route handlers from v1/database.ts.
     */
    private setupDatabaseRoutes;
    /**
     * Setup system-wide routes.
     * System health, metrics, configuration.
     */
    private setupSystemRoutes;
    /**
     * Setup error handling.
     * Standardized error responses following Google API Design Guide.
     */
    private setupErrorHandling;
    /**
     * Start the API server.
     * Returns a promise that resolves when server is listening.
     */
    start(): Promise<void>;
    /**
     * Stop the API server.
     * Gracefully closes all connections.
     */
    stop(): Promise<void>;
    /**
     * Get the Express app instance.
     * Useful for testing and custom middleware.
     */
    getApp(): Application;
    /**
     * Get current server configuration.
     */
    getConfig(): APIServerConfig;
}
/**
 * Factory function to create and start API server.
 * Convenient for simple use cases.
 *
 * @param config
 */
export declare const createAPIServer: (config?: Partial<APIServerConfig>) => Promise<APIServer>;
//# sourceMappingURL=server.d.ts.map