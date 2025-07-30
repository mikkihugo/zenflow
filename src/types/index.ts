
/** Claude Code Flow - Core Type Definitions;
/** Comprehensive TypeScript architecture for the entire system;

export * from '.
export * from '.
export * from '.
// Re-export all types for easy consumption
export * from '.
export * from '.
export * from '.
export * from '.
export * from '.
export * from '.
export * from '.
export * from '.
export * from '.
export * from '.
export * from '.
export * from '.
// export * from './server.js';
// export * from './swarm.js';
// export * from './utils.js';
// export * from './vision.js';
// export * from './workflow.js';

// Global type augmentation for the system
declare global { // eslint-disable-line
  namespace ClaudeCodeFlow {
// // interface SystemContext {
//       // version: string
//       environment: 'development' | 'production' | 'test';
//       // startTime: Date
//       // processId: string
//       // instanceId: string
//     //     }
// // interface Configuration {
//       core: import('./core.js').CoreConfig;
//       database: import('./database.js').DatabaseConfig;
//       plugins: import('./plugin.js').PluginConfig;
//       neural: import('./neural.js').NeuralConfig;
//       security: import('./security.js').SecurityConfig;
//     //     }
  //   }
// }
// Module augmentation for Node.js global
declare global {
  const _claudeCodeFlow: {
    system: ClaudeCodeFlow.SystemContext;
    config: ClaudeCodeFlow.Configuration;
    hiveMind?: import('.
    plugins?: Map<string, import('.
    queens?: Map<string, import('.
    swarms?: Map<string, import('.
  };
// }
