/**
 * Workflow System Type Definitions
 *
 * Comprehensive TypeScript types for workflow engine.
 * Replaces loose 'any' types with strict, type-safe interfaces.
 * Following Google TypeScript Style Guide.
 *
 * @file Strict workflow type definitions
 */

/**
 * Document types supported by the workflow system
 */
export type DocumentType =
  | 'vision'
  | 'adr'
  | 'prd'
  | 'epic'
  | 'feature'
  | 'task'
  | 'code'
  | 'test'
  | 'documentation';

/**
 * Workflow step execution status
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'retrying';

/**
 * Workflow execution status
 */
export type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Error handling strategies for workflow steps
 */
export type ErrorHandlingStrategy =
  | 'stop' // Stop workflow execution
  | 'continue' // Continue to next step
  | 'skip' // Skip remaining steps
  | 'retry'; // Retry current step

/**
 * Supported parameter types for workflow steps
 */
export type WorkflowParameterValue =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly number[]
  | WorkflowParameterObject;

export interface WorkflowParameterObject {
  readonly [key: string]: WorkflowParameterValue;
}

/**
 * Document content structure
 *
 * @example
 */
export interface DocumentContent {
  readonly id: string;
  readonly type: DocumentType;
  readonly title: string;
  readonly content: string;
  readonly metadata: DocumentMetadata;
  readonly created: Date;
  readonly updated: Date;
  readonly version: string;
}

/**
 * Document metadata
 *
 * @example
 */
export interface DocumentMetadata {
  readonly author?: string;
  readonly tags: readonly string[];
  readonly status: 'draft' | 'review' | 'approved' | 'archived';
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly dependencies: readonly string[];
  readonly relatedDocuments: readonly string[];
  readonly checksum?: string;
}

/**
 * Workflow step execution result
 *
 * @example
 */
export interface StepExecutionResult {
  readonly success: boolean;
  readonly data?: WorkflowData;
  readonly error?: WorkflowError;
  readonly duration: number;
  readonly timestamp: Date;
  readonly metadata?: WorkflowResultMetadata;
}

/**
 * Information about a completed workflow step
 * 
 * @example
 */
export interface CompletedStepInfo {
  readonly index: number;
  readonly step: WorkflowStep;
  readonly result: StepExecutionResult;
  readonly duration: number;
  readonly timestamp: Date;
  readonly retryCount: number;
}

/**
 * Workflow result metadata
 *
 * @example
 */
export interface WorkflowResultMetadata {
  readonly stepType: string;
  readonly attemptNumber: number;
  readonly resourcesUsed?: ResourceUsage;
  readonly warnings: readonly string[];
}

/**
 * Resource usage tracking
 *
 * @example
 */
export interface ResourceUsage {
  readonly cpuTime: number;
  readonly memoryPeak: number;
  readonly diskIo: number;
  readonly networkRequests: number;
}

/**
 * Workflow error information
 *
 * @example
 */
export interface WorkflowError {
  readonly code: string;
  readonly message: string;
  readonly stack?: string;
  readonly context?: WorkflowErrorContext;
  readonly recoverable: boolean;
}

/**
 * Workflow error context
 *
 * @example
 */
export interface WorkflowErrorContext {
  readonly stepIndex: number;
  readonly stepName: string;
  readonly input: WorkflowData;
  readonly timestamp: Date;
  readonly retryCount: number;
}

/**
 * Workflow data container
 *
 * @example
 */
export interface WorkflowData {
  readonly [key: string]: WorkflowDataValue;
}

/**
 * Supported workflow data types
 */
export type WorkflowDataValue =
  | string
  | number
  | boolean
  | Date
  | readonly WorkflowDataValue[]
  | DocumentContent
  | WorkflowDataObject
  | null
  | undefined;

export interface WorkflowDataObject {
  readonly [key: string]: WorkflowDataValue;
}

/**
 * Workflow step definition with strict typing
 *
 * @example
 */
export interface WorkflowStep {
  readonly type: string;
  readonly name?: string;
  readonly description?: string;
  readonly params?: WorkflowParameterObject;
  readonly retries?: number;
  readonly timeout?: number;
  readonly output?: string;
  readonly onError?: ErrorHandlingStrategy;
  readonly dependencies?: readonly string[];
  readonly conditions?: readonly WorkflowCondition[];
  readonly validators?: readonly WorkflowValidator[];
}

/**
 * Workflow condition for conditional execution
 *
 * @example
 */
export interface WorkflowCondition {
  readonly field: string;
  readonly operator: 'equals' | 'notEquals' | 'contains' | 'exists' | 'isEmpty';
  readonly value?: WorkflowDataValue;
  readonly description?: string;
}

/**
 * Workflow step validator
 *
 * @example
 */
export interface WorkflowValidator {
  readonly type: 'required' | 'format' | 'range' | 'custom';
  readonly field: string;
  readonly params?: WorkflowParameterObject;
  readonly message?: string;
}

/**
 * Workflow definition with strict typing
 *
 * @example
 */
export interface WorkflowDefinition {
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  readonly steps: readonly WorkflowStep[];
  readonly documentTypes?: readonly DocumentType[];
  readonly triggers?: readonly WorkflowTrigger[];
  readonly variables?: readonly WorkflowVariable[];
  readonly timeout?: number;
  readonly maxRetries?: number;
  readonly parallel?: boolean;
}

/**
 * Workflow trigger configuration
 *
 * @example
 */
export interface WorkflowTrigger {
  readonly event: WorkflowEvent;
  readonly condition?: string;
  readonly priority?: number;
  readonly debounce?: number;
}

/**
 * Supported workflow events
 */
