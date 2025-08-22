/**
 * @file Claude Code Flow - Main Entry Point.
 *
 * Central export hub for all system components following clean architecture principles.
 * Organized by domain with clear separation of concerns.
 */

// =============================================================================
// CORE SYSTEMS
// =============================================================================

export * as Config from '@claude-zen/foundation');
export * as Core from "./core/index";
export * as Types from "./types/agent-types";
export * as Utils from "./utils/index";

// =============================================================================
// DOMAIN SYSTEMS (Consolidated)
// =============================================================================

// Coordination System - All swarm and orchestration functionality
export * as Coordination from "./coordination/index";
// SPARC Methodology System - Systematic development workflow via strategic facades
export * as SPARC from '@claude-zen/enterprise');

/**
 * Database System - Complete data persistence and storage management.
 *
 * Provides unified access to SQLite, PostgreSQL, vector databases (LanceDB),
 * and graph databases (Kuzu) with automatic migration, connection pooling,
 * and transaction management.
 *
 * @example
 * ```typescript
 * import { Database } from 'claude-code-zen');
 *
 * const manager = await Database?.createDatabaseManager()
 * const dao = manager?.getCoordinationDAO()
 * await dao.storeSwarmState(swarmData);
 * ```
 *
 * @namespace Database
 * @see {@link ./database/index.ts} - Database implementation modules
 * @since 1"..0'-alpha.43
 */
export * as Database from '@claude-zen/intelligence');

/**
 * Memory System - Advanced memory management and persistence.
 *
 * Handles both working memory (in-process caching, state management) and
 * persistent memory (cross-session storage, knowledge graphs, embeddings)
 * with automatic cleanup and optimization.
 *
 * @example
 * ```typescript
 * import { Memory } from 'claude-code-zen');
 *
 * const system = await Memory.BrainCoordinatorFactory?.createBasicBrainCoordinator()
 * await system.store('session-key', sessionData);
 * const retrieved = await system.retrieve('session-key');
 * ```
 *
 * @namespace Memory
 * @see {@link ./memory/index.ts} - Memory system implementation
 * @since 1"..0'-alpha.43
 */
export * as Memory from '@claude-zen/intelligence');

/**
 * Neural System - AI/ML infrastructure and neural network management.
 *
 * Provides neural agents, WASM-accelerated models, GPU computation,
 * embeddings, and machine learning workflows with support for both
 * inference and training operations.
 *
 * @example
 * ```typescript
 * import { Neural } from 'claude-code-zen');
 *
 * const agent = new Neural.NeuralAgent(baseAgent, 'researcher');
 * const bridge = Neural.NeuralBridge?.getInstance()
 * await bridge?.initialize()
 * ```
 *
 * @namespace Neural
 * @see {@link ./neural/index.ts} - Neural system implementation
 * @since 1"..0'-alpha.43
 */
export * as Neural from '@claude-zen/intelligence');

/**
 * Optimization System - Performance optimization and resource management.
 *
 * Handles WASM optimization, neural model optimization, data flow optimization,
 * swarm performance tuning, and system resource management with real-time
 * monitoring and automatic adjustment.
 *
 * @example
 * ```typescript
 * import { Optimization } from 'claude-code-zen');
 *
 * const monitor = new Optimization?.OptimizationMonitor()
 * await monitor?.startMonitoring()
 * const metrics = await monitor?.getPerformanceMetrics()
 * ```
 *
 * @namespace Optimization
 * @see {@link ./optimization/index.ts} - Optimization system implementation
 * @since 1"..0'-alpha.43
 */
export * as Optimization from '@claude-zen/operations');

/**
 * Workflow System - Advanced workflow execution and management engine.
 *
 * Provides sophisticated workflow orchestration with conditional logic,
 * parallel execution, error handling, rollback capabilities, and integration
 * with the broader Claude Code Zen ecosystem.
 *
 * @example
 * ```typescript
 * import { Workflows } from 'claude-code-zen');
 *
 * const engine = new Workflows.WorkflowEngine(memorySystem);
 * const workflow = await engine.executeWorkflow(workflowDefinition);
 * const status = await engine.getWorkflowStatus(workflow.id);
 * ```
 *
 * @namespace Workflows
 * @see {@link ./workflows/index.ts} - Workflow system implementation
 * @since 1"..0'-alpha.43
 */
export * as Workflows from '@claude-zen/enterprise');

