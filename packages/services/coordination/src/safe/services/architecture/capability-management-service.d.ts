/**
 * @fileoverview Capability Management Service - Architecture capability tracking and management.
 *
 * Provides specialized architecture capability management with AI-powered maturity assessment,
 * capability roadmapping, dependency tracking, and performance monitoring.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent capability analysis and roadmap planning
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for capability development workflows
 * - @claude-zen/agui: Human-in-loop approvals for capability investments
 * - @claude-zen/brain: LoadBalancer for resource optimization across capabilities
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
/**
 * Architecture Capability with enhanced tracking
 */
export interface ArchitectureCapability {
    id: string;
    name: string;
    description: string;
    category: CapabilityCategory;
    maturityLevel: number;
    status: CapabilityStatus;
    enablers: string[];
    dependencies: string[];
    kpis: CapabilityKPI[];
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    stakeholders: string[];
    businessValue: BusinessValueAssessment;
    technicalComplexity: TechnicalComplexityAssessment;
    investmentPlan: InvestmentPlan;
    roadmap: CapabilityRoadmap;
    metrics: CapabilityMetric[];
}
/**
 * Capability categories for organization
 */
export type CapabilityCategory = business_capability | technology_capability | process_capability | data_capability | security_capability | integration_capability | platform_capability | infrastructure_capability | governance_capability | 'innovation_capability;;
/**
 * Capability status enumeration
 */
export type CapabilityStatus = planning | developing | active | optimizing | retiring | deprecated | 'suspended;;
/**
 * Capability KPI with enhanced tracking
 */
export interface CapabilityKPI {
    id: string;
    name: string;
    description: string;
    metric: string;
    target: number;
    current: number;
    unit: string;
    trend: KPITrend;
    frequency: MeasurementFrequency;
    threshold: PerformanceThreshold;
    historicalData: HistoricalDataPoint[];
    lastMeasured: Date;
    dataSource: DataSource;
}
/**
 * KPI trend analysis
 */
export type KPITrend = improving | 'improving' | 'stable' | 'declining' | declining | volatile | 'unknown;;
/**
 * Measurement frequency options
 */
export type MeasurementFrequency = real_time | hourly | daily | weekly | monthly | quarterly | 'annually;;
/**
 * Performance threshold configuration
 */
export interface PerformanceThreshold {
    readonly excellent: number;
    readonly good: number;
    readonly warning: number;
    readonly critical: number;
    readonly direction: 'higher_is_better|lower_is_better;;
}
/**
 * Historical data point for KPI tracking
 */
export interface HistoricalDataPoint {
    readonly timestamp: Date;
    readonly value: number;
    readonly context: string;
    readonly anomaly: boolean;
    readonly confidence: number;
}
/**
 * Data source configuration for KPIs
 */
export interface DataSource {
    readonly sourceId: string;
    readonly name: string;
    readonly type: 'database|api|file|manual|stream;;
    readonly endpoint?: string;
    readonly refreshRate: number;
    readonly reliability: number;
}
/**
 * Business value assessment for capabilities
 */
export interface BusinessValueAssessment {
    readonly strategicAlignment: number;
    readonly revenueImpact: number;
    readonly costReduction: number;
    readonly riskMitigation: number;
    readonly marketAdvantage: number;
    readonly customerSatisfaction: number;
    readonly overallValue: number;
    readonly confidence: number;
    readonly lastAssessed: Date;
}
/**
 * Technical complexity assessment
 */
export interface TechnicalComplexityAssessment {
    readonly architecturalComplexity: number;
    readonly integrationComplexity: number;
    readonly dataComplexity: number;
    readonly securityComplexity: number;
    readonly scalabilityRequirements: number;
    readonly maintenanceOverhead: number;
    readonly overallComplexity: number;
    readonly confidence: number;
    readonly lastAssessed: Date;
}
/**
 * Investment plan for capability development
 */
export interface InvestmentPlan {
    readonly planId: string;
    readonly phases: InvestmentPhase[];
    readonly totalInvestment: number;
    readonly timeline: InvestmentTimeline;
    readonly roi: ROIProjection;
    readonly riskAssessment: InvestmentRiskAssessment;
    readonly approvals: ApprovalStatus[];
}
/**
 * Investment phase details
 */
export interface InvestmentPhase {
    readonly phaseId: string;
    readonly name: string;
    readonly description: string;
    readonly investment: number;
    readonly duration: number;
    readonly expectedOutcomes: string[];
    readonly successCriteria: string[];
    readonly risks: string[];
}
/**
 * Investment timeline
 */
export interface InvestmentTimeline {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly milestones: InvestmentMilestone[];
    readonly dependencies: TimelineDependency[];
}
/**
 * Investment milestone
 */
export interface InvestmentMilestone {
    readonly milestoneId: string;
    readonly name: string;
    readonly description: string;
    readonly targetDate: Date;
    readonly deliverables: string[];
    readonly successMetrics: string[];
}
/**
 * Timeline dependency
 */
export interface TimelineDependency {
    readonly dependencyId: string;
    readonly description: string;
    readonly type: 'capability|resource|approval|external;;
    readonly criticality: 'low|medium|high|critical;;
    readonly mitigation: string;
}
/**
 * ROI projection for investments
 */
export interface ROIProjection {
    readonly method: net_present_value | internal_rate_of_return | payback_period | 'benefit_cost_ratio;;
    readonly timeHorizon: number;
    readonly discountRate: number;
    readonly expectedROI: number;
    readonly confidenceInterval: [number, number];
    readonly breakEvenPoint: number;
    readonly assumptions: string[];
}
/**
 * Investment risk assessment
 */
