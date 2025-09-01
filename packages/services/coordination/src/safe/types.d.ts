/**
 * @fileoverview SAFe Framework Types
 *
 * Core type definitions for Scaled Agile Framework (SAFe) integration.
 */

/**
 * Investment horizon for portfolio planning
 */
export declare enum InvestmentHorizon {
  IMMEDIATE = "immediate",
  SHORT_TERM = "short_term",
  MEDIUM_TERM = "medium_term",
  LONG_TERM = "long_term"
}

/**
 * Feature in SAFe representing a service that fulfills a stakeholder need
 */
export interface Feature {
  id: string;
  name: string;
  description?: string;
  acceptanceCriteria: string[];
  businessValue: number;
  status: FeatureStatus;
  priority: number;
  dependencies: Dependency[];
  stories: Story[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Story representing a small piece of work
 */
export interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints?: number;
  status: 'todo' | 'in_progress' | 'done';
}

/**
 * Team member in SAFe
 */
export interface TeamMember {
  id: string;
  name: string;
  role: 'product_owner' | 'scrum_master' | 'developer' | 'tester';
  capacity: number;
}

/**
 * Team capacity for planning
 */
export interface TeamCapacity {
  teamId: string;
  sprintCapacity: number;
  availableHours: number;
  velocity: number;
}

/**
 * Agile Release Train (ART)
 */
export interface AgileReleaseTrain {
  id: string;
  name: string;
  description?: string;
  teams: ARTTeam[];
  programIncrement: ProgramIncrement;
  valueStream: ValueStream;
}

/**
 * Team within an ART
 */
export interface ARTTeam {
  id: string;
  name: string;
  type: 'scrum' | 'kanban';
  members: TeamMember[];
  capacity: TeamCapacity;
}

/**
 * Dependency between features or teams
 */
export interface Dependency {
  id: string;
  fromId: string;
  type: 'hard' | 'soft';
  description: string;
}

/**
 * Portfolio epic representing strategic initiatives
 */
export interface PortfolioEpic {
  id: string;
  name: string;
  description?: string;
  businessCase?: string;
  wsjfPriority?: number;
  state: 'funnel' | 'analyzing' | 'portfolio_backlog' | 'implementing' | 'done';
}

/**
 * Value stream in the SAFe framework
 */
export interface ValueStream {
  id: string;
  name: string;
  description?: string;
  flowSteps: ValueFlowStep[];
  metrics: ValueStreamMetrics;
}
/**
 * Value flow step in a value stream
 */
export interface ValueFlowStep {
  id: string;
  name: string;
  description?: string;
  duration: number;
  valueAdded: boolean;
  queueTime?: number;
  processTime?: number;
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
  readonly flowTime: number;
  readonly touchTime: number;
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
  readonly enableMetricsCollection: boolean;
  readonly enableReporting: boolean;
}
/**
 * Program Increment (PI) planning and execution
 */
export interface ProgramIncrement {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: PIStatus;
  objectives: PIObjective[];
  features: Feature[];
  risks: Risk[];
  teams: ARTTeam[];
  systemDemo: SystemDemo;
  inspectAdapt: InspectAndAdapt;
}
/**
 * PI Objective with business value
 */
export interface PIObjective {
  id: string;
  title: string;
  description: string;
  businessValue: number;
  acceptanceCriteria: string[];
  status: 'committed' | 'stretched' | 'achieved' | 'missed';
  owner: string;
  programIncrementId: string;
}
/**
 * Memory system interface for persisting data
 */
export interface MemorySystem {
  store(data: any): Promise<void>;
  retrieve(key: string): Promise<any>;
  delete(key: string): Promise<void>;
}

/**
 * Multi-level orchestration manager
 */
export interface MultiLevelOrchestrationManager {
  id?: string;
  name?: string;
  level?: 'portfolio' | 'program' | 'team';
  portfolioLevel?: PortfolioOrchestrationManager;
  programLevel?: ProgramOrchestrationManager;
  teamLevel?: TeamOrchestrationManager;
}

/**
 * Portfolio level orchestration
 */
export interface PortfolioOrchestrationManager {
  epics: PortfolioEpic[];
  valueStreams: ValueStream[];
  strategicThemes: string[];
}

/**
 * Program level orchestration
 */
export interface ProgramOrchestrationManager {
  agileReleaseTrains: AgileReleaseTrain[];
  programIncrements: ProgramIncrement[];
  solutionTrains: SolutionTrain[];
}

/**
 * Team level orchestration
 */
export interface TeamOrchestrationManager {
  teams: ARTTeam[];
  iterations: Iteration[];
  ceremonies: Ceremony[];
}

/**
 * Solution train for large solutions
 */
export interface SolutionTrain {
  id: string;
  name: string;
  description?: string;
  agileReleaseTrains: AgileReleaseTrain[];
  solutionArchitect: string;
}

/**
 * Iteration within a PI
 */
export interface Iteration {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
  committedStories: Story[];
}

/**
 * Team ceremonies
 */
export interface Ceremony {
  id: string;
  type: 'planning' | 'review' | 'retrospective' | 'daily_standup';
  date: Date;
  attendees: string[];
  outcomes: string[];
}
/**
 * SAFe framework configuration
 */
export interface SafeConfiguration {
  readonly enablePortfolioManagement: boolean;
  readonly enablePIPlanning: boolean;
  readonly enableValueStreams: boolean;
  readonly enableMetricsTracking: boolean;
  readonly enableReporting: boolean;
}
/**
 * Portfolio configuration
 */
export interface PortfolioConfiguration {
  readonly horizonWeights: Record<InvestmentHorizon, number>;
  readonly budgetAllocation: number;
  readonly strategicThemes: string[];
  readonly riskThresholds: RiskThresholds;
}
/**
 * Risk thresholds for portfolio management
 */
export interface RiskThresholds {
  readonly lowImpact: number;
  readonly mediumImpact: number;
  readonly highImpact: number;
  readonly criticalImpact: number;
}
/**
 * PI configuration
 */
export interface PIConfiguration {
  readonly duration: number;
  readonly innovationWeeks: number;
  readonly planningDays: number;
  readonly ipSprintWeeks: number;
  readonly demoFrequency: number;
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
  backlog = 0,
  analysis = 1,
  development = 2,
  testing = 3,
  done = 4,
}

/**
 * Risk
 */
export interface Risk {
  id: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  mitigationPlan?: string;
  owner?: string;
  status: 'identified' | 'mitigated' | 'resolved';
}
/**
 * System Demo
 */
export interface SystemDemo {
  id: string;
  programIncrementId: string;
  date: Date;
  location?: string;
  attendees: string[];
  features: Feature[];
  feedback: DemoFeedback[];
  outcomes: string[];
  nextSteps: string[];
}
/**
 * Demo Feedback
 */
export interface DemoFeedback {
  readonly source: string;
  readonly feedback: string;
  readonly actionItem?: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly category: 'functional' | 'performance' | 'usability' | 'security';
}
/**
 * Inspect and Adapt
 */
export interface InspectAndAdapt {
  id: string;
  programIncrementId: string;
  date: Date;
  location?: string;
  attendees: string[];
  quantitativeMetrics: QuantitativeMetrics;
  qualitativeFeedback: QualitativeFeedback;
  problemSolvingItems: ProblemSolvingItems[];
  improvements: Improvement[];
  actionItems: ActionItem[];
}
/**
 * Quantitative metrics for I&A
 */
export interface QuantitativeMetrics {
  readonly predictabilityMeasure: number;
  readonly programIncrementVelocity: number;
  readonly featureCompletionRate: number;
  readonly defectTrends: number;
  readonly customerSatisfaction: number;
}

/**
 * Qualitative feedback for I&A
 */
export interface QualitativeFeedback {
  readonly teamMorale: 'low' | 'medium' | 'high';
  readonly collaborationEffectiveness: 'poor' | 'fair' | 'good' | 'excellent';
  readonly impedimentsResolved: number;
  readonly lessonsLearned: string[];
}

/**
 * Action item from I&A
 */
export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}
/**
 * Improvement
 */
