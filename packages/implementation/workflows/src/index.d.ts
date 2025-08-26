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
 * ```typescript`
 * import { WorkflowEngine } from '@claude-zen/workflows';
 *
 * const engine = new WorkflowEngine({
 *   persistWorkflows: true,
 *   enableVisualization: true
 * });
 *
 * await engine.initialize();
 * const result = await engine.startWorkflow(workflowDefinition);
 * ````
 *
 * @example Advanced scheduling and state management
 * ```typescript`
 * import { WorkflowEngine } from '@claude-zen/workflows';
 *
 * const engine = new WorkflowEngine();
 *
 * // Schedule workflow with cron
 * const scheduleId = engine.scheduleWorkflow('0 9 * * *', 'daily-report');'
 *
 * // Generate Mermaid visualization
 * const diagram = engine.generateWorkflowVisualization(workflow);
 * ````
 */
export { WorkflowEngine as default, WorkflowEngine } from "./main";
export {
	DateFormatter,
	DateCalculator,
	ArrayProcessor,
	ObjectProcessor,
	SecureIdGenerator,
	SchemaValidator,
	WorkflowStepSchema,
	WorkflowDefinitionSchema,
	WorkflowContextSchema,
	WorkflowExecutionResultSchema,
	ObservableUtils,
	AsyncUtils,
	ImmutableOps,
	type WorkflowStep as ValidatedWorkflowStep,
	type WorkflowDefinition as ValidatedWorkflowDefinition,
	type WorkflowContext as ValidatedWorkflowContext,
	type WorkflowExecutionResult as ValidatedWorkflowExecutionResult,
} from "./utilities/index";
export type {
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
	ConcurrencyConfig,
	RetryConfig,
	TimeoutConfig,
	ErrorHandlingConfig,
	ResourceConfig,
	ResourceLimits,
	ResourceRequests,
	ResourceConstraints,
	ScheduleInfo,
	WorkflowDependency,
	DependencyCondition,
	ExecutionMetrics,
	ResourceUsage,
	PerformanceMetrics,
	LatencyMetrics,
	StepMetrics,
	ExecutionLog,
	StepLog,
	WorkflowArtifact,
	StepArtifact,
	RetentionPolicy,
	AccessPolicy,
	WorkflowTemplate,
	TemplateParameter,
	TemplateExample,
	TemplateDocumentation,
	WorkflowValidation,
	WorkflowPermissions,
	Permission,
	StepValidation,
	InputSpecification,
	OutputSpecification,
	RollbackConfig,
	CheckpointConfig,
	CompensationConfig,
	CompensationAction,
	WorkflowEngineConfig,
	ExecutionConfig,
	PerformanceConfig,
	WorkflowState,
	StateCheckpoint,
	StateLock,
	WorkflowId,
	ExecutionId,
	StepId,
	WorkflowEventType,
	WorkflowResult,
	ExecutionResult,
	StepResult,
	WorkflowError,
	ExecutionError,
	StepExecutionError,
} from "./types/index";
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
	WorkflowEvent,
} from "./types";
export declare const WORKFLOWS_INFO: {
	version: string;
	name: string;
	description: string;
	battleTestedDependencies: string[];
	capabilities: string[];
	security: {
		safeExpressionEvaluation: boolean;
		noArbitraryCodeExecution: boolean;
		foundationStorageIntegration: boolean;
		productionReady: boolean;
	};
};
//# sourceMappingURL=index.d.ts.map
