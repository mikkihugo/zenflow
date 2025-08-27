/**
 * @fileoverview Solution Architecture Management Service
 *
 * Service for solution-level architecture management and governance.
 * Handles architectural runway management, technology standards, and cross-ART architectural alignment.
 *
 * SINGLE RESPONSIBILITY: Solution architecture management and governance
 * FOCUSES ON: Architectural runway, technology governance, cross-ART alignment
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
/**
 * Solution architecture configuration
 */
export interface SolutionArchitectureConfig {
    readonly configId: string;
    readonly solutionId: string;
    readonly architecturalVision: ArchitecturalVision;
    readonly technologyStandards: TechnologyStandard[];
    readonly governanceModel: GovernanceModel;
    readonly runwayManagement: RunwayManagement;
    readonly complianceRequirements: ComplianceRequirement[];
}
/**
 * Architectural vision
 */
export interface ArchitecturalVision {
    readonly visionId: string;
    readonly title: string;
    readonly description: string;
    readonly principles: ArchitecturalPrinciple[];
    readonly qualityAttributes: QualityAttribute[];
    readonly constraints: ArchitecturalConstraint[];
    readonly evolutionRoadmap: EvolutionRoadmap;
}
/**
 * Architectural principle
 */
export interface ArchitecturalPrinciple {
    readonly principleId: string;
    readonly name: string;
    readonly statement: string;
    readonly rationale: string;
    readonly implications: string[];
    readonly category: PrincipleCategory;
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
    INTEGRATION = "integration"
}
/**
 * Quality attribute
 */
export interface QualityAttribute {
    readonly attributeId: string;
    readonly name: string;
    readonly description: string;
    readonly measurableGoals: MeasurableGoal[];
    readonly tradeoffs: QualityTradeoff[];
    readonly priority: AttributePriority;
}
/**
 * Measurable goal
 */
export interface MeasurableGoal {
    readonly goalId: string;
    readonly metric: string;
    readonly target: string;
    readonly measurement: string;
    readonly threshold: QualityThreshold;
}
/**
 * Quality threshold
 */
export interface QualityThreshold {
    readonly excellent: string;
    readonly acceptable: string;
    readonly unacceptable: string;
}
/**
 * Quality tradeoff
 */
export interface QualityTradeoff {
    readonly tradeoffId: string;
    readonly attributes: string[];
    readonly description: string;
    readonly decision: string;
    readonly rationale: string;
}
/**
 * Attribute priority
 */
export declare enum AttributePriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Architectural constraint
 */
export interface ArchitecturalConstraint {
    readonly constraintId: string;
    readonly type: ConstraintType;
    readonly description: string;
    readonly rationale: string;
    readonly impact: ConstraintImpact;
    readonly mitigation?: string;
}
/**
 * Constraint types
 */
export declare enum ConstraintType {
    TECHNICAL = "technical",
    REGULATORY = "regulatory",
    ORGANIZATIONAL = "organizational",
    BUDGET = "budget",
    TIME = "time",
    LEGACY = "legacy"
}
/**
 * Constraint impact
 */
