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
  UUID,
  Timestamp,
  Priority,
  Status,
  Entity,
  Result,
  ValidationError,
  Optional,
  NonEmptyArray,
  Brand
} from '@claude-zen/foundation/types';

// =============================================================================
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
}

/**
 * Step execution states
 */
export enum StepStatus {
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
export enum ExecutionStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  MIXED = 'mixed',
  BATCH = 'batch',
  STREAMING = 'streaming'
}

/**
 * Workflow trigger types
 */
export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT_DRIVEN = 'event_driven',
  WEBHOOK = 'webhook',
  API = 'api',
  DEPENDENCY = 'dependency',
  CONDITIONAL = 'conditional'
}

/**
 * Workflow categories for organization
 */
export enum WorkflowCategory {
  DATA_PROCESSING = 'data_processing',
  COORDINATION = 'coordination',
  NOTIFICATION = 'notification',
  DEPLOYMENT = 'deployment',
  TESTING = 'testing',
  MONITORING = 'monitoring',
  BACKUP = 'backup',
  SECURITY = 'security',
  ANALYTICS = 'analytics',
  INTEGRATION = 'integration',
  CUSTOM = 'custom'
}

// =============================================================================
// WORKFLOW DEFINITION TYPES
// =============================================================================

/**
 * Core workflow definition
 */
export interface WorkflowDefinition extends Entity {
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
  description?: string;
  action: StepAction;
  conditions: StepCondition[];
  dependencies: UUID[];
  retry: Optional<RetryConfig>;
  timeout: Optional<number>;
  resources: Optional<ResourceRequirement>;
  validation: Optional<StepValidation>;
  rollback: Optional<RollbackConfig>;
}

/**
 * Step types for categorization
 */
export enum StepType {
  ACTION = 'action',
  CONDITION = 'condition',
  LOOP = 'loop',
  PARALLEL = 'parallel',
  WAIT = 'wait',
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  SCRIPT = 'script',
  API_CALL = 'api_call',
  DATABASE = 'database',
  FILE_OPERATION = 'file_operation',
  CUSTOM = 'custom'
}

/**
 * Step action specification
 */
export interface StepAction {
  type: string;
  handler: string;
  parameters: Record<string, unknown>;
  input: InputSpecification;
  output: OutputSpecification;
  environment?: Record<string, string>;
}

/**
 * Step execution condition
 */
export interface StepCondition {
  type: 'skip' | 'execute' | 'retry' | 'fail';
  expression: string;
  variables: string[];
  operator: 'and' | 'or' | 'not';
}

// =============================================================================
// EXECUTION TYPES
// =============================================================================

/**
 * Workflow execution instance
 */
export interface WorkflowExecution extends Entity {
  workflowId: UUID;
  definitionVersion: string;
  status: WorkflowStatus;
  trigger: ExecutionTrigger;
  context: WorkflowContext;
  steps: StepExecution[];
  metrics: ExecutionMetrics;
  logs: ExecutionLog[];
  artifacts: WorkflowArtifact[];
  scheduleInfo?: ScheduleInfo;
}

/**
 * Execution trigger information
 */
export interface ExecutionTrigger {
  type: TriggerType;
  source: string;
  timestamp: Timestamp;
  initiator?: string;
  payload?: Record<string, unknown>;
  correlationId?: UUID;
}

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  variables: Record<string, unknown>;
  secrets: Record<string, string>; // Encrypted values
  environment: Record<string, string>;
  metadata: Record<string, unknown>;
  parentWorkflowId?: UUID;
  parentExecutionId?: UUID;
  depth: number;
}

/**
 * Individual step execution instance
 */
export interface StepExecution extends Entity {
  stepId: UUID;
  name: string;
  status: StepStatus;
  startTime?: Timestamp;
  endTime?: Timestamp;
  duration?: number;
  retryCount: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: StepError;
  logs: StepLog[];
  metrics: StepMetrics;
  artifacts: StepArtifact[];
}

/**
 * Step execution error information
 */
export interface StepError {
  code: string;
  message: string;
  type: 'validation' | 'execution' | 'timeout' | 'resource' | 'permission';
  stack?: string;
  context?: Record<string, unknown>;
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
  maxParallelSteps: number;
  maxParallelWorkflows: number;
  queueing: QueueingConfig;
  throttling: ThrottlingConfig;
  pooling: PoolingConfig;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  delay: number;
  backoffStrategy: BackoffStrategy;
  maxDelay: number;
  retryableErrors: string[];
  exponentialBase?: number;
  jitter?: boolean;
}

/**
 * Backoff strategies for retries
 */
export enum BackoffStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  FIBONACCI = 'fibonacci',
  CUSTOM = 'custom'
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  workflow: number;
  step: number;
  action: number;
  approval: number;
  wait: number;
  gracePeriod: number;
  killTimeout: number;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  strategy: ErrorStrategy;
  failFast: boolean;
  continueOnError: boolean;
  errorThreshold: number;
  escalation: EscalationConfig;
  notifications: NotificationConfig[];
}

