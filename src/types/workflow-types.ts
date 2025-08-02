/**
 * Workflow System Type Definitions
 *
 * Comprehensive TypeScript types for workflow engine.
 * Replaces loose 'any' types with strict, type-safe interfaces.
 * Following Google TypeScript Style Guide.
 *
 * @fileoverview Strict workflow type definitions
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
 * Workflow result metadata
 */
export interface WorkflowResultMetadata {
  readonly stepType: string;
  readonly attemptNumber: number;
  readonly resourcesUsed?: ResourceUsage;
  readonly warnings: readonly string[];
}

/**
 * Resource usage tracking
 */
export interface ResourceUsage {
  readonly cpuTime: number;
  readonly memoryPeak: number;
  readonly diskIo: number;
  readonly networkRequests: number;
}

/**
 * Workflow error information
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
 */
export interface WorkflowCondition {
  readonly field: string;
  readonly operator: 'equals' | 'notEquals' | 'contains' | 'exists' | 'isEmpty';
  readonly value?: WorkflowDataValue;
  readonly description?: string;
}

/**
 * Workflow step validator
 */
export interface WorkflowValidator {
  readonly type: 'required' | 'format' | 'range' | 'custom';
  readonly field: string;
  readonly params?: WorkflowParameterObject;
  readonly message?: string;
}

/**
 * Workflow definition with strict typing
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
 */
export interface WorkflowDocumentRegistry {
  readonly [documentId: string]: DocumentContent;
}

/**
 * Workflow execution environment
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
 */
export interface WorkflowStepResults {
  readonly [stepName: string]: StepExecutionResult;
}

/**
 * Completed step information
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
 * Workflow execution progress
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
 */
export interface NotificationConfig {
  readonly onComplete?: boolean;
  readonly onError?: boolean;
  readonly onStepComplete?: boolean;
  readonly channels: readonly NotificationChannel[];
}

/**
 * Notification channel
 */
export interface NotificationChannel {
  readonly type: 'email' | 'slack' | 'webhook' | 'console';
  readonly config: NotificationChannelConfig;
}

/**
 * Notification channel configuration
 */
export interface NotificationChannelConfig {
  readonly [key: string]: WorkflowDataValue;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly includeStepDetails: boolean;
  readonly includeContext: boolean;
  readonly structuredLogging: boolean;
}

/**
 * Workflow engine configuration
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
 */
export interface StorageBackend {
  readonly type: 'memory' | 'file' | 'database';
  readonly config: StorageBackendConfig;
}

/**
 * Storage backend configuration
 */
export interface StorageBackendConfig {
  readonly [key: string]: WorkflowDataValue;
}
