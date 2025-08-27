/**
 * @fileoverview Deployment Automation Service - Automated deployment and release management.
 *
 * Provides specialized deployment automation with intelligent release strategies,
 * rollback capabilities, environment management, and comprehensive deployment monitoring.
 *
 * Integrates with:
 * - @claude-zen/brain: LoadBalancer for intelligent deployment strategies
 * - @claude-zen/brain: BrainCoordinator for deployment decision making
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/agui: Human-in-loop approvals for production deployments
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
export type { AutomationResult, PipelineArtifact, PipelineExecution, RetryPolicy, RollbackPolicy, } from './sparc-cd-mapping-service';
/**
 * Deployment strategy types
 */
export declare enum DeploymentStrategy {
    BLUE_GREEN = "blue_green",
    CANARY = "canary",
    ROLLING = "rolling",
    RECREATE = "recreate",
    A_B_TESTING = "a_b_testing"
}
/**
 * Deployment environment configuration
 */
export interface DeploymentEnvironment {
    readonly id: string;
    readonly name: string;
    readonly type: 'development' | 'staging' | 'production';
    readonly region: string;
    readonly infrastructure: InfrastructureConfig;
    readonly securityConfig: SecurityConfig;
    readonly monitoringConfig: MonitoringConfig;
    readonly scalingConfig: ScalingConfig;
    readonly approvalRequired: boolean;
    readonly rollbackEnabled: boolean;
}
/**
 * Infrastructure configuration
 */
export interface InfrastructureConfig {
    readonly provider: 'aws|gcp|azure|kubernetes|docker;;
    readonly region: string;
    readonly availabilityZones: string[];
    readonly instanceTypes: string[];
    readonly networking: NetworkConfig;
    readonly storage: StorageConfig;
    readonly loadBalancer: LoadBalancerConfig;
}
/**
 * Network configuration
 */
export interface NetworkConfig {
    readonly vpcId?: string;
    readonly subnetIds: string[];
    readonly securityGroups: string[];
    readonly ingressRules: IngressRule[];
    readonly egressRules: EgressRule[];
}
/**
 * Security configuration
 */
export interface SecurityConfig {
    readonly encryptionEnabled: boolean;
    readonly certificateArn?: string;
    readonly iamRoles: string[];
    readonly secretsManager: boolean;
    readonly networkPolicies: NetworkPolicy[];
}
/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
    readonly metricsEnabled: boolean;
    readonly loggingEnabled: boolean;
    readonly alertingEnabled: boolean;
    readonly healthCheckEndpoint: string;
    readonly healthCheckInterval: number;
    readonly healthCheckTimeout: number;
}
/**
 * Scaling configuration
 */
export interface ScalingConfig {
    readonly autoScalingEnabled: boolean;
    readonly minInstances: number;
    readonly maxInstances: number;
    readonly targetCpuUtilization: number;
    readonly targetMemoryUtilization: number;
    readonly scaleUpCooldown: number;
    readonly scaleDownCooldown: number;
}
/**
 * Deployment plan
 */
export interface DeploymentPlan {
    readonly id: string;
    readonly pipelineId: string;
    readonly strategy: DeploymentStrategy;
    readonly environment: DeploymentEnvironment;
    readonly artifacts: DeploymentArtifact[];
    readonly phases: DeploymentPhase[];
    readonly rollbackPlan: RollbackPlan;
    readonly validation: ValidationPlan;
    readonly notifications: NotificationPlan;
    readonly createdAt: Date;
    readonly scheduledAt?: Date;
}
/**
 * Deployment artifact
 */
export interface DeploymentArtifact {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly type: application | configuration | database | 'infrastructure;;
    readonly location: string;
    readonly size: number;
    readonly checksum: string;
    readonly dependencies: string[];
    readonly metadata: Record<string, unknown>;
}
/**
 * Deployment phase
 */
export interface DeploymentPhase {
    readonly id: string;
    readonly name: string;
    readonly order: number;
    readonly type: pre;
}
/**
 * Deployment action
 */
export interface DeploymentAction {
    readonly id: string;
    readonly type: script | api_call | infrastructure | configuration | 'validation;;
    readonly name: string;
    readonly command?: string;
    readonly parameters: Record<string, unknown>;
    readonly timeout: number;
    readonly continueOnFailure: boolean;
    readonly rollbackAction?: DeploymentAction;
}
/**
 * Deployment condition
 */
export interface DeploymentCondition {
    readonly id: string;
    readonly type: health_check | metric_threshold | manual_approval | 'time_gate;;
    readonly description: string;
    readonly parameters: Record<string, unknown>;
    readonly timeout: number;
    readonly required: boolean;
}
/**
 * Deployment execution
 */
