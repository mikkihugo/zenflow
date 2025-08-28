/**
 * @fileoverview SAFe Framework Types
 *
 * Core type definitions for Scaled Agile Framework (SAFe) integration.
 */
// ============================================================================
// PORTFOLIO TYPES
// ============================================================================
/**
 * Portfolio epic representing strategic initiatives
 */
export interface PortfolioEpic {
  readonly id: 'near| mid| long')/**';
 * Value stream in the SAFe framework
 */
export interface ValueStream {
  readonly id: 'internal| external',)  readonly needs: string[];;
  readonly satisfaction: number; // 0-10
}
/**
 * Value flow step in a value stream
 */
export interface ValueFlowStep {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly leadTime: number; // hours
  readonly processTime: number; // hours
  readonly waitTime: number; // hours
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
  // SAFe Timing Configuration
  readonly piLengthWeeks: number; // Default 10 weeks
  readonly iterationLengthWeeks: number; // Default 2 weeks
  readonly ipIterationWeeks: number; // Innovation & Planning iteration - Default 2 weeks
  // SAFe Scaling Configuration
  readonly maxARTsPerValueStream: number;
  readonly maxTeamsPerART: number;
  readonly maxFeaturesPerPI: number;
  // Integration Intervals
  readonly piPlanningInterval: number; // milliseconds
  readonly systemDemoInterval: number; // milliseconds
  readonly inspectAdaptInterval: number; // milliseconds
}
// ============================================================================
// PROGRAM INCREMENT TYPES
// ============================================================================
/**
 * Program Increment (PI) planning and execution
 */
export interface ProgramIncrement {
  readonly id: string;
  readonly name: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly status: PIStatus;
  readonly objectives?:PIObjective[];
  readonly features?:Feature[];
  readonly dependencies?:Dependency[];
  readonly risks?:Risk[];
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
// ============================================================================
// MEMORY SYSTEM INTERFACE
// ============================================================================
/**
 * Memory system interface for persisting data
 */
export interface MemorySystem {
  store(key: 'low')  NORMAL = 'normal')  HIGH = 'high')  CRITICAL = 'critical')};;
/**
 * Type-safe event bus interface
 */
export interface EventBus {
  emit(event: string, data: unknown): void;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string, handler: (data: unknown) => void): void;
  registerHandler(event: string, handler: (data: any) => Promise<void>): void;)};;
/**
 * Event creation function
 */
export function createEvent(
  type: string,
  data: unknown,
  priority?:EventPriority
) {
  return {
    type,
    data,
    priority: priority|| EventPriority.NORMAL,
    timestamp: Date.now(),
};
}
/**
 * Re-export Logger interface and getLogger function from foundation
 * This provides structured logging via LogTape with proper production configuration
 */
export type { Logger} from '@claude-zen/foundation')export { getLogger} from '@claude-zen/foundation')/**';
 * Multi-level orchestration manager interface (stub)
 */
export interface MultiLevelOrchestrationManager {
  // Placeholder interface;
  id?:string;
}
// ============================================================================
// CONFIGURATION TYPES
// ============================================================================
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
  readonly duration: number; // weeks
  readonly innovationWeeks: number;
  readonly planningDays: number;
}
// ============================================================================
// PROGRAM INCREMENT MANAGER TYPES
// ============================================================================
/**
 * PI Status enumeration
 */
export enum PIStatus {
  PLANNING = 'planning')  ACTIVE = 'active')  COMPLETED = 'completed')  RETROSPECTIVE = 'retrospective')};;
/**
 * Feature Status enumeration
 */
export enum FeatureStatus {
    ')  BACKLOG = 'backlog')  ANALYSIS = 'analysis')  DEVELOPMENT = 'development')  TESTING = 'testing')  DONE = 'done')};;
/**
 * Objective Status enumeration
 */
export enum ObjectiveStatus {
    ')  COMMITTED = 'committed')  UNCOMMITTED = 'uncommitted')  IN_PROGRESS = 'in_progress')  COMPLETED = 'completed')  MISSED = 'missed')};;
/**
 * Agile Release Train
 */
export interface AgileReleaseTrain {
  readonly id: 'backlog')  IN_PROGRESS = 'in_progress')  REVIEW = 'review')  DONE = 'done')};;
/**
 * Task
 */
export interface Task {
  readonly id: 'backlog')  IN_PROGRESS = 'in_progress')  DONE = 'done')};;
/**
 * Risk
 */
export interface Risk {
  readonly id: 'open| resolved',)  readonly description: string;;
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
  readonly actionItem?:string;
  readonly priority: low' | ' medium'|' high')};;
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
  readonly category : 'process' | ' technical'|' organizational')  readonly effort : 'small' | ' medium'|' large')  readonly impact : 'low' | ' medium'|' high')  readonly owner: string;;
  readonly status : 'proposed| approved| in_progress' | ' done')};;
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
// ============================================================================
// ENTERPRISE ARCHITECTURE TYPES
// ============================================================================
/**
 * Enterprise Architecture Manager configuration
 */
