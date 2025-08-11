/**
 * Agent Registry - Manages registration and discovery of agents.
 *
 * Provides a centralized registry for agent management, allowing.
 * Agents to be discovered, queried, and managed across the system.
 */
/**
 * @file Coordination system: agent-registry.
 */
import { EventEmitter } from 'node:events';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';
import type { AgentCapabilities, AgentId, AgentMetrics, AgentStatus, AgentType } from '../types.ts';
export interface AgentRegistryQuery {
    type?: AgentType;
    status?: AgentStatus;
    namePattern?: string;
    capabilities?: string[];
    minSuccessRate?: number;
    maxLoadFactor?: number;
}
export interface RegisteredAgent {
    id: AgentId;
    name: string;
    type: AgentType;
    status: AgentStatus;
    capabilities: AgentCapabilities;
    metrics: AgentMetrics;
    registeredAt: Date;
    lastSeen: Date;
    loadFactor: number;
    health: number;
}
export interface AgentSelectionCriteria {
    type?: AgentType;
    requiredCapabilities?: string[];
    excludeAgents?: AgentId[];
    prioritizeBy?: 'load' | 'performance' | 'health' | 'availability';
    maxResults?: number;
    fileType?: string;
    projectContext?: string;
    taskType?: 'performance' | 'migration' | 'testing' | 'ui-ux' | 'development' | 'analysis';
}
/**
 * Centralized agent registry for discovery and management.
 *
 * @example
 */
export declare class AgentRegistry extends EventEmitter {
    private memory;
    private namespace;
    private agents;
    private lastUpdate;
    private healthCheckInterval?;
    private initialized;
    constructor(memory: MemoryCoordinator, namespace?: string);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    /**
     * Register an agent in the registry.
     *
     * @param agent
     * @param agent.id
     * @param agent.name
     * @param agent.type
     * @param agent.status
     * @param agent.capabilities
     * @param agent.metrics
     */
    registerAgent(agent: {
        id: AgentId;
        name: string;
        type: AgentType;
        status: AgentStatus;
        capabilities: AgentCapabilities;
        metrics?: AgentMetrics;
    }): Promise<void>;
    /**
     * Unregister an agent from the registry.
     *
     * @param agentId
     */
    unregisterAgent(agentId: AgentId): Promise<void>;
    /**
     * Update agent status and metrics.
     *
     * @param agentId
     * @param updates
     * @param updates.status
     * @param updates.metrics
     * @param updates.capabilities
     */
    updateAgent(agentId: AgentId, updates: {
        status?: AgentStatus;
        metrics?: Partial<AgentMetrics>;
        capabilities?: AgentCapabilities;
    }): Promise<void>;
    /**
     * Query agents matching criteria.
     *
     * @param query
     */
    queryAgents(query?: AgentRegistryQuery): Promise<RegisteredAgent[]>;
    /**
     * Select best agents for a task based on criteria.
     *
     * @param criteria
     */
    selectAgents(criteria: AgentSelectionCriteria): Promise<RegisteredAgent[]>;
    /**
     * Get specific agent by ID.
     *
     * @param agentId
     */
    getAgent(agentId: AgentId): RegisteredAgent | undefined;
    /**
     * Get all registered agents.
     */
    getAllAgents(): RegisteredAgent[];
    /**
     * Get agents by type.
     *
     * @param type
     */
    getAgentsByType(type: AgentType): RegisteredAgent[];
    /**
     * Get registry statistics.
     */
    getStats(): {
        totalAgents: number;
        agentsByType: Record<string, number>;
        agentsByStatus: Record<string, number>;
        averageLoadFactor: number;
        averageHealth: number;
        averageSuccessRate: number;
    };
    private loadExistingRegistrations;
    private persistRegistrations;
    private startHealthChecking;
    private performHealthCheck;
    private createDefaultMetrics;
    private calculateLoadFactor;
    private calculateHealth;
    private calculateSelectionScore;
    private filterByContext;
    private calculateContextScore;
    private getFileTypeMapping;
    private getTaskTypeMapping;
}
//# sourceMappingURL=agent-registry.d.ts.map