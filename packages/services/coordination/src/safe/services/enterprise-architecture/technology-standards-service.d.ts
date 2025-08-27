/**
 * @fileoverview Technology Standards Service - Enterprise Technology Standards Management
 *
 * Specialized service for managing enterprise technology standards within SAFe environments.
 * Handles standard creation, compliance enforcement, exception management, and lifecycle tracking.
 *
 * Features:
 * - Technology standard creation and management
 * - Standards compliance monitoring and enforcement
 * - Exception request processing and approval workflows
 * - Standard versioning and lifecycle management
 * - Automated compliance scanning and reporting
 * - Technology portfolio health monitoring
 *
 * Integrations:
 * - @claude-zen/knowledge: Technology standards knowledge base
 * - @claude-zen/fact-system: Compliance fact tracking and reasoning
 * - @claude-zen/workflows: Standards approval and exception workflows
 * - @claude-zen/monitoring: Technology compliance monitoring
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export interface TechnologyStandard {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: platform | framework | tool | protocol | security | data | 'integration;;
    readonly type: mandatory | recommended | approved | deprecated | 'prohibited;;
    readonly status: active | draft | under_review | deprecated | 'retired;;
    readonly mandatory: boolean;
    readonly applicability: ApplicabilityScope;
    readonly implementation: ImplementationGuidance;
    readonly verification: VerificationCriteria;
    readonly exceptions: ExceptionRule[];
    readonly owner: string;
    readonly approvers: string[];
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly effectiveDate: Date;
    readonly reviewDate: Date;
    readonly version: string;
    readonly complianceMetrics?: StandardComplianceMetrics;
    readonly dependencies?: StandardDependency[];
    readonly alternatives?: AlternativeStandard[];
}
export interface ApplicabilityScope {
    readonly domains: string[];
    readonly projectTypes: string[];
    readonly teamTypes: string[];
    readonly environments: string[];
    readonly exclusions: ScopeExclusion[];
    readonly conditions: ApplicabilityCondition[];
}
export interface ScopeExclusion {
    readonly type: 'domain|project|team|environment;;
    readonly value: string;
    readonly reason: string;
    readonly expiryDate?: Date;
}
export interface ApplicabilityCondition {
    readonly condition: string;
    readonly description: string;
    readonly weight: number;
}
export interface ImplementationGuidance {
    readonly overview: string;
    readonly requirements: Requirement[];
    readonly bestPractices: BestPractice[];
    readonly resources: Resource[];
    readonly migration: MigrationGuidance;
    readonly support: SupportChannel[];
}
export interface Requirement {
    readonly id: string;
    readonly description: string;
    readonly priority: 'mandatory' | 'recommended' | 'optional';
    readonly verification: string;
    readonly examples: string[];
    readonly dependencies: string[];
}
export interface BestPractice {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly rationale: string;
    readonly examples: string[];
    readonly category: string;
}
export interface Resource {
    readonly type: 'documentation|tool|template|training|support;;
    readonly name: string;
    readonly url: string;
    readonly description: string;
    readonly audience: string[];
}
export interface MigrationGuidance {
    readonly fromStandards: string[];
    readonly migrationPath: MigrationStep[];
    readonly timeline: string;
    readonly effort: 'low' | 'medium' | 'high';
    readonly risks: string[];
    readonly checkpoints: Checkpoint[];
}
export interface MigrationStep {
    readonly step: number;
    readonly title: string;
    readonly description: string;
    readonly duration: string;
    readonly dependencies: string[];
    readonly deliverables: string[];
    readonly validation: string;
}
export interface Checkpoint {
    readonly milestone: string;
    readonly criteria: string[];
    readonly owner: string;
    readonly dueDate?: Date;
}
export interface SupportChannel {
    readonly type: 'documentation|forum|chat|email|training;;
    readonly name: string;
    readonly contact: string;
    readonly availability: string;
    readonly sla: string;
}
export interface VerificationCriteria {
    readonly automated: AutomatedVerification[];
    readonly manual: ManualVerification[];
    readonly reporting: VerificationReporting;
}
export interface AutomatedVerification {
    readonly toolId: string;
    readonly toolName: string;
    readonly verificationRule: string;
    readonly frequency: 'continuous|daily|weekly|monthly;;
    readonly threshold: VerificationThreshold;
    readonly remediation: string;
}
export interface ManualVerification {
    readonly checklistId: string;
    readonly name: string;
    readonly description: string;
    readonly frequency: 'per_project|monthly|quarterly|annually;;
    readonly owner: string;
    readonly checklist: ChecklistItem[];
}
export interface ChecklistItem {
    readonly id: string;
    readonly description: string;
    readonly evidence: string;
    readonly mandatory: boolean;
    readonly weight: number;
}
export interface VerificationThreshold {
    readonly metric: string;
    readonly operator: 'gt|lt|eq|gte|lte;;
    readonly value: number;
    readonly unit: string;
}
export interface VerificationReporting {
    readonly frequency: 'daily|weekly|monthly|quarterly;;
    readonly recipients: string[];
    readonly format: 'dashboard|email|api|report;;
    readonly includeRecommendations: boolean;
    readonly escalationRules: EscalationRule[];
}
export interface EscalationRule {
    readonly trigger: string;
    readonly threshold: number;
    readonly escalateTo: string[];
    readonly severity: 'low|medium|high|critical;;
    readonly action: string;
}
export interface ExceptionRule {
    readonly id: string;
    readonly description: string;
    readonly justification: string;
    readonly scope: ExceptionScope;
    readonly conditions: string[];
    readonly approver: string;
    readonly expiryDate?: Date;
    readonly compensatingControls: string[];
    readonly riskAssessment: ExceptionRiskAssessment;
}
export interface ExceptionScope {
    readonly projectId?: string;
    readonly teamId?: string;
    readonly domain?: string;
    readonly environment?: string;
    readonly specific: string;
}
export interface ExceptionRiskAssessment {
    readonly riskLevel: 'low|medium|high|critical;;
    readonly riskFactors: string[];
    readonly mitigations: string[];
    readonly residualRisk: 'low|medium|high|critical;;
    readonly reviewFrequency: 'monthly' | 'quarterly' | 'annually';
}
export interface StandardComplianceMetrics {
    readonly complianceRate: number;
    readonly violationCount: number;
    readonly lastComplianceCheck: Date;
    readonly criticalViolations: ComplianceViolation[];
    readonly trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
    readonly riskLevel: 'low|medium|high|critical;;
    readonly exceptionCount: number;
}
export interface ComplianceViolation {
    readonly id: string;
    readonly standardId: string;
    readonly violationType: configuration | usage | version | security | 'process;;
    readonly severity: 'critical|high|medium|low;;
    readonly description: string;
    readonly projectId: string;
    readonly teamId: string;
    readonly detectedAt: Date;
    readonly source: string;
    readonly remediation: string;
    readonly assignee?: string;
    readonly dueDate?: Date;
    readonly status: 'open|in_progress|resolved|waived;;
}
export interface StandardDependency {
    readonly dependentStandardId: string;
    readonly dependencyType: requires | conflicts_with | enhances | 'replaces;;
    readonly description: string;
    readonly mandatory: boolean;
}
export interface AlternativeStandard {
    readonly standardId: string;
    readonly name: string;
    readonly useCase: string;
    readonly comparison: string;
    readonly migrationEffort: 'low' | 'medium' | 'high';
}
export interface StandardCreationRequest {
    readonly name: string;
    readonly description: string;
    readonly category: TechnologyStandard['category'];
    ': any;
    readonly type: TechnologyStandard['type'];
    ': any;
    readonly mandatory: boolean;
    readonly applicability: ApplicabilityScope;
    readonly implementation: ImplementationGuidance;
    readonly verification: VerificationCriteria;
    readonly owner: string;
    readonly approvers: string[];
    readonly effectiveDate: Date;
    readonly reviewIntervalMonths: number;
    readonly dependencies?: StandardDependency[];
    readonly alternatives?: AlternativeStandard[];
}
export interface StandardComplianceResult {
    readonly complianceId: string;
    readonly standardId: string;
    readonly timestamp: Date;
    readonly scope: ComplianceScope;
    readonly overallCompliance: number;
    readonly violations: ComplianceViolation[];
    readonly recommendations: ComplianceRecommendation[];
    readonly riskAssessment: ComplianceRiskAssessment;
    readonly nextReviewDate: Date;
}
export interface ComplianceScope {
    readonly projects: string[];
    readonly teams: string[];
    readonly environments: string[];
    readonly timeWindow: {
        readonly startDate: Date;
        readonly endDate: Date;
    };
}
export interface ComplianceRecommendation {
    readonly id: string;
    readonly priority: 'critical|high|medium|low;;
    readonly category: 'immediate' | 'planned' | 'strategic';
    readonly description: string;
    readonly implementation: string;
    readonly expectedImpact: string;
    readonly effort: 'low' | 'medium' | 'high';
    readonly timeline: string;
    readonly dependencies: string[];
    readonly owner: string;
}
export interface ComplianceRiskAssessment {
    readonly overallRisk: 'low|medium|high|critical;;
    readonly riskFactors: ComplianceRiskFactor[];
    readonly mitigationStrategies: ComplianceMitigationStrategy[];
    readonly residualRisk: 'low|medium|high|critical;;
}
export interface ComplianceRiskFactor {
    readonly factor: string;
    readonly impact: 'low|medium|high|critical;;
    readonly probability: number;
    readonly description: string;
    readonly category: 'technical|operational|security|compliance;;
}
export interface ComplianceMitigationStrategy {
    readonly strategy: string;
    readonly description: string;
    readonly effectiveness: number;
    readonly cost: 'low' | 'medium' | 'high';
    readonly timeline: string;
    readonly owner: string;
}
/**
 * Technology Standards Service for enterprise technology standards management
 */
export declare class TechnologyStandardsService extends EventBus {
    private readonly logger;
    private readonly standards;
    private knowledgeManager;
    private factSystem;
    private initialized;
    constructor(logger: Logger);
    /**
     * Initialize the service with dependencies
     */
    initialize(): void;
    /**
     * Create new technology standard with comprehensive validation
     */
    createTechnologyStandard(request: StandardCreationRequest): Promise<TechnologyStandard>;
    /**
     * Monitor standard compliance across the enterprise
     */
    monitorStandardCompliance(standardId: string, scope: ComplianceScope): Promise<StandardComplianceResult>;
    /**
     * Get standard by ID
     */
    getStandard(standardId: string): TechnologyStandard | undefined;
    /**
     * Get all standards
     */
    getAllStandards(): TechnologyStandard[];
    /**
     * Get standards by category
     */
    getStandardsByCategory(category: TechnologyStandard['category'], : any): TechnologyStandard[];
    /**
     * Get mandatory standards
     */
    getMandatoryStandards(): TechnologyStandard[];
    /**
     * Update standard status
     */
    updateStandardStatus(standardId: string, _status: TechnologyStandard['status'], : any): Promise<void>;
}
//# sourceMappingURL=technology-standards-service.d.ts.map