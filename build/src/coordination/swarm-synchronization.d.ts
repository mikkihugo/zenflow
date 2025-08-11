/**
 * Swarm Synchronization System.
 *
 * Comprehensive synchronization strategy for distributed swarms ensuring consistency,
 * fault tolerance, and efficient coordination across all agents and Claude Code instances.
 */
/**
 * @file Coordination system: swarm-synchronization.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
import type { AgentState } from '../types/agent-types.ts';
export interface SwarmSyncConfig {
    syncInterval: number;
    heartbeatInterval: number;
    consensusTimeout: number;
    maxSyncRetries: number;
    enableDistributedLocks: boolean;
    enableEventualConsistency: boolean;
    enableByzantineFaultTolerance: boolean;
}
export interface SyncCheckpoint {
    id: string;
    timestamp: Date;
    swarmId: string;
    agentStates: Map<string, AgentState>;
    taskQueue: Task[];
    globalState: SwarmGlobalState;
    vectorClock: VectorClock;
    checksum: string;
}
export interface SwarmGlobalState {
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    averageResponseTime: number;
    systemHealth: number;
    resourceUtilization: ResourceMetrics;
    consensusRound: number;
}
export interface VectorClock {
    [agentId: string]: number;
}
export interface ResourceMetrics {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    diskIO: number;
}
/**
 * Multi-layered synchronization system for distributed swarms.
 *
 * @example
 */
export declare class SwarmSynchronizer extends EventEmitter {
    private eventBus?;
    private logger?;
    private config;
    private swarmId;
    private agentStates;
    private vectorClock;
    private syncHistory;
    private consensusProtocol;
    private syncTimer?;
    private heartbeatTimer?;
    constructor(swarmId: string, config?: Partial<SwarmSyncConfig>, eventBus?: IEventBus | undefined, logger?: ILogger | undefined);
    /**
     * Start synchronization processes.
     */
    start(): Promise<void>;
    /**
     * Stop synchronization processes.
     */
    stop(): Promise<void>;
    /**
     * Core synchronization cycle.
     */
    private performSyncCycle;
    /**
     * Gather current local swarm state.
     */
    private gatherLocalState;
    /**
     * Broadcast state to peer swarms.
     *
     * @param localState
     * @param syncId
     */
    private broadcastState;
    /**
     * Wait for peer swarm responses.
     *
     * @param syncId
     */
    private waitForPeerStates;
    /**
     * Reach consensus on global state.
     *
     * @param localState
     * @param peerStates
     */
    private reachConsensus;
    /**
     * Apply consensus state changes locally.
     *
     * @param consensusState
     */
    private applyStateChanges;
    /**
     * Create synchronization checkpoint.
     *
     * @param consensusState
     */
    private createCheckpoint;
    /**
     * Monitor agent heartbeats and handle failures.
     */
    private checkAgentHeartbeats;
    /**
     * Handle agents that have become unresponsive.
     *
     * @param staleAgents
     */
    private handleStaleAgents;
    /**
     * Calculate global swarm metrics.
     */
    private calculateGlobalMetrics;
    /**
     * Set up event handlers for synchronization.
     */
    private setupEventHandlers;
    /**
     * Handle sync broadcast from peer swarm.
     *
     * @param data
     */
    private handlePeerSyncBroadcast;
    /**
     * Update local agent state.
     *
     * @param agentId
     * @param newState
     */
    private updateAgentState;
    /**
     * Get current synchronization status.
     */
    getSyncStatus(): SwarmSyncStatus;
    private generateSyncId;
    private generateCheckpointId;
    private calculateStateChecksum;
    private processPendingChanges;
    private applyStateChange;
}
interface SwarmSyncStatus {
    swarmId: string;
    isActive: boolean;
    lastSyncTime?: Date;
    agentCount: number;
    activeAgents: number;
    vectorClock: VectorClock;
    syncHistory: number;
}
interface Task {
    id: string;
    assignedAgent?: string;
    status: string;
    priority: number;
}
export default SwarmSynchronizer;
//# sourceMappingURL=swarm-synchronization.d.ts.map