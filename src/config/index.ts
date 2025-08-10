/**
 * @file Unified Configuration System.
 *
 * Central export point for the complete configuration system.
 */

// Import the configManager instance for use in convenience functions
import { configManager } from './manager';
import type { SystemConfiguration } from './types';

// Constants and defaults
export {
  createURLBuilder,
  DEFAULT_CONFIG,
  DEFAULT_PORT_ALLOCATION,
  defaultURLBuilder,
  ENV_MAPPINGS,
  getCORSOrigins,
  getMCPServerURL,
  getMonitoringDashboardURL,
  getWebDashboardURL,
  PORT_ALLOCATION_BY_ENV,
  PRODUCTION_VALIDATION_SCHEMA,
  // URL Builder functionality (consolidated from url-builder.ts)
  URLBuilder,
  type URLBuilderConfig,
  VALIDATION_RULES,
} from './defaults';
// Health checking and monitoring
export {
  ConfigHealthChecker,
  configHealthChecker,
  createConfigHealthEndpoint,
  createDeploymentReadinessEndpoint,
  initializeConfigHealthChecker,
} from './health-checker';
export { ConfigurationLoader } from './loader';
// Core exports
export { ConfigurationManager, configManager } from './manager';
export type {
  StartupValidationOptions,
  StartupValidationResult,
} from './startup-validator';
// Startup validation
export {
  cli as runStartupValidationCLI,
  runStartupValidation,
  validateAndExit,
} from './startup-validator';
// Types
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
} from './types';
// Validation system
export { ConfigValidator } from './validator';

// Convenience functions
export const config = {
  /**
   * Initialize configuration system.
   *
   * @param configPaths
   */
  async init(configPaths?: string[]) {
    return configManager?.initialize(configPaths);
  },

  /**
   * Get configuration value.
   *
   * @param path
   */
  get<T = any>(path: string): T | undefined {
    return configManager?.get<T>(path);
  },

  /**
   * Get configuration section.
   *
   * @param section
   */
  getSection<K extends keyof SystemConfiguration>(section: K): SystemConfiguration[K] {
    return configManager?.getSection(section);
  },

  /**
   * Update configuration value.
   *
   * @param path
   * @param value
   */
  set(path: string, value: any) {
    return configManager?.update(path, value);
  },

  /**
   * Get full configuration.
   */
  getAll(): SystemConfiguration {
    return configManager?.getConfig();
  },

  /**
   * Validate configuration.
   */
  validate() {
    return configManager?.validate();
  },

  /**
   * Reload from sources.
   */
  reload() {
    return configManager?.reload();
  },

  /**
   * Export configuration.
   *
   * @param format
   */
  export(format: 'json' | 'yaml' = 'json'): string {
    return configManager?.export(format);
  },

  /**
   * Listen for configuration changes.
   *
   * @param callback
   */
  onChange(callback: (event: any) => void) {
    configManager?.on('config:changed', callback);
  },

  /**
   * Remove change listener.
   *
   * @param callback
   */
  removeListener(callback: (event: any) => void) {
    configManager?.off('config:changed', callback);
  },

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
    return deployment.deploymentReady;
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
   *
   * @param options
   */
  async validateStartup(options?: any) {
    const { runStartupValidation } = await import('./startup-validator');
    return runStartupValidation(options);
  },
};

// Legacy compatibility with old config manager
import type { ConfigurationManager } from './manager';
export type ConfigManager = ConfigurationManager;

// Default export for convenience
export default config;
