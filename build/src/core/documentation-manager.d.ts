/**
 * Documentation Manager - Documentation Indexing and Linking.
 *
 * Clean, focused documentation manager that handles documentation indexing and linking.
 * Without bloated "unified" architecture..
 *
 * @example
 * ```typescript
 * const docManager = new DocumentationManager(memorySystem, {
 *   autoLink: true,
 *   scanPaths: ['./docs', './src']
 * });
 *
 * await docManager.initialize();
 * await docManager.indexDocument(document);
 * ```
 */
/**
 * @file Documentation management system.
 */
import { EventEmitter } from 'node:events';
import type { MemorySystem } from '../memory/memory-system';
/**
 * Documentation manager configuration.
 *
 * @example
 */
export interface DocumentationManagerConfig {
    /** Enable automatic linking */
    autoLink?: boolean;
    /** Paths to scan for documentation */
    scanPaths?: string[];
    /** Maximum scan depth */
    maxDepth?: number;
}
/**
 * Documentation statistics.
 *
 * @example
 */
export interface DocumentationStats {
    /** Number of indexed documents */
    indexedDocuments: number;
    /** Number of identified links */
    totalLinks: number;
    /** Number of broken links */
    brokenLinks: number;
}
/**
 * Clean documentation manager for indexing and linking.
 *
 * @example
 */
export declare class DocumentationManager extends EventEmitter {
    private memory;
    private config;
    private stats;
    private initialized;
    constructor(memory: MemorySystem, config?: DocumentationManagerConfig);
    initialize(): Promise<void>;
    indexDocument(document: any): Promise<void>;
    scanDocumentation(): Promise<void>;
    getDocumentationIndex(): Map<string, any>;
    generateDocumentationReport(): Promise<string>;
    getStats(): Promise<DocumentationStats>;
    shutdown(): Promise<void>;
    private ensureInitialized;
}
//# sourceMappingURL=documentation-manager.d.ts.map