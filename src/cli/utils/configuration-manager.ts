/**
 * Configuration Management System - TypeScript Edition
 * Comprehensive configuration loading, validation, and management
 */

import { 
  ConfigurationManager as IConfigurationManager,
  CLIConfig,
  ValidationResult 
} from '../../types/cli';
import { ConfigurationSchema, JSONObject } from '../../types/core';
import { ConfigurationError } from '../core/cli-error';
import { EventEmitter } from 'events';

// =============================================================================
// CONFIGURATION SCHEMA DEFINITIONS
// =============================================================================

const CLI_CONFIG_SCHEMA: ConfigurationSchema = {
  name: {
    type: 'string',
    required: true,
    default: 'claude-zen',
    description: 'CLI application name'
  },
  version: {
    type: 'string',
    required: true,
    default: '1.0.0',
    description: 'CLI application version'
  },
  description: {
    type: 'string',
    required: true,
    default: 'Revolutionary Claude Zen CLI',
    description: 'CLI application description'
  },
  usage: {
    type: 'string',
    required: true,
    default: 'claude-zen <command> [options]',
    description: 'CLI usage string'
  },
  'flags.verbose': {
    type: 'boolean',
    default: false,
    description: 'Enable verbose logging by default'
  },
  'flags.debug': {
    type: 'boolean',
    default: false,
    description: 'Enable debug mode by default'
  },
  'environment.nodeEnv': {
    type: 'string',
    default: 'development',
    description: 'Node.js environment'
  },
  'paths.dataDir': {
    type: 'string',
    required: true,
    description: 'Data directory path'
  },
  'paths.configDir': {
    type: 'string',
    required: true,
    description: 'Configuration directory path'
  },
  'paths.logsDir': {
    type: 'string',
    required: true,
    description: 'Logs directory path'
  },
  'paths.cacheDir': {
    type: 'string',
    required: true,
    description: 'Cache directory path'
  },
  'paths.tempDir': {
    type: 'string',
    required: true,
    description: 'Temporary files directory path'
  }
};

// =============================================================================
// CONFIGURATION MANAGER IMPLEMENTATION
// =============================================================================

export class TypeScriptConfigurationManager extends EventEmitter implements IConfigurationManager {
  private config: CLIConfig;
  private configPath?: string;
  private watchers: Map<string, Set<(value: any) => void>> = new Map();
  private schema: ConfigurationSchema;

  constructor(initialConfig?: Partial<CLIConfig>, schema: ConfigurationSchema = CLI_CONFIG_SCHEMA) {
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
      const fs = await import('fs/promises');
      
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
      let loadedConfig: any;

      try {
        if (configPath.endsWith('.json')) {
          loadedConfig = JSON.parse(configContent);
        } else if (configPath.endsWith('.js') || configPath.endsWith('.mjs')) {
          // Dynamic import for JS config files
          const configModule = await import(configPath);
          loadedConfig = configModule.default || configModule;
        } else {
          throw new Error('Unsupported config file format. Use .json, .js, or .mjs');
        }
      } catch (parseError) {
        throw new ConfigurationError(
          `Failed to parse config file: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          configPath
        );
      }

      // Merge with default config
      this.config = this.mergeConfig(this.config, loadedConfig);

      // Validate the loaded config
      const validationResults = this.validate(this.schema);
      if (validationResults.some(r => !r.valid)) {
        const errors = validationResults.filter(r => !r.valid);
        throw new ConfigurationError(
          `Configuration validation failed:\n${errors.map(e => `  ${e.key}: ${e.message}`).join('\n')}`,
          configPath
        );
      }

      this.emit('config-loaded', this.config, configPath);
      return this.config;

    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }

      throw new ConfigurationError(
        `Failed to load configuration from ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
        configPath
      );
    }
  }

