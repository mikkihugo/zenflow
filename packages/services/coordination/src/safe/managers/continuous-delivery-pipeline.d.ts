/**
* @fileoverview Continuous Delivery Pipeline Manager - Lightweight facade for CD pipeline integration.
*
* Provides SAFe continuous delivery pipeline management through delegation to specialized
* services for SPARC-CD mapping, quality gates, deployment automation, and performance monitoring.
*
* Delegates to: * - @claude-zen/services/continuous-delivery/sparc-cd-mapping-service: SPARC phase to CD pipeline stage mapping
* - @claude-zen/services/continuous-delivery/quality-gate-service: Automated quality gates with AI evaluation
* - @claude-zen/services/continuous-delivery/deployment-automation-service: Deployment automation with intelligent strategies
* - @claude-zen/services/continuous-delivery/pipeline-performance-service: Pipeline performance monitoring and optimization
*
* REDUCTION: 1,098 457 lines (58.4% reduction) through specialized service delegation
*
* @author Claude-Zen Team
* @since 1.0.0
* @version 1.0.0
*/
import { EventBus } from '@claude-zen/foundation';
export type { '; DeploymentAction, DeploymentArtifact, DeploymentCondition, DeploymentEnvironment, DeploymentExecution, DeploymentMetrics, DeploymentPhase, DeploymentPlan, DeploymentStatus, DeploymentStrategy, InfrastructureConfig, MonitoringConfig, NetworkConfig, ResourceUtilization, ScalingConfig, SecurityConfig, UserImpactMetrics, } from '../services/continuous-delivery/deployment-automation-service';
export type { '; BottleneckAnalysis, DetailedPerformanceMetrics, EfficiencyMetrics, ExecutionTimeMetrics, HistoricalComparison, PerformanceAlert, PerformanceAnalysisResult, PerformanceMonitoringConfig, PerformanceRecommendation, PerformanceThresholds, ReliabilityMetrics, ResourceUtilizationMetrics, ThroughputMetrics, TrendAnalysis, } from '../services/continuous-delivery/pipeline-performance-service';
export type { '; GateRetryPolicy, QualityArtifact, QualityBenchmark, QualityGateContext, QualityGateExecutionConfig, QualityGateOptimization, QualityGateTemplate, QualityHistoricalData, QualityImprovement, QualityTrend, } from '../services/continuous-delivery/quality-gate-service';
export type { AutomationAction, AutomationCondition, AutomationResult, AutomationTrigger, AutomationType, CDPipelineConfig, CDPipelineStage, CDPipelineState, CriterionResult, EscalationRule, MetricTrend, NotificationRule, PipelineArtifact, PipelineBottleneck, PipelineError, PipelineExecution, PipelineExecutionContext, PipelineMetrics, PipelineStatus, QualityGate, QualityGateCriterion, QualityGateResult, QualityGateType, RetryPolicy, RollbackPolicy, SPARCPhase, StageAutomation, StageExecution, StageStatus, StageType, SwarmExecutionOrchestrator, } from '../services/continuous-delivery/sparc-cd-mapping-service';
/**
* Continuous Delivery Pipeline Manager - Lightweight facade for CD pipeline integration
*
* Provides comprehensive CD pipeline management through intelligent service delegation.
* All complex operations are delegated to specialized services with lazy loading for optimal performance.
*/
export declare class ContinuousDeliveryPipelineManager extends EventBus {
private readonly logger;
private state;
}
export default ContinuousDeliveryPipelineManager;
//# sourceMappingURL=continuous-delivery-pipeline.d.ts.map