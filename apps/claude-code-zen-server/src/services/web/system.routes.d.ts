/**
 * @fileoverview System Capability REST API Routes
 *
 * Provides REST endpoints for system capability dashboard data.
 * Uses foundation data providers to serve capability information via HTTP API.
 *
 * Endpoints:
 * - GET /api/v1/system/capability/status - Overall system status summary
 * - GET /api/v1/system/capability/facades - Detailed facade information
 * - GET /api/v1/system/capability/suggestions - Installation suggestions
 * - GET /api/v1/system/capability/detailed - Complete capability data
 * - GET /api/v1/system/capability/health - Health monitoring endpoint
 *
 * @example
 * ```typescript
 * import { SystemCapabilityRoutes } from './system-capability-routes';
 *
 * const routes = new SystemCapabilityRoutes();
 * app.use('/api/v1/system/capability', routes.getRouter());
 * ```
 */
import { Router } from 'express';
export declare class SystemCapabilityRoutes {
    private router;
    private healthProviders;
    constructor();
    private setupRoutes;
    /**
     * GET /api/v1/system/capability/status
     * Returns overall system status summary
     */
    private handleGetStatus;
    /**
     * GET /api/v1/system/capability/facades
     * Returns detailed facade information
     */
    private handleGetFacades;
    /**
     * GET /api/v1/system/capability/suggestions
     * Returns installation suggestions for missing packages
     */
    private handleGetSuggestions;
    /**
     * GET /api/v1/system/capability/detailed
     * Returns complete system capability data
     */
    private handleGetDetailed;
    /**
     * GET /api/v1/system/capability/health
     * Health check endpoint for monitoring systems
     */
    private handleGetHealth;
    /**
     * GET /api/v1/system/capability/scores
     * Returns capability scores by facade
     */
    private handleGetScores;
    /**
     * Get the configured router
     */
    getRouter(): Router;
}
//# sourceMappingURL=system.routes.d.ts.map