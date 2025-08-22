/**
 * @file Multi-Level Orchestration Types - Phase 2 Architecture Foundation
 *
 * Defines the type system for the multi-level parallel flow architecture:
 * - Portfolio Level (Strategic - Human Controlled)
 * - Program Level (AI-Human Collaboration)
 * - Swarm Execution Level (AI Autonomous with SPARC)
 *
 * ARCHITECTURE TRANSFORMATION:
 * BEFORE: Vision→PRD→Epic→Feature→Task→Code (Linear)
 * AFTER: Multi-level parallel streams with AGUI gates and coordination
 */

import type { SPARCPhase, SPARCProject } from '@claude-zen/enterprise';
// BaseEvent type replaced with any

// Domain type moved - using any for now
type Domain = 'any';

// SPARC methodology integration via enterprise strategic facade

// ============================================================================
// ORCHESTRATION LEVELS - Three-tier architecture
// ============================================================================

/**
 * Orchestration levels in the multi-level architecture
 */
export enum OrchestrationLevel { PORTFOLIO = 'portfolio', // Strategic level - human controlled PROGRAM = 'program', // AI-Human collaboration level SWARM_EXECUTION = 'execution', // AI autonomous level
}

/**
 * Work In Progress (WIP) limits configuration
 */
export interface WIPLimits { readonly portfolioItems: number; // Max concurrent PRDs readonly programItems: number; // Max concurrent Epics per program readonly executionItems: number; // Max concurrent Features per swarm readonly totalSystemItems: number; // Overall system limit
}

/**
 * Flow control metrics
 */
export interface FlowMetrics { readonly throughput: number; // Items completed per time period readonly cycleTime: number; // Average time from start to completion readonly leadTime: number; // Time from request to delivery readonly wipUtilization: number; // Current WIP vs limits readonly bottlenecks: BottleneckInfo[]; readonly flowEfficiency: number; // Value-add time vs total time
}

/**
 * Bottleneck identification
 */
export interface BottleneckInfo { readonly level: OrchestrationLevel; readonly location: string; readonly severity: 'low' || medium || ' 'high  ' || critical; readonly impact: number; // Impact on overall flow readonly suggestedActions: string[];
}

// ============================================================================
// WORKFLOW STREAM ARCHITECTURE - Parallel execution streams
// ============================================================================

/**
 * A parallel workflow stream that can process multiple items concurrently
 */
export interface WorkflowStream<TWorkItem = unknown> { readonly id: string; readonly name: string; readonly level: OrchestrationLevel; readonly status: StreamStatus; readonly workItems: TWorkItem[]; readonly inProgress: TWorkItem[]; readonly completed: TWorkItem[]; readonly wipLimit: number; readonly dependencies: string[]; // Other stream Ds this depends on readonly metrics: StreamMetrics; readonly configuration: StreamConfiguration;
}

/**
 * Stream status
 */
export type StreamStatus = idle | active | block'e''d | paus'e'd | completed  || failed;

/**
 * Stream performance metrics
 */
export interface StreamMetrics { readonly itemsProcessed: number; readonly averageProcessingTime: number; readonly successRate: number; readonly utilizationRate: number; readonly blockedTime: number; readonly lastUpdated: Date;
}

/**
 * Stream configuration
 */
export interface StreamConfiguration { readonly parallelProcessing: boolean; readonly batchSize: number; readonly timeout: number; readonly retryAttempts: number; readonly enableGates: boolean; readonly gateConfiguration: GateConfiguration; readonly autoScaling: AutoScalingConfig;
}

/**
 * AGUI gate configuration for streams
 */
export interface GateConfiguration { readonly enableBusinessGates: boolean; readonly enableTechnicalGates: boolean; readonly enableQualityGates: boolean; readonly approvalThresholds: { readonly low: number; readonly medium: number; readonly high: number; readonly critical: number; }; readonly escalationRules: EscalationRule[];
}

/**
 * Gate escalation rules
 */
