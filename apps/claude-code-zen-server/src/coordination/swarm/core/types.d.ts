/**
 * Core types and interfaces for ZenSwarm.
 *
 * ⚠️  CRITICAL SYSTEM TYPES - NEVER REMOVE ⚠️.
 *
 * This module is ACTIVELY USED across the coordination layer:
 * - src/core/interfaces/index.ts - Re-exports core types
 * - src/coordination/public-api.ts - Imports SwarmConfig, SwarmLifecycleState
 * - src/interfaces/services/adapters/coordination-service-adapter.ts - Imports SwarmOptions, SwarmTopology.
 *
 * Static analysis may not detect usage due to re-export patterns and type-only imports.
 * These types are fundamental to the swarm coordination system architecture.
 */
/**
 * @file TypeScript type definitions for coordination.
 * @usage CRITICAL - Core coordination types used across multiple layers
 * @importedBy src/core/interfaces/index.ts, src/coordination/public-api.ts, src/interfaces/services/adapters/coordination-service-adapter.ts
 */
import type { AgentType, Agent as BaseAgent, AgentConfig as BaseAgentConfig } from '../types/agent-types';
export interface SwarmOptions {
    topology?: SwarmTopology;
    maxAgents?: number;
    connectionDensity?: number;
    syncInterval?: number;
    wasmPath?: string;
    persistence?: unknown;
    pooling?: unknown;
}
export interface SwarmConfig {
    name?: string;
    topology?: 'mesh' | 'star' | 'hierarchical' | 'ring';
    strategy?: 'balanced' | 'specialized' | 'adaptive';
    maxAgents?: number;
    enableCognitiveDiversity?: boolean;
    enableNeuralAgents?: boolean;
}
export type SwarmTopology = 'mesh' | 'hierarchical' | 'distributed' | 'centralized' | 'hybrid';
export type SwarmLifecycleState = 'initializing' | 'active' | 'terminated';
export type { AgentType } from '../types/agent-types';
export interface AgentConfig extends Partial<BaseAgentConfig> {
    id: string;
    type: AgentType;
    cognitiveProfile?: CognitiveProfile;
    capabilities?: string[];
    memory?: AgentMemory;
}
export interface CognitiveProfile {
    analytical: number;
    creative: number;
    systematic: number;
    intuitive: number;
    collaborative: number;
    independent: number;
}
export interface AgentMemory {
    shortTerm: Map<string, any>;
    longTerm: Map<string, any>;
    episodic: EpisodicMemory[];
}
export interface EpisodicMemory {
    timestamp: number;
    context: string;
    data: unknown;
    importance: number;
}
export interface Task {
    id: string;
    swarmId: string;
    description: string;
    priority: TaskPriority;
    strategy: string;
    status: TaskStatus;
    progress: number;
    dependencies?: string[];
    assignedAgents?: string[];
    requireConsensus: boolean;
    maxAgents: number;
    requiredCapabilities: string[];
    createdAt: Date;
    metadata: Record<string, unknown>;
    result?: unknown;
    error?: Error;
}
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
export interface SwarmState {
    agents: Map<string, Agent>;
    tasks: Map<string, Task>;
    topology: SwarmTopology;
    connections: Connection[];
    metrics: SwarmMetrics;
}
export interface Connection {
    from: string;
    to: string;
    weight: number;
    type: ConnectionType;
}
export type ConnectionType = 'data' | 'control' | 'feedback' | 'coordination';
export interface SwarmMetrics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageCompletionTime: number;
    agentUtilization: Map<string, number>;
    throughput: number;
}
export interface Agent extends BaseAgent {
    connections: string[];
    communicate(message: Message): Promise<void>;
    update(state: Partial<AgentState>): void;
}
export interface AgentState {
    status: AgentStatus;
    currentTask?: string;
    load: number;
    performance: AgentPerformance;
}
export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';
export interface AgentPerformance {
    tasksCompleted: number;
    tasksFailed: number;
    averageExecutionTime: number;
    successRate: number;
}
export interface Message {
    id: string;
    from: string;
    to: string | string[];
    type: MessageType;
    payload: unknown;
    timestamp: number;
}
export type MessageType = 'task_assignment' | 'task_result' | 'status_update' | 'coordination' | 'knowledge_share' | 'error';
export interface SwarmEventEmitter {
    on(event: SwarmEvent, handler: (data: unknown) => void): void;
    off(event: SwarmEvent, handler: (data: unknown) => void): void;
    emit(event: SwarmEvent, data: unknown): void;
}
export type SwarmEvent = 'agent:added' | 'agent:removed' | 'agent:status_changed' | 'task:created' | 'task:assigned' | 'task:completed' | 'task:failed' | 'swarm:topology_changed' | 'swarm:error' | 'swarm:state_restored' | 'swarm:initialized' | 'swarm:destroyed' | 'session:created' | 'session:loaded' | 'session:saved' | 'session:paused' | 'session:resumed' | 'session:hibernated' | 'session:terminated' | 'session:restored' | 'session:checkpoint_created' | 'session:corruption_detected' | 'session:error' | 'session:integration_enabled';
export interface WasmModule {
    init(): Promise<void>;
    createSwarm(options: SwarmOptions): number;
    addAgent(swarmId: number, config: AgentConfig): number;
    assignTask(swarmId: number, task: Task): void;
    getState(swarmId: number): SwarmState;
    destroy(swarmId: number): void;
}
//# sourceMappingURL=types.d.ts.map