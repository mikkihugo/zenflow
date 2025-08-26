/**
 * @fileoverview Workflows Package - Professional Battle-Tested Architecture
 *
 * Advanced workflow engine with comprehensive battle-tested npm dependencies for production reliability.
 * Now includes integrated multi-level orchestration for Portfolio → Program → Swarm coordination.
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
 * - Multi-level orchestration (Portfolio → Program → Swarm execution)
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
 * @example Multi-level orchestration usage
 * ```typescript
 * import { OrchestrationLevel, type WIPLimits } from '@claude-zen/workflows';
 *
 * const wipLimits: WIPLimits = {
 *   portfolioItems: 5,
 *   programItems: 10,
 *   executionItems: 20,
 *   totalSystemItems: 35
 * };
 * ```
 */

// =============================================================================
// MAIN WORKFLOW ENGINE - Battle-tested with modern npm packages
// =============================================================================

export { WorkflowEngine as default, WorkflowEngine } from './main';

// =============================================================================
// PROFESSIONAL UTILITIES - Library Integrations
// =============================================================================

export {
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
// WORKFLOW DOMAIN TYPES - Comprehensive workflow domain types
// =============================================================================

// Export comprehensive workflow domain types from types/index.ts
export type {
  AccessPolicy,
  ArtifactType,
  CoordinationEvent,
  CoordinationEventType,
  CoordinationLevel,
  CoordinationMetadata,
  CoordinationType,
  DocumentImportOptions,
  DocumentImportResult,
  DocumentType,
  ErrorHandlingPolicy,
  ImportedWorkflowStep,
  ParallelCoordinationMode,
  Priority,
  ResourceRequirement,
  WorkflowArtifact,
  WorkflowCoordinationConfig,
  WorkflowCoordinationType,
  WorkflowDocumentImport,
  WorkflowImportConfig,
  WorkflowImportMetadata,
  WorkflowImportResult,
} from './types/index';

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

// =============================================================================
// MULTI-LEVEL ORCHESTRATION - Integrated Portfolio → Program → Swarm coordination
// =============================================================================

export {
  // Orchestration enums
  OrchestrationLevel,
  SPARCPhase,
} from './multi-level/index';

export type {
  // Core orchestration types
  WIPLimits,
  FlowMetrics,
  BottleneckInfo,
  StreamStatus,
  StreamMetrics,
  StreamConfiguration,
  WorkflowStream,
  
  // Work item types
  PortfolioItem,
  ProgramItem,
  SwarmExecutionItem,
  SuccessMetric,
  TechnicalSpecification,
  CodeArtifact,
  QualityGate,
  QualityGateResult,
  
  // Coordination types
  CrossLevelDependency,
  OptimizationRecommendation,
  MultiLevelOrchestratorState,
  SystemPerformanceMetrics,
  
  // SPARC integration
  SPARCProjectRef,
} from './multi-level/index';

// =============================================================================
// METADATA - Package information with battle-tested features
// =============================================================================

export const WORKFLOWS_INFO = {
  version: '1.0.0',
  name: '@claude-zen/workflows',
  description:
    'Production-ready workflow engine with battle-tested npm dependencies and multi-level orchestration',
  battleTestedDependencies: [
    'expr-eval: Safe expression evaluation',
    'async: Professional async utilities',
    'p-limit: Controlled concurrency',
    'eventemitter3: High-performance events',
    'xstate: Robust state management',
    'mermaid: Professional visualization',
    'node-cron: Production scheduling',
    'foundation: Battle-tested storage',
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
    'Immutable state management (immer)',
    'Multi-level orchestration (Portfolio → Program → Swarm)',
  ],
  security: {
    safeExpressionEvaluation: true,
    noArbitraryCodeExecution: true,
    foundationStorageIntegration: true,
    productionReady: true,
  },
};