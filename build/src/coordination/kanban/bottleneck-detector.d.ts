/**
 * @file Bottleneck Detection Engine - Phase 4, Day 18 (Task 17.1-17.3)
 *
 * Implements intelligent bottleneck detection, automated resolution strategies,
 * and predictive bottleneck prevention. Provides real-time identification of
 * flow constraints with automated resource reallocation and workload redistribution.
 *
 * ARCHITECTURE:
 * - Real-time bottleneck identification and severity assessment
 * - Automated bottleneck resolution strategy engine
 * - Resource reallocation algorithms and workload redistribution
 * - Predictive bottleneck modeling and prevention
 * - Proactive resource planning and capacity forecasting
 * - Integration with Advanced Flow Manager
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import type { AdvancedFlowManager } from './flow-manager.ts';
import type { FlowState, FlowStage } from './flow-manager.ts';
/**
 * Bottleneck Detection Engine configuration
 */
export interface BottleneckDetectionEngineConfig {
    readonly enableRealTimeDetection: boolean;
    readonly enableAutomaticResolution: boolean;
    readonly enablePredictiveModeling: boolean;
    readonly enableResourceReallocation: boolean;
    readonly enableWorkloadRedistribution: boolean;
    readonly enableAGUIIntegration: boolean;
    readonly detectionInterval: number;
    readonly analysisLookback: number;
    readonly predictionHorizon: number;
    readonly severityThresholds: SeverityThreshold[];
    readonly resolutionTimeoutThreshold: number;
    readonly autoResolutionConfidenceThreshold: number;
    readonly escalationThreshold: number;
    readonly maxConcurrentResolutions: number;
    readonly resourceReallocationWindow: number;
    readonly workloadRedistributionThreshold: number;
}
/**
 * Severity threshold configuration
 */
export interface SeverityThreshold {
    readonly level: BottleneckSeverity;
    readonly criteria: SeverityCriteria;
    readonly actions: AutomatedAction[];
    readonly escalationRules: EscalationRule[];
}
/**
 * Severity criteria
 */
export interface SeverityCriteria {
    readonly wipUtilization: number;
    readonly cycleTimeIncrease: number;
    readonly throughputReduction: number;
    readonly queueLength: number;
    readonly duration: number;
    readonly impactRadius: number;
}
/**
 * Automated action
 */
export interface AutomatedAction {
    readonly actionType: AutomatedActionType;
    readonly parameters: Record<string, any>;
    readonly confidence: number;
    readonly timeToExecute: number;
    readonly rollbackPlan: RollbackPlan;
    readonly successCriteria: SuccessCriterion[];
}
/**
 * Automated action type
 */
export declare enum AutomatedActionType {
    RESOURCE_REALLOCATION = "resource-reallocation",
    WORKLOAD_REDISTRIBUTION = "workload-redistribution",
    WIP_ADJUSTMENT = "wip-adjustment",
    PRIORITY_REBALANCING = "priority-rebalancing",
    CAPACITY_SCALING = "capacity-scaling",
    PROCESS_OPTIMIZATION = "process-optimization",
    DEPENDENCY_RESOLUTION = "dependency-resolution",
    ESCALATION = "escalation"
}
/**
 * Rollback plan
 */
export interface RollbackPlan {
    readonly enabled: boolean;
    readonly triggers: RollbackTrigger[];
    readonly steps: RollbackStep[];
    readonly timeoutMs: number;
    readonly fallbackAction: string;
}
/**
 * Rollback trigger
 */
export interface RollbackTrigger {
    readonly condition: string;
    readonly threshold: number;
    readonly timeWindow: number;
}
/**
 * Rollback step
 */
export interface RollbackStep {
    readonly stepId: string;
    readonly action: string;
    readonly parameters: Record<string, any>;
    readonly timeout: number;
}
/**
 * Success criterion
 */
