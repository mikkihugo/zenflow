/**
 * @fileoverview Multi-Level Orchestration Types
 *
 * Defines the type system for the multi-level parallel flow architecture:
 * - Portfolio Level (Strategic - Human Controlled)
 * - Program Level (AI-Human Collaboration)
 * - Swarm Execution Level (AI Autonomous with SPARC)
 */

// ============================================================================
// ORCHESTRATION LEVELS - Three-tier architecture
// ============================================================================

/**
 * Orchestration levels in the multi-level architecture
 */
export enum OrchestrationLevel {
  PORTFOLIO = 'portfolio', // Strategic level - human controlled'
  PROGRAM = 'program', // AI-Human collaboration level'
  SWARM_EXECUTION = 'execution', // AI autonomous level'
}

/**
 * Work In Progress (WIP) limits configuration
 */
export interface WIPLimits {
  readonly portfolioItems: number; // Max concurrent PRDs
  readonly programItems: number; // Max concurrent Epics per program
  readonly executionItems: number; // Max concurrent Features per swarm
  readonly totalSystemItems: number; // Overall system limit
}

/**
 * Flow control metrics
 */
export interface FlowMetrics {
  readonly throughput: number; // Items completed per time period
  readonly cycleTime: number; // Average time from start to completion
  readonly leadTime: number; // Time from request to delivery
  readonly wipUtilization: number; // Current WIP vs limits
  readonly bottlenecks: BottleneckInfo[];
  readonly flowEfficiency: number; // Value-add time vs total time
}

/**
 * Bottleneck identification
 */
export interface BottleneckInfo {
  readonly level: OrchestrationLevel;
  readonly location: string;
  readonly severity: 'low|medium|high|critical;
  readonly impact: number; // Impact on overall flow
  readonly suggestedActions: string[];
}

// ============================================================================
// WORKFLOW STREAM ARCHITECTURE - Parallel execution streams
// ============================================================================

/**
 * Stream status
 */
export type StreamStatus =|'initializing|active|paused|blocked|completed|failed|stopped';

/**
 * Stream metrics
 */
export interface StreamMetrics {
  readonly itemsProcessed: number;
  readonly averageCycleTime: number;
  readonly currentWIP: number;
  readonly throughputPerHour: number;
  readonly errorRate: number;
  readonly lastProcessedAt?: number;
}

/**
 * Stream configuration
 */
export interface StreamConfiguration {
  readonly autoStart: boolean;
  readonly pauseOnError: boolean;
  readonly maxRetries: number;
  readonly healthCheckInterval: number;
  readonly notificationWebhooks: string[];
}

/**
 * A parallel workflow stream that can process multiple items concurrently
 */
export interface WorkflowStream<TWorkItem = unknown> {
  readonly id: string;
  readonly name: string;
  readonly level: OrchestrationLevel;
  readonly status: StreamStatus;
  readonly workItems: TWorkItem[];
  readonly inProgress: TWorkItem[];
  readonly completed: TWorkItem[];
  readonly wipLimit: number;
  readonly dependencies: string[]; // Other stream IDs this depends on
  readonly metrics: StreamMetrics;
  readonly configuration: StreamConfiguration;
}

// ============================================================================
// PORTFOLIO LEVEL - Strategic work items (PRDs)
// ============================================================================

/**
 * Portfolio-level work item (Product Requirement Document)
 */
export interface PortfolioItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly businessValue: number; // 1-10 scale
  readonly complexity: 'low' | 'medium' | 'high';
  readonly priority: 'low|medium|high|critical;
  readonly status:|'draft|review|approved|in_progress|completed;
  readonly stakeholders: string[];
  readonly targetMarket: string[];
  readonly successMetrics: SuccessMetric[];
  readonly dependencies: string[]; // Other portfolio item IDs
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly assignedPrograms: string[]; // Program IDs implementing this
}

/**
 * Success metric for portfolio items
 */
export interface SuccessMetric {
  readonly name: string;
  readonly target: number;
  readonly unit: string;
  readonly measurementMethod: string;
}

// ============================================================================
// PROGRAM LEVEL - AI-Human collaboration items (Epics)
// ============================================================================

/**
 * Program-level work item (Epic)
 */
