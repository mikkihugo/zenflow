/**
 * Logging Configuration for ruv-swarm
 * Provides centralized logging configuration and utilities
 */

import { Logger } from './logger';

// Default log levels for different components
const DEFAULT_LOG_LEVELS = {
  'mcp-server': 'INFO',
  'mcp-tools': 'INFO',
  'swarm-core': 'INFO',
  agent: 'DEBUG',
  neural: 'INFO',
  'wasm-loader': 'WARN',
  persistence: 'INFO',
  hooks: 'DEBUG',
  performance: 'INFO',
  memory: 'WARN',
};

// Log level mapping from environment variables
const ENV_LOG_MAPPING = {
  LOG_LEVEL: null, // Global log level
  MCP_LOG_LEVEL: 'mcp-server',
  TOOLS_LOG_LEVEL: 'mcp-tools',
  SWARM_LOG_LEVEL: 'swarm-core',
  AGENT_LOG_LEVEL: 'agent',
  NEURAL_LOG_LEVEL: 'neural',
  WASM_LOG_LEVEL: 'wasm-loader',
  DB_LOG_LEVEL: 'persistence',
  HOOKS_LOG_LEVEL: 'hooks',
  PERF_LOG_LEVEL: 'performance',
  MEMORY_LOG_LEVEL: 'memory',
};

/**
 * Logging configuration manager
 *
 * @example
 */
export class LoggingConfig {
  private loggers: Map<string, Logger>;
  private globalLevel: string | null;
  private componentLevels: Record<string, string>;

  constructor() {
    this.loggers = new Map();
    this.globalLevel = null;
    this.componentLevels = { ...DEFAULT_LOG_LEVELS };
    this.loadFromEnvironment();
  }

  /**
   * Load log levels from environment variables
   */
  private loadFromEnvironment(): void {
    for (const [envVar, component] of Object.entries(ENV_LOG_MAPPING)) {
      const value = process.env[envVar];
      if (value) {
        if (component === null) {
          // Global log level
          this.globalLevel = value.toUpperCase();
        } else {
          // Component-specific log level
          this.componentLevels[component] = value.toUpperCase();
        }
      }
    }
  }

  /**
   * Get or create a logger for a component
   *
   * @param component
   * @param options
   * @param options.enableStderr
   * @param options.enableFile
   * @param options.formatJson
   * @param options.logDir
   */
  getLogger(
    component: string,
    options: {
      enableStderr?: boolean;
      enableFile?: boolean;
      formatJson?: boolean;
      logDir?: string;
      [key: string]: any;
    } = {}
  ): Logger {
    if (this.loggers.has(component)) {
      return this.loggers.get(component)!;
    }

    const level = this.globalLevel || this.componentLevels[component] || 'INFO';

    const logger = new Logger({
      name: component,
      level,
      enableStderr: process.env.MCP_MODE === 'stdio' || options.enableStderr,
      enableFile: process.env.LOG_TO_FILE === 'true' || options.enableFile,
      formatJson: process.env.LOG_FORMAT === 'json' || options.formatJson,
      logDir: process.env.LOG_DIR || options.logDir || './logs',
      ...options,
    });

    this.loggers.set(component, logger);
    return logger;
  }

  /**
   * Set log level for a component
   *
   * @param component
   * @param level
   */
  setLogLevel(component: string, level: string): void {
    this.componentLevels[component] = level.toUpperCase();

    // Update existing logger if present
    if (this.loggers.has(component)) {
      const logger = this.loggers.get(component)!;
      // Access LOG_LEVELS safely - assuming it exists on the logger instance or constructor
      if ('level' in logger && typeof logger.level === 'string') {
        (logger as any).level = level.toUpperCase();
      }
    }
  }

  /**
   * Set global log level
   *
   * @param level
   */
  setGlobalLogLevel(level) {
    this.globalLevel = level.toUpperCase();

    // Update all existing loggers
    for (const logger of this.loggers.values()) {
      logger.level = level.toUpperCase();
    }
  }

  /**
   * Get current log levels
   */
  getLogLevels() {
    return {
      global: this.globalLevel,
      components: { ...this.componentLevels },
    };
  }

  /**
   * Create child logger with correlation ID
   *
   * @param parentLogger
   * @param module
   * @param correlationId
   */
  createChildLogger(parentLogger, module, correlationId = null) {
    return parentLogger.child({
      module,
      correlationId: correlationId || parentLogger.correlationId,
    });
  }

  /**
   * Log system configuration
   */
  logConfiguration() {
    const config = {
      globalLevel: this.globalLevel || 'Not set (using component defaults)',
      componentLevels: this.componentLevels,
      enabledFeatures: {
        fileLogging: process.env.LOG_TO_FILE === 'true',
        jsonFormat: process.env.LOG_FORMAT === 'json',
        stderrOutput: process.env.MCP_MODE === 'stdio',
        logDirectory: process.env.LOG_DIR || './logs',
      },
      environment: {
        MCP_MODE: process.env.MCP_MODE,
        NODE_ENV: process.env.NODE_ENV,
      },
    };

    console.error('📊 Logging Configuration:', JSON.stringify(config, null, 2));
    return config;
  }
}

// Singleton instance
export const loggingConfig = new LoggingConfig();

// Convenience functions
export const getLogger = (component, options) => loggingConfig.getLogger(component, options);
export const setLogLevel = (component, level) => loggingConfig.setLogLevel(component, level);
export const setGlobalLogLevel = (level) => loggingConfig.setGlobalLogLevel(level);

// Pre-configured loggers for common components
export const mcpLogger = loggingConfig.getLogger('mcp-server');
export const toolsLogger = loggingConfig.getLogger('mcp-tools');
export const swarmLogger = loggingConfig.getLogger('swarm-core');
export const agentLogger = loggingConfig.getLogger('agent');
export const neuralLogger = loggingConfig.getLogger('neural');
export const wasmLogger = loggingConfig.getLogger('wasm-loader');
export const dbLogger = loggingConfig.getLogger('persistence');
export const hooksLogger = loggingConfig.getLogger('hooks');
export const perfLogger = loggingConfig.getLogger('performance');
export const memoryLogger = loggingConfig.getLogger('memory');

export default loggingConfig;
