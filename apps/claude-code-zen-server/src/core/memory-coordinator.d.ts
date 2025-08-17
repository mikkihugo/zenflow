/**
 * Unified Memory System - DAL Integration.
 *
 * Integrates memory backend functionality using unified DAL
 * Supports all database types through consistent DAL interface.
 */
/**
 * @file Memory coordination system.
 */
import { EventEmitter } from 'node:events';
export type JSONValue = string | number | boolean | null | JSONValue[] | {
    [key: string]: JSONValue;
};
export interface StorageResult {
    id: string;
    timestamp: number;
    status: 'success' | 'error';
    error?: string;
}
export interface BackendStats {
    entries: number;
    size: number;
    lastModified: number;
    namespaces?: number;
}
export type BackendType = 'lancedb' | 'sqlite' | 'json' | 'kuzu';
export interface MemoryConfig {
    backend: BackendType;
    path: string;
    maxSize?: number;
    compression?: boolean;
    sqlite?: {
        walMode?: boolean;
        autoVacuum?: boolean;
    };
    lancedb?: {
        vectorDimension?: number;
        indexType?: string;
    };
    kuzu?: {
        bufferSize?: string;
        numThreads?: number;
    };
}
/**
 * Unified Memory System - Main Interface.
 *
 * @example
 */
export declare class MemorySystem extends EventEmitter {
    private backend;
    private config;
    private initialized;
    constructor(config: MemoryConfig);
    initialize(): Promise<void>;
    store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
    retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
    search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
    delete(key: string, namespace?: string): Promise<boolean>;
    listNamespaces(): Promise<string[]>;
    getStats(): Promise<BackendStats>;
    close(): Promise<void>;
    private ensureInitialized;
    storeDocument(type: string, id: string, document: unknown, namespace?: string): Promise<StorageResult>;
    retrieveDocument(type: string, id: string, namespace?: string): Promise<unknown>;
    searchDocuments(type: string, namespace?: string): Promise<Record<string, unknown>>;
    storeVision(id: string, vision: unknown): Promise<StorageResult>;
    storeADR(id: string, adr: unknown): Promise<StorageResult>;
    storePRD(id: string, prd: unknown): Promise<StorageResult>;
    storeEpic(id: string, epic: unknown): Promise<StorageResult>;
    storeFeature(id: string, feature: unknown): Promise<StorageResult>;
    storeTask(id: string, task: unknown): Promise<StorageResult>;
}
//# sourceMappingURL=memory-coordinator.d.ts.map