/**
 * @file Enterprise Architecture Manager - Phase 3, Day 14 (Task 13.3)
 *
 * Implements enterprise architecture principle validation, technology standard compliance,
 * architecture governance workflow, and architecture health metrics. Provides enterprise-wide
 * alignment and governance for all architectural decisions and implementations.
 *
 * ARCHITECTURE:
 * - Enterprise architecture principle validation and enforcement
 * - Technology standard compliance monitoring and reporting
 * - Architecture governance workflow with AGUI integration
 * - Architecture health metrics and continuous assessment
 * - Integration with System/Solution Architecture and Architecture Runway
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import type { ArchitectureRunwayManager } from './architecture-runway-manager.ts';
import type { SystemSolutionArchitectureManager } from './system-solution-architecture-manager.ts';
import type { ProgramIncrementManager } from './program-increment-manager.ts';
import type { ValueStreamMapper } from './value-stream-mapper.ts';
/**
 * Enterprise Architecture Manager configuration
 */
export interface EnterpriseArchConfig {
    readonly enablePrincipleValidation: boolean;
    readonly enableTechnologyStandardCompliance: boolean;
    readonly enableArchitectureGovernance: boolean;
    readonly enableHealthMetrics: boolean;
    readonly enableAGUIIntegration: boolean;
    readonly principlesReviewInterval: number;
    readonly complianceCheckInterval: number;
    readonly governanceReviewInterval: number;
    readonly healthMetricsInterval: number;
    readonly maxArchitecturePrinciples: number;
    readonly maxTechnologyStandards: number;
    readonly complianceThreshold: number;
    readonly governanceApprovalTimeout: number;
}
/**
 * Enterprise architecture principle
 */
export interface ArchitecturePrinciple {
    readonly id: string;
    readonly name: string;
    readonly statement: string;
    readonly rationale: string;
    readonly implications: string[];
    readonly category: PrincipleCategory;
    readonly priority: PrinciplePriority;
    readonly applicability: PrincipleApplicability;
    readonly measurability: PrincipleMeasurement[];
    readonly exceptions: PrincipleException[];
    readonly relationships: PrincipleRelationship[];
    readonly governance: PrincipleGovernance;
    readonly status: PrincipleStatus;
    readonly owner: string;
    readonly stakeholders: string[];
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly reviewDate: Date;
    readonly version: string;
}
/**
 * Principle categories
 */
export declare enum PrincipleCategory {
    BUSINESS = "business",
    DATA = "data",
    APPLICATION = "application",
    TECHNOLOGY = "technology",
    SECURITY = "security",
    INTEGRATION = "integration",
    GOVERNANCE = "governance"
}
/**
 * Principle priorities
 */
export declare enum PrinciplePriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Principle applicability
 */
export interface PrincipleApplicability {
    readonly scope: 'enterprise' | 'domain' | 'system' | 'component';
    readonly domains: string[];
    readonly systems: string[];
    readonly exceptions: string[];
    readonly conditions: string[];
}
/**
 * Principle measurement
 */
export interface PrincipleMeasurement {
    readonly metric: string;
    readonly description: string;
    readonly target: number;
    readonly threshold: number;
    readonly unit: string;
    readonly frequency: string;
    readonly method: string;
    readonly responsible: string;
}
/**
 * Principle exception
 */
export interface PrincipleException {
    readonly id: string;
    readonly description: string;
    readonly justification: string;
    readonly scope: string;
    readonly duration: string;
    readonly approver: string;
    readonly approvalDate: Date;
    readonly reviewDate: Date;
    readonly status: 'active' | 'expired' | 'revoked';
}
/**
 * Principle relationship
 */
export interface PrincipleRelationship {
    readonly type: 'supports' | 'conflicts' | 'depends_on' | 'enables';
    readonly targetPrincipleId: string;
    readonly description: string;
    readonly strength: 'weak' | 'moderate' | 'strong';
}
/**
 * Principle governance
 */
