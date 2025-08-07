/**
 * @file Configuration Loader
 *
 * Handles loading configuration from multiple sources with proper priority
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_CONFIG, ENV_MAPPINGS } from './defaults';
import type { ConfigurationSource, ConfigValidationResult, SystemConfiguration } from './types';
import { ConfigValidator } from './validator';

/**
 * Configuration loader with multi-source support
 *
 * @example
 */
export class ConfigurationLoader {
  private sources: ConfigurationSource[] = [];
  private validator = new ConfigValidator();

  /**
   * Load configuration from all sources
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
   * Add a configuration source
   *
   * @param source
   */
  private addSource(source: ConfigurationSource): void {
    this.sources.push(source);
    // Sort by priority (higher numbers override lower)
    this.sources.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Load configuration from file
   *
   * @param filePath
   */
  private async loadFromFile(filePath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(filePath.replace('~', process.env['HOME'] || '~'));

      if (!fs.existsSync(resolvedPath)) {
        return;
      }

      const content = fs.readFileSync(resolvedPath, 'utf8');
      let data: Partial<SystemConfiguration>;

      if (filePath.endsWith('.json')) {
        data = JSON.parse(content);
      } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        // Dynamic import for JS/TS config files
        const module = await import(resolvedPath);
        data = module.default || module;
      } else {
        console.warn(`Unsupported config file format: ${filePath}`);
        return;
      }

      this.addSource({
        type: 'file',
        priority: 10,
        data,
      });
    } catch (error) {
      console.warn(`Failed to load config from ${filePath}:`, error);
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): void {
    const envConfig: Partial<SystemConfiguration> = {};

    for (const [envVar, mapping] of Object.entries(ENV_MAPPINGS)) {
      const value = process.env[envVar];
      if (value !== undefined) {
        let parsedValue: any = value;

        // Parse value based on type
        switch (mapping.type) {
          case 'number':
            parsedValue = Number(value);
            if (Number.isNaN(parsedValue)) {
              console.warn(`Invalid number value for ${envVar}: ${value}`);
              continue;
            }
            break;
          case 'boolean':
            parsedValue = value.toLowerCase() === 'true' || value === '1';
            break;
          case 'array':
            if (mapping.parser) {
              parsedValue = mapping.parser(value);
            } else {
              parsedValue = value.split(',').map((v) => v.trim());
            }
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
   * Load configuration from CLI arguments
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
          let parsedValue: any = value;

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
   * Merge all configuration sources by priority
   */
  private mergeSources(): SystemConfiguration {
    let mergedConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    for (const source of this.sources) {
      mergedConfig = this.deepMerge(mergedConfig, source.data);
    }

    return mergedConfig;
  }

  /**
   * Deep merge two objects
   *
   * @param target
   * @param source
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Set nested property using dot notation
   *
   * @param obj
   * @param path
   * @param value
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
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
   * Get configuration sources for debugging
   */
  getSources(): ConfigurationSource[] {
    return [...this.sources];
  }
}
