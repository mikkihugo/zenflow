/**
 * Workflow Engine Types
 * Advanced workflow orchestration and automation
 */

import { Identifiable, JSONObject, JSONValue, TypedEventEmitter } from './core.js';

// =============================================================================
// WORKFLOW CORE TYPES
// =============================================================================

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'archived';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled' | 'timeout';
export type TriggerType = 'manual' | 'scheduled' | 'event' | 'webhook' | 'api' | 'condition' | 'dependency';
export type StepType = 'action' | 'condition' | 'loop' | 'parallel' | 'sequential' | 'delay' | 'human' | 'subworkflow';

// Audit and compliance types
export interface AuditLogEntry extends Identifiable {
  action: string;
  userId?: string;
  workflowId: string;
  details: JSONObject;
  timestamp: Date;
}

export interface ComplianceViolation extends Identifiable {
  ruleId: string;
  violation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  workflowId: string;
  details: JSONObject;
}

export interface SecurityEvent extends Identifiable {
  event: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  details: JSONObject;
}

export interface Workflow extends Identifiable {
  name: string;
  description?: string;
  version: string;
  status: WorkflowStatus;
  
  // Workflow definition
  definition: WorkflowDefinition;
  
  // Execution configuration
  config: WorkflowConfig;
  
  // Triggers
  triggers: WorkflowTrigger[];
  
  // Metadata
  tags: string[];
  category: string;
  owner: string;
  maintainers: string[];
  
  // Lifecycle
  createdBy: string;
  lastModified: Date;
  lastModifiedBy: string;
  
  // Execution history
  executions: WorkflowExecution[];
  
  // Statistics
  statistics: WorkflowStatistics;
  
  // Quality attributes
  reliability: number; // 0-1
  performance: number; // 0-1
  maintainability: number; // 0-1
}

export interface WorkflowDefinition {
  // Workflow structure
  steps: WorkflowStep[];
  connections: StepConnection[];
  
  // Entry and exit points
  startStep: string;
  endSteps: string[];
  
  // Variables and parameters
  variables: WorkflowVariable[];
  parameters: WorkflowParameter[];
  
  // Error handling
  errorHandling: ErrorHandlingConfig;
  
  // Timeouts and retries
  timeout: number; // milliseconds
  retryPolicy: RetryPolicy;
  
  // Validation rules
  validation: ValidationRule[];
  
  // Documentation
  documentation: WorkflowDocumentation;
}

export interface WorkflowStep extends Identifiable {
  name: string;
  type: StepType;
  description?: string;
  
  // Step configuration
  config: StepConfig;
  
  // Input/Output specification
  inputs: StepInput[];
  outputs: StepOutput[];
  
  // Execution settings
  timeout?: number; // milliseconds
  retries?: number;
  optional: boolean;
  
  // Conditions
  preconditions: Condition[];
  postconditions: Condition[];
  
  // Error handling
  onError: ErrorAction;
  onTimeout: TimeoutAction;
  
  // UI positioning (for visual editor)
  position: {
    x: number;
    y: number;
  };
  
  // Step metadata
  tags: string[];
  documentation?: string;
}

export interface StepConnection extends Identifiable {
  fromStep: string;
  toStep: string;
  
  // Connection properties
  condition?: Condition;
  weight?: number;
  
  // Connection metadata
  label?: string;
  description?: string;
  
  // Visual properties
  style?: ConnectionStyle;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  
  // Value specification
  defaultValue?: JSONValue;
  required: boolean;
  
  // Validation
  validation?: VariableValidation;
  
  // Scope
  scope: 'global' | 'step' | 'local';
  
  // Security
  sensitive: boolean;
  encrypted: boolean;
}

export interface WorkflowParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  
  // Value specification
  defaultValue?: JSONValue;
  required: boolean;
  
  // UI configuration
  label?: string;
  placeholder?: string;
  helpText?: string;
  
  // Validation
  validation?: ParameterValidation;
  
  // Input type for UI
  inputType: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'file' | 'date' | 'password';
  options?: ParameterOption[];
}

export interface ParameterOption {
  label: string;
  value: JSONValue;
  description?: string;
}

// =============================================================================
// STEP CONFIGURATIONS
// =============================================================================

export interface StepConfig {
  type: StepType;
  
  // Type-specific configuration
  action?: ActionStepConfig;
  condition?: ConditionStepConfig;
  loop?: LoopStepConfig;
  parallel?: ParallelStepConfig;
  sequential?: SequentialStepConfig;
  delay?: DelayStepConfig;
  human?: HumanStepConfig;
  subworkflow?: SubworkflowStepConfig;
}

export interface ActionStepConfig {
  // Action definition
  actionType: 'http' | 'database' | 'file' | 'email' | 'webhook' | 'script' | 'ai' | 'custom';
  
  // Action-specific configuration
  http?: HttpActionConfig;
  database?: DatabaseActionConfig;
  file?: FileActionConfig;
  email?: EmailActionConfig;
  webhook?: WebhookActionConfig;
  script?: ScriptActionConfig;
  ai?: AIActionConfig;
  custom?: CustomActionConfig;
  
  // Common action settings
  async: boolean;
  caching: boolean;
  idempotent: boolean;
}

export interface HttpActionConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: JSONObject;
  timeout?: number; // milliseconds
  followRedirects: boolean;
  validateStatus: boolean;
  expectedStatus: number[];
}

export interface DatabaseActionConfig {
  connection: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'execute';
  query: string;
  parameters?: Record<string, JSONValue>;
  transaction: boolean;
}

export interface FileActionConfig {
  operation: 'read' | 'write' | 'append' | 'delete' | 'move' | 'copy' | 'list';
  path: string;
  content?: string;
  encoding?: string;
  createDirectories: boolean;
}

export interface EmailActionConfig {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
  template?: string;
  templateData?: JSONObject;
}

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
  encoding: 'base64' | 'binary' | 'text';
}

export interface WebhookActionConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  payload?: JSONObject;
  secret?: string;
  retries: number;
  timeout: number; // milliseconds
}

export interface ScriptActionConfig {
  language: 'javascript' | 'python' | 'bash' | 'powershell' | 'custom';
  script: string;
  timeout: number; // milliseconds
  environment?: Record<string, string>;
  workingDirectory?: string;
}

export interface AIActionConfig {
  provider: string;
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  context?: JSONObject;
}

export interface CustomActionConfig {
  handler: string;
  config: JSONObject;
}

export interface ConditionStepConfig {
  expression: string;
  language: 'javascript' | 'jq' | 'jsonpath' | 'custom';
  
  // Branching
  onTrue: string; // step ID
  onFalse: string; // step ID
  
  // Variables to evaluate
  variables: string[];
}

export interface LoopStepConfig {
  type: 'for' | 'while' | 'foreach';
  
  // Loop configuration
  condition?: string;
  iterator?: string;
  collection?: string;
  maxIterations: number;
  
  // Loop body
  steps: string[];
  
  // Loop control
  breakOn?: string;
  continueOn?: string;
}

export interface ParallelStepConfig {
  steps: string[];
  
