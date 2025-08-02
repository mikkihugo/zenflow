/**
 * @fileoverview Claude-Zen Integrated System
 * Unified entry point for all claude-zen components
 */

export * from './hive-mind/core/Agent';
// Hive Mind and Swarm Orchestration
export * from './hive-mind/core/HiveMind';
export * from './hive-mind/integration/ConsensusEngine';
export * from './hive-mind/integration/SwarmOrchestrator';
// Terminal Interface (CLI and TUI unified)
export * from './interfaces/terminal';
// Maestro coordination
export * from './maestro/maestro-orchestrator';
export * from './maestro/maestro-swarm-coordinator';
// Core MCP integration
export * from './mcp/claude-zen-server';
export * from './mcp/tools/swarm-tools';
export * from './mcp/types/mcp-types';
// Neural network integration
export * from './neural/neural-bridge';

// Plugin system
export * from './plugins/plugin-manager';
export * from './services/agentic-flow-hooks';
export * from './swarm-zen/agent';
// Swarm-zen integration (from ruv-FANN-zen submodule)
export * from './swarm-zen/index';
export * from './swarm-zen/neural';
export * from './ui/swarm-tui';
// Utils and core services
export * from './utils/logger';
export * from './utils/types';

/**
 * Claude-Zen integrated system configuration
 */
export interface ClaudeZenConfig {
  // MCP Server settings
  mcp: {
    enabled: boolean;
    port?: number;
    host?: string;
  };

  // Swarm orchestration
  swarm: {
    maxAgents: number;
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    strategy: 'balanced' | 'specialized' | 'adaptive' | 'parallel';
  };

  // Neural network settings
  neural: {
    enabled: boolean;
    wasmPath?: string;
    gpuAcceleration?: boolean;
  };

  // Database and persistence
  persistence: {
    provider: 'sqlite' | 'postgresql' | 'memory';
    connectionString?: string;
  };

  // Plugin configuration
  plugins: {
    paths: string[];
    autoLoad: boolean;
  };
}

/**
 * Default configuration for Claude-Zen
 */
export const defaultConfig: ClaudeZenConfig = {
  mcp: {
    enabled: true,
    port: 3001,
    host: 'localhost',
  },
  swarm: {
    maxAgents: 8,
    topology: 'hierarchical',
    strategy: 'parallel',
  },
  neural: {
    enabled: true,
    wasmPath: './wasm',
    gpuAcceleration: false,
  },
  persistence: {
    provider: 'sqlite',
  },
  plugins: {
    paths: ['./plugins'],
    autoLoad: true,
  },
};

/**
 * Initialize Claude-Zen integrated system
 */
export async function initializeClaudeZen(config: Partial<ClaudeZenConfig> = {}): Promise<void> {
  const finalConfig = { ...defaultConfig, ...config };

  console.log('🚀 Initializing Claude-Zen Integrated System');
  console.log(`   MCP Server: ${finalConfig.mcp.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`   Swarm Topology: ${finalConfig.swarm.topology}`);
  console.log(`   Neural Networks: ${finalConfig.neural.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`   Persistence: ${finalConfig.persistence.provider}`);

  // Initialize components based on configuration
  if (finalConfig.mcp.enabled) {
    const { ClaudeZenMCPServer } = await import('./mcp/claude-zen-server');
    const mcpServer = new ClaudeZenMCPServer();
    await mcpServer.start();
    console.log('✅ MCP Server initialized');
  }

  // Initialize SwarmOrchestrator
  const { SwarmOrchestrator } = await import('./hive-mind/integration/SwarmOrchestrator');
  const orchestrator = SwarmOrchestrator.getInstance();
  await orchestrator.initialize();
  console.log('✅ Swarm Orchestrator initialized');

  // Initialize neural bridge if enabled
  if (finalConfig.neural.enabled) {
    const { NeuralBridge } = await import('./neural/neural-bridge');
    const neuralBridge = NeuralBridge.getInstance(finalConfig.neural);
    await neuralBridge.initialize();
    console.log('✅ Neural Bridge initialized');
  }

  // Initialize plugin system
  if (finalConfig.plugins.autoLoad) {
    const { PluginManager } = await import('./plugins/plugin-manager');
    const pluginManager = PluginManager.getInstance();
    await pluginManager.initialize();
    console.log('✅ Plugin Manager initialized');
  }

  console.log('🎯 Claude-Zen system ready for coordination!');
}

/**
 * Shutdown Claude-Zen system gracefully
 */
export async function shutdownClaudeZen(): Promise<void> {
  console.log('🛑 Shutting down Claude-Zen system...');

  // Shutdown orchestrator
  const { SwarmOrchestrator } = await import('./hive-mind/integration/SwarmOrchestrator');
  const orchestrator = SwarmOrchestrator.getInstance();
  await orchestrator.shutdown();

  console.log('✅ Claude-Zen system shutdown complete');
}
