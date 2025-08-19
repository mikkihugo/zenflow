/**
 * @fileoverview Configuration Loader - Multi-source configuration loading with priority management
 * 
 * This module provides comprehensive configuration loading capabilities from multiple sources
 * with proper priority handling and merging. Supports loading from files, environment variables,
 * CLI arguments, and default configurations with intelligent parsing and validation.
 * 
 * **Key Features:**
 * - **Multi-Source Loading**: Files, environment variables, CLI arguments, and defaults
 * - **Priority Management**: Higher priority sources override lower priority sources
 * - **Format Support**: JSON, JavaScript, and TypeScript configuration files
 * - **Environment Variable Mapping**: Automatic parsing and mapping from environment variables
 * - **CLI Argument Support**: Dynamic configuration via command-line arguments
 * - **Deep Merging**: Intelligent deep merging of nested configuration objects
 * - **Type Parsing**: Automatic type conversion (strings, numbers, booleans, arrays)
 * - **Validation Integration**: Built-in configuration validation with detailed results
 * 
 * **Source Priority (highest to lowest):**
 * 1. CLI arguments (--config.path.to.value)
 * 2. Environment variables (with ENV_MAPPINGS)
 * 3. Configuration files (JSON/JS/TS)
 * 4. Default configuration
 * 
 * **Configuration File Search Paths:**
 * - ./config/claude-zen.json
 * - ./claude-zen.config.json
 * - ~/.claude-zen/config.json
 * - /etc/claude-zen/config.json
 * 
 * @example Basic Configuration Loading
 * ```typescript
 * import { ConfigurationLoader } from './loader';
 * 
 * const loader = new ConfigurationLoader();
 * const result = await loader.loadConfiguration();
 * 
 * if (result.validation.valid) {
 *   console.log('Configuration loaded successfully');
 *   console.log('Port:', result.config.core.port);
 * } else {
 *   console.error('Configuration validation failed:', result.validation.errors);
 * }
 * ```
 * 
 * @example Custom Configuration Paths
 * ```typescript
 * const loader = new ConfigurationLoader();
 * const result = await loader.loadConfiguration([
 *   './config/production.json',
 *   './config/local-overrides.json'
 * ]);
 * 
 * // Access merged configuration
 * const dbUrl = result.config.database.url;
 * const enableDebug = result.config.core.debug;
 * ```
 * 
 * @example Environment Variable Configuration
 * ```bash
 * # Set environment variables
 * export WEB_PORT=3000
 * export ZEN_LOG_LEVEL=debug
 * export ZEN_ENABLE_METRICS=true
 * 
 * # These will be automatically mapped to configuration paths
 * # based on ENV_MAPPINGS definitions
 * ```
 * 
 * @example CLI Argument Configuration
 * ```bash
 * # Override configuration via CLI arguments
 * node app.js --config.core.port 8080 --config.core.debug true
 * node app.js --config.database.host localhost --config.database.port 5432
 * ```
 * 
 * @example Advanced Usage with Custom Validation
 * ```typescript
 * const loader = new ConfigurationLoader();
 * const result = await loader.loadConfiguration();
 * 
 * // Inspect configuration sources for debugging
 * const sources = loader.getSources();
 * console.log('Configuration loaded from:', sources.map(s => s.type));
 * 
 * // Handle validation results
 * if (!result.validation.valid) {
 *   result.validation.errors.forEach(error => {
 *     console.error(`Validation error: ${error}`);
 *   });
 * }
 * ```
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 * 
 * @see {@link ConfigurationSource} Configuration source interface
 * @see {@link SystemConfiguration} System configuration interface
 * @see {@link ConfigValidator} Configuration validation system
 * @see {@link ENV_MAPPINGS} Environment variable mappings
 */


import * as fs from 'node:fs';
import * as path from 'node:path';

import { getLogger } from '../config/logging-config'; // Use any to allow flexible logger interface
import type {
  ConfigurationSource,
  ConfigValidationResult,
  SystemConfiguration,
} from '../types/config-types';

import { DEFAULT_CONFIG, ENV_MAPPINGS } from './defaults';
import { ConfigValidator } from './validator';

const logger = getLogger('ConfigLoader') as any;

/**
 * Configuration loader with multi-source support and priority management.
 * 
 * Provides comprehensive configuration loading from multiple sources with intelligent
 * merging, type parsing, and validation. Supports files, environment variables,
 * CLI arguments, and default configurations with proper priority handling.
 * 
 * @example Basic Usage
 * ```typescript
 * const loader = new ConfigurationLoader();
 * const { config, validation } = await loader.loadConfiguration();
 * 
 * if (validation.valid) {
 *   console.log('Configuration loaded:', config.core.port);
 * }
 * ```
 * 
 * @example Custom Paths
 * ```typescript
 * const loader = new ConfigurationLoader();
 * const result = await loader.loadConfiguration([
 *   './config/prod.json',
 *   './config/overrides.json'
 * ]);
 * ```
 */
export class ConfigurationLoader {
  private sources: ConfigurationSource[] = [];
  private validator = new ConfigValidator();

