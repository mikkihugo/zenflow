/**
 * Core System - Main System Coordinator.
 *
 * Clean, focused system coordinator that manages core components without bloated "unified" architecture.
 * Follows single responsibility principle and provides a clean dependency injection model.
 *
 * ## Architecture Overview
 *
 * The CoreSystem replaces the bloated ApplicationCoordinator with a clean, focused architecture:
 * - **MemorySystem**: Multi-backend memory management (JSON, SQLite, LanceDB)
 * - **WorkflowEngine**: Document workflow processing (Vision → ADRs → PRDs → Epics → Features → Tasks → Code)
 * - **DocumentProcessor**: Unified document processing (consolidates file-based and database-driven)
 * - **ExportManager**: Data export in multiple formats
 * - **DocumentationManager**: Documentation indexing and linking.
 * - **InterfaceManager**: Multi-interface support (CLI, TUI, Web).
 *
 * ## Key Improvements
 *
 * 1. **Single Responsibility**: Each component has a clear, focused purpose
 * 2. **Clean Dependencies**: Explicit dependency injection without circular imports
 * 3. **Better Separation**: Clear boundaries between systems
 * 4. **Easier Testing**: Components can be tested in isolation
 * 5. **Maintainable**: No more bloated "unified" classes.
 *
 * ## Migration Guide
 *
 * **Old (ApplicationCoordinator):**.
 * ```typescript
 * const system = new ApplicationCoordinator(config);
 * await system.initialize();
 * await system.launch();
 * ```
 *
 * **New (CoreSystem):**
 * ```typescript
 * const system = new CoreSystem(config);
 * await system.initialize();
 * await system.launch();
 * ```
 *
 * The API is compatible, but the internal architecture is much cleaner.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const coreSystem = new CoreSystem({
 *   memory: { backend: 'sqlite', directory: './data' },
 *   workflow: { maxConcurrentWorkflows: 10 },
 *   interface: { defaultMode: 'web', webPort: 3000 }
 * });
 *
 * await coreSystem.initialize();
 * await coreSystem.launch();
 *
 * // Process a document
 * await coreSystem.processDocument('./docs/vision/product-vision.md');
 *
 * // Get system status
 * const status = await coreSystem.getSystemStatus();
 * console.log(`System status: ${status.status}`);
 *
 * // Access individual components
 * const components = coreSystem.getComponents();
 * await components.memory.store('key', { data: 'value' });
 * ```
 * @since 2.0.0-clean-architecture
 */
/**
 * @file Core-system implementation.
 */
import { EventEmitter } from 'node:events';
import { DocumentProcessor } from './document-processor.ts';
import { DocumentationManager } from './documentation-manager.ts';
import { ExportSystem as ExportManager } from './export-manager.ts';
import { InterfaceManager } from './interface-manager.ts';
import { MemorySystem } from './memory-system.ts';
import { WorkflowEngine } from './workflow-engine.ts';
interface ExportOptions {
    filename?: string;
    compression?: boolean;
    includeMetrics?: boolean;
    includeMemoryData?: boolean;
    [key: string]: unknown;
}
/**
 * Core system configuration with clear, focused options.
 *
 * @example
 */
export interface SystemConfig {
    memory?: {
        backend?: 'lancedb' | 'sqlite' | 'json';
        directory?: string;
        namespace?: string;
    };
    workflow?: {
        maxConcurrentWorkflows?: number;
        persistWorkflows?: boolean;
    };
    interface?: {
        defaultMode?: 'auto' | 'cli' | 'tui' | 'web';
        webPort?: number;
    };
    documents?: {
        autoWatch?: boolean;
        enableWorkflows?: boolean;
    };
    export?: {
        defaultFormat?: string;
        outputPath?: string;
    };
    documentation?: {
        autoLink?: boolean;
        scanPaths?: string[];
    };
}
/**
 * System status with clear component boundaries.
 *
 * @example
 */
export interface SystemStatus {
    status: 'initializing' | 'ready' | 'error' | 'shutdown';
    version: string;
    components: {
        memory: {
            status: string;
            entries: number;
        };
        workflow: {
            status: string;
            active: number;
        };
        documents: {
            status: string;
            loaded: number;
        };
        export: {
            status: string;
            formats: number;
        };
        documentation: {
            status: string;
            indexed: number;
        };
        interface: {
            status: string;
            mode?: string;
        };
    };
    uptime: number;
    lastUpdate: string;
}
/**
 * Clean, focused core system without bloated "unified" architecture.
 *
 * @example
 */
export declare class System extends EventEmitter {
    private config;
    private status;
    private startTime;
    private memorySystem;
    private workflowEngine;
    private documentProcessor;
    private exportManager;
    private documentationManager;
    private interfaceManager;
    private initialized;
    constructor(config?: SystemConfig);
    /**
     * Initialize all core components with proper dependency injection.
     */
    private initializeComponents;
    /**
     * Setup event handlers for component communication.
     */
    private setupEventHandlers;
    /**
     * Initialize the entire system.
     */
    initialize(): Promise<void>;
    /**
     * Launch the interface.
     */
    launch(): Promise<void>;
    /**
     * Get comprehensive system status.
     */
    getSystemStatus(): Promise<SystemStatus>;
    /**
     * Process a document through the system.
     *
     * @param documentPath
     */
    processDocument(documentPath: string): Promise<{
        success: boolean;
        workflowIds?: string[];
        error?: string;
    }>;
    /**
     * Export system data.
     *
     * @param format
     * @param options
     */
    exportSystemData(format: string, options?: ExportOptions): Promise<{
        success: boolean;
        filename?: string;
        error?: string;
    }>;
    /**
     * Shutdown the system gracefully.
     */
    shutdown(): Promise<void>;
    /**
     * Get access to core components (for interface integration).
     */
    getComponents(): {
        memory: MemorySystem;
        workflow: WorkflowEngine;
        documents: DocumentProcessor;
        export: ExportManager;
        documentation: DocumentationManager;
        interface: InterfaceManager;
    };
    /**
     * Utility methods.
     */
    private ensureInitialized;
    /**
     * Static factory method for easy initialization.
     *
     * @param config
     */
    static create(config?: SystemConfig): Promise<System>;
    /**
     * Quick start method that initializes and launches.
     *
     * @param config
     */
    static quickStart(config?: SystemConfig): Promise<System>;
}
export {};
//# sourceMappingURL=core-system.d.ts.map