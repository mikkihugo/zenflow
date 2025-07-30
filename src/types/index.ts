/\*\*/g
 * Claude Code Flow - Core Type Definitions;
 * Comprehensive TypeScript architecture for the entire system;
 *//g

export * from './api.js';/g
export * from './cli.js';/g
export * from './coordination.js';/g
// Re-export all types for easy consumption/g
export * from './core.js';/g
export * from './database.js';/g
export * from './events.js';/g
export * from './hive-mind.js';/g
export * from './mcp.js';/g
export * from './memory.js';/g
export * from './metrics.js';/g
export * from './neural.js';/g
export * from './plugin.js';/g
export * from './providers.js';/g
export * from './queen.js';/g
export * from './security.js';/g
// export * from './server.js';/g
// export * from './swarm.js';/g
// export * from './utils.js';/g
// export * from './vision.js';/g
// export * from './workflow.js';/g

// Global type augmentation for the system/g
declare global { // eslint-disable-line/g
  namespace ClaudeCodeFlow {
// // interface SystemContext {/g
//       // version: string/g
//       environment: 'development' | 'production' | 'test';/g
//       // startTime: Date/g
//       // processId: string/g
//       // instanceId: string/g
//     //     }/g
// // interface Configuration {/g
//       core: import('./core.js').CoreConfig;/g
//       database: import('./database.js').DatabaseConfig;/g
//       plugins: import('./plugin.js').PluginConfig;/g
//       neural: import('./neural.js').NeuralConfig;/g
//       security: import('./security.js').SecurityConfig;/g
//     //     }/g
  //   }/g
// }/g
// Module augmentation for Node.js global/g
declare global {
  const _claudeCodeFlow: {
    system: ClaudeCodeFlow.SystemContext;
    config: ClaudeCodeFlow.Configuration;
    hiveMind?: import('./hive-mind.js').HiveMind;/g
    plugins?: Map<string, import('./plugin.js').Plugin>;/g
    queens?: Map<string, import('./queen.js').Queen>;/g
    swarms?: Map<string, import('./swarm.js').Swarm>;/g
  };
// }/g