  // Execution options
  maxConcurrency: number;
  failFast: boolean;
  waitForAll: boolean;
  
  // Result aggregation
  aggregateResults: boolean;
  aggregationFunction?: string;
}

export interface SequentialStepConfig {
  steps: string[];
  
  // Execution options
  stopOnError: boolean;
  continueOnError: boolean;
}

export interface DelayStepConfig {
  duration: number; // milliseconds
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days';
  
  // Dynamic delay
  dynamic: boolean;
  expression?: string;
}

export interface HumanStepConfig {
  // Task information
  title: string;
  description: string;
  instructions: string;
  
  // Assignment
  assignee?: string;
  assigneeGroup?: string;
  assignmentRules?: AssignmentRule[];
  
  // UI configuration
  form: HumanTaskForm;
  
  // Timing
  dueDate?: Date;
  reminderInterval?: number; // minutes
  escalationRules?: EscalationRule[];
  
  // Approval workflow
  approvalRequired: boolean;
  approvers?: string[];
  approvalThreshold: number; // percentage
}

export interface HumanTaskForm {
  fields: FormField[];
  layout: FormLayout;
  validation: FormValidation[];
  
  // UI customization
  theme?: string;
  customCSS?: string;
  
  // Submission
  submitLabel: string;
  cancelLabel: string;
  allowDraft: boolean;
}

export interface FormField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'file' | 'date' | 'datetime';
  label: string;
  description?: string;
  required: boolean;
  
  // Validation
  validation?: FieldValidation;
  
  // Options for select fields
  options?: ParameterOption[];
  
  // UI properties
  placeholder?: string;
  helpText?: string;
  disabled: boolean;
  hidden: boolean;
  
  // Default value
  defaultValue?: JSONValue;
}

export interface FormLayout {
  type: 'grid' | 'tabs' | 'accordion' | 'wizard';
  sections: FormSection[];
}

export interface FormSection {
  title: string;
  description?: string;
  fields: string[];
  
  // Conditional display
  condition?: string;
  
  // Layout properties
  columns?: number;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface SubworkflowStepConfig {
  workflowId: string;
  version?: string;
  
  // Parameter mapping
  parameterMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  
  // Execution options
  async: boolean;
  waitForCompletion: boolean;
  
  // Error handling
  propagateErrors: boolean;
  onSubworkflowError: 'fail' | 'continue' | 'retry';
}

// =============================================================================
// WORKFLOW EXECUTION
// =============================================================================

export interface WorkflowExecution extends Identifiable {
  workflowId: string;
  workflowVersion: string;
  
  // Execution details
  status: WorkflowStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  
  // Trigger information
  triggeredBy: WorkflowTrigger;
  triggerData?: JSONObject;
  
  // Input parameters
  parameters: Record<string, JSONValue>;
  
  // Step executions
  stepExecutions: StepExecution[];
  
  // Results
  outputs: Record<string, JSONValue>;
  
  // Error information
  error?: WorkflowError;
  
  // Resource usage
  resourceUsage: WorkflowResourceUsage;
  
  // Metadata
  executedBy?: string;
  correlationId?: string;
  tags: string[];
}

export interface StepExecution extends Identifiable {
  stepId: string;
  stepName: string;
  stepType: StepType;
  
  // Execution status
  status: StepStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  
  // Input/Output
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  
  // Execution details
  attemptCount: number;
  maxAttempts: number;
  
  // Error information
  error?: StepError;
  
  // Resource usage
  resourceUsage: StepResourceUsage;
  
  // Logs
  logs: ExecutionLog[];
  
  // Human task information (if applicable)
  humanTask?: HumanTaskExecution;
}

export interface HumanTaskExecution {
  assignee?: string;
  assignedAt: Date;
  dueDate?: Date;
  
  // Task state
  claimed: boolean;
  claimedBy?: string;
  claimedAt?: Date;
  
  // Completion
  completedBy?: string;
  completedAt?: Date;
  submittedData?: JSONObject;
  
  // Comments and history
  comments: TaskComment[];
  history: TaskHistoryEntry[];
  
  // Reminders and escalations
  reminders: TaskReminder[];
  escalations: TaskEscalation[];
}

export interface TaskComment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  
  // Comment type
  type: 'comment' | 'question' | 'clarification' | 'approval' | 'rejection';
  
  // Visibility
  visibility: 'public' | 'private' | 'assignee-only';
}

export interface TaskHistoryEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details?: JSONObject;
}

export interface TaskReminder {
  sentAt: Date;
  sentTo: string[];
  method: 'email' | 'sms' | 'notification' | 'webhook';
  acknowledged: boolean;
}

export interface TaskEscalation {
  triggeredAt: Date;
  escalatedTo: string[];
  reason: string;
  resolved: boolean;
  resolvedAt?: Date;
}

// =============================================================================
// WORKFLOW TRIGGERS
// =============================================================================

export interface WorkflowTrigger extends Identifiable {
  name: string;
  type: TriggerType;
  description?: string;
  
  // Trigger configuration
  config: TriggerConfig;
  
  // Trigger state
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
  
  // Error tracking
  lastError?: string;
  errorCount: number;
  
  // Schedule information (for scheduled triggers)
  schedule?: TriggerSchedule;
}

export interface TriggerConfig {
  type: TriggerType;
  
  // Type-specific configuration
  manual?: ManualTriggerConfig;
  scheduled?: ScheduledTriggerConfig;
  event?: EventTriggerConfig;
  webhook?: WebhookTriggerConfig;
  api?: APITriggerConfig;
  condition?: ConditionTriggerConfig;
  dependency?: DependencyTriggerConfig;
}

export interface ManualTriggerConfig {
  // Authorization
  allowedUsers: string[];
  allowedRoles: string[];
  
  // UI configuration
  buttonLabel: string;
  confirmationMessage?: string;
  
  // Parameters
  parameters: WorkflowParameter[];
}

export interface ScheduledTriggerConfig {
  // Schedule specification
  cron: string;
  timezone: string;
  
  // Execution options
  allowConcurrent: boolean;
  maxConcurrent: number;
  
  // Validity period
  startDate?: Date;
  endDate?: Date;
  
  // Parameters
  parameters: Record<string, JSONValue>;
}

export interface EventTriggerConfig {
  // Event matching
  eventType: string;
  eventSource?: string;
  eventFilters: EventFilter[];
  
  // Processing options
  batchSize: number;
  batchTimeout: number; // milliseconds
  
  // Parameters extraction
  parameterMapping: Record<string, string>;
}

export interface WebhookTriggerConfig {
  // Webhook configuration
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  // Security
  secret?: string;
  authRequired: boolean;
  allowedIPs: string[];
  
  // Request processing
  parameterMapping: Record<string, string>;
  responseTemplate?: string;
}

export interface APITriggerConfig {
  // API endpoint
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  // Authentication
  authRequired: boolean;
  permissions: string[];
  
  // Request/Response
  requestSchema?: JSONObject;
  responseSchema?: JSONObject;
  
  // Processing
  parameterMapping: Record<string, string>;
}

export interface ConditionTriggerConfig {
  // Condition specification
  condition: string;
  evaluationInterval: number; // seconds
  
