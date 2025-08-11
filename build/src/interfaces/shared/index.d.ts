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
/**
 * @file Shared module exports.
 */
export type { InterfaceConfig } from '../../config/types.ts';
export type { ComplexityLevel, ProjectType, } from '../cli/types/advanced-cli-types.ts';
export type { CommandResult } from './command-interfaces.ts';
export * from './config.ts';
export type { CommandContext, CommandExecutorContract, ConfigurationContract, DataServiceContract, ProjectConfig, ProjectManagerContract, SwarmCoordinatorContract, SystemHealth, SystemMonitorContract, } from './contracts.ts';
export * from './contracts.ts';
export type { ComponentStatus } from './types.ts';
export * from './types.ts';
//# sourceMappingURL=index.d.ts.map