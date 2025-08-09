import { getLogger } from "../config/logging-config";
const logger = getLogger("src-config-manager");
/**
 * @file Unified Configuration Manager
 *
 * Central configuration management with hot-reloading, validation, and event system
 */

import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_CONFIG } from './defaults';
import { ConfigurationLoader } from './loader';
import type { ConfigChangeEvent, ConfigValidationResult, SystemConfiguration } from './types';
import { ConfigValidator } from './validator';

/**
 * Unified Configuration Manager
 *
 * Features:
 * - Multi-source configuration loading (files, env, CLI)
 * - Hot-reloading with file watchers
 * - Configuration validation with detailed errors
 * - Event-driven configuration changes
 * - Thread-safe configuration access
 * - Configuration history and rollback
 *
 * @example
 */
export class ConfigurationManager extends EventEmitter {
  private static instance: ConfigurationManager | null = null;
  private config: SystemConfiguration;
  private loader = new ConfigurationLoader();
  private validator = new ConfigValidator();
  private configPaths: string[] = [];
  private watchers: fs.FSWatcher[] = [];
  private configHistory: SystemConfiguration[] = [];
  private maxHistorySize = 10;
  private isLoading = false;

  private constructor() {
    super();
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    this.setupErrorHandling();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Initialize configuration system
   *
   * @param configPaths
   */
  async initialize(configPaths?: string[]): Promise<ConfigValidationResult> {
    if (this.isLoading) {
      throw new Error('Configuration is already being loaded');
    }

    this.isLoading = true;
    try {
      const result = await this.loader.loadConfiguration(configPaths);

      if (!result.validation.valid) {
        logger.error('❌ Configuration validation failed:');
        result.validation.errors.forEach((error) => logger.error(`  - ${error}`));

        if (result.validation.warnings.length > 0) {
          logger.warn('⚠️ Configuration warnings:');
          result.validation.warnings.forEach((warning) => logger.warn(`  - ${warning}`));
        }
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      } else {
        this.config = result.config;

        if (result.validation.warnings.length > 0) {
          logger.warn('⚠️ Configuration warnings:');
          result.validation.warnings.forEach((warning) => logger.warn(`  - ${warning}`));
        }
      }

      // Store config paths for watching
      this.configPaths = configPaths || [];

      // Setup file watchers for hot-reloading
      this.setupFileWatchers();

      // Add to history
      this.addToHistory(this.config);

      this.emit('config:loaded', { config: this.config, validation: result.validation });

      return result.validation;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SystemConfiguration {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Get configuration section
   *
   * @param section
   */
  getSection<K extends keyof SystemConfiguration>(section: K): SystemConfiguration[K] {
    return JSON.parse(JSON.stringify(this.config[section]));
  }

  /**
   * Get nested configuration value
   *
   * @param path
   */
  get<T = any>(path: string): T | undefined {
    return path.split('.').reduce((current: any, key) => current?.[key], this.config);
  }

  /**
   * Update configuration (runtime only)
   *
   * @param path
   * @param value
   */
  update(path: string, value: any): ConfigValidationResult {
    const oldValue = this.get(path);

    // Create a copy for testing
    const testConfig = JSON.parse(JSON.stringify(this.config));
    this.setNestedValue(testConfig, path, value);

    // Validate the change
    const validation = this.validator.validate(testConfig);

    if (!validation.valid) {
      return validation;
    }

    // Apply the change
    this.setNestedValue(this.config, path, value);

    // Add to history
    this.addToHistory(this.config);

    // Emit change event
    const changeEvent: ConfigChangeEvent = {
      path,
      oldValue,
      newValue: value,
      source: 'runtime',
      timestamp: Date.now(),
    };

    this.emit('config:changed', changeEvent);

    return validation;
  }

  /**
   * Reload configuration from sources
   */
  async reload(): Promise<ConfigValidationResult> {
    return this.initialize(this.configPaths);
  }

  /**
   * Validate current configuration
   */
  validate(): ConfigValidationResult {
    return this.validator.validate(this.config);
  }

  /**
   * Get configuration history
   */
  getHistory(): SystemConfiguration[] {
    return [...this.configHistory];
  }

  /**
   * Rollback to previous configuration
   *
   * @param steps
   */
  rollback(steps = 1): boolean {
    if (this.configHistory.length <= steps) {
      return false;
    }

    const targetConfig = this.configHistory[this.configHistory.length - steps - 1];
    const validation = targetConfig
      ? this.validator.validate(targetConfig)
      : { valid: false, errors: ['Invalid target config'] };

    if (!validation.valid) {
      logger.error('Cannot rollback to invalid configuration');
      return false;
    }

    this.config = JSON.parse(JSON.stringify(targetConfig));
    this.emit('config:rollback', { config: this.config, steps });

    return true;
  }

  /**
   * Export current configuration
   *
   * @param format
   */
  export(format: 'json' | 'yaml' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.config, null, 2);
    } else {
      // Basic YAML export (would need yaml library for full support)
      return this.toSimpleYaml(this.config);
    }
  }

  /**
   * Get configuration sources info
   */
  getSourcesInfo() {
    return this.loader.getSources();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Clear file watchers
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];

    // Clear history
    this.configHistory = [];

    // Remove event listeners
    this.removeAllListeners();

    // Clear singleton
    ConfigurationManager.instance = null;
  }

  /**
   * Setup file watchers for hot-reloading
   */
  private setupFileWatchers(): void {
    // Clear existing watchers
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];

    const configFiles = [
      './config/claude-zen.json',
      './claude-zen.config.json',
      ...this.configPaths,
    ];

    for (const configFile of configFiles) {
      try {
        const resolvedPath = path.resolve(configFile);

        if (fs.existsSync(resolvedPath)) {
          const watcher = fs.watch(resolvedPath, (eventType) => {
            if (eventType === 'change') {
              // Debounce reloads
              setTimeout(() => {
                this.reload().catch((error) => {
                  logger.error('Failed to reload configuration:', error);
                });
              }, 1000);
            }
          });

          this.watchers.push(watcher);
        }
      } catch (error) {
        logger.warn(`Failed to watch config file ${configFile}:`, error);
      }
    }
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.on('error', (error) => {
      logger.error('Configuration manager error:', error);
    });

    // Handle process signals for cleanup
    process.on('SIGINT', () => this.destroy());
    process.on('SIGTERM', () => this.destroy());
  }

  /**
   * Add configuration to history
   *
   * @param config
   */
  private addToHistory(config: SystemConfiguration): void {
    this.configHistory.push(JSON.parse(JSON.stringify(config)));

    // Trim history to max size
    if (this.configHistory.length > this.maxHistorySize) {
      this.configHistory = this.configHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Set nested value using dot notation
   *
   * @param obj
   * @param path
   * @param value
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part && (!(part in current) || typeof current[part] !== 'object')) {
        current[part] = {};
      }
      if (part) {
        current = current[part];
      }
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      current[lastPart] = value;
    }
  }

  /**
   * Simple YAML export (basic implementation)
   *
   * @param obj
   * @param indent
   */
  private toSimpleYaml(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${this.toSimpleYaml(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          yaml += `${spaces}  - ${item}\n`;
        }
      } else {
        yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
      }
    }

    return yaml;
  }
}

// Export singleton instance
export const configManager = ConfigurationManager.getInstance();