export interface Improvement {
  id: string;
  title: string;
  description: string;
  category: 'process' | 'tools' | 'skills' | 'communication';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  owner: string;
  status: 'proposed' | 'approved' | 'implemented' | 'measured';
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
  readonly status: 'identified' | 'analyzing' | 'solving' | 'resolved';
}
/**
 * Shared Service
 */
export interface SharedService {
  id: string;
  name: string;
  description?: string;
  provider: string;
  consumers: string[];
  serviceLevelAgreement?: string;
  costCenter?: string;
  status: 'active' | 'deprecated' | 'planned';
}
/**
 * Enterprise Architecture Manager configuration
 */
export interface EnterpriseArchConfig {
  readonly enablePrincipleValidation: boolean;
  readonly validationLevel: 'strict' | 'moderate' | 'lenient';
  readonly approvalWorkflow: 'automatic' | 'manual' | 'hybrid';
}
/**
 * System and Solution Architecture Manager configuration
 */
export interface SystemSolutionArchConfig {
  readonly enableSystemDesignCoordination: boolean;
  readonly coordinationLevel: 'minimal' | 'moderate' | 'comprehensive';
  readonly architecturePattern: SolutionArchitecturePattern;
}
/**
 * Solution architecture patterns
 */
export declare enum SolutionArchitecturePattern {
  monolithic = 0,
  traditional_3_tier = 1,
  microservices = 2,
  micro_frontend = 3,
  serverless = 4,
  cloud_native = 5,
  hybrid_cloud = 6,
  edge_computing = 7,
}