export interface DeploymentExecution {
    readonly planId: string;
    readonly status: DeploymentStatus;
    readonly currentPhase?: string;
    readonly phases: PhaseExecution[];
    readonly metrics: DeploymentMetrics;
    readonly logs: DeploymentLog[];
    readonly errors: DeploymentError[];
    readonly startTime: Date;
    readonly endTime?: Date;
    readonly duration?: number;
}
/**
 * Deployment status
 */
export declare enum DeploymentStatus {
    PENDING = "pending",
    RUNNING = "running",
    SUCCESS = "success",
    FAILED = "failed",
    ROLLED_BACK = "rolled_back",
    CANCELLED = "cancelled"
}
/**
 * Phase execution
 */
export interface PhaseExecution {
    readonly phaseId: string;
    readonly status: DeploymentStatus;
    readonly actions: ActionExecution[];
    readonly conditions: ConditionExecution[];
    readonly startTime?: Date;
    readonly endTime?: Date;
    readonly duration?: number;
}
/**
 * Action execution
 */
export interface ActionExecution {
    readonly actionId: string;
    readonly status: DeploymentStatus;
    readonly output: string;
    readonly exitCode?: number;
    readonly startTime: Date;
    readonly endTime?: Date;
    readonly duration?: number;
}
/**
 * Condition execution
 */
export interface ConditionExecution {
    readonly conditionId: string;
    readonly status: 'met' | 'not_met' | 'timeout';
    readonly result: unknown;
    readonly message: string;
    readonly evaluatedAt: Date;
}
/**
 * Deployment metrics
 */
export interface DeploymentMetrics {
    readonly deploymentTime: number;
    readonly rollbackTime?: number;
    readonly healthScore: number;
    readonly performanceImpact: number;
    readonly errorRate: number;
    readonly successRate: number;
    readonly resourceUtilization: ResourceUtilization;
    readonly userImpactMetrics: UserImpactMetrics;
}
/**
 * Resource utilization
 */
export interface ResourceUtilization {
    readonly cpu: number;
    readonly memory: number;
    readonly disk: number;
    readonly network: number;
    readonly cost: number;
}
/**
 * User impact metrics
 */
export interface UserImpactMetrics {
    readonly responseTime: number;
    readonly availability: number;
    readonly errorCount: number;
    readonly userSessions: number;
    readonly businessMetrics: Record<string, number>;
}
/**
 * Rollback plan
 */
export interface RollbackPlan {
    readonly enabled: boolean;
    readonly automatic: boolean;
    readonly triggers: RollbackTrigger[];
    readonly actions: DeploymentAction[];
    readonly timeout: number;
    readonly healthCheckRequired: boolean;
}
/**
 * Rollback trigger
 */
export interface RollbackTrigger {
    readonly id: string;
    readonly type: health_check_failure | metric_threshold | error_rate | 'manual;;
    readonly description: string;
    readonly conditions: Record<string, unknown>;
    readonly delay: number;
}
/**
 * Validation plan
 */
export interface ValidationPlan {
    readonly healthChecks: HealthCheck[];
    readonly performanceTests: PerformanceTest[];
    readonly securityTests: SecurityTest[];
    readonly businessValidations: BusinessValidation[];
    readonly rolloutValidation: RolloutValidation;
}
/**
 * Health check
 */
export interface HealthCheck {
    readonly id: string;
    readonly name: string;
    readonly type: 'http|tcp|database|custom;;
    readonly endpoint: string;
    readonly expectedResponse: unknown;
    readonly timeout: number;
    readonly interval: number;
    readonly retries: number;
}
/**
 * Performance test
 */
export interface PerformanceTest {
    readonly id: string;
    readonly name: string;
    readonly type: 'load|stress|spike|volume;;
    readonly configuration: Record<string, unknown>;
    readonly thresholds: PerformanceThreshold[];
    readonly duration: number;
}
/**
 * Performance threshold
 */
export interface PerformanceThreshold {
    readonly metric: string;
    readonly operator: 'lt|lte|gt|gte;;
    readonly value: number;
    readonly percentile?: number;
}
/**
 * Security test
 */
export interface SecurityTest {
    readonly id: string;
    readonly name: string;
    readonly type: 'vulnerability_scan' | 'penetration_test' | 'compliance_check';
    readonly configuration: Record<string, unknown>;
    readonly severity: 'low|medium|high|critical;;
}
/**
 * Business validation
 */
export interface BusinessValidation {
    readonly id: string;
    readonly name: string;
    readonly type: feature_toggle | a_b_test | canary_metrics | 'user_acceptance;;
    readonly criteria: BusinessCriteria[];
    readonly timeout: number;
}
/**
 * Business criteria
 */