export interface EscalationRule { readonly condition: string; readonly action: escalate | auto_appro'v''e | require_revi'e'w'; readonly targetRole: string; readonly timeoutMinutes: number;
}

/**
 * Auto-scaling configuration for streams
 */
export interface AutoScalingConfig { readonly enabled: boolean; readonly minCapacity: number; readonly maxCapacity: number; readonly scaleUpThreshold: number; readonly scaleDownThreshold: number; readonly scalingCooldown: number;
}

// ============================================================================
// PORTFOLIO LEVEL TYPES - Strategic orchestration
// ============================================================================

/**
 * Portfolio-level work item (PRD with strategic context)
 */
export interface PortfolioItem { readonly id: string; readonly title: string; readonly type: 'prd  |strategic_initiative || market_expans'i''o'n'; readonly status: PortfolioItemStatus; readonly priority: PortfolioPriority; readonly businessValue: number; // 0-100 scale readonly strategicAlignment: number; // 0-100 scale readonly riskScore: number; // 0-100 scale readonly resourceRequirements: ResourceRequirements; readonly timeline: PortfolioTimeline; readonly stakeholders: string[]; readonly dependencies: string[]; readonly businessCase: BusinessCase; readonly gates: PortfolioGate[]; readonly metrics: PortfolioMetrics; readonly createdAt: Date; readonly updatedAt: Date;
}

/**
 * Portfolio item status
 */
export type PortfolioItemStatus = 'proposed  || evaluating || ' 'approved | in_progres's | on_hold | completed | cancell'e''d';

/**
 * Portfolio priority levels
 */
export enum PortfolioPriority { STRATEGIC = 'strategic', // Critical for business strategy HIGH = 'high', // High business value MEDIUM = 'medium', // Standard priority LOW = 'low', // Nice to have EXPERIMENTAL = 'experimental', // Innovation/research
}

/**
 * Resource requirements for portfolio items
 */
export interface ResourceRequirements { readonly developmentHours: number; readonly designHours: number; readonly qaHours: number; readonly budgetRequired: number; readonly skillsRequired: string[]; readonly toolsRequired: string[]; readonly externalDependencies: string[];
}

/**
 * Portfolio timeline
 */
export interface PortfolioTimeline { readonly startDate: Date; readonly endDate: Date; readonly milestones: Milestone[]; readonly phases: PortfolioPhase[];
}

/**
 * Portfolio milestone
 */
export interface Milestone { readonly id: string; readonly name: string; readonly date: Date; readonly description: string; readonly criteria: string[]; readonly completed: boolean;
}

/**
 * Portfolio execution phases
 */
export interface PortfolioPhase { readonly id: string; readonly name: string; readonly startDate: Date; readonly endDate: Date; readonly deliverables: string[]; readonly successCriteria: string[]; readonly riskMitigations: string[];
}

/**
 * Business case for portfolio items
 */
export interface BusinessCase { readonly problemStatement: string; readonly proposedSolution: string; readonly marketOpportunity: number; readonly competitiveAdvantage: string[]; readonly successMetrics: SuccessMetric[]; readonly assumptions: string[]; readonly risks: BusinessRisk[];
}

/**
 * Success metrics
 */
export interface SuccessMetric { readonly name: string; readonly target: number; readonly unit: string; readonly measurementMethod: string; readonly baseline?: number;
}

/**
 * Business risks
 */
export interface BusinessRisk { readonly description: string; readonly probability: number; // 0-1 readonly impact: number; // 0-1 readonly mitigation: string; readonly owner: string;
}

/**
 * Portfolio-level gates (strategic decisions)
 */
export interface PortfolioGate { readonly id: string; readonly type: PortfolioGateType; readonly name: string; readonly description: string; readonly requiredApprovers: string[]; readonly criteria: GateCriteria[]; readonly status: GateStatus; readonly decisionDate?: Date; readonly decisionRationale?: string;
}

/**
 * Portfolio gate types
 */
