/**
 * Shared Interface Abstractions.
 *
 * This module provides shared types, contracts, and configurations.
 * that interfaces can depend on without creating cross-interface dependencies.
 *
 * Usage:
 * - Interfaces import from here instead of each other
 * - Provides common abstractions and contracts
 * - Maintains interface isolation
 */

// Export configuration utilities
/**
 * @file shared module exports.
 */


export * from './config';
export type {
  CommandExecutorContract,
  ConfigurationContract,
  DataServiceContract,
  ProjectManagerContract,
  SwarmCoordinatorContract,
  SystemMonitorContract,
} from './contracts';
// Export all contracts
export * from './contracts';

// Re-export key types for convenience
export type {
  CommandContext,
  CommandResult,
  ComplexityLevel,
  ComponentStatus,
  InterfaceConfig,
  ProjectConfig,
  ProjectType,
  SystemHealth,
} from './types';
// Export all shared types
export * from './types';
