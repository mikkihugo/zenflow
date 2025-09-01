export interface TechnologyStandard {
id: string;

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
readonly type: 'domain| project| team' | ' environment';
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
id: string;

}
export interface BestPractice {
id: string;

}
export interface Resource {
readonly type: 'documentation| tool| template| training' | ' support';
readonly name: string;
readonly url: string;
readonly description: string;
readonly audience: string[];

}
export interface MigrationGuidance {
readonly fromStandards: string[];
readonly migrationPath: MigrationStep[];
readonly timeline: string;
readonly effort: 'low' | ' medium' | ' high';
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
readonly type: 'documentation| forum| chat| email' | ' training';
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
readonly frequency: 'continuous| daily| weekly' | ' monthly';
readonly threshold: VerificationThreshold;
readonly remediation: string;

}
export interface ManualVerification {
readonly checklistId: string;
readonly name: string;
readonly description: string;
readonly frequency: 'per_project| monthly| quarterly' | ' annually';
readonly owner: string;
readonly checklist: ChecklistItem[];

}
export interface ChecklistItem {
id: string;

}
export interface VerificationThreshold {
readonly metric: string;
readonly operator: 'gt| lt| eq| gte' | ' lte';
readonly value: number;
readonly unit: string;

}
export interface VerificationReporting {
readonly frequency: 'daily| weekly| monthly' | ' quarterly';
readonly recipients: string[];
readonly format: 'dashboard| email| api' | ' report';
readonly includeRecommendations: boolean;
readonly escalationRules: EscalationRule[];

}
export interface EscalationRule {
readonly trigger: string;
readonly threshold: number;
readonly escalateTo: string[];
readonly severity: low | medium | high;

}
export interface ExceptionRule {
id: string;

}
export interface ExceptionScope {
readonly projectId?: string;
readonly teamId?: string;
readonly domain?: string;
readonly environment?: string;
readonly specific: string;

}
export interface ExceptionRiskAssessment {
readonly riskLevel: 'low| medium| high' | ' critical';
readonly riskFactors: string[];
readonly mitigations: string[];
readonly residualRisk: 'low| medium| high' | ' critical';
readonly reviewFrequency: 'monthly' | ' quarterly' | ' annually';

}
export interface StandardComplianceMetrics {
readonly complianceRate: number;
readonly violationCount: number;
readonly lastComplianceCheck: Date;
readonly criticalViolations: ComplianceViolation[];
readonly trend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' declining';
readonly riskLevel: 'low| medium| high' | ' critical';
readonly exceptionCount: number;

}
export interface ComplianceViolation {
id: string;

}
export interface StandardDependency {
readonly dependentStandardId: string;
readonly dependencyType: requires | conflicts_with | enhances | 'replaces';
readonly description: string;
readonly mandatory: boolean;

}
export interface AlternativeStandard {
readonly standardId: string;
readonly name: string;
readonly useCase: string;
readonly comparison: string;
readonly migrationEffort: 'low' | ' medium' | ' high';

}
export interface StandardCreationRequest {
readonly name: string;
readonly description: string;
readonly category: TechnologyStandard['category];) readonly type: TechnologyStandard['];

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
'};

}
export interface ComplianceRecommendation {
id: string;

}
export interface ComplianceRiskAssessment {
readonly overallRisk: 'low| medium| high' | ' critical';
readonly riskFactors: ComplianceRiskFactor[];
readonly mitigationStrategies: ComplianceMitigationStrategy[];
readonly residualRisk: 'low| medium| high' | ' critical';

}
export interface ComplianceRiskFactor {
readonly factor: string;
readonly impact: 'low| medium| high' | ' critical';
readonly probability: number;
readonly description: string;
readonly category: 'technical| operational| security' | ' compliance';

}
export interface ComplianceMitigationStrategy {
readonly strategy: string;
readonly description: string;
readonly effectiveness: number;
readonly cost: 'low' | ' medium' | ' high';
readonly timeline: string;
readonly owner: string;

}
/**
* Technology Standards Service for enterprise technology standards management
*/
export declare class TechnologyStandardsService extends EventBus {
private readonly logger;
private knowledgeManager;
constructor(logger: logger);

}
//# sourceMappingURL=technology-standards-service.d.ts.map