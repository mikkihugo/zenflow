/**
 * Shared Interface Abstractions
 *
 * This module provides shared types, contracts, and configurations
 * that interfaces can depend on without creating cross-interface dependencies.
 *
 * Usage:
 * - Interfaces import from here instead of each other
 * - Provides common abstractions and contracts
 * - Maintains interface isolation
 */

// Export all shared types
export * from './types.js';

// Export all contracts
export * from './contracts.js';

// Export configuration utilities
export * from './config.js';

// Re-export key types for convenience
export type {
  ProjectType,
  ComplexityLevel,
  ProjectConfig,
  CommandResult,
  CommandContext,
  InterfaceConfig,
  SystemHealth,
  ComponentStatus,
} from './types.js';

export type {
  ProjectManagerContract,
  CommandExecutorContract,
  SwarmCoordinatorContract,
  SystemMonitorContract,
  DataServiceContract,
  ConfigurationContract,
} from './contracts.js';