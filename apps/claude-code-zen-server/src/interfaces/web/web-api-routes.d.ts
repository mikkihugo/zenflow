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
import type { WebConfig } from './web-config';
import type { WebDataService } from './web-data-service';
import type { WebSessionManager } from './web-session-manager';
export declare class WebApiRoutes {
    private logger;
    private config;
    private sessionManager;
    private dataService;
    private llmStatsService;
    private workspaceApi;
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
    /**
     * Handle MCP requests from Claude Desktop.
     */
    private handleMcpRequest;
    /**
     * Get available MCP tools list.
     */
    private handleMcpTools;
    /**
     * Handle MCP CORS preflight requests.
     */
    private handleMcpOptions;
    /**
     * Get LLM statistics endpoint.
     */
    private handleGetLLMStats;
    /**
     * Export LLM statistics endpoint.
     */
    private handleExportLLMStats;
    /**
     * Get LLM system health endpoint.
     */
    private handleGetLLMHealth;
    /**
     * Get LLM provider stats endpoint.
     */
    private handleGetLLMProviders;
    /**
     * Clear LLM statistics history endpoint.
     */
    private handleClearLLMHistory;
    /**
     * Get matron consultations endpoint.
     */
    private handleGetConsultations;
    /**
     * Create matron consultation endpoint.
     */
    private handleCreateConsultation;
    /**
     * Get matron experts endpoint.
     */
    private handleGetExperts;
    /**
     * Get matron recommendations endpoint.
     */
    private handleGetRecommendations;
    /**
     * Get matron metrics endpoint.
     */
    private handleGetMatronMetrics;
    /**
     * Get roadmaps endpoint - Real production data based on actual project roadmaps.
     */
    private handleGetRoadmaps;
    /**
     * Create roadmap endpoint.
     */
    private handleCreateRoadmap;
    /**
     * Get milestones endpoint - Real production milestones based on actual development progress.
     */
    private handleGetMilestones;
    /**
     * Create milestone endpoint.
     */
    private handleCreateMilestone;
    /**
     * Get vision statements endpoint - Real production vision statements.
     */
    private handleGetVisionStatements;
    /**
     * Get roadmap metrics endpoint - Real production metrics.
     */
    private handleGetRoadmapMetrics;
    /**
     * API Documentation index endpoint.
     */
    private handleApiDocs;
    /**
     * OpenAPI specification endpoint.
     */
    private handleOpenApiSpec;
    /**
     * Swagger UI endpoint.
     */
    private handleSwaggerUI;
    private handleGetAGUWorkflows;
    private handleApproveWorkflow;
    private handleRejectWorkflow;
    private handleEscalateWorkflow;
    private handleGetAGUApprovals;
    private handleGetAGUGovernance;
    private handleGetAGUMetrics;
    private handleGetDevCommHistory;
    private handleSendDevComm;
    private handleClearDevCommHistory;
    private handleGetSystemStatus;
    private handleGetSystemPerformance;
    private handleGetSystemSwarms;
    /**
     * Setup Apidog best practices middleware
     */
    private setupApidogMiddleware;
    /**
     * Setup Swagger/OpenAPI 3.0 documentation
     */
    private setupSwaggerDocs;
    /**
     * Collective health endpoint - Real system status.
     */
    private handleCollectiveHealth;
    /**
     * Collective status endpoint - Detailed system status.
     */
    private handleCollectiveStatus;
    /**
     * Collective search endpoint - Search universal facts.
     */
    private handleCollectiveSearch;
    /**
     * Collective stats endpoint - Performance metrics.
     */
    private handleCollectiveStats;
    /**
     * Collective refresh endpoint - Force knowledge refresh.
     */
    private handleCollectiveRefresh;
    /**
     * Collective clear cache endpoint - Clear fact cache.
     */
    private handleCollectiveClearCache;
}
//# sourceMappingURL=web-api-routes.d.ts.map