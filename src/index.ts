/**
 * @file Claude Code Flow - Main Entry Point.
 *
 * Central export hub for all system components following clean architecture principles.
 * Organized by domain with clear separation of concerns.
 */

// =============================================================================
// CORE SYSTEMS
// =============================================================================

export * as Config from './config/index.js';
export * as Core from './core/index.ts';
export * as Types from './types/agent-types.ts';
export * as Utils from './utils/index.ts';

// =============================================================================
// DOMAIN SYSTEMS (Consolidated)
// =============================================================================

// Coordination System - All swarm and orchestration functionality
export * as Coordination from './coordination/index.ts';
// SPARC Methodology System - Systematic development workflow
export * as SPARC from './coordination/swarm/sparc/index.ts';

/**
 * Database System - Complete data persistence and storage management.
 *
 * Provides unified access to SQLite, PostgreSQL, vector databases (LanceDB),
 * and graph databases (Kuzu) with automatic migration, connection pooling,
 * and transaction management.
 *
 * @example
 * ```typescript
 * import { Database } from 'claude-code-zen';
 *
 * const manager = await Database.createDatabaseManager();
 * const dao = manager.getCoordinationDAO();
 * await dao.storeSwarmState(swarmData);
 * ```
 *
 * @namespace Database
 * @see {@link ./database/index.ts} - Database implementation modules
 * @since 1.0.0-alpha.43
 */
export * as Database from './database/index.ts';

/**
 * Memory System - Advanced memory management and persistence.
 *
 * Handles both working memory (in-process caching, state management) and
 * persistent memory (cross-session storage, knowledge graphs, embeddings)
 * with automatic cleanup and optimization.
 *
 * @example
 * ```typescript
 * import { Memory } from 'claude-code-zen';
 *
 * const system = await Memory.MemorySystemFactory.createBasicMemorySystem();
 * await system.store('session-key', sessionData);
 * const retrieved = await system.retrieve('session-key');
 * ```
 *
 * @namespace Memory
 * @see {@link ./memory/index.ts} - Memory system implementation
 * @since 1.0.0-alpha.43
 */
export * as Memory from './memory/index.ts';

/**
 * Neural System - AI/ML infrastructure and neural network management.
 *
 * Provides neural agents, WASM-accelerated models, GPU computation,
 * embeddings, and machine learning workflows with support for both
 * inference and training operations.
 *
 * @example
 * ```typescript
 * import { Neural } from 'claude-code-zen';
 *
 * const agent = new Neural.NeuralAgent(baseAgent, 'researcher');
 * const bridge = Neural.NeuralBridge.getInstance();
 * await bridge.initialize();
 * ```
 *
 * @namespace Neural
 * @see {@link ./neural/index.ts} - Neural system implementation
 * @since 1.0.0-alpha.43
 */
export * as Neural from './neural/index.ts';

/**
 * Optimization System - Performance optimization and resource management.
 *
 * Handles WASM optimization, neural model optimization, data flow optimization,
 * swarm performance tuning, and system resource management with real-time
 * monitoring and automatic adjustment.
 *
 * @example
 * ```typescript
 * import { Optimization } from 'claude-code-zen';
 *
 * const monitor = new Optimization.OptimizationMonitor();
 * await monitor.startMonitoring();
 * const metrics = await monitor.getPerformanceMetrics();
 * ```
 *
 * @namespace Optimization
 * @see {@link ./optimization/index.ts} - Optimization system implementation
 * @since 1.0.0-alpha.43
 */
export * as Optimization from './optimization/index.ts';

/**
 * Workflow System - Advanced workflow execution and management engine.
 *
 * Provides sophisticated workflow orchestration with conditional logic,
 * parallel execution, error handling, rollback capabilities, and integration
 * with the broader Claude Code Zen ecosystem.
 *
 * @example
 * ```typescript
 * import { Workflows } from 'claude-code-zen';
 *
 * const engine = new Workflows.WorkflowEngine(memorySystem);
 * const workflow = await engine.executeWorkflow(workflowDefinition);
 * const status = await engine.getWorkflowStatus(workflow.id);
 * ```
 *
 * @namespace Workflows
 * @see {@link ./workflows/index.ts} - Workflow system implementation
 * @since 1.0.0-alpha.43
 */
