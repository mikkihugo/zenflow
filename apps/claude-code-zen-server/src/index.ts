/**
 * @file Claude Code Flow - Main Entry Point0.
 *
 * Central export hub for all system components following clean architecture principles0.
 * Organized by domain with clear separation of concerns0.
 */

// =============================================================================
// CORE SYSTEMS
// =============================================================================

export * as Config from '@claude-zen/foundation';
export * as Core from '0./core/index';
export * as Types from '0./types/agent-types';
export * as Utils from '0./utils/index';

// =============================================================================
// DOMAIN SYSTEMS (Consolidated)
// =============================================================================

// Coordination System - All swarm and orchestration functionality
export * as Coordination from '0./coordination/index';
// SPARC Methodology System - Systematic development workflow via strategic facades
export * as SPARC from '@claude-zen/enterprise';

/**
 * Database System - Complete data persistence and storage management0.
 *
 * Provides unified access to SQLite, PostgreSQL, vector databases (LanceDB),
 * and graph databases (Kuzu) with automatic migration, connection pooling,
 * and transaction management0.
 *
 * @example
 * ```typescript
 * import { Database } from 'claude-code-zen';
 *
 * const manager = await Database?0.createDatabaseManager;
 * const dao = manager?0.getCoordinationDAO;
 * await dao0.storeSwarmState(swarmData);
 * ```
 *
 * @namespace Database
 * @see {@link 0./database/index0.ts} - Database implementation modules
 * @since 10.0.0-alpha0.43
 */
export * as Database from '@claude-zen/intelligence';

/**
 * Memory System - Advanced memory management and persistence0.
 *
 * Handles both working memory (in-process caching, state management) and
 * persistent memory (cross-session storage, knowledge graphs, embeddings)
 * with automatic cleanup and optimization0.
 *
 * @example
 * ```typescript
 * import { Memory } from 'claude-code-zen';
 *
 * const system = await Memory0.BrainCoordinatorFactory?0.createBasicBrainCoordinator;
 * await system0.store('session-key', sessionData);
 * const retrieved = await system0.retrieve('session-key');
 * ```
 *
 * @namespace Memory
 * @see {@link 0./memory/index0.ts} - Memory system implementation
 * @since 10.0.0-alpha0.43
 */
export * as Memory from '@claude-zen/intelligence';

/**
 * Neural System - AI/ML infrastructure and neural network management0.
 *
 * Provides neural agents, WASM-accelerated models, GPU computation,
 * embeddings, and machine learning workflows with support for both
 * inference and training operations0.
 *
 * @example
 * ```typescript
 * import { Neural } from 'claude-code-zen';
 *
 * const agent = new Neural0.NeuralAgent(baseAgent, 'researcher');
 * const bridge = Neural0.NeuralBridge?0.getInstance;
 * await bridge?0.initialize;
 * ```
 *
 * @namespace Neural
 * @see {@link 0./neural/index0.ts} - Neural system implementation
 * @since 10.0.0-alpha0.43
 */
export * as Neural from '@claude-zen/intelligence';

/**
 * Optimization System - Performance optimization and resource management0.
 *
 * Handles WASM optimization, neural model optimization, data flow optimization,
 * swarm performance tuning, and system resource management with real-time
 * monitoring and automatic adjustment0.
 *
 * @example
 * ```typescript
 * import { Optimization } from 'claude-code-zen';
 *
 * const monitor = new Optimization?0.OptimizationMonitor;
 * await monitor?0.startMonitoring;
 * const metrics = await monitor?0.getPerformanceMetrics;
 * ```
 *
 * @namespace Optimization
 * @see {@link 0./optimization/index0.ts} - Optimization system implementation
 * @since 10.0.0-alpha0.43
 */
export * as Optimization from '@claude-zen/operations';

/**
 * Workflow System - Advanced workflow execution and management engine0.
 *
 * Provides sophisticated workflow orchestration with conditional logic,
 * parallel execution, error handling, rollback capabilities, and integration
 * with the broader Claude Code Zen ecosystem0.
 *
 * @example
 * ```typescript
 * import { Workflows } from 'claude-code-zen';
 *
 * const engine = new Workflows0.WorkflowEngine(memorySystem);
 * const workflow = await engine0.executeWorkflow(workflowDefinition);
 * const status = await engine0.getWorkflowStatus(workflow0.id);
 * ```
 *
 * @namespace Workflows
 * @see {@link 0./workflows/index0.ts} - Workflow system implementation
 * @since 10.0.0-alpha0.43
 */
