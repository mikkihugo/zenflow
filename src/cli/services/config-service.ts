/**
 * Configuration Service
 * 
 * Provides configuration management including loading, validation, migration, and backup.
 * Supports multiple configuration sources and formats with schema validation.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { EventEmitter } from 'events';
import { createLogger, type Logger } from '../utils/logger';
import { ensureDirectory, fileExists, copyFile } from '../utils/file-system';
import { validateObject, combineValidationResults } from '../utils/validation';
import type { CliConfig } from '../types/config';
import type { ValidationResult, Result } from '../types/index';

/**
 * Configuration manager interface
 */
export interface ConfigManager {
  /** Load configuration */
  load(): Promise<CliConfig>;
  
  /** Save configuration */
  save(config: CliConfig): Promise<void>;
  
  /** Validate configuration */
  validate(config: CliConfig): Promise<ValidationResult>;
  
  /** Get configuration value */
  get<T>(key: string): T | undefined;
  
  /** Set configuration value */
  set(key: string, value: any): Promise<void>;
  
  /** Reset to defaults */
  reset(): Promise<void>;
}

/**
 * Configuration validation options
 */
export interface ConfigValidationOptions {
  /** Strict validation (fail on warnings) */
  strict?: boolean;
  
  /** Schema version to validate against */
  schemaVersion?: string;
  
  /** Allow unknown properties */
  allowUnknown?: boolean;
  
  /** Custom validators */
  customValidators?: Record<string, (value: any) => ValidationResult>;
}

/**
 * Configuration migration result
 */
export interface ConfigMigrationResult {
  /** Migration success */
  success: boolean;
  
  /** Migration message */
  message: string;
  
  /** Source version */
  fromVersion: string;
  
  /** Target version */
  toVersion: string;
  
  /** Changes made */
  changes: Array<{
    type: 'added' | 'removed' | 'modified';
    path: string;
    oldValue?: any;
    newValue?: any;
  }>;
  
  /** Backup file path */
  backupPath?: string;
}

/**
 * Configuration backup options
 */
export interface ConfigBackupOptions {
  /** Backup directory */
  backupDir?: string;
  
  /** Include timestamp in backup filename */
  includeTimestamp?: boolean;
  
  /** Maximum number of backups to keep */
  maxBackups?: number;
  
  /** Compress backup files */
  compress?: boolean;
}

/**
 * Default CLI configuration
 */
const DEFAULT_CONFIG: CliConfig = {
  version: '1.0.0',
  plugins: {
    enabled: true,
    autoLoad: true,
    loadTimeout: 10000,
    registry: 'https://registry.npmjs.org',
    directories: ['plugins', 'node_modules'],
  },
  swarm: {
    defaultTopology: 'hierarchical',
    maxAgents: 8,
    strategy: 'balanced',
    autoScale: false,
    persistence: {
      enabled: true,
      type: 'file',
    },
  },
  database: {
    type: 'sqlite',
    path: 'data/claude-flow.db',
    ssl: {
      enabled: false,
    },
    poolSize: 5,
  },
  ui: {
    theme: 'dark',
    animations: true,
    colorSupport: true,
  },
  logging: {
    level: 'info',
    outputs: ['console'],
    colors: true,
    timestamps: true,
  },
  security: {
    enableSandbox: true,
    allowedHosts: ['localhost', '127.0.0.1'],
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000,
    },
  },
  performance: {
    maxMemoryUsage: 1024,
    maxCpuUsage: 80,
    cacheSize: 100,
    enableProfiling: false,
  },
};

/**
 * Configuration file locations
 */
const CONFIG_LOCATIONS = [
  join(process.cwd(), 'claude-flow.config.json'),
  join(process.cwd(), '.claude-flow.json'),
  join(homedir(), '.config', 'claude-flow', 'config.json'),
  join(homedir(), '.claude-flow.json'),
];

/**
 * Configuration service implementation
 */
export class ConfigService extends EventEmitter implements ConfigManager {
  private logger: Logger;
  private config: CliConfig;
  private configPath: string | null = null;
  private initialized = false;
  private watchers = new Map<string, any>();
  
