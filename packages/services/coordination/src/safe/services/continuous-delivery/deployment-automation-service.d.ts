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
id: string;

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
')met' | ' not_met' | ' timeout';
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
id: string;

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
id: string;

}
/**
* Performance test
*/
export interface PerformanceTest {
id: string;

}
/**
* Performance threshold
*/
export interface PerformanceThreshold {
readonly metric: string;
readonly operator: 'lt| lte| gt' | ' gte';
readonly value: number;
readonly percentile?: number;

}
/**
* Security test
*/
export interface SecurityTest {
id: string;

}
/**
* Business validation
*/
export interface BusinessValidation {
id: string;

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
readonly strategy: 'immediate' | ' gradual' | ' scheduled';
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
readonly operator: 'lt| lte| gt' | ' gte';
readonly required: boolean;

}
/**
* Approval gate
*/
export interface ApprovalGate {
id: string;

}
/**
* Supporting interfaces
*/
export interface StorageConfig {
readonly type: 'ebs| efs| gcs' | ' azure_disk';
readonly size: number;
readonly iops?: number;
readonly encrypted: boolean;

}
export interface LoadBalancerConfig {
readonly type: 'application' | ' network' | ' classic';
readonly scheme: 'internet-facing' | ' internal';
readonly targetGroups: TargetGroup[];

}
export interface TargetGroup {
readonly name: string;
readonly port: number;
readonly protocol: 'HTTP| HTTPS| TCP' | ' TLS';
readonly healthCheck: HealthCheck;

}
export interface IngressRule {
readonly port: number;
readonly protocol: 'tcp' | ' udp' | ' icmp';
readonly source: string;
readonly description?: string;

}
export interface EgressRule {
readonly port: number;
readonly protocol: 'tcp' | ' udp' | ' icmp';
readonly destination: string;
readonly description?: string;

}
export interface NetworkPolicy {
readonly name: string;
readonly rules: PolicyRule[];

}
export interface PolicyRule {
readonly action: 'allow' | ' deny';
readonly protocol: 'tcp' | ' udp' | ' icmp';
readonly port?: number;
';: any;
readonly source?: string;
readonly destination?: string;

}
export interface NotificationPlan {
readonly channels: NotificationChannel[];
readonly triggers: NotificationTrigger[];
readonly templates: NotificationTemplate[];

}
export interface NotificationChannel {
readonly type: 'email| slack| teams' | ' webhook';
readonly configuration: Record<string, unknown>;
';: any;
readonly recipients: string[];

}
export interface NotificationTrigger {
readonly event: deployment_start | deployment_success | deployment_failure | 'rollback';
readonly channels: string[];
readonly conditions?: Record<string, unknown>;

}
export interface NotificationTemplate {
id: string;

}
export interface DeploymentLog {
readonly timestamp: Date;
readonly level: 'debug| info| warn' | ' error';
readonly message: string;
readonly source: string;
readonly metadata?: Record<string, unknown>;

}
export interface DeploymentError {
readonly timestamp: Date;
readonly phase: string;
readonly action?: string;
readonly type: 'validation| execution| timeout' | ' system';
readonly message: string;
readonly details: unknown;
readonly recoverable: boolean;
readonly suggested_action?: string;

}
/**
* Deployment Automation Service - Automated deployment and release management
*
* Provides comprehensive deployment automation with intelligent strategies, rollback capabilities,
* environment management, and AI-powered deployment optimization.
*/
export declare class DeploymentAutomationService {
private readonly logger;
private environments;
private activeDeployments;
private deploymentHistory;
constructor(logger: logger);

}
//# sourceMappingURL=deployment-automation-service.d.ts.map