export interface SuccessCriterion {
    readonly metric: string;
    readonly target: number;
    readonly timeframe: number;
    readonly critical: boolean;
}
/**
 * Escalation rule
 */
export interface EscalationRule {
    readonly condition: string;
    readonly delay: number;
    readonly escalateTo: string[];
    readonly notificationChannels: string[];
    readonly maxEscalations: number;
}
/**
 * Bottleneck severity levels
 */
export declare enum BottleneckSeverity {
    MINOR = "minor",
    MODERATE = "moderate",
    MAJOR = "major",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
/**
 * Bottleneck detection result
 */
export interface BottleneckDetectionResult {
    readonly detectionId: string;
    readonly timestamp: Date;
    readonly bottlenecks: DetectedBottleneck[];
    readonly predictions: BottleneckPrediction[];
    readonly systemHealth: SystemHealthStatus;
    readonly recommendations: BottleneckRecommendation[];
    readonly riskAssessment: BottleneckRiskAssessment;
    readonly performanceImpact: PerformanceImpact;
}
/**
 * Detected bottleneck
 */
export interface DetectedBottleneck {
    readonly bottleneckId: string;
    readonly stage: FlowStage;
    readonly severity: BottleneckSeverity;
    readonly type: BottleneckType;
    readonly detectedAt: Date;
    readonly duration: number;
    readonly rootCause: RootCauseAnalysis;
    readonly impactMetrics: BottleneckImpactMetrics;
    readonly affectedItems: string[];
    readonly contributingFactors: ContributingFactor[];
    readonly resolutionStrategy: ResolutionStrategy;
    readonly confidence: number;
}
/**
 * Bottleneck type
 */
export declare enum BottleneckType {
    CAPACITY_CONSTRAINT = "capacity-constraint",
    RESOURCE_SHORTAGE = "resource-shortage",
    DEPENDENCY_BLOCK = "dependency-block",
    QUALITY_GATE = "quality-gate",
    PROCESS_INEFFICIENCY = "process-inefficiency",
    SKILL_MISMATCH = "skill-mismatch",
    EXTERNAL_DEPENDENCY = "external-dependency",
    SYSTEM_LIMITATION = "system-limitation",
    COORDINATION_OVERHEAD = "coordination-overhead"
}
/**
 * Root cause analysis
 */
export interface RootCauseAnalysis {
    readonly primaryCause: string;
    readonly secondaryCauses: string[];
    readonly analysisMethod: 'statistical' | 'ml-based' | 'heuristic' | 'hybrid';
    readonly confidence: number;
    readonly evidencePoints: EvidencePoint[];
    readonly timeline: CausalTimeline[];
    readonly correlationAnalysis: CorrelationAnalysis[];
}
/**
 * Evidence point
 */
export interface EvidencePoint {
    readonly evidenceId: string;
    readonly type: 'metric' | 'event' | 'observation' | 'pattern';
    readonly description: string;
    readonly weight: number;
    readonly timestamp: Date;
    readonly source: string;
    readonly reliability: number;
}
/**
 * Causal timeline
 */
export interface CausalTimeline {
    readonly timestamp: Date;
    readonly event: string;
    readonly impact: string;
    readonly causality: number;
}
/**
 * Correlation analysis
 */
export interface CorrelationAnalysis {
    readonly variable1: string;
    readonly variable2: string;
    readonly correlation: number;
    readonly significance: number;
    readonly timelag: number;
}
/**
 * Bottleneck impact metrics
 */
export interface BottleneckImpactMetrics {
    readonly cycleTimeIncrease: number;
    readonly throughputReduction: number;
    readonly leadTimeIncrease: number;
    readonly qualityImpact: number;
    readonly costIncrease: number;
    readonly customerSatisfactionImpact: number;
    readonly teamMoraleImpact: number;
    readonly businessRisk: number;
    readonly technicalDebt: number;
}
/**
 * Contributing factor
 */
export interface ContributingFactor {
    readonly factorId: string;
    readonly description: string;
    readonly category: 'resource' | 'process' | 'technical' | 'organizational' | 'external';
    readonly contribution: number;
    readonly controllable: boolean;
    readonly timeToResolve: number;
    readonly resolutionCost: number;
}
/**
 * Resolution strategy
 */
export interface ResolutionStrategy {
    readonly strategyId: string;
    readonly name: string;
    readonly type: ResolutionStrategyType;
    readonly description: string;
    readonly implementation: StrategyImplementation;
    readonly expectedOutcome: ExpectedOutcome;
    readonly riskAssessment: StrategyRiskAssessment;
    readonly resourceRequirements: ResourceRequirement[];
    readonly timeline: ImplementationTimeline;
    readonly dependencies: string[];
    readonly successProbability: number;
}
/**
 * Resolution strategy type
 */
export declare enum ResolutionStrategyType {
    IMMEDIATE_RELIEF = "immediate-relief",
    SHORT_TERM_FIX = "short-term-fix",
    LONG_TERM_SOLUTION = "long-term-solution",
    WORKAROUND = "workaround",
    ESCALATION = "escalation",
    PREVENTION = "prevention"
}
/**
 * Strategy implementation
 */
export interface StrategyImplementation {
    readonly approach: 'automated' | 'manual' | 'hybrid' | 'agui-assisted';
    readonly steps: ImplementationStep[];
    readonly automation: AutomationConfig;
    readonly humanInvolvement: HumanInvolvement[];
    readonly monitoring: MonitoringConfig;
    readonly rollback: RollbackPlan;
}
/**
 * Implementation step
 */
export interface ImplementationStep {
    readonly stepId: string;
    readonly sequence: number;
    readonly action: string;
    readonly parameters: Record<string, any>;
    readonly estimated_duration: number;
    readonly prerequisites: string[];
    readonly validation: ValidationConfig;
    readonly rollbackPoint: boolean;
}
/**
 * Automation config
 */
export interface AutomationConfig {
    readonly enabled: boolean;
    readonly triggers: AutomationTrigger[];
    readonly guardrails: AutomationGuardrail[];
    readonly monitoring: string[];
    readonly failsafes: string[];
}
/**
 * Automation trigger
 */
export interface AutomationTrigger {
    readonly condition: string;
    readonly threshold: number;
    readonly timeWindow: number;
    readonly cooldown: number;
}
/**
 * Automation guardrail
 */
export interface AutomationGuardrail {
    readonly check: string;
    readonly limit: number;
    readonly action: 'pause' | 'rollback' | 'escalate' | 'notify';
}
/**
 * Human involvement
 */
export interface HumanInvolvement {
    readonly role: string;
    readonly activity: string;
    readonly timing: 'before' | 'during' | 'after' | 'continuous';
    readonly required: boolean;
    readonly timeout: number;
    readonly escalation: string[];
}
/**
 * Monitoring config
 */
export interface MonitoringConfig {
    readonly metrics: string[];
    readonly frequency: number;
    readonly alerting: AlertingConfig;
    readonly dashboard: DashboardConfig;
}
/**
 * Alerting config
 */
export interface AlertingConfig {
    readonly enabled: boolean;
    readonly channels: string[];
    readonly conditions: AlertCondition[];
    readonly escalation: AlertEscalation[];
}
/**
 * Alert condition
 */
export interface AlertCondition {
    readonly metric: string;
    readonly operator: string;
    readonly threshold: number;
    readonly duration: number;
}
/**
 * Alert escalation
 */
export interface AlertEscalation {
    readonly level: number;
    readonly delay: number;
    readonly recipients: string[];
    readonly channels: string[];
}
/**
 * Dashboard config
 */
export interface DashboardConfig {
    readonly enabled: boolean;
    readonly widgets: DashboardWidget[];
    readonly refreshRate: number;
    readonly sharing: SharingConfig;
}
/**
 * Dashboard widget
 */
export interface DashboardWidget {
    readonly type: string;
    readonly config: Record<string, any>;
    readonly position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
/**
 * Sharing config
 */
export interface SharingConfig {
    readonly public: boolean;
    readonly allowedUsers: string[];
    readonly allowedRoles: string[];
}
/**
 * Validation config
 */
export interface ValidationConfig {
    readonly criteria: ValidationCriterion[];
    readonly timeout: number;
    readonly retries: number;
    readonly failureAction: 'continue' | 'retry' | 'rollback' | 'escalate';
}
/**
 * Validation criterion
 */
export interface ValidationCriterion {
    readonly metric: string;
    readonly expected: number;
    readonly tolerance: number;
    readonly critical: boolean;
}
/**
 * Expected outcome
 */
export interface ExpectedOutcome {
    readonly primaryGoal: string;
    readonly quantifiedBenefits: QuantifiedBenefit[];
    readonly timeline: number;
    readonly successMetrics: SuccessMetric[];
    readonly riskMitigation: string[];
}
/**
 * Quantified benefit
 */
export interface QuantifiedBenefit {
    readonly metric: string;
    readonly improvement: number;
    readonly unit: string;
    readonly confidence: number;
    readonly timeframe: number;
}
/**
 * Success metric
 */
export interface SuccessMetric {
    readonly name: string;
    readonly baseline: number;
    readonly target: number;
    readonly measurement: string;
    readonly criticality: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Strategy risk assessment
 */
export interface StrategyRiskAssessment {
    readonly overallRisk: 'low' | 'medium' | 'high' | 'critical';
    readonly riskFactors: RiskFactor[];
    readonly mitigationPlans: MitigationPlan[];
    readonly contingencyPlans: ContingencyPlan[];
    readonly riskAppetite: number;
}
/**
 * Risk factor
 */
export interface RiskFactor {
    readonly riskId: string;
    readonly description: string;
    readonly probability: number;
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly category: 'technical' | 'operational' | 'financial' | 'compliance';
    readonly mitigation: string[];
}
/**
 * Mitigation plan
 */
export interface MitigationPlan {
    readonly riskId: string;
    readonly actions: string[];
    readonly owner: string;
    readonly timeline: number;
    readonly cost: number;
    readonly effectiveness: number;
}
/**
 * Contingency plan
 */
export interface ContingencyPlan {
    readonly trigger: string;
    readonly actions: string[];
    readonly resources: string[];
    readonly timeline: number;
    readonly approval: string[];
}
/**
 * Resource requirement
 */
export interface ResourceRequirement {
    readonly type: 'human' | 'computational' | 'financial' | 'external';
    readonly description: string;
    readonly quantity: number;
    readonly duration: number;
    readonly cost: number;
    readonly availability: ResourceAvailability;
    readonly alternatives: string[];
}
/**
 * Resource availability
 */
export interface ResourceAvailability {
    readonly status: 'available' | 'limited' | 'unavailable' | 'unknown';
    readonly constraints: string[];
    readonly earliestAvailable: Date;
    readonly alternatives: string[];
}
/**
 * Implementation timeline
 */
export interface ImplementationTimeline {
    readonly phases: TimelinePhase[];
    readonly totalDuration: number;
    readonly criticalPath: string[];
    readonly bufferTime: number;
    readonly dependencies: TimelineDependency[];
}
/**
 * Timeline phase
 */
export interface TimelinePhase {
    readonly phaseId: string;
    readonly name: string;
    readonly duration: number;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly deliverables: string[];
    readonly resources: string[];
    readonly dependencies: string[];
}
/**
 * Timeline dependency
 */
export interface TimelineDependency {
    readonly from: string;
    readonly to: string;
    readonly type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
    readonly lag: number;
    readonly critical: boolean;
}
/**
 * Bottleneck prediction
 */
export interface BottleneckPrediction {
    readonly predictionId: string;
    readonly stage: FlowStage;
    readonly type: BottleneckType;
    readonly probability: number;
    readonly timeframe: number;
    readonly severity: BottleneckSeverity;
    readonly confidence: number;
    readonly triggerFactors: PredictionTriggerFactor[];
    readonly preventionStrategies: PreventionStrategy[];
    readonly earlyWarningIndicators: EarlyWarningIndicator[];
}
/**
 * Prediction trigger factor
 */
export interface PredictionTriggerFactor {
    readonly factor: string;
    readonly contribution: number;
    readonly trend: 'increasing' | 'decreasing' | 'stable';
    readonly threshold: number;
    readonly currentValue: number;
    readonly timeToThreshold: number;
}
/**
 * Prevention strategy
 */
export interface PreventionStrategy {
    readonly strategyId: string;
    readonly name: string;
    readonly description: string;
    readonly effectiveness: number;
    readonly cost: number;
    readonly timeToImplement: number;
    readonly actions: PreventionAction[];
    readonly monitoring: string[];
}
/**
 * Prevention action
 */
export interface PreventionAction {
    readonly action: string;
    readonly timing: 'immediate' | 'proactive' | 'reactive';
    readonly automation: boolean;
    readonly resources: string[];
    readonly impact: number;
}
/**
 * Early warning indicator
 */
export interface EarlyWarningIndicator {
    readonly indicator: string;
    readonly threshold: number;
    readonly currentValue: number;
    readonly trend: 'approaching' | 'stable' | 'improving';
    readonly sensitivity: number;
    readonly leadTime: number;
}
/**
 * System health status
 */
export interface SystemHealthStatus {
    readonly overall: 'healthy' | 'degraded' | 'critical' | 'failing';
    readonly flowEfficiency: number;
    readonly throughputHealth: number;
    readonly qualityHealth: number;
    readonly capacityUtilization: number;
    readonly bottleneckCount: number;
    readonly criticalBottleneckCount: number;
    readonly trendDirection: 'improving' | 'stable' | 'degrading';
    readonly lastHealthyTimestamp: Date;
}
/**
 * Bottleneck recommendation
 */
export interface BottleneckRecommendation {
    readonly recommendationId: string;
    readonly type: 'immediate' | 'short-term' | 'long-term' | 'strategic';
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly title: string;
    readonly description: string;
    readonly rationale: string;
    readonly targetBottlenecks: string[];
    readonly expectedBenefit: ExpectedBenefit;
    readonly implementation: RecommendationImplementation;
    readonly alternatives: Alternative[];
    readonly riskLevel: 'low' | 'medium' | 'high';
    readonly confidence: number;
}
/**
 * Expected benefit for recommendations
 */
export interface ExpectedBenefit {
    readonly primaryMetric: string;
    readonly improvement: number;
    readonly additionalBenefits: Record<string, number>;
    readonly timeToRealize: number;
    readonly sustainability: number;
}
/**
 * Recommendation implementation
 */
export interface RecommendationImplementation {
    readonly approach: string;
    readonly effort: 'low' | 'medium' | 'high' | 'very-high';
    readonly duration: number;
    readonly resources: string[];
    readonly steps: string[];
    readonly prerequisites: string[];
    readonly successCriteria: string[];
}
/**
 * Alternative recommendation
 */
export interface Alternative {
    readonly name: string;
    readonly description: string;
    readonly pros: string[];
    readonly cons: string[];
    readonly effort: 'low' | 'medium' | 'high' | 'very-high';
    readonly effectiveness: number;
}
/**
 * Bottleneck risk assessment
 */
export interface BottleneckRiskAssessment {
    readonly overallRisk: 'low' | 'medium' | 'high' | 'critical';
    readonly cascadingRisks: CascadingRisk[];
    readonly systemStabilityRisk: number;
    readonly businessImpactRisk: number;
    readonly customerImpactRisk: number;
    readonly mitigationUrgency: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Cascading risk
 */
export interface CascadingRisk {
    readonly originBottleneck: string;
    readonly affectedStages: FlowStage[];
    readonly cascadeProbability: number;
    readonly amplificationFactor: number;
    readonly timeframe: number;
    readonly preventionActions: string[];
}
/**
 * Performance impact
 */
export interface PerformanceImpact {
    readonly currentImpact: ImpactMeasurement;
    readonly projectedImpact: ImpactMeasurement;
    readonly comparisonToBaseline: ImpactMeasurement;
    readonly businessMetrics: BusinessImpactMetric[];
    readonly technicalMetrics: TechnicalImpactMetric[];
    readonly customerMetrics: CustomerImpactMetric[];
}
/**
 * Impact measurement
 */
export interface ImpactMeasurement {
    readonly throughputChange: number;
    readonly cycleTimeChange: number;
    readonly qualityChange: number;
    readonly costChange: number;
    readonly valueDeliveryChange: number;
}
/**
 * Business impact metric
 */
export interface BusinessImpactMetric {
    readonly metric: string;
    readonly baseline: number;
    readonly current: number;
    readonly projected: number;
    readonly impact: number;
    readonly trend: 'improving' | 'stable' | 'degrading';
}
/**
 * Technical impact metric
 */
export interface TechnicalImpactMetric {
    readonly metric: string;
    readonly baseline: number;
    readonly current: number;
    readonly threshold: number;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly affectedComponents: string[];
}
/**
 * Customer impact metric
 */
export interface CustomerImpactMetric {
    readonly metric: string;
    readonly baseline: number;
    readonly current: number;
    readonly customerSegment: string;
    readonly satisfactionImpact: number;
    readonly retentionRisk: number;
}
/**
 * Bottleneck Detection Engine state
 */
export interface BottleneckDetectionEngineState {
    readonly currentBottlenecks: Map<string, DetectedBottleneck>;
    readonly resolutionStrategies: Map<string, ResolutionStrategy>;
    readonly activeResolutions: Map<string, ActiveResolution>;
    readonly predictionModels: Map<string, PredictionModel>;
    readonly historicalDetections: BottleneckDetectionResult[];
    readonly performanceBaselines: Map<string, PerformanceBaseline>;
    readonly automationRules: Map<string, AutomationRule>;
    readonly escalationPaths: Map<string, EscalationPath>;
    readonly lastDetection: Date;
    readonly lastPrediction: Date;
}
/**
 * Active resolution
 */
export interface ActiveResolution {
    readonly resolutionId: string;
    readonly bottleneckId: string;
    readonly strategy: ResolutionStrategy;
    readonly status: ResolutionStatus;
    readonly startedAt: Date;
    readonly progress: ResolutionProgress;
    readonly metrics: ResolutionMetrics;
    readonly issues: ResolutionIssue[];
}
/**
 * Resolution status
 */
export declare enum ResolutionStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in-progress",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed",
    ROLLED_BACK = "rolled-back",
    ESCALATED = "escalated"
}
/**
 * Resolution progress
 */
export interface ResolutionProgress {
    readonly percentComplete: number;
    readonly completedSteps: string[];
    readonly currentStep: string;
    readonly remainingSteps: string[];
    readonly estimatedCompletion: Date;
    readonly blockers: string[];
}
/**
 * Resolution metrics
 */
export interface ResolutionMetrics {
    readonly effectivenessScore: number;
    readonly timeToImpact: number;
    readonly resourceUtilization: number;
    readonly impactRealized: ImpactMeasurement;
    readonly costs: ResolutionCost;
    readonly riskRealization: number;
}
/**
 * Resolution cost
 */
export interface ResolutionCost {
    readonly direct: number;
    readonly indirect: number;
    readonly opportunity: number;
    readonly total: number;
}
/**
 * Resolution issue
 */
export interface ResolutionIssue {
    readonly issueId: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly impact: string;
    readonly resolution: string;
    readonly owner: string;
    readonly dueDate: Date;
    readonly status: 'open' | 'in-progress' | 'resolved' | 'escalated';
}
/**
 * Prediction model
 */
export interface PredictionModel {
    readonly modelId: string;
    readonly type: 'statistical' | 'ml' | 'hybrid';
    readonly accuracy: number;
    readonly features: string[];
    readonly trainingData: PredictionTrainingData;
    readonly lastTrained: Date;
    readonly performance: ModelPerformance;
}
/**
 * Prediction training data
 */
export interface PredictionTrainingData {
    readonly samples: number;
    readonly timeRange: DateRange;
    readonly features: ModelFeature[];
    readonly labels: ModelLabel[];
    readonly qualityScore: number;
}
/**
 * Model feature
 */
export interface ModelFeature {
    readonly name: string;
    readonly importance: number;
    readonly correlation: number;
    readonly dataQuality: number;
}
/**
 * Model label
 */
export interface ModelLabel {
    readonly name: string;
    readonly distribution: Record<string, number>;
    readonly balance: number;
}
/**
 * Model performance
 */
export interface ModelPerformance {
    readonly accuracy: number;
    readonly precision: number;
    readonly recall: number;
    readonly f1Score: number;
    readonly confusionMatrix: number[][];
    readonly rocAuc: number;
}
/**
 * Performance baseline
 */
export interface PerformanceBaseline {
    readonly metric: string;
    readonly baseline: number;
    readonly variance: number;
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly lastUpdated: Date;
    readonly confidence: number;
}
/**
 * Automation rule
 */
export interface AutomationRule {
    readonly ruleId: string;
    readonly condition: string;
    readonly action: AutomatedActionType;
    readonly parameters: Record<string, any>;
    readonly enabled: boolean;
    readonly priority: number;
    readonly cooldown: number;
    readonly lastTriggered?: Date;
}
/**
 * Escalation path
 */
export interface EscalationPath {
    readonly pathId: string;
    readonly severity: BottleneckSeverity;
    readonly levels: EscalationLevel[];
    readonly maxLevels: number;
    readonly timeouts: number[];
}
/**
 * Escalation level
 */
export interface EscalationLevel {
    readonly level: number;
    readonly recipients: string[];
    readonly channels: string[];
    readonly actions: string[];
    readonly authority: string[];
}
/**
 * Date range
 */
export interface DateRange {
    readonly start: Date;
    readonly end: Date;
}
/**
 * Bottleneck Detection Engine - Intelligent bottleneck detection and resolution
 */
export declare class BottleneckDetectionEngine extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly flowManager;
    private readonly config;
    private state;
    private detectionTimer?;
    private predictionTimer?;
    private resolutionTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, flowManager: AdvancedFlowManager, config?: Partial<BottleneckDetectionEngineConfig>);
    /**
     * Initialize the Bottleneck Detection Engine
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Bottleneck Detection Engine
     */
    shutdown(): Promise<void>;
    /**
     * Run comprehensive bottleneck detection
     */
    runBottleneckDetection(): Promise<BottleneckDetectionResult>;
    /**
     * Detect bottlenecks in current flow state
     */
    detectBottlenecks(flowState: FlowState): Promise<DetectedBottleneck[]>;
    /**
     * Assess bottleneck severity
     */
    assessBottleneckSeverity(stage: FlowStage, metrics: any, flowState: FlowState): Promise<BottleneckSeverity>;
    /**
     * Trigger automatic resolution for detected bottlenecks
     */
    triggerAutomaticResolutions(bottlenecks: DetectedBottleneck[]): Promise<void>;
    /**
     * Initiate automatic resolution for a bottleneck
     */
    initiateAutomaticResolution(bottleneck: DetectedBottleneck): Promise<void>;
    /**
     * Execute resolution strategy
     */
    executeResolutionStrategy(resolution: ActiveResolution): Promise<void>;
    /**
     * Execute resource reallocation
     */
    executeResourceReallocation(fromStage: FlowStage, toStage: FlowStage, resourceCount: number): Promise<void>;
    /**
     * Execute workload redistribution
     */
    executeWorkloadRedistribution(overloadedStage: FlowStage, redistributionPlan: WorkloadRedistributionPlan): Promise<void>;
    /**
     * Generate bottleneck predictions
     */
    generateBottleneckPredictions(flowState: FlowState): Promise<BottleneckPrediction[]>;
    /**
     * Execute proactive bottleneck prevention
     */
    executeBottleneckPrevention(prediction: BottleneckPrediction): Promise<void>;
    /**
     * Perform capacity forecasting
     */
    performCapacityForecasting(): Promise<CapacityForecast>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private createDefaultSeverityThresholds;
    private startRealTimeDetection;
    private startPredictiveModeling;
    private startResolutionMonitoring;
    private registerEventHandlers;
    private initializePredictionModels;
    private loadPerformanceBaselines;
    private detectStageBottlenecks;
    private detectSystemBottlenecks;
    private rankBottlenecksBySeverity;
    private severityToNumber;
    private calculateWIPUtilization;
    private calculateCycleTimeIncrease;
    private calculateThroughputReduction;
    private calculateQueueLength;
    private calculateBottleneckDuration;
    private calculateImpactRadius;
    private meetsSeverityCriteria;
    private assessSystemHealth;
    private generateBottleneckRecommendations;
    private performBottleneckRiskAssessment;
    private calculatePerformanceImpact;
    private shouldTriggerAutomaticResolution;
    private initializeResolutionProgress;
    private initializeResolutionMetrics;
    private executeImmediateReliefStrategy;
    private executeShortTermFixStrategy;
    private executeLongTermSolutionStrategy;
    private executeWorkaroundStrategy;
    private executeEscalationStrategy;
    private executePreventionStrategy;
    private handleResolutionFailure;
    private createResourceReallocationGate;
    private reallocateResources;
    private monitorReallocationImpact;
    private validateRedistributionPlan;
    private redistributeWorkload;
    private updateFlowStateAfterRedistribution;
    private predictStageBottlenecks;
    private predictSystemBottlenecks;
    private selectOptimalPreventionStrategy;
    private executePreventionAction;
    private setupEarlyWarningMonitoring;
    private getCurrentCapacityMetrics;
    private getHistoricalCapacityTrends;
    private predictWorkloadDemand;
    private identifyCapacityGaps;
    private generateCapacityRecommendations;
    private calculateForecastConfidence;
    private completeActiveResolutions;
    private monitorActiveResolutions;
    private handleFlowStateUpdate;
    private handleWIPViolation;
    private handlePerformanceDegradation;
}
export interface WorkloadRedistributionPlan {
    readonly planId: string;
    readonly overloadedStage: FlowStage;
    readonly targets: RedistributionTarget[];
    readonly totalWorkItems: number;
    readonly estimatedImpact: ImpactMeasurement;
    readonly timeline: number;
}
export interface RedistributionTarget {
    readonly stage: FlowStage;
    readonly workItems: string[];
    readonly capacity: number;
    readonly priority: number;
}
export interface ImpactMeasurement {
    readonly throughputChange: number;
    readonly cycleTimeChange: number;
    readonly qualityChange: number;
    readonly costChange: number;
    readonly valueDeliveryChange: number;
}
export interface CapacityForecast {
    readonly forecastId: string;
    readonly timestamp: Date;
    readonly timeHorizon: number;
    readonly currentCapacity: any;
    readonly predictedDemand: any;
    readonly capacityGaps: any[];
    readonly recommendations: any[];
    readonly confidence: number;
}
export default BottleneckDetectionEngine;
export type { BottleneckDetectionEngineConfig, DetectedBottleneck, BottleneckPrediction, BottleneckDetectionResult, ResolutionStrategy, BottleneckDetectionEngineState, };
//# sourceMappingURL=bottleneck-detector.d.ts.map