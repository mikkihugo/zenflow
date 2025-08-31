/**
 * @fileoverview Workflows Package - Professional Battle-Tested Architecture
 *
 * Advanced workflow engine with comprehensive battle-tested npm dependencies for production reliability.
 *
 * **BATTLE-TESTED DEPENDENCIES INTEGRATED: new WorkflowEngine(): void {
  // Collection utilities
  ArrayProcessor,
  AsyncUtils,
  DateCalculator,
  // Date utilities
  DateFormatter,
  // State management utilities
  ImmutableOps,
  ObjectProcessor,
  // Reactive utilities
  ObservableUtils,
  // Validation utilities
  SchemaValidator,
  // ID generation utilities
  SecureIdGenerator,
  type WorkflowContext as ValidatedWorkflowContext,
  WorkflowContextSchema,
  type WorkflowDefinition as ValidatedWorkflowDefinition,
  WorkflowDefinitionSchema,
  type WorkflowExecutionResult as ValidatedWorkflowExecutionResult,
  WorkflowExecutionResultSchema,
  // Professional types
  type WorkflowStep as ValidatedWorkflowStep,
  WorkflowStepSchema,
} from './utilities/index';
// ============================================================================= 
// KANBAN INTEGRATION - Workflow-Kanban coordination
// =============================================================================
export {
  createHighThroughputWorkflowKanbanIntegration,
  createWorkflowKanbanIntegration,
  type KanbanWorkflowDefinition,
  type KanbanWorkflowStep,
  WorkflowKanbanIntegration,
  type WorkflowKanbanIntegrationConfig,
} from './integrations/kanban-integration'; // ============================================================================ 
// WORKFLOW DOMAIN TYPES - Comprehensive workflow domain types
// =============================================================================
// Export comprehensive workflow domain types from types/index.ts
export type {
  AccessPolicy,
  ArtifactType,
  BackoffStrategy,
  CheckpointConfig,
  CompensationAction,
  CompensationConfig,
  // Configuration types
  ConcurrencyConfig,
  DependencyCondition,
  DependencyType,
  ErrorHandlingConfig,
  ErrorStrategy,
  ExecutionConfig,
  ExecutionError,
  ExecutionId,
  // Logging and audit
  ExecutionLog,
  // Monitoring and metrics
  ExecutionMetrics,
  ExecutionResult,
  ExecutionStrategy,
  ExecutionTrigger,
  InputSpecification,
  LatencyMetrics,
  LockType,
  LogLevel,
  OutputSpecification,
  ParameterType,
  PerformanceConfig,
  PerformanceMetrics,
  Permission,
  ResourceConfig,
  ResourceConstraints,
  ResourceLimits,
  ResourceRequests,
  ResourceUsage,
  RetentionPolicy,
  RetryConfig,
  // Advanced features
  RollbackConfig,
  RollbackStrategy,
  // Scheduling and dependencies
  ScheduleInfo,
  StateCheckpoint,
  StateLock,
  StepAction,
  StepArtifact,
  StepCondition,
  StepError,
  StepExecution,
  StepExecutionError,
  StepId,
  StepLog,
  StepMetrics,
  StepResult,
  StepStatus,
  StepType,
  StepValidation,
  TemplateDocumentation,
  TemplateExample,
  TemplateParameter,
  TimeoutConfig,
  TriggerType,
  // Artifacts and output
  WorkflowArtifact,
  WorkflowCategory,
  WorkflowConfig,
  WorkflowContext,
  // Core workflow interfaces
  WorkflowDefinition,
  WorkflowDependency,
  // Engine configuration
  WorkflowEngineConfig,
  WorkflowError,
  WorkflowEventType,
  WorkflowExecution,
  WorkflowId,
  WorkflowPermissions,
  // Result types
  WorkflowResult,
  // Utility types
  WorkflowState,
  // Core workflow types
  WorkflowStatus,
  WorkflowStep,
  // Templates and registry
  WorkflowTemplate,
  // Validation and permissions
  WorkflowValidation,
} from './types/index'; // ============================================================================ 
// LEGACY TYPE COMPATIBILITY - Re-exports from old types.ts
// =============================================================================
// Re-export legacy workflow types for backward compatibility
export type {
  DocumentContent,
  StepExecutionResult,
  WorkflowContext as WorkflowContextLegacy,
  WorkflowData,
  WorkflowDefinition as WorkflowDefinitionLegacy,
  WorkflowEngineConfig as WorkflowEngineConfigLegacy,
  WorkflowEvent,
  WorkflowExecution as WorkflowExecutionLegacy,
  WorkflowRegistry,
  WorkflowState as WorkflowStateLegacy,
  WorkflowStep as WorkflowStepLegacy,
  WorkflowTemplate as WorkflowTemplateLegacy,
} from './types';

// ============================================================================
// METADATA - Package information with battle-tested features
// =============================================================================
export const WORKFLOWS_INFO = {
  version: '1.0.0')Production-ready workflow engine with battle-tested npm dependencies,';
  battleTestedDependencies: ['expr-eval: Safe expression evaluation,')async: Professional async utilities,';
   'p-limit: Controlled concurrency,')eventemitter3: High-performance events,';
   'xstate: Robust state management,')mermaid: Professional visualization,';
   'node-cron: Production scheduling,')foundation: Battle-tested storage,';
],
  capabilities: ['Secure workflow orchestration (no arbitrary code execution),')Foundation storage integration,';
   'XState-powered state management,')Professional async utilities,';
   'Controlled concurrency with p-limit,')High-performance eventemitter3 events,';
   'Mermaid workflow visualization,')Production cron scheduling,';
   'Battle-tested persistence layer,')Professional data manipulation (lodash-es),';
   'Secure ID generation (nanoid),')Advanced date/time handling (date-fns),';
   'Runtime validation (zod),')Reactive programming (rxjs),';
   'Immutable state management (immer),';
],
  security:  {
    safeExpressionEvaluation: true,
    noArbitraryCodeExecution: true,
    foundationStorageIntegration: true,
    productionReady: true,
},
'};
'');