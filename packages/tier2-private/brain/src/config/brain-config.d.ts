/**
 * @file Brain Configuration using Foundation Infrastructure
 *
 * Demonstrates optimal usage of @claude-zen/foundation components:
 * - Shared config system with validation
 * - Centralized logging configuration
 * - Type-safe configuration management
 * - Performance metrics integration
 * - Storage configuration
 */
import { type Config } from '@claude-zen/foundation';
export interface BrainSpecificConfig {
  wasmPath: string;
  maxNetworks: number;
  defaultBatchSize: number;
  enableGPU: boolean;
  neuralPresets: {
    enablePresets: boolean;
    defaultPreset: string;
    customPresets?: Record<string, any>;
  };
  dspy: {
    teleprompter:|'MIPROv2|BootstrapFewShot|LabeledFewShot|Ensemble';
    maxTokens: number;
    optimizationSteps: number;
    coordinationFeedback: boolean;
  };
  performance: {
    enableBenchmarking: boolean;
    trackMetrics: boolean;
    autoOptimize: boolean;
  };
}
export declare const DEFAULT_BRAIN_CONFIG: BrainSpecificConfig;
/**
 * Get brain configuration using shared infrastructure
 */
export declare function getBrainConfig(): BrainSpecificConfig & Partial<Config>;
/**
 * Validate brain configuration
 */
export declare function validateBrainConfig(
  config: Partial<BrainSpecificConfig>
): boolean;
/**
 * Initialize brain system with shared infrastructure
 */
export declare function initializeBrainSystem(): Promise<
  BrainSpecificConfig & Partial<Config>
>;
declare const _default: {
  getBrainConfig: typeof getBrainConfig;
  validateBrainConfig: typeof validateBrainConfig;
  initializeBrainSystem: typeof initializeBrainSystem;
  DEFAULT_BRAIN_CONFIG: BrainSpecificConfig;
};
export default _default;
//# sourceMappingURL=brain-config.d.ts.map