export type WorkflowEvent =
  | 'document:created'
  | 'document:updated'
  | 'document:deleted'
  | 'document:approved'
  | 'workflow:completed'
  | 'workflow:failed'
  | 'step:completed'
  | 'manual:trigger';

/**
 * Workflow variable definition
 *
 * @example
 */
export interface WorkflowVariable {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly defaultValue?: WorkflowDataValue;
  readonly required?: boolean;
  readonly description?: string;
}

/**
 * Workflow execution context with strict typing
 *
 * @example
 */
export interface WorkflowContext {
  readonly workspaceId: string;
  readonly workspacePath?: string;
  readonly userId?: string;
  readonly sessionId: string;
  readonly documents: WorkflowDocumentRegistry;
  readonly currentDocument?: DocumentContent;
  readonly variables: WorkflowData;
  readonly environment: WorkflowEnvironment;
  readonly permissions: WorkflowPermissions;
}

/**
 * Document registry for workflow context
 *
 * @example
 */
export interface WorkflowDocumentRegistry {
  readonly [documentId: string]: DocumentContent;
}

/**
 * Workflow execution environment
 *
 * @example
 */
export interface WorkflowEnvironment {
  readonly type: 'development' | 'staging' | 'production';
  readonly nodeVersion: string;
  readonly workflowVersion: string;
  readonly features: readonly string[];
  readonly limits: WorkflowLimits;
}

/**
 * Workflow execution limits
 *
 * @example
 */
export interface WorkflowLimits {
  readonly maxSteps: number;
  readonly maxDuration: number;
  readonly maxMemory: number;
  readonly maxFileSize: number;
  readonly maxConcurrency: number;
}

/**
 * Workflow permissions
 *
 * @example
 */
export interface WorkflowPermissions {
  readonly canReadDocuments: boolean;
  readonly canWriteDocuments: boolean;
  readonly canDeleteDocuments: boolean;
  readonly canExecuteSteps: readonly string[];
  readonly canAccessResources: readonly string[];
}

/**
 * Workflow execution state with strict typing
 *
 * @example
 */
export interface WorkflowState {
  readonly id: string;
  readonly definition: WorkflowDefinition;
  readonly status: WorkflowStatus;
  readonly context: WorkflowContext;
  readonly currentStepIndex: number;
  readonly steps: readonly WorkflowStepState[];
  readonly stepResults: WorkflowStepResults;
  readonly completedSteps: readonly CompletedStepInfo[];
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly pausedAt?: Date;
  readonly error?: WorkflowError;
  readonly progress: WorkflowProgress;
  readonly metrics: WorkflowMetrics;
}

/**
 * Individual step execution state
 *
 * @example
 */
export interface WorkflowStepState {
  readonly step: WorkflowStep;
  readonly status: StepStatus;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly attempts: number;
  readonly result?: StepExecutionResult;
  readonly error?: WorkflowError;
}

/**
 * Workflow step results registry
 *
 * @example
 */
export interface WorkflowStepResults {
  readonly [stepName: string]: StepExecutionResult;
}


/**
 * Workflow execution progress
 *
 * @example
 */
export interface WorkflowProgress {
  readonly percentage: number;
  readonly completedSteps: number;
  readonly totalSteps: number;
  readonly estimatedTimeRemaining?: number;
  readonly currentStepName?: string;
}

/**
 * Workflow execution metrics
 *
 * @example
 */
export interface WorkflowMetrics {
  readonly totalDuration: number;
  readonly avgStepDuration: number;
  readonly successRate: number;
  readonly retryRate: number;
  readonly resourceUsage: ResourceUsage;
  readonly throughput: number;
}

/**
 * Workflow execution options
 *
 * @example
 */
export interface WorkflowExecutionOptions {
  readonly dryRun?: boolean;
  readonly skipValidation?: boolean;
  readonly maxConcurrency?: number;
  readonly timeout?: number;
  readonly retryPolicy?: RetryPolicy;
  readonly notifications?: NotificationConfig;
  readonly logging?: LoggingConfig;
}

/**
 * Retry policy configuration
 *
 * @example
 */
export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly initialDelay: number;
  readonly maxDelay: number;
  readonly backoffMultiplier: number;
  readonly retryableErrors: readonly string[];
}

/**
 * Notification configuration
 *
 * @example
 */
export interface NotificationConfig {
  readonly onComplete?: boolean;
  readonly onError?: boolean;
  readonly onStepComplete?: boolean;
  readonly channels: readonly NotificationChannel[];
}

/**
 * Notification channel
 *
 * @example
 */
export interface NotificationChannel {
  readonly type: 'email' | 'slack' | 'webhook' | 'console';
  readonly config: NotificationChannelConfig;
}

/**
 * Notification channel configuration
 *
 * @example
 */
export interface NotificationChannelConfig {
  readonly [key: string]: WorkflowDataValue;
}

/**
 * Logging configuration
 *
 * @example
 */
export interface LoggingConfig {
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly includeStepDetails: boolean;
  readonly includeContext: boolean;
  readonly structuredLogging: boolean;
}

/**
 * Workflow engine configuration
 *
 * @example
 */
export interface WorkflowEngineConfig {
  readonly workspaceRoot: string;
  readonly templatesPath: string;
  readonly outputPath: string;
  readonly maxConcurrentWorkflows: number;
  readonly defaultTimeout: number;
  readonly enableMetrics: boolean;
  readonly enablePersistence: boolean;
  readonly storageBackend: StorageBackend;
}

/**
 * Storage backend configuration
 *
 * @example
 */
export interface StorageBackend {
  readonly type: 'memory' | 'file' | 'database';
  readonly config: StorageBackendConfig;
}

/**
 * Storage backend configuration
 *
 * @example
 */
export interface StorageBackendConfig {
  readonly [key: string]: WorkflowDataValue;
}
