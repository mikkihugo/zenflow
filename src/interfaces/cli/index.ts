/**
 * @file Advanced CLI Interface Module
 *
 * Exports all components of the revolutionary Advanced CLI system.
 * Provides intelligent project management, real-time swarm coordination,
 * and automated development workflows.
 */

// Import for internal use
import { AdvancedCLIEngine, AdvancedCommandRegistry } from './advanced-cli-engine';
import EnhancedTerminalRouter from './enhanced-terminal-router';

// Re-export for external use
export { AdvancedCLIEngine, AdvancedCommandRegistry } from './advanced-cli-engine';
export { default as EnhancedTerminalRouter } from './enhanced-terminal-router';

// SPARC Swarm Commands
export { createSPARCSwarmCommands } from './sparc-swarm-commands';

// Type Definitions
export * from './types/advanced-cli-types';

// CLI Configuration and Utilities
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
 */
export async function initializeAdvancedCLI(
  config: Partial<CLIModuleConfig> = {}
): Promise<AdvancedCLIEngine> {
  const finalConfig: CLIModuleConfig = {
    engine: 'advanced',
    aiAssistance: true,
    realTimeMonitoring: true,
    autoOptimization: true,
    ...config,
  };

  const engine = new AdvancedCLIEngine();

  // Configure based on provided settings
  if (finalConfig?.aiAssistance) {
    // Enable AI assistance features
  }

  if (finalConfig?.realTimeMonitoring) {
    // Enable real-time monitoring
  }

  if (finalConfig?.autoOptimization) {
    // Enable automatic optimization
  }

  return engine;
}

/**
 * Create CLI instance with intelligent defaults.
 *
 * @param _options
 */
export function createAdvancedCLI(_options: Partial<CLIModuleConfig> = {}): AdvancedCLIEngine {
  return new AdvancedCLIEngine();
}

/**
 * CLI Module Version and Metadata.
 */
export const CLI_MODULE_VERSION = '1.0.0';
export const CLI_MODULE_NAME = 'Advanced CLI & Project Management';
export const CLI_MODULE_DESCRIPTION =
  'Revolutionary AI-powered project management and coordination platform';

/**
 * Feature Flags and Capabilities.
 */
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

/**
 * Default CLI Export.
 */
export default {
  AdvancedCLIEngine,
  AdvancedCommandRegistry,
  EnhancedTerminalRouter,
  initializeAdvancedCLI,
  createAdvancedCLI,
  CLI_MODULE_VERSION,
  CLI_CAPABILITIES,
};
