/**
 * Memory Backend Factory - UPDATED TO USE DATABASE PACKAGE
 *
 * Factory for creating memory backends that properly use the database package.
 * This follows correct architecture where memory depends on database.
 */
import type { BackendInterface } from '../core/memory-system';
import type { MemoryConfig } from '../types';
import { type BackendCapabilities, BaseMemoryBackend } from './base-backend';
import {
  DatabaseBackedAdapter,
  type DatabaseMemoryConfig,
} from './database-backed-adapter';
export type MemoryBackendType = 'sqlite' | ' json' | ' lancedb' | ' memory';
/**
 * Memory Backend Factory Class.
 *
 * Provides centralized creation and management of memory storage backends.
 *
 * @example
 */
export declare class MemoryBackendFactory {
  private static instance;
  private backends;
  private defaultConfig;
  private constructor();
  /**
   * Get singleton instance.
   */
  static getInstance(): MemoryBackendFactory;
  /**
   * Create a memory backend instance.
   *
   * @param type
   * @param config
   * @param instanceId
   */
  createBackend(
    type: MemoryBackendType,
    config?: Partial<MemoryConfig>,
    instanceId?: string
  ): Promise<BaseMemoryBackend & BackendInterface>;
  /**
   * Create a database-backed memory adapter (RECOMMENDED APPROACH)
   * Uses the database package correctly following architectural principles
   */
  createDatabaseBackend(
    config: DatabaseMemoryConfig,
    instanceId?: string
  ): Promise<DatabaseBackedAdapter>;
  /**
   * Get existing backend instance.
   *
   * @param instanceId
   */
  getBackend(instanceId: string): BaseMemoryBackend | null;
  /**
   * List all active backend instances.
   */
  listBackends(): Array<{
    id: string;
    type: string;
    config: MemoryConfig;
  }>;
  /**
   * Close and cleanup a backend instance.
   *
   * @param instanceId
   */
  closeBackend(instanceId: string): Promise<boolean>;
  /**
   * Close all backend instances.
   */
  closeAllBackends(): Promise<void>;
  /**
   * Get backend capabilities.
   *
   * @param type
   */
  getBackendCapabilities(type: MemoryBackendType): Promise<BackendCapabilities>;
  /**
   * Register a custom backend type.
   *
   * @param type
   * @param loader
   */
  registerBackend(
    type: MemoryBackendType,
    loader: () => Promise<new (config: MemoryConfig) => BaseMemoryBackend>
  ): void;
  /**
   * Check if backend type is supported.
   *
   * @param type
   */
  isBackendSupported(type: MemoryBackendType): boolean;
  /**
   * Get all supported backend types.
   */
  getSupportedBackends(): MemoryBackendType[];
  /**
   * Create backend with auto-detection based on config.
   *
   * @param config
   */
  createAutoBackend(config?: Partial<MemoryConfig>): Promise<BaseMemoryBackend>;
  /**
   * Static method for compatibility with existing code.
   *
   * @param type
   * @param config
   */
  static createBackend(
    type: MemoryBackendType,
    config?: Partial<MemoryConfig>
  ): Promise<BaseMemoryBackend>;
  /**
   * Health check all active backends.
   */
  healthCheckAll(): Promise<Record<string, unknown>>;
  private registerDefaultBackends;
  private getBackendClass;
  private mergeConfig;
  private detectOptimalBackend;
  private loadMemoryBackend;
  private loadSQLiteBackend;
  private loadJSONBBackend;
  private loadLanceDBBackend;
}
export declare const memoryBackendFactory: MemoryBackendFactory;
export default MemoryBackendFactory;
//# sourceMappingURL=factory.d.ts.map
