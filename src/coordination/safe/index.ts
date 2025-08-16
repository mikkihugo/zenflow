/**
 * @file SAFe Integration Foundation - Phase 3, Day 12 (Task 11.1)
 *
 * Scaled Agile Framework (SAFe) integration foundation providing enterprise-scale
 * agile practices integration with the multi-level orchestration architecture.
 *
 * ARCHITECTURE:
 * - SAFe entity definitions (Themes, Capabilities, Features, Stories)
 * - Workflow mapping interfaces between SAFe and orchestration levels
 * - Configuration and settings management
 * - Integration with existing Portfolio, Program, and Swarm levels
 */

// ============================================================================
// SAFE CORE ENTITIES
// ============================================================================

/**
 * SAFe Portfolio level entities
 */
export interface SAFePortfolio {
  readonly id: string;
  readonly name: string;
  readonly strategicThemes: StrategicTheme[];
  readonly valueStreams: ValueStream[];
  readonly solutions: Solution[];
  readonly budgets: LeanBudget[];
  readonly guardrails: Guardrail[];
  readonly kpis: PortfolioKPI[];
}

/**
 * Strategic Theme - Portfolio level strategic direction
 */
export interface StrategicTheme {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly businessDrivers: string[];
  readonly outcomes: string[];
  readonly timeHorizon: TimeHorizon;
  readonly budget: number;
  readonly owner: string;
  readonly status: ThemeStatus;
}

/**
 * Value Stream - Portfolio level value delivery organization
 */
export interface ValueStream {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'operational' | 'development';
  readonly solutions: string[]; // Solution Ds
  readonly trains: string[]; // ART Ds
  readonly customers: Customer[];
  readonly valueFlowSteps: ValueFlowStep[];
  readonly metrics: ValueStreamMetrics;
}

/**
 * Solution - Large Solution level entity
 */
export interface Solution {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly valueStreamId: string;
  readonly capabilities: Capability[];
  readonly solutionIntent: SolutionIntent;
  readonly architecture: SolutionArchitecture;
  readonly trains: string[]; // ART Ds supporting this solution
}

/**
 * Capability - Large Solution level feature grouping
 */
export interface Capability {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly solutionId: string;
  readonly businessValue: number;
  readonly enablers: Enabler[];
  readonly features: string[]; // Feature Ds
  readonly acceptanceCriteria: string[];
  readonly status: CapabilityStatus;
}

/**
 * SAFe Program level entities (ART - Agile Release Train)
 */
export interface AgileReleaseTrain {
  readonly id: string;
  readonly name: string;
  readonly mission: string;
  readonly valueStreamId: string;
  readonly teams: ARTTeam[];
  readonly programIncrement: ProgramIncrement;
  readonly systemDemo: SystemDemo[];
  readonly inspectAndAdapt: InspectAndAdapt[];
  readonly sharedServices: SharedService[];
}

/**
 * Program Increment - SAFe PI entity
 */
export interface ProgramIncrement {
  readonly id: string;
  readonly number: number;
  readonly artId: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly duration: number; // weeks (8-12)
  readonly planningDate: Date;
  readonly objectives: PIObjective[];
  readonly features: Feature[];
  readonly risks: Risk[];
  readonly dependencies: Dependency[];
  readonly businessValue: number;
  readonly status: PIStatus;
}

/**
 * PI Objective - Program level commitment
 */
export interface PIObjective {
  readonly id: string;
  readonly piId: string;
  readonly description: string;
  readonly businessValue: number;
  readonly stretch: boolean; // Uncommitted objective
  readonly assignedTeam: string;
  readonly features: string[]; // Feature Ds
  readonly confidence: number; // 1-10 scale
  readonly actualValue: number;
  readonly status: ObjectiveStatus;
}

/**
 * Feature - Program level work item
 */
