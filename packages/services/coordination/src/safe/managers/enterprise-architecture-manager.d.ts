/**
 * @fileoverview Enterprise Architecture Manager - Lightweight Facade for SAFe Enterprise Architecture
 *
 * Provides comprehensive enterprise architecture management for SAFe environments through
 * delegation to specialized @claude-zen services for advanced functionality and intelligence.
 *
 * Delegates to:
 * - Architecture Principle Service for principle management and compliance validation
 * - Technology Standards Service for standard management and enforcement
 * - Governance Decision Service for decision workflows and approvals
 * - Architecture Health Service for health monitoring and metrics
 *
 * STATUS: 957 lines - Well-structured facade with comprehensive service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
export interface EnterpriseArchConfig {
    readonly enablePrincipleValidation: boolean;
    readonly enableTechnologyStandardCompliance: boolean;
    readonly enableArchitectureGovernance: boolean;
    readonly enableHealthMetrics: boolean;
    readonly principlesReviewInterval: number;
    readonly complianceCheckInterval: number;
    readonly governanceReviewInterval: number;
    readonly healthMetricsInterval: number;
    readonly maxArchitecturePrinciples: number;
    readonly maxTechnologyStandards: number;
    readonly complianceThreshold: number;
    readonly governanceApprovalTimeout: number;
}
export interface ArchitecturePrinciple {
    readonly id: string;
    readonly name: string;
    readonly statement: string;
    readonly rationale: string;
    readonly implications: string[];
    readonly category: string;
    readonly priority: string;
    readonly status: string;
    readonly owner: string;
    readonly stakeholders: string[];
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly reviewDate: Date;
    readonly version: string;
}
export interface TechnologyStandard {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly type: string;
    readonly status: string;
    readonly mandatory: boolean;
    readonly applicability: string[];
    readonly implementation: string;
    readonly verification: string;
    readonly exceptions: string[];
    readonly owner: string;
    readonly approvers: string[];
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly effectiveDate: Date;
    readonly reviewDate: Date;
    readonly version: string;
}
export interface GovernanceDecision {
    readonly id: string;
    readonly type: string;
    readonly title: string;
    readonly description: string;
    readonly requesterId: string;
    readonly decisionMakers: string[];
    readonly artifacts: string[];
    readonly criteria: string[];
    readonly risks: string[];
    readonly implications: string[];
    readonly priority: string;
    readonly status: string;
    readonly createdAt: Date;
    readonly requestedDecisionDate: Date;
    readonly actualDecisionDate?: Date;
    readonly approvalDeadline: Date;
    readonly version: string;
}
export interface ArchitectureHealthMetrics {
    readonly timestamp: Date;
    readonly overallHealth: number;
    readonly healthGrade: string;
    readonly dimensions: HealthDimension[];
    readonly trends: HealthTrend[];
    readonly alerts: HealthAlert[];
    readonly recommendations: HealthRecommendation[];
    readonly architecturalDebt: ArchitecturalDebt;
}
export interface HealthDimension {
    readonly name: string;
    readonly category: string;
    readonly score: number;
    readonly weight: number;
    readonly status: string;
    readonly trend: string;
    readonly metrics: any[];
    readonly issues: any[];
    readonly recommendations: string[];
}
export interface HealthTrend {
    readonly dimension: string;
    readonly period: string;
    readonly direction: string;
    readonly velocity: number;
    readonly significance: number;
    readonly confidence: number;
}
export interface HealthAlert {
    readonly alertId: string;
    readonly type: string;
    readonly severity: string;
    readonly title: string;
    readonly message: string;
    readonly dimension: string;
    readonly currentValue: number;
    readonly expectedValue: number;
    readonly threshold: number;
    readonly createdAt: Date;
    readonly status: string;
}
export interface HealthRecommendation {
    readonly recommendationId: string;
    readonly priority: string;
    readonly category: string;
    readonly title: string;
    readonly description: string;
    readonly expectedImpact: any;
    readonly implementation: any;
    readonly cost: any;
    readonly timeline: string;
}
export interface ArchitecturalDebt {
    readonly totalDebt: number;
    readonly currency: string;
    readonly categories: any[];
    readonly timeline: any;
    readonly priority: any[];
    readonly trends: any;
}
/**
 * Enterprise Architecture Manager - Lightweight facade for enterprise architecture management
 */
export declare class EnterpriseArchitectureManager extends EventBus {
    private readonly logger;
    private architecturePrincipleService;
    private technologyStandardsService;
    private governanceDecisionService;
    private architectureHealthService;
    private initialized;
    private config;
    private monitoringTimers;
    constructor(_config?: Partial<EnterpriseArchConfig>);
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    initialize(): Promise<void>;
    /**
     * Create architecture principle - Delegates to Architecture Principle Service
     */
    createArchitecturePrinciple(name: string, statement: string, rationale: string, category: string, priority?: string, implications?: string[]): Promise<ArchitecturePrinciple>;
    /**
     * Validate principle compliance - Delegates to Architecture Principle Service
     */
    validatePrincipleCompliance(principleId: string, validationScope?: any, complianceRules?: any[]): Promise<any>;
    /**
     * Create technology standard - Delegates to Technology Standards Service
     */
    createTechnologyStandard(name: string, description: string, category: string, type: string, mandatory: boolean, applicability: string[], implementation: string, verification: string, owner: string, : any): Promise<TechnologyStandard>;
    /**
     * Initiate governance decision - Delegates to Governance Decision Service
     */
    initiateGovernanceDecision(type: string, title: string, description: string, requesterId: string, decisionMakers: string[], priority?: string, requestedDecisionDate?: Date, criteria?: any[], risks?: any[], implications?: any[]): Promise<GovernanceDecision>;
    /**
     * Calculate architecture health metrics - Delegates to Architecture Health Service
     */
    calculateArchitectureHealthMetrics(): Promise<ArchitectureHealthMetrics>;
    /**
     * Get architecture principles
     */
    getArchitecturePrinciples(): ArchitecturePrinciple[];
    /**
     * Get technology standards
     */
    getTechnologyStandards(): TechnologyStandard[];
    /**
     * Get governance decisions
     */
    getGovernanceDecisions(): GovernanceDecision[];
    /**
     * Get enterprise architecture status
     */
    getEnterpriseArchitectureStatus(): any;
    /**
     * Shutdown enterprise architecture manager
     */
    shutdown(): Promise<void>;
    /**
     * Setup event forwarding from services
     */
    private setupServiceEventForwarding;
    /**
     * Start monitoring intervals for periodic tasks
     */
    private startMonitoringIntervals;
    /**
     * Review architecture principles
     */
    private reviewArchitecturePrinciples;
    /**
     * Perform compliance checks
     */
    private performComplianceChecks;
    /**
     * Review governance decisions
     */
    private reviewGovernanceDecisions;
}
export default EnterpriseArchitectureManager;
//# sourceMappingURL=enterprise-architecture-manager.d.ts.map