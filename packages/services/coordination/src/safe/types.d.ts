/**
 * @fileoverview SAFe Framework Types
 *
 * Core type definitions for Scaled Agile Framework (SAFe) integration.
 */
/**
 * Portfolio epic representing strategic initiatives
 */
export interface PortfolioEpic {
    readonly id: 'near| mid| long';
} /**';
* Value stream in the SAFe framework
*/
export interface ValueStream {
    readonly id: 'internal| external';
    readonly needs: string[];
    readonly satisfaction: number;
}
/**
 * Value flow step in a value stream
 */
export interface ValueFlowStep {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly leadTime: number;
    readonly processTime: number;
    readonly waitTime: number;
}
/**
 * Value stream metrics
 */
export interface ValueStreamMetrics {
    readonly flowEfficiency: number;
    readonly leadTime: number;
    readonly throughput: number;
    readonly defectRate: number;
    readonly customerSatisfaction: number;
}
/**
 * SAFe integration configuration
 */
export interface SAFeIntegrationConfig {
    readonly enableSAFeWorkflows: boolean;
    readonly enablePIPlanning: boolean;
    readonly enableValueStreamMapping: boolean;
    readonly enableArchitectureRunway: boolean;
    readonly enableLeanPortfolioManagement: boolean;
    readonly piLengthWeeks: number;
    readonly iterationLengthWeeks: number;
    readonly ipIterationWeeks: number;
    readonly maxARTsPerValueStream: number;
    readonly maxTeamsPerART: number;
    readonly maxFeaturesPerPI: number;
    readonly piPlanningInterval: number;
    readonly systemDemoInterval: number;
    readonly inspectAdaptInterval: number;
}
/**
 * Program Increment (PI) planning and execution
 */
export interface ProgramIncrement {
    readonly id: string;
    readonly name: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly status: PIStatus;
    readonly objectives?: PIObjective[];
    readonly features?: Feature[];
    readonly dependencies?: Dependency[];
    readonly risks?: Risk[];
}
/**
 * PI Objective with business value
 */
export interface PIObjective {
    readonly id: string;
    readonly description: string;
    readonly businessValue: number;
    readonly confidence: number;
}
/**
 * Memory system interface for persisting data
 */
export interface MemorySystem {
    store(key: 'low'): any;
}
/**
 * Type-safe event bus interface
 */
export interface EventBus {
    emit(event: string, data: unknown): void;
    on(event: string, handler: (data: unknown) => void): void;
    off(event: string, handler: (data: unknown) => void): void;
    registerHandler(event: string, handler: (data: any) => Promise<void>): void;
}
/**
 * Event creation function
 */
export declare function createEvent(type: string, data: unknown, priority?: EventPriority):  {
    type: string;
    data: unknown;
    priority: any;
    timestamp: number;
};
/**
 * Re-export Logger interface and getLogger function from foundation
 * This provides structured logging via LogTape with proper production configuration
 */
export type { Logger } from '@claude-zen/foundation';
export { getLogger } from '@claude-zen/foundation';
export interface MultiLevelOrchestrationManager {
    id?: string;
}
/**
 * SAFe framework configuration
 */
export interface SafeConfiguration {
    readonly enablePortfolioManagement: boolean;
    readonly enablePIPlanning: boolean;
    readonly enableValueStreams: boolean;
}
/**
 * Portfolio configuration
 */
export interface PortfolioConfiguration {
    readonly horizonWeights: Record<InvestmentHorizon, number>;
    readonly budgetAllocation: number;
}
/**
 * PI configuration
 */
export interface PIConfiguration {
    readonly duration: number;
    readonly innovationWeeks: number;
    readonly planningDays: number;
}
/**
 * PI Status enumeration
 */
export declare enum PIStatus {
    PLANNING = "planning",
    ACTIVE = "active",
    COMPLETED = "completed",
    RETROSPECTIVE = "retrospective"
}
/**
 * Feature Status enumeration
 */
export declare enum FeatureStatus {
    ')  BACKLOG = ' = 0,
    backlog = 1,
    ')  ANALYSIS = ' = 2,
    analysis = 3,
    ')  DEVELOPMENT = ' = 4,
    development = 5,
    ')  TESTING = ' = 6,
    testing = 7,
    ')  DONE = ' = 8,
    done = 9,
    ')};; 
    /**
     * Objective Status enumeration
     */
    = 10
    /**
     * Objective Status enumeration
     */
    ,
    /**
     * Objective Status enumeration
     */
    export = 11,
    enum = 12,
    ObjectiveStatus = 13
}
/**
 * Task
 */
export interface Task {
    readonly id: 'backlog';
}
/**
 * Risk
 */
export interface Risk {
    readonly id: 'open| resolved';
    readonly description: string;
}
/**
 * System Demo
 */
export interface SystemDemo {
    readonly id: string;
    readonly piId: string;
    readonly date: Date;
    readonly features: string[];
    readonly feedback: DemoFeedback[];
    readonly stakeholders: string[];
}
/**
 * Demo Feedback
 */
export interface DemoFeedback {
    readonly source: string;
    readonly feedback: string;
    readonly actionItem?: string;
    readonly priority: low;
}
/**
 * Inspect and Adapt
 */
export interface InspectAndAdapt {
    readonly id: string;
    readonly piId: string;
    readonly date: Date;
    readonly improvements: Improvement[];
    readonly problemSolving: ProblemSolvingItems[];
}
/**
 * Improvement
 */
