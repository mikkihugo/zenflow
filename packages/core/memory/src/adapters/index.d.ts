/**
 * @fileoverview Memory Adapters - Backend Implementation Components
 *
 * Barrel export for all backend adapter implementations.
 * Following TypeScript standards for clean package organization.
 */
export { BaseMemoryBackend } from './base-backend';
export { FoundationAdapter } from './foundation-adapter';
export { DatabaseBackedAdapter } from './database-backed-adapter';
export { MemoryBackendFactory } from './factory';
export { LanceDBBackend } from './lancedb-backend';
export type { BackendCapabilities, MemoryEntry } from './base-backend';
export type { DatabaseMemoryConfig } from './database-backed-adapter';
//# sourceMappingURL=index.d.ts.map