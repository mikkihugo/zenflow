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
export * from './config.ts';
// Export all contracts
export * from './contracts.ts';
// Export all shared types
export * from './types.ts';
