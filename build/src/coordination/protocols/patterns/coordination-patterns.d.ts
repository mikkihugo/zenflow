/**
 * Advanced Coordination Patterns System
 * Provides leader election algorithms, distributed consensus (Raft-like),
 * work-stealing queues, hierarchical coordination with delegation.
 */
/**
 * @file Coordination system: coordination-patterns.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { EventBusInterface as IEventBus } from '../../core/event-bus.ts';
export interface CoordinationNode {
    id: string;
    type: 'leader' | 'follower' | 'candidate' | 'coordinator' | 'worker';
    status: 'active' | 'inactive' | 'failed' | 'suspected';
    capabilities: string[];
    load: number;
    priority: number;
    lastHeartbeat: Date;
    metadata: Record<string, unknown>;
}
export interface LeaderElectionConfig {
    algorithm: 'bully' | 'ring' | 'raft' | 'fast-bully';
    timeoutMs: number;
    heartbeatInterval: number;
    maxRetries: number;
    priorityBased: boolean;
    minNodes: number;
}
export interface ConsensusConfig {
    algorithm: 'raft' | 'pbft' | 'tendermint';
    electionTimeout: [number, number];
    heartbeatInterval: number;
    logReplicationTimeout: number;
    maxLogEntries: number;
    snapshotThreshold: number;
}
export interface WorkStealingConfig {
    maxQueueSize: number;
    stealThreshold: number;
    stealRatio: number;
    retryInterval: number;
    maxRetries: number;
    loadBalancingInterval: number;
}
export interface HierarchicalConfig {
    maxDepth: number;
    fanOut: number;
    delegationThreshold: number;
    escalationTimeout: number;
    rebalanceInterval: number;
}
export interface ElectionMessage {
    type: 'election' | 'answer' | 'coordinator' | 'heartbeat' | 'victory';
    candidateId: string;
    priority: number;
    timestamp: Date;
    term?: number;
    signature: string;
}
export interface ElectionState {
    currentTerm: number;
    currentLeader?: string;
    votedFor?: string;
    state: 'follower' | 'candidate' | 'leader';
    votes: Set<string>;
    lastElection: Date;
    electionTimeout?: NodeJS.Timeout;
}
export type ConsensusCommand = string | Record<string, unknown> | {
    type: string;
    payload: unknown;
    metadata?: Record<string, unknown>;
};
export interface LogEntry {
    term: number;
    index: number;
    command: ConsensusCommand;
    timestamp: Date;
    committed: boolean;
    checksum: string;
}
export interface ConsensusState {
    currentTerm: number;
    log: LogEntry[];
    commitIndex: number;
    lastApplied: number;
    nextIndex: Map<string, number>;
    matchIndex: Map<string, number>;
    state: 'follower' | 'candidate' | 'leader';
    votedFor?: string;
    votes: Set<string>;
}
export interface AppendEntriesRequest {
    term: number;
    leaderId: string;
    prevLogIndex: number;
    prevLogTerm: number;
    entries: LogEntry[];
    leaderCommit: number;
}
export interface AppendEntriesResponse {
    term: number;
    success: boolean;
    matchIndex?: number;
    conflictIndex?: number;
    conflictTerm?: number;
}
export interface VoteRequest {
    term: number;
    candidateId: string;
    lastLogIndex: number;
    lastLogTerm: number;
}
export interface VoteResponse {
    term: number;
    voteGranted: boolean;
    reason?: string;
}
export interface WorkItem {
    id: string;
    type: string;
    payload: any;
    priority: number;
    attempts: number;
    maxAttempts: number;
    timeout: number;
    created: Date;
    stolen?: boolean;
    owner?: string;
}
export interface WorkQueue {
    nodeId: string;
    items: WorkItem[];
    capacity: number;
    processing: Set<string>;
    completed: number;
    failed: number;
    lastActivity: Date;
}
export interface StealRequest {
    requesterId: string;
    targetId: string;
    requestedCount: number;
    timestamp: Date;
}
export interface StealResponse {
    success: boolean;
    items: WorkItem[];
    reason?: string;
}
export interface HierarchyNode {
    id: string;
    parentId?: string;
    children: Set<string>;
    level: number;
    span: number;
    role: 'root' | 'coordinator' | 'leaf';
    delegation: DelegationConfig;
    load: LoadInfo;
}
export interface DelegationConfig {
    maxDelegations: number;
    currentDelegations: number;
    thresholds: {
        delegate: number;
        escalate: number;
        rebalance: number;
    };
}
export interface LoadInfo {
    current: number;
    capacity: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    utilization: number;
}
export interface DelegationRequest {
    delegatorId: string;
    delegateId: string;
    task: any;
    constraints: Record<string, unknown>;
    deadline?: Date;
    priority: number;
}
export interface EscalationRequest {
    escalatorId: string;
    supervisorId: string;
    reason: string;
    context: any;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Advanced Coordination Patterns Manager.
 *
 * @example
 */
export declare class CoordinationPatterns extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private nodes;
    private leaderElection;
    private consensusEngine;
    private workStealingSystem;
    private hierarchicalCoordinator;
    private currentPattern;
    private patternMetrics;
    constructor(nodeId: string, config: {
        election: LeaderElectionConfig;
        consensus: ConsensusConfig;
        workStealing: WorkStealingConfig;
        hierarchical: HierarchicalConfig;
    }, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    /**
     * Register a node in the coordination system.
     *
     * @param node
     */
    registerNode(node: CoordinationNode): Promise<void>;
    /**
     * Start leader election.
     */
    startElection(): Promise<string>;
    /**
     * Propose a value for consensus.
     *
     * @param value
     */
    proposeConsensus(value: any): Promise<boolean>;
    /**
     * Submit work to the work-stealing system.
     *
     * @param item
     */
    submitWork(item: Omit<WorkItem, 'id' | 'created' | 'attempts'>): Promise<string>;
    /**
     * Delegate a task in the hierarchy.
     *
     * @param request
     */
    delegateTask(request: DelegationRequest): Promise<boolean>;
    /**
     * Escalate an issue up the hierarchy.
     *
     * @param request
     */
    escalate(request: EscalationRequest): Promise<boolean>;
    /**
     * Switch coordination pattern.
     *
     * @param pattern
     */
    switchPattern(pattern: CoordinationPatterns['currentPattern']): Promise<void>;
    /**
     * Get current coordination status.
     */
    getCoordinationStatus(): {
        pattern: string;
        leader: string | undefined;
        consensusState: any;
        workQueues: number;
        hierarchyDepth: number;
        metrics: PatternMetrics;
    };
    /**
     * Get coordination metrics.
     */
    getMetrics(): PatternMetrics;
    private reconfigureForPattern;
    private startCoordination;
    private updateMetrics;
    private calculateAverageLatency;
    private calculateThroughput;
    private calculateFailureRate;
    private calculateCoordinationEfficiency;
    private handleLeaderElected;
    private handleLeaderFailed;
    private handleConsensusReached;
    private handleLogCommitted;
    private handleWorkStolen;
    private handleWorkCompleted;
    private handleDelegationCreated;
    private handleEscalationTriggered;
    private handleNodeJoined;
    private handleNodeLeft;
    private handleNetworkPartition;
    private initializeMetrics;
    shutdown(): Promise<void>;
}
interface PatternMetrics {
    electionCount: number;
    consensusOperations: number;
    workItemsProcessed: number;
    delegationsActive: number;
    averageLatency: number;
    throughput: number;
    failureRate: number;
    coordinationEfficiency: number;
}
export default CoordinationPatterns;
//# sourceMappingURL=coordination-patterns.d.ts.map