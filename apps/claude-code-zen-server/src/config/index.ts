/**
 * @fileoverview Main App Configuration - Re-exports from @claude-zen/foundation
 * 
 * This module re-exports the configuration system from @claude-zen/foundation
 * and provides app-specific configuration extensions for the claude-code-zen server.
 * 
 * REFACTORED: Replaced duplicate config implementation with @claude-zen/foundation imports
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 */

// ============================================================================
// CORE CONFIG - Use @claude-zen/foundation instead of duplicate implementation
// ============================================================================

// Import foundation config system
import { 
  getConfig, 
  reloadConfig, 
  isDebugMode, 
  areMetricsEnabled,
  getStorageConfig,
  getNeuralConfig,
  getTelemetryConfig,
  validateConfig,
  configHelpers,
  type Config
} from '@claude-zen/foundation';

// Re-export foundation config
export { 
  getConfig, 
  reloadConfig, 
  isDebugMode, 
  areMetricsEnabled,
  getStorageConfig,
  getNeuralConfig,
  getTelemetryConfig,
  validateConfig,
  configHelpers,
  type Config
};

// ============================================================================
// APP-SPECIFIC CONFIG EXTENSIONS
// ============================================================================

// Repository configuration (app-specific)
export {
  createRepoConfig,
  defaultRepoConfig,
  logRepoConfigStatus,
  type RepoConfig,
  validateRepoConfig,
} from './default-repo-config';

// App-specific constants and URL builders
export {
  createURLBuilder,
  DEFAULT_CONFIG,
  defaultURLBuilder,
  ENV_MAPPINGS,
  getCORSOrigins,
  getMonitoringDashboardURL,
  getWebDashboardURL,
  PRODUCTION_VALIDATION_SCHEMA,
  URLBuilder,
  type URLBuilderConfig,
  VALIDATION_RULES,
} from './defaults';

// App-specific health checking
export {
  ConfigHealthChecker,
  configHealthChecker,
  createConfigHealthEndpoint,
  createDeploymentReadinessEndpoint,
  initializeConfigHealthChecker,
} from './health-checker';

// App-specific startup validation
export {
  cli as runStartupValidationCLI,
  runStartupValidation,
  validateAndExit,
  type StartupValidationOptions,
  type StartupValidationResult,
} from './startup-validator';

// App-specific types
export type {
  ConfigChangeEvent,
  ConfigHealthReport,
  ConfigurationSource,
  ConfigValidationResult,
  CoordinationConfig,
  CoreConfig,
  DatabaseConfig,
  EnvironmentMappings,
  InterfaceConfig,
  MCPConfig,
  MemoryConfig,
  NeuralConfig,
  OptimizationConfig,
  SystemConfiguration,
  TerminalConfig,
  ValidationResult,
  WebConfig,
} from '../types/config-types';

// ============================================================================
// CONVENIENCE API - Uses foundation config system
// ============================================================================

/**
 * Convenience configuration API that uses @claude-zen/foundation
 * instead of duplicate implementation.
 */
export const config = {
  /**
   * Get configuration value using foundation config.
   */
  get<T = any>(path: string, defaultValue?: T): T {
    return getConfig().get(path, defaultValue);
  },

  /**
   * Set configuration value using foundation config.
   */
  set(path: string, value: any): void {
    getConfig().set(path, value);
  },

  /**
   * Check if configuration has a key.
   */
  has(path: string): boolean {
    return getConfig().has(path);
  },

  /**
   * Get all configuration as object.
   */
  getAll() {
    return configHelpers.toObject();
  },

  /**
   * Reload configuration from environment and files.
   */
  reload(): void {
    reloadConfig();
  },

  /**
   * Validate current configuration.
   */
  validate(): void {
    validateConfig();
  },

  /**
   * Check if debug mode is enabled.
   */
  isDebug(): boolean {
    return isDebugMode();
  },

  /**
   * Check if metrics are enabled.
   */
  areMetricsEnabled(): boolean {
    return areMetricsEnabled();
  },

  /**
   * Get storage configuration.
   */
  getStorageConfig() {
    return getStorageConfig();
  },

  /**
   * Get neural configuration.
   */
  getNeuralConfig() {
    return getNeuralConfig();
  },

  /**
   * Get telemetry configuration.
   */
  getTelemetryConfig() {
    return getTelemetryConfig();
  },

  // App-specific extensions for health checking
  /**
   * Get configuration health report.
   */
  async getHealthReport() {
    const { configHealthChecker } = await import('./health-checker');
    return configHealthChecker?.getHealthReport();
  },

  /**
   * Check if configuration is production ready.
   */
  async isProductionReady() {
    const { configHealthChecker } = await import('./health-checker');
    const deployment = await configHealthChecker?.validateForProduction();
    return deployment?.deploymentReady;
  },

  /**
   * Check for port conflicts.
   */
  async checkPorts() {
    const { configHealthChecker } = await import('./health-checker');
    return configHealthChecker?.checkPortConflicts();
  },

  /**
   * Run startup validation.
   */
  async validateStartup(options?: unknown) {
    const { runStartupValidation } = await import('./startup-validator');
    return runStartupValidation(options as any);
  },
};

// Default export for convenience
export default config;
