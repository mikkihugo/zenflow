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

// =============================================================================
// MAIN WORKFLOW ENGINE - Battle-tested with modern npm packages
// =============================================================================

export { 
  WorkflowEngine as default, 
  WorkflowEngine,
  type WorkflowDefinition,
  type WorkflowContext,
  type WorkflowState,
  type WorkflowEngineConfig,
  type WorkflowStep
} from './main';

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
    'Battle-tested persistence layer'
  ],
  security: {
    safeExpressionEvaluation: true,
    noArbitraryCodeExecution: true,
    foundationStorageIntegration: true,
    productionReady: true
  }
};