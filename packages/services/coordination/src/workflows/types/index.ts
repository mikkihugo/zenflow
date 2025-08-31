/**
 * @fileoverview Workflows Domain Types - Process Orchestration Domain
 *
 * Comprehensive type definitions for workflow execution, orchestration, and
 * process management. These types define the core domain model for all
 * workflow operations, execution engines, and process coordination.
 *
 * Dependencies: Only imports from @claude-zen/foundation for shared primitives.
 * Domain Independence: Self-contained workflow domain types.
 *
 * @package @claude-zen/workflows
 * @since 2.1.0
 * @version 1.0.0
 */
import type {
  Branded,
  Entity,
  Priority,
  Result,
  Timestamp,
  UUID,
  ValidationError,
} from '@claude-zen/foundation/types'; // ============================================================================ 
// WORKFLOW CORE TYPES
// =============================================================================
/**
 * Workflow execution states
 */
export enum WorkflowStatus {
  DRAFT = 'draft',
  QUEUED = 'queued',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
  RETRYING = 'retrying'
};
/**
 * Step execution states
 */
export enum StepStatus {
    ')pending')running')completed')failed')skipped')cancelled')timeout')retrying'))  SEQUENTIAL = 'sequential')parallel')mixed')batch')streaming'))  MANUAL = 'manual')scheduled')event_driven')webhook')api')dependency')conditional'))  DATA_PROCESSING = 'data_processing')coordination')notification')deployment')testing')monitoring')backup')security')analytics')integration')custom'))export interface WorkflowDefinition extends Omit<Entity,'version'> {';
  name: string;
  description: string;
  category: WorkflowCategory;
  version: string;
  steps: WorkflowStep[];
  config: WorkflowConfig;
  metadata: WorkflowMetadata;
  dependencies: WorkflowDependency[];
  permissions: WorkflowPermissions;
  validation: WorkflowValidation;
}
/**
 * Workflow configuration
 */
export interface WorkflowConfig {
  strategy: ExecutionStrategy;
  concurrency: ConcurrencyConfig;
  retry: RetryConfig;
  timeout: TimeoutConfig;
  error: ErrorHandlingConfig;
  resources: ResourceConfig;
  monitoring: MonitoringConfig;
}
/**
 * Individual workflow step definition
 */
export interface WorkflowStep extends Entity {
  name: string;
  type: StepType;
  description?:string;
  action: StepAction;
  conditions: StepCondition[];
  dependencies: UUID[];
  retry: RetryConfig| undefined;
  timeout: number| undefined;
  resources: ResourceRequirement| undefined;
  validation: StepValidation| undefined;
  rollback: RollbackConfig| undefined;
}
/**
 * Step types for categorization
 */
export enum StepType {
  ACTION =action,
  CONDITION = 'condition')loop')parallel')wait')approval')notification')script')api_call')database')file_operation')custom'))};
/**
 * Step execution condition
 */
export interface StepCondition {
  type : 'skip| execute| retry' | ' fail')and' | ' or'|' not')validation| execution| timeout| resource' | ' permission');
  context?:Record<string, unknown>;
  recoverable: boolean;
  retryable: boolean;
}
// =============================================================================
// CONFIGURATION TYPES
// =============================================================================
/**
 * Concurrency configuration
 */
export interface ConcurrencyConfig {
  maxParallelSteps: 'fixed')linear')exponential')fibonacci')custom')fail_fast')continue')rollback')retry')escalate')ignore')success')completion')failure')data')resource')time')event')debug')info')warn')error')fatal')file')data')log')report')configuration')binary')archive')database'))};
/**
 * Access control policy for artifacts
 */
export interface AccessPolicy {
  public: boolean;
  users: string[];
  roles: string[];
  permissions: Permission[];
}
// =============================================================================
// TEMPLATE AND REGISTRY TYPES
// =============================================================================
/**
 * Workflow template for reusable workflows
 */
export interface WorkflowTemplate extends Omit<Entity,'version'> {';
  name: 'string')number')boolean')array')object')file')secret'))};
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
// =============================================================================
// VALIDATION AND PERMISSIONS
// =============================================================================
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
  type : 'user| role| group' | ' service')compensate')restore')manual')ignore')read')write')exclusive'))export type WorkflowId = Branded<UUID,'WorkflowId'>')ExecutionId'>')StepId'>');
export type WorkflowEventType ='workflow.created' | ' workflow.started'|' workflow.completed' | ' workflow.failed'|' workflow.cancelled' | ' step.started'|' step.completed' | ' step.failed'|' step.retried');
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
// =============================================================================
// RESULT TYPES FOR WORKFLOW OPERATIONS
// =============================================================================
/**
 * Result types for workflow-specific operations
 */
export type WorkflowResult<T> = Result<T, WorkflowError>;
export type ExecutionResult = Result<WorkflowExecution, ExecutionError>;
export type StepResult = Result<StepExecution, StepExecutionError>;
/**
 * Workflow-specific error types
 */
export interface WorkflowError extends Omit<ValidationError,'type'> {';
  type : 'WorkflowError')execution',)  stepId?:UUID;';
  retryable: 'execution',)  stepId: UUID;
  phase : 'validation| execution| output' | ' cleanup')};
');