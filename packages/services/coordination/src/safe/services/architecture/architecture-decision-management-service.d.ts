/**
 * @fileoverview Architecture Decision Management Service - ADR management and decision tracking.
 *
 * Provides specialized architecture decision record (ADR) management with AI-powered
 * decision analysis, automated tracking, stakeholder coordination, and decision governance.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent decision analysis and recommendation
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for decision approval workflows
 * - @claude-zen/agui: Human-in-loop approvals for critical decisions
 * - ../../teamwork: ConversationOrchestrator for stakeholder collaboration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
/**
 * Architecture Decision Record with enhanced tracking
 */
export interface ArchitectureDecisionRecord {
    id: string;
    title: string;
    status: ADRStatus;
    context: string;
    decision: string;
    consequences: string[];
    alternatives: Alternative[];
    createdAt: Date;
    updatedAt: Date;
    author: string;
    stakeholders: string[];
    category: DecisionCategory;
    impact: DecisionImpact;
    confidenceLevel: number;
    reviewCycle: ReviewCycle;
    dependencies: string[];
    supersededBy?: string;
    supersedes?: string[];
    tags: string[];
    attachments: Attachment[];
    metrics: DecisionMetric[];
}
/**
 * ADR status enumeration
 */
export type ADRStatus = draft | proposed | under_review | accepted | rejected | deprecated | superseded | 'amended;;
/**
 * Decision categories for organization
 */
export type DecisionCategory = architecture_pattern | technology_selection | integration_approach | security_policy | performance_standard | data_management | deployment_strategy | quality_standard | governance_policy | 'infrastructure_decision;;
/**
 * Decision impact assessment
 */
export interface DecisionImpact {
    readonly scope: 'local|system|enterprise|ecosystem;;
    readonly timeHorizon: short_term | medium_term | long_term | 'strategic;;
    readonly riskLevel: 'low|medium|high|critical;;
    readonly businessImpact: number;
    readonly technicalComplexity: number;
    readonly implementationEffort: number;
    readonly maintenanceOverhead: number;
}
/**
 * Alternative solution considered
 */
export interface Alternative {
    readonly alternativeId: string;
    readonly name: string;
    readonly description: string;
    readonly pros: string[];
    readonly cons: string[];
    readonly cost: CostAnalysis;
    readonly feasibility: FeasibilityAssessment;
    readonly riskAssessment: RiskAssessment;
    readonly recommendationScore: number;
}
/**
 * Cost analysis for alternatives
 */
export interface CostAnalysis {
    readonly implementationCost: number;
    readonly maintenanceCost: number;
    readonly opportunityCost: number;
    readonly currency: string;
    readonly timeframe: 'annual' | 'project' | 'lifetime';
    readonly confidence: number;
}
/**
 * Feasibility assessment
 */
export interface FeasibilityAssessment {
    readonly technical: number;
    readonly operational: number;
    readonly economic: number;
    readonly legal: number;
    readonly timeline: number;
    readonly resource: number;
}
/**
 * Risk assessment for alternatives
 */
export interface RiskAssessment {
    readonly risks: Risk[];
    readonly overallRiskScore: number;
    readonly riskMitigationPlan: string;
    readonly contingencyPlan: string;
}
/**
 * Individual risk item
 */
export interface Risk {
    readonly riskId: string;
    readonly description: string;
    readonly probability: number;
    readonly impact: number;
    readonly riskScore: number;
    readonly mitigation: string;
    readonly owner: string;
}
/**
 * Review cycle for decision governance
 */
export interface ReviewCycle {
    readonly frequency: 'one_time|quarterly|annually|on_change;;
    readonly nextReviewDate?: Date;
    readonly reviewCriteria: string[];
    readonly reviewers: string[];
    readonly escalationPath: string[];
}
/**
 * Decision attachment (documents, diagrams, etc.)
 */
