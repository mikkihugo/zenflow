/**
 * @fileoverview SAFe Framework Types
 *
 * Core type definitions for Scaled Agile Framework (SAFe) integration.
 */
/**
 * Portfolio epic representing strategic initiatives
 */
export interface PortfolioEpic {
  id: string;
} /**';
* Value stream in the SAFe framework
*/
export interface ValueStream {
  id: string;
}
/**
 * Value flow step in a value stream
 */
export interface ValueFlowStep {
  id: string;
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
  id: string;
}
/**
 * PI Objective with business value
 */
export interface PIObjective {
  id: string;
}
/**
 * Memory system interface for persisting data
 */
export interface MemorySystem {
    store(): void { getLogger } from '@claude-zen/foundation';
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
    ') = 0,
    backlog = 1,
    ') = 2,
    analysis = 3,
    ') = 4,
    development = 5,
    ') = 6,
    testing = 7,
    ') = 8,
    done = 9,
    ')backlog';
}
/**
 * Risk
 */
export interface Risk {
  id: string;
}
/**
 * System Demo
 */
export interface SystemDemo {
  id: string;
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
  id: string;
}
/**
 * Improvement
 */
export interface Improvement {
  id: string;
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
  id: string;
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
    ') = 0,
    traditional_3_tier = 1,
    ') = 2,
    micro_frontend = 3,
    ') = 4,
    serverless = 5,
    ') = 6,
    cloud_native = 7,
    ') = 8,
    hybrid_cloud = 9,
    ') = 10,
    edge_computing = 11,
    ')technical| business| regulatory' | ' organizational';
    readonly description: string;
    readonly rationale: string;
    readonly implications: string[];
    readonly compliance: ComplianceRequirement[];
}
/**
 * System component
 */
export interface SystemComponent {
  id: string;
}
/**
 * Component interface
 */
export interface ComponentInterface {
  id: string;
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
  id: string;
}
/**
 * Control requirement
 */
export interface ControlRequirement {
  id: string;
}
/**
 * Architecture review
 */
export interface ArchitectureReview {
  id: string;
}
/**
 * Review finding
 */
export interface ReviewFinding {
  id: string;
}
/**
 * Architecture Runway types - re-exported for convenience
 */
export type { ArchitectureCapability, ArchitectureDecisionRecord, ArchitectureRunwayConfig, ArchitectureRunwayItem, CapabilityKPI, TechnicalDebtItem, } from './managers/architecture-runway-manager';
export type { ActionItem, EventAgendaItem, EventDecision, EventExecutionContext, EventMetrics, EventOutcome, EventParticipant, EventSchedulingPattern, ParticipantFeedback, SAFeEventConfig, SAFeEventsManagerConfig, } from './managers/safe-events-manager';
//# sourceMappingURL=types.d.ts.map