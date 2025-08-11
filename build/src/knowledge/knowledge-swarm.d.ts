/**
 * @file Knowledge-swarm implementation.
 */
/**
 * Knowledge Swarm System for Claude-Zen.
 * Coordinates multiple knowledge gathering agents for external knowledge collection.
 *
 * Architecture: Distributed swarm of knowledge gathering agents
 * - Each agent specializes in different knowledge domains
 * - Parallel processing with intelligent load balancing
 * - Cross-agent knowledge sharing and deduplication.
 * - Independent storage system (separate from RAG/vector database).
 */
import { EventEmitter } from 'node:events';
import type { ClientInstance } from '../interfaces/clients/registry.ts';
import type { KnowledgeClientConfig, KnowledgeResult } from './knowledge-client.ts';
import { FACTIntegration } from './knowledge-client.ts';
export interface KnowledgeSwarmConfig extends KnowledgeClientConfig {
    swarmSize: number;
    specializations: KnowledgeAgentSpecialization[];
    parallelQueries: number;
    loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'specialization' | 'intelligent';
    crossAgentSharing: boolean;
    persistentStorage?: boolean;
    factRepoPath: string;
    anthropicApiKey: string;
    pythonPath?: string;
    enableCache?: boolean;
    cacheConfig?: {
        prefix: string;
        minTokens: number;
        maxSize: string;
        ttlSeconds: number;
    };
}
export interface KnowledgeAgentSpecialization {
    name: string;
    domains: string[];
    tools: string[];
    priority: number;
    expertise: string[];
}
export interface KnowledgeQuery {
    id: string;
    query: string;
    domains?: string[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
    parallel?: boolean;
    metadata?: Record<string, any>;
}
export interface KnowledgeSwarmResult {
    queryId: string;
    results: KnowledgeResult[];
    consolidatedResponse: string;
    agentsUsed: string[];
    totalExecutionTime: number;
    knowledgeConfidence: number;
    sourcesDiversity: number;
}
export type SwarmAgent = KnowledgeAgent;
export type SwarmQuery = KnowledgeQuery;
export type SwarmResult = KnowledgeSwarmResult;
interface KnowledgeAgent {
    id: string;
    specialization: KnowledgeAgentSpecialization;
    factInstance: FACTIntegration;
    clientInstance?: ClientInstance;
    currentLoad: number;
    totalQueries: number;
    successRate: number;
    averageLatency: number;
    expertise: Map<string, number>;
}
/**
 * FACT Swarm System - Orchestrates multiple FACT agents for comprehensive knowledge gathering.
 *
 * @example
 */
export declare class KnowledgeSwarm extends EventEmitter {
    private config;
    private agents;
    private queryQueue;
    private isProcessing;
    private queryCounter;
    private vectorRepository?;
    private vectorDAO?;
    private static readonly DEFAULT_SPECIALIZATIONS;
    constructor(config: KnowledgeSwarmConfig);
    /**
     * Initialize the FACT swarm system.
     */
    initialize(): Promise<void>;
    /**
     * Query the swarm with intelligent agent selection and parallel processing.
     *
     * @param query
     */
    querySwarm(query: SwarmQuery): Promise<SwarmResult>;
    /**
     * High-level knowledge gathering functions.
     */
    /**
     * Get comprehensive documentation for a technology.
     *
     * @param technology
     * @param version
     */
    getTechnologyDocs(technology: string, version?: string): Promise<SwarmResult>;
    /**
     * Research solutions for a specific problem.
     *
     * @param problem
     * @param context
     */
    researchProblem(problem: string, context?: string[]): Promise<SwarmResult>;
    /**
     * Get API integration guide.
     *
     * @param api
     * @param language
     */
    getAPIIntegration(api: string, language?: string): Promise<SwarmResult>;
    /**
     * Research performance optimization strategies.
     *
     * @param context
     */
    getPerformanceOptimization(context: string): Promise<SwarmResult>;
    /**
     * Get security best practices and vulnerability information.
     *
     * @param technology
     * @param context
     */
    getSecurityGuidance(technology: string, context?: string): Promise<SwarmResult>;
    /**
     * Create specialized swarm agents.
     */
    private createSwarmAgents;
    /**
     * Select optimal agents for a query using intelligent routing.
     *
     * @param query
     */
    private selectOptimalAgents;
    /**
     * Intelligent agent selection based on specialization, load, and performance.
     *
     * @param candidates
     * @param query
     */
    private selectIntelligent;
    /**
     * Select agents by specialization.
     *
     * @param candidates
     * @param query
     */
    private selectBySpecialization;
    /**
     * Select least loaded agents.
     *
     * @param candidates
     * @param query
     */
    private selectLeastLoaded;
    /**
     * Round-robin agent selection.
     *
     * @param candidates
     * @param _query
     */
    private selectRoundRobin;
    /**
     * Execute query across multiple agents in parallel.
     *
     * @param query
     * @param agents
     */
    private executeParallelQuery;
    /**
     * Consolidate results from multiple agents.
     *
     * @param results
     */
    private consolidateResults;
    /**
     * Deduplicate similar results.
     *
     * @param results
     */
    private deduplicateResults;
    /**
     * Calculate text similarity (simple implementation).
     *
     * @param text1
     * @param text2
     */
    private calculateSimilarity;
    /**
     * Store knowledge in vector database.
     *
     * @param query
     * @param results
     */
    private storeKnowledge;
    /**
     * Share knowledge across agents.
     *
     * @param _agents
     * @param results
     */
    private shareKnowledge;
    /**
     * Calculate confidence score for results.
     *
     * @param results
     */
    private calculateConfidence;
    /**
     * Calculate diversity score for sources.
     *
     * @param results
     */
    private calculateDiversity;
    /**
     * Setup knowledge storage tables in vector database.
     */
    private setupKnowledgeStorage;
    /**
     * Start the query processing system.
     */
    private startQueryProcessor;
    /**
     * Get swarm performance metrics.
     */
    getSwarmMetrics(): Promise<any>;
    /**
     * Shutdown the swarm system.
     */
    shutdown(): Promise<void>;
    /**
     * Get swarm health status.
     */
    getSwarmHealth(): {
        agentCount: number;
        healthyAgents: number;
        averageLoad: number;
        totalQueries: number;
        successRate: number;
        uaclStatus: any;
    };
    /**
     * Get detailed agent metrics.
     */
    getAgentMetrics(): Array<{
        id: string;
        specialization: string;
        load: number;
        queries: number;
        successRate: number;
        latency: number;
        clientStatus: string;
        expertise: Record<string, number>;
    }>;
}
/**
 * Initialize global FACT swarm system.
 *
 * @param config
 * @example
 */
export declare function initializeFACTSwarm(config: KnowledgeSwarmConfig): Promise<KnowledgeSwarm>;
/**
 * Get the global FACT swarm instance.
 *
 * @example
 */
export declare function getFACTSwarm(): KnowledgeSwarm | null;
/**
 * Quick swarm helper functions.
 */
export declare const FACTSwarmHelpers: {
    /**
     * Research a development problem using the swarm.
     *
     * @param problem
     * @param context
     */
    researchProblem(problem: string, context?: string[]): Promise<string>;
    /**
     * Get comprehensive technology documentation.
     *
     * @param technology
     * @param version
     */
    getTechDocs(technology: string, version?: string): Promise<string>;
    /**
     * Get API integration guidance.
     *
     * @param api
     * @param language
     */
    getAPIGuidance(api: string, language?: string): Promise<string>;
    /**
     * Get performance optimization strategies.
     *
     * @param context
     */
    getPerformanceGuidance(context: string): Promise<string>;
    /**
     * Get security guidance and best practices.
     *
     * @param technology
     * @param context
     */
    getSecurityGuidance(technology: string, context?: string): Promise<string>;
};
export default KnowledgeSwarm;
//# sourceMappingURL=knowledge-swarm.d.ts.map