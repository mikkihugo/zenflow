/**
 * Configuration Loader
 * 
 * Loads and validates CLI configuration from multiple sources:
 * - Configuration files (JSON, YAML)
 * - Environment variables
 * - Command line arguments
 * - Default values
 */

import { readFile, access } from 'fs/promises';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { load as yamlLoad } from 'js-yaml';
import type {
  CliConfig,
  ConfigValidationResult
} from '../types/index';

/**
 * Configuration source types
 */
export enum ConfigSource {
  DEFAULT = 'default',
  FILE = 'file',
  ENVIRONMENT = 'environment',
  ARGUMENT = 'argument'
}

/**
 * Configuration with source tracking
 */
export interface ConfigEntry<T = unknown> {
  value: T;
  source: ConfigSource;
  path?: string;
  priority: number;
}

/**
 * Configuration loading options
 */
export interface ConfigLoadOptions {
  /** Configuration file paths to try (in order) */
  configFiles?: string[];
  
  /** Environment variable prefix */
  envPrefix?: string;
  
  /** Whether to load user config from home directory */
  loadUserConfig?: boolean;
  
  /** Whether to load project config from current directory */
  loadProjectConfig?: boolean;
  
  /** Command line arguments to merge */
  cliArgs?: Record<string, unknown>;
  
  /** Validation mode */
  validate?: boolean;
  
  /** Whether to create default config if none found */
  createDefault?: boolean;
}

/**
 * Configuration loader implementation
 */
export class ConfigLoader {
  private static readonly DEFAULT_CONFIG_FILES = [
    '.claude-zen.json',
    '.claude-zen.yaml',
    '.claude-zen.yml',
    'claude-zen.config.js',
    'claude-zen.config.json'
  ];

  private static readonly USER_CONFIG_FILES = [
    '.claude-zen/config.json',
    '.claude-zen/config.yaml',
    '.config/claude-zen/config.json'
  ];

  private loadedConfig: CliConfig | null = null;
  private configSources = new Map<string, ConfigEntry>();

  /**
   * Load configuration from all sources
   */
  async load(options: ConfigLoadOptions = {}): Promise<CliConfig> {
    const {
      configFiles = ConfigLoader.DEFAULT_CONFIG_FILES,
      envPrefix = 'CLAUDE_ZEN',
      loadUserConfig = true,
      loadProjectConfig = true,
      cliArgs = {},
      validate = true,
      createDefault = true
    } = options;

    // Start with default configuration
    let config = this.getDefaultConfig();
    this.setConfigSource('default', config, ConfigSource.DEFAULT, 0);

    // Load user configuration
    if (loadUserConfig) {
      const userConfig = await this.loadUserConfig();
      if (userConfig) {
        config = this.mergeConfig(config, userConfig);
      }
    }

    // Load project configuration
    if (loadProjectConfig) {
      const projectConfig = await this.loadProjectConfig(configFiles);
      if (projectConfig) {
        config = this.mergeConfig(config, projectConfig);
      }
    }

    // Load environment variables
    const envConfig = this.loadEnvironmentConfig(envPrefix);
    if (Object.keys(envConfig).length > 0) {
      config = this.mergeConfig(config, envConfig);
      this.setConfigSource('environment', envConfig, ConfigSource.ENVIRONMENT, 30);
    }

    // Merge CLI arguments (highest priority)
    if (Object.keys(cliArgs).length > 0) {
      config = this.mergeConfig(config, cliArgs as Partial<CliConfig>);
      this.setConfigSource('arguments', cliArgs, ConfigSource.ARGUMENT, 40);
    }

    // Basic validation
    if (validate) {
      const validation = this.validate(config);
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn('Configuration warnings:');
        validation.warnings.forEach(w => console.warn(`  - ${w}`));
      }
    }