  // Variables to monitor
  variables: string[];
  dataSource: string;
  
  // Trigger behavior
  triggerOnce: boolean;
  cooldownPeriod: number; // seconds
}

export interface DependencyTriggerConfig {
  // Dependencies
  dependencies: WorkflowDependency[];
  
  // Trigger condition
  condition: 'all' | 'any' | 'custom';
  customCondition?: string;
  
  // Timeout
  timeout: number; // milliseconds
  onTimeout: 'fail' | 'continue' | 'retry';
}

export interface WorkflowDependency {
  type: 'workflow' | 'external' | 'data';
  
  // Workflow dependency
  workflowId?: string;
  workflowVersion?: string;
  status?: WorkflowStatus[];
  
  // External dependency
  endpoint?: string;
  healthCheck?: string;
  
  // Data dependency
  dataSource?: string;
  dataQuery?: string;
  expectedResult?: JSONValue;
}

export interface TriggerSchedule {
  nextRun: Date;
  lastRun?: Date;
  
  // Schedule analysis
  frequency: string;
  timezone: string;
  
  // Upcoming runs
  upcomingRuns: Date[];
  
  // Schedule status
  active: boolean;
  paused: boolean;
  pausedUntil?: Date;
}

// =============================================================================
// WORKFLOW ENGINE
// =============================================================================

export interface WorkflowEngine extends TypedEventEmitter<WorkflowEvents> {
  // Workflow management
  createWorkflow(definition: WorkflowDefinition, config?: WorkflowConfig): Promise<Workflow>;
  updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow>;
  deleteWorkflow(workflowId: string): Promise<boolean>;
  getWorkflow(workflowId: string): Promise<Workflow | null>;
  listWorkflows(filters?: WorkflowFilter[]): Promise<Workflow[]>;
  
  // Workflow execution
  executeWorkflow(workflowId: string, parameters?: Record<string, JSONValue>, triggeredBy?: string): Promise<WorkflowExecution>;
  pauseExecution(executionId: string): Promise<void>;
  resumeExecution(executionId: string): Promise<void>;
  cancelExecution(executionId: string, reason?: string): Promise<void>;
  retryExecution(executionId: string, fromStep?: string): Promise<WorkflowExecution>;
  
  // Step management
  executeStep(executionId: string, stepId: string): Promise<StepExecution>;
  skipStep(executionId: string, stepId: string, reason?: string): Promise<void>;
  retryStep(executionId: string, stepId: string): Promise<StepExecution>;
  
  // Human tasks
  claimTask(taskId: string, userId: string): Promise<void>;
  unclaimTask(taskId: string): Promise<void>;
  completeTask(taskId: string, data: JSONObject, userId: string): Promise<void>;
  addTaskComment(taskId: string, comment: string, userId: string): Promise<void>;
  
  // Trigger management
  addTrigger(workflowId: string, trigger: WorkflowTrigger): Promise<void>;
  removeTrigger(triggerId: string): Promise<boolean>;
  enableTrigger(triggerId: string): Promise<void>;
  disableTrigger(triggerId: string): Promise<void>;
  testTrigger(triggerId: string, testData?: JSONObject): Promise<boolean>;
  
  // Monitoring and analytics
  getExecutionHistory(workflowId?: string, filters?: ExecutionFilter[]): Promise<WorkflowExecution[]>;
  getExecutionStatus(executionId: string): Promise<WorkflowExecution | null>;
  getWorkflowStatistics(workflowId: string): Promise<WorkflowStatistics>;
  getEngineMetrics(): Promise<EngineMetrics>;
  
  // Administration
  startEngine(): Promise<void>;
  stopEngine(): Promise<void>;
  pauseEngine(): Promise<void>;
  resumeEngine(): Promise<void>;
  getEngineStatus(): Promise<EngineStatus>;
  
  // Import/Export
  exportWorkflow(workflowId: string, format: 'json' | 'yaml' | 'bpmn'): Promise<string>;
  importWorkflow(definition: string, format: 'json' | 'yaml' | 'bpmn'): Promise<Workflow>;
  
  // Validation
  validateWorkflow(definition: WorkflowDefinition): Promise<ValidationResult[]>;
  validateExecution(executionId: string): Promise<ValidationResult[]>;
}

// =============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface WorkflowConfig {
  // Execution settings
  maxConcurrentExecutions: number;
  defaultTimeout: number; // milliseconds
  maxExecutionTime: number; // milliseconds
  
  // Retry policy
  retryPolicy: RetryPolicy;
  
  // Error handling
  errorHandling: ErrorHandlingConfig;
  
  // Logging and monitoring
  logging: WorkflowLoggingConfig;
  monitoring: WorkflowMonitoringConfig;
  
  // Security
  security: WorkflowSecurityConfig;
  
  // Performance
  performance: WorkflowPerformanceConfig;
  
  // Notifications
  notifications: NotificationConfig[];
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  multiplier: number;
  jitter: boolean;
  
  // Retry conditions
  retryableErrors: string[];
  retryableStatuses: StepStatus[];
}

export interface ErrorHandlingConfig {
  // Default error actions
  onStepError: ErrorAction;
  onWorkflowError: ErrorAction;
  
  // Error categorization
  errorCategories: ErrorCategory[];
  
  // Error notifications
  notifyOnError: boolean;
  errorNotifications: NotificationConfig[];
  
  // Error recovery
  enableAutoRecovery: boolean;
  recoveryStrategies: RecoveryStrategy[];
}

export interface ErrorAction {
  action: 'fail' | 'retry' | 'skip' | 'fallback' | 'compensate' | 'escalate';
  
  // Action-specific configuration
  fallbackStep?: string;
  compensationSteps?: string[];
  escalationRules?: EscalationRule[];
  
  // Additional options
  notifyOnAction: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface TimeoutAction {
  action: 'fail' | 'retry' | 'skip' | 'extend' | 'escalate';
  
  // Action-specific configuration
  extensionTime?: number; // milliseconds
  escalationRules?: EscalationRule[];
  
  // Additional options
  notifyOnTimeout: boolean;
  maxExtensions?: number;
}

export interface ErrorCategory {
  name: string;
  patterns: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: ErrorAction;
  
  // Category-specific handling
  customHandler?: string;
  ignorable: boolean;
  reportable: boolean;
}

export interface RecoveryStrategy {
  name: string;
  conditions: string[];
  actions: RecoveryAction[];
  
  // Strategy effectiveness
  successRate: number; // 0-1
  averageRecoveryTime: number; // milliseconds
}

export interface RecoveryAction {
  type: 'restart' | 'rollback' | 'compensate' | 'repair' | 'escalate';
  config: JSONObject;
  timeout: number; // milliseconds
}

export interface EscalationRule {
  condition: string;
  delay: number; // seconds
  escalateTo: string[];
  
  // Escalation actions
  actions: EscalationAction[];
  
  // Escalation chain
  nextLevel?: EscalationRule;
  maxLevels: number;
  currentLevel: number;
}

export interface EscalationAction {
  type: 'notify' | 'assign' | 'prioritize' | 'approve' | 'abort';
  config: JSONObject;
}

export interface AssignmentRule {
  condition: string;
  assignee: string;
  priority: number;
  
