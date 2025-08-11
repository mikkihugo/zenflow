/**
 * Shared Interface Abstractions.
 *
 * This module provides shared types, contracts, and configurations.
 * That interfaces can depend on without creating cross-interface dependencies.
 *
 * Usage:
 * - Interfaces import from here instead of each other
 * - Provides common abstractions and contracts
 * - Maintains interface isolation.
 */

// Export configuration utilities
/**
 * @file Shared module exports.
 */

// Re-export config types
export type { InterfaceConfig } from '../../config/types.ts';
// Re-export types from CLI advanced types
export type {
  ComplexityLevel,
  ProjectType,
} from '../cli/types/advanced-cli-types.ts';
// Re-export command types from command-interfaces
export type { CommandResult } from './command-interfaces.ts';
export * from './config.ts';
export type {
  // Export the types defined in contracts
  CommandContext,
  CommandExecutorContract,
  ConfigurationContract,
  DataServiceContract,
  ProjectConfig,
  ProjectManagerContract,
  SwarmCoordinatorContract,
  SystemHealth,
  SystemMonitorContract,
} from './contracts.ts';
// Export all contracts
export * from './contracts.ts';
// Re-export key types for convenience - only the ones that actually exist
export type { ComponentStatus } from './types.ts';

// Export all shared types
export * from './types.ts';