export interface ProgramItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly portfolioItemId: string; // Parent PRD
  readonly acceptanceCriteria: string[];
  readonly technicalRequirements: string[];
  readonly status: 'planning|analysis|development|testing|done;
  readonly aiCollaborationLevel: 'human_led' | 'ai_assisted' | 'ai_led';
  readonly estimatedEffort: number; // Story points or hours
  readonly actualEffort?: number;
  readonly assignedSwarms: string[]; // Swarm IDs implementing features
  readonly riskLevel: 'low' | 'medium' | 'high';
  readonly blockers: string[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

// ============================================================================
// SWARM EXECUTION LEVEL - AI autonomous items (Features)
// ============================================================================

/**
 * Swarm execution-level work item (Feature)
 */
export interface SwarmExecutionItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly programItemId: string; // Parent Epic
  readonly sparcPhase: SPARCPhase;
  readonly sparcProjectId?: string;
  readonly automationLevel: 'full' | 'human_approval' | 'human_review';
  readonly status:|'queued|specification|pseudocode|architecture|refinement|completion|done;
  readonly assignedAgents: string[];
  readonly technicalSpecs: TechnicalSpecification;
  readonly testRequirements: string[];
  readonly codeArtifacts: CodeArtifact[];
  readonly qualityGates: QualityGate[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Technical specification for features
 */
export interface TechnicalSpecification {
  readonly architecture: string;
  readonly technologies: string[];
  readonly interfaces: string[];
  readonly dataModels: string[];
  readonly securityConsiderations: string[];
  readonly performanceRequirements: string[];
}

/**
 * Code artifact produced during implementation
 */
export interface CodeArtifact {
  readonly type:|''component|service|test|documentation|configuration;
  readonly path: string;
  readonly description: string;
  readonly size: number; // Lines of code
  readonly complexity: number; // Cyclomatic complexity
  readonly coveragePercent?: number;
}

/**
 * Quality gate for feature validation
 */
export interface QualityGate {
  readonly id: string;
  readonly name: string;
  readonly type: 'automated' | 'human_review' | 'ai_validation';
  readonly status: 'pending|passed|failed|skipped;
  readonly criteria: string[];
  readonly results?: QualityGateResult[];
}

/**
 * Result of a quality gate check
 */
export interface QualityGateResult {
  readonly criterion: string;
  readonly passed: boolean;
  readonly score?: number;
  readonly details: string;
  readonly timestamp: number;
}

// ============================================================================
// CROSS-LEVEL COORDINATION
// ============================================================================

/**
 * Cross-level dependency between work items
 */
export interface CrossLevelDependency {
  readonly id: string;
  readonly sourceLevel: OrchestrationLevel;
  readonly targetLevel: OrchestrationLevel;
  readonly sourceItemId: string;
  readonly targetItemId: string;
  readonly dependencyType: 'blocks|enables|informs|validates;
  readonly status: 'pending|satisfied|violated|obsolete;
  readonly createdAt: number;
  readonly resolvedAt?: number;
}

/**
 * Optimization recommendation for flow improvement
 */
export interface OptimizationRecommendation {
  readonly id: string;
  readonly level: OrchestrationLevel;
  readonly type: 'wip_adjustment|resource_reallocation|dependency_resolution|bottleneck_removal;
  readonly priority: 'low' | 'medium' | 'high';
  readonly impact: number; // Estimated improvement (0-1)
  readonly description: string;
  readonly actionItems: string[];
  readonly estimatedEffort: number; // Hours
  readonly createdAt: number;
}

// ============================================================================
// ORCHESTRATOR STATE
// ============================================================================

/**
 * Overall state of the multi-level orchestrator
 */
export interface MultiLevelOrchestratorState {
  readonly portfolioStream: WorkflowStream<PortfolioItem>;
  readonly programStreams: Map<string, WorkflowStream<ProgramItem>>;
  readonly executionStreams: Map<string, WorkflowStream<SwarmExecutionItem>>;
  readonly crossLevelDependencies: CrossLevelDependency[];
  readonly wipLimits: WIPLimits;
  readonly systemMetrics: SystemPerformanceMetrics;
  readonly activeOptimizations: OptimizationRecommendation[];
  readonly lastOptimizationRun: number;
}

/**
 * System-wide performance metrics
 */
export interface SystemPerformanceMetrics {
  readonly totalItemsInProgress: number;
  readonly systemThroughput: number; // Items per hour across all levels
  readonly averageSystemCycleTime: number; // End-to-end cycle time
  readonly systemWipUtilization: number; // Overall WIP usage
  readonly criticalPathLength: number; // Longest dependency chain
  readonly systemBottlenecks: BottleneckInfo[];
  readonly healthScore: number; // 0-1, overall system health
}

// ============================================================================
// EVENT TYPES - Multi-level orchestration events
// ============================================================================

/**
 * Base event for multi-level orchestration
 */
export interface MultiLevelOrchestrationEvent {
  readonly type: string;
  readonly id: string;
  readonly timestamp: number;
  readonly source: string;
  readonly level: OrchestrationLevel;
}

/**
 * Stream status change event
 */
export interface StreamStatusChangedEvent extends MultiLevelOrchestrationEvent {
  readonly type: 'stream:status:changed;
  readonly streamId: string;
  readonly oldStatus: StreamStatus;
  readonly newStatus: StreamStatus;
  readonly reason?: string;
}

/**
 * WIP limit exceeded event
 */
export interface WIPLimitExceededEvent extends MultiLevelOrchestrationEvent {
  readonly type: 'wip:limit:exceeded;
  readonly streamId: string;
  readonly currentWip: number;
  readonly wipLimit: number;
  readonly rejectedItemId: string;
}

/**
 * Bottleneck detected event
 */
export interface BottleneckDetectedEvent extends MultiLevelOrchestrationEvent {
  readonly type: 'bottleneck:detected;
  readonly bottleneck: BottleneckInfo;
  readonly affectedStreams: string[];
}

/**
 * Cross-level dependency event
 */
export interface CrossLevelDependencyEvent
  extends MultiLevelOrchestrationEvent {
  readonly type: 'dependency:cross_level;
  readonly dependency: CrossLevelDependency;
  readonly action: 'created|satisfied|violated|resolved;
}

// ============================================================================
// SPARC INTEGRATION TYPES
// ============================================================================

/**
 * SPARC phases for feature development
 */
export enum SPARCPhase {
  SPECIFICATION = 'specification',
  PSEUDOCODE = 'pseudocode',
  ARCHITECTURE = 'architecture',
  REFINEMENT = 'refinement',
  COMPLETION = 'completion',
}

/**
 * SPARC project reference
 */
export interface SPARCProjectRef {
  readonly id: string;
  readonly phase: SPARCPhase;
  readonly progress: number; // 0-1
  readonly artifacts: string[];
  readonly qualityScore?: number;
}