  // Load balancing
  loadBalancing: boolean;
  maxAssignments: number;
}

export interface WorkflowLoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  
  // Log destinations
  destinations: LogDestination[];
  
  // Log content
  includeInputs: boolean;
  includeOutputs: boolean;
  includeErrors: boolean;
  includeTimings: boolean;
  
  // Log retention
  retentionDays: number;
  maxLogSize: number; // MB
  
  // Log format
  format: 'json' | 'text' | 'structured';
  
  // Sensitive data
  maskSensitiveData: boolean;
  sensitiveFields: string[];
}

export interface LogDestination {
  type: 'file' | 'database' | 'elasticsearch' | 'cloudwatch' | 'custom';
  config: JSONObject;
  
  // Filtering
  filters: LogFilter[];
  
  // Formatting
  formatter?: string;
}

export interface LogFilter {
  field: string;
  operator: 'eq' | 'ne' | 'contains' | 'regex';
  value: string;
  
  // Filter action
  action: 'include' | 'exclude' | 'transform';
  transformation?: string;
}

export interface WorkflowMonitoringConfig {
  enabled: boolean;
  
  // Metrics collection
  collectMetrics: boolean;
  metricsInterval: number; // seconds
  
  // Health checks
  healthChecks: HealthCheckConfig[];
  
  // Alerting
  alerting: AlertingConfig;
  
  // Performance monitoring
  performanceMonitoring: PerformanceMonitoringConfig;
  
  // SLA monitoring
  slaMonitoring: SLAMonitoringConfig;
}

export interface HealthCheckConfig {
  name: string;
  type: 'endpoint' | 'database' | 'queue' | 'custom';
  config: JSONObject;
  
  // Check frequency
  interval: number; // seconds
  timeout: number; // milliseconds
  
  // Failure handling
  retries: number;
  retryDelay: number; // milliseconds
  
  // Alerting
  alertOnFailure: boolean;
  alertThreshold: number; // consecutive failures
}

export interface AlertingConfig {
  enabled: boolean;
  
  // Alert rules
  rules: AlertRule[];
  
  // Notification channels
  channels: NotificationChannel[];
  
  // Alert management
  deduplicate: boolean;
  groupingPeriod: number; // seconds
  silencePeriod: number; // seconds After alert resolution
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  
  // Evaluation
  evaluationInterval: number; // seconds
  evaluationPeriod: number; // seconds
  
  // Thresholds
  threshold: number;
  comparisonOperator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  
  // Actions
  actions: AlertAction[];
  
  // Metadata
  tags: Record<string, string>;
  runbook?: string;
}

export interface AlertAction {
  type: 'notify' | 'webhook' | 'script' | 'autoscale' | 'restart';
  config: JSONObject;
  
  // Execution conditions
  conditions?: AlertCondition[];
  
  // Retry configuration
  retries: number;
  retryDelay: number; // seconds
}

export interface AlertCondition {
  field: string;
  operator: string;
  value: JSONValue;
}

export interface NotificationChannel {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty' | 'custom';
  config: JSONObject;
  
  // Channel settings
  enabled: boolean;
  defaultChannel: boolean;
  
  // Message formatting
  template?: string;
  formatter?: string;
  
  // Rate limiting
  rateLimitConfig?: RateLimitConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  maxMessages: number;
  timeWindow: number; // seconds
  
  // Burst handling
  burstSize: number;
  burstTimeWindow: number; // seconds
}

export interface PerformanceMonitoringConfig {
  enabled: boolean;
  
  // Metrics to track
  trackExecutionTime: boolean;
  trackResourceUsage: boolean;
  trackThroughput: boolean;
  trackErrorRate: boolean;
  
  // Performance thresholds
  thresholds: PerformanceThreshold[];
  
  // Optimization
  autoOptimization: boolean;
  optimizationRules: OptimizationRule[];
}

export interface PerformanceThreshold {
  metric: string;
  threshold: number;
  operator: 'gt' | 'gte' | 'lt' | 'lte';
  
  // Actions
  actions: PerformanceAction[];
  
  // Evaluation
  evaluationPeriod: number; // seconds
  consecutiveViolations: number;
}

export interface PerformanceAction {
  type: 'alert' | 'scale' | 'throttle' | 'optimize' | 'abort';
  config: JSONObject;
}

export interface OptimizationRule {
  name: string;
  condition: string;
  optimization: OptimizationType;
  config: JSONObject;
  
  // Effectiveness tracking
  applied: boolean;
  effectiveness: number; // 0-1
  rollbackThreshold: number; // 0-1
}

export type OptimizationType = 'parallelization' | 'caching' | 'batching' | 'resource-allocation' | 'path-optimization';

export interface SLAMonitoringConfig {
  enabled: boolean;
  
  // SLA definitions
  slas: ServiceLevelAgreement[];
  
  // Violation handling
  violationActions: SLAViolationAction[];
  
  // Reporting
  reportingEnabled: boolean;
  reportingInterval: number; // hours
  reportingChannels: string[];
}

export interface ServiceLevelAgreement {
  name: string;
  description: string;
  
  // SLA metrics
  metrics: SLAMetric[];
  
  // SLA targets
  availability: number; // 0-1
  responseTime: number; // milliseconds
  throughput: number; // executions per hour
  errorRate: number; // 0-1
  
  // Time-based SLA
  businessHours?: BusinessHours;
  
  // Penalties and credits
  penalties: SLAPenalty[];
  credits: SLACredit[];
}

export interface SLAMetric {
  name: string;
  type: 'availability' | 'performance' | 'quality' | 'custom';
  target: number;
  unit: string;
  
  // Measurement
  measurementPeriod: number; // hours
  aggregation: 'avg' | 'max' | 'min' | 'p95' | 'p99';
  
  // Weighting
  weight: number; // 0-1
}

export interface BusinessHours {
  timezone: string;
  
  // Weekly schedule
  schedule: {
    monday: TimeRange;
    tuesday: TimeRange;
    wednesday: TimeRange;
    thursday: TimeRange;
    friday: TimeRange;
    saturday?: TimeRange;
    sunday?: TimeRange;
  };
  
  // Holidays
  holidays: Date[];
  
  // Special schedules
  specialSchedules: SpecialSchedule[];
}

export interface TimeRange {
  start: string; // HH:MM
  end: string;   // HH:MM
}

export interface SpecialSchedule {
  date: Date;
  schedule: TimeRange;
  description: string;
}

export interface SLAPenalty {
  threshold: number; // SLA violation percentage
  penalty: number;   // monetary penalty
  description: string;
}

export interface SLACredit {
  threshold: number; // SLA achievement percentage
  credit: number;    // service credit
  description: string;
}

export interface SLAViolationAction {
  severity: 'minor' | 'major' | 'critical';
  actions: AlertAction[];
  
  // Escalation
  escalationRules: EscalationRule[];
}

export interface WorkflowSecurityConfig {
  // Authentication
  authenticationRequired: boolean;
  authenticationProvider: string;
  
