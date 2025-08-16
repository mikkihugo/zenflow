/**
 * Memory System - Multi-Backend Memory Management.
 *
 * Clean, focused memory system with support for multiple backends.
 * Without bloated "unified" architecture. Supports LanceDB, SQLite, and JSON backends..
 *
 * @example
 * ```typescript
 * const memorySystem = new MemorySystem({
 *   backend: 'sqlite',
 *   path: './data/memory'
 * });
 *
 * await memorySystem.initialize();
 * await memorySystem.store('key', { data: 'value' });
 * const data = await memorySystem.retrieve('key');
 * ```
 */
/**
 * @file Memory-system implementation.
 */
import { EventEmitter } from 'node:events';
/**
 * JSON-serializable value type.
 */
export type JSONValue = string | number | boolean | null | JSONValue[] | {
    [key: string]: JSONValue;
};
/**
 * Storage operation result.
 *
 * @example
 */
export interface StorageResult {
    /** Unique identifier for the stored item */
    id: string;
    /** Timestamp when stored */
    timestamp: number;
    /** Operation status */
    status: 'success' | 'error';
    /** Error message if failed */
    error?: string;
}
/**
 * Backend statistics.
 *
 * @example
 */
export interface BackendStats {
    /** Number of entries */
    entries: number;
    /** Total size in bytes */
    size: number;
    /** Last modified timestamp */
    lastModified: number;
    /** Number of namespaces */
    namespaces?: number;
}
/**
 * Supported backend types.
 */
export type BackendType = 'lancedb' | 'sqlite' | 'json';
/**
 * Memory system configuration.
 *
 * @example
 */
export interface MemoryConfig {
    /** Backend type */
    backend: BackendType;
    /** Storage path */
    path: string;
    /** Maximum storage size in bytes */
    maxSize?: number;
    /** Enable compression */
    compression?: boolean;
    /** Backend-specific configuration */
    backendConfig?: Record<string, unknown>;
}
/**
 * Backend interface for storage implementations.
 *
 * @example
 */
export interface BackendInterface {
    /** Initialize the backend */
    initialize(): Promise<void>;
    /** Store a value */
    store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
    /** Retrieve a value */
    retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
    /** Search for values */
    search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
    /** Delete a value */
    delete(key: string, namespace?: string): Promise<boolean>;
    /** List all namespaces */
    listNamespaces(): Promise<string[]>;
    /** Get backend statistics */
    getStats(): Promise<BackendStats>;
    /** Close the backend */
    close?(): Promise<void>;
}
/**
 * Clean, focused memory system with multi-backend support.
 *
 * @example
 */
export declare class MemorySystem extends EventEmitter {
    private backend;
    private config;
    private initialized;
    /**
     * Create a new memory system.
     *
     * @param config - Memory system configuration.
     */
    constructor(config: MemoryConfig);
    /**
     * Initialize the memory system.
     */
    initialize(): Promise<void>;
    /**
     * Store a value in memory.
     *
     * @param key - Storage key.
     * @param value - Value to store.
     * @param namespace - Optional namespace.
     * @returns Storage result.
     */
    store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
    /**
     * Retrieve a value from memory.
     *
     * @param key - Storage key.
     * @param namespace - Optional namespace.
     * @returns Stored value or null if not found.
     */
    retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
    /**
     * Search for values matching a pattern.
     *
     * @param pattern - Search pattern (supports wildcards).
     * @param namespace - Optional namespace.
     * @returns Record of matching key-value pairs.
     */
    search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
    /**
     * Delete a value from memory.
     *
     * @param key - Storage key.
     * @param namespace - Optional namespace.
     * @returns True if deleted, false if not found.
     */
    delete(key: string, namespace?: string): Promise<boolean>;
    /**
     * List all namespaces.
     *
     * @returns Array of namespace names.
     */
    listNamespaces(): Promise<string[]>;
    /**
     * Get memory system statistics.
     *
     * @returns Backend statistics.
     */
    getStats(): Promise<BackendStats>;
    /**
     * Shutdown the memory system.
     */
    shutdown(): Promise<void>;
    /**
     * Ensure the system is initialized.
     */
    private ensureInitialized;
    /**
     * Store a document in the documents namespace.
     *
     * @param type - Document type.
     * @param id - Document ID.
     * @param document - Document data.
     * @returns Storage result.
     */
    storeDocument(type: string, id: string, document: unknown): Promise<StorageResult>;
    /**
     * Retrieve a document from the documents namespace.
     *
     * @param type - Document type.
     * @param id - Document ID.
     * @returns Document data or null.
     */
    retrieveDocument(type: string, id: string): Promise<unknown>;
    /**
     * Search for documents by type.
     *
     * @param type - Document type.
     * @returns Record of matching documents.
     */
    searchDocuments(type: string): Promise<Record<string, unknown>>;
    /**
     * Store workflow data in the workflows namespace.
     *
     * @param workflowId - Workflow ID.
     * @param workflow - Workflow data.
     * @returns Storage result.
     */
    storeWorkflow(workflowId: string, workflow: unknown): Promise<StorageResult>;
    /**
     * Retrieve workflow data from the workflows namespace.
     *
     * @param workflowId - Workflow ID.
     * @returns Workflow data or null.
     */
    retrieveWorkflow(workflowId: string): Promise<unknown>;
    /**
     * Search for workflows.
     *
     * @param pattern - Search pattern.
     * @returns Record of matching workflows.
     */
    searchWorkflows(pattern?: string): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=memory-system.d.ts.map