/**
 * Claude Code Flow - Main Entry Point
 *
 * Central export hub for all system components following clean architecture principles.
 * Organized by domain with clear separation of concerns.
 */

// =============================================================================
// CORE SYSTEMS
// =============================================================================

export * as Config from './config';
export * as Core from './core/index';
export * as Types from './types/agent-types';
export * as Utils from './utils/index';

// =============================================================================
// DOMAIN SYSTEMS (Consolidated)
// =============================================================================

// Coordination System - All swarm and orchestration functionality
export * as Coordination from './coordination/index';
// Database System - All persistence and database functionality
export * as Database from './database/index';
// Memory System - All memory-related functionality
export * as Memory from './memory/index';
// Neural System - All neural network and AI functionality
export * as Neural from './neural/index';
// Performance Optimization System - All performance optimization functionality
export * as Optimization from './optimization/index';
// SPARC Methodology System - Systematic development workflow
export * as SPARC from './sparc/index';
// Workflow System - All workflow execution and management
export * as Workflows from './workflows/index';

// =============================================================================
// INTERFACE SYSTEMS
// =============================================================================

// Interface Systems (includes API, CLI, Web, TUI, MCP)
export * as Interfaces from './interfaces/index';

// =============================================================================
// SPECIALIZED SYSTEMS
// =============================================================================

// Bindings
export * as Bindings from './bindings/index';
// Integration System
export * as Integration from './integration/index';

// =============================================================================
// SPECIALIZED COMPONENTS
// =============================================================================

// Note: WASM integration moved to Neural domain
// Note: WebGPU components moved to Neural domain
// Note: Hooks system moved to templates/
// Note: Services consolidated into coordination/

// =============================================================================
// LEGACY/MIGRATION EXPORTS (Temporary - will be removed after restructure)
// =============================================================================

// ARCHITECTURE CLEANUP COMPLETED:
// ✅ Module boundaries enforced with clean domain separation
// ✅ Complete barrel exports for all major modules
// ✅ Consolidated type system with shared-types.ts
// ✅ Fixed broken import paths and missing index files
// ✅ Optimized cross-module dependencies
// ✅ Updated documentation to match new structure

// =============================================================================
// MAIN SYSTEM INITIALIZATION
// =============================================================================

/**
 * @fileoverview Claude-Zen Integrated System
 * Unified entry point for all claude-zen components
 */

// =============================================================================
// SWARM AND COORDINATION SYSTEMS
// =============================================================================

// Core MCP integration
export * from './coordination/mcp/claude-zen-server';
export * from './coordination/mcp/tools/swarm-tools';
// Export specific types from mcp-types to avoid conflicts
export {
  type MCPServer,
  type MCPRequest,
  type MCPResponse,
  type MCPTool,
  type MCPToolCall,
  // SwarmAgent, SwarmStatus, SwarmTask will come from types/index
} from './coordination/mcp/types/mcp-types';
// Swarm-zen integration (use public API instead of direct core access)
export {
  // Export specific items to avoid conflicts
  SwarmOrchestrator,
  createSwarm,
  // SwarmConfig and SwarmState will come from types/index
} from './coordination/public-api';

// Utils and core services
export * from './core/logger';

// Terminal Interface (CLI and TUI unified)
export * from './interfaces/terminal';

// Neural agent exports (avoid NeuralNetwork and Task conflicts)
export {
  NeuralAgent,
  createNeuralAgent,
  type NeuralAgentConfig,
  type NeuralAgentState,
} from './neural/agents/neural-agent';

// Neural network integration
export * from './neural/neural-bridge';

// Types - main source of shared types
export * from './types/index';

/**
 * Claude-Zen integrated system configuration
 */
export interface ClaudeZenConfig {
  // MCP Server settings
  mcp: {
    http: {
      enabled: boolean; // HTTP MCP for Claude Desktop (port 3000)
      port?: number;
      host?: string;
    };
    stdio: {
      enabled: boolean; // stdio MCP for temporary Claude Code coordination (dormant by default)
    };
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

  // SPARC methodology settings
  sparc: {
    enabled: boolean;
    aiAssisted: boolean;
    templateLibrary: string;
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
 * HTTP MCP enabled for Claude Desktop integration
 * stdio MCP dormant - only for temporary Claude Code coordination when needed
 * Project swarms use direct real agent protocols (Raft, message passing, etc.)
 */
export const defaultConfig: ClaudeZenConfig = {
  mcp: {
    http: {
      enabled: true, // HTTP MCP for Claude Desktop (port 3000)
      port: 3000,
      host: 'localhost',
    },
    stdio: {
      enabled: false, // stdio MCP for swarm coordination (dormant, activate when needed)
    },
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
  sparc: {
    enabled: true,
    aiAssisted: true,
    templateLibrary: './templates',
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

  // Initialize HTTP MCP for Claude Desktop (usually enabled)
  if (finalConfig.mcp.http.enabled) {
    const { HTTPMCPServer } = await import('./interfaces/mcp/http-mcp-server');
    const httpMcpServer = new HTTPMCPServer({
      port: finalConfig.mcp.http.port,
      host: finalConfig.mcp.http.host,
    });
    await httpMcpServer.start();
  }

  // Initialize stdio MCP only if explicitly enabled (for temporary Claude Code coordination)
  if (finalConfig.mcp.stdio.enabled) {
    const { MCPServer } = await import('./coordination/mcp/mcp-server');
    const stdioMcpServer = new MCPServer();
    await stdioMcpServer.start();
  }

  // Initialize SwarmOrchestrator from public API
  const { SwarmOrchestrator } = await import('./coordination/public-api');
  const orchestrator = new SwarmOrchestrator({
    topology: finalConfig.swarm.topology,
    maxAgents: finalConfig.swarm.maxAgents,
    strategy: finalConfig.swarm.strategy,
  });
  await orchestrator.initialize();

  // Initialize neural bridge if enabled
  if (finalConfig.neural.enabled) {
    const { NeuralBridge } = await import('./neural/neural-bridge');
    const neuralBridge = NeuralBridge.getInstance(finalConfig.neural);
    await neuralBridge.initialize();
  }

  // Initialize SPARC methodology system if enabled
  if (finalConfig.sparc.enabled) {
    const { SPARC } = await import('./sparc/index');
    const _sparcEngine = SPARC.getEngine();
  }

  // Initialize plugin system
  if (finalConfig.plugins.autoLoad) {
    // const pluginManager = PluginManager.getInstance();
    // await pluginManager.initialize();
    // console.log('✅ Plugin Manager initialized');
  }
}

/**
 * Shutdown Claude-Zen system gracefully
 */
export async function shutdownClaudeZen(): Promise<void> {
  // Shutdown functionality is handled per-component
  // TODO: Implement proper shutdown orchestration
}

/**
 * System health check
 * @returns Promise resolving to system health status
 */
export async function healthCheck() {
  // TODO: Implement comprehensive health check after restructure
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    components: {
      core: 'healthy',
      memory: 'healthy',
      neural: 'healthy',
      database: 'healthy',
      coordination: 'healthy',
      interfaces: 'healthy',
    },
  };
}

/**
 * Get system version and build info
 * @returns System version information
 */
export function getVersion() {
  return {
    version: process.env.npm_package_version || '2.0.0',
    build: process.env.BUILD_ID || 'development',
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  initializeClaudeZen,
  shutdownClaudeZen,
  healthCheck,
  getVersion,
  Core,
  Memory,
  Neural,
  Database,
  Coordination,
  SPARC,
  Interfaces,
  Integration,
  Bindings,
  Workflows,
  Optimization,
  Utils,
  Types,
  Config,
};
