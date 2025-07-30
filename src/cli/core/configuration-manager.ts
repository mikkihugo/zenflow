/**
 * Centralized configuration management
 * Implements Google's dependency injection and configuration principles
 */

import os from 'node:os';
import path from 'node:path';
import logger from './logger.js';
import { existsSync } from
'node = ============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Logging configuration
 */
export interface LoggingConfig {level = ============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG = {version = ============================================================================
// CONFIGURATION MANAGER CLASS
// =============================================================================

/**
 * Centralized configuration management class
 */
export class ConfigurationManager {
  private config = { ...DEFAULT_CONFIG }
this.configPath = null;
this.loaded = false;
}

  /**
   * Get configuration file path
   * @param options - Path resolution options
   * @returns Configuration file path
   */
  public getConfigPath(options =
{
}
): string
{
  if (options.customPath) {
    this.configPath = options.customPath;
    return this.configPath;
  }

  if (this.configPath) return this.configPath;

  // Try various locations in order of preference
  const possiblePaths = options.searchPaths || [
    process.env.CLAUDE_FLOW_CONFIG,
    path.join(process.cwd(), '.claude-zen.json'),
    path.join(process.cwd(), 'claude-zen.config.json'),
    path.join(os.homedir(), '.config', 'claude-zen', 'config.json'),
    path.join(os.homedir(), '.claude-zen.json'),
  ];

  const validPaths = possiblePaths.filter(Boolean) as string[];

  for (const configPath of validPaths) {
    if (existsSync(configPath)) {
      this.configPath = configPath;
      return configPath;
    }
  }

  // Default to user config directory
  const defaultPath = path.join(os.homedir(), '.config', 'claude-zen', 'config.json');
  this.configPath = defaultPath;
  return defaultPath;
}

/**
 * Load configuration from file
 * @param options - Loading options
 * @returns Promise resolving to configuration
 */
public
async;
loadConfiguration((options = {}));
: Promise<Configuration>
{
  if (this.loaded && !options.customPath) return this.config;

  const configPath = this.getConfigPath(options);

  try {
      if (existsSync(configPath)) {
        const content = await readFile(configPath, 'utf-8');
        const parsedConfig = JSON.parse(content) as Partial<Configuration>;

        // Merge with defaults (deep merge)
        this.config = this.deepMerge(DEFAULT_CONFIG, parsedConfig);
        logger.debug(`Configuration loaded from ${configPath}`);
      } else {
        logger.debug(`No configuration file found at ${configPath}, using defaults`);
        
        if (options.createDefault) {
          await this.saveConfiguration();
        }
      }
    } catch (_error
  = true
  return this.config;
}

/**
 * Save configuration to file
 * @param customPath - Optional custom path
 * @returns Promise that resolves when saved
 */
public
async;
saveConfiguration(customPath?)
: Promise<void>
{
  const configPath = customPath || this.getConfigPath();
  const configDir = path.dirname(configPath);

  try {
      // Ensure directory exists
      await mkdir(configDir, {recursive = JSON.stringify(this.config, null, 2);
      await writeFile(configPath, content, 'utf-8');
      logger.debug(`Configuration saved to ${configPath}`);
    } catch (_error
  = any>(keyPath,defaultValue = null): T | null
  return this.getNestedValue(this.config, keyPath, defaultValue);

  /**
   * Set configuration value by path
   * @param keyPath - Dot-notation path to value
   * @param value - Value to set
   */
  public
  set(keyPath = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  this.loaded = false;
}

/**
 * Validate configuration structure
 * @returns Validation result
 */
public
validate();
: ValidationResult
{
    const errors = [];
    const _warnings = [];

    try {
      // Validate required fields
      if (!this.config.version) {
        errors.push('Missing version field');
      }

      // Validate logging configuration
      if (this.config.logging) {
        const validLevels = ['error', 'warn', 'info', 'debug', 'trace'];
        if (!validLevels.includes(this.config.logging.level)) {
          errors.push(`Invalid logginglevel = 0) {
          errors.push('commands.timeout must be positive');
        }
        if (this.config.commands.maxRetries < 0) {
          errors.push('commands.maxRetries cannot be negative');
        }
        if (this.config.commands.maxRetries > 10) {
          warnings.push('commands.maxRetries > 10 may cause performance issues');
        }
      }

      // Validate swarm configuration
      if (this.config.swarm) {
        if (this.config.swarm.maxAgents < 1 || this.config.swarm.maxAgents > 50) {
          errors.push('swarm.maxAgents must be between 1 and 50');
        }

        const validTopologies = ['hierarchical', 'mesh', 'ring', 'star'];
        if (!validTopologies.includes(this.config.swarm.defaultTopology)) {
          errors.push(`Invalidtopology = ['balanced', 'adaptive', 'performance', 'reliability'];
        if (!validStrategies.includes(this.config.swarm.defaultStrategy)) {
          errors.push(`Invalidstrategy = 0) {
          errors.push('memory.maxMemoryMb must be positive');
        }
        if (this.config.memory.maxMemoryMb > 1000) {
          warnings.push('memory.maxMemoryMb > 1000MB may cause performance issues');
        }
        if (this.config.memory.cleanupIntervalMs < 1000) {
          warnings.push('memory.cleanupIntervalMs < 1000ms may impact performance');
        }
      }

      // Validate hooks configuration
      if (this.config.hooks) {
        if (this.config.hooks.maxExecutionTimeMs <= 0) {
          errors.push('hooks.maxExecutionTimeMs must be positive');
        }
        if (this.config.hooks.maxExecutionTimeMs > 30000) {
          warnings.push('hooks.maxExecutionTimeMs > 30s may cause timeouts');
        }
      }

      return {isValid = == 0,
        errors,
        warnings
      };

    } catch (error = this.validate();
    
    if (!result.isValid) {
      throw new ConfigurationError(`Configuration validationfailed = > logger.warn(`Configuration warning = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
          result[key] = this.deepMerge(result[key] || {}, sourceValue);
        } else {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  /**
   * Get nested value from object using dot notation
   * @param obj - Object to search
   * @param path - Dot-notation path
   * @param defaultValue - Default value if not found
   * @returns Found value or default
   */
  private getNestedValue<T = any>(obj,path = null): T | null {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Set nested value in object using dot notation
   * @param obj - Object to modify
   * @param path - Dot-notation path
   * @param value - Value to set
   */
  private setNestedValue(obj,path = path.split('.');
    let current = obj;

    for (const i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Export configuration to JSON string
   * @param pretty - Whether to format JSON
   * @returns JSON string
   */
  public exportToJson(pretty = true): string {
    return JSON.stringify(this.config, null, pretty ?2 = JSON.parse(jsonString) as Partial<Configuration>;
      this.config = this.deepMerge(DEFAULT_CONFIG, importedConfig);
    } catch (error = any>(scope): T | null {
    return this.get<T>(scope);
  }

  /**
   * Update scoped configuration
   * @param scope - Scope path
   * @param updates - Updates to apply
   */
  public updateScope(scope = this.getScope(scope) || {};
    const merged = { ...current, ...updates };
    this.set(scope, merged);
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

// Default configuration manager instance
const configManager = new ConfigurationManager();

export { ConfigurationManager };
export default configManager;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get default configuration
 * @returns Copy of default configuration
 */
export function getDefaultConfiguration(): Configuration {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/**
 * Create configuration manager with custom defaults
 * @param customDefaults - Custom default values
 * @returns Configuration manager instance
 */
export function createConfigurationManager(customDefaults?: Partial<Configuration>): ConfigurationManager {
  const manager = new ConfigurationManager();
  
  if (customDefaults) {
    const mergedDefaults = manager['deepMerge'](DEFAULT_CONFIG, customDefaults);
    manager['config'] = mergedDefaults;
  }
  
  return manager;
}

/**
 * Validate configuration object without manager
 * @param config - Configuration to validate
 * @returns Validation result
 */
export function validateConfiguration(config = new ConfigurationManager();
  tempManager['config'] = tempManager['deepMerge'](DEFAULT_CONFIG, config);
  return tempManager.validate();
}