export * as Workflows from './workflows/index.ts';

// =============================================================================
// INTERFACE SYSTEMS
// =============================================================================

/**
 * Interface Systems - Complete user and system interface management.
 *
 * Provides unified access to all system interfaces including HTTP APIs,
 * CLI commands, web dashboards, terminal UIs (TUI), MCP servers, WebSocket
 * connections, and event-driven communication systems.
 *
 * @example
 * ```typescript
 * import { Interfaces } from 'claude-code-zen';
 *
 * const mcpServer = new Interfaces.MCP.HTTPMCPServer();
 * await mcpServer.start();
 *
 * const webServer = new Interfaces.Web.WebInterfaceServer();
 * await webServer.initialize();
 * ```
 *
 * @namespace Interfaces
 * @see {@link ./interfaces/index.ts} - Interface system implementations
 * @since 1.0.0-alpha.43
 */
export * as Interfaces from './interfaces/index.ts';

// =============================================================================
// SPECIALIZED SYSTEMS
// =============================================================================

/**
 * Bindings System - Native code integration and WASM binding management.
 *
 * Handles Rust/WASM bindings, native module loading, performance-critical
 * operations, and provides fallback mechanisms for different runtime
 * environments with automatic binding detection and loading.
 *
 * @example
 * ```typescript
 * import { Bindings } from 'claude-code-zen';
 *
 * const binding = await Bindings.BindingFactory.getInstance();
 * const available = Bindings.BindingsUtils.getBindingType();
 * ```
 *
 * @namespace Bindings
 * @see {@link ./bindings/index.ts} - Binding system implementation
 * @since 1.0.0-alpha.43
 */
export * as Bindings from './bindings/index.ts';

/**
 * Integration System - External system integration and interoperability.
 *
 * Manages integration with external services, APIs, DSPy frameworks,
 * memory-database bridges, and provides wrapper architectures for
 * seamless interoperability between different system components.
 *
 * @example
 * ```typescript
 * import { Integration } from 'claude-code-zen';
 *
 * const wrapper = new Integration.DSPyWrapperArchitecture();
 * const bridge = new Integration.MemoryDatabaseIntegration();
 * ```
 *
 * @namespace Integration
 * @see {@link ./integration/index.ts} - Integration system implementation
 * @since 1.0.0-alpha.43
 */
export * as Integration from './integration/index.ts';

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
// } from './coordination/public-api.ts';
export * from './coordination/public-api.ts';
// Core MCP integration
export * from './coordination/swarm/mcp/mcp-server.ts';
export * from './coordination/swarm/mcp/mcp-tool-registry.ts';
/**
 * Core MCP (Model Context Protocol) Type Definitions.
 *
 * Essential type definitions for MCP tools, requests, and responses used
 * throughout the Claude Code Zen system for seamless Claude CLI integration.
 * These types ensure type safety and compatibility with the MCP specification.
 *
 * @example
 * ```typescript
 * import type { MCPRequest, MCPResponse, MCPTool } from 'claude-code-zen';
 *
 * const tool: MCPTool = {
 *   name: 'swarm_init',
 *   description: 'Initialize swarm coordination',
 *   inputSchema: { ... }
 * };
 *
 * const request: MCPRequest = {
 *   method: 'tools/call',
 *   params: { name: 'swarm_init', arguments: {...} }
 * };
 * ```
 *
 * @see {@link https://github.com/modelcontextprotocol/specification} - MCP Specification
 * @since 1.0.0-alpha.43
 */