export interface Feature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly piId: string;
  readonly capabilityId?: string;
  readonly businessValue: number;
  readonly acceptanceCriteria: string[];
  readonly stories: Story[];
  readonly enablers: Enabler[];
  readonly status: FeatureStatus;
  readonly owner: string;
  readonly team: string;
}

/**
 * SAFe Team level entities
 */
export interface ARTTeam {
  readonly id: string;
  readonly name: string;
  readonly artId: string;
  readonly type: 'feature' | 'component' | 'shared-service';
  readonly mission: string;
  readonly members: TeamMember[];
  readonly capacity: TeamCapacity;
  readonly velocity: number; // Average story points per iteration
  readonly stories: Story[];
  readonly enablers: Enabler[];
}

/**
 * Story - Team level work item
 */
export interface Story {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly featureId: string;
  readonly teamId: string;
  readonly acceptanceCriteria: string[];
  readonly storyPoints: number;
  readonly priority: number;
  readonly status: StoryStatus;
  readonly iteration: number;
  readonly tasks: Task[];
}

/**
 * Enabler - Technical or architectural work item
 */
export interface Enabler {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type:
    | 'architectural'
    | 'infrastructure'
    | 'compliance'
    | 'exploration';
  readonly level: 'portfolio' | 'solution' | 'program' | 'team';
  readonly parentId: string; // D of parent entity (Feature, Capability, etc.)
  readonly acceptanceCriteria: string[];
  readonly effort: number;
  readonly status: EnablerStatus;
}

// ============================================================================
// SAFE TO WORKFLOW MAPPING NTERFACES
// ============================================================================

/**
 * Mapping between SAFe entities and workflow orchestration levels
 */
export interface SAFeWorkflowMapping {
  // Portfolio Level Mapping
  readonly portfolioMapping: {
    readonly strategicThemes: string[]; // Maps to PortfolioItem Ds
    readonly valueStreams: string[]; // Maps to workflow stream Ds
    readonly solutions: string[]; // Maps to PortfolioItem Ds
  };

  // Program Level Mapping
  readonly programMapping: {
    readonly artTrains: string[]; // Maps to ProgramItem Ds
    readonly programIncrements: string[]; // Maps to program workflow cycles
    readonly features: string[]; // Maps to ProgramItem Ds
  };

  // Team Level Mapping
  readonly teamMapping: {
    readonly teams: string[]; // Maps to SwarmExecutionItem Ds
    readonly stories: string[]; // Maps to individual tasks/features
    readonly enablers: string[]; // Maps to technical work items
  };
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

/**
 * SAFe workflow transformation rules
 */
export interface SAFeTransformationRules {
  // Portfolio to Program transformation
  readonly strategicThemeToProgramRule: TransformationRule<StrategicTheme, any>;
  readonly capabilityToFeatureRule: TransformationRule<Capability, Feature>;

  // Program to Team transformation
  readonly featureToStoryRule: TransformationRule<Feature, Story>;
  readonly enablerToTaskRule: TransformationRule<Enabler, any>;

