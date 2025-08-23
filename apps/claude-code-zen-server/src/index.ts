/**
 * @file Claude Code Flow - Main Entry Point.
 *
 * Central export hub for all system components following clean architecture principles.
 * Organized by domain with clear separation of concerns.
 */

// =============================================================================
// CORE SYSTEMS
// =============================================================================

export * as Config from '@claude-zen/foundation';
export * as Core from './core/index';
export * as Types from './types/agent-types';
export * as Utils from './utils/index';

// =============================================================================
// DOMAIN SYSTEMS (Consolidated)
// =============================================================================

// Coordination System - All swarm and orchestration functionality
export * as Coordination from './coordination/index';
// SPARC Methodology System - Systematic development workflow via strategic facades
export * as SPARC from '@claude-zen/enterprise';

/**
 * Database System - Complete data persistence and storage management.
 *
 * Provides unified access to SQLite, PostgreSQL, vector databases (LanceDB),
 * and graph databases (Kuzu) with automatic migration, connection pooling,
 * and transaction management.
 *
 * @example
 * ``'typescript
 * import { Database } from 'claude-code-zen';
 *
 * const manager = await Database.createDatabaseManager();
 * const dao = manager.getCoordinationDAO();
 * await dao.storeSwarmState(swarmData);
 * ``'
 *
 * @namespace Database
 * @see {@link ./database/index.ts} - Database implementation modules
 * @since 1.0-alpha.43
 */
export * as Database from '@claude-zen/intelligence';

/**
 * Memory System - Advanced memory management and persistence.
 *
 * Handles both working memory (in-process caching, state management) and
 * persistent memory(
  cross-session storage,
  knowledge graphs,
  embeddings
)
 * with automatic cleanup and optimization.
 *
 * @example
 * ``'typescript
 * import { Memory } from 'claude-code-zen';
 *
 * const system = await Memory.BrainCoordinatorFactory.createBasicBrainCoordinator();
 * await system.store('session-key', sessionData)';
 * const retrieved = await system.retrieve('session-key)';
 * ``'
 *
 * @namespace Memory
 * @see {@link ./memory/index.ts} - Memory system implementation
 * @since 1.0-alpha.43
 */
export * as Memory from '@claude-zen/intelligence';

/**
 * Neural System - AI/ML infrastructure and neural network management.
 *
 * Provides neural agents, WASM-accelerated models, GPU computation,
 * embeddings, and machine learning workflows with support for both
 * inference and training operations.
 *
 * @example
 * ``'typescript
 * import { Neural } from 'claude-code-zen';
 *
 * const agent = new Neural.NeuralAgent(baseAgent, researcher);
 * const bridge = Neural.NeuralBridge.getInstance();
 * await bridge.initialize();
 * ``'
 *
 * @namespace Neural
 * @see {@link ./neural/index.ts} - Neural system implementation
 * @since 1.0-alpha.43
 */
export * as Neural from '@claude-zen/intelligence';

/**
 * Optimization System - Performance optimization and resource management.
 *
 * Handles WASM optimization, neural model optimization, data flow optimization,
 * swarm performance tuning, and system resource management with real-time
 * monitoring and automatic adjustment.
 *
 * @example
 * ``'typescript
 * import { Optimization } from 'claude-code-zen';
 *
 * const monitor = new Optimization.OptimizationMonitor();
 * await monitor.startMonitoring();
 * const metrics = await monitor.getPerformanceMetrics();
 * ``'
 *
 * @namespace Optimization
 * @see {@link ./optimization/index.ts} - Optimization system implementation
 * @since 1.0-alpha.43
 */
export * as Optimization from '@claude-zen/operations';

/**
 * Workflow System - Advanced workflow execution and management engine.
 *
 * Provides sophisticated workflow orchestration with conditional logic,
 * parallel execution, error handling, rollback capabilities, and integration
 * with the broader Claude Code Zen ecosystem.
 *
 * @example
 * ``'typescript
 * import { Workflows } from 'claude-code-zen';
 *
 * const engine = new Workflows.WorkflowEngine(memorySystem);
 * const workflow = await engine.executeWorkflow(workflowDefinition);
 * const status = await engine.getWorkflowStatus(workflow.id);
 * ``'
 *
 * @namespace Workflows
 * @see {@link ./workflows/index.ts} - Workflow system implementation
 * @since 1.0-alpha.43
 */
