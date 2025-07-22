/**
 * Centralized configuration management
 * Implements Google's dependency injection and configuration principles
 */

import { ConfigurationError } from './cli-error.js';
import logger from './logger.js';
import path from 'path';
import os from 'os';

const DEFAULT_CONFIG = {
  version: '2.0.0',
  logging: {
    level: 'info',
    verbose: false
  },
  commands: {
    timeout: 30000,
    maxRetries: 3
  },
  swarm: {
    maxAgents: 8,
    defaultTopology: 'hierarchical',
    defaultStrategy: 'balanced'
  },
  memory: {
    persistentStorage: true,
    maxMemoryMb: 100,
    cleanupIntervalMs: 300000
  },
  hooks: {
    enabled: true,
    safeMode: false,
    maxExecutionTimeMs: 5000
  }
};

class ConfigurationManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.configPath = null;
    this.loaded = false;
  }
  
  /**
   * Get configuration file path
   */
  getConfigPath() {
    if (this.configPath) return this.configPath;
    
    // Try various locations in order of preference
    const possiblePaths = [
      process.env.CLAUDE_FLOW_CONFIG,
      path.join(process.cwd(), '.claude-zen.json'),
      path.join(process.cwd(), 'claude-zen.config.json'),
      path.join(os.homedir(), '.config', 'claude-zen', 'config.json'),
      path.join(os.homedir(), '.claude-zen.json')
    ].filter(Boolean);
    
    for (const configPath of possiblePaths) {
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
   */
  async loadConfiguration() {
    if (this.loaded) return this.config;
    
    const configPath = this.getConfigPath();
    
    try {
      if (existsSync(configPath)) {
        const content = await readTextFile(configPath);
        const parsedConfig = JSON.parse(content);
        
        // Merge with defaults (deep merge)
        this.config = this.deepMerge(DEFAULT_CONFIG, parsedConfig);
        logger.debug(`Configuration loaded from ${configPath}`);
      } else {
        logger.debug(`No configuration file found at ${configPath}, using defaults`);
      }
    } catch (error) {
      throw new ConfigurationError(
        `Failed to load configuration from ${configPath}: ${error.message}`,
        configPath
      );
    }
    
    this.loaded = true;
    return this.config;
  }
  
  /**
   * Save configuration to file
   */
  async saveConfiguration() {
    const configPath = this.getConfigPath();
    const configDir = path.dirname(configPath);
    
    try {
      // Ensure directory exists
      await mkdirAsync(configDir, { recursive: true });
      
      const content = JSON.stringify(this.config, null, 2);
      await writeTextFile(configPath, content);
      logger.debug(`Configuration saved to ${configPath}`);
    } catch (error) {
      throw new ConfigurationError(
        `Failed to save configuration to ${configPath}: ${error.message}`,
        configPath
      );
    }
  }
  
  /**
   * Get configuration value by path
   */
  get(keyPath, defaultValue = null) {
    return this.getNestedValue(this.config, keyPath, defaultValue);
  }
  
  /**
   * Set configuration value by path
   */
  set(keyPath, value) {
    this.setNestedValue(this.config, keyPath, value);
  }
  
  /**
   * Get entire configuration object
   */
  getAll() {
    return { ...this.config };
  }
  
  /**
   * Reset to default configuration
   */
  reset() {
    this.config = { ...DEFAULT_CONFIG };
  }
  
  /**
   * Validate configuration structure
   */
  validate() {
    const errors = [];
    
    // Validate required fields
    if (!this.config.version) {
      errors.push('Missing version field');
    }
    
    // Validate logging configuration
    if (this.config.logging) {
      const validLevels = ['error', 'warn', 'info', 'debug', 'trace'];
      if (!validLevels.includes(this.config.logging.level)) {
        errors.push(`Invalid logging level: ${this.config.logging.level}`);
      }
    }
    
    // Validate swarm configuration
    if (this.config.swarm) {
      if (this.config.swarm.maxAgents < 1 || this.config.swarm.maxAgents > 50) {
        errors.push('swarm.maxAgents must be between 1 and 50');
      }
      
      const validTopologies = ['hierarchical', 'mesh', 'ring', 'star'];
      if (!validTopologies.includes(this.config.swarm.defaultTopology)) {
        errors.push(`Invalid topology: ${this.config.swarm.defaultTopology}`);
      }
    }
    
    if (errors.length > 0) {
      throw new ConfigurationError(`Configuration validation failed:\n  - ${errors.join('\n  - ')}`);
    }
    
    return true;
  }
  
  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }
  
  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path, defaultValue = null) {
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
   */
  setNestedValue(obj, path, value) {
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
}

// Default configuration manager instance
const configManager = new ConfigurationManager();

export { ConfigurationManager };
export default configManager;