  // Authorization
  authorizationEnabled: boolean;
  defaultPermissions: string[];
  
  // Access control
  accessControl: AccessControlConfig;
  
  // Data security
  dataSecurity: DataSecurityConfig;
  
  // Audit logging
  auditLogging: AuditLoggingConfig;
  
  // Compliance
  compliance: ComplianceConfig;
}

export interface AccessControlConfig {
  // Role-based access control
  rbacEnabled: boolean;
  roles: WorkflowRole[];
  
  // Resource-based permissions
  resourcePermissions: ResourcePermission[];
  
  // Context-based access control
  contextualPermissions: ContextualPermission[];
}

export interface WorkflowRole {
  name: string;
  description: string;
  permissions: string[];
  
  // Role hierarchy
  inheritsFrom: string[];
  
  // Role constraints
  constraints: RoleConstraint[];
}

export interface RoleConstraint {
  type: 'temporal' | 'conditional' | 'resource-based';
  condition: string;
  effect: 'allow' | 'deny';
}

export interface ResourcePermission {
  resource: string;
  actions: string[];
  principals: string[];
  
  // Conditions
  conditions: PermissionCondition[];
  
  // Time-based permissions
  timeRestrictions: TimeRestriction[];
}

export interface PermissionCondition {
  type: 'attribute' | 'context' | 'resource-state' | 'time';
  expression: string;
}

export interface TimeRestriction {
  start: Date;
  end: Date;
  timezone: string;
  
  // Recurring restrictions
  recurring: boolean;
  recurrencePattern?: string;
}

export interface ContextualPermission {
  context: string;
  permissions: string[];
  conditions: string[];
  
  // Dynamic evaluation
  dynamicEvaluation: boolean;
  evaluationFunction?: string;
}

export interface DataSecurityConfig {
  // Encryption
  encryptionEnabled: boolean;
  encryptionAlgorithm: string;
  keyManagement: KeyManagementConfig;
  
  // Data classification
  dataClassification: DataClassificationConfig;
  
  // Data masking
  dataMasking: DataMaskingConfig;
  
  // Data retention
  dataRetention: DataRetentionConfig;
}

export interface KeyManagementConfig {
  provider: string;
  keyRotation: boolean;
  rotationInterval: number; // days
  
  // Key storage
  keyStorage: string;
  backupKeys: boolean;
}

export interface DataClassificationConfig {
  enabled: boolean;
  classificationLevels: DataClassificationLevel[];
  
  // Auto-classification
  autoClassification: boolean;
  classificationRules: ClassificationRule[];
}

export interface DataClassificationLevel {
  level: string;
  description: string;
  restrictions: DataRestriction[];
  
  // Security requirements
  encryptionRequired: boolean;
  accessLoggingRequired: boolean;
  retentionPolicy: DataRetentionPolicy;
}

export interface DataRestriction {
  type: 'access' | 'export' | 'modification' | 'retention';
  restriction: string;
  exemptions: string[];
}

export interface ClassificationRule {
  name: string;
  patterns: string[];
  classificationLevel: string;
  
  // Rule evaluation
  confidence: number; // 0-1
  automaticApply: boolean;
}

export interface DataMaskingConfig {
  enabled: boolean;
  maskingRules: MaskingRule[];
  
  // Default masking
  defaultMaskingStrategy: string;
  preserveFormat: boolean;
}

export interface MaskingRule {
  fieldPattern: string;
  maskingStrategy: string;
  
  // Conditional masking
  conditions: MaskingCondition[];
  
  // Masking configuration
  config: JSONObject;
}

export interface MaskingCondition {
  type: 'role' | 'context' | 'purpose' | 'time';
  condition: string;
  effect: 'mask' | 'unmask' | 'partial-mask';
}

export interface DataRetentionConfig {
  enabled: boolean;
  defaultRetentionPeriod: number; // days
  
  // Retention policies
  retentionPolicies: DataRetentionPolicy[];
  
  // Deletion
  automaticDeletion: boolean;
  deletionGracePeriod: number; // days
  
  // Archival
  archivalEnabled: boolean;
  archivalThreshold: number; // days
}

export interface DataRetentionPolicy {
  name: string;
  applicableData: string[];
  retentionPeriod: number; // days
  
  // Legal holds
  legalHoldExemption: boolean;
  businessJustification: string;
  
  // Disposal
  disposalMethod: 'delete' | 'anonymize' | 'archive';
  verificationRequired: boolean;
}

export interface AuditLoggingConfig {
  enabled: boolean;
  auditLevel: 'minimal' | 'standard' | 'comprehensive';
  
  // Audit events
  auditEvents: string[];
  
  // Audit storage
  storageConfig: AuditStorageConfig;
  
  // Audit integrity
  integrityProtection: boolean;
  signAuditLogs: boolean;
  
  // Audit retention
  retentionPeriod: number; // days
  complianceRetention: number; // days
}

export interface AuditStorageConfig {
  primary: AuditStorageLocation;
  backup?: AuditStorageLocation;
  
  // Replication
  replicationEnabled: boolean;
  replicationTargets: AuditStorageLocation[];
}

export interface AuditStorageLocation {
  type: 'file' | 'database' | 'cloud' | 'siem';
  config: JSONObject;
  
  // Encryption
  encrypted: boolean;
  compressionEnabled: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  frameworks: ComplianceFramework[];
  
  // Compliance monitoring
  monitoringEnabled: boolean;
  complianceChecks: ComplianceCheck[];
  
  // Reporting
  reportingEnabled: boolean;
  reportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  reportingChannels: string[];
}

export interface ComplianceFramework {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  
  // Implementation
  implementationStatus: 'not-started' | 'in-progress' | 'completed' | 'verified';
  lastAssessment: Date;
  nextAssessment: Date;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  controls: ComplianceControl[];
  
  // Implementation status
  status: 'not-implemented' | 'partially-implemented' | 'implemented' | 'verified';
  evidence: string[];
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationStatus: 'not-mitigated' | 'partially-mitigated' | 'mitigated';
}

export interface ComplianceControl {
  id: string;
  description: string;
  implementation: string;
  
  // Testing
  testable: boolean;
  testProcedure?: string;
  lastTested?: Date;
  testResult?: 'pass' | 'fail' | 'partial';
  
  // Automation
  automated: boolean;
  automationScript?: string;
}

export interface ComplianceCheck {
  name: string;
  framework: string;
  requirement: string;
  
  // Check configuration
  checkType: 'manual' | 'automated' | 'hybrid';
  checkScript?: string;
  checkFrequency: string;
  
  // Results
  lastCheck: Date;
  checkResult: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  
  // Resolution
  resolved: boolean;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  
  // Evidence
  evidence: string[];
}

export interface WorkflowPerformanceConfig {
  // Execution optimization
  optimizationEnabled: boolean;
  optimizationStrategies: OptimizationStrategy[];
  
  // Resource management
  resourceManagement: ResourceManagementConfig;
  
  // Caching
  caching: CachingConfig;
  
  // Parallelization
  parallelization: ParallelizationConfig;
  
