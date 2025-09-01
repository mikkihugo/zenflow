import type { Entity, Priority, Result, Timestamp, UUID, ValidationError } from '@claude-zen/foundation/types';

/**
 * @fileoverview Workflows Domain Types - Process Orchestration Domain
 *
 * Comprehensive type definitions for workflow execution, orchestration, and
 * process management. These types define the core domain model for all
 * workflow operations, execution engines, and process coordination.
 *
 * Domain Independence: Self-contained workflow domain types.
 *
 * @package @claude-zen/workflows
 * @since 2.1.0
 * @version 1.0.0
 */
/**
* Workflow execution states
*/
export declare enum WorkflowStatus {
DRAFT = "draft",
QUEUED = "queued",
RUNNING = "running",
PAUSED = "paused",
COMPLETED = "completed",
FAILED = "failed",
CANCELLED = "cancelled",
TIMEOUT = "timeout",
RETRYING = "retrying"

}
/**
* Step execution states
*/
export declare enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
  RETRYING = 'retrying'
}

/**
 * Workflow execution strategies
 */
export declare enum ExecutionStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional'
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  workflow: number;}
/**
* Resource requirements and limits
*/
export interface ResourceConfig {
limits: ResourceLimits;
requests: ResourceRequests;
constraints: ResourceConstraints;
isolation: IsolationConfig;

}
/**
* Resource limits
*/
export interface ResourceLimits {
cpu: number;
memory: number;
disk: number;
network: number;
duration: number;
files: number;
processes: number;

}
/**
* Resource requests
*/
export interface ResourceRequests {
cpu: number;
memory: number;
disk: number;
priority: Priority;
affinity?: string[];
antiAffinity?: string[];

}
/**
* Resource constraints
*/
export interface ResourceConstraints {
nodeSelector: Record<string, string>;
tolerations: Toleration[];
scheduling: SchedulingConfig;
security: SecurityConstraints;

}
/**
* Schedule information for recurring workflows
*/
export interface ScheduleInfo {
expression: 'success';

}
/**
* Dependency condition specification
*/
export interface DependencyCondition {
expression: string;
variables: string[];
timeout: number;
retryInterval: number;
maxRetries: number;

}
/**
* Execution metrics and performance data
*/
export interface ExecutionMetrics {
duration: number;
stepsTotal: number;
stepsCompleted: number;
stepsFailed: number;
stepsSkipped: number;
retries: number;
resourceUsage: ResourceUsage;
performance: PerformanceMetrics;
costs: CostMetrics;

}
/**
* Resource usage tracking
*/
export interface ResourceUsage {
  cpu: {
    peak: number;
    average: number;
    total: number;
  };
  memory: {
    peak: number;
    average: number;
    total: number;
  };
  disk: {
    read: number;
    write: number;
    storage: number;
  };
  network: {
    in: number;
    out: number;
    requests: number;
  };
}
/**
* Performance metrics
*/
export interface PerformanceMetrics {
throughput: number;
latency: LatencyMetrics;
efficiency: number;
bottlenecks: Bottleneck[];
optimization: OptimizationSuggestions;

}
/**
* Latency measurements
*/
export interface LatencyMetrics {
min: number;
max: number;
mean: number;
median: number;
p95: number;
p99: number;

}
/**
* Step execution metrics
*/
export interface StepMetrics {
duration: number;
retryCount: number;
inputSize: number;
outputSize: number;
resourceUsage: ResourceUsage;
errorCount: number;

}
/**
* Workflow execution log entry
*/
export interface ExecutionLog {
id: 'debug';

}
/**
* Workflow artifacts (files, data, etc.)
*/
export interface WorkflowArtifact extends Entity {
name: 'file';

}
/**
* Data retention policy
*/
export interface RetentionPolicy {
  duration: number;
  deleteAfterExpiration: boolean;
  archiveBeforeDelete: boolean;
  archiveLocation?: string;
}
/**
* Access control policy for artifacts
*/
export interface AccessPolicy {
public: boolean;
users: string[];
roles: string[];
permissions: Permission[];

}
/**
* Workflow template for reusable workflows
*/
export interface WorkflowTemplate extends Omit<Entity, 'version'> {
  name: string;
/**
* Template usage examples
*/
export interface TemplateExample {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  expectedOutput: Record<string, unknown>;
}
/**
* Template documentation
*/
export interface TemplateDocumentation {
overview: string;
prerequisites: string[];
steps: StepDocumentation[];
troubleshooting: TroubleshootingGuide[];
changelog: ChangelogEntry[];

}
/**
* Workflow validation rules
*/
export interface WorkflowValidation {
schema: ValidationSchema;
rules: ValidationRule[];
dependencies: DependencyValidation[];
resources: ResourceValidation;
security: SecurityValidation;

}
/**
* Workflow permissions
*/
export interface WorkflowPermissions {
execute: Permission[];
modify: Permission[];
view: Permission[];
delete: Permission[];
admin: Permission[];

}
/**
* Permission specification
*/
export interface Permission {
type: 'user| role| group' | ' service';
principal: string;
conditions?: PermissionCondition[];
expiry?: Timestamp;

}
/**
* Step validation
*/
export interface StepValidation {
input: InputValidation;
output: OutputValidation;
dependencies: UUID[];
resources: ResourceValidation;
timeout: number;

}
/**
* Input specification and validation
*/
export interface InputSpecification {
schema: ValidationSchema;
required: string[];
optional: string[];
sources: InputSource[];

}
/**
* Output specification
*/
export interface OutputSpecification {
schema: ValidationSchema;
destinations: OutputDestination[];
format: OutputFormat;
compression?: CompressionConfig;

}
/**
* Rollback configuration
*/
export interface RollbackConfig {
enabled: 'compensate';

}
/**
* Workflow checkpoint for recovery
*/
export interface CheckpointConfig {
frequency: CheckpointFrequency;
storage: CheckpointStorage;
compression: boolean;
encryption: boolean;

}
/**
* Compensation actions for rollback
*/
export interface CompensationConfig {
actions: CompensationAction[];
timeout: number;
retries: number;
failureHandling: ErrorStrategy;

}
/**
* Individual compensation action
*/
export interface CompensationAction {
stepId: UUID;
action: string;
parameters: Record<string, unknown>;
condition?: string;
timeout: number;

}
/**
* Workflow engine configuration
*/
export interface WorkflowEngineConfig {
execution: ExecutionConfig;
storage: StorageConfig;
monitoring: MonitoringConfig;
security: SecurityConfig;
performance: PerformanceConfig;
clustering: ClusteringConfig;
enableAdvancedOrchestration?: boolean;

}
/**
* Execution engine configuration
*/
export interface ExecutionConfig {
maxConcurrentWorkflows: number;
maxConcurrentSteps: number;
defaultTimeout: number;
heartbeatInterval: number;
checkpointFrequency: number;
cleanupInterval: number;

}
/**
* Performance tuning configuration
*/
export interface PerformanceConfig {
caching: CachingConfig;
pooling: PoolingConfig;
optimization: OptimizationConfig;
profiling: ProfilingConfig;

}
/**
* Workflow state for persistence
*/
export interface WorkflowState {
executionId: 'read';

}
export type WorkflowEventType = 'workflow.created' | ' workflow.started' | ' workflow.completed' | ' workflow.failed' | ' workflow.cancelled' | ' step.started' | ' step.completed' | ' step.failed' | ' step.retried';
export interface WorkflowMetadata {
tags: string[];
author: string;
created: Timestamp;
modified: Timestamp;
size: number;
complexity: number;

}
export interface MonitoringConfig {
enabled: boolean;
metrics: string[];
alerting: boolean;
thresholds: Record<string, number>;

}
export interface QueueingConfig {
strategy: string;
priority: boolean;

}
export interface ThrottlingConfig {
enabled: boolean;
rate: number;

}
export interface PoolingConfig {
size: number;
timeout: number;

}
export interface EscalationConfig {
levels: string[];
timeout: number;

}
export interface NotificationConfig {
type: string;
recipients: string[];

}
export interface IsolationConfig {
enabled: boolean;
type: string;

}
export interface Toleration {
key: string;
operator: string;
value: string;

}
export interface SchedulingConfig {
strategy: string;
constraints: string[];

}
export interface SecurityConstraints {
runAsUser: number;
capabilities: string[];

}
export interface ResourceRequirement {
cpu: number;
memory: number;

}
export interface Bottleneck {
type: string;
severity: number;
suggestion: string;

}
export interface OptimizationSuggestions {
recommendations: string[];

}
export interface CostMetrics {
compute: number;
storage: number;
network: number;

}
export interface ValidationSchema {
type: string;
properties: Record<string, unknown>;

}
export interface ValidationRule {
field: string;
rule: string;
message: string;

}
export interface DependencyValidation {
type: string;
condition: string;

}
export interface ResourceValidation {
limits: ResourceLimits;

}
export interface SecurityValidation {
permissions: string[];
restrictions: string[];

}
export interface PermissionCondition {
type: string;
value: string;

}
export interface InputValidation {
schema: ValidationSchema;
rules: ValidationRule[];

}
export interface OutputValidation {
schema: ValidationSchema;
rules: ValidationRule[];

}
export interface InputSource {
type: string;
location: string;

}
export interface OutputDestination {
type: string;
location: string;

}
export interface OutputFormat {
type: string;
encoding: string;

}
export interface CompressionConfig {
algorithm: string;
level: number;

}
export interface CheckpointFrequency {
interval: number;
conditions: string[];

}
export interface CheckpointStorage {
type: string;
location: string;

}
export interface StorageConfig {
type: string;
connection: string;

}
export interface SecurityConfig {
authentication: boolean;
authorization: boolean;

}
export interface ClusteringConfig {
enabled: boolean;
nodes: number;

}
export interface CachingConfig {
enabled: boolean;
size: number;

}
export interface OptimizationConfig {
enabled: boolean;
strategies: string[];

}
export interface ProfilingConfig {
enabled: boolean;
sampling: number;

}
export interface TemplateRating {
score: number;
reviews: number;

}
export interface TemplateUsage {
count: number;
lastUsed: Timestamp;

}
export interface ParameterValidation {
rules: ValidationRule[];

}
export interface StepDocumentation {
name: string;
description: string;

}
export interface TroubleshootingGuide {
issue: string;
solution: string;

}
export interface ChangelogEntry {
version: string;
changes: string[];

}
/**
* Result types for workflow-specific operations
*/
export type WorkflowResult<T> = Result<T, WorkflowError>;
export type ExecutionResult = Result<WorkflowExecution, ExecutionError>;
export type StepResult = Result<StepExecution, StepExecutionError>;
/**
* Workflow-specific error types
*/
export interface WorkflowError extends Omit<ValidationError, 'type'> {
';: any;
type: 'WorkflowError';
category: 'execution';
stepId?: UUID;
';: any;
retryable: 'execution';
stepId: UUID;
phase: 'validation| execution| output' | ' cleanup';
recoverable: boolean;

}
declare const _default: {
WorkflowStatus: typeof WorkflowStatus;
StepStatus: typeof StepStatus;
ExecutionStrategy: any;
TriggerType: any;
WorkflowCategory: any;
StepType: any;
BackoffStrategy: any;
ErrorStrategy: any;
DependencyType: any;
LogLevel: any;
ArtifactType: any;
ParameterType: any;
RollbackStrategy: any;
LockType: any;
'};;': string;
'};
export default _default;
//# sourceMappingURL=index.d.ts.map