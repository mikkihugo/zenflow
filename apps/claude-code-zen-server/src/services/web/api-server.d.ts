/**
 * @file API Server - Express.js server with comprehensive middleware
 *
 * Full-featured API server with security, monitoring, and reliability features.
 * Includes middleware stack, filesystem operations, health monitoring, and graceful shutdown.
 *
 * Features:
 * - Security: Helmet, CORS, rate limiting, input validation, directory traversal protection
 * - Monitoring: Health checks, dependency verification, metrics, structured logging
 * - Reliability: Graceful shutdown, error handling, filesystem security
 * - Performance: Compression, caching headers, optimized middleware
 */
interface ApiServerConfig {
    port: number;
    host?: string;
}
export declare class ApiServer {
    private config;
    private server;
    private app;
    private readonly logger;
    private controlApiRoutes;
    private systemCapabilityRoutes;
    constructor(config: ApiServerConfig);
    private setupMiddleware;
    private setupRoutes;
    /**
     * Set up system capability dashboard routes
     */
    private setupSystemCapabilityRoutes;
    /**
     * Set up TaskMaster SAFe workflow API routes
     */
    private setupTaskMasterRoutes;
    /**
     * Set up comprehensive control API routes
     */
    private setupControlRoutes;
    /**
     * Set up health and monitoring endpoints (K8s compatible)
     */
    private setupHealthRoutes;
    /**
     * Setup Kubernetes-compatible health check endpoints
     */
    private setupKubernetesHealthRoutes;
    /**
     * Handle Kubernetes liveness probe
     */
    private handleLivenessProbe;
    /**
     * Handle Kubernetes readiness probe
     */
    private handleReadinessProbe;
    /**
     * Perform readiness checks for all critical services
     */
    private performReadinessChecks;
    /**
     * Handle Kubernetes startup probe
     */
    private handleStartupProbe;
    /**
     * Setup legacy health check endpoint with enhanced dependency verification
     */
    private setupLegacyHealthRoute;
    /**
     * Handle legacy health check with comprehensive system verification
     */
    private handleLegacyHealthCheck;
    /**
     * Build comprehensive health response
     */
    private buildHealthResponse;
    /**
     * Check filesystem health
     */
    private checkFilesystemHealth;
    /**
     * Check memory usage health
     */
    private checkMemoryHealth;
    /**
     * Check uptime health
     */
    private checkUptimeHealth;
    /**
     * Set up system information endpoints
     */
    private setupSystemRoutes;
    /**
     * Set up workspace file system endpoints
     */
    private setupWorkspaceRoutes;
    /**
     * Handle workspace file system requests
     */
    private handleWorkspaceRequest;
    /**
     * Validate workspace path for security
     */
    private validateWorkspacePath;
    /**
     * Resolve workspace paths safely
     */
    private resolveWorkspacePaths;
    /**
     * Read workspace directory contents
     */
    private readWorkspaceDirectory;
    /**
     * Determine if workspace item should be skipped
     */
    private shouldSkipWorkspaceItem;
    /**
     * Sort workspace files (directories first, then alphabetically)
     */
    private sortWorkspaceFiles;
    /**
     * Set up Svelte web dashboard integration
     */
    private setupSvelteStaticFiles;
    /**
     * Set up default routes and error handlers
     */
    private setupDefaultRoutes;
    start(): Promise<void>;
    /**
     * Create connection monitoring object
     */
    private createConnectionMonitor;
    /**
     * Setup server error handling with enhanced diagnostics
     */
    private setupServerErrorHandling;
    /**
     * Log server error with comprehensive details
     */
    private logServerError;
    /**
     * Provide error recovery suggestions based on error type
     */
    private provideErrorRecoverySuggestions;
    /**
     * Start server listener with success handling
     */
    private startServerListener;
    /**
     * Log comprehensive server startup success information
     */
    private logServerStartupSuccess;
    /**
     * Log web dashboard information
     */
    private logWebDashboardInfo;
    /**
     * Log health check endpoints
     */
    private logHealthCheckEndpoints;
    /**
     * Log API endpoints information
     */
    private logApiEndpoints;
    /**
     * Log deployment configuration info
     */
    private logDeploymentInfo;
    /**
     * Log connection metrics
     */
    private logConnectionMetrics;
    stop(): Promise<void>;
    /**
     * Create comprehensive health check function for terminus
     */
    private createHealthCheck;
    private setupTerminus;
    /**
     * Get allowed CORS origins based on environment
     */
    private getCorsOrigins;
    getCapabilities(): {
        webDashboard: boolean;
        healthCheck: boolean;
        basicRouting: boolean;
        apiEndpoints: boolean;
        gracefulShutdown: boolean;
        productionMiddleware: boolean;
        workspac: string;
    };
}
export {};
//# sourceMappingURL=api-server.d.ts.map