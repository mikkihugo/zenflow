/**
 * @fileoverview SPARC-CD Mapping Service - Maps SPARC phases to CD pipeline stages.
 *
 * Provides specialized SPARC phase to CD pipeline stage mapping with template generation,
 * stage orchestration, and pipeline execution coordination for scalable continuous delivery.
 *
 * Integrates with:
 * - @claude-zen/workflows: WorkflowEngine for pipeline orchestration
 * - @claude-zen/brain: BrainCoordinator for intelligent stage mapping
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - SPARC methodology for phase-to-stage mapping
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
/**
 * SPARC phase enumeration
 */
export declare enum SPARCPhase {
    SPECIFICATION = "specification",
    PSEUDOCODE = "pseudocode",
    ARCHITECTURE = "architecture",
    REFINEMENT = "refinement",
    COMPLETION = "completion"
}
/**
 * CD Pipeline stage types
 */
export declare enum StageType {
    BUILD = "build",
    TEST = "test",
    SECURITY = "security",
    QUALITY = "quality",
    DEPLOY = "deploy",
    MONITOR = "monitor",
    APPROVAL = "approval"
}
/**
 * Quality gate types
 */
export declare enum QualityGateType {
    CODE_QUALITY = "code_quality",
    TEST_COVERAGE = "test_coverage",
    SECURITY_SCAN = "security_scan",
    PERFORMANCE = "performance",
    COMPLIANCE = "compliance",
    ARCHITECTURE = "architecture",
    BUSINESS_VALIDATION = "business_validation"
}
/**
 * Automation types
 */
export declare enum AutomationType {
    BUILD = "build",
    TEST = "test",
    DEPLOY = "deploy",
    NOTIFICATION = "notification",
    APPROVAL = "approval",
    ROLLBACK = "rollback",
    MONITORING = "monitoring"
}
/**
 * Pipeline status
 */
export declare enum PipelineStatus {
    PENDING = "pending",
    RUNNING = "running",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled",
    TIMEOUT = "timeout"
}
/**
 * Stage status
 */
export declare enum StageStatus {
    PENDING = "pending",
    RUNNING = "running",
    SUCCESS = "success",
    FAILED = "failed",
    SKIPPED = "skipped",
    CANCELLED = "cancelled"
}
/**
 * CD Pipeline stage mapped from SPARC phases
 */
export interface CDPipelineStage {
    readonly id: string;
    readonly name: string;
    readonly sparcPhase: SPARCPhase;
    readonly type: StageType;
    readonly order: number;
    readonly parallelizable: boolean;
    readonly qualityGates: QualityGate[];
    readonly automations: StageAutomation[];
    readonly dependencies: string[];
    readonly timeout: number;
    readonly retryPolicy: RetryPolicy;
    readonly rollbackPolicy: RollbackPolicy;
}
/**
 * Quality gate configuration
 */
export interface QualityGate {
    readonly id: string;
    readonly name: string;
    readonly type: QualityGateType;
    readonly criteria: QualityGateCriterion[];
    readonly automated: boolean;
    readonly blocking: boolean;
    readonly timeout: number;
    readonly escalation: EscalationRule[];
    readonly notifications: NotificationRule[];
}
/**
 * Quality gate criterion
 */
export interface QualityGateCriterion {
    readonly metric: string;
    readonly operator: 'gt|gte|lt|lte|eq|neq;;
    readonly threshold: number;
    readonly weight: number;
    readonly critical: boolean;
    readonly description: string;
}
/**
 * Stage automation configuration
 */
export interface StageAutomation {
    readonly id: string;
    readonly name: string;
    readonly type: AutomationType;
    readonly trigger: AutomationTrigger;
    readonly actions: AutomationAction[];
    readonly conditions: AutomationCondition[];
    readonly timeout: number;
    readonly rollbackOnFailure: boolean;
}
/**
 * Automation trigger
 */
export interface AutomationTrigger {
    readonly event: stage_start | stage_complete | gate_pass | gate_fail | 'manual;;
    readonly conditions: string[];
    readonly delay: number;
}
/**
 * Automation action
 */
export interface AutomationAction {
    readonly type: command | api_call | notification | gate_check | 'deployment;;
    readonly configuration: unknown;
    readonly timeout: number;
    readonly retryOnFailure: boolean;
    readonly rollbackOnFailure: boolean;
}
/**
 * Pipeline execution context
 */
export interface PipelineExecutionContext {
    readonly pipelineId: string;
    readonly featureId: string;
    readonly valueStreamId: string;
    readonly sparcProjectId: string;
    readonly initiator: string;
    readonly priority: 'low|medium|high|critical;;
    readonly environment: 'development' | 'staging' | 'production';
    readonly metadata: Record<string, unknown>;
    readonly startTime: Date;
    readonly timeoutAt: Date;
}
/**
 * Pipeline execution state
 */
