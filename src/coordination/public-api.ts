/**
 * Coordination Domain - Public API (OpenAPI 3 Compatible)
 *
 * This file defines the EXPLICIT public interface for the coordination domain.
 * Following Google standards: clear, curated exports with OpenAPI 3 Swagger autodoc.
 *
 * @fileoverview Public API for swarm coordination, agents, and orchestration
 * @openapi 3.0.0
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CoordinationConfig:
 *       type: object
 *       required:
 *         - maxAgents
 *         - heartbeatInterval
 *         - timeout
 *       properties:
 *         maxAgents:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: Maximum number of agents in the swarm
 *         heartbeatInterval:
 *           type: integer
 *           minimum: 1000
 *           description: Heartbeat interval in milliseconds
 *         timeout:
 *           type: integer
 *           minimum: 5000
 *           description: Operation timeout in milliseconds
 *         enableHealthCheck:
 *           type: boolean
 *           default: true
 *           description: Enable health monitoring
 */

// Agent management - Essential agent functionality
export { Agent } from './agents/agent.js';
export { AgentManager } from './agents/manager.js';
export type { AgentCapability, AgentConfig, AgentStatus } from './agents/types.js';
// Diagnostics and monitoring
export { HealthMonitor } from './diagnostics/health-monitor.js';
export { PerformanceTracker } from './diagnostics/performance.js';
export type { HealthStatus, PerformanceMetrics } from './diagnostics/types.js';
// GitHub integration
export { GitHubCoordinator } from './github/coordinator.js';
export type { GitHubConfig, IssueMapping } from './github/types.js';
export { HiveMindCoordinator } from './hive-mind/coordinator.js';
// Orchestration systems
export { MaestroOrchestrator } from './maestro/orchestrator.js';
export type { CoordinationConfig, CoordinationEvent, CoordinationMetrics } from './manager.js';
// Core coordination manager - The main entry point
export { CoordinationManager } from './manager.js';
// MCP integration - Swarm coordination protocol
export { SwarmMCPServer } from './mcp/server.js';
export type { MCPConfig, MCPTool } from './mcp/types.js';
export type { OrchestrationConfig, TaskDefinition } from './orchestration/types.js';
export { ChaosEngineering } from './swarm/chaos-engineering/chaos-engineering.js';
export { CognitivePatterns } from './swarm/cognitive-patterns/cognitive-pattern-evolution.js';
export { ConnectionManager } from './swarm/connection-management/connection-state-manager.js';
// Swarm coordination - Core swarm functionality (NOT legacy!)
export { SwarmCore } from './swarm/core/index.js';
export type { SwarmConfig, SwarmMetrics, SwarmTopology } from './swarm/types.js';

/**
 * Coordination utilities - Helper functions for common operations
 */
export const CoordinationUtils = {
  /**
   * Create a default coordination configuration with safe defaults
   */
  createConfig: (overrides?: Partial<CoordinationConfig>): CoordinationConfig => ({
    maxAgents: 10,
    heartbeatInterval: 5000,
    timeout: 30000,
    enableHealthCheck: true,
    ...overrides,
  }),

  /**
   * Validate coordination configuration
   */
  validateConfig: (config: CoordinationConfig): boolean => {
    return config.maxAgents > 0 && config.heartbeatInterval > 0 && config.timeout > 0;
  },

  /**
   * Generate unique agent ID with type prefix
   */
  generateAgentId: (type: string): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${type}-${timestamp}-${random}`;
  },
} as const;

/**
 * Factory for creating coordination instances with dependency injection
 */
export class CoordinationFactory {
  private static instances = new Map<string, CoordinationManager>();

  /**
   * Create or retrieve a coordination manager instance
   * Following Google's dependency injection patterns
   */
  static getInstance(
    config: CoordinationConfig,
    dependencies: {
      logger?: any; // TODO: Replace with proper Logger interface
      eventBus?: any; // TODO: Replace with proper EventBus interface
      healthCheck?: any; // TODO: Replace with proper HealthCheck interface
    } = {},
    instanceKey = 'default'
  ): CoordinationManager {
    if (!CoordinationFactory.instances.has(instanceKey)) {
      const instance = new CoordinationManager(config, dependencies.logger, dependencies.eventBus);
      CoordinationFactory.instances.set(instanceKey, instance);
    }

    return CoordinationFactory.instances.get(instanceKey)!;
  }

  /**
   * Clear all instances (useful for testing)
   */
  static clearInstances(): void {
    for (const [, manager] of CoordinationFactory.instances) {
      manager.stop();
    }
    CoordinationFactory.instances.clear();
  }
}
