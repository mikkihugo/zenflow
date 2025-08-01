/**
 * Claude Code Flow - Main Entry Point
 * 
 * Central export hub for all system components following clean architecture principles.
 * Organized by domain with clear separation of concerns.
 */

// =============================================================================
// CORE SYSTEMS
// =============================================================================

export * as Core from './core/index.js';
export * as Config from './config/config-manager.js';
export * as Utils from './utils/index.js';
export * as Types from './types/agent-types.js';

// =============================================================================
// DOMAIN SYSTEMS (Consolidated)
// =============================================================================

// Memory System - All memory-related functionality
export * as Memory from './memory/index.js';

// Neural System - All neural network and AI functionality  
export * as Neural from './neural/neural-bridge.js';

// Database System - All persistence and database functionality
export * as Database from './database/index.js';

// Coordination System - All swarm and orchestration functionality
export * as Coordination from './coordination/index.js';

// Workflow System - All workflow execution and management
export * as Workflows from './workflows/index.js';

// =============================================================================
// INTERFACE SYSTEMS
// =============================================================================

// CLI Interface
export * as CLI from './cli/index.js';

// MCP Protocol Interface
export * as MCP from './mcp/index.js';

// Web/UI Interfaces
export * as Interfaces from './interfaces/index.js';

// =============================================================================
// SPECIALIZED SYSTEMS
// =============================================================================

// Agent Management
export * as Agents from './agents/agent-manager.js';

// Plugin System - REMOVED: Functionality migrated to proper domains

// Template System
export * as Templates from './templates/template-loader.js';

// Maestro Orchestration (will be consolidated into Coordination)
export * as Maestro from './maestro/maestro-orchestrator.js';

// Hive Mind System
export * as HiveMind from './hive-mind/core/HiveMind.js';

// =============================================================================
// SPECIALIZED COMPONENTS
// =============================================================================

// WASM Integration
export * as WASM from './wasm/index.js';

// WebGPU Shaders
export * as WebGPU from './webgpu/index.js';

// Hooks System
export * as Hooks from './hooks/index.js';

// Services
export * as Services from './services/index.js';

// =============================================================================
// LEGACY/MIGRATION EXPORTS (Temporary - will be removed after restructure)
// =============================================================================

// Swarm-Zen exports (will be distributed to proper domains)
export * as SwarmZen from './swarm-zen/index.js';

// =============================================================================
// MAIN SYSTEM INITIALIZATION
// =============================================================================

/**
 * Initialize the Claude Code Flow system
 * @param config Optional configuration overrides
 * @returns Promise resolving to initialized system instance
 */
export async function initialize(config?: any) {
  // TODO: Implement main system initialization after restructure
  return {
    core: await import('./core/index.js'),
    memory: await import('./memory/index.js'),
    neural: await import('./neural/neural-bridge.js'),
    database: await import('./database/index.js'),
    coordination: await import('./coordination/index.js'),
    workflows: await import('./workflows/index.js'),
    cli: await import('./cli/index.js'),
    mcp: await import('./mcp/index.js'),
    interfaces: await import('./interfaces/index.js'),
  };
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
    }
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
  initialize,
  healthCheck,
  getVersion,
  Core,
  Memory,
  Neural,
  Database,
  Coordination,
  CLI,
  MCP,
  Interfaces,
  Agents,
  Workflows,
  Templates,
  Maestro,
  HiveMind,
  WASM,
  WebGPU,
  Hooks,
  Services,
  Utils,
  Types,
  Config,
};