  constructor(config?: Record<string, any>) {
    super();
    this.logger = createLogger({ prefix: 'ConfigService' });
    this.config = { ...DEFAULT_CONFIG };
    
    if (config?.configPath) {
      this.configPath = config.configPath;
    }
  }
  
  /**
   * Initialize the configuration service
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      this.config = await this.load();
      this.initialized = true;
      this.logger.info('Configuration service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize configuration service:', error);
      throw error;
    }
  }
  
  /**
   * Dispose the configuration service
   */
  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    try {
      // Stop all file watchers
      for (const [path, watcher] of this.watchers) {
        if (watcher && typeof watcher.close === 'function') {
          watcher.close();
        }
      }
      this.watchers.clear();
      
      this.initialized = false;
      this.logger.info('Configuration service disposed');
    } catch (error) {
      this.logger.error('Error disposing configuration service:', error);
    }
  }
  
  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      if (!this.initialized) {
        return {
          healthy: false,
          message: 'Service not initialized',
        };
      }
      
      // Validate current configuration
      const validation = await this.validate(this.config);
      if (!validation.valid) {
        return {
          healthy: false,
          message: `Configuration validation failed: ${validation.errors[0]?.message}`,
        };
      }
      
      return {
        healthy: true,
        message: 'Configuration is valid',
      };
    } catch (error) {
      return {
        healthy: false,
        message: (error as Error).message,
      };
    }
  }
  
  /**
   * Load configuration from file system
   */
  async load(): Promise<CliConfig> {
    try {
      // Find configuration file
      let configData: CliConfig = { ...DEFAULT_CONFIG };
      
      if (this.configPath) {
        // Use specified config path
        if (await fileExists(this.configPath)) {
          const data = await readFile(this.configPath, 'utf8');
          const parsed = JSON.parse(data);
          configData = this.mergeConfigs(DEFAULT_CONFIG, parsed);
          this.logger.info(`Loaded configuration from: ${this.configPath}`);
        } else {
          this.logger.warn(`Specified config file not found: ${this.configPath}`);
        }
      } else {
        // Search for config file in standard locations
        for (const location of CONFIG_LOCATIONS) {
          if (await fileExists(location)) {
            const data = await readFile(location, 'utf8');
            const parsed = JSON.parse(data);
            configData = this.mergeConfigs(DEFAULT_CONFIG, parsed);
            this.configPath = location;
            this.logger.info(`Loaded configuration from: ${location}`);
            break;
          }
        }
      }
      
      // Validate configuration
      const validation = await this.validate(configData);
      if (!validation.valid) {
        this.logger.warn('Configuration validation failed:', validation.errors);
        if (validation.warnings.length > 0) {
          this.logger.warn('Configuration warnings:', validation.warnings);
        }
      }
      
      // Set up file watching if config file exists
      if (this.configPath && await fileExists(this.configPath)) {
        await this.watchConfigFile(this.configPath);
      }
      
      return configData;
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      this.logger.info('Using default configuration');
      return { ...DEFAULT_CONFIG };
    }
  }
  
  /**
   * Save configuration to file
   */
  async save(config: CliConfig): Promise<void> {
    try {
      // Use existing config path or default
      const savePath = this.configPath || CONFIG_LOCATIONS[0];
      
      // Ensure directory exists
      await ensureDirectory(dirname(savePath));
      
      // Validate before saving
      const validation = await this.validate(config);
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors[0]?.message}`);
      }
      
      // Create backup if file exists
      if (await fileExists(savePath)) {
        await this.createBackup(savePath);
      }
      
      // Save configuration
      await writeFile(savePath, JSON.stringify(config, null, 2), 'utf8');
      
      this.config = config;
      this.configPath = savePath;
      
      this.logger.info(`Configuration saved to: ${savePath}`);
      this.emit('configSaved', { path: savePath, config });
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      throw error;
    }
  }
  
  /**
   * Validate configuration
   */
  async validate(
    config: CliConfig,
    options: ConfigValidationOptions = {}
  ): Promise<ValidationResult> {
    try {
      const results: ValidationResult[] = [];
      
      // Basic structure validation
      results.push(validateObject(config, {
        fieldName: 'Configuration',
        requiredKeys: ['version'],
      }));
      
      // Plugin configuration validation
      if (config.plugins) {
        results.push(validateObject(config.plugins, {
          fieldName: 'plugins',
          schema: {
            enabled: (value) => {
              if (typeof value !== 'boolean') {
                return {
                  valid: false,
                  errors: [{
                    message: 'plugins.enabled must be a boolean',
                    code: 'INVALID_TYPE',
                    path: 'plugins.enabled',
                    expected: 'boolean',
                    actual: typeof value,
                  }],
                  warnings: [],
                };
              }
              return { valid: true, errors: [], warnings: [] };
            },
          },
        }));
      }
      
      // Database configuration validation
      if (config.database) {
        results.push(validateObject(config.database, {
          fieldName: 'database',
          requiredKeys: ['type'],
        }));
      }
      
      // Apply custom validators
      if (options.customValidators) {
        for (const [key, validator] of Object.entries(options.customValidators)) {
          const value = this.getNestedValue(config, key);
          if (value !== undefined) {
            results.push(validator(value));
          }
        }
      }
      
      const combined = combineValidationResults(...results);
      
      // Check strictness
      if (options.strict && combined.warnings.length > 0) {
        combined.valid = false;
        combined.errors.push(...combined.warnings.map(warning => ({
          message: warning.message,
          code: warning.code,
          path: warning.path,
          expected: 'no warnings in strict mode',
          actual: 'warning present',
        })));
      }
      
      return combined;
    } catch (error) {
      return {
        valid: false,
        errors: [{
          message: `Validation error: ${(error as Error).message}`,
          code: 'VALIDATION_ERROR',
          path: 'root',
        }],
        warnings: [],
      };
    }
  }
  
  /**
   * Get configuration value by key path
   */
  get<T>(key: string): T | undefined {
    return this.getNestedValue(this.config, key) as T;
  }
  
  /**
   * Set configuration value by key path
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const newConfig = { ...this.config };
      this.setNestedValue(newConfig, key, value);
      
      // Validate the updated configuration
      const validation = await this.validate(newConfig);
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors[0]?.message}`);
      }
      
      this.config = newConfig;
      
      // Save if we have a config path
      if (this.configPath) {
        await this.save(this.config);
      }
      
      this.emit('configChanged', { key, value, config: this.config });
    } catch (error) {
      this.logger.error(`Failed to set configuration value ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Reset configuration to defaults
   */
  async reset(): Promise<void> {
    try {
      this.config = { ...DEFAULT_CONFIG };
      
      if (this.configPath) {
        await this.save(this.config);
      }
      
      this.logger.info('Configuration reset to defaults');
      this.emit('configReset', { config: this.config });
    } catch (error) {
      this.logger.error('Failed to reset configuration:', error);
      throw error;
    }
  }
  
  /**
   * Create configuration backup
   */
  async createBackup(
    configPath: string,
    options: ConfigBackupOptions = {}
  ): Promise<string> {
    try {
      const {
        backupDir = join(dirname(configPath), 'backups'),
        includeTimestamp = true,
        maxBackups = 10,
      } = options;
      
      await ensureDirectory(backupDir);
      
      const timestamp = includeTimestamp 
        ? new Date().toISOString().replace(/[:.]/g, '-')
        : '';
      
      const backupName = `config-backup${timestamp ? '-' + timestamp : ''}.json`;
      const backupPath = join(backupDir, backupName);
      
      await copyFile(configPath, backupPath);
      
      // Clean up old backups
      await this.cleanupOldBackups(backupDir, maxBackups);
      
      this.logger.info(`Configuration backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      this.logger.error('Failed to create configuration backup:', error);
      throw error;
    }
  }
  
  /**
   * Migrate configuration to newer version
   */
  async migrate(
    fromVersion: string,
    toVersion: string
  ): Promise<ConfigMigrationResult> {
    try {
      this.logger.info(`Migrating configuration from ${fromVersion} to ${toVersion}`);
      
      const changes: ConfigMigrationResult['changes'] = [];
      let backupPath: string | undefined;
      
      // Create backup before migration
      if (this.configPath && await fileExists(this.configPath)) {
        backupPath = await this.createBackup(this.configPath, {
          includeTimestamp: true,
        });
      }
      
      // Apply migrations based on version changes
      const migratedConfig = await this.applyMigrations(
        this.config,
        fromVersion,
        toVersion,
        changes
      );
      
      // Update version
      migratedConfig.version = toVersion;
      changes.push({
        type: 'modified',
        path: 'version',
        oldValue: fromVersion,
        newValue: toVersion,
      });
      
      // Validate migrated configuration
      const validation = await this.validate(migratedConfig);
      if (!validation.valid) {
        throw new Error(`Migrated configuration is invalid: ${validation.errors[0]?.message}`);
      }
      
      // Save migrated configuration
      await this.save(migratedConfig);
      
      const result: ConfigMigrationResult = {
        success: true,
        message: `Successfully migrated configuration from ${fromVersion} to ${toVersion}`,
        fromVersion,
        toVersion,
        changes,
        backupPath,
      };
      
      this.emit('configMigrated', result);
      
      return result;
    } catch (error) {
      const result: ConfigMigrationResult = {
        success: false,
        message: `Migration failed: ${(error as Error).message}`,
        fromVersion,
        toVersion,
        changes: [],
      };
      
      this.logger.error('Configuration migration failed:', error);
      return result;
    }
  }
  
  /**
   * Watch configuration file for changes
   */
  private async watchConfigFile(configPath: string): Promise<void> {
    try {
      // Remove existing watcher
      const existingWatcher = this.watchers.get(configPath);
      if (existingWatcher) {
        existingWatcher.close();
      }
      
      const { watch } = await import('fs');
      const watcher = watch(configPath, async (eventType) => {
        if (eventType === 'change') {
          try {
            this.logger.info('Configuration file changed, reloading...');
            const newConfig = await this.load();
            
            if (JSON.stringify(newConfig) !== JSON.stringify(this.config)) {
              this.config = newConfig;
              this.emit('configReloaded', { config: newConfig });
            }
          } catch (error) {
            this.logger.error('Failed to reload configuration:', error);
          }
        }
      });
      
      this.watchers.set(configPath, watcher);
    } catch (error) {
      this.logger.warn('Failed to set up config file watcher:', error);
    }
  }
  
  /**
   * Merge configuration objects
   */
  private mergeConfigs(base: CliConfig, override: Partial<CliConfig>): CliConfig {
    const result = { ...base };
    
    for (const [key, value] of Object.entries(override)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key as keyof CliConfig] = {
          ...(result[key as keyof CliConfig] as any),
          ...value,
        };
      } else {
        result[key as keyof CliConfig] = value as any;
      }
    }
    
    return result;
  }
  
  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }
  
  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }
  
  /**
   * Apply configuration migrations
   */
  private async applyMigrations(
    config: CliConfig,
    fromVersion: string,
    toVersion: string,
    changes: ConfigMigrationResult['changes']
  ): Promise<CliConfig> {
    const migratedConfig = { ...config };
    
    // Example migration logic (would be expanded based on actual version changes)
    if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
      // Migrate old plugin structure
      if ('enablePlugins' in migratedConfig) {
        migratedConfig.plugins = {
          ...migratedConfig.plugins,
          enabled: (migratedConfig as any).enablePlugins,
        };
        delete (migratedConfig as any).enablePlugins;
        
        changes.push({
          type: 'modified',
          path: 'plugins.enabled',
          oldValue: (migratedConfig as any).enablePlugins,
          newValue: migratedConfig.plugins.enabled,
        });
        
        changes.push({
          type: 'removed',
          path: 'enablePlugins',
          oldValue: (migratedConfig as any).enablePlugins,
        });
      }
    }
    
    return migratedConfig;
  }
  
  /**
   * Clean up old backup files
   */
  private async cleanupOldBackups(backupDir: string, maxBackups: number): Promise<void> {
    try {
      if (!existsSync(backupDir)) {
        return;
      }
      
      const fs = require('fs');
      const files = fs.readdirSync(backupDir)
        .filter((f: string) => f.startsWith('config-backup') && f.endsWith('.json'))
        .map((f: string) => ({
          name: f,
          path: join(backupDir, f),
          stats: fs.statSync(join(backupDir, f)),
        }))
        .sort((a: any, b: any) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
      
      if (files.length > maxBackups) {
        const filesToDelete = files.slice(maxBackups);
        
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          this.logger.debug(`Deleted old backup: ${file.name}`);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to cleanup old backups:', error);
    }
  }
}
