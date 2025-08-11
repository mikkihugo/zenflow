/**
 * @file Continuous Delivery Pipeline - Phase 3, Day 13 (Task 12.2)
 *
 * Maps SPARC phases to CD pipeline stages, adds automated quality gates and checkpoints,
 * implements deployment and release automation, and creates pipeline performance monitoring.
 * Integrates with SAFe value streams and multi-level orchestration.
 *
 * ARCHITECTURE:
 * - SPARC to CD pipeline stage mapping
 * - Automated quality gates and checkpoints
 * - Deployment and release automation
 * - Pipeline performance monitoring and metrics
 * - Integration with Value Stream Mapper and SwarmExecutionOrchestrator
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { SwarmExecutionOrchestrator } from '../orchestration/swarm-execution-orchestrator.ts';
import type { ValueStreamMapper } from './value-stream-mapper.ts';
/**
 * Continuous Delivery Pipeline configuration
 */
export interface CDPipelineConfig {
    readonly enableSPARCIntegration: boolean;
    readonly enableAutomatedGates: boolean;
    readonly enableDeploymentAutomation: boolean;
    readonly enablePerformanceMonitoring: boolean;
    readonly enableValueStreamIntegration: boolean;
    readonly pipelineTimeout: number;
    readonly stageTimeout: number;
    readonly qualityGateTimeout: number;
    readonly deploymentTimeout: number;
    readonly monitoringInterval: number;
    readonly maxConcurrentPipelines: number;
    readonly retryAttempts: number;
}
/**
 * CD Pipeline stages mapped from SPARC phases
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
 * SPARC phase mapping
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
 * Quality gate criterion
 */
