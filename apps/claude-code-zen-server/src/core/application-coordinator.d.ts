/**
 * @fileoverview Application Coordinator - System Orchestration
 *
 * Temporary stub to fix compilation errors. The original file was corrupted
 * with extensive syntax errors. This provides basic functionality while
 * preserving the expected interface.
 */
import { EventEmitter } from '@claude-zen/foundation';
export interface ApplicationCoordinatorConfig {
    memory?: {
        directory?: string;
        enableCache?: boolean;
        enableVectorStorage?: boolean;
    };
    workflow?: {
        maxConcurrentWorkflows?: number;
    };
    documentation?: {
        documentationPaths?: string[];
        codePaths?: string[];
        enableAutoLinking?: boolean;
    };
    export?: {
        defaultFormat?: string;
        outputPath?: string;
    };
    workspace?: {
        root?: string;
        autoDetect?: boolean;
    };
    interface?: {
        defaultMode?: 'auto' | 'cli' | 'web';
        webPort?: number;
        theme?: string;
        enableRealTime?: boolean;
    };
}
export interface SystemStatus {
    status: 'initializing' | 'ready' | 'error' | 'shutdown';
    version: string;
    components: {
        interface: {
            status: string;
            mode?: string;
        };
        memory: {
            status: string;
            sessions: number;
            size?: number;
        };
        workflow: {
            status: string;
            activeWorkflows: number;
        };
        export: {
            status: string;
            availableFormats?: number;
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
/**
 * Simplified Application Coordinator stub to fix compilation.
 * TODO: Restore full functionality from corrupted original.
 */
export declare class ApplicationCoordinator extends EventEmitter {
    private status;
    private startTime;
    private initialized;
    private activeWorkspaceId?;
    private configuration;
    constructor(config?: ApplicationCoordinatorConfig);
    private initializeComponents;
    private setupEventHandlers;
    initialize(): Promise<void>;
    launch(): Promise<void>;
    getSystemStatus(): SystemStatus;
    processDocument(documentPath: string): Promise<{
        success: boolean;
        workflowIds: string[];
        error?: string;
    }>;
    exportSystemData(format: string): Promise<{
        success: boolean;
        filename?: string;
        error?: string;
    }>;
    generateSystemReport(): Promise<string>;
    shutdown(): Promise<void>;
    getComponents(): {};
    private ensureInitialized;
    static create(config?: ApplicationCoordinatorConfig): Promise<ApplicationCoordinator>;
    static quickStart(config?: ApplicationCoordinatorConfig): Promise<ApplicationCoordinator>;
}
//# sourceMappingURL=application-coordinator.d.ts.map