/**
 * Error handling strategies
 */
export enum ErrorStrategy {
  FAIL_FAST = 'fail_fast',
  CONTINUE = 'continue',
  ROLLBACK = 'rollback',
  RETRY = 'retry',
  ESCALATE = 'escalate',
  IGNORE = 'ignore'
}

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
  cpu: number; // CPU cores
  memory: number; // MB
  disk: number; // MB
  network: number; // Mbps
  duration: number; // seconds
  files: number; // max file handles
  processes: number; // max processes
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

// =============================================================================
// SCHEDULING AND TRIGGERS
// =============================================================================

/**
 * Schedule information for recurring workflows
 */
export interface ScheduleInfo {
  expression: string; // Cron expression
  timezone: string;
  nextRun: Timestamp;
  lastRun?: Timestamp;
  enabled: boolean;
  maxRuns?: number;
  runCount: number;
  endDate?: Timestamp;
}

/**
 * Workflow dependency specification
 */
export interface WorkflowDependency {
  workflowId: UUID;
  type: DependencyType;
  condition: DependencyCondition;
  timeout?: number;
  required: boolean;
}

/**
 * Dependency types
 */
export enum DependencyType {
  SUCCESS = 'success',
  COMPLETION = 'completion',
  FAILURE = 'failure',
  DATA = 'data',
  RESOURCE = 'resource',
  TIME = 'time',
  EVENT = 'event'
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

// =============================================================================
// MONITORING AND METRICS
// =============================================================================

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
    total: number; // CPU-seconds
  };
  memory: {
    peak: number;
    average: number;
    total: number; // MB-seconds
  };
  disk: {
    read: number; // MB
    write: number; // MB
    storage: number; // MB
  };
  network: {
    in: number; // MB
    out: number; // MB
    requests: number;
  };
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  throughput: number; // operations per second
  latency: LatencyMetrics;
  efficiency: number; // 0.0 - 1.0
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

// =============================================================================
// LOGGING AND AUDIT
// =============================================================================

/**
 * Workflow execution log entry
 */
export interface ExecutionLog {
  id: UUID;
  timestamp: Timestamp;
  level: LogLevel;
  source: string;
  message: string;
  data?: Record<string, unknown>;
  stepId?: UUID;
  correlationId?: UUID;
}

/**
 * Step execution log entry
 */
export interface StepLog {
  id: UUID;
  timestamp: Timestamp;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  phase: 'start' | 'execute' | 'complete' | 'error' | 'retry';
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// =============================================================================
// ARTIFACTS AND OUTPUT
// =============================================================================

/**
 * Workflow artifacts (files, data, etc.)
 */
export interface WorkflowArtifact extends Entity {
  name: string;
  type: ArtifactType;
  path: string;
  size: number;
  checksum: string;
  metadata: Record<string, unknown>;
  retention: RetentionPolicy;
  access: AccessPolicy;
}

/**
 * Step artifacts
 */
export interface StepArtifact extends WorkflowArtifact {
  stepId: UUID;
  phase: 'input' | 'output' | 'temporary' | 'log';
}

/**
 * Artifact types
 */
export enum ArtifactType {
  FILE = 'file',
  DATA = 'data',
  LOG = 'log',
  REPORT = 'report',
  CONFIGURATION = 'configuration',
  BINARY = 'binary',
  ARCHIVE = 'archive',
  DATABASE = 'database'
}

/**
 * Data retention policy
 */
export interface RetentionPolicy {
  duration: number; // seconds
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

// =============================================================================
// TEMPLATE AND REGISTRY TYPES
// =============================================================================

/**
 * Workflow template for reusable workflows
 */
export interface WorkflowTemplate extends Entity {
  name: string;
  description: string;
  category: WorkflowCategory;
  version: string;
  definition: WorkflowDefinition;
  parameters: TemplateParameter[];
  examples: TemplateExample[];
  documentation: TemplateDocumentation;
  rating: TemplateRating;
  usage: TemplateUsage;
}

/**
 * Template parameter definition
 */
export interface TemplateParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  defaultValue?: unknown;
  validation: ParameterValidation;
  sensitive: boolean;
}

/**
 * Parameter types
 */
export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  FILE = 'file',
  SECRET = 'secret'
}

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
  type: 'user' | 'role' | 'group' | 'service';
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

// =============================================================================
// ADVANCED WORKFLOW FEATURES
// =============================================================================

/**
 * Rollback configuration
 */
export interface RollbackConfig {
  enabled: boolean;
  automatic: boolean;
  strategy: RollbackStrategy;
  checkpoints: CheckpointConfig[];
  compensation: CompensationConfig;
}

/**
 * Rollback strategies
 */
