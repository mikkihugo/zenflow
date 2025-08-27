/**
 * @fileoverview Solution Planning Service
 *
 * Service for solution-level planning and coordination activities.
 * Handles solution backlog management, PI planning coordination, and cross-ART synchronization.
 *
 * SINGLE RESPONSIBILITY: Solution-level planning and coordination
 * FOCUSES ON: Solution backlog, PI planning, cross-train coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
/**
 * Solution planning configuration
 */
export interface SolutionPlanningConfig {
    readonly planningId: string;
    readonly solutionId: string;
    readonly participatingARTs: PlanningART[];
    readonly planningHorizon: PlanningHorizon;
    readonly coordinationStrategy: CoordinationStrategy;
    readonly stakeholders: SolutionStakeholder[];
}
/**
 * ART participating in solution planning
 */
export interface PlanningART {
    readonly artId: string;
    readonly artName: string;
    readonly domain: string;
    readonly planningCapacity: number;
    readonly commitmentLevel: CommitmentLevel;
    readonly dependencies: string[];
    readonly constraints: PlanningConstraint[];
}
/**
 * Commitment levels for ART planning
 */
export declare enum CommitmentLevel {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    CONDITIONAL = "conditional"
}
/**
 * Planning constraint
 */
export interface PlanningConstraint {
    readonly constraintId: string;
    readonly type: ConstraintType;
    readonly description: string;
    readonly impact: ImpactLevel;
    readonly mitigationPlan?: string;
}
/**
 * Constraint types
 */
export declare enum ConstraintType {
    RESOURCE = "resource",
    TECHNOLOGY = "technology",
    REGULATORY = "regulatory",
    BUDGET = "budget",
    TIMELINE = "timeline",
    DEPENDENCY = "dependency"
}
/**
 * Impact levels
 */
export declare enum ImpactLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Planning horizon configuration
 */
export interface PlanningHorizon {
    readonly currentPI: number;
    readonly planningWindow: number;
    readonly lookaheadPeriod: number;
    readonly planningCadence: 'quarterly|continuous;;
}
/**
 * Coordination strategy
 */
export interface CoordinationStrategy {
    readonly approach: 'centralized' | 'federated' | 'hybrid';
    readonly coordinationEvents: CoordinationEvent[];
    readonly communicationProtocols: CommunicationProtocol[];
    readonly decisionMaking: DecisionMakingProcess;
}
/**
 * Coordination event
 */
export interface CoordinationEvent {
    readonly eventId: string;
    readonly eventType: EventType;
    readonly frequency: EventFrequency;
    readonly duration: number;
    readonly participants: EventParticipant[];
    readonly agenda: AgendaItem[];
}
/**
 * Event types
 */
export declare enum EventType {
    PI_PLANNING = "pi_planning",
    SOLUTION_SYNC = "solution_sync",
    ARCHITECTURAL_RUNWAY = "architectural_runway",
    SUPPLIER_SYNC = "supplier_sync",
    SOLUTION_DEMO = "solution_demo"
}
/**
 * Event frequency
 */
export declare enum EventFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    BI_WEEKLY = "bi_weekly",
    PI_BOUNDARY = "pi_boundary",
    ON_DEMAND = "on_demand"
}
/**
 * Event participant
 */
export interface EventParticipant {
    readonly participantId: string;
    readonly role: ParticipantRole;
    readonly artAffiliation?: string;
    readonly required: boolean;
}
/**
 * Participant roles
 */
export declare enum ParticipantRole {
    SOLUTION_TRAIN_ENGINEER = "solution_train_engineer",
    SOLUTION_ARCHITECT = "solution_architect",
    SOLUTION_MANAGER = "solution_manager",
    RTE = "rte",
    PRODUCT_MANAGER = "product_manager",
    SYSTEM_ARCHITECT = "system_architect",
    STAKEHOLDER = "stakeholder"
}
/**
 * Agenda item
 */
export interface AgendaItem {
    readonly itemId: string;
    readonly topic: string;
    readonly duration: number;
    readonly presenter: string;
    readonly outcomes: string[];
}
/**
 * Communication protocol
 */
export interface CommunicationProtocol {
    readonly protocolId: string;
    readonly purpose: string;
    readonly channels: CommunicationChannel[];
    readonly frequency: string;
    readonly stakeholders: string[];
}
/**
 * Communication channel
 */
export interface CommunicationChannel {
    readonly channelType: 'email|slack|dashboard|meeting|wiki;;
    readonly address: string;
    readonly purpose: string;
    readonly urgency: 'high' | 'medium' | 'low';
}
/**
 * Decision making process
 */
export interface DecisionMakingProcess {
    readonly framework: consensus | consultation | delegation | 'autocratic;;
    readonly escalationPath: EscalationLevel[];
    readonly timeboxes: Record<string, number>;
    readonly votingMechanism?: VotingMechanism;
}
/**
 * Escalation level
 */
export interface EscalationLevel {
    readonly level: number;
    readonly authority: string[];
    readonly timeThreshold: number;
    readonly criteria: string[];
}
/**
 * Voting mechanism
 */
export interface VotingMechanism {
    readonly type: 'majority|consensus|weighted|veto;;
    readonly threshold: number;
    readonly anonymity: boolean;
}
/**
 * Solution stakeholder
 */
