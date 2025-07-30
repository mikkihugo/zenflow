/**
 * Configuration Management System - TypeScript Edition;
 * Comprehensive configuration loading, validation, and management;
 */

import { EventEmitter } from 'node:events';
import type { CLIConfig, ConfigurationManager as IConfigurationManager } from '../../types/cli';
import { ConfigurationError } from '../core/cli-error';

// =============================================================================
// CONFIGURATION SCHEMA DEFINITIONS
// =============================================================================

const _CLI_CONFIG_SCHEMA = {name = ============================================================================;
// CONFIGURATION MANAGER IMPLEMENTATION
// =============================================================================

export class TypeScriptConfigurationManager extends EventEmitter implements IConfigurationManager {
  private config = (> void>> = new Map());
  ) {
    super()
  this
  .
  schema = schema;
  this;
  .
  config = this.createDefaultConfig();
  if(initialConfig) {
    this.config = { ...this.config, ...initialConfig };
  }
}
// =============================================================================
// CONFIGURATION LOADING AND SAVING
// =============================================================================

async;
load(path?: string)
: Promise<CLIConfig>
{
  const _configPath = path ?? this.getDefaultConfigPath();
  this.configPath = configPath;
  try {
      const _fs = await import('node:fs/promises');
      
      // Check if config file exists
      try {
        await fs.access(configPath);
      } catch {
        // Config file doesn't exist, create default
        await this.createDefaultConfigFile(configPath);
        return this.config;
    //   // LINT: unreachable code removed}
;
      // Load and parse config file
      const _configContent = await fs.readFile(configPath, 'utf-8');
      const __loadedConfig = JSON.parse(configContent);
        } else if (configPath.endsWith('.js')  ?? configPath.endsWith('.mjs')) {
          // Dynamic import for JS config files
          const _configModule = await import(configPath);
          loadedConfig = configModule.default  ?? configModule;
        } else {
          throw new Error('Unsupported config file format. Use .json, .js, or .mjs');
        }
      } catch (/* _parseError */) {
        throw new ConfigurationError(;
          `Failed to parse configfile = this.mergeConfig(this.config, loadedConfig);
;
      // Validate the loaded config
      const _validationResults = this.validate(this.schema);
      if (validationResults.some(r => !r.valid)) {
;
        throw new ConfigurationError(;
          `Configuration validationfailed = > `  ${e.key}: ${e.message}`).join('\n')}
  `,
          configPath;
);
}
;
      this.emit('config-loaded', this.config, configPath);
return this.config;
    // ; // LINT: unreachable code removed
} catch (/* error */) {
  if (error instanceof ConfigurationError) {
    throw error;
  }
;
  throw new ConfigurationError(;
        `;
  Failed;
  to;
  load;
  configuration;
  from;
  $configPath: $;
  {
    error instanceof Error ? error.message = config  ?? this.config;
    const _configPath = path ?? this.configPath ?? this.getDefaultConfigPath();
    try {
      const _fs = await import('node:fs/promises');
      const _pathModule = await import('node:path');

      // Ensure directory exists
      const _configDir = pathModule.dirname(configPath);
      await fs.mkdir(configDir, {recursive = JSON.stringify(configToSave, null, 2);
      }
    else
    if (configPath.endsWith('.js') ?? configPath.endsWith('.mjs')) {
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
  }
  catch (/* error */)
  throw new ConfigurationError(;
  `;
  Failed;
  to;
  save;
  configuration;
  to;
  $configPath: $error instanceof Error;
    ? (error.message =;
        =========================================================================== =;
        // CONFIGURATION ACCESS
        // =============================================================================

        get<T =;
          any > key);
    : T | undefined;
  return this.getNestedValue(this.config, key) as T;
    // ; // LINT: unreachable code removed
  set<T = any>(key,value = this.get(key);
  this.setNestedValue(this.config, key, value);
;
  // Notify watchers
  this.notifyWatchers(key, value, oldValue);
;
  // Emit change event
  this.emit('config-changed', key, value, oldValue);
;
  has(key = = undefined;
}
;
delete(key = this.has(key);
if (existed) {
  const _oldValue = this.get(key);
  this.deleteNestedValue(this.config, key);
;
  // Notify watchers
  this.notifyWatchers(key, undefined, oldValue);
;
  // Emit change event
  this.emit('config-changed', key, undefined, oldValue);
}
return existed;
}
;
  // =============================================================================
  // VALIDATION
  // =============================================================================

  validate(schema = this.schema): ValidationResult[];
{
  const _results = [];
;
  for (const [key, _schemaEntry] of Object.entries(schema)) {
    const _value = this.get(key);
    const _result = {key = === undefined  ?? value === null)) {
        result.valid = false;
    result.message = `;
  Required;
  field;
  ('${key}');
  is;
  missing`;
    results.push(result);
  }
;
  // Skip validation if value is undefined and not required
  if (value === undefined && !schemaEntry.required) {
    continue;
  }
;
  // Type validation
  const _expectedType = schemaEntry.type;
  const _actualType = Array.isArray(value) ? 'array' : typeof value;
;
  if (actualType !== expectedType) {
    result.valid = false;
    result.message = `;
  Field;
  ('${key}');
  must;
  be;
  of;
  type ${expectedType}
  , got $actualType`
    results.push(result)
  continue;
  // Custom validation function if(): unknown {
  const _validationResult = schemaEntry.validation(value);
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

watch(key = > void)
: () => void
{
  if (!this.watchers.has(key)) {
    this.watchers.set(key, new Set());
  }
  this.watchers.get(key)?.add(callback);
  // Return unwatch function return() => {
  const _watcherSet = this.watchers.get(key);
  // if (watcherSet) { // LINT: unreachable code removed
  watcherSet.delete(callback);
  if (watcherSet.size === 0) {
    this.watchers.delete(key);
  }
}
}
}
// =============================================================================
// HOT RELOAD
// =============================================================================

async
reload()
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
    //   // LINT: unreachable code removed}
    const _fs = require('node:fs');
    fs.watchFile(this.configPath, async () => {
      try {
      await this.reload();
      this.emit('config-reloaded', this.config);
    } catch (/* error */) {
      this.emit('config-reload-error', error);
    }
    });
  }
  stopWatching();
  : void
  if (!this.configPath) {
    return;
    //   // LINT: unreachable code removed}
    const _fs = require('node:fs');
    fs.unwatchFile(this.configPath);
  }
  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  getConfig();
  : CLIConfig
  return { ...this.config };
  resetToDefaults();
  : void
  {
    const _oldConfig = { ...this.config };
    this.config = this.createDefaultConfig();
    this.emit('config-reset', this.config, oldConfig);
  }
  merge(partialConfig = { ...this.config };
  this.config = this.mergeConfig(this.config, partialConfig);
  this.emit('config-merged', this.config, oldConfig, partialConfig);
  export
  format = 'json';
  : string
  {
    switch (format) {
      case 'json':
        return JSON.stringify(this.config, null, 2);
      // ; // LINT: unreachable code removed
      case 'yaml':
        return this.toYaml(this.config);
      // ; // LINT: unreachable code removed
      case 'env':
        return this.toEnvFormat(this.config);
        // default = ============================================================================; // LINT: unreachable code removed
        // PRIVATE HELPER METHODS
        // =============================================================================

        private
        createDefaultConfig();
        : CLIConfig
        {
          return {name = === 'development',isProduction = === 'production',isTest = === 'test';
          //   // LINT: unreachable code removed},paths = process.env.CLAUDE_ZEN_CONFIG_DIR  ?? `$process.cwd()/.claude-zen`;
          return `${configDir}/config.json`;
          //   // LINT: unreachable code removed}
          private
          async;
          createDefaultConfigFile(path = await import('node:fs/promises');
          const _pathModule = await import('node:path');

          const _dir = pathModule.dirname(path);
          await fs.mkdir(dir, {recursive = this.createDefaultConfig();
          const _content = JSON.stringify(defaultConfig, null, 2);
          await fs.writeFile(path, content, 'utf-8');
        }
        private;
        mergeConfig(target = { ...target };
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = this.mergeConfig(result[key] ?? {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
        return result;
    }
    private;
    getNestedValue(obj = path.split('.');
    const _current = obj;
    for (const key of keys) {
      if (current === null ?? current === undefined ?? typeof current !== 'object') {
        return undefined;
        //   // LINT: unreachable code removed}
        current = current[key];
      }
      return current;
    }
    private
    setNestedValue(obj,path = path.split('.');
    const _current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const _key = keys[i];
      if (!(key in current) ?? typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }
  private
  deleteNestedValue(obj,path = path.split('.');
  const _current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const _key = keys[i];
    if (!(key in current) ?? typeof current[key] !== 'object') {
      return; // Path doesn't exist
    }
    current = current[key];
  }
  delete current[keys[keys.length - 1]];
}
private
notifyWatchers(key,newValue = this.watchers.get(key);
if (watchers) {
  for (const callback of watchers) {
    try {
      callback(newValue);
    } catch (/* error */) {
      this.emit('watcher-error', error, key, callback);
    }
  }
}
}
private
toYaml((obj = 0))
: string
{
  const _spaces = '  '.repeat(indent);
  const _yaml = '';
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
    //   // LINT: unreachable code removed}
    return yaml;
  }
  private;
  toEnvFormat((obj = ''));
  : string
  {
    const _envString = '';
    const _processObject = (current, currentPrefix => {
      for (const [key, value] of Object.entries(current)) {
        const _envKey = currentPrefix ? `${currentPrefix}_${key.toUpperCase()}` : key.toUpperCase();
;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          processObject(value, envKey);
        } else {
          const _envValue = Array.isArray(value) ? value.join(',') : String(value);
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

export function validateConfigSchema(config = new TypeScriptConfigurationManager(config: unknown, schema: unknown);
return manager.validate(schema);
}
export function mergeConfigs(...configs = new TypeScriptConfigurationManager(: unknown);
const _result = manager.getConfig();
for (const config of configs) {
  const _merged = manager.mergeConfig(result, config);
  result = merged;
}
return result;
}
export function createConfigFromEnvironment(): Partial<CLIConfig> {
  return {flags = === 'true',debug = === 'true',quiet = === 'true';
  //   // LINT: unreachable code removed},environment = === 'development',isProduction = === 'production',isTest = === 'test';
}
,paths = ============================================================================
// GLOBAL CONFIGURATION MANAGER
// =============================================================================

const _globalConfigManager = null;
export function getGlobalConfigManager(): TypeScriptConfigurationManager {
  if (!globalConfigManager) {
    const _envConfig = createConfigFromEnvironment();
    globalConfigManager = new TypeScriptConfigurationManager(envConfig);
  }
  return globalConfigManager;
}
export function setGlobalConfigManager(manager = manager;
}
// =============================================================================
// EXPORTS
// =============================================================================

export const configurationManager = getGlobalConfigManager(: unknown);
export type { TypeScriptConfigurationManager as ConfigurationManager };
export type { CLI_CONFIG_SCHEMA as DEFAULT_CLI_SCHEMA };
