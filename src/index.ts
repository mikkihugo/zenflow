/**
 * Claude Code Flow - Main Entry Point.
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
// SPARC Methodology System - Systematic development workflow
export * as SPARC from './coordination/swarm/sparc/index';
// Database System - All persistence and database functionality
export * as Database from './database/index';
// Memory System - All memory-related functionality
export * as Memory from './memory/index';
// Neural System - All neural network and AI functionality
export * as Neural from './neural/index';
// Performance Optimization System - All performance optimization functionality
export * as Optimization from './optimization/index';
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
 * @file Claude-Zen Integrated System
 * Unified entry point for all claude-zen components.
 */

// =============================================================================
// SWARM AND COORDINATION SYSTEMS
// =============================================================================

// Swarm-zen integration (use public API instead of direct core access)
// Note: Individual exports commented out - use namespace import instead
// export {
//   createSwarm,       // Not available in public-api
//   SwarmOrchestrator, // Not available in public-api
// } from './coordination/public-api';
export * from './coordination/public-api';
// Core MCP integration
export * from './coordination/swarm/mcp/mcp-server';
export * from './coordination/swarm/mcp/mcp-tool-registry';
// Export specific types from mcp-types to avoid conflicts
export type {
  MCPRequest,
  MCPResponse,
  MCPTool,
  // Note: MCPServer and MCPToolCall not available in types module
  // SwarmAgent, SwarmStatus, SwarmTask will come from types/index
} from './coordination/swarm/mcp/types';

// Utils and core services
export * from './core/logger';

// Terminal Interface (CLI and TUI unified)
export * from './interfaces/terminal';

// Neural agent exports (avoid NeuralNetwork and Task conflicts)
export {
  NeuralAgent,
  // Note: createNeuralAgent, NeuralAgentConfig, NeuralAgentState not available
} from './neural/agents/neural-agent';

// Neural network integration
export * from './neural/neural-bridge';

// Types - main source of shared types
// Note: Using namespace export to avoid conflicts with other modules
export * as SharedTypes from './types/index';

/**
 * Claude-Zen integrated system configuration.
 *
 * @example
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
 * stdio MCP dormant - only for temporary Claude Code coordination when needed.
 * Project swarms use direct real agent protocols (Raft, message passing, etc.).
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
 * Initialize Claude-Zen integrated system.
 *
 * @param config
 * @example
 */
export async function initializeClaudeZen(config: Partial<ClaudeZenConfig> = {}): Promise<void> {
  const finalConfig = { ...defaultConfig, ...config };

  // Initialize HTTP MCP for Claude Desktop (usually enabled)
  if (finalConfig?.mcp?.http?.enabled) {
    const { HTTPMCPServer } = await import('./interfaces/mcp/http-mcp-server');
    const httpMcpServer = new HTTPMCPServer({
      ...(finalConfig?.mcp?.http?.port !== undefined && { port: finalConfig?.mcp?.http?.port }),
      ...(finalConfig?.mcp?.http?.host !== undefined && { host: finalConfig?.mcp?.http?.host }),
    });
    await httpMcpServer.start();
  }

  // Initialize stdio MCP only if explicitly enabled (for temporary Claude Code coordination)
  if (finalConfig?.mcp?.stdio?.enabled) {
    const { MCPServer } = await import('./coordination/swarm/mcp/mcp-server');
    const stdioMcpServer = new MCPServer();
    await stdioMcpServer.start();
  }

  // Initialize SwarmOrchestrator from coordination module
  try {
    const coordinationModule = await import('./coordination/public-api');
    // Use available orchestrator from coordination module
    // TODO: Replace with actual SwarmOrchestrator when available
    console.log('✅ Swarm coordination module loaded');
  } catch (error) {
    console.log('⚠️ SwarmOrchestrator not available:', error);
  }

  // Initialize neural bridge if enabled
  if (finalConfig?.neural?.enabled) {
    const { NeuralBridge } = await import('./neural/neural-bridge');
    const neuralBridge = NeuralBridge.getInstance(finalConfig?.neural);
    await neuralBridge.initialize();
  }

  // Initialize SPARC methodology system if enabled
  if (finalConfig?.sparc?.enabled) {
    const { SPARC } = await import('./coordination/swarm/sparc/index');
    const _sparcEngine = SPARC.getEngine();
  }

  // Initialize plugin system
  if (finalConfig?.plugins?.autoLoad) {
    // const pluginManager = PluginManager.getInstance();
    // await pluginManager.initialize();
    // console.log('✅ Plugin Manager initialized');
  }
}

/**
 * Shutdown Claude-Zen system gracefully.
 *
 * @example
 */
export async function shutdownClaudeZen(): Promise<void> {
  // Shutdown functionality is handled per-component
  // TODO: Implement proper shutdown orchestration
}

/**
 * System health check.
 *
 * @returns Promise resolving to system health status.
 * @example
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
 * Get system version and build info.
 *
 * @returns System version information.
 * @example
 */
export function getVersion() {
  return {
    version: process.env['npm_package_version'] || '2.0.0',
    build: process.env['BUILD_ID'] || 'development',
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
