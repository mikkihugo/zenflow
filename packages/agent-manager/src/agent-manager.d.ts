/**
 * @fileoverview AgentManager - Dynamic Swarm Orchestration (claude-code-zen's ruvswarm)
 *
 * This module provides dynamic, ephemeral agent swarm orchestration similar to ruvswarm
 * but optimized for claude-code-zen's architecture. Key characteristics:
 *
 * - **Non-persistent**: Agents are instantiated on-demand for specific tasks
 * - **Cognitive Diversity**: Specialized agent archetypes with different thinking patterns
 * - **High Performance**: <100ms decision making with intelligent coordination
 * - **Dynamic Scaling**: Create and destroy agents based on workload
 * - **WASM Integration**: Optional neural acceleration for complex decisions
 * - **Topology Aware**: Mesh, hierarchical, ring, and star coordination patterns
 *
 * Unlike traditional agent systems, AgentManager creates temporary, task-specific
 * swarms that dissolve after completion. This approach provides:
 * - Zero operational overhead when idle
 * - Optimal resource utilization
 * - Surgical precision for specific tasks
 * - No persistence complexity
 *
 * @version 2.0.0 - Dynamic Swarm Architecture
 * @author Claude Code Zen Team
 * @since 2024-01-01
 *
 * @example Dynamic Swarm Creation
 * ```typescript
 * import { AgentManager } from '@claude-zen/agent-manager';
 *
 * // Instantiate agents on-demand for a specific task
 * const swarm = await AgentManager.createSwarm({
 *   task: 'analyze-codebase',
 *   cognitiveTypes: ['researcher', 'coder', 'analyst'],
 *   topology: 'hierarchical',
 *   maxDuration: 30000 // Auto-dissolve after 30s
 * });
 *
 * // Execute task with cognitive diversity
 * const result = await swarm.execute();
 * console.log(`Analysis complete in ${result.duration}ms`);
 * // Swarm automatically dissolved
 * ```
 *
 * @example Intelligent Decision Making
 * ```typescript
 * // Create specialized agents for complex coordination
 * const taskId = await manager.assignTask({
 *   id: 'analyze-codebase',
 *   type: 'code-analysis',
 *   requirements: ['static-analysis', 'typescript', 'performance-metrics'],
 *   priority: 5
 * });
 *
 * // Monitor task completion
 * manager.on('task:completed', (event) => {
 *   console.log(`Task ${event.taskId} completed in ${event.duration}ms`);
 * });
 * ```
 */
import { EventEmitter } from 'eventemitter3';
import type { SwarmConfig, SwarmCreationConfig, EphemeralSwarm, SwarmExecutionResult } from './types';
/**
 * Dynamic Swarm Orchestrator - claude-code-zen's equivalent to ruvswarm.
 *
 * AgentManager creates ephemeral, task-specific swarms that provide cognitive diversity
 * through specialized agent archetypes. Unlike persistent agent systems, this approach:
 *
 * Key Features:
 * - **Ephemeral Agents**: Created on-demand, dissolved after task completion
 * - **Cognitive Archetypes**: researcher, coder, analyst, architect thinking patterns
 * - **<100ms Decisions**: High-performance coordination with minimal latency
 * - **Zero Persistence**: No storage overhead, no state management complexity
 * - **Dynamic Topologies**: Optimal topology selection based on task requirements
 * - **WASM Neural Integration**: Optional neural acceleration for complex decisions
 *
 * Architecture Philosophy:
 * "You're not managing agents. You're instantiating intelligence."
 *
 * @class AgentManager
 * @extends EventEmitter
 * @since 2.0.0
 *
 * @fires AgentManager#swarm:created - Fired when ephemeral swarm is instantiated
 * @fires AgentManager#swarm:dissolved - Fired when swarm completes and dissolves
 * @fires AgentManager#decision:made - Fired when swarm makes intelligent decision
 * @fires AgentManager#coordination:complete - Fired when coordination task finishes
 */
export declare class AgentManager extends EventEmitter {
    /** Foundation logger for consistent logging across the system */
    private readonly logger;
    /** Cognitive archetype definitions for specialized thinking patterns */
    private static readonly COGNITIVE_ARCHETYPES;
    /** Active ephemeral swarms (session-aware) */
    private activeSwarms;
    /** Performance tracking for optimization (session-aware) */
    private readonly performanceMetrics;
    /** WASM neural acceleration (optional) */
    private wasmNeural?;
    /**
     * Create an ephemeral swarm for task-specific coordination.
     *
     * This is the core ruvswarm-style method that instantiates cognitive agents
     * on-demand for a specific task. Unlike persistent agents, these swarms:
     * - Auto-dissolve after task completion or timeout (default: 1 hour)
     * - Support Claude CLI session persistence (survive restarts)
     * - Provide <100ms decision making with optional WASM acceleration
     * - Enable unlimited Claude SDK interactions by default
     *
     * @param config Swarm creation configuration
     * @returns Promise resolving to created swarm instance
     *
     * @example
     * ```typescript
     * const swarm = await AgentManager.createSwarm({
     *   task: 'analyze-codebase-security',
     *   cognitiveTypes: ['researcher', 'coder', 'analyst'],
     *   topology: 'hierarchical',
     *   maxDuration: 3600000, // 1 hour
     *   persistent: true, // Survive Claude CLI restarts
     *   neuralAcceleration: true // Enable WASM neural processing
     * });
     * ```
     */
    static createSwarm(config: SwarmCreationConfig): Promise<EphemeralSwarm>;
    /**
     * Execute a swarm and get comprehensive results.
     *
     * @param swarmId Unique swarm identifier
     * @param options Execution options
     * @returns Promise resolving to execution results
     */
    executeSwarm(swarmId: string, options?: {
        maxTurns?: number;
    }): Promise<SwarmExecutionResult>;
    /**
     * Dissolve a swarm and clean up resources.
     */
    dissolveSwarm(swarmId: string): Promise<void>;
    /**
     * Pause a swarm for Claude CLI session restart.
     */
    pauseSwarm(swarmId: string): Promise<void>;
    /**
     * Resume a swarm after Claude CLI session restart.
     */
    resumeSwarm(swarmId: string): Promise<void>;
    /**
     * Get all active swarms.
     */
    getActiveSwarms(): EphemeralSwarm[];
    /**
     * Initialize the agent manager with specified configuration.
     *
     * @param config Optional configuration object for swarm initialization
     * @returns Promise that resolves when initialization is complete
     */
    initialize(config?: SwarmConfig): Promise<void>;
    /**
     * Gracefully shutdown the agent manager and dissolve all active swarms.
     */
    shutdown(): Promise<void>;
    /**
     * Get the total number of active swarms.
     */
    getSwarmCount(): number;
    /**
     * Get the total uptime of the agent manager in milliseconds.
     */
    getUptime(): number;
    /**
     * Get performance metrics for the agent manager.
     */
    getPerformanceMetrics(): {
        totalSwarms: number;
        averageDecisionTime: number;
        successfulCoordinations: number;
        startTime: number;
        sessionsRestored: number;
    };
    /**
     * Instantiate a cognitive agent with specialized archetype.
     */
    private instantiateCognitiveAgent;
    /**
     * Get capabilities for a cognitive archetype.
     */
    private getCapabilitiesForArchetype;
    /**
     * Initialize WASM neural acceleration.
     */
    private initializeWasmNeural;
    /**
     * Build swarm execution prompt for Claude SDK.
     */
    private buildSwarmExecutionPrompt;
}
export default AgentManager;
//# sourceMappingURL=agent-manager.d.ts.map