  // Load balancing
  loadBalancing: LoadBalancingConfig;
}

export interface OptimizationStrategy {
  name: string;
  type: OptimizationType;
  enabled: boolean;
  
  // Strategy configuration
  config: JSONObject;
  
  // Effectiveness tracking
  effectiveness: number; // 0-1
  lastApplied: Date;
  
  // Conditions
  applicableConditions: string[];
  
  // Rollback
  rollbackThreshold: number; // 0-1
  rollbackEnabled: boolean;
}

export interface ResourceManagementConfig {
  // Resource allocation
  defaultResourceLimits: ResourceLimits;
  resourcePools: ResourcePool[];
  
  // Resource monitoring
  monitoringEnabled: boolean;
  alertThresholds: ResourceThreshold[];
  
  // Resource optimization
  autoScaling: AutoScalingConfig;
  loadBalancing: boolean;
}

export interface ResourceLimits {
  cpu: number; // cores
  memory: number; // MB
  disk: number; // MB
  network: number; // KB/s
  
  // Custom resources
  custom: Record<string, number>;
}

export interface ResourcePool {
  name: string;
  type: string;
  capacity: ResourceLimits;
  
  // Pool configuration
  shared: boolean;
  priority: number;
  
  // Access control
  allowedWorkflows: string[];
  allowedUsers: string[];
}

export interface ResourceThreshold {
  resource: string;
  threshold: number;
  operator: 'gt' | 'gte' | 'lt' | 'lte';
  
  // Actions
  actions: ResourceAction[];
  
  // Evaluation
  evaluationPeriod: number; // seconds
}

export interface ResourceAction {
  type: 'alert' | 'scale' | 'throttle' | 'migrate' | 'terminate';
  config: JSONObject;
}

export interface AutoScalingConfig {
  enabled: boolean;
  
  // Scaling triggers
  scaleUpTriggers: ScalingTrigger[];
  scaleDownTriggers: ScalingTrigger[];
  
  // Scaling limits
  minInstances: number;
  maxInstances: number;
  
  // Scaling behavior
  scaleUpCooldown: number; // seconds
  scaleDownCooldown: number; // seconds
  scaleUpStep: number;
  scaleDownStep: number;
}

export interface ScalingTrigger {
  metric: string;
  threshold: number;
  operator: 'gt' | 'gte' | 'lt' | 'lte';
  
  // Evaluation
  evaluationPeriods: number;
  evaluationInterval: number; // seconds
}

export interface CachingConfig {
  enabled: boolean;
  
  // Cache levels
  stepResultCaching: boolean;
  workflowResultCaching: boolean;
  dataCaching: boolean;
  
  // Cache configuration
  cacheSize: number; // MB
  defaultTTL: number; // seconds
  
  // Cache invalidation
  invalidationStrategy: 'ttl' | 'lru' | 'lfu' | 'manual';
  invalidationRules: CacheInvalidationRule[];
  
  // Cache warming
  warmingEnabled: boolean;
  warmingStrategies: CacheWarmingStrategy[];
}

export interface CacheInvalidationRule {
  trigger: 'time' | 'event' | 'condition';
  condition: string;
  
  // Invalidation scope
  scope: 'global' | 'workflow' | 'step' | 'user';
  patterns: string[];
}

export interface CacheWarmingStrategy {
  name: string;
  trigger: 'startup' | 'scheduled' | 'predictive';
  
  // Warming configuration
  config: JSONObject;
  
  // Effectiveness
  hitRateImprovement: number; // 0-1
  warmingCost: number; // milliseconds
}

export interface ParallelizationConfig {
  enabled: boolean;
  
  // Parallelization settings
  maxParallelSteps: number;
  defaultParallelism: number;
  
  // Parallelization strategies
  autoDetection: boolean;
  dependencyAnalysis: boolean;
  resourceAware: boolean;
  
  // Synchronization
  synchronizationStrategy: 'barrier' | 'producer-consumer' | 'fan-out-fan-in';
  deadlockDetection: boolean;
  deadlockResolution: 'timeout' | 'priority' | 'backoff';
}

export interface LoadBalancingConfig {
  enabled: boolean;
  
  // Load balancing algorithm
  algorithm: 'round-robin' | 'least-connections' | 'resource-based' | 'response-time' | 'custom';
  
  // Health checking
  healthCheckEnabled: boolean;
  healthCheckInterval: number; // seconds
  unhealthyThreshold: number;
  healthyThreshold: number;
  
  // Sticky sessions
  sessionAffinity: boolean;
  affinityTimeout: number; // seconds
  
  // Failover
  failoverEnabled: boolean;
  maxFailoverAttempts: number;
  failoverDelay: number; // seconds
}

export interface NotificationConfig {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'push' | 'custom';
  
  // Notification triggers
  triggers: NotificationTrigger[];
  
  // Recipients
  recipients: NotificationRecipient[];
  
  // Message configuration
  template: string;
  subject?: string;
  
  // Delivery options
  priority: 'low' | 'normal' | 'high' | 'urgent';
  retries: number;
  retryDelay: number; // seconds
  
  // Throttling
  throttling: NotificationThrottling;
  
  // Configuration
  config: JSONObject;
}

export interface NotificationTrigger {
  event: string;
  conditions: string[];
  
  // Trigger filtering
  filters: NotificationFilter[];
  
  // Trigger timing
  delay: number; // seconds
  debounce: boolean;
  debounceWindow: number; // seconds
}

export interface NotificationFilter {
  field: string;
  operator: string;
  value: JSONValue;
}

export interface NotificationRecipient {
  type: 'user' | 'role' | 'group' | 'email' | 'external';
  identifier: string;
  
  // Recipient preferences
  preferences: RecipientPreferences;
  
  // Dynamic recipients
  dynamic: boolean;
  dynamicQuery?: string;
}

export interface RecipientPreferences {
  enabled: boolean;
  quietHours: TimeRange;
  timezone: string;
  
  // Delivery preferences
  preferredChannels: string[];
  fallbackChannels: string[];
  
  // Frequency preferences
  digest: boolean;
  digestFrequency: 'hourly' | 'daily' | 'weekly';
  maxFrequency: number; // per hour
}

export interface NotificationThrottling {
  enabled: boolean;
  maxNotifications: number;
  timeWindow: number; // seconds
  
  // Throttling behavior
  behavior: 'drop' | 'queue' | 'digest';
  queueSize?: number;
  digestInterval?: number; // seconds
}

export interface WorkflowStatistics {
  workflowId: string;
  
  // Execution statistics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  cancelledExecutions: number;
  
  // Performance statistics
  averageExecutionTime: number; // milliseconds
  minExecutionTime: number; // milliseconds
  maxExecutionTime: number; // milliseconds
  p50ExecutionTime: number; // milliseconds
  p95ExecutionTime: number; // milliseconds
  p99ExecutionTime: number; // milliseconds
  
  // Success rates
  overallSuccessRate: number; // 0-1
  successRateByTrigger: Record<string, number>;
  successRateByStep: Record<string, number>;
  
  // Resource usage
  averageResourceUsage: WorkflowResourceUsage;
  peakResourceUsage: WorkflowResourceUsage;
  
