/**
 * @fileoverview Technical Debt Management Service - Technical debt tracking and remediation.
 *
 * Provides specialized technical debt management with AI-powered prioritization,
 * automated tracking, impact analysis, and integration with development workflows.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent debt prioritization and impact analysis
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for remediation workflows
 * - @claude-zen/agui: Human-in-loop approvals for high-impact debt items
 * - @claude-zen/brain: LoadBalancer for resource optimization (integrated)
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
/**
 * Technical Debt Item with enhanced tracking
 */
export interface TechnicalDebtItem {
    id: string;
    title: string;
    description: string;
    severity: 'critical|high|medium|low;;
    impact: string;
    effort: number;
    component: string;
    status: 'identified|approved|planned|in-progress|resolved;;
    category: TechnicalDebtCategory;
    priority: number;
    businessImpact: BusinessImpactLevel;
    technicalRisk: TechnicalRiskLevel;
    remediationPlan?: RemediationPlan;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Technical debt categories
 */
export type TechnicalDebtCategory = code_quality | security_vulnerability | performance_issue | maintainability | scalability | architecture_drift | deprecated_technology | test_debt | documentation_gap | 'infrastructure_debt;;
/**
 * Business impact levels for technical debt
 */
export type BusinessImpactLevel = {
    readonly level: 'low|medium|high|critical;;
    readonly customerImpact: number;
    readonly revenueImpact: number;
    readonly operationalImpact: number;
    readonly complianceRisk: number;
};
/**
 * Technical risk levels
 */
export type TechnicalRiskLevel = {
    readonly level: 'low|medium|high|critical;;
    readonly securityRisk: number;
    readonly performanceRisk: number;
    readonly maintainabilityRisk: number;
    readonly scalabilityRisk: number;
};
/**
 * Remediation plan for technical debt
 */
export interface RemediationPlan {
    readonly planId: string;
    readonly approachType: 'incremental|big_bang|parallel|hybrid;;
    readonly phases: RemediationPhase[];
    readonly timeline: {
        readonly startDate: Date;
        readonly endDate: Date;
        readonly milestones: Milestone[];
    };
    readonly resources: ResourceRequirement[];
    readonly risks: RemediationRisk[];
    readonly successCriteria: SuccessMetric[];
}
/**
 * Remediation phase
 */
export interface RemediationPhase {
    readonly phaseId: string;
    readonly name: string;
    readonly description: string;
    readonly duration: number;
    readonly effort: number;
    readonly dependencies: string[];
    readonly deliverables: string[];
    readonly validationCriteria: string[];
}
/**
 * Resource requirement for remediation
 */
export interface ResourceRequirement {
    readonly resourceType: developer | architect | qa | devops | 'security;;
    readonly skillLevel: 'junior|mid|senior|expert;;
    readonly hoursRequired: number;
    readonly timeframe: 'immediate|short_term|medium_term|long_term;;
}
/**
 * Remediation risk
 */
export interface RemediationRisk {
    readonly riskId: string;
    readonly description: string;
    readonly probability: number;
    readonly impact: number;
    readonly mitigation: string;
    readonly contingency: string;
}
/**
 * Success metric for remediation
 */
export interface SuccessMetric {
    readonly metricId: string;
    readonly name: string;
    readonly description: string;
    readonly targetValue: number;
    readonly measurementMethod: string;
    readonly validationFrequency: 'daily' | 'weekly' | 'monthly';
}
/**
 * Milestone in remediation timeline
 */
export interface Milestone {
    readonly milestoneId: string;
    readonly name: string;
    readonly description: string;
    readonly targetDate: Date;
    readonly deliverables: string[];
    readonly acceptanceCriteria: string[];
}
/**
 * Technical debt management configuration
 */
export interface TechnicalDebtConfig {
    readonly maxDebtItems: number;
    readonly criticalSeverityThreshold: number;
    readonly autoApprovalThreshold: number;
    readonly remediationPlanningThreshold: number;
    readonly prioritizationStrategy: severity_based | impact_based | ai_optimized | 'business_value;;
    readonly trackingGranularity: component | module | system | 'enterprise;;
}
/**
 * Technical debt analytics dashboard data
 */
export interface TechnicalDebtDashboard {
    readonly totalDebtItems: number;
    readonly debtByCategory: Record<TechnicalDebtCategory, number>;
    readonly debtBySeverity: Record<string, number>;
    readonly debtByStatus: Record<string, number>;
    readonly totalEffortRequired: number;
    readonly businessImpactScore: number;
    readonly technicalRiskScore: number;
    readonly remediationProgress: RemediationProgress[];
    readonly trendAnalysis: TrendData[];
    readonly topPriorityItems: TechnicalDebtItem[];
}
/**
 * Remediation progress tracking
 */
export interface RemediationProgress {
    readonly remediationId: string;
    readonly debtItemId: string;
    readonly currentPhase: string;
    readonly overallProgress: number;
    readonly timelineAdherence: number;
    readonly budgetAdherence: number;
    readonly qualityMetrics: QualityMetric[];
}
/**
 * Quality metric for remediation
 */
export interface QualityMetric {
    readonly metricName: string;
    readonly currentValue: number;
    readonly targetValue: number;
    readonly trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
    readonly measurement: string;
}
/**
 * Trend data for analytics
 */
export interface TrendData {
    readonly period: string;
    readonly debtIntroduced: number;
    readonly debtResolved: number;
    readonly netDebtChange: number;
    readonly velocityTrend: 'accelerating|';
}
/**
 * Technical Debt Management Service - Technical debt tracking and remediation
 *
 * Provides comprehensive technical debt management with AI-powered prioritization,
 * automated tracking, impact analysis, and integration with development workflows.
 */
export declare class TechnicalDebtManagementService {
    private readonly logger;
    private brainCoordinator?;
    private performanceTracker?;
    private telemetryManager?;
    private workflowEngine?;
    private aguiService?;
    private loadBalancer?;
    private initialized;
    private debtItems;
    private remediationPlans;
    private config;
    constructor(logger: Logger, config?: Partial<TechnicalDebtConfig>);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Add technical debt item with AI-powered prioritization and impact analysis
     */
    addTechnicalDebtItem(item: Omit<TechnicalDebtItem, id | createdAt | updatedAt | status | priority | businessImpact | 'technicalRisk'>, : any): any;
}
export default TechnicalDebtManagementService;
//# sourceMappingURL=technical-debt-management-service.d.ts.map