export interface PipelineExecution {
    readonly context: PipelineExecutionContext;
    readonly status: PipelineStatus;
    readonly currentStage?: string;
    readonly stages: StageExecution[];
    readonly qualityGateResults: QualityGateResult[];
    readonly artifacts: PipelineArtifact[];
    readonly metrics: PipelineMetrics;
    readonly errors: PipelineError[];
    readonly completedAt?: Date;
    readonly duration?: number;
}
/**
 * Stage execution state
 */
export interface StageExecution {
    readonly stageId: string;
    readonly status: StageStatus;
    readonly startTime?: Date;
    readonly endTime?: Date;
    readonly duration?: number;
    readonly automationResults: AutomationResult[];
    readonly qualityGateResults: QualityGateResult[];
    readonly artifacts: string[];
    readonly logs: string[];
    readonly errors: string[];
}
/**
 * Supporting interfaces
 */
export interface RetryPolicy {
    readonly enabled: boolean;
    readonly maxAttempts: number;
    readonly backoffStrategy: 'linear' | 'exponential' | 'fixed';
    readonly baseDelay: number;
    readonly maxDelay: number;
}
export interface RollbackPolicy {
    readonly enabled: boolean;
    readonly automatic: boolean;
    readonly conditions: string[];
    readonly timeout: number;
}
export interface EscalationRule {
    readonly condition: string;
    readonly escalateTo: string[];
    readonly delay: number;
    readonly maxEscalations: number;
}
export interface NotificationRule {
    readonly trigger: string;
    readonly channels: string[];
    readonly recipients: string[];
    readonly template: string;
}
export interface AutomationCondition {
    readonly field: string;
    readonly operator: string;
    readonly value: unknown;
}
export interface AutomationResult {
    readonly automationId: string;
    readonly status: 'success' | 'failure' | 'skipped';
    readonly startTime: Date;
    readonly endTime: Date;
    readonly output: string;
    readonly errors: string[];
}
export interface QualityGateResult {
    readonly gateId: string;
    readonly status: 'pass|fail|warning|pending;;
    readonly score: number;
    readonly criterionResults: CriterionResult[];
    readonly executionTime: number;
    readonly message: string;
    readonly recommendations: string[];
    readonly timestamp: Date;
}
export interface CriterionResult {
    readonly metric: string;
    readonly actualValue: number;
    readonly threshold: number;
    readonly passed: boolean;
    readonly weight: number;
    readonly contribution: number;
}
export interface PipelineArtifact {
    readonly id: string;
    readonly name: string;
    readonly type: binary | report | log | configuration | 'documentation;;
    readonly location: string;
    readonly size: number;
    readonly checksum: string;
    readonly createdAt: Date;
    readonly metadata: Record<string, unknown>;
}
export interface PipelineMetrics {
    readonly totalDuration: number;
    readonly stageDurations: Record<string, number>;
    readonly queueTime: number;
    readonly executionTime: number;
    readonly throughput: number;
    readonly successRate: number;
    readonly failureRate: number;
    readonly averageQualityScore: number;
    readonly bottlenecks: PipelineBottleneck[];
    readonly trends: MetricTrend[];
}
export interface PipelineBottleneck {
    readonly stageId: string;
    readonly stageName: string;
    readonly averageDuration: number;
    readonly impact: number;
    readonly frequency: number;
    readonly recommendedActions: string[];
}
export interface MetricTrend {
    readonly metric: string;
    readonly direction: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | degrading;
    readonly change: number;
    readonly period: string;
    readonly significance: 'low' | 'medium' | 'high';
}
export interface PipelineError {
    readonly stage: string;
    readonly type: 'validation|execution|timeout|system;;
    readonly message: string;
    readonly details: unknown;
    readonly timestamp: Date;
    readonly recoverable: boolean;
}
/**
 * SPARC-CD Mapping Service - Maps SPARC phases to CD pipeline stages
 *
 * Provides intelligent mapping between SPARC methodology phases and continuous delivery
 * pipeline stages with template generation, stage orchestration, and execution coordination.
 */
export declare class SPARCCDMappingService {
    private readonly logger;
    private workflowEngine?;
    private brainCoordinator?;
    private performanceTracker?;
    private initialized;
    constructor(logger: Logger);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Map SPARC phases to CD pipeline stages with intelligent optimization
     */
    mapSPARCToPipelineStages(): Promise<Map<string, CDPipelineStage[]>>;
    /**
     * Execute pipeline for SPARC project with workflow orchestration
     */
    executePipelineForSPARCProject(sparcProjectId: string, featureId: string, valueStreamId: string, pipelineType: string, : any): Promise<string>;
}
//# sourceMappingURL=sparc-cd-mapping-service.d.ts.map