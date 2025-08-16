/**
 * @fileoverview Shared Type Definitions for Swarm Operations
 *
 * Common types used across all interfaces (stdio MCP, HTTP API, HTTP MCP)
 * to ensure consistency in swarm coordination functionality.
 */
export interface SwarmConfig {
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    maxAgents?: number;
    strategy?: 'balanced' | 'specialized' | 'adaptive' | 'parallel';
    features?: {
        cognitive_diversity?: boolean;
        neural_networks?: boolean;
        forecasting?: boolean;
        simd_support?: boolean;
    };
}
export interface AgentConfig {
    type: 'researcher' | 'coder' | 'analyst' | 'optimizer' | 'coordinator' | 'tester';
    name?: string;
    capabilities?: string[];
    cognitive_pattern?: 'convergent' | 'divergent' | 'lateral' | 'systems' | 'critical' | 'adaptive';
    learning_rate?: number;
    enable_memory?: boolean;
}
export interface TaskOrchestrationConfig {
    task: string;
    strategy?: 'parallel' | 'sequential' | 'adaptive';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    maxAgents?: number;
    timeout?: number;
    requirements?: {
        agent_types?: string[];
        capabilities?: string[];
        min_agents?: number;
        max_agents?: number;
    };
}
export type SwarmStatus = 'initializing' | 'active' | 'paused' | 'terminated';
export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'cancelled' | 'failed';
export interface MemoryConfig {
    action: 'store' | 'retrieve' | 'list' | 'delete';
    key?: string;
    value?: unknown;
    pattern?: string;
    namespace?: string;
}
export interface NeuralConfig {
    agent_id?: string;
    pattern?: 'convergent' | 'divergent' | 'lateral' | 'systems' | 'critical' | 'adaptive' | 'all';
    iterations?: number;
    training_data?: unknown[];
}
export interface BenchmarkConfig {
    type?: 'all' | 'wasm' | 'swarm' | 'agent' | 'task' | 'neural';
    iterations?: number;
    duration?: number;
    agents?: number;
}
export interface MonitoringConfig {
    duration?: number;
    interval?: number;
    metrics?: string[];
    filter?: {
        swarm_id?: string;
        agent_type?: string;
        task_status?: TaskStatus;
    };
}
export interface SwarmResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        timestamp: string;
        request_id?: string;
        execution_time_ms?: number;
    };
}
export interface PaginatedResponse<T> extends SwarmResponse<T[]> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        has_more: boolean;
    };
}
export interface SwarmServiceInterface {
    initializeSwarm(config: SwarmConfig): Promise<unknown>;
    spawnAgent(swarmId: string, config: AgentConfig): Promise<unknown>;
    orchestrateTask(config: TaskOrchestrationConfig): Promise<unknown>;
    getSwarmStatus(swarmId?: string): Promise<unknown>;
    getTaskStatus(taskId?: string): Promise<unknown>;
    getStats(): unknown;
    shutdown(): Promise<void>;
}
export interface MemoryServiceInterface {
    store(key: string, value: unknown, namespace?: string): Promise<unknown>;
    retrieve(key: string, namespace?: string): Promise<unknown>;
    list(pattern?: string, namespace?: string): Promise<unknown>;
    delete(key: string, namespace?: string): Promise<unknown>;
    clear(namespace?: string): Promise<unknown>;
}
export interface NeuralServiceInterface {
    getStatus(agentId?: string): Promise<unknown>;
    train(config: NeuralConfig): Promise<unknown>;
    getPatterns(pattern?: string): Promise<unknown>;
    analyze(agentId: string): Promise<unknown>;
}
export declare const SwarmConfigSchema: {
    readonly type: "object";
    readonly properties: {
        readonly topology: {
            readonly type: "string";
            readonly enum: readonly ["mesh", "hierarchical", "ring", "star"];
        };
        readonly maxAgents: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 100;
            readonly default: 5;
        };
        readonly strategy: {
            readonly type: "string";
            readonly enum: readonly ["balanced", "specialized", "adaptive", "parallel"];
            readonly default: "adaptive";
        };
    };
    readonly required: readonly ["topology"];
    readonly additionalProperties: false;
};
export declare const AgentConfigSchema: {
    readonly type: "object";
    readonly properties: {
        readonly type: {
            readonly type: "string";
            readonly enum: readonly ["researcher", "coder", "analyst", "optimizer", "coordinator", "tester"];
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly capabilities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly cognitive_pattern: {
            readonly type: "string";
            readonly enum: readonly ["convergent", "divergent", "lateral", "systems", "critical", "adaptive"];
            readonly default: "adaptive";
        };
    };
    readonly required: readonly ["type"];
    readonly additionalProperties: false;
};
export declare const TaskOrchestrationSchema: {
    readonly type: "object";
    readonly properties: {
        readonly task: {
            readonly type: "string";
            readonly minLength: 10;
            readonly maxLength: 1000;
        };
        readonly strategy: {
            readonly type: "string";
            readonly enum: readonly ["parallel", "sequential", "adaptive"];
            readonly default: "adaptive";
        };
        readonly priority: {
            readonly type: "string";
            readonly enum: readonly ["low", "medium", "high", "critical"];
            readonly default: "medium";
        };
        readonly maxAgents: {
            readonly type: "number";
            readonly minimum: 1;
            readonly maximum: 10;
            readonly default: 5;
        };
    };
    readonly required: readonly ["task"];
    readonly additionalProperties: false;
};
//# sourceMappingURL=swarm-types.d.ts.map