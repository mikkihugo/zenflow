export interface ArchitecturePrinciple {
    readonly id: string;
    readonly name: string;
    readonly statement: string;
    readonly rationale: string;
    readonly implications: string[];
    readonly category: string;
    '; : any;
    readonly priority: critical | high | medium;
}
export interface PrincipleComplianceMetrics {
    readonly complianceRate: number;
    readonly violationCount: number;
    readonly lastComplianceCheck: Date;
    readonly criticalViolations: ComplianceViolation[];
    readonly trend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' declining';
    readonly riskLevel: 'low| medium| high' | ' critical';
}
export interface ComplianceViolation {
    readonly id: string;
    readonly principleId: string;
    readonly violationType: 'major' | ' minor' | ' critical';
    readonly description: string;
    readonly impact: string;
    readonly detectedAt: Date;
    readonly source: string;
    readonly recommendation: string;
    readonly assignee?: string;
    readonly dueDate?: Date;
    readonly status: 'open| in_progress| resolved' | ' accepted_risk';
}
export interface ApprovalRecord {
    readonly approver: string;
    readonly approvedAt: Date;
    readonly status: 'approved' | ' rejected' | ' pending';
    readonly comments: string;
    readonly conditions?: string[];
}
export interface PrincipleRelationship {
    readonly relatedPrincipleId: string;
    readonly relationshipType: depends_on | conflicts_with | complements | 'supersedes';
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
    readonly timeWindow:  {
        readonly startDate: Date;
        readonly endDate: Date;
    };
}
export interface ComplianceRule {
    readonly ruleId: string;
    readonly name: string;
    readonly description: string;
    readonly condition: string;
    readonly severity: critical | high | medium;
}
export interface ValidationThresholds {
    readonly minComplianceRate: number;
    readonly maxViolationsPerProject: number;
    readonly criticalViolationThreshold: number;
    readonly alertThresholds:  {
        readonly warning: number;
        readonly critical: number;
    };
}
export interface ReportingConfig {
    readonly frequency: 'daily| weekly| monthly' | ' quarterly';
    readonly recipients: string[];
    readonly format: 'dashboard| email| api' | ' all';
    readonly includeRecommendations: boolean;
    readonly includeTrends: boolean;
}
export interface PrincipleCreationRequest {
    readonly name: string;
    readonly statement: string;
    readonly rationale: string;
    readonly category: string;
    readonly priority: critical | high | medium;
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
    readonly priority: critical | high | medium;
}
export interface RiskAssessment {
    readonly overallRisk: 'low| medium| high' | ' critical';
    readonly riskFactors: RiskFactor[];
    readonly mitigationStrategies: MitigationStrategy[];
    readonly residualRisk: 'low| medium| high' | ' critical';
}
export interface RiskFactor {
    readonly factor: string;
    readonly impact: 'low| medium| high' | ' critical';
    readonly probability: number;
    readonly description: string;
    readonly category: 'technical| organizational| compliance' | ' external';
}
export interface MitigationStrategy {
    readonly strategy: string;
    readonly description: string;
    readonly effectiveness: number;
    readonly cost: 'low' | ' medium' | ' high';
    readonly timeline: string;
    readonly owner: string;
}
/**
 * Architecture Principle Service for enterprise architecture principles management
 */
export declare class ArchitecturePrincipleService extends EventBus {
    private readonly logger;
    private knowledgeManager;
    constructor(logger: logger);
}
//# sourceMappingURL=architecture-principle-service.d.ts.map