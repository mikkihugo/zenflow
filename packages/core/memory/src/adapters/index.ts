/**
 * @fileoverview Memory Adapters - Backend Implementation Components
 *
 * Barrel export for all backend adapter implementations.
 * Following TypeScript standards for clean package organization.
 */

// Core adapters
export { BaseMemoryBackend } from './base-backend';
export { FoundationAdapter } from './foundation-adapter';

// NEW:Database-backed adapter (RECOMMENDED - follows correct architecture)
export { DatabaseBackedAdapter } from './database-backed-adapter';

// Factory
export { MemoryBackendFactory } from './factory';

// LEGACY - DEPRECATED:Use DatabaseBackedAdapter instead
// Legacy adapters violate architecture - they implement database functionality directly
// instead of using the database package
export { LanceDBBackend } from './lancedb-backend';

export type { BackendCapabilities, MemoryEntry } from './base-backend';

export type { DatabaseMemoryConfig } from './database-backed-adapter';
