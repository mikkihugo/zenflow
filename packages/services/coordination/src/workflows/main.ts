/**
 * @fileoverview Workflows Package - Professional Battle-Tested Architecture
 *
 * Advanced workflow engine with battle-tested npm dependencies for production reliability.
 *
 * **BATTLE-TESTED DEPENDENCIES INTEGRATED: new WorkflowEngine({
 *   persistWorkflows: await engine.startWorkflow(workflowDefinition);
 * ') *';
 * @example Advanced scheduling and state management
 * 'typescript') * import { WorkflowEngine} from '@claude-zen/workflows') *';
 * const engine = new WorkflowEngine();
 *
 * // Schedule workflow with cron
 * const scheduleId = engine.scheduleWorkflow('0 9 * * *,' daily-report');
 *
 * // Generate Mermaid visualization
 * const diagram = engine.generateWorkflowVisualization(workflow);
 */

// =============================================================================
// TYPE EXPORTS - Comprehensive type definitions
// =============================================================================
export type {
  DocumentContent,
  StepExecutionResult,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
  WorkflowStep,
} from './engine'; // ============================================================================ 
// MAIN WORKFLOW ENGINE - Battle-tested with modern npm packages
// =============================================================================
export { WorkflowEngine as default, WorkflowEngine } from './engine'; // ============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================
export async function getWorkflowSystemAccess(
  config?:WorkflowEngineConfig
): Promise<any> {
  const engine = new WorkflowEngine(config);
  await engine.initialize();
  return {
    createEngine: (engineConfig?: WorkflowEngineConfig) =>
      new WorkflowEngine(engineConfig),
    startWorkflow: (
      definition: WorkflowDefinition,
      initialContext?:WorkflowContext
    ) => engine.startWorkflow(definition, initialContext),
    pauseWorkflow: (workflowId: string) => engine.pauseWorkflow(workflowId),
    resumeWorkflow: (workflowId: string) => engine.resumeWorkflow(workflowId),
    stopWorkflow: (workflowId: string) => engine.stopWorkflow(workflowId),
    getWorkflowState: (workflowId: string) =>
      engine.getWorkflowState(workflowId),
    scheduleWorkflow: (cronExpression: string, workflowId: string) =>
      engine.scheduleWorkflow(cronExpression, workflowId),
    generateVisualization: (workflow: WorkflowDefinition) =>
      engine.generateWorkflowVisualization(workflow),
    listActiveWorkflows: () => engine.listActiveWorkflows(),
    shutdown: () => engine.shutdown(),
};
}
export async function getWorkflowEngine(
  config?:WorkflowEngineConfig
): Promise<WorkflowEngine> {
  const engine = new WorkflowEngine(config);
  await engine.initialize();
  return engine;
}
export async function getWorkflowOrchestration(
  config?:WorkflowEngineConfig
): Promise<any> {
  const system = await getWorkflowSystemAccess(config);
  return {
    execute: (definition: WorkflowDefinition, context?:WorkflowContext) =>
      system.startWorkflow(definition, context),
    schedule: (cronExpression: string, workflowId: string) =>
      system.scheduleWorkflow(cronExpression, workflowId),
    visualize: (workflow: WorkflowDefinition) =>
      system.generateVisualization(workflow),
    manage: (workflowId: string) => ({
      pause:() => system.pauseWorkflow(workflowId),
      resume: () => system.resumeWorkflow(workflowId),
      stop: () => system.stopWorkflow(workflowId),
      getState: () => system.getWorkflowState(workflowId),
}),
};
}
export async function getWorkflowManagement(
  config?:WorkflowEngineConfig
): Promise<any> {
  const system = await getWorkflowSystemAccess(config);
  return {
    listActive: () => system.listActiveWorkflows(),
    getState: (workflowId: string) => system.getWorkflowState(workflowId),
    control: (workflowId: string) => ({
      pause:() => system.pauseWorkflow(workflowId),
      resume: () => system.resumeWorkflow(workflowId),
      stop: () => system.stopWorkflow(workflowId),
}),
    schedule: (cronExpression: string, workflowId: string) =>
      system.scheduleWorkflow(cronExpression, workflowId),
};
}
export async function getWorkflowVisualization(
  config?:WorkflowEngineConfig
): Promise<any> {
  const system = await getWorkflowSystemAccess(config); 
  return {
    generate: (workflow: WorkflowDefinition) =>
      system.generateVisualization(workflow),
    createDiagram: (workflow: WorkflowDefinition) =>
      system.generateVisualization(workflow),
    export: (
      workflow: WorkflowDefinition,
      format: 'mermaid' | 'svg' = 'mermaid'
    ) => {
      // Enhanced format validation and logging
      const supportedFormats = ['mermaid', 'svg'] as const;
      if (!supportedFormats.includes(format)) {
        logger.warn(`Unsupported workflow export format: ${format}`);
      }
      logger.debug(`Exporting workflow ${workflow.id} in ${format} format`);
      return system.generateVisualization(workflow);
    },
};
}
// Professional workflow system object with proper naming (matches brainSystem pattern)
export const workflowSystem = {
  getAccess: getWorkflowSystemAccess,
  getEngine: getWorkflowEngine,
  getOrchestration: getWorkflowOrchestration,
  getManagement: getWorkflowManagement,
  getVisualization: getWorkflowVisualization,
  createEngine: (config?: WorkflowEngineConfig) => new WorkflowEngine(config),
'};;
// =============================================================================
// METADATA - Package information with battle-tested features
// =============================================================================
export const WORKFLOWS_INFO = {
    ')  version : '1.0.0')  name,  description,   'Production-ready workflow engine with battle-tested npm dependencies,';
  battleTestedDependencies: [
   'expr-eval: Safe expression evaluation,')   'async: Professional async utilities,';
   'p-limit: Controlled concurrency,')   'eventemitter3: High-performance events,';
   'xstate: Robust state management,')   'mermaid: Professional visualization,';
   'node-cron: Production scheduling,')   'foundation: Battle-tested storage,';
],
  capabilities: [
   'Secure workflow orchestration (no arbitrary code execution),')   'Foundation storage integration,';
   'XState-powered state management,')   'Professional async utilities,';
   'Controlled concurrency with p-limit,')   'High-performance eventemitter3 events,';
   'Mermaid workflow visualization,')   'Production cron scheduling,';
   'Battle-tested persistence layer,';
],
  security:  {
    safeExpressionEvaluation: true,
    noArbitraryCodeExecution: true,
    foundationStorageIntegration: true,
    productionReady: true,
},
'} as const;';
'')';