export interface InvestmentRiskAssessment {
    readonly risks: InvestmentRisk[];
    readonly overallRiskScore: number;
    readonly riskMitigation: string[];
    readonly contingencyPlan: string;
    readonly monitoringPlan: string[];
}
/**
 * Individual investment risk
 */
export interface InvestmentRisk {
    readonly riskId: string;
    readonly description: string;
    readonly category: technical | financial | market | operational | 'regulatory;;
    readonly probability: number;
    readonly impact: number;
    readonly riskScore: number;
    readonly mitigation: string;
    readonly contingency: string;
    readonly owner: string;
}
/**
 * Approval status for investments
 */
export interface ApprovalStatus {
    readonly approvalId: string;
    readonly approver: string;
    readonly status: 'pending|approved|rejected|conditional;;
    readonly conditions?: string[];
    readonly comments?: string;
    readonly timestamp: Date;
}
/**
 * Capability roadmap with strategic planning
 */
export interface CapabilityRoadmap {
    readonly roadmapId: string;
    readonly timeHorizon: number;
    readonly initiatives: CapabilityInitiative[];
    readonly dependencies: RoadmapDependency[];
    readonly riskFactors: RoadmapRisk[];
    readonly assumptionsAndConstraints: string[];
    readonly lastUpdated: Date;
}
/**
 * Capability initiative within roadmap
 */
export interface CapabilityInitiative {
    readonly initiativeId: string;
    readonly name: string;
    readonly description: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly investment: number;
    readonly expectedBenefits: string[];
    readonly deliverables: string[];
    readonly owner: string;
    readonly status: 'planned|active|completed|cancelled;;
}
/**
 * Roadmap dependency
 */
export interface RoadmapDependency {
    readonly dependencyId: string;
    readonly fromInitiative: string;
    readonly toInitiative: string;
    readonly type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
    readonly lag: number;
    readonly criticality: 'low|medium|high|critical;;
}
/**
 * Roadmap risk factor
 */
export interface RoadmapRisk {
    readonly riskId: string;
    readonly description: string;
    readonly probability: number;
    readonly impact: number;
    readonly affectedInitiatives: string[];
    readonly mitigation: string;
    readonly contingency: string;
}
/**
 * Capability metric for performance tracking
 */
export interface CapabilityMetric {
    readonly metricId: string;
    readonly name: string;
    readonly description: string;
    readonly type: performance | efficiency | quality | adoption | 'value;;
    readonly currentValue: number;
    readonly targetValue: number;
    readonly unit: string;
    readonly trend: KPITrend;
    readonly benchmarkValue?: number;
    readonly lastMeasured: Date;
}
/**
 * Capability management configuration
 */
export interface CapabilityConfig {
    readonly enableAIAnalysis: boolean;
    readonly enableAutomatedAssessment: boolean;
    readonly enableRoadmapPlanning: boolean;
    readonly enableInvestmentOptimization: boolean;
    readonly maturityAssessmentFrequency: 'monthly' | 'quarterly' | 'annually';
    readonly maxCapabilities: number;
    readonly minBusinessValueThreshold: number;
    readonly maxComplexityThreshold: number;
    readonly defaultInvestmentHorizon: number;
    readonly kpiUpdateFrequency: number;
}
/**
 * Capability analytics dashboard data
 */
export interface CapabilityDashboard {
    readonly totalCapabilities: number;
    readonly capabilitiesByCategory: Record<CapabilityCategory, number>;
    readonly capabilitiesByStatus: Record<CapabilityStatus, number>;
    readonly capabilitiesByMaturity: Record<number, number>;
    readonly averageMaturityLevel: number;
    readonly totalInvestment: number;
    readonly portfolioROI: number;
    readonly topPerformingCapabilities: ArchitectureCapability[];
    readonly investmentAllocation: InvestmentAllocation[];
    readonly maturityTrends: MaturityTrend[];
    readonly riskExposure: RiskExposure[];
}
/**
 * Investment allocation data
 */
export interface InvestmentAllocation {
    readonly category: CapabilityCategory;
    readonly allocation: number;
    readonly percentage: number;
    readonly roi: number;
    readonly riskLevel: 'low|medium|high|critical;;
}
/**
 * Maturity trend data
 */
export interface MaturityTrend {
    readonly period: string;
    readonly averageMaturity: number;
    readonly improvementRate: number;
    readonly investmentEfficiency: number;
    readonly trend: 'accelerating|';
}
/**
 * Risk exposure data
 */
export interface RiskExposure {
    readonly category: CapabilityCategory;
    readonly riskScore: number;
    readonly exposureValue: number;
    readonly mitigationCoverage: number;
    readonly residualRisk: number;
}
/**
 * Capability Management Service - Architecture capability tracking and management
 *
 * Provides comprehensive architecture capability management with AI-powered maturity assessment,
 * capability roadmapping, dependency tracking, and performance monitoring.
 */
export declare class CapabilityManagementService {
    private readonly logger;
    private brainCoordinator?;
    private performanceTracker?;
    private telemetryManager?;
    private workflowEngine?;
    private aguiService?;
    private loadBalancer?;
    private initialized;
    private capabilities;
    private config;
    constructor(logger: Logger, config?: Partial<CapabilityConfig>);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Add architecture capability with AI-powered maturity assessment
     */
    addCapability(capability: Omit<ArchitectureCapability, id | createdAt | updatedAt | businessValue | technicalComplexity | investmentPlan | roadmap | 'metrics'>, : any): any;
}
//# sourceMappingURL=capability-management-service.d.ts.map