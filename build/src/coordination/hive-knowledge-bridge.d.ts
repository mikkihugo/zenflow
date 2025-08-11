/**
 * @file Hive Knowledge Bridge - Production Integration
 * Bridges the Hive FACT system with swarm coordination for real-time knowledge sharing.
 *
 * Architecture:
 * - Hive FACT contains universal knowledge (npm, repos, APIs, etc.)
 * - This bridge enables swarms to access and contribute to that knowledge
 * - Real-time knowledge distribution with bidirectional learning.
 */
import { EventEmitter } from 'node:events';
import type { SessionMemoryStore } from '../memory';
import type { HiveSwarmCoordinator } from './hive-swarm-sync.ts';
export interface KnowledgeRequest {
    requestId: string;
    swarmId: string;
    agentId?: string;
    type: 'query' | 'contribution' | 'update' | 'subscribe';
    payload: {
        domain?: string;
        query?: string;
        knowledge?: any;
        filters?: Record<string, any>;
    };
    priority: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
}
export interface KnowledgeResponse {
    requestId: string;
    swarmId: string;
    success: boolean;
    data?: any;
    error?: string;
    metadata: {
        source: 'hive-fact' | 'swarm-contribution' | 'external-mcp';
        timestamp: number;
        confidence: number;
        cacheHit: boolean;
    };
}
export interface SwarmContribution {
    swarmId: string;
    agentId: string;
    contributionType: 'pattern' | 'solution' | 'failure' | 'optimization';
    domain: string;
    content: {
        title: string;
        description: string;
        implementation?: string;
        metrics?: Record<string, number>;
        context: Record<string, any>;
    };
    confidence: number;
    timestamp: number;
}
export interface KnowledgeDistributionUpdate {
    updateId: string;
    type: 'fact-updated' | 'new-pattern' | 'security-alert' | 'best-practice';
    domain: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    content: any;
    affectedSwarms?: string[];
    timestamp: number;
}
/**
 * Bridges Hive FACT system with swarm coordination.
 * Enables real-time knowledge sharing and bidirectional learning.
 *
 * @example
 */
export declare class HiveKnowledgeBridge extends EventEmitter {
    private hiveFact?;
    private hiveCoordinator?;
    private memoryStore?;
    private subscribedSwarms;
    private pendingRequests;
    private contributionQueue;
    private isInitialized;
    constructor(hiveCoordinator?: HiveSwarmCoordinator, memoryStore?: SessionMemoryStore);
    /**
     * Initialize the knowledge bridge.
     */
    initialize(): Promise<void>;
    /**
     * Register a swarm with the knowledge bridge.
     *
     * @param swarmId
     * @param interests
     */
    registerSwarm(swarmId: string, interests?: string[]): Promise<void>;
    /**
     * Process knowledge request from swarm.
     *
     * @param request
     */
    processKnowledgeRequest(request: KnowledgeRequest): Promise<KnowledgeResponse>;
    /**
     * Handle knowledge query request.
     *
     * @param request
     */
    private handleKnowledgeQuery;
    /**
     * Handle knowledge contribution from swarm.
     *
     * @param request
     */
    private handleKnowledgeContribution;
    /**
     * Handle knowledge update request.
     *
     * @param request
     */
    private handleKnowledgeUpdate;
    /**
     * Handle knowledge subscription request.
     *
     * @param request
     */
    private handleKnowledgeSubscription;
    /**
     * Enhance search results with swarm-specific context.
     *
     * @param results
     * @param swarmId
     * @param agentId
     */
    private enhanceResultsWithSwarmContext;
    /**
     * Calculate relevance of fact to specific swarm.
     *
     * @param fact
     * @param swarmId
     */
    private calculateSwarmRelevance;
    /**
     * Calculate compatibility of fact with specific agent.
     *
     * @param _fact
     * @param _agentId
     */
    private calculateAgentCompatibility;
    /**
     * Find swarms related to the given swarm.
     *
     * @param _swarmId
     */
    private findRelatedSwarms;
    /**
     * Calculate average confidence of search results.
     *
     * @param results
     */
    private calculateAverageConfidence;
    /**
     * Set up event handlers for knowledge bridge.
     */
    private setupEventHandlers;
    /**
     * Start processing contribution queue.
     */
    private startContributionProcessor;
    /**
     * Process queued contributions from swarms.
     */
    private processContributionQueue;
    /**
     * Process individual swarm contribution.
     *
     * @param contribution
     */
    private processSwarmContribution;
    /**
     * Set up knowledge distribution system.
     */
    private setupKnowledgeDistribution;
    /**
     * Distribute knowledge update to relevant swarms.
     *
     * @param update
     */
    private distributeKnowledgeUpdate;
    /**
     * Find swarms interested in a specific domain.
     *
     * @param domain
     */
    private findSwarmsInterestedInDomain;
    /**
     * Get bridge statistics.
     */
    getStats(): {
        registeredSwarms: number;
        pendingRequests: number;
        queuedContributions: number;
        totalRequests: number;
        averageResponseTime: number;
    };
    /**
     * Shutdown the knowledge bridge.
     */
    shutdown(): Promise<void>;
}
export default HiveKnowledgeBridge;
//# sourceMappingURL=hive-knowledge-bridge.d.ts.map