export interface SolutionStakeholder {
    readonly stakeholderId: string;
    readonly name: string;
    readonly role: StakeholderRole;
    readonly influence: InfluenceLevel;
    readonly interest: InterestLevel;
    readonly communicationPreferences: CommunicationPreference[];
}
/**
 * Stakeholder roles
 */
export declare enum StakeholderRole {
    BUSINESS_OWNER = "business_owner",
    SOLUTION_SPONSOR = "solution_sponsor",
    CUSTOMER = "customer",
    COMPLIANCE_OFFICER = "compliance_officer",
    SECURITY_LEAD = "security_lead",
    OPERATIONS_LEAD = "operations_lead"
}
/**
 * Influence and interest levels
 */
export declare enum InfluenceLevel {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum InterestLevel {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Communication preference
 */
export interface CommunicationPreference {
    readonly channel: CommunicationChannel['channelType'];
    ': any;
    readonly frequency: 'real_time|daily|weekly|on_demand;;
    readonly detail: 'summary' | 'detailed' | 'executive';
}
/**
 * Solution planning result
 */
export interface SolutionPlanningResult {
    readonly planningId: string;
    readonly timestamp: Date;
    readonly planningType: PlanningType;
    readonly participatingARTs: string[];
    readonly planningOutcomes: PlanningOutcome[];
    readonly commitments: SolutionCommitment[];
    readonly risks: PlanningRisk[];
    readonly dependencies: CrossARTDependency[];
    readonly success: boolean;
    readonly nextSteps: NextStep[];
}
/**
 * Planning types
 */
export declare enum PlanningType {
    PI_PLANNING = "pi_planning",
    SOLUTION_PLANNING = "solution_planning",
    ARCHITECTURAL_PLANNING = "architectural_planning",
    CAPACITY_PLANNING = "capacity_planning"
}
/**
 * Planning outcome
 */
export interface PlanningOutcome {
    readonly outcomeId: string;
    readonly category: OutcomeCategory;
    readonly description: string;
    readonly deliverables: string[];
    readonly success: boolean;
    readonly participants: string[];
}
/**
 * Outcome categories
 */
export declare enum OutcomeCategory {
    COMMITMENT = "commitment",
    DEPENDENCY_RESOLUTION = "dependency_resolution",
    RISK_MITIGATION = "risk_mitigation",
    ARCHITECTURAL_DECISION = "architectural_decision",
    RESOURCE_ALLOCATION = "resource_allocation"
}
/**
 * Solution commitment
 */
export interface SolutionCommitment {
    readonly commitmentId: string;
    readonly artId: string;
    readonly objectiveId: string;
    readonly description: string;
    readonly confidence: ConfidenceLevel;
    readonly dependencies: string[];
    readonly risks: string[];
    readonly deliveryDate: Date;
}
/**
 * Confidence levels
 */
export declare enum ConfidenceLevel {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Planning risk
 */
export interface PlanningRisk {
    readonly riskId: string;
    readonly category: RiskCategory;
    readonly description: string;
    readonly probability: RiskProbability;
    readonly impact: RiskImpact;
    readonly mitigation: string;
    readonly owner: string;
    readonly status: RiskStatus;
}
/**
 * Risk categories
 */
export declare enum RiskCategory {
    TECHNICAL = "technical",
    RESOURCE = "resource",
    SCHEDULE = "schedule",
    INTEGRATION = "integration",
    EXTERNAL = "external"
}
/**
 * Risk probability and impact
 */
export declare enum RiskProbability {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum RiskImpact {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Risk status
 */
export declare enum RiskStatus {
    OPEN = "open",
    MITIGATING = "mitigating",
    MITIGATED = "mitigated",
    ACCEPTED = "accepted",
    CLOSED = "closed"
}
/**
 * Cross-ART dependency
 */
export interface CrossARTDependency {
    readonly dependencyId: string;
    readonly fromART: string;
    readonly toART: string;
    readonly description: string;
    readonly type: DependencyType;
    readonly status: DependencyStatus;
    readonly plannedDate: Date;
    readonly actualDate?: Date;
    readonly impact: ImpactLevel;
}
/**
 * Dependency types and status
 */
export declare enum DependencyType {
    FEATURE = "feature",
    DATA = "data",
    SERVICE = "service",
    INFRASTRUCTURE = "infrastructure",
    KNOWLEDGE = "knowledge"
}
export declare enum DependencyStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    DELIVERED = "delivered",
    BLOCKED = "blocked",
    AT_RISK = "at_risk"
}
/**
 * Next step
 */
export interface NextStep {
    readonly stepId: string;
    readonly description: string;
    readonly owner: string;
    readonly dueDate: Date;
    readonly priority: 'high' | 'medium' | 'low';
    readonly dependencies: string[];
}
/**
 * Solution Planning Service for solution-level planning coordination
 */
export declare class SolutionPlanningService {
    private readonly logger;
    private planningConfigs;
    private planningResults;
    private commitments;
    private risks;
    constructor(logger: Logger);
    /**
     * Configure solution planning
     */
    configurePlanning(config: SolutionPlanningConfig): Promise<void>;
    /**
     * Execute solution planning session
     */
    executePlanning(planningId: string, planningType: PlanningType): Promise<SolutionPlanningResult>;
    /**
     * Private helper methods
     */
    private validatePlanningConfig;
    if(: any, config: any, planningId: any): any;
}
//# sourceMappingURL=solution-planning-service.d.ts.map