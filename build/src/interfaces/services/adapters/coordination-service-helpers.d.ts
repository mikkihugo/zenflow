/**
 * USL Coordination Service Helpers.
 *
 * Helper utilities and common operations for coordination service adapters.
 * Provides high-level coordination operations, agent management utilities,
 * session operations, and performance monitoring helpers.
 */
/**
 * @file Interface implementation: coordination-service-helpers.
 */
import type { SwarmAgent } from '../../../coordination/swarm/core/swarm-coordinator.ts';
import type { AgentType } from '../../../types/agent-types.ts';
import type { SwarmTopology } from '../../../types/shared-types.ts';
import type { CoordinationServiceAdapter } from './coordination-service-adapter.ts';
/**
 * Agent creation helper with intelligent defaults.
 *
 * @param adapter
 * @param config
 * @param config.type
 * @param config.capabilities
 * @param config.specialization
 * @param config.learningEnabled
 * @example
 */
export declare function createIntelligentAgent(adapter: CoordinationServiceAdapter, config: {
    type: AgentType;
    capabilities?: string[];
    specialization?: string;
    learningEnabled?: boolean;
}): Promise<any>;
/**
 * Batch agent creation with load balancing.
 *
 * @param adapter
 * @param configs
 * @param options
 * @param options.maxConcurrency
 * @param options.staggerDelay
 * @example
 */
export declare function createAgentBatch(adapter: CoordinationServiceAdapter, configs: Array<{
    type: AgentType;
    capabilities?: string[];
    specialization?: string;
}>, options?: {
    maxConcurrency?: number;
    staggerDelay?: number;
}): Promise<any[]>;
/**
 * Agent performance monitoring and optimization.
 *
 * @param adapter
 * @param agentIds
 * @example
 */
export declare function optimizeAgentPerformance(adapter: CoordinationServiceAdapter, agentIds?: string[]): Promise<{
    optimized: number;
    recommendations: Array<{
        agentId: string;
        issue: string;
        recommendation: string;
        priority: 'low' | 'medium' | 'high';
    }>;
}>;
/**
 * Create session with intelligent defaults and monitoring.
 *
 * @param adapter
 * @param name
 * @param options
 * @param options.autoCheckpoint
 * @param options.checkpointInterval
 * @param options.maxDuration
 * @example
 */
export declare function createManagedSession(adapter: CoordinationServiceAdapter, name: string, options?: {
    autoCheckpoint?: boolean;
    checkpointInterval?: number;
    maxDuration?: number;
}): Promise<{
    sessionId: string;
    monitoringId: string;
}>;
/**
 * Session health monitoring and recovery.
 *
 * @param adapter
 * @param sessionIds
 * @example
 */
export declare function monitorSessionHealth(adapter: CoordinationServiceAdapter, sessionIds?: string[]): Promise<{
    healthy: string[];
    unhealthy: string[];
    recovered: string[];
    failed: string[];
}>;
/**
 * Intelligent swarm coordination with adaptive topology.
 *
 * @param adapter
 * @param agents
 * @param options
 * @param options.targetLatency
 * @param options.minSuccessRate
 * @param options.adaptiveTopology
 * @example
 */
export declare function coordinateIntelligentSwarm(adapter: CoordinationServiceAdapter, agents: SwarmAgent[], options?: {
    targetLatency?: number;
    minSuccessRate?: number;
    adaptiveTopology?: boolean;
}): Promise<{
    coordination: any;
    topology: SwarmTopology;
    performance: {
        latency: number;
        successRate: number;
        throughput: number;
    };
}>;
/**
 * Swarm load balancing and task distribution.
 *
 * @param adapter
 * @param tasks
 * @param options
 * @param options.strategy
 * @param options.maxTasksPerAgent
 * @example
 */
export declare function distributeSwarmTasks(adapter: CoordinationServiceAdapter, tasks: Array<{
    id: string;
    type: string;
    requirements: string[];
    priority: number;
    estimatedDuration?: number;
}>, options?: {
    strategy?: 'round-robin' | 'least-loaded' | 'capability-match';
    maxTasksPerAgent?: number;
}): Promise<{
    assignments: Array<{
        taskId: string;
        agentId: string;
        estimatedCompletion: Date;
    }>;
    unassigned: string[];
    loadBalance: {
        [agentId: string]: number;
    };
}>;
/**
 * Comprehensive coordination performance analysis.
 *
 * @param adapter
 * @param timeWindow
 * @param _timeWindow
 * @example
 */
export declare function analyzeCoordinationPerformance(adapter: CoordinationServiceAdapter, _timeWindow?: number): Promise<{
    overall: {
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        issues: string[];
        recommendations: string[];
    };
    agents: {
        total: number;
        active: number;
        averagePerformance: number;
        topPerformers: string[];
        underperformers: string[];
    };
    sessions: {
        total: number;
        healthy: number;
        avgUptime: number;
        recoveryRate: number;
    };
    coordination: {
        averageLatency: number;
        successRate: number;
        throughput: number;
        optimalTopology: SwarmTopology;
    };
}>;
//# sourceMappingURL=coordination-service-helpers.d.ts.map