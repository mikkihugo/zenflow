/**
 * @file Parallel Workflow Manager - Core orchestration engine for multi-level flows
 *
 * Manages the coordination between Portfolio, Program, and Swarm Execution levels
 * with intelligent WIP limits, dependency management, and flow optimization.
 *
 * ARCHITECTURE:
 * - Portfolio Level: Strategic PRDs with business gates
 * - Program Level: Epic coordination with AI-human collaboration
 * - Swarm Execution Level: Feature implementation with SPARC automation
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { BottleneckInfo, MultiLevelOrchestratorState, OptimizationRecommendation, OrchestrationLevel, SystemPerformanceMetrics, WIPLimits } from './multi-level-types.ts';
/**
 * Configuration for the parallel workflow manager
 */
export interface ParallelWorkflowManagerConfig {
    readonly enableWIPLimits: boolean;
    readonly enableBottleneckDetection: boolean;
    readonly enableAutoOptimization: boolean;
    readonly enableMetricsCollection: boolean;
    readonly wipLimits: WIPLimits;
    readonly optimizationInterval: number;
    readonly metricsCollectionInterval: number;
    readonly maxConcurrentStreams: number;
    readonly streamTimeoutMinutes: number;
}
/**
 * Parallel Workflow Manager - Orchestrates multi-level workflow streams
 */
export declare class ParallelWorkflowManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly config;
    private state;
    private optimizationTimer?;
    private metricsTimer?;
    private performanceHistory;
    private optimizationRecommendations;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, config?: Partial<ParallelWorkflowManagerConfig>);
    /**
     * Initialize the parallel workflow manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the manager gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Create a new workflow stream
     */
    createStream<TWorkItem>(level: OrchestrationLevel, name: string, config: {
        wipLimit: number;
        parallelProcessing?: boolean;
        enableGates?: boolean;
        dependencies?: string[];
    }): Promise<string>;
    /**
     * Add work item to a stream
     */
    addWorkItem<TWorkItem>(streamId: string, workItem: TWorkItem): Promise<boolean>;
    /**
     * Process work items in a stream
     */
    processStream(streamId: string): Promise<void>;
    /**
     * Pause a stream
     */
    pauseStream(streamId: string, reason: string): Promise<boolean>;
    /**
     * Resume a paused stream
     */
    resumeStream(streamId: string): Promise<boolean>;
    /**
     * Add a cross-level dependency
     */
    addCrossLevelDependency(fromLevel: OrchestrationLevel, fromItemId: string, toLevel: OrchestrationLevel, toItemId: string, type: 'blocks' | 'enables' | 'informs', impact?: number): Promise<string>;
    /**
     * Resolve a dependency
     */
    resolveDependency(dependencyId: string): Promise<boolean>;
    /**
     * Block a dependency
     */
    blockDependency(dependencyId: string, reason: string): Promise<boolean>;
    /**
     * Check WIP limits for a stream
     */
    private checkWIPLimits;
    /**
     * Adjust WIP limits based on performance
     */
    adjustWIPLimits(recommendations: OptimizationRecommendation[]): Promise<void>;
    /**
     * Detect bottlenecks in the system
     */
    detectBottlenecks(): Promise<BottleneckInfo[]>;
    /**
     * Generate optimization recommendations
     */
    generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]>;
    /**
     * Calculate current system metrics
     */
    calculateSystemMetrics(): Promise<SystemPerformanceMetrics>;
    /**
     * Get current system status
     */
    getSystemStatus(): {
        state: MultiLevelOrchestratorState;
        metrics: SystemPerformanceMetrics | null;
        recommendations: OptimizationRecommendation[];
    };
    private initializeState;
    private setupEventHandlers;
    private loadPersistedState;
    private persistState;
    private startMetricsCollection;
    private startOptimization;
    private findStream;
    private updateStreamStatus;
    private emitStreamStatusEvent;
    private emitWIPLimitExceeded;
    private emitBottleneckDetected;
    private emitCrossLevelDependencyEvent;
    private generateStreamId;
    private generateDependencyId;
    private initializeStreamMetrics;
    private calculateTotalWIP;
    private calculateLevelWIP;
    private calculateOverallThroughput;
    private calculateLevelThroughput;
    private calculateAverageCycleTime;
    private calculateWIPUtilization;
    private calculateFlowEfficiency;
    private calculateHumanInterventionRate;
    private calculateAutomationRate;
    private calculateQualityScore;
    private detectLevelBottlenecks;
    private detectDependencyBottlenecks;
    private analyzeBottleneckForOptimization;
    private analyzeWIPUtilization;
    private analyzeFlowEfficiency;
    private applyOptimizationRecommendation;
    private startStreamProcessing;
    private processAvailableWorkItems;
    private waitForCapacity;
    private checkStreamDependencies;
    private checkBlockedStreams;
    private findAffectedStreams;
    private shutdownActiveStreams;
    private registerEventHandlers;
    private handleStreamStatusChanged;
    private handleWIPLimitExceeded;
    private handleBottleneckDetected;
}
export default ParallelWorkflowManager;
//# sourceMappingURL=parallel-workflow-manager.d.ts.map