    this.loadedConfig = config;
    return config;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): CliConfig {
    return {
      app: {
        name: 'claude-zen',
        version: '2.0.0',
        description: 'Claude-Zen CLI',
        author: 'rUv',
        license: 'MIT'
      },
      defaults: {
        debug: false,
        verbose: false,
        format: 'text',
        timeout: 30000,
        retries: 3
      },
      plugins: {
        enabled: true,
        paths: ['./plugins', '~/.claude-zen/plugins'],
        autoLoad: true,
        initTimeout: 10000,
        errorHandling: 'graceful',
        allowedTypes: ['command', 'service', 'integration'],
        security: {
          requireSignatures: false,
          allowedSources: ['local', 'official'],
          sandboxed: false
        }
      },
      swarm: {
        enabled: true,
        maxAgents: 10,
        defaultTopology: 'mesh',
        coordination: {
          strategy: 'balanced',
          timeout: 30000
        }
      },
      database: {
        type: 'sqlite',
        connection: {
          database: 'claude-zen.db'
        },
        pool: {
          min: 1,
          max: 10,
          acquireTimeoutMillis: 30000,
          idleTimeoutMillis: 600000
        },
        migrations: {
          directory: 'migrations',
          autoRun: true,
          tableName: 'migrations'
        }
      },
      ui: {
        theme: 'dark',
        animations: {
          enabled: true,
          duration: 200
        }
      },
      logging: {
        level: 'info',
        outputs: [{
          type: 'console',
          enabled: true,
          config: {}
        }],
        format: 'text',
        includeTimestamp: true,
        includeLevel: true,
        rotateFiles: false
      },
      security: {
        encryption: {
          algorithm: 'aes-256-gcm',
          keySize: 256,
          keyRotationDays: 30
        },
        authentication: {
          enabled: false,
          provider: 'local'
        },
        rateLimit: {
          enabled: true,
          windowMs: 60000,
          maxRequests: 100,
          skipSuccessfulRequests: false
        }
      },
      performance: {
        caching: {
          enabled: true,
          ttl: 300000,
          maxSize: 1000
        },
        optimization: {
          enabled: true,
          lazy: true,
          compression: true
        }
      }
    };
  }

  /**
   * Load user configuration from home directory
   */
  private async loadUserConfig(): Promise<Partial<CliConfig> | null> {
    const homeDir = homedir();
    
    for (const fileName of ConfigLoader.USER_CONFIG_FILES) {
      const configPath = join(homeDir, fileName);
      
      try {
        const config = await this.loadConfigFile(configPath);
        if (config) {
          this.setConfigSource('user', config, ConfigSource.FILE, 10, configPath);
          return config;
        }
      } catch (error) {
        // Continue to next file if current one fails
        continue;
      }
    }
    
    return null;
  }

  /**
   * Load project configuration from current directory
   */
  private async loadProjectConfig(configFiles: string[]): Promise<Partial<CliConfig> | null> {
    const currentDir = process.cwd();
    
    for (const fileName of configFiles) {
      const configPath = join(currentDir, fileName);
      
      try {
        const config = await this.loadConfigFile(configPath);
        if (config) {
          this.setConfigSource('project', config, ConfigSource.FILE, 20, configPath);
          return config;
        }
      } catch (error) {
        // Continue to next file if current one fails
        continue;
      }
    }
    
    return null;
  }

  /**
   * Load configuration from a specific file
   */
  private async loadConfigFile(filePath: string): Promise<Partial<CliConfig> | null> {
    try {
      await access(filePath);
      const content = await readFile(filePath, 'utf-8');
      
      if (filePath.endsWith('.json')) {
        return JSON.parse(content) as Partial<CliConfig>;
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        return yamlLoad(content) as Partial<CliConfig>;
      } else if (filePath.endsWith('.js')) {
        // Dynamic import for JS config files
        const module = await import(resolve(filePath));
        return module.default || module;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadEnvironmentConfig(prefix: string): Partial<CliConfig> {
    const config: Partial<CliConfig> = {};
    const envPrefix = `${prefix}_`;
    
    // Simple environment variable mapping
    if (process.env[`${envPrefix}DEBUG`]) {
      this.setNestedProperty(config, 'defaults.debug', process.env[`${envPrefix}DEBUG`] === 'true');
    }
    
    if (process.env[`${envPrefix}VERBOSE`]) {
      this.setNestedProperty(config, 'defaults.verbose', process.env[`${envPrefix}VERBOSE`] === 'true');
    }
    
    return config;
  }

  /**
   * Set nested property in object
   */
  private setNestedProperty(obj: any, path: string, value: unknown): void {
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

  /**
   * Merge two configuration objects
   */
  private mergeConfig(base: CliConfig, override: Partial<CliConfig>): CliConfig {
    return this.deepMerge(base, override) as CliConfig;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Set configuration source information
   */
  private setConfigSource(
    key: string, 
    value: unknown, 
    source: ConfigSource, 
    priority: number, 
    path?: string
  ): void {
    this.configSources.set(key, { value, source, priority, path });
  }

  /**
   * Basic configuration validation
   */
  validate(config: CliConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation checks
    if (!config.app?.name) {
      errors.push('Application name is required');
    }
    
    if (!config.app?.version) {
      errors.push('Application version is required');
    }
    
    if (config.swarm?.maxAgents && config.swarm.maxAgents < 1) {
      errors.push('Maximum agents must be at least 1');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get current loaded configuration
   */
  getConfig(): CliConfig | null {
    return this.loadedConfig;
  }

  /**
   * Get configuration sources
   */
  getConfigSources(): Map<string, ConfigEntry> {
    return new Map(this.configSources);
  }

  /**
   * Reload configuration
   */
  async reload(options?: ConfigLoadOptions): Promise<CliConfig> {
    this.loadedConfig = null;
    this.configSources.clear();
    return this.load(options);
  }

  /**
   * Check if configuration has been loaded
   */
  isLoaded(): boolean {
    return this.loadedConfig !== null;
  }
}