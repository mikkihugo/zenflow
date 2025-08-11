/**
 * @file Hive-Level FACT Integration
 * Centralized FACT (Fast Augmented Context Tools) system at the Hive level.
 * Provides universal knowledge to all swarms - facts about npm packages, repos, etc.
 *
 * FACT is CENTRAL - not swarm-specific. All swarms access the same FACT knowledge.
 */
import { EventEmitter } from 'node:events';
import type { FACTKnowledgeEntry, FACTSearchQuery, FACTStorageStats } from '../knowledge/types/fact-types.ts';
import type { HiveSwarmCoordinatorInterface } from './shared-types.ts';
type HiveSwarmCoordinator = HiveSwarmCoordinatorInterface;
import type { HiveFACTConfig, UniversalFact } from './hive-types.ts';
/**
 * Centralized FACT system at Hive level.
 * Manages universal facts accessible by all swarms.
 *
 * @example
 */
export declare class HiveFACTSystem extends EventEmitter {
    private factOrchestrator?;
    private universalFacts;
    private refreshTimers;
    private hiveCoordinator;
    private config;
    constructor(config?: HiveFACTConfig);
    /**
     * Initialize Hive FACT system.
     *
     * @param hiveCoordinator
     */
    initialize(hiveCoordinator?: HiveSwarmCoordinator): Promise<void>;
    /**
     * Get universal fact - accessible by any swarm.
     *
     * @param type
     * @param subject
     * @param swarmId
     */
    getFact(type: UniversalFact['type'], subject: string, swarmId?: string): Promise<UniversalFact | null>;
    /**
     * Store a fact in the universal knowledge base.
     * Implements the required method from HiveFACTSystemInterface.
     *
     * @param fact - The fact to store
     */
    storeFact(fact: UniversalFact): Promise<void>;
    /**
     * Search for facts across all knowledge.
     * Returns compatible FACTKnowledgeEntry format for interface compliance.
     *
     * @param query
     */
    searchFacts(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
    /**
     * Internal method to search facts returning UniversalFact format.
     */
    searchFactsInternal(query: FACTSearchQuery): Promise<UniversalFact[]>;
    /**
     * Get facts for NPM package.
     *
     * @param packageName
     * @param version
     */
    getNPMPackageFacts(packageName: string, version?: string): Promise<UniversalFact>;
    /**
     * Get facts for GitHub repository.
     *
     * @param owner
     * @param repo
     */
    getGitHubRepoFacts(owner: string, repo: string): Promise<UniversalFact>;
    /**
     * Get API documentation facts.
     *
     * @param api
     * @param endpoint
     */
    getAPIDocsFacts(api: string, endpoint?: string): Promise<UniversalFact>;
    /**
     * Get security advisory facts.
     *
     * @param cve
     */
    getSecurityAdvisoryFacts(cve: string): Promise<UniversalFact>;
    /**
     * Gather fact from external sources.
     *
     * @param type
     * @param subject
     */
    private gatherFact;
    /**
     * Build query based on fact type.
     * Xxx NEEDS_HUMAN: Currently unused - will be used when FACT orchestrator is implemented..
     *
     * @param type
     * @param subject
     */
    private buildQueryForFactType;
    /**
     * Get TTL (time to live) for fact type.
     *
     * @param type
     */
    private getTTLForFactType;
    /**
     * Check if fact is still fresh.
     *
     * @param fact
     */
    private isFactFresh;
    /**
     * Calculate confidence score.
     *
     * @param result
     */
    private calculateConfidence;
    /**
     * Match fact against search query.
     *
     * @param fact
     * @param query
     */
    private matchesQuery;
    /**
     * Search external sources for facts.
     *
     * @param query
     */
    private searchExternalFacts;
    /**
     * Pre-load commonly needed facts.
     */
    private preloadCommonFacts;
    /**
     * Set up auto-refresh for important facts.
     */
    private setupAutoRefresh;
    /**
     * Get statistics about the FACT system.
     * Interface-compatible method for HiveFACTSystemInterface.
     */
    getStats(): Promise<FACTStorageStats>;
    /**
     * Convert UniversalFact to FACTKnowledgeEntry format for interface compatibility.
     *
     * @param fact Universal fact to convert
     * @param query Original query for context
     */
    private convertToFACTKnowledgeEntry;
    /**
     * Shutdown FACT system.
     */
    shutdown(): Promise<void>;
}
/**
 * Initialize global Hive FACT system.
 *
 * @param config
 * @param hiveCoordinator
 * @example
 */
export declare function initializeHiveFACT(config?: HiveFACTConfig, hiveCoordinator?: HiveSwarmCoordinator): Promise<HiveFACTSystem>;
/**
 * Get global Hive FACT instance.
 *
 * @example
 */
export declare function getHiveFACT(): HiveFACTSystem | null;
/**
 * Hive FACT helpers for easy access.
 */
export declare const HiveFACTHelpers: {
    /**
     * Get NPM package facts.
     *
     * @param packageName
     * @param version
     */
    npmFacts(packageName: string, version?: string): Promise<any>;
    /**
     * Get GitHub repo facts.
     *
     * @param owner
     * @param repo
     */
    githubFacts(owner: string, repo: string): Promise<any>;
    /**
     * Get API documentation.
     *
     * @param api
     * @param endpoint
     */
    apiFacts(api: string, endpoint?: string): Promise<any>;
    /**
     * Get security advisory.
     *
     * @param cve
     */
    securityFacts(cve: string): Promise<any>;
};
export type { UniversalFact } from './hive-types.ts';
export default HiveFACTSystem;
//# sourceMappingURL=hive-fact-integration.d.ts.map