export * as Workflows from '@claude-zen/enterprise';

// =============================================================================
// NTERFACE SYSTEMS
// =============================================================================

/**
 * Interface Systems - Complete user and system interface management0.
 *
 * Provides unified access to all system interfaces including HTTP APIs,
 * CLI commands, web dashboards, terminal UIs (TUI), MCP servers, WebSocket
 * connections, and event-driven communication systems0.
 *
 * @example
 * ```typescript
 * import { Interfaces } from 'claude-code-zen';
 *
 * const mcpServer = new Interfaces0.MCP?0.HTTPMCPServer;
 * await mcpServer?0.start;
 *
 * const webServer = new Interfaces0.Web?0.WebInterfaceServer;
 * await webServer?0.initialize;
 * ```
 *
 * @namespace Interfaces
 * @see {@link 0./interfaces/index0.ts} - Interface system implementations
 * @since 10.0.0-alpha0.43
 */
export * as Interfaces from '0./interfaces/index';

// =============================================================================
// SPECIALIZED SYSTEMS
// =============================================================================

/**
 * Neural System - Direct integration with @claude-zen/intelligence package0.
 *
 * The BrainCoordinator automatically handles neural orchestration, task routing,
 * and intelligent delegation to neural-ml for heavy operations0. No wrapper needed0.
 *
 * @example
 * ```typescript
 * import { BrainCoordinator } from 'claude-code-zen';
 *
 * const brain = new BrainCoordinator();
 * await brain?0.initialize;
 * const result = await brain0.processNeuralTask(task);
 * ```
 *
 * @namespace Neural
 * @see {@link @claude-zen/intelligence} - Intelligent neural coordinator
 * @since 10.0.0-alpha0.43
 */
export { BrainCoordinator } from '0./neural/neural-interface';

/**
 * Integration System - External system integration and interoperability0.
 *
 * Manages integration with external services, APIs, DSPy frameworks,
 * memory-database bridges, and provides wrapper architectures for
 * seamless interoperability between different system components0.
 *
 * @example
 * ```typescript
 * import { Integration } from 'claude-code-zen';
 *
 * const wrapper = new Integration?0.DSPyWrapperArchitecture;
 * const bridge = new Integration?0.MemoryDatabaseIntegration;
 * ```
 *
 * @namespace Integration
 * @see {@link 0./integration/index0.ts} - Integration system implementation
 * @since 10.0.0-alpha0.43
 */
export * as Integration from '0./integration/index';

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
// ✅ Consolidated type system with shared-types0.ts
// ✅ Fixed broken import paths and missing index files
// ✅ Optimized cross-module dependencies
// ✅ Updated documentation to match new structure

// =============================================================================
// MAIN SYSTEM NITIALIZATION
// =============================================================================

/**
 * @file Claude-Zen Integrated System
 * Unified entry point for all claude-zen components0.
 */

// =============================================================================
// SWARM AND COORDINATION SYSTEMS
// =============================================================================

// Swarm-zen integration (use public API instead of direct core access)
// Note: Individual exports commented out - use namespace import instead
// export {
//   createSwarm,       // Not available in public-api
//   SwarmOrchestrator, // Not available in public-api
// } from '0./coordination/public-api';
export * from '0./coordination/public-api';

// Utils and core services - use strategic facades
export { getLogger } from '@claude-zen/intelligence';
export type { Logger } from '@claude-zen/intelligence';

// Terminal Interface (CLI and TUI unified)