  /**
   * Load configuration from all sources.
   *
   * @param configPaths
   */
  async loadConfiguration(configPaths?: string[]): Promise<{
    config: SystemConfiguration;
    validation: ConfigValidationResult;
  }> {
    // Clear existing sources
    this.sources = [];

    // 1. Load defaults (lowest priority)
    this.addSource({
      type: 'defaults',
      priority: 0,
      data: DEFAULT_CONFIG,
    });

    // 2. Load from config files
    const defaultPaths = [
      './config/claude-zen.json',
      './claude-zen.config.json',
      '~/.claude-zen/config.json',
      '/etc/claude-zen/config.json',
    ];

    const pathsToTry = configPaths || defaultPaths;
    for (const configPath of pathsToTry) {
      await this.loadFromFile(configPath);
    }

    // 3. Load from environment variables (higher priority)
    this.loadFromEnvironment();

    // 4. Load from CLI arguments (highest priority)
    this.loadFromCliArgs();

    // Merge all sources by priority
    const mergedConfig = this.mergeSources();

    // Validate the final configuration
    const validation = this.validator.validate(mergedConfig);

    return {
      config: mergedConfig,
      validation,
    };
  }

  /**
   * Add a configuration source.
   *
   * @param source
   */
  private addSource(source: ConfigurationSource): void {
    this.sources.push(source);
    // Sort by priority (higher numbers override lower)
    this.sources.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Load configuration from file.
   *
   * @param filePath
   */
  private async loadFromFile(filePath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(
        filePath.replace('~', process.env['HOME'] || '~')
      );

      if (!fs.existsSync(resolvedPath)) {
        return;
      }

      const content = fs.readFileSync(resolvedPath, 'utf8');
      let data: Partial<SystemConfiguration>;

      if (filePath.endsWith('.json')) {
        data = JSON.parse(content);
      } else if (filePath.endsWith('') || filePath.endsWith('.js')) {
        // Dynamic import for JS/TS config files
        const module = await import(resolvedPath);
        data = module.default || module;
      } else {
        logger.warn(`Unsupported config file format: ${filePath}`);
        return;
      }

      this.addSource({
        type: 'file',
        priority: 10,
        data,
      });
    } catch (error) {
      logger.warn(`Failed to load config from ${filePath}:`, error);
    }
  }

  /**
   * Load configuration from environment variables.
   */
  private loadFromEnvironment(): void {
    const envConfig: Partial<SystemConfiguration> = {};

    for (const [envVar, mapping] of Object.entries(ENV_MAPPINGS)) {
      const value = process.env[envVar];
      if (value !== undefined) {
        let parsedValue: unknown = value;

        // Parse value based on type
        switch (mapping.type) {
          case 'number':
            parsedValue = Number(value);
            if (Number.isNaN(parsedValue)) {
              logger.warn(`Invalid number value for ${envVar}: ${value}`);
              continue;
            }
            break;
          case 'boolean':
            parsedValue = value.toLowerCase() === 'true' || value === '1';
            break;
          case 'array':
            parsedValue = mapping.parser ? mapping.parser(value) : value.split(',').map((v) => v.trim());
            break;
          default:
            parsedValue = value;
            break;
        }

        // Set nested property
        this.setNestedProperty(envConfig, mapping.path, parsedValue);
      }
    }

    if (Object.keys(envConfig).length > 0) {
      this.addSource({
        type: 'env',
        priority: 20,
        data: envConfig,
      });
    }
  }

  /**
   * Load configuration from CLI arguments.
   */
  private loadFromCliArgs(): void {
    const args = process.argv.slice(2);
    const cliConfig: Partial<SystemConfiguration> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg?.startsWith('--config.')) {
        const configPath = arg.substring(9); // Remove '--config.'
        const value = args[i + 1];

        if (value && !value.startsWith('--')) {
          let parsedValue: unknown = value;

          // Try to parse as JSON for complex values
          if (value.startsWith('{') || value.startsWith('[')) {
            try {
              parsedValue = JSON.parse(value);
            } catch {
              // Keep as string if JSON parsing fails
            }
          } else if (value === 'true' || value === 'false') {
            parsedValue = value === 'true';
          } else if (!Number.isNaN(Number(value))) {
            parsedValue = Number(value);
          }

          this.setNestedProperty(cliConfig, configPath, parsedValue);
          i++; // Skip the next argument as it's the value
        }
      }
    }

    if (Object.keys(cliConfig).length > 0) {
      this.addSource({
        type: 'cli',
        priority: 30,
        data: cliConfig,
      });
    }
  }

  /**
   * Merge all configuration sources by priority.
   */
  private mergeSources(): SystemConfiguration {
    let mergedConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    for (const source of this.sources) {
      mergedConfig = this.deepMerge(mergedConfig, source.data);
    }

    return mergedConfig;
  }

  /**
   * Deep merge two objects.
   *
   * @param target
   * @param source
   */
  private deepMerge(target: unknown, source: unknown): unknown {
    const result = { ...(target as any) };

    for (const key in source as any) {
      result[key] = (source as any)[key] &&
        typeof (source as any)[key] === 'object' &&
        !Array.isArray((source as any)[key]) ? this.deepMerge(
          (result as any)?.[key] || {},
          (source as any)[key]
        ) : (source as any)[key];
    }

    return result;
  }

  /**
   * Set nested property using dot notation.
   *
   * @param obj
   * @param path
   * @param value
   */
  private setNestedProperty(obj: unknown, path: string, value: unknown): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (
        part &&
        (!(part in (current as any)) ||
          typeof (current as any)?.[part] !== 'object')
      ) {
        (current as any)[part] = {};
      }
      if (part) {
        current = (current as any)?.[part];
      }
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      (current as any)[lastPart] = value;
    }
  }

  /**
   * Get configuration sources for debugging.
   */
  getSources(): ConfigurationSource[] {
    return [...this.sources];
  }
}
