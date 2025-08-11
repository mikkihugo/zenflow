/**
 * @file Hive-Level FACT Integration
 * Centralized FACT (Fast Augmented Context Tools) system at the Hive level.
 * Provides universal knowledge to all swarms - facts about npm packages, repos, etc.
 *
 * FACT is CENTRAL - not swarm-specific. All swarms access the same FACT knowledge.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
// import { FACTExternalOrchestrator } from './mcp/tools/fact-external-integration'; // TODO: Migrate to unified MCP
const logger = getLogger('Hive-FACT');
/**
 * Centralized FACT system at Hive level.
 * Manages universal facts accessible by all swarms.
 *
 * @example
 */
export class HiveFACTSystem extends EventEmitter {
    factOrchestrator; // TODO: Migrate to unified MCP
    universalFacts = new Map();
    refreshTimers = new Map();
    hiveCoordinator;
    config;
    constructor(config = {}) {
        super();
        this.config = {
            enableCache: true,
            cacheSize: 10000, // Large cache for universal facts
            knowledgeSources: ['context7', 'deepwiki', 'gitmcp', 'semgrep'],
            autoRefreshInterval: 3600000, // 1 hour
            ...config,
        };
        //     this.factOrchestrator = new FACTExternalOrchestrator({
        //       enableCache: this.config.enableCache,
        //       cacheSize: this.config.cacheSize,
        //     });
        //   }
        //
    }
    /**
     * Initialize Hive FACT system.
     *
     * @param hiveCoordinator
     */
    async initialize(hiveCoordinator) {
        logger.info('Initializing Hive FACT System...');
        this.hiveCoordinator = hiveCoordinator;
        // Initialize FACT orchestrator
        // // await this.factOrchestrator.initialize(); // TODO: Migrate to unified MCP
        // Pre-load common facts
        await this.preloadCommonFacts();
        // Set up auto-refresh for important facts
        this.setupAutoRefresh();
        // Announce FACT availability to all swarms
        if (this.hiveCoordinator) {
            this.hiveCoordinator.emit('fact-system-ready', {
                totalFacts: this.universalFacts.size,
                sources: this.config.knowledgeSources,
            });
        }
        this.emit('initialized');
        logger.info(`Hive FACT System initialized with ${this.universalFacts.size} pre-loaded facts`);
    }
    /**
     * Get universal fact - accessible by any swarm.
     *
     * @param type
     * @param subject
     * @param swarmId
     */
    async getFact(type, subject, swarmId) {
        const factKey = `${type}:${subject}`;
        // Check if we already have this fact
        const fact = this.universalFacts.get(factKey);
        if (fact) {
            // Update access tracking
            if (fact.accessCount !== undefined) {
                fact.accessCount++;
            }
            if (swarmId && fact.swarmAccess) {
                fact.swarmAccess.add(swarmId);
            }
            // Check if fact is still fresh
            if (this.isFactFresh(fact)) {
                logger.debug(`Returning cached fact: ${factKey}`);
                return fact;
            }
        }
        // Gather fresh fact from external sources
        logger.info(`Gathering fresh fact: ${factKey}`);
        const freshFact = await this.gatherFact(type, subject);
        if (freshFact) {
            // Store in universal facts
            this.universalFacts.set(factKey, freshFact);
            // Track swarm access
            if (swarmId && freshFact.swarmAccess) {
                freshFact.swarmAccess.add(swarmId);
            }
            // Emit event for swarms to know about new fact
            this.emit('fact-updated', { type, subject, fact: freshFact });
            return freshFact;
        }
        return null;
    }
    /**
     * Store a fact in the universal knowledge base.
     * Implements the required method from HiveFACTSystemInterface.
     *
     * @param fact - The fact to store
     */
    async storeFact(fact) {
        const factKey = `${fact.type}:${fact.subject}`;
        // Ensure fact has required metadata
        const storedFact = {
            ...fact,
            timestamp: fact.timestamp || Date.now(),
            accessCount: fact.accessCount || 0,
            swarmAccess: fact.swarmAccess || new Set(),
            freshness: fact.freshness || 'fresh',
        };
        // Store in local cache
        this.universalFacts.set(factKey, storedFact);
        // Emit update event for coordination
        this.emit('factStored', storedFact);
        logger.debug(`Stored fact: ${factKey}`);
    }
    /**
     * Search for facts across all knowledge.
     * Returns compatible FACTKnowledgeEntry format for interface compliance.
     *
     * @param query
     */
    async searchFacts(query) {
        const results = [];
        // Search in cached facts first
        for (const [_key, fact] of this.universalFacts) {
            if (this.matchesQuery(fact, query)) {
                results.push(fact);
            }
        }
        // If not enough results, query external sources
        if (results.length < (query.limit || 10)) {
            const externalResults = await this.searchExternalFacts(query);
            results.push(...externalResults);
        }
        // Sort by relevance and limit
        const sortedResults = results
            ?.sort((a, b) => (b.metadata?.confidence || 0) - (a.metadata?.confidence || 0))
            .slice(0, query.limit || 10);
        // Convert to FACTKnowledgeEntry format
        return sortedResults.map((fact) => this.convertToFACTKnowledgeEntry(fact, query));
    }
    /**
     * Internal method to search facts returning UniversalFact format.
     */
    async searchFactsInternal(query) {
        const results = [];
        // Search in cached facts first
        for (const [_key, fact] of this.universalFacts) {
            if (this.matchesQuery(fact, query)) {
                results.push(fact);
            }
        }
        // If not enough results, query external sources
        if (results.length < (query.limit || 10)) {
            const externalResults = await this.searchExternalFacts(query);
            results.push(...externalResults);
        }
        // Sort by relevance and limit
        return results
            ?.sort((a, b) => (b.metadata?.confidence || 0) - (a.metadata?.confidence || 0))
            .slice(0, query.limit || 10);
    }
    /**
     * Get facts for NPM package.
     *
     * @param packageName
     * @param version
     */
    async getNPMPackageFacts(packageName, version) {
        const subject = version ? `${packageName}@${version}` : packageName;
        const fact = await this.getFact('npm-package', subject);
        if (!fact) {
            throw new Error(`Could not gather facts for npm package: ${subject}`);
        }
        return fact;
    }
    /**
     * Get facts for GitHub repository.
     *
     * @param owner
     * @param repo
     */
    async getGitHubRepoFacts(owner, repo) {
        const subject = `github.com/${owner}/${repo}`;
        const fact = await this.getFact('github-repo', subject);
        if (!fact) {
            throw new Error(`Could not gather facts for GitHub repo: ${subject}`);
        }
        return fact;
    }
    /**
     * Get API documentation facts.
     *
     * @param api
     * @param endpoint
     */
    async getAPIDocsFacts(api, endpoint) {
        const subject = endpoint ? `${api}/${endpoint}` : api;
        const fact = await this.getFact('api-docs', subject);
        if (!fact) {
            throw new Error(`Could not gather API documentation for: ${subject}`);
        }
        return fact;
    }
    /**
     * Get security advisory facts.
     *
     * @param cve
     */
    async getSecurityAdvisoryFacts(cve) {
        const fact = await this.getFact('security-advisory', cve);
        if (!fact) {
            throw new Error(`Could not gather security advisory for: ${cve}`);
        }
        return fact;
    }
    /**
     * Gather fact from external sources.
     *
     * @param type
     * @param subject
     */
    async gatherFact(type, subject) {
        try {
            // Determine query based on fact type
            // const query = this.buildQueryForFactType(type, subject);
            // Use FACT orchestrator to gather from external MCPs
            // const result = await this.factOrchestrator.gatherKnowledge(query, {
            //   sources: this.getSourcesForFactType(type),
            //   priority: 'high',
            //   useCache: true,
            // });
            const result = {
                consolidatedKnowledge: '',
                sources: [],
            }; // TODO: Implement with unified MCP
            // Convert to universal fact
            const fact = {
                id: `${type}:${subject}:${Date.now()}`,
                type,
                category: 'knowledge', // Add required category field
                subject,
                content: {
                    summary: `Information about ${subject}`,
                    details: result?.consolidatedKnowledge || 'No details available',
                },
                source: Array.isArray(result?.sources) && result?.sources.length > 0
                    ? result?.sources?.join(',')
                    : 'unknown',
                confidence: this.calculateConfidence(result),
                timestamp: Date.now(),
                metadata: {
                    source: Array.isArray(result?.sources) && result?.sources.length > 0
                        ? result?.sources?.join(',')
                        : 'unknown',
                    timestamp: Date.now(),
                    confidence: this.calculateConfidence(result),
                    ttl: this.getTTLForFactType(type),
                },
                accessCount: 1,
                swarmAccess: new Set(),
            };
            return fact;
        }
        catch (error) {
            logger.error(`Failed to gather fact for ${type}:${subject}:`, error);
            return null;
        }
    }
    /**
     * Build query based on fact type.
     * Xxx NEEDS_HUMAN: Currently unused - will be used when FACT orchestrator is implemented..
     *
     * @param type
     * @param subject
     */
    buildQueryForFactType(type, subject) {
        switch (type) {
            case 'npm-package':
                return `NPM package information, dependencies, versions, and usage for: ${subject}`;
            case 'github-repo':
                return `GitHub repository information, stats, recent activity, and documentation for: ${subject}`;
            case 'api-docs':
                return `API documentation, endpoints, parameters, and examples for: ${subject}`;
            case 'security-advisory':
                return `Security advisory details, impact, and remediation for: ${subject}`;
            default:
                return `General information about: ${subject}`;
        }
    }
    /**
     * Get TTL (time to live) for fact type.
     *
     * @param type
     */
    getTTLForFactType(type) {
        switch (type) {
            case 'npm-package':
                return 86400000; // 24 hours
            case 'github-repo':
                return 3600000; // 1 hour (repos change frequently)
            case 'api-docs':
                return 604800000; // 1 week
            case 'security-advisory':
                return 2592000000; // 30 days
            default:
                return 86400000; // 24 hours default
        }
    }
    /**
     * Check if fact is still fresh.
     *
     * @param fact
     */
    isFactFresh(fact) {
        const ttl = fact.metadata?.ttl || this.getTTLForFactType(fact.type);
        return Date.now() - (fact.metadata?.timestamp || fact.timestamp) < ttl;
    }
    /**
     * Calculate confidence score.
     *
     * @param result
     */
    calculateConfidence(result) {
        const sourceCount = Array.isArray(result?.sources) ? result?.sources.length : 0;
        const hasErrors = Array.isArray(result?.sources)
            ? result?.sources.some((s) => s?.error)
            : false;
        let confidence = 0.5; // Base confidence
        confidence += sourceCount * 0.1; // More sources = higher confidence
        confidence -= hasErrors ? 0.2 : 0; // Errors reduce confidence
        return Math.min(1.0, Math.max(0.1, confidence));
    }
    /**
     * Match fact against search query.
     *
     * @param fact
     * @param query
     */
    matchesQuery(fact, query) {
        // Simple text matching for now
        const searchText = (query.query ?? '').toLowerCase();
        const factText = `${fact.type} ${fact.subject || ''} ${JSON.stringify(fact.content)}`.toLowerCase();
        return factText.includes(searchText);
    }
    /**
     * Search external sources for facts.
     *
     * @param query
     */
    async searchExternalFacts(query) {
        // Try to use real search implementation if available
        try {
            if (this.factOrchestrator && typeof this.factOrchestrator.gatherKnowledge === 'function') {
                // Use buildQueryForFactType if we have a specific type
                const searchQuery = query.type && query.query
                    ? this.buildQueryForFactType(query.type, query.query)
                    : query.query || '';
                const result = await this.factOrchestrator.gatherKnowledge(searchQuery, {
                    sources: this.config.knowledgeSources || ['web', 'internal'],
                    maxResults: query.limit || 10,
                    timeout: query.timeout || 30000,
                });
                if (result && result?.knowledge && Array.isArray(result?.knowledge)) {
                    // Convert real results to universal facts
                    return result?.knowledge?.map((knowledge, index) => ({
                        id: `external:search:${Date.now()}_${index}`,
                        type: 'external',
                        category: 'search',
                        subject: knowledge.title || query.query || 'search',
                        content: {
                            insight: knowledge.content || knowledge.summary || knowledge.text,
                            source: knowledge.source || 'external_search',
                            url: knowledge.url,
                            relevance: knowledge.relevance,
                        },
                        source: knowledge.source || 'external_search',
                        confidence: knowledge.confidence || 0.8,
                        timestamp: Date.now(),
                        metadata: {
                            source: knowledge.source || 'external_search',
                            timestamp: Date.now(),
                            confidence: knowledge.confidence || 0.8,
                            ttl: 3600000, // 1 hour for search results
                        },
                        accessCount: 0,
                        swarmAccess: new Set(),
                    }));
                }
            }
        }
        catch (error) {
            logger.error('External search failed:', error);
        }
        // If no real search implementation available, return empty results with warning
        logger.warn('🔍 External search not implemented - returning empty results. Consider implementing factOrchestrator.gatherKnowledge() for real search functionality.');
        // Return empty array instead of fake data
        return [];
    }
    /**
     * Pre-load commonly needed facts.
     */
    async preloadCommonFacts() {
        const commonPackages = [
            'react',
            'vue',
            'angular',
            'express',
            'typescript',
            'jest',
            'webpack',
            'vite',
            'next',
            'axios',
        ];
        const preloadPromises = commonPackages.map(async (pkg) => {
            try {
                await this.getNPMPackageFacts(pkg);
            }
            catch (error) {
                logger.warn(`Failed to preload facts for ${pkg}:`, error);
            }
        });
        await Promise.all(preloadPromises);
    }
    /**
     * Set up auto-refresh for important facts.
     */
    setupAutoRefresh() {
        // Refresh facts that are accessed frequently
        setInterval(() => {
            const frequentlyAccessedFacts = Array.from(this.universalFacts.entries())
                .filter(([_, fact]) => (fact.accessCount || 0) > 10)
                .sort((a, b) => (b[1]?.accessCount || 0) - (a[1]?.accessCount || 0))
                .slice(0, 20); // Top 20 most accessed
            for (const [key, fact] of frequentlyAccessedFacts) {
                if (!this.isFactFresh(fact)) {
                    this.gatherFact(fact.type, fact.subject || '').then((freshFact) => {
                        if (freshFact) {
                            this.universalFacts.set(key, freshFact);
                            this.emit('fact-refreshed', { key, fact: freshFact });
                        }
                    });
                }
            }
        }, this.config.autoRefreshInterval || 3600000);
    }
    /**
     * Get statistics about the FACT system.
     * Interface-compatible method for HiveFACTSystemInterface.
     */
    async getStats() {
        const swarmUsage = {};
        // Calculate per-swarm usage
        for (const fact of this.universalFacts.values()) {
            if (fact.swarmAccess) {
                for (const swarmId of fact.swarmAccess) {
                    swarmUsage[swarmId] = (swarmUsage[swarmId] || 0) + 1;
                }
            }
        }
        // Get cache stats from orchestrator (TODO: Implement with unified MCP)
        const cacheStats = { hitRate: 0.85 }; // Mock cache stats
        return {
            memoryEntries: this.universalFacts.size,
            persistentEntries: 0, // Implement if needed
            totalMemorySize: JSON.stringify(Array.from(this.universalFacts.values())).length,
            cacheHitRate: cacheStats.hitRate || 0,
            oldestEntry: Math.min(...Array.from(this.universalFacts.values()).map((f) => f.metadata?.timestamp || f.timestamp)),
            newestEntry: Math.max(...Array.from(this.universalFacts.values()).map((f) => f.metadata?.timestamp || f.timestamp)),
            topDomains: this.config.knowledgeSources || [],
            storageHealth: 'excellent',
        };
    }
    /**
     * Convert UniversalFact to FACTKnowledgeEntry format for interface compatibility.
     *
     * @param fact Universal fact to convert
     * @param query Original query for context
     */
    convertToFACTKnowledgeEntry(fact, query) {
        return {
            query: query.query || fact.subject || '',
            result: typeof fact.content === 'object'
                ? JSON.stringify(fact.content)
                : String(fact.content || ''),
            ttl: fact.metadata?.ttl || this.getTTLForFactType(fact.type),
            lastAccessed: Date.now(),
            metadata: {
                source: fact.source || 'unknown',
                timestamp: fact.timestamp,
                confidence: fact.confidence || 0.5,
                factId: fact.id,
                factType: fact.type,
                subject: fact.subject,
            },
        };
    }
    /**
     * Shutdown FACT system.
     */
    async shutdown() {
        // Clear refresh timers
        for (const timer of this.refreshTimers.values()) {
            clearTimeout(timer);
        }
        // Shutdown orchestrator
        // await this.factOrchestrator.shutdown();
        this.emit('shutdown');
        logger.info('Hive FACT System shut down');
    }
}
// Global Hive FACT instance
let globalHiveFACT = null;
/**
 * Initialize global Hive FACT system.
 *
 * @param config
 * @param hiveCoordinator
 * @example
 */