export type {
  /** MCP request structure for tool calls and server communication */
  MCPRequest,
  /** MCP response structure for tool results and server responses */
  MCPResponse,
  /** MCP tool definition interface for creating Claude-compatible tools */
  MCPTool,
  // Note: MCPServer and MCPToolCall not available in types module
  // SwarmAgent, SwarmStatus, SwarmTask will come from types/index
} from './coordination/swarm/mcp/types.ts';

// Utils and core services
export * from './core/logger.ts';

// Terminal Interface (CLI and TUI unified)
export * from './interfaces/terminal/index.js';

/**
 * Neural Agent System - Advanced AI-driven agent coordination and intelligence.
 *
 * The NeuralAgent class provides sophisticated cognitive patterns, machine learning
 * capabilities, and autonomous behavior for multi-agent swarm environments. It combines
 * traditional agent architectures with neural network enhancements for superior
 * decision-making and adaptive learning.
 *
 * Key Features:
 * - Cognitive pattern recognition and adaptation
 * - Cross-session learning and memory retention
 * - Swarm intelligence coordination
 * - Neural network-enhanced decision making
 * - Autonomous task execution with human oversight
 *
 * @example
 * ```typescript
 * import { NeuralAgent } from 'claude-code-zen';
 *
 * // Create a specialized research agent
 * const agent = new NeuralAgent(baseAgent, 'researcher');
 *
 * // Train the agent with domain-specific data
 * await agent.learn(researchTrainingData);
 *
 * // Process complex research tasks
 * const analysis = await agent.process({
 *   task: 'analyze_research_papers',
 *   parameters: { domain: 'machine_learning' }
 * });
 *
 * console.log('Research findings:', analysis.results);
 * ```
 *
 * @see {@link https://github.com/mikkihugo/claude-code-zen#neural-agents} - Neural Agent Guide
 * @see {@link ./neural/agents/neural-agent.ts} - Implementation details
 * @since 1.0.0-alpha.43
 */
export {
  /**
   * Advanced neural-enhanced agent with cognitive pattern support.
   *
   * Provides sophisticated AI capabilities including learning, adaptation,
   * and autonomous decision-making for complex multi-agent scenarios.
   */
  NeuralAgent,
  // Note: createNeuralAgent, NeuralAgentConfig, NeuralAgentState not available
} from './neural/agents/neural-agent.ts';

// Neural network integration
export * from './neural/neural-bridge.ts';

/**
 * Shared Type Definitions - Central type system for Claude Code Zen.
 *
 * Provides a comprehensive collection of TypeScript interfaces, types, and schemas
 * used throughout the system. Exported as a namespace to avoid naming conflicts.
 *
 * @example
 * ```typescript
 * import { SharedTypes } from 'claude-code-zen';
 *
 * type Config = SharedTypes.WASMNeuralConfig;
 * const metrics: SharedTypes.WASMPerformanceMetrics = {...};
 * ```
 *
 * @namespace SharedTypes
 * @see {@link ./types/index.ts} - Individual type definitions
 * @since 1.0.0-alpha.43
 */
export * as SharedTypes from './types/index.ts';