export interface PrincipleGovernance {
    readonly reviewFrequency: string;
    readonly reviewBoard: string[];
    readonly approvalAuthority: string[];
    readonly escalationPath: string[];
    readonly complianceMonitoring: boolean;
    readonly violationReporting: boolean;
}
/**
 * Principle status
 */
export declare enum PrincipleStatus {
    DRAFT = "draft",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    ACTIVE = "active",
    DEPRECATED = "deprecated",
    SUPERSEDED = "superseded"
}
/**
 * Technology standard
 */
export interface TechnologyStandard {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly category: TechnologyCategory;
    readonly type: StandardType;
    readonly description: string;
    readonly scope: StandardScope;
    readonly requirements: StandardRequirement[];
    readonly compliance: ComplianceLevel;
    readonly adoption: AdoptionStatus;
    readonly lifecycle: StandardLifecycle;
    readonly governance: StandardGovernance;
    readonly metrics: StandardMetric[];
    readonly exceptions: StandardException[];
    readonly dependencies: StandardDependency[];
    readonly owner: string;
    readonly stakeholders: string[];
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly reviewDate: Date;
    readonly endOfLife?: Date;
}
/**
 * Technology categories
 */
export declare enum TechnologyCategory {
    PROGRAMMING_LANGUAGES = "programming_languages",
    FRAMEWORKS = "frameworks",
    DATABASES = "databases",
    MESSAGING = "messaging",
    MONITORING = "monitoring",
    SECURITY = "security",
    INFRASTRUCTURE = "infrastructure",
    TOOLS = "tools"
}
/**
 * Standard types
 */
export declare enum StandardType {
    MANDATORY = "mandatory",
    PREFERRED = "preferred",
    ACCEPTABLE = "acceptable",
    RESTRICTED = "restricted",
    PROHIBITED = "prohibited"
}
/**
 * Standard scope
 */
export interface StandardScope {
    readonly applicability: 'enterprise' | 'division' | 'department' | 'project';
    readonly domains: string[];
    readonly systems: string[];
    readonly environments: string[];
    readonly conditions: string[];
}
/**
 * Standard requirement
 */
export interface StandardRequirement {
    readonly id: string;
    readonly description: string;
    readonly type: 'functional' | 'non_functional' | 'compliance' | 'integration';
    readonly priority: 'must' | 'should' | 'could' | 'wont';
    readonly verification: string;
    readonly testMethod: string;
    readonly acceptance: string;
}
/**
 * Compliance levels
 */
export declare enum ComplianceLevel {
    FULL = "full",
    PARTIAL = "partial",
    PLANNED = "planned",
    NON_COMPLIANT = "non_compliant",
    EXEMPT = "exempt"
}
/**
 * Adoption status
 */
export declare enum AdoptionStatus {
    EMERGING = "emerging",
    PILOT = "pilot",
    MAINSTREAM = "mainstream",
    MATURE = "mature",
    DECLINING = "declining",
    SUNSET = "sunset"
}
/**
 * Standard lifecycle
 */
export interface StandardLifecycle {
    readonly phase: 'emerging' | 'active' | 'mature' | 'declining' | 'deprecated';
    readonly introduced: Date;
    readonly lastMajorUpdate: Date;
    readonly plannedRetirement?: Date;
    readonly migrationPlan?: MigrationPlan;
    readonly successorStandard?: string;
}
/**
 * Migration plan
 */
export interface MigrationPlan {
    readonly strategy: 'big_bang' | 'phased' | 'parallel_run' | 'gradual_replacement';
    readonly timeline: string;
    readonly phases: MigrationPhase[];
    readonly risks: string[];
    readonly contingencies: string[];
    readonly resources: string[];
}
/**
 * Migration phase
 */
export interface MigrationPhase {
    readonly name: string;
    readonly description: string;
    readonly duration: string;
    readonly deliverables: string[];
    readonly prerequisites: string[];
    readonly success_criteria: string[];
}
/**
 * Standard governance
 */