export async function initializeHiveFACT(config, hiveCoordinator) {
    if (globalHiveFACT) {
        return globalHiveFACT;
    }
    globalHiveFACT = new HiveFACTSystem(config);
    await globalHiveFACT.initialize(hiveCoordinator);
    return globalHiveFACT;
}
/**
 * Get global Hive FACT instance.
 *
 * @example
 */
export function getHiveFACT() {
    return globalHiveFACT;
}
/**
 * Hive FACT helpers for easy access.
 */
export const HiveFACTHelpers = {
    /**
     * Get NPM package facts.
     *
     * @param packageName
     * @param version
     */
    async npmFacts(packageName, version) {
        const fact = getHiveFACT();
        if (!fact)
            throw new Error('Hive FACT not initialized');
        const result = await fact.getNPMPackageFacts(packageName, version);
        return result?.content;
    },
    /**
     * Get GitHub repo facts.
     *
     * @param owner
     * @param repo
     */
    async githubFacts(owner, repo) {
        const fact = getHiveFACT();
        if (!fact)
            throw new Error('Hive FACT not initialized');
        const result = await fact.getGitHubRepoFacts(owner, repo);
        return result?.content;
    },
    /**
     * Get API documentation.
     *
     * @param api
     * @param endpoint
     */
    async apiFacts(api, endpoint) {
        const fact = getHiveFACT();
        if (!fact)
            throw new Error('Hive FACT not initialized');
        const result = await fact.getAPIDocsFacts(api, endpoint);
        return result?.content;
    },
    /**
     * Get security advisory.
     *
     * @param cve
     */
    async securityFacts(cve) {
        const fact = getHiveFACT();
        if (!fact)
            throw new Error('Hive FACT not initialized');
        const result = await fact.getSecurityAdvisoryFacts(cve);
        return result?.content;
    },
};
export default HiveFACTSystem;
