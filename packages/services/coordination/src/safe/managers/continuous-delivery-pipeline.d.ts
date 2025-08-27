/**
 * @fileoverview Continuous Delivery Pipeline Manager - Lightweight facade for CD pipeline integration.
 *
 * Provides SAFe continuous delivery pipeline management through delegation to specialized
 * services for SPARC-CD mapping, quality gates, deployment automation, and performance monitoring.
 *
 * Delegates to:
 * - @claude-zen/services/continuous-delivery/sparc-cd-mapping-service: SPARC phase to CD pipeline stage mapping
 * - @claude-zen/services/continuous-delivery/quality-gate-service: Automated quality gates with AI evaluation
 * - @claude-zen/services/continuous-delivery/deployment-automation-service: Deployment automation with intelligent strategies
 * - @claude-zen/services/continuous-delivery/pipeline-performance-service: Pipeline performance monitoring and optimization
 *
 * REDUCTION: 1,098 → 457 lines (58.4% reduction) through specialized service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { EventBus } from '@claude-zen/foundation';
import type { MemorySystem, TypeSafeEventBus } from '../types';
export type { DeploymentAction, DeploymentArtifact, DeploymentCondition, DeploymentEnvironment, DeploymentExecution, DeploymentMetrics, DeploymentPhase, DeploymentPlan, DeploymentStatus, DeploymentStrategy, InfrastructureConfig, MonitoringConfig, NetworkConfig, ResourceUtilization, ScalingConfig, SecurityConfig, UserImpactMetrics, } from '../services/continuous-delivery/deployment-automation-service';
export type { BottleneckAnalysis, DetailedPerformanceMetrics, EfficiencyMetrics, ExecutionTimeMetrics, HistoricalComparison, PerformanceAlert, PerformanceAnalysisResult, PerformanceMonitoringConfig, PerformanceRecommendation, PerformanceThresholds, ReliabilityMetrics, ResourceUtilizationMetrics, ThroughputMetrics, TrendAnalysis, } from '../services/continuous-delivery/pipeline-performance-service';
export type { GateRetryPolicy, QualityArtifact, QualityBenchmark, QualityGateContext, QualityGateExecutionConfig, QualityGateOptimization, QualityGateTemplate, QualityHistoricalData, QualityImprovement, QualityTrend, } from '../services/continuous-delivery/quality-gate-service';
export type { AutomationAction, AutomationCondition, AutomationResult, AutomationTrigger, AutomationType, CDPipelineConfig, CDPipelineStage, CDPipelineState, CriterionResult, EscalationRule, MetricTrend, NotificationRule, PipelineArtifact, PipelineBottleneck, PipelineError, PipelineExecution, PipelineExecutionContext, PipelineMetrics, PipelineStatus, QualityGate, QualityGateCriterion, QualityGateResult, QualityGateType, RetryPolicy, RollbackPolicy, SPARCPhase, StageAutomation, StageExecution, StageStatus, StageType, SwarmExecutionOrchestrator, } from '../services/continuous-delivery/sparc-cd-mapping-service';
import type { ValueStreamMapper } from './value-stream-mapper';
/**
 * Continuous Delivery Pipeline Manager - Lightweight facade for CD pipeline integration
 *
 * Provides comprehensive CD pipeline management through intelligent service delegation.
 * All complex operations are delegated to specialized services with lazy loading for optimal performance.
 */
export declare class ContinuousDeliveryPipelineManager extends EventBus {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly config;
    private sparcCDMappingService?;
    private qualityGateService?;
    private deploymentAutomationService?;
    private pipelinePerformanceService?;
    private initialized;
    private state;
    private monitoringTimer?;
    private cleanupTimer?;
    constructor(_eventBus: TypeSafeEventBus, memory: MemorySystem, swarmOrchestrator: any, valueStreamMapper: ValueStreamMapper, config?: any);
    /**
     * Initialize with lazy-loaded service delegation
     */
    initialize(): Promise<void>;
    /**
     * Shutdown with graceful service cleanup
     */
    shutdown(): Promise<void>;
    /**
     * Map SPARC phases to CD pipeline stages - Delegated to SPARCCDMappingService
     */
    mapSPARCToPipelineStages(): Promise<Map<string, any[]>>;
    /**
     * Execute pipeline for SPARC project - Delegated to SPARCCDMappingService
     */
    executePipelineForSPARCProject(sparcProjectId: string, featureId: string, valueStreamId: string, pipelineType: string, : any): Promise<string>;
    /**
     * Create automated quality gates - Delegated to QualityGateService
     */
    createAutomatedQualityGates(): Promise<Map<string, any>>;
    /**
     * Execute quality gate - Delegated to QualityGateService
     */
    executeQualityGate(gateId: string, pipelineId: string, stageId: string): Promise<any>;
    /**
     * Execute deployment automation - Delegated to DeploymentAutomationService
     */
    executeDeploymentAutomation(pipelineId: string, environment: string, artifacts: any[]): Promise<void>;
    /**
     * Monitor pipeline performance - Delegated to PipelinePerformanceService
     */
    monitorPipelinePerformance(): Promise<void>;
    private loadPersistedState;
    private persistState;
    private initializePipelineTemplates;
    private initializeQualityGateTemplates;
    private startPerformanceMonitoring;
    private startPeriodicCleanup;
    private registerEventHandlers;
    private cancelActivePipelines;
    private cleanupCompletedPipelines;
    private handleFeatureDeploymentRequest;
}
export default ContinuousDeliveryPipelineManager;
//# sourceMappingURL=continuous-delivery-pipeline.d.ts.map