export enum PortfolioGateType { INVESTMENT_DECISION = 'investment_decision', STRATEGIC_REVIEW = 'strategic_review', MARKET_VALIDATION = 'market_validation', RESOURCE_ALLOCATION = 'resource_allocation', GO_NO_GO = 'go_no_go',
}

/**
 * Gate criteria
 */
export interface GateCriteria { readonly criterion: string; readonly weight: number; // 0-1 readonly threshold: number; // Minimum score required readonly actualScore?: number; readonly evidence: string[];
}

/**
 * Gate status
 */
export type GateStatus = 'pending  || approved || ' 'rejected | conditional;

/**
 * Portfolio-level metrics
 */
export interface PortfolioMetrics { readonly roi: number; readonly timeToMarket: number; readonly customerSatisfaction: number; readonly marketShare: number; readonly revenueImpact: number; readonly costSavings: number;
}

// ============================================================================
// PROGRAM LEVEL TYPES - AI-Human collaboration orchestration
// ============================================================================

/**
 * Program-level work item (Epic with coordination contex't');
 */
export interface ProgramItem { readonly id: string; readonly portfolioItemId: string; readonly title: string; readonly type: 'epic  |capability || integrat'i''o'n'; readonly status: ProgramItemStatus; readonly priority: ProgramPriority; readonly complexity: ComplexityLevel; readonly technicalRisk: number; // 0-100 scale readonly dependencies: ProgramDependency[]; readonly features: string[]; // Feature Ds readonly timeline: ProgramTimeline; readonly technicalSpecs: TechnicalSpecification; readonly gates: ProgramGate[]; readonly coordination: CoordinationInfo; readonly metrics: ProgramMetrics; readonly createdAt: Date; readonly updatedAt: Date;
}

/**
 * Program item status
 */
export type ProgramItemStatus = 'planned  || designing || ' 'development | testing | integration | complete'd'' || block'e''d';

/**
 * Program priority levels
 */
export enum ProgramPriority { CRITICAL_PATH = 'critical_path', HIGH = 'high', MEDIUM = 'medium', LOW = 'low',
}

/**
 * Complexity levels
 */
export enum ComplexityLevel { SIMPLE = 'simple', // Straightforward implementation MODERATE = 'moderate', // Some technical challenges COMPLEX = 'complex', // Significant technical challenges HIGHLY_COMPLEX = 'highly_complex', // Research/innovation required
}

/**
 * Program dependencies
 */
export interface ProgramDependency { readonly id: string; readonly type: 'technical  |business| 'resource | external; readonly dependsOn: string; readonly relationship:' 'blocks  || enables | enhan'c''e's'; readonly impact: 'low' || medium || ' 'high  ' || critical; readonly status: pending | resolv'e''d | block'e'd'; readonly resolutionPlan?: string;
}

/**
 * Program timeline
 */
export interface ProgramTimeline { readonly startDate: Date; readonly endDate: Date; readonly phases: ProgramPhase[]; readonly checkpoints: ProgramCheckpoint[];
}

/**
 * Program phases
 */
export interface ProgramPhase { readonly id: string; readonly name: string; readonly type: 'analysis  |design| 'implementation | testing | deploymen't''; readonly startDate: Date; readonly endDate: Date; readonly deliverables: string[]; readonly exitCriteria: string[];
}

/**
 * Program checkpoints
 */
export interface ProgramCheckpoint { readonly id: string; readonly name: string; readonly date: Date; readonly type: 'review  |demo || decision_po'i''n't'; readonly participants: string[]; readonly agenda: string[]; readonly outcomes?: CheckpointOutcome[];
}

/**
 * Checkpoint outcomes
 */
export interface CheckpointOutcome { readonly decision: string; readonly rationale: string; readonly actionItems: ActionItem[]; readonly risks: string[];
}

/**
 * Action items
 */
export interface ActionItem { readonly id: string; readonly description: string; readonly assignee: string; readonly dueDate: Date; readonly priority: 'low' || medium || 'h''i'g'h'; readonly status: 'open | in_progress  |completed';
}

/**
 * Technical specifications
 */
