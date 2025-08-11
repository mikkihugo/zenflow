/**
 * @file Swarm Knowledge Synchronization
 * Handles knowledge synchronization between individual swarms and the Hive Knowledge Bridge.
 *
 * Features:
 * - Real-time knowledge queries to Hive FACT
 * - Contribution of learned patterns back to Hive
 * - Local knowledge caching for performance.
 * - Subscription management for domain-specific updates.
 */
import { EventEmitter } from 'node:events';
import type { KnowledgeDistributionUpdate } from '../hive-knowledge-bridge.ts';
import type { SessionMemoryStore } from '../memory/memory';
export interface SwarmKnowledgeConfig {
    swarmId: string;
    cacheSize?: number;
    cacheTTL?: number;
    autoSubscribe?: boolean;
    contributionThreshold?: number;
    maxRetries?: number;
}
export interface LocalKnowledgeEntry {
    id: string;
    query: string;
    data: any;
    metadata: {
        source: string;
        timestamp: number;
        confidence: number;
        accessCount: number;
        lastAccessed: number;
    };
    ttl: number;
}
export interface SwarmLearning {
    id: string;
    type: 'pattern' | 'solution' | 'failure' | 'optimization';
    domain: string;
    context: {
        taskType: string;
        agentTypes: string[];
        inputSize: number;
        complexity: 'low' | 'medium' | 'high';
    };
    outcome: {
        success: boolean;
        duration: number;
        quality: number;
        efficiency: number;
        userSatisfaction?: number;
    };
    insights: {
        whatWorked: string[];
        whatFailed: string[];
        optimizations: string[];
        bestPractices: string[];
    };
    confidence: number;
    timestamp: number;
}
/**
 * Manages knowledge synchronization for an individual swarm.
 *
 * @example
 */
export declare class SwarmKnowledgeSync extends EventEmitter {
    private config;
    private localCache;
    private subscriptions;
    private memoryStore;
    private learningHistory;
    private isInitialized;
    private retryCount;
    constructor(config: SwarmKnowledgeConfig, memoryStore?: SessionMemoryStore);
    /**
     * Initialize knowledge sync system.
     */
    initialize(): Promise<void>;
    /**
     * Query knowledge from Hive FACT system.
     *
     * @param query
     * @param domain
     * @param agentId
     * @param options
     * @param options.useCache
     * @param options.priority
     * @param options.filters
     */
    queryKnowledge(query: string, domain?: string, agentId?: string, options?: {
        useCache?: boolean;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        filters?: Record<string, any>;
    }): Promise<any>;
    /**
     * Contribute learned knowledge back to Hive.
     *
     * @param learning
     * @param agentId
     */
    contributeKnowledge(learning: Omit<SwarmLearning, 'id' | 'timestamp'>, agentId: string): Promise<boolean>;
    /**
     * Subscribe to knowledge updates for specific domain.
     *
     * @param domain
     */
    subscribeToDomain(domain: string): Promise<boolean>;
    /**
     * Handle incoming knowledge update from Hive.
     *
     * @param update
     */
    handleKnowledgeUpdate(update: KnowledgeDistributionUpdate): Promise<void>;
    /**
     * Get swarm knowledge statistics.
     */
    getStats(): {
        cacheSize: number;
        cacheHitRate: number;
        subscriptions: number;
        learningHistory: number;
        successfulQueries: number;
        contributions: number;
    };
    /**
     * Clear local cache.
     */
    clearCache(): void;
    /**
     * Shutdown knowledge sync.
     */
    shutdown(): Promise<void>;
    private getCachedKnowledge;
    private cacheKnowledge;
    private evictOldestCacheEntry;
    private sendKnowledgeRequest;
    private trackQuerySuccess;
    private getFallbackKnowledge;
    private generateContributionDescription;
    private extractImplementationDetails;
    private extractMetrics;
    private loadPersistedKnowledge;
    private loadLearningHistory;
    private persistCurrentState;
    private persistLearningHistory;
    private persistSubscriptions;
    private autoSubscribeToDomains;
    private startCacheCleanup;
    private cleanupExpiredCache;
    private invalidateCacheForDomain;
    private handleFactUpdate;
    private handleNewPattern;
    private handleSecurityAlert;
    private handleBestPractice;
    private calculateCacheHitRate;
    private generateRequestId;
    private generateEntryId;
    private generateLearningId;
}
export default SwarmKnowledgeSync;
//# sourceMappingURL=knowledge-sync.d.ts.map