export interface Attachment {
    readonly attachmentId: string;
    readonly name: string;
    readonly type: 'document|diagram|code|link|image;;
    readonly url: string;
    readonly description: string;
    readonly uploadedBy: string;
    readonly uploadedAt: Date;
}
/**
 * Decision metrics for tracking effectiveness
 */
export interface DecisionMetric {
    readonly metricId: string;
    readonly name: string;
    readonly description: string;
    readonly targetValue: number;
    readonly currentValue: number;
    readonly unit: string;
    readonly trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
    readonly lastMeasured: Date;
}
/**
 * Decision request for new ADRs
 */
export interface DecisionRequest {
    readonly title: string;
    readonly description: string;
    readonly context: string;
    readonly options: DecisionOption[];
    readonly requester: string;
    readonly stakeholders: string[];
    readonly deadline?: Date;
    readonly priority: 'low|medium|high|critical;;
    readonly businessJustification: string;
}
/**
 * Decision option within a request
 */
export interface DecisionOption {
    readonly title: string;
    readonly description: string;
    readonly pros: string[];
    readonly cons: string[];
    readonly estimatedCost: number;
    readonly estimatedEffort: number;
    readonly riskLevel: 'low' | 'medium' | 'high';
}
/**
 * ADR management configuration
 */
export interface ADRConfig {
    readonly enableAIAnalysis: boolean;
    readonly enableAutomatedReviews: boolean;
    readonly enableStakeholderNotifications: boolean;
    readonly enableMetricsTracking: boolean;
    readonly defaultReviewCycle: ReviewCycle['frequency'];
    ': any;
    readonly maxAlternatives: number;
    readonly minStakeholders: number;
    readonly criticalDecisionThreshold: number;
    readonly autoApprovalThreshold: number;
}
/**
 * ADR analytics dashboard data
 */
export interface ADRDashboard {
    readonly totalDecisions: number;
    readonly decisionsByStatus: Record<ADRStatus, number>;
    readonly decisionsByCategory: Record<DecisionCategory, number>;
    readonly averageDecisionTime: number;
    readonly stakeholderEngagement: StakeholderEngagement[];
    readonly decisionEffectiveness: EffectivenessMetric[];
    readonly upcomingReviews: ArchitectureDecisionRecord[];
    readonly trendAnalysis: DecisionTrend[];
}
/**
 * Stakeholder engagement metrics
 */
export interface StakeholderEngagement {
    readonly stakeholder: string;
    readonly participationRate: number;
    readonly avgResponseTime: number;
    readonly influenceScore: number;
    readonly expertiseAreas: DecisionCategory[];
}
/**
 * Decision effectiveness tracking
 */
export interface EffectivenessMetric {
    readonly decisionId: string;
    readonly title: string;
    readonly implementationSuccess: number;
    readonly outcomeAlignment: number;
    readonly stakeholderSatisfaction: number;
    readonly technicalOutcome: number;
    readonly businessOutcome: number;
}
/**
 * Decision trend analysis
 */
export interface DecisionTrend {
    readonly period: string;
    readonly decisionsCreated: number;
    readonly decisionsAccepted: number;
    readonly decisionsRejected: number;
    readonly avgTimeToDecision: number;
    readonly qualityTrend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
}
/**
 * Architecture Decision Management Service - ADR management and decision tracking
 *
 * Provides comprehensive architecture decision record management with AI-powered
 * decision analysis, automated tracking, stakeholder coordination, and decision governance.
 */
export declare class ArchitectureDecisionManagementService {
    private readonly logger;
    private brainCoordinator?;
    private performanceTracker?;
    private telemetryManager?;
    private workflowEngine?;
    private aguiService?;
    private conversationOrchestrator?;
    private initialized;
    private decisionRecords;
    private config;
    constructor(logger: Logger, config?: Partial<ADRConfig>);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Create architecture decision record with AI-powered analysis
     */
    createArchitectureDecisionRecord(decision: Omit<ArchitectureDecisionRecord, id | createdAt | updatedAt | status | confidenceLevel | 'alternatives'>, : any): any;
}
//# sourceMappingURL=architecture-decision-management-service.d.ts.map