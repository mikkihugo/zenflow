/**
 * @fileoverview Runway Item Management Service - Architecture runway and backlog management.
 *
 * Provides specialized runway item management with governance approval workflows,
 * automated tracking, and integration with enterprise architecture planning.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent runway item prioritization
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for approval workflows
 * - @claude-zen/agui: Human-in-loop approvals for high-effort items
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
/**
 * Architecture Runway Item
 */
export interface ArchitectureRunwayItem {
    id: string;
    title: string;
    description: string;
    type: 'infrastructure|platform|enabler|technical-debt;;
    priority: 'critical|high|medium|low;;
    effort: number;
    dependencies: string[];
    status: 'backlog|planned|in-progress|completed|blocked;;
    assignedTo?: string;
    targetPI?: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Runway planning configuration
 */
export interface RunwayPlanningConfig {
    readonly maxRunwayItems: number;
    readonly runwayPlanningHorizon: number;
    readonly governanceApprovalThreshold: number;
    readonly prioritizationStrategy: value;
}
/**
 * Runway planning dashboard data
 */
export interface RunwayPlanningDashboard {
    readonly totalItems: number;
    readonly itemsByStatus: Record<string, number>;
    readonly itemsByPriority: Record<string, number>;
    readonly upcomingDeadlines: ArchitectureRunwayItem[];
    readonly blockedItems: ArchitectureRunwayItem[];
    readonly resourceAllocation: ResourceAllocation[];
    readonly completionTrends: CompletionTrend[];
}
/**
 * Resource allocation data
 */
export interface ResourceAllocation {
    readonly resource: string;
    readonly allocatedItems: number;
    readonly totalEffort: number;
    readonly utilization: number;
}
/**
 * Completion trend data
 */
export interface CompletionTrend {
    readonly period: string;
    readonly completed: number;
    readonly planned: number;
    readonly efficiency: number;
}
/**
 * Runway Item Management Service - Architecture runway and backlog management
 *
 * Provides comprehensive runway item management with AI-powered prioritization,
 * governance approval workflows, and intelligent resource allocation.
 */
export declare class RunwayItemManagementService {
    private readonly logger;
    private brainCoordinator?;
    private performanceTracker?;
    private workflowEngine?;
    private aguiService?;
    private initialized;
    private runwayItems;
    private planningConfig;
    constructor(logger: Logger, config?: Partial<RunwayPlanningConfig>);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Add runway item with intelligent prioritization and approval workflow
     */
    addRunwayItem(item: Omit<ArchitectureRunwayItem, 'id|createdAt|updatedAt|status'>, : any): any;
}
//# sourceMappingURL=runway-item-management-service.d.ts.map