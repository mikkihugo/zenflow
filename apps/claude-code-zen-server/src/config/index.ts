/**
 * @fileoverview Unified Configuration System - Central export point and convenience API
 * 
 * This module provides a comprehensive, unified interface to the entire Claude Code Zen
 * configuration system. It serves as the central export point for all configuration
 * functionality, offering both direct exports and a convenient object-based API for
 * common configuration operations.
 * 
 * **Key Features:**
 * - **Unified Exports**: Single import point for all configuration functionality
 * - **Convenience API**: Object-based API with common operations (config.get, config.set)
 * - **Health Monitoring**: Built-in configuration health checking and validation
 * - **Production Readiness**: Production deployment validation and port conflict detection
 * - **Type Safety**: Full TypeScript support with comprehensive type exports
 * - **Event Handling**: Configuration change listeners and event management
 * - **Multiple Formats**: JSON/YAML export capabilities for configuration data
 * 
 * **Configuration Categories:**
 * - Repository configuration with intelligent defaults
 * - System constants and URL building utilities
 * - Health checking and deployment readiness validation
 * - Configuration loading and management
 * - Startup validation and CLI tools
 * - Type definitions and validation schemas
 * 
 * @example Basic Configuration Usage
 * ```typescript
 * import { config } from './config';
 * 
 * // Initialize configuration system
 * await config.init(['./config.json', './local.config.json']);
 * 
 * // Get configuration values
 * const port = config.get<number>('core.port');
 * const dbConfig = config.getSection('database');
 * 
 * // Update configuration
 * config.set('core.logLevel', 'debug');
 * 
 * // Listen for changes
 * config.onChange((event) => {
 *   console.log('Configuration changed:', event);
 * });
 * ```
 * 
 * @example Repository Configuration
 * ```typescript
 * import { createRepoConfig, validateRepoConfig, logRepoConfigStatus } from './config';
 * 
 * // Create optimized repository configuration
 * const repoConfig = createRepoConfig('/path/to/project', {
 *   enableMLOptimization: true,
 *   dsyIntegration: {
 *     enabled: true,
 *     neuralEnhancement: true
 *   }
 * });
 * 
 * // Validate and log status
 * const validation = validateRepoConfig(repoConfig);
 * if (validation.valid) {
 *   logRepoConfigStatus(repoConfig);
 * }
 * ```
 * 
 * @example Health Monitoring
 * ```typescript
 * import { config } from './config';
 * 
 * // Check overall system health
 * const healthReport = await config.getHealthReport();
 * console.log(`System health: ${healthReport.status} (${healthReport.score}/100)`);
 * 
 * // Validate production readiness
 * const isReady = await config.isProductionReady();
 * if (!isReady) {
 *   console.error('System not ready for production deployment');
 * }
 * 
 * // Check for port conflicts
 * const portCheck = await config.checkPorts();
 * if (portCheck.conflicts.length > 0) {
 *   console.warn('Port conflicts detected:', portCheck.conflicts);
 * }
 * ```
 * 
 * @example Advanced Usage with Direct Exports
 * ```typescript
 * import {
 *   ConfigurationManager,
 *   ConfigHealthChecker,
 *   ConfigValidator,
 *   runStartupValidation
 * } from './config';
 * 
 * // Create custom configuration manager
 * const customManager = new ConfigurationManager();
 * await customManager.initialize(['./custom-config.json']);
 * 
 * // Perform startup validation
 * const validation = await runStartupValidation({
 *   validateProduction: true,
 *   checkPorts: true,
 *   logResults: true
 * });
 * ```
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 * 
 * @see {@link ConfigurationManager} Core configuration management
 * @see {@link ConfigHealthChecker} Health monitoring and validation
 * @see {@link RepoConfig} Repository configuration interface
 * @see {@link SystemConfiguration} System configuration interface
 */

// Import the configManager instance for use in convenience functions
import { configManager } from './manager';
import type { SystemConfiguration } from '../types/config-types';

// Repository configuration
export {
  createRepoConfig,
  defaultRepoConfig,
  logRepoConfigStatus,
  type RepoConfig,
  validateRepoConfig,
} from './default-repo-config';
// Constants and defaults
export {
  createURLBuilder,
  DEFAULT_CONFIG,
  defaultURLBuilder,
  ENV_MAPPINGS,
  getCORSOrigins,
  getMonitoringDashboardURL,
  getWebDashboardURL,
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
  MemoryConfig,
  NeuralConfig,
  OptimizationConfig,
  SystemConfiguration,
  TerminalConfig,
  ValidationResult,
  WebConfig,
} from '../types/config-types';
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
  getSection<K extends keyof SystemConfiguration>(
    section: K
  ): SystemConfiguration[K] {
    return configManager?.getSection(section);
  },

  /**
   * Update configuration value.
   *
   * @param path
   * @param value
   */
  set(path: string, value: unknown) {
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
  onChange(callback: (event: unknown) => void) {
    configManager?.on('config:changed', callback);
  },

  /**
   * Remove change listener.
   *
   * @param callback
   */
  removeListener(callback: (event: unknown) => void) {
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
   *
   * @param options - Startup validation options
   */
  async validateStartup(options?: unknown) {
    const { runStartupValidation } = await import('./startup-validator');
    return runStartupValidation(options as any);
  },
};

// Legacy compatibility with old config manager
import type { ConfigurationManager } from './manager';
export type ConfigManager = ConfigurationManager;

// Default export for convenience
export default config;
