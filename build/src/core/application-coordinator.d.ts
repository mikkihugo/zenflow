/**
 * Application Coordinator - Main Integration Hub.
 *
 * Brings together all core systems without plugin architecture:
 * - Interface Launcher (CLI/TUI/Web)
 * - Memory System (existing)
 * - Workflow Engine
 * - Export Manager
 * - Documentation Linker.
 * - Document-Driven System.
 *
 * Supports the hive document workflow: Vision → ADRs → PRDs → Epics → Features → Tasks → Code.
 */
/**
 * @file Application coordination system.
 */
import { EventEmitter } from 'node:events';
import { MemoryManager } from '../memory/index.ts';
import { DocumentDrivenSystem } from './document-driven-system.ts';
import { DocumentationLinker } from './documentation-linker.ts';
import { ExportSystem as ExportManager } from './export-manager.ts';
import { MemorySystem } from './memory-system.ts';
import { WorkflowEngine } from './workflow-engine.ts';
export interface ApplicationCoordinatorConfig {
    interface?: {
        defaultMode?: 'auto' | 'cli' | 'tui' | 'web';
        webPort?: number;
        enableRealTime?: boolean;
        theme?: 'dark' | 'light';
    };
    memory?: {
        directory?: string;
        namespace?: string;
        enableCache?: boolean;
        enableVectorStorage?: boolean;
    };
    workflow?: {
        maxConcurrentWorkflows?: number;
        persistWorkflows?: boolean;
        enableVisualization?: boolean;
    };
    export?: {
        defaultFormat?: string;
        outputPath?: string;
        enableCompression?: boolean;
    };
    documentation?: {
        documentationPaths?: string[];
        codePaths?: string[];
        enableAutoLinking?: boolean;
    };
    workspace?: {
        root?: string;
        autoDetect?: boolean;
        enableWatching?: boolean;
    };
}
export interface SystemStatus {
    status: 'initializing' | 'ready' | 'error' | 'shutdown';
    version: string;
    components: {
        interface: {
            status: string;
            mode?: string;
            url?: string;
        };
        memory: {
            status: string;
            sessions: number;
            size: number;
        };
        workflow: {
            status: string;
            activeWorkflows: number;
        };
        export: {
            status: string;
            availableFormats: number;
        };
        documentation: {
            status: string;
            documentsIndexed: number;
        };
        workspace: {
            status: string;
            workspaceId?: string;
            documentsLoaded: number;
        };
    };
    uptime: number;
    lastUpdate: string;
}
export declare class ApplicationCoordinator extends EventEmitter {
    private config;
    private status;
    private startTime;
    private interfaceLauncher;
    private documentSystem;
    private workflowEngine;
    private exportSystem;
    private documentationLinker;
    private memorySystem;
    private memoryManager;
    private activeWorkspaceId?;
    private initialized;
    constructor(config?: ApplicationCoordinatorConfig);
    /**
     * Initialize all core components.
     */
    private initializeComponents;
    /**
     * Setup event handlers for component communication.
     */
    private setupEventHandlers;
    /**
     * Initialize the entire unified system.
     */
    initialize(): Promise<void>;
    /**
     * Launch the interface (CLI/TUI/Web based on config and environment).
     */
    launch(): Promise<void>;
    /**
     * Get comprehensive system status.
     */
    getSystemStatus(): Promise<SystemStatus>;
    /**
     * Process a document through the entire workflow.
     *
     * @param documentPath
     */
    processDocument(documentPath: string): Promise<{
        success: boolean;
        workflowIds: string[];
        error?: string;
    }>;
    /**
     * Export system data in specified format.
     *
     * @param format
     * @param options
     */
    exportSystemData(format: string, options?: any): Promise<{
        success: boolean;
        filename?: string;
        error?: string;
    }>;
    /**
     * Generate comprehensive system report.
     */
    generateSystemReport(): Promise<string>;
    /**
     * Shutdown the entire system gracefully.
     */
    shutdown(): Promise<void>;
    /**
     * Get access to core components (for interface integration).
     */
    getComponents(): {
        memory: MemorySystem;
        memoryManager: MemoryManager;
        workflow: WorkflowEngine;
        export: ExportManager;
        documentation: DocumentationLinker;
        documentSystem: DocumentDrivenSystem;
    };
    /**
     * Utility methods.
     */
    private detectWorkspaceRoot;
    private ensureInitialized;
    /**
     * Static factory method for easy initialization.
     *
     * @param config
     */
    static create(config?: ApplicationCoordinatorConfig): Promise<ApplicationCoordinator>;
    /**
     * Quick start method that initializes and launches.
     *
     * @param config
     */
    static quickStart(config?: ApplicationCoordinatorConfig): Promise<ApplicationCoordinator>;
}
//# sourceMappingURL=application-coordinator.d.ts.map