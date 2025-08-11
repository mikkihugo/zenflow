/**
 * Hive-Swarm Synchronization System.
 *
 * Maintains real-time awareness between distributed swarms and the central hive mind.
 * Ensures all swarms know about available agents, task distribution, and global state.
 */
/**
 * @file Coordination system: hive-swarm-sync.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
import type { HiveFACTSystemInterface } from './shared-types.ts';
type HiveFACTSystem = HiveFACTSystemInterface;
import type { GlobalAgentInfo, GlobalResourceMetrics, HiveHealthMetrics, Task as HiveTask, SwarmInfo, SwarmPerformanceMetrics } from './hive-types.ts';
export interface HiveRegistry {
    availableAgents: Map<string, GlobalAgentInfo>;
    activeSwarms: Map<string, SwarmInfo>;
    globalTaskQueue: HiveTask[];
    taskAssignments: Map<string, string>;
    globalResources: GlobalResourceMetrics;
    hiveHealth: HiveHealthMetrics;
}
/**
 * Central hive mind synchronization coordinator.
 *
 * @example
 */
export declare class HiveSwarmCoordinator extends EventEmitter {
    private eventBus;
    private logger?;
    private hiveRegistry;
    private syncInterval;
    private heartbeatInterval;
    private syncTimer;
    private heartbeatTimer;
    private connectionHealth;
    private hiveFact;
    constructor(eventBus: IEventBus, logger?: ILogger | undefined);
    /**
     * Initialize the hive coordinator.
     * Required by HiveSwarmCoordinatorInterface.
     */
    initialize(): Promise<void>;
    /**
     * Start hive-swarm synchronization.
     */
    start(): Promise<void>;
    /**
     * Shutdown the hive coordinator.
     * Required by HiveSwarmCoordinatorInterface.
     */
    shutdown(): Promise<void>;
    /**
     * Stop hive-swarm synchronization.
     */
    stop(): Promise<void>;
    /**
     * Core hive synchronization process.
     */
    private performHiveSync;
    /**
     * Collect agent states from all active swarms.
     */
    private collectAgentStates;
    /**
     * Update global resource metrics.
     */
    private updateGlobalResources;
    /**
     * Intelligent task distribution across swarms.
     */
    private optimizeTaskDistribution;
    /**
     * Find the best agent for a specific task.
     *
     * @param task
     * @param availableAgents
     */
    private findBestAgentForTask;
    /**
     * Calculate how well an agent matches a task.
     *
     * @param agent
     * @param task
     */
    private calculateAgentTaskScore;
    /**
     * Balance workloads across swarms.
     */
    private balanceWorkloads;
    /**
     * Update swarm performance metrics.
     */
    private updateSwarmMetrics;
    /**
     * Broadcast global state to all swarms.
     */
    private broadcastGlobalState;
    /**
     * Send heartbeat to all swarms.
     */
    private sendHeartbeats;
    /**
     * Check health of all swarms.
     */
    private checkSwarmHealth;
    /**
     * Update overall hive health metrics.
     */
    private updateHiveHealth;
    /**
     * Set up event handlers for hive-swarm communication.
     */
    private setupEventHandlers;
    /**
     * Register a new swarm with the hive.
     *
     * @param data
     */
    private registerSwarmLegacy;
    /**
     * Register a new agent with the hive.
     *
     * @param data
     */
    private registerAgent;
    /**
     * Update agent state in hive registry.
     *
     * @param data
     */
    private updateAgentState;
    /**
     * Handle swarm heartbeat.
     *
     * @param data
     */
    private handleSwarmHeartbeat;
    /**
     * Handle task completion.
     *
     * @param data
     */
    private handleTaskCompletion;
    /**
     * Handle swarm disconnection.
     *
     * @param data
     */
    private handleSwarmDisconnect;
    /**
     * Get current hive status.
     */
    getHiveStatus(): HiveStatus;
    /**
     * Get HiveFACT system for universal knowledge access.
     */
    getHiveFACT(): HiveFACTSystem | undefined;
    /**
     * Request universal fact from HiveFACT
     * Used by swarms to access universal knowledge.
     *
     * @param swarmId
     * @param factType
     * @param subject
     */
    requestUniversalFact(swarmId: string, factType: 'npm-package' | 'github-repo' | 'api-docs' | 'security-advisory' | 'general', subject: string): Promise<any>;
    private generateRequestId;
    private initializeGlobalResources;
    private initializeHiveHealth;
    private initializeSwarmPerformance;
    /**
     * Register a swarm with the hive coordinator.
     */
    registerSwarm(swarmInfo: SwarmInfo): Promise<void>;
    /**
     * Unregister a swarm from the hive coordinator.
     */
    unregisterSwarm(swarmId: string): Promise<void>;
    /**
     * Get information about a specific swarm.
     */
    getSwarmInfo(swarmId: string): Promise<SwarmInfo | null>;
    /**
     * Get information about all registered swarms.
     */
    getAllSwarms(): Promise<SwarmInfo[]>;
    /**
     * Distribute a task across the swarm network.
     */
    distributeTask(task: HiveTask): Promise<void>;
    /**
     * Get list of all global agents.
     */
    getGlobalAgents(): Promise<GlobalAgentInfo[]>;
    /**
     * Get hive health metrics.
     */
    getHiveHealth(): Promise<HiveHealthMetrics>;
    /**
     * Get metrics for a specific swarm.
     */
    getSwarmMetrics(swarmId: string): Promise<SwarmPerformanceMetrics>;
    /**
     * Get global resource metrics.
     */
    getGlobalResourceMetrics(): Promise<GlobalResourceMetrics>;
    /**
     * Notify about FACT updates (optional interface method).
     */
    notifyFACTUpdate?(fact: any): void;
    /**
     * Request FACT search (optional interface method).
     */
    requestFACTSearch?(query: any): Promise<any[]>;
}
interface HiveStatus {
    totalSwarms: number;
    totalAgents: number;
    availableAgents: number;
    busyAgents: number;
    pendingTasks: number;
    globalResources: GlobalResourceMetrics;
    hiveHealth: HiveHealthMetrics;
    swarmHealthScores: Record<string, number>;
}
export default HiveSwarmCoordinator;
//# sourceMappingURL=hive-swarm-sync.d.ts.map