export declare enum ConstraintImpact {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Evolution roadmap
 */
export interface EvolutionRoadmap {
    readonly roadmapId: string;
    readonly timeHorizon: TimeHorizon;
    readonly evolutionPhases: EvolutionPhase[];
    readonly transitionSteps: TransitionStep[];
}
/**
 * Time horizon
 */
export interface TimeHorizon {
    readonly shortTerm: number;
    readonly mediumTerm: number;
    readonly longTerm: number;
}
/**
 * Evolution phase
 */
export interface EvolutionPhase {
    readonly phaseId: string;
    readonly name: string;
    readonly duration: number;
    readonly objectives: string[];
    readonly deliverables: string[];
    readonly dependencies: string[];
    readonly risks: string[];
}
/**
 * Transition step
 */
export interface TransitionStep {
    readonly stepId: string;
    readonly description: string;
    readonly fromState: string;
    readonly toState: string;
    readonly approach: TransitionApproach;
    readonly duration: number;
    readonly risks: string[];
}
/**
 * Transition approaches
 */
export declare enum TransitionApproach {
    BIG_BANG = "big_bang",
    PHASED = "phased",
    PARALLEL = "parallel",
    PILOT = "pilot"
}
/**
 * Technology standard
 */
export interface TechnologyStandard {
    readonly standardId: string;
    readonly category: StandardCategory;
    readonly name: string;
    readonly version: string;
    readonly description: string;
    readonly rationale: string;
    readonly scope: StandardScope;
    readonly compliance: ComplianceLevel;
    readonly lifecycle: StandardLifecycle;
    readonly alternatives: TechnologyAlternative[];
}
/**
 * Standard categories
 */
export declare enum StandardCategory {
    PROGRAMMING_LANGUAGE = "programming_language",
    FRAMEWORK = "framework",
    DATABASE = "database",
    MESSAGING = "messaging",
    SECURITY = "security",
    MONITORING = "monitoring",
    DEPLOYMENT = "deployment",
    INTEGRATION = "integration"
}
/**
 * Standard scope
 */
export declare enum StandardScope {
    MANDATORY = "mandatory",
    RECOMMENDED = "recommended",
    APPROVED = "approved",
    RESTRICTED = "restricted",
    DEPRECATED = "deprecated"
}
/**
 * Compliance levels
 */
export declare enum ComplianceLevel {
    STRICT = "strict",
    FLEXIBLE = "flexible",
    ADVISORY = "advisory"
}
/**
 * Standard lifecycle
 */
export interface StandardLifecycle {
    readonly status: LifecycleStatus;
    readonly introduceDate: Date;
    readonly matureDate?: Date;
    readonly deprecateDate?: Date;
    readonly retireDate?: Date;
    readonly reviewCycle: number;
}
/**
 * Lifecycle status
 */
export declare enum LifecycleStatus {
    EMERGING = "emerging",
    TRIAL = "trial",
    ADOPT = "adopt",
    HOLD = "hold",
    DEPRECATED = "deprecated"
}
/**
 * Technology alternative
 */
export interface TechnologyAlternative {
    readonly alternativeId: string;
    readonly name: string;
    readonly comparison: string;
    readonly useCase: string;
    readonly tradeoffs: string[];
}
/**
 * Governance model
 */
export interface GovernanceModel {
    readonly modelId: string;
    readonly framework: GovernanceFramework;
    readonly decisionRights: DecisionRight[];
    readonly reviewProcesses: ReviewProcess[];
    readonly escalationPaths: EscalationPath[];
    readonly metrics: GovernanceMetric[];
}
/**
 * Governance framework
 */
export declare enum GovernanceFramework {
    CENTRALIZED = "centralized",
    FEDERATED = "federated",
    DECENTRALIZED = "decentralized",
    HYBRID = "hybrid"
}
/**
 * Decision right
 */
export interface DecisionRight {
    readonly rightId: string;
    readonly decisionType: DecisionType;
    readonly authority: string[];
    readonly approvalThreshold: ApprovalThreshold;
    readonly escalation: string[];
}
/**
 * Decision types
 */
export declare enum DecisionType {
    TECHNOLOGY_ADOPTION = "technology_adoption",
    ARCHITECTURAL_CHANGE = "architectural_change",
    STANDARD_EXCEPTION = "standard_exception",
    PATTERN_APPROVAL = "pattern_approval",
    DESIGN_REVIEW = "design_review"
}
/**
 * Approval threshold
 */
export interface ApprovalThreshold {
    readonly type: 'unanimous' | 'majority' | 'single';
    readonly percentage?: number;
    readonly minimumCount?: number;
}
/**
 * Review process
 */
export interface ReviewProcess {
    readonly processId: string;
    readonly name: string;
    readonly trigger: ReviewTrigger;
    readonly steps: ReviewStep[];
    readonly criteria: ReviewCriteria[];
    readonly outcomes: string[];
}
/**
 * Review triggers
 */
export declare enum ReviewTrigger {
    MILESTONE = "milestone",
    TIME_BASED = "time_based",
    CHANGE_DRIVEN = "change_driven",
    EXCEPTION_REQUEST = "exception_request"
}
/**
 * Review step
 */
export interface ReviewStep {
    readonly stepId: string;
    readonly name: string;
    readonly participants: string[];
    readonly duration: number;
    readonly deliverables: string[];
    readonly gates: ReviewGate[];
}
/**
 * Review gate
 */
export interface ReviewGate {
    readonly gateId: string;
    readonly criteria: string[];
    readonly approvers: string[];
    readonly escalation: string[];
}
/**
 * Review criteria
 */
export interface ReviewCriteria {
    readonly criteriaId: string;
    readonly category: CriteriaCategory;
    readonly description: string;
    readonly weight: number;
    readonly threshold: number;
}
/**
 * Criteria categories
 */
export declare enum CriteriaCategory {
    ALIGNMENT = "alignment",
    COMPLIANCE = "compliance",
    QUALITY = "quality",
    FEASIBILITY = "feasibility",
    RISK = "risk",
    PERFORMANCE = "performance"
}
/**
 * Escalation path
 */
export interface EscalationPath {
    readonly pathId: string;
    readonly trigger: string;
    readonly levels: EscalationLevel[];
    readonly timeouts: number[];
}
/**
 * Escalation level
 */
export interface EscalationLevel {
    readonly level: number;
    readonly authority: string[];
    readonly actions: string[];
}
/**
 * Governance metric
 */
export interface GovernanceMetric {
    readonly metricId: string;
    readonly name: string;
    readonly description: string;
    readonly measurement: string;
    readonly target: string;
    readonly frequency: MeasurementFrequency;
}
/**
 * Measurement frequency
 */
export declare enum MeasurementFrequency {
    CONTINUOUS = "continuous",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly"
}
/**
 * Runway management
 */
export interface RunwayManagement {
    readonly runwayId: string;
    readonly strategy: RunwayStrategy;
    readonly components: RunwayComponent[];
    readonly investmentPlan: InvestmentPlan;
    readonly capacity: RunwayCapacity;
}
/**
 * Runway strategy
 */
export interface RunwayStrategy {
    readonly approach: RunwayApproach;
    readonly priorities: RunwayPriority[];
    readonly timeboxing: RunwayTimebox[];
    readonly riskManagement: RunwayRisk[];
}
/**
 * Runway approaches
 */
export declare enum RunwayApproach {
    CONTINUOUS = "continuous",
    BATCH = "batch",
    HYBRID = "hybrid"
}
/**
 * Runway priority
 */
export interface RunwayPriority {
    readonly priorityId: string;
    readonly category: RunwayCategory;
    readonly weight: number;
    readonly rationale: string;
}
/**
 * Runway categories
 */
export declare enum RunwayCategory {
    INFRASTRUCTURE = "infrastructure",
    PLATFORM = "platform",
    INTEGRATION = "integration",
    SECURITY = "security",
    COMPLIANCE = "compliance",
    PERFORMANCE = "performance"
}
/**
 * Runway component
 */
export interface RunwayComponent {
    readonly componentId: string;
    readonly name: string;
    readonly type: ComponentType;
    readonly description: string;
    readonly owner: string;
    readonly status: ComponentStatus;
    readonly dependencies: string[];
    readonly consumers: string[];
    readonly lifecycle: ComponentLifecycle;
}
/**
 * Component types
 */
export declare enum ComponentType {
    PLATFORM = "platform",
    LIBRARY = "library",
    SERVICE = "service",
    TOOL = "tool",
    PATTERN = "pattern",
    STANDARD = "standard"
}
/**
 * Component status
 */
export declare enum ComponentStatus {
    PLANNED = "planned",
    IN_DEVELOPMENT = "in_development",
    AVAILABLE = "available",
    DEPRECATED = "deprecated",
    RETIRED = "retired"
}
/**
 * Component lifecycle
 */
export interface ComponentLifecycle {
    readonly createdDate: Date;
    readonly availableDate?: Date;
    readonly deprecationDate?: Date;
    readonly retirementDate?: Date;
    readonly version: string;
}
/**
 * Solution Architecture Management Service
 */
export declare class SolutionArchitectureManagementService {
    private readonly logger;
    private configurations;
    private runwayComponents;
    constructor(logger: Logger);
    /**
     * Configure solution architecture management
     */
    configureArchitecture(config: SolutionArchitectureConfig): Promise<void>;
    /**
     * Make architectural decision
     */
    makeArchitecturalDecision(_decision: {
        title: string;
        context: string;
        alternatives: Alternative[];
        criteria: DecisionCriteria[];
        stakeholders: string[];
        urgency: DecisionUrgency;
    }): Promise<ArchitecturalDecision>;
}
/**
 * Supporting interfaces and enums
 */
interface Alternative {
    readonly name: string;
    readonly description: string;
    readonly pros: string[];
    readonly cons: string[];
    readonly consequences: string[];
    readonly cost: number;
    readonly risk: string;
}
interface DecisionCriteria {
    readonly name: string;
    readonly description: string;
    readonly weight: number;
    readonly measurement: string;
}
declare enum DecisionUrgency {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
interface ArchitecturalDecision {
    readonly decisionId: string;
    readonly title: string;
    readonly context: string;
    readonly alternatives: Alternative[];
    readonly criteria: DecisionCriteria[];
    readonly selectedAlternative: Alternative;
    readonly rationale: string;
    readonly consequences: string[];
    readonly stakeholders: string[];
    readonly status: DecisionStatus;
    readonly decisionDate: Date;
    readonly reviewDate: Date;
    readonly urgency: DecisionUrgency;
}
declare enum DecisionStatus {
    PROPOSED = "proposed",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUPERSEDED = "superseded"
}
interface InvestmentPlan {
    readonly planId: string;
    readonly budget: number;
    readonly timeline: InvestmentTimeline[];
    readonly priorities: InvestmentPriority[];
}
interface InvestmentTimeline {
    readonly quarter: string;
    readonly allocation: number;
    readonly focus: string[];
}
interface InvestmentPriority {
    readonly category: RunwayCategory;
    readonly percentage: number;
    readonly rationale: string;
}
interface RunwayCapacity {
    readonly totalCapacity: number;
    readonly allocatedCapacity: number;
    readonly availableCapacity: number;
    readonly utilizationRate: number;
}
interface RunwayTimebox {
    readonly timeboxId: string;
    readonly duration: number;
    readonly capacity: number;
    readonly focus: RunwayCategory[];
}
interface RunwayRisk {
    readonly riskId: string;
    readonly description: string;
    readonly probability: 'low' | 'medium' | 'high';
    readonly impact: 'low' | 'medium' | 'high';
    readonly mitigation: string;
}
interface ComplianceRequirement {
    readonly requirementId: string;
    readonly framework: string;
    readonly description: string;
    readonly controls: string[];
    readonly evidence: string[];
}
export {};
//# sourceMappingURL=solution-architecture-management-service.d.ts.map