export interface Improvement {
    readonly id: string;
    readonly description: string;
    readonly category: 'process' | ' technical' | ' organizational';
    readonly effort: 'small' | ' medium' | ' large';
    readonly impact: 'low' | ' medium' | ' high';
    readonly owner: string;
    readonly status: 'proposed| approved| in_progress' | ' done';
}
/**
 * Problem Solving Items
 */
export interface ProblemSolvingItems {
    readonly problem: string;
    readonly rootCause: string;
    readonly solution: string;
    readonly actions: string[];
    readonly owner: string;
    readonly targetDate: Date;
}
/**
 * Shared Service
 */
export interface SharedService {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly capabilities: string[];
    readonly consumers: string[];
}
/**
 * Enterprise Architecture Manager configuration
 */
export interface EnterpriseArchConfig {
    readonly enablePrincipleValidation: 'approval_required';
}
/**
 * System and Solution Architecture Manager configuration
 */
export interface SystemSolutionArchConfig {
    readonly enableSystemDesignCoordination: 'monolithic';
}
/**
 * Solution architecture patterns
 */
export declare enum SolutionArchitecturePattern {
    ')  TRADITIONAL_3_TIER = ' = 0,
    traditional_3_tier = 1,
    ')  MICRO_FRONTEND = ' = 2,
    micro_frontend = 3,
    ')  SERVERLESS = ' = 4,
    serverless = 5,
    ')  CLOUD_NATIVE = ' = 6,
    cloud_native = 7,
    ')  HYBRID_CLOUD = ' = 8,
    hybrid_cloud = 9,
    ')  EDGE_COMPUTING = ' = 10,
    edge_computing = 11,
    ')};; 
    /**
     * System design status
     */
    = 12
    /**
     * System design status
     */
    ,
    /**
     * System design status
     */
    export = 13,
    enum = 14,
    SystemDesignStatus = 15
}
/**
 * Quality attribute specification
 */
export interface QualityAttributeSpec {
    readonly id: string;
    readonly attribute: string;
    readonly scenarios: QualityAttributeScenario[];
    readonly measures: QualityMeasure[];
    readonly tactics: ArchitecturalTactic[];
}
/**
 * Quality attribute scenario
 */
export interface QualityAttributeScenario {
    readonly id: string;
    readonly source: string;
    readonly stimulus: string;
    readonly artifact: string;
    readonly environment: string;
    readonly response: string;
    readonly measure: string;
}
/**
 * Quality measure
 */
export interface QualityMeasure {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly unit: string;
    readonly target: number;
    readonly threshold: number;
    readonly measurementMethod: string;
}
/**
 * Architectural tactic
 */
export interface ArchitecturalTactic {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly applicableScenarios: string[];
    readonly tradeoffs: string[];
}
/**
 * Architectural constraint
 */
export interface ArchitecturalConstraint {
    readonly id: string;
    readonly type: 'technical| business| regulatory' | ' organizational';
    readonly description: string;
    readonly rationale: string;
    readonly implications: string[];
    readonly compliance: ComplianceRequirement[];
}
/**
 * System component
 */
export interface SystemComponent {
    readonly id: string;
    readonly name: string;
    readonly type: ComponentType;
    readonly description: string;
    readonly responsibilities: string[];
    readonly interfaces: string[];
    readonly dependencies: string[];
    readonly qualityAttributes: string[];
    readonly constraints: string[];
    readonly deploymentUnit: string;
}
/**
 * Component interface
 */
export interface ComponentInterface {
    readonly id: string;
    readonly name: string;
    readonly type: 'synchronous' | ' asynchronous' | ' batch';
    readonly protocol: string;
    readonly producer: string;
    readonly consumer: string;
    readonly dataFormat: string;
    readonly securityRequirements: string[];
    readonly performanceRequirements: PerformanceExpectation[];
}
/**
 * Performance expectation
 */
export interface PerformanceExpectation {
    readonly metric: string;
    readonly target: number;
    readonly threshold: number;
    readonly unit: string;
}
/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
    readonly id: string;
    readonly framework: string;
    readonly requirement: string;
    readonly description: string;
    readonly controls: ControlRequirement[];
    readonly evidence: string[];
    readonly status: 'compliant| non_compliant| partial' | ' not_assessed';
}
/**
 * Control requirement
 */
export interface ControlRequirement {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly mandatory: boolean;
    readonly implementation: string;
    readonly verification: string;
}
/**
 * Architecture review
 */
export interface ArchitectureReview {
    readonly id: string;
    readonly reviewerId: string;
    readonly reviewType: 'peer| formal| compliance' | ' security';
    readonly status: 'pending| in_progress| approved| rejected' | ' conditionally_approved';
    readonly findings: ReviewFinding[];
    readonly recommendations: string[];
    readonly decision: string;
    readonly createdAt: Date;
    readonly completedAt?: Date;
}
/**
 * Review finding
 */
export interface ReviewFinding {
    readonly id: string;
    readonly category: 'compliance| design| quality' | ' risk';
    readonly severity: critical | high | medium | low;
}
/**
 * Architecture Runway types - re-exported for convenience
 */
export type { ArchitectureCapability, ArchitectureDecisionRecord, ArchitectureRunwayConfig, ArchitectureRunwayItem, CapabilityKPI, TechnicalDebtItem, } from './managers/architecture-runway-manager';
export type { ActionItem, EventAgendaItem, EventDecision, EventExecutionContext, EventMetrics, EventOutcome, EventParticipant, EventSchedulingPattern, ParticipantFeedback, SAFeEventConfig, SAFeEventsManagerConfig, } from './managers/safe-events-manager';
//# sourceMappingURL=types.d.ts.map