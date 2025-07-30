/**
 * Claude Code Flow - Core Type Definitions
 * Comprehensive TypeScript architecture for the entire system
 */

// Re-export all types for easy consumption
export * from './core.js';
export * from './queen.js';
export * from './swarm.js';
export * from './hive-mind.js';
export * from './database.js';
export * from './plugin.js';
export * from './neural.js';
export * from './coordination.js';
export * from './api.js';
export * from './server.js';
export * from './memory.js';
export * from './providers.js';
export * from './workflow.js';
export * from './vision.js';
export * from './mcp.js';
export * from './events.js';
export * from './metrics.js';
export * from './security.js';
export * from './utils.js';
export * from './cli.js';

// Global type augmentation for the system
declare global {
  namespace ClaudeCodeFlow {
    interface SystemContext {
      version: string;
      environment: 'development' | 'production' | 'test';
      startTime: Date;
      processId: string;
      instanceId: string;
    }

    interface Configuration {
      core: import('./core.js').CoreConfig;
      database: import('./database.js').DatabaseConfig;
      plugins: import('./plugin.js').PluginConfig;
      neural: import('./neural.js').NeuralConfig;
      security: import('./security.js').SecurityConfig;
    }
  }
}

// Module augmentation for Node.js global
declare global {
  var claudeCodeFlow: {
    system: ClaudeCodeFlow.SystemContext;
    config: ClaudeCodeFlow.Configuration;
    hiveMind?: import('./hive-mind.js').HiveMind;
    plugins?: Map<string, import('./plugin.js').Plugin>;
    queens?: Map<string, import('./queen.js').Queen>;
    swarms?: Map<string, import('./swarm.js').Swarm>;
  };
}