  // Error statistics
  errorRate: number; // 0-1
  errorsByType: Record<string, number>;
  errorsByStep: Record<string, number>;
  
  // Step statistics
  stepStatistics: Record<string, StepStatistics>;
  
  // Temporal statistics
  executionsByHour: Record<string, number>;
  executionsByDay: Record<string, number>;
  executionsByMonth: Record<string, number>;
  
  // User statistics
  executionsByUser: Record<string, number>;
  
  // Trigger statistics
  executionsByTrigger: Record<string, number>;
  triggerEffectiveness: Record<string, number>; // 0-1
  
  // Quality metrics
  dataQuality: number; // 0-1
  outputReliability: number; // 0-1
  userSatisfaction: number; // 0-1
  
  // Cost statistics
  totalCost: number;
  costPerExecution: number;
  costTrend: TrendData;
  
  // Time range
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface StepStatistics {
  stepId: string;
  stepName: string;
  stepType: StepType;
  
  // Execution statistics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  skippedExecutions: number;
  
  // Performance statistics
  averageExecutionTime: number; // milliseconds
  minExecutionTime: number; // milliseconds
  maxExecutionTime: number; // milliseconds
  
  // Success rate
  successRate: number; // 0-1
  
  // Error statistics
  errorRate: number; // 0-1
  errorTypes: Record<string, number>;
  
  // Resource usage
  averageResourceUsage: StepResourceUsage;
  
  // Retry statistics
  retryRate: number; // 0-1
  averageRetries: number;
  
  // Timeout statistics
  timeoutRate: number; // 0-1
  averageTimeouts: number;
}

export interface TrendData {
  values: number[];
  timestamps: Date[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number; // percentage
}

export interface WorkflowResourceUsage {
  cpu: number; // core-seconds
  memory: number; // MB-seconds
  disk: number; // MB
  network: number; // KB
  
  // Custom resources
  custom: Record<string, number>;
  
  // Cost
  cost: number;
}

export interface StepResourceUsage {
  cpu: number; // milliseconds
  memory: number; // MB
  disk: number; // KB
  network: number; // KB
  
  // Custom resources
  custom: Record<string, number>;
}

export interface EngineMetrics {
  // Engine status
  status: EngineStatus;
  uptime: number; // seconds
  
  // Execution metrics
  activeExecutions: number;
  queuedExecutions: number;
  completedExecutions: number;
  
  // Performance metrics
  throughput: number; // executions per hour
  averageQueueTime: number; // milliseconds
  averageExecutionTime: number; // milliseconds
  
  // Resource utilization
  resourceUtilization: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    network: number; // KB/s
  };
  
  // Queue statistics
  queueStatistics: {
    totalQueued: number;
    averageQueueTime: number; // milliseconds
    maxQueueTime: number; // milliseconds
    queuedByPriority: Record<string, number>;
  };
  
  // Error statistics
  errorRate: number; // 0-1
  errorsByCategory: Record<string, number>;
  
  // Health statistics
  healthScore: number; // 0-1
  healthChecks: Record<string, boolean>;
  
  // Capacity metrics
  maxCapacity: number;
  currentCapacity: number;
  capacityUtilization: number; // 0-1
  
  // SLA metrics
  slaCompliance: number; // 0-1
  slaViolations: number;
  
  // Time range
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface EngineStatus {
  state: 'starting' | 'running' | 'pausing' | 'paused' | 'stopping' | 'stopped' | 'error';
  
  // Component status
  components: {
    executor: 'healthy' | 'degraded' | 'failed';
    scheduler: 'healthy' | 'degraded' | 'failed';
    database: 'healthy' | 'degraded' | 'failed';
    messageQueue: 'healthy' | 'degraded' | 'failed';
    monitoring: 'healthy' | 'degraded' | 'failed';
  };
  
  // Version information
  version: string;
  buildVersion: string;
  
  // Configuration
  configVersion: string;
  lastConfigReload: Date;
  
  // Issues
  issues: EngineIssue[];
  warnings: string[];
  
  // Last status update
  lastUpdate: Date;
}

export interface EngineIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  impact: string;
  recommendation: string;
  
  // Issue tracking
  detectedAt: Date;
  occurrenceCount: number;
  lastOccurrence: Date;
  
  // Resolution
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
}

export interface WorkflowFilter {
  field: string;
  operator: 'eq' | 'ne' | 'contains' | 'startswith' | 'endswith' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte';
  value: JSONValue;
}

export interface ExecutionFilter {
  field: string;
  operator: 'eq' | 'ne' | 'contains' | 'startswith' | 'endswith' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte';
  value: JSONValue;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  path: string;
  severity: 'error' | 'warning' | 'info';
  
  // Error context
  context: JSONObject;
  suggestions: string[];
}

export interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  
  // Warning context
  context: JSONObject;
  recommendations: string[];
}

export interface WorkflowError {
  code: string;
  message: string;
  category: 'system' | 'user' | 'business' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Error details
  step?: string;
  timestamp: Date;
  stackTrace?: string;
  
  // Error context
  context: JSONObject;
  
  // Recovery information
  recoverable: boolean;
  retryable: boolean;
  compensatable: boolean;
  
  // Resolution
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface StepError {
  code: string;
  message: string;
  category: 'system' | 'business' | 'validation' | 'timeout' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Error details
  timestamp: Date;
  attempt: number;
  stackTrace?: string;
  
  // Error context
  inputs: JSONObject;
  outputs: JSONObject;
  config: JSONObject;
  
  // Recovery information
  recoverable: boolean;
  retryable: boolean;
  
  // Resolution
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  
  // Log context
  component: string;
  step?: string;
  
  // Structured data
  data?: JSONObject;
  
  // Correlation
  correlationId?: string;
  traceId?: string;
}

export interface WorkflowDocumentation {
  overview: string;
  purpose: string;
  prerequisites: string[];
  assumptions: string[];
  
  // Step documentation
  stepDocumentation: Record<string, StepDocumentation>;
  
  // Examples
  examples: WorkflowExample[];
  
  // Troubleshooting
  troubleshooting: TroubleshootingGuide[];
  
  // Change log
  changeLog: ChangeLogEntry[];
  
  // External references
  references: ExternalReference[];
}

export interface StepDocumentation {
  description: string;
  purpose: string;
  inputs: ParameterDocumentation[];
  outputs: ParameterDocumentation[];
  
  // Configuration
  configuration: ConfigurationDocumentation[];
  
  // Examples
  examples: StepExample[];
  
  // Error handling
  errorHandling: ErrorDocumentation[];
  
  // Performance notes
  performanceNotes: string[];
  
  // Security considerations
  securityNotes: string[];
}

export interface ParameterDocumentation {
  name: string;
  description: string;
  type: string;
  required: boolean;
  
  // Examples
  examples: JSONValue[];
  
  // Validation
  validation: string[];
  
  // Notes
  notes: string[];
}

export interface ConfigurationDocumentation {
  parameter: string;
  description: string;
  defaultValue: JSONValue;
  
