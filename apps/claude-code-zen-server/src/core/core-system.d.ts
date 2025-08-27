/**
 * @fileoverview Core System - Clean Architecture Implementation
 *
 * Temporary stub to fix compilation errors. The original file was corrupted
 * with extensive syntax errors. This provides basic functionality while
 * preserving the expected interface.
 */
import { EventEmitter } from '@claude-zen/foundation';
import { type TaskMasterService } from '../services/api/taskmaster';
export interface SystemConfig {
    memory?: {
        backend?: 'sqlite' | 'memory';
        directory?: string;
    };
    workflow?: {
        maxConcurrentWorkflows?: number;
    };
    documents?: {
        autoWatch?: boolean;
        enableWorkflows?: boolean;
    };
    export?: {
        defaultFormat?: string;
    };
    documentation?: {
        autoLink?: boolean;
        scanPaths?: string[];
    };
    interface?: {
        defaultMode?: 'auto' | 'cli' | 'web';
        webPort?: number;
    };
}
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
 * Simplified Core System stub to fix compilation.
 * TODO: Restore full functionality from corrupted original.
 */
export declare class System extends EventEmitter {
    private status;
    private startTime;
    private initialized;
    private configuration;
    private brainSystem?;
    private enterpriseSystem?;
    private taskMasterService?;
    constructor(config?: SystemConfig);
    private initializeComponents;
    private setupEventHandlers;
    initialize(): Promise<void>;
    launch(): Promise<void>;
    getSystemStatus(): Promise<SystemStatus>;
    processDocument(documentPath: string): Promise<{
        success: boolean;
        workflowIds?: string[];
        error?: string;
    }>;
    exportSystemData(format: string): Promise<{
        success: boolean;
        filename?: string;
        error?: string;
    }>;
    shutdown(): Promise<void>;
    getComponents(): {
        brain: unknown;
        enterprise: unknown;
        taskmaster: TaskMasterService;
    };
    private ensureInitialized;
    static create(config?: SystemConfig): Promise<System>;
    static quickStart(config?: SystemConfig): Promise<System>;
    runSystemChaosTest(): Promise<{
        success: boolean;
        results?: Record<string, unknown>;
        error?: string;
    }>;
    getAISystemStatus(): Promise<{
        chaosEngineering: boolean;
        factSystem: boolean;
        neuralML: boolean;
        agentMonitoring: boolean;
        overallHealth: 'healthy' | 'degraded' | 'unavailable';
    }>;
    createSAFeTask(taskData: {
        title: string;
        description?: string;
        priority: 'critical' | 'high' | 'medium' | 'low';
        estimatedEffort: number;
        assignedAgent?: string;
    }): Promise<unknown>;
    moveSAFeTask(taskId: string, toState: string): Promise<boolean>;
    getSAFeFlowMetrics(): Promise<unknown>;
    createPIPlanningEvent(eventData: {
        planningIntervalNumber: number;
        artId: string;
        startDate: Date;
        endDate: Date;
        facilitator: string;
    }): Promise<unknown>;
}
//# sourceMappingURL=core-system.d.ts.map