  // Cross-level dependency rules
  readonly dependencyMappingRules: DependencyMappingRule[];
}

/**
 * Generic transformation rule
 */
export interface TransformationRule<TSource, TTarget> {
  readonly sourceType: string;
  readonly targetType: string;
  readonly transformer: (source: TSource) => Promise<TTarget>;
  readonly validator: (target: TTarget) => Promise<boolean>;
  readonly rollback: (target: TTarget) => Promise<void>;
}

/**
 * Dependency mapping rule
 */
export interface DependencyMappingRule {
  readonly sourceLevel: 'portfolio' | 'solution' | 'program' | 'team';
  readonly targetLevel: 'portfolio' | 'solution' | 'program' | 'team';
  readonly mappingFunction: (sourceDep: unknown) => any;
  readonly conflictResolver: (conflicts: unknown[]) => Promise<any[]>;
}

// ============================================================================
// SAFE CONFIGURATION AND SETTINGS
// ============================================================================

/**
 * SAFe implementation configuration
 */
export interface SAFeImplementationConfig {
  readonly framework: SAFeFrameworkConfig;
  readonly ceremonies: SAFeCeremoniesConfig;
  readonly metrics: SAFeMetricsConfig;
  readonly governance: SAFeGovernanceConfig;
  readonly integration: SAFeSystemIntegration;
}

/**
 * SAFe framework configuration
 */
export interface SAFeFrameworkConfig {
  readonly version: '5.1' | '6.0'; // SAFe version
  readonly configuration: 'essential' | 'large-solution' | 'portfolio' | 'full';
  readonly customizations: FrameworkCustomization[];
  readonly complianceRequirements: ComplianceRequirement[];
}

/**
 * SAFe ceremonies configuration
 */
export interface SAFeCeremoniesConfig {
  readonly piPlanning: {
    readonly enabled: boolean;
    readonly duration: number; // hours
    readonly participants: string[];
    readonly agenda: PlanningAgendaItem[];
    readonly toolsIntegration: string[];
  };

  readonly systemDemo: {
    readonly enabled: boolean;
    readonly frequency: 'iteration' | 'bi-weekly' | 'custom';
    readonly stakeholders: string[];
    readonly demoFormat: 'live' | 'recorded' | 'hybrid';
  };