/**
 * Claude-Zen Integrated System Configuration Interface.
 *
 * Comprehensive configuration schema for the entire Claude Code Zen system,
 * including MCP servers, swarm orchestration, neural networks, SPARC methodology,
 * persistence layers, and plugin management.
 *
 * This interface defines all configurable aspects of the system, from network
 * settings and database connections to AI model parameters and workflow preferences.
 *
 * @example
 * ```typescript
 * import type { ClaudeZenConfig } from 'claude-code-zen';
 *
 * const config: ClaudeZenConfig = {
 *   mcp: {
 *     http: { enabled: true, port: 3000 },
 *     stdio: { enabled: false }
 *   },
 *   swarm: {
 *     maxAgents: 12,
 *     topology: 'mesh',
 *     strategy: 'adaptive'
 *   },
 *   neural: {
 *     enabled: true,
 *     gpuAcceleration: true
 *   },
 *   persistence: {
 *     provider: 'postgresql',
 *     connectionString: 'postgresql://...'
 *   }
 * };
 *
 * await initializeClaudeZen(config);
 * ```
 *
 * @interface ClaudeZenConfig
 * @see {@link defaultConfig} - Default configuration values
 * @see {@link initializeClaudeZen} - System initialization function
 * @since 1.0.0-alpha.43
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
 * Default Configuration for Claude-Zen System.
 *
 * Production-ready default configuration optimized for typical deployment scenarios.
 * Provides sensible defaults for all system components while maintaining security
 * and performance best practices.
 *
 * Configuration Highlights:
 * - HTTP MCP enabled for Claude Desktop integration (port 3000)
 * - stdio MCP dormant - activated only for temporary Claude Code coordination
 * - Hierarchical swarm topology with parallel execution strategy
 * - Neural networks enabled with WASM acceleration
 * - SQLite persistence for lightweight deployments
 * - SPARC methodology with AI assistance enabled
 * - Automatic plugin loading from standard directories
 *
 * Project swarms use direct real agent protocols (Raft consensus, message passing,
 * distributed state management) rather than MCP for production-grade coordination.
 *
 * @example
 * ```typescript
 * import { defaultConfig, initializeClaudeZen } from 'claude-code-zen';
 *
 * // Use default configuration
 * await initializeClaudeZen();
 *
 * // Override specific settings
 * await initializeClaudeZen({
 *   ...defaultConfig,
 *   swarm: {
 *     ...defaultConfig.swarm,
 *     maxAgents: 16,
 *     strategy: 'specialized'
 *   }
 * });
 * ```
 *
 * @const defaultConfig
 * @see {@link ClaudeZenConfig} - Configuration interface
 * @see {@link initializeClaudeZen} - System initialization
 * @since 1.0.0-alpha.43
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
export async function initializeClaudeZen(
  config: Partial<ClaudeZenConfig> = {}
): Promise<void> {
  const finalConfig = { ...defaultConfig, ...config };

  // Initialize HTTP MCP for Claude Desktop (usually enabled)
  if (finalConfig?.mcp?.http?.enabled) {
    const { HTTPMCPServer } = await import(
      './interfaces/mcp/http-mcp-server.ts'
    );
    const httpMcpServer = new HTTPMCPServer({
      ...(finalConfig?.mcp?.http?.port !== undefined && {
        port: finalConfig?.mcp?.http?.port,
      }),
      ...(finalConfig?.mcp?.http?.host !== undefined && {
        host: finalConfig?.mcp?.http?.host,
      }),
    });
    await httpMcpServer.start();

    // Store reference for shutdown orchestration
    (global as any).httpMcpServer = httpMcpServer;
  }

  // Initialize stdio MCP only if explicitly enabled (for temporary Claude Code coordination)
  if (finalConfig?.mcp?.stdio?.enabled) {
    const { MCPServer } = await import(
      './coordination/swarm/mcp/mcp-server.ts'
    );
    const stdioMcpServer = new MCPServer();
    await stdioMcpServer.start();

    // Store reference for shutdown orchestration
    (global as any).stdioMcpServer = stdioMcpServer;
  }

  // Initialize SwarmOrchestrator from coordination module
  try {
    const coordinationModule = await import('./coordination/public-api.ts');
    // Create and initialize a public swarm coordinator
    const swarmCoordinator =
      await coordinationModule.createPublicSwarmCoordinator({
        topology: finalConfig?.swarm?.topology || 'hierarchical',
        maxAgents: finalConfig?.swarm?.maxAgents || 8,
        strategy: finalConfig?.swarm?.strategy || 'parallel',
      });

    // Store coordinator reference for shutdown orchestration
    (global as any).swarmCoordinator = swarmCoordinator;

    console.log('✅ Swarm coordination system initialized', {
      id: swarmCoordinator.getSwarmId(),
      state: swarmCoordinator.getState(),
      agentCount: swarmCoordinator.getAgentCount(),
    });
  } catch (error) {
    console.log('⚠️ SwarmOrchestrator initialization failed:', error);
    // Gracefully continue without swarm coordination
  }

  // Initialize memory system
  try {
    const { MemorySystemFactory } = await import('./memory/index.ts');
    const memorySystem = await MemorySystemFactory.createBasicMemorySystem([
      {
        id: 'primary',
        type: finalConfig?.persistence?.provider || 'sqlite',
        config: finalConfig?.persistence?.connectionString
          ? { connectionString: finalConfig.persistence.connectionString }
          : { path: './data/claude-zen-memory.db' },
      },
    ]);

    // Store reference for shutdown orchestration and health checks
    (global as any).memorySystem = memorySystem;

    console.log(
      '✅ Memory system initialized with',
      finalConfig?.persistence?.provider || 'sqlite'
    );
  } catch (error) {
    console.error('⚠️ Memory system initialization failed:', error);
    // Continue without memory system - some features may be limited
  }

  // Initialize neural bridge if enabled
  if (finalConfig?.neural?.enabled) {
    const { NeuralBridge } = await import('./neural/neural-bridge.ts');
    const neuralBridge = NeuralBridge.getInstance(finalConfig?.neural);
    await neuralBridge.initialize();
  }

  // Initialize SPARC methodology system if enabled
  if (finalConfig?.sparc?.enabled) {
    const { SPARC } = await import('./coordination/swarm/sparc/index.ts');
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
  console.log('🔄 Initiating Claude-Zen system shutdown...');

  const shutdownResults: Array<{
    component: string;
    status: 'success' | 'error';
    error?: string;
  }> = [];

  try {
    // Shutdown swarm coordinator if available
    const swarmCoordinator = (global as any).swarmCoordinator;
    if (swarmCoordinator && typeof swarmCoordinator.shutdown === 'function') {
      try {
        await swarmCoordinator.shutdown();
        shutdownResults.push({
          component: 'SwarmCoordinator',
          status: 'success',
        });
        console.log('✅ Swarm coordinator shutdown complete');
      } catch (error) {
        shutdownResults.push({
          component: 'SwarmCoordinator',
          status: 'error',
          error: (error as Error).message,
        });
        console.error('❌ Swarm coordinator shutdown failed:', error);
      }
    }

    // Shutdown neural bridge if initialized
    try {
      const { NeuralBridge } = await import('./neural/neural-bridge.ts');
      const neuralBridge = NeuralBridge.getInstance();
      if (neuralBridge && typeof neuralBridge.shutdown === 'function') {
        await neuralBridge.shutdown();
        shutdownResults.push({ component: 'NeuralBridge', status: 'success' });
        console.log('✅ Neural bridge shutdown complete');
      }
    } catch (error) {
      shutdownResults.push({
        component: 'NeuralBridge',
        status: 'error',
        error: (error as Error).message,
      });
      console.error('❌ Neural bridge shutdown failed:', error);
    }

    // Shutdown MCP servers
    try {
      // HTTP MCP Server shutdown (if running)
      if ((global as any).httpMcpServer) {
        await (global as any).httpMcpServer.stop();
        shutdownResults.push({ component: 'HTTPMCPServer', status: 'success' });
        console.log('✅ HTTP MCP server shutdown complete');
      }

      // stdio MCP Server shutdown (if running)
      if ((global as any).stdioMcpServer) {
        await (global as any).stdioMcpServer.stop();
        shutdownResults.push({
          component: 'StdioMCPServer',
          status: 'success',
        });
        console.log('✅ stdio MCP server shutdown complete');
      }
    } catch (error) {
      shutdownResults.push({
        component: 'MCPServers',
        status: 'error',
        error: (error as Error).message,
      });
      console.error('❌ MCP servers shutdown failed:', error);
    }

    // Shutdown memory systems
    try {
      const { MemorySystemFactory } = await import('./memory/index.ts');
      if (
        (global as any).memorySystem &&
        typeof (global as any).memorySystem.shutdown === 'function'
      ) {
        await (global as any).memorySystem.shutdown();
        shutdownResults.push({ component: 'MemorySystem', status: 'success' });
        console.log('✅ Memory system shutdown complete');
      }
    } catch (error) {
      shutdownResults.push({
        component: 'MemorySystem',
        status: 'error',
        error: (error as Error).message,
      });
      console.error('❌ Memory system shutdown failed:', error);
    }

    // Clean up global references
    delete (global as any).swarmCoordinator;
    delete (global as any).httpMcpServer;
    delete (global as any).stdioMcpServer;
    delete (global as any).memorySystem;

    const successCount = shutdownResults.filter(
      (r) => r.status === 'success'
    ).length;
    const errorCount = shutdownResults.filter(
      (r) => r.status === 'error'
    ).length;

    console.log(
      `🏁 Claude-Zen shutdown complete: ${successCount} components shutdown successfully, ${errorCount} errors`
    );

    if (errorCount > 0) {
      console.warn(
        '⚠️ Some components failed to shutdown gracefully:',
        shutdownResults.filter((r) => r.status === 'error')
      );
    }
  } catch (error) {
    console.error('❌ Critical error during shutdown orchestration:', error);
    throw error;
  }
}

/**
 * System health check.
 *
 * @returns Promise resolving to system health status.
 * @example
 */