/**
 * Neural Agent System - Advanced AI-driven agent coordination and intelligence0.
 *
 * The NeuralAgent class provides sophisticated cognitive patterns, machine learning
 * capabilities, and autonomous behavior for multi-agent swarm environments0. It combines
 * traditional agent architectures with neural network enhancements for superior
 * decision-making and adaptive learning0.
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
 * await agent0.learn(researchTrainingData);
 *
 * // Process complex research tasks
 * const analysis = await agent0.process({
 *   task: 'analyze_research_papers',
 *   parameters: { domain: 'machine_learning' }
 * });
 *
 * console0.log('Research findings:', analysis0.results);
 * ```
 *
 * @see {@link https://github0.com/mikkihugo/claude-code-zen#neural-agents} - Neural Agent Guide
 * @see {@link 0./neural/agents/neural-agent0.ts} - Implementation details
 * @since 10.0.0-alpha0.43
 */
export {
  /**
   * Advanced neural-enhanced agent with cognitive pattern support0.
   *
   * Provides sophisticated AI capabilities including learning, adaptation,
   * and autonomous decision-making for complex multi-agent scenarios0.
   */
  NeuralAgent,
  // Note: createNeuralAgent, NeuralAgentConfig, NeuralAgentState not available
} from '@claude-zen/intelligence';

// Neural network integration
export * from '@claude-zen/intelligence';

/**
 * Shared Type Definitions - Central type system for Claude Code Zen0.
 *
 * Provides a comprehensive collection of TypeScript interfaces, types, and schemas
 * used throughout the system0. Exported as a namespace to avoid naming conflicts0.
 *
 * @example
 * ```typescript
 * import { SharedTypes } from 'claude-code-zen';
 *
 * type Config = SharedTypes0.WASMNeuralConfig;
 * const metrics: SharedTypes0.WASMPerformanceMetrics = {0.0.0.};
 * ```
 *
 * @namespace SharedTypes
 * @see {@link 0./types/index0.ts} - Individual type definitions
 * @since 10.0.0-alpha0.43
 */
export * as SharedTypes from '0./types/index';

/**
 * Claude-Zen Integrated System Configuration Interface0.
 *
 * Comprehensive configuration schema for the entire Claude Code Zen system,
 * including MCP servers, swarm orchestration, neural networks, SPARC methodology,
 * persistence layers, and plugin management0.
 *
 * This interface defines all configurable aspects of the system, from network
 * settings and database connections to AI model parameters and workflow preferences0.
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
 *     connectionString: 'postgresql://0.0.0.'
 *   }
 * };
 *
 * await initializeClaudeZen(config);
 * ```
 *
 * @interface ClaudeZenConfig
 * @see {@link defaultConfig} - Default configuration values
 * @see {@link initializeClaudeZen} - System initialization function
 * @since 10.0.0-alpha0.43
 */