export interface BusinessCriteria {
    readonly metric: string;
    readonly target: number;
    readonly tolerance: number;
    readonly measurement: string;
}
/**
 * Rollout validation
 */
export interface RolloutValidation {
    readonly strategy: 'immediate' | 'gradual' | 'scheduled';
    readonly phases: RolloutPhase[];
    readonly approvals: ApprovalGate[];
    readonly monitoringPeriod: number;
}
/**
 * Rollout phase
 */
export interface RolloutPhase {
    readonly name: string;
    readonly percentage: number;
    readonly duration: number;
    readonly criteria: RolloutCriteria[];
}
/**
 * Rollout criteria
 */
export interface RolloutCriteria {
    readonly metric: string;
    readonly threshold: number;
    readonly operator: 'lt|lte|gt|gte;;
    readonly required: boolean;
}
/**
 * Approval gate
 */
export interface ApprovalGate {
    readonly id: string;
    readonly name: string;
    readonly approvers: string[];
    readonly timeout: number;
    readonly required: boolean;
    readonly criteria: string[];
}
/**
 * Supporting interfaces
 */
export interface StorageConfig {
    readonly type: 'ebs|efs|gcs|azure_disk;;
    readonly size: number;
    readonly iops?: number;
    readonly encrypted: boolean;
}
export interface LoadBalancerConfig {
    readonly type: 'application' | 'network' | 'classic';
    readonly scheme: 'internet-facing|internal;;
    readonly targetGroups: TargetGroup[];
}
export interface TargetGroup {
    readonly name: string;
    readonly port: number;
    readonly protocol: 'HTTP|HTTPS|TCP|TLS;;
    readonly healthCheck: HealthCheck;
}
export interface IngressRule {
    readonly port: number;
    readonly protocol: 'tcp' | 'udp' | 'icmp';
    readonly source: string;
    readonly description?: string;
}
export interface EgressRule {
    readonly port: number;
    readonly protocol: 'tcp' | 'udp' | 'icmp';
    readonly destination: string;
    readonly description?: string;
}
export interface NetworkPolicy {
    readonly name: string;
    readonly rules: PolicyRule[];
}
export interface PolicyRule {
    readonly action: 'allow|deny;;
    readonly protocol: 'tcp' | 'udp' | 'icmp';
    readonly port?: number;
    readonly source?: string;
    readonly destination?: string;
}
export interface NotificationPlan {
    readonly channels: NotificationChannel[];
    readonly triggers: NotificationTrigger[];
    readonly templates: NotificationTemplate[];
}
export interface NotificationChannel {
    readonly type: 'email|slack|teams|webhook;;
    readonly configuration: Record<string, unknown>;
    readonly recipients: string[];
}
export interface NotificationTrigger {
    readonly event: deployment_start | deployment_success | deployment_failure | 'rollback;;
    readonly channels: string[];
    readonly conditions?: Record<string, unknown>;
}
export interface NotificationTemplate {
    readonly id: string;
    readonly name: string;
    readonly subject: string;
    readonly body: string;
    readonly format: 'text' | 'html' | 'markdown';
}
export interface DeploymentLog {
    readonly timestamp: Date;
    readonly level: 'debug|info|warn|error;;
    readonly message: string;
    readonly source: string;
    readonly metadata?: Record<string, unknown>;
}
export interface DeploymentError {
    readonly timestamp: Date;
    readonly phase: string;
    readonly action?: string;
    readonly type: 'validation|execution|timeout|system;;
    readonly message: string;
    readonly details: unknown;
    readonly recoverable: boolean;
    readonly suggested_action?: string;
}
import type { PipelineArtifact } from './sparc-cd-mapping-service';
/**
 * Deployment Automation Service - Automated deployment and release management
 *
 * Provides comprehensive deployment automation with intelligent strategies, rollback capabilities,
 * environment management, and AI-powered deployment optimization.
 */
export declare class DeploymentAutomationService {
    private readonly logger;
    private loadBalancer?;
    private brainCoordinator?;
    private performanceTracker?;
    private initialized;
    private environments;
    private activeDeployments;
    private deploymentHistory;
    constructor(logger: Logger);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Execute deployment automation with intelligent strategy selection
     */
    executeDeploymentAutomation(pipelineId: string, environment: string, artifacts: PipelineArtifact[]): Promise<void>;
    /**
     * Execute rollback with intelligent recovery strategy
     */
    executeRollback(executionId: string, _reason: string): Promise<void>;
    private createDeploymentPhases;
    private createRollbackPlan;
}
export default DeploymentAutomationService;
//# sourceMappingURL=deployment-automation-service.d.ts.map