export interface TechnicalSpecification { readonly architecture: ArchitectureSpec; readonly interfaces: InterfaceSpec[]; readonly performance: PerformanceSpec; readonly security: SecuritySpec; readonly compliance: ComplianceSpec[];
}

/**
 * Architecture specification
 */
export interface ArchitectureSpec { readonly pattern: string; readonly components: ComponentSpec[]; readonly dataFlow: DataFlowSpec[]; readonly integrations: IntegrationSpec[];
}

/**
 * Component specification
 */
export interface ComponentSpec { readonly name: string; readonly type: string; readonly responsibilities: string[]; readonly interfaces: string[]; readonly dependencies: string[];
}

/**
 * Data flow specification
 */
export interface DataFlowSpec { readonly from: string; readonly to: string; readonly dataType: string; readonly frequency: string; readonly security: string[];
}

/**
 * Integration specification
 */
export interface IntegrationSpec { readonly system: string; readonly protocol: string; readonly authentication: string; readonly dataFormat: string;
}

/**
 * Interface specification
 */
export interface InterfaceSpec { readonly name: string; readonly type: api | ui || ' 'data | event; readonly specification: string; readonly consumers: string[]; readonly sla: ServiceLevelAgreement;
}

/**
 * Service level agreement
 */
export interface ServiceLevelAgreement { readonly availability: number; // 99.9% readonly responseTime: number; // milliseconds readonly throughput: number; // requests per second readonly errorRate: number; // maximum error rate
}

/**
 * Performance specification
 */
export interface PerformanceSpec { readonly throughput: number; readonly latency: number; readonly concurrency: number; readonly scalability: ScalabilitySpec;
}

/**
 * Scalability specification
 */
export interface ScalabilitySpec { readonly horizontal: boolean; readonly vertical: boolean; readonly autoScaling: boolean; readonly maxCapacity: number;
}

/**
 * Security specification
 */
export interface SecuritySpec { readonly authentication: string[]; readonly authorization: string[]; readonly encryption: string[]; readonly compliance: string[]; readonly threats: ThreatModel[];
}

/**
 * Threat model
 */
export interface ThreatModel { readonly threat: string; readonly likelihood: number; readonly impact: number; readonly mitigations: string[];
}

/**
 * Compliance specification
 */
export interface ComplianceSpec { readonly framework: string; readonly requirements: string[]; readonly evidence: string[]; readonly controls: string[];
}

/**
 * Program-level gates (technical decisio'n's');
 */
export interface ProgramGate { readonly id: string; readonly type: ProgramGateType; readonly name: string; readonly description: string; readonly requiredApprovers: string[]; readonly technicalCriteria: TechnicalCriteria[]; readonly status: GateStatus; readonly aiRecommendation?: AIRecommendation; readonly decisionDate?: Date; readonly decisionRationale?: string;
}

/**
 * Program gate types
 */
export enum ProgramGateType { ARCHITECTURE_REVIEW = 'architecture_review', DESIGN_APPROVAL = 'design_approval', IMPLEMENTATION_READINESS = 'implementation_readiness', INTEGRATION_CHECKPOINT = 'integration_checkpoint', QUALITY_GATE = 'quality_gate',
}

/**
 * Technical criteria for gates
 */
export interface TechnicalCriteria { readonly criterion: string; readonly weight: number; readonly threshold: number; readonly actualScore?: number; readonly automated: boolean; readonly testCases: string[];
}

/**
 * AI recommendation for gate decisions
 */
export interface AIRecommendation { readonly decision: 'approve' || reject || ' 'condition'a'l'; readonly confidence: number; // 0-1 readonly reasoning: string[]; readonly risks: string[]; readonly mitigations: string[]; readonly conditions?: string[]; // If conditional approval
}

/**
 * Coordination information for program items
 */
export interface CoordinationInfo { readonly assignedAgents: string[]; readonly swarmId?: string; readonly aiAssistance: AIAssistanceLevel; readonly humanOversight: HumanOversightLevel; readonly decisionPoints: DecisionPoint[];
}