export interface StandardGovernance {
    readonly owner: string;
    readonly reviewBoard: string[];
    readonly approvalAuthority: string[];
    readonly changeProcess: string;
    readonly exceptionProcess: string;
    readonly complianceMonitoring: boolean;
}
/**
 * Standard metric
 */
export interface StandardMetric {
    readonly name: string;
    readonly description: string;
    readonly type: 'adoption' | 'compliance' | 'performance' | 'cost' | 'risk';
    readonly calculation: string;
    readonly target: number;
    readonly current?: number;
    readonly unit: string;
    readonly frequency: string;
    readonly trend: 'up' | 'down' | 'stable';
}
/**
 * Standard exception
 */
export interface StandardException {
    readonly id: string;
    readonly standardId: string;
    readonly description: string;
    readonly justification: string;
    readonly scope: string;
    readonly duration: string;
    readonly alternativeApproach: string;
    readonly risks: string[];
    readonly mitigations: string[];
    readonly approver: string;
    readonly approvalDate: Date;
    readonly reviewDate: Date;
    readonly status: 'active' | 'expired' | 'revoked';
}
/**
 * Standard dependency
 */
export interface StandardDependency {
    readonly type: 'requires' | 'conflicts_with' | 'enables' | 'supersedes';
    readonly targetStandardId: string;
    readonly description: string;
    readonly criticality: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Architecture governance framework
 */
export interface ArchitectureGovernanceFramework {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly scope: GovernanceScope;
    readonly structure: GovernanceStructure;
    readonly processes: GovernanceProcess[];
    readonly policies: GovernancePolicy[];
    readonly standards: string[];
    readonly principles: string[];
    readonly roles: GovernanceRole[];
    readonly decisions: GovernanceDecisionRights;
    readonly metrics: GovernanceMetric[];
    readonly reporting: GovernanceReporting;
    readonly compliance: GovernanceCompliance;
    readonly maturity: GovernanceMaturity;
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly owner: string;
}
/**
 * Governance scope
 */
export interface GovernanceScope {
    readonly enterprise: boolean;
    readonly divisions: string[];
    readonly domains: string[];
    readonly systems: string[];
    readonly lifecycle_phases: string[];
    readonly decision_types: string[];
}
/**
 * Governance structure
 */
export interface GovernanceStructure {
    readonly boards: GovernanceBoard[];
    readonly committees: GovernanceCommittee[];
    readonly councils: GovernanceCouncil[];
    readonly workingGroups: GovernanceWorkingGroup[];
    readonly reportingLines: ReportingLine[];
}
/**
 * Governance board
 */
export interface GovernanceBoard {
    readonly id: string;
    readonly name: string;
    readonly purpose: string;
    readonly authority: string[];
    readonly members: BoardMember[];
    readonly charter: string;
    readonly meetingFrequency: string;
    readonly decisionRights: string[];
}
/**
 * Board member
 */
export interface BoardMember {
    readonly name: string;
    readonly role: string;
    readonly organization: string;
    readonly expertise: string[];
    readonly votingRights: boolean;
    readonly term: string;
}
/**
 * Governance committee
 */
export interface GovernanceCommittee {
    readonly id: string;
    readonly name: string;
    readonly purpose: string;
    readonly reportingTo: string;
    readonly members: string[];
    readonly responsibilities: string[];
    readonly deliverables: string[];
}
/**
 * Governance council
 */
export interface GovernanceCouncil {
    readonly id: string;
    readonly name: string;
    readonly purpose: string;
    readonly scope: string;
    readonly members: string[];
    readonly advisoryRole: boolean;
    readonly decisionMaking: boolean;
}
/**
 * Governance working group
 */
export interface GovernanceWorkingGroup {
    readonly id: string;
    readonly name: string;
    readonly purpose: string;
    readonly duration: string;
    readonly deliverables: string[];
    readonly members: string[];
    readonly leader: string;
}
/**
 * Reporting line
 */
export interface ReportingLine {
    readonly from: string;
    readonly to: string;
    readonly type: 'reports_to' | 'informs' | 'consults' | 'advises';
    readonly frequency: string;
}
/**
 * Governance process
 */
export interface GovernanceProcess {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: 'decision_making' | 'review' | 'approval' | 'monitoring' | 'escalation';
    readonly steps: ProcessStep[];
    readonly inputs: ProcessInput[];
    readonly outputs: ProcessOutput[];
    readonly roles: ProcessRole[];
    readonly timeline: string;
    readonly triggers: ProcessTrigger[];
    readonly gates: ProcessGate[];
}
/**
 * Process step
 */
export interface ProcessStep {
    readonly name: string;
    readonly description: string;
    readonly owner: string;
    readonly duration: string;
    readonly inputs: string[];
    readonly outputs: string[];
    readonly criteria: string[];
    readonly gates: string[];
}
/**
 * Process input
 */
export interface ProcessInput {
    readonly name: string;
    readonly description: string;
    readonly format: string;
    readonly source: string;
    readonly required: boolean;
    readonly quality_criteria: string[];
}
/**
 * Process output
 */
export interface ProcessOutput {
    readonly name: string;
    readonly description: string;
    readonly format: string;
    readonly consumer: string;
    readonly frequency: string;
    readonly quality_criteria: string[];
}
/**
 * Process role
 */
export interface ProcessRole {
    readonly name: string;
    readonly responsibilities: string[];
    readonly authorities: string[];
    readonly skills: string[];
    readonly assignment: string;
}
/**
 * Process trigger
 */
export interface ProcessTrigger {
    readonly event: string;
    readonly condition: string;
    readonly frequency: string;
    readonly automated: boolean;
}
/**
 * Process gate
 */
export interface ProcessGate {
    readonly name: string;
    readonly type: 'decision' | 'approval' | 'review' | 'quality';
    readonly criteria: string[];
    readonly approvers: string[];
    readonly escalation: string[];
    readonly timeout: string;
}
/**
 * Governance policy
 */
export interface GovernancePolicy {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: 'architecture' | 'technology' | 'security' | 'compliance' | 'operations';
    readonly scope: string;
    readonly rules: PolicyRule[];
    readonly enforcement: PolicyEnforcement;
    readonly exceptions: PolicyException[];
    readonly owner: string;
    readonly approver: string;
    readonly effectiveDate: Date;
    readonly reviewDate: Date;
    readonly version: string;
}
/**
 * Policy rule
 */
export interface PolicyRule {
    readonly id: string;
    readonly statement: string;
    readonly type: 'must' | 'must_not' | 'should' | 'should_not' | 'may';
    readonly applicability: string;
    readonly verification: string;
    readonly consequences: string[];
}
/**
 * Policy enforcement
 */
export interface PolicyEnforcement {
    readonly method: 'automated' | 'manual' | 'hybrid';
    readonly monitoring: boolean;
    readonly reporting: boolean;
    readonly alerting: boolean;
    readonly consequences: EnforcementConsequence[];
}
/**
 * Enforcement consequence
 */
export interface EnforcementConsequence {
    readonly violation_type: string;
    readonly severity: 'info' | 'warning' | 'major' | 'critical';
    readonly action: string;
    readonly escalation: string[];
    readonly timeline: string;
}
/**
 * Policy exception
 */
export interface PolicyException {
    readonly id: string;
    readonly policyId: string;
    readonly ruleId: string;
    readonly description: string;
    readonly justification: string;
    readonly alternativeControl: string;
    readonly risk_assessment: string;
    readonly approver: string;
    readonly duration: string;
    readonly status: 'active' | 'expired' | 'revoked';
}
/**
 * Governance role
 */
export interface GovernanceRole {
    readonly name: string;
    readonly description: string;
    readonly responsibilities: string[];
    readonly authorities: string[];
    readonly accountabilities: string[];
    readonly qualifications: string[];
    readonly assignment: 'individual' | 'group' | 'committee';
}
/**
 * Governance decision rights
 */
export interface GovernanceDecisionRights {
    readonly decisions: DecisionRight[];
    readonly escalation: EscalationMatrix;
    readonly delegation: DelegationRule[];
}
/**
 * Decision right
 */
export interface DecisionRight {
    readonly decision_type: string;
    readonly description: string;
    readonly authority: string;
    readonly input_required: string[];
    readonly constraints: string[];
    readonly approval_required: boolean;
    readonly escalation_triggers: string[];
}
/**
 * Escalation matrix
 */
export interface EscalationMatrix {
    readonly levels: EscalationLevel[];
    readonly triggers: EscalationTrigger[];
    readonly timelines: EscalationTimeline[];
}
/**
 * Escalation level
 */
export interface EscalationLevel {
    readonly level: number;
    readonly authority: string;
    readonly decision_scope: string[];
    readonly timeout: string;
    readonly next_level?: number;
}
/**
 * Escalation trigger
 */
export interface EscalationTrigger {
    readonly condition: string;
    readonly threshold: string;
    readonly automatic: boolean;
    readonly target_level: number;
}
/**
 * Escalation timeline
 */
export interface EscalationTimeline {
    readonly decision_type: string;
    readonly level: number;
    readonly sla: string;
    readonly consequences: string[];
}
/**
 * Delegation rule
 */
export interface DelegationRule {
    readonly from_authority: string;
    readonly to_authority: string;
    readonly scope: string[];
    readonly conditions: string[];
    readonly duration: string;
    readonly revocation_conditions: string[];
}
/**
 * Governance metric
 */
export interface GovernanceMetric {
    readonly name: string;
    readonly description: string;
    readonly category: 'effectiveness' | 'efficiency' | 'compliance' | 'maturity' | 'value';
    readonly calculation: string;
    readonly target: number;
    readonly threshold: number;
    readonly current?: number;
    readonly unit: string;
    readonly frequency: string;
    readonly trend: 'improving' | 'stable' | 'declining';
    readonly owner: string;
}
/**
 * Governance reporting
 */
export interface GovernanceReporting {
    readonly reports: GovernanceReport[];
    readonly dashboards: GovernanceDashboard[];
    readonly notifications: GovernanceNotification[];
    readonly audiences: ReportingAudience[];
}
/**
 * Governance report
 */
export interface GovernanceReport {
    readonly name: string;
    readonly description: string;
    readonly type: 'status' | 'metrics' | 'compliance' | 'exception' | 'trend';
    readonly frequency: string;
    readonly audience: string[];
    readonly content: string[];
    readonly format: string;
    readonly distribution: string[];
}
/**
 * Governance dashboard
 */
export interface GovernanceDashboard {
    readonly name: string;
    readonly description: string;
    readonly audience: string[];
    readonly metrics: string[];
    readonly visualizations: string[];
    readonly refresh_frequency: string;
    readonly access_control: string[];
}
/**
 * Governance notification
 */
export interface GovernanceNotification {
    readonly name: string;
    readonly trigger: string;
    readonly audience: string[];
    readonly channels: string[];
    readonly template: string;
    readonly urgency: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Reporting audience
 */
export interface ReportingAudience {
    readonly name: string;
    readonly role: string;
    readonly interests: string[];
    readonly preferred_format: string[];
    readonly frequency_preference: string;
}
/**
 * Governance compliance
 */
export interface GovernanceCompliance {
    readonly standards: string[];
    readonly regulations: string[];
    readonly monitoring: ComplianceMonitoring;
    readonly reporting: ComplianceReporting;
    readonly assessment: ComplianceAssessment;
}
/**
 * Compliance monitoring
 */
export interface ComplianceMonitoring {
    readonly automated: boolean;
    readonly frequency: string;
    readonly scope: string[];
    readonly metrics: string[];
    readonly thresholds: ComplianceThreshold[];
    readonly alerts: ComplianceAlert[];
}
/**
 * Compliance threshold
 */
export interface ComplianceThreshold {
    readonly metric: string;
    readonly target: number;
    readonly warning: number;
    readonly critical: number;
    readonly action: string;
}
/**
 * Compliance alert
 */
export interface ComplianceAlert {
    readonly trigger: string;
    readonly severity: 'info' | 'warning' | 'critical';
    readonly audience: string[];
    readonly channels: string[];
    readonly escalation: string[];
}
/**
 * Compliance reporting
 */
export interface ComplianceReporting {
    readonly reports: string[];
    readonly frequency: string;
    readonly audience: string[];
    readonly external_reporting: boolean;
    readonly certifications: string[];
}
/**
 * Compliance assessment
 */
export interface ComplianceAssessment {
    readonly methodology: string;
    readonly frequency: string;
    readonly assessors: string[];
    readonly scope: string[];
    readonly criteria: string[];
    readonly remediation: string;
}
/**
 * Governance maturity
 */
export interface GovernanceMaturity {
    readonly current_level: MaturityLevel;
    readonly target_level: MaturityLevel;
    readonly assessment_date: Date;
    readonly improvement_plan: MaturityImprovement[];
    readonly timeline: string;
}
/**
 * Maturity levels
 */
export declare enum MaturityLevel {
    INITIAL = "initial",
    MANAGED = "managed",
    DEFINED = "defined",
    QUANTITATIVELY_MANAGED = "quantitatively_managed",
    OPTIMIZING = "optimizing"
}
/**
 * Maturity improvement
 */
export interface MaturityImprovement {
    readonly area: string;
    readonly current_score: number;
    readonly target_score: number;
    readonly initiatives: string[];
    readonly timeline: string;
    readonly success_criteria: string[];
}
/**
 * Architecture health metrics
 */
export interface ArchitectureHealthMetrics {
    readonly id: string;
    readonly assessmentDate: Date;
    readonly overallScore: number;
    readonly categories: HealthCategory[];
    readonly trends: HealthTrend[];
    readonly risks: HealthRisk[];
    readonly recommendations: HealthRecommendation[];
    readonly benchmarks: HealthBenchmark[];
    readonly nextAssessment: Date;
}
/**
 * Health category
 */
export interface HealthCategory {
    readonly name: string;
    readonly score: number;
    readonly weight: number;
    readonly metrics: HealthMetric[];
    readonly status: 'healthy' | 'at_risk' | 'unhealthy' | 'critical';
    readonly trend: 'improving' | 'stable' | 'declining';
}
/**
 * Health metric
 */
export interface HealthMetric {
    readonly name: string;
    readonly value: number;
    readonly target: number;
    readonly unit: string;
    readonly status: 'on_target' | 'warning' | 'critical';
    readonly trend: 'improving' | 'stable' | 'declining';
    readonly last_measured: Date;
}
/**
 * Health trend
 */
export interface HealthTrend {
    readonly metric: string;
    readonly direction: 'up' | 'down' | 'stable';
    readonly rate: number;
    readonly period: string;
    readonly significance: 'low' | 'medium' | 'high';
    readonly forecast: TrendForecast;
}
/**
 * Trend forecast
 */
export interface TrendForecast {
    readonly horizon: string;
    readonly prediction: number;
    readonly confidence: number;
    readonly scenario: 'best_case' | 'expected' | 'worst_case';
}
/**
 * Health risk
 */
export interface HealthRisk {
    readonly id: string;
    readonly category: string;
    readonly description: string;
    readonly probability: 'low' | 'medium' | 'high';
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly risk_score: number;
    readonly mitigation: string;
    readonly owner: string;
    readonly status: 'open' | 'mitigated' | 'accepted' | 'transferred';
}
/**
 * Health recommendation
 */
export interface HealthRecommendation {
    readonly id: string;
    readonly category: string;
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly rationale: string;
    readonly expected_benefit: string;
    readonly effort: 'small' | 'medium' | 'large' | 'very_large';
    readonly timeline: string;
    readonly dependencies: string[];
    readonly success_metrics: string[];
}
/**
 * Health benchmark
 */
export interface HealthBenchmark {
    readonly metric: string;
    readonly industry_average: number;
    readonly best_practice: number;
    readonly peer_average: number;
    readonly our_value: number;
    readonly gap: number;
    readonly percentile: number;
}
/**
 * Enterprise Architecture Manager state
 */
export interface EnterpriseArchState {
    readonly architecturePrinciples: Map<string, ArchitecturePrinciple>;
    readonly technologyStandards: Map<string, TechnologyStandard>;
    readonly governanceFrameworks: Map<string, ArchitectureGovernanceFramework>;
    readonly healthMetrics: Map<string, ArchitectureHealthMetrics>;
    readonly principleViolations: Map<string, PrincipleViolation>;
    readonly standardViolations: Map<string, StandardViolation>;
    readonly governanceDecisions: Map<string, GovernanceDecision>;
    readonly lastPrincipleReview: Date;
    readonly lastComplianceCheck: Date;
    readonly lastGovernanceReview: Date;
    readonly lastHealthAssessment: Date;
}
/**
 * Principle violation
 */
export interface PrincipleViolation {
    readonly id: string;
    readonly principleId: string;
    readonly description: string;
    readonly severity: 'minor' | 'major' | 'critical';
    readonly system: string;
    readonly component: string;
    readonly detected_date: Date;
    readonly impact: string;
    readonly remediation: ViolationRemediation;
    readonly status: 'open' | 'in_progress' | 'resolved' | 'accepted';
    readonly assignee?: string;
    readonly due_date?: Date;
}
/**
 * Standard violation
 */
export interface StandardViolation {
    readonly id: string;
    readonly standardId: string;
    readonly description: string;
    readonly severity: 'minor' | 'major' | 'critical';
    readonly system: string;
    readonly component: string;
    readonly detected_date: Date;
    readonly impact: string;
    readonly remediation: ViolationRemediation;
    readonly status: 'open' | 'in_progress' | 'resolved' | 'accepted';
    readonly assignee?: string;
    readonly due_date?: Date;
}
/**
 * Violation remediation
 */
export interface ViolationRemediation {
    readonly actions: string[];
    readonly timeline: string;
    readonly effort: string;
    readonly cost: number;
    readonly risks: string[];
    readonly dependencies: string[];
    readonly success_criteria: string[];
}
/**
 * Governance decision
 */
export interface GovernanceDecision {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly type: 'principle' | 'standard' | 'exception' | 'policy' | 'strategic';
    readonly status: 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented';
    readonly requester: string;
    readonly decision_maker: string;
    readonly stakeholders: string[];
    readonly rationale: string;
    readonly implications: string[];
    readonly alternatives: string[];
    readonly risks: string[];
    readonly mitigations: string[];
    readonly implementation: DecisionImplementation;
    readonly review_date?: Date;
    readonly decision_date?: Date;
    readonly effective_date?: Date;
}
/**
 * Decision implementation
 */
export interface DecisionImplementation {
    readonly plan: string[];
    readonly timeline: string;
    readonly resources: string[];
    readonly dependencies: string[];
    readonly milestones: ImplementationMilestone[];
    readonly success_metrics: string[];
}
/**
 * Implementation milestone
 */
export interface ImplementationMilestone {
    readonly name: string;
    readonly date: Date;
    readonly deliverables: string[];
    readonly criteria: string[];
    readonly status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
}
/**
 * Enterprise Architecture Manager
 */
export declare class EnterpriseArchitectureManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly runwayManager;
    private readonly systemSolutionManager;
    private readonly piManager;
    private readonly valueStreamMapper;
    private readonly config;
    private state;
    private principleTimer?;
    private complianceTimer?;
    private governanceTimer?;
    private healthTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, runwayManager: ArchitectureRunwayManager, systemSolutionManager: SystemSolutionArchitectureManager, piManager: ProgramIncrementManager, valueStreamMapper: ValueStreamMapper, config?: Partial<EnterpriseArchConfig>);
    /**
     * Initialize the Enterprise Architecture Manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Enterprise Architecture Manager
     */
    shutdown(): Promise<void>;
    /**
     * Add enterprise architecture principle
     */
    addArchitecturePrinciple(principleData: Partial<ArchitecturePrinciple>): Promise<ArchitecturePrinciple>;
    /**
     * Validate enterprise architecture principles
     */
    validateArchitecturePrinciples(): Promise<PrincipleValidationReport>;
    /**
     * Add technology standard
     */
    addTechnologyStandard(standardData: Partial<TechnologyStandard>): Promise<TechnologyStandard>;
    /**
     * Monitor technology standard compliance
     */
    monitorTechnologyStandardCompliance(): Promise<StandardComplianceReport>;
    /**
     * Create architecture governance workflow
     */
    createArchitectureGovernanceWorkflow(decisionType: 'principle' | 'standard' | 'exception' | 'policy' | 'strategic', requestData: any): Promise<GovernanceDecision>;
    /**
     * Execute architecture governance workflow
     */
    executeArchitectureGovernanceWorkflow(decisionId: string): Promise<GovernanceDecision>;
    /**
     * Calculate architecture health metrics
     */
    calculateArchitectureHealthMetrics(): Promise<ArchitectureHealthMetrics>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private initializeDefaultArchitecture;
    private startPrincipleMonitoring;
    private startComplianceMonitoring;
    private startGovernanceMonitoring;
    private startHealthMonitoring;
    private registerEventHandlers;
    private createPrincipleApprovalGate;
    private checkPrincipleCompliance;
    private identifyPrincipleViolations;
    private assessPrincipleEffectiveness;
    private generatePrincipleRecommendations;
    private calculateOverallCompliance;
    private groupComplianceByCategory;
    private createPrincipleViolationAlert;
    private createStandardApprovalGate;
    private checkStandardCompliance;
    private identifyStandardViolations;
    private assessStandardAdoption;
    private calculateStandardComplianceScore;
    private groupStandardComplianceByCategory;
    private groupStandardComplianceByType;
    private generateStandardRecommendations;
    private calculateComplianceTrends;
    private createStandardViolationAlert;
    private getDecisionMaker;
    private createGovernanceReviewGate;
    private executeGovernanceProcess;
    private makeGovernanceDecision;
    private scheduleDecisionImplementation;
    private assessPrincipleHealthCategory;
    private assessStandardHealthCategory;
    private assessGovernanceHealthCategory;
    private assessComplianceHealthCategory;
    private assessTechnicalDebtHealthCategory;
    private assessInnovationHealthCategory;
    private calculateOverallHealthScore;
    private calculateHealthTrends;
    private identifyArchitectureHealthRisks;
    private generateHealthRecommendations;
    private getArchitectureHealthBenchmarks;
    private createArchitectureHealthAlert;
    private createDefaultArchitecturePrinciples;
    private createDefaultTechnologyStandards;
    private createDefaultGovernanceFramework;
    private performGovernanceReview;
    private handlePrincipleViolation;
    private handleStandardViolation;
    private handleGovernanceDecisionRequest;
}
export interface PrincipleValidationReport {
    readonly id: string;
    readonly validationDate: Date;
    readonly principleCount: number;
    readonly overallCompliance: number;
    readonly complianceByCategory: Record<string, number>;
    readonly violations: PrincipleViolation[];
    readonly effectiveness: any;
    readonly recommendations: string[];
    readonly nextValidation: Date;
}
export interface StandardComplianceReport {
    readonly id: string;
    readonly reportDate: Date;
    readonly standardCount: number;
    readonly overallCompliance: number;
    readonly complianceByCategory: Record<string, number>;
    readonly complianceByType: Record<string, number>;
    readonly violations: StandardViolation[];
    readonly adoptionMetrics: any;
    readonly recommendations: string[];
    readonly trends: any[];
    readonly nextReport: Date;
}
export default EnterpriseArchitectureManager;
export type { EnterpriseArchConfig, ArchitecturePrinciple, TechnologyStandard, ArchitectureGovernanceFramework, ArchitectureHealthMetrics, EnterpriseArchState, PrincipleValidationReport, StandardComplianceReport, };
//# sourceMappingURL=enterprise-architecture-manager.d.ts.map