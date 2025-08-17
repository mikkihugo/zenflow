/**
 * @fileoverview Collective-Level FACT Integration System
 *
 * Centralized FACT (Federated Agent Context Technology) system at THE COLLECTIVE level.
 * Provides universal knowledge access to all hierarchy levels - facts about npm packages,
 * repositories, security advisories, and implementation patterns. This system implements
 * the "manuals of the internet" concept where all knowledge is shared universally.
 *
 * ## FACT System Architecture
 *
 * The FACT system operates as a **centralized knowledge hub**:
 * ```
 * External Knowledge Sources
 *     ↓
 * Collective FACT Integration ← THIS MODULE
 *     ↓
 * Universal Knowledge Database
 *     ↓
 * All Hierarchy Levels (Equal Access)
 * ```
 *
 * ## Key Principles
 *
 * ### Universal Access
 * - **No Hierarchy Restrictions**: All levels access the same knowledge base
 * - **Real-time Synchronization**: Updates propagate instantly across all levels
 * - **Shared Intelligence**: Knowledge learned by one level benefits all levels
 * - **Democratic Knowledge**: No privileged access based on hierarchy position
 *
 * ### Knowledge Integration
 * - **Multi-Source Aggregation**: Combines data from diverse external sources
 * - **Intelligent Deduplication**: Merges similar facts from different sources
 * - **Quality Scoring**: Confidence ratings for fact reliability
 * - **Freshness Tracking**: Automatic refresh cycles for outdated information
 *
 * ## External Knowledge Sources
 *
 * The FACT system integrates with multiple external knowledge providers:
 * - **NPM Registry**: Package information, dependencies, security status
 * - **GitHub API**: Repository metadata, issues, pull requests, releases
 * - **Security Advisories**: CVE databases, vulnerability information
 * - **Documentation Sources**: API docs, implementation guides, best practices
 * - **Code Pattern Databases**: Common patterns, anti-patterns, solutions
 *
 * ## Knowledge Categories
 *
 * ### Package Information (`npm-package`)
 * - Dependency trees and compatibility matrices
 * - Security vulnerability assessments
 * - Performance benchmarks and recommendations
 * - Usage statistics and popularity metrics
 *
 * ### Repository Intelligence (`github-repo`)
 * - Codebase structure and architecture patterns
 * - Development activity and maintenance status
 * - Issue patterns and resolution strategies
 * - Community health and contribution guidelines
 *
 * ### Security Context (`security-advisory`)
 * - Vulnerability databases and impact assessments
 * - Mitigation strategies and patch availability
 * - Security best practices and compliance requirements
 * - Threat intelligence and attack pattern recognition
 *
 * ### Implementation Guidance (`api-docs`)
 * - API documentation and usage examples
 * - Implementation patterns and best practices
 * - Performance optimization techniques
 * - Integration guides and troubleshooting
 *
 * ## Data Flow Architecture
 *
 * ```
 * External Sources ─────────┬─── Knowledge Ingestion
 *  ├─ NPM Registry           │
 *  ├─ GitHub API             │
 *  ├─ Security DBs           │
 *  └─ Documentation APIs     │
 *                             │
 * Collective FACT System ────┼─── Processing & Storage
 *  ├─ Knowledge Aggregation  │
 *  ├─ Quality Assessment     │
 *  ├─ Deduplication Logic    │
 *  └─ Freshness Management   │
 *                             │
 * Universal Database ──────┼─── Shared Knowledge Store
 *  ├─ SQLite: Structured     │
 *  ├─ LanceDB: Vectors       │
 *  └─ Kuzu: Relationships    │
 *                             │
 * All Hierarchy Levels ────┼─── Universal Access
 * ```
 *
 * ## Performance Characteristics
 *
 * - **Query Response**: <100ms for cached facts, <2s for fresh queries
 * - **Cache Hit Rate**: >95% for frequently accessed package/repo information
 * - **Concurrent Access**: Supports 1000+ simultaneous queries across hierarchy
 * - **Storage Efficiency**: Intelligent compression and deduplication
 *
 * ## Usage Examples
 *
 * ### Package Information Retrieval
 * ```typescript
 * const factSystem = await getCollectiveFACT();
 *
 * // Get comprehensive package information
 * const reactInfo = await factSystem.getFact('npm:react', {
 *   includeSecurityStatus: true,
 *   includeDependencyTree: true,
 *   includeUsageStats: true
 * });
 *
 * console.log(`React security status: ${reactInfo.securityStatus}`);
 * console.log(`Dependencies: ${reactInfo.dependencies.length}`);
 * ```
 *
 * ### Repository Intelligence
 * ```typescript
 * // Get repository insights
 * const repoFacts = await factSystem.searchFacts({
 *   query: 'facebook/react',
 *   type: 'github-repo',
 *   includeAnalytics: true
 * });
 *
 * const insights = repoFacts[0];
 * console.log(`Activity level: ${insights.activityLevel}`);
 * console.log(`Maintenance status: ${insights.maintenanceStatus}`);
 * ```
 *
 * ### Security Advisory Lookup
 * ```typescript
 * // Check for security issues
 * const securityFacts = await factSystem.searchFacts({
 *   query: 'lodash vulnerabilities',
 *   type: 'security-advisory',
 *   severityThreshold: 'medium'
 * });
 *
 * for (const advisory of securityFacts) {
 *   console.log(`CVE: ${advisory.cveId}, Severity: ${advisory.severity}`);
 * }
 * ```
 *
 * ## Integration with THE COLLECTIVE
 *
 * The FACT system is designed for seamless integration across all hierarchy levels:
 * - **Automatic Initialization**: Self-configuring based on available resources
 * - **Error Resilience**: Graceful degradation when external sources are unavailable
 * - **Cache Management**: Intelligent cache warming and invalidation
 * - **Performance Monitoring**: Real-time metrics and health monitoring
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 *
 * @see {@link SharedFACTSystem} For hierarchy-level access patterns
 * @see {@link CollectiveFACTSystem} For core system implementation
 * @see {@link FACTKnowledgeEntry} For knowledge entry structure
 * @see {@link DatabaseProviderFactory} For persistence layer
 *
 * @module CollectiveFACTIntegration
 * @namespace TheCollective.FACT
 */