/**
 * AI assistance levels
 */
export enum AIAssistanceLevel { NONE = 'none', ADVISORY = 'advisory', COLLABORATIVE = 'collaborative', AUTONOMOUS = 'autonomous',
}

/**
 * Human oversight levels
 */
export enum HumanOversightLevel { MINIMAL = 'minimal', PERIODIC = 'periodic', CONTINUOUS = 'continuous', NTENSIVE = 'intensive',
}

/**
 * Decision points in program execution
 */
export interface DecisionPoint { readonly id: string; readonly name: string; readonly description: string; readonly date: Date; readonly decisionMaker: 'human  ' || ai | collaborati'v''e'; readonly options: DecisionOption[]; readonly criteria: string[]; readonly outcome?: DecisionOutcome;
}

/**
 * Decision options
 */
export interface DecisionOption { readonly id: string; readonly description: string; readonly pros: string[]; readonly cons: string[]; readonly risks: string[]; readonly effort: number; // Story points or hours readonly timeline: number; // Days
}

/**
 * Decision outcome
 */
export interface DecisionOutcome { readonly selectedOption: string; readonly rationale: string; readonly approver: string; readonly date: Date; readonly followUpActions: ActionItem[];
}

/**
 * Program-level metrics
 */
export interface ProgramMetrics { readonly velocityPoints: number; readonly burndownRate: number; readonly defectDensity: number; readonly codeQuality: number; readonly testCoverage: number; readonly cycleTime: number;
}

// ============================================================================
// SWARM EXECUTION LEVEL TYPES - AI autonomous orchestration with SPARC
// ============================================================================

/**
 * Swarm execution work item (Feature with SPARC integration)
 */
export interface SwarmExecutionItem { readonly id: string; readonly programItemId: string; readonly title: string; readonly type: 'feature | bug_fix | refactoring |technical_debt'; readonly status: SwarmExecutionStatus; readonly priority: SwarmExecutionPriority; readonly complexity: ComplexityLevel; readonly effort: EffortEstimate; readonly sparcProject?: SPARCProject; readonly sparcPhase?: SPARCPhase; readonly assignedSwarm: string; readonly assignedAgents: string[]; readonly dependencies: SwarmDependency[]; readonly timeline: SwarmTimeline; readonly qualityGates: QualityGate[]; readonly automation: AutomationConfig; readonly metrics: SwarmExecutionMetrics; readonly createdAt: Date; readonly updatedAt: Date;
}

/**
 * Swarm execution status
 */
export type SwarmExecutionStatus '='' 'queued | analyzing | designing | implementing | testing | reviewing | complet'e''d | failed;

/**
 * Swarm execution priority
 */
export enum SwarmExecutionPriority { URGENT '=' 'urgent', HIGH = 'high', NORMAL = 'normal', LOW = 'low',
}

/**
 * Effort estimation
 */
export interface EffortEstimate { readonly storyPoints: number; readonly hours: number; readonly confidence: number; // 0-1 readonly estimatedBy: 'human  |ai || hyb'r''i'd'; readonly factors: EstimationFactor[];
}

/**
 * Estimation factors
 */
export interface EstimationFactor { readonly factor: string; readonly impact: number; // Multiplier effect readonly reasoning: string;
}

/**
 * Swarm dependencies
 */
export interface SwarmDependency { readonly id: string; readonly type: 'code  |data| 'api | infrastructure | knowledg'e''; readonly dependsOn: string; readonly relationship: 'requires  |uses || exte'n''d's'; readonly status: 'available  |pending || bloc'k''e'd'; readonly resolutionStrategy?: string;
}

/**
 * Swarm timeline
 */
export interface SwarmTimeline { readonly startDate: Date; readonly endDate: Date; readonly sparcPhases?: SPARCPhaseTimeline[]; readonly testingWindows: TestingWindow[]; readonly deploymentWindows: DeploymentWindow[];
}

/**
 * SPARC phase timeline
 */
