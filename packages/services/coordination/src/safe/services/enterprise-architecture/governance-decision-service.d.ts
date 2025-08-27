/**
 * @fileoverview Governance Decision Service - Enterprise Architecture Governance Management
 *
 * Specialized service for managing enterprise architecture governance decisions within SAFe environments.
 * Handles decision workflows, approval processes, impact analysis, and governance compliance tracking.
 *
 * Features:
 * - Architecture governance decision initiation and management
 * - Multi-stakeholder approval workflows with escalation
 * - Impact analysis and risk assessment for architectural decisions
 * - Decision audit trail and compliance tracking
 * - Automated governance policy enforcement
 * - Decision outcome monitoring and feedback loops
 *
 * Integrations:
 * - @claude-zen/workflows: Governance decision workflows and approvals
 * - @claude-zen/agui: Advanced GUI for decision review and approval
 * - @claude-zen/fact-system: Decision impact analysis and reasoning
 * - @claude-zen/knowledge: Governance policy knowledge base
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export interface GovernanceDecision {
    readonly id: string;
    readonly type: DecisionType;
    readonly title: string;
    readonly description: string;
    readonly requesterId: string;
    readonly requesterRole: string;
    readonly decisionMakers: DecisionMaker[];
    readonly artifacts: DecisionArtifact[];
    readonly criteria: DecisionCriteria[];
    readonly risks: RiskFactor[];
    readonly implications: Implication[];
    readonly priority: 'critical|high|medium|low;;
    readonly status: DecisionStatus;
    readonly createdAt: Date;
    readonly requestedDecisionDate: Date;
    readonly actualDecisionDate?: Date;
    readonly approvalDeadline: Date;
    readonly escalationDate?: Date;
    readonly version: string;
    readonly context: DecisionContext;
    readonly workflow: DecisionWorkflow;
    readonly outcome?: DecisionOutcome;
    readonly auditTrail: AuditRecord[];
}
export type DecisionType = architecture_standard | technology_selection | design_pattern | security_policy | integration_approach | data_governance | performance_requirement | compliance_exception | investment_decision | 'strategic_direction;;
export type DecisionStatus = submitted | under_review | pending_approval | approved | rejected | escalated | withdrawn | implemented | 'closed;;
export interface DecisionMaker {
    readonly userId: string;
    readonly name: string;
    readonly role: string;
    readonly department: string;
    readonly weight: number;
    readonly required: boolean;
    readonly delegateId?: string;
    readonly expertise: string[];
    readonly availability: AvailabilityWindow[];
}
export interface AvailabilityWindow {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly timezone: string;
    readonly type: 'available' | 'limited' | 'unavailable';
}
export interface DecisionArtifact {
    readonly id: string;
    readonly name: string;
    readonly type: document | diagram | specification | analysis | proposal | 'evidence;;
    readonly url: string;
    readonly description: string;
    readonly version: string;
    readonly uploadedBy: string;
    readonly uploadedAt: Date;
    readonly size: number;
    readonly checksum: string;
    readonly confidentiality: public | internal | confidential | 'restricted;;
}
export interface DecisionCriteria {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: technical | business | compliance | financial | operational | 'strategic;;
    readonly weight: number;
    readonly mandatory: boolean;
    readonly measurable: boolean;
    readonly evaluation: CriteriaEvaluation;
    readonly threshold?: EvaluationThreshold;
}
export interface CriteriaEvaluation {
    readonly method: 'quantitative|qualitative|binary|scoring;;
    readonly scale: EvaluationScale;
    readonly evidence: string[];
    readonly evaluator: string;
    readonly evaluatedAt?: Date;
    readonly score?: number;
    readonly notes?: string;
}
export interface EvaluationScale {
    readonly type: 'numeric' | 'categorical' | 'boolean';
    readonly range: ScaleRange;
    readonly labels?: string[];
}
export interface ScaleRange {
    readonly min: number;
    readonly max: number;
    readonly step?: number;
    readonly unit?: string;
}
export interface EvaluationThreshold {
    readonly operator: 'gt|lt|gte|lte|eq|neq;;
    readonly value: number;
    readonly action: 'accept|reject|escalate|review;;
}
export interface RiskFactor {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: technical | business | operational | security | compliance | 'financial;;
    readonly probability: number;
    readonly impact: 'low|medium|high|critical;;
    readonly timeframe: string;
    readonly owner: string;
    readonly mitigation: RiskMitigation;
    readonly status: identified | assessed | mitigated | accepted | 'transferred;;
}
export interface RiskMitigation {
    readonly strategy: 'avoid|mitigate|transfer|accept;;
    readonly description: string;
    readonly actions: MitigationAction[];
    readonly cost: 'low' | 'medium' | 'high';
    readonly timeline: string;
    readonly effectiveness: number;
    readonly owner: string;
    readonly dependencies: string[];
}
export interface MitigationAction {
    readonly actionId: string;
    readonly description: string;
    readonly owner: string;
    readonly dueDate: Date;
    readonly status: 'planned|in_progress|completed|blocked;;
    readonly dependencies: string[];
}
export interface Implication {
    readonly id: string;
    readonly type: 'immediate|short_term|medium_term|long_term;;
    readonly category: technical | business | operational | financial | 'organizational;;
    readonly description: string;
    readonly impact: 'positive' | 'negative' | 'neutral';
    readonly magnitude: 'low|medium|high|critical;;
    readonly stakeholders: string[];
    readonly timeframe: string;
    readonly reversibility: reversible | partially_reversible | 'irreversible;;
    readonly dependencies: string[];
}
export interface DecisionContext {
    readonly businessContext: BusinessContext;
    readonly technicalContext: TechnicalContext;
    readonly organizationalContext: OrganizationalContext;
    readonly externalContext: ExternalContext;
}
export interface BusinessContext {
    readonly businessObjectives: string[];
    readonly strategicInitiatives: string[];
    readonly marketConditions: string[];
    readonly competitiveLandscape: string[];
    readonly customerRequirements: string[];
    readonly budgetConstraints: BudgetConstraint[];
}
export interface BudgetConstraint {
    readonly category: string;
    readonly amount: number;
    readonly currency: string;
    readonly period: string;
    readonly flexibility: 'fixed' | 'flexible' | 'negotiable';
    readonly source: string;
}
export interface TechnicalContext {
    readonly currentArchitecture: string[];
    readonly technologyStandards: string[];
    readonly constraints: TechnicalConstraint[];
    readonly dependencies: string[];
    readonly integrationPoints: string[];
    readonly performanceRequirements: PerformanceRequirement[];
}
export interface TechnicalConstraint {
    readonly type: platform | security | performance | integration | data | 'compliance;;
    readonly description: string;
    readonly mandatory: boolean;
    readonly source: string;
    readonly impact: string;
}
export interface PerformanceRequirement {
    readonly metric: string;
    readonly target: number;
    readonly threshold: number;
    readonly unit: string;
    readonly measurement: string;
    readonly priority: 'critical|high|medium|low;;
}
export interface OrganizationalContext {
    readonly stakeholders: OrganizationalStakeholder[];
    readonly teams: string[];
    readonly capabilities: string[];
    readonly changeCapacity: string;
    readonly culturalFactors: string[];
    readonly governancePolicies: string[];
}
export interface OrganizationalStakeholder {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly department: string;
    readonly influence: 'high' | 'medium' | 'low';
    readonly interest: 'high' | 'medium' | 'low';
    readonly sentiment: 'supportive' | 'neutral' | 'opposed';
    readonly requirements: string[];
}
export interface ExternalContext {
    readonly regulatoryRequirements: RegulatoryRequirement[];
    readonly industryStandards: string[];
    readonly vendorConstraints: VendorConstraint[];
    readonly partnerRequirements: string[];
    readonly marketTrends: string[];
}
export interface RegulatoryRequirement {
    readonly regulation: string;
    readonly jurisdiction: string;
    readonly requirement: string;
    readonly mandatory: boolean;
    readonly deadline?: Date;
    readonly compliance: ComplianceStatus;
}
export type ComplianceStatus = compliant | non_compliant | partially_compliant | 'under_review;;
export interface VendorConstraint {
    readonly vendor: string;
    readonly constraint: string;
    readonly type: 'licensing|technical|commercial|support;;
    readonly impact: string;
    readonly workaround?: string;
}
export interface DecisionWorkflow {
    readonly workflowId: string;
    readonly stages: WorkflowStage[];
    readonly currentStage: string;
    readonly escalationRules: EscalationRule[];
    readonly approvalMatrix: ApprovalMatrix;
    readonly timeouts: WorkflowTimeout[];
    readonly notifications: NotificationRule[];
}
export interface WorkflowStage {
    readonly stageId: string;
    readonly name: string;
    readonly type: review | analysis | approval | implementation | 'closure;;
    readonly owner: string;
    readonly participants: string[];
    readonly duration: string;
    readonly prerequisites: string[];
    readonly deliverables: string[];
    readonly status: pending | in_progress | completed | skipped | 'failed;;
    readonly startDate?: Date;
    readonly completedDate?: Date;
}
export interface EscalationRule {
    readonly ruleId: string;
    readonly trigger: EscalationTrigger;
    readonly escalateTo: string[];
    readonly action: 'notify|reassign|expedite|override;;
    readonly message: string;
    readonly autoExecute: boolean;
}
export interface EscalationTrigger {
    readonly type: 'timeout|criteria_not_met|manual|risk_threshold;;
    readonly threshold: any;
    readonly condition: string;
}
export interface ApprovalMatrix {
    readonly levels: ApprovalLevel[];
    readonly votingRules: VotingRule;
    readonly delegationRules: DelegationRule[];
    readonly overrideRules: OverrideRule[];
}
export interface ApprovalLevel {
    readonly level: number;
    readonly name: string;
    readonly approvers: string[];
    readonly requiredApprovals: number;
    readonly parallel: boolean;
    readonly timeout: string;
}
export interface VotingRule {
    readonly method: 'unanimous|majority|weighted|quorum;;
    readonly threshold?: number;
    readonly tieBreaker: string;
    readonly abstentionHandling: 'ignore' | 'count_as_no' | 'escalate';
}
export interface DelegationRule {
    readonly fromRole: string;
    readonly toRole: string;
    readonly conditions: string[];
    readonly duration: string;
    readonly limitations: string[];
}
export interface OverrideRule {
    readonly role: string;
    readonly conditions: string[];
    readonly justificationRequired: boolean;
    readonly auditRequired: boolean;
}
export interface WorkflowTimeout {
    readonly stage: string;
    readonly duration: string;
    readonly warningTime: string;
    readonly action: 'escalate|auto_approve|auto_reject|extend;;
    readonly notifications: string[];
}
export interface NotificationRule {
    readonly event: string;
    readonly recipients: string[];
    readonly method: 'email|slack|teams|dashboard;;
    readonly template: string;
    readonly delay?: string;
}
export interface DecisionOutcome {
    readonly decision: 'approved|rejected|deferred|modified;;
    readonly finalApprovers: string[];
    readonly votes: DecisionVote[];
    readonly conditions: string[];
    readonly rationale: string;
    readonly implementation: ImplementationPlan;
    readonly monitoring: MonitoringPlan;
    readonly communicationPlan: CommunicationPlan;
}
export interface DecisionVote {
    readonly voterId: string;
    readonly vote: 'approve|reject|abstain|delegate;;
    readonly weight: number;
    readonly timestamp: Date;
    readonly rationale: string;
    readonly conditions: string[];
}
export interface ImplementationPlan {
    readonly phases: ImplementationPhase[];
    readonly timeline: string;
    readonly budget: number;
    readonly resources: ResourceRequirement[];
    readonly dependencies: string[];
    readonly risks: string[];
    readonly successCriteria: string[];
}
export interface ImplementationPhase {
    readonly phaseId: string;
    readonly name: string;
    readonly description: string;
    readonly duration: string;
    readonly owner: string;
    readonly deliverables: string[];
    readonly dependencies: string[];
    readonly budget: number;
    readonly resources: string[];
}
export interface ResourceRequirement {
    readonly type: 'human|technical|financial|infrastructure;;
    readonly description: string;
    readonly quantity: number;
    readonly unit: string;
    readonly duration: string;
    readonly cost: number;
    readonly availability: string;
}
export interface MonitoringPlan {
    readonly metrics: MonitoringMetric[];
    readonly reviewFrequency: string;
    readonly reviewers: string[];
    readonly escalationCriteria: string[];
    readonly reportingFormat: string;
    readonly dashboard: string;
}
export interface MonitoringMetric {
    readonly name: string;
    readonly type: 'technical|business|operational|financial;;
    readonly measurement: string;
    readonly target: number;
    readonly threshold: number;
    readonly unit: string;
    readonly frequency: string;
    readonly source: string;
}
export interface CommunicationPlan {
    readonly audiences: CommunicationAudience[];
    readonly channels: CommunicationChannel[];
    readonly timeline: CommunicationTimeline[];
    readonly feedback: FeedbackMechanism[];
}
export interface CommunicationAudience {
    readonly audienceId: string;
    readonly name: string;
    readonly stakeholders: string[];
    readonly informationNeeds: string[];
    readonly preferredChannels: string[];
    readonly frequency: string;
}
export interface CommunicationChannel {
    readonly channelId: string;
    readonly type: 'email|meeting|document|portal|workshop;;
    readonly format: string;
    readonly frequency: string;
    readonly owner: string;
}
export interface CommunicationTimeline {
    readonly milestone: string;
    readonly date: Date;
    readonly message: string;
    readonly audiences: string[];
    readonly channels: string[];
    readonly responsible: string;
}
export interface FeedbackMechanism {
    readonly type: 'survey|interview|workshop|observation;;
    readonly frequency: string;
    readonly participants: string[];
    readonly questions: string[];
    readonly analysis: string;
}
export interface AuditRecord {
    readonly id: string;
    readonly timestamp: Date;
    readonly actor: string;
    readonly action: string;
    readonly target: string;
    readonly previousState?: any;
    readonly newState?: any;
    readonly reason?: string;
    readonly ipAddress?: string;
    readonly sessionId?: string;
}
export interface GovernanceDecisionRequest {
    readonly type: DecisionType;
    readonly title: string;
    readonly description: string;
    readonly requesterId: string;
    readonly requesterRole: string;
    readonly priority: 'critical|high|medium|low;;
    readonly requestedDecisionDate: Date;
    readonly decisionMakers: string[];
    readonly criteria: Omit<DecisionCriteria, 'id|evaluation'>[];
    ': any;
    readonly risks: Omit<RiskFactor, 'id|status'>[];
    ': any;
    readonly implications: Omit<Implication, 'id'>[];
    ': any;
    readonly context: DecisionContext;
    readonly artifacts: Omit<DecisionArtifact, 'id|uploadedAt'>[];
    ': any;
}
/**
 * Governance Decision Service for enterprise architecture governance management
 */
export declare class GovernanceDecisionService extends EventBus {
    private readonly logger;
    private readonly decisions;
    private workflowEngine;
    private factSystem;
    private knowledgeManager;
    private initialized;
    constructor(logger: Logger);
    /**
     * Initialize the service with dependencies
     */
    initialize(): void;
    /**
     * Initiate new governance decision with comprehensive workflow
     */
    initiateGovernanceDecision(request: GovernanceDecisionRequest): Promise<GovernanceDecision>;
    implications: request.implications.map;
}
//# sourceMappingURL=governance-decision-service.d.ts.map