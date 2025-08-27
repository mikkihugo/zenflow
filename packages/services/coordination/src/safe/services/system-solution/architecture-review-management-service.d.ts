/**
 * @fileoverview Architecture Review Management Service - Architecture review workflows and coordination.
 *
 * Provides specialized architecture review management with AI-powered review analysis,
 * automated workflow orchestration, and intelligent review coordination.
 *
 * Integrates with:
 * - @claude-zen/agui: Human-in-loop approvals for architecture reviews and approval workflows
 * - @claude-zen/brain: BrainCoordinator for intelligent review analysis and recommendation
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for review workflow orchestration
 * - ../../teamwork: ConversationOrchestrator for stakeholder collaboration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export type { ArchitectureReview, ReviewFinding, SystemDesign, } from '../../managers/system-solution-architecture-manager';
import type { ArchitectureReview, SystemDesign } from '../../managers/system-solution-architecture-manager';
/**
 * Architecture review management configuration
 */
export interface ArchitectureReviewConfig {
    readonly maxConcurrentReviews: number;
    readonly defaultReviewTimeout: number;
    readonly enableAIAnalysis: boolean;
    readonly enableAutomatedReviews: boolean;
    readonly enableStakeholderNotifications: boolean;
    readonly criticalReviewThreshold: number;
    readonly autoApprovalThreshold: number;
}
/**
 * Review workflow request
 */
export interface ReviewWorkflowRequest {
    readonly systemDesignId: string;
    readonly reviewType: 'peer|formal|compliance|security;;
    readonly reviewerId: string;
    readonly priority: 'low|medium|high|critical;;
    readonly deadline?: Date;
    readonly context?: any;
}
/**
 * Review analytics dashboard data
 */
export interface ArchitectureReviewDashboard {
    readonly totalReviews: number;
    readonly reviewsByType: Record<string, number>;
    readonly reviewsByStatus: Record<string, number>;
    readonly averageReviewTime: number;
    readonly reviewerWorkload: ReviewerWorkload[];
    readonly reviewEffectiveness: ReviewEffectiveness;
    readonly pendingReviews: ArchitectureReview[];
    readonly recentCompletions: ArchitectureReview[];
}
/**
 * Reviewer workload tracking
 */
export interface ReviewerWorkload {
    readonly reviewerId: string;
    readonly activeReviews: number;
    readonly completedReviews: number;
    readonly averageReviewTime: number;
    readonly approvalRate: number;
    readonly expertiseAreas: string[];
}
/**
 * Review effectiveness metrics
 */
export interface ReviewEffectiveness {
    readonly overallEffectiveness: number;
    readonly findingsAccuracy: number;
    readonly stakeholderSatisfaction: number;
    readonly processEfficiency: number;
    readonly qualityImprovement: number;
}
/**
 * Architecture Review Management Service - Architecture review workflows and coordination
 *
 * Provides comprehensive architecture review management with AI-powered analysis,
 * automated workflow orchestration, and intelligent review coordination.
 */
export declare class ArchitectureReviewManagementService {
    private readonly logger;
    private aguiService?;
    private brainCoordinator?;
    private performanceTracker?;
    private telemetryManager?;
    private workflowEngine?;
    private conversationOrchestrator?;
    private initialized;
    private activeReviews;
    private completedReviews;
    private config;
    constructor(logger: Logger, config?: Partial<ArchitectureReviewConfig>);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Initiate architecture review with AI-powered workflow orchestration
     */
    initiateArchitectureReview(request: ReviewWorkflowRequest, systemDesign: SystemDesign): Promise<ArchitectureReview>;
    catch(error: any): void;
}
export default ArchitectureReviewManagementService;
//# sourceMappingURL=architecture-review-management-service.d.ts.map