export interface SPARCPhaseTimeline { readonly phase: SPARCPhase; readonly startDate: Date; readonly endDate: Date; readonly deliverables: string[]; readonly automated: boolean;
}

/**
 * Testing windows
 */
export interface TestingWindow { readonly type: 'unit  |integration| 'system | acceptance; readonly startDate: Date; readonly endDate: Date; readonly automated: boolean; readonly coverage: number;
}

/**
 * Deployment windows
 */
export interface DeploymentWindow { readonly environment:' 'dev  || test || ' 'staging | production; readonly startDate: Date; readonly endDate: Date; readonly strategy: string; readonly rollbackPlan: string;
}

/**
 * Quality gates for swarm execution
 */
export interface QualityGate { readonly id: string; readonly type: QualityGateType; readonly name: string; readonly description: string; readonly automated: boolean; readonly criteria: QualityCriteria[]; readonly status: GateStatus; readonly executionDate?: Date; readonly results?: QualityResults;
}

/**
 * Quality gate types
 */
export enum QualityGateType { CODE_QUALITY =' 'code_quality', TEST_COVERAGE = 'test_coverage', PERFORMANCE = 'performance', SECURITY = 'security', ACCESSIBILITY = 'accessibility',
}

/**
 * Quality criteria
 */
export interface QualityCriteria { readonly criterion: string; readonly threshold: number; readonly weight: number; readonly automated: boolean; readonly toolchain: string[];
}

/**
 * Quality results
 */
export interface QualityResults { readonly overallScore: number; readonly criteriaResults: CriteriaResult[]; readonly recommendations: string[]; readonly blockers: string[];
}

/**
 * Individual criteria result
 */
export interface CriteriaResult { readonly criterion: string; readonly score: number; readonly passed: boolean; readonly evidence: string[]; readonly issues: string[];
}

/**
 * Automation configuration
 */
export interface AutomationConfig { readonly codeGeneration: boolean; readonly testing: boolean; readonly deployment: boolean; readonly monitoring: boolean; readonly rollback: boolean; readonly notifications: NotificationConfig;
}

/**
 * Notification configuration
 */
export interface NotificationConfig { readonly channels: string[]; readonly triggers: string[]; readonly escalation: boolean; readonly humanAlert: boolean;
}

/**
 * Swarm execution metrics
 */
export interface SwarmExecutionMetrics { readonly throughput: number; readonly defectRate: number; readonly automationRate: number; readonly aiEfficiency: number; readonly humanIntervention: number; readonly learningRate: number;
}

// ============================================================================
// PARALLEL EXECUTION MANAGER TYPES - Cross-level coordination
// ============================================================================

/**
 * Multi-level orchestrator state
 */
export interface MultiLevelOrchestratorState { readonly portfolioStreams: WorkflowStream<PortfolioItem>[]; readonly programStreams: WorkflowStream<ProgramItem>[]; readonly executionStreams: WorkflowStream<SwarmExecutionItem>[]; readonly crossLevelDependencies: CrossLevelDependency[]; readonly wipLimits: WIPLimits; readonly flowMetrics: FlowMetrics; readonly bottlenecks: BottleneckInfo[]; readonly lastUpdated: Date;
}

/**
 * Cross-level dependencies
 */
export interface CrossLevelDependency { readonly id: string; readonly fromLevel: OrchestrationLevel; readonly toLevel: OrchestrationLevel; readonly fromItemId: string; readonly toItemId: string; readonly type: 'blocks  |enables || info'r''m's'; readonly status: 'pending  |resolved || bloc'k''e'd'; readonly impact: number; // 0-1 scale
}

/**
 * Parallel execution coordinator events
 */
export interface ParallelExecutionEvent extends any { readonly domain: Domain.COORDINATION;
}

export interface StreamStatusChangedEvent extends ParallelExecutionEvent { readonly type: 'stream.status.changed'; readonly payload: { readonly streamId: string; readonly level: OrchestrationLevel; readonly previousStatus: StreamStatus; readonly newStatus: StreamStatus; readonly reason: string; };
}

