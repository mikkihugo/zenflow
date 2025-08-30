/**
 * @file Context Manager - Replaces Hook System Context Loading
 *
 * Manages agent and swarm context, replacing the removed hook system's
 * context loading functionality with integrated memory management.
 */
import { EventEmitter } from '@claude-zen/foundation';
import { MemorySystem } from './core/memory-system';
/**
 * Context loading result (replaces hook context loading)
 */
export interface ContextLoadingResult {
    loaded: boolean;
    context: Record<string, unknown>;
    timestamp: number;
    source?: string;
    error?: string;
}
/**
 * Agent context information
 */
export interface AgentContext {
    agentId: string;
    swarmId: string;
    type: string;
    instance: number;
    currentTask?: string;
    environment: Record<string, unknown>;
    preferences: Record<string, unknown>;
    history: Array<{
        task: string;
        duration: number;
        success: boolean;
        timestamp: number;
    }>;
    metrics: {
        tasksCompleted: number;
        averageDuration: number;
        successRate: number;
        lastActivity: number;
    };
}
/**
 * Swarm context information
 */
export interface SwarmContext {
    swarmId: string;
    name: string;
    topology: string;
    agents: string[];
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    coordination: {
        strategy: string;
        lastSync: number;
        nextSync: number;
    };
    performance: {
        throughput: number;
        avgTaskTime: number;
        efficiency: number;
    };
}
/**
 * Session context information
 */
export interface SessionContext {
    sessionId: string;
    userId?: string;
    startTime: number;
    lastActivity: number;
    swarms: string[];
    globalState: Record<string, unknown>;
    preferences: Record<string, unknown>;
}
/**
 * Context Manager Configuration
 */
export interface ContextManagerConfig {
    enabled: boolean;
    cacheTimeout: number;
    maxCacheSize: number;
    autoSync: boolean;
    syncInterval: number;
    namespaces: {
        agents: string;
        swarms: string;
        sessions: string;
        global: string;
    };
}
/**
 * Default context manager configuration
 */
export declare const DEFAULT_CONTEXT_CONFIG: ContextManagerConfig;
/**
 * Context Manager - Handles context loading and management
 *
 * Replaces the removed hook system's context loading with memory-backed
 * context management for agents, swarms, and sessions.
 */
export declare class ContextManager extends EventEmitter {
    private config;
    private memorySystem;
    private contextCache;
    private syncTimer?;
    constructor(memorySystem: MemorySystem, config?: Partial<ContextManagerConfig>);
    /**
     * Load context for any entity (replaces hook system context loading)
     */
    loadContext(context: {
        type: 'agent|swarm|session|global';
        id: string;
        options?: {
            includeHistory?: boolean;
            includeMetrics?: boolean;
            maxAge?: number;
        };
    }): Promise<ContextLoadingResult>;
    /**
     * Save context to memory
     */
    saveContext(type: 'agent|swarm|session|global', id: string, contextData: Record<string, unknown>): Promise<boolean>;
    /**
     * Load agent context with full details
     */
    loadAgentContext(agentId: string): Promise<AgentContext | null>;
    /**
     * Load swarm context with full details
     */
    loadSwarmContext(swarmId: string): Promise<SwarmContext | null>;
    /**
     * Load session context with full details
     */
    loadSessionContext(sessionId: string): Promise<SessionContext | null>;
    /**
     * Update agent metrics in context
     */
    updateAgentMetrics(agentId: string, metrics: Partial<AgentContext['metrics']>): Promise<boolean>;
    /**
     * Add task to agent history
     */
    addTaskToHistory(agentId: string, task: string, duration: number, success: boolean): Promise<boolean>;
    /**
     * Get global system context
     */
    getGlobalContext(): Promise<Record<string, unknown>>;
    /**
     * Update global system context
     */
    updateGlobalContext(updates: Record<string, unknown>): Promise<boolean>;
    /**
     * Clear all context cache
     */
    clearCache(): void;
    /**
     * Get context cache statistics
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        oldestEntry: number;
    };
    /**
     * Shutdown context manager
     */
    shutdown(): void;
    /**
     * Get namespace for context type
     */
    private getNamespace;
    /**
     * Check if cache entry is valid
     */
    private isCacheValid;
    /**
     * Clean expired cache entries
     */
    private cleanCache;
    /**
     * Start automatic sync timer
     */
    private startAutoSync;
}
/**
 * Factory function to create Context Manager
 */
export declare function createContextManager(memorySystem: MemorySystem, config?: Partial<ContextManagerConfig>): ContextManager;
/**
 * Get or create global context manager
 */
export declare function getGlobalContextManager(memorySystem?: MemorySystem): ContextManager;
/**
 * Utility function to wrap a task with context loading
 */
export declare function withContextLoading<T>(contextManager: ContextManager, contextType: 'agent|swarm|session', contextId: string, fn: (context: Record<string, unknown>) => Promise<T>): Promise<T>;
//# sourceMappingURL=context-store.d.ts.map