  readonly inspectAndAdapt: {
    readonly enabled: boolean;
    readonly frequency: 'per-pi' | 'quarterly' | 'custom';
    readonly workshops: WorkshopConfig[];
    readonly improvementBacklog: boolean;
  };
}

/**
 * SAFe metrics configuration
 */
export interface SAFeMetricsConfig {
  readonly enabledMetrics: SAFeMetricType[];
  readonly dashboardConfig: MetricsDashboardConfig;
  readonly reportingFrequency: ReportingFrequency;
  readonly kpiThresholds: KPIThreshold[];
}

/**
 * SAFe governance configuration
 */
export interface SAFeGovernanceConfig {
  readonly leanBudgets: LeanBudgetConfig;
  readonly guardrails: GuardrailConfig[];
  readonly complianceChecks: ComplianceCheckConfig[];
  readonly approvalWorkflows: ApprovalWorkflowConfig[];
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export enum ThemeStatus {
  PROPOSED = 'proposed',
  APPROVED = 'approved',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CapabilityStatus {
  BACKLOG = 'backlog',
  ANALYSIS = 'analysis',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DONE = 'done',
}

export enum PIStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  RETROSPECTIVE = 'retrospective',
}

export enum ObjectiveStatus {
  COMMITTED = 'committed',
  UNCOMMITTED = 'uncommitted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
}

export enum FeatureStatus {
  BACKLOG = 'backlog',
  ANALYSIS = 'analysis',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DONE = 'done',
}

export enum StoryStatus {
  BACKLOG = 'backlog',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum EnablerStatus {
  BACKLOG = 'backlog',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum SAFeMetricType {
  VELOCITY = 'velocity',
  PREDICTABILITY = 'predictability',
  QUALITY = 'quality',
  FLOW = 'flow',
  COMPETENCY = 'competency',
}

// Additional supporting interfaces
export interface TimeHorizon {
  readonly start: Date;
  readonly end: Date;
  readonly duration: number; // months
}

export interface Customer {
  readonly id: string;
  readonly name: string;
  readonly type: 'internal' | 'external';
  readonly needs: string[];
  readonly satisfaction: number; // 0-10
}

export interface ValueFlowStep {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly leadTime: number; // hours
  readonly processTime: number; // hours
  readonly waitTime: number; // hours
}

export interface ValueStreamMetrics {
  readonly flowEfficiency: number;
  readonly leadTime: number;
  readonly throughput: number;
  readonly defectRate: number;
  readonly customerSatisfaction: number;
}

export interface SolutionIntent {
  readonly vision: string;
  readonly businessCase: string;
  readonly architecturalOverview: string;
  readonly constraints: string[];
  readonly assumptions: string[];
}

export interface SolutionArchitecture {
  readonly components: ArchitecturalComponent[];
  readonly interfaces: SystemInterface[];
  readonly qualities: QualityAttribute[];
  readonly decisions: ArchitecturalDecision[];
}

export interface SystemDemo {
  readonly id: string;
  readonly piId: string;
  readonly date: Date;
  readonly features: string[];
  readonly feedback: DemoFeedback[];
  readonly stakeholders: string[];
}

export interface InspectAndAdapt {
  readonly id: string;
  readonly piId: string;
  readonly date: Date;
  readonly improvements: Improvement[];
  readonly problemSolving: ProblemSolvingItems[];
}

export interface SharedService {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly capabilities: string[];
  readonly consumers: string[]; // ART Ds
}

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly skills: string[];
  readonly capacity: number; // hours per iteration
}

export interface TeamCapacity {
  readonly totalCapacity: number;
  readonly committedCapacity: number;
  readonly availableCapacity: number;
  readonly bufferCapacity: number;
}

export interface Task {
  readonly id: string;
  readonly name: string;
  readonly storyId: string;
  readonly hours: number;
  readonly status: 'todo' | 'in_progress' | 'done';
  readonly assignee: string;
}

export interface Risk {
  readonly id: string;
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly probability: 'low' | 'medium' | 'high';
  readonly mitigation: string;
  readonly owner: string;
  readonly status: 'open' | 'mitigated' | 'closed';
}

export interface Dependency {
  readonly id: string;
  readonly fromItem: string;
  readonly toItem: string;
  readonly type: 'blocks' | 'enables' | 'relates';
  readonly status: 'open' | 'resolved';
  readonly description: string;
}

// Configuration supporting types
export interface LeanBudget {
  readonly id: string;
  readonly valueStreamId: string;
  readonly totalBudget: number;
  readonly allocatedBudget: number;
  readonly spent: number;
  readonly forecastedSpend: number;
}

export interface Guardrail {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'spending' | 'governance' | 'architecture' | 'security';
  readonly threshold: unknown;
  readonly escalation: string[];
}

export interface PortfolioKPI {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly target: number;
  readonly current: number;
  readonly trend: 'up' | 'down' | 'stable';
  readonly frequency: 'daily' | 'weekly' | 'monthly';
}

// Additional configuration types would continue...
export interface FrameworkCustomization {
  readonly area: string;
  readonly modification: string;
  readonly rationale: string;
}

export interface ComplianceRequirement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly mandatory: boolean;
  readonly checkpoints: string[];
}

export interface PlanningAgendaItem {
  readonly activity: string;
  readonly duration: number; // minutes
  readonly participants: string[];
  readonly deliverables: string[];
}

export interface WorkshopConfig {
  readonly name: string;
  readonly duration: number; // hours
  readonly facilitator: string;
  readonly objectives: string[];
}

export interface MetricsDashboardConfig {
  readonly widgets: DashboardWidget[];
  readonly refreshInterval: number; // minutes
  readonly access: string[];
}

export interface ReportingFrequency {
  readonly operational: 'daily' | 'weekly';
  readonly tactical: 'weekly' | 'monthly';
  readonly strategic: 'monthly' | 'quarterly';
}

export interface KPIThreshold {
  readonly metricId: string;
  readonly warningThreshold: number;
  readonly criticalThreshold: number;
  readonly actions: string[];
}

export interface LeanBudgetConfig {
  readonly enabled: boolean;
  readonly budgetCycles: 'quarterly' | 'yearly';
  readonly approvalLevels: ApprovalLevel[];
}

export interface GuardrailConfig {
  readonly type: string;
  readonly rules: GuardrailRule[];
  readonly monitoring: boolean;
  readonly enforcement: 'advisory' | 'blocking';
}

export interface ComplianceCheckConfig {
  readonly checkId: string;
  readonly frequency: 'continuous' | 'periodic';
  readonly automatedCheck: boolean;
  readonly reportingRequired: boolean;
}

export interface ApprovalWorkflowConfig {
  readonly workflowId: string;
  readonly triggerConditions: string[];
  readonly approvers: string[];
  readonly timeout: number; // hours
}

// Additional detailed types
export interface ArchitecturalComponent {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly responsibilities: string[];
  readonly interfaces: string[];
}

export interface SystemInterface {
  readonly id: string;
  readonly name: string;
  readonly type: 'api' | 'ui' | 'data' | 'messaging';
  readonly specification: string;
  readonly version: string;
}

export interface QualityAttribute {
  readonly attribute: string;
  readonly requirement: string;
  readonly measurement: string;
  readonly target: number;
}

export interface ArchitecturalDecision {
  readonly id: string;
  readonly title: string;
  readonly context: string;
  readonly decision: string;
  readonly rationale: string;
  readonly consequences: string[];
  readonly status: 'proposed' | 'accepted' | 'superseded';
}

export interface DemoFeedback {
  readonly source: string;
  readonly feedback: string;
  readonly actionItem?: string;
  readonly priority: 'low' | 'medium' | 'high';
}

export interface Improvement {
  readonly id: string;
  readonly description: string;
  readonly category: 'process' | 'technical' | 'organizational';
  readonly effort: 'small' | 'medium' | 'large';
  readonly impact: 'low' | 'medium' | 'high';
  readonly owner: string;
  readonly status: 'proposed' | 'approved' | 'in_progress' | 'done';
}

export interface ProblemSolvingItems {
  readonly problem: string;
  readonly rootCause: string;
  readonly solution: string;
  readonly actions: string[];
  readonly owner: string;
  readonly targetDate: Date;
}

export interface DashboardWidget {
  readonly type: 'chart' | 'metric' | 'table' | 'gauge';
  readonly title: string;
  readonly dataSource: string;
  readonly refreshRate: number; // minutes
}

export interface ApprovalLevel {
  readonly level: number;
  readonly threshold: number;
  readonly approvers: string[];
  readonly timeout: number; // hours
}

export interface GuardrailRule {
  readonly rule: string;
  readonly condition: string;
  readonly action: 'warn' | 'block' | 'escalate';
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Core SAFe entities
  SAFePortfolio,
  StrategicTheme,
  ValueStream,
  Solution,
  Capability,
  AgileReleaseTrain,
  ProgramIncrement,
  PIObjective,
  Feature,
  ARTTeam,
  Story,
  Enabler,

