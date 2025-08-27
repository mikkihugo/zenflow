/**
 * @fileoverview Architecture Principle Service - Enterprise Architecture Principles Management
 *
 * Specialized service for managing enterprise architecture principles within SAFe environments.
 * Handles principle creation, validation, compliance checking, and lifecycle management.
 *
 * Features:
 * - Architecture principle creation and management
 * - Principle compliance validation with intelligent reasoning
 * - Stakeholder management and approval workflows
 * - Principle versioning and lifecycle tracking
 * - Knowledge-based principle storage and retrieval
 * - Automated compliance reporting and alerts
 *
 * Integrations:
 * - @claude-zen/knowledge: Semantic principle storage and retrieval
 * - @claude-zen/fact-system: Fact-based compliance reasoning
 * - @claude-zen/workflows: Principle approval and review workflows
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export interface ArchitecturePrinciple {
    readonly id: string;
    readonly name: string;
    readonly statement: string;
    readonly rationale: string;
    readonly implications: string[];
    readonly category: string;
    readonly priority: 'critical|high|medium|low;;
    readonly status: 'active|deprecated|draft|under_review;;
    readonly owner: string;
    readonly stakeholders: string[];
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly reviewDate: Date;
    readonly version: string;
    readonly complianceMetrics?: PrincipleComplianceMetrics;
    readonly approvalHistory?: ApprovalRecord[];
    readonly relationships?: PrincipleRelationship[];
}
export interface PrincipleComplianceMetrics {
    readonly complianceRate: number;
    readonly violationCount: number;
    readonly lastComplianceCheck: Date;
    readonly criticalViolations: ComplianceViolation[];
    readonly trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
    readonly riskLevel: 'low|medium|high|critical;;
}
export interface ComplianceViolation {
    readonly id: string;
    readonly principleId: string;
    readonly violationType: 'major' | 'minor' | 'critical';
    readonly description: string;
    readonly impact: string;
    readonly detectedAt: Date;
    readonly source: string;
    readonly recommendation: string;
    readonly assignee?: string;
    readonly dueDate?: Date;
    readonly status: 'open|in_progress|resolved|accepted_risk;;
}
export interface ApprovalRecord {
    readonly approver: string;
    readonly approvedAt: Date;
    readonly status: 'approved' | 'rejected' | 'pending';
    readonly comments: string;
    readonly conditions?: string[];
}
export interface PrincipleRelationship {
    readonly relatedPrincipleId: string;
    readonly relationshipType: depends_on | conflicts_with | complements | 'supersedes;;
    readonly description: string;
    readonly strength: number;
}
export interface PrincipleValidationConfig {
    readonly principleId: string;
    readonly validationScope: ValidationScope;
    readonly complianceRules: ComplianceRule[];
    readonly thresholds: ValidationThresholds;
    readonly reportingConfig: ReportingConfig;
}
export interface ValidationScope {
    readonly includeProjects: string[];
    readonly excludeProjects: string[];
    readonly includeTeams: string[];
    readonly excludeTeams: string[];
    readonly includeArtifacts: string[];
    readonly timeWindow: {
        readonly startDate: Date;
        readonly endDate: Date;
    };
}
export interface ComplianceRule {
    readonly ruleId: string;
    readonly name: string;
    readonly description: string;
    readonly condition: string;
    readonly severity: 'critical|high|medium|low;;
    readonly automated: boolean;
    readonly remediation: string;
    readonly category: string;
}
export interface ValidationThresholds {
    readonly minComplianceRate: number;
    readonly maxViolationsPerProject: number;
    readonly criticalViolationThreshold: number;
    readonly alertThresholds: {
        readonly warning: number;
        readonly critical: number;
    };
}
export interface ReportingConfig {
    readonly frequency: 'daily|weekly|monthly|quarterly;;
    readonly recipients: string[];
    readonly format: 'dashboard|email|api|all;;
    readonly includeRecommendations: boolean;
    readonly includeTrends: boolean;
}
export interface PrincipleCreationRequest {
    readonly name: string;
    readonly statement: string;
    readonly rationale: string;
    readonly category: string;
    readonly priority: 'critical|high|medium|low;;
    readonly implications: string[];
    readonly owner: string;
    readonly stakeholders: string[];
    readonly reviewIntervalDays: number;
    readonly complianceRules?: ComplianceRule[];
    readonly relationships?: PrincipleRelationship[];
}
export interface PrincipleValidationResult {
    readonly validationId: string;
    readonly principleId: string;
    readonly timestamp: Date;
    readonly overallCompliance: number;
    readonly violations: ComplianceViolation[];
    readonly recommendations: ValidationRecommendation[];
    readonly riskAssessment: RiskAssessment;
    readonly nextReviewDate: Date;
}
export interface ValidationRecommendation {
    readonly id: string;
    readonly priority: 'critical|high|medium|low;;
    readonly category: 'process|technology|governance|training;;
    readonly description: string;
    readonly implementation: string;
    readonly expectedImpact: string;
    readonly effort: 'low' | 'medium' | 'high';
    readonly timeline: string;
    readonly dependencies: string[];
}
export interface RiskAssessment {
    readonly overallRisk: 'low|medium|high|critical;;
    readonly riskFactors: RiskFactor[];
    readonly mitigationStrategies: MitigationStrategy[];
    readonly residualRisk: 'low|medium|high|critical;;
}
export interface RiskFactor {
    readonly factor: string;
    readonly impact: 'low|medium|high|critical;;
    readonly probability: number;
    readonly description: string;
    readonly category: 'technical|organizational|compliance|external;;
}
export interface MitigationStrategy {
    readonly strategy: string;
    readonly description: string;
    readonly effectiveness: number;
    readonly cost: 'low' | 'medium' | 'high';
    readonly timeline: string;
    readonly owner: string;
}
/**
 * Architecture Principle Service for enterprise architecture principles management
 */
export declare class ArchitecturePrincipleService extends EventBus {
    private readonly logger;
    private readonly principles;
    private knowledgeManager;
    private factSystem;
    private initialized;
    constructor(logger: Logger);
    /**
     * Initialize the service with dependencies
     */
    initialize(): void;
    /**
     * Create new architecture principle with comprehensive validation
     */
    createArchitecturePrinciple(request: PrincipleCreationRequest): ArchitecturePrinciple;
    /**
     * Validate principle compliance across projects and teams
     */
    validatePrincipleCompliance(config: PrincipleValidationConfig): Promise<PrincipleValidationResult>;
    /**
     * Get principle by ID
     */
    getPrinciple(principleId: string): ArchitecturePrinciple | undefined;
    /**
     * Get all principles
     */
    getAllPrinciples(): ArchitecturePrinciple[];
    /**
     * Get principles by category
     */
    getPrinciplesByCategory(category: string): ArchitecturePrinciple[];
    /**
     * Update principle status
     */
    updatePrincipleStatus(principleId: string, _status: ArchitecturePrinciple['status'], : any): void;
}
//# sourceMappingURL=architecture-principle-service.d.ts.map