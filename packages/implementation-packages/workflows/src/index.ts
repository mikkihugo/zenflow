/**
 * @fileoverview Workflows Package - Professional Battle-Tested Architecture
 *
 * Advanced workflow engine with comprehensive battle-tested npm dependencies for production reliability.
 *
 * **BATTLE-TESTED DEPENDENCIES INTEGRATED:**
 * - expr-eval: Safe expression evaluation (replaces dangerous new Function())
 * - async: Professional async utilities for step execution
 * - p-limit: Controlled concurrency for parallel operations
 * - eventemitter3: High-performance event system
 * - xstate: Robust state management for workflows
 * - mermaid: Professional workflow visualization
 * - node-cron: Production-ready scheduling
 * - foundation storage: Battle-tested persistence layer
 * - **lodash-es: Data manipulation utilities (40M+ weekly downloads)**
 * - **date-fns: Date calculations and formatting (15M+ weekly downloads)**
 * - **nanoid: Secure ID generation (10M+ weekly downloads)**
 * - **zod: Schema validation (10M+ weekly downloads)**
 * - **rxjs: Reactive programming (15M+ weekly downloads)**
 * - **immer: Immutable updates (10M+ weekly downloads)**
 *
 * Key Features:
 * - Tree-shakable exports for optimal bundle size
 * - Professional naming conventions
 * - Security-first architecture (no arbitrary code execution)
 * - Foundation storage integration (leverages existing battle-tested infrastructure)
 * - Type-safe workflow orchestration
 *
 * @example Basic workflow engine usage
 * ```typescript
 * import { WorkflowEngine } from '@claude-zen/workflows';
 *
 * const engine = new WorkflowEngine({
 *   persistWorkflows: true,
 *   enableVisualization: true
 * });
 *
 * await engine.initialize();
 * const result = await engine.startWorkflow(workflowDefinition);
 * ```
 *
 * @example Advanced scheduling and state management
 * ```typescript
 * import { WorkflowEngine } from '@claude-zen/workflows';
 *
 * const engine = new WorkflowEngine();
 *
 * // Schedule workflow with cron
 * const scheduleId = engine.scheduleWorkflow('0 9 * * *', 'daily-report');
 *
 * // Generate Mermaid visualization
 * const diagram = engine.generateWorkflowVisualization(workflow);
 * ```
 */

// =============================================================================
// MAIN WORKFLOW ENGINE - Battle-tested with modern npm packages
// =============================================================================

export { 
  WorkflowEngine as default, 
  WorkflowEngine
} from './main';

// =============================================================================
// PROFESSIONAL UTILITIES - Library Integrations
// =============================================================================

export {
  // Date utilities
  DateFormatter,
  DateCalculator,
  // Collection utilities  
  ArrayProcessor,
  ObjectProcessor,
  // ID generation utilities
  SecureIdGenerator,
  // Validation utilities
  SchemaValidator,
  WorkflowStepSchema,
  WorkflowDefinitionSchema,
  WorkflowContextSchema,
  WorkflowExecutionResultSchema,
  // Reactive utilities
  ObservableUtils,
  AsyncUtils,
  // State management utilities
  ImmutableOps,
  // Professional types
  type WorkflowStep as ValidatedWorkflowStep,
  type WorkflowDefinition as ValidatedWorkflowDefinition,
  type WorkflowContext as ValidatedWorkflowContext,
  type WorkflowExecutionResult as ValidatedWorkflowExecutionResult
} from './utilities/index';

// =============================================================================
// WORKFLOW DOMAIN TYPES - Comprehensive workflow domain types  
// =============================================================================

// Export comprehensive workflow domain types from types/index.ts
export type {
  // Core workflow types
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
  
  // Core workflow interfaces
  WorkflowDefinition,
  WorkflowConfig,
  WorkflowStep,
  StepAction,
  StepCondition,
  WorkflowExecution,
  ExecutionTrigger,
  WorkflowContext,
  StepExecution,
  StepError,
  
  // Configuration types
  ConcurrencyConfig,
  RetryConfig,
  TimeoutConfig,
  ErrorHandlingConfig,
  ResourceConfig,
  ResourceLimits,
  ResourceRequests,
  ResourceConstraints,
  
  // Scheduling and dependencies
  ScheduleInfo,
  WorkflowDependency,
  DependencyCondition,
  
  // Monitoring and metrics
  ExecutionMetrics,
  ResourceUsage,
  PerformanceMetrics,
  LatencyMetrics,
  StepMetrics,
  
  // Logging and audit
  ExecutionLog,
  StepLog,
  
  // Artifacts and output
  WorkflowArtifact,
  StepArtifact,
  RetentionPolicy,
  AccessPolicy,
  
  // Templates and registry
  WorkflowTemplate,
  TemplateParameter,
  TemplateExample,
  TemplateDocumentation,
  
  // Validation and permissions
  WorkflowValidation,
  WorkflowPermissions,
  Permission,
  StepValidation,
  InputSpecification,
  OutputSpecification,
  
  // Advanced features
  RollbackConfig,
  CheckpointConfig,
  CompensationConfig,
  CompensationAction,
  
  // Engine configuration
  WorkflowEngineConfig,
  ExecutionConfig,
  PerformanceConfig,
  
  // Utility types
  WorkflowState,
  StateCheckpoint,
  StateLock,
  WorkflowId,
  ExecutionId,
  StepId,
  WorkflowEventType,
  
  // Result types
  WorkflowResult,
  ExecutionResult,
  StepResult,
  WorkflowError,
  ExecutionError,
  StepExecutionError
} from './types/index';

// =============================================================================
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
  WorkflowState as WorkflowStateLegacy,
  WorkflowStep as WorkflowStepLegacy,
  WorkflowTemplate as WorkflowTemplateLegacy,
  WorkflowExecution as WorkflowExecutionLegacy,
  WorkflowRegistry,
  WorkflowEvent
} from './types';

// =============================================================================
// METADATA - Package information with battle-tested features
// =============================================================================

export const WORKFLOWS_INFO = {
  version: '1.0.0',
  name: '@claude-zen/workflows',
  description: 'Production-ready workflow engine with battle-tested npm dependencies',
  battleTestedDependencies: [
    'expr-eval: Safe expression evaluation',
    'async: Professional async utilities',
    'p-limit: Controlled concurrency',
    'eventemitter3: High-performance events',
    'xstate: Robust state management',
    'mermaid: Professional visualization',
    'node-cron: Production scheduling',
    'foundation: Battle-tested storage'
  ],
  capabilities: [
    'Secure workflow orchestration (no arbitrary code execution)',
    'Foundation storage integration',
    'XState-powered state management',
    'Professional async utilities',
    'Controlled concurrency with p-limit',
    'High-performance eventemitter3 events',
    'Mermaid workflow visualization',
    'Production cron scheduling',
    'Battle-tested persistence layer',
    'Professional data manipulation (lodash-es)',
    'Secure ID generation (nanoid)',
    'Advanced date/time handling (date-fns)',
    'Runtime validation (zod)',
    'Reactive programming (rxjs)',
    'Immutable state management (immer)'
  ],
  security: {
    safeExpressionEvaluation: true,
    noArbitraryCodeExecution: true,
    foundationStorageIntegration: true,
    productionReady: true
  }
};