export enum RollbackStrategy {
  COMPENSATE = 'compensate',
  RESTORE = 'restore',
  MANUAL = 'manual',
  IGNORE = 'ignore'
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

// =============================================================================
// WORKFLOW ENGINE CONFIGURATION
// =============================================================================

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

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Workflow state for persistence
 */
export interface WorkflowState {
  executionId: UUID;
  workflowId: UUID;
  status: WorkflowStatus;
  currentStep: number;
  context: WorkflowContext;
  checkpoint: StateCheckpoint;
  locks: StateLock[];
  metadata: Record<string, unknown>;
}

/**
 * State checkpoint for recovery
 */
export interface StateCheckpoint {
  timestamp: Timestamp;
  stepId: UUID;
  variables: Record<string, unknown>;
  artifacts: UUID[];
  checksum: string;
}

/**
 * State lock for concurrency control
 */
export interface StateLock {
  resource: string;
  type: LockType;
  holderId: UUID;
  acquired: Timestamp;
  expires: Timestamp;
}

/**
 * Lock types
 */
export enum LockType {
  READ = 'read',
  WRITE = 'write',
  EXCLUSIVE = 'exclusive'
}

// =============================================================================
// TYPE ALIASES AND UTILITY TYPES
// =============================================================================

// Additional utility types for workflow operations
export type WorkflowId = Brand<UUID, 'WorkflowId'>;
export type ExecutionId = Brand<UUID, 'ExecutionId'>;
export type StepId = Brand<UUID, 'StepId'>;

// Complex type aliases for easier usage
export type WorkflowEventType = 
  | 'workflow.created'
  | 'workflow.started' 
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.cancelled'
  | 'step.started'
  | 'step.completed'
  | 'step.failed'
  | 'step.retried';

// Stub definitions for referenced types (to be defined in respective modules)
export interface QueueingConfig { strategy: string; priority: boolean; }
export interface ThrottlingConfig { enabled: boolean; rate: number; }
export interface PoolingConfig { size: number; timeout: number; }
export interface EscalationConfig { levels: string[]; timeout: number; }
export interface NotificationConfig { type: string; recipients: string[]; }
export interface IsolationConfig { enabled: boolean; type: string; }
export interface Toleration { key: string; operator: string; value: string; }
export interface SchedulingConfig { strategy: string; constraints: string[]; }
export interface SecurityConstraints { runAsUser: number; capabilities: string[]; }
export interface ResourceRequirement { cpu: number; memory: number; }
export interface Bottleneck { type: string; severity: number; suggestion: string; }
export interface OptimizationSuggestions { recommendations: string[]; }
export interface CostMetrics { compute: number; storage: number; network: number; }
export interface ValidationSchema { type: string; properties: Record<string, unknown>; }
export interface ValidationRule { field: string; rule: string; message: string; }
export interface DependencyValidation { type: string; condition: string; }
export interface ResourceValidation { limits: ResourceLimits; }
export interface SecurityValidation { permissions: string[]; restrictions: string[]; }
export interface PermissionCondition { type: string; value: string; }
export interface InputValidation { schema: ValidationSchema; rules: ValidationRule[]; }
export interface OutputValidation { schema: ValidationSchema; rules: ValidationRule[]; }
export interface InputSource { type: string; location: string; }
export interface OutputDestination { type: string; location: string; }
export interface OutputFormat { type: string; encoding: string; }
export interface CompressionConfig { algorithm: string; level: number; }
export interface CheckpointFrequency { interval: number; conditions: string[]; }
export interface CheckpointStorage { type: string; location: string; }
export interface StorageConfig { type: string; connection: string; }
export interface SecurityConfig { authentication: boolean; authorization: boolean; }
export interface ClusteringConfig { enabled: boolean; nodes: number; }
export interface CachingConfig { enabled: boolean; size: number; }
export interface OptimizationConfig { enabled: boolean; strategies: string[]; }
export interface ProfilingConfig { enabled: boolean; sampling: number; }
export interface TemplateRating { score: number; reviews: number; }
export interface TemplateUsage { count: number; lastUsed: Timestamp; }
export interface ParameterValidation { rules: ValidationRule[]; }
export interface StepDocumentation { name: string; description: string; }
export interface TroubleshootingGuide { issue: string; solution: string; }
export interface ChangelogEntry { version: string; changes: string[]; }

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
export interface WorkflowError extends ValidationError {
  type: 'WorkflowError';
  category: 'definition' | 'execution' | 'validation' | 'permission' | 'resource';
  workflowId?: UUID;
  executionId?: UUID;
}

/**
 * Execution-specific error types
 */
export interface ExecutionError extends WorkflowError {
  category: 'execution';
  stepId?: UUID;
  retryable: boolean;
  failurePoint: string;
}

/**
 * Step execution error types
 */
export interface StepExecutionError extends WorkflowError {
  category: 'execution';
  stepId: UUID;
  phase: 'validation' | 'execution' | 'output' | 'cleanup';
  recoverable: boolean;
}

// Export default for convenience
export default {
  // Enums
  WorkflowStatus,
  StepStatus,
  ExecutionStrategy,
  TriggerType,
  WorkflowCategory,
  StepType,
  BackoffStrategy,
  ErrorStrategy,
  DependencyType,
  LogLevel,
  ArtifactType,
  ParameterType,
  RollbackStrategy,
  LockType,
};