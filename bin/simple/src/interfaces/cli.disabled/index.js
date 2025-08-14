import { AdvancedCLIEngine, AdvancedCommandRegistry, } from './advanced-cli-engine.ts';
import EnhancedTerminalRouter from './enhanced-terminal-router.js';
export { AdvancedCLIEngine, AdvancedCommandRegistry, } from './advanced-cli-engine.ts';
export { createKanbanCLI, handleKanbanCommand } from './commands/kanban.ts';
export { createWorkflowCLI, handleWorkflowCommand, workflowCommands, } from './commands/workflow.ts';
export { default as EnhancedTerminalRouter } from './enhanced-terminal-router.js';
export { createSPARCSwarmCommands } from './sparc-swarm-commands.ts';
export * from './types/advanced-cli-types.ts';
export async function initializeAdvancedCLI(config = {}) {
    const finalConfig = {
        engine: 'advanced',
        aiAssistance: true,
        realTimeMonitoring: true,
        autoOptimization: true,
        ...config,
    };
    const engine = new AdvancedCLIEngine();
    if (finalConfig?.aiAssistance) {
    }
    if (finalConfig?.realTimeMonitoring) {
    }
    if (finalConfig?.autoOptimization) {
    }
    return engine;
}
export function createAdvancedCLI(options = {}) {
    return new AdvancedCLIEngine();
}
export const CLI_MODULE_VERSION = '1.0.0';
export const CLI_MODULE_NAME = 'Advanced CLI & Project Management';
export const CLI_MODULE_DESCRIPTION = 'Revolutionary AI-powered project management and coordination platform';
export const CLI_CAPABILITIES = {
    intelligentScaffolding: true,
    realTimeMonitoring: true,
    swarmCoordination: true,
    aiCodeGeneration: true,
    performanceOptimization: true,
    enterpriseIntegration: true,
    quantumInspiredAlgorithms: true,
    neuralNetworkOptimization: true,
};
export default {
    AdvancedCLIEngine,
    AdvancedCommandRegistry,
    EnhancedTerminalRouter,
    initializeAdvancedCLI,
    createAdvancedCLI,
    CLI_MODULE_VERSION,
    CLI_CAPABILITIES,
};
//# sourceMappingURL=index.js.map