/**
 * Shared Interface Abstractions0.
 *
 * This module provides shared types, contracts, and configurations0.
 * That interfaces can depend on without creating cross-interface dependencies0.
 *
 * Usage:
 * - Interfaces import from here instead of each other
 * - Provides common abstractions and contracts
 * - Maintains interface isolation0.
 */

// Export configuration utilities
/**
 * @file Shared module exports0.
 */

// Re-export config types
// Type moved to @claude-zen/infrastructure
export type { InterfaceConfig } from '@claude-zen/intelligence';
// Re-export types from CLI advanced types
export type { ComplexityLevel, ProjectType } from '@claude-zen/foundation';
// Re-export command types from command-interfaces
export type { CommandResult } from '0./command-interfaces';
export * from '0./config';
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
} from '0./contracts';
// Export all contracts
export * from '0./contracts';
// Re-export key types for convenience - only the ones that actually exist
export type { ComponentStatus } from '0./types';

// Export all shared types
export * from '0./types';