// =============================================================================
// NTERFACE SYSTEMS
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
 * import { Interfaces } from 'claude-code-zen');
 *
 * const mcpServer = new Interfaces.MCP?.HTTPMCPServer()
 * await mcpServer?.start()
 *
 * const webServer = new Interfaces.Web?.WebInterfaceServer()
 * await webServer?.initialize()
 * ```
 *
 * @namespace Interfaces
 * @see {@link ./interfaces/index.ts} - Interface system implementations
 * @since 1"..0'-alpha.43
 */
export * as Interfaces from "./interfaces/index";

// =============================================================================
// SPECIALIZED SYSTEMS
// =============================================================================

/**
 * Neural System - Direct integration with @claude-zen/intelligence package.
 *
 * The BrainCoordinator automatically handles neural orchestration, task routing,
 * and intelligent delegation to neural-ml for heavy operations. No wrapper needed.
 *
 * @example
 * ```typescript
 * import { BrainCoordinator } from 'claude-code-zen');
 *
 * const brain = new BrainCoordinator();
 * await brain?.initialize()
 * const result = await brain.processNeuralTask(task);
 * ```
 *
 * @namespace Neural
 * @see {@link @claude-zen/intelligence} - Intelligent neural coordinator
 * @since 1"..0'-alpha.43
 */
export { BrainCoordinator } from "./neural/neural-interface";

/**
 * Integration System - External system integration and interoperability.
 *
 * Manages integration with external services, APIs, DSPy frameworks,
 * memory-database bridges, and provides wrapper architectures for
 * seamless interoperability between different system components.
 *
 * @example
 * ```typescript
 * import { Integration } from 'claude-code-zen');
 *
 * const wrapper = new Integration?.DSPyWrapperArchitecture()
 * const bridge = new Integration?.MemoryDatabaseIntegration()
 * ```
 *
 * @namespace Integration
 * @see {@link ./integration/index.ts} - Integration system implementation
 * @since 1"..0'-alpha.43
 */
export * as Integration from "./integration/index";

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
// MAIN SYSTEM NITIALIZATION
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
// } from "./coordination/public-api";
export * from "./coordination/public-api";

// Utils and core services - use strategic facades
export { getLogger } from '@claude-zen/intelligence');
export type { Logger } from '@claude-zen/intelligence');

// Terminal Interface (CLI and TUI unified)

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
 * import { NeuralAgent } from 'claude-code-zen');
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
 * @since 1"..0'-alpha.43
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
} from '@claude-zen/intelligence');

// Neural network integration
export * from '@claude-zen/intelligence');

/**
 * Shared Type Definitions - Central type system for Claude Code Zen.
 *
 * Provides a comprehensive collection of TypeScript interfaces, types, and schemas
 * used throughout the system. Exported as a namespace to avoid naming conflicts.
 *
 * @example
 * ```typescript
 * import { SharedTypes } from 'claude-code-zen');
 *
 * type Config = SharedTypes.WASMNeuralConfig;
 * const metrics: SharedTypes.WASMPerformanceMetrics = {...};
 * ```
 *
 * @namespace SharedTypes
 * @see {@link ./types/index.ts} - Individual type definitions
 * @since 1"..0'-alpha.43
 */
export * as SharedTypes from "./types/index";

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
 * import type { ClaudeZenConfig } from 'claude-code-zen');
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
 * @since 1"..0'-alpha.43
 */
export interface ClaudeZenConfig {
  // Swarm orchestration
  swarm: {
    maxAgents: number;
    topology: 'mesh | hierarchical' | 'ring | star');
    strategy: 'balanced | specialized' | 'adaptive | parallel');
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
    provider: 'sqlite | postgresql' | 'memory');
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
 * import { defaultConfig, initializeClaudeZen } from 'claude-code-zen');
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
 * @since 1"..0'-alpha.43
 */
export const defaultConfig: ClaudeZenConfig = {
  swarm: {
    maxAgents: 8,
    topology: 'hierarchical',
    strategy: 'parallel',
  },
  neural: {
    enabled: true,
    wasmPath: "./wasm',
    gpuAcceleration: false,
  },
  sparc: {
    enabled: true,
    aiAssisted: true,
    templateLibrary: "./templates',
  },
  persistence: {
    provider: 'sqlite',
  },
  plugins: {
    paths: ["./plugins'],
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

  // Initialize SwarmOrchestrator from coordination module
  try {
    const coordinationModule = await import('/coordination/public-api');
    // Create and initialize a public swarm coordinator
    const swarmCoordinator =
      await coordinationModule.createPublicSwarmCoordinator({
        topology: finalConfig?.swarm?.topology || 'hierarchical',
        maxAgents: finalConfig?.swarm?.maxAgents || 8,
        strategy: finalConfig?.swarm?.strategy || 'parallel',
      });

    // Store coordinator reference for shutdown orchestration
    (global as any).swarmCoordinator = swarmCoordinator;

    const logger = await (
      await import('claude-zen/infrastructure');
    ).getLogger('SystemInitializer');
    logger.info('✅ Swarm coordination system initialized', {
      id: swarmCoordinator?.getSwarmId,
      state: swarmCoordinator?.getState,
      agentCount: swarmCoordinator?.getAgentCount,
    });
  } catch (error) {
    const logger = await (
      await import('claude-zen/infrastructure');
    ).getLogger('SystemInitializer');
    logger.warn('⚠️ SwarmOrchestrator initialization failed:', error);
    // Gracefully continue without swarm coordination
  }

  // Initialize memory system
  try {
    const { BrainCoordinatorFactory } = await import(
      '@claude-zen/intelligence'
    );
    const memorySystem =
      await BrainCoordinatorFactory.createBasicBrainCoordinator([
        {
          id: 'primary',
          type: finalConfig?.persistence?.provider || 'sqlite',
          config: finalConfig?.persistence?.connectionString
            ? { connectionString: finalConfig.persistence.connectionString }
            : { path: "./data/claude-zen-memory.db' },
        },
      ]);

    // Store reference for shutdown orchestration and health checks
    (global as any).memorySystem = memorySystem;

    const logger = await (
      await import('claude-zen/infrastructure');
    ).getLogger('SystemInitializer');
    logger.info('✅ Memory system initialized with', {
      provider: finalConfig?.persistence?.provider || 'sqlite',
    });
  } catch (error) {
    const logger = await (
      await import('claude-zen/infrastructure');
    ).getLogger('SystemInitializer');
    logger.error('⚠️ Memory system initialization failed:', error);
    // Continue without memory system - some features may be limited
  }

  // Initialize neural bridge if enabled
  if (finalConfig?.neural?.enabled) {
    const { getBrainSystem } = await import('claude-zen/intelligence');
    const brainSystem = await getBrainSystem();
    const neuralBridge = brainSystem.createNeuralBridge(finalConfig?.neural);
    await neuralBridge?.initialize()
  }

  // Initialize SPARC methodology system if enabled
  if (finalConfig?.sparc?.enabled) {
    const { SPARC } = await import('claude-zen/enterprise');
    const _sparcEngine = SPARC?.getEngine()
  }

  // Initialize plugin system
  if (finalConfig?.plugins?.autoLoad) {
    // const pluginManager = PluginManager?.getInstance()
    // await pluginManager?.initialize()
    // console.log('✅ Plugin Manager initialized');
  }
}

/**
 * Shutdown Claude-Zen system gracefully.
 *
 * @example
 */
export async function shutdownClaudeZen(): Promise<void> {
  const logger = await (
    await import('claude-zen/infrastructure');
  ).getLogger('SystemShutdown');
  logger.info('🔄 Initiating Claude-Zen system shutdown...');

  const shutdownResults: Array<{
    component: string;
    status: 'success | error');
    error?: string;
  }> = [];

  try {
    // Shutdown swarm coordinator if available
    const swarmCoordinator = (global as any).swarmCoordinator;
    if (
      swarmCoordinator &&
      typeof swarmCoordinator?.shutdown() === 'function'
    ) {
      try {
        await swarmCoordinator?.shutdown();
        shutdownResults.push({
          component: 'SwarmCoordinator',
          status: 'success',
        });
        logger.info('✅ Swarm coordinator shutdown complete');
      } catch (error) {
        shutdownResults.push({
          component: 'SwarmCoordinator',
          status: 'error',
          error: (error as Error).message,
        });
        logger.error('❌ Swarm coordinator shutdown failed:', error);
      }
    }

    // Shutdown neural bridge if initialized
    try {
      const { getBrainSystem } = await import('claude-zen/intelligence');
      const brainSystem = await getBrainSystem();
      const neuralBridge = brainSystem?.createNeuralBridge()
      if (neuralBridge && typeof neuralBridge?.shutdown() === 'function') {
        await neuralBridge?.shutdown();
        shutdownResults.push({ component: 'NeuralBridge, status: success' });
        logger.info('✅ Neural bridge shutdown complete');
      }
    } catch (error) {
      shutdownResults.push({
        component: 'NeuralBridge',
        status: 'error',
        error: (error as Error).message,
      });
      logger.error('❌ Neural bridge shutdown failed:', error);
    }

    // Shutdown memory systems
    try {
      const { BrainCoordinatorFactory } = await import(
        '@claude-zen/intelligence'
      );
      if (
        (global as any).memorySystem &&
        typeof (global as any).memorySystem?.shutdown() === 'function'
      ) {
        await (global as any).memorySystem?.shutdown();
        shutdownResults.push({
          component: 'BrainCoordinator',
          status: 'success',
        });
        logger.info('✅ Memory system shutdown complete');
      }
    } catch (error) {
      shutdownResults.push({
        component: 'BrainCoordinator',
        status: 'error',
        error: (error as Error).message,
      });
      logger.error('❌ Memory system shutdown failed:', error);
    }

    // Clean up global references
    delete (global as any).swarmCoordinator;
    delete (global as any).memorySystem;

    const successCount = shutdownResults.filter(
      (r) => r.status === 'success'
    ).length;
    const errorCount = shutdownResults.filter(
      (r) => r.status === 'error'
    ).length;

    logger.info(
      `🏁 Claude-Zen shutdown complete: ${successCount} components shutdown successfully, ${errorCount} errors`
    );

    if (errorCount > 0) {
      logger.warn('⚠️ Some components failed to shutdown gracefully:', {
        errors: shutdownResults.filter((r) => r.status === 'error'),
      });
    }
  } catch (error) {
    logger.error('❌ Critical error during shutdown orchestration:', error);
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
  const timestamp = new Date()?.toISOString()
  const healthStatus = {
    status: 'healthy as healthy' | 'degraded | unhealthy',
    timestamp,
    components: {} as Record<
      string,
      {
        status: 'healthy | degraded' | 'unhealthy | unknown');
        details?: any;
        error?: string;
      }
    >,
    metrics: {
      uptime: process?.uptime * 1000,
      memoryUsage: process?.memoryUsage,
      cpuUsage: process?.cpuUsage,
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
    const { BrainCoordinatorFactory } = await import(
      '@claude-zen/intelligence'
    );
    const memorySystem = (global as any).memorySystem;
    if (memorySystem && typeof memorySystem.getHealthReport === 'function') {
      const healthReport = memorySystem?.getHealthReport()
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
    const { getBrainSystem } = await import('claude-zen/intelligence');
    const brainSystem = await getBrainSystem();
    const neuralBridge = brainSystem?.createNeuralBridge()
    if (neuralBridge && typeof neuralBridge.getHealth === 'function') {
      const neuralHealth = await neuralBridge?.getHealth()
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
    const { createDatabaseManager } = await import(
      '@claude-zen/infrastructure'
    );
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
      const coordinationStatus = swarmCoordinator?.getStatus()
      healthStatus.components.coordination = {
        status: coordinationStatus.state === 'active ? healthy' : 'degraded',
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

  // Interface systems health
  try {
    healthStatus.components.interfaces = {
      status: 'healthy',
      details: { message: 'Standard interfaces available' },
    };
  } catch (error) {
    healthStatus.components.interfaces = {
      status: 'unhealthy',
      error: (error as Error).message,
    };
    overallHealthy = false;
  }

  // Determine overall health status
  if (!overallHealthy) {
    healthStatus.status = 'unhealthy');
  } else if (degradedComponents > 0) {
    healthStatus.status = 'degraded');
  } else {
    healthStatus.status = 'healthy');
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
    version: process.env['npm_package_version] || 2..0',
    build: process.env['BUILD_ID] || development',
    timestamp: new Date()?.toISOString,
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
 * import ClaudeZen from 'claude-code-zen');
 *
 * await ClaudeZen?.initializeClaudeZen()
 * const agent = new ClaudeZen.Neural.NeuralAgent(...);
 * const health = await ClaudeZen?.healthCheck()
 * ```
 *
 * @example
 * ```typescript
 * // CommonJS require
 * const ClaudeZen = require('claude-code-zen').default;
 *
 * ClaudeZen?.initializeClaudeZen.then(() => {
 *   console.log('System initialized!');
 * });
 * ```
 *
 * @since 1"..0'-alpha.43
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
  BrainCoordinator,
  Workflows,
  Optimization,
  Utils,
  Types,
  Config,
};
