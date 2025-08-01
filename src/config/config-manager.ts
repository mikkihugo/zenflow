/**
 * Config Manager - Configuration management system
 * Handles loading, validation, and management of system configuration
 */

export interface SystemConfig {
  logger: {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
  };
  terminal: {
    shell?: string;
    timeout: number;
    maxConcurrentProcesses: number;
  };
  memory: {
    directory: string;
    namespace: string;
    enableCompression: boolean;
    maxMemorySize: number;
  };
  coordination: {
    maxAgents: number;
    heartbeatInterval: number;
    timeout: number;
  };
  mcp: {
    port: number;
    host: string;
    timeout: number;
  };
}

/**
 * Configuration Manager singleton
 */
export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private _config: SystemConfig;

  private constructor() {
    this._config = this.loadDefaultConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get config(): SystemConfig {
    return this._config;
  }

  /**
   * Load default configuration
   */
  private loadDefaultConfig(): SystemConfig {
    return {
      logger: {
        level: 'info',
        console: true
      },
      terminal: {
        timeout: 30000,
        maxConcurrentProcesses: 10
      },
      memory: {
        directory: './data/memory',
        namespace: 'claude-flow',
        enableCompression: false,
        maxMemorySize: 100 * 1024 * 1024 // 100MB
      },
      coordination: {
        maxAgents: 50,
        heartbeatInterval: 10000,
        timeout: 30000
      },
      mcp: {
        port: 3000,
        host: 'localhost',
        timeout: 30000
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SystemConfig>): void {
    this._config = {
      ...this._config,
      ...updates
    };
  }

  /**
   * Validate configuration
   */
  validateConfig(): boolean {
    // Basic validation
    return !!(this._config.logger && this._config.terminal && this._config.memory);
  }
}

export default ConfigManager;