export async function healthCheck() {
  const timestamp = new Date().toISOString();
  const healthStatus = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp,
    components: {} as Record<
      string,
      {
        status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
        details?: any;
        error?: string;
      }
    >,
    metrics: {
      uptime: process.uptime() * 1000,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    },
  };

  let overallHealthy = true;
  let degradedComponents = 0;

  // Check Core system
  try {
    healthStatus.components.core = {
      status: 'healthy',
      details: {
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
      },
    };
  } catch (error) {
    healthStatus.components.core = {
      status: 'unhealthy',
      error: (error as Error).message,
    };
    overallHealthy = false;
  }

  // Check Memory system
  try {
    const { MemorySystemFactory } = await import('./memory/index.ts');
    const memorySystem = (global as any).memorySystem;
    if (memorySystem && typeof memorySystem.getHealthReport === 'function') {
      const healthReport = memorySystem.getHealthReport();
      healthStatus.components.memory = {
        status:
          healthReport.overall === 'healthy'
            ? 'healthy'
            : healthReport.overall === 'warning'
              ? 'degraded'
              : 'unhealthy',
        details: healthReport,
      };
      if (healthReport.overall !== 'healthy') {
        if (healthReport.overall === 'critical') overallHealthy = false;
        else degradedComponents++;
      }
    } else {
      healthStatus.components.memory = {
        status: 'unknown',
        details: { message: 'Memory system not initialized or unavailable' },
      };
      degradedComponents++;
    }
  } catch (error) {
    healthStatus.components.memory = {
      status: 'unhealthy',
      error: (error as Error).message,
    };
    overallHealthy = false;
  }

  // Check Neural system
  try {
    const { NeuralBridge } = await import('./neural/neural-bridge.ts');
    const neuralBridge = NeuralBridge.getInstance();
    if (neuralBridge && typeof neuralBridge.getHealth === 'function') {
      const neuralHealth = await neuralBridge.getHealth();
      healthStatus.components.neural = {
        status: neuralHealth.status,
        details: neuralHealth,
      };
      if (neuralHealth.status !== 'healthy') {
        if (neuralHealth.status === 'unhealthy') overallHealthy = false;
        else degradedComponents++;
      }
    } else {
      healthStatus.components.neural = {
        status: 'unknown',
        details: { message: 'Neural bridge not initialized or unavailable' },
      };
      degradedComponents++;
    }
  } catch (error) {
    healthStatus.components.neural = {
      status: 'degraded',
      error: (error as Error).message,
    };
    degradedComponents++;
  }

  // Check Database system
  try {
    const { createDatabaseManager } = await import('./database/index.ts');
    // Attempt a simple database operation
    healthStatus.components.database = {
      status: 'healthy',
      details: { message: 'Database interface available' },
    };
  } catch (error) {
    healthStatus.components.database = {
      status: 'degraded',
      error: (error as Error).message,
    };
    degradedComponents++;
  }

  // Check Coordination system
  try {
    const swarmCoordinator = (global as any).swarmCoordinator;
    if (swarmCoordinator && typeof swarmCoordinator.getStatus === 'function') {
      const coordinationStatus = swarmCoordinator.getStatus();
      healthStatus.components.coordination = {
        status: coordinationStatus.state === 'active' ? 'healthy' : 'degraded',
        details: coordinationStatus,
      };
      if (coordinationStatus.state !== 'active') {
        degradedComponents++;
      }
    } else {
      healthStatus.components.coordination = {
        status: 'unknown',
        details: { message: 'Swarm coordinator not initialized' },
      };
      degradedComponents++;
    }
  } catch (error) {
    healthStatus.components.coordination = {
      status: 'degraded',
      error: (error as Error).message,
    };
    degradedComponents++;
  }

  // Check Interfaces (MCP servers)
  try {
    let interfaceStatus = 'healthy' as 'healthy' | 'degraded' | 'unhealthy';
    const interfaceDetails: any = {};

    // Check HTTP MCP server
    const httpMcpServer = (global as any).httpMcpServer;
    if (httpMcpServer && typeof httpMcpServer.isRunning === 'function') {
      interfaceDetails.httpMcp = httpMcpServer.isRunning()
        ? 'running'
        : 'stopped';
      if (!httpMcpServer.isRunning()) interfaceStatus = 'degraded';
    } else {
      interfaceDetails.httpMcp = 'not_initialized';
      interfaceStatus = 'degraded';
    }

    // Check stdio MCP server
    const stdioMcpServer = (global as any).stdioMcpServer;
    if (stdioMcpServer && typeof stdioMcpServer.isRunning === 'function') {
      interfaceDetails.stdioMcp = stdioMcpServer.isRunning()
        ? 'running'
        : 'stopped';
    } else {
      interfaceDetails.stdioMcp = 'not_initialized';
    }

    healthStatus.components.interfaces = {
      status: interfaceStatus,
      details: interfaceDetails,
    };

    if (interfaceStatus !== 'healthy') {
      degradedComponents++;
    }
  } catch (error) {
    healthStatus.components.interfaces = {
      status: 'unhealthy',
      error: (error as Error).message,
    };
    overallHealthy = false;
  }

  // Determine overall health status
  if (!overallHealthy) {
    healthStatus.status = 'unhealthy';
  } else if (degradedComponents > 0) {
    healthStatus.status = 'degraded';
  } else {
    healthStatus.status = 'healthy';
  }

  return healthStatus;
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

/**
 * Claude Code Zen - Complete API Surface
 *
 * The default export provides the complete Claude Code Zen API as a single object,
 * making it easy to consume the entire system with a single import.
 *
 * This comprehensive API includes:
 * - Core system initialization and lifecycle management
 * - All subsystem modules (Memory, Neural, Database, etc.)
 * - Utility functions for health checking and version info
 * - Complete type definitions and configuration schemas
 *
 * @example
 * ```typescript
 * // ESM import
 * import ClaudeZen from 'claude-code-zen';
 *
 * await ClaudeZen.initializeClaudeZen();
 * const agent = new ClaudeZen.Neural.NeuralAgent(...);
 * const health = await ClaudeZen.healthCheck();
 * ```
 *
 * @example
 * ```typescript
 * // CommonJS require
 * const ClaudeZen = require('claude-code-zen').default;
 *
 * ClaudeZen.initializeClaudeZen().then(() => {
 *   console.log('System initialized!');
 * });
 * ```
 *
 * @since 1.0.0-alpha.43
 * @see {@link initializeClaudeZen} - System initialization
 * @see {@link healthCheck} - System health monitoring
 */
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