  // Mapping and configuration
  SAFeWorkflowMapping,
  SAFeIntegrationConfig,
  SAFeTransformationRules,
  SAFeImplementationConfig,

  // Enums
  ThemeStatus,
  CapabilityStatus,
  PIStatus,
  ObjectiveStatus,
  FeatureStatus,
  StoryStatus,
  EnablerStatus,
  SAFeMetricType,
};

export type {
  // Core entities
  SAFePortfolio,
  StrategicTheme,
  ValueStream,
  Solution,
  Capability,
  AgileReleaseTrain,
  ProgramIncrement,
  PIObjective,
  Feature,
  ARTTeam,
  Story,
  Enabler,
  // Mapping interfaces
  SAFeWorkflowMapping,
  SAFeIntegrationConfig,
  SAFeTransformationRules,
  TransformationRule,
  DependencyMappingRule,
  // Configuration
  SAFeImplementationConfig,
  SAFeFrameworkConfig,
  SAFeCeremoniesConfig,
  SAFeMetricsConfig,
  SAFeGovernanceConfig,
  // Supporting types
  TimeHorizon,
  Customer,
  ValueFlowStep,
  ValueStreamMetrics,
  SolutionIntent,
  SolutionArchitecture,
  Risk,
  Dependency,
  LeanBudget,
  Guardrail,
  PortfolioKPI,
};