export interface EnterpriseArchConfig {
  readonly enablePrincipleValidation: 'approval_required')  REVIEW_REQUIRED = 'review_required')  SIGN_OFF_REQUIRED = 'sign_off_required')};;
// ============================================================================
// SOLUTION ARCHITECTURE TYPES
// ============================================================================
/**
 * System and Solution Architecture Manager configuration
 */
export interface SystemSolutionArchConfig {
  readonly enableSystemDesignCoordination: 'monolithic')  MICROSERVICES = 'microservices')  SERVICE_ORIENTED = 'service_oriented')  EVENT_DRIVEN = 'event_driven')  LAYERED = 'layered')  HEXAGONAL = 'hexagonal')  CLEAN_ARCHITECTURE = 'clean_architecture')};;
/**
 * Solution architecture patterns
 */
export enum SolutionArchitecturePattern {
    ')  TRADITIONAL_3_TIER = 'traditional_3_tier')  MICRO_FRONTEND = 'micro_frontend')  SERVERLESS = 'serverless')  CLOUD_NATIVE = 'cloud_native')  HYBRID_CLOUD = 'hybrid_cloud')  EDGE_COMPUTING = 'edge_computing')};;
/**
 * System design status
 */
export enum SystemDesignStatus {
    ')  DRAFT = 'draft')  IN_REVIEW = 'in_review')  APPROVED = 'approved')  REJECTED = 'rejected')  DEPRECATED = 'deprecated')  IMPLEMENTATION_READY = 'implementation_ready')};;
/**
 * Component type
 */
export enum ComponentType {
    ')  SERVICE = 'service')  DATABASE = 'database')  GATEWAY = 'gateway')  QUEUE = 'queue')  CACHE = 'cache')  EXTERNAL_SYSTEM = 'external_system')  UI_COMPONENT = 'ui_component')};;
/**
 * System design interface
 */
export interface SystemDesign {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly type: SystemArchitectureType;
  readonly pattern: SolutionArchitecturePattern;
  readonly status: SystemDesignStatus;
  readonly businessContext: BusinessContext;
  readonly stakeholders: Stakeholder[];
  readonly architecturalDrivers: ArchitecturalDriver[];
  readonly components: SystemComponent[];
  readonly interfaces: ComponentInterface[];
  readonly constraints: ArchitecturalConstraint[];
  readonly qualityAttributes: QualityAttributeSpec[];
  readonly complianceRequirements: ComplianceRequirement[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly reviewHistory: ArchitectureReview[];)};;
/**
 * Business context for system design
 */
export interface BusinessContext {
  readonly domain: string;
  readonly businessGoals: string[];
  readonly constraints: string[];
  readonly assumptions: string[];
  readonly risks: string[];
  readonly successCriteria: string[];
}
/**
 * Stakeholder information
 */
export interface Stakeholder {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly concerns: string[];
  readonly influence : 'high' | ' medium'|' low')  readonly involvement : 'active' | ' consulted'|' informed')};;
/**
 * Architectural driver
 */
export interface ArchitecturalDriver {
  readonly id: string;
  readonly type : 'functional' | ' quality'|' constraint')  readonly description: string;;
  readonly rationale: string;
  readonly priority: critical| high| medium' | ' low')  readonly source: string;;
  readonly impactedComponents: string[];
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
  readonly type : 'technical| business| regulatory' | ' organizational')  readonly description: string;;
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
  readonly type : 'synchronous' | ' asynchronous'|' batch')  readonly protocol: string;;
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
  readonly status : 'compliant| non_compliant| partial' | ' not_assessed')};;
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
  readonly reviewType : 'peer| formal| compliance' | ' security')  readonly status: |'pending| in_progress| approved| rejected' | ' conditionally_approved')  readonly findings: ReviewFinding[];;
  readonly recommendations: string[];
  readonly decision: string;
  readonly createdAt: Date;
  readonly completedAt?:Date;
}
/**
 * Review finding
 */
export interface ReviewFinding {
  readonly id: string;
  readonly category : 'compliance| design| quality' | ' risk')  readonly severity: critical| high| medium| low'|' info')  readonly description: string;;
  readonly recommendation: string;
  readonly impactedComponents: string[];
  readonly mustFix: boolean;
}
// ============================================================================
// SAFE EVENTS TYPES (Re-export from managers)
// ============================================================================
/**
 * Architecture Runway types - re-exported for convenience
 */
export type {
  ArchitectureCapability,
  ArchitectureDecisionRecord,
  ArchitectureRunwayConfig,
  ArchitectureRunwayItem,
  CapabilityKPI,
  TechnicalDebtItem,
} from './managers/architecture-runway-manager')/**';
 * SAFe Events and Architecture Runway types - re-exported for convenience
 * Full type definitions are in respective manager files
 */
export type {
  ActionItem,
  EventAgendaItem,
  EventDecision,
  EventExecutionContext,
  EventMetrics,
  EventOutcome,
  EventParticipant,
  EventSchedulingPattern,
  ParticipantFeedback,
  SAFeEventConfig,
  SAFeEventsManagerConfig,
} from './managers/safe-events-manager')';