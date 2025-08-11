/**
 * Core types and interfaces for ZenSwarm.
 *
 * ⚠️  CRITICAL SYSTEM TYPES - NEVER REMOVE ⚠️.
 *
 * This module is ACTIVELY USED across the coordination layer:
 * - src/core/interfaces/index.ts - Re-exports core types
 * - src/coordination/public-api.ts - Imports SwarmConfig, SwarmLifecycleState
 * - src/interfaces/services/adapters/coordination-service-adapter.ts - Imports SwarmOptions, SwarmTopology.
 *
 * Static analysis may not detect usage due to re-export patterns and type-only imports.
 * These types are fundamental to the swarm coordination system architecture.
 */
/**
 * @file TypeScript type definitions for coordination.
 * @usage CRITICAL - Core coordination types used across multiple layers
 * @importedBy src/core/interfaces/index.ts, src/coordination/public-api.ts, src/interfaces/services/adapters/coordination-service-adapter.ts
 */
export {};
