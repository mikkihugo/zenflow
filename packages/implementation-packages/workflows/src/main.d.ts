/**
 * @fileoverview Workflows Package - Professional Battle-Tested Architecture
 *
 * Advanced workflow engine with battle-tested npm dependencies for production reliability.
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
export { WorkflowEngine as default, WorkflowEngine } from './engine';
export type {
  WorkflowStep,
  WorkflowDefinition,
  WorkflowContext,
  DocumentContent,
  StepExecutionResult,
  WorkflowData,
  WorkflowState,
  WorkflowEngineConfig,
} from './engine';
export declare function getWorkflowSystemAccess(
  config?: WorkflowEngineConfig
): Promise<any>;
export declare function getWorkflowEngine(
  config?: WorkflowEngineConfig
): Promise<WorkflowEngine>;
export declare function getWorkflowOrchestration(
  config?: WorkflowEngineConfig
): Promise<any>;
export declare function getWorkflowManagement(
  config?: WorkflowEngineConfig
): Promise<any>;
export declare function getWorkflowVisualization(
  config?: WorkflowEngineConfig
): Promise<any>;
export declare const workflowSystem: {
  getAccess: typeof getWorkflowSystemAccess;
  getEngine: typeof getWorkflowEngine;
  getOrchestration: typeof getWorkflowOrchestration;
  getManagement: typeof getWorkflowManagement;
  getVisualization: typeof getWorkflowVisualization;
  createEngine: (config?: WorkflowEngineConfig) => any;
};
export declare const WORKFLOWS_INFO: {
  readonly version: '1.0.0';
  readonly name: '@claude-zen/workflows';
  readonly description: 'Production-ready workflow engine with battle-tested npm dependencies';
  readonly battleTestedDependencies: readonly [
    'expr-eval: Safe expression evaluation',
    'async: Professional async utilities',
    'p-limit: Controlled concurrency',
    'eventemitter3: High-performance events',
    'xstate: Robust state management',
    'mermaid: Professional visualization',
    'node-cron: Production scheduling',
    'foundation: Battle-tested storage',
  ];
  readonly capabilities: readonly [
    'Secure workflow orchestration (no arbitrary code execution)',
    'Foundation storage integration',
    'XState-powered state management',
    'Professional async utilities',
    'Controlled concurrency with p-limit',
    'High-performance eventemitter3 events',
    'Mermaid workflow visualization',
    'Production cron scheduling',
    'Battle-tested persistence layer',
  ];
  readonly security: {
    readonly safeExpressionEvaluation: true;
    readonly noArbitraryCodeExecution: true;
    readonly foundationStorageIntegration: true;
    readonly productionReady: true;
  };
};
//# sourceMappingURL=main.d.ts.map
