/**
 * Configuration Management System - TypeScript Edition
 * Comprehensive configuration loading, validation, and management
 */

import { EventEmitter } from 'node:events';
import type { CLIConfig, ConfigurationManager as IConfigurationManager } from '../../types/cli';
import { ConfigurationError } from '../core/cli-error';

// =============================================================================
// CONFIGURATION SCHEMA DEFINITIONS
// =============================================================================

const CLI_CONFIG_SCHEMA = {name = ============================================================================
// CONFIGURATION MANAGER IMPLEMENTATION
// =============================================================================

export class TypeScriptConfigurationManager extends EventEmitter implements IConfigurationManager {
  private config = > void>> = new Map();
  private schema = CLI_CONFIG_SCHEMA) {
    super();
    this.schema = schema;
    this.config = this.createDefaultConfig();
    
    if (initialConfig) {
      this.config = { ...this.config, ...initialConfig };
    }
  }

  // =============================================================================
  // CONFIGURATION LOADING AND SAVING
  // =============================================================================

  async load(path?: string): Promise<CLIConfig> {
    const configPath = path || this.getDefaultConfigPath();
    this.configPath = configPath;

    try {
      const fs = await import('node:fs/promises');
      
      // Check if config file exists
      try {
        await fs.access(configPath);
      } catch {
        // Config file doesn't exist, create default
        await this.createDefaultConfigFile(configPath);
        return this.config;
      }

      // Load and parse config file
      const configContent = await fs.readFile(configPath, 'utf-8');
      const _loadedConfig = JSON.parse(configContent);
        } else if (configPath.endsWith('.js') || configPath.endsWith('.mjs')) {
          // Dynamic import for JS config files
          const configModule = await import(configPath);
          loadedConfig = configModule.default || configModule;
        } else {
          throw new Error('Unsupported config file format. Use .json, .js, or .mjs');
        }
      } catch (_parseError) {
        throw new ConfigurationError(
          `Failed to parse configfile = this.mergeConfig(this.config, loadedConfig);

      // Validate the loaded config
      const validationResults = this.validate(this.schema);
      if (validationResults.some(r => !r.valid)) {

        throw new ConfigurationError(
          `Configuration validationfailed = > `  ${e.key}: ${e.message}`).join('\n')}`,
          configPath
)
}

      this.emit('config-loaded', this.config, configPath)
return this.config;

} catch (error)
{
  if (error instanceof ConfigurationError) {
    throw error;
  }

  throw new ConfigurationError(
        `Failed to load configuration from ${configPath}: ${error instanceof Error ? error.message = config || this.config;
    const configPath = path || this.configPath || this.getDefaultConfigPath();

    try {
      const fs = await import('fs/promises');
      const pathModule = await import('path');

      // Ensure directory exists
      const configDir = pathModule.dirname(configPath);
      await fs.mkdir(configDir, {recursive = JSON.stringify(configToSave, null, 2);
      } else if (configPath.endsWith('.js') || configPath.endsWith('.mjs')) {
        content = `module.exports = ${JSON.stringify(configToSave, null, 2)};
  `;
      } else {
        // Default to JSON
        content = JSON.stringify(configToSave, null, 2);
      }

      await fs.writeFile(configPath, content, 'utf-8');
      
      this.config = configToSave;
      this.configPath = configPath;
      
      this.emit('config-saved', configToSave, configPath);

    } catch (error) {
      throw new ConfigurationError(
        `;
  Failed;
  to;
  save;
  configuration;
  to;
  $configPath: $error instanceof Error
    ? (error.message =
        =========================================================================== =
        // CONFIGURATION ACCESS
        // =============================================================================

        get<T =
          any > key)
    : T | undefined;
  return this.getNestedValue(this.config, key) as T;

  set<T = any>(key,value = this.get(key);
  this.setNestedValue(this.config, key, value);

  // Notify watchers
  this.notifyWatchers(key, value, oldValue);

  // Emit change event
  this.emit('config-changed', key, value, oldValue);

  has(key = = undefined;
}

delete(key = this.has(key);
if (existed) {
  const oldValue = this.get(key);
  this.deleteNestedValue(this.config, key);

  // Notify watchers
  this.notifyWatchers(key, undefined, oldValue);

  // Emit change event
  this.emit('config-changed', key, undefined, oldValue);
}
return existed;
}

  // =============================================================================
  // VALIDATION
  // =============================================================================

  validate(schema = this.schema): ValidationResult[]
{
  const results = [];

  for (const [key, _schemaEntry] of Object.entries(schema)) {
    const value = this.get(key);
    const result = {key = === undefined || value === null)) {
        result.valid = false;
    result.message = `Required field '${key}' is missing`;
    results.push(result);
  }

  // Skip validation if value is undefined and not required
  if (value === undefined && !schemaEntry.required) {
    continue;
  }

  // Type validation
  const expectedType = schemaEntry.type;
  const actualType = Array.isArray(value) ? 'array' : typeof value;

  if (actualType !== expectedType) {
    result.valid = false;
    result.message = `Field '${key}' must be of type ${expectedType}, got ${actualType}`;
    results.push(result);
    continue;
  }

  // Custom validation function
  if (schemaEntry.validation) {
    const validationResult = schemaEntry.validation(value);
    if (typeof validationResult === 'string') {
      result.valid = false;
      result.message = validationResult;
      results.push(result);
      continue;
    } else if (!validationResult) {
      result.valid = false;
      result.message = `Field '${key}' failed custom validation`;
      results.push(result);
      continue;
    }
  }

  // If we get here, validation passed
  results.push(result);
}

return results;
}

  // =============================================================================
  // CONFIGURATION WATCHING
  // =============================================================================

  watch(key = > void): () => void
{
  if (!this.watchers.has(key)) {
    this.watchers.set(key, new Set());
  }

  this.watchers.get(key)?.add(callback);

  // Return unwatch function
  return () => {
      const watcherSet = this.watchers.get(key);
      if (watcherSet) {
        watcherSet.delete(callback);
        if (watcherSet.size === 0) {
          this.watchers.delete(key);
        }
      }
    };
}

// =============================================================================
// HOT RELOAD
// =============================================================================

async;
reload();
: Promise<void>
{
  if (!this.configPath) {
    throw new ConfigurationError('No config file loaded, cannot reload');
  }

  await this.load(this.configPath);
}

startWatching();
: void
{
  if (!this.configPath) {
    return;
  }

  const fs = require('node:fs');
  fs.watchFile(this.configPath, async () => {
    try {
      await this.reload();
      this.emit('config-reloaded', this.config);
    } catch (error) {
      this.emit('config-reload-error', error);
    }
  });
}

stopWatching();
: void
{
  if (!this.configPath) {
    return;
  }

  const fs = require('node:fs');
  fs.unwatchFile(this.configPath);
}

// =============================================================================
// UTILITY METHODS
// =============================================================================

getConfig();
: CLIConfig
{
  return { ...this.config };
}

resetToDefaults();
: void
{
  const oldConfig = { ...this.config };
  this.config = this.createDefaultConfig();
  this.emit('config-reset', this.config, oldConfig);
}

merge(partialConfig = { ...this.config };
this.config = this.mergeConfig(this.config, partialConfig);
this.emit('config-merged', this.config, oldConfig, partialConfig);
}

export
format = 'json';
: string
{
  switch (format) {
    case 'json':
      return JSON.stringify(this.config, null, 2);

    case 'yaml':
      return this.toYaml(this.config);

    case 'env':
      return this.toEnvFormat(this.config);
    default = ============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private createDefaultConfig(): CLIConfig {
    return {name = === 'development',isProduction = === 'production',isTest = === 'test'
      },paths = process.env.CLAUDE_ZEN_CONFIG_DIR || `${process.cwd()}/.claude-zen`;
    return `${configDir}/config.json`;
  }

  private async createDefaultConfigFile(path = await import('node:fs/promises');
    const pathModule = await import('node:path');
    
    const dir = pathModule.dirname(path);
    await fs.mkdir(dir, {recursive = this.createDefaultConfig();
    const content = JSON.stringify(defaultConfig, null, 2);
    await fs.writeFile(path, content, 'utf-8');
  }

  private
  mergeConfig(target = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = this.mergeConfig(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

private
getNestedValue(obj = path.split('.');
let current = obj;

for (const key of keys) {
  if (current === null || current === undefined || typeof current !== 'object') {
    return undefined;
  }
  current = current[key];
}

return current;
}

  private setNestedValue(obj,path = path.split('.')
let current = obj;

for (let i = 0; i < keys.length - 1; i++) {
  const key = keys[i];
  if (!(key in current) || typeof current[key] !== 'object') {
    current[key] = {};
  }
  current = current[key];
}

current[keys[keys.length - 1]] = value;
}

  private deleteNestedValue(obj,path = path.split('.')
let current = obj;

for (let i = 0; i < keys.length - 1; i++) {
  const key = keys[i];
  if (!(key in current) || typeof current[key] !== 'object') {
    return; // Path doesn't exist
  }
  current = current[key];
}

delete current[keys[keys.length - 1]];
}

  private notifyWatchers(key,newValue = this.watchers.get(key)
if (watchers) {
  for (const callback of watchers) {
    try {
      callback(newValue);
    } catch (error) {
      this.emit('watcher-error', error, key, callback);
    }
  }
}
}

  private toYaml(obj = 0): string
{
  const spaces = '  '.repeat(indent);
  let yaml = '';

  if (Array.isArray(obj)) {
    for (const item of obj) {
      yaml += `${spaces}- ${this.toYaml(item, indent + 1).trim()}\n`;
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n${this.toYaml(value, indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
  } else {
    return String(obj);
  }

  return yaml;
}

private
toEnvFormat((obj = ''));
: string
{
  let envString = '';

  const processObject = (current, currentPrefix => {
      for (const [key, value] of Object.entries(current)) {
        const envKey = currentPrefix ? `${currentPrefix}_${key.toUpperCase()}` : key.toUpperCase();
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          processObject(value, envKey);
        } else {
          const envValue = Array.isArray(value) ? value.join(',') : String(value);
          envString += `${envKey}=${envValue}\n`;
        }
      }
    };

  processObject(obj, prefix);
  return envString;
}
}

// =============================================================================
// CONFIGURATION UTILITIES
// =============================================================================

export function validateConfigSchema(config = new TypeScriptConfigurationManager(config, schema);
return manager.validate(schema);
}

export function mergeConfigs(...configs = new TypeScriptConfigurationManager();
let result = manager.getConfig();

for (const config of configs) {
  const merged = manager.mergeConfig(result, config);
  result = merged;
}

return result;
}

export function createConfigFromEnvironment(): Partial<CLIConfig> {
  return {flags = === 'true',debug = === 'true',quiet = === 'true'
    },environment = === 'development',isProduction = === 'production',isTest = === 'test'
}
,paths = ============================================================================
// GLOBAL CONFIGURATION MANAGER
// =============================================================================

let globalConfigManager = null;

export function getGlobalConfigManager(): TypeScriptConfigurationManager {
  if (!globalConfigManager) {
    const envConfig = createConfigFromEnvironment();
    globalConfigManager = new TypeScriptConfigurationManager(envConfig);
  }
  return globalConfigManager;
}

export function setGlobalConfigManager(manager = manager;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const configurationManager = getGlobalConfigManager();
export type { TypeScriptConfigurationManager as ConfigurationManager };
export { CLI_CONFIG_SCHEMA as DEFAULT_CLI_SCHEMA };
