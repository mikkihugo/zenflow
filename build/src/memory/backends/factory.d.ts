/**
 * Memory Backend Factory Pattern Implementation.
 *
 * Factory for creating and managing memory storage backends.
 * Supports multiple backend types with configuration-driven instantiation.
 */
/**
 * @file Memory management: factory.
 */
import type { BackendInterface } from '../core/memory-system.ts';
import type { MemoryConfig } from '../providers/memory-providers.ts';
import { BaseMemoryBackend } from './base-backend.ts';
export type MemoryBackendType = 'memory' | 'file' | 'sqlite' | 'jsonb';
export interface BackendCapabilities {
    persistent: boolean;
    searchable: boolean;
    transactional: boolean;
    concurrent: boolean;
    compression: boolean;
    encryption: boolean;
}
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
    createBackend(type: MemoryBackendType, config?: Partial<MemoryConfig>, instanceId?: string): Promise<BaseMemoryBackend & BackendInterface>;
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
    registerBackend(type: MemoryBackendType, loader: () => Promise<typeof BaseMemoryBackend>): void;
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
    static createBackend(type: MemoryBackendType, config?: Partial<MemoryConfig>): Promise<BaseMemoryBackend>;
    /**
     * Health check all active backends.
     */
    healthCheckAll(): Promise<Record<string, any>>;
    private registerDefaultBackends;
    private getBackendClass;
    private mergeConfig;
    private detectOptimalBackend;
    private loadMemoryBackend;
    private loadFileBackend;
    private loadSQLiteBackend;
    private loadJSONBBackend;
}
export declare const memoryBackendFactory: MemoryBackendFactory;
export default MemoryBackendFactory;
//# sourceMappingURL=factory.d.ts.map