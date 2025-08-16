/**
 * @fileoverview Shared Swarm Coordination Service
 *
 * Central business logic for swarm operations. Used by:
 * - stdio MCP server (direct function calls for Claude Code CLI)
 * - HTTP APIs (for web dashboard)
 * - HTTP MCP server (for Claude Desktop)
 *
 * This service provides the core swarm functionality with clean separation
 * between business logic and transport protocols.
 */
import { EventEmitter } from 'events';
import type { AgentConfig, SwarmConfig, TaskOrchestrationConfig } from '../../coordination/validation';
import type { NeuralStatusResult } from '../../coordination/validation';
/**
 * Core Swarm Coordination Service
 *
 * Provides shared business logic for all swarm operations
 * regardless of the interface (stdio MCP, HTTP API, HTTP MCP)
 */
export declare class SwarmService extends EventEmitter {
    private swarms;
    private agents;
    private tasks;
    private llmService;
    private metricsCollector;
    private cleanupIntervalId?;
    constructor();
    /**
     * Initialize a new swarm
     */
    initializeSwarm(config: SwarmConfig): Promise<SwarmInitResult>;
    /**
     * Spawn a new agent in a swarm with memory-based coordination
     */
    spawnAgent(swarmId: string, config: AgentConfig): Promise<AgentSpawnResult>;
    /**
     * Orchestrate a task across agents
     */
    orchestrateTask(config: TaskOrchestrationConfig): Promise<TaskOrchestrationResult>;
    /**
     * Get swarm status
     */
    getSwarmStatus(swarmId?: string): Promise<SwarmStatusResult>;
    /**
     * Get task status
     */
    getTaskStatus(taskId?: string): Promise<TaskStatusResult>;
    /**
     * Execute task asynchronously with real file operations
     */
    /**
     * Execute task using Claude CLI with dangerous permissions and JSON output
     */
    private executeTaskAsync;
    /**
     * Complete a task (internal method)
     */
    private completeTask;
    /**
     * Get service statistics
     */
    getStats(): ServiceStats;
    /**
     * Shutdown service and cleanup resources
     */
    shutdown(): Promise<void>;
    /**
     * Auto-detect workspace complexity and initialize COLLECTIVE if needed
     */
    private autoDetectWorkspace;
    /**
     * Initialize COLLECTIVE workspace structure automatically
     */
    private initializeCollectiveWorkspace;
    /**
     * Perform periodic cleanup of old tasks and agents
     */
    private performCleanup;
    getNeuralStatus(agentId?: string): Promise<NeuralStatusResult>;
    trainNeuralAgent(agentId?: string, iterations?: number): Promise<any>;
    getCognitivePatterns(pattern?: string): Promise<any>;
    getMemoryUsage(detail?: string): Promise<any>;
    runBenchmarks(type?: string, iterations?: number): Promise<any>;
    detectFeatures(category?: string): Promise<any>;
    monitorSwarm(duration?: number, interval?: number): Promise<any>;
    listAgents(filter?: string): Promise<any>;
    getAgentMetrics(agentId?: string, metric?: string): Promise<any>;
    getTaskResults(taskId: string, format?: string): Promise<any>;
}
interface SwarmInitResult {
    id: string;
    topology: string;
    strategy?: string;
    maxAgents: number;
    features: {
        cognitive_diversity: boolean;
        neural_networks: boolean;
        forecasting: boolean;
        simd_support: boolean;
    };
    created: string;
    performance: {
        initialization_time_ms: number;
        memory_usage_mb: number;
    };
}
interface AgentSpawnResult {
    agent: {
        id: string;
        name: string;
        type: string;
        cognitive_pattern: string;
        capabilities: string[];
        neural_network_id: string;
        status: string;
    };
    swarm_info: {
        id: string;
        agent_count: number;
        capacity: string;
    };
    message: string;
    performance: {
        spawn_time_ms: number;
        memory_overhead_mb: number;
    };
}
interface TaskOrchestrationResult {
    taskId: string;
    status: string;
    description: string;
    priority: string;
    strategy: string;
    assigned_agents: string[];
    swarm_info: {
        id: string;
        active_agents: number;
    };
    orchestration: {
        agent_selection_algorithm: string;
        load_balancing: boolean;
        cognitive_diversity_considered: boolean;
    };
    performance: {
        orchestration_time_ms: number;
        estimated_completion_ms: number;
    };
    message: string;
}
interface SwarmStatusResult {
    swarms: Array<{
        id: string;
        topology: string;
        strategy?: string;
        agent_count: number;
        max_agents: number;
        status: string;
        created: string;
        agents: Array<{
            id: string;
            type: string;
            status: string;
            current_task?: string;
        }>;
    }>;
    total_swarms: number;
    total_agents: number;
}
interface TaskStatusResult {
    tasks: Array<{
        id: string;
        status: string;
        description: string;
        assigned_agents: string[];
        progress: number;
        created: string;
        completed?: string;
    }>;
    total_tasks: number;
}
interface ServiceStats {
    swarms: number;
    agents: number;
    tasks: number;
    active_tasks: number;
    memory_usage: NodeJS.MemoryUsage;
    uptime: number;
}
export default SwarmService;
//# sourceMappingURL=swarm-service.d.ts.map