export * as Workflows from '@claude-zen/enterprise';

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
 * ``'typescript
 * import { Interfaces } from 'claude-code-zen';
 *
 * const mcpServer = new Interfaces.MCP.HTTPMCPServer();
 * await mcpServer.start();
 *
 * const webServer = new Interfaces.Web.WebInterfaceServer();
 * await webServer.initialize();
 * ``'
 *
 * @namespace Interfaces
 * @see {@link ./interfaces/index.ts} - Interface system implementations
 * @since 1.0-alpha.43
 */
export * as Interfaces from './interfaces/index';

// =============================================================================
// SERVICE SYSTEMS
// =============================================================================

/**
 * Service Systems - Core business logic and domain services.
 *
 * Provides document management, project coordination, workflow services,
 * business intelligence, analytics, and all domain-specific business logic
 * that powers the Claude Code Zen platform.
 *
 * @example
 * ``'typescript
 * import { Services } from 'claude-code-zen';
 *
 * const docService = new Services.Document.DocumentService(database);
 * const projects = await docService.getAllProjects();
 * ``'
 *
 * @namespace Services
 * @see {@link ./services/index.ts} - Service implementations
 * @since 1.0-alpha.43
 */
export * as Services from './services/index';

// =============================================================================
// ENTITIES AND DATA MODELS
// =============================================================================

/**
 * Entities - Data models and business entities.
 *
 * Provides TypeScript interfaces and classes for all data models including
 * documents, projects, swarm configurations, neural models, optimization
 * settings, and all other domain entities.
 *
 * @example
 * ``'typescript
 * import { Entities } from 'claude-code-zen';
 *
 * const project: Entities.ProjectEntity = {
  *   id: 'proj-1',
  *   name: 'My'Project',
  *   satus: 'active'
 *
};
 * ``'
 *
 * @namespace Entities
 * @see {@link ./entities/index.ts} - Entity definitions
 * @since 1.0-alpha.43
 */
export * as Entities from './entities/index';

// =============================================================================
// INTEGRATION AND INTEROP
// =============================================================================

/**
 * Integration Systems - External system integration and interoperability.
 *
 * Provides integration with external services, APIs, third-party tools,
 * cloud platforms, and other systems through standardized interfaces
 * and adapters.
 *
 * @example
 * ``'typescript
 * import { Integration } from 'claude-code-zen';
 *
 * const coordinator = new Integration.MultiSystemCoordinator(logger, config);
 * await coordinator.initializeConnections();
 * ``'
 *
 * @namespace Integration
 * @see {@link ./integration/index.ts} - Integration implementations
 * @since 1.0-alpha.43
 */
export * as Integration from './integration/index';

// =============================================================================
// SYSTEM HEALTH AND MONITORING
// =============================================================================

/**
 * Monitoring and diagnostics for system health and performance tracking.
 *
 * @example
 * ``'typescript
 * import { Monitoring } from 'claude-code-zen';
 *
 * const healthCheck = await Monitoring.getSystemHealth();
 * const metrics = await Monitoring.getPerformanceMetrics();
 * ``'
 */
export * as Monitoring from '@claude-zen/operations';

// =============================================================================
// MAIN APPLICATION ENTRY POINTS
// =============================================================================

/**
 * Main application entry points for different execution modes.
 */
export { ClaudeZenCore } from './claude-zen-core';
export { ClaudeZenIntegrated } from './claude-zen-integrated';

// =============================================================================
// TYPE DEFINITIONS AND UTILITIES
// =============================================================================

/**
 * Comprehensive type definitions for the entire system.
 */
export type * from './types/index';

/**
 * Common utilities and helper functions.
 */
export * from './utils/index';

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * Legacy exports for backward compatibility.
 * @deprecated Use specific domain exports instead
 */
export { default as LegacyCoordinator } from './coordination/public-api';

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Module metadata and version information.
 */
export const MODULE_INFO = {
  name: 'claude-code-zen',
  versio: '2.0.0-alpha.73',
  description: 'Intelligent'software development coordination system',
  author: 'Claude'Code Zen Team',
  license: 'MIT',
  repository: https://github.com/zen-neural/claude-code-zen',
  exports: {
  core: ['Config',
  'Core',
  'Types',
  'Utils],
  domain: ['Coordination',
  'SPARC',
  'Database',
  'Memory',
  'Neural',
  'Optimization',
  'Workflows],
  interface: ['Interfaces],
  ervice: ['Services],
  entity: ['Entities],
  integration: ['Integration],
  moitoring: ['Monitoring],
  application: ['ClaudeZenCore',
  'ClaudeZenIntegrated]

}
} as const;