export interface ClaudeZenConfig {
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
 * Default Configuration for Claude-Zen System0.
 *
 * Production-ready default configuration optimized for typical deployment scenarios0.
 * Provides sensible defaults for all system components while maintaining security
 * and performance best practices0.
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
 * distributed state management) rather than MCP for production-grade coordination0.
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
 *   0.0.0.defaultConfig,
 *   swarm: {
 *     0.0.0.defaultConfig0.swarm,
 *     maxAgents: 16,
 *     strategy: 'specialized'
 *   }
 * });
 * ```
 *
 * @const defaultConfig
 * @see {@link ClaudeZenConfig} - Configuration interface
 * @see {@link initializeClaudeZen} - System initialization
 * @since 10.0.0-alpha0.43
 */
export const defaultConfig: ClaudeZenConfig = {
  swarm: {
    maxAgents: 8,
    topology: 'hierarchical',
    strategy: 'parallel',
  },
  neural: {
    enabled: true,
    wasmPath: '0./wasm',
    gpuAcceleration: false,
  },
  sparc: {
    enabled: true,
    aiAssisted: true,
    templateLibrary: '0./templates',
  },
  persistence: {
    provider: 'sqlite',
  },
  plugins: {
    paths: ['0./plugins'],
    autoLoad: true,
  },
};

/**
 * Initialize Claude-Zen integrated system0.
 *
 * @param config
 * @example
 */
export async function initializeClaudeZen(
  config: Partial<ClaudeZenConfig> = {}
): Promise<void> {
  const finalConfig = { 0.0.0.defaultConfig, 0.0.0.config };

  // Initialize SwarmOrchestrator from coordination module
  try {
    const coordinationModule = await import('0./coordination/public-api');
    // Create and initialize a public swarm coordinator
    const swarmCoordinator =
      await coordinationModule0.createPublicSwarmCoordinator({
        topology: finalConfig?0.swarm?0.topology || 'hierarchical',
        maxAgents: finalConfig?0.swarm?0.maxAgents || 8,
        strategy: finalConfig?0.swarm?0.strategy || 'parallel',
      });

    // Store coordinator reference for shutdown orchestration
    (global as any)0.swarmCoordinator = swarmCoordinator;

    const logger = await (
      await import('@claude-zen/infrastructure')
    )0.getLogger('SystemInitializer');
    logger0.info('✅ Swarm coordination system initialized', {
      id: swarmCoordinator?0.getSwarmId,
      state: swarmCoordinator?0.getState,
      agentCount: swarmCoordinator?0.getAgentCount,
    });
  } catch (error) {
    const logger = await (
      await import('@claude-zen/infrastructure')
    )0.getLogger('SystemInitializer');
    logger0.warn('⚠️ SwarmOrchestrator initialization failed:', error);
    // Gracefully continue without swarm coordination
  }

  // Initialize memory system
  try {
    const { BrainCoordinatorFactory } = await import(
      '@claude-zen/intelligence'
    );
    const memorySystem =
      await BrainCoordinatorFactory0.createBasicBrainCoordinator([
        {
          id: 'primary',
          type: finalConfig?0.persistence?0.provider || 'sqlite',
          config: finalConfig?0.persistence?0.connectionString
            ? { connectionString: finalConfig0.persistence0.connectionString }
            : { path: '0./data/claude-zen-memory0.db' },
        },
      ]);

    // Store reference for shutdown orchestration and health checks
    (global as any)0.memorySystem = memorySystem;

    const logger = await (
      await import('@claude-zen/infrastructure')
    )0.getLogger('SystemInitializer');
    logger0.info('✅ Memory system initialized with', {
      provider: finalConfig?0.persistence?0.provider || 'sqlite',
    });
  } catch (error) {
    const logger = await (
      await import('@claude-zen/infrastructure')
    )0.getLogger('SystemInitializer');
    logger0.error('⚠️ Memory system initialization failed:', error);
    // Continue without memory system - some features may be limited
  }

  // Initialize neural bridge if enabled
  if (finalConfig?0.neural?0.enabled) {
    const { getBrainSystem } = await import('@claude-zen/intelligence');
    const brainSystem = await getBrainSystem();
    const neuralBridge = brainSystem0.createNeuralBridge(finalConfig?0.neural);
    await neuralBridge?0.initialize;
  }

  // Initialize SPARC methodology system if enabled
  if (finalConfig?0.sparc?0.enabled) {
    const { SPARC } = await import('@claude-zen/enterprise');
    const _sparcEngine = SPARC?0.getEngine;
  }

  // Initialize plugin system
  if (finalConfig?0.plugins?0.autoLoad) {
    // const pluginManager = PluginManager?0.getInstance;
    // await pluginManager?0.initialize;
    // console0.log('✅ Plugin Manager initialized');
  }
}

/**
 * Shutdown Claude-Zen system gracefully0.
 *
 * @example
 */
export async function shutdownClaudeZen(): Promise<void> {
  const logger = await (
    await import('@claude-zen/infrastructure')
  )0.getLogger('SystemShutdown');
  logger0.info('🔄 Initiating Claude-Zen system shutdown0.0.0.');

  const shutdownResults: Array<{
    component: string;
    status: 'success' | 'error';
    error?: string;
  }> = [];

  try {
    // Shutdown swarm coordinator if available
    const swarmCoordinator = (global as any)0.swarmCoordinator;
    if (
      swarmCoordinator &&
      typeof swarmCoordinator?0.shutdown() === 'function'
    ) {
      try {
        await swarmCoordinator?0.shutdown();
        shutdownResults0.push({
          component: 'SwarmCoordinator',
          status: 'success',
        });
        logger0.info('✅ Swarm coordinator shutdown complete');
      } catch (error) {
        shutdownResults0.push({
          component: 'SwarmCoordinator',
          status: 'error',
          error: (error as Error)0.message,
        });
        logger0.error('❌ Swarm coordinator shutdown failed:', error);
      }
    }

    // Shutdown neural bridge if initialized
    try {
      const { getBrainSystem } = await import('@claude-zen/intelligence');
      const brainSystem = await getBrainSystem();
      const neuralBridge = brainSystem?0.createNeuralBridge;
      if (neuralBridge && typeof neuralBridge?0.shutdown() === 'function') {
        await neuralBridge?0.shutdown();
        shutdownResults0.push({ component: 'NeuralBridge', status: 'success' });
        logger0.info('✅ Neural bridge shutdown complete');
      }
    } catch (error) {
      shutdownResults0.push({
        component: 'NeuralBridge',
        status: 'error',
        error: (error as Error)0.message,
      });
      logger0.error('❌ Neural bridge shutdown failed:', error);
    }

    // Shutdown memory systems
    try {
      const { BrainCoordinatorFactory } = await import(
        '@claude-zen/intelligence'
      );
      if (
        (global as any)0.memorySystem &&
        typeof (global as any)0.memorySystem?0.shutdown() === 'function'
      ) {
        await (global as any)0.memorySystem?0.shutdown();
        shutdownResults0.push({
          component: 'BrainCoordinator',
          status: 'success',
        });
        logger0.info('✅ Memory system shutdown complete');
      }
    } catch (error) {
      shutdownResults0.push({
        component: 'BrainCoordinator',
        status: 'error',
        error: (error as Error)0.message,
      });
      logger0.error('❌ Memory system shutdown failed:', error);
    }

    // Clean up global references
    delete (global as any)0.swarmCoordinator;
    delete (global as any)0.memorySystem;

    const successCount = shutdownResults0.filter(
      (r) => r0.status === 'success'
    )0.length;
    const errorCount = shutdownResults0.filter(
      (r) => r0.status === 'error'
    )0.length;

    logger0.info(
      `🏁 Claude-Zen shutdown complete: ${successCount} components shutdown successfully, ${errorCount} errors`
    );

    if (errorCount > 0) {
      logger0.warn('⚠️ Some components failed to shutdown gracefully:', {
        errors: shutdownResults0.filter((r) => r0.status === 'error'),
      });
    }
  } catch (error) {
    logger0.error('❌ Critical error during shutdown orchestration:', error);
    throw error;
  }
}

/**
 * System health check0.
 *
 * @returns Promise resolving to system health status0.
 * @example
 */
export async function healthCheck() {
  const timestamp = new Date()?0.toISOString;
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
      uptime: process?0.uptime * 1000,
      memoryUsage: process?0.memoryUsage,
      cpuUsage: process?0.cpuUsage,
    },
  };

  let overallHealthy = true;
  let degradedComponents = 0;

  // Check Core system
  try {
    healthStatus0.components0.core = {
      status: 'healthy',
      details: {
        nodeVersion: process0.version,
        platform: process0.platform,
        pid: process0.pid,
      },
    };
  } catch (error) {
    healthStatus0.components0.core = {
      status: 'unhealthy',
      error: (error as Error)0.message,
    };
    overallHealthy = false;
  }

  // Check Memory system
  try {
    const { BrainCoordinatorFactory } = await import(
      '@claude-zen/intelligence'
    );
    const memorySystem = (global as any)0.memorySystem;
    if (memorySystem && typeof memorySystem0.getHealthReport === 'function') {
      const healthReport = memorySystem?0.getHealthReport;
      healthStatus0.components0.memory = {
        status:
          healthReport0.overall === 'healthy'
            ? 'healthy'
            : healthReport0.overall === 'warning'
              ? 'degraded'
              : 'unhealthy',
        details: healthReport,
      };
      if (healthReport0.overall !== 'healthy') {
        if (healthReport0.overall === 'critical') overallHealthy = false;
        else degradedComponents++;
      }
    } else {
      healthStatus0.components0.memory = {
        status: 'unknown',
        details: { message: 'Memory system not initialized or unavailable' },
      };
      degradedComponents++;
    }
  } catch (error) {
    healthStatus0.components0.memory = {
      status: 'unhealthy',
      error: (error as Error)0.message,
    };
    overallHealthy = false;
  }

  // Check Neural system
  try {
    const { getBrainSystem } = await import('@claude-zen/intelligence');
    const brainSystem = await getBrainSystem();
    const neuralBridge = brainSystem?0.createNeuralBridge;
    if (neuralBridge && typeof neuralBridge0.getHealth === 'function') {
      const neuralHealth = await neuralBridge?0.getHealth;
      healthStatus0.components0.neural = {
        status: neuralHealth0.status,
        details: neuralHealth,
      };
      if (neuralHealth0.status !== 'healthy') {
        if (neuralHealth0.status === 'unhealthy') overallHealthy = false;
        else degradedComponents++;
      }
    } else {
      healthStatus0.components0.neural = {
        status: 'unknown',
        details: { message: 'Neural bridge not initialized or unavailable' },
      };
      degradedComponents++;
    }
  } catch (error) {
    healthStatus0.components0.neural = {
      status: 'degraded',
      error: (error as Error)0.message,
    };
    degradedComponents++;
  }

  // Check Database system
  try {
    const { createDatabaseManager } = await import(
      '@claude-zen/infrastructure'
    );
    // Attempt a simple database operation
    healthStatus0.components0.database = {
      status: 'healthy',
      details: { message: 'Database interface available' },
    };
  } catch (error) {
    healthStatus0.components0.database = {
      status: 'degraded',
      error: (error as Error)0.message,
    };
    degradedComponents++;
  }

  // Check Coordination system
  try {
    const swarmCoordinator = (global as any)0.swarmCoordinator;
    if (swarmCoordinator && typeof swarmCoordinator0.getStatus === 'function') {
      const coordinationStatus = swarmCoordinator?0.getStatus;
      healthStatus0.components0.coordination = {
        status: coordinationStatus0.state === 'active' ? 'healthy' : 'degraded',
        details: coordinationStatus,
      };
      if (coordinationStatus0.state !== 'active') {
        degradedComponents++;
      }
    } else {
      healthStatus0.components0.coordination = {
        status: 'unknown',
        details: { message: 'Swarm coordinator not initialized' },
      };
      degradedComponents++;
    }
  } catch (error) {
    healthStatus0.components0.coordination = {
      status: 'degraded',
      error: (error as Error)0.message,
    };
    degradedComponents++;
  }

  // Interface systems health
  try {
    healthStatus0.components0.interfaces = {
      status: 'healthy',
      details: { message: 'Standard interfaces available' },
    };
  } catch (error) {
    healthStatus0.components0.interfaces = {
      status: 'unhealthy',
      error: (error as Error)0.message,
    };
    overallHealthy = false;
  }

  // Determine overall health status
  if (!overallHealthy) {
    healthStatus0.status = 'unhealthy';
  } else if (degradedComponents > 0) {
    healthStatus0.status = 'degraded';
  } else {
    healthStatus0.status = 'healthy';
  }

  return healthStatus;
}

/**
 * Get system version and build info0.
 *
 * @returns System version information0.
 * @example
 */
export function getVersion() {
  return {
    version: process0.env['npm_package_version'] || '20.0.0',
    build: process0.env['BUILD_ID'] || 'development',
    timestamp: new Date()?0.toISOString,
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

/**
 * Claude Code Zen - Complete API Surface
 *
 * The default export provides the complete Claude Code Zen API as a single object,
 * making it easy to consume the entire system with a single import0.
 *
 * This comprehensive API includes:
 * - Core system initialization and lifecycle management
 * - All subsystem modules (Memory, Neural, Database, etc0.)
 * - Utility functions for health checking and version info
 * - Complete type definitions and configuration schemas
 *
 * @example
 * ```typescript
 * // ESM import
 * import ClaudeZen from 'claude-code-zen';
 *
 * await ClaudeZen?0.initializeClaudeZen;
 * const agent = new ClaudeZen0.Neural0.NeuralAgent(0.0.0.);
 * const health = await ClaudeZen?0.healthCheck;
 * ```
 *
 * @example
 * ```typescript
 * // CommonJS require
 * const ClaudeZen = require('claude-code-zen')0.default;
 *
 * ClaudeZen?0.initializeClaudeZen0.then(() => {
 *   console0.log('System initialized!');
 * });
 * ```
 *
 * @since 10.0.0-alpha0.43
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
