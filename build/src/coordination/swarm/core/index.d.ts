/**
 * @file Core module exports.
 */
/**
 * 🚀 ULTIMATE ZenSwarm Implementation - FULLY INTEGRATED.
 *
 * Advanced swarm orchestration with:
 * - WASM-accelerated neural networks
 * - Cognitive diversity and pattern evolution
 * - Progressive loading and memory optimization
 * - Full persistence with coordination DAO
 * - Enterprise-grade session management
 * - Real-time performance monitoring
 * - Chaos engineering and fault tolerance.
 */
import type { SessionCoordinationDao } from '../../../database';
import { WasmModuleLoader } from '../../../neural/wasm/wasm-loader.ts';
import type { AgentConfig, Message, SwarmEvent, SwarmEventEmitter, SwarmMetrics, SwarmOptions, Task, TaskStatus } from './types.ts';
export * from '../../../neural/core/neural-network-manager.ts';
export * from '../../../neural/wasm/wasm-loader2.ts';
export * from '../../agents/agent.ts';
export * from '../mcp/mcp-daa-tools.ts';
export { ZenSwarm as BaseZenSwarm } from './base-swarm.ts';
export * from './errors.ts';
export * from './hooks';
export * from './logger.ts';
export * from './logging-config.ts';
export * from './monitoring-dashboard.ts';
export * from './performance.ts';
export * from './performance-benchmarks.ts';
export * from './recovery-integration.ts';
export * from './recovery-workflows.ts';
export * from './schemas.ts';
export * from './session-integration.ts';
export * from './session-manager.ts';
export * from './session-utils.ts';
export * from './singleton-container.ts';
export { TopologyManager } from './topology-manager.ts';
export * from './types.ts';
export * from './utils.ts';
/**
 * Enhanced Agent class with neural capabilities and cognitive patterns.
 *
 * @example
 */
export declare class Agent {
    id: string;
    type: string;
    config: any;
    isActive: boolean;
    neuralNetworkId: string | undefined;
    cognitivePattern: string;
    capabilities: string[];
    status: 'idle' | 'active' | 'busy';
    state: {
        status: 'idle' | 'active' | 'busy';
    };
    constructor(config?: any);
    initialize(): Promise<boolean>;
    execute(task: any): Promise<any>;
    updateStatus(newStatus: 'idle' | 'active' | 'busy'): Promise<void>;
    cleanup(): Promise<boolean>;
    communicate(_message: Message): Promise<void>;
}
/**
 * 🚀 ULTIMATE ZenSwarm - The definitive swarm orchestration system.
 *
 * @example
 */
export declare class ZenSwarm implements SwarmEventEmitter {
    protected options: Required<SwarmOptions>;
    private state;
    private agentPool;
    private eventHandlers;
    private swarmId?;
    private isInitialized;
    private wasmModule?;
    wasmLoader: WasmModuleLoader;
    persistence: SessionCoordinationDao | null;
    activeSwarms: Map<string, SwarmWrapper>;
    private globalAgents;
    metrics: {
        totalSwarms: number;
        totalAgents: number;
        totalTasks: number;
        memoryUsage: number;
        performance: Record<string, any>;
    };
    features: {
        neural_networks: boolean;
        forecasting: boolean;
        cognitive_diversity: boolean;
        simd_support: boolean;
    };
    constructor(options?: SwarmOptions);
    /**
     * Initialize the swarm with WASM module.
     */
    init(): Promise<void>;
    /**
     * Static factory method for easy initialization.
     *
     * @param options
     */
    static create(options?: SwarmOptions): Promise<ZenSwarm>;
    /**
     * Enhanced static initialization with comprehensive features.
     *
     * @param options
     */
    static initialize(options?: any): Promise<ZenSwarm>;
    /**
     * Detect available features (neural networks, SIMD, etc.).
     *
     * @param useSIMD
     */
    detectFeatures(useSIMD?: boolean): Promise<void>;
    /**
     * Create a new swarm with neural capabilities.
     *
     * @param config
     */
    createSwarm(config: any): Promise<SwarmWrapper>;
    /**
     * Get global metrics including neural performance.
     */
    getGlobalMetrics(): Promise<any>;
    /**
     * Legacy compatibility method for spawnAgent with neural capabilities.
     *
     * @param name
     * @param type
     * @param options
     */
    spawnAgent(name: string, type?: string, options?: any): Promise<Agent>;
    addAgent(config: AgentConfig): string;
    removeAgent(agentId: string): void;
    submitTask(task: Omit<Task, 'id' | 'status'>): Promise<string>;
    getTaskStatus(taskId: string): Task | undefined;
    getTasksByStatus(status: TaskStatus): Task[];
    getMetrics(): SwarmMetrics;
    getFormattedMetrics(): string;
    on(event: SwarmEvent, handler: (data: any) => void): void;
    off(event: SwarmEvent, handler: (data: any) => void): void;
    emit(event: SwarmEvent, data: any): void;
    /**
     * Shutdown the swarm with comprehensive cleanup.
     */
    destroy(): Promise<void>;
    private assignTask;
    private updateConnections;
    private updateMetrics;
    private startTime;
    private startSyncLoop;
    /**
     * Feature detection helpers.
     */
    static detectSIMDSupport(): boolean;
    static getVersion(): string;
    static getRuntimeFeatures(): any;
}
/**
 * Enhanced Swarm wrapper class with neural orchestration.
 *
 * @example
 */
export declare class SwarmWrapper {
    id: string;
    private ruvSwarm;
    private wasmSwarm;
    agents: Map<string, Agent>;
    private tasks;
    constructor(id: string, wasmInstance: any, ruvSwarmInstance: ZenSwarm);
    spawnAgent(name: string, type?: string, options?: any): Promise<Agent>;
    getStatus(_detailed?: boolean): Promise<any>;
    terminate(): Promise<void>;
}
/**
 * Enhanced Task wrapper class with neural execution.
 *
 * @example
 */
export declare class TaskWrapper {
    id: string;
    description: string;
    status: string;
    assignedAgents: string[];
    result: any;
    swarm: SwarmWrapper;
    private startTime;
    private endTime;
    progress: number;
    constructor(id: string, wasmResult: any, swarm: SwarmWrapper);
    getStatus(): Promise<any>;
}
export declare const NeuralSwarmUtils: {
    /**
     * Create a neural-enhanced swarm with pre-configured agents.
     *
     * @param config
     */
    createNeuralSwarm(config?: any): Promise<ZenSwarm>;
    /**
     * Spawn a team of neural agents with different cognitive patterns.
     *
     * @param swarm
     * @param teamConfig
     */
    spawnNeuralTeam(swarm: ZenSwarm, teamConfig?: any): Promise<Agent[]>;
};
/**
 * Default export for convenience.
 */
export default ZenSwarm;
//# sourceMappingURL=index.d.ts.map