  async save(config?: CLIConfig, path?: string): Promise<void> {
    const configToSave = config || this.config;
    const configPath = path || this.configPath || this.getDefaultConfigPath();

    try {
      const fs = await import('fs/promises');
      const pathModule = await import('path');

      // Ensure directory exists
      const configDir = pathModule.dirname(configPath);
      await fs.mkdir(configDir, { recursive: true });

      // Serialize config based on file extension
      let content: string;
      if (configPath.endsWith('.json')) {
        content = JSON.stringify(configToSave, null, 2);
      } else if (configPath.endsWith('.js') || configPath.endsWith('.mjs')) {
        content = `module.exports = ${JSON.stringify(configToSave, null, 2)};`;
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
        `Failed to save configuration to ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
        configPath
      );
    }
  }

  // =============================================================================
  // CONFIGURATION ACCESS
  // =============================================================================

  get<T = any>(key: string): T | undefined {
    return this.getNestedValue(this.config, key) as T;
  }

  set<T = any>(key: string, value: T): void {
    const oldValue = this.get(key);
    this.setNestedValue(this.config, key, value);
    
    // Notify watchers
    this.notifyWatchers(key, value, oldValue);
    
    // Emit change event
    this.emit('config-changed', key, value, oldValue);
  }

  has(key: string): boolean {
    return this.getNestedValue(this.config, key) !== undefined;
  }

  delete(key: string): boolean {
    const existed = this.has(key);
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

  validate(schema: ConfigurationSchema = this.schema): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const [key, schemaEntry] of Object.entries(schema)) {
      const value = this.get(key);
      const result: ValidationResult = {
        key,
        valid: true,
        value
      };

      // Check required fields
      if (schemaEntry.required && (value === undefined || value === null)) {
        result.valid = false;
        result.message = `Required field '${key}' is missing`;
        results.push(result);
        continue;
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

  watch(key: string, callback: (value: any) => void): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }
    
    this.watchers.get(key)!.add(callback);

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

  async reload(): Promise<void> {
    if (!this.configPath) {
      throw new ConfigurationError('No config file loaded, cannot reload');
    }

    await this.load(this.configPath);
  }

  startWatching(): void {
    if (!this.configPath) {
      return;
    }

    const fs = require('fs');
    fs.watchFile(this.configPath, async () => {
      try {
        await this.reload();
        this.emit('config-reloaded', this.config);
      } catch (error) {
        this.emit('config-reload-error', error);
      }
    });
  }

  stopWatching(): void {
    if (!this.configPath) {
      return;
    }

    const fs = require('fs');
    fs.unwatchFile(this.configPath);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  getConfig(): CLIConfig {
    return { ...this.config };
  }

  resetToDefaults(): void {
    const oldConfig = { ...this.config };
    this.config = this.createDefaultConfig();
    this.emit('config-reset', this.config, oldConfig);
  }

  merge(partialConfig: Partial<CLIConfig>): void {
    const oldConfig = { ...this.config };
    this.config = this.mergeConfig(this.config, partialConfig);
    this.emit('config-merged', this.config, oldConfig, partialConfig);
  }

  export(format: 'json' | 'yaml' | 'env' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.config, null, 2);
        
      case 'yaml':
        return this.toYaml(this.config);
        
      case 'env':
        return this.toEnvFormat(this.config);
        
      default:
        return JSON.stringify(this.config, null, 2);
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private createDefaultConfig(): CLIConfig {
    return {
      name: 'claude-zen',
      version: '1.0.0',
      description: 'Revolutionary Claude Zen CLI',
      usage: 'claude-zen <command> [options]',
      
      flags: {
        help: false,
        version: false,
        verbose: false,
        debug: false,
        quiet: false,
        tui: false,
        ui: false,
        minimal: false,
        noSwarm: false,
        noGraph: false,
        noVector: false,
        noCache: false,
        noBatch: false
      },
      
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isTest: process.env.NODE_ENV === 'test'
      },
      
      paths: {
        dataDir: process.env.CLAUDE_ZEN_DATA_DIR || `${process.cwd()}/.claude-zen`,
        configDir: process.env.CLAUDE_ZEN_CONFIG_DIR || `${process.cwd()}/.claude-zen/config`,
        logsDir: process.env.CLAUDE_ZEN_LOGS_DIR || `${process.cwd()}/.claude-zen/logs`,
        cacheDir: process.env.CLAUDE_ZEN_CACHE_DIR || `${process.cwd()}/.claude-zen/cache`,
        tempDir: process.env.CLAUDE_ZEN_TEMP_DIR || `${process.cwd()}/.claude-zen/temp`
      }
    };
  }

  private getDefaultConfigPath(): string {
    const configDir = process.env.CLAUDE_ZEN_CONFIG_DIR || `${process.cwd()}/.claude-zen`;
    return `${configDir}/config.json`;
  }

  private async createDefaultConfigFile(path: string): Promise<void> {
    const fs = await import('fs/promises');
    const pathModule = await import('path');
    
    const dir = pathModule.dirname(path);
    await fs.mkdir(dir, { recursive: true });
    
    const defaultConfig = this.createDefaultConfig();
    const content = JSON.stringify(defaultConfig, null, 2);
    await fs.writeFile(path, content, 'utf-8');
  }

  private mergeConfig(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
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

  private deleteNestedValue(obj: any, path: string): void {
    const keys = path.split('.');
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

  private notifyWatchers(key: string, newValue: any, oldValue?: any): void {
    const watchers = this.watchers.get(key);
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

  private toYaml(obj: any, indent = 0): string {
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

  private toEnvFormat(obj: any, prefix = ''): string {
    let envString = '';
    
    const processObject = (current: any, currentPrefix: string) => {
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

export function validateConfigSchema(config: any, schema: ConfigurationSchema): ValidationResult[] {
  const manager = new TypeScriptConfigurationManager(config, schema);
  return manager.validate(schema);
}

export function mergeConfigs(...configs: Partial<CLIConfig>[]): CLIConfig {
  const manager = new TypeScriptConfigurationManager();
  let result = manager.getConfig();
  
  for (const config of configs) {
    const merged = manager['mergeConfig'](result, config);
    result = merged;
  }
  
  return result;
}

export function createConfigFromEnvironment(): Partial<CLIConfig> {
  return {
    flags: {
      verbose: process.env.CLAUDE_FLOW_VERBOSE === 'true',
      debug: process.env.CLAUDE_FLOW_DEBUG === 'true',
      quiet: process.env.CLAUDE_FLOW_QUIET === 'true'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isTest: process.env.NODE_ENV === 'test'
    },
    paths: {
      dataDir: process.env.CLAUDE_ZEN_DATA_DIR || `${process.cwd()}/.claude-zen`,
      configDir: process.env.CLAUDE_ZEN_CONFIG_DIR || `${process.cwd()}/.claude-zen/config`,
      logsDir: process.env.CLAUDE_ZEN_LOGS_DIR || `${process.cwd()}/.claude-zen/logs`,
      cacheDir: process.env.CLAUDE_ZEN_CACHE_DIR || `${process.cwd()}/.claude-zen/cache`,
      tempDir: process.env.CLAUDE_ZEN_TEMP_DIR || `${process.cwd()}/.claude-zen/temp`
    }
  };
}

// =============================================================================
// GLOBAL CONFIGURATION MANAGER
// =============================================================================

let globalConfigManager: TypeScriptConfigurationManager | null = null;

export function getGlobalConfigManager(): TypeScriptConfigurationManager {
  if (!globalConfigManager) {
    const envConfig = createConfigFromEnvironment();
    globalConfigManager = new TypeScriptConfigurationManager(envConfig);
  }
  return globalConfigManager;
}

export function setGlobalConfigManager(manager: TypeScriptConfigurationManager): void {
  globalConfigManager = manager;
}

// =============================================================================
  // EXPORTS
// =============================================================================

export const configurationManager = getGlobalConfigManager();
export { TypeScriptConfigurationManager as ConfigurationManager };
export { CLI_CONFIG_SCHEMA as DEFAULT_CLI_SCHEMA };