export interface QualityGateCriterion {
    readonly metric: string;
    readonly operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
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
 * Automation trigger
 */
export interface AutomationTrigger {
    readonly event: 'stage_start' | 'stage_complete' | 'gate_pass' | 'gate_fail' | 'manual';
    readonly conditions: string[];
    readonly delay: number;
}
/**
 * Automation action
 */
export interface AutomationAction {
    readonly type: 'command' | 'api_call' | 'notification' | 'gate_check' | 'deployment';
    readonly configuration: any;
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
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly environment: 'development' | 'staging' | 'production';
    readonly metadata: Record<string, any>;
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
 * Quality gate result
 */
export interface QualityGateResult {
    readonly gateId: string;
    readonly status: 'pass' | 'fail' | 'warning' | 'pending';
    readonly score: number;
    readonly criterionResults: CriterionResult[];
    readonly executionTime: number;
    readonly message: string;
    readonly recommendations: string[];
    readonly timestamp: Date;
}
/**
 * Quality gate criterion result
 */
export interface CriterionResult {
    readonly metric: string;
    readonly actualValue: number;
    readonly threshold: number;
    readonly passed: boolean;
    readonly weight: number;
    readonly contribution: number;
}
/**
 * Pipeline artifact
 */
export interface PipelineArtifact {
    readonly id: string;
    readonly name: string;
    readonly type: 'binary' | 'report' | 'log' | 'configuration' | 'documentation';
    readonly location: string;
    readonly size: number;
    readonly checksum: string;
    readonly createdAt: Date;
    readonly metadata: Record<string, any>;
}
/**
 * Pipeline performance metrics
 */
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
/**
 * Pipeline bottleneck
 */
export interface PipelineBottleneck {
    readonly stageId: string;
    readonly stageName: string;
    readonly averageDuration: number;
    readonly impact: number;
    readonly frequency: number;
    readonly recommendedActions: string[];
}
/**
 * Metric trend
 */
export interface MetricTrend {
    readonly metric: string;
    readonly direction: 'improving' | 'stable' | 'degrading';
    readonly change: number;
    readonly period: string;
    readonly significance: 'low' | 'medium' | 'high';
}
/**
 * CD Pipeline Manager state
 */
export interface CDPipelineState {
    readonly pipelineTemplates: Map<string, CDPipelineStage[]>;
    readonly activePipelines: Map<string, PipelineExecution>;
    readonly qualityGateTemplates: Map<string, QualityGate>;
    readonly automationTemplates: Map<string, StageAutomation>;
    readonly performanceMetrics: Map<string, PipelineMetrics>;
    readonly historicalExecutions: PipelineExecution[];
    readonly lastCleanup: Date;
}
/**
 * Continuous Delivery Pipeline Manager - SPARC integration with CD automation
 */
export declare class ContinuousDeliveryPipelineManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly swarmOrchestrator;
    private readonly valueStreamMapper;
    private readonly config;
    private state;
    private monitoringTimer?;
    private cleanupTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, swarmOrchestrator: SwarmExecutionOrchestrator, valueStreamMapper: ValueStreamMapper, config?: Partial<CDPipelineConfig>);
    /**
     * Initialize the CD Pipeline Manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the CD Pipeline Manager
     */
    shutdown(): Promise<void>;
    /**
     * Map SPARC phases to CD pipeline stages
     */
    mapSPARCToPipelineStages(): Promise<Map<string, CDPipelineStage[]>>;
    /**
     * Execute pipeline for SPARC project
     */
    executePipelineForSPARCProject(sparcProjectId: string, featureId: string, valueStreamId: string, pipelineType?: string): Promise<string>;
    /**
     * Add automated quality gates and checkpoints
     */
    createAutomatedQualityGates(): Promise<Map<string, QualityGate>>;
    /**
     * Execute quality gate
     */
    executeQualityGate(gateId: string, pipelineId: string, stageId: string): Promise<QualityGateResult>;
    /**
     * Implement deployment and release automation
     */
    executeDeploymentAutomation(pipelineId: string, environment: string, artifacts: PipelineArtifact[]): Promise<void>;
    /**
     * Create pipeline performance monitoring
     */
    monitorPipelinePerformance(): Promise<void>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private initializePipelineTemplates;
    private initializeQualityGateTemplates;
    private startPerformanceMonitoring;
    private startPeriodicCleanup;
    private registerEventHandlers;
    private createStandardPipelineFromSPARC;
    private createMicroservicePipelineFromSPARC;
    private createLibraryPipelineFromSPARC;
    private initializePipelineMetrics;
    private executePipelineAsync;
    private createCodeQualityGate;
    private createTestCoverageGate;
    private createSecurityGate;
    private createPerformanceGate;
    private createArchitectureComplianceGate;
    private executeCriterion;
    private generateGateResultMessage;
    private generateGateRecommendations;
    private validateDeploymentReadiness;
    private executeDeploymentSteps;
    private verifyDeploymentSuccess;
    private updateValueStreamDeploymentMetrics;
    private executeRollback;
    private calculatePipelineMetrics;
    private checkPerformanceAlerts;
    private analyzePipelineTrends;
    private updateValueStreamPipelineMetrics;
    private cancelActivePipelines;
    private cleanupCompletedPipelines;
    private handleSPARCProjectCompletion;
    private handleFeatureDeploymentRequest;
}
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
    readonly value: any;
}
export interface AutomationResult {
    readonly automationId: string;
    readonly status: 'success' | 'failure' | 'skipped';
    readonly startTime: Date;
    readonly endTime: Date;
    readonly output: string;
    readonly errors: string[];
}
export interface PipelineError {
    readonly stage: string;
    readonly type: 'validation' | 'execution' | 'timeout' | 'system';
    readonly message: string;
    readonly details: any;
    readonly timestamp: Date;
    readonly recoverable: boolean;
}
export default ContinuousDeliveryPipelineManager;
export type { CDPipelineConfig, CDPipelineStage, QualityGate, QualityGateCriterion, StageAutomation, PipelineExecutionContext, PipelineExecution, QualityGateResult, PipelineMetrics, CDPipelineState, RetryPolicy, RollbackPolicy, };
//# sourceMappingURL=continuous-delivery-pipeline.d.ts.map