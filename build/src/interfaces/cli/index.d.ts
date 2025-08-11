/**
 * @file Advanced CLI Interface Module.
 *
 * Exports all components of the revolutionary Advanced CLI system.
 * Provides intelligent project management, real-time swarm coordination,
 * and automated development workflows.
 */
import { AdvancedCLIEngine, AdvancedCommandRegistry } from './advanced-cli-engine.ts';
export { AdvancedCLIEngine, AdvancedCommandRegistry } from './advanced-cli-engine.ts';
export { default as EnhancedTerminalRouter } from './enhanced-terminal-router';
export { createSPARCSwarmCommands } from './sparc-swarm-commands.ts';
export * from './types/advanced-cli-types.ts';
export interface CLIModuleConfig {
    readonly engine: 'advanced' | 'standard';
    readonly aiAssistance: boolean;
    readonly realTimeMonitoring: boolean;
    readonly autoOptimization: boolean;
}
/**
 * Initialize the Advanced CLI Module.
 *
 * @param config
 * @example
 */
export declare function initializeAdvancedCLI(config?: Partial<CLIModuleConfig>): Promise<AdvancedCLIEngine>;
/**
 * Create CLI instance with intelligent defaults.
 *
 * @param _options
 * @param options
 * @example
 */
export declare function createAdvancedCLI(options?: Partial<CLIModuleConfig>): AdvancedCLIEngine;
/**
 * CLI Module Version and Metadata.
 */
export declare const CLI_MODULE_VERSION = "1.0.0";
export declare const CLI_MODULE_NAME = "Advanced CLI & Project Management";
export declare const CLI_MODULE_DESCRIPTION = "Revolutionary AI-powered project management and coordination platform";
/**
 * Feature Flags and Capabilities.
 */
export declare const CLI_CAPABILITIES: {
    intelligentScaffolding: boolean;
    realTimeMonitoring: boolean;
    swarmCoordination: boolean;
    aiCodeGeneration: boolean;
    performanceOptimization: boolean;
    enterpriseIntegration: boolean;
    quantumInspiredAlgorithms: boolean;
    neuralNetworkOptimization: boolean;
};
/**
 * Default CLI Export.
 */
declare const _default: {
    AdvancedCLIEngine: typeof AdvancedCLIEngine;
    AdvancedCommandRegistry: typeof AdvancedCommandRegistry;
    EnhancedTerminalRouter: any;
    initializeAdvancedCLI: typeof initializeAdvancedCLI;
    createAdvancedCLI: typeof createAdvancedCLI;
    CLI_MODULE_VERSION: string;
    CLI_CAPABILITIES: {
        intelligentScaffolding: boolean;
        realTimeMonitoring: boolean;
        swarmCoordination: boolean;
        aiCodeGeneration: boolean;
        performanceOptimization: boolean;
        enterpriseIntegration: boolean;
        quantumInspiredAlgorithms: boolean;
        neuralNetworkOptimization: boolean;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map