  // Configuration options
  options: ConfigurationOption[];
  
  // Examples
  examples: JSONValue[];
  
  // Notes
  notes: string[];
}

export interface ConfigurationOption {
  value: JSONValue;
  description: string;
  impact: string;
  
  // Recommendations
  recommended: boolean;
  conditions: string[];
}

export interface StepExample {
  name: string;
  description: string;
  inputs: JSONObject;
  expectedOutputs: JSONObject;
  
  // Example configuration
  configuration: JSONObject;
  
  // Notes
  notes: string[];
}

export interface ErrorDocumentation {
  errorCode: string;
  description: string;
  causes: string[];
  solutions: string[];
  
  // Prevention
  prevention: string[];
  
  // Examples
  examples: JSONObject[];
}

export interface WorkflowExample {
  name: string;
  description: string;
  scenario: string;
  
  // Example parameters
  parameters: JSONObject;
  
  // Expected results
  expectedResults: JSONObject;
  
  // Notes
  notes: string[];
  
  // Variations
  variations: ExampleVariation[];
}

export interface ExampleVariation {
  name: string;
  description: string;
  parameterChanges: JSONObject;
  expectedResults: JSONObject;
  notes: string[];
}

export interface TroubleshootingGuide {
  problem: string;
  symptoms: string[];
  causes: string[];
  solutions: TroubleshootingSolution[];
  
  // Prevention
  prevention: string[];
  
  // Related issues
  relatedIssues: string[];
}

export interface TroubleshootingSolution {
  solution: string;
  steps: string[];
  impact: string;
  
  // Effectiveness
  effectiveness: number; // 0-1
  complexity: 'low' | 'medium' | 'high';
  
  // Prerequisites
  prerequisites: string[];
  
  // Warnings
  warnings: string[];
}

export interface ChangeLogEntry {
  version: string;
  date: Date;
  author: string;
  
  // Changes
  changes: Change[];
  
  // Migration notes
  migrationNotes: string[];
  
  // Breaking changes
  breakingChanges: string[];
}

export interface Change {
  type: 'feature' | 'enhancement' | 'bugfix' | 'removal' | 'deprecation' | 'security';
  description: string;
  impact: 'low' | 'medium' | 'high';
  
  // Details
  details: string[];
  
  // References
  references: string[];
}

export interface ExternalReference {
  title: string;
  url: string;
  description: string;
  type: 'documentation' | 'tutorial' | 'example' | 'specification' | 'api';
  
  // Relevance
  relevance: number; // 0-1
  
  // Maintenance
  lastChecked: Date;
  accessible: boolean;
}

export interface Condition {
  expression: string;
  language: 'javascript' | 'jq' | 'jsonpath' | 'custom';
  
  // Variables
  variables: string[];
  
  // Description
  description?: string;
  
  // Validation
  validated: boolean;
  validationErrors: string[];
}

export interface StepInput {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  
  // Source
  source: 'parameter' | 'variable' | 'step-output' | 'constant' | 'expression';
  sourceExpression?: string;
  
  // Validation
  validation?: VariableValidation;
  
  // Default value
  defaultValue?: JSONValue;
}

export interface StepOutput {
  name: string;
  type: string;
  description?: string;
  
  // Target
  target: 'variable' | 'parameter' | 'return';
  targetName?: string;
  
  // Transformation
  transformation?: string;
  transformationLanguage?: 'javascript' | 'jq' | 'jsonpath';
}

export interface VariableValidation {
  rules: ValidationRule[];
  customValidator?: string;
}

export interface ParameterValidation {
  rules: ValidationRule[];
  customValidator?: string;
}

export interface ValidationRule {
  type: 'required' | 'type' | 'range' | 'length' | 'pattern' | 'custom';
  config: JSONObject;
  message?: string;
}

export interface FieldValidation {
  rules: ValidationRule[];
  customValidator?: string;
}

export interface FormValidation {
  rules: FormValidationRule[];
  customValidator?: string;
}

export interface FormValidationRule {
  type: 'required' | 'cross-field' | 'business' | 'custom';
  config: JSONObject;
  message?: string;
  
  // Field dependencies
  dependentFields: string[];
}

export interface ConnectionStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  
  // Arrowhead
  arrowhead: boolean;
  arrowheadSize: number;
  
  // Animation
  animated: boolean;
  animationSpeed: number;
}

export interface EventFilter {
  field: string;
  operator: 'eq' | 'ne' | 'contains' | 'startswith' | 'endswith' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'regex';
  value: JSONValue;
}

// =============================================================================
// WORKFLOW EVENTS
// =============================================================================

export interface WorkflowEvents {
  // Workflow lifecycle events
  'workflow-created': (workflow: Workflow) => void;
  'workflow-updated': (workflowId: string, changes: Partial<Workflow>) => void;
  'workflow-deleted': (workflowId: string) => void;
  'workflow-activated': (workflowId: string) => void;
  'workflow-deactivated': (workflowId: string) => void;
  
  // Execution events
  'execution-started': (execution: WorkflowExecution) => void;
  'execution-completed': (execution: WorkflowExecution) => void;
  'execution-failed': (execution: WorkflowExecution, error: WorkflowError) => void;
  'execution-cancelled': (executionId: string, reason: string) => void;
  'execution-paused': (executionId: string) => void;
  'execution-resumed': (executionId: string) => void;
  
  // Step events
  'step-started': (executionId: string, step: StepExecution) => void;
  'step-completed': (executionId: string, step: StepExecution) => void;
  'step-failed': (executionId: string, step: StepExecution, error: StepError) => void;
  'step-skipped': (executionId: string, stepId: string, reason: string) => void;
  'step-retried': (executionId: string, stepId: string, attempt: number) => void;
  
  // Human task events
  'task-assigned': (taskId: string, assignee: string) => void;
  'task-claimed': (taskId: string, claimedBy: string) => void;
  'task-completed': (taskId: string, completedBy: string, data: JSONObject) => void;
  'task-escalated': (taskId: string, escalatedTo: string[], reason: string) => void;
  'task-comment-added': (taskId: string, comment: TaskComment) => void;
  
  // Trigger events
  'trigger-fired': (triggerId: string, data: JSONObject) => void;
  'trigger-failed': (triggerId: string, error: string) => void;
  'trigger-enabled': (triggerId: string) => void;
  'trigger-disabled': (triggerId: string) => void;
  
  // Performance events
  'performance-threshold-exceeded': (metric: string, value: number, threshold: number) => void;
  'resource-exhausted': (resource: string, usage: number, limit: number) => void;
  'sla-violated': (sla: string, actual: number, target: number) => void;
  
  // Engine events
  'engine-started': () => void;
  'engine-stopped': () => void;
  'engine-paused': () => void;
  'engine-resumed': () => void;
  'engine-error': (error: EngineIssue) => void;
  'health-check-failed': (component: string, error: string) => void;
  
  // Audit events
  'audit-log-created': (logEntry: AuditLogEntry) => void;
  'compliance-violation': (violation: ComplianceViolation) => void;
  'security-event': (event: SecurityEvent) => void;
  [event: string]: (...args: any[]) => void;
}