export interface WIPLimitExceededEvent extends ParallelExecutionEvent { readonly type: 'wip.limit.exceeded'; readonly payload: { readonly level: OrchestrationLevel; readonly streamId: string; readonly currentWIP: number; readonly limit: number; readonly action: 'block  |escalate || rebala'n''c'e'; };
}

export interface BottleneckDetectedEvent extends ParallelExecutionEvent { readonly type: 'bottleneck.detected'; readonly payload: { readonly bottleneck: BottleneckInfo; readonly affectedStreams: string[]; readonly suggestedActions: string[]; };
}

export interface CrossLevelDependencyEvent extends ParallelExecutionEvent { readonly type: 'cross.level.dependency.resolved  |cross'.level.dependency.blocked; readonly payload: { readonly dependency: CrossLevelDependency; readonly impact: string[]; readonly nextActions: string[]; };
}

// ============================================================================
// NTEGRATION NTERFACES - Connecting with existing systems
// ============================================================================

/**
 * Integration with existing ProductWorkflowEngine
 */
export interface ProductWorkflowIntegration { readonly workflowId: string; readonly orchestrationLevel: OrchestrationLevel; readonly streamId: string; readonly workItemId: string; readonly sparcIntegration?: SPARCIntegration; readonly aguiIntegration?: AGUIIntegration;
}

/**
 * SPARC methodology integration
 */
export interface SPARCIntegration { readonly projectId: string; readonly currentPhase: SPARCPhase; readonly automation: boolean; readonly humanOversight: boolean; readonly qualityGates: boolean; readonly metrics: SPARCMetrics;
}

/**
 * SPARC metrics
 */
export interface SPARCMetrics { readonly phaseCompletionRate: number; readonly qualityScore: number; readonly automationRate: number; readonly cycleTime: number;
}

/**
 * AGUI system integration
 */
export interface AGUIIntegration { readonly gateId: string; readonly gateType: string; readonly status: pending | approv'e''d | reject'e'd'; readonly humanInput: boolean; readonly automatedDecision: boolean; readonly escalation?: EscalationInfo;
}

/**
 * Escalation information
 */
export interface EscalationInfo { readonly level: number; readonly escalatedTo: string; readonly reason: string; readonly deadline: Date; readonly impact: 'low' || medium || ' 'high  ' || critical;
}

// ============================================================================
// PERFORMANCE AND MONITORING TYPES - System optimization
// ============================================================================

/**
 * System performance metrics
 */
export interface SystemPerformanceMetrics { readonly overallThroughput: number; readonly levelThroughput: Record<OrchestrationLevel, number>; readonly averageCycleTime: number; readonly wipUtilization: number; readonly bottleneckCount: number; readonly flowEfficiency: number; readonly humanInterventionRate: number; readonly automationRate: number; readonly qualityScore: number; readonly lastUpdated: Date;
}

/**
 * Resource utilization tracking
 */
export interface ResourceUtilization { readonly cpu: number; readonly memory: number; readonly agents: AgentUtilization; readonly swarms: SwarmUtilization; readonly humans: HumanUtilization;
}

/**
 * Agent utilization
 */
export interface AgentUtilization { readonly total: number; readonly busy: number; readonly idle: number; readonly efficiency: number;
}

/**
 * Swarm utilization
 */
export interface SwarmUtilization { readonly total: number; readonly active: number; readonly capacity: number; readonly loadBalance: number;
}

/**
 * Human utilization
 */
export interface HumanUtilization { readonly pendingApprovals: number; readonly averageResponseTime: number; readonly escalationRate: number; readonly satisfactionScore: number;
}

/**
 * Optimization recommendations
 */
export interface OptimizationRecommendation { readonly id: string; readonly type: wip_adjustment | resource_reallocati'o''n | process_improveme'n't'; readonly description: string; readonly impact: number; // Expected improvement 0-1 readonly effort: number; // Implementation effort 0-1 readonly priority: 'low' || medium || ' 'high | critical; readonly actions: string[]; readonly metrics: string[]; // Metrics to track success
}'
'