import { EventEmitter } from 'node:events';
import type { FACTKnowledgeEntry, FACTSearchQuery, FACTStorageStats } from '../knowledge/types/fact-types';
import type { CollectiveSwarmCoordinatorInterface } from './shared-types';
type CollectiveSwarmCoordinator = CollectiveSwarmCoordinatorInterface;
import type { CollectiveFACTConfig, UniversalFact } from './collective-types';
/**
 * Centralized FACT system at Collective level.
 * Manages universal facts accessible by all swarms.
 *
 * @example
 */
export declare class CollectiveFACTSystem extends EventEmitter {
    private factOrchestrator?;
    private universalFacts;
    private refreshTimers;
    private collectiveCoordinator;
    private config;
    constructor(config?: CollectiveFACTConfig);
    /**
     * Initialize Collective FACT system.
     *
     * @param collectiveCoordinator
     */
    initialize(collectiveCoordinator?: CollectiveSwarmCoordinator): Promise<void>;
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
     * Gather fact from external sources - RUST WASM POWERED MPLEMENTATION.
     * Uses high-performance Rust WASM external API integration.
     *
     * @param type
     * @param subject
     */
    private gatherFact;
    /**
     * Fallback TypeScript implementation for when WASM external API fails.
     *
     * @param type
     * @param subject
     */
    private gatherFactFallback;
    /**
     * Fetch real NPM package information from NPM registry.
     */
    private fetchNPMPackage;
    /**
     * Fetch NPM download statistics.
     */
    private fetchNPMDownloads;
    /**
     * Fetch real GitHub repository information.
     */
    private fetchGitHubRepo;
    /**
     * Fetch GitHub repository languages.
     */
    private fetchGitHubLanguages;
    /**
     * Fetch GitHub repository releases.
     */
    private fetchGitHubReleases;
    /**
     * Fetch API documentation information.
     */
    private fetchAPIDocumentation;
    /**
     * Fetch security advisory information.
     */
    private fetchSecurityAdvisory;
    /**
     * Build query based on fact type.
     * Used by external search implementation for enhanced queries.
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
    /**
     * Get NPM package facts via MCP interface.
     *
     * @param packageName - NPM package name
     * @param version - Optional version
     */
    npmFacts(packageName: string, version?: string): Promise<unknown>;
    /**
     * Get GitHub repository facts via MCP interface.
     * Uses the Rust GraphQL client for efficient repository analysis.
     *
     * @param owner - Repository owner
     * @param repo - Repository name
     */
    githubFacts(owner: string, repo: string): Promise<unknown>;
}
/**
 * Initialize global Collective FACT system.
 *
 * @param config
 * @param collectiveCoordinator
 * @example
 */
export declare function initializeCollectiveFACT(config?: CollectiveFACTConfig, collectiveCoordinator?: CollectiveSwarmCoordinator): Promise<CollectiveFACTSystem>;
/**
 * Get global Collective FACT instance.
 *
 * @example
 */
export declare function getCollectiveFACT(): CollectiveFACTSystem | null;
/**
 * Collective FACT helpers for easy access.
 */
export declare const CollectiveFACTHelpers: {
    /**
     * Get NPM package facts.
     *
     * @param packageName
     * @param version
     */
    npmFacts(packageName: string, version?: string): Promise<unknown>;
    /**
     * Get GitHub repo facts.
     *
     * @param owner
     * @param repo
     */
    githubFacts(owner: string, repo: string): Promise<unknown>;
    /**
     * Get API documentation.
     *
     * @param api
     * @param endpoint
     */
    apiFacts(api: string, endpoint?: string): Promise<unknown>;
    /**
     * Get security advisory.
     *
     * @param cve
     */
    securityFacts(cve: string): Promise<unknown>;
};
export type { UniversalFact } from './collective-types';
export default CollectiveFACTSystem;
//# sourceMappingURL=collective-fact-integration.d.ts.map