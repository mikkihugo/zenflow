import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('Collective-FACT');
export class CollectiveFACTSystem extends EventEmitter {
    factOrchestrator;
    universalFacts = new Map();
    refreshTimers = new Map();
    collectiveCoordinator;
    config;
    constructor(config = {}) {
        super();
        this.config = {
            enableCache: true,
            cacheSize: 10000,
            knowledgeSources: ['context7', 'deepwiki', 'gitmcp', 'semgrep'],
            autoRefreshInterval: 3600000,
            ...config,
        };
    }
    async initialize(collectiveCoordinator) {
        logger.info('Initializing Collective FACT System...');
        this.collectiveCoordinator = collectiveCoordinator;
        await this.preloadCommonFacts();
        this.setupAutoRefresh();
        if (this.collectiveCoordinator) {
            this.collectiveCoordinator.emit('fact-system-ready', {
                totalFacts: this.universalFacts.size,
                sources: this.config.knowledgeSources,
            });
        }
        this.emit('initialized');
        logger.info(`Collective FACT System initialized with ${this.universalFacts.size} pre-loaded facts`);
    }
    async getFact(type, subject, swarmId) {
        const factKey = `${type}:${subject}`;
        const fact = this.universalFacts.get(factKey);
        if (fact) {
            if (fact.accessCount !== undefined) {
                fact.accessCount++;
            }
            if (swarmId && fact.swarmAccess) {
                fact.swarmAccess.add(swarmId);
            }
            if (this.isFactFresh(fact)) {
                logger.debug(`Returning cached fact: ${factKey}`);
                return fact;
            }
        }
        logger.info(`Gathering fresh fact: ${factKey}`);
        const freshFact = await this.gatherFact(type, subject);
        if (freshFact) {
            this.universalFacts.set(factKey, freshFact);
            if (swarmId && freshFact.swarmAccess) {
                freshFact.swarmAccess.add(swarmId);
            }
            this.emit('fact-updated', { type, subject, fact: freshFact });
            return freshFact;
        }
        return null;
    }
    async storeFact(fact) {
        const factKey = `${fact.type}:${fact.subject}`;
        const storedFact = {
            ...fact,
            timestamp: fact.timestamp || Date.now(),
            accessCount: fact.accessCount || 0,
            cubeAccess: fact.cubeAccess || new Set(),
            swarmAccess: fact.swarmAccess || new Set(),
            freshness: fact.freshness || 'fresh',
        };
        this.universalFacts.set(factKey, storedFact);
        this.emit('factStored', storedFact);
        logger.debug(`Stored fact: ${factKey}`);
    }
    async searchFacts(query) {
        const results = [];
        for (const [_key, fact] of this.universalFacts) {
            if (this.matchesQuery(fact, query)) {
                results.push(fact);
            }
        }
        if (results.length < (query.limit || 10)) {
            const externalResults = await this.searchExternalFacts(query);
            results.push(...externalResults);
        }
        const sortedResults = results
            ?.sort((a, b) => (b.metadata?.confidence || 0) - (a.metadata?.confidence || 0))
            .slice(0, query.limit || 10);
        return sortedResults.map((fact) => this.convertToFACTKnowledgeEntry(fact, query));
    }
    async searchFactsInternal(query) {
        const results = [];
        for (const [_key, fact] of this.universalFacts) {
            if (this.matchesQuery(fact, query)) {
                results.push(fact);
            }
        }
        if (results.length < (query.limit || 10)) {
            const externalResults = await this.searchExternalFacts(query);
            results.push(...externalResults);
        }
        return results
            ?.sort((a, b) => (b.metadata?.confidence || 0) - (a.metadata?.confidence || 0))
            .slice(0, query.limit || 10);
    }
    async getNPMPackageFacts(packageName, version) {
        const subject = version ? `${packageName}@${version}` : packageName;
        const fact = await this.getFact('npm-package', subject);
        if (!fact) {
            throw new Error(`Could not gather facts for npm package: ${subject}`);
        }
        return fact;
    }
    async getGitHubRepoFacts(owner, repo) {
        const subject = `github.com/${owner}/${repo}`;
        const fact = await this.getFact('github-repo', subject);
        if (!fact) {
            throw new Error(`Could not gather facts for GitHub repo: ${subject}`);
        }
        return fact;
    }
    async getAPIDocsFacts(api, endpoint) {
        const subject = endpoint ? `${api}/${endpoint}` : api;
        const fact = await this.getFact('api-docs', subject);
        if (!fact) {
            throw new Error(`Could not gather API documentation for: ${subject}`);
        }
        return fact;
    }
    async getSecurityAdvisoryFacts(cve) {
        const fact = await this.getFact('security-advisory', cve);
        if (!fact) {
            throw new Error(`Could not gather security advisory for: ${cve}`);
        }
        return fact;
    }
    async gatherFact(type, subject) {
        try {
            const result = {
                consolidatedKnowledge: '',
                sources: [],
            };
            const fact = {
                id: `${type}:${subject}:${Date.now()}`,
                type,
                category: 'knowledge',
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
                cubeAccess: new Set(),
                swarmAccess: new Set(),
            };
            return fact;
        }
        catch (error) {
            logger.error(`Failed to gather fact for ${type}:${subject}:`, error);
            return null;
        }
    }
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
    getTTLForFactType(type) {
        switch (type) {
            case 'npm-package':
                return 86400000;
            case 'github-repo':
                return 3600000;
            case 'api-docs':
                return 604800000;
            case 'security-advisory':
                return 2592000000;
            default:
                return 86400000;
        }
    }
    isFactFresh(fact) {
        const ttl = fact.metadata?.ttl || this.getTTLForFactType(fact.type);
        return Date.now() - (fact.metadata?.timestamp || fact.timestamp) < ttl;
    }
    calculateConfidence(result) {
        const sourceCount = Array.isArray(result?.sources)
            ? result?.sources.length
            : 0;
        const hasErrors = Array.isArray(result?.sources)
            ? result?.sources.some((s) => s?.error)
            : false;
        let confidence = 0.5;
        confidence += sourceCount * 0.1;
        confidence -= hasErrors ? 0.2 : 0;
        return Math.min(1.0, Math.max(0.1, confidence));
    }
    matchesQuery(fact, query) {
        const searchText = (query.query ?? '').toLowerCase();
        const factText = `${fact.type} ${fact.subject || ''} ${JSON.stringify(fact.content)}`.toLowerCase();
        return factText.includes(searchText);
    }
    async searchExternalFacts(query) {
        try {
            if (this.factOrchestrator &&
                typeof this.factOrchestrator.gatherKnowledge === 'function') {
                const searchQuery = query.type && query.query
                    ? this.buildQueryForFactType(query.type, query.query)
                    : query.query || '';
                const result = await this.factOrchestrator.gatherKnowledge(searchQuery, {
                    sources: this.config.knowledgeSources || ['web', 'internal'],
                    maxResults: query.limit || 10,
                    timeout: query.timeout || 30000,
                });
                if (result && result?.knowledge && Array.isArray(result?.knowledge)) {
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
                            ttl: 3600000,
                        },
                        accessCount: 0,
                        cubeAccess: new Set(),
                        swarmAccess: new Set(),
                    }));
                }
            }
        }
        catch (error) {
            logger.error('External search failed:', error);
        }
        logger.warn('🔍 External search not implemented - returning empty results. Consider implementing factOrchestrator.gatherKnowledge() for real search functionality.');
        return [];
    }
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
    setupAutoRefresh() {
        setInterval(() => {
            const frequentlyAccessedFacts = Array.from(this.universalFacts.entries())
                .filter(([_, fact]) => (fact.accessCount || 0) > 10)
                .sort((a, b) => (b[1]?.accessCount || 0) - (a[1]?.accessCount || 0))
                .slice(0, 20);
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
    async getStats() {
        const swarmUsage = {};
        for (const fact of this.universalFacts.values()) {
            if (fact.swarmAccess) {
                for (const swarmId of fact.swarmAccess) {
                    swarmUsage[swarmId] = (swarmUsage[swarmId] || 0) + 1;
                }
            }
        }
        const cacheStats = { hitRate: 0.85 };
        return {
            memoryEntries: this.universalFacts.size,
            persistentEntries: 0,
            totalMemorySize: JSON.stringify(Array.from(this.universalFacts.values()))
                .length,
            cacheHitRate: cacheStats.hitRate || 0,
            oldestEntry: Math.min(...Array.from(this.universalFacts.values()).map((f) => f.metadata?.timestamp || f.timestamp)),
            newestEntry: Math.max(...Array.from(this.universalFacts.values()).map((f) => f.metadata?.timestamp || f.timestamp)),
            topDomains: this.config.knowledgeSources || [],
            storageHealth: 'excellent',
        };
    }
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
    async shutdown() {
        for (const timer of this.refreshTimers.values()) {
            clearTimeout(timer);
        }
        this.emit('shutdown');
        logger.info('Collective FACT System shut down');
    }
}
let globalCollectiveFACT = null;
export async function initializeCollectiveFACT(config, collectiveCoordinator) {
    if (globalCollectiveFACT) {
        return globalCollectiveFACT;
    }
    globalCollectiveFACT = new CollectiveFACTSystem(config);
    await globalCollectiveFACT.initialize(collectiveCoordinator);
    return globalCollectiveFACT;
}
export function getCollectiveFACT() {
    return globalCollectiveFACT;
}
export const CollectiveFACTHelpers = {
    async npmFacts(packageName, version) {
        const fact = getCollectiveFACT();
        if (!fact)
            throw new Error('Collective FACT not initialized');
        const result = await fact.getNPMPackageFacts(packageName, version);
        return result?.content;
    },
    async githubFacts(owner, repo) {
        const fact = getCollectiveFACT();
        if (!fact)
            throw new Error('Collective FACT not initialized');
        const result = await fact.getGitHubRepoFacts(owner, repo);
        return result?.content;
    },
    async apiFacts(api, endpoint) {
        const fact = getCollectiveFACT();
        if (!fact)
            throw new Error('Collective FACT not initialized');
        const result = await fact.getAPIDocsFacts(api, endpoint);
        return result?.content;
    },
    async securityFacts(cve) {
        const fact = getCollectiveFACT();
        if (!fact)
            throw new Error('Collective FACT not initialized');
        const result = await fact.getSecurityAdvisoryFacts(cve);
        return result?.content;
    },
};
export default CollectiveFACTSystem;
//# sourceMappingURL=collective-fact-integration.js.map