/**
 * Architecture decision
 */
export interface ArchitectureDecision {
  id: string;
  title: string;
  context: string;
  decision: string;
  status: 'proposed' | 'accepted' | 'deprecated';
  category: 'technical' | 'business' | 'regulatory' | 'organizational';
  description: string;
  rationale: string;
  implications: string[];
  compliance: ComplianceRequirement[];
  alternatives: string[];
  consequences: string[];
}
/**
 * System component
 */
export interface SystemComponent {
  id: string;
  name: string;
  description?: string;
  type: 'application' | 'service' | 'database' | 'infrastructure' | 'integration';
  technology: string;
  owner: string;
  dependencies: string[];
  interfaces: ComponentInterface[];
  performance: PerformanceExpectation[];
  compliance: ComplianceRequirement[];
}
/**
 * Component interface
 */
export interface ComponentInterface {
  id: string;
  name: string;
  description?: string;
  type: 'api' | 'database' | 'message_queue' | 'file_system' | 'network';
  protocol: string;
  contract: string;
  consumers: string[];
  version: string;
  deprecated?: boolean;
}
/**
 * Performance expectation
 */
export interface PerformanceExpectation {
  readonly metric: string;
  readonly target: number;
  readonly threshold: number;
  readonly unit: string;
  readonly measurement: string;
  readonly criticality: 'low' | 'medium' | 'high';
}
/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
  id: string;
  name: string;
  description?: string;
  standard: string;
  category: 'security' | 'privacy' | 'regulatory' | 'industry';
  mandatory: boolean;
  controls: ControlRequirement[];
  evidence: string[];
  status: 'compliant' | 'non_compliant' | 'not_applicable';
}
/**
 * Control requirement
 */
export interface ControlRequirement {
  id: string;
  name: string;
  description?: string;
  type: 'preventive' | 'detective' | 'corrective';
  implementation: string;
  automation: 'manual' | 'semi_automated' | 'automated';
  frequency?: string;
  owner: string;
  status: 'implemented' | 'planned' | 'not_required';
}
/**
 * Architecture review
 */
export interface ArchitectureReview {
  id: string;
  name: string;
  description?: string;
  date: Date;
  reviewers: string[];
  scope: string[];
  findings: ReviewFinding[];
  recommendations: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  followUpActions: ActionItem[];
}
/**
 * Review finding
 */
export interface ReviewFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'architecture' | 'security' | 'performance' | 'maintainability';
  recommendation: string;
  owner: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'accepted_risk';
  dueDate?: Date;
}

/**
 * Architecture Runway types - re-exported for convenience
 */
export type { ArchitectureCapability, ArchitectureDecisionRecord, ArchitectureRunwayConfig, ArchitectureRunwayItem, CapabilityKPI, TechnicalDebtItem, } from './managers/architecture-runway-manager';
export type { ActionItem as EventActionItem, EventAgendaItem, EventDecision, EventExecutionContext, EventMetrics, EventOutcome, EventParticipant, EventSchedulingPattern, ParticipantFeedback, SAFeEventConfig, SAFeEventsManagerConfig, } from './managers/safe-events-manager';
//# sourceMappingURL=types.d.ts.map